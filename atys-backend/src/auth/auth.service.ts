import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcryptjs';
import { createHash, randomBytes } from 'node:crypto';

import { PrismaService } from '../prisma/prisma.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';

const REFRESH_TOKEN_TTL_DAYS = 30;
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const email = dto.email?.trim().toLowerCase() || null;
    const phone = dto.phone ? this.normalizePhone(dto.phone) : null;

    if (!email && !phone) {
      throw new BadRequestException(
        'Provide an email address or phone number.',
      );
    }

    try {
      const user = await this.prisma.user.create({
        data: {
          fullName: dto.fullName.trim(),
          email,
          phone,
          passwordHash: await hash(dto.password, 12),
        },
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
        },
      });

      return this.createSession(user);
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'An account with this email address or phone number already exists.',
        );
      }

      throw error;
    }
  }

  async login(dto: LoginDto) {
    const identifier = dto.identifier.trim();
    const isEmail = identifier.includes('@');

    const user = isEmail
      ? await this.prisma.user.findUnique({
          where: { email: identifier.toLowerCase() },
        })
      : await this.prisma.user.findUnique({
          where: { phone: this.normalizePhone(identifier) },
        });

    if (!user || !(await compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid email/phone or password.');
    }

    if (!user.isActive) {
      throw new ForbiddenException('This account is currently inactive.');
    }

    return this.createSession({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
    });
  }

  async refresh(refreshToken: string) {
    const oldTokenHash = this.hashRefreshToken(refreshToken);
    const now = new Date();

    const session = await this.prisma.refreshSession.findUnique({
      where: {
        tokenHash: oldTokenHash,
      },
      include: {
        user: true,
      },
    });

    if (!session || session.expiresAt <= now || !session.user.isActive) {
      if (session) {
        await this.prisma.refreshSession.deleteMany({
          where: { id: session.id },
        });
      }

      throw new UnauthorizedException(
        'Refresh token is invalid or expired. Please log in again.',
      );
    }

    const newRefreshToken = this.generateRefreshToken();
    const newTokenHash = this.hashRefreshToken(newRefreshToken);
    const newExpiry = this.getRefreshTokenExpiry();

    // Generate the access token before rotating the database session.
    const accessToken = await this.createAccessToken(session.user.id);

    // Conditional update ensures only one concurrent refresh can succeed.
    const rotation = await this.prisma.refreshSession.updateMany({
      where: {
        id: session.id,
        tokenHash: oldTokenHash,
        expiresAt: {
          gt: now,
        },
      },
      data: {
        tokenHash: newTokenHash,
        expiresAt: newExpiry,
      },
    });

    if (rotation.count !== 1) {
      throw new UnauthorizedException(
        'Refresh token has already been used. Please log in again.',
      );
    }

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(refreshToken: string) {
    const tokenHash = this.hashRefreshToken(refreshToken);

    await this.prisma.refreshSession.deleteMany({
      where: {
        tokenHash,
      },
    });

    return {
      success: true,
      message: 'Session logged out successfully.',
    };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        isActive: true,
        createdAt: true,
        providerProfile: {
          select: {
            status: true,
            isAvailable: true,
          },
        },
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User account is unavailable.');
    }

    const { isActive, ...profile } = user;
    return profile;
  }

  private async createSession(user: {
    id: string;
    fullName: string;
    email: string | null;
    phone: string | null;
  }) {
    const accessToken = await this.createAccessToken(user.id);

    const refreshToken = this.generateRefreshToken();
    const tokenHash = this.hashRefreshToken(refreshToken);

    await this.prisma.refreshSession.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: this.getRefreshTokenExpiry(),
      },
    });

    return {
      accessToken,
      refreshToken,
      user,
    };
  }

  private async createAccessToken(userId: string): Promise<string> {
    return this.jwtService.signAsync({
      sub: userId,
    });
  }

  private generateRefreshToken(): string {
    return randomBytes(32).toString('base64url');
  }

  private hashRefreshToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private getRefreshTokenExpiry(): Date {
    return new Date(Date.now() + REFRESH_TOKEN_TTL_DAYS * MILLISECONDS_PER_DAY);
  }

  private normalizePhone(phone: string): string {
    return phone.replace(/[\s()-]/g, '');
  }
}

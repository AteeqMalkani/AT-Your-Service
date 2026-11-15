import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { AccountRole } from '../../generated/prisma/client.js';
import type { AuthenticatedUser } from './jwt-auth.guard.js';

interface RequestWithUser {
  user?: AuthenticatedUser;
}

const ADMIN_ACCESS_DENIED = "You don't have administrator access.";

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const userId = request.user?.userId;

    // JwtAuthGuard must have run first. If it didn't, fail closed.
    if (!userId) {
      throw new UnauthorizedException('Authentication token is required.');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, isActive: true },
    });

    if (!user || !user.isActive || user.role !== AccountRole.ADMIN) {
      throw new ForbiddenException(ADMIN_ACCESS_DENIED);
    }

    return true;
  }
}

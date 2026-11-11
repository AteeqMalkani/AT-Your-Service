import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

export interface AuthenticatedUser {
  userId: string;
}

interface RequestWithUser {
  headers: {
    authorization?: string;
  };
  user?: AuthenticatedUser;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request =
      context.switchToHttp().getRequest<RequestWithUser>();

    const authorization = request.headers.authorization;
    const [scheme, token] = authorization?.split(" ") ?? [];

    if (scheme?.toLowerCase() !== "bearer" || !token) {
      throw new UnauthorizedException("Authentication token is required.");
    }

    try {
      const payload = await this.jwtService.verifyAsync<{ sub: string }>(token);

      if (!payload.sub) {
        throw new UnauthorizedException("Invalid authentication token.");
      }

      request.user = { userId: payload.sub };
      return true;
    } catch {
      throw new UnauthorizedException(
        "Invalid or expired authentication token.",
      );
    }
  }
}

import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ImpersonationService } from '../services/impersonation.service';

@Injectable()
export class ImpersonationOptionalGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly impersonationService: ImpersonationService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      // No token provided, continue with normal authentication
      return true;
    }

    try {
      // Try to validate the impersonation token
      const validationResult = await this.impersonationService.validateImpersonationToken(token);
      
      if (validationResult.isValid) {
        // Add impersonation info to request
        request.user = {
          sub: validationResult.targetUserId,
          role: validationResult.role,
          originalUserId: validationResult.originalUserId,
          isImpersonation: true,
          sessionId: validationResult.sessionId,
          expiresAt: validationResult.expiresAt,
        };

        request.impersonation = {
          targetUser: validationResult.targetUser,
          originalUserId: validationResult.originalUserId,
          sessionId: validationResult.sessionId,
          expiresAt: validationResult.expiresAt,
        };
      }
    } catch (error) {
      // Token is invalid, but we don't throw error in optional guard
      // Just continue with normal authentication
    }

    return true;
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}

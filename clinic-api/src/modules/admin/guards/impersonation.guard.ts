import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ImpersonationService } from '../services/impersonation.service';

@Injectable()
export class ImpersonationGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly impersonationService: ImpersonationService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('No impersonation token provided');
    }

    try {
      // Validate the impersonation token
      const validationResult = await this.impersonationService.validateImpersonationToken(token);
      
      if (!validationResult.isValid) {
        throw new UnauthorizedException('Invalid impersonation token');
      }

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

      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired impersonation token');
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}

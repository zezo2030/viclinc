import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    
    // السماح لـ OPTIONS requests (CORS preflight) بالمرور
    if (request.method === 'OPTIONS') {
      return true;
    }
    
    // التحقق من وجود Authorization header
    const authHeader = request.headers.authorization || request.headers.Authorization;
    
    if (!authHeader) {
      console.error('[JwtAuthGuard] Authorization header missing', {
        method: request.method,
        path: request.path,
        headers: Object.keys(request.headers),
      });
      throw new UnauthorizedException('Token not found');
    }
    
    const token = this.extractTokenFromHeader(request);
    
    if (!token) {
      console.error('[JwtAuthGuard] Token extraction failed', {
        authHeader: authHeader?.substring(0, 20) + '...',
        method: request.method,
        path: request.path,
      });
      throw new UnauthorizedException('Token not found');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_SECRET') || 'dev_secret',
      });
      
      // إضافة بيانات المستخدم إلى الطلب
      request.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    // التحقق من Authorization header في مكانين (case-insensitive)
    const authHeader = request.headers.authorization || request.headers.Authorization;
    
    if (!authHeader) {
      return undefined;
    }
    
    const [type, token] = authHeader.split(' ');
    
    // التحقق من أن النوع هو Bearer (case-insensitive)
    if (type?.toLowerCase() === 'bearer' && token) {
      return token;
    }
    
    return undefined;
  }
}

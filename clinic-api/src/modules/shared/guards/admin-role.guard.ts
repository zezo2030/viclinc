import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class AdminRoleGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const role = req.user?.role || req.headers['x-role'];
    if (role === 'ADMIN') return true;
    throw new UnauthorizedException('Admin only');
  }
}



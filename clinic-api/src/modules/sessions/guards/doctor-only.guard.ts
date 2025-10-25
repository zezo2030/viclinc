import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class DoctorOnlyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const userRole = request.userRole;

    if (userRole !== 'doctor') {
      throw new ForbiddenException('Only doctors can perform this action');
    }

    return true;
  }
}

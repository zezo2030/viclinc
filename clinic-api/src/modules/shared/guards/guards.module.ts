import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AdminRoleGuard } from './admin-role.guard';
import { DoctorRoleGuard } from './doctor-role.guard';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        secret: cfg.get<string>('JWT_SECRET') || 'dev_secret',
        signOptions: { expiresIn: Number(cfg.get('JWT_EXPIRES_SEC') ?? 900) },
      }),
    }),
  ],
  providers: [JwtAuthGuard, AdminRoleGuard, DoctorRoleGuard],
  exports: [JwtAuthGuard, AdminRoleGuard, DoctorRoleGuard, JwtModule],
})
export class GuardsModule {}

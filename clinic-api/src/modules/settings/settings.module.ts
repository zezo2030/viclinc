import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SystemSettings, SystemSettingsSchema } from './schemas/system-settings.schema';
import { SettingsService } from './settings.service';
import { SettingsController } from './settings.controller';
import { SharedSchemasModule } from '../shared/schemas/schemas.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SystemSettings.name, schema: SystemSettingsSchema },
    ]),
    SharedSchemasModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        secret: cfg.get<string>('JWT_SECRET') || 'dev_secret',
        signOptions: { expiresIn: Number(cfg.get('JWT_EXPIRES_SEC') ?? 900) },
      }),
    }),
  ],
  controllers: [SettingsController],
  providers: [SettingsService],
  exports: [SettingsService, JwtModule],
})
export class SettingsModule {}

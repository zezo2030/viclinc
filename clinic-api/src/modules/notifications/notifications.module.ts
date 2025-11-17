import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { DeviceToken, DeviceTokenSchema } from './schemas/device-token.schema';
import { GuardsModule } from '../shared/guards/guards.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DeviceToken.name, schema: DeviceTokenSchema },
    ]),
    GuardsModule, // Required for JwtAuthGuard used in NotificationsController
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService], // Export for use in other modules
})
export class NotificationsModule {}


import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Payment, PaymentSchema } from './schemas/payment.schema';
import { Appointment, AppointmentSchema } from '../schedule/schemas/appointment.schema';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PaylinkService } from './services/paylink.service';
import { ScheduleModule } from '../schedule/schedule.module';
import { GuardsModule } from '../shared/guards/guards.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Payment.name, schema: PaymentSchema },
      { name: Appointment.name, schema: AppointmentSchema },
    ]),
    ScheduleModule,
    GuardsModule, // Required for JwtAuthGuard used in PaymentsController
    UsersModule, // Required for UserModel in PaymentsService
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService, PaylinkService],
  exports: [PaymentsService],
})
export class PaymentsModule {}

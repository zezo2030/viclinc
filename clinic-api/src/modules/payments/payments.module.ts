import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Payment, PaymentSchema } from './schemas/payment.schema';
import { Appointment, AppointmentSchema } from '../schedule/schemas/appointment.schema';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { ScheduleModule } from '../schedule/schedule.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Payment.name, schema: PaymentSchema },
      { name: Appointment.name, schema: AppointmentSchema },
    ]),
    ScheduleModule,
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}

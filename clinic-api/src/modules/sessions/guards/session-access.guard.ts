import { Injectable, CanActivate, ExecutionContext, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Appointment } from '../../schedule/schemas/appointment.schema';

@Injectable()
export class SessionAccessGuard implements CanActivate {
  constructor(
    @InjectModel(Appointment.name) 
    private appointmentModel: Model<any>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const appointmentId = request.params.appointmentId;

    if (!appointmentId) {
      throw new ForbiddenException('Appointment ID is required');
    }

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // البحث عن الموعد مع تعبئة userId الخاص بالطبيب
    const appointment = await this.appointmentModel.findById(appointmentId).populate('doctorId', 'userId');
    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    // التحقق من صلاحيات الوصول
    const userId = (user._id || user.sub)?.toString();
    const patientId = appointment.patientId?._id?.toString() || appointment.patientId?.toString();
    const isPatient = patientId === userId;
    
    let isDoctor = false;
    if (!isPatient && appointment.doctorId) {
      // بما أننا قمنا بالتعبئة، فإن doctorId أصبح كائناً يحتوي على userId
      isDoctor = (appointment.doctorId as any).userId?.toString() === userId;
    }

    if (!isDoctor && !isPatient) {
      throw new ForbiddenException('You are not authorized to access this appointment');
    }

    // إضافة معلومات الموعد للطلب
    request.appointment = appointment;
    request.userRole = isDoctor ? 'doctor' : 'patient';

    return true;
  }
}

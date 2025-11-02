import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Payment, PaymentDocument, PaymentStatus } from '../../payments/schemas/payment.schema';
import { Appointment, AppointmentDocument, PaymentStatus as AppointmentPaymentStatus } from '../../schedule/schemas/appointment.schema';
import { User, UserDocument } from '../../users/schemas/user.schema';
import { DoctorProfile, DoctorProfileDocument } from '../../doctors/schemas/doctor-profile.schema';
import { AdminPaymentsQueryDto } from '../dto/admin-payments-query.dto';
import { PaginatedPaymentsDto } from '../dto/paginated-payments.dto';
import { PaymentAdminDto } from '../dto/payment-admin.dto';

// Using DTOs for outward-facing shapes

@Injectable()
export class AdminPaymentsService {
  constructor(
    @InjectModel(Payment.name) private readonly paymentModel: Model<PaymentDocument>,
    @InjectModel(Appointment.name) private readonly appointmentModel: Model<AppointmentDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(DoctorProfile.name) private readonly doctorProfileModel: Model<DoctorProfileDocument>,
  ) {}

  async findAllForAdmin(query: AdminPaymentsQueryDto): Promise<PaginatedPaymentsDto> {
    const { status, method, startDate, endDate, search, page = 1, limit = 10 } = query;

    const match: Record<string, any> = {};
    if (status) match.status = status;
    if (method) match.paymentMethod = method;
    if (startDate || endDate) {
      match.createdAt = {};
      if (startDate) match.createdAt.$gte = new Date(startDate);
      if (endDate) match.createdAt.$lte = new Date(endDate);
    }

    const pipeline: any[] = [
      { $match: match },
      {
        $lookup: {
          from: 'appointments',
          localField: 'appointmentId',
          foreignField: '_id',
          as: 'appointment',
        },
      },
      { $unwind: { path: '$appointment', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'users',
          localField: 'appointment.patientId',
          foreignField: '_id',
          as: 'patient',
        },
      },
      { $unwind: { path: '$patient', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'doctorProfiles',
          localField: 'appointment.doctorId',
          foreignField: '_id',
          as: 'doctor',
        },
      },
      { $unwind: { path: '$doctor', preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          patientName: { $ifNull: ['$patient.name', ''] },
          doctorName: { $ifNull: ['$doctor.name', ''] },
        },
      },
    ];

    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { transactionId: { $regex: search, $options: 'i' } },
            { intentId: { $regex: search, $options: 'i' } },
            { patientName: { $regex: search, $options: 'i' } },
            { doctorName: { $regex: search, $options: 'i' } },
          ],
        },
      });
    }

    const countPipeline = [...pipeline, { $count: 'total' }];
    const [{ total } = { total: 0 }] = await this.paymentModel.aggregate(countPipeline).exec();

    const items: PaymentAdminDto[] = await this.paymentModel
      .aggregate([
        ...pipeline,
        { $sort: { createdAt: -1 } },
        { $skip: (page - 1) * limit },
        { $limit: limit },
        {
          $project: {
            id: '$_id',
            _id: 0,
            appointmentId: 1,
            amount: 1,
            currency: 1,
            status: 1,
            paymentMethod: 1,
            transactionId: 1,
            intentId: 1,
            createdAt: 1,
            updatedAt: 1,
            patient: {
              id: '$patient._id',
              name: '$patientName',
            },
            doctor: {
              id: '$doctor._id',
              name: '$doctorName',
            },
            appointment: {
              startAt: '$appointment.startAt',
            },
          },
        },
      ])
      .exec();

    return { items, total, page, limit };
  }

  async findByIdForAdmin(id: string) {
    if (!Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid id');

    const [payment] = await this.paymentModel
      .aggregate([
        { $match: { _id: new Types.ObjectId(id) } },
        {
          $lookup: {
            from: 'appointments',
            localField: 'appointmentId',
            foreignField: '_id',
            as: 'appointment',
          },
        },
        { $unwind: { path: '$appointment', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'users',
            localField: 'appointment.patientId',
            foreignField: '_id',
            as: 'patient',
          },
        },
        { $unwind: { path: '$patient', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'doctorProfiles',
            localField: 'appointment.doctorId',
            foreignField: '_id',
            as: 'doctor',
          },
        },
        { $unwind: { path: '$doctor', preserveNullAndEmptyArrays: true } },
        {
          $addFields: {
            patientName: { $ifNull: ['$patient.name', ''] },
            doctorName: { $ifNull: ['$doctor.name', ''] },
          },
        },
        {
          $project: {
            id: '$_id',
            _id: 0,
            appointmentId: 1,
            amount: 1,
            currency: 1,
            status: 1,
            paymentMethod: 1,
            transactionId: 1,
            intentId: 1,
            createdAt: 1,
            updatedAt: 1,
            metadata: 1,
            paidAt: 1,
            failureReason: 1,
            patient: {
              id: '$patient._id',
              name: '$patientName',
            },
            doctor: {
              id: '$doctor._id',
              name: '$doctorName',
            },
            appointment: {
              startAt: '$appointment.startAt',
              status: '$appointment.status',
            },
          },
        },
      ])
      .exec();

    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }

  async refundPayment(id: string, reason?: string): Promise<PaymentAdminDto> {
    if (!Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid id');
    const payment = await this.paymentModel.findById(id);
    if (!payment) throw new NotFoundException('Payment not found');

    if (payment.status === PaymentStatus.REFUNDED) {
      return {
        id: (payment as any)._id?.toString?.() || String(payment._id),
        appointmentId: ((payment as any).appointmentId || '').toString?.() || String(payment.appointmentId),
        amount: (payment as any).amount,
        currency: (payment as any).currency,
        status: (payment as any).status,
        paymentMethod: (payment as any).paymentMethod,
        transactionId: (payment as any).transactionId,
        intentId: (payment as any).intentId,
        createdAt: ((payment as any).createdAt || new Date()).toISOString?.() || (payment as any).createdAt,
        updatedAt: ((payment as any).updatedAt || new Date()).toISOString?.() || (payment as any).updatedAt,
      } as unknown as PaymentAdminDto;
    }

    payment.status = PaymentStatus.REFUNDED;
    const metadata = payment.metadata || {};
    metadata.refundReason = reason;
    metadata.refundedAt = new Date().toISOString();
    payment.metadata = metadata;
    await payment.save();

    if (payment.appointmentId) {
      await this.appointmentModel.updateOne(
        { _id: payment.appointmentId },
        { $set: { paymentStatus: AppointmentPaymentStatus.REFUNDED } },
      );
    }

    return {
      id: (payment as any)._id?.toString?.() || String(payment._id),
      appointmentId: ((payment as any).appointmentId || '').toString?.() || String(payment.appointmentId),
      amount: (payment as any).amount,
      currency: (payment as any).currency,
      status: (payment as any).status,
      paymentMethod: (payment as any).paymentMethod,
      transactionId: (payment as any).transactionId,
      intentId: (payment as any).intentId,
      createdAt: ((payment as any).createdAt || new Date()).toISOString?.() || (payment as any).createdAt,
      updatedAt: ((payment as any).updatedAt || new Date()).toISOString?.() || (payment as any).updatedAt,
    } as unknown as PaymentAdminDto;
  }
}



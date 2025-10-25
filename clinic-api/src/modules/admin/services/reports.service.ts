import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Appointment, AppointmentDocument, AppointmentStatus } from '../../schedule/schemas/appointment.schema';
import { DoctorProfile, DoctorProfileDocument } from '../../doctors/schemas/doctor-profile.schema';
import { User, UserDocument, Role } from '../../users/schemas/user.schema';
import { Payment, PaymentDocument, PaymentStatus } from '../../payments/schemas/payment.schema';
import dayjs from 'dayjs';

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(Appointment.name)
    private readonly appointmentModel: Model<AppointmentDocument>,
    @InjectModel(DoctorProfile.name)
    private readonly doctorProfileModel: Model<DoctorProfileDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(Payment.name)
    private readonly paymentModel: Model<PaymentDocument>,
  ) {}

  async getDailyReport(date: string) {
    const targetDate = dayjs(date);
    const startOfDay = targetDate.startOf('day').toDate();
    const endOfDay = targetDate.endOf('day').toDate();

    const [
      appointments,
      payments,
      newPatients,
      doctorStats,
    ] = await Promise.all([
      this.getAppointmentStats(startOfDay, endOfDay),
      this.getPaymentStats(startOfDay, endOfDay),
      this.getNewPatientsStats(startOfDay, endOfDay),
      this.getDoctorStats(startOfDay, endOfDay),
    ]);

    return {
      date: targetDate.format('YYYY-MM-DD'),
      summary: {
        totalAppointments: appointments.total,
        confirmedAppointments: appointments.confirmed,
        cancelledAppointments: appointments.cancelled,
        noShowAppointments: appointments.noShow,
        totalRevenue: payments.total,
        newPatients: newPatients.count,
        activeDoctors: doctorStats.active,
      },
      appointments,
      payments,
      newPatients,
      doctorStats,
      generatedAt: new Date().toISOString(),
    };
  }

  async getWeeklyReport(weekStart: string) {
    const startDate = dayjs(weekStart).startOf('week');
    const endDate = startDate.endOf('week');

    const [
      appointments,
      payments,
      newPatients,
      doctorStats,
      dailyBreakdown,
    ] = await Promise.all([
      this.getAppointmentStats(startDate.toDate(), endDate.toDate()),
      this.getPaymentStats(startDate.toDate(), endDate.toDate()),
      this.getNewPatientsStats(startDate.toDate(), endDate.toDate()),
      this.getDoctorStats(startDate.toDate(), endDate.toDate()),
      this.getDailyBreakdown(startDate.toDate(), endDate.toDate()),
    ]);

    return {
      weekStart: startDate.format('YYYY-MM-DD'),
      weekEnd: endDate.format('YYYY-MM-DD'),
      summary: {
        totalAppointments: appointments.total,
        confirmedAppointments: appointments.confirmed,
        cancelledAppointments: appointments.cancelled,
        noShowAppointments: appointments.noShow,
        totalRevenue: payments.total,
        newPatients: newPatients.count,
        activeDoctors: doctorStats.active,
      },
      appointments,
      payments,
      newPatients,
      doctorStats,
      dailyBreakdown,
      generatedAt: new Date().toISOString(),
    };
  }

  async getMonthlyReport(month: string) {
    const startDate = dayjs(month).startOf('month');
    const endDate = startDate.endOf('month');

    const [
      appointments,
      payments,
      newPatients,
      doctorStats,
      weeklyBreakdown,
      departmentStats,
    ] = await Promise.all([
      this.getAppointmentStats(startDate.toDate(), endDate.toDate()),
      this.getPaymentStats(startDate.toDate(), endDate.toDate()),
      this.getNewPatientsStats(startDate.toDate(), endDate.toDate()),
      this.getDoctorStats(startDate.toDate(), endDate.toDate()),
      this.getWeeklyBreakdown(startDate.toDate(), endDate.toDate()),
      this.getDepartmentStats(startDate.toDate(), endDate.toDate()),
    ]);

    return {
      month: startDate.format('YYYY-MM'),
      summary: {
        totalAppointments: appointments.total,
        confirmedAppointments: appointments.confirmed,
        cancelledAppointments: appointments.cancelled,
        noShowAppointments: appointments.noShow,
        totalRevenue: payments.total,
        newPatients: newPatients.count,
        activeDoctors: doctorStats.active,
      },
      appointments,
      payments,
      newPatients,
      doctorStats,
      weeklyBreakdown,
      departmentStats,
      generatedAt: new Date().toISOString(),
    };
  }

  async getDoctorsPerformanceReport(query: any) {
    const { startDate, endDate, departmentId, limit = 10 } = query;
    
    const dateRange = {
      start: startDate ? new Date(startDate) : dayjs().startOf('month').toDate(),
      end: endDate ? new Date(endDate) : dayjs().endOf('month').toDate(),
    };

    const matchStage: any = {};
    if (departmentId) {
      matchStage.departmentId = departmentId;
    }

    const doctorPerformance = await this.doctorProfileModel.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: 'appointments',
          localField: '_id',
          foreignField: 'doctorId',
          as: 'appointments',
        },
      },
      {
        $addFields: {
          periodAppointments: {
            $filter: {
              input: '$appointments',
              cond: {
                $and: [
                  { $gte: ['$$this.startAt', dateRange.start] },
                  { $lte: ['$$this.startAt', dateRange.end] },
                ],
              },
            },
          },
        },
      },
      {
        $project: {
          name: 1,
          licenseNumber: 1,
          departmentId: 1,
          status: 1,
          totalAppointments: { $size: '$periodAppointments' },
          confirmedAppointments: {
            $size: {
              $filter: {
                input: '$periodAppointments',
                cond: { $eq: ['$$this.status', AppointmentStatus.CONFIRMED] },
              },
            },
          },
          cancelledAppointments: {
            $size: {
              $filter: {
                input: '$periodAppointments',
                cond: { $eq: ['$$this.status', AppointmentStatus.CANCELLED] },
              },
            },
          },
          noShowAppointments: {
            $size: {
              $filter: {
                input: '$periodAppointments',
                cond: { $eq: ['$$this.status', AppointmentStatus.NO_SHOW] },
              },
            },
          },
          totalRevenue: {
            $sum: {
              $map: {
                input: '$periodAppointments',
                as: 'apt',
                in: '$$apt.price',
              },
            },
          },
          averageAppointmentDuration: {
            $avg: {
              $map: {
                input: '$periodAppointments',
                as: 'apt',
                in: '$$apt.duration',
              },
            },
          },
        },
      },
      {
        $addFields: {
          confirmationRate: {
            $cond: [
              { $gt: ['$totalAppointments', 0] },
              { $multiply: [{ $divide: ['$confirmedAppointments', '$totalAppointments'] }, 100] },
              0,
            ],
          },
          cancellationRate: {
            $cond: [
              { $gt: ['$totalAppointments', 0] },
              { $multiply: [{ $divide: ['$cancelledAppointments', '$totalAppointments'] }, 100] },
              0,
            ],
          },
          noShowRate: {
            $cond: [
              { $gt: ['$totalAppointments', 0] },
              { $multiply: [{ $divide: ['$noShowAppointments', '$totalAppointments'] }, 100] },
              0,
            ],
          },
        },
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: limit },
    ]);

    // Get department information
    const departmentInfo = await this.getDepartmentInfo();

    return {
      doctorPerformance,
      departmentInfo,
      period: {
        startDate: dateRange.start,
        endDate: dateRange.end,
      },
      filters: {
        departmentId,
        limit,
      },
      generatedAt: new Date().toISOString(),
    };
  }

  private async getAppointmentStats(startDate: Date, endDate: Date) {
    const stats = await this.appointmentModel.aggregate([
      {
        $match: {
          startAt: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$price' },
        },
      },
    ]);

    const result = {
      total: 0,
      confirmed: 0,
      cancelled: 0,
      noShow: 0,
      pending: 0,
      totalRevenue: 0,
    };

    stats.forEach(stat => {
      result.total += stat.count;
      result.totalRevenue += stat.totalRevenue;
      
      switch (stat._id) {
        case AppointmentStatus.CONFIRMED:
          result.confirmed = stat.count;
          break;
        case AppointmentStatus.CANCELLED:
          result.cancelled = stat.count;
          break;
        case AppointmentStatus.NO_SHOW:
          result.noShow = stat.count;
          break;
        case AppointmentStatus.PENDING_CONFIRM:
          result.pending = stat.count;
          break;
      }
    });

    return result;
  }

  private async getPaymentStats(startDate: Date, endDate: Date) {
    const stats = await this.paymentModel.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
        },
      },
    ]);

    const result = {
      total: 0,
      completed: 0,
      pending: 0,
      failed: 0,
      totalAmount: 0,
    };

    stats.forEach(stat => {
      result.total += stat.count;
      result.totalAmount += stat.totalAmount;
      
      switch (stat._id) {
        case PaymentStatus.COMPLETED:
          result.completed = stat.count;
          break;
        case PaymentStatus.PENDING:
          result.pending = stat.count;
          break;
        case PaymentStatus.FAILED:
          result.failed = stat.count;
          break;
      }
    });

    return result;
  }

  private async getNewPatientsStats(startDate: Date, endDate: Date) {
    const count = await this.userModel.countDocuments({
      role: Role.PATIENT,
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
    });

    return { count };
  }

  private async getDoctorStats(startDate: Date, endDate: Date) {
    const activeDoctors = await this.doctorProfileModel.countDocuments({
      status: 'APPROVED',
    });

    const newDoctors = await this.doctorProfileModel.countDocuments({
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
    });

    return {
      active: activeDoctors,
      new: newDoctors,
    };
  }

  private async getDailyBreakdown(startDate: Date, endDate: Date) {
    return this.appointmentModel.aggregate([
      {
        $match: {
          startAt: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$startAt',
            },
          },
          appointments: { $sum: 1 },
          confirmed: {
            $sum: {
              $cond: [{ $eq: ['$status', AppointmentStatus.CONFIRMED] }, 1, 0],
            },
          },
          cancelled: {
            $sum: {
              $cond: [{ $eq: ['$status', AppointmentStatus.CANCELLED] }, 1, 0],
            },
          },
          revenue: { $sum: '$price' },
        },
      },
      { $sort: { _id: 1 } },
    ]);
  }

  private async getWeeklyBreakdown(startDate: Date, endDate: Date) {
    return this.appointmentModel.aggregate([
      {
        $match: {
          startAt: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-W%U',
              date: '$startAt',
            },
          },
          appointments: { $sum: 1 },
          confirmed: {
            $sum: {
              $cond: [{ $eq: ['$status', AppointmentStatus.CONFIRMED] }, 1, 0],
            },
          },
          cancelled: {
            $sum: {
              $cond: [{ $eq: ['$status', AppointmentStatus.CANCELLED] }, 1, 0],
            },
          },
          revenue: { $sum: '$price' },
        },
      },
      { $sort: { _id: 1 } },
    ]);
  }

  private async getDepartmentStats(startDate: Date, endDate: Date) {
    return this.doctorProfileModel.aggregate([
      {
        $lookup: {
          from: 'departments',
          localField: 'departmentId',
          foreignField: '_id',
          as: 'department',
        },
      },
      {
        $unwind: '$department',
      },
      {
        $lookup: {
          from: 'appointments',
          localField: '_id',
          foreignField: 'doctorId',
          as: 'appointments',
        },
      },
      {
        $addFields: {
          periodAppointments: {
            $filter: {
              input: '$appointments',
              cond: {
                $and: [
                  { $gte: ['$$this.startAt', startDate] },
                  { $lte: ['$$this.startAt', endDate] },
                ],
              },
            },
          },
        },
      },
      {
        $group: {
          _id: '$departmentId',
          departmentName: { $first: '$department.name' },
          doctorCount: { $sum: 1 },
          totalAppointments: { $sum: { $size: '$periodAppointments' } },
          totalRevenue: {
            $sum: {
              $sum: {
                $map: {
                  input: '$periodAppointments',
                  as: 'apt',
                  in: '$$apt.price',
                },
              },
            },
          },
        },
      },
      { $sort: { totalRevenue: -1 } },
    ]);
  }

  private async getDepartmentInfo() {
    return this.doctorProfileModel.aggregate([
      {
        $lookup: {
          from: 'departments',
          localField: 'departmentId',
          foreignField: '_id',
          as: 'department',
        },
      },
      {
        $unwind: '$department',
      },
      {
        $group: {
          _id: '$departmentId',
          name: { $first: '$department.name' },
          doctorCount: { $sum: 1 },
        },
      },
      { $sort: { name: 1 } },
    ]);
  }
}

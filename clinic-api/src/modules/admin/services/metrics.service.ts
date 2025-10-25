import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Appointment, AppointmentDocument, AppointmentStatus } from '../../schedule/schemas/appointment.schema';
import { DoctorProfile, DoctorProfileDocument, DoctorStatus } from '../../doctors/schemas/doctor-profile.schema';
import { User, UserDocument, Role } from '../../users/schemas/user.schema';
import { Payment, PaymentDocument, PaymentStatus } from '../../payments/schemas/payment.schema';
import { MetricsQueryDto } from '../dto/metrics-query.dto';
import dayjs from 'dayjs';

@Injectable()
export class MetricsService {
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

  async getOverviewMetrics(query: MetricsQueryDto) {
    const { startDate, endDate, period = 'month' } = query;
    const dateRange = this.getDateRange(startDate, endDate, period);

    const [
      totalAppointments,
      confirmedAppointments,
      cancelledAppointments,
      noShowAppointments,
      totalDoctors,
      activeDoctors,
      totalPatients,
      activePatients,
      totalRevenue,
      pendingRevenue,
    ] = await Promise.all([
      this.getAppointmentCount(dateRange),
      this.getAppointmentCount(dateRange, AppointmentStatus.CONFIRMED),
      this.getAppointmentCount(dateRange, AppointmentStatus.CANCELLED),
      this.getAppointmentCount(dateRange, AppointmentStatus.NO_SHOW),
      this.getDoctorCount(),
      this.getDoctorCount(DoctorStatus.APPROVED),
      this.getPatientCount(),
      this.getActivePatientCount(dateRange),
      this.getTotalRevenue(dateRange),
      this.getPendingRevenue(dateRange),
    ]);

    const appointmentRate = totalAppointments > 0 ? (confirmedAppointments / totalAppointments) * 100 : 0;
    const cancellationRate = totalAppointments > 0 ? (cancelledAppointments / totalAppointments) * 100 : 0;
    const noShowRate = totalAppointments > 0 ? (noShowAppointments / totalAppointments) * 100 : 0;

    return {
      overview: {
        totalAppointments,
        confirmedAppointments,
        cancelledAppointments,
        noShowAppointments,
        appointmentRate: Math.round(appointmentRate * 100) / 100,
        cancellationRate: Math.round(cancellationRate * 100) / 100,
        noShowRate: Math.round(noShowRate * 100) / 100,
      },
      users: {
        totalDoctors,
        activeDoctors,
        totalPatients,
        activePatients,
      },
      revenue: {
        totalRevenue,
        pendingRevenue,
        collectedRevenue: totalRevenue - pendingRevenue,
      },
      period: {
        startDate: dateRange.start,
        endDate: dateRange.end,
        type: period,
      },
    };
  }

  async getAppointmentMetrics(query: MetricsQueryDto) {
    const { startDate, endDate, period = 'month', departmentId, doctorId } = query;
    const dateRange = this.getDateRange(startDate, endDate, period);

    const matchStage: any = {
      startAt: {
        $gte: dateRange.start,
        $lte: dateRange.end,
      },
    };

    if (departmentId) {
      matchStage['doctorId'] = { $in: await this.getDoctorIdsByDepartment(departmentId) };
    }

    if (doctorId) {
      matchStage['doctorId'] = doctorId;
    }

    const metrics = await this.appointmentModel.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$price' },
        },
      },
    ]);

    const statusCounts = metrics.reduce((acc, metric) => {
      acc[metric._id] = {
        count: metric.count,
        revenue: metric.totalRevenue,
      };
      return acc;
    }, {});

    // Get daily breakdown for the period
    const dailyBreakdown = await this.getDailyAppointmentBreakdown(dateRange, matchStage);

    return {
      statusCounts,
      dailyBreakdown,
      period: {
        startDate: dateRange.start,
        endDate: dateRange.end,
        type: period,
      },
      filters: {
        departmentId,
        doctorId,
      },
    };
  }

  async getDoctorMetrics(query: MetricsQueryDto) {
    const { startDate, endDate, period = 'month', departmentId } = query;
    const dateRange = this.getDateRange(startDate, endDate, period);

    const matchStage: any = {};
    if (departmentId) {
      matchStage.departmentId = departmentId;
    }

    const doctorStats = await this.doctorProfileModel.aggregate([
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
          status: 1,
          departmentId: 1,
          totalAppointments: { $size: '$periodAppointments' },
          confirmedAppointments: {
            $size: {
              $filter: {
                input: '$periodAppointments',
                cond: { $eq: ['$$this.status', AppointmentStatus.CONFIRMED] },
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
        },
      },
      { $sort: { totalAppointments: -1 } },
    ]);

    const departmentStats = await this.getDepartmentStats(dateRange, departmentId);

    return {
      doctorStats,
      departmentStats,
      period: {
        startDate: dateRange.start,
        endDate: dateRange.end,
        type: period,
      },
      filters: {
        departmentId,
      },
    };
  }

  async getPatientMetrics(query: MetricsQueryDto) {
    const { startDate, endDate, period = 'month' } = query;
    const dateRange = this.getDateRange(startDate, endDate, period);

    const patientStats = await this.userModel.aggregate([
      { $match: { role: Role.PATIENT } },
      {
        $lookup: {
          from: 'appointments',
          localField: '_id',
          foreignField: 'patientId',
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
          email: 1,
          phone: 1,
          status: 1,
          totalAppointments: { $size: '$periodAppointments' },
          lastAppointment: { $max: '$periodAppointments.startAt' },
          totalSpent: {
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
      { $sort: { totalAppointments: -1 } },
    ]);

    const newPatients = await this.getNewPatientsCount(dateRange);
    const returningPatients = await this.getReturningPatientsCount(dateRange);

    return {
      patientStats,
      summary: {
        newPatients,
        returningPatients,
        totalActivePatients: patientStats.length,
      },
      period: {
        startDate: dateRange.start,
        endDate: dateRange.end,
        type: period,
      },
    };
  }

  async getRevenueMetrics(query: MetricsQueryDto) {
    const { startDate, endDate, period = 'month' } = query;
    const dateRange = this.getDateRange(startDate, endDate, period);

    const revenueStats = await this.paymentModel.aggregate([
      {
        $match: {
          createdAt: {
            $gte: dateRange.start,
            $lte: dateRange.end,
          },
        },
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          averageAmount: { $avg: '$amount' },
        },
      },
    ]);

    const dailyRevenue = await this.getDailyRevenueBreakdown(dateRange);
    const monthlyTrend = await this.getMonthlyRevenueTrend(dateRange);

    return {
      revenueStats,
      dailyRevenue,
      monthlyTrend,
      period: {
        startDate: dateRange.start,
        endDate: dateRange.end,
        type: period,
      },
    };
  }

  private getDateRange(startDate?: string, endDate?: string, period?: string) {
    const now = dayjs();
    
    if (startDate && endDate) {
      return {
        start: new Date(startDate),
        end: new Date(endDate),
      };
    }

    switch (period) {
      case 'day':
        return {
          start: now.startOf('day').toDate(),
          end: now.endOf('day').toDate(),
        };
      case 'week':
        return {
          start: now.startOf('week').toDate(),
          end: now.endOf('week').toDate(),
        };
      case 'month':
        return {
          start: now.startOf('month').toDate(),
          end: now.endOf('month').toDate(),
        };
      case 'year':
        return {
          start: now.startOf('year').toDate(),
          end: now.endOf('year').toDate(),
        };
      default:
        return {
          start: now.startOf('month').toDate(),
          end: now.endOf('month').toDate(),
        };
    }
  }

  private async getAppointmentCount(dateRange: { start: Date; end: Date }, status?: AppointmentStatus) {
    const filter: any = {
      startAt: {
        $gte: dateRange.start,
        $lte: dateRange.end,
      },
    };

    if (status) {
      filter.status = status;
    }

    return this.appointmentModel.countDocuments(filter);
  }

  private async getDoctorCount(status?: DoctorStatus) {
    const filter: any = {};
    if (status) {
      filter.status = status;
    }
    return this.doctorProfileModel.countDocuments(filter);
  }

  private async getPatientCount() {
    return this.userModel.countDocuments({ role: Role.PATIENT });
  }

  private async getActivePatientCount(dateRange: { start: Date; end: Date }) {
    const activePatients = await this.appointmentModel.distinct('patientId', {
      startAt: {
        $gte: dateRange.start,
        $lte: dateRange.end,
      },
    });
    return activePatients.length;
  }

  private async getTotalRevenue(dateRange: { start: Date; end: Date }) {
    const result = await this.paymentModel.aggregate([
      {
        $match: {
          status: PaymentStatus.COMPLETED,
          createdAt: {
            $gte: dateRange.start,
            $lte: dateRange.end,
          },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
        },
      },
    ]);

    return result[0]?.total || 0;
  }

  private async getPendingRevenue(dateRange: { start: Date; end: Date }) {
    const result = await this.paymentModel.aggregate([
      {
        $match: {
          status: PaymentStatus.PENDING,
          createdAt: {
            $gte: dateRange.start,
            $lte: dateRange.end,
          },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
        },
      },
    ]);

    return result[0]?.total || 0;
  }

  private async getDoctorIdsByDepartment(departmentId: string) {
    const doctors = await this.doctorProfileModel.find({ departmentId }).select('_id');
    return doctors.map(d => d._id);
  }

  private async getDailyAppointmentBreakdown(dateRange: { start: Date; end: Date }, matchStage: any) {
    return this.appointmentModel.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$startAt',
            },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
  }

  private async getDepartmentStats(dateRange: { start: Date; end: Date }, departmentId?: string) {
    const matchStage: any = {};
    if (departmentId) {
      matchStage.departmentId = departmentId;
    }

    return this.doctorProfileModel.aggregate([
      { $match: matchStage },
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
          departmentName: { $first: '$department.name' },
          doctorCount: { $sum: 1 },
        },
      },
      { $sort: { doctorCount: -1 } },
    ]);
  }

  private async getNewPatientsCount(dateRange: { start: Date; end: Date }) {
    return this.userModel.countDocuments({
      role: Role.PATIENT,
      createdAt: {
        $gte: dateRange.start,
        $lte: dateRange.end,
      },
    });
  }

  private async getReturningPatientsCount(dateRange: { start: Date; end: Date }) {
    const patientsWithMultipleAppointments = await this.appointmentModel.aggregate([
      {
        $match: {
          startAt: {
            $gte: dateRange.start,
            $lte: dateRange.end,
          },
        },
      },
      {
        $group: {
          _id: '$patientId',
          appointmentCount: { $sum: 1 },
        },
      },
      {
        $match: {
          appointmentCount: { $gt: 1 },
        },
      },
    ]);

    return patientsWithMultipleAppointments.length;
  }

  private async getDailyRevenueBreakdown(dateRange: { start: Date; end: Date }) {
    return this.paymentModel.aggregate([
      {
        $match: {
          status: PaymentStatus.COMPLETED,
          createdAt: {
            $gte: dateRange.start,
            $lte: dateRange.end,
          },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt',
            },
          },
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
  }

  private async getMonthlyRevenueTrend(dateRange: { start: Date; end: Date }) {
    return this.paymentModel.aggregate([
      {
        $match: {
          status: PaymentStatus.COMPLETED,
          createdAt: {
            $gte: dateRange.start,
            $lte: dateRange.end,
          },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m',
              date: '$createdAt',
            },
          },
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
  }
}

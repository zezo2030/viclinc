import { Injectable, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { User, UserDocument, Role } from '../../users/schemas/user.schema';
import { ImpersonationSession, ImpersonationSessionDocument } from '../schemas/impersonation-session.schema';
import { AdminAudit, AdminAuditDocument, AuditAction } from '../schemas/admin-audit.schema';
import { DoctorProfile, DoctorProfileDocument } from '../../doctors/schemas/doctor-profile.schema';
import dayjs from 'dayjs';

@Injectable()
export class ImpersonationService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(ImpersonationSession.name)
    private readonly impersonationSessionModel: Model<ImpersonationSessionDocument>,
    @InjectModel(AdminAudit.name)
    private readonly adminAuditModel: Model<AdminAuditDocument>,
    @InjectModel(DoctorProfile.name)
    private readonly doctorProfileModel: Model<DoctorProfileDocument>,
    private readonly jwtService: JwtService,
  ) {}

  async createImpersonationSession(
    adminId: string,
    targetUserId: string,
    ipAddress?: string,
    userAgent?: string,
    reason?: string,
    sessionDuration: number = 60, // 60 minutes default
  ) {
    // Validate admin user
    const admin = await this.userModel.findById(adminId);
    if (!admin || admin.role !== Role.ADMIN) {
      throw new UnauthorizedException('Only admin users can create impersonation sessions');
    }

    // Validate target user
    const targetUser = await this.userModel.findById(targetUserId);
    if (!targetUser) {
      throw new NotFoundException('Target user not found');
    }

    // Prevent self-impersonation
    if (adminId === targetUserId) {
      throw new BadRequestException('Cannot impersonate yourself');
    }

    // Prevent impersonating other admins
    if (targetUser.role === Role.ADMIN) {
      throw new BadRequestException('Cannot impersonate admin users');
    }

    // Check for existing active session
    const existingSession = await this.impersonationSessionModel.findOne({
      adminId,
      isActive: true,
    });

    if (existingSession) {
      throw new BadRequestException('Admin already has an active impersonation session');
    }

    // Check if target user is a doctor and if they're approved
    if (targetUser.role === Role.DOCTOR) {
      const doctorProfile = await this.doctorProfileModel.findOne({ userId: targetUserId });
      if (!doctorProfile || doctorProfile.status !== 'APPROVED') {
        throw new BadRequestException('Cannot impersonate unapproved doctor');
      }
    }

    // Create impersonation token
    const expiresAt = dayjs().add(sessionDuration, 'minute').toDate();
    const impersonationToken = await this.jwtService.signAsync({
      sub: targetUserId,
      role: targetUser.role,
      originalUserId: adminId,
      isImpersonation: true,
      sessionId: `imp_${Date.now()}`,
    }, {
      expiresIn: `${sessionDuration}m`,
    });

    // Create impersonation session record
    const session = new this.impersonationSessionModel({
      adminId,
      targetUserId,
      token: impersonationToken,
      expiresAt,
      ipAddress,
      userAgent,
      reason,
      metadata: {
        sessionDuration,
        createdBy: adminId,
      },
    });

    await session.save();

    // Log audit action
    await this.logAuditAction(
      adminId,
      AuditAction.LOGIN_AS,
      targetUserId,
      ipAddress,
      userAgent,
      {
        reason,
        sessionId: (session._id as any).toString(),
        sessionDuration,
      }
    );

    return {
      token: impersonationToken,
      expiresAt,
      targetUser: {
        id: (targetUser._id as any).toString(),
        name: targetUser.name,
        email: targetUser.email,
        role: targetUser.role,
      },
      sessionId: (session._id as any).toString(),
    };
  }

  async validateImpersonationToken(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync(token);
      
      if (!payload.isImpersonation) {
        throw new UnauthorizedException('Invalid impersonation token');
      }

      // Check if session is still active
      const session = await this.impersonationSessionModel.findOne({
        token,
        isActive: true,
        expiresAt: { $gt: new Date() },
      });

      if (!session) {
        throw new UnauthorizedException('Impersonation session expired or invalid');
      }

      // Get target user details
      const targetUser = await this.userModel.findById(payload.sub).select('-passwordHash');
      if (!targetUser) {
        throw new UnauthorizedException('Target user not found');
      }

      return {
        isValid: true,
        targetUserId: payload.sub,
        originalUserId: payload.originalUserId,
        role: payload.role,
        sessionId: (session._id as any).toString(),
        expiresAt: session.expiresAt,
        targetUser,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired impersonation token');
    }
  }

  async endImpersonationSession(adminId: string, sessionId?: string) {
    const filter: any = { adminId, isActive: true };
    
    if (sessionId) {
      filter._id = sessionId;
    }

    const session = await this.impersonationSessionModel.findOne(filter);
    if (!session) {
      throw new NotFoundException('Active impersonation session not found');
    }

    // Update session
    session.isActive = false;
    session.endedAt = new Date();
    session.endedBy = 'MANUAL';
    await session.save();

    // Log audit action
    await this.logAuditAction(
      adminId,
      AuditAction.LOGOUT_AS,
      (session.targetUserId as any).toString(),
      undefined,
      undefined,
      {
        sessionId: (session._id as any).toString(),
        endedAt: session.endedAt,
      }
    );

    return {
      message: 'Impersonation session ended successfully',
      sessionId: (session._id as any).toString(),
      endedAt: session.endedAt,
    };
  }

  async getActiveSessions(adminId?: string) {
    const filter: any = { isActive: true, expiresAt: { $gt: new Date() } };
    
    if (adminId) {
      filter.adminId = adminId;
    }

    const sessions = await this.impersonationSessionModel
      .find(filter)
      .populate('adminId', 'name email')
      .populate('targetUserId', 'name email role')
      .sort({ createdAt: -1 })
      .lean();

    return sessions;
  }

  async getSessionHistory(adminId?: string, limit: number = 50) {
    const filter: any = {};
    
    if (adminId) {
      filter.adminId = adminId;
    }

    const sessions = await this.impersonationSessionModel
      .find(filter)
      .populate('adminId', 'name email')
      .populate('targetUserId', 'name email role')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return sessions;
  }

  async cleanupExpiredSessions() {
    const expiredSessions = await this.impersonationSessionModel.find({
      isActive: true,
      expiresAt: { $lte: new Date() },
    });

    if (expiredSessions.length > 0) {
      await this.impersonationSessionModel.updateMany(
        { _id: { $in: expiredSessions.map(s => s._id) } },
        { 
          isActive: false, 
          endedAt: new Date(),
          endedBy: 'AUTO_EXPIRED'
        }
      );

      // Log audit actions for expired sessions
      for (const session of expiredSessions) {
        await this.logAuditAction(
          session.adminId.toString(),
          AuditAction.LOGOUT_AS,
          (session.targetUserId as any).toString(),
          undefined,
          undefined,
          {
            sessionId: (session._id as any).toString(),
            endedAt: new Date(),
            reason: 'Session expired automatically',
          }
        );
      }
    }

    return {
      cleanedSessions: expiredSessions.length,
      message: 'Expired sessions cleaned up successfully',
    };
  }

  async extendSession(sessionId: string, additionalMinutes: number = 30) {
    const session = await this.impersonationSessionModel.findById(sessionId);
    if (!session || !session.isActive) {
      throw new NotFoundException('Active session not found');
    }

    if (session.expiresAt <= new Date()) {
      throw new BadRequestException('Session has already expired');
    }

    const newExpiresAt = dayjs(session.expiresAt).add(additionalMinutes, 'minute').toDate();
    session.expiresAt = newExpiresAt;
    await session.save();

    // Log audit action
    await this.logAuditAction(
      session.adminId.toString(),
      AuditAction.LOGIN_AS,
      (session.targetUserId as any).toString(),
      undefined,
      undefined,
      {
        sessionId: (session._id as any).toString(),
        action: 'SESSION_EXTENDED',
        additionalMinutes,
        newExpiresAt,
      }
    );

    return {
      sessionId: (session._id as any).toString(),
      newExpiresAt,
      additionalMinutes,
    };
  }

  private async logAuditAction(
    adminId: string,
    action: AuditAction,
    targetUserId?: string,
    ipAddress?: string,
    userAgent?: string,
    metadata?: Record<string, any>,
  ) {
    const auditLog = new this.adminAuditModel({
      adminId,
      action,
      targetUserId,
      ipAddress,
      userAgent,
      metadata,
      success: true,
    });

    await auditLog.save();
  }

  async getImpersonationStats(adminId?: string, period: string = 'month') {
    const dateRange = this.getDateRange(period);
    
    const filter: any = {
      createdAt: {
        $gte: dateRange.start,
        $lte: dateRange.end,
      },
    };

    if (adminId) {
      filter.adminId = adminId;
    }

    const stats = await this.impersonationSessionModel.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalSessions: { $sum: 1 },
          activeSessions: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$isActive', true] }, { $gt: ['$expiresAt', new Date()] }] },
                1,
                0
              ]
            }
          },
          expiredSessions: {
            $sum: {
              $cond: [
                { $or: [{ $eq: ['$isActive', false] }, { $lte: ['$expiresAt', new Date()] }] },
                1,
                0
              ]
            }
          },
          averageDuration: { $avg: { $subtract: ['$endedAt', '$createdAt'] } },
        },
      },
    ]);

    const dailyBreakdown = await this.impersonationSessionModel.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt',
            },
          },
          sessions: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return {
      stats: stats[0] || {
        totalSessions: 0,
        activeSessions: 0,
        expiredSessions: 0,
        averageDuration: 0,
      },
      dailyBreakdown,
      period: {
        start: dateRange.start,
        end: dateRange.end,
        type: period,
      },
    };
  }

  private getDateRange(period: string) {
    const now = dayjs();
    
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
}

import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, Role, UserStatus } from '../../users/schemas/user.schema';
import { DoctorProfile, DoctorProfileDocument } from '../../doctors/schemas/doctor-profile.schema';
import { UpdateUserRoleDto } from '../dto/update-user-role.dto';
import { UpdateUserStatusDto } from '../dto/update-user-status.dto';
import { CreateUserDto } from '../dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersManagementService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(DoctorProfile.name)
    private readonly doctorProfileModel: Model<DoctorProfileDocument>,
  ) {}

  async getAllUsers(query: any) {
    const { 
      role, 
      status, 
      search, 
      page = 1, 
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = query;

    const filter: any = {};
    
    if (role) filter.role = role;
    if (status) filter.status = status;
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const sort: any = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const [users, total] = await Promise.all([
      this.userModel
        .find(filter)
        .select('-passwordHash')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      this.userModel.countDocuments(filter),
    ]);

    // Get additional info for doctors
    const usersWithDetails = await Promise.all(
      users.map(async (user) => {
        if (user.role === Role.DOCTOR) {
          const doctorProfile = await this.doctorProfileModel
            .findOne({ userId: user._id })
            .populate('departmentId', 'name')
            .lean();
          
          return {
            ...user,
            doctorProfile,
          };
        }
        return user;
      })
    );

    return {
      users: usersWithDetails,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateUserRole(userId: string, updateRoleDto: UpdateUserRoleDto) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Validate role transition
    if (user.role === Role.DOCTOR && updateRoleDto.role !== Role.DOCTOR) {
      // Check if user has doctor profile
      const doctorProfile = await this.doctorProfileModel.findOne({ userId });
      if (doctorProfile) {
        throw new BadRequestException('Cannot change role of user with doctor profile. Remove doctor profile first.');
      }
    }

    if (updateRoleDto.role === Role.DOCTOR && user.role !== Role.DOCTOR) {
      // Check if user already has doctor profile
      const existingDoctorProfile = await this.doctorProfileModel.findOne({ userId });
      if (existingDoctorProfile) {
        throw new BadRequestException('User already has doctor profile');
      }
    }

    const updatedUser = await this.userModel.findByIdAndUpdate(
      userId,
      { role: updateRoleDto.role },
      { new: true }
    ).select('-passwordHash');

    return {
      user: updatedUser,
      message: `User role updated to ${updateRoleDto.role}`,
      reason: updateRoleDto.reason,
    };
  }

  async updateUserStatus(userId: string, updateStatusDto: UpdateUserStatusDto) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Prevent disabling admin users
    if (user.role === Role.ADMIN && updateStatusDto.status === UserStatus.DISABLED) {
      throw new BadRequestException('Cannot disable admin users');
    }

    const updatedUser = await this.userModel.findByIdAndUpdate(
      userId,
      { status: updateStatusDto.status },
      { new: true }
    ).select('-passwordHash');

    // If disabling a doctor, also update doctor profile status
    if (user.role === Role.DOCTOR && updateStatusDto.status === UserStatus.DISABLED) {
      await this.doctorProfileModel.findOneAndUpdate(
        { userId },
        { status: 'SUSPENDED' }
      );
    }

    return {
      user: updatedUser,
      message: `User status updated to ${updateStatusDto.status}`,
      reason: updateStatusDto.reason,
    };
  }

  async getUserStats() {
    const [totalUsers, activeUsers, disabledUsers, pendingDeleteUsers] = await Promise.all([
      this.userModel.countDocuments(),
      this.userModel.countDocuments({ status: UserStatus.ACTIVE }),
      this.userModel.countDocuments({ status: UserStatus.DISABLED }),
      this.userModel.countDocuments({ status: UserStatus.PENDING_DELETE }),
    ]);

    const roleStats = await this.userModel.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
        },
      },
    ]);

    const statusStats = await this.userModel.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const recentUsers = await this.userModel
      .find()
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    return {
      summary: {
        totalUsers,
        activeUsers,
        disabledUsers,
        pendingDeleteUsers,
      },
      roleStats,
      statusStats,
      recentUsers,
    };
  }

  async getUserById(userId: string) {
    const user = await this.userModel.findById(userId).select('-passwordHash');
    if (!user) {
      throw new NotFoundException('User not found');
    }

    let additionalInfo = null;
    
    if (user.role === Role.DOCTOR) {
      additionalInfo = await this.doctorProfileModel
        .findOne({ userId })
        .populate('departmentId', 'name')
        .lean();
    }

    return {
      user,
      additionalInfo,
    };
  }

  async deleteUser(userId: string, reason?: string) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Prevent deleting admin users
    if (user.role === Role.ADMIN) {
      throw new BadRequestException('Cannot delete admin users');
    }

    // Mark for deletion instead of hard delete
    const updatedUser = await this.userModel.findByIdAndUpdate(
      userId,
      { 
        status: UserStatus.PENDING_DELETE,
        metadata: { 
          ...(user.metadata || {}),
          deletionReason: reason,
          deletionRequestedAt: new Date(),
        }
      },
      { new: true }
    ).select('-passwordHash');

    return {
      user: updatedUser,
      message: 'User marked for deletion',
      reason,
    };
  }

  async restoreUser(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.status !== UserStatus.PENDING_DELETE) {
      throw new BadRequestException('User is not marked for deletion');
    }

    const updatedUser = await this.userModel.findByIdAndUpdate(
      userId,
      { 
        status: UserStatus.ACTIVE,
        $unset: { 
          'metadata.deletionReason': 1,
          'metadata.deletionRequestedAt': 1,
        }
      },
      { new: true }
    ).select('-passwordHash');

    return {
      user: updatedUser,
      message: 'User restored successfully',
    };
  }

  async getUsersByRole(role: Role, query: any) {
    const { page = 1, limit = 10, search } = query;
    const filter: any = { role };
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.userModel
        .find(filter)
        .select('-passwordHash')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.userModel.countDocuments(filter),
    ]);

    return {
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async createUser(createUserDto: CreateUserDto) {
    const { name, email, phone, password, role } = createUserDto;
    
    // التحقق من عدم وجود المستخدم
    const exists = await this.userModel.findOne({ $or: [{ email }, { phone }] });
    if (exists) {
      throw new ConflictException('Email or phone already exists');
    }
    
    // تشفير كلمة المرور
    const passwordHash = await bcrypt.hash(password, 12);
    
    // إنشاء المستخدم
    const user = await this.userModel.create({
      name,
      email,
      phone,
      passwordHash,
      role,
      status: UserStatus.ACTIVE,
    });
    
    // جلب المستخدم مع الحقول المحدثة
    const createdUser = await this.userModel.findById(user._id).lean();
    
    if (!createdUser) {
      throw new NotFoundException('Failed to create user');
    }
    
    return {
      id: createdUser._id,
      name: createdUser.name,
      email: createdUser.email,
      phone: createdUser.phone,
      role: createdUser.role,
      status: createdUser.status,
      createdAt: (createdUser as any).createdAt || new Date(),
    };
  }
}

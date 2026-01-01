import { Injectable, ConflictException, UnauthorizedException, ForbiddenException, NotFoundException, BadRequestException, HttpException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, Role, UserStatus } from '../users/schemas/user.schema';
import { DoctorProfile, DoctorStatus } from '../doctors/schemas/doctor-profile.schema';
import { Otp, OtpDocument } from './otp.schema';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from './email.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(DoctorProfile.name) private readonly doctorProfileModel: Model<any>,
    @InjectModel(Otp.name) private readonly otpModel: Model<OtpDocument>,
    private readonly jwt: JwtService,
    private readonly emailService: EmailService,
  ) { }

  async registerPatient(input: { name: string; email: string; phone: string; password: string; avatar?: string }) {
    const { name, email, phone, password, avatar } = input;
    const normalizedEmail = email.trim().toLowerCase();
    const exists = await this.userModel.findOne({ $or: [{ email: normalizedEmail }, { phone }] }).lean();
    if (exists) throw new ConflictException('Email or phone already exists');
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await this.userModel.create({ name, email: normalizedEmail, phone, passwordHash, role: Role.PATIENT, status: UserStatus.ACTIVE, avatar });
    return { id: String(user._id), email: user.email, name: user.name, role: user.role, avatar: user.avatar };
  }

  /**
   * Get user by ID - used for /auth/me endpoint
   */
  async getUserById(userId: string) {
    const user = await this.userModel.findById(userId).select('-passwordHash');
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return {
      id: String(user._id),
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar
    };
  }

  async login(input: { email: string; password: string }) {
    const email = input.email.trim().toLowerCase();
    const user = await this.userModel.findOne({ email });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const ok = await bcrypt.compare(input.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    // التحقق من حالة الطبيب إذا كان دور المستخدم DOCTOR
    if (user.role === Role.DOCTOR) {
      const doctorProfile = await this.doctorProfileModel.findOne({ userId: user._id });
      if (!doctorProfile || doctorProfile.status !== DoctorStatus.APPROVED) {
        throw new ForbiddenException('Doctor account not approved yet');
      }
    }

    const accessToken = await this.jwt.signAsync({ sub: String(user._id), role: user.role });
    return {
      access_token: accessToken,
      user: {
        id: String(user._id),
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar
      }
    };
  }

  /**
   * Generate impersonation token for admin login-as functionality
   */
  async generateImpersonationToken(
    targetUserId: string,
    originalUserId: string,
    expiresIn: string = '1h'
  ): Promise<string> {
    const targetUser = await this.userModel.findById(targetUserId);
    if (!targetUser) {
      throw new UnauthorizedException('Target user not found');
    }

    // Create impersonation token with special claims
    return this.jwt.signAsync({
      sub: targetUserId,
      role: targetUser.role,
      originalUserId: originalUserId,
      isImpersonation: true,
      sessionId: `imp_${Date.now()}`,
    } as any, {
      expiresIn: expiresIn as any,
    });
  }

  /**
   * Validate impersonation token and return user info
   */
  async validateImpersonationToken(token: string) {
    try {
      const payload = await this.jwt.verifyAsync(token);

      if (!payload.isImpersonation) {
        throw new UnauthorizedException('Invalid impersonation token');
      }

      const targetUser = await this.userModel.findById(payload.sub).select('-passwordHash');
      if (!targetUser) {
        throw new UnauthorizedException('Target user not found');
      }

      return {
        isValid: true,
        targetUserId: payload.sub,
        originalUserId: payload.originalUserId,
        role: payload.role,
        sessionId: payload.sessionId,
        targetUser,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired impersonation token');
    }
  }

  /**
   * Check if token is impersonation token
   */
  async isImpersonationToken(token: string): Promise<boolean> {
    try {
      const payload = await this.jwt.verifyAsync(token);
      return payload.isImpersonation === true;
    } catch {
      return false;
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, input: { name?: string; phone?: string; avatar?: string }) {
    const updates: any = {};

    if (input.name) updates.name = input.name;
    if (input.avatar) updates.avatar = input.avatar;

    if (input.phone) {
      // Check if phone is taken by another user
      const exists = await this.userModel.findOne({
        phone: input.phone,
        _id: { $ne: userId }
      });
      if (exists) {
        throw new ConflictException('Phone number already in use');
      }
      updates.phone = input.phone;
    }

    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true }
    ).select('-passwordHash');

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: String(user._id),
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar
    };
  }

  /**
   * Forgot password - send OTP to user's email
   */
  async forgotPassword(email: string) {
    const normalizedEmail = email.trim().toLowerCase();

    try {
      // Check if user exists
      const user = await this.userModel.findOne({ email: normalizedEmail });
      if (!user) {
        throw new NotFoundException('البريد الإلكتروني غير مسجل');
      }

      // Generate 6-digit OTP
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

      // Save OTP to database
      await this.otpModel.create({
        email: normalizedEmail,
        otpCode,
        purpose: 'FORGOT_PASSWORD',
      });

      // Send OTP email
      await this.emailService.sendOtpEmail(normalizedEmail, otpCode);

      return { message: 'OTP sent to email successfully' };
    } catch (error) {
      if (error instanceof HttpException) throw error;

      console.error(`❌ Forgot password failed for ${email}:`, error);
      throw error;
    }
  }

  /**
   * Verify OTP and reset password
   */
  async verifyOtpAndResetPassword(email: string, otpCode: string, newPassword: string) {
    const normalizedEmail = email.trim().toLowerCase();

    // Check if OTP has expired (10 minutes = 600,000 ms)
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const otp = await this.otpModel.findOne({
      email: normalizedEmail,
      otpCode,
      purpose: 'FORGOT_PASSWORD',
      isUsed: false,
      createdAt: { $gt: tenMinutesAgo },
    });

    if (!otp) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    // Check if user exists
    const user = await this.userModel.findOne({ email: normalizedEmail });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 12);

    // Update user password
    await this.userModel.findByIdAndUpdate(user._id, {
      passwordHash,
    });

    // Mark OTP as used
    await this.otpModel.findByIdAndUpdate(otp._id, {
      isUsed: true,
    });

    // Send confirmation email
    await this.emailService.sendPasswordResetConfirmation(normalizedEmail);

    return { message: 'Password reset successfully' };
  }
}



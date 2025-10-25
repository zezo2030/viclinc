import { Injectable, ConflictException, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, Role, UserStatus } from '../users/schemas/user.schema';
import { DoctorProfile, DoctorStatus } from '../doctors/schemas/doctor-profile.schema';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(DoctorProfile.name) private readonly doctorProfileModel: Model<any>,
    private readonly jwt: JwtService,
  ) {}

  async registerPatient(input: { name: string; email: string; phone: string; password: string }) {
    const { name, email, phone, password } = input;
    const exists = await this.userModel.findOne({ $or: [{ email }, { phone }] }).lean();
    if (exists) throw new ConflictException('Email or phone already exists');
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await this.userModel.create({ name, email, phone, passwordHash, role: Role.PATIENT, status: UserStatus.ACTIVE });
    return { id: String(user._id), email: user.email, name: user.name, role: user.role };
  }

  async login(input: { email: string; password: string }) {
    const user = await this.userModel.findOne({ email: input.email });
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
        role: user.role
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
}



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
        role: user.role
      }
    };
  }
}



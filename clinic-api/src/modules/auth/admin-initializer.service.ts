import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument, Role, UserStatus } from '../users/schemas/user.schema';

@Injectable()
export class AdminInitializerService implements OnApplicationBootstrap {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly configService: ConfigService,
  ) {}

  async onApplicationBootstrap() {
    const email = this.configService.get<string>('DEFAULT_ADMIN_EMAIL');
    const password = this.configService.get<string>('DEFAULT_ADMIN_PASSWORD');

    if (!email || !password) {
      console.log('[AdminInitializer] DEFAULT_ADMIN_EMAIL or DEFAULT_ADMIN_PASSWORD not set – skipping bootstrap admin creation');
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const phone = this.configService.get<string>('DEFAULT_ADMIN_PHONE') || '+10000000000';
    const name = this.configService.get<string>('DEFAULT_ADMIN_NAME') || 'System Administrator';

    try {
      const existingUser = await this.userModel.findOne({ email: normalizedEmail });
      const hashedPassword = await bcrypt.hash(password, 12);

      if (!existingUser) {
        await this.userModel.create({
          name,
          email: normalizedEmail,
          phone,
          passwordHash: hashedPassword,
          role: Role.ADMIN,
          status: UserStatus.ACTIVE,
        });
        console.log(`[AdminInitializer] Created default admin user: ${normalizedEmail}`);
        return;
      }

      const needsPasswordUpdate = !(await bcrypt.compare(password, existingUser.passwordHash));
      const needsRoleUpdate = existingUser.role !== Role.ADMIN;
      const needsStatusUpdate = existingUser.status !== UserStatus.ACTIVE;
      const needsNameUpdate = existingUser.name !== name;
      const needsPhoneUpdate = existingUser.phone !== phone;

      if (needsPasswordUpdate || needsRoleUpdate || needsStatusUpdate || needsNameUpdate || needsPhoneUpdate) {
        await this.userModel.updateOne(
          { _id: existingUser._id },
          {
            ...(needsPasswordUpdate ? { passwordHash: hashedPassword } : {}),
            ...(needsRoleUpdate ? { role: Role.ADMIN } : {}),
            ...(needsStatusUpdate ? { status: UserStatus.ACTIVE } : {}),
            ...(needsNameUpdate ? { name } : {}),
            ...(needsPhoneUpdate ? { phone } : {}),
          },
        );
        console.log(`[AdminInitializer] Updated existing admin user: ${normalizedEmail}`);
      } else {
        console.log(`[AdminInitializer] Admin user already up-to-date: ${normalizedEmail}`);
      }
    } catch (error) {
      console.error('[AdminInitializer] Failed to ensure default admin user', error);
    }
  }
}

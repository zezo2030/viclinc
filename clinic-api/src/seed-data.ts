import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, Role, UserStatus } from './modules/users/schemas/user.schema';
import { Department, DepartmentDocument } from './modules/departments/schemas/department.schema';
import { DoctorProfile, DoctorProfileDocument, DoctorStatus } from './modules/doctors/schemas/doctor-profile.schema';
import * as bcrypt from 'bcrypt';

async function seedData() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const userModel = app.get<Model<UserDocument>>(getModelToken(User.name));
  const departmentModel = app.get<Model<DepartmentDocument>>(getModelToken(Department.name));
  const doctorModel = app.get<Model<DoctorProfileDocument>>(getModelToken(DoctorProfile.name));

  try {
    // إنشاء أقسام
    const departments = [
      { name: 'أمراض القلب', description: 'تخصص في أمراض القلب والأوعية الدموية' },
      { name: 'العظام', description: 'تخصص في جراحة العظام والمفاصل' },
      { name: 'العيون', description: 'تخصص في أمراض العيون والجراحة' },
      { name: 'الأطفال', description: 'تخصص في طب الأطفال' },
      { name: 'النساء والولادة', description: 'تخصص في أمراض النساء والولادة' },
    ];

    const createdDepartments = [];
    for (const dept of departments) {
      const existing = await departmentModel.findOne({ name: dept.name });
      if (!existing) {
        const created = await departmentModel.create(dept);
        createdDepartments.push(created);
        console.log(`✅ تم إنشاء القسم: ${dept.name}`);
      } else {
        createdDepartments.push(existing);
        console.log(`ℹ️ القسم موجود: ${dept.name}`);
      }
    }

    // إنشاء مستخدم إداري
    const adminUser = await userModel.findOne({ email: 'admin@clinic.com' });
    if (!adminUser) {
      // استخدام rounds 12 مثل auth.service
      const hashedPassword = await bcrypt.hash('password123', 12);
      const createdAdmin = await userModel.create({
        name: 'مدير النظام',
        email: 'admin@clinic.com',
        phone: '+966501234567',
        passwordHash: hashedPassword,
        role: Role.ADMIN,
        status: UserStatus.ACTIVE,
      });
      console.log('✅ تم إنشاء المستخدم الإداري:', createdAdmin.email);
      console.log('   Password hash created with 12 rounds');
    } else {
      console.log('ℹ️ المستخدم الإداري موجود');
      
      // التحقق من كلمة المرور - إذا لزم الأمر، نحدثها
      const testPassword = await bcrypt.compare('password123', adminUser.passwordHash);
      if (!testPassword) {
        console.log('⚠️ كلمة المرور الحالية لا تطابق password123');
        console.log('   جاري تحديث كلمة المرور...');
        const hashedPassword = await bcrypt.hash('password123', 12);
        await userModel.updateOne(
          { email: 'admin@clinic.com' },
          { passwordHash: hashedPassword }
        );
        console.log('✅ تم تحديث كلمة المرور');
      } else {
        console.log('✅ كلمة المرور صحيحة');
      }
    }

    // إنشاء أطباء
    const doctors = [
      {
        name: 'د. أحمد محمد',
        email: 'ahmed@clinic.com',
        phone: '+966501234568',
        departmentId: createdDepartments[0]._id,
        specialization: 'أمراض القلب',
        experience: 10,
        status: DoctorStatus.APPROVED,
      },
      {
        name: 'د. فاطمة علي',
        email: 'fatima@clinic.com',
        phone: '+966501234569',
        departmentId: createdDepartments[1]._id,
        specialization: 'جراحة العظام',
        experience: 8,
        status: DoctorStatus.APPROVED,
      },
      {
        name: 'د. محمد حسن',
        email: 'mohamed@clinic.com',
        phone: '+966501234570',
        departmentId: createdDepartments[2]._id,
        specialization: 'طب العيون',
        experience: 12,
        status: DoctorStatus.APPROVED,
      },
    ];

    for (const doctorData of doctors) {
      // إنشاء مستخدم للطبيب
      const existingUser = await userModel.findOne({ email: doctorData.email });
      if (!existingUser) {
        const hashedPassword = await bcrypt.hash('password123', 12);
        const user = await userModel.create({
          name: doctorData.name,
          email: doctorData.email,
          phone: doctorData.phone,
          passwordHash: hashedPassword,
          role: Role.DOCTOR,
          status: UserStatus.ACTIVE,
        });

        // إنشاء ملف الطبيب
        const existingDoctor = await doctorModel.findOne({ userId: user._id });
        if (!existingDoctor) {
          await doctorModel.create({
            userId: user._id,
            name: doctorData.name,
            licenseNumber: `LIC${Date.now()}${Math.floor(Math.random() * 1000)}`,
            yearsOfExperience: doctorData.experience,
            departmentId: doctorData.departmentId,
            bio: `متخصص في ${doctorData.specialization} مع ${doctorData.experience} سنوات من الخبرة`,
            status: doctorData.status,
          });
          console.log(`✅ تم إنشاء الطبيب: ${doctorData.name}`);
        } else {
          console.log(`ℹ️ الطبيب موجود: ${doctorData.name}`);
        }
      } else {
        console.log(`ℹ️ المستخدم موجود: ${doctorData.email}`);
      }
    }

    // إنشاء مرضى للاختبار
    const patients = [
      {
        name: 'سارة أحمد',
        email: 'sara@example.com',
        phone: '+966501234571',
      },
      {
        name: 'خالد محمد',
        email: 'khalid@example.com',
        phone: '+966501234572',
      },
      {
        name: 'نورا علي',
        email: 'nora@example.com',
        phone: '+966501234573',
      },
    ];

    for (const patientData of patients) {
      const existingUser = await userModel.findOne({ email: patientData.email });
      if (!existingUser) {
        const hashedPassword = await bcrypt.hash('password123', 12);
        await userModel.create({
          name: patientData.name,
          email: patientData.email,
          phone: patientData.phone,
          passwordHash: hashedPassword,
          role: Role.PATIENT,
          status: UserStatus.ACTIVE,
        });
        console.log(`✅ تم إنشاء المريض: ${patientData.name}`);
      } else {
        console.log(`ℹ️ المريض موجود: ${patientData.name}`);
      }
    }

    console.log('\n🎉 تم إنشاء البيانات الأولية بنجاح!');
    console.log('\n📋 بيانات الدخول:');
    console.log('👤 الإداري: admin@clinic.com / password123');
    console.log('👨‍⚕️ الأطباء: ahmed@clinic.com, fatima@clinic.com, mohamed@clinic.com / password123');
    console.log('👥 المرضى: sara@example.com, khalid@example.com, nora@example.com / password123');

  } catch (error) {
    console.error('❌ خطأ في إنشاء البيانات:', error);
  } finally {
    await app.close();
  }
}

seedData();

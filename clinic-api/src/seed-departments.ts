import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DepartmentsService } from './modules/departments/departments.service';

const departmentsData = [
  {
    name: 'الطب النفسي',
    description: 'علاج الاضطرابات النفسية والعقلية',
    icon: 'psychiatry_18314806 copy.webp',
    isActive: true
  },
  {
    name: 'طب الأطفال',
    description: 'رعاية الأطفال من الولادة حتى سن المراهقة',
    icon: 'pediactrics_17327901 copy.webp',
    isActive: true
  },
  {
    name: 'طب العيون',
    description: 'تشخيص وعلاج أمراض العيون',
    icon: 'optometrist_750711 copy.webp',
    isActive: true
  },
  {
    name: 'الطب الباطني',
    description: 'تشخيص وعلاج الأمراض الداخلية',
    icon: 'stomach_7283076 copy.webp',
    isActive: true
  },
  {
    name: 'طب الأعصاب',
    description: 'تشخيص وعلاج أمراض الجهاز العصبي',
    icon: 'brain_11666594 copy.webp',
    isActive: true
  },
  {
    name: 'طب المسالك البولية',
    description: 'تشخيص وعلاج أمراض الجهاز البولي',
    icon: 'urology_17306383 copy.webp',
    isActive: true
  },
  {
    name: 'طب العظام',
    description: 'تشخيص وعلاج أمراض العظام والمفاصل',
    icon: 'orthopedics_11153168 copy.webp',
    isActive: true
  },
  {
    name: 'طب الأورام',
    description: 'تشخيص وعلاج الأورام السرطانية',
    icon: 'oncology_10202691 copy.webp',
    isActive: true
  },
  {
    name: 'طب الكلى',
    description: 'تشخيص وعلاج أمراض الكلى',
    icon: 'kidneys_13940806 copy.webp',
    isActive: true
  },
  {
    name: 'طب النساء والولادة',
    description: 'رعاية صحة المرأة والحمل والولادة',
    icon: 'reproductive_13981126 copy.webp',
    isActive: true
  },
  {
    name: 'الأشعة',
    description: 'التشخيص بالأشعة والتصوير الطبي',
    icon: 'x-ray_469450 copy.webp',
    isActive: true
  }
];

async function seedDepartments() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const departmentsService = app.get(DepartmentsService);

  try {
    console.log('بدء إضافة الأقسام...');
    
    for (const departmentData of departmentsData) {
      try {
        const department = await departmentsService.create(departmentData);
        console.log(`تم إضافة القسم: ${department.name}`);
      } catch (error) {
        console.log(`القسم ${departmentData.name} موجود بالفعل أو حدث خطأ:`, error.message);
      }
    }
    
    console.log('تم الانتهاء من إضافة الأقسام');
  } catch (error) {
    console.error('حدث خطأ أثناء إضافة الأقسام:', error);
  } finally {
    await app.close();
  }
}

seedDepartments();

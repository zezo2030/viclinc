import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DepartmentsService } from './modules/departments/departments.service';

async function cleanDepartments() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const departmentsService = app.get(DepartmentsService);

  try {
    console.log('بدء حذف جميع الأقسام...');
    
    // جلب جميع الأقسام
    const departments = await departmentsService.findAll();
    console.log(`تم العثور على ${departments.length} قسم`);
    
    // حذف جميع الأقسام
    for (const department of departments) {
      try {
        await departmentsService.remove((department as any)._id);
        console.log(`تم حذف القسم: ${(department as any).name}`);
      } catch (error) {
        console.log(`خطأ في حذف القسم ${(department as any).name}:`, error.message);
      }
    }
    
    console.log('تم الانتهاء من حذف جميع الأقسام');
  } catch (error) {
    console.error('حدث خطأ أثناء حذف الأقسام:', error);
  } finally {
    await app.close();
  }
}

cleanDepartments();

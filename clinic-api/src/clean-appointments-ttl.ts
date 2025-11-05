import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getModelToken, getConnectionToken } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { Appointment, AppointmentDocument } from './modules/schedule/schemas/appointment.schema';

async function cleanAppointmentsTTL() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const appointmentModel = app.get<Model<AppointmentDocument>>(getModelToken(Appointment.name));
  const connection = app.get<Connection>(getConnectionToken());

  try {
    console.log('بدء تنظيف المواعيد من holdExpiresAt...');
    
    // إزالة TTL index من قاعدة البيانات
    try {
      if (!connection.db) {
        console.log('تحذير: connection.db غير متاح');
        return;
      }
      
      const collection = connection.db.collection('appointments');
      
      // جلب جميع الفهارس
      const indexes = await collection.indexes();
      console.log('الفهارس الموجودة:', indexes.map(idx => idx.name));
      
      // محاولة حذف الفهرس بأسماء محتملة
      const possibleIndexNames = ['holdExpiresAt_1', 'holdExpiresAt_1_expireAfterSeconds_0'];
      let deleted = false;
      
      for (const indexName of possibleIndexNames) {
        try {
          await collection.dropIndex(indexName);
          console.log(`✓ تم حذف TTL index: ${indexName}`);
          deleted = true;
        } catch (err: any) {
          if (err.code === 27 || err.message?.includes('index not found')) {
            // الفهرس غير موجود، لا مشكلة
          } else {
            console.log(`تحذير: لم يتم حذف الفهرس ${indexName}:`, err.message);
          }
        }
      }
      
      // محاولة حذف الفهرس باستخدام المفتاح (يحتاج اسم string)
      if (!deleted) {
        try {
          // البحث عن اسم الفهرس الذي يحتوي على holdExpiresAt
          const holdExpiresIndex = indexes.find(idx => 
            idx.key && (idx.key as any).holdExpiresAt
          );
          if (holdExpiresIndex && holdExpiresIndex.name) {
            await collection.dropIndex(holdExpiresIndex.name);
            console.log(`✓ تم حذف TTL index: ${holdExpiresIndex.name}`);
          }
        } catch (err: any) {
          if (err.code === 27 || err.message?.includes('index not found')) {
            console.log('✓ TTL index غير موجود (ربما تم حذفه مسبقاً)');
          } else {
            console.log('تحذير: لم يتم حذف TTL index:', err.message);
          }
        }
      }
    } catch (error: any) {
      console.log('تحذير: خطأ في حذف الفهرس:', error.message);
    }
    
    // إزالة holdExpiresAt من جميع المواعيد
    const result = await appointmentModel.updateMany(
      { holdExpiresAt: { $exists: true } },
      { $unset: { holdExpiresAt: "" } }
    );
    
    console.log(`✓ تم تحديث ${result.modifiedCount} موعد`);
    console.log('تم الانتهاء من تنظيف المواعيد');
  } catch (error) {
    console.error('حدث خطأ أثناء تنظيف المواعيد:', error);
  } finally {
    await app.close();
  }
}

cleanAppointmentsTTL();


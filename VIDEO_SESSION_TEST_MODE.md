# وضع الاختبار لمكالمات الفيديو

## نظرة عامة

تم إضافة إمكانية تعطيل قيد 10 دقائق لبدء مكالمات الفيديو في وضع الاختبار/التطوير.

## المشكلة

افتراضياً، لا يمكن بدء مكالمة فيديو إلا قبل 10 دقائق من وقت الموعد. هذا القيد مفيد في الإنتاج لكنه يعيق الاختبار في التطوير.

## الحل

تم إضافة خيار لتعطيل هذا التحقق في وضع الاختبار/التطوير.

## الطرق لتفعيل وضع الاختبار

### الطريقة 1: عبر Environment Variable (موصى بها)

أضف في ملف `.env`:
```env
DISABLE_VIDEO_TIME_CHECK=true
```

### الطريقة 2: تلقائياً في Development Mode

إذا كان `NODE_ENV=development` أو `NODE_ENV=test`، سيتم تعطيل التحقق تلقائياً.

## كيفية الاستخدام

### للتطوير المحلي:

1. افتح ملف `.env` في `clinic-api/`
2. أضف:
   ```env
   NODE_ENV=development
   # أو
   DISABLE_VIDEO_TIME_CHECK=true
   ```

3. أعد تشغيل الخادم:
   ```bash
   npm run start:dev
   ```

### للإنتاج:

**⚠️ مهم**: لا تقم بتفعيل `DISABLE_VIDEO_TIME_CHECK=true` في الإنتاج!

في الإنتاج، يجب أن يكون:
```env
NODE_ENV=production
# لا تضيف DISABLE_VIDEO_TIME_CHECK
```

## التحقق من الحالة

### في Development Mode:
- `NODE_ENV=development` → التحقق معطل ✅
- `NODE_ENV=test` → التحقق معطل ✅
- `DISABLE_VIDEO_TIME_CHECK=true` → التحقق معطل ✅

### في Production Mode:
- `NODE_ENV=production` + لا يوجد `DISABLE_VIDEO_TIME_CHECK` → التحقق مفعّل ✅

## ملاحظات مهمة

1. **للاختبار فقط**: استخدم هذا الخيار فقط في التطوير والاختبار
2. **الإنتاج**: لا تعطل هذا التحقق في الإنتاج لأنه يمنع بدء المكالمات قبل الوقت المحدد
3. **الأمان**: هذا التحقق يضمن أن المكالمات تبدأ في الوقت المناسب فقط

## الكود المحدث

الملف: `clinic-api/src/modules/sessions/services/video-session.service.ts`

```typescript
// فحص غرفة الانتظار (T-10m)
// يمكن تعطيل هذا التحقق في وضع الاختبار/التطوير
const appointmentStart = dayjs(appointment.startAt);
const now = dayjs();
const disableTimeCheck = process.env.DISABLE_VIDEO_TIME_CHECK === 'true' || 
                         process.env.NODE_ENV === 'development' ||
                         process.env.NODE_ENV === 'test';

if (!disableTimeCheck) {
  const timeUntilStart = appointmentStart.diff(now, 'minute');
  
  if (timeUntilStart > 10) {
    throw new BadRequestException(
      `Video session is not available yet. Please wait ${timeUntilStart - 10} more minutes.`
    );
  }
}
```

## اختبار سريع

بعد إضافة `DISABLE_VIDEO_TIME_CHECK=true` في `.env`:

1. أعد تشغيل الخادم
2. حاول بدء مكالمة فيديو من أي موعد (حتى لو كان في المستقبل البعيد)
3. يجب أن تعمل المكالمة مباشرة ✅

## ملفات محدثة

- ✅ `clinic-api/src/modules/sessions/services/video-session.service.ts`
- ✅ `env.template` (إضافة ملاحظة)

---

**تاريخ التحديث**: 2025-01-05  
**الحالة**: ✅ جاهز للاستخدام






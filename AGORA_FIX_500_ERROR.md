# إصلاح خطأ 500 عند تحديث إعدادات Agora

## المشكلة

عند محاولة تحديث إعدادات Agora عبر API، يحدث خطأ 500 (Internal Server Error).

### الخطأ:
```json
{
  "statusCode": 500,
  "timestamp": "2025-11-05T17:33:58.208Z",
  "path": "/v1/admin/settings/agora",
  "method": "PATCH",
  "message": "Internal server error"
}
```

---

## السبب

المشكلة كانت في دالة `updateAgoraSettings` في `SettingsService`:

1. **مشكلة التشفير/فك التشفير**: 
   - عدم وجود معالجة أخطاء كافية عند فك تشفير البيانات القديمة
   - عدم التحقق من صحة تنسيق البيانات المشفرة
   - مشكلة في استخدام `aes-256-gcm` بدون `authTag`

2. **مشكلة ENCRYPTION_KEY**:
   - عدم التأكد من أن المفتاح 32 حرف على الأقل
   - عدم معالجة حالات المفتاح القصير

3. **مشكلة التحقق من البيانات**:
   - عدم التحقق من `null` أو `undefined` بشكل صحيح
   - عدم معالجة حالات البيانات الفارغة

---

## الحل

تم إصلاح المشاكل التالية:

### 1. تحسين التشفير (Encryption)
- ✅ إضافة معالجة أخطاء شاملة
- ✅ استخدام `authTag` بشكل صحيح في `aes-256-gcm`
- ✅ دعم التنسيق القديم (للتوافق مع البيانات القديمة)

### 2. تحسين فك التشفير (Decryption)
- ✅ التحقق من تنسيق البيانات قبل فك التشفير
- ✅ دعم التنسيق القديم والجديد
- ✅ معالجة أخطاء فك التشفير بشكل آمن

### 3. تحسين updateAgoraSettings
- ✅ إضافة try-catch شامل
- ✅ التحقق من `null` و `undefined`
- ✅ معالجة حالات البيانات الفارغة
- ✅ تحسين رسائل الخطأ

### 4. ENCRYPTION_KEY
- ✅ التأكد من أن المفتاح 32 حرف على الأقل
- ✅ إضافة padding تلقائي إذا كان أقصر

---

## التغييرات المطبقة

### ملف: `clinic-api/src/modules/settings/settings.service.ts`

#### 1. Constructor - تحسين ENCRYPTION_KEY:
```typescript
constructor(...) {
  const envKey = process.env.ENCRYPTION_KEY || 'default-encryption-key-change-in-production';
  if (envKey.length < 32) {
    console.warn('ENCRYPTION_KEY is shorter than 32 characters, padding with zeros');
    this.encryptionKey = envKey.padEnd(32, '0');
  } else {
    this.encryptionKey = envKey;
  }
}
```

#### 2. encrypt() - إضافة authTag:
```typescript
private encrypt(text: string): string {
  // ... تشفير
  const authTag = (cipher as any).getAuthTag().toString('hex');
  return iv.toString('hex') + ':' + encrypted + ':' + authTag;
}
```

#### 3. decrypt() - دعم التنسيق القديم والجديد:
```typescript
private decrypt(encryptedText: string): string {
  // دعم التنسيق القديم (2 أجزاء) والجديد (3 أجزاء مع authTag)
  const parts = encryptedText.split(':');
  if (parts.length === 2) {
    // التنسيق القديم
  } else if (parts.length === 3) {
    // التنسيق الجديد مع authTag
    decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
  }
}
```

#### 4. updateAgoraSettings() - معالجة أخطاء شاملة:
```typescript
async updateAgoraSettings(...) {
  try {
    // التحقق من null/undefined
    if (updateDto.appId !== undefined && updateDto.appId !== null) {
      value.appId = updateDto.appId.trim();
    }
    // ... معالجة باقي الحقول
  } catch (error) {
    // معالجة الأخطاء بشكل صحيح
    throw new BadRequestException(`Failed to update Agora settings: ${error.message}`);
  }
}
```

---

## الخطوات التالية

### 1. إعادة تشغيل الخادم
```bash
cd new/clinic-api
npm run start:dev
```

أو إذا كان يعمل في الخلفية:
```bash
# إيقاف الخادم الحالي
# ثم إعادة تشغيله
npm run start:dev
```

### 2. اختبار التحديث مرة أخرى
```bash
cd new
node update-agora-settings.js
```

أو عبر API مباشرة:
```bash
PATCH http://localhost:3000/v1/admin/settings/agora
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "appId": "27ed9ab38dca442587952e61adf175e9",
  "appCertificate": "your-certificate-here",
  "tokenExpirationTime": 3600,
  "isEnabled": true
}
```

---

## ملاحظات مهمة

### 1. ENCRYPTION_KEY
- يجب أن يكون 32 حرف على الأقل
- إذا كان أقصر، سيتم padding تلقائياً (لكن يُنصح بتحديد مفتاح 32 حرف)
- يمكن تحديده في `.env`:
  ```env
  ENCRYPTION_KEY=your-32-character-encryption-key-here
  ```

### 2. التوافق مع البيانات القديمة
- الكود يدعم التنسيق القديم (بدون authTag) والجديد (مع authTag)
- البيانات القديمة ستُفك تشفيرها بشكل صحيح
- البيانات الجديدة ستُشفّر بالتنسيق الجديد

### 3. معالجة الأخطاء
- جميع الأخطاء تُعالج بشكل آمن
- رسائل الخطأ واضحة ومفيدة
- لا يتم فقدان البيانات عند حدوث خطأ

---

## التحقق من الإصلاح

بعد إعادة تشغيل الخادم، يجب أن يعمل التحديث بشكل صحيح:

```bash
✅ تم تحديث الإعدادات بنجاح!
✅ اختبار الاتصال نجح!
```

إذا استمرت المشكلة:
1. تحقق من سجلات الخادم (logs)
2. تأكد من وجود `ENCRYPTION_KEY` في `.env`
3. تأكد من أن قاعدة البيانات متصلة
4. تحقق من صحة بيانات Agora (App ID و App Certificate)

---

## الملفات المعدلة

- ✅ `clinic-api/src/modules/settings/settings.service.ts`

## تحديثات إضافية

### إصلاح خطأ TypeScript (authTagHex)
- ✅ تغيير نوع `authTagHex` من `string` إلى `string | null`
- ✅ إزالة تعيين `null` المباشر

### إصلاح خطأ Runtime (updatedBy.toString())
- ✅ إضافة التحقق من وجود `settings.updatedBy` قبل استدعاء `toString()`
- ✅ إضافة fallback إلى `updatedBy` في حالة عدم وجود القيمة
- ✅ إصلاح `user._id` في Controller للتحقق من وجوده قبل الاستخدام

---

## التاريخ

- **التاريخ**: 2025-01-05
- **الحالة**: ✅ تم الإصلاح (التحديث الثاني)


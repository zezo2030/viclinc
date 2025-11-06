# دليل إعداد متغيرات Agora

## طريقتان لإعداد Agora

هناك طريقتان لإعداد بيانات Agora (App ID و App Certificate):

---

## ✅ الطريقة الأولى: عبر Environment Variables (موصى بها للإنتاج)

### المميزات:
- ✅ آمنة - لا تُحفظ في قاعدة البيانات
- ✅ سهلة التغيير في بيئة الإنتاج
- ✅ مناسبة للتكامل مع CI/CD
- ✅ يمكن استخدام قيم مختلفة لكل بيئة (Development, Staging, Production)

### الخطوات:

#### 1. إضافة المتغيرات في ملف `.env`

افتح/أنشئ ملف `.env` في مجلد `new/clinic-api/`:

```env
# Encryption Key (مطلوب لتشفير البيانات الحساسة)
ENCRYPTION_KEY=your-32-character-encryption-key-change-in-production

# Agora Configuration
AGORA_APP_ID=your-agora-app-id-here
AGORA_APP_CERTIFICATE=your-agora-app-certificate-here
AGORA_TOKEN_EXPIRATION_TIME=3600
AGORA_ENABLED=true
```

#### 2. الحصول على بيانات Agora

1. سجل دخولك إلى [Agora Console](https://console.agora.io)
2. اختر أو أنشئ مشروع جديد
3. انسخ **App ID** من قسم "Project Info"
4. انسخ **App Certificate** من نفس القسم (قد تحتاج إلى تفعيله أولاً)

#### 3. مثال ملف `.env` كامل:

```env
# Database
MONGO_URI=mongodb://localhost:27017/clinic

# JWT
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRES_IN=24h

# Encryption (مهم لتشفير App Certificate في قاعدة البيانات)
ENCRYPTION_KEY=my-super-secret-32-char-key!!

# Agora Video SDK
AGORA_APP_ID=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
AGORA_APP_CERTIFICATE=1234567890abcdef1234567890abcdef12345678
AGORA_TOKEN_EXPIRATION_TIME=3600
AGORA_ENABLED=true
```

#### 4. إعادة تشغيل الباك اند

```bash
cd new/clinic-api
npm run start:dev
```

---

## ✅ الطريقة الثانية: عبر Admin Dashboard (موصى بها للاختبار والتطوير)

### المميزات:
- ✅ لا تحتاج إعادة تشغيل الباك اند
- ✅ سهلة التغيير من واجهة المستخدم
- ✅ مناسبة للاختبار السريع

### الخطوات:

#### 1. تسجيل الدخول كأدمن

#### 2. الوصول إلى Settings

افتح Admin Dashboard وانتقل إلى:
```
Settings → Agora Configuration
```

أو مباشرة عبر API:

```
GET /admin/settings/agora
```

#### 3. تحديث الإعدادات

```
PATCH /admin/settings/agora
Headers: Authorization: Bearer {admin_token}
Body: {
  "appId": "your-agora-app-id",
  "appCertificate": "your-agora-app-certificate",
  "tokenExpirationTime": 3600,
  "isEnabled": true
}
```

#### 4. اختبار الاتصال

```
POST /admin/settings/agora/test
Headers: Authorization: Bearer {admin_token}
```

---

## 🔄 أولوية التحميل

النظام يتحقق من الإعدادات بالترتيب التالي:

1. **أولاً**: قاعدة البيانات (إعدادات من Admin Dashboard)
2. **ثانياً**: Environment Variables (من ملف `.env`)

**ملاحظة**: إذا وُجدت الإعدادات في قاعدة البيانات، سيتم استخدامها بدلاً من Environment Variables.

---

## 📋 متغيرات Environment المطلوبة

| المتغير | الوصف | مثال | مطلوب |
|---------|-------|------|-------|
| `ENCRYPTION_KEY` | مفتاح التشفير (32 حرف) | `my-32-char-encryption-key!!` | ✅ نعم |
| `AGORA_APP_ID` | معرف تطبيق Agora | `a1b2c3d4e5f6...` | ⚠️ إذا لم تستخدم Admin Dashboard |
| `AGORA_APP_CERTIFICATE` | شهادة تطبيق Agora | `1234567890abcdef...` | ⚠️ إذا لم تستخدم Admin Dashboard |
| `AGORA_TOKEN_EXPIRATION_TIME` | مدة صلاحية Token (بالثواني) | `3600` | ❌ اختياري (افتراضي: 3600) |
| `AGORA_ENABLED` | تفعيل/تعطيل Agora | `true` | ❌ اختياري (افتراضي: false) |

---

## 🔐 الأمان

### Environment Variables:
- ✅ **مشفر**: App Certificate يُشفر قبل الحفظ في قاعدة البيانات
- ✅ **محمي**: لا يتم إرسال App Certificate للتطبيق
- ✅ **آمن**: يُستخدم فقط App ID و Token في التطبيق

### ملف `.env`:
- ⚠️ **مهم**: لا ترفع ملف `.env` إلى Git
- ✅ تأكد من وجود `.env` في `.gitignore`
- ✅ استخدم قيم مختلفة لكل بيئة

---

## 🚀 إعداد سريع

### للتطوير المحلي:

```bash
# 1. أنشئ ملف .env في new/clinic-api/
cd new/clinic-api
cp ../env.template .env

# 2. عدّل ملف .env وأضف بيانات Agora
# AGORA_APP_ID=...
# AGORA_APP_CERTIFICATE=...
# ENCRYPTION_KEY=...

# 3. أعد تشغيل الباك اند
npm run start:dev
```

### للإنتاج:

```bash
# 1. أنشئ ملف .env في الخادم
nano /path/to/clinic-api/.env

# 2. أضف جميع المتغيرات
# AGORA_APP_ID=...
# AGORA_APP_CERTIFICATE=...
# ENCRYPTION_KEY=...

# 3. أعد تشغيل الخادم
pm2 restart clinic-api
# أو
docker-compose restart api
```

---

## 🔍 التحقق من الإعدادات

### 1. عبر API:

```bash
# الحصول على App ID (عام)
GET /sessions/video/app-id

# الحصول على الإعدادات (يحتاج Admin)
GET /admin/settings/agora
Headers: Authorization: Bearer {admin_token}
```

### 2. اختبار الاتصال:

```bash
POST /admin/settings/agora/test
Headers: Authorization: Bearer {admin_token}
```

**الاستجابة المتوقعة:**
```json
{
  "success": true,
  "message": "Agora configuration is valid",
  "timestamp": "2024-01-15T10:00:00.000Z"
}
```

---

## ❓ استكشاف الأخطاء

### خطأ: "Agora service is not configured"

**الأسباب المحتملة:**
1. لم تُضف Environment Variables في ملف `.env`
2. لم تُعد إعدادات Agora من Admin Dashboard
3. `AGORA_ENABLED=false`

**الحل:**
- أضف المتغيرات في `.env` وأعد التشغيل
- أو استخدم Admin Dashboard لإضافة الإعدادات

### خطأ: "Agora credentials are missing"

**السبب:** `AGORA_APP_ID` أو `AGORA_APP_CERTIFICATE` فارغ

**الحل:** تأكد من إضافة القيم الصحيحة في `.env`

### خطأ: "Failed to generate test token"

**الأسباب المحتملة:**
1. App ID غير صحيح
2. App Certificate غير صحيح
3. مشكلة في التشفير/فك التشفير

**الحل:**
- تحقق من صحة البيانات من Agora Console
- تأكد من أن `ENCRYPTION_KEY` موجود وصحيح (32 حرف)

---

## 📝 ملاحظات مهمة

1. **ENCRYPTION_KEY**: يجب أن يكون **32 حرف** على الأقل
2. **App Certificate**: يُشفر تلقائياً قبل الحفظ في قاعدة البيانات
3. **App ID**: يمكن إرساله للتطبيق (آمن)
4. **App Certificate**: **لا يُرسل أبداً** للتطبيق (محمي)

---

## 🎯 الملفات المهمة

- `new/clinic-api/.env` - ملف Environment Variables
- `new/env.template` - قالب ملف Environment Variables
- `new/clinic-api/src/modules/settings/settings.service.ts` - منطق قراءة الإعدادات
- `new/clinic-api/src/modules/sessions/services/agora.service.ts` - استخدام الإعدادات

---

## ✅ الخطوات التالية

1. ✅ إضافة Environment Variables في `.env`
2. ✅ إعادة تشغيل الباك اند
3. ✅ اختبار الاتصال
4. ✅ البدء في ربط تطبيق Flutter








# دليل إعداد وربط Agora في الباك اند

## نظرة عامة

هذا الدليل يشرح كيفية إعداد وربط Agora Video SDK مع الباك اند لتطبيق العيادة.

## 1. متطلبات Agora

قبل البدء، تحتاج إلى:
- حساب Agora من [agora.io](https://www.agora.io)
- **App ID**: معرف التطبيق في Agora
- **App Certificate**: شهادة التطبيق (لإنشاء Tokens)

## 2. إعداد Agora في الباك اند

### أ) الحصول على بيانات Agora

1. سجل دخولك إلى [Agora Console](https://console.agora.io)
2. أنشئ مشروع جديد أو اختر مشروع موجود
3. انسخ **App ID** و **App Certificate**

### ب) إعداد البيانات في الباك اند

#### عبر Admin Dashboard:
```
POST /admin/settings/agora
Headers: Authorization: Bearer {admin_token}
Body: {
  "appId": "YOUR_AGORA_APP_ID",
  "appCertificate": "YOUR_AGORA_APP_CERTIFICATE",
  "tokenExpirationTime": 3600,  // ثانية (ساعة واحدة)
  "isEnabled": true
}
```

#### أو عبر Swagger:
1. افتح `/api` في المتصفح
2. ابحث عن `Settings` API
3. استخدم `PATCH /admin/settings/agora`
4. أدخل بيانات Agora

### ج) اختبار الاتصال

```
POST /admin/settings/agora/test
Headers: Authorization: Bearer {admin_token}
```

يجب أن تحصل على:
```json
{
  "success": true,
  "message": "Agora configuration is valid",
  "timestamp": "2024-01-15T10:00:00.000Z"
}
```

## 3. API Endpoints المتاحة

### أ) الحصول على App ID (Endpoint عام)

```
GET /sessions/video/app-id
```

**الاستجابة:**
```json
{
  "appId": "YOUR_AGORA_APP_ID",
  "isEnabled": true
}
```

**ملاحظة:** هذا Endpoint يمكن استخدامه بدون Authentication للحصول على App ID فقط.

### ب) طلب Video Token

```
POST /sessions/video/token
Headers: Authorization: Bearer {user_token}
Body: {
  "appointmentId": "64f1a2b3c4d5e6f7g8h9i0j1",
  "role": "patient" | "doctor"
}
```

**الاستجابة:**
```json
{
  "token": "006...",
  "channelName": "appointment-64f1a2b3c4d5e6f7g8h9i0j1",
  "uid": 12345,
  "expirationTime": 3600,
  "appId": "YOUR_AGORA_APP_ID",
  "sessionStatus": "ACTIVE",
  "canJoin": true
}
```

### ج) الحصول على معلومات الجلسة

```
GET /sessions/video/{appointmentId}
Headers: Authorization: Bearer {user_token}
```

### د) الانضمام/مغادرة/إنهاء الجلسة

```
POST /sessions/video/{appointmentId}/join
POST /sessions/video/{appointmentId}/leave
POST /sessions/video/{appointmentId}/end  (للطبيب فقط)
```

## 4. كيفية عمل النظام

### التدفق الكامل:

```
1. المريض/الطبيب يريد بدء مكالمة فيديو
   ↓
2. التطبيق يطلب Video Token من الباك اند
   POST /sessions/video/token
   ↓
3. الباك اند يتحقق من:
   - الموعد موجود ومؤكد (CONFIRMED)
   - المستخدم مخول (طبيب أو مريض نفس الموعد)
   - الدفع مكتمل (للمواعيد المطلوبة)
   - الوقت بين (T-10 دقائق) إلى انتهاء الموعد
   ↓
4. الباك اند ينشئ/يستخدم VideoSession
   ↓
5. الباك اند يولد Agora Token عبر AgoraService
   ↓
6. الباك اند يرجع:
   - Token
   - Channel Name
   - UID
   - App ID
   ↓
7. التطبيق يستخدم هذه البيانات للانضمام لقناة Agora
   ↓
8. Agora يتولى نقل الفيديو/الصوت
```

## 5. أمان النظام

### التحقق من الصلاحيات:

1. **JWT Authentication**: جميع Endpoints تحتاج Token
2. **التحقق من الموعد**: المستخدم يجب أن يكون الطبيب أو المريض
3. **التحقق من الوقت**: لا يمكن الدخول قبل 10 دقائق من الموعد
4. **Token Expiration**: Tokens تنتهي بعد فترة محددة (افتراضياً ساعة)

### التشفير:

- **App Certificate** مشفر في قاعدة البيانات
- لا يتم إرسال App Certificate للتطبيق (الأمان فقط)
- فقط App ID و Token يتم إرسالهما

## 6. إعدادات Agora

### القيم الافتراضية:

```typescript
{
  tokenExpirationTime: 3600,  // ساعة واحدة (بالثواني)
  isEnabled: false,           // معطل افتراضياً حتى يتم التكوين
}
```

### نطاق القيم:

- `tokenExpirationTime`: 60 - 86400 ثانية (دقيقة إلى يوم)
- `isEnabled`: true/false

## 7. أمثلة الاستخدام

### مثال: طلب Token من Flutter/Dart

```dart
// الحصول على App ID أولاً
final appIdResponse = await http.get(
  Uri.parse('$baseUrl/sessions/video/app-id'),
);

// طلب Token
final tokenResponse = await http.post(
  Uri.parse('$baseUrl/sessions/video/token'),
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer $token',
  },
  body: jsonEncode({
    'appointmentId': appointmentId,
    'role': 'patient', // or 'doctor'
  }),
);

final tokenData = jsonDecode(tokenResponse.body);
// tokenData['token']
// tokenData['channelName']
// tokenData['uid']
// tokenData['appId']
```

### مثال: استخدام في Agora RTC Engine

```typescript
import { RtcEngine } from 'agora-rtc-sdk-ng';

const engine = RtcEngine.create(appId);

await engine.joinChannel(
  token,
  channelName,
  uid,
  {
    clientRoleType: ClientRoleType.Broadcaster,
  }
);
```

## 8. استكشاف الأخطاء

### خطأ: "Agora service is not configured"
**الحل:** تأكد من إعداد Agora Settings عبر Admin Dashboard

### خطأ: "Appointment must be confirmed"
**الحل:** يجب أن يكون الموعد بحالة `CONFIRMED` وليس `PENDING_CONFIRM`

### خطأ: "Video session is not available yet"
**الحل:** يمكن الدخول فقط قبل 10 دقائق من وقت الموعد

### خطأ: "Failed to generate Agora token"
**الحل:** 
- تأكد من صحة App ID و App Certificate
- تأكد من أن App Certificate مشفر بشكل صحيح

## 9. ملفات مهمة

### في الباك اند:
- `src/modules/sessions/services/agora.service.ts` - خدمة Agora الرئيسية
- `src/modules/sessions/services/video-session.service.ts` - إدارة جلسات الفيديو
- `src/modules/sessions/controllers/video-session.controller.ts` - API Endpoints
- `src/modules/settings/settings.service.ts` - إدارة إعدادات Agora

### الحزم المستخدمة:
- `agora-token` - لتوليد Tokens
- `agora-access-token` - بديل لتوليد Tokens

## 10. الخطوات التالية

1. ✅ إعداد Agora في الباك اند
2. ⏭️ ربط تطبيق Flutter مع Agora
3. ⏭️ اختبار مكالمات الفيديو
4. ⏭️ إضافة ميزات إضافية (التسجيل، الشاشة، إلخ)

## ملاحظات مهمة

- **App Certificate** لا يجب أن يخرج من الباك اند أبداً
- Tokens لها فترة صلاحية محدودة
- يجب التحقق من حالة الموعد قبل السماح بالدخول
- UID يتم توليده من userId لمنع التكرار






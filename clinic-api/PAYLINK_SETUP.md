# إعداد Paylink API - بيئة الاختبار

## الخطوات

### 1. الحصول على API Credentials

#### للاختبار (Testing Environment):
- **API URL**: `https://restpilot.paylink.sa`
- **API ID**: `APP_ID_1123453311` (افتراضي للاختبار)
- **Secret Key**: `0662abb5-13c7-38ab-cd12-236e58f43766` (افتراضي للاختبار)

#### للحصول على credentials خاصة بك:
1. سجّل في [Paylink Developer Portal](https://developer.paylink.sa)
2. أو احصل على credentials من [my.paylink.sa](https://my.paylink.sa) بعد الاشتراك

### 2. تحديث ملف `.env`

افتح ملف `.env` في مجلد `clinic-api` وأضف/حدّث القيم التالية:

```env
# Paylink Configuration (Testing Environment)
PAYLINK_API_URL=https://restpilot.paylink.sa
PAYLINK_API_ID=your-api-id-here
PAYLINK_SECRET_KEY=your-secret-key-here
PAYLINK_MODE=test
PAYLINK_WEBHOOK_URL=http://your-domain.com/api/v1/payments/webhook
```

### 3. مثال على الإعدادات

```env
# استخدام credentials الاختبار الافتراضية
PAYLINK_API_URL=https://restpilot.paylink.sa
PAYLINK_API_ID=APP_ID_1123453311
PAYLINK_SECRET_KEY=0662abb5-13c7-38ab-cd12-236e58f43766
PAYLINK_MODE=test
PAYLINK_WEBHOOK_URL=http://localhost:3000/api/v1/payments/webhook
```

### 4. التحقق من الإعدادات

بعد تحديث ملف `.env`:
1. أعد تشغيل Backend server
2. تحقق من السجلات (logs) - يجب أن ترى:
   ```
   PaylinkService initialized - Mode: test, API URL: https://restpilot.paylink.sa, API ID: APP_ID_1123453311
   ```

### 5. ملاحظات مهمة

- ✅ **بيئة الاختبار**: استخدم `PAYLINK_MODE=test` و `PAYLINK_API_URL=https://restpilot.paylink.sa`
- ✅ **بيئة الإنتاج**: استخدم `PAYLINK_MODE=live` و `PAYLINK_API_URL=https://rest.paylink.sa`
- ⚠️ **لا تستخدم credentials الاختبار في الإنتاج**
- 🔒 **احفظ credentials بشكل آمن ولا تشاركها**

### 6. Authentication

الكود يقوم تلقائياً بـ:
1. Authentication مع Paylink API عند الحاجة
2. حفظ Token لمدة ساعة
3. إعادة Authentication تلقائياً عند انتهاء صلاحية Token

### 7. Webhook URL

للاستقبال إشعارات الدفع من Paylink، تأكد من:
- أن `PAYLINK_WEBHOOK_URL` يشير إلى endpoint صحيح
- أن الـ endpoint متاح من الإنترنت (للإنتاج)
- أن الـ endpoint لا يحتاج authentication (webhook public)

## استكشاف الأخطاء

### خطأ "Forbidden":
- تحقق من أن `PAYLINK_API_ID` و `PAYLINK_SECRET_KEY` صحيحة
- تأكد من استخدام URL الصحيح للبيئة (test vs production)

### خطأ "Authentication failed":
- تحقق من صحة credentials
- تأكد من الاتصال بالإنترنت
- تحقق من أن Paylink API متاح

## روابط مفيدة

- [Paylink Developer Documentation](https://developer.paylink.sa/docs)
- [Environment Setup](https://developer.paylink.sa/docs/environment-setup)
- [Authentication Guide](https://developer.paylink.sa/docs/authentication)


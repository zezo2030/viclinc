# إعداد التطبيق للعمل على جهاز فعلي

## 📱 نظرة عامة

هذا الدليل يشرح كيفية تشغيل تطبيق Flutter على جهاز موبايل فعلي مع استمرار عمل الباكند على localhost.

## ✅ المتطلبات

1. الباكند يعمل على `localhost:3000`
2. جهاز الموبايل متصل بنفس شبكة WiFi التي يتصل بها الكمبيوتر
3. معرفة IP الكمبيوتر على الشبكة المحلية

## 🔧 الخطوات

### 1. الحصول على IP الكمبيوتر

#### Windows:
```bash
ipconfig
```
ابحث عن `IPv4 Address` تحت `Wireless LAN adapter` أو `Ethernet adapter`

#### Mac/Linux:
```bash
ifconfig
# أو
ip addr
```

**مثال**: `192.168.1.3`

### 2. التأكد من أن الباكند يستمع على جميع الـ Interfaces

الباكند يجب أن يعمل على `0.0.0.0:3000` وليس فقط `localhost:3000`.

في `clinic-api/src/main.ts`:
```typescript
await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
```

✅ هذا موجود بالفعل في الكود.

### 3. تحديث إعدادات التطبيق

افتح `patien_app/lib/config/api_config.dart`:

```dart
// ⚠️ غيّر هذا الـ IP إلى IP جهازك
static const String _localIP = '192.168.1.3'; // غيّر هنا

// تأكد من تفعيل استخدام IP للأجهزة الفعلية
static const bool _usePhysicalDeviceIP = true; // يجب أن يكون true
```

### 4. التأكد من Firewall

#### Windows:
1. افتح Windows Defender Firewall
2. اضغط "Allow an app or feature through Windows Defender Firewall"
3. تأكد من أن Node.js مسموح له
4. أو أضف قاعدة جديدة للسماح بالمنفذ 3000

#### Mac:
```bash
# في System Preferences > Security & Privacy > Firewall
# تأكد من السماح لـ Node.js
```

### 5. اختبار الاتصال

#### من جهاز الموبايل:
افتح المتصفح في جهاز الموبايل واذهب إلى:
```
http://192.168.1.3:3000/v1/health
```

يجب أن ترى استجابة JSON.

#### من التطبيق:
```bash
cd patien_app
flutter run
```

## 📋 ملخص الإعدادات

### في `api_config.dart`:
```dart
static const String _localIP = '192.168.1.3'; // IP جهازك
static const bool _usePhysicalDeviceIP = true; // للأجهزة الفعلية
```

### في الباكند:
- يعمل على `0.0.0.0:3000` ✅
- CORS مفعّل للجميع في Development ✅

## 🔍 التحقق من الاتصال

### 1. تحقق من IP الصحيح:
```bash
# Windows
ipconfig | findstr IPv4

# Mac/Linux  
ifconfig | grep "inet "
```

### 2. تحقق من أن الباكند يستمع على جميع الـ Interfaces:
```bash
# يجب أن ترى:
# Server is running on http://0.0.0.0:3000
```

### 3. اختبر من جهاز الموبايل:
افتح المتصفح في الموبايل:
```
http://YOUR_IP:3000/v1/health
```

## 🐛 استكشاف الأخطاء

### المشكلة: "لا يمكن الاتصال بالخادم"

**الحل:**
1. تأكد من أن IP صحيح
2. تأكد من أن الموبايل والكمبيوتر على نفس الشبكة
3. تحقق من Firewall
4. تأكد من أن الباكند يعمل

### المشكلة: "Connection refused"

**الحل:**
1. تأكد من أن الباكند يعمل على `0.0.0.0` وليس `localhost`
2. تحقق من Firewall
3. جرب إيقاف Firewall مؤقتاً للاختبار

### المشكلة: "Timeout"

**الحل:**
1. تأكد من أن الشبكة مستقرة
2. تحقق من أن IP صحيح
3. تأكد من أن الباكند يعمل

## 📝 ملاحظات مهمة

1. **IP قد يتغير**: إذا غيرت الشبكة، قد يتغير IP الكمبيوتر
2. **نفس الشبكة**: الموبايل والكمبيوتر يجب أن يكونا على نفس WiFi
3. **Firewall**: قد تحتاج لإضافة استثناء في Firewall
4. **Security**: هذا للإختبار فقط - لا تستخدم في الإنتاج

## 🚀 الإنتاج

للإنتاج، يجب استخدام:
- Domain name حقيقي
- HTTPS
- إعدادات CORS صحيحة
- `_isProduction = true`

---

**تاريخ**: 2025-01-05  
**الحالة**: ✅ جاهز للاستخدام






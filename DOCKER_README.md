# 🐳 دليل Docker للمشروع

## نظرة عامة

هذا المشروع يستخدم Docker لتشغيل جميع الخدمات في بيئة معزولة ومتسقة.

## الخدمات المتاحة

### 🔧 الباك إند (API)
- **المنفذ:** 3000
- **الرابط:** http://localhost:3000
- **الوثائق:** http://localhost:3000/docs (Swagger)

### 🌐 الويب سايت (Website)
- **المنفذ:** 3001
- **الرابط:** http://localhost:3001
- **التقنية:** Next.js 15

### 🗄️ قاعدة البيانات (MongoDB)
- **المنفذ:** 27017
- **الرابط:** mongodb://localhost:27017

### ⚡ Redis
- **المنفذ:** 6379
- **الرابط:** redis://localhost:6379

### 📧 MailHog (للتطوير فقط)
- **المنفذ:** 8025
- **الرابط:** http://localhost:8025

## 🚀 التشغيل

### التطوير (Development)

```bash
# تشغيل جميع الخدمات للتطوير
docker-compose -f docker-compose.dev.yml up

# تشغيل في الخلفية
docker-compose -f docker-compose.dev.yml up -d

# إعادة بناء الصور
docker-compose -f docker-compose.dev.yml up --build

# إيقاف الخدمات
docker-compose -f docker-compose.dev.yml down
```

### الإنتاج (Production)

```bash
# تشغيل جميع الخدمات للإنتاج
docker-compose -f docker-compose.prod.yml up

# تشغيل في الخلفية
docker-compose -f docker-compose.prod.yml up -d

# إعادة بناء الصور
docker-compose -f docker-compose.prod.yml up --build

# إيقاف الخدمات
docker-compose -f docker-compose.prod.yml down
```

## 📁 هيكل الملفات

```
project/
├── docker-compose.yml          # التكوين الأساسي
├── docker-compose.dev.yml      # تكوين التطوير
├── docker-compose.prod.yml     # تكوين الإنتاج
├── clinic-api/                 # الباك إند
│   └── Dockerfile
├── websit/                     # الويب سايت
│   ├── .docker/
│   │   ├── Dockerfile.dev      # Docker للتطوير
│   │   └── Dockerfile.prod     # Docker للإنتاج
│   └── .dockerignore
└── DOCKER_README.md            # هذا الملف
```

## 🔧 الأوامر المفيدة

### إدارة الحاويات

```bash
# عرض الحاويات النشطة
docker ps

# عرض جميع الحاويات
docker ps -a

# إيقاف حاوية محددة
docker stop <container_name>

# إعادة تشغيل حاوية
docker restart <container_name>

# حذف حاوية
docker rm <container_name>
```

### إدارة الصور

```bash
# عرض الصور
docker images

# حذف صورة
docker rmi <image_name>

# إعادة بناء صورة محددة
docker-compose build <service_name>
```

### إدارة البيانات

```bash
# عرض الحجم المستخدم
docker system df

# تنظيف البيانات غير المستخدمة
docker system prune

# حذف جميع البيانات
docker system prune -a
```

## 🌍 متغيرات البيئة

### للويب سايت

```env
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000/v1
NEXT_PUBLIC_SITE_URL=http://localhost:3001
NEXT_PUBLIC_SITE_NAME=عيادة ذكية
```

### للباك إند

```env
NODE_ENV=development
PORT=3000
MONGO_URI=mongodb://mongo:27017/clinic
REDIS_URL=redis://redis:6379
```

## 🐛 استكشاف الأخطاء

### مشاكل شائعة

1. **المنافذ مشغولة:**
   ```bash
   # تحقق من المنافذ المستخدمة
   netstat -tulpn | grep :3000
   netstat -tulpn | grep :3001
   ```

2. **مشاكل في قاعدة البيانات:**
   ```bash
   # إعادة تشغيل MongoDB
   docker-compose restart mongo
   ```

3. **مشاكل في Redis:**
   ```bash
   # إعادة تشغيل Redis
   docker-compose restart redis
   ```

### عرض السجلات

```bash
# عرض سجلات جميع الخدمات
docker-compose logs

# عرض سجلات خدمة محددة
docker-compose logs <service_name>

# متابعة السجلات
docker-compose logs -f <service_name>
```

## 📊 مراقبة الأداء

```bash
# عرض استخدام الموارد
docker stats

# عرض تفاصيل حاوية
docker inspect <container_name>
```

## 🔄 التحديثات

```bash
# سحب أحدث الصور
docker-compose pull

# إعادة بناء وتشغيل
docker-compose up --build

# إعادة تشغيل خدمة محددة
docker-compose restart <service_name>
```

## 🧹 التنظيف

```bash
# إيقاف وحذف الحاويات
docker-compose down

# حذف الحاويات والحجم
docker-compose down -v

# حذف الصور أيضاً
docker-compose down --rmi all
```

## 📝 ملاحظات مهمة

1. **البيانات:** قاعدة البيانات MongoDB تحفظ البيانات في volume مخصص
2. **التطوير:** في وضع التطوير، يتم ربط ملفات المشروع مباشرة
3. **الإنتاج:** في وضع الإنتاج، يتم بناء الصور مع الكود المدمج
4. **الأمان:** تأكد من تحديث كلمات المرور في الإنتاج
5. **النسخ الاحتياطي:** قم بعمل نسخ احتياطية من قاعدة البيانات بانتظام

## 🆘 الدعم

إذا واجهت مشاكل:

1. تحقق من السجلات: `docker-compose logs`
2. تأكد من أن المنافذ متاحة
3. تحقق من متغيرات البيئة
4. أعد بناء الصور: `docker-compose up --build`

---

**تم تطويره بـ ❤️ لخدمة الرعاية الصحية**

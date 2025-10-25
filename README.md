# 🏥 نظام إدارة العيادات (Clinic Management System)

نظام متكامل لإدارة العيادات يتضمن API وموقع ويب مع دعم Docker.

## 📋 المكونات

- **🔧 الباك إند (API)** - NestJS + MongoDB + Redis
- **🌐 الويب سايت** - Next.js 15 + TypeScript
- **🐳 Docker** - تشغيل جميع الخدمات بسهولة

## 🚀 التشغيل السريع

### باستخدام Docker (مستحسن)

```bash
# تشغيل جميع الخدمات للتطوير
make dev-build

# أو باستخدام docker-compose مباشرة
docker-compose -f docker-compose.dev.yml up --build
```

### التشغيل المحلي

```bash
# الباك إند
cd clinic-api
npm install
npm run start:dev

# الويب سايت
cd websit
npm install
npm run dev
```

## 🌐 الروابط

- **الويب سايت:** http://localhost:3001
- **API:** http://localhost:3000
- **API Docs:** http://localhost:3000/docs
- **MailHog:** http://localhost:8025 (للتطوير)

## 📚 الوثائق

- [دليل Docker](DOCKER_README.md) - تعليمات شاملة لـ Docker
- [مواصفات الـ MVP](docs/mvp-spec.md) - مواصفات المشروع
- [خطة التنفيذ](docs/phased-plan.md) - خطة تنفيذ مرحلية
- [دليل المصادقة](websit/AUTHENTICATION_README.md) - نظام المصادقة

## 🛠️ الأوامر المفيدة

### Linux/Mac (Makefile)
```bash
# عرض جميع الأوامر المتاحة
make help

# تشغيل التطوير
make dev

# تشغيل الإنتاج
make prod

# عرض السجلات
make logs

# تنظيف النظام
make clean
```

### Windows (Batch File)
```cmd
# عرض جميع الأوامر المتاحة
docker-commands.bat help

# تشغيل التطوير
docker-commands.bat dev

# تشغيل الإنتاج
docker-commands.bat prod

# عرض السجلات
docker-commands.bat logs

# تنظيف النظام
docker-commands.bat clean
```

## 📁 هيكل المشروع

```
project/
├── clinic-api/          # الباك إند (NestJS)
├── websit/              # الويب سايت (Next.js)
├── docker-compose.yml   # التكوين الأساسي
├── docker-compose.dev.yml   # التطوير
├── docker-compose.prod.yml   # الإنتاج
├── Makefile             # أوامر سريعة
└── DOCKER_README.md     # دليل Docker
```

## 🔧 التقنيات المستخدمة

- **Backend:** NestJS, MongoDB, Redis, JWT
- **Frontend:** Next.js 15, TypeScript, Tailwind CSS
- **DevOps:** Docker, Docker Compose
- **Testing:** Jest, Testing Library

## 📄 الترخيص

هذا المشروع مملوك لشركة عيادة ذكية.

---

**تم تطويره بـ ❤️ لخدمة الرعاية الصحية**



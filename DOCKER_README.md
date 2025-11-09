# 🐳 Docker Setup - Quick Start

## 📁 الملفات المضافة

### Dockerfiles
- `clinic-api/Dockerfile` - صورة Docker للـ API
- `admin-dashboard/Dockerfile` - صورة Docker للوحة الإدارة
- `websit/Dockerfile` - صورة Docker للموقع

### Docker Compose
- `docker-compose.yml` - للتطوير
- `docker-compose.prod.yml` - للإنتاج

### Nginx Configuration
- `deploy/nginx.conf` - إعدادات nginx الأساسية (HTTP)
- `deploy/nginx-ssl.conf` - إعدادات nginx مع SSL (HTTPS)

### Scripts
- `deploy.sh` - سكريبت النشر
- `backup.sh` - سكريبت النسخ الاحتياطي

### Documentation
- `DOCKER_DEPLOYMENT_GUIDE.md` - دليل شامل للنشر على VPS

---

## 🚀 البدء السريع

### 1. إعداد ملف البيئة
```bash
cp env.template .env
nano .env  # عدّل القيم
```

### 2. بناء وتشغيل
```bash
# بناء الصور
docker compose -f docker-compose.prod.yml build

# تشغيل الخدمات
docker compose -f docker-compose.prod.yml up -d

# عرض السجلات
docker compose -f docker-compose.prod.yml logs -f
```

### 3. تهيئة قاعدة البيانات
```bash
docker exec -it virclinc-api npm run seed
```

### 4. إعداد SSL (للإنتاج)
```bash
# تثبيت certbot
sudo apt install certbot python3-certbot-nginx -y

# الحصول على شهادة
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# تحديث nginx-ssl.conf بنطاقك
nano deploy/nginx-ssl.conf

# تفعيل HTTPS في nginx.conf
nano deploy/nginx.conf  # أزل التعليق عن return 301
```

---

## 📝 ملاحظات مهمة

1. **ملف .env**: تأكد من تعبئة جميع القيم المطلوبة
2. **JWT_SECRET**: استخدم `openssl rand -base64 32` لتوليد مفتاح قوي
3. **ENCRYPTION_KEY**: يجب أن يكون 32 حرف على الأقل
4. **Domain**: حدّث جميع URLs في `.env` بنطاقك
5. **SSL**: في الإنتاج، تأكد من تفعيل SSL

---

## 🔗 روابط

- **API**: `http://localhost/api`
- **API Docs**: `http://localhost/api-docs`
- **Website**: `http://localhost/`
- **Admin Dashboard**: `http://localhost/admin`

---

## 📚 للمزيد من التفاصيل

راجع `DOCKER_DEPLOYMENT_GUIDE.md` للدليل الشامل.






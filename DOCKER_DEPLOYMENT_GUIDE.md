# 🐳 دليل النشر على VPS باستخدام Docker

دليل شامل لنشر نظام إدارة العيادة على VPS باستخدام Docker و Nginx.

---

## 📋 المتطلبات الأساسية

### 1. متطلبات السيرفر
- ✅ Ubuntu 20.04+ أو Debian 11+ (موصى به)
- ✅ 2GB RAM على الأقل (4GB موصى به)
- ✅ 20GB مساحة تخزين على الأقل
- ✅ معالج 2 cores على الأقل
- ✅ اتصال بالإنترنت مستقر

### 2. البرمجيات المطلوبة
- ✅ Docker Engine 24.0+
- ✅ Docker Compose 2.20+
- ✅ Git
- ✅ Domain name (نطاق)

---

## 🚀 خطوات الإعداد

### 1. إعداد السيرفر

#### تحديث النظام
```bash
sudo apt update && sudo apt upgrade -y
```

#### تثبيت Docker
```bash
# تثبيت Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# إضافة المستخدم الحالي لمجموعة docker
sudo usermod -aG docker $USER

# تسجيل الخروج والدخول مرة أخرى لتطبيق التغييرات
exit
```

#### تثبيت Docker Compose
```bash
# Docker Compose يأتي مع Docker الآن، تحقق من التثبيت
docker compose version

# إذا لم يكن مثبتاً
sudo apt install docker-compose-plugin -y
```

#### تثبيت Git
```bash
sudo apt install git -y
```

---

### 2. تحضير المشروع

#### استنساخ المشروع
```bash
# الانتقال لمجلد المناسب
cd /opt

# استنساخ المشروع (استبدل الرابط برابط مشروعك)
sudo git clone <repository-url> virclinc
sudo chown -R $USER:$USER /opt/virclinc
cd /opt/virclinc/new
```

#### إنشاء ملف البيئة
```bash
# نسخ ملف القالب
cp env.template .env

# تعديل الملف
nano .env
```

#### ⚠️ إعدادات مهمة في `.env`

```bash
# JWT Secret - استخدم مفتاح عشوائي قوي
# توليد مفتاح عشوائي:
openssl rand -base64 32

JWT_SECRET=your-generated-secret-here
JWT_EXPIRES_IN=24h

# Database
MONGO_URI=mongodb://mongo:27017/clinic

# Encryption Key - يجب أن يكون 32 حرف على الأقل
ENCRYPTION_KEY=your-32-character-encryption-key-here

# Frontend URLs - استبدل بنطاقك
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
NEXT_PUBLIC_API_URL=https://yourdomain.com/api
VITE_SITE_URL=https://yourdomain.com/admin
VITE_API_URL=https://yourdomain.com/api

# Security
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Agora (اختياري)
AGORA_APP_ID=your-agora-app-id
AGORA_APP_CERTIFICATE=your-agora-certificate
AGORA_ENABLED=true
```

---

### 3. إعداد Nginx و SSL

#### تحديث ملف nginx.conf
```bash
nano deploy/nginx.conf
```

تأكد من أن المسارات صحيحة والخدمات متصلة بشكل صحيح.

#### إعداد SSL مع Let's Encrypt

##### تثبيت Certbot
```bash
sudo apt install certbot python3-certbot-nginx -y
```

##### الحصول على شهادة SSL
```bash
# إيقاف nginx مؤقتاً (إذا كان يعمل)
docker compose stop nginx

# الحصول على الشهادة
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# سيتم حفظ الشهادات في:
# /etc/letsencrypt/live/yourdomain.com/
```

##### تحديث nginx-ssl.conf
```bash
nano deploy/nginx-ssl.conf
```

غيّر:
- `yourdomain.com` إلى نطاقك الفعلي
- تحديث CORS origins

##### تفعيل HTTPS في nginx.conf
```bash
nano deploy/nginx.conf
```

في بداية ملف `nginx.conf`، في السطر الذي يحتوي على `return 301`، أزل التعليق:
```nginx
# إلغاء التعليق عن هذا السطر:
return 301 https://$server_name$request_uri;
```

##### تحديث docker-compose.yml لدعم SSL
```bash
nano docker-compose.yml
```

تأكد من أن nginx يحتوي على:
```yaml
volumes:
  - ./deploy/nginx.conf:/etc/nginx/conf.d/default.conf:ro
  - ./deploy/nginx-ssl.conf:/etc/nginx/conf.d/ssl.conf:ro
  - /etc/letsencrypt:/etc/letsencrypt:ro
```

---

### 4. بناء وتشغيل الخدمات

#### بناء الصور
```bash
# بناء جميع الصور
docker compose build

# أو بناء خدمة محددة
docker compose build api
docker compose build website
docker compose build admin
```

#### تشغيل الخدمات
```bash
# تشغيل في الخلفية
docker compose up -d

# عرض حالة الخدمات
docker compose ps

# عرض السجلات
docker compose logs -f

# عرض سجلات خدمة محددة
docker compose logs -f api
```

---

### 5. تهيئة قاعدة البيانات

#### إنشاء مستخدم الأدمن
```bash
# الدخول إلى حاوية API
docker exec -it virclinc-api sh

# تشغيل سكريبت التهيئة
npm run seed

# الخروج
exit
```

#### التحقق من البيانات
```bash
# الدخول إلى MongoDB
docker exec -it virclinc-mongo mongosh clinic

# عرض المستخدمين
db.users.find().pretty()

# الخروج
exit
```

**معلومات تسجيل الدخول الافتراضية:**
- Email: `admin@clinic.com`
- Password: `password123`

⚠️ **غيّر كلمة المرور فوراً بعد أول تسجيل دخول!**

---

## 🔒 الأمان والحماية

### 1. إعداد Firewall

```bash
# تثبيت UFW
sudo apt install ufw -y

# السماح بـ SSH
sudo ufw allow 22/tcp

# السماح بـ HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# تفعيل Firewall
sudo ufw enable

# عرض القواعد
sudo ufw status
```

### 2. تحديث كلمة مرور الأدمن

من لوحة الإدارة:
1. افتح `https://yourdomain.com/admin`
2. سجل دخول
3. اذهب إلى Users
4. حدّث كلمة مرور الأدمن

### 3. تحديث JWT_SECRET

```bash
# توليد مفتاح جديد
openssl rand -base64 32

# تحديث .env
nano .env

# إعادة تشغيل الخدمات
docker compose restart api
```

---

## 📊 إدارة الخدمات

### أوامر مفيدة

```bash
# عرض حالة الخدمات
docker compose ps

# إيقاف الخدمات
docker compose stop

# إيقاف وإزالة الحاويات
docker compose down

# إعادة تشغيل خدمة محددة
docker compose restart api

# عرض السجلات
docker compose logs -f api

# عرض استخدام الموارد
docker stats

# الدخول إلى حاوية
docker exec -it virclinc-api sh
docker exec -it virclinc-mongo mongosh clinic
```

### تحديث التطبيق

```bash
# سحب التغييرات
git pull

# إعادة بناء الصور
docker compose build

# إعادة تشغيل الخدمات
docker compose up -d --force-recreate

# أو إعادة بناء خدمة محددة
docker compose up -d --build api
```

---

## 💾 النسخ الاحتياطي

### 1. نسخ احتياطي لقاعدة البيانات

```bash
# إنشاء نسخة احتياطية
docker exec virclinc-mongo mongodump --out /tmp/backup

# نسخ النسخة الاحتياطية للخادم
docker cp virclinc-mongo:/tmp/backup ./backup-$(date +%Y%m%d)

# ضغط النسخة الاحتياطية
tar -czf backup-mongo-$(date +%Y%m%d).tar.gz backup-$(date +%Y%m%d)
```

### 2. نسخ احتياطي للملفات المرفوعة

```bash
# نسخ ملفات uploads
docker run --rm \
  -v virclinc_api_uploads:/source \
  -v $(pwd)/backup:/backup \
  alpine tar czf /backup/uploads-$(date +%Y%m%d).tar.gz -C /source .
```

### 3. أتمتة النسخ الاحتياطي

```bash
# إنشاء سكريبت
cat > /opt/virclinc/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/virclinc/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Database backup
docker exec virclinc-mongo mongodump --out /tmp/backup
docker cp virclinc-mongo:/tmp/backup $BACKUP_DIR/mongo-$DATE
docker exec virclinc-mongo rm -rf /tmp/backup

# Uploads backup
docker run --rm \
  -v virclinc_api_uploads:/source \
  -v $BACKUP_DIR:/backup \
  alpine tar czf /backup/uploads-$DATE.tar.gz -C /source .

# حذف النسخ الاحتياطية الأقدم من 7 أيام
find $BACKUP_DIR -type d -name "mongo-*" -mtime +7 -exec rm -rf {} \;
find $BACKUP_DIR -name "uploads-*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
EOF

# جعل السكريبت قابلاً للتنفيذ
chmod +x /opt/virclinc/backup.sh

# إضافة لـ cron (يومياً الساعة 2 صباحاً)
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/virclinc/backup.sh >> /opt/virclinc/backup.log 2>&1") | crontab -
```

---

## 🔄 تجديد شهادة SSL

```bash
# تجديد الشهادة
sudo certbot renew

# إعادة تحميل nginx
docker compose restart nginx

# إضافة لـ cron للتجديد التلقائي
(crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet && docker compose -f /opt/virclinc/new/docker-compose.yml restart nginx") | crontab -
```

---

## 🐛 حل المشاكل

### مشكلة: 502 Bad Gateway

```bash
# تحقق من حالة API
docker compose ps api
docker compose logs api

# تحقق من اتصال nginx بـ API
docker exec virclinc-nginx wget -O- http://api:3000/v1/health
```

### مشكلة: MongoDB لا يعمل

```bash
# تحقق من السجلات
docker compose logs mongo

# تحقق من الصحة
docker compose ps mongo

# إعادة تشغيل
docker compose restart mongo
```

### مشكلة: الملفات المرفوعة لا تظهر

```bash
# تحقق من الصلاحيات
docker exec virclinc-api ls -la /app/uploads

# تحقق من volume
docker volume inspect virclinc_api_uploads
```

### مشكلة: SSL لا يعمل

```bash
# تحقق من الشهادة
sudo certbot certificates

# تحقق من nginx config
docker exec virclinc-nginx nginx -t

# تحقق من السجلات
docker compose logs nginx
```

---

## 📈 مراقبة الأداء

### عرض استخدام الموارد

```bash
# استخدام الموارد في الوقت الفعلي
docker stats

# استخدام القرص
df -h

# استخدام الذاكرة
free -h
```

### عرض السجلات

```bash
# جميع السجلات
docker compose logs -f

# سجلات محددة
docker compose logs -f api --tail=100

# حفظ السجلات
docker compose logs > logs-$(date +%Y%m%d).txt
```

---

## ✅ Checklist النشر

قبل اعتبار النشر مكتملاً، تأكد من:

- [ ] تم تثبيت Docker و Docker Compose
- [ ] تم إعداد ملف `.env` بالقيم الصحيحة
- [ ] تم إنشاء JWT_SECRET عشوائي وقوي
- [ ] تم إعداد ENCRYPTION_KEY (32 حرف)
- [ ] تم تحديث URLs في `.env` بنطاقك
- [ ] تم إعداد SSL certificate
- [ ] تم تحديث nginx-ssl.conf بنطاقك
- [ ] تم بناء جميع الصور بنجاح
- [ ] جميع الخدمات تعمل (`docker compose ps`)
- [ ] API يعمل (`curl https://yourdomain.com/health`)
- [ ] الموقع يعمل (`https://yourdomain.com`)
- [ ] لوحة الإدارة تعمل (`https://yourdomain.com/admin`)
- [ ] تم تغيير كلمة مرور الأدمن
- [ ] تم إعداد Firewall
- [ ] تم إعداد النسخ الاحتياطي التلقائي
- [ ] تم اختبار تجديد SSL certificate

---

## 🔗 روابط مفيدة

- **Docker Documentation**: https://docs.docker.com/
- **Docker Compose Documentation**: https://docs.docker.com/compose/
- **Nginx Documentation**: https://nginx.org/en/docs/
- **Let's Encrypt**: https://letsencrypt.org/
- **MongoDB Documentation**: https://docs.mongodb.com/

---

## 📞 الدعم

إذا واجهت أي مشاكل:

1. تحقق من السجلات: `docker compose logs -f`
2. تحقق من حالة الخدمات: `docker compose ps`
3. تحقق من الشبكة: `docker network ls`
4. راجع ملفات الإعدادات

---

**🎉 مبروك! نظامك جاهز للإنتاج**






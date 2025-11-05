# دليل الإعداد للإنتاج (Production Setup)

## 🚀 خطوات النشر للإنتاج

### المتطلبات الأساسية
- ✅ Docker و Docker Compose مثبتين
- ✅ دومين (مثل: `medcodesa.cloud`)
- ✅ SSL/TLS Certificate (Let's Encrypt موصى به)
- ✅ Server مع 2GB RAM على الأقل

---

## 1️⃣ إعداد ملف البيئة

```bash
# انسخ ملف الإعدادات
cp .env.example .env

# عدّل الملف
nano .env
```

### ⚠️ **مهم جداً**: غيّر هذه القيم

```bash
# مفتاح JWT - استخدم هذا الأمر لتوليد مفتاح عشوائي
openssl rand -base64 32

# ثم ضعه في .env
JWT_SECRET=the-generated-key-here

# الدومين الخاص بك
NEXT_PUBLIC_SITE_URL=https://medcodesa.cloud
NEXT_PUBLIC_API_URL=https://medcodesa.cloud/api
VITE_SITE_URL=https://medcodesa.cloud/admin
VITE_API_URL=https://medcodesa.cloud/api
```

---

## 2️⃣ تحديث nginx للإنتاج

### `deploy/nginx.conf`

غيّر CORS origin من `*` إلى دومينك:

```nginx
# بدلاً من
add_header 'Access-Control-Allow-Origin' '*' always;

# استخدم
add_header 'Access-Control-Allow-Origin' 'https://medcodesa.cloud' always;
```

### إضافة SSL

أنشئ ملف `deploy/nginx-ssl.conf`:

```nginx
server {
    listen 80;
    server_name medcodesa.cloud www.medcodesa.cloud;
    
    # إعادة توجيه لـ HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name medcodesa.cloud www.medcodesa.cloud;

    # SSL certificates
    ssl_certificate /etc/letsencrypt/live/medcodesa.cloud/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/medcodesa.cloud/privkey.pem;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # حد حجم الطلب
    client_max_body_size 5m;

    # CORS headers
    add_header 'Access-Control-Allow-Origin' 'https://medcodesa.cloud' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, PATCH, OPTIONS' always;
    add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization, Accept, x-role' always;
    add_header 'Access-Control-Allow-Credentials' 'true' always;

    # OPTIONS
    if ($request_method = 'OPTIONS') {
        add_header 'Access-Control-Allow-Origin' 'https://medcodesa.cloud' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, PATCH, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization, Accept, x-role' always;
        add_header 'Access-Control-Max-Age' 1728000;
        return 204;
    }

    # Static files (uploads)
    location /static/ {
        alias /var/www/virclinc/uploads/;
        expires 7d;
        add_header Cache-Control "public, max-age=604800";
        access_log off;
    }

    # API
    location / {
        proxy_pass http://api:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 3️⃣ الحصول على SSL Certificate

### استخدام Let's Encrypt (مجاني)

```bash
# تثبيت certbot
sudo apt update
sudo apt install certbot

# الحصول على certificate
sudo certbot certonly --standalone -d medcodesa.cloud -d www.medcodesa.cloud

# سيتم حفظ الملفات في:
# /etc/letsencrypt/live/medcodesa.cloud/
```

---

## 4️⃣ تحديث docker-compose.prod.yml

```yaml
nginx:
  image: nginx:alpine
  ports:
    - '80:80'
    - '443:443'  # إضافة port 443
  volumes:
    - ./deploy/nginx-ssl.conf:/etc/nginx/conf.d/default.conf:ro
    - uploads_data:/var/www/virclinc/uploads:ro
    # إضافة SSL certificates
    - /etc/letsencrypt:/etc/letsencrypt:ro
  depends_on:
    - api
  networks:
    - clinic-network
  restart: unless-stopped
```

---

## 5️⃣ بناء وتشغيل للإنتاج

```bash
# بناء الـ images
docker-compose -f docker-compose.prod.yml build

# تشغيل في الخلفية
docker-compose -f docker-compose.prod.yml up -d

# التحقق من الخدمات
docker-compose -f docker-compose.prod.yml ps
```

---

## 6️⃣ تهيئة البيانات الأولية

### إنشاء admin user

```bash
# الدخول لـ API container
docker exec -it virclinc-api-1 sh

# تشغيل seed script
npm run seed

# أو يدوياً
node dist/seed-data.js
```

---

## 7️⃣ التحقق من التشغيل

### 1. API Health Check
```bash
curl https://medcodesa.cloud/v1/health
```

يجب أن يرجع:
```json
{"status":"ok"}
```

### 2. Swagger Documentation
افتح: `https://medcodesa.cloud/api-docs`

### 3. Admin Dashboard
افتح: `https://medcodesa.cloud/admin`

### 4. تسجيل الدخول
- Email: `admin@clinic.com`
- Password: `password123`

⚠️ **غيّر كلمة المرور فوراً!**

---

## 8️⃣ الأمان والحماية

### تغيير كلمة مرور الأدمن

```bash
# الدخول لـ MongoDB
docker exec -it virclinc-mongo-1 mongosh clinic

# تحديث password
db.users.updateOne(
  { email: "admin@clinic.com" },
  { $set: { passwordHash: "<hashed-password>" } }
)
```

أو من الداشبورد:
1. اذهب لـ Users
2. ابحث عن admin@clinic.com
3. غيّر كلمة المرور

### Firewall Rules

```bash
# السماح فقط بـ HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp  # SSH

# حظر الباقي
sudo ufw enable
```

### Regular Updates

```bash
# تحديث images
docker-compose -f docker-compose.prod.yml pull

# إعادة البناء والتشغيل
docker-compose -f docker-compose.prod.yml up -d --build
```

---

## 9️⃣ Backup والاستعادة

### Backup Database

```bash
# إنشاء backup
docker exec virclinc-mongo-1 mongodump --out /tmp/backup

# نسخ الـ backup
docker cp virclinc-mongo-1:/tmp/backup ./backup-$(date +%Y%m%d)
```

### Backup Uploads

```bash
# نسخ ملفات الـ uploads
docker run --rm \
  -v virclinc_uploads_data:/source \
  -v $(pwd)/backup:/backup \
  alpine tar czf /backup/uploads-$(date +%Y%m%d).tar.gz -C /source .
```

### Automated Backup (Cron)

```bash
# أنشئ script
cat > /opt/clinic-backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d)
docker exec virclinc-mongo-1 mongodump --out /tmp/backup
docker cp virclinc-mongo-1:/tmp/backup /backup/mongo-$DATE
EOF

# اجعله قابل للتنفيذ
chmod +x /opt/clinic-backup.sh

# أضفه لـ cron (يومياً الساعة 2 صباحاً)
(crontab -l ; echo "0 2 * * * /opt/clinic-backup.sh") | crontab -
```

---

## 🔟 Monitoring والـ Logs

### عرض Logs

```bash
# جميع الخدمات
docker-compose -f docker-compose.prod.yml logs -f

# خدمة محددة
docker-compose -f docker-compose.prod.yml logs -f api

# آخر 100 سطر
docker-compose -f docker-compose.prod.yml logs --tail=100 api
```

### إعداد Log Rotation

أنشئ `/etc/docker/daemon.json`:

```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

ثم أعد تشغيل Docker:
```bash
sudo systemctl restart docker
```

---

## 🎯 Troubleshooting الإنتاج

### مشكلة 502 Bad Gateway

```bash
# تحقق من API
docker logs virclinc-api-1

# تحقق من nginx
docker exec virclinc-nginx-1 nginx -t
```

### مشكلة SSL

```bash
# تجديد certificate
sudo certbot renew

# إعادة تحميل nginx
docker-compose -f docker-compose.prod.yml restart nginx
```

### مشكلة Performance

```bash
# زيادة memory لـ MongoDB
docker-compose -f docker-compose.prod.yml stop mongo
# عدّل docker-compose.prod.yml
docker-compose -f docker-compose.prod.yml up -d mongo
```

---

## ✅ Checklist الإنتاج

قبل النشر، تأكد من:

- [ ] تم تغيير `JWT_SECRET`
- [ ] تم تغيير كلمة مرور الأدمن
- [ ] تم إعداد SSL certificate
- [ ] تم تحديث CORS origins
- [ ] تم إعداد Firewall
- [ ] تم إعداد Backup automation
- [ ] تم اختبار جميع features
- [ ] تم إعداد monitoring
- [ ] تم توثيق credentials
- [ ] تم اختبار disaster recovery

---

## 📊 Performance Tips

1. **استخدم CDN** للـ static files
2. **فعّل Redis caching** للـ API responses
3. **استخدم connection pooling** لـ MongoDB
4. **فعّل gzip compression** في nginx
5. **استخدم HTTP/2**

---

## 🆘 الدعم

### روابط مفيدة:
- MongoDB Docs: https://docs.mongodb.com/
- Nginx Docs: https://nginx.org/en/docs/
- Docker Docs: https://docs.docker.com/
- Let's Encrypt: https://letsencrypt.org/

### الحصول على مساعدة:
1. راجع logs أولاً
2. تحقق من Docker network
3. اختبر endpoints يدوياً
4. راجع nginx configuration

---

**🎉 مبروك! نظامك جاهز للإنتاج**









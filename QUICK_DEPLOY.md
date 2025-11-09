# ⚡ دليل النشر السريع

## 📋 الخطوات السريعة

### 1. على السيرفر - إعداد أولي
```bash
# تحديث النظام
sudo apt update && sudo apt upgrade -y

# تثبيت Docker
curl -fsSL https://get.docker.com -o get-docker.sh && sudo sh get-docker.sh
sudo usermod -aG docker $USER

# تسجيل الخروج والدخول مرة أخرى
exit
```

### 2. استنساخ المشروع
```bash
cd /opt
sudo git clone <repository-url> virclinc
sudo chown -R $USER:$USER /opt/virclinc
cd /opt/virclinc/new
```

### 3. إعداد ملف البيئة
```bash
cp env.template .env
nano .env
```

**ملء القيم المهمة:**
```bash
# توليد JWT_SECRET
openssl rand -base64 32

# توليد ENCRYPTION_KEY (32 حرف)
openssl rand -base64 32

# تحديث URLs
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
NEXT_PUBLIC_API_URL=https://yourdomain.com/api
VITE_SITE_URL=https://yourdomain.com/admin
VITE_API_URL=https://yourdomain.com/api
```

### 4. بناء وتشغيل
```bash
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
```

### 5. تهيئة قاعدة البيانات
```bash
docker exec -it virclinc-api npm run seed
```

### 6. إعداد SSL
```bash
# تثبيت certbot
sudo apt install certbot python3-certbot-nginx -y

# إيقاف nginx مؤقتاً
docker compose -f docker-compose.prod.yml stop nginx

# الحصول على شهادة
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# تحديث nginx-ssl.conf
nano deploy/nginx-ssl.conf  # غيّر yourdomain.com

# تفعيل HTTPS في nginx.conf
nano deploy/nginx.conf  # أزل التعليق عن return 301

# تشغيل nginx
docker compose -f docker-compose.prod.yml start nginx
```

### 7. التحقق
```bash
# حالة الخدمات
docker compose -f docker-compose.prod.yml ps

# اختبار API
curl https://yourdomain.com/api/health

# اختبار الموقع
curl https://yourdomain.com
```

---

## 🔐 تسجيل الدخول

- **URL**: `https://yourdomain.com/admin`
- **Email**: `admin@clinic.com`
- **Password**: `password123`

⚠️ **غيّر كلمة المرور فوراً!**

---

## 🛠️ أوامر مفيدة

```bash
# عرض السجلات
docker compose -f docker-compose.prod.yml logs -f

# إعادة تشغيل خدمة
docker compose -f docker-compose.prod.yml restart api

# تحديث التطبيق
git pull
docker compose -f docker-compose.prod.yml up -d --build

# نسخ احتياطي
./backup.sh
```

---

## 📚 للمزيد

راجع `DOCKER_DEPLOYMENT_GUIDE.md` للتفاصيل الكاملة.






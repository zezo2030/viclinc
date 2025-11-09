# 📁 Nginx Configuration Files

## الملفات

### `nginx.conf`
إعدادات nginx الأساسية:
- يدعم HTTP (port 80)
- يمكن تفعيل إعادة التوجيه لـ HTTPS
- يدعم Let's Encrypt certificate validation
- يحتوي على جميع locations للخدمات

**للإنتاج**: أزل التعليق عن السطر `return 301 https://$server_name$request_uri;` لتفعيل إعادة التوجيه لـ HTTPS.

### `nginx-ssl.conf`
إعدادات nginx مع SSL/HTTPS:
- يدعم HTTPS (port 443)
- Security headers
- SSL configuration
- CORS headers

**مهم**: قم بتحديث `yourdomain.com` بنطاقك الفعلي في جميع الأماكن.

---

## المسارات (Routes)

- `/api/*` → API (NestJS)
- `/api-docs` → Swagger Documentation
- `/health` → Health Check
- `/static/*` → Static Files (uploads)
- `/admin` → Admin Dashboard
- `/` → Website (Next.js)

---

## إعداد SSL

### 1. الحصول على شهادة
```bash
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com
```

### 2. تحديث nginx-ssl.conf
غيّر `yourdomain.com` في:
- `ssl_certificate`
- `ssl_certificate_key`
- `server_name`
- CORS origins

### 3. تفعيل HTTPS
في `nginx.conf`، أزل التعليق عن:
```nginx
return 301 https://$server_name$request_uri;
```

### 4. إعادة تشغيل nginx
```bash
docker compose -f docker-compose.prod.yml restart nginx
```

---

## اختبار الإعدادات

```bash
# اختبار صحة nginx config
docker exec virclinc-nginx nginx -t

# عرض السجلات
docker compose -f docker-compose.prod.yml logs nginx
```

---

## ملاحظات

- تأكد من أن nginx لديه صلاحيات القراءة لـ `/etc/letsencrypt`
- تأكد من أن volume `api_uploads` متصل بشكل صحيح
- في الإنتاج، حدّث CORS origins بدلاً من `*`






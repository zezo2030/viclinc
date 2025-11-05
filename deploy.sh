#!/bin/bash

# سكريبت النشر على VPS
# استخدام: ./deploy.sh

set -e

echo "🚀 بدء عملية النشر..."

# التحقق من وجود ملف .env
if [ ! -f .env ]; then
    echo "❌ ملف .env غير موجود!"
    echo "📝 يرجى نسخ env.template إلى .env وتعديله"
    exit 1
fi

# التحقق من وجود Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker غير مثبت!"
    exit 1
fi

# التحقق من وجود Docker Compose
if ! command -v docker compose &> /dev/null; then
    echo "❌ Docker Compose غير مثبت!"
    exit 1
fi

# بناء الصور
echo "🔨 بناء الصور..."
docker compose -f docker-compose.prod.yml build

# إيقاف الخدمات القديمة
echo "🛑 إيقاف الخدمات القديمة..."
docker compose -f docker-compose.prod.yml down

# تشغيل الخدمات
echo "▶️  تشغيل الخدمات..."
docker compose -f docker-compose.prod.yml up -d

# انتظار تشغيل الخدمات
echo "⏳ انتظار تشغيل الخدمات..."
sleep 10

# التحقق من حالة الخدمات
echo "📊 حالة الخدمات:"
docker compose -f docker-compose.prod.yml ps

# التحقق من صحة API
echo "🏥 التحقق من صحة API..."
sleep 5
if curl -f http://localhost/api/health > /dev/null 2>&1; then
    echo "✅ API يعمل بشكل صحيح"
else
    echo "⚠️  تحذير: API قد لا يعمل بشكل صحيح"
fi

echo "✅ تم النشر بنجاح!"
echo "📝 استخدم 'docker compose -f docker-compose.prod.yml logs -f' لعرض السجلات"


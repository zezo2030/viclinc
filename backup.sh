#!/bin/bash

# سكريبت النسخ الاحتياطي
# استخدام: ./backup.sh

set -e

BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)

echo "💾 بدء عملية النسخ الاحتياطي..."

# إنشاء مجلد النسخ الاحتياطي
mkdir -p $BACKUP_DIR

# نسخ احتياطي لقاعدة البيانات
echo "📦 نسخ قاعدة البيانات..."
docker exec virclinc-mongo mongodump --out /tmp/backup
docker cp virclinc-mongo:/tmp/backup $BACKUP_DIR/mongo-$DATE
docker exec virclinc-mongo rm -rf /tmp/backup

# ضغط نسخة قاعدة البيانات
echo "🗜️  ضغط نسخة قاعدة البيانات..."
tar -czf $BACKUP_DIR/mongo-$DATE.tar.gz -C $BACKUP_DIR mongo-$DATE
rm -rf $BACKUP_DIR/mongo-$DATE

# نسخ احتياطي للملفات المرفوعة
echo "📁 نسخ الملفات المرفوعة..."
docker run --rm \
  -v virclinc_api_uploads:/source \
  -v $(pwd)/$BACKUP_DIR:/backup \
  alpine tar czf /backup/uploads-$DATE.tar.gz -C /source .

# حذف النسخ الاحتياطية الأقدم من 7 أيام
echo "🧹 حذف النسخ القديمة..."
find $BACKUP_DIR -name "mongo-*.tar.gz" -mtime +7 -delete
find $BACKUP_DIR -name "uploads-*.tar.gz" -mtime +7 -delete

echo "✅ تم النسخ الاحتياطي بنجاح!"
echo "📍 الموقع: $BACKUP_DIR"
echo "📊 الملفات:"
ls -lh $BACKUP_DIR/*-$DATE.tar.gz








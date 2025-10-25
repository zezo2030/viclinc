FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .

FROM node:20-alpine AS dev
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# إنشاء مجلد dist مع الصلاحيات المناسبة
RUN mkdir -p dist && chmod 777 dist
# تنظيف أي ملفات مؤقتة
RUN rm -rf /tmp/* /var/tmp/*
# إعداد متغيرات البيئة
ENV NODE_ENV=development
CMD ["npm","run","start:dev"]


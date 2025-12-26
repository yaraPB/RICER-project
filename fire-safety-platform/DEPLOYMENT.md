# 🚀 دليل النشر | Deployment Guide

## نظرة عامة | Overview

هذا الدليل يغطي نشر تطبيق RICER إفران على منصات مختلفة.

This guide covers deploying the RICER Ifrane application to various platforms.

---

## 📋 قبل النشر | Pre-Deployment Checklist

### 1. متغيرات البيئة | Environment Variables

تأكد من إعداد جميع المتغيرات المطلوبة:

Ensure all required variables are set:

```bash
DATABASE_URL="mongodb+srv://user:password@cluster.mongodb.net/fire-safety"
JWT_SECRET="your-very-secure-random-secret-key-change-this"

# اختياري - للميزات المستقبلية
# Optional - for future features
TWILIO_ACCOUNT_SID=""
TWILIO_AUTH_TOKEN=""
TWILIO_WHATSAPP_NUMBER=""
```

### 2. قاعدة البيانات | Database Setup

**الخيار 1: MongoDB Atlas (موصى به | Recommended)**

1. إنشاء حساب على [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. إنشاء cluster مجاني
3. الحصول على connection string
4. إضافة عنوان IP الخاص بك إلى القائمة البيضاء (أو 0.0.0.0/0 للتطوير)
5. نسخ connection string إلى `DATABASE_URL`

**الخيار 2: MongoDB محلي**

```bash
# تثبيت MongoDB
# Ubuntu/Debian
sudo apt-get install mongodb

# macOS
brew tap mongodb/brew
brew install mongodb-community

# تشغيل MongoDB
mongod
```

---

## 🌐 Vercel (موصى به | Recommended)

### الخطوات | Steps

1. **دفع الكود إلى GitHub**

```bash
git init
git add .
git commit -m "Initial commit - RICER Ifrane"
git remote add origin https://github.com/yourusername/fire-safety-platform.git
git push -u origin main
```

2. **ربط Vercel**

- الذهاب إلى [vercel.com](https://vercel.com)
- "New Project" → اختر المستودع
- تكوين المشروع:
  - Framework Preset: Next.js
  - Root Directory: `./`
  - Build Command: `npm run build`
  - Output Directory: `.next`

3. **إضافة متغيرات البيئة**

في إعدادات Vercel:
- Settings → Environment Variables
- إضافة `DATABASE_URL`
- إضافة `JWT_SECRET`

4. **النشر**

```bash
# التثبيت من CLI
npm i -g vercel

# النشر
vercel

# نشر للإنتاج
vercel --prod
```

### ملاحظات Vercel

- ✅ نشر تلقائي من GitHub
- ✅ شهادات SSL مجانية
- ✅ CDN عالمي
- ✅ Serverless functions
- ⚠️ حدود الخطة المجانية: 100GB bandwidth/شهر

---

## 🐳 Docker

### Dockerfile

```dockerfile
FROM node:18-alpine AS base

# Dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:7
    restart: always
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

  app:
    build: .
    restart: always
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: "mongodb://admin:password@mongodb:27017/fire-safety?authSource=admin"
      JWT_SECRET: "your-secret-key"
    depends_on:
      - mongodb

volumes:
  mongodb_data:
```

### البناء والتشغيل | Build & Run

```bash
# بناء الصورة
docker-compose build

# تشغيل الحاويات
docker-compose up -d

# عرض السجلات
docker-compose logs -f

# إيقاف
docker-compose down
```

---

## ☁️ AWS (EC2 + MongoDB Atlas)

### 1. إطلاق EC2 Instance

```bash
# Ubuntu 22.04 LTS
# t2.micro (مؤهل للطبقة المجانية)

# الاتصال بـ SSH
ssh -i your-key.pem ubuntu@your-instance-ip
```

### 2. تثبيت التبعيات

```bash
# تحديث النظام
sudo apt update && sudo apt upgrade -y

# تثبيت Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# تثبيت PM2
sudo npm install -g pm2

# تثبيت Git
sudo apt install git -y
```

### 3. نشر التطبيق

```bash
# استنساخ المستودع
git clone https://github.com/yourusername/fire-safety-platform.git
cd fire-safety-platform

# تثبيت التبعيات
npm install

# إنشاء ملف .env.local
nano .env.local
# إضافة متغيرات البيئة

# إعداد Prisma
npm run prisma:generate
npm run prisma:push
npm run prisma:seed

# بناء التطبيق
npm run build

# تشغيل مع PM2
pm2 start npm --name "ricer-ifrane" -- start
pm2 save
pm2 startup
```

### 4. إعداد Nginx (اختياري)

```bash
# تثبيت Nginx
sudo apt install nginx -y

# تكوين Nginx
sudo nano /etc/nginx/sites-available/ricer-ifrane
```

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# تفعيل الموقع
sudo ln -s /etc/nginx/sites-available/ricer-ifrane /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 5. SSL مع Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com
```

---

## 🔧 Netlify (Static Export)

⚠️ **ملاحظة**: Netlify يدعم المواقع الثابتة فقط. API routes لن تعمل.

⚠️ **Note**: Netlify supports static sites only. API routes won't work.

للحصول على تطبيق كامل، استخدم Vercel أو نشر خادم منفصل.

For a full application, use Vercel or deploy to a separate server.

---

## 🌍 Azure (App Service)

### 1. إنشاء App Service

```bash
# تثبيت Azure CLI
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# تسجيل الدخول
az login

# إنشاء resource group
az group create --name ricer-ifrane-rg --location westeurope

# إنشاء app service plan
az appservice plan create \
  --name ricer-ifrane-plan \
  --resource-group ricer-ifrane-rg \
  --sku B1 \
  --is-linux

# إنشاء web app
az webapp create \
  --resource-group ricer-ifrane-rg \
  --plan ricer-ifrane-plan \
  --name ricer-ifrane \
  --runtime "NODE:18-lts"
```

### 2. تكوين التطبيق

```bash
# إضافة متغيرات البيئة
az webapp config appsettings set \
  --resource-group ricer-ifrane-rg \
  --name ricer-ifrane \
  --settings \
    DATABASE_URL="your-mongodb-connection-string" \
    JWT_SECRET="your-secret-key"
```

### 3. النشر

```bash
# من GitHub
az webapp deployment source config \
  --name ricer-ifrane \
  --resource-group ricer-ifrane-rg \
  --repo-url https://github.com/yourusername/fire-safety-platform \
  --branch main \
  --manual-integration
```

---

## 📊 مراقبة الأداء | Performance Monitoring

### تثبيت New Relic (اختياري)

```bash
npm install newrelic --save
```

```javascript
// في server.js أو index.js
require('newrelic');
```

### PM2 Monitoring

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7

# عرض المراقبة
pm2 monit
```

---

## 🔐 الأمان | Security Best Practices

### 1. تحديث المتغيرات

```bash
# توليد JWT secret قوي
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 2. تفعيل CORS

```javascript
// في middleware
const allowedOrigins = ['https://your-domain.com'];
```

### 3. Rate Limiting

```bash
npm install express-rate-limit
```

### 4. Helmet.js

```bash
npm install helmet
```

---

## 📝 ما بعد النشر | Post-Deployment

### 1. اختبار التطبيق

```bash
# اختبار الصحة
curl https://your-domain.com/api/weather

# اختبار المصادقة
curl -X POST https://your-domain.com/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"cin":"AB123456","password":"password123"}'
```

### 2. إعداد النسخ الاحتياطي

```bash
# MongoDB Atlas - Automatic backups included
# EC2 - Use AWS Backup service
# Docker - Regular volume backups

# مثال: نسخ احتياطي يدوي
mongodump --uri="your-connection-string" --out=/backup/$(date +%Y%m%d)
```

### 3. المراقبة

- إعداد uptime monitoring (UptimeRobot، Pingdom)
- تكوين تنبيهات البريد الإلكتروني
- مراقبة استخدام قاعدة البيانات

---

## 🆘 استكشاف الأخطاء | Troubleshooting

### خطأ اتصال قاعدة البيانات

```bash
# التحقق من connection string
echo $DATABASE_URL

# اختبار الاتصال
mongosh "your-connection-string"
```

### خطأ بناء Next.js

```bash
# مسح الكاش
rm -rf .next
npm run build
```

### مشاكل Prisma

```bash
# إعادة توليد Client
npx prisma generate

# إعادة دفع المخطط
npx prisma db push --force-reset
```

---

## 📞 الدعم | Support

للمساعدة في النشر:
- الوثائق: README.md
- API Docs: API_DOCUMENTATION.md
- مشاكل GitHub: github.com/yourrepo/issues

For deployment help:
- Documentation: README.md
- API Docs: API_DOCUMENTATION.md
- GitHub Issues: github.com/yourrepo/issues

---

**ملاحظة**: هذا الدليل يغطي السيناريوهات الأكثر شيوعاً. قد تتطلب البيئات المحددة تكوينات إضافية.

**Note**: This guide covers the most common scenarios. Specific environments may require additional configuration.

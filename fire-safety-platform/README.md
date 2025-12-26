# 🔥 RICER إفران - نظام إدارة حرائق الغابات
# RICER Ifrane - Fire Safety Management Platform

## 🌟 نظرة عامة | Overview

منصة شاملة لإدارة والإبلاغ عن حرائق الغابات في إفران، المغرب. مبنية باستخدام Next.js و MongoDB و Prisma و Leaflet.

A comprehensive fire incident management system for Ifrane, Morocco, built with Next.js, MongoDB, Prisma, and Leaflet.

### ✨ المميزات الرئيسية | Key Features

**للجميع | For Everyone:**
- 🌤️ **معلومات الطقس** - درجة الحرارة، سرعة واتجاه الرياح من Open-Meteo
- 🗺️ **خريطة تفاعلية** - عرض الحرائق على خريطة OpenStreetMap
- 📊 **إحصائيات** - رسوم بيانية للاتجاهات وتوزيع الأسباب
- 🚨 **الإبلاغ عن الحرائق** - نموذج مع محدد الموقع
- 📋 **قائمة التقارير** - عرض جميع التقارير المقدمة

**للمسؤولين الحكوميين | For Government Officials:**
- 🚒 **إدارة المعدات** - تتبع المركبات والأدوات والمعدات
- 💧 **المواد المثبطة** - مراقبة المخزون
- 🏗️ **البنية التحتية** - إدارة نقاط المياه والحواجز
- 🚛 **تتبع الشاحنات** - خريطة فورية لمواقع الشاحنات
- ✅ **تحديث التقارير** - تحديث حالة التقارير

## 🚀 التثبيت | Installation

### المتطلبات | Prerequisites
- Node.js 18+
- MongoDB (محلي أو سحابي | local or cloud)

### خطوات التثبيت | Setup Steps

```bash
# 1. تثبيت التبعيات | Install dependencies
npm install

# 2. إنشاء Prisma Client
npm run prisma:generate

# 3. دفع المخطط إلى MongoDB
npm run prisma:push

# 4. ملء قاعدة البيانات ببيانات تجريبية
npm run prisma:seed

# 5. تشغيل الخادم
npm run dev
```

### 👤 بيانات الدخول التجريبية | Test Credentials

**مواطن | Civilian:**
- CIN: `AB123456`
- كلمة المرور | Password: `password123`

**مسؤول | Official:**
- CIN: `CD789012`
- كلمة المرور | Password: `password123`

## 📁 هيكل المشروع | Project Structure

```
fire-safety-platform/
├── prisma/
│   ├── schema.prisma       # مخطط قاعدة البيانات
│   └── seed.ts            # بيانات تجريبية
├── src/
│   ├── app/               # صفحات Next.js و API
│   │   ├── (auth)/       # صفحات المصادقة
│   │   ├── (dashboard)/  # صفحات لوحة التحكم
│   │   └── api/          # نقاط نهاية API
│   ├── components/       # مكونات React
│   │   ├── auth/         # نماذج تسجيل الدخول/التسجيل
│   │   ├── layout/       # شريط التنقل والتخطيط
│   │   ├── map/          # مكونات الخريطة
│   │   ├── weather/      # عرض الطقس
│   │   ├── analytics/    # الرسوم البيانية
│   │   ├── reports/      # نماذج وقوائم التقارير
│   │   └── equipment/    # لوحة المعدات
│   ├── lib/              # الأدوات (Prisma، المصادقة)
│   ├── store/            # Zustand state management
│   ├── types/            # أنواع TypeScript
│   └── utils/            # دوال مساعدة
├── .env.local            # متغيرات البيئة
└── package.json
```

## 🗺️ الصفحات الرئيسية | Key Pages

### باللغة العربية | In Arabic

1. **تسجيل الدخول/التسجيل** (`/signin`, `/signup`)
   - تسجيل المواطنين أو المسؤولين الحكوميين
   - اختيار القسم للمسؤولين (16 إدارة مغربية)

2. **الطقس** (`/weather`)
   - درجة الحرارة الحالية، سرعة واتجاه الرياح
   - الموقع: إفران (33.52532, -5.11384)

3. **الخريطة** (`/map`)
   - عرض تفاعلي للحرائق
   - مرمز بالألوان (أحمر=منتظر، برتقالي=جارٍ، أخضر=مكتمل)

4. **الإحصائيات** (`/analytics`)
   - اتجاهات الحرائق خلال آخر أسبوعين
   - رسم بياني دائري لتوزيع الأسباب

5. **الإبلاغ** (`/report`)
   - إرسال تقارير حرائق جديدة
   - محدد موقع تفاعلي
   - اختيار السبب اختياري

6. **قائمة التقارير** (`/reports-list`)
   - عرض جميع التقارير المقدمة
   - المسؤولون يمكنهم تحديث الحالة

7. **المعدات** (`/equipment`) - للمسؤولين فقط
   - جداول جرد المعدات
   - تتبع المواد المثبطة
   - إدارة البنية التحتية
   - خريطة انتشار الشاحنات

## 🛠️ التقنيات المستخدمة | Technology Stack

- **إطار العمل | Framework**: Next.js 14 (App Router)
- **قاعدة البيانات | Database**: MongoDB مع Prisma ORM
- **إدارة الحالة | State Management**: Zustand
- **الخرائط | Maps**: Leaflet + React-Leaflet
- **الرسوم البيانية | Charts**: Recharts
- **التنسيق | Styling**: Tailwind CSS (دعم RTL | RTL support)
- **المصادقة | Authentication**: JWT مع httpOnly cookies
- **API**: Open-Meteo للطقس | for weather data

## 🌍 اللغات | Languages

- **اللغة الأساسية | Primary**: العربية (Arabic) - واجهة كاملة بالعربية مع دعم RTL
- **اللغة الثانوية | Secondary**: الفرنسية (French) - متوفرة في الثوابت

## 📊 نماذج قاعدة البيانات | Database Models

- **User**: المواطنون والمسؤولون الحكوميون
- **Incident**: حوادث الحرائق مع الموقع والسبب والشدة
- **Report**: التقارير المقدمة من المستخدمين
- **Equipment**: المركبات والأدوات ومعدات الحماية
- **RetardantProduct**: مخزون المواد المثبطة
- **Infrastructure**: نقاط المياه والحواجز ومراكز المراقبة
- **TruckDeployment**: مواقع الشاحنات الفورية

## 🔐 الأمان | Security

- تشفير كلمات المرور باستخدام bcrypt
- رموز JWT في cookies آمنة
- حماية المسارات (إعادة توجيه غير المصرح لهم)
- التحكم في الوصول على أساس الدور (مواطن مقابل مسؤول)

## 📝 الإدارات المدعومة | Supported Departments

16 إدارة حكومية مغربية:
- ADM - الطرق السيارة بالمغرب
- HCEFLCD - المندوبية السامية للمياه والغابات
- FAR - القوات المسلحة الملكية
- GR - الدرك الملكي
- وأكثر... | and more...

## 🐛 استكشاف الأخطاء | Troubleshooting

### Leaflet لا يظهر | not rendering
تأكد من استيراد المكونات ديناميكيًا مع `ssr: false`

### مشاكل اتصال MongoDB
- تحقق من تنسيق سلسلة الاتصال
- تأكد من تشغيل MongoDB (محلي) أو إمكانية الوصول (سحابي)

### أخطاء Prisma
```bash
npm run prisma:generate  # إعادة إنشاء Prisma Client
npm run prisma:push      # دفع تغييرات المخطط
```

## 📄 الترخيص | License

هذا المشروع تم إنشاؤه لأغراض أكاديمية في جامعة الأخوين.
This project was created for academic purposes at Al Akhawayn University.

## 👨‍💻 المطور | Developer

تم الإنشاء بواسطة PB لمشروع إدارة السلامة من الحرائق.
Created by PB for the Fire Safety Management course project.

---

**ملاحظة | Note**: هذا إصدار MVP تم بناؤه في يوم واحد. تكامل WhatsApp ورفع الصور معد ولكن غير مفعل بالكامل.

**Note**: This is an MVP built in one day. WhatsApp integration and image uploads are prepared but not fully implemented.

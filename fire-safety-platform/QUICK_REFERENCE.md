# 📇 بطاقة مرجعية سريعة | Quick Reference Card

## 🚀 البدء السريع | Quick Start

```bash
npm install
npm run prisma:generate
npm run prisma:push
npm run prisma:seed
npm run dev
```

→ افتح http://localhost:3000

---

## 👤 بيانات الدخول | Login Credentials

**مواطن:**
- CIN: `AB123456`
- Password: `password123`

**مسؤول:**
- CIN: `CD789012`  
- Password: `password123`

---

## 📁 الهيكل السريع | Quick Structure

```
src/
├── app/
│   ├── (auth)/          # تسجيل دخول/تسجيل
│   ├── (dashboard)/     # جميع الصفحات
│   └── api/             # جميع API endpoints
├── components/          # مكونات React
├── lib/                 # Prisma, Auth
├── store/               # Zustand stores
├── types/               # TypeScript types
└── utils/               # مساعدات
```

---

## 🗺️ المسارات الرئيسية | Main Routes

| المسار | الوصف | الوصول |
|--------|-------|--------|
| `/signin` | تسجيل دخول | عام |
| `/signup` | تسجيل جديد | عام |
| `/weather` | الطقس | مصادق |
| `/map` | خريطة الحرائق | مصادق |
| `/analytics` | إحصائيات | مصادق |
| `/report` | إبلاغ عن حريق | مصادق |
| `/reports-list` | قائمة التقارير | مصادق |
| `/equipment` | المعدات | مسؤولون فقط |

---

## 🔌 API Endpoints

### المصادقة
- `POST /api/auth/signup` - تسجيل
- `POST /api/auth/signin` - دخول
- `POST /api/auth/logout` - خروج
- `GET /api/auth/me` - المستخدم الحالي

### البيانات
- `GET /api/incidents` - الحوادث
- `GET /api/reports` - التقارير
- `POST /api/reports` - تقرير جديد
- `PATCH /api/reports/[id]` - تحديث حالة
- `GET /api/weather` - الطقس
- `GET /api/equipment` - المعدات
- `GET /api/analytics` - التحليلات

---

## 🎨 الألوان | Colors

```typescript
primary: #ef4444    // أحمر (حرائق)
orange: #f97316     // برتقالي (تحذيرات)
green: #22c55e      // أخضر (مكتمل)
yellow: #eab308     // أصفر (قيد الانتظار)
blue: #3b82f6       // أزرق (معلومات)
```

---

## 📦 الأوامر | Commands

```bash
# التطوير
npm run dev          # بدء dev server

# Prisma
npm run prisma:generate   # توليد client
npm run prisma:push       # دفع schema
npm run prisma:seed       # ملء البيانات
npx prisma studio         # فتح GUI

# البناء
npm run build        # بناء للإنتاج
npm start            # تشغيل production

# الأدوات
npm run lint         # فحص الكود
```

---

## 🔐 المصادقة | Auth Flow

```
1. POST /api/auth/signin
   → JWT token في httpOnly cookie
   
2. كل طلب يرسل cookie تلقائياً
   
3. Middleware يتحقق من token
   
4. POST /api/auth/logout
   → مسح cookie
```

---

## 🗃️ النماذج | Models

```typescript
User         // مستخدمون
Incident     // حوادث
Report       // تقارير
Equipment    // معدات
RetardantProduct  // مواد مثبطة
Infrastructure    // بنية تحتية
TruckDeployment   // شاحنات
```

---

## 🌍 الإحداثيات | Coordinates

**إفران:**
- Lat: `33.52532`
- Lng: `-5.11384`
- نصف القطر: 15 كم

---

## 🎯 الحالات | Status

```typescript
PENDING      // قيد الانتظار (أحمر)
IN_PROGRESS  // قيد التنفيذ (برتقالي)
COMPLETED    // مكتمل (أخضر)
```

---

## 🔥 الأسباب | Causes

```
CAMPFIRE_UNATTENDED     // نار مخيم
CIGARETTE               // سيجارة
AGRICULTURAL_BURNING    // حرق زراعي
ELECTRICAL              // كهربائي
LIGHTNING               // صاعقة
ARSON                   // متعمد
EQUIPMENT_MALFUNCTION   // عطل معدات
OTHER                   // أخرى
UNKNOWN                 // غير معروف
```

---

## 👥 الأدوار | Roles

**CIVILIAN:**
- ✅ عرض الطقس، الخريطة، التحليلات
- ✅ إبلاغ عن حرائق
- ✅ عرض التقارير
- ❌ تحديث الحالة
- ❌ المعدات

**OFFICIAL:**
- ✅ كل ما سبق +
- ✅ تحديث حالة التقارير
- ✅ عرض لوحة المعدات

---

## 🏢 الإدارات | Departments

```
ADM, HCEFLCD, FAR, GR, 
DPEFLCD, DREFLCD, FA, MI,
MET, MJS, ONCE, ONDA, ONEEP, PN
```

(16 إدارة حكومية مغربية)

---

## 🐛 استكشاف الأخطاء السريع | Quick Troubleshooting

**الخريطة لا تظهر:**
```typescript
// تأكد من dynamic import
const Map = dynamic(() => import(...), { ssr: false })
```

**خطأ Prisma:**
```bash
npx prisma generate
npx prisma db push
```

**خطأ MongoDB:**
```bash
# تحقق من connection string
echo $DATABASE_URL
```

**خطأ Auth:**
```bash
# تحقق من JWT_SECRET
echo $JWT_SECRET
```

---

## 📚 الوثائق الكاملة | Full Docs

- `README.md` - نظرة عامة
- `API_DOCUMENTATION.md` - وثائق API
- `DEPLOYMENT.md` - دليل النشر
- `TESTING.md` - دليل الاختبار
- `CONTRIBUTING.md` - دليل المساهمة

---

## 🆘 الدعم | Support

**مشاكل تقنية:**
→ راجع TESTING.md

**نشر التطبيق:**
→ راجع DEPLOYMENT.md

**API:**
→ راجع API_DOCUMENTATION.md

**المساهمة:**
→ راجع CONTRIBUTING.md

---

## ⚡ نصائح سريعة | Quick Tips

1. **RTL دائماً:** استخدم `text-right` و `space-x-reverse`
2. **العربية أولاً:** جميع النصوص بالعربية
3. **Responsive:** اختبر على الهاتف
4. **TypeScript:** لا تتجاهل الأخطاء
5. **Prisma:** `generate` قبل `push`

---

## 🎓 للطلاب | For Students

هذا المشروع مثالي لـ:
- تعلم Next.js 14
- Prisma ORM
- MongoDB
- TypeScript
- Leaflet Maps
- JWT Auth
- RTL Support

**ابدأ من:**
1. `README.md`
2. افتح الكود
3. جرب التطبيق
4. اقرأ API docs
5. ساهم!

---

**نسخة:** 1.0.0
**آخر تحديث:** ديسمبر 2024
**الترخيص:** MIT (للأغراض الأكاديمية)

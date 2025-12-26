# 🤝 دليل المساهمة | Contributing Guide

## مرحباً بك! | Welcome!

شكراً لاهتمامك بالمساهمة في RICER إفران! هذا المشروع مفتوح المصدر ونرحب بجميع المساهمات.

Thank you for your interest in contributing to RICER Ifrane! This is an open-source project and we welcome all contributions.

---

## 📋 جدول المحتويات | Table of Contents

1. [كيفية المساهمة](#how-to-contribute)
2. [معايير الكود](#code-standards)
3. [عملية Pull Request](#pull-request-process)
4. [الإبلاغ عن المشاكل](#reporting-issues)
5. [الميزات المطلوبة](#requested-features)

---

## 🚀 كيفية المساهمة | How to Contribute

### 1. Fork المستودع

```bash
# استنساخ المستودع الخاص بك
git clone https://github.com/your-username/fire-safety-platform.git
cd fire-safety-platform
```

### 2. إنشاء فرع جديد

```bash
# فرع للميزات
git checkout -b feature/arabic-voice-alerts

# فرع للإصلاحات
git checkout -b fix/map-marker-colors

# فرع للوثائق
git checkout -b docs/api-examples
```

### 3. إعداد بيئة التطوير

```bash
npm install
npm run prisma:generate
npm run prisma:push
npm run dev
```

### 4. إجراء التغييرات

- اتبع معايير الكود أدناه
- اختبر تغييراتك بدقة
- أضف وثائق إذا لزم الأمر

### 5. Commit التغييرات

```bash
git add .
git commit -m "feat: إضافة تنبيهات صوتية بالعربية"
```

### 6. Push ورفع PR

```bash
git push origin feature/arabic-voice-alerts
```

ثم افتح Pull Request على GitHub.

---

## 📝 معايير الكود | Code Standards

### TypeScript

```typescript
// ✅ جيد - نوع واضح
interface FireReport {
  latitude: number;
  longitude: number;
  description: string;
}

// ❌ سيء - أنواع مفقودة
function createReport(data) {
  return data;
}
```

### تسمية الملفات

```
✅ components/auth/SignInForm.tsx
✅ app/api/reports/route.ts
✅ utils/helpers.ts

❌ components/signin.tsx
❌ app/api/reports.ts
```

### تنسيق الكود

```bash
# نستخدم Prettier (سيتم إضافته)
npm run format

# ESLint
npm run lint
```

### اللغة في الكود

**النصوص في UI:**
- ✅ العربية أولاً
- ✅ الفرنسية كبديل في التعليقات

```typescript
// ✅ صحيح
<button>إرسال التقرير</button>
// Envoyer le rapport

// ❌ خطأ
<button>Submit Report</button>
```

**التعليقات في الكود:**
```typescript
// ✅ يمكن بالإنجليزية للوضوح التقني
// Calculate distance between two coordinates using Haversine formula

// ✅ أو بالعربية
// حساب المسافة بين إحداثيتين باستخدام صيغة Haversine
```

---

## 🎨 معايير UI/UX

### الألوان

```typescript
// استخدام ألوان من Tailwind theme
primary-600  // الأحمر الرئيسي للحرائق
orange-500   // للتحذيرات
green-500    // للحالة المكتملة
blue-500     // للمعلومات
```

### RTL Support

```tsx
// ✅ دائماً محاذاة النص لليمين
<div className="text-right">
  <h1>العنوان</h1>
</div>

// ✅ استخدام space-x-reverse للمسافات
<div className="flex space-x-reverse space-x-4">
```

### الاستجابة

```tsx
// ✅ دائماً responsive
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
```

---

## 🔄 عملية Pull Request | PR Process

### قبل الإرسال

- [ ] الكود يعمل بدون أخطاء
- [ ] اختبرت على Chrome و Firefox
- [ ] اختبرت على الهاتف المحمول
- [ ] النص بالعربية (UI)
- [ ] دعم RTL موجود
- [ ] الوثائق محدثة

### قالب PR

```markdown
## الوصف | Description

وصف موجز للتغييرات...

## نوع التغيير | Type of Change

- [ ] ميزة جديدة (New feature)
- [ ] إصلاح خطأ (Bug fix)
- [ ] تحسين الأداء (Performance)
- [ ] وثائق (Documentation)
- [ ] إعادة هيكلة (Refactoring)

## الاختبار | Testing

كيف تم اختبار هذا؟
- [ ] Chrome Desktop
- [ ] Firefox Desktop
- [ ] Safari Mobile
- [ ] Chrome Mobile

## لقطات الشاشة | Screenshots

(إذا كان UI change)

## الملاحظات | Notes

أي ملاحظات إضافية للمراجعين...
```

### مراجعة الكود

سيتم مراجعة جميع PRs. قد نطلب تغييرات:
- تحسينات في الأداء
- معايير الكود
- الأمان
- إمكانية الوصول

---

## 🐛 الإبلاغ عن المشاكل | Reporting Issues

### قالب Issue

```markdown
## وصف المشكلة | Issue Description

وصف واضح للمشكلة...

## خطوات إعادة الإنتاج | Steps to Reproduce

1. الذهاب إلى '...'
2. الضغط على '...'
3. مشاهدة الخطأ

## السلوك المتوقع | Expected Behavior

ماذا كان من المفترض أن يحدث...

## السلوك الفعلي | Actual Behavior

ماذا حدث بالفعل...

## البيئة | Environment

- المتصفح: Chrome 120
- نظام التشغيل: macOS 14
- النسخة: v1.0.0

## لقطات الشاشة | Screenshots

(إذا كان مفيداً)
```

### أولوية Issues

- 🔴 **عاجل**: أمان، تعطل التطبيق
- 🟠 **عالية**: ميزات رئيسية لا تعمل
- 🟡 **متوسطة**: أخطاء ثانوية
- 🟢 **منخفضة**: تحسينات، اقتراحات

---

## ✨ الميزات المطلوبة | Requested Features

### أولوية عالية | High Priority

1. **تكامل WhatsApp**
   - إرسال تنبيهات للمسؤولين
   - إشعارات للمواطنين

2. **رفع الصور**
   - السماح بإرفاق صور في التقارير
   - Cloudinary أو Uploadthing

3. **التنبيهات في الوقت الفعلي**
   - WebSockets للتحديثات الحية
   - Push notifications

### أولوية متوسطة | Medium Priority

4. **تصدير البيانات**
   - PDF reports
   - Excel exports
   - CSV downloads

5. **لوحة المسؤول**
   - إدارة المستخدمين
   - إحصائيات متقدمة
   - نسخ احتياطية

6. **دعم اللغات**
   - إضافة الأمازيغية
   - تحسين الترجمة الفرنسية

### أولوية منخفضة | Low Priority

7. **الوضع المظلم**
   - Dark mode theme

8. **PWA**
   - Progressive Web App support
   - Offline functionality

9. **التكامل مع الطائرات بدون طيار**
   - Drone surveillance integration
   - Real-time video feeds

---

## 🏗️ البنية المعمارية | Architecture

### الفلسفة

- **البساطة**: كود نظيف وسهل الفهم
- **الأداء**: تحميل سريع، optimized queries
- **الأمان**: JWT, bcrypt, input validation
- **إمكانية الصيانة**: TypeScript, documented code

### المكونات الرئيسية

```
┌─────────────────────────────────────┐
│         Next.js Frontend            │
│  (React Components + Pages)         │
└───────────────┬─────────────────────┘
                │
┌───────────────▼─────────────────────┐
│         API Routes                  │
│  (Authentication, CRUD, Analytics)  │
└───────────────┬─────────────────────┘
                │
┌───────────────▼─────────────────────┐
│         Prisma ORM                  │
│  (Database Access Layer)            │
└───────────────┬─────────────────────┘
                │
┌───────────────▼─────────────────────┐
│         MongoDB                     │
│  (Data Persistence)                 │
└─────────────────────────────────────┘
```

---

## 📚 الموارد | Resources

### الوثائق

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Leaflet Docs](https://leafletjs.com)

### أدوات التطوير

```bash
# VS Code Extensions المفيدة
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- Prisma
- Arabic Language Pack
```

### مجتمع

- GitHub Discussions: نقاشات عامة
- GitHub Issues: المشاكل والميزات
- Email: support@ricer-ifrane.ma (للمستقبل)

---

## ⚖️ الترخيص | License

بالمساهمة في هذا المشروع، فإنك توافق على:
- كودك سيكون تحت نفس الترخيص
- كودك أصلي أو لديك الحق في المساهمة به

---

## 🙏 شكراً | Thank You!

كل مساهمة، صغيرة أو كبيرة، تُقدَّر!

Every contribution, big or small, is appreciated!

### المساهمون | Contributors

سيتم إضافة أسماء جميع المساهمين هنا.

All contributors will be listed here.

---

## 💬 تواصل معنا | Contact

للأسئلة حول المساهمة:
- فتح Issue على GitHub
- المناقشة في Discussions
- مراجعة الوثائق

For questions about contributing:
- Open an Issue on GitHub
- Discuss in Discussions
- Review documentation

---

**ملاحظة**: هذا مشروع أكاديمي في Al Akhawayn University. نرحب بالمساهمات من الطلاب والمطورين!

**Note**: This is an academic project at Al Akhawayn University. We welcome contributions from students and developers!

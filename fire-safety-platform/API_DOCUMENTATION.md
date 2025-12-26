# 📚 وثائق API | API Documentation

## نظرة عامة | Overview

جميع نقاط النهاية في `/api` وترجع JSON. الأخطاء ترجع رسائل باللغة العربية.

All endpoints are under `/api` and return JSON. Errors return messages in Arabic.

---

## 🔐 المصادقة | Authentication

### POST `/api/auth/signup`
**الوصف**: إنشاء حساب جديد
**Description**: Create new account

**Body:**
```json
{
  "cin": "AB123456",
  "phone": "+212600000000",
  "password": "password123",
  "role": "CIVILIAN" | "OFFICIAL",
  "department": "HCEFLCD",  // مطلوب للمسؤولين فقط
  "position": "رئيس القطاع"   // مطلوب للمسؤولين فقط
}
```

**Response:**
```json
{
  "user": {
    "id": "...",
    "cin": "AB123456",
    "phone": "+212600000000",
    "role": "CIVILIAN",
    "department": null,
    "position": null
  }
}
```

**Errors:**
- `400`: جميع الحقول مطلوبة
- `400`: مستخدم بهذا الرقم الوطني موجود بالفعل
- `500`: حدث خطأ أثناء التسجيل

---

### POST `/api/auth/signin`
**الوصف**: تسجيل الدخول
**Description**: Sign in

**Body:**
```json
{
  "cin": "AB123456",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": {
    "id": "...",
    "cin": "AB123456",
    "phone": "+212600000000",
    "role": "CIVILIAN",
    "department": null,
    "position": null
  }
}
```

**Errors:**
- `400`: رقم البطاقة الوطنية وكلمة المرور مطلوبان
- `401`: رقم البطاقة الوطنية أو كلمة المرور غير صحيحة

---

### POST `/api/auth/logout`
**الوصف**: تسجيل الخروج
**Description**: Logout

**Response:**
```json
{
  "success": true
}
```

---

### GET `/api/auth/me`
**الوصف**: الحصول على المستخدم الحالي
**Description**: Get current user

**Response:**
```json
{
  "user": {
    "id": "...",
    "cin": "AB123456",
    "phone": "+212600000000",
    "role": "CIVILIAN",
    "department": null,
    "position": null
  }
}
```

أو `{ "user": null }` إذا لم يتم تسجيل الدخول

---

## 🔥 الحوادث | Incidents

### GET `/api/incidents`
**الوصف**: الحصول على جميع الحوادث
**Description**: Get all incidents

**Response:**
```json
{
  "incidents": [
    {
      "id": "...",
      "latitude": 33.52532,
      "longitude": -5.11384,
      "cause": "CAMPFIRE_UNATTENDED",
      "severity": 3,
      "status": "PENDING",
      "description": "حريق في الغابة",
      "createdAt": "2024-12-26T10:00:00.000Z",
      "updatedAt": "2024-12-26T10:00:00.000Z"
    }
  ]
}
```

**Fire Causes:**
- `CAMPFIRE_UNATTENDED`: نار مخيم غير مراقبة
- `CIGARETTE`: سيجارة
- `AGRICULTURAL_BURNING`: حرق زراعي
- `ELECTRICAL`: كهربائي
- `LIGHTNING`: صاعقة
- `ARSON`: حريق متعمد
- `EQUIPMENT_MALFUNCTION`: عطل في المعدات
- `OTHER`: أخرى
- `UNKNOWN`: غير معروف

**Status:**
- `PENDING`: قيد الانتظار
- `IN_PROGRESS`: قيد التنفيذ
- `COMPLETED`: مكتمل

**Severity:** 1-5 (1 = خفيف، 5 = شديد جداً)

---

## 📋 التقارير | Reports

### GET `/api/reports`
**الوصف**: الحصول على جميع التقارير
**Description**: Get all reports

**Response:**
```json
{
  "reports": [
    {
      "id": "...",
      "userId": "...",
      "latitude": 33.52532,
      "longitude": -5.11384,
      "description": "شاهدت دخاناً كثيفاً...",
      "images": [],
      "status": "PENDING",
      "cause": "CIGARETTE",
      "createdAt": "2024-12-26T10:00:00.000Z",
      "updatedAt": "2024-12-26T10:00:00.000Z",
      "user": {
        "cin": "AB123456",
        "phone": "+212600000000",
        "role": "CIVILIAN"
      }
    }
  ]
}
```

---

### POST `/api/reports`
**الوصف**: إنشاء تقرير جديد
**Description**: Create new report
**المصادقة**: مطلوبة
**Auth**: Required

**Body:**
```json
{
  "latitude": 33.52532,
  "longitude": -5.11384,
  "description": "وصف تفصيلي للحادث",
  "cause": "CIGARETTE"  // اختياري
}
```

**Response:**
```json
{
  "report": {
    "id": "...",
    "userId": "...",
    "latitude": 33.52532,
    "longitude": -5.11384,
    "description": "وصف تفصيلي للحادث",
    "images": [],
    "status": "PENDING",
    "cause": "CIGARETTE",
    "createdAt": "2024-12-26T10:00:00.000Z",
    "updatedAt": "2024-12-26T10:00:00.000Z",
    "user": { ... }
  }
}
```

**Errors:**
- `401`: غير مصرح
- `400`: جميع الحقول مطلوبة
- `500`: حدث خطأ أثناء إنشاء التقرير

---

### PATCH `/api/reports/[id]`
**الوصف**: تحديث حالة التقرير
**Description**: Update report status
**المصادقة**: مطلوبة (مسؤولون فقط)
**Auth**: Required (Officials only)

**Body:**
```json
{
  "status": "IN_PROGRESS"
}
```

**Response:**
```json
{
  "report": { ... }  // التقرير المحدث
}
```

**Errors:**
- `403`: غير مصرح (المواطنون لا يمكنهم تحديث الحالة)
- `400`: الحالة مطلوبة
- `500`: حدث خطأ أثناء تحديث التقرير

---

## 🌤️ الطقس | Weather

### GET `/api/weather`
**الوصف**: الحصول على بيانات الطقس الحالية لإفران
**Description**: Get current weather for Ifrane

**Response:**
```json
{
  "temperature": 18.5,      // درجة مئوية
  "windSpeed": 12.3,        // كم/س
  "windDirection": 245      // درجة (0-360)
}
```

**Wind Direction:**
- 0/360 = N (شمال)
- 45 = NE (شمال شرق)
- 90 = E (شرق)
- 135 = SE (جنوب شرق)
- 180 = S (جنوب)
- 225 = SW (جنوب غرب)
- 270 = W (غرب)
- 315 = NW (شمال غرب)

**Errors:**
- `500`: حدث خطأ أثناء استرجاع بيانات الطقس

---

## 🚒 المعدات | Equipment

### GET `/api/equipment`
**الوصف**: الحصول على جميع المعدات والبنية التحتية
**Description**: Get all equipment and infrastructure
**المصادقة**: مطلوبة (مسؤولون فقط)
**Auth**: Required (Officials only)

**Response:**
```json
{
  "equipment": [
    {
      "id": "...",
      "category": "Materiel Roulant",
      "name": "VPI Toyota",
      "quantity": 5,
      "condition": "Bon",  // Bon, Moyen, Mauvais
      "lastMaintenance": "2024-10-15T00:00:00.000Z",
      "location": "Ifrane Station",
      "createdAt": "...",
      "updatedAt": "..."
    }
  ],
  "retardantProducts": [
    {
      "id": "...",
      "productName": "Fire-Trol LCG-R",
      "acquisitionDate": "2023-05-15T00:00:00.000Z",
      "storageLocation": "Magasin",
      "quantity": 5000,
      "createdAt": "...",
      "updatedAt": "..."
    }
  ],
  "infrastructure": [
    {
      "id": "...",
      "type": "Point d'eau",
      "name": "Point d'eau 1",
      "latitude": 33.52532,
      "longitude": -5.11384,
      "status": "Opérationnel",
      "description": "Capacité: 35m³",
      "createdAt": "...",
      "updatedAt": "..."
    }
  ],
  "trucks": [
    {
      "id": "...",
      "truckId": "VPI-1000",
      "truckName": "Camion 1",
      "latitude": 33.52532,
      "longitude": -5.11384,
      "status": "Disponible",  // Disponible, En route, Sur place
      "assignedTo": null,
      "createdAt": "...",
      "updatedAt": "..."
    }
  ]
}
```

**Equipment Categories:**
- Materiel Roulant
- Petit Materiel
- Habillement
- Communication
- Campement

**Truck Status:**
- `Disponible`: متاح
- `En route`: في الطريق
- `Sur place`: في الموقع

**Errors:**
- `403`: غير مصرح (للمسؤولين فقط)
- `500`: حدث خطأ أثناء استرجاع المعدات

---

## 📊 التحليلات | Analytics

### GET `/api/analytics`
**الوصف**: الحصول على تحليلات الحرائق (آخر أسبوعين)
**Description**: Get fire analytics (last 2 weeks)

**Response:**
```json
{
  "incidentsByDate": {
    "2024-12-20": 2,
    "2024-12-21": 1,
    "2024-12-22": 3,
    "2024-12-23": 0,
    "2024-12-24": 1,
    "2024-12-25": 2,
    "2024-12-26": 1
  },
  "causeDistribution": {
    "CAMPFIRE_UNATTENDED": 3,
    "CIGARETTE": 2,
    "LIGHTNING": 2,
    "AGRICULTURAL_BURNING": 1,
    "OTHER": 2
  },
  "totalIncidents": 10
}
```

**Errors:**
- `500`: حدث خطأ أثناء استرجاع التحليلات

---

## 🔒 المصادقة والتخويل | Authentication & Authorization

### Cookie-Based Auth
جميع المصادقة تستخدم httpOnly cookies لتخزين JWT tokens.

All authentication uses httpOnly cookies to store JWT tokens.

### Access Levels

**المواطنون | Civilians (CIVILIAN):**
- ✅ عرض الطقس والخريطة والتحليلات
- ✅ إنشاء تقارير
- ✅ عرض قائمة التقارير
- ❌ لا يمكن تحديث حالة التقارير
- ❌ لا يمكن الوصول إلى لوحة المعدات

**المسؤولون | Officials (OFFICIAL):**
- ✅ جميع صلاحيات المواطنين
- ✅ تحديث حالة التقارير
- ✅ الوصول إلى لوحة المعدات الكاملة
- ✅ عرض انتشار الشاحنات

---

## 🌍 المواقع الجغرافية | Geographic Coordinates

**مركز إفران | Ifrane Center:**
- Latitude: `33.52532`
- Longitude: `--5.11384`

جميع الحوادث ضمن دائرة نصف قطرها 15 كم من إفران.

All incidents are within a 15km radius of Ifrane.

---

## 📝 ملاحظات | Notes

1. جميع التواريخ بصيغة ISO 8601
2. الأخطاء ترجع رسائل باللغة العربية
3. JWT tokens تنتهي صلاحيتها بعد 7 أيام
4. جميع الإحداثيات بنظام WGS84

1. All dates in ISO 8601 format
2. Errors return messages in Arabic
3. JWT tokens expire after 7 days
4. All coordinates in WGS84 system

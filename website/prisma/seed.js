const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const EQUIPMENT_DATA = [
  {
    category: "Material Roulant VPI et Camions",
    categoryAr: "المركبات والشاحنات",
    items: [
      { name: "VPI Camion 1", nameAr: "شاحنة التدخل الأولي 1" },
      { name: "Camion 2", nameAr: "شاحنة 2" }
    ]
  },
  {
    category: "Petit materiel de lutte",
    categoryAr: "معدات المكافحة الصغيرة",
    items: [
      { name: "Debroussailleuse", nameAr: "آلة إزالة الأعشاب" },
      { name: "Tronconneuse", nameAr: "منشار كهربائي" },
      { name: "Batte à feu", nameAr: "مضرب إطفاء الحريق" },
      { name: "Pelle", nameAr: "مجرفة" },
      { name: "Pioche", nameAr: "فأس" },
      { name: "Pompe dorsale", nameAr: "مضخة ظهرية" },
      { name: "Hache", nameAr: "فأس حاد" },
      { name: "Scie", nameAr: "منشار يدوي" }
    ]
  },
  {
    category: "Habillement du personnel de lutte",
    categoryAr: "ملابس طاقم الإطفاء",
    items: [
      { name: "Chemises", nameAr: "قمصان" },
      { name: "Gants", nameAr: "قفازات" },
      { name: "Pantalons", nameAr: "سراويل" },
      { name: "Chaussures", nameAr: "أحذية" },
      { name: "Lunettes de protection", nameAr: "نظارات واقية" },
      { name: "Casques", nameAr: "خوذات" },
      { name: "Sac à dos", nameAr: "حقيبة ظهر" },
      { name: "Protecteurs à oreilles", nameAr: "واقيات الأذن" },
      { name: "Masque à gaz", nameAr: "قناع غاز" }
    ]
  },
  {
    category: "Moyen de communication et de positionnement",
    categoryAr: "وسائل الاتصال وتحديد المواقع",
    items: [
      { name: "Cartes d'infrastructure DFCI", nameAr: "خرائط البنية التحتية DFCI" },
      { name: "GSM", nameAr: "هاتف محمول" },
      { name: "Jumelles", nameAr: "مناظير" },
      { name: "GPS", nameAr: "جهاز تحديد المواقع" },
      { name: "Cartes du risque statique", nameAr: "خرائط المخاطر الثابتة" }
    ]
  },
  {
    category: "Materiel de campement",
    categoryAr: "معدات المخيم",
    items: [
      { name: "Tentes", nameAr: "خيام" },
      { name: "Lits", nameAr: "أسرّة" },
      { name: "Tables", nameAr: "طاولات" },
      { name: "Chaises", nameAr: "كراسي" },
      { name: "Groupes électrogènes", nameAr: "مولدات كهربائية" },
      { name: "Sac de couchage", nameAr: "كيس نوم" },
      { name: "Mini-frigos", nameAr: "ثلاجات صغيرة" },
      { name: "Éléments d'hygiène", nameAr: "مستلزمات النظافة" },
      { name: "Matelas", nameAr: "مراتب" },
      { name: "Citerne d'eau", nameAr: "خزان مياه" }
    ]
  },
  {
    category: "Produit retardant",
    categoryAr: "مواد مثبطة للحريق",
    items: [
      { name: "Produit retardant A", nameAr: "مادة مثبطة أ" },
      { name: "Produit retardant B", nameAr: "مادة مثبطة ب" }
    ]
  }
];

const INFRASTRUCTURE_DATA = [
  {
    type: "Point d'eau",
    typeAr: "نقطة مياه",
    points: [
      { name: "Point d'eau 1", nameAr: "نقطة مياه 1", condition: "GOOD" },
      { name: "Point d'eau 2", nameAr: "نقطة مياه 2", condition: "MILD" },
      { name: "Point d'eau 3", nameAr: "نقطة مياه 3", condition: "BAD" }
    ]
  },
  {
    type: "Tranche pare-feu",
    typeAr: "خندق مانع الحريق",
    points: [
      { name: "Tranche pare-feu 1", nameAr: "خندق مانع الحريق 1", condition: "GOOD" },
      { name: "Tranche pare-feu 2", nameAr: "خندق مانع الحريق 2", condition: "MILD" }
    ]
  },
  {
    type: "Postes Vigies",
    typeAr: "مراكز المراقبة",
    points: [
      { name: "Poste Vigie 1", nameAr: "مركز مراقبة 1", condition: "BAD" },
      { name: "Poste Vigie 2", nameAr: "مركز مراقبة 2", condition: "GOOD" }
    ]
  },
  {
    type: "Pistes Forestieres",
    typeAr: "مسارات الغابات",
    points: [
      { name: "Piste Forestiere 1", nameAr: "مسار غابة 1", condition: "MILD" },
      { name: "Piste Forestiere 2", nameAr: "مسار غابة 2", condition: "GOOD" }
    ]
  }
];

async function main() {
  console.log('🌱 Seeding database...');

  // Seed Equipment
  console.log('📦 Seeding equipment...');
  for (const cat of EQUIPMENT_DATA) {
    for (const item of cat.items) {
      await prisma.equipment.create({
        data: {
          name: item.name,
          nameAr: item.nameAr,
          category: cat.category,
          categoryAr: cat.categoryAr,
          quantity: 0,
          isInspected: false
        }
      });
    }
  }
  console.log('✅ Equipment seeded');

  // Seed Infrastructure
  console.log('🏗️ Seeding infrastructure...');
  for (const infra of INFRASTRUCTURE_DATA) {
    for (const point of infra.points) {
      await prisma.infrastructure.create({
        data: {
          name: point.name,
          nameAr: point.nameAr,
          type: infra.type,
          typeAr: infra.typeAr,
          condition: point.condition
        }
      });
    }
  }
  console.log('✅ Infrastructure seeded');

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

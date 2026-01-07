import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Hash password for test users
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create test users
  const civilian = await prisma.user.upsert({
    where: { cin: 'AB123456' },
    update: {},
    create: {
      cin: 'AB123456',
      phone: '+212612345678',
      password: hashedPassword,
      role: 'CIVILIAN',
    },
  });

  const official = await prisma.user.upsert({
    where: { cin: 'CD789012' },
    update: {},
    create: {
      cin: 'CD789012',
      phone: '+212687654321',
      password: hashedPassword,
      role: 'OFFICIAL',
      department: 'HCEFLCD',
      position: 'مدير العمليات الميدانية',
    },
  });

  console.log('✅ Users created');

  // Create fire incidents around Ifrane
  const incidents = await prisma.incident.createMany({
    data: [
      {
        latitude: 33.5275,
        longitude: -5.1056,
        cause: 'CAMPFIRE_UNATTENDED',
        severity: 3,
        status: 'COMPLETED',
        description: 'حريق نار مخيم بالقرب من المركز',
      },
      {
        latitude: 33.5312,
        longitude: -5.1123,
        cause: 'CIGARETTE',
        severity: 2,
        status: 'COMPLETED',
        description: 'حريق صغير بسبب سيجارة',
      },
      {
        latitude: 33.5198,
        longitude: -5.0987,
        cause: 'AGRICULTURAL_BURNING',
        severity: 4,
        status: 'IN_PROGRESS',
        description: 'حريق زراعي خارج عن السيطرة',
      },
      {
        latitude: 33.5356,
        longitude: -5.1189,
        cause: 'LIGHTNING',
        severity: 5,
        status: 'PENDING',
        description: 'حريق كبير بسبب صاعقة',
      },
      {
        latitude: 33.5243,
        longitude: -5.1134,
        cause: 'ELECTRICAL',
        severity: 2,
        status: 'COMPLETED',
      },
      {
        latitude: 33.5389,
        longitude: -5.0923,
        cause: 'UNKNOWN',
        severity: 3,
        status: 'IN_PROGRESS',
      },
      {
        latitude: 33.5156,
        longitude: -5.1212,
        cause: 'ARSON',
        severity: 4,
        status: 'PENDING',
        description: 'حريق متعمد - تحت التحقيق',
      },
      {
        latitude: 33.5423,
        longitude: -5.1045,
        cause: 'EQUIPMENT_MALFUNCTION',
        severity: 2,
        status: 'COMPLETED',
      },
      {
        latitude: 33.5089,
        longitude: -5.0889,
        cause: 'CAMPFIRE_UNATTENDED',
        severity: 3,
        status: 'COMPLETED',
      },
      {
        latitude: 33.5467,
        longitude: -5.1167,
        cause: 'OTHER',
        severity: 2,
        status: 'PENDING',
      },
      {
        latitude: 33.5234,
        longitude: -5.0956,
        cause: 'CIGARETTE',
        severity: 1,
        status: 'COMPLETED',
      },
      {
        latitude: 33.5178,
        longitude: -5.1089,
        cause: 'LIGHTNING',
        severity: 4,
        status: 'IN_PROGRESS',
      },
    ],
  });

  console.log('✅ Incidents created');

  // Create reports
  await prisma.report.createMany({
    data: [
      {
        userId: civilian.id,
        latitude: 33.5275,
        longitude: -5.1056,
        description: 'رأيت دخانا كثيفا بالقرب من الغابة',
        images: [],
        status: 'PENDING',
        cause: 'UNKNOWN',
      },
      {
        userId: civilian.id,
        latitude: 33.5312,
        longitude: -5.1123,
        description: 'حريق صغير في الحديقة العامة',
        images: [],
        status: 'IN_PROGRESS',
        cause: 'CIGARETTE',
      },
      {
        userId: civilian.id,
        latitude: 33.5198,
        longitude: -5.0987,
        description: 'حريق كبير بحاجة إلى تدخل سريع',
        images: [],
        status: 'IN_PROGRESS',
        cause: 'AGRICULTURAL_BURNING',
      },
      {
        userId: civilian.id,
        latitude: 33.5356,
        longitude: -5.1189,
        description: 'سمعت انفجارا وبعدها ظهر الحريق',
        images: [],
        status: 'COMPLETED',
        cause: 'ELECTRICAL',
      },
      {
        userId: civilian.id,
        latitude: 33.5243,
        longitude: -5.1134,
        description: 'دخان أسود يتصاعد من المنطقة الصناعية',
        images: [],
        status: 'COMPLETED',
        cause: 'EQUIPMENT_MALFUNCTION',
      },
    ],
  });

  console.log('✅ Reports created');

  // Create equipment
  await prisma.equipment.createMany({
    data: [
      // Materiel Roulant
      {
        category: 'Materiel Roulant',
        name: 'شاحنة إطفاء كبيرة',
        quantity: 3,
        condition: 'Bon',
        lastMaintenance: new Date('2024-12-01'),
        location: 'مركز إفران',
      },
      {
        category: 'Materiel Roulant',
        name: 'سيارة تدخل سريع',
        quantity: 5,
        condition: 'Bon',
        lastMaintenance: new Date('2024-11-15'),
        location: 'مركز إفران',
      },
      {
        category: 'Materiel Roulant',
        name: 'دراجة نارية للاستطلاع',
        quantity: 2,
        condition: 'Moyen',
        lastMaintenance: new Date('2024-10-20'),
        location: 'محطة الغابة',
      },
      // Petit Materiel
      {
        category: 'Petit Materiel',
        name: 'خراطيم مياه',
        quantity: 50,
        condition: 'Bon',
        location: 'مركز إفران',
      },
      {
        category: 'Petit Materiel',
        name: 'فؤوس إطفاء',
        quantity: 30,
        condition: 'Bon',
        location: 'مركز إفران',
      },
      {
        category: 'Petit Materiel',
        name: 'مناشير يدوية',
        quantity: 15,
        condition: 'Moyen',
        location: 'محطة الغابة',
      },
      // Equipement de Protection
      {
        category: 'Equipement de Protection',
        name: 'بدلات واقية',
        quantity: 40,
        condition: 'Bon',
        location: 'مركز إفران',
      },
      {
        category: 'Equipement de Protection',
        name: 'خوذات',
        quantity: 45,
        condition: 'Bon',
        location: 'مركز إفران',
      },
      {
        category: 'Equipement de Protection',
        name: 'أقنعة واقية',
        quantity: 50,
        condition: 'Bon',
        location: 'مركز إفران',
      },
      // Communication
      {
        category: 'Communication',
        name: 'أجهزة لاسلكي',
        quantity: 20,
        condition: 'Bon',
        lastMaintenance: new Date('2024-12-10'),
        location: 'مركز إفران',
      },
      {
        category: 'Communication',
        name: 'هواتف أقمار صناعية',
        quantity: 5,
        condition: 'Bon',
        lastMaintenance: new Date('2024-11-25'),
        location: 'مركز إفران',
      },
      // Surveillance
      {
        category: 'Surveillance',
        name: 'طائرات بدون طيار',
        quantity: 3,
        condition: 'Bon',
        lastMaintenance: new Date('2024-12-05'),
        location: 'مركز إفران',
      },
      {
        category: 'Surveillance',
        name: 'كاميرات حرارية',
        quantity: 8,
        condition: 'Bon',
        location: 'مركز إفران',
      },
      {
        category: 'Surveillance',
        name: 'مناظير ليلية',
        quantity: 10,
        condition: 'Moyen',
        location: 'محطة الغابة',
      },
      {
        category: 'Surveillance',
        name: 'محطات مراقبة متنقلة',
        quantity: 4,
        condition: 'Bon',
        location: 'مناطق متفرقة',
      },
    ],
  });

  console.log('✅ Equipment created');

  // Create retardant products
  await prisma.retardantProduct.createMany({
    data: [
      {
        productName: 'رغوة إطفاء نوع A',
        acquisitionDate: new Date('2024-06-15'),
        storageLocation: 'مستودع مركز إفران',
        quantity: 8000,
      },
      {
        productName: 'رغوة إطفاء نوع B',
        acquisitionDate: new Date('2024-08-20'),
        storageLocation: 'مستودع مركز إفران',
        quantity: 5000,
      },
      {
        productName: 'مثبط حريق طويل الأمد',
        acquisitionDate: new Date('2024-09-10'),
        storageLocation: 'محطة الغابة',
        quantity: 3500,
      },
    ],
  });

  console.log('✅ Retardant products created');

  // Create infrastructure
  await prisma.infrastructure.createMany({
    data: [
      // Points d'eau
      {
        type: "Point d'eau",
        name: 'بئر مياه 1',
        latitude: 33.5289,
        longitude: -5.1067,
        status: 'Opérationnel',
        description: 'بئر بسعة 50000 لتر',
      },
      {
        type: "Point d'eau",
        name: 'خزان مياه مركزي',
        latitude: 33.5256,
        longitude: -5.1089,
        status: 'Opérationnel',
        description: 'خزان بسعة 100000 لتر',
      },
      {
        type: "Point d'eau",
        name: 'نقطة مياه طبيعية',
        latitude: 33.5334,
        longitude: -5.1145,
        status: 'Opérationnel',
        description: 'نبع مياه طبيعي',
      },
      {
        type: "Point d'eau",
        name: 'بئر مياه 2',
        latitude: 33.5198,
        longitude: -5.0934,
        status: 'Opérationnel',
        description: 'بئر بسعة 30000 لتر',
      },
      {
        type: "Point d'eau",
        name: 'حوض مياه',
        latitude: 33.5412,
        longitude: -5.1198,
        status: 'Opérationnel',
        description: 'حوض مياه بسعة 75000 لتر',
      },
      // Tranchées pare-feu
      {
        type: 'Tranchée pare-feu',
        name: 'خندق واقي شمالي',
        latitude: 33.5445,
        longitude: -5.1123,
        status: 'Bon état',
        description: 'خندق بطول 2 كلم',
      },
      {
        type: 'Tranchée pare-feu',
        name: 'خندق واقي جنوبي',
        latitude: 33.5123,
        longitude: -5.0967,
        status: 'Bon état',
        description: 'خندق بطول 1.5 كلم',
      },
      {
        type: 'Tranchée pare-feu',
        name: 'خندق واقي شرقي',
        latitude: 33.5289,
        longitude: -5.0856,
        status: 'Nécessite entretien',
        description: 'خندق بطول 1.8 كلم',
      },
      {
        type: 'Tranchée pare-feu',
        name: 'خندق واقي غربي',
        latitude: 33.5267,
        longitude: -5.1267,
        status: 'Bon état',
        description: 'خندق بطول 2.2 كلم',
      },
      {
        type: 'Tranchée pare-feu',
        name: 'خندق واقي المنطقة الوسطى',
        latitude: 33.5278,
        longitude: -5.1045,
        status: 'Excellent état',
        description: 'خندق بطول 3 كلم',
      },
      // Tours de guet
      {
        type: 'Tour de guet',
        name: 'برج مراقبة 1',
        latitude: 33.5489,
        longitude: -5.1234,
        status: 'Opérationnel',
        description: 'برج بارتفاع 25 متر',
      },
      {
        type: 'Tour de guet',
        name: 'برج مراقبة 2',
        latitude: 33.5156,
        longitude: -5.0878,
        status: 'Opérationnel',
        description: 'برج بارتفاع 30 متر',
      },
      {
        type: 'Tour de guet',
        name: 'برج مراقبة 3',
        latitude: 33.5367,
        longitude: -5.1345,
        status: 'En maintenance',
        description: 'برج بارتفاع 28 متر',
      },
      {
        type: 'Tour de guet',
        name: 'برج مراقبة 4',
        latitude: 33.5089,
        longitude: -5.1123,
        status: 'Opérationnel',
        description: 'برج بارتفاع 27 متر',
      },
      {
        type: 'Tour de guet',
        name: 'برج مراقبة 5',
        latitude: 33.5423,
        longitude: -5.0967,
        status: 'Opérationnel',
        description: 'برج بارتفاع 32 متر',
      },
      {
        type: 'Tour de guet',
        name: 'برج مراقبة 6',
        latitude: 33.5234,
        longitude: -5.1289,
        status: 'Opérationnel',
        description: 'برج بارتفاع 26 متر',
      },
      {
        type: 'Tour de guet',
        name: 'برج مراقبة 7',
        latitude: 33.5178,
        longitude: -5.0945,
        status: 'Opérationnel',
        description: 'برج بارتفاع 29 متر',
      },
    ],
  });

  console.log('✅ Infrastructure created');

  // Create truck deployments
  await prisma.truckDeployment.createMany({
    data: [
      {
        truckId: 'TRUCK-001',
        truckName: 'شاحنة إطفاء 1',
        latitude: 33.5275,
        longitude: -5.1056,
        status: 'Disponible',
      },
      {
        truckId: 'TRUCK-002',
        truckName: 'شاحنة إطفاء 2',
        latitude: 33.5312,
        longitude: -5.1123,
        status: 'En route',
        assignedTo: 'Incident en cours',
      },
      {
        truckId: 'TRUCK-003',
        truckName: 'شاحنة إطفاء 3',
        latitude: 33.5198,
        longitude: -5.0987,
        status: 'Sur place',
        assignedTo: 'Zone agricole',
      },
      {
        truckId: 'TRUCK-004',
        truckName: 'سيارة تدخل سريع 1',
        latitude: 33.5356,
        longitude: -5.1189,
        status: 'Disponible',
      },
      {
        truckId: 'TRUCK-005',
        truckName: 'سيارة تدخل سريع 2',
        latitude: 33.5243,
        longitude: -5.1134,
        status: 'En route',
        assignedTo: 'منطقة صناعية',
      },
    ],
  });

  console.log('✅ Truck deployments created');

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

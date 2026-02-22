import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

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

  console.log('Users created');

  // Create fire incidents around Ifrane (GeoJSON location + IncidentStatus)
  await prisma.incident.createMany({
    data: [
      {
        location: { type: 'Point', coordinates: [-5.1056, 33.5275] },
        cause: 'CAMPFIRE_UNATTENDED',
        severity: 3,
        status: 'ETEINT',
        description: 'حريق نار مخيم بالقرب من المركز',
      },
      {
        location: { type: 'Point', coordinates: [-5.1123, 33.5312] },
        cause: 'CIGARETTE',
        severity: 2,
        status: 'ETEINT',
        description: 'حريق صغير بسبب سيجارة',
      },
      {
        location: { type: 'Point', coordinates: [-5.0987, 33.5198] },
        cause: 'AGRICULTURAL_BURNING',
        severity: 4,
        status: 'INTERVENTION',
        description: 'حريق زراعي خارج عن السيطرة',
      },
      {
        location: { type: 'Point', coordinates: [-5.1189, 33.5356] },
        cause: 'LIGHTNING',
        severity: 5,
        status: 'ALERTE',
        description: 'حريق كبير بسبب صاعقة',
      },
      {
        location: { type: 'Point', coordinates: [-5.1134, 33.5243] },
        cause: 'ELECTRICAL',
        severity: 2,
        status: 'ETEINT',
      },
      {
        location: { type: 'Point', coordinates: [-5.0923, 33.5389] },
        cause: 'UNKNOWN',
        severity: 3,
        status: 'MAITRISE',
      },
      {
        location: { type: 'Point', coordinates: [-5.1212, 33.5156] },
        cause: 'ARSON',
        severity: 4,
        status: 'ALERTE',
        description: 'حريق متعمد - تحت التحقيق',
      },
      {
        location: { type: 'Point', coordinates: [-5.1045, 33.5423] },
        cause: 'EQUIPMENT_MALFUNCTION',
        severity: 2,
        status: 'ETEINT',
      },
      {
        location: { type: 'Point', coordinates: [-5.0889, 33.5089] },
        cause: 'CAMPFIRE_UNATTENDED',
        severity: 3,
        status: 'VIGILANCE',
      },
      {
        location: { type: 'Point', coordinates: [-5.1167, 33.5467] },
        cause: 'OTHER',
        severity: 2,
        status: 'VIGILANCE',
      },
      {
        location: { type: 'Point', coordinates: [-5.0956, 33.5234] },
        cause: 'CIGARETTE',
        severity: 1,
        status: 'ETEINT',
      },
      {
        location: { type: 'Point', coordinates: [-5.1089, 33.5178] },
        cause: 'LIGHTNING',
        severity: 4,
        status: 'INTERVENTION',
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

  // Create infrastructure (GeoJSON geometry + InfrastructureType enum)
  await prisma.infrastructure.createMany({
    data: [
      // Water points
      {
        type: 'WATER_POINT',
        name: 'بئر مياه 1',
        geometry: { type: 'Point', coordinates: [-5.1067, 33.5289] },
        status: 'Opérationnel',
        description: 'بئر بسعة 50000 لتر',
      },
      {
        type: 'WATER_POINT',
        name: 'خزان مياه مركزي',
        geometry: { type: 'Point', coordinates: [-5.1089, 33.5256] },
        status: 'Opérationnel',
        description: 'خزان بسعة 100000 لتر',
      },
      {
        type: 'WATER_POINT',
        name: 'نقطة مياه طبيعية',
        geometry: { type: 'Point', coordinates: [-5.1145, 33.5334] },
        status: 'Opérationnel',
        description: 'نبع مياه طبيعي',
      },
      {
        type: 'WATER_POINT',
        name: 'بئر مياه 2',
        geometry: { type: 'Point', coordinates: [-5.0934, 33.5198] },
        status: 'Opérationnel',
        description: 'بئر بسعة 30000 لتر',
      },
      {
        type: 'WATER_POINT',
        name: 'حوض مياه',
        geometry: { type: 'Point', coordinates: [-5.1198, 33.5412] },
        status: 'Opérationnel',
        description: 'حوض مياه بسعة 75000 لتر',
      },
      // Firebreaks (LineString geometry)
      {
        type: 'FIREBREAK',
        name: 'خندق واقي شمالي',
        geometry: { type: 'LineString', coordinates: [[-5.1100, 33.5445], [-5.1150, 33.5460]] },
        status: 'Bon état',
        description: 'خندق بطول 2 كلم',
      },
      {
        type: 'FIREBREAK',
        name: 'خندق واقي جنوبي',
        geometry: { type: 'LineString', coordinates: [[-5.0950, 33.5123], [-5.0980, 33.5140]] },
        status: 'Bon état',
        description: 'خندق بطول 1.5 كلم',
      },
      {
        type: 'FIREBREAK',
        name: 'خندق واقي شرقي',
        geometry: { type: 'LineString', coordinates: [[-5.0840, 33.5289], [-5.0870, 33.5310]] },
        status: 'Nécessite entretien',
        description: 'خندق بطول 1.8 كلم',
      },
      {
        type: 'FIREBREAK',
        name: 'خندق واقي غربي',
        geometry: { type: 'LineString', coordinates: [[-5.1250, 33.5267], [-5.1290, 33.5280]] },
        status: 'Bon état',
        description: 'خندق بطول 2.2 كلم',
      },
      {
        type: 'FIREBREAK',
        name: 'خندق واقي المنطقة الوسطى',
        geometry: { type: 'LineString', coordinates: [[-5.1020, 33.5278], [-5.1070, 33.5295]] },
        status: 'Excellent état',
        description: 'خندق بطول 3 كلم',
      },
      // Watchtowers
      {
        type: 'WATCHTOWER',
        name: 'برج مراقبة 1',
        geometry: { type: 'Point', coordinates: [-5.1234, 33.5489] },
        status: 'Opérationnel',
        description: 'برج بارتفاع 25 متر',
      },
      {
        type: 'WATCHTOWER',
        name: 'برج مراقبة 2',
        geometry: { type: 'Point', coordinates: [-5.0878, 33.5156] },
        status: 'Opérationnel',
        description: 'برج بارتفاع 30 متر',
      },
      {
        type: 'WATCHTOWER',
        name: 'برج مراقبة 3',
        geometry: { type: 'Point', coordinates: [-5.1345, 33.5367] },
        status: 'En maintenance',
        description: 'برج بارتفاع 28 متر',
      },
      {
        type: 'WATCHTOWER',
        name: 'برج مراقبة 4',
        geometry: { type: 'Point', coordinates: [-5.1123, 33.5089] },
        status: 'Opérationnel',
        description: 'برج بارتفاع 27 متر',
      },
      {
        type: 'WATCHTOWER',
        name: 'برج مراقبة 5',
        geometry: { type: 'Point', coordinates: [-5.0967, 33.5423] },
        status: 'Opérationnel',
        description: 'برج بارتفاع 32 متر',
      },
      {
        type: 'WATCHTOWER',
        name: 'برج مراقبة 6',
        geometry: { type: 'Point', coordinates: [-5.1289, 33.5234] },
        status: 'Opérationnel',
        description: 'برج بارتفاع 26 متر',
      },
      {
        type: 'WATCHTOWER',
        name: 'برج مراقبة 7',
        geometry: { type: 'Point', coordinates: [-5.0945, 33.5178] },
        status: 'Opérationnel',
        description: 'برج بارتفاع 29 متر',
      },
    ],
  });

  console.log('✅ Infrastructure created');

  // Create resources
  await prisma.resource.createMany({
    data: [
      {
        type: 'TRUCK',
        name: 'شاحنة إطفاء 1',
        location: { type: 'Point', coordinates: [-5.1056, 33.5275] },
        status: 'Disponible',
      },
      {
        type: 'TRUCK',
        name: 'شاحنة إطفاء 2',
        location: { type: 'Point', coordinates: [-5.1123, 33.5312] },
        status: 'En route',
        assignedTo: 'Incident en cours',
      },
      {
        type: 'TRUCK',
        name: 'شاحنة إطفاء 3',
        location: { type: 'Point', coordinates: [-5.0987, 33.5198] },
        status: 'Sur place',
        assignedTo: 'Zone agricole',
      },
      {
        type: 'AIRCRAFT',
        name: 'Avion bombardier 1',
        location: { type: 'Point', coordinates: [-5.1200, 33.5400] },
        status: 'Disponible',
      },
      {
        type: 'AIRCRAFT',
        name: 'Hélicoptère 1',
        location: { type: 'Point', coordinates: [-5.0900, 33.5300] },
        status: 'En mission',
        assignedTo: 'Zone forestière nord',
      },
      {
        type: 'PERSONNEL',
        name: 'Équipe pompiers A',
        location: { type: 'Point', coordinates: [-5.1056, 33.5275] },
        status: 'Disponible',
      },
      {
        type: 'PERSONNEL',
        name: 'Équipe pompiers B',
        location: { type: 'Point', coordinates: [-5.0987, 33.5198] },
        status: 'En intervention',
        assignedTo: 'Incident agricole',
      },
      {
        type: 'EQUIPMENT',
        name: 'Groupe électrogène',
        location: { type: 'Point', coordinates: [-5.1056, 33.5275] },
        status: 'Disponible',
      },
    ],
  });

  console.log('✅ Resources created');

  // Create risk basins (polygon geometries around Ifrane)
  await prisma.riskBasin.createMany({
    data: [
      {
        name: 'Zone forestière nord',
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [-5.1300, 33.5450],
            [-5.1100, 33.5500],
            [-5.0900, 33.5450],
            [-5.0900, 33.5350],
            [-5.1100, 33.5300],
            [-5.1300, 33.5350],
            [-5.1300, 33.5450],
          ]],
        },
        riskLevel: 4,
        description: 'Zone boisée dense au nord de Ifrane',
      },
      {
        name: 'Zone agricole sud',
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [-5.1200, 33.5250],
            [-5.1000, 33.5250],
            [-5.0800, 33.5200],
            [-5.0800, 33.5100],
            [-5.1000, 33.5100],
            [-5.1200, 33.5150],
            [-5.1200, 33.5250],
          ]],
        },
        riskLevel: 2,
        description: 'Terrains agricoles au sud',
      },
      {
        name: 'Périphérie urbaine',
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [-5.1150, 33.5350],
            [-5.0950, 33.5350],
            [-5.0950, 33.5250],
            [-5.1150, 33.5250],
            [-5.1150, 33.5350],
          ]],
        },
        riskLevel: 1,
        description: 'Zone urbaine périphérique',
      },
    ],
  });

  console.log('✅ Risk basins created');

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

  // Create dispatch teams around Ifrane
  await prisma.team.createMany({
    data: [
      {
        name: 'Station 1 Alpha',
        type: 'GROUND_CREW',
        status: 'AVAILABLE',
        location: { type: 'Point', coordinates: [-5.1056, 33.5275] },
        capacity: 5,
        equipment: ['truck', 'hoses', 'axes'],
      },
      {
        name: 'Station 2 Bravo',
        type: 'GROUND_CREW',
        status: 'AVAILABLE',
        location: { type: 'Point', coordinates: [-5.1189, 33.5356] },
        capacity: 4,
        equipment: ['truck', 'hoses'],
      },
      {
        name: 'Aerial Unit Charlie',
        type: 'AERIAL_SUPPORT',
        status: 'AVAILABLE',
        location: { type: 'Point', coordinates: [-5.0923, 33.5389] },
        capacity: 3,
        equipment: ['helicopter', 'bambi_bucket'],
      },
      {
        name: 'Command Post Delta',
        type: 'COMMAND_UNIT',
        status: 'AVAILABLE',
        location: { type: 'Point', coordinates: [-5.1100, 33.5300] },
        capacity: 6,
        equipment: ['command_vehicle', 'comms'],
      },
    ],
  });

  console.log('✅ Dispatch teams created');

  // Create dispatch vehicles around Ifrane
  await prisma.vehicle.createMany({
    data: [
      {
        callSign: 'FT-001',
        type: 'FIRE_TRUCK',
        status: 'AVAILABLE',
        capabilities: ['water_pump', 'ladder', 'foam'],
        baseLocation: { type: 'Point', coordinates: [-5.1056, 33.5275] },
        location: { type: 'Point', coordinates: [-5.1056, 33.5275] },
        capacity: 5000,
      },
      {
        callSign: 'FT-002',
        type: 'FIRE_TRUCK',
        status: 'AVAILABLE',
        capabilities: ['water_pump', 'hose_reel'],
        baseLocation: { type: 'Point', coordinates: [-5.1189, 33.5356] },
        location: { type: 'Point', coordinates: [-5.1189, 33.5356] },
        capacity: 3000,
      },
      {
        callSign: 'WT-001',
        type: 'WATER_TANKER',
        status: 'AVAILABLE',
        capabilities: ['water_tank', 'pump'],
        baseLocation: { type: 'Point', coordinates: [-5.0923, 33.5389] },
        location: { type: 'Point', coordinates: [-5.0923, 33.5389] },
        capacity: 10000,
      },
      {
        callSign: 'CMD-001',
        type: 'COMMAND',
        status: 'AVAILABLE',
        capabilities: ['comms', 'gps', 'mapping'],
        baseLocation: { type: 'Point', coordinates: [-5.1100, 33.5300] },
        location: { type: 'Point', coordinates: [-5.1100, 33.5300] },
        capacity: 0,
      },
    ],
  });

  console.log('✅ Dispatch vehicles created');

  console.log('Seed completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Ifrane coordinates: 33.52532, -5.11384
const IFRANE_LAT = 33.52532;
const IFRANE_LNG = -5.11384;

// Generate random coordinates near Ifrane
function generateNearbyCoordinates(baseLat: number, baseLng: number, radiusKm: number = 10) {
  const radiusInDegrees = radiusKm / 111;
  const u = Math.random();
  const v = Math.random();
  const w = radiusInDegrees * Math.sqrt(u);
  const t = 2 * Math.PI * v;
  const x = w * Math.cos(t);
  const y = w * Math.sin(t);
  
  return {
    latitude: baseLat + x,
    longitude: baseLng + y,
  };
}

async function main() {
  console.log('🌱 Starting seed...');

  // Clear existing data
  await prisma.truckDeployment.deleteMany();
  await prisma.infrastructure.deleteMany();
  await prisma.retardantProduct.deleteMany();
  await prisma.equipment.deleteMany();
  await prisma.report.deleteMany();
  await prisma.incident.deleteMany();
  await prisma.user.deleteMany();

  // Create test users
  const hashedPassword = await bcrypt.hash('password123', 10);

  const civilian = await prisma.user.create({
    data: {
      cin: 'AB123456',
      phone: '+212600000001',
      password: hashedPassword,
      role: 'CIVILIAN',
    },
  });

  const official = await prisma.user.create({
    data: {
      cin: 'CD789012',
      phone: '+212600000002',
      password: hashedPassword,
      role: 'OFFICIAL',
      department: 'HCEFLCD',
      position: 'Chef de Secteur',
    },
  });

  console.log('✅ Created users');

  // Create mock incidents (fires)
  const causes = [
    'CAMPFIRE_UNATTENDED',
    'CIGARETTE',
    'AGRICULTURAL_BURNING',
    'ELECTRICAL',
    'LIGHTNING',
    'ARSON',
    'EQUIPMENT_MALFUNCTION',
    'OTHER',
  ];

  const incidents = [];
  for (let i = 0; i < 12; i++) {
    const coords = generateNearbyCoordinates(IFRANE_LAT, IFRANE_LNG, 15);
    const daysAgo = Math.floor(Math.random() * 14);
    
    incidents.push({
      ...coords,
      cause: causes[Math.floor(Math.random() * causes.length)] as any,
      severity: Math.floor(Math.random() * 5) + 1,
      status: i < 3 ? 'PENDING' : i < 7 ? 'IN_PROGRESS' : 'COMPLETED',
      description: `Incident de feu détecté dans la région d'Ifrane`,
      createdAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
    });
  }

  await prisma.incident.createMany({ data: incidents });
  console.log('✅ Created incidents');

  // Create sample reports
  const reports = [];
  for (let i = 0; i < 5; i++) {
    const coords = generateNearbyCoordinates(IFRANE_LAT, IFRANE_LNG, 8);
    reports.push({
      userId: civilian.id,
      ...coords,
      description: `Rapport de fumée observée près de la forêt. Détails: Zone ${i + 1}`,
      status: i === 0 ? 'PENDING' : i === 1 ? 'IN_PROGRESS' : 'COMPLETED',
      cause: i % 2 === 0 ? causes[Math.floor(Math.random() * causes.length)] as any : null,
      createdAt: new Date(Date.now() - i * 2 * 24 * 60 * 60 * 1000),
    });
  }

  await prisma.report.createMany({ data: reports });
  console.log('✅ Created reports');

  // Create equipment
  const equipmentData = [
    { category: 'Materiel Roulant', name: 'VPI Toyota', quantity: 5, condition: 'Bon', location: 'Ifrane Station' },
    { category: 'Materiel Roulant', name: 'Camion Citerne', quantity: 3, condition: 'Bon', location: 'Ifrane Station' },
    { category: 'Petit Materiel', name: 'Débroussailleuses', quantity: 15, condition: 'Bon', location: 'Magasin' },
    { category: 'Petit Materiel', name: 'Tronçonneuses', quantity: 10, condition: 'Moyen', location: 'Magasin' },
    { category: 'Petit Materiel', name: 'Battes à feu', quantity: 50, condition: 'Bon', location: 'Magasin' },
    { category: 'Petit Materiel', name: 'Pelles', quantity: 40, condition: 'Bon', location: 'Magasin' },
    { category: 'Petit Materiel', name: 'Pioches', quantity: 35, condition: 'Bon', location: 'Magasin' },
    { category: 'Petit Materiel', name: 'Pompes dorsales', quantity: 20, condition: 'Moyen', location: 'Magasin' },
    { category: 'Habillement', name: 'Chemises de protection', quantity: 100, condition: 'Bon', location: 'Magasin' },
    { category: 'Habillement', name: 'Gants', quantity: 150, condition: 'Bon', location: 'Magasin' },
    { category: 'Habillement', name: 'Casques', quantity: 80, condition: 'Bon', location: 'Magasin' },
    { category: 'Communication', name: 'GPS', quantity: 12, condition: 'Bon', location: 'Bureau' },
    { category: 'Communication', name: 'Jumelles', quantity: 8, condition: 'Bon', location: 'Bureau' },
    { category: 'Campement', name: 'Tentes', quantity: 10, condition: 'Bon', location: 'Magasin' },
    { category: 'Campement', name: 'Lits de camp', quantity: 20, condition: 'Moyen', location: 'Magasin' },
  ];

  await prisma.equipment.createMany({
    data: equipmentData.map(eq => ({
      ...eq,
      lastMaintenance: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
    })),
  });
  console.log('✅ Created equipment');

  // Create retardant products
  await prisma.retardantProduct.createMany({
    data: [
      {
        productName: 'Fire-Trol LCG-R',
        acquisitionDate: new Date('2023-05-15'),
        storageLocation: 'Magasin',
        quantity: 5000,
      },
      {
        productName: 'Phos-Chek D75-F',
        acquisitionDate: new Date('2023-08-20'),
        storageLocation: 'Aeroport',
        quantity: 3000,
      },
      {
        productName: 'Fire-Trol GTS-R',
        acquisitionDate: new Date('2024-01-10'),
        storageLocation: 'Magasin',
        quantity: 4500,
      },
    ],
  });
  console.log('✅ Created retardant products');

  // Create infrastructure
  const infrastructureData = [];
  
  // Points d'eau
  for (let i = 0; i < 8; i++) {
    const coords = generateNearbyCoordinates(IFRANE_LAT, IFRANE_LNG, 12);
    infrastructureData.push({
      type: "Point d'eau",
      name: `Point d'eau ${i + 1}`,
      ...coords,
      status: 'Opérationnel',
      description: `Capacité: ${Math.floor(Math.random() * 50 + 20)}m³`,
    });
  }

  // Tranches Pare-Feu
  for (let i = 0; i < 5; i++) {
    const coords = generateNearbyCoordinates(IFRANE_LAT, IFRANE_LNG, 10);
    infrastructureData.push({
      type: 'Tranche Pare-Feu',
      name: `TPF ${i + 1}`,
      ...coords,
      status: 'Opérationnel',
      description: `Longueur: ${Math.floor(Math.random() * 500 + 100)}m`,
    });
  }

  // Postes Vigies
  for (let i = 0; i < 4; i++) {
    const coords = generateNearbyCoordinates(IFRANE_LAT, IFRANE_LNG, 15);
    infrastructureData.push({
      type: 'Poste Vigie',
      name: `Poste Vigie ${i + 1}`,
      ...coords,
      status: 'Opérationnel',
      description: 'Tour d\'observation',
    });
  }

  await prisma.infrastructure.createMany({ data: infrastructureData });
  console.log('✅ Created infrastructure');

  // Create truck deployments
  const trucks = [];
  for (let i = 0; i < 5; i++) {
    const coords = generateNearbyCoordinates(IFRANE_LAT, IFRANE_LNG, 5);
    trucks.push({
      truckId: `VPI-${1000 + i}`,
      truckName: `Camion ${i + 1}`,
      ...coords,
      status: i === 0 ? 'En route' : i === 1 ? 'Sur place' : 'Disponible',
      assignedTo: i < 2 ? 'Secteur Nord' : null,
    });
  }

  await prisma.truckDeployment.createMany({ data: trucks });
  console.log('✅ Created truck deployments');

  console.log('🎉 Seed completed successfully!');
  console.log('\n📝 Test Credentials:');
  console.log('Civilian - CIN: AB123456, Password: password123');
  console.log('Official - CIN: CD789012, Password: password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

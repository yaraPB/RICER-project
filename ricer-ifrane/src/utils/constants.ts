export const FIRE_CAUSES = {
  CAMPFIRE_UNATTENDED: 'نار مخيم غير مراقبة',
  CIGARETTE: 'سيجارة',
  AGRICULTURAL_BURNING: 'حرق زراعي',
  ELECTRICAL: 'كهربائي',
  LIGHTNING: 'صاعقة',
  ARSON: 'حريق متعمد',
  EQUIPMENT_MALFUNCTION: 'عطل في المعدات',
  OTHER: 'أخرى',
  UNKNOWN: 'غير معروف',
} as const;

export const DEPARTMENTS = {
  ADM: 'الطرق السيارة بالمغرب',
  CCDRF: 'مركز الحفاظ على الموارد الغابوية',
  CEDEFO: 'مركز الدفاع عن الغابات',
  DFCI: 'الدفاع عن الغابات ضد الحرائق',
  DPEFLCD: 'المديرية الإقليمية للمياه والغابات',
  DREFLCD: 'المديرية الجهوية للمياه والغابات',
  FA: 'القوات المساعدة',
  FAR: 'القوات المسلحة الملكية',
  GR: 'الدرك الملكي',
  HCEFLCD: 'المندوبية السامية للمياه والغابات',
  MET: 'وزارة التجهيز والنقل',
  MI: 'وزارة الداخلية',
  MJS: 'وزارة الشباب والرياضة',
  ONCE: 'المكتب الوطني للسكك الحديدية',
  ONDA: 'المكتب الوطني للمطارات',
  ONEEP: 'المكتب الوطني للكهرباء والماء',
  PN: 'الإنعاش الوطني',
} as const;

// NEW: Bilingual department names
export const DEPARTMENTS_FR = {
  ADM: 'Autoroutes du Maroc',
  CCDRF: 'Centre Conservation des Ressources Forestières',
  CEDEFO: 'Centre de Défense Forestière',
  DFCI: 'Défense des Forêts Contre les Incendies',
  DPEFLCD: 'Direction Provinciale des Eaux et Forêts',
  DREFLCD: 'Direction Régionale des Eaux et Forêts',
  FA: 'Forces Auxiliaires',
  FAR: 'Forces Armées Royales',
  GR: 'Gendarmerie Royale',
  HCEFLCD: 'Haut-Commissariat aux Eaux et Forêts',
  MET: 'Ministère de l\'Équipement et du Transport',
  MI: 'Ministère de l\'Intérieur',
  MJS: 'Ministère de la Jeunesse et des Sports',
  ONCE: 'Office National des Chemins de Fer',
  ONDA: 'Office National des Aéroports',
  ONEEP: 'Office National de l\'Électricité et de l\'Eau Potable',
  PN: 'Promotion Nationale',
} as const;

export function getDepartmentName(code: keyof typeof DEPARTMENTS, language: 'ar' | 'fr'): string {
  if (language === 'fr') {
    return DEPARTMENTS_FR[code];
  }
  return DEPARTMENTS[code];
}

export const STATUS_LABELS = {
  PENDING: 'قيد الانتظار',
  IN_PROGRESS: 'قيد المعالجة',
  COMPLETED: 'مكتمل',
} as const;

export const STATUS_COLORS = {
  PENDING: '#ef4444', // red
  IN_PROGRESS: '#f97316', // orange
  COMPLETED: '#22c55e', // green
} as const;

export const IFRANE_COORDINATES = {
  lat: 33.5275,
  lng: -5.1056,
} as const;

export function getWindDirection(degrees: number): string {
  const directions = [
    'شمال',
    'شمال شرق',
    'شرق',
    'جنوب شرق',
    'جنوب',
    'جنوب غرب',
    'غرب',
    'شمال غرب',
  ];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('ar-MA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

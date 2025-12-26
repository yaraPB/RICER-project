export const IFRANE_COORDINATES = {
  lat: 33.52532,
  lng: -5.11384,
};

export const DEPARTMENTS = [
  { value: 'ADM', label: 'الطرق السيارة بالمغرب', labelFr: 'Autoroutes du Maroc' },
  { value: 'CCDRF', label: 'مركز الحفاظ على الموارد الغابوية وتنميتها', labelFr: 'Centre de Conservation et de Développement des Ressources Forestières' },
  { value: 'CEDEFO', label: 'مركز الدفاع عن الغابات', labelFr: 'Centre de Défense des Forêts' },
  { value: 'DFCI', label: 'الدفاع عن الغابات ضد الحرائق', labelFr: 'Défense de Forêts Contre les Incendies' },
  { value: 'DPEFLCD', label: 'المديرية الإقليمية للمياه والغابات ومحاربة التصحر', labelFr: 'Direction Provinciale des Eaux et Forêts et de la Lutte Contre la Désertification' },
  { value: 'DREFLCD', label: 'المديرية الجهوية للمياه والغابات ومحاربة التصحر', labelFr: 'Direction Régionale des Eaux et Forêts et de la Lutte Contre la Désertification' },
  { value: 'FA', label: 'القوات المساعدة', labelFr: 'Forces Auxiliaires' },
  { value: 'FAR', label: 'القوات المسلحة الملكية', labelFr: 'Forces Armées Royales' },
  { value: 'GR', label: 'الدرك الملكي', labelFr: 'Gendarmerie Royale' },
  { value: 'HCEFLCD', label: 'المندوبية السامية للمياه والغابات ومحاربة التصحر', labelFr: 'Haut Commissariat aux Eaux et Forêts et à la Lutte contre la Désertification' },
  { value: 'MET', label: 'وزارة التجهيز والنقل', labelFr: "Ministère de l'Équipement et du Transport" },
  { value: 'MI', label: 'وزارة الداخلية', labelFr: "Ministère de l'Intérieur" },
  { value: 'MJS', label: 'وزارة الشباب والرياضة', labelFr: 'Ministère de la Jeunesse et des Sports' },
  { value: 'ONCE', label: 'المكتب الوطني للسكك الحديدية', labelFr: 'Office National des Chemins de Fer' },
  { value: 'ONDA', label: 'المكتب الوطني للمطارات', labelFr: 'Office National Des Aéroports' },
  { value: 'ONEEP', label: 'المكتب الوطني للكهرباء والماء الصالح للشرب', labelFr: "Office National de l'Électricité et de l'Eau Potable" },
  { value: 'PN', label: 'الإنعاش الوطني', labelFr: 'Promotion Nationale' },
];

export const FIRE_CAUSES = [
  { value: 'CAMPFIRE_UNATTENDED', label: 'نار مخيم غير مراقبة', labelFr: 'Feu de camp non surveillé' },
  { value: 'CIGARETTE', label: 'سيجارة', labelFr: 'Cigarette' },
  { value: 'AGRICULTURAL_BURNING', label: 'حرق زراعي', labelFr: 'Brûlage agricole' },
  { value: 'ELECTRICAL', label: 'كهربائي', labelFr: 'Électrique' },
  { value: 'LIGHTNING', label: 'صاعقة', labelFr: 'Foudre' },
  { value: 'ARSON', label: 'حريق متعمد', labelFr: 'Incendie criminel' },
  { value: 'EQUIPMENT_MALFUNCTION', label: 'عطل في المعدات', labelFr: 'Dysfonctionnement d\'équipement' },
  { value: 'OTHER', label: 'أخرى', labelFr: 'Autre' },
  { value: 'UNKNOWN', label: 'غير معروف', labelFr: 'Inconnu' },
];

export const STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  IN_PROGRESS: 'bg-orange-100 text-orange-800',
  COMPLETED: 'bg-green-100 text-green-800',
};

export const STATUS_LABELS = {
  PENDING: 'قيد الانتظار',
  IN_PROGRESS: 'قيد التنفيذ',
  COMPLETED: 'مكتمل',
};

export const STATUS_LABELS_FR = {
  PENDING: 'En attente',
  IN_PROGRESS: 'En cours',
  COMPLETED: 'Terminé',
};

export const SEVERITY_COLORS = [
  'text-green-600',
  'text-yellow-600',
  'text-orange-600',
  'text-red-600',
  'text-red-800',
];

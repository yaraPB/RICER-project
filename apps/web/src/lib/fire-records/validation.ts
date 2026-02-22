// ============================================
// Enums
// ============================================

export const ALERT_SOURCES = [
  'FIRMS_SATELLITE',
  'CITIZEN_REPORT',
  'PATROL',
  'PHONE_CALL',
  'RADIO',
  'OTHER',
] as const;
export type AlertSource = (typeof ALERT_SOURCES)[number];

export const RECORD_STATUSES = ['DRAFT', 'VALIDATED', 'APPROVED'] as const;
export type RecordStatus = (typeof RECORD_STATUSES)[number];

export const LOCKABLE_SECTIONS = [
  'timeline',
  'agencyArrivals',
  'meansEngaged',
  'economicLoss',
  'perimeter',
] as const;
export type LockableSection = (typeof LOCKABLE_SECTIONS)[number];

// ============================================
// Enum validators
// ============================================

export function isAlertSource(value: unknown): value is AlertSource {
  return typeof value === 'string' && (ALERT_SOURCES as readonly string[]).includes(value);
}

export function isRecordStatus(value: unknown): value is RecordStatus {
  return typeof value === 'string' && (RECORD_STATUSES as readonly string[]).includes(value);
}

export function isLockableSection(value: unknown): value is LockableSection {
  return typeof value === 'string' && (LOCKABLE_SECTIONS as readonly string[]).includes(value);
}

// ============================================
// Sub-interfaces
// ============================================

export interface AgencyArrival {
  agencyName: string;
  arrivedAt: string; // ISO date
  personnelCount: number;
}

export interface MeansEngaged {
  vehicleCount: number;
  aircraftCount: number;
  personnelCount: number;
  waterVolumeLiters: number;
  retardantVolumeLiters: number;
}

export interface EconomicLoss {
  forestAreaHa: number;
  infrastructureDamage: number; // MAD
  agricultureDamage: number; // MAD
  otherDamage: number; // MAD
  totalEstimate: number; // MAD
}

export interface AuditEntry {
  userId: string;
  cin: string;
  action: string;
  section?: string;
  changes?: Record<string, unknown>;
  timestamp: string; // ISO date
}

// ============================================
// Struct validators
// ============================================

export function validateAgencyArrivals(value: unknown): { valid: boolean; error?: string } {
  if (!Array.isArray(value)) return { valid: false, error: 'agencyArrivals must be an array' };

  for (let i = 0; i < value.length; i++) {
    const entry = value[i];
    if (!entry || typeof entry !== 'object') {
      return { valid: false, error: `agencyArrivals[${i}] must be an object` };
    }
    const e = entry as Record<string, unknown>;
    if (typeof e.agencyName !== 'string' || !e.agencyName) {
      return { valid: false, error: `agencyArrivals[${i}].agencyName is required` };
    }
    if (typeof e.arrivedAt !== 'string' || !e.arrivedAt) {
      return { valid: false, error: `agencyArrivals[${i}].arrivedAt is required` };
    }
    if (typeof e.personnelCount !== 'number' || e.personnelCount < 0) {
      return { valid: false, error: `agencyArrivals[${i}].personnelCount must be a non-negative number` };
    }
  }

  return { valid: true };
}

export function validateMeansEngaged(value: unknown): { valid: boolean; error?: string } {
  if (!value || typeof value !== 'object') return { valid: false, error: 'meansEngaged must be an object' };

  const m = value as Record<string, unknown>;
  const numericFields = ['vehicleCount', 'aircraftCount', 'personnelCount', 'waterVolumeLiters', 'retardantVolumeLiters'];

  for (const field of numericFields) {
    if (m[field] !== undefined) {
      if (typeof m[field] !== 'number') {
        return { valid: false, error: `meansEngaged.${field} must be a number` };
      }
      if ((m[field] as number) < 0) {
        return { valid: false, error: `meansEngaged.${field} must be non-negative` };
      }
    }
  }

  return { valid: true };
}

export function validateEconomicLoss(value: unknown): { valid: boolean; error?: string } {
  if (!value || typeof value !== 'object') return { valid: false, error: 'economicLoss must be an object' };

  const e = value as Record<string, unknown>;
  const numericFields = ['forestAreaHa', 'infrastructureDamage', 'agricultureDamage', 'otherDamage', 'totalEstimate'];

  for (const field of numericFields) {
    if (e[field] !== undefined) {
      if (typeof e[field] !== 'number') {
        return { valid: false, error: `economicLoss.${field} must be a number` };
      }
      if ((e[field] as number) < 0) {
        return { valid: false, error: `economicLoss.${field} must be non-negative` };
      }
    }
  }

  return { valid: true };
}

// ============================================
// Audit entry helper
// ============================================

export function createAuditEntry(
  userId: string,
  cin: string,
  action: string,
  section?: string,
  changes?: Record<string, unknown>
): AuditEntry {
  return {
    userId,
    cin,
    action,
    ...(section && { section }),
    ...(changes && { changes }),
    timestamp: new Date().toISOString(),
  };
}

// ============================================
// Field → Section mapping
// ============================================

const FIELD_TO_SECTION: Record<string, LockableSection> = {
  alertSource: 'timeline',
  alertReceivedAt: 'timeline',
  verifiedAt: 'timeline',
  firstResponseAt: 'timeline',
  onSceneAt: 'timeline',
  containedAt: 'timeline',
  extinguishedAt: 'timeline',
  agencyArrivals: 'agencyArrivals',
  meansEngaged: 'meansEngaged',
  economicLoss: 'economicLoss',
};

/**
 * Check if any of the fields being updated belong to a locked section.
 */
export function isSectionLocked(
  lockedSections: string[],
  fieldsBeingUpdated: string[]
): { locked: boolean; section?: string } {
  for (const field of fieldsBeingUpdated) {
    const section = FIELD_TO_SECTION[field];
    if (section && lockedSections.includes(section)) {
      return { locked: true, section };
    }
  }
  return { locked: false };
}

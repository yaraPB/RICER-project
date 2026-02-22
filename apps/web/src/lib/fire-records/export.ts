/**
 * Pure functions for exporting fire records to CSV and GeoJSON.
 */

interface FireRecordRow {
  id: string;
  incidentId: string;
  alertSource: string;
  recordStatus: string;
  burnAreaHa?: number | null;
  alertReceivedAt?: string | Date | null;
  verifiedAt?: string | Date | null;
  firstResponseAt?: string | Date | null;
  onSceneAt?: string | Date | null;
  containedAt?: string | Date | null;
  extinguishedAt?: string | Date | null;
  burnPerimeter?: unknown;
  burnCentroid?: unknown;
  createdAt: string | Date;
}

function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function toDateStr(val: string | Date | null | undefined): string {
  if (!val) return '';
  return new Date(val).toISOString();
}

export function recordsToCSV(records: FireRecordRow[]): string {
  const headers = [
    'id',
    'incidentId',
    'alertSource',
    'recordStatus',
    'burnAreaHa',
    'alertReceivedAt',
    'verifiedAt',
    'firstResponseAt',
    'onSceneAt',
    'containedAt',
    'extinguishedAt',
    'createdAt',
  ];

  const rows = records.map((r) => [
    escapeCSV(r.id),
    escapeCSV(r.incidentId),
    escapeCSV(r.alertSource),
    escapeCSV(r.recordStatus),
    r.burnAreaHa != null ? String(r.burnAreaHa) : '',
    toDateStr(r.alertReceivedAt),
    toDateStr(r.verifiedAt),
    toDateStr(r.firstResponseAt),
    toDateStr(r.onSceneAt),
    toDateStr(r.containedAt),
    toDateStr(r.extinguishedAt),
    toDateStr(r.createdAt),
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

export function recordsToGeoJSON(records: FireRecordRow[]): object {
  const features = records
    .filter((r) => r.burnPerimeter != null)
    .map((r) => ({
      type: 'Feature' as const,
      geometry: r.burnPerimeter,
      properties: {
        id: r.id,
        incidentId: r.incidentId,
        alertSource: r.alertSource,
        recordStatus: r.recordStatus,
        burnAreaHa: r.burnAreaHa,
        createdAt: toDateStr(r.createdAt),
      },
    }));

  return {
    type: 'FeatureCollection',
    features,
  };
}

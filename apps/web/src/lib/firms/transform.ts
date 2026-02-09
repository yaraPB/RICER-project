import type { GeoFeatureCollection, GeoFirmsDetectionProps, FirmsDetection } from '@/types';
import { logger } from '@/lib/observability/logger';

/**
 * Parse CSV line to FirmsDetection object
 * CSV columns: latitude,longitude,brightness,scan,track,acq_date,acq_time,satellite,instrument,confidence,version,bright_t31,frp,daynight
 */
function parseCSVLine(line: string, index: number): FirmsDetection | null {
  const cols = line.split(',');
  if (cols.length < 14) {
    logger.warn({
      event: 'firms_csv_invalid_line',
      meta: { lineIndex: index, columnCount: cols.length, line: line.slice(0, 100) }
    });
    return null;
  }

  const latitude = parseFloat(cols[0]);
  const longitude = parseFloat(cols[1]);
  const brightness = parseFloat(cols[2]);
  const scan = parseFloat(cols[3]);
  const track = parseFloat(cols[4]);
  const bright_t31 = parseFloat(cols[11]);
  const frp = parseFloat(cols[12]);

  // Validate critical numeric fields
  if (
    isNaN(latitude) || isNaN(longitude) || isNaN(brightness) || isNaN(frp) ||
    isNaN(scan) || isNaN(track)
  ) {
    logger.warn({
      event: 'firms_invalid_numeric_fields',
      meta: { line: index, latitude, longitude, brightness, frp }
    });
    return null;
  }

  // Validate coordinate bounds
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    logger.warn({
      event: 'firms_invalid_coords',
      meta: { line: index, latitude, longitude }
    });
    return null;
  }

  // Parse confidence (can be string like "nominal" or number 0-100)
  let confidence: 'low' | 'nominal' | 'high' | number;
  const confidenceNum = parseFloat(cols[9]);
  if (!isNaN(confidenceNum)) {
    confidence = confidenceNum;
  } else if (['low', 'nominal', 'high'].includes(cols[9].toLowerCase())) {
    confidence = cols[9].toLowerCase() as 'low' | 'nominal' | 'high';
  } else {
    logger.warn({
      event: 'firms_invalid_confidence',
      meta: { line: index, confidence: cols[9] }
    });
    confidence = 'nominal'; // Default to nominal
  }

  // Validate daynight field
  const daynight = cols[13] as 'D' | 'N';
  if (daynight !== 'D' && daynight !== 'N') {
    logger.warn({
      event: 'firms_invalid_daynight',
      meta: { line: index, daynight: cols[13] }
    });
  }

  return {
    id: `${latitude},${longitude},${cols[6]}`, // lat,lon,acq_time
    latitude,
    longitude,
    brightness,
    scan,
    track,
    acq_date: cols[5],
    acq_time: cols[6],
    satellite: cols[7],
    instrument: cols[8],
    confidence,
    version: cols[10],
    bright_t31,
    frp,
    daynight: daynight || 'D',
  };
}

/**
 * Check if detection is recent (within last 12 hours) for pulsing animation
 */
function isRecentDetection(acqDate: string, acqTime: string): boolean {
  try {
    const detectionTime = new Date(`${acqDate}T${acqTime.slice(0, 2)}:${acqTime.slice(2)}:00Z`);
    const now = new Date();
    const ageHours = (now.getTime() - detectionTime.getTime()) / (1000 * 60 * 60);
    return ageHours <= 12;
  } catch {
    return false;
  }
}

/**
 * Transform FIRMS CSV response to GeoJSON FeatureCollection
 */
export function transformFirmsToGeoJSON(csvText: string): GeoFeatureCollection<GeoFirmsDetectionProps> {
  const lines = csvText.trim().split('\n');

  // Skip header row if present
  if (lines.length > 0 && lines[0].toLowerCase().includes('latitude')) {
    lines.shift();
  }

  if (lines.length === 0) {
    logger.warn({ event: 'firms_empty_response', meta: { csvLength: csvText.length } });
    return { type: 'FeatureCollection', features: [] };
  }

  let validCount = 0;
  let invalidCount = 0;

  const features = lines
    .map((line, idx) => {
      const det = parseCSVLine(line, idx);
      if (!det) {
        invalidCount++;
        return null;
      }
      validCount++;
      return det;
    })
    .filter((det): det is FirmsDetection => det !== null)
    .map((det) => ({
      type: 'Feature' as const,
      geometry: {
        type: 'Point' as const,
        coordinates: [det.longitude, det.latitude] as [number, number],
      },
      properties: {
        id: det.id,
        brightness: det.brightness,
        frp: det.frp,
        confidence: det.confidence,
        satellite: det.satellite,
        instrument: det.instrument,
        acqDateTime: `${det.acq_date} ${det.acq_time.slice(0, 2)}:${det.acq_time.slice(2)}`,
        daynight: det.daynight,
        isRecent: isRecentDetection(det.acq_date, det.acq_time),
      },
    }));

  logger.info({
    event: 'firms_transform_complete',
    meta: {
      totalLines: lines.length,
      validFeatures: validCount,
      invalidFeatures: invalidCount,
      dataQualityPercent: Math.round((validCount / lines.length) * 100)
    }
  });

  return {
    type: 'FeatureCollection',
    features,
  };
}

/**
 * Type guard for FIRMS CSV response validation
 */
export function isFirmsCSVResponse(text: string): boolean {
  const lines = text.trim().split('\n');
  if (lines.length === 0) return false;

  // Check if first line is header or has expected column count
  const firstLine = lines[0];
  const hasHeader = firstLine.toLowerCase().includes('latitude');
  const hasValidColumnCount = firstLine.split(',').length >= 14;

  return hasHeader || (hasValidColumnCount && lines.length > 0);
}

/**
 * Get summary statistics from FIRMS detections
 */
export function getFirmsStats(collection: GeoFeatureCollection<GeoFirmsDetectionProps>) {
  const detections = collection.features;

  if (detections.length === 0) {
    return {
      total: 0,
      highConfidence: 0,
      nominalConfidence: 0,
      lowConfidence: 0,
      avgFRP: 0,
      maxFRP: 0,
      recentCount: 0,
    };
  }

  let highConfidence = 0;
  let nominalConfidence = 0;
  let lowConfidence = 0;
  let totalFRP = 0;
  let maxFRP = 0;
  let recentCount = 0;

  for (const feature of detections) {
    const { confidence, frp, isRecent } = feature.properties;

    // Count by confidence
    if (confidence === 'high' || (typeof confidence === 'number' && confidence >= 75)) {
      highConfidence++;
    } else if (confidence === 'low' || (typeof confidence === 'number' && confidence < 50)) {
      lowConfidence++;
    } else {
      nominalConfidence++;
    }

    // FRP stats
    totalFRP += frp;
    if (frp > maxFRP) maxFRP = frp;

    // Recent count
    if (isRecent) recentCount++;
  }

  return {
    total: detections.length,
    highConfidence,
    nominalConfidence,
    lowConfidence,
    avgFRP: Math.round(totalFRP / detections.length * 10) / 10,
    maxFRP: Math.round(maxFRP * 10) / 10,
    recentCount,
  };
}

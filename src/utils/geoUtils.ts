// Utility functions for geo calculation and interpolation along rail routes

export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function calculateBearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const y = Math.sin(((lon2 - lon1) * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180);
  const x =
    Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
    Math.sin((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.cos(((lon2 - lon1) * Math.PI) / 180);
  const brng = (Math.atan2(y, x) * 180) / Math.PI;
  return (brng + 360) % 360;
}

export function interpolateCoordinates(
  coord1: [number, number],
  coord2: [number, number],
  fraction: number
): [number, number] {
  const lat = coord1[0] + (coord2[0] - coord1[0]) * fraction;
  const lng = coord1[1] + (coord2[1] - coord1[1]) * fraction;
  return [lat, lng];
}

export function getPositionAlongPath(
  path: [number, number][],
  progressRatio: number
): { lat: number; lng: number; bearing: number } {
  if (path.length === 0) return { lat: 23.7314, lng: 90.4267, bearing: 0 };
  if (path.length === 1 || progressRatio <= 0) {
    return { lat: path[0][0], lng: path[0][1], bearing: 0 };
  }
  if (progressRatio >= 1) {
    const last = path[path.length - 1];
    const prev = path[path.length - 2] || last;
    const bearing = calculateBearing(prev[0], prev[1], last[0], last[1]);
    return { lat: last[0], lng: last[1], bearing };
  }

  // Calculate cumulative distances
  const distances: number[] = [0];
  let totalDist = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const d = calculateDistanceKm(path[i][0], path[i][1], path[i + 1][0], path[i + 1][1]);
    totalDist += d;
    distances.push(totalDist);
  }

  if (totalDist === 0) {
    return { lat: path[0][0], lng: path[0][1], bearing: 0 };
  }

  const targetDist = progressRatio * totalDist;

  for (let i = 0; i < distances.length - 1; i++) {
    if (targetDist >= distances[i] && targetDist <= distances[i + 1]) {
      const segDist = distances[i + 1] - distances[i];
      const segFraction = segDist === 0 ? 0 : (targetDist - distances[i]) / segDist;
      const [lat, lng] = interpolateCoordinates(path[i], path[i + 1], segFraction);
      const bearing = calculateBearing(path[i][0], path[i][1], path[i + 1][0], path[i + 1][1]);
      return { lat, lng, bearing };
    }
  }

  const end = path[path.length - 1];
  return { lat: end[0], lng: end[1], bearing: 0 };
}

// Convert Bengali numerals to Western ASCII digits
export function bengaliToEnglishDigits(str: string): string {
  const bnToEnMap: Record<string, string> = {
    '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
    '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9',
  };
  return str.replace(/[০-৯]/g, (ch) => bnToEnMap[ch] || ch);
}

/**
 * Normalizes any time representation (e.g. 4-digit "0620", "1430", "0000", "0700",
 * Bengali "০৬২০", or "06:20", "6:20") into standard "HH:MM" 24-hour string format.
 */
export function normalizeToHHMM(timeStr: string | number | undefined | null): string {
  if (!timeStr) return '00:00';
  let cleaned = bengaliToEnglishDigits(String(timeStr)).trim();

  // If already standard HH:MM
  if (cleaned.includes(':')) {
    const parts = cleaned.split(':');
    const h = parseInt(parts[0], 10) || 0;
    const m = parseInt(parts[1], 10) || 0;
    return `${String(h % 24).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
  }

  // 4-digit working timetable format: e.g. "0620" -> 06:20, "1015" -> 10:15
  // or 3-digit: "700" -> 07:00
  cleaned = cleaned.replace(/\D/g, '');
  if (cleaned.length === 3) {
    cleaned = '0' + cleaned;
  }
  if (cleaned.length >= 4) {
    const h = parseInt(cleaned.slice(0, 2), 10) || 0;
    const m = parseInt(cleaned.slice(2, 4), 10) || 0;
    return `${String(h % 24).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
  }

  const num = parseInt(cleaned, 10);
  if (!isNaN(num)) {
    const h = Math.floor(num / 100);
    const m = num % 100;
    return `${String(h % 24).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
  }

  return '00:00';
}

/**
 * Converts Working Timetable 4-digit "0000" or standard "HH:MM" format to minutes from midnight (0 to 1439).
 * First 2 digits are hours (00-23), last 2 digits are minutes (00-59).
 */
export function parseTimeToMinutes(timeStr: string | number | undefined | null): number {
  if (!timeStr) return 0;
  const standardHHMM = normalizeToHHMM(timeStr);
  const [h, m] = standardHHMM.split(':').map(Number);
  return ((h || 0) % 24) * 60 + ((m || 0) % 60);
}

// Convert "HH:MM" to railway 4-digit format string e.g. "1015", "0620"
export function formatTo4Digit(timeStr: string): string {
  const norm = normalizeToHHMM(timeStr);
  return norm.replace(':', '');
}

// Convert minutes from midnight to "HH:MM AM/PM"
export function formatMinutesToTime(mins: number, isBengali = true): string {
  const norm = ((mins % 1440) + 1440) % 1440;
  const h = Math.floor(norm / 60);
  const m = norm % 60;
  const periodEn = h >= 12 ? 'PM' : 'AM';
  const periodBn = h >= 12 ? (h >= 18 ? 'রাত' : 'দুপুর/বিকাল') : (h >= 5 ? 'সকাল' : 'রাত/ভোর');
  const h12 = h % 12 || 12;
  const padM = m.toString().padStart(2, '0');

  if (isBengali) {
    const toBnDigits = (n: number | string) =>
      n.toString().replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[Number(d)]);
    return `${periodBn} ${toBnDigits(h12)}:${toBnDigits(padM)}`;
  }
  return `${h12}:${padM} ${periodEn}`;
}

export function toBengaliNumber(num: number | string): string {
  return num.toString().replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[Number(d)]);
}

/**
 * Extracts a segment of exact length (default 200 meters = 0.2 km) along a path,
 * centered at or near the given coordinate, following the exact curves of the rail line.
 */
export function getTrackSegmentOfLength(
  path: [number, number][],
  centerLat: number,
  centerLng: number,
  lengthKm: number = 0.2
): [number, number][] {
  if (!path || path.length < 2) {
    const offset = 0.0009; // ~100m in lat
    return [
      [centerLat - offset, centerLng],
      [centerLat + offset, centerLng],
    ];
  }

  // 1. Calculate cumulative distances along the path
  const cumDists: number[] = [0];
  for (let i = 0; i < path.length - 1; i++) {
    const d = calculateDistanceKm(path[i][0], path[i][1], path[i + 1][0], path[i + 1][1]);
    cumDists.push(cumDists[i] + d);
  }
  const totalPathDist = cumDists[cumDists.length - 1];

  if (totalPathDist === 0) {
    return [
      [centerLat - 0.0009, centerLng],
      [centerLat + 0.0009, centerLng],
    ];
  }

  // 2. Find closest point on path to (centerLat, centerLng)
  let closestDist = Infinity;
  let bestCenterPathDist = 0;

  for (let i = 0; i < path.length - 1; i++) {
    const p1 = path[i];
    const p2 = path[i + 1];
    const segLen = cumDists[i + 1] - cumDists[i];
    if (segLen === 0) continue;

    for (let f = 0; f <= 1; f += 0.2) {
      const [lat, lng] = interpolateCoordinates(p1, p2, f);
      const d = calculateDistanceKm(centerLat, centerLng, lat, lng);
      if (d < closestDist) {
        closestDist = d;
        bestCenterPathDist = cumDists[i] + f * segLen;
      }
    }
  }

  // 3. Extract exactly lengthKm (200m) centered on bestCenterPathDist
  const halfLen = lengthKm / 2;
  let startDist = Math.max(0, bestCenterPathDist - halfLen);
  let endDist = Math.min(totalPathDist, bestCenterPathDist + halfLen);

  if (startDist === 0 && totalPathDist >= lengthKm) {
    endDist = lengthKm;
  } else if (endDist === totalPathDist && totalPathDist >= lengthKm) {
    startDist = totalPathDist - lengthKm;
  }

  function getPointAtDist(targetD: number): [number, number] {
    for (let i = 0; i < cumDists.length - 1; i++) {
      if (targetD >= cumDists[i] && targetD <= cumDists[i + 1]) {
        const segLen = cumDists[i + 1] - cumDists[i];
        const fraction = segLen === 0 ? 0 : (targetD - cumDists[i]) / segLen;
        return interpolateCoordinates(path[i], path[i + 1], fraction);
      }
    }
    return path[path.length - 1];
  }

  const result: [number, number][] = [];
  result.push(getPointAtDist(startDist));

  for (let i = 0; i < path.length; i++) {
    if (cumDists[i] > startDist && cumDists[i] < endDist) {
      result.push(path[i]);
    }
  }

  result.push(getPointAtDist(endDist));
  return result;
}

export interface TrailingWagonPosition {
  index: number;
  lat: number;
  lng: number;
  bearing: number;
}

/**
 * Calculates accurate positions and bearings for train wagons trailing behind the locomotive along the railway track.
 */
export function getTrailingWagonPositions(
  path: [number, number][],
  currentLat: number,
  currentLng: number,
  wagonCount: number = 6,
  spacingKm: number = 0.024 // ~24 meters spacing per carriage
): TrailingWagonPosition[] {
  if (!path || path.length < 2) return [];

  // 1. Calculate cumulative distances along path
  const cumDists: number[] = [0];
  for (let i = 0; i < path.length - 1; i++) {
    const d = calculateDistanceKm(path[i][0], path[i][1], path[i + 1][0], path[i + 1][1]);
    cumDists.push(cumDists[i] + d);
  }
  const totalPathDist = cumDists[cumDists.length - 1];
  if (totalPathDist === 0) return [];

  // 2. Find closest point on path to (currentLat, currentLng)
  let closestDist = Infinity;
  let bestCenterPathDist = 0;

  for (let i = 0; i < path.length - 1; i++) {
    const p1 = path[i];
    const p2 = path[i + 1];
    const segLen = cumDists[i + 1] - cumDists[i];
    if (segLen === 0) continue;

    for (let f = 0; f <= 1; f += 0.2) {
      const [lat, lng] = interpolateCoordinates(p1, p2, f);
      const d = calculateDistanceKm(currentLat, currentLng, lat, lng);
      if (d < closestDist) {
        closestDist = d;
        bestCenterPathDist = cumDists[i] + f * segLen;
      }
    }
  }

  function getPointAndBearingAtDist(targetD: number): { lat: number; lng: number; bearing: number } {
    const clampedD = Math.max(0, Math.min(totalPathDist, targetD));
    for (let i = 0; i < cumDists.length - 1; i++) {
      if (clampedD >= cumDists[i] && clampedD <= cumDists[i + 1]) {
        const segLen = cumDists[i + 1] - cumDists[i];
        const fraction = segLen === 0 ? 0 : (clampedD - cumDists[i]) / segLen;
        const [lat, lng] = interpolateCoordinates(path[i], path[i + 1], fraction);
        const bearing = calculateBearing(path[i][0], path[i][1], path[i + 1][0], path[i + 1][1]);
        return { lat, lng, bearing };
      }
    }
    const last = path[path.length - 1];
    const prev = path[path.length - 2] || last;
    return { lat: last[0], lng: last[1], bearing: calculateBearing(prev[0], prev[1], last[0], last[1]) };
  }

  const wagons: TrailingWagonPosition[] = [];
  for (let i = 1; i <= wagonCount; i++) {
    const wagonDist = bestCenterPathDist - (i * spacingKm);
    if (wagonDist >= 0) {
      const pos = getPointAndBearingAtDist(wagonDist);
      wagons.push({
        index: i,
        lat: pos.lat,
        lng: pos.lng,
        bearing: pos.bearing,
      });
    }
  }

  return wagons;
}

/**
 * Snaps any coordinate to the closest point along the given railway path.
 * Guarantees train and station markers sit 100% on the railway line.
 */
export function snapCoordToPath(
  path: [number, number][],
  lat: number,
  lng: number
): [number, number] {
  if (!path || path.length === 0) return [lat, lng];
  if (path.length === 1) return path[0];

  let closestDist = Infinity;
  let snappedLat = lat;
  let snappedLng = lng;

  for (let i = 0; i < path.length - 1; i++) {
    const p1 = path[i];
    const p2 = path[i + 1];
    for (let f = 0; f <= 1; f += 0.2) {
      const [iLat, iLng] = interpolateCoordinates(p1, p2, f);
      const d = calculateDistanceKm(lat, lng, iLat, iLng);
      if (d < closestDist) {
        closestDist = d;
        snappedLat = iLat;
        snappedLng = iLng;
      }
    }
  }
  return [snappedLat, snappedLng];
}

/**
 * Extracts a subsegment of coordinates from a path between two coordinates (start and end).
 */
export function sliceCoords(
  coords: [number, number][],
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number
): [number, number][] {
  if (!coords || coords.length < 2) return coords || [];

  let sIdx = 0;
  let eIdx = coords.length - 1;
  let minS = Infinity;
  let minE = Infinity;

  coords.forEach((pt, i) => {
    const ds = Math.hypot(pt[0] - startLat, pt[1] - startLng);
    const de = Math.hypot(pt[0] - endLat, pt[1] - endLng);
    if (ds < minS) {
      minS = ds;
      sIdx = i;
    }
    if (de < minE) {
      minE = de;
      eIdx = i;
    }
  });

  if (sIdx === eIdx) {
    if (sIdx < coords.length - 1) {
      return [coords[sIdx], coords[sIdx + 1]];
    } else if (sIdx > 0) {
      return [coords[sIdx - 1], coords[sIdx]];
    }
    return [coords[sIdx]];
  }

  if (sIdx < eIdx) {
    return coords.slice(sIdx, eIdx + 1);
  } else {
    return coords.slice(eIdx, sIdx + 1).reverse();
  }
}

/**
 * Calculates progress ratio (0.0 to 1.0) of a given coordinate along a path polyline,
 * along with the closest distance in kilometers to the rail line.
 */
export function getRatioAlongPath(
  path: [number, number][],
  lat: number,
  lng: number
): { ratio: number; closestDistKm: number; snappedLat: number; snappedLng: number } {
  if (!path || path.length < 2) {
    return { ratio: 0, closestDistKm: 0, snappedLat: lat, snappedLng: lng };
  }

  const cumDists: number[] = [0];
  for (let i = 0; i < path.length - 1; i++) {
    const d = calculateDistanceKm(path[i][0], path[i][1], path[i + 1][0], path[i + 1][1]);
    cumDists.push(cumDists[i] + d);
  }
  const totalPathDist = cumDists[cumDists.length - 1];
  if (totalPathDist === 0) {
    return { ratio: 0, closestDistKm: 0, snappedLat: path[0][0], snappedLng: path[0][1] };
  }

  let closestDist = Infinity;
  let bestPathDist = 0;
  let snappedLat = lat;
  let snappedLng = lng;

  for (let i = 0; i < path.length - 1; i++) {
    const p1 = path[i];
    const p2 = path[i + 1];
    const segLen = cumDists[i + 1] - cumDists[i];
    if (segLen === 0) continue;

    for (let f = 0; f <= 1; f += 0.2) {
      const [iLat, iLng] = interpolateCoordinates(p1, p2, f);
      const d = calculateDistanceKm(lat, lng, iLat, iLng);
      if (d < closestDist) {
        closestDist = d;
        bestPathDist = cumDists[i] + f * segLen;
        snappedLat = iLat;
        snappedLng = iLng;
      }
    }
  }

  const ratio = Math.max(0, Math.min(1, bestPathDist / totalPathDist));
  return { ratio, closestDistKm: closestDist, snappedLat, snappedLng };
}



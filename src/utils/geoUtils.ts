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

// Convert "HH:MM" to minutes from 00:00
export function parseTimeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
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

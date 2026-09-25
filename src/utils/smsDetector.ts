import { BANGLADESH_TRAINS } from '../data/trains';
import { BANGLADESH_STATIONS, STATION_MAP } from '../data/stations';
import { Train, Station } from '../types';

export interface DetectedSmsResult {
  rawText: string;
  success: boolean;
  trainNumber?: string;
  trainName?: string;
  matchedTrain?: Train;
  direction?: 'UP' | 'DOWN';
  routeText?: string;
  departureText?: string;
  currentStationName?: string;
  currentStation?: Station;
  nextStopName?: string;
  nextStopStation?: Station;
  nextStnDistanceKm?: number;
  remainingStopsCount?: number;
  delayMinutes: number;
  delayFormatted: string;
  totalCoaches: number;
  coachKaPosition: 'First' | 'Last' | 'Unknown';
  bogieSequenceSummary: string;
  detectedCoordinates?: [number, number];
  errorReason?: string;
}

/**
 * Normalizes station names for fuzzy comparison
 */
function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

/**
 * Intelligent Bangladesh Railway 16318 SMS Parser & Auto-Detection Engine
 */
export function detectTrainFromSms(smsText: string): DetectedSmsResult {
  if (!smsText || smsText.trim().length === 0) {
    return {
      rawText: smsText,
      success: false,
      delayMinutes: 0,
      delayFormatted: '00:00',
      totalCoaches: 16,
      coachKaPosition: 'Unknown',
      bogieSequenceSummary: '',
      errorReason: 'এসএমএস টেক্সট খালি। অনুগ্রহ করে মেসেজ পেস্ট করুন।',
    };
  }

  const lines = smsText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  let trainNumber: string | undefined;
  let trainName: string | undefined;
  let routeText: string | undefined;
  let departureText: string | undefined;
  let currentStationName: string | undefined;
  let nextStopName: string | undefined;
  let nextStnDistanceKm: number | undefined;
  let remainingStopsCount: number | undefined;
  let delayMinutes = 0;
  let delayFormatted = '00:00';
  let totalCoaches = 16;
  let coachKaPosition: 'First' | 'Last' | 'Unknown' = 'Unknown';

  // 1. Extract Train Number & Name
  // Patterns:
  // "Godhuli : 703"
  // "704: Provati"
  // "758: Drutajan Dn"
  // "TR 704" or "TR 703" or "TR 758"
  for (const line of lines) {
    // Pattern: "Godhuli : 703" or "Name : 123"
    const nameColonNum = line.match(/^([A-Za-z\s]+)\s*:\s*(\d{3,4})/i);
    if (nameColonNum) {
      trainName = nameColonNum[1].trim();
      trainNumber = nameColonNum[2].trim();
      break;
    }

    // Pattern: "704: Provati" or "758: Drutajan Dn"
    const numColonName = line.match(/^(\d{3,4})\s*:\s*([A-Za-z\s]+)/i);
    if (numColonName) {
      trainNumber = numColonName[1].trim();
      trainName = numColonName[2].trim();
      break;
    }

    // Pattern: "TR 704" or "TRAIN 704"
    const trMatch = line.match(/(?:TR|TRAIN)\s*[:\s]?\s*(\d{3,4})(?:\s*\(([^)]+)\))?/i);
    if (trMatch) {
      trainNumber = trMatch[1].trim();
      if (trMatch[2]) trainName = trMatch[2].trim();
      break;
    }
  }

  // Fallback: look for 3 or 4 digit train number anywhere if still undefined
  if (!trainNumber) {
    const rawNumberMatch = smsText.match(/\b(7\d\d|8\d\d)\b/);
    if (rawNumberMatch) {
      trainNumber = rawNumberMatch[1];
    }
  }

  // 2. Extract Route (e.g. "Chattogram-Dhaka", "Dhaka-Chattogram", "Panchagarh-Dhaka")
  for (const line of lines) {
    const routeMatch = line.match(/([A-Za-z]+)\s*-\s*([A-Za-z]+)/i);
    if (routeMatch && !line.includes(':') && !line.includes('/')) {
      routeText = `${routeMatch[1]}-${routeMatch[2]}`;
      break;
    }
    const routeKeywordMatch = line.match(/ROUTE\s*:\s*([A-Za-z\s()0-9]+)\s+TO\s+([A-Za-z\s()0-9]+)/i);
    if (routeKeywordMatch) {
      routeText = `${routeKeywordMatch[1].trim()} - ${routeKeywordMatch[2].trim()}`;
      break;
    }
  }

  // 3. Extract Departure Info
  for (const line of lines) {
    if (line.match(/(?:Will depart|Left|Departed|Departs)/i)) {
      departureText = line;
      break;
    }
  }

  // 4. Extract Current Location
  // "Now at: Laksham Jn"
  // "Next Stn: Muhuriganj, 1.9km"
  // "Next Stn: Atrai, 0.9km"
  // "CURRENT LOCATION: LAKSHAM JN"
  for (const line of lines) {
    const nowAtMatch = line.match(/Now at\s*:\s*([^,\n]+)/i);
    if (nowAtMatch) {
      currentStationName = nowAtMatch[1].trim();
      break;
    }

    const nextStnMatch = line.match(/Next Stn\s*:\s*([^,]+)(?:,\s*([\d.]+)\s*km)?/i);
    if (nextStnMatch) {
      currentStationName = nextStnMatch[1].trim();
      if (nextStnMatch[2]) {
        nextStnDistanceKm = parseFloat(nextStnMatch[2]);
      }
      break;
    }

    const curLocMatch = line.match(/CURRENT LOCATION\s*:\s*([^,\n]+)/i);
    if (curLocMatch) {
      currentStationName = curLocMatch[1].trim();
      break;
    }
  }

  // 5. Extract Next Stop & remaining stations count
  // "Next stop: Gunoboti at 4th stn"
  // "Next stop: Atrai at 1st stn"
  // "Next stop: Chattogram at 14th stn"
  // "NEXT STOP: GUNOBOTI"
  for (const line of lines) {
    const nextStopMatch = line.match(/Next stop\s*:\s*([^a-z\n]+?)(?:\s+at\s+(\d+)(?:st|nd|rd|th)\s+stn)?/i);
    if (nextStopMatch) {
      nextStopName = nextStopMatch[1].trim();
      if (nextStopMatch[2]) {
        remainingStopsCount = parseInt(nextStopMatch[2], 10);
      }
      break;
    }
  }

  // 6. Extract Delay
  // "Delay: 01:46" or "Delay: 00:54" or "Delay: 00:00 (approx.)" or "LATE BY 106 MIN"
  for (const line of lines) {
    const delayMatch = line.match(/Delay\s*:\s*(\d{1,2}):(\d{2})/i);
    if (delayMatch) {
      const hours = parseInt(delayMatch[1], 10);
      const mins = parseInt(delayMatch[2], 10);
      delayMinutes = hours * 60 + mins;
      delayFormatted = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
      break;
    }

    const lateByMatch = line.match(/LATE BY\s*(\d+)\s*MIN/i);
    if (lateByMatch) {
      delayMinutes = parseInt(lateByMatch[1], 10);
      const h = Math.floor(delayMinutes / 60);
      const m = delayMinutes % 60;
      delayFormatted = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      break;
    }
  }

  // 7. Extract Total Coaches
  // "Total coach: 16 nos." or "TOTAL BOGIE: 16"
  for (const line of lines) {
    const coachMatch = line.match(/(?:Total coach|TOTAL BOGIE|Total bogie)\s*:\s*(\d+)/i);
    if (coachMatch) {
      totalCoaches = parseInt(coachMatch[1], 10);
      break;
    }
  }

  // 8. Extract Coach 'Ka' Position
  // "Coach 'Ka' at: Last" or "Coach 'Ka' at: First"
  for (const line of lines) {
    const kaMatch = line.match(/Coach\s*['"]?Ka['"]?\s*at\s*:\s*(Last|First|Rear|Front)/i);
    if (kaMatch) {
      const pos = kaMatch[1].toLowerCase();
      coachKaPosition = pos === 'first' || pos === 'front' ? 'First' : 'Last';
      break;
    }
  }

  // Match with system Train Fleet
  let matchedTrain: Train | undefined;
  if (trainNumber) {
    matchedTrain = BANGLADESH_TRAINS.find((t) => t.number === trainNumber);
  }
  if (!matchedTrain && trainName) {
    const qName = normalizeName(trainName);
    matchedTrain = BANGLADESH_TRAINS.find(
      (t) => normalizeName(t.nameEn).includes(qName) || normalizeName(t.nameBn).includes(qName)
    );
  }

  // Match Station
  let currentStation: Station | undefined;
  if (currentStationName) {
    const qStn = normalizeName(currentStationName);
    currentStation = BANGLADESH_STATIONS.find((st) => {
      const normEn = normalizeName(st.nameEn);
      const normBn = normalizeName(st.nameBn);
      const normCode = normalizeName(st.code);
      return (
        normEn === qStn ||
        normEn.includes(qStn) ||
        qStn.includes(normEn) ||
        normBn === qStn ||
        normCode === qStn
      );
    });
  }

  let nextStopStation: Station | undefined;
  if (nextStopName) {
    const qNext = normalizeName(nextStopName);
    nextStopStation = BANGLADESH_STATIONS.find((st) => {
      const normEn = normalizeName(st.nameEn);
      const normBn = normalizeName(st.nameBn);
      const normCode = normalizeName(st.code);
      return (
        normEn === qNext ||
        normEn.includes(qNext) ||
        qNext.includes(normEn) ||
        normBn === qNext ||
        normCode === qNext
      );
    });
  }

  // Determine Direction
  let direction: 'UP' | 'DOWN' = 'DOWN';
  if (coachKaPosition === 'Last') {
    direction = 'UP';
  } else if (coachKaPosition === 'First') {
    direction = 'DOWN';
  } else if (matchedTrain) {
    // If Godhuli (703), it's Chattogram -> Dhaka (UP)
    if (matchedTrain.number === '703') {
      direction = 'UP';
      coachKaPosition = 'Last';
    } else if (matchedTrain.number === '704') {
      direction = 'DOWN';
      coachKaPosition = 'First';
    } else if (matchedTrain.originStationId === 'DA') {
      direction = 'DOWN';
      coachKaPosition = 'First';
    } else {
      direction = 'UP';
      coachKaPosition = 'Last';
    }
  }

  // Generate Bogie Sequence
  const isUp = direction === 'UP' || coachKaPosition === 'Last';
  const bogieSequenceSummary = isUp
    ? 'ইঞ্জিন -> ত (সামনে) -> ণ -> ঢ -> ড -> ঠ -> ট -> ঞ -> ঝ -> জ -> ছ -> চ -> ঙ -> ঘ -> গ -> খ -> ক (সবার শেষে)'
    : 'ইঞ্জিন -> ক (সবার আগে) -> খ -> গ -> ঘ -> ঙ -> চ -> ছ -> জ -> ঝ -> ঞ -> ট -> ঠ -> ড -> ঢ -> ণ -> ত (সবার শেষে)';

  // Determine Detected Coordinates
  let detectedCoordinates: [number, number] | undefined;
  if (currentStation) {
    detectedCoordinates = [currentStation.lat, currentStation.lng];
  } else if (matchedTrain?.routeCoordinates?.length) {
    detectedCoordinates = matchedTrain.routeCoordinates[Math.floor(matchedTrain.routeCoordinates.length / 2)];
  }

  const success = Boolean(matchedTrain || trainNumber);

  return {
    rawText: smsText,
    success,
    trainNumber: trainNumber || matchedTrain?.number,
    trainName: trainName || matchedTrain?.nameEn,
    matchedTrain,
    direction,
    routeText: routeText || (matchedTrain ? `${matchedTrain.originStationId} - ${matchedTrain.destinationStationId}` : undefined),
    departureText,
    currentStationName: currentStationName || currentStation?.nameEn,
    currentStation,
    nextStopName: nextStopName || nextStopStation?.nameEn,
    nextStopStation,
    nextStnDistanceKm,
    remainingStopsCount,
    delayMinutes,
    delayFormatted,
    totalCoaches,
    coachKaPosition,
    bogieSequenceSummary,
    detectedCoordinates,
    errorReason: success ? undefined : 'ট্রেন নম্বর বা ট্রেনের নাম সঠিকভাবে সনাক্ত করা যায়নি।',
  };
}

export const SAMPLE_SMS_MESSAGES = [
  {
    id: 'sample-813-islamabad',
    title: '৮১৩ কক্সবাজার এক্সপ্রেস (ইসলামাবাদ ১১.৬ কিমি, বিলম্ব ১:২৫)',
    text: `813: Coxs Bazar Ex
Coxs Bazar-Dhaka
Left Coxs Bazar at 13:50
Next Stn: Islamabad, 11.6km
Next stop: Chattogram at 22nd stn
Delay: 01:25

14:10/25.09.26`,
  },
  {
    id: 'sample-704-laksham',
    title: '৭০৪ প্রভাতী (লাকসাম জংশনে অবস্থান, বিলম্ব ১:৪৬)',
    text: `21:41/24.09.26
704: Provati
Dhaka-Chattogram
Left Dhaka at 08:32
Now at: Laksham Jn
Next stop: Gunoboti at 4th stn
Delay: 01:46`,
  },
  {
    id: 'sample-704-muhuriganj',
    title: '৭০৪ প্রভাতী (মুহুরীগঞ্জ সেকশন ১.৯ কিমি, বিলম্ব ১:৫০)',
    text: `13:53/25.09.26
704: Provati
Dhaka-Chattogram
Left Dhaka at 08:32
Next Stn: Muhuriganj, 1.9km
Next stop: Chattogram at 14th stn
Delay: 01:50`,
  },
  {
    id: 'sample-703-godhuli',
    title: '৭০৩ গোধূলী (চট্টগ্রাম-ঢাকা, বগি ক সবার শেষে, ১৬ বগি)',
    text: `Godhuli : 703
Chattogram-Dhaka
Will depart Chattogram at: 15:00
Coach 'Ka' at: Last
Total coach: 16 nos.

Delay: 00:00 (approx.)`,
  },
  {
    id: 'sample-758-drutajan',
    title: '৭৫৮ দ্রুতযান ডাউন (পঞ্চগড়-ঢাকা, আত্রাই স্টেশনে বিলম্ব ০:৫৪)',
    text: `13:01/25.09.26
758: Drutajan Dn
Panchagarh-Dhaka
Left Panchagarh at 07:20
Next Stn: Atrai, 0.9km
Next stop: Atrai at 1st stn
Delay: 00:54`,
  },
];

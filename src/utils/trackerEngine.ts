import { Train, LiveTrainStatus, TrackTrafficCondition, PredictiveDelayInfo } from '../types';
import { STATION_MAP } from '../data/stations';
import {
  parseTimeToMinutes,
  getPositionAlongPath,
  calculateDistanceKm,
  toBengaliNumber,
  formatMinutesToTime,
  snapCoordToPath,
  sliceCoords,
} from './geoUtils';

/**
 * Historical station traffic congestion weights and delay likelihood for Bangladesh Railway network.
 * Major junction bottlenecks like Tongi, Akhaura, Ishwardi, Bhairab Bazar, Parbatipur have historical crossing delays.
 */
const HISTORICAL_STATION_TRAFFIC_DATA: Record<
  string,
  { congestionFactor: number; typicalCrossingDelay: number; bottleneckReasonBn: string }
> = {
  TG: {
    congestionFactor: 1.8,
    typicalCrossingDelay: 18,
    bottleneckReasonBn: 'টঙ্গী জংশনে ঢাকা-চট্টগ্রাম ও উত্তরবঙ্গ রুটের সংযোগস্থলের ট্রাফিক চাপ',
  },
  BB: {
    congestionFactor: 1.5,
    typicalCrossingDelay: 14,
    bottleneckReasonBn: 'ভৈরব বাজার ও মেঘনা সেতু সংলগ্ন সিঙ্গেল/ডাবল লাইন ট্রেন ক্রসিং',
  },
  AKH: {
    congestionFactor: 1.6,
    typicalCrossingDelay: 16,
    bottleneckReasonBn: 'আখাউড়া জংশনে সিলেট ও চট্টগ্রামগামী লাইনের মিলনস্থল ট্রাফিক',
  },
  ISD: {
    congestionFactor: 1.7,
    typicalCrossingDelay: 17,
    bottleneckReasonBn: 'ঈশ্বরদী জংশনে পশ্চিমাঞ্চল ব্রডগেজ রুটের ব্যাপক শান্টিং ও ক্রসিং',
  },
  PBT: {
    congestionFactor: 1.4,
    typicalCrossingDelay: 12,
    bottleneckReasonBn: 'পার্বতীপুর ৪-মুখী রেল জংশনের ইঞ্জিন ও ট্র্যাক কনজেশন',
  },
  DA: {
    congestionFactor: 1.5,
    typicalCrossingDelay: 10,
    bottleneckReasonBn: 'কমলাপুর প্ল্যাটফর্ম এন্ট্রি সিগন্যাল কিউ (ধীরগতি আগমন)',
  },
  DAA: {
    congestionFactor: 1.3,
    typicalCrossingDelay: 8,
    bottleneckReasonBn: 'ঢাকা বিমানবন্দর স্টেশনে অতিরিক্ত যাত্রী ওঠানামার বিলম্ব',
  },
  CG: {
    congestionFactor: 1.4,
    typicalCrossingDelay: 10,
    bottleneckReasonBn: 'চট্টগ্রাম পুরাতন স্টেশন ইয়ার্ড ক্লিয়ারেন্স কিউ',
  },
  SRE: {
    congestionFactor: 1.3,
    typicalCrossingDelay: 9,
    bottleneckReasonBn: 'শ্রীমঙ্গল পাহাড়ি সেকশনের সিঙ্গেল ট্র্যাক ক্রসিং অপেক্ষা',
  },
  KLP: {
    congestionFactor: 1.2,
    typicalCrossingDelay: 8,
    bottleneckReasonBn: 'কুলাউড়া জংশন মিটারগেজ ক্রসিং ডিলে',
  },
  BBP: {
    congestionFactor: 1.4,
    typicalCrossingDelay: 11,
    bottleneckReasonBn: 'বঙ্গবন্ধু সেতু পূর্ব স্টেশন ক্রসিং ও নিরাপত্তা সিগন্যাল',
  },
  FNI: {
    congestionFactor: 1.2,
    typicalCrossingDelay: 8,
    bottleneckReasonBn: 'ফেনী জংশন সেকশনের লাইন ক্লিয়ারেন্স অপেক্ষা',
  },
};

/**
 * Estimates predictive delays based on upcoming stations in the route, historical traffic bottlenecks,
 * junction congestion, time of day (rush hours), and track conditions.
 */
function calculatePredictiveDelay(
  train: Train,
  adjustedCurrentMinutes: number,
  upcomingStops: typeof train.stops,
  trafficCondition: TrackTrafficCondition
): PredictiveDelayInfo {
  let accumulatedHistoricalDelay = 0;
  let highestBottleneckReason = '';
  let maxWeight = 0;

  // 1. Analyze upcoming stations in the train's route
  for (const stop of upcomingStops) {
    const historicalData = HISTORICAL_STATION_TRAFFIC_DATA[stop.stationId];
    if (historicalData) {
      accumulatedHistoricalDelay += historicalData.typicalCrossingDelay * 0.45;
      if (historicalData.congestionFactor > maxWeight) {
        maxWeight = historicalData.congestionFactor;
        highestBottleneckReason = historicalData.bottleneckReasonBn;
      }
    } else {
      const station = STATION_MAP[stop.stationId];
      if (station?.isJunction) {
        accumulatedHistoricalDelay += 4; // Generic junction wait
        if (!highestBottleneckReason) {
          highestBottleneckReason = `${station.nameBn} জংশনে ট্রানজিট ক্রসিং বিলম্ব`;
        }
      }
    }
  }

  // 2. Train route specific historical factors (e.g. single line sections)
  const isPadmaLink = train.zone === 'padma';
  const isSylhetSection = train.stops.some((s) => s.stationId === 'SR' || s.stationId === 'SRE');
  const isNorthBengal = train.stops.some((s) => s.stationId === 'ISD' || s.stationId === 'SNT');

  if (isSylhetSection) {
    accumulatedHistoricalDelay += 6; // Historical single line speed restrictions
    if (!highestBottleneckReason) {
      highestBottleneckReason = 'সিলেট সেকশনে সিঙ্গেল মিটারগেজ লাইন স্পিড রেস্ট্রিকশন';
    }
  }

  if (isNorthBengal) {
    accumulatedHistoricalDelay += 5;
    if (!highestBottleneckReason) {
      highestBottleneckReason = 'উত্তরবঙ্গ যমুনা করিডোর ট্রাফিক ক্রসিং ও ডাবলগেজ সিগন্যালিং';
    }
  }

  // 3. Peak travel hours adjustment (Bangladesh peak office/traffic hours: 8am-11am & 5pm-9pm)
  const hourOfDay = Math.floor((adjustedCurrentMinutes % 1440) / 60);
  const isPeakHour = (hourOfDay >= 8 && hourOfDay <= 11) || (hourOfDay >= 17 && hourOfDay <= 21);
  if (isPeakHour) {
    accumulatedHistoricalDelay *= 1.25;
  }

  // 4. Current instantaneous condition impact
  if (trafficCondition === 'WAITING_CROSSING') {
    accumulatedHistoricalDelay += 8;
  } else if (trafficCondition === 'STATION_STOP') {
    accumulatedHistoricalDelay += 2;
  }

  // Seeded variation based on train number so prediction stays consistent per train and updates smoothly
  const trainNumHash = train.number.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const deterministicCycle = (Math.sin(adjustedCurrentMinutes * 0.05 + trainNumHash) + 1) / 2; // 0 to 1
  const finalPredictedDelay = Math.round(accumulatedHistoricalDelay * 0.4 + deterministicCycle * 14);

  let severity: PredictiveDelayInfo['severity'] = 'ON_TIME';
  if (finalPredictedDelay >= 25) {
    severity = 'MAJOR_DELAY';
  } else if (finalPredictedDelay >= 12) {
    severity = 'MODERATE_DELAY';
  } else if (finalPredictedDelay >= 5) {
    severity = 'MINOR_DELAY';
  }

  return {
    predictedDelayMinutes: Math.max(0, finalPredictedDelay),
    confidence: maxWeight >= 1.5 ? 'HIGH' : maxWeight > 1.0 ? 'MEDIUM' : 'LOW',
    primaryFactorBn: highestBottleneckReason || 'নিয়মিত ট্র্যাফিক ও সিগন্যাল ক্লিয়ারেন্স',
    isLate: finalPredictedDelay >= 5,
    severity,
  };
}

/**
 * Gets the current BST Day of Week information (BST = UTC+6).
 */
export function getCurrentBSTDateInfo(): { dayOfWeekEn: string; dayOfWeekBn: string; dayIndex: number } {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const bstDate = new Date(utc + 3600000 * 6);
  const dayIndex = bstDate.getDay();
  const daysEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const daysBn = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
  return {
    dayOfWeekEn: daysEn[dayIndex],
    dayOfWeekBn: daysBn[dayIndex],
    dayIndex,
  };
}

/**
 * Checks whether a train is on its weekly off-day today.
 */
export function isTrainOffDay(train: Train, dayOfWeekEn?: string): boolean {
  const targetDay = (dayOfWeekEn || getCurrentBSTDateInfo().dayOfWeekEn).trim().toLowerCase();
  const offEn = (train.offDayEn || '').trim().toLowerCase();
  const offBn = (train.offDayBn || '').trim().toLowerCase();

  if (!offEn || offEn === 'none' || offEn === 'no off day' || offBn === 'নাই' || offBn === 'নেই') {
    return false;
  }

  if (offEn === targetDay) {
    return true;
  }

  const dayMap: Record<string, string> = {
    sunday: 'রবিবার',
    monday: 'সোমবার',
    tuesday: 'মঙ্গলবার',
    wednesday: 'বুধবার',
    thursday: 'বৃহস্পতিবার',
    friday: 'শুক্রবার',
    saturday: 'শনিবার',
  };

  const bnDay = dayMap[targetDay];
  if (bnDay && offBn.includes(bnDay)) {
    return true;
  }

  return false;
}

/**
 * Computes real-time position and traffic status for a train at a given timeOfDayMinutes
 * (0 to 1439).
 */
export function computeTrainLiveStatus(
  train: Train,
  currentMinutes: number,
  trafficDensityFactor: number = 1.0,
  dayOfWeekEn?: string
): LiveTrainStatus {
  // 1. Check if today is the train's weekly off-day
  const isOffDay = isTrainOffDay(train, dayOfWeekEn);
  if (isOffDay) {
    const terminalStation = STATION_MAP[train.originStationId];
    const initialCoords = train.routeCoordinates[0] || [
      terminalStation?.lat || 23.7314,
      terminalStation?.lng || 90.4267,
    ];

    return {
      train,
      isActive: false,
      currentLat: initialCoords[0],
      currentLng: initialCoords[1],
      bearing: 0,
      speedKmH: 0,
      statusBn: `সাপ্তাহিক ছুটি (${train.offDayBn || 'অফ ডে'}) — ট্রেনটি আজ বন্ধ`,
      statusEn: `Weekly Off-Day (${train.offDayEn || 'Off Day'}) — Not operating today`,
      trafficCondition: 'STATION_STOP',
      delayMinutes: 0,
      predictiveDelay: {
        predictedDelayMinutes: 0,
        confidence: 'HIGH',
        primaryFactorBn: `সাপ্তাহিক ছুটি (${train.offDayBn || 'অফ ডে'})`,
        isLate: false,
        severity: 'ON_TIME',
      },
      nextStation: null,
      previousStation: terminalStation || null,
      distanceToNextKm: 0,
      etaNextStation: 'বন্ধ (সাপ্তাহিক ছুটি)',
      progressPercent: 0,
      bogieFrontFacing: true,
      currentBlockSectionBn: `${terminalStation?.nameBn || 'টার্মিনাল'} ইয়ার্ড (সাপ্তাহিক ছুটি)`,
    };
  }

  const depMinutes = parseTimeToMinutes(train.departureTime);
  let arrMinutes = parseTimeToMinutes(train.arrivalTime);
  
  // Handles journeys that cross midnight (e.g., 22:30 to 06:40)
  if (arrMinutes < depMinutes) {
    arrMinutes += 1440;
  }

  let adjustedCurrent = currentMinutes;
  // If the trip crosses midnight and current time is in the early morning
  if (arrMinutes >= 1440 && currentMinutes < depMinutes) {
    adjustedCurrent += 1440;
  }

  const isActive = adjustedCurrent >= depMinutes && adjustedCurrent <= arrMinutes;

  if (!isActive) {
    // Train is resting at origin or destination
    const isPostArrival = adjustedCurrent > arrMinutes;
    const terminalStationId = isPostArrival ? train.destinationStationId : train.originStationId;
    const terminalStation = STATION_MAP[terminalStationId];
    const initialCoords = train.routeCoordinates[isPostArrival ? train.routeCoordinates.length - 1 : 0] || [
      terminalStation?.lat || 23.7314,
      terminalStation?.lng || 90.4267,
    ];

    const defaultPredictive: PredictiveDelayInfo = {
      predictedDelayMinutes: 0,
      confidence: 'HIGH',
      primaryFactorBn: 'নির্ধারিত সময়ে ট্রেন প্রস্তুত',
      isLate: false,
      severity: 'ON_TIME',
    };

    return {
      train,
      isActive: false,
      currentLat: initialCoords[0],
      currentLng: initialCoords[1],
      bearing: 0,
      speedKmH: 0,
      statusBn: isPostArrival
        ? `গন্তব্য স্টেশনে পৌঁছেছে (${terminalStation?.nameBn || 'টার্মিনাল'})`
        : `যাত্রার প্রস্তুতি নিচ্ছে (${terminalStation?.nameBn || 'স্ট্যান্ডবাই'})`,
      statusEn: isPostArrival ? 'Arrived at destination' : 'Waiting for departure',
      trafficCondition: 'STATION_STOP',
      delayMinutes: 0,
      predictiveDelay: defaultPredictive,
      nextStation: isPostArrival ? null : STATION_MAP[train.originStationId] || null,
      previousStation: isPostArrival ? STATION_MAP[train.destinationStationId] || null : null,
      distanceToNextKm: 0,
      etaNextStation: isPostArrival ? 'পৌঁছেছে' : train.departureTime,
      progressPercent: isPostArrival ? 100 : 0,
      bogieFrontFacing: true,
      currentBlockSectionBn: `${terminalStation?.nameBn || 'স্টেশন'} ইয়ার্ড`,
    };
  }

  // Active on track! Compute exact stop segment
  const elapsedMinutes = adjustedCurrent - depMinutes;
  const totalDuration = arrMinutes - depMinutes;
  const overallRatio = Math.min(1, Math.max(0, elapsedMinutes / (totalDuration || 1)));

  // Inspect schedule stops to find current or next station
  const stops = train.stops;
  let prevStop = stops[0];
  let nextStop = stops[stops.length - 1];
  let isCurrentlyStoppedAtStation = false;
  let stoppedStation = stops[0];
  let currentStopIndex = 0;

  for (let i = 0; i < stops.length; i++) {
    let stopArr = parseTimeToMinutes(stops[i].arrivalTime);
    let stopDep = parseTimeToMinutes(stops[i].departureTime);
    if (stopArr < depMinutes) stopArr += 1440;
    if (stopDep < depMinutes) stopDep += 1440;

    // Is train currently halting at this station?
    if (adjustedCurrent >= stopArr && adjustedCurrent <= stopDep) {
      isCurrentlyStoppedAtStation = true;
      stoppedStation = stops[i];
      prevStop = stops[i];
      nextStop = stops[Math.min(stops.length - 1, i + 1)];
      currentStopIndex = i;
      break;
    }

    if (adjustedCurrent < stopArr) {
      nextStop = stops[i];
      prevStop = stops[Math.max(0, i - 1)];
      currentStopIndex = i;
      break;
    }
  }

  const prevStationObj = STATION_MAP[prevStop.stationId] || null;
  const nextStationObj = STATION_MAP[nextStop.stationId] || null;

  // High-precision station-schedule anchored position calculation:
  // Train position is calculated strictly between prevStop and nextStop
  let lat = 23.7314;
  let lng = 90.4267;
  let bearing = 0;

  if (isCurrentlyStoppedAtStation) {
    const stObj = STATION_MAP[stoppedStation.stationId];
    if (stObj) {
      const [sLat, sLng] = snapCoordToPath(train.routeCoordinates, stObj.lat, stObj.lng);
      lat = sLat;
      lng = sLng;
      // Get heading from closest point on path
      const pos = getPositionAlongPath(train.routeCoordinates, overallRatio);
      bearing = pos.bearing;
    } else {
      const pos = getPositionAlongPath(train.routeCoordinates, overallRatio);
      lat = pos.lat;
      lng = pos.lng;
      bearing = pos.bearing;
    }
  } else {
    // Train is in transit between prevStop and nextStop
    let prevDep = parseTimeToMinutes(prevStop.departureTime);
    let nextArr = parseTimeToMinutes(nextStop.arrivalTime);
    if (prevDep < depMinutes) prevDep += 1440;
    if (nextArr < depMinutes) nextArr += 1440;
    if (nextArr <= prevDep) nextArr = prevDep + 15;

    const segElapsed = Math.max(0, adjustedCurrent - prevDep);
    const segDuration = Math.max(1, nextArr - prevDep);
    const segRatio = Math.min(1, Math.max(0, segElapsed / segDuration));

    if (prevStationObj && nextStationObj) {
      const subSegment = sliceCoords(
        train.routeCoordinates,
        prevStationObj.lat,
        prevStationObj.lng,
        nextStationObj.lat,
        nextStationObj.lng
      );
      if (subSegment && subSegment.length >= 2) {
        const segPos = getPositionAlongPath(subSegment, segRatio);
        lat = segPos.lat;
        lng = segPos.lng;
        bearing = segPos.bearing;
      } else {
        const fallbackPos = getPositionAlongPath(train.routeCoordinates, overallRatio);
        lat = fallbackPos.lat;
        lng = fallbackPos.lng;
        bearing = fallbackPos.bearing;
      }
    } else {
      const fallbackPos = getPositionAlongPath(train.routeCoordinates, overallRatio);
      lat = fallbackPos.lat;
      lng = fallbackPos.lng;
      bearing = fallbackPos.bearing;
    }

    // Always snap calculated position strictly onto the train's route coordinates
    const [snapLat, snapLng] = snapCoordToPath(train.routeCoordinates, lat, lng);
    lat = snapLat;
    lng = snapLng;
  }

  // Calculate distance remaining to next stop
  let distanceToNextKm = 0;
  if (nextStationObj) {
    distanceToNextKm = Math.round(calculateDistanceKm(lat, lng, nextStationObj.lat, nextStationObj.lng));
  }

  // Speed and Traffic conditions
  let speedKmH = 0;
  let trafficCondition: TrackTrafficCondition = 'CLEAR';
  let statusBn = '';
  let statusEn = '';

  if (isCurrentlyStoppedAtStation) {
    speedKmH = 0;
    trafficCondition = 'STATION_STOP';
    statusBn = `${stoppedStation.stationNameBn} স্টেশনে অবস্থান করছে (প্ল্যাটফর্ম নং ${toBengaliNumber(stoppedStation.platform || 1)})`;
    statusEn = `Halted at ${stoppedStation.stationNameEn} (Platform ${stoppedStation.platform || 1})`;
  } else {
    // Cruising or approaching junction
    const isNearJunction = (distanceToNextKm < 12 && nextStationObj?.isJunction) || (trafficDensityFactor > 1.2);
    if (isNearJunction && distanceToNextKm < 6) {
      speedKmH = Math.round(32 + (Math.sin(adjustedCurrent) * 6));
      trafficCondition = 'WAITING_CROSSING';
      statusBn = `জংশন সিগন্যাল ট্রাফিক: স্পিড রেস্ট্রিকশন (${toBengaliNumber(speedKmH)} কিমি/ঘণ্টা)`;
      statusEn = `Speed restricted: Approaching Junction (${speedKmH} km/h)`;
    } else if (trafficDensityFactor > 1.1) {
      speedKmH = Math.round(55 + (Math.sin(adjustedCurrent) * 8));
      trafficCondition = 'MODERATE';
      statusBn = `মাঝারি গতিতে চলমান (${toBengaliNumber(speedKmH)} কিমি/ঘণ্টা)`;
      statusEn = `Cruising with caution (${speedKmH} km/h)`;
    } else {
      speedKmH = Math.round(75 + (Math.sin(adjustedCurrent * 1.5) * 12));
      trafficCondition = 'CLEAR';
      statusBn = `সম্পূর্ণ গতিতে মেইন লাইনে সচল (${toBengaliNumber(speedKmH)} কিমি/ঘণ্টা)`;
      statusEn = `Mainline clear cruising (${speedKmH} km/h)`;
    }
  }

  // Upcoming stops for predictive delay analysis
  const upcomingStops = train.stops.slice(currentStopIndex);
  const predictiveDelay = calculatePredictiveDelay(train, adjustedCurrent, upcomingStops, trafficCondition);

  // ETA calculation taking predicted delay into consideration
  let etaMinutes = 0;
  if (speedKmH > 0) {
    etaMinutes = Math.round((distanceToNextKm / speedKmH) * 60);
  }
  const etaTimeStr = formatMinutesToTime(currentMinutes + etaMinutes + Math.round(predictiveDelay.predictedDelayMinutes * 0.4), true);

  const currentBlockSectionBn = prevStationObj && nextStationObj && prevStationObj.id !== nextStationObj.id
    ? `${prevStationObj.nameBn} — ${nextStationObj.nameBn} ব্লক সেকশন`
    : `${nextStationObj?.nameBn || 'রেললাইন'} সংলগ্ন ট্র্যাক`;

  return {
    train,
    isActive: true,
    currentLat: lat,
    currentLng: lng,
    bearing,
    speedKmH,
    statusBn,
    statusEn,
    trafficCondition,
    delayMinutes: predictiveDelay.predictedDelayMinutes,
    predictiveDelay,
    nextStation: nextStationObj,
    previousStation: prevStationObj,
    distanceToNextKm,
    etaNextStation: etaTimeStr,
    progressPercent: Math.round(overallRatio * 100),
    bogieFrontFacing: true,
    currentBlockSectionBn,
  };
}


/**
 * Gets real-world Bangladesh Standard Time (BST = UTC+6) in minutes from midnight.
 */
export function getCurrentBSTMinutes(): number {
  const now = new Date();
  const utcHours = now.getUTCHours();
  const utcMins = now.getUTCMinutes();
  // BST is UTC + 6 hours
  const bstHours = (utcHours + 6) % 24;
  return bstHours * 60 + utcMins;
}

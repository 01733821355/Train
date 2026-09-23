import { Train, Coach } from '../types';
import { BANGLADESH_STATIONS, STATION_MAP } from './stations';
import { BANGLADESH_RAIL_NETWORK } from './railNetwork';

// Helper to generate realistic Bangladesh Railway coach arrangement
function generateStandardCoaches(trainName: string, acHeavy = false): Coach[] {
  const coaches: Coach[] = [
    {
      id: 'loco-1',
      code: 'ইঞ্জিন',
      nameEn: 'Locomotive (WDP-4B)',
      nameBn: 'লোকোমোটিভ ইঞ্জিন',
      coachClass: 'LOCOMOTIVE',
      seats: 0,
      hasToilet: false,
      hasWheelchair: false,
      positionFromFront: 1,
      descriptionBn: '৩০০০ এইচপি ব্রডগেজ/মিটারগেজ ডিজেল-ইলেকট্রিক ইঞ্জিন (সামনে)',
    },
    {
      id: 'coach-ka',
      code: 'ক',
      nameEn: 'Coach Ka (Power Car & Shovon)',
      nameBn: 'বগি ক (পাওয়ার কার ও শোভন)',
      coachClass: 'POWER_CAR',
      seats: 36,
      hasToilet: true,
      hasWheelchair: true,
      positionFromFront: 2,
      descriptionBn: 'জেনারেটর পাওয়ার কার ও জরুরি লাইটিং কন্ট্রোল',
    },
    {
      id: 'coach-kha',
      code: 'খ',
      nameEn: 'Coach Kha (Shovon Chair)',
      nameBn: 'বগি খ (শোভন চেয়ার)',
      coachClass: 'SHOVON_CHAIR',
      seats: 60,
      hasToilet: true,
      hasWheelchair: false,
      positionFromFront: 3,
      descriptionBn: 'উচ্চমানের আরামদায়ক শোভন চেয়ার ক্লাস',
    },
    {
      id: 'coach-ga',
      code: 'গ',
      nameEn: 'Coach Ga (Shovon Chair)',
      nameBn: 'বগি গ (শোভন চেয়ার)',
      coachClass: 'SHOVON_CHAIR',
      seats: 60,
      hasToilet: true,
      hasWheelchair: false,
      positionFromFront: 4,
      descriptionBn: 'শোভন চেয়ার ক্লাস, প্রশস্ত লাগেজ র্যাক',
    },
    {
      id: 'coach-gha',
      code: 'ঘ',
      nameEn: 'Coach Gha (Shovon Chair)',
      nameBn: 'বগি ঘ (শোভন চেয়ার)',
      coachClass: 'SHOVON_CHAIR',
      seats: 60,
      hasToilet: true,
      hasWheelchair: false,
      positionFromFront: 5,
      descriptionBn: 'শোভন চেয়ার ক্লাস, মোবাইল চার্জিং পয়েন্ট',
    },
    {
      id: 'coach-uma',
      code: 'ঙ',
      nameEn: 'Coach Uma (Shovon Chair)',
      nameBn: 'বগি ঙ (শোভন চেয়ার)',
      coachClass: 'SHOVON_CHAIR',
      seats: 60,
      hasToilet: true,
      hasWheelchair: false,
      positionFromFront: 6,
      descriptionBn: 'শোভন চেয়ার ক্লাস',
    },
    {
      id: 'coach-ca',
      code: 'চ',
      nameEn: 'Coach Cha (Pantry Car & Dining)',
      nameBn: 'বগি চ (খাবার গাড়ি ও ক্যাফেটেরিয়া)',
      coachClass: 'PANTRY_CAR',
      seats: 24,
      hasToilet: true,
      hasWheelchair: false,
      positionFromFront: 7,
      descriptionBn: 'বাংলাদেশ রেলওয়ে ক্যাটারিং ও চা-নাস্তা কাউন্টার',
    },
    {
      id: 'coach-chha',
      code: 'ছ',
      nameEn: 'Coach Chha (Snigdha AC Chair)',
      nameBn: 'বগি ছ (স্নিগ্ধা এসি চেয়ার)',
      coachClass: 'SNIGDHA',
      seats: 55,
      hasToilet: true,
      hasWheelchair: true,
      positionFromFront: 8,
      descriptionBn: 'শীতাতপ নিয়ন্ত্রিত স্নিগ্ধা চেয়ার, রিক্লাইনিং সিট',
    },
    {
      id: 'coach-ja',
      code: 'জ',
      nameEn: 'Coach Ja (Snigdha AC Chair)',
      nameBn: 'বগি জ (স্নিগ্ধা এসি চেয়ার)',
      coachClass: 'SNIGDHA',
      seats: 55,
      hasToilet: true,
      hasWheelchair: false,
      positionFromFront: 9,
      descriptionBn: 'শীতাতপ নিয়ন্ত্রিত স্নিগ্ধা চেয়ার',
    },
    {
      id: 'coach-jha',
      code: 'ঝ',
      nameEn: 'Coach Jha (AC Berth / Cabin)',
      nameBn: 'বগি ঝ (এসি কেবিন / বার্থ)',
      coachClass: acHeavy ? 'AC_BERTH' : 'SNIGDHA',
      seats: acHeavy ? 36 : 55,
      hasToilet: true,
      hasWheelchair: false,
      positionFromFront: 10,
      descriptionBn: acHeavy ? 'প্রিমিয়াম ২-বার্থ ও ৪-বার্থ এসি স্লিপার কেবিন' : 'স্নিগ্ধা এসি চেয়ার',
    },
    {
      id: 'coach-nya',
      code: 'ঞ',
      nameEn: 'Coach Nya (AC Cabin / First Class)',
      nameBn: 'বগি ঞ (এসি কেবিন / ফার্স্ট ক্লাস)',
      coachClass: 'AC_BERTH',
      seats: 36,
      hasToilet: true,
      hasWheelchair: false,
      positionFromFront: 11,
      descriptionBn: 'ব্যক্তিগত লকার ও রিডিং লাইট সম্বলিত এসি কেবিন',
    },
    {
      id: 'coach-ta',
      code: 'ট',
      nameEn: 'Coach Ta (Shovon Chair)',
      nameBn: 'বগি ট (শোভন চেয়ার)',
      coachClass: 'SHOVON_CHAIR',
      seats: 60,
      hasToilet: true,
      hasWheelchair: false,
      positionFromFront: 12,
      descriptionBn: 'শোভন চেয়ার ক্লাস',
    },
    {
      id: 'coach-tha',
      code: 'ঠ',
      nameEn: 'Coach Tha (Guard Van & Luggage)',
      nameBn: 'বগি ঠ (গার্ড ভ্যান ও লাগেজ ব্রেক)',
      coachClass: 'GUARD_VAN',
      seats: 12,
      hasToilet: true,
      hasWheelchair: true,
      positionFromFront: 13,
      descriptionBn: 'ট্রেন পরিচালকের (গার্ড) কেবিন ও পেছনের লাল সিগন্যাল বাতি',
    },
  ];

  return coaches;
}

// -------------------------------------------------------------
// High-Precision Railway Route Coordinates Construction
// derived directly from BANGLADESH_RAIL_NETWORK corridor tracks
// -------------------------------------------------------------
const NETWORK_MAP: Record<string, [number, number][]> = {};
BANGLADESH_RAIL_NETWORK.forEach((segment) => {
  NETWORK_MAP[segment.id] = segment.coordinates;
});

function getSeg(id: string, reverse = false): [number, number][] {
  const coords = NETWORK_MAP[id] || [];
  return reverse ? [...coords].reverse() : [...coords];
}

function sliceCoords(
  coords: [number, number][],
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number
): [number, number][] {
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

  if (sIdx <= eIdx) {
    return coords.slice(sIdx, eIdx + 1);
  } else {
    return coords.slice(eIdx, sIdx + 1).reverse();
  }
}

// Pre-compute corridor routes
const ROUTE_DHAKA_TO_CTG = getSeg('line-dhaka-ctg');
const ROUTE_CTG_TO_DHAKA = getSeg('line-dhaka-ctg', true);

const ROUTE_DHAKA_TO_CXB = [...ROUTE_DHAKA_TO_CTG, ...getSeg('line-ctg-cxb').slice(1)];
const ROUTE_CXB_TO_DHAKA = [...getSeg('line-ctg-cxb', true), ...ROUTE_CTG_TO_DHAKA.slice(1)];

const ROUTE_DHAKA_TO_AKHAURA = sliceCoords(ROUTE_DHAKA_TO_CTG, 23.7314, 90.4267, 23.8761, 91.2133);
const ROUTE_AKHAURA_TO_DHAKA = [...ROUTE_DHAKA_TO_AKHAURA].reverse();

const ROUTE_DHAKA_TO_SYL = [...ROUTE_DHAKA_TO_AKHAURA, ...getSeg('line-akhaura-sylhet').slice(1)];
const ROUTE_SYL_TO_DHAKA = [...getSeg('line-akhaura-sylhet', true), ...ROUTE_AKHAURA_TO_DHAKA.slice(1)];

const ROUTE_DHAKA_TO_ISB = sliceCoords(getSeg('line-dhaka-jamuna-ishwardi'), 23.7314, 90.4267, 24.1611, 89.0667);
const ROUTE_ISB_TO_DHAKA = [...ROUTE_DHAKA_TO_ISB].reverse();

const ROUTE_DHAKA_TO_RAJ = [...ROUTE_DHAKA_TO_ISB, ...getSeg('line-abdulpur-rajshahi').slice(1)];
const ROUTE_RAJ_TO_DHAKA = [...getSeg('line-abdulpur-rajshahi', true), ...ROUTE_ISB_TO_DHAKA.slice(1)];

const ROUTE_DHAKA_TO_PNC = [...ROUTE_DHAKA_TO_ISB, ...getSeg('line-ishwardi-north-panchagarh').slice(1)];
const ROUTE_PNC_TO_DHAKA = [...getSeg('line-ishwardi-north-panchagarh', true), ...ROUTE_ISB_TO_DHAKA.slice(1)];

const ROUTE_DHAKA_TO_RNG = [
  ...sliceCoords(getSeg('line-dhaka-jamuna-ishwardi'), 23.7314, 90.4267, 24.7867, 88.9667),
  ...getSeg('line-santahar-bogura-rangpur').slice(1),
];
const ROUTE_RNG_TO_DHAKA = [...ROUTE_DHAKA_TO_RNG].reverse();

const ROUTE_DHAKA_TO_KLN_PADMA = getSeg('line-dhaka-padma-khulna');
const ROUTE_KLN_TO_DHAKA_PADMA = getSeg('line-dhaka-padma-khulna', true);

const ROUTE_DHAKA_TO_BNP = [
  ...sliceCoords(getSeg('line-dhaka-padma-khulna'), 23.7314, 90.4267, 23.1667, 89.2167),
  ...getSeg('line-jashore-benapole').slice(1),
];
const ROUTE_BNP_TO_DHAKA = [...ROUTE_DHAKA_TO_BNP].reverse();

const ROUTE_DHAKA_TO_DWG = getSeg('line-dhaka-mymensingh');
const ROUTE_DWG_TO_DHAKA = getSeg('line-dhaka-mymensingh', true);

const ROUTE_CTG_TO_AKHAURA = sliceCoords(ROUTE_CTG_TO_DHAKA, 22.3353, 91.8211, 23.8761, 91.2133);
const ROUTE_CTG_TO_SYL = [...ROUTE_CTG_TO_AKHAURA, ...getSeg('line-akhaura-sylhet').slice(1)];
const ROUTE_SYL_TO_CTG = [...getSeg('line-akhaura-sylhet', true), ...[...ROUTE_CTG_TO_AKHAURA].reverse().slice(1)];

const ROUTE_KLN_TO_RAJ = [
  ...getSeg('line-ishwardi-poradaha-khulna', true),
  ...getSeg('line-abdulpur-rajshahi').slice(1),
];

// -------------------------------------------------------------
// Complete 32 Bangladesh Railway Intercity Fleet
// -------------------------------------------------------------
export const BANGLADESH_TRAINS: Train[] = [
  // 1. Cox's Bazar Express (813) - Dhaka to Cox's Bazar (Night)
  {
    id: 'cxb-813',
    number: '813',
    nameBn: "কক্সবাজার এক্সপ্রেস (৮১৩)",
    nameEn: "Cox's Bazar Express (813)",
    type: 'intercity',
    zone: 'east',
    offDayBn: 'সোমবার',
    offDayEn: 'Monday',
    originStationId: 'DA',
    destinationStationId: 'CXB',
    departureTime: '22:30',
    arrivalTime: '06:40',
    totalDistanceKm: 470,
    routeCoordinates: ROUTE_DHAKA_TO_CXB,
    coaches: generateStandardCoaches("কক্সবাজার এক্সপ্রেস", true),
    stops: [
      { stationId: 'DA', stationNameBn: 'ঢাকা (কমলাপুর)', stationNameEn: 'Dhaka', arrivalTime: '22:30', departureTime: '22:30', distanceKm: 0, platform: 7 },
      { stationId: 'DAA', stationNameBn: 'ঢাকা বিমানবন্দর', stationNameEn: 'Dhaka Airport', arrivalTime: '23:05', departureTime: '23:12', distanceKm: 16, platform: 2 },
      { stationId: 'CG', stationNameBn: 'চট্টগ্রাম', stationNameEn: 'Chattogram', arrivalTime: '03:40', departureTime: '04:00', distanceKm: 320, platform: 1 },
      { stationId: 'CXB', stationNameBn: 'কক্সবাজার আইকনিক', stationNameEn: "Cox's Bazar", arrivalTime: '06:40', departureTime: '06:40', distanceKm: 470, platform: 1 },
    ],
  },

  // 2. Cox's Bazar Express (814) - Cox's Bazar to Dhaka (Afternoon)
  {
    id: 'cxb-814',
    number: '814',
    nameBn: "কক্সবাজার এক্সপ্রেস (৮১৪)",
    nameEn: "Cox's Bazar Express (814)",
    type: 'intercity',
    zone: 'east',
    offDayBn: 'মঙ্গলবার',
    offDayEn: 'Tuesday',
    originStationId: 'CXB',
    destinationStationId: 'DA',
    departureTime: '12:30',
    arrivalTime: '21:10',
    totalDistanceKm: 470,
    routeCoordinates: ROUTE_CXB_TO_DHAKA,
    coaches: generateStandardCoaches("কক্সবাজার এক্সপ্রেস", true),
    stops: [
      { stationId: 'CXB', stationNameBn: 'কক্সবাজার আইকনিক', stationNameEn: "Cox's Bazar", arrivalTime: '12:30', departureTime: '12:30', distanceKm: 0, platform: 1 },
      { stationId: 'CG', stationNameBn: 'চট্টগ্রাম', stationNameEn: 'Chattogram', arrivalTime: '15:20', departureTime: '15:40', distanceKm: 150, platform: 2 },
      { stationId: 'DAA', stationNameBn: 'ঢাকা বিমানবন্দর', stationNameEn: 'Dhaka Airport', arrivalTime: '20:30', departureTime: '20:35', distanceKm: 454, platform: 1 },
      { stationId: 'DA', stationNameBn: 'ঢাকা (কমলাপুর)', stationNameEn: 'Dhaka', arrivalTime: '21:10', departureTime: '21:10', distanceKm: 470, platform: 4 },
    ],
  },

  // 3. Parjatak Express (815) - Dhaka to Cox's Bazar (Early Morning)
  {
    id: 'prj-815',
    number: '815',
    nameBn: "পর্যটক এক্সপ্রেস (৮১৫)",
    nameEn: "Parjatak Express (815)",
    type: 'intercity',
    zone: 'east',
    offDayBn: 'রবিবার',
    offDayEn: 'Sunday',
    originStationId: 'DA',
    destinationStationId: 'CXB',
    departureTime: '06:15',
    arrivalTime: '15:00',
    totalDistanceKm: 470,
    routeCoordinates: ROUTE_DHAKA_TO_CXB,
    coaches: generateStandardCoaches("পর্যটক এক্সপ্রেস", true),
    stops: [
      { stationId: 'DA', stationNameBn: 'ঢাকা (কমলাপুর)', stationNameEn: 'Dhaka', arrivalTime: '06:15', departureTime: '06:15', distanceKm: 0, platform: 5 },
      { stationId: 'DAA', stationNameBn: 'ঢাকা বিমানবন্দর', stationNameEn: 'Dhaka Airport', arrivalTime: '06:40', departureTime: '06:45', distanceKm: 16, platform: 2 },
      { stationId: 'CG', stationNameBn: 'চট্টগ্রাম', stationNameEn: 'Chattogram', arrivalTime: '11:20', departureTime: '11:40', distanceKm: 320, platform: 3 },
      { stationId: 'CXB', stationNameBn: 'কক্সবাজার আইকনিক', stationNameEn: "Cox's Bazar", arrivalTime: '15:00', departureTime: '15:00', distanceKm: 470, platform: 2 },
    ],
  },

  // 4. Parjatak Express (816) - Cox's Bazar to Dhaka (Night)
  {
    id: 'prj-816',
    number: '816',
    nameBn: "পর্যটক এক্সপ্রেস (৮১৬)",
    nameEn: "Parjatak Express (816)",
    type: 'intercity',
    zone: 'east',
    offDayBn: 'রবিবার',
    offDayEn: 'Sunday',
    originStationId: 'CXB',
    destinationStationId: 'DA',
    departureTime: '20:00',
    arrivalTime: '04:30',
    totalDistanceKm: 470,
    routeCoordinates: ROUTE_CXB_TO_DHAKA,
    coaches: generateStandardCoaches("পর্যটক এক্সপ্রেস", true),
    stops: [
      { stationId: 'CXB', stationNameBn: 'কক্সবাজার আইকনিক', stationNameEn: "Cox's Bazar", arrivalTime: '20:00', departureTime: '20:00', distanceKm: 0, platform: 2 },
      { stationId: 'CG', stationNameBn: 'চট্টগ্রাম', stationNameEn: 'Chattogram', arrivalTime: '22:45', departureTime: '23:05', distanceKm: 150, platform: 1 },
      { stationId: 'DAA', stationNameBn: 'ঢাকা বিমানবন্দর', stationNameEn: 'Dhaka Airport', arrivalTime: '03:55', departureTime: '04:00', distanceKm: 454, platform: 1 },
      { stationId: 'DA', stationNameBn: 'ঢাকা (কমলাপুর)', stationNameEn: 'Dhaka', arrivalTime: '04:30', departureTime: '04:30', distanceKm: 470, platform: 3 },
    ],
  },

  // 5. Subarna Express (701) - Chattogram to Dhaka (Morning Non-Stop)
  {
    id: 'sub-701',
    number: '701',
    nameBn: "সুবর্ণ এক্সপ্রেস (৭০১)",
    nameEn: "Subarna Express (701)",
    type: 'intercity',
    zone: 'east',
    offDayBn: 'সোমবার',
    offDayEn: 'Monday',
    originStationId: 'CG',
    destinationStationId: 'DA',
    departureTime: '07:00',
    arrivalTime: '12:15',
    totalDistanceKm: 320,
    routeCoordinates: ROUTE_CTG_TO_DHAKA,
    coaches: generateStandardCoaches("সুবর্ণ এক্সপ্রেস", true),
    stops: [
      { stationId: 'CG', stationNameBn: 'চট্টগ্রাম', stationNameEn: 'Chattogram', arrivalTime: '07:00', departureTime: '07:00', distanceKm: 0, platform: 1 },
      { stationId: 'DAA', stationNameBn: 'ঢাকা বিমানবন্দর', stationNameEn: 'Dhaka Airport', arrivalTime: '11:45', departureTime: '11:50', distanceKm: 304, platform: 1 },
      { stationId: 'DA', stationNameBn: 'ঢাকা (কমলাপুর)', stationNameEn: 'Dhaka', arrivalTime: '12:15', departureTime: '12:15', distanceKm: 320, platform: 6 },
    ],
  },

  // 6. Subarna Express (702) - Dhaka to Chattogram (Afternoon Non-Stop)
  {
    id: 'sub-702',
    number: '702',
    nameBn: "সুবর্ণ এক্সপ্রেস (৭০২)",
    nameEn: "Subarna Express (702)",
    type: 'intercity',
    zone: 'east',
    offDayBn: 'সোমবার',
    offDayEn: 'Monday',
    originStationId: 'DA',
    destinationStationId: 'CG',
    departureTime: '16:30',
    arrivalTime: '21:45',
    totalDistanceKm: 320,
    routeCoordinates: ROUTE_DHAKA_TO_CTG,
    coaches: generateStandardCoaches("সুবর্ণ এক্সপ্রেস", true),
    stops: [
      { stationId: 'DA', stationNameBn: 'ঢাকা (কমলাপুর)', stationNameEn: 'Dhaka', arrivalTime: '16:30', departureTime: '16:30', distanceKm: 0, platform: 6 },
      { stationId: 'DAA', stationNameBn: 'ঢাকা বিমানবন্দর', stationNameEn: 'Dhaka Airport', arrivalTime: '16:55', departureTime: '17:00', distanceKm: 16, platform: 2 },
      { stationId: 'CG', stationNameBn: 'চট্টগ্রাম', stationNameEn: 'Chattogram', arrivalTime: '21:45', departureTime: '21:45', distanceKm: 320, platform: 1 },
    ],
  },

  // 7. Sonar Bangla Express (787) - Dhaka to Chattogram (Morning Premier)
  {
    id: 'snb-787',
    number: '787',
    nameBn: "সোনার বাংলা এক্সপ্রেস (৭৮৭)",
    nameEn: "Sonar Bangla Express (787)",
    type: 'intercity',
    zone: 'east',
    offDayBn: 'বুধবার',
    offDayEn: 'Wednesday',
    originStationId: 'DA',
    destinationStationId: 'CG',
    departureTime: '07:00',
    arrivalTime: '12:15',
    totalDistanceKm: 320,
    routeCoordinates: ROUTE_DHAKA_TO_CTG,
    coaches: generateStandardCoaches("সোনার বাংলা এক্সপ্রেস", true),
    stops: [
      { stationId: 'DA', stationNameBn: 'ঢাকা (কমলাপুর)', stationNameEn: 'Dhaka', arrivalTime: '07:00', departureTime: '07:00', distanceKm: 0, platform: 8 },
      { stationId: 'DAA', stationNameBn: 'ঢাকা বিমানবন্দর', stationNameEn: 'Dhaka Airport', arrivalTime: '07:25', departureTime: '07:30', distanceKm: 16, platform: 2 },
      { stationId: 'CG', stationNameBn: 'চট্টগ্রাম', stationNameEn: 'Chattogram', arrivalTime: '12:15', departureTime: '12:15', distanceKm: 320, platform: 2 },
    ],
  },

  // 8. Sonar Bangla Express (788) - Chattogram to Dhaka (Afternoon)
  {
    id: 'snb-788',
    number: '788',
    nameBn: "সোনার বাংলা এক্সপ্রেস (৭৮৮)",
    nameEn: "Sonar Bangla Express (788)",
    type: 'intercity',
    zone: 'east',
    offDayBn: 'বুধবার',
    offDayEn: 'Wednesday',
    originStationId: 'CG',
    destinationStationId: 'DA',
    departureTime: '17:00',
    arrivalTime: '22:15',
    totalDistanceKm: 320,
    routeCoordinates: ROUTE_CTG_TO_DHAKA,
    coaches: generateStandardCoaches("সোনার বাংলা এক্সপ্রেস", true),
    stops: [
      { stationId: 'CG', stationNameBn: 'চট্টগ্রাম', stationNameEn: 'Chattogram', arrivalTime: '17:00', departureTime: '17:00', distanceKm: 0, platform: 2 },
      { stationId: 'DAA', stationNameBn: 'ঢাকা বিমানবন্দর', stationNameEn: 'Dhaka Airport', arrivalTime: '21:45', departureTime: '21:50', distanceKm: 304, platform: 1 },
      { stationId: 'DA', stationNameBn: 'ঢাকা (কমলাপুর)', stationNameEn: 'Dhaka', arrivalTime: '22:15', departureTime: '22:15', distanceKm: 320, platform: 8 },
    ],
  },

  // 9. Turna Express (742) - Chattogram to Dhaka (Overnight)
  {
    id: 'trn-742',
    number: '742',
    nameBn: "তূর্ণা এক্সপ্রেস (৭৪২)",
    nameEn: "Turna Express (742)",
    type: 'intercity',
    zone: 'east',
    offDayBn: 'নাই (প্রতিদিন)',
    offDayEn: 'None',
    originStationId: 'CG',
    destinationStationId: 'DA',
    departureTime: '23:00',
    arrivalTime: '05:15',
    totalDistanceKm: 320,
    routeCoordinates: ROUTE_CTG_TO_DHAKA,
    coaches: generateStandardCoaches("তূর্ণা এক্সপ্রেস", true),
    stops: [
      { stationId: 'CG', stationNameBn: 'চট্টগ্রাম', stationNameEn: 'Chattogram', arrivalTime: '23:00', departureTime: '23:00', distanceKm: 0, platform: 3 },
      { stationId: 'FN', stationNameBn: 'ফেনী', stationNameEn: 'Feni', arrivalTime: '00:15', departureTime: '00:20', distanceKm: 70, platform: 1 },
      { stationId: 'CML', stationNameBn: 'কুমিল্লা', stationNameEn: 'Cumilla', arrivalTime: '01:05', departureTime: '01:10', distanceKm: 130, platform: 2 },
      { stationId: 'BB', stationNameBn: 'ব্রাহ্মণবাড়িয়া', stationNameEn: 'Brahmanbaria', arrivalTime: '02:30', departureTime: '02:35', distanceKm: 215, platform: 1 },
      { stationId: 'DAA', stationNameBn: 'ঢাকা বিমানবন্দর', stationNameEn: 'Dhaka Airport', arrivalTime: '04:45', departureTime: '04:50', distanceKm: 304, platform: 1 },
      { stationId: 'DA', stationNameBn: 'ঢাকা (কমলাপুর)', stationNameEn: 'Dhaka', arrivalTime: '05:15', departureTime: '05:15', distanceKm: 320, platform: 5 },
    ],
  },

  // 10. Parabat Express (709) - Dhaka to Sylhet (Morning)
  {
    id: 'prb-709',
    number: '709',
    nameBn: "পারাবত এক্সপ্রেস (৭০৯)",
    nameEn: "Parabat Express (709)",
    type: 'intercity',
    zone: 'east',
    offDayBn: 'মঙ্গলবার',
    offDayEn: 'Tuesday',
    originStationId: 'DA',
    destinationStationId: 'SYL',
    departureTime: '06:20',
    arrivalTime: '13:00',
    totalDistanceKm: 310,
    routeCoordinates: ROUTE_DHAKA_TO_SYL,
    coaches: generateStandardCoaches("পারাবত এক্সপ্রেস"),
    stops: [
      { stationId: 'DA', stationNameBn: 'ঢাকা (কমলাপুর)', stationNameEn: 'Dhaka', arrivalTime: '06:20', departureTime: '06:20', distanceKm: 0, platform: 3 },
      { stationId: 'DAA', stationNameBn: 'ঢাকা বিমানবন্দর', stationNameEn: 'Dhaka Airport', arrivalTime: '06:45', departureTime: '06:50', distanceKm: 16, platform: 2 },
      { stationId: 'BBR', stationNameBn: 'ভৈরব বাজার', stationNameEn: 'Bhairab Bazar', arrivalTime: '08:00', departureTime: '08:05', distanceKm: 85, platform: 1 },
      { stationId: 'BB', stationNameBn: 'ব্রাহ্মণবাড়িয়া', stationNameEn: 'Brahmanbaria', arrivalTime: '08:35', departureTime: '08:40', distanceKm: 110, platform: 2 },
      { stationId: 'SHA', stationNameBn: 'শায়েস্তাগঞ্জ', stationNameEn: 'Shayestaganj', arrivalTime: '10:00', departureTime: '10:05', distanceKm: 185, platform: 1 },
      { stationId: 'SRM', stationNameBn: 'শ্রীমঙ্গল', stationNameEn: 'Sreemangal', arrivalTime: '10:50', departureTime: '10:55', distanceKm: 230, platform: 2 },
      { stationId: 'KLR', stationNameBn: 'কুলাউড়া', stationNameEn: 'Kulaura', arrivalTime: '11:40', departureTime: '11:45', distanceKm: 260, platform: 1 },
      { stationId: 'SYL', stationNameBn: 'সিলেট', stationNameEn: 'Sylhet', arrivalTime: '13:00', departureTime: '13:00', distanceKm: 310, platform: 1 },
    ],
  },

  // 11. Parabat Express (710) - Sylhet to Dhaka (Afternoon)
  {
    id: 'prb-710',
    number: '710',
    nameBn: "পারাবত এক্সপ্রেস (৭১০)",
    nameEn: "Parabat Express (710)",
    type: 'intercity',
    zone: 'east',
    offDayBn: 'মঙ্গলবার',
    offDayEn: 'Tuesday',
    originStationId: 'SYL',
    destinationStationId: 'DA',
    departureTime: '15:45',
    arrivalTime: '22:20',
    totalDistanceKm: 310,
    routeCoordinates: ROUTE_SYL_TO_DHAKA,
    coaches: generateStandardCoaches("পারাবত এক্সপ্রেস"),
    stops: [
      { stationId: 'SYL', stationNameBn: 'সিলেট', stationNameEn: 'Sylhet', arrivalTime: '15:45', departureTime: '15:45', distanceKm: 0, platform: 1 },
      { stationId: 'KLR', stationNameBn: 'কুলাউড়া', stationNameEn: 'Kulaura', arrivalTime: '16:55', departureTime: '17:00', distanceKm: 50, platform: 1 },
      { stationId: 'SRM', stationNameBn: 'শ্রীমঙ্গল', stationNameEn: 'Sreemangal', arrivalTime: '17:50', departureTime: '17:55', distanceKm: 80, platform: 2 },
      { stationId: 'SHA', stationNameBn: 'শায়েস্তাগঞ্জ', stationNameEn: 'Shayestaganj', arrivalTime: '18:40', departureTime: '18:45', distanceKm: 125, platform: 1 },
      { stationId: 'BB', stationNameBn: 'ব্রাহ্মণবাড়িয়া', stationNameEn: 'Brahmanbaria', arrivalTime: '20:00', departureTime: '20:05', distanceKm: 200, platform: 2 },
      { stationId: 'DAA', stationNameBn: 'ঢাকা বিমানবন্দর', stationNameEn: 'Dhaka Airport', arrivalTime: '21:50', departureTime: '21:55', distanceKm: 294, platform: 1 },
      { stationId: 'DA', stationNameBn: 'ঢাকা (কমলাপুর)', stationNameEn: 'Dhaka', arrivalTime: '22:20', departureTime: '22:20', distanceKm: 310, platform: 3 },
    ],
  },

  // 12. Upaban Express (739) - Dhaka to Sylhet (Night)
  {
    id: 'upb-739',
    number: '739',
    nameBn: "উপবন এক্সপ্রেস (৭৩৯)",
    nameEn: "Upaban Express (739)",
    type: 'intercity',
    zone: 'east',
    offDayBn: 'বুধবার',
    offDayEn: 'Wednesday',
    originStationId: 'DA',
    destinationStationId: 'SYL',
    departureTime: '20:30',
    arrivalTime: '05:00',
    totalDistanceKm: 310,
    routeCoordinates: ROUTE_DHAKA_TO_SYL,
    coaches: generateStandardCoaches("উপবন এক্সপ্রেস", true),
    stops: [
      { stationId: 'DA', stationNameBn: 'ঢাকা (কমলাপুর)', stationNameEn: 'Dhaka', arrivalTime: '20:30', departureTime: '20:30', distanceKm: 0, platform: 2 },
      { stationId: 'DAA', stationNameBn: 'ঢাকা বিমানবন্দর', stationNameEn: 'Dhaka Airport', arrivalTime: '20:55', departureTime: '21:00', distanceKm: 16, platform: 2 },
      { stationId: 'SHA', stationNameBn: 'শায়েস্তাগঞ্জ', stationNameEn: 'Shayestaganj', arrivalTime: '01:15', departureTime: '01:20', distanceKm: 185, platform: 2 },
      { stationId: 'SRM', stationNameBn: 'শ্রীমঙ্গল', stationNameEn: 'Sreemangal', arrivalTime: '02:20', departureTime: '02:25', distanceKm: 230, platform: 1 },
      { stationId: 'SYL', stationNameBn: 'সিলেট', stationNameEn: 'Sylhet', arrivalTime: '05:00', departureTime: '05:00', distanceKm: 310, platform: 2 },
    ],
  },

  // 13. Silk City Express (753) - Dhaka to Rajshahi (Afternoon)
  {
    id: 'slk-753',
    number: '753',
    nameBn: "সিল্কসিটি এক্সপ্রেস (৭৫৩)",
    nameEn: "Silk City Express (753)",
    type: 'intercity',
    zone: 'west',
    offDayBn: 'রবিবার',
    offDayEn: 'Sunday',
    originStationId: 'DA',
    destinationStationId: 'RAJ',
    departureTime: '14:45',
    arrivalTime: '20:35',
    totalDistanceKm: 343,
    routeCoordinates: ROUTE_DHAKA_TO_RAJ,
    coaches: generateStandardCoaches("সিল্কসিটি এক্সপ্রেস"),
    stops: [
      { stationId: 'DA', stationNameBn: 'ঢাকা (কমলাপুর)', stationNameEn: 'Dhaka', arrivalTime: '14:45', departureTime: '14:45', distanceKm: 0, platform: 4 },
      { stationId: 'DAA', stationNameBn: 'ঢাকা বিমানবন্দর', stationNameEn: 'Dhaka Airport', arrivalTime: '15:10', departureTime: '15:15', distanceKm: 16, platform: 1 },
      { stationId: 'JDP', stationNameBn: 'জয়দেবপুর', stationNameEn: 'Joydebpur', arrivalTime: '15:45', departureTime: '15:48', distanceKm: 35, platform: 2 },
      { stationId: 'BBE', stationNameBn: 'বঙ্গবন্ধু সেতু পূর্ব', stationNameEn: 'Bangabandhu Setu East', arrivalTime: '17:20', departureTime: '17:25', distanceKm: 125, platform: 1 },
      { stationId: 'BBW', stationNameBn: 'বঙ্গবন্ধু সেতু পশ্চিম', stationNameEn: 'Bangabandhu Setu West', arrivalTime: '17:40', departureTime: '17:45', distanceKm: 140, platform: 2 },
      { stationId: 'ISB', stationNameBn: 'ঈশ্বরদী বাইপাস', stationNameEn: 'Ishwardi Bypass', arrivalTime: '19:10', departureTime: '19:15', distanceKm: 260, platform: 1 },
      { stationId: 'NAT', stationNameBn: 'নাটোর', stationNameEn: 'Natore', arrivalTime: '19:50', departureTime: '19:55', distanceKm: 300, platform: 2 },
      { stationId: 'RAJ', stationNameBn: 'রাজশাহী', stationNameEn: 'Rajshahi', arrivalTime: '20:35', departureTime: '20:35', distanceKm: 343, platform: 1 },
    ],
  },

  // 14. Banalata Express (791) - Dhaka to Rajshahi (Non-Stop Noon)
  {
    id: 'bnl-791',
    number: '791',
    nameBn: "বনলতা এক্সপ্রেস (৭৯১) নন-স্টপ",
    nameEn: "Banalata Express (791) Non-stop",
    type: 'intercity',
    zone: 'west',
    offDayBn: 'শুক্রবার',
    offDayEn: 'Friday',
    originStationId: 'DA',
    destinationStationId: 'RAJ',
    departureTime: '13:30',
    arrivalTime: '18:15',
    totalDistanceKm: 343,
    routeCoordinates: ROUTE_DHAKA_TO_RAJ,
    coaches: generateStandardCoaches("বনলতা এক্সপ্রেস", true),
    stops: [
      { stationId: 'DA', stationNameBn: 'ঢাকা (কমলাপুর)', stationNameEn: 'Dhaka', arrivalTime: '13:30', departureTime: '13:30', distanceKm: 0, platform: 7 },
      { stationId: 'DAA', stationNameBn: 'ঢাকা বিমানবন্দর', stationNameEn: 'Dhaka Airport', arrivalTime: '13:55', departureTime: '14:00', distanceKm: 16, platform: 2 },
      { stationId: 'RAJ', stationNameBn: 'রাজশাহী', stationNameEn: 'Rajshahi', arrivalTime: '18:15', departureTime: '18:15', distanceKm: 343, platform: 2 },
    ],
  },

  // 15. Banalata Express (792) - Rajshahi to Dhaka (Morning Non-Stop)
  {
    id: 'bnl-792',
    number: '792',
    nameBn: "বনলতা এক্সপ্রেস (৭৯২) নন-স্টপ",
    nameEn: "Banalata Express (792) Non-stop",
    type: 'intercity',
    zone: 'west',
    offDayBn: 'শুক্রবার',
    offDayEn: 'Friday',
    originStationId: 'RAJ',
    destinationStationId: 'DA',
    departureTime: '07:00',
    arrivalTime: '11:30',
    totalDistanceKm: 343,
    routeCoordinates: ROUTE_RAJ_TO_DHAKA,
    coaches: generateStandardCoaches("বনলতা এক্সপ্রেস", true),
    stops: [
      { stationId: 'RAJ', stationNameBn: 'রাজশাহী', stationNameEn: 'Rajshahi', arrivalTime: '07:00', departureTime: '07:00', distanceKm: 0, platform: 2 },
      { stationId: 'DAA', stationNameBn: 'ঢাকা বিমানবন্দর', stationNameEn: 'Dhaka Airport', arrivalTime: '11:00', departureTime: '11:05', distanceKm: 327, platform: 1 },
      { stationId: 'DA', stationNameBn: 'ঢাকা (কমলাপুর)', stationNameEn: 'Dhaka', arrivalTime: '11:30', departureTime: '11:30', distanceKm: 343, platform: 7 },
    ],
  },

  // 16. Ekota Express (705) - Dhaka to Panchagarh (Morning/Day)
  {
    id: 'ekt-705',
    number: '705',
    nameBn: "একতা এক্সপ্রেস (৭০৫)",
    nameEn: "Ekota Express (705)",
    type: 'intercity',
    zone: 'west',
    offDayBn: 'নাই (প্রতিদিন)',
    offDayEn: 'None',
    originStationId: 'DA',
    destinationStationId: 'PNC',
    departureTime: '10:15',
    arrivalTime: '21:00',
    totalDistanceKm: 560,
    routeCoordinates: ROUTE_DHAKA_TO_PNC,
    coaches: generateStandardCoaches("একতা এক্সপ্রেস", true),
    stops: [
      { stationId: 'DA', stationNameBn: 'ঢাকা (কমলাপুর)', stationNameEn: 'Dhaka', arrivalTime: '10:15', departureTime: '10:15', distanceKm: 0, platform: 5 },
      { stationId: 'DAA', stationNameBn: 'ঢাকা বিমানবন্দর', stationNameEn: 'Dhaka Airport', arrivalTime: '10:40', departureTime: '10:45', distanceKm: 16, platform: 1 },
      { stationId: 'SNT', stationNameBn: 'সান্তাহার জংশন', stationNameEn: 'Santahar', arrivalTime: '15:20', departureTime: '15:30', distanceKm: 310, platform: 2 },
      { stationId: 'PBT', stationNameBn: 'পার্বতীপুর', stationNameEn: 'Parbatipur', arrivalTime: '17:40', departureTime: '17:50', distanceKm: 420, platform: 1 },
      { stationId: 'DNJ', stationNameBn: 'দিনাজপুর', stationNameEn: 'Dinajpur', arrivalTime: '18:30', departureTime: '18:40', distanceKm: 460, platform: 1 },
      { stationId: 'PNC', stationNameBn: 'পঞ্চগড়', stationNameEn: 'Panchagarh', arrivalTime: '21:00', departureTime: '21:00', distanceKm: 560, platform: 1 },
    ],
  },

  // 17. Panchagarh Express (793) - Dhaka to Panchagarh (Overnight)
  {
    id: 'pnc-793',
    number: '793',
    nameBn: "পঞ্চগড় এক্সপ্রেস (৭৯৩)",
    nameEn: "Panchagarh Express (793)",
    type: 'intercity',
    zone: 'west',
    offDayBn: 'নাই (প্রতিদিন)',
    offDayEn: 'None',
    originStationId: 'DA',
    destinationStationId: 'PNC',
    departureTime: '23:30',
    arrivalTime: '08:45',
    totalDistanceKm: 560,
    routeCoordinates: ROUTE_DHAKA_TO_PNC,
    coaches: generateStandardCoaches("পঞ্চগড় এক্সপ্রেস", true),
    stops: [
      { stationId: 'DA', stationNameBn: 'ঢাকা (কমলাপুর)', stationNameEn: 'Dhaka', arrivalTime: '23:30', departureTime: '23:30', distanceKm: 0, platform: 6 },
      { stationId: 'DAA', stationNameBn: 'ঢাকা বিমানবন্দর', stationNameEn: 'Dhaka Airport', arrivalTime: '23:55', departureTime: '00:02', distanceKm: 16, platform: 2 },
      { stationId: 'SNT', stationNameBn: 'সান্তাহার জংশন', stationNameEn: 'Santahar', arrivalTime: '04:15', departureTime: '04:25', distanceKm: 310, platform: 3 },
      { stationId: 'PBT', stationNameBn: 'পার্বতীপুর', stationNameEn: 'Parbatipur', arrivalTime: '06:15', departureTime: '06:25', distanceKm: 420, platform: 2 },
      { stationId: 'DNJ', stationNameBn: 'দিনাজপুর', stationNameEn: 'Dinajpur', arrivalTime: '07:05', departureTime: '07:12', distanceKm: 460, platform: 1 },
      { stationId: 'PNC', stationNameBn: 'পঞ্চগড়', stationNameEn: 'Panchagarh', arrivalTime: '08:45', departureTime: '08:45', distanceKm: 560, platform: 1 },
    ],
  },

  // 18. Drutajan Express (757) - Dhaka to Panchagarh (Evening)
  {
    id: 'drt-757',
    number: '757',
    nameBn: "দ্রুতযান এক্সপ্রেস (৭৫৭)",
    nameEn: "Drutajan Express (757)",
    type: 'intercity',
    zone: 'west',
    offDayBn: 'নাই (প্রতিদিন)',
    offDayEn: 'None',
    originStationId: 'DA',
    destinationStationId: 'PNC',
    departureTime: '20:00',
    arrivalTime: '06:10',
    totalDistanceKm: 560,
    routeCoordinates: ROUTE_DHAKA_TO_PNC,
    coaches: generateStandardCoaches("দ্রুতযান এক্সপ্রেস", true),
    stops: [
      { stationId: 'DA', stationNameBn: 'ঢাকা (কমলাপুর)', stationNameEn: 'Dhaka', arrivalTime: '20:00', departureTime: '20:00', distanceKm: 0, platform: 5 },
      { stationId: 'DAA', stationNameBn: 'ঢাকা বিমানবন্দর', stationNameEn: 'Dhaka Airport', arrivalTime: '20:25', departureTime: '20:30', distanceKm: 16, platform: 1 },
      { stationId: 'SNT', stationNameBn: 'সান্তাহার জংশন', stationNameEn: 'Santahar', arrivalTime: '01:30', departureTime: '01:40', distanceKm: 310, platform: 1 },
      { stationId: 'PBT', stationNameBn: 'পার্বতীপুর', stationNameEn: 'Parbatipur', arrivalTime: '03:45', departureTime: '03:55', distanceKm: 420, platform: 2 },
      { stationId: 'PNC', stationNameBn: 'পঞ্চগড়', stationNameEn: 'Panchagarh', arrivalTime: '06:10', departureTime: '06:10', distanceKm: 560, platform: 1 },
    ],
  },

  // 19. Sundarban Express (725) - Dhaka to Khulna via Padma Bridge (Morning)
  {
    id: 'snd-725',
    number: '725',
    nameBn: "সুন্দরবন এক্সপ্রেস (৭২৫) - পদ্মা লিংক",
    nameEn: "Sundarban Express (725) via Padma Bridge",
    type: 'intercity',
    zone: 'padma',
    offDayBn: 'বুধবার',
    offDayEn: 'Wednesday',
    originStationId: 'DA',
    destinationStationId: 'KLN',
    departureTime: '08:15',
    arrivalTime: '13:00',
    totalDistanceKm: 275,
    routeCoordinates: ROUTE_DHAKA_TO_KLN_PADMA,
    coaches: generateStandardCoaches("সুন্দরবন এক্সপ্রেস", true),
    stops: [
      { stationId: 'DA', stationNameBn: 'ঢাকা (কমলাপুর)', stationNameEn: 'Dhaka', arrivalTime: '08:15', departureTime: '08:15', distanceKm: 0, platform: 2 },
      { stationId: 'GND', stationNameBn: 'গেন্ডারিয়া', stationNameEn: 'Gandaria', arrivalTime: '08:25', departureTime: '08:27', distanceKm: 5, platform: 1 },
      { stationId: 'MVL', stationNameBn: 'মাওয়া', stationNameEn: 'Mawa', arrivalTime: '08:55', departureTime: '08:58', distanceKm: 42, platform: 1 },
      { stationId: 'PDB', stationNameBn: 'পদ্মা সেতু ভায়াডাক্ট', stationNameEn: 'Padma Viaduct', arrivalTime: '09:05', departureTime: '09:08', distanceKm: 50, platform: 1 },
      { stationId: 'BNG', stationNameBn: 'ভাঙ্গা জংশন', stationNameEn: 'Bhanga', arrivalTime: '09:28', departureTime: '09:35', distanceKm: 75, platform: 2 },
      { stationId: 'KAS', stationNameBn: 'কাশিয়ানী জংশন', stationNameEn: 'Kashiani', arrivalTime: '10:05', departureTime: '10:10', distanceKm: 110, platform: 1 },
      { stationId: 'NRL', stationNameBn: 'নড়াইল', stationNameEn: 'Narail', arrivalTime: '10:45', departureTime: '10:50', distanceKm: 160, platform: 2 },
      { stationId: 'JSH', stationNameBn: 'যশোর জংশন', stationNameEn: 'Jashore', arrivalTime: '11:35', departureTime: '11:45', distanceKm: 215, platform: 3 },
      { stationId: 'KLN', stationNameBn: 'খুলনা', stationNameEn: 'Khulna', arrivalTime: '13:00', departureTime: '13:00', distanceKm: 275, platform: 1 },
    ],
  },

  // 20. Sundarban Express (726) - Khulna to Dhaka via Padma Bridge (Night)
  {
    id: 'snd-726',
    number: '726',
    nameBn: "সুন্দরবন এক্সপ্রেস (৭২৬) - পদ্মা লিংক",
    nameEn: "Sundarban Express (726) via Padma Bridge",
    type: 'intercity',
    zone: 'padma',
    offDayBn: 'বুধবার',
    offDayEn: 'Wednesday',
    originStationId: 'KLN',
    destinationStationId: 'DA',
    departureTime: '22:15',
    arrivalTime: '03:00',
    totalDistanceKm: 275,
    routeCoordinates: ROUTE_KLN_TO_DHAKA_PADMA,
    coaches: generateStandardCoaches("সুন্দরবন এক্সপ্রেস", true),
    stops: [
      { stationId: 'KLN', stationNameBn: 'খুলনা', stationNameEn: 'Khulna', arrivalTime: '22:15', departureTime: '22:15', distanceKm: 0, platform: 1 },
      { stationId: 'JSH', stationNameBn: 'যশোর জংশন', stationNameEn: 'Jashore', arrivalTime: '23:25', departureTime: '23:35', distanceKm: 60, platform: 2 },
      { stationId: 'BNG', stationNameBn: 'ভাঙ্গা জংশন', stationNameEn: 'Bhanga', arrivalTime: '01:30', departureTime: '01:35', distanceKm: 200, platform: 1 },
      { stationId: 'DA', stationNameBn: 'ঢাকা (কমলাপুর)', stationNameEn: 'Dhaka', arrivalTime: '03:00', departureTime: '03:00', distanceKm: 275, platform: 2 },
    ],
  },

  // 21. Benapole Express (795) - Dhaka to Benapole via Padma Bridge (Night)
  {
    id: 'bnp-795',
    number: '795',
    nameBn: "বেনাপোল এক্সপ্রেস (৭৯৫) - পদ্মা লিংক",
    nameEn: "Benapole Express (795) via Padma Bridge",
    type: 'intercity',
    zone: 'padma',
    offDayBn: 'বুধবার',
    offDayEn: 'Wednesday',
    originStationId: 'DA',
    destinationStationId: 'BNP',
    departureTime: '23:45',
    arrivalTime: '05:30',
    totalDistanceKm: 260,
    routeCoordinates: ROUTE_DHAKA_TO_BNP,
    coaches: generateStandardCoaches("বেনাপোল এক্সপ্রেস", true),
    stops: [
      { stationId: 'DA', stationNameBn: 'ঢাকা (কমলাপুর)', stationNameEn: 'Dhaka', arrivalTime: '23:45', departureTime: '23:45', distanceKm: 0, platform: 3 },
      { stationId: 'BNG', stationNameBn: 'ভাঙ্গা জংশন', stationNameEn: 'Bhanga', arrivalTime: '01:00', departureTime: '01:05', distanceKm: 75, platform: 1 },
      { stationId: 'JSH', stationNameBn: 'যশোর জংশন', stationNameEn: 'Jashore', arrivalTime: '04:10', departureTime: '04:20', distanceKm: 215, platform: 2 },
      { stationId: 'BNP', stationNameBn: 'বেনাপোল', stationNameEn: 'Benapole', arrivalTime: '05:30', departureTime: '05:30', distanceKm: 260, platform: 1 },
    ],
  },

  // 22. Tista Express (707) - Dhaka to Dewanganj Bazar (Morning)
  {
    id: 'tst-707',
    number: '707',
    nameBn: "তিস্তা এক্সপ্রেস (৭০৭)",
    nameEn: "Tista Express (707)",
    type: 'intercity',
    zone: 'east',
    offDayBn: 'সোমবার',
    offDayEn: 'Monday',
    originStationId: 'DA',
    destinationStationId: 'DWG',
    departureTime: '07:30',
    arrivalTime: '13:00',
    totalDistanceKm: 220,
    routeCoordinates: ROUTE_DHAKA_TO_DWG,
    coaches: generateStandardCoaches("তিস্তা এক্সপ্রেস"),
    stops: [
      { stationId: 'DA', stationNameBn: 'ঢাকা (কমলাপুর)', stationNameEn: 'Dhaka', arrivalTime: '07:30', departureTime: '07:30', distanceKm: 0, platform: 1 },
      { stationId: 'DAA', stationNameBn: 'ঢাকা বিমানবন্দর', stationNameEn: 'Dhaka Airport', arrivalTime: '07:55', departureTime: '08:00', distanceKm: 16, platform: 1 },
      { stationId: 'JDP', stationNameBn: 'জয়দেবপুর', stationNameEn: 'Joydebpur', arrivalTime: '08:30', departureTime: '08:35', distanceKm: 35, platform: 1 },
      { stationId: 'GAF', stationNameBn: 'গফরগাঁও', stationNameEn: 'Gafargaon', arrivalTime: '09:40', departureTime: '09:45', distanceKm: 95, platform: 2 },
      { stationId: 'MYM', stationNameBn: 'ময়মনসিংহ জংশন', stationNameEn: 'Mymensingh', arrivalTime: '10:40', departureTime: '10:55', distanceKm: 130, platform: 2 },
      { stationId: 'JML', stationNameBn: 'জামালপুর টাউন', stationNameEn: 'Jamalpur', arrivalTime: '11:55', departureTime: '12:05', distanceKm: 180, platform: 1 },
      { stationId: 'DWG', stationNameBn: 'দেওয়ানগঞ্জ বাজার', stationNameEn: 'Dewanganj', arrivalTime: '13:00', departureTime: '13:00', distanceKm: 220, platform: 1 },
    ],
  },

  // 23. Brahmaputra Express (743) - Dhaka to Dewanganj (Evening)
  {
    id: 'bmp-743',
    number: '743',
    nameBn: "ব্রহ্মপুত্র এক্সপ্রেস (৭৪৩)",
    nameEn: "Brahmaputra Express (743)",
    type: 'intercity',
    zone: 'east',
    offDayBn: 'নাই (প্রতিদিন)',
    offDayEn: 'None',
    originStationId: 'DA',
    destinationStationId: 'DWG',
    departureTime: '18:15',
    arrivalTime: '23:45',
    totalDistanceKm: 220,
    routeCoordinates: ROUTE_DHAKA_TO_DWG,
    coaches: generateStandardCoaches("ব্রহ্মপুত্র এক্সপ্রেস"),
    stops: [
      { stationId: 'DA', stationNameBn: 'ঢাকা (কমলাপুর)', stationNameEn: 'Dhaka', arrivalTime: '18:15', departureTime: '18:15', distanceKm: 0, platform: 4 },
      { stationId: 'DAA', stationNameBn: 'ঢাকা বিমানবন্দর', stationNameEn: 'Dhaka Airport', arrivalTime: '18:40', departureTime: '18:45', distanceKm: 16, platform: 1 },
      { stationId: 'MYM', stationNameBn: 'ময়মনসিংহ জংশন', stationNameEn: 'Mymensingh', arrivalTime: '21:30', departureTime: '21:40', distanceKm: 130, platform: 1 },
      { stationId: 'JML', stationNameBn: 'জামালপুর টাউন', stationNameEn: 'Jamalpur', arrivalTime: '22:45', departureTime: '22:50', distanceKm: 180, platform: 2 },
      { stationId: 'DWG', stationNameBn: 'দেওয়ানগঞ্জ বাজার', stationNameEn: 'Dewanganj', arrivalTime: '23:45', departureTime: '23:45', distanceKm: 220, platform: 1 },
    ],
  },

  // 24. Paharika Express (719) - Chattogram to Sylhet (Morning)
  {
    id: 'phr-719',
    number: '719',
    nameBn: "পাহাড়িকা এক্সপ্রেস (৭১৯)",
    nameEn: "Paharika Express (719)",
    type: 'intercity',
    zone: 'east',
    offDayBn: 'সোমবার',
    offDayEn: 'Monday',
    originStationId: 'CG',
    destinationStationId: 'SYL',
    departureTime: '07:50',
    arrivalTime: '16:45',
    totalDistanceKm: 380,
    routeCoordinates: ROUTE_CTG_TO_SYL,
    coaches: generateStandardCoaches("পাহাড়িকা এক্সপ্রেস"),
    stops: [
      { stationId: 'CG', stationNameBn: 'চট্টগ্রাম', stationNameEn: 'Chattogram', arrivalTime: '07:50', departureTime: '07:50', distanceKm: 0, platform: 2 },
      { stationId: 'FN', stationNameBn: 'ফেনী', stationNameEn: 'Feni', arrivalTime: '09:05', departureTime: '09:10', distanceKm: 70, platform: 1 },
      { stationId: 'CML', stationNameBn: 'কুমিল্লা', stationNameEn: 'Cumilla', arrivalTime: '09:55', departureTime: '10:00', distanceKm: 130, platform: 2 },
      { stationId: 'AKH', stationNameBn: 'আখাউড়া জংশন', stationNameEn: 'Akhaura', arrivalTime: '11:15', departureTime: '11:25', distanceKm: 180, platform: 3 },
      { stationId: 'SHA', stationNameBn: 'শায়েস্তাগঞ্জ', stationNameEn: 'Shayestaganj', arrivalTime: '12:45', departureTime: '12:50', distanceKm: 250, platform: 1 },
      { stationId: 'SRM', stationNameBn: 'শ্রীমঙ্গল', stationNameEn: 'Sreemangal', arrivalTime: '13:40', departureTime: '13:45', distanceKm: 295, platform: 1 },
      { stationId: 'KLR', stationNameBn: 'কুলাউড়া', stationNameEn: 'Kulaura', arrivalTime: '14:35', departureTime: '14:40', distanceKm: 330, platform: 2 },
      { stationId: 'SYL', stationNameBn: 'সিলেট', stationNameEn: 'Sylhet', arrivalTime: '16:45', departureTime: '16:45', distanceKm: 380, platform: 1 },
    ],
  },

  // 25. Udayan Express (724) - Sylhet to Chattogram (Night)
  {
    id: 'udy-724',
    number: '724',
    nameBn: "উদয়ন এক্সপ্রেস (৭২৪)",
    nameEn: "Udayan Express (724)",
    type: 'intercity',
    zone: 'east',
    offDayBn: 'রবিবার',
    offDayEn: 'Sunday',
    originStationId: 'SYL',
    destinationStationId: 'CG',
    departureTime: '21:40',
    arrivalTime: '06:00',
    totalDistanceKm: 380,
    routeCoordinates: ROUTE_SYL_TO_CTG,
    coaches: generateStandardCoaches("উদয়ন এক্সপ্রেস", true),
    stops: [
      { stationId: 'SYL', stationNameBn: 'সিলেট', stationNameEn: 'Sylhet', arrivalTime: '21:40', departureTime: '21:40', distanceKm: 0, platform: 3 },
      { stationId: 'KLR', stationNameBn: 'কুলাউড়া', stationNameEn: 'Kulaura', arrivalTime: '22:45', departureTime: '22:50', distanceKm: 50, platform: 1 },
      { stationId: 'SRM', stationNameBn: 'শ্রীমঙ্গল', stationNameEn: 'Sreemangal', arrivalTime: '23:40', departureTime: '23:45', distanceKm: 85, platform: 1 },
      { stationId: 'AKH', stationNameBn: 'আখাউড়া জংশন', stationNameEn: 'Akhaura', arrivalTime: '01:50', departureTime: '02:00', distanceKm: 200, platform: 2 },
      { stationId: 'CG', stationNameBn: 'চট্টগ্রাম', stationNameEn: 'Chattogram', arrivalTime: '06:00', departureTime: '06:00', distanceKm: 380, platform: 1 },
    ],
  },

  // 26. Rangpur Express (771) - Dhaka to Rangpur via Bogura (Morning)
  {
    id: 'rng-771',
    number: '771',
    nameBn: "রংপুর এক্সপ্রেস (৭৭১)",
    nameEn: "Rangpur Express (771)",
    type: 'intercity',
    zone: 'west',
    offDayBn: 'রবিবার',
    offDayEn: 'Sunday',
    originStationId: 'DA',
    destinationStationId: 'RNG',
    departureTime: '09:10',
    arrivalTime: '18:30',
    totalDistanceKm: 490,
    routeCoordinates: ROUTE_DHAKA_TO_RNG,
    coaches: generateStandardCoaches("রংপুর এক্সপ্রেস", true),
    stops: [
      { stationId: 'DA', stationNameBn: 'ঢাকা (কমলাপুর)', stationNameEn: 'Dhaka', arrivalTime: '09:10', departureTime: '09:10', distanceKm: 0, platform: 3 },
      { stationId: 'DAA', stationNameBn: 'ঢাকা বিমানবন্দর', stationNameEn: 'Dhaka Airport', arrivalTime: '09:35', departureTime: '09:40', distanceKm: 16, platform: 1 },
      { stationId: 'SNT', stationNameBn: 'সান্তাহার জংশন', stationNameEn: 'Santahar', arrivalTime: '14:20', departureTime: '14:30', distanceKm: 310, platform: 1 },
      { stationId: 'BOG', stationNameBn: 'বগুড়া', stationNameEn: 'Bogura', arrivalTime: '15:20', departureTime: '15:30', distanceKm: 355, platform: 2 },
      { stationId: 'RNG', stationNameBn: 'রংপুর', stationNameEn: 'Rangpur', arrivalTime: '18:30', departureTime: '18:30', distanceKm: 490, platform: 1 },
    ],
  },

  // 27. Kalni Express (773) - Dhaka to Sylhet (Afternoon)
  {
    id: 'kln-773',
    number: '773',
    nameBn: "কালনী এক্সপ্রেস (৭৭৩)",
    nameEn: "Kalni Express (773)",
    type: 'intercity',
    zone: 'east',
    offDayBn: 'শুক্রবার',
    offDayEn: 'Friday',
    originStationId: 'DA',
    destinationStationId: 'SYL',
    departureTime: '15:00',
    arrivalTime: '21:30',
    totalDistanceKm: 319,
    routeCoordinates: ROUTE_DHAKA_TO_SYL,
    coaches: generateStandardCoaches("কালনী এক্সপ্রেস"),
    stops: [
      { stationId: 'DA', stationNameBn: 'ঢাকা (কমলাপুর)', stationNameEn: 'Dhaka', arrivalTime: '15:00', departureTime: '15:00', distanceKm: 0, platform: 5 },
      { stationId: 'DAA', stationNameBn: 'ঢাকা বিমানবন্দর', stationNameEn: 'Dhaka Airport', arrivalTime: '15:25', departureTime: '15:30', distanceKm: 16, platform: 2 },
      { stationId: 'BB', stationNameBn: 'ব্রাহ্মণবাড়িয়া', stationNameEn: 'Brahmanbaria', arrivalTime: '17:10', departureTime: '17:15', distanceKm: 120, platform: 1 },
      { stationId: 'SRM', stationNameBn: 'শ্রীমঙ্গল', stationNameEn: 'Sreemangal', arrivalTime: '19:15', departureTime: '19:20', distanceKm: 230, platform: 2 },
      { stationId: 'SYL', stationNameBn: 'সিলেট', stationNameEn: 'Sylhet', arrivalTime: '21:30', departureTime: '21:30', distanceKm: 319, platform: 2 },
    ],
  },

  // 28. Chitra Express (763) - Dhaka to Khulna via Padma Bridge (Evening)
  {
    id: 'ctr-763',
    number: '763',
    nameBn: "চিত্রা এক্সপ্রেস (৭৬৩) - পদ্মা লিংক",
    nameEn: "Chitra Express (763) via Padma Bridge",
    type: 'intercity',
    zone: 'padma',
    offDayBn: 'সোমবার',
    offDayEn: 'Monday',
    originStationId: 'DA',
    destinationStationId: 'KLN',
    departureTime: '19:00',
    arrivalTime: '23:50',
    totalDistanceKm: 275,
    routeCoordinates: ROUTE_DHAKA_TO_KLN_PADMA,
    coaches: generateStandardCoaches("চিত্রা এক্সপ্রেস", true),
    stops: [
      { stationId: 'DA', stationNameBn: 'ঢাকা (কমলাপুর)', stationNameEn: 'Dhaka', arrivalTime: '19:00', departureTime: '19:00', distanceKm: 0, platform: 1 },
      { stationId: 'BNG', stationNameBn: 'ভাঙ্গা জংশন', stationNameEn: 'Bhanga', arrivalTime: '20:15', departureTime: '20:20', distanceKm: 75, platform: 2 },
      { stationId: 'JSH', stationNameBn: 'যশোর জংশন', stationNameEn: 'Jashore', arrivalTime: '22:30', departureTime: '22:40', distanceKm: 215, platform: 1 },
      { stationId: 'KLN', stationNameBn: 'খুলনা', stationNameEn: 'Khulna', arrivalTime: '23:50', departureTime: '23:50', distanceKm: 275, platform: 2 },
    ],
  },

  // 29. Kapotaksha Express (715) - Khulna to Rajshahi (Morning)
  {
    id: 'kpt-715',
    number: '715',
    nameBn: "কপোতাক্ষ এক্সপ্রেস (৭১৫)",
    nameEn: "Kapotaksha Express (715)",
    type: 'intercity',
    zone: 'west',
    offDayBn: 'মঙ্গলবার',
    offDayEn: 'Tuesday',
    originStationId: 'KLN',
    destinationStationId: 'RAJ',
    departureTime: '06:45',
    arrivalTime: '12:40',
    totalDistanceKm: 250,
    routeCoordinates: ROUTE_KLN_TO_RAJ,
    coaches: generateStandardCoaches("কপোতাক্ষ এক্সপ্রেস"),
    stops: [
      { stationId: 'KLN', stationNameBn: 'খুলনা', stationNameEn: 'Khulna', arrivalTime: '06:45', departureTime: '06:45', distanceKm: 0, platform: 1 },
      { stationId: 'JSH', stationNameBn: 'যশোর জংশন', stationNameEn: 'Jashore', arrivalTime: '07:45', departureTime: '07:55', distanceKm: 60, platform: 2 },
      { stationId: 'ISD', stationNameBn: 'ঈশ্বরদী জংশন', stationNameEn: 'Ishwardi', arrivalTime: '10:45', departureTime: '10:55', distanceKm: 180, platform: 3 },
      { stationId: 'RAJ', stationNameBn: 'রাজশাহী', stationNameEn: 'Rajshahi', arrivalTime: '12:40', departureTime: '12:40', distanceKm: 250, platform: 1 },
    ],
  },

  // 30. Mohanagar Express (721) - Dhaka to Chattogram (Noon)
  {
    id: 'mhn-721',
    number: '721',
    nameBn: "মহানগর এক্সপ্রেস (৭২১)",
    nameEn: "Mohanagar Express (721)",
    type: 'intercity',
    zone: 'east',
    offDayBn: 'রবিবার',
    offDayEn: 'Sunday',
    originStationId: 'DA',
    destinationStationId: 'CG',
    departureTime: '13:15',
    arrivalTime: '19:30',
    totalDistanceKm: 320,
    routeCoordinates: ROUTE_DHAKA_TO_CTG,
    coaches: generateStandardCoaches("মহানগর এক্সপ্রেস", true),
    stops: [
      { stationId: 'DA', stationNameBn: 'ঢাকা (কমলাপুর)', stationNameEn: 'Dhaka', arrivalTime: '13:15', departureTime: '13:15', distanceKm: 0, platform: 7 },
      { stationId: 'DAA', stationNameBn: 'ঢাকা বিমানবন্দর', stationNameEn: 'Dhaka Airport', arrivalTime: '13:40', departureTime: '13:45', distanceKm: 16, platform: 2 },
      { stationId: 'CML', stationNameBn: 'কুমিল্লা', stationNameEn: 'Cumilla', arrivalTime: '16:30', departureTime: '16:35', distanceKm: 180, platform: 1 },
      { stationId: 'CG', stationNameBn: 'চট্টগ্রাম', stationNameEn: 'Chattogram', arrivalTime: '19:30', departureTime: '19:30', distanceKm: 320, platform: 2 },
    ],
  },

  // 31. Mohanagar Godhuli (704) - Chattogram to Dhaka (Afternoon)
  {
    id: 'mhn-704',
    number: '704',
    nameBn: "মহানগর গোধূলী (৭০৪)",
    nameEn: "Mahanagar Godhuli (704)",
    type: 'intercity',
    zone: 'east',
    offDayBn: 'নাই (প্রতিদিন)',
    offDayEn: 'None',
    originStationId: 'CG',
    destinationStationId: 'DA',
    departureTime: '15:00',
    arrivalTime: '21:15',
    totalDistanceKm: 320,
    routeCoordinates: ROUTE_CTG_TO_DHAKA,
    coaches: generateStandardCoaches("মহানগর গোধূলী", true),
    stops: [
      { stationId: 'CG', stationNameBn: 'চট্টগ্রাম', stationNameEn: 'Chattogram', arrivalTime: '15:00', departureTime: '15:00', distanceKm: 0, platform: 3 },
      { stationId: 'FN', stationNameBn: 'ফেনী', stationNameEn: 'Feni', arrivalTime: '16:15', departureTime: '16:20', distanceKm: 70, platform: 1 },
      { stationId: 'CML', stationNameBn: 'কুমিল্লা', stationNameEn: 'Cumilla', arrivalTime: '17:10', departureTime: '17:15', distanceKm: 130, platform: 2 },
      { stationId: 'DAA', stationNameBn: 'ঢাকা বিমানবন্দর', stationNameEn: 'Dhaka Airport', arrivalTime: '20:45', departureTime: '20:50', distanceKm: 304, platform: 1 },
      { stationId: 'DA', stationNameBn: 'ঢাকা (কমলাপুর)', stationNameEn: 'Dhaka', arrivalTime: '21:15', departureTime: '21:15', distanceKm: 320, platform: 4 },
    ],
  },

  // 32. Mohanagar Provati (703) - Dhaka to Chattogram (Morning)
  {
    id: 'mhn-703',
    number: '703',
    nameBn: "মহানগর প্রভাতী (৭০৩)",
    nameEn: "Mahanagar Provati (703)",
    type: 'intercity',
    zone: 'east',
    offDayBn: 'নাই (প্রতিদিন)',
    offDayEn: 'None',
    originStationId: 'DA',
    destinationStationId: 'CG',
    departureTime: '07:45',
    arrivalTime: '14:00',
    totalDistanceKm: 320,
    routeCoordinates: ROUTE_DHAKA_TO_CTG,
    coaches: generateStandardCoaches("মহানগর প্রভাতী", true),
    stops: [
      { stationId: 'DA', stationNameBn: 'ঢাকা (কমলাপুর)', stationNameEn: 'Dhaka', arrivalTime: '07:45', departureTime: '07:45', distanceKm: 0, platform: 4 },
      { stationId: 'DAA', stationNameBn: 'ঢাকা বিমানবন্দর', stationNameEn: 'Dhaka Airport', arrivalTime: '08:10', departureTime: '08:15', distanceKm: 16, platform: 2 },
      { stationId: 'CML', stationNameBn: 'কুমিল্লা', stationNameEn: 'Cumilla', arrivalTime: '11:00', departureTime: '11:05', distanceKm: 180, platform: 1 },
      { stationId: 'CG', stationNameBn: 'চট্টগ্রাম', stationNameEn: 'Chattogram', arrivalTime: '14:00', departureTime: '14:00', distanceKm: 320, platform: 2 },
    ],
  },
];

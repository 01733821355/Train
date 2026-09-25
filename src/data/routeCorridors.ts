import { Coach } from '../types';
import { BANGLADESH_RAIL_NETWORK } from './railNetwork';

// Helper to generate realistic Bangladesh Railway 16-coach arrangement
// Total 16 passenger coaches: ক (Ka) to ত (Ta) + 1 Locomotive Engine
// DOWN: Dhaka -> Chattogram / Outbound (ক is at the front, right behind engine)
// UP: Chattogram -> Dhaka / Return trip (ত is behind engine, ক is at the very rear)
export function generateStandardCoaches(
  trainName: string,
  acHeavy = false,
  direction: 'DOWN' | 'UP' = 'DOWN'
): Coach[] {
  const isUp = direction === 'UP';

  const baseCoaches: Omit<Coach, 'positionFromFront'>[] = [
    {
      id: 'coach-ka',
      code: 'ক',
      nameEn: 'Coach Ka (Power Car & Shovon)',
      nameBn: 'বগি ক (পাওয়ার কার ও শোভন)',
      coachClass: 'POWER_CAR',
      seats: 36,
      hasToilet: true,
      hasWheelchair: true,
      descriptionBn: 'পাওয়ার কার, ডিজেল জেনারেটর ইউনিট ও শোভন চেয়ার (ইমার্জেন্সি লাইটিং কন্ট্রোল)',
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
      descriptionBn: 'উচ্চমানের আরামদায়ক শোভন চেয়ার ক্লাস',
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
      descriptionBn: 'শোভন চেয়ার ক্লাস, প্রশস্ত লাগেজ র্যাক ও ফ্যান/লাইট সুবিধা',
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
      descriptionBn: 'শোভন চেয়ার ক্লাস',
    },
    {
      id: 'coach-umo',
      code: 'ঙ',
      nameEn: 'Coach Umo (Shovon Chair)',
      nameBn: 'বগি ঙ (শোভন চেয়ার)',
      coachClass: 'SHOVON_CHAIR',
      seats: 60,
      hasToilet: true,
      hasWheelchair: false,
      descriptionBn: 'শোভন চেয়ার ক্লাস',
    },
    {
      id: 'coach-ca',
      code: 'চ',
      nameEn: 'Coach Cha (Shovon Chair)',
      nameBn: 'বগি চ (শোভন চেয়ার)',
      coachClass: 'SHOVON_CHAIR',
      seats: 60,
      hasToilet: true,
      hasWheelchair: false,
      descriptionBn: 'শোভন চেয়ার ক্লাস',
    },
    {
      id: 'coach-chha',
      code: 'ছ',
      nameEn: 'Coach Chha (Pantry Car & Dining)',
      nameBn: 'বগি ছ (খাবার গাড়ি ও ডাইনিং ক্যাফেটেরিয়া)',
      coachClass: 'PANTRY_CAR',
      seats: 30,
      hasToilet: true,
      hasWheelchair: false,
      descriptionBn: 'বাংলাদেশ রেলওয়ে ক্যাটারিং, চা-নাস্তা ও ডাইনিং কার',
    },
    {
      id: 'coach-ja',
      code: 'জ',
      nameEn: 'Coach Ja (Shovon Chair)',
      nameBn: 'বগি জ (শোভন চেয়ার)',
      coachClass: 'SHOVON_CHAIR',
      seats: 60,
      hasToilet: true,
      hasWheelchair: false,
      descriptionBn: 'শোভন চেয়ার ক্লাস',
    },
    {
      id: 'coach-jha',
      code: 'ঝ',
      nameEn: 'Coach Jha (Snigdha AC Chair)',
      nameBn: 'বগি ঝ (স্নিগ্ধা এসি চেয়ার)',
      coachClass: 'SNIGDHA',
      seats: 55,
      hasToilet: true,
      hasWheelchair: true,
      descriptionBn: 'শীতাতপ নিয়ন্ত্রিত স্নিগ্ধা চেয়ার, রিক্লাইনিং সিট ও চার্জিং পোর্ট',
    },
    {
      id: 'coach-nya',
      code: 'ঞ',
      nameEn: 'Coach Nya (Snigdha AC Chair)',
      nameBn: 'বগি ঞ (স্নিগ্ধা এসি চেয়ার)',
      coachClass: 'SNIGDHA',
      seats: 55,
      hasToilet: true,
      hasWheelchair: false,
      descriptionBn: 'শীতাতপ নিয়ন্ত্রিত স্নিগ্ধা চেয়ার ক্লাস',
    },
    {
      id: 'coach-ta',
      code: 'ট',
      nameEn: 'Coach Ta (Snigdha AC Chair)',
      nameBn: 'বগি ট (স্নিগ্ধা এসি চেয়ার)',
      coachClass: 'SNIGDHA',
      seats: 55,
      hasToilet: true,
      hasWheelchair: false,
      descriptionBn: 'শীতাতপ নিয়ন্ত্রিত স্নিগ্ধা চেয়ার ক্লাস',
    },
    {
      id: 'coach-tha',
      code: 'ঠ',
      nameEn: 'Coach Tha (AC Cabin / Snigdha)',
      nameBn: 'বগি ঠ (এসি কেবিন বার্থ / স্নিগ্ধা)',
      coachClass: acHeavy ? 'AC_BERTH' : 'SNIGDHA',
      seats: acHeavy ? 36 : 55,
      hasToilet: true,
      hasWheelchair: false,
      descriptionBn: acHeavy ? 'প্রিমিয়াম ২-বার্থ ও ৪-বার্থ এসি স্লিপার কেবিন' : 'শীতাতপ নিয়ন্ত্রিত স্নিগ্ধা চেয়ার',
    },
    {
      id: 'coach-da',
      code: 'ড',
      nameEn: 'Coach Da (AC Cabin / Shovon)',
      nameBn: 'বগি ড (এসি কেবিন / শোভন)',
      coachClass: acHeavy ? 'AC_BERTH' : 'SHOVON_CHAIR',
      seats: acHeavy ? 36 : 60,
      hasToilet: true,
      hasWheelchair: false,
      descriptionBn: acHeavy ? 'ব্যক্তিগত লকার ও রিডিং লাইট সম্বলিত এসি কেবিন' : 'শোভন চেয়ার ক্লাস',
    },
    {
      id: 'coach-dha',
      code: 'ঢ',
      nameEn: 'Coach Dha (Shovon Chair)',
      nameBn: 'বগি ঢ (শোভন চেয়ার)',
      coachClass: 'SHOVON_CHAIR',
      seats: 60,
      hasToilet: true,
      hasWheelchair: false,
      descriptionBn: 'শোভন চেয়ার ক্লাস',
    },
    {
      id: 'coach-na',
      code: 'ণ',
      nameEn: 'Coach Na (Shovon Chair)',
      nameBn: 'বগি ণ (শোভন চেয়ার)',
      coachClass: 'SHOVON_CHAIR',
      seats: 60,
      hasToilet: true,
      hasWheelchair: false,
      descriptionBn: 'শোভন চেয়ার ক্লাস',
    },
    {
      id: 'coach-taa',
      code: 'ত',
      nameEn: 'Coach Ta (Guard Van & Shovon)',
      nameBn: 'বগি ত (গার্ড ভ্যান ও লাগেজ ব্রেক)',
      coachClass: 'GUARD_VAN',
      seats: 36,
      hasToilet: true,
      hasWheelchair: true,
      descriptionBn: 'ট্রেন পরিচালকের (গার্ড) কেবিন, পেছনের লাল বাতি ও শোভন চেয়ার',
    },
  ];

  // In UP direction (Return trip, e.g. Chattogram -> Dhaka), the rake order reverses:
  // ত is right behind locomotive, and ক is at the very rear (সবার শেষে)
  const orderedPassengerCoaches = isUp ? [...baseCoaches].reverse() : baseCoaches;

  const locomotiveCoach: Coach = {
    id: 'loco-1',
    code: 'ইঞ্জিন',
    nameEn: 'Locomotive (Class 3000 / 3300 HP)',
    nameBn: 'লোকোমোটিভ ইঞ্জিন',
    coachClass: 'LOCOMOTIVE',
    seats: 0,
    hasToilet: false,
    hasWheelchair: false,
    positionFromFront: 1,
    descriptionBn: '৩০০০+ এইচপি আধুনিক ব্রডগেজ/মিটারগেজ ডিজেল-ইলেকট্রিক ইঞ্জিন (সামনে)',
  };

  const formattedPassengerCoaches: Coach[] = orderedPassengerCoaches.map((c, index) => ({
    ...c,
    positionFromFront: index + 2, // 2 to 17
  }));

  return [locomotiveCoach, ...formattedPassengerCoaches];
}

const NETWORK_MAP: Record<string, [number, number][]> = {};
BANGLADESH_RAIL_NETWORK.forEach((segment) => {
  NETWORK_MAP[segment.id] = segment.coordinates;
});

export function getSeg(id: string, reverse = false): [number, number][] {
  const coords = NETWORK_MAP[id] || [];
  return reverse ? [...coords].reverse() : [...coords];
}

export function sliceCoords(
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
export const ROUTE_DHAKA_TO_CTG = getSeg('line-dhaka-ctg');
export const ROUTE_CTG_TO_DHAKA = getSeg('line-dhaka-ctg', true);

export const ROUTE_DHAKA_TO_CXB = [...ROUTE_DHAKA_TO_CTG, ...getSeg('line-ctg-cxb').slice(1)];
export const ROUTE_CXB_TO_DHAKA = [...getSeg('line-ctg-cxb', true), ...ROUTE_CTG_TO_DHAKA.slice(1)];

export const ROUTE_CTG_TO_CXB = getSeg('line-ctg-cxb');
export const ROUTE_CXB_TO_CTG = getSeg('line-ctg-cxb', true);

export const ROUTE_DHAKA_TO_AKHAURA = sliceCoords(ROUTE_DHAKA_TO_CTG, 23.7314, 90.4267, 23.8761, 91.2133);
export const ROUTE_AKHAURA_TO_DHAKA = [...ROUTE_DHAKA_TO_AKHAURA].reverse();

export const ROUTE_DHAKA_TO_SYL = [...ROUTE_DHAKA_TO_AKHAURA, ...getSeg('line-akhaura-sylhet').slice(1)];
export const ROUTE_SYL_TO_DHAKA = [...getSeg('line-akhaura-sylhet', true), ...ROUTE_AKHAURA_TO_DHAKA.slice(1)];

export const ROUTE_DHAKA_TO_ISB = sliceCoords(getSeg('line-dhaka-jamuna-ishwardi'), 23.7314, 90.4267, 24.1611, 89.0667);
export const ROUTE_ISB_TO_DHAKA = [...ROUTE_DHAKA_TO_ISB].reverse();

export const ROUTE_DHAKA_TO_RAJ = [...ROUTE_DHAKA_TO_ISB, ...getSeg('line-abdulpur-rajshahi').slice(1)];
export const ROUTE_RAJ_TO_DHAKA = [...getSeg('line-abdulpur-rajshahi', true), ...ROUTE_ISB_TO_DHAKA.slice(1)];

export const ROUTE_DHAKA_TO_PNC = [...ROUTE_DHAKA_TO_ISB, ...getSeg('line-ishwardi-north-panchagarh').slice(1)];
export const ROUTE_PNC_TO_DHAKA = [...getSeg('line-ishwardi-north-panchagarh', true), ...ROUTE_ISB_TO_DHAKA.slice(1)];

export const ROUTE_DHAKA_TO_CLH = ROUTE_DHAKA_TO_PNC;
export const ROUTE_CLH_TO_DHAKA = ROUTE_PNC_TO_DHAKA;

export const ROUTE_DHAKA_TO_RNG = [
  ...sliceCoords(getSeg('line-dhaka-jamuna-ishwardi'), 23.7314, 90.4267, 24.7867, 88.9667),
  ...getSeg('line-santahar-bogura-rangpur').slice(1),
];
export const ROUTE_RNG_TO_DHAKA = [...ROUTE_DHAKA_TO_RNG].reverse();

export const ROUTE_DHAKA_TO_KLN_PADMA = getSeg('line-dhaka-padma-khulna');
export const ROUTE_KLN_TO_DHAKA_PADMA = getSeg('line-dhaka-padma-khulna', true);

export const ROUTE_DHAKA_TO_BNP = [
  ...sliceCoords(getSeg('line-dhaka-padma-khulna'), 23.7314, 90.4267, 23.1667, 89.2167),
  ...getSeg('line-jashore-benapole').slice(1),
];
export const ROUTE_BNP_TO_DHAKA = [...ROUTE_DHAKA_TO_BNP].reverse();

export const ROUTE_DHAKA_TO_DWG = getSeg('line-dhaka-mymensingh');
export const ROUTE_DWG_TO_DHAKA = getSeg('line-dhaka-mymensingh', true);

export const ROUTE_CTG_TO_AKHAURA = sliceCoords(ROUTE_CTG_TO_DHAKA, 22.3353, 91.8211, 23.8761, 91.2133);
export const ROUTE_CTG_TO_SYL = [...ROUTE_CTG_TO_AKHAURA, ...getSeg('line-akhaura-sylhet').slice(1)];
export const ROUTE_SYL_TO_CTG = [...getSeg('line-akhaura-sylhet', true), ...[...ROUTE_CTG_TO_AKHAURA].reverse().slice(1)];

export const ROUTE_KLN_TO_RAJ = [
  ...getSeg('line-ishwardi-poradaha-khulna', true),
  ...getSeg('line-abdulpur-rajshahi').slice(1),
];
export const ROUTE_RAJ_TO_KLN = [...ROUTE_KLN_TO_RAJ].reverse();

export const ROUTE_KLN_TO_CLH = [
  ...getSeg('line-ishwardi-poradaha-khulna', true),
  ...getSeg('line-ishwardi-north-panchagarh').slice(1),
];
export const ROUTE_CLH_TO_KLN = [...ROUTE_KLN_TO_CLH].reverse();

export const ROUTE_RAJ_TO_CLH = [
  ...getSeg('line-abdulpur-rajshahi', true),
  ...getSeg('line-ishwardi-north-panchagarh').slice(1),
];
export const ROUTE_CLH_TO_RAJ = [...ROUTE_RAJ_TO_CLH].reverse();

export const ROUTE_RAJ_TO_PNC = ROUTE_RAJ_TO_CLH;
export const ROUTE_PNC_TO_RAJ = ROUTE_CLH_TO_RAJ;

export const ROUTE_SNT_TO_BMR = getSeg('line-santahar-bogura-rangpur');
export const ROUTE_BMR_TO_SNT = getSeg('line-santahar-bogura-rangpur', true);

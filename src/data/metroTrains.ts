import { Train, Coach, Station } from '../types';

/**
 * Dhaka Metro Rail (MRT Line-6) elevated viaduct coordinates:
 * Uttara North (Diabari) to Motijheel & Kamalapur
 */
export const ROUTE_MRT6_UTTARA_TO_MOTIJHEEL: [number, number][] = [
  [23.8735, 90.3705], // 1. Uttara North (উত্তরা উত্তর - দিয়াবাড়ী ডিপো)
  [23.8640, 90.3695], // 2. Uttara Center (উত্তরা সেন্টার)
  [23.8540, 90.3685], // 3. Uttara South (উত্তরা দক্ষিণ)
  [23.8415, 90.3660], // Viaduct over Pallabi Canal
  [23.8290, 90.3630], // 4. Pallabi (পল্লবী)
  [23.8190, 90.3645], // 5. Mirpur 11 (মিরপুর ১১)
  [23.8070, 90.3685], // 6. Mirpur 10 (মিরপুর ১০ গোলচত্বর)
  [23.7970, 90.3725], // 7. Kazipara (কাজীপাড়া)
  [23.7890, 90.3745], // 8. Shewrapara (শেওড়াপাড়া)
  [23.7770, 90.3780], // 9. Agargaon (আগারগাঁও)
  [23.7705, 90.3835], // Old Airport / Planning Commission Curve
  [23.7650, 90.3875], // 10. Bijoy Sarani (বিজয় সরণি)
  [23.7565, 90.3895], // 11. Farmgate (ফার্মগেট)
  [23.7495, 90.3930], // 12. Karwan Bazar (কারওয়ান বাজার)
  [23.7385, 90.3960], // 13. Shahbagh (শাহবাগ - পিজি হাসপাতাল)
  [23.7320, 90.3975], // 14. Dhaka University (ঢাকা বিশ্ববিদ্যালয় - টিএসসি)
  [23.7275, 90.4045], // 15. Bangladesh Secretariat (বাংলাদেশ সচিবালয় - প্রেসক্লাব)
  [23.7255, 90.4165], // 16. Motijheel (মতিঝিল - বাংলাদেশ ব্যাংক)
  [23.7310, 90.4260], // 17. Kamalapur MRT (কমলাপুর এক্সটেনশন)
];

export const ROUTE_MRT6_MOTIJHEEL_TO_UTTARA: [number, number][] = [
  ...ROUTE_MRT6_UTTARA_TO_MOTIJHEEL
].reverse();

/**
 * 6-Coach Modern Kawasaki Stainless Steel AC EMU Metro Set
 */
function generateMetroCoaches(trainName: string): Coach[] {
  const letters = ['১', '২', '৩', '৪', '৫', '৬'];
  return [
    {
      id: 'metro-coach-c1',
      code: 'সি-১',
      nameEn: 'Driver Cab Car 1 (MC1)',
      nameBn: 'ড্রাইভার ক্যাব কোচ ০১ (টিসি-১)',
      coachClass: 'METRO_CAR',
      seats: 48,
      hasToilet: false,
      hasWheelchair: true,
      positionFromFront: 1,
      descriptionBn: 'শীতাতপ নিয়ন্ত্রিত আধুনিক দ্রুতগতির ইলেকট্রিক মাল্টিপল ইউনিট (ইএমইউ)',
    },
    {
      id: 'metro-coach-m1',
      code: 'এম-২',
      nameEn: 'Motor Car 2 (M1)',
      nameBn: 'মোটর কার কোচ ০২ (এম-১)',
      coachClass: 'METRO_CAR',
      seats: 54,
      hasToilet: false,
      hasWheelchair: true,
      positionFromFront: 2,
      descriptionBn: 'শীতাতপ নিয়ন্ত্রিত মেট্রো বগি, স্বয়ংক্রিয় ডিসপ্লে ও সিসিটিভি যুক্ত',
    },
    {
      id: 'metro-coach-t1',
      code: 'টি-৩',
      nameEn: 'Trailer Car 3 (T1)',
      nameBn: 'ট্রেলার কার কোচ ০৩ (টি-১)',
      coachClass: 'METRO_CAR',
      seats: 54,
      hasToilet: false,
      hasWheelchair: true,
      positionFromFront: 3,
      descriptionBn: 'মহিলা ও বিশেষ চাহিদাসম্পন্ন যাত্রীদের অগ্রাধিকার আসন সমৃদ্ধ বগি',
    },
    {
      id: 'metro-coach-t2',
      code: 'টি-৪',
      nameEn: 'Trailer Car 4 (T2)',
      nameBn: 'ট্রেলার কার কোচ ০৪ (টি-২)',
      coachClass: 'METRO_CAR',
      seats: 54,
      hasToilet: false,
      hasWheelchair: true,
      positionFromFront: 4,
      descriptionBn: 'শীতাতপ নিয়ন্ত্রিত আধুনিক দ্রুতগতির ইলেকট্রিক মাল্টিপল ইউনিট',
    },
    {
      id: 'metro-coach-m2',
      code: 'এম-৫',
      nameEn: 'Motor Car 5 (M2)',
      nameBn: 'মোটর কার কোচ ০৫ (এম-২)',
      coachClass: 'METRO_CAR',
      seats: 54,
      hasToilet: false,
      hasWheelchair: true,
      positionFromFront: 5,
      descriptionBn: 'উচ্চমানের ব্রেক ও ওভারহেড ক্যাটেনারি পাওয়ার কন্ট্রোল সিস্টেম',
    },
    {
      id: 'metro-coach-c2',
      code: 'সি-৬',
      nameEn: 'Driver Cab Car 6 (MC2)',
      nameBn: 'ড্রাইভার ক্যাব কোচ ০৬ (টিসি-২)',
      coachClass: 'METRO_CAR',
      seats: 48,
      hasToilet: false,
      hasWheelchair: true,
      positionFromFront: 6,
      descriptionBn: 'শীতাতপ নিয়ন্ত্রিত আধুনিক দ্রুতগতির ইলেকট্রিক মাল্টিপল ইউনিট (ইএমইউ)',
    },
  ];
}

/**
 * Dhaka Metro Rail MRT-6 Stations
 */
export const DHAKA_METRO_STATIONS: Station[] = [
  {
    id: 'MRT_UTN',
    code: 'UTN',
    nameEn: 'Uttara North (Diabari)',
    nameBn: 'উত্তরা উত্তর (দিয়াবাড়ী)',
    division: 'Dhaka',
    district: 'Dhaka',
    zone: 'metro',
    lat: 23.8735,
    lng: 90.3705,
    platforms: 2,
    isJunction: true,
  },
  {
    id: 'MRT_UTC',
    code: 'UTC',
    nameEn: 'Uttara Center',
    nameBn: 'উত্তরা সেন্টার',
    division: 'Dhaka',
    district: 'Dhaka',
    zone: 'metro',
    lat: 23.8640,
    lng: 90.3695,
    platforms: 2,
  },
  {
    id: 'MRT_UTS',
    code: 'UTS',
    nameEn: 'Uttara South',
    nameBn: 'উত্তরা দক্ষিণ',
    division: 'Dhaka',
    district: 'Dhaka',
    zone: 'metro',
    lat: 23.8540,
    lng: 90.3685,
    platforms: 2,
  },
  {
    id: 'MRT_PLB',
    code: 'PLB',
    nameEn: 'Pallabi',
    nameBn: 'পল্লবী',
    division: 'Dhaka',
    district: 'Dhaka',
    zone: 'metro',
    lat: 23.8290,
    lng: 90.3630,
    platforms: 2,
  },
  {
    id: 'MRT_M11',
    code: 'M11',
    nameEn: 'Mirpur 11',
    nameBn: 'মিরপুর ১১',
    division: 'Dhaka',
    district: 'Dhaka',
    zone: 'metro',
    lat: 23.8190,
    lng: 90.3645,
    platforms: 2,
  },
  {
    id: 'MRT_M10',
    code: 'M10',
    nameEn: 'Mirpur 10',
    nameBn: 'মিরপুর ১০',
    division: 'Dhaka',
    district: 'Dhaka',
    zone: 'metro',
    lat: 23.8070,
    lng: 90.3685,
    platforms: 2,
    isJunction: true,
  },
  {
    id: 'MRT_KZP',
    code: 'KZP',
    nameEn: 'Kazipara',
    nameBn: 'কাজীপাড়া',
    division: 'Dhaka',
    district: 'Dhaka',
    zone: 'metro',
    lat: 23.7970,
    lng: 90.3725,
    platforms: 2,
  },
  {
    id: 'MRT_SWP',
    code: 'SWP',
    nameEn: 'Shewrapara',
    nameBn: 'শেওড়াপাড়া',
    division: 'Dhaka',
    district: 'Dhaka',
    zone: 'metro',
    lat: 23.7890,
    lng: 90.3745,
    platforms: 2,
  },
  {
    id: 'MRT_AGG',
    code: 'AGG',
    nameEn: 'Agargaon',
    nameBn: 'আগারগাঁও',
    division: 'Dhaka',
    district: 'Dhaka',
    zone: 'metro',
    lat: 23.7770,
    lng: 90.3780,
    platforms: 2,
  },
  {
    id: 'MRT_BJS',
    code: 'BJS',
    nameEn: 'Bijoy Sarani',
    nameBn: 'বিজয় সরণি',
    division: 'Dhaka',
    district: 'Dhaka',
    zone: 'metro',
    lat: 23.7650,
    lng: 90.3875,
    platforms: 2,
  },
  {
    id: 'MRT_FMG',
    code: 'FMG',
    nameEn: 'Farmgate',
    nameBn: 'ফার্মগেট',
    division: 'Dhaka',
    district: 'Dhaka',
    zone: 'metro',
    lat: 23.7565,
    lng: 90.3895,
    platforms: 2,
  },
  {
    id: 'MRT_KRB',
    code: 'KRB',
    nameEn: 'Karwan Bazar',
    nameBn: 'কারওয়ান বাজার',
    division: 'Dhaka',
    district: 'Dhaka',
    zone: 'metro',
    lat: 23.7495,
    lng: 90.3930,
    platforms: 2,
  },
  {
    id: 'MRT_SHB',
    code: 'SHB',
    nameEn: 'Shahbagh',
    nameBn: 'শাহবাগ',
    division: 'Dhaka',
    district: 'Dhaka',
    zone: 'metro',
    lat: 23.7385,
    lng: 90.3960,
    platforms: 2,
  },
  {
    id: 'MRT_DU',
    code: 'DU',
    nameEn: 'Dhaka University (TSC)',
    nameBn: 'ঢাকা বিশ্ববিদ্যালয় (টিএসসি)',
    division: 'Dhaka',
    district: 'Dhaka',
    zone: 'metro',
    lat: 23.7320,
    lng: 90.3975,
    platforms: 2,
  },
  {
    id: 'MRT_SEC',
    code: 'SEC',
    nameEn: 'Bangladesh Secretariat',
    nameBn: 'বাংলাদেশ সচিবালয়',
    division: 'Dhaka',
    district: 'Dhaka',
    zone: 'metro',
    lat: 23.7275,
    lng: 90.4045,
    platforms: 2,
  },
  {
    id: 'MRT_MTJ',
    code: 'MTJ',
    nameEn: 'Motijheel',
    nameBn: 'মতিঝিল',
    division: 'Dhaka',
    district: 'Dhaka',
    zone: 'metro',
    lat: 23.7255,
    lng: 90.4165,
    platforms: 2,
    isJunction: true,
  },
];

/**
 * Standard MRT-6 Schedule Stops for a 38-minute trip
 */
function createMRTStops(startHour: number, startMinute: number, isSouthbound: boolean) {
  const stationSeq = isSouthbound
    ? [
        { id: 'MRT_UTN', nameBn: 'উত্তরা উত্তর', nameEn: 'Uttara North', km: 0 },
        { id: 'MRT_UTC', nameBn: 'উত্তরা সেন্টার', nameEn: 'Uttara Center', km: 1.2 },
        { id: 'MRT_UTS', nameBn: 'উত্তরা দক্ষিণ', nameEn: 'Uttara South', km: 2.3 },
        { id: 'MRT_PLB', nameBn: 'পল্লবী', nameEn: 'Pallabi', km: 5.2 },
        { id: 'MRT_M11', nameBn: 'মিরপুর ১১', nameEn: 'Mirpur 11', km: 6.4 },
        { id: 'MRT_M10', nameBn: 'মিরপুর ১০', nameEn: 'Mirpur 10', km: 7.8 },
        { id: 'MRT_KZP', nameBn: 'কাজীপাড়া', nameEn: 'Kazipara', km: 9.1 },
        { id: 'MRT_SWP', nameBn: 'শেওড়াপাড়া', nameEn: 'Shewrapara', km: 10.1 },
        { id: 'MRT_AGG', nameBn: 'আগারগাঁও', nameEn: 'Agargaon', km: 11.7 },
        { id: 'MRT_BJS', nameBn: 'বিজয় সরণি', nameEn: 'Bijoy Sarani', km: 13.2 },
        { id: 'MRT_FMG', nameBn: 'ফার্মগেট', nameEn: 'Farmgate', km: 14.3 },
        { id: 'MRT_KRB', nameBn: 'কারওয়ান বাজার', nameEn: 'Karwan Bazar', km: 15.2 },
        { id: 'MRT_SHB', nameBn: 'শাহবাগ', nameEn: 'Shahbagh', km: 16.5 },
        { id: 'MRT_DU', nameBn: 'ঢাকা বিশ্ববিদ্যালয়', nameEn: 'Dhaka University', km: 17.4 },
        { id: 'MRT_SEC', nameBn: 'বাংলাদেশ সচিবালয়', nameEn: 'Secretariat', km: 18.5 },
        { id: 'MRT_MTJ', nameBn: 'মতিঝিল', nameEn: 'Motijheel', km: 20.1 },
      ]
    : [
        { id: 'MRT_MTJ', nameBn: 'মতিঝিল', nameEn: 'Motijheel', km: 0 },
        { id: 'MRT_SEC', nameBn: 'বাংলাদেশ সচিবালয়', nameEn: 'Secretariat', km: 1.6 },
        { id: 'MRT_DU', nameBn: 'ঢাকা বিশ্ববিদ্যালয়', nameEn: 'Dhaka University', km: 2.7 },
        { id: 'MRT_SHB', nameBn: 'শাহবাগ', nameEn: 'Shahbagh', km: 3.6 },
        { id: 'MRT_KRB', nameBn: 'কারওয়ান বাজার', nameEn: 'Karwan Bazar', km: 4.9 },
        { id: 'MRT_FMG', nameBn: 'ফার্মগেট', nameEn: 'Farmgate', km: 5.8 },
        { id: 'MRT_BJS', nameBn: 'বিজয় সরণি', nameEn: 'Bijoy Sarani', km: 6.9 },
        { id: 'MRT_AGG', nameBn: 'আগারগাঁও', nameEn: 'Agargaon', km: 8.4 },
        { id: 'MRT_SWP', nameBn: 'শেওড়াপাড়া', nameEn: 'Shewrapara', km: 10.0 },
        { id: 'MRT_KZP', nameBn: 'কাজীপাড়া', nameEn: 'Kazipara', km: 11.0 },
        { id: 'MRT_M10', nameBn: 'মিরপুর ১০', nameEn: 'Mirpur 10', km: 12.3 },
        { id: 'MRT_M11', nameBn: 'মিরপুর ১১', nameEn: 'Mirpur 11', km: 13.7 },
        { id: 'MRT_PLB', nameBn: 'পল্লবী', nameEn: 'Pallabi', km: 14.9 },
        { id: 'MRT_UTS', nameBn: 'উত্তরা দক্ষিণ', nameEn: 'Uttara South', km: 17.8 },
        { id: 'MRT_UTC', nameBn: 'উত্তরা সেন্টার', nameEn: 'Uttara Center', km: 18.9 },
        { id: 'MRT_UTN', nameBn: 'উত্তরা উত্তর', nameEn: 'Uttara North', km: 20.1 },
      ];

  let currentMin = startHour * 60 + startMinute;
  return stationSeq.map((st, idx) => {
    const isFirst = idx === 0;
    const isLast = idx === stationSeq.length - 1;
    const dwell = isFirst || isLast ? 0 : 1; // 1 min dwell at station
    const travelTime = idx === 0 ? 0 : 2; // ~2 mins between metro stations
    currentMin += travelTime;

    const arrH = Math.floor(currentMin / 60) % 24;
    const arrM = currentMin % 60;
    const arrStr = `${arrH.toString().padStart(2, '0')}:${arrM.toString().padStart(2, '0')}`;

    currentMin += dwell;
    const depH = Math.floor(currentMin / 60) % 24;
    const depM = currentMin % 60;
    const depStr = `${depH.toString().padStart(2, '0')}:${depM.toString().padStart(2, '0')}`;

    return {
      stationId: st.id,
      stationNameBn: st.nameBn,
      stationNameEn: st.nameEn,
      arrivalTime: arrStr,
      departureTime: depStr,
      distanceKm: st.km,
      platform: 1,
    };
  });
}

/**
 * Metro Fleet
 */
export const DHAKA_METRO_TRAINS: Train[] = [
  // 1. MRT Line-6 Set 01 (Morning Peak - Uttara to Motijheel)
  {
    id: 'mrt-6-01',
    number: 'এমআরটি-৬০১',
    nameBn: 'মেট্রোরেল এমআরটি-৬ (০১)',
    nameEn: 'Metro Rail MRT-6 (01)',
    type: 'commuter',
    zone: 'metro',
    offDayBn: 'শুক্রবার',
    offDayEn: 'Friday',
    originStationId: 'MRT_UTN',
    destinationStationId: 'MRT_MTJ',
    departureTime: '07:30',
    arrivalTime: '08:08',
    totalDistanceKm: 20.1,
    routeCoordinates: ROUTE_MRT6_UTTARA_TO_MOTIJHEEL,
    coaches: generateMetroCoaches('মেট্রোরেল ০১'),
    stops: createMRTStops(7, 30, true),
  },

  // 2. MRT Line-6 Set 02 (Morning Peak - Motijheel to Uttara)
  {
    id: 'mrt-6-02',
    number: 'এমআরটি-৬০২',
    nameBn: 'মেট্রোরেল এমআরটি-৬ (০২)',
    nameEn: 'Metro Rail MRT-6 (02)',
    type: 'commuter',
    zone: 'metro',
    offDayBn: 'শুক্রবার',
    offDayEn: 'Friday',
    originStationId: 'MRT_MTJ',
    destinationStationId: 'MRT_UTN',
    departureTime: '08:15',
    arrivalTime: '08:53',
    totalDistanceKm: 20.1,
    routeCoordinates: ROUTE_MRT6_MOTIJHEEL_TO_UTTARA,
    coaches: generateMetroCoaches('মেট্রোরেল ০২'),
    stops: createMRTStops(8, 15, false),
  },

  // 3. MRT Line-6 Set 03 (Mid-Day - Uttara to Motijheel)
  {
    id: 'mrt-6-03',
    number: 'এমআরটি-৬০৩',
    nameBn: 'মেট্রোরেল এমআরটি-৬ (০৩)',
    nameEn: 'Metro Rail MRT-6 (03)',
    type: 'commuter',
    zone: 'metro',
    offDayBn: 'শুক্রবার',
    offDayEn: 'Friday',
    originStationId: 'MRT_UTN',
    destinationStationId: 'MRT_MTJ',
    departureTime: '12:00',
    arrivalTime: '12:38',
    totalDistanceKm: 20.1,
    routeCoordinates: ROUTE_MRT6_UTTARA_TO_MOTIJHEEL,
    coaches: generateMetroCoaches('মেট্রোরেল ০৩'),
    stops: createMRTStops(12, 0, true),
  },

  // 4. MRT Line-6 Set 04 (Mid-Day - Motijheel to Uttara)
  {
    id: 'mrt-6-04',
    number: 'এমআরটি-৬০৪',
    nameBn: 'মেট্রোরেল এমআরটি-৬ (০৪)',
    nameEn: 'Metro Rail MRT-6 (04)',
    type: 'commuter',
    zone: 'metro',
    offDayBn: 'শুক্রবার',
    offDayEn: 'Friday',
    originStationId: 'MRT_MTJ',
    destinationStationId: 'MRT_UTN',
    departureTime: '13:00',
    arrivalTime: '13:38',
    totalDistanceKm: 20.1,
    routeCoordinates: ROUTE_MRT6_MOTIJHEEL_TO_UTTARA,
    coaches: generateMetroCoaches('মেট্রোরেল ০৪'),
    stops: createMRTStops(13, 0, false),
  },

  // 5. MRT Line-6 Set 05 (Evening Peak - Uttara to Motijheel)
  {
    id: 'mrt-6-05',
    number: 'এমআরটি-৬০৫',
    nameBn: 'মেট্রোরেল এমআরটি-৬ (০৫)',
    nameEn: 'Metro Rail MRT-6 (05)',
    type: 'commuter',
    zone: 'metro',
    offDayBn: 'শুক্রবার',
    offDayEn: 'Friday',
    originStationId: 'MRT_UTN',
    destinationStationId: 'MRT_MTJ',
    departureTime: '17:40',
    arrivalTime: '18:18',
    totalDistanceKm: 20.1,
    routeCoordinates: ROUTE_MRT6_UTTARA_TO_MOTIJHEEL,
    coaches: generateMetroCoaches('মেট্রোরেল ০৫'),
    stops: createMRTStops(17, 40, true),
  },

  // 6. MRT Line-6 Set 06 (Evening Peak - Motijheel to Uttara)
  {
    id: 'mrt-6-06',
    number: 'এমআরটি-৬০৬',
    nameBn: 'মেট্রোরেল এমআরটি-৬ (০৬)',
    nameEn: 'Metro Rail MRT-6 (06)',
    type: 'commuter',
    zone: 'metro',
    offDayBn: 'শুক্রবার',
    offDayEn: 'Friday',
    originStationId: 'MRT_MTJ',
    destinationStationId: 'MRT_UTN',
    departureTime: '18:30',
    arrivalTime: '19:08',
    totalDistanceKm: 20.1,
    routeCoordinates: ROUTE_MRT6_MOTIJHEEL_TO_UTTARA,
    coaches: generateMetroCoaches('মেট্রোরেল ০৬'),
    stops: createMRTStops(18, 30, false),
  },
];

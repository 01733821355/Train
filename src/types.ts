export type TrainZone = 'east' | 'west' | 'padma' | 'metro';

export type CoachClass = 
  | 'AC_BERTH'     // এসি বার্থ
  | 'AC_SEAT'      // এসি সিট
  | 'SNIGDHA'      // স্নিগ্ধা (এসি চেয়ার)
  | 'SHOVON_CHAIR' // শোভন চেয়ার
  | 'SHOVON'       // সাধারণ শোভন
  | 'FIRST_CLASS'  // প্রথম শ্রেণি
  | 'POWER_CAR'    // পাওয়ার কার
  | 'PANTRY_CAR'   // খাবার গাড়ি / ডাইনিং
  | 'LOCOMOTIVE'   // ইঞ্জিন (লোকোমোটিভ)
  | 'GUARD_VAN'    // গার্ড ভ্যান / লাগেজ
  | 'METRO_CAR';   // মেট্রোরেল কোচ (শীতাতপ নিয়ন্ত্রিত আধুনিক EMU)

export interface Coach {
  id: string;
  code: string;       // যেমন: 'ক', 'খ', 'গ', 'ঘ', 'ইঞ্জিন', 'গার্ড'
  nameEn: string;     // e.g. 'Coach Ka', 'Locomotive'
  nameBn: string;     // e.g. 'বগি ক', 'ইঞ্জিন'
  coachClass: CoachClass;
  seats: number;
  hasToilet: boolean;
  hasWheelchair: boolean;
  positionFromFront: number; // 1 = Locomotive, 2 = first bogie, etc.
  descriptionBn: string;
}

export interface Station {
  id: string;
  code: string;
  nameEn: string;
  nameBn: string;
  division: string;
  district: string;
  zone: TrainZone;
  lat: number;
  lng: number;
  platforms: number;
  isJunction?: boolean;
}

export interface ScheduleStop {
  stationId: string;
  stationNameBn: string;
  stationNameEn: string;
  arrivalTime: string;   // "HH:MM" 24h
  departureTime: string; // "HH:MM" 24h
  distanceKm: number;
  platform?: number;
}

export type TrackTrafficCondition = 'CLEAR' | 'MODERATE' | 'RESTRICTED' | 'WAITING_CROSSING' | 'STATION_STOP';

export interface Train {
  id: string;
  number: string;       // e.g. '813'
  nameBn: string;       // e.g. 'কক্সবাজার এক্সপ্রেস'
  nameEn: string;       // e.g. "Cox's Bazar Express"
  type: 'intercity' | 'express' | 'mail' | 'commuter';
  zone: TrainZone;
  offDayBn: string;
  offDayEn: string;
  originStationId: string;
  destinationStationId: string;
  departureTime: string; // "HH:MM"
  arrivalTime: string;   // "HH:MM"
  totalDistanceKm: number;
  stops: ScheduleStop[];
  coaches: Coach[];
  routeCoordinates: [number, number][]; // Polyline coords
}

export interface PredictiveDelayInfo {
  predictedDelayMinutes: number;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  primaryFactorBn: string; // e.g., 'টঙ্গী জংশনে ভারী ট্রাফিক ক্রসিং', 'সিঙ্গেল লাইন কনজেশন'
  isLate: boolean; // predictedDelayMinutes >= 5
  severity: 'ON_TIME' | 'MINOR_DELAY' | 'MODERATE_DELAY' | 'MAJOR_DELAY';
}

export interface LiveTrainStatus {
  train: Train;
  isActive: boolean;
  currentLat: number;
  currentLng: number;
  bearing: number;        // Angle in degrees for direction of travel
  speedKmH: number;
  statusBn: string;
  statusEn: string;
  trafficCondition: TrackTrafficCondition;
  delayMinutes: number;
  predictiveDelay: PredictiveDelayInfo;
  nextStation: Station | null;
  previousStation: Station | null;
  distanceToNextKm: number;
  etaNextStation: string;
  progressPercent: number; // 0 to 100
  bogieFrontFacing: boolean; // True if Locomotive is in front towards destination
  currentBlockSectionBn: string;
}

export interface ScreenCustomizationSettings {
  showTopStatusBar: boolean;          // শীর্ষ স্ট্যাটাস ও সময় বার
  showSoloTrainFocus: boolean;         // একক ট্রেন ট্র্যাক মোড (নির্বাচিত ট্রেনের সময় অন্যান্য ট্রেন সম্পূর্ণ লুকান)
  showUserProximityHud: boolean;       // নিকটবর্তী স্টেশন ও লাইভ দূরত্বের HUD
  showUpcomingStopsTimeline: boolean;  // ট্রেনের পরবর্তী স্টপেজ ও শিডিউল তালিকা
  showCongestionRibbons: boolean;      // ১০০ - ৩০০ মিটার ট্রেন ডিটেকশন ট্রাফিক জ্যাম রিবন
  jamDetectionRangeMeters: number;     // ১০০ থেকে ৩০০ মিটার (ডিফল্ট ২০০ মিটার)
  showLandmarkBadges: boolean;         // আইকনিক সেতু ও জংশন ট্যাগ
  showSpeedometerHud: boolean;         // লাইভ স্পিডোমিটার ও ইঞ্জিন পাওয়ার
  showQuickTicketBtn: boolean;         // ১-ক্লিক দ্রুত টিকিট বুকিং বাটন
  showRailwayOverlay: boolean;         // ওপেনরেলওয়েম্যাপ রেললাইন ট্র্যাক লেয়ার
  showWagonsOnZoom: boolean;           // ম্যাপ জুম করলে বগি প্রদর্শন
  smallMarkerMode: boolean;            // ছোট মার্কার এবং উপরে ট্রেনের নাম
}

export const DEFAULT_SCREEN_SETTINGS: ScreenCustomizationSettings = {
  showTopStatusBar: true,
  showSoloTrainFocus: false,            // সব ট্রেন ট্র্যাকে দৃশ্যমান
  showUserProximityHud: false,          // সেটিংসে অপশনাল
  showUpcomingStopsTimeline: false,     // সেটিংসে অপশনাল
  showCongestionRibbons: true,          // ১০০-৩০০ মিটার ট্রেন ডিটেকশন জ্যাম রিবন ট্র্যাকে সক্রিয়
  jamDetectionRangeMeters: 200,         // ২০০ মিটার (১০০মি - ৩০০মি কনফিগারযোগ্য)
  showLandmarkBadges: true,             // সেতু ও মূল পয়েন্ট
  showSpeedometerHud: false,            // সেটিংসে অপশনাল
  showQuickTicketBtn: true,             // বুকিং বাটন
  showRailwayOverlay: true,             // ওপেনরেলওয়েম্যাপ GIS ট্র্যাক (ডিফল্ট সত্য নির্ভুল ট্র্যাক)
  showWagonsOnZoom: true,               // জুম করলে বগি দৃশ্যমান
  smallMarkerMode: true,                // ছোট মার্কার ও উপরে নাম
};


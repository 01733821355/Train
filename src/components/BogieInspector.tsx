import React, { useState } from 'react';
import { Coach, LiveTrainStatus } from '../types';
import { toBengaliNumber } from '../utils/geoUtils';
import {
  Train as TrainIcon,
  Utensils,
  Zap,
  Shield,
  Accessibility,
  Info,
  Compass,
  ArrowRight,
  ArrowLeft,
  Ticket,
  ExternalLink,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface BogieInspectorProps {
  status: LiveTrainStatus;
  onClose?: () => void;
  onOpenTicketBooking?: (trainId?: string) => void;
  theme?: 'light' | 'dark';
}

export const BogieInspector: React.FC<BogieInspectorProps> = ({
  status,
  onOpenTicketBooking,
  theme = 'dark',
}) => {
  const { train, speedKmH } = status;
  const isLight = theme === 'light';

  // Check if initial formation has 'ত' at front (UP / Return direction)
  const isInitiallyUp = train.coaches[1]?.code === 'ত';
  const [isReversedView, setIsReversedView] = useState(false);

  // Compute effective coaches list
  const loco = train.coaches.find((c) => c.coachClass === 'LOCOMOTIVE') || train.coaches[0];
  const passengerCoaches = train.coaches.filter((c) => c.coachClass !== 'LOCOMOTIVE');

  const effectivePassengerCoaches = isReversedView
    ? [...passengerCoaches].reverse()
    : passengerCoaches;

  const displayedCoaches: Coach[] = [
    loco,
    ...effectivePassengerCoaches.map((c, i) => ({
      ...c,
      positionFromFront: i + 2,
    })),
  ];

  const [selectedCoach, setSelectedCoach] = useState<Coach>(
    displayedCoaches[1] || displayedCoaches[0]
  );

  // Is current view UP (return) or DOWN?
  const isCurrentViewUp = isInitiallyUp ? !isReversedView : isReversedView;

  const getCoachColor = (coachClass: Coach['coachClass']) => {
    switch (coachClass) {
      case 'LOCOMOTIVE':
        return isLight
          ? 'bg-amber-100 text-amber-900 border-amber-400 shadow-sm'
          : 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-amber-500/20';
      case 'POWER_CAR':
        return isLight
          ? 'bg-rose-100 text-rose-900 border-rose-400'
          : 'bg-rose-500/20 text-rose-300 border-rose-500/50';
      case 'PANTRY_CAR':
        return isLight
          ? 'bg-orange-100 text-orange-900 border-orange-400'
          : 'bg-orange-500/20 text-orange-300 border-orange-500/50';
      case 'SNIGDHA':
        return isLight
          ? 'bg-emerald-100 text-emerald-900 border-emerald-400 shadow-sm'
          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-emerald-500/20';
      case 'AC_BERTH':
        return isLight
          ? 'bg-purple-100 text-purple-900 border-purple-400 shadow-sm'
          : 'bg-purple-500/20 text-purple-300 border-purple-500/50 shadow-purple-500/20';
      case 'GUARD_VAN':
        return isLight
          ? 'bg-red-100 text-red-900 border-red-400'
          : 'bg-red-500/20 text-red-300 border-red-500/50';
      case 'SHOVON_CHAIR':
      default:
        return isLight
          ? 'bg-sky-100 text-sky-900 border-sky-400'
          : 'bg-sky-500/20 text-sky-300 border-sky-500/50';
    }
  };

  const getCoachIcon = (coachClass: Coach['coachClass']) => {
    switch (coachClass) {
      case 'LOCOMOTIVE':
        return <TrainIcon className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      case 'POWER_CAR':
        return <Zap className="w-4 h-4 text-rose-600 dark:text-rose-400" />;
      case 'PANTRY_CAR':
        return <Utensils className="w-4 h-4 text-orange-600 dark:text-orange-400" />;
      case 'GUARD_VAN':
        return <Shield className="w-4 h-4 text-red-600 dark:text-red-400" />;
      default:
        return <TrainIcon className="w-4 h-4 text-sky-600 dark:text-sky-400" />;
    }
  };

  return (
    <div
      className={`border rounded-2xl p-4 md:p-6 shadow-xl space-y-4 transition-colors ${
        isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-700/80 text-slate-100'
      }`}
    >
      {/* Header with direction indicator */}
      <div
        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 ${
          isLight ? 'border-slate-200' : 'border-slate-800'
        }`}
      >
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                isLight
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}
            >
              বগি বিন্যাস নির্দেশিকা (Bogie Order)
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-bold border ${
                isLight
                  ? 'bg-blue-50 text-blue-800 border-blue-200'
                  : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
              }`}
            >
              মোট {toBengaliNumber(passengerCoaches.length)} টি বগি (১৬ বগি ফরমেশন)
            </span>
          </div>
          <h3 className={`text-lg md:text-xl font-bold mt-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>
            {train.nameBn} <span className={`text-sm font-normal ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>({train.number})</span>
          </h3>
          <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            রুট: {train.stops[0].stationNameBn} ➔ {train.stops[train.stops.length - 1].stationNameBn}
          </p>
        </div>

        {/* Ticket Booking & Orientation Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5">
            {onOpenTicketBooking && (
              <button
                onClick={() => onOpenTicketBooking(train.id)}
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
              >
                <Ticket className="w-3.5 h-3.5" />
                <span>টিকেট বুক করুন</span>
              </button>
            )}

            <a
              href="https://eticket.railway.gov.bd/"
              target="_blank"
              rel="noopener noreferrer"
              className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
              title="অফিসিয়াল রেলওয়ে ই-টিকেট ওয়েবসাইটে যান (eticket.railway.gov.bd)"
            >
              <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
            </a>
          </div>

          {/* Toggle Direction */}
          <button
            onClick={() => setIsReversedView(!isReversedView)}
            className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              isReversedView
                ? 'bg-amber-600 text-white border-amber-600 shadow-md'
                : isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
            title="ফিরতি পথের রেক উল্টোলে বগির অবস্থান পরিবর্তন দেখতে ক্লিক করুন"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isReversedView ? 'মূল রুটে ফিরুন' : 'ফিরতি পথ দেখুন'}</span>
          </button>
        </div>
      </div>

      {/* Bangladesh Railway SMS 16318 Bogie Sequence Info Banner */}
      <div
        className={`p-3 sm:p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
          isLight ? 'bg-amber-50/90 border-amber-300/80 text-amber-950' : 'bg-amber-950/20 border-amber-800/50 text-amber-200'
        }`}
      >
        <div className="flex items-start gap-2.5">
          <Compass className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold">
                {isCurrentViewUp ? 'ফিরতি যাত্রা অভিমুখ (চট্টগ্রাম ➔ ঢাকা):' : 'মূল যাত্রা অভিমুখ (ঢাকা ➔ চট্টগ্রাম / গন্তব্য):'}
              </span>
              <span className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
                {isCurrentViewUp ? "বগি 'ত' সামনে ➔ 'ক' ট্রেনের সবার শেষে" : "বগি 'ক' ট্রেনের সবার আগে ➔ 'ত' সবার শেষে"}
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              বাংলাদেশ রেলওয়ে ও <strong>SMS 16318</strong> নিয়ম: ঢাকা থেকে যাওয়ার সময় <strong>'ক'</strong> বগি ইঞ্জিনের ঠিক পেছনে (সবার আগে) থাকে। ফিরতি পথে ইঞ্জিন অপর প্রান্তে জোড়ায় ট্রেনের <strong>'ক'</strong> বগি সবার শেষে এবং <strong>'ত'</strong> বগি ইঞ্জিনের পেছনে থাকে।
            </p>
          </div>
        </div>
      </div>

      {/* Visual Train Carriage Formation (Scrollable Track) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs px-1">
          <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold">
            <ArrowLeft className="w-3.5 h-3.5" /> ট্রেনের সামনে (ইঞ্জিন ক্যাব)
          </span>
          <span className="flex items-center gap-1 text-red-600 dark:text-red-400 font-semibold">
            ট্রেনের পেছনে (লাস্ট বগি) <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>

        {/* Rail track background */}
        <div
          className={`relative py-4 px-2 rounded-xl border overflow-x-auto ${
            isLight ? 'bg-slate-100 border-slate-300' : 'bg-slate-950/90 border-slate-800/80'
          }`}
        >
          {/* Rail sleepers graphic */}
          <div
            className={`absolute inset-x-0 top-1/2 -translate-y-1/2 h-1 z-0 ${
              isLight ? 'bg-slate-300' : 'bg-slate-700'
            }`}
          />
          <div
            className={`absolute inset-x-0 top-1/2 -translate-y-1/2 h-2.5 border-t border-b border-dashed opacity-40 z-0 ${
              isLight ? 'border-slate-400' : 'border-slate-600'
            }`}
          />

          <div className="relative z-10 flex items-center gap-1.5 min-w-max pb-2">
            {displayedCoaches.map((coach, index) => {
              const isSelected = selectedCoach.id === coach.id;
              const isLocomotive = coach.coachClass === 'LOCOMOTIVE';
              const isFrontPassenger = index === 1;
              const isRearPassenger = index === displayedCoaches.length - 1;

              return (
                <button
                  key={`${coach.id}-${index}`}
                  id={`coach-btn-${coach.id}`}
                  onClick={() => setSelectedCoach(coach)}
                  className={`group relative flex flex-col items-center justify-between w-20 sm:w-24 h-24 p-2 rounded-xl border-2 transition-all cursor-pointer ${
                    getCoachColor(coach.coachClass)
                  } ${
                    isSelected
                      ? `ring-2 ring-emerald-500 scale-105 z-20 shadow-lg ${
                          isLight ? 'ring-offset-2 ring-offset-white' : 'ring-offset-2 ring-offset-slate-950'
                        }`
                      : 'hover:scale-102 opacity-90 hover:opacity-100'
                  }`}
                >
                  {/* Position Tag */}
                  <div className={`flex items-center justify-between w-full text-[10px] font-mono ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                    <span>#{toBengaliNumber(coach.positionFromFront)}</span>
                    {coach.hasToilet && (
                      <span
                        className={`text-[9px] px-1 rounded ${
                          isLight ? 'bg-white/80 text-slate-800 font-semibold' : 'bg-slate-800/80 text-slate-300'
                        }`}
                        title="টয়লেট সুবিধা"
                      >
                        WC
                      </span>
                    )}
                  </div>

                  {/* Coach Icon & Code */}
                  <div className="flex flex-col items-center my-0.5">
                    {getCoachIcon(coach.coachClass)}
                    <span
                      className={`text-sm font-bold tracking-tight mt-0.5 ${
                        isLight ? 'text-slate-900' : 'text-white'
                      }`}
                    >
                      {coach.code}
                    </span>
                  </div>

                  {/* Class label */}
                  <div className="w-full text-center">
                    <span className={`text-[10px] block truncate font-medium ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                      {coach.coachClass === 'LOCOMOTIVE'
                        ? 'ইঞ্জিন'
                        : coach.coachClass === 'SNIGDHA'
                        ? 'স্নিগ্ধা'
                        : coach.coachClass === 'AC_BERTH'
                        ? 'এসি কেবিন'
                        : coach.coachClass === 'PANTRY_CAR'
                        ? 'খাবার বগি'
                        : coach.coachClass === 'POWER_CAR'
                        ? 'পাওয়ার কার'
                        : coach.coachClass === 'GUARD_VAN'
                        ? 'গার্ড বগি'
                        : 'শোভন চেয়ার'}
                    </span>
                  </div>

                  {/* Wheels Graphic */}
                  <div className="absolute -bottom-1.5 flex gap-3">
                    <div
                      className={`w-2.5 h-2.5 rounded-full border ${
                        isLight ? 'bg-slate-500 border-slate-600' : 'bg-slate-600 border-slate-400'
                      }`}
                    />
                    <div
                      className={`w-2.5 h-2.5 rounded-full border ${
                        isLight ? 'bg-slate-500 border-slate-600' : 'bg-slate-600 border-slate-400'
                      }`}
                    />
                  </div>

                  {/* Front/Rear Marker */}
                  {isLocomotive && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[9px] px-1.5 py-0.2 rounded bg-amber-500 text-slate-950 font-bold whitespace-nowrap">
                      সামনে ইঞ্জিন
                    </span>
                  )}
                  {isFrontPassenger && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[9px] px-1.5 py-0.2 rounded bg-emerald-600 text-white font-bold whitespace-nowrap">
                      ১ম বগি
                    </span>
                  )}
                  {isRearPassenger && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[9px] px-1.5 py-0.2 rounded bg-red-500 text-white font-bold whitespace-nowrap">
                      লাস্ট বগি
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Coach Detail Information Card */}
      {selectedCoach && (
        <div
          className={`border rounded-xl p-4 transition-all ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/80 border-slate-800'
          }`}
        >
          <div
            className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3 ${
              isLight ? 'border-slate-200' : 'border-slate-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-3 rounded-xl border ${
                  isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-700'
                }`}
              >
                {getCoachIcon(selectedCoach.coachClass)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    {selectedCoach.nameBn}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-mono font-bold ${
                      isLight ? 'bg-slate-200 text-slate-800' : 'bg-slate-800 text-emerald-400'
                    }`}
                  >
                    কোড: {selectedCoach.code}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{selectedCoach.nameEn}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <div
                className={`px-3 py-1.5 rounded-lg border text-center ${
                  isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
                }`}
              >
                <span className="text-slate-400 block text-[10px]">অবস্থান</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  ইঞ্জিন থেকে #{toBengaliNumber(selectedCoach.positionFromFront)}
                </span>
              </div>
              {selectedCoach.seats > 0 && (
                <div
                  className={`px-3 py-1.5 rounded-lg border text-center ${
                    isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
                  }`}
                >
                  <span className="text-slate-400 block text-[10px]">মোট আসন</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {toBengaliNumber(selectedCoach.seats)} টি
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Features and Description */}
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="space-y-1">
              <span className="text-slate-400 block text-[11px] font-semibold">বগি বিবরণ</span>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                {selectedCoach.descriptionBn || 'বাংলাদেশ রেলওয়ে আধুনিক ব্রডগেজ/মিটারগেজ কোচ।'}
              </p>
            </div>

            <div className="flex items-center gap-4 sm:justify-end">
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${selectedCoach.hasToilet ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                <span className="text-slate-600 dark:text-slate-300">
                  {selectedCoach.hasToilet ? 'টয়লেট সুবিধা আছে' : 'টয়লেট নাই'}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Accessibility
                  className={`w-3.5 h-3.5 ${
                    selectedCoach.hasWheelchair ? 'text-emerald-500' : 'text-slate-400'
                  }`}
                />
                <span className="text-slate-600 dark:text-slate-300">
                  {selectedCoach.hasWheelchair ? 'হুইলচেয়ার এক্সেস' : 'সাধারণ বগি'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


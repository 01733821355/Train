import React, { useState } from 'react';
import { Coach, LiveTrainStatus } from '../types';
import { toBengaliNumber } from '../utils/geoUtils';
import { Train as TrainIcon, Utensils, Zap, Shield, Accessibility, Info, Compass, ArrowRight, ArrowLeft, Ticket, ExternalLink } from 'lucide-react';

interface BogieInspectorProps {
  status: LiveTrainStatus;
  onClose?: () => void;
  onOpenTicketBooking?: (trainId?: string) => void;
  theme?: 'light' | 'dark';
}

export const BogieInspector: React.FC<BogieInspectorProps> = ({ status, onOpenTicketBooking, theme = 'dark' }) => {
  const { train, speedKmH } = status;
  const [selectedCoach, setSelectedCoach] = useState<Coach>(train.coaches[0]);

  const isLight = theme === 'light';

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
          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                isLight
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}
            >
              বগি বিন্যাস নির্দেশিকা (Bogie Order)
            </span>
            <span className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              মোট {toBengaliNumber(train.coaches.length)} টি কোচ
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

          {/* Train Orientation Indicator */}
          <div
            className={`flex items-center gap-3 px-3.5 py-2 rounded-xl border ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/80 border-slate-800'
            }`}
          >
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
                <Compass className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
                গতিশীল অভিমুখ
              </div>
              <span className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                সামনের ইঞ্জিন ➔ পেছনের গার্ড
              </span>
            </div>
            <div
              className={`p-1.5 rounded-lg border ${
                isLight
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              }`}
            >
              <ArrowRight className="w-4 h-4" />
            </div>
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
            ট্রেনের পেছনে (গার্ড ভ্যান) <ArrowRight className="w-3.5 h-3.5" />
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
            {train.coaches.map((coach, index) => {
              const isSelected = selectedCoach.id === coach.id;
              const isFront = index === 0;
              const isRear = index === train.coaches.length - 1;

              return (
                <button
                  key={coach.id}
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
                  {isFront && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[9px] px-1.5 py-0.2 rounded bg-amber-500 text-slate-950 font-bold">
                      সামনে
                    </span>
                  )}
                  {isRear && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[9px] px-1.5 py-0.2 rounded bg-red-500 text-white font-bold">
                      পেছনে
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
                className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg border ${
                  isLight
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                    : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                }`}
              >
                {selectedCoach.code}
              </div>
              <div>
                <h4 className={`text-base font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {selectedCoach.nameBn}
                  <span
                    className={`text-xs px-2 py-0.5 rounded font-normal ${
                      isLight ? 'bg-slate-200 text-slate-700' : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {selectedCoach.nameEn}
                  </span>
                </h4>
                <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  অবস্থান: সামনে থেকে {toBengaliNumber(selectedCoach.positionFromFront)} নম্বর বগি •{' '}
                  {selectedCoach.positionFromFront === 1
                    ? 'ট্রেনের মূল চালক ও সহকারী চালকের ক্যাব'
                    : selectedCoach.positionFromFront === train.coaches.length
                    ? 'ট্রেনের শেষ প্রান্তে অবস্থিত গার্ড ভ্যান'
                    : 'যাত্রীবাহী কামরা'}
                </p>
              </div>
            </div>

            {/* Coach Class Badge */}
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${getCoachColor(selectedCoach.coachClass)}`}>
                {selectedCoach.coachClass === 'LOCOMOTIVE' ? 'লোকোমোটিভ ইঞ্জিন' : selectedCoach.coachClass}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
            <div className={`p-3 rounded-lg border ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-slate-800'}`}>
              <span className={`text-xs block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>আসন সংখ্যা</span>
              <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                {selectedCoach.seats > 0 ? `${toBengaliNumber(selectedCoach.seats)} টি সিট` : 'প্রযোজ্য নয়'}
              </span>
            </div>

            <div className={`p-3 rounded-lg border ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-slate-800'}`}>
              <span className={`text-xs block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>টয়লেট / ওয়াশরুম</span>
              <span className={`text-sm font-semibold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                {selectedCoach.hasToilet ? 'উপলব্ধ (বায়ো-টয়লেট)' : 'নাই'}
              </span>
            </div>

            <div className={`p-3 rounded-lg border ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-slate-800'}`}>
              <span className={`text-xs block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>হুইলচেয়ার সুবিধা</span>
              <span className={`text-sm font-semibold flex items-center gap-1 ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                {selectedCoach.hasWheelchair ? (
                  <>
                    <Accessibility className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> সহজে প্রবেশযোগ্য
                  </>
                ) : (
                  'স্বাভাবিক'
                )}
              </span>
            </div>

            <div className={`p-3 rounded-lg border ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-slate-800'}`}>
              <span className={`text-xs block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>লাইভ ট্র্যাকিং স্পিড</span>
              <span className="text-sm font-semibold text-cyan-600 dark:text-cyan-400">
                {toBengaliNumber(speedKmH)} কিমি/ঘণ্টা
              </span>
            </div>
          </div>

          <div
            className={`mt-3 flex items-start gap-2 text-xs p-2.5 rounded-lg border ${
              isLight
                ? 'bg-emerald-50/60 border-emerald-200 text-slate-700'
                : 'bg-slate-900/50 border-slate-800/80 text-slate-400'
            }`}
          >
            <Info className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <span>{selectedCoach.descriptionBn}</span>
          </div>
        </div>
      )}
    </div>
  );
};

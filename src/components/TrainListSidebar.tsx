import React, { useState } from 'react';
import { LiveTrainStatus, TrainZone } from '../types';
import { toBengaliNumber } from '../utils/geoUtils';
import { Search, Train as TrainIcon, Navigation, Clock, Activity, ArrowRight, AlertTriangle, CheckCircle2, TrendingUp, Ticket } from 'lucide-react';

interface TrainListSidebarProps {
  statuses: LiveTrainStatus[];
  selectedTrainId: string | null;
  onSelectTrain: (trainId: string) => void;
  onOpenTicketBooking?: (trainId?: string) => void;
  theme?: 'light' | 'dark';
}

export const TrainListSidebar: React.FC<TrainListSidebarProps> = ({
  statuses,
  selectedTrainId,
  onSelectTrain,
  onOpenTicketBooking,
  theme = 'dark',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [onlyActive, setOnlyActive] = useState(false);
  const [onlyDelayed, setOnlyDelayed] = useState(false);

  const isLight = theme === 'light';

  const filteredStatuses = statuses.filter((st) => {
    const { train, isActive, predictiveDelay } = st;
    if (onlyActive && !isActive) return false;
    if (onlyDelayed && (!predictiveDelay || !predictiveDelay.isLate)) return false;
    if (selectedZone !== 'all' && train.zone !== selectedZone) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchBn = train.nameBn.toLowerCase().includes(q);
      const matchEn = train.nameEn.toLowerCase().includes(q);
      const matchNum = train.number.includes(q);
      const matchStops = train.stops.some(
        (s) => s.stationNameBn.toLowerCase().includes(q) || s.stationNameEn.toLowerCase().includes(q)
      );
      if (!matchBn && !matchEn && !matchNum && !matchStops) return false;
    }

    return true;
  });

  const activeCount = statuses.filter((s) => s.isActive).length;
  const lateCount = statuses.filter((s) => s.isActive && s.predictiveDelay?.isLate).length;

  return (
    <div
      className={`flex flex-col h-full transition-colors border-r ${
        isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-slate-100'
      }`}
    >
      {/* Header & Search */}
      <div className={`p-3 sm:p-4 border-b space-y-2.5 ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                isLight ? 'bg-emerald-100 text-emerald-700' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
              }`}
            >
              <TrainIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                বাংলাদেশ রেলওয়ে ট্রেন তালিকা
              </h2>
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <span>
                  চলমান: <strong className="text-emerald-600 dark:text-emerald-400">{toBengaliNumber(activeCount)}</strong>
                </span>
                <span>•</span>
                <span>
                  বিলম্ব পূর্বাভাস: <strong className="text-amber-600 dark:text-amber-400">{toBengaliNumber(lateCount)}</strong>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              id="only-active-toggle-btn"
              onClick={() => {
                setOnlyActive(!onlyActive);
                if (onlyActive) setOnlyDelayed(false);
              }}
              className={`px-2 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                onlyActive
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                  : isLight
                  ? 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
              title="শুধু বর্তমানে রেললাইনে চলমান ট্রেন দেখুন"
            >
              {onlyActive ? '✓ সচল' : 'সচল'}
            </button>

            <button
              id="only-delayed-toggle-btn"
              onClick={() => {
                setOnlyDelayed(!onlyDelayed);
                if (!onlyDelayed) setOnlyActive(true);
              }}
              className={`px-2 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1 ${
                onlyDelayed
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm'
                  : isLight
                  ? 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
              title="ঐতিহাসিক ট্রাফিক অনুযায়ী দেরির পূর্বাভাসযুক্ত ট্রেন"
            >
              <AlertTriangle className="w-3 h-3" />
              <span>{onlyDelayed ? '✓ লেট' : 'লেট'}</span>
            </button>
          </div>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="train-search-input"
            type="text"
            placeholder="ট্রেন বা স্টেশন নাম খুঁজুন (যেমন: 813, বনলতা)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-9 pr-3 py-1.5 sm:py-2 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
              isLight
                ? 'bg-slate-100 border border-slate-300 text-slate-900 placeholder-slate-400 focus:border-emerald-500'
                : 'bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:border-emerald-500'
            }`}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

        {/* Zone Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          {[
            { id: 'all', label: 'সকল রুট' },
            { id: 'east', label: 'পূর্বাঞ্চল' },
            { id: 'west', label: 'পশ্চিমাঞ্চল' },
            { id: 'padma', label: 'পদ্মা লিংক' },
          ].map((zone) => (
            <button
              key={zone.id}
              id={`filter-zone-${zone.id}`}
              onClick={() => setSelectedZone(zone.id)}
              className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition-colors cursor-pointer text-[11px] ${
                selectedZone === zone.id
                  ? isLight
                    ? 'bg-slate-900 text-white font-bold'
                    : 'bg-slate-100 text-slate-950 font-bold'
                  : isLight
                  ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {zone.label}
            </button>
          ))}
        </div>
      </div>

      {/* Train Cards List */}
      <div className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-2">
        {filteredStatuses.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs">
            কোনো ট্রেন পাওয়া যায়নি
          </div>
        ) : (
          filteredStatuses.map((st) => {
            const { train, isActive, speedKmH, statusBn, progressPercent, predictiveDelay } = st;
            const isSelected = selectedTrainId === train.id;

            // Predictive delay badge styling
            const isLate = predictiveDelay?.isLate;
            const delayMins = predictiveDelay?.predictedDelayMinutes || 0;

            let delayBadgeBg = isLight
              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
            let delayBadgeText = 'অন-টাইম';

            if (predictiveDelay?.severity === 'MAJOR_DELAY') {
              delayBadgeBg = isLight
                ? 'bg-rose-50 text-rose-700 border-rose-300'
                : 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-sm';
              delayBadgeText = `সম্ভাব্য বিলম্ব +${toBengaliNumber(delayMins)} মি.`;
            } else if (predictiveDelay?.severity === 'MODERATE_DELAY') {
              delayBadgeBg = isLight
                ? 'bg-amber-50 text-amber-700 border-amber-300'
                : 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm';
              delayBadgeText = `সম্ভাব্য বিলম্ব +${toBengaliNumber(delayMins)} মি.`;
            } else if (predictiveDelay?.severity === 'MINOR_DELAY') {
              delayBadgeBg = isLight
                ? 'bg-yellow-50 text-yellow-700 border-yellow-300'
                : 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30';
              delayBadgeText = `দেরি +${toBengaliNumber(delayMins)} মি.`;
            }

            return (
              <div
                key={train.id}
                id={`train-item-${train.id}`}
                onClick={() => onSelectTrain(train.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer text-left ${
                  isSelected
                    ? isLight
                      ? 'bg-emerald-50/70 border-emerald-500 shadow-sm ring-1 ring-emerald-500/30'
                      : 'bg-slate-800 border-emerald-500/80 shadow-md ring-1 ring-emerald-500/40'
                    : isLight
                    ? 'bg-slate-50/80 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                    : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/60 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold shrink-0 ${
                          isLight ? 'bg-slate-200 text-slate-800' : 'bg-slate-800 text-emerald-400'
                        }`}
                      >
                        {train.number}
                      </span>
                      <h3 className={`text-xs font-bold truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        {train.nameBn}
                      </h3>

                      {/* Predictive Delay Badge */}
                      {isActive && (
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md border shrink-0 ${delayBadgeBg}`}
                          title={`ঐতিহাসিক স্টেশন ট্রাফিক ডেটা অনুযায়ী পূর্বাভাস: ${predictiveDelay?.primaryFactorBn || ''}`}
                        >
                          {isLate ? (
                            <AlertTriangle className="w-2.5 h-2.5 shrink-0" />
                          ) : (
                            <CheckCircle2 className="w-2.5 h-2.5 shrink-0" />
                          )}
                          <span>{delayBadgeText}</span>
                        </span>
                      )}
                    </div>
                    <p className={`text-[11px] flex items-center gap-1 mt-1 truncate ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      <span className="truncate">{train.stops[0].stationNameBn}</span>
                      <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{train.stops[train.stops.length - 1].stationNameBn}</span>
                    </p>
                  </div>

                  {/* Status Pill */}
                  <span
                    className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive
                        ? isLight
                          ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : isLight
                        ? 'bg-slate-200 text-slate-600'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {isActive ? `${toBengaliNumber(speedKmH)} কিমি/ঘ` : 'অফলাইন'}
                  </span>
                </div>

                {/* Delay reason indicator when late */}
                {isActive && isLate && predictiveDelay && (
                  <div
                    className={`mt-2 rounded-lg p-1.5 text-[10px] flex items-start gap-1.5 border ${
                      isLight
                        ? 'bg-amber-50 border-amber-200 text-amber-800'
                        : 'bg-amber-500/10 border-amber-500/20 text-amber-300'
                    }`}
                  >
                    <TrendingUp className="w-3 h-3 shrink-0 mt-0.5 text-amber-500" />
                    <span className="line-clamp-1">
                      {predictiveDelay.primaryFactorBn} (পূর্বাভাস +{toBengaliNumber(predictiveDelay.predictedDelayMinutes)} মি.)
                    </span>
                  </div>
                )}

                {/* Progress bar if active */}
                {isActive && (
                  <div className="mt-2 space-y-1">
                    <div className={`w-full h-1.5 rounded-full overflow-hidden ${isLight ? 'bg-slate-200' : 'bg-slate-800'}`}>
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isLate ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <div className={`flex items-center justify-between text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      <span className={`truncate max-w-[170px] ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                        {statusBn}
                      </span>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {toBengaliNumber(progressPercent)}%
                      </span>
                    </div>
                  </div>
                )}

                {/* Timetable row & Ticket action */}
                <div
                  className={`mt-2 pt-2 border-t flex items-center justify-between text-[10px] ${
                    isLight ? 'border-slate-200 text-slate-500' : 'border-slate-800/60 text-slate-400'
                  }`}
                >
                  <span className="flex items-center gap-1 truncate">
                    <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                    ছাড়বে: {train.departureTime} • পৌঁছাবে: {train.arrivalTime}
                  </span>

                  <div className="flex items-center gap-2 shrink-0 ml-1">
                    <span className="text-slate-400 hidden sm:inline">ছুটি: {train.offDayBn}</span>
                    {onOpenTicketBooking && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenTicketBooking(train.id);
                        }}
                        className="px-2 py-0.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                        title="এই ট্রেনের ই-টিকেট কাটুন"
                      >
                        <Ticket className="w-2.5 h-2.5" />
                        <span>টিকেট</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

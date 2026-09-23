import React, { useState } from 'react';
import { LiveTrainStatus, ScheduleStop, Station } from '../types';
import { STATION_MAP } from '../data/stations';
import { calculateDistanceKm, toBengaliNumber } from '../utils/geoUtils';
import { Clock, MapPin, ChevronDown, ChevronUp, Navigation, AlertCircle, CheckCircle2 } from 'lucide-react';

interface UpcomingStopsTimelineProps {
  status: LiveTrainStatus;
  theme: 'light' | 'dark';
  onSelectStation?: (station: Station) => void;
  onClose?: () => void;
}

export const UpcomingStopsTimeline: React.FC<UpcomingStopsTimelineProps> = ({
  status,
  theme,
  onSelectStation,
  onClose,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isLight = theme === 'light';
  const { train, currentLat, currentLng, delayMinutes, isActive } = status;

  // Determine current stop index
  const stops = train.stops;
  const nextStationId = status.nextStation?.id;
  const nextStopIndex = stops.findIndex((s) => s.stationId === nextStationId);
  const effectiveIndex = nextStopIndex >= 0 ? nextStopIndex : 0;

  // List of upcoming stops
  const upcomingStops = stops.slice(effectiveIndex);
  const passedStopsCount = effectiveIndex;

  return (
    <div
      className={`rounded-2xl border shadow-2xl backdrop-blur-xl transition-all duration-300 overflow-hidden font-sans pointer-events-auto ${
        isLight
          ? 'bg-white/95 border-slate-300 text-slate-900 shadow-slate-400/30'
          : 'bg-slate-900/95 border-slate-800 text-slate-100 shadow-black/60'
      }`}
    >
      {/* Header */}
      <div
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={`px-3.5 py-2.5 flex items-center justify-between border-b cursor-pointer select-none ${
          isLight ? 'bg-slate-50/90 border-slate-200' : 'bg-slate-800/80 border-slate-800'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <div className="truncate">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black tracking-wide truncate">
                {train.nameBn}
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                {train.number}
              </span>
            </div>
            <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 truncate">
              পরবর্তী স্টপেজ ও শিডিউল টাইমলাইন ({toBengaliNumber(upcomingStops.length)}টি আসন্ন)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0 ml-2">
          {delayMinutes > 0 && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400">
              +{toBengaliNumber(delayMinutes)} মি. ডিলে
            </span>
          )}
          <button
            type="button"
            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Content */}
      {!isCollapsed && (
        <div className="p-3 max-h-60 overflow-y-auto space-y-2 text-xs">
          {passedStopsCount > 0 && (
            <div className="flex items-center justify-between text-[11px] text-slate-400 px-2 py-1 bg-slate-500/10 rounded-lg">
              <span>পূর্বে অতিক্রান্ত স্টপেজ:</span>
              <span className="font-bold">{toBengaliNumber(passedStopsCount)}টি স্টেশন পার হয়েছে</span>
            </div>
          )}

          {upcomingStops.length === 0 ? (
            <div className="text-center py-4 text-slate-500 text-xs">
              ট্রেনটি ইতিমধ্যে তার চূড়ান্ত গন্তব্যে পৌঁছে গেছে।
            </div>
          ) : (
            <div className="relative pl-5 border-l-2 border-dashed border-emerald-500/40 ml-2 space-y-3 py-1">
              {upcomingStops.map((stop, idx) => {
                const isNextImmediate = idx === 0;
                const station = STATION_MAP[stop.stationId];
                let distFromCurrentKm = 0;
                if (station) {
                  distFromCurrentKm = Math.round(
                    calculateDistanceKm(currentLat, currentLng, station.lat, station.lng)
                  );
                }

                return (
                  <div
                    key={`${stop.stationId}-${idx}`}
                    className={`relative group rounded-xl p-2 transition-all cursor-pointer border ${
                      isNextImmediate
                        ? isLight
                          ? 'bg-emerald-50/80 border-emerald-300 ring-1 ring-emerald-400'
                          : 'bg-emerald-950/40 border-emerald-600 ring-1 ring-emerald-500'
                        : isLight
                        ? 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                        : 'bg-slate-800/40 hover:bg-slate-800 border-slate-700/60'
                    }`}
                    onClick={() => {
                      if (station && onSelectStation) {
                        onSelectStation(station);
                      }
                    }}
                  >
                    {/* Node Dot */}
                    <span
                      className={`absolute -left-[27px] top-3 w-3.5 h-3.5 rounded-full border-2 transition-all ${
                        isNextImmediate
                          ? 'bg-emerald-500 border-white ring-4 ring-emerald-500/30'
                          : 'bg-slate-400 dark:bg-slate-600 border-white dark:border-slate-900'
                      }`}
                    />

                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span
                          className={`font-black text-xs truncate ${
                            isNextImmediate
                              ? 'text-emerald-700 dark:text-emerald-300'
                              : 'text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          {stop.stationNameBn}
                        </span>
                        {isNextImmediate && (
                          <span className="shrink-0 text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-emerald-600 text-white animate-pulse">
                            পরবর্তী বিরতি
                          </span>
                        )}
                        {idx === upcomingStops.length - 1 && (
                          <span className="shrink-0 text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-600 dark:text-blue-400">
                            চূড়ান্ত গন্তব্য
                          </span>
                        )}
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                          {stop.arrivalTime}
                        </span>
                        <span className="text-[10px] text-slate-500 ml-1">আগমন</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-1 pt-1 border-t border-slate-200/50 dark:border-slate-700/50">
                      <div className="flex items-center gap-2">
                        {stop.platform && (
                          <span>প্ল্যাটফর্ম: <strong>{toBengaliNumber(stop.platform)}</strong></span>
                        )}
                        <span>ছেড়ে যাবে: <strong>{stop.departureTime}</strong></span>
                      </div>
                      <div className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                        <Navigation className="w-3 h-3 rotate-45" />
                        <span>{toBengaliNumber(distFromCurrentKm)} কিমি বাকি</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { Station, LiveTrainStatus } from '../types';
import { calculateDistanceKm, toBengaliNumber } from '../utils/geoUtils';
import { MapPin, Navigation, Compass, RefreshCw, ChevronDown, ChevronUp, Train, CheckCircle2, X } from 'lucide-react';

interface UserProximityCardProps {
  userCoords: { lat: number; lng: number } | null;
  nearestStation: Station | null;
  stationDistanceKm: number;
  selectedStatus: LiveTrainStatus | null;
  isLocating: boolean;
  onRefreshLocation: () => void;
  onClose?: () => void;
  onSelectStation?: (station: Station) => void;
  theme: 'light' | 'dark';
}

export const UserProximityCard: React.FC<UserProximityCardProps> = ({
  userCoords,
  nearestStation,
  stationDistanceKm,
  selectedStatus,
  isLocating,
  onRefreshLocation,
  onClose,
  onSelectStation,
  theme,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isLight = theme === 'light';

  // Distance from user to selected train
  const userToTrainKm = userCoords && selectedStatus
    ? Math.round(
        calculateDistanceKm(
          userCoords.lat,
          userCoords.lng,
          selectedStatus.currentLat,
          selectedStatus.currentLng
        )
      )
    : null;

  // Distance from nearest station to selected train
  const stationToTrainKm = nearestStation && selectedStatus
    ? Math.round(
        calculateDistanceKm(
          nearestStation.lat,
          nearestStation.lng,
          selectedStatus.currentLat,
          selectedStatus.currentLng
        )
      )
    : null;

  return (
    <div
      className={`rounded-2xl border shadow-xl backdrop-blur-xl transition-all duration-300 overflow-hidden font-sans pointer-events-auto ${
        isLight
          ? 'bg-white/95 border-blue-200 text-slate-900 shadow-blue-500/10'
          : 'bg-slate-900/95 border-blue-900/50 text-slate-100 shadow-black/50'
      }`}
    >
      {/* Header */}
      <div
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={`px-3.5 py-2.5 flex items-center justify-between border-b cursor-pointer select-none ${
          isLight ? 'bg-blue-50/80 border-blue-100' : 'bg-blue-950/40 border-blue-900/40'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="relative">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 block animate-ping absolute" />
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 block relative" />
          </div>
          <div className="truncate">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-blue-700 dark:text-blue-300">
                আপনার নিকটবর্তী স্টেশন ও দূরত্ব
              </span>
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-700 dark:text-blue-300">
                লাইভ ট্র্যাকার
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
              {nearestStation ? `${nearestStation.nameBn} • ${toBengaliNumber(stationDistanceKm)} কিমি দূরত্বে` : 'অবস্থান শনাক্ত করা হচ্ছে...'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0 ml-2" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={onRefreshLocation}
            title="অবস্থান আপডেট করুন"
            disabled={isLocating}
            className={`p-1.5 rounded-lg transition-all ${
              isLight
                ? 'hover:bg-blue-100 text-blue-600'
                : 'hover:bg-blue-900/60 text-blue-400'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
            title={isCollapsed ? 'প্রসারিত করুন' : 'সংক্ষেপ করুন'}
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              title="লোকেশন ট্র্যাকার বন্ধ করুন"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      {!isCollapsed && (
        <div className="p-3 space-y-2.5 text-xs">
          {nearestStation ? (
            <>
              {/* Nearest Station Card */}
              <div
                onClick={() => onSelectStation && onSelectStation(nearestStation)}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                  isLight
                    ? 'bg-blue-50/50 hover:bg-blue-50 border-blue-200'
                    : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase">সবচেয়ে কাছের স্টেশন</p>
                      <h4 className="font-black text-sm text-slate-900 dark:text-white">
                        {nearestStation.nameBn}
                      </h4>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black text-blue-600 dark:text-blue-400">
                      {toBengaliNumber(stationDistanceKm)}
                    </span>
                    <span className="text-[10px] text-slate-500 ml-1">কিমি দূরে</span>
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span>বিভাগ: <strong>{nearestStation.division}</strong> ({nearestStation.district})</span>
                  <span>অঞ্চল: <strong>{nearestStation.zone === 'west' ? 'পশ্চিমাঞ্চল' : nearestStation.zone === 'padma' ? 'পদ্মা সেতু লিংক' : 'পূর্বাঞ্চল'}</strong></span>
                </div>
              </div>

              {/* Selected Train Proximity */}
              {selectedStatus && (
                <div
                  className={`p-2.5 rounded-xl border ${
                    isLight
                      ? 'bg-emerald-50/50 border-emerald-200 text-slate-800'
                      : 'bg-emerald-950/30 border-emerald-900/60 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <Train className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                      {selectedStatus.train.nameBn} ({selectedStatus.train.number})
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2 rounded-lg bg-white/70 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/60">
                      <p className="text-[10px] text-slate-500">আপনার অবস্থান থেকে</p>
                      <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                        {userToTrainKm !== null ? `${toBengaliNumber(userToTrainKm)} কিমি` : 'হিসাবাধীন'}
                      </p>
                    </div>

                    <div className="p-2 rounded-lg bg-white/70 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/60">
                      <p className="text-[10px] text-slate-500">নিকটবর্তী স্টেশন থেকে</p>
                      <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                        {stationToTrainKm !== null ? `${toBengaliNumber(stationToTrainKm)} কিমি` : 'হিসাবাধীন'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-4 space-y-2">
              <Compass className="w-8 h-8 mx-auto text-blue-500 animate-spin" />
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                ব্যবহারকারীর লোকেশন ও নিকটবর্তী স্টেশন নির্ণয় করা হচ্ছে...
              </p>
              <button
                type="button"
                onClick={onRefreshLocation}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-all"
              >
                অনুমতি দিন ও খুঁজুন
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

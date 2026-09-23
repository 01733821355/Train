import React from 'react';
import { Station, LiveTrainStatus } from '../types';
import { BANGLADESH_TRAINS } from '../data/trains';
import { toBengaliNumber } from '../utils/geoUtils';
import { Building2, X, Clock, Train as TrainIcon, ArrowRight, ShieldCheck } from 'lucide-react';

interface StationDeparturesModalProps {
  station: Station | null;
  onClose: () => void;
  onSelectTrain: (trainId: string) => void;
  trainStatuses: LiveTrainStatus[];
  theme?: 'light' | 'dark';
}

export const StationDeparturesModal: React.FC<StationDeparturesModalProps> = ({
  station,
  onClose,
  onSelectTrain,
  trainStatuses,
  theme = 'dark',
}) => {
  if (!station) return null;

  const isLight = theme === 'light';

  // Find all trains that stop at this station
  const trainsAtStation = BANGLADESH_TRAINS.map((train) => {
    const stop = train.stops.find((s) => s.stationId === station.id);
    if (!stop) return null;
    const liveStatus = trainStatuses.find((s) => s.train.id === train.id);
    return {
      train,
      stop,
      liveStatus,
    };
  }).filter(Boolean);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`border rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden transition-colors ${
          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-700/80 text-slate-100'
        }`}
      >
        {/* Header */}
        <div
          className={`p-4 md:p-6 border-b flex items-center justify-between ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/50 border-slate-800'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center border ${
                isLight
                  ? 'bg-amber-100 border-amber-300 text-amber-700'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
              }`}
            >
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className={`text-lg font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{station.nameBn}</h3>
                {station.isJunction && (
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      isLight
                        ? 'bg-amber-100 text-amber-800 border-amber-300'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    রেলওয়ে জংশন
                  </span>
                )}
              </div>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                {station.nameEn} • জেলা: {station.district} • বিভাগ: {station.division} • প্ল্যাটফর্ম:{' '}
                {toBengaliNumber(station.platforms)} টি
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              isLight ? 'bg-slate-200 text-slate-600 hover:bg-slate-300' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Train Schedule Table */}
        <div className="p-4 md:p-6 overflow-y-auto flex-1 space-y-3">
          <div
            className={`flex items-center justify-between text-xs border-b pb-2 ${
              isLight ? 'border-slate-200 text-slate-500' : 'border-slate-800 text-slate-400'
            }`}
          >
            <span>এই স্টেশনের ট্রেন সময়সূচি ও রিয়েল-টাইম আগমন</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
              মোট {toBengaliNumber(trainsAtStation.length)} টি নির্ধারিত ট্রেন
            </span>
          </div>

          {trainsAtStation.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              এই স্টেশনে কোনো আন্তঃনগর ট্রেন তালিকাভুক্ত নেই
            </div>
          ) : (
            <div className="space-y-2">
              {trainsAtStation.map((item) => {
                if (!item) return null;
                const { train, stop, liveStatus } = item;
                const isActive = liveStatus?.isActive;

                return (
                  <div
                    key={train.id}
                    onClick={() => {
                      onSelectTrain(train.id);
                      onClose();
                    }}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isLight
                        ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 hover:border-emerald-500'
                        : 'bg-slate-950/60 hover:bg-slate-800/70 border-slate-800 hover:border-emerald-500/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${
                          isLight ? 'bg-slate-200 text-slate-800' : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {train.number}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{train.nameBn}</h4>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              isActive
                                ? isLight
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-emerald-500/20 text-emerald-400'
                                : isLight
                                ? 'bg-slate-200 text-slate-600'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {isActive ? 'চলমান' : 'অফলাইন'}
                          </span>
                        </div>
                        <p className={`text-xs flex items-center gap-1 mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                          <span>{train.stops[0].stationNameBn}</span>
                          <ArrowRight className="w-3 h-3 text-slate-400" />
                          <span>{train.stops[train.stops.length - 1].stationNameBn}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs">
                      <div className="text-right">
                        <div className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                          <Clock className="w-3 h-3" />
                          <span>আগমন: {stop.arrivalTime}</span>
                        </div>
                        <div className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                          প্রস্থান: {stop.departureTime} • প্ল্যাটফর্ম: {toBengaliNumber(stop.platform ?? 1)}
                        </div>
                      </div>

                      <button
                        className={`p-1.5 rounded-lg text-xs font-semibold ${
                          isLight
                            ? 'bg-slate-200 text-slate-700 hover:bg-emerald-600 hover:text-white'
                            : 'bg-slate-800 text-slate-300 hover:bg-emerald-600 hover:text-white'
                        } transition-colors`}
                      >
                        ট্র্যাক
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

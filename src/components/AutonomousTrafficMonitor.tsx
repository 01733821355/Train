import React from 'react';
import { LiveTrainStatus } from '../types';
import { toBengaliNumber } from '../utils/geoUtils';
import { Radio, CheckCircle2, Zap, Train as TrainIcon, Ticket, Compass } from 'lucide-react';

interface AutonomousTrafficMonitorProps {
  currentBSTFormatted: string;
  activeTrainsCount: number;
  totalTrainsCount: number;
  selectedStatus: LiveTrainStatus | null;
  autoRadarEnabled: boolean;
  onToggleAutoRadar: () => void;
  onJumpToNextActiveTrain: () => void;
  onOpenTicketBooking?: () => void;
  theme?: 'light' | 'dark';
}

export const AutonomousTrafficMonitor: React.FC<AutonomousTrafficMonitorProps> = ({
  currentBSTFormatted,
  activeTrainsCount,
  totalTrainsCount,
  selectedStatus,
  autoRadarEnabled,
  onToggleAutoRadar,
  onJumpToNextActiveTrain,
  onOpenTicketBooking,
  theme = 'dark',
}) => {
  const isLight = theme === 'light';

  return (
    <div
      className={`border backdrop-blur-md rounded-2xl p-2.5 sm:p-3.5 shadow-md space-y-2.5 transition-colors ${
        isLight ? 'bg-white/95 border-slate-200 text-slate-900' : 'bg-slate-900/95 border-slate-800/90 text-slate-100'
      }`}
    >
      {/* Top Banner: Real-time Live Train Monitor */}
      <div
        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-2 ${
          isLight ? 'border-slate-200' : 'border-slate-800'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center shrink-0">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping absolute" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 relative" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3
                className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                <Radio className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                বাংলাদেশ রেলওয়ে লাইভ ট্রেন মনিটর
              </h3>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                  isLight
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}
              >
                লাইভ ট্র্যাকিং সক্রিয়
              </span>
            </div>
            <p className={`text-[11px] mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              বাংলাদেশ রেলওয়ের সকল আন্তঃনগর ট্রেনের লাইভ অবস্থান, গতি ও সময়সূচি
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {onOpenTicketBooking && (
            <button
              onClick={onOpenTicketBooking}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Ticket className="w-3.5 h-3.5" />
              <span>ই-টিকেট পোর্টাল</span>
            </button>
          )}

          <button
            id="toggle-auto-radar-btn"
            onClick={onToggleAutoRadar}
            className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              autoRadarEnabled
                ? 'bg-emerald-600 text-white shadow-md border border-emerald-500'
                : isLight
                ? 'bg-slate-100 text-slate-700 border border-slate-300 hover:bg-slate-200'
                : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white'
            }`}
          >
            <Zap className={`w-3.5 h-3.5 ${autoRadarEnabled ? 'text-amber-300 fill-amber-300' : ''}`} />
            <span>{autoRadarEnabled ? 'অটো-ফোকাস চালু' : 'অটো-ফোকাস বিরতি'}</span>
          </button>

          <button
            id="jump-active-train-btn"
            onClick={onJumpToNextActiveTrain}
            className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors flex items-center gap-1.5 cursor-pointer ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
          >
            <TrainIcon className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span>পরবর্তী ট্রেন</span>
          </button>
        </div>
      </div>

      {/* Real-time Telemetry Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        <div
          className={`p-2 rounded-xl border ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/70 border-slate-800/80'
          }`}
        >
          <span className={`text-[10px] block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>বাংলাদেশ সময় (BST)</span>
          <span className="text-xs sm:text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400">
            {currentBSTFormatted}
          </span>
        </div>

        <div
          className={`p-2 rounded-xl border ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/70 border-slate-800/80'
          }`}
        >
          <span className={`text-[10px] block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>লাইভ চলাচলরত ট্রেন</span>
          <span className={`text-xs sm:text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
            {toBengaliNumber(activeTrainsCount)} / {toBengaliNumber(totalTrainsCount)} টি
          </span>
        </div>

        <div
          className={`p-2 rounded-xl border ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/70 border-slate-800/80'
          }`}
        >
          <span className={`text-[10px] block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>ট্র্যাক কন্ডিশন</span>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5 truncate">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" /> স্বাভাবিক রেললাইন
          </span>
        </div>

        <div
          className={`p-2 rounded-xl border ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/70 border-slate-800/80'
          }`}
        >
          <span className={`text-[10px] block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>নির্বাচিত ট্রেন</span>
          <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400 truncate block mt-0.5">
            {selectedStatus ? `${selectedStatus.train.nameBn} (${selectedStatus.train.number})` : 'সব ট্রেন স্ক্যান হচ্ছে...'}
          </span>
        </div>
      </div>
    </div>
  );
};

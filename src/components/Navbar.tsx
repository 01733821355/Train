import React from 'react';
import { Train as TrainIcon, Clock, Radio, RotateCcw, Play, Pause, Sun, Moon, Ticket, ExternalLink } from 'lucide-react';
import { toBengaliNumber } from '../utils/geoUtils';

interface NavbarProps {
  currentBSTFormatted: string;
  isRealTime: boolean;
  onResetToRealTime: () => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  timeMinutes: number;
  onChangeTime: (newMinutes: number) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onOpenTicketBooking?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentBSTFormatted,
  isRealTime,
  onResetToRealTime,
  isPlaying,
  onTogglePlay,
  timeMinutes,
  onChangeTime,
  theme,
  onToggleTheme,
  onOpenTicketBooking,
}) => {
  const isLight = theme === 'light';

  return (
    <header
      className={`border-b px-3 sm:px-4 py-2 sm:py-2.5 sticky top-0 z-40 backdrop-blur-md transition-colors ${
        isLight ? 'bg-white/95 border-slate-200 text-slate-800' : 'bg-slate-900/95 border-slate-800 text-slate-100'
      }`}
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2 sm:gap-3">
        {/* Brand */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-600/30 shrink-0">
              <TrainIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1
                  className={`text-sm sm:text-base md:text-lg font-bold tracking-tight ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  বাংলাদেশ রেলওয়ে লাইভ ট্র্যাকার
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  LIVE
                </span>
              </div>
              <p className={`text-[10px] sm:text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                বাংলাদেশ রেলওয়ের সকল আন্তঃনগর ট্রেন ট্র্যাকিং ও অনলাইন ই-টিকেট
              </p>
            </div>
          </div>

          {/* Theme Toggle, Ticket & Mobile Clock */}
          <div className="flex items-center gap-1.5 md:hidden">
            {onOpenTicketBooking && (
              <button
                onClick={onOpenTicketBooking}
                className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shadow-sm cursor-pointer"
                title="ই-টিকেট পোর্টাল"
              >
                <Ticket className="w-3.5 h-3.5" />
                <span>টিকেট</span>
              </button>
            )}

            <button
              onClick={onToggleTheme}
              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                isLight
                  ? 'bg-slate-100 border-slate-300 text-amber-600'
                  : 'bg-slate-950 border-slate-800 text-cyan-400'
              }`}
              title={isLight ? 'ডার্ক মোড করুন' : 'লাইট মোড করুন'}
            >
              {isLight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            <div
              className={`flex items-center gap-1 px-1.5 py-1 rounded-lg border text-xs ${
                isLight ? 'bg-slate-100 border-slate-300' : 'bg-slate-950 border-slate-800'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400 text-[11px]">
                {currentBSTFormatted}
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls & Simulation Scrubber */}
        <div className="flex items-center gap-2 sm:gap-2.5 w-full md:w-auto justify-end flex-wrap">
          {/* E-Ticket Booking Button (Desktop) */}
          {onOpenTicketBooking && (
            <button
              onClick={onOpenTicketBooking}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
            >
              <Ticket className="w-3.5 h-3.5" />
              <span>ই-টিকেট বুকিং (eticket.railway.gov.bd)</span>
            </button>
          )}

          {/* Theme Toggle Button Desktop */}
          <button
            id="theme-toggle-btn"
            onClick={onToggleTheme}
            className={`hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              isLight
                ? 'bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200'
                : 'bg-slate-950 border-slate-800 text-slate-200 hover:bg-slate-850'
            }`}
            title={isLight ? 'ডার্ক মোড সক্রিয় করুন' : 'লাইট মোড সক্রিয় করুন'}
          >
            {isLight ? (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-600" />
                <span>ডার্ক মোড</span>
              </>
            ) : (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span>লাইট মোড</span>
              </>
            )}
          </button>

          {/* Live BST Clock Display */}
          <div
            className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl border ${
              isLight ? 'bg-slate-100 border-slate-300' : 'bg-slate-950 border-slate-800'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
            <span className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>বিএসটি:</span>
            <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
              {currentBSTFormatted}
            </span>
          </div>

          {/* Time Scrubber */}
          <div
            className={`flex items-center gap-1.5 sm:gap-2 p-1 sm:p-1.5 rounded-xl border text-xs w-full sm:w-auto justify-between sm:justify-start ${
              isLight ? 'bg-slate-100/90 border-slate-300' : 'bg-slate-950/80 border-slate-800'
            }`}
          >
            {/* Play/Pause for movement simulation */}
            <button
              id="playback-toggle-btn"
              onClick={onTogglePlay}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isPlaying
                  ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                  : isLight
                  ? 'bg-white text-slate-700 hover:bg-slate-200'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
              title={isPlaying ? 'বিরতি দিন' : 'ট্রেন মুভমেন্ট সিমুলেশন শুরু করুন'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>

            {/* Slider */}
            <div className="flex items-center gap-1.5 px-1 flex-1 sm:flex-initial">
              <input
                id="time-scrubber-slider"
                type="range"
                min={0}
                max={1439}
                step={5}
                value={timeMinutes}
                onChange={(e) => onChangeTime(Number(e.target.value))}
                className="w-full sm:w-28 md:w-32 accent-emerald-500 cursor-pointer h-1.5 bg-slate-300 dark:bg-slate-800 rounded-lg"
              />
            </div>

            {/* Reset to Real-time Button */}
            <button
              id="reset-realtime-btn"
              onClick={onResetToRealTime}
              className={`px-2 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap ${
                isRealTime
                  ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                  : isLight
                  ? 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-300'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
              title="বর্তমান লাইভ সময়ে ফিরে যান"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{isRealTime ? 'লাইভ' : 'এখন'}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

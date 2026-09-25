import React from 'react';
import { Train as TrainIcon, Radio, RotateCcw, Play, Pause, Sun, Moon, Settings, Languages, MessageSquare, DollarSign } from 'lucide-react';
import { Language, translations } from '../utils/i18n';

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
  onOpenSettings?: () => void;
  onOpenSmsTracker?: () => void;
  onOpenMonetization?: () => void;
  activeTab?: string;
  lang?: Language;
  onToggleLang?: () => void;
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
  onOpenSettings,
  onOpenSmsTracker,
  onOpenMonetization,
  activeTab,
  lang = 'bn',
  onToggleLang,
}) => {
  const isLight = theme === 'light';
  const safeLang = (lang && translations[lang]) ? lang : 'bn';
  const t = translations[safeLang] || translations.bn;

  return (
    <header
      className={`border-b px-3 sm:px-4 py-1.5 sm:py-2 sticky top-0 z-40 backdrop-blur-md transition-colors ${
        isLight
          ? 'bg-white/95 border-slate-200 text-slate-800'
          : 'bg-slate-900/95 border-slate-800 text-slate-100'
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        {/* Brand: Clean & Compact */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 shrink-0">
            <TrainIcon className="w-4 h-4" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <h1
              className={`text-xs sm:text-sm md:text-base font-bold tracking-tight truncate ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}
            >
              {t.app_title}
            </h1>
            <span className="hidden sm:inline-block px-1.5 py-0.2 rounded text-[9px] font-black bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
              {t.live}
            </span>
          </div>
        </div>

        {/* Right Actions: Clean, Minimalist & Bilingual */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* SMS 16318 Tracker Button */}
          {onOpenSmsTracker && (
            <button
              onClick={onOpenSmsTracker}
              className={`px-2 py-1 rounded-lg border text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                isLight
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100'
                  : 'bg-emerald-950/40 border-emerald-800 text-emerald-300 hover:bg-emerald-900/40'
              }`}
              title="১৬৩১৮ অফিসিয়াল রেলওয়ে এসএমএস ট্র্যাকার"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline">১৬৩১৮ এসএমএস</span>
            </button>
          )}

          {/* Monetization / Ad Revenue Button */}
          {onOpenMonetization && (
            <button
              onClick={onOpenMonetization}
              className={`px-2 py-1 rounded-lg border text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                isLight
                  ? 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100'
                  : 'bg-amber-950/40 border-amber-800 text-amber-300 hover:bg-amber-900/40'
              }`}
              title="বিজ্ঞাপন ও রাজস্ব কন্ট্রোল প্যানেল"
            >
              <DollarSign className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span className="hidden md:inline">বিজ্ঞাপন ও আয়</span>
            </button>
          )}

          {/* Live BST Time Display */}
          <div
            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-xs ${
              isLight ? 'bg-slate-100 border-slate-300' : 'bg-slate-950 border-slate-800'
            }`}
            title="বাংলাদেশ আদর্শ সময় (BST)"
          >
            <Radio className="w-3 h-3 text-emerald-500 animate-pulse" />
            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-[11px]">
              {currentBSTFormatted}
            </span>
          </div>

          {/* Compact Simulation Scrubber */}
          <div
            className={`hidden md:flex items-center gap-1.5 p-1 rounded-lg border text-xs ${
              isLight ? 'bg-slate-100/90 border-slate-300' : 'bg-slate-950/80 border-slate-800'
            }`}
          >
            <button
              onClick={onTogglePlay}
              className={`p-1 rounded transition-colors cursor-pointer ${
                isPlaying
                  ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900'
                  : 'text-slate-400 hover:text-white'
              }`}
              title={isPlaying ? t.pause : t.play}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>

            <input
              type="range"
              min={0}
              max={1439}
              step={5}
              value={timeMinutes}
              onChange={(e) => onChangeTime(Number(e.target.value))}
              className="w-16 lg:w-24 accent-emerald-500 cursor-pointer h-1 bg-slate-300 dark:bg-slate-700 rounded"
              title="সময় স্ক্র্যাবার"
            />

            {!isRealTime && (
              <button
                onClick={onResetToRealTime}
                className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-600 border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors"
                title={t.reset_realtime}
              >
                <RotateCcw className="w-2.5 h-2.5 inline mr-0.5" />
                {t.now}
              </button>
            )}
          </div>

          {/* Language Toggle Button: Bangla / English */}
          <button
            onClick={onToggleLang}
            className={`px-2 py-1 rounded-lg border text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              isLight
                ? 'bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200'
                : 'bg-slate-950 border-slate-800 text-slate-200 hover:bg-slate-800'
            }`}
            title="ভাষা পরিবর্তন / Switch Language"
          >
            <Languages className="w-3.5 h-3.5 text-blue-500" />
            <span>{lang === 'bn' ? 'EN' : 'বাং'}</span>
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
              isLight
                ? 'bg-slate-100 border-slate-300 text-amber-600 hover:bg-slate-200'
                : 'bg-slate-950 border-slate-800 text-cyan-400 hover:bg-slate-800'
            }`}
            title={isLight ? t.dark_mode : t.light_mode}
          >
            {isLight ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
          </button>

          {/* Settings Page Button */}
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                  : isLight
                  ? 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                  : 'bg-slate-950 border-slate-800 text-slate-200 hover:bg-slate-800'
              }`}
              title={t.settings}
            >
              <Settings className={`w-3.5 h-3.5 ${activeTab === 'settings' ? 'text-white' : 'text-orange-500'}`} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

import React from 'react';
import {
  Settings,
  MapPin,
  Sliders,
  Eye,
  Layers,
  Gauge,
  Clock,
  Ticket,
  RotateCcw,
  CheckCircle2,
  Train,
  ArrowLeft,
  Sun,
  Moon,
  Compass,
} from 'lucide-react';
import { ScreenCustomizationSettings, DEFAULT_SCREEN_SETTINGS } from '../types';
import { toBengaliNumber } from '../utils/geoUtils';

interface SettingsViewProps {
  settings: ScreenCustomizationSettings;
  onUpdateSettings: (settings: ScreenCustomizationSettings) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onClose: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  theme,
  onToggleTheme,
  onClose,
}) => {
  const isLight = theme === 'light';

  const handleToggle = (key: keyof ScreenCustomizationSettings) => {
    onUpdateSettings({
      ...settings,
      [key]: !settings[key],
    });
  };

  const handleJamRangeChange = (meters: number) => {
    onUpdateSettings({
      ...settings,
      jamDetectionRangeMeters: meters,
    });
  };

  const handleResetDefaults = () => {
    onUpdateSettings({ ...DEFAULT_SCREEN_SETTINGS });
  };

  return (
    <div
      className={`h-full w-full overflow-y-auto p-3 sm:p-6 transition-colors ${
        isLight ? 'bg-slate-50 text-slate-800' : 'bg-slate-950 text-slate-100'
      }`}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Bar */}
        <div
          className={`flex items-center justify-between p-4 sm:p-5 rounded-2xl border shadow-sm ${
            isLight
              ? 'bg-white border-slate-200'
              : 'bg-slate-900 border-slate-800'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-500">
              <Settings className="w-6 h-6 animate-[spin_10s_linear_infinite]" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black">
                অ্যাপ্লিকেশন সেটিংস
              </h2>
              <p className="text-xs text-slate-400">
                ম্যাপ, রেলপথ ট্র্যাকিং, ট্রেনের বগি এবং ডিসপ্লে কনফিগারেশন
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetDefaults}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                isLight
                  ? 'border-slate-200 text-slate-600 hover:bg-slate-100'
                  : 'border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
              title="ডিফল্ট সেটিংসে ফিরিয়ে নিন"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">রিসেট ডিফল্ট</span>
            </button>

            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-500/20 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>ম্যাপে ফিরে যান</span>
            </button>
          </div>
        </div>

        {/* Section 1: Train Detection & Rail Line */}
        <div
          className={`p-4 sm:p-6 rounded-2xl border shadow-sm space-y-5 ${
            isLight
              ? 'bg-white border-slate-200'
              : 'bg-slate-900 border-slate-800'
          }`}
        >
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200/60 dark:border-slate-800/80">
            <Train className="w-5 h-5 text-orange-500" />
            <div>
              <h3 className="font-bold text-sm sm:text-base">
                রেললাইন ও ট্রেন ডিটেকশন সেটিংস
              </h3>
              <p className="text-xs text-slate-400">
                কমলা রেলপথ ও ১০০মি - ৩০০মি ট্রাফিক জ্যাম ডিটেকশন নিয়ন্ত্রণ
              </p>
            </div>
          </div>

          {/* 100m to 300m Jam Detection Ribbon */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">
                    ১০০মি - ৩০০মি ট্রেন ডিটেকশন ট্রাফিক জ্যাম রিবন
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/10 text-orange-600 dark:text-orange-400">
                    রেকমেন্ডেড
                  </span>
                </div>
                <p className="text-xs text-slate-400 max-w-lg">
                  সচল ট্রেনের চারপাশে ১০০ থেকে ৩০০ মিটার রেললাইনে দৃশ্যমান গতি
                  ও জ্যাম হাইলাইট রিবন প্রদর্শন করবে।
                </p>
              </div>

              <button
                onClick={() => handleToggle('showCongestionRibbons')}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                  settings.showCongestionRibbons
                    ? 'bg-orange-500 justify-end'
                    : isLight
                    ? 'bg-slate-300 justify-start'
                    : 'bg-slate-700 justify-start'
                }`}
              >
                <span className="bg-white w-4 h-4 rounded-full shadow-md"></span>
              </button>
            </div>

            {/* Jam Range Selector */}
            {settings.showCongestionRibbons && (
              <div
                className={`p-3.5 rounded-xl border mt-3 space-y-2.5 ${
                  isLight
                    ? 'bg-orange-50/50 border-orange-200'
                    : 'bg-orange-950/20 border-orange-900/40'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="flex items-center gap-1.5 text-orange-600 dark:text-orange-400">
                    <Sliders className="w-3.5 h-3.5" />
                    ডিটেকশন দূরত্ব (লেন্থ):
                  </span>
                  <span className="font-mono text-sm font-bold text-orange-500">
                    {toBengaliNumber(settings.jamDetectionRangeMeters || 200)}{' '}
                    মিটার ({toBengaliNumber(((settings.jamDetectionRangeMeters || 200) / 1000).toFixed(2))} কিমি)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {[100, 150, 200, 250, 300].map((m) => (
                    <button
                      key={m}
                      onClick={() => handleJamRangeChange(m)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                        (settings.jamDetectionRangeMeters || 200) === m
                          ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                          : isLight
                          ? 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      {toBengaliNumber(m)}মি
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Show Wagons on Zoom */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-200/50 dark:border-slate-800/60">
            <div className="space-y-0.5">
              <span className="font-semibold text-sm">
                ম্যাপ জুম করলে ট্রেনের বগি দৃশ্যমান
              </span>
              <p className="text-xs text-slate-400">
                ম্যাপে জুম ইন করলে ইঞ্জিনের পেছনে ট্রেনের বাস্তব বগি ট্র্যাক বরাবর
                সারিবদ্ধ হয়ে চলবে।
              </p>
            </div>

            <button
              onClick={() => handleToggle('showWagonsOnZoom')}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                settings.showWagonsOnZoom
                  ? 'bg-orange-500 justify-end'
                  : isLight
                  ? 'bg-slate-300 justify-start'
                  : 'bg-slate-700 justify-start'
              }`}
            >
              <span className="bg-white w-4 h-4 rounded-full shadow-md"></span>
            </button>
          </div>

          {/* Compact Marker Mode */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-200/50 dark:border-slate-800/60">
            <div className="space-y-0.5">
              <span className="font-semibold text-sm">
                ছোট ট্রেনের মার্কার এবং উপরে নাম ট্যাগ
              </span>
              <p className="text-xs text-slate-400">
                ম্যাপ পরিচ্ছন্ন রাখতে মার্কার ছোট সাইজ ও নাম সরাসরি মার্কারের
                শীর্ষে পিন করা থাকবে।
              </p>
            </div>

            <button
              onClick={() => handleToggle('smallMarkerMode')}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                settings.smallMarkerMode
                  ? 'bg-orange-500 justify-end'
                  : isLight
                  ? 'bg-slate-300 justify-start'
                  : 'bg-slate-700 justify-start'
              }`}
            >
              <span className="bg-white w-4 h-4 rounded-full shadow-md"></span>
            </button>
          </div>

          {/* OpenRailwayMap GIS Layer */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-200/50 dark:border-slate-800/60">
            <div className="space-y-0.5">
              <span className="font-semibold text-sm">
                ওপেনরেলওয়েম্যাপ (OpenRailwayMap) GIS ট্র্যাক
              </span>
              <p className="text-xs text-slate-400">
                প্রকৃতি ও জিপিএস ভিত্তিক সম্পূর্ণ নির্ভুল বৈশ্বিক রেললাইন লেয়ার।
              </p>
            </div>

            <button
              onClick={() => handleToggle('showRailwayOverlay')}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                settings.showRailwayOverlay
                  ? 'bg-orange-500 justify-end'
                  : isLight
                  ? 'bg-slate-300 justify-start'
                  : 'bg-slate-700 justify-start'
              }`}
            >
              <span className="bg-white w-4 h-4 rounded-full shadow-md"></span>
            </button>
          </div>

          {/* Landmark Bridges and Junctions */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-200/50 dark:border-slate-800/60">
            <div className="space-y-0.5">
              <span className="font-semibold text-sm">
                আইকনিক সেতু ও জংশন ব্যাজ
              </span>
              <p className="text-xs text-slate-400">
                পদ্মা সেতু, বঙ্গবন্ধু যমুনা সেতু, তিস্তা ও ভৈরব রেলসেতুর আইকন।
              </p>
            </div>

            <button
              onClick={() => handleToggle('showLandmarkBadges')}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                settings.showLandmarkBadges
                  ? 'bg-orange-500 justify-end'
                  : isLight
                  ? 'bg-slate-300 justify-start'
                  : 'bg-slate-700 justify-start'
              }`}
            >
              <span className="bg-white w-4 h-4 rounded-full shadow-md"></span>
            </button>
          </div>
        </div>

        {/* Section 2: HUD & Overlays */}
        <div
          className={`p-4 sm:p-6 rounded-2xl border shadow-sm space-y-5 ${
            isLight
              ? 'bg-white border-slate-200'
              : 'bg-slate-900 border-slate-800'
          }`}
        >
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200/60 dark:border-slate-800/80">
            <Layers className="w-5 h-5 text-blue-500" />
            <div>
              <h3 className="font-bold text-sm sm:text-base">
                ডিসপ্লে ও ওভারলে প্যানেল সেটিংস
              </h3>
              <p className="text-xs text-slate-400">
                স্ক্রিনের তথ্য প্যানেল ও লাইভ ইন্ডিকেটর প্রদর্শন নিয়ন্ত্রণ
              </p>
            </div>
          </div>

          {/* Top Status Bar */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-semibold text-sm">শীর্ষ স্ট্যাটাস বার</span>
              <p className="text-xs text-slate-400">
                ম্যাপের উপরে নির্বাচিত ট্রেনের লাইভ স্ট্যাটাস ও প্ল্যাটফর্ম বার।
              </p>
            </div>

            <button
              onClick={() => handleToggle('showTopStatusBar')}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                settings.showTopStatusBar
                  ? 'bg-blue-500 justify-end'
                  : isLight
                  ? 'bg-slate-300 justify-start'
                  : 'bg-slate-700 justify-start'
              }`}
            >
              <span className="bg-white w-4 h-4 rounded-full shadow-md"></span>
            </button>
          </div>

          {/* Upcoming Stops Timeline */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-200/50 dark:border-slate-800/60">
            <div className="space-y-0.5">
              <span className="font-semibold text-sm">
                পরবর্তী স্টপেজ ও শিডিউল টাইমলাইন
              </span>
              <p className="text-xs text-slate-400">
                নির্বাচিত ট্রেনের পরবর্তী স্টপেজ ও দূরত্বের তালিকা প্যানেল।
              </p>
            </div>

            <button
              onClick={() => handleToggle('showUpcomingStopsTimeline')}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                settings.showUpcomingStopsTimeline
                  ? 'bg-blue-500 justify-end'
                  : isLight
                  ? 'bg-slate-300 justify-start'
                  : 'bg-slate-700 justify-start'
              }`}
            >
              <span className="bg-white w-4 h-4 rounded-full shadow-md"></span>
            </button>
          </div>

          {/* Solo Train Focus */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-200/50 dark:border-slate-800/60">
            <div className="space-y-0.5">
              <span className="font-semibold text-sm">
                একক ট্রেন ফোকাস মোড (Solo Train Focus)
              </span>
              <p className="text-xs text-slate-400">
                নির্বাচিত ট্রেন ট্র্যাক করার সময় অন্যান্য ট্রেন সাময়িকভাবে আড়াল
                করে পরিচ্ছন্ন রাখে।
              </p>
            </div>

            <button
              onClick={() => handleToggle('showSoloTrainFocus')}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                settings.showSoloTrainFocus
                  ? 'bg-blue-500 justify-end'
                  : isLight
                  ? 'bg-slate-300 justify-start'
                  : 'bg-slate-700 justify-start'
              }`}
            >
              <span className="bg-white w-4 h-4 rounded-full shadow-md"></span>
            </button>
          </div>

          {/* Nearest Station HUD */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-200/50 dark:border-slate-800/60">
            <div className="space-y-0.5">
              <span className="font-semibold text-sm">
                নিকটবর্তী স্টেশন ও জিপিএস দূরত্ব HUD
              </span>
              <p className="text-xs text-slate-400">
                ব্যবহারকারীর অবস্থান অনুযায়ী সবচেয়ে কাছের স্টেশন ও লাইভ দূরত্বের
                হেড-আপ ডিসপ্লে।
              </p>
            </div>

            <button
              onClick={() => handleToggle('showUserProximityHud')}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                settings.showUserProximityHud
                  ? 'bg-blue-500 justify-end'
                  : isLight
                  ? 'bg-slate-300 justify-start'
                  : 'bg-slate-700 justify-start'
              }`}
            >
              <span className="bg-white w-4 h-4 rounded-full shadow-md"></span>
            </button>
          </div>

          {/* Speedometer HUD */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-200/50 dark:border-slate-800/60">
            <div className="space-y-0.5">
              <span className="font-semibold text-sm">
                লাইভ স্পিডোমিটার ও ইঞ্জিন পাওয়ার
              </span>
              <p className="text-xs text-slate-400">
                রানিং ট্রেনের কিমি/ঘণ্টা স্পিড ডায়াল ও ইঞ্জিন পাওয়ার নির্দেশক।
              </p>
            </div>

            <button
              onClick={() => handleToggle('showSpeedometerHud')}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                settings.showSpeedometerHud
                  ? 'bg-blue-500 justify-end'
                  : isLight
                  ? 'bg-slate-300 justify-start'
                  : 'bg-slate-700 justify-start'
              }`}
            >
              <span className="bg-white w-4 h-4 rounded-full shadow-md"></span>
            </button>
          </div>

          {/* Quick Ticket Button */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-200/50 dark:border-slate-800/60">
            <div className="space-y-0.5">
              <span className="font-semibold text-sm">
                ১-ক্লিক দ্রুত টিকিট বুকিং বাটন
              </span>
              <p className="text-xs text-slate-400">
                ম্যাপের উপরে সরাসরি টিকিট কাটার শর্টকাট বাটন দৃশ্যমান রাখবে।
              </p>
            </div>

            <button
              onClick={() => handleToggle('showQuickTicketBtn')}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                settings.showQuickTicketBtn
                  ? 'bg-blue-500 justify-end'
                  : isLight
                  ? 'bg-slate-300 justify-start'
                  : 'bg-slate-700 justify-start'
              }`}
            >
              <span className="bg-white w-4 h-4 rounded-full shadow-md"></span>
            </button>
          </div>
          {/* Ad Banners Toggle */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-200/50 dark:border-slate-800/60">
            <div className="space-y-0.5">
              <span className="font-semibold text-sm">
                স্পন্সর ও গুগল বিজ্ঞাপন ব্যানার (Ad Banners)
              </span>
              <p className="text-xs text-slate-400">
                শীর্ষ ও নিচের স্পন্সর ব্যানার প্রদর্শন (বিকাশ, নগদ, গ্রামীণফোন ও দারাজ অফার)।
              </p>
            </div>

            <button
              onClick={() => handleToggle('showAdBanners')}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                settings.showAdBanners
                  ? 'bg-blue-500 justify-end'
                  : isLight
                  ? 'bg-slate-300 justify-start'
                  : 'bg-slate-700 justify-start'
              }`}
            >
              <span className="bg-white w-4 h-4 rounded-full shadow-md"></span>
            </button>
          </div>
        </div>

        {/* Section 3: Theme & Quick Actions */}
        <div
          className={`p-4 sm:p-6 rounded-2xl border shadow-sm space-y-4 ${
            isLight
              ? 'bg-white border-slate-200'
              : 'bg-slate-900 border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-semibold text-sm">ডিসপ্লে কালার থিম</span>
              <p className="text-xs text-slate-400">
                দিন ও রাতের সুবিধাজনক ব্যবহারের জন্য লাইট বা ডার্ক মোড
              </p>
            </div>

            <button
              onClick={onToggleTheme}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border font-bold text-xs transition-all ${
                isLight
                  ? 'bg-slate-100 text-slate-700 border-slate-300'
                  : 'bg-slate-800 text-slate-200 border-slate-700'
              }`}
            >
              {isLight ? (
                <>
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span>লাইট মোড</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-indigo-400" />
                  <span>ডার্ক মোড</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { ScreenCustomizationSettings, DEFAULT_SCREEN_SETTINGS } from '../types';
import {
  X,
  Sliders,
  Check,
  RotateCcw,
  Sparkles,
  Eye,
  EyeOff,
  Navigation,
  Clock,
  Layers,
  Activity,
  Ticket,
  MapPin,
  Train,
} from 'lucide-react';

interface ScreenCustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ScreenCustomizationSettings;
  onUpdateSettings: (newSettings: ScreenCustomizationSettings) => void;
  theme: 'light' | 'dark';
}

export const ScreenCustomizationModal: React.FC<ScreenCustomizationModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  theme,
}) => {
  if (!isOpen) return null;
  const isLight = theme === 'light';

  const toggle = (key: keyof ScreenCustomizationSettings) => {
    onUpdateSettings({
      ...settings,
      [key]: !settings[key],
    });
  };

  const applyCleanPreset = () => {
    onUpdateSettings({
      showTopStatusBar: false,
      showSoloTrainFocus: true,
      showUserProximityHud: false,
      showUpcomingStopsTimeline: false,
      showCongestionRibbons: false,
      jamDetectionRangeMeters: 200,
      showLandmarkBadges: false,
      showSpeedometerHud: false,
      showQuickTicketBtn: false,
      showRailwayOverlay: true,
      showWagonsOnZoom: true,
      smallMarkerMode: true,
      showAdBanners: true,
    });
  };

  const applyProPreset = () => {
    onUpdateSettings({
      showTopStatusBar: true,
      showSoloTrainFocus: true,
      showUserProximityHud: true,
      showUpcomingStopsTimeline: true,
      showCongestionRibbons: true,
      jamDetectionRangeMeters: 250,
      showLandmarkBadges: true,
      showSpeedometerHud: true,
      showQuickTicketBtn: true,
      showRailwayOverlay: true,
      showWagonsOnZoom: true,
      smallMarkerMode: true,
      showAdBanners: true,
    });
  };

  const resetDefault = () => {
    onUpdateSettings({ ...DEFAULT_SCREEN_SETTINGS });
  };

  const options: Array<{
    key: keyof ScreenCustomizationSettings;
    titleBn: string;
    descBn: string;
    icon: React.ReactNode;
  }> = [
    {
      key: 'showSoloTrainFocus',
      titleBn: 'একক ট্রেন ট্র্যাক মোড (অন্য ট্রেন লুকানো)',
      descBn: 'একটি ট্রেন সিলেক্ট করলে ম্যাপ থেকে অন্য সব ট্রেন সম্পূর্ণ অদৃশ্য থাকবে এবং শুধুমাত্র ওই ট্রেনের লাইভ রুট দৃশ্যমান হবে',
      icon: <Train className="w-4 h-4 text-emerald-500" />,
    },
    {
      key: 'showUpcomingStopsTimeline',
      titleBn: 'ট্রেনের পরবর্তী স্টপেজ ও শিডিউল টাইমলাইন',
      descBn: 'ট্রেনটির পরবর্তী কোন কোন স্টপেজ আছে, পৌঁছানোর আনুমানিক সময় (ETA) ও দূরত্ব প্রদর্শন করবে',
      icon: <Clock className="w-4 h-4 text-cyan-500" />,
    },
    {
      key: 'showUserProximityHud',
      titleBn: 'ব্যবহারকারীর নিকটবর্তী স্টেশন ও দূরত্ব ট্র্যাকার',
      descBn: 'আপনার বর্তমান লোকেশন থেকে সবচেয়ে কাছের স্টেশন ও নির্বাচিত ট্রেনটির লাইভ দূরত্বের ভাসমান কার্ড',
      icon: <MapPin className="w-4 h-4 text-blue-500" />,
    },
    {
      key: 'showTopStatusBar',
      titleBn: 'শীর্ষ অটোনোমাস ট্র্যাফিক ও সময় বার',
      descBn: 'বাংলাদেশ মান সময় (BST), নেটওয়ার্কে মোট ট্রেন ও সময় শিফটিং কন্ট্রোলার বার',
      icon: <Activity className="w-4 h-4 text-amber-500" />,
    },
    {
      key: 'showSpeedometerHud',
      titleBn: 'লাইভ লোকোমোটিভ স্পিডোমিটার',
      descBn: 'ট্রেনের বর্তমান রিয়েল-টাইম গতিবেগ (কিমি/ঘণ্টা), দিক ও ইঞ্জিন স্ট্যাটাস HUD',
      icon: <Navigation className="w-4 h-4 text-purple-500" />,
    },
    {
      key: 'showCongestionRibbons',
      titleBn: 'ট্র্যাফিক কনজেশন ও জংশন ক্রসিং লেয়ার',
      descBn: 'রেলওয়ে জংশনগুলোতে ট্রেন ক্রসিং অপেক্ষা ও ধীরগতির সেকশনগুলো ভিজ্যুয়াল রঙে চিহ্নিত করা',
      icon: <Layers className="w-4 h-4 text-rose-500" />,
    },
    {
      key: 'showLandmarkBadges',
      titleBn: 'আইকনিক রেল সেতু ও জংশন মার্কার',
      descBn: 'পদ্মা সেতু, বঙ্গবন্ধু সেতু, হার্ডিঞ্জ ব্রিজ ও প্রধান রেল জংশনগুলোর আইকনিক ব্যাজ',
      icon: <Sparkles className="w-4 h-4 text-yellow-500" />,
    },
    {
      key: 'showQuickTicketBtn',
      titleBn: '১-ক্লিক অফিশিয়াল টিকেট বুকিং বাটন',
      descBn: 'বাংলাদেশ রেলওয়ের অফিশিয়াল ই-টিকেট পোর্টালে সরাসরি অটো-ট্রান্সফারের দ্রুত বাটন',
      icon: <Ticket className="w-4 h-4 text-emerald-500" />,
    },
    {
      key: 'showRailwayOverlay',
      titleBn: 'OpenRailway GIS নির্ভুল রেললাইন ট্র্যাক (ডিফল্ট)',
      descBn: 'স্যাটেলাইট ও আন্তর্জাতিক GIS রেলওয়ে ডাটাবেসের ১০০% নির্ভুল ভৌত রেললাইন ট্র্যাক ওভারলে',
      icon: <Layers className="w-4 h-4 text-indigo-500" />,
    },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-md animate-in fade-in">
      <div
        className={`w-full max-w-xl max-h-[90vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden font-sans transition-all ${
          isLight
            ? 'bg-white border-slate-300 text-slate-900 shadow-slate-400/40'
            : 'bg-slate-900 border-slate-800 text-slate-100 shadow-black/80'
        }`}
      >
        {/* Header */}
        <div
          className={`px-5 py-4 flex items-center justify-between border-b ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/80 border-slate-800'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black">স্ক্রিন কাস্টমাইজেশন ও ডিসপ্লে সেটিংস</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                স্ক্রিনে কোন কোন উপাদান দৃশ্যমান থাকবে তা আপনার ইচ্ছামতো নিয়ন্ত্রণ করুন
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Presets */}
        <div
          className={`px-5 py-2.5 border-b flex items-center justify-between gap-2 text-xs flex-wrap ${
            isLight ? 'bg-slate-100/70 border-slate-200' : 'bg-slate-950/50 border-slate-800'
          }`}
        >
          <span className="font-bold text-slate-500 dark:text-slate-400">দ্রুত প্রি-সেট:</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={applyCleanPreset}
              className="px-3 py-1 rounded-lg font-bold bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30 transition-all flex items-center gap-1.5"
            >
              <EyeOff className="w-3.5 h-3.5" />
              <span>ক্লিন ভিউ (Clean Map)</span>
            </button>
            <button
              type="button"
              onClick={applyProPreset}
              className="px-3 py-1 rounded-lg font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 transition-all flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>প্রো ড্যাশবোর্ড (Full)</span>
            </button>
            <button
              type="button"
              onClick={resetDefault}
              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-all"
              title="ডিফল্ট রিসেট"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* List of Toggles */}
        <div className="p-5 overflow-y-auto space-y-3 divide-y divide-slate-100 dark:divide-slate-800/60">
          {options.map((opt) => {
            const isEnabled = settings[opt.key];
            return (
              <div
                key={opt.key}
                onClick={() => toggle(opt.key)}
                className="pt-3 first:pt-0 flex items-center justify-between gap-4 cursor-pointer group"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0 mt-0.5">
                    {opt.icon}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {opt.titleBn}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-0.5">
                      {opt.descBn}
                    </p>
                  </div>
                </div>

                {/* Switch Toggle */}
                <div
                  className={`w-12 h-6 rounded-full transition-colors relative shrink-0 p-0.5 ${
                    isEnabled ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                      isEnabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div
          className={`px-5 py-3 border-t flex items-center justify-between ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/60 border-slate-800'
          }`}
        >
          <span className="text-xs text-slate-500">
            পরিবর্তনগুলো স্বয়ংক্রিয়ভাবে সংরক্ষিত হয়েছে
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md transition-all cursor-pointer"
          >
            সম্পন্ন
          </button>
        </div>
      </div>
    </div>
  );
};

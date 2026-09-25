import React, { useEffect } from 'react';
import { BellRing, Check, MapPin, VolumeX, Train as TrainIcon } from 'lucide-react';
import { startContinuousAlarm, stopContinuousAlarm } from '../utils/soundAlert';
import { Language, translations } from '../utils/i18n';

interface AlarmTriggeredDialogProps {
  trainNameBn: string;
  trainNameEn: string;
  destinationNameBn: string;
  destinationNameEn: string;
  onDismiss: () => void;
  lang: Language;
  theme: 'light' | 'dark';
}

export const AlarmTriggeredDialog: React.FC<AlarmTriggeredDialogProps> = ({
  trainNameBn,
  trainNameEn,
  destinationNameBn,
  destinationNameEn,
  onDismiss,
  lang,
  theme,
}) => {
  const t = translations[lang];
  const isLight = theme === 'light';

  useEffect(() => {
    // Start looping chimes on display
    startContinuousAlarm();
    return () => {
      stopContinuousAlarm();
    };
  }, []);

  const handleDismiss = () => {
    stopContinuousAlarm();
    onDismiss();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
      <div
        className={`w-full max-w-sm rounded-3xl shadow-2xl border p-5 sm:p-6 text-center space-y-4 ${
          isLight ? 'bg-white border-amber-300 text-slate-900' : 'bg-slate-900 border-amber-600/50 text-white'
        }`}
      >
        {/* Pulsing Alarm Bell Icon */}
        <div className="mx-auto w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center relative">
          <span className="w-full h-full rounded-full bg-amber-500/30 animate-ping absolute" />
          <div className="w-12 h-12 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/40 relative">
            <BellRing className="w-6 h-6 animate-bounce" />
          </div>
        </div>

        <div>
          <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 inline-block mb-1.5">
            {lang === 'bn' ? 'গন্তব্য স্টেশন এলার্ম' : 'DESTINATION ALARM'}
          </span>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
            {t.alarm_triggered_title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
            {t.alarm_triggered_msg}
          </p>
        </div>

        {/* Station Highlight Card */}
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-1">
          <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-300">
            <TrainIcon className="w-4 h-4" />
            <span>{lang === 'bn' ? trainNameBn : trainNameEn}</span>
          </div>
          <div className="flex items-center justify-center gap-1 text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
            <MapPin className="w-4 h-4 text-rose-500" />
            <span>{lang === 'bn' ? destinationNameBn : destinationNameEn}</span>
          </div>
        </div>

        {/* Dismiss Alarm Button */}
        <button
          type="button"
          onClick={handleDismiss}
          className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-600/30 cursor-pointer transition-transform active:scale-95"
        >
          <VolumeX className="w-4 h-4" />
          <span>{t.dismiss_alarm}</span>
        </button>
      </div>
    </div>
  );
};

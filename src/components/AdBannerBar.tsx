import React, { useState } from 'react';
import { AuthDB } from '../utils/authDatabase';
import { ExternalLink, Sparkles, X } from 'lucide-react';

interface AdBannerBarProps {
  theme?: 'light' | 'dark';
}

export const AdBannerBar: React.FC<AdBannerBarProps> = ({ theme = 'dark' }) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const systemState = AuthDB.getSystemState();

  if (isDismissed || !systemState.adConfig.showBannerAds) return null;

  const isLight = theme === 'light';

  const handleClickAd = () => {
    // Record click count & increment revenue in AuthDB
    const current = AuthDB.getSystemState();
    AuthDB.saveSystemState({
      adConfig: {
        ...current.adConfig,
        clicksCount: (current.adConfig.clicksCount || 0) + 1,
        impressionsCount: (current.adConfig.impressionsCount || 0) + 1,
        adRevenueBdt: Math.round(((current.adConfig.adRevenueBdt || 0) + 8.5) * 10) / 10,
      },
    });
  };

  return (
    <div
      className={`fixed bottom-2 left-1/2 -translate-x-1/2 z-30 max-w-xl w-[94%] sm:w-auto px-4 py-2 rounded-2xl border shadow-xl flex items-center justify-between gap-3 text-xs backdrop-blur-md transition-all ${
        isLight
          ? 'bg-gradient-to-r from-amber-50/95 via-yellow-50/95 to-orange-50/95 border-amber-300/80 text-amber-950'
          : 'bg-gradient-to-r from-slate-900/95 via-amber-950/40 to-slate-900/95 border-amber-500/30 text-amber-200'
      }`}
    >
      <div className="flex items-center gap-2 overflow-hidden">
        <span className="text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 shrink-0">
          স্পন্সর
        </span>
        <a
          href={systemState.adConfig.adBannerLink}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleClickAd}
          className="truncate font-semibold hover:underline flex items-center gap-1.5"
        >
          <span>{systemState.adConfig.adBannerTextBn}</span>
          <ExternalLink className="w-3 h-3 shrink-0 opacity-70" />
        </a>
      </div>

      <button
        onClick={() => setIsDismissed(true)}
        className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white transition shrink-0"
        title="বিজ্ঞাপন বন্ধ করুন"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

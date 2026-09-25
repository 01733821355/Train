import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  Eye,
  MousePointer,
  Sparkles,
  Settings,
  X,
  CheckCircle,
  HelpCircle,
  ShieldCheck,
  CreditCard,
  Building,
  Smartphone,
} from 'lucide-react';
import { MonetizationState } from '../types';
import { toBengaliNumber } from '../utils/geoUtils';

interface MonetizationDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  monetization: MonetizationState;
  onUpdateMonetization: (updated: Partial<MonetizationState>) => void;
  onTriggerRewardedAd: () => void;
  theme?: 'light' | 'dark';
}

export const MonetizationDashboardModal: React.FC<MonetizationDashboardModalProps> = ({
  isOpen,
  onClose,
  monetization,
  onUpdateMonetization,
  onTriggerRewardedAd,
  theme = 'light',
}) => {
  const [pubIdInput, setPubIdInput] = useState(monetization.publisherId || 'ca-pub-9842104928172901');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const isLight = theme === 'light';

  if (!isOpen) return null;

  const ctr = monetization.impressions > 0
    ? ((monetization.clicks / monetization.impressions) * 100).toFixed(1)
    : '0.0';

  const earningsUsd = (monetization.earningsBdt / 121.5).toFixed(2);

  const handleSaveSettings = () => {
    onUpdateMonetization({ publisherId: pubIdInput });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`w-full max-w-xl rounded-2xl shadow-2xl border overflow-hidden flex flex-col max-h-[92vh] ${
          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
        }`}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b flex items-center justify-between border-slate-200 dark:border-slate-800 bg-gradient-to-r from-emerald-600/15 via-teal-600/10 to-amber-600/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg flex items-center gap-2">
                <span>বিজ্ঞাপন ও রাজস্ব কন্ট্রোল প্যানেল</span>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  Ad Revenue Active
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                গুগল অ্যাডসেন্স/অ্যাডমব ও বাংলাদেশি স্পনসর ব্যানার রাজস্ব হিসাব
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Revenue Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div
              className={`p-3 rounded-xl border flex flex-col gap-1 ${
                isLight ? 'bg-emerald-50/70 border-emerald-200' : 'bg-emerald-950/20 border-emerald-800/40'
              }`}
            >
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                মোট আনুমানিক আয়
              </span>
              <span className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400">
                ৳{toBengaliNumber(monetization.earningsBdt.toFixed(2))}
              </span>
              <span className="text-[10px] text-slate-500">~${earningsUsd} USD</span>
            </div>

            <div
              className={`p-3 rounded-xl border flex flex-col gap-1 ${
                isLight ? 'bg-blue-50/70 border-blue-200' : 'bg-blue-950/20 border-blue-800/40'
              }`}
            >
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-blue-600" />
                বিজ্ঞাপন ইম্প্রেশন
              </span>
              <span className="text-lg sm:text-xl font-black text-blue-600 dark:text-blue-400">
                {toBengaliNumber(monetization.impressions)}
              </span>
              <span className="text-[10px] text-slate-500">ভিউ কাউন্ট</span>
            </div>

            <div
              className={`p-3 rounded-xl border flex flex-col gap-1 ${
                isLight ? 'bg-purple-50/70 border-purple-200' : 'bg-purple-950/20 border-purple-800/40'
              }`}
            >
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <MousePointer className="w-3.5 h-3.5 text-purple-600" />
                মোট ক্লিক
              </span>
              <span className="text-lg sm:text-xl font-black text-purple-600 dark:text-purple-400">
                {toBengaliNumber(monetization.clicks)}
              </span>
              <span className="text-[10px] text-slate-500">বিজ্ঞাপনে ক্লিক</span>
            </div>

            <div
              className={`p-3 rounded-xl border flex flex-col gap-1 ${
                isLight ? 'bg-amber-50/70 border-amber-200' : 'bg-amber-950/20 border-amber-800/40'
              }`}
            >
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
                ক্লিক রেট (CTR)
              </span>
              <span className="text-lg sm:text-xl font-black text-amber-600 dark:text-amber-400">
                {toBengaliNumber(ctr)}%
              </span>
              <span className="text-[10px] text-slate-500">গড় কনভার্সন</span>
            </div>
          </div>

          {/* Rewarded Ad Action */}
          <div
            className={`p-3.5 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-3 ${
              isLight ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200' : 'bg-gradient-to-r from-amber-950/20 to-orange-950/20 border-amber-800/40'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-amber-900 dark:text-amber-200">
                  রিওয়ার্ডেড ভিডিও অ্যাড দেখুন ও আয় বাড়ান
                </h4>
                <p className="text-[11px] text-amber-700 dark:text-amber-300">
                  ৫ সেকেন্ডের বিজ্ঞাপন দেখে ভিআইপি হাই-প্রিসিশন ট্র্যাকিং সক্রিয় করুন (৳১০ ইনস্ট্যান্ট আর্নিং)
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                onClose();
                onTriggerRewardedAd();
              }}
              className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 shadow-md cursor-pointer transition-all"
            >
              বিজ্ঞাপন দেখুন (+৳১০)
            </button>
          </div>

          {/* AdSense Publisher Configuration */}
          <div
            className={`p-4 rounded-xl border space-y-3 ${
              isLight ? 'bg-white border-slate-200' : 'bg-slate-800/60 border-slate-700'
            }`}
          >
            <h4 className="font-bold text-xs sm:text-sm flex items-center gap-2">
              <Building className="w-4 h-4 text-emerald-600" />
              <span>গুগল অ্যাডসেন্স / অ্যাডমব পাবলিশার কনফিগারেশন</span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              আপনার অনুমোদিত Google AdSense অথবা Google AdMob Publisher ID দিলে সরাসরি আপনার অ্যাকাউন্টে আয় জমা হবে।
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                AdSense Publisher ID (বা AdMob App ID):
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={pubIdInput}
                  onChange={(e) => setPubIdInput(e.target.value)}
                  placeholder="ca-pub-XXXXXXXXXXXXXXXX"
                  className={`flex-1 px-3 py-2 rounded-xl text-xs font-mono border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-900 border-slate-700 text-white'
                  }`}
                />
                <button
                  onClick={handleSaveSettings}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-500 shadow-sm cursor-pointer transition-all"
                >
                  সংরক্ষণ
                </button>
              </div>
              {saveSuccess && (
                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  পাবলিশার আইডি সফলভাবে সংরক্ষিত হয়েছে!
                </div>
              )}
            </div>

            {/* Ad Frequency Control */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                বিজ্ঞাপন প্রদর্শনের ঘনত্ব (Ad Density):
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['high', 'standard', 'minimal'] as const).map((freq) => (
                  <button
                    key={freq}
                    onClick={() => onUpdateMonetization({ adFrequency: freq })}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      monetization.adFrequency === freq
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : isLight
                        ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {freq === 'high' ? 'সর্বোচ্চ আয় (High)' : freq === 'standard' ? 'সুষম (Standard)' : 'ন্যূনতম (Minimal)'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Payment & Payout Info for Bangladesh */}
          <div
            className={`p-3.5 rounded-xl border flex items-start gap-2.5 text-xs ${
              isLight ? 'bg-slate-50 border-slate-200 text-slate-600' : 'bg-slate-800/40 border-slate-800 text-slate-300'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed text-[11px]">
              <strong className="text-slate-900 dark:text-white">পেআউট তথ্য:</strong> Google AdSense ও লোকাল অ্যাড পার্টনারদের মাধ্যমে অর্জিত অর্থ প্রতি মাসের ২১-২৬ তারিখের মধ্যে সরাসরি বাংলাদেশি যেকোনো ব্যাংক অ্যাকাউন্ট, বিকাশ বা নগদে ট্রান্সফার করা যায় (মিনিমাম পেআউট থ্রেশহোল্ড ১০০ ডলার বা ১০,০০০ টাকা)।
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};

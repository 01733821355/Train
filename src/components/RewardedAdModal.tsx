import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Sparkles, ExternalLink, ShieldCheck, DollarSign } from 'lucide-react';
import { toBengaliNumber } from '../utils/geoUtils';

interface RewardedAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRewardGranted: (rewardAmountBdt: number) => void;
  theme?: 'light' | 'dark';
}

export const RewardedAdModal: React.FC<RewardedAdModalProps> = ({
  isOpen,
  onClose,
  onRewardGranted,
  theme = 'light',
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState(5);
  const [isCompleted, setIsCompleted] = useState(false);
  const isLight = theme === 'light';

  useEffect(() => {
    if (!isOpen) {
      setSecondsRemaining(5);
      setIsCompleted(false);
      return;
    }

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsCompleted(true);
          onRewardGranted(10.0); // Reward 10 BDT to app owner earnings
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`w-full max-w-md rounded-2xl shadow-2xl border overflow-hidden flex flex-col ${
          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
        }`}
      >
        {/* Top Ad Status Bar */}
        <div className="px-4 py-3 bg-slate-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500 text-slate-950">
              স্পন্সর ভিডিও • Sponsored Ad
            </span>
            <span className="text-xs font-medium text-slate-300">
              {isCompleted ? 'রিওয়ার্ড অর্জিত!' : `বিজ্ঞাপন শেষ হতে: ${toBengaliNumber(secondsRemaining)} সেকেন্ড`}
            </span>
          </div>

          {isCompleted ? (
            <button
              onClick={onClose}
              className="p-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <span className="w-6 h-6 rounded-full border-2 border-amber-400 border-t-transparent animate-spin inline-block" />
          )}
        </div>

        {/* Video / Interactive Ad Creative */}
        <div className="relative bg-gradient-to-br from-pink-600 via-rose-600 to-indigo-900 p-6 text-white flex flex-col items-center justify-center text-center space-y-4 min-h-[220px]">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl shadow-xl">
            ৳
          </div>

          <div>
            <span className="inline-block text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-white mb-1.5">
              bKash রেলওয়ে ক্যাশব্যাক মেগা ক্যাম্পেইন
            </span>
            <h3 className="text-lg sm:text-xl font-black">
              ট্রেনের টিকেটে বিকাশ পেমেন্টে ১০% ইনস্ট্যান্ট ক্যাশব্যাক!
            </h3>
            <p className="text-xs text-white/80 mt-1">
              টিকিট বুক করুন সহজ ও নির্ভুলভাবে। প্রতি টিকিট ক্রয়ে নিশ্চিত ক্যাশব্যাক অফার সীমিত সময়ের জন্য।
            </p>
          </div>

          <a
            href="https://eticket.railway.gov.bd"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-2.5 rounded-xl bg-white text-rose-700 font-black text-xs shadow-lg hover:bg-rose-50 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>এখনই অফারটি নিন</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Footer & Reward Status */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isCompleted ? (
              <CheckCircle className="w-5 h-5 text-emerald-500" />
            ) : (
              <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
            )}
            <div className="text-left">
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                {isCompleted ? 'অভিনন্দন! রিওয়ার্ড আনলক হয়েছে' : 'ভিআইপি ট্র্যাকিং রিওয়ার্ড আনলক হচ্ছে'}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                বিজ্ঞাপন রাজস্বে ৳১০.০০ যোগ হয়েছে
              </p>
            </div>
          </div>

          {isCompleted && (
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md cursor-pointer transition-all"
            >
              সম্পন্ন করুন
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

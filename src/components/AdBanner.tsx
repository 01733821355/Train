import React, { useState, useEffect } from 'react';
import { ExternalLink, X, Info, Sparkles, DollarSign } from 'lucide-react';
import { toBengaliNumber } from '../utils/geoUtils';

export interface AdCampaign {
  id: string;
  brand: string;
  taglineBn: string;
  taglineEn: string;
  ctaBn: string;
  ctaEn: string;
  linkUrl: string;
  badgeBn: string;
  gradient: string;
  iconText: string;
  payoutBdt: number;
}

const CAMPAIGNS: AdCampaign[] = [
  {
    id: 'bkash-rail',
    brand: 'bKash (বিকাশ)',
    taglineBn: 'বিকাশে ট্রেনের টিকিট কাটলেই ১০% ইনস্ট্যান্ট ক্যাশব্যাক! ঘরে বসেই নিরাপদ পেমেন্ট।',
    taglineEn: 'Get 10% Instant Cashback on Railway e-Ticket purchase via bKash!',
    ctaBn: 'অফার নিন',
    ctaEn: 'Claim Offer',
    linkUrl: 'https://eticket.railway.gov.bd',
    badgeBn: 'ক্যাশব্যাক স্পন্সর',
    gradient: 'from-pink-600 via-rose-600 to-pink-700',
    iconText: '৳',
    payoutBdt: 4.5,
  },
  {
    id: 'shohoz-ticket',
    brand: 'Shohoz Rail (সহজ)',
    taglineBn: 'বাংলাদেশ রেলওয়ের অফিসিয়াল ই-টিকেটিং পার্টনার — ১ ক্লিকে এসি সিট বুক করুন।',
    taglineEn: 'Bangladesh Railway official ticketing partner — Book AC seats instantly.',
    ctaBn: 'টিকেট কাটুন',
    ctaEn: 'Book Now',
    linkUrl: 'https://eticket.railway.gov.bd',
    badgeBn: 'অফিসিয়াল পার্টনার',
    gradient: 'from-emerald-600 via-teal-600 to-emerald-700',
    iconText: '🚆',
    payoutBdt: 5.0,
  },
  {
    id: 'gp-roaming',
    brand: 'Grameenphone 4G',
    taglineBn: 'রেলপথে হাই-স্পিড ৪জি ইন্টারনেট রোমিং প্যাক — জার্নিতে ভিডিও স্ট্রিমিং ফুল এইচডি।',
    taglineEn: 'Uninterrupted 4G Railway Roaming Data Pack by Grameenphone.',
    ctaBn: 'প্যাক দেখুন',
    ctaEn: 'View Packs',
    linkUrl: 'https://www.grameenphone.com',
    badgeBn: 'টেলিকম পার্টনার',
    gradient: 'from-sky-600 via-blue-600 to-indigo-700',
    iconText: '📶',
    payoutBdt: 3.8,
  },
  {
    id: 'nagad-offer',
    brand: 'Nagad (নগদ)',
    taglineBn: 'ডাক বিভাগের ডিজিটাল লেনদেন নগদে ট্রেনের টিকিটে ক্যাশব্যাক ও ফ্রি সার্ভিস চার্জ।',
    taglineEn: 'Zero extra charge on Train Tickets with Nagad mobile recharge.',
    ctaBn: 'বিস্তারিত',
    ctaEn: 'Details',
    linkUrl: 'https://nagad.com.bd',
    badgeBn: 'স্পেশাল ছাড়',
    gradient: 'from-amber-600 via-orange-600 to-red-600',
    iconText: '🪙',
    payoutBdt: 4.0,
  },
  {
    id: 'daraz-travel',
    brand: 'Daraz Travel Mart',
    taglineBn: 'ট্রেনের যাত্রীদের জন্য ট্রাভেল ব্যাকপ্যাক, পাওয়ার ব্যাংক ও নেক পিলোতে ৫০% ছাড়!',
    taglineEn: 'Up to 50% discount on travel bags, pillows and powerbanks on Daraz!',
    ctaBn: 'শপ করুন',
    ctaEn: 'Shop Now',
    linkUrl: 'https://www.daraz.com.bd',
    badgeBn: 'ট্রাভেল সেল',
    gradient: 'from-violet-600 via-purple-600 to-pink-600',
    iconText: '🛍️',
    payoutBdt: 3.5,
  },
];

interface AdBannerProps {
  placement?: 'top-banner' | 'bottom-sticky' | 'sidebar-card' | 'inline';
  onAdClick?: (payoutBdt: number) => void;
  onAdImpression?: () => void;
  theme?: 'light' | 'dark';
  onOpenMonetizationDashboard?: () => void;
}

export const AdBanner: React.FC<AdBannerProps> = ({
  placement = 'top-banner',
  onAdClick,
  onAdImpression,
  theme = 'light',
  onOpenMonetizationDashboard,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDismissed, setIsDismissed] = useState(false);
  const isLight = theme === 'light';

  // Rotate ads every 12 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % CAMPAIGNS.length);
    }, 12000);
    return () => clearInterval(timer);
  }, []);

  // Track impression once mounted
  useEffect(() => {
    if (onAdImpression) {
      onAdImpression();
    }
  }, [currentIndex]);

  if (isDismissed) return null;

  const campaign = CAMPAIGNS[currentIndex];

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onAdClick) {
      onAdClick(campaign.payoutBdt);
    }
    window.open(campaign.linkUrl, '_blank', 'noopener,noreferrer');
  };

  if (placement === 'bottom-sticky') {
    return (
      <div className="fixed bottom-14 lg:bottom-2 left-2 right-2 sm:left-auto sm:right-4 sm:max-w-md z-40 animate-in slide-in-from-bottom duration-300">
        <div
          className={`rounded-2xl p-2.5 shadow-2xl border flex items-center gap-3 backdrop-blur-md transition-all ${
            isLight
              ? 'bg-white/95 border-emerald-300 text-slate-800'
              : 'bg-slate-900/95 border-emerald-500/40 text-slate-100'
          }`}
        >
          <div
            className={`w-10 h-10 rounded-xl bg-gradient-to-br ${campaign.gradient} text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-md`}
          >
            {campaign.iconText}
          </div>

          <div className="flex-1 min-w-0" onClick={handleClick}>
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                বিজ্ঞাপন • Ad
              </span>
              <span className="text-xs font-bold truncate text-slate-900 dark:text-white">
                {campaign.brand}
              </span>
            </div>
            <p className="text-[11px] leading-tight text-slate-600 dark:text-slate-300 line-clamp-1">
              {campaign.taglineBn}
            </p>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={handleClick}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs shadow-md transition-all bg-gradient-to-r ${campaign.gradient} text-white hover:brightness-110 cursor-pointer`}
            >
              {campaign.ctaBn}
            </button>
            <button
              onClick={() => setIsDismissed(true)}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              title="বিজ্ঞাপন বন্ধ করুন"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Standard Header / In-Page Leaderboard Banner
  return (
    <div
      className={`w-full rounded-xl border p-2 sm:p-2.5 flex items-center justify-between gap-2.5 shadow-sm transition-all relative overflow-hidden ${
        isLight
          ? 'bg-gradient-to-r from-emerald-50 via-teal-50/60 to-blue-50 border-emerald-200 text-slate-800'
          : 'bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border-slate-800 text-slate-100'
      }`}
    >
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <div
          className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br ${campaign.gradient} text-white flex items-center justify-center font-bold text-base shrink-0 shadow-md`}
        >
          {campaign.iconText}
        </div>

        <div className="flex-1 min-w-0 cursor-pointer" onClick={handleClick}>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
              বিজ্ঞাপন • Ad
            </span>
            <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
              {campaign.brand}
            </span>
            <span className="hidden md:inline-block text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              ({campaign.badgeBn})
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 truncate">
            {campaign.taglineBn}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={handleClick}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow-sm flex items-center gap-1 bg-gradient-to-r ${campaign.gradient} hover:brightness-110 transition-all cursor-pointer`}
        >
          <span>{campaign.ctaBn}</span>
          <ExternalLink className="w-3 h-3" />
        </button>

        {onOpenMonetizationDashboard && (
          <button
            onClick={onOpenMonetizationDashboard}
            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="বিজ্ঞাপন ও রাজস্ব ড্যাশবোর্ড"
          >
            <DollarSign className="w-3.5 h-3.5" />
          </button>
        )}

        <button
          onClick={() => setIsDismissed(true)}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title="বিজ্ঞাপন সরান"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

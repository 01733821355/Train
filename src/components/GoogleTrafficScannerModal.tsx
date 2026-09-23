import React from 'react';
import { LiveTrainStatus } from '../types';
import { toBengaliNumber } from '../utils/geoUtils';
import { Radio, Activity, MapPin, Zap, X, ArrowRight, Compass, Ticket, ExternalLink } from 'lucide-react';

interface GoogleTrafficScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  trainStatuses: LiveTrainStatus[];
  onSelectTrain: (trainId: string) => void;
  onOpenTicketBooking?: (trainId?: string) => void;
  theme: 'light' | 'dark';
}

export const GoogleTrafficScannerModal: React.FC<GoogleTrafficScannerModalProps> = ({
  isOpen,
  onClose,
  trainStatuses,
  onSelectTrain,
  onOpenTicketBooking,
  theme,
}) => {
  if (!isOpen) return null;

  const isLight = theme === 'light';
  const activeTrains = trainStatuses.filter((s) => s.isActive);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${
          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-slate-100'
        }`}
      >
        {/* Header */}
        <div
          className={`px-4 py-3.5 border-b flex items-center justify-between ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/70 border-slate-800'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-500 flex items-center justify-center text-white shadow">
              <Activity className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base">
                  বাংলাদেশ রেলওয়ে লাইভ ট্রেন মনিটর
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/30">
                  {toBengaliNumber(activeTrains.length)} টি সচল ট্রেন
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                চলমান সকল আন্তঃনগর ট্রেনের লাইভ অবস্থান, গতি ও ই-টিকেট
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isLight ? 'hover:bg-slate-200 text-slate-500' : 'hover:bg-slate-800 text-slate-400'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* E-Ticket banner */}
        <div
          className={`p-3 border-b text-xs flex items-center justify-between gap-2.5 ${
            isLight ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950' : 'bg-emerald-950/20 border-emerald-800 text-emerald-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <Ticket className="w-4 h-4 shrink-0 text-emerald-600" />
            <span className="font-semibold text-[11px]">
              বাংলাদেশ রেলওয়ে অফিসিয়াল ই-টিকেট সেবা: <strong>https://eticket.railway.gov.bd/</strong>
            </span>
          </div>

          <a
            href="https://eticket.railway.gov.bd/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold shrink-0 flex items-center gap-1 shadow-sm"
          >
            <span>টিকেট কাটুন</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Live Active Trains List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 px-1">
            <span>সচল আন্তঃনগর ট্রেন ও অবস্থান</span>
            <span>লাইভ গতি ও অ্যাকশন</span>
          </div>

          {activeTrains.map((status) => {
            const { train, speedKmH, trafficCondition, currentBlockSectionBn } = status;

            let conditionLabel = 'মেইন লাইনে দ্রুত চলমান';
            let badgeBg = 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30';
            let dotColor = 'bg-emerald-500';

            if (trafficCondition === 'STATION_STOP' || speedKmH < 5) {
              conditionLabel = 'স্টেশনে যাত্রা বিরতি';
              badgeBg = 'bg-rose-500/15 text-rose-600 border-rose-500/30';
              dotColor = 'bg-rose-500';
            } else if (trafficCondition === 'WAITING_CROSSING' || speedKmH < 25) {
              conditionLabel = 'ক্রসিং / কন্ডিশন নিয়ন্ত্রণ';
              badgeBg = 'bg-amber-500/15 text-amber-600 border-amber-500/30';
              dotColor = 'bg-amber-500';
            }

            return (
              <div
                key={train.id}
                className={`p-3 rounded-xl border transition-all ${
                  isLight
                    ? 'bg-slate-50/90 hover:bg-slate-100 border-slate-200'
                    : 'bg-slate-950/60 hover:bg-slate-800/60 border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                          isLight ? 'bg-slate-200 text-slate-800' : 'bg-slate-800 text-emerald-400'
                        }`}
                      >
                        {train.number}
                      </span>
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                        {train.nameBn}
                      </h4>
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${badgeBg}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${dotColor} animate-pulse`} />
                        {conditionLabel}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 truncate">
                      <MapPin className="w-3 h-3 text-emerald-500 shrink-0" />
                      <span className="truncate">{currentBlockSectionBn}</span>
                    </div>

                    <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 truncate">
                      <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>
                        পরবর্তী: <strong className="text-slate-700 dark:text-slate-200">{status.nextStation ? status.nextStation.nameBn : 'পৌঁছেছে'}</strong>
                        {' '}(সম্ভাব্য {status.etaNextStation})
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
                    <span className="text-xs sm:text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400">
                      {toBengaliNumber(speedKmH)} কিমি/ঘ
                    </span>

                    <div className="flex items-center gap-1">
                      {onOpenTicketBooking && (
                        <button
                          onClick={() => {
                            onOpenTicketBooking(train.id);
                            onClose();
                          }}
                          className="px-2 py-1 rounded-lg text-[10px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm flex items-center gap-1 cursor-pointer"
                          title="ই-টিকেট বুক করুন"
                        >
                          <Ticket className="w-3 h-3" />
                          <span>টিকেট</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          onSelectTrain(train.id);
                          onClose();
                        }}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                          isLight
                            ? 'bg-white hover:bg-slate-200 text-slate-800 border-slate-300'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                        }`}
                      >
                        ম্যাপে দেখুন
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

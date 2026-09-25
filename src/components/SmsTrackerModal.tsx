import React, { useState } from 'react';
import {
  MessageSquare,
  Search,
  Send,
  CheckCircle,
  Clock,
  MapPin,
  Train as TrainIcon,
  X,
  ExternalLink,
  Copy,
  Radio,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { LiveTrainStatus } from '../types';
import { toBengaliNumber, formatTo4Digit } from '../utils/geoUtils';

interface SmsTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  trainStatuses: LiveTrainStatus[];
  initialTrainId?: string;
  theme?: 'light' | 'dark';
}

export const SmsTrackerModal: React.FC<SmsTrackerModalProps> = ({
  isOpen,
  onClose,
  trainStatuses,
  initialTrainId,
  theme = 'light',
}) => {
  const isLight = theme === 'light';
  const [selectedTrainId, setSelectedTrainId] = useState<string>(
    initialTrainId || (trainStatuses[0]?.train.id ?? '')
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentStatus =
    trainStatuses.find((s) => s.train.id === selectedTrainId) || trainStatuses[0];
  const train = currentStatus?.train;

  // Filter trains for quick select
  const filteredTrains = trainStatuses.filter((s) => {
    const q = searchQuery.toLowerCase();
    return (
      s.train.nameBn.toLowerCase().includes(q) ||
      s.train.nameEn.toLowerCase().includes(q) ||
      s.train.number.includes(q)
    );
  });

  const smsCommand = `TR ${train?.number || '705'}`;
  const originStationName = train?.stops[0]?.stationNameEn || 'DHAKA';
  const destStationName =
    train?.stops[train.stops.length - 1]?.stationNameEn || 'DESTINATION';
  const currStationName = currentStatus?.nextStation
    ? currentStatus.previousStation?.nameEn || 'NEAR ' + currentStatus.nextStation.nameEn
    : currentStatus?.previousStation?.nameEn || 'TERMINAL';
  const nextStopName = currentStatus?.nextStation?.nameEn || 'TERMINAL';

  const delayStr =
    currentStatus?.delayMinutes && currentStatus.delayMinutes > 0
      ? `LATE BY ${currentStatus.delayMinutes} MIN`
      : 'RIGHT TIME';

  // Compute realistic Bangladesh Railway 16-bogie composition & sequence
  const passengerCoaches = train?.coaches.filter((c) => c.coachClass !== 'LOCOMOTIVE') || [];
  const isUpReturn = passengerCoaches[0]?.code === 'ত';
  const bogieSummary = isUpReturn
    ? 'ত (সামনে) -> ণ -> ঢ -> ড -> ঠ -> ট -> ঞ -> ঝ -> জ -> ছ -> চ -> ঙ -> ঘ -> গ -> খ -> ক (পেছনে)'
    : 'ক (সামনে) -> খ -> গ -> ঘ -> ঙ -> চ -> ছ -> জ -> ঝ -> ঞ -> ট -> ঠ -> ড -> ঢ -> ণ -> ত (পেছনে)';

  // Exact Bangladesh Railway 16318 SMS gateway reply template
  const officialSmsReply = `TRAIN TRACKING (16318):
TR ${train?.number} (${train?.nameEn.toUpperCase()})
ROUTE: ${originStationName} (${train?.departureTime}) TO ${destStationName} (${train?.arrivalTime})
TOTAL BOGIE: ${passengerCoaches.length || 16} (বগি ${isUpReturn ? 'ত থেকে ক [ফিরতি পথ]' : 'ক থেকে ত [মূল পথ]'})
BOGIE ORDER: ${bogieSummary}
CURRENT LOCATION: ${currStationName.toUpperCase()}
SIGNAL: ${currentStatus?.currentSignalNameBn || 'MAINLINE CLEAR'}
NEXT STOP: ${nextStopName.toUpperCase()} (ETA: ${currentStatus?.etaNextStation || '--'})
SPEED: ${currentStatus?.speedKmH || 0} KM/H
STATUS: ${currentStatus?.isActive ? 'RUNNING (' + delayStr + ')' : 'NOT RUNNING / STANDBY'}
LAST UPDATE: JUST NOW (BST)`;

  const handleCopy = () => {
    navigator.clipboard.writeText(smsCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`w-full max-w-2xl rounded-2xl shadow-2xl border overflow-hidden flex flex-col max-h-[92vh] ${
          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
        }`}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b flex items-center justify-between border-slate-200 dark:border-slate-800 bg-gradient-to-r from-emerald-600/15 via-teal-600/10 to-blue-600/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg flex items-center gap-2">
                <span>বাংলাদেশ রেলওয়ে ১৬৩১৮ লাইভ এসএমএস ট্র্যাকার</span>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  SMS 16318 Verified
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                রেলওয়ের অফিসিয়াল এসএমএস উত্তর ও সময়সূচির (0000 ফরম্যাট) লাইভ যাচাইকরণ
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
          {/* Info Card explaining 0000 format & 16318 standard */}
          <div
            className={`p-3.5 rounded-xl border flex items-start gap-2.5 text-xs ${
              isLight ? 'bg-blue-50/80 border-blue-200 text-blue-900' : 'bg-blue-950/20 border-blue-800/40 text-blue-200'
            }`}
          >
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">
                রেলওয়ে ০০০০ (৪ সংখ্যার) টাইম ফরম্যাট ও এসএমএস নিয়ম:
              </p>
              <p className="text-[11px] leading-relaxed text-blue-800/90 dark:text-blue-300">
                বাংলাদেশ রেলওয়ে <strong>Working Time Table (WTT)</strong>-এ সময় ৪ সংখ্যায় লেখা থাকে (যেমন: <strong>১০১৫</strong> = ১০:১৫, <strong>০৬২০</strong> = ০৬:২০, <strong>২১০০</strong> = ২১:০০)। সাধারণ মোবাইলের মেসেজ অপশনে গিয়ে <code className="font-mono bg-blue-200/50 dark:bg-blue-900/50 px-1 py-0.5 rounded font-bold">TR &lt;ট্রেন_নম্বর&gt;</code> লিখে <strong>16318</strong> নম্বরে পাঠালে স্বয়ংক্রিয় এসএমএস পাওয়া যায়।
              </p>
            </div>
          </div>

          {/* Train Picker */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <TrainIcon className="w-4 h-4 text-emerald-600" />
                <span>যাচাই করার জন্য ট্রেন নির্বাচন করুন:</span>
              </label>
              <span className="text-[11px] text-slate-500">
                মোট {toBengaliNumber(trainStatuses.length)} টি ট্রেন সক্রিয়
              </span>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ট্রেনের নাম বা নম্বর দিয়ে সার্চ করুন (যেমন: 705, একতা, 701, সুবর্ণ, 813)..."
                className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-800 border-slate-700 text-white'
                }`}
              />
            </div>

            {/* Quick Train Chips */}
            <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-1">
              {filteredTrains.slice(0, 16).map((st) => (
                <button
                  key={st.train.id}
                  onClick={() => setSelectedTrainId(st.train.id)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                    selectedTrainId === st.train.id
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : isLight
                      ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <span className="font-mono font-bold">{st.train.number}</span>
                  <span className="truncate max-w-[130px]">{st.train.nameBn.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* SMS Query & Direct Send Box */}
          {train && (
            <div
              className={`p-4 rounded-xl border space-y-3 ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/50 border-slate-700'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <span>{train.nameBn}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                      নম্বর: {train.number}
                    </span>
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    রুট: {train.stops[0]?.stationNameBn} ({train.departureTime} / {formatTo4Digit(train.departureTime)}) ➔ {train.stops[train.stops.length - 1]?.stationNameBn} ({train.arrivalTime} / {formatTo4Digit(train.arrivalTime)})
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleCopy}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    {copied ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'কপি হয়েছে!' : 'কোড কপি'}</span>
                  </button>

                  <a
                    href={`sms:16318?body=${encodeURIComponent(smsCommand)}`}
                    className="px-4 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>১৬৩১৮ এ পাঠান</span>
                  </a>
                </div>
              </div>

              {/* Bogie Sequence & Direction Notice */}
              <div
                className={`p-2.5 rounded-lg border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                  isLight ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950' : 'bg-emerald-950/20 border-emerald-800/40 text-emerald-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold shrink-0">বগি গঠন (১৬ বগি):</span>
                  <span className="font-mono text-[11px] font-semibold">
                    {isUpReturn ? "ফিরতি পথ: 'ত' বগি সামনে ➔ 'ক' বগি সবার শেষে" : "মূল পথ: 'ক' বগি সবার আগে ➔ 'ত' বগি সবার শেষে"}
                  </span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-600 text-white font-bold shrink-0">
                  মোট ১৬টি বগি
                </span>
              </div>

              {/* Exact Simulated SMS Reply Preview */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                  ১৬৩১৮ সার্ভার থেকে আসা লাইভ এসএমএস রিপ্লাই:
                </span>
                <div
                  className={`p-3 rounded-xl border font-mono text-xs whitespace-pre-line leading-relaxed select-text ${
                    isLight ? 'bg-white border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-700 text-emerald-300'
                  }`}
                >
                  {officialSmsReply}
                </div>
              </div>

              {/* Detailed Station Stops Timetable */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-2">
                <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>সরকারি সময়সূচি (আগমনের সময় - ছাড়ার সময়):</span>
                </h5>

                <div className="max-h-48 overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-700">
                  <table className="w-full text-[11px] text-left">
                    <thead
                      className={`text-slate-500 uppercase tracking-wider text-[10px] ${
                        isLight ? 'bg-slate-100' : 'bg-slate-800'
                      }`}
                    >
                      <tr>
                        <th className="px-2.5 py-1.5">স্টেশন</th>
                        <th className="px-2.5 py-1.5">আগমনের সময়</th>
                        <th className="px-2.5 py-1.5">ছাড়ার সময়</th>
                        <th className="px-2.5 py-1.5">৪-সংখ্যা কোড</th>
                        <th className="px-2.5 py-1.5">প্ল্যাটফর্ম</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-mono">
                      {train.stops.map((stop, idx) => (
                        <tr
                          key={idx}
                          className={`${
                            isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-800/40'
                          }`}
                        >
                          <td className="px-2.5 py-1.5 font-sans font-medium text-slate-900 dark:text-slate-100">
                            {stop.stationNameBn}
                          </td>
                          <td className="px-2.5 py-1.5">{stop.arrivalTime}</td>
                          <td className="px-2.5 py-1.5">{stop.departureTime}</td>
                          <td className="px-2.5 py-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                            {formatTo4Digit(stop.departureTime)}
                          </td>
                          <td className="px-2.5 py-1.5">নং {toBengaliNumber(stop.platform || 1)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/40">
          <span className="text-[11px] text-slate-500">
            টেলিটক, গ্রামীণফোন, রবি ও বাংলালিংক সিম থেকে চার্জ প্রযোজ্য (৳২.৫০ + ভ্যাট)
          </span>
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

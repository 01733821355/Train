import React, { useState, useMemo } from 'react';
import {
  MessageSquare,
  Search,
  Send,
  CheckCircle,
  Clock,
  MapPin,
  Train as TrainIcon,
  X,
  Copy,
  Radio,
  AlertTriangle,
  Info,
  Sparkles,
  ArrowRight,
  Compass,
  Layers,
  Check,
  RotateCcw,
} from 'lucide-react';
import { LiveTrainStatus } from '../types';
import { toBengaliNumber, formatTo4Digit } from '../utils/geoUtils';
import { detectTrainFromSms, SAMPLE_SMS_MESSAGES, DetectedSmsResult } from '../utils/smsDetector';
import { SmsTrainCalibration } from '../utils/trackerEngine';

interface SmsTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  trainStatuses: LiveTrainStatus[];
  initialTrainId?: string;
  theme?: 'light' | 'dark';
  onSelectTrain?: (trainId: string) => void;
  onCalibrateTrain?: (calibration: SmsTrainCalibration) => void;
}

export const SmsTrackerModal: React.FC<SmsTrackerModalProps> = ({
  isOpen,
  onClose,
  trainStatuses,
  initialTrainId,
  theme = 'light',
  onSelectTrain,
  onCalibrateTrain,
}) => {
  const isLight = theme === 'light';

  // Active Tab: 'detect' (Auto SMS Detection) | 'query' (16318 SMS Code Generator)
  const [activeTab, setActiveTab] = useState<'detect' | 'query'>('detect');

  // Detection Tab States
  const [smsInputText, setSmsInputText] = useState<string>(SAMPLE_SMS_MESSAGES[0].text);
  const [detectionApplied, setDetectionApplied] = useState(false);

  // Query Tab States
  const [selectedTrainId, setSelectedTrainId] = useState<string>(
    initialTrainId || (trainStatuses[0]?.train.id ?? '')
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  // Auto-detect the SMS input in real-time
  const detectionResult: DetectedSmsResult = useMemo(() => {
    return detectTrainFromSms(smsInputText);
  }, [smsInputText]);

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

  const handleApplyDetection = () => {
    if (!detectionResult.success || !detectionResult.matchedTrain) return;

    if (onCalibrateTrain && detectionResult.detectedCoordinates && detectionResult.trainNumber) {
      onCalibrateTrain({
        trainNumber: detectionResult.trainNumber,
        lat: detectionResult.detectedCoordinates[0],
        lng: detectionResult.detectedCoordinates[1],
        delayMinutes: detectionResult.delayMinutes,
        currentStationName: detectionResult.currentStationName,
        nextStopName: detectionResult.nextStopName,
        nextStnDistanceKm: detectionResult.nextStnDistanceKm,
        remainingStopsCount: detectionResult.remainingStopsCount,
        updatedAt: Date.now(),
      });
    }

    if (onSelectTrain) {
      onSelectTrain(detectionResult.matchedTrain.id);
    }

    setDetectionApplied(true);
    setTimeout(() => {
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`w-full max-w-3xl rounded-2xl shadow-2xl border overflow-hidden flex flex-col max-h-[94vh] ${
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
                <span>বাংলাদেশ রেলওয়ে ১৬৩১৮ লাইভ এসএমএস ট্র্যাকার ও ডিটেকশন</span>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  Auto-Detection Engine
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                এসএমএস পেস্ট করে তাৎক্ষণিক লাইভ অবস্থান, বিলম্ব ও বগি বিন্যাস সনাক্তকরণ
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

        {/* Tab Switcher */}
        <div className="px-5 pt-3 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 bg-slate-50/50 dark:bg-slate-900/50">
          <button
            onClick={() => setActiveTab('detect')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'detect'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <span>অটো এসএমএস ডিটেকশন ও লাইভ ম্যাপ ট্র্যাকিং</span>
          </button>

          <button
            onClick={() => setActiveTab('query')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'query'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Radio className="w-4 h-4 text-teal-500" />
            <span>১৬৩১৮ এসএমএস কোড জেনারেটর ও সময়সূচি</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {activeTab === 'detect' ? (
            /* TAB 1: AUTO SMS DETECTION & PARSING */
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Presets Bar */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>দ্রুত টেস্ট স্যাম্পল (১-ক্লিকে চেক করুন):</span>
                  </span>
                  <span className="text-[11px] text-slate-500">আপনার মেসেজের সাথে মিলিয়ে দেখুন</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SAMPLE_SMS_MESSAGES.map((sample) => (
                    <button
                      key={sample.id}
                      onClick={() => {
                        setSmsInputText(sample.text);
                        setDetectionApplied(false);
                      }}
                      className={`text-left p-2.5 rounded-xl border text-xs transition-all cursor-pointer flex items-start gap-2 ${
                        smsInputText === sample.text
                          ? 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/30 text-emerald-950 dark:text-emerald-200 shadow-sm'
                          : isLight
                          ? 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                          : 'bg-slate-800/60 border-slate-700 hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="mt-0.5 w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center shrink-0">
                        {smsInputText === sample.text ? <Check className="w-3 h-3 text-emerald-600" /> : <TrainIcon className="w-2.5 h-2.5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold truncate">{sample.title}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 font-mono">
                          {sample.text.replace(/\n/g, ' • ')}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Textarea for Raw SMS */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                    <span>এখানে ১৬৩১৮ থেকে প্রাপ্ত এসএমএস টেক্সট লিখুন বা পেস্ট করুন:</span>
                  </label>
                  <button
                    onClick={() => {
                      setSmsInputText('');
                      setDetectionApplied(false);
                    }}
                    className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>ক্লিয়ার</span>
                  </button>
                </div>
                <textarea
                  value={smsInputText}
                  onChange={(e) => {
                    setSmsInputText(e.target.value);
                    setDetectionApplied(false);
                  }}
                  rows={6}
                  placeholder={`উদাহরণস্বরূপ:\n704: Provati\nDhaka-Chattogram\nLeft Dhaka at 08:32\nNow at: Laksham Jn\nNext stop: Gunoboti at 4th stn\nDelay: 01:46`}
                  className={`w-full p-3 rounded-xl text-xs font-mono border focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed ${
                    isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-800 border-slate-700 text-emerald-300'
                  }`}
                />
              </div>

              {/* Detection Result Card */}
              {detectionResult.success ? (
                <div
                  className={`p-4 rounded-xl border space-y-3.5 ${
                    isLight
                      ? 'bg-gradient-to-br from-emerald-50/90 to-teal-50/50 border-emerald-300 text-slate-900 shadow-sm'
                      : 'bg-gradient-to-br from-emerald-950/40 to-slate-900 border-emerald-700/60 text-white'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-emerald-500/20">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold font-mono text-base shadow-md">
                        {detectionResult.trainNumber}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm sm:text-base text-emerald-950 dark:text-emerald-100 flex items-center gap-2">
                          <span>{detectionResult.matchedTrain?.nameBn || detectionResult.trainName}</span>
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-600 text-white font-bold">
                            {detectionResult.matchedTrain?.nameEn || detectionResult.trainName}
                          </span>
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-300">
                          রুট: <strong className="font-semibold">{detectionResult.routeText}</strong> • দিক:{' '}
                          <span className="font-bold text-emerald-700 dark:text-emerald-400">
                            {detectionResult.direction === 'UP' ? 'UP (ফিরতি পথ / চট্টগ্রাম ➔ ঢাকা)' : 'DOWN (মূল পথ / ঢাকা ➔ চট্টগ্রাম)'}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleApplyDetection}
                        disabled={detectionApplied}
                        className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer ${
                          detectionApplied
                            ? 'bg-emerald-700 text-white'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white hover:shadow-emerald-600/30'
                        }`}
                      >
                        {detectionApplied ? (
                          <>
                            <Check className="w-4 h-4" />
                            <span>ম্যাপে প্রয়োগ করা হয়েছে!</span>
                          </>
                        ) : (
                          <>
                            <Compass className="w-4 h-4" />
                            <span>ম্যাপে লাইভ ট্র্যাক করুন</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* 4 Metrics Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {/* Metric 1: Location */}
                    <div className="p-2.5 rounded-lg bg-white/70 dark:bg-slate-800/70 border border-emerald-500/20 space-y-1">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-emerald-600" />
                        বর্তমান অবস্থান
                      </span>
                      <p className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                        {detectionResult.currentStationName || 'লাইনে অবস্থানরত'}
                      </p>
                      {detectionResult.nextStnDistanceKm && (
                        <p className="text-[10px] text-emerald-600 font-semibold">
                          দূরত্ব: {toBengaliNumber(detectionResult.nextStnDistanceKm)} কিমি
                        </p>
                      )}
                    </div>

                    {/* Metric 2: Next Stop */}
                    <div className="p-2.5 rounded-lg bg-white/70 dark:bg-slate-800/70 border border-emerald-500/20 space-y-1">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                        <ArrowRight className="w-3 h-3 text-blue-600" />
                        পরবর্তী স্টপেজ
                      </span>
                      <p className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                        {detectionResult.nextStopName || 'গন্তব্য স্টেশন'}
                      </p>
                      {detectionResult.remainingStopsCount && (
                        <p className="text-[10px] text-blue-600 font-semibold">
                          {toBengaliNumber(detectionResult.remainingStopsCount)}টি স্টেশন পর
                        </p>
                      )}
                    </div>

                    {/* Metric 3: Delay */}
                    <div className="p-2.5 rounded-lg bg-white/70 dark:bg-slate-800/70 border border-emerald-500/20 space-y-1">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-500" />
                        বিলম্ব / লেইট
                      </span>
                      <p
                        className={`font-bold text-xs sm:text-sm ${
                          detectionResult.delayMinutes > 30
                            ? 'text-amber-600 dark:text-amber-400'
                            : detectionResult.delayMinutes > 0
                            ? 'text-yellow-600 dark:text-yellow-400'
                            : 'text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        {detectionResult.delayMinutes > 0
                          ? `${toBengaliNumber(detectionResult.delayFormatted)} (${toBengaliNumber(detectionResult.delayMinutes)} মি.)`
                          : 'রাইট টাইম (সময়মতো)'}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {detectionResult.delayMinutes > 0 ? 'দেরিতে চলছে' : 'নির্ধারিত সময়'}
                      </p>
                    </div>

                    {/* Metric 4: Coaches & Coach Ka */}
                    <div className="p-2.5 rounded-lg bg-white/70 dark:bg-slate-800/70 border border-emerald-500/20 space-y-1">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                        <Layers className="w-3 h-3 text-purple-600" />
                        বগি সংখ্যা ও ক অবস্থান
                      </span>
                      <p className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                        মোট {toBengaliNumber(detectionResult.totalCoaches)}টি বগি
                      </p>
                      <p className="text-[10px] font-semibold text-purple-600 dark:text-purple-400">
                        বগি 'ক': {detectionResult.coachKaPosition === 'Last' ? 'সবার শেষে' : 'সবার আগে'}
                      </p>
                    </div>
                  </div>

                  {/* Bogie Rake Sequence Display */}
                  <div className="p-3 rounded-lg bg-emerald-950/10 dark:bg-slate-800/90 border border-emerald-500/30 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                        <TrainIcon className="w-3.5 h-3.5 text-emerald-600" />
                        <span>ডিটেক্টেড বগি ক্রমানুসার (১৬টি যাত্রীবাহী বগি):</span>
                      </span>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-600 text-white">
                        {detectionResult.coachKaPosition === 'Last' ? "ফিরতি ট্রেন: Coach 'Ka' at: Last" : "মূল ট্রেন: Coach 'Ka' at: First"}
                      </span>
                    </div>
                    <p className="font-mono text-[11px] text-emerald-900 dark:text-emerald-300 font-semibold select-text leading-relaxed">
                      {detectionResult.bogieSequenceSummary}
                    </p>
                  </div>
                </div>
              ) : (
                <div
                  className={`p-4 rounded-xl border flex items-center gap-3 text-xs ${
                    isLight ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-amber-950/20 border-amber-800/40 text-amber-200'
                  }`}
                >
                  <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                  <div>
                    <p className="font-bold">ডিটেকশন সম্পন্ন হয়নি</p>
                    <p className="text-[11px] text-amber-800 dark:text-amber-300">
                      {detectionResult.errorReason || 'অনুগ্রহ করে উপরের টেক্সটবক্সে সঠিক বাংলাদেশ রেলওয়ে এসএমএস ফরম্যাট প্রদান করুন।'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* TAB 2: MANUAL QUERY & 16318 TEMPLATE GENERATOR */
            <div className="space-y-4 animate-in fade-in duration-150">
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
                    placeholder="ট্রেনের নাম বা নম্বর দিয়ে সার্চ করুন (যেমন: 704, প্রভাতী, 703, গোধূলী, 758, দ্রুতযান)..."
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
                      <span>সরকারি সময়সূচি (আগমনের সময় - ছাড়ার সময়):</span>
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

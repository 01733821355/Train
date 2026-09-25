import React, { useState } from 'react';
import { LiveTrainStatus, Station, OnboardTripState } from '../types';
import { calculateDistanceKm, toBengaliNumber } from '../utils/geoUtils';
import {
  startContinuousAlarm,
  stopContinuousAlarm,
  playUrgentTrainAlarm,
  vibrateMobileDevice,
  speakStationAnnouncement,
} from '../utils/soundAlert';
import { Language, translations } from '../utils/i18n';
import { BANGLADESH_STATIONS } from '../data/stations';
import {
  Bell,
  BellRing,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  X,
  Volume2,
  Navigation2,
  Train as TrainIcon,
  ShieldCheck,
  Flag,
  VolumeX,
} from 'lucide-react';

interface OnboardTripModalProps {
  trainStatuses: LiveTrainStatus[];
  selectedTrainId: string | null;
  tripState: OnboardTripState | null;
  onStartTrip: (trainId: string, destinationStation: Station, alarmDistanceKm?: number) => void;
  onEndTrip: () => void;
  onRelocateTrain?: (trainId: string, userLat: number, userLng: number, speedKmH?: number, accuracyMeters?: number) => { success: boolean; distanceToTrackMeters: number; message: string };
  onClose: () => void;
  lang?: Language;
  theme: 'light' | 'dark';
}

export const OnboardTripModal: React.FC<OnboardTripModalProps> = ({
  trainStatuses,
  selectedTrainId,
  tripState,
  onStartTrip,
  onEndTrip,
  onRelocateTrain,
  onClose,
  lang = 'bn',
  theme,
}) => {
  const t = translations[lang] || translations.bn;
  const isLight = theme === 'light';

  const [chosenTrainId, setChosenTrainId] = useState<string>(
    tripState?.trainId || selectedTrainId || (trainStatuses[0]?.train.id ?? '')
  );
  const [chosenStationId, setChosenStationId] = useState<string>(
    tripState?.destinationStationId || ''
  );
  const [alarmDistanceKm, setAlarmDistanceKm] = useState<number>(
    tripState?.alarmDistanceKm || 2.0
  );
  const [isTestingAlarm, setIsTestingAlarm] = useState<boolean>(false);

  const [relocateFeedback, setRelocateFeedback] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });
  const [isLocatingForRelocate, setIsLocatingForRelocate] = useState(false);

  const currentTrainStatus = trainStatuses.find((s) => s.train.id === chosenTrainId);
  const activeTrainStops = currentTrainStatus?.train.stops || [];

  // Available destination stops along this train
  const availableDestinations = activeTrainStops.filter((stop) => {
    return stop.distanceKm > 0;
  });

  const handleStart = () => {
    if (!chosenTrainId || !chosenStationId) return;

    // First try to find in train stops
    const destStop = activeTrainStops.find((s) => s.stationId === chosenStationId);
    
    // Find accurate coordinates from BANGLADESH_STATIONS
    const knownStation = BANGLADESH_STATIONS.find(
      (s) =>
        s.id === chosenStationId ||
        (destStop && s.nameBn.includes(destStop.stationNameBn)) ||
        (destStop && s.nameEn.toLowerCase() === destStop.stationNameEn.toLowerCase())
    );

    const lat = knownStation
      ? knownStation.lat
      : currentTrainStatus?.train.routeCoordinates[
          currentTrainStatus.train.routeCoordinates.length - 1
        ]?.[0] || 23.85;

    const lng = knownStation
      ? knownStation.lng
      : currentTrainStatus?.train.routeCoordinates[
          currentTrainStatus.train.routeCoordinates.length - 1
        ]?.[1] || 90.35;

    const targetStation: Station = {
      id: chosenStationId,
      code: knownStation?.code || chosenStationId,
      nameBn: destStop?.stationNameBn || knownStation?.nameBn || chosenStationId,
      nameEn: destStop?.stationNameEn || knownStation?.nameEn || chosenStationId,
      division: knownStation?.division || 'Dhaka',
      district: knownStation?.district || 'Dhaka',
      zone: currentTrainStatus?.train.zone === 'west' ? 'west' : 'east',
      platforms: knownStation?.platforms || 2,
      lat,
      lng,
    };

    onStartTrip(chosenTrainId, targetStation, alarmDistanceKm);
  };

  const handleTestAlarm = () => {
    if (isTestingAlarm) {
      stopContinuousAlarm();
      setIsTestingAlarm(false);
    } else {
      setIsTestingAlarm(true);
      const testName =
        currentTrainStatus?.train.nameBn ? `${currentTrainStatus.train.nameBn}-এর গন্তব্য` : 'গন্তব্য স্টেশন';
      startContinuousAlarm(testName, lang);
      // Auto stop after 6 seconds
      setTimeout(() => {
        stopContinuousAlarm();
        setIsTestingAlarm(false);
      }, 6000);
    }
  };

  const handleRequestRelocate = () => {
    if (!navigator.geolocation) {
      setRelocateFeedback({
        type: 'error',
        message: lang === 'bn' ? 'ব্রাউজারে GPS লোকেশন সুবিধা নেই' : 'Geolocation not supported',
      });
      return;
    }

    setIsLocatingForRelocate(true);
    setRelocateFeedback({ type: null, message: '' });

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocatingForRelocate(false);
        const speedKmH = pos.coords.speed !== null && pos.coords.speed !== undefined
          ? Math.round(pos.coords.speed * 3.6)
          : undefined;

        if (onRelocateTrain) {
          const result = onRelocateTrain(
            chosenTrainId,
            pos.coords.latitude,
            pos.coords.longitude,
            speedKmH,
            pos.coords.accuracy
          );
          setRelocateFeedback({
            type: result.success ? 'success' : 'error',
            message: result.message,
          });
        } else {
          setRelocateFeedback({
            type: 'success',
            message:
              lang === 'bn'
                ? `আপনার লাইভ GPS লোকেশন ট্রেনের অবস্থানের সাথে সমন্বয় করা হয়েছে (সঠিকতা: ±${Math.round(pos.coords.accuracy)} মি.)।`
                : `Live GPS synced with train position (accuracy: ±${Math.round(pos.coords.accuracy)}m).`,
          });
        }
      },
      () => {
        setIsLocatingForRelocate(false);
        setRelocateFeedback({
          type: 'error',
          message:
            lang === 'bn'
              ? 'GPS অবস্থান পাওয়া যায়নি। মোবাইলের লোকেশন অনুমতি চালু করুন।'
              : 'GPS location permission denied.',
        });
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`w-full max-w-lg rounded-2xl shadow-2xl border overflow-hidden flex flex-col max-h-[92vh] ${
          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
        }`}
      >
        {/* Header */}
        <div className="px-4 py-3.5 border-b flex items-center justify-between border-slate-200 dark:border-slate-800 bg-gradient-to-r from-emerald-600/15 via-teal-600/10 to-blue-600/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30">
              <TrainIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base flex items-center gap-2">
                <span>আমি এই ট্রেনে আছি</span>
                {tripState?.isActive && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500 text-white animate-pulse">
                    ট্রিপ ও অ্যালার্ম সচল
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                গন্তব্য স্টেশন নির্বাচন করুন — স্টেশন পৌঁছালে মোবাইলে অ্যালার্ম বাজবে
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              if (isTestingAlarm) stopContinuousAlarm();
              onClose();
            }}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 overflow-y-auto">
          {/* Active Trip Info */}
          {tripState?.isActive ? (
            <div className="space-y-3.5">
              <div className="p-4 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                    <div>
                      <span className="font-bold text-sm text-emerald-800 dark:text-emerald-300 block">
                        {tripState.trainNameBn} ({currentTrainStatus?.train.number || ''})
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        {currentTrainStatus?.currentBlockSectionBn || 'ট্র্যাকে চলমান'}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold px-2 py-1 rounded-lg bg-emerald-600/20 text-emerald-700 dark:text-emerald-300">
                    {toBengaliNumber(currentTrainStatus?.speedKmH || 0)} কিমি/ঘ
                  </span>
                </div>

                <div className="pt-2.5 border-t border-emerald-500/20 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block">আপনার গন্তব্য:</span>
                    <strong className="text-slate-900 dark:text-white flex items-center gap-1.5 font-bold text-sm mt-0.5">
                      <Flag className="w-4 h-4 text-rose-500" />
                      {lang === 'bn' ? tripState.destinationStationNameBn : tripState.destinationStationNameEn}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block">অ্যালার্ম দূরত্ব:</span>
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 mt-0.5">
                      <BellRing className="w-3.5 h-3.5" />
                      {toBengaliNumber(tripState.alarmDistanceKm || 2)} কিমি আগে
                    </span>
                  </div>
                </div>

                {/* Live Railway Signal & Crowdsource Badge */}
                {currentTrainStatus?.currentSignalNameBn && (
                  <div className="pt-2 border-t border-emerald-500/20 text-xs">
                    <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">
                      বর্তমান রেলওয়ে সিগন্যাল:
                    </span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5 mt-0.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      {currentTrainStatus.currentSignalNameBn}
                    </span>
                  </div>
                )}

                {currentTrainStatus?.isCrowdsourcedGpsCalibrated && (
                  <div className="p-2 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>যাত্রী GPS দিয়ে ট্রেনের গতিপথ ও বিলম্ব সফলভাবে ক্যালিব্রেটেড!</span>
                  </div>
                )}
              </div>

              {/* Passenger Relocate Option */}
              <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 bg-slate-50 dark:bg-slate-800/40">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-indigo-500" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    যাত্রী GPS লোকেশন দিয়ে রিলোকেট
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  আপনি ট্রেনে থাকা অবস্থায় GPS দিয়ে ট্রেনের লাইভ অবস্থান সিঙ্ক করতে পারেন।
                </p>

                <button
                  type="button"
                  onClick={handleRequestRelocate}
                  disabled={isLocatingForRelocate}
                  className="w-full py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow disabled:opacity-50"
                >
                  <Navigation2 className={`w-4 h-4 ${isLocatingForRelocate ? 'animate-spin' : ''}`} />
                  <span>
                    {isLocatingForRelocate ? 'GPS অবস্থান খোঁজা হচ্ছে...' : 'আমার GPS দিয়ে ট্রেন অবস্থান সিঙ্ক করুন'}
                  </span>
                </button>

                {relocateFeedback.type && (
                  <div
                    className={`p-2.5 rounded-lg text-xs font-semibold flex items-start gap-1.5 ${
                      relocateFeedback.type === 'success'
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                        : 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    {relocateFeedback.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
                    )}
                    <span>{relocateFeedback.message}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleTestAlarm}
                  className={`flex-1 py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    isTestingAlarm
                      ? 'bg-amber-600 text-white border-amber-500'
                      : 'border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {isTestingAlarm ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-amber-500" />}
                  <span>{isTestingAlarm ? 'অ্যালার্ম থামান' : 'অ্যালার্ম পরীক্ষা'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    stopContinuousAlarm();
                    setIsTestingAlarm(false);
                    onEndTrip();
                  }}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-lg cursor-pointer"
                >
                  <span>ট্রিপ শেষ করুন</span>
                </button>
              </div>
            </div>
          ) : (
            /* Configure Trip Form */
            <div className="space-y-4">
              {/* Select Train */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <TrainIcon className="w-3.5 h-3.5 text-emerald-500" />
                  <span>আপনি কোন ট্রেনে আছেন?</span>
                </label>
                <select
                  value={chosenTrainId}
                  onChange={(e) => {
                    setChosenTrainId(e.target.value);
                    setChosenStationId('');
                  }}
                  className={`w-full p-2.5 rounded-xl border text-xs font-medium transition-colors cursor-pointer ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 text-slate-900 focus:bg-white'
                      : 'bg-slate-800 border-slate-700 text-white focus:bg-slate-750'
                  }`}
                >
                  {trainStatuses.map((st) => {
                    const originName = st.train.stops[0]?.stationNameBn || st.train.originStationId;
                    const destName = st.train.stops[st.train.stops.length - 1]?.stationNameBn || st.train.destinationStationId;
                    return (
                      <option key={st.train.id} value={st.train.id}>
                        {st.train.nameBn} ({st.train.number}) — {originName} থেকে {destName}{' '}
                        {st.isActive ? '• চলমান' : ''}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Select Destination Station */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Flag className="w-3.5 h-3.5 text-rose-500" />
                  <span>কোথায় নামবেন? (গন্তব্য স্টেশন নির্বাচন করুন):</span>
                </label>
                <select
                  value={chosenStationId}
                  onChange={(e) => setChosenStationId(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border text-xs font-medium transition-colors cursor-pointer ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 text-slate-900 focus:bg-white'
                      : 'bg-slate-800 border-slate-700 text-white focus:bg-slate-750'
                  }`}
                >
                  <option value="">-- গন্তব্য স্টেশন নির্বাচন করুন --</option>
                  {availableDestinations.length > 0 ? (
                    <optgroup label="এই ট্রেনের রুট ও স্টপেজ">
                      {availableDestinations.map((stop) => (
                        <option key={stop.stationId} value={stop.stationId}>
                          📍 {stop.stationNameBn} ({stop.stationNameEn}) — পৌঁছানোর সময় {stop.arrivalTime}
                        </option>
                      ))}
                    </optgroup>
                  ) : null}
                  <optgroup label="বাংলাদেশের প্রধান স্টেশনসমূহ">
                    {BANGLADESH_STATIONS.slice(0, 45).map((st) => (
                      <option key={st.id} value={st.id}>
                        🚉 {st.nameBn} ({st.nameEn})
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {/* Select Alarm Distance */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-amber-500" />
                  <span>স্টেশন আসার কতটুকু আগে অ্যালার্ম বাজবে?</span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { dist: 1.0, label: '১ কিমি' },
                    { dist: 2.0, label: '২ কিমি', badge: 'সেরা' },
                    { dist: 3.0, label: '৩ কিমি' },
                    { dist: 5.0, label: '৫ কিমি' },
                  ].map((opt) => (
                    <button
                      key={opt.dist}
                      type="button"
                      onClick={() => setAlarmDistanceKm(opt.dist)}
                      className={`py-2 px-1.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center transition-all cursor-pointer ${
                        alarmDistanceKm === opt.dist
                          ? 'bg-emerald-600 text-white border-emerald-500 shadow-md ring-2 ring-emerald-500/30'
                          : isLight
                          ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
                          : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {opt.badge && (
                        <span
                          className={`text-[9px] px-1 rounded-full font-bold mt-0.5 ${
                            alarmDistanceKm === opt.dist ? 'bg-white/30 text-white' : 'bg-emerald-500/20 text-emerald-600'
                          }`}
                        >
                          {opt.badge}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Info Note */}
              <div className="p-3.5 rounded-2xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/70 dark:bg-blue-950/40 text-xs space-y-1.5 text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-1.5 font-bold text-blue-600 dark:text-blue-400">
                  <Bell className="w-4 h-4" />
                  <span>স্মার্ট গন্তব্য এলার্ম ও ভাইব্রেশন</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  ট্রেন আপনার নির্বাচিত গন্তব্যের <strong>{toBengaliNumber(alarmDistanceKm)} কিমি</strong> দূরত্বে পৌঁছালেই স্বয়ংক্রিয়ভাবে মোবাইলে লাউড অ্যালার্ম ও ভাইব্রেশন চালু হবে এবং অডিও ঘোষণা আসবে।
                </p>
                <div className="pt-1 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleTestAlarm}
                    className={`text-[11px] font-bold flex items-center gap-1 px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                      isTestingAlarm
                        ? 'bg-amber-600 text-white border-amber-500'
                        : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-amber-600 hover:bg-amber-50'
                    }`}
                  >
                    {isTestingAlarm ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    <span>{isTestingAlarm ? 'অ্যালার্ম থামান' : 'অ্যালার্ম সাউন্ড পরীক্ষা করুন'}</span>
                  </button>
                </div>
              </div>

              {/* Start Trip Button */}
              <button
                type="button"
                onClick={handleStart}
                disabled={!chosenTrainId || !chosenStationId}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-extrabold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xl shadow-emerald-600/30"
              >
                <BellRing className="w-4 h-4 animate-bounce" />
                <span>ট্র্যাকিং ও অ্যালার্ম চালু করুন</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

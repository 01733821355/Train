import React, { useState, useEffect, useMemo } from 'react';
import { BANGLADESH_TRAINS } from './data/trains';
import { Station, LiveTrainStatus, ScreenCustomizationSettings, DEFAULT_SCREEN_SETTINGS, OnboardTripState, MonetizationState } from './types';
import { computeTrainLiveStatus, getCurrentBSTMinutes, getCurrentBSTDateInfo } from './utils/trackerEngine';
import { formatMinutesToTime, toBengaliNumber, calculateDistanceKm, getRatioAlongPath } from './utils/geoUtils';
import { startContinuousAlarm, stopContinuousAlarm, triggerBrowserNotification } from './utils/soundAlert';
import { Language } from './utils/i18n';
import { Navbar } from './components/Navbar';
import { LiveRailMap } from './components/LiveRailMap';
import { TrainListSidebar } from './components/TrainListSidebar';
import { BogieInspector } from './components/BogieInspector';
import { AutonomousTrafficMonitor } from './components/AutonomousTrafficMonitor';
import { StationDeparturesModal } from './components/StationDeparturesModal';
import { GoogleTrafficScannerModal } from './components/GoogleTrafficScannerModal';
import { TicketBookingModal } from './components/TicketBookingModal';
import { OnboardTripModal } from './components/OnboardTripModal';
import { ScreenCustomizationModal } from './components/ScreenCustomizationModal';
import { SettingsView } from './components/SettingsView';
import { AdBanner } from './components/AdBanner';
import { SmsTrackerModal } from './components/SmsTrackerModal';
import { MonetizationDashboardModal } from './components/MonetizationDashboardModal';
import { RewardedAdModal } from './components/RewardedAdModal';
import { MapPin, Train as TrainIcon, Layers, Eye, Compass, Clock, ListFilter, AlertTriangle, Activity, Ticket, Sliders, Settings, BellRing, MessageSquare, DollarSign, Sparkles } from 'lucide-react';

export default function App() {
  // Language state
  const [lang, setLang] = useState<Language>('bn');

  // Theme state: default to 'light' as requested by user
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Screen customization settings (user configurable options)
  const [screenSettings, setScreenSettings] = useState<ScreenCustomizationSettings>(() => {
    try {
      const saved = localStorage.getItem('bd_rail_screen_settings');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_SCREEN_SETTINGS;
  });
  const [isScreenSettingsModalOpen, setIsScreenSettingsModalOpen] = useState<boolean>(false);

  const handleUpdateScreenSettings = (newSettings: ScreenCustomizationSettings) => {
    setScreenSettings(newSettings);
    try {
      localStorage.setItem('bd_rail_screen_settings', JSON.stringify(newSettings));
    } catch (e) {}
  };

  // Monetization & Ad Revenue State (আয় ও বিজ্ঞাপন কন্ট্রোল)
  const [monetization, setMonetization] = useState<MonetizationState>(() => {
    try {
      const saved = localStorage.getItem('bd_rail_monetization');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      impressions: 215,
      clicks: 18,
      earningsBdt: 124.5,
      isVipUnlocked: false,
      publisherId: 'ca-pub-9842104928172901',
      adFrequency: 'standard',
    };
  });

  const handleUpdateMonetization = (updated: Partial<MonetizationState>) => {
    setMonetization((prev) => {
      const next = { ...prev, ...updated };
      try {
        localStorage.setItem('bd_rail_monetization', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  const handleAdClick = (payoutBdt: number) => {
    handleUpdateMonetization({
      clicks: monetization.clicks + 1,
      earningsBdt: monetization.earningsBdt + payoutBdt,
    });
  };

  const handleAdImpression = () => {
    handleUpdateMonetization({
      impressions: monetization.impressions + 1,
      earningsBdt: monetization.earningsBdt + 0.05,
    });
  };

  const handleRewardGranted = (rewardAmountBdt: number) => {
    handleUpdateMonetization({
      earningsBdt: monetization.earningsBdt + rewardAmountBdt,
      isVipUnlocked: true,
    });
  };

  // Modals state
  const [isSmsTrackerModalOpen, setIsSmsTrackerModalOpen] = useState<boolean>(false);
  const [isMonetizationModalOpen, setIsMonetizationModalOpen] = useState<boolean>(false);
  const [isRewardedAdModalOpen, setIsRewardedAdModalOpen] = useState<boolean>(false);

  // Clock state
  const [timeMinutes, setTimeMinutes] = useState<number>(() => getCurrentBSTMinutes());
  const [isRealTime, setIsRealTime] = useState<boolean>(true);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [autoRadarEnabled, setAutoRadarEnabled] = useState<boolean>(true);

  // Selected entities: default to 'coxsbazar-813' (valid ID)
  const [selectedTrainId, setSelectedTrainId] = useState<string>('coxsbazar-813');
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [isTrafficScannerOpen, setIsTrafficScannerOpen] = useState<boolean>(false);

  // E-Ticket modal state
  const [isTicketModalOpen, setIsTicketModalOpen] = useState<boolean>(false);
  const [ticketInitialTrainId, setTicketInitialTrainId] = useState<string | undefined>(undefined);

  // On-Board Trip & Arrival Alarm State ("আমি এই ট্রেনে আছি")
  const [tripState, setTripState] = useState<OnboardTripState | null>(() => {
    try {
      const saved = localStorage.getItem('bd_rail_onboard_trip');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return null;
  });
  const [isOnboardModalOpen, setIsOnboardModalOpen] = useState<boolean>(false);

  useEffect(() => {
    try {
      if (tripState) {
        localStorage.setItem('bd_rail_onboard_trip', JSON.stringify(tripState));
      } else {
        localStorage.removeItem('bd_rail_onboard_trip');
      }
    } catch (e) {}
  }, [tripState]);

  // Continuous real-time GPS tracking for onboard passengers
  // When an active trip is ongoing, we track user's real GPS, snap to track, and calibrate train speed/position
  useEffect(() => {
    if (!tripState?.isActive || typeof navigator === 'undefined' || !navigator.geolocation) {
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const uLat = pos.coords.latitude;
        const uLng = pos.coords.longitude;
        const speedKmH = pos.coords.speed !== null && pos.coords.speed !== undefined
          ? Math.round(pos.coords.speed * 3.6)
          : undefined;
        const accuracy = pos.coords.accuracy;

        const targetTrain = BANGLADESH_TRAINS.find((t) => t.id === tripState.trainId);
        let snappedLat = uLat;
        let snappedLng = uLng;

        if (targetTrain) {
          const ratioCheck = getRatioAlongPath(targetTrain.routeCoordinates, uLat, uLng);
          if (ratioCheck.closestDistKm <= 12.0) {
            snappedLat = ratioCheck.snappedLat;
            snappedLng = ratioCheck.snappedLng;
          }
        }

        const distToDest = calculateDistanceKm(snappedLat, snappedLng, tripState.destLat, tripState.destLng);

        // Check alarm proximity
        if (distToDest <= (tripState.alarmDistanceKm || 2.0) && !tripState.alarmTriggered && !tripState.alarmDismissed) {
          handleAlarmTriggered();
        }

        setTripState((prev) => {
          if (!prev || !prev.isActive) return prev;
          return {
            ...prev,
            userLat: snappedLat,
            userLng: snappedLng,
            userSpeedKmH: speedKmH,
            userAccuracyMeters: accuracy,
            distanceToDestKm: distToDest,
            lastGpsSyncTime: Date.now(),
            isGpsTrackingActive: true,
            crowdsourcedCalibrationActive: true,
          };
        });
      },
      (err) => {
        console.warn('Geolocation error:', err.message);
      },
      { enableHighAccuracy: true, maximumAge: 3000, timeout: 10000 }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [tripState?.isActive, tripState?.trainId, tripState?.destLat, tripState?.destLng, tripState?.alarmDistanceKm, tripState?.alarmTriggered, tripState?.alarmDismissed]);

  const handleRelocateTrain = (
    trainId: string,
    userLat: number,
    userLng: number,
    speedKmH?: number,
    accuracyMeters?: number
  ) => {
    const targetTrain = BANGLADESH_TRAINS.find((t) => t.id === trainId);
    if (!targetTrain) {
      return { success: false, distanceToTrackMeters: 0, message: 'ট্রেন পাওয়া যায়নি' };
    }

    const check = getRatioAlongPath(targetTrain.routeCoordinates, userLat, userLng);
    const distMeters = Math.round(check.closestDistKm * 1000);

    if (check.closestDistKm > 15.0) {
      return {
        success: false,
        distanceToTrackMeters: distMeters,
        message: `আপনি রেললাইন থেকে প্রায় ${toBengaliNumber(check.closestDistKm.toFixed(1))} কিমি দূরে আছেন। ট্রেনে উঠে পুনরায় চেষ্টা করুন।`,
      };
    }

    setTripState((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        userLat: check.snappedLat,
        userLng: check.snappedLng,
        userSpeedKmH: speedKmH,
        userAccuracyMeters: accuracyMeters,
        lastGpsSyncTime: Date.now(),
        crowdsourcedCalibrationActive: true,
      };
    });

    return {
      success: true,
      distanceToTrackMeters: distMeters,
      message: `ট্র্যাকের সাথে সফলভাবে সিঙ্ক সম্পন্ন! রেললাইন থেকে বিচ্যুতি: ${toBengaliNumber(distMeters)} মিটার। ট্রেনের গতি ও গতিপথ ক্যালিব্রেটেড।`,
    };
  };

  const handleStartTrip = (trainId: string, destinationStation: Station, alarmDistanceKm?: number) => {
    const targetTrain = BANGLADESH_TRAINS.find((t) => t.id === trainId);
    if (!targetTrain) return;

    setTripState({
      isActive: true,
      trainId,
      trainNameBn: targetTrain.nameBn,
      trainNameEn: targetTrain.nameEn,
      destinationStationId: destinationStation.id,
      destinationStationNameBn: destinationStation.nameBn,
      destinationStationNameEn: destinationStation.nameEn,
      destLat: destinationStation.lat,
      destLng: destinationStation.lng,
      alarmDistanceKm: alarmDistanceKm || 2.0,
      alarmTriggered: false,
      alarmDismissed: false,
      isGpsTrackingActive: true,
      crowdsourcedCalibrationActive: true,
    });
    setSelectedTrainId(trainId);
    setIsOnboardModalOpen(false);

    // Request notification permission if available
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  const handleEndTrip = () => {
    stopContinuousAlarm();
    setTripState(null);
    setIsOnboardModalOpen(false);
  };

  const handleAlarmTriggered = () => {
    if (!tripState || tripState.alarmTriggered) return;

    setTripState((prev) => (prev ? { ...prev, alarmTriggered: true } : null));

    // Play urgent sound + vibration + voice
    startContinuousAlarm(
      lang === 'bn' ? tripState.destinationStationNameBn : tripState.destinationStationNameEn,
      lang
    );

    // Trigger mobile browser notification
    triggerBrowserNotification(
      lang === 'bn'
        ? `⚠️ গন্তব্য স্টেশন ${tripState.destinationStationNameBn} এসে গেছে!`
        : `⚠️ Approaching ${tripState.destinationStationNameEn}!`,
      lang === 'bn'
        ? `${tripState.trainNameBn} ট্রেনের যাত্রা সমাপ্তির পথে। এখনই নামার প্রস্তুতি নিন!`
        : `Prepare to disembark from ${tripState.trainNameEn} now.`
    );
  };

  const handleAlarmDismissed = () => {
    stopContinuousAlarm();
    setTripState((prev) => (prev ? { ...prev, alarmDismissed: true } : null));
  };

  // Active tab on mobile/desktop: 'map' | 'trains' | 'bogie' | 'settings'
  const [activeTab, setActiveTab] = useState<'map' | 'trains' | 'bogie' | 'settings'>('map');

  const handleOpenTicketBooking = (trainId?: string) => {
    setTicketInitialTrainId(trainId || selectedTrainId);
    setIsTicketModalOpen(true);
  };

  const isLight = theme === 'light';

  // Real-time ticking effect
  useEffect(() => {
    if (!isRealTime) return;

    const interval = setInterval(() => {
      setTimeMinutes(getCurrentBSTMinutes());
    }, 2000);

    return () => clearInterval(interval);
  }, [isRealTime]);

  // Simulation playback effect
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setTimeMinutes((prev) => (prev + 1) % 1440);
    }, 400);

    return () => clearInterval(interval);
  }, [isPlaying]);

  // Compute live status for all trains at current time, honoring weekly off days and passenger crowdsourced GPS
  const currentBSTDayInfo = useMemo(() => getCurrentBSTDateInfo(), [timeMinutes]);

  const trainStatuses: LiveTrainStatus[] = useMemo(() => {
    return BANGLADESH_TRAINS.map((train) => {
      const crowdsourceGps =
        tripState?.isActive && tripState.trainId === train.id && tripState.userLat && tripState.userLng
          ? {
              userLat: tripState.userLat,
              userLng: tripState.userLng,
              speedKmH: tripState.userSpeedKmH,
              accuracyMeters: tripState.userAccuracyMeters,
            }
          : undefined;

      return computeTrainLiveStatus(
        train,
        timeMinutes,
        1.0,
        currentBSTDayInfo.dayOfWeekEn,
        crowdsourceGps
      );
    });
  }, [
    timeMinutes,
    currentBSTDayInfo,
    tripState?.isActive,
    tripState?.trainId,
    tripState?.userLat,
    tripState?.userLng,
    tripState?.userSpeedKmH,
    tripState?.userAccuracyMeters,
  ]);

  // Find currently selected train's status
  const selectedStatus = useMemo(() => {
    return trainStatuses.find((s) => s.train.id === selectedTrainId) || trainStatuses[0] || null;
  }, [trainStatuses, selectedTrainId]);

  // Autonomous Train Auto-Lock:
  // Automatically select an active train on track if current selection is offline or on off-day
  useEffect(() => {
    if (!autoRadarEnabled) return;
    if (selectedStatus && (!selectedStatus.isActive || selectedStatus.isOffDay)) {
      const firstActive = trainStatuses.find((s) => s.isActive && !s.isOffDay);
      if (firstActive && firstActive.train.id !== selectedTrainId) {
        setSelectedTrainId(firstActive.train.id);
      }
    }
  }, [autoRadarEnabled, selectedStatus, trainStatuses, selectedTrainId]);

  const activeTrains = useMemo(() => {
    return trainStatuses.filter((s) => s.isActive && !s.isOffDay);
  }, [trainStatuses]);

  const activeTrainsCount = activeTrains.length;
  const lateTrainsCount = activeTrains.filter((s) => s.predictiveDelay?.isLate).length;

  const currentBSTFormatted = useMemo(() => {
    return formatMinutesToTime(timeMinutes, true);
  }, [timeMinutes]);

  // Handlers
  const handleResetToRealTime = () => {
    setIsRealTime(true);
    setIsPlaying(false);
    setTimeMinutes(getCurrentBSTMinutes());
  };

  const handleChangeTime = (newMins: number) => {
    setIsRealTime(false);
    setTimeMinutes(newMins);
  };

  const handleTogglePlay = () => {
    if (!isPlaying) {
      setIsRealTime(false);
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  };

  const handleJumpToNextActiveTrain = () => {
    const activeList = trainStatuses.filter((s) => s.isActive && !s.isOffDay);
    if (activeList.length === 0) return;
    const currentIndex = activeList.findIndex((s) => s.train.id === selectedTrainId);
    const nextIndex = (currentIndex + 1) % activeList.length;
    setSelectedTrainId(activeList[nextIndex].train.id);
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <div
      className={`flex flex-col h-screen w-screen overflow-hidden font-sans select-none transition-colors ${
        isLight ? 'bg-slate-100 text-slate-900' : 'bg-slate-950 text-slate-100'
      }`}
    >
      {/* Top Navbar */}
      <Navbar
        currentBSTFormatted={currentBSTFormatted}
        isRealTime={isRealTime}
        onResetToRealTime={handleResetToRealTime}
        isPlaying={isPlaying}
        onTogglePlay={handleTogglePlay}
        timeMinutes={timeMinutes}
        onChangeTime={handleChangeTime}
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenTicketBooking={() => handleOpenTicketBooking()}
        onOpenSettings={() => setActiveTab(activeTab === 'settings' ? 'map' : 'settings')}
        onOpenSmsTracker={() => setIsSmsTrackerModalOpen(true)}
        onOpenMonetization={() => setIsMonetizationModalOpen(true)}
        activeTab={activeTab}
        lang={lang}
        onToggleLang={() => setLang((prev) => (prev === 'bn' ? 'en' : 'bn'))}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Left Sidebar: Full height on desktop; On mobile visible when activeTab === 'trains' */}
        <aside
          className={`w-full lg:w-80 xl:w-96 shrink-0 z-20 transition-all ${
            activeTab === 'trains'
              ? isLight
                ? 'flex flex-col h-full bg-white'
                : 'flex flex-col h-full bg-slate-900'
              : 'hidden lg:flex lg:flex-col lg:h-full'
          }`}
        >
          <TrainListSidebar
            statuses={trainStatuses}
            selectedTrainId={selectedTrainId}
            onSelectTrain={(id) => {
              setSelectedTrainId(id);
              if (window.innerWidth < 1024) {
                setActiveTab('map');
              }
            }}
            theme={theme}
            onOpenTicketBooking={handleOpenTicketBooking}
          />
        </aside>

        {/* Center/Right Main Section */}
        <main
          className={`flex-1 flex flex-col h-full overflow-hidden p-1 sm:p-3 md:p-4 gap-1.5 sm:gap-2.5 ${
            isLight ? 'bg-slate-100' : 'bg-slate-950'
          } ${activeTab === 'trains' ? 'hidden lg:flex' : 'flex'}`}
        >
          {/* Top Sponsored Ad Banner (Monetization Engine) */}
          {screenSettings.showAdBanners && (
            <div className="shrink-0">
              <AdBanner
                placement="top-banner"
                theme={theme}
                onAdClick={handleAdClick}
                onAdImpression={handleAdImpression}
                onOpenMonetizationDashboard={() => setIsMonetizationModalOpen(true)}
              />
            </div>
          )}

          {/* Autonomous Traffic Monitor Bar (Collapsible/Hidden on small mobile screens to keep map massive) */}
          <div className="hidden sm:block">
            <AutonomousTrafficMonitor
              currentBSTFormatted={currentBSTFormatted}
              activeTrainsCount={activeTrainsCount}
              totalTrainsCount={BANGLADESH_TRAINS.length}
              selectedStatus={selectedStatus}
              autoRadarEnabled={autoRadarEnabled}
              onToggleAutoRadar={() => setAutoRadarEnabled(!autoRadarEnabled)}
              onJumpToNextActiveTrain={handleJumpToNextActiveTrain}
              onOpenTicketBooking={() => handleOpenTicketBooking()}
              theme={theme}
            />
          </div>

          {/* Desktop View Switcher Bar */}
          <div className="hidden sm:flex items-center justify-between flex-wrap gap-2">
            <div
              className={`flex items-center gap-1.5 p-1 rounded-xl border text-xs ${
                isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-800'
              }`}
            >
              <button
                id="view-map-tab-btn"
                onClick={() => setActiveTab('map')}
                className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'map'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : isLight
                    ? 'text-slate-600 hover:text-slate-900'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>লাইভ রেলওয়ে ম্যাপ</span>
              </button>

              <button
                id="view-bogie-tab-btn"
                onClick={() => setActiveTab('bogie')}
                className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'bogie'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : isLight
                    ? 'text-slate-600 hover:text-slate-900'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <TrainIcon className="w-3.5 h-3.5" />
                <span>বগি ও আসন বিন্যাস</span>
              </button>

              <button
                id="view-ticket-booking-tab-btn"
                onClick={() => handleOpenTicketBooking()}
                className="px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm"
              >
                <Ticket className="w-3.5 h-3.5" />
                <span>অনলাইন ই-টিকেট কাটুন</span>
              </button>

              {/* 16318 SMS Verification Button */}
              <button
                onClick={() => setIsSmsTrackerModalOpen(true)}
                className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isLight
                    ? 'bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100'
                    : 'bg-teal-950/40 text-teal-300 border border-teal-800 hover:bg-teal-900/50'
                }`}
                title="রেলওয়ের অফিসিয়াল ১৬৩১৮ এসএমএস রিপ্লাই ও সময়সূচি চেক করুন"
              >
                <MessageSquare className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span>১৬৩১৮ এসএমএস</span>
              </button>

              {/* Ad Revenue / Monetization Dashboard Button */}
              <button
                onClick={() => setIsMonetizationModalOpen(true)}
                className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isLight
                    ? 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                    : 'bg-amber-950/40 text-amber-300 border border-amber-800 hover:bg-amber-900/50'
                }`}
                title="বিজ্ঞাপন ও রাজস্ব আয় কন্ট্রোল প্যানেল"
              >
                <DollarSign className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>আয়: ৳{toBengaliNumber(monetization.earningsBdt.toFixed(0))}</span>
              </button>
            </div>

            {selectedStatus && (
              <div className="flex items-center gap-2 text-xs">
                <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>ট্র্যাক সেকশন:</span>
                <span className={`font-semibold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                  {selectedStatus.currentBlockSectionBn}
                </span>
                {selectedStatus.predictiveDelay?.isLate && (
                  <span
                    className={`flex items-center gap-1 font-semibold px-2 py-0.5 rounded border ${
                      isLight
                        ? 'bg-amber-50 text-amber-800 border-amber-300'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    }`}
                  >
                    <AlertTriangle className="w-3 h-3" />
                    পূর্বাভাস বিলম্ব +{toBengaliNumber(selectedStatus.predictiveDelay.predictedDelayMinutes)} মি.
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Dynamic Content Views */}
          <div className="flex-1 min-h-0 relative flex flex-col gap-2.5">
            {activeTab === 'settings' ? (
              <div
                className={`flex-1 h-full min-h-0 rounded-xl sm:rounded-2xl overflow-hidden border shadow-lg ${
                  isLight ? 'border-slate-300' : 'border-slate-800'
                }`}
              >
                <SettingsView
                  settings={screenSettings}
                  onUpdateSettings={handleUpdateScreenSettings}
                  theme={theme}
                  onToggleTheme={toggleTheme}
                  onClose={() => setActiveTab('map')}
                />
              </div>
            ) : activeTab === 'map' ? (
              <div className="flex-1 h-full flex flex-col gap-2.5 min-h-0">
                {/* Live Rail Map Container - Expanded full height on mobile */}
                <div
                  className={`flex-1 h-full min-h-[320px] relative rounded-xl sm:rounded-2xl overflow-hidden border shadow-lg ${
                    isLight ? 'border-slate-300' : 'border-slate-800'
                  }`}
                >
                  <LiveRailMap
                    trainStatuses={trainStatuses}
                    selectedTrainId={selectedTrainId}
                    onSelectTrain={(id) => setSelectedTrainId(id)}
                    onSelectStation={(station) => setSelectedStation(station)}
                    theme={theme}
                    lang={lang}
                    tripState={tripState}
                    onOpenOnboardModal={() => setIsOnboardModalOpen(true)}
                    onAlarmTriggered={handleAlarmTriggered}
                    onAlarmDismissed={handleAlarmDismissed}
                    onEndTrip={handleEndTrip}
                    onOpenTrafficScanner={() => setIsTrafficScannerOpen(true)}
                    onTimeShift={handleChangeTime}
                    onOpenTicketBooking={handleOpenTicketBooking}
                    settings={screenSettings}
                    onUpdateSettings={handleUpdateScreenSettings}
                    onOpenSettingsModal={() => setActiveTab('settings')}
                  />
                </div>

                {/* Bottom Compact Bogie Inspector Drawer on Tablet/Desktop */}
                {selectedStatus && (
                  <div className="hidden sm:block shrink-0 max-h-[35%] overflow-y-auto">
                    <BogieInspector
                      status={selectedStatus}
                      theme={theme}
                      onOpenTicketBooking={handleOpenTicketBooking}
                    />
                  </div>
                )}
              </div>
            ) : (
              /* Full Bogie View */
              <div className="flex-1 overflow-y-auto min-h-0">
                {selectedStatus ? (
                  <BogieInspector
                    status={selectedStatus}
                    theme={theme}
                    onOpenTicketBooking={handleOpenTicketBooking}
                  />
                ) : (
                  <div className="p-8 text-center text-slate-500 text-sm">
                    কোনো ট্রেন নির্বাচিত নেই
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav
        className={`lg:hidden shrink-0 border-t px-1.5 py-1.5 flex items-center justify-around z-30 ${
          isLight ? 'bg-white/95 border-slate-200' : 'bg-slate-900/98 border-slate-800'
        }`}
      >
        <button
          id="mobile-nav-map"
          onClick={() => setActiveTab('map')}
          className={`flex-1 py-1.5 px-1 flex flex-col items-center gap-1 rounded-xl text-[10px] sm:text-[11px] font-semibold transition-colors cursor-pointer ${
            activeTab === 'map'
              ? 'text-emerald-600 bg-emerald-500/10 border border-emerald-500/30'
              : isLight
              ? 'text-slate-600 hover:text-slate-900'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>ম্যাপ ভিউ</span>
        </button>

        <button
          id="mobile-nav-trains"
          onClick={() => setActiveTab('trains')}
          className={`flex-1 py-1.5 px-1 flex flex-col items-center gap-1 rounded-xl text-[10px] sm:text-[11px] font-semibold transition-colors relative cursor-pointer ${
            activeTab === 'trains'
              ? 'text-emerald-600 bg-emerald-500/10 border border-emerald-500/30'
              : isLight
              ? 'text-slate-600 hover:text-slate-900'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ListFilter className="w-4 h-4" />
          <span>ট্রেন ({toBengaliNumber(trainStatuses.length)})</span>
          {lateTrainsCount > 0 && (
            <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white dark:ring-slate-900" />
          )}
        </button>

        <button
          id="mobile-nav-ticket"
          onClick={() => handleOpenTicketBooking()}
          className="flex-1 py-1.5 px-1 flex flex-col items-center gap-1 rounded-xl text-[10px] sm:text-[11px] font-bold transition-colors cursor-pointer text-emerald-600 hover:text-emerald-500"
        >
          <Ticket className="w-4 h-4" />
          <span>টিকেট</span>
        </button>

        <button
          id="mobile-nav-bogie"
          onClick={() => setActiveTab('bogie')}
          className={`flex-1 py-1.5 px-1 flex flex-col items-center gap-1 rounded-xl text-[10px] sm:text-[11px] font-semibold transition-colors cursor-pointer ${
            activeTab === 'bogie'
              ? 'text-emerald-600 bg-emerald-500/10 border border-emerald-500/30'
              : isLight
              ? 'text-slate-600 hover:text-slate-900'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <TrainIcon className="w-4 h-4" />
          <span>বগি বিন্যাস</span>
        </button>

        <button
          id="mobile-nav-onboard"
          onClick={() => setIsOnboardModalOpen(true)}
          className={`flex-1 py-1.5 px-1 flex flex-col items-center gap-1 rounded-xl text-[10px] sm:text-[11px] font-semibold transition-colors cursor-pointer relative ${
            tripState?.isActive
              ? 'text-emerald-600 bg-emerald-500/15 border border-emerald-500/40 animate-pulse font-bold'
              : isLight
              ? 'text-slate-600 hover:text-slate-900'
              : 'text-slate-400 hover:text-white'
          }`}
          title="আমি এই ট্রেনে আছি (অন-বোর্ড ট্রিপ ও অ্যালার্ম)"
        >
          <BellRing className={`w-4 h-4 ${tripState?.isActive ? 'text-emerald-500 animate-bounce' : 'text-emerald-600'}`} />
          <span>{tripState?.isActive ? 'ট্রিপ সচল' : 'অন-বোর্ড'}</span>
          {tripState?.isActive && (
            <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
          )}
        </button>

        <button
          id="mobile-nav-settings"
          onClick={() => setActiveTab(activeTab === 'settings' ? 'map' : 'settings')}
          className={`flex-1 py-1.5 px-1 flex flex-col items-center gap-1 rounded-xl text-[10px] sm:text-[11px] font-semibold transition-colors cursor-pointer ${
            activeTab === 'settings'
              ? 'text-orange-600 bg-orange-500/15 border border-orange-500/30 font-bold'
              : isLight
              ? 'text-slate-600 hover:text-slate-900'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Settings className={`w-4 h-4 ${activeTab === 'settings' ? 'text-orange-500' : ''}`} />
          <span>সেটিংস</span>
        </button>
      </nav>

      {/* Station Departures Modal */}
      {selectedStation && (
        <StationDeparturesModal
          station={selectedStation}
          trainStatuses={trainStatuses}
          onClose={() => setSelectedStation(null)}
          onSelectTrain={(id) => {
            setSelectedTrainId(id);
            setActiveTab('map');
          }}
          theme={theme}
        />
      )}

      {/* Google Traffic Scanner Modal */}
      <GoogleTrafficScannerModal
        isOpen={isTrafficScannerOpen}
        onClose={() => setIsTrafficScannerOpen(false)}
        trainStatuses={trainStatuses}
        onSelectTrain={(id) => {
          setSelectedTrainId(id);
          setActiveTab('map');
        }}
        theme={theme}
      />

      {/* E-Ticket Booking Modal */}
      {isTicketModalOpen && (
        <TicketBookingModal
          isOpen={isTicketModalOpen}
          onClose={() => setIsTicketModalOpen(false)}
          trainStatuses={trainStatuses}
          initialTrainId={ticketInitialTrainId}
          theme={theme}
        />
      )}

      {/* On-Board Trip Modal ("আমি এই ট্রেনে আছি" - গন্তব্য নির্বাচন ও মোবাইল অ্যালার্ম) */}
      {isOnboardModalOpen && (
        <OnboardTripModal
          trainStatuses={trainStatuses}
          selectedTrainId={selectedTrainId}
          tripState={tripState}
          onStartTrip={handleStartTrip}
          onEndTrip={handleEndTrip}
          onRelocateTrain={handleRelocateTrain}
          onClose={() => setIsOnboardModalOpen(false)}
          lang={lang}
          theme={theme}
        />
      )}

      {/* Official 16318 SMS Live Tracker Modal */}
      {isSmsTrackerModalOpen && (
        <SmsTrackerModal
          isOpen={isSmsTrackerModalOpen}
          onClose={() => setIsSmsTrackerModalOpen(false)}
          trainStatuses={trainStatuses}
          initialTrainId={selectedTrainId}
          theme={theme}
        />
      )}

      {/* Monetization & Ad Revenue Dashboard Modal */}
      {isMonetizationModalOpen && (
        <MonetizationDashboardModal
          isOpen={isMonetizationModalOpen}
          onClose={() => setIsMonetizationModalOpen(false)}
          monetization={monetization}
          onUpdateMonetization={handleUpdateMonetization}
          onTriggerRewardedAd={() => setIsRewardedAdModalOpen(true)}
          theme={theme}
        />
      )}

      {/* Rewarded Video Ad Modal */}
      {isRewardedAdModalOpen && (
        <RewardedAdModal
          isOpen={isRewardedAdModalOpen}
          onClose={() => setIsRewardedAdModalOpen(false)}
          onRewardGranted={handleRewardGranted}
          theme={theme}
        />
      )}

      {/* Sticky Bottom Sponsored Banner */}
      {screenSettings.showAdBanners && (
        <AdBanner
          placement="bottom-sticky"
          theme={theme}
          onAdClick={handleAdClick}
          onAdImpression={handleAdImpression}
          onOpenMonetizationDashboard={() => setIsMonetizationModalOpen(true)}
        />
      )}
    </div>
  );
}

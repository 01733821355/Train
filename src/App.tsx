import React, { useState, useEffect, useMemo } from 'react';
import { BANGLADESH_TRAINS } from './data/trains';
import { Station, LiveTrainStatus, ScreenCustomizationSettings, DEFAULT_SCREEN_SETTINGS } from './types';
import { computeTrainLiveStatus, getCurrentBSTMinutes, getCurrentBSTDateInfo } from './utils/trackerEngine';
import { formatMinutesToTime, toBengaliNumber } from './utils/geoUtils';
import { Navbar } from './components/Navbar';
import { LiveRailMap } from './components/LiveRailMap';
import { TrainListSidebar } from './components/TrainListSidebar';
import { BogieInspector } from './components/BogieInspector';
import { AutonomousTrafficMonitor } from './components/AutonomousTrafficMonitor';
import { StationDeparturesModal } from './components/StationDeparturesModal';
import { GoogleTrafficScannerModal } from './components/GoogleTrafficScannerModal';
import { TicketBookingModal } from './components/TicketBookingModal';
import { ScreenCustomizationModal } from './components/ScreenCustomizationModal';
import { SettingsView } from './components/SettingsView';
import { MapPin, Train as TrainIcon, Layers, Eye, Compass, Clock, ListFilter, AlertTriangle, Activity, Ticket, Sliders, Settings } from 'lucide-react';

export default function App() {
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

  // Clock state
  const [timeMinutes, setTimeMinutes] = useState<number>(() => getCurrentBSTMinutes());
  const [isRealTime, setIsRealTime] = useState<boolean>(true);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [autoRadarEnabled, setAutoRadarEnabled] = useState<boolean>(true);

  // Selected entities
  const [selectedTrainId, setSelectedTrainId] = useState<string>('cxb-813');
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [isTrafficScannerOpen, setIsTrafficScannerOpen] = useState<boolean>(false);

  // E-Ticket modal state
  const [isTicketModalOpen, setIsTicketModalOpen] = useState<boolean>(false);
  const [ticketInitialTrainId, setTicketInitialTrainId] = useState<string | undefined>(undefined);

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

  // Compute live status for all trains at current time, honoring weekly off days
  const currentBSTDayInfo = useMemo(() => getCurrentBSTDateInfo(), [timeMinutes]);

  const trainStatuses: LiveTrainStatus[] = useMemo(() => {
    return BANGLADESH_TRAINS.map((train) =>
      computeTrainLiveStatus(train, timeMinutes, 1.0, currentBSTDayInfo.dayOfWeekEn)
    );
  }, [timeMinutes, currentBSTDayInfo]);

  // Find currently selected train's status
  const selectedStatus = useMemo(() => {
    return trainStatuses.find((s) => s.train.id === selectedTrainId) || trainStatuses[0] || null;
  }, [trainStatuses, selectedTrainId]);

  // Autonomous Train Auto-Lock:
  // Automatically select an active train on track if current selection is offline
  useEffect(() => {
    if (!autoRadarEnabled) return;
    if (selectedStatus && !selectedStatus.isActive) {
      const firstActive = trainStatuses.find((s) => s.isActive);
      if (firstActive && firstActive.train.id !== selectedTrainId) {
        setSelectedTrainId(firstActive.train.id);
      }
    }
  }, [autoRadarEnabled, selectedStatus, trainStatuses, selectedTrainId]);

  const activeTrains = useMemo(() => {
    return trainStatuses.filter((s) => s.isActive);
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
    const activeList = trainStatuses.filter((s) => s.isActive);
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
        activeTab={activeTab}
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
          className={`flex-1 flex flex-col h-full overflow-hidden p-1 sm:p-3 md:p-4 gap-1.5 sm:gap-3 ${
            isLight ? 'bg-slate-100' : 'bg-slate-950'
          } ${activeTab === 'trains' ? 'hidden lg:flex' : 'flex'}`}
        >
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
          <div className="hidden sm:flex items-center justify-between">
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
    </div>
  );
}

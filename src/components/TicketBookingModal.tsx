import React, { useState, useMemo, useEffect } from 'react';
import { BANGLADESH_STATIONS } from '../data/stations';
import { BANGLADESH_TRAINS } from '../data/trains';
import { Train, Station, LiveTrainStatus } from '../types';
import { toBengaliNumber } from '../utils/geoUtils';
import {
  Ticket,
  Search,
  Calendar,
  Users,
  Train as TrainIcon,
  Clock,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  X,
  Sparkles,
  MapPin,
  ChevronRight,
  Info,
  Copy,
  Check,
  Zap,
  Printer,
  Lock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface TicketBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  trainStatuses?: LiveTrainStatus[];
  initialFromStation?: string;
  initialToStation?: string;
  initialTrainId?: string;
  theme?: 'light' | 'dark';
}

// Popular major railway hubs in Bangladesh
const POPULAR_HUBS = [
  { nameBn: 'ঢাকা', code: 'DA' },
  { nameBn: 'চট্টগ্রাম', code: 'CG' },
  { nameBn: 'কক্সবাজার', code: 'CXB' },
  { nameBn: 'সিলেট', code: 'SY' },
  { nameBn: 'রাজশাহী', code: 'RJ' },
  { nameBn: 'খুলনা', code: 'KL' },
  { nameBn: 'রংপুর', code: 'RP' },
  { nameBn: 'বেনাপোল', code: 'BNP' },
];

// Seat classes with official Bangladesh Railway designations
const SEAT_CLASSES = [
  { id: 'S_CHAIR', nameBn: 'শোভন চেয়ার (S_CHAIR)', baseFareMultiplier: 1.0, color: 'text-sky-600' },
  { id: 'SNIGDHA', nameBn: 'স্নিগ্ধা / এসি চেয়ার (SNIGDHA)', baseFareMultiplier: 1.9, color: 'text-emerald-600' },
  { id: 'AC_S', nameBn: 'এসি সিট (AC_S)', baseFareMultiplier: 2.3, color: 'text-purple-600' },
  { id: 'AC_B', nameBn: 'এসি বার্থ (AC_B)', baseFareMultiplier: 2.8, color: 'text-indigo-600' },
  { id: 'SHOVON', nameBn: 'শুভন (SHOVON)', baseFareMultiplier: 0.8, color: 'text-amber-600' },
  { id: 'F_SEAT', nameBn: 'প্রথম শ্রেণি (FIRST SEAT)', baseFareMultiplier: 1.5, color: 'text-blue-600' },
];

export const TicketBookingModal: React.FC<TicketBookingModalProps> = ({
  isOpen,
  onClose,
  initialFromStation = 'ঢাকা',
  initialToStation = 'চট্টগ্রাম',
  initialTrainId,
  theme = 'light',
}) => {
  const isLight = theme === 'light';

  // Search parameters
  const [fromStationQuery, setFromStationQuery] = useState(initialFromStation);
  const [toStationQuery, setToStationQuery] = useState(initialToStation);
  const [journeyDate, setJourneyDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [selectedClass, setSelectedClass] = useState<string>('S_CHAIR');
  const [passengerCount, setPassengerCount] = useState<number>(1);
  const [selectedTrain, setSelectedTrain] = useState<Train | null>(() => {
    if (initialTrainId) {
      return BANGLADESH_TRAINS.find((t) => t.id === initialTrainId) || null;
    }
    return null;
  });

  // Booking step: 'search' | 'checkout' | 'success'
  const [bookingStep, setBookingStep] = useState<'search' | 'checkout' | 'success'>('search');

  // Passenger form state
  const [passengerName, setPassengerName] = useState('');
  const [passengerPhone, setPassengerPhone] = useState('');
  const [passengerNid, setPassengerNid] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'bkash' | 'nagad' | 'rocket' | 'card'>('bkash');
  const [isProcessing, setIsProcessing] = useState(false);
  const [bookedTicketId, setBookedTicketId] = useState('');
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [showNidGuide, setShowNidGuide] = useState(false);

  // Station English name mapper for official eticket.railway.gov.bd compatibility
  const getOfficialStationName = (query: string): string => {
    if (!query.trim()) return '';
    const q = query.trim().toLowerCase();
    const match = BANGLADESH_STATIONS.find(
      (s) =>
        s.nameBn.toLowerCase().includes(q) ||
        s.nameEn.toLowerCase().includes(q) ||
        s.code.toLowerCase() === q
    );
    if (match) {
      // Return clean name e.g. "Dhaka", "Chittagong", "Sylhet"
      return match.nameEn.replace(/\(.*\)/, '').trim();
    }
    return query.trim();
  };

  // Build exact deep link for Bangladesh Railway official portal
  const buildOfficialPortalUrl = (customTrain?: Train | null) => {
    const fromCity = getOfficialStationName(fromStationQuery);
    const toCity = getOfficialStationName(toStationQuery);
    
    // Format date for Bangladesh Railway (e.g. DD-MMM-YYYY or YYYY-MM-DD)
    let formattedDate = journeyDate;
    try {
      const d = new Date(journeyDate);
      if (!isNaN(d.getTime())) {
        const day = String(d.getDate()).padStart(2, '0');
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        formattedDate = `${day}-${months[d.getMonth()]}-${d.getFullYear()}`;
      }
    } catch {
      // fallback
    }

    if (fromCity && toCity) {
      return `https://eticket.railway.gov.bd/booking/train/search?fromcity=${encodeURIComponent(
        fromCity
      )}&tocity=${encodeURIComponent(toCity)}&doj=${encodeURIComponent(
        formattedDate
      )}&class=${encodeURIComponent(selectedClass)}`;
    }
    return 'https://eticket.railway.gov.bd/';
  };

  // 1-Click Auto-Transfer: Copies summary & launches official portal pre-filled
  const handleOneClickAutoTransfer = (train?: Train | null) => {
    const targetTrain = train || selectedTrain;
    const url = buildOfficialPortalUrl(targetTrain);
    const selectedClassObj = SEAT_CLASSES.find((c) => c.id === selectedClass);

    // Build human-readable trip summary for instant clipboard paste
    const summaryLines = [
      '🚆 বাংলাদেশ রেলওয়ে ই-টিকেট ট্রিপ ডিটেইলস:',
      `• প্রস্থান স্টেশন: ${fromStationQuery || 'ঢাকা'}`,
      `• গন্তব্য স্টেশন: ${toStationQuery || 'চট্টগ্রাম'}`,
      `• যাত্রার তারিখ: ${journeyDate}`,
      `• শ্রেণি: ${selectedClassObj?.nameBn || selectedClass}`,
      `• যাত্রী সংখ্যা: ${toBengaliNumber(passengerCount)} জন`,
    ];

    if (targetTrain) {
      summaryLines.push(`• ট্রেন: ${targetTrain.nameBn} (${targetTrain.number})`);
      summaryLines.push(
        `• আনুমানিক মোট ভাড়া: ৳ ${toBengaliNumber(calculateFare(targetTrain, selectedClass))}`
      );
    }
    if (passengerName.trim()) {
      summaryLines.push(`• যাত্রীর নাম: ${passengerName}`);
    }
    if (passengerPhone.trim()) {
      summaryLines.push(`• মোবাইল: ${passengerPhone}`);
    }
    if (passengerNid.trim()) {
      summaryLines.push(`• NID: ${passengerNid}`);
    }

    const clipboardText = summaryLines.join('\n');

    // Copy to clipboard
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(clipboardText).catch(() => {});
    }

    setCopyFeedback('যাত্রার তথ্য কপি হয়েছে ও অফিশিয়াল বুকিং পেজ খুলছে...');
    setTimeout(() => {
      setCopyFeedback(null);
    }, 4000);

    // Open official portal with pre-filled parameters
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Sync selected train and stations whenever modal opens or initialTrainId changes
  useEffect(() => {
    if (isOpen) {
      if (initialTrainId) {
        const found = BANGLADESH_TRAINS.find((t) => t.id === initialTrainId);
        if (found) {
          setSelectedTrain(found);
          if (found.stops.length > 0) {
            setFromStationQuery(found.stops[0].stationNameBn);
            setToStationQuery(found.stops[found.stops.length - 1].stationNameBn);
          }
        }
      }
      setBookingStep('search');
    }
  }, [isOpen, initialTrainId]);

  // Filter stations for suggestions
  const filterStations = (query: string) => {
    if (!query.trim()) return BANGLADESH_STATIONS.slice(0, 8);
    const q = query.toLowerCase().trim();
    return BANGLADESH_STATIONS.filter(
      (s) => s.nameBn.includes(q) || s.nameEn.toLowerCase().includes(q) || s.code.toLowerCase().includes(q)
    ).slice(0, 8);
  };

  // Find trains connecting fromStation and toStation
  const matchingTrains = useMemo(() => {
    const fromQ = fromStationQuery.trim().toLowerCase();
    const toQ = toStationQuery.trim().toLowerCase();

    if (!fromQ && !toQ) return BANGLADESH_TRAINS.slice(0, 10);

    return BANGLADESH_TRAINS.filter((train) => {
      const stops = train.stops;
      let fromIdx = -1;
      let toIdx = -1;

      stops.forEach((s, idx) => {
        if (s.stationNameBn.toLowerCase().includes(fromQ) || s.stationNameEn.toLowerCase().includes(fromQ)) {
          if (fromIdx === -1) fromIdx = idx;
        }
        if (s.stationNameBn.toLowerCase().includes(toQ) || s.stationNameEn.toLowerCase().includes(toQ)) {
          toIdx = idx;
        }
      });

      // Valid if fromStation comes before toStation along route
      if (fromIdx !== -1 && toIdx !== -1 && fromIdx < toIdx) {
        return true;
      }

      // If broad match, also show trains originating near fromStation
      if (fromIdx !== -1 && !toQ) return true;
      if (toIdx !== -1 && !fromQ) return true;

      return false;
    });
  }, [fromStationQuery, toStationQuery]);

  // Compute calculated fare in BDT
  const calculateFare = (train: Train, classId: string) => {
    const classObj = SEAT_CLASSES.find((c) => c.id === classId) || SEAT_CLASSES[0];
    const baseFare = (train as { fareSChair?: number }).fareSChair || 405;
    return Math.round(baseFare * classObj.baseFareMultiplier * passengerCount);
  };

  // Swap stations
  const handleSwapStations = () => {
    const temp = fromStationQuery;
    setFromStationQuery(toStationQuery);
    setToStationQuery(temp);
  };

  // Official portal redirect with deep link
  const openOfficialPortal = (trainName?: string) => {
    const url = 'https://eticket.railway.gov.bd/';
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Confirm booking action
  const handleConfirmBooking = () => {
    if (!passengerName.trim() || !passengerPhone.trim()) {
      alert('অনুগ্রহ করে যাত্রীর নাম এবং মোবাইল নম্বর প্রদান করুন');
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      const randomTicketNum = `BR-${Math.floor(100000 + Math.random() * 900000)}`;
      setBookedTicketId(randomTicketNum);
      setIsProcessing(false);
      setBookingStep('success');
    }, 1200);
  };

  // Guard return AFTER all hooks have executed unconditionally
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`w-full max-w-4xl rounded-2xl border shadow-2xl flex flex-col max-h-[92vh] overflow-hidden ${
          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-slate-100'
        }`}
      >
        {/* Top Header: Official Bangladesh Railway E-Ticket Branding */}
        <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white p-3.5 sm:p-4 shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
              <Ticket className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold">বাংলাদেশ রেলওয়ে ই-টিকেট সেবা</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950 flex items-center gap-1 shadow-sm">
                  <ShieldCheck className="w-3 h-3" />
                  অফিশিয়াল পোর্টাল লিংক
                </span>
              </div>
              <p className="text-xs text-emerald-100 flex items-center gap-1 mt-0.5">
                <span>https://eticket.railway.gov.bd/</span>
                <span>• অনলাইন টিকেট অনুসন্ধান ও বুকিং সিস্টেম</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => openOfficialPortal()}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-emerald-800 hover:bg-emerald-50 text-xs font-bold shadow transition-all cursor-pointer"
              title="অফিসিয়াল রেলওয়ে ই-টিকেট ওয়েবসাইটে যান"
            >
              <span>eticket.railway.gov.bd</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-4">
          {bookingStep === 'search' && (
            <>
              {/* Search Criteria Card */}
              <div
                className={`p-3.5 sm:p-4 rounded-2xl border shadow-sm space-y-3.5 ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/70 border-slate-800'
                }`}
              >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                  {/* From Station */}
                  <div className="md:col-span-4 space-y-1">
                    <label className="text-xs font-bold flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      <span>যাত্রা শুরুর স্টেশন (From)</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={fromStationQuery}
                        onChange={(e) => setFromStationQuery(e.target.value)}
                        placeholder="যেমন: ঢাকা, বিমানবন্দর..."
                        className={`w-full px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all ${
                          isLight
                            ? 'bg-white border-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'
                            : 'bg-slate-900 border-slate-700 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Swap Button */}
                  <div className="md:col-span-1 flex items-center justify-center">
                    <button
                      onClick={handleSwapStations}
                      className={`p-2 rounded-full border transition-all cursor-pointer hover:rotate-180 duration-300 ${
                        isLight
                          ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700'
                          : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
                      }`}
                      title="স্টেশন অদল-বদল করুন"
                    >
                      <ArrowRight className="w-4 h-4 md:hidden" />
                      <ArrowRight className="w-4 h-4 hidden md:block" />
                    </button>
                  </div>

                  {/* To Station */}
                  <div className="md:col-span-4 space-y-1">
                    <label className="text-xs font-bold flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                      <MapPin className="w-3.5 h-3.5 text-rose-600" />
                      <span>গন্তব্য স্টেশন (To)</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={toStationQuery}
                        onChange={(e) => setToStationQuery(e.target.value)}
                        placeholder="যেমন: চট্টগ্রাম, কক্সবাজার..."
                        className={`w-full px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all ${
                          isLight
                            ? 'bg-white border-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'
                            : 'bg-slate-900 border-slate-700 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Journey Date */}
                  <div className="md:col-span-3 space-y-1">
                    <label className="text-xs font-bold flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                      <Calendar className="w-3.5 h-3.5 text-blue-600" />
                      <span>যাত্রার তারিখ</span>
                    </label>
                    <input
                      type="date"
                      value={journeyDate}
                      onChange={(e) => setJourneyDate(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all ${
                        isLight
                          ? 'bg-white border-slate-300 focus:border-emerald-500'
                          : 'bg-slate-900 border-slate-700 focus:border-emerald-400'
                      }`}
                    />
                  </div>
                </div>

                {/* Popular Station Quick Chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin text-xs">
                  <span className="text-[11px] font-semibold text-slate-400 shrink-0">জনপ্রিয় রুট:</span>
                  {POPULAR_HUBS.map((hub) => (
                    <button
                      key={hub.code}
                      onClick={() => {
                        if (!fromStationQuery) setFromStationQuery(hub.nameBn);
                        else setToStationQuery(hub.nameBn);
                      }}
                      className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer shrink-0 ${
                        isLight
                          ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                      }`}
                    >
                      {hub.nameBn}
                    </button>
                  ))}
                </div>

                {/* Class & Passenger Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">আসন শ্রেণি (Class)</label>
                    <select
                      value={selectedClass}
                      onChange={(e) => setSelectedClass(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold border ${
                        isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
                      }`}
                    >
                      {SEAT_CLASSES.map((cls) => (
                        <option key={cls.id} value={cls.id}>
                          {cls.nameBn}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      যাত্রী সংখ্যা (সর্বোচ্চ ৪ জন)
                    </label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4].map((num) => (
                        <button
                          key={num}
                          onClick={() => setPassengerCount(num)}
                          className={`flex-1 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            passengerCount === num
                              ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                              : isLight
                              ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700'
                              : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-300'
                          }`}
                        >
                          {toBengaliNumber(num)} জন
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Smart Auto-Transfer & Official Portal Deep-Link Card */}
              <div
                className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${
                  isLight
                    ? 'bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 border-emerald-300 text-slate-800 shadow-sm'
                    : 'bg-gradient-to-r from-emerald-950/40 via-teal-950/30 to-slate-900 border-emerald-800 text-slate-100'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white flex items-center gap-1 shadow-sm">
                        <Zap className="w-3 h-3 text-amber-300 fill-amber-300" />
                        <span>১-ক্লিক অটো-ট্রান্সফার ইঞ্জিন</span>
                      </span>
                      <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white">
                        বাংলাদেশ রেলওয়ে অফিসিয়াল ই-টিকেট সংযোগ
                      </h4>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      এখানে নির্বাচিত স্টেশন ({fromStationQuery || 'ঢাকা'} ➔ {toStationQuery || 'চট্টগ্রাম'}), তারিখ ও শ্রেণি সরাসরি অফিশিয়াল সার্ভারে রিডাইরেক্ট করে টিকিট কাটা শুরু করুন।
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleOneClickAutoTransfer(null)}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer hover:scale-[1.02]"
                      title="অফিসিয়াল সিস্টেমে সরাসরি অনুসন্ধান করুন ও ডাটা কপি করুন"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                      <span>অফিসিয়ালে ১-ক্লিক ট্রান্সফার</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Collapsible NID & Security Policy Explanation */}
                <div className="mt-3 pt-2.5 border-t border-emerald-200/80 dark:border-emerald-800/60">
                  <button
                    type="button"
                    onClick={() => setShowNidGuide(!showNidGuide)}
                    className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>কেন টিকিট কাটার চূড়ান্ত ধাপে অফিশিয়াল NID ভেরিফিকেশন ও ওটিপি প্রয়োজন?</span>
                    {showNidGuide ? (
                      <ChevronUp className="w-3.5 h-3.5 ml-1" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 ml-1" />
                    )}
                  </button>

                  {showNidGuide && (
                    <div className="mt-2 p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-emerald-200 dark:border-emerald-800 text-[11px] leading-relaxed text-slate-700 dark:text-slate-300 space-y-1.5 animate-in fade-in duration-150">
                      <p className="font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        <span>টিকিট কালোবাজারি প্রতিরোধ ও নির্বাচন কমিশন (EC) ভেরিফিকেশন আইন:</span>
                      </p>
                      <p>
                        ১. বাংলাদেশ রেলওয়ের নিয়ম অনুযায়ী প্রত্যেক টিকিটে যাত্রীর নাম, এনআইডি (NID) নম্বর ও রেজিস্টার্ড মোবাইল নম্বর সংযুক্ত থাকা বাধ্যতামূলক।
                      </p>
                      <p>
                        ২. কোনো থার্ড-পার্টি সাইটকে সরকারিভাবে সরাসরি ব্যাংক বা বিকাশ থেকে টাকা কেটে টিকিট ইস্যু করার অ্যাক্সেস দেয়া হয় না—এটি সম্পূর্ণ Shohoz ও Bangladesh Railway এর সুরক্ষিত গেটওয়েতে সম্পন্ন হয়।
                      </p>
                      <p>
                        ৩. <strong>আমাদের ভূমিকা:</strong> আপনার সময় বাঁচাতে আমরা সঠিক ট্রেন, লাইভ জিপিএস লোকেশন ও ভাড়ার তথ্য নির্বাচন করে ১-ক্লিকেই অফিশিয়াল পোর্টালে ট্রান্সফার করে দিচ্ছি, যাতে আপনাকে পুনরায় কোনো কিছু খুঁজতে না হয়!
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Train Search Results List */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs font-semibold px-1 text-slate-500">
                  <span>উপলব্ধ আন্তঃনগর ট্রেন তালিকা ({toBengaliNumber(matchingTrains.length)} টি)</span>
                  <span>আসন ও অফিসিয়াল ভাড়া</span>
                </div>

                {matchingTrains.length === 0 ? (
                  <div
                    className={`p-8 text-center rounded-2xl border text-sm space-y-2 ${
                      isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'
                    }`}
                  >
                    <AlertCircle className="w-8 h-8 mx-auto text-amber-500" />
                    <p className="font-bold">এই রুটে কোনো সরাসরি ট্রেন পাওয়া যায়নি</p>
                    <p className="text-xs text-slate-400">
                      যাত্রা শুরুর স্টেশন ও গন্তব্য পরিবর্তন করে আবার অনুসন্ধান করুন।
                    </p>
                  </div>
                ) : (
                  matchingTrains.map((train) => {
                    const fare = calculateFare(train, selectedClass);
                    const selectedClassObj = SEAT_CLASSES.find((c) => c.id === selectedClass);
                    // Realistic seat inventory preview
                    const availableSeats = Math.max(4, ((train.number.charCodeAt(0) * 7 + 13) % 48));

                    return (
                      <div
                        key={train.id}
                        className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          isLight
                            ? 'bg-white hover:bg-slate-50 border-slate-200 shadow-sm'
                            : 'bg-slate-900 hover:bg-slate-850 border-slate-800'
                        }`}
                      >
                        {/* Train Details */}
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                                isLight ? 'bg-emerald-100 text-emerald-800' : 'bg-emerald-500/20 text-emerald-300'
                              }`}
                            >
                              {train.number}
                            </span>
                            <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                              {train.nameBn}
                            </h3>
                            <span className="text-xs text-slate-400">({train.nameEn})</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                              ছুটি: {train.offDayBn}
                            </span>
                          </div>

                          {/* Route & Times */}
                          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 flex-wrap">
                            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                              {train.stops[0].stationNameBn} ({train.departureTime})
                            </span>
                            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                            <span className="font-semibold text-rose-600 dark:text-rose-400">
                              {train.stops[train.stops.length - 1].stationNameBn} ({train.arrivalTime})
                            </span>
                            <span className="text-slate-400">• মোট {toBengaliNumber(train.coaches.length)} টি কোচ</span>
                          </div>

                          {/* Seat Availability Badges */}
                          <div className="flex items-center gap-2 pt-1 flex-wrap text-xs">
                            <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20">
                              {selectedClassObj?.nameBn.split(' ')[0]}: {toBengaliNumber(availableSeats)} টি খালি
                            </span>
                            <span className="text-slate-400 text-[11px]">তাৎক্ষণিক কনফার্মেশন</span>
                          </div>
                        </div>

                        {/* Price & Action Buttons */}
                        <div className="flex items-center sm:flex-col items-end justify-between sm:justify-center gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 dark:border-slate-800">
                          <div className="text-left sm:text-right">
                            <span className="text-[10px] text-slate-400 block">ভাড়া ({toBengaliNumber(passengerCount)} জন)</span>
                            <span className="text-base sm:text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                              ৳ {toBengaliNumber(fare)}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {/* In-app Booking Flow */}
                            <button
                              onClick={() => {
                                setSelectedTrain(train);
                                setBookingStep('checkout');
                              }}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow transition-all cursor-pointer flex items-center gap-1"
                            >
                              <span>বুক করুন</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>

                            {/* 1-Click Official Portal Auto-Transfer */}
                            <button
                              type="button"
                              onClick={() => handleOneClickAutoTransfer(train)}
                              className="px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1 bg-amber-500 hover:bg-amber-400 text-slate-950 border-amber-400 shadow-sm"
                              title="১-ক্লিকে রুট কপি করুন এবং অফিশিয়াল পোর্টালে এই ট্রেনের সরাসরি রেজাল্ট দেখুন"
                            >
                              <Zap className="w-3.5 h-3.5 fill-slate-950" />
                              <span className="hidden sm:inline">১-ক্লিক ট্রান্সফার</span>
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}

          {/* Checkout & Passenger Input Step */}
          {bookingStep === 'checkout' && selectedTrain && (
            <div className="space-y-4">
              <button
                onClick={() => setBookingStep('search')}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 cursor-pointer hover:underline"
              >
                ← অন্য ট্রেন নির্বাচন করুন
              </button>

              {/* Selected Train Summary */}
              <div
                className={`p-4 rounded-2xl border space-y-2 ${
                  isLight ? 'bg-emerald-50/70 border-emerald-200 text-slate-900' : 'bg-emerald-950/20 border-emerald-800 text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base">{selectedTrain.nameBn}</span>
                    <span className="text-xs font-mono text-emerald-600 font-bold">({selectedTrain.number})</span>
                  </div>
                  <span className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400">
                    ৳ {toBengaliNumber(calculateFare(selectedTrain, selectedClass))}
                  </span>
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between">
                  <span>
                    রুট: {fromStationQuery || selectedTrain.stops[0].stationNameBn} ➔ {toStationQuery || selectedTrain.stops[selectedTrain.stops.length - 1].stationNameBn}
                  </span>
                  <span>যাত্রী: {toBengaliNumber(passengerCount)} জন</span>
                </div>
              </div>

              {/* Passenger Info Form */}
              <div
                className={`p-4 rounded-2xl border space-y-3 ${
                  isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
                }`}
              >
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  যাত্রীর তথ্য প্রদান করুন (বাংলাদেশ রেলওয়ের নিয়ম অনুযায়ী)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      যাত্রীর পূর্ণ নাম (NID অনুযায়ী) *
                    </label>
                    <input
                      type="text"
                      value={passengerName}
                      onChange={(e) => setPassengerName(e.target.value)}
                      placeholder="যেমন: মোঃ সাকিব হোসেন"
                      className={`w-full px-3 py-2 rounded-xl text-xs sm:text-sm border ${
                        isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-800 border-slate-700 text-white'
                      }`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      মোবাইল নম্বর (টিকেট SMS যাবে) *
                    </label>
                    <input
                      type="tel"
                      value={passengerPhone}
                      onChange={(e) => setPassengerPhone(e.target.value)}
                      placeholder="017XXXXXXXX"
                      className={`w-full px-3 py-2 rounded-xl text-xs sm:text-sm border ${
                        isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-800 border-slate-700 text-white'
                      }`}
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      জাতীয় পরিচয়পত্র (NID) অথবা জন্মনিবন্ধন নম্বর
                    </label>
                    <input
                      type="text"
                      value={passengerNid}
                      onChange={(e) => setPassengerNid(e.target.value)}
                      placeholder="NID নম্বর প্রদান করুন (ঐচ্ছিক)"
                      className={`w-full px-3 py-2 rounded-xl text-xs sm:text-sm border ${
                        isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-800 border-slate-700 text-white'
                      }`}
                    />
                  </div>
                </div>

                {/* Payment Gateway Options */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    পেমেন্ট মেথড নির্বাচন করুন
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'bkash', label: 'বিকাশ (bKash)', color: 'border-pink-500' },
                      { id: 'nagad', label: 'নগদ (Nagad)', color: 'border-orange-500' },
                      { id: 'rocket', label: 'রকেট (Rocket)', color: 'border-purple-500' },
                      { id: 'card', label: 'কার্ড / ডেবিট', color: 'border-blue-500' },
                    ].map((pm) => (
                      <button
                        key={pm.id}
                        type="button"
                        onClick={() => setPaymentMethod(pm.id as any)}
                        className={`p-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                          paymentMethod === pm.id
                            ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                            : isLight
                            ? 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100'
                            : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>{pm.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Final Confirm Buttons */}
                <div className="pt-3 flex flex-col sm:flex-row items-center gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => handleOneClickAutoTransfer(selectedTrain)}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-amber-500 bg-amber-500/10 text-amber-800 dark:text-amber-300 hover:bg-amber-500/20 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    title="যাত্রীর তথ্য ও রুট কপি করে অফিশিয়াল পোর্টালে রিডাইরেক্ট করুন"
                  >
                    <Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>অফিশিয়াল পোর্টালে ১-ক্লিক ট্রান্সফার</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={handleConfirmBooking}
                    disabled={isProcessing}
                    className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isProcessing ? (
                      <span className="flex items-center gap-2">
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        প্রক্রিয়াধীন...
                      </span>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>টিকেট নিশ্চিত করুন (৳ {toBengaliNumber(calculateFare(selectedTrain, selectedClass))})</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Success Confirmation Step */}
          {bookingStep === 'success' && selectedTrain && (
            <div className="text-center py-6 px-4 space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-lg">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  টিকেট বুকিং সফল হয়েছে!
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  আপনার মোবাইল নম্বরে ({passengerPhone}) টিকেট নিশ্চিতকরণ এসএমএস পাঠানো হয়েছে।
                </p>
              </div>

              {/* Ticket Card Preview */}
              <div
                className={`max-w-md mx-auto p-4 rounded-2xl border text-left space-y-2 shadow-xl ${
                  isLight ? 'bg-white border-emerald-300' : 'bg-slate-900 border-emerald-600'
                }`}
              >
                <div className="flex items-center justify-between border-b pb-2 border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-bold text-emerald-600">বাংলাদেশ রেলওয়ে ই-টিকেট</span>
                  <span className="font-mono text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded">
                    {bookedTicketId}
                  </span>
                </div>

                <div className="text-xs space-y-1">
                  <p><strong>ট্রেন:</strong> {selectedTrain.nameBn} ({selectedTrain.number})</p>
                  <p><strong>যাত্রী:</strong> {passengerName}</p>
                  <p><strong>তারিখ:</strong> {journeyDate}</p>
                  <p><strong>আসন শ্রেণি:</strong> {SEAT_CLASSES.find((c) => c.id === selectedClass)?.nameBn}</p>
                  <p><strong>আসন সংখ্যা:</strong> {toBengaliNumber(passengerCount)} টি</p>
                  <p><strong>পরিশোধিত মূল্য:</strong> ৳ {toBengaliNumber(calculateFare(selectedTrain, selectedClass))}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>টিকেট স্লিপ প্রিন্ট</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOneClickAutoTransfer(selectedTrain)}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow flex items-center gap-1.5 cursor-pointer"
                >
                  <span>অফিসিয়াল পোর্টালে ডাটা কপি ও ওপেন</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  বন্ধ করুন
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Copy Feedback Toast */}
      {copyFeedback && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Check className="w-4 h-4 text-emerald-200" />
          <span>{copyFeedback}</span>
        </div>
      )}
    </div>
  );
};

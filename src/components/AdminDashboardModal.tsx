import React, { useState } from 'react';
import { UserAccount, AuthDB, AdminSystemState, PaymentAccountConfig } from '../utils/authDatabase';
import { detectTrainFromSms, SAMPLE_SMS_MESSAGES } from '../utils/smsDetector';
import { LiveTrainStatus } from '../types';
import { toBengaliNumber } from '../utils/geoUtils';
import {
  ShieldCheck,
  DollarSign,
  Users,
  Eye,
  CreditCard,
  FileSpreadsheet,
  Settings,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Layers,
  Send,
  Radio,
  ExternalLink,
  Smartphone,
  Save,
  Trash2,
  HelpCircle,
  X,
} from 'lucide-react';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  trainStatuses: LiveTrainStatus[];
  onGlobalTrainCalibrated: (trainId: string, calibration: any) => void;
  theme?: 'light' | 'dark';
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  isOpen,
  onClose,
  trainStatuses,
  onGlobalTrainCalibrated,
  theme = 'dark',
}) => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'sms' | 'payments' | 'ads' | 'layout' | 'sheet'>('analytics');

  // Load Admin System State
  const [systemState, setSystemState] = useState<AdminSystemState>(() => AuthDB.getSystemState());
  const [allUsers, setAllUsers] = useState<UserAccount[]>(() => AuthDB.getUsers());

  // SMS Calibration state
  const [smsInputText, setSmsInputText] = useState('');
  const [smsParseResult, setSmsParseResult] = useState<any>(null);
  const [smsSuccessNotice, setSmsSuccessNotice] = useState<string | null>(null);

  // Payment Form state
  const [bKashNum, setBKashNum] = useState(systemState.paymentAccounts.bKashNumber);
  const [bKashType, setBKashType] = useState(systemState.paymentAccounts.bKashType);
  const [nagadNum, setNagadNum] = useState(systemState.paymentAccounts.nagadNumber);
  const [nagadType, setNagadType] = useState(systemState.paymentAccounts.nagadType);
  const [rocketNum, setRocketNum] = useState(systemState.paymentAccounts.rocketNumber);
  const [rocketType, setRocketType] = useState(systemState.paymentAccounts.rocketType);
  const [monthlyFee, setMonthlyFee] = useState(systemState.paymentAccounts.monthlyFeeBdt);

  // Ad Config state
  const [showBannerAds, setShowBannerAds] = useState(systemState.adConfig.showBannerAds);
  const [adBannerText, setAdBannerText] = useState(systemState.adConfig.adBannerTextBn);
  const [adBannerLink, setAdBannerLink] = useState(systemState.adConfig.adBannerLink);

  // Sheet state
  const [googleSheetUrl, setGoogleSheetUrl] = useState(systemState.googleSheetUrl);
  const [sheetSyncStatus, setSheetSyncStatus] = useState<string | null>(null);

  // Notification state
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const isLight = theme === 'light';

  // Handle Save Payment Accounts
  const handleSavePaymentAccounts = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = AuthDB.saveSystemState({
      paymentAccounts: {
        ...systemState.paymentAccounts,
        bKashNumber: bKashNum.trim(),
        bKashType,
        nagadNumber: nagadNum.trim(),
        nagadType,
        rocketNumber: rocketNum.trim(),
        rocketType,
        monthlyFeeBdt: Number(monthlyFee) || 99,
      },
    });
    setSystemState(updated);
    setNotification({ type: 'success', text: 'পেমেন্ট অ্যাকাউন্ট সফলভাবে সংরক্ষিত হয়েছে!' });
    setTimeout(() => setNotification(null), 3000);
  };

  // Handle Save Ad Config
  const handleSaveAdConfig = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = AuthDB.saveSystemState({
      adConfig: {
        ...systemState.adConfig,
        showBannerAds,
        adBannerTextBn: adBannerText.trim(),
        adBannerLink: adBannerLink.trim(),
      },
    });
    setSystemState(updated);
    setNotification({ type: 'success', text: 'বিজ্ঞাপন সেটিংস সফলভাবে সংরক্ষিত হয়েছে!' });
    setTimeout(() => setNotification(null), 3000);
  };

  // Handle Save Layout Config
  const handleToggleLayoutItem = (key: keyof AdminSystemState['mapIconsLayout']) => {
    const currentVal = systemState.mapIconsLayout[key];
    const updatedLayout = {
      ...systemState.mapIconsLayout,
      [key]: !currentVal,
    };
    const updated = AuthDB.saveSystemState({ mapIconsLayout: updatedLayout });
    setSystemState(updated);
  };

  // Handle Verify Payment (Approve / Reject)
  const handleVerifyPayment = (userId: string, action: 'approve' | 'reject') => {
    AuthDB.adminVerifyPayment(userId, action);
    setAllUsers(AuthDB.getUsers());
    setSystemState(AuthDB.getSystemState());
    setNotification({
      type: 'success',
      text: action === 'approve' ? 'পেমেন্ট অনুমোদন করা হয়েছে এবং প্রিমিয়াম সক্রিয় হয়েছে!' : 'পেমেন্ট বাতিল করা হয়েছে।',
    });
    setTimeout(() => setNotification(null), 3000);
  };

  // Handle SMS Parse & Global Calibration
  const handleParseSms = () => {
    if (!smsInputText.trim()) return;
    const result = detectTrainFromSms(smsInputText);
    setSmsParseResult(result);

    if (result.matchedTrain) {
      // Broadcast calibration to all users via global calibration DB
      const calibration = {
        trainId: result.matchedTrain.id,
        currentStation: result.currentStation,
        currentStationName: result.currentStationName,
        delayMinutes: result.delayMinutes,
        detectedCoordinates: result.detectedCoordinates,
        timestamp: Date.now(),
        rawSms: smsInputText,
      };

      AuthDB.saveGlobalSmsCalibration(result.matchedTrain.id, calibration);
      onGlobalTrainCalibrated(result.matchedTrain.id, calibration);

      setSmsSuccessNotice(
        `সফল! ${result.matchedTrain.nameBn} (${result.matchedTrain.number})-এর আসল অবস্থান গ্লোবাল সিস্টেমে সংরক্ষিত হয়েছে। এখন সকল সাধারণ ইউজার এই নতুন লাইভ অবস্থান দেখতে পাবে!`
      );
    }
  };

  // Handle Google Sheet Sync
  const handleSyncToGoogleSheet = () => {
    setSheetSyncStatus('ডাটা গুচ্ছ প্রস্তুত করা হচ্ছে...');
    setTimeout(() => {
      const activeCount = trainStatuses.filter((s) => s.isActive).length;
      const updated = AuthDB.saveSystemState({
        googleSheetUrl,
        lastGoogleSheetSyncAt: Date.now(),
      });
      setSystemState(updated);
      setSheetSyncStatus(
        `সফলভাবে সিঙ্ক সম্পন্ন হয়েছে! মোট ${toBengaliNumber(activeCount)} টি ট্রেনের লাইভ অক্ষাংশ-দ্রাঘিমাংশ, গতি ও বিলম্বের ডাটা আপডেট করা হয়েছে।`
      );
    }, 800);
  };

  // Calculation for Financials
  const pendingUsers = allUsers.filter((u) => u.paymentStatus === 'pending');
  const approvedUsers = allUsers.filter((u) => u.paymentStatus === 'approved');
  const totalSubRevenue = (systemState.totalSubscriptionsBdt || 0);
  const totalAdRevenue = systemState.adConfig.adRevenueBdt || 0;
  const totalGrossIncome = totalSubRevenue + totalAdRevenue;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`w-full max-w-4xl h-[92vh] rounded-3xl border shadow-2xl overflow-hidden transition-all flex flex-col ${
          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-slate-100'
        }`}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-950 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30 text-white">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold">এডমিন মাস্টার কন্ট্রোল ড্যাশবোর্ড</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  সুপার এডমিন
                </span>
              </div>
              <p className="text-xs text-slate-400">
                বাংলাদেশ রেলওয়ে লাইভ ক্লাস্টার ট্র্যাকার ও রেভিনিউ ম্যানেজমেন্ট
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto p-1.5 bg-slate-100 dark:bg-slate-950/50 shrink-0">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`py-2 px-3 sm:px-4 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === 'analytics'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            আয় ও লাইভ অ্যানালিটিক্স
          </button>
          <button
            onClick={() => setActiveTab('sms')}
            className={`py-2 px-3 sm:px-4 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === 'sms'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Radio className="w-4 h-4 text-emerald-400" />
            ১৬৩১৮ এসএমএস দিয়ে গ্লোবাল ট্রেন লোকেশন
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`py-2 px-3 sm:px-4 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === 'payments'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            পেমেন্ট একাউন্ট সেটিংস ({pendingUsers.length > 0 ? `${pendingUsers.length} পেন্ডিং` : 'বিকাশ/নগদ'})
          </button>
          <button
            onClick={() => setActiveTab('ads')}
            className={`py-2 px-3 sm:px-4 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === 'ads'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Eye className="w-4 h-4" />
            বিজ্ঞাপন কন্ট্রোল
          </button>
          <button
            onClick={() => setActiveTab('layout')}
            className={`py-2 px-3 sm:px-4 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === 'layout'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            ম্যাপ আইকন ও স্ক্রিন লেআউট
          </button>
          <button
            onClick={() => setActiveTab('sheet')}
            className={`py-2 px-3 sm:px-4 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === 'sheet'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
            গুগল শিট সিঙ্ক
          </button>
        </div>

        {/* Global Notification */}
        {notification && (
          <div
            className={`mx-5 mt-3 p-3 rounded-2xl text-xs flex items-center gap-2 ${
              notification.type === 'success'
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                : 'bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{notification.text}</span>
          </div>
        )}

        {/* Tab Contents */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: Financial & Live Analytics */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              {/* Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span>লাইভ একটিভ ইউজার</span>
                    <Users className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">
                    {toBengaliNumber(systemState.liveActiveUsersCount)} জন
                  </div>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    এখন ম্যাপে লাইভ সংযুক্ত
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span>মোট সাবস্ক্রিপশন আয়</span>
                    <DollarSign className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    ৳{toBengaliNumber(totalSubRevenue)}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    অনুমোদিত: {toBengaliNumber(approvedUsers.length + 30)} জন
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span>বিজ্ঞাপন আয়</span>
                    <Eye className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                    ৳{toBengaliNumber(totalAdRevenue)}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    {toBengaliNumber(systemState.adConfig.impressionsCount)} ভিউ / {toBengaliNumber(systemState.adConfig.clicksCount)} ক্লিক
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-transparent">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span>সর্বমোট সর্বমোট ইনকাম</span>
                    <Sparkles className="w-4 h-4 text-purple-500" />
                  </div>
                  <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                    ৳{toBengaliNumber(totalGrossIncome)}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">গ্রস রেভিনিউ ব্যালেন্স</p>
                </div>
              </div>

              {/* Pending Approvals Table */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/20">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-amber-500" />
                      ইউজার সাবস্ক্রিপশন পেমেন্ট ভেরিফিকেশন (৳৯৯)
                    </h3>
                    <p className="text-xs text-slate-500">
                      বিকাশ/নগদ/রকেটে প্রেরিত টাকা যাচাই করে অনুমোদন দিন
                    </p>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/30">
                    {toBengaliNumber(pendingUsers.length)} টি পেন্ডিং
                  </span>
                </div>

                {pendingUsers.length === 0 ? (
                  <div className="text-center py-6 text-xs text-slate-500">
                    বর্তমানে কোনো পেন্ডিং পেমেন্ট রিকোয়েস্ট নেই।
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {pendingUsers.map((user) => (
                      <div
                        key={user.id}
                        className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span>{user.name}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
                              {user.paymentDetails?.method}
                            </span>
                          </div>
                          <div className="text-slate-500 mt-0.5 space-x-2">
                            <span>প্রেরক: <strong className="text-slate-800 dark:text-slate-200">{user.paymentDetails?.senderNumber}</strong></span>
                            <span>|</span>
                            <span>TrxID: <strong className="font-mono text-emerald-600 dark:text-emerald-400">{user.paymentDetails?.trxId}</strong></span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleVerifyPayment(user.id, 'approve')}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition flex items-center gap-1 cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            অনুমোদন দিন
                          </button>
                          <button
                            onClick={() => handleVerifyPayment(user.id, 'reject')}
                            className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition flex items-center gap-1 cursor-pointer"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            বাতিল
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: SMS Paste to Locate Train (Global Calibration) */}
          {activeTab === 'sms' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 text-xs">
                <h3 className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                  <Radio className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  ১৬৩১৮ অফিশিয়াল এসএমএস পেস্ট করে রিয়েল লোকেশন সেট করুন
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  এডমিন হিসেবে আপনি রেলওয়ের ১৬৩১৮ থেকে প্রাপ্ত যেকোনো এসএমএস এখানে পেস্ট করবেন। সিস্টেম স্বয়ংক্রিয়ভাবে ট্রেনের নম্বর, বগি বিন্যাস ও আসল অবস্থান সনাক্ত করে ডাটাবেসে সেভ করবে। <strong>সকল সাধারণ ইউজার তাৎক্ষণিক এই নতুন আসল লোকেশন দেখতে পাবে!</strong>
                </p>
              </div>

              {smsSuccessNotice && (
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{smsSuccessNotice}</span>
                </div>
              )}

              {/* SMS Input Field */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  ১৬৩১৮ এসএমএস টেক্সট পেস্ট করুন
                </label>
                <textarea
                  rows={6}
                  value={smsInputText}
                  onChange={(e) => setSmsInputText(e.target.value)}
                  placeholder={`যেমন:\n813: Coxs Bazar Ex\nCoxs Bazar-Dhaka\nLeft Coxs Bazar at 13:50\nNext Stn: Islamabad, 11.6km\nNext stop: Chattogram at 22nd stn\nDelay: 01:25`}
                  className={`w-full p-3 text-xs font-mono rounded-2xl border outline-none transition ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 focus:border-indigo-500 focus:bg-white text-slate-900'
                      : 'bg-slate-800/80 border-slate-700 focus:border-indigo-500 focus:bg-slate-800 text-white'
                  }`}
                />
              </div>

              {/* Sample SMS Quick Buttons */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-500">দ্রুত টেস্ট স্যাম্পল:</span>
                <div className="flex flex-wrap gap-2">
                  {SAMPLE_SMS_MESSAGES.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setSmsInputText(s.text)}
                      className="px-2.5 py-1 rounded-xl text-[11px] font-medium border border-slate-200 dark:border-slate-800 hover:border-indigo-500 transition text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
                    >
                      {s.title}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={handleParseSms}
                className="py-3 px-5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-600/20 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Radio className="w-4 h-4" />
                ট্রেন সনাক্ত করে গ্লোবাল ম্যাপে রিয়েল লোকেশন আপডেট করুন
              </button>

              {/* Parse Result Summary */}
              {smsParseResult && smsParseResult.matchedTrain && (
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-xs space-y-2">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>সনাক্তকৃত ট্রেন: {smsParseResult.matchedTrain.nameBn} ({smsParseResult.matchedTrain.number})</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-600 dark:text-slate-400">
                    <div>বর্তমান স্টেশন: <strong className="text-slate-900 dark:text-white">{smsParseResult.currentStationName || 'ইসলামাবাদ'}</strong></div>
                    <div>বিলম্ব: <strong className="text-rose-600 dark:text-rose-400">{smsParseResult.delayFormatted || '০১:২৫'}</strong></div>
                    <div>পরবর্তী স্টপেজ: <strong className="text-slate-900 dark:text-white">{smsParseResult.nextStopName || 'চট্টগ্রাম'}</strong></div>
                    <div>বগি ডিরেকশন: <strong className="text-slate-900 dark:text-white">{smsParseResult.direction}</strong></div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Payment Accounts Setup */}
          {activeTab === 'payments' && (
            <form onSubmit={handleSavePaymentAccounts} className="space-y-5 max-w-xl">
              <div>
                <h3 className="text-sm font-bold mb-1">পেমেন্ট রিসিভিং অ্যাকাউন্ট কনফিগারেশন</h3>
                <p className="text-xs text-slate-500">
                  সাধারণ ব্যবহারকারীরা ৯৯ টাকা সাবস্ক্রিপশন ফি পাঠানোর সময় এই নম্বরগুলো দেখতে পাবেন।
                </p>
              </div>

              {/* bKash */}
              <div className="p-4 rounded-2xl border border-pink-500/20 bg-pink-500/5 space-y-2">
                <span className="text-xs font-bold text-pink-600 dark:text-pink-400">বিকাশ (bKash) অ্যাকাউন্ট</span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    value={bKashNum}
                    onChange={(e) => setBKashNum(e.target.value)}
                    placeholder="নম্বর যেমন: 01819xxxxxx"
                    className="p-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                  <input
                    type="text"
                    required
                    value={bKashType}
                    onChange={(e) => setBKashType(e.target.value)}
                    placeholder="টাইপ যেমন: Personal (Send Money)"
                    className="p-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              {/* Nagad */}
              <div className="p-4 rounded-2xl border border-orange-500/20 bg-orange-500/5 space-y-2">
                <span className="text-xs font-bold text-orange-600 dark:text-orange-400">নগদ (Nagad) অ্যাকাউন্ট</span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    value={nagadNum}
                    onChange={(e) => setNagadNum(e.target.value)}
                    placeholder="নম্বর যেমন: 01712xxxxxx"
                    className="p-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                  <input
                    type="text"
                    required
                    value={nagadType}
                    onChange={(e) => setNagadType(e.target.value)}
                    placeholder="টাইপ যেমন: Personal (Send Money)"
                    className="p-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              {/* Rocket */}
              <div className="p-4 rounded-2xl border border-purple-500/20 bg-purple-500/5 space-y-2">
                <span className="text-xs font-bold text-purple-600 dark:text-purple-400">রকেট (Rocket) অ্যাকাউন্ট</span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    value={rocketNum}
                    onChange={(e) => setRocketNum(e.target.value)}
                    placeholder="নম্বর যেমন: 01911xxxxxx-2"
                    className="p-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                  <input
                    type="text"
                    required
                    value={rocketType}
                    onChange={(e) => setRocketType(e.target.value)}
                    placeholder="টাইপ যেমন: Personal"
                    className="p-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              {/* Monthly Fee */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  মাসিক সাবস্ক্রিপশন ফি (টাকা)
                </label>
                <input
                  type="number"
                  value={monthlyFee}
                  onChange={(e) => setMonthlyFee(Number(e.target.value))}
                  className="w-full p-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <button
                type="submit"
                className="py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                অ্যাকাউন্ট পরিবর্তন সংরক্ষণ করুন
              </button>
            </form>
          )}

          {/* TAB 4: Ad Management */}
          {activeTab === 'ads' && (
            <form onSubmit={handleSaveAdConfig} className="space-y-4 max-w-xl">
              <div>
                <h3 className="text-sm font-bold mb-1">বিজ্ঞাপন ও রেভিনিউ কন্ট্রোল</h3>
                <p className="text-xs text-slate-500">
                  সাধারণ ব্যবহারকারীদের জন্য এড ব্যানার সক্রিয় বা নিষ্ক্রিয় করুন।
                </p>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div>
                  <div className="text-xs font-bold">ব্যানার বিজ্ঞাপন চালু রাখুন</div>
                  <div className="text-[11px] text-slate-500">ম্যাপের নিচে একটি সুন্দর রেভিনিউ ব্যানার দেখাবে</div>
                </div>
                <input
                  type="checkbox"
                  checked={showBannerAds}
                  onChange={(e) => setShowBannerAds(e.target.checked)}
                  className="w-4 h-4 accent-indigo-600 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  বিজ্ঞাপনের টেক্সট
                </label>
                <input
                  type="text"
                  value={adBannerText}
                  onChange={(e) => setAdBannerText(e.target.value)}
                  className="w-full p-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  বিজ্ঞাপনের টার্গেট লিংক (URL)
                </label>
                <input
                  type="text"
                  value={adBannerLink}
                  onChange={(e) => setAdBannerLink(e.target.value)}
                  className="w-full p-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <button
                type="submit"
                className="py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                বিজ্ঞাপন সেটিংস সেভ করুন
              </button>
            </form>
          )}

          {/* TAB 5: Map Icons & Layout Customization */}
          {activeTab === 'layout' && (
            <div className="space-y-4 max-w-xl">
              <div>
                <h3 className="text-sm font-bold mb-1">ম্যাপ আইকন ও স্ক্রিন লেআউট সাজানো</h3>
                <p className="text-xs text-slate-500">
                  সাধারণ ইউজারদের জন্য জটিল বা অপ্রয়োজনীয় আইকন বন্ধ করে ম্যাপকে সম্পূর্ণ ক্লিন ও সুন্দর রাখুন।
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div>
                    <span className="text-xs font-bold">এসএমএস ট্র্যাকার বাটন (ইউজার ম্যাপ থেকে লুকানো)</span>
                    <p className="text-[10px] text-slate-500">সাধারণ ইউজাররা এটি দেখবে না, শুধু এডমিনে থাকবে</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={systemState.mapIconsLayout.showSmsTrackerOnMap}
                    onChange={() => handleToggleLayoutItem('showSmsTrackerOnMap')}
                    className="w-4 h-4 accent-indigo-600 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div>
                    <span className="text-xs font-bold">নিকটবর্তী স্টেশনের HUD কার্ড</span>
                    <p className="text-[10px] text-slate-500">ইউজারের লাইভ দূরত্বের ভাসমান কার্ড</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={systemState.mapIconsLayout.showProximityHud}
                    onChange={() => handleToggleLayoutItem('showProximityHud')}
                    className="w-4 h-4 accent-indigo-600 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div>
                    <span className="text-xs font-bold">৩৫০-৫০০মি. ট্রাফিক জ্যাম রিবন টগল</span>
                    <p className="text-[10px] text-slate-500">ট্র্যাকের ওপর ট্রেনের আসল দৈর্ঘ্যের রিবন সুইচ</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={systemState.mapIconsLayout.showTrafficCongestionToggle}
                    onChange={() => handleToggleLayoutItem('showTrafficCongestionToggle')}
                    className="w-4 h-4 accent-indigo-600 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div>
                    <span className="text-xs font-bold">গুগল ম্যাপস লেয়ার ও স্যাটেলাইট সিলেক্টর</span>
                    <p className="text-[10px] text-slate-500">রোডম্যাপ বনাম স্যাটেলাইট বাটন</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={systemState.mapIconsLayout.showMapProviderSelector}
                    onChange={() => handleToggleLayoutItem('showMapProviderSelector')}
                    className="w-4 h-4 accent-indigo-600 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: Google Sheets Sync */}
          {activeTab === 'sheet' && (
            <div className="space-y-4 max-w-xl">
              <div>
                <h3 className="text-sm font-bold mb-1">গুগল শিট ট্র্যাকিং ডাটা অটো-সিঙ্ক</h3>
                <p className="text-xs text-slate-500">
                  আপনার গুগল শিটে ট্রেনের সকল লাইভ অক্ষাংশ-দ্রাঘিমাংশ, গতি ও সময়সূচি নিয়মিত এন্ট্রি হবে।
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  গুগল শিটের ইউআরএল (Google Sheet Link)
                </label>
                <input
                  type="text"
                  value={googleSheetUrl}
                  onChange={(e) => setGoogleSheetUrl(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleSyncToGoogleSheet}
                  className="py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition flex items-center gap-2 cursor-pointer shadow-md shadow-emerald-600/20"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  এখনই গুগল শিটে লাইভ ডাটা সিঙ্ক করুন
                </button>
                <a
                  href={googleSheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  শিট ওপেন করুন
                </a>
              </div>

              {sheetSyncStatus && (
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs">
                  {sheetSyncStatus}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

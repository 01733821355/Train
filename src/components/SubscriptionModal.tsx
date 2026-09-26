import React, { useState } from 'react';
import { UserAccount, AuthDB, PaymentAccountConfig } from '../utils/authDatabase';
import { toBengaliNumber } from '../utils/geoUtils';
import { Crown, CheckCircle2, Clock, Smartphone, CreditCard, Send, X, AlertCircle, Sparkles } from 'lucide-react';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount | null;
  onPaymentSubmitted: () => void;
  theme?: 'light' | 'dark';
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onPaymentSubmitted,
  theme = 'dark',
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'bKash' | 'Nagad' | 'Rocket'>('bKash');
  const [senderNumber, setSenderNumber] = useState('');
  const [trxId, setTrxId] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const isLight = theme === 'light';
  const systemState = AuthDB.getSystemState();
  const paymentAccounts: PaymentAccountConfig = systemState.paymentAccounts;

  const subscriptionStatus = currentUser
    ? AuthDB.checkSubscriptionStatus(currentUser)
    : { isTrialActive: false, isPaid: false, daysRemaining: 0, hoursRemaining: 0, requiresPayment: false };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setMessage(null);

    if (!senderNumber || senderNumber.trim().length < 11) {
      setMessage({ type: 'error', text: 'অনুগ্রহ করে সঠিক ১১ সংখ্যার মোবাইল নম্বর দিন' });
      return;
    }
    if (!trxId || trxId.trim().length < 6) {
      setMessage({ type: 'error', text: 'অনুগ্রহ করে সঠিক ট্রানজেকশন আইডি (TrxID) দিন' });
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const result = AuthDB.submitPayment(currentUser.id, selectedMethod, senderNumber, trxId);
      setIsSubmitting(false);

      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        onPaymentSubmitted();
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    }, 400);
  };

  const getTargetNumber = () => {
    if (selectedMethod === 'bKash') return { num: paymentAccounts.bKashNumber, type: paymentAccounts.bKashType };
    if (selectedMethod === 'Nagad') return { num: paymentAccounts.nagadNumber, type: paymentAccounts.nagadType };
    return { num: paymentAccounts.rocketNumber, type: paymentAccounts.rocketType };
  };

  const targetInfo = getTargetNumber();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden transition-all max-h-[90vh] flex flex-col ${
          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-slate-100'
        }`}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/20">
              <Crown className="w-5 h-5 font-bold" />
            </div>
            <div>
              <h2 className="text-base font-bold flex items-center gap-2">
                প্রিমিয়াম পাস ও মেম্বারশিপ
                <span className="text-[10px] bg-amber-500/20 text-amber-500 font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                  ৳৯৯ / মাস
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                ৩৫০-৫০০মি. গুগল ট্র্যাকিং ক্লাস্টার ও লাইভ সিগন্যাল মনিটরিং
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Trial Status Card */}
          {subscriptionStatus.isTrialActive && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-300">
                    ৩ দিনের ফ্রি প্রিমিয়াম ট্রায়াল সক্রিয় রয়েছে
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    আপনার ফ্রি ট্রায়ালের আর মাত্র{' '}
                    <strong className="text-emerald-600 dark:text-emerald-400 font-bold">
                      {toBengaliNumber(subscriptionStatus.daysRemaining)} দিন {toBengaliNumber(subscriptionStatus.hoursRemaining)} ঘণ্টা
                    </strong>{' '}
                    বাকি আছে।
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-1 rounded-xl bg-emerald-600 text-white">
                ফ্রি ট্রায়াল
              </span>
            </div>
          )}

          {/* Pending Status Alert */}
          {currentUser?.paymentStatus === 'pending' && (
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 flex items-center gap-2.5">
              <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 animate-spin" />
              <div className="text-xs">
                <h4 className="font-bold text-amber-900 dark:text-amber-300">
                  আপনার পেমেন্ট ভেরিফিকেশন পেন্ডিং আছে
                </h4>
                <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                  এডমিন আপনার TrxID ভেরিফাই করে অনুমোদন করার সাথে সাথে প্রিমিয়াম চালু হয়ে যাবে।
                </p>
              </div>
            </div>
          )}

          {/* Approved Subscription Alert */}
          {currentUser?.paymentStatus === 'approved' && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div className="text-xs">
                <h4 className="font-bold text-emerald-900 dark:text-emerald-300">
                  প্রিমিয়াম সাবস্ক্রিপশন সক্রিয় রয়েছে
                </h4>
                <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                  আপনি আগামী ৩০ দিনের জন্য আনলিমিটেড লাইভ ট্র্যাকিং ব্যবহারের পূর্ণ সুবিধা পাচ্ছেন।
                </p>
              </div>
            </div>
          )}

          {/* Subscription Features */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
              <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                ৩৫০-৫০০মি. রাডার
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">১৬ বগির আসল ট্রেনের দৈর্ঘ্য ক্লাস্টার</p>
            </div>
            <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
              <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                রিয়েল-টাইম সিগন্যাল
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">আউটার ও লুপ লাইন জ্যাম ডিটেকশন</p>
            </div>
            <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
              <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                অটো-লগইন সুবিধা
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">ডিভাইস মেমরিতে পাসওয়ার্ডহীন প্রবেশ</p>
            </div>
            <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
              <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                বিজ্ঞাপনমুক্ত মসৃণ অভিজ্ঞতা
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">কোনো বিলম্ব ছাড়া দ্রুততম ম্যাপ লোড</p>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-2 pt-1">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              পেমেন্ট মাধ্যম সিলেক্ট করুন (ফি: ৳৯৯/মাস)
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedMethod('bKash')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                  selectedMethod === 'bKash'
                    ? 'border-pink-500 bg-pink-500/10 text-pink-600 dark:text-pink-400 ring-2 ring-pink-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <span>বিকাশ (bKash)</span>
                <span className="text-[10px] font-normal opacity-80">Send Money</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedMethod('Nagad')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                  selectedMethod === 'Nagad'
                    ? 'border-orange-500 bg-orange-500/10 text-orange-600 dark:text-orange-400 ring-2 ring-orange-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <span>নগদ (Nagad)</span>
                <span className="text-[10px] font-normal opacity-80">Send Money</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedMethod('Rocket')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                  selectedMethod === 'Rocket'
                    ? 'border-purple-500 bg-purple-500/10 text-purple-600 dark:text-purple-400 ring-2 ring-purple-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <span>রকেট (Rocket)</span>
                <span className="text-[10px] font-normal opacity-80">Personal</span>
              </button>
            </div>
          </div>

          {/* Account Details Box */}
          <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">প্রাপক অ্যাকাউন্ট নম্বর:</span>
              <span className="font-mono font-bold text-sm text-slate-900 dark:text-white select-all">
                {targetInfo.num}
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500 dark:text-slate-400">অ্যাকাউন্ট টাইপ:</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">{targetInfo.type}</span>
            </div>
            <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200 dark:border-slate-700">
              <span className="text-slate-500 dark:text-slate-400">নির্ধারিত ফি:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">৳৯৯ টাকা (১ মাস)</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3 pt-1">
            {message && (
              <div
                className={`p-3 rounded-2xl text-xs flex items-center gap-2 ${
                  message.type === 'success'
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                    : 'bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400'
                }`}
              >
                {message.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{message.text}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                প্রেরকের মোবাইল নম্বর (যে নম্বর থেকে টাকা পাঠিয়েছেন)
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="যেমন: 017xxxxxxxx"
                  value={senderNumber}
                  onChange={(e) => setSenderNumber(e.target.value)}
                  className={`w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border outline-none transition ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 focus:border-amber-500 focus:bg-white text-slate-900'
                      : 'bg-slate-800/80 border-slate-700 focus:border-amber-500 focus:bg-slate-800 text-white'
                  }`}
                />
                <Smartphone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                ট্রানজেকশন আইডি (TrxID)
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="যেমন: 9J3K8LZ2"
                  value={trxId}
                  onChange={(e) => setTrxId(e.target.value)}
                  className={`w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border outline-none font-mono uppercase transition ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 focus:border-amber-500 focus:bg-white text-slate-900'
                      : 'bg-slate-800/80 border-slate-700 focus:border-amber-500 focus:bg-slate-800 text-white'
                  }`}
                />
                <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !currentUser}
              className="w-full py-3 px-4 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {isSubmitting ? 'জমা দেওয়া হচ্ছে...' : 'পেমেন্ট ভেরিফিকেশনের জন্য সাবমিট করুন'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

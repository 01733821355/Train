import React, { useState } from 'react';
import { UserAccount, AuthDB, DEFAULT_ADMIN_USERNAME, DEFAULT_ADMIN_PASSWORD } from '../utils/authDatabase';
import { ShieldCheck, User, Lock, CheckCircle2, AlertCircle, KeyRound, Sparkles, X, Smartphone } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserAccount) => void;
  theme?: 'light' | 'dark';
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  theme = 'dark',
}) => {
  const [activeTab, setActiveTab] = useState<'user' | 'admin'>('user');

  // General User state
  const [userName, setUserName] = useState('');
  const [userPassword, setUserPassword] = useState('');

  // Admin state
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const isLight = theme === 'light';

  // Handle General User Login / Register
  const handleUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!userName.trim()) {
      setErrorMessage('অনুগ্রহ করে আপনার নাম দিন');
      return;
    }
    if (!userPassword || userPassword.length < 4) {
      setErrorMessage('পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const result = AuthDB.loginOrRegisterUser(userName, userPassword);
      setIsLoading(false);

      if (result.success && result.user) {
        setSuccessMessage('লগইন সফল হয়েছে! এই ডিভাইসে আপনার একাউন্ট স্বয়ংক্রিয়ভাবে সংরক্ষিত হয়েছে।');
        setTimeout(() => {
          onLoginSuccess(result.user!);
          onClose();
        }, 600);
      } else {
        setErrorMessage(result.message || 'লগইন ব্যর্থ হয়েছে');
      }
    }, 300);
  };

  // Handle Admin Login
  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!adminUsername.trim() || !adminPassword.trim()) {
      setErrorMessage('এডমিন ইউজারনেম এবং পাসওয়ার্ড উভয়ই প্রদান করুন');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const result = AuthDB.loginAdmin(adminUsername.trim(), adminPassword.trim());
      setIsLoading(false);

      if (result.success && result.user) {
        setSuccessMessage('এডমিন হিসেবে সফলভাবে লগইন হয়েছে!');
        setTimeout(() => {
          onLoginSuccess(result.user!);
          onClose();
        }, 500);
      } else {
        setErrorMessage(result.message || 'ভুল এডমিন তথ্য! সঠিক ইউজারনেম ও পাসওয়ার্ড দিন।');
      }
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`w-full max-w-md rounded-3xl border shadow-2xl overflow-hidden transition-all ${
          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-slate-100'
        }`}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">লগইন ও একাউন্ট পোর্টাল</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                বাংলাদেশ রেলওয়ে লাইভ ক্লাস্টার ট্র্যাকার
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

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 p-1.5 bg-slate-100 dark:bg-slate-950/50">
          <button
            onClick={() => {
              setActiveTab('user');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'user'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <User className="w-4 h-4" />
            সাধারণ যাত্রী লগইন
          </button>
          <button
            onClick={() => {
              setActiveTab('admin');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'admin'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            এডমিন লগইন
          </button>
        </div>

        {/* Messages */}
        {errorMessage && (
          <div className="mx-5 mt-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
        {successMessage && (
          <div className="mx-5 mt-4 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* User Form */}
        {activeTab === 'user' ? (
          <form onSubmit={handleUserSubmit} className="p-5 space-y-4">
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-300">
                <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>প্রথম ৩ দিন সম্পূর্ণ ফ্রি প্রিমিয়াম ট্রায়াল!</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                আপনার নাম ও পাসওয়ার্ড দিয়ে একবার লগইন করলে এই ডিভাইসে আপনার একাউন্ট সংরক্ষিত হয়ে যাবে। ভবিষ্যতে আর পাসওয়ার্ড দিতে হবে না!
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                আপনার নাম (Full Name)
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="যেমন: মোঃ সাব্বির আহমেদ"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className={`w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border outline-none transition ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 focus:border-emerald-500 focus:bg-white text-slate-900'
                      : 'bg-slate-800/80 border-slate-700 focus:border-emerald-500 focus:bg-slate-800 text-white'
                  }`}
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                পাসওয়ার্ড (Password)
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="কমপক্ষে ৪ অক্ষরের পাসওয়ার্ড দিন"
                  value={userPassword}
                  onChange={(e) => setUserPassword(e.target.value)}
                  className={`w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border outline-none transition ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 focus:border-emerald-500 focus:bg-white text-slate-900'
                      : 'bg-slate-800/80 border-slate-700 focus:border-emerald-500 focus:bg-slate-800 text-white'
                  }`}
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500 dark:text-slate-400">
              <Smartphone className="w-3.5 h-3.5 text-emerald-500" />
              <span>এই ডিভাইসে অটো-লগইন সক্রিয় থাকবে</span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? 'প্রবেশ করা হচ্ছে...' : 'লগইন করুন / একাউন্ট খুলুন'}
            </button>
          </form>
        ) : (
          /* Admin Form */
          <form onSubmit={handleAdminSubmit} className="p-5 space-y-4">
            <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800/40 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-indigo-800 dark:text-indigo-300">
                <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>নিরাপদ এডমিন এক্সেস কন্ট্রোল</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                এডমিন প্যানেলে প্রবেশ করতে প্রতিবার ইউজারনেম ও পাসওয়ার্ড উভয়ই প্রদান করতে হবে। (ডিফল্ট: admin / admin123)
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                এডমিন ইউজারনেম (Admin Username)
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="যেমন: admin"
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  className={`w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border outline-none transition ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 focus:border-indigo-500 focus:bg-white text-slate-900'
                      : 'bg-slate-800/80 border-slate-700 focus:border-indigo-500 focus:bg-slate-800 text-white'
                  }`}
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                এডমিন পাসওয়ার্ড (Admin Password)
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="পাসওয়ার্ড দিন"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className={`w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border outline-none transition ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 focus:border-indigo-500 focus:bg-white text-slate-900'
                      : 'bg-slate-800/80 border-slate-700 focus:border-indigo-500 focus:bg-slate-800 text-white'
                  }`}
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? 'যাচাই করা হচ্ছে...' : 'এডমিন ড্যাশবোর্ডে প্রবেশ'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

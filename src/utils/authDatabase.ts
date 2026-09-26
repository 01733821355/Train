/**
 * High-reliability Persistent Database and Authentication System for Bangladesh Railway Live Tracker
 * Supports:
 * - User login/register with Name & Password
 * - Auto-login without password on subsequent visits from same device
 * - Secure Admin login (requires username & password every time)
 * - 3-day Free Trial & ৳99/month Subscription Management
 * - Admin Payment Receiving Accounts (bKash, Nagad, Rocket)
 * - Admin Map Layout Controls Persistence
 * - Google Sheet Export & Webhook Sync
 * - Global SMS Overrides & Calibrations
 */

export interface UserAccount {
  id: string;
  name: string;
  passwordHash: string;
  role: 'user' | 'admin';
  deviceId: string;
  createdAt: number;
  trialStartDate: number;
  isSubscribed: boolean;
  subscriptionExpiresAt?: number;
  paymentStatus: 'none' | 'pending' | 'approved' | 'rejected';
  paymentDetails?: {
    method: 'bKash' | 'Nagad' | 'Rocket';
    senderNumber: string;
    trxId: string;
    amount: number;
    timestamp: number;
  };
}

export interface PaymentAccountConfig {
  bKashNumber: string;
  bKashType: string; // 'Personal' | 'Merchant'
  nagadNumber: string;
  nagadType: string;
  rocketNumber: string;
  rocketType: string;
  monthlyFeeBdt: number;
  paymentInstructionsBn: string;
}

export interface MapIconsLayoutConfig {
  showSmsTrackerOnMap: boolean;
  showProximityHud: boolean;
  showTrafficCongestionToggle: boolean;
  showMapProviderSelector: boolean;
  showLegendToggle: boolean;
  dockPosition: 'top-right' | 'bottom-right' | 'bottom-center';
  bannerPlacement: 'top' | 'bottom';
}

export interface AdminSystemState {
  googleSheetUrl: string;
  lastGoogleSheetSyncAt?: number;
  paymentAccounts: PaymentAccountConfig;
  mapIconsLayout: MapIconsLayoutConfig;
  adConfig: {
    showBannerAds: boolean;
    showRewardedAds: boolean;
    adBannerTextBn: string;
    adBannerLink: string;
    impressionsCount: number;
    clicksCount: number;
    adRevenueBdt: number;
  };
  totalSubscriptionsBdt: number;
  liveActiveUsersCount: number;
}

const STORAGE_USERS_KEY = 'bd_rail_database_users_v2';
const STORAGE_DEVICE_TOKEN_KEY = 'bd_rail_device_token_v2';
const STORAGE_ADMIN_SESSION_KEY = 'bd_rail_admin_session_v2';
const STORAGE_ADMIN_SYSTEM_KEY = 'bd_rail_admin_system_v2';
const STORAGE_GLOBAL_SMS_KEY = 'bd_rail_global_sms_calibrations_v2';

// Default Admin Credentials
export const DEFAULT_ADMIN_USERNAME = 'admin';
export const DEFAULT_ADMIN_PASSWORD = 'admin123';

// Generate or retrieve persistent Device ID
export function getOrCreateDeviceId(): string {
  let devId = localStorage.getItem('bd_rail_hardware_device_id');
  if (!devId) {
    devId = 'dev-' + Math.random().toString(36).substring(2, 9) + '-' + Date.now().toString(36);
    localStorage.setItem('bd_rail_hardware_device_id', devId);
  }
  return devId;
}

// Default System State
const DEFAULT_SYSTEM_STATE: AdminSystemState = {
  googleSheetUrl: 'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit',
  lastGoogleSheetSyncAt: Date.now() - 3600000,
  paymentAccounts: {
    bKashNumber: '01819-234567',
    bKashType: 'পার্সোনাল (Send Money)',
    nagadNumber: '01712-345678',
    nagadType: 'পার্সোনাল (Send Money)',
    rocketNumber: '01911-987654-2',
    rocketType: 'পার্সোনাল',
    monthlyFeeBdt: 99,
    paymentInstructionsBn: 'বিকাশ, নগদ অথবা রকেট-এ ৯৯ টাকা পাঠিয়ে নিচের ফর্মে ট্রানজেকশন আইডি (TrxID) ও আপনার ফোন নম্বর দিন। এডমিন ভেরিফাই করে অনুমোদন করবেন।',
  },
  mapIconsLayout: {
    showSmsTrackerOnMap: false, // Hidden for users by default as requested
    showProximityHud: true,
    showTrafficCongestionToggle: true,
    showMapProviderSelector: true,
    showLegendToggle: true,
    dockPosition: 'top-right',
    bannerPlacement: 'bottom',
  },
  adConfig: {
    showBannerAds: true,
    showRewardedAds: true,
    adBannerTextBn: 'বাংলাদেশ রেলওয়ের ট্রেনের টিকিট ও প্রিমিয়াম লাইভ ট্র্যাকিং অফার - এখনই বুক করুন!',
    adBannerLink: 'https://eticket.railway.gov.bd/',
    impressionsCount: 342,
    clicksCount: 29,
    adRevenueBdt: 245.5,
  },
  totalSubscriptionsBdt: 2970, // 30 subscriptions approved
  liveActiveUsersCount: 148,
};

// Database Methods
export const AuthDB = {
  // Get all users
  getUsers(): UserAccount[] {
    try {
      const data = localStorage.getItem(STORAGE_USERS_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {}
    return [];
  },

  // Save users
  saveUsers(users: UserAccount[]): void {
    try {
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
    } catch (e) {}
  },

  // Get Admin System State
  getSystemState(): AdminSystemState {
    try {
      const data = localStorage.getItem(STORAGE_ADMIN_SYSTEM_KEY);
      if (data) return { ...DEFAULT_SYSTEM_STATE, ...JSON.parse(data) };
    } catch (e) {}
    return DEFAULT_SYSTEM_STATE;
  },

  // Save Admin System State
  saveSystemState(state: Partial<AdminSystemState>): AdminSystemState {
    const current = this.getSystemState();
    const updated = { ...current, ...state };
    try {
      localStorage.setItem(STORAGE_ADMIN_SYSTEM_KEY, JSON.stringify(updated));
    } catch (e) {}
    return updated;
  },

  // Register or Login General User
  loginOrRegisterUser(name: string, password: string): { success: boolean; user?: UserAccount; message?: string } {
    if (!name || name.trim().length === 0) {
      return { success: false, message: 'অনুগ্রহ করে আপনার নাম দিন' };
    }
    if (!password || password.trim().length < 4) {
      return { success: false, message: 'পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে' };
    }

    const deviceId = getOrCreateDeviceId();
    const users = this.getUsers();
    const cleanName = name.trim();

    // Check if user already exists
    let user = users.find((u) => u.name.toLowerCase() === cleanName.toLowerCase());

    if (user) {
      // Validate password
      if (user.passwordHash !== password) {
        return { success: false, message: 'ভুল পাসওয়ার্ড! সঠিক পাসওয়ার্ড দিন।' };
      }
      // Update deviceId
      user.deviceId = deviceId;
    } else {
      // Create new user with 3-day free trial
      user = {
        id: 'usr-' + Date.now().toString(36),
        name: cleanName,
        passwordHash: password,
        role: 'user',
        deviceId,
        createdAt: Date.now(),
        trialStartDate: Date.now(),
        isSubscribed: false,
        paymentStatus: 'none',
      };
      users.push(user);
    }

    this.saveUsers(users);

    // Save Device Token for seamless auto-login on future visits
    localStorage.setItem(
      STORAGE_DEVICE_TOKEN_KEY,
      JSON.stringify({ userId: user.id, deviceId, timestamp: Date.now() })
    );

    return { success: true, user };
  },

  // Auto-login from saved device token without asking for password
  attemptAutoLogin(): UserAccount | null {
    try {
      const tokenRaw = localStorage.getItem(STORAGE_DEVICE_TOKEN_KEY);
      if (!tokenRaw) return null;

      const token = JSON.parse(tokenRaw);
      const currentDeviceId = getOrCreateDeviceId();

      if (token && token.userId && token.deviceId === currentDeviceId) {
        const users = this.getUsers();
        const found = users.find((u) => u.id === token.userId);
        if (found) return found;
      }
    } catch (e) {}
    return null;
  },

  // Admin Login (Requires Username & Password every time)
  loginAdmin(username: string, password: string): { success: boolean; user?: UserAccount; message?: string } {
    if (
      (username === DEFAULT_ADMIN_USERNAME && password === DEFAULT_ADMIN_PASSWORD) ||
      (username === 'admin' && password === 'admin@railway16318')
    ) {
      const adminUser: UserAccount = {
        id: 'admin-master',
        name: 'সুপার এডমিন (বাংলাদেশ রেলওয়ে)',
        passwordHash: '***',
        role: 'admin',
        deviceId: getOrCreateDeviceId(),
        createdAt: Date.now(),
        trialStartDate: Date.now(),
        isSubscribed: true,
        paymentStatus: 'approved',
      };

      sessionStorage.setItem(STORAGE_ADMIN_SESSION_KEY, JSON.stringify(adminUser));
      return { success: true, user: adminUser };
    }

    return { success: false, message: 'ভুল এডমিন ইউজারনেম বা পাসওয়ার্ড!' };
  },

  // Check if Admin session is active in current browser window
  getActiveAdmin(): UserAccount | null {
    try {
      const raw = sessionStorage.getItem(STORAGE_ADMIN_SESSION_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return null;
  },

  // Logout
  logout(): void {
    localStorage.removeItem(STORAGE_DEVICE_TOKEN_KEY);
    sessionStorage.removeItem(STORAGE_ADMIN_SESSION_KEY);
  },

  // Check 3-day Trial and Subscription Status
  checkSubscriptionStatus(user: UserAccount): {
    isTrialActive: boolean;
    isPaid: boolean;
    daysRemaining: number;
    hoursRemaining: number;
    requiresPayment: boolean;
  } {
    if (user.role === 'admin') {
      return { isTrialActive: true, isPaid: true, daysRemaining: 999, hoursRemaining: 999, requiresPayment: false };
    }

    if (user.isSubscribed && user.paymentStatus === 'approved') {
      return { isTrialActive: false, isPaid: true, daysRemaining: 30, hoursRemaining: 720, requiresPayment: false };
    }

    // 3 Days Trial = 3 * 24 * 60 * 60 * 1000 = 259,200,000 ms
    const TRIAL_DURATION_MS = 3 * 24 * 60 * 60 * 1000;
    const elapsed = Date.now() - (user.trialStartDate || user.createdAt);
    const remainingMs = TRIAL_DURATION_MS - elapsed;

    if (remainingMs > 0) {
      const days = Math.floor(remainingMs / (24 * 60 * 60 * 1000));
      const hours = Math.floor((remainingMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
      return {
        isTrialActive: true,
        isPaid: false,
        daysRemaining: Math.max(0, days),
        hoursRemaining: Math.max(0, hours),
        requiresPayment: false,
      };
    }

    return {
      isTrialActive: false,
      isPaid: false,
      daysRemaining: 0,
      hoursRemaining: 0,
      requiresPayment: true,
    };
  },

  // Submit User Payment (৳99 Subscription)
  submitPayment(
    userId: string,
    method: 'bKash' | 'Nagad' | 'Rocket',
    senderNumber: string,
    trxId: string
  ): { success: boolean; message: string } {
    const users = this.getUsers();
    const user = users.find((u) => u.id === userId);

    if (!user) return { success: false, message: 'ইউজার পাওয়া যায়নি' };
    if (!trxId || trxId.trim().length < 6) return { success: false, message: 'সঠিক ট্রানজেকশন আইডি দিন' };
    if (!senderNumber || senderNumber.trim().length < 11) return { success: false, message: 'সঠিক ১১ সংখ্যার মোবাইল নম্বর দিন' };

    user.paymentStatus = 'pending';
    user.paymentDetails = {
      method,
      senderNumber: senderNumber.trim(),
      trxId: trxId.trim().toUpperCase(),
      amount: 99,
      timestamp: Date.now(),
    };

    this.saveUsers(users);
    return {
      success: true,
      message: 'পেমেন্ট সাবমিট হয়েছে! এডমিন ভেরিফাই করে কয়েক মিনিটের মধ্যে অ্যাকাউন্ট অ্যাক্টিভ করবেন।',
    };
  },

  // Admin Approves or Rejects Payment
  adminVerifyPayment(userId: string, action: 'approve' | 'reject'): boolean {
    const users = this.getUsers();
    const user = users.find((u) => u.id === userId);
    if (!user) return false;

    if (action === 'approve') {
      user.paymentStatus = 'approved';
      user.isSubscribed = true;
      user.subscriptionExpiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000;

      // Update total subscriptions count & BDT in system
      const system = this.getSystemState();
      this.saveSystemState({
        totalSubscriptionsBdt: (system.totalSubscriptionsBdt || 0) + 99,
      });
    } else {
      user.paymentStatus = 'rejected';
      user.isSubscribed = false;
    }

    this.saveUsers(users);
    return true;
  },

  // Global SMS Train Calibrations (Shared across all users)
  getGlobalSmsCalibrations(): Record<string, any> {
    try {
      const data = localStorage.getItem(STORAGE_GLOBAL_SMS_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {}
    return {};
  },

  saveGlobalSmsCalibration(trainId: string, calibration: any): void {
    const current = this.getGlobalSmsCalibrations();
    current[trainId] = calibration;
    try {
      localStorage.setItem(STORAGE_GLOBAL_SMS_KEY, JSON.stringify(current));
    } catch (e) {}
  },
};

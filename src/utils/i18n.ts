export type Language = 'bn' | 'en';

export interface Translations {
  app_title: string;
  app_subtitle: string;
  live: string;
  map_view: string;
  trains: string;
  ticket: string;
  bogie_layout: string;
  settings: string;
  radar: string;
  my_location: string;
  location_active: string;
  locating: string;
  location_error: string;
  location_off: string;
  dark_mode: string;
  light_mode: string;
  bst: string;
  play: string;
  pause: string;
  reset_realtime: string;
  now: string;
  
  // Onboard & Alarm
  onboard_title: string;
  onboard_subtitle: string;
  im_on_this_train: string;
  onboard_active_badge: string;
  select_train: string;
  select_destination: string;
  destination: string;
  origin: string;
  remaining_distance: string;
  remaining_stops: string;
  estimated_arrival: string;
  start_trip: string;
  end_trip: string;
  alarm_ready: string;
  alarm_triggered_title: string;
  alarm_triggered_msg: string;
  dismiss_alarm: string;
  test_alarm: string;
  
  // Relocation
  relocate_train_btn: string;
  relocate_confirm: string;
  relocate_success: string;
  relocate_rejected_offtrack: string;
  
  // Map Tools
  map_layer: string;
  roadmap: string;
  satellite: string;
  traffic: string;
  geo_mode: string;
  schematic_mode: string;
  gis_overlay: string;
  next_train: string;
  legend: string;
  active_trains: string;
  speed: string;
  km_per_hour: string;
  km_away: string;
  next_stop: string;
  nearest_station: string;
  track_free: string;
  close: string;
}

export const translations: Record<Language, Translations> = {
  bn: {
    app_title: 'বাংলাদেশ রেলওয়ে ট্র্যাকার',
    app_subtitle: 'লাইভ ট্রেন ট্র্যাকিং ও এলার্ম',
    live: 'লাইভ',
    map_view: 'ম্যাপ ভিউ',
    trains: 'ট্রেন',
    ticket: 'ই-টিকেট',
    bogie_layout: 'বগি বিন্যাস',
    settings: 'সেটিংস',
    radar: 'রাডার',
    my_location: 'আমার লোকেশন',
    location_active: 'লোকেশন অন',
    locating: 'খোঁজা হচ্ছে...',
    location_error: 'লোকেশন অনুমতি প্রয়োজন',
    location_off: 'বন্ধ',
    dark_mode: 'ডার্ক',
    light_mode: 'লাইট',
    bst: 'বিএসটি',
    play: 'প্লে',
    pause: 'বিরতি',
    reset_realtime: 'লাইভ সময়',
    now: 'এখন',

    onboard_title: 'আমি এই ট্রেনে আছি',
    onboard_subtitle: 'গন্তব্য নির্বাচন ও অটো এলার্ম',
    im_on_this_train: 'আমি এই ট্রেনে আছি',
    onboard_active_badge: 'অন-বোর্ড সক্রিয়',
    select_train: 'ট্রেন নির্বাচন করুন',
    select_destination: 'আপনার গন্তব্য স্টেশন নির্বাচন করুন',
    destination: 'গন্তব্য স্টেশন',
    origin: 'যাত্রা শুরু',
    remaining_distance: 'অবশিষ্ট দূরত্ব',
    remaining_stops: 'বাকি স্টেশন',
    estimated_arrival: 'পৌঁছানোর সম্ভাব্য সময়',
    start_trip: 'ট্রিপ শুরু করুন ও এলার্ম চালু করুন',
    end_trip: 'ট্রিপ শেষ করুন',
    alarm_ready: 'গন্তব্যের ২ কিমি আগে এলার্ম বেজে উঠবে',
    alarm_triggered_title: '🔔 গন্তব্যে পৌঁছে গেছেন!',
    alarm_triggered_msg: 'আপনার গন্তব্য স্টেশন কাছে চলে এসেছে। ট্রেন এখনই থামবে, নামার জন্য প্রস্তুতি নিন!',
    dismiss_alarm: 'এলার্ম বন্ধ করুন',
    test_alarm: 'এলার্ম টেস্ট করুন',

    relocate_train_btn: 'আমার GPS দিয়ে ট্রেনের অবস্থান রিলোকেট করুন',
    relocate_confirm: 'আপনি কি ট্রেনের অবস্থান আপডেট করতে চান?',
    relocate_success: '✅ ট্রেনের অবস্থান সফলভাবে রিলোকেট করা হয়েছে (রেলট্র্যাক ভেরিফাইড)!',
    relocate_rejected_offtrack: '❌ আপনি রেললাইন থেকে দূরে অবস্থান করছেন! রেললাইনের বাইরে থেকে ট্রেনের অবস্থান রিলোকেট করা যাবে না।',

    map_layer: 'ম্যাপ লেয়ার',
    roadmap: 'ম্যাপ',
    satellite: 'স্যাটেলাইট',
    traffic: 'ট্রাফিক',
    geo_mode: 'উচ্চ-নির্ভুল জিও',
    schematic_mode: 'স্কিম্যাটিক',
    gis_overlay: 'রেলওয়ে ট্র্যাক',
    next_train: 'পরবর্তী ট্রেন',
    legend: 'লেজেন্ড',
    active_trains: 'সক্রিয় ট্রেন',
    speed: 'গতি',
    km_per_hour: 'কিমি/ঘণ্টা',
    km_away: 'কিমি দূরে',
    next_stop: 'পরবর্তী স্টেশন',
    nearest_station: 'নিকটতম রেলস্টেশন',
    track_free: 'ট্র্যাক সম্পূর্ণ মুক্ত',
    close: 'বন্ধ',
  },
  en: {
    app_title: 'BD Rail Live Tracker',
    app_subtitle: 'Real-Time Train Tracking & Alarm',
    live: 'LIVE',
    map_view: 'Map View',
    trains: 'Trains',
    ticket: 'E-Ticket',
    bogie_layout: 'Coaches',
    settings: 'Settings',
    radar: 'Radar',
    my_location: 'My Location',
    location_active: 'Location On',
    locating: 'Locating...',
    location_error: 'Location permission needed',
    location_off: 'Off',
    dark_mode: 'Dark',
    light_mode: 'Light',
    bst: 'BST',
    play: 'Play',
    pause: 'Pause',
    reset_realtime: 'Live BST',
    now: 'Now',

    onboard_title: "I'm on this train",
    onboard_subtitle: 'Destination & Arrival Wake-Up Alarm',
    im_on_this_train: "I'm on this train",
    onboard_active_badge: 'On-Board Active',
    select_train: 'Select Train',
    select_destination: 'Select Destination Station',
    destination: 'Destination',
    origin: 'Origin',
    remaining_distance: 'Remaining Distance',
    remaining_stops: 'Remaining Stops',
    estimated_arrival: 'Est. Arrival Time',
    start_trip: 'Start Trip & Arm Alarm',
    end_trip: 'End Trip',
    alarm_ready: 'Alarm will ring 2 km before destination',
    alarm_triggered_title: '🔔 Approaching Destination!',
    alarm_triggered_msg: 'Your destination station is within reach. Please prepare to disembark!',
    dismiss_alarm: 'Dismiss Alarm',
    test_alarm: 'Test Alarm Sound',

    relocate_train_btn: 'Relocate Train with My GPS',
    relocate_confirm: 'Update train location with your current GPS?',
    relocate_success: '✅ Train relocated successfully (track position verified)!',
    relocate_rejected_offtrack: '❌ You are too far from the railway line! Location update rejected.',

    map_layer: 'Map Style',
    roadmap: 'Map',
    satellite: 'Satellite',
    traffic: 'Traffic',
    geo_mode: 'Geo Alignment',
    schematic_mode: 'Schematic',
    gis_overlay: 'Rail Tracks',
    next_train: 'Next Train',
    legend: 'Legend',
    active_trains: 'Active Trains',
    speed: 'Speed',
    km_per_hour: 'km/h',
    km_away: 'km away',
    next_stop: 'Next Station',
    nearest_station: 'Nearest Station',
    track_free: 'Track Clear',
    close: 'Close',
  },
};

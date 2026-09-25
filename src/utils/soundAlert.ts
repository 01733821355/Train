// Web Audio API Synthesizer Alarm for Train Arrival & Wake-Up
let audioCtx: AudioContext | null = null;
let alarmIntervalId: any = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContextClass) return null;
  if (!audioCtx) {
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playSingleChime() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Chime notes: D5 (587.33), A5 (880), D6 (1174.66)
    const notes = [587.33, 880, 1174.66];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.15);

      gain.gain.setValueAtTime(0.3, now + i * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + i * 0.15);
      osc.stop(now + i * 0.15 + 0.65);
    });
  } catch (err) {
    console.warn('Audio alarm playback error:', err);
  }
}

export function playUrgentTrainAlarm() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Dual-tone urgent alert siren (E5 - 659.25Hz and B5 - 987.77Hz, repeating)
    const tones = [659.25, 987.77, 659.25, 987.77, 1318.5];
    tones.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.14);

      gain.gain.setValueAtTime(0.45, now + i * 0.14);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.14 + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + i * 0.14);
      osc.stop(now + i * 0.14 + 0.5);
    });
  } catch (err) {
    console.warn('Audio alarm playback error:', err);
  }
}

export function vibrateMobileDevice(pattern: number[] = [600, 250, 600, 250, 1000]) {
  if (typeof window !== 'undefined' && 'navigator' in window && navigator.vibrate) {
    try {
      navigator.vibrate(pattern);
    } catch {
      // ignore
    }
  }
}

export function speakStationAnnouncement(stationName: string, lang: 'bn' | 'en' = 'bn') {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    const text =
      lang === 'bn'
        ? `যাত্রীগণ মনোযোগ দিন, আপনার গন্তব্য স্টেশন ${stationName} এসে গেছে। নামার প্রস্তুতি নিন।`
        : `Attention passenger, your destination station ${stationName} is arriving. Please prepare to alight.`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.volume = 1.0;
    window.speechSynthesis.speak(utterance);
  } catch {
    // ignore
  }
}

export function startContinuousAlarm(stationName?: string, lang: 'bn' | 'en' = 'bn') {
  stopContinuousAlarm();
  playUrgentTrainAlarm();
  vibrateMobileDevice();
  if (stationName) {
    speakStationAnnouncement(stationName, lang);
  }
  alarmIntervalId = setInterval(() => {
    playUrgentTrainAlarm();
    vibrateMobileDevice([500, 200, 500]);
  }, 1600);
}

export function stopContinuousAlarm() {
  if (alarmIntervalId) {
    clearInterval(alarmIntervalId);
    alarmIntervalId = null;
  }
  if (typeof window !== 'undefined' && 'navigator' in window && navigator.vibrate) {
    try {
      navigator.vibrate(0);
    } catch {
      // ignore
    }
  }
}

export function triggerBrowserNotification(title: string, body: string) {
  if (typeof window === 'undefined' || !('Notification' in window)) return;

  if (Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        tag: 'train-destination-alarm',
      });
    } catch {
      // Fallback
    }
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        try {
          new Notification(title, {
            body,
            icon: '/favicon.ico',
            tag: 'train-destination-alarm',
          });
        } catch {
          // Fallback
        }
      }
    });
  }
}

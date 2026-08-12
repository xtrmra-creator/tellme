/** Full keyboard typing ambience — play as-is when sound is enabled. */

const TYPING_AMB_URL = "/sounds/keyboard-typing.wav";
const VOLUME = 0.15;
const STORAGE_KEY = "wwtellme-sound-enabled";

let audio: HTMLAudioElement | null = null;
let enabled = true;
const listeners = new Set<(on: boolean) => void>();

function readStoredEnabled(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === null) return true;
    return v === "1";
  } catch {
    return true;
  }
}

function persistEnabled(on: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY, on ? "1" : "0");
  } catch {
    /* ignore */
  }
}

function notify(): void {
  for (const fn of listeners) fn(enabled);
}

export function getSoundEnabled(): boolean {
  return enabled;
}

export function subscribeSoundEnabled(fn: (on: boolean) => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Init from localStorage (call once on client mount). */
export function initSoundPreference(): boolean {
  enabled = readStoredEnabled();
  if (audio) audio.muted = !enabled;
  notify();
  return enabled;
}

export function setSoundEnabled(on: boolean): void {
  enabled = on;
  persistEnabled(on);
  if (audio) {
    audio.muted = !on;
    if (!on) {
      audio.pause();
      try {
        audio.currentTime = 0;
      } catch {
        /* ignore */
      }
    }
  }
  notify();
}

function getAudio(): HTMLAudioElement | null {
  if (typeof window === "undefined") return null;
  if (!audio) {
    audio = new Audio(TYPING_AMB_URL);
    audio.preload = "auto";
    audio.loop = false;
    audio.volume = VOLUME;
    audio.muted = !enabled;
  }
  return audio;
}

/** Warm up on user gesture (topic click). */
export function unlockKeyboardAudio(): void {
  const a = getAudio();
  if (!a) return;
  a.load();
}

/** Start ambient typing bed (~30% faster than native) from the beginning. */
export function startTypingAmbience(): void {
  if (!enabled) return;
  const a = getAudio();
  if (!a) return;
  a.muted = false;
  a.volume = VOLUME;
  a.playbackRate = 1.3;
  try {
    a.currentTime = 0;
  } catch {
    /* ignore */
  }
  void a.play().catch(() => {
    /* autoplay blocked */
  });
}

/** Stop and rewind when typing ends or user leaves intro. */
export function stopTypingAmbience(): void {
  if (!audio) return;
  audio.pause();
  try {
    audio.currentTime = 0;
  } catch {
    /* ignore */
  }
}

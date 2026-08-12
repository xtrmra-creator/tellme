export const SEAL_RESUME_KEY = "wwtellme-seal-resume";
/** Survives home navigation + reload (same browser). Not for OAuth redirect. */
export const DEVICE_SEAL_KEY = "wwtellme-device-seal";

export type SealResume = {
  topicId: "ww3";
  step: "result";
  optionId: string;
  day: string;
  month: string;
  year: string;
  nationality: string;
  userHandle: string;
  notifyAiTopic: boolean;
};

function canUseStorage(): boolean {
  return typeof window !== "undefined";
}

function parseSeal(raw: string | null): SealResume | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as SealResume;
    if (data?.topicId !== "ww3" || data?.step !== "result" || !data.optionId) {
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

/** Session-only: OAuth return trip. Cleared when going home. */
export function saveSealResume(data: SealResume): void {
  if (!canUseStorage()) return;
  try {
    sessionStorage.setItem(SEAL_RESUME_KEY, JSON.stringify(data));
  } catch {
    /* private mode / quota */
  }
  saveDeviceSeal(data);
}

export function loadSealResume(): SealResume | null {
  if (!canUseStorage()) return null;
  try {
    return parseSeal(sessionStorage.getItem(SEAL_RESUME_KEY));
  } catch {
    return null;
  }
}

export function clearSealResume(): void {
  if (!canUseStorage()) return;
  try {
    sessionStorage.removeItem(SEAL_RESUME_KEY);
  } catch {
    /* ignore */
  }
}

/** Device lock: persists after logo → home → reopen topic. */
export function saveDeviceSeal(data: SealResume): void {
  if (!canUseStorage()) return;
  try {
    localStorage.setItem(DEVICE_SEAL_KEY, JSON.stringify(data));
  } catch {
    /* private mode / quota */
  }
}

export function loadDeviceSeal(): SealResume | null {
  if (!canUseStorage()) return null;
  try {
    return parseSeal(localStorage.getItem(DEVICE_SEAL_KEY));
  } catch {
    return null;
  }
}

export function clearDeviceSeal(): void {
  if (!canUseStorage()) return;
  try {
    localStorage.removeItem(DEVICE_SEAL_KEY);
  } catch {
    /* ignore */
  }
}

/** Prefer OAuth session, then device lock. */
export function loadAnySeal(): SealResume | null {
  return loadSealResume() ?? loadDeviceSeal();
}

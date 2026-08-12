export const SEAL_RESUME_KEY = "wwtellme-seal-resume";

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

export function saveSealResume(data: SealResume): void {
  if (!canUseStorage()) return;
  try {
    sessionStorage.setItem(SEAL_RESUME_KEY, JSON.stringify(data));
  } catch {
    /* private mode / quota */
  }
}

export function loadSealResume(): SealResume | null {
  if (!canUseStorage()) return null;
  try {
    const raw = sessionStorage.getItem(SEAL_RESUME_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as SealResume;
    if (data?.topicId !== "ww3" || data?.step !== "result" || !data.optionId) {
      return null;
    }
    return data;
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

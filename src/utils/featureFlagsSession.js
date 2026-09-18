/** Persist system feature flags in localStorage (shared across tabs, survives refresh). */
export const FEATURE_FLAGS_STORAGE_KEY = "systemFeatureFlagsV1";

/** @deprecated use FEATURE_FLAGS_STORAGE_KEY */
export const FEATURE_FLAGS_SESSION_KEY = FEATURE_FLAGS_STORAGE_KEY;

export function writeFeatureFlagsSession(karaokeLive) {
  localStorage.setItem(
    FEATURE_FLAGS_STORAGE_KEY,
    JSON.stringify({ karaoke: !!karaokeLive, v: 1 })
  );
}

export function clearFeatureFlagsSession() {
  localStorage.removeItem(FEATURE_FLAGS_STORAGE_KEY);
  try {
    sessionStorage.removeItem(FEATURE_FLAGS_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function readFeatureFlagsSession() {
  try {
    let raw = localStorage.getItem(FEATURE_FLAGS_STORAGE_KEY);
    if (!raw) {
      raw = sessionStorage.getItem(FEATURE_FLAGS_STORAGE_KEY);
      if (raw) {
        try {
          const data = JSON.parse(raw);
          if (data && typeof data.karaoke === "boolean") {
            writeFeatureFlagsSession(data.karaoke);
            sessionStorage.removeItem(FEATURE_FLAGS_STORAGE_KEY);
            return data;
          }
        } catch {
          /* ignore */
        }
      }
      return null;
    }
    const data = JSON.parse(raw);
    if (data && typeof data.karaoke === "boolean") return data;
    return null;
  } catch {
    return null;
  }
}

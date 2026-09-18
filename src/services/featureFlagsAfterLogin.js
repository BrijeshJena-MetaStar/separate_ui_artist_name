import { apiWrapper } from "@/helper/apiWrapper";
import { getUserToken } from "@/services/userService";
import {
  readFeatureFlagsSession,
  writeFeatureFlagsSession,
  clearFeatureFlagsSession,
} from "@/utils/featureFlagsSession";

/**
 * Ensures feature flags exist in localStorage: if missing and user has a token, calls the API once then writes cache.
 * No-op when cache is already present (avoids duplicate requests across login + artist page).
 */
export async function loadSystemFeatureFlagsAfterLogin() {
  if (!getUserToken()) {
    clearFeatureFlagsSession();
    return;
  }
  // if (readFeatureFlagsSession()) {
  //   return;
  // }
  try {
    const res = await apiWrapper.get("/api/system-properties/features");
    const karaokeFlag = res?.data?.result?.hidden?.karaoke;
    writeFeatureFlagsSession(karaokeFlag === true);
  } catch (e) {
    console.error("Error fetching system feature flags:", e);
    writeFeatureFlagsSession(false);
  }
}

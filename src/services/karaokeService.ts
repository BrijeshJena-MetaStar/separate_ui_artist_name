import { useRouter } from "vue-router";
import type { Router } from "vue-router";
import { apiWrapper, apiCall } from "../helper/apiWrapper";
import type { NormalizedError, RawError } from "../types/api";

// ---------------------------------------------------------------------------
// Domain types
// ---------------------------------------------------------------------------

export interface KaraokeTrack {
  id: number | string;
  title?: string;
  [key: string]: unknown;
}

export type RequestHeader = Record<string, string>;

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

const handle401OrRethrow = (
  err: NormalizedError,
  router: Router,
  toSend: string
): Promise<never> | undefined => {
  if ((err?.rawError as RawError)?.status === 401) {
    router.push({ path: "/login", query: { toSend } });
    return undefined;
  }
  return Promise.reject(err);
};

// ---------------------------------------------------------------------------
// Public service functions
// ---------------------------------------------------------------------------

export const sendAudio = async (
  body: FormData | Record<string, unknown>,
  header?: RequestHeader
): Promise<unknown> => {
  return apiCall(
    () => apiWrapper.post(`/api/process-karaoke`, body, header),
    { defaultMessage: "Broken Connection" }
  );
};

export const getTracks = async (
  artistId: number | string
): Promise<KaraokeTrack[]> => {
  const router = useRouter();
  try {
    const data = await apiCall<KaraokeTrack[]>(
      () => apiWrapper.get(`/api/getKaraokeTracks/${artistId}`),
      { defaultMessage: "Broken Connection" }
    );
    return data ?? [];
  } catch (err) {
    const done = handle401OrRethrow(
      err as NormalizedError,
      router,
      `/karaoke/${artistId}`
    );
    if (done !== undefined) return done;
    throw err;
  }
};

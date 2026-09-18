import { useRouter } from "vue-router";
import type { Router } from "vue-router";
import { apiWrapper, apiCall } from "../helper/apiWrapper";
import type { NormalizedError, RawError } from "../types/api";

// ---------------------------------------------------------------------------
// Domain types
// ---------------------------------------------------------------------------

export interface Artist {
  id: number | string;
  name: string;
  uri?: string;
  is_subscribed?: boolean;
  /** Any extra fields returned by the API */
  [key: string]: unknown;
}

export interface Song {
  id: number | string;
  title: string;
  artist_id?: number | string;
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * On 401 redirect to /login with a `toSend` return path; otherwise rethrow.
 * Returns undefined when a redirect was issued (caller should still reject to
 * abort the async chain), or the rejected Promise for non-401 errors.
 */
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

export const getArtists = async (): Promise<Artist[]> => {
  const data = await apiCall<{ artists?: Artist[] }>(
    () => apiWrapper.get("/api/artists"),
    { defaultMessage: "Failed to fetch artists" }
  );
  return data?.artists ?? [];
};

export const getPopupContent = async (
  popupId: string | number
): Promise<unknown> => {
  const router = useRouter();
  try {
    return await apiCall(() => apiWrapper.get(`/api/popup?id=${popupId}`), {
      defaultMessage: "Broken Connection",
    });
  } catch (err) {
    console.error(err);
    const done = handle401OrRethrow(
      err as NormalizedError,
      router,
      `/popup/space/${popupId}`
    );
    if (done !== undefined) return done;
    return Promise.reject(err);
  }
};

export const getVideoContent = async (
  popupId: string | number
): Promise<unknown> => {
  const router = useRouter();
  try {
    return await apiCall(() => apiWrapper.get(`/api/video?id=${popupId}`), {
      defaultMessage: "Broken Connection",
    });
  } catch (err) {
    console.error(err);
    const done = handle401OrRethrow(
      err as NormalizedError,
      router,
      `/video/${popupId}`
    );
    if (done !== undefined) return done;
    return Promise.reject(err);
  }
};

export const getHTMLPopupContent = async (
  popupId: string | number
): Promise<unknown> => {
  const router = useRouter();
  try {
    return await apiCall(
      () => apiWrapper.get(`/api/getHTMLPopup?popupId=${popupId}`),
      { defaultMessage: "Broken Connection" }
    );
  } catch (err) {
    console.error(err);
    const done = handle401OrRethrow(
      err as NormalizedError,
      router,
      `/popup/html/${popupId}`
    );
    if (done !== undefined) return done;
    return Promise.reject(err);
  }
};

export const checkingUser = async (): Promise<unknown> => {
  return apiCall(() => apiWrapper.get("/api/checkingUser"), {
    defaultMessage: "Broken Connection",
  });
};

export const checkAvailable = async (userUri: string): Promise<unknown> => {
  return apiCall(
    () => apiWrapper.get(`/api/checkAvailable?userUri=${userUri}`),
    { defaultMessage: "Broken Connection" }
  );
};

export const getArtistVideos = async (
  artistId: number | string,
  paid: boolean,
  free: boolean
): Promise<unknown> => {
  const requestBody = { artistId, paid, free };
  return apiCall(
    () => apiWrapper.post("/api/get-artist-videos", requestBody),
    { defaultMessage: "Broken Connection" }
  );
};

export const getArtistVideosUrl = async (
  id: number | string,
  paid: boolean,
  free: boolean
): Promise<unknown> => {
  return apiCall(
    () =>
      apiWrapper.get(`/api/get-artist-videos-id/${id}?paid=${paid}&free=${free}`),
    { defaultMessage: "Broken Connection" }
  );
};

export const subscribeToArtist = async (
  artistId: number | string
): Promise<unknown> => {
  return apiCall(
    () =>
      apiWrapper.post("/api/artist-subscriptions", {
        artist_ids: [String(artistId)],
      }),
    { defaultMessage: "Broken Connection", returnFull: true }
  );
};

export const subscribeToMultipleArtists = async (
  artistIds: Array<number | string>
): Promise<unknown> => {
  return apiCall(
    () =>
      apiWrapper.post("/api/artist-subscriptions", {
        artist_ids: artistIds.map(String),
      }),
    { defaultMessage: "Broken Connection", returnFull: true }
  );
};

export const unsubscribeFromArtist = async (
  artistId: number | string
): Promise<unknown> => {
  return apiCall(
    () =>
      apiWrapper.delete("/api/artist-subscriptions", {
        artist_id: String(artistId),
      }),
    { defaultMessage: "Broken Connection", returnFull: true }
  );
};

export const checkSubscriptionStatus = async (
  artistId: number | string
): Promise<Artist | undefined> => {
  const data = await apiCall<{ artist?: Artist }>(
    () => apiWrapper.get(`/api/artists/${artistId}`),
    { defaultMessage: "Broken Connection" }
  );
  return data?.artist;
};

export const getSubscribedArtists = async (): Promise<unknown> => {
  return apiCall(() => apiWrapper.get("/api/artist-subscriptions"), {
    defaultMessage: "Broken Connection",
  });
};

export const getSubscriptionPlans = async (
  artistId: number | string
): Promise<unknown> => {
  return apiCall(
    () => apiWrapper.get(`/api/subscription-plans/${artistId}`),
    { defaultMessage: "Failed to fetch subscription plans" }
  );
};

export const initiateSubscription = async (payload: {
  artist_id: number | string;
  plan_id: number | string;
  payment_method: number;
  currency: number;
}): Promise<unknown> => {
  return apiCall(
    () => apiWrapper.post("/api/subscription/initiate", payload),
    { defaultMessage: "Failed to initiate subscription", returnFull: true }
  );
};

export const getSongs = async (
  artistId: number | string
): Promise<Song[]> => {
  const data = await apiCall<Song[]>(
    () => apiWrapper.get(`/api/get-songs/${artistId}`),
    { defaultMessage: "Broken Connection" }
  );
  return data ?? [];
};

// ---------------------------------------------------------------------------
// Feedback / complaints
// ---------------------------------------------------------------------------

export interface ComplaintPayload {
  title: string;
  description: string;
  type: string;
}

export const submitComplaint = async (
  payload: ComplaintPayload
): Promise<unknown> => {
  return apiCall(
    () => apiWrapper.post("/api/complaints", payload),
    { defaultMessage: "Failed to submit feedback" }
  );
};

// in JS

// import { apiWrapper, apiCall } from "../helper/apiWrapper";
// import { useRouter } from "vue-router";

// /** Helper: on 401 redirect to login with return path; otherwise rethrow */
// const handle401OrRethrow = (err, router, toSend) => {
//   if (err?.rawError?.status === 401) {
//     router.push({ path: "/login", query: { toSend, query: {} } });
//     return;
//   }
//   return Promise.reject(err);
// };

// export const getArtists = async () => {
//   const data = await apiCall(
//     () => apiWrapper.get("/api/artists"),
//     { defaultMessage: "Failed to fetch artists" }
//   );
//   return data?.artists ?? [];
// };

// export const getPopupContent = async (popupId) => {
//   const router = useRouter();
//   try {
//     return await apiCall(() => apiWrapper.get(`/api/popup?id=${popupId}`), {
//       defaultMessage: "Broken Connection",
//     });
//   } catch (err) {
//     console.error(err);
//     const done = handle401OrRethrow(err, router, `/popup/space/${popupId}`);
//     if (done !== undefined) return done;
//     return Promise.reject(err);
//   }
// };

// export const getVideoContent = async (popupId) => {
//   const router = useRouter();
//   try {
//     return await apiCall(() => apiWrapper.get(`/api/video?id=${popupId}`), {
//       defaultMessage: "Broken Connection",
//     });
//   } catch (err) {
//     console.error(err);
//     const done = handle401OrRethrow(err, router, `/video/${popupId}`);
//     if (done !== undefined) return done;
//     return Promise.reject(err);
//   }
// };

// export const getHTMLPopupContent = async (popupId) => {
//   const router = useRouter();
//   try {
//     return await apiCall(
//       () => apiWrapper.get(`/api/getHTMLPopup?popupId=${popupId}`),
//       { defaultMessage: "Broken Connection" }
//     );
//   } catch (err) {
//     console.error(err);
//     const done = handle401OrRethrow(err, router, `/popup/html/${popupId}`);
//     if (done !== undefined) return done;
//     return Promise.reject(err);
//   }
// };

// export const checkingUser = async () => {
//   const data = await apiCall(() => apiWrapper.get(`/api/checkingUser`), {
//     defaultMessage: "Broken Connection",
//   });
//   return data;
// };

// export const checkAvailable = async (userUri) => {
//   const data = await apiCall(
//     () => apiWrapper.get(`/api/checkAvailable?userUri=${userUri}`),
//     { defaultMessage: "Broken Connection" }
//   );
//   return data;
// };

// export const getArtistVideos = async (artistId, paid, free) => {
//   const requestBody = { artistId, paid, free };
//   return apiCall(
//     () => apiWrapper.post(`/api/get-artist-videos`, requestBody),
//     { defaultMessage: "Broken Connection" }
//   );
// };

// export const getArtistVideosUrl = async (id, paid, free) => {
//   return apiCall(
//     () =>
//       apiWrapper.get(
//         `/api/get-artist-videos-id/${id}?paid=${paid}&free=${free}`
//       ),
//     { defaultMessage: "Broken Connection" }
//   );
// };

// export const subscribeToArtist = async (artistId) => {
//   return apiCall(
//     () =>
//       apiWrapper.post(`/api/artist-subscriptions`, {
//         artist_ids: [artistId.toString()],
//       }),
//     { defaultMessage: "Broken Connection", returnFull: true }
//   );
// };

// export const subscribeToMultipleArtists = async (artistIds) => {
//   return apiCall(
//     () =>
//       apiWrapper.post(`/api/artist-subscriptions`, {
//         artist_ids: artistIds.map((id) => id.toString()),
//       }),
//     { defaultMessage: "Broken Connection", returnFull: true }
//   );
// };

// export const unsubscribeFromArtist = async (artistId) => {
//   return apiCall(
//     () =>
//       apiWrapper.delete(`/api/artist-subscriptions`, {
//         artist_id: artistId.toString(),
//       }),
//     { defaultMessage: "Broken Connection", returnFull: true }
//   );
// };

// export const checkSubscriptionStatus = async (artistId) => {
//   const data = await apiCall(
//     () => apiWrapper.get(`/api/artists/${artistId}`),
//     { defaultMessage: "Broken Connection" }
//   );
//   return data?.artist;
// };

// export const getSubscribedArtists = async () => {
//   return apiCall(() => apiWrapper.get(`/api/artist-subscriptions`), {
//     defaultMessage: "Broken Connection",
//   });
// };

// export const getSongs = async (artistId) => {
//   const data = await apiCall(
//     () => apiWrapper.get(`/api/get-songs/${artistId}`),
//     { defaultMessage: "Broken Connection" }
//   );
//   return data ?? [];
// };

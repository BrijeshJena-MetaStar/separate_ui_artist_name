import { apiWrapper, apiCall } from "../helper/apiWrapper";
import type { ApiCallOptions } from "../types/api";

// ---------------------------------------------------------------------------
// Domain types
// ---------------------------------------------------------------------------

export interface PaidSong {
  id: number | string;
  title?: string;
  [key: string]: unknown;
}

export interface Album {
  id: number | string;
  title?: string;
  songs?: PaidSong[];
  [key: string]: unknown;
}

export interface SubscribePayload {
  songId?: number | string;
  [key: string]: unknown;
}

export interface StreamDownloadData {
  url?: string;
  [key: string]: unknown;
}

export type RequestHeader = Record<string, string>;

// ---------------------------------------------------------------------------
// Public service functions
// ---------------------------------------------------------------------------

export const getPaidSongsDetail = async (
  songsId: string | number
): Promise<PaidSong> => {
  return apiCall<PaidSong>(
    () => apiWrapper.get(`/api/paid-songs-details/${songsId}`),
    { defaultMessage: "Broken Connection" } satisfies ApiCallOptions
  );
};

export const getAlbumDetail = async (
  albumId: string | number
): Promise<Album> => {
  return apiCall<Album>(
    () => apiWrapper.get(`/api/album-details/${albumId}`),
    { defaultMessage: "Broken Connection" } satisfies ApiCallOptions
  );
};

export const startSubscribeSongs = async (
  payload: SubscribePayload | FormData
): Promise<unknown> => {
  return apiCall(
    () => apiWrapper.post(`/api/subscribe-songs`, payload),
    { defaultMessage: "Broken Connection", returnFull: true } satisfies ApiCallOptions
  );
};

export const cancelSongsBuy = async (
  body: Record<string, unknown>,
  header?: RequestHeader
): Promise<unknown> => {
  return apiCall(
    () => apiWrapper.post("/api/cancel-songs-purchase", body, header),
    { defaultMessage: "Broken Connection", returnFull: true } satisfies ApiCallOptions
  );
};

export const orderNowAlbumPaypal = async (
  body: Record<string, unknown>
): Promise<unknown> => {
  return apiCall(
    () => apiWrapper.post("/api/purchase-album", body),
    { defaultMessage: "Broken Connection", returnFull: true } satisfies ApiCallOptions
  );
};

export const getSongStream = async (
  songId: string | number
): Promise<StreamDownloadData | string> => {
  const data = await apiCall<{ data?: StreamDownloadData }>(
    () => apiWrapper.post(`/api/songs/${songId}/stream`, {}, {}),
    { defaultMessage: "Something Went Wrong on Connection" } satisfies ApiCallOptions
  );
  return data?.data ?? (data as unknown as string);
};

export const getSongDownload = async (
  songId: string | number
): Promise<StreamDownloadData | string> => {
  const data = await apiCall<{ data?: StreamDownloadData }>(
    () => apiWrapper.post(`/api/songs/${songId}/download`, {}, {}),
    { defaultMessage: "Something Went Wrong on Connection" } satisfies ApiCallOptions
  );
  return data?.data ?? (data as unknown as string);
};

/**
 * Type declarations for apiWrapper.js.
 * Keeps the JS file unchanged while giving TypeScript full type coverage
 * for every consumer (services, components, etc.).
 */
import type { AxiosInstance, AxiosResponse } from "axios";
import type { ApiCallOptions } from "../types/api";

/** Signature shared by get / post / put / delete wrappers */
type RequestFn = (
  url: string,
  body?: unknown,
  header?: Record<string, string>
) => Promise<AxiosResponse>;

/** Thin axios instance used for all API calls (useful for direct custom requests) */
export declare const apiRequest: AxiosInstance;

/** Re-exported raw axios (useful for blob downloads from absolute URLs) */
export declare const axios: typeof import("axios").default;

/** Convenience wrappers around apiRequest.request */
export declare const apiWrapper: {
  get: RequestFn;
  post: RequestFn;
  put: RequestFn;
  delete: RequestFn;
};

/**
 * Register a callback invoked with +1 when a request starts and -1 when it
 * finishes. Used for a global loading indicator in main.js.
 */
export declare function setApiRequestCountCallback(
  fn: (delta: 1 | -1) => void
): void;

/**
 * Unwrap an axios response or API body into its payload.
 * Rejects with a NormalizedError on failure.
 */
export declare function unwrap<T = unknown>(
  result: unknown,
  options?: ApiCallOptions
): Promise<T>;

/**
 * Execute `fn`, unwrap the result, and surface any error via console + reject.
 * Use this in every service to avoid duplicated try/catch boilerplate.
 */
export declare function apiCall<T = unknown>(
  fn: () => Promise<unknown>,
  options?: ApiCallOptions
): Promise<T>;

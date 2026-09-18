/**
 * Shared API types used across all services.
 * The shape of these mirrors what apiWrapper.js normalizes at runtime.
 */

/** Normalized error shape produced by apiWrapper's handleError + unwrap */
export interface NormalizedError {
  status: false;
  message: string;
  /** The raw axios response or Error that caused the failure */
  rawError: RawError | unknown;
}

/** The inner axios-response-like object attached to NormalizedError.rawError */
export interface RawError {
  status?: number;
  data?: unknown;
  [key: string]: unknown;
}

/** Options accepted by apiCall / unwrap */
export interface ApiCallOptions {
  /** Human-readable fallback message when the API gives no message */
  defaultMessage?: string;
  /** When true, return the full API body instead of body.data */
  returnFull?: boolean;
}

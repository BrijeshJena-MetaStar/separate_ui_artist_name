import { apiWrapper } from "@/helper/apiWrapper";
import { clearFeatureFlagsSession } from "@/utils/featureFlagsSession";

// ---------------------------------------------------------------------------
// Domain types
// ---------------------------------------------------------------------------

export type RequestHeader = Record<string, string>;

export interface RequestBody {
  [key: string]: unknown;
}

export interface AuthResponseData {
  token: string;
  [key: string]: unknown;
}

export interface AuthResponse {
  status: boolean;
  data?: AuthResponseData;
  message?: string;
  [key: string]: unknown;
}

export interface UserAddress {
  [key: string]: unknown;
}

export interface UserProfile {
  [key: string]: unknown;
}

export interface ApiErrorReject {
  status: false;
  message: string;
  show_otp?: boolean;
  rawError: unknown;
}

export interface VerifyOTPOptions {
  updateToken?: boolean;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function buildReject(
  message: string,
  rawError: unknown,
  extra?: Partial<ApiErrorReject>
): ApiErrorReject {
  return { status: false, message, rawError, ...extra };
}

function sendTokenToParent(token: string, userData?: unknown): void {
  window.parent.postMessage(
    { type: "auth_token", token, user: userData ?? null },
    "*"
  );
}

// ---------------------------------------------------------------------------
// Local-storage helpers
// ---------------------------------------------------------------------------

export const getUserToken = (): string | null => {
  return localStorage.getItem("token");
};

export const removeUserToken = (): void => {
  localStorage.removeItem("token");
  clearFeatureFlagsSession();
};

export const setUserToken = (token: string): void => {
  localStorage.setItem("token", token);
  sendTokenToParent(token);
};

export const updateUserName = (userName: string | null): void => {
  if (userName == null) {
    localStorage.removeItem("userName");
    return;
  }
  localStorage.setItem("userName", userName);
};

export const getUserName = (): string | null => {
  return localStorage.getItem("userName");
};

export const updateUserPassword = (value: string | null): void => {
  if (value == null) {
    localStorage.removeItem("userName");
    return;
  }
  localStorage.setItem("userPass", value);
};

export const getUserPassword = (): string | null => {
  return localStorage.getItem("userPass");
};

// ---------------------------------------------------------------------------
// Auth API
// ---------------------------------------------------------------------------

export const login = async (
  body: RequestBody | FormData,
  header?: RequestHeader
): Promise<AuthResponse> => {
  try {
    const response = await apiWrapper.post("/api/login", body, header);
    const data: AuthResponse = response.data;
    if (data?.data?.token) {
      setUserToken(data.data.token);
    }
    return data;
  } catch (error) {
    console.error(error);
    const err = error as ApiErrorReject;
    const rawData = (
      err?.rawError as { data?: { message?: string; show_otp?: boolean } }
    )?.data;
    return Promise.reject(
      buildReject(
        err?.message || rawData?.message || "Something Went Wrong on Connection",
        error,
        { show_otp: rawData?.show_otp }
      )
    );
  }
};

export const register = async (
  body: RequestBody | FormData,
  header?: RequestHeader
): Promise<AuthResponse> => {
  try {
    const response = await apiWrapper.post("/api/user", body, header);
    return response.data as AuthResponse;
  } catch (error) {
    console.error(error);
    return Promise.reject(
      buildReject("Something Went Wrong on Connection", error)
    );
  }
};

export async function verifyOTP(
  body: RequestBody | FormData,
  header?: RequestHeader,
  options: VerifyOTPOptions = {}
): Promise<AuthResponse> {
  try {
    const response = await apiWrapper.post("/api/verify-otp", body, header);
    const data: AuthResponse = response.data;
    if (options.updateToken !== false && data?.data?.token) {
      setUserToken(data.data.token);
    }
    return data;
  } catch (error) {
    console.error(error);
    return Promise.reject(
      buildReject("Something Went Wrong on Connection", error)
    );
  }
}

export const resendOTP = async (
  body: RequestBody | FormData,
  header?: RequestHeader
): Promise<AuthResponse> => {
  try {
    const response = await apiWrapper.post("/api/send-otp", body, header);
    return response.data as AuthResponse;
  } catch (error) {
    console.error(error);
    return Promise.reject(
      buildReject("Something Went Wrong on Connection", error)
    );
  }
};

export const forgotPassword = async (
  body: RequestBody | FormData,
  header?: RequestHeader
): Promise<AuthResponse> => {
  try {
    const response = await apiWrapper.post("/api/forgot-password", body, header);
    return response.data as AuthResponse;
  } catch (error) {
    console.error(error);
    return Promise.reject(
      buildReject("Something Went Wrong on Connection", error)
    );
  }
};

export const resetPassword = async (
  body: RequestBody | FormData,
  header?: RequestHeader
): Promise<AuthResponse> => {
  try {
    const response = await apiWrapper.post("/api/update-password", body, header);
    return response.data as AuthResponse;
  } catch (error) {
    console.error(error);
    return Promise.reject(
      buildReject("Something Went Wrong on Connection", error)
    );
  }
};

// ---------------------------------------------------------------------------
// Social login APIs
// ---------------------------------------------------------------------------

export const googleLoginAPI = async (
  body: RequestBody | FormData,
  header?: RequestHeader
): Promise<AuthResponse> => {
  try {
    const response = await apiWrapper.post("/api/google-user", body, header);
    const data: AuthResponse = response.data;
    setUserToken(data.data!.token);
    return data;
  } catch (error) {
    console.error(error);
    return Promise.reject(
      buildReject("Something Went Wrong on Connection", error)
    );
  }
};

export const facebookLoginAPI = async (
  body: RequestBody | FormData,
  header?: RequestHeader
): Promise<AuthResponse> => {
  try {
    const response = await apiWrapper.post("/api/facebook-user", body, header);
    const data: AuthResponse = response.data;
    setUserToken(data.data!.token);
    return data;
  } catch (error) {
    console.error(error);
    return Promise.reject(
      buildReject("Something Went Wrong on Connection", error)
    );
  }
};

export const twitterLoginAPI = async (
  body: RequestBody | FormData,
  header?: RequestHeader
): Promise<AuthResponse> => {
  try {
    const response = await apiWrapper.post("/api/twitter-user", body, header);
    const data: AuthResponse = response.data;
    setUserToken(data.data!.token);
    return data;
  } catch (error) {
    console.error(error);
    return Promise.reject(
      buildReject("Something Went Wrong on Connection", error)
    );
  }
};

// ---------------------------------------------------------------------------
// Address APIs
// ---------------------------------------------------------------------------

export const getUserAddress = async (): Promise<UserAddress> => {
  try {
    const response = await apiWrapper.get("/api/address");
    return response.data.data as UserAddress;
  } catch (error) {
    console.error(error);
    return Promise.reject(
      buildReject("Something Went Wrong on Connection", error)
    );
  }
};

export const getUserAllAddress = async (): Promise<UserAddress[]> => {
  try {
    const response = await apiWrapper.get("/api/getAddressAll");
    return response.data.data as UserAddress[];
  } catch (error) {
    console.error(error);
    return Promise.reject(
      buildReject("Something Went Wrong on Connection", error)
    );
  }
};

export const updateAddress = async (
  body: RequestBody | FormData,
  header?: RequestHeader
): Promise<unknown> => {
  try {
    const response = await apiWrapper.post("/api/updateAddress", body, header);
    return response.data;
  } catch (error) {
    console.error(error);
    return Promise.reject(
      buildReject("Something Went Wrong on Connection", error)
    );
  }
};

export const deleteAddressFromDb = async (
  body: RequestBody | FormData,
  header?: RequestHeader
): Promise<unknown> => {
  try {
    const response = await apiWrapper.post("/api/deleteAddress", body, header);
    return response.data;
  } catch (error) {
    console.error(error);
    return Promise.reject(
      buildReject("Something Went Wrong on Connection", error)
    );
  }
};

export const addAddress = async (
  body: RequestBody | FormData,
  header?: RequestHeader
): Promise<unknown> => {
  try {
    const response = await apiWrapper.post("/api/address", body, header);
    return response.data;
  } catch (error) {
    console.error(error);
    return Promise.reject(
      buildReject("Something Went Wrong on Connection", error)
    );
  }
};

// ---------------------------------------------------------------------------
// Profile APIs
// ---------------------------------------------------------------------------

export const getUserProfile = async (): Promise<UserProfile> => {
  try {
    const response = await apiWrapper.get("/api/getUserProfile");
    return response.data.data as UserProfile;
  } catch (error) {
    console.error(error);
    return Promise.reject(
      buildReject("Something Went Wrong on Connection", error)
    );
  }
};

export const addUserProfile = async (
  body: RequestBody | FormData,
  header?: RequestHeader
): Promise<unknown> => {
  try {
    const response = await apiWrapper.post("/api/insertUserProfile", body, header);
    return response.data;
  } catch (error) {
    console.error(error);
    return Promise.reject(
      buildReject("Something Went Wrong on Connection", error)
    );
  }
};

export const updateUserProfile = async (
  body: RequestBody | FormData,
  header?: RequestHeader
): Promise<unknown> => {
  try {
    const response = await apiWrapper.post("/api/updateUserProfile", body, header);
    return response.data;
  } catch (error) {
    console.error(error);
    return Promise.reject(
      buildReject("Something Went Wrong on Connection", error)
    );
  }
};

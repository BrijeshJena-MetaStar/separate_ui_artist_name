import { getUserToken, removeUserToken } from "../services/userService";
import axios from "axios";

/** Re-export for non-API usage (e.g. blob download from full URL) */
export { axios };

const BASE_URL = import.meta.env.VITE_BASE_URL;

const authHeader = () => {
    const token = getUserToken();
    if (token) {
        return { authorization: `${token}` };
    }
    return {};
};

/** Axios instance – use for custom options (e.g. responseType: 'blob') */
export const apiRequest = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
    headers: {},
});

/** Return full response so both legacy (response.status === 200) and apiCall/unwrap work */
const handleResponse = (response) => {
    return response;
};

/** Normalize errors and handle 401 in one place */
const handleError = (error) => {
    if ([401].includes(error?.response?.status)) {
        removeUserToken();
    }
    const normalized = {
        status: false,
        message: error?.response?.data?.message || error?.message || "Something went wrong",
        rawError: error?.response || error,
    };
    return Promise.reject(normalized);
};

/** Optional: called on each request start (+1) and finish (-1) for global API loader. Set from main.js. */
let onRequestCountChange = () => {};
export function setApiRequestCountCallback(fn) {
    onRequestCountChange = typeof fn === "function" ? fn : () => {};
}

apiRequest.interceptors.request.use((config) => {
    onRequestCountChange(1);
    return config;
});

apiRequest.interceptors.response.use(
    (response) => {
        onRequestCountChange(-1);
        return handleResponse(response);
    },
    (error) => {
        onRequestCountChange(-1);
        return handleError(error);
    }
);

/** Build request function: GET has no body, others use body when provided */
export const request = (method) => {
    return (url, body, header = {}) => {
        const config = {
            method,
            url,
            headers: { ...authHeader(), ...header },
        };
        if (body != null && method !== "GET") {
            config.data = body;
        }
        return apiRequest.request(config);
    };
};

export const apiWrapper = {
    get: request("GET"),
    post: request("POST"),
    put: request("PUT"),
    delete: request("DELETE"),
};

const DEFAULT_FAIL_MESSAGE = "Something went wrong";

/**
 * Unwrap API result: return payload on success, reject with normalized error otherwise.
 * Handles both (1) axios response { status: 200, data: apiBody } and (2) API body { status, data }.
 * @param {*} result - Value from apiWrapper: full axios response or API body
 * @param {{ defaultMessage?: string, returnFull?: boolean }} options - defaultMessage for reject; returnFull=true returns full API body instead of result.data
 * @returns {*} payload (result.data from API body, or result if returnFull)
 */
export function unwrap(result, options = {}) {
    const { defaultMessage = DEFAULT_FAIL_MESSAGE, returnFull = false } = options;
    if (result == null || typeof result !== "object") {
        return Promise.reject({
            status: false,
            message: defaultMessage,
            rawError: result,
        });
    }
    // Axios response: { status: 200, data: apiBody }
    if (result.status === 200 && "data" in result) {
        return unwrap(result.data, options);
    }
    // API body: { status, data, message }
    if ("data" in result) {
        if (result.status === false) {
            return Promise.reject({
                status: false,
                message: result.message || defaultMessage,
                rawError: result,
            });
        }
        return returnFull ? result : result.data;
    }
    return Promise.reject({
        status: false,
        message: (result?.message) || defaultMessage,
        rawError: result,
    });
}

/**
 * Call apiWrapper + unwrap with shared try/catch (log + rethrow). Use in services to avoid duplicated error handling.
 * @param {() => Promise} fn - e.g. () => apiWrapper.get('/api/artists')
 * @param {{ defaultMessage?: string, returnFull?: boolean }} options - passed to unwrap
 * @returns {Promise} unwrapped result (result.data), or rejected with normalized error
 */
export async function apiCall(fn, options = {}) {
    try {
        const result = await fn();
        return unwrap(result, options);
    } catch (error) {
        console.error(error);
        return Promise.reject(error);
    }
}
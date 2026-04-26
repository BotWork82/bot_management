import axios, { type AxiosResponse } from "axios";

const DEFAULT_BASE = "http://localhost:4100/api/v1/";
const FALLBACK_BASE = "https://teamcwork.site/managebot/api/v1";

// Prefer Vite import.meta.env; also support REACT_APP_API_BASE_URL via window for flexibility (avoid Node 'process' in browser TS)
const windowEnv = typeof window !== "undefined" ? ((window as any).REACT_APP_API_BASE_URL || (window as any).__REACT_APP_API_BASE_URL || (window as any).REACT_APP_API_URL || (window as any).__REACT_APP_API_URL) : undefined;
const viteEnv = (typeof import.meta !== "undefined" && (import.meta as any).env && ((import.meta as any).env.VITE_API_URL || (import.meta as any).env.VITE_API_BASE_URL)) || undefined;
const envBase = windowEnv || viteEnv || undefined;
const baseURL = envBase || DEFAULT_BASE || FALLBACK_BASE;

export const api = axios.create({
  baseURL,
  timeout: 15000
});

// Add Authorization header from localStorage token if present (AuthContext stores JSON under 'auth_token')
api.interceptors.request.use((config: any) => {
  try {
    const authRaw = localStorage.getItem("auth_token") || localStorage.getItem("token") || localStorage.getItem("auth");
    if (authRaw) {
      try {
        const parsed = JSON.parse(authRaw);
        const token = parsed && parsed.token ? parsed.token : String(authRaw);
        if (token && config.headers) {
          config.headers["Authorization"] = `Bearer ${token}`;
        }
      } catch {
        // not JSON, use raw value
        if (authRaw && config.headers) {
          config.headers["Authorization"] = `Bearer ${authRaw}`;
        }
      }
    }
  } catch (e) {
    // ignore (e.g., SSR)
  }
  return config;
});

api.interceptors.response.use(
  (res: AxiosResponse) => res,
  (err: any) => {
    // Log server response body for easier debugging (BadRequest details)
    try {
      if (err?.response?.data) {
        console.error("API Error Response:", err.response.data);
      } else {
        console.error("API Error:", err);
      }
    } catch (e) {
      // ignore logging errors
    }
    // If unauthorized or forbidden -> clear auth and redirect to login
    const status = err?.response?.status;
    if (status === 401 || status === 403) {
      try {
        // Clear stored auth data (keys used in AuthContext)
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
        // also clear legacy 'token'
        localStorage.removeItem("token");
      } catch {}

      // Redirect to login page
      if (typeof window !== "undefined") {
        // use replace so back doesn't return to protected page
        window.location.replace("/login");
      }
    }
    return Promise.reject(err);
  }
);

export function setAuthToken(token?: string | null) {
  try {
    if (token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");
  } catch (e) {
    // ignore
  }
}

export default api;


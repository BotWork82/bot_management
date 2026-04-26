import { delay } from "../lib/delay";
import { api } from "./api";

type AuthState = { authenticated: boolean; user?: { email: string; role?: "admin" | "user" } | null };
let state: AuthState = { authenticated: false, user: null };

export type AuthResponse = { success: boolean; user?: { email: string; role?: "admin" | "user" } | null; token?: string; accessToken?: string; refreshToken?: string; expiresAt?: number };

export const loginService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const res = await api.post("/auth/login", { email, password });
      const data = res.data || {};
      // normalize common token fields
      const accessToken = data.access_token ?? data.accessToken ?? data.token ?? (data.data && (data.data.access_token ?? data.data.accessToken ?? data.data.token));
      const refreshToken = data.refresh_token ?? data.refreshToken ?? (data.data && (data.data.refresh_token ?? data.data.refreshToken));

      // normalize user
      const rawUser = data.user ?? data.data?.user ?? (data.data?.user ?? undefined);
      let user: any = undefined;
      if (rawUser) {
        // prefer email field if present
        const emailField = rawUser.email ?? rawUser.email_address ?? rawUser.username;
        user = { email: emailField, role: (rawUser.role as any) ?? undefined };
      } else if (data.email) {
        user = { email: data.email, role: data.role };
      }

      // determine expiresAt from explicit fields, expiresIn, or JWT payload
      let expiresAt: number | undefined;
      if (data.expiresAt) expiresAt = Number(data.expiresAt);
      else if (data.expires_in) expiresAt = Date.now() + Number(data.expires_in) * 1000;
      else if (data.expiresIn) expiresAt = Date.now() + Number(data.expiresIn) * 1000;
      else if (accessToken && typeof accessToken === "string") {
        // try to decode JWT payload to get exp
        try {
          const parts = accessToken.split('.');
          if (parts.length >= 2) {
            const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
            if (payload && payload.exp) expiresAt = Number(payload.exp) * 1000;
          }
        } catch (e) {
          // ignore JWT decode errors
        }
      }

      if (user && accessToken) {
        state = { authenticated: true, user };
        return { success: true, user, token: accessToken, accessToken, refreshToken, expiresAt };
      }

      // If API returned success flag
      if (data.success) {
        return { success: true, user: user ?? null, token: accessToken, accessToken, refreshToken, expiresAt };
      }

      return { success: false };
    } catch (e) {
      // fallback to demo login for local dev
      await delay(800);
      const demoAdmin = email === "admin@demo.com" && password === "admin123";
      const demoUser = email === "user@demo.com" && password === "user123";
      if (demoAdmin || demoUser) {
        const user = { email, role: demoAdmin ? "admin" : "user" } as const;
        state = { authenticated: true, user };
        const token = `demo_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
        return { success: true, user, token, accessToken: token, expiresAt };
      }
      return { success: false };
    }
  },
  async logout(): Promise<void> {
    try {
      await api.post("/logout");
    } catch (e) {
      // ignore if API unavailable
    }
    await delay(200);
    state = { authenticated: false, user: null };
  },
  async me(): Promise<{ email: string; role?: "admin" | "user" } | null> {
    try {
      const res = await api.get<any>("/auth/me");
      const data = res.data?.user ?? res.data ?? null;
      if (!data) return null;
      return { email: data.email ?? data.email_address ?? data.username, role: data.role };
    } catch {
      await delay(150);
      return state.user ?? null;
    }
  },
  async refresh(refreshToken?: string): Promise<{ accessToken?: string; refreshToken?: string; expiresAt?: number }> {
    try {
      const res = await api.post<any>("/auth/refresh", refreshToken ? { refreshToken } : undefined);
      const data = res.data ?? {};
      const accessToken = data.access_token ?? data.accessToken ?? data.token;
      const nextRefresh = data.refresh_token ?? data.refreshToken;
      let expiresAt: number | undefined;
      if (data.expiresAt) expiresAt = Number(data.expiresAt);
      else if (data.expires_in) expiresAt = Date.now() + Number(data.expires_in) * 1000;
      else if (data.expiresIn) expiresAt = Date.now() + Number(data.expiresIn) * 1000;
      return { accessToken, refreshToken: nextRefresh, expiresAt };
    } catch {
      await delay(120);
      return {};
    }
  },
  getCurrentUser() {
    return state.user ?? null;
  }
};

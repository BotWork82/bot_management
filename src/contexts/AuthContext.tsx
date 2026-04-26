import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useEffect,
  ReactNode
} from "react";

import { loginService, type AuthResponse } from "../services/login.service";

type AuthUser = {
  email: string;
  role: "admin" | "user";
};

type AuthToken = {
  token: string;
  expiresAt: number; // timestamp
};

const TOKEN_STORAGE_KEY = "auth_token";
const USER_STORAGE_KEY = "auth_user";
const TOKEN_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

type AuthContextValue = {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  checkTokenExpiry: () => boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    // Try to restore user from localStorage on mount
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);

    if (storedUser && storedToken) {
      try {
        const tokenData: AuthToken = JSON.parse(storedToken);
        // Check if token is still valid
        if (tokenData.expiresAt > Date.now()) {
          return JSON.parse(storedUser);
        } else {
          // Token expired, clear storage
          localStorage.removeItem(TOKEN_STORAGE_KEY);
          localStorage.removeItem(USER_STORAGE_KEY);
          // Eject to login immediately
          if (typeof window !== "undefined") {
            window.location.replace("/login");
          }
        }
      } catch {
        // Invalid stored data, clear it
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        localStorage.removeItem(USER_STORAGE_KEY);
        if (typeof window !== "undefined") {
          window.location.replace("/login");
        }
      }
    }
    return null;
  });

  // Check token expiry periodically
  useEffect(() => {
    const checkInterval = setInterval(() => {
      const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (storedToken) {
        try {
          const tokenData: AuthToken = JSON.parse(storedToken);
          if (tokenData.expiresAt <= Date.now()) {
            // Token expired, logout
            setUser(null);
            localStorage.removeItem(TOKEN_STORAGE_KEY);
            localStorage.removeItem(USER_STORAGE_KEY);
            if (typeof window !== "undefined") {
              window.location.replace("/login");
            }
          }
        } catch {
          // Invalid token, logout
          setUser(null);
          localStorage.removeItem(TOKEN_STORAGE_KEY);
          localStorage.removeItem(USER_STORAGE_KEY);
          if (typeof window !== "undefined") {
            window.location.replace("/login");
          }
        }
      }
    }, 60000); // Check every minute

    return () => clearInterval(checkInterval);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    // Use loginService to authenticate and get token
    const res: AuthResponse = await loginService.login(email, password);
    console.log(res)
    if (res.success && res.user && res.token) {
      const userData: AuthUser = { email: res.user.email, role: res.user.role ?? "user" };
      const tokenData: AuthToken = {
        token: res.token,
        expiresAt: res.expiresAt ?? Date.now() + TOKEN_DURATION
      };

      // Store in localStorage under keys used by api and context
      localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokenData));
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));

      setUser(userData);
      return true;
    }

    return false;
  }, []);

  const logout = useCallback(async () => {
    await loginService.logout();
    setUser(null);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    // Eject to login
    if (typeof window !== "undefined") {
      window.location.replace("/login");
    }
  }, []);

  const checkTokenExpiry = useCallback(() => {
    const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!storedToken) {
      return false;
    }

    try {
      const tokenData: AuthToken = JSON.parse(storedToken);
      const isValid = tokenData.expiresAt > Date.now();

      if (!isValid) {
        // Token expired, logout
        setUser(null);
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        localStorage.removeItem(USER_STORAGE_KEY);
        if (typeof window !== "undefined") {
          window.location.replace("/login");
        }
      }

      return isValid;
    } catch {
      // Invalid token, logout
      setUser(null);
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(USER_STORAGE_KEY);
      if (typeof window !== "undefined") {
        window.location.replace("/login");
      }
      return false;
    }
  }, []);

  useEffect(() => {
    const verifySession = async () => {
      const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (!storedToken) return;
      if (!checkTokenExpiry()) return;

      const currentUser = await loginService.me();
      if (!currentUser) {
        setUser(null);
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        localStorage.removeItem(USER_STORAGE_KEY);
        if (typeof window !== "undefined") {
          window.location.replace("/login");
        }
        return;
      }

      setUser({ email: currentUser.email, role: currentUser.role ?? "user" });
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify({ email: currentUser.email, role: currentUser.role ?? "user" }));
    };

    verifySession();
  }, [checkTokenExpiry]);

  const isAuthenticated = useMemo(() => {
    return user !== null && checkTokenExpiry();
  }, [user, checkTokenExpiry]);

  const value = useMemo(
    () => ({
      user,
      login,
      logout,
      isAuthenticated,
      checkTokenExpiry
    }),
    [user, login, logout, isAuthenticated, checkTokenExpiry]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}

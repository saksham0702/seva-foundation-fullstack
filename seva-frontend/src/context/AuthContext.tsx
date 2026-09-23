"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { authAPI } from "@/app/api/auth";

// ── Types ─────────────────────────────────────────────────────────────────────

export type UserRole = "admin" | "user";

export type PermissionModule =
  | "campaigns"
  | "donations"
  | "marketing"
  | "cms"
  | "users"
  | "certificates"
  | "departments"
  | "crm"
  | "signatures"
  | "volunteers"
  | "volunteer-applications"
  | "volunteer-categories"
  | "gallery";

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  permissions: PermissionModule[];
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (module: PermissionModule) => boolean;
  refreshUser: () => Promise<void>;
}

// ── Context ───────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | null>(null);

// ── Provider ──────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true); // true on mount while we check session

  // ── Rehydrate session from cookie/token on every page load ────────────────
  const refreshUser = useCallback(async () => {
    try {
      const res = await authAPI.getProfile();
      if (res?.success && res?.data) {
        setUser(res.data as AuthUser);
      } else {
        if (typeof window !== "undefined") {
          localStorage.removeItem("access_token");
        }
        setUser(null);
      }
    } catch {
      // 401 — session expired or not present
      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token");
      }
      setUser(null);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await authAPI.getProfile();
        if (mounted && res?.success && res?.data) {
          setUser(res.data as AuthUser);
        }
      } catch {
        // Not logged in — that's fine
        if (typeof window !== "undefined") {
          localStorage.removeItem("access_token");
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // ── Login ─────────────────────────────────────────────────────────────────
  const login = async (email: string, password: string) => {
    const res = await authAPI.login({ email, password });
    if (res?.success && res?.data?.user) {
      if (res.data.token && typeof window !== "undefined") {
        localStorage.setItem("access_token", res.data.token);
      }
      setUser(res.data.user as AuthUser);
    } else {
      throw new Error(res?.message || "Login failed");
    }
  };

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = async () => {
    try {
      await authAPI.logout();
    } catch {
      // ignore network errors on logout
    } finally {
      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token");
      }
      setUser(null);
      router.push("/login");
    }
  };

  // ── Permission check ──────────────────────────────────────────────────────
  const hasPermission = (module: PermissionModule): boolean => {
    if (!user) return false;
    if (user.role === "admin") return true; // admins have everything
    return user.permissions.includes(module);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        hasPermission,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

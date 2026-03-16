import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { AuthUser } from "../api/client";
import { login as apiLogin, setAuthToken } from "../api/client";

type AuthState = {
  token: string | null;
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const Ctx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("accessguard_token")
  );
  const [user, setUser] = useState<AuthUser | null>(() => {
    const raw = localStorage.getItem("accessguard_user");
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  });

  useEffect(() => {
    setAuthToken(token);
  }, [token]);

  const value = useMemo<AuthState>(
    () => ({
      token,
      user,
      login: async (email, password) => {
        const result = await apiLogin(email, password);
        setToken(result.token);
        setUser(result.user);
        setAuthToken(result.token);
        localStorage.setItem("accessguard_token", result.token);
        localStorage.setItem("accessguard_user", JSON.stringify(result.user));
      },
      logout: () => {
        setToken(null);
        setUser(null);
        setAuthToken(null);
        localStorage.removeItem("accessguard_token");
        localStorage.removeItem("accessguard_user");
      },
    }),
    [token, user]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}


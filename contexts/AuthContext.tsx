// contexts/AuthContext.tsx
"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getToken, getEmail, clearAuth } from "@/lib/auth";

interface AuthContextType {
  isAuthenticated: boolean;
  email: string | null;
  token: string | null;
  setAuth: (token: string, email: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  email: null,
  token: null,
  setAuth: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    setToken(getToken());
    setEmail(getEmail());
  }, []);

  const setAuth = (newToken: string, newEmail: string) => {
    setToken(newToken);
    setEmail(newEmail);
  };

  const logout = () => {
    clearAuth();
    setToken(null);
    setEmail(null);
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated: !!token, email, token, setAuth, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
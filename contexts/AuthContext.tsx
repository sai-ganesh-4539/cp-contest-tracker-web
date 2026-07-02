// contexts/AuthContext.tsx
"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getToken, getEmail, clearAuth } from "@/lib/auth";
import { getMyBookmarks } from "@/lib/api";

interface AuthContextType {
  isAuthenticated: boolean;
  isReady: boolean;                    // <-- ADD THIS
  email: string | null;
  token: string | null;
  bookmarkedIds: Set<string>;
  refreshBookmarks: () => Promise<void>;
  setAuth: (token: string, email: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isReady: false,                       // <-- ADD THIS
  email: null,
  token: null,
  bookmarkedIds: new Set(),
  refreshBookmarks: async () => {},
  setAuth: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);    // <-- ADD THIS
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setToken(getToken());
    setEmail(getEmail());
    setIsReady(true);                  // <-- ADD THIS
  }, []);

  useEffect(() => {
    if (!token) {
      setBookmarkedIds(new Set());
      return;
    }
    refreshBookmarks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const refreshBookmarks = async () => {
    if (!token) return;
    try {
      const bookmarks = await getMyBookmarks(token);
      setBookmarkedIds(new Set(bookmarks.map((c) => c.id)));
    } catch (err) {
      console.error("Failed to load bookmarks:", err);
    }
  };

  const setAuth = (newToken: string, newEmail: string) => {
    setToken(newToken);
    setEmail(newEmail);
  };

  const logout = () => {
    clearAuth();
    setToken(null);
    setEmail(null);
    setBookmarkedIds(new Set());
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!token,
        isReady,                         // <-- ADD THIS
        email,
        token,
        bookmarkedIds,
        refreshBookmarks,
        setAuth,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
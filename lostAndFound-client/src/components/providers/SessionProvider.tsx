"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { apiClient, toAssetUrl } from "@/lib/api-client";
import type { Author } from "@/types/post";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  coverPhoto?: string;
  bio?: string;
  phone?: string;
  role?: string;
}

interface SessionContextValue {
  user: SessionUser | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  updateUser: (patch: Partial<SessionUser>) => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

const AVATAR_COLORS = [
  "bg-teal-600",
  "bg-indigo-600",
  "bg-rose-600",
  "bg-amber-600",
  "bg-emerald-600",
  "bg-sky-600",
  "bg-fuchsia-600",
  "bg-slate-700",
];

const avatarColorFor = (name: string): string => {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash * 31 + name.charCodeAt(i)) % 9973;
  }
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
};

const initialsFor = (name: string): string =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "?";

export const authorFromUser = (user: SessionUser | null): Author => {
  if (!user) {
    return { name: "", initials: "", color: "bg-slate-400", isSelf: false };
  }
  return {
    name: user.name,
    initials: initialsFor(user.name),
    color: avatarColorFor(user.name),
    photoUrl: toAssetUrl(user.avatar),
    isSelf: true,
  };
};

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const { data } = await apiClient.get<SessionUser>("/api/v1/auth/me");
      setUser({
        ...data,
        avatar: toAssetUrl(data.avatar),
        coverPhoto: toAssetUrl(data.coverPhoto),
      });
      setError(null);
    } catch (err) {
      setUser(null);
      setError(err instanceof Error ? err.message : "Could not load your profile");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const updateUser = useCallback((patch: Partial<SessionUser>) => {
    setUser((prev) => (prev ? { ...prev, ...patch } : prev));
  }, []);

  const value = useMemo(
    () => ({ user, isLoading, error, refresh, updateUser }),
    [error, isLoading, refresh, updateUser, user],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used inside a SessionProvider");
  return ctx;
}

/** The signed-in user as an Author, ready for the Avatar component. */
export function useCurrentUser(): Author {
  const { user } = useSession();
  return authorFromUser(user);
}

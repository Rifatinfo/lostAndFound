"use client";

import { useCallback, useContext, useMemo, useState } from "react";
import { createContext } from "react";
import { apiClient, toAssetUrl } from "@/lib/api-client";
import { useSession } from "@/components/providers/SessionProvider";
import { defaultAvatarUrl, defaultCoverUrl } from "../data/constants";

interface Profile {
  name: string;
  bio: string;
  avatarUrl: string;
  coverUrl: string;
}

interface ProfileContextValue {
  profile: Profile;
  uploadAvatar: (file: File) => Promise<void>;
  uploadCover: (file: File) => Promise<void>;
  isUploading: boolean;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const { user, updateUser } = useSession();
  const [optimistic, setOptimistic] = useState<{ avatarUrl?: string; coverUrl?: string }>({});
  const [isUploading, setIsUploading] = useState(false);

  const profile = useMemo(
    () => ({
      name: user?.name ?? "Guest",
      bio: user?.bio || "Joined the community to reunite lost items with their owners.",
      avatarUrl: optimistic.avatarUrl ?? toAssetUrl(user?.avatar) ?? defaultAvatarUrl,
      coverUrl: optimistic.coverUrl ?? toAssetUrl(user?.coverPhoto) ?? defaultCoverUrl,
    }),
    [optimistic, user],
  );

  const uploadAvatar = useCallback(
    async (file: File) => {
      const preview = URL.createObjectURL(file);
      setOptimistic((prev) => ({ ...prev, avatarUrl: preview }));
      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        const result = await apiClient.patchForm<{ avatar: string }>(
          "/api/v1/user/me/avatar",
          formData,
        );
        setOptimistic((prev) => ({ ...prev, avatarUrl: undefined }));
        updateUser({ avatar: toAssetUrl(result.data.avatar) });
      } catch (err) {
        setOptimistic((prev) => ({ ...prev, avatarUrl: undefined }));
      } finally {
        setIsUploading(false);
      }
    },
    [updateUser],
  );

  const uploadCover = useCallback(
    async (file: File) => {
      const preview = URL.createObjectURL(file);
      setOptimistic((prev) => ({ ...prev, coverUrl: preview }));
      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        const result = await apiClient.patchForm<{ coverPhoto: string }>(
          "/api/v1/user/me/cover",
          formData,
        );
        setOptimistic((prev) => ({ ...prev, coverUrl: undefined }));
        updateUser({ coverPhoto: toAssetUrl(result.data.coverPhoto) });
      } catch (err) {
        setOptimistic((prev) => ({ ...prev, coverUrl: undefined }));
      } finally {
        setIsUploading(false);
      }
    },
    [updateUser],
  );

  const value = useMemo(
    () => ({ profile, uploadAvatar, uploadCover, isUploading }),
    [isUploading, profile, uploadAvatar, uploadCover],
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile(): ProfileContextValue {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used inside a ProfileProvider");
  return ctx;
}

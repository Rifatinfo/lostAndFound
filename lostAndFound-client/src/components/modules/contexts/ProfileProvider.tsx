"use client";
import  { createContext, useCallback, useContext, useMemo, useState } from 'react'


interface Profile {
  name: string
  bio: string
  avatarUrl: string
  coverUrl: string
}

interface ProfileContextValue {
  profile: Profile
  setAvatarUrl: (url: string) => void
  setCoverUrl: (url: string) => void
}

const ProfileContext = createContext<ProfileContextValue | null>(null)

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile>({
    name: 'Yea Min',
    bio: 'Dhanmondi, Dhaka · Member since 2024',
    avatarUrl: defaultAvatarUrl,
    coverUrl: defaultCoverUrl,
  })

  const setAvatarUrl = useCallback(
    (avatarUrl: string) => setProfile((prev) => ({ ...prev, avatarUrl })),
    [],
  )

  const setCoverUrl = useCallback(
    (coverUrl: string) => setProfile((prev) => ({ ...prev, coverUrl })),
    [],
  )

  const value = useMemo(
    () => ({ profile, setAvatarUrl, setCoverUrl }),
    [profile, setAvatarUrl, setCoverUrl],
  )

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
}

export function useProfile(): ProfileContextValue {
  const ctx = useContext(ProfileContext)
  if (!ctx) throw new Error('useProfile must be used inside a ProfileProvider')
  return ctx
}

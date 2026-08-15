"use client";

import { Author } from "@/types/post";
import { useProfile } from "./contexts/ProfileProvider";

interface AvatarProps {
  author: Author
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizes = {
  sm: 'h-8 w-8 text-[11px]',
  md: 'h-10 w-10 text-xs',
  lg: 'h-11 w-11 text-sm',
  // xl: 'h-[168px] w-[168px] text-4xl',
  xl: 'h-[100px] w-[100px] text-3xl sm:h-[168px] sm:w-[168px] sm:text-4xl',
}

export function Avatar({ author, size = 'md', className = '' }: AvatarProps) {
  const { profile } = useProfile()
  const photoUrl = author.isSelf ? profile.avatarUrl : author.photoUrl

  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt=""
        className={`${sizes[size]} ${className} shrink-0 rounded-full bg-slate-200 object-cover`}
      />
    )
  }

  return (
    <span
      className={`${sizes[size]} ${author.color} ${className} inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white`}
      aria-hidden="true"
    >
      {author.initials}
    </span>
  )
}

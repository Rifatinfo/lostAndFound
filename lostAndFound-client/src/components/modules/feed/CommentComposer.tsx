"use client";

import React, { useState } from 'react'
import { SendIcon } from 'lucide-react'
import { Avatar } from '../Avatar'
import { useCurrentUser } from '../../providers/SessionProvider';


interface CommentComposerProps {
  placeholder?: string
  autoFocus?: boolean
  onSubmit: (body: string) => void
  onCancel?: () => void
}

export function CommentComposer({
  placeholder = 'Add a sighting or tip…',
  autoFocus = false,
  onSubmit,
  onCancel,
}: CommentComposerProps) {
  const [draft, setDraft] = useState('')
  const currentUser = useCurrentUser()

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    const body = draft.trim()
    if (!body) return
    onSubmit(body)
    setDraft('')
  }

  return (
    <form onSubmit={submit} className="flex items-center gap-2">
      <Avatar author={currentUser} size="sm" />
      <label className="min-w-0 flex-1">
        <span className="sr-only">{placeholder}</span>
        <input
          autoFocus={autoFocus}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Escape' && onCancel) onCancel()
          }}
          placeholder={placeholder}
          className="h-9 w-full rounded-full bg-slate-100 px-3 text-sm text-slate-900 placeholder:text-slate-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </label>
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="text-xs font-semibold text-slate-500 hover:underline"
        >
          Cancel
        </button>
      )}
      <button
        type="submit"
        disabled={!draft.trim()}
        className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-teal-700 transition-colors duration-150 ease-out hover:bg-teal-50 disabled:text-slate-300 disabled:hover:bg-transparent"
        aria-label="Post comment"
      >
        <SendIcon className="h-4 w-4" />
      </button>
    </form>
  )
}

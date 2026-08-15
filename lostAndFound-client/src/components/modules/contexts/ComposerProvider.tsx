import { PostKind } from '@/types/post'
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { Post } from '@/types/post'


interface ComposerContextValue {
  isOpen: boolean
  initialKind: PostKind
  editingPost: Post | null
  openComposer: (kind?: PostKind) => void
  openEdit: (post: Post) => void
  closeComposer: () => void
}

const ComposerContext = createContext<ComposerContextValue | null>(null)

export function ComposerProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [initialKind, setInitialKind] = useState<PostKind>('lost')
  const [editingPost, setEditingPost] = useState<Post | null>(null)

  const openComposer = useCallback((kind: PostKind = 'lost') => {
    setEditingPost(null)
    setInitialKind(kind)
    setIsOpen(true)
  }, [])

  const openEdit = useCallback((post: Post) => {
    setEditingPost(post)
    setInitialKind(post.kind)
    setIsOpen(true)
  }, [])

  const closeComposer = useCallback(() => {
    setIsOpen(false)
    setEditingPost(null)
  }, [])

  const value = useMemo(
    () => ({ isOpen, initialKind, editingPost, openComposer, openEdit, closeComposer }),
    [closeComposer, editingPost, initialKind, isOpen, openComposer, openEdit],
  )

  return <ComposerContext.Provider value={value}>{children}</ComposerContext.Provider>
}

export function useComposer(): ComposerContextValue {
  const ctx = useContext(ComposerContext)
  if (!ctx) throw new Error('useComposer must be used inside a ComposerProvider')
  return ctx
}

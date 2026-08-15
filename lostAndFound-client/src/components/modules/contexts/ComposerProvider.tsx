import { PostKind } from '@/types/post'
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'


interface ComposerContextValue {
  isOpen: boolean
  initialKind: PostKind
  openComposer: (kind?: PostKind) => void
  closeComposer: () => void
}

const ComposerContext = createContext<ComposerContextValue | null>(null)

export function ComposerProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [initialKind, setInitialKind] = useState<PostKind>('lost')

  const openComposer = useCallback((kind: PostKind = 'lost') => {
    setInitialKind(kind)
    setIsOpen(true)
  }, [])

  const closeComposer = useCallback(() => setIsOpen(false), [])

  const value = useMemo(
    () => ({ isOpen, initialKind, openComposer, closeComposer }),
    [closeComposer, initialKind, isOpen, openComposer],
  )

  return <ComposerContext.Provider value={value}>{children}</ComposerContext.Provider>
}

export function useComposer(): ComposerContextValue {
  const ctx = useContext(ComposerContext)
  if (!ctx) throw new Error('useComposer must be used inside a ComposerProvider')
  return ctx
}

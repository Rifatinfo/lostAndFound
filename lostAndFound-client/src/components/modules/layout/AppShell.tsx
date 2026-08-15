"use client";
import React, { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { XIcon } from 'lucide-react'

import { CreatePostModal } from '../feed/CreatePostModal'

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <div className="min-h-screen w-full bg-slate-100">
      <Header onOpenMenu={() => setIsMenuOpen(true)} />

      <div className="flex justify-center gap-4 px-0 pt-14 lg:px-4">
        <div className="hidden w-[300px] shrink-0 lg:block">
          <div className="sticky top-14 max-h-[calc(100vh-3.5rem)] overflow-y-auto px-2 pt-4">
            <SidebarNav />
          </div>
        </div>

        <main className="w-full min-w-0 max-w-[600px] py-4">{children}</main>

        <div className="hidden xl:block">
          <div className="sticky top-14 max-h-[calc(100vh-3.5rem)] overflow-y-auto">
            <RightRail />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <motion.div
              className="absolute inset-0 bg-slate-900/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
              onClick={() => setIsMenuOpen(false)}
            />
            <motion.div
              className="absolute inset-y-0 left-0 w-[300px] max-w-[85%] overflow-y-auto bg-slate-100 px-3 py-4 shadow-xl"
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
              role="dialog"
              aria-label="Navigation"
            >
              <button
                type="button"
                onClick={() => setIsMenuOpen(false)}
                className="mb-2 grid h-9 w-9 place-items-center rounded-full bg-slate-200 text-slate-700"
                aria-label="Close navigation"
              >
                <XIcon className="h-5 w-5" />
              </button>
              <SidebarNav onNavigate={() => setIsMenuOpen(false)} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <CreatePostModal />
    </div>
  )
}

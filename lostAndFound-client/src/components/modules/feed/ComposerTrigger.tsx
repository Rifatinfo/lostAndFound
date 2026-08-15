"use client";

import React from 'react'
import { ImageIcon, MapPinIcon, PackageSearchIcon, SearchIcon } from 'lucide-react'
import { useComposer } from '../contexts/ComposerProvider';
import { Avatar } from '../Avatar';
import { useCurrentUser } from '../../providers/SessionProvider';


export function ComposerTrigger() {
  const { openComposer } = useComposer()
  const currentUser = useCurrentUser()

  return (
    <section aria-label="Create a post" className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="flex items-center gap-3">
        <Avatar author={currentUser} size="lg" />
        <button
          type="button"
          onClick={() => openComposer('lost')}
          className="h-10 flex-1 rounded-full bg-slate-100 px-4 text-left text-[15px] text-slate-500 transition-colors duration-150 ease-out hover:bg-slate-200"
        >
          Lost or found something, {currentUser.name.split(' ')[0]}?
        </button>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-1 border-t border-slate-200 pt-2">
        <TriggerAction
          onClick={() => openComposer('lost')}
          icon={<SearchIcon className="h-5 w-5 text-rose-500" />}
          label="Report lost"
        />
        <TriggerAction
          onClick={() => openComposer('found')}
          icon={<PackageSearchIcon className="h-5 w-5 text-emerald-600" />}
          label="Report found"
        />
        <TriggerAction
          onClick={() => openComposer('found')}
          icon={<ImageIcon className="h-5 w-5 text-indigo-500" />}
          label="Add photo"
        />
      </div>

      <p className="mt-2 flex items-center gap-1.5 px-1 text-xs text-slate-500">
        <MapPinIcon className="h-3.5 w-3.5" />
        Posts are shown to people near the location you pick.
      </p>
    </section>
  )
}

interface TriggerActionProps {
  icon: React.ReactNode
  label: string
  onClick: () => void
}

function TriggerAction({ icon, label, onClick }: TriggerActionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold text-slate-600 transition-colors duration-150 ease-out hover:bg-slate-100"
    >
      {icon}
      <span className="truncate">{label}</span>
    </button>
  )
}

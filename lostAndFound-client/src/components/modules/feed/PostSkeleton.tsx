import React from 'react'

export function PostSkeleton() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4" aria-hidden="true">
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 animate-pulse rounded-full bg-slate-200" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-40 animate-pulse rounded bg-slate-200" />
          <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200" />
        <div className="h-3 w-full animate-pulse rounded bg-slate-200" />
        <div className="h-3 w-5/6 animate-pulse rounded bg-slate-200" />
      </div>
      <div className="mt-4 h-56 animate-pulse rounded-lg bg-slate-200" />
    </div>
  )
}

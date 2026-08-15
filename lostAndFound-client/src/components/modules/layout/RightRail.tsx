"use client";
import { CheckCircle2Icon, MoreHorizontalIcon } from 'lucide-react'


function timeLabel(minutes: number): string {
  if (minutes < 60) return `${minutes}m ago`
  return `${Math.round(minutes / 60)}h ago`
}

export function RightRail() {
  return (
    <aside aria-label="Sponsored and activity" className="w-[300px] shrink-0 pb-10 pt-4">
      <div className="flex items-center justify-between px-2">
        <h2 className="text-[15px] font-semibold text-slate-500">Sponsored</h2>
        <button
          type="button"
          className="grid h-8 w-8 place-items-center rounded-full text-slate-500 transition-colors hover:bg-slate-200/70"
          aria-label="Sponsored options"
        >
          <MoreHorizontalIcon className="h-4 w-4" />
        </button>
      </div>

      <ul className="mt-1 space-y-1">
        {promos.map((promo) => (
          <li key={promo.id}>
            <a
              href="#"
              className="flex gap-3 rounded-lg p-2 transition-colors hover:bg-slate-200/70"
            >
              <img
                src={promo.image}
                alt=""
                className="h-[110px] w-[110px] shrink-0 rounded-lg object-cover"
              />
              <span className="min-w-0 self-center">
                <span className="block text-sm font-medium leading-snug text-slate-900">
                  {promo.title}
                </span>
                <span className="mt-1 block truncate text-xs text-slate-500">{promo.domain}</span>
              </span>
            </a>
          </li>
        ))}
      </ul>

      <hr className="my-3 border-slate-300/70" />

      <h2 className="px-2 text-[15px] font-semibold text-slate-500">Reunited today</h2>
      <ul className="mt-1 space-y-0.5">
        {recentMatches.map((match) => (
          <li key={match.id}>
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-slate-200/70"
            >
              <span
                className={`${match.color} relative grid h-9 w-9 shrink-0 place-items-center rounded-full text-[11px] font-semibold text-white`}
              >
                {match.initials}
                <CheckCircle2Icon className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-white text-emerald-600" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-slate-900">
                  {match.itemName}
                </span>
                <span className="block truncate text-xs text-slate-500">
                  {match.location} · {timeLabel(match.minutesAgo)}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </aside>
  )
}

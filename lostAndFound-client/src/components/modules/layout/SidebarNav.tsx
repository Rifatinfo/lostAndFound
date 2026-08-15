"use client";
import {
  BookmarkIcon,
  HeartHandshakeIcon,
  HomeIcon,
  MapPinIcon,
  PackageSearchIcon,
  SearchIcon,
  ShieldCheckIcon,
  UserRoundIcon,
} from 'lucide-react'


const icons: Record<string, React.ComponentType<{ className?: string }>> = {
  home: HomeIcon,
  search: SearchIcon,
  package: PackageSearchIcon,
  heart: HeartHandshakeIcon,
  bookmark: BookmarkIcon,
  user: UserRoundIcon,
}

interface SidebarNavProps {
  onNavigate?: () => void
}

export function SidebarNav({ onNavigate }: SidebarNavProps) {
  return (
    <nav aria-label="Sections" className="pb-8">
      <NavLink
        to="/profile"
        onClick={onNavigate}
        className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-slate-200/70"
      >
        <Avatar author={currentUser} size="sm" />
        <span className="text-[15px] font-semibold text-slate-900">{currentUser.name}</span>
      </NavLink>

      <ul className="mt-1 space-y-0.5">
        {navItems.map((item) => {
          const Icon = icons[item.icon] ?? HomeIcon
          return (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.to === '/'}
                onClick={onNavigate}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-2 py-2 text-[15px] transition-colors duration-150 ease-out ${
                    isActive
                      ? 'bg-teal-50 font-semibold text-teal-800'
                      : 'font-medium text-slate-800 hover:bg-slate-200/70'
                  }`
                }
              >
                <Icon className={`h-6 w-6 ${item.tint}`} />
                <span className="flex-1 truncate">{item.label}</span>
                {typeof item.count === 'number' && (
                  <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-700">
                    {item.count}
                  </span>
                )}
              </NavLink>
            </li>
          )
        })}
      </ul>

      <hr className="my-3 border-slate-300/70" />

      <h2 className="px-2 text-[15px] font-semibold text-slate-500">Your areas</h2>
      <ul className="mt-1 space-y-0.5">
        {shortcuts.map((shortcut) => (
          <li key={shortcut.label}>
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-slate-200/70"
            >
              <span
                className={`${shortcut.color} grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[11px] font-semibold text-white`}
              >
                {shortcut.initials}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[15px] font-medium text-slate-800">
                  {shortcut.label}
                </span>
                <span className="block text-xs text-slate-500">{shortcut.meta}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      <hr className="my-3 border-slate-300/70" />

      <div className="space-y-2 px-2 text-xs text-slate-500">
        <p className="flex items-start gap-2">
          <ShieldCheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
          Meet in public places and never share ID numbers in comments.
        </p>
        <p className="flex items-start gap-2">
          <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
          Serving Dhaka · 12,480 items reunited so far.
        </p>
      </div>
    </nav>
  )
}

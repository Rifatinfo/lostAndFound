"use client";
import {
  BellIcon,
  HeartHandshakeIcon,
  HomeIcon,
  MenuIcon,
  PackageSearchIcon,
  PlusIcon,
  SearchIcon,
} from 'lucide-react'
import { useComposer } from '../contexts/ComposerProvider';
import { NavLink } from './NavLink';
import { Avatar } from '../Avatar';
import { useCurrentUser } from '../../providers/SessionProvider';


const tabs = [
  { to: '/', label: 'Home', Icon: HomeIcon },
  { to: '/lost', label: 'Lost', Icon: SearchIcon },
  { to: '/found', label: 'Found', Icon: PackageSearchIcon },
  { to: '/reunited', label: 'Reunited', Icon: HeartHandshakeIcon },
]

interface HeaderProps {
  onOpenMenu: () => void
}

export function Header({ onOpenMenu }: HeaderProps) {
  const { openComposer } = useComposer()
  const currentUser = useCurrentUser()

  return (
    <header className="fixed inset-x-0 top-0 z-30 h-14 border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-full items-center gap-2 px-3 lg:px-4">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <button
            type="button"
            onClick={onOpenMenu}
            className="grid h-10 w-10 place-items-center rounded-full text-slate-600 transition-colors hover:bg-slate-100 lg:hidden"
            aria-label="Open navigation"
          >
            <MenuIcon className="h-5 w-5" />
          </button>

          <NavLink to="/" className="flex items-center gap-2" aria-label="FoundIt home">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-teal-600 text-white">
              <PackageSearchIcon className="h-5 w-5" />
            </span>
            <span className="hidden text-lg font-bold tracking-tight text-slate-900 sm:block">
              FoundIt
            </span>
          </NavLink>

          <label className="relative hidden min-w-0 max-w-[260px] flex-1 items-center md:flex">
            <SearchIcon className="pointer-events-none absolute left-3 h-4 w-4 text-slate-400" />
            <span className="sr-only">Search lost and found posts</span>
            <input
              type="search"
              placeholder="Search items, places, people"
              className="h-10 w-full rounded-full bg-slate-100 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </label>
        </div>

        <nav aria-label="Main" className="hidden items-center lg:flex">
          {tabs.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `group relative grid h-14 w-[110px] place-items-center transition-colors ${
                  isActive ? 'text-teal-700' : 'text-slate-500 hover:bg-slate-100'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className="h-6 w-6" aria-hidden="true" />
                  <span className="sr-only">{label}</span>
                  {isActive && (
                    <span className="absolute inset-x-0 bottom-0 h-[3px] rounded-t bg-teal-600" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="flex flex-1 items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => openComposer('lost')}
            className="inline-flex h-10 items-center gap-1.5 rounded-full bg-teal-600 px-3 text-sm font-semibold text-white transition-colors duration-150 ease-out hover:bg-teal-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 sm:px-4"
          >
            <PlusIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Create post</span>
          </button>
          <button
            type="button"
            className="relative grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-slate-700 transition-colors hover:bg-slate-200"
            aria-label="Notifications, 3 unread"
          >
            <BellIcon className="h-5 w-5" />
            <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-[20px] place-items-center rounded-full bg-rose-600 px-1 text-[11px] font-semibold text-white">
              3
            </span>
          </button>
          <NavLink
            to="/profile"
            aria-label="Your profile"
            className="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
          >
            <Avatar author={currentUser} />
          </NavLink>
        </div>
      </div>
    </header>
  )
}

export interface NavItem {
  label: string
  to: string
  icon: string
  tint: string
  count?: number
}

export const navItems: NavItem[] = [
  { label: 'Home', to: '/', icon: 'home', tint: 'text-teal-600' },
  { label: 'Lost items', to: '/lost', icon: 'search', tint: 'text-rose-500', count: 42 },
  { label: 'Found items', to: '/found', icon: 'package', tint: 'text-emerald-600', count: 27 },
  { label: 'Reunited', to: '/reunited', icon: 'heart', tint: 'text-fuchsia-600' },
  { label: 'Saved posts', to: '/saved', icon: 'bookmark', tint: 'text-amber-600' },
  { label: 'My profile', to: '/profile', icon: 'user', tint: 'text-indigo-600' },
]

export interface Shortcut {
  label: string
  meta: string
  initials: string
  color: string
}

export const shortcuts: Shortcut[] = [
  { label: 'Dhanmondi Neighbourhood Watch', meta: '4 new posts', initials: 'DN', color: 'bg-sky-600' },
  { label: 'Metro Line 6 Commuters', meta: '12 new posts', initials: 'M6', color: 'bg-emerald-600' },
  { label: 'DIU Campus Lost & Found', meta: '2 new posts', initials: 'DI', color: 'bg-indigo-600' },
  { label: 'Dhaka Pet Rescue Network', meta: '7 new posts', initials: 'PR', color: 'bg-amber-600' },
]

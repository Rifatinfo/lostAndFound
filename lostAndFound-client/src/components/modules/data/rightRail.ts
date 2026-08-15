

export interface Promo {
  id: string
  title: string
  domain: string
  image: string
}

export const promos: Promo[] = [
  {
    id: 'promo-1',
    title: 'Engrave your keys — free ID tags this week',
    domain: 'keytag.com.bd',
    image: "",
  },
  {
    id: 'promo-2',
    title: 'Smart trackers for bags and wallets',
    domain: 'findit.store',
    image: "",
  },
]

export interface RecentMatch {
  id: string
  itemName: string
  location: string
  minutesAgo: number
  initials: string
  color: string
}

export const recentMatches: RecentMatch[] = [
  { id: 'm1', itemName: 'Silver ring returned', location: 'Uttara Sector 7', minutesAgo: 14, initials: 'SR', color: 'bg-fuchsia-600' },
  { id: 'm2', itemName: 'Student ID card returned', location: 'DIU Campus', minutesAgo: 52, initials: 'ID', color: 'bg-indigo-600' },
  { id: 'm3', itemName: 'Cat "Mishti" back home', location: 'Mohammadpur', minutesAgo: 128, initials: 'MI', color: 'bg-amber-600' },
]

export type PostKind = 'lost' | 'found'

export type PostStatus = 'open' | 'reunited'

export interface Author {
  name: string
  initials: string
  color: string
  photoUrl?: string
  /** True for the signed-in user, so their live profile photo is always used. */
  isSelf?: boolean
}

export interface Comment {
  id: string
  author: Author
  body: string
  createdAt: string
  likeCount: number
  isLiked: boolean
  replies: Comment[]
}

export interface Post {
  id: string
  kind: PostKind
  status: PostStatus
  author: Author
  createdAt: string
  itemName: string
  category: string
  location: string
  body: string
  image?: string
  reward?: string
  helpfulCount: number
  comments: Comment[]
  shareCount: number
  isHelpful: boolean
  isSaved: boolean
  isMine: boolean
}

export interface NewPostDraft {
  kind: PostKind
  itemName: string
  category: string
  location: string
  body: string
  image?: string
  reward?: string
}

import { NewPostDraft, Post } from '@/types/post'
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react'


const MAX_PAGES = 4

interface PostsContextValue {
  posts: Post[]
  isLoadingMore: boolean
  hasMore: boolean
  error: string | null
  loadMore: () => void
  retry: () => void
  addPost: (draft: NewPostDraft) => void
  toggleHelpful: (id: string) => void
  toggleSave: (id: string) => void
  markReunited: (id: string) => void
  addComment: (id: string, body: string, parentCommentId?: string) => void
  toggleCommentLike: (postId: string, commentId: string) => void
}

/** Applies fn to the matching comment anywhere in a reply tree. */
function mapComments(
  comments: Comment[],
  id: string,
  fn: (comment: Comment) => Comment,
): Comment[] {
  return comments.map((comment) =>
    comment.id === id
      ? fn(comment)
      : { ...comment, replies: mapComments(comment.replies, id, fn) },
  )
}

export function countComments(comments: Comment[]): number {
  return comments.reduce((total, comment) => total + 1 + countComments(comment.replies), 0)
}

const PostsContext = createContext<PostsContextValue | null>(null)

export function PostsProvider({ children }: { children: React.ReactNode }) {
  const [posts, setPosts] = useState<Post[]>(seedPosts)
  const [page, setPage] = useState(0)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inFlight = useRef(false)

  const hasMore = page < MAX_PAGES

  const fetchPage = useCallback((nextPage: number) => {
    if (inFlight.current) return
    inFlight.current = true
    setIsLoadingMore(true)
    setError(null)
    window.setTimeout(() => {
      // Simulate an occasional network hiccup so the feed has a real error state.
      if (nextPage === 3) {
        setError('We could not load more posts. Check your connection.')
        setIsLoadingMore(false)
        inFlight.current = false
        return
      }
      setPosts((prev) => [...prev, ...generatePosts(nextPage)])
      setPage(nextPage)
      setIsLoadingMore(false)
      inFlight.current = false
    }, 900)
  }, [])

  const loadMore = useCallback(() => {
    if (isLoadingMore || error || !hasMore) return
    fetchPage(page + 1)
  }, [error, fetchPage, hasMore, isLoadingMore, page])

  const retry = useCallback(() => {
    setError(null)
    setPosts((prev) => [...prev, ...generatePosts(3)])
    setPage(3)
  }, [])

  const addPost = useCallback((draft: NewPostDraft) => {
    const post: Post = {
      id: `new-${Date.now()}`,
      kind: draft.kind,
      status: 'open',
      author: currentUser,
      createdAt: new Date().toISOString(),
      itemName: draft.itemName,
      category: draft.category,
      location: draft.location,
      body: draft.body,
      image: draft.image,
      reward: draft.reward,
      helpfulCount: 0,
      shareCount: 0,
      comments: [],
      isHelpful: false,
      isSaved: false,
      isMine: true,
    }
    setPosts((prev) => [post, ...prev])
  }, [])

  const update = useCallback((id: string, fn: (post: Post) => Post) => {
    setPosts((prev) => prev.map((post) => (post.id === id ? fn(post) : post)))
  }, [])

  const toggleHelpful = useCallback(
    (id: string) =>
      update(id, (post) => ({
        ...post,
        isHelpful: !post.isHelpful,
        helpfulCount: post.helpfulCount + (post.isHelpful ? -1 : 1),
      })),
    [update],
  )

  const toggleSave = useCallback(
    (id: string) => update(id, (post) => ({ ...post, isSaved: !post.isSaved })),
    [update],
  )

  const markReunited = useCallback(
    (id: string) => update(id, (post) => ({ ...post, status: 'reunited' })),
    [update],
  )

  const addComment = useCallback(
    (id: string, body: string, parentCommentId?: string) => {
      const comment: Comment = {
        id: `c-${Date.now()}`,
        author: currentUser,
        body,
        createdAt: new Date().toISOString(),
        likeCount: 0,
        isLiked: false,
        replies: [],
      }
      update(id, (post) =>
        parentCommentId
          ? {
              ...post,
              comments: mapComments(post.comments, parentCommentId, (parent) => ({
                ...parent,
                replies: [...parent.replies, comment],
              })),
            }
          : { ...post, comments: [...post.comments, comment] },
      )
    },
    [update],
  )

  const toggleCommentLike = useCallback(
    (postId: string, commentId: string) => {
      update(postId, (post) => ({
        ...post,
        comments: mapComments(post.comments, commentId, (comment) => ({
          ...comment,
          isLiked: !comment.isLiked,
          likeCount: comment.likeCount + (comment.isLiked ? -1 : 1),
        })),
      }))
    },
    [update],
  )

  const value = useMemo(
    () => ({
      posts,
      isLoadingMore,
      hasMore,
      error,
      loadMore,
      retry,
      addPost,
      toggleHelpful,
      toggleSave,
      markReunited,
      addComment,
      toggleCommentLike,
    }),
    [
      addComment,
      toggleCommentLike,
      addPost,
      error,
      hasMore,
      isLoadingMore,
      loadMore,
      markReunited,
      posts,
      retry,
      toggleHelpful,
      toggleSave,
    ],
  )

  return <PostsContext.Provider value={value}>{children}</PostsContext.Provider>
}

export function usePosts(): PostsContextValue {
  const ctx = useContext(PostsContext)
  if (!ctx) throw new Error('usePosts must be used inside a PostsProvider')
  return ctx
}

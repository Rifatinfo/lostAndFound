"use client";

import  { useCallback } from 'react'
import { AlertTriangleIcon, CheckCircle2Icon, InboxIcon } from 'lucide-react'
import { Post } from '@/types/post';
import { usePosts } from '../contexts/PostContexts';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { PostCard } from './PostCard';
import { PostSkeleton } from './PostSkeleton';


interface FeedProps {
  posts: Post[]
  infinite?: boolean
  emptyTitle: string
  emptyDescription: string
}

export function Feed({ posts, infinite = false, emptyTitle, emptyDescription }: FeedProps) {
  const { isLoadingMore, hasMore, error, loadMore, retry } = usePosts()

  const onReachEnd = useCallback(() => {
    if (infinite) loadMore()
  }, [infinite, loadMore])

  const sentinelRef = useInfiniteScroll({
    onReachEnd,
    enabled: infinite && hasMore && !error,
  })

  if (!infinite && posts.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white px-6 py-12 text-center">
        <InboxIcon className="mx-auto h-8 w-8 text-slate-400" />
        <h3 className="mt-3 text-[17px] font-semibold text-slate-900">{emptyTitle}</h3>
        <p className="mx-auto mt-1 max-w-sm text-sm text-slate-600">{emptyDescription}</p>
      </div>
    )
  }

  const loadingInitial = posts.length === 0 && isLoadingMore

  return (
    <div className="space-y-4">
      {loadingInitial ? (
        <div className="space-y-4" aria-live="polite">
          <span className="sr-only">Loading posts</span>
          <PostSkeleton />
          <PostSkeleton />
        </div>
      ) : posts.length > 0 ? (
        posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))
      ) : error ? null : (
        <div className="rounded-lg border border-slate-200 bg-white px-6 py-12 text-center">
          <InboxIcon className="mx-auto h-8 w-8 text-slate-400" />
          <h3 className="mt-3 text-[17px] font-semibold text-slate-900">{emptyTitle}</h3>
          <p className="mx-auto mt-1 max-w-sm text-sm text-slate-600">{emptyDescription}</p>
        </div>
      )}

      {infinite && (
        <>
          {!loadingInitial && isLoadingMore && (
            <div className="space-y-4" aria-live="polite">
              <span className="sr-only">Loading more posts</span>
              <PostSkeleton />
              <PostSkeleton />
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="flex flex-col items-center gap-3 rounded-lg border border-rose-200 bg-rose-50 px-6 py-8 text-center"
            >
              <AlertTriangleIcon className="h-6 w-6 text-rose-600" />
              <p className="text-sm text-rose-800">{error}</p>
              <button
                type="button"
                onClick={retry}
                className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition-colors duration-150 ease-out hover:bg-rose-700"
              >
                Try again
              </button>
            </div>
          )}

          {!hasMore && !isLoadingMore && !error && posts.length > 0 && (
            <p className="flex items-center justify-center gap-2 py-6 text-sm text-slate-500">
              <CheckCircle2Icon className="h-4 w-4 text-emerald-600" />
              You are all caught up on nearby reports.
            </p>
          )}

          <div ref={sentinelRef} className="h-px w-full" />
        </>
      )}
    </div>
  )
}

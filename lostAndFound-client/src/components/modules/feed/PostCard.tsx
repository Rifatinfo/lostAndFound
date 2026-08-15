"use client";
import  { useState } from 'react'
import { formatDistanceToNowStrict } from 'date-fns'
import {
  BadgeCheckIcon,
  BookmarkIcon,
  CheckCircle2Icon,
  MapPinIcon,
  MessageCircleIcon,
  MoreHorizontalIcon,
  Share2Icon,
  ThumbsUpIcon,
} from 'lucide-react'

import { CommentThread } from './CommentThread'
import { CommentComposer } from './CommentComposer'
import { usePosts } from '../contexts/PostContexts';
import { Avatar } from '../Avatar';
import { countComments } from '../contexts/PostContexts';
import { Post } from '@/types/post';

interface PostCardProps {
  post: Post
}

export function PostCard({ post }: PostCardProps) {
  const { toggleHelpful, toggleSave, markReunited, addComment } = usePosts()
  const [showComments, setShowComments] = useState(false)

  const isLost = post.kind === 'lost'
  const timeAgo = formatDistanceToNowStrict(new Date(post.createdAt), { addSuffix: false })
  const commentCount = countComments(post.comments)

  return (
    <article className="rounded-lg border border-slate-200 bg-white">
      <header className="flex items-start gap-3 px-4 pt-3">
        <Avatar author={post.author} size="lg" />
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1 text-[15px] font-semibold text-slate-900">
            <span className="truncate">{post.author.name}</span>
            {post.isMine ? (
              <span className="ml-1 rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-600">
                You
              </span>
            ) : (
              <BadgeCheckIcon className="h-4 w-4 shrink-0 text-teal-600" aria-label="Verified reporter" />
            )}
          </p>
          <p className="flex flex-wrap items-center gap-x-1.5 text-xs text-slate-500">
            <time dateTime={post.createdAt}>{timeAgo} ago</time>
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1">
              <MapPinIcon className="h-3.5 w-3.5" />
              {post.location}
            </span>
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
            isLost ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'
          }`}
        >
          {isLost ? 'Lost' : 'Found'}
        </span>
        <button
          type="button"
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-slate-500 transition-colors hover:bg-slate-100"
          aria-label={`More options for ${post.itemName}`}
        >
          <MoreHorizontalIcon className="h-5 w-5" />
        </button>
      </header>

      <div className="px-4 pt-3">
        <h3 className="text-[17px] font-semibold leading-snug text-slate-900">{post.itemName}</h3>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
            {post.category}
          </span>
          {post.reward && (
            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-800">
              {post.reward}
            </span>
          )}
          {post.status === 'reunited' && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2 py-0.5 text-xs font-semibold text-white">
              <CheckCircle2Icon className="h-3.5 w-3.5" />
              Reunited
            </span>
          )}
        </div>
        <p className="mt-2 whitespace-pre-line text-[15px] leading-relaxed text-slate-800">
          {post.body}
        </p>
      </div>

      {post.image && (
        <img
          src={post.image}
          alt={`${post.kind === 'lost' ? 'Lost' : 'Found'} item: ${post.itemName}`}
          className="mt-3 max-h-[520px] w-full bg-slate-900 object-cover"
          loading="lazy"
        />
      )}

      <div className="flex items-center justify-between px-4 py-2 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1.5">
          <span className="grid h-5 w-5 place-items-center rounded-full bg-teal-600">
            <ThumbsUpIcon className="h-3 w-3 text-white" />
          </span>
          {post.helpfulCount} found this helpful
        </span>
        <span className="flex gap-3">
          <button type="button" onClick={() => setShowComments((v) => !v)} className="hover:underline">
            {commentCount} comments
          </button>
          <span>{post.shareCount} shares</span>
        </span>
      </div>

      <div className="mx-4 grid grid-cols-4 gap-1 border-t border-slate-200 py-1">
        <ActionButton
          label="Helpful"
          active={post.isHelpful}
          onClick={() => toggleHelpful(post.id)}
          icon={<ThumbsUpIcon className="h-5 w-5" />}
        />
        <ActionButton
          label="Comment"
          onClick={() => setShowComments((v) => !v)}
          icon={<MessageCircleIcon className="h-5 w-5" />}
        />
        <ActionButton label="Share" icon={<Share2Icon className="h-5 w-5" />} />
        <ActionButton
          label="Save"
          active={post.isSaved}
          onClick={() => toggleSave(post.id)}
          icon={<BookmarkIcon className={`h-5 w-5 ${post.isSaved ? 'fill-current' : ''}`} />}
        />
      </div>

      {post.isMine && post.status === 'open' && (
        <div className="border-t border-slate-200 px-4 py-3">
          <button
            type="button"
            onClick={() => markReunited(post.id)}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800 transition-colors duration-150 ease-out hover:bg-emerald-100"
          >
            <CheckCircle2Icon className="h-4 w-4" />
            Mark as reunited
          </button>
        </div>
      )}

      {showComments && (
        <div className="border-t border-slate-200 px-4 py-3">
          <ul className="space-y-4">
            {post.comments.map((comment) => (
              <CommentThread key={comment.id} postId={post.id} comment={comment} />
            ))}
            {post.comments.length === 0 && (
              <li className="text-sm text-slate-500">
                No comments yet — a sighting or a tip can be enough.
              </li>
            )}
          </ul>

          <div className="mt-4">
            <CommentComposer onSubmit={(body) => addComment(post.id, body)} />
          </div>
        </div>
      )}
    </article>
  )
}

interface ActionButtonProps {
  label: string
  icon: React.ReactNode
  active?: boolean
  onClick?: () => void
}

function ActionButton({ label, icon, active = false, onClick }: ActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={onClick ? active : undefined}
      className={`flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold transition-colors duration-150 ease-out hover:bg-slate-100 ${
        active ? 'text-teal-700' : 'text-slate-600'
      }`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  )
}

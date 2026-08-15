"use client";

import React, { useState } from 'react'
import { formatDistanceToNowStrict } from 'date-fns'
import { ThumbsUpIcon } from 'lucide-react'

import { CommentComposer } from './CommentComposer'
import { Avatar } from '../Avatar'
import { usePosts } from '../contexts/PostContexts'
import { Comment } from '@/types/post'

interface CommentThreadProps {
  postId: string
  comment: Comment
  depth?: number
}

export function CommentThread({ postId, comment, depth = 0 }: CommentThreadProps) {
  const { toggleCommentLike, addComment } = usePosts()
  const [isReplying, setIsReplying] = useState(false)
  const [showReplies, setShowReplies] = useState(depth > 0)

  const replyCount = comment.replies.length

  return (
    <li>
      <div className="flex gap-2">
        <Avatar author={comment.author} size="sm" />
        <div className="min-w-0 flex-1">
          <div className="relative inline-block max-w-full rounded-2xl bg-slate-100 px-3 py-2">
            <p className="text-[13px] font-semibold text-slate-900">{comment.author.name}</p>
            <p className="whitespace-pre-line text-[14px] leading-snug text-slate-800">
              {comment.body}
            </p>
            {comment.likeCount > 0 && (
              <span className="absolute -bottom-2 right-1 inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-1.5 py-0.5 text-[11px] font-medium text-slate-600 shadow-sm">
                <ThumbsUpIcon className="h-3 w-3 text-teal-600" />
                {comment.likeCount}
              </span>
            )}
          </div>

          <div className="mt-1.5 flex items-center gap-3 pl-3 text-[12px] font-semibold text-slate-500">
            <button
              type="button"
              onClick={() => toggleCommentLike(postId, comment.id)}
              aria-pressed={comment.isLiked}
              className={`transition-colors duration-150 ease-out hover:underline ${
                comment.isLiked ? 'text-teal-700' : ''
              }`}
            >
              Like
            </button>
            <button
              type="button"
              onClick={() => {
                setIsReplying(true)
                setShowReplies(true)
              }}
              className="transition-colors duration-150 ease-out hover:underline"
            >
              Reply
            </button>
            <span className="font-normal">
              {formatDistanceToNowStrict(new Date(comment.createdAt))} ago
            </span>
          </div>

          {replyCount > 0 && !showReplies && (
            <button
              type="button"
              onClick={() => setShowReplies(true)}
              className="mt-2 pl-3 text-[13px] font-semibold text-slate-600 hover:underline"
            >
              View {replyCount} {replyCount === 1 ? 'reply' : 'replies'}
            </button>
          )}

          {showReplies && (replyCount > 0 || isReplying) && (
            <ul className="mt-3 space-y-3 border-l border-slate-200 pl-3">
              {comment.replies.map((reply) => (
                <CommentThread key={reply.id} postId={postId} comment={reply} depth={depth + 1} />
              ))}

              {isReplying && (
                <li>
                  <CommentComposer
                    autoFocus
                    placeholder={`Reply to ${comment.author.name.split(' ')[0]}…`}
                    onCancel={() => setIsReplying(false)}
                    onSubmit={(body) => {
                      addComment(postId, body, comment.id)
                      setIsReplying(false)
                    }}
                  />
                </li>
              )}
            </ul>
          )}
        </div>
      </div>
    </li>
  )
}

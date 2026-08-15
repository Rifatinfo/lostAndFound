"use client";
import { ClockIcon } from 'lucide-react'
import { formatDistanceToNowStrict } from 'date-fns'
import { Post } from '@/types/post';


interface UrgentStripProps {
  posts: Post[]
}

export function UrgentStrip({ posts }: UrgentStripProps) {
  if (posts.length === 0) return null

  return (
    <section aria-labelledby="urgent-heading" className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="flex items-baseline justify-between px-1">
        <h2 id="urgent-heading" className="text-[15px] font-semibold text-slate-900">
          Urgent near you
        </h2>
        <span className="text-xs text-slate-500">{posts.length} active</span>
      </div>

      <ul className="mt-2 flex gap-2 overflow-x-auto pb-1">
        {posts.map((post) => (
          <li key={post.id} className="w-[150px] shrink-0">
            <button
              type="button"
              className="group block w-full overflow-hidden rounded-lg border border-slate-200 text-left transition-colors duration-150 ease-out hover:border-teal-500"
            >
              <span className="block h-[92px] w-full bg-slate-200">
                {post.image && (
                  <img src={post.image} alt="" className="h-full w-full object-cover" loading="lazy" />
                )}
              </span>
              <span className="block px-2 py-2">
                <span className="block truncate text-[13px] font-semibold text-slate-900">
                  {post.itemName}
                </span>
                <span className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-500">
                  <ClockIcon className="h-3 w-3" />
                  {formatDistanceToNowStrict(new Date(post.createdAt))} ago
                </span>
                {post.reward && (
                  <span className="mt-1 inline-block rounded bg-amber-50 px-1.5 py-0.5 text-[11px] font-semibold text-amber-800">
                    {post.reward}
                  </span>
                )}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}

"use client";
import { usePosts } from "../contexts/PostContexts"
import { Feed } from "../feed/Feed"
import { PageHeading } from "../PageHeading"


export function Lost() {
  const { posts } = usePosts()
  const lost = posts.filter((post) => post.kind === 'lost' && post.status === 'open')

  return (
    <div className="space-y-4">
      <PageHeading
        title="Lost items"
        description="Reports from people still searching. A single sighting is often enough to close one."
      />
      <Feed
        posts={lost}
        emptyTitle="No open lost reports"
        emptyDescription="Everything reported lost in your areas has been reunited."
      />
    </div>
  )
}

"use client";

import { usePosts } from "../contexts/PostContexts"
import { Feed } from "../feed/Feed"
import { PageHeading } from "../PageHeading"


export function Reunited() {
  const { posts } = usePosts()
  const reunited = posts.filter((post) => post.status === 'reunited')

  return (
    <div className="space-y-4">
      <PageHeading
        title="Reunited"
        description="Closed cases from your areas — proof that posting here works."
      />
      <Feed
        posts={reunited}
        emptyTitle="No reunions yet"
        emptyDescription="When a post is marked as reunited, it moves here."
      />
    </div>
  )
}

import { usePosts } from "../contexts/PostContexts"
import { Feed } from "../feed/Feed"
import { PageHeading } from "../PageHeading"


export function Saved() {
  const { posts } = usePosts()
  const saved = posts.filter((post) => post.isSaved)

  return (
    <div className="space-y-4">
      <PageHeading
        title="Saved posts"
        description="Posts you are keeping an eye on while you look around."
      />
      <Feed
        posts={saved}
        emptyTitle="Nothing saved yet"
        emptyDescription="Tap Save on any post to keep it here for later."
      />
    </div>
  )
}

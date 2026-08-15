import { usePosts } from "../contexts/PostContexts"
import { Feed } from "../feed/Feed"
import { PageHeading } from "../PageHeading"


export function Found() {
  const { posts } = usePosts()
  const found = posts.filter((post) => post.kind === 'found' && post.status === 'open')

  return (
    <div className="space-y-4">
      <PageHeading
        title="Found items"
        description="Items waiting to be claimed. Message the finder with a detail only the owner would know."
      />
      <Feed
        posts={found}
        emptyTitle="Nothing waiting to be claimed"
        emptyDescription="Found items posted in your areas have all been handed back."
      />
    </div>
  )
}

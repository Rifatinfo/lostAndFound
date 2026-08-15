import { usePosts } from "../contexts/PostContexts"
import { ComposerTrigger } from "../feed/ComposerTrigger"
import { Feed } from "../feed/Feed"
import { UrgentStrip } from "../feed/UrgentStrip"


export function Home() {
  const { posts } = usePosts()
  const urgent = posts.filter((post) => post.kind === 'lost' && post.status === 'open').slice(0, 6)

  return (
    <div className="space-y-4">
      <ComposerTrigger />
      <UrgentStrip posts={urgent} />
      <Feed
        posts={posts}
        infinite
        emptyTitle="Nothing reported yet"
        emptyDescription="Be the first to post a lost or found item in your area."
      />
    </div>
  )
}

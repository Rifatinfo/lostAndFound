import { useEffect, useRef } from 'react'

interface Options {
  onReachEnd: () => void
  enabled: boolean
}

/** Calls onReachEnd when the returned sentinel element scrolls into view. */
export function useInfiniteScroll({ onReachEnd, enabled }: Options) {
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const node = sentinelRef.current
    if (!node || !enabled) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) onReachEnd()
      },
      { rootMargin: '600px 0px' },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [enabled, onReachEnd])

  return sentinelRef
}

"use client";
import  { useRef } from 'react'
import { CameraIcon, PlusIcon } from 'lucide-react'
import { usePosts } from '../contexts/PostContexts';
import { useProfile } from '../contexts/ProfileProvider';
import { useComposer } from '../contexts/ComposerProvider';


export function Profile() {
  const { posts } = usePosts()
  const { openComposer } = useComposer()
  const { profile, setAvatarUrl, setCoverUrl } = useProfile()

  const coverInputRef = useRef<HTMLInputElement | null>(null)
  const avatarInputRef = useRef<HTMLInputElement | null>(null)

  const mine = posts.filter((post) => post.isMine)
  const reunited = mine.filter((post) => post.status === 'reunited').length
  const helpful = mine.reduce((total, post) => total + post.helpfulCount, 0)

  const readImage = (file: File | undefined, apply: (url: string) => void) => {
    if (!file || !file.type.startsWith('image/')) return
    apply(URL.createObjectURL(file))
  }

  return (
    <div className="space-y-4">
      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="relative">
          <img
            src={profile.coverUrl}
            alt="Your cover photo"
            className="h-[200px] w-full bg-slate-200 object-cover sm:h-[240px]"
          />
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(event) => readImage(event.target.files?.[0], setCoverUrl)}
          />
          <button
            type="button"
            onClick={() => coverInputRef.current?.click()}
            className="absolute bottom-3 right-3 inline-flex items-center gap-2 rounded-lg bg-white/95 px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm transition-colors duration-150 ease-out hover:bg-white"
          >
            <CameraIcon className="h-4 w-4" />
            Edit cover photo
          </button>
        </div>

        <div className="px-4 pb-4">
          <div className="-mt-[60px] flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <div className="relative">
                <Avatar author={currentUser} size="xl" className="ring-4 ring-white" />
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(event) => readImage(event.target.files?.[0], setAvatarUrl)}
                />
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="absolute bottom-2 right-1 grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-slate-800 ring-2 ring-white transition-colors duration-150 ease-out hover:bg-slate-200"
                  aria-label="Edit profile photo"
                >
                  <CameraIcon className="h-4 w-4" />
                </button>
              </div>

              <div className="pb-2">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">{profile.name}</h1>
                <p className="text-sm text-slate-600">{profile.bio}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => openComposer('lost')}
              className="inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-teal-600 px-3 text-sm font-semibold text-white transition-colors duration-150 ease-out hover:bg-teal-700 sm:mb-2"
            >
              <PlusIcon className="h-4 w-4" />
              New report
            </button>
          </div>

          <dl className="mt-4 flex gap-8 border-t border-slate-200 pt-3">
            <div>
              <dt className="text-xs text-slate-500">Reports</dt>
              <dd className="text-lg font-semibold text-slate-900">{mine.length}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Reunited</dt>
              <dd className="text-lg font-semibold text-slate-900">{reunited}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Helpful votes</dt>
              <dd className="text-lg font-semibold text-slate-900">{helpful}</dd>
            </div>
          </dl>
        </div>
      </section>

      <ComposerTrigger />

      <h2 className="px-1 pt-1 text-[17px] font-semibold text-slate-900">Your posts</h2>

      <Feed
        posts={mine}
        emptyTitle="You have not posted yet"
        emptyDescription="Report something you lost or found and it will show up here."
      />
    </div>
  )
}

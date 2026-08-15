"use client";

import React, { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ImagePlusIcon, MapPinIcon, XIcon } from 'lucide-react'
import { useComposer } from '../contexts/ComposerProvider';
import { usePosts } from '../contexts/PostContexts';
import { Avatar } from '../Avatar';
import { categories } from '../data/categoru';
import { locations } from '../data/constants';
import { PostKind } from '@/types/post';
import { useCurrentUser } from '../../providers/SessionProvider';


export function CreatePostModal() {
  const { isOpen, initialKind, editingPost, closeComposer } = useComposer()
  const { addPost, updatePost } = usePosts()
  const currentUser = useCurrentUser()

  const [kind, setKind] = useState<PostKind>(initialKind)
  const [itemName, setItemName] = useState('')
  const [category, setCategory] = useState<string>(categories[0])
  const [location, setLocation] = useState('')
  const [body, setBody] = useState('')
  const [reward, setReward] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | undefined>(undefined)
  const [imageName, setImageName] = useState('')
  const [removeImage, setRemoveImage] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [touched, setTouched] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const pickFile = (file: File | undefined) => {
    if (!file || !file.type.startsWith('image/')) return
    if (imagePreview?.startsWith('blob:')) URL.revokeObjectURL(imagePreview)
    setImagePreview(URL.createObjectURL(file))
    setImageFile(file)
    setImageName(file.name)
    setRemoveImage(false)
  }

  const clearImage = () => {
    if (imagePreview?.startsWith('blob:')) URL.revokeObjectURL(imagePreview)
    setImagePreview(undefined)
    setImageFile(null)
    setImageName('')
    if (editingPost?.image) setRemoveImage(true)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  useEffect(() => {
    if (isOpen) {
      setKind(editingPost?.kind ?? initialKind)
      setItemName(editingPost?.itemName ?? '')
      setCategory(editingPost?.category ?? categories[0])
      setLocation(editingPost?.location ?? '')
      setBody(editingPost?.body ?? '')
      setReward(editingPost?.reward ?? '')
      setImagePreview(editingPost?.image)
      setImageFile(null)
      setImageName('')
      setRemoveImage(false)
      setTouched(false)
      setSubmitting(false)
      setError(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }, [editingPost, initialKind, isOpen])

  useEffect(() => {
    if (!isOpen) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeComposer()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [closeComposer, isOpen])

  const missing = !itemName.trim() || !body.trim() || !location.trim()

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setTouched(true)
    if (missing || submitting) return
    setSubmitting(true)
    setError(null)
    try {
      if (editingPost) {
        await updatePost(editingPost.id, {
          itemName: itemName.trim(),
          category,
          location: location.trim(),
          body: body.trim(),
          imageFile: imageFile ?? undefined,
          removeImage,
          reward: reward.trim() ? reward.trim() : undefined,
        })
      } else {
        await addPost({
          kind,
          itemName: itemName.trim(),
          category,
          location: location.trim(),
          body: body.trim(),
          imageFile: imageFile ?? undefined,
          reward: reward.trim() ? reward.trim() : undefined,
        })
      }
      closeComposer()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not post. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:items-center">
          <motion.div
            className="fixed inset-0 bg-slate-900/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            onClick={closeComposer}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-post-title"
            className="relative w-full max-w-[560px] rounded-xl bg-white shadow-2xl"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
          >
            <header className="relative border-b border-slate-200 px-4 py-3">
              <h2 id="create-post-title" className="text-center text-lg font-bold text-slate-900">
                {editingPost ? 'Edit post' : 'Create post'}
              </h2>
              <button
                type="button"
                onClick={closeComposer}
                className="absolute right-3 top-2.5 grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-slate-700 transition-colors hover:bg-slate-200"
                aria-label="Close"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </header>

            <form onSubmit={submit} className="max-h-[75vh] overflow-y-auto px-4 py-3">
              <div className="flex items-center gap-3">
                <Avatar author={currentUser} size="lg" />
                <div>
                  <p className="text-[15px] font-semibold text-slate-900">{currentUser.name}</p>
                  <p className="text-xs text-slate-500">Visible to everyone in your areas</p>
                </div>
              </div>

              <div
                role="radiogroup"
                aria-label="Post type"
                className="mt-3 grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1"
              >
                {(['lost', 'found'] as PostKind[]).map((option) => (
                  <button
                    key={option}
                    type="button"
                    role="radio"
                    aria-checked={kind === option}
                    disabled={Boolean(editingPost)}
                    onClick={() => setKind(option)}
                    className={`rounded-md py-2 text-sm font-semibold transition-colors duration-150 ease-out ${
                      kind === option
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    } ${editingPost ? 'cursor-not-allowed opacity-60' : ''}`}
                  >
                    {option === 'lost' ? 'I lost something' : 'I found something'}
                  </button>
                ))}
              </div>

              <label className="mt-3 block">
                <span className="text-sm font-medium text-slate-700">Item</span>
                <input
                  autoFocus
                  value={itemName}
                  onChange={(event) => setItemName(event.target.value)}
                  placeholder={kind === 'lost' ? 'Black leather wallet' : 'Set of keys with blue tag'}
                  className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3 text-[15px] text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </label>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Category</span>
                  <select
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                    className="mt-1 h-10 w-full rounded-lg border border-slate-300 bg-white px-2 text-[15px] text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  >
                    {categories.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Where</span>
                  <span className="relative mt-1 flex items-center">
                    <MapPinIcon className="pointer-events-none absolute left-3 h-4 w-4 text-slate-400" />
                    <input
                      list="composer-locations"
                      value={location}
                      onChange={(event) => setLocation(event.target.value)}
                      placeholder="Area or landmark"
                      className="h-10 w-full rounded-lg border border-slate-300 pl-9 pr-3 text-[15px] text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                  </span>
                  <datalist id="composer-locations">
                    {locations.map((option) => (
                      <option key={option} value={option} />
                    ))}
                  </datalist>
                </label>
              </div>

              <label className="mt-3 block">
                <span className="text-sm font-medium text-slate-700">Details</span>
                <textarea
                  value={body}
                  onChange={(event) => setBody(event.target.value)}
                  rows={4}
                  placeholder={
                    kind === 'lost'
                      ? 'When and where did you last have it? Any detail that proves it is yours?'
                      : 'Where exactly did you find it, and how should the owner reach you?'
                  }
                  className="mt-1 w-full resize-none rounded-lg border border-slate-300 p-3 text-[15px] leading-relaxed text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </label>

              {kind === 'lost' && (
                <label className="mt-3 block">
                  <span className="text-sm font-medium text-slate-700">Reward (optional)</span>
                  <input
                    value={reward}
                    onChange={(event) => setReward(event.target.value)}
                    placeholder="৳2,000 reward"
                    className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3 text-[15px] text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </label>
              )}

              <div className="mt-4">
                <span className="text-sm font-medium text-slate-700">Photo</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(event) => pickFile(event.target.files?.[0])}
                />

                {imagePreview ? (
                  <div className="relative mt-2 overflow-hidden rounded-lg border border-slate-200">
                    <img src={imagePreview} alt="Uploaded preview" className="max-h-64 w-full object-cover" />
                    <div className="flex items-center justify-between gap-2 bg-slate-50 px-3 py-2">
                      <span className="truncate text-xs text-slate-600">{imageName}</span>
                      <div className="flex shrink-0 gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="rounded-md bg-white px-2 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-300 transition-colors duration-150 ease-out hover:bg-slate-100"
                        >
                          Replace
                        </button>
                        <button
                          type="button"
                          onClick={clearImage}
                          className="rounded-md bg-white px-2 py-1 text-xs font-semibold text-rose-700 ring-1 ring-rose-200 transition-colors duration-150 ease-out hover:bg-rose-50"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => {
                      event.preventDefault()
                      pickFile(event.dataTransfer.files?.[0])
                    }}
                    className="mt-2 flex w-full flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center transition-colors duration-150 ease-out hover:border-teal-500 hover:bg-teal-50/40"
                  >
                    <ImagePlusIcon className="h-6 w-6 text-slate-500" />
                    <span className="text-sm font-semibold text-slate-800">Upload a photo</span>
                    <span className="text-xs text-slate-500">
                      Drag and drop, or click to choose from your device
                    </span>
                  </button>
                )}
              </div>

              {touched && missing && (
                <p role="alert" className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  Add the item, where it happened, and a short description before posting.
                </p>
              )}

              {error && (
                <p role="alert" className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="mt-4 h-11 w-full rounded-lg bg-teal-600 text-[15px] font-semibold text-white transition-colors duration-150 ease-out hover:bg-teal-700 disabled:bg-teal-600/60"
              >
                {submitting ? (editingPost ? 'Saving…' : 'Posting…') : editingPost ? 'Save changes' : 'Post'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

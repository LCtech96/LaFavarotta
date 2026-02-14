'use client'

import { useState, useEffect } from 'react'
import { Calendar } from 'lucide-react'
import { base64ToBlobUrl, isAndroid } from '@/lib/utils'

interface Post {
  id: string
  imageUrl: string
  description: string
  title?: string
  createdAt: string
}

export function PostDelGiorno() {
  const [mounted, setMounted] = useState(false)
  const [post, setPost] = useState<Post | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    const load = async () => {
      try {
        const res = await fetch(`/api/posts?_=${Date.now()}`, { cache: 'no-store' })
        if (!res.ok) return
        const data = await res.json()
        const list = data.posts
        if (Array.isArray(list) && list.length > 0) {
          const p = list[0] as Post
          let imageUrl = p.imageUrl
          if (isAndroid() && imageUrl?.startsWith('data:image')) {
            const blob = base64ToBlobUrl(imageUrl)
            if (blob) imageUrl = blob
          }
          setPost({ ...p, imageUrl: imageUrl || p.imageUrl })
        }
      } catch {
        const saved = typeof window !== 'undefined' ? localStorage.getItem('posts') : null
        if (saved) {
          try {
            const parsed = JSON.parse(saved)
            if (Array.isArray(parsed) && parsed.length > 0) {
              setPost(parsed[0] as Post)
            }
          } catch {}
        }
      }
    }
    load()
    const onUpdate = () => load()
    window.addEventListener('postsUpdated', onUpdate)
    return () => window.removeEventListener('postsUpdated', onUpdate)
  }, [mounted])

  if (!mounted || !post) return null

  const dateLabel = new Date(post.createdAt).toLocaleDateString('it-IT', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <section className="container mx-auto px-4 py-6">
      <div className="max-w-2xl mx-auto">
        <a
          href={`/post/${post.id}`}
          className="block bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
        >
          <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700">
            <Calendar size={20} className="text-orange-500 flex-shrink-0" />
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white">
                Post del giorno
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400" suppressHydrationWarning>
                {dateLabel}
              </p>
            </div>
          </div>
          <div className="relative w-full aspect-square bg-gray-200 dark:bg-gray-700">
            <img
              src={post.imageUrl}
              alt={post.title || 'Post del giorno'}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-4 space-y-1">
            {post.title && (
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {post.title}
              </h3>
            )}
            <p className="text-gray-700 dark:text-gray-300 line-clamp-2">
              {post.description}
            </p>
            <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
              Apri post →
            </span>
          </div>
        </a>
      </div>
    </section>
  )
}

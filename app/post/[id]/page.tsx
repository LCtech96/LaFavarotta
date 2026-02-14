'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar } from 'lucide-react'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { base64ToBlobUrl, isAndroid } from '@/lib/utils'

type Post = {
  id: string
  imageUrl: string
  description: string
  title?: string
  createdAt: string
}

export default function PostPage() {
  const params = useParams()
  const id = typeof params.id === 'string' ? params.id : null
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) {
      setLoading(false)
      return
    }
    const load = async () => {
      try {
        const res = await fetch('/api/posts', { cache: 'no-store' })
        if (!res.ok) {
          setLoading(false)
          return
        }
        const data = await res.json()
        const list = data.posts || []
        const p = list.find((x: Post) => x.id === id)
        if (p) {
          let imageUrl = p.imageUrl
          if (isAndroid() && imageUrl?.startsWith('data:image')) {
            const blob = base64ToBlobUrl(imageUrl)
            if (blob) imageUrl = blob
          }
          setPost({ ...p, imageUrl: imageUrl || p.imageUrl })
        }
      } catch {
        const saved = localStorage.getItem('posts')
        if (saved) {
          try {
            const parsed = JSON.parse(saved)
            const p = parsed.find((x: Post) => x.id === id)
            if (p) setPost(p)
          } catch {}
        }
      }
      setLoading(false)
    }
    load()
  }, [id])

  useEffect(() => {
    if (post?.title) document.title = `${post.title} | Mancia e statti zitto da Sasà`
    else if (post) document.title = 'Post del giorno | Mancia e statti zitto da Sasà'
    return () => { document.title = 'Mancia e statti zitto da Sasà' }
  }, [post])

  if (!id) {
    return (
      <main className="min-h-screen">
        <Navigation />
        <div className="pt-16 md:pt-20 pb-20 md:pb-8 container mx-auto px-4 py-8 text-center">
          <p className="text-gray-500">Post non trovato.</p>
          <Link href="/" className="text-blue-600 dark:text-blue-400 mt-4 inline-block">
            Torna alla home
          </Link>
        </div>
        <Footer />
      </main>
    )
  }

  if (loading) {
    return (
      <main className="min-h-screen">
        <Navigation />
        <div className="pt-16 md:pt-20 pb-20 md:pb-8 flex items-center justify-center min-h-[40vh]">
          <p className="text-gray-500">Caricamento...</p>
        </div>
        <Footer />
      </main>
    )
  }

  if (!post) {
    return (
      <main className="min-h-screen">
        <Navigation />
        <div className="pt-16 md:pt-20 pb-20 md:pb-8 container mx-auto px-4 py-8 text-center">
          <p className="text-gray-500">Post non trovato.</p>
          <Link href="/" className="text-blue-600 dark:text-blue-400 mt-4 inline-block">
            Torna alla home
          </Link>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen">
      <Navigation />
      <div className="pt-16 md:pt-20 pb-20 md:pb-8">
        <div className="container mx-auto px-4 py-6 max-w-2xl">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6"
          >
            <ArrowLeft size={20} />
            Torna alla home
          </Link>

          <article className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700">
              <Calendar size={20} className="text-orange-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Post del giorno
                </p>
                <time className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(post.createdAt).toLocaleDateString('it-IT', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </time>
              </div>
            </div>

            <div className="relative w-full aspect-square bg-gray-200 dark:bg-gray-700">
              <img
                src={post.imageUrl}
                alt={post.title || 'Post'}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-6 space-y-3">
              {post.title && (
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {post.title}
                </h1>
              )}
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                {post.description}
              </p>
            </div>
          </article>
        </div>
      </div>
      <Footer />
    </main>
  )
}

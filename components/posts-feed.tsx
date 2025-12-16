'use client'

import { useState, useEffect, useRef } from 'react'
import { Calendar } from 'lucide-react'
import Image from 'next/image'
import { base64ToBlobUrl, isAndroid } from '@/lib/utils'

interface Post {
  id: string
  imageUrl: string
  description: string
  title?: string
  createdAt: string
}

export function PostsFeed() {
  const [posts, setPosts] = useState<Post[]>([])
  const [profileImage, setProfileImage] = useState<string>('/profile-image.png')
  const blobUrlsRef = useRef<Map<string, string>>(new Map())

  useEffect(() => {
    // Load profile image
    const loadProfileImage = () => {
      const savedProfile = localStorage.getItem('profile_image')
      if (savedProfile) {
        // Per Android, converti in blob URL
        if (isAndroid() && savedProfile.startsWith('data:image')) {
          const blobUrl = base64ToBlobUrl(savedProfile)
          if (blobUrl) {
            setProfileImage(blobUrl)
          } else {
            setProfileImage(savedProfile)
          }
        } else {
          setProfileImage(savedProfile)
        }
      } else {
        setProfileImage('/profile-image.png')
      }
    }

    loadProfileImage()

    const loadPosts = () => {
      const savedPosts = localStorage.getItem('posts')
      if (savedPosts) {
        try {
          const parsed = JSON.parse(savedPosts)
          // Per Android, converti le immagini base64 in blob URL
          const processedPosts = parsed.map((post: Post) => {
            if (isAndroid() && post.imageUrl && post.imageUrl.startsWith('data:image')) {
              // Controlla se abbiamo già un blob URL per questo post
              if (!blobUrlsRef.current.has(post.id)) {
                const blobUrl = base64ToBlobUrl(post.imageUrl)
                if (blobUrl) {
                  blobUrlsRef.current.set(post.id, blobUrl)
                  return { ...post, imageUrl: blobUrl }
                }
              } else {
                return { ...post, imageUrl: blobUrlsRef.current.get(post.id)! }
              }
            }
            return post
          })
          
          // Ordina per data (più recenti prima)
          const sorted = processedPosts.sort((a: Post, b: Post) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          setPosts(sorted)
        } catch (e) {
          console.error('Error loading posts:', e)
        }
      }
    }

    loadPosts()

    // Listen for storage changes
    const handleStorageChange = () => {
      loadPosts()
      loadProfileImage()
    }

    // Listen for custom posts update events
    const handlePostsUpdate = (e: Event) => {
      const customEvent = e as CustomEvent
      if (customEvent.detail?.posts) {
        // Processa i post per Android
        const processedPosts = customEvent.detail.posts.map((post: Post) => {
          if (isAndroid() && post.imageUrl && post.imageUrl.startsWith('data:image')) {
            if (!blobUrlsRef.current.has(post.id)) {
              const blobUrl = base64ToBlobUrl(post.imageUrl)
              if (blobUrl) {
                blobUrlsRef.current.set(post.id, blobUrl)
                return { ...post, imageUrl: blobUrl }
              }
            } else {
              return { ...post, imageUrl: blobUrlsRef.current.get(post.id)! }
            }
          }
          return post
        })
        const sorted = processedPosts.sort((a: Post, b: Post) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        setPosts(sorted)
      } else {
        loadPosts()
      }
      loadProfileImage()
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('focus', handleStorageChange)
    window.addEventListener('postsUpdated', handlePostsUpdate as EventListener)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('focus', handleStorageChange)
      window.removeEventListener('postsUpdated', handlePostsUpdate as EventListener)
      // Pulisci tutti i blob URL quando il componente viene smontato
      blobUrlsRef.current.forEach((url) => {
        URL.revokeObjectURL(url)
      })
      blobUrlsRef.current.clear()
    }
  }, [])

  if (posts.length === 0) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="max-w-2xl mx-auto space-y-6">
        {posts.map((post) => (
          <article
            key={post.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
          >
            {/* Post Header */}
            <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-700 flex-shrink-0">
                {profileImage.startsWith('data:') ? (
                  <img
                    src={profileImage}
                    alt="La Favarotta"
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                    crossOrigin="anonymous"
                    onError={(e) => {
                      console.error('Error loading profile image')
                      e.currentTarget.src = '/profile-image.png'
                    }}
                    style={{ 
                      display: 'block',
                      width: '100%',
                      height: '100%'
                    }}
                  />
                ) : (
                  <Image
                    src={profileImage}
                    alt="La Favarotta"
                    fill
                    className="object-cover"
                  />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  La Favarotta
                </h3>
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                  <Calendar size={12} />
                  <span>
                    {new Date(post.createdAt).toLocaleDateString('it-IT', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Post Image */}
            <div className="relative w-full aspect-square bg-gray-200 dark:bg-gray-700 overflow-hidden">
              <img
                src={post.imageUrl}
                alt={post.title || 'Post'}
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
                onError={(e) => {
                  console.error('Error loading post image', post.id)
                  // Su Android, prova a ricaricare da localStorage come base64
                  if (isAndroid()) {
                    try {
                      const savedPosts = localStorage.getItem('posts')
                      if (savedPosts) {
                        const parsed = JSON.parse(savedPosts)
                        const originalPost = parsed.find((p: Post) => p.id === post.id)
                        if (originalPost && originalPost.imageUrl && originalPost.imageUrl.startsWith('data:image')) {
                          e.currentTarget.src = originalPost.imageUrl
                        } else {
                          e.currentTarget.style.display = 'none'
                        }
                      } else {
                        e.currentTarget.style.display = 'none'
                      }
                    } catch (err) {
                      console.error('Error in error handler:', err)
                      e.currentTarget.style.display = 'none'
                    }
                  } else {
                    e.currentTarget.style.display = 'none'
                  }
                }}
                onLoad={() => {
                  // Immagine caricata con successo
                }}
                style={{ 
                  display: 'block',
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            </div>

            {/* Post Content */}
            <div className="p-4 space-y-2">
              {post.title && (
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {post.title}
                </h4>
              )}
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                {post.description}
              </p>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}


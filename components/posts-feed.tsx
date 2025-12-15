'use client'

import { useState, useEffect } from 'react'
import { Calendar } from 'lucide-react'
import Image from 'next/image'
import { optimizeBase64Image } from '@/lib/utils'

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

  useEffect(() => {
    // Load profile image
    const loadProfileImage = () => {
      const savedProfile = localStorage.getItem('profile_image')
      if (savedProfile && savedProfile.length > 100) {
        const optimized = optimizeBase64Image(savedProfile)
        if (optimized && optimized.length > 100) {
          setProfileImage(optimized)
        } else {
          setProfileImage('/profile-image.png')
        }
      } else {
        setProfileImage('/profile-image.png')
      }
    }

    loadProfileImage()

    const loadPosts = () => {
      try {
        const savedPosts = localStorage.getItem('posts')
        if (savedPosts) {
          const parsed = JSON.parse(savedPosts)
          console.log('Posts trovati in localStorage:', parsed.length)
          
          // Processa tutti i post, anche se l'immagine sembra piccola
          const processedPosts = parsed
            .filter((post: Post) => post && post.id && post.description)
            .map((post: Post) => {
              let imageUrl = post.imageUrl || ''
              
              // Ottimizza solo se è base64
              if (imageUrl.startsWith('data:') && imageUrl.length > 50) {
                imageUrl = optimizeBase64Image(imageUrl)
              }
              
              return {
                ...post,
                imageUrl: imageUrl || post.imageUrl
              }
            })
          
          console.log('Posts processati:', processedPosts.length)
          console.log('Esempio post:', processedPosts[0] ? {
            id: processedPosts[0].id,
            hasImage: !!processedPosts[0].imageUrl,
            imageLength: processedPosts[0].imageUrl?.length || 0
          } : 'nessun post')
          
          // Ordina per data (più recenti prima)
          const sorted = processedPosts.sort((a: Post, b: Post) => 
            new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
          )
          
          setPosts(sorted)
          console.log('Posts impostati nello state:', sorted.length)
        } else {
          console.log('Nessun post trovato in localStorage')
          setPosts([])
        }
      } catch (e) {
        console.error('Error loading posts:', e)
        setPosts([])
      }
    }

    loadPosts()

    // Listen for storage changes
    const handleStorageChange = () => {
      loadPosts()
      loadProfileImage()
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('focus', handleStorageChange)
    
    // Forza il refresh ogni 2 secondi per Android (workaround per problemi localStorage)
    const refreshInterval = setInterval(() => {
      loadPosts()
      loadProfileImage()
    }, 2000)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('focus', handleStorageChange)
      clearInterval(refreshInterval)
    }
  }, [])

  // Mostra sempre il componente se ci sono post o per debug
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
            {post.imageUrl && (
              <div className="relative w-full aspect-square bg-gray-200 dark:bg-gray-700 overflow-hidden">
                <img
                  src={post.imageUrl}
                  alt={post.title || 'Post'}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                  crossOrigin="anonymous"
                  onError={(e) => {
                    console.error('Error loading post image', post.id, 'URL length:', post.imageUrl?.length || 0)
                    console.error('First 100 chars:', post.imageUrl?.substring(0, 100))
                    // Prova a ottimizzare e ricaricare
                    try {
                      const optimized = optimizeBase64Image(post.imageUrl)
                      if (optimized && optimized !== post.imageUrl && optimized.length > 50) {
                        console.log('Retrying with optimized image')
                        e.currentTarget.src = optimized
                      } else {
                        console.error('Cannot optimize image, hiding')
                        e.currentTarget.style.display = 'none'
                      }
                    } catch (err) {
                      console.error('Error optimizing image:', err)
                      e.currentTarget.style.display = 'none'
                    }
                  }}
                  onLoad={() => {
                    console.log('Post image loaded successfully', post.id)
                  }}
                  style={{ 
                    display: 'block',
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    minHeight: '300px'
                  }}
                />
              </div>
            )}

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


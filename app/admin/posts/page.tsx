'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, X, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { ImageCropper } from '@/components/image-cropper'
import { compressBase64ForUpload } from '@/lib/utils'

interface Post {
  id: string
  imageUrl: string
  description: string
  title?: string
  createdAt: string
}

export default function AdminPosts() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [posts, setPosts] = useState<Post[]>([])
  const [showForm, setShowForm] = useState(false)
  const [croppingImage, setCroppingImage] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  })
  const router = useRouter()

  useEffect(() => {
    const auth = sessionStorage.getItem('adminAuth')
    if (auth !== 'true') {
      router.push('/admin/login')
    } else {
      setIsAuthenticated(true)
      loadPosts()
    }
  }, [router])

  const loadPosts = async () => {
    try {
      // Prima prova a caricare dal database
      const response = await fetch('/api/posts')
      if (response.ok) {
        const data = await response.json()
        if (data.posts && data.posts.length > 0) {
          setPosts(data.posts)
          // Salva anche in localStorage come cache
          localStorage.setItem('posts', JSON.stringify(data.posts))
          return
        }
      }
    } catch (error) {
      console.error('Error loading posts from database:', error)
    }

    // Fallback a localStorage
    const savedPosts = localStorage.getItem('posts')
    if (savedPosts) {
      try {
        setPosts(JSON.parse(savedPosts))
      } catch (e) {
        console.error('Error loading posts:', e)
      }
    }
  }

  const handleFileSelect = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const imageDataUrl = e.target?.result as string
      setCroppingImage(imageDataUrl)
    }
    reader.readAsDataURL(file)
  }

  const handleCropComplete = async (croppedImage: string) => {
    try {
      // Comprimi per restare sotto il limite Vercel (4.5MB), utile su iPhone/foto grandi
      const optimized = await compressBase64ForUpload(croppedImage)

      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: optimized,
          description: formData.description,
          title: formData.title || undefined,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Errore nel salvataggio del post')
      }

      const data = await response.json()
      const newPost = data.post

      const updatedPosts = [newPost, ...posts]
      setPosts(updatedPosts)
      localStorage.setItem('posts', JSON.stringify(updatedPosts))
      
      // Trigger events per aggiornare il sito in tempo reale
      window.dispatchEvent(new Event('storage'))
      window.dispatchEvent(new CustomEvent('postsUpdated', { 
        detail: { posts: updatedPosts } 
      }))

      // Reset form
      setFormData({ title: '', description: '' })
      setCroppingImage(null)
      setShowForm(false)
      
      alert('Post creato con successo! Il post è ora visibile sulla homepage.')
      } catch (error) {
        console.error('Error saving post:', error)
        const errorMessage = error instanceof Error ? error.message : 'Errore nel salvataggio del post. Riprova più tardi.'
        alert(errorMessage)
      }
  }

  const handleCancelCrop = () => {
    setCroppingImage(null)
  }

  const handleDelete = async (postId: string) => {
    if (confirm('Sei sicuro di voler eliminare questo post?')) {
      try {
        // Elimina dal database
        const response = await fetch(`/api/posts?id=${encodeURIComponent(postId)}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
        })

        const data = await response.json().catch(() => ({}))
        if (!response.ok) {
          const msg = data.details || data.error || 'Errore nell\'eliminazione del post'
          throw new Error(msg)
        }

        const updatedPosts = posts.filter(p => p.id !== postId)
        setPosts(updatedPosts)
        localStorage.setItem('posts', JSON.stringify(updatedPosts))
        
        // Trigger events per aggiornare il sito in tempo reale
        window.dispatchEvent(new Event('storage'))
        window.dispatchEvent(new CustomEvent('postsUpdated', { 
          detail: { posts: updatedPosts } 
        }))

        alert('Post eliminato.')
      } catch (error) {
        console.error('Error deleting post:', error)
        const errorMessage = error instanceof Error ? error.message : 'Errore nell\'eliminazione del post. Riprova più tardi.'
        alert(errorMessage)
      }
    }
  }

  const handleInitDatabase = async () => {
    try {
      if (!confirm('Vuoi inizializzare il database? Questo creerà le tabelle mancanti.')) {
        return
      }

      const response = await fetch('/api/db/init', {
        method: 'POST',
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Errore sconosciuto' }))
        throw new Error(errorData.error || 'Errore nell\'inizializzazione del database')
      }

      const result = await response.json()
      alert(`Database inizializzato! ${result.results.join(', ')}`)
      
      // Ricarica i post dopo l'inizializzazione
      await loadPosts()
    } catch (error) {
      console.error('Error initializing database:', error)
      const errorMessage = error instanceof Error ? error.message : 'Errore nell\'inizializzazione del database. Riprova più tardi.'
      alert(errorMessage)
    }
  }

  const handleMigratePosts = async () => {
    try {
      // Carica i post da localStorage
      const savedPosts = localStorage.getItem('posts')
      if (!savedPosts) {
        alert('Nessun post trovato in localStorage da migrare.')
        return
      }

      const postsToMigrate = JSON.parse(savedPosts)
      if (!Array.isArray(postsToMigrate) || postsToMigrate.length === 0) {
        alert('Nessun post valido trovato in localStorage.')
        return
      }

      if (!confirm(`Vuoi migrare ${postsToMigrate.length} post da localStorage al database?`)) {
        return
      }

      // Migra i post
      const response = await fetch('/api/posts/migrate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ posts: postsToMigrate }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Errore sconosciuto' }))
        throw new Error(errorData.error || 'Errore nella migrazione dei post')
      }

      const result = await response.json()
      
      // Ricarica i post dal database
      await loadPosts()
      
      alert(`Migrazione completata! ${result.migrated} post migrati con successo su ${result.total} totali.`)
    } catch (error) {
      console.error('Error migrating posts:', error)
      const errorMessage = error instanceof Error ? error.message : 'Errore nella migrazione dei post. Riprova più tardi.'
      alert(errorMessage)
    }
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6"
        >
          <ArrowLeft size={20} />
          Torna al pannello
        </Link>

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Post del Giorno
          </h1>
          <div className="flex gap-2">
            <button
              onClick={handleInitDatabase}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              title="Inizializza il database (crea le tabelle mancanti)"
            >
              Init DB
            </button>
            <button
              onClick={handleMigratePosts}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              title="Migra i post da localStorage al database"
            >
              Migra Post
            </button>
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
              Nuovo Post
            </button>
          </div>
        </div>

        {/* Create Post Form */}
        {showForm && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Crea Nuovo Post
              </h2>
              <button
                onClick={() => {
                  setShowForm(false)
                  setFormData({ title: '', description: '' })
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Titolo (opzionale)
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Es: Piatto del Giorno"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Descrizione *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descrivi il piatto del giorno..."
                  rows={4}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-y"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Immagine del Piatto *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      handleFileSelect(file)
                    }
                  }}
                  className="hidden"
                  id="post-image"
                  required
                />
                <label
                  htmlFor="post-image"
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  <Plus size={16} />
                  Seleziona e ritaglia immagine
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Posts List */}
        <div className="space-y-4">
          {posts.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-600 dark:text-gray-400">
                Nessun post ancora. Crea il tuo primo post del giorno!
              </p>
            </div>
          ) : (
            posts.map((post) => (
              <div
                key={post.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
              >
                <div className="relative">
                  <img
                    src={post.imageUrl}
                    alt={post.title || 'Post'}
                    className="w-full h-64 object-cover"
                    loading="lazy"
                    decoding="async"
                    crossOrigin="anonymous"
                    onError={(e) => {
                      console.error('Error loading post image', post.id)
                      e.currentTarget.style.display = 'none'
                    }}
                    style={{ 
                      display: 'block',
                      maxWidth: '100%',
                      height: 'auto'
                    }}
                  />
                </div>
                <div className="p-4">
                  {post.title && (
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {post.title}
                    </h3>
                  )}
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {post.description}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {new Date(post.createdAt).toLocaleDateString('it-IT', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <button
                      type="button"
                      onClick={() => handleDelete(post.id)}
                      className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <Trash2 size={16} />
                      Elimina post
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {croppingImage && (
        <ImageCropper
          image={croppingImage}
          onCropComplete={handleCropComplete}
          onCancel={handleCancelCrop}
          aspectRatio={1}
        />
      )}
    </div>
  )
}

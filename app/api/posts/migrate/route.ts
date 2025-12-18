import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// POST - Migra i post da localStorage al database
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { posts } = body

    if (!posts || !Array.isArray(posts)) {
      return NextResponse.json(
        { error: 'Array di post non valido' },
        { status: 400 }
      )
    }

    if (!prisma) {
      return NextResponse.json(
        { error: 'Database non disponibile' },
        { status: 500 }
      )
    }

    const migratedPosts = []
    const errors = []

    for (const post of posts) {
      try {
        // Verifica se il post esiste già (controlla per imageUrl e description)
        const existingPost = await prisma.post.findFirst({
          where: {
            imageUrl: post.imageUrl,
            description: post.description
          }
        })

        if (existingPost) {
          // Post già esistente, salta
          continue
        }

        // Crea il post nel database
        const createdPost = await prisma.post.create({
          data: {
            imageUrl: post.imageUrl,
            description: post.description,
            title: post.title || null,
            createdAt: post.createdAt ? new Date(post.createdAt) : new Date()
          },
          select: {
            id: true,
            imageUrl: true,
            description: true,
            title: true,
            createdAt: true
          }
        })

        migratedPosts.push({
          id: createdPost.id.toString(),
          imageUrl: createdPost.imageUrl,
          description: createdPost.description,
          title: createdPost.title || undefined,
          createdAt: createdPost.createdAt.toISOString()
        })
      } catch (error) {
        console.error('Error migrating post:', error)
        errors.push({
          post: post.id || 'unknown',
          error: error instanceof Error ? error.message : 'Errore sconosciuto'
        })
      }
    }

    return NextResponse.json({
      success: true,
      migrated: migratedPosts.length,
      total: posts.length,
      errors: errors.length > 0 ? errors : undefined
    })
  } catch (error) {
    console.error('Error in migration:', error)
    return NextResponse.json(
      { 
        error: 'Errore nella migrazione dei post',
        details: error instanceof Error ? error.message : 'Errore sconosciuto'
      },
      { status: 500 }
    )
  }
}





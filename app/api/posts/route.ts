import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET - Recupera tutti i post
export async function GET(request: NextRequest) {
  try {
    if (!prisma) {
      return NextResponse.json(
        { error: 'Database non disponibile' },
        { status: 500 }
      )
    }

    const posts = await prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        imageUrl: true,
        description: true,
        title: true,
        createdAt: true
      }
    })

    // Converti l'ID numerico in stringa per compatibilità con il frontend
    const formattedPosts = posts.map(post => ({
      id: post.id.toString(),
      imageUrl: post.imageUrl,
      description: post.description,
      title: post.title || undefined,
      createdAt: post.createdAt.toISOString()
    }))

    return NextResponse.json({ posts: formattedPosts })
  } catch (error) {
    console.error('Error fetching posts:', error)
    return NextResponse.json(
      { error: 'Errore nel recupero dei post' },
      { status: 500 }
    )
  }
}

// POST - Crea un nuovo post
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { imageUrl, description, title } = body

    if (!imageUrl || typeof imageUrl !== 'string') {
      return NextResponse.json(
        { error: 'URL immagine non valido' },
        { status: 400 }
      )
    }

    if (!description || typeof description !== 'string') {
      return NextResponse.json(
        { error: 'Descrizione non valida' },
        { status: 400 }
      )
    }

    if (!prisma) {
      return NextResponse.json(
        { error: 'Database non disponibile' },
        { status: 500 }
      )
    }

    const post = await prisma.post.create({
      data: {
        imageUrl,
        description,
        title: title || null
      },
      select: {
        id: true,
        imageUrl: true,
        description: true,
        title: true,
        createdAt: true
      }
    })

    // Converti l'ID numerico in stringa per compatibilità con il frontend
    const formattedPost = {
      id: post.id.toString(),
      imageUrl: post.imageUrl,
      description: post.description,
      title: post.title || undefined,
      createdAt: post.createdAt.toISOString()
    }

    return NextResponse.json({ 
      success: true,
      post: formattedPost
    })
  } catch (error) {
    console.error('Error creating post:', error)
    return NextResponse.json(
      { error: 'Errore nella creazione del post' },
      { status: 500 }
    )
  }
}

// DELETE - Elimina un post
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const postId = searchParams.get('id')

    if (!postId) {
      return NextResponse.json(
        { error: 'ID post non fornito' },
        { status: 400 }
      )
    }

    const id = parseInt(postId)
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID post non valido' },
        { status: 400 }
      )
    }

    if (!prisma) {
      return NextResponse.json(
        { error: 'Database non disponibile' },
        { status: 500 }
      )
    }

    await prisma.post.delete({
      where: { id }
    })

    return NextResponse.json({ 
      success: true
    })
  } catch (error) {
    console.error('Error deleting post:', error)
    return NextResponse.json(
      { error: 'Errore nell\'eliminazione del post' },
      { status: 500 }
    )
  }
}


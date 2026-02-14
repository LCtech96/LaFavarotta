import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET - Recupera tutti i post
export async function GET(request: NextRequest) {
  try {
    if (!prisma) {
      console.error('Prisma client non disponibile - DATABASE_URL:', process.env.DATABASE_URL ? 'presente' : 'mancante')
      return NextResponse.json(
        { error: 'Database non disponibile', details: 'Prisma client non inizializzato' },
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
    const formattedPosts = posts.map((post: { id: number; imageUrl: string; description: string; title: string | null; createdAt: Date }) => ({
      id: post.id.toString(),
      imageUrl: post.imageUrl,
      description: post.description,
      title: post.title || undefined,
      createdAt: post.createdAt.toISOString()
    }))

    return NextResponse.json({ posts: formattedPosts })
  } catch (error) {
    console.error('Error fetching posts:', error)
    const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto'
    const errorStack = error instanceof Error ? error.stack : undefined
    
    // Log dettagliato per debug
    if (error instanceof Error) {
      console.error('Error name:', error.name)
      console.error('Error message:', error.message)
      if (errorStack) {
        console.error('Error stack:', errorStack)
      }
    }
    
    return NextResponse.json(
      { 
        error: 'Errore nel recupero dei post',
        details: errorMessage,
        ...(process.env.NODE_ENV === 'development' && { stack: errorStack })
      },
      { status: 500 }
    )
  }
}

// POST - Crea un nuovo post
export async function POST(request: NextRequest) {
  try {
    if (!prisma) {
      console.error('Prisma client non disponibile per POST - DATABASE_URL:', process.env.DATABASE_URL ? 'presente' : 'mancante')
      return NextResponse.json(
        { error: 'Database non disponibile', details: 'Prisma client non inizializzato' },
        { status: 500 }
      )
    }

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
    const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto'
    const errorStack = error instanceof Error ? error.stack : undefined
    
    // Log dettagliato per debug
    if (error instanceof Error) {
      console.error('Error name:', error.name)
      console.error('Error message:', error.message)
      if (errorStack) {
        console.error('Error stack:', errorStack)
      }
    }
    
    return NextResponse.json(
      { 
        error: 'Errore nella creazione del post',
        details: errorMessage,
        ...(process.env.NODE_ENV === 'development' && { stack: errorStack })
      },
      { status: 500 }
    )
  }
}

// DELETE - Elimina un post
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const postId = searchParams.get('id')

    if (!postId || postId.trim() === '') {
      return NextResponse.json(
        { error: 'ID post non fornito' },
        { status: 400 }
      )
    }

    const id = parseInt(postId.trim(), 10)
    if (isNaN(id) || id < 1) {
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

    const result = await prisma.post.deleteMany({
      where: { id },
    })

    if (result.count === 0) {
      return NextResponse.json(
        { error: 'Post non trovato o già eliminato' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error('Error deleting post:', error)
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      {
        error: 'Errore nell\'eliminazione del post',
        details: message,
      },
      { status: 500 }
    )
  }
}



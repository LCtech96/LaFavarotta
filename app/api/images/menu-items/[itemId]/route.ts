import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET - Recupera l'immagine di un menu item
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> | { itemId: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params)
    const itemId = parseInt(resolvedParams.itemId)
    
    if (isNaN(itemId)) {
      return NextResponse.json(
        { error: 'ID menu item non valido' },
        { status: 400 }
      )
    }

    if (!prisma) {
      console.error('Prisma non inizializzato - DATABASE_URL:', process.env.DATABASE_URL ? 'presente' : 'mancante')
      // In produzione, evita di rompere la pagina se il DB non è disponibile
      return NextResponse.json({ imageUrl: null })
    }

    // Test connessione database
    try {
      await prisma.$queryRaw`SELECT 1`
    } catch (dbError) {
      console.error('Database connection error:', dbError)
      return NextResponse.json({ imageUrl: null })
    }

    // Prima prova a recuperare dal MenuItem
    const menuItem = await prisma.menuItem.findUnique({
      where: { id: itemId },
      select: { imageUrl: true }
    })

    if (menuItem?.imageUrl) {
      return NextResponse.json({ 
        imageUrl: menuItem.imageUrl 
      })
    }

    // Fallback: prova a recuperare dal Content
    const key = `menu_item_image_${itemId}`
    const content = await prisma.content.findUnique({
      where: { key },
      select: { value: true }
    })

    return NextResponse.json({ 
      imageUrl: content?.value || null 
    })
  } catch (error) {
    console.error('Error fetching menu item image:', error)
    const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto'
    const errorStack = error instanceof Error ? error.stack : undefined
    
    if (error instanceof Error) {
      console.error('Error name:', error.name)
      console.error('Error message:', error.message)
      if (errorStack) {
        console.error('Error stack:', errorStack)
      }
    }
    
    return NextResponse.json(
      { 
        error: 'Errore nel recupero dell\'immagine',
        details: errorMessage,
        ...(process.env.NODE_ENV === 'development' && { stack: errorStack })
      },
      { status: 500 }
    )
  }
}

// POST - Salva l'immagine di un menu item
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> | { itemId: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params)
    const itemId = parseInt(resolvedParams.itemId)
    
    if (isNaN(itemId)) {
      return NextResponse.json(
        { error: 'ID menu item non valido' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { imageUrl } = body

    if (!imageUrl || typeof imageUrl !== 'string') {
      return NextResponse.json(
        { error: 'URL immagine non valido' },
        { status: 400 }
      )
    }

    if (!prisma) {
      console.error('Prisma non inizializzato - DATABASE_URL:', process.env.DATABASE_URL ? 'presente' : 'mancante')
      return NextResponse.json(
        { error: 'Database non disponibile', details: 'Prisma client non inizializzato' },
        { status: 500 }
      )
    }

    // Test connessione database
    try {
      await prisma.$queryRaw`SELECT 1`
    } catch (dbError) {
      console.error('Database connection error:', dbError)
      return NextResponse.json(
        { error: 'Database non disponibile', details: 'Errore di connessione al database' },
        { status: 500 }
      )
    }

    // Verifica che il menu item esista
    const existingItem = await prisma.menuItem.findUnique({
      where: { id: itemId }
    })

    if (!existingItem) {
      // Se il menu item non esiste nel database, usa il modello Content come fallback
      const key = `menu_item_image_${itemId}`
      const content = await prisma.content.upsert({
        where: { key },
        update: { 
          value: imageUrl,
          type: 'image'
        },
        create: {
          key,
          value: imageUrl,
          type: 'image'
        },
        select: { key: true, value: true }
      })

      return NextResponse.json({ 
        success: true,
        imageUrl: content.value 
      })
    }

    // Aggiorna l'immagine
    const updatedItem = await prisma.menuItem.update({
      where: { id: itemId },
      data: { imageUrl },
      select: { id: true, imageUrl: true }
    })

    return NextResponse.json({ 
      success: true,
      imageUrl: updatedItem?.imageUrl 
    })
  } catch (error) {
    console.error('Error saving menu item image:', error)
    const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto'
    const errorStack = error instanceof Error ? error.stack : undefined
    
    if (error instanceof Error) {
      console.error('Error name:', error.name)
      console.error('Error message:', error.message)
      if (errorStack) {
        console.error('Error stack:', errorStack)
      }
    }
    
    return NextResponse.json(
      { 
        error: 'Errore nel salvataggio dell\'immagine',
        details: errorMessage,
        ...(process.env.NODE_ENV === 'development' && { stack: errorStack })
      },
      { status: 500 }
    )
  }
}

// DELETE - Rimuove l'immagine di un menu item
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> | { itemId: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params)
    const itemId = parseInt(resolvedParams.itemId)

    if (isNaN(itemId)) {
      return NextResponse.json(
        { error: 'ID menu item non valido' },
        { status: 400 }
      )
    }

    if (!prisma) {
      console.error('Prisma non inizializzato - DATABASE_URL:', process.env.DATABASE_URL ? 'presente' : 'mancante')
      return NextResponse.json(
        { error: 'Database non disponibile', details: 'Prisma client non inizializzato' },
        { status: 500 }
      )
    }

    // Test connessione database
    try {
      await prisma.$queryRaw`SELECT 1`
    } catch (dbError) {
      console.error('Database connection error:', dbError)
      return NextResponse.json(
        { error: 'Database non disponibile', details: 'Errore di connessione al database' },
        { status: 500 }
      )
    }

    const key = `menu_item_image_${itemId}`

    // Prova a rimuovere dal MenuItem se esiste
    const existingItem = await prisma.menuItem.findUnique({
      where: { id: itemId }
    })

    if (existingItem) {
      await prisma.menuItem.update({
        where: { id: itemId },
        data: { imageUrl: null }
      })
    }

    // Rimuovi eventuale fallback nella tabella Content
    await prisma.content.deleteMany({
      where: { key }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting menu item image:', error)
    const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto'
    const errorStack = error instanceof Error ? error.stack : undefined
    
    if (error instanceof Error) {
      console.error('Error name:', error.name)
      console.error('Error message:', error.message)
      if (errorStack) {
        console.error('Error stack:', errorStack)
      }
    }
    
    return NextResponse.json(
      { 
        error: 'Errore nella rimozione dell\'immagine',
        details: errorMessage,
        ...(process.env.NODE_ENV === 'development' && { stack: errorStack })
      },
      { status: 500 }
    )
  }
}


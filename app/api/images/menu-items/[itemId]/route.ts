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

    // Test connessione database con retry logic
    let dbConnected = false
    const maxRetries = 2 // Meno retry per GET (più veloce)
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await prisma.$queryRaw`SELECT 1`
        dbConnected = true
        break
      } catch (dbError) {
        console.error(`Database connection attempt ${attempt}/${maxRetries} failed:`, dbError)
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 300 * attempt)) // Backoff: 300ms, 600ms
        }
      }
    }
    
    if (!dbConnected) {
      // Per GET, restituisci null invece di errore per non rompere la pagina
      return NextResponse.json({ imageUrl: null })
    }

    // Prima prova a recuperare dal Content (storage principale per override)
    const key = `menu_item_image_${itemId}`
    const content = await prisma.content.findUnique({
      where: { key },
      select: { value: true }
    })

    if (content?.value) {
      return NextResponse.json({ 
        imageUrl: content.value 
      })
    }

    // Fallback: prova a recuperare dal MenuItem (per retrocompatibilità)
    const menuItem = await prisma.menuItem.findUnique({
      where: { id: itemId },
      select: { imageUrl: true }
    })

    return NextResponse.json({ 
      imageUrl: menuItem?.imageUrl || null 
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

    let body
    try {
      body = await request.json()
    } catch (parseError) {
      console.error('Error parsing request body:', parseError)
      return NextResponse.json(
        { error: 'Formato richiesta non valido', details: 'Impossibile parsare il JSON' },
        { status: 400 }
      )
    }

    const { imageUrl } = body

    if (!imageUrl || typeof imageUrl !== 'string') {
      return NextResponse.json(
        { error: 'URL immagine non valido', details: 'Il campo imageUrl è richiesto e deve essere una stringa' },
        { status: 400 }
      )
    }

    // Verifica che sia un'immagine base64 valida
    if (!imageUrl.startsWith('data:image/')) {
      return NextResponse.json(
        { error: 'Formato immagine non valido', details: 'L\'immagine deve essere in formato base64 (data:image/...)' },
        { status: 400 }
      )
    }

    // Verifica dimensione (max ~5MB in base64, che corrisponde a ~3.75MB binario)
    if (imageUrl.length > 7 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Immagine troppo grande', details: 'L\'immagine non può superare i 5MB. Prova a ridurre la qualità o le dimensioni.' },
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

    // Salva l'immagine usando Content come storage principale (più affidabile per override)
    const key = `menu_item_image_${itemId}`
    
    // Usa transazione per garantire atomicità
    let savedImageUrl: string | null = null
    
    try {
      const content = await prisma.content.upsert({
        where: { key },
        update: { 
          value: imageUrl,
          type: 'image',
          updatedAt: new Date()
        },
        create: {
          key,
          value: imageUrl,
          type: 'image'
        },
        select: { key: true, value: true }
      })
      
      savedImageUrl = content.value
      
      // Opzionalmente, aggiorna anche MenuItem se esiste (per retrocompatibilità)
      try {
        const existingItem = await prisma.menuItem.findUnique({
          where: { id: itemId }
        })
        
        if (existingItem) {
          await prisma.menuItem.update({
            where: { id: itemId },
            data: { imageUrl }
          })
        }
      } catch (menuItemError) {
        // Non bloccare se l'aggiornamento di MenuItem fallisce
        console.warn(`Could not update MenuItem ${itemId}, but image saved in Content:`, menuItemError)
      }
    } catch (saveError) {
      console.error('Error saving image to Content:', saveError)
      throw saveError
    }

    return NextResponse.json({ 
      success: true,
      imageUrl: savedImageUrl 
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

    // Test connessione database con retry logic
    let dbConnected = false
    let lastError: Error | null = null
    const maxRetries = 3
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await prisma.$queryRaw`SELECT 1`
        dbConnected = true
        break
      } catch (dbError) {
        lastError = dbError instanceof Error ? dbError : new Error(String(dbError))
        console.error(`Database connection attempt ${attempt}/${maxRetries} failed:`, lastError)
        
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 500 * attempt))
        }
      }
    }
    
    if (!dbConnected) {
      console.error('Database connection failed after retries:', lastError)
      return NextResponse.json(
        { 
          error: 'Database non disponibile', 
          details: lastError?.message || 'Errore di connessione al database dopo tentativi multipli',
          retried: maxRetries
        },
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


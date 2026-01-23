import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// POST - Salva multiple immagini in una singola transazione
export async function POST(request: NextRequest) {
  try {
    if (!prisma) {
      return NextResponse.json(
        { error: 'Database non disponibile', details: 'Prisma client non inizializzato' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { images } = body // Array di { itemId: number, imageUrl: string }

    if (!Array.isArray(images) || images.length === 0) {
      return NextResponse.json(
        { error: 'Array immagini non valido', details: 'Fornisci un array di immagini con itemId e imageUrl' },
        { status: 400 }
      )
    }

    // Valida tutte le immagini prima di procedere
    for (const img of images) {
      if (!img.itemId || typeof img.itemId !== 'number') {
        return NextResponse.json(
          { error: 'ID menu item non valido', details: `ItemId mancante o non valido: ${JSON.stringify(img)}` },
          { status: 400 }
        )
      }

      if (!img.imageUrl || typeof img.imageUrl !== 'string') {
        return NextResponse.json(
          { error: 'URL immagine non valido', details: `ImageUrl mancante o non valido per itemId: ${img.itemId}` },
          { status: 400 }
        )
      }

      if (!img.imageUrl.startsWith('data:image/')) {
        return NextResponse.json(
          { error: 'Formato immagine non valido', details: `L'immagine per itemId ${img.itemId} deve essere in formato base64` },
          { status: 400 }
        )
      }

      if (img.imageUrl.length > 7 * 1024 * 1024) {
        return NextResponse.json(
          { error: 'Immagine troppo grande', details: `L'immagine per itemId ${img.itemId} supera i 5MB` },
          { status: 400 }
        )
      }
    }

    // Test connessione database una sola volta
    let dbConnected = false
    const maxRetries = 3
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await prisma.$queryRaw`SELECT 1`
        dbConnected = true
        break
      } catch (dbError) {
        console.error(`Database connection attempt ${attempt}/${maxRetries} failed:`, dbError)
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 500 * attempt))
        }
      }
    }
    
    if (!dbConnected) {
      return NextResponse.json(
        { 
          error: 'Database non disponibile', 
          details: 'Errore di connessione al database dopo tentativi multipli'
        },
        { status: 500 }
      )
    }

    // Usa una transazione per inserire tutte le immagini atomicamente
    const results = await prisma.$transaction(
      async (tx) => {
        const savedImages: Array<{ itemId: number; imageUrl: string }> = []

        for (const img of images) {
          const key = `menu_item_image_${img.itemId}`

          // Upsert nel Content table
          const content = await tx.content.upsert({
            where: { key },
            update: { 
              value: img.imageUrl,
              type: 'image',
              updatedAt: new Date()
            },
            create: {
              key,
              value: img.imageUrl,
              type: 'image'
            },
            select: { key: true, value: true }
          })

          savedImages.push({
            itemId: img.itemId,
            imageUrl: content.value
          })

          // Opzionalmente, aggiorna anche MenuItem se esiste (per retrocompatibilità)
          try {
            const existingItem = await tx.menuItem.findUnique({
              where: { id: img.itemId }
            })
            
            if (existingItem) {
              await tx.menuItem.update({
                where: { id: img.itemId },
                data: { imageUrl: img.imageUrl }
              })
            }
          } catch (menuItemError) {
            // Non bloccare se l'aggiornamento di MenuItem fallisce
            console.warn(`Could not update MenuItem ${img.itemId}, but image saved in Content:`, menuItemError)
          }
        }

        return savedImages
      },
      {
        timeout: 30000, // 30 secondi di timeout per la transazione
      }
    )

    return NextResponse.json({ 
      success: true,
      saved: results.length,
      images: results
    })
  } catch (error) {
    console.error('Error saving batch images:', error)
    const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto'
    
    return NextResponse.json(
      { 
        error: 'Errore nel salvataggio batch delle immagini',
        details: errorMessage,
        ...(process.env.NODE_ENV === 'development' && { 
          stack: error instanceof Error ? error.stack : undefined 
        })
      },
      { status: 500 }
    )
  }
}

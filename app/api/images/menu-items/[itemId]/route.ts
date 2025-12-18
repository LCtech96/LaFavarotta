import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET - Recupera l'immagine di un menu item
export async function GET(
  request: NextRequest,
  { params }: { params: { itemId: string } }
) {
  try {
    const itemId = parseInt(params.itemId)
    
    if (isNaN(itemId)) {
      return NextResponse.json(
        { error: 'ID menu item non valido' },
        { status: 400 }
      )
    }

    if (!prisma) {
      return NextResponse.json(
        { error: 'Database non disponibile' },
        { status: 500 }
      )
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
    return NextResponse.json(
      { error: 'Errore nel recupero dell\'immagine' },
      { status: 500 }
    )
  }
}

// POST - Salva l'immagine di un menu item
export async function POST(
  request: NextRequest,
  { params }: { params: { itemId: string } }
) {
  try {
    const itemId = parseInt(params.itemId)
    
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
      return NextResponse.json(
        { error: 'Database non disponibile' },
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
    return NextResponse.json(
      { error: 'Errore nel salvataggio dell\'immagine' },
      { status: 500 }
    )
  }
}

// DELETE - Rimuove l'immagine di un menu item
export async function DELETE(
  request: NextRequest,
  { params }: { params: { itemId: string } }
) {
  try {
    const itemId = parseInt(params.itemId)

    if (isNaN(itemId)) {
      return NextResponse.json(
        { error: 'ID menu item non valido' },
        { status: 400 }
      )
    }

    if (!prisma) {
      return NextResponse.json(
        { error: 'Database non disponibile' },
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
    return NextResponse.json(
      { error: 'Errore nella rimozione dell\'immagine' },
      { status: 500 }
    )
  }
}


import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// PUT - Aggiorna un piatto
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ holidayId: string; itemId: string }> | { holidayId: string; itemId: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params)
    const itemId = parseInt(resolvedParams.itemId)
    
    if (isNaN(itemId)) {
      return NextResponse.json(
        { error: 'ID piatto non valido' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { name, ingredients, price, imageUrl } = body

    if (!prisma) {
      return NextResponse.json(
        { error: 'Database non disponibile' },
        { status: 500 }
      )
    }

    const item = await prisma.holidayMenuItem.update({
      where: { id: itemId },
      data: {
        name: name || undefined,
        ingredients: Array.isArray(ingredients) ? ingredients : undefined,
        price: price || undefined,
        imageUrl: imageUrl !== undefined ? imageUrl : undefined
      }
    })

    return NextResponse.json({ 
      success: true,
      item
    })
  } catch (error) {
    console.error('Error updating holiday item:', error)
    return NextResponse.json(
      { error: 'Errore nell\'aggiornamento del piatto' },
      { status: 500 }
    )
  }
}

// DELETE - Elimina un piatto
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ holidayId: string; itemId: string }> | { holidayId: string; itemId: string } }
) {
  try {
    // Gestisci params come Promise o oggetto diretto (per Next.js 14+)
    const resolvedParams = await Promise.resolve(params)
    const itemId = parseInt(resolvedParams.itemId)
    
    if (isNaN(itemId)) {
      return NextResponse.json(
        { error: 'ID piatto non valido' },
        { status: 400 }
      )
    }

    if (!prisma) {
      console.error('Prisma client non disponibile - DATABASE_URL:', process.env.DATABASE_URL ? 'presente' : 'mancante')
      return NextResponse.json(
        { error: 'Database non disponibile' },
        { status: 500 }
      )
    }

    // Assicurati che la connessione sia attiva
    await prisma.$connect().catch((err) => {
      console.error('Error connecting to database:', err)
    })

    // Verifica che l'item esista prima di eliminarlo
    const existingItem = await prisma.holidayMenuItem.findUnique({
      where: { id: itemId }
    })

    if (!existingItem) {
      return NextResponse.json(
        { error: 'Piatto non trovato' },
        { status: 404 }
      )
    }

    // Elimina l'item
    await prisma.holidayMenuItem.delete({
      where: { id: itemId }
    })

    return NextResponse.json({ 
      success: true
    })
  } catch (error) {
    console.error('Error deleting holiday item:', error)
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

    const resolvedParams = await Promise.resolve(params)
    console.error('Error details:', {
      message: errorMessage,
      itemId: resolvedParams.itemId,
      holidayId: resolvedParams.holidayId
    })

    return NextResponse.json(
      { 
        error: 'Errore nell\'eliminazione del piatto',
        details: errorMessage,
        ...(process.env.NODE_ENV === 'development' && { stack: errorStack })
      },
      { status: 500 }
    )
  }
}



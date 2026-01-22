import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// PATCH - Aggiorna nome, prezzo e visibilità di un menu item (tramite Content come override)
export async function PATCH(
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

    const body = await request.json()
    const { name, price, hidden } = body as {
      name?: string
      price?: number
      hidden?: boolean
    }

    if (name !== undefined && typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Nome non valido' },
        { status: 400 }
      )
    }

    if (price !== undefined && typeof price !== 'number') {
      return NextResponse.json(
        { error: 'Prezzo non valido' },
        { status: 400 }
      )
    }

    if (hidden !== undefined && typeof hidden !== 'boolean') {
      return NextResponse.json(
        { error: 'Valore hidden non valido' },
        { status: 400 }
      )
    }

    const operations: Promise<unknown>[] = []

    if (name !== undefined) {
      const key = `menu_item_${itemId}_name`
      operations.push(
        prisma.content.upsert({
          where: { key },
          update: {
            value: name,
            type: 'text',
          },
          create: {
            key,
            value: name,
            type: 'text',
          },
        })
      )
    }

    if (price !== undefined) {
      const key = `menu_item_${itemId}_price`
      operations.push(
        prisma.content.upsert({
          where: { key },
          update: {
            value: price.toString(),
            type: 'text',
          },
          create: {
            key,
            value: price.toString(),
            type: 'text',
          },
        })
      )
    }

    if (hidden !== undefined) {
      const key = `menu_item_${itemId}_hidden`
      operations.push(
        prisma.content.upsert({
          where: { key },
          update: {
            value: hidden ? 'true' : 'false',
            type: 'text',
          },
          create: {
            key,
            value: hidden ? 'true' : 'false',
            type: 'text',
          },
        })
      )
    }

    if (operations.length === 0) {
      return NextResponse.json(
        { error: 'Nessun campo da aggiornare' },
        { status: 400 }
      )
    }

    await Promise.all(operations)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating menu item details:', error)
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
        error: 'Errore nell\'aggiornamento del piatto',
        details: errorMessage,
        ...(process.env.NODE_ENV === 'development' && { stack: errorStack })
      },
      { status: 500 }
    )
  }
}



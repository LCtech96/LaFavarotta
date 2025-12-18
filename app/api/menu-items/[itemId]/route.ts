import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// PATCH - Aggiorna nome e prezzo di un menu item (tramite Content come override)
export async function PATCH(
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

    const body = await request.json()
    const { name, price } = body as { name?: string; price?: number }

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
    return NextResponse.json(
      { error: 'Errore nell\'aggiornamento del piatto' },
      { status: 500 }
    )
  }
}



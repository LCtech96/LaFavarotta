import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET - Recupera tutte le varianti di menu per una festività
export async function GET(
  request: NextRequest,
  { params }: { params: { holidayId: string } }
) {
  try {
    if (!prisma) {
      return NextResponse.json(
        { error: 'Database non disponibile' },
        { status: 500 }
      )
    }

    const holidayId = parseInt(params.holidayId)
    if (isNaN(holidayId)) {
      return NextResponse.json(
        { error: 'ID festività non valido' },
        { status: 400 }
      )
    }

    const variants = await prisma.holidayMenuVariant.findMany({
      where: { holidayMenuId: holidayId },
      include: {
        items: {
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { order: 'asc' }
    })

    return NextResponse.json({ variants })
  } catch (error) {
    console.error('Error fetching menu variants:', error)
    const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto'
    return NextResponse.json(
      {
        error: 'Errore nel recupero delle varianti di menu',
        details: errorMessage
      },
      { status: 500 }
    )
  }
}

// POST - Crea una nuova variante di menu
export async function POST(
  request: NextRequest,
  { params }: { params: { holidayId: string } }
) {
  try {
    if (!prisma) {
      return NextResponse.json(
        { error: 'Database non disponibile' },
        { status: 500 }
      )
    }

    const holidayId = parseInt(params.holidayId)
    if (isNaN(holidayId)) {
      return NextResponse.json(
        { error: 'ID festività non valido' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { title, menuText, menuPrice, menuImages, order } = body

    if (!title || typeof title !== 'string') {
      return NextResponse.json(
        { error: 'Titolo variante non valido' },
        { status: 400 }
      )
    }

    // Trova l'ordine massimo se non specificato
    let finalOrder = order !== undefined ? parseInt(order) : 0
    if (isNaN(finalOrder)) {
      const maxOrder = await prisma.holidayMenuVariant.findFirst({
        where: { holidayMenuId: holidayId },
        orderBy: { order: 'desc' },
        select: { order: true }
      })
      finalOrder = maxOrder ? maxOrder.order + 1 : 0
    }

    const variant = await prisma.holidayMenuVariant.create({
      data: {
        holidayMenuId: holidayId,
        title,
        menuText: menuText || null,
        menuPrice: menuPrice ? parseFloat(menuPrice) : null,
        menuImages: Array.isArray(menuImages) ? menuImages : [],
        order: finalOrder
      },
      include: {
        items: true
      }
    })

    return NextResponse.json({
      success: true,
      variant
    })
  } catch (error) {
    console.error('Error creating menu variant:', error)
    const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto'
    return NextResponse.json(
      {
        error: 'Errore nella creazione della variante di menu',
        details: errorMessage
      },
      { status: 500 }
    )
  }
}



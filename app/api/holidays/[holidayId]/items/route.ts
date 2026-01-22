import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET - Recupera tutti i piatti di una festività
export async function GET(
  request: NextRequest,
  { params }: { params: { holidayId: string } }
) {
  try {
    const holidayId = parseInt(params.holidayId)
    
    if (isNaN(holidayId)) {
      return NextResponse.json(
        { error: 'ID festività non valido' },
        { status: 400 }
      )
    }

    if (!prisma) {
      return NextResponse.json(
        { error: 'Database non disponibile' },
        { status: 500 }
      )
    }

    const items = await prisma.holidayMenuItem.findMany({
      where: { holidayMenuId: holidayId },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ items })
  } catch (error) {
    console.error('Error fetching holiday items:', error)
    return NextResponse.json(
      { error: 'Errore nel recupero dei piatti' },
      { status: 500 }
    )
  }
}

// POST - Crea un nuovo piatto per una festività
export async function POST(
  request: NextRequest,
  { params }: { params: { holidayId: string } }
) {
  try {
    const holidayId = parseInt(params.holidayId)
    
    if (isNaN(holidayId)) {
      return NextResponse.json(
        { error: 'ID festività non valido' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { name, ingredients, price, imageUrl } = body

    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Nome piatto non valido' },
        { status: 400 }
      )
    }

    if (!price || typeof price !== 'number') {
      return NextResponse.json(
        { error: 'Prezzo non valido' },
        { status: 400 }
      )
    }

    if (!prisma) {
      return NextResponse.json(
        { error: 'Database non disponibile' },
        { status: 500 }
      )
    }

    // Verifica che la festività esista
    const holiday = await prisma.holidayMenu.findUnique({
      where: { id: holidayId }
    })

    if (!holiday) {
      return NextResponse.json(
        { error: 'Festività non trovata' },
        { status: 404 }
      )
    }

    const item = await prisma.holidayMenuItem.create({
      data: {
        holidayMenuId: holidayId,
        name,
        ingredients: Array.isArray(ingredients) ? ingredients : [],
        price,
        imageUrl: imageUrl || null
      }
    })

    return NextResponse.json({ 
      success: true,
      item
    })
  } catch (error) {
    console.error('Error creating holiday item:', error)
    const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto'
    return NextResponse.json(
      { 
        error: 'Errore nella creazione del piatto',
        details: errorMessage
      },
      { status: 500 }
    )
  }
}






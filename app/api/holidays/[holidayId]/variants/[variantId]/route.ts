import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET - Recupera una singola variante
export async function GET(
  request: NextRequest,
  { params }: { params: { holidayId: string; variantId: string } }
) {
  try {
    if (!prisma) {
      return NextResponse.json(
        { error: 'Database non disponibile' },
        { status: 500 }
      )
    }

    const variantId = parseInt(params.variantId)
    if (isNaN(variantId)) {
      return NextResponse.json(
        { error: 'ID variante non valido' },
        { status: 400 }
      )
    }

    const variant = await prisma.holidayMenuVariant.findUnique({
      where: { id: variantId },
      include: {
        items: {
          orderBy: { createdAt: 'asc' }
        }
      }
    })

    if (!variant) {
      return NextResponse.json(
        { error: 'Variante non trovata' },
        { status: 404 }
      )
    }

    return NextResponse.json({ variant })
  } catch (error) {
    console.error('Error fetching menu variant:', error)
    const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto'
    return NextResponse.json(
      {
        error: 'Errore nel recupero della variante di menu',
        details: errorMessage
      },
      { status: 500 }
    )
  }
}

// PUT - Aggiorna una variante di menu
export async function PUT(
  request: NextRequest,
  { params }: { params: { holidayId: string; variantId: string } }
) {
  try {
    if (!prisma) {
      return NextResponse.json(
        { error: 'Database non disponibile' },
        { status: 500 }
      )
    }

    const variantId = parseInt(params.variantId)
    if (isNaN(variantId)) {
      return NextResponse.json(
        { error: 'ID variante non valido' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { title, menuText, menuPrice, menuImages, order } = body

    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (menuText !== undefined) updateData.menuText = menuText || null
    if (menuPrice !== undefined) updateData.menuPrice = menuPrice ? parseFloat(menuPrice) : null
    if (menuImages !== undefined) updateData.menuImages = Array.isArray(menuImages) ? menuImages : []
    if (order !== undefined) updateData.order = parseInt(order)

    const variant = await prisma.holidayMenuVariant.update({
      where: { id: variantId },
      data: updateData,
      include: {
        items: true
      }
    })

    return NextResponse.json({
      success: true,
      variant
    })
  } catch (error) {
    console.error('Error updating menu variant:', error)
    const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto'
    return NextResponse.json(
      {
        error: 'Errore nell\'aggiornamento della variante di menu',
        details: errorMessage
      },
      { status: 500 }
    )
  }
}

// DELETE - Elimina una variante di menu
export async function DELETE(
  request: NextRequest,
  { params }: { params: { holidayId: string; variantId: string } }
) {
  try {
    if (!prisma) {
      return NextResponse.json(
        { error: 'Database non disponibile' },
        { status: 500 }
      )
    }

    const variantId = parseInt(params.variantId)
    if (isNaN(variantId)) {
      return NextResponse.json(
        { error: 'ID variante non valido' },
        { status: 400 }
      )
    }

    await prisma.holidayMenuVariant.delete({
      where: { id: variantId }
    })

    return NextResponse.json({
      success: true,
      message: 'Variante eliminata con successo'
    })
  } catch (error) {
    console.error('Error deleting menu variant:', error)
    const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto'
    return NextResponse.json(
      {
        error: 'Errore nell\'eliminazione della variante di menu',
        details: errorMessage
      },
      { status: 500 }
    )
  }
}





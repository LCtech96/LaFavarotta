import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET - Recupera tutti i menu delle festività
export async function GET(request: NextRequest) {
  try {
    if (!prisma) {
      return NextResponse.json(
        { error: 'Database non disponibile' },
        { status: 500 }
      )
    }

    const holidays = await prisma.holidayMenu.findMany({
      include: {
        items: {
          orderBy: { createdAt: 'desc' }
        },
        variants: {
          include: {
            items: {
              orderBy: { createdAt: 'asc' }
            }
          },
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { id: 'asc' }
    })

    return NextResponse.json({ holidays })
  } catch (error) {
    console.error('Error fetching holiday menus:', error)
    const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto'
    return NextResponse.json(
      { 
        error: 'Errore nel recupero dei menu delle festività',
        details: errorMessage
      },
      { status: 500 }
    )
  }
}

// POST - Crea o aggiorna un menu festività
export async function POST(request: NextRequest) {
  try {
    if (!prisma) {
      return NextResponse.json(
        { error: 'Database non disponibile' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { name, displayName, previewImage, menuText, menuPrice, menuImages } = body

    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Nome festività non valido' },
        { status: 400 }
      )
    }

    const holiday = await prisma.holidayMenu.upsert({
      where: { name },
      update: {
        displayName: displayName || name,
        previewImage: previewImage !== undefined ? previewImage : undefined,
        menuText: menuText !== undefined ? menuText : undefined,
        menuPrice: menuPrice !== undefined ? (menuPrice ? parseFloat(menuPrice) : null) : undefined,
        menuImages: menuImages !== undefined ? (Array.isArray(menuImages) ? menuImages : []) : undefined
      },
      create: {
        name,
        displayName: displayName || name,
        previewImage: previewImage || null,
        menuText: menuText || null,
        menuPrice: menuPrice ? parseFloat(menuPrice) : null,
        menuImages: Array.isArray(menuImages) ? menuImages : []
      },
      include: {
        items: true
      }
    })

    return NextResponse.json({ 
      success: true,
      holiday
    })
  } catch (error) {
    console.error('Error saving holiday menu:', error)
    const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto'
    return NextResponse.json(
      { 
        error: 'Errore nel salvataggio del menu festività',
        details: errorMessage
      },
      { status: 500 }
    )
  }
}



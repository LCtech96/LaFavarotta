import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET - Restituisce override di nome, prezzo e visibilità per i menu items
export async function GET(request: NextRequest) {
  try {
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

    const contents = await prisma.content.findMany({
      where: {
        key: {
          startsWith: 'menu_item_',
        },
      },
      select: {
        key: true,
        value: true,
      },
    })

    const overrides: Record<
      number,
      {
        name?: string
        price?: number
        hidden?: boolean
        categoryId?: number
      }
    > = {}

    for (const content of contents) {
      const { key, value } = content

      const match = key.match(/^menu_item_(\d+)_(name|price|hidden|categoryId)$/)
      if (!match) continue

      const [, idStr, field] = match
      const id = parseInt(idStr)
      if (isNaN(id)) continue

      if (!overrides[id]) {
        overrides[id] = {}
      }

      if (field === 'name') {
        overrides[id].name = value
      } else if (field === 'price') {
        const parsed = parseFloat(value)
        if (!isNaN(parsed)) {
          overrides[id].price = parsed
        }
      } else if (field === 'hidden') {
        overrides[id].hidden = value === 'true'
      } else if (field === 'categoryId') {
        const parsed = parseInt(value)
        if (!isNaN(parsed)) {
          overrides[id].categoryId = parsed
        }
      }
    }

    return NextResponse.json({ overrides })
  } catch (error) {
    console.error('Error fetching menu item overrides:', error)
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
        error: 'Errore nel recupero dei piatti',
        details: errorMessage,
        ...(process.env.NODE_ENV === 'development' && { stack: errorStack })
      },
      { status: 500 }
    )
  }
}



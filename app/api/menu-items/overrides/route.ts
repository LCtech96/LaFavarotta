import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET - Restituisce override di nome e prezzo per i menu items
export async function GET(request: NextRequest) {
  try {
    if (!prisma) {
      return NextResponse.json(
        { error: 'Database non disponibile' },
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
      }
    > = {}

    for (const content of contents) {
      const { key, value } = content

      const match = key.match(/^menu_item_(\d+)_(name|price)$/)
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
      }
    }

    return NextResponse.json({ overrides })
  } catch (error) {
    console.error('Error fetching menu item overrides:', error)
    return NextResponse.json(
      { error: 'Errore nel recupero dei piatti' },
      { status: 500 }
    )
  }
}



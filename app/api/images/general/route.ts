import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET - Recupera le immagini generali (cover o profile)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type') // 'cover' o 'profile'

    if (!type || (type !== 'cover' && type !== 'profile')) {
      return NextResponse.json(
        { error: 'Tipo immagine non valido. Usa "cover" o "profile"' },
        { status: 400 }
      )
    }

    if (!prisma) {
      return NextResponse.json(
        { error: 'Database non disponibile' },
        { status: 500 }
      )
    }

    const key = `${type}_image`
    
    const content = await prisma.content.findUnique({
      where: { key },
      select: { value: true }
    })

    return NextResponse.json({ 
      imageUrl: content?.value || null 
    })
  } catch (error) {
    console.error('Error fetching general image:', error)
    return NextResponse.json(
      { error: 'Errore nel recupero dell\'immagine' },
      { status: 500 }
    )
  }
}

// POST - Salva un'immagine generale (cover o profile)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, imageUrl } = body

    if (!type || (type !== 'cover' && type !== 'profile')) {
      return NextResponse.json(
        { error: 'Tipo immagine non valido. Usa "cover" o "profile"' },
        { status: 400 }
      )
    }

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

    const key = `${type}_image`

    // Upsert: crea se non esiste, altrimenti aggiorna
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
      imageUrl: content?.value 
    })
  } catch (error) {
    console.error('Error saving general image:', error)
    return NextResponse.json(
      { error: 'Errore nel salvataggio dell\'immagine' },
      { status: 500 }
    )
  }
}


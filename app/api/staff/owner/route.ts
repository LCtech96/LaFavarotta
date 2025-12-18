import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET - Recupera la foto del titolare
export async function GET(request: NextRequest) {
  try {
    if (!prisma) {
      return NextResponse.json(
        { error: 'Database non disponibile' },
        { status: 500 }
      )
    }

    // Cerca il titolare nel modello Staff
    const owner = await prisma.staff.findFirst({
      where: { role: 'Titolare' },
      select: { imageUrl: true, name: true, description: true }
    })

    if (owner?.imageUrl) {
      return NextResponse.json(
        { 
          imageUrl: owner.imageUrl,
          name: owner.name,
          description: owner.description
        },
        {
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        }
      )
    }

    // Fallback: prova a recuperare dal Content
    const content = await prisma.content.findUnique({
      where: { key: 'owner_image' },
      select: { value: true }
    })

    return NextResponse.json(
      { 
        imageUrl: content?.value || null,
        name: null,
        description: null
      },
      {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    )
  } catch (error) {
    console.error('Error fetching owner photo:', error)
    return NextResponse.json(
      { error: 'Errore nel recupero della foto del titolare' },
      { status: 500 }
    )
  }
}

// POST - Salva la foto del titolare
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { imageUrl, name, description } = body

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

    // Cerca il titolare esistente
    const existingOwner = await prisma.staff.findFirst({
      where: { role: 'Titolare' }
    })

    let owner
    if (existingOwner) {
      // Aggiorna il titolare esistente
      owner = await prisma.staff.update({
        where: { id: existingOwner.id },
        data: { 
          imageUrl,
          name: name || existingOwner.name,
          description: description || existingOwner.description
        },
        select: { id: true, imageUrl: true, name: true, description: true }
      })
    } else {
      // Crea un nuovo titolare
      owner = await prisma.staff.create({
        data: {
          name: name || 'Leone Vincenzo',
          role: 'Titolare',
          description: description || 'Con una passione per la cucina che dura da oltre vent\'anni, Leone Vincenzo ha trasformato La Favarotta in un punto di riferimento per la gastronomia siciliana.',
          imageUrl
        },
        select: { id: true, imageUrl: true, name: true, description: true }
      })
    }

    // Salva anche nel Content come fallback
    await prisma.content.upsert({
      where: { key: 'owner_image' },
      update: { 
        value: imageUrl,
        type: 'image'
      },
      create: {
        key: 'owner_image',
        value: imageUrl,
        type: 'image'
      }
    })

    return NextResponse.json({ 
      success: true,
      imageUrl: owner.imageUrl,
      name: owner.name,
      description: owner.description
    })
  } catch (error) {
    console.error('Error saving owner photo:', error)
    return NextResponse.json(
      { error: 'Errore nel salvataggio della foto del titolare' },
      { status: 500 }
    )
  }
}


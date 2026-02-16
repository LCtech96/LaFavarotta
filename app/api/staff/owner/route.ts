import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

const OWNER_DISPLAY_NAME = 'Andriolo Salvatore'
const OWNER_DISPLAY_DESCRIPTION = 'Andriolo Salvatore, pizzaiolo e titolare, porta avanti con passione la tradizione dello street food palermitano e della pizza a Terrasini. Conduzione familiare nel cuore di Terrasini, vicino all\'aeroporto Falcone e Borsellino.'

// GET - Recupera la foto del titolare (nome sempre Andriolo Salvatore)
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
          name: OWNER_DISPLAY_NAME,
          description: OWNER_DISPLAY_DESCRIPTION
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
        name: OWNER_DISPLAY_NAME,
        description: OWNER_DISPLAY_DESCRIPTION
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
    const { imageUrl } = body

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

    // Nome e descrizione sempre Andriolo Salvatore (sovrascrivono eventuali valori obsoleti)
    const ownerName = OWNER_DISPLAY_NAME
    const ownerDescription = OWNER_DISPLAY_DESCRIPTION

    let owner
    if (existingOwner) {
      // Aggiorna il titolare esistente (sovrascrive immagine e nome/descrizione)
      owner = await prisma.staff.update({
        where: { id: existingOwner.id },
        data: { 
          imageUrl,
          name: ownerName,
          description: ownerDescription
        },
        select: { id: true, imageUrl: true, name: true, description: true }
      })
    } else {
      // Crea un nuovo titolare
      owner = await prisma.staff.create({
        data: {
          name: ownerName,
          role: 'Titolare',
          description: ownerDescription,
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


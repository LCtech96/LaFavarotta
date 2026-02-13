import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

const otherHolidays = [
  { name: 'anniversario-liberazione', displayName: 'Anniversario della Liberazione' },
  { name: 'festa-lavoratori', displayName: 'Festa dei Lavoratori' },
  { name: 'festa-repubblica', displayName: 'Festa della Repubblica' },
  { name: 'ferragosto', displayName: 'Ferragosto' },
  { name: 'ognissanti', displayName: 'Ognissanti' },
  { name: 'immacolata-concezione', displayName: 'Immacolata Concezione' },
  { name: 'carnevale', displayName: 'Carnevale' },
  { name: 'san-valentino', displayName: 'San Valentino' },
  { name: 'festa-donna', displayName: 'Festa della Donna' },
  { name: 'festa-mamma', displayName: 'Festa della Mamma' },
  { name: 'halloween', displayName: 'Halloween' },
  { name: 'san-giuseppe', displayName: 'San Giuseppe' },
]

// POST - Inizializza tutte le altre festività nel database
export async function POST(request: NextRequest) {
  try {
    if (!prisma) {
      return NextResponse.json(
        { error: 'Database non disponibile' },
        { status: 500 }
      )
    }

    const results: Array<{ name: string; status: string; error?: string }> = []

    for (const holiday of otherHolidays) {
      try {
        const existing = await prisma.holidayMenu.findUnique({
          where: { name: holiday.name }
        })

        if (existing) {
          results.push({
            name: holiday.displayName,
            status: 'già esistente'
          })
        } else {
          await prisma.holidayMenu.create({
            data: {
              name: holiday.name,
              displayName: holiday.displayName,
              previewImage: null,
              menuText: null,
              menuPrice: null,
              menuImages: []
            }
          })
          results.push({
            name: holiday.displayName,
            status: 'creata'
          })
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto'
        results.push({
          name: holiday.displayName,
          status: 'errore',
          error: errorMessage
        })
      }
    }

    const created = results.filter(r => r.status === 'creata').length
    const existing = results.filter(r => r.status === 'già esistente').length
    const errors = results.filter(r => r.status === 'errore').length

    return NextResponse.json({
      success: true,
      message: `Inizializzazione completata: ${created} create, ${existing} già esistenti, ${errors} errori`,
      results,
      summary: {
        created,
        existing,
        errors,
        total: results.length
      }
    })
  } catch (error) {
    console.error('Error initializing other holidays:', error)
    const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto'
    return NextResponse.json(
      {
        error: 'Errore nell\'inizializzazione delle altre festività',
        details: errorMessage
      },
      { status: 500 }
    )
  }
}





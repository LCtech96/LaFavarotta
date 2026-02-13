import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET - Test della connessione al database
export async function GET(request: NextRequest) {
  try {
    // Verifica se Prisma è disponibile
    if (!prisma) {
      return NextResponse.json({
        prismaAvailable: false,
        databaseUrl: process.env.DATABASE_URL ? 'presente' : 'mancante',
        error: 'Prisma client non inizializzato'
      }, { status: 500 })
    }

    // Test di connessione semplice
    await prisma.$queryRaw`SELECT 1`

    // Verifica se la tabella Post esiste
    const tableCheck = await prisma.$queryRaw<Array<{ exists: boolean }>>`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'Post'
      ) as exists
    `

    const tableExists = tableCheck[0]?.exists || false

    // Conta i post solo se la tabella esiste
    let postCount = 0
    if (tableExists) {
      try {
        postCount = await prisma.post.count()
      } catch (e) {
        console.error('Error counting posts:', e)
      }
    }

    return NextResponse.json({
      prismaAvailable: true,
      databaseConnected: true,
      tableExists: tableExists,
      postCount: postCount,
      databaseUrl: process.env.DATABASE_URL ? 'presente' : 'mancante'
    })
  } catch (error) {
    console.error('Test database error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto'
    
    return NextResponse.json({
      prismaAvailable: !!prisma,
      databaseConnected: false,
      error: errorMessage,
      databaseUrl: process.env.DATABASE_URL ? 'presente' : 'mancante',
      ...(error instanceof Error && { errorName: error.name })
    }, { status: 500 })
  }
}


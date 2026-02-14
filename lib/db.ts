// Prisma Client - will be generated during build
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

/** In serverless (Vercel) evita "MaxClientsInSessionMode: max clients reached" limitando 1 connessione per istanza */
function getDatabaseUrl(): string | undefined {
  const url = process.env.DATABASE_URL
  if (!url) return url
  // In produzione: sempre 1 connessione per istanza (Supabase/Neon hanno limite sul pool)
  if (process.env.NODE_ENV === 'production') {
    const sep = url.includes('?') ? '&' : '?'
    const withLimit = `${url}${sep}connection_limit=1`
    // Evita di aggiungere due volte se già presente
    return withLimit.includes('connection_limit=') ? url : withLimit
  }
  return url
}

let prismaInstance: PrismaClient | null = null

try {
  const databaseUrl = getDatabaseUrl()
  prismaInstance =
    globalForPrisma.prisma ??
    new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      datasources: {
        db: {
          url: databaseUrl,
        },
      },
    })

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prismaInstance
  } else {
    // In produzione, mantieni la connessione globale
    globalForPrisma.prisma = prismaInstance
  }
  
  // Gestisci la disconnessione graceful
  if (typeof process !== 'undefined') {
    process.on('beforeExit', async () => {
      await prismaInstance?.$disconnect()
    })
  }
} catch (error) {
  console.error('Error initializing Prisma Client:', error)
  prismaInstance = null
}

export const prisma = prismaInstance


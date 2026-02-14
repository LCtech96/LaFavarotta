// Prisma Client - will be generated during build
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

/** In serverless (Vercel) evita "MaxClientsInSessionMode" e compatibilità con Supabase Transaction mode (porta 6543) */
function getDatabaseUrl(): string | undefined {
  let url = process.env.DATABASE_URL
  if (!url) return url
  const sep = url.includes('?') ? '&' : '?'
  // Porta 6543 = Transaction mode Supabase: Prisma deve usare pgbouncer=true (no prepared statements)
  if (url.includes(':6543/')) {
    url = url.includes('pgbouncer=true') ? url : `${url}${sep}pgbouncer=true`
  }
  // In produzione: 1 connessione per istanza per non saturare il pool
  if (process.env.NODE_ENV === 'production' && !url.includes('connection_limit=')) {
    url = `${url}${url.includes('?') ? '&' : '?'}connection_limit=1`
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


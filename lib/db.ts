// Prisma Client - will be generated during build
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

let prismaInstance: PrismaClient | null = null

try {
  prismaInstance =
    globalForPrisma.prisma ??
    new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    })

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prismaInstance
  } else {
    // In produzione, mantieni la connessione globale
    globalForPrisma.prisma = prismaInstance
  }
} catch (error) {
  console.error('Error initializing Prisma Client:', error)
  prismaInstance = null
}

export const prisma = prismaInstance


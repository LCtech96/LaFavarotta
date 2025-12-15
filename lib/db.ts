// Prisma Client - will be generated during build
// This file is optional and only needed if you want to use the database
// Currently, menu data is static in data/menu-data.ts

let PrismaClient: any
try {
  PrismaClient = require('@prisma/client').PrismaClient
} catch (e) {
  // Prisma Client not generated yet - this is OK for static data
  PrismaClient = null
}

const globalForPrisma = globalThis as unknown as {
  prisma: any | undefined
}

export const prisma = PrismaClient
  ? globalForPrisma.prisma ?? new PrismaClient()
  : null

if (process.env.NODE_ENV !== 'production' && prisma) {
  globalForPrisma.prisma = prisma
}


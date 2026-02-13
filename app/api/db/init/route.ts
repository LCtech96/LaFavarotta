import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// POST - Inizializza il database creando le tabelle mancanti
export async function POST(request: NextRequest) {
  try {
    if (!prisma) {
      return NextResponse.json(
        { error: 'Prisma client non disponibile' },
        { status: 500 }
      )
    }

    // Verifica se le tabelle esistono già
    const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
    `

    const tableNames = tables.map(t => t.tablename.toLowerCase())
    const results: string[] = []

    // Crea la tabella Post se non esiste
    if (!tableNames.includes('post')) {
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS "Post" (
          "id" SERIAL PRIMARY KEY,
          "imageUrl" TEXT NOT NULL,
          "description" TEXT NOT NULL,
          "title" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `
      results.push('Tabella Post creata')
    } else {
      results.push('Tabella Post già esistente')
    }

    // Crea la tabella Staff se non esiste
    if (!tableNames.includes('staff')) {
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS "Staff" (
          "id" SERIAL PRIMARY KEY,
          "name" TEXT NOT NULL,
          "role" TEXT NOT NULL,
          "description" TEXT NOT NULL,
          "imageUrl" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `
      results.push('Tabella Staff creata')
    } else {
      results.push('Tabella Staff già esistente')
    }

    // Crea la tabella Content se non esiste
    if (!tableNames.includes('content')) {
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS "Content" (
          "id" TEXT PRIMARY KEY,
          "key" TEXT NOT NULL UNIQUE,
          "value" TEXT NOT NULL,
          "type" TEXT NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `
      results.push('Tabella Content creata')
    } else {
      results.push('Tabella Content già esistente')
    }

    // Crea la tabella MenuItem se non esiste
    if (!tableNames.includes('menuitem')) {
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS "MenuItem" (
          "id" SERIAL PRIMARY KEY,
          "name" TEXT NOT NULL,
          "description" TEXT NOT NULL,
          "price" DOUBLE PRECISION NOT NULL,
          "categoryId" INTEGER NOT NULL,
          "ingredients" TEXT[] DEFAULT ARRAY[]::TEXT[],
          "allergens" TEXT[] DEFAULT ARRAY[]::TEXT[],
          "isVegan" BOOLEAN NOT NULL DEFAULT false,
          "isGlutenFree" BOOLEAN NOT NULL DEFAULT false,
          "isBestSeller" BOOLEAN NOT NULL DEFAULT false,
          "imageUrl" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `
      results.push('Tabella MenuItem creata')
    } else {
      results.push('Tabella MenuItem già esistente')
    }

    // Crea la tabella Category se non esiste
    if (!tableNames.includes('category')) {
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS "Category" (
          "id" SERIAL PRIMARY KEY,
          "name" TEXT NOT NULL,
          "order" INTEGER NOT NULL,
          "description" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `
      results.push('Tabella Category creata')
    } else {
      results.push('Tabella Category già esistente')
    }

    // Crea la tabella HolidayMenu se non esiste
    if (!tableNames.includes('holidaymenu')) {
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS "HolidayMenu" (
          "id" SERIAL PRIMARY KEY,
          "name" TEXT NOT NULL UNIQUE,
          "displayName" TEXT NOT NULL,
          "previewImage" TEXT,
          "menuText" TEXT,
          "menuPrice" DOUBLE PRECISION,
          "menuImages" TEXT[] DEFAULT ARRAY[]::TEXT[],
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `
      results.push('Tabella HolidayMenu creata')
    } else {
      // Aggiungi le colonne menuText, menuPrice e menuImages se non esistono
      try {
        await prisma.$executeRaw`
          ALTER TABLE "HolidayMenu" 
          ADD COLUMN IF NOT EXISTS "menuText" TEXT,
          ADD COLUMN IF NOT EXISTS "menuPrice" DOUBLE PRECISION,
          ADD COLUMN IF NOT EXISTS "menuImages" TEXT[] DEFAULT ARRAY[]::TEXT[]
        `
        results.push('Colonne menuText, menuPrice e menuImages aggiunte a HolidayMenu (se non esistevano)')
      } catch (error) {
        // Le colonne potrebbero già esistere, ignora l'errore
        results.push('Colonne menuText, menuPrice e menuImages già presenti o errore nell\'aggiunta')
      }
      results.push('Tabella HolidayMenu già esistente')
    }

    // Crea la tabella HolidayMenuItem se non esiste
    if (!tableNames.includes('holidaymenuitem')) {
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS "HolidayMenuItem" (
          "id" SERIAL PRIMARY KEY,
          "holidayMenuId" INTEGER NOT NULL,
          "name" TEXT NOT NULL,
          "ingredients" TEXT[],
          "price" DOUBLE PRECISION NOT NULL,
          "imageUrl" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "HolidayMenuItem_holidayMenuId_fkey" FOREIGN KEY ("holidayMenuId") REFERENCES "HolidayMenu"("id") ON DELETE CASCADE ON UPDATE CASCADE
        )
      `
      results.push('Tabella HolidayMenuItem creata')
    } else {
      results.push('Tabella HolidayMenuItem già esistente')
    }

    // Crea la tabella HolidayMenuVariant se non esiste
    if (!tableNames.includes('holidaymenuvariant')) {
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS "HolidayMenuVariant" (
          "id" SERIAL PRIMARY KEY,
          "holidayMenuId" INTEGER NOT NULL,
          "title" TEXT NOT NULL,
          "menuText" TEXT,
          "menuPrice" DOUBLE PRECISION,
          "menuImages" TEXT[] DEFAULT ARRAY[]::TEXT[],
          "order" INTEGER NOT NULL DEFAULT 0,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "HolidayMenuVariant_holidayMenuId_fkey" FOREIGN KEY ("holidayMenuId") REFERENCES "HolidayMenu"("id") ON DELETE CASCADE ON UPDATE CASCADE
        )
      `
      results.push('Tabella HolidayMenuVariant creata')
    } else {
      results.push('Tabella HolidayMenuVariant già esistente')
    }

    // Crea la tabella HolidayMenuItemVariant se non esiste
    if (!tableNames.includes('holidaymenuitemvariant')) {
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS "HolidayMenuItemVariant" (
          "id" SERIAL PRIMARY KEY,
          "variantId" INTEGER NOT NULL,
          "name" TEXT NOT NULL,
          "ingredients" TEXT[],
          "price" DOUBLE PRECISION NOT NULL,
          "imageUrl" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "HolidayMenuItemVariant_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "HolidayMenuVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE
        )
      `
      results.push('Tabella HolidayMenuItemVariant creata')
    } else {
      results.push('Tabella HolidayMenuItemVariant già esistente')
    }

    return NextResponse.json({
      success: true,
      message: 'Database inizializzato con successo',
      results
    })
  } catch (error) {
    console.error('Error initializing database:', error)
    const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto'
    
    return NextResponse.json(
      {
        error: 'Errore nell\'inizializzazione del database',
        details: errorMessage
      },
      { status: 500 }
    )
  }
}



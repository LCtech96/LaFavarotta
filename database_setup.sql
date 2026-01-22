-- ============================================
-- SCRIPT SQL COMPLETO PER IL DATABASE
-- La Favarotta - Setup Database
-- ============================================

-- ============================================
-- PARTE 1: CREAZIONE TABELLE
-- ============================================

-- CreateTable: Category
CREATE TABLE IF NOT EXISTS "Category" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable: MenuItem
CREATE TABLE IF NOT EXISTS "MenuItem" (
    "id" SERIAL NOT NULL,
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
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MenuItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable: CartItem
CREATE TABLE IF NOT EXISTS "CartItem" (
    "id" TEXT NOT NULL,
    "menuItemId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CartItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Customization
CREATE TABLE IF NOT EXISTS "Customization" (
    "id" TEXT NOT NULL,
    "cartItemId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "ingredient" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Customization_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Staff
CREATE TABLE IF NOT EXISTS "Staff" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Admin
CREATE TABLE IF NOT EXISTS "Admin" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Content
CREATE TABLE IF NOT EXISTS "Content" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Content_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Post
CREATE TABLE IF NOT EXISTS "Post" (
    "id" SERIAL NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "title" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable: HolidayMenu
CREATE TABLE IF NOT EXISTS "HolidayMenu" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "previewImage" TEXT,
    "menuText" TEXT,
    "menuPrice" DOUBLE PRECISION,
    "menuImages" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HolidayMenu_pkey" PRIMARY KEY ("id")
);

-- CreateTable: HolidayMenuVariant
CREATE TABLE IF NOT EXISTS "HolidayMenuVariant" (
    "id" SERIAL NOT NULL,
    "holidayMenuId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "menuText" TEXT,
    "menuPrice" DOUBLE PRECISION,
    "menuImages" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HolidayMenuVariant_pkey" PRIMARY KEY ("id")
);

-- CreateTable: HolidayMenuItemVariant
CREATE TABLE IF NOT EXISTS "HolidayMenuItemVariant" (
    "id" SERIAL NOT NULL,
    "variantId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "ingredients" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "price" DOUBLE PRECISION NOT NULL,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HolidayMenuItemVariant_pkey" PRIMARY KEY ("id")
);

-- CreateTable: HolidayMenuItem
CREATE TABLE IF NOT EXISTS "HolidayMenuItem" (
    "id" SERIAL NOT NULL,
    "holidayMenuId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "ingredients" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "price" DOUBLE PRECISION NOT NULL,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HolidayMenuItem_pkey" PRIMARY KEY ("id")
);

-- ============================================
-- PARTE 2: CREAZIONE INDICI UNICI
-- ============================================

CREATE UNIQUE INDEX IF NOT EXISTS "Admin_email_key" ON "Admin"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "Content_key_key" ON "Content"("key");
CREATE UNIQUE INDEX IF NOT EXISTS "HolidayMenu_name_key" ON "HolidayMenu"("name");

-- ============================================
-- PARTE 3: CREAZIONE FOREIGN KEYS
-- ============================================

-- AddForeignKey: MenuItem -> Category
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'MenuItem_categoryId_fkey'
    ) THEN
        ALTER TABLE "MenuItem" 
        ADD CONSTRAINT "MenuItem_categoryId_fkey" 
        FOREIGN KEY ("categoryId") 
        REFERENCES "Category"("id") 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey: Customization -> CartItem
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'Customization_cartItemId_fkey'
    ) THEN
        ALTER TABLE "Customization" 
        ADD CONSTRAINT "Customization_cartItemId_fkey" 
        FOREIGN KEY ("cartItemId") 
        REFERENCES "CartItem"("id") 
        ON DELETE CASCADE 
        ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey: HolidayMenuVariant -> HolidayMenu
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'HolidayMenuVariant_holidayMenuId_fkey'
    ) THEN
        ALTER TABLE "HolidayMenuVariant" 
        ADD CONSTRAINT "HolidayMenuVariant_holidayMenuId_fkey" 
        FOREIGN KEY ("holidayMenuId") 
        REFERENCES "HolidayMenu"("id") 
        ON DELETE CASCADE 
        ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey: HolidayMenuItemVariant -> HolidayMenuVariant
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'HolidayMenuItemVariant_variantId_fkey'
    ) THEN
        ALTER TABLE "HolidayMenuItemVariant" 
        ADD CONSTRAINT "HolidayMenuItemVariant_variantId_fkey" 
        FOREIGN KEY ("variantId") 
        REFERENCES "HolidayMenuVariant"("id") 
        ON DELETE CASCADE 
        ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey: HolidayMenuItem -> HolidayMenu
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'HolidayMenuItem_holidayMenuId_fkey'
    ) THEN
        ALTER TABLE "HolidayMenuItem" 
        ADD CONSTRAINT "HolidayMenuItem_holidayMenuId_fkey" 
        FOREIGN KEY ("holidayMenuId") 
        REFERENCES "HolidayMenu"("id") 
        ON DELETE CASCADE 
        ON UPDATE CASCADE;
    END IF;
END $$;

-- ============================================
-- PARTE 4: ELIMINAZIONE VECCHIE CATEGORIE
-- ============================================

-- Elimina le vecchie categorie se esistono
DELETE FROM "Category" WHERE "name" IN (
    'Antipasti',
    'Primi',
    'Secondi',
    'Contorni',
    'Pizze',
    'Dolci',
    'Bevande',
    'Vini bianchi',
    'Vini rossi'
);

-- ============================================
-- PARTE 5: INSERIMENTO NUOVE CATEGORIE
-- ============================================

-- Inserisce le nuove categorie con i rispettivi ordini
INSERT INTO "Category" ("name", "order", "description", "createdAt", "updatedAt") VALUES
('Street Food', 0, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Arancine', 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Antipasti', 2, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Tavola Calda', 3, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Insalate', 4, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Bruschette', 5, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Primi a Forno', 6, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Secondi', 7, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Pizze', 8, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Schiacciate', 9, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Panini e Hamburger', 10, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Panini Classici Piastrati', 11, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Dessert', 12, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Bibite', 13, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Birre', 14, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

-- ============================================
-- FINE SCRIPT
-- ============================================

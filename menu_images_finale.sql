-- ============================================
-- MENU IMAGES - SCRIPT SQL FINALE
-- ============================================
-- Esegui questo script su Supabase per:
-- 1. Rimuovere tutte le immagini attualmente caricate
-- 2. Lasciare il database pronto per nuove immagini
--
-- L'admin potrà poi caricare nuove immagini dal pannello,
-- oppure usa lo script Node: node scripts/load-menu-images.mjs
-- (dopo aver messo le immagini in menu-images-to-load/)
-- ============================================

-- STEP 1: Rimuovi tutte le immagini dei menu items dalla tabella Content
DELETE FROM "Content"
WHERE "key" LIKE 'menu_item_image_%';

-- STEP 2: (Opzionale) Pulisci anche imageUrl nella tabella MenuItem
UPDATE "MenuItem"
SET "imageUrl" = NULL
WHERE "imageUrl" IS NOT NULL;

-- Verifica: conta le immagini rimanenti (dovrebbe essere 0)
SELECT COUNT(*) as immagini_menu_item_rimaste
FROM "Content"
WHERE "key" LIKE 'menu_item_image_%';

-- ============================================
-- NOTE:
-- - Dopo questo script, il sito mostrerà i piatti senza immagine
-- - L'admin può caricare nuove immagini dal pannello /admin/images
-- - Oppure: metti le immagini in menu-images-to-load/ (1.jpg, 2.png, 101.jpg...)
--   e esegui: node scripts/load-menu-images.mjs
-- ============================================

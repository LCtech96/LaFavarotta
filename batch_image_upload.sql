-- ============================================
-- BATCH IMAGE UPLOAD SQL QUERY
-- ============================================
-- Questa query permette di inserire/aggiornare multiple immagini
-- dei menu items in una singola transazione, evitando problemi
-- di connection pooler quando si caricano molte immagini velocemente.
--
-- USO:
-- 1. Sostituisci [ITEM_ID] con l'ID del menu item
-- 2. Sostituisci [BASE64_IMAGE_DATA] con l'immagine in formato base64
--    (es: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...')
-- 3. Esegui la query per ogni immagine che vuoi caricare
--
-- NOTA: Per caricare molte immagini, usa una transazione BEGIN/COMMIT
-- ============================================

-- Inizia una transazione per caricare multiple immagini
BEGIN;

-- Esempio 1: Inserisci/aggiorna immagine per menu item ID 1
INSERT INTO "Content" ("id", "key", "value", "type", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid()::text,
  'menu_item_image_1',
  'data:image/jpeg;base64,[BASE64_IMAGE_DATA_QUI]',
  'image',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT ("key") 
DO UPDATE SET 
  "value" = EXCLUDED."value",
  "updatedAt" = CURRENT_TIMESTAMP;

-- Esempio 2: Inserisci/aggiorna immagine per menu item ID 2
INSERT INTO "Content" ("id", "key", "value", "type", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid()::text,
  'menu_item_image_2',
  'data:image/jpeg;base64,[BASE64_IMAGE_DATA_QUI]',
  'image',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT ("key") 
DO UPDATE SET 
  "value" = EXCLUDED."value",
  "updatedAt" = CURRENT_TIMESTAMP;

-- Aggiungi più INSERT qui per altre immagini...

-- Opzionale: Aggiorna anche la tabella MenuItem per retrocompatibilità
UPDATE "MenuItem" 
SET "imageUrl" = (
  SELECT "value" FROM "Content" 
  WHERE "key" = 'menu_item_image_' || "MenuItem"."id"::text
)
WHERE EXISTS (
  SELECT 1 FROM "Content" 
  WHERE "key" = 'menu_item_image_' || "MenuItem"."id"::text
);

-- Committa la transazione
COMMIT;

-- ============================================
-- QUERY ALTERNATIVA: Usa una funzione per batch insert
-- ============================================

-- Crea una funzione helper per batch insert (opzionale)
CREATE OR REPLACE FUNCTION batch_insert_menu_images(
  images JSONB
) RETURNS INTEGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  img JSONB;
  inserted_count INTEGER := 0;
BEGIN
  FOR img IN SELECT * FROM jsonb_array_elements(images)
  LOOP
    INSERT INTO "Content" ("id", "key", "value", "type", "createdAt", "updatedAt")
    VALUES (
      gen_random_uuid()::text,
      'menu_item_image_' || (img->>'itemId'),
      img->>'imageUrl',
      'image',
      CURRENT_TIMESTAMP,
      CURRENT_TIMESTAMP
    )
    ON CONFLICT ("key") 
    DO UPDATE SET 
      "value" = EXCLUDED."value",
      "updatedAt" = CURRENT_TIMESTAMP;
    
    inserted_count := inserted_count + 1;
  END LOOP;
  
  RETURN inserted_count;
END;
$$;

-- Esempio di uso della funzione:
-- SELECT batch_insert_menu_images('[
--   {"itemId": 1, "imageUrl": "data:image/jpeg;base64,..."},
--   {"itemId": 2, "imageUrl": "data:image/jpeg;base64,..."},
--   {"itemId": 3, "imageUrl": "data:image/jpeg;base64,..."}
-- ]'::jsonb);

-- ============================================
-- QUERY PER VERIFICARE LE IMMAGINI CARICATE
-- ============================================

-- Conta quante immagini sono state caricate
SELECT COUNT(*) as total_images
FROM "Content"
WHERE "key" LIKE 'menu_item_image_%';

-- Lista tutte le immagini caricate con i loro itemId
SELECT 
  "key",
  SUBSTRING("key" FROM 'menu_item_image_(\d+)')::INTEGER as item_id,
  LENGTH("value") as image_size_bytes,
  "updatedAt"
FROM "Content"
WHERE "key" LIKE 'menu_item_image_%'
ORDER BY item_id;

-- ============================================
-- QUERY PER PULIRE TUTTE LE IMMAGINI (ATTENZIONE!)
-- ============================================

-- DELETE FROM "Content" WHERE "key" LIKE 'menu_item_image_%';

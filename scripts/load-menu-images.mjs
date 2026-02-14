#!/usr/bin/env node
/**
 * Script per caricare immagini del menu dalla cartella menu-images-to-load/
 * 
 * STRUTTURA CARTELLA:
 *   menu-images-to-load/
 *     1.jpg      -> immagine per menu item id 1
 *     2.png      -> immagine per menu item id 2
 *     101.jpg    -> immagine per menu item id 101
 *     ...
 * 
 * I file devono essere nominati con l'ID del piatto (come in menu-data.ts)
 * Formati supportati: .jpg, .jpeg, .png, .webp
 * 
 * USO:
 *   1. Metti le immagini nella cartella menu-images-to-load/
 *   2. Assicurati che DATABASE_URL sia nel .env
 *   3. Esegui: node scripts/load-menu-images.mjs
 * 
 * Lo script:
 *   - Rimuove le immagini attualmente nel DB (Content con key menu_item_image_*)
 *   - Inserisce le nuove immagini dalla cartella
 *   - Aggiorna anche MenuItem.imageUrl per retrocompatibilità
 */

import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { PrismaClient } from '@prisma/client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const IMAGES_DIR = join(__dirname, '..', 'menu-images-to-load');
const SUPPORTED_EXT = ['.jpg', '.jpeg', '.png', '.webp'];

async function main() {
  // Carica .env
  try {
    const dotenv = await import('dotenv');
    dotenv.config({ path: join(__dirname, '..', '.env') });
    dotenv.config({ path: join(__dirname, '..', '.env.local') });
  } catch (_) {}

  if (!process.env.DATABASE_URL) {
    console.error('ERRORE: DATABASE_URL non trovato nel .env');
    process.exit(1);
  }

  if (!existsSync(IMAGES_DIR)) {
    console.error(`ERRORE: Cartella non trovata: ${IMAGES_DIR}`);
    console.log('Crea la cartella e aggiungi le immagini (es: 1.jpg, 2.png, 101.jpg)');
    process.exit(1);
  }

  const files = readdirSync(IMAGES_DIR);
  const imageFiles = files.filter(f => SUPPORTED_EXT.includes(extname(f).toLowerCase()));

  if (imageFiles.length === 0) {
    console.log('Nessuna immagine trovata in', IMAGES_DIR);
    console.log('Aggiungi file come 1.jpg, 2.png, 101.jpg (nome = id piatto)');
    process.exit(0);
  }

  const prisma = new PrismaClient();

  try {
    // 1. Rimuovi immagini esistenti
    console.log('Rimozione immagini esistenti dal database...');
    const deleted = await prisma.content.deleteMany({
      where: { key: { startsWith: 'menu_item_image_' } }
    });
    console.log(`  Rimosse ${deleted.count} immagini esistenti`);

    // 2. Carica e inserisci nuove immagini
    const toInsert = [];

    for (const file of imageFiles) {
      const baseName = file.replace(extname(file), '');
      const itemId = parseInt(baseName, 10);
      if (isNaN(itemId) || itemId < 1) {
        console.warn(`  Salto ${file}: nome non valido (deve essere numero, es: 1.jpg)`);
        continue;
      }

      const filePath = join(IMAGES_DIR, file);
      const buffer = readFileSync(filePath);
      const ext = extname(file).toLowerCase();
      const mime = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
      const base64 = `data:${mime};base64,${buffer.toString('base64')}`;

      toInsert.push({ itemId, base64 });
    }

    if (toInsert.length === 0) {
      console.log('Nessuna immagine valida da inserire.');
      await prisma.$disconnect();
      return;
    }

    // Inserisci in transazione
    console.log(`Inserimento di ${toInsert.length} immagini...`);

    await prisma.$transaction(async (tx) => {
      for (const { itemId, base64 } of toInsert) {
        const key = `menu_item_image_${itemId}`;
        await tx.content.upsert({
          where: { key },
          update: { value: base64, type: 'image', updatedAt: new Date() },
          create: { key, value: base64, type: 'image' }
        });

        // Aggiorna MenuItem se esiste
        try {
          await tx.menuItem.updateMany({
            where: { id: itemId },
            data: { imageUrl: base64 }
          });
        } catch (_) {}
      }
    });

    console.log(`  Inserite ${toInsert.length} immagini con successo.`);
    toInsert.forEach(({ itemId }) => console.log(`    - menu_item_image_${itemId}`));

  } catch (err) {
    console.error('Errore:', err.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

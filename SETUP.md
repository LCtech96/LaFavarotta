# Istruzioni di Setup

## Immagini Richieste

Aggiungi le seguenti immagini nella cartella `public/`:

1. **cover-image.jpg** - Immagine di copertina (prima immagine)
   - Dimensioni consigliate: 1200x400px o superiore
   - Formato: JPG o PNG

2. **profile-image.jpg** - Immagine profilo (seconda immagine)
   - Dimensioni consigliate: 400x400px (quadrata)
   - Formato: JPG o PNG
   - Verrà visualizzata come cerchio

Dopo aver aggiunto le immagini, decommenta il codice in `components/home-hero.tsx` per utilizzarle.

## Database Neon

1. Crea un account su [Neon](https://neon.tech)
2. Crea un nuovo progetto
3. Copia la connection string
4. Aggiungila al file `.env` come `DATABASE_URL`

## Menu Completo

Il file `data/menu-data.ts` contiene tutti i piatti principali. Se vuoi aggiungere più pizze o altri piatti, modifica il file seguendo lo stesso formato.

## Variabili d'Ambiente

Assicurati di avere tutte le variabili d'ambiente configurate nel file `.env`:

```env
DATABASE_URL="..."
NEXT_PUBLIC_WHATSAPP_NUMBER="+393276976442"
NEXT_PUBLIC_EMAIL="lafavarotta@gmail.com"
NEXT_PUBLIC_FACEBOOK_URL="https://www.facebook.com/ristorantelaFavarottaterrasini/?locale=it_IT"
NEXT_PUBLIC_INSTAGRAM_URL="https://www.instagram.com/la_favarotta_ristorante_terras"
NEXT_PUBLIC_MAPS_URL="https://maps.app.goo.gl/jbR99NEc53czT4Hj6"
```

## Primi Passi

1. Installa le dipendenze: `pnpm install`
2. Configura il database: `pnpm prisma generate`
3. Aggiungi le immagini in `public/`
4. Avvia il server: `pnpm dev`




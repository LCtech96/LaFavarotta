# La Favarotta - Sito Web Ristorante

Sito web per il Ristorante La Favarotta a Terrasini, Palermo. Realizzato con Next.js, TypeScript e database Neon.

## Caratteristiche

- 🎨 Design responsive (mobile e desktop)
- 🍽️ Menu completo con 9 categorie
- 🛒 Sistema carrello con personalizzazione piatti
- 📱 Ordini via WhatsApp (al tavolo e da asporto)
- 🌙 Modalità dark/light
- 📍 Integrazione Google Maps
- 👥 Pagina "Chi siamo" con staff

## Tecnologie

- **Next.js 14** - Framework React
- **TypeScript** - Tipizzazione statica
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **Prisma** - ORM per database
- **Neon** - Database PostgreSQL serverless

## Installazione

1. Clona il repository
```bash
git clone <repository-url>
cd LaFavarotta
```

2. Installa le dipendenze con pnpm
```bash
pnpm install
```

3. Configura le variabili d'ambiente
Crea un file `.env` nella root del progetto copiando da `env.example`:
```bash
cp env.example .env
```

Oppure crea manualmente il file `.env` con:
```env
DATABASE_URL="postgresql://neondb_owner:npg_o2iTpUByG3Wn@ep-crimson-king-a4292tbj-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
NEXT_PUBLIC_WHATSAPP_NUMBER="+393276976442"
NEXT_PUBLIC_EMAIL="lafavarotta@gmail.com"
NEXT_PUBLIC_FACEBOOK_URL="https://www.facebook.com/ristorantelaFavarottaterrasini/?locale=it_IT"
NEXT_PUBLIC_INSTAGRAM_URL="https://www.instagram.com/la_favarotta_ristorante_terras"
NEXT_PUBLIC_MAPS_URL="https://maps.app.goo.gl/jbR99NEc53czT4Hj6"
```

4. Configura il database Neon
```bash
# Inizializza neonctl (interattivo)
npx neonctl@latest init

# Genera il client Prisma
pnpm prisma generate

# (Opzionale) Push dello schema al database
pnpm prisma db push
```

Vedi `NEON_SETUP.md` per maggiori dettagli sul setup del database Neon.

5. Aggiungi le immagini
Aggiungi le seguenti immagini nella cartella `public/`:
- `cover-image.jpg` - Immagine di copertina (prima immagine)
- `profile-image.jpg` - Immagine profilo (seconda immagine)

6. Avvia il server di sviluppo
```bash
pnpm dev
```

Apri [http://localhost:3000](http://localhost:3000) nel browser.

## Struttura del Progetto

```
LaFavarotta/
├── app/                    # Pagine Next.js
│   ├── page.tsx           # Homepage
│   ├── menu/              # Pagina menu
│   ├── carrello/          # Pagina carrello
│   ├── chi-siamo/         # Pagina chi siamo
│   └── maps/              # Redirect a Google Maps
├── components/            # Componenti React
│   ├── navigation.tsx     # Barra di navigazione
│   ├── footer.tsx         # Footer
│   ├── menu-list.tsx      # Lista menu
│   └── ...
├── data/                  # Dati statici
│   └── menu-data.ts       # Dati del menu
├── lib/                   # Utilities
│   ├── db.ts             # Configurazione database
│   └── utils.ts          # Funzioni utility
├── store/                 # State management
│   ├── cart-store.ts     # Store carrello
│   └── theme-store.ts    # Store tema
└── prisma/               # Schema database
    └── schema.prisma
```

## Funzionalità Principali

### Menu
- Visualizzazione menu per categorie
- Filtro per categoria
- Personalizzazione piatti (aggiungi/rimuovi ingredienti)
- Selezione quantità

### Carrello
- Aggiunta/rimozione piatti
- Modifica quantità
- Personalizzazione per ogni piatto

### Ordini
- **Al Tavolo**: Ordine diretto via WhatsApp
- **Da Asporto**: Form con dati di consegna e invio via WhatsApp

### Navigazione
- **Mobile**: Navigation bar in basso
- **Desktop**: Navigation bar in alto
- Toggle dark/light mode

## Build per Produzione

```bash
pnpm build
pnpm start
```

## Note

- Assicurati di avere le immagini `cover-image.jpg` e `profile-image.jpg` nella cartella `public/`
- Configura correttamente il database Neon nel file `.env`
- Il numero WhatsApp e gli altri contatti sono configurabili tramite variabili d'ambiente

## Crediti

Creato da [Facevoice.ai](https://facevoice.ai/ai-chat)


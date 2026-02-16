# Quick Start Guide

## ✅ Repository GitHub
Il codice è stato pushato su: https://github.com/LCtech96/Mancia e statti zitto da Sasà.git

## 🔧 Setup Locale

### 1. Clona il repository (se necessario)
```bash
git clone https://github.com/LCtech96/Mancia e statti zitto da Sasà.git
cd Mancia e statti zitto da Sasà
```

### 2. Installa le dipendenze
```bash
pnpm install
```

### 3. Configura le variabili d'ambiente
Crea un file `.env` nella root del progetto con questa connection string:

```env
DATABASE_URL="postgresql://neondb_owner:npg_o2iTpUByG3Wn@ep-crimson-king-a4292tbj-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
NEXT_PUBLIC_WHATSAPP_NUMBER="+393792675864"
NEXT_PUBLIC_EMAIL="Mancia e statti zitto da Sasà@gmail.com"
NEXT_PUBLIC_FACEBOOK_URL="https://www.facebook.com/ristoranteMancia e statti zitto da Sasàterrasini/?locale=it_IT"
NEXT_PUBLIC_INSTAGRAM_URL="https://www.instagram.com/Mancia e statti zitto da Sasà_ristorante_terras"
NEXT_PUBLIC_MAPS_URL="https://maps.app.goo.gl/jbR99NEc53czT4Hj6"
```

### 4. Configura neonctl (opzionale, per gestione database)
```bash
npx neonctl@latest init
```
Segui le istruzioni interattive per configurare neonctl con il tuo account Neon.

### 5. Genera il client Prisma
```bash
pnpm prisma generate
```

### 6. (Opzionale) Push dello schema al database
Se vuoi creare le tabelle nel database Neon:
```bash
pnpm prisma db push
```

**Nota:** Attualmente i dati del menu sono statici in `data/menu-data.ts`, quindi il database non è strettamente necessario per il funzionamento base del sito.

### 7. Aggiungi le immagini
Aggiungi nella cartella `public/`:
- `cover-image.jpg` - Immagine di copertina
- `profile-image.jpg` - Immagine profilo

Poi decommenta il codice in `components/home-hero.tsx`.

### 8. Avvia il server di sviluppo
```bash
pnpm dev
```

Apri [http://localhost:3000](http://localhost:3000) nel browser.

## 📝 Note Importanti

- ⚠️ **NON fare deploy ancora** - come richiesto
- Il file `.env` è già nel `.gitignore` e non verrà pushato
- La connection string del database è già configurata in `env.example`
- Tutti i file sono stati pushati su GitHub

## 🚀 Prossimi Passi (quando sarai pronto)

1. Aggiungi le immagini reali
2. Completa il menu se necessario
3. Testa tutte le funzionalità
4. Quando pronto, fai deploy su Vercel o altro servizio










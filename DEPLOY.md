# Guida al Deploy su Vercel

## ✅ Pre-Deploy Checklist

- [x] Build locale completato con successo
- [x] API routes create per le immagini
- [x] Database Neon configurato
- [x] Variabili d'ambiente documentate

## 🚀 Deploy su Vercel

### Opzione 1: Deploy tramite Vercel CLI (Consigliato)

1. **Installa Vercel CLI** (se non già installato):
```bash
npm i -g vercel
```

2. **Login a Vercel**:
```bash
vercel login
```

3. **Deploy**:
```bash
vercel
```

4. **Deploy in produzione**:
```bash
vercel --prod
```

### Opzione 2: Deploy tramite GitHub Integration

1. **Push del codice su GitHub** (se non già fatto):
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

2. **Connetti il repository a Vercel**:
   - Vai su [vercel.com](https://vercel.com)
   - Clicca su "Add New Project"
   - Importa il repository GitHub
   - Vercel rileverà automaticamente Next.js

3. **Configura le variabili d'ambiente**:
   Nelle impostazioni del progetto su Vercel, aggiungi tutte le variabili d'ambiente:

   ```
   DATABASE_URL=postgresql://neondb_owner:npg_o2iTpUByG3Wn@ep-crimson-king-a4292tbj-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
   NEXT_PUBLIC_WHATSAPP_NUMBER=+393792675864
   NEXT_PUBLIC_EMAIL=Mancia e statti zitto da Sasà@gmail.com
   NEXT_PUBLIC_FACEBOOK_URL=https://www.facebook.com/ristoranteMancia e statti zitto da Sasàterrasini/?locale=it_IT
   NEXT_PUBLIC_INSTAGRAM_URL=https://www.instagram.com/Mancia e statti zitto da Sasà_ristorante_terras
   NEXT_PUBLIC_MAPS_URL=https://maps.app.goo.gl/jbR99NEc53czT4Hj6
   ```

4. **Deploy automatico**:
   - Vercel farà il deploy automaticamente ad ogni push su `main`
   - Il primo deploy potrebbe richiedere alcuni minuti

## ⚙️ Configurazione Vercel

Il file `vercel.json` è già configurato con:
- Build command: `pnpm run build`
- Install command: `pnpm install`
- Framework: Next.js
- Region: `iad1` (US East)

## 🔧 Variabili d'Ambiente su Vercel

**IMPORTANTE**: Aggiungi tutte le variabili d'ambiente nel dashboard Vercel:

1. Vai su **Project Settings** → **Environment Variables**
2. Aggiungi ogni variabile:
   - `DATABASE_URL` (sensitive, non pubblica)
   - `NEXT_PUBLIC_WHATSAPP_NUMBER`
   - `NEXT_PUBLIC_EMAIL`
   - `NEXT_PUBLIC_FACEBOOK_URL`
   - `NEXT_PUBLIC_INSTAGRAM_URL`
   - `NEXT_PUBLIC_MAPS_URL`

3. Seleziona gli ambienti (Production, Preview, Development)

## 📝 Post-Deploy

Dopo il deploy:

1. **Verifica il database**:
   - Assicurati che le tabelle siano create nel database Neon
   - Esegui `pnpm prisma db push` se necessario (o usa Prisma Studio)

2. **Testa le funzionalità**:
   - Login admin
   - Upload immagini
   - Verifica che le immagini siano visibili su tutti i dispositivi

3. **Configura il dominio personalizzato** (opzionale):
   - Vai su Project Settings → Domains
   - Aggiungi il tuo dominio

## 🐛 Troubleshooting

### Build fallisce
- Verifica che tutte le variabili d'ambiente siano configurate
- Controlla i log di build su Vercel

### Database non connesso
- Verifica che `DATABASE_URL` sia corretta
- Controlla che il database Neon sia attivo
- Verifica le impostazioni SSL nella connection string

### Immagini non caricate
- Verifica che le API routes funzionino
- Controlla i log delle API su Vercel
- Verifica che il database abbia le tabelle necessarie

## 📚 Risorse

- [Documentazione Vercel](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment)


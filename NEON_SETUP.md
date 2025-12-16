# Setup Database Neon

## Connection String

Il database Neon è già configurato. Usa questa connection string nel file `.env`:

```
DATABASE_URL="postgresql://neondb_owner:npg_o2iTpUByG3Wn@ep-crimson-king-a4292tbj-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
```

## Configurazione neonctl

1. Esegui il comando interattivo:
```bash
npx neonctl@latest init
```

2. Segui le istruzioni per configurare neonctl con il tuo account Neon.

3. Verifica la connessione:
```bash
npx neonctl@latest projects list
```

## Setup Prisma

Dopo aver configurato il `.env` con la connection string:

1. Genera il client Prisma:
```bash
pnpm prisma generate
```

2. (Opzionale) Se vuoi creare le tabelle nel database:
```bash
pnpm prisma db push
```

Nota: Attualmente i dati del menu sono statici in `data/menu-data.ts`, quindi il database non è strettamente necessario per il funzionamento base del sito. Puoi usarlo in futuro per gestire ordini, utenti, ecc.




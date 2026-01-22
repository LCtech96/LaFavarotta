# Troubleshooting

## Errore ChunkLoadError

Se riscontri errori di tipo "ChunkLoadError: Loading chunk app/layout failed", segui questi passaggi:

### 1. Pulisci la cache di Next.js
```powershell
Remove-Item -Recurse -Force .next
```

### 2. Reinstalla le dipendenze
```bash
pnpm install
```

### 3. Genera il client Prisma
```bash
pnpm prisma generate
```

### 4. Riavvia il server di sviluppo
```bash
pnpm dev
```

## Errore di Hydration

Se vedi errori di hydration:

1. Assicurati che tutti i componenti che usano `localStorage` o `window` siano marcati con `'use client'`
2. Usa `suppressHydrationWarning` su `<html>` e `<body>` nel layout
3. Evita di accedere a `localStorage` durante il render iniziale

## Altri problemi comuni

### Porta già in uso
Se la porta 3000 è già in uso:
```bash
pnpm dev -- -p 3001
```

### Errori TypeScript
```bash
pnpm run lint
```

### Problemi con Prisma
```bash
pnpm prisma generate
pnpm prisma db push
```










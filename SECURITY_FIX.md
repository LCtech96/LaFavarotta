# 🔒 FIX SICUREZZA: Credenziali Database Esposte

## ⚠️ PROBLEMA CRITICO

Le credenziali del database sono state esposte pubblicamente su GitHub. Questo è un problema di sicurezza critico che deve essere risolto immediatamente.

## ✅ AZIONI IMMEDIATE RICHIESTE

### 1. Cambia la Password del Database su Supabase

**IMPORTANTE:** La password attuale è stata compromessa e deve essere cambiata immediatamente.

1. Vai su https://supabase.com/dashboard
2. Seleziona il tuo progetto
3. Vai su **Settings** → **Database**
4. Scorri fino a **Database Password**
5. Clicca su **Reset Database Password**
6. Genera una nuova password sicura e salvala in un posto sicuro (password manager)

### 2. Aggiorna DATABASE_URL su Vercel

Dopo aver cambiato la password su Supabase:

1. Vai su https://vercel.com/dashboard
2. Seleziona il progetto `Mancia e statti zitto da Sasà`
3. Vai su **Settings** → **Environment Variables**
4. Trova `DATABASE_URL` e aggiorna con la nuova password:

   **Transaction Pooler (Raccomandato - Porta 6543):**
   ```
   postgresql://postgres.[PROJECT_ID]:[NUOVA_PASSWORD]@aws-1-eu-central-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true
   ```

   **Session Pooler (Porta 5432):**
   ```
   postgresql://postgres.[PROJECT_ID]:[NUOVA_PASSWORD]@aws-1-eu-central-1.pooler.supabase.com:5432/postgres?sslmode=require
   ```

5. Sostituisci:
   - `[PROJECT_ID]` con il tuo Supabase Project ID
   - `[NUOVA_PASSWORD]` con la nuova password appena creata
6. Clicca su **Save**
7. **Redeploy** il progetto (Vercel Dashboard → Deployments → Redeploy)

### 3. Aggiorna .env.local Locale

Aggiorna anche il file `.env.local` locale con la nuova password:

```env
DATABASE_URL="postgresql://postgres.[PROJECT_ID]:[NUOVA_PASSWORD]@aws-1-eu-central-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true"
```

### 4. Verifica che Non Ci Siano Altre Esposizioni

Controlla la cronologia Git per assicurarti che non ci siano altre credenziali esposte:

```bash
git log --all --full-history --source -- "*.md" "*.env*" "*.example"
```

## 🛡️ PREVENZIONE FUTURA

### Best Practices

1. **Mai committare credenziali:**
   - Usa sempre variabili d'ambiente
   - Usa placeholder nei file di esempio (`env.example`)
   - Usa password manager per salvare credenziali

2. **File già protetti:**
   - `.env` e `.env*.local` sono già nel `.gitignore` ✅
   - `env.example` ora usa placeholder ✅

3. **Monitoraggio:**
   - GitGuardian (o servizi simili) monitora automaticamente il repository
   - Riceverai alert se altre credenziali vengono esposte

## 📝 Note

- Le credenziali sono state rimosse da `VERCEL_DATABASE_SETUP.md` e `env.example`
- I file ora usano placeholder `[PROJECT_ID]` e `[PASSWORD]`
- Dopo aver cambiato la password, l'applicazione dovrebbe funzionare normalmente

## ⚡ Dopo aver completato questi passaggi

1. Testa l'applicazione su Vercel
2. Verifica che il caricamento immagini funzioni
3. Controlla i log di Vercel per eventuali errori

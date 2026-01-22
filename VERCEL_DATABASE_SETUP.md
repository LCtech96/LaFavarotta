# Configurazione Database su Vercel

## ⚠️ IMPORTANTE: Aggiorna DATABASE_URL su Vercel

Per risolvere l'errore "Database non disponibile" su Vercel, devi aggiornare la variabile d'ambiente `DATABASE_URL`.

### Passaggi:

1. **Vai su Vercel Dashboard**
   - Accedi a https://vercel.com/dashboard
   - Seleziona il progetto `la-favarotta`

2. **Vai alle Environment Variables**
   - Clicca su **Settings** (Impostazioni)
   - Nel menu laterale, clicca su **Environment Variables**

3. **Aggiorna DATABASE_URL**
   - Trova la variabile `DATABASE_URL` (se esiste) o creane una nuova
   - Imposta il valore a:
     ```
     postgresql://postgres.zuxljntziebigbcmduqv:Manciaestattizitto@aws-1-eu-central-1.pooler.supabase.com:5432/postgres?sslmode=require
     ```
   - Assicurati che sia selezionata per tutti gli ambienti (Production, Preview, Development)
   - Clicca su **Save**

4. **Riavvia il Deployment**
   - Vai alla sezione **Deployments**
   - Trova l'ultimo deployment
   - Clicca sui tre puntini (...) e seleziona **Redeploy**
   - Oppure fai un nuovo push su GitHub per triggerare un nuovo deployment

### Verifica

Dopo il redeploy, verifica che:
- ✅ Il deployment sia completato con successo
- ✅ Le API funzionino correttamente (prova a modificare un piatto dall'admin)
- ✅ Non ci siano più errori "Database non disponibile"

### Note

- La connection string usa il **session pooler** di Supabase per migliori performance
- La password è: `Manciaestattizitto`
- Il Project ID è: `zuxljntziebigbcmduqv`

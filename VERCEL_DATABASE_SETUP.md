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
   - Imposta il valore a (usa il **transaction pooler** sulla porta 6543 per migliore gestione delle connessioni):
     ```
     postgresql://postgres.zuxljntziebigbcmduqv:Manciaestattizitto@aws-1-eu-central-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true
     ```
   - **Alternativa (session pooler sulla porta 5432):**
     ```
     postgresql://postgres.zuxljntziebigbcmduqv:Manciaestattizitto@aws-1-eu-central-1.pooler.supabase.com:5432/postgres?sslmode=require
     ```
   - **Raccomandato:** Usa la porta **6543** (transaction pooler) per evitare problemi di "troppe connessioni"
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

- **Raccomandato:** Usa il **transaction pooler** (porta 6543) invece del session pooler per evitare problemi di "troppe connessioni"
- Il transaction pooler è più efficiente per applicazioni serverless come Vercel
- La password è: `Manciaestattizitto`
- Il Project ID è: `zuxljntziebigbcmduqv`

### Risoluzione Problemi "Database non disponibile"

Se continui a vedere errori "Database non disponibile" dopo aver configurato DATABASE_URL:

1. **Verifica che la porta sia corretta:**
   - Porta **6543** = Transaction pooler (raccomandato per Vercel/serverless)
   - Porta **5432** = Session pooler (può avere limiti di connessione)

2. **Controlla i log di Vercel:**
   - Vai su Vercel Dashboard → Deployments → clicca sul deployment
   - Controlla i "Function Logs" per vedere errori specifici

3. **Prova a fare un redeploy:**
   - A volte Vercel ha bisogno di un redeploy completo per caricare le nuove variabili d'ambiente

4. **Verifica il piano Supabase:**
   - I piani gratuiti hanno limiti di connessione più bassi
   - Se carichi molte immagini rapidamente, potresti raggiungere il limite

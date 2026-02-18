# RLS (Row Level Security) – Fix vulnerabilità Supabase

Lo script **`enable_rls_supabase.sql`** risolve gli avvisi del linter Supabase:

- **RLS Disabled in Public**: abilita Row Level Security su tutte le tabelle `public` (Category, MenuItem, Staff, Customization, Admin, Content, Post, HolidayMenu, CartItem, HolidayMenuVariant, HolidayMenuItemVariant, HolidayMenuItem).
- **Sensitive Columns Exposed**: con RLS attivo, l’accesso diretto via API (anon/authenticated) alle tabelle viene bloccato, quindi anche la tabella `Admin` e la colonna `password` non sono più esposte.

## Come applicare

1. Apri **Supabase Dashboard** → progetto → **SQL Editor**.
2. Incolla il contenuto di `enable_rls_supabase.sql`.
3. Esegui lo script (Run).

L’app continua a funzionare perché usa **Prisma** con la connection string (pooler): quel ruolo in Supabase bypassa RLS e può leggere/scrivere come prima. Solo l’accesso diretto alle tabelle via PostgREST (anon/authenticated) viene bloccato.

## Verifica

Dopo l’esecuzione, nel SQL Editor puoi controllare che RLS sia attivo:

```sql
SELECT relname, relrowsecurity
FROM pg_class
WHERE relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  AND relkind = 'r'
  AND relname IN ('Category','MenuItem','Staff','Customization','Admin','Content','Post','HolidayMenu','CartItem','HolidayMenuVariant','HolidayMenuItemVariant','HolidayMenuItem');
```

Tutte le righe devono avere `relrowsecurity = true`.

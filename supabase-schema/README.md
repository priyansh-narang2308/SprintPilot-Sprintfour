Phase 1 — Schema + Client wiring

What I added

- `supabase-schema/001_create_personas.sql` — the SQL to create the `personas` table.
- Changes to `src/pages/persona-page.tsx` to: create, update and delete personas using the Supabase JS client (`supabase.from('personas')`). The dialog is controlled and supports editing an existing persona.

How to run the SQL

1. Open your Supabase project dashboard -> SQL Editor -> New query.
2. Paste the contents of `supabase-schema/001_create_personas.sql` and run it.

OR using the Supabase CLI (if you have it installed):

```bash
supabase db query supabase-schema/001_create_personas.sql
```

Security / RLS notes

- By default, Supabase tables may have Row Level Security (RLS) enabled. For frontend clients using the anon (publishable) key to insert/update/delete, you must either:
  - Disable RLS on the table (quick & insecure), or
  - Add RLS policies that permit the operations for authenticated users only (recommended).

Quick permissive policy examples (not for production):

- "Allow inserts for authenticated users":
  CREATE POLICY "Allow authenticated inserts" ON public.personas
  FOR INSERT USING (auth.role() = 'authenticated');

- "Allow updates/deletes for authenticated users":
  CREATE POLICY "Allow authenticated updates" ON public.personas
  FOR UPDATE USING (auth.role() = 'authenticated');
  CREATE POLICY "Allow authenticated deletes" ON public.personas
  FOR DELETE USING (auth.role() = 'authenticated');


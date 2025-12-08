-- 006_add_prd_content_column.sql
-- Ensure the `content` column exists on `prds` table. Safe to run multiple times.

alter table prds add column if not exists content text;

-- Optionally, if you'd like a default empty string instead of NULL, run:
-- alter table prds alter column content set default '';
-- update prds set content = '' where content is null;
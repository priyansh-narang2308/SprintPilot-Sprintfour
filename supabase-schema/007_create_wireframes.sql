
create table if not exists wireframes (
    id uuid primary key default gen_random_uuid (),
    workspace_id uuid references workspaces (id) on delete cascade,
    prd_id uuid references prds (id) on delete set null,
    title text not null,
    description text,
    content jsonb not null default '{"elements":[],"zoom":100}',
    status text default 'draft',
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);


create index if not exists idx_wireframes_workspace_id on wireframes (workspace_id);

create index if not exists idx_wireframes_prd_id on wireframes (prd_id);

create index if not exists idx_wireframes_created_at on wireframes (created_at);


create or replace function update_wireframes_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger wireframes_updated_at_trigger
before update on wireframes
for each row
execute function update_wireframes_updated_at();

create table if not exists workspaces (
    id uuid primary key default gen_random_uuid (),
    user_id uuid references auth.users (id) on delete cascade,
    name text not null,
    created_at timestamptz default now()
);


alter table if exists prds
add column if not exists workspace_id uuid references workspaces (id) on delete set null;


create index if not exists idx_prds_workspace_id on prds (workspace_id);


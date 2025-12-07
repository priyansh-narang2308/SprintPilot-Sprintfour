create table if not exists prds (
    id uuid primary key default gen_random_uuid (),
    user_id uuid references auth.users (id) on delete set null,
    title text not null,
    description text,
    content text,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

create table if not exists prd_sections (
    id uuid primary key default gen_random_uuid (),
    prd_id uuid references prds (id) on delete cascade,
    title text not null,
    content text default '',
    "order" int default 0,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

create index if not exists idx_prd_sections_prd_id on prd_sections (prd_id);
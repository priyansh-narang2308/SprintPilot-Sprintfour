
create table if not exists api_keys (
    id uuid primary key default gen_random_uuid (),
    user_id uuid references auth.users (id) on delete cascade,
    key text not null,
    created_at timestamptz default now()
);

create index if not exists idx_api_keys_user_id on api_keys (user_id);
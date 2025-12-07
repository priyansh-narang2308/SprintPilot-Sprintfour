
create table if not exists tasks (
    id uuid primary key default gen_random_uuid(),
    workspace_id uuid references workspaces (id) on delete cascade,
    user_id uuid references auth.users (id) on delete cascade,
    title text not null,
    description text,
    status text not null default 'backlog' check (status in ('backlog', 'todo', 'in_progress', 'done')),
    priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
    assignee text,
    tags text[] default '{}',
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Indexes for performance
create index if not exists idx_tasks_workspace_id on tasks (workspace_id);
create index if not exists idx_tasks_user_id on tasks (user_id);
create index if not exists idx_tasks_status on tasks (status);
create index if not exists idx_tasks_created_at on tasks (created_at desc);

-- Function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Trigger to automatically update updated_at
create trigger update_tasks_updated_at
    before update on tasks
    for each row
    execute function update_updated_at_column();


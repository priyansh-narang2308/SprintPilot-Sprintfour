DROP TABLE IF EXISTS public.competitors CASCADE;

CREATE TABLE IF NOT EXISTS public.competitors (
  id bigserial PRIMARY KEY,
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  pricing text,
  website_url text,
  strengths text[] DEFAULT ARRAY[]::text[],
  weaknesses text[] DEFAULT ARRAY[]::text[],
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(workspace_id, name)
);

CREATE INDEX idx_competitors_workspace_id ON public.competitors (workspace_id);

CREATE INDEX idx_competitors_user_id ON public.competitors (user_id);

ALTER TABLE public.competitors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view competitors of their workspaces" ON public.competitors FOR
SELECT USING (
        user_id = auth.uid ()
        OR workspace_id IN (
            SELECT id
            FROM public.workspaces
            WHERE
                user_id = auth.uid ()
        )
    );

CREATE POLICY "Users can insert competitors for their workspaces" ON public.competitors FOR
INSERT
WITH
    CHECK (
        user_id = auth.uid ()
        AND workspace_id IN (
            SELECT id
            FROM public.workspaces
            WHERE
                user_id = auth.uid ()
        )
    );

CREATE POLICY "Users can update competitors of their workspaces" ON public.competitors FOR
UPDATE USING (
    user_id = auth.uid ()
    OR workspace_id IN (
        SELECT id
        FROM public.workspaces
        WHERE
            user_id = auth.uid ()
    )
)
WITH
    CHECK (
        user_id = auth.uid ()
        OR workspace_id IN (
            SELECT id
            FROM public.workspaces
            WHERE
                user_id = auth.uid ()
        )
    );

CREATE POLICY "Users can delete competitors of their workspaces" ON public.competitors FOR DELETE USING (
    user_id = auth.uid ()
    OR workspace_id IN (
        SELECT id
        FROM public.workspaces
        WHERE
            user_id = auth.uid ()
    )
);
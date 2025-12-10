
DROP TABLE IF EXISTS public.roadmap_features CASCADE;

DROP TABLE IF EXISTS public.roadmaps CASCADE;


CREATE TABLE IF NOT EXISTS public.roadmaps (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
    workspace_id uuid NOT NULL REFERENCES public.workspaces (id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
    title text NOT NULL DEFAULT 'Product Roadmap',
    description text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE (workspace_id)
);


CREATE TABLE IF NOT EXISTS public.roadmap_features (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  roadmap_id uuid NOT NULL REFERENCES public.roadmaps(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'now' CHECK (status IN ('now', 'next', 'later')),
  priority text NOT NULL DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High')),
  owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  tags text[] DEFAULT ARRAY[]::text[],
  position integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);


CREATE INDEX idx_roadmaps_workspace_id ON public.roadmaps (workspace_id);

CREATE INDEX idx_roadmaps_user_id ON public.roadmaps (user_id);

CREATE INDEX idx_roadmap_features_roadmap_id ON public.roadmap_features (roadmap_id);

CREATE INDEX idx_roadmap_features_workspace_id ON public.roadmap_features (workspace_id);

CREATE INDEX idx_roadmap_features_status ON public.roadmap_features (status);

CREATE INDEX idx_roadmap_features_position ON public.roadmap_features (position);


ALTER TABLE public.roadmaps ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.roadmap_features ENABLE ROW LEVEL SECURITY;


CREATE POLICY "Users can view roadmaps of their workspaces" ON public.roadmaps FOR
SELECT USING (
        user_id = auth.uid ()
        OR workspace_id IN (
            SELECT id
            FROM public.workspaces
            WHERE
                user_id = auth.uid ()
        )
    );

CREATE POLICY "Users can create roadmaps for their workspaces" ON public.roadmaps FOR
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

CREATE POLICY "Users can update their roadmaps" ON public.roadmaps FOR
UPDATE USING (user_id = auth.uid ())
WITH
    CHECK (user_id = auth.uid ());

CREATE POLICY "Users can delete their roadmaps" ON public.roadmaps FOR DELETE USING (user_id = auth.uid ());


CREATE POLICY "Users can view features in their roadmaps" ON public.roadmap_features FOR
SELECT USING (
        user_id = auth.uid ()
        OR workspace_id IN (
            SELECT id
            FROM public.workspaces
            WHERE
                user_id = auth.uid ()
        )
    );

CREATE POLICY "Users can create features in their roadmaps" ON public.roadmap_features FOR
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
        AND roadmap_id IN (
            SELECT id
            FROM public.roadmaps
            WHERE
                workspace_id = public.roadmap_features.workspace_id
                AND user_id = auth.uid ()
        )
    );

CREATE POLICY "Users can update their features" ON public.roadmap_features FOR
UPDATE USING (user_id = auth.uid ())
WITH
    CHECK (user_id = auth.uid ());

CREATE POLICY "Users can delete their features" ON public.roadmap_features FOR DELETE USING (user_id = auth.uid ());
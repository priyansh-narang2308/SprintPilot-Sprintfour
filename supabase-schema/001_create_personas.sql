

CREATE TABLE IF NOT EXISTS public.personas (
  id bigserial PRIMARY KEY,
  name text NOT NULL,
  role text NOT NULL,
  age integer DEFAULT 0,
  avatar text,
  bio text,
  goals text[] DEFAULT ARRAY[]::text[],
  frustrations text[] DEFAULT ARRAY[]::text[],
  motivations text[] DEFAULT ARRAY[]::text[],
  behaviors text[] DEFAULT ARRAY[]::text[],
  created_at timestamptz DEFAULT now()
);

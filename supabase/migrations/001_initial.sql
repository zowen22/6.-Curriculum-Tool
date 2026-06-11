-- Units table
-- All future content tables must follow this pattern: user_id FK + RLS policy
CREATE TABLE public.units (
  id                        UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id                   UUID        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title                     TEXT        NOT NULL,
  phonics_skill             TEXT        NOT NULL,
  sequence_position         INTEGER,
  student_level             TEXT        NOT NULL CHECK (student_level IN ('beginner', 'intermediate', 'advanced')),
  language_transfer_enabled BOOLEAN     DEFAULT true NOT NULL,
  custom_vocabulary         TEXT[],
  status                    TEXT        DEFAULT 'draft' NOT NULL CHECK (status IN ('draft', 'review', 'published')),
  created_at                TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at                TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Row-level security: each user sees only their own units
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_units"
  ON public.units
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Auto-update updated_at on row change
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_units_updated_at
  BEFORE UPDATE ON public.units
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

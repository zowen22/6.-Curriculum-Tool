-- vocabulary words (one per word per unit)
CREATE TABLE public.vocabulary (
  id                        UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  unit_id                   UUID        REFERENCES public.units(id) ON DELETE CASCADE NOT NULL,
  user_id                   UUID        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  word                      TEXT        NOT NULL,
  definition                TEXT,
  image_url                 TEXT,
  difficulty_level          TEXT        CHECK (difficulty_level IN ('low', 'medium', 'high')),
  instructional_category    TEXT        DEFAULT 'core' NOT NULL CHECK (instructional_category IN ('core', 'functional', 'teacher_note')),
  language_transfer_notes   TEXT,
  order_index               INTEGER     DEFAULT 0 NOT NULL,
  created_at                TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at                TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
ALTER TABLE public.vocabulary ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_vocabulary" ON public.vocabulary FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_vocabulary_updated_at BEFORE UPDATE ON public.vocabulary FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- workbook content (one row per unit)
CREATE TABLE public.workbook_content (
  id                    UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  unit_id               UUID        REFERENCES public.units(id) ON DELETE CASCADE UNIQUE NOT NULL,
  user_id               UUID        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  lesson_introduction   TEXT,
  word_practice         TEXT[],
  phrase_practice       TEXT[],
  sentence_practice     TEXT[],
  decodable_text        TEXT,
  activities            TEXT[],
  updated_at            TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
ALTER TABLE public.workbook_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_workbook" ON public.workbook_content FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_workbook_updated_at BEFORE UPDATE ON public.workbook_content FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- teacher content (one row per unit)
CREATE TABLE public.teacher_content (
  id                        UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  unit_id                   UUID        REFERENCES public.units(id) ON DELETE CASCADE UNIQUE NOT NULL,
  user_id                   UUID        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  objective                 TEXT,
  teaching_guidance         TEXT,
  language_transfer_notes   TEXT,
  common_errors             TEXT,
  example_responses         TEXT,
  updated_at                TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
ALTER TABLE public.teacher_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_teacher" ON public.teacher_content FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_teacher_updated_at BEFORE UPDATE ON public.teacher_content FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- assessments (two rows per unit: beginner + intermediate)
CREATE TABLE public.assessments (
  id                    UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  unit_id               UUID        REFERENCES public.units(id) ON DELETE CASCADE NOT NULL,
  user_id               UUID        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  level                 TEXT        NOT NULL CHECK (level IN ('beginner', 'intermediate')),
  word_reading          TEXT[],
  phrase_reading        TEXT[],
  connected_text        TEXT,
  spelling_words        TEXT[],
  sentence_reading      TEXT[],
  dictation_sentences   TEXT[],
  application_activity  TEXT,
  updated_at            TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(unit_id, level)
);
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_assessments" ON public.assessments FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_assessments_updated_at BEFORE UPDATE ON public.assessments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

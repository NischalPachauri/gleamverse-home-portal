CREATE TABLE IF NOT EXISTS public.reading_streaks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    read_date date NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (user_id, read_date)
);

ALTER TABLE public.reading_streaks ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "rs_select_own" ON public.reading_streaks;
CREATE POLICY "rs_select_own" 
  ON public.reading_streaks 
  FOR select 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "rs_insert_own" ON public.reading_streaks;
CREATE POLICY "rs_insert_own" 
  ON public.reading_streaks 
  FOR insert 
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "rs_update_own" ON public.reading_streaks;
CREATE POLICY "rs_update_own" 
  ON public.reading_streaks 
  FOR update 
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "rs_delete_own" ON public.reading_streaks;
CREATE POLICY "rs_delete_own" 
  ON public.reading_streaks 
  FOR delete 
  USING (auth.uid() = user_id);

-- Index
CREATE INDEX IF NOT EXISTS reading_streaks_user_date_idx ON public.reading_streaks (user_id, read_date);
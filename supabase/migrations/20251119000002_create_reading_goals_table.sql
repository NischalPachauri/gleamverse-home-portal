CREATE TABLE IF NOT EXISTS public.reading_goals (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL DEFAULT auth.uid(),
    description text,
    target_books integer NOT NULL DEFAULT 1,
    completed_books integer NOT NULL DEFAULT 0,
    book_ids text[] NOT NULL DEFAULT '{}',
    deadline timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

alter table public.reading_goals enable row level security;

-- Policies
DROP POLICY IF EXISTS "rg_select_own" ON public.reading_goals;
CREATE POLICY "rg_select_own" 
  ON public.reading_goals 
  FOR select 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "rg_insert_own" ON public.reading_goals;
CREATE POLICY "rg_insert_own" 
  ON public.reading_goals 
  FOR insert 
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "rg_update_own" ON public.reading_goals;
CREATE POLICY "rg_update_own" 
  ON public.reading_goals 
  FOR update 
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "rg_delete_own" ON public.reading_goals;
CREATE POLICY "rg_delete_own" 
  ON public.reading_goals 
  FOR delete 
  USING (auth.uid() = user_id);

-- Index
CREATE INDEX IF NOT EXISTS reading_goals_user_created_idx ON public.reading_goals (user_id, created_at desc);
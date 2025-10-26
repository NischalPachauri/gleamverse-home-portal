-- Create reading_goals table
CREATE TABLE IF NOT EXISTS public.reading_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    target_books INTEGER NOT NULL DEFAULT 1,
    completed_books INTEGER NOT NULL DEFAULT 0,
    book_ids TEXT[] NOT NULL DEFAULT '{}',
    deadline TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Add RLS policies
ALTER TABLE public.reading_goals ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own reading goals
CREATE POLICY "Users can view their own reading goals" ON public.reading_goals
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own reading goals
CREATE POLICY "Users can insert their own reading goals" ON public.reading_goals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own reading goals
CREATE POLICY "Users can update their own reading goals" ON public.reading_goals
    FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can delete their own reading goals
CREATE POLICY "Users can delete their own reading goals" ON public.reading_goals
    FOR DELETE USING (auth.uid() = user_id);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS reading_goals_user_id_idx ON public.reading_goals (user_id);
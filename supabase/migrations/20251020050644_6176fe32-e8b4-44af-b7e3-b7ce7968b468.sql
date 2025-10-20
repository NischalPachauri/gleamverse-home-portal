-- Create user_library table to store books users are currently reading
CREATE TABLE IF NOT EXISTS public.user_library (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  book_id TEXT NOT NULL,
  user_session_id TEXT NOT NULL,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  current_page INTEGER DEFAULT 1,
  UNIQUE(book_id, user_session_id)
);

-- Create index for faster queries
CREATE INDEX idx_user_library_session ON public.user_library(user_session_id);
CREATE INDEX idx_user_library_book ON public.user_library(book_id);

-- Enable RLS
ALTER TABLE public.user_library ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read/write (since we're using session IDs, not auth)
CREATE POLICY "Allow public access to user_library" 
ON public.user_library 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Create storage bucket for user-uploaded books
INSERT INTO storage.buckets (id, name, public) 
VALUES ('books', 'books', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for book uploads
CREATE POLICY "Allow public read access to books" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'books');

CREATE POLICY "Allow public upload to books" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'books');

CREATE POLICY "Allow public update to books" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'books');

CREATE POLICY "Allow public delete from books" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'books');
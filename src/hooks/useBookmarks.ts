import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Bookmark {
  id: string;
  user_session_id: string;
  book_id: string;
  status?: string;
  created_at: string;
}

export function useBookmarks() {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchBookmarks();
    } else {
      setBookmarks([]);
    }
  }, [user]);

  const fetchBookmarks = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('bookmarks')
        .select('*')
        .eq('user_session_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookmarks(data || []);
    } catch (error: any) {
      console.error('Error fetching bookmarks:', error);
      toast.error('Failed to load bookmarks');
    } finally {
      setLoading(false);
    }
  };

  const addBookmark = async (book: {
    id: string;
    title: string;
    author: string;
    coverImage?: string;
  }) => {
    if (!user) {
      toast.error('Please sign in to bookmark books');
      return false;
    }

    try {
      const { error } = await supabase
        .from('bookmarks')
        .insert([{
          user_session_id: user.id,
          book_id: book.id,
          status: 'bookmarked',
        }]);

      if (error) throw error;
      
      await fetchBookmarks();
      toast.success(`Added "${book.title}" to bookmarks`);
      return true;
    } catch (error: any) {
      if (error.code === '23505') {
        toast.info('Book already in bookmarks');
      } else {
        toast.error('Failed to add bookmark');
      }
      return false;
    }
  };

  const removeBookmark = async (bookId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('user_session_id', user.id)
        .eq('book_id', bookId);

      if (error) throw error;
      
      await fetchBookmarks();
      toast.success('Removed from bookmarks');
      return true;
    } catch (error: any) {
      toast.error('Failed to remove bookmark');
      return false;
    }
  };

  const isBookmarked = (bookId: string) => {
    return bookmarks.some(bookmark => bookmark.book_id === bookId);
  };

  return {
    bookmarks,
    loading,
    addBookmark,
    removeBookmark,
    isBookmarked,
    refresh: fetchBookmarks,
  };
}

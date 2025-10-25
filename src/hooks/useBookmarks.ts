import { useState, useEffect, useCallback } from 'react';
import supabase from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const loadBookmarks = useCallback(async () => {
    if (!user) {
      setBookmarks([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_library')
        .select('book_id')
        .eq('user_id', user.id);

      if (error) throw error;

      setBookmarks(data?.map(item => item.book_id) || []);
    } catch (error) {
      console.error('Error loading bookmarks:', error);
      setBookmarks([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const addBookmark = async (bookId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('user_library')
        .insert({
          user_id: user.id,
          book_id: bookId,
          current_page: 0,
          last_read_at: new Date().toISOString(),
        });

      if (error) throw error;

      setBookmarks(prev => [...prev, bookId]);
      return true;
    } catch (error) {
      console.error('Error adding bookmark:', error);
      return false;
    }
  };

  const removeBookmark = async (bookId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('user_library')
        .delete()
        .eq('user_id', user.id)
        .eq('book_id', bookId);

      if (error) throw error;

      setBookmarks(prev => prev.filter(id => id !== bookId));
      return true;
    } catch (error) {
      console.error('Error removing bookmark:', error);
      return false;
    }
  };

  const toggleBookmark = async (bookId: string) => {
    if (bookmarks.includes(bookId)) {
      return await removeBookmark(bookId);
    } else {
      return await addBookmark(bookId);
    }
  };

  useEffect(() => {
    loadBookmarks();
  }, [loadBookmarks]);

  return {
    bookmarks,
    loading,
    addBookmark,
    removeBookmark,
    toggleBookmark,
    refreshBookmarks: loadBookmarks,
  };
}


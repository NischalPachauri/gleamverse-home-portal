import { useState, useEffect, useCallback } from 'react';
import supabase from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface BookmarkOperation {
  status: 'idle' | 'loading' | 'success' | 'error';
  error: string | null;
}

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [operationState, setOperationState] = useState<BookmarkOperation>({
    status: 'idle',
    error: null
  });
  const { user } = useAuth();

  const loadBookmarks = useCallback(async () => {
    if (!user) {
      setBookmarks([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setOperationState({ status: 'loading', error: null });
    
    try {
      // First try to load from Supabase
      const { data, error } = await supabase
        .from('user_library')
        .select('book_id')
        .eq('user_id', user.id);

      if (error) throw error;

      setBookmarks(data?.map(item => item.book_id) || []);
      setOperationState({ status: 'success', error: null });
    } catch (error: unknown) {
      console.error('Error loading bookmarks from Supabase:', error);
      
      // Fallback to local storage if Supabase fails
      try {
        const localBookmarks = JSON.parse(localStorage.getItem('gleamverse_bookmarks') || '[]');
        setBookmarks(localBookmarks);
        setOperationState({ status: 'success', error: null });
        
        // Silently sync local bookmarks to Supabase in background
        if (user && localBookmarks.length > 0) {
          localBookmarks.forEach(async (bookId: string) => {
            try {
              await supabase
                .from('user_library')
                .upsert({
                  user_id: user.id,
                  book_id: bookId,
                  current_page: 0,
                  last_read_at: new Date().toISOString(),
                });
            } catch (syncError) {
              console.error('Error syncing bookmark to Supabase:', syncError);
            }
          });
        }
      } catch (localError) {
        console.error('Error loading bookmarks from localStorage:', localError);
        setBookmarks([]);
        setOperationState({ 
          status: 'error', 
          error: (error as Error).message || 'Failed to load your bookmarks' 
        });
        
        // More user-friendly error message with retry option
        toast.error('Failed to load your bookmarks', {
          description: 'Please check your connection and try again',
          action: {
            label: 'Retry',
            onClick: () => loadBookmarks()
          }
        });
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Set up real-time subscription for bookmark changes
  useEffect(() => {
    if (!user) return;
    const subscription = supabase
      .channel('user_library_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_library',
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        console.log('Real-time update received:', payload);
        loadBookmarks();
      })
      .subscribe();
    return () => {
      subscription.unsubscribe();
    };
  }, [user, loadBookmarks]);

  const addBookmark = async (bookId: string) => {
    if (!user) return false;

    setOperationState({ status: 'loading', error: null });
    
    // Optimistically update UI
    setBookmarks(prev => [...prev, bookId]);
    
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

      setOperationState({ status: 'success', error: null });
      toast.success('Book added to your bookmarks');
      return true;
    } catch (error: unknown) {
      console.error('Error adding bookmark:', error);
      // Revert optimistic update
      setBookmarks(prev => prev.filter(id => id !== bookId));
      setOperationState({ 
        status: 'error', 
        error: (error as Error).message || 'Failed to add bookmark' 
      });
      toast.error('Failed to add bookmark. Please try again.');
      return false;
    }
  };

  const removeBookmark = async (bookId: string) => {
    if (!user) return false;

    setOperationState({ status: 'loading', error: null });
    
    // Optimistically update UI
    const previousBookmarks = [...bookmarks];
    setBookmarks(prev => prev.filter(id => id !== bookId));
    
    try {
      const { error } = await supabase
        .from('user_library')
        .delete()
        .eq('user_id', user.id)
        .eq('book_id', bookId);

      if (error) throw error;

      setOperationState({ status: 'success', error: null });
      toast.success('Book removed from your bookmarks');
      return true;
    } catch (error: unknown) {
      console.error('Error removing bookmark:', error);
      // Revert optimistic update
      setBookmarks(previousBookmarks);
      setOperationState({ 
        status: 'error', 
        error: (error as Error).message || 'Failed to remove bookmark' 
      });
      toast.error('Failed to remove bookmark. Please try again.');
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
    operationState,
    addBookmark,
    removeBookmark,
    toggleBookmark,
    refreshBookmarks: loadBookmarks,
  };
}


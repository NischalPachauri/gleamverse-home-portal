import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface ReadingHistoryEntry {
  id: string;
  user_session_id: string;
  book_id: string;
  current_page?: number;
  last_read_at?: string;
  added_at?: string;
}

export function useReadingHistory() {
  const { user } = useAuth();
  const [history, setHistory] = useState<ReadingHistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchHistory();
    } else {
      setHistory([]);
    }
  }, [user]);

  const fetchHistory = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_library')
        .select('*')
        .eq('user_session_id', user.id)
        .order('last_read_at', { ascending: false });

      if (error) throw error;
      setHistory(data || []);
    } catch (error: any) {
      console.error('Error fetching reading history:', error);
      toast.error('Failed to load reading history');
    } finally {
      setLoading(false);
    }
  };

  const updateReadingProgress = async (
    book: {
      id: string;
      title: string;
      author: string;
      coverImage?: string;
    },
    currentPage: number,
    totalPages: number
  ) => {
    if (!user) return false;

    try {
      const existingEntry = history.find(h => h.book_id === book.id);
      
      if (existingEntry) {
        // Update existing entry
        const { error } = await supabase
          .from('user_library')
          .update({
            current_page: currentPage,
            last_read_at: new Date().toISOString(),
          })
          .eq('user_session_id', user.id)
          .eq('book_id', book.id);

        if (error) throw error;
      } else {
        // Create new entry
        const { error } = await supabase
          .from('user_library')
          .insert([{
            user_session_id: user.id,
            book_id: book.id,
            current_page: currentPage,
            last_read_at: new Date().toISOString(),
            added_at: new Date().toISOString(),
          }]);

        if (error) throw error;
      }

      await fetchHistory();
      
      if (currentPage >= totalPages) {
        toast.success(`Finished reading "${book.title}"!`);
      }
      
      return true;
    } catch (error: any) {
      console.error('Error updating reading progress:', error);
      return false;
    }
  };

  // Simplified - reading sessions not supported in current schema
  const addReadingSession = async (
    bookId: string,
    startTime: Date,
    endTime: Date,
    pagesRead: number = 0
  ) => {
    // This feature requires additional database tables
    console.log('Reading session tracking not yet implemented');
  };

  const getBookProgress = (bookId: string) => {
    const entry = history.find(h => h.book_id === bookId);
    return entry || null;
  };

  const getContinueReading = () => {
    return history
      .filter(h => h.current_page && h.current_page > 0)
      .slice(0, 5);
  };

  const getRecentlyFinished = () => {
    // Simplified - we don't track completion in current schema
    return [];
  };

  return {
    history,
    loading,
    updateReadingProgress,
    addReadingSession,
    getBookProgress,
    getContinueReading,
    getRecentlyFinished,
    refresh: fetchHistory,
  };
}

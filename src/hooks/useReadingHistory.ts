import { useState, useEffect, useCallback } from 'react';
import supabase from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ReadingHistoryItem {
  id: string;
  book_id: string;
  last_read_page: number;
  last_read_at: string;
  created_at: string;
}

export function useReadingHistory() {
  const [history, setHistory] = useState<ReadingHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const loadHistory = useCallback(async () => {
    if (!user) {
      setHistory([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('reading_history')
        .select('*')
        .eq('user_id', user.id)
        .order('last_read_at', { ascending: false });

      if (error) throw error;

      setHistory(data || []);
    } catch (error) {
      console.error('Error loading reading history:', error);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateReadingProgress = async (bookId: string, page: number) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('reading_history')
        .upsert({
          user_id: user.id,
          book_id: bookId,
          last_read_page: page,
          last_read_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,book_id'
        });

      if (error) throw error;

      // Update local state
      setHistory(prev => {
        const existing = prev.find(item => item.book_id === bookId);
        if (existing) {
          return prev.map(item => 
            item.book_id === bookId 
              ? { ...item, last_read_page: page, last_read_at: new Date().toISOString() }
              : item
          );
        } else {
          return [...prev, {
            id: `${user.id}-${bookId}`,
            user_id: user.id,
            book_id: bookId,
            last_read_page: page,
            last_read_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
          }];
        }
      });

      return true;
    } catch (error) {
      console.error('Error updating reading progress:', error);
      return false;
    }
  };

  const getLastReadPage = (bookId: string): number => {
    const item = history.find(h => h.book_id === bookId);
    return item?.last_read_page || 0;
  };

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  return {
    history,
    loading,
    updateReadingProgress,
    getLastReadPage,
    refreshHistory: loadHistory,
  };
}


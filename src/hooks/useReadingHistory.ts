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
    setLoading(true);
    
    if (!user) {
      setHistory([]);
      setLoading(false);
      return;
    }
    
    try {
      // First try to load from localStorage for immediate display
      const cachedHistory = localStorage.getItem(`reading_history_${user.id}`);
      if (cachedHistory) {
        try {
          const parsedHistory = JSON.parse(cachedHistory);
          setHistory(parsedHistory);
          // Don't set loading to false yet, still try to fetch fresh data
        } catch (e) {
          console.error('Error parsing cached history:', e);
          // Continue with API call
        }
      }
      
      // Then fetch fresh data from Supabase
      const { data, error } = await supabase
        .from('reading_history')
        .select('*')
        .eq('user_id', user.id)
        .order('last_read_at', { ascending: false });
      
      if (error) throw error;
      
      setHistory(data || []);
      
      // Cache in localStorage for offline access
      localStorage.setItem(`reading_history_${user.id}`, JSON.stringify(data));
    } catch (error) {
      console.error('Error loading reading history:', error);
      toast.error('Could not load reading history. Using cached data if available.');
      
      // If we haven't already loaded from localStorage, try now as fallback
      if (!history.length) {
        const cachedHistory = localStorage.getItem(`reading_history_${user.id}`);
        if (cachedHistory) {
          try {
            setHistory(JSON.parse(cachedHistory));
          } catch (e) {
            console.error('Error parsing cached history:', e);
            setHistory([]);
          }
        } else {
          setHistory([]);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateReadingProgress = async (bookId: string, page: number) => {
    if (!user) return false;
    
    try {
      const newRecord = {
        user_id: user.id,
        book_id: bookId,
        last_read_page: page,
        last_read_at: new Date().toISOString(),
      };
      
      const { error } = await supabase
        .from('reading_history')
        .upsert(newRecord, {
          onConflict: 'user_id,book_id'
        });

      if (error) throw error;

      // Update local state
      setHistory(prev => {
        const existing = prev.find(item => item.book_id === bookId);
        const updatedHistory = existing 
          ? prev.map(item => 
              item.book_id === bookId 
                ? { ...item, last_read_page: page, last_read_at: new Date().toISOString() }
                : item
            )
          : [...prev, {
              id: `${user.id}-${bookId}`,
              user_id: user.id,
              book_id: bookId,
              last_read_page: page,
              last_read_at: new Date().toISOString(),
              created_at: new Date().toISOString(),
            }];
            
        // Save to local storage as backup
        try {
          localStorage.setItem(`reading_history_${user.id}`, JSON.stringify(updatedHistory));
        } catch (storageError) {
          console.error('Error saving to local storage:', storageError);
        }
        
        return updatedHistory;
      });

      return true;
    } catch (error) {
      console.error('Error updating reading progress:', error);
      
      // Fallback: Update local state and storage even if API fails
      try {
        setHistory(prev => {
          const existing = prev.find(item => item.book_id === bookId);
          const updatedHistory = existing 
            ? prev.map(item => 
                item.book_id === bookId 
                  ? { ...item, last_read_page: page, last_read_at: new Date().toISOString() }
                  : item
              )
            : [...prev, {
                id: `${user.id}-${bookId}`,
                user_id: user.id,
                book_id: bookId,
                last_read_page: page,
                last_read_at: new Date().toISOString(),
                created_at: new Date().toISOString(),
              }];
              
          // Save to local storage
          localStorage.setItem(`reading_history_${user.id}`, JSON.stringify(updatedHistory));
          
          return updatedHistory;
        });
        toast.warning('Reading progress saved locally. Will sync when connection is restored.');
        return true;
      } catch (fallbackError) {
        console.error('Error in fallback update:', fallbackError);
        toast.error('Failed to save reading progress. Please try again.');
        return false;
      }
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


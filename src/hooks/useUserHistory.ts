import { useState, useEffect, useCallback, useRef } from 'react';
import supabase, { isSupabaseConfigured } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { books } from '@/data/books';

export interface UserHistoryItem {
  id: string;
  user_id: string;
  book_id: string;
  last_read_page: number;
  last_read_at: string;
  created_at: string;
  total_pages?: number;
}

const cacheKeyFor = (userId: string) => `user_history_${userId}`;

export function useUserHistory() {
  const [history, setHistory] = useState<UserHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const lastErrorAtRef = useRef<number>(0);
  const [remoteEnabled, setRemoteEnabled] = useState(true);
  const debounceRef = useRef<number | null>(null);

  const loadHistory = useCallback(async () => {
    setLoading(true);
    if (!user) {
      try {
        const cached = localStorage.getItem('guest_history');
        if (cached) {
          const parsed = JSON.parse(cached) as UserHistoryItem[];
          setHistory(parsed);
          console.debug('Loaded guest history from cache', parsed);
        } else {
          setHistory([]);
        }
      } catch (e) {
        console.warn('Guest history cache parse failed', e);
        setHistory([]);
      }
      setLoading(false);
      return;
    }
    if (!isSupabaseConfigured) {
      try {
        const cached = localStorage.getItem(cacheKeyFor(user.id));
        if (cached) {
          const parsed = JSON.parse(cached) as UserHistoryItem[];
          setHistory(parsed);
          console.debug('Loaded user history from cache', parsed);
        } else {
          setHistory([]);
        }
      } catch (e) {
        console.warn('User history cache parse failed', e);
        setHistory([]);
      }
      setLoading(false);
      return;
    }

    try {
      const cached = localStorage.getItem(cacheKeyFor(user.id));
      if (cached) {
        try {
          const parsed = JSON.parse(cached) as UserHistoryItem[];
          setHistory(parsed);
        } catch (e) { console.warn('History cache parse failed', e); }
      }

      const { data, error } = await supabase
        .from('reading_history')
        .select('*')
        .eq('user_id', user.id)
        .order('last_read_at', { ascending: false });

      if (error) {
        if ((error as { code?: string }).code === 'PGRST205') {
          setRemoteEnabled(false);
        }
        throw error;
      }

      const enriched = (data || []).map((row: { id?: string; user_id: string; book_id: string; last_read_page?: number; last_read_at?: string; created_at?: string }) => {
        const book = books.find(b => b.id === row.book_id);
        return {
          id: row.id || `${row.user_id}-${row.book_id}`,
          user_id: row.user_id,
          book_id: row.book_id,
          last_read_page: row.last_read_page || 0,
          last_read_at: row.last_read_at || new Date().toISOString(),
          created_at: row.created_at || new Date().toISOString(),
          total_pages: book?.pages,
        } as UserHistoryItem;
      });

      setHistory(enriched);
      try { localStorage.setItem(cacheKeyFor(user.id), JSON.stringify(enriched)); } catch (e) { console.warn('History cache write failed', e); }
    } catch (err) {
      console.error('Could not load reading history:', err);
      const now = Date.now();
      if (now - lastErrorAtRef.current > 60000) {
        toast.error('Could not load reading history. Showing cached data if available.');
        lastErrorAtRef.current = now;
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateProgress = useCallback(async (bookId: string, currentPage: number, totalPages?: number) => {
    if (!user) {
      try {
        const record: UserHistoryItem = {
          id: `guest-${bookId}`,
          user_id: 'guest',
          book_id: bookId,
          last_read_page: currentPage,
          last_read_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          total_pages: books.find(b => b.id === bookId)?.pages,
        };
        const next = [...history.filter(h => h.book_id !== bookId), record]
          .sort((a,b) => new Date(b.last_read_at).getTime() - new Date(a.last_read_at).getTime())
          .slice(0,5);
        setHistory(next);
        try { localStorage.setItem('guest_history', JSON.stringify(next)); } catch { void 0 }
        console.debug('Updated guest reading progress', record);
        return true;
      } catch {
        return false;
      }
    }
    try {
      if (!bookId || typeof bookId !== 'string') {
        toast.error('Invalid book reference');
        return false;
      }
      const record = {
        user_id: user.id,
        book_id: bookId,
        last_read_page: currentPage,
        last_read_at: new Date().toISOString(),
      };

      if (isSupabaseConfigured) {
        let bookExists = false;
        try {
          const { data: exists, error: existsErr } = await supabase
            .from('books')
            .select('id')
            .eq('id', bookId)
            .limit(1);
          if (!existsErr && (exists || []).length > 0) bookExists = true;
        } catch (e) { console.warn('Book exists check failed', e); }

        if (!bookExists) {
          try {
            const book = books.find(b => b.id === bookId);
            const { error: insertErr } = await supabase
              .from('books')
              .insert({ id: bookId, title: book?.title || bookId, pdf_path: book?.pdfPath || `/books/${bookId}.pdf`, pages: book?.pages || null });
            if (!insertErr) bookExists = true;
          } catch (e) { console.warn('Insert book failed', e); }
        }

        const { error } = await supabase
          .from('reading_history')
          .upsert(record, { onConflict: 'user_id,book_id' });

        if (error) {
          if ((error as { code?: string }).code === 'PGRST205') {
            setRemoteEnabled(false);
          }
          console.error('Reading history upsert failed:', error);
          toast.error('Unable to save reading progress');
          return false;
        }
      }

      setHistory(prev => {
        const existing = prev.find(h => h.book_id === bookId);
        const next = existing
          ? prev.map(h => h.book_id === bookId ? { ...h, last_read_page: currentPage, last_read_at: record.last_read_at, total_pages: totalPages ?? h.total_pages } : h)
          : [...prev, {
              id: `${user.id}-${bookId}`,
              user_id: user.id,
              book_id: bookId,
              last_read_page: currentPage,
              last_read_at: record.last_read_at,
              created_at: new Date().toISOString(),
              total_pages: totalPages ?? books.find(b => b.id === bookId)?.pages,
            }];
        const sorted = [...next].sort((a,b) => new Date(b.last_read_at).getTime() - new Date(a.last_read_at).getTime());
        // Enforce queue capacity: keep only top 5 newest items
        const capped = sorted.slice(0, 5);
        // Attempt to remove extras remotely (best-effort)
        if (sorted.length > 5 && isSupabaseConfigured) {
          const extras = sorted.slice(5);
          extras.forEach(async (h) => {
            try {
              await supabase
                .from('reading_history')
                .delete()
                .eq('user_id', user.id)
                .eq('book_id', h.book_id);
            } catch (e) { console.warn('Remote history deletion failed', e); }
          });
        }
        try {
          localStorage.setItem(cacheKeyFor(user.id), JSON.stringify(capped));
        } catch (e) { console.warn('History cache write failed', e); }
        return capped;
      });

      return true;
    } catch (err) {
      const message = (err as Error)?.message || 'Failed to save progress';
      toast.error(message);
      return false;
    }
  }, [user]);

  const getProgress = useCallback((bookId: string) => {
    const item = history.find(h => h.book_id === bookId);
    const total = item?.total_pages ?? books.find(b => b.id === bookId)?.pages ?? 0;
    const current = item?.last_read_page ?? 0;
    const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
    return { currentPage: current, totalPages: total, percentage, lastReadAt: item?.last_read_at };
  }, [history]);

  const removeFromHistory = useCallback(async (bookId: string) => {
    if (!user) {
      setHistory(prev => {
        const next = prev.filter(h => h.book_id !== bookId);
        try { localStorage.setItem('guest_history', JSON.stringify(next)); } catch { void 0 }
        return next;
      });
      return true;
    }
    try {
      await supabase
        .from('reading_history')
        .delete()
        .eq('user_id', user.id)
        .eq('book_id', bookId);
      setHistory(prev => {
        const next = prev.filter(h => h.book_id !== bookId);
        try {
          localStorage.setItem(cacheKeyFor(user.id), JSON.stringify(next));
        } catch (e) { console.warn('History cache write failed', e); }
        return next;
      });
      return true;
    } catch {
      return false;
    }
  }, [user]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // Realtime subscription for reading history changes
  useEffect(() => {
    if (!user || !isSupabaseConfigured) return;
    const subscription = supabase
      .channel('reading_history_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reading_history', filter: `user_id=eq.${user.id}` }, () => {
        if (debounceRef.current) window.clearTimeout(debounceRef.current);
        debounceRef.current = window.setTimeout(() => loadHistory(), 400);
      })
      .subscribe();
    return () => { subscription.unsubscribe(); };
  }, [user, loadHistory]);

  return {
    history,
    loading,
    refreshHistory: loadHistory,
    updateProgress,
    getProgress,
    removeFromHistory,
    remoteEnabled,
  } as const;
}

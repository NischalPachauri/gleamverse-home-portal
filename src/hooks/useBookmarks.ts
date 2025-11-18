import { useState, useEffect, useCallback } from 'react';
import supabase from '@/integrations/supabase/client';
import { books } from '@/data/books';
import { getBookCover } from '@/utils/bookCoverMapping';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useRef } from 'react';

export interface BookmarkOperation {
  status: 'idle' | 'loading' | 'success' | 'error';
  error: string | null;
}

export type BookmarkStatusType = 'Planning to Read' | 'Reading' | 'On Hold' | 'Completed' | 'Favorites';

declare global {
  interface Window {
    __coverLoaded?: Set<string>;
    __bookmarkMetrics?: { loads: number; adds: number; removes: number; updates: number; durations: number[] };
  }
}

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [bookmarkStatuses, setBookmarkStatuses] = useState<Record<string, BookmarkStatusType>>({});
  const [loading, setLoading] = useState(true);
  const [operationState, setOperationState] = useState<BookmarkOperation>({
    status: 'idle',
    error: null
  });
  const { user } = useAuth();
  const [remoteEnabled, setRemoteEnabled] = useState(true);
  const debounceRef = useRef<number | null>(null);

  const loadBookmarks = useCallback(async () => {
    if (!user) {
      setBookmarks([]);
      setBookmarkStatuses({});
      setLoading(false);
      return;
    }

    setLoading(true);
    setOperationState({ status: 'loading', error: null });
    
    try {
      const { data, error } = await supabase
        .from('user_library')
        .select('metadata, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        // Fallback when bookmarks table is not present (PGRST205)
        const code = (error as { code?: string })?.code;
        if (code === 'PGRST205') {
          setRemoteEnabled(false);
          const { data: libData, error: libErr } = await supabase
            .from('user_library')
            .select('book_id')
            .eq('user_id', user.id);
          if (libErr) throw libErr;
          const ids = (libData || []).map((row: { book_id: string }) => row.book_id);
          setBookmarks(ids);
          setBookmarkStatuses({});
          setOperationState({ status: 'success', error: null });
          return;
        }
        throw error;
      }

      type Row = { metadata?: { book_id?: string; status?: BookmarkStatusType } };
      const ids = (data || []).map((row: Row) => row.metadata?.book_id).filter(Boolean) as string[];
      const statuses: Record<string, BookmarkStatusType> = {};
      (data || []).forEach((row: Row) => {
        const id = row.metadata?.book_id;
        const st = row.metadata?.status as BookmarkStatusType | undefined;
        if (id) statuses[id] = st || 'Planning to Read';
      });
      setBookmarks(ids);
      setBookmarkStatuses(statuses);
      try { localStorage.setItem('bookmark_cache', JSON.stringify({ ids, statuses })); } catch (e) { console.warn('Cache write failed', e); }
      setOperationState({ status: 'success', error: null });

      // Metrics
      const bm = window.__bookmarkMetrics || (window.__bookmarkMetrics = { loads: 0, adds: 0, removes: 0, updates: 0, durations: [] });
      bm.loads++;

      // Skip migrations for performance
    } catch (error: unknown) {
      console.error('Error loading bookmarks from Supabase:', error);
      setBookmarks([]);
      setBookmarkStatuses({});
      setOperationState({ 
        status: 'error', 
        error: (error as Error).message || 'Failed to load your bookmarks' 
      });
      toast.error('Failed to load your bookmarks');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Light-weight real-time updates (optional)
  useEffect(() => {
    if (!user) return;
    const table = 'user_library';
    const subscription = supabase
      .channel(`${table}_changes_min`)
      .on('postgres_changes', { event: '*', schema: 'public', table, filter: `user_id=eq.${user.id}` }, () => {
        if (debounceRef.current) window.clearTimeout(debounceRef.current);
        debounceRef.current = window.setTimeout(() => { loadBookmarks(); }, 500);
      })
      .subscribe();
    return () => { subscription.unsubscribe(); };
  }, [user, loadBookmarks]);

  const addBookmark = async (bookId: string, status: BookmarkStatusType = 'Planning to Read') => {
    if (!user) return false;

    setOperationState({ status: 'loading', error: null });
    
    // Prefetch cover before UI updates for instant appearance
    try {
      const b = books.find(b => b.id === bookId);
      const src = b ? getBookCover(b.title) : '';
      if (src) {
        const coverLoaded: Set<string> = window.__coverLoaded || (window.__coverLoaded = new Set<string>());
        if (!coverLoaded.has(src)) {
          const img = new Image();
          img.onload = () => coverLoaded.add(src);
          img.src = src;
          img.decoding = 'async';
        }
      }
    } catch (e) { console.warn('Cover prefetch failed', e); }

    // Optimistically update UI
    setBookmarks(prev => [...prev, bookId]);
    setBookmarkStatuses(prev => ({ ...prev, [bookId]: status }));
    
    try {
      const t0 = performance.now();
      const b = books.find(b => b.id === bookId);
      const { error } = await supabase
        .from('user_library')
        .insert({
          user_id: user.id,
          url: b?.pdfPath || `/books/${bookId}.pdf`,
          title: b?.title || bookId,
          metadata: { book_id: bookId, status },
        });
      // Skip queue enforcement for speed; optional async task can be added later

      if (error) throw error;

      setOperationState({ status: 'success', error: null });
      const bm = window.__bookmarkMetrics || (window.__bookmarkMetrics = { loads: 0, adds: 0, removes: 0, updates: 0, durations: [] });
      bm.adds++;
      bm.durations.push(performance.now() - t0);
      toast.success('Book added to your bookmarks');
      return true;
    } catch (error: unknown) {
      console.error('Error adding bookmark:', error);
      // Revert optimistic update
      setBookmarks(prev => prev.filter(id => id !== bookId));
      setBookmarkStatuses(prev => {
        const next = { ...prev };
        delete next[bookId];
        return next;
      });
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
    const previousStatuses = { ...bookmarkStatuses };
    setBookmarkStatuses(prev => {
      const next = { ...prev };
      delete next[bookId];
      return next;
    });
    
    try {
      const t0 = performance.now();
      const { error } = await supabase
        .from('user_library')
        .delete()
        .eq('user_id', user.id)
        .contains('metadata', { book_id: bookId });

      if (error) throw error;

      setOperationState({ status: 'success', error: null });
      const bm = window.__bookmarkMetrics || (window.__bookmarkMetrics = { loads: 0, adds: 0, removes: 0, updates: 0, durations: [] });
      bm.removes++;
      bm.durations.push(performance.now() - t0);
      toast.success('Book removed from your bookmarks');
      return true;
    } catch (error: unknown) {
      console.error('Error removing bookmark:', error);
      // Revert optimistic update
      setBookmarks(previousBookmarks);
      setBookmarkStatuses(previousStatuses);
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

  const updateBookmarkStatus = async (bookId: string, status: BookmarkStatusType) => {
    if (!user) return false;
    setOperationState({ status: 'loading', error: null });

    // Optimistic update
    const previousStatuses = { ...bookmarkStatuses };
    setBookmarkStatuses(prev => ({ ...prev, [bookId]: status }));

    try {
      const t0 = performance.now();
      const { error } = await supabase
        .from('user_library')
        .update({ metadata: { book_id: bookId, status } })
        .eq('user_id', user.id)
        .contains('metadata', { book_id: bookId });
      // Skip queue enforcement for speed

      if (error) throw error;
      setOperationState({ status: 'success', error: null });
      const bm = window.__bookmarkMetrics || (window.__bookmarkMetrics = { loads: 0, adds: 0, removes: 0, updates: 0, durations: [] });
      bm.updates++;
      bm.durations.push(performance.now() - t0);
      return true;
    } catch (error: unknown) {
      console.error('Error updating bookmark status:', error);
      setBookmarkStatuses(previousStatuses);
      setOperationState({ 
        status: 'error', 
        error: (error as Error).message || 'Failed to update bookmark status' 
      });
      toast.error('Failed to update bookmark status. Please try again.');
      return false;
    }
  };

  useEffect(() => {
    try {
      if (user) {
        const cached = JSON.parse(localStorage.getItem('bookmark_cache') || 'null');
        if (cached && cached.ids && cached.statuses) {
          setBookmarks(cached.ids as string[]);
          setBookmarkStatuses(cached.statuses as Record<string, BookmarkStatusType>);
          setLoading(false);
        }
      }
    } catch (e) { console.warn('Cache read failed', e); }
    loadBookmarks();
  }, [loadBookmarks, user]);

  return {
    bookmarks,
    bookmarkStatuses,
    loading,
    operationState,
    validatePlacements: () => {
      const issues: string[] = [];
      bookmarks.forEach(id => {
        const st = bookmarkStatuses[id] || 'Planning to Read';
        if (!['Planning to Read','Reading','On Hold','Completed','Favorites'].includes(st)) {
          issues.push(`Invalid status for ${id}: ${st}`);
        }
      });
      if (issues.length) console.warn('[Validation]', issues);
      return issues.length === 0;
    },
    addBookmark,
    removeBookmark,
    toggleBookmark,
    updateBookmarkStatus,
    clearAllBookmarks: async () => {
      if (!user) return false;
      setOperationState({ status: 'loading', error: null });
      try {
        const { error } = await supabase
          .from('user_library')
          .delete()
          .eq('user_id', user.id);
        if (error) throw error;
        setBookmarks([]);
        setBookmarkStatuses({});
        setOperationState({ status: 'success', error: null });
        toast.success('All bookmarks have been cleared');
        return true;
      } catch (error: unknown) {
        console.error('Error clearing bookmarks:', error);
        setOperationState({ 
          status: 'error', 
          error: (error as Error).message || 'Failed to clear bookmarks' 
        });
        toast.error('Failed to clear bookmarks. Please try again.');
        return false;
      }
    },
    refreshBookmarks: loadBookmarks,
  };
}


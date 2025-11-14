import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import supabase from '@/integrations/supabase/client';
import { books } from '@/data/books';

const BOOKMARKS_KEY = 'gleamverse_bookmarks';
const BOOKMARK_STATUS_KEY = 'gleamverse_bookmark_status';

export interface BookmarkOperation {
  status: 'idle' | 'loading' | 'success' | 'error';
  error: string | null;
}

export interface BookmarkStatus {
  [bookId: string]: BookmarkStatusType;
}

export type BookmarkStatusType = 'Planning to Read' | 'Reading' | 'On Hold' | 'Completed';

// Status options with visual indicators
export const statusOptions = [
  { value: 'Planning to Read', label: 'Planning to Read', icon: 'BookMarked', color: 'bg-emerald-500' },
  { value: 'Reading', label: 'Currently Reading', icon: 'BookOpen', color: 'bg-blue-500' },
  { value: 'On Hold', label: 'On Hold', icon: 'Clock', color: 'bg-amber-500' },
  { value: 'Completed', label: 'Completed', icon: 'CheckCircle2', color: 'bg-purple-500' }
];

const useLocalBookmarks = () => {
  const { user } = useAuth();
  const [bookmarkedBooks, setBookmarkedBooks] = useState<string[]>([]);
  const [bookmarkStatuses, setBookmarkStatuses] = useState<BookmarkStatus>({});
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [operationState, setOperationState] = useState<BookmarkOperation>({
    status: 'idle',
    error: null
  });

  // Load bookmarks from localStorage with error handling
  const loadBookmarks = useCallback(() => {
    setLoading(true);
    try {
      const bookmarks = JSON.parse(localStorage.getItem(BOOKMARKS_KEY) || '[]');
      const statuses = JSON.parse(localStorage.getItem(BOOKMARK_STATUS_KEY) || '{}');
      setBookmarkedBooks(bookmarks);
      setBookmarkStatuses(statuses);
    } catch (error) {
      console.error('Error loading bookmarks:', error);
      toast.error('Failed to load your bookmarks. Using empty state.');
      setBookmarkedBooks([]);
      setBookmarkStatuses({});
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize bookmarks on component mount
  useEffect(() => {
    loadBookmarks();
  }, [loadBookmarks]);

  // Maximum number of books allowed in the library
  const MAX_LIBRARY_CAPACITY = 5;

  // Add bookmark with optimistic UI update and error handling
  const addBookmark = useCallback(async (bookId: string, status: 'Planning to Read' | 'Reading' | 'On Hold' | 'Completed' = 'Planning to Read') => {
    setSyncing(true);
    setOperationState({ status: 'loading', error: null });
    
    // Check for duplicates - prevent adding the same book twice
    if (bookmarkedBooks.includes(bookId)) {
      setSyncing(false);
      toast.info('This book is already in your library');
      return false;
    }
    
    let updatedBookmarks: string[] = [...bookmarkedBooks];
    let updatedStatuses = { ...bookmarkStatuses };

    // Removed 5-book limit to allow unlimited bookmarks
    if (false && bookmarkedBooks.length >= MAX_LIBRARY_CAPACITY) {
      const removalPriority: BookmarkStatusType[] = ['Completed', 'On Hold', 'Planning to Read', 'Reading'];
      let bookToRemove: string | null = null;

      for (const status of removalPriority) {
        const booksWithStatus = bookmarkedBooks.filter(id => updatedStatuses[id] === status);
        if (booksWithStatus.length > 0) {
          bookToRemove = booksWithStatus[0]; // Remove the oldest book with this status
          break;
        }
      }

      if (!bookToRemove) {
        // Fallback to removing the oldest book if no other criteria met
        bookToRemove = bookmarkedBooks[0];
      }
      
      if (bookToRemove) {
        const oldestBook = books.find(book => book.id === bookToRemove!);
        const oldestBookTitle = oldestBook ? oldestBook.title : bookToRemove;
        
        updatedBookmarks = updatedBookmarks.filter(id => id !== bookToRemove);
        delete updatedStatuses[bookToRemove];
        
        toast.info(`"${oldestBookTitle}" was removed from your library as you've reached the 5-book limit.`);
      }
    }
    
    updatedBookmarks.push(bookId);
    updatedStatuses[bookId] = status;
    
    try {
      // Update localStorage
      localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updatedBookmarks));
      localStorage.setItem(BOOKMARK_STATUS_KEY, JSON.stringify(updatedStatuses));
      
      // Update state
      setBookmarkedBooks(updatedBookmarks);
      setBookmarkStatuses(updatedStatuses);
      
      setOperationState({ status: 'success', error: null });
      toast.success('Book added to your library');
      return true;
    } catch (error: unknown) {
      console.error('Error adding bookmark:', error);
      setOperationState({ 
        status: 'error', 
        error: (error as Error).message || 'Failed to add bookmark' 
      });
      toast.error('Failed to add bookmark. Please try again.');
      return false;
    } finally {
      setSyncing(false);
    }
  }, [bookmarkedBooks, bookmarkStatuses]);

  // Remove bookmark with optimistic UI update and error handling
  const removeBookmark = useCallback(async (bookId: string) => {
    setSyncing(true);
    setOperationState({ status: 'loading', error: null });
    
    // Store current state for rollback if needed
    const previousBookmarks = [...bookmarkedBooks];
    const previousStatuses = { ...bookmarkStatuses };
    
    // Optimistically update UI
    const updatedBookmarks = bookmarkedBooks.filter(id => id !== bookId);
    const updatedStatuses = { ...bookmarkStatuses };
    delete updatedStatuses[bookId];
    
    try {
      // Simulate network delay for testing (remove in production)
      // await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update localStorage
      localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updatedBookmarks));
      localStorage.setItem(BOOKMARK_STATUS_KEY, JSON.stringify(updatedStatuses));
      
      // Update state
      setBookmarkedBooks(updatedBookmarks);
      setBookmarkStatuses(updatedStatuses);
      
      setOperationState({ status: 'success', error: null });
      // Removed toast notification for silent removal
      return true;
    } catch (error: unknown) {
      console.error('Error removing bookmark:', error);
      
      // Revert optimistic update on error
      setBookmarkedBooks(previousBookmarks);
      setBookmarkStatuses(previousStatuses);
      
      setOperationState({ 
        status: 'error', 
        error: (error as Error).message || 'Failed to remove bookmark' 
      });
      toast.error('Failed to remove bookmark. Please try again.');
      return false;
    } finally {
      setSyncing(false);
    }
  }, [bookmarkedBooks, bookmarkStatuses]);

  // Update bookmark status
  const updateBookmarkStatus = useCallback(async (bookId: string, status: 'Planning to Read' | 'Reading' | 'On Hold' | 'Completed') => {
    setSyncing(true);
    setOperationState({ status: 'loading', error: null });
    
    // Store current state for rollback if needed
    const previousStatuses = { ...bookmarkStatuses };
    
    // Optimistically update UI
    const updatedStatuses = { ...bookmarkStatuses, [bookId]: status };
    
    try {
      // Update localStorage
      localStorage.setItem(BOOKMARK_STATUS_KEY, JSON.stringify(updatedStatuses));
      
      // Update state
      setBookmarkStatuses(updatedStatuses);
      
      setOperationState({ status: 'success', error: null });
      toast.success(`Book status updated to "${status}"`);
      return true;
    } catch (error: unknown) {
      console.error('Error updating bookmark status:', error);
      
      // Revert optimistic update on error
      setBookmarkStatuses(previousStatuses);
      
      setOperationState({ 
        status: 'error', 
        error: (error as Error).message || 'Failed to update bookmark status' 
      });
      toast.error('Failed to update bookmark status. Please try again.');
      return false;
    } finally {
      setSyncing(false);
    }
  }, [bookmarkStatuses]);

  // Toggle bookmark with automatic retry
  const toggleBookmark = useCallback(async (bookId: string, status: 'Planning to Read' | 'Reading' | 'On Hold' | 'Completed' = 'Planning to Read') => {
    const maxRetries = 3;
    let retries = 0;
    let success = false;
    
    while (retries < maxRetries && !success) {
      try {
        if (bookmarkedBooks.includes(bookId)) {
          success = await removeBookmark(bookId);
        } else {
          success = await addBookmark(bookId, status);
        }
        
        if (success) return true;
        
        // If not successful but no exception thrown, increment retry counter
        retries++;
        if (retries < maxRetries) {
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 300 * Math.pow(2, retries)));
        }
      } catch (error) {
        console.error(`Attempt ${retries + 1} failed:`, error);
        retries++;
        if (retries < maxRetries) {
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 300 * Math.pow(2, retries)));
        }
      }
    }
    
    if (!success) {
      toast.error(`Failed to ${bookmarkedBooks.includes(bookId) ? 'remove' : 'add'} bookmark after multiple attempts`);
    }
    
    return success;
  }, [bookmarkedBooks, addBookmark, removeBookmark]);

  // Clear all bookmarks
  const clearAllBookmarks = useCallback(async () => {
    setSyncing(true);
    setOperationState({ status: 'loading', error: null });
    
    try {
      // Update localStorage
      localStorage.setItem(BOOKMARKS_KEY, JSON.stringify([]));
      localStorage.setItem(BOOKMARK_STATUS_KEY, JSON.stringify({}));
      
      // Update state
      setBookmarkedBooks([]);
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
    } finally {
      setSyncing(false);
    }
  }, []);

  return {
    bookmarkedBooks,
    bookmarkStatuses,
    loading,
    syncing,
    operationState,
    addBookmark,
    removeBookmark,
    updateBookmarkStatus,
    toggleBookmark,
    clearAllBookmarks,
    refreshBookmarks: loadBookmarks
  } as const;
};

export { useLocalBookmarks };

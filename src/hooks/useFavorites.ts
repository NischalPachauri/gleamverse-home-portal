import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import supabase from '@/integrations/supabase/client';

const FAVORITES_KEY = 'gleamverse_favorites';

export interface FavoriteOperation {
  status: 'idle' | 'loading' | 'success' | 'error';
  error: string | null;
}

const useFavorites = () => {
  const { user } = useAuth();
  const [favoriteBooks, setFavoriteBooks] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [operationState, setOperationState] = useState<FavoriteOperation>({
    status: 'idle',
    error: null
  });

  // Load favorites from localStorage with error handling
  const loadFavorites = useCallback(() => {
    setLoading(true);
    try {
      const favorites = JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]');
      setFavoriteBooks(favorites);
    } catch (error) {
      console.error('Error loading favorites:', error);
      toast.error('Failed to load your favorites. Using empty state.');
      setFavoriteBooks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize favorites on component mount
  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  // Add favorite with optimistic UI update and error handling
  const addFavorite = useCallback(async (bookId: string) => {
    setSyncing(true);
    setOperationState({ status: 'loading', error: null });
    
    // Optimistically update UI
    const updatedFavorites = [...favoriteBooks, bookId];
    
    try {
      // Update localStorage
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(updatedFavorites));
      
      // Update state
      setFavoriteBooks(updatedFavorites);
      
      setOperationState({ status: 'success', error: null });
      return true;
    } catch (error: any) {
      console.error('Error adding favorite:', error);
      setOperationState({ 
        status: 'error', 
        error: error.message || 'Failed to add favorite' 
      });
      toast.error('Failed to add to favorites. Please try again.');
      return false;
    } finally {
      setSyncing(false);
    }
  }, [favoriteBooks]);

  // Remove favorite with optimistic UI update and error handling
  const removeFavorite = useCallback(async (bookId: string) => {
    setSyncing(true);
    setOperationState({ status: 'loading', error: null });
    
    // Optimistically update UI
    const updatedFavorites = favoriteBooks.filter(id => id !== bookId);
    
    try {
      // Update localStorage
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(updatedFavorites));
      
      // Update state
      setFavoriteBooks(updatedFavorites);
      
      setOperationState({ status: 'success', error: null });
      return true;
    } catch (error: any) {
      console.error('Error removing favorite:', error);
      setOperationState({ 
        status: 'error', 
        error: error.message || 'Failed to remove favorite' 
      });
      toast.error('Failed to remove from favorites. Please try again.');
      return false;
    } finally {
      setSyncing(false);
    }
  }, [favoriteBooks]);

  // Toggle favorite status
  const toggleFavorite = useCallback(async (bookId: string) => {
    if (favoriteBooks.includes(bookId)) {
      const result = await removeFavorite(bookId);
      if (result) {
        toast.success('Removed from favorites');
      }
      return result;
    } else {
      const result = await addFavorite(bookId);
      if (result) {
        toast.success('Added to favorites');
      }
      return result;
    }
  }, [favoriteBooks, addFavorite, removeFavorite]);

  // Check if a book is favorited
  const isFavorite = useCallback((bookId: string) => {
    return favoriteBooks.includes(bookId);
  }, [favoriteBooks]);

  return {
    favoriteBooks,
    loading,
    operationState,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    refreshFavorites: loadFavorites,
  };
};

export { useFavorites };
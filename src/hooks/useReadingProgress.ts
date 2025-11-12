import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

const READING_PROGRESS_KEY = 'gleamverse_reading_progress';

export interface ReadingProgress {
  [bookId: string]: {
    currentPage: number;
    totalPages: number;
    percentage: number;
  };
}

const useReadingProgress = () => {
  const [readingProgress, setReadingProgress] = useState<ReadingProgress>({});
  const [loading, setLoading] = useState(true);

  // Load reading progress from localStorage
  const loadReadingProgress = useCallback(() => {
    setLoading(true);
    try {
      const progress = JSON.parse(localStorage.getItem(READING_PROGRESS_KEY) || '{}');
      setReadingProgress(progress);
    } catch (error) {
      console.error('Error loading reading progress:', error);
      toast.error('Failed to load your reading progress.');
      setReadingProgress({});
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize reading progress on mount
  useEffect(() => {
    loadReadingProgress();
  }, [loadReadingProgress]);

  // Update reading progress
  const updateProgress = useCallback((bookId: string, currentPage: number, totalPages: number) => {
    const percentage = totalPages > 0 ? Math.round((currentPage / totalPages) * 100) : 0;
    const updatedProgress = {
      ...readingProgress,
      [bookId]: { currentPage, totalPages, percentage },
    };

    try {
      localStorage.setItem(READING_PROGRESS_KEY, JSON.stringify(updatedProgress));
      setReadingProgress(updatedProgress);
    } catch (error) {
      console.error('Error saving reading progress:', error);
      toast.error('Failed to save your reading progress.');
    }
  }, [readingProgress]);

  // Get reading progress for a specific book
  const getProgress = useCallback((bookId: string) => {
    return readingProgress[bookId] || { currentPage: 0, totalPages: 0, percentage: 0 };
  }, [readingProgress]);

  return {
    readingProgress,
    loading,
    updateProgress,
    getProgress,
    refreshProgress: loadReadingProgress,
  } as const;
};

export { useReadingProgress };
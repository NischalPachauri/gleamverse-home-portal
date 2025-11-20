import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import supabase from '@/integrations/supabase/client';
import { useBookmarks } from './useBookmarks';

export interface ReadingGoal {
  id: string;
  title: string;
  description?: string;
  target_books: number;
  completed_books: number;
  book_ids: string[];
  deadline?: string;
  created_at: string;
}

export function useReadingGoals() {
  const [goals, setGoals] = useState<ReadingGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { bookmarkStatuses } = useBookmarks();

  // Load reading goals from local storage or database
  const loadGoals = useCallback(async () => {
    if (!user) {
      setGoals([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // First try to load from Supabase
      const { data, error } = await supabase
        .from('reading_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading reading goals:', error);
        setError('Failed to load reading goals');
        
        // Fallback to local storage
        const localGoals = localStorage.getItem(`reading_goals_${user.id}`);
        if (localGoals) {
          setGoals(JSON.parse(localGoals));
        }
      } else {
        setGoals(data || []);
        // Update local storage
        localStorage.setItem(`reading_goals_${user.id}`, JSON.stringify(data));
      }
    } catch (err) {
      console.error('Error in loadGoals:', err);
      setError('An unexpected error occurred');
      
      // Fallback to local storage
      const localGoals = localStorage.getItem(`reading_goals_${user.id}`);
      if (localGoals) {
        setGoals(JSON.parse(localGoals));
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Create a new reading goal
  const createGoal = async (goal: Omit<ReadingGoal, 'id' | 'created_at' | 'completed_books'> | ReadingGoal): Promise<boolean> => {
    if (!user) return false;

    try {
      if (!goal.title || goal.title.trim().length === 0) {
        setError('Title is required');
        return false;
      }
      if (goal.target_books !== undefined && Number(goal.target_books) < 1) {
        setError('Target books must be at least 1');
        return false;
      }
      const insertPayload = {
        user_id: user.id,
        title: goal.title,
        description: goal.description ?? null,
        target_books: Number(goal.target_books ?? 1),
        completed_books: Number(('completed_books' in goal ? (goal as ReadingGoal).completed_books : 0)),
        book_ids: goal.book_ids ?? [],
        deadline: goal.deadline ?? null,
      };

      const { data, error } = await supabase
        .from('reading_goals')
        .insert([insertPayload])
        .select();

      if (error) {
        console.error('Supabase error creating goal:', error);
        setError(error.message || 'Failed to create goal');
        return false;
      }

      // Use the returned data from Supabase if available
      const savedGoal: ReadingGoal = data && data.length > 0
        ? (data[0] as ReadingGoal)
        : { ...insertPayload, id: (('id' in goal ? (goal as ReadingGoal).id : '')), created_at: new Date().toISOString() } as ReadingGoal;
      
      // Update local state
      setGoals(prev => [savedGoal, ...prev]);
      
      // Update local storage with the updated goals array
      const updatedGoals = [savedGoal, ...goals];
      localStorage.setItem(
        `reading_goals_${user.id}`, 
        JSON.stringify(updatedGoals)
      );

      return true;
    } catch (error) {
      console.error('Error creating reading goal:', error);
      setError((error as Error).message || 'Failed to create goal');
      return false;
    }
  };

  // Add a book to a reading goal
  const addBookToGoal = async (goalId: string, bookId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const goalIndex = goals.findIndex(g => g.id === goalId);
      if (goalIndex === -1) return false;

      const goal = goals[goalIndex];
      
      // Check if book is already in the goal
      if (goal.book_ids.includes(bookId)) return true;

      // Add book to goal
      const updatedGoal = {
        ...goal,
        book_ids: [...goal.book_ids, bookId],
      };

      // Check if book is completed
      if (bookmarkStatuses[bookId] === 'Completed') {
        updatedGoal.completed_books += 1;
      }

      // Update in database
      const { error } = await supabase
        .from('reading_goals')
        .update(updatedGoal)
        .eq('id', goalId);

      if (error) throw error;

      // Update local state
      setGoals(prev => prev.map(g => 
        g.id === goalId ? updatedGoal : g
      ));
      
      // Update local storage
      localStorage.setItem(
        `reading_goals_${user.id}`, 
        JSON.stringify(goals.map(g => g.id === goalId ? updatedGoal : g))
      );

      return true;
    } catch (error) {
      console.error('Error adding book to goal:', error);
      return false;
    }
  };

  // Remove a book from a reading goal
  const removeBookFromGoal = async (goalId: string, bookId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const goalIndex = goals.findIndex(g => g.id === goalId);
      if (goalIndex === -1) return false;

      const goal = goals[goalIndex];
      
      // Check if book is in the goal
      if (!goal.book_ids.includes(bookId)) return true;

      // Remove book from goal
      const updatedGoal = {
        ...goal,
        book_ids: goal.book_ids.filter(id => id !== bookId),
      };

      // Check if book was completed
      if (bookmarkStatuses[bookId] === 'Completed') {
        updatedGoal.completed_books = Math.max(0, updatedGoal.completed_books - 1);
      }

      // Update in database
      const { error } = await supabase
        .from('reading_goals')
        .update(updatedGoal)
        .eq('id', goalId);

      if (error) throw error;

      // Update local state
      setGoals(prev => prev.map(g => 
        g.id === goalId ? updatedGoal : g
      ));
      
      // Update local storage
      localStorage.setItem(
        `reading_goals_${user.id}`, 
        JSON.stringify(goals.map(g => g.id === goalId ? updatedGoal : g))
      );

      return true;
    } catch (error) {
      console.error('Error removing book from goal:', error);
      return false;
    }
  };

  // Delete a reading goal
  const deleteGoal = async (goalId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      // Delete from database
      const { error } = await supabase
        .from('reading_goals')
        .delete()
        .eq('id', goalId);

      if (error) throw error;

      // Update local state
      setGoals(prev => prev.filter(g => g.id !== goalId));
      
      // Update local storage
      localStorage.setItem(
        `reading_goals_${user.id}`, 
        JSON.stringify(goals.filter(g => g.id !== goalId))
      );

      return true;
    } catch (error) {
      console.error('Error deleting reading goal:', error);
      return false;
    }
  };

  // Update book completion status when bookmark status changes
  useEffect(() => {
    const updateCompletionStatus = async () => {
      if (!user || goals.length === 0) return;

      const updatedGoals = [...goals];
      let hasChanges = false;

      // Check each goal for completed books
      for (let i = 0; i < updatedGoals.length; i++) {
        const goal = updatedGoals[i];
        let completedCount = 0;

        // Count completed books in this goal
        goal.book_ids.forEach(bookId => {
          if (bookmarkStatuses[bookId] === 'Completed') {
            completedCount++;
          }
        });

        // Update goal if completion count changed
        if (goal.completed_books !== completedCount) {
          updatedGoals[i] = {
            ...goal,
            completed_books: completedCount
          };
          hasChanges = true;
        }
      }

      // Update goals if changes detected
      if (hasChanges) {
        setGoals(updatedGoals);
        
        // Update local storage
        localStorage.setItem(
          `reading_goals_${user.id}`, 
          JSON.stringify(updatedGoals)
        );

        // Update database (in real app, would batch these updates)
        for (const goal of updatedGoals) {
          await supabase
            .from('reading_goals')
            .update({ completed_books: goal.completed_books })
            .eq('id', goal.id);
        }
      }
    };

    updateCompletionStatus();
  }, [bookmarkStatuses, goals, user]);

  // Load goals when component mounts
  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  return {
    goals,
    loading,
    createGoal,
    addBookToGoal,
    removeBookFromGoal,
    deleteGoal,
    refreshGoals: loadGoals
  };
}

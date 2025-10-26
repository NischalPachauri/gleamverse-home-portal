import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import supabase from '@/integrations/supabase/client';
import { useLocalBookmarks } from './useLocalBookmarks';

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
  const { user } = useAuth();
  const { bookmarkStatuses } = useLocalBookmarks();

  // Load reading goals from local storage or database
  const loadGoals = useCallback(async () => {
    if (!user) {
      setGoals([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Try to load from local storage first for quick access
      const localGoals = localStorage.getItem(`reading_goals_${user.id}`);
      if (localGoals) {
        setGoals(JSON.parse(localGoals));
      }

      // Then fetch from database for most up-to-date data
      const { data, error } = await supabase
        .from('reading_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        setGoals(data);
        // Update local storage
        localStorage.setItem(`reading_goals_${user.id}`, JSON.stringify(data));
      }
    } catch (error) {
      console.error('Error loading reading goals:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Create a new reading goal
  const createGoal = async (goal: Omit<ReadingGoal, 'id' | 'created_at' | 'completed_books'>): Promise<boolean> => {
    if (!user) return false;

    try {
      const newGoal = {
        ...goal,
        id: `goal-${Date.now()}`,
        user_id: user.id,
        completed_books: 0,
        created_at: new Date().toISOString(),
      };

      // Save to database
      const { error } = await supabase
        .from('reading_goals')
        .insert([newGoal]);

      if (error) throw error;

      // Update local state
      setGoals(prev => [newGoal, ...prev]);
      
      // Update local storage with the updated goals array
      const updatedGoals = [newGoal, ...goals];
      localStorage.setItem(
        `reading_goals_${user.id}`, 
        JSON.stringify(updatedGoals)
      );

      return true;
    } catch (error) {
      console.error('Error creating reading goal:', error);
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
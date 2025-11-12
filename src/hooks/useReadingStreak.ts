import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import supabase from '@/integrations/supabase/client';
import { useReadingHistory } from './useReadingHistory';

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastReadDate: string | null;
}

export function useReadingStreak() {
  const [streakData, setStreakData] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    lastReadDate: null
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { history } = useReadingHistory();

  // Helper to check if two dates are the same day
  const isSameDay = useCallback((date1: Date, date2: Date): boolean => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }, []);

  // Helper to check if two dates are consecutive days
  const isConsecutiveDay = useCallback((date1: Date, date2: Date): boolean => {
    const oneDayInMs = 24 * 60 * 60 * 1000;
    const diffTime = Math.abs(date1.getTime() - date2.getTime());
    return diffTime <= oneDayInMs && !isSameDay(date1, date2);
  }, [isSameDay]);

  // Helper to calculate longest streak from sorted dates
  const calculateLongestStreak = useCallback((sortedDates: Date[]): number => {
    if (sortedDates.length <= 1) return sortedDates.length;
    let longestStreak = 1;
    let currentStreak = 1;
    for (let i = 0; i < sortedDates.length - 1; i++) {
      const currentDate = sortedDates[i];
      const nextDate = sortedDates[i + 1];
      if (isConsecutiveDay(currentDate, nextDate)) {
        currentStreak++;
        longestStreak = Math.max(longestStreak, currentStreak);
      } else {
        currentStreak = 1;
      }
    }
    return longestStreak;
  }, [isConsecutiveDay]);

  // Calculate streak based on reading history
  const calculateStreak = useCallback(() => {
    if (!user || history.length === 0) {
      setStreakData({
        currentStreak: 0,
        longestStreak: 0,
        lastReadDate: null
      });
      setLoading(false);
      return;
    }

    try {
      // Sort history by date (newest first)
      const sortedHistory = [...history].sort((a, b) => 
        new Date(b.last_read_at).getTime() - new Date(a.last_read_at).getTime()
      );

      // Group reading sessions by day
      const readingDays = new Map<string, Date>();
      sortedHistory.forEach(item => {
        const date = new Date(item.last_read_at);
        const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
        if (!readingDays.has(dateKey)) {
          readingDays.set(dateKey, date);
        }
      });

      // Convert to sorted array of dates (newest first)
      const sortedDates = Array.from(readingDays.values()).sort((a, b) => b.getTime() - a.getTime());
      
      if (sortedDates.length === 0) {
        setStreakData({
          currentStreak: 0,
          longestStreak: 0,
          lastReadDate: null
        });
        setLoading(false);
        return;
      }

      // Calculate current streak
      let currentStreak = 1;
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      // Check if the most recent reading day is today or yesterday
      const mostRecentDate = sortedDates[0];
      const isActiveStreak = isSameDay(mostRecentDate, today) || isSameDay(mostRecentDate, yesterday);
      
      if (!isActiveStreak) {
        // Streak is broken if not read today or yesterday
        setStreakData({
          currentStreak: 0,
          longestStreak: calculateLongestStreak(sortedDates),
          lastReadDate: mostRecentDate.toISOString()
        });
        setLoading(false);
        return;
      }

      // Calculate current streak by counting consecutive days
      for (let i = 0; i < sortedDates.length - 1; i++) {
        const currentDate = sortedDates[i];
        const nextDate = sortedDates[i + 1];
        
        if (isConsecutiveDay(currentDate, nextDate)) {
          currentStreak++;
        } else {
          break;
        }
      }

      const longestStreak = calculateLongestStreak(sortedDates);

      setStreakData({
        currentStreak,
        longestStreak,
        lastReadDate: mostRecentDate.toISOString()
      });
    } catch (error) {
      console.error('Error calculating reading streak:', error);
      setStreakData({
        currentStreak: 0,
        longestStreak: 0,
        lastReadDate: null
      });
    } finally {
      setLoading(false);
    }
  }, [user, history, calculateLongestStreak, isConsecutiveDay, isSameDay]);

  // Mark a day as read (for testing purposes)
  const markDayAsRead = async (date: Date = new Date()): Promise<boolean> => {
    if (!user) return false;

    try {
      // Create a unique ID for this streak update
      const streakId = `streak-${user.id}-${date.toISOString().split('T')[0]}`;
      
      const { error } = await supabase
        .from('reading_streaks')
        .upsert({
          id: streakId,
          user_id: user.id,
          read_date: date.toISOString(),
          created_at: new Date().toISOString(),
        });

      if (error) throw error;
      
      // Recalculate streak after marking day as read
      calculateStreak();
      return true;
    } catch (error) {
      console.error('Error marking day as read:', error);
      return false;
    }
  };

  // Load streak data when component mounts or history changes
  useEffect(() => {
    calculateStreak();
  }, [calculateStreak]);

  return {
    ...streakData,
    loading,
    markDayAsRead,
    refreshStreak: calculateStreak
  };
}

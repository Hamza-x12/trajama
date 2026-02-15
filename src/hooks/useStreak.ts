import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastPracticeDate: string | null;
}

const STREAK_KEY = 'darija-streak-data';

const getTodayString = () => new Date().toISOString().split('T')[0];

const getYesterdayString = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
};

export const useStreak = () => {
  const { user } = useAuth();
  const [streak, setStreak] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    lastPracticeDate: null,
  });
  const [loading, setLoading] = useState(true);

  // Load streak data
  useEffect(() => {
    if (user) {
      loadFromDatabase();
    } else {
      loadFromLocal();
    }
  }, [user]);

  const loadFromLocal = () => {
    try {
      const saved = localStorage.getItem(STREAK_KEY);
      if (saved) {
        setStreak(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load streak:', e);
    }
    setLoading(false);
  };

  const loadFromDatabase = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('current_streak, longest_streak, last_practice_date')
        .eq('id', user.id)
        .single();

      if (!error && data) {
        setStreak({
          currentStreak: data.current_streak || 0,
          longestStreak: data.longest_streak || 0,
          lastPracticeDate: data.last_practice_date,
        });
      }
    } catch (e) {
      console.error('Failed to load streak from DB:', e);
    }
    setLoading(false);
  };

  const recordPractice = useCallback(async () => {
    const today = getTodayString();
    const yesterday = getYesterdayString();

    // Already practiced today
    if (streak.lastPracticeDate === today) return streak;

    let newStreak: number;
    if (streak.lastPracticeDate === yesterday) {
      newStreak = streak.currentStreak + 1;
    } else {
      newStreak = 1;
    }

    const newLongest = Math.max(streak.longestStreak, newStreak);
    const updated: StreakData = {
      currentStreak: newStreak,
      longestStreak: newLongest,
      lastPracticeDate: today,
    };

    setStreak(updated);

    if (user) {
      await supabase
        .from('profiles')
        .update({
          current_streak: newStreak,
          longest_streak: newLongest,
          last_practice_date: today,
        })
        .eq('id', user.id);
    } else {
      localStorage.setItem(STREAK_KEY, JSON.stringify(updated));
    }

    return updated;
  }, [streak, user]);

  const hasCompletedToday = streak.lastPracticeDate === getTodayString();

  return { streak, loading, recordPractice, hasCompletedToday };
};

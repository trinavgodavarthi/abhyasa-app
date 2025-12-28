
import { differenceInDays, isYesterday, isToday, startOfDay } from 'date-fns';
import { Habit } from '../types';

export const REGEN_INTERVAL_MS = 5 * 60 * 1000; // 5 Minutes per tick

export const useGameLogic = () => {
  // XP formula: Level N = 100 * 1.5^(N-1)
  const getRequiredXP = (level: number): number => {
    return Math.floor(100 * Math.pow(1.5, level - 1));
  };

  const calculateRewards = (difficulty: 'easy' | 'medium' | 'hard') => {
    switch (difficulty) {
      case 'easy': return { xp: 50, gold: 10 };
      case 'medium': return { xp: 150, gold: 35 };
      case 'hard': return { xp: 400, gold: 100 };
      default: return { xp: 0, gold: 0 };
    }
  };

  const processHabitCheck = (lastCompleted: any) => {
    if (!lastCompleted) return { increment: true, reset: false };
    
    const lastDate = lastCompleted.toDate ? lastCompleted.toDate() : new Date(lastCompleted);
    const today = startOfDay(new Date());
    
    if (isToday(lastDate)) return { increment: false, reset: false }; // Already done today
    if (isYesterday(lastDate)) return { increment: true, reset: false }; // Consistent
    
    // Missed a day
    return { increment: true, reset: true };
  };

  const calculateRegenAmount = (habits: Habit[]) => {
    const activeStreaks = habits.filter(h => h.currentStreak > 0).length;
    // Base 1 HP + 1 HP for every 2 active streaks
    return 1 + Math.floor(activeStreaks / 2);
  };

  return { getRequiredXP, calculateRewards, processHabitCheck, calculateRegenAmount };
};

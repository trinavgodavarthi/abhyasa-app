
import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserData, Task, Habit } from '../types';
import { useGameLogic } from '../hooks/useGameLogic';
import { storage } from '../lib/storage';

interface GameContextType {
  user: UserData | null;
  loading: boolean;
  signup: (u: string, p: string) => Promise<void>;
  login: (u: string, p: string) => Promise<void>;
  logout: () => void;
  tasks: Task[];
  habits: Habit[];
  addQuest: (title: string, difficulty: 'easy' | 'medium' | 'hard') => Promise<void>;
  completeTask: (task: Task) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  addHabit: (title: string) => Promise<void>;
  completeHabit: (habit: Habit) => Promise<void>;
  deleteHabit: (habitId: string) => Promise<void>;
  buyReward: (cost: number) => Promise<boolean>;
  updateHP: (amount: number) => Promise<void>;
}

const GameContext = createContext<GameContextType | null>(null);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const { getRequiredXP, calculateRewards, processHabitCheck } = useGameLogic();

  const refreshData = async (username: string) => {
    const userData = await storage.getUser(username);
    const userTasks = await storage.getTasks(username);
    const userHabits = await storage.getHabits(username);
    setUser(userData);
    setTasks(userTasks);
    setHabits(userHabits);
  };

  useEffect(() => {
    const init = async () => {
      const storedUsername = localStorage.getItem('abhyasa_user');
      if (storedUsername) {
        await refreshData(storedUsername);
      }
      setLoading(false);
    };
    init();
  }, []);

  const signup = async (username: string, password: string) => {
    const existing = await storage.getUser(username);
    if (existing) throw new Error("Username taken");

    const newUser: UserData = {
      username,
      password,
      level: 1,
      xp: 0,
      gold: 50,
      hp: 100,
      lastLogin: new Date().toISOString()
    };

    await storage.setUser(username, newUser);
    localStorage.setItem('abhyasa_user', username);
    setUser(newUser);
    setTasks([]);
    setHabits([]);
  };

  const login = async (username: string, password: string) => {
    const existing = await storage.getUser(username);
    if (!existing) throw new Error("User not found");
    if (existing.password !== password) throw new Error("Invalid password");

    localStorage.setItem('abhyasa_user', username);
    await refreshData(username);
  };

  const logout = () => {
    localStorage.removeItem('abhyasa_user');
    setUser(null);
    setTasks([]);
    setHabits([]);
  };

  const addQuest = async (title: string, difficulty: 'easy' | 'medium' | 'hard') => {
    if (!user) return;
    await storage.addTask(user.username, { title, difficulty, completed: false });
    await refreshData(user.username);
  };

  const completeTask = async (task: Task) => {
    if (!user || task.completed) return;
    const { xp, gold } = calculateRewards(task.difficulty);

    let newXP = user.xp + xp;
    let newLevel = user.level;
    let reqXP = getRequiredXP(newLevel);

    while (newXP >= reqXP) {
      newXP -= reqXP;
      newLevel += 1;
      reqXP = getRequiredXP(newLevel);
    }

    await storage.updateUser(user.username, { xp: newXP, level: newLevel, gold: user.gold + gold });
    await storage.updateTask(user.username, task.id, { completed: true });
    await refreshData(user.username);
  };

  const deleteTask = async (taskId: string) => {
    if (!user) return;
    await storage.deleteTask(user.username, taskId);
    await refreshData(user.username);
  };

  const addHabit = async (title: string) => {
    if (!user) return;
    await storage.addHabit(user.username, { title, currentStreak: 0, lastCompleted: null, mastered: false });
    await refreshData(user.username);
  };

  const completeHabit = async (habit: Habit) => {
    if (!user) return;
    const { increment: shouldInc, reset } = processHabitCheck(habit.lastCompleted);
    if (!shouldInc) return;

    const newStreak = reset ? 1 : habit.currentStreak + 1;
    const mastered = newStreak >= 21;

    await storage.updateHabit(user.username, habit.id, {
      currentStreak: newStreak,
      lastCompleted: new Date().toISOString(),
      mastered
    });

    await storage.updateUser(user.username, { 
      xp: user.xp + 25, 
      hp: Math.min(100, user.hp + 5) 
    });
    await refreshData(user.username);
  };

  const deleteHabit = async (habitId: string) => {
    if (!user) return;
    await storage.deleteHabit(user.username, habitId);
    await refreshData(user.username);
  };

  const buyReward = async (cost: number) => {
    if (!user || user.gold < cost) return false;
    await storage.updateUser(user.username, { gold: user.gold - cost });
    await refreshData(user.username);
    return true;
  };

  const updateHP = async (amount: number) => {
    if (!user) return;
    await storage.updateUser(user.username, { hp: Math.min(100, Math.max(0, user.hp + amount)) });
    await refreshData(user.username);
  };

  return (
    <GameContext.Provider value={{ 
      user, loading, signup, login, logout, tasks, habits, 
      addQuest, completeTask, deleteTask, addHabit, completeHabit, deleteHabit, buyReward, updateHP 
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error("useGame must be used within GameProvider");
  return context;
};

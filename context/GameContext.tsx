
import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserData, Task, Habit, Reward, Category, CharacterClass, Trophy, AttributeType } from '../types';
import { useGameLogic } from '../hooks/useGameLogic';
import { storage } from '../lib/storage';
import { startOfDay, differenceInDays } from 'date-fns';

interface GameContextType {
  user: UserData | null;
  loading: boolean;
  signup: (u: string, p: string) => Promise<void>;
  login: (u: string, p: string) => Promise<void>;
  logout: () => void;
  resetProgress: () => Promise<void>;
  updateUserClass: (c: CharacterClass) => Promise<void>;
  addCategory: (cat: Omit<Category, 'id'>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  tasks: Task[];
  habits: Habit[];
  addQuest: (title: string, difficulty: 'easy' | 'medium' | 'hard', category: string, timeEstimate?: number) => Promise<void>;
  completeTask: (task: Task) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  updateTaskTime: (taskId: string, minutes: number) => Promise<void>;
  addHabit: (title: string, targetDays?: number) => Promise<void>;
  updateHabit: (id: string, updates: Partial<Habit>) => Promise<void>;
  completeHabit: (habit: Habit) => Promise<void>;
  deleteHabit: (habitId: string) => Promise<void>;
  buyReward: (reward: Reward) => Promise<boolean>;
  useItem: (itemId: string) => Promise<void>;
  updateHP: (amount: number) => Promise<void>;
  checkTrophies: () => void;
}

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'slaying', label: 'Slaying', icon: 'swords', color: 'bg-blue-600', alignment: 'STR' },
  { id: 'training', label: 'Training', icon: 'fitness_center', color: 'bg-green-600', alignment: 'STR' },
  { id: 'research', label: 'Research', icon: 'menu_book', color: 'bg-purple-600', alignment: 'INT' },
  { id: 'life', label: 'Life', icon: 'home', color: 'bg-orange-600', alignment: 'FOC' },
];

export const TROPHIES: Trophy[] = [
  { id: 't1', title: 'Initiate', description: 'Reached Level 5', icon: 'workspace_premium', condition: 'level', threshold: 5 },
  { id: 't2', title: 'Grandmaster', description: 'Reached Level 10', icon: 'military_tech', condition: 'level', threshold: 10 },
  { id: 't3', title: 'Slayer of Boredom', description: 'Completed 20 Quests', icon: 'swords', condition: 'quests', threshold: 20 },
  { id: 't4', title: 'Tycoon', description: 'Amassed 1000 Gold', icon: 'payments', condition: 'gold', threshold: 1000 },
  { id: 't5', title: 'Disciplined', description: 'Mastered 3 Habits', icon: 'auto_awesome', condition: 'habits', threshold: 3 },
];

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const { getRequiredXP, calculateRewards, processHabitCheck } = useGameLogic();

  useEffect(() => {
    const savedUser = localStorage.getItem('abhyasa_active_user');
    if (savedUser) {
      loadData(savedUser);
    } else {
      setLoading(false);
    }
  }, []);

  const loadData = async (username: string) => {
    setLoading(true);
    const userData = await storage.getUser(username);
    if (userData) {
      const userTasks = await storage.getTasks(username);
      const userHabits = await storage.getHabits(username);
      
      let updatedHP = userData.hp;
      const lastLogin = userData.lastLogin ? new Date(userData.lastLogin) : new Date();
      const daysMissed = differenceInDays(startOfDay(new Date()), startOfDay(lastLogin));
      
      if (daysMissed > 1) {
        const penalty = (daysMissed - 1) * 5;
        updatedHP = Math.max(0, userData.hp - penalty);
        await storage.updateUser(username, { hp: updatedHP, lastLogin: new Date().toISOString() });
      }

      if (!userData.stats) {
        userData.stats = { str: 0, int: 0, foc: 0 };
        await storage.updateUser(username, { stats: userData.stats });
      }

      setUser({ ...userData, hp: updatedHP });
      setTasks(userTasks);
      setHabits(userHabits.map((h: any) => ({ ...h, targetDays: h.targetDays || 21 })));
    }
    setLoading(false);
  };

  const signup = async (u: string, p: string) => {
    const existing = await storage.getUser(u);
    if (existing) throw new Error("Hero name already taken!");
    
    const newUser: UserData = {
      username: u, password: p, level: 1, xp: 0, gold: 50, hp: 100,
      lastLogin: new Date().toISOString(), inventory: [], characterClass: 'Paladin',
      categories: DEFAULT_CATEGORIES, trophies: [],
      stats: { str: 0, int: 0, foc: 0 }
    };
    
    await storage.setUser(u, newUser);
    localStorage.setItem('abhyasa_active_user', u);
    setUser(newUser);
    setTasks([]);
    setHabits([]);
  };

  const login = async (u: string, p: string) => {
    const userData = await storage.getUser(u);
    if (!userData || userData.password !== p) throw new Error("Invalid credentials!");
    localStorage.setItem('abhyasa_active_user', u);
    await loadData(u);
  };

  const logout = () => {
    localStorage.removeItem('abhyasa_active_user');
    setUser(null);
  };

  const resetProgress = async () => {
    if (!user) return;
    const resetUser: UserData = {
      ...user, level: 1, xp: 0, gold: 50, hp: 100, inventory: [], trophies: [],
      stats: { str: 0, int: 0, foc: 0 }
    };
    await storage.setUser(user.username, resetUser);
    setUser(resetUser);
  };

  const updateUserClass = async (c: CharacterClass) => {
    if (!user) return;
    const updated = { ...user, characterClass: c };
    await storage.updateUser(user.username, { characterClass: c });
    setUser(updated);
  };

  const addCategory = async (cat: Omit<Category, 'id'>) => {
    if (!user) return;
    const newCat = { ...cat, id: Math.random().toString(36).substr(2, 9) };
    const updatedCats = [...user.categories, newCat as Category];
    await storage.updateUser(user.username, { categories: updatedCats });
    setUser({ ...user, categories: updatedCats });
  };

  const deleteCategory = async (id: string) => {
    if (!user) return;
    const updatedCats = user.categories.filter(c => c.id !== id);
    await storage.updateUser(user.username, { categories: updatedCats });
    setUser({ ...user, categories: updatedCats });
  };

  const addQuest = async (title: string, difficulty: 'easy' | 'medium' | 'hard', category: string, timeEstimate?: number) => {
    if (!user) return;
    const newTask = await storage.addTask(user.username, { 
      title, difficulty, category, completed: false, 
      timeEstimate: timeEstimate || 0, timeSpent: 0 
    });
    setTasks(prev => [...prev, newTask]);
  };

  const completeTask = async (task: Task) => {
    if (!user) return;
    const { xp, gold, statPoints } = calculateRewards(task.difficulty);
    
    let newXP = user.xp + xp;
    let newLevel = user.level;
    const reqXP = getRequiredXP(newLevel);
    if (newXP >= reqXP) {
      newXP -= reqXP;
      newLevel += 1;
    }

    const cat = user.categories.find(c => c.id === task.category);
    const alignment = (cat?.alignment || 'FOC').toLowerCase() as keyof UserData['stats'];
    const updatedStats = { ...user.stats, [alignment]: user.stats[alignment] + statPoints };

    const updatedUser = { ...user, xp: newXP, level: newLevel, gold: user.gold + gold, stats: updatedStats };
    await storage.updateUser(user.username, { xp: newXP, level: newLevel, gold: updatedUser.gold, stats: updatedStats });
    await storage.updateTask(user.username, task.id, { completed: true });
    
    setUser(updatedUser);
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, completed: true } : t));
    checkTrophies();
  };

  const deleteTask = async (taskId: string) => {
    if (!user) return;
    await storage.deleteTask(user.username, taskId);
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const updateTaskTime = async (taskId: string, minutes: number) => {
    if (!user) return;
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    const newTimeSpent = (task.timeSpent || 0) + minutes;
    await storage.updateTask(user.username, taskId, { timeSpent: newTimeSpent });
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, timeSpent: newTimeSpent } : t));
  };

  const addHabit = async (title: string, targetDays: number = 21) => {
    if (!user) return;
    const newHabit = await storage.addHabit(user.username, { title, currentStreak: 0, lastCompleted: null, mastered: false, targetDays });
    setHabits(prev => [...prev, newHabit]);
  };

  const updateHabit = async (id: string, updates: Partial<Habit>) => {
    if (!user) return;
    await storage.updateHabit(user.username, id, updates);
    setHabits(prev => prev.map(h => h.id === id ? { ...h, ...updates } : h));
  };

  const completeHabit = async (habit: Habit) => {
    if (!user) return;
    const { increment, reset } = processHabitCheck(habit.lastCompleted);
    if (!increment) return;

    const newStreak = reset ? 1 : habit.currentStreak + 1;
    const mastered = newStreak >= habit.targetDays;
    const lastCompleted = new Date().toISOString();
    
    const xpReward = 20 * newStreak;
    const goldReward = 5 * newStreak;
    const statReward = 5 + (newStreak * 2);

    let newXP = user.xp + xpReward;
    let newLevel = user.level;
    const reqXP = getRequiredXP(newLevel);
    if (newXP >= reqXP) {
      newXP -= reqXP;
      newLevel += 1;
    }

    const updatedStats = { ...user.stats, foc: user.stats.foc + statReward };

    const updatedUser = { ...user, xp: newXP, level: newLevel, gold: user.gold + goldReward, stats: updatedStats };
    await storage.updateUser(user.username, { xp: newXP, level: newLevel, gold: updatedUser.gold, stats: updatedStats });
    await storage.updateHabit(user.username, habit.id, { currentStreak: newStreak, mastered, lastCompleted });

    setUser(updatedUser);
    setHabits(prev => prev.map(h => h.id === habit.id ? { ...h, currentStreak: newStreak, mastered, lastCompleted } : h));
    checkTrophies();
  };

  const deleteHabit = async (habitId: string) => {
    if (!user) return;
    await storage.deleteHabit(user.username, habitId);
    setHabits(prev => prev.filter(h => h.id !== habitId));
  };

  const buyReward = async (reward: Reward): Promise<boolean> => {
    if (!user || user.gold < reward.cost) return false;
    const inventory = [...user.inventory];
    const existingIndex = inventory.findIndex(i => i.rewardId === reward.id);
    if (existingIndex > -1) {
      inventory[existingIndex].quantity += 1;
    } else {
      inventory.push({
        id: Math.random().toString(36).substr(2, 9),
        rewardId: reward.id, title: reward.title, description: reward.description, icon: reward.icon,
        quantity: 1, type: reward.type, durability: reward.id === '1' ? 1 : undefined
      });
    }
    const newGold = user.gold - reward.cost;
    await storage.updateUser(user.username, { gold: newGold, inventory });
    setUser({ ...user, gold: newGold, inventory });
    return true;
  };

  const useItem = async (itemId: string) => {
    if (!user) return;
    const item = user.inventory.find(i => i.id === itemId);
    if (!item) return;
    let updatedInventory = [...user.inventory];
    let hpChange = 0;
    if (item.rewardId === '2') hpChange = 20;
    const newHP = Math.min(100, user.hp + hpChange);
    if (item.quantity > 1) {
      updatedInventory = updatedInventory.map(i => i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i);
    } else {
      updatedInventory = updatedInventory.filter(i => i.id !== itemId);
    }
    await storage.updateUser(user.username, { inventory: updatedInventory, hp: newHP });
    setUser({ ...user, inventory: updatedInventory, hp: newHP });
  };

  const updateHP = async (amount: number) => {
    if (!user) return;
    const newHP = Math.max(0, Math.min(100, user.hp + amount));
    await storage.updateUser(user.username, { hp: newHP });
    setUser({ ...user, hp: newHP });
  };

  const checkTrophies = () => {
    if (!user) return;
    const unlocked = [...user.trophies];
    let changed = false;
    TROPHIES.forEach(t => {
      if (unlocked.includes(t.id)) return;
      let conditionMet = false;
      if (t.condition === 'level' && user.level >= t.threshold) conditionMet = true;
      if (t.condition === 'quests' && tasks.filter(tk => tk.completed).length >= t.threshold) conditionMet = true;
      if (t.condition === 'gold' && user.gold >= t.threshold) conditionMet = true;
      if (t.condition === 'habits' && habits.filter(h => h.mastered).length >= t.threshold) conditionMet = true;
      if (conditionMet) { unlocked.push(t.id); changed = true; }
    });
    if (changed) {
      storage.updateUser(user.username, { trophies: unlocked });
      setUser({ ...user, trophies: unlocked });
    }
  };

  return (
    <GameContext.Provider value={{ 
      user, loading, signup, login, logout, resetProgress, updateUserClass, 
      addCategory, deleteCategory, tasks, habits, addQuest, completeTask, 
      deleteTask, updateTaskTime, addHabit, updateHabit, completeHabit, deleteHabit, 
      buyReward, useItem, updateHP, checkTrophies 
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) throw new Error('useGame must be used within a GameProvider');
  return context;
};

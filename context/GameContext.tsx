
import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserData, Task, Habit, Reward, InventoryItem, Category, CharacterClass } from '../types';
import { useGameLogic, REGEN_INTERVAL_MS } from '../hooks/useGameLogic';
import { storage } from '../lib/storage';

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
  addQuest: (title: string, difficulty: 'easy' | 'medium' | 'hard', category: string) => Promise<void>;
  completeTask: (task: Task) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  addHabit: (title: string) => Promise<void>;
  completeHabit: (habit: Habit) => Promise<void>;
  deleteHabit: (habitId: string) => Promise<void>;
  buyReward: (reward: Reward) => Promise<boolean>;
  useItem: (itemId: string) => Promise<void>;
  updateHP: (amount: number) => Promise<void>;
}

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'slaying', label: 'Slaying', icon: 'swords', color: 'bg-blue-600' },
  { id: 'training', label: 'Training', icon: 'fitness_center', color: 'bg-green-600' },
  { id: 'research', label: 'Research', icon: 'menu_book', color: 'bg-purple-600' },
  { id: 'life', label: 'Life', icon: 'home', color: 'bg-orange-600' },
];

const GameContext = createContext<GameContextType | null>(null);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const { getRequiredXP, calculateRewards, processHabitCheck, calculateRegenAmount } = useGameLogic();

  useEffect(() => {
    const initGame = async () => {
      const storedUsername = localStorage.getItem('abhyasa_user');
      if (storedUsername) {
        const userData = await storage.getUser(storedUsername);
        if (userData) {
          const userTasks = await storage.getTasks(storedUsername);
          const userHabits = await storage.getHabits(storedUsername);
          
          const now = new Date();
          const lastSync = new Date(userData.lastLogin || now.toISOString());
          const diffMs = now.getTime() - lastSync.getTime();
          const ticks = Math.floor(diffMs / REGEN_INTERVAL_MS);
          
          let currentHP = userData.hp;
          let updatedLastLogin = userData.lastLogin;

          if (ticks > 0) {
            const regenPerTick = calculateRegenAmount(userHabits);
            currentHP = Math.min(100, currentHP + (ticks * regenPerTick));
            updatedLastLogin = now.toISOString();
            
            await storage.updateUser(storedUsername, { 
              hp: currentHP, 
              lastLogin: updatedLastLogin 
            });
          }

          setUser({ 
            ...userData, 
            hp: currentHP,
            lastLogin: updatedLastLogin,
            inventory: userData.inventory || [], 
            characterClass: userData.characterClass || 'Paladin',
            categories: userData.categories || DEFAULT_CATEGORIES
          });
          setTasks(userTasks);
          setHabits(userHabits);
        } else {
          logout();
        }
      }
      setLoading(false);
    };

    initGame();
  }, []);

  useEffect(() => {
    if (!user || loading) return;

    const tick = setInterval(async () => {
      const now = new Date();
      const last = new Date(user.lastLogin);
      const diff = now.getTime() - last.getTime();
      
      if (diff >= REGEN_INTERVAL_MS) {
        const ticks = Math.floor(diff / REGEN_INTERVAL_MS);
        const regenPerTick = calculateRegenAmount(habits);
        const totalRegen = ticks * regenPerTick;
        const newTimestamp = now.toISOString();
        
        if (user.hp < 100) {
          const newHP = Math.min(100, user.hp + totalRegen);
          await storage.updateUser(user.username, { hp: newHP, lastLogin: newTimestamp });
          setUser(prev => prev ? { ...prev, hp: newHP, lastLogin: newTimestamp } : null);
        } else {
          await storage.updateUser(user.username, { lastLogin: newTimestamp });
          setUser(prev => prev ? { ...prev, lastLogin: newTimestamp } : null);
        }
      }
    }, 30000);

    return () => clearInterval(tick);
  }, [user?.username, user?.lastLogin, user?.hp, habits, loading]);

  const signup = async (username: string, password: string) => {
    const existingUser = await storage.getUser(username);
    if (existingUser) throw new Error("Username taken");

    const newUser: UserData = {
      username,
      password,
      level: 1,
      xp: 0,
      gold: 50,
      hp: 100,
      lastLogin: new Date().toISOString(),
      inventory: [],
      characterClass: 'Paladin',
      categories: DEFAULT_CATEGORIES
    };

    await storage.setUser(username, newUser);
    localStorage.setItem('abhyasa_user', username);
    setUser(newUser);
  };

  const login = async (username: string, password: string) => {
    const userData = await storage.getUser(username);
    if (!userData) throw new Error("User not found");
    if (userData.password !== password) throw new Error("Invalid password");

    localStorage.setItem('abhyasa_user', username);
    window.location.reload(); 
  };

  const logout = () => {
    localStorage.removeItem('abhyasa_user');
    setUser(null);
    setTasks([]);
    setHabits([]);
  };

  const resetProgress = async () => {
    if (!user) return;
    const now = new Date().toISOString();
    const resetUser: UserData = {
      ...user,
      level: 1,
      xp: 0,
      gold: 50,
      hp: 100,
      inventory: [],
      lastLogin: now,
      categories: DEFAULT_CATEGORIES
    };
    await storage.updateUser(user.username, resetUser);
    setUser(resetUser);
    setTasks([]);
    setHabits([]);
  };

  const updateUserClass = async (characterClass: CharacterClass) => {
    if (!user) return;
    await storage.updateUser(user.username, { characterClass });
    setUser(prev => prev ? { ...prev, characterClass } : null);
  };

  const addCategory = async (cat: Omit<Category, 'id'>) => {
    if (!user) return;
    const newCat = { ...cat, id: Math.random().toString(36).substr(2, 9) };
    const categories = [...user.categories, newCat];
    await storage.updateUser(user.username, { categories });
    setUser(prev => prev ? { ...prev, categories } : null);
  };

  const deleteCategory = async (id: string) => {
    if (!user) return;
    const categories = user.categories.filter(c => c.id !== id);
    await storage.updateUser(user.username, { categories });
    setUser(prev => prev ? { ...prev, categories } : null);
  };

  const addQuest = async (title: string, difficulty: 'easy' | 'medium' | 'hard', category: string) => {
    if (!user) return;
    const newTask = await storage.addTask(user.username, {
      title,
      difficulty,
      category,
      completed: false
    });
    setTasks(prev => [newTask, ...prev]);
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

    const updates = { xp: newXP, level: newLevel, gold: user.gold + gold, lastLogin: new Date().toISOString() };
    await storage.updateUser(user.username, updates);
    await storage.updateTask(user.username, task.id, { completed: true });
    
    setUser(prev => prev ? { ...prev, ...updates } : null);
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, completed: true } : t));
  };

  const deleteTask = async (taskId: string) => {
    if (!user) return;
    await storage.deleteTask(user.username, taskId);
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const addHabit = async (title: string) => {
    if (!user) return;
    const newHabit = await storage.addHabit(user.username, {
      title,
      currentStreak: 0,
      lastCompleted: null,
      mastered: false
    });
    setHabits(prev => [...prev, newHabit]);
  };

  const completeHabit = async (habit: Habit) => {
    if (!user) return;
    const { increment: shouldInc, reset } = processHabitCheck(habit.lastCompleted);
    if (!shouldInc) return;

    const newStreak = reset ? 1 : habit.currentStreak + 1;
    const mastered = newStreak >= 21;
    const now = new Date().toISOString();

    await storage.updateHabit(user.username, habit.id, {
      currentStreak: newStreak,
      lastCompleted: now,
      mastered
    });

    const userUpdates = { 
      xp: user.xp + 25, 
      hp: Math.min(100, user.hp + 5),
      lastLogin: now
    };
    await storage.updateUser(user.username, userUpdates);
    
    setHabits(prev => prev.map(h => h.id === habit.id ? { ...h, currentStreak: newStreak, lastCompleted: now, mastered } : h));
    setUser(prev => prev ? { ...prev, ...userUpdates } : null);
  };

  const deleteHabit = async (habitId: string) => {
    if (!user) return;
    await storage.deleteHabit(user.username, habitId);
    setHabits(prev => prev.filter(h => h.id !== habitId));
  };

  const buyReward = async (reward: Reward) => {
    if (!user || user.gold < reward.cost) return false;
    
    const inventory = [...(user.inventory || [])];
    const existingItem = inventory.find(item => item.rewardId === reward.id);
    
    // Optionally set an expiry date (e.g., 48 hours for buffs)
    const expiryDate = reward.type === 'buff' 
      ? new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString() 
      : undefined;

    if (existingItem) {
      existingItem.quantity += 1;
      // If we restack, we might want to refresh the expiry date or keep it as is
      if (expiryDate) existingItem.expiryDate = expiryDate;
    } else {
      inventory.push({
        id: Math.random().toString(36).substr(2, 9),
        rewardId: reward.id,
        title: reward.title,
        description: reward.description,
        icon: reward.icon,
        quantity: 1,
        type: reward.type,
        durability: reward.type === 'buff' ? 3 : undefined,
        expiryDate: expiryDate
      });
    }

    const updates = { 
      gold: user.gold - reward.cost,
      inventory,
      lastLogin: new Date().toISOString()
    };
    
    await storage.updateUser(user.username, updates);
    setUser(prev => prev ? { ...prev, ...updates } : null);
    return true;
  };

  const useItem = async (itemId: string) => {
    if (!user) return;
    const inventory = [...(user.inventory || [])];
    const itemIndex = inventory.findIndex(item => item.id === itemId);
    
    if (itemIndex === -1) return;
    
    const item = inventory[itemIndex];
    const now = new Date();
    
    // EXPIRED CHECK AND REMOVAL: Check if item has an expiry date and if it has passed.
    if (item.expiryDate && new Date(item.expiryDate) < now) {
      inventory.splice(itemIndex, 1);
      const updates = { inventory, lastLogin: now.toISOString() };
      await storage.updateUser(user.username, updates);
      setUser(prev => prev ? { ...prev, ...updates } : null);
      // We return here because an expired item cannot be used.
      return;
    }
    
    // Logic for specific items
    let hpGain = 0;
    if (item.rewardId === '2') { // Power Nap
      hpGain = 20;
    }
    
    let shouldRemove = false;
    
    if (item
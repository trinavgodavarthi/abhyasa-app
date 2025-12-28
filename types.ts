
export type CharacterClass = 'Paladin' | 'Mage' | 'Rogue' | 'Warrior' | 'Bard';

export interface Category {
  id: string;
  label: string;
  icon: string;
  color: string;
}

export interface UserData {
  username: string;
  password?: string;
  level: number;
  xp: number;
  gold: number;
  hp: number;
  lastLogin: any;
  inventory: InventoryItem[];
  characterClass?: CharacterClass;
  categories: Category[];
}

export interface InventoryItem {
  id: string;
  rewardId: string;
  title: string;
  description: string;
  icon: string;
  quantity: number;
  type: 'item' | 'buff' | 'irl';
  durability?: number; // Number of uses left for the current stack unit
  expiryDate?: string; // ISO date for timed items
}

export interface Task {
  id: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string; // Dynamic ID
  completed: boolean;
  createdAt: any;
}

export interface Habit {
  id: string;
  title: string;
  currentStreak: number;
  lastCompleted: any;
  mastered: boolean; // 21 days
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  cost: number;
  type: 'item' | 'buff' | 'irl';
  icon: string;
}

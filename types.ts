
export type CharacterClass = 'Paladin' | 'Mage' | 'Rogue' | 'Warrior' | 'Bard';
export type AttributeType = 'STR' | 'INT' | 'FOC';

export interface Category {
  id: string;
  label: string;
  icon: string;
  color: string;
  alignment: AttributeType;
}

export interface Trophy {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  condition: 'level' | 'quests' | 'gold' | 'habits';
  threshold: number;
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
  trophies: string[]; 
  stats: {
    str: number;
    int: number;
    foc: number;
  };
}

export interface InventoryItem {
  id: string;
  rewardId: string;
  title: string;
  description: string;
  icon: string;
  quantity: number;
  type: 'item' | 'buff' | 'irl';
  durability?: number; 
  expiryDate?: string; 
}

export interface Task {
  id: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string; 
  completed: boolean;
  createdAt: any;
  timeEstimate?: number; 
  timeSpent?: number; 
}

export interface Habit {
  id: string;
  title: string;
  currentStreak: number;
  lastCompleted: any;
  mastered: boolean; 
  targetDays: number; // Custom goal target
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  cost: number;
  type: 'item' | 'buff' | 'irl';
  icon: string;
}

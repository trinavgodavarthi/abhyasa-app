
export type CharacterClass = 'Paladin' | 'Mage' | 'Rogue' | 'Warrior' | 'Bard';
export type AttributeType = 'STR' | 'INT' | 'FOC';

export interface Category {
  id: string;
  label: string;
  icon: string;
  color: string;
  alignment: AttributeType;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  icon: string;
  color: string;
  completed: boolean;
  rewardClaimed: boolean;
  createdAt: string;
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
  dailyStreak: number;
  lastLogin: any;
  inventory: InventoryItem[];
  characterClass?: CharacterClass;
  categories: Category[];
  goals: Goal[];
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
  goalId?: string; // Linked goal
  completed: boolean;
  createdAt: any;
  completedAt?: string; // New field for history
  timeEstimate?: number; 
  timeSpent?: number; 
}

export interface Habit {
  id: string;
  title: string;
  category: string; 
  goalId?: string; // Linked goal
  currentStreak: number;
  lastCompleted: any;
  mastered: boolean; 
  targetDays: number;
  dailyTimeGoal?: number;
  dailyMinutesSpent: number;
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  cost: number;
  type: 'item' | 'buff' | 'irl';
  icon: string;
}

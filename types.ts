
export interface UserData {
  username: string;
  password?: string;
  level: number;
  xp: number;
  gold: number;
  hp: number;
  lastLogin: any;
}

export interface Task {
  id: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
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


/**
 * A simple Mock Storage engine that mimics Firestore behavior 
 * using localStorage to ensure the app works instantly.
 */

const STORAGE_KEY = 'abhyasa_db';

interface DB {
  users: Record<string, any>;
  tasks: Record<string, any[]>;
  habits: Record<string, any[]>;
}

const getDB = (): DB => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : { users: {}, tasks: {}, habits: {} };
};

const saveDB = (db: DB) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
};

export const storage = {
  // Simulate getDoc
  async getUser(username: string) {
    const db = getDB();
    return db.users[username] || null;
  },

  // Simulate setDoc
  async setUser(username: string, data: any) {
    const db = getDB();
    db.users[username] = data;
    saveDB(db);
  },

  // Simulate updateDoc
  async updateUser(username: string, updates: any) {
    const db = getDB();
    if (db.users[username]) {
      db.users[username] = { ...db.users[username], ...updates };
      saveDB(db);
    }
  },

  // Migration for username change
  async renameUser(oldUsername: string, newUsername: string) {
    const db = getDB();
    if (db.users[oldUsername]) {
      // Move User Data
      const userData = { ...db.users[oldUsername], username: newUsername };
      db.users[newUsername] = userData;
      delete db.users[oldUsername];

      // Move Tasks
      if (db.tasks[oldUsername]) {
        db.tasks[newUsername] = db.tasks[oldUsername];
        delete db.tasks[oldUsername];
      }

      // Move Habits
      if (db.habits[oldUsername]) {
        db.habits[newUsername] = db.habits[oldUsername];
        delete db.habits[oldUsername];
      }

      saveDB(db);
      return true;
    }
    return false;
  },

  // Collection operations for Tasks
  async getTasks(username: string) {
    const db = getDB();
    return db.tasks[username] || [];
  },

  async addTask(username: string, task: any) {
    const db = getDB();
    if (!db.tasks[username]) db.tasks[username] = [];
    const newTask = { ...task, id: Math.random().toString(36).substr(2, 9), createdAt: new Date().toISOString() };
    db.tasks[username].push(newTask);
    saveDB(db);
    return newTask;
  },

  async updateTask(username: string, taskId: string, updates: any) {
    const db = getDB();
    if (db.tasks[username]) {
      db.tasks[username] = db.tasks[username].map(t => t.id === taskId ? { ...t, ...updates } : t);
      saveDB(db);
    }
  },

  async deleteTask(username: string, taskId: string) {
    const db = getDB();
    if (db.tasks[username]) {
      db.tasks[username] = db.tasks[username].filter(t => t.id !== taskId);
      saveDB(db);
    }
  },

  // Collection operations for Habits
  async getHabits(username: string) {
    const db = getDB();
    return db.habits[username] || [];
  },

  async addHabit(username: string, habit: any) {
    const db = getDB();
    if (!db.habits[username]) db.habits[username] = [];
    const newHabit = { ...habit, id: Math.random().toString(36).substr(2, 9) };
    db.habits[username].push(newHabit);
    saveDB(db);
    return newHabit;
  },

  async updateHabit(username: string, habitId: string, updates: any) {
    const db = getDB();
    if (db.habits[username]) {
      db.habits[username] = db.habits[username].map(h => h.id === habitId ? { ...h, ...updates } : h);
      saveDB(db);
    }
  },

  async deleteHabit(username: string, habitId: string) {
    const db = getDB();
    if (db.habits[username]) {
      db.habits[username] = db.habits[username].filter(h => h.id !== habitId);
      saveDB(db);
    }
  }
};

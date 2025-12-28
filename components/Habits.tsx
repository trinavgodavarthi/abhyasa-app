
import React, { useState } from 'react';
import { useGame } from '../context/GameContext';

const Habits: React.FC = () => {
  const { user, habits, completeHabit, deleteHabit, addHabit } = useGame();
  const [newTitle, setNewTitle] = useState('');

  const handleAddHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    await addHabit(newTitle);
    setNewTitle('');
  };

  return (
    <div className="space-y-8 animate-in fade-in zoom-in duration-500">
      <div className="bg-rpg-deep-slate border-4 border-rpg-slate p-8 shadow-pixel-card flex flex-col md:flex-row gap-6 items-center justify-between">
        <div>
           <h2 className="font-pixel text-primary text-xl mb-2 uppercase">Daily Training</h2>
           <p className="text-gray-400 text-xs font-bold uppercase tracking-widest italic opacity-60">Consistency leads to greatness</p>
        </div>
        <form onSubmit={handleAddHabit} className="flex w-full md:w-auto gap-2">
          <input 
            required
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            className="flex-1 bg-black/40 border-2 border-rpg-slate p-3 text-white font-display focus:border-primary outline-none" 
            placeholder="NEW HABIT..."
          />
          <button className="bg-primary text-black px-6 font-pixel text-[10px] border-b-4 border-[#7a7a35] active:border-0 transition-all uppercase tracking-tighter">
            Add
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {habits.length === 0 && (
          <div className="col-span-full py-20 bg-black/20 border-4 border-dashed border-rpg-slate rounded-lg text-center opacity-40">
             <span className="material-symbols-outlined text-5xl mb-4">history_edu</span>
             <p className="font-pixel text-[10px]">NO TRAINING REGIMENS DEFINED</p>
          </div>
        )}
        {habits.map(habit => (
          <HabitCard 
            key={habit.id} 
            habit={habit} 
            onComplete={() => completeHabit(habit)} 
            onDelete={() => deleteHabit(habit.id)}
          />
        ))}
      </div>
    </div>
  );
};

const HabitCard = ({ habit, onComplete, onDelete }: any) => {
  const progress = Math.min(100, (habit.currentStreak / 21) * 100);

  return (
    <div className={`bg-rpg-deep-slate border-4 ${habit.mastered ? 'border-primary' : 'border-rpg-slate'} p-6 rounded relative overflow-hidden group shadow-pixel transition-all hover:bg-black/40`}>
      <div className="flex justify-between items-start mb-4">
        <div>
           <h3 className={`font-pixel text-xs mb-1 uppercase ${habit.mastered ? 'text-primary' : 'text-white'}`}>{habit.title}</h3>
           <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">
             {habit.mastered ? 'Legendary Master' : `Streak: ${habit.currentStreak} / 21 Days`}
           </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={onDelete}
            className="opacity-0 group-hover:opacity-100 p-2 text-gray-500 hover:text-rpg-red transition-all"
          >
            <span className="material-symbols-outlined text-sm">delete</span>
          </button>
          <button 
            onClick={onComplete}
            className="bg-black/30 hover:bg-rpg-green/30 p-2 rounded transition-colors"
          >
            <span className="material-symbols-outlined text-rpg-green">task_alt</span>
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="h-3 w-full bg-black/60 rounded-none border border-white/5 relative overflow-hidden">
          <div 
            className={`h-full transition-all duration-1000 ${habit.mastered ? 'bg-primary' : 'bg-blue-500'}`} 
            style={{ width: `${progress}%` }}
          >
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/20"></div>
          </div>
        </div>
        <div className="flex justify-between">
           {[...Array(21)].map((_, i) => (
             <div key={i} className={`size-1 sm:size-1.5 rounded-full ${i < habit.currentStreak ? 'bg-primary' : 'bg-black/40'}`}></div>
           ))}
        </div>
      </div>

      {habit.mastered && (
        <div className="absolute -top-4 -right-4 bg-primary text-black size-12 rotate-45 flex items-end justify-center pb-1">
          <span className="material-symbols-outlined text-sm font-black -rotate-45">military_tech</span>
        </div>
      )}
    </div>
  );
};

export default Habits;

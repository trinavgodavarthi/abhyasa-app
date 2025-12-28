
import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Habit } from '../types';

const Habits: React.FC = () => {
  const { user, habits, completeHabit, deleteHabit, addHabit, updateHabit } = useGame();
  const [newTitle, setNewTitle] = useState('');
  const [newTarget, setNewTarget] = useState(21);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  const handleAddHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    await addHabit(newTitle, newTarget);
    setNewTitle('');
    setNewTarget(21);
  };

  const handleUpdateHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHabit) return;
    await updateHabit(editingHabit.id, { 
      title: editingHabit.title, 
      targetDays: editingHabit.targetDays 
    });
    setEditingHabit(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in zoom-in duration-500">
      <div className="bg-rpg-deep-slate border-4 border-rpg-slate p-8 shadow-pixel-card flex flex-col gap-6 items-start">
        <div>
           <h2 className="font-pixel text-primary text-xl mb-2 uppercase">Daily Training</h2>
           <p className="text-gray-400 text-xs font-bold uppercase tracking-widest italic opacity-60">Consistency leads to greatness</p>
        </div>
        <form onSubmit={handleAddHabit} className="flex flex-wrap w-full gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[8px] font-pixel text-gray-500 mb-2 uppercase">Training Regimen</label>
            <input 
              required
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              className="w-full bg-black/40 border-2 border-rpg-slate p-3 text-white font-display focus:border-primary outline-none" 
              placeholder="NEW HABIT..."
            />
          </div>
          <div className="w-24">
            <label className="block text-[8px] font-pixel text-gray-500 mb-2 uppercase">Target</label>
            <input 
              required
              type="number"
              min="1"
              value={newTarget}
              onChange={e => setNewTarget(parseInt(e.target.value))}
              className="w-full bg-black/40 border-2 border-rpg-slate p-3 text-white font-display focus:border-primary outline-none"
            />
          </div>
          <div className="flex items-end">
            <button className="bg-primary text-black px-6 py-4 font-pixel text-[10px] border-b-4 border-r-4 border-[#7a7a35] active:border-0 active:translate-y-1 active:translate-x-1 transition-all uppercase tracking-tighter">
              Commence
            </button>
          </div>
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
            onEdit={() => setEditingHabit(habit)}
          />
        ))}
      </div>

      {editingHabit && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-rpg-deep-slate border-4 border-rpg-slate p-8 w-full max-w-md shadow-pixel-card">
            <h3 className="font-pixel text-primary text-xs mb-6 uppercase">Modify Training</h3>
            <form onSubmit={handleUpdateHabit} className="space-y-6">
              <div>
                <label className="block text-[8px] font-pixel text-gray-500 mb-2 uppercase">Regimen Title</label>
                <input 
                  required
                  value={editingHabit.title}
                  onChange={e => setEditingHabit({...editingHabit, title: e.target.value})}
                  className="w-full bg-black/40 border-2 border-rpg-slate p-3 text-white font-display outline-none"
                />
              </div>
              <div>
                <label className="block text-[8px] font-pixel text-gray-500 mb-2 uppercase">Target Days</label>
                <input 
                  required
                  type="number"
                  min="1"
                  value={editingHabit.targetDays}
                  onChange={e => setEditingHabit({...editingHabit, targetDays: parseInt(e.target.value)})}
                  className="w-full bg-black/40 border-2 border-rpg-slate p-3 text-white font-display outline-none"
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setEditingHabit(null)} className="flex-1 py-3 bg-gray-700 text-white font-pixel text-[8px] border-b-4 border-black">CANCEL</button>
                <button type="submit" className="flex-1 py-3 bg-primary text-black font-pixel text-[8px] border-b-4 border-r-4 border-[#7a7a35]">SAVE CHANGES</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const HabitCard = ({ habit, onComplete, onDelete, onEdit }: any) => {
  const target = habit.targetDays || 21;
  const progress = Math.min(100, (habit.currentStreak / target) * 100);

  return (
    <div className={`bg-rpg-deep-slate border-4 ${habit.mastered ? 'border-primary shadow-[0_0_15px_rgba(242,204,13,0.2)]' : 'border-rpg-slate'} p-6 rounded relative overflow-hidden group shadow-pixel transition-all hover:bg-black/40`}>
      <div className="flex justify-between items-start mb-4">
        <div>
           <h3 className={`font-pixel text-xs mb-1 uppercase ${habit.mastered ? 'text-primary' : 'text-white'}`}>{habit.title}</h3>
           <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">
             {habit.mastered ? 'Legendary Master' : `Streak: ${habit.currentStreak} / ${target} Days`}
           </p>
        </div>
        <div className="flex gap-1">
          <button 
            onClick={onEdit}
            className="opacity-0 group-hover:opacity-100 p-2 text-gray-500 hover:text-primary transition-all"
            title="Edit Regimen"
          >
            <span className="material-symbols-outlined text-sm">edit</span>
          </button>
          <button 
            onClick={onDelete}
            className="opacity-0 group-hover:opacity-100 p-2 text-gray-500 hover:text-rpg-red transition-all"
            title="Delete Regimen"
          >
            <span className="material-symbols-outlined text-sm">delete</span>
          </button>
          <button 
            onClick={onComplete}
            className="bg-black/30 hover:bg-rpg-green/30 p-2 rounded transition-colors"
            title="Log Training"
          >
            <span className="material-symbols-outlined text-rpg-green">task_alt</span>
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="h-3 w-full bg-black/60 rounded-none border border-white/5 relative overflow-hidden shadow-inner">
          <div 
            className={`h-full transition-all duration-1000 ${habit.mastered ? 'bg-primary' : 'bg-blue-500'}`} 
            style={{ width: `${progress}%` }}
          >
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/20"></div>
          </div>
        </div>
        <div className="flex gap-0.5 overflow-hidden">
           {[...Array(target)].map((_, i) => (
             <div key={i} className={`h-1.5 flex-1 ${i < habit.currentStreak ? 'bg-primary' : 'bg-black/40'} ${i >= 31 ? 'hidden' : ''}`}></div>
           ))}
           {target > 31 && <span className="text-[6px] text-gray-600 self-center">...</span>}
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

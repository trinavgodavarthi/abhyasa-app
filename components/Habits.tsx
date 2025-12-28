
import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { Habit } from '../types';

const Habits: React.FC = () => {
  const { user, habits, completeHabit, deleteHabit, addHabit, updateHabit } = useGame();
  const [newTitle, setNewTitle] = useState('');
  const [newTarget, setNewTarget] = useState(21);
  const [newTimeGoal, setNewTimeGoal] = useState(0);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  const handleAddHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    await addHabit(newTitle, newTarget, newTimeGoal);
    setNewTitle('');
    setNewTarget(21);
    setNewTimeGoal(0);
  };

  const handleUpdateHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHabit) return;
    await updateHabit(editingHabit.id, { 
      title: editingHabit.title, 
      targetDays: editingHabit.targetDays,
      dailyTimeGoal: editingHabit.dailyTimeGoal
    });
    setEditingHabit(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in zoom-in duration-500 pb-12">
      {/* Header & Add Form */}
      <div className="bg-rpg-deep-slate border-4 border-rpg-slate p-8 shadow-pixel relative">
        <div className="absolute top-0 right-0 p-4 pointer-events-none opacity-10">
           <span className="material-symbols-outlined text-8xl">fitness_center</span>
        </div>
        
        <div className="w-full flex justify-between items-center mb-8">
           <div>
              <h2 className="font-pixel text-primary text-xl mb-2 uppercase tracking-tighter">Combat Training</h2>
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest italic opacity-60">Sharpen your soul through daily repetition</p>
           </div>
        </div>

        <form onSubmit={handleAddHabit} className="flex flex-wrap w-full gap-4 relative z-10">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[8px] font-pixel text-gray-500 mb-2 uppercase">Regimen Designation</label>
            <input 
              required
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              className="w-full bg-black/60 border-2 border-rpg-slate p-4 text-white font-display focus:border-primary outline-none transition-colors" 
              placeholder="E.G. ARCANE STUDY, PHYSICAL LABOR..."
            />
          </div>
          <div className="w-24">
            <label className="block text-[8px] font-pixel text-gray-500 mb-2 uppercase">Target (Days)</label>
            <input 
              required
              type="number"
              min="1"
              value={newTarget}
              onChange={e => setNewTarget(parseInt(e.target.value))}
              className="w-full bg-black/60 border-2 border-rpg-slate p-4 text-white font-display focus:border-primary outline-none"
            />
          </div>
          <div className="w-28">
            <label className="block text-[8px] font-pixel text-gray-500 mb-2 uppercase">Daily Goal (Min)</label>
            <input 
              required
              type="number"
              min="0"
              value={newTimeGoal}
              onChange={e => setNewTimeGoal(parseInt(e.target.value))}
              className="w-full bg-black/60 border-2 border-rpg-slate p-4 text-white font-display focus:border-primary outline-none"
            />
          </div>
          <div className="flex items-end">
            <button className="bg-primary text-black px-8 py-4 font-pixel text-[10px] border-b-8 border-r-8 border-[#7a7a35] hover:brightness-110 active:border-0 active:translate-y-2 active:translate-x-2 transition-all uppercase tracking-tighter">
              Commence
            </button>
          </div>
        </form>
      </div>

      {/* Habits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {habits.length === 0 && (
          <div className="col-span-full py-20 bg-black/20 border-4 border-dashed border-rpg-slate rounded text-center opacity-40">
             <span className="material-symbols-outlined text-6xl mb-4">history_edu</span>
             <p className="font-pixel text-[10px]">THE ARCHIVES ARE EMPTY</p>
             <p className="text-xs mt-2 uppercase font-bold">Define your first regimen above</p>
          </div>
        )}
        {habits.map(habit => (
          <HabitCard 
            key={habit.id} 
            habit={habit} 
            onComplete={() => completeHabit(habit)} 
            onDelete={() => deleteHabit(habit.id)}
            onEdit={() => setEditingHabit(habit)}
            onUpdateMinutes={(mins) => updateHabit(habit.id, { dailyMinutesSpent: (habit.dailyMinutesSpent || 0) + mins })}
          />
        ))}
      </div>

      {/* Edit Modal */}
      {editingHabit && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-rpg-deep-slate border-4 border-rpg-slate p-8 w-full max-w-md shadow-pixel-card">
            <div className="flex justify-between items-center mb-8 border-b-2 border-white/5 pb-4">
              <h3 className="font-pixel text-primary text-[10px] uppercase">Alter Training Regimen</h3>
              <button onClick={() => setEditingHabit(null)} className="text-gray-500 hover:text-white transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleUpdateHabit} className="space-y-6">
              <div>
                <label className="block text-[8px] font-pixel text-gray-500 mb-2 uppercase">New Title</label>
                <input 
                  required
                  value={editingHabit.title}
                  onChange={e => setEditingHabit({...editingHabit, title: e.target.value})}
                  className="w-full bg-black/60 border-2 border-rpg-slate p-4 text-white font-display outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[8px] font-pixel text-gray-500 mb-2 uppercase">Mastery (Days)</label>
                  <input 
                    required
                    type="number"
                    min="1"
                    value={editingHabit.targetDays}
                    onChange={e => setEditingHabit({...editingHabit, targetDays: parseInt(e.target.value)})}
                    className="w-full bg-black/60 border-2 border-rpg-slate p-4 text-white font-display outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[8px] font-pixel text-gray-500 mb-2 uppercase">Focus Goal (Min)</label>
                  <input 
                    required
                    type="number"
                    min="0"
                    value={editingHabit.dailyTimeGoal || 0}
                    onChange={e => setEditingHabit({...editingHabit, dailyTimeGoal: parseInt(e.target.value)})}
                    className="w-full bg-black/60 border-2 border-rpg-slate p-4 text-white font-display outline-none"
                  />
                </div>
              </div>
              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setEditingHabit(null)} className="flex-1 py-4 bg-gray-700 text-white font-pixel text-[8px] border-b-4 border-black">CANCEL</button>
                <button type="submit" className="flex-[2] py-4 bg-primary text-black font-pixel text-[8px] border-b-4 border-r-4 border-[#7a7a35]">SAVE CHANGES</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const HabitCard = ({ habit, onComplete, onDelete, onEdit, onUpdateMinutes }: any) => {
  const target = habit.targetDays || 21;
  const timeGoal = habit.dailyTimeGoal || 0;
  const progress = Math.min(100, (habit.currentStreak / target) * 100);
  
  const [timerActive, setTimerActive] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (timerActive) {
      timerRef.current = window.setInterval(() => {
        setSeconds(prev => {
          const next = prev + 1;
          // Every 60 seconds, update the persistent storage
          if (next % 60 === 0) {
            onUpdateMinutes(1);
          }
          return next;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timerActive]);

  const totalSecondsSpent = (habit.dailyMinutesSpent || 0) * 60 + seconds;
  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const rs = s % 60;
    if (h > 0) return `${h}h ${m}m ${rs}s`;
    return `${m.toString().padStart(2, '0')}:${rs.toString().padStart(2, '0')}`;
  };

  const goalMet = timeGoal > 0 && totalSecondsSpent >= timeGoal * 60;
  const timeProgress = timeGoal > 0 ? Math.min(100, (totalSecondsSpent / (timeGoal * 60)) * 100) : 0;

  return (
    <div className={`bg-rpg-deep-slate border-4 p-8 relative overflow-hidden group shadow-pixel transition-all hover:bg-black/20 flex flex-col gap-6 ${habit.mastered ? 'border-primary shadow-[0_0_20px_rgba(242,204,13,0.1)]' : 'border-rpg-slate'}`}>
      {/* Background Icon */}
      <span className="absolute -bottom-4 -left-4 material-symbols-outlined text-white/5 text-8xl pointer-events-none group-hover:scale-110 transition-transform">history_edu</span>
      
      <div className="flex justify-between items-start relative z-10">
        <div className="min-w-0 flex-1">
           <h3 className={`font-pixel text-xs mb-2 truncate uppercase tracking-tighter ${habit.mastered ? 'text-primary' : 'text-white'}`}>{habit.title}</h3>
           <div className="flex items-center gap-3">
              <span className="text-gray-500 text-[8px] font-pixel uppercase">Current Mastery: {habit.currentStreak} / {target} Days</span>
              {habit.mastered && <span className="bg-primary text-black font-pixel text-[6px] px-1 animate-pulse">LEGENDARY</span>}
           </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={onEdit}
            className="p-2 text-gray-600 hover:text-primary transition-all rounded-sm hover:bg-white/5"
            title="Edit Regimen"
          >
            <span className="material-symbols-outlined text-lg">edit</span>
          </button>
          <button 
            onClick={onDelete}
            className="p-2 text-gray-600 hover:text-rpg-red transition-all rounded-sm hover:bg-white/5"
            title="Delete Regimen"
          >
            <span className="material-symbols-outlined text-lg">delete</span>
          </button>
        </div>
      </div>

      {/* Timer Section */}
      {timeGoal > 0 && (
        <div className={`p-4 rounded border-2 transition-all relative z-10 ${goalMet ? 'bg-rpg-green/5 border-rpg-green/40' : 'bg-black/40 border-white/5'}`}>
           <div className="flex justify-between items-end mb-4">
             <div>
               <p className="text-[8px] font-pixel text-gray-500 uppercase mb-1">Concentration Progress</p>
               <div className="flex items-center gap-2">
                 <span className={`material-symbols-outlined text-sm ${timerActive ? 'animate-spin' : ''}`}>
                    {goalMet ? 'verified' : 'hourglass_empty'}
                 </span>
                 <span className={`text-xl font-ui font-black tabular-nums ${goalMet ? 'text-rpg-green' : 'text-primary'}`}>
                   {formatTime(totalSecondsSpent)}
                 </span>
                 <span className="text-gray-600 text-[10px] font-black uppercase">/ {timeGoal}m</span>
               </div>
             </div>
             {goalMet && <span className="font-pixel text-[8px] text-rpg-green animate-bounce uppercase">Goal Met!</span>}
           </div>
           
           <div className="h-2 w-full bg-black/60 rounded-none overflow-hidden border border-white/5 mb-4">
              <div 
                className={`h-full transition-all duration-1000 ${goalMet ? 'bg-rpg-green shadow-[0_0_10px_rgba(122,196,86,0.5)]' : 'bg-primary'}`} 
                style={{ width: `${timeProgress}%` }}
              ></div>
           </div>

           <div className="flex gap-2">
              <button 
                onClick={() => setTimerActive(!timerActive)}
                className={`flex-1 py-3 text-[8px] font-pixel border-b-4 border-r-4 transition-all flex items-center justify-center gap-2
                  ${timerActive ? 'bg-yellow-600 text-white border-yellow-800' : 'bg-rpg-slate text-white border-black'}`}
              >
                <span className="material-symbols-outlined text-sm">{timerActive ? 'pause' : 'play_arrow'}</span>
                {timerActive ? 'PAUSE' : 'START FOCUS'}
              </button>
              <button 
                onClick={() => { setTimerActive(false); setSeconds(0); onUpdateMinutes(-(habit.dailyMinutesSpent || 0)); }}
                className="px-4 bg-black/40 text-gray-500 hover:text-white border-b-4 border-black transition-all flex items-center justify-center"
                title="Reset daily progress"
              >
                <span className="material-symbols-outlined text-sm">refresh</span>
              </button>
           </div>
        </div>
      )}

      {/* Mastery Progress Bar */}
      <div className="space-y-3 relative z-10">
        <div className="flex justify-between items-center text-[8px] font-pixel text-gray-500 uppercase tracking-tighter">
           <span>Mastery Arc</span>
           <span className="tabular-nums">{Math.floor(progress)}% Complete</span>
        </div>
        <div className="h-4 w-full bg-black/60 border-2 border-white/5 relative overflow-hidden shadow-inner">
          <div 
            className={`h-full transition-all duration-1000 ${habit.mastered ? 'bg-primary shadow-[0_0_15px_rgba(242,204,13,0.4)]' : 'bg-blue-600'}`} 
            style={{ width: `${progress}%` }}
          >
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/20"></div>
          </div>
        </div>
      </div>

      <button 
        onClick={onComplete}
        className={`w-full py-5 font-pixel text-[10px] border-b-8 border-r-8 transition-all flex items-center justify-center gap-3 relative z-10
          ${goalMet || timeGoal === 0 ? 'bg-rpg-green text-black border-[#4e8235] hover:brightness-110 active:border-0 active:translate-y-2 active:translate-x-2' : 'bg-gray-800 text-gray-500 border-black opacity-40 cursor-not-allowed'}`}
      >
        <span className="material-symbols-outlined text-lg">workspace_premium</span>
        {goalMet ? 'VICTORY - LOG TRAINING' : timeGoal > 0 ? 'COMPLETE GOAL TO LOG' : 'LOG TRAINING'}
      </button>

      {habit.mastered && (
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none border-2 border-primary/20 animate-pulse"></div>
      )}
    </div>
  );
};

export default Habits;

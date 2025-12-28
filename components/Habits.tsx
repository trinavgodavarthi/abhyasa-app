
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
      <div className="bg-rpg-deep-slate border-4 border-rpg-slate p-8 shadow-pixel-card flex flex-col gap-6 items-start">
        <div className="w-full flex justify-between items-center">
           <div>
              <h2 className="font-pixel text-primary text-xl mb-2 uppercase">Daily Training</h2>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest italic opacity-60">Forge your discipline through repetition</p>
           </div>
           <div className="hidden sm:block text-[10px] font-pixel text-gray-600 uppercase">
             Mastery Requires Focus
           </div>
        </div>
        <form onSubmit={handleAddHabit} className="flex flex-wrap w-full gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[8px] font-pixel text-gray-500 mb-2 uppercase">Training Regimen</label>
            <input 
              required
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              className="w-full bg-black/40 border-2 border-rpg-slate p-3 text-white font-display focus:border-primary outline-none" 
              placeholder="E.G. MEDITATION, CODING..."
            />
          </div>
          <div className="w-24">
            <label className="block text-[8px] font-pixel text-gray-500 mb-2 uppercase">Goal (Days)</label>
            <input 
              required
              type="number"
              min="1"
              value={newTarget}
              onChange={e => setNewTarget(parseInt(e.target.value))}
              className="w-full bg-black/40 border-2 border-rpg-slate p-3 text-white font-display focus:border-primary outline-none"
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
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-pixel text-primary text-xs uppercase">Modify Training</h3>
              <button onClick={() => setEditingHabit(null)} className="text-gray-500 hover:text-white">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[8px] font-pixel text-gray-500 mb-2 uppercase">Target (Days)</label>
                  <input 
                    required
                    type="number"
                    min="1"
                    value={editingHabit.targetDays}
                    onChange={e => setEditingHabit({...editingHabit, targetDays: parseInt(e.target.value)})}
                    className="w-full bg-black/40 border-2 border-rpg-slate p-3 text-white font-display outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[8px] font-pixel text-gray-500 mb-2 uppercase">Daily Goal (Min)</label>
                  <input 
                    required
                    type="number"
                    min="0"
                    value={editingHabit.dailyTimeGoal || 0}
                    onChange={e => setEditingHabit({...editingHabit, dailyTimeGoal: parseInt(e.target.value)})}
                    className="w-full bg-black/40 border-2 border-rpg-slate p-3 text-white font-display outline-none"
                  />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setEditingHabit(null)} className="flex-1 py-3 bg-gray-700 text-white font-pixel text-[8px] border-b-4 border-black">CANCEL</button>
                <button type="submit" className="flex-[2] py-3 bg-primary text-black font-pixel text-[8px] border-b-4 border-r-4 border-[#7a7a35]">SAVE CHANGES</button>
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
  const timeGoal = habit.dailyTimeGoal || 0;
  const progress = Math.min(100, (habit.currentStreak / target) * 100);
  
  const [timerActive, setTimerActive] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (timerActive) {
      timerRef.current = window.setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timerActive]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const rs = s % 60;
    return `${m}:${rs.toString().padStart(2, '0')}`;
  };

  const timeProgress = timeGoal > 0 ? Math.min(100, (seconds / (timeGoal * 60)) * 100) : 0;
  const goalMet = timeGoal > 0 && seconds >= timeGoal * 60;

  return (
    <div className={`bg-rpg-deep-slate border-4 ${habit.mastered ? 'border-primary shadow-[0_0_15px_rgba(242,204,13,0.2)]' : 'border-rpg-slate'} p-6 rounded relative overflow-hidden group shadow-pixel transition-all hover:bg-black/40 flex flex-col gap-4`}>
      <div className="flex justify-between items-start">
        <div className="min-w-0 flex-1 pr-4">
           <h3 className={`font-pixel text-xs mb-1 truncate uppercase ${habit.mastered ? 'text-primary' : 'text-white'}`}>{habit.title}</h3>
           <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest truncate">
             {habit.mastered ? 'Legendary Master' : `Streak: ${habit.currentStreak} / ${target} Days`}
           </p>
        </div>
        <div className="flex gap-1 shrink-0">
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
        </div>
      </div>

      {timeGoal > 0 && (
        <div className="bg-black/40 p-3 rounded border border-white/5 space-y-3">
           <div className="flex justify-between items-center">
             <span className="text-[8px] font-pixel text-gray-500 uppercase">Daily Time Goal: {timeGoal}m</span>
             <span className={`text-[10px] font-pixel tabular-nums ${goalMet ? 'text-rpg-green' : 'text-primary'}`}>
               {formatTime(seconds)}
             </span>
           </div>
           
           <div className="h-2 w-full bg-black/60 rounded-none overflow-hidden relative border border-white/10">
              <div 
                className={`h-full transition-all duration-1000 ${goalMet ? 'bg-rpg-green' : 'bg-primary'}`} 
                style={{ width: `${timeProgress}%` }}
              ></div>
           </div>

           <div className="flex gap-2">
              <button 
                onClick={() => setTimerActive(!timerActive)}
                className={`flex-1 py-2 text-[8px] font-pixel border-b-2 border-r-2 transition-all flex items-center justify-center gap-2
                  ${timerActive ? 'bg-yellow-600 text-white border-yellow-800' : 'bg-rpg-slate text-white border-black'}`}
              >
                <span className="material-symbols-outlined text-xs">{timerActive ? 'pause' : 'play_arrow'}</span>
                {timerActive ? 'PAUSE' : 'START'}
              </button>
              <button 
                onClick={() => { setTimerActive(false); setSeconds(0); }}
                className="px-3 bg-black/40 text-gray-500 hover:text-white border-b-2 border-black flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-xs">refresh</span>
              </button>
           </div>
        </div>
      )}

      <div className="space-y-2 mt-auto">
        <div className="flex justify-between text-[8px] font-pixel text-gray-500 uppercase tracking-tighter">
           <span>Mastery Progress</span>
           <span className="tabular-nums">{Math.floor(progress)}%</span>
        </div>
        <div className="h-3 w-full bg-black/60 rounded-none border border-white/5 relative overflow-hidden shadow-inner">
          <div 
            className={`h-full transition-all duration-1000 ${habit.mastered ? 'bg-primary' : 'bg-blue-500'}`} 
            style={{ width: `${progress}%` }}
          >
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/20"></div>
          </div>
        </div>
      </div>

      <button 
        onClick={onComplete}
        className={`w-full py-4 font-pixel text-[10px] border-b-4 border-r-4 transition-all flex items-center justify-center gap-2
          ${goalMet || timeGoal === 0 ? 'bg-rpg-green text-black border-[#4e8235] hover:brightness-110' : 'bg-gray-800 text-gray-400 border-black opacity-60'}`}
      >
        <span className="material-symbols-outlined text-sm">task_alt</span>
        {goalMet ? 'GOAL MET - LOG TRAINING' : 'LOG TRAINING'}
      </button>

      {habit.mastered && (
        <div className="absolute -top-4 -right-4 bg-primary text-black size-12 rotate-45 flex items-end justify-center pb-1">
          <span className="material-symbols-outlined text-sm font-black -rotate-45">military_tech</span>
        </div>
      )}
    </div>
  );
};

export default Habits;

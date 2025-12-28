
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useGame } from '../context/GameContext';
import { Habit } from '../types';

const Habits: React.FC = () => {
  const { habits, completeHabit, deleteHabit, addHabit, updateHabit } = useGame();
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

  // Stability: use stable callback for minute updates
  const persistMinutes = useCallback((habitId: string, currentMins: number, delta: number) => {
    updateHabit(habitId, { dailyMinutesSpent: Math.max(0, currentMins + delta) });
  }, [updateHabit]);

  return (
    <div className="space-y-8 animate-in fade-in zoom-in duration-500 pb-12">
      {/* Header & Add Form */}
      <div className="bg-rpg-deep-slate border-4 border-rpg-slate p-8 shadow-pixel relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 pointer-events-none opacity-10">
           <span className="material-symbols-outlined text-8xl">fitness_center</span>
        </div>
        
        <div className="w-full flex justify-between items-center mb-8 relative z-10">
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
             <p className="text-xs mt-2 uppercase font-bold text-gray-400">Define your first regimen above</p>
          </div>
        )}
        {habits.map(habit => (
          <HabitCard 
            key={habit.id} 
            habit={habit} 
            onComplete={() => completeHabit(habit)} 
            onDelete={() => deleteHabit(habit.id)}
            onEdit={() => setEditingHabit(habit)}
            onUpdateMinutes={(delta: number) => persistMinutes(habit.id, habit.dailyMinutesSpent || 0, delta)}
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
                  className="w-full bg-black/60 border-2 border-rpg-slate p-4 text-white font-display outline-none focus:border-primary"
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

interface HabitCardProps {
  habit: Habit;
  onComplete: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onUpdateMinutes: (delta: number) => void;
}

const HabitCard = ({ habit, onComplete, onDelete, onEdit, onUpdateMinutes }: HabitCardProps) => {
  const target = habit.targetDays || 21;
  const timeGoal = habit.dailyTimeGoal || 0;
  const progress = Math.min(100, (habit.currentStreak / target) * 100);
  
  const [timerActive, setTimerActive] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const onUpdateMinutesRef = useRef(onUpdateMinutes);

  useEffect(() => {
    onUpdateMinutesRef.current = onUpdateMinutes;
  }, [onUpdateMinutes]);

  useEffect(() => {
    let interval: number | null = null;
    if (timerActive) {
      interval = window.setInterval(() => {
        setSeconds(prev => {
          const next = prev + 1;
          if (next >= 60) {
            onUpdateMinutesRef.current(1);
            return 0;
          }
          return next;
        });
      }, 1000);
    }
    return () => { if (interval) clearInterval(interval); };
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
    <div className={`bg-rpg-deep-slate border-4 p-8 relative overflow-hidden group shadow-pixel transition-all hover:bg-black/30 flex flex-col gap-6 
      ${timerActive ? 'border-primary ring-2 ring-primary/20' : 'border-rpg-slate'} 
      ${habit.mastered ? 'shadow-[0_0_20px_rgba(242,204,13,0.15)]' : ''}`}>
      
      {/* Background Icon */}
      <span className="absolute -bottom-4 -left-4 material-symbols-outlined text-white/5 text-8xl pointer-events-none group-hover:scale-110 transition-transform">history_edu</span>
      
      <div className="flex justify-between items-start relative z-10">
        <div className="min-w-0 flex-1">
           <h3 className={`font-pixel text-xs mb-2 truncate uppercase tracking-tighter ${habit.mastered ? 'text-primary' : 'text-white'}`}>{habit.title}</h3>
           <div className="flex items-center gap-3">
              <span className="text-gray-500 text-[8px] font-pixel uppercase">Current Mastery: {habit.currentStreak} / {target} Days</span>
              {habit.mastered && <span className="bg-primary text-black font-pixel text-[6px] px-1 animate-pulse rounded-sm">LEGENDARY</span>}
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
        <div className={`p-5 rounded border-2 transition-all relative z-10 
          ${goalMet ? 'bg-rpg-green/10 border-rpg-green/40 shadow-[0_0_15px_rgba(122,196,86,0.1)]' : 'bg-black/40 border-white/5 shadow-inner'}`}>
           
           {/* Visual Goal Marker */}
           {goalMet && (
             <div className="absolute top-2 right-2 flex items-center gap-1">
                <span className="font-pixel text-[6px] text-rpg-green animate-pulse uppercase">Focus Goal Met</span>
                <span className="material-symbols-outlined text-rpg-green text-sm">verified</span>
             </div>
           )}

           <div className="flex justify-between items-end mb-4">
             <div>
               <p className="text-[8px] font-pixel text-gray-500 uppercase mb-2">Concentration Progress</p>
               <div className="flex items-center gap-2">
                 <span className={`material-symbols-outlined text-sm ${timerActive ? 'animate-spin text-primary' : 'text-gray-600'}`}>
                    {goalMet ? 'auto_awesome' : (timerActive ? 'sync' : 'hourglass_empty')}
                 </span>
                 <span className={`text-2xl font-ui font-black tabular-nums tracking-wider ${goalMet ? 'text-rpg-green' : (timerActive ? 'text-primary' : 'text-white/60')}`}>
                   {formatTime(totalSecondsSpent)}
                 </span>
                 <span className="text-gray-600 text-[10px] font-black uppercase ml-1">/ {timeGoal}m</span>
               </div>
             </div>
           </div>
           
           <div className="h-3 w-full bg-black/60 rounded-none overflow-hidden border border-white/5 mb-6 relative">
              <div 
                className={`h-full transition-all duration-1000 relative ${goalMet ? 'bg-rpg-green shadow-[0_0_10px_rgba(122,196,86,0.5)]' : 'bg-primary'}`} 
                style={{ width: `${timeProgress}%` }}
              >
                {/* Animated stripes if timer active */}
                {timerActive && (
                  <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.1)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.1)_50%,rgba(255,255,255,0.1)_75%,transparent_75%,transparent)] bg-[length:20px_20px] animate-[pulse_1.5s_infinite]"></div>
                )}
              </div>
           </div>

           <div className="flex gap-3">
              <button 
                onClick={() => setTimerActive(!timerActive)}
                className={`flex-1 py-4 text-[8px] font-pixel border-b-4 border-r-4 transition-all flex items-center justify-center gap-2
                  ${timerActive ? 'bg-yellow-600 text-white border-yellow-800' : 'bg-rpg-slate text-white border-black hover:bg-rpg-slate/80'}`}
              >
                <span className="material-symbols-outlined text-sm">{timerActive ? 'pause' : 'play_arrow'}</span>
                {timerActive ? 'PAUSE FOCUS' : 'START FOCUS'}
              </button>
              <button 
                onClick={() => { setTimerActive(false); setSeconds(0); onUpdateMinutes(-(habit.dailyMinutesSpent || 0)); }}
                className="px-5 bg-black/40 text-gray-500 hover:text-white border-b-4 border-black transition-all flex items-center justify-center hover:bg-black/60"
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
           <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[10px]">auto_graph</span> Mastery Arc</span>
           <span className="tabular-nums font-bold">{Math.floor(progress)}% Complete</span>
        </div>
        <div className="h-4 w-full bg-black/60 border-2 border-white/5 relative overflow-hidden shadow-inner p-[2px]">
          <div 
            className={`h-full transition-all duration-1000 ${habit.mastered ? 'bg-primary shadow-[0_0_15px_rgba(242,204,13,0.4)]' : 'bg-blue-600'}`} 
            style={{ width: `${progress}%` }}
          >
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/30"></div>
          </div>
        </div>
      </div>

      <button 
        onClick={onComplete}
        className={`w-full py-5 font-pixel text-[10px] border-b-8 border-r-8 transition-all flex items-center justify-center gap-3 relative z-10
          ${goalMet || timeGoal === 0 
            ? 'bg-rpg-green text-black border-[#4e8235] hover:brightness-110 active:border-0 active:translate-y-2 active:translate-x-2' 
            : 'bg-gray-800 text-gray-500 border-black opacity-40 cursor-not-allowed shadow-none'}`}
      >
        <span className="material-symbols-outlined text-lg">{goalMet ? 'military_tech' : 'lock'}</span>
        {goalMet ? 'VICTORY - LOG TRAINING' : timeGoal > 0 ? 'COMPLETE GOAL TO LOG' : 'LOG TRAINING'}
      </button>

      {/* Mastery Badge Overlay */}
      {habit.mastered && (
        <div className="absolute -top-6 -right-6 bg-primary text-black size-16 rotate-45 flex items-end justify-center pb-2 shadow-2xl">
          <span className="material-symbols-outlined text-sm font-black -rotate-45">workspace_premium</span>
        </div>
      )}

      {/* Focused State Pulsing Overlay */}
      {timerActive && (
        <div className="absolute inset-0 pointer-events-none border-2 border-primary/20 animate-pulse z-0"></div>
      )}
    </div>
  );
};

export default Habits;

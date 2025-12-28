
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useGame } from '../context/GameContext';
import { Habit } from '../types';
import { isToday } from 'date-fns';

const Habits: React.FC = () => {
  const { user, habits, completeHabit, deleteHabit, addHabit, updateHabit } = useGame();
  const [newTitle, setNewTitle] = useState('');
  const [newCatId, setNewCatId] = useState('');
  const [newGoalId, setNewGoalId] = useState('');
  const [newTarget, setNewTarget] = useState(21);
  const [newTimeGoal, setNewTimeGoal] = useState(0);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  useEffect(() => {
    if (user?.categories?.length && !newCatId) {
      setNewCatId(user.categories[0].id);
    }
  }, [user?.categories, newCatId]);

  const handleAddHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newCatId) return;
    await addHabit(newTitle, newCatId, newGoalId || undefined, newTarget, newTimeGoal);
    setNewTitle('');
    setNewGoalId('');
    setNewTarget(21);
    setNewTimeGoal(0);
  };

  const handleUpdateHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHabit) return;
    await updateHabit(editingHabit.id, { 
      title: editingHabit.title, 
      category: editingHabit.category,
      goalId: editingHabit.goalId,
      targetDays: editingHabit.targetDays,
      dailyTimeGoal: editingHabit.dailyTimeGoal
    });
    setEditingHabit(null);
  };

  const persistMinutes = useCallback((habitId: string, currentMins: number, delta: number) => {
    updateHabit(habitId, { dailyMinutesSpent: Math.max(0, currentMins + delta) });
  }, [updateHabit]);

  return (
    <div className="space-y-8 animate-in fade-in zoom-in duration-500 pb-12">
      <div className="bg-rpg-deep-slate border-4 border-rpg-slate p-8 shadow-pixel relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 pointer-events-none opacity-10">
           <span className="material-symbols-outlined text-8xl">fitness_center</span>
        </div>
        
        <div className="w-full mb-8 relative z-10">
           <h2 className="font-pixel text-primary text-xl mb-2 uppercase tracking-tighter">Combat Training</h2>
           <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest italic opacity-60">Sharpen your soul through daily repetition</p>
        </div>

        <form onSubmit={handleAddHabit} className="flex flex-wrap w-full gap-4 relative z-10">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[8px] font-pixel text-gray-500 mb-2 uppercase">Training Regimen</label>
            <input required value={newTitle} onChange={e => setNewTitle(e.target.value)} className="w-full bg-black/60 border-2 border-rpg-slate p-4 text-white font-display focus:border-primary outline-none transition-all" placeholder="E.G. ARCANE STUDY..." />
          </div>
          <div className="w-32">
            <label className="block text-[8px] font-pixel text-gray-500 mb-2 uppercase">Category</label>
            <select value={newCatId} onChange={e => setNewCatId(e.target.value)} className="w-full bg-black/60 border-2 border-rpg-slate p-4 text-white font-pixel text-[8px] focus:border-primary outline-none">
              {user?.categories.map(c => <option key={c.id} value={c.id}>{c.label.toUpperCase()}</option>)}
            </select>
          </div>
          <div className="w-40">
            <label className="block text-[8px] font-pixel text-gray-500 mb-2 uppercase">Link Great Work</label>
            <select value={newGoalId} onChange={e => setNewGoalId(e.target.value)} className="w-full bg-black/60 border-2 border-rpg-slate p-4 text-white font-pixel text-[8px] focus:border-primary outline-none">
              <option value="">-- NONE --</option>
              {user?.goals.map(g => <option key={g.id} value={g.id}>{g.title.toUpperCase()}</option>)}
            </select>
          </div>
          <div className="w-24">
            <label className="block text-[8px] font-pixel text-gray-500 mb-2 uppercase">Target (Days)</label>
            <input required type="number" min="1" value={newTarget} onChange={e => setNewTarget(parseInt(e.target.value))} className="w-full bg-black/60 border-2 border-rpg-slate p-4 text-white font-display focus:border-primary outline-none" />
          </div>
          <div className="w-28">
            <label className="block text-[8px] font-pixel text-gray-500 mb-2 uppercase">Goal (Min)</label>
            <input required type="number" min="0" value={newTimeGoal} onChange={e => setNewTimeGoal(parseInt(e.target.value))} className="w-full bg-black/60 border-2 border-rpg-slate p-4 text-white font-display focus:border-primary outline-none" />
          </div>
          <div className="flex items-end">
            <button className="bg-primary text-black px-8 py-4 font-pixel text-[10px] border-b-8 border-r-8 border-[#7a7a35] hover:brightness-110 active:translate-y-2 active:translate-x-2 transition-all uppercase tracking-tighter">
              Commence
            </button>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {habits.length === 0 ? (
          <div className="col-span-full py-20 bg-black/20 border-4 border-dashed border-rpg-slate/40 text-center opacity-40">
             <span className="material-symbols-outlined text-6xl mb-4">history_edu</span>
             <p className="font-pixel text-[10px] uppercase tracking-widest">No Active Training Regimens</p>
             <p className="mt-2 text-[8px] font-pixel uppercase tracking-tighter">Draft your first habit above to begin ascension</p>
          </div>
        ) : (
          habits.map(habit => (
            <HabitCard 
              key={habit.id} 
              habit={habit} 
              categories={user?.categories || []}
              goals={user?.goals || []}
              onComplete={() => completeHabit(habit)} 
              onDelete={() => deleteHabit(habit.id)}
              onEdit={() => setEditingHabit(habit)}
              onUpdateMinutes={(delta: number) => persistMinutes(habit.id, habit.dailyMinutesSpent || 0, delta)}
            />
          ))
        )}
      </div>

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
                <input required value={editingHabit.title} onChange={e => setEditingHabit({...editingHabit, title: e.target.value})} className="w-full bg-black/60 border-2 border-rpg-slate p-4 text-white font-display outline-none" />
              </div>
              <div>
                <label className="block text-[8px] font-pixel text-gray-500 mb-2 uppercase">Great Work Link</label>
                <select value={editingHabit.goalId || ''} onChange={e => setEditingHabit({...editingHabit, goalId: e.target.value || undefined})} className="w-full bg-black/60 border-2 border-rpg-slate p-4 text-white font-pixel text-[8px]">
                  <option value="">-- NONE --</option>
                  {user?.goals.map(g => <option key={g.id} value={g.id}>{g.title.toUpperCase()}</option>)}
                </select>
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

const HabitCard = ({ habit, categories, goals, onComplete, onDelete, onEdit, onUpdateMinutes }: any) => {
  const target = habit.targetDays || 21;
  const timeGoal = habit.dailyTimeGoal || 0;
  const progress = Math.min(100, (habit.currentStreak / target) * 100);
  const cat = categories.find((c: any) => c.id === habit.category);
  const goal = goals.find((g: any) => g.id === habit.goalId);
  const alignment = cat?.alignment || 'FOC';
  
  const [timerActive, setTimerActive] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const onUpdateMinutesRef = useRef(onUpdateMinutes);

  const completedToday = habit.lastCompleted ? isToday(new Date(habit.lastCompleted)) : false;

  useEffect(() => { onUpdateMinutesRef.current = onUpdateMinutes; }, [onUpdateMinutes]);

  useEffect(() => {
    let interval: number | null = null;
    if (timerActive) {
      interval = window.setInterval(() => {
        setSeconds(prev => {
          const next = prev + 1;
          if (next >= 60) { onUpdateMinutesRef.current(1); return 0; }
          return next;
        });
      }, 1000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [timerActive]);

  const totalSecondsSpent = (habit.dailyMinutesSpent || 0) * 60 + seconds;
  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const rs = s % 60;
    return `${m.toString().padStart(2, '0')}:${rs.toString().padStart(2, '0')}`;
  };

  const goalMet = timeGoal > 0 ? totalSecondsSpent >= timeGoal * 60 : true;
  const canComplete = goalMet && !completedToday;
  const timeProgress = timeGoal > 0 ? Math.min(100, (totalSecondsSpent / (timeGoal * 60)) * 100) : 0;

  return (
    <div className={`bg-rpg-deep-slate border-4 p-8 relative overflow-hidden group shadow-pixel transition-all hover:bg-black/30 flex flex-col gap-6 
      ${timerActive ? 'border-primary ring-2 ring-primary/10' : completedToday ? 'border-rpg-green shadow-[0_0_15px_rgba(122,196,86,0.1)]' : 'border-rpg-slate'}`}>
      
      {/* Background Icon Watermark */}
      <span className="absolute -bottom-6 -left-6 material-symbols-outlined text-white/5 text-[120px] pointer-events-none group-hover:scale-110 transition-transform duration-1000">{cat?.icon || 'history_edu'}</span>
      
      <div className="flex justify-between items-start relative z-10">
        <div className="min-w-0 flex-1">
           <div className="flex items-center gap-3 mb-1">
             <h3 className={`font-pixel text-xs truncate uppercase tracking-tighter ${habit.mastered ? 'text-primary' : 'text-white'}`}>{habit.title}</h3>
             <span className="text-[6px] font-pixel bg-black/40 px-1.5 py-0.5 border border-white/10 text-primary">{alignment}</span>
           </div>
           <div className="flex items-center gap-3">
             <div className="flex items-center gap-1.5 bg-orange-500/10 px-2 py-0.5 border border-orange-500/20 rounded-sm">
               <span className="material-symbols-outlined text-orange-500 text-sm animate-pulse">local_fire_department</span>
               <span className="font-pixel text-[8px] text-orange-500">{habit.currentStreak} DAY STREAK</span>
             </div>
             {goal && <p className="text-[6px] font-pixel text-primary uppercase italic opacity-60">FOR: {goal.title}</p>}
           </div>
        </div>
        <div className="flex gap-2">
          <button onClick={onEdit} className="p-2 text-gray-600 hover:text-primary transition-all"><span className="material-symbols-outlined text-lg">edit</span></button>
          <button onClick={onDelete} className="p-2 text-gray-600 hover:text-rpg-red transition-all"><span className="material-symbols-outlined text-lg">delete</span></button>
        </div>
      </div>

      {/* Daily Goal Timer UI */}
      {timeGoal > 0 && (
        <div className={`p-5 rounded border-2 transition-all relative z-10 ${completedToday ? 'bg-rpg-green/10 border-rpg-green/40' : (goalMet ? 'bg-primary/10 border-primary/40' : 'bg-black/40 border-white/5')}`}>
           <div className="flex justify-between items-center mb-4">
             <div className="flex flex-col">
               <span className="text-[7px] font-pixel text-gray-500 uppercase mb-1">Daily Focus Session</span>
               <span className={`text-2xl font-ui font-black tabular-nums tracking-wider ${completedToday ? 'text-rpg-green' : (goalMet ? 'text-primary' : 'text-white/60')}`}>{formatTime(totalSecondsSpent)}</span>
             </div>
             <div className="flex gap-2">
               {!completedToday && (
                 <button 
                  onClick={() => setTimerActive(!timerActive)} 
                  className={`bg-primary text-black px-4 py-2 font-pixel text-[8px] border-b-4 border-black hover:brightness-110 active:translate-y-1 active:border-b-0 transition-all ${timerActive ? 'bg-yellow-600' : ''}`}
                 >
                   {timerActive ? 'PAUSE' : 'CONCENTRATE'}
                 </button>
               )}
               <button onClick={() => { setTimerActive(false); setSeconds(0); onUpdateMinutes(-(habit.dailyMinutesSpent || 0)); }} className="px-3 py-2 bg-black/40 text-gray-500 hover:text-white border-b-4 border-black transition-all"><span className="material-symbols-outlined text-sm">refresh</span></button>
             </div>
           </div>
           <div className="h-2 w-full bg-black/60 rounded-none overflow-hidden relative shadow-inner p-[1px]">
             <div className={`h-full transition-all duration-1000 ${completedToday ? 'bg-rpg-green' : 'bg-primary'}`} style={{ width: `${timeProgress}%` }}>
               <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/20"></div>
             </div>
           </div>
           <div className="flex justify-between mt-2">
             <span className="text-[6px] font-pixel text-gray-600 uppercase">Target: {timeGoal}m</span>
             {goalMet && !completedToday && <span className="text-[6px] font-pixel text-primary uppercase animate-pulse">Target Achieved!</span>}
           </div>
        </div>
      )}

      {/* Mastery Progress Bar */}
      <div className="space-y-3 relative z-10">
        <div className="flex justify-between items-end text-[8px] font-pixel text-gray-500 uppercase">
          <span>Mastery Path</span>
          <span className="tabular-nums font-bold text-white">{habit.currentStreak} / {target} Days</span>
        </div>
        <div className="h-4 w-full bg-black/60 border-2 border-white/5 relative overflow-hidden p-[2px] shadow-inner">
          <div 
            className={`h-full transition-all duration-1000 relative ${habit.mastered ? 'bg-primary shadow-[0_0_15px_rgba(242,204,13,0.3)]' : 'bg-blue-600'}`} 
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 bg-white/10"></div>
          </div>
        </div>
      </div>

      <button 
        onClick={onComplete} 
        disabled={!canComplete}
        className={`w-full py-5 font-pixel text-[10px] border-b-8 border-r-8 transition-all flex items-center justify-center gap-3 relative z-10 
          ${completedToday 
            ? 'bg-black/40 text-rpg-green border-rpg-green/20 opacity-60 cursor-default' 
            : (canComplete 
                ? 'bg-rpg-green text-black border-[#4e8235] hover:brightness-110 active:border-0 active:translate-y-2 active:translate-x-2' 
                : 'bg-gray-800 text-gray-500 border-black opacity-40 cursor-not-allowed')}`}
      >
        <span className="material-symbols-outlined text-lg">{completedToday ? 'check_circle' : (goalMet ? 'military_tech' : 'lock')}</span>
        {completedToday ? 'COMMUNION COMPLETE' : (goalMet ? 'LOG DAILY TRIUMPH' : 'MINUTES REMAINING')}
      </button>

      {timerActive && <div className="absolute inset-0 pointer-events-none border-2 border-primary/20 animate-pulse z-0"></div>}
    </div>
  );
};

export default Habits;

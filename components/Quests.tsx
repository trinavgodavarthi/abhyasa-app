
import React, { useState, useMemo } from 'react';
import { useGame } from '../context/GameContext';
import { Task } from '../types';
import { formatDistanceToNow, isPast } from 'date-fns';

type SortField = 'createdAt' | 'difficulty' | 'category' | 'deadline';
type SortOrder = 'asc' | 'desc';

const Quests: React.FC = () => {
  const { user, tasks, completeTask, deleteTask, addQuest } = useGame();
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDiff, setNewDiff] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [newCatId, setNewCatId] = useState<string>('');
  const [newGoalId, setNewGoalId] = useState<string>('');
  const [newTimeEstimate, setNewTimeEstimate] = useState<number>(30);
  const [newDeadline, setNewDeadline] = useState<string>('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  React.useEffect(() => {
    if (user?.categories?.length && !newCatId) {
      setNewCatId(user.categories[0].id);
    }
  }, [user?.categories, newCatId]);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const cat = newCatId || (user?.categories?.[0]?.id || 'slaying');
    await addQuest(newTitle, newDiff, cat, newGoalId || undefined, newTimeEstimate, newDeadline);
    setNewTitle('');
    setNewGoalId('');
    setNewDeadline('');
    setShowAdd(false);
  };

  const toggleFilter = (catId: string | 'all') => {
    if (catId === 'all') setSelectedCategories([]);
    else setSelectedCategories(prev => prev.includes(catId) ? prev.filter(id => id !== catId) : [...prev, catId]);
  };

  const sortedAndFilteredTasks = useMemo(() => {
    let list = [...tasks];
    if (selectedCategories.length > 0) list = list.filter(t => selectedCategories.includes(t.category));
    list.sort((a, b) => {
      let comp = 0;
      if (sortBy === 'createdAt') comp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      else if (sortBy === 'difficulty') comp = {easy:1,medium:2,hard:3}[a.difficulty] - {easy:1,medium:2,hard:3}[b.difficulty];
      else if (sortBy === 'deadline') {
        const dateA = a.deadline ? new Date(a.deadline).getTime() : Infinity;
        const dateB = b.deadline ? new Date(b.deadline).getTime() : Infinity;
        comp = dateA - dateB;
      }
      else {
        const catA = user?.categories.find(c => c.id === a.category)?.label || '';
        const catB = user?.categories.find(c => c.id === b.category)?.label || '';
        comp = catA.localeCompare(catB);
      }
      return sortOrder === 'asc' ? comp : -comp;
    });
    return list;
  }, [tasks, selectedCategories, sortBy, sortOrder, user?.categories]);

  const activeQuests = sortedAndFilteredTasks.filter(t => !t.completed);
  const completedQuests = sortedAndFilteredTasks.filter(t => t.completed);

  return (
    <div className="bg-rpg-paper border-4 border-rpg-brown shadow-pixel-card p-10 relative min-h-[600px] animate-in slide-in-from-bottom-4 duration-500 overflow-hidden">
      <div className="absolute inset-0 opacity-15 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/handmade-paper.png')]"></div>

      <div className="relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b-4 border-rpg-brown/20 pb-6 gap-4">
           <div>
             <h2 className="text-2xl sm:text-4xl font-black text-rpg-brown tracking-tighter flex items-center gap-4">
               <span className="material-symbols-outlined text-5xl">auto_stories</span> QUEST LEDGER
             </h2>
             <p className="text-rpg-brown font-pixel text-[8px] uppercase tracking-widest mt-2 opacity-60 font-bold">Mercenary Work & Divine Decrees</p>
           </div>
           <button onClick={() => setShowAdd(true)} className="bg-primary text-black border-b-8 border-r-8 border-[#b89a0a] hover:bg-yellow-400 active:border-b-0 active:border-r-0 active:translate-y-2 active:translate-x-2 px-8 py-4 font-pixel text-[10px] transition-colors duration-150 tracking-wide uppercase font-bold">
             ISSUE COMMAND
           </button>
        </div>

        <div className="mb-10 flex flex-wrap gap-3">
           <FilterBtn active={selectedCategories.length === 0} onClick={() => toggleFilter('all')} label="All" icon="apps" />
           {user?.categories.map(cat => <FilterBtn key={cat.id} active={selectedCategories.includes(cat.id)} onClick={() => toggleFilter(cat.id)} label={cat.label} icon={cat.icon} />)}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {activeQuests.length > 0 ? (
            activeQuests.map(task => <QuestItem key={task.id} task={task} categories={user?.categories || []} goals={user?.goals || []} onComplete={() => completeTask(task)} onDelete={() => deleteTask(task.id)} />)
          ) : (
            <div className="col-span-full py-20 bg-black/5 border-4 border-dashed border-rpg-brown/20 text-center rounded">
               <span className="material-symbols-outlined text-6xl text-rpg-brown/20 mb-4">edit_document</span>
               <p className="font-pixel text-[10px] text-rpg-brown/40 uppercase tracking-wide">The Bounty Board is Bare</p>
            </div>
          )}
        </div>

        {completedQuests.length > 0 && (
          <div className="mt-16 pt-10 border-t-4 border-rpg-brown/10">
            <h3 className="font-pixel text-[10px] text-rpg-brown/40 uppercase mb-6 tracking-wide flex items-center gap-3 font-bold">
              <span className="h-[1px] flex-1 bg-rpg-brown/10"></span>
              Archived Victories
              <span className="h-[1px] flex-1 bg-rpg-brown/10"></span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 opacity-60">
              {completedQuests.map(task => (
                <div key={task.id} className="text-[10px] font-bold text-rpg-brown flex justify-between bg-black/5 p-3 border-2 border-rpg-brown/10 uppercase tracking-wide">
                  <span className="truncate max-w-[70%]">{task.title}</span>
                  <span className="tabular-nums whitespace-nowrap">{task.timeSpent || 0}m LOGGED</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-rpg-deep-slate p-10 border-4 border-rpg-slate shadow-pixel-card max-w-xl w-full relative">
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary"></div>
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary"></div>
            
            <h1 className="font-pixel text-primary text-center mb-10 uppercase tracking-wide text-[10px] font-bold">Draft Imperial Decree</h1>
            <form onSubmit={handleAddTask} className="space-y-8">
              <div>
                <div className="flex justify-between mb-3">
                  <label className="text-gray-500 text-[8px] font-pixel uppercase tracking-widest font-bold">Objective Designation</label>
                </div>
                <input required value={newTitle} onChange={e => setNewTitle(e.target.value)} className="w-full bg-black/60 text-white p-4 border-2 border-rpg-slate outline-none focus:border-primary transition-colors duration-150 font-bold text-lg" placeholder="Enter objective..." />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-gray-500 text-[8px] font-pixel block mb-3 uppercase tracking-widest font-bold">Investment (Min)</label>
                  <input type="number" value={newTimeEstimate} onChange={e => setNewTimeEstimate(parseInt(e.target.value))} className="w-full bg-black/60 text-white p-4 border-2 border-rpg-slate outline-none transition-colors duration-150" />
                </div>
                <div>
                   <label className="text-gray-500 text-[8px] font-pixel block mb-3 uppercase tracking-widest font-bold">Sector Alignment</label>
                   <select value={newCatId} onChange={e => setNewCatId(e.target.value)} className="w-full bg-black/60 text-white p-4 border-2 border-rpg-slate outline-none font-pixel text-[8px] transition-colors duration-150">
                     {user?.categories.map(c => <option key={c.id} value={c.id}>{c.label.toUpperCase()}</option>)}
                   </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-gray-500 text-[8px] font-pixel block mb-3 uppercase tracking-widest font-bold">Omen Date (Deadline)</label>
                  <input type="date" value={newDeadline} onChange={e => setNewDeadline(e.target.value)} className="w-full bg-black/60 text-white p-4 border-2 border-rpg-slate outline-none font-pixel text-[8px] transition-colors duration-150" />
                </div>
                <div>
                  <label className="text-gray-500 text-[8px] font-pixel block mb-3 uppercase tracking-widest font-bold">Link to Great Work</label>
                  <select value={newGoalId} onChange={e => setNewGoalId(e.target.value)} className="w-full bg-black/60 text-white p-4 border-2 border-rpg-slate outline-none font-pixel text-[8px] transition-colors duration-150">
                    <option value="">-- NONE --</option>
                    {user?.goals.map(g => <option key={g.id} value={g.id}>{g.title.toUpperCase()}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-gray-500 text-[8px] font-pixel block mb-3 uppercase tracking-widest font-bold">Tactical Complexity</label>
                <div className="grid grid-cols-3 gap-3">
                  {['easy','medium','hard'].map(d => (
                    <button key={d} type="button" onClick={() => setNewDiff(d as any)} className={`py-4 border-2 font-pixel text-[8px] transition-all duration-150 uppercase font-bold ${newDiff === d ? 'bg-primary text-black border-white shadow-lg' : 'border-rpg-slate text-gray-500 hover:text-white'}`}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowAdd(false)} className="flex-1 py-4 px-8 bg-rpg-slate text-white font-pixel text-[8px] border-b-8 border-r-8 border-rpg-deep-slate hover:bg-[#5a758f] active:translate-y-2 active:translate-x-2 active:border-b-0 active:border-r-0 transition-colors duration-150 uppercase tracking-wide font-bold">Retreat</button>
                <button type="submit" className="flex-[2] py-4 px-8 bg-primary text-black font-pixel text-[8px] border-b-8 border-r-8 border-[#b89a0a] hover:bg-yellow-400 active:translate-y-2 active:translate-x-2 active:border-b-0 active:border-r-0 transition-colors duration-150 uppercase tracking-wide font-bold">Commence Quest</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const FilterBtn = ({ active, onClick, label, icon }: any) => (
  <button onClick={onClick} className={`flex items-center gap-3 px-5 py-2.5 border-4 font-bold text-[10px] uppercase tracking-wide transition-all duration-300 rounded-sm ${active ? 'bg-rpg-brown border-rpg-brown text-primary shadow-md' : 'bg-transparent border-rpg-brown/10 text-rpg-brown/40 hover:border-rpg-brown/40'}`}>
    <span className="material-symbols-outlined text-lg">{icon}</span> {label}
  </button>
);

const QuestItem = ({ task, categories, goals, onComplete, onDelete }: any) => {
  const cat = categories.find((c: any) => c.id === task.category);
  const goal = goals.find((g: any) => g.id === task.goalId);
  const timeProgress = task.timeEstimate ? Math.min(100, ((task.timeSpent || 0) / task.timeEstimate) * 100) : 0;
  const alignment = cat?.alignment || 'FOC';

  const deadlineDate = task.deadline ? new Date(task.deadline) : null;
  const isOverdue = deadlineDate ? isPast(deadlineDate) && !task.completed : false;

  return (
    <div className={`bg-[#E8D0AA] border-4 border-rpg-brown p-6 rounded-none shadow-pixel-card group transition-all duration-300 hover:translate-x-1 hover:shadow-2xl flex flex-col gap-5 relative overflow-hidden ${isOverdue ? 'animate-pulse' : ''}`}>
      {isOverdue && (
        <div className="absolute top-0 right-0 bg-rpg-red text-white text-[6px] font-pixel px-4 py-1 rotate-45 translate-x-4 translate-y-2 shadow-lg z-20 tracking-wider">
          CURSED
        </div>
      )}

      <div className="flex items-center gap-5">
        <div className="shrink-0 size-14 bg-rpg-brown flex items-center justify-center rounded-none border-2 border-black/20 relative shadow-inner">
          <span className="material-symbols-outlined text-3xl text-primary">{cat?.icon || 'help'}</span>
          <div className="absolute -top-2 -right-2 bg-rpg-brown text-primary text-[6px] px-1.5 py-0.5 border border-black font-pixel shadow-sm uppercase tracking-wider leading-none">
            {alignment}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <h3 className="text-rpg-brown font-black text-xl truncate uppercase tracking-tighter italic">{task.title}</h3>
            <span className={`text-[6px] font-pixel px-1.5 py-0.5 border-2 rounded-sm bg-white/40 shadow-sm uppercase tracking-wider leading-none ${task.difficulty === 'hard' ? 'text-rpg-red border-rpg-red' : task.difficulty === 'medium' ? 'text-blue-600 border-blue-600' : 'text-rpg-green border-rpg-green'}`}>
              {task.difficulty.toUpperCase()}
            </span>
          </div>
          <p className="text-rpg-brown/40 text-[8px] font-black uppercase tracking-widest font-pixel">{cat?.label || 'UNKNOWN'} EXPEDITION</p>
          {goal && (
            <p className="text-primary bg-rpg-brown text-[7px] font-pixel px-1 mt-2 inline-block uppercase tracking-widest opacity-80">
              FOR: {goal.title}
            </p>
          )}
        </div>
      </div>

      {task.deadline && (
        <div className={`flex items-center gap-2 p-2 border-2 ${isOverdue ? 'bg-rpg-red/10 border-rpg-red/30 text-rpg-red' : 'bg-black/5 border-rpg-brown/10 text-rpg-brown'}`}>
          <span className="material-symbols-outlined text-sm">hourglass_bottom</span>
          <span className="text-[8px] font-pixel uppercase tracking-wide font-bold">
            Omen: {isOverdue ? 'EXPIRED' : `${formatDistanceToNow(deadlineDate)} left`}
          </span>
        </div>
      )}

      <div className="space-y-2">
         <div className="flex justify-between items-end text-[8px] font-pixel text-rpg-brown/60 uppercase tracking-wide font-bold">
            <span>Mana Expenditure</span>
            <span className="tabular-nums font-black">{task.timeSpent || 0} / {task.timeEstimate || 0}m</span>
         </div>
         <div className="h-4 w-full bg-rpg-brown/10 rounded-none overflow-hidden relative border-2 border-rpg-brown/20 p-[2px]">
           <div className={`h-full transition-all duration-700 ${timeProgress >= 100 ? 'bg-primary' : 'bg-rpg-green'}`} style={{ width: `${timeProgress}%` }}>
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/20"></div>
           </div>
         </div>
      </div>

      <div className="flex gap-4 pt-2 mt-auto">
        <button onClick={onDelete} className="flex-1 py-2 px-4 bg-rpg-red text-white font-pixel text-[8px] border-b-8 border-r-8 border-[#8a4235] hover:bg-[#d47560] active:translate-y-2 active:translate-x-2 active:border-b-0 active:border-r-0 transition-colors duration-150 uppercase tracking-wide font-bold">Discard</button>
        <button onClick={onComplete} className="flex-[2] py-2 px-4 bg-rpg-green text-black font-pixel text-[8px] border-b-8 border-r-8 border-[#5a9440] hover:bg-[#8fd068] active:translate-y-2 active:translate-x-2 active:border-b-0 active:border-r-0 transition-colors duration-150 flex items-center justify-center gap-3 uppercase tracking-wide font-bold shadow-pixel">
          <span className="material-symbols-outlined text-lg">check_circle</span>
          Complete
        </button>
      </div>
    </div>
  );
};

export default Quests;

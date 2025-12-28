
import React, { useState, useMemo } from 'react';
import { useGame } from '../context/GameContext';
import { Task } from '../types';
import { GoogleGenAI, Type } from "@google/genai";

type SortField = 'createdAt' | 'difficulty' | 'category';
type SortOrder = 'asc' | 'desc';

const Quests: React.FC = () => {
  const { user, tasks, completeTask, deleteTask, addQuest } = useGame();
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDiff, setNewDiff] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [newCatId, setNewCatId] = useState<string>('');
  const [newTimeEstimate, setNewTimeEstimate] = useState<number>(30);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [isAiLoading, setIsAiLoading] = useState(false);

  React.useEffect(() => {
    if (user?.categories?.length && !newCatId) {
      setNewCatId(user.categories[0].id);
    }
  }, [user?.categories, newCatId]);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const cat = newCatId || (user?.categories?.[0]?.id || 'slaying');
    await addQuest(newTitle, newDiff, cat, newTimeEstimate);
    setNewTitle('');
    setShowAdd(false);
  };

  const handleAISuggest = async () => {
    if (!process.env.API_KEY || !user) return;
    setIsAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Generate a creative, short RPG quest title for a productivity task based on this objective: "${newTitle || 'Generic self-improvement'}". 
        Include a difficulty (easy, medium, or hard), select appropriate category ID from: ${user.categories.map(c => `${c.label} (ID: ${c.id})`).join(', ')}, and estimate time in minutes. Return JSON.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              difficulty: { type: Type.STRING, enum: ['easy', 'medium', 'hard'] },
              category: { type: Type.STRING },
              timeEstimate: { type: Type.NUMBER }
            },
            required: ['title', 'difficulty', 'category', 'timeEstimate']
          }
        }
      });
      const data = JSON.parse(response.text || '{}');
      if (data.title) setNewTitle(data.title);
      if (data.difficulty) setNewDiff(data.difficulty as any);
      if (data.category) setNewCatId(data.category);
      if (data.timeEstimate) setNewTimeEstimate(data.timeEstimate);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiLoading(false);
    }
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
    <div className="bg-rpg-paper border-4 border-rpg-slate shadow-xl p-8 rounded-sm relative min-h-[600px] animate-in slide-in-from-bottom-4 duration-500">
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/handmade-paper.png')]"></div>
      <div className="relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b-4 border-rpg-slate/20 pb-4 gap-4">
           <div>
             <h2 className="text-4xl font-black text-[#3d2b1f] tracking-tighter flex items-center gap-3">
               <span className="material-symbols-outlined text-4xl">feed</span> QUEST LOG
             </h2>
             <p className="text-[#5c4033] font-bold text-sm uppercase">Active Missions: {activeQuests.length}</p>
           </div>
           <button onClick={() => setShowAdd(true)} className="bg-primary hover:bg-[#d4d468] text-black border-b-4 border-r-4 border-[#7a7a35] active:border-0 active:translate-y-1 px-6 py-3 rounded font-black tracking-wider flex items-center gap-2">
             <span className="material-symbols-outlined">add_circle</span> NEW QUEST
           </button>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
           <FilterBtn active={selectedCategories.length === 0} onClick={() => toggleFilter('all')} label="All" icon="apps" />
           {user?.categories.map(cat => <FilterBtn key={cat.id} active={selectedCategories.includes(cat.id)} onClick={() => toggleFilter(cat.id)} label={cat.label} icon={cat.icon} />)}
        </div>

        <div className="space-y-4">
          {activeQuests.map(task => <QuestItem key={task.id} task={task} categories={user?.categories || []} onComplete={() => completeTask(task)} onDelete={() => deleteTask(task.id)} />)}
        </div>

        {completedQuests.length > 0 && (
          <div className="mt-12 pt-8 border-t-4 border-black/5">
            <h3 className="font-pixel text-[10px] text-gray-500 uppercase mb-4">Completed Archive</h3>
            <div className="space-y-2 opacity-50">
              {completedQuests.map(task => <div key={task.id} className="text-sm text-[#3d2b1f] flex justify-between"><span>{task.title}</span><span className="text-xs uppercase font-bold">{task.timeSpent || 0}m logged</span></div>)}
            </div>
          </div>
        )}
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-rpg-deep-slate p-8 border-4 border-rpg-slate shadow-2xl max-w-xl w-full">
            <h1 className="font-pixel text-primary text-center mb-8 uppercase">Issue New Command</h1>
            <form onSubmit={handleAddTask} className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-rpg-sand text-[10px] font-pixel uppercase">Objective</label>
                  <button type="button" onClick={handleAISuggest} className="text-primary text-[8px] font-pixel flex items-center gap-1 hover:brightness-125">
                    <span className={`material-symbols-outlined text-xs ${isAiLoading ? 'animate-spin' : ''}`}>auto_awesome</span>
                    {isAiLoading ? 'SENSING...' : 'AI BRAINSTORM'}
                  </button>
                </div>
                <input required value={newTitle} onChange={e => setNewTitle(e.target.value)} className="w-full bg-black/40 text-white p-4 border-2 border-rpg-slate outline-none focus:border-primary" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-rpg-sand text-[10px] font-pixel block mb-2 uppercase">Time (Min)</label>
                  <div className="flex gap-2">
                    <input type="number" value={newTimeEstimate} onChange={e => setNewTimeEstimate(parseInt(e.target.value))} className="w-full bg-black/40 text-white p-3 border-2 border-rpg-slate" />
                    <button type="button" onClick={() => setNewTimeEstimate(prev => prev + 15)} className="px-3 bg-rpg-slate text-[10px] font-pixel">+15</button>
                  </div>
                </div>
                <div>
                   <label className="text-rpg-sand text-[10px] font-pixel block mb-2 uppercase">Category</label>
                   <select value={newCatId} onChange={e => setNewCatId(e.target.value)} className="w-full bg-black/40 text-white p-3 border-2 border-rpg-slate">
                     {user?.categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                   </select>
                </div>
              </div>

              <div>
                <label className="text-rpg-sand text-[10px] font-pixel block mb-2 uppercase">Difficulty</label>
                <div className="grid grid-cols-3 gap-2">
                  {['easy','medium','hard'].map(d => (
                    <button key={d} type="button" onClick={() => setNewDiff(d as any)} className={`p-2 border-2 text-[8px] font-pixel transition-all ${newDiff === d ? 'bg-primary text-black border-white' : 'border-rpg-slate text-gray-500 hover:text-gray-300'}`}>
                      {d.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <button type="button" onClick={() => setShowAdd(false)} className="flex-1 p-3 bg-gray-700 font-pixel text-[10px] border-b-4 border-black">CANCEL</button>
                <button type="submit" className="flex-[2] p-3 bg-rpg-green text-black font-pixel text-[10px] border-b-4 border-[#4e8235]">ACCEPT MISSION</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const FilterBtn = ({ active, onClick, label, icon }: any) => (
  <button onClick={onClick} className={`flex items-center gap-2 px-3 py-1.5 border-2 font-pixel text-[8px] uppercase tracking-tighter transition-all ${active ? 'bg-[#3d2b1f] border-[#3d2b1f] text-primary' : 'bg-transparent border-[#3d2b1f]/20 text-[#3d2b1f]/60 hover:border-[#3d2b1f]/40'}`}>
    <span className="material-symbols-outlined text-sm">{icon}</span> {label}
  </button>
);

const QuestItem = ({ task, categories, onComplete, onDelete }: any) => {
  const cat = categories.find((c: any) => c.id === task.category);
  const timeProgress = task.timeEstimate ? Math.min(100, ((task.timeSpent || 0) / task.timeEstimate) * 100) : 0;
  const alignment = cat?.alignment || 'FOC';

  return (
    <div className="bg-[#E8D0AA] border-4 border-[#A37853] p-4 rounded shadow-md group transition-all hover:translate-x-1 hover:shadow-lg">
      <div className="flex items-center gap-4">
        <div className="shrink-0 size-12 bg-black/10 flex items-center justify-center rounded border-2 border-black/20 relative">
          <span className="material-symbols-outlined text-2xl text-[#3d2b1f]">{cat?.icon || 'help'}</span>
          <div className="absolute -top-1 -right-1 bg-[#3d2b1f] text-primary text-[6px] px-1 rounded font-pixel shadow-sm">
            {alignment}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-[#3d2b1f] font-black text-lg truncate">{task.title}</h3>
            <span className={`text-[8px] font-pixel px-1 border rounded ${task.difficulty === 'hard' ? 'text-rpg-red border-rpg-red' : task.difficulty === 'medium' ? 'text-blue-600 border-blue-600' : 'text-rpg-green border-rpg-green'}`}>
              {task.difficulty}
            </span>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex-1 h-3 bg-black/10 rounded-sm overflow-hidden relative border border-[#3d2b1f]/20 shadow-inner">
               <div className={`h-full transition-all duration-500 ${timeProgress >= 100 ? 'bg-primary' : 'bg-rpg-green'}`} style={{ width: `${timeProgress}%` }}></div>
               {timeProgress >= 100 && <div className="absolute inset-0 bg-white/20 animate-pulse"></div>}
             </div>
             <span className="text-[10px] font-bold text-[#3d2b1f]/60 uppercase whitespace-nowrap tabular-nums">
               {task.timeSpent || 0} / {task.timeEstimate || 0}m
             </span>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={onDelete} className="size-10 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:text-rpg-red transition-opacity"><span className="material-symbols-outlined">delete</span></button>
          <button onClick={onComplete} className="size-10 bg-[#cfb58e] border-4 border-[#8c6b4a] hover:bg-rpg-green hover:text-white transition-all flex items-center justify-center shadow-pixel"><span className="material-symbols-outlined">check</span></button>
        </div>
      </div>
    </div>
  );
};

export default Quests;

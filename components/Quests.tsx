
import React, { useState, useMemo } from 'react';
import { useGame } from '../context/GameContext';
import { Task, Category } from '../types';
import { GoogleGenAI, Type } from "@google/genai";

const Quests: React.FC = () => {
  const { user, tasks, completeTask, deleteTask, addQuest } = useGame();
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDiff, setNewDiff] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [newCatId, setNewCatId] = useState<string>('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Set default category when user or categories change
  React.useEffect(() => {
    if (user?.categories?.length && !newCatId) {
      setNewCatId(user.categories[0].id);
    }
  }, [user?.categories, newCatId]);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const cat = newCatId || (user?.categories?.[0]?.id || 'slaying');
    await addQuest(newTitle, newDiff, cat);
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
        Include a difficulty (easy, medium, or hard) and select the most appropriate category ID from this list: ${user.categories.map(c => `${c.label} (ID: ${c.id})`).join(', ')}. Return as JSON.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: 'The creative RPG-flavored quest title' },
              difficulty: { type: Type.STRING, enum: ['easy', 'medium', 'hard'] },
              category: { type: Type.STRING, description: 'The ID of the category' }
            },
            required: ['title', 'difficulty', 'category']
          }
        }
      });
      
      const text = response.text;
      if (text) {
        const data = JSON.parse(text);
        if (data.title) setNewTitle(data.title);
        if (data.difficulty) setNewDiff(data.difficulty as any);
        if (data.category && user.categories.some(c => c.id === data.category)) {
          setNewCatId(data.category);
        }
      }
    } catch (err) {
      console.error("Gemini Error:", err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const toggleFilter = (catId: string | 'all') => {
    if (catId === 'all') {
      setSelectedCategories([]);
    } else {
      setSelectedCategories(prev => 
        prev.includes(catId) 
          ? prev.filter(id => id !== catId) 
          : [...prev, catId]
      );
    }
  };

  const filteredTasks = useMemo(() => {
    if (selectedCategories.length === 0) return tasks;
    return tasks.filter(t => selectedCategories.includes(t.category));
  }, [tasks, selectedCategories]);

  const activeQuests = [...filteredTasks].filter(t => !t.completed).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const completedQuests = filteredTasks.filter(t => t.completed);

  if (!user) return null;

  return (
    <div className="bg-rpg-paper border-4 border-rpg-slate shadow-xl p-8 rounded-sm relative min-h-[600px] animate-in slide-in-from-bottom-4 duration-500">
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/handmade-paper.png')]"></div>
      
      <div className="relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 border-b-4 border-rpg-slate/20 pb-4 gap-4">
           <div>
             <h2 className="text-4xl font-black text-[#3d2b1f] tracking-tighter drop-shadow-sm flex items-center gap-3">
               <span className="material-symbols-outlined text-4xl">feed</span>
               QUEST LOG
             </h2>
             <p className="text-[#5c4033] font-bold text-sm tracking-wide uppercase">Total Missions: {filteredTasks.length}</p>
           </div>
           
           <div className="flex gap-2">
             <button 
               onClick={() => setShowAdd(true)}
               className="bg-primary hover:bg-[#d4d468] text-black border-b-4 border-r-4 border-[#7a7a35] active:border-0 active:translate-y-1 px-6 py-3 rounded font-black tracking-wider flex items-center gap-2 shadow-xl"
             >
               <span className="material-symbols-outlined">add_circle</span>
               NEW QUEST
             </button>
           </div>
        </div>

        {/* Dynamic Multi-Select Filter Bar */}
        <div className="flex flex-wrap gap-2 mb-8">
           <FilterBtn 
             active={selectedCategories.length === 0} 
             onClick={() => toggleFilter('all')} 
             label="All Quests" 
             icon="apps" 
           />
           {user.categories.map(cat => (
             <FilterBtn 
              key={cat.id} 
              active={selectedCategories.includes(cat.id)} 
              onClick={() => toggleFilter(cat.id)} 
              label={cat.label} 
              icon={cat.icon} 
            />
           ))}
        </div>

        <div className="space-y-4">
          {activeQuests.length === 0 && (
            <div className="text-center py-20 opacity-40">
              <span className="material-symbols-outlined text-6xl text-[#3d2b1f] mb-4">inbox</span>
              <p className="font-pixel text-[10px] text-[#3d2b1f]">THE BOARD IS EMPTY... FOR NOW.</p>
            </div>
          )}

          {activeQuests.map(task => (
            <QuestItem 
              key={task.id} 
              task={task} 
              categories={user.categories}
              onComplete={() => completeTask(task)} 
              onDelete={() => deleteTask(task.id)}
            />
          ))}
        </div>

        {completedQuests.length > 0 && (
          <div className="mt-20 opacity-60">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-pixel text-[10px] text-[#3d2b1f] uppercase tracking-widest">Completed Archive</h3>
            </div>
            <div className="space-y-2">
              {completedQuests.map(task => {
                const cat = user.categories.find(c => c.id === task.category);
                return (
                  <div key={task.id} className="flex items-center gap-4 bg-black/5 p-3 rounded group">
                    <span className="material-symbols-outlined text-[#3d2b1f]/40">check_circle</span>
                    <div className="flex-1 flex items-center gap-2">
                      <span className="font-bold text-sm text-[#3d2b1f]/70 line-through truncate">{task.title}</span>
                      {cat && (
                        <span className="text-[8px] font-pixel text-[#3d2b1f]/40 px-1 border border-[#3d2b1f]/20 uppercase">{cat.label}</span>
                      )}
                    </div>
                    <button 
                      onClick={() => deleteTask(task.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:text-rpg-red transition-all"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-rpg-deep-slate p-1 rounded border-4 border-rpg-slate shadow-2xl max-w-2xl w-full">
            <div className="bg-rpg-slate/10 p-8 flex flex-col gap-6">
              <h1 className="font-pixel text-primary text-center tracking-widest leading-loose">
                NEW QUEST ISSUED
              </h1>

              <form onSubmit={handleAddTask} className="space-y-8">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-rpg-sand text-[10px] font-pixel block uppercase">Objective</label>
                    <button 
                      type="button"
                      onClick={handleAISuggest}
                      disabled={isAiLoading}
                      className="flex items-center gap-1 text-primary hover:text-white transition-colors text-[8px] font-pixel uppercase"
                    >
                      <span className={`material-symbols-outlined text-xs ${isAiLoading ? 'animate-spin' : ''}`}>auto_awesome</span>
                      {isAiLoading ? 'Channeling...' : 'AI Brainstorm'}
                    </button>
                  </div>
                  <input 
                    autoFocus
                    required
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    className="w-full bg-black/40 text-white p-4 border-2 border-rpg-slate outline-none focus:border-primary" 
                    placeholder="E.G. DEFEAT THE INBOX DRAGON..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div>
                      <label className="text-rpg-sand text-[10px] font-pixel block mb-3 uppercase">Difficulty</label>
                      <div className="grid grid-cols-3 gap-2">
                         <SelectBtn active={newDiff === 'easy'} onClick={() => setNewDiff('easy')} label="EASY" />
                         <SelectBtn active={newDiff === 'medium'} onClick={() => setNewDiff('medium')} label="MEDIUM" />
                         <SelectBtn active={newDiff === 'hard'} onClick={() => setNewDiff('hard')} label="HARD" />
                      </div>
                   </div>

                   <div>
                      <label className="text-rpg-sand text-[10px] font-pixel block mb-3 uppercase">Category</label>
                      <div className="grid grid-cols-2 gap-2 max-h-[120px] overflow-y-auto custom-scrollbar pr-1">
                        {user.categories.map(cat => (
                          <SelectBtn 
                            key={cat.id} 
                            active={newCatId === cat.id} 
                            onClick={() => setNewCatId(cat.id)} 
                            label={cat.label.toUpperCase()} 
                          />
                        ))}
                      </div>
                   </div>
                </div>

                <div className="flex gap-4">
                  <button type="button" onClick={() => setShowAdd(false)} className="flex-1 p-4 bg-gray-700 font-pixel text-[10px] border-b-4 border-black uppercase">Cancel</button>
                  <button type="submit" className="flex-[2] p-4 bg-rpg-green text-black font-pixel text-[10px] border-b-4 border-[#4e8235] uppercase tracking-tighter">Accept Quest</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const FilterBtn = ({ active, onClick, label, icon }: any) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 border-2 transition-all font-pixel text-[8px] uppercase tracking-tighter
      ${active ? 'bg-[#3d2b1f] border-[#3d2b1f] text-primary shadow-inner' : 'bg-transparent border-[#3d2b1f]/20 text-[#3d2b1f]/60 hover:border-[#3d2b1f]/40'}`}
  >
    <span className="material-symbols-outlined text-sm">{icon}</span>
    {label}
  </button>
);

const SelectBtn = ({ active, onClick, label }: any) => (
  <button 
    type="button"
    onClick={onClick}
    className={`p-3 border-2 transition-all flex flex-col items-center justify-center font-pixel text-[8px] tracking-tighter truncate
      ${active ? `bg-primary border-white text-black shadow-lg` : 'bg-black/40 border-rpg-slate text-gray-500'}`}
  >
    {label}
  </button>
);

const QuestItem = ({ task, categories, onComplete, onDelete }: { task: Task; categories: Category[]; onComplete: () => void; onDelete: () => void }) => {
  const getDiffColor = (d: string) => {
    if (d === 'easy') return 'bg-rpg-green';
    if (d === 'medium') return 'bg-primary';
    return 'bg-rpg-red';
  };

  const category = categories.find(c => c.id === task.category) || { label: 'Unknown', icon: 'help', color: 'bg-gray-600' };

  return (
    <div className="group relative bg-[#E8D0AA] border-4 border-[#A37853] rounded shadow-md hover:translate-x-1 transition-all duration-200">
      <div className="flex items-center p-4 gap-4">
        <div className={`shrink-0 size-12 ${getDiffColor(task.difficulty)} text-black flex items-center justify-center rounded border-2 border-black/20 shadow-inner`}>
          <span className="material-symbols-outlined text-2xl">{category.icon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className={`text-white text-[8px] font-pixel px-2 py-0.5 rounded ${getDiffColor(task.difficulty)} tracking-widest uppercase shadow-sm`}>
              {task.difficulty}
            </span>
            <span className={`text-white text-[8px] font-pixel px-2 py-0.5 rounded ${category.color} tracking-widest uppercase shadow-sm`}>
              {category.label}
            </span>
            <h3 className="text-[#3d2b1f] text-lg font-black truncate">{task.title}</h3>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={onDelete}
            className="size-10 bg-black/10 hover:bg-rpg-red/20 rounded flex items-center justify-center transition-colors group/del"
          >
            <span className="material-symbols-outlined text-[#3d2b1f]/60 group-hover/del:text-rpg-red">delete</span>
          </button>
          <button 
            onClick={onComplete}
            className="size-10 bg-[#cfb58e] border-4 border-[#8c6b4a] rounded hover:bg-rpg-green hover:border-[#4e8235] transition-colors flex items-center justify-center group/check"
          >
            <span className="material-symbols-outlined text-black font-black opacity-0 group-hover/check:opacity-100 transition-all">check</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Quests;

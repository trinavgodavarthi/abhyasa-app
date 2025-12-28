
import React, { useState } from 'react';
import { useGame } from '../context/GameContext';

const AVAILABLE_ICONS = ['castle', 'temple_buddhist', 'foundation', 'architecture', 'workspace_premium', 'military_tech', 'star', 'auto_awesome', 'diamond'];
const AVAILABLE_COLORS = [
  { label: 'Gold', class: 'bg-primary' },
  { label: 'Royal Blue', class: 'bg-blue-800' },
  { label: 'Deep Emerald', class: 'bg-green-900' },
  { label: 'Crimson', class: 'bg-red-800' },
  { label: 'Obsidian', class: 'bg-black' },
];

const Goals: React.FC = () => {
  const { user, addGoal, deleteGoal, claimGoalReward } = useGame();
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [target, setTarget] = useState(100);
  const [icon, setIcon] = useState('castle');
  const [color, setColor] = useState('bg-primary');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    await addGoal(title, desc, target, icon, color);
    setShowAdd(false);
    setTitle(''); setDesc(''); setTarget(100);
  };

  if (!user) return null;

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <div className="flex justify-between items-center bg-black/40 p-8 border-4 border-primary/20 shadow-pixel relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="font-pixel text-primary text-2xl tracking-tighter mb-2 uppercase italic">Great Works</h2>
          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest opacity-60 italic">Your legacy is carved in the stone of history</p>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="bg-primary text-black px-8 py-5 font-pixel text-[10px] border-b-8 border-r-8 border-[#7a7a35] hover:brightness-110 active:translate-y-2 active:border-0 transition-all uppercase tracking-tighter relative z-10"
        >
          COMMENCE PROJECT
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {user.goals.length === 0 && (
          <div className="col-span-full py-32 bg-black/20 border-4 border-dashed border-rpg-slate rounded text-center opacity-40">
             <span className="material-symbols-outlined text-8xl mb-6">architecture</span>
             <p className="font-pixel text-xs">NO MAJOR PROJECTS IN PROGRESS</p>
             <p className="mt-4 uppercase font-bold text-gray-500 tracking-widest">Envision a legacy to begin</p>
          </div>
        )}
        {user.goals.map(goal => (
          <GoalCard 
            key={goal.id} 
            goal={goal} 
            onDelete={() => deleteGoal(goal.id)} 
            onClaim={() => claimGoalReward(goal.id)}
          />
        ))}
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-rpg-deep-slate p-10 border-4 border-primary/30 shadow-pixel-card max-w-xl w-full relative">
            <h1 className="font-pixel text-primary text-center mb-10 uppercase tracking-tighter text-sm">Design Legacy Project</h1>
            <form onSubmit={handleAdd} className="space-y-8">
              <div>
                <label className="text-gray-500 text-[8px] font-pixel block mb-3 uppercase tracking-widest">Great Work Title</label>
                <input required value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-black/60 text-white p-5 border-2 border-rpg-slate outline-none focus:border-primary font-bold text-lg" placeholder="E.G. THE CITADEL OF MASTERY..." />
              </div>
              <div>
                <label className="text-gray-500 text-[8px] font-pixel block mb-3 uppercase tracking-widest">Vision Statement</label>
                <textarea value={desc} onChange={e => setDesc(e.target.value)} className="w-full bg-black/60 text-white p-5 border-2 border-rpg-slate outline-none focus:border-primary font-medium text-sm h-24" placeholder="Describe the impact of this achievement..." />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-gray-500 text-[8px] font-pixel block mb-3 uppercase tracking-widest">Target Effort</label>
                  <input type="number" min="10" value={target} onChange={e => setTarget(parseInt(e.target.value))} className="w-full bg-black/60 text-white p-4 border-2 border-rpg-slate outline-none" />
                </div>
                <div>
                   <label className="text-gray-500 text-[8px] font-pixel block mb-3 uppercase tracking-widest">Heraldic Color</label>
                   <div className="flex gap-2">
                     {AVAILABLE_COLORS.map(c => (
                       <button key={c.label} type="button" onClick={() => setColor(c.class)} className={`size-8 rounded-full border-2 transition-all ${c.class} ${color === c.class ? 'border-white scale-110' : 'border-black opacity-60'}`} />
                     ))}
                   </div>
                </div>
              </div>
              <div>
                 <label className="text-gray-500 text-[8px] font-pixel block mb-3 uppercase tracking-widest">Project Totem</label>
                 <div className="flex flex-wrap gap-2">
                   {AVAILABLE_ICONS.map(i => (
                     <button key={i} type="button" onClick={() => setIcon(i)} className={`p-3 border-2 transition-all ${icon === i ? 'border-primary bg-primary/20 text-primary' : 'border-rpg-slate text-gray-500'}`}>
                       <span className="material-symbols-outlined">{i}</span>
                     </button>
                   ))}
                 </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowAdd(false)} className="flex-1 py-5 bg-gray-700 text-white font-pixel text-[9px] border-b-4 border-black uppercase tracking-tighter">Cancel</button>
                <button type="submit" className="flex-[2] py-5 bg-primary text-black font-pixel text-[9px] border-b-4 border-r-4 border-[#7a7a35] uppercase tracking-tighter">Initialize Project</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const GoalCard = ({ goal, onDelete, onClaim }: any) => {
  const progress = Math.min(100, (goal.currentValue / goal.targetValue) * 100);
  const isCompleted = goal.completed;

  return (
    <div className={`bg-rpg-deep-slate border-4 p-10 relative overflow-hidden group shadow-pixel transition-all hover:bg-black/40 flex flex-col gap-8 
      ${isCompleted ? 'border-primary shadow-[0_0_30px_rgba(242,204,13,0.2)]' : 'border-rpg-slate'}`}>
      
      <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none group-hover:scale-125 transition-transform duration-1000">
        <span className="material-symbols-outlined text-[120px]">{goal.icon}</span>
      </div>

      <div className="flex justify-between items-start relative z-10">
        <div className="min-w-0 flex-1">
          <div className={`size-14 mb-6 flex items-center justify-center border-4 shadow-pixel ${goal.color} border-white/20`}>
             <span className="material-symbols-outlined text-white text-3xl">{goal.icon}</span>
          </div>
          <h3 className={`text-2xl font-black uppercase tracking-tighter mb-2 italic ${isCompleted ? 'text-primary' : 'text-white'}`}>{goal.title}</h3>
          <p className="text-gray-500 text-xs font-medium italic line-clamp-2 leading-relaxed opacity-80">"{goal.description}"</p>
        </div>
        <button onClick={onDelete} className="p-2 text-gray-600 hover:text-rpg-red transition-colors opacity-0 group-hover:opacity-100"><span className="material-symbols-outlined">delete</span></button>
      </div>

      <div className="space-y-4 relative z-10">
         <div className="flex justify-between items-end text-[9px] font-pixel text-gray-500 uppercase tracking-widest">
            <span>Building Momentum</span>
            <span className={`tabular-nums font-black ${isCompleted ? 'text-primary' : ''}`}>
              {Math.floor(goal.currentValue)} / {goal.targetValue}
            </span>
         </div>
         <div className="h-6 w-full bg-black/60 border-2 border-white/5 relative overflow-hidden p-[2px] shadow-inner">
           <div 
             className={`h-full transition-all duration-1000 relative ${isCompleted ? 'bg-primary' : 'bg-blue-600'}`} 
             style={{ width: `${progress}%` }}
           >
              <div className="absolute inset-0 bg-white/10 animate-pulse"></div>
           </div>
         </div>
      </div>

      {isCompleted && !goal.rewardClaimed ? (
        <button 
          onClick={onClaim}
          className="w-full py-6 bg-primary text-black font-pixel text-xs border-b-8 border-r-8 border-[#7a7a35] hover:brightness-110 active:translate-y-2 active:border-0 transition-all flex items-center justify-center gap-4 animate-bounce mt-4 shadow-2xl"
        >
          <span className="material-symbols-outlined text-2xl">workspace_premium</span>
          CLAIM ASCENSION REWARD
        </button>
      ) : goal.rewardClaimed ? (
        <div className="w-full py-5 text-center bg-black/40 border-2 border-primary/20 text-primary font-pixel text-[8px] uppercase tracking-[0.3em] flex items-center justify-center gap-3">
          <span className="material-symbols-outlined text-sm">verified</span>
          LORE ESTABLISHED
        </div>
      ) : (
        <div className="mt-4 pt-4 border-t-2 border-white/5 flex items-center gap-4 text-gray-500">
          <span className="material-symbols-outlined animate-spin text-sm">sync</span>
          <p className="text-[8px] font-pixel uppercase tracking-widest">Linked Quests & Training provide fuel...</p>
        </div>
      )}
    </div>
  );
};

export default Goals;

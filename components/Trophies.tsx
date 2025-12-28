
import React from 'react';
import { useGame, TROPHIES } from '../context/GameContext';

const Trophies: React.FC = () => {
  const { user } = useGame();
  
  if (!user) return null;

  return (
    <div className="bg-rpg-deep-slate border-4 border-rpg-slate p-8 shadow-pixel-card animate-in zoom-in duration-500">
      <div className="text-center mb-10">
        <h2 className="font-pixel text-primary text-2xl tracking-tighter mb-2 uppercase">Chamber of Legends</h2>
        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.3em]">Your eternal milestones</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {TROPHIES.map(trophy => {
          const isUnlocked = user.trophies.includes(trophy.id);
          return (
            <div 
              key={trophy.id} 
              className={`p-6 border-4 flex flex-col items-center text-center transition-all duration-500
                ${isUnlocked ? 'border-primary bg-primary/5 shadow-lg' : 'border-black/20 bg-black/40 grayscale opacity-40'}`}
            >
              <div className={`size-20 rounded-full flex items-center justify-center mb-4 border-2
                ${isUnlocked ? 'bg-primary/20 border-primary text-primary' : 'bg-black/20 border-gray-600 text-gray-600'}`}>
                <span className="material-symbols-outlined text-5xl">{trophy.icon}</span>
              </div>
              <h3 className={`font-pixel text-xs mb-2 ${isUnlocked ? 'text-primary' : 'text-gray-500'}`}>{trophy.title}</h3>
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-tight leading-relaxed">
                {trophy.description}
              </p>
              {!isUnlocked && (
                <div className="mt-4 pt-4 border-t border-white/5 w-full">
                  <p className="text-[8px] font-pixel text-rpg-red/50 uppercase">Locked</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-12 p-4 bg-black/20 text-center rounded">
        <p className="text-[8px] font-pixel text-primary/40 uppercase">Keep adventuring to unlock more legacies...</p>
      </div>
    </div>
  );
};

export default Trophies;

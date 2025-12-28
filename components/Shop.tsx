
import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Reward } from '../types';

const REWARDS: Reward[] = [
  { id: '1', title: 'Streak Freeze', description: 'Recover a missed habit day.', cost: 300, type: 'item', icon: 'science' },
  { id: '2', title: 'Power Nap', description: 'Instantly restore 20 HP.', cost: 150, type: 'buff', icon: 'bedtime' },
  { id: '3', title: 'Gaming Session', description: 'Redeem 1 hour of guilt-free play.', cost: 500, type: 'irl', icon: 'sports_esports' },
  { id: '4', title: 'Favorite Treat', description: 'Redeem for a snack of choice.', cost: 400, type: 'irl', icon: 'local_pizza' },
];

const Shop: React.FC = () => {
  const { user, buyReward, updateHP } = useGame();
  const [msg, setMsg] = useState('');

  const handlePurchase = async (reward: Reward) => {
    if (!user) return;
    if (user.gold < reward.cost) {
      setMsg('NOT ENOUGH GOLD!');
      return;
    }

    const success = await buyReward(reward.cost);
    if (success) {
      if (reward.id === '2') await updateHP(20);
      setMsg(`PURCHASED: ${reward.title}`);
      setTimeout(() => setMsg(''), 3000);
    }
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
      <div className="text-center">
        <h2 className="font-pixel text-primary text-2xl tracking-tighter mb-2">THE MERCHANT'S WARES</h2>
        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.3em]">EXCHANGE GOLD FOR POWER AND PLEASURE</p>
      </div>

      {msg && (
        <div className="bg-primary/20 border-2 border-primary text-primary font-pixel text-[10px] p-4 text-center animate-bounce">
          {msg}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {REWARDS.map(reward => (
          <div key={reward.id} className="bg-rpg-deep-slate border-4 border-rpg-slate p-1 shadow-pixel group hover:-translate-y-1 transition-transform">
             <div className="bg-rpg-sand/10 border-2 border-rpg-slate/40 p-6 flex flex-col h-full">
                <div className="aspect-square bg-black/40 mb-6 flex items-center justify-center border-2 border-white/10 group-hover:border-primary transition-colors">
                   <span className="material-symbols-outlined text-5xl text-primary group-hover:scale-110 transition-transform">{reward.icon}</span>
                </div>
                <h3 className="font-pixel text-[10px] text-white mb-2">{reward.title}</h3>
                <p className="text-gray-400 text-xs mb-6 flex-1">{reward.description}</p>
                <div className="pt-4 border-t-2 border-dashed border-white/10 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-1">
                    <span className="text-primary font-bold">{reward.cost}</span>
                    <span className="text-primary/50 text-[10px] font-pixel">G</span>
                  </div>
                  <button 
                    onClick={() => handlePurchase(reward)}
                    disabled={user && user.gold < reward.cost}
                    className="bg-primary text-black font-pixel text-[8px] px-3 py-2 border-b-2 border-black active:border-0 disabled:opacity-30 transition-all"
                  >
                    BUY
                  </button>
                </div>
             </div>
          </div>
        ))}

        <div className="bg-[#1e293b] border-4 border-dashed border-[#475569] p-1 shadow-pixel opacity-50 group">
           <div className="bg-black/20 border-2 border-dashed border-white/5 p-6 flex flex-col items-center justify-center h-full gap-4">
              <span className="material-symbols-outlined text-4xl text-gray-500">lock</span>
              <p className="font-pixel text-[8px] text-gray-500 uppercase">Mystery Item</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;

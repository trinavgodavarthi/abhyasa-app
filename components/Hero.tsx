
import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { GoogleGenAI } from "@google/genai";

interface HeroProps {
  onInventoryOpen?: () => void;
  onConfigOpen?: () => void;
}

const Hero: React.FC<HeroProps> = ({ onInventoryOpen, onConfigOpen }) => {
  const { user } = useGame();
  const [prophecy, setProphecy] = useState<string>('');
  const [loadingProphecy, setLoadingProphecy] = useState(false);

  useEffect(() => {
    if (user && !prophecy) {
      fetchProphecy();
    }
  }, [user]);

  // Fetch a mystical RPG prophecy using Gemini Flash
  const fetchProphecy = async () => {
    if (!process.env.API_KEY || !user) return;
    setLoadingProphecy(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `You are an RPG Oracle. Give a cryptic but motivating one-sentence daily prophecy for a level ${user.level} ${user.characterClass || 'Paladin'} named ${user.username} who is building productive habits.`,
      });
      setProphecy(response.text || "The path ahead is clear to those with a steady heart.");
    } catch (e) {
      setProphecy("Steel your resolve, for today's effort is tomorrow's legend.");
    } finally {
      setLoadingProphecy(false);
    }
  };

  if (!user) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-500">
      {/* Visualizer */}
      <div className="lg:col-span-5">
        <div className="bg-rpg-slate rounded-lg border-4 border-rpg-deep-slate shadow-[8px_8px_0px_0px_rgba(0,0,0,0.3)] overflow-hidden">
          <div className="bg-rpg-deep-slate px-4 py-2 flex justify-between items-center">
            <span className="text-white font-bold text-xs uppercase opacity-70">Visualizer</span>
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
            </div>
          </div>
          
          <div className="relative h-[450px] bg-rpg-sand flex items-end justify-center overflow-hidden" 
               style={{ backgroundImage: 'linear-gradient(to bottom, #87CEEB 0%, #D6AA76 80%)' }}>
            <img 
              src={`https://picsum.photos/seed/${user.username}/600/800`}
              alt="Character" 
              className="relative z-10 h-[90%] w-auto object-cover border-4 border-white shadow-2xl pixelated opacity-80"
            />
            <div className="absolute bottom-5 w-32 h-4 bg-black/20 rounded-full blur-[2px] z-0"></div>
          </div>

          <div className="bg-rpg-deep-slate p-6 border-t-4 border-black/20 text-center">
             <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">{user.username}</h2>
             <div className="inline-flex items-center gap-2 bg-black/30 px-4 py-1 rounded">
               <span className="material-symbols-outlined text-primary">military_tech</span>
               <span className="text-primary font-bold text-sm tracking-widest uppercase">LVL {user.level} {user.characterClass || 'PALADIN'}</span>
             </div>
          </div>
        </div>

        {/* AI Prophecy Section */}
        <div className="mt-6 bg-black/40 border-l-4 border-primary p-4 rounded shadow-lg">
           <div className="flex items-center gap-2 mb-2">
             <span className="material-symbols-outlined text-primary text-sm">auto_awesome</span>
             <span className="text-primary font-pixel text-[8px] uppercase tracking-widest">Oracle's Wisdom</span>
           </div>
           <p className="text-gray-300 italic text-xs leading-relaxed font-serif">
             {loadingProphecy ? "Channeling the arcane..." : `"${prophecy}"`}
           </p>
        </div>
      </div>

      {/* Attributes */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        <div className="bg-rpg-deep-slate rounded-lg border-4 border-rpg-slate shadow-[8px_8px_0px_0px_rgba(0,0,0,0.3)] p-8">
           <div className="flex justify-between items-end border-b-2 border-white/10 pb-4 mb-6">
             <div>
               <h3 className="text-3xl font-bold text-white tracking-tight">Attributes</h3>
               <p className="text-gray-400 text-sm">Level your productive potential</p>
             </div>
           </div>

           <div className="space-y-8">
             <AttributeBar icon="fitness_center" color="text-rpg-red" fill="bg-rpg-red" label="Physical (STR)" value={user.level * 2} max={100} />
             <AttributeBar icon="menu_book" color="text-blue-400" fill="bg-blue-400" label="Intellect (INT)" value={user.level * 3} max={100} />
             <AttributeBar icon="bolt" color="text-purple-400" fill="bg-purple-600" label="Focus (FOC)" value={user.level * 1.5} max={100} />
           </div>

           <div className="mt-12 pt-8 border-t-2 border-dashed border-white/10 flex justify-end">
              <div className="bg-black/30 px-6 py-4 border-2 border-primary/30 rounded-lg flex items-center gap-4">
                <div className="size-10 rounded-full bg-yellow-500 border-2 border-yellow-200 shadow-lg flex items-center justify-center">
                  <span className="text-yellow-900 font-bold">$</span>
                </div>
                <div>
                  <p className="text-[10px] text-primary/70 font-bold uppercase tracking-widest">Wallet</p>
                  <p className="text-2xl font-black text-primary leading-none tracking-tight">{user.gold} G</p>
                </div>
              </div>
           </div>
        </div>

        {/* Action Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <ActionCard icon="backpack" label="Inventory" onClick={onInventoryOpen} />
          <ActionCard icon="trophy" label="Trophies" />
          <ActionCard icon="settings" label="Config" onClick={onConfigOpen} />
          <ActionCard icon="help" label="Guide" />
        </div>
      </div>
    </div>
  );
};

const AttributeBar = ({ icon, color, fill, label, value, max }: any) => (
  <div>
    <div className="flex justify-between items-center mb-2">
      <div className={`flex items-center gap-2 ${color}`}>
        <span className="material-symbols-outlined font-bold">{icon}</span>
        <span className="font-bold text-lg tracking-wide uppercase">{label}</span>
      </div>
      <span className="text-white font-bold text-xl">LV.{Math.floor(value / 10) + 1}</span>
    </div>
    <div className="h-10 w-full bg-black/40 rounded border-2 border-white/10 relative overflow-hidden">
      <div className={`h-full ${fill} transition-all duration-700 relative border-r-4 border-white/20`} style={{ width: `${(value / max) * 100}%` }}>
        <div className="absolute top-1 left-0 right-0 h-[2px] bg-white/30"></div>
      </div>
      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-pixel text-white/30 pointer-events-none">
        {Math.floor(value)} / {max} PROGRESS
      </span>
    </div>
  </div>
);

const ActionCard = ({ icon, label, onClick }: any) => (
  <div 
    onClick={onClick}
    className="aspect-square bg-rpg-deep-slate rounded border-2 border-rpg-slate hover:border-primary transition-all cursor-pointer flex flex-col items-center justify-center gap-2 group p-4 text-center">
    <span className="material-symbols-outlined text-gray-500 group-hover:text-primary text-4xl">{icon}</span>
    <span className="text-[10px] uppercase font-bold text-gray-400 group-hover:text-white">{label}</span>
  </div>
);

export default Hero;

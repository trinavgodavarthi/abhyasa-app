
import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { GoogleGenAI } from "@google/genai";
import { CharacterClass } from '../types';

interface HeroProps {
  onInventoryOpen?: () => void;
  onConfigOpen?: () => void;
  onTrophiesOpen?: () => void;
  onGuideOpen?: () => void;
}

const Hero: React.FC<HeroProps> = ({ onInventoryOpen, onConfigOpen, onTrophiesOpen, onGuideOpen }) => {
  const { user, tasks, updateTaskTime } = useGame();
  const [prophecy, setProphecy] = useState<string>('');
  const [loadingProphecy, setLoadingProphecy] = useState(false);
  
  const [activeQuestId, setActiveQuestId] = useState<string>('');
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef<number | null>(null);

  const activeQuest = tasks.find(t => t.id === activeQuestId);
  const activeCategory = user?.categories.find(c => c.id === activeQuest?.category);
  const alignment = activeCategory?.alignment || 'FOC';

  useEffect(() => {
    if (user && !prophecy) fetchProphecy();
  }, [user]);

  useEffect(() => {
    if (isTimerActive && !isPaused) {
      timerRef.current = window.setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isTimerActive, isPaused]);

  const fetchProphecy = async () => {
    if (!process.env.API_KEY || !user) return;
    setLoadingProphecy(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `RPG Oracle prophecy for lvl ${user.level} ${user.characterClass}. Motivating one-sentence prophecy. Keep it cryptic, inspiring, and very brief.`,
        config: {
          systemInstruction: "You are a cryptic RPG oracle speaking to a hero. Your tone is archaic but motivating.",
        }
      });
      setProphecy(response.text || "The stars are in alignment.");
    } catch (e) {
      setProphecy("Steel your resolve, champion.");
    } finally {
      setLoadingProphecy(false);
    }
  };

  const handleFinishFocus = async () => {
    const minutes = Math.floor(elapsedSeconds / 60);
    if (minutes > 0 && activeQuestId) {
      await updateTaskTime(activeQuestId, minutes);
    }
    setIsTimerActive(false);
    setIsPaused(false);
    setElapsedSeconds(0);
    setActiveQuestId('');
  };

  const handleDiscard = () => {
    setIsTimerActive(false);
    setIsPaused(false);
    setElapsedSeconds(0);
    setActiveQuestId('');
  };

  const activeQuestsList = tasks.filter(t => !t.completed);
  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!user) return null;

  return (
    <div className="flex flex-col gap-10 animate-in fade-in duration-700 max-w-6xl mx-auto">
      {/* Hero Profile Banner - Cinematic Header */}
      <div className="relative overflow-hidden bg-rpg-deep-slate border-4 border-primary/20 p-8 flex flex-col md:flex-row items-center gap-8 shadow-2xl">
        <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-primary/60"></div>
        <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-primary/60"></div>
        <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-primary/60 opacity-20"></div>
        <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-primary/60 opacity-20"></div>
        
        <div className="relative group shrink-0">
          <div className="size-28 rounded-none bg-black border-4 border-primary p-1 overflow-hidden shadow-[0_0_25px_rgba(242,204,13,0.15)] ring-4 ring-black/50">
             <div className="w-full h-full pixelated bg-cover bg-center group-hover:scale-105 transition-transform duration-700" 
                  style={{ backgroundImage: `url('https://picsum.photos/seed/${user.username}/200')` }}>
             </div>
          </div>
          <div className="absolute -bottom-3 -right-3 bg-primary text-black font-pixel text-[10px] px-3 py-1.5 border-2 border-black shadow-pixel-card z-10">
            LVL {user.level}
          </div>
        </div>

        <div className="flex-1 text-center md:text-left z-10">
          <h2 className="text-4xl font-black text-white uppercase tracking-tighter leading-none mb-4 italic">
            Hero {user.username}
          </h2>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-5">
            <span className="flex items-center gap-2 text-primary font-pixel text-[10px] uppercase bg-black/30 px-3 py-1.5 border border-primary/20">
              <span className="material-symbols-outlined text-sm">shield_person</span>
              {user.characterClass || 'Paladin'}
            </span>
            <div className="flex items-center gap-2 text-gray-400 font-bold text-[10px] uppercase tracking-widest bg-white/5 px-3 py-1.5">
              <span className="material-symbols-outlined text-sm">history_edu</span>
              Seeker of Greatness
            </div>
          </div>
        </div>

        <div className="hidden lg:grid grid-cols-1 gap-3 shrink-0">
           <StatusBadge label="HP" value={user.hp} max={100} color="bg-rpg-red" />
           <StatusBadge label="XP" value={user.xp} max={Math.floor(100 * Math.pow(1.5, user.level - 1))} color="bg-rpg-green" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Focus Altar */}
        <div className="lg:col-span-7 h-full">
          <div className={`h-full border-4 p-10 relative flex flex-col transition-all duration-700 overflow-hidden shadow-pixel ${isTimerActive ? 'bg-black border-primary ring-4 ring-primary/5' : 'bg-rpg-deep-slate border-rpg-slate'}`}>
            {/* Decorative Corner Ornaments */}
            <span className="absolute top-4 left-4 material-symbols-outlined text-primary/20 text-2xl">square_foot</span>
            <span className="absolute top-4 right-4 material-symbols-outlined text-primary/20 text-2xl rotate-90">square_foot</span>
            <span className="absolute bottom-4 left-4 material-symbols-outlined text-primary/20 text-2xl -rotate-90">square_foot</span>
            <span className="absolute bottom-4 right-4 material-symbols-outlined text-primary/20 text-2xl rotate-180">square_foot</span>

            <div className="mb-10 text-center lg:text-left">
              <h3 className="font-pixel text-[12px] text-primary mb-3 uppercase flex items-center justify-center lg:justify-start gap-4 tracking-tighter">
                 The Altar of Focus
                 {isTimerActive && !isPaused && <span className="animate-ping size-2 rounded-full bg-primary inline-block"></span>}
              </h3>
              <p className="text-gray-500 text-[9px] uppercase font-black tracking-widest opacity-60">Sacrifice your distractions to the gods of industry</p>
            </div>

            <div className="flex-1 flex flex-col justify-center items-center py-6">
              {!isTimerActive ? (
                <div className="w-full max-w-sm space-y-8 animate-in fade-in duration-500">
                   <div className="space-y-4">
                     <label className="block text-[9px] font-pixel text-gray-500 uppercase ml-1 tracking-widest">Select Your Purpose</label>
                     <div className="relative">
                       <select 
                        value={activeQuestId} 
                        onChange={e => setActiveQuestId(e.target.value)}
                        className="w-full bg-black/60 border-2 border-primary/20 p-5 text-white text-[10px] font-bold outline-none uppercase cursor-pointer hover:border-primary/50 transition-colors rounded-none appearance-none font-pixel"
                        style={{ backgroundImage: 'linear-gradient(45deg, transparent 50%, #f2cc0d 50%), linear-gradient(135deg, #f2cc0d 50%, transparent 50%)', backgroundPosition: 'calc(100% - 25px) calc(1.5em), calc(100% - 20px) calc(1.5em)', backgroundSize: '6px 6px, 6px 6px', backgroundRepeat: 'no-repeat' }}
                       >
                         <option value="">-- NO QUEST SELECTED --</option>
                         {activeQuestsList.map(q => <option key={q.id} value={q.id}>{q.title}</option>)}
                       </select>
                     </div>
                   </div>
                   
                   <button 
                    disabled={!activeQuestId}
                    onClick={() => setIsTimerActive(true)}
                    className="w-full bg-primary text-black font-pixel text-[10px] py-6 border-b-8 border-r-8 border-[#7a7a35] hover:bg-yellow-400 disabled:opacity-30 active:translate-y-2 active:translate-x-2 active:border-0 transition-all flex items-center justify-center gap-4 group"
                   >
                     <span className="material-symbols-outlined text-xl group-hover:animate-bounce">bolt</span>
                     BEGIN INCANTATION
                   </button>
                </div>
              ) : (
                <div className="w-full text-center space-y-10 animate-in zoom-in duration-500">
                   <div className="space-y-4">
                      <div className="flex items-center justify-center gap-2">
                        <span className="h-[1px] w-8 bg-primary/30"></span>
                        <p className="text-[10px] font-pixel text-primary uppercase animate-pulse">Deep Concentration Active</p>
                        <span className="h-[1px] w-8 bg-primary/30"></span>
                      </div>
                      <p className="text-white font-black text-3xl uppercase tracking-tighter line-clamp-2 max-w-lg mx-auto leading-tight italic">{activeQuest?.title}</p>
                   </div>
                   
                   <div className={`text-9xl font-ui font-black tracking-[0.2em] tabular-nums transition-all ${isPaused ? 'text-gray-700' : 'text-primary drop-shadow-[0_0_20px_rgba(242,204,13,0.3)]'}`}>
                     {formatTime(elapsedSeconds)}
                   </div>

                   <div className="flex items-center gap-4 justify-center text-gray-500 font-pixel text-[9px] uppercase bg-black/20 py-3 max-w-xs mx-auto rounded border border-white/5">
                     <span className={`material-symbols-outlined text-lg ${!isPaused ? 'animate-spin' : ''}`}>{isPaused ? 'timer_off' : 'sync'}</span>
                     {isPaused ? 'MEDITATION HALTED' : `ABSORBING ${alignment} ENERGY`}
                   </div>

                   <div className="grid grid-cols-2 gap-5 max-w-sm mx-auto">
                     <button 
                      onClick={() => setIsPaused(!isPaused)}
                      className={`py-5 font-pixel text-[9px] border-b-4 border-r-4 transition-all uppercase flex items-center justify-center gap-3
                        ${isPaused ? 'bg-rpg-green text-black border-[#4e8235] hover:brightness-110' : 'bg-yellow-700 text-white border-yellow-900 hover:bg-yellow-600'}`}
                     >
                       <span className="material-symbols-outlined text-lg">{isPaused ? 'play_arrow' : 'pause'}</span>
                       {isPaused ? 'Resume' : 'Pause'}
                     </button>

                     <button 
                      onClick={handleFinishFocus}
                      className="py-5 bg-primary text-black font-pixel text-[9px] border-b-4 border-r-4 border-[#7a7a35] hover:bg-yellow-400 active:translate-y-1 active:translate-x-1 transition-all uppercase flex items-center justify-center gap-3"
                     >
                       <span className="material-symbols-outlined text-lg">auto_fix</span>
                       Log Session
                     </button>
                     
                     <button 
                      onClick={handleDiscard}
                      className="col-span-2 py-4 bg-black/40 text-rpg-red font-pixel text-[8px] border-2 border-rpg-red/20 hover:border-rpg-red/60 hover:bg-rpg-red/5 transition-all uppercase tracking-[0.2em]"
                     >
                       Abort Concentration
                     </button>
                   </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Stats & Meta */}
        <div className="lg:col-span-5 flex flex-col gap-10">
          {/* Attributes Card */}
          <div className="bg-rpg-deep-slate border-4 border-rpg-slate p-10 shadow-pixel relative overflow-hidden">
            <span className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <span className="material-symbols-outlined text-9xl">stat_3</span>
            </span>
            <h3 className="font-pixel text-[12px] text-white mb-10 border-b-4 border-white/5 pb-5 uppercase tracking-tighter">Heroic Attributes</h3>
            
            <div className="space-y-10">
              <AttributeRow icon="fitness_center" color="text-rpg-red" fill="bg-rpg-red" label="STR" value={user.stats.str} title="Physical Strength" />
              <AttributeRow icon="menu_book" color="text-blue-400" fill="bg-blue-400" label="INT" value={user.stats.int} title="Arcane Knowledge" />
              <AttributeRow icon="bolt" color="text-primary" fill="bg-primary" label="FOC" value={user.stats.foc} title="Spiritual Focus" />
            </div>

            <div className="mt-12 pt-8 border-t-4 border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="size-10 bg-primary/20 flex items-center justify-center text-primary border-2 border-primary/40 font-black text-lg">$</div>
                <div>
                   <p className="text-[9px] text-gray-500 font-black uppercase leading-none mb-2">Vault Balance</p>
                   <p className="text-2xl font-black text-primary leading-none tabular-nums tracking-tighter">{user.gold} GOLD</p>
                </div>
              </div>
              <button 
                onClick={onInventoryOpen}
                className="text-[9px] font-pixel text-gray-500 hover:text-white uppercase underline underline-offset-8 transition-colors"
              >
                Ledger
              </button>
            </div>
          </div>

          {/* Quick Nav Panel */}
          <div className="grid grid-cols-4 gap-4">
             <QuickNavBtn icon="backpack" label="GEAR" onClick={onInventoryOpen} />
             <QuickNavBtn icon="military_tech" label="TROPHIES" onClick={onTrophiesOpen} />
             <QuickNavBtn icon="terminal" label="CONFIG" onClick={onConfigOpen} />
             <QuickNavBtn icon="auto_stories" label="TOME" onClick={onGuideOpen} />
          </div>

          {/* Prophecy Scroll - High Flavor Text */}
          <div className="mt-auto bg-rpg-paper border-4 border-[#3d2b1f] p-8 shadow-2xl relative overflow-hidden group hover:-translate-y-1 transition-transform">
             <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/handmade-paper.png')]"></div>
             
             <div className="relative">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#3d2b1f] text-2xl animate-pulse">auto_awesome</span>
                    <span className="text-[#3d2b1f] font-pixel text-[9px] uppercase font-black tracking-widest">Today's Omen</span>
                  </div>
                  <button onClick={fetchProphecy} className="text-[#3d2b1f]/40 hover:text-[#3d2b1f] transition-colors">
                    <span className="material-symbols-outlined text-lg">refresh</span>
                  </button>
                </div>
                <p className="text-[#3d2b1f] italic text-lg font-serif leading-relaxed line-clamp-4 relative z-10">
                  {loadingProphecy ? "The oracle is gazing into the void..." : `"${prophecy}"`}
                </p>
                <div className="mt-6 flex justify-end">
                   <span className="text-[7px] font-pixel text-[#3d2b1f]/30 uppercase">— The Archon Oracle</span>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatusBadge = ({ label, value, max, color }: any) => (
  <div className="bg-black/60 px-5 py-3 border-2 border-white/5 flex flex-col gap-2 w-40 shadow-inner">
    <div className="flex justify-between text-[9px] font-pixel">
      <span className="text-gray-500 uppercase tracking-tighter">{label}</span>
      <span className="text-white tabular-nums">{value}/{max}</span>
    </div>
    <div className="h-2 w-full bg-white/5 rounded-none overflow-hidden border border-black/40">
      <div className={`h-full ${color} transition-all duration-1000 relative`} style={{ width: `${(value / max) * 100}%` }}>
        <div className="absolute inset-0 bg-white/10 animate-pulse"></div>
      </div>
    </div>
  </div>
);

const AttributeRow = ({ icon, color, fill, label, value, title }: any) => {
  const level = Math.floor(value / 100) + 1;
  const progress = value % 100;
  return (
    <div className="group/row">
      <div className="flex justify-between items-end mb-2">
        <div className={`flex items-center gap-3 ${color} transition-all group-hover/row:translate-x-1`}>
          <span className="material-symbols-outlined text-xl font-black">{icon}</span>
          <div className="flex flex-col">
            <span className="text-[11px] font-black uppercase tracking-widest leading-none">{label}</span>
            <span className="text-[7px] text-gray-500 uppercase font-bold leading-none mt-1 opacity-60">{title}</span>
          </div>
        </div>
        <div className="text-right">
           <span className="text-white/80 font-pixel text-[8px] uppercase tracking-tighter">Rank {level}</span>
        </div>
      </div>
      <div className="h-4 w-full bg-black/60 rounded-none border-2 border-white/5 overflow-hidden shadow-inner flex p-[2px]">
        <div className={`h-full ${fill} transition-all duration-1000 relative shadow-[0_0_10px_rgba(255,255,255,0.1)]`} style={{ width: `${progress}%` }}>
           <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/20"></div>
           {progress > 90 && <div className="absolute inset-0 bg-white/30 animate-pulse"></div>}
        </div>
      </div>
    </div>
  );
};

const QuickNavBtn = ({ icon, label, onClick }: any) => (
  <button 
    onClick={onClick}
    className="aspect-square bg-rpg-deep-slate border-4 border-rpg-slate hover:border-primary hover:bg-black/40 transition-all flex flex-col items-center justify-center gap-3 group shadow-pixel active:translate-y-1 overflow-hidden relative"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
    <span className="material-symbols-outlined text-gray-500 group-hover:text-primary text-3xl group-hover:scale-110 transition-transform relative z-10">{icon}</span>
    <span className="text-[8px] font-pixel text-gray-600 group-hover:text-white uppercase tracking-tighter relative z-10">{label}</span>
  </button>
);

export default Hero;

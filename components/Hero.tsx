
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
        contents: `RPG Oracle prophecy for lvl ${user.level} ${user.characterClass}. Motivating one-sentence. Keep it cryptic but inspiring.`,
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
    <div className="flex flex-col gap-8 animate-in fade-in duration-700 max-w-6xl mx-auto">
      {/* Hero Profile Banner */}
      <div className="relative overflow-hidden bg-rpg-deep-slate border-x-4 border-t-4 border-primary/20 p-6 flex flex-col md:flex-row items-center gap-6">
        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary"></div>
        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary"></div>
        
        <div className="relative group shrink-0">
          <div className="size-24 rounded-none bg-black border-4 border-primary/40 p-1 overflow-hidden shadow-2xl">
             <div className="w-full h-full pixelated bg-cover bg-center" 
                  style={{ backgroundImage: `url('https://picsum.photos/seed/${user.username}/200')` }}>
             </div>
          </div>
          <div className="absolute -bottom-2 -right-2 bg-primary text-black font-pixel text-[8px] px-2 py-1 shadow-pixel">
            LVL {user.level}
          </div>
        </div>

        <div className="flex-1 text-center md:text-left">
          <h2 className="text-3xl font-black text-white uppercase tracking-tight leading-none mb-2">
            Hero {user.username}
          </h2>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
            <span className="flex items-center gap-2 text-primary font-pixel text-[10px] uppercase">
              <span className="material-symbols-outlined text-sm">shield_person</span>
              {user.characterClass || 'Paladin'}
            </span>
            <span className="w-1 h-1 bg-gray-600 rounded-full hidden md:block"></span>
            <span className="text-gray-400 font-bold text-xs uppercase tracking-widest">
              Seeker of Greatness
            </span>
          </div>
        </div>

        <div className="hidden lg:flex gap-4">
           <StatusBadge label="HP" value={user.hp} max={100} color="bg-rpg-red" />
           <StatusBadge label="XP" value={user.xp} max={Math.floor(100 * Math.pow(1.5, user.level - 1))} color="bg-rpg-green" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Focus Altar */}
        <div className="lg:col-span-7">
          <div className={`h-full border-4 p-8 relative flex flex-col transition-all duration-500 overflow-hidden ${isTimerActive ? 'bg-black border-primary shadow-[0_0_30px_rgba(242,204,13,0.15)]' : 'bg-rpg-deep-slate border-rpg-slate'}`}>
            {/* Decorative Corner Ornaments */}
            <span className="absolute top-2 left-2 material-symbols-outlined text-primary/30 text-lg">square_foot</span>
            <span className="absolute top-2 right-2 material-symbols-outlined text-primary/30 text-lg">square_foot</span>
            <span className="absolute bottom-2 left-2 material-symbols-outlined text-primary/30 text-lg rotate-180">square_foot</span>
            <span className="absolute bottom-2 right-2 material-symbols-outlined text-primary/30 text-lg rotate-180">square_foot</span>

            <div className="mb-8">
              <h3 className="font-pixel text-[10px] text-primary mb-2 uppercase flex items-center gap-3">
                 The Altar of Focus
                 {isTimerActive && !isPaused && <span className="animate-ping size-1.5 rounded-full bg-primary inline-block"></span>}
              </h3>
              <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">Channel your spirit into a single objective</p>
            </div>

            <div className="flex-1 flex flex-col justify-center items-center py-10">
              {!isTimerActive ? (
                <div className="w-full max-w-sm space-y-6">
                   <div className="space-y-2">
                     <label className="text-[8px] font-pixel text-gray-500 uppercase ml-1">Current Quest</label>
                     <select 
                      value={activeQuestId} 
                      onChange={e => setActiveQuestId(e.target.value)}
                      className="w-full bg-black/60 border-2 border-primary/20 p-4 text-white text-xs font-bold outline-none uppercase cursor-pointer hover:border-primary/40 transition-colors rounded-none appearance-none"
                      style={{ backgroundImage: 'linear-gradient(45deg, transparent 50%, #f2cc0d 50%), linear-gradient(135deg, #f2cc0d 50%, transparent 50%)', backgroundPosition: 'calc(100% - 20px) calc(1em + 2px), calc(100% - 15px) calc(1em + 2px)', backgroundSize: '5px 5px, 5px 5px', backgroundRepeat: 'no-repeat' }}
                     >
                       <option value="">-- SELECT YOUR MISSION --</option>
                       {activeQuestsList.map(q => <option key={q.id} value={q.id}>{q.title}</option>)}
                     </select>
                   </div>
                   
                   <button 
                    disabled={!activeQuestId}
                    onClick={() => setIsTimerActive(true)}
                    className="w-full bg-primary text-black font-pixel text-xs py-5 border-b-8 border-r-8 border-[#7a7a35] hover:brightness-110 disabled:opacity-30 disabled:translate-y-0 active:border-0 active:translate-y-2 active:translate-x-2 transition-all flex items-center justify-center gap-3"
                   >
                     <span className="material-symbols-outlined">bolt</span>
                     BEGIN INCANTATION
                   </button>
                </div>
              ) : (
                <div className="w-full text-center space-y-8 animate-in zoom-in duration-300">
                   <div className="space-y-2">
                      <p className="text-[8px] font-pixel text-primary uppercase">Deep Concentration Active</p>
                      <p className="text-white font-black text-2xl uppercase tracking-tighter line-clamp-2 max-w-md mx-auto">{activeQuest?.title}</p>
                   </div>
                   
                   <div className={`text-8xl font-ui font-black tracking-widest tabular-nums transition-all ${isPaused ? 'text-gray-600' : 'text-primary animate-pulse'}`}>
                     {formatTime(elapsedSeconds)}
                   </div>

                   <div className="flex items-center gap-3 justify-center text-gray-500 font-pixel text-[8px] uppercase">
                     <span className="material-symbols-outlined text-sm">{isPaused ? 'timer_off' : 'cycle'}</span>
                     {isPaused ? 'MEDITATION HALTED' : `ABSORBING ${alignment} ENERGY`}
                   </div>

                   <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                     <button 
                      onClick={() => setIsPaused(!isPaused)}
                      className={`py-4 font-pixel text-[8px] border-b-4 border-r-4 transition-all uppercase flex items-center justify-center gap-2
                        ${isPaused ? 'bg-rpg-green text-black border-[#4e8235]' : 'bg-yellow-600 text-white border-yellow-800'}`}
                     >
                       <span className="material-symbols-outlined text-sm">{isPaused ? 'play_arrow' : 'pause'}</span>
                       {isPaused ? 'Resume' : 'Pause'}
                     </button>

                     <button 
                      onClick={handleFinishFocus}
                      className="py-4 bg-primary text-black font-pixel text-[8px] border-b-4 border-r-4 border-[#7a7a35] hover:bg-yellow-400 active:translate-y-1 active:translate-x-1 transition-all uppercase flex items-center justify-center gap-2"
                     >
                       <span className="material-symbols-outlined text-sm">auto_fix</span>
                       Log Soul
                     </button>
                     
                     <button 
                      onClick={handleDiscard}
                      className="col-span-2 py-3 bg-black/40 text-rpg-red font-pixel text-[8px] border-2 border-rpg-red/20 hover:border-rpg-red/60 transition-all uppercase"
                     >
                       Abort Concentration
                     </button>
                   </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Stats & Actions */}
        <div className="lg:col-span-5 flex flex-col gap-8">
          {/* Attributes Card */}
          <div className="bg-rpg-deep-slate border-4 border-rpg-slate p-8 shadow-pixel relative">
            <h3 className="font-pixel text-[10px] text-white mb-8 border-b-2 border-white/5 pb-4 uppercase">Heroic Attributes</h3>
            
            <div className="space-y-8">
              <AttributeRow icon="fitness_center" color="text-rpg-red" fill="bg-rpg-red" label="STR" value={user.stats.str} title="Physical Strength" />
              <AttributeRow icon="menu_book" color="text-blue-400" fill="bg-blue-400" label="INT" value={user.stats.int} title="Arcane Knowledge" />
              <AttributeRow icon="bolt" color="text-primary" fill="bg-primary" label="FOC" value={user.stats.foc} title="Spiritual Focus" />
            </div>

            <div className="mt-10 pt-6 border-t-2 border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-8 bg-primary/20 flex items-center justify-center text-primary border border-primary/40 font-black">$</div>
                <div>
                   <p className="text-[10px] text-primary/60 font-bold uppercase leading-none mb-1">Treasury</p>
                   <p className="text-xl font-black text-primary leading-none tabular-nums">{user.gold} G</p>
                </div>
              </div>
              <button 
                onClick={onInventoryOpen}
                className="text-[8px] font-pixel text-gray-500 hover:text-white uppercase tracking-tighter underline underline-offset-4"
              >
                View full Ledger
              </button>
            </div>
          </div>

          {/* Quick Nav Grid */}
          <div className="grid grid-cols-4 gap-4">
             <QuickNavBtn icon="backpack" label="GEAR" onClick={onInventoryOpen} />
             <QuickNavBtn icon="military_tech" label="TROPHIES" onClick={onTrophiesOpen} />
             <QuickNavBtn icon="terminal" label="CONFIG" onClick={onConfigOpen} />
             <QuickNavBtn icon="auto_stories" label="TOME" onClick={onGuideOpen} />
          </div>

          {/* Prophecy Scroll */}
          <div className="mt-auto bg-rpg-paper border-4 border-[#3d2b1f] p-6 shadow-2xl relative overflow-hidden group">
             <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/handmade-paper.png')]"></div>
             <div className="absolute top-2 right-2 flex gap-1">
                {[...Array(3)].map((_, i) => <div key={i} className="size-1 rounded-full bg-[#3d2b1f]/20"></div>)}
             </div>
             
             <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-[#3d2b1f] text-lg">auto_awesome</span>
                  <span className="text-[#3d2b1f] font-pixel text-[8px] uppercase font-black">Today's Omen</span>
                </div>
                <p className="text-[#3d2b1f] italic text-sm font-serif leading-relaxed line-clamp-3">
                  {loadingProphecy ? "The oracle is gazing into the void..." : `"${prophecy}"`}
                </p>
                <button 
                  onClick={fetchProphecy}
                  className="mt-4 text-[8px] font-pixel text-[#3d2b1f]/60 hover:text-[#3d2b1f] uppercase tracking-tighter"
                >
                  Consult again?
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatusBadge = ({ label, value, max, color }: any) => (
  <div className="bg-black/40 px-4 py-2 border-2 border-white/5 flex flex-col gap-1 w-32">
    <div className="flex justify-between text-[8px] font-pixel">
      <span className="text-gray-500 uppercase">{label}</span>
      <span className="text-white tabular-nums">{value}/{max}</span>
    </div>
    <div className="h-1.5 w-full bg-white/10 rounded-none overflow-hidden">
      <div className={`h-full ${color} transition-all duration-1000`} style={{ width: `${(value / max) * 100}%` }}></div>
    </div>
  </div>
);

const AttributeRow = ({ icon, color, fill, label, value, title }: any) => {
  const level = Math.floor(value / 100) + 1;
  const progress = value % 100;
  return (
    <div>
      <div className="flex justify-between items-end mb-1">
        <div className={`flex items-center gap-2 ${color}`}>
          <span className="material-symbols-outlined text-sm font-black">{icon}</span>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-tight leading-none">{label}</span>
            <span className="text-[6px] text-gray-500 uppercase font-bold leading-none mt-0.5">{title}</span>
          </div>
        </div>
        <div className="text-right">
           <span className="text-white font-pixel text-[8px] uppercase">Rank {level}</span>
        </div>
      </div>
      <div className="h-3 w-full bg-black/60 rounded-none border-2 border-white/5 overflow-hidden shadow-inner flex">
        <div className={`h-full ${fill} transition-all duration-700 relative`} style={{ width: `${progress}%` }}>
           <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/20"></div>
        </div>
      </div>
    </div>
  );
};

const QuickNavBtn = ({ icon, label, onClick }: any) => (
  <button 
    onClick={onClick}
    className="aspect-square bg-rpg-deep-slate border-4 border-rpg-slate hover:border-primary hover:bg-black/20 transition-all flex flex-col items-center justify-center gap-2 group shadow-pixel active:translate-y-1"
  >
    <span className="material-symbols-outlined text-gray-500 group-hover:text-primary text-2xl group-hover:scale-110 transition-transform">{icon}</span>
    <span className="text-[7px] font-pixel text-gray-500 group-hover:text-white uppercase tracking-tighter">{label}</span>
  </button>
);

export default Hero;

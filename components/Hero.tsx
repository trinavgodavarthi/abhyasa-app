
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
        contents: `RPG Oracle prophecy for lvl ${user.level} ${user.characterClass}. Motivating one-sentence.`,
      });
      setProphecy(response.text || "The path is clear.");
    } catch (e) {
      setProphecy("Steel your resolve.");
    } finally {
      setLoadingProphecy(false);
    }
  };

  const handleFinishFocus = async () => {
    const minutes = Math.floor(elapsedSeconds / 60);
    // If user stopped early but spent at least some time, we log it. 
    // We can round up to 1 if it's less than a minute but significant, 
    // but for RPG simplicity we stick to full minutes.
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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-500">
      <div className="lg:col-span-5 flex flex-col gap-6">
        <div className={`border-4 p-6 rounded relative overflow-hidden transition-all duration-500 ${isTimerActive ? 'bg-black border-primary shadow-[0_0_20px_rgba(242,204,13,0.3)]' : 'bg-rpg-deep-slate border-primary/40'}`}>
          <div className="absolute top-0 right-0 p-2">
            <span className={`material-symbols-outlined text-primary text-lg ${isTimerActive && !isPaused ? 'animate-spin' : ''}`}>
              hourglass_top
            </span>
          </div>
          <h3 className="font-pixel text-[10px] text-primary mb-4 uppercase flex items-center gap-2">
             THE FOCUS ALTAR
             {isTimerActive && !isPaused && <span className="animate-ping size-1.5 rounded-full bg-primary inline-block"></span>}
             {isTimerActive && isPaused && <span className="size-1.5 rounded-full bg-yellow-500 inline-block"></span>}
          </h3>
          
          {!isTimerActive ? (
            <div className="space-y-4">
               <select 
                value={activeQuestId} 
                onChange={e => setActiveQuestId(e.target.value)}
                className="w-full bg-black/40 border-2 border-primary/20 p-3 text-white text-xs font-bold outline-none uppercase cursor-pointer hover:border-primary/40 transition-colors"
               >
                 <option value="">SELECT QUEST TO FOCUS...</option>
                 {activeQuestsList.map(q => <option key={q.id} value={q.id}>{q.title}</option>)}
               </select>
               <button 
                disabled={!activeQuestId}
                onClick={() => setIsTimerActive(true)}
                className="w-full bg-primary text-black font-pixel text-[10px] py-4 border-b-4 border-r-4 border-[#7a7a35] disabled:opacity-30 disabled:translate-y-0 active:border-0 active:translate-y-1 active:translate-x-1 transition-all"
               >
                 ENTER DEEP FOCUS
               </button>
            </div>
          ) : (
            <div className="text-center py-4 space-y-4">
               <div className="animate-in slide-in-from-top-4 duration-500">
                  <p className="text-[8px] font-pixel text-primary uppercase mb-1">Active Objective:</p>
                  <p className="text-white font-bold text-lg uppercase tracking-tight line-clamp-1">{activeQuest?.title}</p>
               </div>
               
               <div className={`text-6xl font-ui font-bold tracking-widest tabular-nums py-2 transition-all ${isPaused ? 'text-gray-500' : 'text-primary animate-pulse'}`}>
                 {formatTime(elapsedSeconds)}
               </div>

               <div className="flex items-center gap-2 justify-center">
                 <span className="text-[8px] font-pixel text-gray-500 uppercase">
                    {isPaused ? 'Meditation Paused...' : `Channeling ${alignment} Essence...`}
                 </span>
               </div>

               <div className="flex flex-col gap-3">
                 <div className="grid grid-cols-2 gap-3">
                   <button 
                    onClick={() => setIsPaused(!isPaused)}
                    className={`py-3 font-pixel text-[8px] border-b-4 border-r-4 transition-all uppercase flex items-center justify-center gap-2
                      ${isPaused ? 'bg-rpg-green text-black border-[#4e8235]' : 'bg-yellow-600 text-white border-yellow-800'}`}
                   >
                     <span className="material-symbols-outlined text-sm">{isPaused ? 'play_arrow' : 'pause'}</span>
                     {isPaused ? 'Resume' : 'Pause'}
                   </button>

                   <button 
                    onClick={handleFinishFocus}
                    className="py-3 bg-primary text-black font-pixel text-[8px] border-b-4 border-r-4 border-[#7a7a35] hover:bg-yellow-400 active:translate-y-1 active:translate-x-1 transition-all uppercase flex items-center justify-center gap-2"
                   >
                     <span className="material-symbols-outlined text-sm">check_circle</span>
                     Finish & Log
                   </button>
                 </div>

                 <button 
                  onClick={handleDiscard}
                  className="w-full bg-black/40 text-rpg-red font-pixel text-[8px] py-2 border-2 border-rpg-red/20 hover:border-rpg-red/60 transition-all uppercase"
                 >
                   Discard Session
                 </button>
               </div>
            </div>
          )}
        </div>
      </div>

      <div className="lg:col-span-7 flex flex-col gap-6">
        <div className="bg-rpg-deep-slate rounded-lg border-4 border-rpg-slate shadow-[8px_8px_0px_0px_rgba(0,0,0,0.3)] p-8">
           <div className="flex justify-between items-end border-b-2 border-white/10 pb-4 mb-8">
             <div>
               <h3 className="text-3xl font-bold text-white tracking-tight uppercase">Attributes</h3>
               <p className="text-gray-400 text-xs uppercase font-pixel text-[8px]">Hero potential metrics</p>
             </div>
           </div>

           <div className="space-y-8">
             <AttributeBar icon="fitness_center" color="text-rpg-red" fill="bg-rpg-red" label="Physical (STR)" value={user.stats.str} />
             <AttributeBar icon="menu_book" color="text-blue-400" fill="bg-blue-400" label="Intellect (INT)" value={user.stats.int} />
             <AttributeBar icon="bolt" color="text-primary" fill="bg-primary" label="Focus (FOC)" value={user.stats.foc} />
           </div>

           <div className="mt-12 flex justify-end">
              <div className="bg-black/40 px-6 py-4 border-2 border-primary/30 rounded-lg flex items-center gap-4 hover:border-primary/60 transition-colors cursor-default">
                <div className="size-10 rounded-full bg-primary border-2 border-white/20 flex items-center justify-center text-black font-black shadow-pixel">$</div>
                <div>
                  <p className="text-[10px] text-primary/70 font-bold uppercase">Gold Reserves</p>
                  <p className="text-2xl font-black text-primary leading-none tabular-nums">{user.gold} G</p>
                </div>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <ActionCard icon="backpack" label="Inventory" onClick={onInventoryOpen} />
          <ActionCard icon="trophy" label="Trophies" onClick={onTrophiesOpen} />
          <ActionCard icon="settings" label="Config" onClick={onConfigOpen} />
          <ActionCard icon="help" label="Guide" onClick={onGuideOpen} />
        </div>

        <div className="bg-black/40 border-l-4 border-primary p-4 rounded mt-auto flex items-start gap-4">
           <div className="size-10 bg-primary/20 flex items-center justify-center rounded-sm text-primary shrink-0">
             <span className="material-symbols-outlined text-2xl animate-pulse">auto_awesome</span>
           </div>
           <div>
             <span className="text-primary font-pixel text-[8px] uppercase block mb-1">Daily Prophecy</span>
             <p className="text-gray-400 italic text-xs font-serif leading-relaxed">
               {loadingProphecy ? "Channeling the Great Void..." : `"${prophecy}"`}
             </p>
           </div>
        </div>
      </div>
    </div>
  );
};

const AttributeBar = ({ icon, color, fill, label, value }: any) => {
  const level = Math.floor(value / 100) + 1;
  const progress = value % 100;
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <div className={`flex items-center gap-2 ${color}`}>
          <span className="material-symbols-outlined font-bold text-sm">{icon}</span>
          <span className="font-bold text-xs uppercase tracking-wider">{label}</span>
        </div>
        <span className="text-white font-bold text-xs uppercase font-pixel text-[8px]">Sub-Lv.{level}</span>
      </div>
      <div className="h-4 w-full bg-black/40 rounded-none border-2 border-white/5 overflow-hidden shadow-inner">
        <div className={`h-full ${fill} transition-all duration-700`} style={{ width: `${progress}%` }}></div>
      </div>
      <div className="mt-1 flex justify-between text-[8px] font-pixel text-gray-500 uppercase tracking-tighter">
         <span>Next Stage Progress</span>
         <span className="tabular-nums">{progress}/100</span>
      </div>
    </div>
  );
};

const ActionCard = ({ icon, label, onClick }: any) => (
  <div onClick={onClick} className="aspect-square bg-rpg-deep-slate rounded border-4 border-rpg-slate hover:border-primary transition-all cursor-pointer flex flex-col items-center justify-center gap-2 group p-2 shadow-pixel active:translate-y-1">
    <span className="material-symbols-outlined text-gray-500 group-hover:text-primary text-3xl group-hover:scale-110 transition-transform">{icon}</span>
    <span className="text-[8px] font-pixel text-gray-400 group-hover:text-white uppercase tracking-tighter">{label}</span>
  </div>
);

export default Hero;

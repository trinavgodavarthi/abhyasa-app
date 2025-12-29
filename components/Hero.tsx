
import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { CharacterClass } from '../types';
import { formatDistanceToNow, isPast, isToday, addDays } from 'date-fns';

interface HeroProps {
  onInventoryOpen?: () => void;
  onConfigOpen?: () => void;
  onTrophiesOpen?: () => void;
  onGuideOpen?: () => void;
}

const PROPHECIES = [
  "True strength is found in the repetition of small acts.",
  "The sharpest blade is forged in the hottest fire.",
  "A journey of a thousand leagues begins with a single step.",
  "Discipline is the bridge between goals and accomplishment.",
  "The stars favor those who master their own fate.",
  "Wisdom is knowing the path; character is walking it.",
  "Even the mightiest oak was once a vulnerable seed.",
  "Victory belongs to the most persevering.",
];

const Hero: React.FC<HeroProps> = ({ onInventoryOpen, onConfigOpen, onTrophiesOpen, onGuideOpen }) => {
  const { user, tasks, updateTaskTime } = useGame();
  const [prophecy, setProphecy] = useState<string>('');
  
  const [activeQuestId, setActiveQuestId] = useState<string>('');
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef<number | null>(null);

  const activeQuest = tasks.find(t => t.id === activeQuestId);
  const activeCategory = user?.categories.find(c => c.id === activeQuest?.category);
  const alignment = activeCategory?.alignment || 'FOC';

  // Find urgent quests (deadlines in the next 3 days or overdue)
  const impendingOmens = tasks
    .filter(t => !t.completed && t.deadline)
    .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())
    .slice(0, 3);

  useEffect(() => {
    if (user && !prophecy) {
      getRandomProphecy();
    }
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

  const getRandomProphecy = () => {
    const random = PROPHECIES[Math.floor(Math.random() * PROPHECIES.length)];
    setProphecy(random);
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
    <div className="flex flex-col gap-10 animate-in fade-in duration-500 max-w-6xl mx-auto">
      {/* Hero Profile Banner - Cinematic Header */}
      <div className="relative overflow-hidden bg-rpg-deep-slate border-4 border-primary/20 p-8 flex flex-col md:flex-row items-center gap-8 shadow-pixel-card">
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
          <div className="absolute -bottom-3 -right-3 bg-primary text-black font-pixel text-[10px] px-3 py-1.5 border-2 border-black shadow-pixel-card z-10 uppercase tracking-wide font-bold">
            LVL {user.level}
          </div>
        </div>

        <div className="flex-1 text-center md:text-left z-10">
          <h2 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tighter leading-none mb-4 italic">
            Hero {user.username}
          </h2>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-5">
            <span className="flex items-center gap-2 text-primary font-pixel text-[10px] uppercase bg-black/30 px-3 py-1.5 border border-primary/20 tracking-wide font-bold">
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
              <h3 className="font-pixel text-[12px] text-primary mb-3 uppercase flex items-center justify-center lg:justify-start gap-4 tracking-tight font-bold">
                 The Altar of Focus
                 {isTimerActive && !isPaused && <span className="animate-ping size-2 rounded-full bg-primary inline-block"></span>}
              </h3>
              <p className="text-gray-500 text-[8px] uppercase font-bold tracking-widest opacity-60 font-pixel">Sacrifice your distractions to the gods of industry</p>
            </div>

            <div className="flex-1 flex flex-col justify-center items-center py-6">
              {!isTimerActive ? (
                <div className="w-full max-w-sm space-y-8 animate-in fade-in duration-500">
                   <div className="space-y-4">
                     <label className="block text-[8px] font-pixel text-gray-500 uppercase ml-1 tracking-widest font-bold">Select Your Purpose</label>
                     <div className="relative">
                       <select
                        value={activeQuestId}
                        onChange={e => setActiveQuestId(e.target.value)}
                        className="w-full bg-black/60 border-2 border-primary/20 p-4 text-white text-[8px] font-bold outline-none uppercase cursor-pointer hover:border-primary/50 transition-colors duration-150 rounded-none appearance-none font-pixel"
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
                    className="w-full bg-primary text-black font-pixel text-[10px] py-4 px-8 border-b-8 border-r-8 border-[#b89a0a] hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed active:translate-y-2 active:translate-x-2 active:border-b-0 active:border-r-0 transition-colors duration-150 flex items-center justify-center gap-4 group uppercase tracking-wide font-bold"
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
                        <p className="text-[10px] font-pixel text-primary uppercase animate-pulse tracking-wide font-bold">Deep Concentration Active</p>
                        <span className="h-[1px] w-8 bg-primary/30"></span>
                      </div>
                      <p className="text-white font-black text-3xl uppercase tracking-tighter line-clamp-2 max-w-lg mx-auto leading-tight italic">{activeQuest?.title}</p>
                   </div>

                   <div className={`text-9xl font-ui font-black tracking-[0.2em] tabular-nums transition-all duration-700 ${isPaused ? 'text-gray-700' : 'text-primary drop-shadow-[0_0_20px_rgba(242,204,13,0.3)]'}`}>
                     {formatTime(elapsedSeconds)}
                   </div>

                   <div className="flex items-center gap-4 justify-center text-gray-500 font-pixel text-[8px] uppercase bg-black/20 py-3 max-w-xs mx-auto rounded border border-white/5 font-bold">
                     <span className={`material-symbols-outlined text-lg ${!isPaused ? 'animate-spin' : ''}`}>{isPaused ? 'timer_off' : 'sync'}</span>
                     {isPaused ? 'MEDITATION HALTED' : `ABSORBING ${alignment} ENERGY`}
                   </div>

                   <div className="grid grid-cols-2 gap-5 max-w-sm mx-auto">
                     <button
                      onClick={() => setIsPaused(!isPaused)}
                      className={`py-4 px-4 font-pixel text-[8px] border-b-8 border-r-8 transition-all duration-150 uppercase flex items-center justify-center gap-3 active:translate-y-2 active:translate-x-2 active:border-b-0 active:border-r-0 font-bold tracking-wide
                        ${isPaused ? 'bg-rpg-green text-black border-[#5a9440] hover:bg-[#8fd068]' : 'bg-yellow-700 text-white border-yellow-900 hover:bg-yellow-600'}`}
                     >
                       <span className="material-symbols-outlined text-lg">{isPaused ? 'play_arrow' : 'pause'}</span>
                       {isPaused ? 'Resume' : 'Pause'}
                     </button>

                     <button
                      onClick={handleFinishFocus}
                      className="py-4 px-4 bg-primary text-black font-pixel text-[8px] border-b-8 border-r-8 border-[#b89a0a] hover:bg-yellow-400 active:translate-y-2 active:translate-x-2 active:border-b-0 active:border-r-0 transition-colors duration-150 uppercase flex items-center justify-center gap-3 font-bold tracking-wide"
                     >
                       <span className="material-symbols-outlined text-lg">auto_fix</span>
                       Log Session
                     </button>

                     <button
                      onClick={handleDiscard}
                      className="col-span-2 py-4 px-8 bg-rpg-red text-white font-pixel text-[8px] border-b-8 border-r-8 border-[#8a4235] hover:bg-[#d47560] active:translate-y-2 active:translate-x-2 active:border-b-0 active:border-r-0 transition-colors duration-150 uppercase tracking-wide font-bold"
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
          {/* Impending Omens - Deadline Tracking */}
          <div className="bg-rpg-deep-slate border-4 border-rpg-slate p-8 shadow-pixel-card relative overflow-hidden">
             <div className="flex justify-between items-center mb-6 border-b-2 border-white/5 pb-4">
                <h3 className="font-pixel text-[10px] text-primary uppercase tracking-tight font-bold">Impending Omens</h3>
                <span className="material-symbols-outlined text-primary/40 text-sm">hourglass_empty</span>
             </div>

             <div className="space-y-4">
                {impendingOmens.length === 0 ? (
                  <div className="py-6 text-center opacity-30 italic text-[8px] font-pixel text-gray-500">
                    No dire prophecies recorded...
                  </div>
                ) : (
                  impendingOmens.map(omen => {
                    const isOverdue = isPast(new Date(omen.deadline!));
                    return (
                      <div key={omen.id} className={`p-4 border-2 flex items-center justify-between transition-all group hover:bg-black/20 ${isOverdue ? 'border-rpg-red/40 bg-rpg-red/5 animate-pulse' : 'border-white/5 bg-black/10'}`}>
                        <div className="min-w-0">
                          <p className={`text-[10px] font-black uppercase truncate italic ${isOverdue ? 'text-rpg-red' : 'text-white'}`}>{omen.title}</p>
                          <p className={`text-[7px] font-pixel mt-1 uppercase ${isOverdue ? 'text-rpg-red/60' : 'text-gray-500'}`}>
                            {isOverdue ? 'CURSED: EXPIRED' : `DUE: ${formatDistanceToNow(new Date(omen.deadline!))} left`}
                          </p>
                        </div>
                        <span className={`material-symbols-outlined text-lg ${isOverdue ? 'text-rpg-red' : 'text-primary/40'}`}>
                          {isOverdue ? 'skull' : 'event'}
                        </span>
                      </div>
                    );
                  })
                )}
             </div>
          </div>

          {/* Attributes Card */}
          <div className="bg-rpg-deep-slate border-4 border-rpg-slate p-8 shadow-pixel-card relative overflow-hidden">
            <span className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <span className="material-symbols-outlined text-8xl">stat_3</span>
            </span>
            <h3 className="font-pixel text-[10px] text-white mb-8 border-b-2 border-white/5 pb-4 uppercase tracking-tight font-bold">Heroic Attributes</h3>
            
            <div className="space-y-8">
              <AttributeRow icon="fitness_center" color="text-rpg-red" fill="bg-rpg-red" label="STR" value={user.stats.str} title="Physical Strength" />
              <AttributeRow icon="menu_book" color="text-blue-400" fill="bg-blue-400" label="INT" value={user.stats.int} title="Arcane Knowledge" />
              <AttributeRow icon="bolt" color="text-primary" fill="bg-primary" label="FOC" value={user.stats.foc} title="Spiritual Focus" />
            </div>

            <div className="mt-8 pt-6 border-t-2 border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-8 bg-primary/20 flex items-center justify-center text-primary border-2 border-primary/40 font-black text-xs">$</div>
                <div>
                   <p className="text-[7px] text-gray-500 font-black uppercase leading-none mb-1">Vault</p>
                   <p className="text-lg font-black text-primary leading-none tabular-nums tracking-tighter">{user.gold} GOLD</p>
                </div>
              </div>
              <button
                onClick={onInventoryOpen}
                className="text-[7px] font-pixel text-gray-500 hover:text-white uppercase underline underline-offset-4 transition-colors duration-150 tracking-widest opacity-80 font-bold"
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

          {/* Prophecy Scroll */}
          <div className="mt-auto bg-rpg-paper border-4 border-rpg-brown p-6 shadow-pixel-card relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
             <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/handmade-paper.png')]"></div>

             <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-rpg-brown text-xl animate-pulse">auto_awesome</span>
                    <span className="text-rpg-brown font-pixel text-[8px] uppercase font-bold tracking-widest">Today's Omen</span>
                  </div>
                  <button onClick={getRandomProphecy} className="text-rpg-brown/40 hover:text-rpg-brown transition-colors duration-150">
                    <span className="material-symbols-outlined text-base">refresh</span>
                  </button>
                </div>
                <p className="text-rpg-brown italic text-sm font-display leading-relaxed line-clamp-3 relative z-10">
                  {`"${prophecy}"`}
                </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatusBadge = ({ label, value, max, color }: any) => (
  <div className="bg-black/60 px-5 py-3 border-2 border-white/5 flex flex-col gap-2 w-40 shadow-inner">
    <div className="flex justify-between text-[7px] font-pixel">
      <span className="text-gray-500 uppercase tracking-widest opacity-80">{label}</span>
      <span className="text-white tabular-nums">{value}/{max}</span>
    </div>
    <div className="h-2 w-full bg-white/5 rounded-none overflow-hidden border border-black/40">
      <div className={`h-full ${color} transition-all duration-700 relative`} style={{ width: `${(value / max) * 100}%` }}>
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
        <div className={`flex items-center gap-2 ${color} transition-all duration-150 group-hover/row:translate-x-1`}>
          <span className="material-symbols-outlined text-lg font-black">{icon}</span>
          <div className="flex flex-col">
            <span className="text-[8px] font-black uppercase tracking-widest leading-none font-pixel">{label}</span>
            <span className="text-[6px] text-gray-500 uppercase font-bold leading-none mt-1 opacity-60 tracking-wider">{title}</span>
          </div>
        </div>
        <div className="text-right">
           <span className="text-white/80 font-pixel text-[7px] uppercase tracking-widest opacity-80">Rank {level}</span>
        </div>
      </div>
      <div className="h-3 w-full bg-black/60 rounded-none border-2 border-white/5 overflow-hidden shadow-inner flex p-[1px]">
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
    className="aspect-square bg-rpg-deep-slate border-4 border-rpg-slate hover:border-primary hover:bg-black/40 transition-all duration-300 flex flex-col items-center justify-center gap-2 group shadow-pixel active:translate-y-1 overflow-hidden relative min-h-[44px]"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    <span className="material-symbols-outlined text-gray-500 group-hover:text-primary text-2xl transition-all duration-150 relative z-10">{icon}</span>
    <span className="text-[7px] font-pixel text-gray-600 group-hover:text-white uppercase tracking-widest relative z-10 opacity-80">{label}</span>
  </button>
);

export default Hero;

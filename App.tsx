
import React, { useState, useEffect } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import Login from './components/Login';
import Hero from './components/Hero';
import Quests from './components/Quests';
import Habits from './components/Habits';
import Shop from './components/Shop';
import Inventory from './components/Inventory';
import Settings from './components/Settings';
import Trophies from './components/Trophies';
import SageGuide from './components/SageGuide';
import Goals from './components/Goals';
import Chronicler from './components/Chronicler';
import { useGameLogic } from './hooks/useGameLogic';

const MainAppContent = () => {
  const { user, loading } = useGame();
  const [activeTab, setActiveTab] = useState<'hero' | 'quests' | 'habits' | 'shop' | 'inventory' | 'settings' | 'trophies' | 'guide' | 'goals' | 'chronicler'>('hero');
  const [showCRT, setShowCRT] = useState(true);
  const { getRequiredXP } = useGameLogic();

  useEffect(() => {
    const savedCRT = localStorage.getItem('abhyasa_crt');
    if (savedCRT !== null) setShowCRT(savedCRT === 'true');
  }, []);

  useEffect(() => {
    localStorage.setItem('abhyasa_crt', String(showCRT));
    const overlay = document.querySelector('.crt-overlay');
    if (overlay) (overlay as HTMLElement).style.display = showCRT ? 'block' : 'none';
  }, [showCRT]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background-dark font-pixel text-primary gap-6 animate-pulse">
      <div className="size-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <p className="tracking-widest text-[10px]">PREPARING YOUR LEGEND...</p>
    </div>
  );

  if (!user) return <Login />;

  const reqXP = getRequiredXP(user.level);

  return (
    <div className="flex flex-col h-screen overflow-hidden selection:bg-primary selection:text-black">
      {/* Top HUD - Advanced RPG Dashboard Header */}
      <header className="bg-black/80 border-b-4 border-rpg-deep-slate p-4 z-40 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-6">
          
          {/* Avatar & Class Info */}
          <div className="flex items-center gap-4 cursor-pointer group" onClick={() => setActiveTab('hero')}>
             <div className="relative">
               <div className="size-14 rounded-none bg-rpg-deep-slate border-4 border-primary/40 group-hover:border-primary pixelated overflow-hidden transition-all shadow-[0_0_15px_rgba(242,204,13,0.1)]">
                  <div className="w-full h-full bg-cover bg-center" 
                       style={{ backgroundImage: `url('https://picsum.photos/seed/${user.username}/100')` }}>
                  </div>
               </div>
               <div className="absolute -bottom-2 -right-2 bg-primary text-black font-pixel text-[6px] px-1 py-0.5 border border-black shadow-sm">
                 LVL {user.level}
               </div>
             </div>
             <div className="hidden sm:block">
               <p className="text-[10px] font-black text-white uppercase leading-none mb-1 tracking-tighter">{user.username}</p>
               <p className="text-[7px] font-pixel text-primary uppercase opacity-70">{user.characterClass || 'Paladin'}</p>
             </div>
          </div>

          {/* Vitals & Progress Section */}
          <div className="flex-1 max-w-sm space-y-3">
            <div className="relative">
              <div className="flex justify-between text-[7px] font-pixel px-1 text-rpg-red/80 mb-1 uppercase">
                <span>Vitals</span>
                <span>{user.hp}%</span>
              </div>
              <div className="h-2 w-full bg-black/60 rounded-none border border-white/5 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-rpg-red/60 to-rpg-red transition-all duration-700 shadow-[0_0_8px_rgba(194,94,73,0.4)]" style={{ width: `${user.hp}%` }}></div>
              </div>
            </div>
            <div className="relative">
              <div className="flex justify-between text-[7px] font-pixel px-1 text-rpg-green/80 mb-1 uppercase">
                <span>Progress</span>
                <span>{user.xp} / {reqXP}</span>
              </div>
              <div className="h-2 w-full bg-black/60 rounded-none border border-white/5 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-rpg-green/60 to-rpg-green transition-all duration-700 shadow-[0_0_8px_rgba(122,196,86,0.4)]" style={{ width: `${(user.xp / reqXP) * 100}%` }}></div>
              </div>
            </div>
          </div>

          {/* Currencies & Quick Stats */}
          <div className="flex items-center gap-4">
            <div className="bg-black/40 px-3 py-2 border-2 border-orange-500/20 flex items-center gap-3 group transition-all hover:border-orange-500 hover:shadow-[0_0_10px_rgba(249,115,22,0.2)]">
              <span className="material-symbols-outlined text-orange-500 text-lg animate-pulse">local_fire_department</span>
              <div>
                <p className="text-[6px] text-gray-500 font-pixel uppercase leading-none mb-1">STREAK</p>
                <p className="font-pixel text-[10px] text-orange-500 leading-none">{user.dailyStreak || 0}</p>
              </div>
            </div>
            
            <div className="bg-black/40 px-3 py-2 border-2 border-primary/20 flex items-center gap-3 transition-all hover:border-primary">
              <span className="material-symbols-outlined text-primary text-lg">payments</span>
              <div>
                <p className="text-[6px] text-gray-500 font-pixel uppercase leading-none mb-1">GOLD</p>
                <p className="font-pixel text-[10px] text-primary leading-none tabular-nums">{user.gold}</p>
              </div>
            </div>

            <button onClick={() => setActiveTab('settings')} className="size-10 flex items-center justify-center hover:bg-white/5 text-gray-500 hover:text-primary transition-all rounded">
              <span className="material-symbols-outlined text-2xl">tune</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-10 bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')] bg-background-dark/95">
        <div className="max-w-6xl mx-auto pb-24">
          {activeTab === 'hero' && <Hero 
            onInventoryOpen={() => setActiveTab('inventory')} 
            onConfigOpen={() => setActiveTab('settings')}
            onTrophiesOpen={() => setActiveTab('trophies')}
            onGuideOpen={() => setActiveTab('guide')}
          />}
          {activeTab === 'quests' && <Quests />}
          {activeTab === 'habits' && <Habits />}
          {activeTab === 'shop' && <Shop />}
          {activeTab === 'inventory' && <Inventory />}
          {activeTab === 'settings' && <Settings showCRT={showCRT} onToggleCRT={() => setShowCRT(!showCRT)} />}
          {activeTab === 'trophies' && <Trophies />}
          {activeTab === 'guide' && <SageGuide />}
          {activeTab === 'goals' && <Goals />}
          {activeTab === 'chronicler' && <Chronicler />}
        </div>
      </main>

      {/* Navigation Footer - Solid RPG Panel */}
      <nav className="bg-rpg-deep-slate border-t-4 border-black p-3 z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        <div className="max-w-4xl mx-auto flex justify-around sm:gap-4 overflow-x-auto no-scrollbar">
          <NavBtn active={activeTab === 'hero'} onClick={() => setActiveTab('hero')} icon="shield_person" label="Hero" />
          <NavBtn active={activeTab === 'chronicler'} onClick={() => setActiveTab('chronicler')} icon="history_edu" label="Stats" />
          <NavBtn active={activeTab === 'goals'} onClick={() => setActiveTab('goals')} icon="architecture" label="Legacy" />
          <NavBtn active={activeTab === 'habits'} onClick={() => setActiveTab('habits')} icon="fitness_center" label="Habits" />
          <NavBtn active={activeTab === 'quests'} onClick={() => setActiveTab('quests')} icon="swords" label="Quests" />
          <NavBtn active={activeTab === 'shop'} onClick={() => setActiveTab('shop')} icon="storefront" label="Shop" />
        </div>
      </nav>
    </div>
  );
};

const NavBtn = ({ active, onClick, icon, label }: any) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1.5 p-2 px-3 sm:px-6 transition-all duration-300 rounded-lg group min-w-[60px]
      ${active ? 'text-primary scale-105 sm:scale-110 bg-black/20' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
  >
    <span className={`material-symbols-outlined text-xl sm:text-2xl transition-transform ${active ? 'fill-1' : 'group-hover:scale-110'}`}>{icon}</span>
    <span className={`text-[7px] sm:text-[8px] font-pixel uppercase tracking-widest ${active ? 'opacity-100' : 'opacity-40'}`}>{label}</span>
  </button>
);

const App = () => (
  <GameProvider>
    <MainAppContent />
  </GameProvider>
);

export default App;

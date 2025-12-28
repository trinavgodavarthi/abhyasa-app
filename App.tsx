
import React, { useState, useEffect } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import Login from './components/Login';
import Hero from './components/Hero';
import Quests from './components/Quests';
import Habits from './components/Habits';
import Shop from './components/Shop';
import Inventory from './components/Inventory';
import Settings from './components/Settings';
import { useGameLogic } from './hooks/useGameLogic';

const MainAppContent = () => {
  const { user, loading, logout } = useGame();
  const [activeTab, setActiveTab] = useState<'hero' | 'quests' | 'habits' | 'shop' | 'inventory' | 'settings'>('hero');
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
    <div className="flex items-center justify-center min-h-screen font-pixel text-primary animate-pulse">
      LOADING SESSION...
    </div>
  );

  if (!user) return <Login />;

  const reqXP = getRequiredXP(user.level);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Top HUD */}
      <header className="bg-black/60 border-b-4 border-rpg-deep-slate p-4 z-40">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
             <div className="size-12 rounded bg-rpg-slate border-2 border-white/20 pixelated overflow-hidden" 
                  style={{ backgroundImage: `url('https://picsum.photos/seed/${user.username}/100')`, backgroundSize: 'cover' }}>
             </div>
             <div>
               <h1 className="font-pixel text-xs tracking-wider uppercase text-white">{user.username}</h1>
               <p className="text-[10px] font-bold text-gray-400 uppercase">Lvl {user.level} {user.characterClass || 'Paladin'}</p>
             </div>
          </div>

          <div className="flex-1 max-w-md space-y-2">
            <div className="group">
              <div className="flex justify-between text-[10px] font-pixel px-1 text-rpg-red">
                <span>HP</span>
                <span>{user.hp}/100</span>
              </div>
              <div className="h-2 w-full bg-red-900/30 rounded-none border border-black overflow-hidden">
                <div className="h-full bg-rpg-red transition-all duration-500" style={{ width: `${user.hp}%` }}></div>
              </div>
            </div>
            <div className="group">
              <div className="flex justify-between text-[10px] font-pixel px-1 text-rpg-green">
                <span>XP</span>
                <span>{user.xp}/{reqXP}</span>
              </div>
              <div className="h-2 w-full bg-green-900/30 rounded-none border border-black overflow-hidden">
                <div className="h-full bg-rpg-green transition-all duration-500" style={{ width: `${(user.xp / reqXP) * 100}%` }}></div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-black/40 px-3 py-1 rounded border-2 border-primary/40 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-sm">monetization_on</span>
              <span className="font-pixel text-xs text-primary">{user.gold} G</span>
            </div>
            <button onClick={() => setActiveTab('settings')} className="p-2 hover:bg-white/10 text-gray-500 hover:text-white rounded transition-colors">
              <span className="material-symbols-outlined">settings</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-8 bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')]">
        <div className="max-w-6xl mx-auto">
          {activeTab === 'hero' && <Hero onInventoryOpen={() => setActiveTab('inventory')} onConfigOpen={() => setActiveTab('settings')} />}
          {activeTab === 'quests' && <Quests />}
          {activeTab === 'habits' && <Habits />}
          {activeTab === 'shop' && <Shop />}
          {activeTab === 'inventory' && <Inventory />}
          {activeTab === 'settings' && <Settings showCRT={showCRT} onToggleCRT={() => setShowCRT(!showCRT)} />}
        </div>
      </main>

      {/* Navigation Footer */}
      <nav className="bg-rpg-deep-slate border-t-4 border-black p-2 z-50">
        <div className="max-w-xl mx-auto flex justify-around">
          <NavBtn active={activeTab === 'hero'} onClick={() => setActiveTab('hero')} icon="shield_person" label="Hero" />
          <NavBtn active={activeTab === 'quests'} onClick={() => setActiveTab('quests')} icon="swords" label="Quests" />
          <NavBtn active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')} icon="backpack" label="Items" />
          <NavBtn active={activeTab === 'habits'} onClick={() => setActiveTab('habits'} icon="history_edu" label="Habits" />
          <NavBtn active={activeTab === 'shop'} onClick={() => setActiveTab('shop')} icon="storefront" label="Shop" />
        </div>
      </nav>
    </div>
  );
};

const NavBtn = ({ active, onClick, icon, label }: any) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1 p-2 transition-all ${active ? 'text-primary scale-110' : 'text-gray-500 hover:text-white'}`}
  >
    <span className="material-symbols-outlined text-2xl">{icon}</span>
    <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
  </button>
);

const App = () => (
  <GameProvider>
    <MainAppContent />
  </GameProvider>
);

export default App;

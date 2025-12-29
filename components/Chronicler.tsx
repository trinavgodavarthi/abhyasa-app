
import React, { useState, useEffect, useMemo } from 'react';
import { useGame } from '../context/GameContext';
import { useGameLogic } from '../hooks/useGameLogic';
import { format } from 'date-fns';

const Chronicler: React.FC = () => {
  const { user, tasks } = useGame();
  const { getRequiredXP } = useGameLogic();
  const [showRanks, setShowRanks] = useState(false);
  
  const sageCounsel = useMemo(() => {
    if (!user) return "";
    const { str, int, foc } = user.stats;
    if (str <= int && str <= foc) return "The path of the warrior requires more than just thoughts; it requires action. Steel thy sinews, hero.";
    if (int <= str && int <= foc) return "A blade is sharp, but a mind is sharper. Neglect not the scrolls of knowledge that wait in the shadows.";
    return "True mastery comes not from strength or wit alone, but from the unwavering focus of the soul. Calm thy spirit.";
  }, [user?.stats]);

  const history = useMemo(() => {
    return tasks
      .filter(t => t.completed && t.completedAt)
      .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())
      .slice(0, 10);
  }, [tasks]);

  const levelMilestones = useMemo(() => {
    const list = [];
    for (let i = 1; i <= 50; i++) {
      let title = "Novice";
      if (i >= 5) title = "Initiate";
      if (i >= 10) title = "Apprentice";
      if (i >= 15) title = "Squire";
      if (i >= 20) title = "Knight";
      if (i >= 30) title = "Champion";
      if (i >= 40) title = "Grandmaster";
      if (i >= 50) title = "Legend";
      
      list.push({
        lvl: i,
        title,
        xp: getRequiredXP(i)
      });
    }
    return list;
  }, [getRequiredXP]);

  if (!user) return null;

  const { str, int, foc } = user.stats;
  const maxStat = Math.max(str, int, foc, 1);
  
  // Simple Radar Chart Calculation
  const size = 300;
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.4;

  const getPoint = (angle: number, value: number) => {
    const val = (value / maxStat) * r;
    const x = cx + val * Math.cos(angle);
    const y = cy + val * Math.sin(angle);
    return `${x},${y}`;
  };

  // Angles: STR at 270 (-90), INT at 30, FOC at 150
  const strAngle = -Math.PI / 2;
  const intAngle = Math.PI / 6;
  const focAngle = (5 * Math.PI) / 6;

  const points = [
    getPoint(strAngle, str),
    getPoint(intAngle, int),
    getPoint(focAngle, foc)
  ].join(' ');

  const gridPoints = (factor: number) => {
    return [
      getPoint(strAngle, maxStat * factor),
      getPoint(intAngle, maxStat * factor),
      getPoint(focAngle, maxStat * factor)
    ].join(' ');
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20">
      <div className="text-center mb-4">
        <h2 className="font-pixel text-primary text-2xl tracking-tighter mb-2 uppercase italic">The Chronicler's Tome</h2>
        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.3em] opacity-60">Thy growth, etched in the annals of time</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Attribute Balance Radar */}
        <div className="lg:col-span-6 bg-rpg-deep-slate border-4 border-rpg-slate p-8 shadow-pixel relative flex flex-col items-center">
          <div className="w-full flex justify-between items-center mb-8 border-b-2 border-white/5 pb-4">
            <h3 className="font-pixel text-[10px] text-white uppercase tracking-tighter">Attribute Prowess Radar</h3>
            <button 
              onClick={() => setShowRanks(true)}
              className="text-primary font-pixel text-[8px] hover:underline underline-offset-4"
            >
              HALL OF RANKS
            </button>
          </div>
          
          <div className="relative">
            <svg width={size} height={size} className="overflow-visible">
              {/* Grid Background */}
              <polygon points={gridPoints(1)} className="fill-none stroke-white/10 stroke-1" />
              <polygon points={gridPoints(0.66)} className="fill-none stroke-white/5 stroke-1" />
              <polygon points={gridPoints(0.33)} className="fill-none stroke-white/5 stroke-1" />
              
              {/* Axes */}
              <line x1={cx} y1={cy} x2={cx} y2={cy - r} className="stroke-white/10 stroke-1" />
              <line x1={cx} y1={cy} x2={cx + r * Math.cos(intAngle)} y2={cy + r * Math.sin(intAngle)} className="stroke-white/10 stroke-1" />
              <line x1={cx} y1={cy} x2={cx + r * Math.cos(focAngle)} y2={cy + r * Math.sin(focAngle)} className="stroke-white/10 stroke-1" />

              {/* Data Shape */}
              <polygon points={points} className="fill-primary/20 stroke-primary stroke-2" />
              
              {/* Points */}
              <circle cx={cx} cy={cy + (str / maxStat) * r * Math.sin(strAngle)} r="4" className="fill-rpg-red shadow-lg" />
              <circle cx={cx + (int / maxStat) * r * Math.cos(intAngle)} cy={cy + (int / maxStat) * r * Math.sin(intAngle)} r="4" className="fill-blue-400 shadow-lg" />
              <circle cx={cx + (foc / maxStat) * r * Math.cos(focAngle)} cy={cy + (foc / maxStat) * r * Math.sin(focAngle)} r="4" className="fill-primary shadow-lg" />
            </svg>

            {/* Labels */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-6 text-center">
              <span className="text-rpg-red font-pixel text-[8px] block">STR</span>
              <span className="text-white font-bold text-xs">{str}</span>
            </div>
            <div className="absolute bottom-10 -right-8 text-right">
              <span className="text-blue-400 font-pixel text-[8px] block">INT</span>
              <span className="text-white font-bold text-xs">{int}</span>
            </div>
            <div className="absolute bottom-10 -left-8 text-left">
              <span className="text-primary font-pixel text-[8px] block">FOC</span>
              <span className="text-white font-bold text-xs">{foc}</span>
            </div>
          </div>

          <div className="mt-12 w-full space-y-4">
             <div className="p-4 bg-black/40 border border-white/5 rounded text-[10px] text-gray-400 italic leading-relaxed">
               "Behold the shape of thy spirit. A balanced triangle is the mark of a Master; an elongated spike, the mark of a specialist."
             </div>
          </div>
        </div>

        {/* The Sage's Counsel & History */}
        <div className="lg:col-span-6 flex flex-col gap-10">
          <div className="bg-rpg-paper border-4 border-[#3d2b1f] p-8 shadow-xl relative overflow-hidden flex-1">
            <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/handmade-paper.png')]"></div>
            <div className="relative z-10 text-[#3d2b1f]">
               <div className="flex items-center gap-3 mb-6">
                 <span className="material-symbols-outlined text-[#3d2b1f] text-2xl">psychology</span>
                 <h3 className="font-pixel text-[10px] uppercase font-black tracking-widest">Counsel of the Chronicler</h3>
               </div>
               
               <p className="italic text-lg font-serif leading-relaxed mb-6">
                 {sageCounsel}
               </p>

               <div className="flex items-center justify-between pt-6 border-t-2 border-[#3d2b1f]/10 mt-auto">
                 <span className="text-[7px] font-pixel text-[#3d2b1f]/40 uppercase">— Divine Guidance</span>
               </div>
            </div>
          </div>

          <div className="bg-rpg-deep-slate border-4 border-rpg-slate p-8 shadow-pixel">
            <h3 className="font-pixel text-[10px] text-white mb-6 uppercase tracking-tighter">Recent Accomplishments</h3>
            <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-4">
              {history.length === 0 && (
                <div className="text-center py-10 opacity-30 italic text-xs text-gray-500 uppercase">
                  No records yet found in the scroll...
                </div>
              )}
              {history.map(task => (
                <div key={task.id} className="flex justify-between items-center p-3 bg-black/20 border border-white/5 group hover:border-primary/20 transition-all">
                   <div className="min-w-0 flex-1">
                      <p className="text-white font-bold text-xs truncate uppercase italic">{task.title}</p>
                      <p className="text-[7px] font-pixel text-gray-500 uppercase mt-1">
                        {format(new Date(task.completedAt!), 'MMM dd, HH:mm')}
                      </p>
                   </div>
                   <div className="flex items-center gap-2">
                     <span className="text-rpg-green material-symbols-outlined text-xl">verified</span>
                   </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Hall of Ranks Modal */}
      {showRanks && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="bg-rpg-paper border-4 border-[#3d2b1f] p-10 w-full max-w-2xl relative shadow-2xl overflow-hidden max-h-[80vh] flex flex-col">
            <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/handmade-paper.png')]"></div>
            
            <div className="relative z-10 flex justify-between items-center mb-8 border-b-4 border-[#3d2b1f]/20 pb-4">
              <h2 className="font-pixel text-[14px] text-[#3d2b1f] uppercase tracking-tighter">Hall of Heroic Ranks</h2>
              <button onClick={() => setShowRanks(false)} className="text-[#3d2b1f] hover:scale-110 transition-transform">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="relative z-10 overflow-y-auto custom-scrollbar flex-1 pr-4">
              <div className="space-y-1">
                <div className="grid grid-cols-4 text-[8px] font-pixel text-[#3d2b1f]/40 uppercase mb-4 px-4">
                  <span>Level</span>
                  <span className="col-span-2">Divine Title</span>
                  <span className="text-right">Req. XP</span>
                </div>
                {levelMilestones.map(m => (
                  <div 
                    key={m.lvl} 
                    className={`grid grid-cols-4 items-center p-4 border-b border-[#3d2b1f]/5 text-[#3d2b1f] transition-all
                      ${user.level === m.lvl ? 'bg-[#3d2b1f]/10 font-black' : ''}
                      ${user.level > m.lvl ? 'opacity-40' : ''}`}
                  >
                    <span className="font-pixel text-[10px]">Lvl {m.lvl}</span>
                    <span className="col-span-2 font-black text-xs italic tracking-tight uppercase">{m.title}</span>
                    <span className="text-right tabular-nums text-[9px] font-pixel">{m.xp}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative z-10 mt-8 pt-6 border-t-2 border-[#3d2b1f]/10 text-center">
              <p className="text-[7px] font-pixel text-[#3d2b1f]/40 uppercase">"Each level is a notch on the blade of destiny."</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chronicler;

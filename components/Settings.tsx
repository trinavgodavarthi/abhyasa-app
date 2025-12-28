
import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { CharacterClass, AttributeType } from '../types';

interface SettingsProps {
  showCRT: boolean;
  onToggleCRT: () => void;
}

const CLASSES: CharacterClass[] = ['Paladin', 'Warrior', 'Mage', 'Rogue', 'Bard'];
const ALIGNMENTS: AttributeType[] = ['STR', 'INT', 'FOC'];
const AVAILABLE_ICONS = ['swords', 'fitness_center', 'menu_book', 'home', 'palette', 'code', 'psychology', 'star', 'pets', 'local_fire_department', 'school', 'work', 'rocket_launch'];
const AVAILABLE_COLORS = [
  { label: 'Blue', class: 'bg-blue-600' },
  { label: 'Green', class: 'bg-green-600' },
  { label: 'Purple', class: 'bg-purple-600' },
  { label: 'Orange', class: 'bg-orange-600' },
  { label: 'Red', class: 'bg-red-600' },
  { label: 'Pink', class: 'bg-pink-600' },
  { label: 'Cyan', class: 'bg-cyan-600' },
  { label: 'Indigo', class: 'bg-indigo-600' },
];

const Settings: React.FC<SettingsProps> = ({ showCRT, onToggleCRT }) => {
  const { user, updateUserClass, resetProgress, logout, addCategory, deleteCategory } = useGame();
  const [confirmReset, setConfirmReset] = useState(false);
  
  const [newCatLabel, setNewCatLabel] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('star');
  const [newCatColor, setNewCatColor] = useState('bg-blue-600');
  const [newCatAlignment, setNewCatAlignment] = useState<AttributeType>('FOC');

  if (!user) return null;

  const handleClassSelect = (c: CharacterClass) => {
    updateUserClass(c);
  };

  const handleReset = () => {
    if (confirmReset) {
      resetProgress();
      setConfirmReset(false);
    } else {
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 3000);
    }
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatLabel.trim()) return;
    addCategory({ label: newCatLabel, icon: newCatIcon, color: newCatColor, alignment: newCatAlignment });
    setNewCatLabel('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-500 pb-20">
      <div className="text-center">
        <h2 className="font-pixel text-primary text-2xl tracking-tighter mb-2 uppercase">System Configuration</h2>
        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.3em]">Alter your path or the reality itself</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="bg-rpg-deep-slate border-4 border-rpg-slate p-8 shadow-pixel-card">
           <h3 className="font-pixel text-xs text-white mb-8 border-b-2 border-white/10 pb-4 uppercase">Character Identity</h3>
           
           <div className="space-y-6">
              <div>
                <label className="text-rpg-sand text-[10px] font-pixel block mb-4 uppercase">Selected Class</label>
                <div className="flex flex-wrap gap-2">
                   {CLASSES.map(c => (
                     <button 
                       key={c}
                       onClick={() => handleClassSelect(c)}
                       className={`px-4 py-2 border-2 transition-all font-pixel text-[8px] uppercase tracking-tighter
                        ${user.characterClass === c ? 'bg-primary border-white text-black shadow-lg' : 'bg-black/40 border-rpg-slate text-gray-500 hover:text-white'}`}
                     >
                       {c}
                     </button>
                   ))}
                </div>
              </div>

              <div className="pt-4">
                <label className="text-rpg-sand text-[10px] font-pixel block mb-2 uppercase">Display Name</label>
                <div className="bg-black/40 border-2 border-rpg-slate p-4 text-white font-bold opacity-50 cursor-not-allowed">
                  {user.username}
                  <span className="text-[8px] ml-2 text-gray-500">(LOCKED)</span>
                </div>
              </div>
           </div>
        </section>

        <section className="bg-rpg-deep-slate border-4 border-rpg-slate p-8 shadow-pixel-card">
           <h3 className="font-pixel text-xs text-white mb-8 border-b-2 border-white/10 pb-4 uppercase">Reality Engine</h3>
           
           <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-white font-bold text-sm">CRT Scanlines</h4>
                  <p className="text-gray-500 text-[10px] uppercase">Toggle retro visual overlay</p>
                </div>
                <button 
                  onClick={onToggleCRT}
                  className={`size-12 border-4 transition-all flex items-center justify-center
                    ${showCRT ? 'bg-rpg-green border-[#4e8235] text-black' : 'bg-black/40 border-rpg-slate text-gray-500'}`}
                >
                  <span className="material-symbols-outlined font-black">{showCRT ? 'check' : 'close'}</span>
                </button>
              </div>

              <div className="pt-8 border-t-2 border-white/5 space-y-4">
                <button 
                  onClick={logout}
                  className="w-full py-4 bg-gray-700 text-white font-pixel text-[10px] border-b-4 border-black hover:bg-gray-600 transition-colors uppercase"
                >
                  Terminate Session
                </button>

                <button 
                  onClick={handleReset}
                  className={`w-full py-4 font-pixel text-[10px] border-b-4 border-black transition-all uppercase
                    ${confirmReset ? 'bg-rpg-red text-white animate-pulse' : 'bg-black/40 text-rpg-red hover:bg-rpg-red/10'}`}
                >
                  {confirmReset ? 'CONFIRM PROGRESS WIPEOUT?' : 'Reset All Progress'}
                </button>
              </div>
           </div>
        </section>

        <section className="lg:col-span-2 bg-rpg-deep-slate border-4 border-rpg-slate p-8 shadow-pixel-card">
           <h3 className="font-pixel text-xs text-white mb-8 border-b-2 border-white/10 pb-4 uppercase">Quest Categories</h3>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <h4 className="text-primary text-[10px] font-pixel mb-4 uppercase">Forge New Category</h4>
                <form onSubmit={handleAddCategory} className="space-y-4">
                  <input 
                    required
                    value={newCatLabel}
                    onChange={e => setNewCatLabel(e.target.value)}
                    className="w-full bg-black/40 border-2 border-rpg-slate text-white p-3 font-display focus:border-primary outline-none" 
                    placeholder="CATEGORY NAME..."
                  />
                  
                  <div>
                    <label className="text-gray-400 text-[8px] font-pixel block mb-2">ATTRIBUTE ALIGNMENT</label>
                    <div className="grid grid-cols-3 gap-2">
                       {ALIGNMENTS.map(align => (
                         <button 
                           key={align}
                           type="button"
                           onClick={() => setNewCatAlignment(align)}
                           className={`p-2 border-2 font-pixel text-[8px] transition-all ${newCatAlignment === align ? 'border-primary bg-primary text-black' : 'border-rpg-slate text-gray-500'}`}
                         >
                           {align}
                         </button>
                       ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-gray-400 text-[8px] font-pixel block mb-2">PICK ICON</label>
                    <div className="flex flex-wrap gap-2">
                       {AVAILABLE_ICONS.map(icon => (
                         <button 
                           key={icon}
                           type="button"
                           onClick={() => setNewCatIcon(icon)}
                           className={`p-2 border-2 transition-all ${newCatIcon === icon ? 'border-primary bg-primary/20 text-primary' : 'border-rpg-slate text-gray-500'}`}
                         >
                           <span className="material-symbols-outlined text-sm">{icon}</span>
                         </button>
                       ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-gray-400 text-[8px] font-pixel block mb-2">PICK COLOR</label>
                    <div className="flex flex-wrap gap-2">
                       {AVAILABLE_COLORS.map(color => (
                         <button 
                           key={color.class}
                           type="button"
                           onClick={() => setNewCatColor(color.class)}
                           className={`size-6 border-2 transition-all ${color.class} ${newCatColor === color.class ? 'border-white scale-110' : 'border-black/40 opacity-60'}`}
                         />
                       ))}
                    </div>
                  </div>

                  <button className="w-full bg-primary text-black font-pixel text-[8px] py-3 border-b-4 border-[#7a7a35] uppercase">
                    Add Category
                  </button>
                </form>
              </div>

              <div className="space-y-4">
                <h4 className="text-primary text-[10px] font-pixel mb-4 uppercase">Existing Categories</h4>
                <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                   {user.categories.map(cat => (
                     <div key={cat.id} className="flex items-center justify-between bg-black/40 p-3 rounded border-2 border-white/5 group">
                        <div className="flex items-center gap-3">
                           <div className={`size-8 rounded flex items-center justify-center ${cat.color}`}>
                              <span className="material-symbols-outlined text-white text-sm">{cat.icon}</span>
                           </div>
                           <div>
                             <span className="text-white font-bold text-sm uppercase block leading-none mb-1">{cat.label}</span>
                             <span className="text-[8px] font-pixel text-primary uppercase">{cat.alignment || 'FOC'} ALIGNED</span>
                           </div>
                        </div>
                        <button 
                          onClick={() => deleteCategory(cat.id)}
                          className="text-gray-600 hover:text-rpg-red p-1 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                     </div>
                   ))}
                </div>
              </div>
           </div>
        </section>
      </div>
    </div>
  );
};

export default Settings;

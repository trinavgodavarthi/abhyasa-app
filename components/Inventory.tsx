
import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { InventoryItem } from '../types';
import { formatDistanceToNow } from 'date-fns';

const Inventory: React.FC = () => {
  const { user, useItem } = useGame();
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  if (!user) return null;

  const inventory = user.inventory || [];
  const gridSlots = Math.max(16, Math.ceil(inventory.length / 4) * 4);

  const handleUse = async () => {
    if (!selectedItem) return;
    await useItem(selectedItem.id);
    
    // Check if item still exists in inventory after use
    const updatedUser = user; // This is a bit tricky since state update is async
    // In a real app we'd find the item again from user.inventory
    setSelectedItem(null); 
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in slide-in-from-left-4 duration-500">
      {/* Grid Area */}
      <div className="lg:col-span-7">
        <div className="bg-rpg-deep-slate border-4 border-rpg-slate p-6 shadow-pixel-card">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-pixel text-primary text-lg uppercase tracking-tighter">Inventory</h2>
            <div className="text-[10px] text-gray-500 font-pixel uppercase">
              {inventory.length} / {gridSlots} SLOTS
            </div>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-4 gap-4">
            {[...Array(gridSlots)].map((_, i) => {
              const item = inventory[i];
              return (
                <div 
                  key={i} 
                  onClick={() => item && setSelectedItem(item)}
                  className={`aspect-square border-4 flex items-center justify-center relative transition-all cursor-pointer
                    ${item ? (selectedItem?.id === item.id ? 'border-primary bg-primary/10' : 'border-rpg-slate bg-black/40 hover:border-gray-400') : 'border-rpg-slate/20 bg-black/10 pointer-events-none'}`}
                >
                  {item && (
                    <>
                      <span className="material-symbols-outlined text-3xl text-primary">{item.icon}</span>
                      {item.quantity > 1 && (
                        <div className="absolute bottom-1 right-1 bg-black text-primary font-pixel text-[8px] px-1 rounded-sm border border-primary/30">
                          {item.quantity}
                        </div>
                      )}
                      {item.durability !== undefined && (
                        <div className="absolute top-1 left-1 flex gap-0.5">
                           {[...Array(3)].map((_, d) => (
                             <div key={d} className={`size-1 rounded-full ${d < (item.durability || 0) ? 'bg-rpg-green' : 'bg-black/40'}`}></div>
                           ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Details Area */}
      <div className="lg:col-span-5">
        <div className="bg-rpg-paper border-4 border-[#3d2b1f] p-8 rounded-sm relative h-full min-h-[400px] flex flex-col shadow-xl">
          <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/handmade-paper.png')]"></div>
          
          <div className="relative z-10 flex flex-col h-full">
            {!selectedItem ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center opacity-30">
                <span className="material-symbols-outlined text-6xl text-[#3d2b1f] mb-4">backpack</span>
                <p className="font-pixel text-[10px] text-[#3d2b1f] uppercase tracking-widest">Select an item to inspect</p>
              </div>
            ) : (
              <>
                <div className="mb-6 flex items-center gap-4">
                  <div className="size-16 bg-[#3d2b1f] flex items-center justify-center rounded shadow-inner">
                    <span className="material-symbols-outlined text-primary text-4xl">{selectedItem.icon}</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-[#3d2b1f] tracking-tight uppercase">{selectedItem.title}</h3>
                    <div className="flex gap-2 mt-1">
                      <div className="px-2 py-0.5 bg-[#3d2b1f]/10 text-[#3d2b1f] font-pixel text-[8px] uppercase">
                        {selectedItem.type}
                      </div>
                      {selectedItem.expiryDate && (
                        <div className="px-2 py-0.5 bg-rpg-red/10 text-rpg-red font-pixel text-[8px] uppercase">
                          Expires Soon
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex-1 bg-black/5 p-4 rounded border-2 border-[#3d2b1f]/10 mb-6">
                  <p className="text-[#3d2b1f] text-sm font-medium leading-relaxed italic mb-4">
                    "{selectedItem.description}"
                  </p>
                  
                  {selectedItem.durability !== undefined && (
                    <div className="pt-4 border-t border-[#3d2b1f]/10">
                      <p className="text-[#3d2b1f] text-[10px] font-bold uppercase mb-2">Item Condition</p>
                      <div className="h-2 w-full bg-[#3d2b1f]/10 rounded overflow-hidden">
                        <div 
                          className="h-full bg-rpg-green transition-all" 
                          style={{ width: `${(selectedItem.durability / 3) * 100}%` }}
                        ></div>
                      </div>
                      <p className="text-[#3d2b1f]/60 text-[8px] mt-1 uppercase">{selectedItem.durability} uses remaining in current stack</p>
                    </div>
                  )}

                  {selectedItem.expiryDate && (
                    <div className="mt-4 pt-4 border-t border-[#3d2b1f]/10 flex items-center gap-2">
                      <span className="material-symbols-outlined text-xs text-[#3d2b1f]/60">schedule</span>
                      <p className="text-[#3d2b1f]/60 text-[8px] uppercase font-bold">
                        Valid for {formatDistanceToNow(new Date(selectedItem.expiryDate))}
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <button 
                    onClick={handleUse}
                    className={`w-full py-4 font-pixel text-xs tracking-tighter border-b-4 border-r-4 transition-all
                      ${selectedItem.type === 'item' ? 'bg-primary text-black border-[#7a7a35] hover:bg-[#d4d468]' : 
                        selectedItem.type === 'buff' ? 'bg-rpg-green text-black border-[#4e8235] hover:bg-[#8ade64]' : 
                        'bg-blue-500 text-white border-[#2b4d8c] hover:bg-blue-400'}`}
                  >
                    {selectedItem.type === 'irl' ? 'REDEEM REWARD' : 'CONSUME ITEM'}
                  </button>
                  <p className="text-center text-[8px] font-pixel text-[#3d2b1f]/50 uppercase">
                    Quantity available: {selectedItem.quantity}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inventory;


import React from 'react';

const SageGuide: React.FC = () => {
  return (
    <div className="bg-rpg-paper border-4 border-[#3d2b1f] p-10 max-w-4xl mx-auto shadow-2xl relative overflow-hidden animate-in slide-in-from-bottom-8 duration-700">
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/handmade-paper.png')]"></div>
      
      <div className="relative z-10 text-[#3d2b1f]">
        <h1 className="text-4xl font-black text-center mb-10 tracking-tighter border-b-4 border-[#3d2b1f]/20 pb-6 uppercase">
          Tome of Knowledge
        </h1>

        <div className="space-y-12 font-serif text-lg leading-relaxed">
          <section>
            <h2 className="text-2xl font-black uppercase mb-4 flex items-center gap-3 border-b-2 border-[#3d2b1f]/10 pb-2">
              <span className="material-symbols-outlined">favorite</span>
              The Life Force (HP)
            </h2>
            <p>
              Your <strong>Health (HP)</strong> measures your consistency. Every traveler starts with <strong>100 HP</strong>. 
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-2">
              <li><strong>The Toll of Sloth:</strong> If you fail to visit the realm for more than 24 hours, you lose <strong>5 HP</strong> for every additional day missed.</li>
              <li><strong>Restoration:</strong> Heal your wounds by purchasing a <strong>Power Nap</strong> from the Shop (+20 HP) or maintaining a high streak of daily habits.</li>
              <li><strong>Mortality:</strong> If your HP reaches zero, you do not perish, but your spirit weakens. Seek rest immediately.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black uppercase mb-4 flex items-center gap-3 border-b-2 border-[#3d2b1f]/10 pb-2">
              <span className="material-symbols-outlined">trending_up</span>
              Ascension (XP & Levels)
            </h2>
            <p>
              <strong>Experience (XP)</strong> represents your growth. Accumulating enough XP triggers a <strong>Level Up</strong>, increasing your prestige.
            </p>
            <div className="bg-black/5 p-4 my-4 rounded">
              <p className="font-pixel text-[10px] mb-2 uppercase text-[#3d2b1f]/70">The Law of Progress (Formula):</p>
              <code className="text-sm font-bold">Next Level XP = 100 × 1.5^(Current Level - 1)</code>
            </div>
            <p><strong>Bounties:</strong></p>
            <ul className="list-disc ml-6 space-y-2">
              <li><strong>Easy Quests:</strong> +50 XP, +10 Gold</li>
              <li><strong>Medium Quests:</strong> +150 XP, +35 Gold</li>
              <li><strong>Hard Quests:</strong> +400 XP, +100 Gold</li>
              <li><strong>Habits:</strong> You earn <strong>20 XP × Current Streak</strong> for every training session.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black uppercase mb-4 flex items-center gap-3 border-b-2 border-[#3d2b1f]/10 pb-2">
              <span className="material-symbols-outlined">ac_unit</span>
              The Streak Freeze
            </h2>
            <p>
              Consistency is difficult, and even the greatest heroes occasionally falter. The <strong>Streak Freeze</strong> is a powerful artifact designed to protect your momentum.
            </p>
            <div className="bg-[#3d2b1f]/5 p-6 border-2 border-dashed border-[#3d2b1f]/20 rounded-lg mt-4">
              <h4 className="font-black uppercase mb-2 text-sm">How to Use:</h4>
              <ol className="list-decimal ml-6 space-y-2 text-base">
                <li>Acquire a <strong>Streak Freeze</strong> from the Merchant's Shop for 300 Gold.</li>
                <li>Navigate to your <strong>Inventory (Items)</strong> tab.</li>
                <li>Select the Freeze and click <strong>"Consume Item"</strong>.</li>
                <li><strong>The Effect:</strong> Consuming a Freeze adds a protective layer to your character. The next time you check in for a habit after missing a day, your streak will be <i>preserved</i> instead of resetting to 1.</li>
              </ol>
              <p className="mt-4 text-xs italic font-bold text-rpg-red uppercase">Note: A Freeze must be consumed BEFORE completing a habit that would otherwise reset due to a missed day.</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-black uppercase mb-4 flex items-center gap-3 border-b-2 border-[#3d2b1f]/10 pb-2">
              <span className="material-symbols-outlined">bolt</span>
              The Three Pillars (Stats)
            </h2>
            <p>
              Beyond your level, you possess three primary attributes that grow based on the nature of your work:
            </p>
            <ul className="list-none space-y-4 mt-4">
              <li className="flex gap-4">
                <span className="material-symbols-outlined text-rpg-red">fitness_center</span>
                <div><strong>Strength (STR):</strong> Earned from <i>Slaying</i> and <i>Training</i> quests. Represents physical discipline.</div>
              </li>
              <li className="flex gap-4">
                <span className="material-symbols-outlined text-blue-600">menu_book</span>
                <div><strong>Intellect (INT):</strong> Earned from <i>Research</i> and <i>Logic</i> quests. Represents mental sharpness.</div>
              </li>
              <li className="flex gap-4">
                <span className="material-symbols-outlined text-primary">bolt</span>
                <div><strong>Focus (FOC):</strong> Earned from <i>Life</i> quests and daily <i>Habit</i> streaks. Represents spiritual endurance.</div>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black uppercase mb-4 flex items-center gap-3 border-b-2 border-[#3d2b1f]/10 pb-2">
              <span className="material-symbols-outlined">auto_awesome</span>
              Core Functionality
            </h2>
            <p>
              <strong>Abhyasa</strong> is designed to gamify your life through three core cycles:
            </p>
            <ol className="list-decimal ml-6 space-y-4">
              <li><strong>The Quest Cycle:</strong> Define objectives in the Quest Log. Use the <strong>Focus Altar</strong> on the Hero page to commit deep work time toward specific missions.</li>
              <li><strong>The Training Cycle:</strong> Habits are recurring regimens. Set custom targets (e.g., 21 days or 100 days). Editing a regimen allows you to adjust your goals as you grow.</li>
              <li><strong>The Reward Cycle:</strong> Gold earned from work can be exchanged at the Merchant for either survival items (Potions) or real-world indulgences (guilt-free leisure).</li>
            </ol>
          </section>

          <section className="bg-black/5 p-6 border-l-8 border-[#3d2b1f] italic">
            <p>
              "The secret to mastering others is strength. The secret to mastering oneself is true power."
            </p>
            <p className="text-right mt-2 font-bold">— The Ancient Sage</p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t-4 border-[#3d2b1f]/20 text-center opacity-60">
          <p className="font-pixel text-[8px] uppercase">May your discipline be your shield</p>
        </div>
      </div>
    </div>
  );
};

export default SageGuide;

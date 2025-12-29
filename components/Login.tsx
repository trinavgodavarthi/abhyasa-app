
import React, { useState } from 'react';
import { useGame } from '../context/GameContext';

const Login: React.FC = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, signup } = useGame();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isSignup) { await signup(username, password); }
      else { await login(username, password); }
    } catch (err: any) {
      setError(err.message || 'The gateway is sealed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background-dark relative overflow-hidden">
      {/* Cinematic Background Elements */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')] opacity-30"></div>
      <div className="absolute -top-20 -left-20 size-80 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute -bottom-20 -right-20 size-80 bg-rpg-red/5 rounded-full blur-3xl animate-pulse delay-700"></div>

      <div className="w-full max-w-md bg-rpg-deep-slate border-4 border-rpg-slate shadow-pixel-card p-10 relative z-10 transition-all">
        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary"></div>
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary"></div>
        
        <div className="text-center mb-10">
          <div className="size-20 bg-black/60 mx-auto rounded-none mb-6 flex items-center justify-center border-4 border-primary shadow-[0_0_30px_rgba(242,204,13,0.1)] group">
            <span className="material-symbols-outlined text-primary font-black text-5xl group-hover:scale-110 transition-transform">swords</span>
          </div>
          <h1 className="font-pixel text-primary text-[12px] tracking-tight mb-3 uppercase drop-shadow-md italic font-bold">ABHYASA</h1>
          <p className="text-gray-500 text-[8px] font-pixel uppercase tracking-widest opacity-80 leading-relaxed font-bold">The Path to Self-Mastery</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-4">
            <div>
              <label className="block text-[8px] font-pixel text-gray-500 mb-2 uppercase tracking-widest font-bold">Identify Yourself</label>
              <input
                required
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full bg-black/60 border-2 border-rpg-slate text-white p-4 font-bold focus:border-primary outline-none transition-all placeholder:text-gray-700"
                placeholder="HERO NAME..."
              />
            </div>
            <div>
              <label className="block text-[8px] font-pixel text-gray-400 mb-2 uppercase tracking-widest font-bold">Access Key</label>
              <input
                required
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-black/60 border-2 border-rpg-slate text-white p-4 font-bold focus:border-primary outline-none transition-all placeholder:text-gray-700"
                placeholder="SECRET CODE..."
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rpg-red/10 border-2 border-rpg-red/30 text-rpg-red text-center text-[8px] font-pixel uppercase animate-bounce leading-relaxed font-bold">
              {error}
            </div>
          )}

          <button
            disabled={loading}
            className="w-full bg-primary hover:bg-yellow-400 text-black font-pixel text-[12px] py-6 px-12 border-b-8 border-r-8 border-[#b89a0a] active:border-b-0 active:border-r-0 active:translate-y-2 active:translate-x-2 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-tight font-bold"
          >
            {loading ? 'OPENING GATES...' : isSignup ? 'SIGN DECREE' : 'COMMENCE LEGEND'}
          </button>
        </form>

        <div className="mt-10 text-center border-t-2 border-white/5 pt-6">
          <button
            onClick={() => { setError(''); setIsSignup(!isSignup); }}
            className="text-[8px] font-pixel text-gray-500 hover:text-white transition-all uppercase tracking-widest underline underline-offset-8 decoration-primary/20 hover:decoration-primary font-bold"
          >
            {isSignup ? "RETURN TO ENTRY" : "NEW SOUL? SIGN UP"}
          </button>
        </div>
      </div>

      <div className="absolute bottom-8 left-0 right-0 text-center pointer-events-none opacity-20">
        <p className="text-[7px] font-pixel uppercase tracking-widest text-white opacity-80">Built for consistency • Born for glory</p>
      </div>
    </div>
  );
};

export default Login;

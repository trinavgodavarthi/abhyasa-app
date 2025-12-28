
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
      if (isSignup) {
        await signup(username, password);
      } else {
        await login(username, password);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#111722]">
      <div className="w-full max-w-md bg-rpg-deep-slate border-4 border-rpg-slate shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)] p-8">
        <div className="text-center mb-8">
          <div className="size-16 bg-primary mx-auto rounded mb-4 flex items-center justify-center border-2 border-white/20 shadow-pixel">
            <span className="material-symbols-outlined text-black font-black text-4xl">swords</span>
          </div>
          <h1 className="font-pixel text-primary text-xl tracking-tighter mb-2">ABHYASA</h1>
          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">The Path to Self-Mastery</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] font-pixel text-gray-400 mb-2 uppercase">Username</label>
            <input 
              required
              type="text" 
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full bg-black/40 border-2 border-rpg-slate text-white p-3 font-display focus:border-primary outline-none transition-colors" 
              placeholder="ENTER NAME..."
            />
          </div>
          <div>
            <label className="block text-[10px] font-pixel text-gray-400 mb-2 uppercase">Password</label>
            <input 
              required
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-black/40 border-2 border-rpg-slate text-white p-3 font-display focus:border-primary outline-none transition-colors" 
              placeholder="SECRET CODE..."
            />
          </div>

          {error && <p className="text-rpg-red text-center text-[10px] font-bold uppercase animate-pulse">{error}</p>}

          <button 
            disabled={loading}
            className="w-full bg-primary hover:bg-[#d4d468] text-black font-pixel text-xs py-4 border-b-4 border-r-4 border-[#7a7a35] active:border-0 active:translate-y-1 transition-all disabled:opacity-50"
          >
            {loading ? 'WAITING...' : isSignup ? 'SIGN UP' : 'START ADVENTURE'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={() => setIsSignup(!isSignup)} 
            className="text-[10px] font-pixel text-gray-500 hover:text-white transition-colors"
          >
            {isSignup ? "ALREADY HAVE AN ACCOUNT? LOGIN" : "NEW EXPLORER? SIGN UP"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;

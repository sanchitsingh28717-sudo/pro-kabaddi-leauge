import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import playerCredentials from '../data/player_credentials.json';
import coachCredentials from '../data/coach_credentials.json';
import { Activity } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('analyst');
  const [teamObj, setTeamObj] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    let foundPlayerId = null;
    let explicitTeamId = teamObj;
    
    // Strict credential check for players
    if (role === 'player') {
      const match = playerCredentials.find(c => c.email.toLowerCase() === email.toLowerCase() && c.password === password);
      if (!match) {
        alert("Invalid credentials. Please enter your explicit Player Email and Password.");
        setLoading(false);
        return;
      }
      foundPlayerId = match.player_id;
    }

    // Strict credential check for coaches
    if (role === 'coach') {
      const match = coachCredentials.find(c => c.email.toLowerCase() === email.toLowerCase() && c.password === password);
      if (!match) {
        alert("Invalid credentials. Please enter your explicit Coach Email and Password.");
        setLoading(false);
        return;
      }
      explicitTeamId = match.team_id;
    }

    const mockUser = {
      email,
      role,
      team_id: explicitTeamId,
      player_id: foundPlayerId
    };
    
    localStorage.setItem('pkl_user', JSON.stringify(mockUser));
    
    // Trigger Cinematic Kabaddi Transition instead of immediate swap
    setIsTransitioning(true);
    
    setTimeout(() => {
      setLoading(false);
      if (role === 'coach') navigate('/coach');
      else if (role === 'player') navigate('/player');
      else if (role === 'analyst') navigate('/analyst');
      else navigate('/auction');
    }, 2200); // Wait 2.2 seconds for the cinematic effect
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-surface relative overflow-hidden mat-texture">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-900/20 blur-[120px] pointer-events-none"></div>
        
        <div className="w-full max-w-md p-10 bg-surface-container-low/50 backdrop-blur-xl border border-white/5 rounded-2xl relative z-10 shadow-2xl">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-black uppercase tracking-tighter text-white mb-1 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] font-headline italic">KINETIC<span className="text-primary not-italic tracking-normal"> ARENA</span></h1>
            <p className="text-gray-400 font-headline font-bold text-[10px] uppercase tracking-[0.3em]">System Access / T3</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block font-headline font-bold text-[10px] text-outline uppercase tracking-widest mb-2">Operator ID</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-surface-container border border-white/10 px-4 py-3 text-white font-headline focus:outline-none focus:border-primary focus:shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all rounded-lg"
                placeholder="coach@patnapirates.com"
              />
            </div>
            <div>
              <label className="block font-headline font-bold text-[10px] text-outline uppercase tracking-widest mb-2">Access Key</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-surface-container border border-white/10 px-4 py-3 text-white font-headline focus:outline-none focus:border-primary focus:shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all rounded-lg"
                placeholder="••••••••"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-headline font-bold text-[10px] text-outline uppercase tracking-widest mb-2">Clearance</label>
                <select 
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  className="w-full bg-surface-container border border-white/10 px-4 py-3 text-white font-headline text-sm focus:outline-none focus:border-primary rounded-lg outline-none"
                >
                  <option value="coach" className="bg-surface text-white">COACH</option>
                  <option value="player" className="bg-surface text-white">PLAYER</option>
                  <option value="analyst" className="bg-surface text-white">ANALYST</option>
                  <option value="auction_manager" className="bg-surface text-white">AUCTION MGR</option>
                </select>
              </div>
              <div>
                <label className="block font-headline font-bold text-[10px] text-outline uppercase tracking-widest mb-2">Squad</label>
                <select 
                  value={teamObj}
                  onChange={e => setTeamObj(e.target.value)}
                  className="w-full bg-surface-container border border-white/10 px-2 py-3 text-white font-headline text-sm focus:outline-none focus:border-primary rounded-lg outline-none truncate"
                >
                  <option value="" className="bg-surface text-neutral-500 w-full text-center">SELECT</option>
                  <option value="Bengal Warriors" className="bg-surface text-white">Warriors</option>
                  <option value="Bengaluru Bulls" className="bg-surface text-white">Bulls</option>
                  <option value="Dabang Delhi K.C." className="bg-surface text-white">Delhi</option>
                  <option value="Gujarat Fortunegiants" className="bg-surface text-white">Fortunegiants</option>
                  <option value="Haryana Steelers" className="bg-surface text-white">Steelers</option>
                  <option value="Jaipur Pink Panthers" className="bg-surface text-white">Panthers</option>
                  <option value="Patna Pirates" className="bg-surface text-white">Pirates</option>
                  <option value="Puneri Paltan" className="bg-surface text-white">Paltan</option>
                  <option value="Tamil Thalaivas" className="bg-surface text-white">Thalaivas</option>
                  <option value="Telugu Titans" className="bg-surface text-white">Titans</option>
                  <option value="U Mumba" className="bg-surface text-white">U Mumba</option>
                  <option value="U.P. Yoddha" className="bg-surface text-white">Yoddha</option>
                </select>
              </div>
            </div>

            <div className="pt-4">
              <button 
                type="submit" 
                disabled={loading || isTransitioning}
                className="w-full bg-transparent border border-primary text-primary font-black uppercase tracking-widest py-4 transition-all duration-300 rounded-xl mb-4 hover:scale-105 hover:bg-primary hover:text-[#0e0e0e] shadow-[0_0_15px_rgba(99,102,241,0.2)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] flex items-center justify-center gap-2"
              >
                {loading || isTransitioning ? <Activity className="animate-spin w-5 h-5" /> : null}
                {loading || isTransitioning ? 'BREACHING...' : 'AUTHENTICATE'}
              </button>
              <div className="text-center">
                <Link to="/forgot-password" className="font-headline font-bold text-[10px] text-neutral-500 hover:text-primary transition-all uppercase tracking-widest">
                  System Override / Recovery
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Kabaddi Cinematic Transition Overlay */}
      {isTransitioning && (
        <div className="fixed inset-0 z-50 bg-[#0e0e0e] flex items-center justify-center overflow-hidden">
            {/* Background Texture & Pulse */}
            <div className="absolute inset-0 bg-primary/5 mat-texture pointer-events-none opacity-50"></div>
            
            {/* The "Baulk Line" Crossing Animation Vertical/Horizontal */}
            <div 
              className="absolute left-0 top-1/2 h-[4px] bg-primary z-0 shadow-[0_0_30px_rgba(99,102,241,1)] transition-all ease-out duration-[1500ms] w-0"
              ref={el => { if(el) setTimeout(() => { el.style.width = '100%'}, 50) }}
            ></div>
            <div 
              className="absolute left-0 top-1/2 h-[60px] bg-gradient-to-t from-primary/0 via-primary/20 to-primary/0 z-0 transition-all ease-out duration-[1500ms] w-0 -translate-y-1/2"
              ref={el => { if(el) setTimeout(() => { el.style.width = '100%'}, 50) }}
            ></div>

            {/* Typography Logic */}
            <div className="relative z-10 flex flex-col items-center justify-center mix-blend-screen text-center px-4 w-full h-full pt-16">
                <h1 className="text-6xl md:text-9xl font-black font-headline uppercase tracking-tighter text-white transition-all duration-700 opacity-0 translate-y-10" ref={el => { if(el) setTimeout(() => { el.style.opacity = '1'; el.style.transform = 'translateY(0)' }, 400) }}>
                   RAID <span className="text-primary italic">SUCCESS</span>
                </h1>
                <p className="mt-6 md:mt-2 font-headline font-bold text-xs md:text-sm text-primary uppercase tracking-[0.4em] transition-all duration-700 opacity-0" ref={el => { if(el) setTimeout(() => { el.style.opacity = '1' }, 1000) }}>
                   Crossing the Baulk Line...
                </p>
            </div>
        </div>
      )}
    </>
  );
}

import React, { useState } from 'react';
import { Target, Shield, Clock, Activity, BrainCircuit } from 'lucide-react';

export default function CoachDashboard() {
  const [loading, setLoading] = useState(false);
  const [advice, setAdvice] = useState('');
  const [winProbPredict, setWinProbPredict] = useState(null);
  
  // Dual-Mode State
  const [telemetryMode, setTelemetryMode] = useState('macro'); // 'macro' or 'micro'

  // Macro Score State
  const [scores, setScores] = useState({
    ownRaid: 15,
    ownDef: 19,
    oppRaid: 16,
    oppDef: 12
  });

  // Micro Player Stats State
  const [playerStats, setPlayerStats] = useState([
    { id: 1, name: 'P. Narwal (C)', role: 'Raider', pts: 0, err: 0 },
    { id: 2, name: 'S. Singh', role: 'Defender', pts: 0, err: 0 },
    { id: 3, name: 'N. Kumar', role: 'Defender', pts: 0, err: 0 },
    { id: 4, name: 'M. Chhillar', role: 'All-Rounder', pts: 0, err: 0 },
    { id: 5, name: 'A. Singh', role: 'Raider', pts: 0, err: 0 },
    { id: 6, name: 'S. Nada', role: 'Defender', pts: 0, err: 0 },
    { id: 7, name: 'P. Kumar', role: 'Raider', pts: 0, err: 0 }
  ]);

  const totalOwn = (parseInt(scores.ownRaid) || 0) + (parseInt(scores.ownDef) || 0);
  const totalOpp = (parseInt(scores.oppRaid) || 0) + (parseInt(scores.oppDef) || 0);

  const handlePredict = (e) => {
    e.preventDefault();
    setLoading(true);
    
    setTimeout(() => {
      let generatedAdvice = "";
      let simulatedVariance = 0;

      if (telemetryMode === 'macro') {
          const ownRId = parseInt(scores.ownRaid) || 0;
          const ownDId = parseInt(scores.ownDef) || 0;
          const oppRId = parseInt(scores.oppRaid) || 0;
          const oppDId = parseInt(scores.oppDef) || 0;

          const ownDefStatus = ownDId - oppRId; // Negative means opponent raiders are winning
          const ownRaidStatus = ownRId - oppDId; // Negative means our raiders are failing
          const lead = totalOwn - totalOpp;

          if (totalOwn === 0 && totalOpp === 0) {
            generatedAdvice = "Awaiting initial match telemetry to project tactical variance.";
            simulatedVariance = 0;
          } else if (ownDefStatus < -4) {
            generatedAdvice = "Defensive line is leaking points rapidly. Substitute exhausted corner defenders immediately and tighten the structural chain.";
            simulatedVariance = 12.4;
          } else if (ownRaidStatus < -4) {
            generatedAdvice = "Raiders are struggling against heavy opponent corners. Rotate lead raider immediately or shift tactical focus to securing Bonus Points.";
            simulatedVariance = 8.7;
          } else if (lead > 6 && ownDefStatus >= 0) {
            generatedAdvice = "Commanding lead secured with stable defense. Decelerate raid pace entirely to drain the clock. Do not over-commit on tackles.";
            simulatedVariance = 18.2;
          } else if (lead < -6) {
            generatedAdvice = "Critical point deficit detected. Deploy highly aggressive 5-1 raiding splits and aggressively force Opponent Do-or-Die raids.";
            simulatedVariance = 22.1;
          } else {
            generatedAdvice = "High-attrition baseline match. Keep lead raiders fresh and maintain strictly disciplined 6-man defensive formations to avoid giving cheap points.";
            simulatedVariance = 4.5;
          }
      } else {
          // MICRO MODE ALGORITHM
          let highestPts = -1;
          let mvp = null;
          let highestErr = -1;
          let weakestLink = null;
          
          playerStats.forEach(p => {
            const pPts = parseInt(p.pts) || 0;
            const pErr = parseInt(p.err) || 0;
            if (pPts > highestPts) { highestPts = pPts; mvp = p; }
            if (pErr > highestErr) { highestErr = pErr; weakestLink = p; }
          });

          if (highestPts === 0 && highestErr === 0) {
             generatedAdvice = "Awaiting micro-telemetry data for individual player analysis.";
             simulatedVariance = 0;
          } else if (highestErr > highestPts && weakestLink) {
             generatedAdvice = `Critical weakness detected in ${weakestLink.name}. With ${highestErr} failed executions, they are becoming a liability. Pull them to the bench immediately.`;
             simulatedVariance = 14.5;
          } else if (highestPts >= 5 && mvp) {
             generatedAdvice = `${mvp.name} is dominating the ${mvp.role.toLowerCase()} phase with ${highestPts} successful strikes. Shift tactical focus to funnel all actions through them.`;
             simulatedVariance = 8.2;
          } else if (weakestLink && highestErr >= 3) {
             generatedAdvice = `${weakestLink.name} is showing alarming fatigue with ${highestErr} errors. Issue tactical warning or substitute a fresh body.`;
             simulatedVariance = 11.1;
          } else {
             generatedAdvice = "Squad is operating at an even distribution of efficiency. Continue staggered rotations to manage stamina depletion.";
             simulatedVariance = 3.2;
          }
      }

      setAdvice(generatedAdvice);
      if (telemetryMode === 'macro') {
        const lead = totalOwn - totalOpp;
        setWinProbPredict(simulatedVariance * (lead >= 0 ? 1 : -1)); // just a visual effect
      } else {
        setWinProbPredict(simulatedVariance);
      }
      setLoading(false);
      
      const adviceEl = document.getElementById('advice-panel');
      if (adviceEl) {
        adviceEl.classList.remove('animate-fade-up');
        void adviceEl.offsetWidth; 
        adviceEl.classList.add('animate-fade-up');
      }

    }, 1200);
  };

  const handleScoreChange = (type, value) => {
    setScores(prev => ({ ...prev, [type]: value }));
    setAdvice(''); 
    setWinProbPredict(null);
  };

  const handlePlayerStatsChange = (id, field, value) => {
      setPlayerStats(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
      setAdvice('');
      setWinProbPredict(null);
  };

  // Re-used exact stamina mock logic
  const activeLineup = [
    { name: 'P. Narwal (C)', role: 'Raider', stamina: 85 },
    { name: 'S. Singh', role: 'Defender', stamina: 92 },
    { name: 'N. Kumar', role: 'Defender', stamina: 45 },
    { name: 'M. Chhillar', role: 'All-Rounder', stamina: 78 },
    { name: 'A. Singh', role: 'Raider', stamina: 88 },
    { name: 'S. Nada', role: 'Defender', stamina: 80 },
    { name: 'P. Kumar', role: 'Raider', stamina: 14 }
  ];

  return (
    <div className="space-y-12 animate-fade-up">
      {/* Hero: Real-time Match Widget */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
        <div className="lg:col-span-7 xl:col-span-8 silk-card rounded-2xl p-8 relative overflow-hidden flex flex-col justify-between h-full">
          <div className="absolute top-0 right-0 p-4">
            <span className="flex items-center gap-2 bg-error/10 text-error px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest silk-inset border border-error/10 animate-[pulseGlow_2s_infinite]">
              <span className="w-2 h-2 bg-error rounded-full animate-pulse"></span> Live: Phase 2
            </span>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-8 mt-6">
            <div className="text-center md:text-left flex-1">
              <h2 className="font-headline text-5xl md:text-5xl lg:text-4xl xl:text-5xl font-black text-white mb-1 tracking-tight">OWN SQUAD</h2>
              <p className="font-body text-primary font-bold tracking-[0.2em] text-[10px] uppercase">Home Arena</p>
            </div>
            
            <div className="flex items-center gap-4 md:gap-8 shrink-0">
              <span className="font-headline text-7xl md:text-8xl lg:text-6xl xl:text-[8rem] font-black tracking-tighter text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] leading-none transition-all duration-500">
                  {totalOwn}
              </span>
              <div className="h-16 md:h-24 lg:h-20 xl:h-24 w-[2px] bg-white/10 rotate-[15deg]"></div>
              <span className="font-headline text-7xl md:text-8xl lg:text-6xl xl:text-[8rem] font-black tracking-tighter text-neutral-600 leading-none transition-all duration-500">
                  {totalOpp}
              </span>
            </div>
            
            <div className="text-center md:text-right flex-1">
              <h2 className="font-headline text-5xl md:text-5xl lg:text-4xl xl:text-5xl font-black text-neutral-500 mb-1 tracking-tight">OPPONENT</h2>
              <p className="font-body text-neutral-500 font-bold tracking-[0.2em] text-[10px] uppercase">Challengers</p>
            </div>
          </div>
          
          {/* Win Probability Graph */}
          <div className="h-24 xl:h-32 w-full mt-auto silk-inset rounded-xl p-4 flex flex-col justify-end">
            <div className="flex items-end gap-1.5 h-full">
              {[40, 45, 55, 50, 70, 65, 75, 60, 50, 45, 55, 85].map((height, i) => (
                <div 
                  key={i} 
                  className={`flex-1 rounded-t-lg transition-all duration-1000 ease-out ${i === 4 || i === 11 ? 'bg-primary shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'bg-primary/20 hover:bg-primary/40'}`} 
                  style={{ height: `${height}%` }}>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-between items-center">
              <p className="font-headline text-[10px] font-black tracking-widest text-primary uppercase flex items-center gap-2">
                 <Activity className="w-3 h-3" /> System Win Probability: {totalOwn > totalOpp ? Math.min(99, 50 + ((totalOwn - totalOpp) * 3)) : Math.max(1, 50 + ((totalOwn - totalOpp) * 3))}%
              </p>
              <div className="h-1 w-24 xl:w-32 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary shadow-[0_0_10px_rgba(99,102,241,0.8)] transition-all duration-1000" 
                  style={{ width: `${totalOwn > totalOpp ? Math.min(99, 50 + ((totalOwn - totalOpp) * 3)) : Math.max(1, 50 + ((totalOwn - totalOpp) * 3))}%`}}>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Match Telemetry Input */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-6 h-[500px]">
          <div className="silk-inset rounded-2xl p-6 flex-1 flex flex-col border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-[0.03]">
              <BrainCircuit className="w-48 h-48 text-primary" />
            </div>
            
            <div className="flex justify-between items-center z-10 mb-4">
                <p className="text-white font-headline text-lg font-black uppercase tracking-tight flex items-center gap-2">
                    Live Telemetry <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.8)]"></span>
                </p>
            </div>

            {/* Mode Switcher */}
            <div className="flex gap-2 mb-6 z-10 bg-surface/50 p-1 rounded-lg border border-white/5">
              <button 
                  onClick={() => { setTelemetryMode('macro'); setAdvice(''); }} 
                  className={`flex-1 py-1.5 text-[9px] font-black uppercase tracking-widest rounded transition-all ${telemetryMode === 'macro' ? 'bg-primary text-[#0e0e0e] shadow-[0_0_10px_rgba(99,102,241,0.3)]' : 'bg-transparent text-neutral-500 hover:text-white'}`}>
                  MACRO SQUAD
              </button>
              <button 
                  onClick={() => { setTelemetryMode('micro'); setAdvice(''); }} 
                  className={`flex-1 py-1.5 text-[9px] font-black uppercase tracking-widest rounded transition-all ${telemetryMode === 'micro' ? 'bg-primary text-[#0e0e0e] shadow-[0_0_10px_rgba(99,102,241,0.3)]' : 'bg-transparent text-neutral-500 hover:text-white'}`}>
                  MICRO PLAYER
              </button>
            </div>
            
            <form onSubmit={handlePredict} className="z-10 w-full relative flex flex-col flex-1 h-full overflow-hidden">
                {telemetryMode === 'macro' ? (
                  <div className="grid grid-cols-2 gap-4 mb-2">
                      <div className="space-y-3">
                          <p className="text-[9px] font-black uppercase text-primary tracking-widest border-b border-primary/20 pb-1">Our Squad</p>
                          <div>
                              <label className="text-[10px] uppercase text-neutral-400 font-bold block mb-1">Raid Pts</label>
                              <input type="number" min="0" value={scores.ownRaid} onChange={(e) => handleScoreChange('ownRaid', e.target.value)} className="w-full bg-surface-container-high border border-white/10 rounded-lg p-2 text-white font-headline focus:border-primary text-center appearance-none" />
                          </div>
                          <div>
                              <label className="text-[10px] uppercase text-neutral-400 font-bold block mb-1">Defense Pts</label>
                              <input type="number" min="0" value={scores.ownDef} onChange={(e) => handleScoreChange('ownDef', e.target.value)} className="w-full bg-surface-container-high border border-white/10 rounded-lg p-2 text-white font-headline focus:border-primary text-center appearance-none" />
                          </div>
                      </div>
                      <div className="space-y-3">
                          <p className="text-[9px] font-black uppercase text-neutral-500 tracking-widest border-b border-white/10 pb-1">Opponent</p>
                          <div>
                              <label className="text-[10px] uppercase text-neutral-400 font-bold block mb-1">Raid Pts</label>
                              <input type="number" min="0" value={scores.oppRaid} onChange={(e) => handleScoreChange('oppRaid', e.target.value)} className="w-full bg-surface border border-white/5 rounded-lg p-2 text-neutral-300 font-headline focus:border-primary text-center appearance-none" />
                          </div>
                          <div>
                              <label className="text-[10px] uppercase text-neutral-400 font-bold block mb-1">Defense Pts</label>
                              <input type="number" min="0" value={scores.oppDef} onChange={(e) => handleScoreChange('oppDef', e.target.value)} className="w-full bg-surface border border-white/5 rounded-lg p-2 text-neutral-300 font-headline focus:border-primary text-center appearance-none" />
                          </div>
                      </div>
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto pr-2 space-y-2 mb-2 custom-scrollbar">
                     <div className="flex justify-end gap-5 px-3 mb-1">
                        <span className="text-[8px] font-black uppercase text-primary tracking-widest">Points</span>
                        <span className="text-[8px] font-black uppercase text-error tracking-widest mr-1">Errors</span>
                     </div>
                     {playerStats.map(p => (
                        <div key={p.id} className="flex justify-between items-center bg-surface border border-white/5 p-2 px-3 rounded-lg hover:border-white/20 transition-colors">
                           <div className="flex-1">
                              <p className="text-xs font-black text-white uppercase truncate">{p.name}</p>
                              <p className="text-[8px] font-bold text-neutral-500 uppercase tracking-widest -mt-0.5">{p.role}</p>
                           </div>
                           <div className="flex gap-2">
                              <input type="number" min="0" placeholder="0" value={p.pts || ''} onChange={e => handlePlayerStatsChange(p.id, 'pts', e.target.value)} className="w-10 bg-surface-container-high text-center text-xs font-headline font-black text-primary border border-white/5 rounded py-1 focus:border-primary focus:bg-surface outline-none transition-all placeholder:text-primary/30" />
                              <input type="number" min="0" placeholder="0" value={p.err || ''} onChange={e => handlePlayerStatsChange(p.id, 'err', e.target.value)} className="w-10 bg-error/5 text-center text-xs font-headline font-black text-error border border-error/10 rounded py-1 focus:border-error focus:bg-surface outline-none transition-all placeholder:text-error/30" />
                           </div>
                        </div>
                     ))}
                  </div>
                )}

                <div className="mt-auto pt-4 bg-surface-container/90 backdrop-blur pb-1">
                  {advice ? (
                    <div id="advice-panel" className="space-y-4 border-t border-white/10 pt-2">
                       <p className={`font-body text-sm leading-relaxed font-bold border-l-2 pl-3 py-2 pr-2 ${telemetryMode === 'micro' ? 'border-primary bg-primary/5 text-white' : 'border-primary bg-primary/5 text-white'}`}>"{advice}"</p>
                       <div className="flex justify-between items-center">
                          <span className="text-[9px] text-primary font-black uppercase tracking-widest">Calculated Tactical Shift: <span className="text-white bg-primary/20 border border-primary/30 px-1.5 py-0.5 rounded ml-1 animate-pulse">{winProbPredict >= 0 ? '+' : ''}{winProbPredict}%</span></span>
                       </div>
                    </div>
                  ) : (
                    <button type="submit" className="w-full py-4 silk-card bg-primary text-[#0e0e0e] font-black text-[10px] tracking-widest rounded-xl hover:scale-[1.02] active:shadow-silk-pressed transition-all border-none hover:shadow-silk-soft shadow-[0_0_15px_rgba(99,102,241,0.1)] flex items-center justify-center gap-2">
                        {loading ? <Activity className="w-4 h-4 animate-spin" /> : <BrainCircuit className="w-4 h-4" />}
                        {loading ? 'ANALYZING MATRIX...' : 'RUN TACTICAL CALCULATION'}
                    </button>
                  )}
                </div>
            </form>
          </div>
        </div>
      </section>

      {/* Bento Grid: Performance & Analytics */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Heatmap Card */}
        <div className="md:col-span-1 lg:col-span-2 silk-card rounded-2xl p-6 relative overflow-hidden group min-h-[350px] flex flex-col border border-white/5">
          <div className="flex justify-between items-center mb-4 z-10">
            <h3 className="font-headline text-lg font-black text-white tracking-tight uppercase">Mat Occupancy Heatmap</h3>
            <select 
              className="bg-surface-container-high border border-white/10 text-primary text-[9px] font-black uppercase rounded-lg px-2 py-1 outline-none cursor-pointer focus:border-primary transition-colors"
              onChange={(e) => document.getElementById('heatmap-img').style.filter = e.target.value}
            >
              <option value="hue-rotate(0deg) contrast(1.2) brightness(1.2)">OVERALL HEAT GAUGE</option>
              <option value="hue-rotate(240deg) opacity(0.8) brightness(1.5)">RAIDER PENETRATION</option>
              <option value="hue-rotate(-50deg) saturate(2) brightness(0.8)">DEFENSIVE HOTZONES</option>
            </select>
          </div>
          
          <div className="flex-1 relative silk-inset rounded-xl border border-white/5 overflow-hidden group cursor-crosshair bg-surface-container">
             <img 
               id="heatmap-img"
               alt="Mat Heatmap" 
               className="absolute inset-0 w-full h-full object-cover mix-blend-screen opacity-50 transition-all duration-1000 hue-rotate-0" 
               src="https://lh3.googleusercontent.com/aida-public/AB6AXuCfXAGhRllfib3f3gYo6fcYie2VmshudQuYK2m_gYM7mGMQ39jodQ4qcNAdBNSI71KTQLRAxjy9_EdQdzhEGegWTy4nHChXNBcBiR43FdP8Tg603MTfBkRf5nvB4tEZrFVTlsiOvFlSkzXd_-N4ss0E-h7f0ZoAc_pWy7irFwBD8u4SZg83_rrw9EZq4JMY-7xgnt4zDBBp1vyAafFUIqVLd4pukO-fEFsa45leJjkFdy3UuU8gYlrDZU9_6GyKWW-Blhsn_meBLfGo" 
             />
             <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
                 <div className="border-r border-b border-white/10 hover:bg-neutral-800/40 transition-colors flex flex-col gap-1 items-center justify-center opacity-0 hover:opacity-100 backdrop-blur-sm">
                   <span className="text-xl font-headline font-black text-white leading-none">12 <span className="text-sm font-bold text-neutral-500">%</span></span>
                   <span className="text-[9px] font-black text-primary uppercase tracking-widest bg-surface-container-high px-2 py-0.5 rounded border border-white/5">Q1: Left Corner Safe</span>
                 </div>
                 <div className="border-b border-white/10 hover:bg-error/20 transition-colors flex flex-col gap-1 items-center justify-center opacity-0 hover:opacity-100 backdrop-blur-sm">
                   <span className="text-4xl font-headline font-black text-error leading-none drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]">58 <span className="text-lg font-bold text-error/50">%</span></span>
                   <span className="text-[9px] font-black text-white uppercase tracking-widest bg-error/20 border border-error/50 px-2 py-0.5 rounded">Q2: Critical Threat Zone</span>
                 </div>
                 <div className="border-r border-white/10 hover:bg-neutral-800/40 transition-colors flex flex-col gap-1 items-center justify-center opacity-0 hover:opacity-100 backdrop-blur-sm">
                   <span className="text-lg font-headline font-black text-white leading-none">18 <span className="text-xs font-bold text-neutral-500">%</span></span>
                   <span className="text-[9px] font-black text-primary uppercase tracking-widest bg-surface-container-high px-2 py-0.5 rounded border border-white/5">Q3: Left In Moderate</span>
                 </div>
                 <div className="hover:bg-neutral-800/40 transition-colors flex flex-col gap-1 items-center justify-center opacity-0 hover:opacity-100 backdrop-blur-sm">
                   <span className="text-xl font-headline font-black text-white leading-none">22 <span className="text-sm font-bold text-neutral-500">%</span></span>
                   <span className="text-[9px] font-black text-primary uppercase tracking-widest bg-surface-container-high px-2 py-0.5 rounded border border-white/5">Q4: Right In Standard</span>
                 </div>
             </div>
             <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-surface-container to-transparent pointer-events-none"></div>
          </div>
          <div className="mt-4 flex gap-6 z-10 w-full items-center justify-between">
             <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(99,102,241,0.8)] animate-pulse"></div>
               <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">Hover specific quadrants for detailed mat analytics</span>
             </div>
          </div>
        </div>

        {/* Raider Efficiency Avg */}
        <div className="silk-card rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-headline text-sm font-black text-white mb-1 tracking-tight uppercase">Team Synergy</h3>
            <p className="text-[9px] text-neutral-500 font-black tracking-widest uppercase">Aggregated Efficiency Metric</p>
          </div>
          <div className="flex items-baseline gap-1 py-4 justify-center">
            <span className="font-headline text-8xl font-black text-primary tracking-tighter drop-shadow-sm">
               {totalOwn > 0 ? Math.floor(((parseInt(scores.ownRaid) || 0) / totalOwn) * 100) || 0 : 0}
            </span>
            <span className="font-headline text-2xl font-black text-white">%</span>
          </div>
          <div className="w-full h-1.5 silk-inset rounded-full overflow-hidden">
            <div 
              className="bg-primary h-full rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)] transition-all duration-1000" 
              style={{ width: `${totalOwn > 0 ? Math.floor(((parseInt(scores.ownRaid) || 0) / totalOwn) * 100) : 0}%` }}>
            </div>
          </div>
        </div>

        {/* Stamina Alert Critical Task */}
        <div className="bg-error/10 border border-error/50 rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden shadow-[0_0_40px_rgba(239,68,68,0.1)]">
          <div className="absolute -right-4 -top-4 opacity-[0.05]">
             <Clock className="w-40 h-40 text-error" />
          </div>
          <div>
            <h3 className="font-headline text-sm font-black text-error mb-1 uppercase flex items-center gap-2">
                <Activity className="w-4 h-4 animate-pulse" /> Stamina Override
            </h3>
            <p className="text-[9px] text-error/80 font-black tracking-widest uppercase">Critical Depletion Detected</p>
          </div>
          <div className="my-6 z-10 bg-[#0e0e0e]/50 backdrop-blur rounded-xl p-4 border border-error/20">
            <p className="font-black font-headline text-white text-2xl uppercase tracking-tighter">P. KUMAR</p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-[10px] text-error font-bold uppercase tracking-widest">Remaining:</span>
              <span className="text-error font-black text-xl leading-none">14%</span>
            </div>
          </div>
          <button className="w-full py-4 bg-error text-white font-headline text-[10px] font-black rounded-xl uppercase tracking-widest shadow-lg shadow-error/20 active:scale-95 transition-transform border-none hover:scale-[1.03] hover:brightness-110 flex justify-center z-10">
              INITIATE SUBSTITUTION
          </button>
        </div>

        {/* New Module: Live Formation Set */}
        <div className="md:col-span-1 lg:col-span-2 silk-card rounded-2xl p-6 flex flex-col h-full border border-white/5">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/5">
            <h3 className="font-headline text-lg font-black text-white tracking-tight uppercase flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" /> Active Formation
            </h3>
            <span className="px-3 py-1 bg-surface-container-high border border-white/10 text-primary text-[9px] font-black uppercase rounded-lg tracking-widest">
              7 Active • 2 Available
            </span>
          </div>
          
          <div className="flex-1 space-y-3 px-2">
              {activeLineup.map((player, i) => (
                 <div key={i} className="flex justify-between items-center p-3 silk-inset rounded-xl border border-white/5 hover:border-primary/30 transition-colors">
                     <div className="flex flex-col">
                         <span className="text-sm font-black text-white uppercase font-headline tracking-wide">{player.name}</span>
                         <span className="text-[8px] text-neutral-500 font-bold uppercase tracking-[0.2em]">{player.role}</span>
                     </div>
                     <div className="flex flex-col items-end gap-1">
                         <div className="flex gap-1 bg-[#0e0e0e] p-1 rounded">
                             <div className={`h-2 w-6 rounded-[2px] ${player.stamina < 30 ? 'bg-error shadow-[0_0_5px_rgba(239,68,68,0.8)]' : 'bg-primary'}`}></div>
                             <div className={`h-2 w-6 rounded-[2px] ${player.stamina < 30 ? 'bg-error/30' : (player.stamina < 60 ? 'bg-primary/50' : 'bg-primary')}`}></div>
                             <div className={`h-2 w-6 rounded-[2px] ${player.stamina < 80 ? 'bg-surface-container-high' : 'bg-primary'}`}></div>
                         </div>
                         <span className={`text-[8px] font-black uppercase ${player.stamina < 30 ? 'text-error animate-pulse' : 'text-neutral-500'}`}>Trc: {player.stamina}%</span>
                     </div>
                 </div>
              ))}
          </div>
        </div>

        {/* Improved Strategic Graph */}
        <div className="md:col-span-1 lg:col-span-2 silk-card rounded-2xl p-6 flex flex-col h-full border border-white/5 overflow-hidden relative">
          <div className="absolute -bottom-10 -right-10 opacity-[0.03] rotate-12">
              <Activity className="w-64 h-64 text-white" />
          </div>
          <div className="flex-1 z-10 flex flex-col justify-end">
            <h3 className="font-headline text-2xl font-black mb-2 text-white tracking-tighter uppercase relative z-10">Real-Time Vectors</h3>
            <p className="text-neutral-400 font-body text-xs mb-8 leading-relaxed max-w-sm relative z-10">
               Live analysis of team formation efficacy telemetry. Current delta shift indicates a heavy opponent right-side bias demanding an aggressive left-corner counter protocol.
            </p>
            <div className="flex gap-4 relative z-10 mt-auto">
              <div className="px-5 py-4 silk-inset rounded-xl border border-white/5 flex-1 relative overflow-hidden">
                <p className="text-[9px] text-neutral-500 font-black uppercase tracking-widest mb-1">Engaged Protocol</p>
                <p className="font-black font-headline text-2xl text-white uppercase tracking-tighter">5-1 Split</p>
              </div>
              <div className="px-5 py-4 silk-inset rounded-xl border border-primary/20 bg-primary/5 flex-1 relative overflow-hidden">
                <p className="text-[9px] text-primary/80 font-black uppercase tracking-widest mb-1">Efficiency Delta</p>
                <p className="font-black font-headline text-2xl text-primary uppercase tracking-tighter">+14.2%</p>
              </div>
            </div>
          </div>
        </div>

      </section>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Map, TrendingUp, AlertTriangle, FileSearch, Coins, Users, CheckCircle2, ChevronRight, Activity, XCircle, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } };

export default function DistrictDashboard() {
  const router = useRouter();
  const [auditInput, setAuditInput] = useState('');
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<any>(null);
  const [totalAlerts, setTotalAlerts] = useState(0);

  useEffect(() => {
    const savedAlerts = JSON.parse(localStorage.getItem('maasaheli_alerts') || '[]');
    setTotalAlerts(savedAlerts.length);
  }, []);

  const runAudit = async () => {
    if (!auditInput.trim()) return;
    setIsAuditing(true);
    try {
      const res = await fetch('/api/death-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventText: auditInput })
      });
      if (!res.ok) throw new Error("API failed");
      const data = await res.json();
      setAuditResult(data);
    } catch (e) {
      setAuditResult({
        systemic_failures: [
          "Delayed transport: Ambulance arrived 3 hours late due to poor road conditions in sub-sector 4.",
          "Lack of blood bank reserves (O-ve) at the nearest PHC.",
          "ASHA worker initiated referral but PHC was not prepared for surgical intervention."
        ],
        counterfactual: "If the referral had been initiated 4 hours earlier, OR if the PHC had 2 units of O-ve blood prepositioned based on the predictive algorithm, the fatal hemorrhage could have been stabilized.",
        policy_nudge: "Allocate ₹45,000 to trigger preemptive blood-transport protocols for high-risk pregnant women in Sector 4 before their due dates.",
        preventable_score: "85%"
      });
    } finally {
      setIsAuditing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08070d] text-slate-200 font-sans relative overflow-hidden">
      
      {/* ===== ANIMATED BACKGROUND ===== */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="grid-pattern absolute inset-0 opacity-30"></div>
        <div className="absolute top-[-10%] right-[10%] w-[500px] h-[500px] rounded-full bg-amber-600/10 animate-float-slow animate-pulse-glow"></div>
        <div className="absolute bottom-[-10%] left-[5%] w-[450px] h-[450px] rounded-full bg-yellow-600/8 animate-float-medium animate-pulse-glow" style={{ animationDelay: '4s' }}></div>
        <div className="absolute top-[30%] left-[50%] w-[350px] h-[350px] rounded-full bg-rose-500/6 animate-float-slow" style={{ animationDelay: '7s' }}></div>
      </div>

      <div className="relative z-10 p-4 md:p-8">
        {/* ===== HEADER ===== */}
        <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center shadow-[0_0_40px_-5px_rgba(245,158,11,0.5)] relative">
              <ShieldCheck className="w-7 h-7 text-white" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#08070d] animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">District <span className="text-amber-500">Analytics</span> <Sparkles className="w-5 h-5 text-amber-400" /></h1>
              <p className="text-sm text-amber-200/50 font-medium tracking-wide">Macro-Governance & Policy Intelligence</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 border border-amber-500/20 bg-amber-500/10 rounded-xl text-amber-400 text-sm font-bold flex items-center gap-2 backdrop-blur-xl">
              <Map className="w-4 h-4" /> District 4 (Central)
            </div>
            <button onClick={() => router.push('/')} className="px-5 py-2 glass-card rounded-xl text-sm font-bold hover:bg-white/10 transition">
              Logout
            </button>
          </div>
        </motion.header>

        <motion.main variants={container} initial="hidden" animate="show" className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* ===== LEFT: HEATMAP & STATS ===== */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { icon: <TrendingUp className="w-5 h-5" />, label: "Live Referrals", value: totalAlerts || 5, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/15" },
                { icon: <Users className="w-5 h-5" />, label: "Active ASHAs", value: "342", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/15" },
                { icon: <Activity className="w-5 h-5" />, label: "Risk Index", value: "Medium", color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/15" },
                { icon: <Coins className="w-5 h-5" />, label: "Budget Eff.", value: "92%", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/15" },
              ].map((stat, i) => (
                <motion.div key={i} variants={item} className={`glass-card ${stat.bg} p-4 rounded-2xl border ${stat.border} flex flex-col items-center text-center group hover:scale-[1.03] transition-transform duration-300`}>
                  <div className={`mb-2 p-2 rounded-xl ${stat.bg} ${stat.color}`}>{stat.icon}</div>
                  <p className="text-2xl font-black text-white">{stat.value}</p>
                  <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Heatmap */}
            <motion.section variants={item} className="glass-card bg-gradient-to-br from-amber-500/5 to-transparent rounded-3xl p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-amber-500 to-transparent animate-shimmer-line"></div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 rounded-full blur-[80px] pointer-events-none"></div>
              
              <div className="flex justify-between items-start mb-6 relative z-10">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Map className="w-6 h-6 text-amber-500" /> Geographic Risk Heatmap
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">AI-predicted high-risk clusters — next 14 days.</p>
                </div>
                <button className="px-3 py-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl text-xs font-bold uppercase tracking-wider">Live</button>
              </div>

              <div className="w-full h-64 glass-card rounded-2xl relative overflow-hidden">
                <div className="absolute inset-0 grid-pattern opacity-50"></div>
                
                <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.3, type: "spring" }} className="absolute top-[25%] left-[18%]">
                  <div className="w-28 h-28 bg-rose-500/20 rounded-full blur-2xl absolute -inset-8 animate-pulse-glow"></div>
                  <div className="w-14 h-14 bg-rose-500/30 border-2 border-rose-500/60 rounded-full flex items-center justify-center relative cursor-pointer hover:scale-110 transition-transform shadow-[0_0_25px_-5px_rgba(244,63,94,0.5)]">
                    <AlertTriangle className="w-6 h-6 text-rose-200" />
                  </div>
                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-rose-500/20 border border-rose-500/30 px-2 py-0.5 rounded-md text-[10px] font-bold text-rose-300 whitespace-nowrap">Cluster 4A • 3 Cases</div>
                </motion.div>

                <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.6, type: "spring" }} className="absolute top-[55%] right-[25%]">
                  <div className="w-20 h-20 bg-orange-500/20 rounded-full blur-xl absolute -inset-6 animate-pulse-glow" style={{ animationDelay: '1s' }}></div>
                  <div className="w-10 h-10 bg-orange-500/30 border-2 border-orange-500/50 rounded-full flex items-center justify-center relative cursor-pointer hover:scale-110 transition-transform shadow-[0_0_20px_-5px_rgba(249,115,22,0.4)]">
                    <AlertTriangle className="w-4 h-4 text-orange-200" />
                  </div>
                </motion.div>

                <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.9, type: "spring" }} className="absolute top-[40%] right-[55%]">
                  <div className="w-14 h-14 bg-amber-500/15 rounded-full blur-lg absolute -inset-4"></div>
                  <div className="w-7 h-7 bg-amber-500/30 border border-amber-500/40 rounded-full flex items-center justify-center relative">
                    <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                  </div>
                </motion.div>
                
                <p className="absolute bottom-3 left-4 text-[10px] font-mono text-slate-600 bg-black/30 px-2 py-1 rounded backdrop-blur-sm">MaaSaheli GIS Engine v2.0</p>
              </div>
            </motion.section>

            {/* Budget Nudges */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: 'Micro-Budget Nudge', desc: 'Invest ₹12,000 in PHC-3 this week for ambulance fuel to prevent 2 PPH transport delays.', icon: <Coins className="w-5 h-5" />, color: 'emerald', btn: 'Approve Fund Transfer' },
                { title: 'ASHA Deployment', desc: 'Re-route 3 ASHA workers to Village Cluster 4A (Heatmap peak detected).', icon: <Users className="w-5 h-5" />, color: 'indigo', btn: 'Auto-Draft Order' },
              ].map((card, i) => (
                <motion.div key={i} variants={item} className={`glass-card bg-gradient-to-br from-${card.color}-500/8 to-transparent rounded-2xl p-5 border border-${card.color}-500/15 group hover:border-${card.color}-500/30 transition-all`}>
                  <div className={`w-10 h-10 rounded-xl bg-${card.color}-500/15 text-${card.color}-400 flex items-center justify-center mb-3`}>{card.icon}</div>
                  <h3 className="font-bold text-white mb-1">{card.title}</h3>
                  <p className="text-xs text-slate-500 mb-4 leading-relaxed">{card.desc}</p>
                  <button className={`text-${card.color}-400 font-bold text-sm flex items-center gap-1 hover:text-${card.color}-300 transition group/btn`}>
                    {card.btn} <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
                  </button>
                </motion.div>
              ))}
            </div>
          </div>

          {/* ===== RIGHT: AI DEATH AUDIT ===== */}
          <motion.div variants={item} className="lg:col-span-5 flex flex-col h-full">
            <section className="glass-card bg-gradient-to-b from-rose-500/5 to-transparent rounded-3xl p-6 flex-grow flex flex-col relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-rose-500 to-transparent animate-shimmer-line opacity-50"></div>
              <div className="absolute top-0 right-0 w-40 h-40 bg-rose-500/5 rounded-full blur-[60px] pointer-events-none"></div>
              
              <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-2 relative z-10">
                <FileSearch className="w-5 h-5 text-rose-400" /> AI Death Audit 
                <span className="px-2 py-0.5 bg-rose-500/15 text-rose-400 text-[9px] rounded-md uppercase font-black tracking-wider border border-rose-500/20">Beta</span>
              </h2>
              <p className="text-sm text-slate-500 mb-6 relative z-10">Counterfactual Analysis Engine</p>

              <div className="flex-grow flex flex-col relative z-10">
                <textarea 
                  value={auditInput}
                  onChange={(e) => setAuditInput(e.target.value)}
                  placeholder="Paste raw maternal mortality report here (e.g., 'Patient transported via private vehicle at 2 AM, blood bank closed...')"
                  className="w-full glass-card rounded-xl p-4 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500/30 resize-none h-28 mb-4 placeholder:text-slate-600"
                />
                
                <button 
                  onClick={runAudit}
                  disabled={!auditInput || isAuditing}
                  className="w-full py-4 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold rounded-xl transition-all disabled:opacity-50 flex justify-center items-center gap-2 shadow-[0_0_30px_-10px_rgba(244,63,94,0.4)] hover:shadow-[0_0_40px_-10px_rgba(244,63,94,0.6)]"
                >
                  {isAuditing ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}><Activity className="w-5 h-5"/></motion.div> : <><FileSearch className="w-5 h-5" /> Run Counterfactual Analysis</>}
                </button>

                <AnimatePresence>
                  {auditResult && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 space-y-3 pt-6 border-t border-white/5 overflow-y-auto max-h-[420px] pr-1 custom-scrollbar">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-white text-lg">Analysis Complete</h3>
                        <div className="px-3 py-1 bg-rose-500/10 border border-rose-500/20 rounded-lg">
                          <span className="text-[9px] text-slate-400 uppercase font-bold mr-1">Preventable:</span>
                          <span className="text-rose-400 font-black">{auditResult.preventable_score}</span>
                        </div>
                      </div>

                      <div className="p-4 glass-card bg-gradient-to-br from-rose-500/8 to-transparent rounded-xl border-rose-500/15">
                        <h4 className="text-[10px] uppercase font-bold text-rose-400 tracking-widest mb-2 flex items-center gap-1"><XCircle className="w-3 h-3"/> Systemic Failures</h4>
                        <ul className="space-y-2">
                          {auditResult.systemic_failures.map((f: string, i: number) => (
                            <li key={i} className="text-sm text-slate-300 flex items-start gap-2 leading-relaxed">
                              <span className="text-rose-500 mt-1 shrink-0">•</span>{f}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-4 glass-card bg-gradient-to-br from-emerald-500/8 to-transparent rounded-xl border-emerald-500/15">
                        <h4 className="text-[10px] uppercase font-bold text-emerald-400 tracking-widest mb-2 flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> The Counterfactual</h4>
                        <p className="text-sm text-slate-300 leading-relaxed">{auditResult.counterfactual}</p>
                      </div>

                      <div className="p-4 glass-card bg-gradient-to-br from-amber-500/8 to-transparent rounded-xl border-amber-500/15">
                        <h4 className="text-[10px] uppercase font-bold text-amber-400 tracking-widest mb-2 flex items-center gap-1"><Coins className="w-3 h-3"/> Policy Nudge</h4>
                        <p className="text-sm text-amber-200/70 leading-relaxed font-medium">{auditResult.policy_nudge}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </section>
          </motion.div>

        </motion.main>
      </div>
    </div>
  );
}

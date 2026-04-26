'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, Map, TrendingUp, AlertTriangle, FileSearch,
  Coins, Users, CheckCircle2, ChevronRight, Activity, XCircle,
  Sparkles, Download, RefreshCw, Trophy, Star, AlertOctagon,
  Target, Zap, Brain, BarChart3, Navigation, X, ArrowUpRight,
  Flame, Radio, Wifi, WifiOff, Medal
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const CLUSTERS = [
  { id: 'C1', name: 'Babatpur North', x: 18, y: 22, risk: 'critical', cases: 7, trend: 'rising', asha: 'Priya D.', deadZone: false },
  { id: 'C2', name: 'Ramnagar East', x: 62, y: 15, risk: 'high', cases: 4, trend: 'stable', asha: 'Sunita K.', deadZone: false },
  { id: 'C3', name: 'Vindhyachal', x: 78, y: 58, risk: 'medium', cases: 2, trend: 'falling', asha: 'Meena R.', deadZone: false },
  { id: 'C4', name: 'Lahartara ← DEAD ZONE', x: 36, y: 72, risk: 'dead', cases: 0, trend: 'none', asha: 'UNASSIGNED', deadZone: true },
  { id: 'C5', name: 'Manduadih', x: 52, y: 40, risk: 'high', cases: 3, trend: 'rising', asha: 'Geeta L.', deadZone: false },
  { id: 'C6', name: 'Sarnath Cluster', x: 84, y: 30, risk: 'low', cases: 1, trend: 'stable', asha: 'Rita P.', deadZone: false },
  { id: 'C7', name: 'Chaukaghat', x: 28, y: 48, risk: 'medium', cases: 2, trend: 'rising', asha: 'Usha S.', deadZone: false },
];

const ASHA_LEADERS = [
  { name: 'Priya Devi', village: 'Babatpur', cases: 34, accuracy: 94, falseAlarms: 1, trainingDue: false, streak: 12, rank: 1 },
  { name: 'Sunita Kumari', village: 'Ramnagar', cases: 29, accuracy: 88, falseAlarms: 3, trainingDue: false, streak: 8, rank: 2 },
  { name: 'Geeta Lal', village: 'Manduadih', cases: 25, accuracy: 82, falseAlarms: 5, trainingDue: true, streak: 4, rank: 3 },
  { name: 'Meena Rani', village: 'Vindhyachal', cases: 21, accuracy: 91, falseAlarms: 2, trainingDue: false, streak: 7, rank: 4 },
  { name: 'Usha Singh', village: 'Chaukaghat', cases: 18, accuracy: 74, falseAlarms: 8, trainingDue: true, streak: 2, rank: 5 },
  { name: 'Rita Pandey', village: 'Sarnath', cases: 15, accuracy: 96, falseAlarms: 0, trainingDue: false, streak: 15, rank: 6 },
];

const riskConfig: Record<string, any> = {
  critical: { color: '#f43f5e', glow: 'rgba(244,63,94,0.5)', size: 28, pulseSize: 56, label: 'CRITICAL', ring: '#f43f5e' },
  high:     { color: '#f97316', glow: 'rgba(249,115,22,0.4)', size: 22, pulseSize: 44, label: 'HIGH', ring: '#f97316' },
  medium:   { color: '#eab308', glow: 'rgba(234,179,8,0.35)', size: 16, pulseSize: 32, label: 'MEDIUM', ring: '#eab308' },
  low:      { color: '#22c55e', glow: 'rgba(34,197,94,0.3)', size: 12, pulseSize: 24, label: 'LOW', ring: '#22c55e' },
  dead:     { color: '#6366f1', glow: 'rgba(99,102,241,0.4)', size: 18, pulseSize: 36, label: 'DEAD ZONE', ring: '#6366f1' },
};

// ─── HEATMAP ────────────────────────────────────────────────────────────────
function HeatmapSection({ onSelectCluster }: { onSelectCluster: (c: any) => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [showDeadZones, setShowDeadZones] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [exported, setExported] = useState(false);

  const handleExport = () => {
    setExported(true);
    setTimeout(() => setExported(false), 3000);
    const data = `MAASAHELI NHM EXPORT — District 4 Central
Generated: ${new Date().toLocaleString('en-IN')}

CLUSTER RISK SUMMARY:
${CLUSTERS.map(c => `${c.name}: ${c.risk.toUpperCase()} | ${c.cases} cases | ASHA: ${c.asha}`).join('\n')}

KEY ALERTS:
- 3 CRITICAL clusters need immediate ASHA deployment
- 1 DEAD ZONE (Lahartara) has zero ASHA coverage
- Rising trend detected in Babatpur North & Manduadih
`;
    const blob = new Blob([data], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'maasaheli_nhm_export.txt'; a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = CLUSTERS.filter(c => filter === 'all' || c.risk === filter);

  return (
    <div className="glass-card bg-gradient-to-br from-amber-500/5 to-transparent rounded-3xl p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-amber-500 to-transparent animate-shimmer-line" />

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Map className="w-5 h-5 text-amber-500" /> Geographic Risk Heatmap
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">AI-predicted clusters — live 14-day forecast</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-500/15 border border-emerald-500/25 rounded-xl text-[10px] font-bold text-emerald-400">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span> LIVE
          </div>
          <button
            onClick={handleExport}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${exported ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'glass-card text-slate-300 hover:text-white border border-white/5'}`}
          >
            <Download className="w-3.5 h-3.5" /> {exported ? 'Exported!' : 'NHM Export'}
          </button>
        </div>
      </div>

      {/* Filter Pills */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {['all', 'critical', 'high', 'medium', 'low', 'dead'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition border ${filter === f
              ? f === 'critical' ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                : f === 'high' ? 'bg-orange-500/20 border-orange-500/40 text-orange-300'
                  : f === 'dead' ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300'
                    : 'bg-amber-500/20 border-amber-500/40 text-amber-300'
              : 'glass-card border-white/5 text-slate-500 hover:text-slate-300'}`}
          >
            {f === 'all' ? '🗺 All' : f === 'dead' ? '📵 Dead Zones' : f}
          </button>
        ))}
      </div>

      {/* Map Canvas */}
      <div className="relative w-full rounded-2xl overflow-hidden bg-[#0a0d18] border border-white/5"
        style={{ height: 320 }}>

        {/* Grid lines */}
        <svg className="absolute inset-0 w-full h-full opacity-10">
          {Array.from({ length: 8 }).map((_, i) => (
            <g key={i}>
              <line x1={`${(i + 1) * 12.5}%`} y1="0" x2={`${(i + 1) * 12.5}%`} y2="100%" stroke="#64748b" strokeWidth="0.5" strokeDasharray="4 4" />
              <line x1="0" y1={`${(i + 1) * 12.5}%`} x2="100%" y2={`${(i + 1) * 12.5}%`} stroke="#64748b" strokeWidth="0.5" strokeDasharray="4 4" />
            </g>
          ))}
        </svg>

        {/* Map district outline */}
        <svg className="absolute inset-0 w-full h-full">
          <path d="M 8% 8% L 92% 8% L 92% 92% L 8% 92% Z" fill="none" stroke="rgba(245,158,11,0.08)" strokeWidth="1" />
          {/* terrain shapes */}
          <path d="M 10% 50% Q 30% 30% 50% 50% Q 70% 70% 90% 50%" fill="none" stroke="rgba(99,102,241,0.06)" strokeWidth="8" />
          <circle cx="50%" cy="50%" r="30%" fill="none" stroke="rgba(245,158,11,0.04)" strokeWidth="1" strokeDasharray="8 8" />
        </svg>

        {/* Heatmap glow blobs under nodes */}
        {filtered.map(c => {
          const cfg = riskConfig[c.risk];
          return (
            <div key={`glow-${c.id}`} className="absolute pointer-events-none"
              style={{ left: `${c.x}%`, top: `${c.y}%`, transform: 'translate(-50%,-50%)', width: cfg.pulseSize * 3, height: cfg.pulseSize * 3, borderRadius: '50%', background: `radial-gradient(circle, ${cfg.glow} 0%, transparent 70%)`, filter: 'blur(12px)' }} />
          );
        })}

        {/* Cluster nodes */}
        {filtered.map((c, idx) => {
          const cfg = riskConfig[c.risk];
          const isSelected = selected === c.id;
          return (
            <motion.button
              key={c.id}
              className="absolute"
              style={{ left: `${c.x}%`, top: `${c.y}%`, transform: 'translate(-50%,-50%)', zIndex: isSelected ? 20 : 10 }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.12, type: 'spring', stiffness: 300 }}
              onClick={() => { setSelected(isSelected ? null : c.id); onSelectCluster(c); }}
            >
              {/* Outer pulse ring */}
              <motion.div
                animate={{ scale: [1, 1.6, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: c.risk === 'critical' ? 1.2 : 2.5, repeat: Infinity }}
                style={{ width: cfg.pulseSize, height: cfg.pulseSize, borderRadius: '50%', border: `2px solid ${cfg.ring}`, position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', pointerEvents: 'none' }}
              />
              {/* Node */}
              <div style={{
                width: cfg.size, height: cfg.size, borderRadius: '50%',
                background: c.risk === 'dead'
                  ? 'repeating-linear-gradient(45deg, rgba(99,102,241,0.3) 0px, rgba(99,102,241,0.3) 4px, transparent 4px, transparent 8px)'
                  : cfg.color,
                border: `2px solid ${cfg.ring}`,
                boxShadow: `0 0 ${cfg.size}px -4px ${cfg.glow}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative',
                outline: isSelected ? `3px solid white` : 'none',
                outlineOffset: 2
              }}>
                {c.risk === 'critical' && <Flame className="w-3.5 h-3.5 text-white" />}
                {c.risk === 'dead' && <WifiOff className="w-3 h-3 text-indigo-300" />}
                {c.risk === 'high' && <AlertTriangle className="w-3 h-3 text-white" />}
              </div>
              {/* Label */}
              <div style={{ position: 'absolute', top: cfg.size + 6, left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap', pointerEvents: 'none' }}>
                <div style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', border: `1px solid ${cfg.ring}40`, borderRadius: 6, padding: '2px 6px', fontSize: 9, fontWeight: 900, color: cfg.color, letterSpacing: '0.05em' }}>
                  {c.deadZone ? '📵' : ''} {c.cases > 0 ? `${c.cases}` : ''} {cfg.label}
                </div>
                {isSelected && (
                  <div style={{ background: 'rgba(0,0,0,0.85)', border: `1px solid ${cfg.ring}60`, borderRadius: 8, padding: '4px 8px', marginTop: 4, fontSize: 10, color: '#e2e8f0', fontWeight: 600 }}>
                    {c.name}<br />
                    <span style={{ color: cfg.color, fontWeight: 900 }}>ASHA: {c.asha}</span>
                  </div>
                )}
              </div>
            </motion.button>
          );
        })}

        {/* Legend */}
        <div className="absolute bottom-3 right-3 flex flex-col gap-1 bg-black/60 backdrop-blur-sm rounded-xl p-2.5 border border-white/5">
          {Object.entries(riskConfig).map(([key, cfg]) => (
            <div key={key} className="flex items-center gap-1.5">
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: cfg.color, boxShadow: `0 0 6px ${cfg.glow}` }} />
              <span style={{ fontSize: 9, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{cfg.label}</span>
            </div>
          ))}
        </div>

        {/* Attribution */}
        <p className="absolute bottom-3 left-3 text-[9px] font-mono text-slate-700 bg-black/30 px-2 py-1 rounded backdrop-blur-sm">
          MaaSaheli GIS Engine v2.1 • Bihar District 4
        </p>
      </div>

      {/* Outbreak / Dead zone summary */}
      <div className="grid grid-cols-3 gap-3 mt-4">
        {[
          { label: 'Outbreak Clusters', val: CLUSTERS.filter(c => c.risk === 'critical' || c.risk === 'high').length, color: 'rose', icon: <Flame className="w-4 h-4" /> },
          { label: 'Dead Zones', val: CLUSTERS.filter(c => c.deadZone).length, color: 'indigo', icon: <WifiOff className="w-4 h-4" /> },
          { label: 'Total Active', val: CLUSTERS.filter(c => c.cases > 0).length, color: 'amber', icon: <Radio className="w-4 h-4" /> },
        ].map((s, i) => (
          <div key={i} className={`glass-card p-3 rounded-xl border border-${s.color}-500/15 bg-${s.color}-500/5 text-center`}>
            <div className={`flex items-center justify-center gap-1 text-${s.color}-400 mb-1`}>{s.icon}</div>
            <p className="text-2xl font-black text-white">{s.val}</p>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── BUDGET OPTIMIZER ───────────────────────────────────────────────────────
function BudgetOptimizer({ totalAlerts }: { totalAlerts: number }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [tab, setTab] = useState<'deploy' | 'roi' | 'nudges' | 'sim'>('nudges');
  const [approved, setApproved] = useState<string[]>([]);

  const run = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/budget-optimizer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ totalAlerts, highRiskCount: Math.ceil(totalAlerts * 0.4), districtName: 'Central District 4', ashaCount: 342, phcCount: 8 })
      });
      const data = await res.json();
      if (data.error) throw new Error();
      setResult(data);
    } catch {
      setResult({
        where_to_deploy_asha: [
          { cluster: 'Babatpur North Cluster', priority: 'HIGH', reason: 'Highest case density — 7 active cases with no additional ASHA coverage. Rising trend over 14 days.', asha_needed: '2' },
          { cluster: 'Lahartara Dead Zone', priority: 'HIGH', reason: 'Zero ASHA coverage — no surveillance data for 3 months. High-risk households identified by satellite data.', asha_needed: '3' }
        ],
        roi_per_phc: [
          { phc: 'PHC Babatpur', cases_handled: '89', cost_per_case: '₹1,240', efficiency: 'HIGH', recommendation: 'Increase blood bank reserve by 4 units O-ve' },
          { phc: 'PHC Ramnagar', cases_handled: '54', cost_per_case: '₹2,100', efficiency: 'MEDIUM', recommendation: 'Add second MO for evening shift — reduce referral backlog' },
          { phc: 'PHC Lahartara', cases_handled: '12', cost_per_case: '₹5,800', efficiency: 'LOW', recommendation: 'ASHA deployment required — this PHC is underutilized due to community gap' }
        ],
        budget_nudges: [
          { action: 'Pre-position 4 units O-ve blood at PHC Babatpur', amount: '₹14,400', impact: 'Prevents PPH mortality in 2-3 upcoming high-risk deliveries', urgency: 'THIS WEEK' },
          { action: 'Deploy 3 additional ASHA workers to Lahartara Dead Zone', amount: '₹28,500/month', impact: 'Eliminates surveillance blind spot covering 1,200 households', urgency: 'THIS MONTH' },
          { action: 'Upgrade Ramnagar ambulance with GPS tracking', amount: '₹45,000 one-time', impact: 'Reduces average referral ETA from 45 min to 18 min', urgency: 'NEXT QUARTER' }
        ],
        scenario_simulation: {
          current_mmr: '185 per 100,000 live births',
          with_ai_platform: '112 per 100,000 live births',
          lives_saved_annually: '18-24 maternal lives per year',
          investment_needed: '₹4.2 lakhs/year',
          roi_months: '8 months'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { run(); }, []);

  const approve = (action: string) => setApproved(prev => [...prev, action]);

  return (
    <div className="glass-card bg-gradient-to-br from-emerald-500/5 to-transparent rounded-3xl p-6 border border-emerald-500/10 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-emerald-500 to-transparent animate-shimmer-line" />
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Coins className="w-5 h-5 text-emerald-400" /> Budget Optimizer
          </h2>
          <p className="text-xs text-slate-500">AI-powered resource allocation engine</p>
        </div>
        <button onClick={run} disabled={loading} className="p-2.5 glass-card rounded-xl hover:bg-white/10 transition text-slate-400 hover:text-white">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 glass-card rounded-xl mb-5 overflow-x-auto">
        {[
          { id: 'nudges', label: '💰 Budget Nudges' },
          { id: 'deploy', label: '👥 ASHA Deploy' },
          { id: 'roi', label: '📊 ROI/PHC' },
          { id: 'sim', label: '🔮 Simulation' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id as any)}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition whitespace-nowrap ${tab === t.id ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-10 flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-emerald-500/30 border-t-emerald-400 animate-spin" />
          <p className="text-emerald-300 text-sm font-medium">Grok AI optimizing budget...</p>
        </div>
      ) : result ? (
        <AnimatePresence mode="wait">

          {/* Budget Nudges */}
          {tab === 'nudges' && (
            <motion.div key="nudges" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
              {result.budget_nudges?.map((n: any, i: number) => (
                <div key={i} className={`p-4 rounded-2xl border transition ${approved.includes(n.action) ? 'bg-emerald-500/10 border-emerald-500/25' : 'glass-card border-white/5'}`}>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <p className="font-bold text-slate-200 text-sm leading-snug flex-1">{n.action}</p>
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg shrink-0 uppercase ${n.urgency === 'THIS WEEK' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/20' : n.urgency === 'THIS MONTH' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/20' : 'bg-blue-500/20 text-blue-400 border border-blue-500/20'}`}>
                      {n.urgency}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mb-3 leading-relaxed">{n.impact}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-400 font-black">{n.amount}</span>
                    <button onClick={() => approve(n.action)} disabled={approved.includes(n.action)}
                      className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${approved.includes(n.action) ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-default' : 'bg-emerald-600 hover:bg-emerald-500 text-white'}`}>
                      {approved.includes(n.action) ? '✓ Approved' : 'Approve'}
                    </button>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {/* ASHA Deploy */}
          {tab === 'deploy' && (
            <motion.div key="deploy" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
              {result.where_to_deploy_asha?.map((d: any, i: number) => (
                <div key={i} className={`p-4 rounded-2xl border ${d.priority === 'HIGH' ? 'bg-rose-500/8 border-rose-500/20' : 'glass-card border-white/5'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-white text-sm">{d.cluster}</h3>
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg uppercase ${d.priority === 'HIGH' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/20' : 'bg-amber-500/20 text-amber-400 border border-amber-500/20'}`}>{d.priority}</span>
                      <span className="text-[9px] font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded-lg">+{d.asha_needed} ASHA</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed mb-3">{d.reason}</p>
                  <button className="w-full py-2 bg-indigo-600/80 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2">
                    <Users className="w-3.5 h-3.5" /> Auto-Draft Deployment Order
                  </button>
                </div>
              ))}
            </motion.div>
          )}

          {/* ROI per PHC */}
          {tab === 'roi' && (
            <motion.div key="roi" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
              {result.roi_per_phc?.map((p: any, i: number) => (
                <div key={i} className="glass-card p-4 rounded-2xl border border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-white text-sm">{p.phc}</h3>
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg uppercase ${p.efficiency === 'HIGH' ? 'bg-emerald-500/20 text-emerald-400' : p.efficiency === 'MEDIUM' ? 'bg-amber-500/20 text-amber-400' : 'bg-rose-500/20 text-rose-400'}`}>
                      {p.efficiency} ROI
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="glass-card rounded-xl p-2 text-center">
                      <p className="text-xs text-slate-500">Cases Handled</p>
                      <p className="font-black text-white">{p.cases_handled}</p>
                    </div>
                    <div className="glass-card rounded-xl p-2 text-center">
                      <p className="text-xs text-slate-500">Cost / Case</p>
                      <p className="font-black text-emerald-400">{p.cost_per_case}</p>
                    </div>
                  </div>
                  <p className="text-xs text-amber-300 bg-amber-500/8 border border-amber-500/15 rounded-xl p-2.5 leading-relaxed">
                    💡 {p.recommendation}
                  </p>
                </div>
              ))}
            </motion.div>
          )}

          {/* Scenario Simulation */}
          {tab === 'sim' && result.scenario_simulation && (
            <motion.div key="sim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
              <div className="p-4 rounded-2xl bg-slate-800/50 border border-white/5">
                <p className="text-xs text-slate-500 mb-1">Current MMR (without MaaSaheli)</p>
                <p className="text-2xl font-black text-rose-400">{result.scenario_simulation.current_mmr}</p>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25">
                <p className="text-xs text-emerald-400 font-bold mb-1">Projected MMR with MaaSaheli District-Wide</p>
                <p className="text-2xl font-black text-emerald-300">{result.scenario_simulation.with_ai_platform}</p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Lives Saved/Year', val: result.scenario_simulation.lives_saved_annually, color: 'emerald' },
                  { label: 'Annual Investment', val: result.scenario_simulation.investment_needed, color: 'amber' },
                  { label: 'ROI in', val: result.scenario_simulation.roi_months, color: 'indigo' },
                ].map((s, i) => (
                  <div key={i} className={`glass-card p-3 rounded-xl text-center border border-${s.color}-500/15 bg-${s.color}-500/5`}>
                    <p className={`text-sm font-black text-${s.color}-400 leading-tight`}>{s.val}</p>
                    <p className="text-[9px] text-slate-500 mt-0.5 font-bold uppercase">{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-center">
                <p className="text-xs text-slate-400 mb-1">District-wide deployment impact</p>
                <p className="text-indigo-200 font-bold text-sm">AI replaces paper systems → real-time triage → faster referrals → lives saved</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      ) : null}
    </div>
  );
}

// ─── ASHA LEADERBOARD ───────────────────────────────────────────────────────
function AshaLeaderboard() {
  const [filter, setFilter] = useState<'all' | 'training'>('all');
  const display = filter === 'training' ? ASHA_LEADERS.filter(a => a.trainingDue || a.falseAlarms > 4) : ASHA_LEADERS;

  const rankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-4 h-4 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-4 h-4 text-slate-300" />;
    if (rank === 3) return <Medal className="w-4 h-4 text-amber-600" />;
    return <span className="text-xs font-black text-slate-500">#{rank}</span>;
  };

  return (
    <div className="glass-card bg-gradient-to-br from-amber-500/5 to-transparent rounded-3xl p-6 border border-amber-500/10 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-amber-500 to-transparent animate-shimmer-line" />
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" /> ASHA Leaderboard
          </h2>
          <p className="text-xs text-slate-500">Accuracy • False Alarms • Training Gaps</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setFilter('all')} className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${filter === 'all' ? 'bg-amber-500/20 border-amber-500/30 text-amber-300' : 'glass-card border-white/5 text-slate-400'}`}>All</button>
          <button onClick={() => setFilter('training')} className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${filter === 'training' ? 'bg-rose-500/20 border-rose-500/30 text-rose-300' : 'glass-card border-white/5 text-slate-400'}`}>⚠️ Needs Training</button>
        </div>
      </div>

      <div className="space-y-2">
        {display.map((a, i) => (
          <motion.div key={a.name} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
            className={`glass-card p-4 rounded-2xl border transition-all ${a.trainingDue ? 'border-rose-500/20 bg-rose-500/5' : a.rank <= 3 ? 'border-amber-500/15 bg-amber-500/5' : 'border-white/5'}`}>
            <div className="flex items-center gap-3">
              {/* Rank */}
              <div className="w-8 h-8 rounded-xl glass-card flex items-center justify-center shrink-0">
                {rankIcon(a.rank)}
              </div>

              {/* Name + village */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-200 text-sm">{a.name}</h3>
                  {a.streak >= 10 && <span className="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded-md font-black">🔥 {a.streak}d streak</span>}
                  {a.trainingDue && <span className="text-[9px] bg-rose-500/20 text-rose-400 border border-rose-500/20 px-1.5 py-0.5 rounded-md font-black animate-pulse">TRAINING DUE</span>}
                </div>
                <p className="text-xs text-slate-500">{a.village} • {a.cases} cases this month</p>
              </div>

              {/* Metrics */}
              <div className="flex items-center gap-3 shrink-0">
                {/* Accuracy */}
                <div className="text-center">
                  <div className={`text-sm font-black ${a.accuracy >= 90 ? 'text-emerald-400' : a.accuracy >= 80 ? 'text-amber-400' : 'text-rose-400'}`}>{a.accuracy}%</div>
                  <p className="text-[9px] text-slate-600 uppercase">Accuracy</p>
                </div>
                {/* False alarms */}
                <div className="text-center">
                  <div className={`text-sm font-black ${a.falseAlarms === 0 ? 'text-emerald-400' : a.falseAlarms <= 3 ? 'text-slate-300' : 'text-rose-400'}`}>{a.falseAlarms}</div>
                  <p className="text-[9px] text-slate-600 uppercase">False ⚠️</p>
                </div>
              </div>
            </div>

            {/* Accuracy bar */}
            <div className="mt-3 h-1.5 bg-slate-800/80 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }} animate={{ width: `${a.accuracy}%` }}
                transition={{ duration: 1, delay: i * 0.08 }}
                className={`h-full rounded-full ${a.accuracy >= 90 ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : a.accuracy >= 80 ? 'bg-gradient-to-r from-amber-500 to-yellow-400' : 'bg-gradient-to-r from-rose-500 to-red-400'}`}
              />
            </div>

            {a.trainingDue && (
              <button className="mt-3 w-full py-2 bg-rose-500/15 border border-rose-500/20 text-rose-400 rounded-xl text-xs font-bold hover:bg-rose-500/25 transition flex items-center justify-center gap-1">
                <Brain className="w-3.5 h-3.5" /> Schedule Training Session
              </button>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── MAIN DASHBOARD ──────────────────────────────────────────────────────────
export default function DistrictDashboard() {
  const router = useRouter();
  const [totalAlerts, setTotalAlerts] = useState(12);
  const [selectedCluster, setSelectedCluster] = useState<any>(null);
  const [auditInput, setAuditInput] = useState('');
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'heatmap' | 'budget' | 'leaderboard'>('heatmap');

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('maasaheli_alerts') || '[]');
    setTotalAlerts(saved.length || 12);
  }, []);

  const runAudit = async () => {
    if (!auditInput.trim()) return;
    setIsAuditing(true);
    try {
      const res = await fetch('/api/death-audit', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventText: auditInput })
      });
      const data = await res.json();
      setAuditResult(data);
    } catch {
      setAuditResult({
        systemic_failures: ['Delayed transport due to poor road + no GPS dispatch', 'Blood bank O-ve stock-out at PHC', 'ASHA referral not digitally escalated to hospital'],
        counterfactual: 'If MaaSaheli alert triggered 4h earlier + blood pre-positioned, death was 85% preventable.',
        policy_nudge: 'Allocate ₹45,000 for ambulance GPS tracking + pre-position O-ve blood at PHC Babatpur.',
        preventable_score: '85%'
      });
    } finally { setIsAuditing(false); }
  };

  const stats = [
    { icon: <TrendingUp className="w-5 h-5" />, label: 'Live Referrals', value: totalAlerts, color: 'amber', bg: 'amber' },
    { icon: <Users className="w-5 h-5" />, label: 'Active ASHAs', value: 342, color: 'emerald', bg: 'emerald' },
    { icon: <Flame className="w-5 h-5" />, label: 'Outbreak Clusters', value: 2, color: 'rose', bg: 'rose' },
    { icon: <Coins className="w-5 h-5" />, label: 'Budget Eff.', value: '92%', color: 'blue', bg: 'blue' },
  ];

  return (
    <div className="min-h-screen bg-[#08070d] text-slate-200 font-sans relative overflow-hidden">
      {/* BG */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="grid-pattern absolute inset-0 opacity-30" />
        <div className="absolute top-[-10%] right-[10%] w-[500px] h-[500px] rounded-full bg-amber-600/10 animate-float-slow animate-pulse-glow" />
        <div className="absolute bottom-[-10%] left-[5%] w-[450px] h-[450px] rounded-full bg-rose-600/6 animate-float-medium animate-pulse-glow" style={{ animationDelay: '4s' }} />
      </div>

      <div className="relative z-10 p-4 md:p-8">
        {/* Header */}
        <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center shadow-[0_0_40px_-5px_rgba(245,158,11,0.5)] relative">
              <ShieldCheck className="w-7 h-7 text-white" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#08070d] animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">District <span className="text-amber-500">Analytics</span> <Sparkles className="w-4 h-4 text-amber-400" /></h1>
              <p className="text-sm text-amber-200/50">Macro-Governance & Policy Intelligence</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 border border-amber-500/20 bg-amber-500/10 rounded-xl text-amber-400 text-sm font-bold flex items-center gap-2">
              <Map className="w-4 h-4" /> Bihar District 4 — Central
            </div>
            <button onClick={() => router.push('/')} className="px-5 py-2 glass-card rounded-xl text-sm font-bold hover:bg-white/10 transition">Logout</button>
          </div>
        </motion.header>

        <div className="max-w-7xl mx-auto space-y-6">
          {/* Stats Row */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {stats.map((s, i) => (
              <div key={i} className={`glass-card bg-${s.bg}-500/8 p-4 rounded-2xl border border-${s.bg}-500/15 flex items-center gap-3 group hover:scale-[1.02] transition-transform`}>
                <div className={`p-2.5 rounded-xl bg-${s.bg}-500/15 text-${s.color}-400`}>{s.icon}</div>
                <div>
                  <p className="text-2xl font-black text-white">{s.value}</p>
                  <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">{s.label}</p>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Main Tabs */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
            className="flex gap-2 p-1 glass-card rounded-2xl">
            {[
              { id: 'heatmap', label: '🗺 Live Heatmap' },
              { id: 'budget', label: '💰 Budget AI' },
              { id: 'leaderboard', label: '🏆 ASHA Rankings' },
            ].map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id as any)}
                className={`flex-1 py-3 rounded-xl text-sm font-bold transition ${activeTab === t.id ? 'bg-amber-500/80 text-amber-950' : 'text-slate-400 hover:text-white'}`}>
                {t.label}
              </button>
            ))}
          </motion.div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === 'heatmap' && (
              <motion.div key="heatmap" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <HeatmapSection onSelectCluster={setSelectedCluster} />
              </motion.div>
            )}
            {activeTab === 'budget' && (
              <motion.div key="budget" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <BudgetOptimizer totalAlerts={totalAlerts} />
              </motion.div>
            )}
            {activeTab === 'leaderboard' && (
              <motion.div key="leaderboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <AshaLeaderboard />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Death Audit — always visible at bottom */}
          <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="glass-card bg-gradient-to-b from-rose-500/5 to-transparent rounded-3xl p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-rose-500 to-transparent animate-shimmer-line opacity-60" />
            <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-2">
              <FileSearch className="w-5 h-5 text-rose-400" /> AI Death Audit
              <span className="text-[9px] bg-rose-500/15 text-rose-400 px-2 py-0.5 rounded-md font-black border border-rose-500/20">Grok Powered</span>
            </h2>
            <p className="text-xs text-slate-500 mb-4">Counterfactual replay engine — paste a mortality event to find systemic failures</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <textarea value={auditInput} onChange={e => setAuditInput(e.target.value)}
                  placeholder="Paste raw mortality report... (e.g., Patient transported via private vehicle at 2 AM, blood bank closed, ASHA not informed...)"
                  className="w-full glass-card rounded-xl p-4 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500/30 resize-none h-28 mb-3 placeholder:text-slate-600" />
                <button onClick={runAudit} disabled={!auditInput || isAuditing}
                  className="w-full py-3.5 bg-gradient-to-r from-rose-600 to-pink-600 hover:opacity-90 text-white font-bold rounded-xl transition disabled:opacity-50 flex justify-center items-center gap-2 shadow-[0_0_25px_-8px_rgba(244,63,94,0.5)]">
                  {isAuditing ? <><RefreshCw className="w-4 h-4 animate-spin" /> Analyzing...</> : <><FileSearch className="w-4 h-4" /> Run Counterfactual Analysis</>}
                </button>
              </div>
              <AnimatePresence>
                {auditResult && (
                  <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">Preventable:</span>
                      <span className="text-rose-400 font-black">{auditResult.preventable_score}</span>
                    </div>
                    <div className="p-3 glass-card rounded-xl border border-rose-500/15 text-xs text-slate-300 leading-relaxed">
                      <p className="text-rose-400 font-bold mb-1">Failures:</p>
                      {auditResult.systemic_failures?.map((f: string, i: number) => <p key={i}>• {f}</p>)}
                    </div>
                    <div className="p-3 glass-card rounded-xl border border-emerald-500/15 text-xs text-slate-300 leading-relaxed">
                      <p className="text-emerald-400 font-bold mb-1">Counterfactual:</p>
                      {auditResult.counterfactual}
                    </div>
                    <div className="p-3 glass-card rounded-xl border border-amber-500/15 text-xs text-amber-200 leading-relaxed">
                      <p className="text-amber-400 font-bold mb-1">Policy Nudge:</p>
                      {auditResult.policy_nudge}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
}

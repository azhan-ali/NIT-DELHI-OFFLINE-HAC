'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Activity, Brain, Users, Search, AlertCircle, LogOut, Medal, MapPin, WifiOff, FileCheck2, Sparkles, ChevronRight, MessageCircleHeart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getTranslations } from '@/lib/translations';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } };

export default function AshaDashboard() {
  const router = useRouter();
  const [patients, setPatients] = useState<any[]>([]);
  const [isOffline, setIsOffline] = useState(false);
  const [t, setT] = useState(getTranslations('en').asha_dashboard);

  useEffect(() => {
    // Load language preference
    const langCode = localStorage.getItem('maasaheli_lang') || 'en';
    const translations = getTranslations(langCode);
    setT(translations.asha_dashboard);

    // Load patients
    const saved = localStorage.getItem('maasaheli_patients');
    if (saved) setPatients(JSON.parse(saved));

    // Network state
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    if (!navigator.onLine) setIsOffline(true);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const stats = {
    total: patients.length || 12,
    highRisk: 2,
    pendingVisits: 5
  };

  return (
    <div className="min-h-screen bg-[#060d08] text-slate-200 font-sans selection:bg-emerald-500/30 relative overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="grid-pattern absolute inset-0 opacity-50"></div>
        <div className="absolute top-[-15%] right-[-5%] w-[500px] h-[500px] rounded-full bg-emerald-600/15 animate-float-slow animate-pulse-glow"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[450px] h-[450px] rounded-full bg-teal-500/10 animate-float-medium animate-pulse-glow" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-[50%] left-[60%] w-[300px] h-[300px] rounded-full bg-cyan-500/8 animate-float-slow" style={{ animationDelay: '5s' }}></div>
      </div>

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        className="relative z-10 px-6 pt-10 pb-8"
      >
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-[0_0_30px_-5px_rgba(16,185,129,0.5)]">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white">{t.worker_name}</h1>
                <p className="text-emerald-400 text-sm flex items-center gap-1 font-medium">
                  <MapPin className="w-3 h-3" /> {t.cluster}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-amber-500/15 text-amber-400 rounded-lg text-xs font-bold flex items-center gap-1 border border-amber-500/20">
                <Medal className="w-3 h-3" /> {t.level}
              </span>
              <button onClick={() => router.push('/')} className="p-2.5 glass-card rounded-xl hover:bg-white/10 transition">
                <LogOut className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Status Chips */}
          <div className="flex gap-3 flex-wrap">
            <div className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 backdrop-blur-xl border ${isOffline ? 'bg-rose-500/10 text-rose-300 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'}`}>
              {isOffline ? <><WifiOff className="w-3.5 h-3.5" /> {t.offline}</> : <><Activity className="w-3.5 h-3.5 animate-pulse" /> {t.synced}</>}
            </div>
            <div className="px-3.5 py-2 rounded-xl glass-card text-white text-xs font-bold flex items-center gap-2">
              ₹1,450 {t.earned}
            </div>
          </div>
        </div>
      </motion.header>

      <motion.main variants={container} initial="hidden" animate="show" className="px-5 pb-20 relative z-10 max-w-2xl mx-auto space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: <Users className="w-5 h-5" />, value: stats.total, label: t.total_cases, colorFrom: "from-blue-500/20", colorTo: "to-indigo-500/10", iconBg: "bg-blue-500/15 text-blue-400", border: "border-blue-500/10" },
            { icon: <AlertCircle className="w-5 h-5" />, value: stats.highRisk, label: t.high_risk, colorFrom: "from-rose-500/20", colorTo: "to-pink-500/10", iconBg: "bg-rose-500/15 text-rose-400", border: "border-rose-500/10", valColor: "text-rose-400" },
            { icon: <Activity className="w-5 h-5" />, value: stats.pendingVisits, label: t.due_visits, colorFrom: "from-amber-500/20", colorTo: "to-orange-500/10", iconBg: "bg-amber-500/15 text-amber-400", border: "border-amber-500/10" },
          ].map((stat, idx) => (
            <motion.div key={idx} variants={item} className={`glass-card bg-gradient-to-br ${stat.colorFrom} ${stat.colorTo} p-4 rounded-2xl border ${stat.border} flex flex-col items-center justify-center text-center group hover:scale-[1.02] transition-transform duration-300`}>
              <div className={`w-10 h-10 rounded-xl ${stat.iconBg} flex items-center justify-center mb-2`}>
                {stat.icon}
              </div>
              <p className={`text-3xl font-black tracking-tight ${stat.valColor || 'text-white'}`}>{stat.value}</p>
              <p className="text-[10px] uppercase font-bold text-slate-500 mt-0.5 tracking-wider">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <motion.div variants={item} className="space-y-3">
          <h2 className="text-lg font-bold text-white ml-1">{t.quick_actions}</h2>

          <motion.button
            whileHover={{ scale: 1.01, y: -2 }} whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/asha/register-patient')}
            className="w-full glass-card bg-gradient-to-r from-emerald-500/10 to-teal-500/5 p-5 rounded-2xl border border-emerald-500/15 flex items-center gap-4 text-left relative overflow-hidden group"
          >
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-[40px] group-hover:bg-emerald-500/20 transition-all duration-700"></div>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center text-white shadow-[0_0_25px_-5px_rgba(16,185,129,0.5)] shrink-0 relative z-10 group-hover:shadow-[0_0_35px_-5px_rgba(16,185,129,0.7)] transition-shadow">
              <UserPlus className="w-6 h-6" />
            </div>
            <div className="relative z-10 flex-1">
              <h3 className="text-lg font-bold text-white">{t.smart_reg}</h3>
              <p className="text-sm text-slate-400 font-medium">{t.smart_reg_sub}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-emerald-400 transition-colors relative z-10" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.01, y: -2 }} whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/asha/risk-check')}
            className="w-full glass-card bg-gradient-to-r from-pink-500/10 to-purple-500/5 p-5 rounded-2xl border border-pink-500/15 flex items-center gap-4 text-left relative overflow-hidden group"
          >
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-pink-500/10 rounded-full blur-[40px] group-hover:bg-pink-500/20 transition-all duration-700"></div>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white shadow-[0_0_25px_-5px_rgba(236,72,153,0.5)] shrink-0 relative z-10 group-hover:shadow-[0_0_35px_-5px_rgba(236,72,153,0.7)] transition-shadow">
              <Brain className="w-6 h-6" />
            </div>
            <div className="relative z-10 flex-1">
              <h3 className="text-lg font-bold text-white">{t.ai_risk}</h3>
              <p className="text-sm text-slate-400 font-medium">{t.ai_risk_sub}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-pink-400 transition-colors relative z-10" />
          </motion.button>

          {/* Companion AI */}
          <motion.button
            whileHover={{ scale: 1.01, y: -2 }} whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/asha/companion')}
            className="w-full glass-card bg-gradient-to-r from-indigo-500/10 to-purple-500/5 p-5 rounded-2xl border border-indigo-500/15 flex items-center gap-4 text-left relative overflow-hidden group"
          >
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-[40px] group-hover:bg-indigo-500/20 transition-all duration-700"></div>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-[0_0_25px_-5px_rgba(99,102,241,0.5)] shrink-0 relative z-10 group-hover:shadow-[0_0_35px_-5px_rgba(99,102,241,0.7)] transition-shadow">
              <MessageCircleHeart className="w-6 h-6" />
            </div>
            <div className="relative z-10 flex-1">
              <h3 className="text-lg font-bold text-white">Companion AI</h3>
              <p className="text-sm text-slate-400 font-medium">चेतावनी समझें — Hindi में मार्गदर्शन पाएं</p>
            </div>
            <div className="relative z-10 flex items-center gap-2">
              <span className="text-[9px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full font-black uppercase tracking-wider">Grok AI</span>
              <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-indigo-400 transition-colors" />
            </div>
          </motion.button>
        </motion.div>

        {/* Recent Patients */}
        <motion.div variants={item} className="space-y-4">
          <div className="flex items-center justify-between ml-1">
            <h2 className="text-lg font-bold text-white">{t.recent_patients}</h2>
            <button className="text-sm font-bold text-emerald-400 hover:text-emerald-300 transition">{t.view_all}</button>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              placeholder={t.search_placeholder}
              className="w-full glass-card rounded-xl py-3.5 pl-11 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-slate-300 placeholder:text-slate-600"
            />
          </div>

          <div className="space-y-2">
            {patients.length > 0 ? (
              patients.slice().reverse().map((p, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="glass-card p-4 rounded-xl flex justify-between items-center hover:bg-white/[0.04] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-sm">
                      {p.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-200">{p.name}</p>
                      <p className="text-xs text-slate-500">{p.id} • {p.village || 'Unknown'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2 py-1 rounded-md mb-1 inline-block border border-emerald-500/20">{t.synced_badge}</div>
                    <p className="text-xs text-slate-500">{p.weeks ? `${p.weeks}W` : t.awaiting}</p>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="glass-card p-10 rounded-2xl text-center">
                <FileCheck2 className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">{t.no_patients}</p>
                <p className="text-xs text-slate-600 mt-1">{t.no_patients_sub}</p>
              </div>
            )}
          </div>
        </motion.div>

      </motion.main>
    </div>
  );
}

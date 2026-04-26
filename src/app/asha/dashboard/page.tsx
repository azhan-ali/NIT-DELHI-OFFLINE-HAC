'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Activity, Brain, Users, Search, AlertCircle, LogOut, Medal, MapPin, WifiOff, FileCheck2, Sparkles, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } };

// ── 5 fake patients (pre-seeded) ─────────────────────────────────────────────
const FAKE_PATIENTS = [
  {
    id: 'PAT-1021', name: 'Sunita Devi', age: '24', village: 'Babatpur', mobile: '9876500001',
    husbandName: 'Ramesh Kumar', bloodGroup: 'O+', ancNumber: 'ANC-4421',
    lmp: '2025-10-15', weeks: '26', trimester: '2nd',
    prevPregnancies: '1', prevDeliveryType: ['Normal'],
    ashaName: 'Sneha Devi (Demo)', phc: 'PHC Ramgarh',
    registrationDate: '2026-01-10',
    riskLevel: 'LOW', riskScore: 2,
  },
  {
    id: 'PAT-2034', name: 'Rekha Kumari', age: '28', village: 'Ramnagar', mobile: '9876500002',
    husbandName: 'Suresh Lal', bloodGroup: 'B+', ancNumber: 'ANC-4422',
    lmp: '2025-09-01', weeks: '33', trimester: '3rd',
    prevPregnancies: '2', prevDeliveryType: ['Normal', 'C-Section'],
    ashaName: 'Sneha Devi (Demo)', phc: 'PHC Ramgarh',
    registrationDate: '2026-01-18',
    riskLevel: 'MEDIUM', riskScore: 5,
  },
  {
    id: 'PAT-3056', name: 'Geeta Rani', age: '21', village: 'Lahartara', mobile: '9876500003',
    husbandName: 'Mohan Singh', bloodGroup: 'A+', ancNumber: 'ANC-4423',
    lmp: '2025-08-10', weeks: '37', trimester: '3rd',
    prevPregnancies: '0', prevDeliveryType: [],
    ashaName: 'Sneha Devi (Demo)', phc: 'PHC Ramgarh',
    registrationDate: '2026-01-25',
    riskLevel: 'HIGH', riskScore: 8,
    lakshan: ['पैरों में सूजन', 'सिर दर्द', 'उच्च रक्तचाप'],
  },
  {
    id: 'PAT-4078', name: 'Poonam Verma', age: '30', village: 'Sarnath', mobile: '9876500004',
    husbandName: 'Dinesh Verma', bloodGroup: 'AB+', ancNumber: 'ANC-4424',
    lmp: '2025-11-20', weeks: '19', trimester: '2nd',
    prevPregnancies: '3', prevDeliveryType: ['Normal'],
    ashaName: 'Sneha Devi (Demo)', phc: 'PHC Ramgarh',
    registrationDate: '2026-02-02',
    riskLevel: 'LOW', riskScore: 1,
  },
  {
    id: 'PAT-5091', name: 'Anita Singh', age: '26', village: 'Manduadih', mobile: '9876500005',
    husbandName: 'Rajesh Singh', bloodGroup: 'O-', ancNumber: 'ANC-4425',
    lmp: '2025-08-25', weeks: '35', trimester: '3rd',
    prevPregnancies: '1', prevDeliveryType: ['C-Section'],
    ashaName: 'Sneha Devi (Demo)', phc: 'PHC Ramgarh',
    registrationDate: '2026-02-10',
    riskLevel: 'HIGH', riskScore: 7,
    lakshan: ['योनि से खून आना', 'बहुत कम हलचल', 'बुखार'],
  },
];

export default function AshaDashboard() {
  const router = useRouter();
  const [patients, setPatients] = useState<any[]>([]);
  const [isOffline, setIsOffline] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Seed fake patients if localStorage is empty
    const saved = localStorage.getItem('maasaheli_patients');
    const existing: any[] = saved ? JSON.parse(saved) : [];
    const fakeIds = FAKE_PATIENTS.map(p => p.id);
    const alreadySeeded = fakeIds.every(id => existing.some((p: any) => p.id === id));
    if (!alreadySeeded) {
      const merged = [...FAKE_PATIENTS, ...existing.filter((p: any) => !fakeIds.includes(p.id))];
      localStorage.setItem('maasaheli_patients', JSON.stringify(merged));
      setPatients(merged);
    } else {
      setPatients(existing);
    }

    // Also seed alerts for high-risk patients so hospital can see them
    const alerts = JSON.parse(localStorage.getItem('maasaheli_alerts') || '[]');
    const highRisk = FAKE_PATIENTS.filter(p => p.riskLevel === 'HIGH');
    const alertIds = alerts.map((a: any) => a.patientId);
    const newAlerts = highRisk
      .filter(p => !alertIds.includes(p.id))
      .map(p => ({ patientId: p.id, name: p.name, timestamp: new Date().toISOString(), reason: p.lakshan?.[0] || 'High Risk' }));
    if (newAlerts.length > 0) {
      localStorage.setItem('maasaheli_alerts', JSON.stringify([...alerts, ...newAlerts]));
    }

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

  const filtered = patients.filter(p =>
    p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.id?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: patients.length,
    highRisk: patients.filter(p => p.riskLevel === 'HIGH').length,
    pendingVisits: patients.filter(p => p.riskLevel === 'MEDIUM' || p.riskLevel === 'HIGH').length,
  };

  const riskBadge = (level: string) => {
    if (level === 'HIGH') return 'bg-rose-500/15 text-rose-400 border-rose-500/20';
    if (level === 'MEDIUM') return 'bg-amber-500/15 text-amber-400 border-amber-500/20';
    return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20';
  };

  return (
    <div className="min-h-screen bg-[#060d08] text-slate-200 font-sans selection:bg-emerald-500/30 relative overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="grid-pattern absolute inset-0 opacity-50"></div>
        <div className="absolute top-[-15%] right-[-5%] w-[500px] h-[500px] rounded-full bg-emerald-600/15 animate-float-slow animate-pulse-glow"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[450px] h-[450px] rounded-full bg-teal-500/10 animate-float-medium animate-pulse-glow" style={{ animationDelay: '2s' }}></div>
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
                <h1 className="text-2xl font-bold tracking-tight text-white">Sneha Devi</h1>
                <p className="text-emerald-400 text-sm flex items-center gap-1 font-medium">
                  <MapPin className="w-3 h-3" /> Babatpur Cluster
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-amber-500/15 text-amber-400 rounded-lg text-xs font-bold flex items-center gap-1 border border-amber-500/20">
                <Medal className="w-3 h-3" /> Level 3
              </span>
              <button onClick={() => router.push('/')} className="p-2.5 glass-card rounded-xl hover:bg-white/10 transition">
                <LogOut className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Status Chips */}
          <div className="flex gap-3 flex-wrap">
            <div className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 backdrop-blur-xl border ${isOffline ? 'bg-rose-500/10 text-rose-300 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'}`}>
              {isOffline ? <><WifiOff className="w-3.5 h-3.5" /> ऑफलाइन</> : <><Activity className="w-3.5 h-3.5 animate-pulse" /> डेटा सिंक हो गया</>}
            </div>
            <div className="px-3.5 py-2 rounded-xl glass-card text-white text-xs font-bold flex items-center gap-2">
              ₹1,450 कमाई
            </div>
          </div>
        </div>
      </motion.header>

      <motion.main variants={container} initial="hidden" animate="show" className="px-5 pb-24 relative z-10 max-w-2xl mx-auto space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: <Users className="w-5 h-5" />, value: stats.total, label: 'कुल मरीज़', colorFrom: "from-blue-500/20", colorTo: "to-indigo-500/10", iconBg: "bg-blue-500/15 text-blue-400", border: "border-blue-500/10" },
            { icon: <AlertCircle className="w-5 h-5" />, value: stats.highRisk, label: 'खतरा (High Risk)', colorFrom: "from-rose-500/20", colorTo: "to-pink-500/10", iconBg: "bg-rose-500/15 text-rose-400", border: "border-rose-500/10", valColor: "text-rose-400" },
            { icon: <Activity className="w-5 h-5" />, value: stats.pendingVisits, label: 'जाँच बाकी', colorFrom: "from-amber-500/20", colorTo: "to-orange-500/10", iconBg: "bg-amber-500/15 text-amber-400", border: "border-amber-500/10" },
          ].map((stat, idx) => (
            <motion.div key={idx} variants={item} className={`glass-card bg-gradient-to-br ${stat.colorFrom} ${stat.colorTo} p-4 rounded-2xl border ${stat.border} flex flex-col items-center justify-center text-center group hover:scale-[1.02] transition-transform duration-300`}>
              <div className={`w-10 h-10 rounded-xl ${stat.iconBg} flex items-center justify-center mb-2`}>
                {stat.icon}
              </div>
              <p className={`text-3xl font-black tracking-tight ${(stat as any).valColor || 'text-white'}`}>{stat.value}</p>
              <p className="text-[10px] uppercase font-bold text-slate-500 mt-0.5 tracking-wider">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <motion.div variants={item} className="space-y-3">
          <h2 className="text-lg font-bold text-white ml-1">जल्दी करें</h2>

          {/* नई माँ जोड़ें */}
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
              <h3 className="text-lg font-bold text-white">नई माँ जोड़ें</h3>
              <p className="text-sm text-slate-400 font-medium">मरीज़ का नाम, गाँव और जानकारी दर्ज करें</p>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-emerald-400 transition-colors relative z-10" />
          </motion.button>

          {/* स्वास्थ्य जाँच */}
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
              <h3 className="text-lg font-bold text-white">स्वास्थ्य जाँच करें</h3>
              <p className="text-sm text-slate-400 font-medium">लक्षण देखें — खतरा है या नहीं पता करें</p>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-pink-400 transition-colors relative z-10" />
          </motion.button>
        </motion.div>

        {/* Patient List */}
        <motion.div variants={item} className="space-y-4">
          <div className="flex items-center justify-between ml-1">
            <h2 className="text-lg font-bold text-white">मरीज़ों की सूची</h2>
            <span className="text-xs text-slate-500 font-bold">{patients.length} total</span>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="नाम या ID से खोजें..."
              className="w-full glass-card rounded-xl py-3.5 pl-11 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-slate-300 placeholder:text-slate-600"
            />
          </div>

          <div className="space-y-2">
            {filtered.length > 0 ? (
              filtered.slice().reverse().map((p, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="glass-card p-4 rounded-xl flex justify-between items-center hover:bg-white/[0.04] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-sm">
                      {p.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-200">{p.name}</p>
                      <p className="text-xs text-slate-500">{p.id} • {p.village || 'अज्ञात'}</p>
                      {p.lakshan && p.lakshan.length > 0 && (
                        <p className="text-[10px] text-rose-400 mt-0.5">{p.lakshan.slice(0, 2).join(', ')}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    {p.riskLevel ? (
                      <span className={`text-[10px] font-black px-2 py-1 rounded-md inline-block border ${riskBadge(p.riskLevel)}`}>
                        {p.riskLevel === 'HIGH' ? '⚠ खतरा' : p.riskLevel === 'MEDIUM' ? '⚡ सावधान' : '✓ ठीक'}
                      </span>
                    ) : (
                      <span className="bg-slate-700/50 text-slate-400 text-[10px] font-bold px-2 py-1 rounded-md inline-block border border-slate-600/30">जाँच बाकी</span>
                    )}
                    <p className="text-xs text-slate-500 mt-1">{p.weeks ? `${p.weeks} सप्ताह` : ''}</p>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="glass-card p-10 rounded-2xl text-center">
                <FileCheck2 className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">कोई मरीज़ नहीं मिला</p>
                <p className="text-xs text-slate-600 mt-1">ऊपर से नई माँ जोड़ें</p>
              </div>
            )}
          </div>
        </motion.div>

      </motion.main>
    </div>
  );
}

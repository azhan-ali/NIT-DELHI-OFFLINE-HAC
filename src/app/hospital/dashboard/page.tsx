'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Hospital, Bed, Activity, Thermometer, Truck, AlertOctagon, Phone, ArrowUpRight, Droplet, Package, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } };

export default function HospitalDashboard() {
  const router = useRouter();
  const [incomingPatients, setIncomingPatients] = useState<any[]>([]);

  useEffect(() => {
    const savedAlerts = JSON.parse(localStorage.getItem('maasaheli_alerts') || '[]');
    let patientsList = [];
    
    if (savedAlerts.length > 0) {
      patientsList = savedAlerts.map((a: any, i: number) => ({
        id: a.patientId,
        name: a.name,
        eta: Math.floor(Math.random() * 20) + 10,
        reason: i === 0 ? 'Severe Preeclampsia' : 'PPH Risk - Rapid Bleeding',
        from: 'ASHA Sneha Devi'
      }));
    } else {
      patientsList = [
        { id: 'PAT-4029', name: 'Rani Kumari', eta: 12, reason: 'Severe Preeclampsia BP 180/120', from: 'Dr. Anjali (Teleconsult)' },
        { id: 'PAT-8112', name: 'Sunita Meena', eta: 28, reason: 'Obstructed Labor', from: 'PHC Sub-center 4' }
      ];
    }
    
    patientsList.sort((a, b) => a.eta - b.eta);
    setIncomingPatients(patientsList);
  }, []);

  const beds = [
    { label: 'General Maternity', total: 40, occupied: 32 },
    { label: 'SNCU / NICU', total: 15, occupied: 14 },
    { label: 'Operating Theaters', total: 4, occupied: 2 },
  ];

  return (
    <div className="min-h-screen bg-[#0a0604] text-slate-200 font-sans relative overflow-hidden">
      
      {/* ===== ANIMATED BACKGROUND ===== */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="grid-pattern absolute inset-0 opacity-30"></div>
        <div className="absolute top-[-10%] right-[5%] w-[550px] h-[550px] rounded-full bg-orange-600/10 animate-float-slow animate-pulse-glow"></div>
        <div className="absolute bottom-[-15%] left-[-5%] w-[500px] h-[500px] rounded-full bg-red-600/8 animate-float-medium animate-pulse-glow" style={{ animationDelay: '3s' }}></div>
        <div className="absolute top-[50%] left-[40%] w-[300px] h-[300px] rounded-full bg-amber-500/6 animate-float-slow" style={{ animationDelay: '6s' }}></div>
      </div>

      <div className="relative z-10 p-4 md:p-8">
        {/* ===== HEADER ===== */}
        <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-[0_0_40px_-5px_rgba(249,115,22,0.5)] relative">
              <Hospital className="w-7 h-7 text-white" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#0a0604] animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">Hospital <span className="text-orange-500">Command</span> <Sparkles className="w-5 h-5 text-orange-400" /></h1>
              <p className="text-sm text-orange-200/50 font-medium tracking-wide">Resource & Admissions Logistics</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="px-4 py-2 border border-emerald-500/20 bg-emerald-500/10 rounded-xl text-emerald-400 text-sm font-bold flex items-center gap-2 backdrop-blur-xl">
              <Activity className="w-4 h-4 animate-pulse" /> NETWORK ONLINE
            </div>
            <button onClick={() => router.push('/')} className="px-5 py-2 glass-card rounded-xl text-sm font-bold hover:bg-white/10 transition">
              Logout
            </button>
          </div>
        </motion.header>

        <motion.main variants={container} initial="hidden" animate="show" className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* ===== LEFT: OCCUPANCY & RESOURCES ===== */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            <motion.section variants={item} className="glass-card bg-gradient-to-br from-orange-500/5 to-transparent rounded-3xl p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-orange-500 to-transparent animate-shimmer-line"></div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
                <Bed className="w-6 h-6 text-orange-400" /> Live Bed Occupancy
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {beds.map((bed, idx) => {
                  const perc = Math.round((bed.occupied / bed.total) * 100);
                  const isCritical = perc > 90;
                  
                  return (
                    <motion.div 
                      key={bed.label}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      className={`glass-card rounded-2xl p-5 relative overflow-hidden group hover:scale-[1.02] transition-transform ${isCritical ? 'border-rose-500/20 shadow-[inset_0_0_30px_-10px_rgba(244,63,94,0.15)]' : ''}`}
                    >
                      {isCritical && <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 to-red-500 animate-pulse"></div>}
                      <p className="text-sm font-bold text-slate-400 mb-3">{bed.label}</p>
                      <div className="flex items-end gap-2 mb-4">
                        <span className="text-4xl font-black text-white tracking-tighter">{bed.occupied}</span>
                        <span className="text-sm text-slate-600 font-medium mb-1">/ {bed.total}</span>
                      </div>
                      <div className="w-full bg-slate-800/80 rounded-full h-3 overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }} 
                          animate={{ width: `${perc}%` }} 
                          transition={{ duration: 1.2, delay: idx * 0.2, ease: "easeOut" }}
                          className={`h-full rounded-full ${isCritical ? 'bg-gradient-to-r from-rose-500 to-red-500 shadow-[0_0_15px_rgba(244,63,94,0.5)]' : 'bg-gradient-to-r from-orange-500 to-amber-500 shadow-[0_0_15px_rgba(249,115,22,0.3)]'}`}
                        ></motion.div>
                      </div>
                      {isCritical && <p className="text-xs text-rose-400 font-bold mt-3 uppercase tracking-wider flex items-center gap-1"><AlertOctagon className="w-3 h-3"/> Critical Capacity</p>}
                    </motion.div>
                  );
                })}
              </div>
            </motion.section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Blood Bank */}
              <motion.section variants={item} className="glass-card bg-gradient-to-br from-red-500/8 to-transparent rounded-3xl p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-40 h-40 bg-red-500/8 rounded-full blur-[60px] pointer-events-none group-hover:bg-red-500/15 transition-all duration-700"></div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-5">
                  <Droplet className="w-5 h-5 text-red-500" /> Blood Bank
                </h2>
                <div className="space-y-3">
                  {[
                    { type: 'O Negative', units: 2, status: 'CRITICAL' },
                    { type: 'O Positive', units: 14, status: 'OK' },
                    { type: 'A Positive', units: 8, status: 'LOW' }
                  ].map(b => (
                    <div key={b.type} className="flex items-center justify-between p-3 rounded-xl glass-card group/row hover:bg-white/[0.03] transition">
                      <span className="font-bold text-slate-300 text-sm">{b.type}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-white">{b.units}</span>
                        <span className={`text-[9px] uppercase font-black tracking-widest px-2 py-0.5 rounded-md ${
                          b.status === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/20' : b.status === 'LOW' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/20' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
                        }`}>{b.status}</span>
                      </div>
                    </div>
                  ))}
                  <button className="w-full mt-3 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-bold rounded-xl transition-all text-sm flex items-center justify-center gap-2 hover:shadow-[0_0_20px_-5px_rgba(239,68,68,0.3)]">
                    <Phone className="w-4 h-4" /> Auto-Restock Protocol
                  </button>
                </div>
              </motion.section>

              {/* Drug Inventory */}
              <motion.section variants={item} className="glass-card bg-gradient-to-br from-orange-500/8 to-transparent rounded-3xl p-6">
                <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-5">
                  <Thermometer className="w-5 h-5 text-orange-400" /> Drug Stock
                </h2>
                <div className="space-y-3">
                  {[
                    { name: 'Oxytocin Ampoules', stock: '450', days: '12 days left', alert: false },
                    { name: 'Misoprostol 200mcg', stock: '85', days: '2 days (URGENT)', alert: true },
                    { name: 'Magnesium Sulfate', stock: '220', days: '45 days left', alert: false }
                  ].map(d => (
                    <div key={d.name} className={`flex items-start gap-3 p-3 rounded-xl glass-card ${d.alert ? 'border-rose-500/20 bg-rose-500/5' : ''}`}>
                      <div className={`p-2 rounded-lg ${d.alert ? 'bg-rose-500/15 text-rose-400' : 'bg-slate-800/80 text-slate-400'}`}>
                        <Package className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-200">{d.name}</h4>
                        <div className="flex gap-2 text-xs mt-1">
                          <span className="text-white font-bold">{d.stock} units</span>
                          <span className={d.alert ? 'text-rose-400 font-bold' : 'text-slate-500'}>{d.days}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.section>
            </div>
          </div>

          {/* ===== RIGHT: SMART ADMISSION ===== */}
          <motion.div variants={item} className="lg:col-span-4 flex flex-col h-full">
            <section className="glass-card bg-gradient-to-b from-indigo-500/8 to-transparent rounded-3xl p-6 flex-grow relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent animate-shimmer-line"></div>
              
              <h2 className="text-xl font-bold text-white flex items-center justify-between mb-2">
                <span className="flex items-center gap-2"><Truck className="w-5 h-5 text-indigo-400" /> Smart Admission</span>
                <span className="bg-indigo-500/15 text-indigo-300 text-[10px] px-2.5 py-1 rounded-lg font-bold border border-indigo-500/20">{incomingPatients.length} INCOMING</span>
              </h2>
              <p className="text-sm text-slate-500 mb-6">Ambulance ETA & Critical Incoming</p>

              <div className="space-y-4 relative z-10">
                {incomingPatients.map((patient, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.15 }}
                    key={idx} 
                    className={`p-4 rounded-2xl glass-card relative overflow-hidden group ${
                      patient.eta < 15 ? 'border-rose-500/30 bg-rose-950/20 shadow-[0_0_40px_-15px_rgba(244,63,94,0.3)]' : 'border-indigo-500/20 bg-indigo-950/10'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-lg text-white">{patient.name}</h3>
                        <p className="text-xs text-slate-500">ID: {patient.id}</p>
                      </div>
                      <div className="text-right">
                        <div className={`text-3xl font-black ${patient.eta < 15 ? 'text-rose-400 animate-pulse' : 'text-indigo-400'}`}>
                          {patient.eta}<span className="text-xs font-bold ml-0.5">m</span>
                        </div>
                        <p className="text-[9px] uppercase font-bold text-slate-600 tracking-widest">Live ETA</p>
                      </div>
                    </div>

                    <div className={`p-2.5 rounded-xl text-xs font-medium mb-4 ${patient.eta < 15 ? 'bg-rose-500/10 text-rose-200 border border-rose-500/20' : 'bg-slate-900/50 text-indigo-200 border border-indigo-500/10'}`}>
                      <span className="font-bold uppercase opacity-60 mr-1">Alert:</span> {patient.reason}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <button className="py-2.5 glass-card hover:bg-white/10 text-white font-bold rounded-xl flex items-center justify-center gap-1 transition">
                        Auto-Prep OT
                      </button>
                      <button className="py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center justify-center gap-1 transition shadow-[0_0_15px_-5px_rgba(99,102,241,0.4)]">
                        Transfer <ArrowUpRight className="w-3 h-3" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-white/5">
                <button className="w-full py-4 glass-card hover:bg-white/[0.04] rounded-2xl text-sm font-medium text-slate-300 transition flex items-center justify-between px-5 group">
                  <span>Find Nearest NICU Bed</span>
                  <ArrowUpRight className="w-4 h-4 opacity-30 group-hover:opacity-100 transition" />
                </button>
              </div>
            </section>
          </motion.div>

        </motion.main>
      </div>
    </div>
  );
}

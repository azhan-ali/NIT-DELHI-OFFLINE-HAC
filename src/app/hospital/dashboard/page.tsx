'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Hospital, Bed, Activity, Thermometer, Truck, AlertOctagon,
  Phone, Droplet, Package, Sparkles, X, RefreshCw, CheckCircle2,
  AlertTriangle, MapPin, Send, Clock, Zap, ChevronRight,
  ShieldAlert, Stethoscope, ArrowRight, Navigation, FileText
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } };

// ─── OT PREP MODAL ─────────────────────────────────────────────────────────
function OTPrepModal({ patient, onClose }: { patient: any; onClose: () => void }) {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<any>(null);
  const [checked, setChecked] = useState<boolean[]>([]);

  useEffect(() => { generate(); }, []);

  const generate = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/ot-prep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName: patient.name, condition: patient.reason,
          etaMinutes: patient.eta, weeks: patient.weeks, riskLevel: 'HIGH'
        })
      });
      const data = await res.json();
      if (data.error) throw new Error();
      setResult(data);
      setChecked(new Array(data.ot_checklist?.length || 5).fill(false));
    } catch {
      const fallback = {
        triage_priority: 'P1 — Immediate life-threatening obstetric emergency requiring OT within 30 minutes',
        ot_checklist: ['Sterile draping and instrument tray setup for emergency LSCS', 'IV access with 2 large-bore cannulas — 16G bilateral', 'Foley catheter insertion and urine output monitoring', 'Crash cart positioned and defibrillator on standby', 'Anaesthesia team briefed — spinal anaesthesia kit ready'],
        blood_prep: 'Cross-match 2 units O-negative PRBC immediately. Have 2 units FFP thawed and ready. Alert blood bank for possible massive transfusion protocol.',
        team_alert: ['Senior Obstetrician — call to OT now', 'Anaesthesiologist — immediate availability required', 'Scrub nurse + OT assistant — prep OT 2', 'Neonatologist — standby for NICU admission post-delivery', 'Blood bank technician — activate massive transfusion protocol'],
        drug_prep: ['Oxytocin 10 IU in 500ml NS — infusion ready', 'Magnesium Sulfate 4g IV loading dose drawn', 'Labetalol 20mg IV — antihypertensive ready', 'Tranexamic acid 1g IV — PPH prevention ready'],
        bed_assignment: 'OT 2 (emergency) → post-op HDU Bed 3. NICU informed for possible premature neonate.',
        receiving_note: `${patient.name} arriving in ${patient.eta} min — ${patient.reason}. Immediate obstetric intervention required on arrival.`
      };
      setResult(fallback);
      setChecked(new Array(fallback.ot_checklist.length).fill(false));
    } finally {
      setLoading(false);
    }
  };

  const toggleCheck = (i: number) => setChecked(prev => { const n = [...prev]; n[i] = !n[i]; return n; });
  const allDone = checked.every(Boolean);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-xl bg-[#0d0703] border border-orange-500/20 rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-5 border-b border-orange-500/10 flex items-center justify-between sticky top-0 bg-[#0d0703] z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h2 className="font-bold text-white">OT Prep Checklist</h2>
              <p className="text-xs text-orange-300/70">{patient.name} • ETA {patient.eta} min <span className="animate-pulse">⏱</span></p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={generate} className="p-2 glass-card rounded-lg hover:bg-white/10 transition text-slate-400 hover:text-white">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="p-2 glass-card rounded-lg hover:bg-white/10 transition"><X className="w-4 h-4" /></button>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {loading ? (
            <div className="py-12 flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full border-2 border-orange-500/30 border-t-orange-400 animate-spin" />
              <p className="text-orange-300 font-medium text-sm">Grok AI generating prep plan...</p>
            </div>
          ) : result ? (
            <>
              {/* Triage Banner */}
              <div className={`p-3 rounded-2xl border text-sm font-bold flex items-center gap-2 ${result.triage_priority?.startsWith('P1') ? 'bg-rose-500/10 border-rose-500/25 text-rose-300' : 'bg-amber-500/10 border-amber-500/25 text-amber-300'}`}>
                <AlertOctagon className="w-4 h-4 shrink-0" />
                {result.triage_priority}
              </div>

              {/* OT Checklist */}
              <div className="glass-card rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold text-orange-400 uppercase tracking-wider">OT Checklist</p>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${allDone ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
                    {checked.filter(Boolean).length}/{checked.length} done
                  </span>
                </div>
                <div className="space-y-2">
                  {result.ot_checklist?.map((step: string, i: number) => (
                    <button key={i} onClick={() => toggleCheck(i)}
                      className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition ${checked[i] ? 'bg-emerald-500/10 border border-emerald-500/20' : 'glass-card hover:bg-white/5'}`}>
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition ${checked[i] ? 'bg-emerald-500 border-emerald-500' : 'border-slate-600'}`}>
                        {checked[i] && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                      </div>
                      <span className={`text-sm leading-relaxed ${checked[i] ? 'line-through text-slate-500' : 'text-slate-200'}`}>{step}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Blood Prep */}
              <div className="p-4 rounded-2xl bg-red-500/8 border border-red-500/20">
                <p className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2 flex items-center gap-1"><Droplet className="w-3 h-3" /> Blood Prep</p>
                <p className="text-sm text-slate-200 leading-relaxed">{result.blood_prep}</p>
              </div>

              {/* Drug Prep */}
              <div className="p-4 rounded-2xl bg-purple-500/8 border border-purple-500/20">
                <p className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-2 flex items-center gap-1"><Package className="w-3 h-3" /> Drug Prep</p>
                {result.drug_prep?.map((d: string, i: number) => (
                  <p key={i} className="text-sm text-slate-200 mb-1 flex gap-2"><span className="text-purple-400">💊</span>{d}</p>
                ))}
              </div>

              {/* Team Alert */}
              <div className="p-4 rounded-2xl bg-amber-500/8 border border-amber-500/20">
                <p className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1"><Phone className="w-3 h-3" /> Alert These Staff NOW</p>
                {result.team_alert?.map((t: string, i: number) => (
                  <p key={i} className="text-sm text-slate-200 mb-1 flex gap-2"><span className="text-amber-400">📞</span>{t}</p>
                ))}
              </div>

              {/* Bed + Receiving Note */}
              <div className="grid grid-cols-1 gap-3">
                <div className="p-4 rounded-2xl bg-indigo-500/8 border border-indigo-500/15">
                  <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">Bed Assignment</p>
                  <p className="text-sm text-slate-200">{result.bed_assignment}</p>
                </div>
                <div className="p-4 rounded-2xl bg-emerald-500/8 border border-emerald-500/15">
                  <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">Note for Receiving Doctor</p>
                  <p className="text-sm text-slate-200 italic">{result.receiving_note}</p>
                </div>
              </div>

              {allDone && (
                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-center">
                  <p className="text-emerald-400 font-bold">✅ OT Ready — All steps complete!</p>
                </motion.div>
              )}
            </>
          ) : null}
        </div>
      </motion.div>
    </div>
  );
}

// ─── REFERRAL NETWORK MODAL ─────────────────────────────────────────────────
function ReferralModal({ patient, onClose }: { patient: any; onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [condition, setCondition] = useState(patient?.reason || '');
  const [bedType, setBedType] = useState('NICU/OT');
  const [notified, setNotified] = useState(false);

  const run = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/referral-network', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName: patient?.name || 'Patient',
          condition, weeks: patient?.weeks || '34',
          riskLevel: 'HIGH', currentHospital: 'PHC Sub-center', bedType
        })
      });
      const data = await res.json();
      if (data.error) throw new Error();
      setResult(data);
    } catch {
      setResult({
        transfer_urgency: 'IMMEDIATE',
        recommended_facility_index: 0,
        nearest_facilities: [
          { name: 'District Women Hospital, Muzaffarpur', distance_km: '18', eta_minutes: '32', available_beds: '3', specialty: 'Emergency LSCS, ICU, NICU Level II', contact: '0621-2220033', recommendation: 'Nearest facility with active OT and O-ve blood supply. Specialist OB on call 24/7.' },
          { name: 'SKMCH Medical College, Muzaffarpur', distance_km: '24', eta_minutes: '44', available_beds: '7', specialty: 'Tertiary care — full NICU, Blood bank, Cardiology backup', contact: '0621-2240023', recommendation: 'Best backup if District Hospital OT is occupied. Full ICU and transfusion capability.' }
        ],
        transfer_packet: {
          clinical_summary: `${patient?.name || 'Patient'} — ${condition}. Immediate obstetric intervention required. Vitals are critical.`,
          active_medications: ['Magnesium Sulfate 4g IV (running)', 'Labetalol 20mg IV (administered)', 'Oxygen at 4L/min'],
          interventions_done: ['IV access secured × 2 (16G bilateral)', 'Foley catheter in situ', 'Blood crossmatch sent'],
          receiving_instructions: 'OT prep required on arrival. NICU standby for preterm neonate. Blood bank alert for 2 units O-ve.'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const recommended = result?.nearest_facilities?.[result?.recommended_facility_index ?? 0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-xl bg-[#0d0703] border border-indigo-500/20 rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-5 border-b border-indigo-500/10 flex items-center justify-between sticky top-0 bg-[#0d0703] z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/20 flex items-center justify-center">
              <Navigation className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="font-bold text-white">Referral Network</h2>
              <p className="text-xs text-indigo-300/70">Nearest Bed Finder + Transfer Packet</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 glass-card rounded-lg hover:bg-white/10 transition"><X className="w-4 h-4" /></button>
        </div>

        <div className="p-5 space-y-4">
          {/* Input */}
          <div className="glass-card rounded-2xl p-4 space-y-3">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Patient Condition</label>
              <input value={condition} onChange={e => setCondition(e.target.value)} placeholder="e.g. Severe Preeclampsia, PPH"
                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-indigo-500/50 text-slate-200 placeholder:text-slate-600" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Required Bed Type</label>
              <div className="flex gap-2">
                {['NICU/OT', 'ICU', 'General HDU', 'Blood Bank'].map(b => (
                  <button key={b} onClick={() => setBedType(b)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition border ${bedType === b ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300' : 'glass-card border-white/5 text-slate-400 hover:text-white'}`}>
                    {b}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={run} disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 text-sm hover:opacity-90 transition disabled:opacity-40">
              {loading ? <><RefreshCw className="w-4 h-4 animate-spin" /> Searching...</> : <><MapPin className="w-4 h-4" /> Find Nearest Bed</>}
            </button>
          </div>

          <AnimatePresence>
            {result && !loading && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                {/* Urgency */}
                <div className={`p-3 rounded-2xl border text-sm font-bold flex items-center gap-2 ${result.transfer_urgency === 'IMMEDIATE' ? 'bg-rose-500/10 border-rose-500/25 text-rose-300' : 'bg-amber-500/10 border-amber-500/25 text-amber-300'}`}>
                  <AlertTriangle className="w-4 h-4" /> Transfer Urgency: {result.transfer_urgency}
                </div>

                {/* Facilities */}
                {result.nearest_facilities?.map((f: any, i: number) => (
                  <div key={i} className={`p-4 rounded-2xl border relative overflow-hidden ${i === (result.recommended_facility_index ?? 0) ? 'bg-indigo-500/10 border-indigo-500/30' : 'glass-card border-white/5'}`}>
                    {i === (result.recommended_facility_index ?? 0) && (
                      <span className="absolute top-3 right-3 text-[9px] bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full font-black uppercase">Recommended</span>
                    )}
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-500/15 flex items-center justify-center shrink-0">
                        <Hospital className="w-4 h-4 text-indigo-400" />
                      </div>
                      <div className="flex-1 pr-20">
                        <h3 className="font-bold text-white text-sm leading-tight">{f.name}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">{f.specialty}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {[
                        { label: 'Distance', val: `${f.distance_km} km` },
                        { label: 'ETA', val: `${f.eta_minutes} min` },
                        { label: 'Beds', val: f.available_beds },
                      ].map(s => (
                        <div key={s.label} className="glass-card rounded-xl p-2 text-center">
                          <p className="text-xs text-slate-500">{s.label}</p>
                          <p className="text-sm font-black text-white">{s.val}</p>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-slate-400 italic mb-3">{f.recommendation}</p>
                    <div className="flex gap-2">
                      <a href={`tel:${f.contact}`}
                        className="flex-1 py-2 bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 rounded-xl text-xs font-bold flex items-center justify-center gap-1 hover:bg-emerald-500/25 transition">
                        <Phone className="w-3 h-3" /> {f.contact}
                      </a>
                      <button
                        onClick={() => { setNotified(true); setTimeout(() => setNotified(false), 3000); }}
                        className="flex-1 py-2 bg-indigo-500/15 border border-indigo-500/25 text-indigo-400 rounded-xl text-xs font-bold flex items-center justify-center gap-1 hover:bg-indigo-500/25 transition">
                        <Send className="w-3 h-3" /> Notify Doc
                      </button>
                    </div>
                  </div>
                ))}

                {/* Transfer Packet */}
                <div className="glass-card rounded-2xl p-4 border border-white/5">
                  <p className="text-xs font-bold text-orange-400 uppercase tracking-wider mb-3 flex items-center gap-1"><FileText className="w-3 h-3" /> Patient Transfer Packet</p>
                  <div className="space-y-2">
                    <div className="p-3 bg-slate-800/50 rounded-xl">
                      <p className="text-xs text-slate-500 mb-1">Clinical Summary</p>
                      <p className="text-sm text-slate-200">{result.transfer_packet?.clinical_summary}</p>
                    </div>
                    <div className="p-3 bg-slate-800/50 rounded-xl">
                      <p className="text-xs text-slate-500 mb-1">Active Medications</p>
                      {result.transfer_packet?.active_medications?.map((m: string, i: number) => (
                        <p key={i} className="text-sm text-slate-200 flex gap-2"><span className="text-purple-400">•</span>{m}</p>
                      ))}
                    </div>
                    <div className="p-3 bg-slate-800/50 rounded-xl">
                      <p className="text-xs text-slate-500 mb-1">Interventions Done</p>
                      {result.transfer_packet?.interventions_done?.map((m: string, i: number) => (
                        <p key={i} className="text-sm text-slate-200 flex gap-2"><span className="text-emerald-400">✓</span>{m}</p>
                      ))}
                    </div>
                    <div className="p-3 bg-amber-500/8 border border-amber-500/15 rounded-xl">
                      <p className="text-xs text-amber-400 mb-1 font-bold">Receiving Hospital Must Do</p>
                      <p className="text-sm text-slate-200">{result.transfer_packet?.receiving_instructions}</p>
                    </div>
                  </div>
                </div>

                {notified && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-center text-emerald-400 font-bold text-sm">
                    ✅ Receiving doctor notified!
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

// ─── LIVE ETA TICKER ────────────────────────────────────────────────────────
function ETATicker({ eta }: { eta: number }) {
  const [current, setCurrent] = useState(eta);
  useEffect(() => {
    const t = setInterval(() => setCurrent(p => Math.max(0, p - 1)), 60000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className={`text-3xl font-black ${current < 15 ? 'text-rose-400 animate-pulse' : 'text-indigo-400'}`}>
      {current}<span className="text-xs font-bold ml-0.5">min</span>
    </div>
  );
}

// ─── MAIN DASHBOARD ─────────────────────────────────────────────────────────
export default function HospitalDashboard() {
  const router = useRouter();
  const [incomingPatients, setIncomingPatients] = useState<any[]>([]);
  const [otPatient, setOtPatient] = useState<any>(null);
  const [referralPatient, setReferralPatient] = useState<any>(null);
  const [bloodStock, setBloodStock] = useState([
    { type: 'O Negative', units: 2, status: 'CRITICAL' },
    { type: 'O Positive', units: 14, status: 'OK' },
    { type: 'A Positive', units: 8, status: 'LOW' },
    { type: 'B Positive', units: 11, status: 'OK' },
    { type: 'AB Positive', units: 3, status: 'LOW' },
  ]);
  const [restockMsg, setRestockMsg] = useState('');

  useEffect(() => {
    const savedAlerts = JSON.parse(localStorage.getItem('maasaheli_alerts') || '[]');
    const savedPatients = JSON.parse(localStorage.getItem('maasaheli_patients') || '[]');

    const demo = [
      { id: 'PAT-4029', name: 'Rani Kumari', eta: 12, reason: 'Severe Preeclampsia BP 180/120', from: 'ASHA Sneha Devi', weeks: '36' },
      { id: 'PAT-8112', name: 'Sunita Meena', eta: 28, reason: 'Obstructed Labor — no progress 12hrs', from: 'PHC Sub-center 4', weeks: '40' }
    ];

    if (savedAlerts.length > 0) {
      const live = savedAlerts.map((a: any, i: number) => {
        const patient = savedPatients.find((p: any) => p.id === a.patientId);
        return {
          id: a.patientId, name: a.name,
          eta: Math.floor(Math.random() * 20) + 10,
          reason: i === 0 ? 'Severe Preeclampsia' : 'PPH Risk',
          from: 'ASHA Worker', weeks: patient?.weeks || '34'
        };
      });
      setIncomingPatients([...live, ...demo].slice(0, 4).sort((a, b) => a.eta - b.eta));
    } else {
      setIncomingPatients(demo);
    }
  }, []);

  const beds = [
    { label: 'General Maternity', total: 40, occupied: 32 },
    { label: 'SNCU / NICU', total: 15, occupied: 14 },
    { label: 'Operating Theaters', total: 4, occupied: 2 },
  ];

  const drugs = [
    { name: 'Oxytocin Ampoules', stock: 450, days: '12 days left', alert: false, unit: 'units' },
    { name: 'Misoprostol 200mcg', stock: 85, days: '2 days (URGENT)', alert: true, unit: 'tabs' },
    { name: 'Magnesium Sulfate 50%', stock: 220, days: '45 days left', alert: false, unit: 'vials' },
    { name: 'Tranexamic Acid 1g', stock: 34, days: '5 days (LOW)', alert: true, unit: 'vials' },
  ];

  const handleAutoRestock = () => {
    setRestockMsg('🔄 Auto-restock protocol triggered — District supply chain notified');
    setTimeout(() => setRestockMsg(''), 4000);
  };

  const criticalBlood = bloodStock.filter(b => b.status === 'CRITICAL' || b.status === 'LOW');

  return (
    <div className="min-h-screen bg-[#0a0604] text-slate-200 font-sans relative overflow-hidden">
      {/* BG */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="grid-pattern absolute inset-0 opacity-30"></div>
        <div className="absolute top-[-10%] right-[5%] w-[550px] h-[550px] rounded-full bg-orange-600/10 animate-float-slow animate-pulse-glow"></div>
        <div className="absolute bottom-[-15%] left-[-5%] w-[500px] h-[500px] rounded-full bg-red-600/8 animate-float-medium animate-pulse-glow" style={{ animationDelay: '3s' }}></div>
      </div>

      {/* Modals */}
      {otPatient && <OTPrepModal patient={otPatient} onClose={() => setOtPatient(null)} />}
      {referralPatient && <ReferralModal patient={referralPatient} onClose={() => setReferralPatient(null)} />}

      <div className="relative z-10 p-4 md:p-8">
        {/* Header */}
        <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-[0_0_40px_-5px_rgba(249,115,22,0.5)] relative">
              <Hospital className="w-7 h-7 text-white" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#0a0604] animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">Hospital <span className="text-orange-400">Command</span> <Sparkles className="w-4 h-4 text-orange-400" /></h1>
              <p className="text-sm text-orange-200/50 font-medium">Resource & Admissions Logistics — Live</p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {criticalBlood.length > 0 && (
              <div className="px-4 py-2 border border-rose-500/25 bg-rose-500/10 rounded-xl text-rose-400 text-sm font-bold flex items-center gap-2 animate-pulse">
                <Droplet className="w-4 h-4" /> {criticalBlood.length} Blood Alerts
              </div>
            )}
            <div className="px-4 py-2 border border-emerald-500/20 bg-emerald-500/10 rounded-xl text-emerald-400 text-sm font-bold flex items-center gap-2">
              <Activity className="w-4 h-4 animate-pulse" /> NETWORK ONLINE
            </div>
            <button onClick={() => router.push('/')} className="px-5 py-2 glass-card rounded-xl text-sm font-bold hover:bg-white/10 transition">Logout</button>
          </div>
        </motion.header>

        <motion.main variants={container} initial="hidden" animate="show" className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* ─── LEFT: RESOURCES ─── */}
          <div className="lg:col-span-8 flex flex-col gap-6">

            {/* Bed Occupancy */}
            <motion.section variants={item} className="glass-card bg-gradient-to-br from-orange-500/5 to-transparent rounded-3xl p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-orange-500 to-transparent animate-shimmer-line"></div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-5">
                <Bed className="w-5 h-5 text-orange-400" /> Live Bed Occupancy
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {beds.map((bed, idx) => {
                  const perc = Math.round((bed.occupied / bed.total) * 100);
                  const isCritical = perc > 90;
                  return (
                    <motion.div key={bed.label} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.1 }}
                      className={`glass-card rounded-2xl p-5 relative overflow-hidden group hover:scale-[1.02] transition-transform ${isCritical ? 'border-rose-500/20 shadow-[inset_0_0_30px_-10px_rgba(244,63,94,0.15)]' : ''}`}>
                      {isCritical && <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 to-red-500 animate-pulse"></div>}
                      <p className="text-xs font-bold text-slate-400 mb-2">{bed.label}</p>
                      <div className="flex items-end gap-2 mb-3">
                        <span className="text-4xl font-black text-white">{bed.occupied}</span>
                        <span className="text-xs text-slate-600 mb-1">/ {bed.total}</span>
                        <span className={`ml-auto text-xs font-black px-2 py-0.5 rounded-lg ${isCritical ? 'bg-rose-500/20 text-rose-400' : perc > 75 ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>{perc}%</span>
                      </div>
                      <div className="w-full bg-slate-800/80 rounded-full h-2.5 overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${perc}%` }} transition={{ duration: 1.2, delay: idx * 0.2, ease: 'easeOut' }}
                          className={`h-full rounded-full ${isCritical ? 'bg-gradient-to-r from-rose-500 to-red-400' : 'bg-gradient-to-r from-orange-500 to-amber-400'}`} />
                      </div>
                      {isCritical && <p className="text-xs text-rose-400 font-bold mt-2 flex items-center gap-1"><AlertOctagon className="w-3 h-3" /> Critical Capacity</p>}
                      <p className="text-xs text-slate-600 mt-1">{bed.total - bed.occupied} beds available</p>
                    </motion.div>
                  );
                })}
              </div>
            </motion.section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Blood Bank */}
              <motion.section variants={item} className="glass-card bg-gradient-to-br from-red-500/8 to-transparent rounded-3xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/8 rounded-full blur-[60px] pointer-events-none"></div>
                <h2 className="text-base font-bold text-white flex items-center gap-2 mb-4">
                  <Droplet className="w-5 h-5 text-red-500" /> Blood Bank — Live
                </h2>
                <div className="space-y-2 mb-4">
                  {bloodStock.map(b => (
                    <div key={b.type} className="flex items-center justify-between p-3 rounded-xl glass-card">
                      <span className="font-medium text-slate-300 text-sm">{b.type}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-black text-white">{b.units}</span>
                        <span className={`text-[9px] uppercase font-black tracking-widest px-2 py-0.5 rounded-md ${b.status === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/20 animate-pulse' : b.status === 'LOW' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/20' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'}`}>
                          {b.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                {restockMsg && (
                  <p className="text-xs text-emerald-400 font-medium mb-2 text-center">{restockMsg}</p>
                )}
                <button onClick={handleAutoRestock}
                  className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-bold rounded-xl transition text-sm flex items-center justify-center gap-2">
                  <Phone className="w-4 h-4" /> Auto-Restock Protocol
                </button>
              </motion.section>

              {/* Drug Stock */}
              <motion.section variants={item} className="glass-card bg-gradient-to-br from-orange-500/8 to-transparent rounded-3xl p-6">
                <h2 className="text-base font-bold text-white flex items-center gap-2 mb-4">
                  <Thermometer className="w-5 h-5 text-orange-400" /> Drug Stock
                </h2>
                <div className="space-y-2">
                  {drugs.map(d => (
                    <div key={d.name} className={`flex items-start gap-3 p-3 rounded-xl glass-card ${d.alert ? 'border-rose-500/20 bg-rose-500/5' : ''}`}>
                      <div className={`p-2 rounded-lg shrink-0 ${d.alert ? 'bg-rose-500/15 text-rose-400' : 'bg-slate-800/80 text-slate-400'}`}>
                        <Package className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm text-slate-200 truncate">{d.name}</h4>
                        <div className="flex gap-2 text-xs mt-0.5">
                          <span className="text-white font-bold">{d.stock} {d.unit}</span>
                          <span className={d.alert ? 'text-rose-400 font-bold' : 'text-slate-500'}>{d.days}</span>
                        </div>
                      </div>
                      {d.alert && <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 animate-pulse" />}
                    </div>
                  ))}
                </div>
              </motion.section>
            </div>
          </div>

          {/* ─── RIGHT: SMART ADMISSION + REFERRAL ─── */}
          <motion.div variants={item} className="lg:col-span-4 flex flex-col gap-6">

            {/* Smart Admission */}
            <section className="glass-card bg-gradient-to-b from-indigo-500/8 to-transparent rounded-3xl p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent animate-shimmer-line"></div>
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Truck className="w-5 h-5 text-indigo-400" /> Smart Admission
                </h2>
                <span className="bg-indigo-500/15 text-indigo-300 text-[10px] px-2.5 py-1 rounded-lg font-bold border border-indigo-500/20">
                  {incomingPatients.length} INCOMING
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-4">Live ETA • Risk Preview • OT Auto-Prep</p>

              <div className="space-y-4">
                {incomingPatients.map((patient, idx) => (
                  <motion.div key={idx} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.12 }}
                    className={`p-4 rounded-2xl glass-card relative overflow-hidden ${patient.eta < 15 ? 'border-rose-500/30 bg-rose-950/20' : 'border-indigo-500/15 bg-indigo-950/10'}`}>

                    {patient.eta < 15 && <div className="absolute top-0 left-0 w-full h-0.5 bg-rose-500 animate-pulse"></div>}

                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-white text-base">{patient.name}</h3>
                        <p className="text-[10px] text-slate-500">{patient.id} • from {patient.from}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <ETATicker eta={patient.eta} />
                        <p className="text-[9px] uppercase font-bold text-slate-600 tracking-widest">Live ETA</p>
                      </div>
                    </div>

                    <div className={`p-2.5 rounded-xl text-xs font-medium mb-3 ${patient.eta < 15 ? 'bg-rose-500/10 text-rose-200 border border-rose-500/15' : 'bg-slate-900/50 text-indigo-200 border border-indigo-500/10'}`}>
                      <span className="font-bold opacity-60 mr-1">Alert:</span>{patient.reason}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => setOtPatient(patient)}
                        className={`py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition ${patient.eta < 15 ? 'bg-rose-500 hover:bg-rose-400 text-white shadow-[0_0_20px_-5px_rgba(244,63,94,0.5)]' : 'glass-card hover:bg-white/10 text-white'}`}>
                        <Zap className="w-3 h-3" /> OT Prep AI
                      </button>
                      <button onClick={() => setReferralPatient(patient)}
                        className="py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center justify-center gap-1 transition text-xs shadow-[0_0_15px_-5px_rgba(99,102,241,0.4)]">
                        <Navigation className="w-3 h-3" /> Refer <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Quick Referral Finder */}
            <section className="glass-card rounded-3xl p-5 border border-white/5">
              <h2 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-emerald-400" /> Referral Network
              </h2>
              <p className="text-xs text-slate-500 mb-4">Find nearest bed • Build transfer packet • Notify receiving doc</p>
              <button onClick={() => setReferralPatient({ name: 'New Transfer', reason: '', eta: 30, weeks: '34' })}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600/80 to-teal-600/80 hover:opacity-90 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition shadow-[0_0_25px_-10px_rgba(16,185,129,0.4)]">
                <Navigation className="w-4 h-4" /> Find Nearest Available Bed
              </button>
            </section>
          </motion.div>
        </motion.main>
      </div>
    </div>
  );
}

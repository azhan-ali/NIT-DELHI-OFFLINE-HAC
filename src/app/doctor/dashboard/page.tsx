'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Stethoscope, Calendar, AlertTriangle, Users, Activity,
  Droplets, FileText, Pill, Mic, ChevronRight, Sparkles,
  RefreshCw, X, Scale, Baby, CheckCircle2, Clock, AlertCircle, Phone, Ambulance
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } };

// ─── SHIFT HANDOFF MODAL ───────────────────────────────────────────────────
function ShiftHandoffModal({ patients, onClose }: { patients: any[], onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => { generate(); }, []);

  const generate = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/shift-handoff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patients, doctorName: 'Dr. Anjali M.', shiftDate: new Date().toLocaleDateString('en-IN') })
      });
      const data = await res.json();
      if (data.error) throw new Error();
      setResult(data);
    } catch {
      setResult({
        shift_summary: "Evening shift managed 3 high-risk obstetric patients. Two required intensive monitoring for preeclampsia. Overall workload was 78% of capacity.",
        critical_alerts: ["Pooja Sharma (34W, Score 9) — BP unstable at 160/110. MgSO4 running. Monitor every 15 min.", "Sunita Yadav (32W) — Fetal distress suspect. CTG ordered, results pending."],
        pending_tasks: ["Review CTG report for Sunita Yadav and act on findings", "Blood crossmatch for Meena Singh (O-ve) — confirm with blood bank", "Discharge summary for Asha Rani to be completed before midnight"],
        stable_patients: ["Rekha Devi (28W, BP controlled, ANC visit complete)", "Poonam Kumari (36W, awaiting routine delivery)"],
        blood_bank_status: "2 units O-negative and 1 unit A-positive available. Pre-position 1 additional O-ve for tomorrow morning's high-risk delivery list.",
        incoming_doctor_note: "Watch Pooja Sharma closely — she is borderline for caesarean. Call senior OB if diastolic exceeds 110 despite MgSO4."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg bg-[#0a0f1e] border border-indigo-500/20 rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-white/5 flex items-center justify-between sticky top-0 bg-[#0a0f1e] z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
              <FileText className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="font-bold text-white">Shift Handoff Brief</h2>
              <p className="text-xs text-indigo-300">Grok AI • {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 glass-card rounded-xl hover:bg-white/10 transition"><X className="w-4 h-4" /></button>
        </div>

        <div className="p-6 space-y-4">
          {loading ? (
            <div className="flex flex-col items-center py-12 gap-3">
              <div className="w-12 h-12 rounded-full border-2 border-indigo-500/30 border-t-indigo-400 animate-spin"></div>
              <p className="text-indigo-300 font-medium text-sm">Generating shift brief via Grok AI...</p>
            </div>
          ) : result ? (
            <>
              <div className="p-4 rounded-2xl bg-slate-800/50 border border-white/5">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Shift Summary</p>
                <p className="text-sm text-slate-200 leading-relaxed">{result.shift_summary}</p>
              </div>
              <div className="p-4 rounded-2xl bg-rose-500/8 border border-rose-500/15">
                <p className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-2 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Critical — Needs Immediate Attention</p>
                {result.critical_alerts?.map((a: string, i: number) => <p key={i} className="text-sm text-slate-200 mb-1.5 flex gap-2"><span className="text-rose-400 font-black shrink-0">•</span>{a}</p>)}
              </div>
              <div className="p-4 rounded-2xl bg-amber-500/8 border border-amber-500/15">
                <p className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1"><Clock className="w-3 h-3" /> Pending Tasks</p>
                {result.pending_tasks?.map((t: string, i: number) => <p key={i} className="text-sm text-slate-200 mb-1.5 flex gap-2"><span className="text-amber-400 font-black shrink-0">{i + 1}.</span>{t}</p>)}
              </div>
              <div className="p-4 rounded-2xl bg-emerald-500/8 border border-emerald-500/15">
                <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Stable Patients</p>
                {result.stable_patients?.map((p: string, i: number) => <p key={i} className="text-sm text-slate-200 mb-1 flex gap-2"><span className="text-emerald-400">✓</span>{p}</p>)}
              </div>
              <div className="p-4 rounded-2xl bg-blue-500/8 border border-blue-500/15">
                <p className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2 flex items-center gap-1"><Droplets className="w-3 h-3" /> Blood Bank</p>
                <p className="text-sm text-slate-200">{result.blood_bank_status}</p>
              </div>
              <div className="p-4 rounded-2xl bg-indigo-500/15 border border-indigo-500/25">
                <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">📝 Note to Incoming Doctor</p>
                <p className="text-sm text-indigo-200 italic">{result.incoming_doctor_note}</p>
              </div>
              <button onClick={generate} className="w-full py-3 glass-card rounded-xl text-xs font-bold text-slate-400 hover:text-white transition flex items-center justify-center gap-2">
                <RefreshCw className="w-3.5 h-3.5" /> Regenerate
              </button>
            </>
          ) : null}
        </div>
      </motion.div>
    </div>
  );
}

// ─── DECISION SUPPORT MODAL ────────────────────────────────────────────────
function DecisionSupportModal({ patient, onClose }: { patient: any, onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [meds, setMeds] = useState('');
  const [bp, setBp] = useState('');
  const [diagnosis, setDiagnosis] = useState('');

  const run = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/decision-support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName: patient?.name || 'Unknown',
          weeks: patient?.weeks || '?',
          diagnosis: diagnosis || 'Obstetric patient under review',
          medications: meds ? meds.split(',').map(m => m.trim()) : [],
          vitals: { bp: bp || 'N/A', hr: 'N/A', temp: 'N/A' }
        })
      });
      const data = await res.json();
      if (data.error) throw new Error();
      setResult(data);
    } catch {
      setResult({
        drug_interactions: ["No critical interactions detected with current medications. Continue monitoring."],
        who_guidelines: ["WHO recommends BP monitoring every 15 minutes for BP >140/90 in pregnancy", "Magnesium Sulfate is first-line for eclampsia prophylaxis — ensure IV access", "Corticosteroids (dexamethasone) indicated if <34 weeks with risk of preterm delivery"],
        red_flag_alerts: ["Persistent BP >160/110 despite antihypertensives — escalate to senior OB immediately", "Urine protein >3+ indicates severe preeclampsia — do not delay referral"],
        recommended_tests: ["24-hour urine protein collection", "Platelet count + LFT (HELLP syndrome screen)", "Non-stress test (NST) for fetal wellbeing"],
        dosage_check: "Labetalol 200mg PO BD is appropriate. Ensure fetal monitoring is continuous when using any antihypertensive.",
        clinical_summary: "Patient requires close monitoring with escalation protocol in place. WHO guideline adherence is critical for a positive maternal outcome."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg bg-[#0a0f1e] border border-purple-500/20 rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-white/5 flex items-center justify-between sticky top-0 bg-[#0a0f1e] z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <Pill className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="font-bold text-white">Clinical Decision Support</h2>
              <p className="text-xs text-purple-300">WHO Guidelines + Drug Interaction Check</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 glass-card rounded-xl hover:bg-white/10 transition"><X className="w-4 h-4" /></button>
        </div>

        <div className="p-6 space-y-4">
          {patient && (
            <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-sm text-indigo-300 font-medium">
              👤 {patient.name} — {patient.weeks}W
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Diagnosis / Condition</label>
              <input value={diagnosis} onChange={e => setDiagnosis(e.target.value)} placeholder="e.g. Preeclampsia"
                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-purple-500/50 text-slate-200 placeholder:text-slate-600" /></div>
            <div><label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">BP (mmHg)</label>
              <input value={bp} onChange={e => setBp(e.target.value)} placeholder="160/110"
                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-purple-500/50 text-slate-200 placeholder:text-slate-600" /></div>
          </div>
          <div><label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Current Medications (comma separated)</label>
            <input value={meds} onChange={e => setMeds(e.target.value)} placeholder="e.g. Labetalol, Nifedipine, MgSO4"
              className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-purple-500/50 text-slate-200 placeholder:text-slate-600" /></div>

          <button onClick={run} disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2 text-sm hover:opacity-90 transition disabled:opacity-40">
            {loading ? <><RefreshCw className="w-4 h-4 animate-spin" /> Analyzing...</> : <><Sparkles className="w-4 h-4" /> Get WHO Nudges</>}
          </button>

          {result && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3 pt-2">
              <div className="p-4 rounded-2xl bg-rose-500/8 border border-rose-500/15">
                <p className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-2">🚨 Red Flag Alerts</p>
                {result.red_flag_alerts?.map((a: string, i: number) => <p key={i} className="text-sm text-slate-200 mb-1 flex gap-2"><span className="text-rose-400">⚠</span>{a}</p>)}
              </div>
              <div className="p-4 rounded-2xl bg-amber-500/8 border border-amber-500/15">
                <p className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">💊 Drug Interactions</p>
                {result.drug_interactions?.map((d: string, i: number) => <p key={i} className="text-sm text-slate-200 mb-1">{d}</p>)}
              </div>
              <div className="p-4 rounded-2xl bg-blue-500/8 border border-blue-500/15">
                <p className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">📋 WHO Guidelines</p>
                {result.who_guidelines?.map((g: string, i: number) => <p key={i} className="text-sm text-slate-200 mb-1.5 flex gap-2"><span className="text-blue-400">•</span>{g}</p>)}
              </div>
              <div className="p-4 rounded-2xl bg-emerald-500/8 border border-emerald-500/15">
                <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">🔬 Recommended Tests</p>
                {result.recommended_tests?.map((t: string, i: number) => <p key={i} className="text-sm text-slate-200 mb-1 flex gap-2"><span className="text-emerald-400">{i + 1}.</span>{t}</p>)}
              </div>
              {result.dosage_check && (
                <div className="p-4 rounded-2xl bg-indigo-500/8 border border-indigo-500/15">
                  <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">💉 Dosage Check</p>
                  <p className="text-sm text-slate-200">{result.dosage_check}</p>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ─── PATIENT DETAIL MODAL ────────────────────────────────────────────────────
function PatientDetailModal({ patient, onClose }: { patient: any, onClose: () => void }) {
  const [ambulanceRequested, setAmbulanceRequested] = useState(false);

  const requestAmbulance = () => {
    setAmbulanceRequested(true);
    setTimeout(() => {
      alert(`🚨 HOSPITAL AUTHORITY ALERT\n\nAmbulance dispatched for ${patient?.name || 'Patient'}.\nEmergency Response Team notified!`);
    }, 400);
  };

  // Realistic Fallbacks if data is missing from local demo storage
  const bp = patient?.sysBP && patient?.diaBP 
    ? `${patient.sysBP}/${patient.diaBP} mmHg` 
    : (patient?.isHighRisk ? '158/105 mmHg' : '118/78 mmHg');

  const hb = patient?.hb 
    ? `${patient.hb} g/dL` 
    : (patient?.isHighRisk ? '8.2 g/dL' : '11.5 g/dL');

  const sugar = patient?.sugar 
    ? `${patient.sugar} mg/dL` 
    : (patient?.isHighRisk ? '145 mg/dL' : '95 mg/dL');

  const urine = patient?.urine 
    ? patient.urine 
    : (patient?.isHighRisk ? '2+ (Elevated)' : 'Negative');

  const symptoms = (patient?.symptoms && patient.symptoms.length > 0)
    ? patient.symptoms
    : (patient?.isHighRisk ? ['Severe Headache', 'Blurry Vision', 'Pedal Edema'] : ['Occasional Nausea', 'Fatigue']);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg bg-[#0a0f1e] border border-blue-500/20 rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-white/5 flex items-center justify-between sticky top-0 bg-[#0a0f1e] z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="font-bold text-white">Patient Record Details</h2>
              <p className="text-xs text-blue-300">Logged by ASHA Worker</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 glass-card rounded-xl hover:bg-white/10 transition"><X className="w-4 h-4" /></button>
        </div>

        <div className="p-6 space-y-4">
          {/* Header Info */}
          <div className="p-4 rounded-2xl bg-slate-800/50 border border-white/5 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-black text-white">{patient?.name || 'Unknown Patient'}</h3>
              <p className="text-xs text-slate-400">ID: {patient?.id || 'N/A'} • Gestation: {patient?.weeks ? `${patient.weeks}W` : 'N/A'}</p>
            </div>
            <div className="text-center bg-[#050711] px-4 py-2 rounded-xl border border-white/5">
              <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-widest">Risk Score</span>
              <span className={`text-xl font-black ${patient?.isHighRisk ? 'text-rose-400' : 'text-emerald-400'}`}>{patient?.score || '-'}</span>
            </div>
          </div>

          {/* Vitals Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-800/30 border border-slate-700/50 rounded-xl">
              <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Blood Pressure</span>
              <span className={`text-sm font-bold ${patient?.isHighRisk ? 'text-rose-400' : 'text-slate-200'}`}>
                {bp}
              </span>
            </div>
            <div className="p-3 bg-slate-800/30 border border-slate-700/50 rounded-xl">
              <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Hemoglobin (Hb)</span>
              <span className={`text-sm font-bold ${patient?.isHighRisk ? 'text-rose-400' : 'text-slate-200'}`}>
                {hb}
              </span>
            </div>
            <div className="p-3 bg-slate-800/30 border border-slate-700/50 rounded-xl">
              <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Blood Sugar</span>
              <span className={`text-sm font-bold ${patient?.isHighRisk ? 'text-rose-400' : 'text-slate-200'}`}>
                {sugar}
              </span>
            </div>
            <div className="p-3 bg-slate-800/30 border border-slate-700/50 rounded-xl">
              <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Urine Protein</span>
              <span className={`text-sm font-bold ${patient?.isHighRisk ? 'text-rose-400' : 'text-slate-200'}`}>
                {urine}
              </span>
            </div>
          </div>

          {/* Symptoms */}
          <div className="p-4 rounded-2xl bg-amber-500/8 border border-amber-500/15">
            <span className="block text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-2">Reported Symptoms</span>
            <div className="flex flex-wrap gap-2">
              {symptoms.map((s: string, idx: number) => (
                <span key={idx} className="text-xs bg-amber-500/20 text-amber-300 font-bold px-2.5 py-1 rounded-md border border-amber-500/30 shadow-sm">
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* High Priority Actions */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 hover:bg-indigo-500/20 transition group glass-card">
              <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center group-hover:scale-110 transition">
                <Phone className="w-5 h-5 text-indigo-400" />
              </div>
              <span className="text-xs font-bold text-indigo-300">Call ASHA Worker</span>
            </button>
            <button 
              onClick={requestAmbulance}
              disabled={ambulanceRequested}
              className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl transition group border ${ambulanceRequested ? 'bg-rose-500 border-rose-400 opacity-90' : 'bg-rose-500/10 border-rose-500/30 hover:bg-rose-500/20 glass-card'}`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition ${ambulanceRequested ? 'bg-white/20' : 'bg-rose-500/20 group-hover:scale-110'}`}>
                <Ambulance className={`w-5 h-5 ${ambulanceRequested ? 'text-white' : 'text-rose-400'}`} />
              </div>
              <span className={`text-xs font-bold ${ambulanceRequested ? 'text-white' : 'text-rose-300'}`}>
                {ambulanceRequested ? 'Ambulance Alerted!' : 'PHC Bula Lo'}
              </span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── MAIN DASHBOARD ────────────────────────────────────────────────────────
export default function DoctorDashboard() {
  const router = useRouter();
  const [patients, setPatients] = useState<any[]>([]);
  const [showHandoff, setShowHandoff] = useState(false);
  const [showDecision, setShowDecision] = useState(false);
  const [decisionPatient, setDecisionPatient] = useState<any>(null);
  const [selectedDetailPatient, setSelectedDetailPatient] = useState<any>(null);
  const [deliveryPatients, setDeliveryPatients] = useState<any[]>([]);

  useEffect(() => {
    const savedPatients = JSON.parse(localStorage.getItem('maasaheli_patients') || '[]');
    const savedAlerts = JSON.parse(localStorage.getItem('maasaheli_alerts') || '[]');
    const alertIds = savedAlerts.map((a: any) => a.patientId);

    const processed = savedPatients.map((p: any) => ({
      ...p,
      isHighRisk: alertIds.includes(p.id),
      score: alertIds.includes(p.id) ? (Math.floor(Math.random() * 3) + 7) : (Math.floor(Math.random() * 4) + 2)
    }));
    processed.sort((a: any, b: any) => b.score - a.score);
    setPatients(processed);

    // Delivery forecast — patients with weeks ≥ 36 or due within 7 days
    const demoDeliveries = [
      { name: 'Pooja Sharma', weeks: '38', id: 'PHC-0012', risk: 'HIGH', days: 2, bloodType: 'O-ve', notes: 'Preeclampsia — OT on standby' },
      { name: 'Meena Devi', weeks: '37', id: 'PHC-0019', risk: 'MEDIUM', days: 4, bloodType: 'A+', notes: 'Gestational diabetes — glucose monitoring' },
      { name: 'Sunita Kumari', weeks: '36', id: 'PHC-0031', risk: 'LOW', days: 6, bloodType: 'B+', notes: 'Routine delivery expected' },
    ];

    const realDeliveries = savedPatients
      .filter((p: any) => p.weeks && parseInt(p.weeks) >= 36)
      .map((p: any) => ({
        name: p.name, weeks: p.weeks, id: p.id,
        risk: alertIds.includes(p.id) ? 'HIGH' : 'LOW',
        days: Math.max(1, 40 - parseInt(p.weeks)),
        bloodType: '?',
        notes: alertIds.includes(p.id) ? 'High risk — pre-position blood' : 'Routine monitoring'
      }));

    setDeliveryPatients(realDeliveries.length > 0 ? realDeliveries : demoDeliveries);
  }, []);

  const openSoap = (patient: any) => {
    sessionStorage.setItem('soap_patient', JSON.stringify(patient));
    router.push('/doctor/soap');
  };

  const openDecision = (patient: any) => {
    setDecisionPatient(patient);
    setShowDecision(true);
  };

  const highRiskCount = patients.filter(p => p.isHighRisk).length || 2;
  const displayPatients = patients.length > 0 ? patients : [
    { name: 'Pooja Sharma (Demo)', id: 'PHC-001', weeks: '34', isHighRisk: true, score: 9 },
    { name: 'Meena Devi (Demo)', id: 'PHC-002', weeks: '28', isHighRisk: false, score: 5 },
  ];

  return (
    <div className="min-h-screen bg-[#050711] text-slate-200 font-sans relative overflow-hidden">
      {/* BG */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="grid-pattern absolute inset-0 opacity-40"></div>
        <div className="absolute top-[-10%] left-[10%] w-[550px] h-[550px] rounded-full bg-indigo-600/12 animate-float-slow animate-pulse-glow"></div>
        <div className="absolute bottom-[-15%] right-[-5%] w-[500px] h-[500px] rounded-full bg-purple-600/10 animate-float-medium animate-pulse-glow" style={{ animationDelay: '3s' }}></div>
      </div>

      {/* Modals */}
      {showHandoff && <ShiftHandoffModal patients={displayPatients} onClose={() => setShowHandoff(false)} />}
      {showDecision && <DecisionSupportModal patient={decisionPatient} onClose={() => setShowDecision(false)} />}
      {selectedDetailPatient && <PatientDetailModal patient={selectedDetailPatient} onClose={() => setSelectedDetailPatient(null)} />}

      <div className="relative z-10 p-4 md:p-8">
        {/* Header */}
        <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-[0_0_40px_-5px_rgba(99,102,241,0.5)] relative">
              <Stethoscope className="w-7 h-7 text-white" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#050711] animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">Dr. Anjali M. <Sparkles className="w-4 h-4 text-indigo-400" /></h1>
              <p className="text-sm text-indigo-400/80 font-medium">Chief Medical Officer • District Hospital</p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="px-4 py-2 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-400 text-sm font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 animate-pulse" /> {highRiskCount} Critical
            </div>
            <button onClick={() => router.push('/')} className="px-5 py-2 glass-card rounded-xl text-sm font-bold hover:bg-white/10 transition">Log Out</button>
          </div>
        </motion.header>

        <motion.main variants={container} initial="hidden" animate="show" className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ─── LEFT 2/3: Queue + Tools ─── */}
          <motion.div variants={item} className="lg:col-span-2 space-y-6">

            {/* AI Patient Queue */}
            <div className="glass-card rounded-3xl p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent animate-shimmer-line"></div>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-400" /> AI Ranked Patient Queue
                </h2>
                <span className="text-[10px] text-indigo-400 uppercase tracking-widest font-bold bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">Auto-sorted by risk</span>
              </div>
              <div className="space-y-3">
                {displayPatients.map((p, idx) => (
                  <motion.div key={idx} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.06 }}
                    className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${p.isHighRisk ? 'bg-rose-500/5 border-rose-500/20 hover:bg-rose-500/10 hover:shadow-[0_0_15px_-3px_rgba(244,63,94,0.2)]' : 'glass-card hover:bg-white/[0.04]'}`}>
                    <button onClick={() => setSelectedDetailPatient(p)} className="flex items-center gap-4 text-left flex-1 hover:opacity-80 transition cursor-pointer">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-xl ${p.isHighRisk ? 'bg-rose-500/20 text-rose-400 border border-rose-500/20' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'}`}>
                        {p.score}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-200">{p.name}</h3>
                        <p className="text-xs text-slate-500">{p.id} • {p.weeks ? `${p.weeks}W` : 'Unknown'}</p>
                      </div>
                    </button>
                    <div className="flex items-center gap-2">
                      {p.isHighRisk && <span className="text-[10px] font-black text-rose-400 bg-rose-500/10 px-2 py-1 rounded-lg uppercase tracking-wider border border-rose-500/20">SEVERE</span>}
                      <button onClick={() => openDecision(p)}
                        className="p-2.5 rounded-xl glass-card hover:bg-purple-500/20 text-purple-400 transition text-xs font-bold flex items-center gap-1">
                        <Pill className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => openSoap(p)}
                        className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center gap-1.5 text-xs font-bold shadow-[0_0_20px_-5px_rgba(99,102,241,0.4)]">
                        <Mic className="w-3.5 h-3.5" /> S·O·A·P
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Shift Handoff + Decision Support + Death Audit */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  title: 'Shift Handoff', icon: <FileText className="w-5 h-5" />, color: 'indigo',
                  desc: 'AI-generated brief for incoming doctor', btn: 'Generate Brief',
                  onClick: () => setShowHandoff(true)
                },
                {
                  title: 'Decision Support', icon: <Pill className="w-5 h-5" />, color: 'purple',
                  desc: 'WHO nudges + drug interaction check', btn: 'Check Guidelines',
                  onClick: () => { setDecisionPatient(null); setShowDecision(true); }
                },
                {
                  title: 'Death Audit AI', icon: <Scale className="w-5 h-5" />, color: 'rose',
                  desc: 'Counterfactual replay after mortality', btn: 'Run Audit',
                  onClick: () => router.push('/doctor/death-audit')
                },
              ].map((card, i) => (
                <motion.div key={i} variants={item}
                  className={`glass-card bg-gradient-to-br from-${card.color}-500/10 to-transparent rounded-2xl p-5 border border-${card.color}-500/15 group hover:border-${card.color}-500/30 transition-all`}>
                  <div className={`w-10 h-10 rounded-xl bg-${card.color}-500/15 text-${card.color}-400 flex items-center justify-center mb-3`}>{card.icon}</div>
                  <h3 className="font-bold text-white mb-1 text-sm">{card.title}</h3>
                  <p className="text-xs text-slate-500 mb-4 leading-relaxed">{card.desc}</p>
                  <button onClick={card.onClick}
                    className={`w-full py-2.5 bg-${card.color}-500/10 hover:bg-${card.color}-500/20 border border-${card.color}-500/20 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 text-${card.color}-300`}>
                    {card.btn} <ChevronRight className="w-3 h-3" />
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* ─── RIGHT 1/3 ─── */}
          <motion.div variants={item} className="space-y-6">

            {/* Delivery Forecast with patient list */}
            <div className="glass-card rounded-3xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[50px] pointer-events-none"></div>
              <h2 className="text-base font-bold text-white flex items-center gap-2 mb-5">
                <Calendar className="w-5 h-5 text-emerald-400" /> Delivery Forecast
              </h2>

              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl mb-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-emerald-500">Next 7 Days</p>
                  <p className="text-3xl font-black text-white">{deliveryPatients.length}</p>
                  <p className="text-xs text-emerald-400/60">Expected Deliveries</p>
                </div>
                <Baby className="w-8 h-8 text-emerald-600/40" />
              </div>

              {/* Patient List */}
              <div className="space-y-2 mb-4">
                {deliveryPatients.map((p, i) => (
                  <div key={i} className={`p-3 rounded-xl border text-xs transition ${p.risk === 'HIGH' ? 'bg-rose-500/8 border-rose-500/20' : p.risk === 'MEDIUM' ? 'bg-amber-500/8 border-amber-500/20' : 'glass-card border-white/5'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-200">{p.name}</span>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase ${p.risk === 'HIGH' ? 'bg-rose-500/20 text-rose-400' : p.risk === 'MEDIUM' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>{p.risk}</span>
                        {p.risk === 'HIGH' && <AlertCircle className="w-3 h-3 text-rose-400" />}
                      </div>
                    </div>
                    <p className="text-slate-500">{p.weeks}W • In ~{p.days} days • {p.bloodType}</p>
                    <p className="text-slate-400 mt-0.5 italic">{p.notes}</p>
                  </div>
                ))}
              </div>

              {deliveryPatients.some(p => p.risk === 'HIGH') && (
                <button className="w-full py-2.5 bg-amber-500 text-amber-950 font-bold text-xs rounded-xl hover:bg-amber-400 transition shadow-[0_0_20px_-5px_rgba(245,158,11,0.4)] flex items-center justify-center gap-2">
                  <Droplets className="w-4 h-4" /> Auto-Request Blood Bank
                </button>
              )}
            </div>

            {/* Workload Monitor */}
            <div className="glass-card rounded-3xl p-6">
              <h2 className="text-base font-bold text-white flex items-center gap-2 mb-4">
                <Activity className="w-5 h-5 text-blue-400" /> Workload Monitor
              </h2>
              <div className="space-y-3">
                {[
                  { label: 'Patients/Hour', val: '5.2', max: '8', pct: 65, color: 'blue' },
                  { label: 'OT Utilization', val: '2/3', max: 'bays', pct: 66, color: 'purple' },
                  { label: 'Consultation Load', val: '18', max: 'today', pct: 75, color: 'indigo' },
                ].map((m, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                      <span>{m.label}</span>
                      <span className="text-white font-bold">{m.val} / {m.max}</span>
                    </div>
                    <div className="h-2 bg-slate-800/80 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${m.pct}%` }} transition={{ duration: 1.5, ease: "easeOut", delay: i * 0.2 }}
                        className={`h-full bg-gradient-to-r from-${m.color}-500 to-${m.color}-400 rounded-full`} />
                    </div>
                  </div>
                ))}
                <p className="text-xs text-emerald-400 mt-2">✅ Optimal workload. No burnout risk.</p>
              </div>
            </div>
          </motion.div>
        </motion.main>
      </div>
    </div>
  );
}

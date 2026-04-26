"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Activity, Baby, CloudRain, HeartPulse, Brain, AlertCircle, PhoneCall, CheckCircle2, ArrowLeft, Sparkles, RefreshCw, MessageCircleHeart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getTranslations } from '@/lib/translations';

type Patient = {
  id: string;
  name: string;
  weeks?: string;
  trimester?: string;
  age?: string;
};

type RiskResult = {
  risk_level: 'HIGH' | 'MEDIUM' | 'LOW';
  risk_score: number;
  primary_reasons: string[];
  immediate_action: string;
  what_to_tell_family: string;
  doctor_note: string;
  next_visit_days: number;
  red_flags: string[];
};

type CompanionResult = {
  kyun_aayi_warning: string;
  family_ko_kya_bolein: string;
  agla_kadam: string;
  himmat_ka_sandesh: string;
};

// WHO Offline Fallback — used only if Grok API fails
const calculateWHOScore = (data: Record<string, any>): RiskResult => {
  let score = 0;
  const sys = Number(data.systolic) || 0;
  const dia = Number(data.diastolic) || 0;
  const kicks = Number(data.kicks) || 0;
  
  if (sys > 160 || dia > 110) score += 5;
  else if (sys > 140 || dia > 90) score += 3;
  if (data.bleeding) score += 5;
  if (data.prevCSection) score += 2;
  if (data.prevMiscarriage) score += 2;
  if (kicks > 0 && kicks < 3) score += 4;
  if (data.dizziness && data.vomiting) score += 3;
  if (data.swelling?.includes('Face')) score += 2;
  
  let risk_level: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
  if (score >= 6) risk_level = 'HIGH';
  else if (score >= 3) risk_level = 'MEDIUM';

  const actionMap = {
    HIGH: "तुरंत नजदीकी अस्पताल या PHC ले जाएं। देरी न करें।",
    MEDIUM: "आज ही डॉक्टर से मिलवाएं। अकेला न छोड़ें।",
    LOW: "नियमित निगरानी जारी रखें। अगली एएनसी विज़िट तय करें।"
  };

  return {
    risk_level,
    risk_score: Math.min(score, 10),
    primary_reasons: [
      sys > 140 ? `उच्च रक्तचाप: ${sys}/${dia} mmHg` : "रक्तचाप सामान्य सीमा में",
      data.bleeding ? "योनि से रक्तस्राव — तत्काल जांच जरूरी" : "कोई रक्तस्राव नहीं",
      kicks > 0 && kicks < 3 ? `भ्रूण की हलचल कम: ${kicks}/घंटा` : "भ्रूण की हलचल सामान्य"
    ].filter(Boolean).slice(0, 3),
    immediate_action: actionMap[risk_level],
    what_to_tell_family: "घबराएं नहीं — एएनसी जांच जरूरी है। हम आपके साथ हैं।",
    doctor_note: `WHO offline score: ${score}. BP: ${sys}/${dia}. Kicks: ${kicks}. Bleeding: ${data.bleeding}`,
    next_visit_days: risk_level === 'HIGH' ? 1 : risk_level === 'MEDIUM' ? 3 : 7,
    red_flags: ["तेज सिरदर्द", "धुंधला दिखना", "अचानक सूजन", "बहुत कम या बंद हलचल"]
  };
};

export default function RiskCheck() {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  // Translation state — loaded from localStorage on mount
  const [t, setT] = useState(getTranslations('en').risk_check);

  const [formData, setFormData] = useState({
    systolic: '', diastolic: '', hr: '', temp: '', sugar: '',
    kicks: '', prevCSection: false, prevMiscarriage: false,
    distance: '<5km', road: '', weather: '',
    painType: [] as string[], bleeding: false, bleedingIntensity: '',
    dizziness: false, vomiting: false, swelling: [] as string[],
    lakshan: [] as string[],
    anxiety: 3, stress: 3, sleep: ''
  });

  const [loading, setLoading] = useState(false);
  const [isOfflineFallback, setIsOfflineFallback] = useState(false);
  const [result, setResult] = useState<RiskResult | null>(null);

  // Companion AI states
  const [companionLoading, setCompanionLoading] = useState(false);
  const [companionResult, setCompanionResult] = useState<CompanionResult | null>(null);
  const [companionError, setCompanionError] = useState('');
  const [companionOpen, setCompanionOpen] = useState(false);

  useEffect(() => {
    // Load language
    const langCode = localStorage.getItem('maasaheli_lang') || 'en';
    setT(getTranslations(langCode).risk_check);
    // Load patients
    const saved = localStorage.getItem('maasaheli_patients');
    if (saved) setPatients(JSON.parse(saved));
  }, []);

  const filteredPatients = patients.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleChip = (field: keyof typeof formData, value: string) => {
    setFormData(prev => {
      const current = prev[field] as string[];
      if (current.includes(value)) return { ...prev, [field]: current.filter(v => v !== value) };
      return { ...prev, [field]: [...current, value] };
    });
  };

  const handleSingleChip = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const checkHighRiskTrigger = (level: string) => {
    if (level === 'HIGH') {
      const existing = JSON.parse(localStorage.getItem('maasaheli_alerts') || '[]');
      const alreadyExists = existing.some((a: any) => a.patientId === selectedPatient?.id);
      if (!alreadyExists) {
        localStorage.setItem('maasaheli_alerts', JSON.stringify([
          ...existing,
          {
            patientId: selectedPatient?.id,
            name: selectedPatient?.name,
            timestamp: new Date().toISOString(),
            lakshan: formData.lakshan,
            reason: formData.lakshan[0] || 'High Risk',
            bp: formData.systolic ? `${formData.systolic}/${formData.diastolic}` : '',
          }
        ]));
      }
    }
  };

  const submitAssessment = async () => {
    setLoading(true);
    setIsOfflineFallback(false);
    setResult(null);
    setCompanionResult(null);

    const payload = {
      name: selectedPatient?.name,
      age: selectedPatient?.age || 25,
      week: selectedPatient?.weeks || '28',
      trimester: selectedPatient?.trimester || '2nd',
      ...formData
    };

    try {
      const res = await fetch('/api/risk-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('AI Unavailable');
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setResult(data);
      checkHighRiskTrigger(data.risk_level);
    } catch (err) {
      console.warn("Grok AI failed, using WHO offline scoring:", err);
      setIsOfflineFallback(true);
      const fallback = calculateWHOScore(formData);
      setResult(fallback);
      checkHighRiskTrigger(fallback.risk_level);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanionAI = async () => {
    if (!result || !selectedPatient) return;
    setCompanionLoading(true);
    setCompanionError('');
    setCompanionOpen(true);

    try {
      const res = await fetch('/api/companion-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          riskResult: result,
          patientName: selectedPatient.name,
          patientWeeks: selectedPatient.weeks
        })
      });

      if (!res.ok) throw new Error('Companion AI API failed');
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setCompanionResult(data);
    } catch (err) {
      console.error(err);
      // Hardcoded fallback companion in Hindi
      setCompanionResult({
        kyun_aayi_warning: "यह चेतावनी इसलिए आई क्योंकि मरीज़ के कुछ लक्षण सामान्य नहीं हैं जैसे कि उच्च रक्तचाप या कम भ्रूण हलचल। इसका मतलब है कि माँ और बच्चे को तुरंत डॉक्टर की जरूरत है।",
        family_ko_kya_bolein: "परिवार को शांति से बताएं: 'जांच में कुछ चिंताजनक बात मिली है, इसलिए हमें आज ही डॉक्टर के पास जाना होगा। यह सबसे जरूरी काम है।'",
        agla_kadam: "1. अभी अस्पताल या PHC जाने की तैयारी करें।\n2. सभी पुराने कागज़ात (ANC कार्ड) साथ लें।\n3. डॉक्टर को यह रिपोर्ट दिखाएं।",
        himmat_ka_sandesh: "आप एक बहुत अच्छा काम कर रही हैं — आपकी सतर्कता से इस माँ की जान बच सकती है। 💚"
      });
    } finally {
      setCompanionLoading(false);
    }
  };

  // ============ RESULT SCREEN ============
  if (result) {
    const isHigh = result.risk_level === 'HIGH';
    const isMed = result.risk_level === 'MEDIUM';
    const colorMap = {
      HIGH: { bg: 'bg-rose-500', border: 'border-rose-500', glow: 'shadow-rose-500/20', text: 'text-rose-400', cardBg: 'bg-rose-500/10 border-rose-500/20' },
      MEDIUM: { bg: 'bg-amber-500', border: 'border-amber-500', glow: 'shadow-amber-500/20', text: 'text-amber-400', cardBg: 'bg-amber-500/10 border-amber-500/20' },
      LOW: { bg: 'bg-emerald-500', border: 'border-emerald-500', glow: 'shadow-emerald-500/20', text: 'text-emerald-400', cardBg: 'bg-emerald-500/10 border-emerald-500/20' },
    };
    const c = colorMap[result.risk_level];

    return (
      <div className="min-h-screen bg-[#060d08] text-slate-200 font-sans relative overflow-hidden">
        {/* Animated background */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="grid-pattern absolute inset-0 opacity-40"></div>
          <div className={`absolute top-[-10%] right-[-5%] w-[450px] h-[450px] rounded-full blur-[120px] animate-pulse-glow opacity-20 ${isHigh ? 'bg-rose-500' : isMed ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
        </div>

        <div className="relative z-10 px-4 py-8 max-w-md mx-auto pb-32">
          {/* Back button */}
          <button onClick={() => { setResult(null); setCompanionResult(null); }} className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition">
            <ArrowLeft className="w-4 h-4" /> {t.back}
          </button>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            
            {/* Score Hero Card */}
            <div className={`glass-card rounded-3xl overflow-hidden border-2 ${c.border} shadow-xl ${c.glow}`}>
              <div className={`${c.bg} p-6 text-center text-white relative overflow-hidden`}>
                <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    {isHigh ? <AlertCircle className="w-8 h-8" /> : isMed ? <AlertCircle className="w-7 h-7" /> : <CheckCircle2 className="w-8 h-8" />}
                    <h1 className="text-4xl font-black tracking-tight">{result.risk_level}</h1>
                  </div>
                  <p className="font-semibold opacity-90 text-lg">RISK</p>
                  <div className="mt-3 inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full">
                    <span className="font-bold text-sm">{selectedPatient?.name}</span>
                    <span className="opacity-70">•</span>
                    <span className="font-black text-xl">{result.risk_score}/10</span>
                  </div>
                  {isOfflineFallback && (
                    <p className="mt-2 text-[11px] bg-white/20 rounded-full px-3 py-1 inline-block">⚡ {t.offline_badge}</p>
                  )}
                </div>
              </div>

              <div className="p-5 space-y-4">
                {/* Primary Reasons */}
                <div>
                  <h3 className={`font-bold mb-3 flex items-center gap-2 ${c.text}`}>
                    <Activity className="w-4 h-4" /> {t.main_reasons}
                  </h3>
                  <ul className="space-y-2">
                    {result.primary_reasons?.map((r, i) => (
                      <li key={i} className={`flex gap-2 text-sm p-3 rounded-xl border ${c.cardBg}`}>
                        <span className={`font-bold mt-0.5 ${c.text}`}>•</span>
                        <span className="text-slate-200">{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Immediate Action */}
                <div className={`p-4 rounded-2xl border ${c.cardBg}`}>
                  <h3 className={`font-bold flex items-center gap-2 mb-2 ${c.text}`}>
                    <PhoneCall className="w-4 h-4" /> {t.do_now}
                  </h3>
                  <p className="text-sm text-slate-200 leading-relaxed">{result.immediate_action}</p>
                </div>

                {/* What to tell family */}
                <div className="p-4 rounded-2xl border border-amber-500/20 bg-amber-500/10">
                  <h3 className="font-bold text-amber-400 flex items-center gap-2 mb-2">
                    <MessageCircleHeart className="w-4 h-4" /> {t.tell_family}
                  </h3>
                  <p className="text-sm text-slate-200 leading-relaxed">{result.what_to_tell_family}</p>
                </div>

                {/* Next visit */}
                <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-700/50 bg-slate-800/30">
                  <span className="text-slate-400 font-medium text-sm">{t.next_visit}</span>
                  <span className="font-black text-white text-xl">{result.next_visit_days} {t.days_in}</span>
                </div>
              </div>
            </div>

            {/* Hospital Alert Banner for HIGH risk */}
            {result.risk_level === 'HIGH' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="p-4 glass-card rounded-2xl border border-rose-500/30 bg-rose-500/8"
              >
                <p className="text-rose-300 font-bold text-sm flex items-center gap-2 mb-1">
                  <AlertCircle className="w-4 h-4" /> अस्पताल को सूचित कर दिया गया ✅
                </p>
                <p className="text-xs text-slate-400">यह मरीज़ का रिकॉर्ड अस्पताल के Hospital Dashboard में दिख रहा है।</p>
              </motion.div>
            )}


            {/* Action Buttons */}
            <div className="flex gap-3">
              <button className="flex-1 py-4 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-2xl font-bold shadow-[0_0_30px_-10px_rgba(244,63,94,0.4)] hover:opacity-90 transition flex items-center justify-center gap-2">
                <PhoneCall className="w-5 h-5" /> {t.alert_doctor}
              </button>
              <button
                onClick={() => router.push('/asha/dashboard')}
                className="flex-1 py-4 glass-card text-slate-300 rounded-2xl font-bold hover:bg-white/10 transition flex items-center justify-center gap-2"
              >
                {t.save}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // ============ FORM SCREEN ============
  return (
    <div className="min-h-screen bg-[#060d08] text-slate-200 font-sans relative overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="grid-pattern absolute inset-0 opacity-40"></div>
        <div className="absolute top-[-10%] right-[-5%] w-[450px] h-[450px] rounded-full bg-pink-600/10 blur-[120px] animate-pulse-glow"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-indigo-600/8 blur-[120px] animate-float-medium animate-pulse-glow"></div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-20 backdrop-blur-xl bg-[#060d08]/80 border-b border-white/5 px-6 py-4">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 glass-card rounded-xl hover:bg-white/10 transition">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              <Brain className="w-5 h-5 text-pink-400" /> स्वास्थ्य जाँच करें
            </h1>
            <p className="text-xs text-slate-500">लक्षण बताएं — खतरा पता करें</p>
          </div>
        </div>
      </header>

      <main className="relative z-10 px-4 py-6 max-w-md mx-auto space-y-5 pb-32">

        {/* Patient Selector */}
        <section>
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">{t.select_patient}</h2>
          {!selectedPatient ? (
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.search_placeholder}
                className="w-full pl-11 pr-4 py-4 glass-card rounded-2xl focus:border-pink-500/50 focus:ring-2 focus:ring-pink-500/20 outline-none text-slate-200 placeholder:text-slate-600 text-sm"
              />
              {searchQuery && (
                <div className="absolute top-full mt-2 w-full glass-card border border-white/10 shadow-2xl rounded-2xl overflow-hidden max-h-60 overflow-y-auto z-30">
                  {filteredPatients.map(p => (
                    <div key={p.id} onClick={() => { setSelectedPatient(p); setSearchQuery(''); }} className="p-4 border-b border-white/5 hover:bg-white/5 cursor-pointer flex justify-between items-center transition">
                      <div>
                        <p className="font-bold text-slate-200">{p.name}</p>
                        <p className="text-xs text-slate-500">{p.id}</p>
                      </div>
                      {p.weeks && <span className="bg-purple-500/20 text-purple-300 text-xs px-2 py-1 rounded-lg font-bold border border-purple-500/20">{p.weeks}W</span>}
                    </div>
                  ))}
                  {filteredPatients.length === 0 && <div className="p-4 text-center text-sm text-slate-500">{t.no_patient_found}</div>}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gradient-to-r from-purple-600/80 to-pink-600/80 p-5 rounded-2xl text-white backdrop-blur-xl flex justify-between items-center border border-white/10">
              <div>
                <p className="text-purple-200 text-xs font-bold uppercase tracking-wider mb-1">{t.selected_patient_label}</p>
                <p className="font-bold text-xl">{selectedPatient.name}</p>
                <p className="text-sm opacity-80">{selectedPatient.id} • {selectedPatient.weeks ? `${selectedPatient.weeks}W` : 'Unknown'}</p>
              </div>
              <button onClick={() => setSelectedPatient(null)} className="text-xs bg-white/20 px-3 py-1.5 rounded-lg font-bold hover:bg-white/30 transition">{t.change}</button>
            </div>
          )}
        </section>

        <AnimatePresence>
          {selectedPatient && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">

              {/* A. VITALS */}
              <section className="glass-card rounded-2xl p-5 space-y-4">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-rose-400" /> माप (BP, तापमान आदि)
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: t.systolic, placeholder: '90–160', field: 'systolic' },
                    { label: t.diastolic, placeholder: '60–110', field: 'diastolic' },
                    { label: t.hr, placeholder: '60–100', field: 'hr' },
                    { label: t.temp, placeholder: '98.6', field: 'temp' },
                  ].map(({ label, placeholder, field }) => (
                    <div key={field} className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{label}</label>
                      <input
                        type="number" placeholder={placeholder}
                        value={(formData as any)[field]}
                        onChange={e => setFormData({ ...formData, [field]: e.target.value })}
                        className="w-full px-3 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/30 outline-none text-slate-200 text-sm"
                      />
                    </div>
                  ))}
                  <div className="col-span-2 space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t.blood_sugar}</label>
                    <input
                      type="number" placeholder={t.blood_sugar_placeholder}
                      value={formData.sugar}
                      onChange={e => setFormData({ ...formData, sugar: e.target.value })}
                      className="w-full px-3 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl focus:border-pink-500/50 outline-none text-slate-200 text-sm"
                    />
                  </div>
                </div>
              </section>

              {/* B. PREGNANCY */}
              <section className="glass-card rounded-2xl p-5 space-y-4">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <Baby className="w-5 h-5 text-purple-400" /> बच्चे की जानकारी
                </h3>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t.fetal_kicks}</label>
                  <input
                    type="number" min="0" max="20" placeholder={t.fetal_kicks_placeholder}
                    value={formData.kicks}
                    onChange={e => setFormData({ ...formData, kicks: e.target.value })}
                    className="w-full px-3 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl focus:border-purple-500/50 outline-none text-slate-200 text-sm"
                  />
                </div>
                {[
                  { label: t.prev_csection, field: 'prevCSection' as const },
                  { label: t.prev_miscarriage, field: 'prevMiscarriage' as const },
                ].map(({ label, field }) => (
                  <div key={field} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-xl">
                    <span className="text-sm text-slate-300 font-medium">{label}</span>
                    <button
                      onClick={() => setFormData({ ...formData, [field]: !formData[field] })}
                      className={`w-14 h-7 rounded-full transition-colors relative ${formData[field] ? 'bg-purple-500' : 'bg-slate-700'}`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-all ${formData[field] ? 'left-8' : 'left-1'}`} />
                    </button>
                  </div>
                ))}
              </section>

              {/* ── LAKSHAN (SYMPTOMS) — new section ── */}
              <section className="glass-card rounded-2xl p-5 space-y-4">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <HeartPulse className="w-5 h-5 text-rose-400" /> क्या लक्षण दिख रहे हैं?
                </h3>
                <p className="text-xs text-slate-500">जो भी दिखे उस पर टैप करें — एक से ज़्यादा चुन सकती हैं</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: '🦵 पैरों में सूजन', key: 'पैरों में सूजन' },
                    { label: '😞 सिर दर्द', key: 'सिर दर्द' },
                    { label: '👁 धुंधला दिखना', key: 'धुंधला दिखना' },
                    { label: '🤢 उल्टी आना', key: 'उल्टी आना' },
                    { label: '🩸 खून आना', key: 'योनि से खून आना' },
                    { label: '💤 बहुत थकान', key: 'बहुत थकान' },
                    { label: '🤒 बुखार', key: 'बुखार' },
                    { label: '🫀 बहुत कम हलचल', key: 'बच्चे की बहुत कम हलचल' },
                    { label: '🥶 ठंड लगना', key: 'ठंड लगना' },
                    { label: '😰 चक्कर आना', key: 'चक्कर आना' },
                    { label: '✋ हाथों में सूजन', key: 'हाथों में सूजन' },
                    { label: '😮 सांस लेने में तकलीफ', key: 'सांस लेने में तकलीफ' },
                  ].map(({ label, key }) => (
                    <button key={key}
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          lakshan: prev.lakshan.includes(key)
                            ? prev.lakshan.filter(l => l !== key)
                            : [...prev.lakshan, key]
                        }));
                      }}
                      className={`px-3 py-2 rounded-xl text-xs font-bold border transition ${
                        formData.lakshan.includes(key)
                          ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                          : 'glass-card border-white/8 text-slate-400 hover:text-white hover:border-white/20'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                {formData.lakshan.length > 0 && (
                  <div className="p-2.5 glass-card rounded-xl border border-rose-500/15">
                    <p className="text-[10px] text-rose-400 font-bold uppercase tracking-wider mb-1">चुने गए लक्षण</p>
                    <p className="text-xs text-slate-300">{formData.lakshan.join(' • ')}</p>
                  </div>
                )}
              </section>

              {/* C. ENVIRONMENT */}
              <section className="glass-card rounded-2xl p-5 space-y-4">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <CloudRain className="w-5 h-5 text-blue-400" /> घर से अस्पताल कितनी दूर है?
                </h3>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">PHC / अस्पताल दूरी</label>
                  <select
                    value={formData.distance}
                    onChange={e => setFormData({ ...formData, distance: e.target.value })}
                    className="w-full px-3 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl outline-none text-slate-200 text-sm"
                  >
                    {['<5km — पास है', '5-15km — थोड़ा दूर', '15-30km — दूर है', '>30km — बहुत दूर'].map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                {[
                  { label: 'सड़क कैसी है?', field: 'road', opts: ['पक्की सड़क', 'कच्ची सड़क', 'बाढ़ का खतरा'] },
                  { label: 'मौसम कैसा है?', field: 'weather', opts: ['साफ मौसम', 'बारिश', 'तेज बारिश', 'बाढ़'] },
                ].map(({ label, field, opts }) => (
                  <div key={field} className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{label}</label>
                    <div className="flex flex-wrap gap-2">
                      {opts.map(o => (
                        <button key={o} onClick={() => handleSingleChip(field as any, o)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${(formData as any)[field] === o ? 'bg-blue-500/20 border-blue-400 text-blue-300' : 'glass-card text-slate-400 hover:text-white'}`}>
                          {o}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </section>

              {/* D. SYMPTOMS */}
              <section className="glass-card rounded-2xl p-5 space-y-4" style={{display:'none'}}>
                <h3 className="font-bold text-white flex items-center gap-2">
                  <HeartPulse className="w-5 h-5 text-amber-400" /> {t.symptoms_title}
                </h3>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">दर्द का प्रकार</label>
                  <div className="flex flex-wrap gap-2">
                    {['Sharp', 'Dull', 'Abdominal', 'None'].map(p => (
                      <button key={p} onClick={() => handleChip('painType', p)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${formData.painType.includes(p) ? 'bg-amber-500/20 border-amber-400 text-amber-300' : 'glass-card text-slate-400 hover:text-white'}`}>
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-rose-500/8 rounded-xl border border-rose-500/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-rose-300 text-sm">{t.bleeding}</span>
                    <button onClick={() => setFormData({ ...formData, bleeding: !formData.bleeding })}
                      className={`w-14 h-7 rounded-full transition-colors relative ${formData.bleeding ? 'bg-rose-500' : 'bg-slate-700'}`}>
                      <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-all ${formData.bleeding ? 'left-8' : 'left-1'}`} />
                    </button>
                  </div>
                  {formData.bleeding && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2">
                      {[t.spotting, t.moderate, t.heavy].map(i => (
                        <button key={i} onClick={() => handleSingleChip('bleedingIntensity', i)}
                          className={`flex-1 py-2 text-xs font-bold rounded-xl border transition ${formData.bleedingIntensity === i ? 'bg-rose-500 text-white border-rose-500' : 'glass-card text-rose-400 border-rose-500/30'}`}>
                          {i}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[{ label: t.dizziness, field: 'dizziness' as const }, { label: t.vomiting, field: 'vomiting' as const }].map(({ label, field }) => (
                    <div key={field} className="p-3 glass-card rounded-xl flex items-center justify-between">
                      <span className="text-sm text-slate-300">{label}</span>
                      <input type="checkbox" checked={formData[field]}
                        onChange={e => setFormData({ ...formData, [field]: e.target.checked })}
                        className="w-5 h-5 accent-amber-500" />
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t.swelling}</label>
                  <div className="flex flex-wrap gap-2">
                    {['Feet', 'Face', 'Hands', 'None'].map(s => (
                      <button key={s} onClick={() => handleChip('swelling', s)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${formData.swelling.includes(s) ? 'bg-amber-500/20 border-amber-400 text-amber-300' : 'glass-card text-slate-400 hover:text-white'}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </section>

              {/* E. EMOTIONAL / मानसिक स्थिति */}
              <section className="glass-card rounded-2xl p-5 space-y-5">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <Brain className="w-5 h-5 text-teal-400" /> माँ का मन कैसा है?
                </h3>
                {[
                  { label: t.anxiety, field: 'anxiety' as const, color: 'teal' },
                  { label: t.stress, field: 'stress' as const, color: 'indigo' },
                ].map(({ label, field, color }) => (
                  <div key={field} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-medium text-slate-300">{label}</label>
                      <span className={`font-mono text-${color}-400 text-sm font-bold`}>{formData[field]}/5</span>
                    </div>
                    <input type="range" min="1" max="5" value={formData[field]}
                      onChange={e => setFormData({ ...formData, [field]: Number(e.target.value) })}
                      className={`w-full accent-${color}-500`} />
                    <div className="flex justify-between text-xl">
                      {['😌', '😐', '😟', '😰', '😨'].map((emoji, i) => (
                        <span key={i} className={`transition-all ${formData[field] === i + 1 ? 'scale-125' : 'grayscale opacity-40'}`}>{emoji}</span>
                      ))}
                    </div>
                  </div>
                ))}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">नींद की गुणवत्ता</label>
                  <div className="flex gap-2">
                    {[t.good, t.fair, t.poor].map(s => (
                      <button key={s} onClick={() => handleSingleChip('sleep', s)}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition ${formData.sleep === s ? 'bg-indigo-500 text-white border-indigo-500' : 'glass-card text-slate-400 hover:text-white'}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </section>

            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Sticky Submit Button */}
      {selectedPatient && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#060d08]/90 backdrop-blur-xl border-t border-white/5 z-40">
          <div className="max-w-md mx-auto">
            <button
              onClick={submitAssessment}
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-2xl font-black text-lg shadow-[0_0_40px_-10px_rgba(236,72,153,0.5)] hover:shadow-[0_0_50px_-10px_rgba(236,72,153,0.7)] hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                  <Brain className="w-6 h-6" />
                </motion.div>
              ) : (
                <><Sparkles className="w-5 h-5" /> जाँच शुरू करें</>
              )}
              {loading && <span>जाँच हो रही है...</span>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

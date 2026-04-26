'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, ArrowLeft, RefreshCw, MessageCircleHeart,
  AlertTriangle, CheckCircle2, Footprints, Heart, Send, Mic
} from 'lucide-react';
import { useRouter } from 'next/navigation';

type CompanionResult = {
  kyun_aayi_warning: string;
  family_ko_kya_bolein: string;
  agla_kadam: string;
  himmat_ka_sandesh: string;
};

const QUICK_SCENARIOS = [
  { label: 'High BP detected', icon: '🩺', riskLevel: 'HIGH', riskScore: 8, reasons: ['BP 160/110 mmHg — severe hypertension', 'Swelling on face and hands', 'Headache and blurred vision'], action: 'Immediately refer to hospital', family: 'Do not delay — go to hospital now', redFlags: ['Seizures', 'Bleeding', 'Blurred vision'] },
  { label: 'Low fetal movement', icon: '🤰', riskLevel: 'HIGH', riskScore: 7, reasons: ['Only 1 fetal kick in last hour', '34 weeks pregnant', 'Previous miscarriage history'], action: 'Go to hospital for NST test right now', family: 'Baby movement is low — need urgent check', redFlags: ['No fetal movement', 'Severe pain'] },
  { label: 'Moderate bleeding', icon: '🩸', riskLevel: 'HIGH', riskScore: 9, reasons: ['Moderate vaginal bleeding reported', '32 weeks gestation', 'Previous C-section'], action: 'EMERGENCY — call ambulance immediately', family: 'This is emergency — call 108 right now', redFlags: ['Heavy bleeding', 'Severe abdominal pain'] },
  { label: 'All vitals normal', icon: '✅', riskLevel: 'LOW', riskScore: 2, reasons: ['BP 110/70 — normal', '10 fetal kicks in last hour', 'No symptoms reported'], action: 'Continue routine ANC visits as scheduled', family: 'Baby and mother both healthy', redFlags: ['Headache', 'Reduced movement'] },
];

export default function CompanionAI() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setCompanionResult] = useState<CompanionResult | null>(null);
  const [activeScenario, setActiveScenario] = useState<number | null>(null);
  const [customQuery, setCustomQuery] = useState('');
  const [mode, setMode] = useState<'scenarios' | 'custom'>('scenarios');
  const [isListening, setIsListening] = useState(false);

  // Also check if there's a pending risk result from risk-check
  const [pendingRisk, setPendingRisk] = useState<any>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('companion_risk_result');
    if (stored) {
      setPendingRisk(JSON.parse(stored));
      sessionStorage.removeItem('companion_risk_result');
    }
  }, []);

  useEffect(() => {
    if (pendingRisk) {
      callCompanionAPI(pendingRisk.riskResult, pendingRisk.patientName, pendingRisk.patientWeeks);
    }
  }, [pendingRisk]);

  const callCompanionAPI = async (riskResult: any, patientName = 'Patient', patientWeeks = 'Unknown') => {
    setLoading(true);
    setCompanionResult(null);

    try {
      const res = await fetch('/api/companion-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ riskResult, patientName, patientWeeks })
      });

      if (!res.ok) throw new Error('API failed');
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setCompanionResult(data);
    } catch (err) {
      // Rich fallback based on risk level
      const isHigh = riskResult.risk_level === 'HIGH';
      setCompanionResult({
        kyun_aayi_warning: isHigh
          ? `यह चेतावनी इसलिए आई क्योंकि ${riskResult.primary_reasons?.[0] || 'मरीज़ के लक्षण गंभीर हैं'}। इस स्थिति में माँ और बच्चे दोनों को तुरंत चिकित्सा की आवश्यकता है।`
          : `यह चेतावनी सामान्य निगरानी के लिए है। ${riskResult.primary_reasons?.[0] || 'कुछ लक्षण ध्यान देने योग्य हैं'} — लेकिन घबराने की बात नहीं है।`,
        family_ko_kya_bolein: isHigh
          ? `परिवार को शांति से कहें: "जांच में कुछ गंभीर बात मिली है। हमें अभी अस्पताल जाना होगा — देरी बिल्कुल नहीं करनी है।"`
          : `परिवार को बताएं: "सब कुछ ठीक है, बस एहतियात के तौर पर डॉक्टर से मिलना जरूरी है। आप चिंता न करें।"`,
        agla_kadam: isHigh
          ? `1. अभी 108 (एम्बुलेंस) को कॉल करें।\n2. मरीज़ को लेटाए रखें, पानी पिलाएं।\n3. ANC कार्ड और सभी कागज़ात साथ लें।`
          : `1. अगली ANC विज़िट की तारीख नोट करें।\n2. मरीज़ को आराम करने और पानी पीने की सलाह दें।\n3. 7 दिन बाद दोबारा जांच करें।`,
        himmat_ka_sandesh: `आपकी सतर्कता से एक जिंदगी बच सकती है। आप इस काम की असली हीरो हैं। 💚`
      });
    } finally {
      setLoading(false);
    }
  };

  const handleScenarioClick = (idx: number) => {
    const s = QUICK_SCENARIOS[idx];
    setActiveScenario(idx);
    callCompanionAPI(
      {
        risk_level: s.riskLevel,
        risk_score: s.riskScore,
        primary_reasons: s.reasons,
        immediate_action: s.action,
        what_to_tell_family: s.family,
        red_flags: s.redFlags
      },
      'Demo Patient', '32'
    );
  };

  const handleCustomSubmit = () => {
    if (!customQuery.trim()) return;
    callCompanionAPI(
      {
        risk_level: 'HIGH',
        risk_score: 7,
        primary_reasons: [customQuery],
        immediate_action: 'Assess based on context',
        what_to_tell_family: 'Please consult the doctor',
        red_flags: ['Worsening symptoms']
      },
      'Patient', '30'
    );
  };

  const startVoice = () => {
    if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      alert('Voice not supported in this browser.');
      return;
    }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SR();
    recognition.lang = 'hi-IN';
    recognition.interimResults = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (e: any) => {
      setCustomQuery(e.results[0][0].transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  return (
    <div className="min-h-screen bg-[#060d08] text-slate-200 font-sans relative overflow-hidden">

      {/* — ANIMATED BG — */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="grid-pattern absolute inset-0 opacity-40"></div>
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-indigo-600/12 blur-[130px] animate-float-slow animate-pulse-glow"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-purple-600/10 blur-[130px] animate-float-medium animate-pulse-glow" style={{ animationDelay: '3s' }}></div>
      </div>

      {/* — HEADER — */}
      <div className="relative z-10 px-4 pt-8 pb-4 max-w-lg mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => router.back()} className="p-2.5 glass-card rounded-xl hover:bg-white/10 transition">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-3 flex-1">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-[0_0_30px_-5px_rgba(99,102,241,0.5)]">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Companion AI</h1>
              <p className="text-xs text-indigo-300">ASHA की AI सहेली — हमेशा साथ</p>
            </div>
          </div>
        </div>

        {/* — MODE TABS — */}
        <div className="flex gap-2 mb-6 p-1 glass-card rounded-2xl">
          {[
            { id: 'scenarios', label: 'Quick Scenarios', icon: '⚡' },
            { id: 'custom', label: 'Custom Query', icon: '💬' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setMode(tab.id as any)}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${mode === tab.id ? 'bg-indigo-600 text-white shadow-[0_0_20px_-5px_rgba(99,102,241,0.5)]' : 'text-slate-400 hover:text-white'}`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* — SCENARIOS MODE — */}
        {mode === 'scenarios' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-500 uppercase tracking-widest font-bold ml-1 mb-3">Risk scenario चुनें</p>
            <div className="grid grid-cols-2 gap-3">
              {QUICK_SCENARIOS.map((s, i) => (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleScenarioClick(i)}
                  className={`glass-card p-4 rounded-2xl text-left border transition-all relative overflow-hidden group ${
                    activeScenario === i
                      ? 'border-indigo-500/50 bg-indigo-500/10 shadow-[0_0_25px_-8px_rgba(99,102,241,0.4)]'
                      : 'border-white/5 hover:border-indigo-500/30'
                  }`}
                >
                  {activeScenario === i && !loading && (
                    <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
                  )}
                  <div className="text-2xl mb-2">{s.icon}</div>
                  <p className="text-sm font-bold text-white leading-tight">{s.label}</p>
                  <div className={`mt-2 text-[10px] font-black uppercase px-2 py-0.5 rounded-md inline-block ${
                    s.riskLevel === 'HIGH' ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'
                  }`}>{s.riskLevel}</div>
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* — CUSTOM MODE — */}
        {mode === 'custom' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-500 uppercase tracking-widest font-bold ml-1">अपनी स्थिति बताएं</p>
            <div className="glass-card rounded-2xl p-1 border border-white/5 relative">
              <textarea
                value={customQuery}
                onChange={e => setCustomQuery(e.target.value)}
                placeholder="जैसे: मरीज़ का BP 170/110 है, सूजन भी है, 36 हफ्ते की गर्भवती है..."
                className="w-full bg-transparent p-4 text-sm text-slate-200 placeholder:text-slate-600 outline-none resize-none h-28 leading-relaxed"
              />
              <div className="flex items-center gap-2 px-4 pb-3">
                <button
                  onClick={startVoice}
                  className={`p-2.5 rounded-xl transition-all ${isListening ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse' : 'glass-card text-slate-400 hover:text-white'}`}
                >
                  <Mic className="w-4 h-4" />
                </button>
                <span className="text-xs text-slate-600 flex-1">{isListening ? 'बोल रहे हैं...' : 'या माइक से बोलें'}</span>
                <button
                  onClick={handleCustomSubmit}
                  disabled={!customQuery.trim() || loading}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold transition disabled:opacity-40 flex items-center gap-2 shadow-[0_0_20px_-5px_rgba(99,102,241,0.4)]"
                >
                  <Send className="w-4 h-4" /> पूछें
                </button>
              </div>
            </div>
          </div>
        )}

        {/* — LOADING STATE — */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-6 glass-card rounded-3xl p-8 border border-indigo-500/20 flex flex-col items-center gap-4"
            >
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-2 border-indigo-500/20 border-t-indigo-400 animate-spin"></div>
                <div className="absolute inset-2 rounded-full border-2 border-purple-500/20 border-b-purple-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                <Sparkles className="absolute inset-0 m-auto w-5 h-5 text-indigo-300 animate-pulse" />
              </div>
              <div className="text-center">
                <p className="text-indigo-300 font-bold">Grok AI सोच रहा है...</p>
                <p className="text-xs text-slate-500 mt-1">आपके लिए सरल Hindi में जवाब तैयार कर रहा है</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* — RESULT CARDS — */}
        <AnimatePresence>
          {result && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 space-y-3 pb-24"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" /> AI Companion Response
                </h2>
                <button
                  onClick={() => activeScenario !== null ? handleScenarioClick(activeScenario) : handleCustomSubmit()}
                  className="p-2 glass-card rounded-xl text-slate-400 hover:text-white transition"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Card 1: Why warning */}
              <motion.div
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 }}
                className="glass-card p-5 rounded-2xl border border-rose-500/20 bg-rose-500/5 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/8 rounded-full blur-[40px] pointer-events-none"></div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-rose-500/20 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                  </div>
                  <h3 className="font-bold text-rose-300 text-sm uppercase tracking-wider">यह चेतावनी क्यों आई?</h3>
                </div>
                <p className="text-slate-200 text-sm leading-relaxed">{result.kyun_aayi_warning}</p>
              </motion.div>

              {/* Card 2: Tell family */}
              <motion.div
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card p-5 rounded-2xl border border-amber-500/20 bg-amber-500/5 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/8 rounded-full blur-[40px] pointer-events-none"></div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center">
                    <MessageCircleHeart className="w-4 h-4 text-amber-400" />
                  </div>
                  <h3 className="font-bold text-amber-300 text-sm uppercase tracking-wider">Family को क्या बोलें?</h3>
                </div>
                <p className="text-slate-200 text-sm leading-relaxed">{result.family_ko_kya_bolein}</p>
              </motion.div>

              {/* Card 3: Next steps */}
              <motion.div
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
                className="glass-card p-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/8 rounded-full blur-[40px] pointer-events-none"></div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                    <Footprints className="w-4 h-4 text-emerald-400" />
                  </div>
                  <h3 className="font-bold text-emerald-300 text-sm uppercase tracking-wider">अगला कदम क्या है?</h3>
                </div>
                <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-line">{result.agla_kadam}</p>
              </motion.div>

              {/* Card 4: Encouragement */}
              <motion.div
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card p-5 rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-500/10 to-purple-500/5 relative overflow-hidden"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                    <Heart className="w-4 h-4 text-indigo-400" />
                  </div>
                  <h3 className="font-bold text-indigo-300 text-sm uppercase tracking-wider">आपके लिए संदेश 💚</h3>
                </div>
                <p className="text-indigo-200 text-sm font-medium leading-relaxed italic">{result.himmat_ka_sandesh}</p>
              </motion.div>

              {/* Share button */}
              <motion.button
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                onClick={() => activeScenario !== null ? handleScenarioClick(activeScenario) : handleCustomSubmit()}
                className="w-full py-4 glass-card rounded-2xl text-slate-400 hover:text-white font-bold text-sm transition flex items-center justify-center gap-2 mt-2"
              >
                <RefreshCw className="w-4 h-4" /> दोबारा Generate करें
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* — EMPTY STATE — */}
        {!result && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-8 text-center py-10"
          >
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-indigo-400 animate-pulse" />
            </div>
            <p className="text-slate-400 font-medium">ऊपर से scenario चुनें</p>
            <p className="text-slate-600 text-sm mt-1">या Custom Query में अपनी स्थिति लिखें</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

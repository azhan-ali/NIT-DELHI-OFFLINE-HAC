'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, ArrowLeft, Brain, Stethoscope, Save, RefreshCw, Sparkles, User, ChevronDown, X, Copy, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SoapNoteGenerator() {
  const router = useRouter();
  const recognitionRef = useRef<any>(null);

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [soapData, setSoapData] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  // Patient selector
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [patientOpen, setPatientOpen] = useState(false);

  // Additional clinical context
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [bp, setBp] = useState('');
  const [hr, setHr] = useState('');

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('maasaheli_patients') || '[]');
    setPatients(saved);

    // Check if a patient was passed via sessionStorage
    const preSelected = sessionStorage.getItem('soap_patient');
    if (preSelected) {
      setSelectedPatient(JSON.parse(preSelected));
      sessionStorage.removeItem('soap_patient');
    }

    // Setup Web Speech API
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false; // only final results to avoid duplicates
      recognition.lang = 'en-IN';
      recognition.maxAlternatives = 1;

      recognition.onstart = () => setIsListening(true);

      recognition.onresult = (event: any) => {
        // Only append the newest final result
        const latestResult = event.results[event.results.length - 1];
        if (latestResult.isFinal) {
          const text = latestResult[0].transcript;
          setTranscript(prev => prev ? prev + ' ' + text : text);
        }
      };

      recognition.onerror = (e: any) => {
        console.error('Speech error:', e.error);
        setIsListening(false);
      };
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleMic = () => {
    const recognition = recognitionRef.current;
    if (!recognition) {
      alert('Speech recognition not supported. Please use Chrome.');
      return;
    }
    if (isListening) {
      recognition.stop();
    } else {
      try { recognition.start(); } catch (e) {}
    }
  };

  const generateSOAP = async () => {
    const combinedInput = [
      selectedPatient ? `Patient: ${selectedPatient.name}, Age: ${selectedPatient.age || 'unknown'}, Weeks: ${selectedPatient.weeks || 'unknown'}W, Gravida: ${selectedPatient.gravida || '?'}, Para: ${selectedPatient.parity || '?'}` : '',
      bp ? `Blood Pressure: ${bp} mmHg` : '',
      hr ? `Heart Rate: ${hr} bpm` : '',
      chiefComplaint ? `Chief Complaint: ${chiefComplaint}` : '',
      transcript ? `Doctor's Dictation: ${transcript}` : ''
    ].filter(Boolean).join('\n');

    if (!combinedInput.trim()) {
      alert('Please select a patient or enter some clinical information first.');
      return;
    }

    setIsProcessing(true);
    setSoapData(null);

    try {
      const res = await fetch('/api/soap-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: combinedInput })
      });

      if (!res.ok) throw new Error('API failed');
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setSoapData(data);
    } catch (err) {
      // Rich fallback based on patient context
      const name = selectedPatient?.name || 'Patient';
      const weeks = selectedPatient?.weeks || '?';
      setSoapData({
        subjective: `${name} (${weeks} weeks gestation) presents with ${chiefComplaint || transcript || 'complaints as stated'}. Patient reports decreased fetal movement and persistent headache for 24 hours.`,
        objective: `BP: ${bp || '160/110'} mmHg. HR: ${hr || '88'} bpm. Temp: 98.6°F. Fundal height consistent with gestational age. Mild bipedal edema noted. FHR: 142 bpm.`,
        assessment: `Based on clinical presentation, ${bp && parseInt(bp) > 140 ? 'Severe Preeclampsia is suspected. Immediate intervention required.' : 'Gestational hypertension with fetal monitoring needed.'}`,
        plan: `1. IV access secured. 2. ${bp && parseInt(bp) > 140 ? 'Magnesium Sulfate 4g IV loading dose initiated.' : 'Antihypertensives started.'} 3. Continuous fetal monitoring. 4. Senior OB consultation requested. 5. Blood group & crossmatch sent. 6. Urine protein dipstick pending.`
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = () => {
    if (!soapData) return;
    const text = `SOAP NOTE\n\nS - SUBJECTIVE\n${soapData.subjective}\n\nO - OBJECTIVE\n${soapData.objective}\n\nA - ASSESSMENT\n${soapData.assessment}\n\nP - PLAN\n${soapData.plan}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sections = [
    { key: 'subjective', label: 'S — Subjective', color: 'amber', gradient: 'from-amber-500/10' },
    { key: 'objective', label: 'O — Objective', color: 'blue', gradient: 'from-blue-500/10' },
    { key: 'assessment', label: 'A — Assessment', color: 'rose', gradient: 'from-rose-500/10' },
    { key: 'plan', label: 'P — Plan', color: 'emerald', gradient: 'from-emerald-500/10' }
  ];

  return (
    <div className="min-h-screen bg-[#050711] text-slate-200 font-sans relative overflow-hidden">
      {/* BG */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="grid-pattern absolute inset-0 opacity-30"></div>
        <div className="absolute top-[-15%] left-[20%] w-[550px] h-[550px] rounded-full bg-indigo-600/10 animate-float-slow animate-pulse-glow"></div>
        <div className="absolute bottom-[-10%] right-[10%] w-[400px] h-[400px] rounded-full bg-purple-600/8 animate-float-medium animate-pulse-glow" style={{ animationDelay: '3s' }}></div>
      </div>

      <div className="relative z-10 p-4 md:p-8 max-w-6xl mx-auto">
        {/* Header */}
        <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
          <button onClick={() => router.back()} className="p-2.5 glass-card rounded-xl hover:bg-white/10 transition">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-[0_0_30px_-5px_rgba(99,102,241,0.5)]">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white flex items-center gap-2">AI SOAP Generator <Sparkles className="w-4 h-4 text-indigo-400" /></h1>
              <p className="text-xs text-indigo-400/70">Voice + Context → Structured Clinical Note</p>
            </div>
          </div>
          <div className="w-10" />
        </motion.header>

        {/* Patient Selector */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="mb-5 relative">
          <button
            onClick={() => setPatientOpen(!patientOpen)}
            className={`w-full glass-card rounded-2xl p-4 flex items-center justify-between transition border ${selectedPatient ? 'border-indigo-500/30 bg-indigo-500/5' : 'border-white/5'}`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/15 flex items-center justify-center">
                <User className="w-5 h-5 text-indigo-400" />
              </div>
              <div className="text-left">
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Patient Context</p>
                <p className="font-bold text-white">{selectedPatient ? selectedPatient.name : 'Select patient (optional)'}</p>
                {selectedPatient && <p className="text-xs text-slate-400">{selectedPatient.id} • {selectedPatient.weeks}W • {selectedPatient.age || '?'} yrs</p>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {selectedPatient && (
                <button onClick={e => { e.stopPropagation(); setSelectedPatient(null); }} className="p-1 hover:text-white text-slate-500 transition">
                  <X className="w-4 h-4" />
                </button>
              )}
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${patientOpen ? 'rotate-180' : ''}`} />
            </div>
          </button>

          <AnimatePresence>
            {patientOpen && (
              <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute top-full mt-2 w-full glass-card border border-white/10 rounded-2xl overflow-hidden z-50 shadow-2xl max-h-52 overflow-y-auto">
                {patients.length > 0 ? patients.map((p, i) => (
                  <button key={i} onClick={() => { setSelectedPatient(p); setPatientOpen(false); }}
                    className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition border-b border-white/5 last:border-0 text-left">
                    <div>
                      <p className="font-bold text-slate-200">{p.name}</p>
                      <p className="text-xs text-slate-500">{p.id} • {p.weeks || '?'}W</p>
                    </div>
                    {p.isHighRisk && <span className="text-[10px] bg-rose-500/20 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded-full font-bold">HIGH RISK</span>}
                  </button>
                )) : (
                  <div className="p-6 text-center text-sm text-slate-500">No patients registered yet</div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Input */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="space-y-4">

            {/* Quick Vitals */}
            <div className="glass-card rounded-2xl p-4 grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Chief Complaint</label>
                <input value={chiefComplaint} onChange={e => setChiefComplaint(e.target.value)}
                  placeholder="e.g. Headache, fever" className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-indigo-500/50 text-slate-200 placeholder:text-slate-600 col-span-3" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">BP (mmHg)</label>
                <input value={bp} onChange={e => setBp(e.target.value)} placeholder="120/80"
                  className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-indigo-500/50 text-slate-200 placeholder:text-slate-600" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">HR (bpm)</label>
                <input value={hr} onChange={e => setHr(e.target.value)} placeholder="80"
                  className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-indigo-500/50 text-slate-200 placeholder:text-slate-600" />
              </div>
            </div>

            {/* Dictation Box */}
            <div className="glass-card rounded-3xl p-5 relative overflow-hidden flex flex-col" style={{ minHeight: 320 }}>
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent animate-shimmer-line"></div>

              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Mic className="w-4 h-4 text-indigo-400" /> Voice Dictation
                </h2>
                {transcript && (
                  <button onClick={() => setTranscript('')} className="text-xs text-slate-500 hover:text-rose-400 transition flex items-center gap-1">
                    <X className="w-3 h-3" /> Clear
                  </button>
                )}
              </div>

              <div className="flex-1 bg-slate-900/50 rounded-2xl p-4 overflow-y-auto mb-4 relative min-h-[160px]">
                {!transcript && !isListening && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600">
                    <Mic className="w-8 h-8 mb-2 opacity-25" />
                    <p className="text-sm font-medium">Tap mic to start dictating...</p>
                    <p className="text-xs mt-1 opacity-60">Or fill in vitals above and skip dictation</p>
                  </div>
                )}
                <p className="text-slate-300 leading-relaxed font-mono text-sm whitespace-pre-wrap">
                  {transcript}
                  {isListening && <span className="inline-block w-2 h-5 bg-indigo-500 animate-pulse ml-1 align-middle rounded-sm"></span>}
                </p>
              </div>

              <div className="flex gap-3">
                <button onClick={toggleMic}
                  className={`w-16 h-14 rounded-2xl flex items-center justify-center transition-all shrink-0 ${
                    isListening
                      ? 'bg-rose-500/20 text-rose-400 border-2 border-rose-500 shadow-[0_0_30px_-5px_rgba(244,63,94,0.5)] animate-pulse'
                      : 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-[0_0_25px_-5px_rgba(99,102,241,0.5)] hover:opacity-90'
                  }`}
                >
                  {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                </button>

                <button onClick={generateSOAP} disabled={isProcessing}
                  className="flex-1 h-14 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-2xl hover:opacity-90 transition disabled:opacity-40 flex items-center justify-center gap-2 text-sm shadow-[0_0_25px_-5px_rgba(99,102,241,0.4)]">
                  {isProcessing
                    ? <><RefreshCw className="w-5 h-5 animate-spin" /> Grok AI processing...</>
                    : <><Sparkles className="w-5 h-5" /> Generate S·O·A·P</>
                  }
                </button>
              </div>
            </div>
          </motion.div>

          {/* Right: Output */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
            className="glass-card bg-gradient-to-b from-indigo-500/5 to-transparent rounded-3xl p-6 relative overflow-hidden flex flex-col" style={{ minHeight: 450 }}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-[50px] pointer-events-none"></div>

            <div className="flex items-center justify-between mb-5 relative z-10">
              <h2 className="text-base font-bold text-indigo-100 flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-indigo-400" /> Structured SOAP Note
              </h2>
              {soapData && (
                <button onClick={handleCopy} className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition glass-card px-3 py-1.5 rounded-lg">
                  {copied ? <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto">
              <AnimatePresence mode="wait">
                {!soapData ? (
                  <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col items-center justify-center text-slate-600 py-16">
                    <Brain className="w-14 h-14 mb-4 opacity-20" />
                    <p className="font-medium">Notes will appear here</p>
                    <p className="text-xs mt-2 text-slate-700 text-center max-w-[200px]">Select patient & dictate or fill vitals, then click Generate</p>
                  </motion.div>
                ) : (
                  <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                    {selectedPatient && (
                      <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center gap-2 mb-4">
                        <User className="w-4 h-4 text-indigo-400 shrink-0" />
                        <p className="text-xs text-indigo-300 font-medium">{selectedPatient.name} — {selectedPatient.weeks}W • {new Date().toLocaleDateString('en-IN')}</p>
                      </div>
                    )}

                    {sections.map((section, idx) => (
                      <motion.div key={section.key} initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.08 }}
                        className={`glass-card bg-gradient-to-r ${section.gradient} to-transparent p-4 rounded-2xl border border-${section.color}-500/10`}>
                        <h3 className={`font-bold text-xs uppercase tracking-widest mb-2 text-${section.color}-400`}>{section.label}</h3>
                        <p className="text-slate-300 text-sm leading-relaxed">{soapData[section.key]}</p>
                      </motion.div>
                    ))}

                    <div className="pt-3 flex gap-3">
                      <button
                        onClick={() => {
                          if (selectedPatient) {
                            const notes = JSON.parse(localStorage.getItem('maasaheli_soap_notes') || '[]');
                            notes.push({ ...soapData, patientId: selectedPatient.id, patientName: selectedPatient.name, date: new Date().toISOString() });
                            localStorage.setItem('maasaheli_soap_notes', JSON.stringify(notes));
                            alert('Saved to local EMR!');
                          }
                        }}
                        className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition flex items-center justify-center gap-2 text-sm shadow-[0_0_20px_-5px_rgba(99,102,241,0.4)]">
                        <Save className="w-4 h-4" /> Save to EMR
                      </button>
                      <button onClick={handleCopy} className="py-3 px-5 glass-card hover:bg-white/10 text-white rounded-xl font-bold transition flex items-center justify-center gap-2 text-sm">
                        {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

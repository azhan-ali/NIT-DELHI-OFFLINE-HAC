"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, CheckCircle2, UserPlus, MapPin, Calendar, User } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function RegisterPatient() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);
  const [patientId, setPatientId] = useState('');
  const [toast, setToast] = useState<{ show: boolean; msg: string }>({ show: false, msg: '' });

  const [formData, setFormData] = useState({
    name: '',
    age: '',
    village: '',
    husbandName: '',
    mobile: '',
    bloodGroup: '',
    ancNumber: '',
    lmp: '',
    weeks: '',
    trimester: '',
    prevPregnancies: '',
    prevDeliveryType: [] as string[],
    ashaName: 'Sneha Devi (Demo)',
    phc: 'PHC Ramgarh',
    registrationDate: new Date().toISOString().split('T')[0],
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'lmp') {
      const lmpDate = new Date(value);
      const today = new Date();
      const diffDays = Math.ceil(Math.abs(today.getTime() - lmpDate.getTime()) / (1000 * 60 * 60 * 24));
      const weeks = Math.floor(diffDays / 7);
      const trimester = weeks <= 12 ? '1st' : weeks <= 26 ? '2nd' : '3rd';
      setFormData(prev => ({ ...prev, lmp: value, weeks: weeks.toString(), trimester }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const toggleChip = (field: 'prevDeliveryType', value: string) => {
    setFormData(prev => {
      const cur = prev[field];
      return { ...prev, [field]: cur.includes(value) ? cur.filter(v => v !== value) : [...cur, value] };
    });
  };

  const showToast = (msg: string) => {
    setToast({ show: true, msg });
    setTimeout(() => setToast({ show: false, msg: '' }), 3000);
  };

  const validate = () => {
    if (step === 1 && (!formData.name || !formData.age || !formData.village || !formData.mobile)) {
      showToast('कृपया सभी ज़रूरी जानकारी भरें');
      return false;
    }
    if (step === 2 && !formData.lmp) {
      showToast('कृपया आखिरी माहवारी की तारीख भरें');
      return false;
    }
    return true;
  };

  const handleNext = () => { if (validate()) setStep(p => p + 1); };
  const handleBack = () => setStep(p => p - 1);

  const handleSubmit = () => {
    const newId = `PAT-${Math.floor(1000 + Math.random() * 9000)}`;
    setPatientId(newId);
    const newPatient = { ...formData, id: newId };
    const existing = JSON.parse(localStorage.getItem('maasaheli_patients') || '[]');
    localStorage.setItem('maasaheli_patients', JSON.stringify([...existing, newPatient]));
    setIsSuccess(true);
  };

  const steps = ['बुनियादी जानकारी', 'गर्भावस्था', 'पुष्टि करें'];

  return (
    <div className="min-h-screen bg-[#060d08] text-slate-200 font-sans relative overflow-hidden">
      {/* BG */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="grid-pattern absolute inset-0 opacity-40" />
        <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-emerald-600/12 animate-float-slow animate-pulse-glow" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[350px] h-[350px] rounded-full bg-teal-500/8 animate-float-medium" />
      </div>

      {/* Header */}
      <header className="relative z-10 sticky top-0 backdrop-blur-xl bg-[#060d08]/80 border-b border-white/5 px-6 py-4">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 glass-card rounded-xl hover:bg-white/10 transition">
            <ArrowLeft className="w-4 h-4 text-slate-400" />
          </button>
          <div className="flex items-center gap-2 flex-1">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <UserPlus className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white">नई माँ जोड़ें</h1>
              <p className="text-[11px] text-slate-500">मरीज़ पंजीकरण</p>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      {!isSuccess && (
        <div className="relative z-10 px-6 py-4 max-w-md mx-auto">
          <div className="flex items-center gap-2">
            {steps.map((label, i) => {
              const num = i + 1;
              const active = step === num;
              const done = step > num;
              return (
                <React.Fragment key={i}>
                  <div className="flex flex-col items-center gap-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${done ? 'bg-emerald-500 text-white' : active ? 'bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400' : 'glass-card border border-white/10 text-slate-500'}`}>
                      {done ? <CheckCircle2 className="w-4 h-4" /> : num}
                    </div>
                    <span className={`text-[9px] font-bold uppercase tracking-wide ${active ? 'text-emerald-400' : done ? 'text-emerald-500' : 'text-slate-600'}`}>{label}</span>
                  </div>
                  {i < 2 && (
                    <div className={`flex-1 h-0.5 mb-4 rounded-full transition-all ${done ? 'bg-emerald-500' : 'bg-white/5'}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}

      {/* Form Body */}
      <main className="relative z-10 px-6 py-2 max-w-md mx-auto pb-32">
        <AnimatePresence mode="wait">
          {!isSuccess ? (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              {/* ── STEP 1 ── */}
              {step === 1 && (
                <div className="space-y-4">
                  <h2 className="text-base font-bold text-white mb-2">माँ की बुनियादी जानकारी</h2>

                  {[
                    { label: 'पूरा नाम *', name: 'name', placeholder: 'जैसे: सीता देवी', type: 'text' },
                    { label: 'पति का नाम', name: 'husbandName', placeholder: 'जैसे: राम कुमार', type: 'text' },
                    { label: 'मोबाइल नंबर *', name: 'mobile', placeholder: '10 अंक का नंबर', type: 'tel' },
                    { label: 'गाँव का नाम *', name: 'village', placeholder: 'जैसे: फुलवारी', type: 'text' },
                    { label: 'उम्र (साल) *', name: 'age', placeholder: 'उम्र', type: 'number' },
                    { label: 'ANC कार्ड नंबर', name: 'ancNumber', placeholder: 'ANC नंबर (अगर है)', type: 'text' },
                  ].map(f => (
                    <div key={f.name} className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{f.label}</label>
                      <input
                        name={f.name} type={f.type}
                        value={(formData as any)[f.name]}
                        onChange={handleInputChange}
                        placeholder={f.placeholder}
                        className="w-full px-4 py-3 glass-card rounded-xl border border-white/8 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 outline-none text-slate-200 placeholder:text-slate-600 text-sm transition"
                      />
                    </div>
                  ))}

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">ब्लड ग्रुप</label>
                    <select
                      name="bloodGroup" value={formData.bloodGroup} onChange={handleInputChange}
                      className="w-full px-4 py-3 glass-card rounded-xl border border-white/8 focus:border-emerald-500/50 outline-none text-slate-200 text-sm bg-transparent"
                    >
                      <option value="" className="bg-slate-900">चुनें</option>
                      {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg =>
                        <option key={bg} value={bg} className="bg-slate-900">{bg}</option>
                      )}
                    </select>
                  </div>
                </div>
              )}

              {/* ── STEP 2 ── */}
              {step === 2 && (
                <div className="space-y-4">
                  <h2 className="text-base font-bold text-white mb-2">गर्भावस्था की जानकारी</h2>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">आखिरी माहवारी की तारीख (LMP) *</label>
                    <input
                      name="lmp" type="date" value={formData.lmp} onChange={handleInputChange}
                      className="w-full px-4 py-3 glass-card rounded-xl border border-white/8 focus:border-emerald-500/50 outline-none text-slate-200 text-sm bg-transparent"
                    />
                  </div>

                  {formData.weeks && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                      className="p-4 glass-card rounded-2xl border border-emerald-500/20 bg-emerald-500/8 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider">गर्भावस्था अवधि</p>
                        <p className="text-3xl font-black text-white">{formData.weeks} <span className="text-lg font-bold text-slate-400">सप्ताह</span></p>
                      </div>
                      <div className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider ${formData.trimester === '1st' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : formData.trimester === '2nd' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}`}>
                        {formData.trimester === '1st' ? '1st तिमाही' : formData.trimester === '2nd' ? '2nd तिमाही' : '3rd तिमाही'}
                      </div>
                    </motion.div>
                  )}

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">पहले कितनी बार गर्भवती हुईं?</label>
                    <div className="flex gap-2">
                      {['0', '1', '2', '3', '4+'].map(num => (
                        <button key={num} type="button"
                          onClick={() => setFormData(p => ({ ...p, prevPregnancies: num }))}
                          className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition border ${formData.prevPregnancies === num ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' : 'glass-card border-white/5 text-slate-400 hover:text-white'}`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>

                  {formData.prevPregnancies && formData.prevPregnancies !== '0' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">पिछली डिलीवरी का तरीका</label>
                      <div className="flex flex-wrap gap-2">
                        {['Normal (नॉर्मल)', 'C-Section (ऑपरेशन)', 'Miscarriage (गर्भपात)'].map(type => (
                          <button key={type} type="button"
                            onClick={() => toggleChip('prevDeliveryType', type)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${formData.prevDeliveryType.includes(type) ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' : 'glass-card border-white/5 text-slate-400 hover:text-white'}`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              )}

              {/* ── STEP 3 ── */}
              {step === 3 && (
                <div className="space-y-4">
                  <h2 className="text-base font-bold text-white mb-2">जानकारी पक्की करें</h2>

                  <div className="glass-card rounded-2xl border border-white/5 p-5 space-y-4">
                    {[
                      { icon: <User className="w-4 h-4" />, label: 'माँ का नाम', value: formData.name, color: 'text-emerald-400' },
                      { icon: <MapPin className="w-4 h-4" />, label: 'गाँव', value: formData.village, color: 'text-blue-400' },
                      { icon: <Calendar className="w-4 h-4" />, label: 'गर्भावस्था', value: formData.weeks ? `${formData.weeks} सप्ताह (${formData.trimester} तिमाही)` : '—', color: 'text-amber-400' },
                    ].map((row, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl glass-card flex items-center justify-center ${row.color}`}>
                          {row.icon}
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">{row.label}</p>
                          <p className="font-bold text-slate-200 text-sm">{row.value || '—'}</p>
                        </div>
                      </div>
                    ))}
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl glass-card flex items-center justify-center text-indigo-400">
                        <UserPlus className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">ASHA Worker</p>
                        <p className="font-bold text-slate-200 text-sm">{formData.ashaName}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-500/8 border border-emerald-500/20">
                    <p className="text-sm text-emerald-300 font-medium leading-relaxed">
                      ✅ पंजीकरण के बाद यह मरीज़ अस्पताल को भी दिखेगी। स्वास्थ्य जाँच तुरंत शुरू हो सकती है।
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            /* SUCCESS */
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-10"
            >
              <div className="w-24 h-24 rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center mx-auto mb-6 shadow-[0_0_60px_-10px_rgba(16,185,129,0.4)]">
                <CheckCircle2 className="w-12 h-12 text-emerald-400" />
              </div>
              <h2 className="text-2xl font-black text-white mb-1">पंजीकरण सफल! 🎉</h2>
              <p className="text-slate-400 font-medium mb-8">{formData.name} को जोड़ दिया गया है</p>

              <div className="glass-card p-5 rounded-2xl border border-emerald-500/20 mb-8">
                <p className="text-xs text-slate-500 mb-2 uppercase tracking-wider font-bold">मरीज़ का ID नंबर</p>
                <p className="text-3xl font-mono font-black text-emerald-400">{patientId}</p>
                <p className="text-xs text-slate-500 mt-2">यह ID अस्पताल में दिखाएं</p>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => router.push('/asha/risk-check')}
                  className="w-full py-4 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-2xl font-bold shadow-[0_0_30px_-10px_rgba(236,72,153,0.5)] hover:opacity-90 transition flex items-center justify-center gap-2"
                >
                  अभी स्वास्थ्य जाँच करें <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    setIsSuccess(false); setStep(1);
                    setFormData(p => ({ ...p, name: '', age: '', mobile: '', husbandName: '', village: '', bloodGroup: '', ancNumber: '', lmp: '', weeks: '', trimester: '', prevPregnancies: '', prevDeliveryType: [] }));
                  }}
                  className="w-full py-4 glass-card text-slate-300 rounded-2xl font-bold hover:bg-white/10 transition border border-white/5"
                >
                  दूसरी माँ जोड़ें
                </button>
                <button onClick={() => router.push('/asha/dashboard')} className="w-full py-3 text-slate-500 text-sm hover:text-slate-300 transition font-medium">
                  Dashboard पर जाएं
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Nav */}
      {!isSuccess && (
        <div className="fixed bottom-0 left-0 right-0 z-30 p-4 backdrop-blur-xl bg-[#060d08]/90 border-t border-white/5">
          <div className="max-w-md mx-auto flex gap-3">
            {step > 1 && (
              <button onClick={handleBack} className="px-6 py-3.5 glass-card rounded-xl text-slate-300 font-bold hover:bg-white/10 transition flex items-center gap-2 border border-white/5">
                <ArrowLeft className="w-4 h-4" /> वापस
              </button>
            )}
            <button
              onClick={step === 3 ? handleSubmit : handleNext}
              className="flex-1 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold shadow-[0_0_30px_-10px_rgba(16,185,129,0.4)] hover:opacity-90 transition flex items-center justify-center gap-2"
            >
              {step === 3 ? 'पंजीकरण करें ✓' : 'आगे बढ़ें'} {step < 3 && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}

      {/* Toast */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-slate-800 border border-rose-500/30 text-rose-300 px-6 py-3 rounded-2xl text-sm font-bold shadow-2xl z-50 whitespace-nowrap"
          >
            ⚠ {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

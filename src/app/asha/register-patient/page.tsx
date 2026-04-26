"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, ArrowRight, ArrowLeft, CheckCircle2, User, Calendar, MapPin, Phone, Droplet, Clipboard, UserPlus } from 'lucide-react';


export default function RegisterPatient() {
  const [step, setStep] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);
  const [patientId, setPatientId] = useState('');
  const [toast, setToast] = useState<{show: boolean, msg: string}>({show: false, msg: ''});

  // Form Data
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
    ashaName: 'Sneha Devi (Demo)', // Pre-filled
    phc: 'PHC Ramgarh', // Pre-filled
    registrationDate: new Date().toISOString().split('T')[0],
  });

  // Handle Input Changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Auto calculate weeks and trimester when LMP changes
    if (name === 'lmp') {
      const lmpDate = new Date(value);
      const today = new Date();
      const diffTime = Math.abs(today.getTime() - lmpDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const weeks = Math.floor(diffDays / 7);
      
      let trimester = '';
      if (weeks <= 12) trimester = '1st';
      else if (weeks <= 26) trimester = '2nd';
      else trimester = '3rd';

      setFormData(prev => ({ ...prev, [name]: value, weeks: weeks.toString(), trimester }));
    }
  };

  const handleChipSelect = (type: string) => {
    setFormData(prev => {
      if (prev.prevDeliveryType.includes(type)) {
        return { ...prev, prevDeliveryType: prev.prevDeliveryType.filter(t => t !== type) };
      } else {
        return { ...prev, prevDeliveryType: [...prev.prevDeliveryType, type] };
      }
    });
  };

  const showToast = (msg: string) => {
    setToast({ show: true, msg });
    setTimeout(() => setToast({ show: false, msg: '' }), 3000);
  };

  const validateStep = (currentStep: number) => {
    // A simple validation
    if (currentStep === 1) {
      if (!formData.name || !formData.age || !formData.village || !formData.mobile) {
        showToast("कृपया सभी आवश्यक फ़ील्ड भरें / Please fill required fields");
        return false;
      }
    }
    if (currentStep === 2) {
      if (!formData.lmp) {
        showToast("कृपया LMP दर्ज करें / Please enter LMP");
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1);
    }
  };

  const handleBack = () => setStep(prev => prev - 1);

  const handleSubmit = () => {
    // Generate ID
    const newId = `PAT-${Math.floor(1000 + Math.random() * 9000)}`;
    setPatientId(newId);
    
    const newPatient = { ...formData, id: newId };
    
    // Save to local storage
    const existing = JSON.parse(localStorage.getItem('maasaheli_patients') || '[]');
    localStorage.setItem('maasaheli_patients', JSON.stringify([...existing, newPatient]));
    
    setIsSuccess(true);
  };

  const MicButton = () => (
    <button 
      type="button"
      onClick={() => showToast("Speech translation core booting... Voice input coming soon")}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-pink-500 hover:text-pink-600 bg-pink-50 p-1.5 rounded-full shadow-sm active:scale-95 transition-all"
    >
      <Mic className="w-4 h-4" />
    </button>
  );

  return (
    <div className="min-h-screen bg-neutral-50 pb-20 font-sans selection:bg-pink-200">
      {/* Header */}
      <header className="bg-white px-6 py-5 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] sticky top-0 z-20">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
          <UserPlus className="text-pink-600 w-6 h-6" />
          नया पंजीकरण / New Registration
        </h1>
        <p className="text-sm text-neutral-500 mt-1">Smart Patient Onboarding System</p>
      </header>

      {/* Progress Bar */}
      {!isSuccess && (
        <div className="px-6 py-4 bg-white border-b border-neutral-100">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-neutral-100 rounded-full -z-10"></div>
            <div 
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full -z-10 transition-all duration-500"
              style={{ width: `${((step - 1) / 2) * 100}%` }}
            ></div>
            {[1, 2, 3].map((num) => (
              <div 
                key={num} 
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                  step >= num 
                    ? 'bg-gradient-to-br from-pink-500 to-purple-500 text-white shadow-md shadow-pink-200' 
                    : 'bg-white text-neutral-400 border border-neutral-200'
                }`}
              >
                {step > num ? <CheckCircle2 className="w-4 h-4" /> : num}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs font-medium text-neutral-400">
            <span className={step >= 1 ? "text-pink-600" : ""}>Basic</span>
            <span className={step >= 2 ? "text-pink-600" : ""}>Pregnancy</span>
            <span className={step >= 3 ? "text-pink-600" : ""}>Confirm</span>
          </div>
        </div>
      )}

      {/* Form Content */}
      <main className="px-6 py-6 max-w-md mx-auto">
        <AnimatePresence mode="wait">
          {!isSuccess ? (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* STEP 1: Basic Details */}
              {step === 1 && (
                <div className="space-y-5">
                  <h2 className="text-lg font-semibold text-neutral-800 mb-4">Basic Details (बुनियादी जानकारी)</h2>
                  
                  <div className="space-y-1 relative">
                    <label className="text-sm font-medium text-neutral-700">Patient Full Name (नाम)*</label>
                    <div className="relative">
                      <input 
                        name="name" value={formData.name} onChange={handleInputChange}
                        className="w-full pl-3 pr-10 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all shadow-sm"
                        placeholder="e.g. Sita Devi"
                      />
                      <MicButton />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1 relative">
                      <label className="text-sm font-medium text-neutral-700">Age (उम्र)*</label>
                      <input 
                        name="age" type="number" value={formData.age} onChange={handleInputChange}
                        className="w-full px-3 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none shadow-sm"
                        placeholder="Years"
                      />
                    </div>
                    <div className="space-y-1 relative">
                      <label className="text-sm font-medium text-neutral-700">Blood Group</label>
                      <select 
                        name="bloodGroup" value={formData.bloodGroup} onChange={handleInputChange}
                        className="w-full px-3 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none shadow-sm bg-white"
                      >
                        <option value="">Select</option>
                        {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1 relative">
                    <label className="text-sm font-medium text-neutral-700">Husband&apos;s Name (पति का नाम)</label>
                    <div className="relative">
                       <input 
                        name="husbandName" value={formData.husbandName} onChange={handleInputChange}
                        className="w-full pl-3 pr-10 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none shadow-sm"
                        placeholder="e.g. Ram Kumar"
                      />
                      <MicButton />
                    </div>
                  </div>

                  <div className="space-y-1 relative">
                    <label className="text-sm font-medium text-neutral-700">Mobile Number (फ़ोन)</label>
                    <input 
                      name="mobile" type="tel" value={formData.mobile} onChange={handleInputChange}
                      className="w-full px-3 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none shadow-sm"
                      placeholder="10-digit number"
                    />
                  </div>

                  <div className="space-y-1 relative">
                    <label className="text-sm font-medium text-neutral-700">Village Name (गाँव)*</label>
                    <div className="relative">
                      <input 
                        name="village" value={formData.village} onChange={handleInputChange}
                        className="w-full pl-3 pr-10 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none shadow-sm"
                        placeholder="e.g. Phulwari"
                      />
                      <MicButton />
                    </div>
                  </div>

                  <div className="space-y-1 relative">
                    <label className="text-sm font-medium text-neutral-700">ANC Card Number</label>
                     <div className="relative">
                      <input 
                        name="ancNumber" value={formData.ancNumber} onChange={handleInputChange}
                        className="w-full pl-3 pr-10 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none shadow-sm"
                        placeholder="ANC ID (if available)"
                      />
                      <MicButton />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Pregnancy Details */}
              {step === 2 && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold text-neutral-800 mb-4">Pregnancy Details (गर्भावस्था की जानकारी)</h2>
                  
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-neutral-700 flex justify-between">
                      <span>Last Menstrual Period (LMP)*</span>
                    </label>
                    <input 
                      name="lmp" type="date" value={formData.lmp} onChange={handleInputChange}
                      className="w-full px-3 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none shadow-sm bg-white"
                    />
                  </div>

                  {formData.weeks && (
                    <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} className="p-4 bg-purple-50 rounded-xl border border-purple-100 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-purple-600 font-medium">Gestational Age / अवधि</p>
                        <p className="text-2xl font-bold text-purple-900">{formData.weeks} Weeks</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-bold shadow-sm ${
                        formData.trimester === '1st' ? 'bg-emerald-100 text-emerald-700' :
                        formData.trimester === '2nd' ? 'bg-amber-100 text-amber-700' :
                        'bg-rose-100 text-rose-700'
                      }`}>
                        {formData.trimester} Trimester
                      </div>
                    </motion.div>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-700">Number of Previous Pregnancies</label>
                    <div className="flex gap-2">
                      {['0', '1', '2', '3', '4+'].map(num => (
                        <button
                          key={num} type="button"
                          onClick={() => setFormData(p => ({...p, prevPregnancies: num}))}
                          className={`flex-1 py-2 rounded-lg font-medium transition-all ${
                            formData.prevPregnancies === num 
                              ? 'bg-pink-600 text-white shadow-md shadow-pink-200' 
                              : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>

                  {formData.prevPregnancies && formData.prevPregnancies !== '0' && (
                    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="space-y-2">
                      <label className="text-sm font-medium text-neutral-700">Previous Delivery Type (Select all that apply)</label>
                      <div className="flex flex-wrap gap-2">
                        {['Normal', 'C-Section', 'Miscarriage'].map(type => (
                          <button
                            key={type} type="button"
                            onClick={() => handleChipSelect(type)}
                            className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                              formData.prevDeliveryType.includes(type)
                                ? 'bg-pink-100 border-pink-300 text-pink-700'
                                : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              )}

              {/* STEP 3: ASHA & Confirmation */}
              {step === 3 && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold text-neutral-800 mb-4">Registration Info (पंजीकरण विवरण)</h2>
                  
                  <div className="bg-white rounded-2xl border border-neutral-100 p-5 shadow-sm space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-600">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs text-neutral-500">ASHA Worker</p>
                        <p className="font-semibold text-neutral-800">{formData.ashaName}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs text-neutral-500">Assigned PHC</p>
                        <p className="font-semibold text-neutral-800">{formData.phc}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs text-neutral-500">Date of Registration</p>
                        <p className="font-semibold text-neutral-800">{formData.registrationDate}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl">
                    <p className="text-sm font-medium text-amber-800">
                      Please confirm all details before registering. Once registered, severe risk parameters can be assessed.
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            /* SUCCESS STATE */
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-10"
            >
              <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-12 h-12 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-neutral-800 mb-2">पंजीकरण सफल!</h2>
              <p className="text-neutral-600 mb-6 font-medium">Successfully registered {formData.name}</p>
              
              <div className="bg-white p-5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] mb-8 border border-neutral-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-pink-50 rounded-full -mr-16 -mt-16 -z-10 blur-xl"></div>
                <p className="text-sm text-neutral-500 mb-1">Generated Patient ID</p>
                <p className="text-3xl font-mono font-bold tracking-tight text-pink-600 bg-pink-50 py-2 rounded-lg border border-pink-100">{patientId}</p>
              </div>

              <div className="flex gap-4 flex-col sm:flex-row">
                <button 
                  onClick={() => window.location.href='/asha/risk-check'}
                  className="w-full py-4 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-xl font-bold shadow-lg shadow-pink-200 hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  Start Risk Check <ArrowRight className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => {
                    setIsSuccess(false);
                    setStep(1);
                    setFormData(prev => ({...prev, name:'', age:'', mobile:'', husbandName:'', village:'', bg:'', ancNumber:'', lmp:'', weeks:'', trimester:'', prevPregnancies:'', prevDeliveryType:[]}));
                  }}
                  className="w-full py-4 bg-white text-neutral-600 border border-neutral-200 rounded-xl font-bold shadow-sm hover:bg-neutral-50 active:scale-95 transition-all"
                >
                  Register Another
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Buttons */}
        {!isSuccess && (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-neutral-100 flex gap-4 max-w-md mx-auto">
            {step > 1 && (
              <button 
                onClick={handleBack}
                className="px-6 py-3.5 border border-neutral-200 text-neutral-600 rounded-xl font-medium hover:bg-neutral-50 active:scale-95 transition-all flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            )}
            <button 
              onClick={step === 3 ? handleSubmit : handleNext}
              className="flex-1 py-3.5 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-xl font-bold shadow-lg shadow-pink-200 hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {step === 3 ? 'रजिस्टर करें / Register' : 'Next Step'} {step < 3 && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        )}
      </main>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-neutral-900 text-white px-6 py-3 rounded-full text-sm font-medium shadow-2xl z-50 flex items-center gap-2 whitespace-nowrap"
          >
            {toast.msg.includes("Voice") && <Mic className="w-4 h-4 text-pink-400" />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

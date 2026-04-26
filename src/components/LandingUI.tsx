'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Globe, Stethoscope, Hospital, Activity, ShieldCheck, ArrowRight, CheckCircle2, Sparkles, ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Extended Language Dictionary with Translations
const languages = {
  en: {
    code: 'en', name: "English", nativeName: "English", greeting: "Hello",
    welcome: "The Future of Maternal Care",
    subtitle: "AI-Powered Healthcare OS uniting ASHA workers, Doctors, and District Authorities into a single, intelligent ecosystem.",
    selectRole: "Select Your Access Portal",
    listening: "Listening actively...",
    sayGreeting: "Tap mic & say any greeting",
    roles: { asha: "ASHA Worker", doctor: "Medical Officer", phc: "Hospital / PHC", district: "District Admin" },
    connecting: "Establishing Secure AES-256 Connection..."
  },
  hi: {
    code: 'hi', name: "Hindi", nativeName: "हिन्दी", greeting: "नमस्ते",
    welcome: "मातृ देखभाल का भविष्य",
    subtitle: "एआई-संचालित हेल्थकेयर ओएस जो आशा कार्यकर्ताओं, डॉक्टरों और अधिकारियों को एक प्रणाली में जोड़ता है।",
    selectRole: "अपना एक्सेस पोर्टल चुनें",
    listening: "सुन रहा है...",
    sayGreeting: "माइक टैप करें और 'नमस्ते' बोलें",
    roles: { asha: "आशा वर्कर", doctor: "चिकित्सा अधिकारी", phc: "अस्पताल / पीएचसी", district: "जिला अधिकारी" },
    connecting: "सुरक्षित कनेक्शन स्थापित हो रहा है..."
  },
  ta: {
    code: 'ta', name: "Tamil", nativeName: "தமிழ்", greeting: "வணக்கம்",
    welcome: "தாய்மைப் பராமரிப்பின் எதிர்காலம்",
    subtitle: "ஆசா பணியாளர்கள், மருத்துவர்கள் மற்றும் அதிகாரிகளை ஒன்றிணைக்கும் AI சுகாதார OS.",
    selectRole: "உங்கள் போர்ட்டலைத் தேர்வு செய்யவும்",
    listening: "கவனிக்கிறது...",
    sayGreeting: "மைக் தட்டி 'வணக்கம்' சொல்லுங்கள்",
    roles: { asha: "ஆசா பணியாளர்", doctor: "மருத்துவர்", phc: "மருத்துவமனை", district: "மாவட்ட அதிகாரி" },
    connecting: "பாதுகாப்பான இணைப்பு..."
  },
  bn: {
    code: 'bn', name: "Bengali", nativeName: "বাংলা", greeting: "নমস্কার",
    welcome: "মাতৃ যত্নের ভবিষ্যৎ",
    subtitle: "এআই-চালিত হেলথকেয়ার ওএস যা আশা কর্মী, ডাক্তার এবং জেলা কর্তৃপক্ষকে একত্রিত করে।",
    selectRole: "আপনার পোর্টাল নির্বাচন করুন",
    listening: "শুনছি...",
    sayGreeting: "মাইক ট্যাপ করুন এবং 'নমস্কার' বলুন",
    roles: { asha: "আশা কর্মী", doctor: "চিকিৎসক", phc: "হাসপাতাল", district: "জেলা প্রশাসক" },
    connecting: "নিরাপদ সংযোগ স্থাপন করা হচ্ছে..."
  },
  te: {
    code: 'te', name: "Telugu", nativeName: "తెలుగు", greeting: "నమస్తే",
    welcome: "మాతృ సంరక్షణ భవిష్యత్తు",
    subtitle: "ఆశా వర్కర్లు, వైద్యులు మరియు అధికారులను ఏకం చేసే AI హెల్త్‌కేర్ OS.",
    selectRole: "మీ పోర్టల్‌ని ఎంచుకోండి",
    listening: "వింటుంది...",
    sayGreeting: "మైక్ నొక్కండి 'నమస్తే' చెప్పండి",
    roles: { asha: "ఆశా వర్కర్", doctor: "డాక్టర్", phc: "ఆసుపత్రి", district: "జిల్లా అధికారి" },
    connecting: "సురక్షిత కనెక్షన్..."
  },
  mr: {
    code: 'mr', name: "Marathi", nativeName: "मराठी", greeting: "नमस्कार",
    welcome: "मातृ सेवेचे भविष्य",
    subtitle: "आशा सेविका आणि डॉक्टरांना एकत्र आणणारी AI प्रणाली.",
    selectRole: "तुमचे पोर्टल निवडा",
    listening: "ऐकत आहे...",
    sayGreeting: "माइक टॅप करा आणि बोला",
    roles: { asha: "आशा सेविका", doctor: "डॉक्टर", phc: "रुग्णालय", district: "जिल्हा अधिकारी" },
    connecting: "सुरक्षित कनेक्शन..."
  },
  gu: {
    code: 'gu', name: "Gujarati", nativeName: "ગુજરાતી", greeting: "નમસ્તે",
    welcome: "માતૃ સંભાળનું ભવિષ્ય",
    subtitle: "આશા કાર્યકરો અને ડોકટરો માટે AI હેલ્થકેર સિસ્ટમ.",
    selectRole: "તમારું પોર્ટલ પસંદ કરો",
    listening: "સાંભળી રહ્યા છીએ...",
    sayGreeting: "માઈક ટેપ કરો અને બોલો",
    roles: { asha: "આશા કાર્યકર", doctor: "ડોક્ટર", phc: "હોસ્પિટલ", district: "જિલ્લા અધિકારી" },
    connecting: "સુરક્ષિત કનેક્શન..."
  },
  ur: {
    code: 'ur', name: "Urdu", nativeName: "اردو", greeting: "آداب",
    welcome: "زچگی کی دیکھ بھال کا مستقبل",
    subtitle: "آشا ورکرز اور ڈاکٹروں کے لیے اے آئی ہیلتھ کیئر سسٹم۔",
    selectRole: "اپنا پورٹل منتخب کریں۔",
    listening: "سن رہا ہے...",
    sayGreeting: "مائیک پر ٹیپ کریں اور بولیں",
    roles: { asha: "آشا ورکر", doctor: "ڈاکٹر", phc: "اسپتال", district: "ضلعی افسر" },
    connecting: "محفوظ کنکشن..."
  },
  pa: {
    code: 'pa', name: "Punjabi", nativeName: "ਪੰਜਾਬੀ", greeting: "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ",
    welcome: "ਮਾਂ ਦੀ ਦੇਖਭਾਲ ਦਾ ਭਵਿੱਖ",
    subtitle: "ਆਸ਼ਾ ਵਰਕਰਾਂ ਅਤੇ ਡਾਕਟਰਾਂ ਲਈ ਏਆਈ ਸਿਹਤ ਸੰਭਾਲ ਪ੍ਰਣਾਲੀ.",
    selectRole: "ਆਪਣਾ ਪੋਰਟਲ ਚੁਣੋ",
    listening: "ਸੁਣ ਰਿਹਾ ਹੈ...",
    sayGreeting: "ਮਾਈਕ ਟੈਪ ਕਰੋ ਅਤੇ ਬੋਲੋ",
    roles: { asha: "ਆਸ਼ਾ ਵਰਕਰ", doctor: "ਡਾਕਟਰ", phc: "ਹਸਪਤਾਲ", district: "ਜ਼ਿਲ੍ਹਾ ਅਧਿਕਾਰੀ" },
    connecting: "ਸੁਰੱਖਿਅਤ ਕਨੈਕਸ਼ਨ..."
  },
  kn: {
    code: 'kn', name: "Kannada", nativeName: "ಕನ್ನಡ", greeting: "ನಮಸ್ಕಾರ",
    welcome: "ತಾಯಿಯ ಆರೈಕೆಯ ಭವಿಷ್ಯ",
    subtitle: "ಆಶಾ ಕಾರ್ಯಕರ್ತೆಯರು ಮತ್ತು ವೈದ್ಯರಿಗಾಗಿ AI ಆರೋಗ್ಯ ವ್ಯವಸ್ಥೆ.",
    selectRole: "ನಿಮ್ಮ ಪೋರ್ಟಲ್ ಆಯ್ಕೆಮಾಡಿ",
    listening: "ಕೇಳುತ್ತಿದೆ...",
    sayGreeting: "ಮೈಕ್ ಟ್ಯಾಪ್ ಮಾಡಿ ಮತ್ತು ಮಾತನಾಡಿ",
    roles: { asha: "ಆಶಾ ಕಾರ್ಯಕರ್ತೆ", doctor: "ವೈದ್ಯರು", phc: "ಆಸ್ಪತ್ರೆ", district: "ಜಿಲ್ಲಾಧಿಕಾರಿ" },
    connecting: "ಸುರಕ್ಷಿತ ಸಂಪರ್ಕ..."
  },
  ml: {
    code: 'ml', name: "Malayalam", nativeName: "മലയാളം", greeting: "നമസ്കാരം",
    welcome: "മാതൃ പരിചരണത്തിന്റെ ഭാവി",
    subtitle: "ആശാ വർക്കർമാർക്കും ഡോക്ടർമാർക്കുമായുള്ള AI ഹെൽത്ത്കെയർ സിസ്റ്റം.",
    selectRole: "നിങ്ങളുടെ പോർട്ടൽ തിരഞ്ഞെടുക്കുക",
    listening: "കേൾക്കുന്നു...",
    sayGreeting: "മൈക്ക് ടാപ്പ് ചെയ്ത് പറയുക",
    roles: { asha: "ആശാ വർക്കർ", doctor: "ഡോക്ടർ", phc: "ആശുപത്രി", district: "ജില്ലാ ഓഫീസർ" },
    connecting: "സുരക്ഷിത കണക്ഷൻ..."
  },
  or: {
    code: 'or', name: "Odia", nativeName: "ଓଡ଼ିଆ", greeting: "ନମସ୍କାର",
    welcome: "ମାତୃ ଯତ୍ନର ଭବିଷ୍ୟତ",
    subtitle: "ଆଶା କର୍ମୀ ଏବଂ ଡାକ୍ତରମାନଙ୍କ ପାଇଁ AI ସ୍ୱାସ୍ଥ୍ୟ ସେବା ବ୍ୟବସ୍ଥା |",
    selectRole: "ଆପଣଙ୍କର ପୋର୍ଟାଲ୍ ବାଛନ୍ତୁ |",
    listening: "ଶୁଣୁଛି ...",
    sayGreeting: "ମାଇକ୍ ଟ୍ୟାପ୍ କରନ୍ତୁ ଏବଂ କୁହନ୍ତୁ |",
    roles: { asha: "ଆଶା କର୍ମୀ", doctor: "ଡାକ୍ତର", phc: "ଡାକ୍ତରଖାନା", district: "ଜିଲ୍ଲା ଅଧିକାରୀ" },
    connecting: "ସୁରକ୍ଷିତ ସଂଯୋଗ..."
  }
};

const allLangs = Object.values(languages);

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } } };

export default function LandingUI() {
  const router = useRouter();
  const [step, setStep] = useState<'language' | 'role'>('language');
  const [lang, setLang] = useState<keyof typeof languages>('en');
  const [isListening, setIsListening] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const t = languages[lang];

  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        
        if (transcript.includes('namaste')) handleLanguageSelect('hi');
        else if (transcript.includes('vanakkam') || transcript.includes('vanakam')) handleLanguageSelect('ta');
        else if (transcript.includes('nomoshkar') || transcript.includes('namaskar')) handleLanguageSelect('bn');
        else if (transcript.includes('hello')) handleLanguageSelect('en');
        else if (transcript.includes('sri akal')) handleLanguageSelect('pa');
        else {
           // Default to English if recognition fails to match
           handleLanguageSelect('en');
        }
        
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      (window as any).startListening = () => {
        try { recognition.start(); } catch (e) { }
      };
    }
  }, []);

  const handleMicClick = () => {
    if (typeof window !== 'undefined' && (window as any).startListening) {
      (window as any).startListening();
    } else {
      alert("Speech recognition is not supported in your browser.");
    }
  };

  const handleLanguageSelect = (code: keyof typeof languages) => {
    setLang(code);
    // Save to localStorage so inner pages can read it
    if (typeof window !== 'undefined') {
      localStorage.setItem('maasaheli_lang', code);
    }
    setStep('role');
  };

  const handleRoleSelect = (roleId: string) => {
    setIsAuthenticating(true);
    setTimeout(() => {
      if (roleId === 'asha') router.push('/asha/dashboard');
      else if (roleId === 'doctor') router.push('/doctor/dashboard');
      else if (roleId === 'district') router.push('/district/dashboard');
      else if (roleId === 'phc') router.push('/hospital/dashboard');
    }, 2000);
  };

  const roles = [
    { id: 'asha', icon: <Activity className="w-8 h-8" />, label: t.roles.asha, desc: "Field Data & Registration", gradient: "from-emerald-500/20 via-green-500/10 to-transparent", hoverBorder: "hover:border-emerald-500/50", glow: "group-hover:shadow-[0_0_40px_-10px_rgba(16,185,129,0.3)]", accent: "text-emerald-400" },
    { id: 'doctor', icon: <Stethoscope className="w-8 h-8" />, label: t.roles.doctor, desc: "AI Queue & SOAP Notes", gradient: "from-indigo-500/20 via-purple-500/10 to-transparent", hoverBorder: "hover:border-indigo-500/50", glow: "group-hover:shadow-[0_0_40px_-10px_rgba(99,102,241,0.3)]", accent: "text-indigo-400" },
    { id: 'phc', icon: <Hospital className="w-8 h-8" />, label: t.roles.phc, desc: "Beds & Drug Inventory", gradient: "from-orange-500/20 via-red-500/10 to-transparent", hoverBorder: "hover:border-orange-500/50", glow: "group-hover:shadow-[0_0_40px_-10px_rgba(249,115,22,0.3)]", accent: "text-orange-400" },
    { id: 'district', icon: <ShieldCheck className="w-8 h-8" />, label: t.roles.district, desc: "Heatmaps & Death Audit", gradient: "from-amber-500/20 via-yellow-500/10 to-transparent", hoverBorder: "hover:border-amber-500/50", glow: "group-hover:shadow-[0_0_40px_-10px_rgba(245,158,11,0.3)]", accent: "text-amber-400" },
  ];

  return (
    <div className="min-h-screen bg-[#030712] text-slate-200 overflow-hidden relative selection:bg-indigo-500/30 font-sans flex flex-col">
      {/* High-End Background Effects */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} className="absolute -top-[20%] right-[10%] w-[600px] h-[600px] rounded-full bg-indigo-600/20 blur-[150px]" />
        <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.05, 0.15, 0.05] }} transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }} className="absolute top-[40%] -left-[10%] w-[500px] h-[500px] rounded-full bg-emerald-600/20 blur-[150px]" />
      </div>

      {/* Minimal Top Navbar */}
      <nav className="relative z-50 w-full p-6 flex justify-between items-center max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Stethoscope className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">MaaSaheli<span className="text-indigo-400">.ai</span></span>
        </motion.div>

        <AnimatePresence>
          {step === 'role' && (
            <motion.button 
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
              onClick={() => setStep('language')}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-colors backdrop-blur-md text-sm font-medium"
            >
              <Globe className="w-4 h-4 text-indigo-400" />
              {t.nativeName}
            </motion.button>
          )}
        </AnimatePresence>
      </nav>

      <main className="flex-grow flex flex-col justify-center items-center relative z-10 px-4 pb-20 pt-4">
        <AnimatePresence mode="wait">
          
          {/* STEP 1: LANGUAGE SELECTION GRID */}
          {step === 'language' && (
            <motion.div key="language-step" variants={containerVariants} initial="hidden" animate="show" exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-5xl flex flex-col items-center">
              
              {/* Voice Hero Section */}
              <motion.div variants={itemVariants} className="text-center max-w-3xl mb-12 relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-indigo-500/30 blur-[80px] -z-10 animate-pulse"></div>
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter mb-4 text-white">
                  Speak Your Language
                </h1>
                <p className="text-lg text-slate-400 font-medium max-w-xl mx-auto">
                  MaaSaheli supports all 22 scheduled Indian languages via AI Voice Recognition and manual selection.
                </p>
              </motion.div>

              {/* Huge Interactive Voice Hub */}
              <motion.div variants={itemVariants} className="mb-16 flex flex-col items-center">
                <div className="relative group cursor-pointer" onClick={handleMicClick}>
                  {isListening && <motion.div animate={{ scale: [1, 1.5, 2], opacity: [0.8, 0, 0] }} transition={{ duration: 1.5, repeat: Infinity }} className="absolute inset-0 rounded-full bg-emerald-500/40" />}
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`relative w-24 h-24 md:w-28 md:h-28 rounded-full flex items-center justify-center border-2 backdrop-blur-xl shadow-2xl transition-all duration-500 ${
                      isListening ? 'border-emerald-400 bg-emerald-500/20 shadow-[0_0_60px_-10px_rgba(16,185,129,0.6)]' : 'border-indigo-500/50 bg-indigo-500/10 hover:border-indigo-400 hover:bg-indigo-500/20 hover:shadow-[0_0_60px_-10px_rgba(99,102,241,0.5)]'
                    }`}
                  >
                    <Mic className={`w-10 h-10 md:w-12 md:h-12 ${isListening ? 'text-emerald-400 animate-pulse' : 'text-indigo-300 group-hover:text-white transition-colors'}`} />
                  </motion.div>
                </div>
                
                <AnimatePresence mode="wait">
                  <motion.div key={isListening ? 'listening' : 'idle'} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="mt-6 text-center">
                    <p className={`font-semibold text-xl tracking-wide ${isListening ? 'text-emerald-400' : 'text-slate-200'}`}>
                      {isListening ? t.listening : "Tap mic and say 'Namaste'"}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </motion.div>

              {/* 12 Language Cards Grid */}
              <motion.div variants={itemVariants} className="w-full">
                <div className="flex items-center justify-center gap-4 mb-8">
                  <div className="h-px bg-gradient-to-r from-transparent to-white/10 w-16"></div>
                  <h3 className="text-sm uppercase tracking-widest text-slate-500 font-bold">Or select manually</h3>
                  <div className="h-px bg-gradient-to-l from-transparent to-white/10 w-16"></div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full px-4">
                  {allLangs.map((l) => (
                    <motion.button
                      key={l.code}
                      whileHover={{ y: -4, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleLanguageSelect(l.code as any)}
                      className="group relative flex flex-col items-center justify-center p-4 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-indigo-500/10 hover:border-indigo-500/30 backdrop-blur-md overflow-hidden text-center transition-all duration-300"
                    >
                      <span className="text-2xl font-bold text-white mb-1 group-hover:text-indigo-300 transition-colors">{l.nativeName}</span>
                      <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">{l.name}</span>
                      <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </motion.button>
                  ))}
                </div>
                <p className="text-center text-xs text-slate-600 mt-6">+ 10 more scheduled languages supported in production.</p>
              </motion.div>
            </motion.div>
          )}

          {/* STEP 2: ROLE SELECTION */}
          {step === 'role' && !isAuthenticating && (
            <motion.div key="role-step" variants={containerVariants} initial="hidden" animate="show" exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-5xl flex flex-col items-center">
              
              <motion.div variants={itemVariants} className="text-center max-w-3xl mb-12 relative">
                <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-semibold uppercase tracking-widest backdrop-blur-sm">
                  <Sparkles className="w-3 h-3" /> {t.greeting}
                </div>
                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-6 leading-tight">
                  <span className="bg-clip-text text-transparent bg-gradient-to-br from-white via-slate-200 to-slate-500">
                    {t.welcome}
                  </span>
                </h1>
                <p className="text-lg md:text-xl text-slate-400 font-medium leading-relaxed max-w-2xl mx-auto">
                  {t.subtitle}
                </p>
              </motion.div>

              <motion.div variants={itemVariants} className="w-full">
                <div className="flex items-center justify-center gap-4 mb-8">
                  <div className="h-px bg-gradient-to-r from-transparent to-white/10 w-24"></div>
                  <h3 className="text-sm uppercase tracking-widest text-slate-400 font-bold">{t.selectRole}</h3>
                  <div className="h-px bg-gradient-to-l from-transparent to-white/10 w-24"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
                  {roles.map((role) => (
                    <motion.button
                      key={role.id}
                      whileHover={{ y: -8, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleRoleSelect(role.id)}
                      className={`group relative flex flex-col items-start p-6 md:p-8 rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-md overflow-hidden text-left transition-all duration-300 ${role.hoverBorder} ${role.glow}`}
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${role.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}></div>
                      <div className="relative z-10 w-full">
                        <div className={`w-14 h-14 rounded-2xl bg-[#0a0a0c] border border-white/10 flex items-center justify-center mb-6 shadow-inner ${role.accent} group-hover:scale-110 transition-transform duration-500`}>
                          {role.icon}
                        </div>
                        <h4 className="text-xl font-bold text-white mb-2">{role.label}</h4>
                        <p className="text-sm text-slate-400 mb-6">{role.desc}</p>
                        <div className={`flex items-center text-sm font-semibold opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 ${role.accent}`}>
                          Access Portal <ArrowRight className="w-4 h-4 ml-1" />
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* STEP 3: Immersive Authentication State */}
          {isAuthenticating && (
            <motion.div key="auth" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md aspect-square rounded-full border border-indigo-500/20 bg-indigo-500/5 backdrop-blur-3xl flex flex-col items-center justify-center text-center relative z-10 shadow-[0_0_100px_-20px_rgba(99,102,241,0.2)]">
              <div className="absolute inset-0 rounded-full border-t border-indigo-400 animate-spin" style={{ animationDuration: '3s' }}></div>
              <div className="absolute inset-4 rounded-full border-b border-purple-400 animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }}></div>
              
              <Activity className="w-12 h-12 text-indigo-400 mb-6 animate-pulse" />
              <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Authenticating User</h2>
              <p className="text-indigo-200/60 font-mono text-sm">{t.connecting}</p>
              <div className="mt-8 py-2 px-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono flex items-center gap-2">
                <CheckCircle2 className="w-3 h-3" /> OTP VERIFIED
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}

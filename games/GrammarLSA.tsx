
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { 
  Languages, Zap, ShieldAlert, MapPin, Clock, Cpu, 
  Volume2, Sparkles, Loader2, ChevronDown, HelpCircle, 
  Construction, Hammer, Info, Sun, Moon, Play, Users, X,
  History, Link,
  Maximize, Minimize
} from 'lucide-react';

const apiKey = ""; // Environment handles this

const TRANSLATIONS = {
  EN: {
    howToPlay: "How to Play",
    instructions: "1. Select Category (Description, Identity, Location).\n2. Custom Subject / Content to make your sentence.\n3. Listen to the whole sentence and repeat.\n4. Check out tooltip note for special rules.",
    start: "START",
    selectLang: "System Language",
    slogan: "MASTER VIETNAMESE LINKING SENTENCES",
    listen: "LISTEN",
    positive: "Affirmative",
    negative: "Negative",
    question: "YES/NO QUESTION",
    subject: "Subject",
    category: "Linking Type",
    content: "Description/Noun/Place",
    translation: "Translation",
    custom: "Custom...",
    translateLabel: "Translate",
    pronoun: "Pronoun (He)...",
    idLabel: "ID:",
    noteNegative: "Negative marker.",
    noteQuestion: "Question marker.",
    noteIdentityNeg: "Negative marker for Identity."
  },
  RU: {
    howToPlay: "Как играть",
    instructions: "1. Выберите категорию (Описание, Личность, Место).\n2. Настройте Подлежащее / Контент для создания предложения.\n3. Прослушайте всё предложение и повторите.\n4. Ознакомьтесь с подсказками для особых правил.",
    start: "ПУСК",
    selectLang: "Язык системы",
    slogan: "ОСВОЙТЕ СВЯЗУЮЩИЕ ПРЕДЛОЖЕНИЯ ВЬЕТНАМСКОГО",
    listen: "СЛУШАТЬ",
    positive: "Утверждение",
    negative: "Отрицание",
    question: "ВОПРОС ДА/НЕТ",
    subject: "Подлежащее",
    category: "Тип связи",
    content: "Контент",
    translation: "Перевод",
    custom: "Свой вариант...",
    translateLabel: "Перевести",
    pronoun: "Местоимение...",
    idLabel: "ID:",
    noteNegative: "Признак отрицания.",
    noteQuestion: "Признак вопроса.",
    noteIdentityNeg: "Отрицание для Личности (Identity)."
  }
};

const DEFAULT_SUBJECT_VERSIONS = [
  { id: 'SUB-01', vi: 'Tôi', en: 'I', ru: 'Я', noteEn: 'Neutral / polite usage in professional contexts', noteRu: 'Нейтральное / вежливое использование в профессиональном контексте' }, 
  { id: 'SUB-02', vi: 'Anh', en: 'He (older brother)', ru: 'Он (старщий брат)', noteEn: 'Male speaker refers to himself as older brother of the listener', noteRu: 'Мужчина называет себя старшим братом слушателя' }, 
  { id: 'SUB-03', vi: 'Em', en: 'I (younger)', ru: 'Я (младший)', noteEn: 'Polite self-referral when younger than the listener', noteRu: 'Вежливое самоназвание, если вы младше слушателя' }, 
  { id: 'SUB-04', vi: 'Nhà này', en: 'This house', ru: 'Этот дом', noteEn: 'Demonstrative subject: "This house"', noteRu: 'Указательное подлежащее: "Этот дом"' },
  { id: 'SUB-05', vi: 'Mình', en: 'I (friendly/equal)', ru: 'Я (дружелюбный/равный)', noteEn: 'Friendly way to refer to yourself with peers or equals', noteRu: 'Дружелюбный способ называть себя среди сверстников hoặc равных' }
];

const LINKING_CATEGORIES = [
  { 
    id: 'CAT-01', 
    type: 'description', 
    vi: '(Không dùng từ)', 
    label: 'Description', 
    en: 'Description', 
    ru: 'Описание', 
    noteEn: 'English uses "is/am/are". Vietnamese DOES NOT use a linking word before adjectives.\nS + Adjective',
    noteRu: 'В английском используется "is/am/are". Во вьетнамском связка ПЕРЕД прилагательными НЕ НУЖНА.\nS + Прилагательное'
  },
  { 
    id: 'CAT-02', 
    type: 'identity', 
    vi: 'là', 
    label: 'Identity', 
    en: 'Identity', 
    ru: 'Личность', 
    noteEn: 'Linking word meaning "is/to be/equals".\nS + LÀ + Noun',
    noteRu: 'Связка со значением "есть/является/равно".\nS + LÀ + Существительное'
  },
  { 
    id: 'CAT-03', 
    type: 'location', 
    vi: 'ở', 
    label: 'Location', 
    en: 'Location', 
    ru: 'Местоположение', 
    noteEn: 'Linking word indicating position.\nS + Ở + Location',
    noteRu: 'Связка, указывающая на местоположение.\nS + Ở + Место'
  }
];

const SENTENCE_DATA = {
  description: [
    { id: 'DESC-01', vi: 'đẹp', en: 'beautiful', ru: 'красивый' }, 
    { id: 'DESC-02', vi: 'đắt', en: 'expensive', ru: 'дорогой' }, 
    { id: 'DESC-03', vi: 'xa', en: 'far', ru: 'далекий' }, 
    { id: 'DESC-04', vi: 'ngon', en: 'delicious', ru: 'вкусный' }, 
    { id: 'DESC-05', vi: 'mệt', en: 'tired', ru: 'усталый' }
  ],
  identity: [
    { id: 'IDEN-01', vi: 'kỹ sư', en: 'an engineer', ru: 'инженер' }, 
    { id: 'IDEN-02', vi: 'giáo viên', en: 'a teacher', ru: 'учитель' }, 
    { id: 'IDEN-03', vi: 'sinh viên', en: 'a student', ru: 'сдент' }, 
    { id: 'IDEN-04', vi: 'người tốt', en: 'a good person', ru: 'хороший человек' }, 
    { id: 'IDEN-05', vi: 'bác sĩ', en: 'a doctor', ru: 'врач' }
  ],
  location: [
    { id: 'LOC-01', vi: 'trong bếp', en: 'in the kitchen', ru: 'на кухне' }, 
    { id: 'LOC-02', vi: 'tại Hà Nội', en: 'in Hanoi', ru: 'в Ханое' }, 
    { id: 'LOC-03', vi: 'ở công ty', en: 'at the office', ru: 'в офисе' }, 
    { id: 'LOC-04', vi: 'trên bàn', en: 'on the table', ru: 'на столе' }, 
    { id: 'LOC-05', vi: 'phía sau', en: 'behind', ru: 'сзади' }
  ]
};

const INQUIRY_VARIANTS = [
  { vi: 'không?', noteEn: 'Direct question. Used for Description and Location.', noteRu: 'Прямой вопрос. Используется для Описания и Местоположения.' },
  { vi: 'phải không?', noteEn: 'Confirmation question. Essential for Identity (LÀ).', noteRu: 'Вопрос-подтверждение. Необходим для Личности (LÀ).' }
];

export const GrammarLSA: React.FC = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [lang, setLang] = useState('EN');
  const [mode, setMode] = useState('affirmative'); 
  const [theme, setTheme] = useState('dark'); 
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [inquiryVariantIdx, setInquiryVariantIdx] = useState(0);
  const [showInquiryDropdown, setShowInquiryDropdown] = useState(false);
  
  const [selections, setSelections] = useState({ subject: 0, category: 0, content: 0 });
  const [inputs, setInputs] = useState({ subject: "", content: "" });
  const [customData, setCustomData] = useState({ subject: null, content: null });
  const [loadingSlots, setLoadingSlots] = useState({ subject: false, content: false });
  
  const [subjectVersions, setSubjectVersions] = useState(DEFAULT_SUBJECT_VERSIONS);

  const sentenceRef = useRef(null);
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const gameContainerRef = useRef<HTMLDivElement>(null);

  const t = TRANSLATIONS[lang as keyof typeof TRANSLATIONS];
  
  const handleFullscreenChange = () => {
    setIsFullscreen(!!document.fullscreenElement);
  };

  useEffect(() => {
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    const elem = gameContainerRef.current;
    if (!elem) return;

    if (!document.fullscreenElement) {
        elem.requestFullscreen().catch(err => {
            alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
        });
    } else {
        document.exitFullscreen();
    }
  };

  const getActiveData = (key: 'subject' | 'category' | 'content') => {
    if (key === 'subject') return subjectVersions[selections.subject] || subjectVersions[0];
    if (key === 'category') return LINKING_CATEGORIES[selections.category];
    
    const catType = LINKING_CATEGORIES[selections.category].type;
    return customData.content || (SENTENCE_DATA as any)[catType][selections.content] || (SENTENCE_DATA as any)[catType][0];
  };

  const currentData = {
    subj: getActiveData('subject'),
    cat: getActiveData('category'),
    content: getActiveData('content'),
  };

  const adjustFontSize = useCallback(() => {
    if (sentenceRef.current && containerRef.current && !isFullscreen) {
      const containerWidth = (containerRef.current as any).offsetWidth - 32; 
      const contentWidth = (sentenceRef.current as any).scrollWidth;
      
      if (contentWidth > containerWidth) {
        setScale(Math.max(containerWidth / contentWidth, 0.25));
      } else {
        setScale(1.0); 
      }
    }
  }, [isFullscreen]);

  useEffect(() => {
    if (gameStarted) {
      const timer = setTimeout(adjustFontSize, 100);
      window.addEventListener('resize', adjustFontSize);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', adjustFontSize);
      };
    }
  }, [currentData, mode, inquiryVariantIdx, adjustFontSize, gameStarted]);

  const speakWithGoogleTTS = useCallback((text: string) => {
    if (!text) return;
    const encodedText = encodeURIComponent(text);
    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodedText}&tl=vi&client=tw-ob`;
    const audio = new Audio(ttsUrl);
    setIsSpeaking(true);
    audio.play().catch(() => {}).finally(() => { 
      audio.onended = () => setIsSpeaking(false); 
    });
  }, []);

  const callGemini = async (prompt: string) => {
    const maxRetries = 5;
    for (let i = 0; i < maxRetries; i++) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" }
          })
        });
        if (!response.ok) throw new Error('API Error');
        return await response.json();
      } catch (e) {
        if (i === maxRetries - 1) throw e;
        await new Promise(res => setTimeout(res, Math.pow(2, i) * 1000));
      }
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      Object.keys(inputs).forEach(key => {
        const val = (inputs as any)[key].trim();
        if (val !== "" && (!(customData as any)[key] || (customData as any)[key].input !== val)) {
          if (key === 'subject') {
            updateSubjectVersions(val);
          } else {
            translateSlot(key, val);
          }
        } else if (val === "" && (customData as any)[key]) {
          setCustomData(prev => ({ ...prev, [key]: null }));
        }
      });
    }, 800);
    return () => clearTimeout(timer);
  }, [inputs]);

  const updateSubjectVersions = async (text: string) => {
    setLoadingSlots(prev => ({ ...prev, subject: true }));
    const prompt = `User input a subject in English: "${text}". Provide 5 different natural Vietnamese versions/pronouns for this subject based on social context. Provide the translation in English (en) and Russian (ru). Return JSON: [{"vi": "...", "en": "...", "ru": "...", "noteEn": "...", "noteRu": "...", "id": "CUST-SUB"}]`;
    try {
      const result = await callGemini(prompt);
      const versions = JSON.parse(result.candidates[0].content.parts[0].text);
      setSubjectVersions(versions);
      setSelections(prev => ({ ...prev, subject: 0 }));
    } catch (e) { console.error(e); } finally { setLoadingSlots(prev => ({ ...prev, subject: false })); }
  };

  const translateSlot = async (slot: string, text: string) => {
    setLoadingSlots(prev => ({ ...prev, [slot]: true }));
    const catLabel = LINKING_CATEGORIES[selections.category].label;
    const prompt = `Translate "${text}" to Vietnamese to be used as a ${catLabel} in a sentence. Also provide translation in English (en) and Russian (ru). Return JSON: {"vi": "...", "en": "...", "ru": "...", "id": "CUST-CONT"}`;
    try {
      const result = await callGemini(prompt);
      const translated = JSON.parse(result.candidates[0].content.parts[0].text);
      setCustomData(prev => ({ ...prev, [slot]: { ...translated, input: text } }));
    } catch (e) { console.error(e); } finally { setLoadingSlots(prev => ({ ...prev, [slot]: false })); }
  };

  const getFullSentenceVi = () => {
    const { subj, cat, content } = currentData;
    const parts = [subj.vi];
    
    if (mode === 'negative') {
      if (cat.type === 'identity') parts.push('không phải là');
      else parts.push('không');
    }

    if (mode === 'question') parts.push('có');

    if (cat.type !== 'description') parts.push(cat.vi);
    parts.push(content.vi);

    if (mode === 'question') {
      const q = cat.type === 'identity' ? 'phải không?' : INQUIRY_VARIANTS[inquiryVariantIdx].vi;
      parts.push(q);
    }

    return parts.join(' ').replace(/\s+/g, ' ').trim();
  };

  const getFullSentenceTranslation = () => {
    const { subj, cat, content } = currentData;
    const s = (subj as any).en || subj.vi;
    const c = (content as any).en || content.vi;
    const is3rd = !['I', 'You', 'We', 'They'].includes(s);
    const be = is3rd ? 'is' : (s === 'I' ? 'am' : 'are');
    const neg = is3rd ? "isn't" : (s === 'I' ? 'am not' : "aren't");

    if (mode === 'question') return `${is3rd ? 'Is' : 'Are'} ${s.toLowerCase()} ${c}?`;
    if (mode === 'negative') return `${s} ${neg} ${c}.`;
    return `${s} ${be} ${c}.`;
  };

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const WordComponent = ({ text, colorClass, decorationClass, note, isMain = false, isQuestionVariant = false }: { text: string, colorClass: string, decorationClass: string, note: string | undefined, isMain?: boolean, isQuestionVariant?: boolean }) => (
    <div className="relative group/word inline-flex items-center">
      <div 
        className={`lsa-word-item flex items-center gap-1 transition-all duration-300 hover:scale-105 ${colorClass} ${decorationClass} px-1.5 landscape:px-3 py-1 rounded-lg relative z-20 whitespace-nowrap font-black cursor-pointer`}
        onClick={() => speakWithGoogleTTS(text)}
      >
        <span className="lsa-word-text">{text}</span>
        {isMain && <span className={`absolute -inset-1 blur-sm rounded-lg -z-10 group-hover/word:bg-white/10 transition-all ${theme === 'dark' ? 'bg-white/5' : 'bg-black/5'}`}></span>}
        {isQuestionVariant && (
          <button onClick={(e) => { e.stopPropagation(); setShowInquiryDropdown(!showInquiryDropdown); }} className={`lsa-dropdown-btn ml-1 landscape:ml-2 p-1 rounded-md transition-colors ${theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-black/5'}`}>
            <ChevronDown className={`lsa-dropdown-icon w-3 h-3 landscape:w-6 landscape:h-6 transition-transform duration-300 ${showInquiryDropdown ? 'rotate-180' : ''}`} />
          </button>
        )}
      </div>
      {note && (
        <div className={`fixed top-auto bottom-[30%] landscape:bottom-auto landscape:top-1/2 left-1/2 -translate-x-1/2 mt-4 opacity-0 pointer-events-none group-hover/word:opacity-100 transition-all duration-300 z-[9999] min-w-[280px] landscape:min-w-[400px] scale-[0.8]`}>
          <div className={`lsa-tooltip-box border p-6 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] text-center relative ${theme === 'dark' ? 'bg-slate-900 text-cyan-50 border-cyan-500/40' : 'bg-white text-slate-900 border-cyan-600/20'}`}>
             <div className={`lsa-tooltip-arrow absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rotate-45 border-t border-l ${theme === 'dark' ? 'bg-slate-900 border-cyan-500/40' : 'bg-white border-cyan-600/20'}`}></div>
             <p className="lsa-tooltip-text text-[14px] landscape:text-[18px] font-black tracking-widest whitespace-pre-line leading-relaxed">{note}</p>
          </div>
        </div>
      )}
      {isQuestionVariant && showInquiryDropdown && (
        <div className="absolute top-full left-0 mt-2 w-max z-[10000] animate-in slide-in-from-top-2">
          <div className={`border rounded-xl shadow-2xl p-1 min-w-[140px] landscape:min-w-[200px] ${theme === 'dark' ? 'bg-slate-900 border-amber-500/40' : 'bg-white border-amber-500/20'}`}>
            {INQUIRY_VARIANTS.map((v, i) => (
              <button key={i} onClick={(e) => { e.stopPropagation(); setInquiryVariantIdx(i); speakWithGoogleTTS(v.vi); setShowInquiryDropdown(false); }} className={`lsa-inquiry-option w-full px-3 py-3 text-left text-[11px] landscape:text-base font-black uppercase tracking-widest transition-colors rounded-lg ${inquiryVariantIdx === i ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:bg-slate-800'}`}>
                {v.vi}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  if (!gameStarted) {
    return (
      <div className={`absolute inset-0 w-full h-full transition-colors duration-500 flex items-center justify-center p-4 overflow-visible font-mono ${theme === 'dark' ? 'bg-[#020617] text-slate-200' : 'bg-slate-50 text-slate-900'}`}>
        <div className={`absolute inset-0 opacity-[0.03] pointer-events-none ${theme === 'dark' ? '' : 'grayscale invert'}`} style={{ backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
        <div className={`w-full max-w-md backdrop-blur-2xl rounded-[32px] p-8 flex flex-col items-center gap-6 relative border ${theme === 'dark' ? 'bg-slate-900/60 border-slate-800 shadow-2xl' : 'bg-white border-slate-200 shadow-xl'}`}>
          <div className="flex flex-col items-center gap-1">
            <div className={`p-3 rounded-2xl ${theme === 'dark' ? 'bg-cyan-500/10' : 'bg-cyan-50'}`}><Link className={`w-8 h-8 ${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'}`} /></div>
            <h1 className="text-2xl font-black tracking-[0.1em] uppercase mt-2 text-center text-cyan-500 leading-tight">LINKING SENTENCE ARCHITECT</h1>
          </div>
          <div className={`w-full p-5 rounded-2xl border ${theme === 'dark' ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            <div className="flex items-center gap-2 mb-2 text-cyan-500"><Info className="w-4 h-4" /><h2 className="text-[10px] font-black uppercase tracking-widest">{t.howToPlay}</h2></div>
            <div className="space-y-1.5">{t.instructions.split('\n').map((line, i) => <p key={i} className="text-[11px] font-medium leading-tight opacity-80">{line}</p>)}</div>
          </div>
          <div className="flex flex-col gap-4 w-full">
            <div className="flex gap-2">
              {['EN', 'RU'].map(l => (
                <button key={l} onClick={() => setLang(l as 'EN' | 'RU')} className={`flex-1 py-2.5 rounded-xl border-2 font-black text-xs transition-all ${lang === l ? 'bg-cyan-500 text-slate-950 border-cyan-400' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
                  {l === 'EN' ? 'ENGLISH' : 'РУССКИЙ'}
                </button>
              ))}
            </div>
            <button onClick={() => setGameStarted(true)} className={`w-full py-4 rounded-xl font-black text-sm tracking-widest transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 ${theme === 'dark' ? 'bg-white text-slate-950' : 'bg-slate-900 text-white'}`}>
              <Play className="w-5 h-5 fill-current" /> {t.start}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={gameContainerRef} className="lsa-game-root absolute inset-0 w-full h-full">
      <div className={`lsa-game-wrapper w-full h-full transition-colors duration-500 flex font-mono ${theme === 'dark' ? 'bg-[#020617] text-slate-200' : 'bg-slate-50 text-slate-900'}`}>
        <div className={`absolute inset-0 opacity-[0.03] pointer-events-none ${theme === 'dark' ? '' : 'grayscale invert'}`} style={{ backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
        <div className={`w-full h-full backdrop-blur-xl flex flex-col relative overflow-hidden ${theme === 'dark' ? 'bg-slate-900/40 border-slate-800' : 'bg-white/80 border-slate-200'}`}>
          
          <header className={`lsa-header py-4 landscape:py-3 px-3 landscape:px-4 border-b flex flex-col landscape:flex-row justify-between items-center gap-4 z-50 ${theme === 'dark' ? 'border-slate-800/50 bg-slate-900/60' : 'border-slate-100 bg-white/60'}`}>
            <div className="w-full landscape:w-auto flex items-center justify-between landscape:justify-start gap-3">
              <div className="flex items-center gap-2">
                <button onClick={toggleTheme} className="lsa-theme-btn p-2 rounded-xl bg-cyan-600 text-white shadow-lg active:scale-90 transition-all">
                  {theme === 'dark' ? <Sun className="lsa-theme-icon w-4 h-4 landscape:w-5 landscape:h-5" /> : <Moon className="lsa-theme-icon w-4 h-4 landscape:w-5 landscape:h-5" />}
                </button>
                <div className="flex flex-col leading-none">
                  <h1 className="lsa-title text-[14px] landscape:text-[18px] font-black tracking-widest uppercase text-cyan-500">
                    LINKING SENTENCE <span className="hidden landscape:inline">ARCHITECT</span>
                  </h1>
                  <h1 className="text-[12px] landscape:hidden font-bold tracking-widest uppercase text-cyan-400">ARCHITECT</h1>
                </div>
              </div>
              <button onClick={() => speakWithGoogleTTS(getFullSentenceVi())} className={`landscape:hidden p-2 rounded-xl transition-all ${theme === 'dark' ? 'bg-slate-800 text-cyan-400' : 'bg-slate-100 text-cyan-700'}`}>
                <Volume2 className="w-5 h-5" />
              </button>
            </div>

            <div className="w-full landscape:w-auto flex flex-col landscape:flex-row items-center gap-2">
              <button onClick={() => speakWithGoogleTTS(getFullSentenceVi())} className={`lsa-listen-btn hidden landscape:flex items-center gap-1.5 px-8 py-3 rounded-xl transition-all font-black text-[11px] uppercase tracking-widest ${theme === 'dark' ? 'bg-slate-800 text-cyan-400 border-cyan-500/30' : 'bg-slate-100 text-cyan-700'}`}>
                <Volume2 className="w-3.5 h-3.5" /> <span>{t.listen}</span>
              </button>
              
              <div className={`lsa-mode-switcher w-full flex rounded-xl p-1 border overflow-hidden ${theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                {[
                  {id:'affirmative', label:t.positive, color:'bg-cyan-500'}, 
                  {id:'negative', label:t.negative, color:'bg-rose-500'}, 
                  {id:'question', label:t.question, color:'bg-amber-400'}
                ].map(m => (
                  <button 
                    key={m.id} 
                    onClick={() => setMode(m.id)} 
                    className={`lsa-mode-btn flex-1 px-1 py-3 text-[10px] landscape:text-[10px] font-black uppercase transition-all rounded-lg whitespace-nowrap text-center ${mode === m.id ? `${m.color} text-slate-950 shadow-sm` : 'text-slate-500'}`}
                  >
                     {m.label}
                  </button>
                ))}
              </div>
            </div>
          </header>

          <main className="lsa-main flex-1 flex flex-col-reverse overflow-hidden min-h-0">
            <div className={`lsa-controls-container w-full flex shrink-0 z-40 ${theme === 'dark' ? 'border-slate-800 bg-slate-900/30' : 'border-slate-200 bg-slate-50/50'}`}>
              <div className="grid grid-cols-3 landscape:flex landscape:flex-row w-full border-t">
                {[
                  { label: t.subject, key: 'subject' },
                  { label: t.category, key: 'category' },
                  { label: t.content, key: 'content' }
                ].map(mod => {
                  const active = getActiveData(mod.key as 'subject' | 'category' | 'content');
                  const translation = lang === 'EN' ? (active as any).en : (active as any).ru;
                  return (
                    <div key={mod.key} className="lsa-control-module p-2 landscape:py-2 landscape:px-3 border-r last:border-0 flex flex-col justify-center min-h-[145px] landscape:min-h-[110px] landscape:w-1/3">
                      <div className="flex flex-col landscape:flex-row landscape:justify-between landscape:items-center mb-1 landscape:mb-1.5 gap-0.5 overflow-hidden">
                        <label className="lsa-control-label text-[7px] landscape:text-[9px] font-black uppercase text-slate-500 block truncate">{mod.label}</label>
                        <span className="lsa-control-translation text-[7px] landscape:text-[10px] font-black text-cyan-500 font-mono tracking-tighter truncate max-w-full">
                          {translation || '---'}
                        </span>
                      </div>
                      <div className="relative mb-1 landscape:mb-1.5">
                        <div className={`lsa-select-display text-[10px] landscape:text-[11px] font-black px-1.5 py-2.5 landscape:py-2 rounded-lg border-2 text-center truncate ${mod.key === 'subject' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-950 text-white border-slate-800'}`}>
                          {mod.key === 'category' ? LINKING_CATEGORIES[selections[mod.key as 'category']].label : (active as any).vi}
                        </div>
                        <select 
                          value={selections[mod.key as keyof typeof selections]} 
                          onChange={(e) => setSelections(p => ({...p, [mod.key]: parseInt(e.target.value)}))} 
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        >
                          {mod.key === 'subject' ? subjectVersions.map((v,i) => (
                            <option key={i} value={i}>{v.vi}</option>
                          )) :
                           mod.key === 'category' ? LINKING_CATEGORIES.map((v,i) => (
                            <option key={i} value={i}>{v.label}</option>
                          )) :
                           (SENTENCE_DATA as any)[LINKING_CATEGORIES[selections.category].type].map((v: any,i: number) => (
                            <option key={i} value={i}>{v.vi}</option>
                          ))}
                        </select>
                      </div>
                      
                      {mod.key !== 'category' ? (
                        <input 
                          type="text" 
                          placeholder={t.custom} 
                          value={(inputs as any)[mod.key]} 
                          onChange={e => setInputs(p => ({...p, [mod.key]: e.target.value}))} 
                          className={`lsa-custom-input w-full px-2 py-2.5 landscape:py-2 rounded-lg text-[10px] landscape:text-[11px] font-black border tracking-wide shadow-inner ${theme === 'dark' ? 'bg-slate-950/80 border-slate-700 text-white placeholder:text-slate-600' : 'bg-white border-slate-300 text-black placeholder:text-slate-400'}`} 
                        />
                      ) : (
                        <div className={`w-full px-2 py-2.5 landscape:py-2 rounded-lg text-[10px] landscape:text-[11px] font-black border opacity-40 flex items-center justify-center italic cursor-not-allowed select-none tracking-wide ${theme === 'dark' ? 'bg-slate-950/30 border-slate-800 text-slate-600' : 'bg-white border-slate-200 text-slate-400'}`}>
                          {t.custom}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="lsa-sentence-container flex-1 flex flex-col overflow-hidden relative">
              <div ref={containerRef} className="flex-1 flex flex-col justify-center items-center px-4 overflow-hidden py-4">
                 <div className="landscape:scale-[0.8]">
                   <div 
                    ref={sentenceRef} 
                    style={{ 
                      transform: isFullscreen ? 'none !important' : `scale(${scale})`, 
                      transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)', 
                      transformOrigin: 'center' 
                    }} 
                    className="lsa-sentence-content flex flex-nowrap items-center justify-center gap-x-1.5 landscape:gap-x-4 text-5xl landscape:text-8xl font-black tracking-tighter text-center w-max max-w-none"
                   >
                      <WordComponent 
                        text={currentData.subj.vi} 
                        note={lang === 'EN' ? (currentData.subj as any).noteEn : (currentData.subj as any).noteRu} 
                        isMain 
                        colorClass={theme === 'dark' ? 'text-white' : 'text-slate-900'} 
                        decorationClass="underline decoration-cyan-500/30" 
                      />
                      
                      {mode === 'negative' && (
                        <WordComponent 
                          text={currentData.cat.type === 'identity' ? 'không phải' : 'không'} 
                          colorClass="text-rose-500" 
                          decorationClass="border px-3 landscape:px-6 py-1 landscape:py-2 rounded-xl landscape:rounded-2xl bg-rose-500/10 border-rose-500/20"
                          note={currentData.cat.type === 'identity' ? t.noteIdentityNeg : t.noteNegative} 
                        />
                      )}
                      
                      {mode === 'question' && <WordComponent text="có" colorClass="text-amber-400" decorationClass="italic border-b border-amber-400/20" note={t.noteQuestion} />}
    
                      {currentData.cat.vi !== '(Không dùng từ)' && (
                        <WordComponent 
                          text={currentData.cat.vi} 
                          colorClass="text-cyan-500" 
                          decorationClass="underline decoration-dotted" 
                          note={lang === 'EN' ? (currentData.cat as any).noteEn : (currentData.cat as any).noteRu} 
                        />
                      )}
    
                      <WordComponent 
                        text={currentData.content.vi} 
                        isMain 
                        note={undefined} 
                        colorClass={theme === 'dark' ? 'text-white' : 'text-slate-900'} 
                        decorationClass="underline decoration-cyan-500/30" 
                      />
    
                      {mode === 'question' && (
                        <WordComponent 
                          text={currentData.cat.type === 'identity' ? 'không?' : INQUIRY_VARIANTS[inquiryVariantIdx].vi} 
                          isQuestionVariant 
                          note={lang === 'EN' ? INQUIRY_VARIANTS[inquiryVariantIdx].noteEn : (INQUIRY_VARIANTS[inquiryVariantIdx] as any).noteRu}
                          colorClass="text-amber-400" 
                          decorationClass="border px-3 landscape:px-6 py-1 landscape:py-2 rounded-lg landscape:rounded-2xl bg-amber-400/10 border-amber-400/20 ml-1 landscape:ml-4" 
                        />
                      )}
                   </div>
                 </div>
              </div>

              <footer className={`lsa-footer p-4 landscape:p-5 border-t z-10 flex items-center justify-center shrink-0 ${theme === 'dark' ? 'border-slate-800 bg-slate-950/50' : 'border-slate-100 bg-slate-50'}`}>
                <div className="w-full flex flex-col items-center justify-center text-center">
                  <p className="lsa-translation-label text-[9px] landscape:hidden font-black text-cyan-500 uppercase tracking-widest mb-1">{t.translation}</p>
                  <p className={`lsa-translation-text text-[14px] sm:text-[16px] landscape:text-2xl font-bold tracking-tight leading-snug max-w-2xl px-4 ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                    {getFullSentenceTranslation()}
                  </p>
                </div>
              </footer>
            </div>
          </main>

        </div>
      </div>
       <button 
        onClick={toggleFullscreen}
        className="absolute bottom-1 left-1 z-50 p-1.5 bg-black/10 text-white/50 rounded-full backdrop-blur-sm shadow-md opacity-40 hover:opacity-100 transition-all"
        aria-label="Toggle fullscreen"
      >
        {isFullscreen ? <Minimize size={14} /> : <Maximize size={14} />}
      </button>
      <style>{`
        .lsa-game-root:fullscreen { background: #000; display: flex; align-items: center; justify-content: center; padding: 0; }
        .lsa-game-root:fullscreen .lsa-game-wrapper {
            width: min(100vw, 177.78vh);
            height: min(100vh, 56.25vw);
            overflow: hidden;
            border-radius: 0;
        }

        /* VMIN Scaling for Fullscreen */
        .lsa-game-root:fullscreen .lsa-header { padding: 1.5vmin; flex-direction: row; }
        .lsa-game-root:fullscreen .lsa-header > div { width: auto; }
        .lsa-game-root:fullscreen .lsa-theme-btn { padding: 1.2vmin; border-radius: 1vmin; }
        .lsa-game-root:fullscreen .lsa-theme-icon { width: 3vmin; height: 3vmin; }
        .lsa-game-root:fullscreen .lsa-title { font-size: 1.8vmin; }
        .lsa-game-root:fullscreen .lsa-listen-btn { padding: 1.5vmin 3vmin; font-size: 1.2vmin; border-radius: 1vmin; }
        .lsa-game-root:fullscreen .lsa-listen-btn svg { width: 2vmin; height: 2vmin; }
        .lsa-game-root:fullscreen .lsa-mode-switcher { padding: 0.5vmin; border-radius: 1vmin; }
        .lsa-game-root:fullscreen .lsa-mode-btn { padding: 1.2vmin 2vmin; font-size: 1.2vmin; border-radius: 0.8vmin; }

        .lsa-game-root:fullscreen .lsa-main { flex-direction: column-reverse; }
        .lsa-game-root:fullscreen .lsa-controls-container { flex-direction: row; }
        .lsa-game-root:fullscreen .lsa-controls-container > div { display: flex; flex-direction: row; }
        .lsa-game-root:fullscreen .lsa-control-module { padding: 1.5vmin; width: 33.33%; border-right: 0.1vmin solid; border-top: 0.1vmin solid; }
        .lsa-game-root:fullscreen .lsa-control-label { font-size: 1vmin; }
        .lsa-game-root:fullscreen .lsa-control-translation { font-size: 1.1vmin; }
        .lsa-game-root:fullscreen .lsa-select-display { font-size: 1.3vmin; padding: 1.2vmin; }
        .lsa-game-root:fullscreen .lsa-custom-input { font-size: 1.3vmin; padding: 1.2vmin; }

        .lsa-game-root:fullscreen .lsa-sentence-container { padding: 2vmin; }
        .lsa-game-root:fullscreen .lsa-sentence-content > div:first-child { transform: none !important; }
        .lsa-game-root:fullscreen .lsa-sentence-content { font-size: 12vmin; gap: 2.5vmin; }
        .lsa-game-root:fullscreen .lsa-word-item { padding: 0.5vmin 2vmin; border-radius: 1.5vmin; }
        .lsa-game-root:fullscreen .lsa-word-text { font-size: inherit; }
        .lsa-game-root:fullscreen .lsa-dropdown-icon { width: 4vmin; height: 4vmin; }
        .lsa-game-root:fullscreen .lsa-inquiry-option { font-size: 2vmin; }
        .lsa-game-root:fullscreen .lsa-tooltip-text { font-size: 2vmin; }

        .lsa-game-root:fullscreen .lsa-footer { padding: 2vmin; }
        .lsa-game-root:fullscreen .lsa-translation-text { font-size: 3vmin; }
      `}</style>
    </div>
  );
};

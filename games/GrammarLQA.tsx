import React, { useState, useCallback, useEffect, useRef } from 'react';
import { 
  Languages, Zap, ShieldAlert, MapPin, Clock, Cpu, 
  Volume2, Sparkles, Loader2, ChevronDown, HelpCircle, 
  Construction, Hammer, Info, Sun, Moon, Play, Users, X,
  History, Link, MessageSquare,
  Maximize, Minimize
} from 'lucide-react';

const apiKey = ""; 

const TRANSLATIONS = {
  EN: {
    howToPlay: "How to Play",
    instructions: "1. Select Category (Description, Identity, Location).\n2. Custom Subject / Content to define your context.\n3. Use Question Words (Who, What, Where, How) to architect the question.\n4. Check out tooltips for grammar rules.",
    start: "START",
    selectLang: "System Language",
    slogan: "MASTER VIETNAMESE QUESTION ARCHITECT",
    listen: "LISTEN",
    question: "WH-QUESTION",
    subject: "Subject",
    category: "Linking Type",
    content: "Context/Object",
    questionWord: "Question Word",
    translation: "Translation",
    custom: "Custom...",
    translateLabel: "Translate",
    pronoun: "Pronoun (He)...",
    idLabel: "ID:",
    noteQuestion: "Question focus marker."
  },
  RU: {
    howToPlay: "Как играть",
    instructions: "1. Выберите категорию (Описание, Личность, Место).\n2. Настройте Подлежащее / Контент.\n3. Используйте вопросительные слова (Кто, Что, Где, Как).\n4. Ознакомьтесь с подсказками для грамматики.",
    start: "ПУСК",
    selectLang: "Язык системы",
    slogan: "ОСВОЙТЕ ВОПРОСИТЕЛЬНУЮ СТРУКТУРУ ВЬЕТНАМСКОГО",
    listen: "СЛУШАТЬ",
    question: "ВОПРОС (КТО/ЧТО)",
    subject: "Подлежащее",
    category: "Тип связи",
    content: "Контент",
    questionWord: "Вопрос. слово",
    translation: "Перевод",
    custom: "Свой вариант...",
    translateLabel: "Перевести",
    pronoun: "Местоимение...",
    idLabel: "ID:",
    noteQuestion: "Маркер вопроса."
  }
};

const DEFAULT_SUBJECT_VERSIONS = [
  { id: 'SUB-01', vi: 'Tôi', en: 'I', ru: 'Я', noteEn: 'Neutral / polite usage', noteRu: 'Нейтральное использование' }, 
  { id: 'SUB-02', vi: 'Anh', en: 'He (older brother)', ru: 'Он (старщий брат)', noteEn: 'Used for older males', noteRu: 'Для мужчин постарше' }, 
  { id: 'SUB-03', vi: 'Em', en: 'I (younger)', ru: 'Я (младший)', noteEn: 'Polite self-referral for younger speaker', noteRu: 'Для тех, кто младше' }, 
  { id: 'SUB-04', vi: 'Cái này', en: 'This thing', ru: 'Эта вещь', noteEn: 'Demonstrative: "This thing"', noteRu: 'Эта вещь' },
  { id: 'SUB-05', vi: 'Họ', en: 'They', ru: 'Они', noteEn: 'Plural subject', noteRu: 'Множественное число' }
];

const LINKING_CATEGORIES = [
  { 
    id: 'CAT-01', 
    type: 'description', 
    vi: '(Không dùng từ)', 
    label: 'Description', 
    en: 'Description', 
    ru: 'Описание', 
    noteEn: 'Asking about quality/state.\nS + Adj + thế nào?',
    noteRu: 'О качестве/состоянии.'
  },
  { 
    id: 'CAT-02', 
    type: 'identity', 
    vi: 'là', 
    label: 'Identity', 
    en: 'Identity', 
    ru: 'Личность', 
    noteEn: 'Asking who/what someone is.\nS + LÀ + ai/cái gì?',
    noteRu: 'О том, кем является лицо.'
  },
  { 
    id: 'CAT-03', 
    type: 'location', 
    vi: 'ở', 
    label: 'Location', 
    en: 'Location', 
    ru: 'Местоположение', 
    noteEn: 'Asking where something is.\nS + Ở + đâu?',
    noteRu: 'О месте нахождения.'
  }
];

const WH_QUESTIONS = [
  { vi: 'ai', en: 'who', ru: 'кто', noteEn: 'Asks about identity/person.', noteRu: 'О личности.' },
  { vi: 'cái gì', en: 'what', ru: 'what', noteEn: 'Asks about objects/identity.', noteRu: 'О предметах.' },
  { vi: 'đâu', en: 'where', ru: 'where', noteEn: 'Asks about location.', noteRu: 'О месте.' },
  { vi: 'thế nào', en: 'how', ru: 'how', noteEn: 'Asks about state/quality.', noteRu: 'О состоянии.' }
];

export const GrammarLQA: React.FC = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [lang, setLang] = useState('EN');
  const [theme, setTheme] = useState('dark'); 
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [whIdx, setWhIdx] = useState(0);
  const [showWhDropdown, setShowWhDropdown] = useState(false);
  
  const [selections, setSelections] = useState({ subject: 0, category: 1, content: 0 });
  const [inputs, setInputs] = useState({ subject: "" });
  const [customData, setCustomData] = useState({ subject: null });
  const [loadingSlots, setLoadingSlots] = useState({ subject: false });
  
  const [subjectVersions, setSubjectVersions] = useState(DEFAULT_SUBJECT_VERSIONS);

  const sentenceRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
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

  const speakWithWebSpeech = useCallback((text: string) => {
    if (!text) return;
    
    // Hủy các yêu cầu phát âm trước đó
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'vi-VN';
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, []);

  const quickTranslate = async (text: string, targetSlot: 'subject') => {
    const cleanText = text.trim();
    if (!cleanText) {
        setCustomData(prev => ({ ...prev, [targetSlot]: null }));
        return;
    }

    setCustomData(prev => ({
        ...prev,
        [targetSlot]: {
            vi: cleanText, 
            en: cleanText,
            ru: "...",
            id: `CUST-${targetSlot}`,
            input: cleanText,
            isTranslating: true
        }
    }));

    setLoadingSlots(prev => ({ ...prev, [targetSlot]: true }));
    try {
      const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=vi&dt=t&q=${encodeURIComponent(cleanText)}`);
      const data = await res.json();
      
      let translatedText = data[0][0][0];

      const lowerInput = cleanText.toLowerCase();
      if (lowerInput === 'they') translatedText = 'Họ';
      if (lowerInput === 'it') translatedText = 'Nó';
      if (lowerInput === 'she') translatedText = 'Cô ấy';
      if (lowerInput === 'he') translatedText = 'Anh ấy';
      if (lowerInput === 'we') translatedText = 'Chúng tôi';
      
      setCustomData(prev => ({
        ...prev,
        [targetSlot]: {
          ...prev[targetSlot as keyof typeof prev] as object,
          vi: translatedText,
          isTranslating: false
        }
      }));
    } catch (e) {
      console.error("Translation error", e);
    } finally {
      setLoadingSlots(prev => ({ ...prev, [targetSlot]: false }));
    }
  };

  const updateWhQuestion = (idx: number) => {
    setWhIdx(idx);
    const questionWord = WH_QUESTIONS[idx].vi;
    
    let newCategoryIdx = selections.category;
    if (questionWord === 'đâu') {
      newCategoryIdx = 2; 
    } else if (questionWord === 'ai' || questionWord === 'cái gì') {
      newCategoryIdx = 1; 
    } else if (questionWord === 'thế nào') {
      newCategoryIdx = 0; 
    }
    
    setSelections(prev => ({ ...prev, category: newCategoryIdx }));

    if (questionWord === 'cái gì') {
      const objSubjects = [
        { id: 'SUB-OBJ-1', vi: 'Nó', en: 'It', ru: 'Оно', noteEn: 'Object pronoun', noteRu: 'Для предметов' },
        { id: 'SUB-OBJ-2', vi: 'Cái này', en: 'This thing', ru: 'Этот предмет', noteEn: 'This', noteRu: 'Это' },
        { id: 'SUB-OBJ-3', vi: 'Cái kia', en: 'That thing', ru: 'Тот предмет', noteEn: 'That', noteRu: 'То' }
      ];
      setSubjectVersions(objSubjects);
      setSelections(prev => ({ ...prev, subject: 0 }));
    } else if (questionWord === 'ai') {
      const personSubjects = [
        { id: 'SUB-PER-1', vi: 'Anh ấy', en: 'He', ru: 'Он', noteEn: 'Him', noteRu: 'Он' },
        { id: 'SUB-PER-2', vi: 'Cô ấy', en: 'She', ru: 'Она', noteEn: 'Her', noteRu: 'Она' },
        { id: 'SUB-PER-3', vi: 'Bạn', en: 'You', ru: 'Вы', noteEn: 'You', noteRu: 'Вы' },
        { id: 'SUB-PER-4', vi: 'Đầu bếp', en: 'Chef', ru: 'Повар', noteEn: 'The Chef', noteRu: 'Повар' },
        { id: 'SUB-PER-5', vi: 'Tom', en: 'Tom', ru: 'Том', noteEn: 'Name', noteRu: 'Имя' }
      ];
      setSubjectVersions(personSubjects);
      setSelections(prev => ({ ...prev, subject: 0 }));
    } else {
      setSubjectVersions(DEFAULT_SUBJECT_VERSIONS);
    }
  };

  const getActiveData = (key: 'subject' | 'category') => {
    if (key === 'subject') {
        if (inputs.subject.trim() !== "") {
            return customData.subject || { vi: inputs.subject, en: inputs.subject, ru: "..." };
        }
        return subjectVersions[selections.subject] || subjectVersions[0];
    }
    if (key === 'category') return LINKING_CATEGORIES[selections.category];
    return { vi: '...', en: '...', ru: '...' };
  };

  const currentData = {
    subj: getActiveData('subject'),
    cat: getActiveData('category'),
  };

  const adjustFontSize = useCallback(() => {
    if (sentenceRef.current && containerRef.current && !isFullscreen) {
      const containerWidth = containerRef.current.offsetWidth - 32; 
      const contentWidth = sentenceRef.current.scrollWidth;
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
  }, [currentData, whIdx, adjustFontSize, gameStarted]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, key: 'subject') => {
    const val = e.target.value;
    setInputs(prev => ({ ...prev, [key]: val }));
    quickTranslate(val, key);
  };

  const getFullSentenceVi = () => {
    const { subj, cat } = currentData;
    const parts = [subj.vi];
    if (cat.type !== 'description') parts.push(cat.vi);
    parts.push(WH_QUESTIONS[whIdx].vi);
    return parts.join(' ').replace(/\s+/g, ' ').trim() + "?";
  };

  const getFullSentenceTranslation = () => {
    const { subj } = currentData;
    const s = (subj as any).en || subj.vi;
    const q = WH_QUESTIONS[whIdx].en;
    const sLower = s.toLowerCase();
    const is3rd = !['i', 'you', 'we', 'they'].includes(sLower);
    const be = is3rd ? 'is' : (sLower === 'i' ? 'am' : 'are');
    const questionWord = q.charAt(0).toUpperCase() + q.slice(1);
    return `${questionWord} ${be} ${s.toLowerCase()}?`;
  };

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const WordComponent: React.FC<{
    text: string;
    colorClass: string;
    decorationClass: string;
    note?: string;
    isMain?: boolean;
    isQuestionVariant?: boolean;
  }> = ({ text, colorClass, decorationClass, note, isMain = false, isQuestionVariant = false }) => (
    <div className="relative group/word inline-flex items-center">
      <div 
        className={`lqa-word-item flex items-center gap-1 transition-all duration-300 hover:scale-105 ${colorClass} ${decorationClass} px-1.5 landscape:px-3 py-1 rounded-lg relative z-20 whitespace-nowrap font-black cursor-pointer`}
        onClick={() => speakWithWebSpeech(text)}
      >
        <span className="lqa-word-text">{text}</span>
        {isMain && <span className={`absolute -inset-1 blur-sm rounded-lg -z-10 group-hover/word:bg-white/10 transition-all ${theme === 'dark' ? 'bg-white/5' : 'bg-black/5'}`}></span>}
        {isQuestionVariant && (
          <button onClick={(e) => { e.stopPropagation(); setShowWhDropdown(!showWhDropdown); }} className={`lqa-dropdown-btn ml-1 landscape:ml-2 p-1 rounded-md transition-colors ${theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-black/5'}`}>
            <ChevronDown className={`lqa-dropdown-icon w-3 h-3 landscape:w-6 landscape:h-6 transition-transform duration-300 ${showWhDropdown ? 'rotate-180' : ''}`} />
          </button>
        )}
      </div>
      {note && (
        <div className={`fixed top-auto bottom-[30%] landscape:bottom-auto landscape:top-1/2 left-1/2 -translate-x-1/2 mt-4 opacity-0 pointer-events-none group-hover/word:opacity-100 transition-all duration-300 z-[9999] min-w-[280px] landscape:min-w-[400px] scale-[0.8]`}>
          <div className={`lqa-tooltip-box border p-6 rounded-2xl shadow-2xl text-center relative ${theme === 'dark' ? 'bg-slate-900 text-cyan-50 border-cyan-500/40' : 'bg-white text-slate-900 border-cyan-600/20'}`}>
             <div className={`lqa-tooltip-arrow absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rotate-45 border-t border-l ${theme === 'dark' ? 'bg-slate-900 border-cyan-500/40' : 'bg-white border-cyan-600/20'}`}></div>
             <p className="lqa-tooltip-text text-[14px] landscape:text-[18px] font-black tracking-widest whitespace-pre-line leading-relaxed">{note}</p>
          </div>
        </div>
      )}
      {isQuestionVariant && showWhDropdown && (
        <div className="absolute top-full left-0 mt-2 w-max z-[10000] animate-in slide-in-from-top-2">
          <div className={`border rounded-xl shadow-2xl p-1 min-w-[140px] landscape:min-w-[200px] ${theme === 'dark' ? 'bg-slate-900 border-amber-500/40' : 'bg-white border-amber-500/20'}`}>
            {WH_QUESTIONS.map((v, i) => (
              <button key={i} onClick={(e) => { e.stopPropagation(); updateWhQuestion(i); speakWithWebSpeech(v.vi); setShowWhDropdown(false); }} className={`lqa-inquiry-option w-full px-3 py-3 text-left text-[11px] landscape:text-base font-black uppercase tracking-widest transition-colors rounded-lg ${whIdx === i ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:bg-slate-800'}`}>
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
      <div className={`absolute inset-0 w-full h-full transition-colors duration-500 flex items-center justify-center p-4 overflow-hidden font-mono ${theme === 'dark' ? 'bg-[#020617] text-slate-200' : 'bg-slate-50 text-slate-900'}`}>
        <div className={`absolute inset-0 opacity-[0.03] pointer-events-none ${theme === 'dark' ? '' : 'grayscale invert'}`} style={{ backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
        <div className={`w-full max-w-md backdrop-blur-2xl rounded-[32px] p-8 flex flex-col items-center gap-6 relative border ${theme === 'dark' ? 'bg-slate-900/60 border-slate-800 shadow-2xl' : 'bg-white border-slate-200 shadow-xl'}`}>
          <div className="flex flex-col items-center gap-1 text-center">
            <div className={`p-3 rounded-2xl ${theme === 'dark' ? 'bg-amber-500/10' : 'bg-amber-50'}`}><MessageSquare className={`w-8 h-8 ${theme === 'dark' ? 'text-amber-400' : 'text-amber-600'}`} /></div>
            <h1 className="text-2xl font-black tracking-[0.1em] uppercase mt-2 text-amber-500 leading-tight">LINKING QUESTION ARCHITECT</h1>
          </div>
          <div className={`w-full p-5 rounded-2xl border ${theme === 'dark' ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            <div className="flex items-center gap-2 mb-2 text-amber-500"><Info className="w-4 h-4" /><h2 className="text-[10px] font-black uppercase tracking-widest">{t.howToPlay}</h2></div>
            <div className="space-y-1.5">{t.instructions.split('\n').map((line, i) => <p key={i} className="text-[11px] font-medium leading-tight opacity-80">{line}</p>)}</div>
          </div>
          <div className="flex flex-col gap-4 w-full">
            <div className="flex gap-2">
              {['EN', 'RU'].map(l => (
                <button key={l} onClick={() => setLang(l as 'EN' | 'RU')} className={`flex-1 py-2.5 rounded-xl border-2 font-black text-xs transition-all ${lang === l ? 'bg-amber-500 text-slate-950 border-amber-400' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
                  {l === 'EN' ? 'ENGLISH' : 'RUSSIAN'}
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
    <div ref={gameContainerRef} className="lqa-game-root absolute inset-0 w-full h-full">
      <div className={`lqa-game-wrapper w-full h-full transition-colors duration-500 flex font-mono ${theme === 'dark' ? 'bg-[#020617] text-slate-200' : 'bg-slate-50 text-slate-900'}`}>
        <div className={`absolute inset-0 opacity-[0.03] pointer-events-none ${theme === 'dark' ? '' : 'grayscale invert'}`} style={{ backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
        <div className={`w-full h-full backdrop-blur-xl flex flex-col relative overflow-hidden ${theme === 'dark' ? 'bg-slate-900/40' : 'bg-white/80'}`}>
          
          <header className={`lqa-header py-4 landscape:py-4 px-3 border-b flex flex-col landscape:flex-row justify-between items-center gap-4 z-50 ${theme === 'dark' ? 'border-slate-800/50 bg-slate-900/60' : 'border-slate-100 bg-white/60'}`}>
            <div className="w-full landscape:w-auto flex items-center justify-between landscape:justify-start gap-3">
              <div className="flex items-center gap-2">
                <button onClick={toggleTheme} className="lqa-theme-btn p-2 rounded-xl bg-amber-600 text-white shadow-lg active:scale-90 transition-all">
                  {theme === 'dark' ? <Sun className="lqa-theme-icon w-4 h-4 landscape:w-5 landscape:h-5" /> : <Moon className="lqa-theme-icon w-4 h-4 landscape:w-5 landscape:h-5" />}
                </button>
                <div className="flex flex-col leading-none">
                  <h1 className="lqa-title text-[14px] landscape:text-[18px] font-black tracking-widest uppercase text-amber-500">
                    LINKING QUESTION ARCHITECT
                  </h1>
                </div>
              </div>
            </div>

            <div className="w-full landscape:w-auto flex flex-col landscape:flex-row items-center gap-2">
              <button onClick={() => speakWithWebSpeech(getFullSentenceVi())} className={`lqa-listen-btn flex items-center gap-1.5 px-8 py-3 rounded-xl transition-all font-black text-[11px] uppercase tracking-widest ${theme === 'dark' ? 'bg-slate-800 text-amber-400 border-amber-500/30' : 'bg-slate-100 text-amber-700'}`}>
                <Volume2 className="w-3.5 h-3.5" /> <span>{t.listen}</span>
              </button>
              <div className={`lqa-mode-display px-4 py-3 rounded-xl font-black text-[11px] uppercase tracking-[0.2em] border ${theme === 'dark' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-amber-50 border-amber-200 text-amber-700'}`}>
                Mode: {t.question}
              </div>
            </div>
          </header>

          <main className="lqa-main flex-1 flex flex-col-reverse overflow-hidden min-h-0">
            <div className={`lqa-controls-container w-full flex shrink-0 z-40 ${theme === 'dark' ? 'border-slate-800 bg-slate-900/30' : 'border-slate-200 bg-slate-50/50'}`}>
              <div className="grid grid-cols-3 landscape:flex landscape:flex-row w-full border-t">
                {[
                  { label: t.subject, key: 'subject' },
                  { label: t.category, key: 'category' },
                  { label: t.questionWord, key: 'question' }
                ].map(mod => {
                  const active = mod.key === 'question' ? null : getActiveData(mod.key as 'subject' | 'category');
                  const translation = mod.key === 'question' 
                    ? (lang === 'EN' ? WH_QUESTIONS[whIdx].en : WH_QUESTIONS[whIdx].ru)
                    : (lang === 'EN' ? (active as any).en : (active as any).ru);
                  
                  return (
                    <div key={mod.key} className="lqa-control-module p-2 landscape:py-3 landscape:px-4 border-r last:border-0 flex flex-col justify-center min-h-[145px] landscape:min-h-[120px] landscape:w-1/3">
                      <div className="flex flex-col landscape:flex-row landscape:justify-between landscape:items-center mb-1 landscape:mb-1.5 gap-0.5 overflow-hidden">
                        <label className="lqa-control-label text-[7px] landscape:text-[9px] font-black uppercase text-slate-500 block truncate">{mod.label}</label>
                        <span className="lqa-control-translation text-[7px] landscape:text-[10px] font-black text-amber-500 font-mono tracking-tighter truncate max-w-full">
                          {translation || '---'}
                        </span>
                      </div>
                      <div className="relative mb-1 landscape:mb-1.5">
                        <div className={`lqa-select-display text-[10px] landscape:text-[11px] font-black px-1.5 py-2.5 landscape:py-2.5 rounded-lg border-2 text-center truncate ${mod.key === 'subject' ? 'bg-amber-500 text-slate-950' : 'bg-slate-950 text-white border-slate-800 shadow-sm'}`}>
                          {mod.key === 'category' ? LINKING_CATEGORIES[selections[mod.key as 'category']].label 
                           : (mod.key === 'question' ? WH_QUESTIONS[whIdx].vi : (active as any).vi)}
                        </div>
                        <select 
                          value={mod.key === 'question' ? whIdx : selections[mod.key as 'subject' | 'category']} 
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            if (mod.key === 'question') {
                              updateWhQuestion(val);
                            } else {
                              setSelections(p => ({...p, [mod.key]: val}));
                            }
                          }} 
                          className="absolute inset-0 opacity-0 cursor-pointer text-black font-black"
                        >
                          {mod.key === 'subject' ? subjectVersions.map((v,i) => (
                            <option key={i} value={i}>{v.vi}</option>
                          )) :
                           mod.key === 'category' ? LINKING_CATEGORIES.map((v,i) => (
                            <option key={i} value={i}>{v.label}</option>
                          )) :
                           WH_QUESTIONS.map((v,i) => (
                            <option key={i} value={i}>{v.vi}</option>
                          ))}
                        </select>
                      </div>
                      
                      {mod.key === 'subject' ? (
                        <div className="relative">
                          <input 
                            type="text" 
                            placeholder={t.custom} 
                            value={inputs[mod.key as 'subject']} 
                            onChange={e => handleInputChange(e, mod.key as 'subject')} 
                            className={`lqa-custom-input w-full px-2 py-2.5 landscape:py-3 rounded-lg text-[10px] landscape:text-[13px] font-black border tracking-wide shadow-inner ${theme === 'dark' ? 'bg-slate-950/80 border-slate-700 text-white placeholder:text-slate-600' : 'bg-white border-slate-300 text-black placeholder:text-slate-400'}`} 
                          />
                          {loadingSlots[mod.key as 'subject'] && <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 animate-spin text-amber-500" />}
                        </div>
                      ) : (
                        <div className={`w-full px-2 py-2.5 landscape:py-3 rounded-lg text-[10px] landscape:text-[13px] font-black border opacity-40 flex items-center justify-center italic cursor-not-allowed select-none tracking-wide ${theme === 'dark' ? 'bg-slate-950/30 border-slate-800 text-slate-600' : 'bg-white border-slate-200 text-slate-400'}`}>
                          Static Rule
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="lqa-sentence-container flex-1 flex flex-col overflow-hidden relative">
              <div ref={containerRef} className="flex-1 flex flex-col justify-center items-center px-4 overflow-hidden py-4">
                 <div className="landscape:scale-[0.8]">
                   <div 
                    ref={sentenceRef} 
                    style={{ 
                      transform: isFullscreen ? 'none !important' : `scale(${scale})`, 
                      transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)', 
                      transformOrigin: 'center' 
                    }} 
                    className="lqa-sentence-content flex flex-nowrap items-center justify-center gap-x-1.5 landscape:gap-x-4 text-5xl landscape:text-8xl font-black tracking-tighter text-center w-max max-w-none"
                   >
                      <WordComponent 
                        text={currentData.subj.vi} 
                        note={lang === 'EN' ? (currentData.subj as any).noteEn : (currentData.subj as any).noteRu} 
                        isMain 
                        colorClass={theme === 'dark' ? 'text-white' : 'text-slate-900'} 
                        decorationClass="underline decoration-amber-500/30" 
                      />
                      
                      {currentData.cat.vi !== '(Không dùng từ)' && (
                        <WordComponent 
                          text={currentData.cat.vi} 
                          colorClass="text-amber-500" 
                          decorationClass=""
                          note={lang === 'EN' ? (currentData.cat as any).noteEn : (currentData.cat as any).noteRu} 
                        />
                      )}

                      <WordComponent 
                        text={WH_QUESTIONS[whIdx].vi + "?"} 
                        isMain 
                        isQuestionVariant={true}
                        colorClass="text-amber-400" 
                        decorationClass="underline decoration-amber-500/30" 
                        note={lang === 'EN' ? WH_QUESTIONS[whIdx].noteEn : WH_QUESTIONS[whIdx].noteRu}
                      />
                   </div>
                 </div>
              </div>

              <footer className={`lqa-footer p-4 landscape:p-5 border-t z-10 flex items-center justify-center shrink-0 ${theme === 'dark' ? 'border-slate-800 bg-slate-950/50' : 'border-slate-100 bg-slate-50'}`}>
                <div className="w-full flex items-center justify-center">
                  <div className="flex flex-col items-center justify-center text-center">
                    <p className="lqa-translation-label text-[9px] landscape:hidden font-black text-amber-500 uppercase tracking-widest mb-1">{t.translation}</p>
                    <p className={`lqa-translation-text text-[14px] sm:text-[16px] landscape:text-2xl font-bold tracking-tight leading-snug max-w-2xl px-4 ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                        {getFullSentenceTranslation()}
                    </p>
                  </div>
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
        .lqa-game-root:fullscreen { background: #000; display: flex; align-items: center; justify-content: center; padding: 0; }
        .lqa-game-root:fullscreen .lqa-game-wrapper {
            width: min(100vw, 177.78vh);
            height: min(100vh, 56.25vw);
            overflow: hidden;
            border-radius: 0;
        }

        /* VMIN Scaling for Fullscreen */
        .lqa-game-root:fullscreen .lqa-header { padding: 1.5vmin; flex-direction: row; }
        .lqa-game-root:fullscreen .lqa-header > div { width: auto; }
        .lqa-game-root:fullscreen .lqa-theme-btn { padding: 1.2vmin; border-radius: 1vmin; }
        .lqa-game-root:fullscreen .lqa-theme-icon { width: 3vmin; height: 3vmin; }
        .lqa-game-root:fullscreen .lqa-title { font-size: 1.8vmin; }
        .lqa-game-root:fullscreen .lqa-listen-btn { padding: 1.5vmin 3vmin; font-size: 1.2vmin; border-radius: 1vmin; }
        .lqa-game-root:fullscreen .lqa-listen-btn svg { width: 2vmin; height: 2vmin; }
        .lqa-game-root:fullscreen .lqa-mode-display { padding: 1.5vmin 3vmin; font-size: 1.2vmin; border-radius: 1vmin; }
        
        .lqa-game-root:fullscreen .lqa-main { flex-direction: column-reverse; }
        .lqa-game-root:fullscreen .lqa-controls-container > div { display: flex; flex-direction: row; }
        .lqa-game-root:fullscreen .lqa-control-module { padding: 1.5vmin; width: 33.33%; border-right: 0.1vmin solid; border-top: 0.1vmin solid; }
        .lqa-game-root:fullscreen .lqa-control-label { font-size: 1vmin; }
        .lqa-game-root:fullscreen .lqa-control-translation { font-size: 1.1vmin; }
        .lqa-game-root:fullscreen .lqa-select-display { font-size: 1.3vmin; padding: 1.2vmin; }
        .lqa-game-root:fullscreen .lqa-custom-input { font-size: 1.3vmin; padding: 1.2vmin; }

        .lqa-game-root:fullscreen .lqa-sentence-container { padding: 2vmin; }
        .lqa-game-root:fullscreen .lqa-sentence-content > div:first-child { transform: none !important; }
        .lqa-game-root:fullscreen .lqa-sentence-content { font-size: 12vmin; gap: 2.5vmin; }
        .lqa-game-root:fullscreen .lqa-word-item { padding: 0.5vmin 2vmin; border-radius: 1.5vmin; }
        .lqa-game-root:fullscreen .lqa-word-text { font-size: inherit; }
        .lqa-game-root:fullscreen .lqa-dropdown-icon { width: 4vmin; height: 4vmin; }
        .lqa-game-root:fullscreen .lqa-inquiry-option { font-size: 2vmin; }
        .lqa-game-root:fullscreen .lqa-tooltip-text { font-size: 2vmin; }

        .lqa-game-root:fullscreen .lqa-footer { padding: 2vmin; }
        .lqa-game-root:fullscreen .lqa-translation-text { font-size: 3vmin; }

      `}</style>

    </div>
  );
};

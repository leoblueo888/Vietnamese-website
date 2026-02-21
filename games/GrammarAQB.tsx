import React, { useState, useCallback, useEffect, useRef } from 'react';
import  { Languages, Zap, ShieldAlert, MapPin, Clock, Cpu, Volume2, ChevronDown, Construction, Info, Sun, Moon, Play, CheckSquare, XSquare, Loader2, Users, Maximize, Minimize } from 'lucide-react';

const apiKey = ""; // Environment handles this

const TRANSLATIONS = {
  EN: {
    howToPlay: "How to Play",
    instructions: "1. Select a Question Word.\n2. Custom Subject / Verb ... to make your question.\n3. Listen to the question and repeat.",
    start: "START",
    selectLang: "System Language",
    slogan: "LEARN TO ASK COMPLEX QUESTIONS",
    listen: "LISTEN",
    subject: "Subject",
    action: "Action",
    object: "Object",
    companion: "With whom",
    location: "Location",
    time: "Time",
    translation: "Translation",
    custom: "Translate...",
    pronoun: "Pronoun (He)...",
    idLabel: "ID:",
    qWord: "QUESTION WORD"
  },
  RU: {
    howToPlay: "Как играть",
    instructions: "1. Выберите вопросительное слово.\n2. Настройте Subject / Verb ..., чтобы создать свой вопрос.\n3. Слушайте вопрос и повторяйте.",
    start: "ЗАПУСТИТЬ",
    selectLang: "Язык системы",
    slogan: "УЧИСЬ ЗАДАВАТЬ СЛОЖНЫЕ ВОПРОСЫ",
    listen: "СЛУШАТЬ",
    subject: "Подлежащее",
    action: "Действие",
    object: "Объект",
    companion: "С кем",
    location: "Место",
    time: "Время",
    translation: "Перевод",
    custom: "Перевести...",
    pronoun: "Местоимение...",
    idLabel: "ID (RU):",
    qWord: "ВОПРОС"
  }
};

const WH_QUESTIONS = [
  { id: 'where', vi: 'ở đâu?', en: 'Where', ru: 'Где', color: 'bg-emerald-500', hide: 'place' },
  { id: 'what', vi: 'gì?', en: 'What', ru: 'Что', color: 'bg-rose-500', hide: 'object' },
  { id: 'who', vi: 'Ai', en: 'Who', ru: 'Кто', color: 'bg-blue-500', hide: 'subject' },
  { id: 'with_who', vi: 'với ai?', en: 'With whom', ru: 'С кем', color: 'bg-purple-500', hide: 'companion' },
  { id: 'how', vi: 'thế nào?', en: 'How', ru: 'Как', color: 'bg-amber-500', hide: null },
  { id: 'how_often', vi: 'thường xuyên thế nào?', en: 'How often', ru: 'Как часто', color: 'bg-orange-500', hide: null },
  { id: 'why', vi: 'Tại sao', en: 'Why', ru: 'Почему', color: 'bg-indigo-500', hide: null },
  { id: 'when', vi: 'khi nào?', en: 'When', ru: 'Когда', color: 'bg-teal-500', hide: 'time' },
  { id: 'how_long', vi: 'trong bao lâu?', en: 'How long', ru: 'Как долго', color: 'bg-pink-500', hide: null }
];

const DEFAULT_SUBJECT_VERSIONS = [
  { 
    vi: 'Tôi', en: 'I', ru: 'Я', 
    note_en: 'Neutral and polite usage in most situations.',
    note_ru: 'Нейтральное и вежливое использование в большинстве ситуаций.' 
  }, 
  { 
    vi: 'Anh', en: 'He/I', ru: 'Он/Я', 
    note_en: 'Used for males older than you or as a self-reference for men.',
    note_ru: 'Используется для мужчин старше вас или как самоназвание для мужчин.' 
  }, 
  { 
    vi: 'Em', en: 'I/You', ru: 'Я/Ты', 
    note_en: 'Used for younger people or in intimate/familiar address.',
    note_ru: 'Используется для людей младше или при близком/неформальном общении.' 
  }, 
  { 
    vi: 'Bạn', en: 'You', ru: 'Ты', 
    note_en: 'Used for friends or colleagues of the same age.',
    note_ru: 'Используется для друзей или коллег того же возраста.' 
  }
];

const SENTENCE_DATA = {
  verbs: [
    { vi: 'ăn', en: 'eat', ru: 'есть' }, 
    { vi: 'uống', en: 'drink', ru: 'пить' }, 
    { vi: 'xem', en: 'watch', ru: 'смотреть' }, 
    { vi: 'học', en: 'study', ru: 'учиться' }, 
    { vi: 'đi', en: 'go', ru: ' đi' }
  ],
  objects: [
    { vi: 'phở', en: 'pho', ru: 'фо' }, 
    { vi: 'cà phê', en: 'coffee', ru: 'кофе' }, 
    { vi: 'phim', en: 'movie', ru: 'фильм' }, 
    { vi: 'tiếng Việt', en: 'Vietnamese', ru: 'вьетнамский' }, 
    { vi: 'bóng đá', en: 'football', ru: 'футбол' }
  ],
  companions: [
    { vi: 'với Lan', en: 'with Lan', ru: 'с Ланом' },
    { vi: 'với Nam', en: 'with Nam', ru: 'с Намом' },
    { vi: 'với bạn bè', en: 'with friends', ru: 'с друзьями' },
    { vi: 'với gia đình', en: 'with family', ru: 'с семьей' },
    { vi: 'với đồng nghiệp', en: 'with colleagues', ru: 'с коллегами' }
  ],
  places: [
    { vi: 'ở nhà', en: 'at home', ru: 'дома' }, 
    { vi: 'ở công viên', en: 'at the park', ru: 'в парке' }, 
    { vi: 'ở quán', en: 'at the shop', ru: 'в магазине' }, 
    { vi: 'ở trường', en: 'at school', ru: 'в школе' }
  ],
  times: [
    { vi: 'vào buổi sáng', en: 'in the morning', ru: 'утром' }, 
    { vi: 'mỗi ngày', en: 'every day', ru: 'каждый ngày' }, 
    { vi: 'cuối tuần', en: 'at weekend', ru: 'на выходных' }, 
    { vi: 'hôm nay', en: 'today', ru: 'сегодня' }
  ]
};

export const GrammarAQB: React.FC = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [lang, setLang] = useState('EN');
  const [qIdx, setQIdx] = useState(0); 
  const [theme, setTheme] = useState('dark'); 
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [whatVariant, setWhatVariant] = useState('gì?'); 
  
  const [selections, setSelections] = useState({ subject: 0, verb: 0, object: 0, companion: 0, place: 0, time: 0 });
  const [inputs, setInputs] = useState({ subject: "", verb: "", object: "", companion: "", place: "", time: "" });
  const [customData, setCustomData] = useState({ subject: null, verb: null, object: null, companion: null, place: null, time: null });
  const [loadingSlots, setLoadingSlots] = useState({ subject: false, verb: false, object: false, companion: false, place: false, time: false });
  const [subjectVersions, setSubjectVersions] = useState(DEFAULT_SUBJECT_VERSIONS);

  const [visibleComponents, setVisibleComponents] = useState({
    object: true,
    companion: true,
    place: true,
    time: true
  });

  const [isFullscreen, setIsFullscreen] = useState(false);
  const gameContainerRef = useRef<HTMLDivElement>(null);

  const t = TRANSLATIONS[lang as keyof typeof TRANSLATIONS];
  const activeQ = WH_QUESTIONS[qIdx];

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
            alert(`Error: ${err.message}`);
        });
    } else {
        document.exitFullscreen();
    }
  };

  const getActiveData = (key: string) => {
    if (key === 'subject') return subjectVersions[selections.subject] || subjectVersions[0];
    return (customData as any)[key] || (SENTENCE_DATA as any)[key + 's'][selections[key as keyof typeof selections]];
  };

  const currentData = {
    subj: getActiveData('subject'),
    verb: getActiveData('verb'),
    obj: getActiveData('object'),
    with: getActiveData('companion'),
    place: getActiveData('place'),
    time: getActiveData('time'),
  };

  // --- HÀM SPEECH SYNTHESIS MỚI ---
  const speakWithWebSpeech = useCallback((text: string) => {
    if (!text) return;
    
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'vi-VN';
    utterance.rate = 0.9;

    const voices = window.speechSynthesis.getVoices();
    const viVoice = voices.find(v => v.lang.includes('vi') && v.name.includes('Google')) || 
                    voices.find(v => v.lang.includes('vi'));
    if (viVoice) utterance.voice = viVoice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      Object.keys(inputs).forEach(key => {
        const val = (inputs as any)[key].trim();
        if (val !== "" && (!(customData as any)[key] || (customData as any)[key].input !== val)) {
          if (key === 'subject') updateSubjectVersions(val);
          else translateSlot(key, val);
        } else if (val === "" && key !== 'subject' && (customData as any)[key]) {
          setCustomData(prev => ({ ...prev, [key]: null }));
        }
      });
    }, 800);
    return () => clearTimeout(timer);
  }, [inputs]);

  const updateSubjectVersions = async (text: any) => {
    setLoadingSlots(prev => ({ ...prev, subject: true }));
    const prompt = `User input a subject: "${text}". Provide 4 natural Vietnamese pronouns/versions. Return JSON array: [{"vi": "...", "en": "${text}", "ru": "Russian translation of ${text}", "note_en": "One sentence explanation in English about context", "note_ru": "One sentence explanation in Russian about context"}]`;
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseMimeType: "application/json" } })
      });
      const result = await response.json();
      const versions = JSON.parse(result.candidates[0].content.parts[0].text);
      setSubjectVersions(versions);
    } catch (e) {} finally { setLoadingSlots(prev => ({ ...prev, subject: false })); }
  };

  const translateSlot = async (slot: string, text: string) => {
    setLoadingSlots(prev => ({ ...prev, [slot]: true }));
    let finalPrompt = `Translate to Vietnamese and Russian: "${text}". Return JSON: {"vi": "...", "en": "...", "ru": "..."}`;
    if (slot === 'companion' && !text.toLowerCase().startsWith('with')) {
        finalPrompt = `Translate to Vietnamese as a person's name or companion, starting with "với". Also translate to Russian. Return JSON: {"vi": "...", "en": "...", "ru": "..."}`;
    }

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: finalPrompt }] }], generationConfig: { responseMimeType: "application/json" } })
      });
      const result = await response.json();
      const translated = JSON.parse(result.candidates[0].content.parts[0].text);
      setCustomData(prev => ({ ...prev, [slot]: { ...translated, input: text } }));
    } catch (e) {} finally { setLoadingSlots(prev => ({ ...prev, [slot]: false })); }
  };

  const toggleVisibility = (key: 'object' | 'companion' | 'place' | 'time') => {
    setVisibleComponents(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const getFullSentenceVi = () => {
    const parts = [];
    if (activeQ.id === 'who') parts.push(activeQ.vi);
    if (activeQ.id === 'why') parts.push("Tại sao");
    if (activeQ.id !== 'who') parts.push(currentData.subj.vi);
    parts.push(currentData.verb.vi);
    if (activeQ.id === 'what') {
      parts.push(whatVariant);
    } else if (activeQ.id !== 'what' && visibleComponents.object) {
      parts.push(currentData.obj.vi);
    }
    if (activeQ.id !== 'with_who' && visibleComponents.companion) {
        parts.push(currentData.with.vi);
    }
    if (activeQ.id !== 'where' && visibleComponents.place) parts.push(currentData.place.vi);
    if (activeQ.id !== 'when' && visibleComponents.time) parts.push(currentData.time.vi);
    if (activeQ.id !== 'why' && activeQ.id !== 'what' && activeQ.id !== 'who') {
      parts.push(activeQ.vi);
    }
    return parts.join(' ') + (activeQ.id === 'who' ? '?' : '');
  };

  const getFullSentenceTranslated = () => {
    const targetLang = (lang as string).toLowerCase() as 'en' | 'ru';
    const objStr = (activeQ.id === 'what' || !visibleComponents.object) ? '' : (currentData.obj as any)[targetLang];
    const withStr = (activeQ.id === 'with_who' || !visibleComponents.companion) ? '' : (currentData.with as any)[targetLang];
    const placeStr = (activeQ.id === 'where' || !visibleComponents.place) ? '' : (currentData.place as any)[targetLang];
    const timeStr = (activeQ.id === 'when' || !visibleComponents.time) ? '' : (currentData.time as any)[targetLang];
    const qWord = (activeQ as any)[targetLang];
    
    if (lang === 'RU') {
       if (activeQ.id === 'who') return `Кто ${(currentData.verb as any).ru} ${objStr} ${withStr} ${placeStr} ${timeStr}?`;
       return `${qWord} ${(currentData.subj as any).ru} ${(currentData.verb as any).ru} ${objStr} ${withStr} ${placeStr} ${timeStr}...`;
    }
    if (activeQ.id === 'who') return `Who ${(currentData.verb as any).en}s ${objStr} ${withStr} ${placeStr} ${timeStr}?`;
    return `${qWord} does ${(currentData.subj as any).en} ${(currentData.verb as any).en} ${objStr} ${withStr} ${placeStr} ${timeStr}...`;
  };

  const WordComponent: React.FC<{
    text: string; colorClass: string; decorationClass: string; noteObj?: any; isMain?: boolean; isQ?: boolean; isHidden?: boolean; children?: React.ReactNode;
  }> = ({ text, colorClass, decorationClass, noteObj, isMain = false, isQ = false, isHidden = false, children }) => {
    if (isHidden) return null;
    const note = lang === 'RU' ? (noteObj?.note_ru || noteObj?.note) : (noteObj?.note_en || noteObj?.note);
    
    return (
      <div className="relative group/word inline-flex items-center">
        <div className={`aqb-word-item flex items-center gap-1 transition-all duration-300 hover:scale-105 ${colorClass} ${decorationClass} px-2 landscape:px-4 py-1 rounded-lg relative z-20 whitespace-nowrap font-black`}>
          <span onClick={() => speakWithWebSpeech(text)} className="cursor-pointer">{text}</span>
          {children}
          {isMain && <span className={`absolute -inset-1 blur-sm rounded-lg -z-10 group-hover/word:bg-white/10 transition-all ${theme === 'dark' ? 'bg-white/5' : 'bg-black/5'}`}></span>}
        </div>
        {note && (
          <div className="aqb-tooltip-wrapper absolute top-full left-0 pt-2 landscape:pt-4 opacity-0 pointer-events-none group-hover/word:opacity-100 transition-all duration-300 z-[100] w-[140px] landscape:w-[500px]">
            <div className={`aqb-tooltip-box border p-2 landscape:p-8 rounded-xl landscape:rounded-3xl shadow-[0_35px_60px_-15px_rgba(0,0,0,0.5)] min-h-[40px] landscape:min-h-[150px] flex items-center relative ${theme === 'dark' ? 'bg-slate-900 text-cyan-50 border-cyan-500/60' : 'bg-white text-slate-900 border-cyan-600/30'}`}>
              <div className="flex items-start gap-1.5 landscape:gap-6 w-full">
                 <div className="mt-0.5 landscape:mt-1 shrink-0"><Info className="aqb-tooltip-icon w-2.5 h-2.5 landscape:w-8 landscape:h-8 text-cyan-500" /></div>
                 <p className="aqb-tooltip-text text-[7.5px] landscape:text-xl font-bold leading-tight landscape:leading-relaxed whitespace-normal break-words overflow-hidden">
                    {note}
                 </p>
              </div>
              <div className={`aqb-tooltip-arrow absolute -top-1 landscape:-top-2 left-3 landscape:left-10 w-2.5 h-2.5 landscape:w-6 landscape:h-6 rotate-45 border-l border-t ${theme === 'dark' ? 'bg-slate-900 border-cyan-500/60' : 'bg-white border-cyan-600/30'}`}></div>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (!gameStarted) {
    return (
      <div className={`h-full w-full flex items-center justify-center p-4 overflow-hidden font-mono ${theme === 'dark' ? 'bg-[#020617] text-slate-200' : 'bg-slate-50 text-slate-900'}`}>
        <div className={`w-full max-w-md backdrop-blur-2xl rounded-[32px] p-8 flex flex-col items-center gap-6 relative border transition-all duration-500 ${theme === 'dark' ? 'bg-slate-900/60 border-slate-800 shadow-2xl' : 'bg-white border-slate-200 shadow-xl'}`}>
          <div className="flex flex-col items-center gap-1">
            <Construction className={`w-10 h-10 ${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'}`} />
            <h1 className="text-2xl font-black tracking-[0.1em] uppercase mt-2">ACTION QUESTION ARCHITECT</h1>
          </div>
          <div className={`w-full p-5 rounded-2xl border ${theme === 'dark' ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            <div className="flex items-center gap-2 mb-2 text-cyan-500"><Info className="w-4 h-4" /><h2 className="text-[10px] font-black uppercase tracking-widest">{t.howToPlay}</h2></div>
            <div className="space-y-1.5">{t.instructions.split('\n').map((line, i) => (<p key={i} className="text-[11px] font-medium leading-tight opacity-80">{line}</p>))}</div>
          </div>
          <div className="flex flex-col gap-4 w-full">
             <div className="flex gap-2">
                {['EN', 'RU'].map(l => (
                  <button key={l} onClick={() => setLang(l as 'EN' | 'RU')} className={`flex-1 py-2 rounded-xl border-2 font-black text-xs transition-all ${lang === l ? 'bg-cyan-500 text-slate-950' : 'bg-transparent text-slate-500 border-slate-700'}`}>{l === 'EN' ? 'ENGLISH' : 'РУССКИЙ'}</button>
                ))}
             </div>
             <button onClick={() => setGameStarted(true)} className="w-full py-4 rounded-xl font-black text-sm tracking-widest bg-white text-slate-950 hover:bg-cyan-400 transition-all flex items-center justify-center gap-2"><Play className="w-5 h-5 fill-current" /> {t.start}</button>
          </div>
        </div>
      </div>
    );
  }

  const controlModules = [
    { label: t.subject, key: 'subject', icon: Cpu, hideOn: 'subject', toggle: false },
    { label: t.action, key: 'verb', icon: Zap, hideOn: null, toggle: false },
    { label: t.object, key: 'object', icon: ShieldAlert, hideOn: 'object', toggle: true },
    { label: t.companion, key: 'companion', icon: Users, hideOn: 'companion', toggle: true },
    { label: t.location, key: 'place', icon: MapPin, hideOn: 'place', toggle: true },
    { label: t.time, key: 'time', icon: Clock, hideOn: 'time', toggle: true }
  ];

  return (
    <div ref={gameContainerRef} className="aqb-game-root absolute inset-0 w-full h-full">
      <div className={`aqb-game-wrapper w-full h-full transition-colors duration-500 flex font-mono ${theme === 'dark' ? 'bg-[#020617] text-slate-200' : 'bg-slate-50 text-slate-900'}`}>
        <div className={`w-full h-full backdrop-blur-xl flex flex-col relative ${theme === 'dark' ? 'bg-slate-900/40 border-slate-800/50' : 'bg-white/80 border-slate-200'}`}>
          <header className={`aqb-header p-4 flex justify-between items-center relative z-10 ${theme === 'dark' ? 'border-slate-800/50 bg-slate-900/60' : 'border-slate-100 bg-white/60'}`}>
            <div className="flex items-center gap-2 landscape:gap-5">
              <button className="aqb-theme-btn p-2 landscape:p-3 rounded-xl bg-cyan-600 text-white shadow-lg shadow-cyan-500/20 active:scale-95 transition-all" onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}>
                {theme === 'dark' ? <Sun className="aqb-theme-icon w-5 h-5 landscape:w-6 landscape:h-6" /> : <Moon className="aqb-theme-icon w-5 h-5 landscape:w-6 landscape:h-6" />}
              </button>
              <div className="aqb-title-group">
                <h1 className="aqb-title text-[10px] landscape:text-sm font-black tracking-[0.2em] uppercase">
                  <span className="landscape:inline hidden">ACTION QUESTION ARCHITECT</span>
                  <span className="landscape:hidden inline">QUESTION ARCHITECT</span>
                </h1>
                <span className="aqb-slogan text-[7px] landscape:text-[9px] text-slate-500 uppercase font-bold tracking-widest hidden sm:block">{t.slogan}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 landscape:gap-4">
              <button className={`aqb-listen-btn flex items-center gap-2 landscape:gap-3 px-4 landscape:px-8 py-2 landscape:py-3 rounded-xl font-black uppercase text-[10px] landscape:text-[11px] transition-all active:scale-95 ${theme === 'dark' ? 'bg-slate-800 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500 hover:text-slate-950' : 'bg-slate-100 text-cyan-700 hover:bg-cyan-600 hover:text-white'}`} onClick={() => speakWithWebSpeech(getFullSentenceVi())}>
                {isSpeaking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Volume2 className="w-4 h-4" />} <span className="hidden landscape:inline">{t.listen}</span>
              </button>
              <div className={`aqb-q-selector flex rounded-xl p-1 border ${theme === 'dark' ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                 <span className="hidden landscape:block px-4 py-2 text-[10px] font-black text-cyan-500 self-center">{t.qWord}</span>
                 <select value={qIdx} onChange={(e) => setQIdx(parseInt(e.target.value))} className="bg-transparent font-black text-[10px] uppercase outline-none px-2 cursor-pointer text-inherit">
                    {WH_QUESTIONS.map((q, i) => <option key={q.id} value={i} className="text-black font-bold">{lang === 'RU' ? q.ru : q.en}</option>)}
                 </select>
              </div>
            </div>
          </header>

          <div className="aqb-body flex flex-1 min-h-0">
            <aside className={`aqb-sidebar w-[35%] landscape:hidden border-r flex flex-col overflow-y-auto ${theme === 'dark' ? 'border-slate-800/50 bg-slate-900/20' : 'border-slate-200 bg-slate-50/30'}`}>
              {controlModules.map((m) => {
                const isComplexQ = ['how', 'why', 'how_often', 'with_who', 'how_long'].includes(activeQ.id);
                const isDisabled = !isComplexQ && activeQ.hide === m.hideOn;
                const isToggledOff = m.toggle && !visibleComponents[m.key as keyof typeof visibleComponents];
                const activeData = getActiveData(m.key);
                const targetLang = (lang as string).toLowerCase() as 'en' | 'ru';
                const displayId = (activeData as any)[targetLang] || (activeData as any).en;
                const Icon = m.icon;

                return (
                  <div key={m.key} className={`p-3 border-b last:border-b-0 flex flex-col gap-2 relative transition-all ${(isDisabled || isToggledOff) ? 'opacity-30' : ''}`}>
                    <div className="flex items-center justify-between text-slate-500">
                      <div className="flex items-center gap-1.5">
                        {m.toggle && (
                          <button onClick={() => toggleVisibility(m.key as 'object' | 'companion' | 'place' | 'time')} className={`transition-colors ${visibleComponents[m.key as keyof typeof visibleComponents] ? 'text-cyan-500' : 'text-slate-600'}`}>
                            {visibleComponents[m.key as keyof typeof visibleComponents] ? <CheckSquare className="w-3.5 h-3.5" /> : <XSquare className="w-3.5 h-3.5" />}
                          </button>
                        )}
                        {!m.toggle && <Icon className="w-3.5 h-3.5" />}
                        <label className="text-[8px] font-black uppercase tracking-tight">{m.label}</label>
                      </div>
                    </div>
                    <div className={`relative group/select ${isDisabled ? 'pointer-events-none grayscale' : ''}`}>
                      <div className={`text-[9px] font-black px-2 py-2 rounded-lg border flex items-center justify-between ${m.key === 'subject' ? 'bg-cyan-500 text-slate-950 border-cyan-400' : 'bg-slate-950 text-white border-slate-800'}`}>
                        <span className="truncate">{activeData.vi.toUpperCase()}</span>
                        <ChevronDown className="w-2.5 h-2.5 opacity-50" />
                      </div>
                      <select value={selections[m.key as keyof typeof selections]} onChange={(e) => setSelections(s => ({...s, [m.key]: parseInt(e.target.value)}))} className="absolute inset-0 opacity-0 cursor-pointer w-full">
                        {m.key === 'subject' 
                          ? subjectVersions.map((v, i) => <option key={i} value={i} className="text-black font-bold">{v.vi}</option>) 
                          : (SENTENCE_DATA as any)[m.key + 's'].map((v: any, i: any) => <option key={i} value={i} className="text-black font-bold">{v.vi}</option>)}
                      </select>
                    </div>
                    <input type="text" value={(inputs as any)[m.key]} onChange={(e) => setInputs(i => ({...i, [m.key]: e.target.value}))} placeholder={t.custom} className="bg-transparent border-b border-slate-800 text-[8px] p-0.5 outline-none text-slate-400" />
                  </div>
                );
              })}
            </aside>

            <main className="aqb-main flex-1 landscape:w-full flex flex-col relative">
              <div className="flex-1 flex flex-col justify-center items-center px-2 landscape:px-12 relative bg-center bg-no-repeat bg-[radial-gradient(circle_at_center,_rgba(6,182,212,0.05)_0%,_transparent_70%)]">
                <div className="aqb-sentence-wrapper">
                    <div 
                      className="flex flex-wrap aqb-sentence items-center justify-center gap-y-3 gap-x-2 landscape:gap-x-6 z-20 origin-center mb-6 landscape:mb-4 text-center font-black text-3xl sm:text-4xl landscape:text-5xl"
                    >
                      <div className="flex items-center justify-center gap-2 landscape:gap-x-6">
                        {activeQ.id === 'who' && <WordComponent text={activeQ.vi} isQ colorClass="text-blue-400" decorationClass="bg-blue-400/10 border border-blue-400/20 px-3 landscape:px-6 py-1 landscape:py-2 rounded-xl landscape:rounded-2xl mr-1 landscape:mr-2" />}
                        {activeQ.id === 'why' && <WordComponent text="Tại sao" colorClass="text-indigo-400" decorationClass="italic border-b-2 border-indigo-500/30" />}
                        <WordComponent text={currentData.subj.vi} isHidden={activeQ.id === 'who'} noteObj={currentData.subj} isMain colorClass={theme === 'dark' ? 'text-white' : 'text-slate-900'} decorationClass="underline underline-offset-4 landscape:underline-offset-8 decoration-cyan-500/30" />
                        <WordComponent text={currentData.verb.vi} isMain colorClass={theme === 'dark' ? 'text-white' : 'text-slate-900'} decorationClass="border-b-2 landscape:border-b-4 border-slate-700" />
                      </div>
      
                      {(activeQ.id === 'what' || visibleComponents.object || (activeQ.id !== 'with_who' && visibleComponents.companion)) && (
                        <div className="flex items-center justify-center gap-2 landscape:gap-x-6">
                          {activeQ.id === 'what' && (
                            <WordComponent text={whatVariant} isQ colorClass="text-rose-400" decorationClass="bg-rose-400/10 border border-rose-400/20 px-3 landscape:px-6 py-1 landscape:py-2 rounded-xl landscape:rounded-2xl flex items-center gap-1 landscape:gap-2">
                               <div className="relative h-4 w-4 landscape:h-6 landscape:w-6 flex items-center justify-center opacity-40 hover:opacity-100 transition-opacity">
                                 <ChevronDown className="w-3 h-3 landscape:w-4 landscape:h-4" />
                                 <select value={whatVariant} onChange={(e) => setWhatVariant(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer text-black">
                                   <option value="gì?">Gì?</option>
                                   <option value="cái gì?">Cái gì?</option>
                                 </select>
                               </div>
                            </WordComponent>
                          )}
                          <WordComponent text={currentData.obj.vi} isHidden={activeQ.id === 'what' || !visibleComponents.object} isMain colorClass={theme === 'dark' ? 'text-white' : 'text-slate-900'} decorationClass="border-b-2 landscape:border-b-4 border-slate-700" />
                          <WordComponent text={currentData.with.vi} isHidden={activeQ.id === 'with_who' || !visibleComponents.companion} colorClass="text-purple-400" decorationClass="underline decoration-dotted decoration-purple-500/30" />
                        </div>
                      )}
      
                      {visibleComponents.time && activeQ.id !== 'when' && (
                        <div className="flex items-center justify-center">
                          <WordComponent text={currentData.time.vi} colorClass="text-slate-500" decorationClass="italic" />
                        </div>
                      )}
      
                      <div className="flex items-center justify-center gap-2 landscape:gap-x-6">
                        <WordComponent text={currentData.place.vi} isHidden={activeQ.id === 'where' || !visibleComponents.place} colorClass="text-cyan-400/80" decorationClass="bg-cyan-500/5 px-3 landscape:px-6 py-1 landscape:py-2 rounded-xl landscape:rounded-2xl border border-cyan-500/10" />
                        {activeQ.id !== 'why' && activeQ.id !== 'what' && activeQ.id !== 'who' && <WordComponent text={activeQ.vi} isQ colorClass={activeQ.color.replace('bg-', 'text-')} decorationClass={`${activeQ.color}/10 border border-${activeQ.color.split('-')[1]}-400/20 px-3 landscape:px-6 py-1 landscape:py-2 rounded-xl landscape:rounded-2xl ml-1 landscape:ml-4`} />}
                        {activeQ.id === 'who' && <span className="text-blue-400 ml-[-0.25rem] landscape:ml-[-1rem]">?</span>}
                      </div>
                    </div>
                </div>
                
                <div className="aqb-translation-bar px-4 landscape:px-8 py-2 landscape:py-3 rounded-full bg-slate-950/40 border border-slate-800 text-slate-400 flex items-center gap-2 landscape:gap-3 max-w-[95%] landscape:max-w-none">
                   <Languages className="w-4 h-4 landscape:w-5 landscape:h-5 text-cyan-50 shrink-0" />
                   <span className="aqb-translation-text italic font-black text-cyan-100 text-[10px] landscape:text-sm line-clamp-2 text-center landscape:line-clamp-none">"{getFullSentenceTranslated()}"</span>
                </div>
              </div>
            </main>
          </div>

          <div className={`aqb-controls-grid hidden landscape:grid grid-cols-6 border-t ${theme === 'dark' ? 'border-slate-800/50 bg-slate-900/40' : 'border-slate-200 bg-slate-50/50'}`}>
            {controlModules.map((m) => {
              const isComplexQ = ['how', 'why', 'how_often', 'with_who', 'how_long'].includes(activeQ.id);
              const isDisabled = !isComplexQ && activeQ.hide === m.hideOn;
              const isToggledOff = m.toggle && !visibleComponents[m.key as keyof typeof visibleComponents];
              const activeData = getActiveData(m.key);
              const Icon = m.icon;

              return (
                <div key={m.key} className={`aqb-control-module p-3 flex flex-col gap-3 relative transition-all border-r last:border-r-0 ${(isDisabled || isToggledOff) ? 'opacity-30' : 'hover:bg-white/[0.02]'}`}>
                  <div className="flex items-center justify-between text-slate-500">
                    <div className="flex items-center gap-2">
                      {m.toggle && (
                        <button onClick={() => toggleVisibility(m.key as 'object' | 'companion' | 'place' | 'time')} className={`transition-colors ${visibleComponents[m.key as keyof typeof visibleComponents] ? 'text-cyan-500' : 'text-slate-600'}`}>
                          {visibleComponents[m.key as keyof typeof visibleComponents] ? <CheckSquare className="w-4 h-4" /> : <XSquare className="w-4 h-4" />}
                        </button>
                      )}
                      {!m.toggle && <Icon className="w-4 h-4" />}
                      <label className="text-[9px] font-black uppercase tracking-widest">{m.label}</label>
                    </div>
                    {loadingSlots[m.key as keyof typeof loadingSlots] && <Loader2 className="w-3 h-3 animate-spin text-cyan-500" />}
                  </div>
                  <div className={`flex flex-col gap-2 ${isDisabled ? 'pointer-events-none grayscale' : ''}`}>
                    <div className={`text-[10px] font-black px-3 py-3 rounded-xl border flex items-center justify-between ${m.key === 'subject' ? 'bg-cyan-500 text-slate-950 border-cyan-400' : (theme === 'dark' ? 'bg-slate-950 text-white border-slate-800' : 'bg-white text-slate-900 border-slate-200')}`}>
                       <span className="truncate">{activeData.vi.toUpperCase()}</span>
                       <ChevronDown className="w-3 h-3 opacity-40" />
                    </div>
                    <select value={selections[m.key as keyof typeof selections]} onChange={(e) => setSelections(s => ({...s, [m.key]: parseInt(e.target.value)}))} className="absolute inset-0 opacity-0 cursor-pointer w-full">
                       {m.key === 'subject' 
                        ? subjectVersions.map((v, i) => <option key={i} value={i} className="text-black font-bold">{v.vi}</option>) 
                        : (SENTENCE_DATA as any)[m.key + 's'].map((v: any, i: any) => <option key={i} value={i} className="text-black font-bold">{v.vi}</option>)}
                    </select>
                    <input type="text" value={(inputs as any)[m.key]} onChange={(e) => setInputs(i => ({...i, [m.key]: e.target.value}))} placeholder={t.custom} className={`bg-transparent border-b text-[9px] p-1 outline-none transition-colors ${theme === 'dark' ? 'border-slate-800 focus:border-cyan-500 text-slate-400' : 'border-slate-200 focus:border-cyan-600 text-slate-600'}`} />
                  </div>
                </div>
              );
            })}
          </div>

          <footer className={`p-4 landscape:px-8 py-3 border-t flex justify-between items-center text-[8px] font-black uppercase tracking-[0.3em] ${theme === 'dark' ? 'bg-slate-950/80 border-slate-800/50 text-slate-600' : 'bg-white border-slate-100 text-slate-400'}`}>
             <div className="flex items-center gap-6">
                <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-cyan-500" /> SUBJECT</span>
                <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> QUESTION</span>
                <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-500" /> CONTEXT</span>
             </div>
             <div className="flex items-center gap-3">
                <button onClick={toggleFullscreen} className="hover:text-cyan-500 transition-colors">
                   {isFullscreen ? <Minimize size={14} /> : <Maximize size={14} />}
                </button>
             </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

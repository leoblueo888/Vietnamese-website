
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { 
  Languages, Zap, ShieldAlert, MapPin, Clock, Cpu, 
  Volume2, Sparkles, Loader2, ChevronDown, HelpCircle, 
  Construction, Hammer, Info, Sun, Moon, Play, Users, X,
  History,
  Maximize, Minimize
} from 'lucide-react';

const apiKey = ""; // Environment handles this

const TRANSLATIONS = {
  EN: {
    howToPlay: "How to Play",
    instructions: "1. Custom Subject / Verb ... to make your sentence.\n2. Listen to the whole sentence and repeat.\n3. Listen to each word audio and repeat.\n4. Check out tooltip note for special words.",
    start: "START",
    selectLang: "System Language",
    slogan: "LEARN TO FORM VIETNAMESE SENTENCE",
    listen: "LISTEN",
    positive: "Positive",
    negative: "Negative",
    question: "YES/NO QUESTION",
    subject: "Subject",
    aspect: "Aspect",
    action: "Action",
    object: "Object",
    withWho: "With Who",
    location: "Location",
    time: "Time",
    translation: "Translation",
    custom: "Custom...",
    translateLabel: "Translate",
    pronoun: "Pronoun (He)...",
    idLabel: "ID:"
  },
  RU: {
    howToPlay: "Как играть",
    instructions: "1. Настройте Подлежащее / Глагол ... чтобы создать свое предложение.\n2. Послушайте всё предложение и повторите.\n3. Слушайте аудио каждого слова и повторяйте.\n4. Проверяйте подсказки для особых слов.",
    start: "ЗАПУСТИТЬ",
    selectLang: "Язык системы",
    slogan: "УЧИСЬ СТРОИТЬ ВЬЕТНАМСКИЕ ПРЕДЛОЖЕНИЯ",
    listen: "СЛУШАТЬ",
    positive: "Утверждение",
    negative: "Отрицание",
    question: "ДА/НЕТ ВОПРОС",
    subject: "Подлежащее",
    aspect: "Вид",
    action: "Действие",
    object: "Объект",
    withWho: "С кем",
    location: "Место",
    time: "Время",
    translation: "Перевод",
    custom: "Свой вариант...",
    translateLabel: "Перевести",
    pronoun: "Местоимение...",
    idLabel: "ЗНАЧЕНИЕ:"
  }
};

const DEFAULT_SUBJECT_VERSIONS = [
  { vi: 'Tôi', en: 'I', ru: 'Я', note: 'Neutral / polite usage\nfor professional context' }, 
  { vi: 'Mình', en: 'I', ru: 'Я', note: 'Friendly / casual tone\nbetween close peers' }, 
  { vi: 'Anh', en: 'I', ru: 'Я (муж.)', note: 'Male speaker identifying\nas older than listener' }, 
  { vi: 'Em', en: 'I', ru: 'Я', note: 'Polite self-reference\nwhen younger than listener' }, 
  { vi: 'Tớ', en: 'I', ru: 'Я', note: 'Youthful / informal style\ncommon among students' }
];

const ASPECT_MARKERS = [
  { vi: '', en: '(None)', ru: '(Нет)', note: 'Present tense or general state.' },
  { vi: 'đang', en: 'is/am/are -ing', ru: 'сейчас (делаю)', note: 'Continuous aspect.\nAction happening right now.' },
  { vi: 'đã', en: 'did/have done', ru: 'уже (сделал)', note: 'Past aspect.\nAction completed in the past.' },
  { vi: 'sẽ', en: 'will', ru: 'буду', note: 'Future aspect.\nAction intended for later.' },
  { vi: 'thường xuyên', en: 'usually', ru: 'часто/обычно', note: 'Habitual aspect.\nRepeated or regular action.' }
];

const INQUIRY_VARIANTS = [
  { vi: 'không?', note: 'Direct question. Neutral tone.' },
  { vi: 'phải không?', note: 'Confirmation request. Checking if thought is correct.' },
  { vi: 'đúng không?', note: 'Confirmation request. Seeking agreement on a fact.' }
];

const SENTENCE_DATA = {
  verbs: [
    { vi: 'ăn', en: 'eat', ru: 'есть' }, 
    { vi: 'uống', en: 'drink', ru: 'пить' }, 
    { vi: 'xem', en: 'watch', ru: 'смотреть' }, 
    { vi: 'học', en: 'study', ru: 'учиться' }, 
    { vi: 'mua', en: 'buy', ru: 'покупать' }
  ],
  objects: [
    { vi: 'phở', en: 'pho', ru: 'фо' }, 
    { vi: 'cà phê', en: 'coffee', ru: 'кофе' }, 
    { vi: 'phim', en: 'movie', ru: 'фильм' }, 
    { vi: 'tiếng Việt', en: 'Vietnamese', ru: 'вьетнамский' }, 
    { vi: 'sách', en: 'book', ru: 'книгу' }
  ],
  withWhos: [
    { vi: 'với Lan', en: 'with Lan', ru: 'с Ланой' },
    { vi: 'với Jack', en: 'with Jack', ru: 'с Джеком' },
    { vi: 'với bạn', en: 'with friend', ru: 'с другом' },
    { vi: 'với gia đình', en: 'with family', ru: 'с семьей' },
    { vi: 'một mình', en: 'alone', ru: 'в одиночку' }
  ],
  places: [
    { vi: 'ở nhà', en: 'at home', ru: 'дома' }, 
    { vi: 'tại nhà hàng', en: 'at the restaurant', ru: 'в ресторане' }, 
    { vi: 'ở quán cà phê', en: 'at the cafe', ru: 'в кафе' }, 
    { vi: 'tại trường', en: 'at school', ru: 'в школе' }, 
    { vi: 'ở thư viện', en: 'at the library', ru: 'в библиотеке' }
  ],
  times: [
    { vi: 'sáng nay', en: 'this morning', ru: 'этим утром' }, 
    { vi: 'bây giờ', en: 'now', ru: 'сейчас' }, 
    { vi: 'tối qua', en: 'last night', ru: 'прошлой ночью' }, 
    { vi: 'mỗi ngày', en: 'every day', ru: 'каждый ngày' }, 
    { vi: 'vào cuối tuần', en: 'on the weekend', ru: 'на выходных' }
  ]
};

export const GrammarASA: React.FC = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [lang, setLang] = useState('EN');
  const [mode, setMode] = useState('affirmative'); 
  const [theme, setTheme] = useState('dark'); 
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [inquiryVariantIdx, setInquiryVariantIdx] = useState(0);
  const [showInquiryDropdown, setShowInquiryDropdown] = useState(false);
  
  const [selections, setSelections] = useState({ subject: 0, aspect: 0, verb: 0, object: 0, withWho: 0, place: 0, time: 0 });
  const [inputs, setInputs] = useState({ subject: "", verb: "", object: "", withWho: "", place: "", time: "" });
  const [customData, setCustomData] = useState({ subject: null, verb: null, object: null, withWho: null, place: null, time: null });
  const [loadingSlots, setLoadingSlots] = useState({ subject: false, verb: false, object: false, withWho: false, place: false, time: false });
  
  const [visibility, setVisibility] = useState({ aspect: true, object: true, withWho: true, place: true, time: true });
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

  const getActiveData = (key: string) => {
    if (key === 'subject') {
      return subjectVersions[selections.subject] || subjectVersions[0];
    }
    if (key === 'aspect') {
      return ASPECT_MARKERS[selections.aspect];
    }
    return (customData as any)[key] || (SENTENCE_DATA as any)[key + 's'][selections[key as keyof typeof selections]];
  };

  const getMeaningText = (data: { ru: any; en: any; vi: any; }) => {
    if (lang === 'RU' && data.ru) return data.ru;
    return data.en || data.vi;
  };

  const currentData = {
    subj: getActiveData('subject'),
    aspect: getActiveData('aspect'),
    verb: getActiveData('verb'),
    obj: getActiveData('object'),
    withWho: getActiveData('withWho'),
    place: getActiveData('place'),
    time: getActiveData('time'),
  };

  const adjustFontSize = useCallback(() => {
    if (sentenceRef.current && containerRef.current && !isFullscreen) {
      const containerWidth = (containerRef.current as any).offsetWidth - 30;
      const contentWidth = (sentenceRef.current as any).scrollWidth;
      
      if (contentWidth > containerWidth) {
        setScale(Math.max(containerWidth / contentWidth, 0.2));
      } else {
        setScale(1.0); 
      }
    }
  }, [isFullscreen]);

  useEffect(() => {
    if (gameStarted) {
      adjustFontSize();
      window.addEventListener('resize', adjustFontSize);
      return () => window.removeEventListener('resize', adjustFontSize);
    }
  }, [currentData, mode, inquiryVariantIdx, visibility, adjustFontSize, gameStarted]);

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

  const callGemini = async (prompt: any) => {
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
            translateSlot(key, val, lang === 'RU' ? 'Russian' : 'English');
          }
        } else if (val === "" && key !== 'subject' && (customData as any)[key]) {
          setCustomData(prev => ({ ...prev, [key]: null }));
        } else if (val === "" && key === 'subject') {
            setSubjectVersions(DEFAULT_SUBJECT_VERSIONS);
            setSelections(prev => ({...prev, subject: 0}));
        }
      });
    }, 800);
    return () => clearTimeout(timer);
  }, [inputs, lang]);

  const updateSubjectVersions = async (text: string) => {
    setLoadingSlots(prev => ({ ...prev, subject: true }));
    const targetLang = lang === 'RU' ? 'Russian' : 'English';
    const prompt = `User input a subject in ${targetLang}: "${text}". 
    Provide 5 different natural Vietnamese versions/pronouns for this subject based on social context.
    For each version, provide a short "note" in English (max 10 words) explaining the usage.
    Also provide the translation back to ${targetLang} as "ru" or "en" field.
    Return ONLY a JSON array of objects: [{"vi": "...", "en": "${text}", "ru": "...", "note": "..."}]`;
    
    try {
      const result = await callGemini(prompt);
      const versions = JSON.parse(result.candidates[0].content.parts[0].text);
      if (Array.isArray(versions)) {
        setSubjectVersions(versions);
        setSelections(prev => ({ ...prev, subject: 0 }));
      }
    } catch (e) {
      console.error("Subject translation error", e);
    } finally {
      setLoadingSlots(prev => ({ ...prev, subject: false }));
    }
  };

  const translateSlot = async (slot: string, text: string, targetLangName: string) => {
    setLoadingSlots(prev => ({ ...prev, [slot]: true }));
    const prompt = `Translate to Vietnamese for a sentence builder. Word/Phrase: "${text}". 
    Also provide the translation in ${targetLangName}. 
    Return ONLY JSON: {"vi": "...", "en": "...", "ru": "..."}`;
    try {
      const result = await callGemini(prompt);
      const translated = JSON.parse(result.candidates[0].content.parts[0].text);
      setCustomData(prev => ({ ...prev, [slot]: { ...translated, input: text } }));
    } catch (e) {
      console.error("Translation error", e);
    } finally {
      setLoadingSlots(prev => ({ ...prev, [slot]: false }));
    }
  };

  const getFullSentenceVi = () => {
    const { subj, aspect, verb, obj, withWho, place, time } = currentData;
    const parts = [subj.vi];
    if (mode === 'negative') parts.push('không');
    if (mode === 'question') parts.push('có');
    if (visibility.aspect && aspect.vi) parts.push(aspect.vi);
    parts.push(verb.vi);
    if (visibility.object) parts.push(obj.vi);
    if (visibility.withWho) parts.push(withWho.vi);
    if (visibility.place) parts.push(place.vi);
    if (visibility.time) parts.push(time.vi);
    if (mode === 'question') parts.push(INQUIRY_VARIANTS[inquiryVariantIdx].vi);
    return parts.join(' ').replace(/\s+/g, ' ').trim();
  };

  const getFullSentenceTranslation = () => {
    const { subj, aspect, verb, obj, withWho, place, time } = currentData;
    const targetKey = lang === 'RU' ? 'ru' : 'en';
    const subjTxt = (subj as any)[targetKey] || subj.en || subj.vi;
    const verbTxt = (verb as any)[targetKey] || verb.en || verb.vi;
    const aspectVi = visibility.aspect ? aspect.vi : "";
    const objTxt = visibility.object ? ` ${(obj as any)[targetKey] || obj.en || obj.vi}` : "";
    const withWhoTxt = visibility.withWho ? ` ${(withWho as any)[targetKey] || withWho.en || withWho.vi}` : "";
    const placeTxt = visibility.place ? ` ${(place as any)[targetKey] || place.en || place.vi}` : "";
    const timeTxt = visibility.time ? ` ${(time as any)[targetKey] || time.en || time.vi}` : "";

    if (lang === 'RU') {
      let prefix = "";
      if (mode === 'negative') prefix = "не ";
      
      let vForm = verbTxt;
      if (aspectVi === 'đang') vForm = `сейчас ${verbTxt}`;
      if (aspectVi === 'đã') vForm = `${verbTxt} (в прошлом)`;
      if (aspectVi === 'sẽ') vForm = `будет ${verbTxt}`;
      
      if (mode === 'question') return `${subjTxt} ${prefix}${vForm}${objTxt}${withWhoTxt}${placeTxt}${timeTxt}?`;
      return `${subjTxt} ${prefix}${vForm}${objTxt}${withWhoTxt}${placeTxt}${timeTxt}.`;
    } else {
      const isThirdPerson = !(subjTxt?.toLowerCase() === 'i' || subjTxt?.toLowerCase() === 'you' || subjTxt?.toLowerCase() === 'we' || subjTxt?.toLowerCase() === 'they');
      
      if (mode === 'question') {
        let qVerb = verbTxt;
        let aux = isThirdPerson ? "Does" : "Do";
        if (aspectVi === 'đang') { aux = isThirdPerson ? "Is" : "Are"; qVerb = verbTxt + "ing"; }
        if (aspectVi === 'đã') { aux = "Did"; }
        if (aspectVi === 'sẽ') { aux = "Will"; }
        return `${aux} ${subjTxt?.toLowerCase()} ${qVerb}${objTxt}${withWhoTxt}${placeTxt}${timeTxt}?`;
      }

      if (mode === 'negative') {
        let nVerb = verbTxt;
        let aux = isThirdPerson ? "doesn't" : "don't";
        if (aspectVi === 'đang') { aux = isThirdPerson ? "is not" : "are not"; nVerb = verbTxt + "ing"; }
        if (aspectVi === 'đã') { aux = "didn't"; }
        if (aspectVi === 'sẽ') { aux = "won't"; }
        return `${subjTxt} ${aux} ${nVerb}${objTxt}${withWhoTxt}${placeTxt}${timeTxt}.`;
      }

      let fVerb = isThirdPerson ? (verbTxt + "s") : verbTxt;
      if (aspectVi === 'đang') fVerb = (isThirdPerson ? "is " : "am/are ") + verbTxt + "ing";
      if (aspectVi === 'đã') fVerb = verbTxt + "ed (past)";
      if (aspectVi === 'sẽ') fVerb = "will " + verbTxt;
      return `${subjTxt} ${fVerb}${objTxt}${withWhoTxt}${placeTxt}${timeTxt}.`;
    }
  };

  const speakFullSentence = () => {
    speakWithGoogleTTS(getFullSentenceVi());
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const WordComponent = ({ text, colorClass, decorationClass, note, isMain = false, isQuestionVariant = false, isOptionalCo = false, isSubject = false }: { text: any, colorClass: any, decorationClass: any, note: any, isMain?: boolean, isQuestionVariant?: boolean, isOptionalCo?: boolean, isSubject?: boolean }) => (
    <div className="relative group/word inline-flex items-center">
      <div 
        className={`flex items-center gap-1 transition-all duration-300 hover:scale-105 ${colorClass} ${decorationClass} asa-word-box px-2 landscape:px-3 py-1 rounded-lg relative z-20 whitespace-nowrap font-black cursor-pointer`}
        onClick={() => speakWithGoogleTTS(text)}
      >
        <span className="asa-word-text">{text}</span>
        {isMain && <span className={`absolute -inset-1 blur-sm rounded-lg -z-10 group-hover/word:bg-white/10 transition-all ${theme === 'dark' ? 'bg-white/5' : 'bg-black/5'}`}></span>}
        
        {isQuestionVariant && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setShowInquiryDropdown(!showInquiryDropdown);
            }}
            className={`asa-dropdown-btn ml-1 landscape:ml-2 p-1 rounded-md transition-colors ${theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-black/5'}`}
          >
            <ChevronDown className={`asa-dropdown-icon w-4 h-4 landscape:w-6 landscape:h-6 transition-transform duration-300 ${showInquiryDropdown ? 'rotate-180' : ''}`} />
          </button>
        )}
      </div>
      
      {note && (
        <div className={`fixed landscape:absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 landscape:top-full landscape:left-1/2 landscape:-translate-x-1/2 landscape:translate-y-2 landscape:pt-4 opacity-0 pointer-events-none group-hover/word:opacity-100 transition-all duration-300 z-[9999] ${isQuestionVariant || isOptionalCo || isSubject ? 'min-w-[280px] landscape:min-w-[400px]' : 'w-64 landscape:w-64'}`}>
          <div className={`border p-6 landscape:p-6 rounded-2xl shadow-[0_30px_60px_rgba(0,0,0,0.8)] text-center relative ${theme === 'dark' ? 'bg-slate-900 text-cyan-50' : 'bg-white text-slate-900 shadow-[0_15px_40px_rgba(0,0,0,0.1)]'} ${isQuestionVariant || isOptionalCo || isSubject ? 'border-amber-500/40 shadow-amber-500/10' : 'border-cyan-500/40'}`}>
            <div className={`hidden landscape:block absolute bottom-full left-1/2 -translate-x-1/2 w-4 h-4 border-l border-t rotate-45 -mb-2 translate-y-2 ${theme === 'dark' ? 'bg-slate-900' : 'bg-white'} ${isQuestionVariant || isOptionalCo || isSubject ? 'border-amber-500/40' : 'border-cyan-500/40'}`}></div>
            <p className={`asa-tooltip-text ${isQuestionVariant || isOptionalCo || isSubject ? 'text-[14px] landscape:text-[16px]' : 'text-[12px] landscape:text-[11px]'} font-black tracking-widest whitespace-pre-line leading-relaxed`}>
              {note}
            </p>
          </div>
        </div>
      )}

      {isQuestionVariant && showInquiryDropdown && (
        <div className="absolute top-full left-0 mt-2 w-max opacity-100 pointer-events-auto transition-all duration-200 z-[110] animate-in slide-in-from-top-2">
          <div className={`border rounded-xl shadow-2xl overflow-hidden flex flex-col p-1 min-w-[140px] landscape:min-w-[200px] ${theme === 'dark' ? 'bg-slate-900 border-amber-500/40' : 'bg-white border-amber-500/20'}`}>
            {INQUIRY_VARIANTS.map((v, i) => (
              <button 
                key={v.vi}
                onClick={(e) => {
                  e.stopPropagation();
                  setInquiryVariantIdx(i);
                  speakWithGoogleTTS(v.vi);
                  setShowInquiryDropdown(false);
                }}
                className={`asa-inquiry-option px-3 py-3 landscape:px-4 landscape:py-4 text-left text-[11px] landscape:text-base font-black uppercase tracking-widest transition-colors rounded-lg ${inquiryVariantIdx === i ? 'bg-amber-500 text-slate-950' : `${theme === 'dark' ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-600 hover:bg-slate-50'}`}`}
              >
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
      <div className={`h-full w-full transition-colors duration-500 flex items-center justify-center p-4 overflow-hidden font-mono ${theme === 'dark' ? 'bg-[#020617] text-slate-200' : 'bg-slate-50 text-slate-900'}`}>
        <div className={`absolute inset-0 opacity-[0.03] pointer-events-none ${theme === 'dark' ? '' : 'grayscale invert'}`} style={{ backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
        <div className={`w-full max-w-md backdrop-blur-2xl rounded-[32px] p-8 flex flex-col items-center gap-6 relative overflow-hidden border transition-all duration-500 ${theme === 'dark' ? 'bg-slate-900/60 border-slate-800 shadow-2xl' : 'bg-white border-slate-200 shadow-xl'}`}>
          <div className="flex flex-col items-center gap-1">
            <div className={`p-3 rounded-2xl ${theme === 'dark' ? 'bg-cyan-500/10' : 'bg-cyan-50'}`}>
              <Construction className={`w-8 h-8 ${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'}`} />
            </div>
            <h1 className="text-2xl font-black tracking-[0.1em] uppercase mt-2 text-center text-cyan-500">ACTION SENTENCE ARCHITECT</h1>
          </div>
          <div className={`w-full p-5 rounded-2xl border ${theme === 'dark' ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            <div className="flex items-center gap-2 mb-2 text-cyan-500">
              <Info className="w-4 h-4" />
              <h2 className="text-[10px] font-black uppercase tracking-widest">{t.howToPlay}</h2>
            </div>
            <div className="space-y-1.5">
              {t.instructions.split('\n').map((line, i) => (
                <p key={i} className="text-[11px] font-medium leading-tight opacity-80">{line}</p>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-4 w-full">
            <div className="flex flex-col gap-2">
              <p className="text-[9px] font-black uppercase tracking-widest text-center text-slate-500">{t.selectLang}</p>
              <div className="flex gap-2">
                {['EN', 'RU'].map(l => (
                  <button key={l} onClick={() => setLang(l as 'EN' | 'RU')} className={`flex-1 py-2.5 rounded-xl border-2 font-black text-xs transition-all ${lang === l ? (theme === 'dark' ? 'bg-cyan-500 border-cyan-400 text-slate-950' : 'bg-cyan-600 border-cyan-500 text-white') : (theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-600')}`}>
                    {l === 'EN' ? 'ENGLISH' : 'РУССКИЙ'}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={() => setGameStarted(true)} className={`w-full py-4 rounded-xl font-black text-sm tracking-widest transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 shadow-lg ${theme === 'dark' ? 'bg-white text-slate-950 hover:bg-cyan-400' : 'bg-slate-900 text-white hover:bg-cyan-600'}`}>
              <Play className="w-5 h-5 fill-current" /> {t.start}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={gameContainerRef} className="asa-game-root absolute inset-0 w-full h-full">
      <div className={`asa-game-wrapper w-full h-full transition-colors duration-500 flex flex-col font-mono ${theme === 'dark' ? 'bg-[#020617] text-slate-200' : 'bg-slate-50 text-slate-900'}`}>
        <div className={`absolute inset-0 opacity-[0.03] pointer-events-none ${theme === 'dark' ? '' : 'grayscale invert'}`} style={{ backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
        <div className={`w-full h-full backdrop-blur-xl flex flex-col relative overflow-hidden ${theme === 'dark' ? 'bg-slate-900/40 border-slate-800/50' : 'bg-white/80 border-slate-200'}`}>
          
          <header className={`asa-header p-4 landscape:p-6 border-b flex justify-between items-center relative z-10 ${theme === 'dark' ? 'border-slate-800/50 bg-slate-900/60' : 'border-slate-100 bg-white/60'}`}>
            <div className="flex items-center gap-3 landscape:gap-5">
              <button onClick={toggleTheme} className={`asa-theme-btn p-2.5 landscape:p-3 rounded-xl shadow-[0_0_20px_rgba(8,145,178,0.4)] relative overflow-hidden group transition-all transform active:scale-90 ${theme === 'dark' ? 'bg-cyan-600 hover:bg-cyan-500' : 'bg-cyan-500 hover:bg-cyan-400'}`}>
                <div className="relative z-10 flex flex-col items-center justify-center">
                  <Sun className={`asa-theme-icon w-4 h-4 landscape:w-6 landscape:h-6 text-white transition-all duration-500 ${theme === 'dark' ? 'opacity-100 scale-100' : 'opacity-0 scale-0 absolute'}`} />
                  <Moon className={`asa-theme-icon w-4 h-4 landscape:w-6 landscape:h-6 text-white transition-all duration-500 ${theme === 'light' ? 'opacity-100 scale-100' : 'opacity-0 scale-0 absolute'}`} />
                </div>
              </button>
              <div>
                <h1 className={`asa-title text-[11px] landscape:text-sm font-black tracking-[0.2em] uppercase flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                  ACTION SENTENCE ARCHITECT
                </h1>
                <span className="asa-slogan hidden landscape:block text-[9px] text-slate-500 uppercase font-bold tracking-widest">{t.slogan}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 landscape:gap-4">
              <button onClick={speakFullSentence} className={`asa-listen-btn group flex items-center gap-2 landscape:gap-3 px-3 landscape:px-8 py-2 landscape:py-3 rounded-xl transition-all active:scale-95 text-[10px] landscape:text-[11px] font-black uppercase tracking-widest ${theme === 'dark' ? 'bg-slate-800 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500 hover:text-slate-950 shadow-inner' : 'bg-slate-100 text-cyan-700 border border-cyan-600/20 hover:bg-cyan-600 hover:text-white'}`}>
                <Volume2 className="w-4 h-4" /> <span className="hidden landscape:inline">{t.listen}</span>
              </button>
              <div className={`asa-mode-switcher flex rounded-xl p-1 border shadow-inner ${theme === 'dark' ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                {[
                  {id: 'affirmative', label: t.positive, short: 'P', color: 'hover:text-cyan-400', active: 'bg-cyan-500 text-slate-950'},
                  {id: 'negative', label: t.negative, short: 'N', color: 'hover:text-rose-400', active: 'bg-rose-500 text-white'},
                  {id: 'question', label: t.question, short: 'Q', color: 'hover:text-amber-400', active: 'bg-amber-400 text-slate-950'}
                ].map((btn) => (
                  <button 
                    key={btn.id} 
                    onClick={() => { setMode(btn.id); setShowInquiryDropdown(false); }} 
                    className={`asa-mode-btn px-3 landscape:px-5 py-2 landscape:py-2.5 text-[10px] uppercase font-black transition-all rounded-lg ${mode === btn.id ? btn.active : `text-slate-500 ${btn.color}`}`}
                  >
                    <span className="hidden landscape:inline">{btn.label}</span>
                    <span className="landscape:hidden">{btn.short}</span>
                  </button>
                ))}
              </div>
            </div>
          </header>

          <main className="asa-main flex-1 flex portrait:flex-row landscape:flex-col-reverse overflow-hidden min-h-0">
            <aside className={`asa-aside flex-shrink-0 portrait:w-[30%] portrait:max-w-[200px] landscape:w-full portrait:border-r landscape:border-t portrait:border-t-0 portrait:overflow-y-auto custom-scrollbar ${theme === 'dark' ? 'border-slate-800/50 bg-slate-900/30' : 'border-slate-200 bg-slate-50/50'}`}>
              <div className="portrait:flex portrait:flex-col landscape:grid landscape:grid-cols-7 h-full">
                {[
                  { label: t.subject, key: 'subject' },
                  { label: t.aspect, key: 'aspect', isOptional: true },
                  { label: t.action, key: 'verb' },
                  { label: t.object, key: 'object', isOptional: true },
                  { label: t.withWho, key: 'withWho', isOptional: true },
                  { label: t.location, key: 'place', isOptional: true },
                  { label: t.time, key: 'time', isOptional: true }
                ].map((module) => {
                  const activeData = getActiveData(module.key);
                  const isHidden = module.isOptional && !visibility[module.key as keyof typeof visibility];
                  return (
                    <div key={module.key} className={`asa-control-module p-2 portrait:p-4 landscape:border-r portrait:border-b last:landscape:border-r-0 last:portrait:border-b-0 ${theme === 'dark' ? 'border-slate-800/40' : 'border-slate-200'} ${isHidden ? 'opacity-40 grayscale' : 'opacity-100'}`}>
                      <div className="flex items-center justify-between mb-1">
                        <label className="asa-control-label text-[7px] font-black uppercase text-slate-500 truncate">{module.label}</label>
                        {module.isOptional && (
                           <button onClick={() => setVisibility(v => ({ ...v, [module.key]: !v[module.key as keyof typeof v] }))} className="asa-visibility-toggle w-3.5 h-3.5 rounded border flex items-center justify-center">
                              {visibility[module.key as keyof typeof visibility] ? <div className="w-1 h-1 rounded-full bg-cyan-500" /> : <X className="w-2 h-2" />}
                           </button>
                        )}
                      </div>
                      <div className="relative mb-1">
                        <div className={`asa-select-display text-[9px] font-black px-2 py-2 rounded-lg border-2 truncate ${module.key === 'subject' ? (theme === 'dark' ? 'bg-cyan-500 text-slate-950 border-cyan-400' : 'bg-cyan-600 text-white border-cyan-500') : (theme === 'dark' ? 'bg-slate-950 text-white border-slate-800' : 'bg-white text-slate-900 border-slate-200')}`}>
                           {activeData.vi ? activeData.vi.toUpperCase() : "---"}
                        </div>
                        <select 
                          value={selections[module.key as keyof typeof selections]} 
                          onChange={(e) => setSelections(prev => ({ ...prev, [module.key]: parseInt(e.target.value) }))}
                          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer text-black font-bold"
                          disabled={isHidden}
                        >
                           {module.key === 'subject' ? subjectVersions.map((v, i) => <option key={i} value={i} className="text-black font-bold">{v.vi}</option>) : 
                            module.key === 'aspect' ? ASPECT_MARKERS.map((v, i) => <option key={i} value={i} className="text-black font-bold">{v.vi || "None"}</option>) :
                            (SENTENCE_DATA as any)[module.key + 's'].map((item: { vi: string | number | readonly string[] | undefined; }, i: React.Key | null | undefined) => <option key={i} value={i as any} className="text-black font-bold">{item.vi}</option>)}
                        </select>
                      </div>
                      {module.key !== 'aspect' && (
                       <input 
                          type="text" 
                          placeholder={module.key === 'subject' ? t.pronoun : t.translateLabel} 
                          value={(inputs as any)[module.key]} 
                          onChange={(e) => setInputs(prev => ({ ...prev, [module.key]: e.target.value }))} 
                          className={`asa-custom-input w-full px-2 py-1 rounded-md text-[8px] font-bold outline-none border mb-1 ${theme === 'dark' ? 'bg-slate-950/30 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`} 
                          disabled={isHidden} 
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </aside>
            
            <div className="asa-sentence-container flex-1 flex flex-col overflow-hidden relative">
               <div ref={containerRef as any} className="flex-1 flex flex-col justify-center items-center px-4 landscape:px-10 overflow-hidden relative">
                  <div 
                    ref={sentenceRef as any}
                    style={{ transform: `scale(${scale})`, transformOrigin: 'center', transition: 'transform 0.4s' }}
                    className="asa-sentence-content flex flex-wrap landscape:flex-nowrap items-center justify-center gap-x-2 landscape:gap-x-6 gap-y-3 text-2xl landscape:text-7xl font-black tracking-tighter z-20 text-center"
                  >
                     <WordComponent text={currentData.subj.vi} note={currentData.subj.note} isMain isSubject colorClass={theme === 'dark' ? 'text-white' : 'text-slate-900'} decorationClass={`underline underline-offset-4 landscape:underline-offset-8 ${theme === 'dark' ? 'decoration-cyan-500/30' : 'decoration-cyan-600/30'}`} />
                     {mode === 'question' && <WordComponent text="có" note={null} colorClass={theme === 'dark' ? 'text-amber-400/80' : 'text-amber-600'} decorationClass="italic border-b border-amber-400/20" />}
                     {mode === 'negative' && <WordComponent text="không" note={null} colorClass={theme === 'dark' ? 'text-rose-500' : 'text-rose-600'} decorationClass="border px-3 landscape:px-6 py-1 landscape:py-2 rounded-xl landscape:rounded-2xl bg-rose-500/10 border-rose-500/20" />}
                     {visibility.aspect && currentData.aspect.vi && <WordComponent text={currentData.aspect.vi} note={currentData.aspect.note} colorClass={theme === 'dark' ? 'text-amber-500' : 'text-amber-600'} decorationClass="border-b-2 border-dotted border-amber-500/40" />}
                     <WordComponent text={currentData.verb.vi} note={null} isMain colorClass={theme === 'dark' ? 'text-white' : 'text-slate-900'} decorationClass="border-b-2 landscape:border-b-4 border-slate-800" />
                     {visibility.object && <WordComponent text={currentData.obj.vi} note={null} isMain colorClass={theme === 'dark' ? 'text-white' : 'text-slate-900'} decorationClass="border-b-2 landscape:border-b-4 border-slate-800" />}
                     {visibility.withWho && <WordComponent text={currentData.withWho.vi} note={null} colorClass={theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'} decorationClass="px-2 landscape:px-4 py-1 landscape:py-2 rounded-lg landscape:rounded-xl bg-indigo-500/5 border border-indigo-500/20" />}
                     {visibility.place && <WordComponent text={currentData.place.vi} note={null} colorClass={theme === 'dark' ? 'text-cyan-400/60' : 'text-cyan-600/80'} decorationClass="px-3 landscape:px-6 py-1 landscape:py-2 rounded-lg landscape:rounded-2xl border border-cyan-500/10" />}
                     {visibility.time && <WordComponent text={currentData.time.vi} note={null} colorClass="text-slate-500" decorationClass="italic" />}
                     {mode === 'question' && (
                       <WordComponent text={INQUIRY_VARIANTS[inquiryVariantIdx].vi} note={INQUIRY_VARIANTS[inquiryVariantIdx].note} isQuestionVariant colorClass={theme === 'dark' ? 'text-amber-400' : 'text-amber-600'} decorationClass="border px-3 landscape:px-6 py-1 landscape:py-2 rounded-lg landscape:rounded-2xl bg-amber-400/10 border-amber-400/20 ml-1 landscape:ml-4" />
                     )}
                  </div>
               </div>

               <footer className={`asa-footer p-3 landscape:p-5 border-t z-10 flex items-center justify-center shrink-0 ${theme === 'dark' ? 'border-slate-800 bg-slate-950/50' : 'border-slate-100 bg-slate-50'}`}>
                 <div className="w-full flex flex-col landscape:flex-row items-center justify-center text-center">
                    <p className="asa-translation-label text-[9px] landscape:hidden font-black text-cyan-500 uppercase tracking-widest mb-1">{t.translation}</p>
                    <p className={`asa-translation-text text-[12px] landscape:text-lg font-bold tracking-tight leading-snug max-w-2xl px-4 ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                       "{getFullSentenceTranslation()}"
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
        .custom-scrollbar::-webkit-scrollbar { width: 4px; } 
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
        
        .asa-game-root:fullscreen { background: #000; display: flex; align-items: center; justify-content: center; }
        .asa-game-root:fullscreen .asa-game-wrapper {
            aspect-ratio: 16 / 9;
            width: auto; height: auto;
            max-width: 100%; max-height: 100%;
        }
        .asa-game-root:fullscreen .asa-game-wrapper { overflow: hidden; }

        /* VMIN Scaling for Fullscreen */
        .asa-game-root:fullscreen .asa-header { padding: 1.5vmin; }
        .asa-game-root:fullscreen .asa-theme-btn { padding: 1.5vmin; border-radius: 1.2vmin; }
        .asa-game-root:fullscreen .asa-theme-icon { width: 3vmin; height: 3vmin; }
        .asa-game-root:fullscreen .asa-title { font-size: 1.5vmin; }
        .asa-game-root:fullscreen .asa-slogan { font-size: 1vmin; }
        .asa-game-root:fullscreen .asa-listen-btn { padding: 1.5vmin 3vmin; border-radius: 1.2vmin; font-size: 1.2vmin; gap: 1vmin; }
        .asa-game-root:fullscreen .asa-listen-btn svg { width: 2vmin; height: 2vmin; }
        .asa-game-root:fullscreen .asa-mode-switcher { padding: 0.5vmin; border-radius: 1.2vmin; }
        .asa-game-root:fullscreen .asa-mode-btn { padding: 1.2vmin 2.5vmin; font-size: 1.2vmin; border-radius: 0.8vmin; }
        
        .asa-game-root:fullscreen .asa-main { flex-direction: column-reverse; }
        .asa-game-root:fullscreen .asa-aside { width: 100%; overflow-x: auto; overflow-y: hidden; border-r: 0; border-top: 1px solid; }
        .asa-game-root:fullscreen .asa-aside > div { display: grid; grid-template-columns: repeat(7, 1fr); }
        .asa-game-root:fullscreen .asa-control-module { padding: 1vmin 1.5vmin; border-b: 0; border-right: 1px solid; }
        .asa-game-root:fullscreen .asa-control-label { font-size: 1vmin; }
        .asa-game-root:fullscreen .asa-visibility-toggle { width: 1.8vmin; height: 1.8vmin; }
        .asa-game-root:fullscreen .asa-select-display { font-size: 1.2vmin; padding: 1vmin; border-radius: 0.8vmin; }
        .asa-game-root:fullscreen .asa-custom-input { font-size: 1.1vmin; padding: 0.8vmin 1vmin; border-radius: 0.6vmin; }
        
        .asa-game-root:fullscreen .asa-sentence-container { padding: 2vmin; }
        .asa-game-root:fullscreen .asa-sentence-content { transform: scale(1) !important; flex-wrap: nowrap; gap: 2.5vmin; }
        .asa-game-root:fullscreen .asa-word-text { font-size: 9.5vmin; }
        .asa-game-root:fullscreen .asa-word-box { padding: 0.5vmin 2vmin; border-radius: 1.5vmin; }
        .asa-game-root:fullscreen .asa-dropdown-btn { padding: 0.5vmin; }
        .asa-game-root:fullscreen .asa-dropdown-icon { width: 3vmin; height: 3vmin; }
        .asa-game-root:fullscreen .asa-tooltip-text { font-size: 1.5vmin; }
        .asa-game-root:fullscreen .asa-inquiry-option { font-size: 1.8vmin; padding: 1.5vmin 2vmin; }

        .asa-game-root:fullscreen .asa-footer { padding: 1.5vmin; }
        .asa-game-root:fullscreen .asa-translation-text { font-size: 2.5vmin; }
      `}</style>
    </div>
  );
};

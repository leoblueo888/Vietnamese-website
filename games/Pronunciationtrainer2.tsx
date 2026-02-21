import React,  { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Mic, Square, RotateCcw, Volume2, Layers, BookOpen, Globe, Volume1, Info, HelpCircle, X, ChevronRight, Languages } from 'lucide-react';

// --- IMPORT HÀM TỪ CONFIG (Giữ nguyên không sửa file gốc) ---
import { generateContentWithRetry } from '../config/apiKeys';

// --- Assets & Constants ---
const INITIAL_CONSONANTS = ["", "b", "c", "ch", "d", "đ", "g", "gh", "gi", "h", "k", "kh", "l", "m", "n", "ng", "ngh", "nh", "p", "ph", "qu", "r", "s", "t", "th", "tr", "v", "x"];
const MODEL_NAME = "gemini-2.5-flash";

const TRANSLATIONS = {
  en: {
    startTitle: "PRONUNCIATION TRAINER 2",
    chooseLang: "Select Interface Language",
    startBtn: "Start Training",
    howToTitle: "How to use this tool",
    step1: "Select a diphthong or combination from the library.",
    step2: "Listen to the native pronunciation (Speaker icon).",
    step3: "Observe the meaning and example sentences provided.",
    tabV: "Diphthong", tabCV: "Consonant + Diphthong", tabVC: "Diphthong + Consonant", tabCVC: "Con1 + Diphthong + Con2",
    mobV: "Dip", mobCV: "Con + Dip", mobVC: "Dip + Con", mobCVC: "Con1 + Dip + Con2",
    prefixLabel: "Prefix_Consonant", footer: "Adaptive Engine // Gemini 2.5 Flash",
    contextTitle: "Context", backBtn: "Exit"
  },
  ru: {
    startTitle: "PRONUNCIATION TRAINER 2",
    chooseLang: "Выберите язык интерфейса",
    startBtn: "Начать обучение",
    howToTitle: "Как использовать этот инструмент",
    step1: "Выберите дифтонг или комбинацию из библиотеки.",
    step2: "Прослушайте эталонное произношение (иконка динамика).",
    step3: "Посмотрите значение и примеры предложений.",
    tabV: "Дифтонг", tabCV: "Согласный + Дифтонг", tabVC: "Дифтоng + Согласный", tabCVC: "Сог1 + Дифтонг + Сог2",
    mobV: "Dip", mobCV: "Con + Dip", mobVC: "Dip + Con", mobCVC: "Con1 + Dip + Con2",
    prefixLabel: "Префикс_Согласная", footer: "Движок: Gemini 2.5 Flash",
    contextTitle: "Контекст", backBtn: "Выход"
  }
};

// ... (Giữ nguyên các hàm addTone, isVietnameseCombo, DIPHTHONG_BASES cũ của ông) ...
const isVietnameseCombo = (prefix: string, rhymeBase: string, tone: string) => {
  if (!prefix) {
    const stopConsonants = ['p', 't', 'c', 'ch'];
    const endsWithStop = stopConsonants.some(s => rhymeBase.endsWith(s));
    if (endsWithStop && !['sắc', 'nặng'].includes(tone)) return false;
    return true;
  }
  const frontVowels = ['i', 'e', 'ê'];
  const startsWithFront = frontVowels.some(v => rhymeBase.startsWith(v));
  if (['k', 'gh', 'ngh'].includes(prefix) && !startsWithFront) return false;
  if (['c', 'g', 'ng'].includes(prefix) && startsWithFront) return false;
  const stopConsonants = ['p', 't', 'c', 'ch'];
  const endsWithStop = stopConsonants.some(s => rhymeBase.endsWith(s));
  if (endsWithStop && !['sắc', 'nặng'].includes(tone)) return false;
  if (prefix === 'qu' && rhymeBase.startsWith('u')) return false; 
  if (prefix === 'gi' && rhymeBase.startsWith('i')) return false;
  return true;
};

const generateValidTones = (base: string, prefix: string) => {
  const allTones = [
    { char: base, toneName: 'ngang' },
    { char: addTone(base, 'huyền'), toneName: 'huyền' },
    { char: addTone(base, 'sắc'), toneName: 'sắc' },
    { char: addTone(base, 'hỏi'), toneName: 'hỏi' },
    { char: addTone(base, 'ngã'), toneName: 'ngã' },
    { char: addTone(base, 'nặng'), toneName: 'nặng' }
  ];
  return allTones.filter(t => isVietnameseCombo(prefix, base, t.toneName));
};

function addTone(word: string, tone: string) {
  const toneMap: Record<string, Record<string, string>> = {
    'ai': { huyền: 'ài', sắc: 'ái', hỏi: 'ải', ngã: 'ãi', nặng: 'ại' },
    'ao': { huyền: 'ào', sắc: 'áo', hỏi: 'ảo', ngã: 'ão', nặng: 'ạo' },
    'au': { huyền: 'àu', sắc: 'áu', hỏi: 'ảu', ngã: 'ãu', nặng: 'ạo' },
    'ay': { huyền: 'ày', sắc: 'áy', hỏi: 'ảy', ngã: 'ãy', nặng: 'ạy' },
    'âu': { huyền: 'ầu', sắc: 'ấu', hỏi: 'ẩu', ngã: 'ẫu', nặng: 'ậu' },
    'ây': { huyền: 'ầy', sắc: 'ấy', hỏi: 'ẩy', ngã: 'ãy', nặng: 'ạy' },
    'ia': { huyền: 'ìa', sắc: 'ía', hỏi: 'ỉa', ngã: 'ĩa', nặng: 'ịa' },
    'iu': { huyền: 'ìu', sắc: 'íu', hỏi: 'ỉu', ngã: 'ịu' },
    'ua': { huyền: 'ùa', sắc: 'úa', hỏi: 'ủa', ngã: 'ũa', nặng: 'ụa' },
    'ưa': { huyền: 'ừa', sắc: 'ứa', hỏi: 'ửa', ngã: 'ữa', nặng: 'ựa' },
    'uy': { huyền: 'uỳ', sắc: 'uý', hỏi: 'uỷ', ngã: 'uỹ', nặng: 'uỵ' },
    'iêm': { huyền: 'iềm', sắc: 'iếm', hỏi: 'iểm', ngã: 'iễm', nặng: 'iệm' },
    'iên': { huyền: 'iền', sắc: 'iến', hỏi: 'iển', ngã: 'iễn', nặng: 'iện' },
    'iêng': { huyền: 'iềng', sắc: 'iếng', hỏi: 'iểng', ngã: 'iễng', nặng: 'iệng' },
    'iêp': { sắc: 'iếp', nặng: 'iệp' }, 
    'iêt': { sắc: 'iết', nặng: 'iệt' },
    'iêu': { huyền: 'iều', sắc: 'iếu', hỏi: 'iểu', ngã: 'iễu', nặng: 'iệu' },
    'iêc': { sắc: 'iếc', nặng: 'iệc' },
    'uôm': { huyền: 'uồm', sắc: 'uốm', hỏi: 'uổm', ngã: 'uỗm', nặng: 'uộm' },
    'uôn': { huyền: 'uồn', sắc: 'uốn', hỏi: 'uổn', ngã: 'uễn', nặng: 'uộn' },
    'uông': { huyền: 'uồng', sắc: 'uống', hỏi: 'uổng', ngã: 'uỗng', nặng: 'uộng' },
    'uôc': { sắc: 'uốc', nặng: 'uộc' },
    'uôt': { sắc: 'uốt', nặng: 'uột' },
    'ươm': { huyền: 'ườm', sắc: 'ướm', hỏi: 'ưởm', ngã: 'ưỡng', nặng: 'ượm' },
    'ươn': { huyền: 'ườn', sắc: 'ướn', hỏi: 'ưởn', ngã: 'ưỡn', nặng: 'ượn' },
    'ương': { huyền: 'ường', sắc: 'ướng', hỏi: 'ưởng', ngã: 'ưỡng', nặng: 'ượng' },
    'ươc': { sắc: 'ước', nặng: 'ược' },
    'ươp': { sắc: 'ướp', nặng: 'ượp' },
    'ươt': { sắc: 'ướt', nặng: 'ượt' },
    'ươu': { huyền: 'ườu', sắc: 'ướu', hỏi: 'ưởu', ngã: 'ưỡu', nặng: 'ượu' },
    'oan': { huyền: 'oàn', sắc: 'oán', hỏi: 'oản', ngã: 'oãn', nặng: 'oạn' },
    'oang': { huyền: 'oàng', sắc: 'oáng', hỏi: 'oảng', ngã: 'oãng', nặng: 'oạng' },
    'oac': { sắc: 'oác', nặng: 'oạc' },
    'oat': { sắc: 'oát', nặng: 'oạt' },
    'uyên': { huyền: 'uyền', sắc: 'uyến', hỏi: 'uyển', ngã: 'uyễn', nặng: 'uyện' },
    'uyêt': { sắc: 'uyết', nặng: 'uyệt' },
  };
  return toneMap[word]?.[tone] || word;
}

const DIPHTHONG_BASES = {
  V: ['ai', 'ao', 'au', 'ay', 'âu', 'ây', 'ia', 'iu', 'ua', 'ưa', 'uy'],
  VC: ['iêm', 'iên', 'iêng', 'iêp', 'iêt', 'iêu', 'iêc', 'uôm', 'uôn', 'uông', 'uôc', 'uôt', 'ươm', 'ươn', 'ương', 'ươc', 'ươp', 'ươt', 'ươu', 'oan', 'oang', 'oac', 'oat', 'uyên', 'uyêt']
};

export function GamePronunciationTrainer2() {
  const [gameStarted, setGameStarted] = useState(false);
  const [lang, setLang] = useState('en');
  const [activeTab, setActiveTab] = useState('V');
  const [prefix, setPrefix] = useState("");
  const [selectedWord, setSelectedWord] = useState({ char: 'ai', toneName: 'ngang', base: 'ai' });
  const [wordDetails, setWordDetails] = useState<{ combo: string | null, comboMeaning: string | null, meaning: string | null, isValid: boolean }>({ combo: null, comboMeaning: null, meaning: null, isValid: false });
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const t = TRANSLATIONS[lang as 'en' | 'ru'];
  const currentBases = (activeTab === 'VC' || activeTab === 'CVC') ? DIPHTHONG_BASES.VC : DIPHTHONG_BASES.V;
  const currentFullWord = (activeTab === 'CV' || activeTab === 'CVC') ? prefix + selectedWord.char : selectedWord.char;

  const currentLibrary = currentBases.map(base => ({
    label: base.toUpperCase(),
    base: base,
    vowels: generateValidTones(base, prefix)
  })).filter(family => family.vowels.length > 0);

  // --- AUDIO CHUẨN (GOOGLE TRANSLATE TTS) ---
  const audioQueueRef = useRef<string[]>([]);
  const isPlayingRef = useRef(false);

  const playNextInQueue = useCallback(() => {
    if (audioQueueRef.current.length === 0) { isPlayingRef.current = false; return; }
    isPlayingRef.current = true;
    const text = audioQueueRef.current.shift();
    if (!text) return;

    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=vi&client=tw-ob`;
    const audio = new Audio(url);
    audio.onended = () => playNextInQueue();
    audio.onerror = () => playNextInQueue();
    audio.play().catch(() => playNextInQueue());
  }, []);

  const playCorrectSound = (text: string) => {
    if (!text || text === "...") return;
    isPlayingRef.current = false;
    audioQueueRef.current = [];
    const chunks = text.match(/.{1,170}(\s|$)/g) || [text];
    audioQueueRef.current = chunks;
    if (!isPlayingRef.current) playNextInQueue();
  };

  // --- LOGIC AI (GỌI ĐÚNG THEO CẤU TRÚC Chatbot) ---
  useEffect(() => {
    if (!gameStarted) return;
    const fetchWordInfo = async () => {
      setIsLoadingDetails(true);
      try {
        const payload = {
          model: MODEL_NAME,
          config: {
            systemInstruction: `You are a Vietnamese Linguistics Expert. 
            Analyze if the word "${currentFullWord}" is valid.
            Return ONLY a raw JSON: {"isValid": boolean, "meaning": "Brief meaning in ${lang === 'en' ? 'English' : 'Russian'}", "combo": "Short sentence", "comboMeaning": "Translation"}.
            No markdown, no explanation.`
          },
          contents: [{ role: 'user', parts: [{ text: `Analyze: ${currentFullWord}` }] }]
        };

        const response = await generateContentWithRetry(payload);
        // Xử lý text thô để lấy JSON
        const rawJson = response.text.replace(/```json|```/g, '').trim();
        const result = JSON.parse(rawJson);
        
        setWordDetails({
          meaning: result.isValid ? result.meaning : null,
          combo: result.isValid ? result.combo : null,
          comboMeaning: result.isValid ? result.comboMeaning : null,
          isValid: result.isValid
        });
      } catch (err) {
        setWordDetails({ meaning: null, combo: null, comboMeaning: null, isValid: false });
      } finally { setIsLoadingDetails(false); }
    };
    fetchWordInfo();
  }, [currentFullWord, gameStarted, lang]);

  useEffect(() => {
    if (currentLibrary.length > 0) {
      const firstFamily = currentLibrary[0];
      if (firstFamily.vowels.length > 0) {
        setSelectedWord({ ...firstFamily.vowels[0], base: firstFamily.base });
      }
    }
  }, [activeTab, prefix]);

  const menuItems = [
    { id: 'V', label: t.tabV, mobLabel: t.mobV },
    { id: 'CV', label: t.tabCV, mobLabel: t.mobCV },
    { id: 'VC', label: t.tabVC, mobLabel: t.mobVC },
    { id: 'CVC', label: t.tabCVC, mobLabel: t.mobCVC }
  ];

  if (!gameStarted) {
    return (
      <div className="h-full w-full bg-[#050508] text-cyan-50 flex items-center justify-center p-4 lg:p-6 relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-1/2 h-1/2 bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="max-w-xl w-full bg-white/[0.03] border border-white/10 rounded-[2rem] lg:rounded-[3rem] p-6 lg:p-12 backdrop-blur-3xl shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-700">
          <div className="w-16 h-16 lg:w-20 lg:h-20 bg-cyan-500/20 rounded-3xl flex items-center justify-center mb-6 lg:mb-8 border border-cyan-400/30">
            <Layers className="text-cyan-400" size={32} />
          </div>
          <h1 className="text-xl lg:text-3xl font-black tracking-tighter uppercase italic leading-tight mb-4 px-2">{t.startTitle}</h1>
          <div className="w-full bg-white/5 rounded-2xl p-4 lg:p-6 mb-8 text-left border border-white/10">
            <div className="w-full text-[10px] lg:text-xs font-mono text-cyan-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <HelpCircle size={14} /> {t.howToTitle}
            </div>
            <div className="space-y-3">
              <div className="flex gap-3 items-start">
                <div className="w-5 h-5 rounded-full bg-cyan-500 text-black flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</div>
                <p className="text-[11px] lg:text-xs text-white/70 leading-relaxed">{t.step1}</p>
              </div>
              <div className="flex gap-3 items-start">
                <div className="w-5 h-5 rounded-full bg-cyan-500 text-black flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</div>
                <p className="text-[11px] lg:text-xs text-white/70 leading-relaxed">{t.step2}</p>
              </div>
              <div className="flex gap-3 items-start">
                <div className="w-5 h-5 rounded-full bg-cyan-500 text-black flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">3</div>
                <p className="text-[11px] lg:text-xs text-white/70 leading-relaxed">{t.step3}</p>
              </div>
            </div>
          </div>
          <div className="w-full space-y-4">
            <div className="flex gap-2 justify-center">
              {(['en', 'ru'] as const).map((l) => (
                <button key={l} onClick={() => setLang(l)} className={`px-6 py-2 rounded-xl font-bold border transition-all text-xs flex items-center gap-2 ${lang === l ? 'bg-cyan-500 border-cyan-400 text-black' : 'bg-white/5 border-white/10 text-white/40'}`}>{l.toUpperCase()}</button>
              ))}
            </div>
            <button onClick={() => setGameStarted(true)} className="w-full py-4 lg:py-5 bg-white text-black rounded-2xl lg:rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs lg:text-sm hover:bg-cyan-400 transition-all shadow-lg active:scale-95">{t.startBtn}</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-[#050508] text-cyan-50 flex flex-col overflow-hidden">
      <header className="h-16 flex items-center justify-between px-4 lg:px-8 border-b border-white/10 bg-[#0a0a0f]/80 backdrop-blur-md z-40 shrink-0">
        <div className="flex items-center gap-2">
          <Layers className="text-cyan-400 shrink-0" size={18} />
          <h1 className="text-[10px] sm:text-xs lg:text-lg font-black tracking-tighter uppercase italic whitespace-nowrap">PRONUNCIATION <span className="text-cyan-400">TRAINER 2</span></h1>
        </div>
        <nav className="hidden lg:flex bg-white/5 rounded-xl p-1 border border-white/10">
          {menuItems.map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={`px-4 py-1 rounded-lg text-[10px] font-mono uppercase tracking-widest transition-all ${activeTab === item.id ? 'bg-cyan-500 text-black font-bold' : 'text-white/40 hover:text-white'}`}>{item.label}</button>
          ))}
        </nav>
        <div className="text-[10px] font-mono text-cyan-500/60 uppercase lg:hidden">{menuItems.find(i => i.id === activeTab)?.mobLabel || activeTab}</div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden lg:p-4 lg:gap-4 z-10">
        <section className="h-[75vh] lg:h-auto lg:flex-1 bg-white/[0.02] border-b lg:border border-white/10 lg:rounded-[2rem] flex flex-col overflow-hidden shadow-2xl backdrop-blur-sm z-10">
          <div className="p-3 border-b border-white/10 bg-white/[0.03]">
            <div className="flex lg:hidden overflow-x-auto gap-2 mb-3 pb-1 no-scrollbar">
              {menuItems.map((item) => (
                <button key={`m-nav-${item.id}`} onClick={() => setActiveTab(item.id)} className={`px-4 py-1.5 rounded-full text-[9px] font-mono uppercase whitespace-nowrap border ${activeTab === item.id ? 'bg-cyan-500 border-cyan-400 text-black' : 'bg-white/5 border-white/10 text-white/40'}`}>{item.mobLabel}</button>
              ))}
            </div>
            {(activeTab === 'CV' || activeTab === 'CVC') && (
              <div className="space-y-1">
                <label className="text-[8px] font-mono uppercase text-cyan-400/60 italic">{t.prefixLabel}</label>
                <div className="flex flex-wrap gap-1 max-h-20 lg:max-h-24 overflow-y-auto custom-scrollbar">
                  {INITIAL_CONSONANTS.map((c, idx) => (
                    <button key={`p-${idx}`} onClick={() => setPrefix(c)} className={`px-2.5 py-1 rounded text-[9px] font-mono border min-w-[32px] ${prefix === c ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' : 'bg-white/5 border-white/5 text-white/30'}`}>{c || '-'}</button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-3 lg:p-6 space-y-3 lg:space-y-4 custom-scrollbar">
            {currentLibrary.map((family, fIdx) => (
              <div key={`f-${fIdx}`} className="bg-white/[0.01] p-2 lg:p-3 rounded-2xl border border-white/5 flex items-center gap-3">
                <div className="w-10 lg:w-16 shrink-0 text-[8px] lg:text-[10px] font-mono text-cyan-400 font-bold border-r border-white/10 pr-2 uppercase">{family.label}</div>
                <div className="flex-1 grid grid-cols-6 gap-1 lg:gap-2">
                  {family.vowels.map((item, vIdx) => {
                    const isSelected = selectedWord.char === item.char && selectedWord.base === family.base;
                    const display = (activeTab === 'CV' || activeTab === 'CVC') ? prefix + item.char : item.char;
                    return (
                      <button key={`v-${vIdx}`} onClick={() => setSelectedWord({ ...item, base: family.base })} className={`h-8 lg:h-10 flex items-center justify-center rounded-md lg:rounded-xl transition-all border text-[9px] lg:text-xs font-mono truncate px-0.5 ${isSelected ? 'bg-cyan-500 border-cyan-400 text-black font-bold shadow-lg scale-105' : 'bg-white/5 border-white/10 text-white/60'}`}>{display}</button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="h-[25vh] lg:h-auto lg:w-[450px] flex shrink-0 bg-[#0a0a0f] lg:bg-transparent p-2 lg:p-0 z-20">
          <div className="w-full bg-white/[0.03] border border-white/10 lg:rounded-[2.5rem] rounded-2xl p-3 lg:p-12 flex flex-col relative overflow-hidden backdrop-blur-xl shadow-xl z-20">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-[60px] rounded-full -mr-16 -mt-16 pointer-events-none z-0" />
            <div className="flex-1 flex flex-col justify-center z-10">
              <div className="flex items-center lg:items-start justify-between w-full mb-1 lg:mb-12 relative z-30">
                <div className="flex flex-col flex-1 overflow-hidden mr-4">
                  <div className="text-xl lg:text-[3.5rem] font-black text-white uppercase italic drop-shadow-sm truncate leading-tight lg:mb-2">{currentFullWord}</div>
                  {!isLoadingDetails && wordDetails.meaning && (
                    <div className="text-cyan-400 font-mono text-[9px] lg:text-sm uppercase tracking-[0.1em] lg:tracking-[0.2em] animate-in fade-in slide-in-from-left-2 duration-300 line-clamp-1">{wordDetails.meaning}</div>
                  )}
                </div>
                <button onClick={() => playCorrectSound(currentFullWord)} className="w-10 h-10 lg:w-16 lg:h-16 bg-cyan-500 hover:bg-cyan-400 text-black rounded-full flex items-center justify-center shadow-lg active:scale-90 shrink-0 transition-all relative z-50 touch-manipulation">
                  <Volume2 className="w-5 h-5 lg:w-6 lg:h-6 pointer-events-none" />
                </button>
              </div>

              <div className="mt-2 pt-2 border-t border-white/5 flex flex-col lg:gap-4 animate-in fade-in duration-700 relative z-20">
                {!isLoadingDetails && wordDetails.combo ? (
                  <>
                    <div className="flex items-center justify-between mb-1 lg:mb-0">
                      <div className="text-[7px] lg:text-[11px] font-mono text-cyan-400/40 uppercase tracking-[0.3em]">{t.contextTitle}</div>
                      <button onClick={(e) => { e.stopPropagation(); playCorrectSound(wordDetails.combo as string); }} className="p-1 lg:p-2 bg-white/5 hover:bg-white/10 rounded-full text-cyan-400 transition-colors relative z-50 touch-manipulation">
                        <Volume1 size={14} className="lg:w-[18px] lg:h-[18px] pointer-events-none" />
                      </button>
                    </div>
                    <div className="text-[10px] lg:text-xl font-medium text-white/90 leading-tight lg:leading-relaxed italic border-l-2 border-cyan-500/30 pl-3 lg:pl-6 line-clamp-2">"{wordDetails.combo}"</div>
                    {wordDetails.comboMeaning && <div className="text-[8px] lg:text-sm font-mono text-cyan-400/60 leading-tight lg:leading-relaxed pl-3 lg:pl-6 mt-0.5 lg:mt-0 line-clamp-1">{wordDetails.comboMeaning}</div>}
                  </>
                ) : isLoadingDetails ? (
                  <div className="space-y-2 py-1"><div className="h-2 w-16 bg-white/5 rounded animate-pulse" /><div className="h-6 w-full bg-white/5 rounded animate-pulse" /></div>
                ) : <div className="py-2 text-[8px] font-mono text-white/10 uppercase tracking-widest text-center">No context available</div>}
              </div>
            </div>
            <div className="hidden lg:flex mt-8 text-[8px] lg:text-[10px] font-mono text-white/20 uppercase tracking-[0.2em] items-center gap-2"><span className="w-2 h-2 rounded-full bg-cyan-500/40" /> Engine: {MODEL_NAME}</div>
          </div>
        </section>
      </main>

      <footer className="h-12 flex items-center justify-between px-4 lg:px-8 border-t border-white/5 bg-[#050508] z-40 shrink-0">
        <button onClick={() => setGameStarted(false)} className="text-[8px] lg:text-[10px] font-mono text-white/30 hover:text-cyan-400 uppercase tracking-widest flex items-center gap-2 transition-colors"><X size={14} /> {t.backBtn}</button>
        <div className="text-[8px] font-mono text-white/10 uppercase tracking-[0.5em]">{t.footer}</div>
      </footer>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(34, 211, 238, 0.1); border-radius: 10px; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        body { background-color: #050508; overflow: hidden; -webkit-tap-highlight-color: transparent; }
        button { touch-action: manipulation; }
      `}</style>
    </div>
  );
}

export default GamePronunciationTrainer2;

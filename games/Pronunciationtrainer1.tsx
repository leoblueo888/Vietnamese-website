import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Play, Mic, Square, RotateCcw, Volume2, 
  Info, Headphones, Layers, BookOpen, Volume1,
  Sparkles, Languages, MessageSquare, Target, Activity, Quote, XCircle, Globe, ChevronRight, User
} from 'lucide-react';

// --- IMPORT HÀM TỪ CONFIG ĐỂ XOAY VÒNG KEY ---
import { generateContentWithRetry } from '../config/apiKeys';

// --- Constants ---
const VIETNAMESE_VOWELS = [
  { char: 'a', name: 'a' }, { char: 'à', name: 'a huyền' }, { char: 'á', name: 'a sắc' }, { char: 'ả', name: 'a hỏi' }, { char: 'ã', name: 'a ngã' }, { char: 'ạ', name: 'a nặng' },
  { char: 'ă', name: 'ă' }, { char: 'ằ', name: 'ă huyền' }, { char: 'ắ', name: 'ă sắc' }, { char: 'ẳ', name: 'ă hỏi' }, { char: 'ẵ', name: 'ă ngã' }, { char: 'ặ', name: 'ă nặng' },
  { char: 'â', name: 'â' }, { char: 'ầ', name: 'â huyền' }, { char: 'ấ', name: 'â sắc' }, { char: 'ẩ', name: 'â hỏi' }, { char: 'ẫ', name: 'â ngã' }, { char: 'ậ', name: 'â nặng' },
  { char: 'e', name: 'e' }, { char: 'è', name: 'e huyền' }, { char: 'é', name: 'e sắc' }, { char: 'ẻ', name: 'e hỏi' }, { char: 'ẽ', name: 'e ngã' }, { char: 'ẹ', name: 'e nặng' },
  { char: 'ê', name: 'ê' }, { char: 'ề', name: 'ê huyền' }, { char: 'ế', name: 'ê sắc' }, { char: 'ể', name: 'ê hỏi' }, { char: 'ễ', name: 'ê ngã' }, { char: 'ệ', name: 'ê nặng' },
  { char: 'i', name: 'i' }, { char: 'ì', name: 'i huyền' }, { char: 'í', name: 'i sắc' }, { char: 'ỉ', name: 'i hỏi' }, { char: 'ĩ', name: 'i ngã' }, { char: 'ị', name: 'i nặng' },
  { char: 'o', name: 'o' }, { char: 'ò', name: 'o huyền' }, { char: 'ó', name: 'o sắc' }, { char: 'ỏ', name: 'o hỏi' }, { char: 'õ', name: 'o ngã' }, { char: 'ọ', name: 'o nặng' },
  { char: 'ô', name: 'ô' }, { char: 'ồ', name: 'ô huyền' }, { char: 'ố', name: 'ô sắc' }, { char: 'ổ', name: 'ô hỏi' }, { char: 'ỗ', name: 'ô ngã' }, { char: 'ộ', name: 'ô nặng' },
  { char: 'ơ', name: 'ơ' }, { char: 'ờ', name: 'ơ huyền' }, { char: 'ớ', name: 'ơ sắc' }, { char: 'ở', name: 'ơ hỏi' }, { char: 'ỡ', name: 'ơ ngã' }, { char: 'ợ', name: 'ơ nặng' },
  { char: 'u', name: 'u' }, { char: 'ù', name: 'u huyền' }, { char: 'ú', name: 'u sắc' }, { char: 'ủ', name: 'u hỏi' }, { char: 'ũ', name: 'u ngã' }, { char: 'ụ', name: 'u nặng' },
  { char: 'ư', name: 'ư' }, { char: 'ừ', name: 'ư huyền' }, { char: 'ứ', name: 'ư sắc' }, { char: 'ử', name: 'ư hỏi' }, { char: 'ữ', name: 'ư ngã' }, { char: 'ự', name: 'ự nặng' },
  { char: 'y', name: 'y' }, { char: 'ỳ', name: 'y huyền' }, { char: 'ý', name: 'y sắc' }, { char: 'ỷ', name: 'y hỏi' }, { char: 'ỹ', name: 'y ngã' }, { char: 'ỵ', name: 'y nặng' }
];

const CONSONANTS = ['b', 'c', 'ch', 'd', 'đ', 'g', 'gh', 'gi', 'h', 'k', 'kh', 'l', 'm', 'n', 'ng', 'ngh', 'nh', 'p', 'ph', 'q', 'r', 's', 't', 'th', 'tr', 'v', 'x'];
const END_CONSONANTS = ['c', 'ch', 'm', 'n', 'ng', 'nh', 'p', 't'];

const VOWEL_GROUPS = VIETNAMESE_VOWELS.reduce((acc: Record<string, any[]>, curr) => {
  const base = curr.char.normalize('NFD')[0];
  if (!acc[base]) acc[base] = [];
  acc[base].push(curr);
  return acc;
}, {});

const TRANSLATIONS = {
  en: {
    startTitle: "PRONUNCIATION TRAINER 1",
    chooseLang: "Select Interface Language",
    startBtn: "Start Training",
    library: "Sound Library",
    variants: "Variants",
    prefix: "Initial",
    suffix: "Final",
    selectedWord: "Target",
    definition: "Meaning",
    context: "Context",
    phoneticOnly: "No meaning found",
    live: "Live",
    analysisReady: "Recording Ready",
    score: "Score",
    heard: "Your voice",
    invalid: "Invalid",
    invalidDesc: "Spelling rule violation.",
    howToPlay: "How to use",
    instructions: [
      "Select a word or sound",
      "Listen to the native reference",
      "Press Mic to record yourself",
      "Play back to compare"
    ]
  },
  ru: {
    startTitle: "PRONUNCIATION TRAINER 1",
    chooseLang: "Выберите язык интерфейса",
    startBtn: "Начать",
    library: "Библиотека",
    variants: "Варианты",
    prefix: "Начало",
    suffix: "Конец",
    selectedWord: "Слово",
    definition: "Значение",
    context: "Контекст",
    phoneticOnly: "Нет значения",
    live: "Эфир",
    analysisReady: "Запись готова",
    score: "Балл",
    heard: "Ваш голос",
    invalid: "Ошибка",
    invalidDesc: "Нарушение правил.",
    howToPlay: "Как использовать",
    instructions: [
      "Выберите слово или звук",
      "Слушайте эталонное аудио",
      "Нажмите Mic для записи голоса",
      "Слушайте себя и сравнивайте"
    ]
  }
};

const TAB_CONFIG = [
  { id: 'v', label: 'Vowel', shortLabel: 'V' },
  { id: 'cv', label: 'Consonant + Vowel', shortLabel: 'C + V' },
  { id: 'vc', label: 'Vowel + Consonant', shortLabel: 'V + C' },
  { id: 'cvc', label: 'C1 + Vowel + C2', shortLabel: 'C + V + C' }
];

const ANALYZE_MODEL = "gemini-2.5-flash";

const checkVietnameseValidity = (prefix: any, vowelItem: any, suffix: any, activeTab: any) => {
  const vowelChar = vowelItem.char; 
  const vowelName = vowelItem.name; 
  const normalized = vowelChar.normalize('NFD');
  const baseVowel = normalized.replace(/[\u0300-\u036f]/g, ''); 
  const isStopTone = vowelName.includes('sắc') || vowelName.includes('nặng');

  const shortVowels = ['ă', 'ằ', 'ắ', 'ẳ', 'ẵ', 'ặ', 'â', 'ầ', 'ấ', 'ẩ', 'ẫ', 'ậ'];
  if (['v', 'cv'].includes(activeTab) && shortVowels.includes(vowelChar)) {
    return false;
  }

  if (activeTab === 'vc' || activeTab === 'cvc') {
    if (baseVowel === 'y') return false;
    if (['c', 'ch', 'p', 't'].includes(suffix)) {
      if (!isStopTone) return false; 
    }
    if (['ch', 'nh'].includes(suffix)) {
      if (['u', 'o', 'ô', 'ơ', 'ư'].includes(baseVowel)) return false; 
    }
    if (['c', 'ng'].includes(suffix)) {
      if (['i', 'e', 'ê'].includes(baseVowel)) return false;
    }
  }

  if (activeTab === 'cv' || activeTab === 'cvc') {
    if (['k', 'gh', 'ngh'].includes(prefix)) {
      if (!['i', 'e', 'ê', 'y'].includes(baseVowel)) return false;
    }
    if (['c', 'g', 'ng'].includes(prefix)) {
      if (['i', 'e', 'ê', 'y'].includes(baseVowel)) return false;
    }
    if (prefix === 'q') {
      if (baseVowel !== 'u') return false; 
    }
  }
  return true;
};

export function Pronunciationtrainer1() {
  const [hasStarted, setHasStarted] = useState(false);
  const [lang, setLang] = useState('en'); 
  
  const [activeTab, setActiveTab] = useState('v');
  const [prefixC, setPrefixC] = useState('b');
  const [suffixC, setSuffixC] = useState('n');
  const [selectedVowel, setSelectedVowel] = useState(VIETNAMESE_VOWELS[0]);
  
  const [definition, setDefinition] = useState<any>(null);
  const [isDefining, setIsDefining] = useState(false);
  const [isValidWord, setIsValidWord] = useState(true);

  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isLoadingTTS, setIsLoadingTTS] = useState(false);
  const [isLoadingContextTTS, setIsLoadingContextTTS] = useState(false);
  const [visualizerData, setVisualizerData] = useState(new Array(15).fill(0));
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const visualizerTimerRef = useRef<number | null>(null);
  
  // --- AUDIO REFS ---
  const audioRef = useRef(new Audio());
  const audioQueueRef = useRef<string[]>([]);
  const isPlayingRef = useRef(false);

  const t = TRANSLATIONS[lang as 'en' | 'ru'];

  const getFullWord = (vowelChar: string) => {
    switch (activeTab) {
      case 'cv': return prefixC + vowelChar;
      case 'vc': return vowelChar + suffixC;
      case 'cvc': return prefixC + vowelChar + suffixC;
      default: return vowelChar;
    }
  };

  // --- CLEAN TEXT FUNCTION ---
  const cleanText = useCallback((text: string) => {
    return text
      .replace(/[*_`#"]/g, '')
      .replace(/\s+/g, ' ')
      .replace(/[✨🎵🔊🔔❌✅⭐]/g, '')
      .trim();
  }, []);

  // --- CHUNK LOGIC ---
  const createChunks = useCallback((str: string, max = 170) => {
    const chunks = [];
    let tempStr = str;
    while (tempStr.length > 0) {
      if (tempStr.length <= max) { chunks.push(tempStr); break; }
      let cutAt = tempStr.lastIndexOf('.', max);
      if (cutAt === -1) cutAt = tempStr.lastIndexOf(',', max);
      if (cutAt === -1) cutAt = tempStr.lastIndexOf(' ', max);
      if (cutAt === -1) cutAt = max;
      chunks.push(tempStr.slice(0, cutAt + 1).trim());
      tempStr = tempStr.slice(cutAt + 1).trim();
    }
    return chunks;
  }, []);

  // --- AUDIO ĐÃ SỬA DÙNG PROXY VÀ FALLBACK ---
  const playNextInQueue = useCallback(() => {
    if (audioQueueRef.current.length === 0) { 
      isPlayingRef.current = false; 
      return; 
    }
    
    isPlayingRef.current = true;
    const text = audioQueueRef.current.shift();
    if (!text) {
      playNextInQueue();
      return;
    }

    // Clean text trước khi đọc
    const cleanTextStr = cleanText(text);
    
    // Dùng proxy API thay vì Google trực tiếp
    const url = `/api/tts?text=${encodeURIComponent(cleanTextStr)}&lang=vi`;
    audioRef.current.src = url;
    audioRef.current.playbackRate = 1.0;
    
    audioRef.current.onended = () => {
      playNextInQueue();
    };
    
    audioRef.current.onerror = () => {
      // Fallback khi lỗi API
      const fallback = new SpeechSynthesisUtterance(cleanTextStr);
      fallback.lang = 'vi-VN';
      fallback.onend = () => playNextInQueue();
      window.speechSynthesis.speak(fallback);
    };
    
    audioRef.current.play().catch(() => {
      // Fallback khi play lỗi
      const fallback = new SpeechSynthesisUtterance(cleanTextStr);
      fallback.lang = 'vi-VN';
      fallback.onend = () => playNextInQueue();
      window.speechSynthesis.speak(fallback);
    });
  }, [cleanText]);

  const playCorrectSound = useCallback((text: string, isContext = false) => {
    if (!text) return;
    
    if (isContext) setIsLoadingContextTTS(true);
    else setIsLoadingTTS(true);
    
    // Dừng âm thanh đang phát
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    audioRef.current.pause();
    
    isPlayingRef.current = false;
    audioQueueRef.current = [];
    
    // Clean text và chia nhỏ nếu cần
    const cleanedText = cleanText(text);
    const chunks = createChunks(cleanedText);
    
    audioQueueRef.current = chunks;
    
    // Hàm dừng loading
    const stopLoading = () => {
      if (isContext) setIsLoadingContextTTS(false);
      else setIsLoadingTTS(false);
    };
    
    // Gán sự kiện cho audio hiện tại
    const currentAudio = audioRef.current;
    
    const onFinish = () => {
      stopLoading();
      playNextInQueue();
    };
    
    currentAudio.onended = onFinish;
    currentAudio.onerror = onFinish;
    
    if (!isPlayingRef.current) playNextInQueue();
    
    // Fallback nếu playNextInQueue không chạy (do queue rỗng)
    setTimeout(() => {
      if (isLoadingTTS || isLoadingContextTTS) {
        stopLoading();
      }
    }, 3000);
  }, [cleanText, createChunks, playNextInQueue, isLoadingTTS, isLoadingContextTTS]);

  const fetchDefinition = async (word: string) => {
    const isValid = checkVietnameseValidity(prefixC, selectedVowel, suffixC, activeTab);
    setIsValidWord(isValid);

    if (!isValid) {
      setDefinition(null);
      setIsDefining(false);
      return; 
    }

    setIsDefining(true);
    setDefinition(null);
    try {
      const targetLang = lang === 'en' ? "English" : "Russian";
      const promptText = `Check Vietnamese word: "${word}". 
      Respond in JSON format: {"meaning": "meaning in ${targetLang} or INVALID", "example": "short example sentence in Vietnamese or INVALID", "exampleTranslation": "translation in ${targetLang} or INVALID"}.
      If the word has no common meaning, return INVALID for all fields.`;

      // Sửa cấu trúc đúng cho generateContentWithRetry
      const response = await generateContentWithRetry({
        model: ANALYZE_MODEL,
        contents: [{ role: 'user', parts: [{ text: promptText }] }],
        config: {
          systemInstruction: "You are a helpful assistant that responds in JSON format."
        }
      });

      // Xử lý response text để lấy JSON
      let result;
      try {
        // Nếu response.text là string JSON
        result = JSON.parse(response.text);
      } catch (e) {
        // Nếu response.text có chứa JSON trong markdown
        const jsonMatch = response.text.match(/```json\n([\s\S]*?)\n```/) || 
                         response.text.match(/{[\s\S]*?}/);
        if (jsonMatch) {
          result = JSON.parse(jsonMatch[1] || jsonMatch[0]);
        } else {
          throw new Error("Không thể parse JSON");
        }
      }
      
      const processed = {
        meaning: result.meaning === "INVALID" ? null : result.meaning,
        example: result.example === "INVALID" ? null : result.example,
        exampleTranslation: result.exampleTranslation === "INVALID" ? null : result.exampleTranslation
      };
      setDefinition(processed);
    } catch (e) {
      console.error("Definition error:", e);
      setDefinition(null);
    } finally {
      setIsDefining(false);
    }
  };

  useEffect(() => {
    if (hasStarted) {
      fetchDefinition(getFullWord(selectedVowel.char));
    }
  }, [selectedVowel, prefixC, suffixC, activeTab, hasStarted, lang]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      mediaRecorderRef.current.onstop = handleRecordingStop;
      
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 64;
      source.connect(analyserRef.current);
      
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      const updateVisualizer = () => {
        if (!isRecording && mediaRecorderRef.current?.state !== 'recording') return;
        if(analyserRef.current) {
            analyserRef.current.getByteFrequencyData(dataArray);
            setVisualizerData(Array.from(dataArray.slice(0, 15)).map(v => v / 255));
        }
        visualizerTimerRef.current = requestAnimationFrame(updateVisualizer);
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setAudioUrl(null);
      updateVisualizer();
    } catch (err) { console.error(err); }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
    if (visualizerTimerRef.current) cancelAnimationFrame(visualizerTimerRef.current);
    setIsRecording(false);
  };

  const handleRecordingStop = () => {
    const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
    setAudioUrl(URL.createObjectURL(blob));
  };

  const playRecordedAudio = () => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play();
    }
  };

  if (!hasStarted) {
    return (
      <div className="h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-[2.5rem] p-8 shadow-2xl flex flex-col items-center gap-6 animate-in">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl animate-bounce">
            <Headphones size={32} />
          </div>
          
          <div className="text-center">
            <h1 className="text-2xl font-black text-slate-900 mb-1 leading-tight uppercase">PRONUNCIATION TRAINER 1</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{t.chooseLang}</p>
          </div>
          
          <div className="flex gap-4 w-full">
            <button onClick={() => setLang('en')} className={`flex-1 p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${lang === 'en' ? 'border-indigo-600 bg-indigo-50' : 'border-slate-100 hover:border-indigo-200'}`}>
              <span className="text-2xl">🇺🇸</span>
              <span className="text-[10px] font-black uppercase tracking-widest">English</span>
            </button>
            <button onClick={() => setLang('ru')} className={`flex-1 p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${lang === 'ru' ? 'border-indigo-600 bg-indigo-50' : 'border-slate-100 hover:border-indigo-200'}`}>
              <span className="text-2xl">🇷🇺</span>
              <span className="text-[10px] font-black uppercase tracking-widest">Russian</span>
            </button>
          </div>

          <div className="w-full bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <div className="flex items-center gap-2 mb-3">
              <Info size={14} className="text-indigo-600" />
              <span className="text-[11px] font-black text-slate-900 uppercase tracking-widest">{t.howToPlay}</span>
            </div>
            <ul className="space-y-2">
              {t.instructions.map((step, idx) => (
                <li key={idx} className="flex items-center gap-2 text-[10px] text-slate-600 font-medium">
                  <ChevronRight size={10} className="text-indigo-400" />
                  {step}
                </li>
              ))}
            </ul>
          </div>

          <button onClick={() => setHasStarted(true)} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-200">{t.startBtn}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#F8FAFC] text-slate-900 font-sans overflow-hidden flex flex-col">
      <div className="relative z-10 flex flex-col h-full mx-auto w-full px-4 py-2 max-w-7xl">
        
        {/* Header */}
        <header className="flex flex-row items-center justify-between mb-2 gap-4 flex-shrink-0 h-[50px]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg">
              <Headphones size={16} />
            </div>
            <h1 className="text-xs font-black tracking-tight leading-none uppercase">PRONUNCIATION <br/><span className="text-indigo-600">TRAINER 1</span></h1>
          </div>
          <nav className="flex bg-white/80 backdrop-blur p-1 rounded-lg shadow-sm border border-slate-100">
            {TAB_CONFIG.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-2 md:px-3 py-1 rounded-md text-[10px] md:text-[9px] font-black transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>
                <span className="hidden md:inline">{tab.label}</span>
                <span className="inline md:hidden">{tab.shortLabel}</span>
              </button>
            ))}
          </nav>
        </header>

        <main className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0 overflow-hidden">
          
          {/* Library Section */}
          <section className="h-[60vh] lg:h-full lg:w-7/12 flex flex-col min-h-0 bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
            
            <div className="flex-shrink-0">
                {activeTab !== 'v' && (
                <div className="p-3 bg-indigo-50/50 border-b border-indigo-100 space-y-3">
                  {['cv', 'cvc'].includes(activeTab) && (
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">{t.prefix}</span>
                      <div className="flex flex-wrap gap-1">
                        {CONSONANTS.map(c => (
                          <button key={c} onClick={() => setPrefixC(c)} className={`px-2 py-1.5 min-w-[32px] rounded-md text-[10px] font-black transition-all border ${prefixC === c ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' : 'bg-white border-indigo-100 text-slate-600'}`}>{c}</button>
                        ))}
                      </div>
                    </div>
                  )}
                  {['vc', 'cvc'].includes(activeTab) && (
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">{t.suffix}</span>
                      <div className="flex flex-wrap gap-1">
                        {END_CONSONANTS.map(c => (
                          <button key={c} onClick={() => setSuffixC(c)} className={`px-3 py-1.5 min-w-[40px] rounded-md text-[10px] font-black transition-all border ${suffixC === c ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' : 'bg-white border-indigo-100 text-slate-600'}`}>{c}</button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                )}
                <div className="p-3 border-b border-slate-50 flex items-center justify-between">
                  <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.library}</h2>
                  <button onClick={() => setHasStarted(false)} className="text-[10px] font-black text-indigo-500 uppercase flex items-center gap-1"><Globe size={10} /> {lang.toUpperCase()}</button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 custom-scrollbar space-y-6">
              {Object.entries(VOWEL_GROUPS).map(([base, vowels]) => {
                const validVowels = vowels.filter(v => checkVietnameseValidity(prefixC, v, suffixC, activeTab));
                if (validVowels.length === 0) return null;
                return (
                  <div key={base}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{base} {t.variants}</span>
                      <div className="h-px flex-1 bg-slate-50" />
                    </div>
                    <div className="grid grid-cols-6 gap-1.5">
                      {validVowels.map((v) => (
                        <button key={v.char} onClick={() => { setSelectedVowel(v); setAudioUrl(null); }} className={`py-3 flex flex-col items-center justify-center rounded-xl transition-all border-2 ${selectedVowel.char === v.char ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-white border-slate-50 text-slate-600'}`}>
                          <span className="text-sm font-black">{getFullWord(v.char)}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Interaction Section */}
          <section className="h-[40vh] lg:h-full lg:w-5/12 flex flex-row lg:flex-col gap-3 min-h-0 overflow-hidden">
            
            {/* Word Focus */}
            <div className={`w-1/2 lg:w-full lg:flex-1 rounded-2xl p-3 lg:p-6 shadow-sm flex flex-col justify-between overflow-hidden transition-colors ${isValidWord ? 'bg-slate-900 text-white' : 'bg-rose-900 text-white'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-baseline gap-2">
                  <h2 className="text-3xl lg:text-5xl font-black">{getFullWord(selectedVowel.char)}</h2>
                  <span className="text-[10px] lg:text-xs text-white/50 font-bold uppercase truncate max-w-[50px]">{isValidWord ? selectedVowel.name.split(' ').pop() : t.invalid}</span>
                </div>
                {isValidWord && (
                  <button onClick={() => playCorrectSound(getFullWord(selectedVowel.char))} className="p-2 lg:p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-all">
                    {isLoadingTTS ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Volume2 size={16} />}
                  </button>
                )}
              </div>

              <div className="flex-1 mt-2 space-y-2 overflow-y-auto custom-scrollbar-thin">
                {!isValidWord ? (
                  <p className="text-[10px] text-rose-300 italic">{t.invalidDesc}</p>
                ) : (
                  <>
                    {definition?.meaning && <p className="text-[11px] lg:text-sm font-medium text-white/90 leading-tight">"{definition.meaning}"</p>}
                    {definition?.example && (
                      <div className="pt-2 border-t border-white/10 space-y-2">
                         <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                               <Quote size={8} className="text-indigo-400" />
                               <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">{t.context}</p>
                            </div>
                            <button 
                              onClick={() => playCorrectSound(definition.example, true)} 
                              className="p-1.5 bg-white/10 rounded-md hover:bg-white/20 transition-all"
                            >
                              {isLoadingContextTTS ? <div className="w-2.5 h-2.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Volume1 size={12} />}
                            </button>
                         </div>
                         <div className="space-y-1">
                            <p className="text-[10px] lg:text-xs italic text-indigo-200">"{definition.example}"</p>
                            {definition?.exampleTranslation && (
                               <p className="text-[9px] lg:text-[11px] text-white/40 font-medium">— {definition.exampleTranslation}</p>
                            )}
                         </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Interaction Box (No AI feedback) */}
            <div className={`w-1/2 lg:w-full lg:flex-1 bg-white rounded-2xl p-3 lg:p-6 shadow-sm border border-slate-100 flex flex-col items-center justify-center overflow-hidden ${!isValidWord ? 'opacity-50 pointer-events-none' : ''}`}>
               
               <div className="flex flex-col items-center gap-4 w-full">
                  <div className={`w-16 h-16 lg:w-24 lg:h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isRecording ? 'bg-rose-50 ring-8 ring-rose-50' : 'bg-slate-50'
                  }`}>
                    {isRecording ? (
                      <div className="relative">
                        <div className="absolute inset-0 animate-ping bg-rose-400 rounded-full opacity-20"></div>
                        <Mic className="text-rose-500 w-8 h-8 lg:w-12 lg:h-12 relative z-10" />
                      </div>
                    ) : (
                      <User className="text-slate-400 w-8 h-8 lg:w-12 lg:h-12" />
                    )}
                  </div>

                  <div className="text-center">
                    <h3 className="text-xs lg:text-sm font-black text-slate-800 uppercase tracking-tight">
                      {isRecording ? "Listening..." : "Your Practice"}
                    </h3>
                    <p className="text-[9px] text-slate-400 mt-1 uppercase tracking-wider font-bold">
                      {isRecording ? "Speak clearly" : "Record and compare"}
                    </p>
                  </div>

                  <div className="flex items-center justify-center gap-4 w-full mt-2">
                    <button 
                      onClick={isValidWord ? (isRecording ? stopRecording : startRecording) : undefined} 
                      className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg ${isRecording ? 'bg-slate-900 text-white animate-pulse' : 'bg-rose-500 text-white hover:scale-105 active:scale-95'}`}
                    >
                      {isRecording ? <Square size={20} /> : <Mic size={24} />}
                    </button>

                    {audioUrl && !isRecording && (
                      <button 
                        onClick={playRecordedAudio}
                        className="w-14 h-14 rounded-full flex items-center justify-center bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 transition-all hover:scale-105 active:scale-95"
                      >
                        <Volume2 size={24} />
                      </button>
                    )}
                  </div>
               </div>
               
               {/* Visualizer bars at the bottom of the box */}
               <div className="mt-6 flex items-end gap-1 h-4">
                  {isRecording ? visualizerData.slice(0, 10).map((v, i) => (
                    <div key={i} className="w-1 bg-rose-400 rounded-full" style={{ height: `${Math.max(20, v * 100)}%` }} />
                  )) : null}
               </div>
            </div>

          </section>
        </main>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
        .custom-scrollbar-thin::-webkit-scrollbar { width: 2px; }
        .custom-scrollbar-thin::-webkit-scrollbar-thumb { background: #CBD5E1; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .animate-in { animation: in 0.4s cubic-bezier(0.17, 0.67, 0.83, 0.67); }
        @keyframes in { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
}

export default Pronunciationtrainer1;

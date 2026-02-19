import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Play, Mic, Square, RotateCcw, Volume2, 
  Info, Headphones, Layers, BookOpen, Volume1,
  Sparkles, Languages, MessageSquare, Target, Activity, Quote, XCircle, Globe, ChevronRight, User,
  MicOff, Send, Download, PlayCircle, Gauge, Maximize, Minimize, AlertCircle
} from 'lucide-react';

// --- THAY ĐỔI QUAN TRỌNG: Import hàm từ config ---
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
const END_CONSONANTS = ['', 'c', 'ch', 'm', 'n', 'ng', 'nh', 'p', 't'];

const TRANSLATIONS: any = {
  en: {
    startTitle: "PRONUNCIATION TRAINER 1",
    chooseLang: "Select Interface Language",
    startBtn: "Start Training",
    library: "Sound Library",
    selectedWord: "Target",
    definition: "Meaning",
    score: "Score",
    heard: "Your voice",
    ui_placeholder: "Type or speak...",
    ui_start: "START",
    ui_listening: "Listening...",
    ui_tapToTalk: "Tap mic to talk",
  },
  ru: {
    startTitle: "PRONUNCIATION TRAINER 1",
    chooseLang: "Выберите язык",
    startBtn: "Начать",
    library: "Библиотека",
    selectedWord: "Слово",
    definition: "Значение",
    score: "Балл",
    heard: "Ваш голос",
    ui_placeholder: "Пишите...",
    ui_start: "НАЧАТЬ",
    ui_listening: "Слушаю...",
    ui_tapToTalk: "Нажмите, để nói",
  }
};

// --- Helper: Kiểm tra quy tắc chính tả ---
const checkSpelling = (prefix: string, vowelObj: any, suffix: string) => {
  const char = vowelObj.char;
  const baseVowel = char.normalize('NFD')[0];
  const isStopTone = ['á', 'ạ', 'ắ', 'ặ', 'ấ', 'ậ', 'é', 'ẹ', 'ế', 'ệ', 'í', 'ị', 'ó', 'ọ', 'ố', 'ộ', 'ớ', 'ợ', 'ú', 'ụ', 'ứ', 'ự'].includes(char);

  if (['k', 'gh', 'ngh'].includes(prefix) && !['i', 'e', 'ê', 'y'].includes(baseVowel)) return false;
  if (['c', 'g', 'ng'].includes(prefix) && ['i', 'e', 'ê', 'y'].includes(baseVowel)) return false;
  if (prefix === 'q' && baseVowel !== 'u') return false;
  if (['c', 'ch', 'p', 't'].includes(suffix) && !isStopTone && suffix !== '') return false;
  
  return true;
};

// --- Chỗ sửa 1: punctuateText ---
const punctuateText = async (rawText: string) => {
  if (!rawText.trim()) return rawText;
  try {
    const response = await generateContentWithRetry({
      model: 'gemini-3-flash-preview',
      contents: [{ 
        role: 'user', 
        parts: [{ text: `Hãy thêm dấu chấm, phẩy và viết hoa đúng cho đoạn văn bản tiếng Việt này: "${rawText}" (Chỉ trả về kết quả)` }] 
      }]
    });
    return response.text?.trim() || rawText;
  } catch (error) {
    return rawText;
  }
};

export const Pronunciationtrainer1: React.FC = () => {
  const [hasStarted, setHasStarted] = useState(false);
  const [lang, setLang] = useState<'en' | 'ru'>('en');
  const [activeTab, setActiveTab] = useState('v');
  const [prefixC, setPrefixC] = useState('b');
  const [suffixC, setSuffixC] = useState('');
  const [selectedVowel, setSelectedVowel] = useState(VIETNAMESE_VOWELS[0]);
  const [isRecording, setIsRecording] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [feedback, setFeedback] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const audioRef = useRef(new Audio());
  const recognitionRef = useRef<any>(null);

  const t = TRANSLATIONS[lang];
  const currentWord = `${activeTab.includes('c_') ? prefixC : ''}${selectedVowel.char}${activeTab.includes('_c') ? suffixC : ''}`;
  const isValid = checkSpelling(prefixC, selectedVowel, suffixC);

  // Setup Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'vi-VN';
      recognition.onresult = async (event: any) => {
        const transcript = event.results[0][0].transcript;
        const cleanText = await punctuateText(transcript);
        setUserInput(cleanText);
        analyzePronunciation(cleanText, currentWord);
      };
      recognition.onend = () => setIsRecording(false);
      recognitionRef.current = recognition;
    }
  }, [currentWord]);

  // --- Chỗ sửa 2: Phân tích phát âm ---
  const analyzePronunciation = async (heard: string, target: string) => {
    setIsAnalyzing(true);
    try {
      const response = await generateContentWithRetry({
        model: 'gemini-3-flash-preview',
        contents: [{
          role: 'user',
          parts: [{ text: `Phân tích phát âm tiếng Việt. 
            Mục tiêu: "${target}" 
            Người dùng nói: "${heard}"
            Hãy so sánh và cho điểm (0-100). Giải thích ngắn gọn bằng tiếng ${lang === 'en' ? 'English' : 'Russian'}.
            Trả về JSON: {"score": number, "explanation": "string"}` }]
        }]
      });
      const data = JSON.parse(response.text.replace(/```json|```/g, ''));
      setFeedback(data);
    } catch (e) {
      setFeedback({ score: 0, explanation: "Error analyzing." });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const speak = (text: string) => {
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=vi&client=tw-ob`;
    audioRef.current.src = url;
    audioRef.current.play();
  };

  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white p-10 rounded-[3rem] shadow-2xl text-center max-w-md w-full border-8 border-blue-50">
          <h1 className="text-3xl font-black text-blue-900 mb-6 uppercase tracking-tighter">{t.startTitle}</h1>
          <div className="flex justify-center gap-4 mb-8">
            <button onClick={() => setLang('en')} className={`px-6 py-2 rounded-2xl font-bold transition-all ${lang === 'en' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>English</button>
            <button onClick={() => setLang('ru')} className={`px-6 py-2 rounded-2xl font-bold transition-all ${lang === 'ru' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>Русский</button>
          </div>
          <button onClick={() => setHasStarted(true)} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-xl flex items-center justify-center gap-2">
            <Play fill="white" /> {t.startBtn}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Library */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {['v', 'c_v', 'v_c', 'c_v_c'].map(mode => (
              <button 
                key={mode} 
                onClick={() => setActiveTab(mode)}
                className={`px-6 py-3 rounded-2xl font-black text-sm uppercase whitespace-nowrap transition-all ${activeTab === mode ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
              >
                {mode === 'v' ? 'Vowels' : mode.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div className="bg-slate-50 rounded-[2.5rem] p-8 border-2 border-slate-100">
            <div className="grid grid-cols-6 md:grid-cols-9 gap-3">
              {VIETNAMESE_VOWELS.map((v, idx) => (
                <button 
                  key={idx}
                  onClick={() => setSelectedVowel(v)}
                  className={`aspect-square rounded-2xl text-xl font-bold transition-all flex items-center justify-center ${selectedVowel.char === v.char ? 'bg-white text-blue-600 shadow-md scale-110 border-2 border-blue-100' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  {v.char}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeTab.includes('c_') && (
              <div className="bg-blue-50/50 p-6 rounded-3xl border-2 border-blue-100">
                <p className="text-[10px] font-black text-blue-400 uppercase mb-4 tracking-widest">Initial Consonant</p>
                <div className="flex flex-wrap gap-2">
                  {CONSONANTS.map(c => (
                    <button key={c} onClick={() => setPrefixC(c)} className={`px-4 py-2 rounded-xl font-bold transition-all ${prefixC === c ? 'bg-blue-600 text-white' : 'bg-white text-blue-400 border border-blue-100'}`}>{c}</button>
                  ))}
                </div>
              </div>
            )}
            {activeTab.includes('_c') && (
              <div className="bg-indigo-50/50 p-6 rounded-3xl border-2 border-indigo-100">
                <p className="text-[10px] font-black text-indigo-400 uppercase mb-4 tracking-widest">Final Consonant</p>
                <div className="flex flex-wrap gap-2">
                  {END_CONSONANTS.map(c => (
                    <button key={c} onClick={() => setSuffixC(c)} className={`px-4 py-2 rounded-xl font-bold transition-all ${suffixC === c ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-400 border border-indigo-100'}`}>{c || 'None'}</button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Practice */}
        <div className="lg:col-span-4 space-y-6">
          <div className={`p-8 rounded-[3rem] text-center transition-all border-4 ${isValid ? 'bg-white border-blue-50 shadow-2xl' : 'bg-red-50 border-red-100 opacity-60'}`}>
            {!isValid && (
              <div className="flex items-center justify-center gap-2 text-red-500 font-bold text-xs mb-4">
                <AlertCircle size={14} /> INVALID SPELLING
              </div>
            )}
            <h2 className="text-7xl font-black text-slate-900 mb-2">{currentWord}</h2>
            <p className="text-slate-400 font-medium mb-6 italic">{selectedVowel.name}</p>
            
            <div className="flex justify-center gap-4">
              <button onClick={() => speak(currentWord)} className="p-5 bg-blue-600 text-white rounded-full hover:scale-110 transition-transform shadow-xl shadow-blue-100">
                <Volume2 size={32} />
              </button>
              <button 
                onClick={() => {
                  setIsRecording(true);
                  recognitionRef.current?.start();
                }} 
                disabled={isRecording || !isValid}
                className={`p-5 rounded-full transition-all shadow-xl ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-slate-900 text-white hover:scale-110'}`}
              >
                {isRecording ? <MicOff size={32} /> : <Mic size={32} />}
              </button>
            </div>
          </div>

          {isAnalyzing && (
            <div className="text-center animate-bounce py-4 text-blue-600 font-black tracking-widest text-xs">ANALYZING...</div>
          )}

          {feedback && (
            <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden">
              <div className="relative z-10">
                <div className="text-5xl font-black mb-2">{feedback.score}%</div>
                <div className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-4">Pronunciation Accuracy</div>
                <p className="text-slate-300 text-sm leading-relaxed italic">"{feedback.explanation}"</p>
                {userInput && <div className="mt-4 p-3 bg-white/10 rounded-xl text-xs">You said: <span className="text-white font-bold">{userInput}</span></div>}
              </div>
              <Sparkles className="absolute -right-4 -bottom-4 text-white/5 w-32 h-32" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Pronunciationtrainer1;

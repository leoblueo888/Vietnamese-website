import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Send, Volume2, Play, Download, Volume1, Gauge, Maximize, Minimize } from 'lucide-react';

// --- DICTIONARY DATA ---
const DICTIONARY = {
  "nước ép": { EN: "fruit juice", type: "Noun" },
  "sinh tố": { EN: "smoothie", type: "Noun" },
  "cà phê": { EN: "coffee", type: "Noun" },
  "đá": { EN: "ice", type: "Noun" },
  "đường": { EN: "sugar", type: "Noun" },
  "sữa": { EN: "milk", type: "Noun" },
  "trái cây": { EN: "fruit", type: "Noun" },
  "thực đơn": { EN: "menu", type: "Noun" },
  "quán": { EN: "shop / cafe", type: "Noun" },
  "tên": { EN: "name", type: "Noun" },
  "sức khỏe": { EN: "health", type: "Noun" },
  "vitamin": { EN: "vitamin", type: "Noun" },
  "đề kháng": { EN: "resistance/immunity", type: "Noun" },
  "uống": { EN: "to drink", type: "Verb" },
  "chọn": { EN: "to choose", type: "Verb" },
  "pha": { EN: "to brew / to mix", type: "Verb" },
  "chào": { EN: "to greet / hello", type: "Verb" },
  "cảm ơn": { EN: "to thank", type: "Verb" },
  "đợi": { EN: "to wait", type: "Verb" },
  "thích": { EN: "to like", type: "Verb" },
  "dùng": { EN: "to use / to consume", type: "Verb" },
  "tư vấn": { EN: "to consult/advise", type: "Verb" },
  "ngon": { EN: "delicious", type: "Adj" },
  "ngọt": { EN: "sweet", type: "Adj" },
  "mát": { EN: "cool / refreshing", type: "Adj" },
  "đẹp": { EN: "beautiful", type: "Adj" },
  "vui": { EN: "happy", type: "Adj" },
  "nhiều": { EN: "many / much", type: "Adj" },
  "ít": { EN: "few / little", type: "Adj" },
  "tươi": { EN: "fresh", type: "Adj" }
};

const LANGUAGES = {
  EN: {
    label: "English",
    ui_welcome: "Welcome to my juice bar! I'm Xuan.",
    ui_start: "ORDER NOW",
    ui_placeholder: "Talk to Xuan here...",
    ui_listening: "Xuan is listening...",
    ui_status: "Online - Barista Mode",
    ui_learning_title: "Chat with Xuan Barista",
    welcome_msg: "Dạ, em chào Anh! Anh muốn dùng nước ép hay sinh tố gì ạ? Hôm nay nhà em có nhiều trái cây tươi ngon lắm! ✨ | Hi! Welcome. Would you like a juice or a smoothie today? ✨",
    systemPromptLang: "English"
  },
  RU: {
    label: "Русский",
    ui_welcome: "Добро пожаловать! Я Суан, ваш бариста.",
    ui_start: "ЗАKAЗАТЬ",
    ui_placeholder: "Поговори с Суан здесь...",
    ui_listening: "Суан слушает...",
    ui_status: "В сети - Бариста",
    ui_learning_title: "Общение với бариста",
    welcome_msg: "Dạ, em chào Anh! Anh muốn dùng nước ép hay sinh tố gì ạ? ✨ | Здравствуйте! Какой сок hoặc смузи вы бы хотели сегодня? ✨",
    systemPromptLang: "Russian"
  }
};

// ĐỔI TÊN THÀNH GameSpeakAISmoothie VÀ THÊM EXPORT ĐỂ KHỚP VỚI IMPORT
export const GameSpeakAISmoothie: React.FC<any> = ({ character }) => {
  const [gameState, setGameState] = useState('start');
  const [selectedLang, setSelectedLang] = useState<'EN' | 'RU'>('EN');
  const [messages, setMessages] = useState<any[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [activeVoiceId, setActiveVoiceId] = useState<string | null>(null);
  const [speechRate, setSpeechRate] = useState(1.0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef(new Audio());
  const recognitionRef = useRef<any>(null);
  const isProcessingRef = useRef(false);

  const XUAN_IMAGE_URL = "https://images.unsplash.com/photo-1595152772835-219674b2a8a6?q=80&w=200&auto=format&fit=crop";
  const t = LANGUAGES[selectedLang];

  useEffect(() => {
    const handleFs = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFs);
    return () => document.removeEventListener('fullscreenchange', handleFs);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = 'vi-VN';
      recognition.onresult = (e: any) => {
        const text = e.results[0][0].transcript;
        handleSendMessage(text);
      };
      recognition.onend = () => setIsRecording(false);
      recognitionRef.current = recognition;
    }
  }, []);

  const speakWord = async (text: string, msgId: string | null = null) => {
    if (!text) return;
    if (msgId) setActiveVoiceId(msgId);
    const cleanText = text.split('|')[0].replace(/[^\p{L}\p{N}\s]/gu, '').trim();
    
    return new Promise<void>((resolve) => {
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(cleanText)}&tl=vi&client=tw-ob`;
      audioRef.current.src = url;
      audioRef.current.playbackRate = speechRate;
      audioRef.current.onended = () => { setActiveVoiceId(null); resolve(); };
      audioRef.current.onerror = () => { setActiveVoiceId(null); resolve(); };
      audioRef.current.play().catch(() => {
          const ut = new SpeechSynthesisUtterance(cleanText);
          ut.lang = 'vi-VN';
          ut.rate = speechRate;
          ut.onend = () => { setActiveVoiceId(null); resolve(); };
          window.speechSynthesis.speak(ut);
      });
    });
  };

  const speakSingleWord = (e: React.MouseEvent, word: string) => {
    e.stopPropagation();
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(word)}&tl=vi&client=tw-ob`;
    const audio = new Audio(url);
    audio.playbackRate = speechRate;
    audio.play().catch(console.error);
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isProcessingRef.current) return;
    isProcessingRef.current = true;
    setIsThinking(true);
    
    const userMsgId = `user-${Date.now()}`;
    setMessages(prev => [...prev, { role: 'user', text: text, id: userMsgId }]);
    setUserInput("");

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: text, 
          lang: selectedLang.toLowerCase(),
          topic: "Barista named Xuan at a Smoothie Shop" 
        })
      });

      const data = await response.json();
      if (data.text) {
        const aiMsgId = `ai-${Date.now()}`;
        setMessages(prev => [...prev, { role: 'ai', text: data.text, id: aiMsgId }]);
        await speakWord(data.text, aiMsgId);

        if (data.text.toLowerCase().includes("mang đồ uống tới ngay") || data.text.toLowerCase().includes("ngồi đợi")) {
          setTimeout(async () => {
             const svMsgId = `ai-sv-${Date.now()}`;
             const svText = "Dạ, đồ uống của anh đây ạ! Chúc anh ngon miệng! 🥤 | Here is your drink! Enjoy! ✨";
             setMessages(prev => [...prev, { role: 'ai', text: svText, id: svMsgId }]);
             await speakWord(svText, svMsgId);
          }, 5000);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsThinking(false);
      isProcessingRef.current = false;
    }
  };

  const renderInteractiveText = (text: string) => {
    if (!text) return null;
    const sortedKeys = Object.keys(DICTIONARY).sort((a, b) => b.length - a.length);
    let result: any[] = [];
    let remaining = text;

    while (remaining.length > 0) {
      let match = null;
      for (const key of sortedKeys) {
        if (remaining.toLowerCase().startsWith(key)) {
          match = { key, original: remaining.slice(0, key.length), info: (DICTIONARY as any)[key] };
          break;
        }
      }

      if (match) {
        const color = match.info.type === "Noun" ? "text-blue-500" : "text-emerald-500";
        result.push(
          <span key={remaining.length} className="group relative inline-block border-b border-dotted border-slate-300 hover:border-blue-400 cursor-help px-0.5">
            {match.original}
            <span className="invisible group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max bg-slate-800 text-white text-[10px] p-2 rounded-lg z-50 shadow-xl border border-slate-700">
              <div className="flex items-center justify-between gap-4 border-b border-slate-700 pb-1 mb-1">
                <span className={`font-black text-[8px] uppercase ${color}`}>{match.info.type}</span>
                <Volume1 size={12} className="text-blue-400" onClick={(e) => speakSingleWord(e, match.original)} />
              </div>
              <div className="font-bold">{match.info.EN}</div>
            </span>
          </span>
        );
        remaining = remaining.slice(match.original.length);
      } else {
        result.push(remaining[0]);
        remaining = remaining.slice(1);
      }
    }
    return result;
  };

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  if (gameState === 'start') {
    return (
      <div className="w-full h-full bg-blue-50 flex items-center justify-center p-4">
        <div className="w-full max-w-xl bg-white rounded-[2rem] shadow-2xl p-10 text-center border-[10px] border-blue-100">
          <div className="w-40 h-40 mx-auto mb-6 rounded-full overflow-hidden border-4 border-blue-400 shadow-lg">
            <img src={XUAN_IMAGE_URL} alt="Xuan" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-3xl font-black text-blue-600 mb-2 italic">Xuân's Healthy Bar 🥤</h1>
          <p className="text-slate-400 mb-8 italic">{t.ui_welcome}</p>
          <div className="flex gap-4 justify-center mb-8">
              {['EN', 'RU'].map(l => (
               <button key={l} onClick={() => setSelectedLang(l as any)} className={`px-6 py-2 rounded-xl font-bold transition-all ${selectedLang === l ? 'bg-blue-600 text-white ring-4 ring-blue-100' : 'bg-slate-100 text-slate-400'}`}>{LANGUAGES[l as 'EN'|'RU'].label}</button>
              ))}
          </div>
          <button onClick={() => { setGameState('playing'); setMessages([{ role: 'ai', text: t.welcome_msg, id: 'init' }]); speakWord(t.welcome_msg, 'init'); }} className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-xl shadow-xl hover:scale-105 active:scale-95 transition-all">
            {t.ui_start}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-slate-900 flex items-center justify-center md:p-4 overflow-hidden">
      <div className="w-full h-full max-w-6xl bg-white md:rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row overflow-hidden border-0 md:border-[10px] border-blue-50">
        <div className="h-[20vh] md:h-full md:w-1/3 bg-blue-50/40 p-4 md:p-8 flex flex-row md:flex-col items-center justify-between border-b md:border-r border-blue-100 shrink-0">
          <div className="flex flex-row md:flex-col items-center gap-4">
            <div className="h-24 w-24 md:w-56 md:h-56 rounded-2xl md:rounded-[2rem] overflow-hidden shadow-xl border-4 border-white shrink-0">
              <img src={XUAN_IMAGE_URL} alt="Xuan" className="w-full h-full object-cover" />
            </div>
            <div className="text-left md:text-center">
              <h2 className="text-xl md:text-2xl font-black text-slate-800 italic">Xuân🍓</h2>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"/><span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{t.ui_status}</span></div>
            </div>
          </div>
          <button onClick={() => { setIsRecording(true); recognitionRef.current?.start(); }} className={`w-16 h-16 md:w-24 md:h-24 rounded-full flex items-center justify-center transition-all ${isRecording ? 'bg-red-500 animate-pulse scale-110' : 'bg-blue-600 shadow-xl'}`}>
            {isRecording ? <MicOff color="white" /> : <Mic color="white" size={32} />}
          </button>
        </div>

        <div className="flex-1 flex flex-col bg-white overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between shrink-0">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.ui_learning_title}</span>
              <span className="text-xs font-black text-blue-600">GIÁ CHUẨN: 30K / LY 💸</span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setSpeechRate(prev => prev === 1.0 ? 0.7 : 1.0)} className="bg-orange-50 text-orange-600 px-3 py-1.5 rounded-xl font-black text-[10px] flex items-center gap-1"><Gauge size={14}/> {speechRate * 100}%</button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 bg-blue-50/10">
            {messages.map((msg) => {
              const parts = msg.text.split('|');
              const mainText = parts[0]?.trim();
              const subText = parts[1]?.trim();
              const isActive = activeVoiceId === msg.id;
              
              return (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] shadow-sm transition-all ${isActive ? 'ring-4 ring-blue-100' : ''} ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none border border-blue-50'}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="text-sm md:text-lg font-bold leading-relaxed">
                        {msg.role === 'ai' ? renderInteractiveText(mainText) : mainText}
                      </div>
                      <button onClick={() => speakWord(msg.text, msg.id)} className={`p-2 rounded-full ${msg.role === 'user' ? 'text-blue-200 hover:bg-blue-500' : 'text-blue-600 hover:bg-blue-50'}`}>
                        <Volume2 size={18} />
                      </button>
                    </div>
                    {subText && <p className={`mt-2 pt-2 border-t text-[11px] italic ${msg.role === 'user' ? 'border-blue-500 text-blue-200' : 'border-slate-50 text-slate-400'}`}>{subText}</p>}
                  </div>
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>

          <div className="p-4 md:p-8 bg-white border-t border-slate-50 flex gap-3">
            <input 
              type="text" 
              value={userInput} 
              onChange={(e) => setUserInput(e.target.value)} 
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(userInput)}
              placeholder={t.ui_placeholder}
              className="flex-1 px-6 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-blue-200 focus:bg-white transition-all outline-none font-medium"
            />
            <button onClick={() => handleSendMessage(userInput)} disabled={isThinking || !userInput.trim()} className="bg-emerald-500 text-white px-6 rounded-2xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100 disabled:opacity-50">
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
      
      <button onClick={toggleFullscreen} className="absolute bottom-6 right-6 p-3 bg-black/20 text-white rounded-full backdrop-blur-md opacity-40 hover:opacity-100 transition-all">
        {isFullscreen ? <Minimize size={20}/> : <Maximize size={20}/>}
      </button>
    </div>
  );
};

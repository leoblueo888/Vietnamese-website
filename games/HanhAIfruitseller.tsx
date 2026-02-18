import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Send, Volume2, Play, Maximize, Minimize, Globe, Gauge } from 'lucide-react';
import type { AIFriend } from '../types';

// --- DICTIONARY DATA ---
const DICTIONARY = {
  "xoài cam lâm": { EN: "Cam Lam mango", type: "Noun" },
  "sầu riêng khánh sơn": { EN: "Khanh Son durian", type: "Noun" },
  "chôm chôm": { EN: "rambutan", type: "Noun" },
  "vú sữa": { EN: "star apple", type: "Noun" },
  "thanh long": { EN: "dragon fruit", type: "Noun" },
  "giỏ quà": { EN: "gift basket", type: "Noun" },
  "hoa quả": { EN: "fruit", type: "Noun" },
  "đặc sản": { EN: "specialty", type: "Noun" },
  "ăn": { EN: "to eat", type: "Verb" },
  "mua": { EN: "to buy", type: "Verb" },
  "chọn": { EN: "to pick / choose", type: "Verb" },
  "cân": { EN: "to weigh", type: "Verb" },
  "ngọt": { EN: "sweet", type: "Adj" },
  "thơm": { EN: "fragrant", type: "Adj" },
  "tươi": { EN: "fresh", type: "Adj" },
  "chín": { EN: "ripe", type: "Adj" },
  "giòn": { EN: "crunchy", type: "Adj" },
  "mọng nước": { EN: "juicy", type: "Adj" },
  "ạ": { EN: "Polite particle", type: "Particle" },
  "nha": { EN: "Friendly particle", type: "Particle" },
  "nhé": { EN: "Gentle suggestion", type: "Particle" }
};

const LANGUAGES = {
  EN: {
    label: "English",
    ui_welcome: "Welcome to Hanh's Fruit Shop! I'm Hanh.",
    ui_start: "SHOP NOW",
    ui_placeholder: "Talk to Hanh here...",
    welcome_msg: "Dạ, em chào Anh! Anh ghé xem hoa quả sạp em đi ạ. Anh muốn mua trái gì ạ? ✨ | Hi! Welcome to my shop. What fruit would you like to buy? ✨",
  },
  RU: {
    label: "Русский",
    ui_welcome: "Добро пожаловать! Я Хань, продавец фруктов.",
    ui_start: "КУПИТЬ",
    ui_placeholder: "Поговори с Хань здесь...",
    welcome_msg: "Dạ, em chào Anh! Mời Anh xem hoa quả ạ. Anh muốn mua trái gì ạ? ✨ | Здравствуйте! Những trái cây này ngon lắm. Bạn muốn mua gì? ✨",
  }
};

// ĐÃ ĐỔI TÊN THÀNH HanhAIfruitseller ĐỂ KHỚP VỚI LỆNH IMPORT
export const HanhAIfruitseller: React.FC<{ character: AIFriend }> = ({ character }) => {
  const [gameState, setGameState] = useState('start');
  const [selectedLang, setSelectedLang] = useState<'EN' | 'RU'>('EN');
  const [messages, setMessages] = useState<any[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [speechRate, setSpeechRate] = useState(1.0);
  const [activeVoiceId, setActiveVoiceId] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef(new Audio());
  const recognitionRef = useRef<any>(null);
  const isProcessingRef = useRef(false);

  const t = LANGUAGES[selectedLang];

  // --- RECOGNITION ---
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'vi-VN';
      recognition.onresult = (event: any) => {
        let text = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          text += event.results[i][0].transcript;
        }
        setUserInput(text);
        if (event.results[event.results.length - 1].isFinal) {
          handleSendMessage(text);
          recognition.stop();
        }
      };
      recognition.onend = () => setIsRecording(false);
      recognitionRef.current = recognition;
    }
  }, []);

  // --- TTS ---
  const speak = async (text: string, msgId: string | null = null) => {
    if (msgId) setActiveVoiceId(msgId);
    const cleanText = text.split('|')[0].replace(/(\d+)k\b/g, '$1 nghìn').trim();
    return new Promise<void>(resolve => {
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(cleanText)}&tl=vi&client=tw-ob`;
      audioRef.current.src = url;
      audioRef.current.playbackRate = speechRate;
      audioRef.current.onended = () => { setActiveVoiceId(null); resolve(); };
      audioRef.current.play().catch(resolve);
    });
  };

  // --- AI PROXY ---
  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isProcessingRef.current) return;
    isProcessingRef.current = true;
    setIsThinking(true);

    const userMsgId = `user-${Date.now()}`;
    setMessages(prev => [...prev, { role: 'user', text: text.trim(), id: userMsgId }]);
    setUserInput("");

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          lang: selectedLang.toLowerCase(),
          topic: "Hạnh, a 20-year-old fruit seller. Sell Local (Xoài Cam Lâm, Sầu riêng) and Imported fruits. Be polite (Dạ, ạ), refer to self as 'Em' and user as 'Anh'. Follow sales logic: Greet -> Ask fruit -> Ask quantity."
        })
      });

      const data = await response.json();
      if (data.text) {
        const aiMsgId = `ai-${Date.now()}`;
        setMessages(prev => [...prev, { role: 'ai', text: data.text, id: aiMsgId }]);
        await speak(data.text, aiMsgId);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsThinking(false);
      isProcessingRef.current = false;
    }
  };

  // --- INTERACTIVE RENDER ---
  const renderInteractiveText = (text: string) => {
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
        const color = match.info.type === "Verb" ? "text-orange-400" : match.info.type === "Adj" ? "text-pink-400" : "text-emerald-400";
        result.push(
          <span key={remaining.length} className="group relative inline-block border-b border-dotted border-emerald-300 hover:border-emerald-600 cursor-help transition-colors">
            {match.original}
            <span className="invisible group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max bg-slate-800 text-white text-[10px] p-2 rounded-xl z-50 shadow-xl border border-slate-700">
              <div className={`font-black text-[8px] uppercase mb-1 ${color}`}>{match.info.type}</div>
              <div className="font-bold">{match.info.EN}</div>
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
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

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      gameContainerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  if (gameState === 'start') {
    return (
      <div className="w-full h-full bg-emerald-50 flex items-center justify-center p-4">
        <div className="w-full max-w-xl bg-white rounded-[3rem] shadow-2xl p-10 text-center border-[10px] border-white">
          <img src={character.avatarUrl} className="w-44 h-44 mx-auto mb-6 rounded-full border-4 border-emerald-400 object-cover shadow-lg" alt="Hanh" />
          <h1 className="text-4xl font-black text-emerald-600 mb-2 italic">Hạnh's Fruit Market 🍎</h1>
          <p className="text-slate-400 mb-10 font-medium">{t.ui_welcome}</p>
          <div className="flex gap-4 justify-center mb-10">
            {['EN', 'RU'].map(l => (
              <button key={l} onClick={() => setSelectedLang(l as any)} className={`px-8 py-3 rounded-2xl font-black transition-all ${selectedLang === l ? 'bg-emerald-600 text-white shadow-lg scale-105' : 'bg-emerald-50 text-emerald-400 hover:bg-emerald-100'}`}>
                {LANGUAGES[l as 'EN' | 'RU'].label}
              </button>
            ))}
          </div>
          <button onClick={() => { setGameState('playing'); setMessages([{ role: 'ai', text: t.welcome_msg, id: 'init' }]); speak(t.welcome_msg, 'init'); }} className="w-full py-6 bg-orange-500 text-white rounded-[2rem] font-black text-2xl shadow-xl hover:bg-orange-600 transition-all flex items-center justify-center gap-3">
            <Play fill="white" /> {t.ui_start}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={gameContainerRef} className="w-full h-full bg-slate-900 flex items-center justify-center md:p-4 overflow-hidden relative">
      <div className="w-full h-full max-w-6xl bg-white md:rounded-[3rem] flex flex-col md:flex-row overflow-hidden shadow-2xl">
        <div className="h-[20vh] md:h-full md:w-1/3 bg-emerald-50/50 p-4 md:p-10 flex flex-row md:flex-col items-center justify-between border-b md:border-r border-emerald-100 shrink-0">
          <div className="flex flex-row md:flex-col items-center gap-6">
            <div className="relative">
              <img src={character.avatarUrl} className="w-20 h-20 md:w-56 md:h-56 rounded-full border-4 border-white shadow-xl object-cover" alt="Hanh" />
              {isThinking && <div className="absolute inset-0 bg-white/40 backdrop-blur-sm rounded-full flex items-center justify-center animate-pulse"><div className="flex gap-1"><div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce"></div><div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce [animation-delay:0.2s]"></div></div></div>}
            </div>
            <div className="text-left md:text-center">
              <h2 className="text-xl md:text-3xl font-black text-slate-800 italic">Em Hạnh 🍎</h2>
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Fresh & Sweet Shop</span>
            </div>
          </div>
          <button onClick={() => { setIsRecording(!isRecording); isRecording ? recognitionRef.current?.stop() : recognitionRef.current?.start(); }} className={`w-14 h-14 md:w-24 md:h-24 rounded-full flex items-center justify-center transition-all shadow-xl ${isRecording ? 'bg-red-500 ring-8 ring-red-50 scale-110' : 'bg-emerald-600 hover:bg-emerald-700'}`}>
            {isRecording ? <MicOff color="white" size={28} /> : <Mic color="white" size={28} />}
          </button>
        </div>

        <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
          <header className="px-6 py-4 border-b border-slate-50 flex items-center justify-between bg-white z-10 shadow-sm">
            <div className="flex items-center gap-2">
              <Globe size={14} className="text-emerald-500" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fruit Selling Practice</span>
            </div>
            <div className="flex gap-2">
               <button onClick={() => setSpeechRate(prev => prev === 1.0 ? 0.75 : 1.0)} className="bg-orange-50 text-orange-600 px-3 py-1.5 rounded-xl font-black text-[10px] flex items-center gap-2 transition-colors hover:bg-orange-100"><Gauge size={14}/> {Math.round(speechRate * 100)}%</button>
               <button onClick={toggleFullscreen} className="p-2 text-slate-400 hover:text-emerald-600 transition-colors"><Maximize size={18}/></button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-6 bg-emerald-50/10 custom-scrollbar">
            {messages.map((msg) => {
              const parts = msg.text.split('|');
              const isActive = activeVoiceId === msg.id;
              return (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-5 md:p-6 rounded-[2rem] transition-all duration-300 shadow-sm ${isActive ? 'ring-4 ring-emerald-100 scale-[1.02]' : ''} ${msg.role === 'user' ? 'bg-emerald-600 text-white rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none border border-emerald-100'}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="text-base font-bold leading-relaxed">{msg.role === 'ai' ? renderInteractiveText(parts[0]) : parts[0]}</div>
                      <button onClick={() => speak(msg.text, msg.id)} className={`p-2 rounded-xl transition-colors ${msg.role === 'user' ? 'bg-emerald-500 text-white' : 'bg-emerald-50 text-emerald-600'}`}><Volume2 size={18}/></button>
                    </div>
                    {parts[1] && <div className={`mt-3 pt-3 border-t text-[11px] italic font-medium ${msg.role === 'user' ? 'border-emerald-500 text-emerald-100' : 'border-slate-50 text-slate-400'}`}>{parts[1]}</div>}
                  </div>
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>

          <footer className="p-6 md:p-8 bg-white border-t border-slate-100 flex gap-3">
            <input type="text" value={userInput} onChange={e => setUserInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendMessage(userInput)} placeholder={t.ui_placeholder} className="flex-1 px-6 py-4 bg-slate-100 rounded-[1.5rem] outline-none font-bold transition-all focus:bg-white focus:ring-4 ring-emerald-50 shadow-inner" />
            <button onClick={() => handleSendMessage(userInput)} disabled={isThinking} className="bg-orange-500 text-white px-8 rounded-[1.5rem] shadow-lg hover:bg-orange-600 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"><Send size={20}/></button>
          </footer>
        </div>
      </div>
    </div>
  );
};

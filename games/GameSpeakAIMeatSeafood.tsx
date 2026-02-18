import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Send, Volume2, Play, Download, Volume1, Gauge, Maximize, Minimize, Globe } from 'lucide-react';
import type { AIFriend } from '../types';

// --- DICTIONARY DATA ---
const DICTIONARY = {
  "hải sản": { EN: "seafood", type: "Noun" },
  "tôm hùm": { EN: "lobster", type: "Noun" },
  "cua cà mau": { EN: "Ca Mau crab", type: "Noun" },
  "thịt bò": { EN: "beef", type: "Noun" },
  "thịt heo": { EN: "pork", type: "Noun" },
  "thịt gà": { EN: "chicken", type: "Noun" },
  "thịt vịt": { EN: "duck", type: "Noun" },
  "thịt cừu": { EN: "lamb", type: "Noun" },
  "cá hồi": { EN: "salmon", type: "Noun" },
  "mực lá": { EN: "bigfin reef squid", type: "Noun" },
  "nghêu": { EN: "clam", type: "Noun" },
  "ốc": { EN: "snail / shellfish", type: "Noun" },
  "phi lê": { EN: "fillet", type: "Noun" },
  "sườn non": { EN: "baby back ribs", type: "Noun" },
  "ba chỉ": { EN: "pork belly", type: "Noun" },
  "mua": { EN: "to buy", type: "Verb" },
  "cân": { EN: "to weigh", type: "Verb" },
  "làm sạch": { EN: "to clean / process", type: "Verb" },
  "giao hàng": { EN: "to deliver", type: "Verb" },
  "chế biến": { EN: "to cook / prepare", type: "Verb" },
  "tươi sống": { EN: "fresh / alive", type: "Adj" },
  "ngon": { EN: "delicious", type: "Adj" },
  "ngọt thịt": { EN: "sweet meat (flavor)", type: "Adj" },
  "béo ngậy": { EN: "fatty / creamy", type: "Adj" },
  "ạ": { EN: "Polite particle", type: "Particle" },
  "nha": { EN: "Friendly particle", type: "Particle" },
  "nhé": { EN: "Gentle suggestion", type: "Particle" },
  "luôn": { EN: "Right away", type: "Particle" }
};

const LANGUAGES = {
  EN: {
    label: "English",
    ui_welcome: "Welcome to Thanh's Fresh Market! I'm Thanh.",
    ui_start: "SHOP NOW",
    ui_placeholder: "Talk to Thanh here...",
    ui_status: "Online - Expert Merchant",
    ui_learning_title: "Chat with Thanh Merchant",
    welcome_msg: "Chào Anh! Nhà em có đủ các loại thịt tươi và hải sản ngon giá chợ, Anh muốn mua thịt hay hải sản gì ạ? ✨ | Hi! I have all kinds of fresh meat and seafood, do you want to buy meat or seafood? ✨",
  },
  RU: {
    label: "Русский",
    ui_welcome: "Добро пожаловать к Тхань! Я Тхань, ваш продавец.",
    ui_start: "КУПИТЬ",
    ui_placeholder: "Поговори с Тхань здесь...",
    ui_status: "В сети - Эксперт по рынку",
    ui_learning_title: "Общение с продавцом",
    welcome_msg: "Chào Anh! Nhà em có đủ các loại thịt tươi và hải sản ngon giá chợ, Anh muốn mua thịt hay hải sản gì ạ? ✨ | Привет! У меня есть все виды свежего мяса и морепродуктов, вы хотите купить мясо или морепродукты? ✨",
  }
};

export const GameSpeakAIMeatSeafood: React.FC<{ character: AIFriend }> = ({ character }) => {
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
  const silenceTimerRef = useRef<number | null>(null);

  const t = LANGUAGES[selectedLang];

  // --- RECOGNITION SETUP ---
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'vi-VN';
      recognition.onresult = (event: any) => {
        if (isProcessingRef.current) return;
        let final = ""; let interim = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) final += event.results[i][0].transcript;
          else interim += event.results[i][0].transcript;
        }
        setUserInput(final || interim);
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = window.setTimeout(() => {
          const text = (final || interim).trim();
          if (text && !isProcessingRef.current) {
            recognition.stop();
            handleSendMessage(text);
          }
        }, 2000);
      };
      recognition.onend = () => setIsRecording(false);
      recognitionRef.current = recognition;
    }
  }, [selectedLang]);

  // --- TTS LOGIC ---
  const speak = async (text: string, msgId: string | null = null) => {
    if (msgId) setActiveVoiceId(msgId);
    let cleanText = text.split('|')[0].trim();
    // Format price for more natural speech
    cleanText = cleanText.replace(/(\d+)\.000/g, '$1 nghìn').replace(/(\d+)k/gi, '$1 nghìn');
    
    if(!cleanText) return;
    
    return new Promise<void>(resolve => {
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(cleanText)}&tl=vi&client=tw-ob`;
      audioRef.current.src = url;
      audioRef.current.playbackRate = speechRate;
      audioRef.current.onended = () => { setActiveVoiceId(null); resolve(); };
      audioRef.current.onerror = () => { setActiveVoiceId(null); resolve(); };
      audioRef.current.play().catch(() => resolve());
    });
  };

  // --- AI PROXY CORE ---
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
          topic: "Thanh, a 25-year-old expert merchant at a Vietnamese market selling meat and seafood. Be energetic, friendly, use 'Anh/Chị' and 'Em'. Sales flow: 1. Greet & Ask what they need 2. Suggest fresh items today 3. Give price and cooking advice." 
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

  // --- INTERACTIVE DICTIONARY ---
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
        let typeColor = "text-blue-400";
        if (match.info.type === "Verb") typeColor = "text-emerald-400";
        else if (match.info.type === "Adj") typeColor = "text-cyan-400";

        result.push(
          <span key={remaining.length} className="group relative inline-block border-b border-dotted border-emerald-200 hover:border-emerald-500 cursor-help px-0.5 transition-colors">
            {match.original}
            <span className="invisible group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max bg-slate-900 text-white text-[10px] p-2 rounded-xl z-50 shadow-2xl border border-slate-700">
              <div className={`font-black uppercase text-[8px] mb-1 ${typeColor}`}>{match.info.type}</div>
              <div className="font-bold">{match.info.EN}</div>
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
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
      <div className="w-full h-full bg-[#f0f9ff] flex items-center justify-center p-4 min-h-[500px]">
        <div className="w-full max-w-xl bg-white rounded-[3rem] shadow-2xl p-10 text-center border-[12px] border-emerald-50">
          <div className="w-48 h-48 mx-auto mb-6 rounded-3xl overflow-hidden shadow-lg border-4 border-white rotate-3">
            <img src={character.avatarUrl} alt="Thanh" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-4xl font-black text-emerald-800 mb-2 uppercase tracking-tighter italic">Thanh's Fresh 🦀</h1>
          <p className="text-slate-400 mb-8 font-medium italic">{t.ui_welcome}</p>
          <div className="flex gap-4 justify-center mb-10">
            {['EN', 'RU'].map(l => (
              <button key={l} onClick={() => setSelectedLang(l as any)} className={`px-8 py-3 rounded-2xl font-black transition-all ${selectedLang === l ? 'bg-emerald-600 text-white shadow-xl scale-105' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}>
                {LANGUAGES[l as 'EN' | 'RU'].label}
              </button>
            ))}
          </div>
          <button onClick={() => { setGameState('playing'); setMessages([{ role: 'ai', text: t.welcome_msg, id: 'init' }]); speak(t.welcome_msg, 'init'); }} className="group relative w-full py-6 bg-blue-600 text-white rounded-[2rem] font-black text-2xl shadow-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-3 active:scale-95">
            <Play fill="white" /> {t.ui_start}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={gameContainerRef} className="w-full h-full bg-slate-900 flex items-center justify-center md:p-4 overflow-hidden relative min-h-[600px]">
      <div className="w-full h-full max-w-7xl bg-white md:rounded-[3rem] flex flex-col md:flex-row overflow-hidden shadow-2xl border-0 md:border-[10px] border-emerald-50/30">
        
        {/* SIDEBAR */}
        <div className="h-[25vh] md:h-full md:w-1/3 bg-emerald-50/30 p-4 md:p-10 flex flex-row md:flex-col items-center justify-between border-b md:border-r border-emerald-100 shrink-0">
          <div className="flex flex-row md:flex-col items-center gap-6">
            <div className="relative">
              <img src={character.avatarUrl} className="w-24 h-24 md:w-64 md:h-64 rounded-[2.5rem] border-4 border-white shadow-2xl object-cover" alt="Thanh" />
              {isThinking && <div className="absolute inset-0 bg-emerald-900/10 backdrop-blur-sm rounded-[2.5rem] flex items-center justify-center animate-pulse"><div className="w-3 h-3 bg-emerald-600 rounded-full mx-1"></div></div>}
            </div>
            <div className="text-left md:text-center">
              <h2 className="text-2xl md:text-4xl font-black text-emerald-900 italic">Thanh 🦀</h2>
              <div className="flex items-center gap-2 mt-1 md:justify-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{t.ui_status}</span>
              </div>
            </div>
          </div>
          
          <button onClick={() => { setIsRecording(!isRecording); isRecording ? recognitionRef.current?.stop() : recognitionRef.current?.start(); }} className={`w-16 h-16 md:w-28 md:h-28 rounded-full flex items-center justify-center transition-all shadow-2xl active:scale-90 ${isRecording ? 'bg-red-500 ring-[12px] ring-red-50' : 'bg-emerald-700 hover:bg-emerald-800'}`}>
            {isRecording ? <MicOff color="white" size={32} /> : <Mic color="white" size={32} />}
          </button>
        </div>

        {/* CHAT AREA */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
          <header className="px-8 py-5 border-b border-slate-50 flex items-center justify-between bg-white/80 backdrop-blur-md z-10 shadow-sm">
            <div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.ui_learning_title}</span>
              <div className="flex items-center gap-2 mt-1">
                <Globe size={12} className="text-emerald-500" />
                <span className="text-xs font-black text-emerald-600 uppercase">Fresh & Organic 🌿</span>
              </div>
            </div>
            <div className="flex gap-3">
               <button onClick={() => setSpeechRate(prev => prev === 1.0 ? 0.75 : 1.0)} className="bg-orange-50 text-orange-600 px-4 py-2 rounded-2xl font-black text-xs flex items-center gap-2 transition-colors hover:bg-orange-100"><Gauge size={16}/> {Math.round(speechRate * 100)}%</button>
               <button onClick={toggleFullscreen} className="p-2.5 bg-slate-50 text-slate-400 rounded-2xl hover:text-emerald-600 transition-colors"><Maximize size={20}/></button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 bg-emerald-50/5 scroll-smooth custom-scrollbar">
            {messages.map((msg) => {
              const parts = msg.text.split('|');
              const isActive = activeVoiceId === msg.id;
              return (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-5 md:p-8 rounded-[2.5rem] transition-all duration-300 shadow-sm ${isActive ? 'ring-4 ring-emerald-100 scale-[1.01] shadow-xl' : ''} ${msg.role === 'user' ? 'bg-emerald-700 text-white rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none border border-emerald-50'}`}>
                    <div className="flex items-start justify-between gap-6">
                      <div className="text-lg font-bold leading-relaxed">{msg.role === 'ai' ? renderInteractiveText(parts[0]) : parts[0]}</div>
                      <button onClick={() => speak(msg.text, msg.id)} className={`p-3 rounded-2xl transition-colors ${msg.role === 'user' ? 'bg-emerald-600/50 text-white hover:bg-emerald-500' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}><Volume2 size={20}/></button>
                    </div>
                    {parts[1] && <div className={`mt-4 pt-4 border-t text-xs italic font-medium tracking-wide ${msg.role === 'user' ? 'border-emerald-500 text-emerald-100' : 'border-slate-50 text-slate-400'}`}>{parts[1]}</div>}
                  </div>
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>

          <footer className="p-6 md:p-10 bg-white border-t border-slate-100 flex gap-4 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
            <input type="text" value={userInput} onChange={e => setUserInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendMessage(userInput)} placeholder={t.ui_placeholder} className="flex-1 px-8 py-5 bg-slate-50 rounded-[2rem] outline-none font-bold text-lg transition-all focus:bg-white focus:ring-4 ring-emerald-50 placeholder:text-slate-300 shadow-inner" />
            <button onClick={() => handleSendMessage(userInput)} disabled={isThinking} className="bg-blue-600 text-white px-10 rounded-[2rem] shadow-xl shadow-blue-100 hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"><Send size={24}/></button>
          </footer>
        </div>
      </div>
    </div>
  );
};

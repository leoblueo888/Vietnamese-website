import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Send, Volume2, Play, Download, Volume1, Gauge, Maximize, Minimize } from 'lucide-react';
import type { AIFriend } from '../types';

// --- DICTIONARY DATA ---
const DICTIONARY = {
  "rau muống": { EN: "water spinach", type: "Noun" },
  "cà chua": { EN: "tomato", type: "Noun" },
  "bắp cải": { EN: "cabbage", type: "Noun" },
  "khoai tây": { EN: "potato", type: "Noun" },
  "cà rốt": { EN: "carrot", type: "Noun" },
  "hành lá": { EN: "green onion", type: "Noun" },
  "rau thơm": { EN: "herbs", type: "Noun" },
  "trái cây": { EN: "fruit", type: "Noun" },
  "dưa leo": { EN: "cucumber", type: "Noun" },
  "ớt chuông": { EN: "bell pepper", type: "Noun" },
  "bí đỏ": { EN: "pumpkin", type: "Noun" },
  "giá đỗ": { EN: "bean sprouts", type: "Noun" },
  "mướp đắng": { EN: "bitter melon", type: "Noun" },
  "súp lơ": { EN: "broccoli/cauliflower", type: "Noun" },
  "rau ngót": { EN: "katuk", type: "Noun" },
  "cải chíp": { EN: "bok choy", type: "Noun" },
  "mua": { EN: "to buy", type: "Verb" },
  "cân": { EN: "to weigh", type: "Verb" },
  "chọn": { EN: "to pick / choose", type: "Verb" },
  "trả tiền": { EN: "to pay", type: "Verb" },
  "giảm giá": { EN: "to discount", type: "Verb" },
  "bớt": { EN: "to reduce price", type: "Verb" },
  "tặng": { EN: "to give (as a gift)", type: "Verb" },
  "nấu canh": { EN: "to cook soup", type: "Verb" },
  "giải nhiệt": { EN: "to cool down the body", type: "Verb" },
  "bổ mắt": { EN: "good for eyes", type: "Verb" },
  "tươi": { EN: "fresh", type: "Adj" },
  "ngon": { EN: "delicious / good quality", type: "Adj" },
  "non": { EN: "young / tender", type: "Adj" },
  "sạch": { EN: "clean / organic", type: "Adj" },
  "rẻ": { EN: "cheap", type: "Adj" },
  "đắt": { EN: "expensive", type: "Adj" },
  "chín": { EN: "ripe", type: "Adj" },
  "ngọt": { EN: "sweet", type: "Adj" },
  "ạ": { EN: "Polite particle", type: "Particle" },
  "nha": { EN: "Friendly particle", type: "Particle" },
  "nhé": { EN: "Gentle suggestion particle", type: "Particle" },
  "luôn": { EN: "Right away / also", type: "Particle" },
  "thôi": { EN: "Just / only", type: "Particle" },
  "đó": { EN: "That", type: "Particle" },
  "nghen": { EN: "Friendly regional softener", type: "Particle" }
};

const LANGUAGES = {
  EN: {
    label: "English",
    ui_welcome: "Welcome to Phuong's Market! I'm Phuong.",
    ui_start: "SHOP NOW",
    ui_placeholder: "Talk to Phuong here...",
    ui_status: "Online - Expert Seller",
    ui_learning_title: "Chat with Phuong",
    welcome_msg: "Em chào Anh! Rau củ nhà em hôm nay loại nào cũng có, tươi rói luôn ạ. Anh muốn mua gì về nấu cơm không ạ? ✨ | Hi! Welcome. I have all kinds of veggies today, very fresh. Do you want to buy anything? ✨",
  },
  RU: {
    label: "Русский",
    ui_welcome: "Добро пожаловать в лавку Фуонг!",
    ui_start: "КУПИТЬ",
    ui_placeholder: "Поговори с Фуонг здесь...",
    ui_status: "В сети - Эксперт",
    ui_learning_title: "Trò chuyện với Phương",
    welcome_msg: "Em chào Anh! Rau củ tươi lắm, Anh xem mua gì ủng hộ em nhé! ✨ | Здравствуйте! Овощи очень свежие, посмотрите! ✨",
  }
};

export const GameVegetables: React.FC<{ character: AIFriend }> = ({ character }) => {
  const [gameState, setGameState] = useState('start');
  const [selectedLang, setSelectedLang] = useState<'EN' | 'RU'>('EN');
  const [messages, setMessages] = useState<any[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [speechRate, setSpeechRate] = useState(1.0);
  const [activeVoiceId, setActiveVoiceId] = useState<string | null>(null);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef(new Audio());
  const recognitionRef = useRef<any>(null);
  const isProcessingRef = useRef(false);
  const silenceTimerRef = useRef<number | null>(null);

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

  // --- TTS GOOGLE TRANSLATE ---
  const speak = async (text: string, msgId: string | null = null) => {
    if (msgId) setActiveVoiceId(msgId);
    const cleanText = text.split('|')[0].replace(/(\d+)k/g, '$1 nghìn').trim();
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

  // --- AI CORE (10 KEY PROXY) ---
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
          topic: "Phuong, a friendly vegetable seller at a Vietnamese market" 
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

  // --- DICTIONARY RENDER ---
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
        result.push(
          <span key={remaining.length} className="group relative inline-block border-b border-dotted border-violet-300 hover:border-violet-500 cursor-help px-0.5">
            {match.original}
            <span className="invisible group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max bg-slate-800 text-white text-[10px] p-2 rounded-xl z-50">
              <div className="font-black text-violet-400 uppercase text-[8px]">{match.info.type}</div>
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
      <div className="w-full h-full bg-[#f3e8ff] flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-white rounded-[3rem] shadow-2xl p-10 text-center border-[10px] border-violet-50">
          <img src={character.avatarUrl} alt="Phuong" className="w-40 h-40 mx-auto mb-6 rounded-full border-4 border-violet-400 object-cover" />
          <h1 className="text-3xl font-black text-violet-600 mb-2 italic">Phuong's Market 🥦</h1>
          <p className="text-slate-400 mb-8 italic">{t.ui_welcome}</p>
          <div className="flex gap-4 justify-center mb-8">
            {['EN', 'RU'].map(l => (
              <button key={l} onClick={() => setSelectedLang(l as any)} className={`px-6 py-2 rounded-xl font-bold ${selectedLang === l ? 'bg-violet-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}>
                {LANGUAGES[l as 'EN' | 'RU'].label}
              </button>
            ))}
          </div>
          <button onClick={() => { setGameState('playing'); setMessages([{ role: 'ai', text: t.welcome_msg, id: 'init' }]); speak(t.welcome_msg, 'init'); }} className="w-full py-5 bg-violet-600 text-white rounded-3xl font-black text-xl shadow-xl hover:scale-105 active:scale-95 transition-all">
            {t.ui_start}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-slate-900 flex items-center justify-center md:p-4 overflow-hidden relative">
      <div className="w-full h-full max-w-6xl bg-white md:rounded-[2.5rem] flex flex-col md:flex-row overflow-hidden border-0 md:border-[10px] border-violet-50">
        
        {/* SIDEBAR */}
        <div className="h-[20vh] md:h-full md:w-1/3 bg-[#F7F8FA] p-4 md:p-8 flex flex-row md:flex-col items-center justify-between border-b md:border-r border-slate-100 shrink-0">
          <div className="flex flex-row md:flex-col items-center gap-4">
            <img src={character.avatarUrl} className="w-20 h-20 md:w-56 md:h-56 rounded-3xl border-4 border-white shadow-xl object-cover" alt="Phuong" />
            <div className="text-left md:text-center">
              <h2 className="text-xl md:text-3xl font-black text-slate-800">Phương 🥦</h2>
              <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">● {t.ui_status}</span>
            </div>
          </div>
          <button onClick={() => { setIsRecording(!isRecording); isRecording ? recognitionRef.current?.stop() : recognitionRef.current?.start(); }} className={`w-14 h-14 md:w-24 md:h-24 rounded-full flex items-center justify-center transition-all ${isRecording ? 'bg-red-500 animate-pulse ring-8 ring-red-50' : 'bg-violet-600 shadow-xl'}`}>
            <Mic color="white" size={30} />
          </button>
        </div>

        {/* CHAT AREA */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden">
          <header className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.ui_learning_title}</span>
              <div className="text-xs font-black text-violet-600 mt-1 uppercase">Expert Seller Mode 🥦</div>
            </div>
            <div className="flex gap-2">
               <button onClick={() => setSpeechRate(prev => prev === 1.0 ? 0.7 : 1.0)} className="bg-orange-50 text-orange-600 px-3 py-1.5 rounded-xl font-black text-[10px] flex items-center gap-1"><Gauge size={14}/> {Math.round(speechRate * 100)}%</button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 bg-violet-50/5">
            {messages.map((msg) => {
              const parts = msg.text.split('|');
              const isActive = activeVoiceId === msg.id;
              return (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-4 md:p-6 rounded-[2rem] transition-all ${isActive ? 'ring-4 ring-violet-100 shadow-lg scale-[1.02]' : ''} ${msg.role === 'user' ? 'bg-violet-600 text-white rounded-tr-none shadow-md' : 'bg-white text-slate-800 rounded-tl-none border border-violet-50 shadow-sm'}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="text-base font-bold leading-relaxed">{msg.role === 'ai' ? renderInteractiveText(parts[0]) : parts[0]}</div>
                      <button onClick={() => speak(msg.text, msg.id)} className={`p-2 rounded-xl ${msg.role === 'user' ? 'text-violet-200 hover:bg-violet-500' : 'text-violet-600 hover:bg-violet-50'}`}><Volume2 size={18}/></button>
                    </div>
                    {parts[1] && <div className={`mt-2 pt-2 border-t text-[11px] italic font-medium ${msg.role === 'user' ? 'border-violet-500 text-violet-200' : 'border-slate-50 text-slate-400'}`}>{parts[1]}</div>}
                  </div>
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>

          <footer className="p-4 md:p-8 bg-white border-t border-slate-50 flex gap-3">
            <input type="text" value={userInput} onChange={e => setUserInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendMessage(userInput)} placeholder={t.ui_placeholder} className="flex-1 px-6 py-4 bg-slate-50 rounded-2xl outline-none font-medium transition-all focus:bg-white focus:ring-2 ring-violet-100" />
            <button onClick={() => handleSendMessage(userInput)} disabled={isThinking} className="bg-violet-600 text-white px-6 rounded-2xl shadow-lg hover:bg-violet-700 transition-all disabled:opacity-50"><Send size={20}/></button>
          </footer>
        </div>
      </div>
    </div>
  );
};

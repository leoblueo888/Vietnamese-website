import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Send, Volume2, Play, Gauge, Maximize, Minimize, Globe, Download } from 'lucide-react';
import { generateContentWithRetry } from '../config/apiKeys';
import type { AIFriend } from '../types';


// --- DICTIONARY DATA ---
const DICTIONARY: Record<string, { EN: string; type: string }> = {
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
    systemPromptLang: "English"
  },
  RU: {
    label: "Русский",
    ui_welcome: "Добро пожаловать к Тхань! Я Тхань, ваш продавец.",
    ui_start: "КУПИТЬ",
    ui_placeholder: "Поговори с Тхань здесь...",
    ui_status: "В сети - Эксперт по рынку",
    ui_learning_title: "Общение с продавцом",
    welcome_msg: "Chào Anh! Nhà em có đủ các loại thịt tươi và hải sản ngon giá chợ, Anh muốn mua thịt hay hải sản gì ạ? ✨ | Привет! У меня есть все виды свежего мяса и морепродуктов, вы хотите купить мясо или морепродукты? ✨",
    systemPromptLang: "Russian"
  }
};

export const GameSpeakAIMeatSeafood: React.FC<{ character: AIFriend }> = ({ character }) => {
  const [gameState, setGameState] = useState<'start' | 'playing'>('start');
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
  const autoSendTimerRef = useRef<NodeJS.Timeout | null>(null);

  const t = LANGUAGES[selectedLang];

  // --- CHUNK LOGIC (180 CHARS & SMART CUT) ---
  const createChunks = (str: string, max = 180) => {
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
  };

  // --- CLEAN TEXT FUNCTION ---
  const cleanText = (text: string) => {
    return text
      .replace(/(\d+)k\b/g, '$1 nghìn')
      .replace(/(\d+)\.000/g, '$1 nghìn')
      .replace(/[*_`#|]/g, '')  // Loại bỏ markdown
      .replace(/\s+/g, ' ')      // Chuẩn hóa khoảng trắng
      .replace(/[✨🎵🔊🔔❌✅⭐🦀]/g, '') // Loại bỏ emoji
      .trim();
  };

  // --- SPEAK FUNCTION WITH PROXY API ---
  const speak = useCallback(async (fullText: string, msgId: string | null = null) => {
    if (!fullText) return;
    if (msgId) setActiveVoiceId(msgId);
    
    // Dừng mọi âm thanh đang phát
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    audioRef.current.pause();

    const parts = fullText.split('|');
    const vietnameseToRead = parts.filter((_, i) => i % 2 === 0).join(' ');
    const cleanedText = cleanText(vietnameseToRead);

    if (!cleanedText) {
      setActiveVoiceId(null);
      return;
    }

    const chunks = createChunks(cleanedText);
    
    for (const chunk of chunks) {
      await new Promise<void>((resolve) => {
        // Dùng API proxy (quan trọng!)
        const url = `/api/tts?text=${encodeURIComponent(chunk)}&lang=vi`;
        audioRef.current.src = url;
        audioRef.current.playbackRate = speechRate;
        
        audioRef.current.onended = () => resolve();
        audioRef.current.onerror = () => {
          const fb = new SpeechSynthesisUtterance(chunk);
          fb.lang = 'vi-VN';
          fb.rate = speechRate;
          fb.onend = () => resolve();
          window.speechSynthesis.speak(fb);
        };
        
        audioRef.current.play().catch(() => {
          const fb = new SpeechSynthesisUtterance(chunk);
          fb.lang = 'vi-VN';
          fb.rate = speechRate;
          fb.onend = () => resolve();
          window.speechSynthesis.speak(fb);
        });
      });
    }
    setActiveVoiceId(null);
  }, [speechRate]);

  // --- RECOGNITION + AUTO SEND (2.5S) ---
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'vi-VN';
      recognition.onstart = () => setIsRecording(true);
      recognition.onresult = (e: any) => {
        let text = "";
        for (let i = e.resultIndex; i < e.results.length; ++i) {
          text += e.results[i][0].transcript;
        }
        setUserInput(text);
        
        if (autoSendTimerRef.current) clearTimeout(autoSendTimerRef.current);
        autoSendTimerRef.current = setTimeout(() => {
          if (text.trim()) {
            recognition.stop();
            handleSendMessage(text);
          }
        }, 2500);
      };
      recognition.onend = () => setIsRecording(false);
      recognitionRef.current = recognition;
    }
    return () => { 
      if (autoSendTimerRef.current) clearTimeout(autoSendTimerRef.current); 
    };
  }, []); // Bỏ dependency messages

  // --- AI ENGINE (GEMINI-2.5-FLASH) ---
  const handleSendMessage = async (text: string) => {
    const cleanInput = text.trim();
    if (!cleanInput || isProcessingRef.current) return;
    if (autoSendTimerRef.current) clearTimeout(autoSendTimerRef.current);
    
    isProcessingRef.current = true;
    setIsThinking(true);

    const userMsgId = `user-${Date.now()}`;
    setMessages(prev => [...prev, { role: 'user', text: cleanInput, id: userMsgId, translation: null }]);
    setUserInput("");

    try {
      const response = await generateContentWithRetry({
        model: 'gemini-2.5-flash',
        contents: [...messages.map(m => ({
          role: m.role === 'ai' ? 'model' : 'user',
          parts: [{ text: m.text }]
        })), { role: 'user', parts: [{ text: cleanInput }] }],
        config: {
          systemInstruction: `Bạn tên là Thanh (25 tuổi), chuyên gia bán hải sản và thịt tươi sống.
          PHONG CÁCH: Năng động, niềm nở, khéo léo chốt đơn. Xưng "Em" - gọi "Anh/Chị". Luôn dùng "Dạ", "ạ", "nha".
          FORMAT: Vietnamese sentence | ${t.systemPromptLang} translation.
          At the end, add: USER_TRANSLATION: [Translation of user's last message]
          Important: Do not use markdown, emojis, or special characters in the Vietnamese part.`
        }
      });

      if (response.text) {
        const raw = response.text;
        const userTransMatch = raw.match(/USER_TRANSLATION:\s*(.*)$/i);
        const userTransValue = userTransMatch ? userTransMatch[1].replace(/[\[\]]/g, '').trim() : "";
        const aiResponseFull = raw.split(/USER_TRANSLATION:/i)[0].trim().replace(/[*]/g, '');
        const aiMsgId = `ai-${Date.now()}`;

        setMessages(prev => {
          return prev.map(m => m.id === userMsgId ? { ...m, translation: userTransValue } : m)
                     .concat({ role: 'ai', text: aiResponseFull, id: aiMsgId });
        });
        
        // Chỉ gọi speak 1 lần ở đây
        await speak(aiResponseFull, aiMsgId);
      }
    } catch (e) { 
      console.error(e); 
    } finally { 
      setIsThinking(false); 
      isProcessingRef.current = false; 
    }
  };

  const renderInteractiveText = (text: string) => {
    const cleanDisplay = cleanText(text);
    const sortedKeys = Object.keys(DICTIONARY).sort((a, b) => b.length - a.length);
    let result: any[] = [];
    let remaining = cleanDisplay;
    
    while (remaining.length > 0) {
      let match = null;
      for (const key of sortedKeys) {
        if (remaining.toLowerCase().startsWith(key)) {
          match = { key, original: remaining.slice(0, key.length), info: DICTIONARY[key] };
          break;
        }
      }
      if (match) {
        let typeColor = "text-blue-400";
        if (match.info.type === "Verb") typeColor = "text-emerald-400";
        else if (match.info.type === "Adj") typeColor = "text-cyan-400";

        result.push(
          <span key={remaining.length} className="group relative inline-block border-b border-dotted border-emerald-400 cursor-help font-bold text-emerald-900 px-0.5">
            {match.original}
            <span className="invisible group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max bg-slate-900 text-white text-[10px] p-2 rounded-xl z-50 flex flex-col items-center">
              <span className={`text-[8px] uppercase font-black mb-1 ${typeColor}`}>{match.info.type}</span>
              {match.info.EN}
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

  const handleDownload = () => {
    const content = messages.map(m => `${m.role.toUpperCase()}: ${m.text}`).join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ThanhMarket_Convo.txt';
    a.click();
  };

  useEffect(() => { 
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); 
  }, [messages]);

  if (gameState === 'start') {
    return (
      <div className="w-full h-full bg-[#f0f9ff] flex items-center justify-center p-4">
        <div className="w-full max-w-xl bg-white rounded-[3rem] shadow-2xl p-10 text-center border-[12px] border-emerald-50">
          <img src={character.avatarUrl} className="w-48 h-48 mx-auto mb-6 rounded-3xl object-cover shadow-lg border-4 border-white rotate-3" alt="Thanh" />
          <h1 className="text-4xl font-black text-emerald-800 mb-2 uppercase tracking-tighter italic">Thanh's Fresh 🦀</h1>
          <p className="text-slate-400 mb-8 font-medium italic">{t.ui_welcome}</p>
          <div className="flex gap-4 justify-center mb-10">
            {['EN', 'RU'].map(l => (
              <button key={l} onClick={() => setSelectedLang(l as 'EN' | 'RU')} className={`px-8 py-3 rounded-2xl font-black transition-all ${selectedLang === l ? 'bg-emerald-600 text-white shadow-xl' : 'bg-slate-100 text-slate-400'}`}>
                {LANGUAGES[l as 'EN' | 'RU'].label}
              </button>
            ))}
          </div>
          <button onClick={() => { 
            setGameState('playing'); 
            setMessages([{ role: 'ai', text: t.welcome_msg, id: 'init' }]); 
            speak(t.welcome_msg, 'init'); 
          }} className="w-full py-6 bg-blue-600 text-white rounded-[2rem] font-black text-2xl shadow-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-3">
            <Play fill="white" /> {t.ui_start}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={gameContainerRef} className="w-full h-full bg-slate-900 flex items-center justify-center md:p-4 overflow-hidden relative">
      <div className="w-full h-full max-w-7xl bg-white md:rounded-[3rem] flex flex-col md:flex-row overflow-hidden shadow-2xl">
        <div className="h-[25vh] md:h-full md:w-1/3 bg-emerald-50/30 p-4 md:p-10 flex flex-row md:flex-col items-center justify-between border-b md:border-r border-emerald-100 shrink-0 z-20">
          <div className="flex flex-row md:flex-col items-center gap-6">
            <div className="relative">
              <img src={character.avatarUrl} className="w-24 h-24 md:w-64 md:h-64 rounded-[2.5rem] border-4 border-white shadow-2xl object-cover" alt="Thanh" />
              {isThinking && <div className="absolute inset-0 bg-emerald-500/10 animate-pulse rounded-[2.5rem]" />}
            </div>
            <div className="text-left md:text-center">
              <h2 className="text-2xl md:text-4xl font-black text-emerald-900 italic tracking-tighter">Thanh 🦀</h2>
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest block mt-1">{t.ui_status}</span>
            </div>
          </div>
          <button 
            onClick={() => isRecording ? recognitionRef.current?.stop() : recognitionRef.current?.start()} 
            className={`w-16 h-16 md:w-28 md:h-28 rounded-full flex items-center justify-center transition-all shadow-2xl ${isRecording ? 'bg-red-500 animate-pulse ring-8 ring-red-100' : 'bg-emerald-700 hover:bg-emerald-800'}`}
            disabled={isThinking}
          >
            {isRecording ? <MicOff color="white" size={32} /> : <Mic color="white" size={32} />}
          </button>
        </div>

        <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
          <header className="px-8 py-5 border-b flex items-center justify-between bg-white/80 backdrop-blur-md z-10">
            <div className="flex items-center gap-2">
              <Globe size={14} className="text-emerald-500" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.ui_learning_title}</span>
            </div>
            <div className="flex gap-3">
               <button onClick={handleDownload} className="p-2 text-slate-300 hover:text-emerald-600 transition-colors"><Download size={20}/></button>
               <button onClick={() => setSpeechRate(prev => prev === 1.0 ? 0.7 : 1.0)} className="bg-orange-50 text-orange-600 px-4 py-2 rounded-2xl font-black text-xs flex items-center gap-2">
                 <Gauge size={16}/> {speechRate === 1.0 ? 'Normal' : 'Slow'}
               </button>
               <button onClick={toggleFullscreen} className="p-2 text-slate-300 hover:text-blue-600"><Maximize size={20}/></button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 bg-emerald-50/5 custom-scrollbar">
            {messages.map((msg) => {
              const parts = msg.text.split('|');
              const viText = cleanText(parts.filter((_, i) => i % 2 === 0).join(' '));
              const transText = cleanText(parts.filter((_, i) => i % 2 !== 0).join(' '));
              const isActive = activeVoiceId === msg.id;
              
              return (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
                  <div className={`max-w-[85%] p-6 rounded-[2.5rem] shadow-sm transition-all ${isActive ? 'ring-4 ring-emerald-100' : ''} ${msg.role === 'user' ? 'bg-emerald-700 text-white rounded-tr-none' : 'bg-white text-slate-800 border border-emerald-50 rounded-tl-none shadow-md'}`}>
                    <div className="flex items-start justify-between gap-6">
                      <div className="text-lg font-bold leading-relaxed">
                        {msg.role === 'ai' ? renderInteractiveText(viText) : viText}
                      </div>
                      {msg.role === 'ai' && (
                        <button 
                          onClick={() => speak(msg.text, msg.id)} 
                          className="opacity-30 hover:opacity-100 transition-opacity"
                          disabled={activeVoiceId === msg.id}
                        >
                          <Volume2 size={22}/>
                        </button>
                      )}
                    </div>
                    {(transText || msg.translation) && (
                      <div className={`mt-4 pt-4 border-t text-xs italic font-medium ${msg.role === 'user' ? 'border-emerald-600 text-emerald-100' : 'border-slate-50 text-slate-400'}`}>
                        {msg.role === 'ai' ? transText : msg.translation}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {isThinking && (
              <div className="text-[10px] font-black text-emerald-500 animate-pulse ml-4 italic uppercase tracking-widest">
                Thanh đang cân hàng...
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <footer className="p-6 md:p-10 bg-white border-t flex gap-4 pb-12">
            <input 
              type="text" 
              value={userInput} 
              onChange={e => setUserInput(e.target.value)} 
              onKeyDown={e => e.key === 'Enter' && handleSendMessage(userInput)} 
              placeholder={t.ui_placeholder} 
              className="flex-1 px-8 py-5 bg-slate-50 rounded-[2rem] outline-none font-bold text-lg focus:bg-white focus:ring-4 ring-emerald-50 transition-all shadow-inner" 
              disabled={isThinking}
            />
            <button 
              onClick={() => handleSendMessage(userInput)} 
              className="bg-blue-600 text-white px-10 rounded-[2rem] shadow-xl hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isThinking || !userInput.trim()}
            >
              <Send size={24}/>
            </button>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default GameSpeakAIMeatSeafood;

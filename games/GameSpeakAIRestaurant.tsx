import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Send, Volume2, Play, Globe, Download, Gauge, Maximize, Minimize } from 'lucide-react';
import type { AIFriend } from '../types';
import { generateContentWithRetry } from '../config/apiKeys';

// --- DICTIONARY & CONFIG ---
const DICTIONARY: Record<string, { EN: string; type: string }> = {
  "phở": { EN: "pho / noodle soup", type: "Noun" },
  "bún chả": { EN: "grilled pork with noodles", type: "Noun" },
  "nem rán": { EN: "fried spring rolls", type: "Noun" },
  "bánh mì": { EN: "Vietnamese sandwich", type: "Noun" },
  "cơm tấm": { EN: "broken rice", type: "Noun" },
  "gia vị": { EN: "spices / condiments", type: "Noun" },
  "thực đơn": { EN: "menu", type: "Noun" },
  "nhà hàng": { EN: "restaurant", type: "Noun" },
  "đặc sản": { EN: "specialty", type: "Noun" },
  "rau sống": { EN: "fresh herbs / vegetables", type: "Noun" },
  "nước mắm": { EN: "fish sauce", type: "Noun" },
  "ớt": { EN: "chili", type: "Noun" },
  "ăn": { EN: "to eat", type: "Verb" },
  "gọi món": { EN: "to order food", type: "Verb" },
  "phục vụ": { EN: "to serve", type: "Verb" },
  "thưởng thức": { EN: "to enjoy (food)", type: "Verb" },
  "đặt bàn": { EN: "to book a table", type: "Verb" },
  "thanh toán": { EN: "to pay / check out", type: "Verb" },
  "tư vấn": { EN: "to consult/advise", type: "Verb" },
  "chào": { EN: "to greet", type: "Verb" },
  "ngon": { EN: "delicious", type: "Adj" },
  "đậm đà": { EN: "flavorful / rich", type: "Adj" },
  "cay": { EN: "spicy", type: "Adj" },
  "nóng hổi": { EN: "piping hot", type: "Adj" },
  "thơm": { EN: "fragrant", type: "Adj" },
  "giòn": { EN: "crispy", type: "Adj" },
  "ngọt": { EN: "sweet", type: "Adj" },
  "truyền thống": { EN: "traditional", type: "Adj" },
  "ạ": { EN: "Polite particle", type: "Ending" },
  "nha": { EN: "Friendly particle", type: "Ending" },
  "nhé": { EN: "Gentle suggestion", type: "Ending" },
  "luôn": { EN: "Right away", type: "Ending" },
  "thôi": { EN: "Just / That's all", type: "Ending" },
  "đi": { EN: "Encouragement particle", type: "Ending" }
};

const LANGUAGES = {
  EN: {
    label: "English",
    ui_welcome: "Welcome to our Vietnamese restaurant! I'm Linh.",
    ui_start: "ORDER NOW",
    ui_placeholder: "Talk to Linh here...",
    ui_status: "Online - Food Expert Waiter",
    ui_learning_title: "Chat with Linh Waiter",
    welcome_msg: "Dạ, em chào Anh! Nhà em có đủ các món đặc sản 63 tỉnh thành Việt Nam. Anh muốn dùng món vùng nào ạ? ✨ | Hi! Welcome. We have specialties from all 63 provinces of Vietnam. Which region's food would you like? ✨",
    systemPromptLang: "English"
  },
  RU: {
    label: "Русский",
    ui_welcome: "Добро пожаловать! Я Линь, ваш официант.",
    ui_start: "ЗАKAЗАТЬ",
    ui_placeholder: "Поговори с Линь здесь...",
    ui_status: "В сети - Эксперт",
    ui_learning_title: "Общение с официантом",
    welcome_msg: "Dạ, em chào Anh! Nhà em có đủ món ngon từ khắp Việt Nam. Anh muốn thử hương vị vùng nào ạ? ✨ | Здравствуйте! У нас есть блюда из tất cả các góc của Việt Nam. ✨",
    systemPromptLang: "Russian"
  }
};

export const GameSpeakAIRestaurant: React.FC<{ character: AIFriend }> = ({ character }) => {
  const [gameState, setGameState] = useState<'start' | 'playing'>('start'); 
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
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const autoSendTimerRef = useRef<NodeJS.Timeout | null>(null);

  const t = LANGUAGES[selectedLang];

  // --- 1+2. CHUNK LOGIC (180 CHARS & SMART CUT) ---
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

  // --- 3+4. ASYNC QUEUE & FALLBACK ---
  const speak = async (fullText: string, msgId: string | null = null) => {
    if (!fullText) return;
    if (msgId) setActiveVoiceId(msgId);
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    audioRef.current.pause();

    const parts = fullText.split('|');
    const vietnameseToRead = parts.filter((_, i) => i % 2 === 0).join(' ')
      .replace(/(\d+)k\b/g, '$1 nghìn').replace(/[*#]/g, '').trim();

    const chunks = createChunks(vietnameseToRead);
    
    for (const chunk of chunks) {
      await new Promise<void>((resolve) => {
        const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(chunk)}&tl=vi&client=tw-ob`;
        audioRef.current.src = url;
        audioRef.current.playbackRate = speechRate;
        audioRef.current.onended = () => resolve();
        audioRef.current.onerror = () => {
          const fallback = new SpeechSynthesisUtterance(chunk);
          fallback.lang = 'vi-VN';
          fallback.onend = () => resolve();
          window.speechSynthesis.speak(fallback);
        };
        audioRef.current.play().catch(() => {
          const fb = new SpeechSynthesisUtterance(chunk);
          fb.lang = 'vi-VN';
          fb.onend = () => resolve();
          window.speechSynthesis.speak(fb);
        });
      });
    }
    setActiveVoiceId(null);
  };

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
  }, [messages]);

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
          systemInstruction: `You are Linh, a 20-year-old professional waiter and culinary expert.
          SERVICE RULES:
          1. Don't mention prices until checkout (Tính tiền).
          2. Ask for drinks after food. 
          3. Recap entire order at the end.
          4. When confirmed: "Dạ, em sẽ mang đồ ăn ra ngay sau ít phút ạ."
          FORMAT: Vietnamese sentence | ${t.systemPromptLang} translation.
          At the end, add: USER_TRANSLATION: [Translation of user's last message]`
        }
      });

      if (response.text) {
        const raw = response.text;
        const userTransMatch = raw.match(/USER_TRANSLATION:\s*(.*)$/i);
        const userTransValue = userTransMatch ? userTransMatch[1].replace(/[\[\]]/g, '').trim() : "";
        const aiResponseFull = raw.split(/USER_TRANSLATION:/i)[0].trim();
        const aiMsgId = `ai-${Date.now()}`;

        setMessages(prev => {
          return prev.map(m => m.id === userMsgId ? { ...m, translation: userTransValue } : m)
                     .concat({ role: 'ai', text: aiResponseFull, id: aiMsgId });
        });
        await speak(aiResponseFull, aiMsgId);

        if (aiResponseFull.toLowerCase().includes("mang đồ ăn ra ngay")) {
          setTimeout(async () => {
            const serveId = `serve-${Date.now()}`;
            const serveMsg = "Dạ! Đồ ăn của anh đây ạ. Chúc anh ngon miệng! ✨ | Here is your food. Enjoy! ✨";
            setMessages(prev => [...prev, { role: 'ai', text: serveMsg, id: serveId }]);
            await speak(serveMsg, serveId);
          }, 5000);
        }
      }
    } catch (e) { console.error(e); }
    finally { setIsThinking(false); isProcessingRef.current = false; }
  };

  const renderInteractiveText = (text: string) => {
    const sortedKeys = Object.keys(DICTIONARY).sort((a, b) => b.length - a.length);
    let result: any[] = [];
    let remaining = text;
    while (remaining.length > 0) {
      let match = null;
      for (const key of sortedKeys) {
        if (remaining.toLowerCase().startsWith(key)) {
          match = { key, original: remaining.slice(0, key.length), info: DICTIONARY[key] };
          break;
        }
      }
      if (match) {
        result.push(
          <span key={remaining.length} className="group relative inline-block border-b border-dotted border-blue-400 cursor-help font-bold text-blue-800 px-0.5">
            {match.original}
            <span className="invisible group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max bg-slate-800 text-white text-[10px] p-2 rounded-xl z-50 flex flex-col items-center">
              <span className="text-[8px] text-blue-300 uppercase font-black">{match.info.type}</span>
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
    if (!document.fullscreenElement) gameContainerRef.current?.requestFullscreen();
    else document.exitFullscreen();
  };

  const handleDownload = () => {
    const content = messages.map(m => `${m.role.toUpperCase()}: ${m.text}`).join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'LinhRestaurant_Convo.txt';
    a.click();
  };

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  if (gameState === 'start') {
    return (
      <div className="w-full h-full bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-xl bg-white rounded-[3rem] shadow-2xl p-10 text-center border-[10px] border-white">
          <img src={character.avatarUrl} className="w-44 h-44 mx-auto mb-6 rounded-full border-4 border-blue-100 object-cover shadow-lg" alt="Linh" />
          <h1 className="text-4xl font-black text-blue-900 mb-2 italic uppercase tracking-tighter">Linh's Kitchen 🍜</h1>
          <p className="text-slate-400 mb-10 font-medium italic">{t.ui_welcome}</p>
          <div className="flex gap-4 justify-center mb-10">
            {['EN', 'RU'].map(l => (
              <button key={l} onClick={() => setSelectedLang(l as 'EN' | 'RU')} className={`px-8 py-3 rounded-2xl font-black transition-all ${selectedLang === l ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400'}`}>
                {LANGUAGES[l as 'EN' | 'RU'].label}
              </button>
            ))}
          </div>
          <button onClick={() => { setGameState('playing'); setMessages([{ role: 'ai', text: t.welcome_msg, id: 'init' }]); speak(t.welcome_msg, 'init'); }} className="w-full py-6 bg-emerald-600 text-white rounded-[2rem] font-black text-2xl shadow-xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-3">
            <Play fill="white" /> {t.ui_start}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={gameContainerRef} className="w-full h-full bg-slate-900 flex items-center justify-center md:p-4 overflow-hidden relative">
      <div className="w-full h-full max-w-6xl bg-white md:rounded-[3rem] flex flex-col md:flex-row overflow-hidden shadow-2xl">
        <div className="h-[20vh] md:h-full md:w-1/3 bg-blue-50/50 p-4 md:p-10 flex flex-row md:flex-col items-center justify-between border-b md:border-r border-blue-100 shrink-0 z-20">
          <div className="flex flex-row md:flex-col items-center gap-6">
            <div className="relative">
               <img src={character.avatarUrl} className="w-20 h-20 md:w-56 md:h-56 rounded-full border-4 border-white shadow-xl object-cover" alt="Linh" />
               {isThinking && <div className="absolute inset-0 bg-blue-500/10 animate-pulse rounded-full" />}
            </div>
            <div className="text-left md:text-center">
              <h2 className="text-xl md:text-3xl font-black text-blue-900 italic">Em Linh 🍜</h2>
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block">{t.ui_status}</span>
            </div>
          </div>
          <button onClick={() => isRecording ? recognitionRef.current?.stop() : recognitionRef.current?.start()} className={`w-14 h-14 md:w-24 md:h-24 rounded-full flex items-center justify-center transition-all shadow-xl ${isRecording ? 'bg-red-500 animate-pulse ring-8 ring-red-100' : 'bg-blue-700 hover:bg-blue-800'}`}>
            {isRecording ? <MicOff color="white" size={28} /> : <Mic color="white" size={28} />}
          </button>
        </div>

        <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
          <header className="px-6 py-4 border-b border-slate-50 flex items-center justify-between bg-white z-10 shadow-sm">
            <div className="flex items-center gap-2">
              <Globe size={14} className="text-blue-500" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.ui_learning_title}</span>
            </div>
            <div className="flex gap-2">
               <button onClick={handleDownload} className="p-2 text-slate-400 hover:text-emerald-600"><Download size={18}/></button>
               <button onClick={() => setSpeechRate(prev => prev === 1.0 ? 0.7 : 1.0)} className="bg-orange-50 text-orange-600 px-3 py-1.5 rounded-xl font-black text-[10px] flex items-center gap-2">
                 <Gauge size={14}/> {speechRate === 1.0 ? '100%' : '70%'}
               </button>
               <button onClick={toggleFullscreen} className="p-2 text-slate-400 hover:text-blue-600"><Maximize size={18}/></button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-6 bg-blue-50/5 custom-scrollbar">
            {messages.map((msg) => {
              const parts = msg.text.split('|');
              const viText = parts.filter((_, i) => i % 2 === 0).join(' ').trim();
              const transText = parts.filter((_, i) => i % 2 !== 0).join(' ').trim();
              const isActive = activeVoiceId === msg.id;
              return (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-5 md:p-6 rounded-[2rem] transition-all shadow-sm ${isActive ? 'ring-4 ring-blue-100' : ''} ${msg.role === 'user' ? 'bg-blue-700 text-white rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none border border-blue-50'}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="text-base md:text-lg font-bold leading-relaxed">{msg.role === 'ai' ? renderInteractiveText(viText) : viText}</div>
                      {msg.role === 'ai' && <button onClick={() => speak(msg.text, msg.id)} className="opacity-50 hover:opacity-100 transition-opacity"><Volume2 size={20}/></button>}
                    </div>
                    {(transText || msg.translation) && (
                      <div className={`mt-3 pt-3 border-t text-[11px] italic font-medium ${msg.role === 'user' ? 'border-blue-500 text-blue-100' : 'border-slate-100 text-slate-400'}`}>
                        {msg.role === 'ai' ? transText : msg.translation}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {isThinking && <div className="text-[10px] font-black text-blue-400 animate-pulse ml-4 italic uppercase tracking-widest">Linh đang ghi order...</div>}
            <div ref={chatEndRef} />
          </div>

          <footer className="p-6 md:p-8 bg-white border-t flex gap-3 pb-10">
            <input type="text" value={userInput} onChange={e => setUserInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendMessage(userInput)} placeholder={t.ui_placeholder} className="flex-1 px-6 py-4 bg-slate-50 rounded-[1.5rem] outline-none font-bold focus:bg-white focus:ring-4 ring-blue-50 transition-all shadow-inner" />
            <button onClick={() => handleSendMessage(userInput)} className="bg-emerald-600 text-white px-8 rounded-[1.5rem] shadow-lg hover:scale-105 active:scale-95 transition-all"><Send size={20}/></button>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default GameSpeakAIRestaurant;

import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Send, Volume2, Play, Globe, Download, Volume1, Gauge, Maximize, Minimize } from 'lucide-react';
import type { AIFriend } from '../types';

// --- DICTIONARY DATA ---
const DICTIONARY = {
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
  },
  RU: {
    label: "Русский",
    ui_welcome: "Добро пожаловать! Я Линь, ваш официант.",
    ui_start: "ЗАKAЗАТЬ",
    ui_placeholder: "Поговори с Линь здесь...",
    ui_status: "В сети - Эксперт",
    ui_learning_title: "Общение с официантом",
    welcome_msg: "Dạ, em chào Anh! Nhà em có đủ món ngon từ khắp Việt Nam. Anh muốn thử hương vị vùng nào ạ? ✨ | Здравствуйте! У нас есть блюда из всех уголков Вьетнама. ✨",
  }
};

export const GameRestaurant: React.FC<{ character: AIFriend }> = ({ character }) => {
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
  const silenceTimerRef = useRef<number | null>(null);

  const LINH_IMAGE_URL = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop";
  const t = LANGUAGES[selectedLang];

  // --- FULLSCREEN ---
  useEffect(() => {
    const handleFs = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFs);
    return () => document.removeEventListener('fullscreenchange', handleFs);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen();
    else document.exitFullscreen();
  };

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
        let interimTranscript = "";
        let finalTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript;
          else interimTranscript += event.results[i][0].transcript;
        }
        const currentProgress = finalTranscript || interimTranscript;
        if (currentProgress) setUserInput(currentProgress);
        
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = window.setTimeout(() => {
          const textToProcess = (finalTranscript || interimTranscript).trim();
          if (textToProcess && !isProcessingRef.current) {
            recognition.stop();
            handleSendMessage(textToProcess);
          }
        }, 2500);
      };
      recognition.onend = () => setIsRecording(false);
      recognitionRef.current = recognition;
    }
  }, [selectedLang]);

  // --- TTS GOOGLE TRANSLATE ---
  const formatPriceForSpeech = (text: string) => {
    return text.replace(/(\d+)\s*k/gi, '$1 nghìn').replace(/(\d+)[,.]000/g, '$1 nghìn');
  };

  const speakWord = async (text: string, msgId: string | null = null) => {
    if (!text) return;
    if (msgId) setActiveVoiceId(msgId);
    let cleanText = text.split('|')[0].replace(/USER_TRANSLATION:.*$/gi, '').trim();
    cleanText = formatPriceForSpeech(cleanText);

    const segments = cleanText.split(/[,.!?;:]+/).map(s => s.trim()).filter(s => s.length > 0);
    for (const segment of segments) {
      await new Promise<void>((resolve) => {
        const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(segment)}&tl=vi&client=tw-ob`;
        audioRef.current.src = url;
        audioRef.current.playbackRate = speechRate;
        audioRef.current.onended = () => resolve();
        audioRef.current.onerror = () => resolve();
        audioRef.current.play().catch(() => resolve());
      });
    }
    setActiveVoiceId(null);
  };

  // --- AI LOGIC (REPLACED GOOGLEGENAI) ---
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
          topic: "Waitress Linh at a Vietnamese Restaurant" 
        })
      });

      const data = await response.json();
      if (data.text) {
        const aiMsgId = `ai-${Date.now()}`;
        setMessages(prev => [...prev, { role: 'ai', text: data.text, id: aiMsgId }]);
        await speakWord(data.text, aiMsgId);

        if (data.text.toLowerCase().includes("mang đồ ăn ra ngay")) {
          setTimeout(async () => {
            const svId = `sv-${Date.now()}`;
            const svText = "Dạ! Đồ ăn của anh đây ạ. Chúc anh ngon miệng! ✨ | Here is your food. Enjoy! ✨";
            setMessages(prev => [...prev, { role: 'ai', text: svText, id: svId }]);
            await speakWord(svText, svId);
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

  // --- DICTIONARY RENDERER ---
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
        const colors: any = { Noun: "text-blue-600", Verb: "text-emerald-600", Adj: "text-cyan-600", Ending: "text-fuchsia-600" };
        result.push(
          <span key={remaining.length} className="group relative inline-block border-b border-dotted border-blue-200 hover:border-blue-500 cursor-help px-0.5">
            {match.original}
            <span className="invisible group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max bg-slate-800 text-white text-[10px] p-2 rounded-xl z-50">
              <div className={`font-black uppercase text-[8px] ${colors[match.info.type]}`}>{match.info.type}</div>
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

  // --- UI RENDER ---
  if (gameState === 'start') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl p-12 text-center border-[10px] border-blue-50">
          <img src={LINH_IMAGE_URL} className="w-48 h-48 mx-auto mb-6 rounded-full border-4 border-blue-100 object-cover" alt="Linh" />
          <h1 className="text-3xl font-black text-blue-800 mb-2 italic uppercase">Linh's Kitchen 🍜</h1>
          <p className="text-slate-400 mb-8 italic">{t.ui_welcome}</p>
          <div className="flex gap-4 justify-center mb-8">
            {['EN', 'RU'].map(l => (
              <button key={l} onClick={() => setSelectedLang(l as any)} className={`px-6 py-2 rounded-xl font-bold transition-all ${selectedLang === l ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}>
                {LANGUAGES[l as 'EN' | 'RU'].label}
              </button>
            ))}
          </div>
          <button onClick={() => { setGameState('playing'); setMessages([{ role: 'ai', text: t.welcome_msg, id: 'init' }]); speakWord(t.welcome_msg, 'init'); }} className="w-full py-5 bg-emerald-600 text-white rounded-3xl font-black text-xl shadow-xl hover:scale-105 active:scale-95 transition-all">
            {t.ui_start}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-slate-900 flex items-center justify-center md:p-4 overflow-hidden relative">
      <div className="w-full h-full max-w-6xl bg-white md:rounded-[2.5rem] flex flex-col md:flex-row overflow-hidden border-0 md:border-[10px] border-blue-50">
        
        {/* SIDEBAR */}
        <div className="h-[20vh] md:h-full md:w-1/3 bg-blue-50/30 p-4 md:p-8 flex flex-row md:flex-col items-center justify-between border-b md:border-r border-blue-50">
          <div className="flex flex-row md:flex-col items-center gap-4">
            <img src={LINH_IMAGE_URL} className="w-20 h-20 md:w-56 md:h-56 rounded-3xl border-4 border-white shadow-xl object-cover" alt="Linh" />
            <div className="text-left md:text-center">
              <h2 className="text-xl md:text-2xl font-black text-blue-900 italic">Linh 🍜</h2>
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">{t.ui_status}</span>
            </div>
          </div>
          <button onClick={() => { setIsRecording(!isRecording); isRecording ? recognitionRef.current?.stop() : recognitionRef.current?.start(); }} className={`w-14 h-14 md:w-24 md:h-24 rounded-full flex items-center justify-center transition-all ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-blue-700 shadow-xl'}`}>
            {isRecording ? <MicOff color="white" /> : <Mic color="white" size={30} />}
          </button>
        </div>

        {/* CHAT */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
            <div>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t.ui_learning_title}</span>
              <div className="text-xs font-black text-blue-600 mt-1">VIETNAMESE CUISINE EXPERT 🌿</div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setSpeechRate(prev => prev === 1.0 ? 0.7 : 1.0)} className="bg-orange-50 text-orange-600 px-3 py-1.5 rounded-xl font-black text-[10px] flex items-center gap-1"><Gauge size={14}/> {speechRate * 100}%</button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 bg-blue-50/5">
            {messages.map((msg) => {
              const parts = msg.text.split('|');
              const isActive = activeVoiceId === msg.id;
              return (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-4 md:p-6 rounded-[2rem] transition-all ${isActive ? 'ring-4 ring-blue-100' : ''} ${msg.role === 'user' ? 'bg-blue-700 text-white rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none border border-blue-50 shadow-sm'}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="text-base font-bold leading-relaxed">{msg.role === 'ai' ? renderInteractiveText(parts[0]) : parts[0]}</div>
                      <button onClick={() => speakWord(msg.text, msg.id)} className={`p-2 rounded-xl ${msg.role === 'user' ? 'text-blue-200 hover:bg-blue-600' : 'text-blue-600 hover:bg-blue-50'}`}><Volume2 size={18}/></button>
                    </div>
                    {parts[1] && <div className={`mt-2 pt-2 border-t text-[11px] italic font-medium ${msg.role === 'user' ? 'border-blue-500 text-blue-200' : 'border-slate-50 text-slate-400'}`}>{parts[1]}</div>}
                  </div>
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>

          <div className="p-4 md:p-8 bg-white border-t border-slate-50 flex gap-3">
            <input type="text" value={userInput} onChange={(e) => setUserInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(userInput)} placeholder={t.ui_placeholder} className="flex-1 px-6 py-4 bg-slate-50 rounded-2xl outline-none font-medium" />
            <button onClick={() => handleSendMessage(userInput)} className="bg-emerald-600 text-white px-6 rounded-2xl shadow-lg hover:bg-emerald-700 transition-all disabled:opacity-50" disabled={isThinking}><Send size={20}/></button>
          </div>
        </div>
      </div>
      <button onClick={toggleFullscreen} className="absolute bottom-4 right-4 p-2 bg-black/10 text-white/50 rounded-full hover:bg-black/20 transition-all">
        {isFullscreen ? <Minimize size={16}/> : <Maximize size={16}/>}
      </button>
    </div>
  );
};

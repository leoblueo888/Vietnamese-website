import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Send, Volume2, Play, Globe, Download, Volume1, Gauge, Maximize, Minimize } from 'lucide-react';
// IMPORT hệ thống key mới
import { generateContentWithRetry } from '../config/apiKeys';
import type { AIFriend } from '../types';

// --- DATA & CONFIG ---
const DICTIONARY: Record<string, { EN: string; type: string }> = {
  "nước ép": { EN: "fruit juice", type: "Noun" },
  "sinh tố": { EN: "smoothie", type: "Noun" },
  "cà phê": { EN: "coffee", type: "Noun" },
  "đá": { EN: "ice", type: "Noun" },
  "đường": { EN: "sugar", type: "Noun" },
  "sữa": { EN: "milk", type: "Noun" },
  "trái cây": { EN: "fruit", type: "Noun" },
  "thực đơn": { EN: "menu", type: "Noun" },
  "uống": { EN: "to drink", type: "Verb" },
  "ngon": { EN: "delicious", type: "Adj" },
  "mát": { EN: "cool / refreshing", type: "Adj" },
  "tươi": { EN: "fresh", type: "Adj" }
};

const LANGUAGES = {
  EN: {
    label: "English",
    ui_welcome: "Welcome to my juice bar! I'm Xuan.",
    ui_start: "ORDER NOW",
    ui_placeholder: "Talk to Xuan here...",
    ui_status: "Online - Barista Mode",
    ui_learning_title: "Chat with Xuan Barista",
    welcome_msg: "Dạ, em chào Anh! Anh muốn dùng nước ép hay sinh tố gì ạ? Hôm nay nhà em có nhiều trái cây tươi ngon lắm! ✨ | Hi! Welcome. Would you like a juice or a smoothie today? ✨",
    systemPromptLang: "English"
  },
  RU: {
    label: "Русский",
    ui_welcome: "Добро пожаловать! Я Суан.",
    ui_start: "ЗАKAЗАТЬ",
    ui_placeholder: "Поговори с Суан...",
    ui_status: "В сети - Бариста",
    ui_learning_title: "Общение với бариста",
    welcome_msg: "Dạ, em chào Anh! Anh muốn dùng nước ép hay sinh tố gì ạ? ✨ | Здравствуйте! Какой сок hoặc смузи вы бы хотели? ✨",
    systemPromptLang: "Russian"
  }
};

const getSystemPrompt = (targetLangName: string) => `
You are Xuan, a 20-year-old beautiful barista.
ROLE: You only sell drinks. Do not teach or explain grammar.
STRICT FLOW:
1. When user orders: Ask "ít đá" or "nhiều đá".
2. Then: Ask "tại đây" or "mang đi".
3. If "tại đây": Say "Mời anh ngồi, em sẽ mang đồ uống tới ngay."

PRICE: All drinks are 30 nghìn. Only mention if asked.
STRICT FORMAT: Vietnamese_Text | ${targetLangName}_Translation | USER_TRANSLATION: [Brief translation of user's last message]
No stars (*) or special markdown.
`;

export const GameSpeakAISmoothie: React.FC<{ character: AIFriend }> = ({ character }) => {
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

  const t = LANGUAGES[selectedLang];

  // --- FULLSCREEN ---
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      gameContainerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // --- RECOGNITION ---
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = 'vi-VN';
      recognition.onresult = (e: any) => handleSendMessage(e.results[0][0].transcript);
      recognition.onend = () => setIsRecording(false);
      recognitionRef.current = recognition;
    }
  }, []);

  // --- TTS ---
  const speak = useCallback(async (text: string, msgId: string | null = null) => {
    if (msgId) setActiveVoiceId(msgId);
    const cleanText = text.split('|')[0].replace(/[*#]/g, '').trim();
    if(!cleanText) return;

    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(cleanText)}&tl=vi&client=tw-ob`;
    audioRef.current.src = url;
    audioRef.current.playbackRate = speechRate;
    audioRef.current.onended = () => setActiveVoiceId(null);
    audioRef.current.play().catch(() => setActiveVoiceId(null));
  }, [speechRate]);

  // --- AI ENGINE ---
  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isProcessingRef.current) return;
    isProcessingRef.current = true;
    setIsThinking(true);

    const userMsgId = `user-${Date.now()}`;
    setMessages(prev => [...prev, { role: 'user', text: text.trim(), id: userMsgId, translation: null }]);
    setUserInput("");

    try {
      // Lọc history để AI chỉ nhận nội dung thuần tiếng Việt
      const history = messages.map(m => ({
        role: m.role === 'ai' ? 'model' : 'user',
        parts: [{ text: m.text.split('|')[0].trim() }]
      }));

      const response = await generateContentWithRetry({
        model: 'gemini-3-flash-preview',
        contents: [...history, { role: 'user', parts: [{ text: text.trim() }] }],
        config: { systemInstruction: getSystemPrompt(t.systemPromptLang) }
      });

      const rawAiResponse = response.text || "";
      const parts = rawAiResponse.split('|');
      const aiVi = parts[0]?.trim() || "";
      const aiTrans = parts[1]?.trim() || "";
      
      const userTransMatch = rawAiResponse.match(/USER_TRANSLATION:\s*\[(.*?)\]/is);
      const userTranslationValue = userTransMatch ? userTransMatch[1].trim() : "";

      const aiMsgId = `ai-${Date.now()}`;
      const cleanDisplay = `${aiVi} | ${aiTrans}`;

      setMessages(prev => {
        const updated = [...prev];
        const userIdx = updated.findIndex(m => m.id === userMsgId);
        if (userIdx !== -1) updated[userIdx] = { ...updated[userIdx], translation: userTranslationValue };
        return [...updated, { role: 'ai', text: cleanDisplay, id: aiMsgId }];
      });

      speak(cleanDisplay, aiMsgId);

      // Logic phục vụ tự động
      if (aiVi.toLowerCase().includes("mang đồ uống tới ngay")) {
        setTimeout(() => {
          const serviceId = `ai-service-${Date.now()}`;
          const serviceText = "Dạ, đồ uống của Anh đây ạ. Chúc Anh ngon miệng nhé! 🥤 | Here is your drink. Enjoy! ✨";
          setMessages(prev => [...prev, { role: 'ai', text: serviceText, id: serviceId }]);
          speak(serviceText, serviceId);
        }, 4000);
      }

    } catch (e) {
      console.error(e);
    } finally {
      setIsThinking(false);
      isProcessingRef.current = false;
    }
  };

  const renderInteractiveText = (text: string) => {
    return text.split(/(\s+)/).map((word, idx) => {
      const clean = word.toLowerCase().replace(/[.,!?;]/g, '');
      const entry = DICTIONARY[clean];
      if (entry) {
        return (
          <span key={idx} className="group relative border-b border-dotted border-blue-400 cursor-help text-blue-700 font-bold">
            {word}
            <span className="invisible group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 bg-slate-800 text-white text-[10px] rounded-lg z-50 w-max shadow-xl">
              {entry.EN}
            </span>
          </span>
        );
      }
      return <span key={idx}>{word}</span>;
    });
  };

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  if (gameState === 'start') {
    return (
      <div className="w-full h-full bg-blue-50 flex items-center justify-center p-4">
        <div className="w-full max-w-xl bg-white rounded-[3rem] shadow-2xl p-10 text-center border-[10px] border-white">
          <img src={character.avatarUrl} className="w-44 h-44 mx-auto mb-6 rounded-full border-4 border-blue-400 object-cover shadow-lg" alt="Xuan" />
          <h1 className="text-4xl font-black text-blue-600 mb-2 italic">Healthy Juice: Xuân 🥤</h1>
          <p className="text-slate-400 mb-10 font-medium italic">{t.ui_welcome}</p>
          <div className="flex gap-4 justify-center mb-10">
            {(['EN', 'RU'] as const).map(l => (
              <button key={l} onClick={() => setSelectedLang(l)} className={`px-8 py-3 rounded-2xl font-black transition-all ${selectedLang === l ? 'bg-blue-600 text-white shadow-lg scale-105' : 'bg-blue-50 text-blue-400'}`}>
                {LANGUAGES[l].label}
              </button>
            ))}
          </div>
          <button onClick={() => { setGameState('playing'); setMessages([{ role: 'ai', text: t.welcome_msg, id: 'init' }]); speak(t.welcome_msg, 'init'); }} className="w-full py-6 bg-emerald-500 text-white rounded-[2rem] font-black text-2xl shadow-xl hover:bg-emerald-600 transition-all flex items-center justify-center gap-3">
            <Play fill="white" /> {t.ui_start}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={gameContainerRef} className="w-full h-full bg-slate-900 flex items-center justify-center md:p-4 overflow-hidden relative">
      <div className="w-full h-full max-w-6xl bg-white md:rounded-[3rem] flex flex-col md:flex-row overflow-hidden shadow-2xl">
        <div className="h-[20vh] md:h-full md:w-1/3 bg-blue-50/50 p-4 md:p-10 flex flex-row md:flex-col items-center justify-between border-b md:border-r border-blue-100 shrink-0 z-20 shadow-xl">
          <div className="flex flex-row md:flex-col items-center gap-6">
            <div className="relative">
              <img src={character.avatarUrl} className="w-20 h-20 md:w-56 md:h-56 rounded-full border-4 border-white shadow-xl object-cover" alt="Xuan" />
              {isThinking && <div className="absolute inset-0 bg-blue-400/20 animate-pulse rounded-full" />}
            </div>
            <div className="text-left md:text-center">
              <h2 className="text-xl md:text-3xl font-black text-slate-800 italic">Xuân🍓</h2>
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest block">{t.ui_status}</span>
            </div>
          </div>
          <button onClick={() => isRecording ? recognitionRef.current?.stop() : recognitionRef.current?.start()} className={`w-14 h-14 md:w-24 md:h-24 rounded-full flex items-center justify-center transition-all shadow-xl ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-blue-600 hover:bg-blue-700'}`}>
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
               <button onClick={() => setSpeechRate(prev => prev === 1.0 ? 0.7 : 1.0)} className="bg-orange-50 text-orange-600 px-3 py-1.5 rounded-xl font-black text-[10px] flex items-center gap-2">
                 <Gauge size={14}/> {speechRate === 1.0 ? '100%' : '70%'}
               </button>
               <button onClick={toggleFullscreen} className="p-2 text-slate-400 hover:text-blue-600 transition-colors"><Maximize size={18}/></button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-6 bg-blue-50/10 custom-scrollbar">
            {messages.map((msg) => {
              const parts = msg.text.split('|');
              const isActive = activeVoiceId === msg.id;
              return (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-5 md:p-6 rounded-[2rem] transition-all shadow-sm ${isActive ? 'ring-4 ring-blue-100' : ''} ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none border border-blue-100'}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="text-base md:text-lg font-bold leading-relaxed">{msg.role === 'ai' ? renderInteractiveText(parts[0]) : msg.text}</div>
                      <button onClick={() => speak(msg.text, msg.id)} className="opacity-50 hover:opacity-100 transition-opacity"><Volume2 size={20}/></button>
                    </div>
                    {(parts[1] || msg.translation) && (
                      <div className={`mt-3 pt-3 border-t text-[11px] italic font-medium ${msg.role === 'user' ? 'border-blue-500 text-blue-100' : 'border-slate-50 text-slate-400'}`}>
                        {msg.role === 'ai' ? parts[1] : msg.translation}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>

          <footer className="p-6 md:p-8 bg-white border-t flex gap-3 pb-10 md:pb-8">
            <input type="text" value={userInput} onChange={e => setUserInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendMessage(userInput)} placeholder={t.ui_placeholder} className="flex-1 px-6 py-4 bg-slate-100 rounded-[1.5rem] outline-none font-bold transition-all focus:bg-white focus:ring-4 ring-blue-50 shadow-inner" />
            <button onClick={() => handleSendMessage(userInput)} className="bg-emerald-500 text-white px-8 rounded-[1.5rem] shadow-lg hover:scale-105 transition-all"><Send size={20}/></button>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default GameSpeakAISmoothie;

import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Send, Volume2, Play, Download, Volume1, Gauge, Maximize, Minimize } from 'lucide-react';
import type { AIFriend } from '../types';

// --- DICTIONARY: TỪ VỰNG QUÁN NƯỚC ---
const DICTIONARY: Record<string, { EN: string; type: string }> = {
  "nước ép": { EN: "fruit juice", type: "Noun" },
  "sinh tố": { EN: "smoothie", type: "Noun" },
  "cà phê": { EN: "coffee", type: "Noun" },
  "đá": { EN: "ice", type: "Noun" },
  "đường": { EN: "sugar", type: "Noun" },
  "sữa": { EN: "milk", type: "Noun" },
  "trái cây": { EN: "fruit", type: "Noun" },
  "thực đơn": { EN: "menu", type: "Noun" },
  "ngon": { EN: "delicious", type: "Adj" },
  "mát": { EN: "cool / refreshing", type: "Adj" },
  "tươi": { EN: "fresh", type: "Adj" },
  "ít đá": { EN: "less ice", type: "Noun" },
  "nhiều đá": { EN: "more ice", type: "Noun" },
  "tại đây": { EN: "dine-in", type: "Adv" },
  "mang đi": { EN: "to-go / takeaway", type: "Adv" }
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
    welcome_msg: "Dạ, em chào Anh! Anh muốn dùng nước ép hay sinh tố gì ạ? ✨ | Hi! Welcome. Would you like a juice or a smoothie today? ✨",
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
    welcome_msg: "Dạ, em chào Anh! Anh muốn dùng nước ép hay sinh tố gì ạ? ✨ | Здравствуйте! Какой сок или смузи вы бы хотели сегодня? ✨",
    systemPromptLang: "Russian"
  }
};

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

  const XUAN_IMAGE_URL = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop";
  const t = LANGUAGES[selectedLang];

  // --- XỬ LÝ FULLSCREEN ---
  useEffect(() => {
    const handleFs = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFs);
    return () => document.removeEventListener('fullscreenchange', handleFs);
  }, []);

  const toggleFullscreen = () => {
    if (!gameContainerRef.current) return;
    if (!document.fullscreenElement) gameContainerRef.current.requestFullscreen();
    else document.exitFullscreen();
  };

  // --- NHẬN DIỆN GIỌNG NÓI ---
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = 'vi-VN';
      recognition.onstart = () => setIsRecording(true);
      recognition.onresult = (e: any) => {
        const text = e.results[0][0].transcript;
        setUserInput(text);
        handleSendMessage(text);
      };
      recognition.onend = () => setIsRecording(false);
      recognitionRef.current = recognition;
    }
  }, [selectedLang]);

  // --- PHÁT ÂM TIẾNG VIỆT ---
  const speakWord = async (text: string, msgId: string | null = null) => {
    if (!text) return;
    if (msgId) setActiveVoiceId(msgId);
    // Chỉ lấy phần tiếng Việt trước dấu | để đọc
    const cleanText = text.split('|')[0].replace(/[*]/g, '').trim();
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(cleanText)}&tl=vi&client=tw-ob`;
    audioRef.current.src = url;
    audioRef.current.playbackRate = speechRate;
    audioRef.current.play().catch(console.error);
    audioRef.current.onended = () => setActiveVoiceId(null);
  };

  // --- GỬI TIN NHẮN & GỌI AI ---
  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isProcessingRef.current) return;
    isProcessingRef.current = true;
    setIsThinking(true);

    const userMsgId = `user-${Date.now()}`;
    setMessages(prev => [...prev, { role: 'user', text, id: userMsgId }]);
    setUserInput("");

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          lang: selectedLang.toLowerCase(),
          systemPrompt: `
            You are Xuân, a 20-year-old barista. Use "Dạ", "ạ", "Anh" and "Em".
            FORMAT: Vietnamese | ${t.systemPromptLang} Translation.
            RULE 1: ALWAYS respond in Vietnamese first.
            RULE 2: Use the "|" character to separate Vietnamese and the translation.
            RULE 3: If the user orders a drink, ask "ít đá hay nhiều đá?". 
            RULE 4: Then ask "uống tại đây hay mang đi?".
          `
        })
      });

      const data = await response.json();
      if (data.text) {
        const aiMsgId = `ai-${Date.now()}`;
        setMessages(prev => [...prev, { role: 'ai', text: data.text, id: aiMsgId }]);
        speakWord(data.text, aiMsgId);
      }
    } catch (e) {
      console.error("Lỗi gọi API:", e);
    } finally {
      setIsThinking(false);
      isProcessingRef.current = false;
    }
  };

  // --- TỰ ĐỘNG CUỘN XUỐNG ---
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  // --- HIỂN THỊ TỪ ĐIỂN KHI DI CHUỘT ---
  const renderInteractiveText = (text: string) => {
    if (!text) return null;
    const words = text.split(/(\s+)/);
    return words.map((word, idx) => {
      const cleanWord = word.toLowerCase().replace(/[.,!?;]/g, '');
      const entry = DICTIONARY[cleanWord];
      if (entry) {
        return (
          <span key={idx} className="group relative border-b border-dotted border-blue-300 cursor-help text-blue-700">
            {word}
            <span className="invisible group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 bg-slate-800 text-white text-[10px] rounded-lg shadow-xl z-50 w-max">
              {entry.EN} ({entry.type})
            </span>
          </span>
        );
      }
      return <span key={idx}>{word}</span>;
    });
  };

  if (gameState === 'start') {
    return (
      <div className="w-full h-full bg-blue-50 flex items-center justify-center p-4">
        <div className="w-full max-w-xl bg-white rounded-[3rem] shadow-2xl p-10 text-center border-[12px] border-blue-100">
          <img src={XUAN_IMAGE_URL} className="w-40 h-40 mx-auto mb-6 rounded-full border-4 border-blue-400 object-cover shadow-lg" />
          <h1 className="text-3xl font-black text-blue-700 mb-2 uppercase italic">Xuân Barista 🥤</h1>
          <p className="text-slate-400 mb-8 font-medium italic">{t.ui_welcome}</p>
          <div className="flex flex-col gap-6 items-center">
            <div className="flex gap-3">
              {(['EN', 'RU'] as const).map(l => (
                <button key={l} onClick={() => setSelectedLang(l)} className={`px-8 py-2 rounded-xl font-bold transition-all ${selectedLang === l ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}>{l}</button>
              ))}
            </div>
            <button onClick={() => { setGameState('playing'); setMessages([{ role: 'ai', text: t.welcome_msg, id: 'init' }]); speakWord(t.welcome_msg, 'init'); }} 
              className="bg-blue-600 text-white px-16 py-4 rounded-2xl font-black text-xl shadow-xl hover:scale-105 active:scale-95 transition-all uppercase tracking-widest">
              {t.ui_start}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={gameContainerRef} className="w-full h-full bg-slate-900 flex flex-col md:flex-row overflow-hidden md:p-4">
      {/* Sidebar: Avatar & Mic */}
      <div className="h-[25vh] md:h-full md:w-1/3 bg-blue-50 p-4 md:p-8 flex flex-row md:flex-col items-center justify-between border-b md:border-b-0 md:border-r border-blue-100 shrink-0">
        <div className="flex flex-row md:flex-col items-center gap-4">
          <div className="w-24 h-24 md:w-56 md:h-56 rounded-3xl overflow-hidden border-4 border-white shadow-2xl bg-white">
            <img src={XUAN_IMAGE_URL} className="w-full h-full object-cover" />
          </div>
          <div className="text-left md:text-center">
            <h2 className="text-xl md:text-2xl font-black text-slate-800 italic">Xuân 🍓</h2>
            <p className="text-[10px] font-black uppercase text-emerald-600 tracking-widest animate-pulse">{t.ui_status}</p>
          </div>
        </div>
        
        <button onClick={() => isRecording ? recognitionRef.current?.stop() : recognitionRef.current?.start()} 
          className={`w-16 h-16 md:w-24 md:h-24 rounded-full flex items-center justify-center shadow-2xl transition-all active:scale-90 ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-blue-600'}`}>
          {isRecording ? <MicOff size={32} color="white" /> : <Mic size={32} color="white" />}
        </button>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 bg-white flex flex-col overflow-hidden relative">
        <div className="px-6 py-4 border-b flex justify-between items-center bg-white shadow-sm z-10">
           <span className="font-black text-blue-600 text-xs uppercase tracking-widest">{t.ui_learning_title}</span>
           <div className="flex gap-2">
             <button onClick={() => setSpeechRate(prev => prev === 1.0 ? 0.7 : 1.0)} className="bg-orange-50 text-orange-600 px-3 py-1.5 rounded-full text-[10px] font-black flex items-center gap-1 uppercase">
               <Gauge size={14}/> {speechRate === 1.0 ? 'Normal' : 'Slow'}
             </button>
             <button onClick={handleSendMessage.bind(null, "Xóa hội thoại")} className="p-2 bg-slate-100 rounded-lg text-slate-400 hover:text-red-500 transition-colors"><Download size={14} /></button>
           </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 bg-blue-50/10 custom-scrollbar">
          {messages.map((msg) => {
            const parts = msg.text.split('|');
            const viText = parts[0]?.trim();
            const transText = parts[1]?.trim();
            const isActive = activeVoiceId === msg.id;

            return (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 md:p-5 rounded-2xl md:rounded-3xl shadow-sm relative transition-all ${isActive ? 'ring-4 ring-blue-100' : ''} ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none border border-blue-50'}`}>
                  <div className="flex flex-col">
                    <div className="text-sm md:text-lg font-bold leading-tight">
                      {msg.role === 'ai' ? renderInteractiveText(viText) : viText}
                      <button onClick={() => speakWord(msg.text, msg.id)} className={`ml-3 p-1 rounded-full transition-colors ${msg.role === 'user' ? 'hover:bg-blue-500 text-blue-200' : 'hover:bg-blue-50 text-blue-600'}`}>
                        <Volume2 size={18}/>
                      </button>
                    </div>
                    {transText && (
                      <div className={`mt-2 pt-2 border-t text-[11px] md:text-xs italic opacity-80 font-medium ${msg.role === 'user' ? 'border-blue-500 text-blue-100' : 'border-slate-100 text-slate-500'}`}>
                        {transText}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {isThinking && <div className="text-[10px] font-black text-blue-400 animate-pulse uppercase tracking-widest italic">Xuân đang pha đồ uống...</div>}
          <div ref={chatEndRef} />
        </div>

        {/* Input area */}
        <div className="p-4 md:p-6 bg-white border-t border-slate-50 flex gap-3 pb-10 md:pb-6">
          <input 
            type="text" 
            value={userInput} 
            onChange={e => setUserInput(e.target.value)} 
            onKeyDown={e => e.key === 'Enter' && handleSendMessage(userInput)}
            placeholder={t.ui_placeholder}
            className="flex-1 bg-slate-50 px-5 py-4 rounded-2xl outline-none font-bold text-sm border-2 border-transparent focus:border-blue-100 focus:bg-white transition-all" 
          />
          <button onClick={() => handleSendMessage(userInput)} className="bg-emerald-500 text-white px-6 rounded-2xl shadow-lg hover:bg-emerald-600 active:scale-95 transition-all">
            <Send size={20}/>
          </button>
        </div>
      </div>

      <button onClick={toggleFullscreen} className="absolute bottom-4 right-4 p-2 bg-white/20 rounded-full text-white backdrop-blur-md opacity-30 hover:opacity-100 transition-all">
        {isFullscreen ? <Minimize size={16}/> : <Maximize size={16}/>}
      </button>
    </div>
  );
};

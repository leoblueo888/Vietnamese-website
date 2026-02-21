import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Send, Volume2, Play, Maximize, Minimize, Globe, Gauge } from 'lucide-react';
import { generateContentWithRetry } from '../config/apiKeys';
import type { AIFriend } from '../types';

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
    ui_status: "Online - Expert Fruit Seller",
    ui_learning_title: "Fruit Market Talk with Hanh",
    welcome_msg: "Dạ, em chào Anh! Anh ghé xem hoa quả sạp em đi ạ. Anh muốn mua trái gì ạ? | Hi! Welcome to my shop. What fruit would you like to buy?",
    systemPromptLang: "English"
  },
  RU: {
    label: "Русский",
    ui_welcome: "Добро chào mừng! Я Хань, продавец фруктов.",
    ui_start: "КУПИТЬ",
    ui_placeholder: "Поговори с Хань здесь...",
    ui_status: "В сети - Эксперт",
    ui_learning_title: "Общение trên thị trường",
    welcome_msg: "Dạ, em chào Anh! Mời Anh xem hoa quả ạ. Anh muốn mua trái gì ạ? | Здравствуйте! Những trái cây này ngon lắm. Bạn muốn mua gì?",
    systemPromptLang: "Russian"
  }
};

export const HanhAIfruitseller: React.FC<{ character: AIFriend }> = ({ character }) => {
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

  const t = LANGUAGES[selectedLang];

  // --- TTS LOGIC (CHỈ ĐỌC TIẾNG VIỆT) ---
  const speak = async (fullText: string, msgId: string | null = null) => {
    if (!fullText) return;
    if (msgId) setActiveVoiceId(msgId);
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    audioRef.current.pause();

    const parts = fullText.split('|');
    const vietnameseOnly = parts.filter((_, i) => i % 2 === 0).join(' ')
      .replace(/(\d+)k\b/g, '$1 nghìn').replace(/[*#]/g, '').trim();

    const createChunks = (str: string, max = 160) => {
      const chunks = [];
      let temp = str;
      while (temp.length > 0) {
        if (temp.length <= max) { chunks.push(temp); break; }
        let cutAt = temp.lastIndexOf('.', max);
        if (cutAt === -1) cutAt = temp.lastIndexOf(',', max);
        if (cutAt === -1) cutAt = temp.lastIndexOf(' ', max);
        if (cutAt === -1) cutAt = max;
        chunks.push(temp.slice(0, cutAt + 1).trim());
        temp = temp.slice(cutAt + 1).trim();
      }
      return chunks;
    };

    for (const chunk of createChunks(vietnameseOnly)) {
      await new Promise<void>((resolve) => {
        audioRef.current.src = `/api/tts?text=${encodeURIComponent(chunk)}&lang=vi`;
        audioRef.current.playbackRate = speechRate;
        audioRef.current.onended = () => resolve();
        audioRef.current.onerror = () => {
          const fb = new SpeechSynthesisUtterance(chunk); fb.lang = 'vi-VN';
          fb.onend = () => resolve(); window.speechSynthesis.speak(fb);
        };
        audioRef.current.play().catch(() => resolve());
      });
    }
    setActiveVoiceId(null);
  };

  // --- RECOGNITION ---
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'vi-VN';
      recognition.onstart = () => setIsRecording(true);
      recognition.onresult = (event: any) => {
        let text = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) text += event.results[i][0].transcript;
        setUserInput(text);
      };
      recognition.onend = () => setIsRecording(false);
      recognitionRef.current = recognition;
    }
  }, []);

  // --- LOGIC XỬ LÝ CHÍNH ---
  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isProcessingRef.current) return;
    isProcessingRef.current = true;
    setIsThinking(true);

    const userMsgId = `user-${Date.now()}`;
    
    // 1. Dùng functional update để thêm tin nhắn User
    setMessages(prev => [...prev, { 
      role: 'user', 
      text: text.trim(), 
      id: userMsgId, 
      translation: null // Sẽ được Gemini cập nhật sau
    }]);
    setUserInput("");

    try {
      const response = await generateContentWithRetry({
        model: 'gemini-2.5-flash',
        contents: [...messages.map(m => ({
          role: m.role === 'ai' ? 'model' : 'user',
          parts: [{ text: m.text }]
        })), { role: 'user', parts: [{ text: text.trim() }] }],
        config: {
          systemInstruction: `You are Hạnh, a 20-year-old fruit seller.
          STRICT FORMAT: 
          1. AI Speech: Vietnamese sentence | ${t.systemPromptLang} translation. 
          2. User Translation: Always end your response with "USER_TRANSLATION: [How you translate the user's message into ${t.systemPromptLang}]"`
        }
      });

      if (response.text) {
        const raw = response.text;
        const userTransMatch = raw.match(/USER_TRANSLATION:\s*(.*)$/i);
        const userTransValue = userTransMatch ? userTransMatch[1].replace(/[\[\]]/g, '').trim() : "";
        const aiResponseFull = raw.split(/USER_TRANSLATION:/i)[0].trim();
        const aiMsgId = `ai-${Date.now()}`;

        // 2. Dùng functional update ĐỂ CẬP NHẬT CẢ HAI: 
        // - Gán translation cho tin nhắn User vừa gửi
        // - Thêm tin nhắn mới của AI
        setMessages(prev => {
          return prev.map(m => 
            m.id === userMsgId ? { ...m, translation: userTransValue } : m
          ).concat({ 
            role: 'ai', 
            text: aiResponseFull, 
            id: aiMsgId 
          });
        });

        await speak(aiResponseFull, aiMsgId);
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
          match = { key, original: remaining.slice(0, key.length), info: (DICTIONARY as any)[key] };
          break;
        }
      }
      if (match) {
        const color = match.info.type === "Verb" ? "text-orange-600" : match.info.type === "Adj" ? "text-pink-600" : "text-emerald-600";
        result.push(
          <span key={remaining.length} className="group relative inline-block border-b border-dotted border-emerald-400 cursor-help font-bold text-emerald-800">
            {match.original}
            <span className="invisible group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max bg-slate-800 text-white text-[10px] p-2 rounded-xl z-50 shadow-xl">
              <div className={`font-black uppercase mb-1 ${color}`}>{match.info.type}</div>
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

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) { gameContainerRef.current?.requestFullscreen(); setIsFullscreen(true); }
    else { document.exitFullscreen(); setIsFullscreen(false); }
  };

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  if (gameState === 'start') {
    return (
      <div className="w-full h-full bg-emerald-50 flex items-center justify-center p-4">
        <div className="w-full max-w-xl bg-white rounded-[3rem] shadow-2xl p-10 text-center border-[10px] border-white">
          <img src={character.avatarUrl} className="w-44 h-44 mx-auto mb-6 rounded-full border-4 border-emerald-400 object-cover shadow-lg" alt="Hanh" />
          <h1 className="text-4xl font-black text-emerald-600 mb-2 italic uppercase">Hạnh's Market 🍎</h1>
          <p className="text-slate-400 mb-10 font-medium italic">{t.ui_welcome}</p>
          <div className="flex gap-4 justify-center mb-10">
            {(['EN', 'RU'] as const).map(l => (
              <button key={l} onClick={() => setSelectedLang(l)} className={`px-8 py-3 rounded-2xl font-black transition-all ${selectedLang === l ? 'bg-emerald-600 text-white shadow-lg scale-105' : 'bg-emerald-50 text-emerald-400'}`}>
                {LANGUAGES[l].label}
              </button>
            ))}
          </div>
          <button onClick={() => { 
            audioRef.current.play().then(() => { audioRef.current.pause(); }).catch(() => {});
            setGameState('playing'); 
            setMessages([{ role: 'ai', text: t.welcome_msg, id: 'init' }]); 
            speak(t.welcome_msg, 'init'); 
          }} className="w-full py-6 bg-orange-500 text-white rounded-[2rem] font-black text-2xl shadow-xl hover:bg-orange-600 transition-all flex items-center justify-center gap-3">
            <Play fill="white" /> {t.ui_start}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={gameContainerRef} className="w-full h-full bg-slate-900 flex items-center justify-center md:p-4 overflow-hidden relative font-sans">
      <div className="w-full h-full max-w-6xl bg-white md:rounded-[3rem] flex flex-col md:flex-row overflow-hidden shadow-2xl">
        {/* Sidebar */}
        <div className="h-[20vh] md:h-full md:w-1/3 bg-emerald-50/50 p-4 md:p-10 flex flex-row md:flex-col items-center justify-between border-b md:border-r border-emerald-100 shrink-0 z-20">
          <div className="flex flex-row md:flex-col items-center gap-6">
            <img src={character.avatarUrl} className="w-20 h-20 md:w-56 md:h-56 rounded-full border-4 border-white shadow-xl object-cover" alt="Hanh" />
            <div className="text-left md:text-center">
              <h2 className="text-xl md:text-3xl font-black text-emerald-700 italic">Em Hạnh 🍎</h2>
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block">{t.ui_status}</span>
            </div>
          </div>
          <button onClick={() => isRecording ? recognitionRef.current?.stop() : recognitionRef.current?.start()} className={`w-14 h-14 md:w-24 md:h-24 rounded-full flex items-center justify-center transition-all shadow-xl ${isRecording ? 'bg-red-500 animate-pulse ring-8 ring-red-100' : 'bg-emerald-600 hover:bg-emerald-700'}`}>
            {isRecording ? <MicOff color="white" size={28} /> : <Mic color="white" size={28} />}
          </button>
        </div>

        {/* Chat Content */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
          <header className="px-6 py-4 border-b flex items-center justify-between bg-white z-10 shadow-sm">
            <div className="flex items-center gap-2">
              <Globe size={14} className="text-emerald-500" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.ui_learning_title}</span>
            </div>
            <button onClick={toggleFullscreen} className="p-2 text-slate-400 hover:text-emerald-600">
              {isFullscreen ? <Minimize size={18}/> : <Maximize size={18}/>}
            </button>
          </header>

          <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-6 bg-emerald-50/10 custom-scrollbar">
            {messages.map((msg) => {
              const parts = msg.text.split('|');
              const viText = parts.filter((_, i) => i % 2 === 0).join(' ').trim();
              const transText = parts.filter((_, i) => i % 2 !== 0).join(' ').trim();
              const isActive = activeVoiceId === msg.id;

              return (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-5 md:p-6 rounded-[2rem] transition-all shadow-sm ${isActive ? 'ring-2 ring-emerald-400' : ''} ${msg.role === 'user' ? 'bg-emerald-600 text-white rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none border border-emerald-100'}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="text-base md:text-lg font-bold leading-relaxed">
                        {msg.role === 'ai' ? renderInteractiveText(viText) : viText}
                      </div>
                      {msg.role === 'ai' && <button onClick={() => speak(msg.text, msg.id)} className="opacity-50 hover:opacity-100"><Volume2 size={20}/></button>}
                    </div>
                    {/* Render Translation theo đúng message object */}
                    {(msg.role === 'ai' ? transText : msg.translation) && (
                      <div className={`mt-3 pt-3 border-t text-[11px] italic font-medium ${msg.role === 'user' ? 'border-emerald-500 text-emerald-100' : 'border-slate-50 text-slate-400'}`}>
                        {msg.role === 'ai' ? transText : msg.translation}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {isThinking && <div className="text-[10px] font-black text-emerald-400 animate-pulse italic ml-4 uppercase">Hạnh đang nghe...</div>}
            <div ref={chatEndRef} />
          </div>

          <footer className="p-6 md:p-8 bg-white border-t flex gap-3 pb-10">
            <input type="text" value={userInput} onChange={e => setUserInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendMessage(userInput)} placeholder={t.ui_placeholder} className="flex-1 px-6 py-4 bg-slate-100 rounded-[1.5rem] outline-none font-bold focus:bg-white focus:ring-4 ring-emerald-50 shadow-inner" />
            <button onClick={() => handleSendMessage(userInput)} className="bg-orange-500 text-white px-8 rounded-[1.5rem] shadow-lg hover:scale-105 active:scale-95 transition-all"><Send size={20}/></button>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default HanhAIfruitseller;

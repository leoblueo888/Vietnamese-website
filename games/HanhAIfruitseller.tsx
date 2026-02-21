import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Send, Volume2, Play, Maximize, Minimize, Globe, Gauge } from 'lucide-react';
// IMPORT hệ thống key mới
import { generateContentWithRetry } from '../config/apiKeys';
import type { AIFriend } from '../types';

// --- DICTIONARY DATA (BẢN CHUẨN) ---
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
    welcome_msg: "Dạ, em chào Anh! Anh ghé xem hoa quả sạp em đi ạ. Anh muốn mua trái gì ạ? ✨ | Hi! Welcome to my shop. What fruit would you like to buy? ✨",
    systemPromptLang: "English"
  },
  RU: {
    label: "Русский",
    ui_welcome: "Добро пожаловать! Я Хань, продавец фруктов.",
    ui_start: "КУПИТЬ",
    ui_placeholder: "Поговори с Хань здесь...",
    ui_status: "В сети - Эксперт",
    ui_learning_title: "Общение trên thị trường",
    welcome_msg: "Dạ, em chào Anh! Mời Anh xem hoa quả ạ. Anh muốn mua trái gì ạ? ✨ | Здравствуйте! Những trái cây này ngon lắm. Bạn muốn mua gì? ✨",
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
  }, [selectedLang]);

  // --- TTS (Đã cập nhật logic lách luật Auto-play) ---
  const speak = async (text: string, msgId: string | null = null, isFirst: boolean = false) => {
    if (!text) return;
    if (msgId) setActiveVoiceId(msgId);
    
    // Dừng mọi âm thanh cũ đang phát
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }

    const cleanText = text.split('|')[0].replace(/(\d+)k\b/g, '$1 nghìn').replace(/[*#]/g, '').trim();

    if (isFirst && window.speechSynthesis) {
      // Dùng SpeechSynthesis cho câu đầu tiên để lách luật Auto-play
      return new Promise<void>(resolve => {
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = 'vi-VN';
        utterance.rate = speechRate;
        utterance.onend = () => { setActiveVoiceId(null); resolve(); };
        utterance.onerror = () => { setActiveVoiceId(null); resolve(); };
        window.speechSynthesis.speak(utterance);
      });
    } else {
      // Dùng Google TTS Engine cho các câu sau để lấy giọng hay
      return new Promise<void>(resolve => {
        const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(cleanText)}&tl=vi&client=tw-ob`;
        audioRef.current.src = url;
        audioRef.current.playbackRate = speechRate;
        audioRef.current.onended = () => { setActiveVoiceId(null); resolve(); };
        audioRef.current.onerror = () => { setActiveVoiceId(null); resolve(); };
        audioRef.current.play().catch((err) => {
          console.error("Audio play failed:", err);
          setActiveVoiceId(null);
          resolve();
        });
      });
    }
  };

  // --- AI ENGINE (Xử lý USER_TRANSLATION) ---
  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isProcessingRef.current) return;
    isProcessingRef.current = true;
    setIsThinking(true);

    const userMsgId = `user-${Date.now()}`;
    // Tạo tin nhắn user tạm thời
    const newUserMsg = { role: 'user', text: text.trim(), id: userMsgId, translation: null };
    setMessages(prev => [...prev, newUserMsg]);
    setUserInput("");

    try {
      const history = messages.map(m => ({
        role: m.role === 'ai' ? 'model' : 'user',
        parts: [{ text: m.text.split('|')[0] }]
      }));

      const response = await generateContentWithRetry({
        model: 'gemini-2.5-flash',
        contents: [...history, { role: 'user', parts: [{ text: text.trim() }] }],
        config: {
          systemInstruction: `You are Hạnh (20 years old), a friendly fruit seller. 
          Use "Dạ", "ạ", xưng "Em" gọi khách là "Anh". 
          Sell: Xoài Cam Lâm, Sầu riêng. 
          Format: Vietnamese | ${t.systemPromptLang} Translation | USER_TRANSLATION: [Translation of what user just said]`
        }
      });

      if (response.text) {
        const rawAiResponse = response.text;
        
        // Bóc tách USER_TRANSLATION
        const userTransMatch = rawAiResponse.match(/USER_TRANSLATION:\s*(.*)$/i);
        const userTranslationValue = userTransMatch ? userTransMatch[1].replace(/[\[\]]/g, '').trim() : "";
        
        // Làm sạch text của AI
        const aiCleanText = rawAiResponse.split(/USER_TRANSLATION:/i)[0].trim();
        const aiMsgId = `ai-${Date.now()}`;

        setMessages(currentMsgs => {
          const updated = [...currentMsgs];
          const userIdx = updated.findIndex(m => m.id === userMsgId);
          if (userIdx !== -1) updated[userIdx] = { ...updated[userIdx], translation: userTranslationValue };
          updated.push({ role: 'ai', text: aiCleanText, id: aiMsgId });
          return updated;
        });

        // Gọi hàm speak mặc định (isFirst = false -> Google TTS)
        await speak(aiCleanText, aiMsgId);
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
        const color = match.info.type === "Verb" ? "text-orange-600" : match.info.type === "Adj" ? "text-pink-600" : "text-emerald-600";
        result.push(
          <span key={remaining.length} className="group relative inline-block border-b border-dotted border-emerald-400 cursor-help transition-colors font-bold text-emerald-800">
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
            setGameState('playing'); 
            setMessages([{ role: 'ai', text: t.welcome_msg, id: 'init' }]); 
            // Kích hoạt lách luật ngay khi click
            speak(t.welcome_msg, 'init', true); 
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
              <h2 className="text-xl md:text-3xl font-black text-slate-800 italic text-emerald-700">Em Hạnh 🍎</h2>
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block">{t.ui_status}</span>
            </div>
          </div>
          <button onClick={() => isRecording ? recognitionRef.current?.stop() : recognitionRef.current?.start()} className={`w-14 h-14 md:w-24 md:h-24 rounded-full flex items-center justify-center transition-all shadow-xl ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-emerald-600 hover:bg-emerald-700'}`}>
            {isRecording ? <MicOff color="white" size={28} /> : <Mic color="white" size={28} />}
          </button>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
          <header className="px-6 py-4 border-b flex items-center justify-between bg-white z-10 shadow-sm">
            <div className="flex items-center gap-2">
              <Globe size={14} className="text-emerald-500" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.ui_learning_title}</span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setSpeechRate(prev => prev === 1.0 ? 0.7 : 1.0)} className="bg-orange-50 text-orange-600 px-3 py-1.5 rounded-xl font-black text-[10px] flex items-center gap-2">
                <Gauge size={14}/> {speechRate === 1.0 ? 'Normal' : 'Slow'}
              </button>
              <button onClick={toggleFullscreen} className="p-2 text-slate-400 hover:text-emerald-600 transition-colors">
                {isFullscreen ? <Minimize size={18}/> : <Maximize size={18}/>}
              </button>
            </div>
          </header>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-6 bg-emerald-50/10 custom-scrollbar">
            {messages.map((msg) => {
              const parts = msg.text.split('|');
              const mainText = parts[0]?.trim();
              const aiSubText = parts[1]?.trim();
              const userSubText = msg.translation; 
              const isActive = activeVoiceId === msg.id;

              return (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-5 md:p-6 rounded-[2rem] transition-all shadow-sm ${isActive ? 'ring-2 ring-emerald-400' : ''} ${msg.role === 'user' ? 'bg-emerald-600 text-white rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none border border-emerald-100'}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="text-base md:text-lg font-bold leading-relaxed">
                        {msg.role === 'ai' ? renderInteractiveText(mainText) : mainText}
                      </div>
                      <button onClick={() => speak(mainText, msg.id, false)} className="opacity-50 hover:opacity-100 transition-opacity"><Volume2 size={20}/></button>
                    </div>
                    
                    {/* Hiển thị bản dịch */}
                    {(aiSubText || userSubText) && (
                      <div className={`mt-3 pt-3 border-t text-[11px] italic font-medium ${msg.role === 'user' ? 'border-emerald-500 text-emerald-100' : 'border-slate-50 text-slate-400'}`}>
                        {msg.role === 'ai' ? aiSubText : userSubText}
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
            <input type="text" value={userInput} onChange={e => setUserInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendMessage(userInput)} placeholder={t.ui_placeholder} className="flex-1 px-6 py-4 bg-slate-100 rounded-[1.5rem] outline-none font-bold transition-all focus:bg-white focus:ring-4 ring-emerald-50 shadow-inner" />
            <button onClick={() => handleSendMessage(userInput)} className="bg-orange-500 text-white px-8 rounded-[1.5rem] shadow-lg hover:scale-105 active:scale-95 transition-all"><Send size={20}/></button>
          </footer>
        </div>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #10b98122; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default HanhAIfruitseller;

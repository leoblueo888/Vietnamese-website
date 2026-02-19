import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Send, Volume2, Play, Gauge, Maximize, Minimize, Sparkles } from 'lucide-react';
import type { AIFriend } from '../types';

// --- DICTIONARY: TỪ VỰNG CỬA HÀNG RAU CỦ ---
const DICTIONARY: Record<string, { EN: string; type: string }> = {
  "rau muống": { EN: "water spinach", type: "Noun" },
  "cà chua": { EN: "tomato", type: "Noun" },
  "bắp cải": { EN: "cabbage", type: "Noun" },
  "khoai tây": { EN: "potato", type: "Noun" },
  "cà rốt": { EN: "carrot", type: "Noun" },
  "hành lá": { EN: "green onion", type: "Noun" },
  "rau thơm": { EN: "herbs", type: "Noun" },
  "dưa leo": { EN: "cucumber", type: "Noun" },
  "ớt chuông": { EN: "bell pepper", type: "Noun" },
  "bí đỏ": { EN: "pumpkin", type: "Noun" },
  "mua": { EN: "to buy", type: "Verb" },
  "cân": { EN: "to weigh", type: "Verb" },
  "trả tiền": { EN: "to pay", type: "Verb" },
  "tươi": { EN: "fresh", type: "Adj" },
  "ngon": { EN: "delicious", type: "Adj" },
  "rẻ": { EN: "cheap", type: "Adj" }
};

const LANGUAGES = {
  EN: {
    label: "English",
    ui_welcome: "Welcome to Phuong's Purple Market! I'm Phuong.",
    ui_start: "SHOP NOW",
    ui_placeholder: "Talk to Phuong here...",
    ui_status: "Online - Gemini 2.5 Flash Audio",
    ui_learning_title: "Chat with Phuong (AI Voice Mode)",
    welcome_msg: "Em chào Anh! Rau củ nhà em hôm nay loại nào cũng có, tươi rói luôn ạ. Anh muốn mua gì ạ? ✨ | Hi! Welcome. I have all kinds of veggies today. What would you like to buy? ✨",
    systemPromptLang: "English"
  },
  RU: {
    label: "Русский",
    ui_welcome: "Добро пожаловать в лавку Фуонг!",
    ui_start: "КУПИТЬ",
    ui_placeholder: "Поговори с Фуонг здесь...",
    ui_status: "Online - Gemini 2.5 Flash Audio",
    ui_learning_title: "Trò chuyện với Phương (AI Voice)",
    welcome_msg: "Em chào Anh! Rau củ tươi lắm, Anh xem mua gì ủng hộ em nhé! ✨ | Здравствуйте! Овощи rất tươi, mời Anh xem! ✨",
    systemPromptLang: "Russian"
  }
};

export const GameSpeakAIVegetables: React.FC<{ character: AIFriend }> = ({ character }) => {
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

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = 'vi-VN';
      recognition.onstart = () => setIsRecording(true);
      recognition.onresult = (e: any) => handleSendMessage(e.results[0][0].transcript, true);
      recognition.onend = () => setIsRecording(false);
      recognitionRef.current = recognition;
    }
  }, []);

  // --- TTS: GEMINI 2.5 FLASH AUDIO ENGINE ---
  const speakWord = async (text: string, msgId: string | null = null, base64Audio?: string) => {
    if (!audioRef.current) return;
    if (msgId) setActiveVoiceId(msgId);
    audioRef.current.pause();

    if (base64Audio) {
      // Dùng Audio trực tiếp từ Gemini API (Chất lượng cao, có cảm xúc)
      audioRef.current.src = `data:audio/mp3;base64,${base64Audio}`;
    } else {
      // Fallback cho tin nhắn khởi đầu hoặc khi lỗi API
      const viPart = text.split('|')[0].replace(/[*_]/g, '');
      audioRef.current.src = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(viPart)}&tl=vi&client=tw-ob`;
    }
    
    audioRef.current.playbackRate = speechRate;
    audioRef.current.onended = () => setActiveVoiceId(null);
    audioRef.current.play().catch(console.error);
  };

  const handleSendMessage = async (text: string, fromMic = false) => {
    if (!text.trim() || isProcessingRef.current) return;
    isProcessingRef.current = true;
    setIsThinking(true);

    // Mồi audio để bypass chính sách autoplay của trình duyệt
    audioRef.current.src = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=";
    audioRef.current.play().catch(() => {});

    let processedInput = text.trim();
    if (fromMic) {
      try {
        const voiceRes = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: `Sửa lỗi: "${processedInput}"`, systemPrompt: "Chỉ trả về tiếng Việt sạch." })
        });
        const vData = await voiceRes.json();
        if (vData.text) processedInput = vData.text.trim().replace(/^"|"$/g, '');
      } catch (e) { console.error(e); }
    }

    const userMsgId = `user-${Date.now()}`;
    setMessages(prev => [...prev, { role: 'user', text: processedInput, id: userMsgId }]);
    setUserInput("");

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: processedInput,
          history: messages.map(m => ({ role: m.role === 'ai' ? 'model' : 'user', parts: [{ text: m.text }] })),
          // THỬ NGHIỆM: Yêu cầu Gemini 2.5 xuất Audio trực tiếp
          config: { speech_output: true, voice_name: "Aoide" }, 
          systemPrompt: `
            BỐI CẢNH: Bạn là Phương (20 tuổi), người bán rau tươi.
            NHIỆM VỤ: Tư vấn rau, báo giá (dùng "nghìn"), hỏi số lượng.
            ĐỊNH DẠNG: Tiếng Việt | Dịch sang ${t.systemPromptLang}.
            LƯU Ý: Giọng đọc cần vui vẻ, lễ phép. Không dùng ký tự *.
          `
        })
      });

      const data = await response.json();
      if (data.text) {
        const aiMsgId = `ai-${Date.now()}`;
        // data.audio là chuỗi base64 trả về từ Gemini 2.5 Flash
        setMessages(prev => [...prev, { role: 'ai', text: data.text, id: aiMsgId, audio: data.audio }]);
        speakWord(data.text, aiMsgId, data.audio);
      }
    } catch (e) { console.error("Gemini Audio Error:", e); } finally {
      setIsThinking(false);
      isProcessingRef.current = false;
    }
  };

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const renderInteractiveText = (text: string) => {
    if (!text) return null;
    const words = text.split(/(\s+)/);
    return words.map((word, idx) => {
      const clean = word.toLowerCase().replace(/[.,!?;]/g, '');
      const entry = DICTIONARY[clean];
      if (entry) {
        return (
          <span key={idx} className="group relative border-b border-dotted border-violet-300 cursor-help text-violet-700 font-bold">
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

  if (gameState === 'start') {
    return (
      <div className="w-full h-full bg-violet-50 flex items-center justify-center p-4">
        <div className="w-full max-w-xl bg-white rounded-[3rem] shadow-2xl p-10 text-center border-[12px] border-violet-100">
          <img src={character.avatarUrl} className="w-40 h-40 mx-auto mb-6 rounded-3xl border-4 border-violet-400 object-cover shadow-lg" />
          <h1 className="text-3xl font-black text-violet-700 mb-2 uppercase italic">Phương's Veggies 🥦</h1>
          <p className="text-slate-400 mb-8 font-medium italic">{t.ui_welcome}</p>
          <div className="flex flex-col gap-6 items-center">
            <div className="flex gap-3">
              {(['EN', 'RU'] as const).map(l => (
                <button key={l} onClick={() => setSelectedLang(l)} className={`px-8 py-2 rounded-xl font-bold transition-all ${selectedLang === l ? 'bg-violet-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}>{l}</button>
              ))}
            </div>
            <button onClick={() => { setGameState('playing'); setMessages([{ role: 'ai', text: t.welcome_msg, id: 'init' }]); speakWord(t.welcome_msg, 'init'); }} 
              className="bg-violet-600 text-white px-16 py-4 rounded-2xl font-black text-xl shadow-xl hover:scale-105 transition-all uppercase tracking-widest flex items-center gap-3">
              <Sparkles size={24}/> {t.ui_start}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={gameContainerRef} className="w-full h-full bg-[#0B0F19] flex flex-col md:flex-row overflow-hidden md:p-4">
      <div className="h-[25vh] md:h-full md:w-1/3 bg-[#F7F8FA] p-4 md:p-8 flex flex-row md:flex-col items-center justify-between border-b md:border-b-0 md:border-r border-slate-100 shrink-0 shadow-2xl z-20">
        <div className="flex flex-row md:flex-col items-center gap-4">
          <div className="w-24 h-24 md:w-56 md:h-56 rounded-3xl overflow-hidden border-4 border-white shadow-2xl ring-4 ring-violet-50">
            <img src={character.avatarUrl} className="w-full h-full object-cover" />
          </div>
          <div className="text-left md:text-center">
            <h2 className="text-xl md:text-2xl font-black text-slate-800 italic">Phương 🥦</h2>
            <p className="text-[10px] font-black uppercase text-violet-500 tracking-widest animate-pulse flex items-center gap-1 justify-center">
               <div className="w-2 h-2 bg-violet-500 rounded-full"/> {t.ui_status}
            </p>
          </div>
        </div>
        <button onClick={() => isRecording ? recognitionRef.current?.stop() : recognitionRef.current?.start()} 
          className={`w-16 h-16 md:w-24 md:h-24 rounded-full flex items-center justify-center shadow-2xl transition-all ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-violet-600 hover:bg-violet-700'}`}>
          {isRecording ? <MicOff size={32} color="white" /> : <Mic size={32} color="white" />}
        </button>
      </div>

      <div className="flex-1 bg-white flex flex-col overflow-hidden relative shadow-inner">
        <div className="px-6 py-4 border-b flex justify-between items-center bg-white shadow-sm z-10">
           <span className="font-black text-violet-600 text-xs uppercase tracking-widest">{t.ui_learning_title}</span>
           <button onClick={() => setSpeechRate(prev => prev === 1.0 ? 0.7 : 1.0)} className="bg-orange-50 text-orange-600 px-3 py-1.5 rounded-full text-[10px] font-black flex items-center gap-1 uppercase hover:bg-orange-100 transition-colors">
             <Gauge size={14}/> {speechRate === 1.0 ? 'Normal' : 'Slow'}
           </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 bg-violet-50/10 custom-scrollbar">
          {messages.map((msg) => {
            const parts = msg.text.split('|');
            const viText = parts[0]?.trim();
            const transText = parts[1]?.trim();
            return (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 md:p-5 rounded-2xl md:rounded-3xl shadow-sm relative transition-all ${activeVoiceId === msg.id ? 'ring-4 ring-violet-200' : ''} ${msg.role === 'user' ? 'bg-violet-600 text-white rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none border border-violet-50'}`}>
                  <div className="flex flex-col">
                    <div className="text-sm md:text-lg font-bold leading-tight flex items-start gap-3">
                      <span className="flex-1">{msg.role === 'ai' ? renderInteractiveText(viText) : viText}</span>
                      <button onClick={() => speakWord(msg.text, msg.id, msg.audio)} className={`p-1 rounded-full transition-colors ${msg.role === 'user' ? 'hover:bg-violet-500 text-violet-200' : 'hover:bg-violet-50 text-violet-600'}`}>
                        <Volume2 size={18}/>
                      </button>
                    </div>
                    {transText && <div className={`mt-2 pt-2 border-t text-[11px] md:text-xs italic opacity-80 font-medium ${msg.role === 'user' ? 'border-violet-500 text-violet-100' : 'border-slate-100 text-slate-500'}`}>{transText}</div>}
                  </div>
                </div>
              </div>
            );
          })}
          {isThinking && <div className="text-[10px] font-black text-violet-400 animate-pulse uppercase tracking-widest italic ml-4">Phương đang nghe Anh...</div>}
          <div ref={chatEndRef} />
        </div>

        <div className="p-4 md:p-6 bg-white border-t border-slate-50 flex gap-3 pb-10 md:pb-6">
          <input type="text" value={userInput} onChange={e => setUserInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendMessage(userInput)}
            placeholder={t.ui_placeholder} className="flex-1 bg-slate-50 px-5 py-4 rounded-2xl outline-none font-bold text-sm border-2 border-transparent focus:border-violet-100 focus:bg-white transition-all shadow-inner" />
          <button onClick={() => handleSendMessage(userInput)} className="bg-emerald-500 text-white px-6 rounded-2xl shadow-lg hover:bg-emerald-600 transition-all active:scale-95"><Send size={20}/></button>
        </div>
      </div>

      <button onClick={toggleFullscreen} className="absolute bottom-4 right-4 p-2 bg-white/20 rounded-full text-white backdrop-blur-md opacity-30 hover:opacity-100 transition-all z-50">
        {isFullscreen ? <Minimize size={16}/> : <Maximize size={16}/>}
      </button>
    </div>
  );
};

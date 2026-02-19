import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Send, Volume2, Play, Globe, Download, Gauge, Heart } from 'lucide-react';
import type { AIFriend } from '../types';
// Sử dụng hệ thống xoay vòng Key đã fix lỗi 404
import { generateContentWithRetry } from '../config/apiKeys';

// --- DICTIONARY DATA ---
const DICTIONARY: Record<string, { EN: string; RU: string; type: string }> = {
  "kem": { EN: "ice cream", RU: "мороженое", type: "noun" },
  "sinh tố": { EN: "smoothie", RU: "смузи", type: "noun" },
  "Ninh Bình": { EN: "Ninh Binh province", RU: "провинция Ниньбинь", type: "noun" },
  "gia đình": { EN: "family", RU: "семья", type: "noun" },
  "chồng": { EN: "husband", RU: "муж", type: "noun" },
  "con": { EN: "children", RU: "đứa trẻ", type: "noun" },
  "cửa hàng": { EN: "shop / store", RU: "магазин", type: "noun" },
  "chùa": { EN: "temple / pagoda", RU: "храm", type: "noun" },
  "bạn": { EN: "friend", RU: "друг", type: "noun" },
  "quê": { EN: "hometown", RU: "родной город", type: "noun" },
  "Tràng An": { EN: "Trang An landscape", RU: "Транг Anh", type: "noun" },
  "nấu ăn": { EN: "to cook", RU: "готовить", type: "verb" },
  "đi": { EN: "to go", RU: "идti", type: "verb" },
  "tin": { EN: "to trust / believe", RU: "верить", type: "verb" },
  "trò chuyện": { EN: "to chat", RU: "болтать", type: "verb" },
  "gặp": { EN: "to meet", RU: "встретить", type: "verb" },
  "kết bạn": { EN: "make friends", RU: "заводить друзей", type: "verb" },
  "tìm hiểu": { EN: "get to know", RU: "узнать", type: "verb" },
  "ngon": { EN: "delicious", RU: "вкусный", type: "adj" },
  "vui": { EN: "happy / fun", RU: "веселый", type: "adj" },
  "chuẩn": { EN: "perfect / correct", RU: "идеальный", type: "adj" },
  "mát": { EN: "cool / refreshing", RU: "прохладный", type: "adj" },
  "cởi mở": { EN: "open-minded", RU: "открытый", type: "adj" },
  "nồng hậu": { EN: "hospitable", RU: "гостеприимный", type: "adj" },
};

const getTranslations = (topic?: string | null) => {
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : { name: 'Guest', gender: 'male' };
  const userName = user.name || 'Guest';
  const userPronoun = user.gender === 'female' ? 'Chị' : 'Anh';

  return {
    EN: {
      label: "English",
      ui_welcome: `CHÀO ${userPronoun.toUpperCase()}! I'm Mai from Ninh Binh.`,
      ui_start: "START CHAT",
      ui_placeholder: "Talk to Mai...",
      ui_recording: "LISTENING...",
      ui_status: "Online - Ninh Binh",
      ui_learning_title: "Chat with Mai",
      welcome_msg: topic 
        ? `Chào ${userPronoun} ${userName}, tôi thấy ${userPronoun} vừa học xong chủ đề "${topic}". Mình cùng trò chuyện nhé? ✨ | Hi ${userName}, I see you finished "${topic}". Shall we talk? ✨`
        : `Chào ${userPronoun} ${userName}! Tôi là Mai ở Ninh Bình đây. Rất vui được trò chuyện cùng ${userPronoun}! ✨ | HELLO ${userName}! I'm Mai from Ninh Binh. So happy to chat! ✨`,
      systemPromptLang: "English"
    },
    RU: {
      label: "Русский",
      ui_welcome: `CHÀO ${userPronoun.toUpperCase()}! Я Май из Ниньбиня.`,
      ui_start: "НАЧАТЬ CHAT",
      ui_placeholder: "Пишите по-вьетнамски...",
      ui_recording: "СЛУШАЮ...",
      ui_status: "В сети - Ниньбинь",
      ui_learning_title: "Общение với Mai",
      welcome_msg: topic
        ? `Chào ${userPronoun} ${userName}, tôi thấy ${userPronoun} vừa học xong chủ đề "${topic}". Mình cùng trò chuyện nhé? ✨ | Здравствуйте ${userName}, вы только что закончили тему "${topic}". Поговорим? ✨`
        : `Chào ${userPronoun} ${userName}! Tôi là Mai ở Ninh Bình đây. Rất vui được gặp và trò chuyện cùng ${userPronoun} nhé! 🌸 | ЗДРАВСТВУЙТЕ ${userName}! Я Май из Ниньбиня. Рада нашему знакомству! 🌸`,
      systemPromptLang: "Russian"
    }
  };
};

export const AInewfriendMai: React.FC<{ onBack?: () => void, topic?: string | null, character: AIFriend }> = ({ onBack, topic, character }) => {
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

  // Fallback avatar URL để chống trắng màn hình
  const safeAvatar = character?.avatarUrl || "https://lh3.googleusercontent.com/d/1l8eqtV6ISGB2-KTg0ysbPIflAIw6bN9D";

  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : { name: 'Guest', gender: 'male' };
  const userPronoun = user.gender === 'female' ? 'Chị' : 'Anh';
  const userName = user.name || 'Guest';

  const t = getTranslations(topic)[selectedLang];

  // --- RECOGNITION ---
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = 'vi-VN';
      recognition.onstart = () => setIsRecording(true);
      recognition.onresult = (e: any) => {
        const text = e.results[0][0].transcript;
        handleSendMessage(text, true);
      };
      recognition.onend = () => setIsRecording(false);
      recognitionRef.current = recognition;
    }
  }, []);

  // --- TTS ---
  const speakWord = async (text: string, msgId: string | null = null) => {
    if (!text) return;
    if (msgId) setActiveVoiceId(msgId);
    const cleanText = text.split('|')[0].replace(/[*_`#]/g, '').trim();
    return new Promise<void>(resolve => {
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(cleanText)}&tl=vi&client=tw-ob`;
      audioRef.current.src = url;
      audioRef.current.playbackRate = speechRate;
      audioRef.current.onended = () => { setActiveVoiceId(null); resolve(); };
      audioRef.current.play().catch(resolve);
    });
  };

  // --- AI BRIDGE (CHỈNH SỬA ĐỂ DÙNG TRỰC TIẾP generateContentWithRetry) ---
  const handleSendMessage = async (text: string, fromMic = false) => {
    if (!text?.trim() || isProcessingRef.current) return;
    isProcessingRef.current = true;
    setIsThinking(true);

    let finalInput = text.trim();

    // Bước 1: Sửa lỗi chính tả nếu đến từ Mic (Gửi qua API Gemini trực tiếp)
    if (fromMic) {
      try {
        const correctionPayload = {
          model: "gemini-1.5-flash",
          config: { systemInstruction: "Bạn là trợ lý sửa lỗi tiếng Việt. Chỉ trả về câu đã sửa, không giải thích." },
          contents: [{ role: 'user', parts: [{ text: `Sửa lỗi chính tả và thêm dấu câu cho câu này: "${finalInput}"` }] }]
        };
        const correctionResult = await generateContentWithRetry(correctionPayload);
        if (correctionResult.text) finalInput = correctionResult.text.trim().replace(/^"|"$/g, '');
      } catch (e) { console.error("Mic correction error", e); }
    }

    const userMsgId = `user-${Date.now()}`;
    setMessages(prev => [...prev, { role: 'user', text: finalInput, id: userMsgId }]);
    setUserInput("");

    // Bước 2: Nhập vai Mai + History (Gửi qua API Gemini trực tiếp)
    try {
      const chatPayload = {
        model: "gemini-1.5-flash",
        config: {
          systemInstruction: `
            BỐI CẢNH: Bạn là Mai, 45 tuổi, đến từ Ninh Bình. 
            VAI TRÒ: Một người bạn thân thiện, xưng "Tôi" và gọi người dùng (${userName}) là "${userPronoun}".
            TÍNH CÁCH: Nhẹ nhàng, ấm áp, đậm chất phụ nữ miền Bắc. Có một sạp nhỏ bán kem và sinh tố.
            NHIỆM VỤ: Trò chuyện làm quen, hỏi thăm sức khỏe/công việc. Nếu có chủ đề "${topic || 'tự do'}", hãy xoay quanh nó.
            ĐỊNH DẠNG TRẢ LỜI: Tiếng Việt | Dịch sang ${t.systemPromptLang} | USER_TRANSLATION: [Dịch câu cuối của người dùng sang ${t.systemPromptLang}]
            QUY TẮC: Tối đa 3 câu. Không dùng ký hiệu *. Luôn kết thúc bằng một câu hỏi quan tâm.
          `
        },
        contents: [
          ...messages.map(m => ({
            role: m.role === 'ai' ? 'model' : 'user',
            parts: [{ text: m.text }]
          })),
          { role: 'user', parts: [{ text: finalInput }] }
        ]
      };

      const data = await generateContentWithRetry(chatPayload);

      if (data.text) {
        const rawAiResponse = data.text;
        const aiMsgId = `ai-${Date.now()}`;
        
        const userTransMatch = rawAiResponse.match(/USER_TRANSLATION:\s*\[(.*?)\]/is);
        const userTranslationValue = userTransMatch ? userTransMatch[1].trim() : "";
        const cleanAIDisplay = rawAiResponse.replace(/USER_TRANSLATION:.*$/gi, '').trim();

        setMessages(prev => {
          const updated = [...prev];
          const userIdx = updated.findIndex(m => m.id === userMsgId);
          if (userIdx > -1 && userTranslationValue) {
            updated[userIdx] = { ...updated[userIdx], translation: userTranslationValue };
          }
          return [...updated, { role: 'ai', text: cleanAIDisplay, id: aiMsgId }];
        });

        speakWord(cleanAIDisplay, aiMsgId);
      }
    } catch (error) {
      console.error("AI Logic Error:", error);
    } finally {
      setIsThinking(false);
      isProcessingRef.current = false;
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // --- RENDER TEXT ---
  const renderInteractiveText = (text: string) => {
    const sortedKeys = Object.keys(DICTIONARY).sort((a, b) => b.length - a.length);
    let result: any[] = [];
    let remaining = text;

    while (remaining.length > 0) {
      let match = null;
      for (const key of sortedKeys) {
        if (remaining.toLowerCase().startsWith(key.toLowerCase())) {
          match = { key, original: remaining.slice(0, key.length), info: DICTIONARY[key] };
          break;
        }
      }

      if (match) {
        result.push(
          <span key={remaining.length} className="group relative border-b border-dotted border-orange-400 cursor-help font-bold text-orange-700">
            {match.original}
            <span className="invisible group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 bg-slate-800 text-white text-[10px] rounded-lg shadow-xl z-50 w-max font-normal">
              {selectedLang === 'EN' ? match.info.EN : match.info.RU}
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

  if (gameState === 'start') {
    return (
      <div className="w-full h-full bg-orange-50 flex items-center justify-center p-4">
        <div className="w-full max-w-xl bg-white rounded-[3rem] shadow-2xl p-10 text-center border-[10px] border-white">
          <img src={safeAvatar} className="w-44 h-44 mx-auto mb-6 rounded-full border-4 border-orange-400 object-cover shadow-lg" alt="Mai" />
          <h1 className="text-4xl font-black text-orange-600 mb-2 italic uppercase">Mai Ninh Bình 🍨</h1>
          <p className="text-slate-400 mb-10 font-medium italic">"Rất vui được làm quen với {userPronoun} ạ!"</p>
          <div className="flex gap-4 justify-center mb-10">
            {['EN', 'RU'].map(l => (
              <button key={l} onClick={() => setSelectedLang(l as any)} className={`px-8 py-3 rounded-2xl font-black transition-all ${selectedLang === l ? 'bg-orange-600 text-white shadow-lg' : 'bg-orange-50 text-orange-400'}`}>
                {l}
              </button>
            ))}
          </div>
          <button onClick={() => { setGameState('chat'); setMessages([{ role: 'ai', text: t.welcome_msg, id: 'init' }]); speakWord(t.welcome_msg, 'init'); }} 
            className="w-full py-6 bg-orange-600 text-white rounded-[2rem] font-black text-2xl shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-3">
            <Play fill="white" /> {t.ui_start}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-slate-900 flex items-center justify-center md:p-4 overflow-hidden relative">
      <div className="w-full h-full max-w-6xl bg-white md:rounded-[3rem] flex flex-col md:flex-row overflow-hidden shadow-2xl">
        {/* Sidebar */}
        <div className="h-[20vh] md:h-full md:w-1/3 bg-orange-50/50 p-4 md:p-10 flex flex-row md:flex-col items-center justify-between border-b md:border-r border-orange-100 shrink-0">
          <div className="flex flex-row md:flex-col items-center gap-6">
            <div className="relative">
              <img src={safeAvatar} className="w-20 h-20 md:w-56 md:h-56 rounded-full border-4 border-white shadow-xl object-cover" alt="Mai" />
              {isThinking && <div className="absolute inset-0 bg-white/40 backdrop-blur-sm rounded-full flex items-center justify-center animate-pulse"><div className="w-2 h-2 bg-orange-600 rounded-full animate-bounce"></div></div>}
            </div>
            <div className="text-left md:text-center">
              <h2 className="text-xl md:text-3xl font-black text-slate-800 italic uppercase">Chị Mai 🍨</h2>
              <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Online - Ninh Binh</span>
            </div>
          </div>
          <button onClick={() => isRecording ? recognitionRef.current?.stop() : recognitionRef.current?.start()} className={`w-14 h-14 md:w-24 md:h-24 rounded-full flex items-center justify-center shadow-xl transition-all ${isRecording ? 'bg-red-500 animate-pulse scale-110' : 'bg-orange-600 hover:bg-orange-700'}`}>
            {isRecording ? <MicOff color="white" size={28} /> : <Mic color="white" size={28} />}
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
          <header className="px-6 py-4 border-b border-slate-50 flex items-center justify-between bg-white z-10">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Heart size={14} className="text-orange-500" fill="currentColor"/> {t.ui_learning_title}</span>
            <button onClick={() => setSpeechRate(prev => prev === 1.0 ? 0.8 : 1.0)} className="bg-orange-50 text-orange-600 px-3 py-1.5 rounded-xl font-black text-[10px] flex items-center gap-2 uppercase tracking-tighter">
              <Gauge size={14}/> {speechRate === 1.0 ? 'Normal' : 'Slow'}
            </button>
          </header>

          <div className="flex-1 overflow-y-auto p-4 md:p-10 space-y-6 bg-orange-50/10 custom-scrollbar">
            {messages.map((msg) => {
              const parts = msg.text.split('|');
              const isActive = activeVoiceId === msg.id;
              return (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-5 rounded-[2rem] transition-all duration-300 shadow-sm ${isActive ? 'ring-4 ring-orange-100 scale-[1.02]' : ''} ${msg.role === 'user' ? 'bg-orange-600 text-white rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none border border-orange-100'}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="text-base font-bold leading-relaxed">{msg.role === 'ai' ? renderInteractiveText(parts[0]) : parts[0]}</div>
                      <button onClick={() => speakWord(msg.text, msg.id)} className={`p-2 rounded-xl ${msg.role === 'user' ? 'text-orange-200' : 'text-orange-600'}`}><Volume2 size={18}/></button>
                    </div>
                    {(parts[1] || msg.translation) && (
                      <div className={`mt-3 pt-3 border-t text-[11px] italic font-medium ${msg.role === 'user' ? 'border-orange-500 text-orange-100' : 'border-slate-50 text-slate-400'}`}>
                        {msg.role === 'ai' ? parts[1].trim() : msg.translation}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>

          <footer className="p-6 md:p-8 bg-white border-t border-slate-100 flex gap-3">
            <input type="text" value={userInput} onChange={e => setUserInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendMessage(userInput)} placeholder={t.ui_placeholder} className="flex-1 px-6 py-4 bg-slate-100 rounded-[1.5rem] outline-none font-bold shadow-inner" />
            <button onClick={() => handleSendMessage(userInput)} disabled={isThinking} className="bg-orange-500 text-white px-8 rounded-[1.5rem] shadow-lg hover:bg-orange-600 active:scale-95 transition-all"><Send size={20}/></button>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default AInewfriendMai;

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Send, Volume2, Play, Globe, Download, Gauge, Heart } from 'lucide-react';
import type { AIFriend } from '../types';
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

const punctuateText = async (rawText: string) => {
    if (!rawText.trim()) return rawText;
    try {
      const response = await generateContentWithRetry({
        model: 'gemini-3-flash-preview',
        contents: [{ role: 'user', parts: [{ text: `Hãy thêm dấu chấm, phẩy và viết hoa đúng quy tắc cho đoạn văn bản tiếng Việt sau đây (chỉ trả về văn bản kết quả, không giải thích): "${rawText}"` }] }]
      });
      return response.text?.trim() || rawText;
    } catch (error) {
      return rawText;
    }
};

export const AInewfriendMai: React.FC<{ onBack?: () => void, topic?: string | null, character?: AIFriend }> = ({ onBack, topic, character }) => {
  const [gameState, setGameState] = useState('start');
  const [selectedLang, setSelectedLang] = useState<'EN' | 'RU'>('EN');
  const [messages, setMessages] = useState<any[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [speechRate, setSpeechRate] = useState(1.0);
  const [activeVoiceId, setActiveVoiceId] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const isProcessingRef = useRef(false);
  const silenceTimerRef = useRef<any>(null);

  const safeAvatar = character?.avatarUrl || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop";
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : { name: 'Guest', gender: 'male' };
  const userPronoun = user.gender === 'female' ? 'Chị' : 'Anh';
  const userName = user.name || 'Guest';

  const t = getTranslations(topic)[selectedLang];

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'vi-VN';
      
      recognition.onstart = () => {
        setIsRecording(true);
        isProcessingRef.current = false;
      };

      recognition.onresult = (event: any) => {
        if (isProcessingRef.current) return;
        const currentTranscript = Array.from(event.results).map((result: any) => result[0].transcript).join('');
        setUserInput(currentTranscript);
        
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = setTimeout(async () => {
            if (currentTranscript.trim() && !isProcessingRef.current) {
                recognition.stop();
                const punctuated = await punctuateText(currentTranscript.trim());
                handleSendMessage(punctuated);
            }
        }, 2200);
      };

      recognition.onerror = () => setIsRecording(false);
      recognition.onend = () => setIsRecording(false);
      recognitionRef.current = recognition;
    }
  }, [selectedLang]);

  const speakWord = async (text: string, msgId: string | null = null) => {
    if (!text) return;
    if (msgId) setActiveVoiceId(msgId);
    if (audioRef.current) audioRef.current.pause();

    const cleanText = text.split('|')[0].replace(/[*_`#]/g, '').trim();
    const segments = cleanText.split(/([.!?])\s/).reduce((acc: string[], cur, i, arr) => {
        if (i % 2 === 0) {
            const combined = (cur + (arr[i+1] || "")).trim();
            if (combined) acc.push(combined);
        }
        return acc;
    }, []);

    try {
        for (const segment of segments) {
            await new Promise<void>(resolve => {
                const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(segment)}&tl=vi&client=tw-ob`;
                const audio = new Audio(url);
                audio.playbackRate = speechRate;
                audioRef.current = audio;
                audio.onended = () => resolve();
                audio.onerror = () => resolve();
                audio.play().catch(resolve);
            });
        }
    } finally {
        setActiveVoiceId(null);
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!text?.trim() || isProcessingRef.current) return;
    isProcessingRef.current = true;
    setIsThinking(true);

    const userMsgId = `user-${Date.now()}`;
    setMessages(prev => [...prev, { role: 'user', text: text.trim(), id: userMsgId, translation: null }]);
    setUserInput("");

    try {
      const response = await generateContentWithRetry({
        model: "gemini-3-flash-preview",
        systemInstruction: `
            BỐI CẢNH: Bạn là Mai, một người phụ nữ 45 tuổi đến từ Ninh Bình (Năm 2026).
            VAI TRÒ: Một người bạn thân thiện, xưng "Tôi" và gọi người dùng (${userName}) là "${userPronoun}".
            TÍNH CÁCH: Nhẹ nhàng, ấm áp, nồng hậu đậm chất phụ nữ miền Bắc. Bạn có một sạp nhỏ bán kem và sinh tố tại Ninh Bình.
            NHIỆM VỤ: Trò chuyện làm quen, hỏi thăm chân thành. Nếu có chủ đề "${topic || 'tự do'}", hãy tập trung vào đó.
            ĐỊNH DẠNG TRẢ LỜI: Vietnamese_Text | ${t.systemPromptLang}_Translation | USER_TRANSLATION: [Dịch ngắn gọn ý của người dùng sang ${t.systemPromptLang}]
            QUY TẮC: Tối đa 1-3 câu. Luôn kết thúc bằng một câu hỏi quan tâm để duy trì hội thoại.
        `,
        contents: [...messages, { role: 'user', text: text.trim() }].map(m => ({
          role: m.role === 'ai' ? 'model' : 'user',
          parts: [{ text: (m.text || "").split('|')[0].trim() }]
        }))
      });

      if (response.text) {
        const rawAiResponse = response.text;
        const parts = rawAiResponse.split('|');
        const aiVi = parts[0]?.replace(/USER_TRANSLATION:.*$/gi, '').trim() || "";
        const aiTrans = parts[1]?.replace(/USER_TRANSLATION:.*$/gi, '').trim() || "";
        const userTransMatch = rawAiResponse.match(/USER_TRANSLATION:\s*\[(.*?)\]/is);
        const userTranslationValue = userTransMatch ? userTransMatch[1].trim() : "";
        
        const aiMsgId = `ai-${Date.now()}`;

        setMessages(prev => {
          const updated = [...prev];
          const userIdx = updated.findIndex(m => m.id === userMsgId);
          if (userIdx > -1 && userTranslationValue) {
            updated[userIdx] = { ...updated[userIdx], translation: userTranslationValue };
          }
          return [...updated, { role: 'ai', text: `${aiVi} | ${aiTrans}`, id: aiMsgId }];
        });

        speakWord(`${aiVi} | ${aiTrans}`, aiMsgId);
      }
    } catch (error) {
      console.error("Mai AI Error:", error);
    } finally {
      setIsThinking(false);
      isProcessingRef.current = false;
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
          <p className="text-slate-400 mb-10 font-medium italic">"Dạ, Mai chào {userPronoun}. Rất vui được làm bạn!"</p>
          <div className="flex gap-4 justify-center mb-10">
            {(['EN', 'RU'] as const).map(l => (
              <button key={l} onClick={() => setSelectedLang(l)} className={`px-8 py-3 rounded-2xl font-black transition-all ${selectedLang === l ? 'bg-orange-600 text-white shadow-lg' : 'bg-orange-50 text-orange-400'}`}>
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
    <div className="w-full h-full bg-slate-900 flex items-center justify-center md:p-4 overflow-hidden relative font-sans">
      <div className="w-full h-full max-w-6xl bg-white md:rounded-[3rem] flex flex-col md:flex-row overflow-hidden shadow-2xl">
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

        <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
          <header className="px-6 py-4 border-b border-slate-50 flex items-center justify-between bg-white z-10">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Heart size={14} className="text-orange-500" fill="currentColor"/> {t.ui_learning_title}</span>
            <div className="flex gap-2">
              <button onClick={() => setSpeechRate(prev => prev === 1.0 ? 0.8 : 1.0)} className="bg-orange-50 text-orange-600 px-3 py-1.5 rounded-xl font-black text-[10px] flex items-center gap-2 uppercase tracking-tighter">
                <Gauge size={14}/> {speechRate === 1.0 ? 'Normal' : 'Slow'}
              </button>
              {onBack && (
                 <button onClick={onBack} className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-xl font-black text-[10px] uppercase">BACK</button>
              )}
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-4 md:p-10 space-y-6 bg-orange-50/10 custom-scrollbar">
            {messages.map((msg) => {
              const parts = (msg.text || "").split('|');
              const isActive = activeVoiceId === msg.id;
              return (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-5 rounded-[2rem] transition-all duration-300 shadow-sm ${isActive ? 'ring-4 ring-orange-100 scale-[1.02]' : ''} ${msg.role === 'user' ? 'bg-orange-600 text-white rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none border border-orange-100'}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="text-base font-bold leading-relaxed">{msg.role === 'ai' ? renderInteractiveText(parts[0]) : parts[0]}</div>
                      <button onClick={() => speakWord(msg.text, msg.id)} className={`p-2 rounded-xl shrink-0 ${msg.role === 'user' ? 'text-orange-200' : 'text-orange-600'}`}><Volume2 size={18}/></button>
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

          <footer className="p-6 md:p-8 bg-white border-t border-slate-100 flex gap-3 pb-10">
            <input 
                type="text" 
                value={userInput} 
                onChange={e => setUserInput(e.target.value)} 
                onKeyDown={e => e.key === 'Enter' && handleSendMessage(userInput)} 
                placeholder={t.ui_placeholder} 
                className="flex-1 px-6 py-4 bg-slate-100 rounded-[1.5rem] outline-none font-bold shadow-inner" 
            />
            <button onClick={() => handleSendMessage(userInput)} disabled={isThinking} className="bg-orange-500 text-white px-8 rounded-[1.5rem] shadow-lg hover:bg-orange-600 active:scale-95 transition-all flex items-center justify-center">
                <Send size={20}/>
            </button>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default AInewfriendMai;

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Send, Volume2, Gauge, Maximize, Minimize, Utensils } from 'lucide-react';
// ĐỒNG BỘ: Sử dụng hàm lấy key xoay vòng tập trung
import { generateContentWithRetry } from '../config/apiKeys';

// --- DICTIONARY: TỪ VỰNG NHÀ HÀNG ---
const DICTIONARY: Record<string, { EN: string; type: string }> = {
  "thực đơn": { EN: "menu", type: "Noun" },
  "gọi món": { EN: "to order", type: "Verb" },
  "phở bò": { EN: "beef noodle soup", type: "Noun" },
  "bún chả": { EN: "grilled pork with noodles", type: "Noun" },
  "nước suối": { EN: "mineral water", type: "Noun" },
  "thanh toán": { EN: "to pay", type: "Verb" },
  "tính tiền": { EN: "check / bill", type: "Verb" },
  "đặt bàn": { EN: "to book a table", type: "Verb" },
  "người": { EN: "people", type: "Noun" },
  "ngon": { EN: "delicious", type: "Adj" }
};

const LANGUAGES = {
  EN: {
    label: "English",
    ui_welcome: "Welcome to our Restaurant! I'm Linh.",
    ui_start: "BOOK A TABLE",
    ui_placeholder: "Type to talk to Linh...",
    ui_status: "Online - Expert Waitress",
    ui_learning_title: "Restaurant Talk with Linh",
    welcome_msg: "Dạ, em chào Anh! Chào mừng Anh đến với nhà hàng ạ. Anh đi mấy người để em xếp bàn cho mình ạ? ✨ | Hi! Welcome to our restaurant. How many people are in your group? ✨",
    systemPromptLang: "English"
  },
  RU: {
    label: "Русский",
    ui_welcome: "Добро пожаловать в наш ресторан!",
    ui_start: "ЗАБРОНИРОВАТЬ",
    ui_placeholder: "Поговори с Линь здесь...",
    ui_status: "Online - Эксперт",
    ui_learning_title: "Trò chuyện với Linh",
    welcome_msg: "Dạ, em chào Anh! Chào mừng Anh đến với nhà hàng ạ. Anh đi mấy người để em xếp bàn cho mình ạ? ✨ | Здравствуйте! Сколько вас человек? ✨",
    systemPromptLang: "Russian"
  }
};

const getSystemPrompt = (targetLangName: string) => {
  return `You are Linh (22 years old), a professional and polite waitress at a Vietnamese restaurant.
ROLE: You are a waitress taking orders, NOT a teacher or language assistant.
STRICT RULE 1: Speak ONLY natural, polite Vietnamese. Use "Dạ", "ạ", xưng "Em" gọi khách là "Anh".
STRICT RULE 2: Keep responses extremely short (1-2 sentences).
STRICT RULE 3: DO NOT explain grammar. DO NOT give lessons. Just serve the customer.
STRICT RULE 4: Focus on: greeting, seating, taking food/drink orders, and billing.
FORMAT: Vietnamese_Text | ${targetLangName}_Translation | USER_TRANSLATION: [Brief translation of user's last message]`;
};

export const GameSpeakAIRestaurant: React.FC<{ character: any }> = ({ character }) => {
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

  const speakWord = useCallback(async (text: string, msgId: string | null = null) => {
    if (!text) return;
    if (msgId) setActiveVoiceId(msgId);
    const cleanText = text.split('|')[0].replace(/(\d+)k/g, '$1 nghìn').replace(/[*#]/g, '').trim();
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(cleanText)}&tl=vi&client=tw-ob`;
    audioRef.current.src = url;
    audioRef.current.playbackRate = speechRate;
    audioRef.current.play().catch(console.error);
    audioRef.current.onended = () => setActiveVoiceId(null);
  }, [speechRate]);

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
  }, [selectedLang]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isProcessingRef.current) return;
    isProcessingRef.current = true;
    setIsThinking(true);

    const userMsgId = `user-${Date.now()}`;
    const newUserMsg = { role: 'user', text: text.trim(), id: userMsgId, translation: null };
    setMessages(prev => [...prev, newUserMsg]);
    setUserInput("");

    try {
      // THE CHỐT: Lọc lịch sử để AI không bị "nhiễm" thói quen giải thích
      const chatHistory = messages.map(m => ({
        role: m.role === 'ai' ? 'model' : 'user',
        parts: [{ text: m.text.split('|')[0].trim() }]
      }));

      const response = await generateContentWithRetry({
        model: 'gemini-3-flash-preview',
        contents: [...chatHistory, { role: 'user', parts: [{ text: text.trim() }] }],
        config: { 
            systemInstruction: getSystemPrompt(t.systemPromptLang)
        }
      });

      const rawAiResponse = response.text || "";
      const parts = rawAiResponse.split('|');
      const aiVi = parts[0]?.replace(/USER_TRANSLATION:.*$/gi, '').trim() || "";
      const aiTrans = parts[1]?.replace(/USER_TRANSLATION:.*$/gi, '').trim() || "";
      
      const userTransMatch = rawAiResponse.match(/USER_TRANSLATION:\s*\[(.*?)\]/is);
      const userTranslationValue = userTransMatch ? userTransMatch[1].trim() : "";

      const aiMsgId = `ai-${Date.now()}`;
      const cleanDisplay = `${aiVi} | ${aiTrans}`;

      setMessages(prev => {
        const updated = [...prev];
        const userIdx = updated.findIndex(m => m.id === userMsgId);
        if (userIdx !== -1 && userTranslationValue) {
            updated[userIdx] = { ...updated[userIdx], translation: userTranslationValue };
        }
        return [...updated, { role: 'ai', text: cleanDisplay, id: aiMsgId }];
      });

      speakWord(cleanDisplay, aiMsgId);

    } catch (e) {
      console.error("Gemini Error:", e);
    } finally {
      setIsThinking(false);
      isProcessingRef.current = false;
    }
  };

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const renderInteractiveText = (text: string) => {
    return text.split(/(\s+)/).map((word, idx) => {
      const clean = word.toLowerCase().replace(/[.,!?;]/g, '');
      const entry = DICTIONARY[clean];
      if (entry) {
        return (
          <span key={idx} className="group relative border-b border-dotted border-orange-400 cursor-help text-orange-700 font-bold">
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
      <div className="w-full h-full bg-orange-50 flex items-center justify-center p-4">
        <div className="w-full max-w-xl bg-white rounded-[3rem] shadow-2xl p-10 text-center border-[12px] border-orange-100">
          <img src={character.avatarUrl} className="w-40 h-40 mx-auto mb-6 rounded-3xl border-4 border-orange-400 object-cover shadow-lg" />
          <h1 className="text-3xl font-black text-orange-700 mb-2 uppercase italic">Restaurant Mode 🍽️</h1>
          <p className="text-slate-400 mb-8 font-medium italic">{t.ui_welcome}</p>
          <div className="flex flex-col gap-6 items-center">
            <div className="flex gap-3">
              {(['EN', 'RU'] as const).map(l => (
                <button key={l} onClick={() => setSelectedLang(l)} className={`px-8 py-2 rounded-xl font-bold transition-all ${selectedLang === l ? 'bg-orange-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}>{l}</button>
              ))}
            </div>
            <button onClick={() => { setGameState('playing'); setMessages([{ role: 'ai', text: t.welcome_msg, id: 'init' }]); speakWord(t.welcome_msg, 'init'); }} 
              className="bg-orange-600 text-white px-16 py-4 rounded-2xl font-black text-xl shadow-xl hover:scale-105 transition-all flex items-center gap-3">
              <Utensils size={24}/> {t.ui_start}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={gameContainerRef} className="w-full h-full bg-slate-900 flex flex-col md:flex-row overflow-hidden md:p-4">
      <div className="h-[20vh] md:h-full md:w-1/3 bg-[#F7F8FA] p-4 flex flex-row md:flex-col items-center justify-between border-r border-slate-100 shrink-0 z-20 shadow-2xl">
        <div className="flex flex-row md:flex-col items-center gap-4">
          <div className="w-20 h-20 md:w-52 md:h-52 rounded-3xl overflow-hidden border-4 border-white shadow-xl">
            <img src={character.avatarUrl} className="w-full h-full object-cover" />
          </div>
          <div className="text-left md:text-center">
            <h2 className="text-xl font-black text-slate-800 italic">Linh 🍽️</h2>
            <p className="text-[10px] font-black uppercase text-green-500 tracking-widest">{t.ui_status}</p>
          </div>
        </div>
        <button onClick={() => isRecording ? recognitionRef.current?.stop() : recognitionRef.current?.start()} 
          className={`w-14 h-14 md:w-20 md:h-20 rounded-full flex items-center justify-center shadow-2xl transition-all ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-orange-600 shadow-orange-200'}`}>
          {isRecording ? <MicOff color="white" /> : <Mic color="white" />}
        </button>
      </div>

      <div className="flex-1 bg-white flex flex-col overflow-hidden relative">
        <div className="px-6 py-4 border-b flex justify-between items-center bg-white shadow-sm">
          <span className="font-black text-orange-600 text-xs uppercase tracking-widest">{t.ui_learning_title}</span>
          <button onClick={() => setSpeechRate(prev => prev === 1.0 ? 0.7 : 1.0)} className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-[10px] font-black uppercase">
            {speechRate === 1.0 ? 'Normal Speed' : 'Slow Speed'}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-orange-50/5 custom-scrollbar">
          {messages.map((msg) => {
            const parts = msg.text.split('|');
            return (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-2xl shadow-sm ${msg.role === 'user' ? 'bg-orange-600 text-white' : 'bg-white text-slate-800 border border-orange-100'}`}>
                  <div className="text-sm md:text-base font-bold flex items-start gap-2">
                    <span className="flex-1">{msg.role === 'ai' ? renderInteractiveText(parts[0]) : msg.text}</span>
                    <button onClick={() => speakWord(msg.text, msg.id)} className="opacity-50 hover:opacity-100 transition-opacity"><Volume2 size={16}/></button>
                  </div>
                  {(parts[1] || msg.translation) && (
                    <div className="mt-2 pt-2 border-t border-black/5 text-[11px] italic opacity-70">
                      {msg.role === 'ai' ? parts[1] : msg.translation}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {isThinking && <div className="text-[10px] font-black text-orange-400 animate-pulse italic ml-4 uppercase tracking-tighter">Linh đang ghi món...</div>}
          <div ref={chatEndRef} />
        </div>

        <div className="p-4 bg-white border-t flex gap-2">
          <input type="text" value={userInput} onChange={e => setUserInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendMessage(userInput)}
            placeholder={t.ui_placeholder} className="flex-1 bg-slate-50 px-4 py-3 rounded-xl outline-none font-bold text-sm border-2 border-transparent focus:border-orange-100 transition-all" />
          <button onClick={() => handleSendMessage(userInput)} className="bg-emerald-500 text-white px-6 rounded-xl shadow-lg active:scale-95 transition-all"><Send size={18}/></button>
        </div>
      </div>
    </div>
  );
};

export default GameSpeakAIRestaurant;

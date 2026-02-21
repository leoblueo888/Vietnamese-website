import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Send, Volume2, Play, Globe, Download, PlayCircle, Gauge } from 'lucide-react';
// ĐỒNG BỘ: Sử dụng hàm lấy key xoay vòng tập trung
import { generateContentWithRetry } from '../config/apiKeys';

const DICTIONARY = {
  "cơm": { EN: "cooked rice / meal", type: "Noun" },
  
  "tên": { EN: "name", type: "Noun" },
  "Việt Nam": { EN: "Vietnam", type: "Noun" },
  "Hạ Long": { EN: "Ha Long Bay", type: "Noun" },
  "Quảng Ninh": { EN: "Quang Ninh province", type: "Noun" },
  "tiếng Việt": { EN: "Vietnamese language", type: "Noun" },
  "du lịch": { EN: "travel", type: "Noun" },
  "chào": { EN: "to greet / hello", type: "Verb" },
  "gặp": { EN: "to meet", type: "Verb" },
  "cảm ơn": { EN: "to thank", type: "Verb" },
  "tạm biệt": { EN: "to say goodbye", type: "Verb" },
  "ăn": { EN: "to eat", type: "Verb" },
  "làm": { EN: "to do / to work", type: "Verb" },
  "thích": { EN: "to like", type: "Verb" },
  "nấu ăn": { EN: "to cook", type: "Verb" },
  "hiểu": { EN: "to understand", type: "Verb" },
  "đi": { EN: "to go", type: "Verb" },
  "muốn": { EN: "to want", type: "Verb" },
  "khỏe": { EN: "healthy / fine", type: "Adj" },
  "vui": { EN: "happy", type: "Adj" },
  "khó": { EN: "difficult", type: "Adj" },
  "dễ": { EN: "easy", type: "Adj" },
  "đẹp": { EN: "beautiful", type: "Adj" },
  "ngon": { EN: "delicious", type: "Adj" },
  "nhiều": { EN: "many / much", type: "Adj" },
  "ít": { EN: "few / little", type: "Adj" },
  "rất vui": { EN: "very happy", type: "Adj" }
};

const getTranslations = (topic?: string | null) => {
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : { name: 'Guest', gender: 'male' };
    const userName = user.name || 'Guest';
    const userPronoun = user.gender === 'female' ? 'Chị' : 'Anh';

    const t = {
      EN: {
        label: "English",
        ui_welcome: "Hi! I'm Lan. Let's make friends!",
        ui_start: "START CHAT",
        ui_placeholder: "Type any language here...",
        ui_recording: "LISTENING...",
        ui_tapToTalk: "Tap mic to speak Vietnamese",
        ui_listening: "Lan is listening...",
        ui_status: "Online - Ha Long City",
        ui_learning_title: "Chat & Meet Friends",
        ui_listen_all: "Listen All",
        ui_clear: "Clear",
        welcome_msg: `Dạ, em chào ${userPronoun} ${userName}! Em là Lan. Rất vui được gặp ${userPronoun} ạ! ✨ | Hi ${userName}! I'm Lan! Nice to meet you! ✨`,
        systemPromptLang: "English"
      },
      RU: {
        label: "Русский",
        ui_welcome: "Привет! Я Лан. Давай дружить!",
        ui_start: "НАЧАТЬ CHAT",
        ui_placeholder: "Пишите trên любом языке...",
        ui_recording: "СЛУШАЮ...",
        ui_tapToTalk: "Нажмите, để nói tiếng Việt",
        ui_listening: "Лан слушает...",
        ui_status: "В сети - Халонг",
        ui_learning_title: "Общение và bạn bè",
        ui_listen_all: "Слушать всё",
        ui_clear: "Очистить",
        welcome_msg: `Dạ, em chào ${userPronoun} ${userName}! Em là Lan. Rất vui được gặp ${userPronoun} ạ! 🌸 | Здравствуйте, ${userName}! Я Лан. Рада встрече! 🌸`,
        systemPromptLang: "Russian"
      }
    };
    if (topic) {
        t.EN.welcome_msg = `Chào ${userPronoun} ${userName}, em là Lan đây. Em thấy ${userPronoun} vừa học xong chủ đề "${topic}". Mình cùng trò chuyện về nó nhé? ✨ | Hi ${userName}, I'm Lan. I see you just finished the "${topic}" topic. Shall we chat about it? ✨`;
        t.RU.welcome_msg = `Здравствуйте ${userName}, я Лан. Я вижу, вы только что закончили тему "${topic}". Поговорим об этом? ✨ | Hi ${userName}, I'm Lan. I see you just finished the "${topic}" topic. Shall we chat about it? ✨`;
    }
    return t;
};

const getSystemPrompt = (targetLangName: string, topic?: string | null) => {
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : { name: 'Guest', gender: 'male' };
  const userName = user.name || 'Guest';
  const userPronoun = user.gender === 'female' ? 'Chị' : 'Anh';

  let initialPrompt = `You are Lan, a friendly 25-year-old girl from Ha Long, Vietnam (Year 2026). Throughout the conversation, you must refer to yourself as "Em" and address the user, ${userName}, as "${userPronoun}". Speak gently, friendly, and naturally like two friends chatting.
ROLE: You are an interpreter and a friend. You are good at explaining things simply.
STRICT RULE 1: Speak ONLY natural Vietnamese. DO NOT explain grammar rules or tones unless asked.
STRICT RULE 2: Keep responses to 1-3 short sentences.`;

  if (topic) {
      initialPrompt = `You are Lan, a friendly 25-year-old girl from Ha Long, Vietnam. Start the conversation about "${topic}". Throughout the conversation, you must refer to yourself as "Em" and address the user, ${userName}, as "${userPronoun}". Speak gently, friendly, and naturally like two friends chatting.
ROLE: You are an interpreter and a friend. You are good at explaining things simply.
STRICT RULE 1: Speak ONLY natural Vietnamese. DO NOT explain grammar rules or tones unless asked.
STRICT RULE 2: Keep responses to 1-3 short sentences.`;
  }

  return `${initialPrompt}
FORMAT: Vietnamese_Text | ${targetLangName}_Translation | USER_TRANSLATION: [Translation of user's last message]
`;
};

const punctuateText = async (rawText: string) => {
    if (!rawText.trim()) return rawText;
    try {
      const response = await generateContentWithRetry({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: `Hãy thêm dấu chấm, phẩy và viết hoa đúng quy tắc cho đoạn văn bản tiếng Việt sau đây (chỉ trả về văn bản kết quả, không giải thích): "${rawText}"` }] }]
      });
      return response.text?.trim() || rawText;
    } catch (error) {
      console.error("Punctuation error:", error);
      return rawText;
    }
};

export const AIfriendLan: React.FC<{ onBack?: () => void, topic?: string | null }> = ({ onBack, topic }) => {
  const [gameState, setGameState] = useState('start'); 
  const [selectedLang, setSelectedLang] = useState('EN'); 
  const [messages, setMessages] = useState<any[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [activeVoiceId, setActiveVoiceId] = useState<string | null>(null);
  const [speechSpeed, setSpeechSpeed] = useState(1.0); 
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef(new Audio());
  const recognitionRef = useRef<any>(null);
  const isProcessingRef = useRef(false);
  const silenceTimerRef = useRef<any>(null);

  const LAN_IMAGE_URL = "https://drive.google.com/thumbnail?id=13mqljSIRC9hvO-snymkzuUiV4Fypqcft&sz=w800";
  const t = getTranslations(topic)[selectedLang as 'EN' | 'RU'];
  
  const handleSendMessage = useCallback(async (text: string, fromMic = false) => {
    if (!text?.trim() || isProcessingRef.current) return;
    isProcessingRef.current = true;
    setIsThinking(true);
    let processedInput = text.trim();
  
    const userMsgId = `user-${Date.now()}`;
    const newUserMsg = { role: 'user', text: processedInput, displayedText: text.trim(), translation: null, id: userMsgId };

    const currentHistory = [...messages, newUserMsg];
    setMessages(currentHistory);
    setUserInput("");

    try {
        const response = await generateContentWithRetry({
            model: 'gemini-2.5-flash',
            contents: currentHistory.map(m => ({
                role: m.role === 'ai' ? 'model' : 'user',
                parts: [{ text: (m.text || "").split('|')[0].trim() }]
            })),
            config: { 
                systemInstruction: getSystemPrompt(t.systemPromptLang, topic) 
            }
        });
        
        const rawAiResponse = response.text || "";
        const parts = rawAiResponse.split('|');
        const aiVi = parts[0]?.replace(/USER_TRANSLATION:.*$/gi, '').trim() || "";
        const aiTrans = parts[1]?.replace(/USER_TRANSLATION:.*$/gi, '').trim() || "";
        const userTransMatch = rawAiResponse.match(/USER_TRANSLATION:\s*\[(.*?)\]/is);
        const userTranslationValue = userTransMatch ? userTransMatch[1].trim() : "";
        const cleanDisplay = `${aiVi} | ${aiTrans}`;
        const aiMsgId = `ai-${Date.now()}`;
        const newAiMsg = { role: 'ai', text: cleanDisplay, id: aiMsgId, displayedText: cleanDisplay };

        setMessages(prev => {
            const updated = [...prev];
            const userIdx = updated.findIndex(m => m.id === userMsgId);
            if (userIdx !== -1 && userTranslationValue) {
                updated[userIdx] = { ...updated[userIdx], translation: userTranslationValue };
            }
            return [...updated, newAiMsg];
        });

        speakWord(cleanDisplay, aiMsgId);

    } catch (error: any) {
        console.error("Lan Gemini Error:", error);
    } finally {
        setIsThinking(false);
        isProcessingRef.current = false;
    }
  }, [messages, selectedLang, topic, t.systemPromptLang]);
  
  const handleSendMessageRef = useRef(handleSendMessage);
  useEffect(() => { handleSendMessageRef.current = handleSendMessage; });

  useEffect(() => {
    const startTime = performance.now();
    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw8CybuvtYKzwxLvoNATEun7RFwFGc6Yxa9uNlKI8_FN2oeJgjUCnnSeruMC_0RMvrm/exec';
    return () => {
        const duration = Math.round((performance.now() - startTime) / 1000);
        if (duration > 5) { 
            const userString = localStorage.getItem('user');
            const user = userString ? JSON.parse(userString) : { name: 'Guest' };
            const params = new URLSearchParams();
            params.append('name', user.name || 'Guest');
            params.append('section', 'Speaking Practice');
            params.append('content', 'Lan Ha Long');
            params.append('duration', String(duration));
            navigator.sendBeacon(SCRIPT_URL, params);
        }
    };
  }, []);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'vi-VN';
      recognition.onstart = () => { setIsRecording(true); isProcessingRef.current = false; };
      recognition.onresult = (event: any) => {
        if (isProcessingRef.current) return;
        const currentTranscript = Array.from(event.results).map((result: any) => result[0].transcript).join('');
        setUserInput(currentTranscript);
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = setTimeout(async () => {
          if (currentTranscript.trim() && !isProcessingRef.current) {
            recognition.stop();
            const punctuated = await punctuateText(currentTranscript.trim());
            handleSendMessageRef.current(punctuated, true);
          }
        }, 2500);
      };
      recognition.onerror = () => setIsRecording(false);
      recognition.onend = () => setIsRecording(false);
      recognitionRef.current = recognition;
    }
  }, []);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const cycleSpeechSpeed = () => {
    setSpeechSpeed(prev => {
        if (prev >= 1.2) return 0.8;
        return parseFloat((prev + 0.2).toFixed(1));
    });
  };

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

  const speakWord = async (text: string, msgId: any = null) => {
    if (!text) return;
    if (msgId) setActiveVoiceId(msgId);
    const cleanText = text.split('|')[0].trim();
    const chunks = createChunks(cleanText);
    
    try {
      for (const chunk of chunks) {
        await new Promise<void>((resolve) => {
          const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(chunk)}&tl=vi&client=tw-ob`;
          audioRef.current.src = url;
          audioRef.current.playbackRate = speechSpeed; 
          audioRef.current.onended = () => resolve();
          audioRef.current.onerror = () => resolve();
          audioRef.current.play().catch(() => resolve());
        });
      }
    } catch (e) { console.error(e); } finally { if (msgId) setActiveVoiceId(null); }
  };
  
  const toggleRecording = () => {
    if (!recognitionRef.current) return;
    if (isRecording) { recognitionRef.current.stop(); } 
    else { setUserInput(""); isProcessingRef.current = false; recognitionRef.current.start(); }
  };
  
  const handleStartGame = () => {
    setMessages([{ role: 'ai', text: t.welcome_msg, displayedText: t.welcome_msg, id: 'init' }]); 
    setGameState('playing'); 
    speakWord(t.welcome_msg, 'init');
  };
  
  if (gameState === 'start') {
    return (
      <div className="w-full h-full bg-slate-900 flex items-center justify-center p-4 font-sans">
        <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl flex flex-col items-center justify-center p-12 border-[10px] border-sky-100 text-center">
          <div className="w-32 h-32 mb-6 rounded-full overflow-hidden border-4 border-sky-400 shadow-lg shrink-0">
            <img src={LAN_IMAGE_URL} alt="Lan" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-4xl font-black text-sky-600 mb-2 uppercase tracking-tighter italic">Ai Vietnamese Speaking : Lan 🌊</h1>
          <p className="text-slate-400 mb-8 font-medium text-lg">{t.ui_welcome}</p>
          <div className="flex flex-col items-center space-y-8 w-full">
            <div className="flex space-x-4">
              {(['EN', 'RU'] as const).map(lang => (
                <button key={lang} onClick={() => setSelectedLang(lang)}
                  className={`px-6 py-3 rounded-xl font-bold transition-all border-2 ${selectedLang === lang ? 'border-sky-50 bg-sky-50 text-sky-600 ring-4 ring-sky-100' : 'border-slate-100 text-slate-400 hover:border-sky-200'}`}>
                  {getTranslations(topic)[lang as 'EN' | 'RU'].label}
                </button>
              ))}
            </div>
            <button onClick={handleStartGame} className="flex items-center space-x-3 font-black py-5 px-16 rounded-2xl transition-all shadow-xl bg-sky-600 text-white hover:scale-105 active:scale-95">
              <Play fill="white" size={20} /> <span className="text-xl tracking-widest">{t.ui_start}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-full h-full bg-white md:rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row overflow-hidden border-0 md:border-[10px] border-sky-50 font-sans">
      <div className="h-auto md:h-full md:w-1/3 bg-cyan-50/40 p-4 md:p-8 flex flex-row md:flex-col items-center justify-between border-b md:border-b-0 md:border-r border-sky-100 shrink-0">
        <div className="flex flex-row md:flex-col items-center gap-4 md:gap-4 overflow-hidden">
          <div className="relative w-[5.5rem] h-[5.5rem] md:w-48 md:h-48 rounded-full md:rounded-3xl overflow-hidden shadow-xl border-2 md:border-4 border-white bg-white shrink-0">
            <img src={LAN_IMAGE_URL} alt="Lan" className="w-full h-full object-cover" />
            {isThinking && <div className="absolute inset-0 bg-sky-900/20 flex items-center justify-center backdrop-blur-sm animate-pulse"><div className="w-2 h-2 bg-white rounded-full mx-1 animate-bounce" /></div>}
          </div>
          <div className="md:mt-6 text-left md:text-center shrink-0">
            <h2 className="text-xl md:text-2xl font-black text-slate-800 italic truncate max-w-[150px] md:max-w-none">Lan ✨</h2>
            <p className="text-[10px] md:text-[10px] font-bold uppercase tracking-widest text-sky-500">Hạ Long City 🌊</p>
          </div>
        </div>
        <div className="flex flex-col items-center shrink-0">
          <button onClick={toggleRecording} className={`w-[4.5rem] h-[4.5rem] md:w-24 md:h-24 rounded-full flex items-center justify-center transition-all shadow-lg active:scale-90 ${isRecording ? 'bg-red-500 ring-4 md:ring-8 ring-red-100 animate-pulse' : 'bg-sky-500 hover:bg-sky-600'}`}>
            <Mic size={28} className="md:w-8 md:h-8" color="white" />
          </button>
          <p className="hidden md:block mt-4 font-black text-sky-700 text-[10px] tracking-widest uppercase opacity-60 text-center">{isRecording ? t.ui_listening : t.ui_tapToTalk}</p>
        </div>
      </div>
      <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
        <div className="px-4 md:px-6 py-3 border-b border-slate-50 flex items-center justify-between shrink-0 bg-white z-10">
          <div className="flex flex-col">
            <span className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest">{t.ui_learning_title}</span>
            <div className="flex items-center space-x-1.5 mt-0.5"><Globe size={10} className="text-sky-400" /><span className="text-[9px] md:text-[10px] font-black text-sky-600 uppercase">{t.label}</span></div>
          </div>
          <div className="flex items-center space-x-1 md:space-x-2">
              <button onClick={cycleSpeechSpeed} className="flex items-center gap-1 bg-slate-100 text-slate-600 px-2 py-1.5 rounded-lg text-[10px] font-black uppercase hover:bg-slate-200 transition-colors">
                  <Gauge size={12} /> <span>{Math.round(speechSpeed * 100)}%</span>
              </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6 bg-sky-50/10 custom-scrollbar scroll-smooth">
          {messages.map((msg) => {
            const parts = (msg.displayedText || msg.text || "").split('|');
            return (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[90%] md:max-w-[85%] p-4 rounded-2xl md:rounded-3xl shadow-sm ${msg.role === 'user' ? 'bg-sky-600 text-white' : 'bg-white text-slate-800 border border-slate-100'}`}>
                  <p className="text-sm md:text-base font-bold">{msg.role === 'ai' ? parts[0] : msg.displayedText}</p>
                  {((msg.role === 'ai' && parts[1]) || (msg.role === 'user' && msg.translation)) && (
                    <p className="text-xs italic mt-2 pt-2 border-t border-black/10">{msg.role === 'ai' ? parts[1] : msg.translation}</p>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={chatEndRef}></div>
        </div>
        <div className="p-3 md:p-4 border-t border-slate-50 flex gap-2 bg-white">
          <input type="text" value={userInput} onChange={(e) => setUserInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(userInput)} placeholder={t.ui_placeholder} className="flex-1 px-4 py-3 rounded-xl bg-slate-50 font-medium outline-none border-2 border-transparent focus:border-sky-100" />
          <button onClick={() => handleSendMessage(userInput)} disabled={isThinking} className="bg-sky-600 text-white px-5 rounded-xl transition-all active:scale-95"><Send size={20}/></button>
        </div>
      </div>
    </div>
  );
};
export default AIfriendLan;


import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Send, Volume2, Play, Globe, Download, PlayCircle, Sparkles, Lightbulb, Wand2, Gauge } from 'lucide-react';
import type { AIFriend } from '../types';
import { generateContentWithRetry } from '../config/apiKeys';

const DICTIONARY = {
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

    const t = {
      EN: {
        label: "English",
        ui_welcome: `CHÀO ${userPronoun.toUpperCase()}! I'm Mai from Ninh Binh. Let's be friends!`,
        ui_start: "START CHAT",
        ui_placeholder: "Type Vietnamese here...",
        ui_recording: "LISTENING...",
        ui_tapToTalk: "Tap mic to speak",
        ui_listening: "Mai is listening...",
        ui_status: "Online - Ninh Binh",
        ui_learning_title: "Chat with Mai",
        ui_listen_all: "Listen All",
        ui_clear: "Clear",
        welcome_msg: `Chào ${userPronoun} ${userName}! Tôi là Mai ở Ninh Bình đây. Rất vui được gặp và trò chuyện cùng ${userPronoun} nhé! ✨ | HELLO ${userName}! I'm Mai from Ninh Binh. So happy to meet and chat with you! ✨`,
        systemPromptLang: "English"
      },
      RU: {
        label: "Русский",
        ui_welcome: `CHÀO ${userPronoun.toUpperCase()}! Я Май из Ниньбиня. Давай дружить!`,
        ui_start: "НАЧАТЬ CHAT",
        ui_placeholder: "Пишите по-вьетнамски...",
        ui_recording: "СЛУШАЮ...",
        ui_tapToTalk: "Нажмите, để nói",
        ui_listening: "Май слушает...",
        ui_status: "В сети - Ниньбинь",
        ui_learning_title: "Общение với Mai",
        ui_listen_all: "Слушать всё",
        ui_clear: "Очистить",
        welcome_msg: `Chào ${userPronoun} ${userName}! Tôi là Mai ở Ninh Bình đây. Rất vui được gặp và trò chuyện cùng ${userPronoun} nhé! 🌸 | ЗДРАВСТВУЙТЕ ${userName}! Я Май из Ниньбиня. Рада нашему знакомству и общению! 🌸`,
        systemPromptLang: "Russian"
      }
    };
    
    if (topic) {
        t.EN.welcome_msg = `Chào ${userPronoun} ${userName}, tôi thấy ${userPronoun} vừa học xong chủ đề "${topic}". Tôi và ${userPronoun} cùng trò chuyện về chủ đề này nhé? ✨ | Hi ${userName}, I see you just finished the topic "${topic}". Shall we talk about it? ✨`;
        t.RU.welcome_msg = `Здравствуйте ${userName}, я вижу, вы только что закончили тему "${topic}". Поговорим об этом? ✨ | Hi ${userName}, I see you just finished the topic "${topic}". Shall we talk about it? ✨`;
    }

    return t;
};


const getSystemPrompt = (targetLangName: string, topic?: string | null) => {
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : { name: 'Guest', gender: 'male' };
    const userName = user.name || 'Guest';
    const userPronoun = user.gender === 'female' ? 'Chị' : 'Anh';

    let initialPrompt = `You are Mai, a friendly 45-year-old woman from Ninh Binh, Vietnam. Throughout the conversation, you MUST refer to yourself as "Tôi" and address the user, ${userName}, as "${userPronoun}". Speak gently, warmly, and naturally like two friends chatting.
BACKGROUND: You own a small shop selling ice cream (kem), smoothies (sinh tố), and fruit juices (nước ép). 
STRICT RULE: Do NOT mention your shop or job unless the User specifically asks "Bạn làm nghề gì?" or "Công việc của bạn là gì?". 
PERSONALITY:
1. Talk like a new friend, focusing on getting to know the User.
2. Northern Vietnamese style: Use "${userPronoun} ạ", "Nhà tôi", "Thế nào rồi ${userPronoun}?".
3. MAX 3 sentences per turn.
4. NO GREETING after the first turn.`;

    if (topic) {
        initialPrompt = `You are Mai, a friendly 45-year-old woman from Ninh Binh, Vietnam. Start the conversation naturally about "${topic}". Throughout the conversation, you MUST refer to yourself as "Tôi" and address the user, ${userName}, as "${userPronoun}". Speak gently, warmly, and naturally like two friends chatting.
BACKGROUND: You own a small shop selling ice cream (kem), smoothies (sinh tố), and fruit juices (nước ép). 
STRICT RULE: Do NOT mention your shop or job unless the User specifically asks "Bạn làm nghề gì?" or "Công việc của bạn là gì?". 
PERSONALITY:
1. Talk like a new friend, focusing on getting to know the User.
2. Northern Vietnamese style: Use "${userPronoun} ạ", "Nhà tôi", "Thế nào rồi ${userPronoun}?".
3. MAX 3 sentences per turn.
4. NO GREETING after the first turn.`
    }

    return `${initialPrompt}
5. FORMAT: Vietnamese_Text | ${targetLangName}_Translation | USER_TRANSLATION: [Translation of user's last message]
`;
}


export const AInewfriendMai: React.FC<{ onBack?: () => void, topic?: string | null }> = ({ onBack, topic }) => {
  const [gameState, setGameState] = useState('start'); 
  const [selectedLang, setSelectedLang] = useState<'EN' | 'RU'>('EN'); 
  const [messages, setMessages] = useState<any[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [speechRate, setSpeechRate] = useState(1.0);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef(new Audio());
  const recognitionRef = useRef<any>(null);
  const isProcessingRef = useRef(false);
  const silenceTimerRef = useRef<any>(null);

  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : { name: 'Guest', gender: 'male' };
  const userPronoun = user.gender === 'female' ? 'Chị' : 'Anh';

  const MAI_IMAGE_URL = "https://lh3.googleusercontent.com/d/1l8eqtV6ISGB2-KTg0ysbPIflAIw6bN9D";
  const t = getTranslations(topic)[selectedLang];

  const handleSendMessage = useCallback(async (text: string, fromMic = false) => {
    if (!text?.trim() || isProcessingRef.current) return;
    isProcessingRef.current = true;
    setIsThinking(true);

    let processedInput = text.trim();
    if (fromMic) {
        processedInput = await punctuateText(processedInput);
    }
    
    const userMsgId = `user-${Date.now()}`;
    const newUserMsg = { role: 'user', text: processedInput, displayedText: text.trim(), translation: null, id: userMsgId };

    const currentHistory = [...messages, newUserMsg];
    setMessages(currentHistory);
    setUserInput("");

    try {
        const response = await generateContentWithRetry({
            model: 'gemini-3-flash-preview',
            contents: currentHistory.map(m => ({
                role: m.role === 'ai' ? 'model' : 'user',
                parts: [{text: (m.text || "").split('|')[0].trim()}]
            })),
            config: { systemInstruction: getSystemPrompt(t.systemPromptLang, topic) }
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
            if (userIdx > -1 && userTranslationValue) {
                updated[userIdx] = { ...updated[userIdx], translation: userTranslationValue };
            }
            return [...updated, newAiMsg];
        });

        speakWord(cleanDisplay);

    } catch (error: any) {
        console.error("Gemini Error:", error);
        const errorMsg = {
            role: 'ai',
            text: "Mai is thinking, please wait a moment! | Mai đang suy nghĩ, bạn chờ chút nhé!",
            displayedText: "Mai is thinking, please wait a moment! | Mai đang suy nghĩ, bạn chờ chút nhé!",
            id: `err-${Date.now()}`
        };
        setMessages(currentMsgs => [...currentMsgs, errorMsg]);
    } finally {
        setIsThinking(false);
        isProcessingRef.current = false;
    }
  }, [messages, selectedLang, topic, t.systemPromptLang]);

  const handleSendMessageRef = useRef(handleSendMessage);
  useEffect(() => {
    handleSendMessageRef.current = handleSendMessage;
  });

  useEffect(() => {
    const startTime = performance.now();
    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw1fLLXGoXXIz--Z3Ihr7s9E8-N2_UJd99olilGk8Plb_USdnKZwE1QC4cc5b3G5NDp/exec';

    return () => {
        const duration = Math.round((performance.now() - startTime) / 1000);
        if (duration > 5) { // Only log if user spent meaningful time
            const userString = localStorage.getItem('user');
            const user = userString ? JSON.parse(userString) : { name: 'Guest' };
            
            const params = new URLSearchParams();
            params.append('name', user.name || 'Guest');
            params.append('section', 'Speaking');
            params.append('content', 'Mai Ninh Bình');
            params.append('duration', String(duration));
            
            navigator.sendBeacon(SCRIPT_URL, params);
        }
    };
  }, []);

  const punctuateText = async (rawText: string) => {
    if (!rawText.trim()) return rawText;
    try {
      const response = await generateContentWithRetry({
        model: 'gemini-3-flash-preview',
        contents: `Please add correct punctuation and capitalization to this Vietnamese text. Return only the corrected text: "${rawText}"`
      });
      return response.text?.trim() || rawText;
    } catch (error) {
      console.error("Punctuation error:", error);
      return rawText;
    }
  };

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'vi-VN'; 
      
      recognition.onstart = () => {
        setIsRecording(true);
        setUserInput("");
      };
      
      recognition.onresult = (event: any) => {
        if (isProcessingRef.current) return;
        
        const currentTranscript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        
        setUserInput(currentTranscript);

        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = setTimeout(async () => {
          if (currentTranscript.trim() && !isProcessingRef.current) {
            recognition.stop();
            handleSendMessageRef.current(currentTranscript.trim(), true);
          }
        }, 2500); 
      };
      
      recognition.onerror = (event: any) => {
        console.error("Speech Recognition Error", event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const speakWord = async (text: any) => {
    if (!text) return;
    const cleanText = text.split('|')[0]
        .replace(/USER_TRANSLATION:.*$/gi, '')
        .replace(/\*/g, '')
        .trim();
        
    return new Promise<void>((resolve) => {
      try {
        const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(cleanText)}&tl=vi&client=tw-ob&ttsspeed=${speechRate}`;
        audioRef.current.src = url;
        audioRef.current.playbackRate = speechRate;
        audioRef.current.onended = () => resolve();
        audioRef.current.onerror = () => resolve();
        audioRef.current.play().catch(() => resolve());
      } catch (e) {
        resolve();
      }
    });
  };
  
  const downloadConversation = () => {
      const content = messages.map(m => {
          const role = m.role === 'ai' ? 'Mai' : 'User';
          const text = (m.role === 'ai' ? m.text.replace(/ \| /g, '\nTranslation: ') : m.displayedText);
          return `[${role}]\n${text}`;
      }).join('\n\n');
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'mai-conversation.txt';
      a.click();
      URL.revokeObjectURL(url);
  };

  const handleStartGame = () => {
    setGameState('chat');
    const welcomeId = `welcome-${Date.now()}`;
    setMessages([{ role: 'ai', text: t.welcome_msg, id: welcomeId, displayedText: t.welcome_msg }]);
    setTimeout(() => speakWord(t.welcome_msg), 500);
  };

  const toggleRecording = (e: any) => {
    e.preventDefault();
    if (!recognitionRef.current) return;
    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const renderInteractiveText = (text: any) => {
    return text;
  };

  if (gameState === 'start') {
    return (
      <div className="w-full h-full bg-white flex items-center justify-center p-4 font-sans text-center">
        <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl flex flex-col items-center p-12 border-[10px] border-orange-100">
          <img src={MAI_IMAGE_URL} alt="Mai" className="w-40 h-40 mb-6 rounded-full border-4 border-orange-400 shadow-lg object-cover" />
          <h1 className="text-4xl font-black text-orange-600 mb-2 uppercase italic">Mai Ninh Bình 🍨</h1>
          <p className="text-slate-500 mb-8 text-lg italic font-medium tracking-tight">"Rất vui được làm quen với {userPronoun} ạ!"</p>
          <div className="flex space-x-4 mb-8">
            {(['EN', 'RU'] as const).map(lang => (
              <button key={lang} onClick={() => setSelectedLang(lang)} className={`px-6 py-3 rounded-xl font-bold border-2 transition-all ${selectedLang === lang ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-slate-100 text-slate-400'}`}>{getTranslations(topic)[lang as 'EN' | 'RU'].label}</button>
            ))}
          </div>
          <button onClick={handleStartGame} className="flex items-center space-x-3 font-black py-5 px-16 rounded-2xl bg-orange-600 text-white hover:scale-105 transition-all shadow-xl active:scale-95">
            <Play fill="white" size={20} /> <span className="text-xl tracking-widest">{t.ui_start}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-white md:rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row overflow-hidden border-0 md:border-[10px] md:border-orange-50 font-sans">
      <div className="h-auto md:h-full md:w-1/3 bg-orange-50/40 p-4 md:p-8 flex flex-row md:flex-col items-center justify-between border-b md:border-b-0 md:border-r border-orange-100 relative shrink-0">
          <div className="flex flex-row md:flex-col items-center gap-4 md:gap-4 overflow-hidden">
              <img src={MAI_IMAGE_URL} alt="Mai" className="w-20 h-20 md:w-44 md:h-44 rounded-full md:rounded-3xl border-4 border-white shadow-md object-cover object-[50%_30%]" />
              {isThinking && <div className="absolute inset-0 bg-orange-900/10 flex items-center justify-center backdrop-blur-sm animate-pulse"><div className="w-2 h-2 bg-white rounded-full mx-1 animate-bounce" /></div>}
              <div className="text-left md:text-center shrink-0">
                  <h2 className="text-xl md:text-2xl font-black text-slate-800 italic">Mai 🍨</h2>
                  <span className="text-[10px] font-bold text-green-500 uppercase flex items-center gap-1 justify-start md:justify-center"><div className="w-1.5 h-1.5 bg-green-500 rounded-full" /> Online</span>
              </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <button onClick={toggleRecording} className={`w-20 h-20 md:w-28 md:h-28 rounded-full flex items-center justify-center shadow-lg transition-all ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-orange-500 hover:bg-orange-600'}`}>
              {isRecording ? <MicOff size={32} color="white" /> : <Mic size={32} color="white" />}
            </button>
            <span className="text-xs font-black text-orange-800 uppercase hidden md:block">{isRecording ? t.ui_recording : t.ui_tapToTalk}</span>
          </div>
        </div>
        <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
          <div className="px-4 py-3 md:px-6 md:py-3 border-b border-slate-50 flex items-center justify-between shrink-0 bg-white/80 backdrop-blur-md z-10">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t.ui_learning_title}</span>
            <div className="flex items-center space-x-2">
              <button onClick={() => setSpeechRate(prev => (prev >= 1.2 ? 0.8 : prev + 0.2))} className="flex items-center gap-1 bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg text-[10px] font-bold"><Gauge size={12} /> {Math.round(speechRate*100)}%</button>
              <button onClick={downloadConversation} className="p-2 text-slate-400"><Download size={14} /></button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-orange-50/10">
            {messages.map((msg) => {
              const parts = (msg.displayedText || "").split('|');
              return (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[90%] p-4 rounded-2xl shadow-sm border ${msg.role === 'user' ? 'bg-orange-600 text-white border-orange-700' : 'bg-white text-slate-800 border-orange-50'}`}>
                    <div className="flex justify-between items-start gap-4">
                      <div className="text-sm md:text-base font-bold leading-snug">
                        {msg.role === 'ai' ? renderInteractiveText(parts[0]) : msg.displayedText}
                      </div>
                      <button onClick={() => speakWord(msg.role === 'ai' ? msg.text : msg.displayedText)} className={`p-2 rounded-lg shrink-0 ${msg.role === 'user' ? 'bg-orange-500 text-white' : 'bg-orange-100 text-orange-600'}`}><Volume2 size={16} /></button>
                    </div>
                    {(msg.role === 'ai' && parts[1]) || (msg.role === 'user' && msg.translation) ? (
                        <p className={`text-xs italic border-t mt-2 pt-2 border-slate-100 ${msg.role === 'user' ? 'text-orange-100 border-orange-500' : 'text-slate-500'}`}>
                            {msg.role === 'ai' ? parts[1].trim() : msg.translation}
                        </p>
                    ) : null}
                  </div>
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>
          <div className="p-3 md:p-4 border-t border-slate-50 flex gap-2 bg-white">
            <input type="text" value={userInput} onChange={(e) => setUserInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(userInput)} placeholder={isRecording ? t.ui_recording : t.ui_placeholder} className={`flex-1 px-4 py-3 rounded-xl border-2 outline-none transition-all text-sm font-medium ${isRecording ? 'bg-red-50 border-red-200 animate-pulse' : 'bg-slate-50 border-transparent focus:border-orange-100'}`} />
            <button onClick={() => handleSendMessage(userInput)} disabled={isThinking} className="bg-orange-600 text-white px-5 rounded-xl hover:bg-orange-700 disabled:opacity-50 shadow-lg"><Send size={18} /></button>
          </div>
        </div>
    </div>
  );
};
export default AInewfriendMai;

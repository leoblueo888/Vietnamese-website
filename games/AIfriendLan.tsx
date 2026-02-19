import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Send, Volume2, Play, Globe, Download, PlayCircle, Gauge } from 'lucide-react';
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
        ui_start: "НАCHАTЬ CHAT",
        ui_placeholder: "Пишите на любом языке...",
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

  let initialPrompt = `You are Lan, a friendly 25-year-old girl from Ha Long, Vietnam. Throughout the conversation, you must refer to yourself as "Em" and address the user, ${userName}, as "${userPronoun}". Speak gently, friendly, and naturally like two friends chatting.
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
        contents: [{ role: 'user', parts: [{ text: `Please add correct punctuation and capitalization to this Vietnamese text. Return only the corrected text: "${rawText}"` }] }]
      });
      return response.text?.trim() || rawText;
    } catch (error) {
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

  const LAN_IMAGE_URL = "https://i.ibb.co/p6686S6/lan-avatar.png"; 
  const t = getTranslations(topic)[selectedLang as 'EN' | 'RU'];
  
  const handleSendMessage = useCallback(async (text: string, fromMic = false) => {
    if (!text?.trim() || isProcessingRef.current) return;
    isProcessingRef.current = true;
    setIsThinking(true);
    let processedInput = text.trim().replace(/["'*]/g, '');
      
    if (!fromMic) {
        try {
          const fixResponse = await generateContentWithRetry({
            model: 'gemini-2.5-flash',
            contents: [{ role: 'user', parts: [{ text: `Detect the language of this message: "${processedInput}". If it's NOT Vietnamese, translate it accurately to Vietnamese. Return ONLY the Vietnamese result text.` }] }]
          });
          if (fixResponse.text) processedInput = fixResponse.text.trim().replace(/^["'*]+|["'*]+$/g, '');
        } catch (e) { console.error(e); }
    }
  
    const userMsgId = `user-${Date.now()}`;
    const newUserMsg = { role: 'user', text: processedInput, displayedText: text.trim(), translation: null, id: userMsgId };
    const currentHistory = [...messages, newUserMsg];
    setMessages(currentHistory);
    setUserInput("");

    try {
        // Đã sửa: Truyền systemInstruction trực tiếp, không bọc trong config
        const response = await generateContentWithRetry({
            model: 'gemini-2.5-flash',
            contents: currentHistory.map(m => ({
                role: m.role === 'ai' ? 'model' : 'user',
                parts: [{ text: (m.text || "").split('|')[0].trim() }]
            })),
            systemInstruction: getSystemPrompt(t.systemPromptLang, topic) 
        });
        
        const rawAiResponse = response.text || "";
        const parts = rawAiResponse.split('|');
        const aiVi = parts[0]?.replace(/USER_TRANSLATION:.*$/gi, '').trim() || "";
        const aiTrans = parts[1]?.replace(/USER_TRANSLATION:.*$/gi, '').trim() || "";
        const userTransMatch = rawAiResponse.match(/USER_TRANSLATION:\s*\[(.*?)\]/is);
        const userTranslationValue = userTransMatch ? userTransMatch[1].trim() : "";
        const cleanDisplay = `${aiVi} | ${aiTrans}`;
        const aiMsgId = `ai-${Date.now()}`;

        setMessages(prev => {
            const updated = [...prev];
            const userIdx = updated.findIndex(m => m.id === userMsgId);
            if (userIdx !== -1 && userTranslationValue) {
                updated[userIdx] = { ...updated[userIdx], translation: userTranslationValue };
            }
            return [...updated, { role: 'ai', text: cleanDisplay, id: aiMsgId, displayedText: cleanDisplay }];
        });

        speakWord(cleanDisplay, aiMsgId);
    } catch (error: any) {
        setMessages(currentMsgs => [...currentMsgs, { role: 'ai', text: "Lan đang suy nghĩ, bạn chờ chút nhé! | Lan is thinking, please wait...", id: `err-${Date.now()}` }]);
    } finally {
        setIsThinking(false);
        isProcessingRef.current = false;
    }
  }, [messages, selectedLang, topic, t.systemPromptLang]);
  
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'vi-VN';
      recognition.onstart = () => setIsRecording(true);
      recognition.onresult = (event: any) => {
        const currentTranscript = Array.from(event.results).map((result: any) => result[0].transcript).join('');
        setUserInput(currentTranscript);
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = setTimeout(async () => {
          if (currentTranscript.trim() && !isProcessingRef.current) {
            recognition.stop();
            const punctuated = await punctuateText(currentTranscript.trim());
            handleSendMessage(punctuated, true);
          }
        }, 2500);
      };
      recognition.onerror = () => setIsRecording(false);
      recognition.onend = () => setIsRecording(false);
      recognitionRef.current = recognition;
    }
  }, [handleSendMessage]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const speakWord = async (text: string, msgId: any = null) => {
    if (!text) return;
    if (msgId) setActiveVoiceId(msgId);
    const cleanText = text.split('|')[0].replace(/["'*]/g, '').trim();
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(cleanText)}&tl=vi&client=tw-ob`;
    audioRef.current.src = url;
    audioRef.current.playbackRate = speechSpeed;
    audioRef.current.onended = () => setActiveVoiceId(null);
    audioRef.current.play().catch(() => setActiveVoiceId(null));
  };
  
  const toggleRecording = () => {
    if (!recognitionRef.current) return;
    isRecording ? recognitionRef.current.stop() : (setUserInput(""), recognitionRef.current.start());
  };
  
  if (gameState === 'start') {
    return (
      <div className="w-full h-full bg-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl bg-white rounded-3xl p-12 text-center border-[10px] border-sky-100">
          <img src={LAN_IMAGE_URL} alt="Lan" className="w-32 h-32 mx-auto mb-6 rounded-full border-4 border-sky-400 object-cover" />
          <h1 className="text-4xl font-black text-sky-600 mb-2 italic uppercase">Ai Vietnamese : Lan 🌊</h1>
          <p className="text-slate-400 mb-8">{t.ui_welcome}</p>
          <div className="flex flex-col items-center space-y-6">
            <div className="flex space-x-4">
              {['EN', 'RU'].map(lang => (
                <button key={lang} onClick={() => setSelectedLang(lang)} className={`px-6 py-2 rounded-xl font-bold border-2 ${selectedLang === lang ? 'bg-sky-50 border-sky-600 text-sky-600' : 'border-slate-100 text-slate-400'}`}>{getTranslations(topic)[lang as 'EN' | 'RU'].label}</button>
              ))}
            </div>
            <button onClick={() => { setGameState('playing'); handleSendMessage(t.welcome_msg); }} className="bg-sky-600 text-white px-12 py-4 rounded-2xl font-black text-xl hover:scale-105 transition-all uppercase tracking-widest">Bắt đầu</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-white md:rounded-[2.5rem] flex flex-col md:flex-row overflow-hidden border-[10px] border-sky-50">
      <div className="md:w-1/3 bg-cyan-50/40 p-6 flex flex-col items-center justify-between border-r border-sky-100">
        <div className="text-center">
          <div className="relative w-48 h-48 mx-auto rounded-3xl overflow-hidden shadow-xl border-4 border-white">
            <img src={LAN_IMAGE_URL} alt="Lan" className="w-full h-full object-cover" />
            {isThinking && <div className="absolute inset-0 bg-sky-900/20 flex items-center justify-center backdrop-blur-sm"><div className="w-2 h-2 bg-white rounded-full animate-bounce"></div></div>}
          </div>
          <h2 className="text-2xl font-black mt-4 italic">Lan ✨</h2>
          <p className="text-xs font-bold text-sky-500 uppercase tracking-widest">Hạ Long City 🌊</p>
        </div>
        <button onClick={toggleRecording} className={`w-24 h-24 rounded-full flex items-center justify-center shadow-lg transition-all ${isRecording ? 'bg-red-500 animate-pulse ring-8 ring-red-100' : 'bg-sky-500'}`}><Mic size={32} color="white" /></button>
      </div>
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <span className="font-black text-slate-400 uppercase text-xs">{t.ui_learning_title}</span>
          <button onClick={() => setSpeechSpeed(s => s >= 1.2 ? 0.8 : s + 0.2)} className="bg-slate-100 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-widest"><Gauge size={14} className="inline mr-1"/> {Math.round(speechSpeed * 100)}%</button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-sky-50/10">
          {messages.map((msg) => {
            const parts = (msg.text || "").split('|');
            return (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-2xl shadow-sm ${msg.role === 'user' ? 'bg-sky-600 text-white' : 'bg-white border border-slate-100 text-slate-800'}`}>
                  <p className="font-bold text-sm md:text-base">{parts[0]}</p>
                  {parts[1] && <p className="text-xs italic mt-2 border-t pt-2 opacity-70">{parts[1]}</p>}
                  {msg.role === 'user' && msg.translation && <p className="text-xs italic mt-2 border-t pt-2 opacity-70">{msg.translation}</p>}
                </div>
              </div>
            );
          })}
          <div ref={chatEndRef}></div>
        </div>
        <div className="p-4 border-t flex gap-2">
          <input type="text" value={userInput} onChange={(e) => setUserInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(userInput)} placeholder={t.ui_placeholder} className="flex-1 px-4 py-3 bg-slate-50 rounded-xl outline-none" />
          <button onClick={() => handleSendMessage(userInput)} className="bg-sky-600 text-white px-6 rounded-xl"><Send size={20}/></button>
        </div>
      </div>
    </div>
  );
};

export default AIfriendLan;

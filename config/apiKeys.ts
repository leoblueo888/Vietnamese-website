import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Send, Volume2, Play, Globe, Download, PlayCircle, Gauge } from 'lucide-react';
import { generateContentWithRetry } from '../config/apiKeys';

// ... (Giữ nguyên phần DICTIONARY của ông)

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

  // THAY ĐỔI ẢNH ĐỂ KIỂM TRA CẬP NHẬT
  const LAN_IMAGE_URL = "https://i.ibb.co/6P0fM3K/lan-new.png"; 
  const t = getTranslations(topic)[selectedLang as 'EN' | 'RU'];
  
  const handleSendMessage = useCallback(async (text: string, fromMic = false) => {
    if (!text?.trim() || isProcessingRef.current) return;
    isProcessingRef.current = true;
    setIsThinking(true);
    let processedInput = text.trim().replace(/["'*]/g, '');
      
    if (!fromMic) {
        try {
          const prompt = `Detect the language of this message: "${processedInput}". If it's NOT Vietnamese, translate it accurately to Vietnamese. Return ONLY the Vietnamese result text without any quotes, stars, or explanations.`;
          const fixResponse = await generateContentWithRetry({
            model: 'gemini-2.5-flash', 
            contents: [{ role: 'user', parts: [{ text: prompt }] }]
          });
          const aiResult = fixResponse.text;
          if (aiResult) processedInput = aiResult.trim().replace(/^["'*]+|["'*]+$/g, '');
        } catch (e: any) { 
            console.error("Input processing error:", e);
        }
    }
  
    const userMsgId = `user-${Date.now()}`;
    const newUserMsg = { role: 'user', text: processedInput, displayedText: text.trim(), translation: null, id: userMsgId };

    const currentHistory = [...messages, newUserMsg];
    setMessages(currentHistory);
    setUserInput("");

    try {
        // SỬA CẤU TRÚC GỌI API ĐỂ TRÁNH LỖI CONFIG
        const response = await generateContentWithRetry({
            model: 'gemini-2.5-flash',
            contents: currentHistory.map(m => ({
                role: m.role === 'ai' ? 'model' : 'user',
                parts: [{ text: (m.text || "").split('|')[0].trim() }]
            })),
            systemInstruction: getSystemPrompt(t.systemPromptLang, topic) // Truyền thẳng systemInstruction
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
        console.error("Gemini Error:", error);
        const errorMsg = {
            role: 'ai',
            text: "Lan is thinking, please wait a moment! | Lan đang suy nghĩ, bạn chờ chút nhé!",
            displayedText: "Lan is thinking, please wait a moment! | Lan đang suy nghĩ, bạn chờ chút nhé!",
            id: `err-${Date.now()}`
        };
        setMessages(currentMsgs => [...currentMsgs, errorMsg]);
    } finally {
        setIsThinking(false);
        isProcessingRef.current = false;
    }
  }, [messages, selectedLang, topic, t.systemPromptLang]);
  
  // ... (Giữ nguyên các useEffect và hàm hỗ trợ bên dưới cho đến khi render)

  if (gameState === 'start') {
    return (
      <div className="w-full h-full bg-slate-900 flex items-center justify-center p-4 font-sans">
        <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl flex flex-col items-center justify-center p-12 border-[10px] border-sky-100 text-center">
          <div className="w-32 h-32 mb-6 rounded-full overflow-hidden border-4 border-sky-400 shadow-lg shrink-0">
            <img src={LAN_IMAGE_URL} alt="Lan" className="w-full h-full object-cover" />
          </div>
          {/* TÊN GAME MỚI ĐỂ NHẬN BIẾT */}
          <h1 className="text-4xl font-black text-sky-600 mb-2 uppercase tracking-tighter italic">Conversation With Lan 🌸</h1>
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
  
  // ... (Phần render chính giữ nguyên cấu trúc UI tuyệt đẹp của ông)
  return (
    <div className="w-full h-full bg-white md:rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row overflow-hidden border-0 md:border-[10px] border-sky-50 font-sans">
      <div className="h-auto md:h-full md:w-1/3 bg-cyan-50/40 p-4 md:p-8 flex flex-row md:flex-col items-center justify-between border-b md:border-b-0 md:border-r border-sky-100 shrink-0">
        <div className="flex flex-row md:flex-col items-center gap-4 md:gap-4 overflow-hidden">
          <div className="relative w-[5.5rem] h-[5.5rem] md:w-48 md:h-48 rounded-full md:rounded-3xl overflow-hidden shadow-xl border-2 md:border-4 border-white bg-white shrink-0">
            <img src={LAN_IMAGE_URL} alt="Lan" className="w-full h-full object-cover" />
            {isThinking && <div className="absolute inset-0 bg-sky-900/20 flex items-center justify-center backdrop-blur-sm"><div className="flex space-x-1"><div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce"></div><div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:-.3s]"></div><div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:-.5s]"></div></div></div>}
          </div>
          <div className="md:mt-6 text-left md:text-center shrink-0">
            <h2 className="text-xl md:text-2xl font-black text-slate-800 italic truncate max-w-[150px] md:max-w-none">Lan 🌸</h2>
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
        {/* Phần tin nhắn và input giữ nguyên như code hiện tại */}
        <div className="px-4 md:px-6 py-3 border-b border-slate-50 flex items-center justify-between shrink-0 bg-white z-10">
          <div className="flex flex-col">
            <span className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest">{t.ui_learning_title}</span>
            <div className="flex items-center space-x-1.5 mt-0.5"><Globe size={10} className="text-sky-400" /><span className="text-[9px] md:text-[10px] font-black text-sky-600 uppercase">{t.label}</span></div>
          </div>
          <div className="flex items-center space-x-1 md:space-x-2">
              <button onClick={cycleSpeechSpeed} className="flex items-center gap-1 bg-slate-100 text-slate-600 px-2 py-1.5 rounded-lg text-[10px] font-black uppercase hover:bg-slate-200 transition-colors">
                  <Gauge size={12} /> <span>{Math.round(speechSpeed * 100)}%</span>
              </button>
              <button onClick={downloadConversation} className="flex items-center gap-1 bg-slate-100 text-slate-600 p-2 rounded-lg hover:bg-slate-200 transition-colors">
                  <Download size={12} />
              </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6 bg-sky-50/10 custom-scrollbar scroll-smooth">
          {messages.map((msg) => {
            const msgParts = (msg.displayedText || "").split('|');
            return (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[90%] md:max-w-[85%] p-4 rounded-2xl md:rounded-3xl shadow-sm ${msg.role === 'user' ? 'bg-sky-600 text-white' : 'bg-white text-slate-800 border border-slate-100'}`}>
                  <p className="text-sm md:text-base font-bold">
                    {msg.role === 'ai' ? msgParts[0] : msg.displayedText}
                  </p>
                  {(msg.role === 'ai' && msgParts[1]) || (msg.role === 'user' && msg.translation) ? (
                    <p className="text-xs italic mt-2 pt-2 border-t border-black/10">
                      {msg.role === 'ai' ? msgParts[1] : msg.translation}
                    </p>
                  ) : null}
                </div>
              </div>
            );
          })}
          <div ref={chatEndRef}></div>
        </div>
        <div className="p-3 md:p-4 border-t border-slate-50 flex gap-2 bg-white">
          <input 
            type="text" 
            value={userInput} 
            onChange={(e) => setUserInput(e.target.value)} 
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(userInput)} 
            placeholder={t.ui_placeholder}
            className="flex-1 px-4 py-3 rounded-xl bg-slate-50 font-medium"
          />
          <button onClick={() => handleSendMessage(userInput)} disabled={isThinking} className="bg-sky-600 text-white px-5 rounded-xl"><Send /></button>
        </div>
      </div>
    </div>
  );
};
export default AIfriendLan;

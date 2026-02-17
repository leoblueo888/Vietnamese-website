import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Send, Volume2, Play, Download, PlayCircle, Volume1, Maximize, Minimize } from 'lucide-react';
// FIX: AIFriend type should be imported from the central types.ts file, not from another component.
import type { AIFriend } from '../types';
import { GoogleGenAI } from '@google/genai';

// Từ điển phân loại cho cửa hàng hoa quả Nha Trang
const DICTIONARY = {
  "xoài cam lâm": { EN: "Cam Lam mango", type: "Noun" },
  "sầu riêng khánh sơn": { EN: "Khanh Son durian", type: "Noun" },
  "chôm chôm": { EN: "rambutan", type: "Noun" },
  "vú sữa": { EN: "star apple", type: "Noun" },
  "thanh long": { EN: "dragon fruit", type: "Noun" },
  "giỏ quà": { EN: "gift basket", type: "Noun" },
  "hoa quả": { EN: "fruit", type: "Noun" },
  "kg": { EN: "kilogram", type: "Noun" },
  "đặc sản": { EN: "specialty", type: "Noun" },
  "vườn": { EN: "garden / orchard", type: "Noun" },
  "túi": { EN: "bag", type: "Noun" },
  "dưa hấu": { EN: "watermelon", type: "Noun" },
  "nho mỹ": { EN: "US Grapes", type: "Noun" },
  "táo enovy": { EN: "Envy Apple", type: "Noun" },
  "ăn": { EN: "to eat", type: "Verb" },
  "mua": { EN: "to buy", type: "Verb" },
  "chọn": { EN: "to pick / choose", type: "Verb" },
  "cân": { EN: "to weigh", type: "Verb" },
  "giao hàng": { EN: "to deliver", type: "Verb" },
  "thanh toán": { EN: "to pay", type: "Verb" },
  "tư vấn": { EN: "to consult/advise", type: "Verb" },
  "chào": { EN: "to greet", type: "Verb" },
  "ngọt": { EN: "sweet", type: "Adj" },
  "thơm": { EN: "fragrant", type: "Adj" },
  "tươi": { EN: "fresh", type: "Adj" },
  "chín": { EN: "ripe", type: "Adj" },
  "giòn": { EN: "crunchy", type: "Adj" },
  "mọng nước": { EN: "juicy", type: "Adj" },
  "sạch": { EN: "clean / organic", type: "Adj" },
  "nhập khẩu": { EN: "imported", type: "Adj" },
  "ạ": { EN: "Polite particle", type: "Particle" },
  "nha": { EN: "Friendly particle", type: "Particle" },
  "luôn": { EN: "Right away", type: "Particle" },
  "thôi": { EN: "Just / only", type: "Particle" },
  "nhé": { EN: "Gentle suggestion", type: "Particle" },
  "đó": { EN: "That / Emphasis", type: "Particle" }
};

const LANGUAGES = {
  EN: {
    label: "English",
    ui_welcome: "Welcome to Hanh's Fruit Shop! I'm Hanh.",
    ui_start: "SHOP NOW",
    ui_placeholder: "Talk to Hanh here...",
    welcome_msg: "Dạ, em chào Anh! Anh ghé xem hoa quả sạp em đi ạ. Anh muốn mua trái gì ạ? ✨ | Hi! Welcome to my shop. Please check out my fruits. What fruit would you like to buy? ✨",
    systemPromptLang: "English"
  },
  RU: {
    label: "Русский",
    ui_welcome: "Добро пожаловать! Я Хань, продавец фруктов.",
    ui_start: "КУPИТЬ",
    ui_placeholder: "Поговори с Хань здесь...",
    welcome_msg: "Dạ, em chào Anh! Mời Anh xem hoa quả ạ. Anh muốn mua trái gì ạ? ✨ | Здравствуйте! Посмотрите фрукты, пожалуйста. Какие фрукты вы хотите купить? ✨",
    systemPromptLang: "Russian"
  }
};

const getSystemPrompt = (targetLangName: any) => `
You are Hạnh, a 20-year-old girl selling fresh fruits.
CONTEXT: You sell Local (Xoài Cam Lâm, Sầu riêng Khánh Sơn, Chôm chôm) and Imported fruits (Táo Envy, Nho Mỹ).

CONVERSATION LOGIC:
1. Speak concisely and energetically. No long paragraphs.
2. STEP-BY-STEP SELLING:
   - First interaction: Greet and always end with: "Anh muốn mua trái gì ạ?". Do NOT ask for kilograms yet.
   - Once the customer picks a fruit: Then ask "Anh mua mấy ký ạ?" or suggest a quantity.
   - Subsequent: Adapt naturally but stay brief.
3. Always use "Dạ", "ạ" for politeness. Call user "Anh", refer to self as "Em".
4. Provide prices clearly when asked (e.g., "Xoài Cam Lâm 45k/kg ạ").

FORMAT: Vietnamese_Text | ${targetLangName}_Translation
DO NOT include any other text or user translations.
`;

interface HanhAIfruitsellerProps {
  character: AIFriend;
}

export const HanhAIfruitseller: React.FC<HanhAIfruitsellerProps> = ({ character }) => {
  const [gameState, setGameState] = useState('start'); 
  const [selectedLang, setSelectedLang] = useState<'EN' | 'RU'>('EN'); 
  const [messages, setMessages] = useState<any[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [activeVoiceId, setActiveVoiceId] = useState<string | null>(null);
  const [speechRate, setSpeechRate] = useState(1.0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef(new Audio());
  const recognitionRef = useRef<any>(null);
  const isProcessingRef = useRef(false);
  const silenceTimerRef = useRef<number | null>(null);
  const apiKey = process.env.API_KEY; 

  const t = LANGUAGES[selectedLang];

  useEffect(() => {
    const handleFullscreen = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullscreen);
    return () => document.removeEventListener('fullscreenchange', handleFullscreen);
  }, []);

  const toggleFullscreen = () => {
    if (!gameContainerRef.current) return;
    if (!document.fullscreenElement) {
      gameContainerRef.current.requestFullscreen().catch(err => console.error(err));
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'vi-VN';

      recognition.onstart = () => { setIsRecording(true); setUserInput(""); };

      recognition.onresult = (event: any) => {
        if (isProcessingRef.current) return;
        let interim = "", final = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) final += event.results[i][0].transcript;
          else interim += event.results[i][0].transcript;
        }
        if (final || interim) setUserInput(final || interim);
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = window.setTimeout(() => {
          const textToProcess = (final || interim).trim();
          if (textToProcess && !isProcessingRef.current) {
            recognition.stop(); handleSendMessage(textToProcess, true);
          }
        }, 2500);
      };

      recognition.onerror = () => setIsRecording(false);
      recognition.onend = () => setIsRecording(false);
      recognitionRef.current = recognition;
    }
  }, [selectedLang]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const cycleSpeechRate = () => {
    setSpeechRate(prev => (prev >= 1.5 ? 0.7 : prev + 0.2));
  };

  const speak = async (text: string, msgId: string | null = null) => {
    if (!text) return;
    if (msgId) setActiveVoiceId(msgId);
    let cleanText = text.split('|')[0].trim().replace(/(\d+)k\b/g, '$1 nghìn');
    const segments = cleanText.split(/[,.!?;:]+/).filter(s => s.trim());
    try {
      for (const segment of segments) {
        await new Promise<void>((resolve) => {
          const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(segment)}&tl=vi&client=tw-ob`;
          audioRef.current.src = url;
          audioRef.current.playbackRate = speechRate;
          audioRef.current.onended = () => resolve();
          audioRef.current.onerror = () => resolve();
          audioRef.current.play().catch(() => resolve());
        });
      }
    } catch (e) { console.error(e); } finally { if (msgId === activeVoiceId) setActiveVoiceId(null); }
  };

  const handleSendMessage = async (text: string, fromMic = false) => {
    if (!text?.trim() || isProcessingRef.current) return;
    isProcessingRef.current = true;
    setIsThinking(true);
    
    const originalInput = text.trim();
    const processedInput = originalInput; // No more API pre-processing

    const userMsg = { role: 'user', text: processedInput, displayedText: originalInput, id: `user-${Date.now()}` };
    
    setMessages(prev => {
      const history = [...prev, userMsg];
      (async () => {
        try {
          const ai = new GoogleGenAI({apiKey});
          const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: history.map(m => ({ role: m.role === 'ai' ? 'model' : 'user', parts: [{ text: m.text }] })),
            config: { systemInstruction: getSystemPrompt(t.systemPromptLang) }
          });
          const aiText = response.text || "";
          const aiMsgId = `ai-${Date.now()}`;
          setMessages(current => [...current, { role: 'ai', text: aiText, id: aiMsgId, displayedText: aiText }]);
          speak(aiText, aiMsgId);
        } catch (error) {} finally { setIsThinking(false); isProcessingRef.current = false; }
      })();
      return history;
    });
    setUserInput("");
  };

  const toggleRecording = () => {
    if (!recognitionRef.current) return;
    isRecording ? recognitionRef.current.stop() : recognitionRef.current.start();
  };

  const renderText = (text: string) => {
    // Interactive text rendering logic...
    return text;
  };
  
  if (gameState === 'start') {
    return (
      <div className="w-full h-full bg-emerald-50 flex items-center justify-center p-4 font-sans text-slate-800">
        <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-8 md:p-12 border-4 border-emerald-100 text-center">
          <img src={character.avatarUrl} alt="Hạnh" className="w-40 h-40 mb-6 rounded-full border-4 border-emerald-400 object-cover mx-auto" />
          <h1 className="text-3xl font-black text-emerald-600 mb-2 uppercase italic">Hạnh's Fruit Market 🍎</h1>
          <p className="text-slate-400 mb-8 font-medium">{t.ui_welcome}</p>
          <div className="flex flex-col items-center gap-6 w-full">
            <div className="flex space-x-4">
              {(['EN', 'RU'] as const).map(lang => (
                <button key={lang} onClick={() => setSelectedLang(lang)} className={`px-6 py-3 rounded-xl font-bold border-2 transition-all ${selectedLang === lang ? 'bg-emerald-50 text-emerald-600' : 'text-slate-400'}`}>
                  {LANGUAGES[lang].label}
                </button>
              ))}
            </div>
            <button onClick={() => { setMessages([{ role: 'ai', text: t.welcome_msg, displayedText: t.welcome_msg, id: 'init' }]); setGameState('playing'); speak(t.welcome_msg, 'init'); }} className="flex items-center gap-3 font-black py-4 px-12 rounded-2xl bg-emerald-600 text-white hover:scale-105 transition-all shadow-lg">
              <Play fill="white" size={18} /> <span className="text-lg tracking-widest">{t.ui_start}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={gameContainerRef} className="w-full h-full bg-white flex flex-col md:flex-row font-sans relative">
      <div className="h-[25vh] md:h-full md:w-1/3 bg-emerald-50/40 p-4 md:p-6 flex flex-row md:flex-col items-center justify-between border-b md:border-r border-emerald-100">
          <div className="flex flex-row md:flex-col items-center gap-4">
              <img src={character.avatarUrl} alt="Hạnh" className="w-24 h-24 md:w-48 md:h-48 rounded-full border-4 border-white shadow-lg object-cover" />
              <div className="md:mt-4 text-left md:text-center">
                  <h2 className="text-xl md:text-2xl font-black text-slate-800 italic">Em Hạnh 🍎</h2>
                  <p className="text-xs font-bold text-emerald-600">Online - Fruit Seller</p>
              </div>
          </div>
          <button onClick={toggleRecording} className={`w-20 h-20 md:w-28 md:h-28 rounded-full flex items-center justify-center shadow-lg transition-all ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-emerald-600'}`}>
            <Mic size={40} color="white" />
          </button>
      </div>

      <div className="h-[75vh] md:h-full md:w-2/3 flex flex-col relative">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between shrink-0">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Chat with Hanh</h3>
              <div className="flex items-center gap-2">
                <button onClick={cycleSpeechRate} className="bg-slate-100 text-slate-600 px-3 py-2 rounded-lg font-bold text-xs">{Math.round(speechRate*100)}% Speed</button>
              </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-emerald-50/20">
              {messages.map(msg => {
                const parts = (msg.displayedText || "").split('|');
                return (
                  <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-4 rounded-2xl shadow-sm ${msg.role === 'user' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-800 border'}`}>
                        <p className="text-base font-bold">{msg.role === 'ai' ? renderText(parts[0]) : parts[0]}</p>
                        {parts[1] && <p className="text-xs italic mt-2 pt-2 border-t border-black/10">{parts[1]}</p>}
                    </div>
                  </div>
                )
              })}
              <div ref={chatEndRef}></div>
          </div>
          
          <div className="p-4 bg-white border-t border-slate-100 flex gap-3">
              <input type="text" value={userInput} onChange={e => setUserInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSendMessage(userInput)} placeholder="Type to Hanh..." className="flex-1 px-4 py-3 rounded-xl bg-slate-100 focus:outline-none"/>
              <button onClick={() => handleSendMessage(userInput)} disabled={isThinking} className="bg-emerald-600 text-white px-6 rounded-xl"><Send /></button>
          </div>
      </div>
      <button onClick={toggleFullscreen} className="absolute bottom-4 right-4 z-50 p-2 bg-slate-800/50 text-white rounded-full hover:bg-slate-800 transition-colors">
          {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
      </button>
    </div>
  );
};
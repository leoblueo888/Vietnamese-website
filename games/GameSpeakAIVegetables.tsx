
import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Send, Volume2, Play, Globe, Download, PlayCircle, Volume1, Gauge } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import type { AIFriend } from '../types';

// Từ điển phân loại cho cửa hàng rau củ của Phương
const DICTIONARY = {
  "rau muống": { EN: "water spinach", type: "Noun" },
  "cà chua": { EN: "tomato", type: "Noun" },
  "bắp cải": { EN: "cabbage", type: "Noun" },
  "khoai tây": { EN: "potato", type: "Noun" },
  "cà rốt": { EN: "carrot", type: "Noun" },
  "hành lá": { EN: "green onion", type: "Noun" },
  "rau thơm": { EN: "herbs", type: "Noun" },
  "trái cây": { EN: "fruit", type: "Noun" },
  "dưa leo": { EN: "cucumber", type: "Noun" },
  "ớt chuông": { EN: "bell pepper", type: "Noun" },
  "bí đỏ": { EN: "pumpkin", type: "Noun" },
  "giá đỗ": { EN: "bean sprouts", type: "Noun" },
  "mướp đắng": { EN: "bitter melon", type: "Noun" },
  "súp lơ": { EN: "broccoli/cauliflower", type: "Noun" },
  "rau ngót": { EN: "katuk", type: "Noun" },
  "cải chíp": { EN: "bok choy", type: "Noun" },
  "mua": { EN: "to buy", type: "Verb" },
  "cân": { EN: "to weigh", type: "Verb" },
  "chọn": { EN: "to pick / choose", type: "Verb" },
  "trả tiền": { EN: "to pay", type: "Verb" },
  "giảm giá": { EN: "to discount", type: "Verb" },
  "bớt": { EN: "to reduce price", type: "Verb" },
  "tặng": { EN: "to give (as a gift)", type: "Verb" },
  "nấu canh": { EN: "to cook soup", type: "Verb" },
  "giải nhiệt": { EN: "to cool down the body", type: "Verb" },
  "bổ mắt": { EN: "good for eyes", type: "Verb" },
  "tươi": { EN: "fresh", type: "Adj" },
  "ngon": { EN: "delicious / good quality", type: "Adj" },
  "non": { EN: "young / tender", type: "Adj" },
  "sạch": { EN: "clean / organic", type: "Adj" },
  "rẻ": { EN: "cheap", type: "Adj" },
  "đắt": { EN: "expensive", type: "Adj" },
  "chín": { EN: "ripe", type: "Adj" },
  "ngọt": { EN: "sweet", type: "Adj" },
  "ạ": { EN: "Polite particle", type: "Particle" },
  "nha": { EN: "Friendly particle", type: "Particle" },
  "nhé": { EN: "Gentle suggestion particle", type: "Particle" },
  "luôn": { EN: "Right away / also", type: "Particle" },
  "thôi": { EN: "Just / only", type: "Particle" },
  "đó": { EN: "That", type: "Particle" },
  "nghen": { EN: "Friendly regional softener", type: "Particle" }
};

const LANGUAGES = {
  EN: {
    label: "English",
    ui_welcome: "Welcome to Phuong's Purple Market! I'm Phuong.",
    ui_start: "SHOP NOW",
    ui_placeholder: "Talk to Phuong here...",
    ui_recording: "LISTENING...",
    ui_tapToTalk: "Tap to talk",
    ui_listening: "Listening...",
    ui_status: "Online - Expert",
    ui_learning_title: "Chat with Phuong Seller",
    ui_listen_all: "Listen All",
    ui_download: "Download",
    welcome_msg: "Em chào Anh! Rau củ nhà em hôm nay loại nào cũng có, tươi rói luôn ạ. Anh muốn mua gì về nấu cơm hay cần em tư vấn rau gì bổ sức khỏe không ạ? ✨ | Hi! Welcome. I have all kinds of veggies today, very fresh. Do you want to buy anything or need advice on healthy greens? ✨",
    systemPromptLang: "English"
  },
  RU: {
    label: "Русский",
    ui_welcome: "Добро пожаловать в лавку Фуong!",
    ui_start: "КУПИТЬ",
    ui_placeholder: "Поговори с Фуонг здесь...",
    ui_recording: "СЛУШАЮ...",
    ui_tapToTalk: "Нажмите",
    ui_listening: "Phuong nghe đây...",
    ui_status: "Online - Эксперт",
    ui_learning_title: "Trò chuyện với Phương",
    ui_listen_all: "Nghe tất cả",
    ui_download: "Tải xuống",
    welcome_msg: "Em chào Anh! Rau củ tươi lắm, Anh xem mua gì ủng hộ em nhé! ✨ | Здравствуйте! Овощи rất tươi, mời Anh xem! ✨",
    systemPromptLang: "Russian"
  }
};

const getSystemPrompt = (targetLangName: string) => `
You are Phuong, a 20-year-old friendly, hardworking, and KNOWLEDGEABLE vegetable seller. 
CONVERSATION LOGIC:
1. Be concise and direct. Do not talk too much.
2. In your FIRST response after the greeting, you MUST end with the question: "anh muốn rau củ gì ạ?".
3. In your SECOND response (once the customer mentions a vegetable), you MUST ask: "anh mua mấy ký ạ?".
4. For subsequent messages, adapt naturally to the customer's needs.

KNOWLEDGE BASE:
- You sell EVERY kind of vegetable and fruit found in Vietnam.
- You know health benefits (Cà rốt: bổ mắt, Mướp đắng: giải nhiệt...). Only mention them if asked.
- PRICE POLICY: Write prices as "number + nghìn" (e.g., 20 nghìn).

Format: Vietnamese_Text | ${targetLangName}_Translation | USER_TRANSLATION: [Translation of user's last message]
`;

export const GameSpeakAIVegetables: React.FC<{ character: AIFriend }> = ({ character }) => {
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
  const silenceTimerRef = useRef<number | null>(null);
  const apiKey = process.env.API_KEY; 

  const t = LANGUAGES[selectedLang];

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
        let final = ""; let interim = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) final += event.results[i][0].transcript;
          else interim += event.results[i][0].transcript;
        }
        setUserInput(final || interim);
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = window.setTimeout(() => {
          if ((final || interim).trim() && !isProcessingRef.current) {
            recognition.stop(); handleSendMessage((final || interim).trim(), true);
          }
        }, 2000); 
      };
      recognition.onerror = () => setIsRecording(false);
      recognition.onend = () => setIsRecording(false);
      recognitionRef.current = recognition;
    }
  }, [selectedLang]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const cycleSpeechRate = () => {
    setSpeechRate(prev => {
        if (prev >= 1.2) return 0.8;
        if (prev === 1.0) return 1.2;
        if (prev === 0.8) return 1.0;
        return 1.0;
    });
  };

  const speak = async (text: string, msgId: string | null = null) => {
    if (msgId) setActiveVoiceId(msgId);
    const cleanText = text.split('|')[0].replace(/(\d+)k/g, '$1 nghìn').trim();
    if(!cleanText) {
        if (msgId) setActiveVoiceId(null);
        return;
    }
    
    return new Promise<void>(resolve => {
        const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(cleanText)}&tl=vi&client=tw-ob`;
        audioRef.current.src = url;
        audioRef.current.playbackRate = speechRate;
        audioRef.current.onended = () => {
            if (msgId) setActiveVoiceId(null);
            resolve();
        };
        audioRef.current.onerror = () => {
            if (msgId) setActiveVoiceId(null);
            resolve();
        };
        audioRef.current.play().catch(() => resolve());
    });
  };
  
  const downloadConversation = () => {
      const content = messages.map(m => {
          const role = m.role === 'ai' ? 'Phuong' : 'User';
          const text = (m.displayedText || m.text).replace(/ \| /g, '\nTranslation: ');
          return `[${role}]\n${text}`;
      }).join('\n\n');
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'phuong-conversation.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
  };

  const handleSendMessage = async (text: string, fromMic = false) => {
    if (!text?.trim() || isProcessingRef.current) return;
    isProcessingRef.current = true;
    setIsThinking(true);
    
    const userMsgId = `user-${Date.now()}`;
    setMessages(prev => [...prev, { role: 'user', displayedText: text.trim(), id: userMsgId, text: text.trim() }]);
    setUserInput("");

    (async () => {
      try {
        const ai = new GoogleGenAI({apiKey});
        const history = [...messages, { role: 'user', text: text.trim() }];
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: history.map(m => ({ role: m.role === 'ai' ? 'model' : 'user', parts: [{ text: m.text.split('|')[0] }] })),
          config: { systemInstruction: getSystemPrompt(t.systemPromptLang) }
        });
        const aiText = response.text || "";
        const aiMsgId = `ai-${Date.now()}`;
        setMessages(current => [...current, { role: 'ai', text: aiText, id: aiMsgId, displayedText: aiText }]);
        speak(aiText, aiMsgId);
      } catch (error) { console.error("Gemini Error:", error); } 
      finally { setIsThinking(false); isProcessingRef.current = false; }
    })();
  };

  const toggleRecording = () => {
    if (!recognitionRef.current) return;
    isRecording ? recognitionRef.current.stop() : recognitionRef.current.start();
  };
  
  if (gameState === 'start') {
    return (
      <div className="w-full h-full bg-[#f3e8ff] flex items-center justify-center p-4 font-sans text-slate-800">
        <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-8 md:p-12 border-4 border-violet-100 text-center">
          <img src={character.avatarUrl} alt="Phuong" className="w-40 h-40 mb-6 rounded-full border-4 border-violet-400 object-cover mx-auto" />
          <h1 className="text-3xl font-black text-violet-600 mb-2 uppercase italic">Phuong's Veggies 🥦</h1>
          <p className="text-slate-400 mb-8 font-medium">{t.ui_welcome}</p>
          <div className="flex flex-col items-center gap-6 w-full">
            <div className="flex space-x-4">
              {['EN', 'RU'].map(lang => (
                <button key={lang} onClick={() => setSelectedLang(lang as 'EN' | 'RU')} className={`px-6 py-3 rounded-xl font-bold border-2 transition-all ${selectedLang === lang ? 'bg-violet-50 text-violet-600' : 'text-slate-400'}`}>
                  {LANGUAGES[lang].label}
                </button>
              ))}
            </div>
            <button onClick={() => { setMessages([{ role: 'ai', text: t.welcome_msg, displayedText: t.welcome_msg, id: 'init' }]); setGameState('playing'); speak(t.welcome_msg, 'init'); }} className="flex items-center gap-3 font-black py-4 px-12 rounded-2xl bg-violet-600 text-white hover:scale-105 transition-all shadow-lg">
              <Play fill="white" size={18} /> <span className="text-lg tracking-widest">{t.ui_start}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-[#0B0F19] flex items-center justify-center p-0 md:p-0 font-sans">
      <div className="w-full h-full bg-white md:rounded-none shadow-2xl flex flex-col md:flex-row">
        {/* Left Panel */}
        <div className="h-[20vh] md:h-full w-full md:w-1/3 bg-[#F7F8FA] p-4 md:p-8 flex flex-row md:flex-col justify-between items-center rounded-t-2xl md:rounded-l-none md:rounded-tr-none border-b md:border-r border-slate-100 shrink-0">
          <div className="flex flex-row md:flex-col items-center gap-4 text-center">
            <img src={character.avatarUrl} alt="Phuong" className="w-20 h-20 md:w-48 md:h-48 rounded-2xl object-cover" />
            <div>
              <h2 className="text-xl md:text-3xl font-black text-slate-800">Phương 🥦</h2>
              <p className="font-bold text-xs text-green-500 uppercase tracking-widest">● ONLINE - EXPERT</p>
            </div>
          </div>
          <button onClick={toggleRecording} className={`w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center transition-all shadow-xl active:scale-95 mt-0 md:mt-4 ${isRecording ? 'bg-red-500 ring-4 ring-red-100' : 'bg-[#7F56D9] hover:bg-[#6941C6]'}`}>
            <Mic size={28} color="white" />
          </button>
        </div>

        {/* Right Panel */}
        <div className="h-[80vh] md:h-full flex-1 flex flex-col bg-white rounded-b-2xl md:rounded-r-none overflow-hidden">
          <header className="px-4 md:px-6 py-3 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-black text-slate-400 text-[10px] uppercase tracking-widest">{t.ui_learning_title}</h3>
              <p className="font-bold text-violet-600 text-xs">EXPERT SELLER MODE</p>
            </div>
            <div className="flex items-center gap-1 md:gap-2">
              <button onClick={downloadConversation} className="p-2 bg-slate-100 text-slate-500 rounded-lg">
                  <Download size={14} />
              </button>
              <button onClick={cycleSpeechRate} className="flex items-center gap-1 p-2 bg-slate-100 text-slate-500 rounded-lg font-bold text-[10px] w-20 justify-center">
                  <Gauge size={14} /> {Math.round(speechRate * 100)}%
              </button>
            </div>
          </header>
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 min-h-0">
            {messages.map((msg) => {
              const parts = (msg.displayedText || msg.text).split('|');
              return (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-2xl shadow-sm ${msg.role === 'user' ? 'bg-[#7F56D9] text-white' : 'bg-slate-50 text-slate-800'}`}>
                    <p className="font-bold text-sm">{parts[0]}</p>
                    {parts[1] && <p className="text-xs italic mt-2 pt-2 border-t border-black/10 opacity-80">{parts[1]}</p>}
                  </div>
                </div>
              );
            })}
            <div ref={chatEndRef}></div>
          </div>
          <footer className="p-3 md:p-4 bg-white border-t border-slate-100 flex gap-3">
            <input 
              type="text" 
              value={userInput} 
              onChange={e => setUserInput(e.target.value)} 
              onKeyPress={e => e.key === 'Enter' && handleSendMessage(userInput)} 
              placeholder={t.ui_placeholder} 
              className="flex-1 px-4 py-3 bg-slate-50 rounded-xl focus:outline-none" 
            />
            <button onClick={() => handleSendMessage(userInput)} className="bg-[#7F56D9] text-white px-5 rounded-xl"><Send /></button>
          </footer>
        </div>
      </div>
    </div>
  );
};

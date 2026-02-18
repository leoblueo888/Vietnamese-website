import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Send, Volume2, Play, Globe, Gauge, Maximize, Minimize } from 'lucide-react';
import type { AIFriend } from '../types';

// --- DICTIONARY DATA ---
const DICTIONARY = {
  "rau muống": { EN: "water spinach", type: "Noun" },
  "bắp cải": { EN: "cabbage", type: "Noun" },
  "cà rốt": { EN: "carrot", type: "Noun" },
  "khoai tây": { EN: "potato", type: "Noun" },
  "hành tây": { EN: "onion", type: "Noun" },
  "tỏi": { EN: "garlic", type: "Noun" },
  "ớt": { EN: "chili", type: "Noun" },
  "rau thơm": { EN: "herbs", type: "Noun" },
  "giá đỗ": { EN: "bean sprouts", type: "Noun" },
  "dưa leo": { EN: "cucumber", type: "Noun" },
  "cà chua": { EN: "tomato", type: "Noun" },
  "mua": { EN: "to buy", type: "Verb" },
  "bán": { EN: "to sell", type: "Verb" },
  "tươi": { EN: "fresh", type: "Adj" },
  "héo": { EN: "withered", type: "Adj" },
  "sạch": { EN: "clean", type: "Adj" },
  "rẻ": { EN: "cheap", type: "Adj" },
  "mắc": { EN: "expensive", type: "Adj" },
  "ạ": { EN: "Polite particle", type: "Ending" },
  "nhé": { EN: "Suggestion", type: "Ending" }
};

const LANGUAGES = {
  EN: {
    label: "English",
    ui_welcome: "Welcome to our Vegetable Stall! I'm Lan.",
    ui_start: "SHOP NOW",
    ui_placeholder: "Ask Lan about vegetables...",
    ui_status: "Online - Vegetable Expert",
    ui_learning_title: "Chat with Lan Vendor",
    welcome_msg: "Chào Anh! Rau củ nhà em hôm nay tươi lắm, Anh muốn mua gì ạ? ✨ | Hi! My vegetables are very fresh today, what would you like to buy? ✨",
  },
  RU: {
    label: "Русский",
    ui_welcome: "Добро пожаловать! Я Лан, продавец овощей.",
    ui_start: "КУПИТЬ",
    ui_placeholder: "Спроси Лан về rau...",
    ui_status: "В сети - Эксперт",
    ui_learning_title: "Общение với người bán",
    welcome_msg: "Chào Anh! Rau củ tươi lắm, Anh muốn mua gì ạ? ✨ | Привет! Овощи очень свежие, что хотите купить? ✨",
  }
};

export const GameSpeakAIVegetables: React.FC<{ character: AIFriend }> = ({ character }) => {
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
  const audioRef = useRef(new Audio());
  const recognitionRef = useRef<any>(null);
  const isProcessingRef = useRef(false);

  const t = LANGUAGES[selectedLang];

  // --- RECOGNITION ---
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = 'vi-VN';
      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setUserInput(text);
        handleSendMessage(text);
      };
      recognition.onend = () => setIsRecording(false);
      recognitionRef.current = recognition;
    }
  }, []);

  const speakWord = async (text: string, msgId: string | null = null) => {
    if (!text) return;
    if (msgId) setActiveVoiceId(msgId);
    const cleanText = text.split('|')[0].trim();
    return new Promise<void>((resolve) => {
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(cleanText)}&tl=vi&client=tw-ob`;
      audioRef.current.src = url;
      audioRef.current.playbackRate = speechRate;
      audioRef.current.onended = () => { setActiveVoiceId(null); resolve(); };
      audioRef.current.play().catch(() => resolve());
    });
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isProcessingRef.current) return;
    isProcessingRef.current = true;
    setIsThinking(true);
    const userMsgId = `user-${Date.now()}`;
    setMessages(prev => [...prev, { role: 'user', text: text, id: userMsgId }]);
    setUserInput("");

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, lang: selectedLang.toLowerCase(), topic: "Lan selling fresh vegetables at the market." })
      });
      const data = await response.json();
      if (data.text) {
        const aiMsgId = `ai-${Date.now()}`;
        setMessages(prev => [...prev, { role: 'ai', text: data.text, id: aiMsgId }]);
        await speakWord(data.text, aiMsgId);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsThinking(false);
      isProcessingRef.current = false;
    }
  };

  if (gameState === 'start') {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
        <div className="w-full max-w-xl bg-white rounded-[3rem] shadow-2xl p-10 text-center border-[10px] border-green-100">
          <img src={character.avatarUrl} className="w-40 h-40 mx-auto mb-6 rounded-full object-cover border-4 border-green-200" alt="Lan" />
          <h1 className="text-3xl font-black text-green-800 mb-4">Lan's Veggies 🌿</h1>
          <div className="flex gap-4 justify-center mb-8">
            {['EN', 'RU'].map(l => (
              <button key={l} onClick={() => setSelectedLang(l as any)} className={`px-6 py-2 rounded-xl font-bold ${selectedLang === l ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-400'}`}>{LANGUAGES[l as 'EN' | 'RU'].label}</button>
            ))}
          </div>
          <button onClick={() => { setGameState('playing'); setMessages([{ role: 'ai', text: t.welcome_msg, id: 'init' }]); speakWord(t.welcome_msg, 'init'); }} className="w-full py-4 bg-green-600 text-white rounded-2xl font-black text-xl hover:scale-105 transition-all">
            {t.ui_start}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-slate-900 flex flex-col items-center justify-center p-0 md:p-4">
      <div className="w-full h-full max-w-5xl bg-white md:rounded-[2.5rem] flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-4 rounded-2xl shadow-sm ${msg.role === 'user' ? 'bg-green-700 text-white' : 'bg-white text-slate-800'}`}>
                <div className="font-bold">{msg.text.split('|')[0]}</div>
                {msg.text.split('|')[1] && <div className="text-xs mt-2 opacity-70 italic">{msg.text.split('|')[1]}</div>}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
        <div className="p-4 bg-white border-t flex gap-2">
          <input value={userInput} onChange={(e) => setUserInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(userInput)} className="flex-1 bg-slate-100 p-4 rounded-xl outline-none" placeholder={t.ui_placeholder} />
          <button onClick={() => { setIsRecording(!isRecording); isRecording ? recognitionRef.current?.stop() : recognitionRef.current?.start(); }} className={`p-4 rounded-xl ${isRecording ? 'bg-red-500 animate-pulse text-white' : 'bg-green-600 text-white'}`}><Mic size={20}/></button>
          <button onClick={() => handleSendMessage(userInput)} className="bg-blue-600 text-white p-4 rounded-xl"><Send size={20}/></button>
        </div>
      </div>
    </div>
  );
};

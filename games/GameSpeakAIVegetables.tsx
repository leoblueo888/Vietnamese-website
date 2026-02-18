import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Send, Volume2, Play, Download, Volume1, Gauge, Maximize, Minimize } from 'lucide-react';
import type { AIFriend } from '../types';

// --- DICTIONARY DATA ---
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
    ui_welcome: "Welcome to Phuong's Market! I'm Phuong.",
    ui_start: "SHOP NOW",
    ui_placeholder: "Talk to Phuong here...",
    ui_status: "Online - Expert Seller",
    ui_learning_title: "Chat with Phuong",
    welcome_msg: "Em chào Anh! Rau củ nhà em hôm nay loại nào cũng có, tươi rói luôn ạ. Anh muốn mua gì về nấu cơm không ạ? ✨ | Hi! Welcome. I have all kinds of veggies today, very fresh. Do you want to buy anything? ✨",
  },
  RU: {
    label: "Русский",
    ui_welcome: "Добро пожаловать в лавку Фуонг!",
    ui_start: "КУПИТЬ",
    ui_placeholder: "Поговори с Фуонг здесь...",
    ui_status: "В сети - Эксперт",
    ui_learning_title: "Trò chuyện với Phương",
    welcome_msg: "Em chào Anh! Rau củ tươi lắm, Anh xem mua gì ủng hộ em nhé! ✨ | Здравствуйте! Овощи очень свежие, посмотрите! ✨",
  }
};

// SỬA TÊN COMPONENT Ở ĐÂY ĐỂ FIX LỖI BUILD
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

  const t = LANGUAGES[selectedLang];

  // --- RECOGNITION ---
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'vi-VN';
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
          const text = (final || interim).trim();
          if (text && !isProcessingRef.current) {
            recognition.stop();
            handleSendMessage(text);
          }
        }, 2000);
      };
      recognition.onend = () => setIsRecording(false);
      recognitionRef.current = recognition;
    }
  }, [selectedLang]);

  // --- TTS ---
  const speak = async (text: string, msgId: string | null = null) => {
    if (msgId) setActiveVoiceId(msgId);
    const cleanText = text.split('|')[0].replace(/(\d+)k/g, '$1 nghìn').trim();
    if(!cleanText) return;
    
    return new Promise<void>(resolve => {
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(cleanText)}&tl=vi&client=tw-ob`;
      audioRef.current.src = url;
      audioRef.current.playbackRate = speechRate;
      audioRef.current.onended = () => { setActiveVoiceId(null); resolve(); };
      audioRef.current.onerror = () => { setActiveVoiceId(null); resolve(); };
      audioRef.current.play().catch(() => resolve());
    });
  };

  // --- AI PROXY ---
  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isProcessingRef.current) return;
    isProcessingRef.current = true;
    setIsThinking(true);
    
    const userMsgId = `user-${Date.now()}`;
    setMessages(prev => [...prev, { role: 'user', text: text.trim(), id: userMsgId }]);
    setUserInput("");

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: text, 
          lang: selectedLang.toLowerCase(),
          topic: "Phuong, a friendly vegetable seller at a Vietnamese market. Speak politely using 'Dạ/ạ', call yourself 'Em' and the user 'Anh'." 
        })
      });

      const data = await response.json();
      if (data.text) {
        const aiMsgId = `ai-${Date.now()}`;
        setMessages(prev => [...prev, { role: 'ai', text: data.text, id: aiMsgId }]);
        await speak(data.text, aiMsgId);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIs

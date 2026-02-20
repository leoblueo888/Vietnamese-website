import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Send, Volume2, Play, Download, Volume1, Gauge, Maximize, Minimize } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import type { AIFriend } from '../types';

// --- DATA & CONFIG ---
const DICTIONARY = {
  "nước ép": { EN: "fruit juice", type: "Noun" },
  "sinh tố": { EN: "smoothie", type: "Noun" },
  "cà phê": { EN: "coffee", type: "Noun" },
  "đá": { EN: "ice", type: "Noun" },
  "đường": { EN: "sugar", type: "Noun" },
  "sữa": { EN: "milk", type: "Noun" },
  "trái cây": { EN: "fruit", type: "Noun" },
  "thực đơn": { EN: "menu", type: "Noun" },
  "quán": { EN: "shop / cafe", type: "Noun" },
  "tên": { EN: "name", type: "Noun" },
  "sức khỏe": { EN: "health", type: "Noun" },
  "vitamin": { EN: "vitamin", type: "Noun" },
  "đề kháng": { EN: "resistance/immunity", type: "Noun" },
  "uống": { EN: "to drink", type: "Verb" },
  "chọn": { EN: "to choose", type: "Verb" },
  "pha": { EN: "to brew / to mix", type: "Verb" },
  "chào": { EN: "to greet / hello", type: "Verb" },
  "cảm ơn": { EN: "to thank", type: "Verb" },
  "đợi": { EN: "to wait", type: "Verb" },
  "thích": { EN: "to like", type: "Verb" },
  "dùng": { EN: "to use / to consume", type: "Verb" },
  "tư vấn": { EN: "to consult/advise", type: "Verb" },
  "ngon": { EN: "delicious", type: "Adj" },
  "ngọt": { EN: "sweet", type: "Adj" },
  "mát": { EN: "cool / refreshing", type: "Adj" },
  "đẹp": { EN: "beautiful", type: "Adj" },
  "vui": { EN: "happy", type: "Adj" },
  "nhiều": { EN: "many / much", type: "Adj" },
  "ít": { EN: "few / little", type: "Adj" },
  "tươi": { EN: "fresh", type: "Adj" }
};

const LANGUAGES = {
  EN: {
    label: "English",
    ui_welcome: "Welcome to my juice bar! I'm Xuan.",
    ui_start: "ORDER NOW",
    ui_placeholder: "Talk to Xuan here...",
    ui_recording: "LISTENING...",
    ui_tapToTalk: "Tap to talk",
    ui_listening: "Xuan is listening...",
    ui_status: "Online - Barista Mode",
    ui_learning_title: "Chat with Xuan Barista",
    ui_listen_all: "Listen All",
    ui_download: "Download",
    ui_clear: "Clear",
    welcome_msg: "Dạ, em chào Anh! Anh muốn dùng nước ép hay sinh tố gì ạ? Hôm nay nhà em có nhiều trái cây tươi ngon lắm! ✨ | Hi! Welcome. Would you like a juice or a smoothie today? We have many fresh fruits! ✨",
    systemPromptLang: "English"
  },
  RU: {
    label: "Русский",
    ui_welcome: "Добро пожаловать! Я Суан, ваш бариста.",
    ui_start: "ЗАKAЗАТЬ",
    ui_placeholder: "Поговори с Суан здесь...",
    ui_recording: "СЛУШАЮ...",
    ui_tapToTalk: "Нажмите, để nói",
    ui_listening: "Суан слушает...",
    ui_status: "В сети - Бариста",
    ui_learning_title: "Общение với бариста",
    ui_listen_all: "Nghe tất cả",
    ui_download: "Tải xuống",
    ui_clear: "Xóa",
    welcome_msg: "Dạ, em chào Anh! Anh muốn dùng nước ép hay sinh tố gì ạ? ✨ | Здравствуйте! Какой сок или смузи вы бы хотели сегодня? ✨",
    systemPromptLang: "Russian"
  }
};

const getSystemPrompt = (targetLangName: string) => `
You are Xuan, a 20-year-old beautiful barista.
STRICT COMMUNICATION FLOW:
1. When user names a drink: Ask if they want "ít đá" (little ice) or "nhiều đá" (much ice).
2. After ice choice: Ask if they want to drink "tại đây" (here) or "mang đi" (to go).
3. If they say "tại đây": Respond with "Mời anh ngồi, em sẽ mang đồ uống tới ngay." (Please have a seat, I'll bring your drink right away).

STRICT TEXT FORMATTING:
- DO NOT use any special characters like asterisks (*) or stars in your response.
- Use only plain text and emojis.

PRICE POLICY (STRICT):
- All drinks are 30 nghìn.
- NEVER mention the price "30 nghìn" or any money unless the user explicitly asks "Bao nhiêu tiền?", "Tính tiền", "Giá thế nào?", or "How much?". If they don't ask, stay silent about the cost.

KNOWLEDGE BASE:
- Skin/Beauty: Tomato, Strawberry, Carrot.
- Immunity: Orange, Pineapple, Guava.
- Digestion: Pineapple, Papaya, Apple.
- Energy: Banana, Avocado, Coffee.

PERSONALITY: Energetic, polite, sweet. Use "Anh" for user and "Em" for self. Use "Dạ", "ạ".
Format: Vietnamese_Text | ${targetLangName}_Translation | USER_TRANSLATION: [Translation of user's last message]
`;

export const GameSpeakAISmoothie: React.FC<{ character: AIFriend }> = ({ character }) => {
  const [gameState, setGameState] = useState('start'); 
  const [selectedLang, setSelectedLang] = useState<'EN' | 'RU'>('EN'); 
  const [messages, setMessages] = useState<any[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [activeVoiceId, setActiveVoiceId] = useState<string | null>(null);
  const [speechRate, setSpeechRate] = useState(1.0);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef(new Audio());
  const recognitionRef = useRef<any>(null);
  const isProcessingRef = useRef(false);
  const silenceTimerRef = useRef<number | null>(null);
  
  // FIXED: Standard way to retrieve API Key in this environment
  const apiKey = (import.meta.env.VITE_GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.API_KEY || ""); 

  const XUAN_IMAGE_URL = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&auto=format&fit=crop&q=60";
  
  const t = LANGUAGES[selectedLang];
  
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleFullscreenChange = () => { setIsFullscreen(!!document.fullscreenElement); };
  
  useEffect(() => {
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    const elem = gameContainerRef.current;
    if (!elem) return;
    if (!document.fullscreenElement) {
      elem.requestFullscreen().catch(err => alert(`Error: ${err.message}`));
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
      
      recognition.onstart = () => {
        setIsRecording(true);
        setUserInput("");
      };

      recognition.onresult = (event: any) => {
        if (isProcessingRef.current) return;
        let interimTranscript = "";
        let finalTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript;
          else interimTranscript += event.results[i][0].transcript;
        }
        const currentProgress = finalTranscript || interimTranscript;
        if (currentProgress) setUserInput(currentProgress);

        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = window.setTimeout(() => {
          const textToProcess = finalTranscript.trim() || interimTranscript.trim();
          if (textToProcess && !isProcessingRef.current) {
            recognition.stop();
            handleSendMessage(textToProcess, true);
          }
        }, 2000); 
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
    if (speechRate === 1.0) setSpeechRate(1.2);
    else if (speechRate === 1.2) setSpeechRate(1.4);
    else if (speechRate === 1.4) setSpeechRate(0.8);
    else if (speechRate === 0.8) setSpeechRate(0.6);
    else setSpeechRate(1.0);
  };

  const speakWord = async (text: string, msgId: string | null = null) => {
    if (!text) return;
    if (msgId) setActiveVoiceId(msgId);
    const parts = text.split('|');
    const cleanText = parts[0].replace(/[*]/g, '').replace(/USER_TRANSLATION:.*$/gi, '').trim();
    const segments = cleanText.split(/[,.!?;:]+/).map(s => s.trim()).filter(s => s.length > 0);
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
    } catch (e) { console.error(e); } finally { if (msgId) setActiveVoiceId(null); }
  };

  const speakSingleWord = (e: React.MouseEvent, word: string) => {
    e.stopPropagation(); 
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(word)}&tl=vi&client=tw-ob`;
    const singleAudio = new Audio(url);
    singleAudio.playbackRate = speechRate;
    singleAudio.play().catch(console.error);
  };

  const handleDownloadConvo = () => {
    const content = messages.map(msg => `[${msg.role === 'user' ? 'User' : 'Xuan'}]: ${msg.text.replace(/ \| /g, '\nTranslation: ')}`).join('\n\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'xuan-barista-convo.txt';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSendMessage = async (text: string, fromMic = false) => {
    if (!text || !text.trim() || isProcessingRef.current) return;
    isProcessingRef.current = true;
    setIsThinking(true);
    let processedInput = text.trim();

    detectAndSetSpeed(processedInput);
    
    // UPDATED: Using gemini-2.5-flash
    const ai = new GoogleGenAI(apiKey);
    const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });

    try {
      const prompt = fromMic 
        ? `Reformat this Vietnamese voice transcript by adding correct punctuation and fixing grammar to make it natural. Keep it short. Transcript: "${processedInput}"`
        : `Detect language of "${processedInput}". If NOT Vietnamese, translate to Vietnamese. Return ONLY the Vietnamese result.`;
        
      const response = await model.generateContent(prompt);
      const aiResult = response.response.text();
      if (aiResult) processedInput = aiResult.trim().replace(/^"|"$/g, '');
    } catch (e) { console.error(e); }

    const userMsgId = `user-${Date.now()}`;
    const newUserMsg = { role: 'user', text: processedInput, displayedText: text.trim(), translation: null, id: userMsgId };
    
    setMessages(prev => {
      const history = [...prev, newUserMsg];
      (async () => {
        try {
          const chatSession = model.startChat({
            history: history.slice(0, -1).map(m => ({
              role: m.role === 'ai' ? 'model' : 'user',
              parts: [{ text: m.text }]
            })),
            generationConfig: {
              maxOutputTokens: 500,
            },
          });

          // Adding system instruction inside the final prompt to ensure model follows constraints
          const finalPrompt = `${getSystemPrompt(t.systemPromptLang)}\n\nUser: ${processedInput}`;
          const response = await model.generateContent(finalPrompt);
          let rawAiResponse = response.response.text() || "";
          rawAiResponse = rawAiResponse.replace(/[*]/g, '');
          
          const parts = rawAiResponse.split('|');
          const lanVi = parts[0]?.replace(/USER_TRANSLATION:.*$/gi, '').trim() || "";
          const lanTrans = parts[1]?.replace(/USER_TRANSLATION:.*$/gi, '').trim() || "";
          const userTransMatch = rawAiResponse.match(/USER_TRANSLATION:\s*(.*)$/i);
          const userTranslationValue = userTransMatch ? userTransMatch[1].replace(/[\[\]]/g, '').trim() : "";
          const cleanDisplay = `${lanVi} | ${lanTrans}`;
          const aiMsgId = `ai-${Date.now()}`;
          
          setMessages(currentMsgs => {
            const updated = [...currentMsgs];
            const userIdx = updated.findIndex(m => m.id === userMsgId);
            if (userIdx !== -1) updated[userIdx] = { ...updated[userIdx], translation: userTranslationValue };
            updated.push({ role: 'ai', text: cleanDisplay, id: aiMsgId, displayedText: cleanDisplay });
            return updated;
          });
          
          await speakWord(cleanDisplay, aiMsgId);

          if (lanVi.includes("mang đồ uống tới ngay")) {
            setTimeout(async () => {
              const servingMsgId = `ai-serving-${Date.now()}`;
              const servingTextVi = "Đồ uống của anh đây ạ. Chúc anh ngon miệng! 🥤";
              const servingTextEN = "Here is your drink. Enjoy your meal!";
              const servingFullText = `${servingTextVi} | ${servingTextEN}`;
              
              setMessages(prevMsgs => [...prevMsgs, { 
                role: 'ai', 
                text: servingFullText, 
                id: servingMsgId, 
                displayedText: servingFullText 
              }]);
              await speakWord(servingFullText, servingMsgId);
            }, 5000);
          }

        } catch (error) { console.error(error); } finally { setIsThinking(false); isProcessingRef.current = false; }
      })();
      return history;
    });
    setUserInput("");
  };

  const renderInteractiveText = (text: string) => {
    if (!text) return null;
    const sortedKeys = Object.keys(DICTIONARY).sort((a, b) => b.length - a.length);
    let result: (string | React.JSX.Element)[] = [];
    let remainingText = text;
    while (remainingText.length > 0) {
      let match: any = null;
      for (const key of sortedKeys) {
        const regex = new RegExp(`^${key}`, 'i');
        const found = remainingText.match(regex);
        if (found) {
          match = { key: key, original: found[0], info: (DICTIONARY as any)[key] };
          break;
        }
      }
      if (match) {
        const typeColor = match.info.type === "Noun" ? "text-blue-500" : match.info.type === "Verb" ? "text-emerald-500" : "text-teal-500";
        result.push(
          <span key={remainingText.length} className="group relative inline-block border-b border-dotted border-slate-300 hover:border-blue-400 cursor-help px-0.5 rounded transition-colors">
            {match.original}
            <span className="invisible group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max min-w-[120px] max-w-[200px] bg-slate-800 text-white text-[10px] p-2.5 rounded-xl shadow-2xl z-50 flex flex-col items-center gap-1.5 border border-slate-700">
              <div className="flex items-center justify-between w-full gap-2 border-b border-slate-700 pb-1.5">
                <span className={`font-black text-[8px] uppercase tracking-tighter ${typeColor}`}>{match.info.type}</span>
                <button onClick={(e) => speakSingleWord(e, match.original)} className="p-1 hover:bg-slate-700 rounded-md transition-colors text-blue-400"><Volume1 size={14} /></button>
              </div>
              <span className="font-bold text-center leading-tight w-full">{match.info.EN}</span>
              <span className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-slate-800"></span>
            </span>
          </span>
        );
        remainingText = remainingText.slice(match.original.length);
      } else {
        const nonMatch = remainingText.match(/^[^\s,.;!?|]+/);
        if (nonMatch) {
          result.push(<span key={remainingText.length}>{nonMatch[0]}</span>);
          remainingText = remainingText.slice(nonMatch[0].length);
        } else {
          result.push(<span key={remainingText.length}>{remainingText[0]}</span>);
          remainingText = remainingText.slice(1);
        }
      }
    }
    return result;
  };

  const detectAndSetSpeed = (text: string) => {
    const lowerText = text.toLowerCase();
    if (lowerText.includes("nói chậm") || lowerText.includes("speak slower")) {
      setSpeechRate(0.8);
      return true;
    }
    if (lowerText.includes("nói nhanh") || lowerText.includes("speak faster")) {
      setSpeechRate(1.2);
      return true;
    }
    return false;
  };

  const toggleRecording = () => {
    if (!recognitionRef.current) return;
    isRecording ? recognitionRef.current.stop() : recognitionRef.current.start();
  };

  if (gameState === 'start') {
    return (
      <div className="w-full h-full bg-blue-50 flex items-center justify-center p-4 font-sans text-slate-800">
        <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl flex flex-col items-center justify-center p-12 border-[10px] border-blue-100 text-center">
          <div className="w-56 h-56 mb-6 rounded-full overflow-hidden border-4 border-blue-400 shadow-lg">
            <img src={XUAN_IMAGE_URL} alt="Xuan" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-4xl font-black text-blue-600 mb-2 uppercase tracking-tighter italic">Healthy Juice: Xuan 🥤</h1>
          <p className="text-slate-400 mb-8 font-medium text-lg italic">{t.ui_welcome}</p>
          <div className="flex flex-col items-center space-y-8 w-full">
            <div className="flex space-x-4">
              {(['EN', 'RU'] as const).map(lang => (
                <button key={lang} onClick={() => setSelectedLang(lang)} className={`px-6 py-3 rounded-xl font-bold transition-all border-2 ${selectedLang === lang ? 'border-blue-50 bg-blue-50 text-blue-600 ring-4 ring-blue-100' : 'border-slate-100 text-slate-400'}`}>{LANGUAGES[lang].label}</button>
              ))}
            </div>
            <button onClick={() => { setMessages([{ role: 'ai', text: t.welcome_msg.replace(/[*]/g, ''), displayedText: t.welcome_msg.replace(/[*]/g, ''), id: 'init' }]); setGameState('playing'); speakWord(t.welcome_msg.replace(/[*]/g, ''), 'init'); }} className="flex items-center space-x-3 font-black py-5 px-16 rounded-2xl transition-all shadow-xl bg-blue-600 text-white hover:scale-105 active:scale-95">
              <Play fill="white" size={20} /> <span className="text-xl tracking-widest">{t.ui_start}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={gameContainerRef} className="w-full h-full relative">
      <div className="w-full h-full bg-slate-900 flex items-center justify-center md:p-4 font-sans overflow-hidden">
        <div className="w-full h-full bg-white md:rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row overflow-hidden border-0 md:border-[10px] border-blue-50">
          
          <div className="h-[20vh] md:h-full md:w-1/3 bg-blue-50/40 p-4 md:p-8 flex flex-row md:flex-col items-center justify-between border-b md:border-b-0 md:border-r border-blue-100 shrink-0">
            <div className="flex flex-row md:flex-col items-center gap-3 md:gap-4 h-full md:h-auto">
              <div className="relative h-full aspect-square md:w-60 md:h-60 rounded-xl md:rounded-3xl overflow-hidden shadow-xl border-4 border-white bg-white shrink-0">
                <img src={XUAN_IMAGE_URL} alt="Xuan" className="w-full h-full object-cover" />
                {isThinking && <div className="absolute inset-0 bg-blue-900/20 flex items-center justify-center backdrop-blur-sm"><div className="w-2 h-2 bg-white rounded-full animate-ping"></div></div>}
              </div>
              <div className="text-left md:text-center flex flex-col justify-center">
                <h2 className="text-lg md:text-2xl font-black text-slate-800 italic">Xuân🍓</h2>
                <div className="flex items-center space-x-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-emerald-600">{t.ui_status}</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center h-full md:h-auto">
              <button onClick={toggleRecording} className={`w-14 h-14 md:w-24 md:h-24 rounded-full flex items-center justify-center transition-all shadow-xl active:scale-90 ${isRecording ? 'bg-red-500 ring-4 ring-red-100' : 'bg-blue-600'}`}>
                {isRecording ? <MicOff size={24} className="md:w-8 md:h-8" color="white" /> : <Mic size={24} className="md:w-8 md:h-8" color="white" />}
              </button>
              <p className="hidden md:block mt-4 font-black text-blue-700 text-[10px] tracking-widest uppercase opacity-60">{isRecording ? t.ui_listening : t.ui_tapToTalk}</p>
            </div>
          </div>
  
          <div className="h-[80vh] md:h-full md:flex-1 flex flex-col bg-white overflow-hidden relative">
            <div className="px-4 py-3 md:px-6 md:py-4 border-b border-slate-50 flex items-center justify-between shrink-0 bg-white z-10">
              <div className="flex flex-col">
                <span className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest">{t.ui_learning_title}</span>
                <span className="text-[10px] font-black text-blue-600 uppercase">30k / Ly 💸</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <button onClick={handleDownloadConvo} className="p-2 md:px-3 md:py-2 bg-emerald-50 rounded-xl text-emerald-600"><Download size={14} /></button>
                <button onClick={cycleSpeechRate} className="bg-orange-50 text-orange-600 px-2 py-2 rounded-xl font-black text-[10px] flex items-center gap-1"><Gauge size={14} /><span>{Math.round(speechRate * 100)}%</span></button>
              </div>
            </div>
  
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6 bg-blue-50/5 custom-scrollbar scroll-smooth">
              <style>{`.custom-scrollbar::-webkit-scrollbar { width: 4px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #bfdbfe; border-radius: 10px; }`}</style>
              {messages.map((msg) => {
                const displayString = msg.displayedText || "";
                const parts = displayString.split('|');
                const mainText = parts[0]?.trim();
                const subText = parts[1]?.trim();
                const isActive = activeVoiceId === msg.id;
                return (
                  <div id={`msg-${msg.id}`} key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] md:max-w-[85%] p-3.5 md:p-5 rounded-2xl md:rounded-3xl shadow-md relative transition-all ${isActive ? 'ring-2 ring-blue-200' : ''} ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none border border-blue-50'}`}>
                      <div className="flex flex-col">
                        <div className="flex items-start justify-between gap-3">
                          <div className="text-sm md:text-lg font-bold leading-snug">
                            {msg.role === 'ai' ? renderInteractiveText(mainText) : mainText}
                          </div>
                          <button onClick={() => speakWord(msg.role === 'ai' ? msg.text : mainText, msg.id)} className={`p-1.5 md:p-2.5 rounded-lg shrink-0 ${msg.role === 'user' ? 'text-blue-100 hover:bg-blue-500' : 'text-blue-600 hover:bg-blue-50'}`}>
                            <Volume2 size={16} />
                          </button>
                        </div>
                        {((msg.role === 'ai' && subText) || (msg.role === 'user' && msg.translation)) && (
                          <p className={`text-[10px] italic border-t pt-1.5 mt-2 ${msg.role === 'user' ? 'border-blue-500 text-blue-200' : 'border-slate-100 text-slate-400'}`}>
                            {msg.role === 'ai' ? subText : msg.translation}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} className="h-4" />
            </div>
  
            <div className="p-4 md:p-6 bg-white border-t border-slate-50 flex gap-2 shrink-0 pb-8 md:pb-6">
              <input 
                type="text" 
                value={userInput} 
                onChange={(e) => setUserInput(e.target.value)} 
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(userInput)} 
                placeholder={isRecording ? "Listening..." : t.ui_placeholder} 
                className={`flex-1 px-4 py-3 rounded-xl border-2 transition-all font-medium text-sm ${isRecording ? 'bg-blue-50 border-blue-300 italic' : 'bg-slate-50 border-transparent focus:border-blue-100 focus:bg-white focus:outline-none'}`} 
              />
              <button onClick={() => handleSendMessage(userInput)} disabled={isThinking || !userInput.trim()} className="bg-emerald-500 text-white px-4 rounded-xl hover:bg-emerald-600 disabled:opacity-50 transition-all"><Send size={18} /></button>
            </div>
          </div>
        </div>
      </div>
      <button onClick={toggleFullscreen} title="Toggle Fullscreen" className="absolute bottom-4 right-4 bg-black/10 text-white/40 p-1.5 rounded-full backdrop-blur-sm hover:bg-black/30 hover:text-white/70 transition-all opacity-20 hover:opacity-100 z-50">
          {isFullscreen ? <Minimize size={14} /> : <Maximize size={14} />}
      </button>
    </div>
  );
};

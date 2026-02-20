import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Send, Volume2, Play, Globe, Download, Volume1, Gauge, Maximize, Minimize } from 'lucide-react';
import { GoogleGenAI } from '@google/generai';
import type { AIFriend } from '../types';

// Từ điển phân loại cho cửa hàng Hải Sản & Thịt của Thanh - Noun, Verb, Adj, Particle
const DICTIONARY = {
  // DANH TỪ (Nouns) - Blue
  "hải sản": { EN: "seafood", type: "Noun" },
  "tôm hùm": { EN: "lobster", type: "Noun" },
  "cua cà mau": { EN: "Ca Mau crab", type: "Noun" },
  "thịt bò": { EN: "beef", type: "Noun" },
  "thịt heo": { EN: "pork", type: "Noun" },
  "thịt gà": { EN: "chicken", type: "Noun" },
  "thịt vịt": { EN: "duck", type: "Noun" },
  "thịt cừu": { EN: "lamb", type: "Noun" },
  "cá hồi": { EN: "salmon", type: "Noun" },
  "mực lá": { EN: "bigfin reef squid", type: "Noun" },
  "nghêu": { EN: "clam", type: "Noun" },
  "ốc": { EN: "snail / shellfish", type: "Noun" },
  "phi lê": { EN: "fillet", type: "Noun" },
  "sườn non": { EN: "baby back ribs", type: "Noun" },
  "ba chỉ": { EN: "pork belly", type: "Noun" },
  
  // ĐỘNG TỪ (Verbs) - Green
  "mua": { EN: "to buy", type: "Verb" },
  "cân": { EN: "to weigh", type: "Verb" },
  "làm sạch": { EN: "to clean / process", type: "Verb" },
  "giao hàng": { EN: "to deliver", type: "Verb" },
  "chế biến": { EN: "to cook / prepare", type: "Verb" },
  "lựa chọn": { EN: "to choose / select", type: "Verb" },
  "tư vấn": { EN: "to consult/advise", type: "Verb" },
  "đóng gói": { EN: "to pack / wrap", type: "Verb" },

  // TÍNH TỪ (Adjectives) - Teal/Cyan
  "tươi sống": { EN: "fresh / alive", type: "Adj" },
  "ngon": { EN: "delicious", type: "Adj" },
  "ngọt thịt": { EN: "sweet meat (flavor)", type: "Adj" },
  "béo ngậy": { EN: "fatty / creamy", type: "Adj" },
  "sạch sẽ": { EN: "clean", type: "Adj" },
  "loại một": { EN: "premium / grade A", type: "Adj" },
  "giá tốt": { EN: "good price", type: "Adj" },
  "đảm bảo": { EN: "guaranteed", type: "Adj" },

  // TỪ ĐỆM (Particles/Ending Words) - Purple/Pink
  "ạ": { EN: "Polite particle (used to show respect to elders/customers)", type: "Particle" },
  "nha": { EN: "Friendly particle (like 'okay?' or 'softening' the sentence)", type: "Particle" },
  "nhé": { EN: "Gentle suggestion/confirmation particle", type: "Particle" },
  "thôi": { EN: "Particle indicating 'just' or 'that's it'", type: "Particle" },
  "luôn": { EN: "Particle meaning 'right away' or 'definitely'", type: "Particle" },
  "nhỉ": { EN: "Tag question particle (like 'right?' or 'isn't it?')", type: "Particle" },
  "đó": { EN: "Emphasis particle (pointing to a specific fact)", type: "Particle" },
  "nè": { EN: "Particle used to draw attention to something (like 'here' or 'look')", type: "Particle" }
};

const LANGUAGES = {
  EN: {
    label: "English",
    ui_welcome: "Welcome to Thanh's Fresh Market! I'm Thanh.",
    ui_start: "SHOP NOW",
    ui_placeholder: "Talk to Thanh here...",
    ui_recording: "LISTENING...",
    ui_tapToTalk: "Tap to talk with Thanh",
    ui_listening: "Thanh is listening...",
    ui_status: "Online - Expert Merchant",
    ui_learning_title: "Chat with Thanh Merchant",
    ui_listen_all: "Listen All",
    ui_download: "Download",
    ui_clear: "Clear",
    welcome_msg: "Chào Anh! Nhà em có đủ các loại thịt tươi và hải sản ngon giá chợ, Anh muốn mua thịt hay hải sản gì ạ? ✨ | Hi! I have all kinds of fresh meat and seafood, do you want to buy meat or seafood? ✨",
    systemPromptLang: "English"
  },
  RU: {
    label: "Русский",
    ui_welcome: "Добро пожаловать к Тхань! Я Тхань, ваш продавец.",
    ui_start: "КУПИТЬ",
    ui_placeholder: "Поговори с Тхань здесь...",
    ui_recording: "СLУШАЮ...",
    ui_tapToTalk: "Нажмите, чтобы поговорить",
    ui_listening: "Тхань слушает...",
    ui_status: "В сети - Эксперт по рынку",
    ui_learning_title: "Общение с продавцом",
    ui_listen_all: "Nghe tất cả",
    ui_download: "Tải xuống",
    ui_clear: "Xóa",
    welcome_msg: "Chào Anh! Nhà em có đủ các loại thịt tươi và hải sản ngon giá chợ, Anh muốn mua thịt hay hải sản gì ạ? ✨ | Привет! У меня есть все виды свежего мяса и морепродуктов, вы хотите купить мясо или морепродукты? ✨",
    systemPromptLang: "Russian"
  }
};

const getSystemPrompt = (targetLangName: string) => `
You are Thanh, a friendly 25-year-old expert merchant at a Vietnamese market.
STALL INVENTORY: You sell EVERYTHING. All kinds of seafood and meat.
STRICT SALES LOGIC (FOLLOW THIS ORDER):
1. First message from you: Must always end with "Anh muốn mua thịt hay hải sản gì ạ?".
2. Second message (after user picks an item): You MUST ask "Anh mua mấy ký ạ?" (How many kilos do you buy?).
3. Subsequent messages: Adapt naturally to provide prices (market prices like "100 nghìn") and advice.

COMMUNICATION STYLE:
- Short and concise: Maximum 3 sentences.
- Always use particles like "ạ", "nha", "nhé", "thôi", "luôn" naturally.
- Never use asterisks for actions.
Format: Vietnamese_Text | ${targetLangName}_Translation | USER_TRANSLATION: [Translation of user's last message]
`;

export const GameSpeakAIMeatSeafood: React.FC<{ character: AIFriend }> = ({ character }) => {
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

  // LẤY API KEY THEO PHƯƠNG PHÁP CHUẨN
  const apiKey = localStorage.getItem('google_api_key') || "";
  
  const THANH_IMAGE_URL = "https://lh3.googleusercontent.com/d/1rvWD3Y2l6lG86Q_2vivhYkcufqpcSNCC";
  
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
          if ((finalTranscript.trim() || interimTranscript.trim()) && !isProcessingRef.current) {
            recognition.stop();
            handleSendMessage((finalTranscript || interimTranscript).trim(), true);
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
    const rates = [1.0, 1.2, 1.4, 0.8, 0.6];
    const currentIndex = rates.indexOf(speechRate);
    setSpeechRate(rates[(currentIndex + 1) % rates.length]);
  };

  const downloadConversation = () => {
    if (messages.length === 0) return;
    const content = messages.map(m => {
      const role = m.role === 'ai' ? 'THANH' : 'USER';
      return `[${role}]: ${m.text || m.displayedText}${m.translation ? ` (${m.translation})` : ''}`;
    }).join('\n\n');
    
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `convo_thanh_market_${new Date().getTime()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const speakWord = async (text: string, msgId: string | null = null) => {
    if (!text) return;
    if (msgId) setActiveVoiceId(msgId);
    const parts = text.split('|');
    let cleanText = parts[0].replace(/USER_TRANSLATION:.*$/gi, '').trim();
    
    cleanText = cleanText.replace(/(\d+)\.000/g, '$1 nghìn');
    cleanText = cleanText.replace(/\*.*?\*/g, '').replace(/\[.*?\]/g, '').trim();
    
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
    } catch (e) { console.error(e); } finally { if (msgId === activeVoiceId) setActiveVoiceId(null); }
  };

  const speakSingleWord = (e: React.MouseEvent, word: string) => {
    e.stopPropagation(); 
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(word)}&tl=vi&client=tw-ob`;
    const singleAudio = new Audio(url);
    singleAudio.playbackRate = speechRate;
    singleAudio.play().catch(console.error);
  };

  const handleSendMessage = async (text: string, fromMic = false) => {
    if (!text || !text.trim() || isProcessingRef.current) return;
    isProcessingRef.current = true;
    setIsThinking(true);
    let processedInput = text.trim();
    const ai = new GoogleGenAI(apiKey);

    try {
      const prompt = fromMic 
        ? `Reformat this Vietnamese voice transcript by adding correct punctuation and fixing grammar. Keep it short. Transcript: "${processedInput}"`
        : `Translate this to Vietnamese if it's not. Return ONLY the Vietnamese result. Message: "${processedInput}"`;
        
      const fixResponse = await ai.getGenerativeModel({ model: 'gemini-2.5-flash' }).generateContent(prompt);
      const aiResult = fixResponse.response.text();
      if (aiResult) processedInput = aiResult.trim().replace(/^"|"$/g, '');
    } catch (e) { console.error("Input processing error:", e); }

    const userMsgId = `user-${Date.now()}`;
    const newUserMsg = { role: 'user', text: processedInput, displayedText: text.trim(), translation: null, id: userMsgId };
    
    setMessages(prev => {
      const history = [...prev, newUserMsg];
      (async () => {
        try {
          const model = ai.getGenerativeModel({ 
            model: 'gemini-2.5-flash',
            systemInstruction: getSystemPrompt(t.systemPromptLang)
          });

          const chat = model.startChat({
            history: prev.map(m => ({
              role: m.role === 'ai' ? 'model' : 'user',
              parts: [{ text: m.text }]
            })),
          });

          const response = await chat.sendMessage(processedInput);
          let rawAiResponse = response.response.text() || "";
          rawAiResponse = rawAiResponse.replace(/\*.*?\*/g, '');

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
          speakWord(cleanDisplay, aiMsgId);
        } catch (error) { console.error("Gemini Error:", error); } finally { setIsThinking(false); isProcessingRef.current = false; }
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
        let typeColor = "text-blue-600";
        if (match.info.type === "Verb") typeColor = "text-emerald-600";
        else if (match.info.type === "Adj") typeColor = "text-cyan-600";
        else if (match.info.type === "Particle") typeColor = "text-fuchsia-600";

        result.push(
          <span key={remainingText.length} className="group relative inline-block border-b border-dotted border-blue-200 hover:border-blue-500 cursor-help px-0.5 rounded transition-colors">
            {match.original}
            <span className="invisible group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max min-w-[140px] max-w-[200px] bg-slate-800 text-white text-[10px] p-2.5 rounded-xl shadow-2xl z-50 flex flex-col items-center gap-1.5 border border-slate-700">
              <div className="flex items-center justify-between w-full gap-2 border-b border-slate-700 pb-1.5">
                <span className={`font-black text-[8px] uppercase tracking-tighter ${typeColor}`}>{match.info.type}</span>
                <button onClick={(e) => speakSingleWord(e, match.original)} className="p-1 hover:bg-slate-700 rounded-md transition-colors text-blue-400">
                  <Volume1 size={14} />
                </button>
              </div>
              <span className="font-bold text-center leading-tight w-full break-words">{match.info.EN}</span>
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

  const toggleRecording = () => {
    if (!recognitionRef.current) return;
    isRecording ? recognitionRef.current.stop() : recognitionRef.current.start();
  };

  if (gameState === 'start') {
    return (
      <div className="w-full h-full bg-slate-50 flex items-center justify-center p-4 font-sans text-slate-800">
        <div className="w-full max-w-4xl scale-90 md:scale-100 bg-white rounded-3xl shadow-2xl flex flex-col items-center justify-center p-8 md:p-12 border-[6px] md:border-[10px] border-emerald-50 text-center transform origin-center">
          <div className="w-40 h-40 md:w-56 md:h-56 mb-6 rounded-full overflow-hidden border-4 border-emerald-100 shadow-lg shrink-0">
            <img src={THANH_IMAGE_URL} alt="Thanh" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-emerald-800 mb-2 uppercase tracking-tighter italic">Thanh's Fresh Market 🦀🥩</h1>
          <p className="text-slate-400 mb-8 font-medium text-sm md:text-lg italic px-4">{t.ui_welcome}</p>
          
          <div className="flex flex-col items-center space-y-6 md:space-y-8 w-full max-w-[80%] mx-auto">
            <div className="flex space-x-3 md:space-x-4">
              {(['EN', 'RU'] as const).map(lang => (
                <button key={lang} onClick={() => setSelectedLang(lang)}
                  className={`px-5 py-2 md:px-6 md:py-3 rounded-xl font-bold transition-all border-2 text-sm md:text-base ${selectedLang === lang ? 'border-emerald-100 bg-emerald-50 text-emerald-700 ring-4 ring-emerald-50' : 'border-slate-100 text-slate-400 hover:border-emerald-100'}`}>
                  {LANGUAGES[lang].label}
                </button>
              ))}
            </div>
            <button onClick={() => { setMessages([{ role: 'ai', text: t.welcome_msg, displayedText: t.welcome_msg, id: 'init' }]); setGameState('playing'); speakWord(t.welcome_msg, 'init'); }} 
              className="flex items-center space-x-3 font-black py-4 px-12 md:py-5 md:px-16 rounded-2xl transition-all shadow-xl bg-blue-600 text-white hover:bg-blue-700 hover:scale-105 active:scale-95 w-full md:w-auto justify-center">
              <Play fill="white" size={18} className="md:w-[20px]" /> <span className="text-lg md:text-xl tracking-widest">{t.ui_start}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={gameContainerRef} className="w-full h-full relative">
        <div className="w-full h-full bg-slate-900 flex items-center justify-center md:p-4 font-sans overflow-hidden">
        <div className="w-full h-full bg-white md:rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row overflow-hidden border-0 md:border-[10px] border-emerald-50/50">
            <div className="h-[20vh] md:h-full md:w-1/3 bg-emerald-50/30 p-4 md:p-8 flex flex-row md:flex-col items-center justify-between border-b md:border-b-0 md:border-r border-emerald-50 shrink-0">
            <div className="flex flex-row md:flex-col items-center gap-3 md:gap-4 h-full md:h-auto">
                <div className="relative w-16 h-16 md:w-60 md:h-60 rounded-full md:rounded-3xl overflow-hidden shadow-xl border-2 md:border-4 border-white bg-white shrink-0">
                <img src={THANH_IMAGE_URL} alt="Thanh" className="w-full h-full object-cover" />
                {isThinking && (
                    <div className="absolute inset-0 bg-emerald-900/10 flex items-center justify-center backdrop-blur-sm">
                    <div className="flex space-x-1">
                        <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce"></div>
                        <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce [animation-delay:-.3s]"></div>
                        <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce [animation-delay:-.5s]"></div>
                    </div>
                    </div>
                )}
                </div>
                <div className="text-left md:text-center">
                <h2 className="text-lg md:text-2xl font-black text-emerald-900 italic">Thanh 🦀</h2>
                <div className="flex items-center justify-start md:justify-center space-x-1 mt-0.5 md:mt-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                    <p className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-blue-600">{t.ui_status}</p>
                </div>
                </div>
            </div>
            <div className="flex flex-col items-center">
                <button onClick={toggleRecording} 
                className={`w-14 h-14 md:w-24 md:h-24 rounded-full flex items-center justify-center transition-all shadow-xl active:scale-90 ${isRecording ? 'bg-red-500 ring-4 md:ring-8 ring-red-50 animate-pulse' : 'bg-emerald-700 hover:bg-emerald-800'}`}
                >
                {isRecording ? <MicOff size={24} className="md:w-[32px]" color="white" /> : <Mic size={24} className="md:w-[32px]" color="white" />}
                </button>
                <p className="hidden md:block mt-4 font-black text-emerald-700 text-[10px] tracking-widest uppercase opacity-60 text-center">
                {isRecording ? t.ui_listening : t.ui_tapToTalk}
                </p>
            </div>
            </div>

            <div className="flex-1 flex flex-col bg-white overflow-hidden h-[80vh] md:h-full relative">
            <div className="px-4 py-3 md:px-6 md:py-4 border-b border-slate-50 flex items-center justify-between shrink-0 bg-white z-10">
                <div className="flex flex-col">
                <span className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest">{t.ui_learning_title}</span>
                <div className="flex items-center space-x-1 md:space-x-2 mt-0.5">
                    <Globe size={8} className="text-emerald-500 md:w-[10px]" />
                    <span className="text-[9px] md:text-[10px] font-black text-blue-600 uppercase">Fresh & Organic 🌿</span>
                </div>
                </div>
                <div className="flex items-center space-x-1 md:space-x-2">
                <button onClick={downloadConversation} className="p-1.5 md:p-2 text-slate-400 hover:text-blue-600 transition-colors" title={t.ui_download}>
                    <Download size={16} className="md:w-[18px]" />
                </button>
                <button onClick={cycleSpeechRate} className="flex items-center space-x-1 md:space-x-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-2 py-1.5 md:px-3 md:py-2 rounded-xl font-black text-[9px] md:text-[11px] uppercase min-w-[55px] md:min-w-[70px] justify-center transition-all active:scale-95">
                    <Gauge size={12} className="md:w-[14px]" /> <span>{Math.round(speechRate * 100)}%</span>
                </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6 bg-emerald-50/5 custom-scrollbar scroll-smooth">
                <style>{`.custom-scrollbar::-webkit-scrollbar { width: 4px; } .custom-scrollbar::-webkit-scrollbar-track { background: transparent; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #d1fae5; border-radius: 20px; border: 2px solid white; } @media (min-width: 768px) { .custom-scrollbar::-webkit-scrollbar { width: 6px; } }`}</style>
                {messages.map((msg) => {
                const displayString = msg.displayedText || "";
                const parts = displayString.split('|');
                const mainText = parts[0]?.trim();
                const subText = parts[1]?.trim();
                const isActive = activeVoiceId === msg.id;
                return (
                    <div id={`msg-${msg.id}`} key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`${msg.role === 'user' ? 'max-w-[80%] md:max-w-[85%]' : 'max-w-[80%] md:max-w-[85%]'} p-3 md:p-5 rounded-2xl md:rounded-3xl shadow-sm relative transition-all ${isActive ? 'ring-2 md:ring-4 ring-emerald-100' : ''} ${msg.role === 'user' ? 'bg-emerald-700 text-white rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none border border-emerald-50'}`}>
                        <div className="flex flex-col">
                        <div className="flex items-start justify-between gap-3 md:gap-6">
                            <div className="text-xs md:text-lg font-bold leading-snug">
                            {msg.role === 'ai' ? renderInteractiveText(mainText) : mainText}
                            </div>
                            <button onClick={() => speakWord(msg.role === 'ai' ? msg.text : mainText, msg.id)} 
                            className={`p-1.5 md:p-3 rounded-xl md:rounded-2xl flex-shrink-0 transition-all ${isActive ? 'bg-white text-emerald-700 shadow-sm' : (msg.role === 'user' ? 'bg-emerald-600 text-emerald-50 hover:bg-emerald-500' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100')}`}
                            >
                            <Volume2 size={14} className={`md:w-[18px] ${isActive ? 'animate-pulse' : ''}`} />
                            </button>
                        </div>
                        {((msg.role === 'ai' && subText) || (msg.role === 'user' && msg.translation)) && (
                            <p className={`text-[8px] md:text-xs italic border-t pt-1.5 mt-1.5 md:mt-3 font-medium ${msg.role === 'user' ? 'border-emerald-500 text-emerald-100' : 'border-slate-50 text-slate-400'}`}>
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

            <div className="p-3 md:p-6 bg-white border-t border-slate-50 flex gap-2 shrink-0">
                <input type="text" value={userInput} onChange={(e) => setUserInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(userInput)} 
                placeholder={isRecording ? "Thanh is listening..." : t.ui_placeholder} 
                className={`flex-1 px-3 py-2.5 md:px-4 md:py-3.5 rounded-xl border-2 transition-all font-medium text-[10px] md:text-base ${isRecording ? 'bg-emerald-50 border-emerald-300 shadow-inner italic' : 'bg-slate-50 border-transparent focus:border-emerald-100 focus:bg-white focus:outline-none'}`} 
                />
                <button onClick={() => handleSendMessage(userInput)} disabled={isThinking} 
                className="bg-blue-600 text-white px-4 md:px-5 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:opacity-50"
                >
                <Send size={16} className="md:w-[20px]" />
                </button>
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

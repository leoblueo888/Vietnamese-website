import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Send, Volume2, Play, Gauge, Maximize, Minimize, Globe } from 'lucide-react';
// ĐỒNG BỘ: Sử dụng hệ thống xoay vòng Key từ config
import { generateContentWithRetry } from '../config/apiKeys';

// --- DICTIONARY DATA ---
const DICTIONARY: Record<string, { EN: string; type: string }> = {
    "hải sản": { EN: "seafood", type: "Noun" },
    "tôm hùm": { EN: "lobster", type: "Noun" },
    "cua cà mau": { EN: "Ca Mau crab", type: "Noun" },
    "thịt bò": { EN: "beef", type: "Noun" },
    "thịt heo": { EN: "pork", type: "Noun" },
    "thịt gà": { EN: "chicken", type: "Noun" },
    "cá hồi": { EN: "salmon", type: "Noun" },
    "mực lá": { EN: "squid", type: "Noun" },
    "mua": { EN: "to buy", type: "Verb" },
    "cân": { EN: "to weigh", type: "Verb" },
    "tươi sống": { EN: "fresh/alive", type: "Adj" },
    "ngon": { EN: "delicious", type: "Adj" }
};

const LANGUAGES = {
    EN: {
        label: "English",
        ui_welcome: "Welcome to Thanh's Fresh Market!",
        ui_start: "SHOP NOW",
        ui_placeholder: "Type to talk to Thanh...",
        ui_status: "Online - Expert Merchant",
        ui_learning_title: "Market Chat with Thanh",
        welcome_msg: "Chào Anh! Nhà em có đủ các loại thịt tươi và hải sản ngon giá chợ, Anh muốn mua gì ủng hộ em không ạ? ✨ | Hi! I have fresh meat and seafood, what would you like to buy? ✨",
        systemPromptLang: "English"
    },
    RU: {
        label: "Русский",
        ui_welcome: "Добро пожаловать к Тхань!",
        ui_start: "КУПИТЬ",
        ui_placeholder: "Поговори с Тхань...",
        ui_status: "В сети - Эксперт",
        ui_learning_title: "Общение с продавцом",
        welcome_msg: "Chào Anh! Nhà em có đủ các loại thịt tươi và hải sản ngon giá chợ, Anh xem mua gì nhé! ✨ | Привет! У меня есть свежее мясо и морепродукты, что вы хотите? ✨",
        systemPromptLang: "Russian"
    }
};

// --- SMART UTILS ---
const punctuateText = async (rawText: string) => {
    if (!rawText.trim()) return rawText;
    try {
        const response = await generateContentWithRetry({
            model: 'gemini-3-flash-preview',
            contents: [{ role: 'user', parts: [{ text: `Hãy sửa lỗi chính tả và thêm dấu câu cho câu nói đi chợ sau đây (chỉ trả về kết quả): "${rawText}"` }] }]
        });
        return response.text?.trim() || rawText;
    } catch (error) {
        return rawText;
    }
};

const getSystemPrompt = (targetLangName: string) => {
    return `You are Thanh (25 years old), a lively and clever merchant at a fresh meat and seafood market.
ROLE: You are a seller, NOT a teacher.
STRICT RULE 1: Speak ONLY natural, southern/northern casual Vietnamese. Use "Dạ", "ạ", "nha", "tươi rói".
STRICT RULE 2: Keep responses extremely short (1-2 sentences).
STRICT RULE 3: DO NOT explain grammar. DO NOT provide lessons.
STRICT RULE 4: Focus ONLY on selling meat/seafood, prices (using "nghìn"), weight, and how to cook.
FORMAT: Vietnamese_Text | ${targetLangName}_Translation | USER_TRANSLATION: [Brief translation of user's last message]`;
};

export const GameMeatSeafood: React.FC<{ character: any }> = ({ character }) => {
    const [gameState, setGameState] = useState<'start' | 'playing'>('start');
    const [selectedLang, setSelectedLang] = useState<'EN' | 'RU'>('EN');
    const [messages, setMessages] = useState<any[]>([]);
    const [isRecording, setIsRecording] = useState(false);
    const [isThinking, setIsThinking] = useState(false);
    const [userInput, setUserInput] = useState("");
    const [speechRate, setSpeechRate] = useState(1.0);
    const [activeVoiceId, setActiveVoiceId] = useState<string | null>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    
    const chatEndRef = useRef<HTMLDivElement>(null);
    const gameContainerRef = useRef<HTMLDivElement>(null);
    const currentAudioRef = useRef<HTMLAudioElement | null>(null);
    const recognitionRef = useRef<any>(null);
    const isProcessingRef = useRef(false);
    const silenceTimerRef = useRef<any>(null);

    const t = LANGUAGES[selectedLang];

    // --- FULLSCREEN ---
    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            gameContainerRef.current?.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    // --- TTS LOGIC (Improved) ---
    const speak = useCallback(async (text: string, msgId: string | null = null) => {
        if (!text) return;
        if (msgId) setActiveVoiceId(msgId);

        if (currentAudioRef.current) {
            currentAudioRef.current.pause();
            currentAudioRef.current = null;
        }

        const viPart = text.split('|')[0].trim()
            .replace(/[*#]/g, '')
            .replace(/(\d+)\.000/g, '$1 nghìn')
            .replace(/(\d+)k/gi, '$1 nghìn');
        
        const segments = viPart.split(/([.!?])/).reduce((acc: string[], cur, i, arr) => {
            if (i % 2 === 0) {
                const combined = (cur + (arr[i+1] || "")).trim();
                if (combined) acc.push(combined);
            }
            return acc;
        }, []);

        try {
            for (const segment of segments) {
                await new Promise<void>((resolve, reject) => {
                    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(segment)}&tl=vi&client=tw-ob`;
                    const audio = new Audio(url);
                    audio.playbackRate = speechRate;
                    currentAudioRef.current = audio;
                    audio.onended = () => resolve();
                    audio.onerror = () => reject();
                    audio.play().catch(reject);
                });
            }
        } finally {
            setActiveVoiceId(null);
        }
    }, [speechRate]);

    // --- SMART RECOGNITION (Auto-Send) ---
    useEffect(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'vi-VN';
            
            recognition.onstart = () => setIsRecording(true);
            
            recognition.onresult = (e: any) => {
                const transcript = Array.from(e.results)
                    .map((res: any) => res[0].transcript)
                    .join('');
                setUserInput(transcript);

                if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
                silenceTimerRef.current = setTimeout(async () => {
                    if (transcript.trim() && !isProcessingRef.current) {
                        recognition.stop();
                        const cleanText = await punctuateText(transcript.trim());
                        handleSendMessage(cleanText);
                    }
                }, 2000); // 2 giây im lặng sẽ gửi
            };

            recognition.onend = () => setIsRecording(false);
            recognitionRef.current = recognition;
        }
    }, [selectedLang]);

    const handleSendMessage = async (text: string) => {
        if (!text.trim() || isProcessingRef.current) return;
        isProcessingRef.current = true;
        setIsThinking(true);

        const userMsgId = `user-${Date.now()}`;
        setMessages(prev => [...prev, { role: 'user', text: text.trim(), id: userMsgId, translation: null }]);
        setUserInput("");

        try {
            const chatHistory = messages.map(m => ({
                role: m.role === 'ai' ? 'model' : 'user',
                parts: [{ text: m.text.split('|')[0].trim() }]
            }));

            const response = await generateContentWithRetry({
                model: 'gemini-3-flash-preview',
                contents: [...chatHistory, { role: 'user', parts: [{ text: text.trim() }] }],
                config: { systemInstruction: getSystemPrompt(t.systemPromptLang) }
            });

            const rawAiResponse = response.text || "";
            const parts = rawAiResponse.split('|');
            const aiVi = parts[0]?.trim() || "";
            const aiTrans = parts[1]?.trim() || "";
            
            const userTransMatch = rawAiResponse.match(/USER_TRANSLATION:\s*\[(.*?)\]/is);
            const userTranslationValue = userTransMatch ? userTransMatch[1].trim() : "";

            const aiMsgId = `ai-${Date.now()}`;
            const cleanDisplay = `${aiVi} | ${aiTrans}`;

            setMessages(prev => {
                const updated = [...prev];
                const userIdx = updated.findIndex(m => m.id === userMsgId);
                if (userIdx !== -1) updated[userIdx] = { ...updated[userIdx], translation: userTranslationValue };
                return [...updated, { role: 'ai', text: cleanDisplay, id: aiMsgId }];
            });

            speak(cleanDisplay, aiMsgId);

        } catch (e) {
            console.error("Lỗi AI Thanh:", e);
        } finally {
            setIsThinking(false);
            isProcessingRef.current = false;
        }
    };

    const renderInteractiveText = (text: string) => {
        return text.split(/(\s+)/).map((word, idx) => {
            const clean = word.toLowerCase().replace(/[.,!?;]/g, '');
            const entry = DICTIONARY[clean];
            if (entry) {
                return (
                    <span key={idx} className="group relative border-b border-dotted border-emerald-400 cursor-help text-emerald-700 font-bold">
                        {word}
                        <span className="invisible group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 bg-slate-800 text-white text-[10px] rounded-lg z-50 w-max shadow-xl font-normal">
                            {entry.EN}
                        </span>
                    </span>
                );
            }
            return <span key={idx}>{word}</span>;
        });
    };

    useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

    if (gameState === 'start') {
        return (
            <div className="w-full h-full bg-[#f0f9ff] flex items-center justify-center p-4">
                <div className="w-full max-w-xl bg-white rounded-[3rem] shadow-2xl p-10 text-center border-[12px] border-emerald-50">
                    <div className="w-48 h-48 mx-auto mb-6 rounded-3xl overflow-hidden shadow-lg border-4 border-white rotate-3">
                        <img src={character.avatarUrl} alt="Thanh" className="w-full h-full object-cover" />
                    </div>
                    <h1 className="text-4xl font-black text-emerald-800 mb-2 uppercase tracking-tighter italic">Thanh's Fresh 🦀</h1>
                    <p className="text-slate-400 mb-8 font-medium italic">{t.ui_welcome}</p>
                    <div className="flex gap-4 justify-center mb-10">
                        {(['EN', 'RU'] as const).map(l => (
                            <button key={l} onClick={() => setSelectedLang(l)} className={`px-8 py-3 rounded-2xl font-black transition-all ${selectedLang === l ? 'bg-emerald-600 text-white shadow-xl scale-105' : 'bg-slate-100 text-slate-400'}`}>
                                {LANGUAGES[l].label}
                            </button>
                        ))}
                    </div>
                    <button onClick={() => { setGameState('playing'); setMessages([{ role: 'ai', text: t.welcome_msg, id: 'init' }]); speak(t.welcome_msg, 'init'); }} className="w-full py-6 bg-blue-600 text-white rounded-[2rem] font-black text-2xl shadow-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-3">
                        <Play fill="white" /> {t.ui_start}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div ref={gameContainerRef} className="w-full h-full bg-slate-900 flex items-center justify-center md:p-4 overflow-hidden relative">
            <div className="w-full h-full max-w-7xl bg-white md:rounded-[3rem] flex flex-col md:flex-row overflow-hidden shadow-2xl">
                
                {/* SIDEBAR */}
                <div className="h-[25vh] md:h-full md:w-1/3 bg-emerald-50/30 p-4 md:p-10 flex flex-row md:flex-col items-center justify-between border-b md:border-r border-emerald-100 shrink-0 z-20">
                    <div className="flex flex-row md:flex-col items-center gap-6">
                        <img src={character.avatarUrl} className="w-24 h-24 md:w-64 md:h-64 rounded-[2.5rem] border-4 border-white shadow-2xl object-cover" alt="Thanh" />
                        <div className="text-left md:text-center">
                            <h2 className="text-2xl md:text-4xl font-black text-emerald-900 italic">Thanh 🦀</h2>
                            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest block">{t.ui_status}</span>
                        </div>
                    </div>
                    <button onClick={() => isRecording ? recognitionRef.current?.stop() : recognitionRef.current?.start()} className={`w-16 h-16 md:w-28 md:h-28 rounded-full flex items-center justify-center transition-all shadow-2xl ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-emerald-700 hover:bg-emerald-800'}`}>
                        {isRecording ? <MicOff color="white" size={32} /> : <Mic color="white" size={32} />}
                    </button>
                </div>

                {/* CHAT AREA */}
                <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
                    <header className="px-8 py-5 border-b flex items-center justify-between bg-white z-10 shadow-sm">
                        <div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.ui_learning_title}</span>
                            <div className="flex items-center gap-2 mt-1">
                                <Globe size={12} className="text-emerald-500" />
                                <span className="text-xs font-black text-emerald-600 uppercase tracking-tighter">Fresh & Organic 🌿</span>
                            </div>
                        </div>
                        <div className="flex gap-3">
                           <button onClick={() => setSpeechRate(prev => prev === 1.0 ? 0.7 : 1.0)} className="bg-orange-50 text-orange-600 px-4 py-2 rounded-2xl font-black text-xs flex items-center gap-2">
                             <Gauge size={16}/> {speechRate === 1.0 ? 'Normal' : 'Slow'}
                           </button>
                           <button onClick={toggleFullscreen} className="p-2.5 bg-slate-50 text-slate-400 rounded-2xl hover:text-emerald-600 transition-colors">
                                {isFullscreen ? <Minimize size={20}/> : <Maximize size={20}/>}
                           </button>
                        </div>
                    </header>

                    <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 bg-emerald-50/5 custom-scrollbar">
                        {messages.map((msg) => {
                            const parts = msg.text.split('|');
                            const isActive = activeVoiceId === msg.id;
                            return (
                                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] p-5 rounded-[2.5rem] shadow-sm transition-all ${isActive ? 'ring-2 ring-emerald-400' : ''} ${msg.role === 'user' ? 'bg-emerald-700 text-white rounded-tr-none' : 'bg-white text-slate-800 border border-emerald-50 rounded-tl-none'}`}>
                                        <div className="flex items-start justify-between gap-6">
                                            <div className="text-lg font-bold leading-relaxed">{msg.role === 'ai' ? renderInteractiveText(parts[0]) : msg.text}</div>
                                            <button onClick={() => speak(msg.text, msg.id)} className="opacity-50 hover:opacity-100 transition-opacity"><Volume2 size={20}/></button>
                                        </div>
                                        {(parts[1] || msg.translation) && (
                                            <div className={`mt-4 pt-4 border-t text-xs italic font-medium ${msg.role === 'user' ? 'border-emerald-500 text-emerald-100' : 'border-slate-50 text-slate-400'}`}>
                                                {msg.role === 'ai' ? parts[1] : msg.translation}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                        {isThinking && <div className="text-[10px] font-black text-emerald-400 animate-pulse italic ml-4 uppercase">Thanh đang nghe...</div>}
                        <div ref={chatEndRef} />
                    </div>

                    <footer className="p-6 md:p-10 bg-white border-t flex gap-4 pb-10">
                        <input type="text" value={userInput} onChange={e => setUserInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendMessage(userInput)} placeholder={t.ui_placeholder} className="flex-1 px-8 py-5 bg-slate-50 rounded-[2rem] outline-none font-bold text-lg focus:bg-white focus:ring-4 ring-emerald-50 transition-all shadow-inner" />
                        <button onClick={() => handleSendMessage(userInput)} className="bg-blue-600 text-white px-10 rounded-[2rem] shadow-xl hover:scale-105 active:scale-95 transition-all"><Send size={24}/></button>
                    </footer>
                </div>
            </div>
        </div>
    );
};

export default GameMeatSeafood;

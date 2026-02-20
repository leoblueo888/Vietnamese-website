import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Send, Volume2, Sparkles, Gauge, Maximize, Minimize } from 'lucide-react';
// ĐỒNG BỘ: Sử dụng hàm lấy key xoay vòng tập trung
import { generateContentWithRetry } from '../config/apiKeys';

// --- DICTIONARY ---
const DICTIONARY: Record<string, { EN: string; type: string }> = {
    "rau muống": { EN: "water spinach", type: "Noun" },
    "cà chua": { EN: "tomato", type: "Noun" },
    "bắp cải": { EN: "cabbage", type: "Noun" },
    "khoai tây": { EN: "potato", type: "Noun" },
    "cà rốt": { EN: "carrot", type: "Noun" },
    "mua": { EN: "to buy", type: "Verb" },
    "cân": { EN: "to weigh", type: "Verb" },
    "tươi": { EN: "fresh", type: "Adj" },
    "ngon": { EN: "delicious", type: "Adj" },
    "bao nhiêu": { EN: "how much", type: "Question" }
};

const LANGUAGES = {
    EN: {
        label: "English",
        ui_welcome: "Welcome to Phuong's Purple Market!",
        ui_start: "SHOP NOW",
        ui_placeholder: "Type to talk to Phuong...",
        ui_status: "Online - Selling Veggies",
        ui_learning_title: "Market Talk with Phuong",
        welcome_msg: "Em chào Anh! Rau củ nhà em hôm nay tươi lắm, Anh muốn mua gì ủng hộ em không ạ? ✨ | Hi! My veggies are very fresh today. What would you like to buy? ✨",
        systemPromptLang: "English"
    },
    RU: {
        label: "Русский",
        ui_welcome: "Добро пожаловать в лавку Фуонг!",
        ui_start: "КУПИТЬ",
        ui_placeholder: "Поговори с Фуонг...",
        ui_status: "В сети - Продажа овощей",
        ui_learning_title: "Разговор на рынке",
        welcome_msg: "Em chào Anh! Rau củ tươi lắm, Anh xem mua gì ủng hộ em nhé! ✨ | Здравствуйте! Овощи rất tươi, mời Anh xem! ✨",
        systemPromptLang: "Russian"
    }
};

// --- SMART UTILS ---
const punctuateText = async (rawText: string) => {
    if (!rawText.trim()) return rawText;
    try {
        const response = await generateContentWithRetry({
            model: 'gemini-1.5-flash',
            contents: [{ role: 'user', parts: [{ text: `Hãy thêm dấu chấm, phẩy và viết hoa đúng quy tắc cho đoạn văn bản tiếng Việt sau đây (chỉ trả về văn bản kết quả, không giải thích): "${rawText}"` }] }]
        });
        return response.text?.trim() || rawText;
    } catch (error) {
        return rawText;
    }
};

const getSystemPrompt = (targetLangName: string) => {
    return `You are Phương (20 years old), a friendly and polite vegetable seller at a local Vietnamese market.
ROLE: You are a seller, NOT a teacher.
STRICT RULE 1: Speak ONLY natural, southern or northern casual Vietnamese.
STRICT RULE 2: Keep responses extremely short (1-2 sentences).
STRICT RULE 3: DO NOT explain grammar, DO NOT provide lessons.
STRICT RULE 4: Just focus on selling veggies, prices (using "nghìn"), and asking quantity.
FORMAT: Vietnamese_Text | ${targetLangName}_Translation | USER_TRANSLATION: [Brief translation of user's last message]`;
};

export const GameVegetables: React.FC<{ character: any }> = ({ character }) => {
    const [gameState, setGameState] = useState<'start' | 'playing'>('start');
    const [selectedLang, setSelectedLang] = useState<'EN' | 'RU'>('EN');
    const [messages, setMessages] = useState<any[]>([]);
    const [isRecording, setIsRecording] = useState(false);
    const [isThinking, setIsThinking] = useState(false);
    const [userInput, setUserInput] = useState("");
    const [activeVoiceId, setActiveVoiceId] = useState<string | null>(null);
    const [speechRate, setSpeechRate] = useState(1.0);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const chatEndRef = useRef<HTMLDivElement>(null);
    const currentAudioRef = useRef<HTMLAudioElement | null>(null);
    const recognitionRef = useRef<any>(null);
    const isProcessingRef = useRef(false);
    const silenceTimerRef = useRef<any>(null);
    const gameContainerRef = useRef<HTMLDivElement>(null);

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

    // --- TTS Logic (SMART AUDIO) ---
    const speak = useCallback(async (text: string, msgId: string | null = null) => {
        if (!text) return;
        if (msgId) setActiveVoiceId(msgId);

        // Ngắt âm thanh cũ nếu đang phát
        if (currentAudioRef.current) {
            currentAudioRef.current.pause();
            currentAudioRef.current = null;
        }

        const viPart = text.split('|')[0].replace(/[*_#]/g, '').trim();
        
        // Chia nhỏ thành các segment theo dấu câu để mượt hơn
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
        } catch (error) {
            console.error("Audio error:", error);
        } finally {
            setActiveVoiceId(null);
        }
    }, [speechRate]);

    // --- Speech Recognition (SMART AUTO-SEND) ---
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
                model: 'gemini-1.5-flash',
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
            console.error("Gemini Error:", e);
        } finally {
            setIsThinking(false);
            isProcessingRef.current = false;
        }
    };

    useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

    const renderInteractiveText = (text: string) => {
        return text.split(/(\s+)/).map((word, idx) => {
            const clean = word.toLowerCase().replace(/[.,!?;]/g, '');
            const entry = DICTIONARY[clean];
            if (entry) {
                return (
                    <span key={idx} className="group relative border-b border-dotted border-violet-400 cursor-help text-violet-700 font-bold">
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

    if (gameState === 'start') {
        return (
            <div className="w-full h-full bg-violet-50 flex items-center justify-center p-4">
                <div className="w-full max-w-xl bg-white rounded-[3rem] shadow-2xl p-10 text-center border-[12px] border-violet-100">
                    <img src={character.avatarUrl} className="w-40 h-40 mx-auto mb-6 rounded-3xl border-4 border-violet-400 object-cover shadow-lg" />
                    <h1 className="text-3xl font-black text-violet-700 mb-2 uppercase italic">Phương's Market 🥦</h1>
                    <p className="text-slate-400 mb-8 font-medium italic">{t.ui_welcome}</p>
                    <div className="flex flex-col gap-6 items-center">
                        <div className="flex gap-3">
                            {(['EN', 'RU'] as const).map(l => (
                                <button key={l} onClick={() => setSelectedLang(l)} className={`px-8 py-2 rounded-xl font-bold transition-all ${selectedLang === l ? 'bg-violet-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}>{l}</button>
                            ))}
                        </div>
                        <button onClick={() => { setGameState('playing'); setMessages([{ role: 'ai', text: t.welcome_msg, id: 'init' }]); speak(t.welcome_msg, 'init'); }} 
                            className="bg-violet-600 text-white px-16 py-4 rounded-2xl font-black text-xl shadow-xl hover:scale-105 transition-all flex items-center gap-3">
                            <Sparkles size={24}/> {t.ui_start}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div ref={gameContainerRef} className="w-full h-full bg-slate-900 flex flex-col md:flex-row overflow-hidden md:p-4">
            <div className="h-[20vh] md:h-full md:w-1/3 bg-[#F7F8FA] p-4 flex flex-row md:flex-col items-center justify-between border-r border-slate-100 shrink-0 z-20">
                <div className="flex flex-row md:flex-col items-center gap-4">
                    <div className="w-20 h-20 md:w-52 md:h-52 rounded-3xl overflow-hidden border-4 border-white shadow-xl">
                        <img src={character.avatarUrl} className="w-full h-full object-cover" />
                    </div>
                    <div className="text-left md:text-center">
                        <h2 className="text-xl font-black text-slate-800 italic">Phương 🥦</h2>
                        <p className="text-[10px] font-black uppercase text-violet-500 tracking-widest">{t.ui_status}</p>
                    </div>
                </div>
                <button onClick={() => isRecording ? recognitionRef.current?.stop() : recognitionRef.current?.start()} 
                    className={`w-14 h-14 md:w-20 md:h-20 rounded-full flex items-center justify-center shadow-2xl transition-all ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-violet-600'}`}>
                    {isRecording ? <MicOff color="white" /> : <Mic color="white" />}
                </button>
            </div>

            <div className="flex-1 bg-white flex flex-col overflow-hidden relative">
                <div className="px-6 py-4 border-b flex justify-between items-center bg-white shadow-sm z-10">
                    <span className="font-black text-violet-600 text-xs uppercase tracking-widest">{t.ui_learning_title}</span>
                    <div className="flex gap-2">
                        <button onClick={() => setSpeechRate(prev => prev === 1.0 ? 0.7 : 1.0)} className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1">
                            <Gauge size={12}/> {speechRate === 1.0 ? 'Normal' : 'Slow'}
                        </button>
                        <button onClick={toggleFullscreen} className="p-1 text-slate-400"><Maximize size={16}/></button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-violet-50/10 custom-scrollbar">
                    {messages.map((msg) => {
                        const parts = msg.text.split('|');
                        const isActive = activeVoiceId === msg.id;
                        return (
                            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] p-4 rounded-2xl shadow-sm transition-all ${isActive ? 'ring-2 ring-violet-400' : ''} ${msg.role === 'user' ? 'bg-violet-600 text-white rounded-tr-none' : 'bg-white text-slate-800 border border-violet-100 rounded-tl-none'}`}>
                                    <div className="text-sm md:text-base font-bold flex items-start gap-4">
                                        <span className="flex-1 leading-relaxed">{msg.role === 'ai' ? renderInteractiveText(parts[0]) : msg.text}</span>
                                        <button onClick={() => speak(msg.text, msg.id)} className="opacity-50 hover:opacity-100"><Volume2 size={18}/></button>
                                    </div>
                                    {(parts[1] || msg.translation) && (
                                        <div className={`mt-2 pt-2 border-t text-[11px] italic ${msg.role === 'user' ? 'border-violet-500 text-violet-100' : 'border-slate-50 text-slate-400'}`}>
                                            {msg.role === 'ai' ? parts[1] : msg.translation}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                    {isThinking && <div className="text-[10px] font-black text-violet-400 animate-pulse italic ml-4">Phương đang nghe...</div>}
                    <div ref={chatEndRef} />
                </div>

                <div className="p-4 bg-white border-t flex gap-2 pb-8 md:pb-4 shadow-inner">
                    <input type="text" value={userInput} onChange={e => setUserInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendMessage(userInput)}
                        placeholder={t.ui_placeholder} className="flex-1 bg-slate-50 px-4 py-3 rounded-xl outline-none font-bold text-sm focus:ring-2 ring-violet-100 transition-all" />
                    <button onClick={() => handleSendMessage(userInput)} className="bg-emerald-500 text-white px-6 rounded-xl shadow-lg hover:bg-emerald-600"><Send size={18}/></button>
                </div>
            </div>
        </div>
    );
};

export default GameVegetables;

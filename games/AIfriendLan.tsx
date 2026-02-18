import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Send, Volume2, Play, Globe, Download, Gauge } from 'lucide-react';
import { generateContentWithRetry } from '../config/apiKeys';

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
            welcome_msg: `Dạ, em chào ${userPronoun} ${userName}! Em là Lan. Rất vui được gặp ${userPronoun} ạ! 🌸 | Здравствуйте, ${userName}! Я Лан. Рада встрече! 🌸`,
            systemPromptLang: "Russian"
        }
    };
    if (topic) {
        t.EN.welcome_msg = `Chào ${userPronoun} ${userName}, em là Lan đây. Em thấy ${userPronoun} vừa học xong chủ đề "${topic}". Mình cùng trò chuyện về nó nhé? ✨`;
    }
    return t;
};

const getSystemPrompt = (targetLangName: string, topic?: string | null) => {
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : { name: 'Guest', gender: 'male' };
    const userName = user.name || 'Guest';
    const userPronoun = user.gender === 'female' ? 'Chị' : 'Anh';

    return `You are Lan, a friendly 25-year-old girl from Ha Long, Vietnam. Refer to yourself as "Em" and address the user as "${userPronoun}". 
    STRICT ROLE: Only speak Vietnamese. Keep responses 1-3 sentences.
    FORMAT: Vietnamese_Text | ${targetLangName}_Translation | USER_TRANSLATION: [Translation of user's last message]`;
};

export const AIfriendLan: React.FC<{ onBack?: () => void, topic?: string | null }> = ({ onBack, topic }) => {
    const [gameState, setGameState] = useState('start');
    const [selectedLang, setSelectedLang] = useState<'EN' | 'RU'>('EN');
    const [messages, setMessages] = useState<any[]>([]);
    const [isRecording, setIsRecording] = useState(false);
    const [isThinking, setIsThinking] = useState(false);
    const [userInput, setUserInput] = useState("");
    const [activeVoiceId, setActiveVoiceId] = useState<string | null>(null);
    const [speechSpeed, setSpeechSpeed] = useState(1.0);

    const chatEndRef = useRef<HTMLDivElement>(null);
    const recognitionRef = useRef<any>(null);
    const isProcessingRef = useRef(false);

    const LAN_IMAGE_URL = "https://api.dicebear.com/7.x/avataaars/svg?seed=Lan&gender=female";
    const t = getTranslations(topic)[selectedLang];

    // --- PHẦN SỬA: WEB SPEECH API (AUDIO) ---
    const speakWord = useCallback((text: string, msgId: string | null = null) => {
        if (!text) return;
        
        // Hủy mọi yêu cầu đọc đang dang dở để tránh chồng chéo
        window.speechSynthesis.cancel();

        if (msgId) setActiveVoiceId(msgId);
        
        const cleanText = text.split('|')[0].replace(/USER_TRANSLATION:.*$/gi, '').trim();
        const utterance = new SpeechSynthesisUtterance(cleanText);
        
        // Tìm voice tiếng Việt trong máy
        const voices = window.speechSynthesis.getVoices();
        const vnVoice = voices.find(v => v.lang.includes('vi-VN'));
        
        if (vnVoice) utterance.voice = vnVoice;
        utterance.lang = 'vi-VN';
        utterance.rate = speechSpeed;
        utterance.pitch = 1.1; // Chỉnh giọng cao hơn một chút cho nữ tính

        utterance.onend = () => setActiveVoiceId(null);
        utterance.onerror = () => setActiveVoiceId(null);

        window.speechSynthesis.speak(utterance);
    }, [speechSpeed]);

    // Đảm bảo voices được load (một số trình duyệt cần bước này)
    useEffect(() => {
        window.speechSynthesis.getVoices();
    }, []);

    const handleSendMessage = useCallback(async (text: string) => {
        if (!text?.trim() || isProcessingRef.current) return;
        isProcessingRef.current = true;
        setIsThinking(true);

        const userMsgId = `user-${Date.now()}`;
        const newUserMsg = { role: 'user', text: text.trim(), id: userMsgId };
        const currentHistory = [...messages, newUserMsg];
        
        setMessages(currentHistory);
        setUserInput("");

        try {
            const response = await generateContentWithRetry({
                model: 'gemini-1.5-flash',
                contents: currentHistory.map(m => ({
                    role: m.role === 'ai' ? 'model' : 'user',
                    parts: [{ text: m.text.split('|')[0] }]
                })),
                config: { systemInstruction: getSystemPrompt(t.systemPromptLang, topic) }
            });

            const rawAiResponse = response.text || "";
            const parts = rawAiResponse.split('|');
            const aiVi = parts[0]?.trim() || "";
            const aiTrans = parts[1]?.trim() || "";
            const userTransMatch = rawAiResponse.match(/USER_TRANSLATION:\s*\[(.*?)\]/i);
            const userTranslationValue = userTransMatch ? userTransMatch[1] : "";

            const aiMsgId = `ai-${Date.now()}`;
            setMessages(prev => {
                const updated = [...prev];
                const idx = updated.findIndex(m => m.id === userMsgId);
                if (idx !== -1) updated[idx].translation = userTranslationValue;
                return [...updated, { role: 'ai', text: `${aiVi} | ${aiTrans}`, id: aiMsgId }];
            });

            speakWord(aiVi, aiMsgId);
        } catch (error) {
            console.error("Lan Error:", error);
        } finally {
            setIsThinking(false);
            isProcessingRef.current = false;
        }
    }, [messages, t.systemPromptLang, topic, speakWord]);

    // Nhận diện giọng nói
    useEffect(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.lang = 'vi-VN';
            recognition.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                setUserInput(transcript);
                handleSendMessage(transcript);
            };
            recognition.onend = () => setIsRecording(false);
            recognitionRef.current = recognition;
        }
    }, [handleSendMessage]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    if (gameState === 'start') {
        return (
            <div className="w-full h-full bg-slate-900 flex items-center justify-center p-4">
                <div className="bg-white rounded-[2rem] p-10 flex flex-col items-center text-center shadow-2xl max-w-md">
                    <img src={LAN_IMAGE_URL} className="w-32 h-32 rounded-full border-4 border-sky-100 mb-6" alt="Lan" />
                    <h1 className="text-3xl font-black text-sky-600 mb-2 italic">Lan Ha Long 🌊</h1>
                    <p className="text-slate-400 mb-8 font-medium">{t.ui_welcome}</p>
                    <button onClick={() => { setGameState('playing'); setMessages([{ role: 'ai', text: t.welcome_msg, id: 'init' }]); speakWord(t.welcome_msg, 'init'); }} 
                        className="bg-sky-600 text-white px-12 py-4 rounded-2xl font-black shadow-xl hover:scale-105 transition-transform">
                        {t.ui_start}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full bg-white flex flex-col md:flex-row overflow-hidden md:rounded-[2rem] border-[10px] border-sky-50">
            <div className="md:w-1/3 bg-sky-50/50 p-6 flex flex-col items-center justify-between border-r border-sky-100">
                <div className="text-center">
                    <div className="relative w-40 h-40 mx-auto rounded-3xl overflow-hidden shadow-xl mb-4 bg-white border-4 border-white">
                        <img src={LAN_IMAGE_URL} className="w-full h-full object-cover" alt="Lan" />
                        {isThinking && <div className="absolute inset-0 bg-sky-900/10 flex items-center justify-center backdrop-blur-sm"><div className="flex gap-1 animate-bounce"><div className="w-2 h-2 bg-sky-600 rounded-full"></div><div className="w-2 h-2 bg-sky-600 rounded-full"></div></div></div>}
                    </div>
                    <h2 className="text-2xl font-black text-slate-800">Lan ✨</h2>
                    <p className="text-[10px] font-bold text-sky-500 uppercase tracking-widest">{t.ui_status}</p>
                </div>
                <button onClick={() => { if (isRecording) recognitionRef.current.stop(); else { setIsRecording(true); recognitionRef.current.start(); } }} 
                    className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${isRecording ? 'bg-red-500 ring-8 ring-red-50 animate-pulse' : 'bg-sky-600 shadow-lg'}`}>
                    {isRecording ? <MicOff color="white" /> : <Mic color="white" />}
                </button>
            </div>

            <div className="flex-1 flex flex-col h-[70vh] md:h-full">
                <div className="p-4 border-b flex justify-between items-center bg-white shrink-0">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{t.ui_learning_title}</span>
                    <button onClick={() => setSpeechSpeed(prev => prev === 1.0 ? 0.7 : 1.0)} className="text-[10px] font-bold bg-slate-100 px-3 py-1 rounded-lg flex items-center gap-1"><Gauge size={12}/> {Math.round(speechSpeed*100)}%</button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-sky-50/10 custom-scrollbar">
                    {messages.map(m => {
                        const parts = m.text.split('|');
                        const isActive = activeVoiceId === m.id;
                        return (
                            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] p-4 rounded-2xl shadow-sm transition-all ${isActive ? 'ring-4 ring-sky-100' : ''} ${m.role === 'user' ? 'bg-sky-600 text-white' : 'bg-white border border-sky-100 text-slate-800'}`}>
                                    <div className="flex justify-between items-start gap-4">
                                        <p className="font-bold text-sm md:text-base">{parts[0]}</p>
                                        <button onClick={() => speakWord(parts[0], m.id)} className="shrink-0 text-sky-400 hover:text-sky-600"><Volume2 size={16}/></button>
                                    </div>
                                    {(parts[1] || m.translation) && <p className="text-xs italic mt-2 pt-2 border-t border-slate-100 opacity-70">{parts[1] || m.translation}</p>}
                                </div>
                            </div>
                        );
                    })}
                    <div ref={chatEndRef} />
                </div>
                <div className="p-4 border-t bg-white flex gap-2 shrink-0">
                    <input type="text" value={userInput} onChange={e => setUserInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSendMessage(userInput)} placeholder={t.ui_placeholder} className="flex-1 px-4 py-3 bg-slate-50 rounded-xl focus:outline-none font-medium" />
                    <button onClick={() => handleSendMessage(userInput)} className="bg-sky-600 text-white p-3 rounded-xl shadow-lg"><Send size={20}/></button>
                </div>
            </div>
        </div>
    );
};

export default AIfriendLan;

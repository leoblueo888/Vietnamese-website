import React, { useState, useEffect, useRef, useCallback } from 'react';
import { generateContentWithRetry } from '../config/apiKeys';

export const Chatbot: React.FC = () => {
    const [currentLang, setCurrentLang] = useState<'en' | 'ru'>(() => (localStorage.getItem('app_lang') as 'en' | 'ru') || 'en');
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{ text: string; isBot: boolean }[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [isLoadingAI, setIsLoadingAI] = useState(false);

    const knowledgeBaseRef = useRef<string>("");
    const langRef = useRef(currentLang);
    const recognitionRef = useRef<any | null>(null);
    const chatBodyRef = useRef<HTMLDivElement>(null);
    const audioQueueRef = useRef<string[]>([]);
    const isPlayingRef = useRef(false);

    // Ảnh đại diện mới của Trang từ Drive 
    const TRANG_AVATAR = "https://lh3.googleusercontent.com/d/1qZb1rHs-Ahs5hDQJTh4CTDiwULXRKB1B";

    const translations = {
        en: {
            initialMessage: "Hi there, welcome to Truly Easy Vietnamese. How can I help you?",
            quickReplies: ['How to start?', 'Meet the teachers', 'I need help'],
            placeholder: "Type or click mic",
            listening: "Listening...",
            assistantLabel: "Speak with Trang"
        },
        ru: {
            initialMessage: "Здравствуйте, chào mừng đến với Truly Easy Vietnamese. Tôi có thể giúp gì cho bạn?",
            quickReplies: ['С чего начать?', 'Преподаватели', 'Мне нужна помощь'],
            placeholder: "Напишите hoặc nhấn mic",
            listening: "Слушаю...",
            assistantLabel: "Поговорить с Trang"
        }
    };

    useEffect(() => { langRef.current = currentLang; }, [currentLang]);

    // Load kiến thức từ Google Docs
    useEffect(() => {
        const loadKnowledge = async () => {
            try {
                const docUrl = 'https://docs.google.com/document/d/1i5F5VndGaGbB4d21jRjnJx2YbptF0KdBYHijnjYqe2U/export?format=txt';
                const response = await fetch(docUrl);
                knowledgeBaseRef.current = await response.text();
            } catch (error) { console.error("Lỗi tải kiến thức:", error); }
        };
        loadKnowledge();
    }, []);

    // Theo dõi đổi ngôn ngữ trên website
    useEffect(() => {
        const handleLangChange = () => {
            const newLang = (localStorage.getItem('app_lang') as 'en' | 'ru') || 'en';
            if (newLang !== currentLang) {
                setCurrentLang(newLang);
                setMessages([{ text: translations[newLang].initialMessage, isBot: true }]);
            }
        };
        window.addEventListener('languageChanged', handleLangChange);
        const interval = setInterval(handleLangChange, 1000);
        return () => { window.removeEventListener('languageChanged', handleLangChange); clearInterval(interval); };
    }, [currentLang]);

    // --- LOGIC AUDIO CHUẨN (GOOGLE TRANSLATE) ---
    const playNextInQueue = useCallback(() => {
        if (audioQueueRef.current.length === 0) {
            isPlayingRef.current = false;
            return;
        }
        isPlayingRef.current = true;
        const text = audioQueueRef.current.shift();
        if (!text) return;

        const langCode = langRef.current === 'ru' ? 'ru' : 'en';
        const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${langCode}&client=tw-ob`;
        
        const audio = new Audio(url);
        audio.onended = () => playNextInQueue();
        audio.onerror = () => playNextInQueue();
        audio.play().catch(() => playNextInQueue());
    }, []);

    const speakStandard = useCallback((text: string) => {
        // Dừng mọi âm thanh cũ
        isPlayingRef.current = false;
        audioQueueRef.current = [];
        
        const cleanedText = text.replace(/[*_`#|]/g, '').trim();
        // Chia nhỏ văn bản thành các đoạn dưới 180 ký tự
        const chunks = cleanedText.match(/[^.!?\s][^.!?]*(?:[.!?](?!['"]?\s|$)[^.!?]*)*[.!?]?['"]?(?=\s|$)/g) || [cleanedText];
        
        let finalChunks: string[] = [];
        chunks.forEach(chunk => {
            if (chunk.length > 170) {
                const subChunks = chunk.match(/.{1,170}(\s|$)/g) || [chunk];
                finalChunks.push(...subChunks);
            } else {
                finalChunks.push(chunk);
            }
        });

        audioQueueRef.current = finalChunks;
        if (!isPlayingRef.current) playNextInQueue();
    }, [playNextInQueue]);

    const handleSendMessage = useCallback(async (messageText: string) => {
        const trimmedMessage = messageText.trim();
        if (!trimmedMessage || isLoadingAI) return;
        
        setMessages(prev => [...prev, { text: trimmedMessage, isBot: false }]);
        setInputValue('');
        setIsLoadingAI(true);

        try {
            const targetLang = langRef.current === 'ru' ? 'Russian' : 'English';
            const payload = {
                model: "gemini-2.5-flash",
                config: {
                    systemInstruction: `You are Trang, an AI assistant for 'Truly Easy Vietnamese'. 
                    RULE: Answer ONLY in ${targetLang}. 
                    STRICT LIMIT: Your response MUST be under 195 characters.
                    Context: ${knowledgeBaseRef.current || "Standard website info"}`
                },
                contents: [
                    ...messages.slice(-4).map(m => ({
                        role: m.isBot ? 'model' : 'user',
                        parts: [{ text: m.text }]
                    })),
                    { role: 'user', parts: [{ text: trimmedMessage }] }
                ]
            };

            const response = await generateContentWithRetry(payload);
            const aiText = response.text || "Contact support.";
            setMessages(prev => [...prev, { text: aiText, isBot: true }]);
            speakStandard(aiText);
        } catch (error) {
            console.error("AI Error:", error);
            setMessages(prev => [...prev, { text: "Connection error.", isBot: true }]);
        } finally {
            setIsLoadingAI(false);
        }
    }, [isLoadingAI, messages, speakStandard]);

    return (
        <>
            <style>{`
                @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-8px); } }
                .animate-float { animation: float 4s ease-in-out infinite; }
                .dot-flashing { width: 6px; height: 6px; border-radius: 5px; background-color: #1e5aa0; animation: dotFlashing 1s infinite alternate; }
                @keyframes dotFlashing { 0% { opacity: 0.3; } 100% { opacity: 1; } }
            `}</style>

            <button onClick={() => { setIsOpen(!isOpen); if(!isOpen) speakStandard(translations[currentLang].initialMessage); }} className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-2 animate-float">
                <span className="hidden md:block bg-white px-4 py-1.5 rounded-full shadow-lg text-[#1e5aa0] font-bold text-sm border">
                    {translations[currentLang].assistantLabel}
                </span>
                <div className="w-16 h-16 bg-white rounded-full shadow-2xl border-2 border-blue-400 overflow-hidden flex items-center justify-center">
                    <img src={TRANG_AVATAR} alt="Trang" className="w-full h-full object-cover" />
                </div>
            </button>

            <div className={`fixed bottom-24 right-6 w-[340px] h-[520px] bg-white rounded-3xl shadow-2xl border flex flex-col transition-all z-50 ${isOpen ? 'scale-100 opacity-100' : 'scale-90 opacity-0 pointer-events-none'}`}>
                <div className="p-4 bg-slate-50 rounded-t-3xl border-b flex flex-col items-center relative">
                    <img src={TRANG_AVATAR} className="w-14 h-14 rounded-full object-cover mb-1 border-2 border-white shadow-sm" alt="Trang" />
                    <h3 className="font-bold text-slate-800 text-sm">Trang Assistant</h3>
                    <p className="text-[9px] text-green-500 font-bold">● ONLINE</p>
                    <button onClick={() => setIsOpen(false)} className="absolute top-3 right-5 text-xl text-slate-400">×</button>
                </div>

                <div ref={chatBodyRef} className="flex-1 p-4 overflow-y-auto space-y-4 bg-white no-scrollbar">
                    {messages.length === 0 && (
                        <div className="flex justify-start">
                            <div className="max-w-[85%] px-4 py-2 bg-slate-100 text-slate-700 rounded-2xl rounded-bl-none text-sm italic">
                                {translations[currentLang].initialMessage}
                            </div>
                        </div>
                    )}
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex ${!msg.isBot ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] px-4 py-2 rounded-2xl text-sm ${!msg.isBot ? 'bg-[#1e5aa0] text-white rounded-br-none' : 'bg-slate-100 text-slate-700 rounded-bl-none'}`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {isLoadingAI && <div className="flex justify-start ml-4"><div className="dot-flashing"></div></div>}
                </div>

                <div className="p-4 border-t space-y-3">
                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                        {translations[currentLang].quickReplies.map(text => (
                            <button key={text} onClick={() => handleSendMessage(text)} className="whitespace-nowrap text-[10px] bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full font-bold hover:bg-blue-100">
                                {text}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-2">
                        <input value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputValue)} className="flex-1 p-2.5 bg-slate-50 border rounded-2xl outline-none text-sm" placeholder={translations[currentLang].placeholder} />
                        <button onClick={() => handleSendMessage(inputValue)} className="w-10 h-10 bg-[#1e5aa0] rounded-2xl flex items-center justify-center text-white">🚀</button>
                    </div>
                </div>
            </div>
        </>
    );
};

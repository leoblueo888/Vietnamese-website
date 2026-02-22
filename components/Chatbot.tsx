import React, { useState, useEffect, useRef, useCallback } from 'react';
import { generateContentWithRetry } from '../config/apiKeys';

export const Chatbot: React.FC = () => {
    const [currentLang, setCurrentLang] = useState<'en' | 'ru'>(() => (localStorage.getItem('app_lang') as 'en' | 'ru') || 'en');
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{ text: string; isBot: boolean }[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [isLoadingAI, setIsLoadingAI] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);

    const knowledgeBaseRef = useRef<string>("");
    const langRef = useRef(currentLang);
    const chatBodyRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Audio refs
    const audioRef = useRef(new Audio());
    const audioQueueRef = useRef<string[]>([]);
    const isPlayingRef = useRef(false);

    // Speech recognition refs
    const recognitionRef = useRef<any>(null);
    const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const finalTranscriptRef = useRef<string>('');

    const TRANG_AVATAR = "https://lh3.googleusercontent.com/d/1qZb1rHs-Ahs5hDQJTh4CTDiwULXRKB1B";

    const translations = {
        en: {
            initialMessage: "Hi there, welcome to Truly Easy Vietnamese. How can I help you?",
            quickReplies: ['How to start?', 'Meet the teachers', 'I need help'],
            placeholder: "Type or click mic",
            // ✅ Bilingual recording indicator
            listening: "Listening...",
            recordingHint: "Listening... — auto-send after 2.5s silence",
            // ✅ Đổi label ngoài chatbot
            assistantLabel: "Speak With AI Assistant",
            online: "ONLINE"
        },
        ru: {
            initialMessage: "Здравствуйте! Добро пожаловать в Truly Easy Vietnamese. Чем я могу вам помочь?",
            quickReplies: ['С чего начать?', 'Познакомиться с учителями', 'Мне нужна помощь'],
            placeholder: "Напишите или нажмите микрофон",
            // ✅ Russian recording indicator
            listening: "Слушаю...",
            recordingHint: "Слушаю... — авто-отправка через 2.5с тишины",
            // ✅ Russian label ngoài chatbot
            assistantLabel: "Говорить с AI Ассистентом",
            online: "В СЕТИ"
        }
    };

    // ✅ Sync langRef ngay khi currentLang thay đổi
    useEffect(() => {
        langRef.current = currentLang;
    }, [currentLang]);

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

    // ✅ Lắng nghe CustomEvent languageChanged từ Header
    useEffect(() => {
        const handleLangChange = (e: Event) => {
            const newLang = (e as CustomEvent).detail?.lang as 'en' | 'ru';
            if (!newLang || newLang === langRef.current) return;

            langRef.current = newLang;
            setCurrentLang(newLang);
            setMessages([{ text: translations[newLang].initialMessage, isBot: true }]);

            if (isOpen) {
                setTimeout(() => speakStandard(translations[newLang].initialMessage), 500);
            }
        };

        window.addEventListener('languageChanged', handleLangChange);
        return () => {
            window.removeEventListener('languageChanged', handleLangChange);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    // ✅ AUTO SCROLL to newest message + highlight effect
    useEffect(() => {
        if (messages.length === 0) return;

        // Scroll xuống cuối
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }, 50);

        // Highlight tin nhắn mới nhất trong 1.5s
        const newIndex = messages.length - 1;
        setHighlightedIndex(newIndex);
        const timer = setTimeout(() => setHighlightedIndex(null), 1500);
        return () => clearTimeout(timer);
    }, [messages]);

    // --- CLEAN TEXT ---
    const cleanText = useCallback((text: string) => {
        return text
            .replace(/[*_`#|]/g, '')
            .replace(/\s+/g, ' ')
            .replace(/[✨🎵🔊🔔❌✅⭐]/g, '')
            .trim();
    }, []);

    // --- CHUNK LOGIC ---
    const createChunks = useCallback((str: string, max = 170) => {
        const chunks = [];
        let tempStr = str;
        while (tempStr.length > 0) {
            if (tempStr.length <= max) { chunks.push(tempStr); break; }
            let cutAt = tempStr.lastIndexOf('.', max);
            if (cutAt === -1) cutAt = tempStr.lastIndexOf(',', max);
            if (cutAt === -1) cutAt = tempStr.lastIndexOf(' ', max);
            if (cutAt === -1) cutAt = max;
            chunks.push(tempStr.slice(0, cutAt + 1).trim());
            tempStr = tempStr.slice(cutAt + 1).trim();
        }
        return chunks;
    }, []);

    // --- AUDIO PLAYBACK ---
    const playNextInQueue = useCallback(() => {
        if (audioQueueRef.current.length === 0) {
            isPlayingRef.current = false;
            return;
        }
        isPlayingRef.current = true;
        const text = audioQueueRef.current.shift();
        if (!text) { playNextInQueue(); return; }

        const langCode = langRef.current === 'ru' ? 'ru' : 'en';
        const url = `/api/tts?text=${encodeURIComponent(text)}&lang=${langCode}`;

        audioRef.current.src = url;
        audioRef.current.playbackRate = 1.0;
        audioRef.current.onended = () => playNextInQueue();
        audioRef.current.onerror = () => {
            const fallback = new SpeechSynthesisUtterance(text);
            fallback.lang = langCode === 'ru' ? 'ru-RU' : 'en-US';
            fallback.rate = 1.0;
            fallback.onend = () => playNextInQueue();
            window.speechSynthesis.speak(fallback);
        };
        audioRef.current.play().catch(() => {
            const fallback = new SpeechSynthesisUtterance(text);
            fallback.lang = langCode === 'ru' ? 'ru-RU' : 'en-US';
            fallback.rate = 1.0;
            fallback.onend = () => playNextInQueue();
            window.speechSynthesis.speak(fallback);
        });
    }, []);

    const speakStandard = useCallback((text: string) => {
        if (!text) return;
        if (window.speechSynthesis) window.speechSynthesis.cancel();
        audioRef.current.pause();
        isPlayingRef.current = false;
        audioQueueRef.current = [];
        const cleanedText = cleanText(text);
        const chunks = createChunks(cleanedText);
        audioQueueRef.current = chunks;
        if (!isPlayingRef.current) playNextInQueue();
    }, [cleanText, createChunks, playNextInQueue]);

    // ✅ Dùng ref để tránh stale closure trong silence timer
    const handleSendMessageRef = useRef<(text: string) => void>(() => {});

    // ✅ STOP RECORDING
    const stopRecording = useCallback(() => {
        if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = null;
        }
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            recognitionRef.current = null;
        }
        setIsRecording(false);
    }, []);

    // ✅ START RECORDING
    const startRecording = useCallback(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert('Trình duyệt của bạn không hỗ trợ nhận dạng giọng nói. Hãy dùng Chrome.');
            return;
        }

        if (recognitionRef.current) {
            recognitionRef.current.stop();
            recognitionRef.current = null;
        }

        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;

        recognition.lang = langRef.current === 'ru' ? 'ru-RU' : 'en-US';
        recognition.continuous = true;
        recognition.interimResults = true;

        finalTranscriptRef.current = '';
        setIsRecording(true);
        setInputValue('');

        recognition.onresult = (event: any) => {
            let interimTranscript = '';
            let finalTranscript = finalTranscriptRef.current;

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript + ' ';
                } else {
                    interimTranscript += transcript;
                }
            }

            finalTranscriptRef.current = finalTranscript;
            setInputValue((finalTranscript + interimTranscript).trim());

            if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = setTimeout(() => {
                const textToSend = finalTranscriptRef.current.trim() || interimTranscript.trim();
                stopRecording();
                if (textToSend) {
                    handleSendMessageRef.current(textToSend);
                }
            }, 2500);
        };

        recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            stopRecording();
        };

        recognition.onend = () => {
            if (!silenceTimerRef.current) {
                setIsRecording(false);
            }
        };

        recognition.start();
    }, [stopRecording]);

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
            const aiText = response.text || (langRef.current === 'ru' ? "Свяжитесь с поддержкой." : "Contact support.");

            setMessages(prev => [...prev, { text: aiText, isBot: true }]);
            speakStandard(aiText);
        } catch (error) {
            console.error("AI Error:", error);
            const errorMsg = langRef.current === 'ru' ? "Ошибка соединения." : "Connection error.";
            setMessages(prev => [...prev, { text: errorMsg, isBot: true }]);
        } finally {
            setIsLoadingAI(false);
        }
    }, [isLoadingAI, messages, speakStandard]);

    // ✅ Cập nhật ref mỗi khi handleSendMessage thay đổi
    useEffect(() => {
        handleSendMessageRef.current = handleSendMessage;
    }, [handleSendMessage]);

    // ✅ Toggle mic
    const handleMicClick = useCallback(() => {
        if (isRecording) {
            const currentText = finalTranscriptRef.current.trim();
            stopRecording();
            if (currentText) {
                handleSendMessageRef.current(currentText);
            }
        } else {
            startRecording();
        }
    }, [isRecording, startRecording, stopRecording]);

    // Cleanup khi unmount
    useEffect(() => {
        return () => { stopRecording(); };
    }, [stopRecording]);

    return (
        <>
            <style>{`
                @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-8px); } }
                .animate-float { animation: float 4s ease-in-out infinite; }
                .dot-flashing { width: 6px; height: 6px; border-radius: 5px; background-color: #1e5aa0; animation: dotFlashing 1s infinite alternate; }
                @keyframes dotFlashing { 0% { opacity: 0.3; } 100% { opacity: 1; } }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                @keyframes micPulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.5); } 50% { box-shadow: 0 0 0 8px rgba(239,68,68,0); } }
                .mic-recording { animation: micPulse 1.2s ease-in-out infinite; }
                @keyframes msgHighlight {
                    0%   { transform: scale(1.03); box-shadow: 0 0 0 3px rgba(30,90,160,0.35); }
                    60%  { transform: scale(1.01); box-shadow: 0 0 0 6px rgba(30,90,160,0.15); }
                    100% { transform: scale(1);    box-shadow: 0 0 0 0px rgba(30,90,160,0); }
                }
                .msg-highlight { animation: msgHighlight 1.5s ease-out forwards; }
                @keyframes msgHighlightBot {
                    0%   { transform: scale(1.03); box-shadow: 0 0 0 3px rgba(100,200,100,0.4); }
                    60%  { transform: scale(1.01); box-shadow: 0 0 0 6px rgba(100,200,100,0.15); }
                    100% { transform: scale(1);    box-shadow: 0 0 0 0px rgba(100,200,100,0); }
                }
                .msg-highlight-bot { animation: msgHighlightBot 1.5s ease-out forwards; }
            `}</style>

            {/* ✅ Floating button với label mới */}
            <button
                onClick={() => {
                    setIsOpen(!isOpen);
                    if (!isOpen) setTimeout(() => speakStandard(translations[currentLang].initialMessage), 500);
                }}
                className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-2 animate-float"
            >
                <span className="hidden md:block bg-white px-4 py-1.5 rounded-full shadow-lg text-[#1e5aa0] font-bold text-sm border">
                    {translations[currentLang].assistantLabel}
                </span>
                <div className="w-16 h-16 bg-white rounded-full shadow-2xl border-2 border-blue-400 overflow-hidden flex items-center justify-center">
                    <img src={TRANG_AVATAR} alt="Trang" className="w-full h-full object-cover" />
                </div>
            </button>

            {/* Chat window */}
            <div className={`fixed bottom-24 right-6 w-[340px] h-[520px] bg-white rounded-3xl shadow-2xl border flex flex-col transition-all z-50 ${isOpen ? 'scale-100 opacity-100' : 'scale-90 opacity-0 pointer-events-none'}`}>

                {/* Header */}
                <div className="p-4 bg-slate-50 rounded-t-3xl border-b flex flex-col items-center relative">
                    <img src={TRANG_AVATAR} className="w-14 h-14 rounded-full object-cover mb-1 border-2 border-white shadow-sm" alt="Trang" />
                    <h3 className="font-bold text-slate-800 text-sm">Trang Assistant</h3>
                    <p className="text-[9px] text-green-500 font-bold">● {translations[currentLang].online}</p>
                    <button onClick={() => setIsOpen(false)} className="absolute top-3 right-5 text-xl text-slate-400">×</button>
                </div>

                {/* ✅ Messages với auto scroll + highlight */}
                <div ref={chatBodyRef} className="flex-1 p-4 overflow-y-auto space-y-4 bg-white no-scrollbar">
                    {messages.length === 0 ? (
                        <div className="flex justify-start">
                            <div className="max-w-[85%] px-4 py-2 bg-slate-100 text-slate-700 rounded-2xl rounded-bl-none text-sm italic">
                                {translations[currentLang].initialMessage}
                            </div>
                        </div>
                    ) : (
                        messages.map((msg, index) => (
                            <div key={index} className={`flex ${!msg.isBot ? 'justify-end' : 'justify-start'}`}>
                                <div className={`
                                    max-w-[85%] px-4 py-2 rounded-2xl text-sm transition-all
                                    ${!msg.isBot
                                        ? 'bg-[#1e5aa0] text-white rounded-br-none'
                                        : 'bg-slate-100 text-slate-700 rounded-bl-none'
                                    }
                                    ${highlightedIndex === index
                                        ? (!msg.isBot ? 'msg-highlight' : 'msg-highlight-bot')
                                        : ''
                                    }
                                `}>
                                    {msg.text}
                                </div>
                            </div>
                        ))
                    )}
                    {isLoadingAI && (
                        <div className="flex justify-start ml-4">
                            <div className="dot-flashing"></div>
                        </div>
                    )}
                    {/* ✅ Anchor để scroll xuống cuối */}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input area */}
                <div className="p-4 border-t space-y-3">
                    {/* Quick replies */}
                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                        {translations[currentLang].quickReplies.map(text => (
                            <button key={text} onClick={() => handleSendMessage(text)} className="whitespace-nowrap text-[10px] bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full font-bold hover:bg-blue-100">
                                {text}
                            </button>
                        ))}
                    </div>

                    {/* Input row */}
                    <div className="flex items-center gap-2">
                        <input
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && !isRecording && handleSendMessage(inputValue)}
                            className={`flex-1 p-2.5 bg-slate-50 border rounded-2xl outline-none text-sm transition-all ${isRecording ? 'border-red-400 bg-red-50 text-red-700' : 'border-slate-200'}`}
                            placeholder={isRecording ? translations[currentLang].listening : translations[currentLang].placeholder}
                            readOnly={isRecording}
                        />

                        {/* Mic button */}
                        <button
                            onClick={handleMicClick}
                            disabled={isLoadingAI}
                            title={isRecording ? 'Dừng ghi âm' : 'Bắt đầu ghi âm'}
                            className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all disabled:opacity-50 ${
                                isRecording
                                    ? 'bg-red-500 text-white mic-recording'
                                    : 'bg-[#1e5aa0] text-white hover:bg-blue-800'
                            }`}
                        >
                            {isRecording ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <rect x="6" y="6" width="12" height="12" rx="2" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 1a4 4 0 0 1 4 4v6a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4zm-2 4v6a2 2 0 0 0 4 0V5a2 2 0 0 0-4 0z"/>
                                    <path d="M19 10a1 1 0 0 1 1 1 8 8 0 0 1-16 0 1 1 0 1 1 2 0 6 6 0 0 0 12 0 1 1 0 0 1 1-1z"/>
                                    <path d="M12 19a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0v-2a1 1 0 0 1 1-1z"/>
                                </svg>
                            )}
                        </button>
                    </div>

                    {/* ✅ Recording indicator — theo ngôn ngữ user chọn */}
                    {isRecording && (
                        <p className="text-[10px] text-red-500 font-bold text-center animate-pulse">
                            🔴 {translations[currentLang].recordingHint}
                        </p>
                    )}
                </div>
            </div>
        </>
    );
};

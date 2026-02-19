import React, { useState, useEffect, useRef, useCallback } from 'react';
// Sử dụng hệ thống xoay vòng Key để tối ưu tầng Free
import { generateContentWithRetry } from '../config/apiKeys';

export const Chatbot: React.FC = () => {
    // Lấy ngôn ngữ từ localStorage hoặc mặc định là 'en'
    const [currentLang, setCurrentLang] = useState<'en' | 'ru'>(() => (localStorage.getItem('app_lang') as 'en' | 'ru') || 'en');
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{ text: string; isBot: boolean }[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [isLoadingAI, setIsLoadingAI] = useState(false);

    const recognitionRef = useRef<any | null>(null);
    const chatBodyRef = useRef<HTMLDivElement>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const prevMessagesLength = useRef(messages.length);

    const translations = {
        en: {
            initialMessage: "Hi there, welcome to Truly Easy Vietnamese. How can I help you?",
            quickReplies: ['How to start?', 'Meet the teachers', 'I need help'],
            placeholder: "Type or click mic to talk",
            listening: "Listening...",
            assistantLabel: "Speak with AI assistant"
        },
        ru: {
            initialMessage: "Здравствуйте, добро пожаловать в Truly Easy Vietnamese. Чем могу помочь?",
            quickReplies: ['С чего начать?', 'Преподаватели', 'Мне нужна помощь'],
            placeholder: "Напишите или нажмите микрофон",
            listening: "Слушаю...",
            assistantLabel: "Поговорить с ИИ-помощником"
        }
    };

    // 1. THE CHỐT: Theo dõi sự thay đổi ngôn ngữ từ nút bấm trên Website
    useEffect(() => {
        const handleLangChange = () => {
            const newLang = (localStorage.getItem('app_lang') as 'en' | 'ru') || 'en';
            if (newLang !== currentLang) {
                setCurrentLang(newLang);
            }
        };

        // Lắng nghe sự kiện từ localStorage và các Custom Event nếu có
        window.addEventListener('storage', handleLangChange);
        window.addEventListener('languageChanged', handleLangChange);
        
        // Kiểm tra định kỳ (Interval) đề phòng trường hợp các event không trigger
        const interval = setInterval(handleLangChange, 1000);

        return () => {
            window.removeEventListener('storage', handleLangChange);
            window.removeEventListener('languageChanged', handleLangChange);
            clearInterval(interval);
        };
    }, [currentLang]);

    // 2. THE CHỐT: Khi currentLang thay đổi, Reset toàn bộ tin nhắn về ngôn ngữ mới
    useEffect(() => {
        setMessages([{ text: translations[currentLang].initialMessage, isBot: true }]);
        // Nếu chatbot đang mở thì đọc luôn câu chào mới
        if (isOpen) {
            speak(translations[currentLang].initialMessage);
        }
    }, [currentLang]);

    useEffect(() => {
        audioRef.current = new Audio();
    }, []);

    const stopAudio = useCallback(() => {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = '';
        }
    }, []);

    const speak = useCallback((text: string) => {
        stopAudio();
        if (!text) return;

        const cleanedText = text.replace(/[*_`#|]/g, '').trim();
        const utterance = new SpeechSynthesisUtterance(cleanedText);
        utterance.lang = currentLang === 'ru' ? 'ru-RU' : 'en-US';
        utterance.rate = 1.0;
        
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => 
            v.lang.includes(currentLang === 'ru' ? 'ru' : 'en') && 
            (v.name.includes('Female') || v.name.includes('Google') || v.name.includes('Samantha'))
        );

        if (preferredVoice) utterance.voice = preferredVoice;
        window.speechSynthesis.speak(utterance);
    }, [stopAudio, currentLang]);

    useEffect(() => {
        if (messages.length > prevMessagesLength.current) {
            const lastMessage = messages[messages.length - 1];
            if (lastMessage.isBot && isOpen) {
                speak(lastMessage.text);
            }
        }
        prevMessagesLength.current = messages.length;
    }, [messages, speak, isOpen]);

    const toggleChat = () => {
        if (!isOpen) {
            setIsOpen(true);
            setTimeout(() => speak(translations[currentLang].initialMessage), 500);
        } else {
            stopAudio();
            setIsOpen(false);
        }
    };

    useEffect(() => {
        if (chatBodyRef.current) {
            chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
        }
    }, [messages, isLoadingAI]);

    const handleSendMessage = useCallback(async (messageText: string) => {
        const trimmedMessage = messageText.trim();
        if (!trimmedMessage || isLoadingAI) return;
        
        stopAudio();
        setMessages(prev => [...prev, { text: trimmedMessage, isBot: false }]);
        setInputValue('');
        setIsLoadingAI(true);

        try {
            const docUrl = 'https://docs.google.com/document/d/1i5F5VndGaGbB4d21jRjnJx2YbptF0KdBYHijnjYqe2U/export?format=txt';
            const docResponse = await fetch(docUrl);
            const docText = await docResponse.text();

            const targetLang = currentLang === 'ru' ? 'Russian' : 'English';

            const payload = {
                model: "gemini-3-flash-preview",
                config: {
                    systemInstruction: `You are Trang, the official AI assistant for 'Truly Easy Vietnamese'.
                    CONTEXT: This platform teaches Vietnamese to English and Russian speakers.
                    KNOWLEDGE BASE: ${docText}
                    STRICT RULES:
                    1. Use ONLY the provided knowledge to answer.
                    2. LANGUAGE: You MUST answer strictly in ${targetLang}. 
                    3. If the user asks in another language, you must still reply in ${targetLang}.
                    4. Keep it friendly, helpful, and concise (max 3 sentences).`
                },
                contents: [
                    // Chỉ gửi tối đa 4 tin nhắn gần nhất để giữ ngữ cảnh đúng ngôn ngữ hiện tại
                    ...messages.slice(-4).map(m => ({
                        role: m.isBot ? 'model' : 'user',
                        parts: [{ text: m.text }]
                    })),
                    { role: 'user', parts: [{ text: trimmedMessage }] }
                ]
            };

            const response = await generateContentWithRetry(payload);
            const aiText = response.text || (currentLang === 'ru' ? "Извините, я не могу ответить." : "Sorry, I can't answer that.");

            setMessages(prev => [...prev, { text: aiText, isBot: true }]);
        } catch (error) {
            console.error("Chatbot AI Error:", error);
            const errorMsg = currentLang === 'ru' ? "Ошибка связи. Попробуйте снова." : "Connection error. Please try again.";
            setMessages(prev => [...prev, { text: errorMsg, isBot: true }]);
        } finally {
            setIsLoadingAI(false);
        }
    }, [isLoadingAI, stopAudio, currentLang, messages]);

    useEffect(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = currentLang === 'ru' ? 'ru-RU' : 'en-US';
            
            recognition.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                if (transcript) handleSendMessage(transcript);
            };

            recognition.onend = () => setIsRecording(false);
            recognitionRef.current = recognition;
        }
    }, [currentLang, handleSendMessage]);

    const toggleRecording = () => {
        if (!recognitionRef.current) return;
        if (isRecording) {
            recognitionRef.current.stop();
        } else {
            stopAudio();
            setIsRecording(true);
            recognitionRef.current.start();
        }
    };

    return (
        <>
            <style>{`
                @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-6px); } 100% { transform: translateY(0px); } }
                .animate-float { animation: float 4s ease-in-out infinite; }
                .dot-flashing { position: relative; width: 6px; height: 6px; border-radius: 5px; background-color: #1e5aa0; animation: dotFlashing 1s infinite alternate; }
                @keyframes dotFlashing { 0% { opacity: 0.3; } 100% { opacity: 1; } }
                .no-scrollbar::-webkit-scrollbar { display: none; }
            `}</style>

            <button 
                onClick={toggleChat} 
                className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-3 group animate-float"
            >
                <span className="hidden md:inline-block bg-white/90 backdrop-blur-md font-bold text-[#1e5aa0] px-5 py-2 rounded-full shadow-lg border border-blue-100">
                    {translations[currentLang].assistantLabel}
                </span>
                <div className="w-16 h-16 bg-white rounded-full shadow-xl flex items-center justify-center border-2 border-blue-400 overflow-hidden">
                    <img src="https://img.icons8.com/fluency/96/bot.png" alt="Trang" className="w-10 h-10" />
                </div>
            </button>

            <div 
                className={`fixed bottom-24 right-6 w-[350px] h-[550px] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col transition-all duration-300 z-50 ${
                    isOpen ? 'scale-100 opacity-100' : 'scale-90 opacity-0 pointer-events-none'
                }`}
            >
                <div className="p-4 bg-slate-50 rounded-t-2xl border-b flex flex-col items-center relative">
                    <img src="https://img.icons8.com/fluency/96/bot.png" className="w-16 h-16 mb-2" alt="Trang" />
                    <h3 className="font-bold text-slate-800">Trang Assistant</h3>
                    <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest">● Online</p>
                    <button onClick={toggleChat} className="absolute top-2 right-4 text-2xl text-slate-300 hover:text-slate-500">×</button>
                </div>

                <div ref={chatBodyRef} className="flex-1 p-4 overflow-y-auto space-y-4 bg-white scroll-smooth">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex ${!msg.isBot ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] px-4 py-2 rounded-2xl text-sm font-medium ${
                                !msg.isBot ? 'bg-[#1e5aa0] text-white rounded-br-none' : 'bg-slate-100 text-slate-700 rounded-bl-none'
                            }`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {isLoadingAI && (
                        <div className="flex justify-start ml-4">
                            <div className="dot-flashing"></div>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t bg-white rounded-b-2xl">
                    <div className="flex gap-2 mb-3 overflow-x-auto pb-2 no-scrollbar">
                        {translations[currentLang].quickReplies.map(text => (
                            <button 
                                key={text} 
                                onClick={() => handleSendMessage(text)} 
                                className="whitespace-nowrap text-[10px] bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full font-bold hover:bg-blue-100 transition-colors"
                            >
                                {text}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-2">
                        <input 
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputValue)}
                            className="flex-1 p-2 bg-slate-50 border rounded-xl outline-none text-sm focus:border-blue-400"
                            placeholder={isRecording ? translations[currentLang].listening : translations[currentLang].placeholder}
                        />
                        <button 
                            onClick={toggleRecording} 
                            className={`w-10 h-10 rounded-xl flex items-center justify-center text-white transition-all ${
                                isRecording ? 'bg-red-500 animate-pulse' : 'bg-[#1e5aa0]'
                            }`}
                        >
                            🎤
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

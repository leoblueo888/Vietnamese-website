import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const Chatbot: React.FC = () => {
    const [currentLang, setCurrentLang] = useState<'en' | 'ru'>(() => (localStorage.getItem('app_lang') as 'en' | 'ru') || 'en');

    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{ text: string; isBot: boolean }[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [isLoadingAI, setIsLoadingAI] = useState(false);
    const [interimTranscript, setInterimTranscript] = useState('');

    const recognitionRef = useRef<any | null>(null);
    const chatBodyRef = useRef<HTMLDivElement>(null);
    const finalTranscriptRef = useRef('');
    const prevMessagesLength = useRef(0);

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

    // --- 2026 AUDIO LOGIC: WEB SPEECH API (TTS) ---
    // Chỉ nói khi có sự kiện click hoặc tin nhắn mới, không auto-play khi load trang
    const speak = useCallback((text: string) => {
        if (!window.speechSynthesis) return;
        
        // Hủy mọi âm thanh cũ đang phát để tránh chồng chéo
        window.speechSynthesis.cancel();

        const cleanedText = text.replace(/[*_`#]/g, '').trim();
        if (!cleanedText) return;

        const utterance = new SpeechSynthesisUtterance(cleanedText);
        
        // Tự động nhận diện giọng đọc theo ngôn ngữ hiện tại
        utterance.lang = currentLang === 'ru' ? 'ru-RU' : 'en-US';
        utterance.rate = 1.0; 
        utterance.pitch = 1.0;

        window.speechSynthesis.speak(utterance);
    }, [currentLang]);

    const stopAudio = useCallback(() => {
        if (window.speechSynthesis) window.speechSynthesis.cancel();
    }, []);

    // Sync ngôn ngữ khi thay đổi ở Header
    useEffect(() => {
        const handleLangChange = () => {
            const newLang = (localStorage.getItem('app_lang') as 'en' | 'ru') || 'en';
            setCurrentLang(newLang);
        };
        window.addEventListener('languageChanged', handleLangChange);
        return () => window.removeEventListener('languageChanged', handleLangChange);
    }, []);

    // Khởi tạo tin nhắn chào hỏi ban đầu (Không tự động đọc ở đây)
    useEffect(() => {
        setMessages([{ text: translations[currentLang].initialMessage, isBot: true }]);
        prevMessagesLength.current = 1;
    }, [currentLang]);

    // Đọc tin nhắn mới của Bot (Chỉ đọc khi khung chat đang mở)
    useEffect(() => {
        if (isOpen && messages.length > prevMessagesLength.current) {
            const lastMessage = messages[messages.length - 1];
            if (lastMessage.isBot) {
                speak(lastMessage.text);
            }
        }
        prevMessagesLength.current = messages.length;
    }, [messages, speak, isOpen]);

    const toggleChat = () => {
        if (!isOpen) {
            // Khi mở chat, delay một chút rồi mới chào để tạo cảm giác tự nhiên
            setTimeout(() => speak(translations[currentLang].initialMessage), 400);
        } else {
            stopAudio();
        }
        setIsOpen(!isOpen);
    };

    useEffect(() => {
        if (chatBodyRef.current) {
            chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
        }
    }, [messages, isLoadingAI, interimTranscript]);

    // --- AI LOGIC: GEMINI 2.0 FLASH ---
    const handleSendMessage = useCallback(async (messageText: string) => {
        const trimmedMessage = messageText.trim();
        if (!trimmedMessage || isLoadingAI) return;
    
        stopAudio();
        setMessages(prev => [...prev, { text: trimmedMessage, isBot: false }]);
        setInputValue('');
        setIsLoadingAI(true);
    
        try {
            // Lấy kiến thức từ Doc (Knowledge Base)
            const docUrl = 'https://docs.google.com/document/d/1i5F5VndGaGbB4d21jRjnJx2YbptF0KdBYHijnjYqe2U/export?format=txt';
            const docResponse = await fetch(docUrl);
            const docText = docResponse.ok ? await docResponse.text() : "";

            const systemInstruction = currentLang === 'ru' 
                ? `Вы — Trang, ИИ-ассистент 'Truly Easy Vietnamese'. Используйте ТОЛЬКО этот текст: ${docText}. Будьте дружелюбны, отвечайте кратко.`
                : `You are Trang, AI assistant for 'Truly Easy Vietnamese'. Use ONLY this text: ${docText}. Be friendly and concise.`;

            // Khởi tạo AI với model 2026 (Gemini 2.0 Flash)
            const genAI = new GoogleGenerativeAI("YOUR_ACTUAL_API_KEY_HERE"); 
            const model = genAI.getGenerativeModel({ 
                model: "gemini-2.0-flash",
                systemInstruction: systemInstruction
            });

            const result = await model.generateContent(trimmedMessage);
            const aiResponse = result.response.text();

            if (aiResponse) {
                setMessages(prev => [...prev, { text: aiResponse, isBot: true }]);
            }
        } catch (error) {
            console.error("AI Error:", error);
            const errorMsg = currentLang === 'ru' ? "Ой, что-то пошло не так!" : "Oops! Something went wrong.";
            setMessages(prev => [...prev, { text: errorMsg, isBot: true }]);
        } finally {
            setIsLoadingAI(false);
        }
    }, [isLoadingAI, stopAudio, currentLang]);

    // --- SPEECH TO TEXT (STT) ---
    useEffect(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = currentLang === 'ru' ? 'ru-RU' : 'en-US';

            recognition.onresult = (event: any) => {
                let interim = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscriptRef.current += event.results[i][0].transcript;
                    } else {
                        interim += event.results[i][0].transcript;
                    }
                }
                setInterimTranscript(interim);
            };

            recognition.onend = () => {
                setIsRecording(false);
                if (finalTranscriptRef.current) {
                    handleSendMessage(finalTranscriptRef.current);
                    finalTranscriptRef.current = '';
                }
                setInterimTranscript('');
            };
            recognitionRef.current = recognition;
        }
    }, [currentLang, handleSendMessage]);

    const toggleRecording = () => {
        if (!recognitionRef.current) return;
        if (isRecording) {
            recognitionRef.current.stop();
        } else {
            stopAudio();
            finalTranscriptRef.current = '';
            setIsRecording(true);
            recognitionRef.current.start();
        }
    };

    return (
        <>
            <style>{`
                @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-8px); } 100% { transform: translateY(0px); } }
                .animate-float { animation: float 4s ease-in-out infinite; }
                .loading-dots { display: flex; gap: 4px; }
                .dot { width: 6px; height: 6px; background: #1e5aa0; border-radius: 50%; animation: blink 1.4s infinite both; }
                .dot:nth-child(2) { animation-delay: 0.2s; }
                .dot:nth-child(3) { animation-delay: 0.4s; }
                @keyframes blink { 0% { opacity: 0.2; } 20% { opacity: 1; } 100% { opacity: 0.2; } }
            `}</style>

            {/* Nút Chat tròn */}
            <button onClick={toggleChat} className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-3 group animate-float">
                <span className="hidden md:block bg-white px-4 py-2 rounded-full shadow-xl text-[#1e5aa0] font-bold text-sm border border-blue-50">
                    {translations[currentLang].assistantLabel}
                </span>
                <div className="w-16 h-16 bg-white rounded-full shadow-2xl flex items-center justify-center border-2 border-blue-100 overflow-hidden group-hover:scale-110 transition-transform">
                    <img src="https://i.imgur.com/your_avatar_trang.png" alt="Trang" className="w-full h-full object-cover" />
                </div>
            </button>

            {/* Cửa sổ Chat */}
            <div className={`fixed bottom-24 right-6 w-[360px] h-[580px] bg-white rounded-[2rem] shadow-2xl border border-slate-100 flex flex-col transition-all duration-500 z-50 ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
                
                {/* Header */}
                <div className="p-6 bg-slate-50 rounded-t-[2rem] border-b text-center relative">
                    <div className="relative inline-block">
                        <img src="https://i.imgur.com/your_avatar_trang.png" alt="Trang" className="w-16 h-16 rounded-full border-4 border-white shadow-md" />
                        <span className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></span>
                    </div>
                    <h3 className="font-black text-slate-800 text-lg mt-2">Trang</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">AI Expert Assistant</p>
                    <button onClick={toggleChat} className="absolute top-6 right-6 text-slate-300 hover:text-red-500 transition-colors text-2xl">×</button>
                </div>

                {/* Body */}
                <div ref={chatBodyRef} className="flex-1 p-5 overflow-y-auto space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
                            <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-[14px] leading-relaxed ${msg.isBot ? 'bg-slate-100 text-slate-700 rounded-tl-none' : 'bg-[#1e5aa0] text-white rounded-tr-none shadow-md'}`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {interimTranscript && (
                        <div className="flex justify-end">
                            <div className="max-w-[85%] px-4 py-2.5 rounded-2xl bg-blue-50 text-blue-400 text-sm italic rounded-tr-none">
                                {interimTranscript}
                            </div>
                        </div>
                    )}
                    {isLoadingAI && (
                        <div className="flex justify-start pl-2">
                            <div className="loading-dots px-4 py-3 bg-slate-50 rounded-2xl">
                                <div className="dot"></div><div className="dot"></div><div className="dot"></div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-5 border-t bg-white rounded-b-[2rem]">
                    <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
                        {translations[currentLang].quickReplies.map(reply => (
                            <button key={reply} onClick={() => handleSendMessage(reply)} className="whitespace-nowrap bg-blue-50 text-[#1e5aa0] text-[11px] font-bold px-4 py-2 rounded-full hover:bg-blue-100 transition-colors">
                                {reply}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-100 focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-50 transition-all">
                        <input 
                            type="text" 
                            className="flex-1 bg-transparent border-none px-3 py-1 text-sm outline-none"
                            placeholder={isRecording ? translations[currentLang].listening : translations[currentLang].placeholder}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputValue)}
                        />
                        <button 
                            onClick={toggleRecording}
                            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-white text-slate-400 hover:text-[#1e5aa0] shadow-sm'}`}
                        >
                            {isRecording ? '●' : '🎤'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

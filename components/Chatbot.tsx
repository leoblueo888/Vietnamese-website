import React, { useState, useEffect, useRef, useCallback } from 'react';

export const Chatbot: React.FC = () => {
    const [currentLang, setCurrentLang] = useState<'en' | 'ru'>(() => (localStorage.getItem('app_lang') as 'en' | 'ru') || 'en');
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{ text: string; isBot: boolean }[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [isLoadingAI, setIsLoadingAI] = useState(false);
    const [interimTranscript, setInterimTranscript] = useState('');
    
    const chatBodyRef = useRef<HTMLDivElement>(null);
    const recognitionRef = useRef<any | null>(null);
    const finalTranscriptRef = useRef('');

    const API_KEY = "AIzaSyDBYaDEMaGo2pO3TFEGigVLOSXLfy8Vktg";
    const MODEL = "gemini-2.0-flash"; // Model xịn nhất 2026

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

    // --- CƠ CHẾ ÂM THANH (WEB SPEECH API) ---
    const speak = useCallback((text: string) => {
        if (!window.speechSynthesis) return;
        
        // Hủy mọi phiên âm thanh đang chạy trước đó
        window.speechSynthesis.cancel();

        const cleanedText = text.replace(/[*_`#]/g, '').trim();
        if (!cleanedText) return;

        const utterance = new SpeechSynthesisUtterance(cleanedText);
        utterance.lang = currentLang === 'ru' ? 'ru-RU' : 'en-US';
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        // Xử lý lỗi im lặng trên một số trình duyệt bằng cách gọi trong event user
        window.speechSynthesis.speak(utterance);
    }, [currentLang]);

    const stopAudio = () => {
        if (window.speechSynthesis) window.speechSynthesis.cancel();
    };

    // --- XỬ LÝ GỌI API GEMINI ---
    const handleSendMessage = useCallback(async (messageText: string) => {
        const trimmedMessage = messageText.trim();
        if (!trimmedMessage || isLoadingAI) return;

        stopAudio();
        setMessages(prev => [...prev, { text: trimmedMessage, isBot: false }]);
        setInputValue('');
        setIsLoadingAI(true);

        try {
            // 1. Lấy dữ liệu kiến thức từ Google Doc
            const docUrl = 'https://docs.google.com/document/d/1i5F5VndGaGbB4d21jRjnJx2YbptF0KdBYHijnjYqe2U/export?format=txt';
            const docResponse = await fetch(docUrl);
            const docText = docResponse.ok ? await docResponse.text() : "Truly Easy Vietnamese is a language learning platform.";

            // 2. Gọi API Gemini trực tiếp qua Fetch (ổn định hơn SDK trong môi trường Web)
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `You are Trang, an AI assistant for 'Truly Easy Vietnamese'. 
                                   Source info: ${docText}
                                   Rules: Be friendly, answer in ${currentLang === 'ru' ? 'Russian' : 'English'}, keep it under 3 sentences.
                                   User: ${trimmedMessage}`
                        }]
                    }]
                })
            });

            const data = await response.json();
            const aiText = data.candidates[0].content.parts[0].text;

            if (aiText) {
                setMessages(prev => [...prev, { text: aiText, isBot: true }]);
                speak(aiText); // AI trả lời xong thì nói luôn
            }
        } catch (error) {
            console.error("Chatbot error:", error);
            const errorMsg = currentLang === 'ru' ? "Ой, ошибка подключения!" : "Oops, connection error!";
            setMessages(prev => [...prev, { text: errorMsg, isBot: true }]);
        } finally {
            setIsLoadingAI(false);
        }
    }, [isLoadingAI, currentLang, speak]);

    // Mở/Đóng chat
    const toggleChat = () => {
        if (!isOpen) {
            // Mẹo: Kích hoạt âm thanh trống để xin quyền trình duyệt
            const silentUtterance = new SpeechSynthesisUtterance("");
            window.speechSynthesis.speak(silentUtterance);
            
            // Chào sau 300ms
            setTimeout(() => speak(translations[currentLang].initialMessage), 300);
        } else {
            stopAudio();
        }
        setIsOpen(!isOpen);
    };

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

    // Tự động cuộn xuống
    useEffect(() => {
        if (chatBodyRef.current) chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }, [messages, interimTranscript, isLoadingAI]);

    // Reset tin nhắn khi đổi ngôn ngữ
    useEffect(() => {
        setMessages([{ text: translations[currentLang].initialMessage, isBot: true }]);
    }, [currentLang]);

    return (
        <>
            <style>{`
                @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-8px); } 100% { transform: translateY(0px); } }
                .animate-float { animation: float 4s ease-in-out infinite; }
                .dot-loading { animation: dot-blink 1.4s infinite both; }
                @keyframes dot-blink { 0% { opacity: .2; } 20% { opacity: 1; } 100% { opacity: .2; } }
            `}</style>

            {/* Nút Chat */}
            <button onClick={toggleChat} className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-3 group animate-float">
                <span className="hidden md:block bg-white/90 backdrop-blur-md font-bold text-[#1e5aa0] text-xs px-4 py-2 rounded-full shadow-lg border border-blue-50 transition-all group-hover:bg-blue-50">
                    {translations[currentLang].assistantLabel}
                </span>
                <div className="w-16 h-16 bg-white rounded-full shadow-2xl flex items-center justify-center border-2 border-blue-100 overflow-hidden group-hover:scale-110 transition-transform">
                    <img src="https://lh3.googleusercontent.com/a/default-user" alt="Trang" className="w-full h-full object-cover" />
                </div>
            </button>

            {/* Cửa sổ Chat */}
            <div className={`fixed bottom-28 right-6 w-[360px] h-[580px] bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 flex flex-col transition-all duration-500 ease-in-out z-50 ${isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-10 pointer-events-none'}`}>
                
                {/* Header */}
                <div className="p-6 bg-gradient-to-b from-slate-50 to-white rounded-t-[2.5rem] border-b flex flex-col items-center relative">
                    <div className="relative">
                        <img src="https://lh3.googleusercontent.com/a/default-user" alt="Trang" className="w-14 h-14 rounded-full border-4 border-white shadow-md" />
                        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></span>
                    </div>
                    <h3 className="font-black text-slate-800 mt-2">Trang AI</h3>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Truly Easy Assistant</p>
                    <button onClick={toggleChat} className="absolute top-6 right-6 text-slate-300 hover:text-red-500 transition-colors text-2xl">×</button>
                </div>

                {/* Nội dung chat */}
                <div ref={chatBodyRef} className="flex-1 p-5 overflow-y-auto space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
                            <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-[14px] leading-relaxed ${msg.isBot ? 'bg-slate-100 text-slate-700 rounded-tl-none' : 'bg-[#1e5aa0] text-white rounded-tr-none shadow-md'}`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {interimTranscript && (
                        <div className="flex justify-end italic text-blue-300 text-xs">{interimTranscript}</div>
                    )}
                    {isLoadingAI && (
                        <div className="flex justify-start">
                            <div className="bg-slate-100 px-4 py-3 rounded-2xl flex gap-1">
                                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full dot-loading"></div>
                                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full dot-loading" style={{animationDelay: '0.2s'}}></div>
                                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full dot-loading" style={{animationDelay: '0.4s'}}></div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-5 bg-white border-t rounded-b-[2.5rem]">
                    <div className="flex gap-2 mb-4 overflow-x-auto pb-1 no-scrollbar">
                        {translations[currentLang].quickReplies.map(reply => (
                            <button key={reply} onClick={() => handleSendMessage(reply)} className="whitespace-nowrap bg-blue-50 text-[#1e5aa0] text-[10px] font-bold px-4 py-2 rounded-full hover:bg-blue-100 transition-colors">
                                {reply}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-2xl border focus-within:ring-2 focus-within:ring-blue-100 transition-all">
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
                            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isRecording ? 'bg-red-500 text-white shadow-red-200' : 'bg-white text-slate-400 hover:text-blue-600 shadow-sm'}`}
                        >
                            {isRecording ? '●' : '🎤'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

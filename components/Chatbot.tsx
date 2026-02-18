import React, { useState, useEffect, useRef, useCallback } from 'react';

// SỬA CÁCH IMPORT - dùng đúng cách cho browser
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
    const prevMessagesLength = useRef(messages.length);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    
    // 👉 API KEY - đặt trực tiếp, không qua env
    const API_KEY = 'AIzaSyDBYaDEMaGo2pO3TFEGigVLOSXLfy8Vktg';

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
    
    useEffect(() => {
        const handleLangChange = () => {
            setCurrentLang((localStorage.getItem('app_lang') as 'en' | 'ru') || 'en');
        };

        window.addEventListener('storage', handleLangChange);
        window.addEventListener('languageChanged', handleLangChange);
        
        return () => {
            window.removeEventListener('storage', handleLangChange);
            window.removeEventListener('languageChanged', handleLangChange);
        };
    }, []);

    // Khởi tạo messages khi đổi ngôn ngữ
    useEffect(() => {
        setMessages([{ text: translations[currentLang].initialMessage, isBot: true }]);
    }, [currentLang]);

    // 👉 HÀM SPEAK DÙNG GOOGLE TTS - SỬA LỖI AUDIO
    const speak = useCallback((text: string) => {
        if (!text) return;
        
        // Dừng audio hiện tại
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = '';
        }
        
        const cleanedText = text.replace(/[*_`#]/g, '').trim();
        if (!cleanedText) return;
        
        // Chia nhỏ text nếu quá dài
        const chunks: string[] = [];
        const maxLength = 100; // Giảm xuống 100 ký tự cho an toàn
        let tempText = cleanedText;
        
        while (tempText.length > 0) {
            if (tempText.length <= maxLength) {
                chunks.push(tempText);
                break;
            }
            let splitPos = tempText.substring(0, maxLength).lastIndexOf('.');
            if (splitPos === -1) splitPos = tempText.substring(0, maxLength).lastIndexOf(' ');
            if (splitPos === -1) splitPos = maxLength;
            
            chunks.push(tempText.substring(0, splitPos + 1));
            tempText = tempText.substring(splitPos + 1).trim();
        }
        
        let currentChunkIndex = 0;
        
        const playNextChunk = () => {
            if (currentChunkIndex >= chunks.length) return;
            
            const chunk = chunks[currentChunkIndex];
            if (!chunk) {
                currentChunkIndex++;
                playNextChunk();
                return;
            }
            
            // Tạo audio mới mỗi lần
            const audio = new Audio();
            const ttsLang = currentLang === 'ru' ? 'ru' : 'en';
            
            // Mã hóa chunk
            const encodedChunk = encodeURIComponent(chunk);
            audio.src = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodedChunk}&tl=${ttsLang}&client=tw-ob`;
            
            // Load trước khi play
            audio.load();
            
            audio.onended = () => {
                audio.remove();
                currentChunkIndex++;
                playNextChunk();
            };
            
            audio.onerror = (e) => {
                console.error("Audio error for chunk:", chunk, e);
                audio.remove();
                currentChunkIndex++;
                playNextChunk();
            };
            
            // Play với catch
            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.catch(e => {
                    console.error("Play failed for chunk:", chunk, e);
                    audio.remove();
                    currentChunkIndex++;
                    playNextChunk();
                });
            }
            
            audioRef.current = audio;
        };
        
        // Delay nhỏ trước khi play chunk đầu tiên
        setTimeout(playNextChunk, 100);
    }, [currentLang]);

    // 👉 KHI MỞ CHAT - TỰ ĐỘNG NÓI
    const toggleChat = () => {
        if (!isOpen) {
            setIsOpen(true);
            // Đợi chat mở rồi nói
            setTimeout(() => {
                const welcomeMsg = translations[currentLang].initialMessage;
                speak(welcomeMsg);
            }, 500);
        } else {
            setIsOpen(false);
            // Dừng nói khi đóng chat
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.src = '';
            }
        }
    };

    // Scroll to bottom
    useEffect(() => {
        if (chatBodyRef.current) {
            chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
        }
    }, [messages, isLoadingAI, interimTranscript]);

    // 👉 KHI CÓ MESSAGE MỚI TỪ BOT - TỰ ĐỘNG NÓI
    useEffect(() => {
        if (messages.length > prevMessagesLength.current) {
            const lastMessage = messages[messages.length - 1];
            if (lastMessage.isBot) {
                speak(lastMessage.text);
            }
        }
        prevMessagesLength.current = messages.length;
    }, [messages, speak]);

    // 👉 HÀM GỌI AI - SỬA CÁCH KHỞI TẠO
    const handleSendMessage = useCallback(async (messageText: string) => {
        const trimmedMessage = messageText.trim();
        if (!trimmedMessage || isLoadingAI) return;
    
        setMessages(prev => [...prev, { text: trimmedMessage, isBot: false }]);
        setInputValue('');
        setIsLoadingAI(true);
    
        try {
            // Khởi tạo Gemini với API Key trực tiếp
            const genAI = new GoogleGenerativeAI(API_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            
            // Tạo prompt đơn giản trước để test
            const prompt = `You are Trang, a friendly AI assistant. Answer this question briefly: ${trimmedMessage}`;
            
            const result = await model.generateContent(prompt);
            const aiText = result.response.text();
            
            if (aiText) {
                setMessages(prev => [...prev, { text: aiText, isBot: true }]);
            } else {
                throw new Error("No response text from AI.");
            }
        } catch (error) {
            console.error("Chatbot error:", error);
            const errorMsg = currentLang === 'ru' 
                ? "Извините, у меня небольшие проблемы. Пожалуйста, попробуйте еще раз!"
                : "Sorry, I'm having a little trouble. Please try again!";
            setMessages(prev => [...prev, { text: errorMsg, isBot: true }]);
        } finally {
            setIsLoadingAI(false);
        }
    }, [isLoadingAI, currentLang]);

    const handleSendMessageRef = useRef(handleSendMessage);
    useEffect(() => {
        handleSendMessageRef.current = handleSendMessage;
    });

    // 👉 SPEECH RECOGNITION
    useEffect(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = currentLang === 'ru' ? 'ru-RU' : 'en-US';
            recognition.maxAlternatives = 1;

            recognition.onresult = (event: any) => {
                let interim = '';
                let final = '';
                
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        final += transcript;
                    } else {
                        interim += transcript;
                    }
                }
                
                if (final) {
                    finalTranscriptRef.current += final;
                }
                setInterimTranscript(interim);
            };

            recognition.onerror = (event: any) => {
                console.error("Speech recognition error", event.error);
                setIsRecording(false);
            };

            recognition.onend = () => {
                setIsRecording(false);
                setInterimTranscript('');
                const finalResult = finalTranscriptRef.current.trim();
                if (finalResult) {
                    handleSendMessageRef.current(finalResult);
                }
                finalTranscriptRef.current = '';
            };
            
            recognitionRef.current = recognition;
        }
    }, [currentLang]);

    const toggleRecording = () => {
        if (!recognitionRef.current) return;
        
        if (isRecording) {
            recognitionRef.current.stop();
        } else {
            // Dừng audio đang phát
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.src = '';
            }
            
            finalTranscriptRef.current = '';
            setInterimTranscript('');
            setInputValue('');
            setIsRecording(true);
            
            try {
                recognitionRef.current.start();
            } catch (e) {
                console.error("Failed to start recording:", e);
                setIsRecording(false);
            }
        }
    };

    return (
        <>
            <style>{`
                @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-6px); } 100% { transform: translateY(0px); } }
                .animate-float { animation: float 4s ease-in-out infinite; }
                .dot-flashing { position: relative; width: 6px; height: 6px; border-radius: 5px; background-color: #9880ff; color: #9880ff; animation: dotFlashing 1s infinite linear alternate; animation-delay: .5s; }
                .dot-flashing::before, .dot-flashing::after { content: ''; display: inline-block; position: absolute; top: 0; }
                .dot-flashing::before { left: -10px; width: 6px; height: 6px; border-radius: 5px; background-color: #9880ff; color: #9880ff; animation: dotFlashing 1s infinite alternate; animation-delay: 0s; }
                .dot-flashing::after { left: 10px; width: 6px; height: 6px; border-radius: 5px; background-color: #9880ff; color: #9880ff; animation: dotFlashing 1s infinite alternate; animation-delay: 1s; }
                @keyframes dotFlashing { 0% { background-color: #A0A0A0; } 50%, 100% { background-color: #D0D0D0; } }
            `}</style>

            <button onClick={toggleChat} className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-3 group animate-float" aria-label="Speak with AI assistant">
                <span className="hidden md:inline-block bg-white/80 backdrop-blur-md font-bold text-[#1e5aa0] text-base px-5 py-2.5 rounded-full shadow-lg">{translations[currentLang].assistantLabel}</span>
                <div className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center transition-transform transform group-hover:scale-110">
                    <img src="https://lh3.googleusercontent.com/d/1qZb1rHs-Ahs5hDQJTh4CTDiwULXRKB1B" alt="AI Assistant Trang" className="w-full h-full object-cover rounded-full" />
                </div>
            </button>

            <div className={`fixed bottom-24 right-6 w-[350px] h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col transition-all duration-300 ease-in-out z-50 ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                <div className="relative flex flex-col items-center p-4 bg-[#f8fafc] rounded-t-2xl border-b border-gray-100">
                    <div className="relative">
                        <img src="https://lh3.googleusercontent.com/d/1qZb1rHs-Ahs5hDQJTh4CTDiwULXRKB1B" alt="Trang" className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md" />
                        <span className="absolute bottom-1 right-1 block h-4 w-4 rounded-full bg-green-400 ring-2 ring-white"></span>
                    </div>
                    <div className="mt-2 text-center">
                        <h3 className="font-bold text-slate-800">Trang</h3>
                        <p className="text-xs text-slate-500">AI Assistant</p>
                    </div>
                    <button onClick={toggleChat} className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 text-2xl p-1 rounded-full">&times;</button>
                </div>

                <div ref={chatBodyRef} className="flex-1 p-4 overflow-y-auto space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex ${!msg.isBot ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl font-medium shadow-sm ${
                                !msg.isBot 
                                    ? 'bg-[#1e5aa0] text-white rounded-br-none' 
                                    : 'bg-slate-100 text-slate-700 rounded-bl-none'
                            }`}>
                                <p>{msg.text}</p>
                            </div>
                        </div>
                    ))}
                    {interimTranscript && isRecording && (
                        <div className="flex justify-end">
                             <div className="max-w-[85%] px-4 py-2.5 rounded-2xl font-medium shadow-sm bg-[#1e5aa0] text-white/70 rounded-br-none italic">
                               <p>{interimTranscript}</p>
                            </div>
                        </div>
                    )}
                    {isLoadingAI && (
                        <div className="flex justify-start">
                             <div className="max-w-[85%] px-4 py-3 rounded-2xl font-medium shadow-sm bg-slate-100 text-slate-700 rounded-bl-none">
                               <div className="dot-flashing"></div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 bg-white rounded-b-2xl border-t border-gray-100">
                    <div className="flex justify-around items-center mb-3 space-x-2">
                        {translations[currentLang].quickReplies.map(text => (
                            <button key={text} onClick={() => handleSendMessage(text)} disabled={isLoadingAI} className="text-xs font-semibold bg-blue-50 text-[#1e5aa0] py-2 px-3 rounded-full hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                {text}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center space-x-2">
                         <input 
                            type="text" 
                            placeholder={isRecording ? translations[currentLang].listening : translations[currentLang].placeholder}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputValue)}
                            disabled={isLoadingAI || isRecording}
                            className="flex-1 w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-200 outline-none transition-all shadow-inner bg-slate-50 disabled:opacity-60"
                        />
                        <button 
                            onClick={toggleRecording}
                            disabled={isLoadingAI}
                            className={`w-10 h-10 flex-shrink-0 text-white rounded-lg flex items-center justify-center transition-colors duration-300 ${
                                isRecording 
                                    ? 'bg-red-500 animate-pulse' 
                                    : 'bg-[#1e5aa0] hover:bg-blue-800'
                            }`}
                        >
                            <i className="fas fa-microphone"></i>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

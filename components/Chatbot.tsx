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

    useEffect(() => {
        setMessages([{ text: translations[currentLang].initialMessage, isBot: true }]);
    }, [currentLang]);

    useEffect(() => {
        audioRef.current = new Audio();
    }, []);

    const stopAudio = useCallback(() => {
        if (audioRef.current) {
            (audioRef.current as any).queueId = null;
            audioRef.current.pause();
            audioRef.current.src = '';
        }
    }, []);

    const speak = useCallback((text: string) => {
        stopAudio();
        if (!audioRef.current || !text) return;

        const thisQueueId = Date.now();
        (audioRef.current as any).queueId = thisQueueId;

        const cleanedText = text.replace(/[*_`#]/g, '').trim();
        const chunks = cleanedText.match(/[^.!?]+[.!?]*/g) || [cleanedText];

        let currentChunkIndex = 0;
        const playNextChunk = () => {
            if ((audioRef.current as any)?.queueId !== thisQueueId || currentChunkIndex >= chunks.length) return;

            const chunk = chunks[currentChunkIndex].trim();
            if (chunk && audioRef.current) {
                const ttsLang = currentLang === 'ru' ? 'ru' : 'vi';
                audioRef.current.src = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(chunk)}&tl=${ttsLang}&client=tw-ob`;
                audioRef.current.load();
                audioRef.current.onended = () => {
                    currentChunkIndex++;
                    playNextChunk();
                };
                audioRef.current.play().catch(() => {
                    currentChunkIndex++;
                    playNextChunk();
                });
            } else {
                currentChunkIndex++;
                playNextChunk();
            }
        };
        playNextChunk();
    }, [stopAudio, currentLang]);

    useEffect(() => {
        if (messages.length > prevMessagesLength.current) {
            const lastMessage = messages[messages.length - 1];
            if (lastMessage.isBot) speak(lastMessage.text);
        }
        prevMessagesLength.current = messages.length;
    }, [messages, speak]);

    const handleSendMessage = useCallback(async (messageText: string) => {
        const trimmedMessage = messageText.trim();
        if (!trimmedMessage || isLoadingAI) return;

        stopAudio();
        setMessages(prev => [...prev, { text: trimmedMessage, isBot: false }]);
        setInputValue('');
        setIsLoadingAI(true);

        try {
            const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

            const result = await model.generateContent(trimmedMessage);
            const response = await result.response;
            const aiText = response.text();
            
            if (aiText) {
                setMessages(prev => [...prev, { text: aiText, isBot: true }]);
            }
        } catch (error) {
            console.error("AI Error:", error);
            setMessages(prev => [...prev, { text: "Error connecting to AI assistant.", isBot: true }]);
        } finally {
            setIsLoadingAI(false);
        }
    }, [isLoadingAI, stopAudio]);

    const toggleChat = () => {
        if (!isOpen) speak(translations[currentLang].initialMessage);
        else stopAudio();
        setIsOpen(!isOpen);
    };

    const toggleRecording = () => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) return;

        if (isRecording) {
            recognitionRef.current?.stop();
            setIsRecording(false);
        } else {
            stopAudio();
            const recognition = new SpeechRecognition();
            recognition.lang = currentLang === 'ru' ? 'ru-RU' : 'en-US';
            recognition.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                handleSendMessage(transcript);
            };
            recognition.start();
            setIsRecording(true);
            recognitionRef.current = recognition;
        }
    };

    return (
        <>
            <style>{`
                @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-6px); } 100% { transform: translateY(0px); } }
                .animate-float { animation: float 4s ease-in-out infinite; }
            `}</style>
            <button onClick={toggleChat} className="fixed bottom-6 right-6 z-50 animate-float bg-white p-3 rounded-full shadow-xl border border-blue-100">
                <img src="https://cdn-icons-png.flaticon.com/512/4712/4712035.png" alt="Trang" className="w-12 h-12 rounded-full" />
            </button>

            {isOpen && (
                <div className="fixed bottom-24 right-6 w-[350px] h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-100 overflow-hidden">
                    <div className="p-4 bg-slate-50 border-b flex justify-between items-center">
                        <span className="font-bold text-slate-700 italic">Trang - AI Assistant</span>
                        <button onClick={toggleChat} className="text-xl">×</button>
                    </div>
                    <div ref={chatBodyRef} className="flex-1 p-4 overflow-y-auto space-y-3 bg-white">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
                                <div className={`p-3 rounded-2xl max-w-[85%] text-sm ${msg.isBot ? 'bg-slate-100 text-slate-800' : 'bg-[#1e5aa0] text-white'}`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isLoadingAI && <div className="text-xs text-slate-400 animate-pulse italic">Trang is thinking...</div>}
                    </div>
                    <div className="p-3 border-t bg-white flex gap-2">
                        <input 
                            className="flex-1 p-2 bg-slate-50 border rounded-xl outline-none text-sm"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputValue)}
                            placeholder={translations[currentLang].placeholder}
                        />
                        <button onClick={toggleRecording} className={`p-2 rounded-xl text-white ${isRecording ? 'bg-red-500' : 'bg-[#1e5aa0]'}`}>
                            🎤
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

import React, { useState, useEffect, useRef, useCallback } from 'react';
// Sửa import để dùng chung hệ thống 10 Key của ông
import { generateContentWithRetry } from '../config/apiKeys';

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
        if (audioRef.current) {
            const thisQueueId = Date.now();
            (audioRef.current as any).queueId = thisQueueId;
            const cleanedText = text.replace(/[*_`#]/g, '').trim();
            if (!cleanedText) return;

            const chunks: string[] = [];
            const maxLength = 180;
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
                if ((audioRef.current as any)?.queueId !== thisQueueId || currentChunkIndex >= chunks.length) return;
                const chunk = chunks[currentChunkIndex];
                if (chunk && audioRef.current) {
                    const ttsLang = currentLang === 'ru' ? 'ru-RU' : 'en-US';
                    audioRef.current.src = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(chunk)}&tl=${ttsLang}&client=tw-ob`;
                    audioRef.current.onended = () => {
                        currentChunkIndex++;
                        playNextChunk();
                    };
                    audioRef.current.play().catch(() => {
                        currentChunkIndex++;
                        playNextChunk();
                    });
                }
            };
            playNextChunk();
        }
    }, [stopAudio, currentLang]);

    useEffect(() => {
        if (messages.length > prevMessagesLength.current) {
            const lastMessage = messages[messages.length - 1];
            if (lastMessage.isBot) speak(lastMessage.text);
        }
        prevMessagesLength.current = messages.length;
    }, [messages, speak]);

    const toggleChat = () => {
        if (!isOpen) speak(translations[currentLang].initialMessage);
        else stopAudio();
        setIsOpen(!isOpen);
    };

    useEffect(() => {
        if (chatBodyRef.current) chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }, [messages, isLoadingAI, interimTranscript]);

    const handleSendMessage = useCallback(async (messageText: string) => {
        const trimmedMessage = messageText.trim();
        if (!trimmedMessage || isLoadingAI) return;
        stopAudio();
        setMessages(prev => [...prev, { text: trimmedMessage, isBot: false }]);
        setInputValue('');
        setIsLoadingAI(true);

        try {
            // Fetch kiến thức từ Google Docs
            const docUrl = 'https://docs.google.com/document/d/1i5F5VndGaGbB4d21jRjnJx2YbptF0KdBYHijnjYqe2U/export?format=txt';
            const docResponse = await fetch(docUrl);
            const docText = await docResponse.text();

            const systemInstruction = `You are Trang, a friendly AI for 'Truly Easy Vietnamese'. 
            Use ONLY this text to answer: ${docText}. 
            Keep it short (2-5 sentences). Language: ${currentLang === 'ru' ? 'Russian' : 'English'}.`;

            // GỌI HÀM XOAY VÒNG KEY TỪ APIKEYS.TS
            const fullPrompt = `${systemInstruction}\n\nUser: ${trimmedMessage}`;
            const aiText = await generateContentWithRetry(fullPrompt);

            setMessages(prev => [...prev, { text: aiText, isBot: true }]);
        } catch (error) {
            const errorMsg = currentLang === 'ru' 
                ? "Извините, возникла проблема. Попробуйте еще раз!" 
                : "Sorry, I'm having trouble. Please try again!";
            setMessages(prev => [...prev, { text: errorMsg, isBot: true }]);
        } finally {
            setIsLoadingAI(false);
        }
    }, [isLoadingAI, stopAudio, currentLang]);

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
                    if (event.results[i].isFinal) finalTranscriptRef.current += event.results[i][0].transcript;
                    else interim += event.results[i][0].transcript;
                }
                setInterimTranscript(interim);
            };
            recognition.onend = () => {
                setIsRecording(false);
                const finalResult = finalTranscriptRef.current.trim();
                if (finalResult) handleSendMessage(finalResult);
                finalTranscriptRef.current = '';
            };
            recognitionRef.current = recognition;
        }
    }, [currentLang, handleSendMessage]);

    const toggleRecording = () => {
        if (!recognitionRef.current) return;
        if (isRecording) recognitionRef.current.stop();
        else {
            stopAudio();
            finalTranscriptRef.current = '';
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
            `}</style>

            <button onClick={toggleChat} className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-3 group animate-float">
                <span className="hidden md:inline-block bg-white/90 backdrop-blur-md font-bold text-[#1e5aa0] px-5 py-2 rounded-full shadow-lg border border-blue-100">
                    {translations[currentLang].assistantLabel}
                </span>
                <div className="w-16 h-16 bg-white rounded-full shadow-xl flex items-center justify-center border-2 border-blue-400 overflow-hidden">
                    <img src="https://img.icons8.com/fluency/96/bot.png" alt="Trang" className="w-10 h-10" />
                </div>
            </button>

            <div className={`fixed bottom-24 right-6 w-[350px] h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col transition-all duration-300 z-50 ${isOpen ? 'scale-100 opacity-100' : 'scale-90 opacity-0 pointer-events-none'}`}>
                <div className="p-4 bg-slate-50 rounded-t-2xl border-b flex flex-col items-center relative">
                    <img src="https://img.icons8.com/fluency/96/bot.png" className="w-16 h-16 mb-2" alt="Trang" />
                    <h3 className="font-bold text-slate-800">Trang</h3>
                    <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest">● Online</p>
                    <button onClick={toggleChat} className="absolute top-2 right-4 text-2xl text-slate-300">×</button>
                </div>

                <div ref={chatBodyRef} className="flex-1 p-4 overflow-y-auto space-y-4 bg-white">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex ${!msg.isBot ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] px-4 py-2 rounded-2xl text-sm font-medium ${!msg.isBot ? 'bg-[#1e5aa0] text-white rounded-br-none' : 'bg-slate-100 text-slate-700 rounded-bl-none'}`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {isLoadingAI && <div className="dot-flashing ml-4"></div>}
                </div>

                <div className="p-4 border-t">
                    <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
                        {translations[currentLang].quickReplies.map(text => (
                            <button key={text} onClick={() => handleSendMessage(text)} className="whitespace-nowrap text-[10px] bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full font-bold hover:bg-blue-100">
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
                            placeholder={isRecording ? "Listening..." : translations[currentLang].placeholder}
                        />
                        <button onClick={toggleRecording} className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-[#1e5aa0]'}`}>
                            🎤
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

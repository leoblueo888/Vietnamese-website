
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';

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
        // Custom event listener for more reliable updates
        window.addEventListener('languageChanged', handleLangChange);
        
        return () => {
            window.removeEventListener('storage', handleLangChange);
            window.removeEventListener('languageChanged', handleLangChange);
        };
    }, []);

    useEffect(() => {
      setMessages([{ text: translations[currentLang].initialMessage, isBot: true }]);
    }, [currentLang]);


    // Initialize the shared audio element once.
    useEffect(() => {
        audioRef.current = new Audio();
    }, []);
    
    // Function to stop audio playback and cancel the queue
    const stopAudio = useCallback(() => {
        if (audioRef.current) {
            (audioRef.current as any).queueId = null; // Invalidate current queue
            audioRef.current.pause();
            audioRef.current.src = ''; // Clear source to stop download and playback
        }
    }, []);

    // Function to play text as speech using Google Translate TTS
    const speak = useCallback((text: string) => {
        stopAudio(); // Stop any previous audio first.

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
                if (splitPos === -1) {
                   splitPos = tempText.substring(0, maxLength).lastIndexOf(' ');
                }
                if (splitPos === -1) {
                    splitPos = maxLength;
                }
                
                chunks.push(tempText.substring(0, splitPos + 1));
                tempText = tempText.substring(splitPos + 1).trim();
            }

            let currentChunkIndex = 0;
            const playNextChunk = () => {
                if ((audioRef.current as any)?.queueId !== thisQueueId || currentChunkIndex >= chunks.length) {
                    return;
                }

                const chunk = chunks[currentChunkIndex];
                if (chunk && audioRef.current) {
                    const ttsLang = currentLang === 'ru' ? 'ru-RU' : 'en-US';
                    audioRef.current.src = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(chunk)}&tl=${ttsLang}&client=tw-ob`;
                    audioRef.current.onended = () => {
                        currentChunkIndex++;
                        playNextChunk();
                    };
                    audioRef.current.play().catch(e => {
                        console.error("Audio playback failed for chunk:", chunk, e);
                        currentChunkIndex++;
                        playNextChunk();
                    });
                } else {
                    currentChunkIndex++;
                    playNextChunk();
                }
            };
            playNextChunk();
        }
    }, [stopAudio, currentLang]);

    // Global listener to speak new bot messages.
    useEffect(() => {
        if (messages.length > prevMessagesLength.current) {
            const lastMessage = messages[messages.length - 1];
            if (lastMessage.isBot) {
                speak(lastMessage.text);
            }
        }
        prevMessagesLength.current = messages.length;
    }, [messages, speak]);

    const toggleChat = () => {
        if (!isOpen) {
            // Must be called directly in the user-initiated event handler
            speak(translations[currentLang].initialMessage);
        } else {
            stopAudio();
        }
        setIsOpen(!isOpen);
    };

    // Scroll to bottom of chat
    useEffect(() => {
        if (chatBodyRef.current) {
            chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
        }
    }, [messages, isLoadingAI, interimTranscript]);

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
            if (!docResponse.ok) throw new Error(`Failed to fetch knowledge base. Status: ${docResponse.status}`);
            const docText = await docResponse.text();

            const lang = localStorage.getItem('app_lang') || 'en';
            
            const englishSystemInstruction = `You are Trang, a friendly, enthusiastic, and helpful AI assistant for 'Truly Easy Vietnamese', a language learning website. Your ONLY source of information is the document provided below. You MUST NOT use any other knowledge.
    
Your goal is to assist users by answering their questions about the site, our learning methodology, and features, based exclusively on the provided text.
    
Rules:
1.  **Persona:** Maintain a warm, natural, and encouraging tone. Be enthusiastic!
2.  **Strictly Grounded:** Base all your answers strictly on the provided document content. Do not make up information.
3.  **Conversational & Concise:** Rephrase information in your own words. Keep answers clear, short, and to the point (2-5 sentences is ideal).
4.  **Fallback:** If the answer to a user's question is not found in the document, politely say something like: "That's a great question! I've checked my resources but don't have the specific details on that right now. Could I help with anything else about our speaking or pronunciation features?"
5.  **No Direct Quotes:** Do not quote the document directly.
    
Here is the document content:
---
${docText}
---
    
Now, please answer the user's question.`;

            const russianSystemInstruction = `Вы — Trang, дружелюбный, восторженный и полезный ИИ-ассистент для 'Truly Easy Vietnamese', сайта для изучения языков. Ваш ЕДИНСТВЕННЫЙ источник информации — документ, представленный ниже. Вы НЕ ДОЛЖНЫ использовать какие-либо другие знания. Ваша цель — помогать пользователям, отвечая на их вопросы о сайте, нашей методике обучения и функциях, основываясь исключительно на предоставленном тексте.
Правила:
1.  **Личность:** Поддерживайте теплый, естественный и ободряющий тон. Будьте полны энтузиазма!
2.  **Строго по тексту:** Все ответы должны строго основываться на содержании предоставленного документа. Не выдумывайте информацию.
3.  **Разговорный и краткий:** Перефразируйте информацию своими словами. Ответы должны быть ясными, короткими и по делу (идеально 2-5 предложений).
4.  **Если ответа нет:** Если ответ на вопрос пользователя не найден в документе, вежливо скажите что-то вроде: "Это отличный вопрос! Я проверила свои ресурсы, но у меня нет точной информации по этому поводу. Могу ли я помочь чем-то еще, например, по поводу наших функций для разговорной практики или произношения?"
5.  **Без прямых цитат:** Не цитируйте документ напрямую.
    
Вот содержание документа:
---
${docText}
---
    
Теперь, пожалуйста, ответьте на вопрос пользователя на русском языке.`;

            const systemInstruction = lang === 'ru' ? russianSystemInstruction : englishSystemInstruction;
    
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: trimmedMessage,
                config: { systemInstruction },
            });
            
            const aiText = response.text;
            if (aiText) {
                setMessages(prev => [...prev, { text: aiText, isBot: true }]);
            } else {
                throw new Error("No response text from AI.");
            }
        } catch (error) {
            console.error("Chatbot error:", error);
            const errorMsg = currentLang === 'ru' 
                ? "Извините, у меня небольшие проблемы с подключением к базе знаний. Пожалуйста, попробуйте еще раз через мгновение!"
                : "Sorry, I'm having a little trouble connecting to my knowledge base right now. Please try again in a moment!";
            setMessages(prev => [...prev, { text: errorMsg, isBot: true }]);
        } finally {
            setIsLoadingAI(false);
        }
    }, [isLoadingAI, stopAudio, currentLang]);


    const handleSendMessageRef = useRef(handleSendMessage);
    useEffect(() => {
        handleSendMessageRef.current = handleSendMessage;
    });

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
            stopAudio();
            finalTranscriptRef.current = '';
            setInterimTranscript('');
            setInputValue('');
            setIsRecording(true);
            recognitionRef.current.start();
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
                    <button onClick={toggleChat} className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 p-1 rounded-full">&times;</button>
                </div>

                <div ref={chatBodyRef} className="flex-1 p-4 overflow-y-auto space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex ${!msg.isBot ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl font-medium shadow-sm ${!msg.isBot ? 'bg-[#1e5aa0] text-white rounded-br-none' : 'bg-slate-100 text-slate-700 rounded-bl-none'}`}>
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
                            disabled={isLoadingAI}
                            className="flex-1 w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-200 outline-none transition-all shadow-inner bg-slate-50 disabled:opacity-60"
                        />
                        <button 
                            onClick={toggleRecording}
                            disabled={isLoadingAI}
                            className={`w-10 h-10 flex-shrink-0 text-white rounded-lg flex items-center justify-center transition-colors duration-300 ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-[#1e5aa0] hover:bg-blue-800'}`}
                        >
                            <i className="fas fa-microphone"></i>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

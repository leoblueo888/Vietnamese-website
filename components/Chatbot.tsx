import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const Chatbot: React.FC = () => {
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
            placeholder: "Type or click mic to talk",
        },
        ru: {
            initialMessage: "Здравствуйте, chào mừng bạn đến với Truly Easy Vietnamese. Tôi có thể giúp gì cho bạn?",
            placeholder: "Nhập tin nhắn hoặc nhấn mic",
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
        if (chatBodyRef.current) {
            chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, Send, Volume2, Globe, Sparkles, Gauge } from 'lucide-react';
import { generateContentWithRetry } from '../config/apiKeys';

// --- CHÌA KHÓA AUDIO: LOGIC GIỐNG GAME FAMILY (NẰM NGOÀI COMPONENT) ---
let globalAudio: HTMLAudioElement | null = null;

const speakWithGoogle = (text: string, speed: number) => {
  if (globalAudio) {
    globalAudio.pause();
    globalAudio.currentTime = 0;
  }
  try {
    const cleanText = text.split('|')[0].replace(/USER_TRANSLATION:.*$/gi, '').replace(/["'*]/g, '').trim();
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(cleanText)}&tl=vi&client=tw-ob`;
    const audio = new Audio(url);
    globalAudio = audio;
    audio.playbackRate = speed;
    audio.play().catch(e => console.warn("Audio play blocked by browser:", e));
  } catch (e) {
    console.error("Audio error:", e);
  }
};

const getTranslations = () => {
  const lang = localStorage.getItem('lang') || 'EN';
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : { name: 'Guest', gender: 'male' };
  const p = user.gender === 'female' ? 'Chị' : 'Anh';
  const name = user.name || 'Guest';

  return {
    label: lang,
    ui_welcome: lang === 'EN' ? "Hi! I'm Lan. Let's make friends!" : "Привет! Я Лан. Давай дружить!",
    ui_start: lang === 'EN' ? "START CHAT" : "НАЧАТЬ ЧАТ",
    ui_placeholder: lang === 'EN' ? "Type Vietnamese here..." : "Пишите по-вьетнамски...",
    ui_thinking: lang === 'EN' ? "Lan is typing..." : "Лан печатает...",
    welcome_msg: lang === 'EN' 
      ? `Dạ, em chào ${p} ${name}! Em là Lan. Rất vui được gặp ${p} ạ! ✨ | Hi ${name}! I'm Lan! Nice to meet you! ✨`
      : `Dạ, em chào ${p} ${name}! Em là Lan. Rất vui được gặp ${p} ạ! 🌸 | Здравствуйте, ${name}! Я Лан. Рада встрече! 🌸`,
    systemPrompt: `You are Lan, a 25-year-old girl from Ha Long, Vietnam. 
    You are friendly, helpful, and speak natural Vietnamese. 
    Refer to yourself as "Em" and the user as "${p}". 
    Always provide a translation in ${lang === 'EN' ? 'English' : 'Russian'}.
    FORMAT: Vietnamese_Text | Translation | USER_TRANSLATION: [Translate user's last msg]`
  };
};

export const AIfriendLan: React.FC = () => {
  const [gameState, setGameState] = useState('start');
  const [messages, setMessages] = useState<any[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [speechSpeed, setSpeechSpeed] = useState(1.0);
  const [activeVoiceId, setActiveVoiceId] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const config = getTranslations();

  const LAN_IMAGE = "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=1974&auto=format&fit=crop";

  // --- KÍCH HOẠT NHẬN DIỆN GIỌNG NÓI ---
  useEffect(() => {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRec) {
      const rec = new SpeechRec();
      rec.lang = 'vi-VN';
      rec.continuous = false;
      rec.onresult = (e: any) => {
        const text = e.results[0][0].transcript;
        setUserInput(text);
        handleSendMessage(text);
      };
      rec.onend = () => setIsRecording(false);
      recognitionRef.current = rec;
    }

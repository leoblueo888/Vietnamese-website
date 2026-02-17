import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, Send, Volume2, Globe, Download, Gauge, Play } from 'lucide-react';
import { generateContentWithRetry } from '../config/apiKeys';

const getTranslations = (topic?: string | null) => {
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : { name: 'Guest', gender: 'male' };
    const userName = user.name || 'Guest';
    const userPronoun = user.gender === 'female' ? 'Chị' : 'Anh';

    return {
      EN: {
        label: "English",
        ui_welcome: "Hi! I'm Lan. Let's make friends!",
        ui_start: "START CHAT",
        ui_placeholder: "Type here...",
        ui_listening: "Listening...",
        ui_learning_title: "Chat & Meet Friends",
        welcome_msg: `Dạ, em chào ${userPronoun} ${userName}! Em là Lan. Rất vui được gặp ${userPronoun} ạ! ✨ | Hi ${userName}! I'm Lan! Nice to meet you! ✨`,
        systemPromptLang: "English"
      },
      RU: {
        label: "Русский",
        ui_welcome: "Привет! Я Лан. Давай дружить!",
        ui_start: "НАЧАТЬ CHAT",
        ui_placeholder: "Пишите здесь...",
        ui_listening: "Слушаю...",
        ui_learning_title: "Общение và bạn bè",
        welcome_msg: `Dạ, em chào ${userPronoun} ${userName}! Em là Lan. Rất vui được gặp ${userPronoun} ạ! 🌸 | Здравствуйте, ${userName}! Я Лан. Рада встрече! 🌸`,
        systemPromptLang: "Russian"
      }
    };
};

export const AIfriendLan: React.FC<{ onBack?: () => void, topic?: string | null }> = ({ onBack, topic }) => {
  const [gameState, setGameState] = useState('start'); 
  const [selectedLang, setSelectedLang] = useState('EN'); 
  const [messages, setMessages] = useState<any[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [activeVoiceId, setActiveVoiceId] = useState<string | null>(null);
  const [speechSpeed, setSpeechSpeed] = useState(1.0); 
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const LAN_IMAGE_URL = "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=1974&auto=format&fit=crop";
  const t = getTranslations(topic)[selectedLang as 'EN' | 'RU'];

  // --- HÀM PHÁT ÂM GOOGLE TTS (BẢN FIX CHỐNG CHẶN) ---
  const speakWord = useCallback((text: string, msgId: any = null) => {
    if (!text) return;
    if (msgId) setActiveVoiceId(msgId);
    
    // Lấy phần tiếng Việt
    const cleanText = text.split('|')[0].replace(/USER_TRANSLATION:.*$/gi, '').replace(/["'*]/g, '').trim();
    
    // Tạo đối tượng Audio mới mỗi lần phát để bypass cache/block
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(cleanText)}&tl=vi&client=tw-ob`;
    const audio = new Audio(url);
    audio.playbackRate = speechSpeed;

    audio.onended = () => setActiveVoiceId(null);
    audio.onerror = () => setActiveVoiceId(null);

    // Bắt đầu phát
    audio.play().catch(err => {
      console.warn("Trình duyệt chặn autoplay, cần click để nghe:", err);
      setActiveVoiceId(null);
    });
  }, [speechSpeed]);

  const handleSendMessage = useCallback(async (text: string) => {
    if (!text?.trim() || isThinking) return;
    setIsThinking(true);
    
    const userMsgId = `user-${Date.now()}`;
    const newUserMsg = { role: 'user', text: text.trim(), displayedText: text.trim(), id: userMsgId };
    setMessages(prev => [...prev, newUserMsg]);
    setUserInput("");

    try {
        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : { name: 'Guest', gender: 'male' };
        
        const response = await generateContentWithRetry({
            model: 'gemini-3-flash-preview',
            contents: [...messages, newUserMsg].map(m => ({
                role: m.role === 'ai' ? 'model' : 'user',
                parts: [{ text: (m.text || "").split('|')[0] }]
            })),
            config: { systemInstruction: `You are Lan, friendly Vietnamese girl. Refer to yourself as "Em".` }
        });
        
        const rawAi = response.text || "";
        const aiMsgId = `ai-${Date.now()}`;
        
        setMessages(prev => [...prev, { role: 'ai', text: rawAi, id: aiMsgId, displayedText: rawAi }]);

        // Tự động phát âm câu trả lời của AI
        speakWord(rawAi, aiMsgId);
    } catch (e) {
        console.error(e);
    } finally {
        setIsThinking(false);
    }
  }, [messages, speakWord, isThinking]);

  useEffect(() => {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRec) {
      const rec = new SpeechRec();
      rec.lang = 'vi-VN';
      rec.onresult = (e: any) => {
        const transcript = e.results[0][0].transcript;
        setUserInput(transcript);
        handleSendMessage(transcript);
      };
      rec.onend = () => setIsRecording(false);
      recognitionRef.current = rec;
    }
  }, [handleSendMessage]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleStart = () => {
    setGameState('playing');
    const welcome = t.welcome_msg;
    setMessages([{ role: 'ai', text: welcome, displayedText: welcome, id: 'init' }]);
    // Click Start Chat là tương tác người dùng -> Cho phép phát Audio ngay
    speakWord(welcome, 'init');
  };

  if (gameState === 'start') {
    return (
      <div className="w-full h-full bg-slate-900 flex items-center justify-center p-4 text-slate-900">
        <div className="w-full max-w-2xl bg-white rounded-3xl p-8 text-center shadow-2xl">
          <img src={LAN_IMAGE_URL} className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-sky-400" alt="Lan" />
          <h1 className="text-3xl font-black text-sky-600 mb-4 uppercase">Lan Ha Long 🌊</h1>
          <div className="flex justify-center gap-2 mb-6">
            {['EN', 'RU'].map(l => (
              <button key={l} onClick={() => setSelectedLang(l)} className={`px-6 py-2 rounded-xl font-bold ${selectedLang === l ? 'bg-sky-500 text-white' : 'bg-slate-100'}`}>{l}</button>
            ))}
          </div>
          <button onClick={handleStart} className="bg-sky-600 text-white px-12 py-4 rounded-2xl font-black text-xl hover:scale-105 transition-all shadow-lg">START CHAT</button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-white flex flex-col md:flex-row font-sans text-slate-900">
      <div className="md:w-1/3 bg-sky-50 p-6 flex flex-col items-center justify-between border-r">
        <div className="text-center">
          <img src={LAN_IMAGE_URL} className="w-32 h-32 md:w-48 md:h-48 rounded-3xl mx-auto shadow-lg object-cover border-4 border-white" alt="Lan" />
          <h2 className="mt-4 text-2xl font-black italic">Lan ✨</h2>
          <p className="text-sky-500 font-bold text-[10px] uppercase tracking-widest">Hạ Long City</p>
        </div>
        <button onClick={() => { if (!isRecording) recognitionRef.current?.start(); setIsRecording(true); }} 
          className={`w-20 h-20 rounded-full flex items-center justify-center shadow-xl transition-all ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-sky-500'}`}>
          <Mic color="white" size={32} />
        </button>
      </div>

      <div className="flex-1 flex flex-col bg-white overflow-hidden">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Google TTS Audio Enabled</span>
          <button onClick={() => setSpeechSpeed(s => s === 1.0 ? 0.7 : 1.0)} className="bg-slate-100 px-3 py-1 rounded-lg text-[10px] font-black uppercase hover:bg-slate-200">
             {speechSpeed === 1.0 ? "Speed: Fast" : "Speed: Slow"}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-sky-50/20">
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-4 rounded-2xl shadow-sm ${m.role === 'user' ? 'bg-sky-600 text-white' : 'bg-white border'}`}>
                <div className="flex justify-between items-start gap-4">
                  <p className="font-bold text-sm md:text-base">{m.displayedText.split('|')[0]}</p>
                  {m.role === 'ai' && (
                    <button onClick={() => speakWord(m.displayedText, m.id)} className={activeVoiceId === m.id ? 'text-sky-500' : 'text-slate-300 hover:text-sky-500'}>
                      <Volume2 size={18} />
                    </button>
                  )}
                </div>
                {m.displayedText.includes('|') && <p className="text-xs italic mt-2 opacity-70 border-t pt-2">{m.displayedText.split('|')[1]}</p>}
              </div>
            </div>
          ))}
          <div ref={chatEndRef}></div>
        </div>

        <div className="p-4 border-t flex gap-2">
          <input type="text" value={userInput} onChange={e => setUserInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSendMessage(userInput)} 
            className="flex-1 px-4 py-3 rounded-xl bg

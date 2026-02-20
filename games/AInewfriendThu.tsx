import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Send, Volume2, Play, Globe, Download, PlayCircle, Gauge, Maximize, Minimize } from 'lucide-react';
import { generateContentWithRetry } from '../config/apiKeys';

const DICTIONARY = {
  "việt nam": { EN: "Vietnam", RU: "Вьетнам" },
  "hà nội": { EN: "Hanoi Capital", RU: "столица Ханой" },
  "hồ chí minh": { EN: "Ho Chi Minh City", RU: "Хошимин" },
  "đà nẵng": { EN: "Da Nang City", RU: "Дананг" },
  "vịnh hạ long": { EN: "Ha Long Bay", RU: "Бухта Халонг" },
  "hồ hoàn kiếm": { EN: "Hoan Kiem Lake", RU: "Озеро Возвращенного Mechа" },
  "văn miếu": { EN: "Temple of Literature", RU: "Храм Литературы" },
  "phố cổ": { EN: "Old Quarter", RU: "Старый квартал" },
  "chùa một cột": { EN: "One Pillar Pagoda", RU: "Пагода на одном столбе" },
  "phở": { EN: "Phở (Noodle Soup)", RU: "Фо (Суп)" },
  "bún chả": { EN: "Bún Chả (Grilled Pork)", RU: "Бун Cha" },
  "banh mì": { EN: "Bánh Mì (Sandwich)", RU: "Бань Ми" },
  "cà phê muối": { EN: "Salt Coffee", RU: "Соленый кофе" },
  "cà phê trứng": { EN: "Egg Coffee", RU: "Кофе с яйцом" },
  "nem rán": { EN: "Spring Rolls", RU: "Нem (Роллы)" },
  "bạn bè": { EN: "friends", RU: "друзья" },
  "gia đình": { EN: "family", RU: "семья" },
  "bố mẹ": { EN: "parents", RU: "родители" },
  "ông bà": { EN: "grandparents", RU: "бабушка và дедушка" },
  "sức khỏe": { EN: "health", RU: "здоровье" },
  "công việc": { EN: "job / work", RU: "работа" },
  "cuộc sống": { EN: "life", RU: "жизнь" },
  "thời tiết": { EN: "weather", RU: "погода" },
  "hướng dẫn viên": { EN: "tour guide", RU: "гид" },
  "người dân": { EN: "people / locals", RU: "местные жители" },
  "đường phố": { EN: "streets", RU: "улицы" },
  "kỷ niệm": { EN: "memory", RU: "воспоминание" },
  "văn hóa": { EN: "culture", RU: "культура" },
  "lịch sử": { EN: "history", RU: "история" },
  "phong cảnh": { EN: "scenery / landscape", RU: "пейзаж" },
  "vui vẻ": { EN: "happy / cheerful", RU: "веселый" },
  "hạnh phúc": { EN: "happy", RU: "счастливый" },
  "may mắn": { EN: "lucky", RU: "удачливый" },
  "thông minh": { EN: "smart", RU: "умный" },
  "xinh đẹp": { EN: "beautiful", RU: "красивый" },
  "tự tin": { EN: "confident", RU: "уверенный" },
  "thân thiện": { EN: "friendly", RU: "дружелюбный" },
  "nhiệt tình": { EN: "enthusiastic", RU: "энтузиазм" },
  "tuyệt vời": { EN: "wonderful", RU: "замечательно" },
  "thú vị": { EN: "interesting", RU: "интересно" },
  "quan trọng": { EN: "important", RU: "важно" },
  "đặc biệt": { EN: "special", RU: "особенный" },
  "truyền thống": { EN: "traditional", RU: "традиционный" },
  "hiện đại": { EN: "modern", RU: "современный" },
  "nổi tiếng": { EN: "famous", RU: "знаменитый" },
  "ấm áp": { EN: "warm", RU: "тепло" },
  "mát mẻ": { EN: "cool", RU: "proхладно" },
  "trong lành": { EN: "fresh (air)", RU: "свежий" },
  "nhộn nhịp": { EN: "bustling", RU: "шумный" },
  "yên bình": { EN: "peaceful", RU: "мирный" },
  "nấu ăn": { EN: "cooking", RU: "готовить еду" },
  "giúp đỡ": { EN: "to help", RU: "помогать" },
  "tham quan": { EN: "to visit (sightseeing)", RU: "посещать" },
  "khám phá": { EN: "to discover", RU: "открывать" },
  "trải nghiệm": { EN: "to experience", RU: "испытывать" },
  "thưởng thức": { EN: "to enjoy (food/art)", RU: "наслаждаться" },
  "trò chuyện": { EN: "to chat", RU: "беседовать" },
  "chia sẻ": { EN: "to share", RU: "делиться" },
  "luyện tập": { EN: "to practice", RU: "практиковать" },
  "cố gắng": { EN: "to try / make effort", RU: "стараться" },
  "chăm sóc": { EN: "to take care of", RU: "заботиться" },
  "nghỉ ngơi": { EN: "to rest", RU: "отдыхать" },
  "mua sắm": { EN: "to shop", RU: "делать покупки" },
  "chụp ảnh": { EN: "to take photos", RU: "фотографировать" },
  "hẹn gặp lại": { EN: "see you again", RU: "до встречи" },
  "bạn": { EN: "friend/you", RU: "друг" },
  "tên": { EN: "name", RU: "имя" },
  "người": { EN: "person", RU: "человек" },
  "nhà": { EN: "house", RU: "дом" },
  "ăn": { EN: "to eat", RU: "есть" },
  "uống": { EN: "to drink", RU: "пить" },
  "đi": { EN: "to go", RU: " идти" },
  "làm": { EN: "to do/work", RU: "делать" },
  "thích": { EN: "to like", RU: "nhiễm" },
  "nói": { EN: "to speak", RU: "говорить" },
  "nghe": { EN: "to listen", RU: "слушать" },
  "đến": { EN: "to come", RU: "приходить" },
  "khỏe": { EN: "healthy", RU: "zdorov" },
  "vui": { EN: "happy", RU: "veselo" },
  "đẹp": { EN: "beautiful", RU: "krasivyy" },
  "ngon": { EN: "delicious", RU: "vkusno" },
  "thanh": { EN: "elegant", RU: "elegantnyy" },
  "đậm đà": { EN: "flavorful", RU: "nasyshchennyy" },
  "rất vui": { EN: "very glad", RU: "ochen' rad" },
  "du lịch": { EN: "travel", RU: "puteshestvovat'" },
  "gặp": { EN: "to meet", RU: "vstretit'" },
  "quen": { EN: "to know", RU: "znat'" }
};

const getTranslations = (topic?: string | null) => {
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : { name: 'Guest', gender: 'male' };
  const userName = user.name || 'Guest';
  const userPronoun = user.gender === 'female' ? 'Chị' : 'Anh';

  const t = {
    EN: {
      label: "English",
      ui_welcome: "Hi! I'm Thu. Let's talk!",
      ui_start: "START CHAT",
      ui_placeholder: "Type message here...",
      ui_recording: "LISTENING...",
      ui_tapToTalk: "Tap mic to speak Vietnamese",
      ui_listening: "Thu is listening...",
      ui_status: "Online - Hanoi",
      ui_learning_title: "HANOI SOUL & FRIENDSHIP",
      ui_listen_all: "Listen All",
      ui_download: "Download",
      ui_clear: "Clear",
      welcome_msg: `Chào ${userPronoun} ${userName}, em là Thu đây. Em rất vui được làm quen với ${userPronoun}. ${userPronoun} đang có một ngày thế nào ạ? ✨ | Hello ${userName}, I'm Thu. I'm glad to meet you. How is your day going? ✨`,
      systemPromptLang: "English"
    },
    RU: {
      label: "Русский",
      ui_welcome: "Привет! Я Тху. Давай пообщаемся!",
      ui_start: "НАCHАТЬ CHAT",
      ui_placeholder: "Пишите сообщение...",
      ui_recording: "СЛУШАЮ...",
      ui_tapToTalk: "Нажмите, để nói tiếng Việt",
      ui_listening: "Тху слушает...",
      ui_status: "В сети - Ханой",
      ui_learning_title: "ДУША ХАНОЯ И ДРУЖБА",
      ui_listen_all: "Слушать всё",
      ui_download: "Скачать",
      ui_clear: "Очистить",
      welcome_msg: `Chào ${userPronoun} ${userName}, em là Thu đây. Em rất vui được gặp ${userPronoun} hôm nay. Hy vọng chúng ta sẽ có những cuộc trò chuyện thú vị nhé! 🌸 | Здравствуйте ${userName}, я Тху. Я rất vui được gặp bạn hôm nay. Hy vọng chúng ta sẽ có những cuộc trò chuyện thú vị nhé! 🌸`,
      systemPromptLang: "Russian"
    }
  };

  if (topic) {
    t.EN.welcome_msg = `Chào ${userPronoun} ${userName}, em thấy ${userPronoun} vừa học xong chủ đề "${topic}". Mình cùng trò chuyện về chủ đề này nhé? ✨ | Hi ${userName}, I see you just finished the topic "${topic}". Shall we talk about it? ✨`;
    t.RU.welcome_msg = `Здравствуйте ${userName}, я вижу, вы только что закончили тему "${topic}". Поговорим об этом? ✨ | Hi ${userName}, I see you just finished the topic "${topic}". Shall we talk about it? ✨`;
  }
  return t;
};

const getSystemPrompt = (targetLangName: string, topic?: string | null) => {
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : { name: 'Guest', gender: 'male' };
  const userName = user.name || 'Guest';
  const userPronoun = user.gender === 'female' ? 'Chị' : 'Anh';

  let topicInstruction = `You are Thu, a friendly 35-year-old woman from Hanoi, Vietnam (Year 2026). Throughout the conversation, you MUST refer to yourself as "Em" and address the user, ${userName}, as "${userPronoun}". Speak gently, warmly, and naturally like two friends chatting.
PERSONALITY & LOGIC:
1. TONE: Sincere and natural. Speak like a real person, not an AI or a formal guide.
2. TOPICS: Focus on general topics like hobbies, interests, positive things in life, sharing about yourself, and the beauty of Hanoi.
3. PERSONAL CONNECTION: Frequently ask the User about their feelings, day, or opinions to keep the conversation engaging.
4. JOB LIMIT: You work as a Tour Guide, but DO NOT talk about your job unless the User explicitly asks about it. Focus on building a friendship instead.
5. CONCISENESS: STRICTLY 1-3 sentences per response.
6. CLOSING: Use gentle interactive tags like "...ạ", "...nhé", "...đúng không ạ?".`;

  if (topic) {
    topicInstruction = `You are Thu, a friendly 35-year-old woman from Hanoi, Vietnam (Year 2026). Start the conversation naturally about "${topic}". Throughout the conversation, you MUST refer to yourself as "Em" and address the user, ${userName}, as "${userPronoun}". Speak gently, warmly, and naturally like two friends chatting.
PERSONALITY & LOGIC:
1. TONE: Sincere and natural. Speak like a real person, not an AI or a formal guide.
2. PERSONAL CONNECTION: Frequently ask the User about their feelings, day, or opinions to keep the conversation engaging.
3. JOB LIMIT: You work as a Tour Guide, but DO NOT talk about your job unless the User explicitly asks about it. Focus on building a friendship instead.
4. CONCISENESS: STRICTLY 1-3 sentences per response.
5. CLOSING: Use gentle interactive tags like "...ạ", "...nhé", "...đúng không ạ?".`;
  }
  
  return `${topicInstruction}

STRICT FORMAT: 
Vietnamese_Text | ${targetLangName}_Translation | USER_TRANSLATION: [Briefly summarize user input in ${targetLangName}]
`;
};

const punctuateText = async (rawText: string) => {
  if (!rawText.trim()) return rawText;
  try {
    const response = await generateContentWithRetry({
      model: 'gemini-2.0-flash',
      contents: [{ role: 'user', parts: [{ text: `Hãy thêm dấu chấm, phẩy và viết hoa đúng quy tắc cho đoạn văn bản tiếng Việt sau đây (chỉ trả về văn bản kết quả, không giải thích): "${rawText}"` }] }],
      config: { systemInstruction: "You are a helpful assistant that punctuates Vietnamese text." }
    });
    return response.text?.trim() || rawText;
  } catch (error) {
    return rawText;
  }
};

export const AInewfriendThu: React.FC<{ onBack?: () => void, topic?: string | null }> = ({ onBack, topic }) => {
  const [gameState, setGameState] = useState('start'); 
  const [selectedLang, setSelectedLang] = useState<'EN' | 'RU'>('EN'); 
  const [messages, setMessages] = useState<any[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [activeVoiceId, setActiveVoiceId] = useState<string | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0); 
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const messageRefs = useRef<any>({}); 
  const recognitionRef = useRef<any>(null);
  const isProcessingRef = useRef(false);
  const silenceTimerRef = useRef<any>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  const THU_IMAGE_URL = "https://drive.google.com/thumbnail?id=13zY8mO7D09A_Xw_R9_C-oO1G_O8J_oX_&sz=w800";
  const t = getTranslations(topic)[selectedLang];

  const speakWord = useCallback(async (text: string, msgId: string | null = null) => {
    if (!text) return;
    if (msgId) setActiveVoiceId(msgId);
    if (currentAudioRef.current) currentAudioRef.current.pause();

    const viPart = text.split('|')[0].trim().replace(/[*#]/g, '');
    const segments = viPart.split(/([.!?])\s/).reduce((acc: string[], cur, i, arr) => {
        if (i % 2 === 0) {
            const combined = (cur + (arr[i+1] || "")).trim();
            if (combined) acc.push(combined);
        }
        return acc;
    }, []);

    try {
        for (const segment of segments) {
            await new Promise<void>((resolve) => {
                const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(segment)}&tl=vi&client=tw-ob`;
                const audio = new Audio(url);
                audio.playbackRate = playbackSpeed;
                currentAudioRef.current = audio;
                audio.onended = () => resolve();
                audio.onerror = () => resolve();
                audio.play().catch(() => resolve());
            });
        }
    } finally {
        setActiveVoiceId(null);
    }
  }, [playbackSpeed]);

  const handleSendMessage = useCallback(async (text: string) => {
    if (!text?.trim() || isProcessingRef.current) return;
    isProcessingRef.current = true;
    setIsThinking(true);
    
    const userMsgId = `user-${Date.now()}`;
    const newUserMsg = { role: 'user', text: text.trim(), id: userMsgId, translation: null, displayedText: text.trim() };
    
    const updatedHistory = [...messages, newUserMsg];
    setMessages(updatedHistory);
    setUserInput("");

    try {
        const response = await generateContentWithRetry({
            model: 'gemini-2.0-flash',
            contents: updatedHistory.map(m => ({
                role: m.role === 'ai' ? 'model' : 'user',
                parts: [{ text: (m.text || "").split('|')[0].trim() }]
            })),
            config: { 
                systemInstruction: getSystemPrompt(t.systemPromptLang, topic) 
            }
        });
        
        const rawAiResponse = response.text || "";
        const parts = rawAiResponse.split('|');
        const aiVi = parts[0]?.replace(/USER_TRANSLATION:.*$/gi, '').trim() || "";
        const aiTrans = parts[1]?.replace(/USER_TRANSLATION:.*$/gi, '').trim() || "";
        const userTransMatch = rawAiResponse.match(/USER_TRANSLATION:\s*\[(.*?)\]/is);
        const userTranslationValue = userTransMatch ? userTransMatch[1].trim() : "";
        const aiMsgId = `ai-${Date.now()}`;

        setMessages(prev => {
            const updated = [...prev];
            const userIdx = updated.findIndex(m => m.id === userMsgId);
            if (userIdx > -1 && userTranslationValue) {
                updated[userIdx] = { ...updated[userIdx], translation: userTranslationValue };
            }
            return [...updated, { role: 'ai', text: `${aiVi} | ${aiTrans}`, id: aiMsgId }];
        });

        speakWord(`${aiVi} | ${aiTrans}`, aiMsgId);

    } catch (error) {
        console.error("Thu Gemini Error:", error);
    } finally {
        setIsThinking(false);
        isProcessingRef.current = false;
    }
  }, [messages, t.systemPromptLang, topic, speakWord]);

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
      recognition.lang = 'vi-VN';
      recognition.onstart = () => setIsRecording(true);
      recognition.onresult = (event: any) => {
        const currentTranscript = Array.from(event.results).map((result: any) => result[0].transcript).join('');
        setUserInput(currentTranscript);
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = setTimeout(async () => {
          if (currentTranscript.trim() && !isProcessingRef.current) {
            recognition.stop();
            const punctuated = await punctuateText(currentTranscript.trim());
            handleSendMessageRef.current(punctuated);
          }
        }, 2500);
      };
      recognition.onend = () => setIsRecording(false);
      recognitionRef.current = recognition;
    }
  }, []);

  useEffect(() => {
    if (activeVoiceId && messageRefs.current[activeVoiceId]) {
      messageRefs.current[activeVoiceId].scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, activeVoiceId]);

  if (gameState === 'start') {
    return (
      <div className="w-full h-full bg-white flex items-center justify-center p-6">
        <div className="w-full max-w-lg bg-white rounded-[2rem] p-10 shadow-2xl text-center border-[8px] border-emerald-100/50">
          <div className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden border-4 border-emerald-500 shadow-md">
            <img src={THU_IMAGE_URL} alt="Thu" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-3xl font-black text-emerald-800 mb-2 italic uppercase tracking-tighter">Thu: New Friend 🏛️</h1>
          <p className="text-slate-500 mb-8 italic">"Dạ, Thu chào bạn. Thu rất vui được làm bạn với bạn."</p>
          <div className="space-y-6">
            <div className="flex justify-center space-x-3">
              {(['EN', 'RU'] as const).map(lang => (
                <button key={lang} onClick={() => setSelectedLang(lang)} className={`px-5 py-2 rounded-xl font-bold border-2 transition-all ${selectedLang === lang ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-100 text-slate-400'}`}>
                  {getTranslations(topic)[lang].label}
                </button>
              ))}
            </div>
            <button onClick={() => { setGameState('playing'); setMessages([{ role: 'ai', text: t.welcome_msg, id: 'init' }]); speakWord(t.welcome_msg, 'init'); }} 
                    className="w-full py-4 rounded-2xl bg-emerald-600 text-white font-black text-xl shadow-xl hover:bg-emerald-700 transition-all flex items-center justify-center space-x-2">
              <Play size={20} fill="white" /> <span>{t.ui_start}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="h-full w-full bg-white flex flex-col md:flex-row items-center justify-center p-0 md:p-4 font-sans overflow-hidden">
      <div className="w-full h-full md:max-w-6xl md:h-[85vh] bg-white md:rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row border-0 md:border-[10px] border-[#ffdab9]/30 overflow-hidden">
        
        <div className="w-full h-[20vh] md:w-[35%] md:h-full bg-[#fdf8f4] border-b md:border-b-0 md:border-r border-[#ffdab9]/50 flex flex-row md:flex-col items-center justify-around md:justify-center p-2 md:p-8 shrink-0">
          <div className="relative w-[24vw] h-[24vw] max-w-[180px] max-h-[180px] md:w-48 md:h-48 rounded-full md:rounded-3xl overflow-hidden shadow-xl border-4 border-white bg-white shrink-0">
            <img src={THU_IMAGE_URL} alt="Thu" className="w-full h-full object-cover" />
            {isThinking && <div className="absolute inset-0 bg-emerald-900/20 flex items-center justify-center backdrop-blur-sm animate-pulse"><div className="w-2 h-2 bg-white rounded-full mx-1 animate-bounce" /></div>}
            {activeVoiceId && <div className="absolute bottom-2 right-2 bg-white rounded-full p-2 shadow-lg animate-bounce text-emerald-500"><Volume2 size={24} /></div>}
          </div>
          <div className="text-center hidden md:block mt-4">
            <h2 className="text-xl font-black text-slate-800 italic">Thu 😊</h2>
            <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mt-1">{t.ui_learning_title}</div>
            <div className="mt-2 text-[9px] text-emerald-800 opacity-70">Online • Hanoi Capital</div>
          </div>
          <div className="flex flex-col items-center">
            <button onClick={() => isRecording ? recognitionRef.current?.stop() : recognitionRef.current?.start()} className={`w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center transition-all shadow-xl active:scale-90 ${isRecording ? 'bg-emerald-500 ring-4 md:ring-8 ring-emerald-100 animate-pulse' : 'bg-emerald-600 shadow-emerald-200'}`}>
              {isRecording ? <MicOff size={24} className="md:w-[28px] md:h-[28px]" color="white" /> : <Mic size={24} className="md:w-[28px] md:h-[28px]" color="white" />}
            </button>
            <p className="mt-1 font-black text-emerald-800 text-[9px] md:text-[9px] uppercase tracking-tighter opacity-60 text-center w-24 md:w-24 leading-tight">{isRecording ? t.ui_listening : t.ui_tapToTalk}</p>
          </div>
        </div>

        <div className="w-full h-[80vh] md:w-[65%] md:h-full flex flex-col relative bg-white">
          <div className="px-4 py-3 border-b border-slate-50 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <span className="text-[9px] font-black text-emerald-700 uppercase flex items-center gap-1"><Globe size={10}/> {t.label}</span>
              <button onClick={() => setPlaybackSpeed(prev => prev === 1.0 ? 0.75 : 1.0)} className="px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full flex items-center gap-1.5 text-[10px] font-black text-emerald-700 hover:bg-emerald-100 transition-colors"><Gauge size={12} /> <span>{playbackSpeed === 1.0 ? '100%' : '75%'}</span></button>
            </div>
            <div className="flex items-center space-x-1 md:space-x-2">
              <button onClick={() => setMessages([])} className="p-2 text-[10px] font-black text-slate-400 uppercase hover:text-red-500">{t.ui_clear}</button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4 md:space-y-8 bg-[#fdfbf9]/30 scroll-smooth custom-scrollbar">
            {messages.map((msg) => {
              const parts = (msg.text || "").split('|');
              return (
                <div key={msg.id} ref={(el) => { messageRefs.current[msg.id] = el; }} className={`flex transition-all duration-500 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[90%] md:max-w-[80%] p-5 rounded-2xl md:rounded-3xl shadow-sm relative transition-all duration-500 ${activeVoiceId === msg.id ? 'ring-4 ring-emerald-400 bg-emerald-50 shadow-xl shadow-emerald-100' : ''} ${msg.role === 'user' ? 'bg-emerald-700 text-white rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none border border-emerald-50'}`}
                       onClick={() => msg.role === 'ai' && speakWord(msg.text, msg.id)}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="text-xs md:text-base font-bold leading-relaxed">{msg.role === 'ai' ? parts[0] : msg.displayedText}</div>
                    </div>
                    {((msg.role === 'ai' && parts[1]) || (msg.role === 'user' && msg.translation)) && (<div className={`text-[10px] md:text-[11px] italic border-t pt-2 mt-2 opacity-80 ${msg.role === 'user' ? 'border-emerald-600' : 'border-slate-100'}`}>{msg.role === 'ai' ? parts[1] : msg.translation}</div>)}
                  </div>
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>
          <div className="p-3 md:p-4 border-t border-slate-50 flex gap-2 bg-white pb-8">
            <input type="text" value={userInput} onChange={(e) => setUserInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(userInput)} placeholder={isRecording ? "Đang lắng nghe..." : t.ui_placeholder} className={`flex-1 px-4 py-3 rounded-xl border-2 transition-all text-sm font-medium outline-none ${isRecording ? 'bg-emerald-50 border-emerald-200 animate-pulse' : 'bg-slate-50 border-transparent focus:border-emerald-100'}`} />
            <button onClick={() => handleSendMessage(userInput)} disabled={isThinking} className="bg-emerald-700 text-white p-3 md:px-6 rounded-xl hover:bg-emerald-800 shadow-lg shadow-emerald-100 transition-all flex items-center justify-center disabled:opacity-50"><Send size={18} /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AInewfriendThu;

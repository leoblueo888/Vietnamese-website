import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Send, Volume2, Gauge, Maximize, Minimize } from 'lucide-react';
import { generateContentWithRetry } from '../config/apiKeys';
import type { AIFriend } from '../types';

// --- DICTIONARY: TỪ VỰNG NHÀ HÀNG ---
const DICTIONARY: Record<string, { EN: string; type: string }> = {
  "thực đơn": { EN: "menu", type: "Noun" },
  "gọi món": { EN: "to order", type: "Verb" },
  "phở bò": { EN: "beef noodle soup", type: "Noun" },
  "bún chả": { EN: "grilled pork with noodles", type: "Noun" },
  "bánh mì": { EN: "vietnamese sandwich", type: "Noun" },
  "nước suối": { EN: "mineral water", type: "Noun" },
  "khăn lạnh": { EN: "cold towel", type: "Noun" },
  "thanh toán": { EN: "to pay", type: "Verb" },
  "tính tiền": { EN: "check / bill", type: "Verb" },
  "ngon": { EN: "delicious", type: "Adj" },
  "cay": { EN: "spicy", type: "Adj" },
  "dị ứng": { EN: "allergy", type: "Noun" },
  "đặt bàn": { EN: "to book a table", type: "Verb" },
  "người": { EN: "people / person", type: "Noun" },
  "bàn": { EN: "table", type: "Noun" },
  "đợi": { EN: "to wait", type: "Verb" }
};

const LANGUAGES = {
  EN: {
    label: "English",
    ui_welcome: "Welcome to our Restaurant! I'm Linh.",
    ui_start: "BOOK A TABLE",
    ui_placeholder: "Talk to Linh here...",
    ui_status: "Online - Expert",
    ui_learning_title: "Chat with Linh Waitress",
    welcome_msg: "Dạ, em chào Anh! Chào mừng Anh đến với nhà hàng ạ. Anh đi mấy người để em xếp bàn cho mình ạ? ✨ | Hi! Welcome to our restaurant. How many people are in your group so I can arrange a table? ✨",
    systemPromptLang: "English"
  },
  RU: {
    label: "Русский",
    ui_welcome: "Добро пожаловать в наш ресторан!",
    ui_start: "ЗАБРОНИРОВАТЬ",
    ui_placeholder: "Поговори с Линь здесь...",
    ui_status: "Online - Эксперт",
    ui_learning_title: "Trò chuyện với Linh",
    welcome_msg: "Dạ, em chào Anh! Chào mừng Anh đến với nhà hàng ạ. Anh đi mấy người để em xếp bàn cho mình ạ? ✨ | Здравствуйте! Добро пожаловать. Сколько вас человек? ✨",
    systemPromptLang: "Russian"
  }
};

export const GameSpeakAIRestaurant: React.FC<{ character: AIFriend }> = ({ character }) => {
  const [gameState, setGameState] = useState<'start' | 'playing'>('start');
  const [selectedLang, setSelectedLang] = useState<'EN' | 'RU'>('EN');
  const [messages, setMessages] = useState<any[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [activeVoiceId, setActiveVoiceId] = useState<string | null>(null);
  const [speechRate, setSpeechRate] = useState(1.0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef(new Audio());
  const recognitionRef = useRef<any>(null);
  const isProcessingRef = useRef(false);
  const gameContainerRef = useRef<HTMLDivElement>(null);

  const t = LANGUAGES[selectedLang];

  // --- FULLSCREEN LOGIC ---
  useEffect(() => {
    const handleFs = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFs);
    return () => document.removeEventListener('fullscreenchange', handleFs);
  }, []);

  const toggleFullscreen = () => {
    if (!gameContainerRef.current) return;
    if (!document.fullscreenElement) gameContainerRef.current.requestFullscreen();
    else document.exitFullscreen();
  };

  // --- RECOGNITION ---
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = 'vi-VN';
      recognition.onstart = () => setIsRecording(true);
      recognition.onresult = (e: any) => {
        const text = e.results[0][0].transcript;
        handleSendMessage(text, true);
      };
      recognition.onend = () => setIsRecording(false);
      recognitionRef.current = recognition;
    }
  }, []);

  // --- TTS ---
  const speakWord = useCallback(async (text: string, msgId: string | null = null) => {
    if (!text) return;
    if (msgId) setActiveVoiceId(msgId);
    const cleanText = text.split('|')[0].replace(/(\d+)k/g, '$1 nghìn').replace(/[*]/g, '').trim();
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(cleanText)}&tl=vi&client=tw-ob`;
    audioRef.current.src = url;
    audioRef.current.playbackRate = speechRate;
    audioRef.current.play().catch(console.error);
    audioRef.current.onended = () => setActiveVoiceId(null);
  }, [speechRate]);

  // --- AI BRIDGE ---
  const handleSendMessage = async (text: string, fromMic = false) => {
    if (!text.trim() || isProcessingRef.current) return;
    isProcessingRef.current = true;
    setIsThinking(true);

    let processedInput = text.trim();

    // Xử lý lại văn bản từ giọng nói bằng AI chuẩn
    if (fromMic) {
      try {
        const voiceResponse = await generateContentWithRetry({
          model: 'gemini-1.5-flash',
          contents: [{ role: 'user', parts: [{ text: `Sửa lỗi chính tả câu này để nó tự nhiên hơn: "${processedInput}"` }] }],
          config: { systemInstruction: "Bạn là trợ lý sửa văn bản. Chỉ trả về kết quả tiếng Việt sạch, không giải thích, không thêm dấu ngoặc." }
        });
        if (voiceResponse.text) processedInput = voiceResponse.text.trim().replace(/^"|"$/g, '');
      } catch (e) { console.error("Lỗi lọc voice:", e); }
    }

    const userMsgId = `user-${Date.now()}`;
    const newUserMsg = { role: 'user', text: processedInput, id: userMsgId };
    setMessages(prev => [...prev, newUserMsg]);
    setUserInput("");

    // Nhập vai nhân vật Linh qua API chuẩn
    try {
      const response = await generateContentWithRetry({
        model: 'gemini-1.5-flash',
        contents: [...messages, newUserMsg].map(m => ({
          role: m.role === 'ai' ? 'model' : 'user',
          parts: [{ text: m.text.split('|')[0].trim() }]
        })),
        config: {
          systemInstruction: `
            BỐI CẢNH: Bạn tên là Linh (22 tuổi), nhân viên phục vụ nhà hàng chuyên nghiệp.
            NHIỆM VỤ: Chào đón, xếp bàn, lấy món và hỗ trợ khách hàng.
            ĐỊNH DẠNG: Tiếng Việt | Dịch sang ${t.systemPromptLang}.
            QUY TẮC:
            1. Luôn dùng "Dạ", "ạ", xưng "Em" gọi khách là "Anh".
            2. Nếu khách chưa nói số lượng người, hãy hỏi: "Anh đi mấy người ạ?".
            3. Nếu đã có bàn, hỏi: "Anh muốn dùng món gì ạ? Em có thực đơn ở đây".
            4. Phản hồi ngắn gọn, không giải thích dài dòng, không dùng ký tự *.
          `
        }
      });

      if (response.text) {
        const aiMsgId = `ai-${Date.now()}`;
        const cleanAIData = response.text.replace(/[*]/g, '');
        setMessages(prev => [...prev, { role: 'ai', text: cleanAIData, id: aiMsgId }]);
        speakWord(cleanAIData, aiMsgId);
      }
    } catch (e) {
      console.error("AI Error:", e);
    } finally {
      setIsThinking(false);
      isProcessingRef.current = false;
    }
  };

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  // --- INTERACTIVE TEXT ---
  const renderInteractiveText = (text: string) => {
    if (!text) return null;
    const words = text.split(/(\s+)/);
    return words.map((word, idx) => {
      const cleanWord = word.toLowerCase().replace(/[.,!?;]/g, '');
      const entry = DICTIONARY[cleanWord];
      if (entry) {
        return (
          <span key={idx} className="group relative border-b border-dotted border-orange-300 cursor-help text-orange-700 font-bold">
            {word}
            <span className="invisible group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 bg-slate-800 text-white text-[10px] rounded-lg shadow-xl z-50 w-max font-normal">
              {entry.EN}
            </span>
          </span>
        );
      }
      return <span key={idx}>{word}</span>;
    });
  };

  if (gameState === 'start') {
    return (
      <div className="w-full h-full bg-orange-50 flex items-center justify-center p-4">
        <div className="w-full max-w-xl bg-white rounded-[3rem] shadow-2xl p-10 text-center border-[12px] border-orange-100">
          <img src={character.avatarUrl} className="w-40 h-40 mx-auto mb-6 rounded-3xl border-4 border-orange-400 object-cover shadow-lg" />
          <h1 className="text-3xl font-black text-orange-700 mb-2 uppercase italic">Restaurant Mode 🍽️</h1>
          <p className="text-slate-400 mb-8 font-medium italic">{t.ui_welcome}</p>
          <div className="flex flex-col gap-6 items-center">
            <div className="flex gap-3">
              {(['EN', 'RU'] as const).map(l => (
                <button key={l} onClick={() => setSelectedLang(l)} className={`px-8 py-2 rounded-xl font-bold transition-all ${selectedLang === l ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-400'}`}>{l}</button>
              ))}
            </div>
            <button onClick={() => { setGameState('playing'); setMessages([{ role: 'ai', text: t.welcome_msg, id: 'init' }]); speakWord(t.welcome_msg, 'init'); }} 
              className="bg-orange-600 text-white px-16 py-4 rounded-2xl font-black text-xl shadow-xl hover:scale-105 transition-all uppercase tracking-widest">
              {t.ui_start}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={gameContainerRef} className="w-full h-full bg-slate-900 flex flex-col md:flex-row overflow-hidden md:p-4">
      {/* Sidebar: Character & Controls */}
      <div className="h-[20vh] md:h-full md:w-1/3 bg-[#F7F8FA] p-4 flex flex-row md:flex-col items-center justify-between border-r border-slate-100 shrink-0 z-20">
        <div className="flex flex-row md:flex-col items-center gap-4">
          <div className="w-20 h-20 md:w-52 md:h-52 rounded-3xl overflow-hidden border-4 border-white shadow-xl">
            <img src={character.avatarUrl} className="w-full h-full object-cover" />
          </div>
          <div className="text-left md:text-center">
            <h2 className="text-xl font-black text-slate-800 italic">Linh 🍽️</h2>
            <p className="text-[10px] font-black uppercase text-green-500 tracking-widest">{t.ui_status}</p>
          </div>
        </div>
        <button 
          onClick={() => isRecording ? recognitionRef.current?.stop() : recognitionRef.current?.start()}
          className={`w-14 h-14 md:w-20 md:h-20 rounded-full flex items-center justify-center shadow-2xl transition-all ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-orange-600 shadow-orange-200'}`}
        >
          {isRecording ? <MicOff color="white" /> : <Mic color="white" />}
        </button>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 bg-white flex flex-col overflow-hidden relative">
        <div className="px-6 py-4 border-b flex justify-between items-center bg-white shadow-sm z-10">
          <span className="font-black text-orange-600 text-xs uppercase tracking-widest">{t.ui_learning_title}</span>
          <div className="flex gap-2">
            <button onClick={() => setSpeechRate(prev => prev === 1.0 ? 0.7 : 1.0)} className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1">
              <Gauge size={12}/> {speechRate === 1.0 ? 'Normal' : 'Slow'}
            </button>
            <button onClick={toggleFullscreen} className="p-1 text-slate-400 hover:text-orange-600 transition-colors">
              {isFullscreen ? <Minimize size={18}/> : <Maximize size={18}/>}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-orange-50/10 custom-scrollbar">
          {messages.map((msg) => {
            const parts = msg.text.split('|');
            const isActive = activeVoiceId === msg.id;
            return (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-2xl shadow-sm transition-all ${isActive ? 'ring-2 ring-orange-400' : ''} ${msg.role === 'user' ? 'bg-orange-600 text-white rounded-tr-none' : 'bg-white text-slate-800 border border-orange-100 rounded-tl-none'}`}>
                  <div className="text-sm md:text-base font-bold flex items-start gap-4">
                    <span className="flex-1 leading-relaxed">{msg.role === 'ai' ? renderInteractiveText(parts[0]) : msg.text}</span>
                    <button onClick={() => speakWord(msg.text, msg.id)} className="opacity-50 hover:opacity-100 transition-opacity"><Volume2 size={18}/></button>
                  </div>
                  {parts[1] && (
                    <div className={`mt-2 pt-2 border-t text-[11px] italic ${msg.role === 'user' ? 'border-orange-500 text-orange-100' : 'border-slate-50 text-slate-400'}`}>
                      {parts[1]}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {isThinking && (
            <div className="flex items-center gap-2 ml-4">
              <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" />
              <div className="text-[10px] font-black text-orange-400 uppercase tracking-tighter">Linh đang ghi món...</div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="p-4 bg-white border-t flex gap-2 pb-8 md:pb-4 shadow-inner">
          <input 
            type="text" 
            value={userInput} 
            onChange={e => setUserInput(e.target.value)} 
            onKeyDown={e => e.key === 'Enter' && handleSendMessage(userInput)}
            placeholder={t.ui_placeholder} 
            className="flex-1 bg-slate-50 px-4 py-3 rounded-xl outline-none font-bold text-sm border-2 border-transparent focus:border-orange-100 transition-all" 
          />
          <button onClick={() => handleSendMessage(userInput)} className="bg-emerald-500 text-white px-6 rounded-xl shadow-lg active:scale-95 transition-all">
            <Send size={18}/>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameSpeakAIRestaurant;

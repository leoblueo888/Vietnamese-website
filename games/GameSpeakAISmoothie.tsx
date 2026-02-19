import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Send, Volume2, Gauge, Maximize, Minimize, Sparkles } from 'lucide-react';
import type { AIFriend } from '../types';

// Giữ lại Dictionary để người dùng di chuột vẫn học được từ khó
const DICTIONARY: Record<string, { EN: string; type: string }> = {
  "sinh tố": { EN: "smoothie", type: "Noun" },
  "nước ép": { EN: "juice", type: "Noun" },
  "tư vấn": { EN: "to advise", type: "Verb" },
  "thanh lọc": { EN: "detox", type: "Verb" },
  "năng lượng": { EN: "energy", type: "Noun" },
  "đẹp da": { EN: "skin beautifying", type: "Adj" }
};

export const GameSpeakAISmoothie: React.FC<{ character: AIFriend }> = ({ character }) => {
  const [gameState, setGameState] = useState<'start' | 'playing'>('start');
  const [messages, setMessages] = useState<any[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [activeVoiceId, setActiveVoiceId] = useState<string | null>(null);
  const [speechRate, setSpeechRate] = useState(1.0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const isProcessingRef = useRef(false);
  // Thêm audioRef để quản lý Google TTS
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // --- FULLSCREEN ---
  const toggleFullscreen = () => {
    if (!gameContainerRef.current) return;
    if (!document.fullscreenElement) {
      gameContainerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // --- TTS (GOOGLE TRANSLATE ENGINE) ---
  const speakWord = (text: string, msgId: string | null = null) => {
    if (!text || !audioRef.current) return;
    if (msgId) setActiveVoiceId(msgId);
    
    // Dừng âm thanh cũ
    audioRef.current.pause();
    
    // Làm sạch text khỏi ký tự đặc biệt
    const cleanText = text.replace(/[*_`#|]/g, '').trim();
    // Tạo URL Google Translate TTS (Việt Nam)
    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(cleanText)}&tl=vi&client=tw-ob`;
    
    audioRef.current.src = ttsUrl;
    audioRef.current.playbackRate = speechRate;
    audioRef.current.onended = () => setActiveVoiceId(null);
    audioRef.current.play().catch(e => console.error("Audio Play Error:", e));
  };

  // Khởi tạo Audio Engine khi component mount
  useEffect(() => {
    audioRef.current = new Audio();
  }, []);

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

  // --- AI ENGINE ---
  const handleSendMessage = async (text: string, fromMic = false) => {
    if (!text.trim() || isProcessingRef.current) return;
    isProcessingRef.current = true;
    setIsThinking(true);

    // Mồi âm thanh trống để xin quyền Autoplay từ trình duyệt ngay khi user tương tác
    if (audioRef.current) {
        audioRef.current.src = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=";
        audioRef.current.play().catch(() => {});
    }

    let processedInput = text.trim();

    if (fromMic) {
      try {
        const voiceReformResponse = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: `Sửa lỗi chính tả và thêm dấu câu cho câu sau để nó tự nhiên hơn, chỉ trả về kết quả tiếng Việt sạch: "${processedInput}"`,
            systemPrompt: "Bạn là trợ lý sửa lỗi văn bản. Chỉ trả về kết quả đã sửa, không giải thích, không nói thêm gì khác."
          })
        });
        const voiceData = await voiceReformResponse.json();
        if (voiceData.text) processedInput = voiceData.text.trim().replace(/^"|"$/g, '');
      } catch (e) { console.error("Lỗi sửa voice:", e); }
    }

    const userMsgId = `user-${Date.now()}`;
    setMessages(prev => [...prev, { role: 'user', text: processedInput, id: userMsgId }]);
    setUserInput("");

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: processedInput,
          history: messages.map(m => ({ role: m.role === 'ai' ? 'model' : 'user', parts: [{ text: m.text }] })),
          systemPrompt: `
            BỐI CẢNH: Bạn tên là Xuân (22 tuổi), nhân viên tiệm sinh tố sức khỏe.
            NHIỆM VỤ: Tư vấn các loại nước ép, sinh tố tốt cho sức khỏe.
            QUY TẮC CỨNG: 
            1. CHỈ nói tiếng Việt. Tuyệt đối KHÔNG dịch, KHÔNG giải thích tiếng Anh/Nga.
            2. Xưng hô "Em" - "Anh". Dùng từ ngữ tự nhiên, lễ phép (Dạ, ạ).
            3. Trả lời ngắn gọn, tập trung vào việc bán hàng và tư vấn món uống.
            4. Không sử dụng ký tự đặc biệt như dấu sao (*).
          `
        })
      });

      const data = await response.json();
      if (data.text) {
        const cleanText = data.text.split('|')[0].trim().replace(/[*]/g, '');
        const aiMsgId = `ai-${Date.now()}`;
        setMessages(prev => [...prev, { role: 'ai', text: cleanText, id: aiMsgId }]);
        speakWord(cleanText, aiMsgId);
      }
    } catch (e) { console.error("Lỗi AI phản hồi:", e); } finally {
      setIsThinking(false);
      isProcessingRef.current = false;
    }
  };

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  // --- INTERACTIVE TEXT ---
  const renderInteractiveText = (text: string) => {
    const words = text.split(/(\s+)/);
    return words.map((word, idx) => {
      const clean = word.toLowerCase().replace(/[.,!?;]/g, '');
      if (DICTIONARY[clean]) {
        return (
          <span key={idx} className="group relative border-b-2 border-dotted border-emerald-400 cursor-help text-emerald-800 font-bold">
            {word}
            <span className="invisible group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 bg-slate-800 text-white text-[10px] rounded-lg w-max z-50">
              {DICTIONARY[clean].EN}
            </span>
          </span>
        );
      }
      return <span key={idx}>{word}</span>;
    });
  };

  if (gameState === 'start') {
    return (
      <div className="w-full h-full bg-emerald-50 flex items-center justify-center p-4">
        <div className="w-full max-w-xl bg-white rounded-[3rem] shadow-2xl p-10 text-center border-[12px] border-emerald-100">
          <div className="relative w-40 h-40 mx-auto mb-6">
            <img src={character.avatarUrl} className="w-full h-full rounded-full border-4 border-emerald-400 object-cover shadow-lg" />
            <div className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-lg text-emerald-600"><Sparkles size={20}/></div>
          </div>
          <h1 className="text-3xl font-black text-emerald-700 mb-2 uppercase italic">Xuân's Healthy Bar 🥤</h1>
          <p className="text-slate-400 mb-8 font-medium italic">Chuyên gia tư vấn đồ uống sức khỏe</p>
          <button onClick={() => { setGameState('playing'); handleSendMessage("Chào Xuân"); }} 
            className="bg-emerald-600 text-white px-16 py-4 rounded-2xl font-black text-xl shadow-xl hover:scale-105 transition-all uppercase tracking-widest">
            BẮT ĐẦU CHAT
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={gameContainerRef} className="w-full h-full bg-slate-900 flex flex-col md:flex-row overflow-hidden md:p-4">
      <div className="h-[25vh] md:h-full md:w-1/3 bg-white p-4 md:p-8 flex flex-row md:flex-col items-center justify-between border-b md:border-b-0 md:border-r border-slate-100 shrink-0 shadow-2xl z-20">
        <div className="flex flex-row md:flex-col items-center gap-4">
          <img src={character.avatarUrl} className="w-24 h-24 md:w-56 md:h-56 rounded-full border-4 border-emerald-100 object-cover shadow-xl" />
          <div className="text-left md:text-center">
            <h2 className="text-xl md:text-2xl font-black text-slate-800 italic">Xuân 🥤</h2>
            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest animate-pulse">Đang sẵn sàng tư vấn</span>
          </div>
        </div>
        <button onClick={() => isRecording ? recognitionRef.current?.stop() : recognitionRef.current?.start()} 
          className={`w-16 h-16 md:w-24 md:h-24 rounded-full flex items-center justify-center shadow-2xl transition-all ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-emerald-600'}`}>
          {isRecording ? <MicOff size={32} color="white" /> : <Mic size={32} color="white" />}
        </button>
      </div>

      <div className="flex-1 bg-white flex flex-col overflow-hidden relative shadow-inner">
        <div className="px-6 py-4 border-b flex justify-between items-center bg-white z-10">
           <span className="font-black text-emerald-600 text-xs uppercase tracking-widest">Học giao tiếp Tiếng Việt thực tế</span>
           <button onClick={() => setSpeechRate(prev => prev === 1.0 ? 0.7 : 1.0)} className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-full text-[10px] font-black flex items-center gap-2">
             <Gauge size={14}/> {speechRate === 1.0 ? 'TỐC ĐỘ THƯỜNG' : 'TỐC ĐỘ CHẬM'}
           </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 bg-emerald-50/10 custom-scrollbar">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-sm relative transition-all ${activeVoiceId === msg.id ? 'ring-4 ring-emerald-100 scale-[1.01]' : ''} ${msg.role === 'user' ? 'bg-emerald-600 text-white rounded-tr-none' : 'bg-white text-slate-800 border border-emerald-50 rounded-tl-none shadow-md'}`}>
                <div className="text-sm md:text-lg font-bold leading-relaxed flex items-start gap-3">
                  <span className="flex-1">{msg.role === 'ai' ? renderInteractiveText(msg.text) : msg.text}</span>
                  <button onClick={() => speakWord(msg.text, msg.id)} className={`mt-1 p-2 rounded-full transition-colors ${msg.role === 'user' ? 'hover:bg-emerald-500 text-emerald-100' : 'hover:bg-emerald-50 text-emerald-600'}`}>
                    <Volume2 size={20}/>
                  </button>
                </div>
              </div>
            </div>
          ))}
          {isThinking && <div className="text-[10px] font-black text-emerald-400 animate-pulse uppercase tracking-widest italic ml-4">Xuân đang nghe Anh...</div>}
          <div ref={chatEndRef} />
        </div>

        <div className="p-4 md:p-8 bg-white border-t border-slate-50 flex gap-4 pb-12 md:pb-8">
          <input type="text" value={userInput} onChange={e => setUserInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendMessage(userInput)}
            placeholder="Nhắn tin cho Xuân..." className="flex-1 bg-slate-50 px-6 py-4 rounded-2xl outline-none font-bold text-sm border-2 border-transparent focus:border-emerald-100 focus:bg-white transition-all shadow-inner" />
          <button onClick={() => handleSendMessage(userInput)} className="bg-emerald-500 text-white px-8 rounded-2xl shadow-lg hover:bg-emerald-600 transition-all active:scale-95"><Send size={20}/></button>
        </div>
      </div>

      <button onClick={toggleFullscreen} className="absolute bottom-4 right-4 p-3 bg-white/20 rounded-full text-white backdrop-blur-md opacity-30 hover:opacity-100 transition-all z-50">
        {isFullscreen ? <Minimize size={20}/> : <Maximize size={20}/>}
      </button>
    </div>
  );
};

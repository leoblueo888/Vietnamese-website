import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Send, Volume2, Play, Globe, Download, PlayCircle, Gauge } from 'lucide-react';
import { generateContentWithRetry } from '../config/apiKeys';

// ... (giữ nguyên DICTIONARY và các hàm helper)

export const AIfriendLan: React.FC<{ onBack?: () => void, topic?: string | null }> = ({ onBack, topic }) => {
  const [gameState, setGameState] = useState('start'); 
  const [selectedLang, setSelectedLang] = useState('EN'); 
  const [messages, setMessages] = useState<any[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [activeVoiceId, setActiveVoiceId] = useState<string | null>(null);
  const [speechSpeed, setSpeechSpeed] = useState(1.0);
  const [isAudioReady, setIsAudioReady] = useState(false); // Thêm state để kiểm tra audio ready
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const isProcessingRef = useRef(false);
  const silenceTimerRef = useRef<any>(null);
  const audioQueueRef = useRef<string[]>([]); // Queue cho audio segments
  const isPlayingRef = useRef(false);

  const LAN_IMAGE_URL = "https://lh3.googleusercontent.com/d/13mqljSIRC9hvO-snymkzuUiV4Fypqcft";
  const t = getTranslations(topic)[selectedLang as 'EN' | 'RU'];

  // Khởi tạo audio element đúng cách
  useEffect(() => {
    // Tạo audio element với preload
    audioRef.current = new Audio();
    audioRef.current.preload = 'auto';
    
    // Preload một file âm thanh mặc định để kích hoạt audio context
    const initAudio = async () => {
      try {
        // Tạo một âm thanh silent để khởi tạo audio context
        const silentAudio = new Audio();
        silentAudio.src = 'data:audio/mp3;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gTGFTb25vdGhlcXVlLm9yZwBURU5DAAAAHQAAA1N3aXRjaCBQbHVzAAAAAAAAAAAAAAA=';
        await silentAudio.play().catch(() => {}); // Ignore error
        setIsAudioReady(true);
        console.log('Audio system ready');
      } catch (e) {
        console.log('Audio init needs user interaction');
      }
    };

    // Không tự động init, sẽ init khi user click
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Hàm phát âm thanh cải tiến
  const speakWord = async (text: string, msgId: any = null) => {
    if (!text || !audioRef.current) return;
    
    if (msgId) setActiveVoiceId(msgId);
    
    try {
      // Parse text thành segments
      const parts = text.split('|');
      const cleanText = parts[0].replace(/USER_TRANSLATION:.*$/gi, '').replace(/["'*]/g, '').trim();
      
      // Tách câu thành segments (câu hoặc cụm từ)
      const segments = cleanText.split(/([,.!?;:]+)/).reduce((acc: string[], current, idx, arr) => {
        if (idx % 2 === 0) {
          const nextPunct = arr[idx + 1] || "";
          const combined = (current + nextPunct).trim();
          if (combined) acc.push(combined);
        }
        return acc;
      }, []);

      // Nếu không tách được segments, dùng cả câu
      const finalSegments = segments.length > 0 ? segments : [cleanText];

      // Play từng segment
      for (const segment of finalSegments) {
        if (!segment.trim()) continue;
        
        await new Promise<void>(async (resolve) => {
          try {
            // Tạo URL TTS
            const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(segment)}&tl=vi&client=tw-ob`;
            
            // Tạo audio element mới cho mỗi segment để tránh conflict
            const audio = new Audio();
            audio.src = url;
            audio.playbackRate = speechSpeed;
            
            // Xử lý khi audio kết thúc
            audio.onended = () => {
              audio.remove();
              resolve();
            };
            
            audio.onerror = (e) => {
              console.error('Audio error for segment:', segment, e);
              audio.remove();
              resolve(); // Vẫn resolve để tiếp tục segments khác
            };
            
            // Play với user interaction guarantee
            const playPromise = audio.play();
            
            if (playPromise !== undefined) {
              await playPromise.catch(error => {
                console.log('Play prevented, waiting for interaction');
                // Nếu bị chặn, thêm event listener cho user interaction
                const playOnInteraction = async () => {
                  try {
                    await audio.play();
                    document.removeEventListener('click', playOnInteraction);
                  } catch (e) {
                    resolve();
                  }
                };
                document.addEventListener('click', playOnInteraction, { once: true });
                resolve(); // Resolve để không block
              });
            }
            
          } catch (e) {
            console.error('Segment play error:', e);
            resolve();
          }
        });
      }
      
    } catch (e) {
      console.error('Speech error:', e);
    } finally {
      if (msgId) setActiveVoiceId(null);
    }
  };

  // Hàm play toàn bộ conversation với queue
  const playAllMessages = async () => {
    const aiMessages = messages.filter(m => m.role === 'ai');
    for (const msg of aiMessages) {
      await speakWord(msg.text, msg.id);
      // Delay giữa các messages
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  // Sửa lại handleStartGame để đảm bảo audio play được
  const handleStartGame = async () => {
    try {
      // Khởi tạo audio với user interaction
      if (audioRef.current) {
        // Play silent audio để kích hoạt audio context
        const silentAudio = new Audio();
        silentAudio.src = 'data:audio/mp3;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gTGFTb25vdGhlcXVlLm9yZwBURU5DAAAAHQAAA1N3aXRjaCBQbHVzAAAAAAAAAAAAAAA=';
        await silentAudio.play().catch(() => {});
      }
      
      setMessages([{ role: 'ai', text: t.welcome_msg, displayedText: t.welcome_msg, id: 'init' }]);
      setGameState('playing');
      
      // Delay nhỏ để state update
      setTimeout(() => {
        speakWord(t.welcome_msg, 'init');
      }, 100);
      
    } catch (error) {
      console.error('Start game error:', error);
    }
  };

  // Sửa lại handleSendMessage để play audio sau khi nhận response
  const handleSendMessage = useCallback(async (text: string, fromMic = false) => {
    if (!text?.trim() || isProcessingRef.current) return;
    
    isProcessingRef.current = true;
    setIsThinking(true);
    
    let processedInput = text.trim().replace(/["'*]/g, '');
    
    // Xử lý input (giữ nguyên code cũ)
    if (!fromMic) {
      try {
        const prompt = `Detect the language of this message: "${processedInput}". If it's NOT Vietnamese, translate it accurately to Vietnamese. Return ONLY the Vietnamese result text without any quotes, stars, or explanations.`;
        const fixResponse = await generateContentWithRetry({
          model: 'gemini-3-flash-preview', 
          contents: prompt
        });
        const aiResult = fixResponse.text;
        if (aiResult) processedInput = aiResult.trim().replace(/^["'*]+|["'*]+$/g, '');
      } catch (e: any) { 
        console.error("Input processing error:", e);
      }
    }
  
    const userMsgId = `user-${Date.now()}`;
    const newUserMsg = { 
      role: 'user', 
      text: processedInput, 
      displayedText: text.trim(), 
      translation: null, 
      id: userMsgId 
    };

    const currentHistory = [...messages, newUserMsg];
    setMessages(currentHistory);
    setUserInput("");

    try {
      const response = await generateContentWithRetry({
        model: 'gemini-3-flash-preview',
        contents: currentHistory.map(m => ({
          role: m.role === 'ai' ? 'model' : 'user',
          parts: [{ text: (m.text || "").split('|')[0].trim() }]
        })),
        config: { systemInstruction: getSystemPrompt(t.systemPromptLang, topic) }
      });
      
      const rawAiResponse = response.text || "";
      const parts = rawAiResponse.split('|');
      const aiVi = parts[0]?.replace(/USER_TRANSLATION:.*$/gi, '').trim() || "";
      const aiTrans = parts[1]?.replace(/USER_TRANSLATION:.*$/gi, '').trim() || "";
      const userTransMatch = rawAiResponse.match(/USER_TRANSLATION:\s*\[(.*?)\]/is);
      const userTranslationValue = userTransMatch ? userTransMatch[1].trim() : "";
      const cleanDisplay = `${aiVi} | ${aiTrans}`;
      const aiMsgId = `ai-${Date.now()}`;
      const newAiMsg = { 
        role: 'ai', 
        text: cleanDisplay, 
        id: aiMsgId, 
        displayedText: cleanDisplay 
      };

      setMessages(prev => {
        const updated = [...prev];
        const userIdx = updated.findIndex(m => m.id === userMsgId);
        if (userIdx !== -1 && userTranslationValue) {
          updated[userIdx] = { ...updated[userIdx], translation: userTranslationValue };
        }
        return [...updated, newAiMsg];
      });

      // Play audio sau khi có response
      setTimeout(() => {
        speakWord(cleanDisplay, aiMsgId);
      }, 100);

    } catch (error: any) {
      console.error("Gemini Error after all retries:", error);
      const errorMsg = {
        role: 'ai',
        text: "Lan is thinking, please wait a moment! | Lan đang suy nghĩ, bạn chờ chút nhé!",
        displayedText: "Lan is thinking, please wait a moment! | Lan đang suy nghĩ, bạn chờ chút nhé!",
        id: `err-${Date.now()}`
      };
      setMessages(currentMsgs => [...currentMsgs, errorMsg]);
      speakWord(errorMsg.text, errorMsg.id);
      
    } finally {
      setIsThinking(false);
      isProcessingRef.current = false;
    }
  }, [messages, selectedLang, topic, t.systemPromptLang]);

  // Thêm useEffect để focus vào message mới
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Thêm nút Play All trong UI
  const renderAudioControls = () => (
    <div className="flex items-center space-x-1 md:space-x-2">
      <button 
        onClick={cycleSpeechSpeed} 
        className="flex items-center gap-1 bg-slate-100 text-slate-600 px-2 py-1.5 rounded-lg text-[10px] font-black uppercase hover:bg-slate-200 transition-colors"
      >
        <Gauge size={12} /> <span>{Math.round(speechSpeed * 100)}%</span>
      </button>
      
      {/* Nút Play All Messages */}
      <button 
        onClick={playAllMessages}
        className="flex items-center gap-1 bg-sky-100 text-sky-600 px-2 py-1.5 rounded-lg text-[10px] font-black uppercase hover:bg-sky-200 transition-colors"
        title="Play all messages"
      >
        <PlayCircle size={12} /> ALL
      </button>
      
      <button 
        onClick={downloadConversation} 
        className="flex items-center gap-1 bg-slate-100 text-slate-600 p-2 rounded-lg hover:bg-slate-200 transition-colors"
      >
        <Download size={12} />
      </button>
    </div>
  );

  // Thêm nút play cho từng message
  const renderMessage = (msg: any) => {
    const parts = (msg.displayedText || "").split('|');
    
    return (
      <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
        <div className={`max-w-[90%] md:max-w-[85%] p-4 rounded-2xl md:rounded-3xl shadow-sm ${
          msg.role === 'user' 
            ? 'bg-sky-600 text-white' 
            : 'bg-white text-slate-800 border border-slate-100'
        }`}>
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm md:text-base font-bold flex-1">
              {msg.role === 'ai' ? parts[0] : msg.displayedText}
            </p>
            
            {/* Nút play cho từng message AI */}
            {msg.role === 'ai' && (
              <button
                onClick={() => speakWord(msg.text, msg.id)}
                className={`shrink-0 p-1.5 rounded-full transition-colors ${
                  activeVoiceId === msg.id 
                    ? 'bg-sky-500 text-white animate-pulse' 
                    : 'bg-slate-100 text-slate-500 hover:bg-sky-100'
                }`}
                disabled={activeVoiceId === msg.id}
              >
                <Volume2 size={14} />
              </button>
            )}
          </div>
          
          {(msg.role === 'ai' && parts[1]) || (msg.role === 'user' && msg.translation) ? (
            <p className="text-xs italic mt-2 pt-2 border-t border-black/10">
              {msg.role === 'ai' ? parts[1] : msg.translation}
            </p>
          ) : null}
        </div>
      </div>
    );
  };

  // Return UI với các component đã sửa
  return (
    <div className="w-full h-full bg-white md:rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row overflow-hidden border-0 md:border-[10px] border-sky-50 font-sans">
      {/* Sidebar - giữ nguyên */}
      <div className="h-auto md:h-full md:w-1/3 bg-cyan-50/40 p-4 md:p-8 flex flex-row md:flex-col items-center justify-between border-b md:border-b-0 md:border-r border-sky-100 shrink-0">
        <div className="flex flex-row md:flex-col items-center gap-4 md:gap-4 overflow-hidden">
          <div className="relative w-[5.5rem] h-[5.5rem] md:w-48 md:h-48 rounded-full md:rounded-3xl overflow-hidden shadow-xl border-2 md:border-4 border-white bg-white shrink-0">
            <img src={LAN_IMAGE_URL} alt="Lan" className="w-full h-full object-cover" />
            {isThinking && (
              <div className="absolute inset-0 bg-sky-900/20 flex items-center justify-center backdrop-blur-sm">
                <div className="flex space-x-1">
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:-.3s]"></div>
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:-.5s]"></div>
                </div>
              </div>
            )}
          </div>
          <div className="md:mt-6 text-left md:text-center shrink-0">
            <h2 className="text-xl md:text-2xl font-black text-slate-800 italic truncate max-w-[150px] md:max-w-none">
              Lan ✨
            </h2>
            <p className="text-[10px] md:text-[10px] font-bold uppercase tracking-widest text-sky-500">
              Hạ Long City 🌊
            </p>
          </div>
        </div>
        <div className="flex flex-col items-center shrink-0">
          <button 
            onClick={toggleRecording} 
            className={`w-[4.5rem] h-[4.5rem] md:w-24 md:h-24 rounded-full flex items-center justify-center transition-all shadow-lg active:scale-90 ${
              isRecording 
                ? 'bg-red-500 ring-4 md:ring-8 ring-red-100 animate-pulse' 
                : 'bg-sky-500 hover:bg-sky-600'
            }`}
          >
            <Mic size={28} className="md:w-8 md:h-8" color="white" />
          </button>
          <p className="hidden md:block mt-4 font-black text-sky-700 text-[10px] tracking-widest uppercase opacity-60 text-center">
            {isRecording ? t.ui_listening : t.ui_tapToTalk}
          </p>
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
        {/* Header với audio controls mới */}
        <div className="px-4 md:px-6 py-3 border-b border-slate-50 flex items-center justify-between shrink-0 bg-white z-10">
          <div className="flex flex-col">
            <span className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest">
              {t.ui_learning_title}
            </span>
            <div className="flex items-center space-x-1.5 mt-0.5">
              <Globe size={10} className="text-sky-400" />
              <span className="text-[9px] md:text-[10px] font-black text-sky-600 uppercase">
                {t.label}
              </span>
            </div>
          </div>
          
          {/* Audio controls */}
          {renderAudioControls()}
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6 bg-sky-50/10 custom-scrollbar scroll-smooth">
          {messages.map(renderMessage)}
          <div ref={chatEndRef}></div>
        </div>

        {/* Input area */}
        <div className="p-3 md:p-4 border-t border-slate-50 flex gap-2 bg-white">
          <input 
            type="text" 
            value={userInput} 
            onChange={(e) => setUserInput(e.target.value)} 
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(userInput)} 
            placeholder={t.ui_placeholder}
            className="flex-1 px-4 py-3 rounded-xl bg-slate-50 font-medium"
          />
          <button 
            onClick={() => handleSendMessage(userInput)} 
            disabled={isThinking} 
            className="bg-sky-600 text-white px-5 rounded-xl disabled:opacity-50"
          >
            <Send />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIfriendLan;

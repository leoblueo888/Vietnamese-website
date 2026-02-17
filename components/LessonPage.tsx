

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Language } from '../App';
// FIX: Import the generateContentWithRetry function to make it available in this component.
import { generateContentWithRetry } from '../config/apiKeys';

interface LessonPageProps {
  topic: { id: string; name: string; fullName: string; videoUrl: string; thumbnailUrl?: string };
  onBack: () => void;
  scrollToAnchor?: string | null;
  onAnchorScrolled?: () => void;
  language: Language;
}

const VOCAB = [
  { id: "teacher", s: "He is a teacher.", c: "👨‍🏫", p: false },
  { id: "teachers", s: "Those are teachers.", c: "👨‍🏫", p: true },
  { id: "phone", s: "It is a phone.", c: "📱", p: false },
  { id: "dog", s: "It is a dog.", c: "🐶", p: false },
  { id: "dogs", s: "Those are dogs.", c: "🐶", p: true },
  { id: "singer", s: "She is a singer.", c: "👩‍🎤", p: false },
  { id: "laptop", s: "It is a laptop.", c: "💻", p: false },
  { id: "cat", s: "It is a cat.", c: "🐱", p: false },
  { id: "chef", s: "He is a chef.", c: "👨‍🍳", p: false },
  { id: "car", s: "That is a car.", c: "🚗", p: false },
  { id: "elephant", s: "It is an elephant.", c: "🐘", p: false },
  { id: "pilot", s: "He is a pilot.", c: "👨‍✈️", p: false },
  { id: "apple", s: "It is an apple.", c: "🍎", p: false },
  { id: "apples", s: "Those are apples.", c: "🍎", p: true }
];

interface Bubble {
  id: number;
  text: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  isDragging: boolean;
}

export const LessonPage: React.FC<LessonPageProps> = ({ topic, onBack, scrollToAnchor, onAnchorScrolled, language }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([
    { role: 'ai', text: `Hi! I'm your AI tutor. Ask me anything about ${topic.name}!` }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Game States
  const [gameState, setGameState] = useState<'start' | 'playing' | 'review' | 'complete'>('start');
  const [level, setLevel] = useState(1);
  const [round, setRound] = useState(1);
  const [currentSelection, setCurrentSelection] = useState<typeof VOCAB>([]);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [matchedCount, setMatchedCount] = useState(0);
  const [draggingBubbleId, setDraggingBubbleId] = useState<number | null>(null);
  
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const ttsAudioRef = useRef(new Audio());
  const dingBufferRef = useRef<AudioBuffer | null>(null);

  const displayTitle = topic.fullName;
  
  useEffect(() => {
    const startTime = performance.now();
    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyps3xPZ6slbnt5UIK_dVzXRpJP-1r9DHZymBNP6kIcKG-i6kTbFo_NdhMhgqtKW4QX/exec';

    return () => {
      const duration = Math.round((performance.now() - startTime) / 1000);
      if (duration > 5) { // Log only if session is longer than 5 seconds
        const email = localStorage.getItem('userEmail');
        if (email) { // Only log if user is logged in
            const params = new URLSearchParams();
            params.append('action', 'logGame');
            params.append('email', email);
            params.append('gameName', `Grammar Lesson: ${topic.fullName}`);
            params.append('details', `Finished in ${duration}s`);
            
            navigator.sendBeacon(SCRIPT_URL, params);
        }
      }
    };
  }, [topic.fullName]);

  useEffect(() => {
    if (scrollToAnchor) {
        const element = document.getElementById(scrollToAnchor);
        if (element) {
            setTimeout(() => {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                if (onAnchorScrolled) onAnchorScrolled();
            }, 100);
        } else if (onAnchorScrolled) {
            onAnchorScrolled();
        }
    }
  }, [scrollToAnchor, onAnchorScrolled]);

  useEffect(() => {
    // This function loads the ding sound into an AudioBuffer for low-latency playback.
    const loadDingSound = async () => {
      // AudioContext is required for decoding. Initialize it if it doesn't exist.
      if (!audioCtxRef.current) {
        try {
          audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        } catch (e) {
          console.error("Web Audio API is not supported in this browser");
          return;
        }
      }
      
      // If the sound is already loaded, do nothing.
      if (dingBufferRef.current) return;

      try {
        const response = await fetch('https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3');
        const arrayBuffer = await response.arrayBuffer();
        if (audioCtxRef.current) {
            const audioBuffer = await audioCtxRef.current.decodeAudioData(arrayBuffer);
            dingBufferRef.current = audioBuffer;
        }
      } catch (error) {
        console.error('Failed to load ding sound:', error);
      }
    };

    loadDingSound();
  }, []); // Run only once when the component mounts.


  const initAudio = () => {
    if (!audioCtxRef.current) {
       try {
          audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        } catch (e) {
          console.error("Web Audio API is not supported in this browser");
          return;
        }
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  const playDingSound = () => {
    if (!audioCtxRef.current || !dingBufferRef.current) {
      console.warn("Ding sound not ready or AudioContext not initialized.");
      return;
    }
    const source = audioCtxRef.current.createBufferSource();
    source.buffer = dingBufferRef.current;
    source.connect(audioCtxRef.current.destination);
    source.start(0);
  };

  const speak = (text: string) => {
    return new Promise<void>((resolve) => {
      const ttsAudio = ttsAudioRef.current;
      ttsAudio.pause();
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=en-US&client=tw-ob`;
      ttsAudio.src = url;
      
      const onEnded = () => {
        ttsAudio.removeEventListener('ended', onEnded);
        resolve(undefined);
      };
      const onError = (err: any) => {
        console.error("Audio play error:", err);
        ttsAudio.removeEventListener('error', onError);
        resolve(undefined);
      };

      ttsAudio.addEventListener('ended', onEnded);
      ttsAudio.addEventListener('error', onError);
      
      ttsAudio.play().catch(onError);
    });
  };

  const getUniqueSelection = (count: number) => {
    let shuffled = [...VOCAB].sort(() => 0.5 - Math.random());
    let selected: typeof VOCAB = [];
    let usedIds = new Set();
    for (let item of shuffled) {
      if (!usedIds.has(item.id)) {
        selected.push(item);
        usedIds.add(item.id);
      }
      if (selected.length === count) break;
    }
    return selected.length < count ? shuffled.slice(0, count) : selected;
  };

  const initLevel = useCallback(() => {
    initAudio();
    const selection = getUniqueSelection(level);
    setCurrentSelection(selection);
    setMatchedCount(0);
    setGameState('playing');

    // Scatter bubbles more widely
    const newBubbles: Bubble[] = selection.map((item, idx) => ({
      id: idx,
      text: item.s,
      x: 20 + Math.random() * 80,
      y: 100 + Math.random() * 200,
      vx: (Math.random() - 0.5) * 1.5,
      vy: (Math.random() - 0.5) * 1.5,
      width: 0,
      height: 0,
      isDragging: false
    }));
    setBubbles(newBubbles);
  }, [level]);

  // Handle Review Screen Events (Confetti & Speech)
  useEffect(() => {
    let speechTimer: number;
    if (gameState === 'review') {
      if (typeof (window as any).confetti === 'function') {
        (window as any).confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          zIndex: 9999
        });
      }

      const speakInSequence = async () => {
        for (const item of currentSelection) {
          await speak(item.s);
          await new Promise(r => setTimeout(r, 400));
        }
      };

      speechTimer = window.setTimeout(() => speakInSequence(), 800);
    }
    
    if (gameState === 'complete') {
      if (typeof (window as any).confetti === 'function') {
        (window as any).confetti({
          particleCount: 400,
          spread: 160,
          origin: { y: 0.5 },
          zIndex: 9999
        });
      }
    }
    return () => {
      clearTimeout(speechTimer);
      if (ttsAudioRef.current) {
        ttsAudioRef.current.pause();
        ttsAudioRef.current.src = '';
      }
    };
  }, [gameState, currentSelection]);

  useEffect(() => {
    if (gameState === 'playing') {
      const moveBubbles = () => {
        setBubbles(prev => prev.map(b => {
          if (b.isDragging || draggingBubbleId === b.id) return b;
          
          let nextX = b.x + b.vx;
          let nextY = b.y + b.vy;
          let nextVx = b.vx;
          let nextVy = b.vy;

          if (gameAreaRef.current) {
            const rect = gameAreaRef.current.getBoundingClientRect();
            if (nextX <= 0 || nextX >= rect.width - 180) nextVx *= -1;
            if (nextY <= 70 || nextY >= rect.height - 80) nextVy *= -1;
          }

          return { ...b, x: nextX, y: nextY, vx: nextVx, vy: nextVy };
        }));
        animationFrameRef.current = requestAnimationFrame(moveBubbles);
      };
      animationFrameRef.current = requestAnimationFrame(moveBubbles);
    } else {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    }
    return () => { if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current); };
  }, [gameState, draggingBubbleId]);

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent, id: number) => {
    initAudio();
    setDraggingBubbleId(id);
    setBubbles(prev => prev.map(b => b.id === id ? { ...b, isDragging: true } : b));
  };

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (draggingBubbleId === null || !gameAreaRef.current) return;
    
    const rect = gameAreaRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const x = clientX - rect.left - 90; 
    const y = clientY - rect.top - 25; 

    setBubbles(prev => prev.map(b => b.id === draggingBubbleId ? { ...b, x, y } : b));
  };

  const handleDragEnd = () => {
    if (draggingBubbleId === null) return;

    const draggedBubble = bubbles.find(b => b.id === draggingBubbleId);
    if (!draggedBubble) return;

    const dropZones = document.querySelectorAll('.drop-zone');
    
    dropZones.forEach((dz) => {
      const dzRect = dz.getBoundingClientRect();
      const bubbleEl = document.getElementById(`bubble-${draggingBubbleId}`);
      if (!bubbleEl) return;
      
      const bRect = bubbleEl.getBoundingClientRect();
      const isOver = !(bRect.right < dzRect.left || bRect.left > dzRect.right || bRect.bottom < dzRect.top || bRect.top > dzRect.bottom);
      
      const expectedText = dz.getAttribute('data-text');
      if (isOver && expectedText === draggedBubble.text) {
        playDingSound(); 
        dz.innerHTML = `<span class="text-[#065f46] font-black text-center">\${draggedBubble.text}</span>`;
        dz.classList.add('bg-[#ecfdf5]', 'border-[#10b981]', 'border-solid');
        dz.classList.remove('border-dashed');
        
        setBubbles(prev => prev.filter(b => b.id !== draggingBubbleId));
        setMatchedCount(prev => {
          const next = prev + 1;
          if (next === currentSelection.length) {
            setTimeout(() => setGameState('review'), 500);
          }
          return next;
        });
      }
    });

    setDraggingBubbleId(null);
    setBubbles(prev => prev.map(b => ({ ...b, isDragging: false })));
  };

  const handleNextRound = () => {
    ttsAudioRef.current.pause();
    // Allow progression up to Level 4
    if (level >= 4 && round >= 5) {
      setGameState('complete');
    } else {
      if (round < 5) setRound(r => r + 1);
      else { setLevel(l => l + 1); setRound(1); }
      initLevel();
    }
  };

  const handleSendMessage = async (text?: string) => {
    const messageText = text || inputValue;
    if (!messageText.trim()) return;
    setMessages(prev => [...prev, { role: 'user', text: messageText }]);
    setInputValue('');
    try {
      const response = await generateContentWithRetry({
        model: 'gemini-3-flash-preview',
        contents: `Topic: ${topic.fullName}. User Question: ${messageText}`,
        config: { systemInstruction: `You are an expert English tutor. Help the user understand ${topic.name}. Keep answers concise, friendly, and accurate.` }
      });
      setMessages(prev => [...prev, { role: 'ai', text: response.text || "Sorry, I couldn't process that." }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: "Error connecting to AI tutor." }]);
    }
  };

  return (
    <div className="pt-24 md:pt-32 pb-32 bg-white min-h-screen">
      <div className="max-w-[1000px] mx-auto px-6">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-[12px] md:text-[13px] text-slate-400 mb-12 uppercase tracking-widest font-bold">
          <span className="hover:text-[#1e5aa0] cursor-pointer transition-colors" onClick={onBack}>Home</span>
          <span className="text-slate-300">/</span>
          <span className="hover:text-[#1e5aa0] cursor-pointer transition-colors" onClick={onBack}>Learn</span>
          <span className="text-slate-300">/</span>
          <span className="hover:text-[#1e5aa0] cursor-pointer transition-colors" onClick={onBack}>Grammar</span>
          <span className="text-slate-300">/</span>
          <span className="text-slate-800">{topic.name}</span>
        </nav>

        {/* Lesson Title */}
        <div className="mb-12">
          <h1 className="text-[32px] md:text-[56px] font-black text-[#1e293b] leading-tight tracking-tight">
            {displayTitle}
          </h1>
        </div>

        {/* AI Chat Box Section */}
        <div className={`mb-20 transition-all duration-500 ease-in-out ${isExpanded ? 'scale-[1.02]' : 'scale-100'}`}>
          <div className={`bg-[#f8fafc] rounded-[2.5rem] border border-slate-100 flex flex-col shadow-sm transition-all duration-500 overflow-hidden ${isExpanded ? 'min-h-[600px]' : 'min-h-[400px]'}`}>
            <div className="px-6 py-6 bg-white border-b border-slate-50">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setIsRecording(!isRecording)}
                  className={`w-14 h-14 md:w-16 md:h-16 flex-shrink-0 rounded-full flex items-center justify-center transition-all shadow-lg ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-[#ff8a65]'} hover:scale-105 active:scale-95`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 md:h-8 md:w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </button>
                <div className="flex-1 flex items-center bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 transition-all shadow-inner">
                  <input 
                    type="text" 
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Ask your AI tutor a question..."
                    className="flex-1 outline-none text-slate-700 bg-transparent font-medium"
                  />
                  <button onClick={() => handleSendMessage()} className="p-2 text-[#1e5aa0]">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            <div className={`flex-1 overflow-y-auto p-8 space-y-4 custom-scrollbar transition-all duration-500 ${isExpanded ? 'max-h-[500px]' : 'max-h-[250px]'}`}>
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-6 py-3.5 rounded-2xl font-medium shadow-sm ${msg.role === 'user' ? 'bg-[#1e5aa0] text-white rounded-tr-none' : 'bg-white text-slate-700 border border-slate-50 rounded-tl-none'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <div className="bg-white flex justify-center py-4 border-t border-slate-50">
              <button onClick={() => setIsExpanded(!isExpanded)} className="flex items-center gap-2 px-6 py-2 rounded-full text-slate-400">
                <span className="text-[11px] font-black uppercase tracking-widest">{isExpanded ? 'Show less' : 'View more history'}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform duration-500 ${isExpanded ? 'rotate-180' : 'rotate-0'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
            </div>
          </div>
        </div>

        {/* Game Section - Updated for multi-card layout */}
        <div id="game-practice-section" className="pt-16 border-t border-slate-100">
          <div 
            className="bg-[#0f172a] rounded-[3rem] min-h-[700px] relative overflow-hidden shadow-2xl flex flex-col font-sans"
            ref={gameAreaRef}
            onMouseMove={handleDragMove}
            onMouseUp={handleDragEnd}
            onTouchMove={handleDragMove}
            onTouchEnd={handleDragEnd}
          >
            {/* Pro Edition Header */}
            <header className="h-[70px] bg-[#1e293b] border-b-4 border-[#334155] flex items-center justify-between px-8 text-white shrink-0 z-20">
              <div className="font-black text-[22px] md:text-[24px] text-[#3b82f6] italic tracking-wider">
                IDENTIFY THINGS AND PEOPLE
              </div>
              <div className="flex gap-4">
                <div className="border-2 border-[#3b82f6] text-[#60a5fa] font-black text-[12px] md:text-[14px] px-5 py-1.5 rounded-full bg-[#334155]">
                  LEVEL {level}
                </div>
                <div className="border-2 border-[#3b82f6] text-[#60a5fa] font-black text-[12px] md:text-[14px] px-5 py-1.5 rounded-full bg-[#334155]">
                  ROUND {round}/5
                </div>
              </div>
            </header>

            {gameState === 'start' && (
              <div className="flex-1 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in bg-gradient-to-br from-[#1e40af] to-[#7e22ce] p-6">
                <h3 className="text-[40px] md:text-[50px] font-black text-white mb-8 italic drop-shadow-lg uppercase tracking-wider">IDENTIFY THINGS AND PEOPLE</h3>
                <button 
                  onClick={initLevel}
                  className="bg-[#f87171] text-white px-16 py-5 rounded-full font-black text-2xl border-4 border-white shadow-[0_8px_0_#b91c1c] active:translate-y-1 active:shadow-[0_4px_0_#b91c1c] transition-all uppercase"
                >
                  Play Now
                </button>
              </div>
            )}

            {gameState === 'playing' && (
              <div className="flex-1 relative p-6 md:p-10 overflow-hidden flex flex-col items-center justify-center">
                {/* Cards Container - Dynamic grid/flex for side-by-side positioning */}
                <div className="flex flex-wrap justify-center items-center gap-6 md:gap-8 max-w-full">
                  {currentSelection.map((item, idx) => (
                    <div 
                      key={idx} 
                      className={`bg-white p-3 md:p-4 rounded-[2rem] md:rounded-[2.5rem] border-[4px] md:border-[6px] border-[#e2e8f0] ${level >= 3 ? 'w-52 md:w-60' : 'w-72 md:w-80'} shadow-2xl text-center transform transition-all duration-300`}
                    >
                      <div className={`bg-[#f1f5f9] rounded-[1.2rem] md:rounded-[1.5rem] aspect-square flex items-center justify-center ${level >= 3 ? 'text-[60px] md:text-[80px]' : 'text-[100px] md:text-[120px]'} mb-4 md:mb-6 overflow-hidden relative`}>
                        {item.p ? (
                          <div className={`grid grid-cols-2 gap-1 md:gap-2 ${level >= 3 ? 'text-[30px] md:text-[40px]' : 'text-[50px]'}`}>
                            <span>{item.c}</span><span>{item.c}</span>
                            <span>{item.c}</span><span>{item.c}</span>
                          </div>
                        ) : (
                          <span className="scale-110 md:scale-125">{item.c}</span>
                        )}
                      </div>
                      <div 
                        className={`drop-zone border-[2px] md:border-[3px] border-dashed border-[#cbd5e1] bg-[#f8fafc] rounded-xl md:rounded-2xl p-3 md:p-4 font-black text-[#64748b] ${level >= 3 ? 'text-[12px] md:text-[13px]' : 'text-[15px]'} uppercase tracking-tight min-h-[50px] md:min-h-[70px] flex items-center justify-center transition-all duration-300 leading-tight`}
                        data-text={item.s}
                      >
                        {level >= 3 ? 'DROP HERE' : 'PUT SENTENCE HERE'}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Floating Bubbles */}
                {bubbles.map((b) => (
                  <div
                    key={b.id}
                    id={`bubble-\${b.id}`}
                    className={`absolute cursor-grab select-none px-6 py-3 rounded-full border-4 border-[#b45309] font-black text-[17px] md:text-[19px] text-[#451a03] shadow-[0_6px_0_#b45309] active:translate-y-1 active:shadow-[0_2px_0_#b45309] whitespace-nowrap bg-[#fbbf24] \${b.isDragging ? 'z-[100] scale-110' : 'z-10'}`}
                    style={{ left: `\${b.x}px`, top: `\${b.y}px` }}
                    onMouseDown={(e) => handleDragStart(e, b.id)}
                    onTouchStart={(e) => handleDragStart(e, b.id)}
                  >
                    {b.text}
                  </div>
                ))}
              </div>
            )}

            {gameState === 'review' && (
              <div className="absolute inset-0 z-50 bg-slate-900/90 flex items-center justify-center p-6 animate-in fade-in">
                <div className="bg-white rounded-[3rem] p-8 md:p-12 w-full max-w-md text-center border-[8px] border-[#3b82f6] shadow-[0_0_100px_rgba(59,130,246,0.3)]">
                  <h3 className="text-4xl font-black text-[#1e293b] mb-6 uppercase tracking-tighter animate-bounce">PERFECT!</h3>
                  <div className="space-y-3 mb-10">
                    {currentSelection.map((item, idx) => (
                      <div key={idx} className="bg-[#f1f5f9] p-4 rounded-2xl flex items-center justify-between border-2 border-[#e2e8f0] hover:bg-white transition-colors">
                        <span className="font-black text-[#1e293b] text-[18px]">{item.s}</span>
                        <button 
                          onClick={() => speak(item.s)}
                          className="w-12 h-12 bg-[#3b82f6] text-white rounded-full flex items-center justify-center shadow-[0_4px_0_#1d4ed8] active:translate-y-1 active:shadow-none text-xl hover:scale-110 transition-transform"
                        >
                          🔊
                        </button>
                      </div>
                    ))}
                  </div>
                  <button 
                    onClick={handleNextRound}
                    className="w-full bg-[#f87171] text-white py-5 rounded-full font-black text-xl border-4 border-white shadow-[0_8px_0_#b91c1c] active:translate-y-1 active:shadow-[0_4px_0_#b91c1c] transition-all uppercase"
                  >
                    Next Round
                  </button>
                </div>
              </div>
            )}

            {gameState === 'complete' && (
              <div className="flex-1 flex flex-col items-center justify-center text-center animate-in zoom-in bg-gradient-to-br from-[#1e40af] to-[#7e22ce] p-10">
                <h3 className="text-[60px] font-black text-[#facc15] mb-4 drop-shadow-xl uppercase">VICTORY!</h3>
                <p className="text-white text-[20px] mb-12 font-medium opacity-90">Amazing job, you are a master!</p>
                <button 
                  onClick={() => { setLevel(1); setRound(1); setGameState('start'); }}
                  className="bg-[#f87171] text-white px-16 py-6 rounded-full font-black text-2xl border-4 border-white shadow-[0_10px_0_#b91c1c] uppercase"
                >
                  Play Again
                </button>
              </div>
            )}
          </div>
          
          <div className="mt-16 flex justify-center">
             <button 
               onClick={onBack}
               className="text-slate-400 hover:text-[#1e5aa0] font-black text-sm uppercase tracking-[0.2em] transition-colors"
             >
               ← Quay lại danh sách bài học
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

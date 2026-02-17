
import React, { useState, useEffect, useRef } from 'react';
import { ViewType, Language } from '../App';
import { AIfriendLan } from './AIfriendLan';
import { AInewfriendThu } from './AInewfriendThu';
import { AInewfriendMai } from './AInewfriendMai';
import { Maximize, Minimize } from 'lucide-react';
import type { AIFriend } from '../types';

interface AIFriendDetailProps {
  character: AIFriend;
  onBack: () => void;
  onNavigate: (view: ViewType, data?: any) => void;
  language: Language;
  topic?: string | null;
  credit: number;
  setCredit: (updater: (prevCredit: number) => number) => void;
}

const SCRIPT_URL_LOG = 'https://script.google.com/macros/s/AKfycbynsNqD7SXnIaT1l3hyha0f0jitvMRChE9k37QGfbEW2ExGzJB6_g8n6sqcKV1pT4Ha/exec';

const getTheme = (name: string) => {
  switch (name) {
    case 'Lan':
      return { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', accent: 'text-blue-600' };
    case 'Thu':
      return { bg: 'bg-white', border: 'border-orange-200', text: 'text-orange-800', accent: 'text-orange-600' };
    case 'Mai':
      return { bg: 'bg-white', border: 'border-amber-200', text: 'text-amber-800', accent: 'text-amber-600' };
    default:
      return { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-800', accent: 'text-slate-600' };
  }
};

export const GameAIFriendDetail: React.FC<AIFriendDetailProps> = ({ character, onBack, onNavigate, language, topic, credit, setCredit }) => {
  const theme = getTheme(character.name);
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const creditIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    // Log activity on start
    const email = localStorage.getItem('userEmail');
    if (email) {
        const params = new URLSearchParams();
        params.append('action', 'logActivity');
        params.append('email', email);
        params.append('game_name', `AI Friend: ${character.name}`);
        params.append('start_time', new Date().toISOString());
        fetch(SCRIPT_URL_LOG, { method: 'POST', body: params, keepalive: true }).catch(console.error);
    }

    // Start real-time credit countdown
    creditIntervalRef.current = window.setInterval(() => {
        setCredit(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    // Cleanup on unmount
    return () => {
        if (creditIntervalRef.current) {
            clearInterval(creditIntervalRef.current);
        }
        // Final sync on exit is handled by App.tsx's `beforeunload` event
    };
  }, [character.name, setCredit]);

  const handleFullscreenChange = () => {
    setIsFullscreen(!!document.fullscreenElement);
  };

  useEffect(() => {
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    const elem = gameContainerRef.current;
    if (elem) {
        if (!document.fullscreenElement) {
            elem.requestFullscreen().catch(err => {
                alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
            });
        } else {
            document.exitFullscreen();
        }
    }
  };

  const renderGame = () => {
    switch (character.name) {
      case 'Lan':
        return <AIfriendLan onBack={onBack} topic={topic} />;
      case 'Thu':
        return <AInewfriendThu onBack={onBack} topic={topic} />;
      case 'Mai':
        return <AInewfriendMai onBack={onBack} topic={topic} />;
      default:
        return <div>AI Character game not configured for this lesson.</div>;
    }
  };
  
  return (
    <div className={`pt-24 md:pt-32 pb-32 min-h-screen transition-colors duration-500 ${theme.bg}`}>
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-[13px] text-slate-400 mb-12 uppercase tracking-widest font-bold">
          <span className="hover:text-[#1e5aa0] cursor-pointer transition-colors" onClick={() => onNavigate('home')}>Home</span>
          <span className="text-slate-300">/</span>
          <span className="hover:text-[#1e5aa0] cursor-pointer transition-colors" onClick={() => onNavigate('home')}>Learn</span>
          <span className="text-slate-300">/</span>
          <span className="hover:text-[#1e5aa0] cursor-pointer transition-colors" onClick={onBack}>AI Friends</span>
          <span className="text-slate-300">/</span>
          <span className={theme.text}>{character.name}</span>
        </nav>

        {/* Page Title */}
        <div className="flex justify-between items-center mb-16">
          <h1 className={`text-[40px] md:text-[56px] font-black leading-[1.1] tracking-tight ${theme.text}`}>
            Practice with {character.name}
          </h1>
          <button onClick={onBack} className={`hidden md:inline-block bg-white px-6 py-3 rounded-full font-bold text-sm border hover:shadow-lg transition-all ${theme.border} ${theme.accent}`}>
            ← Back to List
          </button>
        </div>
        
        {/* Game Container */}
        <div ref={gameContainerRef} className={`w-full aspect-[9/16] md:aspect-video bg-white rounded-2xl shadow-2xl border-4 ${theme.border} flex items-center justify-center overflow-hidden relative`}>
            {renderGame()}
            <button 
                onClick={toggleFullscreen}
                className="absolute bottom-2 right-2 z-[999] p-2 bg-black/20 text-white/70 rounded-full backdrop-blur-sm shadow-md opacity-10 hover:opacity-100 hover:bg-black/40 transition-all duration-300"
                aria-label="Toggle fullscreen"
                title="Toggle fullscreen"
            >
                {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
            </button>
        </div>

        <div className="mt-16 flex justify-center md:hidden">
           <button onClick={onBack} className={`bg-white px-8 py-4 rounded-full font-bold text-base border-2 hover:shadow-lg transition-all ${theme.border} ${theme.accent}`}>
            ← Back to List
          </button>
        </div>
      </div>
    </div>
  );
};

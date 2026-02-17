
import React, { useEffect, useRef, useState } from 'react';
import { PronunciationUnit } from './PronunciationPage';
import { GameVowelTone } from '../games/GameVowelTone';
import { GameDiphthongTone } from '../games/GameDiphthongTone';
import { GameConsonantVowelTone } from '../games/GameConsonantVowelTone';
import { GameConsonantDiphthongTone } from '../games/GameConsonantDiphthongTone';
import { GameVowelConsonant } from '../games/GameVowelConsonant';
import { GameDiphthongConsonant } from '../games/GameDiphthongConsonant';
import { Maximize, Minimize } from 'lucide-react';
import { Language } from '../App';
import { translations } from '../translations';
import Pronunciationtrainer1 from '../games/Pronunciationtrainer1';
import Pronunciationtrainer2 from '../games/Pronunciationtrainer2';

interface PronunciationLessonPageProps {
  unit: PronunciationUnit;
  onBack: () => void;
  scrollToAnchor?: string | null;
  onAnchorScrolled?: () => void;
  language: Language;
}

export const PronunciationLessonPage: React.FC<PronunciationLessonPageProps> = ({ unit, onBack, scrollToAnchor, onAnchorScrolled, language }) => {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const t = translations[language];

  useEffect(() => {
    const startTime = performance.now();
    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxzrjpM8XAN2ktEW19NS87T_x5NlYNYjWt9srSu5XHfTw9IV_mCzrkWhPP8C1EBPC7Y/exec';

    return () => {
      const duration = Math.round((performance.now() - startTime) / 1000);
      if (duration > 5) { // Log only if session is longer than 5 seconds
        const email = localStorage.getItem('userEmail');
        if (email) { // Only log if user is logged in
            const params = new URLSearchParams();
            params.append('action', 'logGame');
            params.append('email', email);
            params.append('section', 'Pronunciation');
            params.append('gameName', unit.title);
            params.append('duration', `${duration}s`);
            
            navigator.sendBeacon(SCRIPT_URL, params);
        }
      }
    };
  }, [unit.title]);

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

  const handleFullscreenChange = () => {
    setIsFullscreen(!!document.fullscreenElement);
  };

  useEffect(() => {
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleFullscreen = () => {
    if (gameContainerRef.current) {
      if (!document.fullscreenElement) {
        gameContainerRef.current.requestFullscreen().catch(err => {
          alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
        });
      } else {
        document.exitFullscreen();
      }
    }
  };

  const renderGame = () => {
    switch(unit.id) {
        case 'pro_1':
            return <Pronunciationtrainer1 />;
        case 'pro_2':
            return <Pronunciationtrainer2 />;
        case 'pro_3':
            return <GameVowelTone />;
        case 'pro_4':
            return <GameDiphthongTone />;
        case 'pro_5':
            return <GameConsonantVowelTone />;
        case 'pro_6':
            return <GameConsonantDiphthongTone />;
        case 'pro_7':
            return <GameVowelConsonant />;
        case 'pro_8':
            return <GameDiphthongConsonant />;
        default:
            return null;
    }
  };

  const gameComponent = renderGame();

  if (!gameComponent) {
    return (
        <div className="pt-24 md:pt-32 pb-32 bg-white min-h-screen">
          <div className="max-w-[1000px] mx-auto px-6 text-center">
             <h1 className="text-4xl font-bold mt-20">Game Not Found</h1>
             <p className="text-slate-500 mt-4">The selected game could not be loaded.</p>
             <button onClick={onBack} className="mt-8 px-6 py-3 bg-indigo-600 text-white rounded-lg font-bold">Back to Lessons</button>
          </div>
        </div>
    );
  }
  
  return (
      <div className="pt-24 md:pt-32 pb-32 bg-white min-h-screen">
          <div className="max-w-[1200px] mx-auto px-6">
              <nav className="flex items-center gap-2 text-[12px] md:text-[13px] text-slate-400 mb-12 uppercase tracking-widest font-bold">
                  <span className="hover:text-[#1e5aa0] cursor-pointer transition-colors" onClick={onBack}>{t.pages.pronunciation}</span>
                  <span className="text-slate-300">/</span>
                  <span className="text-slate-800">{unit.title}</span>
              </nav>
              <div className="mb-12">
                  <h1 className="text-[32px] md:text-[56px] font-black text-[#1e293b] leading-tight tracking-tight">{unit.title}</h1>
              </div>
              
              <div id="game-practice-section">
                  <div ref={gameContainerRef} className="relative bg-[#0F172A] rounded-3xl overflow-hidden shadow-2xl border border-slate-200 h-[85vh]">
                      {gameComponent}
                      <button 
                          onClick={handleFullscreen}
                          className="absolute bottom-2 right-2 z-[999] p-2 bg-black/10 text-white/40 rounded-full backdrop-blur-sm shadow-md opacity-20 hover:opacity-100 hover:bg-black/40 transition-all duration-300"
                          aria-label="Toggle fullscreen"
                          title="Toggle fullscreen"
                      >
                          {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
                      </button>
                  </div>
              </div>
          </div>
      </div>
  );
};

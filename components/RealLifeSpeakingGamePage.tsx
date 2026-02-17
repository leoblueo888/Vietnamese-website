
import React, { useRef, useState, useEffect } from 'react';
import { SpeakingUnit } from './SpeakingPage';
import { Language, ViewType } from '../App';
import { GameSmoothieSpeaking } from '../games/GameSmoothieSpeaking';
import { GameBuyFruits } from '../games/GameBuyFruits';
import { Maximize, Minimize } from 'lucide-react';
import { GameBuyVegetables } from '../games/GameBuyVegetables';
import { GameAtRestaurant } from '../games/GameAtRestaurant';
import { GameMeatSeafood } from '../games/GameMeatSeafood';

const GameSpeakingRealLifePlaceholder: React.FC<{ unit: SpeakingUnit }> = ({ unit }) => {
    return (
        <div className="w-full h-full flex items-center justify-center bg-slate-800 text-white p-8">
            <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">Speaking Challenge</h2>
                <p className="text-slate-400">A unique challenge for "{unit.title}" is coming soon.</p>
            </div>
        </div>
    );
};

interface RealLifeSpeakingGamePageProps {
  unit: SpeakingUnit;
  onBack: () => void;
  language: Language;
}

export const RealLifeSpeakingGamePage: React.FC<RealLifeSpeakingGamePageProps> = ({ unit, onBack, language }) => {
  const t = {
    en: { speaking: 'Speaking', rls: 'Real-life Situations', sg: 'Speaking Game' },
    ru: { speaking: 'Разговор', rls: 'Реальные ситуации', sg: 'Разговорная игра' }
  }[language];

  const gameWrapperRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const startTime = performance.now();
    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxzrjpM8XAN2ktEW19NS87T_x5NlYNYjWt9srSu5XHfTw9IV_mCzrkWhPP8C1EBPC7Y/exec';

    return () => {
      const duration = Math.round((performance.now() - startTime) / 1000);
      if (duration > 5) { // Log only meaningful sessions
        const email = localStorage.getItem('userEmail');
        if (email) { // Only log if user is logged in
          const params = new URLSearchParams();
          params.append('action', 'logGame');
          params.append('email', email);
          params.append('section', 'Speaking');
          params.append('gameName', `Real Life Game: ${unit.title}`);
          params.append('duration', `${duration}s`);
          navigator.sendBeacon(SCRIPT_URL, params);
        }
      }
    };
  }, [unit.title]);

  const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
  };

  useEffect(() => {
      document.addEventListener('fullscreenchange', handleFullscreenChange);
      return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
      const elem = gameWrapperRef.current;
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
    if (unit.id === 'buySmoothie') {
        return <GameSmoothieSpeaking />;
    }
    if (unit.id === 'buyFruits') {
        return <GameBuyFruits />;
    }
    if (unit.id === 'buyVeggies') {
        return <GameBuyVegetables />;
    }
    if (unit.id === 'atRestaurant') {
        return <GameAtRestaurant />;
    }
    if (unit.id === 'buyMeat') {
        return <GameMeatSeafood />;
    }
    return <GameSpeakingRealLifePlaceholder unit={unit} />;
  };

  return (
    <div className="pt-24 md:pt-32 pb-32 bg-white min-h-screen">
      <div className="max-w-[1200px] mx-auto px-6">
        <nav className="flex items-center gap-2 text-[13px] text-slate-400 mb-12 uppercase tracking-widest font-bold flex-wrap">
          <span className="hover:text-[#1e5aa0] cursor-pointer transition-colors" onClick={onBack}>
            {t.speaking}
          </span>
          <span className="text-slate-300">/</span>
          <span className="hover:text-[#1e5aa0] cursor-pointer transition-colors" onClick={onBack}>
            {t.rls}
          </span>
          <span className="text-slate-300">/</span>
          <span className="hover:text-[#1e5aa0] cursor-pointer transition-colors" onClick={onBack}>
            {unit.title}
          </span>
          <span className="text-slate-300">/</span>
          <span className="text-slate-800">{t.sg}</span>
        </nav>
        
        <div ref={gameWrapperRef} className="w-full max-w-5xl mx-auto aspect-[9/16] md:aspect-video relative overflow-hidden rounded-3xl shadow-2xl border border-slate-200">
          {renderGame()}
          <button 
              onClick={toggleFullscreen} 
              title="Toggle Fullscreen" 
              className="absolute bottom-2 right-2 bg-black/10 text-white/40 p-1.5 rounded-full backdrop-blur-sm hover:bg-black/30 hover:text-white/70 transition-all opacity-20 hover:opacity-100 z-50"
          >
              {isFullscreen ? <Minimize size={14} /> : <Maximize size={14} />}
          </button>
        </div>
      </div>
    </div>
  );
};

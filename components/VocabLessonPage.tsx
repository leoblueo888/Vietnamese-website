
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { VocabUnit } from './VocabularyPage';
import { Language, ViewType } from '../App';
import { translations } from '../translations';
import { GameVocabularyPronouns } from '../games/GameVocabularyPronouns';
import { GameVocabularyNumbers } from '../games/GameVocabularyNumbers';
import { GameVocabularyTimePhrases } from '../games/GameVocabularyTimePhrases';
import GameVocabularyVerbNews from '../games/GameVocabularyVerbNews';
import GameVocabularyQuestionWord from '../games/GameVocabularyQuestionWord';
import { GameTetWishes } from '../games/GameTetWishes';
import { GameRealLifeFamily } from '../games/GameRealLifeFamily';
import { Maximize, Minimize } from 'lucide-react';
import Vietnameseverb2 from '../games/Vietnameseverb2';
import VietnameseConjunctions from '../games/VietnameseConjunctions';
import VietnameseAdjectives from '../games/VietnameseAdjectives';
import { VocabModalVerbnew } from '../games/VocabModalVerbnew';

interface VocabLessonPageProps {
  unit: VocabUnit;
  onBack: () => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onNavigate: (view: ViewType, data?: any) => void;
  scrollToAnchor?: string | null;
  onAnchorScrolled?: () => void;
}

const VocabLessonPlaceholder: React.FC<{ unit: VocabUnit; language: Language }> = ({ unit, language }) => {
    const titleText = {
        en: `Learn ${unit.title} Vocabulary`,
        ru: `Изучение лексики "${unit.title}"`
    }[language];

    return (
        <div>
            <div className="text-center mb-16 max-w-3xl mx-auto">
                <h1 className="text-[40px] md:text-[56px] font-black text-[#1e293b] leading-[1.1] tracking-tight mb-6">
                    {titleText}
                </h1>
            </div>
            <div className="w-full max-w-4xl mx-auto aspect-[9/16] md:aspect-video bg-slate-800 rounded-2xl md:rounded-3xl shadow-2xl border border-slate-700 flex items-center justify-center p-8 text-white">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Game Coming Soon!</h2>
                    <p className="text-slate-400">An interactive game for "{unit.title}" is under construction.</p>
                </div>
            </div>
        </div>
    );
};


export const VocabLessonPage: React.FC<VocabLessonPageProps> = ({ unit, onBack, language, onLanguageChange, onNavigate, scrollToAnchor, onAnchorScrolled }) => {
  const gameWrapperRef = useRef<HTMLDivElement>(null);
  const gameWrapper2Ref = useRef<HTMLDivElement>(null);
  const [fullscreenElement, setFullscreenElement] = useState<Element | null>(null);
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
            params.append('section', 'Vocabulary');
            params.append('gameName', unit.title);
            params.append('duration', `${duration}s`);
            
            navigator.sendBeacon(SCRIPT_URL, params);
        }
      }
    };
  }, [unit.title]);

  const handleFullscreenChange = () => {
      setFullscreenElement(document.fullscreenElement);
  };

  useEffect(() => {
      document.addEventListener('fullscreenchange', handleFullscreenChange);
      return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = (ref: React.RefObject<HTMLDivElement>) => {
      const elem = ref.current;
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
  
    if (unit.id === 'pronouns') {
        return <GameVocabularyPronouns unit={unit} onBack={onBack} language={language} />;
    }

    // Special layout for Verbs
    if (unit.id === 'verb-news') {
        const titleText = { en: `Learn ${unit.title}`, ru: `Изучение "${unit.title}"` }[language];
        return (
            <div className="pt-24 md:pt-32 pb-32 bg-white min-h-screen">
                <div className="max-w-[1200px] mx-auto px-6">
                    <nav className="flex items-center gap-2 text-[12px] md:text-[13px] text-slate-400 mb-12 uppercase tracking-widest font-bold">
                        <span className="hover:text-[#1e5aa0] cursor-pointer transition-colors" onClick={onBack}>{t.pages.vocabulary}</span>
                        <span className="text-slate-300">/</span>
                        <span className="text-slate-800">{unit.title}</span>
                    </nav>
                    <div className="text-center mb-16 max-w-3xl mx-auto">
                        <h1 className="text-[40px] md:text-[56px] font-black text-[#1e293b] leading-[1.1] tracking-tight mb-6">
                            {titleText}
                        </h1>
                    </div>
                    {/* First game */}
                    <div ref={gameWrapperRef} className="w-full max-w-5xl mx-auto aspect-[9/16] md:aspect-video relative overflow-hidden rounded-3xl shadow-2xl border border-slate-200 bg-slate-100">
                        <GameVocabularyVerbNews />
                        <button onClick={() => toggleFullscreen(gameWrapperRef)} title="Toggle Fullscreen" className="absolute bottom-2 right-2 bg-black/10 text-white/40 p-1.5 rounded-full backdrop-blur-sm hover:bg-black/30 hover:text-white/70 transition-all opacity-20 hover:opacity-100 z-50">
                            {fullscreenElement === gameWrapperRef.current ? <Minimize size={14} /> : <Maximize size={14} />}
                        </button>
                    </div>

                    {/* Title for second game */}
                    <div className="text-center mt-16 mb-8">
                        <h2 className="text-4xl font-black text-slate-800">Vietnamese Verb 2</h2>
                    </div>

                    {/* Second (new) game frame */}
                    <div ref={gameWrapper2Ref} className="w-full max-w-5xl mx-auto aspect-[9/16] md:aspect-video relative overflow-hidden rounded-3xl shadow-2xl border border-slate-200 bg-slate-100">
                        <Vietnameseverb2 />
                        <button 
                          onClick={() => toggleFullscreen(gameWrapper2Ref)} 
                          title="Toggle Fullscreen" 
                          className="absolute bottom-2 right-2 bg-black/10 text-white/40 p-1.5 rounded-full backdrop-blur-sm hover:bg-black/30 hover:text-white/70 transition-all opacity-20 hover:opacity-100 z-50"
                        >
                            {fullscreenElement === gameWrapper2Ref.current ? <Minimize size={14} /> : <Maximize size={14} />}
                        </button>
                    </div>
                </div>
            </div>
        );
    }
    
    // Standard layout for other units
    const gameUnits = [
        'family', 'tetHoliday', 'question-word', 'time-phrases',
        'modal-verbs', 'numbers', 'adjectives-2', 'conjunctions-2'
    ];

    if (gameUnits.includes(unit.id)) {
        const titleText = {
            en: `Learn ${unit.title}`,
            ru: `Изучение "${unit.title}"`
        }[language];

        const renderGame = () => {
            switch(unit.id) {
                case 'family': return <GameRealLifeFamily />;
                case 'tetHoliday': return <GameTetWishes />;
                case 'question-word': return <GameVocabularyQuestionWord />;
                case 'time-phrases': return <GameVocabularyTimePhrases />;
                case 'modal-verbs': return <VocabModalVerbnew />;
                case 'numbers': return <GameVocabularyNumbers />;
                case 'adjectives-2': return <VietnameseAdjectives />;
                case 'conjunctions-2': return <VietnameseConjunctions />;
                default: return <VocabLessonPlaceholder unit={unit} language={language} />;
            }
        };

        return (
            <div className="pt-24 md:pt-32 pb-32 bg-white min-h-screen">
                <div className="max-w-[1200px] mx-auto px-6">
                    <nav className="flex items-center gap-2 text-[12px] md:text-[13px] text-slate-400 mb-12 uppercase tracking-widest font-bold">
                        <span className="hover:text-[#1e5aa0] cursor-pointer transition-colors" onClick={onBack}>{t.pages.vocabulary}</span>
                        <span className="text-slate-300">/</span>
                        <span className="text-slate-800">{unit.title}</span>
                    </nav>
                    <div className="text-center mb-16 max-w-3xl mx-auto">
                        <h1 className="text-[40px] md:text-[56px] font-black text-[#1e293b] leading-[1.1] tracking-tight mb-6">
                            {titleText}
                        </h1>
                    </div>
                    <div ref={gameWrapperRef} className="w-full max-w-5xl mx-auto aspect-[9/16] md:aspect-video relative overflow-hidden rounded-3xl shadow-2xl border border-slate-200 bg-slate-100">
                        {renderGame()}
                        <button 
                          onClick={() => toggleFullscreen(gameWrapperRef)} 
                          title="Toggle Fullscreen" 
                          className="absolute bottom-2 right-2 bg-black/10 text-white/40 p-1.5 rounded-full backdrop-blur-sm hover:bg-black/30 hover:text-white/70 transition-all opacity-20 hover:opacity-100 z-50"
                        >
                            {fullscreenElement === gameWrapperRef.current ? <Minimize size={14} /> : <Maximize size={14} />}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

  return (
    <div className="pt-24 md:pt-32 pb-32 bg-white min-h-screen">
      <div className="max-w-[1000px] mx-auto px-6">
        <nav className="flex items-center gap-2 text-[12px] md:text-[13px] text-slate-400 mb-12 uppercase tracking-widest font-bold">
          <span className="hover:text-[#1e5aa0] cursor-pointer transition-colors" onClick={onBack}>{t.pages.vocabulary}</span>
          <span className="text-slate-300">/</span>
          <span className="text-slate-800">{unit.title}</span>
        </nav>
        <VocabLessonPlaceholder unit={unit} language={language} />
      </div>
    </div>
  );
};

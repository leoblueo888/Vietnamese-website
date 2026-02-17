
import React, {useEffect, useRef} from 'react';
import { Language, ViewType } from '../App';
import { SpeakingUnit } from './SpeakingPage';
import { getAIFriends } from '../constants';
// FIX: AIFriend type should be imported from the central types.ts file, not from another component.
import type { AIFriend } from '../types';

import { AIfriendLan } from '../games/AIfriendLan';
import { AInewfriendThu } from '../games/AInewfriendThu';
import { AInewfriendMai } from '../games/AInewfriendMai';
import { GameSpeakAIRestaurant } from '../games/GameSpeakAIRestaurant';
import { HanhAIfruitseller } from '../games/HanhAIfruitseller';
import { GameSpeakAIVegetables } from '../games/GameSpeakAIVegetables';
import { GameSpeakAIMeatSeafood } from '../games/GameSpeakAIMeatSeafood';
import { GameSpeakAISmoothie } from '../games/GameSpeakAISmoothie';

interface RealLifeAIChatPageProps {
  unit: SpeakingUnit;
  character: AIFriend;
  onBack: () => void;
  language: Language;
  credit: number;
  setCredit: (updater: (prevCredit: number) => number) => void;
}

export const RealLifeAIChatPage: React.FC<RealLifeAIChatPageProps> = ({ unit, character, onBack, language, credit, setCredit }) => {
  const t = {
    en: { speaking: 'Speaking', rls: 'Real-life Situations', aiChat: `Speak with AI Seller` },
    ru: { speaking: 'Разговор', rls: 'Реальные ситуации', aiChat: `Разговор с ИИ-продавцом` }
  }[language];

  useEffect(() => {
    const startTime = performance.now();

    return () => {
      const durationInSeconds = Math.round((performance.now() - startTime) / 1000);
      if (durationInSeconds > 1 && credit > 0) {
          setCredit(prevCredit => Math.max(0, prevCredit - durationInSeconds));
      }
    };
  }, [setCredit, credit]);

  const renderAIChat = () => {
    // The user requested to remove the games for these specific lessons to make way for new ones.
    const unitsToClear: string[] = [];
    if (unitsToClear.includes(unit.id)) {
        // Return an empty container as requested.
        return <div className="w-full h-full bg-slate-200"></div>;
    }

    if (unit.id === 'buySmoothie' && character.name === 'Xuân') {
      return <GameSpeakAISmoothie character={character} />;
    }

    if (unit.id === 'buyFruits' && character.name === 'Hạnh') {
      return <HanhAIfruitseller character={character} />;
    }
    
    if (unit.id === 'buyVeggies' && character.name === 'Phương') {
      return <GameSpeakAIVegetables character={character} />;
    }

    if (unit.id === 'buyMeat' && character.name === 'Thanh') {
      return <GameSpeakAIMeatSeafood character={character} />;
    }

    if (unit.id === 'atRestaurant' && character.name === 'Linh') {
      return <GameSpeakAIRestaurant character={character} />;
    }

    // Fallback to other character games if needed, though the current flow for other
    // real-life situations doesn't lead here yet.
    switch(character.name) {
      case 'Lan': return <AIfriendLan onBack={onBack} />;
      case 'Thu': return <AInewfriendThu onBack={onBack} />;
      case 'Mai': return <AInewfriendMai onBack={onBack} />;
      default: 
        return <div>AI Character game not configured for this lesson.</div>;
    }
  };

  return (
    <div className="pt-24 md:pt-32 pb-32 bg-white min-h-screen">
      <div className="max-w-[1200px] mx-auto px-6">
        <nav className="flex items-center gap-2 text-[13px] text-slate-400 mb-12 uppercase tracking-widest font-bold flex-wrap">
          <span className="hover:text-[#1e5aa0] cursor-pointer transition-colors">{t.speaking}</span>
          <span className="text-slate-300">/</span>
          <span className="hover:text-[#1e5aa0] cursor-pointer transition-colors" onClick={onBack}>{t.rls}</span>
          <span className="text-slate-300">/</span>
          <span className="hover:text-[#1e5aa0] cursor-pointer transition-colors" onClick={onBack}>{unit.title}</span>
          <span className="text-slate-300">/</span>
          <span className="text-slate-800">{t.aiChat}</span>
        </nav>
        
        <div className="w-full max-w-5xl mx-auto aspect-[9/16] md:aspect-video relative overflow-hidden rounded-3xl shadow-2xl border border-slate-200 bg-slate-100">
          {renderAIChat()}
        </div>
      </div>
    </div>
  );
};

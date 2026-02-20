import React, {useEffect} from 'react';
import { Language } from '../App';
import { SpeakingUnit } from './SpeakingPage';
import type { AIFriend } from '../types';

// CHỈ IMPORT NHỮNG GAME ĐANG CÓ TRONG THƯ MỤC /GAMES
import { AIfriendLan } from '../games/AIfriendLan';
import { AInewfriendThu } from '../games/AInewfriendThu';
import { AInewfriendMai } from '../games/AInewfriendMai';
import { GameSpeakAIRestaurant } from '../games/GameSpeakAIRestaurant';
import { HanhAIfruitseller } from '../games/HanhAIfruitseller';
import { GameSpeakAIMeatSeafood } from '../games/GameSpeakAIMeatSeafood';
import { GameSpeakAISmoothie } from '../games/GameSpeakAISmoothie';
import { GameSpeakAIVegetables } from '../games/GameSpeakAIVegetables';

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
    if (unit.id === 'buySmoothie' && character.name === 'Xuân') return <GameSpeakAISmoothie character={character} />;
    if (unit.id === 'buyFruits' && character.name === 'Hạnh') return <HanhAIfruitseller character={character} />;
    // ĐÃ XÓA DÒNG GAME VEGETABLES Ở ĐÂY
    if (unit.id === 'buyMeat' && character.name === 'Thanh') return <GameSpeakAIMeatSeafood character={character} />;
    if (unit.id === 'atRestaurant' && character.name === 'Linh') return <GameSpeakAIRestaurant character={character} />;

    switch(character.name) {
      case 'Lan': return <AIfriendLan onBack={onBack} />;
      case 'Thu': return <AInewfriendThu onBack={onBack} />;
      case 'Mai': return <AInewfriendMai onBack={onBack} />;
      default: return <div className="p-10 text-center text-slate-500">Game đang được cập nhật...</div>;
    }
  };

  return (
    <div className="pt-24 md:pt-32 pb-32 bg-white min-h-screen">
      <div className="max-w-[1200px] mx-auto px-6">
        <nav className="flex items-center gap-2 text-[13px] text-slate-400 mb-12 uppercase tracking-widest font-bold flex-wrap">
          <span className="hover:text-[#1e5aa0] cursor-pointer" onClick={onBack}>{t.speaking}</span>
          <span className="text-slate-300">/</span>
          <span className="hover:text-[#1e5aa0] cursor-pointer" onClick={onBack}>{t.rls}</span>
          <span className="text-slate-300">/</span>
          <span className="text-slate-800">{unit.title}</span>
        </nav>
        <div className="w-full max-w-5xl mx-auto aspect-[9/16] md:aspect-video relative overflow-hidden rounded-3xl shadow-2xl border border-slate-200 bg-slate-100">
          {renderAIChat()}
        </div>
      </div>
    </div>
  );
};

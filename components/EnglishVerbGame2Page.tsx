import React from 'react';
import { VerbGame2 } from './VerbGame2';

interface EnglishVerbGame2PageProps {
  onBack: () => void;
}

export const EnglishVerbGame2Page: React.FC<EnglishVerbGame2PageProps> = ({ onBack }) => {
  return (
    <div className="pt-24 md:pt-32 pb-32 bg-white min-h-screen">
      <div className="max-w-[1200px] mx-auto px-6">
        <nav className="flex items-center gap-2 text-[12px] md:text-[13px] text-slate-400 mb-12 uppercase tracking-widest font-bold">
          <span className="hover:text-[#1e5aa0] cursor-pointer transition-colors" onClick={onBack}>Common Verbs</span>
          <span className="text-slate-300">/</span>
          <span className="text-slate-800">English Verb 2 Game</span>
        </nav>
        <div className="mb-12">
          <h1 className="text-[32px] md:text-[56px] font-black text-[#1e293b] leading-tight tracking-tight">
            Game: Vocabulary Game
          </h1>
        </div>
        <div className="relative w-full flex justify-center">
            <VerbGame2 />
        </div>
      </div>
    </div>
  );
};

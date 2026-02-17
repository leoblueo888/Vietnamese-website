
import React from 'react';
import { GameUnit } from './GamePage';

interface PlaceholderGamePageProps {
  game: GameUnit;
  onBack: () => void;
}

export const PlaceholderGamePage: React.FC<PlaceholderGamePageProps> = ({ game, onBack }) => {
  return (
    <div className="pt-24 md:pt-32 pb-32 bg-white min-h-screen">
      <div className="max-w-[1000px] mx-auto px-6">
        <nav className="flex items-center gap-2 text-[12px] md:text-[13px] text-slate-400 mb-12 uppercase tracking-widest font-bold">
          <span className="hover:text-[#1e5aa0] cursor-pointer transition-colors" onClick={onBack}>Games</span>
          <span className="text-slate-300">/</span>
          <span className="text-slate-800">{game.title}</span>
        </nav>
        <div className="mb-12">
          <h1 className="text-[32px] md:text-[56px] font-black text-[#1e293b] leading-tight tracking-tight">{game.title}</h1>
        </div>

        <div className="bg-slate-50 rounded-[3rem] min-h-[500px] p-8 text-center flex flex-col items-center justify-center border border-slate-100">
          <h3 className="text-4xl font-black text-slate-800 mb-6">Game Coming Soon!</h3>
          <p className="text-slate-500 mb-8 max-w-md">
            The interactive game "{game.title}" is currently under development and will be available to play very soon.
          </p>
          <button 
            onClick={onBack}
            className="bg-[#1e5aa0] text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-blue-800 transition-all"
          >
            Back to Games
          </button>
        </div>
      </div>
    </div>
  );
};

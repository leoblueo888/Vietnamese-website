
import React from 'react';
import { Language } from '../App';
import { translations } from '../translations';

interface LearningSectionsProps {
  language: Language;
  onGrammarClick?: () => void;
  onSpeakingClick?: () => void;
  onPronunciationClick?: () => void;
  onVocabularyClick?: () => void;
}

export const LearningSections: React.FC<LearningSectionsProps> = ({ language, onGrammarClick, onSpeakingClick, onPronunciationClick, onVocabularyClick }) => {
  const t = translations[language].learningSections;

  const boxes = [
    { key: 'speaking', title: t.speaking_title, icon: '👤', desc: t.speaking_desc, bgColor: 'bg-[#eff6ff]', accent: 'text-blue-600', image: 'https://lh3.googleusercontent.com/d/1lCmBMbueKzmymTGqraiZoLI27Lwo-X0c', onClick: onSpeakingClick },
    { key: 'grammar', title: t.grammar_title, icon: '📚', desc: t.grammar_desc, bgColor: 'bg-[#fefce8]', accent: 'text-yellow-600', image: 'https://lh3.googleusercontent.com/d/1Hhgp9IXTsVZ41aqMWNXHzEnO_REUTWhL', onClick: onGrammarClick },
    { key: 'vocabulary', title: t.vocabulary_title, icon: '📖', desc: t.vocabulary_desc, bgColor: 'bg-[#fdf2f8]', accent: 'text-pink-600', image: 'https://lh3.googleusercontent.com/d/18Znzc7dPN2W269kfo93o2LZBAfNyABRv', onClick: onVocabularyClick },
    { key: 'pronunciation', title: t.pronunciation_title, icon: '🎤', desc: t.pronunciation_desc, bgColor: 'bg-[#faf5ff]', accent: 'text-purple-600', image: 'https://lh3.googleusercontent.com/d/1MFFmTmaRq4ICRDq_QLNqBW3PU9Mgu88T', onClick: onPronunciationClick }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-[1300px] mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-[42px] md:text-[64px] font-black text-[#1e293b] tracking-tight mb-4">
            {t.title}
          </h2>
          <div className="w-12 h-1.5 bg-[#ff8a65] mx-auto rounded-full"></div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10">
          {boxes.map((box) => (
            <div 
              key={box.key}
              className={`${box.bgColor} p-6 md:p-8 rounded-[2.5rem] border border-slate-50 flex flex-col sm:flex-row items-center gap-6 md:gap-10 transition-all hover:shadow-xl hover:-translate-y-1 cursor-pointer h-full md:min-h-[320px] group`}
              onClick={box.onClick}
            >
              {/* Card Image */}
              <div className="w-full sm:w-[40%] aspect-square rounded-[2rem] overflow-hidden shrink-0 shadow-[0_15px_30px_-10px_rgba(0,0,0,0.15)] bg-white border-4 border-white">
                <img src={box.image} alt={box.title} className="w-full h-full object-cover" />
              </div>
              
              {/* Text Content */}
              <div className="flex-1 text-left">
                <div className="flex items-center gap-4 mb-3">
                  <span className={`text-[36px] md:text-[42px] leading-none opacity-80`}>
                    {box.icon}
                  </span>
                  <h3 className="text-[24px] md:text-[30px] font-black text-[#1e293b] leading-tight">
                    {box.title}
                  </h3>
                </div>
                <p className="text-slate-500 text-[15px] md:text-[17px] leading-relaxed mb-6">
                  {box.desc}
                </p>
                <button className={`font-bold text-[15px] flex items-center gap-2 ${box.accent}`}>
                  {t.explore} {box.title} <span className="group-hover:translate-x-1 transition-transform">→</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

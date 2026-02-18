import React, { useEffect } from 'react';
import { getGrammarLevels } from '../constants';
import { GrammarASA } from '../games/GrammarASA';
import { GrammarAQB } from '../games/GrammarAQB';
import { GrammarLSA } from '../games/GrammarLSA';
import { GrammarLQA } from '../games/GrammarLQA';
import { Language } from '../App';
import { translations } from '../translations';
import { Lock } from 'lucide-react';

export interface Topic {
  id: string;
  name: string;
  fullName: string;
  image: string;
  overlayColor: string;
  videoUrl: string;
  thumbnailUrl?: string;
}

const GrammarCard: React.FC<{ level: any; onClick: () => void; lang: Language }> = ({ level, onClick, lang }) => {
  const t = translations[lang].grammarPage;
  return (
    <div 
      onClick={onClick}
      className={`${level.color} p-10 rounded-[2.5rem] border ${level.borderColor} flex flex-col sm:flex-row items-start gap-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group relative overflow-hidden`}
    >
      <div className="relative w-24 h-32 flex-shrink-0 bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 p-1.5 self-center sm:self-start">
         <div className={`absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-black text-white ${level.accentColor.replace('text', 'bg')}`}>
           {level.badge}
         </div>
         <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-slate-50 rounded-lg">
            <div className="w-12 h-8 relative rounded-md overflow-hidden shadow-sm border border-gray-100">
                <div className="absolute inset-0 bg-[#003897]"></div>
                <div className="absolute top-1/2 left-0 w-full h-[8px] -translate-y-1/2 bg-white"></div>
                <div className="absolute left-[13px] top-0 w-[8px] h-full bg-white"></div>
                <div className="absolute top-1/2 left-0 w-full h-[4px] -translate-y-1/2 bg-[#D72828]"></div>
                <div className="absolute left-[15px] top-0 w-[4px] h-full bg-[#D72828]"></div>
            </div>
            <div className="flex flex-col gap-1.5 w-full px-3">
                <div className="h-1.5 w-full bg-slate-200 rounded-full"></div>
                <div className="h-1.5 w-[80%] bg-slate-200 rounded-full"></div>
                <div className="h-1.5 w-[60%] bg-slate-200 rounded-full"></div>
            </div>
         </div>
      </div>

      <div className="flex-1 flex flex-col justify-center h-full">
        <h3 className="text-2xl md:text-3xl font-black text-[#1e293b] mb-3">{level.title}</h3>
        <p className="text-slate-500 text-[15px] md:text-16px leading-relaxed mb-4">
          {level.description}
        </p>
        <div className={`mt-auto font-bold text-sm flex items-center gap-2 ${level.accentColor}`}>
           {t.learnMore} <span className="group-hover:translate-x-1 transition-transform">→</span>
        </div>
      </div>
    </div>
  );
};

const TopicCard: React.FC<{ topic: Topic; onSelect: () => void }> = ({ topic, onSelect }) => {
  return (
    <div 
      onClick={onSelect}
      className="group flex flex-col bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-lg transition-all cursor-pointer"
    >
      <div className="relative aspect-[16/10] w-full bg-slate-100 overflow-hidden">
        <img 
          src={topic.image} 
          alt={topic.name} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className={`absolute top-4 left-1/2 -translate-x-1/2 px-6 py-2 rounded-xl ${topic.overlayColor} backdrop-blur-[2px] border border-white/50 shadow-sm`}>
           <span className="text-slate-800 font-black text-center block text-sm tracking-tight whitespace-nowrap">
             {topic.name}
           </span>
        </div>
      </div>

      <div className="p-6 md:p-8 bg-[#f8fafc] flex flex-col justify-between flex-grow">
        <h4 className="text-[17px] md:text-[19px] font-bold text-slate-700 leading-snug mb-6 pr-4">
          {topic.fullName}
        </h4>
        <div className="self-end text-slate-300 group-hover:text-blue-600 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </div>
      </div>
    </div>
  );
};

const LevelDetailView: React.FC<{ level: any; onBack: () => void; onSelectTopic: (topic: Topic) => void }> = ({ level, onBack, onSelectTopic }) => {
  useEffect(() => {
    const startTime = performance.now();
    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxzrjpM8XAN2ktEW19NS87T_x5NlYNYjWt9srSu5XHfTw9IV_mCzrkWhPP8C1EBPC7Y/exec';

    return () => {
      const duration = Math.round((performance.now() - startTime) / 1000);
      if (duration > 5) {
        const email = localStorage.getItem('userEmail');
        if (email) {
            const params = new URLSearchParams();
            params.append('action', 'logGame');
            params.append('email', email);
            params.append('section', 'Grammar');
            params.append('gameName', level.title);
            params.append('duration', `${duration}s`);
            navigator.sendBeacon(SCRIPT_URL, params);
        }
      }
    };
  }, [level.title]);

  return (
    <div className="max-w-[1200px] mx-auto px-6">
      <div className="mb-12 text-center">
        <h1 className="text-4xl md:text-[52px] font-black text-[#1e293b] mb-12">
          {level.title}
        </h1>
      </div>

      <div className="my-12 max-w-4xl mx-auto">
          <div className="relative w-full portrait:aspect-[9/16] landscape:aspect-video rounded-lg shadow-md overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 max-h-[100vh]">
              {level.badge === 'ASA' ? (
                <GrammarASA />
              ) : level.badge === 'AQA' ? (
                <GrammarAQB />
              ) : level.badge === 'LSA' ? (
                <GrammarLSA />
              ) : level.badge === 'LQA' ? (
                <GrammarLQA />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                    <p className="text-slate-400 font-semibold text-lg animate-pulse">
                        Game Ngữ Pháp đang được tải...
                    </p>
                </div>
              )}
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {level.topics && level.topics.map((topic: Topic) => (
          <TopicCard key={topic.id} topic={topic} onSelect={() => onSelectTopic(topic)} />
        ))}
      </div>
    </div>
  );
};

interface GrammarPageProps {
  language: Language;
  focusedLevel?: string | null;
  onNavigateBack: () => void;
  onSelectLevel: (levelCode: string) => void;
  onSelectTopic: (topic: Topic) => void;
  isGuest: boolean;
  onOpenAuthModal: () => void;
}

export const GrammarPage: React.FC<GrammarPageProps> = ({ language, focusedLevel, onNavigateBack, onSelectLevel, onSelectTopic, isGuest, onOpenAuthModal }) => {
  const t = translations[language];
  const grammarLevels = getGrammarLevels(language);
  const currentLevel = grammarLevels.find(l => l.badge === focusedLevel);
  const freeLevelsForGuest = ['ASA', 'AQA']; 

  return (
    <div className="pt-24 md:pt-32 pb-32 bg-white min-h-screen">
      <div className="max-w-[1200px] mx-auto px-6">
        <nav className="flex items-center gap-2 text-[13px] text-slate-400 mb-12 uppercase tracking-widest font-bold">
          <span className="hover:text-[#1e5aa0] cursor-pointer transition-colors" onClick={onNavigateBack}>{t.pages.home}</span>
          <span className="text-slate-300">/</span>
          <span className="hover:text-[#1e5aa0] cursor-pointer transition-colors" onClick={onNavigateBack}>{t.pages.learn}</span>
          <span className="text-slate-300">/</span>
          <span className={`transition-colors cursor-pointer ${focusedLevel ? 'hover:text-[#1e5aa0]' : 'text-slate-800'}`} onClick={onNavigateBack}>{t.pages.grammar}</span>
          {focusedLevel && (
            <>
              <span className="text-slate-300">/</span>
              <span className="text-slate-800">{currentLevel?.badge} - {currentLevel?.title}</span>
            </>
          )}
        </nav>
      </div>

      {currentLevel ? (
        <LevelDetailView level={currentLevel} onBack={onNavigateBack} onSelectTopic={onSelectTopic} />
      ) : (
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h1 className="text-[40px] md:text-[56px] font-black text-[#1e293b] leading-[1.1] tracking-tight mb-6">
              {t.grammarPage.title}
            </h1>
            <div className="w-16 h-2 bg-[#ff8a65] mx-auto rounded-full"></div>
          </div>
          
          <div className="mb-20 max-w-5xl mx-auto">
              <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl border border-slate-100">
                  <img 
                      src="https://drive.google.com/thumbnail?id=1iIjVjZcbz_Y5zoaxTaP-fSqukBB8pyXL&sz=w1200" 
                      alt="Grammar learning banner" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                  />
              </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {grammarLevels.map((level) => {
              const isLockedUI = isGuest && !freeLevelsForGuest.includes(level.badge);
              
              return (
                 <div 
                  key={level.badge} 
                  className="relative"
                  onClick={() => onSelectLevel(level.badge)} 
                >
                  <GrammarCard 
                    level={level} 
                    onClick={() => {}} 
                    lang={language}
                  />
                  {isLockedUI && (
                    <div className="absolute top-6 right-6 bg-white/90 p-3 rounded-full shadow-lg pointer-events-none z-10">
                        <Lock size={20} className="text-slate-400" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  );
};

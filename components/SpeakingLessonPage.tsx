
import React, { useState, useEffect, useRef } from 'react';
import { SpeakingUnit } from './SpeakingPage';
import { ViewType, Language } from '../App';
import { translations } from '../translations';
import { getAIFriends } from '../constants';


interface SpeakingLessonPageProps {
  unit: SpeakingUnit;
  onBack: () => void;
  onNavigate: (view: ViewType, data?: any) => void;
  scrollToAnchor?: string | null;
  onAnchorScrolled?: () => void;
  language: Language;
}

export const SpeakingLessonPage: React.FC<SpeakingLessonPageProps> = ({ unit, onBack, onNavigate, scrollToAnchor, onAnchorScrolled, language }) => {
  const t = translations[language];
  const aiFriends = getAIFriends(language);

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
  
  const getFriendCardClass = (name: string) => {
    switch (name) {
      case 'Lan':
        return 'bg-blue-100 border-blue-200';
      case 'Thu':
        return 'bg-emerald-100 border-emerald-200';
      case 'Mai':
        return 'bg-orange-100 border-orange-200';
      default:
        return 'bg-white border-slate-100';
    }
  };

  return (
    <div className="pt-24 md:pt-32 pb-32 bg-white min-h-screen">
      <div className="max-w-[1000px] mx-auto px-6">
        <nav className="flex items-center gap-2 text-[12px] md:text-[13px] text-slate-400 mb-12 uppercase tracking-widest font-bold">
          <span className="hover:text-[#1e5aa0] cursor-pointer transition-colors" onClick={onBack}>{t.pages.speaking}</span>
          <span className="text-slate-300">/</span>
          <span className="text-slate-800">{unit.title}</span>
        </nav>
        <div className="mb-12">
          <h1 className="text-[32px] md:text-[56px] font-black text-[#1e293b] leading-tight tracking-tight">{unit.title}</h1>
        </div>

        {/* Practice Game Section */}
        <div id="game-practice-section">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
            {/* Speaking Challenge Game Frame */}
            <div 
                onClick={() => onNavigate('speaking-challenge-game', unit)}
                className="bg-slate-800 rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center h-full min-h-[300px] group transition-all hover:shadow-2xl hover:-translate-y-2 cursor-pointer"
            >
                <h3 className="text-white font-black text-3xl mb-3">{t.speakingLessonPage.speakingChallengeTitle}</h3>
                <p className="text-slate-400 mb-8 max-w-xs">{t.speakingLessonPage.speakingChallengeDesc}</p>
                <button 
                    className="bg-slate-700 group-hover:bg-slate-600 text-white px-8 py-3 rounded-full font-bold text-base transition-all shadow-lg"
                >
                    {t.speakingLessonPage.startChallenge}
                </button>
            </div>

            {/* Make Question Game Frame */}
            <div 
                onClick={() => onNavigate('make-question-game', unit)}
                className="bg-amber-600 rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center h-full min-h-[300px] group transition-all hover:shadow-2xl hover:-translate-y-2 cursor-pointer"
            >
                <h3 className="text-white font-black text-3xl mb-3">{t.speakingLessonPage.makeQuestionTitle}</h3>
                <p className="text-amber-100 mb-8 max-w-xs">{t.speakingLessonPage.makeQuestionDesc}</p>
                <button 
                    className="bg-amber-700 group-hover:bg-amber-800 text-white px-8 py-3 rounded-full font-bold text-base transition-all shadow-lg"
                >
                    {t.speakingLessonPage.startPractice}
                </button>
            </div>
          </div>

          {/* AI Friends Section */}
          <div className="pt-16 border-t border-slate-100">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-black text-[#1e293b] leading-tight tracking-tight">{t.speakingLessonPage.aiFriendsTitle}</h2>
              <p className="text-lg text-slate-500 mt-4 max-w-2xl mx-auto">{t.speakingLessonPage.aiFriendsDesc}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {aiFriends.map(friend => (
                <div 
                    key={friend.name} 
                    onClick={() => onNavigate('ai-friend-detail', { character: friend, topic: unit.title })}
                    className={`p-6 rounded-3xl border flex flex-col items-center text-center shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group ${getFriendCardClass(friend.name)}`}
                >
                    <img src={friend.avatarUrl} alt={friend.name} className="w-24 h-24 rounded-full mb-4 shadow-md object-cover" />
                    <h4 className="text-xl font-bold text-slate-800">{friend.name}</h4>
                    <p className="text-sm text-slate-500 mt-2 mb-6 flex-grow">{friend.description}</p>
                    <button className="w-full bg-white text-slate-700 px-6 py-3 rounded-full font-bold text-sm border border-slate-200 transition-all group-hover:bg-slate-50 group-hover:shadow-md">
                        {t.speakingLessonPage.startConversation}
                    </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

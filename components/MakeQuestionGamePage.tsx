
import React, {useEffect} from 'react';
import { SpeakingUnit } from './SpeakingPage';
import { GameSocialMakeQuestion } from '../games/GameSocialMakeQuestion';
import { GameMakeQuestionMeetingFriends } from '../games/GameMakeQuestionMeetingFriends';
import { GameMoviesMakeQuestion } from '../games/GameMoviesMakeQuestion';
import { GameMusicMakeQuestion } from '../games/GameMusicMakeQuestion';
import { GameAIMakeQuestion } from '../games/GameAIMakeQuestion';
import { GameBeachMakeQuestion } from '../games/GameBeachMakeQuestion';
import { GameFoodMakeQuestion } from '../games/GameFoodMakeQuestion';
import { GameSportsMakeQuestion } from '../games/GameSportsMakeQuestion';
import { GameStudiesMakeQuestion } from '../games/GameStudiesMakeQuestion';
import { GameTravelingMakeQuestion } from '../games/GameTravelingMakeQuestion';
import { GameJobMakeQuestion } from '../games/GameJobMakeQuestion';
import { GameFamilyMakeQuestion } from '../games/GameFamilyMakeQuestion';
import { Language } from '../App';
import { translations } from '../translations';

interface MakeQuestionGamePageProps {
  unit: SpeakingUnit;
  onBack: () => void;
  language: Language;
}

export const MakeQuestionGamePage: React.FC<MakeQuestionGamePageProps> = ({ unit, onBack, language }) => {
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
            params.append('section', 'Speaking');
            params.append('gameName', `Make Question: ${unit.title}`);
            params.append('duration', `${duration}s`);
            
            navigator.sendBeacon(SCRIPT_URL, params);
        }
      }
    };
  }, [unit.title]);

  const getUnitTitle = (unit: SpeakingUnit) => {
    const keyMap: Record<string, keyof typeof t.speakingUnits> = {
      'meetingFriends': 'meetingFriends_title',
      'family': 'family_title',
      'job': 'job_title',
      'studies': 'studies_title',
      'sports': 'sports_title',
      'food': 'food_title',
      'beach': 'beach_title',
      'ai': 'ai_title',
      'traveling': 'traveling_title',
      'music': 'music_title',
      'movies': 'movies_title',
      'social': 'social_title'
    };
    const unitKey = keyMap[unit.id];
    return unitKey ? t.speakingUnits[unitKey] : unit.title;
  };

  const unitTitle = getUnitTitle(unit);

  const getGameWrapperStyle = (unitId: string): string => {
    switch(unitId) {
      case 'social': return "bg-amber-600 border-amber-500";
      case 'movies': return "bg-amber-600 border-amber-500";
      case 'music': return "bg-indigo-900 border-indigo-800";
      case 'ai': return "bg-indigo-900 border-indigo-800";
      case 'beach': return "bg-sky-600 border-sky-500";
      case 'food': return "bg-amber-600 border-amber-500";
      case 'sports': return "bg-emerald-800 border-emerald-700";
      case 'studies': return "bg-indigo-600 border-indigo-500";
      case 'traveling': return "bg-blue-600 border-blue-500";
      case 'job': return "bg-slate-800 border-slate-700";
      case 'family': return "bg-rose-600 border-rose-500";
      default: return "bg-slate-900 border-slate-700";
    }
  };

  const renderGame = () => {
    switch (unit.id) {
      case 'meetingFriends': return <GameMakeQuestionMeetingFriends />;
      case 'family': return <GameFamilyMakeQuestion />;
      case 'job': return <GameJobMakeQuestion />;
      case 'traveling': return <GameTravelingMakeQuestion />;
      case 'studies': return <GameStudiesMakeQuestion />;
      case 'sports': return <GameSportsMakeQuestion />;
      case 'food': return <GameFoodMakeQuestion />;
      case 'beach': return <GameBeachMakeQuestion />;
      case 'ai': return <GameAIMakeQuestion />;
      case 'music': return <GameMusicMakeQuestion />;
      case 'movies': return <GameMoviesMakeQuestion />;
      case 'social': return <GameSocialMakeQuestion />;
      default:
        return <p className="text-amber-100 font-bold text-center">A unique challenge for "{unitTitle}" is coming soon.</p>;
    }
  };

  return (
    <div className="pt-24 md:pt-32 pb-32 bg-white min-h-screen">
      <div className="max-w-[1200px] mx-auto px-6">
        <nav className="flex items-center gap-2 text-[12px] md:text-[13px] text-slate-400 mb-12 uppercase tracking-widest font-bold flex-wrap">
          <span className="hover:text-[#1e5aa0] cursor-pointer transition-colors" onClick={onBack}>{t.pages.speaking}</span>
          <span className="text-slate-300">/</span>
          <span className="hover:text-[#1e5aa0] cursor-pointer transition-colors" onClick={onBack}>{unitTitle}</span>
          <span className="text-slate-300">/</span>
          <span className="text-slate-800">{t.pages.makeQuestion}</span>
        </nav>
        <div className="w-full flex justify-center">
            <div className={`w-full max-w-md md:max-w-4xl aspect-[9/16] md:aspect-video relative overflow-hidden rounded-2xl md:rounded-3xl shadow-2xl border ${getGameWrapperStyle(unit.id)}`}>
              {renderGame()}
            </div>
        </div>
      </div>
    </div>
  );
};

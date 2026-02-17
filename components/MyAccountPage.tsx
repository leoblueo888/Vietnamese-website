
import React, { useState, useEffect } from 'react';
import { getProfileData, resetProfileData, getCurrentGuestId } from '../services/userProfileService';
import { Language } from '../App';
import { translations } from '../translations';

// --- Type Definitions for User Profile Data ---
interface Topic {
  id: string;
  title: string;
  status: 'Mastered' | 'Unlocked' | 'Locked';
  newWords: number;
  keyPhrases: number;
}

interface AiConnection {
  id: string;
  name: string;
  age: number;
  avatarUrl: string;
  fluencyLevel: number;
}

interface CorrectionItem {
  id: string;
  said: string;
  correct: string;
}

interface CorrectedItem {
  id: string;
  phrase: string;
}

interface PronunciationItem {
  word: string;
  score: number;
}

interface UserProfileData {
    user: {
        name: string;
        avatarUrl: string;
        membershipStatus: string;
    };
    performance: {
        totalSpeakingTime: number;
        overallPronunciationScore: number;
        topicsCompleted: number;
        totalTopics: number;
    };
    topics: Topic[];
    aiConnections: AiConnection[];
    correctionCenter: {
        uncorrected: CorrectionItem[];
        corrected: CorrectedItem[];
    };
    pronunciationDeepDive: PronunciationItem[];
    aiMemoryVault: string[];
}


interface MyAccountPageProps {
  onBack: () => void;
  language: Language;
}

const getPronunciationColor = (score: number) => {
  if (score > 90) return 'bg-green-100 text-green-800'; // Good
  if (score >= 70) return 'bg-yellow-100 text-yellow-800'; // Average
  return 'bg-red-100 text-red-800'; // Needs Review
};

export const MyAccountPage: React.FC<MyAccountPageProps> = ({ onBack, language }) => {
  const [data, setData] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const t = translations[language];

  useEffect(() => {
    const loadData = async () => {
      const guestId = getCurrentGuestId();
      if (!guestId) {
          setError(t.myAccountPage.noGuest);
          setLoading(false);
          return;
      }
      
      setLoading(true);
      setError(null);
      try {
        const profileData = await getProfileData();
        setData(profileData);
      } catch (e: any) {
        console.error("Failed to fetch user data:", e);
        setError(e.message || t.myAccountPage.loadError);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    const handleProfileUpdate = () => loadData();
    window.addEventListener('profileUpdated', handleProfileUpdate);

    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, [language, t.myAccountPage.noGuest, t.myAccountPage.loadError]);

  if (loading) {
    return (
      <div className="bg-slate-50 pt-24 md:pt-32 pb-32 min-h-screen flex items-center justify-center">
        <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-xl font-bold text-slate-500">{t.myAccountPage.loading}</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
     return (
      <div className="bg-slate-50 pt-24 md:pt-32 pb-32 min-h-screen flex items-center justify-center">
        <div className="text-center bg-white p-10 rounded-2xl shadow-md max-w-md mx-auto">
            <div className="text-5xl mb-4">😢</div>
            <p className="text-xl font-bold text-red-500 mb-2">{t.myAccountPage.accessDenied}</p>
            <p className="text-slate-600">{error || t.myAccountPage.unknownError}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-slate-50 pt-24 md:pt-32 pb-32 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-12">
          <div>
            <h1 className="text-4xl font-black text-[#1e293b] tracking-tight">{t.myAccountPage.reportTitle}</h1>
            <p className="mt-2 text-lg text-slate-500">{t.myAccountPage.greeting}</p>
          </div>
          <button 
            onClick={resetProfileData} 
            className="px-4 py-2 bg-red-50 text-red-600 text-xs font-bold uppercase rounded-lg border border-red-200 hover:bg-red-100 transition-colors"
          >
            {t.myAccountPage.resetProgress}
          </button>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Left Vertical Sidebar Column */}
          <div className="xl:col-span-1 space-y-8">
            
            {/* Key Metrics */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
                <div className="flex items-center space-x-4">
                    <div className="bg-blue-100 p-4 rounded-full"><i className="fas fa-clock text-2xl text-blue-600 w-8 text-center"></i></div>
                    <div>
                    <p className="text-base font-medium text-slate-500">{t.myAccountPage.speakingTime}</p>
                    <p className="text-3xl font-extrabold text-slate-800">{data.performance.totalSpeakingTime} <span className="text-lg font-semibold">{t.myAccountPage.hours}</span></p>
                    </div>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="bg-green-100 p-4 rounded-full"><i className="fas fa-bullseye text-2xl text-green-600 w-8 text-center"></i></div>
                    <div>
                    <p className="text-base font-medium text-slate-500">{t.myAccountPage.pronunciationScore}</p>
                    <p className="text-3xl font-extrabold text-slate-800">{data.performance.overallPronunciationScore}<span className="text-lg font-semibold">%</span></p>
                    </div>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="bg-purple-100 p-4 rounded-full"><i className="fas fa-check-circle text-2xl text-purple-600 w-8 text-center"></i></div>
                    <div>
                    <p className="text-base font-medium text-slate-500">{t.myAccountPage.topicsCompleted}</p>
                    <p className="text-3xl font-extrabold text-slate-800">{data.performance.topicsCompleted}<span className="text-lg font-semibold">/{data.performance.totalTopics}</span></p>
                    </div>
                </div>
            </div>

            {/* AI Connection */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-xl font-bold text-slate-800 mb-5">{t.myAccountPage.aiConnections}</h3>
              <div className="space-y-6">
                {data.aiConnections.map(ai => (
                  <div key={ai.id}>
                    <div className="flex items-center space-x-4 mb-3">
                      <img className="h-14 w-14 rounded-full" src={ai.avatarUrl} alt={ai.name} />
                      <div>
                        <p className="font-bold text-slate-700 text-lg">{ai.name}, {ai.age}</p>
                        <p className="text-base text-slate-500">{t.myAccountPage.fluencyLevel}</p>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3">
                      <div className="bg-gradient-to-r from-blue-400 to-purple-500 h-3 rounded-full" style={{ width: `${ai.fluencyLevel}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
          </div>

          {/* Right Column */}
          <div className="xl:col-span-2 space-y-8">

            {/* Topic Mastery */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-xl font-bold text-slate-800 mb-5">{t.myAccountPage.topicMastery}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {data.topics.map(topic => (
                  <div key={topic.id} className={`p-5 rounded-xl flex items-start space-x-4 ${topic.status === 'Locked' ? 'bg-slate-100 opacity-70' : 'bg-slate-50'}`}>
                    <div className="pt-1">
                      {topic.status === 'Mastered' && <i className="fas fa-check-circle text-2xl text-green-500"></i>}
                      {topic.status === 'Unlocked' && <i className="fas fa-unlock text-2xl text-blue-500"></i>}
                      {topic.status === 'Locked' && <i className="fas fa-lock text-2xl text-blue-500"></i>}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-lg leading-tight">{topic.title}</p>
                       <div className="flex space-x-4 mt-1.5 text-base text-slate-500">
                          <span>{topic.newWords} New Words</span>
                          <span>{topic.keyPhrases} Key Phrases</span>
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Correction Center */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-xl font-bold text-slate-800 mb-5">{t.myAccountPage.correctionCenter}</h3>
              <div className="space-y-4 max-h-80 overflow-y-auto pr-3">
                {data.correctionCenter.uncorrected.map(item => (
                  <div key={item.id} className="bg-slate-50 p-4 rounded-lg border border-slate-200/80">
                    <p className="text-base text-red-600 font-bold flex items-center mb-1"><i className="fas fa-times-circle mr-2"></i> {t.myAccountPage.whatYouSaid}</p>
                    <p className="pl-7 text-slate-700 text-[16px]">"{item.said}"</p>
                    <p className="mt-2 text-base text-green-600 font-bold flex items-center mb-1"><i className="fas fa-check-circle mr-2"></i> {t.myAccountPage.correctWay}</p>
                    <p className="pl-7 text-slate-800 text-[16px] font-bold">"{item.correct}"</p>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Pronunciation Deep-Dive */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-xl font-bold text-slate-800 mb-5">{t.myAccountPage.pronunciationDeepDive}</h3>
              <div className="flex flex-wrap gap-3">
                {data.pronunciationDeepDive.map(item => (
                  <span key={item.word} className={`px-4 py-2 text-[16px] font-bold rounded-full ${getPronunciationColor(item.score)}`}>
                    {item.word}
                  </span>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

import React from 'react';
// FIX: The import path for `getSpeakingUnits` was pointing to the root `constants` file instead of the one in the `components` directory. This has been corrected.
import { getSpeakingUnits } from '../constants';
import { Language, AuthMode } from '../App';
import { translations } from '../translations';
import { Lock } from 'lucide-react';


export interface SpeakingUnit {
    id: string;
    icon: string;
    title: string;
    description: string;
    bgColor: string;
    textColor: string;
    borderColor: string;
}

interface SpeakingCardProps {
  unit: SpeakingUnit;
  onClick: () => void;
  lang: Language;
}

const SpeakingCard: React.FC<SpeakingCardProps> = ({ unit, onClick, lang }) => {
    const t = translations[lang].speakingPage;
    return (
        <div 
            onClick={onClick}
            className={`p-8 rounded-3xl flex flex-col transition-all duration-300 border border-transparent cursor-pointer ${unit.bgColor} ${unit.borderColor}`}
        >
            <div className="text-3xl mb-4 opacity-80">{unit.icon}</div>
            <h3 className="text-[24px] font-black text-slate-800 mb-3">{unit.title}</h3>
            <p className="text-slate-500 text-[15px] leading-relaxed mb-6 flex-grow">{unit.description}</p>
            <button className={`font-bold text-[15px] flex items-center gap-2 self-start ${unit.textColor}`}>
                {t.startSpeaking} <span>→</span>
            </button>
        </div>
    );
};

interface SpeakingPageProps {
  language: Language;
  onBack: () => void;
  onSelectUnit: (unit: SpeakingUnit) => void;
  isGuest: boolean;
  onOpenAuthModal: () => void;
}

export const SpeakingPage: React.FC<SpeakingPageProps> = ({ language, onBack, onSelectUnit, isGuest, onOpenAuthModal }) => {
    const t = translations[language];
    const speakingUnits = getSpeakingUnits(language);
    const unlockedUnits = ['meetingFriends', 'realLifeSituations'];
    
    return (
        <div className="pt-24 md:pt-32 pb-32 bg-white min-h-screen">
            <div className="max-w-[1200px] mx-auto px-6">
                {/* Breadcrumbs */}
                <nav className="flex items-center gap-2 text-[13px] text-slate-400 mb-12 uppercase tracking-widest font-bold">
                  <span className="hover:text-[#1e5aa0] cursor-pointer transition-colors" onClick={onBack}>{t.pages.home}</span>
                  <span className="text-slate-300">/</span>
                  <span className="hover:text-[#1e5aa0] cursor-pointer transition-colors" onClick={onBack}>{t.pages.learn}</span>
                  <span className="text-slate-300">/</span>
                  <span className="text-slate-800">{t.pages.speaking}</span>
                </nav>

                {/* Page Title */}
                <div className="text-center mb-16 max-w-3xl mx-auto">
                    <h1 className="text-[40px] md:text-[56px] font-black text-[#1e293b] leading-[1.1] tracking-tight mb-6">
                        {t.speakingPage.title}
                    </h1>
                </div>

                {/* Main Image */}
                <div className="mb-20 max-w-5xl mx-auto">
                    <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl border border-slate-100">
                        <img 
                            src={language === 'ru' ? 'https://drive.google.com/thumbnail?id=1ZS8lW4mUCYjbMPEWZEhCVh9kvrN5vETO&sz=w1200' : 'https://lh3.googleusercontent.com/d/1f-WhpZTx3gS14KD9lgnJ9zDNk_M5qb5u'} 
                            alt="AI Speaking Practice Banner" 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                        />
                    </div>
                </div>
                
                {/* Units Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {speakingUnits.map(unit => {
                        const locked = isGuest && !unlockedUnits.includes(unit.id);
                        return (
                             <div 
                                key={unit.id} 
                                className="relative"
                                onClick={() => { if (locked) onOpenAuthModal(); }}
                            >
                                <SpeakingCard 
                                    unit={unit} 
                                    onClick={() => { if (!locked) onSelectUnit(unit); }}
                                    lang={language}
                                />
                                {locked && (
                                    <div className="absolute inset-0 bg-slate-50/70 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center text-center p-4 cursor-pointer">
                                    <Lock size={24} className="text-slate-500 mb-2" />
                                    <p className="font-bold text-slate-600 text-xs">Sign up to access</p>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    );
};
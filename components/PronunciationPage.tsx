
import React from 'react';
import { getPronunciationUnits } from '../constants';
import { Language } from '../App';
import { translations } from '../translations';
import { Lock } from 'lucide-react';

export interface PronunciationUnit {
    id: string;
    icon: string;
    title: string;
    description: string;
    bgColor: string;
    textColor: string;
    borderColor: string;
}

interface PronunciationCardProps {
  unit: PronunciationUnit;
  onClick: () => void;
  lang: Language;
}

const PronunciationCard: React.FC<PronunciationCardProps> = ({ unit, onClick, lang }) => {
    const t = translations[lang].pronunciationPage;
    return (
        <div 
            onClick={onClick}
            className={`p-10 rounded-3xl flex flex-col transition-all duration-300 border border-transparent cursor-pointer ${unit.bgColor} ${unit.borderColor}`}
        >
            <div className="text-3xl mb-4 opacity-80">{unit.icon}</div>
            <h3 className="text-[24px] font-black text-slate-800 mb-3">{unit.title}</h3>
            <p className="text-slate-500 text-[15px] leading-relaxed mb-6 flex-grow">{unit.description}</p>
            <button className={`font-bold text-[15px] flex items-center gap-2 self-start ${unit.textColor}`}>
                {t.startTraining} <span>→</span>
            </button>
        </div>
    );
};

interface PronunciationPageProps {
  language: Language;
  onBack: () => void;
  onSelectUnit: (unit: PronunciationUnit) => void;
  isGuest: boolean;
  onOpenAuthModal: () => void;
}

export const PronunciationPage: React.FC<PronunciationPageProps> = ({ language, onBack, onSelectUnit, isGuest, onOpenAuthModal }) => {
    const t = translations[language];
    const pronunciationUnits = getPronunciationUnits(language);
    const unlockedUnits = ['pro_1'];

    return (
        <div className="pt-24 md:pt-32 pb-32 bg-white min-h-screen">
            <div className="max-w-[1200px] mx-auto px-6">
                {/* Breadcrumbs */}
                <nav className="flex items-center gap-2 text-[13px] text-slate-400 mb-12 uppercase tracking-widest font-bold">
                  <span className="hover:text-[#1e5aa0] cursor-pointer transition-colors" onClick={onBack}>{t.pages.home}</span>
                  <span className="text-slate-300">/</span>
                  <span className="hover:text-[#1e5aa0] cursor-pointer transition-colors" onClick={onBack}>{t.pages.learn}</span>
                  <span className="text-slate-300">/</span>
                  <span className="text-slate-800">{t.pages.pronunciation}</span>
                </nav>

                {/* Page Title */}
                <div className="text-center mb-16 max-w-3xl mx-auto">
                    <h1 className="text-[40px] md:text-[56px] font-black text-[#1e293b] leading-[1.1] tracking-tight mb-6">
                        {t.pronunciationPage.title}
                    </h1>
                </div>

                {/* Main Image */}
                <div className="mb-20 max-w-5xl mx-auto">
                    <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl border border-slate-100">
                        <img 
                            src={language === 'ru' ? 'https://drive.google.com/thumbnail?id=1YN5vC0JM8WMRTMiDUjZYULcpepNfa3vF&sz=w1200' : 'https://lh3.googleusercontent.com/d/15T3Em5bRnvYWSLd5zVyO2-MAZkfCTngA'} 
                            alt="AI Pronunciation Practice Banner" 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                        />
                    </div>
                </div>
                
                {/* Units Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                    {pronunciationUnits.map(unit => {
                       const locked = isGuest && !unlockedUnits.includes(unit.id);
                        return (
                            <div 
                                key={unit.id} 
                                className="relative"
                                onClick={() => { if (locked) onOpenAuthModal(); }}
                            >
                                <PronunciationCard 
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
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

import React from 'react';
import { getVocabUnits } from '../constants';
import { Language } from '../App';
import { translations } from '../translations';
import { Lock } from 'lucide-react';

export interface VocabUnit {
    id: string;
    icon: string;
    title: string;
    description: string;
    bgColor: string;
    textColor: string;
    borderColor: string;
}

interface VocabCardProps {
  unit: VocabUnit;
  onClick: () => void;
  lang: Language;
}

const VocabCard: React.FC<VocabCardProps> = ({ unit, onClick, lang }) => {
    const t = translations[lang].vocabularyPage;
    return (
        <div 
            onClick={onClick}
            className={`p-8 rounded-3xl flex flex-col transition-all duration-300 border border-transparent cursor-pointer ${unit.bgColor} ${unit.borderColor}`}
        >
            <div className="text-3xl mb-4 opacity-80">{unit.icon}</div>
            <h3 className="text-[24px] font-black text-slate-800 mb-3">{unit.title}</h3>
            <p className="text-slate-500 text-[15px] leading-relaxed mb-6 flex-grow">{unit.description}</p>
            <button className={`font-bold text-[15px] flex items-center gap-2 self-start ${unit.textColor}`}>
                {t.exploreUnit} <span>→</span>
            </button>
        </div>
    );
};

interface VocabularyPageProps {
  language: Language;
  onBack: () => void;
  onSelectUnit: (unit: VocabUnit) => void;
  isGuest: boolean;
  onOpenAuthModal: () => void;
}

export const VocabularyPage: React.FC<VocabularyPageProps> = ({ language, onBack, onSelectUnit, isGuest, onOpenAuthModal }) => {
    const t = translations[language];
    const vocabUnits = getVocabUnits(language);
    const unlockedUnits = ['tetHoliday', 'pronouns'];

    return (
        <div className="pt-24 md:pt-32 pb-32 bg-white min-h-screen">
            <div className="max-w-[1200px] mx-auto px-6">
                {/* Breadcrumbs */}
                <nav className="flex items-center gap-2 text-[13px] text-slate-400 mb-12 uppercase tracking-widest font-bold">
                  <span className="hover:text-[#1e5aa0] cursor-pointer transition-colors" onClick={onBack}>{t.pages.home}</span>
                  <span className="text-slate-300">/</span>
                  <span className="hover:text-[#1e5aa0] cursor-pointer transition-colors" onClick={onBack}>{t.pages.learn}</span>
                  <span className="text-slate-300">/</span>
                  <span className="text-slate-800">{t.pages.vocabulary}</span>
                </nav>

                {/* Page Title */}
                <div className="text-center mb-16 max-w-3xl mx-auto">
                    <h1 className="text-[40px] md:text-[56px] font-black text-[#1e293b] leading-[1.1] tracking-tight mb-6">
                        {t.vocabularyPage.title}
                    </h1>
                </div>

                {/* Units Grid Title */}
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-black text-[#1e293b] leading-tight tracking-tight">{t.vocabularyPage.unitsTitle}</h2>
                    <p className="text-lg text-slate-500 mt-4 max-w-2xl mx-auto">{t.vocabularyPage.unitsSubtitle}</p>
                </div>
                
                {/* Units Grid */}
                {vocabUnits.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {vocabUnits.map(unit => {
                            const locked = isGuest && !unlockedUnits.includes(unit.id);
                            return (
                                <div 
                                    key={unit.id} 
                                    className="relative"
                                    onClick={() => { if (locked) onOpenAuthModal(); }}
                                >
                                    <VocabCard 
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
                ) : (
                    <div className="text-center py-20 bg-slate-50 rounded-3xl border border-slate-200">
                        <p className="text-2xl font-bold text-slate-700">New vocabulary lessons are coming soon!</p>
                        <p className="text-slate-500 mt-2">Please check back later.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
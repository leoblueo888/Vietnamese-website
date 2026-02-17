
import React from 'react';
import { Language, ViewType } from '../App';
import { SpeakingUnit } from './SpeakingPage';
import { Lock } from 'lucide-react';

const getRealLifeSubUnits = (language: Language): SpeakingUnit[] => {
    const t = {
        en: {
            buySmoothie_title: 'Buy a Smoothie or Juice',
            buySmoothie_desc: 'Learn phrases to order your favorite drinks.',
            buyFruits_title: 'Buy Fruits',
            buyFruits_desc: 'Practice asking for prices and quantities of fresh fruits.',
            buyVeggies_title: 'Buy Vegetables',
            buyVeggies_desc: 'Learn vocabulary for common vegetables and how to shop for them.',
            buyMeat_title: 'Buy Meat & Seafood',
            buyMeat_desc: 'Master phrases for buying meat and seafood at the market.',
            atRestaurant_title: 'At a Restaurant',
            atRestaurant_desc: 'Practice ordering food, asking for the bill, and more.',
            start_lesson: 'Start Lesson'
        },
        ru: {
            buySmoothie_title: 'Покупка смузи или сока',
            buySmoothie_desc: 'Изучите фразы для заказа ваших любимых напитков.',
            buyFruits_title: 'Покупка фруктов',
            buyFruits_desc: 'Практикуйтесь в запросе цен и количества свежих фруктов.',
            buyVeggies_title: 'Покупка овощей',
            buyVeggies_desc: 'Изучите лексику для распространенных овощей и как их покупать.',
            buyMeat_title: 'Покупка мяса и морепродуктов',
            buyMeat_desc: 'Освойте фразы для покупки мяса и морепродуктов на рынке.',
            atRestaurant_title: 'В ресторане',
            atRestaurant_desc: 'Практикуйтесь в заказе еды, запросе счета и многом другом.',
            start_lesson: 'Начать урок'
        }
    }[language];

    return [
        { id: 'buySmoothie', icon: '🥤', title: t.buySmoothie_title, description: t.buySmoothie_desc, bgColor: 'bg-pink-50', textColor: 'text-pink-700', borderColor: 'hover:border-pink-200' },
        { id: 'buyFruits', icon: '🍓', title: t.buyFruits_title, description: t.buyFruits_desc, bgColor: 'bg-red-50', textColor: 'text-red-700', borderColor: 'hover:border-red-200' },
        { id: 'buyVeggies', icon: '🥦', title: t.buyVeggies_title, description: t.buyVeggies_desc, bgColor: 'bg-green-50', textColor: 'text-green-700', borderColor: 'hover:border-green-200' },
        { id: 'buyMeat', icon: '🥩', title: t.buyMeat_title, description: t.buyMeat_desc, bgColor: 'bg-orange-50', textColor: 'text-orange-700', borderColor: 'hover:border-orange-200' },
        { id: 'atRestaurant', icon: '🍽️', title: t.atRestaurant_title, description: t.atRestaurant_desc, bgColor: 'bg-sky-50', textColor: 'text-sky-700', borderColor: 'hover:border-sky-200' }
    ];
};

interface RealLifeSituationsPageProps {
  onBack: () => void;
  onNavigate: (view: ViewType, data?: any) => void;
  language: Language;
  isGuest: boolean;
  onOpenAuthModal: () => void;
}

const SubUnitCard: React.FC<{ unit: SpeakingUnit; onClick: () => void; language: Language }> = ({ unit, onClick, language }) => {
    const t = { en: { start_lesson: 'Start Lesson' }, ru: { start_lesson: 'Начать урок' }}[language];
    return (
        <div 
            onClick={onClick}
            className={`p-6 rounded-3xl flex flex-col transition-all duration-300 border border-transparent cursor-pointer ${unit.bgColor} ${unit.borderColor} hover:shadow-lg`}
        >
            <div className="text-3xl mb-4 opacity-80">{unit.icon}</div>
            <h3 className="text-2xl font-black text-slate-800 mb-3">{unit.title}</h3>
            <p className="text-base text-slate-500 leading-relaxed mb-6 flex-grow">{unit.description}</p>
            <button className={`font-bold text-base flex items-center gap-2 self-start ${unit.textColor}`}>
                {t.start_lesson} <span>→</span>
            </button>
        </div>
    );
};

export const RealLifeSituationsPage: React.FC<RealLifeSituationsPageProps> = ({ onBack, onNavigate, language, isGuest, onOpenAuthModal }) => {
    const subUnits = getRealLifeSubUnits(language);
    const unlockedUnits = ['buySmoothie'];
    const pageTitles = { 
        en: { 
            page: "Speaking", 
            category: "Real-life Situations", 
            desc: "Essential language for your daily shopping and transactions." 
        }, 
        ru: { 
            page: "Разговор", 
            category: "Реальные ситуации", 
            desc: "Основной язык для ежедневных покупок и транзакций." 
        }
    }[language];

    return (
        <div className="pt-24 md:pt-32 pb-32 bg-white min-h-screen">
            <div className="max-w-[1200px] mx-auto px-6">
                {/* Breadcrumbs */}
                <nav className="flex items-center gap-2 text-[13px] text-slate-400 mb-12 uppercase tracking-widest font-bold">
                  <span className="hover:text-[#1e5aa0] cursor-pointer transition-colors" onClick={onBack}>{pageTitles.page}</span>
                  <span className="text-slate-300">/</span>
                  <span className="text-slate-800">{pageTitles.category}</span>
                </nav>

                {/* Page Title */}
                <div className="text-center mb-16 max-w-3xl mx-auto">
                    <h1 className="text-[40px] md:text-[56px] font-black text-[#1e293b] leading-[1.1] tracking-tight mb-6">
                        {pageTitles.category}
                    </h1>
                     <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
                        {pageTitles.desc}
                    </p>
                </div>
                
                {/* Units Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {subUnits.map(unit => {
                        const locked = isGuest && !unlockedUnits.includes(unit.id);
                        return (
                           <div 
                                key={unit.id} 
                                className="relative"
                                onClick={() => { if (locked) onOpenAuthModal(); }}
                            >
                                <SubUnitCard 
                                    key={unit.id} 
                                    unit={unit} 
                                    onClick={() => { if (!locked) onNavigate('speaking-lesson', unit); }}
                                    language={language}
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
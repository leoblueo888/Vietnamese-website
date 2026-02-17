
import React, {useEffect} from 'react';
import { Language, ViewType } from '../App';
import { SpeakingUnit } from './SpeakingPage';
import { getAIFriends } from '../constants';
// FIX: AIFriend type should be imported from the central types.ts file, not from another component.
import type { AIFriend } from '../types';

interface RealLifeSubLessonPageProps {
  unit: SpeakingUnit;
  onBack: () => void;
  onNavigate: (view: ViewType, data?: any) => void;
  language: Language;
}

const getDynamicContent = (unit: SpeakingUnit, language: Language) => {
    const title = unit.title;
    let topic = 'seller';
    let learnAction = title;

    if (language === 'ru') {
        if (title.includes('смузи')) {
            topic = 'продавцом соков';
            learnAction = 'покупать смузи';
        } else if (title.includes('фруктов')) {
            topic = 'продавцом фруктов';
            learnAction = 'покупать фрукты';
        } else if (title.includes('овощей')) {
            topic = 'продавцом овощей';
            learnAction = 'покупать овощи';
        } else if (title.includes('мяса')) {
            topic = 'продавцом мяса';
            learnAction = 'покупать мясо';
        } else if (title.includes('ресторане')) {
            topic = 'официантом';
            learnAction = 'заказывать в ресторане';
        }
    } else {
        if (title.toLowerCase().includes('smoothie') || title.toLowerCase().includes('juice')) {
            topic = 'juice seller';
        } else if (title.toLowerCase().includes('fruit')) {
            topic = 'fruit seller';
        } else if (title.toLowerCase().includes('vegetable')) {
            topic = 'vegetable seller';
        } else if (title.toLowerCase().includes('meat') || title.toLowerCase().includes('seafood')) {
            topic = 'meat/seafood seller';
        } else if (title.toLowerCase().includes('restaurant')) {
            topic = 'waiter';
        }
    }

    const isSmoothie = unit.id === 'buySmoothie';
    const isFruits = unit.id === 'buyFruits';
    const isVeggies = unit.id === 'buyVeggies';
    const isMeat = unit.id === 'buyMeat';
    const isRestaurant = unit.id === 'atRestaurant';

    let speakWithTitle_en = `Speak with an AI ${topic}`;
    let speakWithTitle_ru = `Поговорите с ИИ-${topic}`;
    let speakingGameDesc_en = 'practice a basic conversation about this topic.'; // Fallback
    let speakingGameDesc_ru = 'Практикуйте базовый разговор на эту тему.'; // Fallback

    if (isSmoothie) {
        speakWithTitle_en = 'Speak With Xuân - AI Juice Seller';
        speakWithTitle_ru = 'Поговорить с Суан - ИИ-продавцом соков';
        speakingGameDesc_en = 'practice a basic conversation about this topic and you are ready to buy a smoothie anytime.';
        speakingGameDesc_ru = 'Практикуйте базовый разговор на эту тему, и вы будете готовы купить смузи в любое время.';
    } else if (isFruits) {
        speakWithTitle_en = 'Speak With Hạnh - AI Fruits Seller';
        speakWithTitle_ru = 'Поговорите с Hạnh - ИИ-продавцом фруктов';
        speakingGameDesc_en = 'Practice a basic conversation about this topic and you are ready to buy fruits anytime.';
        speakingGameDesc_ru = 'Практикуйте базовый разговор на эту тему, и вы будете готовы покупать фрукты в любое время.';
    } else if (isVeggies) {
        speakWithTitle_en = 'Speak With Phương - AI Vegetables Seller';
        speakWithTitle_ru = 'Поговорите с Phương - ИИ-продавцом овощей';
        speakingGameDesc_en = 'Practice a basic conversation about this topic and you are ready to buy vegetables anytime.';
        speakingGameDesc_ru = 'Практикуйте базовый разговор на эту тему, и вы будете готовы покупать овощи в любое время.';
    } else if (isMeat) {
        speakWithTitle_en = 'Speak With Thanh - AI Meat and Seafood seller';
        speakWithTitle_ru = 'Поговорите с Thanh - ИИ-продавцом мяса и морепродуктов';
        speakingGameDesc_en = 'Practice a basic conversation about this topic and you are ready to buy meat and seafood anytime.';
        speakingGameDesc_ru = 'Практикуйте базовый разговор на эту тему, и вы будете готовы покупать мясо и морепродукты в любое время.';
    } else if (isRestaurant) {
        speakWithTitle_en = 'Speak With Linh - AI Restaurant Owner';
        speakWithTitle_ru = 'Поговорите с Linh - ИИ-владельцем ресторана';
        speakingGameDesc_en = 'Practice a basic conversation about this topic and you are ready to order food at restaurant anytime.';
        speakingGameDesc_ru = 'Практикуйте базовый разговор на эту тему, и вы будете готовы заказывать еду в ресторане в любое время.';
    }


    const t = {
        en: {
            speaking: 'Speaking',
            realLife: 'Real-life Situations',
            learnTitle: `Learn To ${learnAction} in Vietnamese`,
            speakingGameTitle: 'Speaking Game',
            speakingGameDesc: speakingGameDesc_en,
            speakWithAITitle: speakWithTitle_en,
            speakWithAIDesc: 'Have an open-ended, realistic conversation to master this situation.',
            backButton: '← Back to all situations'
        },
        ru: {
            speaking: 'Разговор',
            realLife: 'Реальные ситуации',
            learnTitle: `Научитесь ${learnAction} на вьетнамском`,
            speakingGameTitle: 'Разговорная игра',
            speakingGameDesc: speakingGameDesc_ru,
            speakWithAITitle: speakWithTitle_ru,
            speakWithAIDesc: 'Ведите открытый, реалистичный разговор, чтобы освоить эту ситуацию.',
            backButton: '← Назад ко всем ситуациям'
        }
    };

    return t[language];
}


export const RealLifeSubLessonPage: React.FC<RealLifeSubLessonPageProps> = ({ unit, onBack, onNavigate, language }) => {
    const content = getDynamicContent(unit, language);
    const aiFriends = getAIFriends(language);

    useEffect(() => {
      const startTime = performance.now();
      const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw8CybuvtYKzwxLvoNATEun7RFwFGc6Yxa9uNlKI8_FN2oeJgjUCnnSeruMC_0RMvrm/exec';

      return () => {
        const duration = Math.round((performance.now() - startTime) / 1000);
        if (duration > 5) {
          const userString = localStorage.getItem('user');
          const user = userString ? JSON.parse(userString) : { name: 'Guest' };
          
          const params = new URLSearchParams();
          params.append('name', user.name || 'Guest');
          params.append('section', 'Real-life Lesson');
          params.append('content', unit.title);
          params.append('duration', String(duration));
          
          navigator.sendBeacon(SCRIPT_URL, params);
        }
      };
    }, [unit.title]);
    
    // Define characters for specific lessons
    const hanhCharacter: AIFriend = {
        name: 'Hạnh',
        avatarUrl: 'https://lh3.googleusercontent.com/d/1HUUrtGe40GfELPnCPzLcV5ufh2mtM0lc',
        description: language === 'ru' ? 'Продавец фруктов' : 'Fruit seller',
        style: language === 'ru' ? 'Дружелюбный' : 'Friendly'
    };

    const xuanCharacter: AIFriend = {
        name: 'Xuân',
        avatarUrl: 'https://lh3.googleusercontent.com/d/178nRZzhDBASRezHcCRSxPtmWEA3m-yNM',
        description: language === 'ru' ? 'Продавец соков' : 'Juice seller',
        style: language === 'ru' ? 'Энергичный' : 'Energetic'
    };
    
    const phuongCharacter: AIFriend = {
        name: 'Phương',
        avatarUrl: 'https://lh3.googleusercontent.com/d/1ke9ugz04QtfDQO4sa3r7t7O0_Uqi0V9H',
        description: language === 'ru' ? 'Продавец овощей' : 'Vegetable seller',
        style: language === 'ru' ? 'Заботливый' : 'Caring'
    };

    const thanhCharacter: AIFriend = {
        name: 'Thanh',
        avatarUrl: 'https://lh3.googleusercontent.com/d/1rvWD3Y2l6lG86Q_2vivhYkcufqpcSNCC',
        description: language === 'ru' ? 'Продавец мяса и морепродуктов' : 'Meat & Seafood seller',
        style: language === 'ru' ? 'Сильный' : 'Strong'
    };
    
    const linhCharacter: AIFriend = {
        name: 'Linh',
        avatarUrl: 'https://lh3.googleusercontent.com/d/1Vv8KktaOQ5fI3shCi7DCjZSBgFWTvQQm',
        description: language === 'ru' ? 'Владелец ресторана' : 'Restaurant Owner',
        style: language === 'ru' ? 'Гостеприимный' : 'Hospitable'
    };

    // Default to Mai for other scenarios
    const maiCharacter = aiFriends.find(f => f.name === 'Mai');

    let characterForChat;
    let aiSellerImage;
    let aiSellerAlt;

    if (unit.id === 'buyFruits') {
        characterForChat = hanhCharacter;
        aiSellerImage = hanhCharacter.avatarUrl;
        aiSellerAlt = 'Hạnh AI Seller';
    } else if (unit.id === 'buySmoothie') {
        characterForChat = xuanCharacter;
        aiSellerImage = xuanCharacter.avatarUrl;
        aiSellerAlt = 'Xuân AI Seller';
    } else if (unit.id === 'buyVeggies') {
        characterForChat = phuongCharacter;
        aiSellerImage = phuongCharacter.avatarUrl;
        aiSellerAlt = 'Phương AI Seller';
    } else if (unit.id === 'buyMeat') {
        characterForChat = thanhCharacter;
        aiSellerImage = thanhCharacter.avatarUrl;
        aiSellerAlt = 'Thanh AI Seller';
    } else if (unit.id === 'atRestaurant') {
        characterForChat = linhCharacter;
        aiSellerImage = linhCharacter.avatarUrl;
        aiSellerAlt = 'Linh AI Seller';
    } else {
        characterForChat = maiCharacter;
        aiSellerImage = maiCharacter?.avatarUrl || "https://lh3.googleusercontent.com/d/178nRZzhDBASRezHcCRSxPtmWEA3m-yNM";
        aiSellerAlt = `${maiCharacter?.name || 'AI'} Seller`;
    }

    const handleBackToSpeaking = () => {
        onNavigate('speaking');
    }

    return (
        <div className="pt-24 md:pt-32 pb-32 bg-slate-50 min-h-screen">
            <div className="max-w-[1200px] mx-auto px-6">
                {/* Breadcrumbs */}
                <nav className="flex items-center gap-2 text-[13px] text-slate-400 mb-12 uppercase tracking-widest font-bold flex-wrap">
                  <span className="hover:text-[#1e5aa0] cursor-pointer transition-colors" onClick={handleBackToSpeaking}>{content.speaking}</span>
                  <span className="text-slate-300">/</span>
                  <span className="hover:text-[#1e5aa0] cursor-pointer transition-colors" onClick={onBack}>{content.realLife}</span>
                  <span className="text-slate-300">/</span>
                  <span className="text-slate-800">{unit.title}</span>
                </nav>

                {/* Page Title */}
                <div className="text-center mb-16 max-w-3xl mx-auto">
                    <h1 className="text-[40px] md:text-[56px] font-black text-[#1e293b] leading-[1.1] tracking-tight mb-6">
                        {content.learnTitle}
                    </h1>
                </div>
                
                {/* Practice Boxes Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    {/* Speaking Game Box */}
                    <div 
                        onClick={() => onNavigate('real-life-speaking-game', unit)}
                        className="bg-orange-600 p-8 rounded-3xl flex flex-col items-center text-center transition-all duration-300 cursor-pointer hover:shadow-2xl hover:-translate-y-2 group min-h-[300px]"
                    >
                        <div className="w-32 h-32 mb-4 flex items-center justify-center text-8xl">🗣️</div>
                        <h3 className="text-2xl font-black text-white mb-3 transition-colors">{content.speakingGameTitle}</h3>
                        <p className="text-base text-orange-100 leading-relaxed mb-6 flex-grow">{content.speakingGameDesc}</p>
                    </div>

                    {/* Speak with AI Box */}
                    <div 
                        onClick={() => onNavigate('real-life-ai-chat', { unit, character: characterForChat })}
                        className="bg-indigo-600 p-8 rounded-3xl flex flex-col items-center text-center transition-all duration-300 cursor-pointer hover:shadow-2xl hover:-translate-y-2 group min-h-[300px]"
                    >
                        <div className="w-32 h-32 mb-4 flex items-center justify-center">
                            <img src={aiSellerImage} alt={aiSellerAlt} className="w-full h-full object-cover rounded-full shadow-lg border-4 border-white" />
                        </div>
                        <h3 className="text-2xl font-black text-white mb-3 transition-colors">{content.speakWithAITitle}</h3>
                        <p className="text-base text-indigo-100 leading-relaxed mb-6 flex-grow">{content.speakWithAIDesc}</p>
                    </div>
                </div>

                <div className="mt-16 text-center">
                    <button onClick={onBack} className="font-bold text-slate-500 hover:text-slate-800 transition-colors text-base">
                        {content.backButton}
                    </button>
                </div>
            </div>
        </div>
    );
};

import React, { useState } from 'react';
import { Chatbot } from './Chatbot';
import { Language, AuthMode } from '../App';
import { translations } from '../translations';

interface HeroProps {
  language: Language;
  onOpenAuthModal: (mode: AuthMode) => void;
}

export const Hero: React.FC<HeroProps> = ({ language, onOpenAuthModal }) => {
  const t = translations[language].hero;

  return (
    <section className="relative pt-24 pb-12 lg:pt-40 lg:pb-24 bg-white overflow-hidden">
      <div className="max-w-[1300px] mx-auto px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-20">
          
          {/* Main Content */}
          <div className="flex-1 text-left animate-in fade-in slide-in-from-left duration-700">
            <h1 className="text-[36px] md:text-[50px] lg:text-[64px] font-black text-[#1e293b] leading-[1.1] tracking-tight mb-8">
              {t.title1} <br />
              <span className="text-[#1e5aa0]">{t.title2}</span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-500 max-w-lg leading-relaxed mb-10">
              {t.subtitle}
            </p>

            <div className="flex flex-row gap-4">
              <button 
                onClick={() => onOpenAuthModal('signup')}
                className="bg-[#1e5aa0] text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-blue-800 transition-all active:scale-95 shadow-[0_15px_30px_-5px_rgba(30,90,160,0.4)]">
                {t.signUp}
              </button>
              <button
                onClick={() => onOpenAuthModal('signin')}
                className="bg-white text-slate-700 border border-slate-200 px-10 py-4 rounded-full font-bold text-lg hover:bg-slate-50 transition-all active:scale-95">
                {t.signIn}
              </button>
            </div>
          </div>

          {/* Image Container */}
          <div className="flex-1 relative animate-in fade-in zoom-in duration-700 delay-100">
            <div className="relative w-full aspect-[4/3] rounded-[2.5rem] overflow-hidden shadow-[0_40px_80px_-15px_rgba(0,0,0,0.1)]">
              <img 
                src="https://lh3.googleusercontent.com/d/1mfk93hxGM0eyZDd4yYug27DVmgZrsgJQ" 
                alt="Students learning together"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

        </div>
      </div>
      <Chatbot />
    </section>
  );
};

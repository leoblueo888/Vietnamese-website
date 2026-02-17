
import React from 'react';
// FIX: Changed import path from ../constants to ./constants to use the internationalized getter function.
import { getMethodologySteps } from '../constants';
import { Language } from '../App';
import { translations } from '../translations';

interface StorySectionProps {
  language: Language;
}

export const StorySection: React.FC<StorySectionProps> = ({ language }) => {
  const t = translations[language].story;
  const methodologySteps = getMethodologySteps(language);

  return (
    <section className="py-20 bg-white">
      <div className="max-w-[1300px] mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-[42px] md:text-[64px] font-black text-[#1e293b] tracking-tight mb-4">
            {t.title}
          </h2>
          <div className="w-12 h-1.5 bg-[#ff8a65] mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10">
          {methodologySteps.map((step, idx) => (
            <div 
              key={idx}
              className={`${step.bg} p-6 md:p-8 rounded-[2.5rem] border border-slate-50 flex flex-col sm:flex-row items-center gap-6 md:gap-10 transition-all hover:shadow-md h-full md:min-h-[320px]`}
            >
              {/* Card Image - Chiếm tỉ lệ lớn hơn (khoảng 40% trên desktop) */}
              <div className="w-full sm:w-[40%] aspect-square rounded-[2rem] overflow-hidden shrink-0 shadow-[0_15px_30px_-10px_rgba(0,0,0,0.15)] bg-white border-4 border-white">
                <img src={step.image} alt={step.heading} className="w-full h-full object-cover" />
              </div>
              
              {/* Text Content - Chiếm phần còn lại và căn giữa dọc */}
              <div className="flex-1 text-left">
                <div className="flex items-start gap-2 mb-3">
                  <span className={`text-[36px] md:text-[42px] font-black leading-none ${step.accent}`}>
                    {step.number}
                  </span>
                  <h3 className="text-[24px] md:text-[30px] font-black text-[#1e293b] leading-tight pt-1">
                    {step.heading}
                  </h3>
                </div>
                <p className="text-slate-500 text-[15px] md:text-[17px] leading-relaxed">
                  {step.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

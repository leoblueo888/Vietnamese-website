
import React from 'react';
import { Language } from '../App';
import { translations } from '../translations';

interface FooterProps {
  language: Language;
}

export const Footer: React.FC<FooterProps> = ({ language }) => {
  const t = translations[language].footer;

  return (
    <footer className="bg-white pt-20 pb-10">
      <div className="max-w-[1300px] mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <img 
              src="https://lh3.googleusercontent.com/d/1T4bNSul2AWvPIhgQErqo8dCeWJGMynAz" 
              alt="Truly Easy Vietnamese Logo" 
              className="h-9 w-auto self-start"
            />
            <p className="text-slate-500 text-[14px] leading-relaxed max-w-[240px]">
              {t.tagline}
            </p>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-bold text-[#1e293b] text-[14px] uppercase tracking-wider mb-6">{t.company}</h4>
            <ul className="space-y-3 text-slate-500 text-[14px]">
              <li><span className="cursor-not-allowed opacity-50">{t.about}</span></li>
              <li><span className="cursor-not-allowed opacity-50">{t.contact}</span></li>
              <li><span className="cursor-not-allowed opacity-50">{t.privacy}</span></li>
              <li><span className="cursor-not-allowed opacity-50">{t.terms}</span></li>
            </ul>
          </div>

          {/* Follow Us */}
          <div>
            <h4 className="font-bold text-[#1e293b] text-[14px] uppercase tracking-wider mb-6">{t.follow}</h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-slate-500 text-[14px]">
                <span className="w-5 h-5 flex items-center justify-center grayscale opacity-70">📺</span> YouTube
              </li>
              <li className="flex items-center gap-3 text-slate-500 text-[14px]">
                <span className="w-5 h-5 flex items-center justify-center grayscale opacity-70 text-blue-600">🔵</span> Facebook
              </li>
              <li className="flex items-center gap-3 text-slate-500 text-[14px]">
                <span className="w-5 h-5 flex items-center justify-center grayscale opacity-70">🎵</span> TikTok
              </li>
            </ul>
          </div>

          {/* Get in Touch */}
          <div>
            <h4 className="font-bold text-[#1e293b] text-[14px] uppercase tracking-wider mb-6">{t.getInTouch}</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-slate-500 text-[14px]">
                <span className="text-lg -mt-1 text-[#ff8a65]">📍</span> District 1, HCMC, Vietnam
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};



import React, { useState, useEffect, useCallback } from 'react';
import { ViewType, Language, AuthMode } from '../App';
import { getSpeakingUnits, getPronunciationUnits, getVocabUnits, getGrammarLevels, getAIFriends } from '../constants';
import { SpeakingUnit } from './SpeakingPage';
import { PronunciationUnit } from './PronunciationPage';
import { VocabUnit } from './VocabularyPage';
import { translations } from '../translations';
import { User, ChevronDown, LogOut, Copy, Gift } from 'lucide-react';

interface HeaderProps {
  onNavigate: (view: ViewType, data?: any) => void;
  onOpenAuthModal: (mode: AuthMode) => void;
  currentView: ViewType;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  credit: number;
  isGuest: boolean;
  user: { name: string; gender?: 'male' | 'female' } | null;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate, onOpenAuthModal, currentView, language, onLanguageChange, user, isGuest, credit }) => {
  const t = translations[language].header;
  const isLoggedIn = !isGuest;
  const [copied, setCopied] = useState(false);

  const handleLogout = useCallback(() => {
    window.dispatchEvent(new Event('logout'));
    onNavigate('home');
  }, [onNavigate]);

  const handleCopyInviteLink = useCallback(() => {
    const userEmail = localStorage.getItem('userEmail');
    if (userEmail) {
      const inviteLink = `${window.location.origin}?ref=${userEmail}`;
      navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, []);

  const languages = {
    en: { flag: '🇺🇸', code: 'EN', name: 'English' },
    ru: { flag: '🇷🇺', code: 'RU', name: 'Русский' }
  };
  const currentLang = languages[language];

  const handleLangChange = useCallback((lang: Language) => {
    onLanguageChange(lang);
    window.dispatchEvent(new Event('languageChanged'));
  }, [onLanguageChange]);
  
  const mainNavItems = [
    { key: 'Pronunciation', label: t.navPronunciation, view: 'pronunciation' as ViewType, getUnits: getPronunciationUnits },
    { key: 'Speaking', label: t.navSpeaking, view: 'speaking' as ViewType, getUnits: getSpeakingUnits },
    { key: 'Grammar', label: t.navGrammar, view: 'grammar' as ViewType, getUnits: getGrammarLevels },
    { key: 'Vocabulary', label: t.navVocabulary, view: 'vocabulary' as ViewType, getUnits: getVocabUnits },
    { key: 'AI Friends', label: t.navAIFriends, view: 'ai-friends' as ViewType },
  ];

  const selectUser = useCallback((name: string, gender: 'male' | 'female') => {
    localStorage.setItem('user', JSON.stringify({ name, gender }));
    localStorage.setItem('isLoggedIn', 'true');
    window.dispatchEvent(new Event('authSuccess'));
    onNavigate('home'); 
  }, [onNavigate]);

  const getCreditColor = () => {
    if (credit < 60) return 'text-red-500 animate-pulse';
    if (credit > 100) return 'text-green-500';
    return 'text-slate-500';
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-[1300px] mx-auto px-5 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          <div>
            <div 
              id="logo-container"
              className="flex items-center cursor-pointer group"
              onClick={() => onNavigate('home')}
            >
               <img 
                src="https://lh3.googleusercontent.com/d/1T4bNSul2AWvPIhgQErqo8dCeWJGMynAz" 
                alt="Truly Easy Vietnamese Logo" 
                className="h-10 md:h-12 w-auto"
              />
            </div>
            <div id="mobile-user-info">
                {isLoggedIn && user ? (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 font-bold text-[13px]">
                      <span className="text-yellow-500">⚡</span>
                      <span className="text-slate-700">{user.name}</span>
                      <span className="text-slate-300">|</span>
                      <span className={getCreditColor()}>{credit}s</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 font-bold text-[13px]">
                      <span className="text-yellow-500">⚡</span>
                      <span className="text-slate-700">Guest</span>
                      <span className="text-slate-300">|</span>
                      <span className={getCreditColor()}>{credit}s</span>
                  </div>
                )}
              </div>
          </div>

          <nav className="hidden xl:flex items-center gap-9">
            {mainNavItems.map((item) => (
              <div key={item.key} className="relative group/nav">
                <button 
                  onClick={() => onNavigate(item.view)}
                  className={`text-[#1e293b] hover:text-[#1e5aa0] font-extrabold text-[18px] tracking-tight transition-all duration-200 relative py-2 ${
                    currentView.startsWith(item.view) ? 'text-[#1e5aa0]' : ''
                  }`}
                >
                  {item.label}
                  <span className={`absolute -bottom-1 left-0 h-0.5 bg-[#1e5aa0] transition-all duration-300 group-hover/nav:w-full ${
                    currentView.startsWith(item.view) ? 'w-full' : 'w-0'
                  }`}></span>
                </button>
                {item.getUnits && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 pt-4 opacity-0 invisible group-hover/nav:opacity-100 group-hover/nav:visible transition-all duration-300 translate-y-2 group-hover/nav:translate-y-0 z-50">
                    <div className="bg-white shadow-[0_20px_40px_-10px_rgba(0,0,0,0.15)] rounded-2xl border border-gray-100 p-2 min-w-[240px]">
                      {(item.getUnits(language) as any[]).map((unit: any) => (
                        <button
                          key={unit.title || unit.badge || unit.name}
                          onClick={(e) => {
                            e.stopPropagation();
                            const navView = item.view === 'grammar' ? 'grammar-level' : `${item.view}-lesson`;
                            const payload = item.view === 'grammar' ? unit.badge : unit;
                            onNavigate(navView as ViewType, payload);
                          }}
                          className="w-full text-left px-5 py-3 hover:bg-[#f0f9ff] rounded-xl text-[#1e293b] hover:text-[#1e5aa0] font-bold text-[15px] transition-colors flex items-center gap-3 group/item"
                        >
                          {unit.icon ? <span className="text-xl">{unit.icon}</span> : unit.avatarUrl ? <img src={unit.avatarUrl} className="w-8 h-8 rounded-full object-cover" /> : <span className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm text-white ${unit.accentColor?.replace('text', 'bg')}`}>{unit.badge}</span>}
                          <span>{unit.title || unit.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          <div id="desktop-actions" className="flex items-center gap-3">
            {isLoggedIn && user ? (
              <div className="relative group/user">
                <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 font-bold text-[13px] hover:bg-slate-100 transition-colors">
                  <span className="text-yellow-500">⚡</span>
                  <span className="text-slate-700">{user.name}</span>
                  <span className="text-slate-300">|</span>
                  <span className={getCreditColor()}>{credit}s</span>
                  <ChevronDown size={14} className="group-hover/user:rotate-180 transition-transform text-slate-400" />
                </button>
                <div className="absolute top-full right-0 mt-2 bg-white shadow-lg rounded-lg border border-gray-100 p-1 opacity-0 invisible group-hover/user:opacity-100 group-hover/user:visible transition-all duration-200 z-50 w-48">
                  <button onClick={handleCopyInviteLink} className="w-full text-left px-4 py-2 hover:bg-green-50 rounded-md text-[14px] font-medium flex items-center gap-2 text-green-700">
                    {copied ? <><Gift size={14} /> Copied!</> : <><Copy size={14} /> Invite a Friend</>}
                  </button>
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2 hover:bg-red-50 rounded-md text-[14px] font-medium flex items-center gap-2 text-red-700">
                    <LogOut size={14} />
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 font-bold text-[13px]">
                    <span className="text-yellow-500">⚡</span>
                    <span className="text-slate-700">Guest</span>
                    <span className="text-slate-300">|</span>
                    <span className={getCreditColor()}>{credit}s</span>
                </div>
                <div className="h-6 w-px bg-slate-200"></div>
                <button onClick={() => onOpenAuthModal('signup')} className="font-bold text-slate-600 hover:text-blue-700 transition-colors text-[14px] px-3">
                    Sign Up
                </button>
                <button onClick={() => onOpenAuthModal('signin')} className="bg-[#1e5aa0] text-white px-5 py-2 rounded-lg font-bold text-[14px] hover:bg-blue-800 transition-all shadow-md">
                    Sign In
                </button>
              </>
            )}

            <div className="relative group/lang">
              <button className="flex items-center border border-gray-200 rounded-md px-2 py-1 gap-2 cursor-pointer hover:bg-gray-50 transition-colors">
                <span className="text-base">{currentLang.flag}</span>
                <span className="text-[12px] font-bold text-gray-600 uppercase">{currentLang.code}</span>
                <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </button>
              <div className="absolute top-full right-0 mt-2 bg-white shadow-lg rounded-lg border border-gray-100 p-1 opacity-0 invisible group-hover/lang:opacity-100 group-hover/lang:visible transition-all duration-200 z-50 w-36">
                {Object.entries(languages).map(([code, { flag, name }]) => (
                  <button 
                    key={code}
                    onClick={() => handleLangChange(code as Language)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-md text-sm font-medium flex items-center gap-2"
                  >
                    <span className="text-base">{flag}</span>
                    <span>{name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div id="mobile-actions" className="flex items-center gap-2">
            <div className="relative group/lang">
                <button className="flex items-center border border-gray-200 rounded-md px-2 py-1 gap-2 cursor-pointer hover:bg-gray-50 transition-colors">
                    <span className="text-base">{currentLang.flag}</span>
                    <span className="text-[12px] font-bold text-gray-600 uppercase">{currentLang.code}</span>
                    <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </button>
                <div className="absolute top-full right-0 mt-2 bg-white shadow-lg rounded-lg border border-gray-100 p-1 opacity-0 invisible group-hover/lang:opacity-100 group-hover/lang:visible transition-all duration-200 z-50 w-36">
                    {Object.entries(languages).map(([code, { flag, name }]) => (
                    <button 
                        key={code}
                        onClick={() => handleLangChange(code as Language)}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-md text-sm font-medium flex items-center gap-2"
                    >
                        <span className="text-base">{flag}</span>
                        <span>{name}</span>
                    </button>
                    ))}
                </div>
            </div>

            <div className="relative group/mobile-menu">
                <button className="bg-[#1e5aa0] text-white px-5 py-2 rounded-lg font-bold text-[14px] hover:bg-blue-800 transition-all shadow-md">
                {t.menu}
                </button>
                <div className="absolute top-full right-0 pt-3 opacity-0 invisible group-hover/mobile-menu:opacity-100 group-hover/mobile-menu:visible transition-all duration-300 translate-y-2 group-hover/mobile-menu:translate-y-0 z-50">
                <div className="bg-white shadow-[0_20px_40px_-10px_rgba(0,0,0,0.15)] rounded-2xl border border-gray-100 p-2 min-w-[200px]">
                    {mainNavItems.map(item => (
                    <button 
                        key={item.key}
                        onClick={() => onNavigate(item.view)}
                        className="w-full text-left px-4 py-3 hover:bg-[#f0f9ff] rounded-xl text-[#1e293b] hover:text-[#1e5aa0] font-bold text-[15px] transition-colors"
                    >
                        {item.label}
                    </button>
                    ))}
                </div>
                </div>
            </div>
          </div>

        </div>
      </div>
      <style>{`
        #mobile-actions, #mobile-user-info { display: none; }

        @media (max-width: 1024px) {
          header.fixed {
            position: relative !important;
          }
          main > div[class*="pt-24"], 
          main > div[class*="pt-32"] {
            padding-top: 2.5rem !important;
          }
        }

        @media (max-width: 480px) {
          #logo-container {
            display: none !important;
          }
          #mobile-user-info {
             display: flex !important;
          }
          #desktop-actions {
            display: none !important;
          }
          #mobile-actions {
            display: flex !important;
          }
          nav.hidden.xl\\:flex {
             display: none !important;
          }
        }

        @media (min-width: 481px) and (max-width: 1279px) {
          .xl\\:hidden {
            display: none !important;
          }
          nav.hidden.xl\\:flex {
            display: flex !important;
            gap: 12px !important;
          }
          nav .group\\/nav > button {
            font-size: 14px !important;
            padding: 4px 0 !important;
          }
          #desktop-actions {
            display: flex !important;
            gap: 8px !important;
          }
          #desktop-actions button {
            font-size: 13px !important;
            padding: 6px 12px !important;
          }
          #desktop-actions .group\\/lang button {
             padding: 4px 6px !important;
          }
        }
      `}</style>
    </header>
  );
};
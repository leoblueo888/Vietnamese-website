import React, { useState } from 'react';
import { Volume2, ChevronDown, Sparkles, Star, Radio, Play, Info } from 'lucide-react';

// URL ảnh icon từ Google Drive
const FIRE_HORSE_IMG_URL = "https://lh3.googleusercontent.com/d/1c6n5KJGN7iKDWteKshkjxm8tQ24w5gxx";

const TRANSLATIONS = {
  en: {
    title: "Tet Holiday Wishes",
    howToPlay: "Choose a Tet wish from the list, listen to the pronunciation, and share it with your loved ones for a lucky 2026!",
    startBtn: "START MISSION",
    selectLang: "Select Interface Language",
    tetWishes: "Tet Wishes",
    lunarYear: "Fire Horse Year 2026",
    footerCelebration: "2026 BINH NGO CELEBRATION",
    footerMotto: "Family Reunion",
    instruction: "Select a wish to view and hear",
    systemLabel: "System v4.0"
  },
  ru: {
    title: "Пожелания на Тет",
    howToPlay: "Выберите пожелание на Тет из списка, прослушайте произношение и поделитесь им с близкими для удачного 2026 года!",
    startBtn: "НАЧАТЬ",
    selectLang: "Выберите язык интерфейса",
    tetWishes: "Пожелания на Тет",
    lunarYear: "Год Огненной Лошади 2026",
    footerCelebration: "ПРАЗДНОВАНИЕ БИНЬ НГО 2026",
    footerMotto: "Воссоединение семьи",
    instruction: "Выберите пожелание, чтобы увидеть и услышать",
    systemLabel: "Система v4.0"
  }
};

const GREETINGS_DATA = [
  { vi: "1. Chúc mừng năm mới!", en: "1. Happy New Year!", ru: "1. С Новым годом!" },
  { vi: "2. Mình chúc bạn vạn sự như ý", en: "2. I wish you all your wishes come true", ru: "2. Желаю, чтобы все ваши желания сбылись" },
  { vi: "3. Mình chúc bạn an khang thịnh vượng", en: "3. I wish you security, good health and prosperity", ru: "3. Желаю вам безопасности, здоровья и процветания" },
  { vi: "4. Mình chúc bạn sức khỏe dồi dào", en: "4. I wish you plenty of health", ru: "4. Желаю вам крепкого здоровья" },
  { vi: "5. Mình chúc bạn làm ăn phát tài", en: "5. I wish you may your business flourish", ru: "5. Желаю процветания вашему бизнесу" },
  { vi: "6. Mình chúc bạn tấn tài tấn lộc", en: "6. I wish you a compact of wealth and luck", ru: "6. Желаю богатства и удачи" },
  { vi: "7. Mình chúc bạn sống lâu trăm tuổi", en: "7. I wish you live to be a hundred years old", ru: "7. Желаю вам прожить до ста лет" },
  { vi: "8. Mình chúc bạn tiền vô như nước", en: "8. I wish you may money flow in like water", ru: "8. Желаю, чтобы деньги текли к вам рекой" },
  { vi: "9. Mình chúc bạn hay ăn chóng lớn", en: "9. I wish you eat well and grow fast", ru: "9. Желаю хорошо кушать и быстро расти" },
  { vi: "10. Mình chúc bạn năm mới thắng lợi mới", en: "10. I wish you new year, new victories", ru: "10. Желаю в новом году новых побед" }
];

export const GameTetWishes: React.FC = () => {
  const [isStarted, setIsStarted] = useState(false);
  const [lang, setLang] = useState<'en' | 'ru'>('en'); 
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showEnMenu, setShowEnMenu] = useState(false);
  const [showViMenu, setShowViMenu] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const t = TRANSLATIONS[lang];

  const playAudio = (text: string, languageCode: string) => {
    const cleanText = text.replace(/^\d+\.\s*/, '');
    const utterance = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(cleanText)}&tl=${languageCode}&client=tw-ob`;
    const audio = new Audio(utterance);
    audio.play().catch(e => console.error("Audio play error:", e));
  };

  const handleSelect = (index: number) => {
    setIsAnimating(true);
    setSelectedIndex(index);
    setShowEnMenu(false);
    setShowViMenu(false);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const current = GREETINGS_DATA[selectedIndex];

  const CustomIcon: React.FC<{ sizeClass?: string }> = ({ sizeClass = "w-24 h-24" }) => (
    <div className={`${sizeClass} rounded-3xl overflow-hidden bg-white shadow-xl border-4 border-orange-400 flex items-center justify-center shrink-0`}>
      <img 
        src={FIRE_HORSE_IMG_URL} 
        alt="Fire Horse" 
        className="w-full h-full object-cover"
        onError={(e: any) => {
          e.target.style.display = 'none';
          e.target.parentNode.innerHTML = '<div class="text-orange-500 font-bold">2026</div>';
        }}
      />
    </div>
  );

  if (!isStarted) {
    return (
      <div className="w-full h-full bg-[#fff7ed] flex items-center justify-center p-4 overflow-y-auto font-sans text-slate-700">
        <div className="relative w-full max-w-[1000px] min-h-[500px] md:aspect-video bg-white/80 backdrop-blur-2xl rounded-[2rem] shadow-[0_20px_60px_rgba(251,146,60,0.2)] flex flex-col items-center justify-center border border-orange-100 overflow-hidden p-6 md:p-12">
          
          <div className="absolute -top-[10%] -right-[5%] w-[40%] h-[40%] bg-orange-200/40 rounded-full blur-[100px] animate-pulse"></div>
          
          <div className="relative z-10 flex flex-col items-center text-center w-full max-w-2xl">
            <div className="mb-6 md:mb-8 animate-bounce-slow">
              <CustomIcon sizeClass="w-24 h-24 md:w-32 md:h-32" />
            </div>
            
            <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-orange-900 uppercase italic mb-4 px-2">
              {t.title}
            </h1>
            
            <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 md:p-6 mb-6 md:mb-8 backdrop-blur-sm shadow-inner w-full">
              <div className="flex items-center gap-2 text-orange-600 font-bold mb-2 justify-center uppercase tracking-widest text-[10px] md:text-xs">
                <Info size={14} /> HOW TO PLAY
              </div>
              <p className="text-slate-600 leading-relaxed text-xs md:text-sm">
                {t.howToPlay}
              </p>
            </div>

            <div className="flex flex-col items-center gap-4 md:gap-6 w-full">
              <div className="flex items-center gap-3 md:gap-4">
                <button 
                  onClick={() => setLang('en')}
                  className={`px-6 md:px-8 py-2 md:py-3 rounded-full text-xs md:text-base font-bold transition-all border-2 ${lang === 'en' ? 'bg-orange-600 border-orange-600 text-white shadow-lg scale-105' : 'bg-white border-slate-200 text-slate-400 hover:border-orange-200'}`}
                >
                  ENGLISH
                </button>
                <button 
                  onClick={() => setLang('ru')}
                  className={`px-6 md:px-8 py-2 md:py-3 rounded-full text-xs md:text-base font-bold transition-all border-2 ${lang === 'ru' ? 'bg-orange-600 border-orange-600 text-white shadow-lg scale-105' : 'bg-white border-slate-200 text-slate-400 hover:border-orange-200'}`}
                >
                  RUSSIAN
                </button>
              </div>

              <button 
                onClick={() => setIsStarted(true)}
                className="group relative flex items-center gap-3 px-10 md:px-16 py-4 md:py-5 bg-orange-950 text-white rounded-2xl font-black text-xs md:text-base tracking-[0.2em] hover:bg-orange-600 hover:scale-105 transition-all shadow-2xl active:scale-95"
              >
                <Play size={18} fill="currentColor" />
                {t.startBtn}
                <div className="absolute -inset-1 bg-orange-400/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-[#fff7ed] flex items-center justify-center p-2 md:p-4 overflow-y-auto font-sans text-slate-700">
      <div className="relative w-full max-w-[1000px] min-h-[600px] h-auto md:aspect-video bg-white/70 backdrop-blur-2xl rounded-[1.5rem] md:rounded-[2rem] shadow-[0_20px_60px_rgba(251,146,60,0.15)] flex flex-col border border-orange-50 overflow-hidden">
        
        {/* Header - Responsive height and layout */}
        <header className="relative z-10 h-auto md:h-36 flex flex-col md:flex-row items-center justify-between px-6 md:px-10 py-6 md:py-0 border-b border-orange-100 bg-white/50 gap-4">
          <div className="flex items-center gap-4 md:gap-6">
            <CustomIcon sizeClass="w-16 h-16 md:w-20 md:h-20" />
            <div>
              <h1 className="text-xl md:text-3xl font-black tracking-widest text-slate-800 uppercase italic">
                {t.title}
              </h1>
              <div className="flex items-center gap-2 text-[10px] md:text-[12px] text-orange-600 font-bold font-mono tracking-[0.2em] md:tracking-[0.3em] uppercase mt-1">
                {t.lunarYear}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-6 font-mono text-[10px] md:text-[11px] text-slate-400">
             <div className="flex flex-row md:flex-col items-center md:items-end gap-3 md:gap-2">
                <span className="text-orange-900 font-black uppercase whitespace-nowrap">
                  {lang === 'en' ? 'LUNAR NEW YEAR' : 'ЛУННЫЙ НОВЫЙ ГОД'}
                </span>
                <span className="text-orange-500 uppercase px-3 py-1 bg-orange-50 rounded-full font-bold border border-orange-100">
                  {t.systemLabel}
                </span>
             </div>
          </div>
        </header>

        {/* Main Content Area - Responsive padding */}
        <main className="relative z-30 flex-1 flex flex-col justify-center px-6 md:px-20 py-8 md:py-4 gap-6">
          
          {/* Interface Lang Selection */}
          <div className="relative z-50">
            <div className="flex items-center gap-2 mb-2 ml-1">
              <Radio size={10} className="text-orange-500" />
              <span className="text-[9px] md:text-[10px] font-black font-mono text-orange-600 uppercase tracking-[0.2em] md:tracking-[0.3em]">
                {t.tetWishes}
              </span>
            </div>
            
            <div className="relative flex items-center gap-3 md:gap-4 bg-white/80 border border-orange-100 rounded-[1rem] md:rounded-[1.2rem] p-4 md:p-6 transition-all border-b-4 border-b-orange-200">
              <div className="relative flex-1">
                <button 
                  onClick={() => { setShowEnMenu(!showEnMenu); setShowViMenu(false); }}
                  className="w-full flex items-center justify-between text-left gap-2"
                >
                  <h2 className={`text-sm md:text-xl font-bold text-slate-700 transition-all duration-300 ${isAnimating ? 'opacity-20 blur-sm scale-95' : 'opacity-100'}`}>
                    {current[lang]}
                  </h2>
                  <div className="w-6 h-6 md:w-8 md:h-8 shrink-0 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                    <ChevronDown className={`transition-transform duration-300 ${showEnMenu ? 'rotate-180' : ''}`} size={14} />
                  </div>
                </button>

                {showEnMenu && (
                  <div className="absolute top-[calc(100%+0.5rem)] left-0 w-full bg-white border border-orange-100 rounded-xl shadow-xl max-h-40 overflow-y-auto z-[9999] py-1 custom-scroll">
                    {GREETINGS_DATA.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelect(idx)}
                        className={`w-full text-left px-4 py-3 hover:bg-orange-50 text-xs md:text-sm font-bold border-b border-slate-50 last:border-0 ${selectedIndex === idx ? 'bg-orange-100 text-orange-700' : 'text-slate-500'}`}
                      >
                        {item[lang]}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <button 
                onClick={() => playAudio(current[lang], lang)}
                className="w-10 h-10 md:w-14 md:h-14 bg-gradient-to-tr from-orange-500 to-orange-700 text-white rounded-xl md:rounded-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all shrink-0 shadow-lg shadow-orange-200"
              >
                <Volume2 size={20} />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4 py-1">
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-orange-200 to-transparent"></div>
            <div className="p-1.5 bg-orange-50 rounded-full border border-orange-100">
               <Sparkles size={14} className="text-orange-400" />
            </div>
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-orange-200 to-transparent"></div>
          </div>

          {/* Vietnamese Interface - Responsive text sizes */}
          <div className="relative z-40">
            <div className="flex items-center gap-2 mb-2 ml-1">
              <Radio size={10} className="text-orange-500" />
              <span className="text-[9px] md:text-[10px] font-black font-mono text-orange-600 uppercase tracking-[0.2em] md:tracking-[0.3em]">
                {lang === 'en' ? 'Vietnamese Wish' : 'Вьетнамское пожелание'}
              </span>
            </div>

            <div className="relative flex items-center gap-3 md:gap-4 bg-gradient-to-br from-white to-orange-50/50 border-2 border-orange-200 rounded-[1rem] md:rounded-[1.2rem] p-4 md:p-6 shadow-lg shadow-orange-100/10">
              <div className="relative flex-1">
                <button 
                  onClick={() => { setShowViMenu(!showViMenu); setShowEnMenu(false); }}
                  className="w-full flex items-center justify-between text-left gap-2"
                >
                  <h2 className={`text-xl md:text-3xl font-black text-orange-900 leading-tight transition-all duration-300 ${isAnimating ? 'opacity-20 blur-sm scale-95' : 'opacity-100'}`}>
                    {current.vi}
                  </h2>
                  <div className="w-6 h-6 md:w-8 md:h-8 shrink-0 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                    <ChevronDown className={`transition-transform duration-300 ${showViMenu ? 'rotate-180' : ''}`} size={14} />
                  </div>
                </button>

                {showViMenu && (
                  <div className="absolute bottom-[calc(100%+0.5rem)] left-0 w-full bg-white border border-orange-100 rounded-xl shadow-xl max-h-40 overflow-y-auto z-[9999] py-1 custom-scroll">
                    {GREETINGS_DATA.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelect(idx)}
                        className={`w-full text-left px-4 py-3 hover:bg-orange-600 hover:text-white text-xs md:text-sm font-bold border-b border-slate-50 last:border-0 ${selectedIndex === idx ? 'bg-orange-100 text-orange-700' : 'text-slate-600'}`}
                      >
                        {item.vi}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button 
                onClick={() => playAudio(current.vi, 'vi')}
                className="w-10 h-10 md:w-14 md:h-14 bg-orange-900 text-white rounded-xl md:rounded-2xl flex items-center justify-center hover:bg-orange-700 hover:scale-105 active:scale-95 transition-all shrink-0 shadow-lg shadow-orange-900/20"
              >
                <Volume2 size={20} />
              </button>
            </div>
          </div>
        </main>

        {/* Footer Area - Hide complex parts on tiny screens if needed */}
        <footer className="relative z-10 h-16 md:h-20 bg-white/60 flex items-center justify-between px-6 md:px-10 text-[9px] md:text-[11px] font-black font-mono text-orange-600 uppercase tracking-[0.2em] md:tracking-[0.5em] border-t border-orange-100">
          <div className="flex items-center gap-3">
             <Star size={12} fill="currentColor" className="text-orange-400" /> 
             <span className="hidden xs:inline">{t.footerCelebration}</span>
             <span className="xs:hidden">BINH NGO 2026</span>
          </div>
          <div className="flex items-center gap-4 italic font-bold text-slate-400/80">
             {t.footerMotto}
          </div>
        </footer>
      </div>
    </div>
  );
};

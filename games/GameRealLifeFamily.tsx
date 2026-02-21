import React, { useState, useCallback } from 'react';
import { Zap, Star, ShieldCheck, Play, Globe } from 'lucide-react';

export const GameRealLifeFamily: React.FC = () => {
  const [gameState, setGameState] = useState('START');
  const [language, setLanguage] = useState<'Eng' | 'Rus'>('Eng');
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [hoveredTip, setHoveredTip] = useState<string | null>(null);

  // --- HÀM PLAY AUDIO DÙNG SPEECH SYNTHESIS (ỔN ĐỊNH 100%) ---
  const playSpeech = useCallback((text: string) => {
    if (!text) return;

    // 1. Hủy bỏ mọi câu đang đọc dở để tránh chồng chéo
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'vi-VN';
    
    // 2. Tinh chỉnh thông số để giọng nghe tự nhiên nhất có thể
    utterance.rate = 0.85; // Đọc chậm một chút để rõ âm tiết tiếng Việt
    utterance.pitch = 1.0; // Độ cao vừa phải
    utterance.volume = 1.0;

    // 3. Cố gắng chọn giọng đọc xịn (nếu trình duyệt có sẵn nhiều lựa chọn)
    const voices = window.speechSynthesis.getVoices();
    const viVoice = voices.find(v => v.lang.includes('vi') && v.name.includes('Google')) || 
                    voices.find(v => v.lang.includes('vi'));
    
    if (viVoice) {
      utterance.voice = viVoice;
    }

    window.speechSynthesis.speak(utterance);
  }, []);

  const uiContent = {
    Eng: {
      title: "LEARN FAMILY WORDS",
      howTo: "HOW TO PLAY",
      desc: "Click on each member to hear the Vietnamese pronunciation and learn the vocabulary.",
      startBtn: "START GAME",
      engine: "SYSTEM VOICE ACTIVE", // Cập nhật nhãn
      footer: "Extended Family Mapping System",
      instruction: "Tap members to hear voice"
    },
    Rus: {
      title: "ИЗУЧАЙТЕ СЛОВА О СЕМЬЕ",
      howTo: "КАК ИГРАТЬ",
      desc: "Нажмите на каждого члена семьи, чтобы услышать вьетнамское произношение и выучить лексику.",
      startBtn: "НАЧАТЬ ИГРУ",
      engine: "ГОЛОС СИСТЕМЫ АКТИВЕН",
      footer: "Система картирования расширенной семьи",
      instruction: "Нажмите, чтобы услышать голос"
    }
  };

  const familyData = {
    grandParentsPaternal: [
      { id: 'gp1', vn: 'Ông Nội', en: 'Grandfather', ru: 'Дедушка (папа)', group: 'g1_paternal', tip: { Eng: 'Parents of Father', Rus: 'Родители отца' } },
      { id: 'gp2', vn: 'Bà Nội', en: 'Grandmother', ru: 'Бабушка (папа)', group: 'g1_paternal', tip: { Eng: 'Parents of Father', Rus: 'Родители отца' } },
    ],
    grandParentsMaternal: [
      { id: 'gp3', vn: 'Ông Ngoại', en: 'Grandfather', ru: 'Дедушка (мама)', group: 'g1_maternal', tip: { Eng: 'Parents of Mother', Rus: 'Родители матери' } },
      { id: 'gp4', vn: 'Bà Ngoại', en: 'Grandmother', ru: 'Бабушка (мама)', group: 'g1_maternal', tip: { Eng: 'Parents of Mother', Rus: 'Родители матери' } },
    ],
    extended: [
      { id: 'ex1', vn: 'Bác', en: 'Uncle/Aunt', ru: 'Дядя/Тетя', group: 'extended_rel', tip: { Eng: 'Older than parents', Rus: 'Старше родителей' } },
      { id: 'ex2', vn: 'Chú', en: 'Uncle', ru: 'Дядя', group: 'extended_rel', tip: { Eng: 'Younger than parents', Rus: 'Младше родителей' } },
      { id: 'ex3', vn: 'Cô', en: 'Aunt', ru: 'Тетя', group: 'extended_rel', tip: { Eng: 'Younger than parents', Rus: 'Младше родителей' } },
    ],
    parents: [
      { id: 'p1', vn: 'Bố', en: 'Father', ru: 'Отец', group: 'g2' },
      { id: 'p2', vn: 'Mẹ', en: 'Mother', ru: 'Мать', group: 'g2' },
    ],
    siblings: [
      { id: 'c1', vn: 'Anh trai', en: 'Older Brother', ru: 'Старший брат', group: 'g3' },
      { id: 'c2', vn: 'Chị gái', en: 'Older Sister', ru: 'Старшая сестра', group: 'g3' },
      { id: 'c3', vn: 'Tôi', en: 'Me', ru: 'Я', group: 'g3', active: true, specialBorder: 'border-slate-950 ring-2 ring-slate-950/20' },
      { id: 'sp1', vn: 'Vợ', en: 'Wife', ru: 'Жена', group: 'spouse' },
      { id: 'sp2', vn: 'Chồng', en: 'Husband', ru: 'Муж', group: 'spouse' },
      { id: 'c4', vn: 'Em trai', en: 'Younger Brother', ru: 'Младший брат', group: 'g3' },
      { id: 'c5', vn: 'Em gái', en: 'Younger Sister', ru: 'Младшая сестра', group: 'g3' },
    ],
    children: [
      { id: 'c6', vn: 'Con trai', en: 'Son', ru: 'Сын', group: 'g4' },
      { id: 'c7', vn: 'Con gái', en: 'Daughter', ru: 'Дочь', group: 'g4' },
      { id: 'c8', vn: 'Cháu trai', en: 'Nephew', ru: 'Племянник', group: 'g4_grand', tip: { Eng: 'Nephew', Rus: 'Племянник' } },
      { id: 'c9', vn: 'Cháu gái', en: 'Niece', ru: 'Племянница', group: 'g4_grand', tip: { Eng: 'Niece', Rus: 'Племянница' } },
    ]
  };

  const MemberCard: React.FC<{ member: any }> = ({ member }) => {
    const isSelected = selectedMember === member.id;
    const isHovered = hoveredTip === member.id;
    const theme: Record<string, string> = {
      g1_paternal: 'border-cyan-400 bg-cyan-50/60 text-cyan-900 shadow-[0_0_10px_rgba(34,211,238,0.15)]',
      g1_maternal: 'border-teal-600 bg-teal-50/70 text-teal-900 shadow-[0_0_10px_rgba(13,148,136,0.2)]',
      extended_rel: 'border-sky-500 bg-sky-50/60 text-sky-900 shadow-[0_0_10px_rgba(14,165,233,0.15)]',
      g2: 'border-indigo-400 bg-indigo-50/60 text-indigo-900 shadow-[0_0_10px_rgba(129,140,248,0.15)]',
      g3: 'border-fuchsia-400 bg-fuchsia-50/60 text-fuchsia-900 shadow-[0_0_10px_rgba(232,121,249,0.15)]',
      spouse: 'border-amber-400 bg-amber-50/60 text-amber-900 shadow-[0_0_10px_rgba(251,191,36,0.15)]',
      g4: 'border-emerald-400 bg-emerald-50/60 text-emerald-900 shadow-[0_0_10px_rgba(52,211,153,0.15)]',
      g4_grand: 'border-emerald-700 bg-emerald-100/60 text-emerald-950 shadow-[0_0_12px_rgba(4,120,87,0.25)]'
    };

    const subtitle = language === 'Eng' ? member.en : member.ru;
    const tooltipText = member.tip ? member.tip[language] : null;
    const baseBorderClass = member.specialBorder ? member.specialBorder : (theme[member.group] || theme.g2);

    return (
      <div className="relative">
        <button
          onMouseEnter={() => tooltipText && setHoveredTip(member.id)}
          onMouseLeave={() => setHoveredTip(null)}
          onClick={() => {
            setSelectedMember(member.id);
            playSpeech(member.vn); // Chuyển sang hàm Synthesis
          }}
          className={`group relative flex flex-col items-center justify-center p-2 rounded-xl border-2 transition-all duration-300 backdrop-blur-md ${baseBorderClass} ${isSelected ? 'scale-105 ring-4 ring-white/50 z-20 shadow-lg' : 'hover:-translate-y-1'} w-18 h-14 sm:w-28 sm:h-20`}
        >
          <div className="flex items-center gap-1">
            {member.active && <Star size={10} fill="currentColor" className="text-yellow-500 animate-pulse" />}
            <span className="font-black text-[9px] sm:text-[13px] uppercase tracking-tighter leading-tight text-center">{member.vn}</span>
          </div>
          <span className="text-[7px] sm:text-[10px] font-medium opacity-60 leading-none mt-1 text-center px-1 truncate w-full italic">{subtitle}</span>
        </button>

        {isHovered && tooltipText && (
          <div className="absolute z-[100] bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[150px] bg-slate-800 text-white text-[8px] sm:text-[10px] py-1.5 px-3 rounded-lg shadow-xl pointer-events-none animate-in fade-in slide-in-from-bottom-2">
            {tooltipText}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-800" />
          </div>
        )}
      </div>
    );
  };

  if (gameState === 'START') {
    return (
      <div className="w-full h-full bg-[#f8fafc] flex items-center justify-center p-4 font-sans overflow-hidden">
        <div className="w-full h-full max-w-4xl aspect-video bg-white/90 backdrop-blur-2xl rounded-[2rem] shadow-2xl border border-white/50 flex flex-col items-center justify-center relative overflow-hidden text-center p-8">
          <div className="absolute -top-20 -left-20 w-80 h-80 bg-indigo-200/30 blur-[120px] rounded-full" />
          <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-fuchsia-200/30 blur-[120px] rounded-full" />
          <div className="relative z-10 flex flex-col items-center gap-6">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-5 rounded-[2rem] shadow-2xl mb-2 text-white">
              <Zap size={48} fill="currentColor" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-5xl font-black text-slate-800 tracking-tighter mb-2">{uiContent[language].title}</h1>
              <div className="h-1 w-24 bg-gradient-to-r from-indigo-500 to-fuchsia-500 mx-auto rounded-full"></div>
            </div>
            <div className="max-w-md bg-white/50 p-6 rounded-2xl border border-slate-100 backdrop-blur-sm shadow-sm">
              <h2 className="font-bold text-slate-600 text-sm uppercase tracking-widest mb-2 flex items-center justify-center gap-2">
                <Star size={16} className="text-amber-400" /> {uiContent[language].howTo}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">{uiContent[language].desc}</p>
            </div>
            <div className="flex gap-4 items-center mt-2">
              <button onClick={() => setLanguage('Eng')} className={`flex items-center gap-2 px-6 py-3 rounded-full border-2 transition-all font-bold text-sm ${language === 'Eng' ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg scale-105' : 'bg-white text-slate-400 border-slate-100'}`}><Globe size={16} /> ENGLISH</button>
              <button onClick={() => setLanguage('Rus')} className={`flex items-center gap-2 px-6 py-3 rounded-full border-2 transition-all font-bold text-sm ${language === 'Rus' ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg scale-105' : 'bg-white text-slate-400 border-slate-100'}`}><Globe size={16} /> РУССКИЙ</button>
            </div>
            <button onClick={() => setGameState('PLAYING')} className="mt-4 flex items-center gap-3 bg-slate-900 text-white px-12 py-5 rounded-full font-black tracking-[0.2em] hover:bg-indigo-600 transition-all shadow-xl"><Play fill="currentColor" size={20} /> {uiContent[language].startBtn}</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-[#f8fafc] flex items-center justify-center p-1 sm:p-4 overflow-hidden font-sans">
      <div className="w-full h-full max-w-6xl aspect-video bg-white/90 backdrop-blur-2xl rounded-[1.5rem] sm:rounded-[2.5rem] shadow-2xl border border-white/50 flex flex-col p-4 sm:p-6 relative overflow-hidden">
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-cyan-200/20 blur-[100px] rounded-full" />
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-fuchsia-200/20 blur-[100px] rounded-full" />
        <div className="relative z-10 flex items-center justify-between mb-4 px-2">
          <div className="flex items-center gap-3">
            <button onClick={() => setGameState('START')} className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-xl shadow-lg hover:rotate-12 transition-transform">
              <Zap size={18} className="text-white" fill="currentColor" />
            </button>
            <div>
              <h1 className="font-black text-slate-800 text-xs sm:text-lg uppercase tracking-wider leading-none">{uiContent[language].title}</h1>
              <p className="text-[7px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Interactive Family Map v7.5</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 bg-slate-100/50 px-4 py-2 rounded-full border border-slate-200 text-[10px] font-bold text-slate-500">
             <ShieldCheck size={14} className="text-emerald-500" /> {uiContent[language].engine}
          </div>
        </div>

        <div className="relative z-10 flex-1 flex flex-col items-center justify-center space-y-1 sm:space-y-3">
          {/* Tree Sections (G1, G2, G3, G4) remain same as original logic */}
          <div className="flex flex-col items-center w-full">
            <div className="flex gap-4 sm:gap-16">
              <div className="flex gap-1.5 sm:gap-3">
                <MemberCard member={familyData.grandParentsPaternal[0]} />
                <MemberCard member={familyData.grandParentsPaternal[1]} />
              </div>
              <div className="flex gap-1.5 sm:gap-3">
                <MemberCard member={familyData.grandParentsMaternal[0]} />
                <MemberCard member={familyData.grandParentsMaternal[1]} />
              </div>
            </div>
            <div className="h-4 w-px bg-slate-200 mt-1"></div>
          </div>
          <div className="flex flex-col items-center w-full -mt-2">
            <div className="w-[60%] h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
            <div className="h-4 w-px bg-slate-200"></div>
            <div className="flex flex-wrap justify-center gap-1.5 sm:gap-4">
              {familyData.extended.slice(0, 1).map(m => <MemberCard key={m.id} member={m} />)}
              <MemberCard member={familyData.parents[0]} />
              <MemberCard member={familyData.parents[1]} />
              {familyData.extended.slice(1).map(m => <MemberCard key={m.id} member={m} />)}
            </div>
            <div className="h-4 w-px bg-slate-200 mt-1"></div>
          </div>
          <div className="flex flex-col items-center w-full -mt-2">
            <div className="w-[85%] h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
            <div className="h-4 w-px bg-slate-200"></div>
            <div className="flex flex-wrap justify-center gap-1.5 sm:gap-3 px-2">
              {familyData.siblings.map(sib => <MemberCard key={sib.id} member={sib} />)}
            </div>
            <div className="h-4 w-px bg-slate-200 mt-1"></div>
          </div>
          <div className="flex flex-col items-center w-full -mt-2">
            <div className="w-[40%] h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
            <div className="h-4 w-px bg-slate-200"></div>
            <div className="flex flex-wrap justify-center gap-2 sm:gap-6">
              {familyData.children.map(child => <MemberCard key={child.id} member={child} />)}
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-4 pt-4 border-t border-slate-100 flex justify-between items-center text-[8px] sm:text-[10px] font-bold text-slate-400">
          <span className="uppercase tracking-[0.2em]">{uiContent[language].footer}</span>
          <div className="flex flex-wrap gap-2 sm:gap-4 justify-end">
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-cyan-400" /> Nội</span>
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-teal-600" /> Ngoại</span>
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-sky-500" /> Bác/Cô</span>
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-slate-950" /> Tôi</span>
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-700" /> Cháu</span>
          </div>
        </div>
      </div>
    </div>
  );
};

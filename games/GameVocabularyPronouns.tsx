
import React, { useEffect, useRef, useState } from 'react';
import { VocabUnit } from '../components/VocabularyPage';
import { Language } from '../App';
import { translations } from '../translations';
import { Maximize, Minimize } from 'lucide-react';

const gameHTML = `
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vietnamese Pronouns Learning Game</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@400;600;700&display=swap');
        
        body {
            font-family: 'Quicksand', sans-serif;
            background-color: #f0f4f8;
            overflow-x: hidden;
            -webkit-tap-highlight-color: transparent;
        }

        .pronoun-group {
            transition: all 0.3s ease;
            border: 2px solid transparent;
            min-height: 50px; 
            padding: 4px !important;
        }

        .active-context { background-color: #fef3c7 !important; border-color: #f59e0b; }
        .active-i { background-color: #dbeafe !important; border-color: #3b82f6; }
        .active-you { background-color: #d1fae5 !important; border-color: #10b981; }

        .word-grid {
            display: flex;
            gap: 4px;
            width: 100%;
            justify-content: center;
            flex-wrap: wrap;
        }

        .tooltip-container { position: relative; }
        .tooltip-text {
            visibility: hidden;
            width: 140px;
            background-color: #333;
            color: #fff;
            text-align: center;
            border-radius: 4px;
            padding: 4px;
            position: absolute;
            z-index: 50;
            bottom: 115%;
            left: 50%;
            transform: translateX(-50%);
            opacity: 0;
            transition: opacity 0.2s;
            font-size: 0.7rem;
            pointer-events: none;
        }
        .tooltip-container:hover .tooltip-text { visibility: visible; opacity: 1; }

        .word-card {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 4px 8px;
            background-color: white;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
            font-size: 0.85rem;
            cursor: pointer;
            transition: transform 0.1s, box-shadow 0.1s;
            box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }
        .word-card:active {
            transform: scale(0.92);
            background-color: #f9fafb;
        }

        #start-screen {
            position: fixed;
            inset: 0;
            background: linear-gradient(135deg, #3b82f6 0%, #10b981 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 100;
            transition: opacity 0.5s ease;
        }
        .hidden-screen { opacity: 0; pointer-events: none; }

        .tab-btn {
            transition: all 0.2s;
            border-bottom: 3px solid transparent;
            white-space: nowrap;
        }
        .tab-btn.active {
            border-bottom-color: #3b82f6;
            color: #3b82f6;
            background-color: #eff6ff;
        }
    </style>
</head>
<body class="flex flex-col items-center justify-center min-h-screen p-2">

    <!-- Start Screen -->
    <div id="start-screen">
        <div class="bg-white p-8 rounded-3xl shadow-2xl max-w-lg w-full text-center m-4">
            <h1 id="ui-title-start" class="text-3xl font-bold text-gray-800 mb-4">Vietnamese Pronouns Game</h1>
            
            <div class="mb-6">
                <p id="ui-how-to-label" class="font-bold text-blue-600 mb-2">How to play:</p>
                <ul id="ui-instructions" class="text-sm text-gray-600 space-y-2 text-left list-disc list-inside">
                    <li>Click a row to highlight it.</li>
                    <li>Tap directly on any word box to hear its pronunciation.</li>
                    <li>Hover over words in the "I" column for usage tips.</li>
                </ul>
            </div>

            <div class="flex flex-col gap-4">
                <div class="flex items-center justify-center gap-4 p-2 bg-gray-100 rounded-xl">
                    <span id="ui-lang-label" class="text-sm font-bold text-gray-500">Language:</span>
                    <button onclick="setLanguage('eng')" id="lang-eng" class="px-4 py-2 rounded-lg font-bold transition-all bg-blue-500 text-white ring-4 ring-blue-100">Eng</button>
                    <button onclick="setLanguage('rus')" id="lang-rus" class="px-4 py-2 rounded-lg font-bold transition-all bg-gray-200 text-gray-600">Rus</button>
                </div>
                <button onclick="startGame()" id="ui-btn-start" class="w-full py-4 bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-bold text-xl rounded-xl transition-transform active:scale-95 shadow-lg">START GAME</button>
            </div>
        </div>
    </div>

    <!-- Main Game UI -->
    <div id="game-ui" class="max-w-6xl w-full bg-white rounded-xl shadow-xl p-3 md:p-6 opacity-0">
        <div class="flex flex-col md:flex-row items-center justify-between border-b-2 border-yellow-400 mb-4 pb-2 gap-4">
            <h1 id="ui-title-main" class="text-xl font-bold text-gray-800 uppercase whitespace-nowrap">
                Vietnamese Pronouns
            </h1>
            <div class="flex flex-wrap justify-center gap-1 overflow-x-auto max-w-full pb-1">
                <button onclick="setTab('you')" id="tab-you" class="tab-btn px-2 py-1 text-[10px] md:text-xs font-bold rounded-t-lg text-gray-500 active">I & YOU</button>
                <button onclick="setTab('weyou')" id="tab-weyou" class="tab-btn px-2 py-1 text-[10px] md:text-xs font-bold rounded-t-lg text-gray-500">WE & YOU</button>
                <button onclick="setTab('he')" id="tab-he" class="tab-btn px-2 py-1 text-[10px] md:text-xs font-bold rounded-t-lg text-gray-500">I & HE</button>
                <button onclick="setTab('she')" id="tab-she" class="tab-btn px-2 py-1 text-[10px] md:text-xs font-bold rounded-t-lg text-gray-500">I & SHE</button>
                <button onclick="setTab('they')" id="tab-they" class="tab-btn px-2 py-1 text-[10px] md:text-xs font-bold rounded-t-lg text-gray-500">I & THEY</button>
                <button onclick="setTab('it')" id="tab-it" class="tab-btn px-2 py-1 text-[10px] md:text-xs font-bold rounded-t-lg text-gray-500 uppercase">It</button>
            </div>
        </div>

        <!-- Table View -->
        <div id="table-view" class="grid grid-cols-3 gap-1 md:gap-2">
            <div id="header-age" class="text-center p-2 rounded-t-lg bg-amber-500 text-white font-bold text-[9px] md:text-sm uppercase leading-tight flex items-center justify-center">AGE DIFF.</div>
            <div id="header-i" class="text-center p-2 rounded-t-lg bg-blue-600 text-white font-bold text-[9px] md:text-sm uppercase flex items-center justify-center">I</div>
            <div id="header-target" class="text-center p-2 rounded-t-lg bg-green-600 text-white font-bold text-[9px] md:text-sm uppercase flex items-center justify-center">YOU</div>

            <div id="main-grid" class="contents"></div>
        </div>

        <!-- Information View (for IT tab) -->
        <div id="info-view" class="hidden min-h-[300px] flex items-center justify-center p-4 md:p-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
            <div class="text-center space-y-4">
                <div class="inline-block p-4 bg-blue-100 rounded-full mb-2">
                    <span class="text-4xl">🐾</span>
                </div>
                <h2 id="it-title" class="text-xl md:text-2xl font-bold text-gray-800"></h2>
                <p id="it-desc" class="text-base md:text-lg text-gray-600 max-w-md mx-auto"></p>
                <div onclick="speakWord('Nó')" class="mt-6 p-4 bg-white shadow-md rounded-xl inline-flex items-center gap-3 border border-gray-100 cursor-pointer active:scale-95 transition-transform">
                    <span class="text-3xl font-bold text-gray-800">Nó</span>
                    <span class="text-2xl text-blue-500">🔊</span>
                </div>
            </div>
        </div>

        <div id="footer-note" class="mt-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500 text-[10px] md:text-xs text-gray-600">
            <span id="ui-footer-guide">Tap words to hear. Click row to highlight.</span>
        </div>
    </div>

    <script>
        let currentLang = 'eng';
        let currentTab = 'you';

        const translations = {
            eng: {
                title: "Vietnamese Pronouns Game",
                howTo: "How to play:",
                instr: ["Click a row to highlight it.", "Tap directly on any word box to hear its pronunciation.", "Hover over 'I' boxes for usage details."],
                startBtn: "START GAME",
                headerAge: "AGE DIFF.",
                footer: "Tap words to hear. Click row to highlight.",
                itTitle: '"It" means <span class="text-blue-600">Nó</span> in Vietnamese',
                itDesc: 'Used for both <span class="font-bold">objects</span> and <span class="font-bold">animals</span>. Vietnamese don\\'t call animals "She" or "He".',
                contexts_listener: ["Similar age", "Older than listener", "Younger than listener", "Parent\\'s age", "Son\\'s age", "Grandparent\\'s age", "Grandson\\'s age"],
                contexts_person: ["Similar age", "Older than person", "Younger than person", "Father\\'s age", "Son\\'s age", "Grandfather\\'s age", "Grandson\\'s age"],
                tooltips: {
                    "Tôi": "Formal/Neutral", "Mình": "Close friends", "Anh": "I am Male", "Chị": "I am Female", "Em": "I am younger", "Bác": "Older than parent", "Chú": "Male, younger", "Cô": "Female, younger", "Cháu": "I am child/grandchild age", "Ông": "I am old male", "Bà": "I am old female",
                    "Chúng tôi": "We (Formal)", "Chúng mình": "We (Close)", "Chúng anh": "We (Older males)", "Chúng chị": "We (Older females)", "Chúng em": "We (Younger)", "Chúng bác": "We (Parent age)", "Chúng cháu": "We (Grandchild age)", "Chúng ông": "We (Grandfather age)", "Chúng bà": "We (Grandmother age)"
                }
            },
            rus: {
                title: "Вьетнамские Местоимения",
                howTo: "Как играть:",
                instr: ["Нажмите на строку, чтобы выделить её.", "Нажмите прямо на слово, чтобы услышать его.", "Детали использования 'Я' — при наведении."],
                startBtn: "НАЧАТЬ ИГРУ",
                headerAge: "ВОЗРАСТ",
                footer: "Нажмите на слово, чтобы услышать. Нажмите на строку для выделения.",
                itTitle: '"It" означает <span class="text-blue-600">Nó</span> по-вьетнамски',
                itDesc: 'Используется для <span class="font-bold">предметов</span> и <span class="font-bold">животных</span>. Животных не называют "Он" или "Она".',
                contexts_listener: ["Тот же возраст", "Старше", "Младше", "Возраст отца", "Возраст сына", "Возраст дедушки", "Возраст внука"],
                contexts_person: ["Тот же возраст", "Старше", "Младше", "Возраст отца", "Возраст сына", "Возраст дедушки", "Возраст внука"],
                tooltips: {
                    "Tôi": "Формально/Нейтрально", "Mình": "Близкие друзья", "Anh": "Я - Мужчина", "Chị": "Я - Женщина", "Em": "Я - младше", "Bác": "Старше родителя", "Chú": "Мужчина, младше отца", "Cô": "Женщина, младше матери", "Cháu": "Я возраста ребенка/внука", "Ông": "Я пожилой мужчина", "Bà": "Я пожилая женщина"
                }
            }
        };

        const pronounData = {
            you: ["Bạn", "Em", "Anh / Chị", "Cháu", "Bác / Chú / Cô", "Cháu", "Ông / Bà"],
            weyou: ["Các bạn", "Các em", "Các anh / Các chị", "Các cháu", "Các bác / Các chú / Các cô", "Các cháu", "Các ông / Các bà"],
            he: ["Bạn ấy / Nó", "Em ấy / Nó", "Anh ấy", "Cháu ấy / Nó", "Bác ấy / Chú ấy", "Cháu ấy / Nó", "Ông ấy"],
            she: ["Bạn ấy / Nó", "Em ấy / Nó", "Chị ấy", "Cháu ấy / Nó", "Bác ấy / Cô ấy", "Cháu ấy / Nó", "Bà ấy"],
            they: ["Họ / Các bạn ấy", "Các em ấy", "Các anh / Các chị ấy", "Các cháu ấy", "Các bác / Các chú ấy / Các cô ấy", "Các cháu ấy", "Các ông / Các bà ấy"]
        };

        const iColumnData = {
            you: ["Tôi / Mình", "Anh / Chị", "Em", "Bác / Chú / Cô", "Cháu", "Ông / Bà", "Cháu"],
            weyou: ["Chúng tôi / Chúng mình", "Chúng anh / Chúng chị", "Chúng em", "Chúng bác / Chúng chú / Chúng cô", "Chúng cháu", "Chúng ông / Chúng bà", "Chúng cháu"],
            he: ["Tôi / Mình", "Anh / Chị", "Em", "Bác / Chú / Cô", "Cháu", "Ông / Bà", "Cháu"],
            she: ["Tôi / Mình", "Anh / Chị", "Em", "Bác / Chú / Cô", "Cháu", "Ông / Bà", "Cháu"],
            they: ["Tôi / Mình", "Anh / Chị", "Em", "Bác / Chú / Cô", "Cháu", "Ông / Bà", "Cháu"]
        };

        const pronounPairsTemplate = [0, 1, 2, 3, 4, 5, 6];

        const ttsAudio = new Audio();

        function setLanguage(lang) {
            currentLang = lang;
            document.getElementById('lang-eng').className = \`px-4 py-2 rounded-lg font-bold transition-all \${lang === 'eng' ? 'bg-blue-500 text-white ring-4 ring-blue-100' : 'bg-gray-200 text-gray-600'}\`;
            document.getElementById('lang-rus').className = \`px-4 py-2 rounded-lg font-bold transition-all \${lang === 'rus' ? 'bg-blue-500 text-white ring-4 ring-blue-100' : 'bg-gray-200 text-gray-600'}\`;
            
            const t = translations[lang];
            document.getElementById('ui-title-start').innerText = t.title;
            document.getElementById('ui-title-main').innerText = t.title;
            document.getElementById('ui-how-to-label').innerText = t.howTo;
            document.getElementById('ui-btn-start').innerText = t.startBtn;
            document.getElementById('header-age').innerText = t.headerAge;
            document.getElementById('ui-footer-guide').innerText = t.footer;
            
            document.getElementById('it-title').innerHTML = t.itTitle;
            document.getElementById('it-desc').innerHTML = t.itDesc;
            
            const instrList = document.getElementById('ui-instructions');
            instrList.innerHTML = t.instr.map(i => \`<li>\${i}</li>\`).join('');
            
            renderGrid();
        }

        function setTab(tab) {
            currentTab = tab;
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            document.getElementById(\`tab-\${tab}\`).classList.add('active');
            
            const tableView = document.getElementById('table-view');
            const infoView = document.getElementById('info-view');
            const footerNote = document.getElementById('footer-note');

            if (tab === 'it') {
                tableView.classList.add('hidden');
                infoView.classList.remove('hidden');
                footerNote.classList.add('invisible');
            } else {
                tableView.classList.remove('hidden');
                infoView.classList.add('hidden');
                footerNote.classList.remove('invisible');

                if (tab === 'weyou') {
                    document.getElementById('header-i').innerText = (currentLang === 'rus') ? 'МЫ' : 'WE';
                    document.getElementById('header-target').innerText = (currentLang === 'rus') ? 'ВЫ (МН.Ч.)' : 'YOU (PL)';
                } else {
                    document.getElementById('header-i').innerText = (currentLang === 'rus') ? 'Я' : 'I';
                    document.getElementById('header-target').innerText = tab.toUpperCase();
                }
                renderGrid();
            }
        }

        function startGame() {
            document.getElementById('start-screen').classList.add('hidden-screen');
            document.getElementById('game-ui').style.opacity = '1';
        }

        function speakWord(text) {
            const cleanText = text.replace(/\\(.*\\)/g, '').split('/')[0].trim();
            ttsAudio.src = \`https://translate.google.com/translate_tts?ie=UTF-8&q=\${encodeURIComponent(cleanText)}&tl=vi&client=tw-ob\`;
            return ttsAudio.play().catch(e => console.log(e));
        }

        function renderGrid() {
            const mainGrid = document.getElementById('main-grid');
            if (!mainGrid) return;
            mainGrid.innerHTML = '';
            const t = translations[currentLang];
            const targetPronouns = pronounData[currentTab];
            const iPronouns = iColumnData[currentTab];
            
            if (!targetPronouns) return;

            const contextList = (currentTab === 'you' || currentTab === 'weyou') ? t.contexts_listener : t.contexts_person;

            pronounPairsTemplate.forEach((index) => {
                // Age Difference Cell
                const contextCell = document.createElement('div');
                contextCell.className = 'pronoun-group flex items-center justify-center bg-gray-50 text-[9px] md:text-xs text-center font-medium text-gray-500 rounded-l-lg border-y border-l px-1 cursor-pointer';
                contextCell.id = \`context-group-\${index}\`;
                contextCell.innerText = contextList[index];
                contextCell.onclick = () => selectPair(index);

                // I Column Cell
                const iCell = document.createElement('div');
                iCell.className = 'pronoun-group flex items-center justify-center bg-gray-50 border-y cursor-pointer';
                iCell.id = \`i-group-\${index}\`;
                iCell.onclick = () => selectPair(index);
                const iGrid = document.createElement('div');
                iGrid.className = 'word-grid';
                iPronouns[index].split('/').map(w => w.trim()).forEach(word => {
                    const card = document.createElement('div');
                    card.className = 'word-card tooltip-container';
                    card.onclick = (e) => { e.stopPropagation(); speakWord(word); selectPair(index); };
                    if(t.tooltips[word]) card.innerHTML = \`<span class="tooltip-text">\${t.tooltips[word]}</span>\`;
                    card.innerHTML += \`<span class="font-bold">\${word}</span>\`;
                    iGrid.appendChild(card);
                });
                iCell.appendChild(iGrid);

                // Target Column Cell
                const targetCell = document.createElement('div');
                targetCell.className = 'pronoun-group flex items-center justify-center bg-gray-50 rounded-r-lg border-y border-r cursor-pointer';
                targetCell.id = \`target-group-\${index}\`;
                targetCell.onclick = () => selectPair(index);
                const targetGrid = document.createElement('div');
                targetGrid.className = 'word-grid';
                targetPronouns[index].split('/').map(w => w.trim()).forEach(word => {
                    const card = document.createElement('div');
                    card.className = 'word-card';
                    card.onclick = (e) => { e.stopPropagation(); speakWord(word); selectPair(index); };
                    card.innerHTML += \`<span class="font-bold">\${word}</span>\`;
                    targetGrid.appendChild(card);
                });
                targetCell.appendChild(targetGrid);

                mainGrid.appendChild(contextCell);
                mainGrid.appendChild(iCell);
                mainGrid.appendChild(targetCell);
            });
        }

        function selectPair(index) {
            document.querySelectorAll('.pronoun-group').forEach(el => el.classList.remove('active-i', 'active-you', 'active-context'));
            const c = document.getElementById(\`context-group-\${index}\`);
            const i = document.getElementById(\`i-group-\${index}\`);
            const t = document.getElementById(\`target-group-\${index}\`);
            if(c) c.classList.add('active-context');
            if(i) i.classList.add('active-i');
            if(t) t.classList.add('active-you');
        }

        window.onload = () => setLanguage('eng');
    </script>
</body>
</html>
`;

// Added props interface to fix the TypeScript error
interface GameVocabularyPronounsProps {
  unit: VocabUnit;
  onBack: () => void;
  language: Language;
}

export const GameVocabularyPronouns: React.FC<GameVocabularyPronounsProps> = ({ unit, onBack, language }) => {
  const t = translations[language];
  const [iframeSrc, setIframeSrc] = useState<string | undefined>(undefined);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const gameWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Inject the selected language from React into the game's initial state
    const finalHtml = gameHTML.replace(
      'let currentLang = \'eng\';',
      `let currentLang = '${language === 'ru' ? 'rus' : 'eng'}';`
    );
    const blob = new Blob([finalHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    setIframeSrc(url);

    // Clean up the object URL when the component unmounts
    return () => URL.revokeObjectURL(url);
  }, [language]);

  const handleFullscreenChange = () => {
    setIsFullscreen(!!document.fullscreenElement);
  };

  useEffect(() => {
    const wrapper = gameWrapperRef.current;
    if (wrapper) {
      // Use the wrapper for fullscreen events to keep it contained
      const fullscreenEvents = ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'msfullscreenchange'];
      fullscreenEvents.forEach(event => document.addEventListener(event, handleFullscreenChange));

      return () => {
        fullscreenEvents.forEach(event => document.removeEventListener(event, handleFullscreenChange));
      };
    }
  }, []);

  const toggleFullscreen = () => {
    const elem = gameWrapperRef.current;
    if (elem) {
      if (!document.fullscreenElement) {
        elem.requestFullscreen().catch(err => {
          console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
        });
      } else {
        document.exitFullscreen();
      }
    }
  };

  return (
    <div className="pt-24 md:pt-32 pb-32 bg-white min-h-screen">
      <div className="max-w-[1200px] mx-auto px-6">
        <nav className="flex items-center gap-2 text-[13px] text-slate-400 mb-12 uppercase tracking-widest font-bold">
          <span className="hover:text-[#1e5aa0] cursor-pointer transition-colors" onClick={onBack}>{t.pages.vocabulary}</span>
          <span className="text-slate-300">/</span>
          <span className="text-slate-800">{unit.title}</span>
        </nav>

        <div className="text-center mb-16 max-w-4xl mx-auto">
          <h1 className="text-[40px] md:text-[56px] font-black text-[#1e293b] leading-[1.1] tracking-tight mb-6">
            Vietnamese Pronouns
          </h1>
          <p className="text-lg md:text-xl text-slate-500 max-w-3xl mx-auto leading-relaxed">
            In Vietnamese, pronouns vary based on the age, gender, and social relationship of the people speaking.
          </p>
        </div>
        
        <div id="game-practice-section">
          <div ref={gameWrapperRef} className="relative w-full max-w-md md:max-w-6xl mx-auto aspect-[9/16] md:aspect-video bg-slate-100 rounded-2xl md:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            {iframeSrc ? (
              <iframe
                src={iframeSrc}
                className="w-full h-full"
                style={{ border: 'none' }}
                allow="fullscreen"
                title="Vietnamese Pronouns Learning Tool"
              ></iframe>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500">Loading Game...</div>
            )}
            <button 
              onClick={toggleFullscreen} 
              title="Toggle Fullscreen" 
              className="absolute bottom-2 right-2 bg-black/20 text-white/50 p-1.5 rounded-full backdrop-blur-sm hover:bg-black/40 hover:text-white/80 transition-all opacity-40 hover:opacity-100 z-50"
            >
              {isFullscreen ? <Minimize size={14} /> : <Maximize size={14} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

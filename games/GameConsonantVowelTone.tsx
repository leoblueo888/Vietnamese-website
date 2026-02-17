
import React, { useState, useEffect } from 'react';

// The user-provided HTML game code is stored as a template string.
const gameConsonantVowelToneHtml = `
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Consonant + Vowel + Tone game</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Rajdhani:wght@300;500;700&display=swap');

        :root {
            --neon-blue: #00f3ff;
            --neon-purple: #bc13fe;
            --dark-bg: #0a0b1e;
        }

        body {
            background-color: var(--dark-bg);
            color: white;
            font-family: 'Rajdhani', sans-serif;
            overflow: hidden; /* Cố định màn hình game */
            height: 100vh;
            width: 100vw;
            margin: 0;
            padding: 0;
            touch-action: manipulation;
        }

        .futuristic-card {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(15px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            box-shadow: 0 0 15px rgba(0, 243, 255, 0.05);
        }

        .neon-text {
            text-shadow: 0 0 10px var(--neon-blue), 0 0 20px var(--neon-blue);
            font-family: 'Orbitron', sans-serif;
        }

        /* Responsive Speaker Button */
        .speaker-btn {
            transition: all 0.2s ease;
            background: linear-gradient(135deg, rgba(0, 243, 255, 0.2), rgba(188, 19, 254, 0.2));
            border: 1px solid var(--neon-blue);
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
        }
        
        /* PC Speaker Size (+20% from 70px -> 84px) */
        @media (min-width: 768px) {
            .speaker-btn { width: 84px; height: 84px; font-size: 1.8rem; }
        }
        /* Mobile Speaker Size */
        @media (max-width: 767px) {
            .speaker-btn { width: 12vw; height: 12vw; font-size: 1.2rem; }
        }

        .nav-btn {
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid var(--neon-blue);
            color: var(--neon-blue);
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
        }

        .lang-btn {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(0, 243, 255, 0.3);
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 10px;
        }

        .lang-btn.active {
            border-color: var(--neon-blue);
            background: rgba(0, 243, 255, 0.2);
        }

        /* Responsive Drop Zone */
        .drop-zone {
            border: 2px dashed rgba(0, 243, 255, 0.3);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(0, 0, 0, 0.2);
            font-weight: bold;
        }
        /* PC Drop Zone (+20% from 110x70 -> 132x84) */
        @media (min-width: 768px) {
            .drop-zone { width: 132px; height: 84px; font-size: 1.4rem; }
        }
        @media (max-width: 767px) {
            .drop-zone { width: 25vw; height: 12vw; font-size: 1rem; border-radius: 8px; }
        }

        .drop-zone.correct {
            border: 2px solid #4ade80;
            background: rgba(74, 222, 128, 0.1);
            color: #4ade80;
        }

        /* Responsive Word Tag */
        .word-tag {
            background: rgba(188, 19, 254, 0.15);
            border: 1px solid var(--neon-purple);
            cursor: grab;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            border-radius: 8px;
            width: 100%;
        }
        @media (min-width: 768px) {
            .word-tag { height: 58px; font-size: 1.2rem; }
        }
        @media (max-width: 767px) {
            .word-tag { height: 8vh; font-size: 1rem; }
        }

        .consonant-btn {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(0, 243, 255, 0.2);
            border-radius: 4px;
            font-weight: bold;
            transition: all 0.2s;
            color: #ccc;
        }
        @media (max-width: 767px) {
            .consonant-btn { font-size: 0.7rem; padding: 2px; }
        }

        .consonant-btn.active {
            background: var(--neon-blue);
            color: black;
            box-shadow: 0 0 8px var(--neon-blue);
        }

        /* Mobile specific grid for speakers */
        @media (max-width: 767px) {
            .grid-speaker-zones {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                grid-template-rows: repeat(3, 1fr);
                gap: 5px;
                height: 100%;
                width: 100%;
            }
        }
        @media (min-width: 768px) {
            .grid-speaker-zones {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                /* Gap 2cm between items in row (~75px), Row gap 1.5cm (~56px) */
                column-gap: 75px;
                row-gap: 56px;
                height: auto;
                padding: 10px;
            }
        }

        #start-overlay {
            position: fixed;
            inset: 0;
            background: var(--dark-bg);
            z-index: 200;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }

        .glow-button {
            border: 2px solid var(--neon-blue);
            color: var(--neon-blue);
            padding: 10px 30px;
            font-family: 'Orbitron', sans-serif;
            border-radius: 50px;
            cursor: pointer;
        }

        /* Level 2 Archer stays responsive */
        .archer-wrapper {
            position: absolute;
            left: 5%;
            top: 50%;
            transform: translateY(-50%);
            width: 40vw;
            max-width: 320px;
            height: auto;
            z-index: 50;
        }
        
        /* How to play styles */
        .how-to-play-step {
            display: flex;
            align-items: flex-start;
            gap: 12px;
            margin-bottom: 12px;
            text-align: left;
        }
        .step-num {
            background: var(--neon-blue);
            color: black;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: bold;
            flex-shrink: 0;
            margin-top: 2px;
        }
    </style>
</head>
<body>

    <div id="language-selector" class="fixed top-1 right-1 z-[300] flex gap-1">
        <button onclick="setLanguage('vi')" id="lang-vi" class="lang-btn active">VI</button>
        <button onclick="setLanguage('en')" id="lang-en" class="lang-btn">EN</button>
        <button onclick="setLanguage('ru')" id="lang-ru" class="lang-btn">RU</button>
    </div>

    <!-- Start Screen -->
    <div id="start-overlay">
        <div class="text-center mb-6 max-w-xl">
            <h1 class="text-3xl md:text-5xl font-bold neon-text mb-6 uppercase tracking-[0.1em] leading-tight" data-i18n="title">Consonant + Vowel + Tone game</h1>
            
            <!-- How to Play Section -->
            <div class="futuristic-card p-6 border-blue-500/30 bg-blue-500/5 mb-8">
                <p class="text-blue-300 tracking-wider uppercase text-xs mb-4 font-bold opacity-80" data-i18n="howToPlayTitle">HOW TO PLAY</p>
                <div class="space-y-4">
                    <div class="how-to-play-step">
                        <div class="step-num">1</div>
                        <p class="text-white text-sm" data-i18n="step1">Chọn PHỤ ÂM ở thanh menu phía trên để bắt đầu từ vựng mới.</p>
                    </div>
                    <div class="how-to-play-step">
                        <div class="step-num">2</div>
                        <p class="text-white text-sm" data-i18n="step2">Nhấn vào biểu tượng LOA để nghe phát âm của từ.</p>
                    </div>
                    <div class="how-to-play-step">
                        <div class="step-num">3</div>
                        <p class="text-white text-sm" data-i18n="step3">KÉO các từ từ Kho Từ thả vào ô tương ứng với âm thanh vừa nghe.</p>
                    </div>
                </div>
            </div>
            
            <button onclick="enterGame()" class="glow-button text-lg px-12 py-4" style="border-color: #4ade80; color: #4ade80;" data-i18n="start">BẮT ĐẦU</button>
        </div>
    </div>

    <!-- Main Game UI -->
    <div id="game-container" class="hidden h-screen w-screen flex flex-col p-1 md:p-3 overflow-hidden">
        
        <!-- Header: 3/10 height -->
        <header class="h-[30vh] w-full flex flex-col md:flex-row gap-1 md:gap-2 mb-1 md:mb-2 shrink-0 overflow-hidden">
            <!-- Title Box -->
            <div class="futuristic-card p-2 md:p-6 flex flex-col justify-center w-full md:w-[35%] h-1/2 md:h-auto min-h-0">
                <h1 class="text-sm md:text-2xl font-bold neon-text uppercase tracking-widest leading-tight">Consonant + Vowel + Tone</h1>
                <div class="flex items-center gap-2 md:gap-6 mt-1 md:mt-4">
                    <p class="text-purple-400 font-bold tracking-widest uppercase text-[10px] md:text-lg"><span id="level-display">LV 1</span></p>
                    <div class="flex items-center gap-2">
                        <button onclick="prevRoundManual()" class="nav-btn md:w-8 md:h-8"><i class="fas fa-chevron-left text-[10px] md:text-sm"></i></button>
                        <p class="text-blue-300 tracking-wider min-w-[40px] md:min-w-[80px] text-center uppercase text-[10px] md:text-lg font-bold" id="round-display">1 / 9</p>
                        <button onclick="nextRoundManual()" class="nav-btn md:w-8 md:h-8"><i class="fas fa-chevron-right text-[10px] md:text-sm"></i></button>
                    </div>
                </div>
            </div>

            <!-- Consonant Box -->
            <div id="consonant-box" class="futuristic-card p-2 md:p-4 w-full md:w-[65%] flex flex-col justify-center h-1/2 md:h-auto min-h-0">
                <h3 class="text-[9px] md:text-lg font-bold mb-1 md:mb-2 text-cyan-400 uppercase tracking-widest text-center" data-i18n="consonantTitle">Phụ Âm</h3>
                <div id="consonant-list" class="grid grid-cols-7 md:grid-cols-9 gap-1 w-full overflow-y-auto md:overflow-visible"></div>
            </div>
        </header>

        <!-- Workspace: 7/10 height -->
        <main id="workspace-lv1" class="h-[70vh] flex-grow grid grid-cols-1 md:grid-cols-5 gap-1 md:gap-2 w-full overflow-hidden">
            <!-- Word Bank -->
            <div class="hidden md:flex md:col-span-1 futuristic-card p-2 flex-col h-full overflow-hidden">
                <h3 class="text-[10px] md:text-sm font-bold mb-2 text-purple-400 text-center uppercase" data-i18n="wordBank">Kho từ</h3>
                <div id="word-list-pc" class="flex flex-col gap-2 overflow-y-auto flex-grow pr-1"></div>
            </div>

            <!-- Listening Area -->
            <div class="md:col-span-4 flex h-full overflow-hidden gap-1">
                <!-- Mobile Word Bank -->
                <div class="flex md:hidden w-[30vw] futuristic-card p-1 flex-col h-full overflow-hidden shrink-0">
                     <h3 class="text-[8px] font-bold mb-1 text-purple-400 text-center uppercase" data-i18n="wordBank">Kho từ</h3>
                     <div id="word-list-mobile" class="flex flex-col gap-1 overflow-y-auto flex-grow"></div>
                </div>

                <div class="flex-grow futuristic-card p-2 flex flex-col items-center justify-center h-full relative overflow-hidden">
                    <div id="listening-area" class="grid-speaker-zones"></div>
                    <!-- PC Hint: Vertically Centered Box, Text matches Title Size -->
                    <div class="hidden md:flex items-center justify-center mt-6 pt-4 border-t border-white/5 w-full flex-grow-0">
                        <p class="text-center text-gray-400 text-2xl font-bold uppercase tracking-[0.2em]" data-i18n="hint">Nghe loa và thả chữ tương ứng</p>
                    </div>
                </div>
            </div>
        </main>

        <!-- Level 2 Workspace -->
        <main id="workspace-lv2" class="hidden h-[70vh] md:flex-grow w-full relative futuristic-card overflow-hidden">
             <div class="archer-wrapper">
                <svg viewBox="0 0 100 120" class="w-full h-full">
                    <path d="M75,15 Q20,60 75,105" fill="none" stroke="#fff" stroke-width="2" />
                    <g fill="none" stroke="#fff" stroke-width="2" id="aim-arm">
                        <circle cx="45" cy="30" r="10" stroke="var(--neon-blue)"/>
                        <line x1="45" y1="45" x2="45" y2="80" />
                        <line x1="45" x2="78" y1="55" y2="55" stroke-width="3" />
                    </g>
                </svg>
             </div>
             <div id="target-grid" class="absolute right-[5%] top-0 bottom-0 flex flex-col justify-around items-center w-[120px]"></div>
             <div class="absolute top-2 left-1/2 -translate-x-1/2 text-center">
                <div class="text-[10px] md:text-sm text-cyan-400 uppercase tracking-widest" id="target-count">0/9</div>
             </div>
        </main>
    </div>

    <!-- UI Overlay and Audio -->
    <div id="perfect-overlay" class="fixed inset-0 bg-black/90 hidden items-center justify-center z-[400] p-4">
        <div class="bg-gray-900 border-2 border-cyan-400 p-6 rounded-3xl text-center max-w-sm w-full">
            <h2 class="text-2xl font-bold neon-text mb-4" id="popup-title">XUẤT SẮC!</h2>
            <div id="review-list" class="flex flex-wrap justify-center gap-1 mb-6"></div>
            <button onclick="nextLevelOrRound()" class="bg-green-600 px-8 py-2 rounded-full font-bold uppercase text-xs" id="btn-next-text">Tiếp tục</button>
        </div>
    </div>

    <script>
        const i18n = {
            vi: { 
                title: "Consonant + Vowel + Tone game", start: "BẮT ĐẦU", wordBank: "KHO TỪ", consonantTitle: "PHỤ ÂM", 
                excellent: "XUẤT SẮC!", next: "TIẾP TỤC", howToPlayTitle: "HƯỚNG DẪN CÁCH CHƠI",
                step1: "Chọn PHỤ ÂM ở thanh menu phía trên để bắt đầu từ vựng mới.",
                step2: "Nhấn vào biểu tượng LOA để nghe phát âm của từ.",
                step3: "KÉO các từ từ Kho Từ thả vào ô tương ứng với âm thanh vừa nghe.",
                hint: "Nghe loa và thả chữ tương ứng"
            },
            en: { 
                title: "Consonant + Vowel + Tone game", start: "START", wordBank: "BANK", consonantTitle: "CONSONANTS", 
                excellent: "EXCELLENT!", next: "NEXT", howToPlayTitle: "HOW TO PLAY",
                step1: "Select a CONSONANT from the top menu to start.",
                step2: "Click the SPEAKER icon to hear the pronunciation.",
                step3: "DRAG words from the Bank into the drop zones.",
                hint: "Listen and drop the correct word"
            },
            ru: { 
                title: "Consonant + Vowel + Tone game", start: "НАЧАТЬ", wordBank: "СЛОВАРЬ", consonantTitle: "СОГЛАСНЫЕ", 
                excellent: "ОТЛИЧНО!", next: "ДАЛЕЕ", howToPlayTitle: "КАК ИГРАТЬ",
                step1: "Выберите СОГЛАСНУЮ в верхнем меню для начала.",
                step2: "Нажмите на ДИНАМИК, чтобы услышать произношение.",
                step3: "ПЕРЕТАЩИТЕ слова из словаря в нужные ячейки.",
                hint: "Слушайте и сопоставляйте слова"
            }
        };

        const consonants = ["", "b", "c", "ch", "d", "đ", "g", "gh", "gi", "h", "k", "kh", "l", "m", "n", "ng", "ngh", "nh", "ph", "qu", "r", "s", "t", "th", "tr", "v", "x"];
        const gameData = {
            level1: [
                { tones: ["a", "á", "à", "ả", "ã", "ạ"], base: "a" },
                { tones: ["o", "ó", "ò", "ỏ", "õ", "ọ"], base: "o" },
                { tones: ["ô", "ố", "ồ", "ổ", "ỗ", "ộ"], base: "ô" },
                { tones: ["ơ", "ớ", "ờ", "ở", "ỡ", "ợ"], base: "ơ" },
                { tones: ["e", "é", "è", "ẻ", "ẽ", "ẹ"], base: "e" },
                { tones: ["ê", "ế", "ề", "ể", "ễ", "ệ"], base: "ê" },
                { tones: ["u", "ú", "ù", "ủ", "ũ", "ụ"], base: "u" },
                { tones: ["ư", "ứ", "ừ", "ử", "ữ", "ự"], base: "ư" },
                { tones: ["i", "í", "ì", "ỉ", "ĩ", "ị"], base: "i" }
            ]
        };

        let currentLang = 'vi';
        let currentRoundIndex = 0;
        let currentLevel = 1;
        let selectedConsonant = "b";
        let userAnswers = [];
        let ttsAudio = new Audio();

        function isLegalCombination(c, v) {
            const nv = v.normalize('NFD').replace(/[\\u0300-\\u036f]/g, '').toLowerCase()[0];
            if (c === "gi" && nv === 'i') return false;
            if (['c', 'g', 'ng'].includes(c)) return !['i', 'e', 'ê'].includes(nv);
            if (['k', 'gh', 'ngh'].includes(c)) return ['i', 'e', 'ê'].includes(nv);
            return true;
        }

        function setLanguage(lang) {
            currentLang = lang;
            document.querySelectorAll('.lang-btn').forEach(b => b.classList.toggle('active', b.id === \`lang-\${lang}\`));
            
            document.querySelectorAll('[data-i18n]').forEach(el => {
                const key = el.getAttribute('data-i18n');
                if (i18n[lang][key]) el.innerText = i18n[lang][key];
            });
            
            updateRoundDisplay();
        }

        function enterGame() {
            document.getElementById('start-overlay').style.display = 'none';
            document.getElementById('game-container').classList.remove('hidden');
            initConsonantBoard();
            initRound();
        }

        function initConsonantBoard() {
            const container = document.getElementById('consonant-list');
            container.innerHTML = '';
            consonants.forEach(c => {
                const btn = document.createElement('button');
                btn.className = \`consonant-btn \${c === selectedConsonant ? 'active' : ''}\`;
                btn.innerText = c || "-";
                btn.onclick = () => { selectedConsonant = c; initConsonantBoard(); initRound(); };
                container.appendChild(btn);
            });
        }

        function initRound() {
            updateRoundDisplay();
            if (currentLevel === 1) setupLevel1(); else setupLevel2();
        }

        function updateRoundDisplay() {
            document.getElementById('round-display').innerText = \`\${currentRoundIndex + 1} / 9\`;
            document.getElementById('level-display').innerText = \`LV \${currentLevel}\`;
        }

        function setupLevel1() {
            const round = gameData.level1[currentRoundIndex];
            const isMobile = window.innerWidth < 768;
            const wordList = document.getElementById(isMobile ? 'word-list-mobile' : 'word-list-pc');
            const otherList = document.getElementById(isMobile ? 'word-list-pc' : 'word-list-mobile');
            
            wordList.innerHTML = '';
            otherList.innerHTML = '';
            document.getElementById('listening-area').innerHTML = '';

            const legalTones = round.tones.filter(v => isLegalCombination(selectedConsonant, v));
            userAnswers = new Array(legalTones.length).fill(null);

            const combined = legalTones.map(v => selectedConsonant + v);
            const shuffled = [...combined].sort(() => Math.random() - 0.5);

            shuffled.forEach(word => {
                const div = document.createElement('div');
                div.className = 'word-tag';
                div.innerText = word;
                div.draggable = true;
                div.id = \`word-\${word}\`;
                div.addEventListener('dragstart', (e) => e.dataTransfer.setData('text', word));
                div.addEventListener('touchstart', (e) => { window.currentDragged = word; }, {passive: true});
                wordList.appendChild(div);
            });

            combined.forEach((word, idx) => {
                const item = document.createElement('div');
                item.className = 'flex flex-col md:flex-row items-center gap-2 md:gap-4 justify-center';
                item.innerHTML = \`
                    <button onclick="speak('\${word}')" class="speaker-btn text-cyan-400">
                        <i class="fas fa-volume-up"></i>
                    </button>
                    <div class="drop-zone" data-target="\${word}"></div>
                \`;
                const dz = item.querySelector('.drop-zone');
                dz.addEventListener('dragover', e => e.preventDefault());
                dz.addEventListener('drop', e => handleDrop(e.dataTransfer.getData('text'), dz, word, idx));
                dz.onclick = () => { if (window.currentDragged) handleDrop(window.currentDragged, dz, word, idx); };
                document.getElementById('listening-area').appendChild(item);
            });
        }

        function handleDrop(dragged, dz, target, idx) {
            if (dragged === target && !userAnswers[idx]) {
                dz.innerText = dragged;
                dz.classList.add('correct');
                userAnswers[idx] = dragged;
                document.getElementById(\`word-\${dragged}\`)?.remove();
                window.currentDragged = null;
                if (userAnswers.filter(a => a).length === userAnswers.length) {
                    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
                    setTimeout(showPopup, 400);
                }
            }
        }

        function speak(text) {
            ttsAudio.src = \`https://translate.google.com/translate_tts?ie=UTF-8&q=\${encodeURIComponent(text)}&tl=vi&client=tw-ob\`;
            ttsAudio.play();
        }

        function showPopup() {
            const list = document.getElementById('review-list');
            list.innerHTML = '';
            userAnswers.forEach(w => {
                const d = document.createElement('div');
                d.className = 'bg-white/10 px-3 py-1 rounded-lg text-sm font-bold text-cyan-400';
                d.innerText = w;
                list.appendChild(d);
            });
            document.getElementById('perfect-overlay').style.display = 'flex';
        }

        function nextLevelOrRound() {
            document.getElementById('perfect-overlay').style.display = 'none';
            if (currentRoundIndex < 8) { currentRoundIndex++; initRound(); }
            else if (currentLevel === 1) { currentLevel = 2; currentRoundIndex = 0; initRound(); }
        }

        function prevRoundManual() { if (currentRoundIndex > 0) { currentRoundIndex--; initRound(); } }
        function nextRoundManual() { nextLevelOrRound(); }

        function setupLevel2() {
            document.getElementById('workspace-lv1').classList.add('hidden');
            document.getElementById('workspace-lv2').classList.remove('hidden');
            const targetGrid = document.getElementById('target-grid');
            targetGrid.innerHTML = '';
            const words = gameData.level1[currentRoundIndex].tones.filter(v => isLegalCombination(selectedConsonant, v)).map(v => selectedConsonant + v);
            words.forEach(w => {
                const btn = document.createElement('div');
                btn.className = 'w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-[10px] md:text-sm font-bold cursor-pointer';
                btn.innerText = w;
                btn.onclick = () => { 
                    btn.style.transform = 'scale(0)'; 
                    setTimeout(() => { if (targetGrid.querySelectorAll('[style*="scale(0)"]').length === words.length) nextLevelOrRound(); }, 500); 
                };
                targetGrid.appendChild(btn);
            });
        }
    </script>
</body>
</html>
`;

export const GameConsonantVowelTone: React.FC = () => {
    const [iframeSrc, setIframeSrc] = useState<string | undefined>(undefined);

    useEffect(() => {
        const blob = new Blob([gameConsonantVowelToneHtml], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        setIframeSrc(url);

        return () => {
            if (url) {
                URL.revokeObjectURL(url);
            }
        };
    }, []);

    if (!iframeSrc) {
        return <div className="w-full h-full flex items-center justify-center bg-slate-900 text-white">Loading Game...</div>;
    }

    return (
        <iframe
            src={iframeSrc}
            className="w-full h-full"
            style={{ border: 'none' }}
            title="Game: Consonant + Vowel + Tone"
            sandbox="allow-scripts allow-same-origin"
        />
    );
};

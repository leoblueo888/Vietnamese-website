
import React, { useState, useEffect } from 'react';

// The user-provided HTML game code is stored as a template string.
const gameVowelConsonantHtml = `
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>VOWEL + CONSONANT GAME</title>
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
            overflow: hidden;
            height: 100vh;
            width: 100vw;
            margin: 0;
            padding: 0;
            display: flex;
            flex-direction: column;
            user-select: none;
        }

        .futuristic-card {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 8px;
        }

        .neon-text {
            text-shadow: 0 0 10px var(--neon-blue), 0 0 20px var(--neon-blue);
            font-family: 'Orbitron', sans-serif;
        }

        /* Language Buttons Global Style */
        .lang-btn {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(0, 243, 255, 0.3);
            padding: 4px 10px;
            border-radius: 4px;
            font-size: 11px;
            transition: all 0.2s;
            color: #fff;
            font-weight: bold;
        }
        .lang-btn.active {
            border-color: var(--neon-blue);
            background: rgba(0, 243, 255, 0.2);
            box-shadow: 0 0 8px var(--neon-blue);
        }

        /* HEADER PC: 3/10 Screen height */
        #game-header {
            height: 30vh;
            display: flex;
            flex-direction: column;
            gap: 4px;
            padding: 8px;
            position: relative;
        }
        @media (min-width: 768px) {
            #game-header {
                flex-direction: row;
                padding: 15px;
            }
        }

        /* WORKSPACE: 7/10 Screen height */
        #main-workspace {
            height: 70vh;
        }

        /* Speaker & Dropzone Sizing */
        .speaker-btn {
            transition: all 0.2s ease;
            background: linear-gradient(135deg, rgba(0, 243, 255, 0.2), rgba(188, 19, 254, 0.2));
            border: 1px solid var(--neon-blue);
            display: flex;
            align-items: center;
            justify-content: center;
        }

        @media (min-width: 768px) {
            .speaker-btn {
                width: 90px;
                height: 90px;
            }
        }

        @media (max-width: 767px) {
            .speaker-btn {
                width: 14vw;
                height: 14vw;
            }
        }

        .drop-zone {
            border: 2px dashed rgba(0, 243, 255, 0.3);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(0, 0, 0, 0.2);
            font-weight: bold;
            transition: all 0.3s;
        }

        @media (min-width: 768px) {
            .drop-zone {
                width: 110px;
                height: 70px;
                font-size: 1.2rem;
            }
        }
        @media (max-width: 767px) {
            .drop-zone {
                width: 28vw;
                height: 10vw;
                font-size: 1rem;
            }
        }

        .drop-zone.correct {
            border: 2px solid #4ade80;
            background: rgba(74, 222, 128, 0.1);
            color: #4ade80;
        }

        .grid-speaker-zones {
            display: grid;
            height: 100%;
            width: 100%;
            justify-items: center;
            align-items: center;
        }
        @media (min-width: 768px) {
            .grid-speaker-zones {
                grid-template-columns: repeat(3, 1fr);
                gap: 75px 1.5rem;
            }
        }
        @media (max-width: 767px) {
            .grid-speaker-zones {
                grid-template-columns: repeat(2, 1fr);
                grid-template-rows: repeat(3, 1fr);
                gap: 10px;
            }
        }

        .word-tag {
            background: rgba(188, 19, 254, 0.15);
            border: 1px solid var(--neon-purple);
            cursor: grab;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            border-radius: 6px;
        }
        @media (min-width: 768px) {
            .word-tag { height: 50px; font-size: 1.2rem; }
        }
        @media (max-width: 767px) {
            .word-tag { height: 45px; font-size: 1rem; }
        }

        #word-bank-container { width: 30vw; }
        @media (min-width: 768px) { #word-bank-container { width: 20%; } }

        #listening-area-container { width: 70vw; }
        @media (min-width: 768px) { #listening-area-container { width: 80%; } }

        .consonant-btn {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(0, 243, 255, 0.2);
            padding: 4px 8px;
            border-radius: 6px;
            font-weight: bold;
            color: #ccc;
            min-width: 40px;
        }
        .consonant-btn.active {
            background: var(--neon-blue);
            color: black;
            box-shadow: 0 0 8px var(--neon-blue);
        }

        .nav-btn {
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid var(--neon-blue);
            color: var(--neon-blue);
            width: 28px;
            height: 28px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        #start-overlay {
            position: fixed;
            inset: 0;
            background: var(--dark-bg);
            z-index: 500;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }

        .how-to-play-list {
            text-align: left;
            margin-top: 10px;
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        .how-to-play-list li {
            display: flex;
            align-items: flex-start;
            gap: 10px;
            font-size: 13px;
        }
        .how-to-play-list li::before {
            content: "•";
            color: var(--neon-blue);
            font-weight: bold;
        }
    </style>
</head>
<body>

    <!-- Language Selector GLOBAL (Visible in Start & Game) -->
    <div class="fixed top-4 right-4 flex gap-2 z-[1000]">
        <button onclick="changeLang('vi')" id="lang-vi" class="lang-btn active">VI</button>
        <button onclick="changeLang('ru')" id="lang-ru" class="lang-btn">RU</button>
        <button onclick="changeLang('en')" id="lang-en" class="lang-btn">EN</button>
    </div>

    <!-- Overlay Khởi động -->
    <div id="start-overlay">
        <div class="text-center mb-8 w-full max-w-lg">
            <h1 class="text-3xl md:text-5xl font-bold neon-text mb-6 uppercase tracking-tighter" id="ui-title">VOWEL + CONSONANT GAME</h1>
            <div class="mx-auto p-6 border border-blue-500/30 rounded-xl bg-blue-500/5 futuristic-card">
                <h2 class="text-cyan-400 font-bold mb-4 uppercase text-sm tracking-widest" id="ui-how-to-play-label">HOW TO PLAY</h2>
                <ul class="how-to-play-list text-white/90" id="ui-how-to-play-content">
                    <!-- Dynamic content from JS -->
                </ul>
            </div>
        </div>
        <button onclick="enterGame()" class="border-2 border-green-400 text-green-400 px-10 py-4 rounded-full font-bold uppercase tracking-widest hover:bg-green-400 hover:text-black transition-all shadow-[0_0_15px_rgba(74,222,128,0.3)]" id="ui-start-btn">
            BẮT ĐẦU CHƠI
        </button>
    </div>

    <!-- Container Game Chính -->
    <div id="game-container" class="hidden h-full flex flex-col">
        <header id="game-header">
            <!-- Title Section -->
            <div class="futuristic-card flex-1 flex flex-col justify-center items-center px-4">
                <h1 class="text-xs md:text-xl font-bold neon-text uppercase tracking-widest text-center">Vowel + Consonant</h1>
                <div class="flex items-center gap-2 md:gap-6 mt-2">
                    <span id="level-display" class="text-[10px] md:text-sm text-purple-400 font-bold">LV 1</span>
                    <div class="flex items-center gap-2 md:gap-4">
                        <button onclick="prevRoundManual()" class="nav-btn"><i class="fas fa-chevron-left text-[10px]"></i></button>
                        <span id="round-display" class="text-[10px] md:text-sm font-bold min-w-[50px] text-center">1/11</span>
                        <button onclick="nextRoundManual()" class="nav-btn"><i class="fas fa-chevron-right text-[10px]"></i></button>
                    </div>
                </div>
            </div>

            <!-- Consonant Section -->
            <div class="futuristic-card flex-[1.5] flex flex-col justify-center items-center px-2">
                <p class="text-[10px] md:text-xs font-bold text-cyan-400 uppercase tracking-widest mb-2" id="ui-consonant-label">Phụ Âm Cuối</p>
                <div id="consonant-list" class="flex flex-wrap justify-center gap-1 md:gap-3"></div>
            </div>
        </header>

        <main id="main-workspace" class="flex p-1 gap-1">
            <section id="word-bank-container" class="futuristic-card flex flex-col">
                <h3 class="text-[10px] font-bold py-2 border-b border-white/10 text-center text-purple-400 uppercase" id="ui-word-bank-label">KHO TỪ</h3>
                <div id="word-list" class="flex-grow overflow-y-auto p-1 flex flex-col gap-2"></div>
            </section>

            <section id="listening-area-container" class="futuristic-card flex flex-col relative overflow-hidden">
                <div id="listening-area" class="grid-speaker-zones"></div>
                <div class="absolute bottom-1 w-full text-center pointer-events-none">
                    <p class="text-[9px] md:text-xs text-gray-500 uppercase tracking-widest opacity-60" id="ui-hint">Nghe và thả chữ tương ứng</p>
                </div>
            </section>
        </main>
    </div>

    <!-- Popup Result -->
    <div id="perfect-overlay" class="fixed inset-0 bg-black/95 hidden flex-col items-center justify-center z-[1000] p-4">
        <h2 class="text-3xl font-bold neon-text text-white mb-6 uppercase" id="ui-excellent">XUẤT SẮC!</h2>
        <div id="review-list" class="flex flex-wrap justify-center gap-2 mb-8"></div>
        <button onclick="nextLevelOrRound()" class="bg-green-600 text-white px-12 py-4 rounded-full font-bold uppercase text-sm tracking-widest hover:scale-105 transition-transform" id="ui-continue">TIẾP TỤC</button>
    </div>

    <script>
        const i18n = {
            vi: { 
                title: "VOWEL + CONSONANT GAME", 
                howToPlay: "HƯỚNG DẪN CÁCH CHƠI",
                steps: [
                    "Chọn PHỤ ÂM CUỐI ở thanh tiêu đề bên trên.",
                    "Nhấn vào biểu tượng LOA để nghe phát âm của từ.",
                    "KÉO TỪ từ kho bên trái vào ô vuông tương ứng."
                ],
                start: "BẮT ĐẦU CHƠI", 
                wordBank: "KHO TỪ", 
                hint: "Nghe & Thả chữ", 
                consonantTitle: "Phụ Âm Cuối",
                excellent: "XUẤT SẮC!",
                continue: "TIẾP TỤC"
            },
            en: { 
                title: "VOWEL + CONSONANT GAME", 
                howToPlay: "HOW TO PLAY",
                steps: [
                    "Select a FINAL CONSONANT from the top bar.",
                    "Click the SPEAKER icon to hear the word's pronunciation.",
                    "DRAG the word from the bank into the matching box."
                ],
                start: "START GAME", 
                wordBank: "WORD BANK", 
                hint: "Listen & Drop", 
                consonantTitle: "Final Consonant",
                excellent: "EXCELLENT!",
                continue: "CONTINUE"
            },
            ru: { 
                title: "VOWEL + CONSONANT GAME", 
                howToPlay: "КАК ИГРАТЬ",
                steps: [
                    "Выберите КОНЕЧНУЮ СОГЛАСНУЮ на верхней панели.",
                    "Нажмите на ДИНАМИК, чтобы услышать произношение.",
                    "ПЕРЕТАЩИТЕ слово из списка в соответствующее поле."
                ],
                start: "НАЧАТЬ ИГРУ", 
                wordBank: "СПИСОК", 
                hint: "Слушайте и бросайте", 
                consonantTitle: "Конечный согласный",
                excellent: "ОТЛИЧНО!",
                continue: "ПРОДОЛЖИТЬ"
            }
        };

        const ALL_CONSONANTS = ["c", "ch", "m", "n", "ng", "nh", "p", "t"];
        const gameData = [
            { tones: ["a", "á", "à", "ả", "ã", "ạ"], base: "a" },
            { tones: ["ă", "ắ", "ằ", "ẳ", "ẵ", "ặ"], base: "ă" },
            { tones: ["â", "ấ", "ầ", "ẩ", "ẫ", "ậ"], base: "â" },
            { tones: ["e", "é", "è", "ẻ", "ẽ", "ẹ"], base: "e" },
            { tones: ["ê", "ế", "ề", "ể", "ễ", "ệ"], base: "ê" },
            { tones: ["i", "í", "ì", "ỉ", "ĩ", "ị"], base: "i" },
            { tones: ["o", "ó", "ò", "ỏ", "õ", "ọ"], base: "o" },
            { tones: ["ô", "ố", "ồ", "ổ", "ỗ", "ộ"], base: "ô" },
            { tones: ["ơ", "ớ", "ờ", "ở", "ỡ", "ợ"], base: "ơ" },
            { tones: ["u", "ú", "ù", "ủ", "ũ", "ụ"], base: "u" },
            { tones: ["ư", "ứ", "ừ", "ử", "ữ", "ự"], base: "ư" }
        ];

        let currentRoundIndex = 0;
        let selectedConsonant = "n";
        let currentLang = 'vi';
        let userAnswers = [];

        function changeLang(lang) {
            currentLang = lang;
            document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
            document.getElementById(\`lang-\${lang}\`).classList.add('active');
            updateUI();
        }

        function updateUI() {
            const t = i18n[currentLang];
            document.getElementById('ui-title').innerText = t.title;
            document.getElementById('ui-how-to-play-label').innerText = t.howToPlay;
            
            // Update bullet points
            const content = document.getElementById('ui-how-to-play-content');
            content.innerHTML = t.steps.map(step => \`<li>\${step}</li>\`).join('');

            document.getElementById('ui-start-btn').innerText = t.start;
            document.getElementById('ui-word-bank-label').innerText = t.wordBank;
            document.getElementById('ui-hint').innerText = t.hint;
            document.getElementById('ui-consonant-label').innerText = t.consonantTitle;
            document.getElementById('ui-excellent').innerText = t.excellent;
            document.getElementById('ui-continue').innerText = t.continue;
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
            ALL_CONSONANTS.forEach(c => {
                const btn = document.createElement('button');
                btn.className = \`consonant-btn \${c === selectedConsonant ? 'active' : ''}\`;
                btn.innerText = c;
                btn.onclick = () => {
                    selectedConsonant = c;
                    initConsonantBoard();
                    initRound();
                };
                container.appendChild(btn);
            });
        }

        function initRound() {
            document.getElementById('round-display').innerText = \`\${currentRoundIndex + 1}/11\`;
            const currentRound = gameData[currentRoundIndex];
            const wordList = document.getElementById('word-list');
            const listeningArea = document.getElementById('listening-area');
            
            wordList.innerHTML = '';
            listeningArea.innerHTML = '';

            const legalWords = currentRound.tones.map(v => v + selectedConsonant);
            userAnswers = new Array(legalWords.length).fill(null);

            [...legalWords].sort(() => Math.random() - 0.5).forEach(word => {
                const div = document.createElement('div');
                div.className = 'word-tag';
                div.innerText = word;
                div.draggable = true;
                div.id = \`word-\${word}\`;
                div.addEventListener('dragstart', (e) => e.dataTransfer.setData('text', word));
                div.addEventListener('touchstart', (e) => {
                    window.currentDragged = word;
                });
                wordList.appendChild(div);
            });

            legalWords.forEach((word, index) => {
                const item = document.createElement('div');
                const isMobile = window.innerWidth < 768;
                
                if (isMobile) {
                    item.className = 'flex flex-col items-center justify-center gap-2 w-full';
                    item.innerHTML = \`
                        <button onclick="speakWord('\${word}', this)" class="speaker-btn rounded-full shrink-0">
                            <i class="fas fa-volume-up text-xl text-cyan-400"></i>
                        </button>
                        <div class="drop-zone shrink-0" data-target="\${word}"></div>
                    \`;
                } else {
                    item.className = 'flex items-center justify-center gap-3 w-full px-2';
                    item.innerHTML = \`
                        <button onclick="speakWord('\${word}', this)" class="speaker-btn rounded-full shrink-0">
                            <i class="fas fa-volume-up text-3xl text-cyan-400"></i>
                        </button>
                        <div class="drop-zone shrink-0" data-target="\${word}"></div>
                    \`;
                }

                const dz = item.querySelector('.drop-zone');
                dz.addEventListener('dragover', e => e.preventDefault());
                dz.addEventListener('drop', e => handleDrop(e, word, dz, index));
                
                dz.addEventListener('click', () => {
                    if (window.currentDragged === word) {
                        handleDrop({ preventDefault: () => {}, dataTransfer: { getData: () => word } }, word, dz, index);
                        window.currentDragged = null;
                    }
                });

                listeningArea.appendChild(item);
            });
        }

        function handleDrop(e, target, dz, index) {
            e.preventDefault();
            const dragged = e.dataTransfer.getData('text');
            if (dragged === target) {
                dz.innerText = dragged;
                dz.classList.add('correct');
                userAnswers[index] = dragged;
                document.getElementById(\`word-\${dragged}\`)?.remove();
                if (userAnswers.every(a => a !== null)) setTimeout(showSuccess, 500);
            }
        }

        function speakWord(word, btn) {
            if (btn) btn.disabled = true;
            const cleanWord = word.trim().normalize('NFC').toLowerCase();
            const url = \`https://translate.google.com/translate_tts?ie=UTF-8&q=\${encodeURIComponent(cleanWord)}&tl=vi&total=1&idx=0&textlen=\${cleanWord.length}&client=tw-ob\`;
            const audio = new Audio(url);
            audio.onended = () => { if (btn) btn.disabled = false; };
            audio.onerror = () => { if (btn) btn.disabled = false; };
            audio.play().catch(() => { if (btn) btn.disabled = false; });
        }

        function showSuccess() {
            confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
            document.getElementById('perfect-overlay').classList.remove('hidden');
            document.getElementById('perfect-overlay').classList.add('flex');
            const list = document.getElementById('review-list');
            list.innerHTML = '';
            userAnswers.forEach(w => {
                const d = document.createElement('div');
                d.className = 'bg-cyan-900 border border-cyan-400/30 px-6 py-2 rounded-lg text-cyan-300 font-bold';
                d.innerText = w;
                list.appendChild(d);
            });
        }

        function nextLevelOrRound() {
            document.getElementById('perfect-overlay').classList.add('hidden');
            document.getElementById('perfect-overlay').classList.remove('flex');
            if (currentRoundIndex < gameData.length - 1) {
                currentRoundIndex++;
                initRound();
            } else {
                currentRoundIndex = 0;
                initRound();
            }
        }

        function prevRoundManual() { if (currentRoundIndex > 0) { currentRoundIndex--; initRound(); } }
        function nextRoundManual() { if (currentRoundIndex < gameData.length - 1) { currentRoundIndex++; initRound(); } }

        // Initial UI Update
        updateUI();

        window.addEventListener('resize', () => { 
            if(!document.getElementById('game-container').classList.contains('hidden')) initRound(); 
        });
    </script>
</body>
</html>
`;

export const GameVowelConsonant: React.FC = () => {
    const [iframeSrc, setIframeSrc] = useState<string | undefined>(undefined);

    useEffect(() => {
        const blob = new Blob([gameVowelConsonantHtml], { type: 'text/html' });
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
            title="Game: Vowel + Consonant"
            sandbox="allow-scripts allow-same-origin"
        />
    );
};

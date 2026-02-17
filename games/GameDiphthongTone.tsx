import React, { useState, useEffect } from 'react';

// The user-provided HTML game code is stored as a template string.
const gameDiphthongToneHtml = `
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Vietnamese Tones Quest - 22 Diphthongs</title>
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
            display: flex;
            flex-direction: column;
            margin: 0;
            user-select: none;
        }

        /* --- Header: Fixed 3/10 Height --- */
        header {
            height: 30vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            background: rgba(10, 11, 30, 0.9);
            border-bottom: 1px solid rgba(0, 243, 255, 0.2);
            z-index: 50;
            padding: 0.5rem;
        }

        /* --- Main Content: 7/10 Height --- */
        main {
            height: 70vh;
            flex-grow: 1;
            position: relative;
            overflow: hidden;
        }

        .neon-text {
            text-shadow: 0 0 10px var(--neon-blue), 0 0 20px var(--neon-blue);
            font-family: 'Orbitron', sans-serif;
        }

        /* --- Layout Level 1 --- */
        .mobile-container {
            display: flex;
            height: 100%;
            width: 100%;
        }

        .mobile-sidebar {
            width: 30vw;
            height: 100%;
            border-right: 1px solid rgba(0, 243, 255, 0.2);
            background: rgba(255, 255, 255, 0.02);
            display: flex;
            flex-direction: column;
        }

        .mobile-play-area {
            width: 70vw;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1vh;
        }

        /* Grid 3x2 for Mobile */
        .listening-grid-mobile {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            grid-template-rows: repeat(3, 1fr);
            gap: 1vh;
            width: 100%;
            height: 100%;
        }

        /* PC Layout overrides */
        @media (min-width: 768px) {
            .mobile-container { 
                display: grid; 
                grid-template-columns: repeat(5, 1fr); 
                gap: 0; 
                padding: 0; 
            }
            .mobile-sidebar { 
                width: auto; 
                grid-column: span 1;
                height: 80%; /* Word box 80% vertically */
                align-self: flex-start; /* Move up close to header line */
                border: 1px solid rgba(0, 243, 255, 0.2);
                border-top: none; /* Blend with header border */
                border-radius: 0 0 15px 15px;
                margin-left: 10px;
                background: rgba(0, 243, 255, 0.05);
            }
            .mobile-play-area { 
                width: auto; 
                grid-column: span 4; 
                padding: 0.5vh; 
            }
            /* PC Grid 3x2 with minimal vertical space (approx 0.5cm) */
            .listening-grid-mobile { 
                grid-template-columns: repeat(3, 1fr); 
                grid-template-rows: repeat(2, 1fr); 
                gap: 2vh 1vw; /* 2vh is roughly 0.5cm-0.7cm on standard screens */
            }
        }

        /* Fluid Elements */
        .speaker-btn {
            height: 8vh;
            width: 8vh;
            max-width: 120px;
            max-height: 120px;
            border-radius: 50%;
            background: linear-gradient(135deg, rgba(0, 243, 255, 0.2), rgba(188, 19, 254, 0.2));
            border: 1px solid var(--neon-blue);
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
            font-size: 1.5rem;
        }

        @media (min-width: 768px) {
            .speaker-btn {
                height: 11vh; /* Optimized size */
                width: 11vh;
                font-size: 2.2rem;
            }
            .speaker-btn:hover {
                transform: scale(1.05);
                box-shadow: 0 0 15px var(--neon-blue);
            }
        }

        .drop-zone {
            height: 8vh;
            width: 12vw;
            max-width: 250px;
            min-width: 60px;
            border: 2px dashed rgba(0, 243, 255, 0.3);
            border-radius: 12px;
            background: rgba(0, 0, 0, 0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: clamp(0.8rem, 3vh, 1.2rem);
            transition: border 0.3s;
        }

        @media (min-width: 768px) {
            .drop-zone {
                height: 9vh; /* Optimized size */
                width: 15vw;
                font-size: 2.2rem;
                border-width: 2px;
            }
        }

        .word-tag {
            background: rgba(188, 19, 254, 0.15);
            border: 1px solid var(--neon-purple);
            padding: 1.5vh 0.5vw;
            margin: 0.5vh;
            border-radius: 6px;
            text-align: center;
            font-weight: bold;
            font-size: clamp(0.7rem, 2.5vh, 1.1rem);
            cursor: grab;
            transition: all 0.2s;
        }

        @media (min-width: 768px) {
            .word-tag {
                padding: 1.5vh 1vw;
                font-size: 1.6rem;
                margin: 0.6vh;
            }
            .word-tag:hover {
                background: var(--neon-purple);
                color: white;
            }
        }

        .no-scrollbar::-webkit-scrollbar { display: none; }

        .how-to-list {
            text-align: left;
            display: inline-block;
            margin-top: 1rem;
            color: #94a3b8;
        }
        .how-to-list li {
            margin-bottom: 0.5rem;
            font-size: 0.9rem;
        }
        @media (min-width: 768px) {
            .how-to-list li { font-size: 1.4rem; }
        }
    </style>
</head>
<body>

    <!-- Language Selector -->
    <div id="language-selector" class="fixed top-2 right-2 z-[300] flex gap-1">
        <button onclick="setLanguage('vi')" id="lang-vi" class="px-2 py-1 text-[10px] border border-cyan-500 bg-cyan-500/40 rounded font-bold">VI</button>
        <button onclick="setLanguage('en')" id="lang-en" class="px-2 py-1 text-[10px] border border-gray-500 bg-gray-500/20 rounded font-bold">EN</button>
        <button onclick="setLanguage('ru')" id="lang-ru" class="px-2 py-1 text-[10px] border border-gray-500 bg-gray-500/20 rounded font-bold">RU</button>
    </div>

    <!-- Start Overlay -->
    <div id="start-overlay" class="fixed inset-0 bg-[#0a0b1e] z-[200] flex flex-col items-center justify-center p-6 text-center">
        <h1 class="text-5xl md:text-9xl font-bold neon-text mb-4 uppercase tracking-widest" data-i18n="title">Dấu Việt</h1>
        
        <div class="mb-8">
            <h3 class="text-neon-blue font-bold uppercase tracking-widest text-lg md:text-3xl mb-2" data-i18n="howToPlay">HƯỚNG DẪN</h3>
            <ul class="how-to-list list-none">
                <li><i class="fas fa-volume-up text-cyan-400 mr-2"></i> <span data-i18n="step1">Nhấn loa để nghe phát âm</span></li>
                <li><i class="fas fa-mouse-pointer text-purple-400 mr-2"></i> <span data-i18n="step2">Kéo từ từ kho vào ô trống</span></li>
                <li><i class="fas fa-trophy text-yellow-400 mr-2"></i> <span data-i18n="step3">Hoàn thành để qua vòng mới</span></li>
            </ul>
        </div>

        <button onclick="enterGame()" class="px-12 py-4 md:px-20 md:py-6 border-2 border-green-400 text-green-400 font-bold rounded-full hover:bg-green-400 hover:text-black transition-all text-xl md:text-3xl uppercase tracking-widest">BẮT ĐẦU</button>
    </div>

    <!-- Header Section (3/10 Height) -->
    <header id="game-header" class="hidden">
        <h1 class="text-3xl md:text-7xl font-bold neon-text uppercase tracking-widest mb-2">Tones Quest</h1>
        <div class="flex items-center gap-6 md:gap-12">
            <div class="text-purple-400 font-bold uppercase text-base md:text-3xl">
                <span data-i18n="level">CẤP</span>: <span id="level-display">1</span>
            </div>
            <div class="flex items-center gap-3 md:gap-6">
                <button onclick="prevRound()" class="w-8 h-8 md:w-12 md:h-12 flex items-center justify-center border border-cyan-500 rounded-full text-cyan-500 text-sm md:text-xl"><i class="fas fa-chevron-left"></i></button>
                <div class="text-blue-300 font-bold text-sm md:text-3xl min-w-[100px] md:min-w-[250px] text-center" id="round-display">VÒNG: 1/22</div>
                <button onclick="nextRoundManual()" class="w-8 h-8 md:w-12 md:h-12 flex items-center justify-center border border-cyan-500 rounded-full text-cyan-500 text-sm md:text-xl"><i class="fas fa-chevron-right"></i></button>
            </div>
        </div>
    </header>

    <!-- Main Section (7/10 Height) -->
    <main id="game-main" class="hidden">
        <div id="ui-level-1" class="h-full w-full">
            <div class="mobile-container">
                <!-- Word Bank -->
                <div class="mobile-sidebar">
                    <div class="text-[10px] md:text-xl text-center py-2 md:py-4 text-purple-400 font-bold border-b border-white/10 uppercase" data-i18n="wordBank">KHO TỪ</div>
                    <div id="word-list" class="flex-grow overflow-y-auto no-scrollbar p-1 md:p-2"></div>
                </div>
                <!-- Play Area -->
                <div class="mobile-play-area">
                    <div id="listening-area" class="listening-grid-mobile"></div>
                </div>
            </div>
        </div>

        <!-- Level 2 Overlay (Bubbles) -->
        <div id="ui-level-2" class="hidden absolute inset-0">
            <div id="bubble-container" class="w-full h-full relative"></div>
            <div class="absolute top-4 left-1/2 -translate-x-1/2 text-center pointer-events-none">
                <button id="target-speaker" class="speaker-btn pointer-events-auto mx-auto mb-4"><i class="fas fa-volume-up"></i></button>
                <div id="l2-dots" class="flex gap-3 justify-center">
                    <div class="w-3 h-3 md:w-5 md:h-5 rounded-full border border-cyan-400"></div>
                    <div class="w-3 h-3 md:w-5 md:h-5 rounded-full border border-cyan-400"></div>
                    <div class="w-3 h-3 md:w-5 md:h-5 rounded-full border border-cyan-400"></div>
                </div>
            </div>
        </div>
    </main>

    <!-- Modals -->
    <div id="popup" class="fixed inset-0 bg-black/90 hidden items-center justify-center z-[600] p-6">
        <div class="bg-gray-900 border border-cyan-400 p-8 md:p-12 rounded-3xl text-center max-w-sm md:max-w-xl w-full">
            <h2 class="text-3xl md:text-6xl font-bold neon-text mb-6 md:mb-10 uppercase" data-i18n="excellent">XUẤT SẮC!</h2>
            <button onclick="closePopup()" class="w-full bg-green-500 text-white py-3 md:py-6 rounded-xl font-bold uppercase tracking-widest text-lg md:text-3xl" data-i18n="continue">Tiếp tục</button>
        </div>
    </div>

    <script>
        const i18n = {
            vi: { 
                title: "Dấu Việt", 
                howToPlay: "HƯỚNG DẪN",
                step1: "Nhấn loa để nghe phát âm",
                step2: "Kéo từ từ kho vào ô trống",
                step3: "Hoàn thành để qua vòng mới",
                level: "CẤP", wordBank: "KHO TỪ", excellent: "XUẤS SẮC!", continue: "Tiếp tục", roundLabel: "VÒNG" 
            },
            en: { 
                title: "Viet Tones", 
                howToPlay: "HOW TO PLAY",
                step1: "Click speaker to hear pronunciation",
                step2: "Drag word from bank to drop zone",
                step3: "Complete all to next round",
                level: "LV", wordBank: "BANK", excellent: "EXCELLENT!", continue: "Continue", roundLabel: "ROUND" 
            },
            ru: { 
                title: "Вьет Тоны", 
                howToPlay: "КАК ИГРАТЬ",
                step1: "Нажми на звук, чтобы услышать",
                step2: "Перетащи слово из банка в поле",
                step3: "Заполни все, чтобы пройти дальше",
                level: "УР", wordBank: "БАНК", excellent: "ОТЛИЧНО!", continue: "Далее", roundLabel: "РАУНД" 
            }
        };

        const diphthongs = ["ai", "ao", "au", "ay", "âu", "ây", "eo", "êu", "ia", "iu", "oa", "oe", "oi", "ôi", "ơi", "ua", "ưa", "uê", "ui", "ưi", "ưu", "uy"];
        const getTones = (b) => {
            const m = {
                "ai": ["ai", "ái", "ài", "ải", "ãi", "ại"], "ao": ["ao", "áo", "ào", "ảo", "ão", "ạo"],
                "au": ["au", "áu", "àu", "ảu", "ẫu", "ậu"], "ay": ["ay", "áy", "ày", "ảy", "ãy", "ạy"],
                "âu": ["âu", "ấu", "ầu", "ẩu", "ẫu", "ậu"], "ây": ["ây", "ấy", "ầy", "ẩy", "ẫy", "ậy"],
                "eo": ["eo", "éo", "èo", "ẻo", "ẽo", "ẹo"], "êu": ["êu", "ếu", "ều", "ểu", "ễu", "ệu"],
                "ia": ["ia", "ía", "ìa", "ỉa", "ĩa", "ịa"], "iu": ["iu", "íu", "ìu", "ỉu", "ĩu", "ịu"],
                "oa": ["oa", "óa", "òa", "ỏa", "õa", "ọa"], "oe": ["oe", "óe", "òe", "ỏe", "õe", "ọe"],
                "oi": ["oi", "ói", "òi", "ỏi", "õi", "ọi"], "ôi": ["ôi", "ối", "ồi", "ổi", "ỗi", "ội"],
                "ơi": ["ơi", "ới", "ời", "ởi", "ỡi", "ợi"], "ua": ["ua", "úa", "ùa", "ủa", "ũa", "ụa"],
                "ưa": ["ưa", "ứa", "ừa", "ửa", "ữa", "ựa"], "uê": ["uê", "uế", "uề", "uể", "uễ", "uệ"],
                "ui": ["ui", "úi", "ùi", "ủi", "ũi", "ụi"], "ưi": ["ưi", "ứi", "ừi", "ửi", "ữi", "ựi"],
                "ưu": ["ưu", "ứu", "ừu", "ửu", "ữu", "ựu"], "uy": ["uy", "úy", "ùy", "ủy", "ũy", "ụy"]
            };
            return m[b] || [b];
        };

        let currentLang = 'vi', currentLevel = 1, roundIdx = 0, l2Seq = [], l2Idx = 0;
        const tts = new Audio(), ting = new Audio('https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3');

        function setLanguage(l) {
            currentLang = l;
            document.querySelectorAll('[data-i18n]').forEach(el => {
                const k = el.getAttribute('data-i18n');
                el.innerText = i18n[l][k];
            });
            ['vi', 'en', 'ru'].forEach(lang => {
                const btn = document.getElementById(\`lang-\${lang}\`);
                if (lang === l) {
                    btn.classList.add('bg-cyan-500/40', 'border-cyan-500');
                    btn.classList.remove('bg-gray-500/20', 'border-gray-500');
                } else {
                    btn.classList.remove('bg-cyan-500/40', 'border-cyan-500');
                    btn.classList.add('bg-gray-500/20', 'border-gray-500');
                }
            });
            updateHeader();
        }

        function enterGame() {
            document.getElementById('start-overlay').style.display = 'none';
            document.getElementById('game-header').classList.remove('hidden');
            document.getElementById('game-main').classList.remove('hidden');
            initRound();
        }

        function updateHeader() {
            document.getElementById('level-display').innerText = currentLevel;
            const label = i18n[currentLang].roundLabel;
            document.getElementById('round-display').innerText = \`\${label}: \${roundIdx + 1}/\${diphthongs.length}\`;
        }

        function speak(txt, btn) {
            if (btn) btn.classList.add('animate-pulse');
            tts.src = \`https://translate.google.com/translate_tts?ie=UTF-8&q=\${encodeURIComponent(txt)}&tl=vi&client=tw-ob\`;
            tts.onended = () => btn?.classList.remove('animate-pulse');
            tts.play();
        }

        function initRound() {
            updateHeader();
            if (currentLevel === 1) setupLevel1(); else setupLevel2();
        }

        function setupLevel1() {
            document.getElementById('ui-level-1').classList.remove('hidden');
            document.getElementById('ui-level-2').classList.add('hidden');
            const tones = getTones(diphthongs[roundIdx]);
            const wordList = document.getElementById('word-list');
            wordList.innerHTML = '';
            
            [...tones].sort(() => Math.random() - 0.5).forEach(w => {
                const d = document.createElement('div');
                d.className = 'word-tag'; d.innerText = w; d.draggable = true;
                d.addEventListener('dragstart', e => e.dataTransfer.setData('text', w));
                wordList.appendChild(d);
            });

            const area = document.getElementById('listening-area');
            area.innerHTML = '';
            let correctCount = 0;
            
            tones.forEach(w => {
                const item = document.createElement('div');
                item.className = 'flex flex-col items-center justify-center gap-1 md:gap-2';
                item.innerHTML = \`<button class="speaker-btn"><i class="fas fa-volume-up"></i></button><div class="drop-zone"></div>\`;
                item.querySelector('button').onclick = (e) => speak(w, e.currentTarget);
                const dz = item.querySelector('.drop-zone');
                dz.addEventListener('dragover', e => e.preventDefault());
                dz.addEventListener('drop', e => {
                    const drag = e.dataTransfer.getData('text');
                    if (drag === w) {
                        dz.innerText = drag; dz.style.borderColor = '#4ade80'; dz.style.color = '#4ade80';
                        ting.play(); correctCount++;
                        if (correctCount === tones.length) showPopup();
                    }
                });
                area.appendChild(item);
            });
        }

        function setupLevel2() {
            document.getElementById('ui-level-1').classList.add('hidden');
            document.getElementById('ui-level-2').classList.remove('hidden');
            const tones = getTones(diphthongs[roundIdx]);
            l2Seq = [...tones].sort(() => Math.random() - 0.5).slice(0, 3);
            l2Idx = 0;
            
            const container = document.getElementById('bubble-container');
            container.innerHTML = '';
            tones.forEach(w => {
                const b = document.createElement('div');
                b.className = 'absolute w-16 h-16 md:w-32 md:h-32 rounded-full border border-cyan-400 bg-cyan-400/10 flex items-center justify-center font-bold text-lg md:text-4xl transition-all cursor-pointer';
                b.innerText = w; b.style.left = \`\${Math.random() * 70 + 10}%\`; b.style.top = \`\${Math.random() * 60 + 20}%\`;
                b.onclick = () => {
                    if (w === l2Seq[l2Idx]) {
                        ting.play(); b.style.opacity = '0'; b.style.pointerEvents = 'none';
                        l2Idx++; updateL2UI();
                        if (l2Idx === 3) showPopup();
                        else speak(l2Seq[l2Idx]);
                    }
                };
                container.appendChild(b);
            });
            updateL2UI();
            speak(l2Seq[0]);
        }

        function updateL2UI() {
            const dots = document.getElementById('l2-dots').children;
            [...dots].forEach((d, i) => d.style.background = i < l2Idx ? '#00f3ff' : 'transparent');
            document.getElementById('target-speaker').onclick = () => speak(l2Seq[l2Idx]);
        }

        function showPopup() { 
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
            document.getElementById('popup').style.display = 'flex'; 
        }
        function closePopup() { 
            document.getElementById('popup').style.display = 'none';
            if (roundIdx < diphthongs.length - 1) { roundIdx++; } 
            else if (currentLevel === 1) { currentLevel = 2; roundIdx = 0; }
            initRound();
        }

        function prevRound() { if (roundIdx > 0) { roundIdx--; initRound(); } }
        function nextRoundManual() { if (roundIdx < diphthongs.length - 1) { roundIdx++; initRound(); } }

        window.onload = () => setLanguage('vi');
    </script>
</body>
</html>
`;

export const GameDiphthongTone: React.FC = () => {
    const [iframeSrc, setIframeSrc] = useState<string | undefined>(undefined);

    useEffect(() => {
        const blob = new Blob([gameDiphthongToneHtml], { type: 'text/html' });
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
            title="Game: Diphthong + Tone"
            sandbox="allow-scripts allow-same-origin"
        />
    );
};

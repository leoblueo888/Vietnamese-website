
import React, { useState, useEffect } from 'react';

// The user-provided HTML game code is stored as a template string.
const gameConsonantDiphthongToneHtml = `
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Consonant + Diphthong + Tone game</title>
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
            align-items: center; 
            justify-content: center;
            user-select: none;
            margin: 0;
            padding: 0;
        }

        /* Mobile specific layout ratios */
        @media (max-width: 767px) {
            /* Header chiếm ~45vh để nhường chỗ cho phần game kéo dài lên */
            .mobile-h-header { height: 45vh; }
            /* Phần game kéo dài thêm 50% (từ 35vh lên ~55vh) để chạm sát mép dưới Header */
            .mobile-h-game { height: 55vh; }
            .no-gap { gap: 0 !important; }
            .tight-grid { 
                grid-template-rows: repeat(3, 1fr) !important;
                grid-template-columns: repeat(2, 1fr) !important;
            }
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

        .speaker-btn {
            transition: all 0.2s ease;
            background: linear-gradient(135deg, rgba(0, 243, 255, 0.2), rgba(188, 19, 254, 0.2));
            border: 1px solid var(--neon-blue);
            width: 70px; 
            height: 70px;
        }

        @media (max-width: 767px) {
            .speaker-btn {
                /* Tăng ngang thêm 50% so với 55px -> xấp xỉ 82px */
                width: 82px; 
                height: 55px;
                border-radius: 8px 8px 0 0;
                font-size: 1.1rem !important;
            }
            .drop-zone {
                /* Tăng ngang thêm 50% so với 55px -> xấp xỉ 82px */
                width: 82px !important;
                height: 30px !important;
                border-radius: 0 0 8px 8px !important;
                font-size: 0.75rem !important;
                border-top: none !important;
            }
        }

        .speaker-btn:hover:not(:disabled) {
            transform: scale(1.05);
            box-shadow: 0 0 15px var(--neon-blue);
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
            transition: all 0.2s;
            cursor: pointer;
            font-size: 0.65rem;
        }

        .lang-btn {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(0, 243, 255, 0.3);
            padding: 8px 16px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: bold;
            transition: all 0.2s;
            color: var(--neon-blue);
        }

        .lang-btn.active {
            border-color: var(--neon-blue);
            background: rgba(0, 243, 255, 0.2);
            box-shadow: 0 0 12px var(--neon-blue);
            color: white;
        }

        .drop-zone {
            width: 110px; 
            height: 70px; 
            border: 2px dashed rgba(0, 243, 255, 0.3);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
            background: rgba(0, 0, 0, 0.2);
            font-weight: bold;
            font-size: 1.2rem;
        }

        .drop-zone.correct {
            border: 2px solid #4ade80 !important;
            background: rgba(74, 222, 128, 0.1) !important;
            color: #4ade80;
        }

        .word-tag {
            background: rgba(188, 19, 254, 0.15);
            border: 1px solid var(--neon-purple);
            cursor: grab;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            height: 58px; 
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.2s;
            font-size: 1.2rem;
            border-radius: 8px;
            font-weight: bold;
        }

        @media (max-width: 767px) {
            .word-tag {
                height: 38px;
                font-size: 1rem;
                width: 100%;
            }
        }

        .consonant-btn {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(0, 243, 255, 0.2);
            padding: 4px 6px;
            border-radius: 4px;
            font-weight: bold;
            font-size: 0.85rem;
            transition: all 0.2s;
            color: #ccc;
            min-width: 40px;
        }

        .consonant-btn.active {
            background: var(--neon-blue);
            color: black;
            box-shadow: 0 0 8px var(--neon-blue);
            border-color: var(--neon-blue);
        }

        .game-inner-wrap {
            width: 100vw;
            height: 100vh;
            display: flex;
            flex-direction: column;
            padding: 10px;
        }

        .consonant-container {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(45px, 1fr));
            gap: 5px;
            width: 100%;
        }

        @media (max-width: 767px) {
            .consonant-container {
                grid-template-columns: repeat(6, 1fr); 
                gap: 5px;
            }
            .consonant-btn {
                min-width: unset;
                font-size: 16px; 
                padding: 10px 2px;
            }
        }

        .grid-speaker-zones {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 1.5rem;
            justify-items: center;
            align-content: center;
            height: 100%;
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
        }

        .glow-button {
            border: 2px solid var(--neon-blue);
            color: var(--neon-blue);
            padding: 10px 30px;
            font-family: 'Orbitron', sans-serif;
            border-radius: 50px;
            transition: all 0.3s;
            cursor: pointer;
        }

        @media (max-width: 767px) {
            .mobile-unit {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
            }
        }

    </style>
</head>
<body class="p-0">

    <div id="start-overlay">
        <div id="language-selector" class="flex gap-4 mb-8">
            <button onclick="setLanguage('vi')" id="lang-vi" class="lang-btn active">VI</button>
            <button onclick="setLanguage('en')" id="lang-en" class="lang-btn">EN</button>
            <button onclick="setLanguage('ru')" id="lang-ru" class="lang-btn">RU</button>
        </div>

        <div class="text-center mb-6">
            <h1 class="text-2xl md:text-5xl font-bold neon-text mb-4 uppercase tracking-[0.1em]" data-i18n="title">Consonant + Diphthong + Tone game</h1>
            <div class="max-w-md mx-auto p-4 border border-blue-500/30 rounded-xl bg-blue-500/5">
                <p class="text-blue-300 tracking-wider uppercase text-xs mb-4 opacity-70" data-i18n="howToPlayTitle">HƯỚNG DẪN CÁCH CHƠI</p>
                <ul class="text-white text-sm md:text-base leading-relaxed text-left space-y-2 list-disc list-inside px-4" id="instruction-list"></ul>
            </div>
        </div>
        <div class="flex flex-col items-center">
            <button id="btn-start" onclick="enterGame()" class="glow-button" style="border-color: #4ade80; color: #4ade80; font-size: 1.1rem;" data-i18n="start">
                BẮT ĐẦU CHƠI <i class="fas fa-play ml-2"></i>
            </button>
        </div>
    </div>

    <div id="game-container" class="game-inner-wrap hidden relative">
        <!-- MOBILE HEADER -->
        <div class="mobile-h-header w-full flex flex-col md:flex-row gap-0 md:gap-2 items-stretch z-20 mb-0 md:mb-0 shrink-0">
            <div class="futuristic-card px-2 md:px-4 py-1 md:py-4 flex flex-col justify-center w-full md:w-[30%] min-h-0 md:min-h-[120px] rounded-none md:rounded-xl">
                <h1 class="text-[12px] md:text-lg font-bold neon-text uppercase tracking-widest leading-tight text-center md:text-left">Consonant + Diphthong + Tone</h1>
                <div class="flex items-center justify-center md:justify-start gap-4 mt-1 md:mt-3">
                    <p class="text-purple-400 font-bold tracking-widest uppercase text-[10px] md:text-xs"><span id="level-display">LV 1</span></p>
                    <div class="h-3 w-[1px] bg-white/20"></div>
                    <div class="flex items-center gap-3">
                        <button onclick="prevRoundManual()" class="nav-btn"><i class="fas fa-chevron-left"></i></button>
                        <p class="text-blue-300 tracking-wider min-w-[55px] text-center uppercase text-[10px] md:text-xs font-bold" id="round-display">1 / 22</p>
                        <button onclick="nextRoundManual()" class="nav-btn"><i class="fas fa-chevron-right"></i></button>
                    </div>
                </div>
            </div>

            <div id="consonant-box" class="futuristic-card px-2 md:px-4 py-1 md:py-3 w-full md:w-[70%] flex flex-col justify-center min-h-0 md:min-h-[120px] rounded-none md:rounded-xl overflow-hidden">
                <h3 class="hidden md:block text-xs font-bold mb-2 text-cyan-400 uppercase tracking-[0.2em] text-center" data-i18n="consonantTitle">Phụ Âm</h3>
                <div id="consonant-list" class="consonant-container overflow-hidden md:overflow-y-auto max-h-full"></div>
            </div>
        </div>

        <!-- MOBILE GAME AREA -->
        <div id="workspace-lv1" class="mobile-h-game flex flex-row md:grid md:grid-cols-5 gap-0 md:gap-2 w-full flex-grow items-stretch overflow-hidden">
            <!-- Word Bank -->
            <div class="w-[30%] md:w-auto md:col-span-1 futuristic-card p-1 md:p-2 flex flex-col items-stretch h-full rounded-none md:rounded-xl border-r md:border border-white/10">
                <h3 class="hidden md:block text-[10px] font-bold mb-2 text-purple-400 text-center uppercase" data-i18n="wordBank">Kho từ</h3>
                <div id="word-list" class="flex flex-col gap-1 md:gap-2 overflow-y-auto justify-start flex-grow pr-1"></div>
            </div>
            
            <!-- Speaker Area -->
            <div class="w-[70%] md:w-auto md:col-span-4 futuristic-card p-0 md:p-4 flex flex-col items-center justify-between h-full rounded-none md:rounded-xl">
                <div id="listening-area" class="grid-speaker-zones tight-grid no-gap w-full flex-grow"></div>
            </div>
        </div>
    </div>

    <!-- Modals -->
    <div id="perfect-overlay" class="fixed inset-0 bg-black/95 hidden items-center justify-center z-[700] p-4">
        <div class="bg-gray-900 border-2 border-cyan-400 p-8 rounded-[40px] text-center max-w-xl w-full">
            <h2 class="text-3xl font-bold neon-text text-white mb-6 uppercase" id="popup-title">XUẤT SẮC!</h2>
            <div id="review-list" class="flex flex-wrap justify-center gap-2 mb-8"></div>
            <div class="flex flex-col items-center gap-4">
                <button onclick="nextLevelOrRound()" class="bg-green-600 hover:bg-green-500 text-white px-10 py-3 rounded-full font-bold uppercase tracking-widest text-sm" id="btn-next-text">Tiếp tục</button>
            </div>
        </div>
    </div>

    <script>
        const i18n = {
            vi: {
                title: "Consonant + Diphthong + Tone game",
                howToPlayTitle: "HƯỚNG DẪN CÁCH CHƠI",
                instructions: [
                    "Chọn một Phụ âm ở bảng trên.",
                    "Nghe loa phát âm các từ gợi ý.",
                    "Kéo từ ở kho từ vào ô trống phía dưới loa."
                ],
                start: "BẮT ĐẦU CHƠI",
                wordBank: "Kho từ",
                consonantTitle: "Phụ Âm"
            },
            en: {
                title: "Consonant + Diphthong + Tone game",
                howToPlayTitle: "HOW TO PLAY",
                instructions: [
                    "Select a Consonant from the board above.",
                    "Listen to the pronunciations from the speakers.",
                    "Drag the word from the bank into the box below the speaker."
                ],
                start: "START GAME",
                wordBank: "Bank",
                consonantTitle: "Consonants"
            },
            ru: {
                title: "Consonant + Diphthong + Tone game",
                howToPlayTitle: "КАК ИГРАТЬ",
                instructions: [
                    "Выберите согласную на верхней панели.",
                    "Слушайте произношение через динамики.",
                    "Перетащите слово из банка в поле под динамиком."
                ],
                start: "ИГРАТЬ",
                wordBank: "Слова",
                consonantTitle: "Согласные"
            }
        };

        const consonants = ["", "b", "c", "ch", "d", "đ", "g", "gh", "gi", "h", "k", "kh", "l", "m", "n", "ng", "ngh", "nh", "ph", "qu", "r", "s", "t", "th", "tr", "v", "x"];
        const diphthongs = ["ai", "ao", "au", "ay", "âu", "ây", "eo", "êu", "ia", "iu", "oa", "oe", "oi", "ôi", "ơi", "ua", "ưa", "uê", "ui", "ưi", "ưu", "uy"];
        const toneMaps = {
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

        const gameData = { level1: diphthongs.map(d => ({ tones: toneMaps[d], base: d })) };
        let currentLang = 'vi';
        let currentRoundIndex = 0;
        let selectedConsonant = "b";
        let userAnswers = [];
        
        const ttsAudio = new Audio();
        const tingAudio = new Audio('https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3');

        function isLegalCombination(c, v) {
            const normalizedVowel = v.normalize('NFD').replace(/[\\u0300-\\u036f]/g, '').toLowerCase();
            const firstChar = normalizedVowel[0];
            const softVowels = ['i', 'e', 'ê'];
            const isSoft = softVowels.includes(firstChar);
            if (c === "gi" && firstChar === 'i') return false;
            if (['c', 'g', 'ng'].includes(c)) return !isSoft;
            if (['k', 'gh', 'ngh'].includes(c)) return isSoft;
            if (c === "qu" && firstChar === 'u') return false;
            return true;
        }

        function setLanguage(lang) {
            currentLang = lang;
            document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
            document.getElementById(\`lang-\${lang}\`)?.classList.add('active');
            
            document.querySelectorAll('[data-i18n]').forEach(el => {
                const key = el.getAttribute('data-i18n');
                if (i18n[lang][key]) el.innerText = i18n[lang][key];
            });

            const list = document.getElementById('instruction-list');
            list.innerHTML = '';
            i18n[lang].instructions.forEach(txt => {
                const li = document.createElement('li');
                li.innerText = txt;
                list.appendChild(li);
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
                btn.innerText = c === "" ? "-" : c;
                btn.onclick = () => {
                    selectedConsonant = c;
                    initConsonantBoard();
                    initRound();
                };
                container.appendChild(btn);
            });
        }

        function updateRoundDisplay() {
            document.getElementById('round-display').innerText = \`\${currentRoundIndex + 1} / \${gameData.level1.length}\`;
        }

        function initRound() {
            updateRoundDisplay();
            setupLevel1();
        }

        function setupLevel1() {
            const currentRound = gameData.level1[currentRoundIndex];
            const wordList = document.getElementById('word-list');
            const listeningArea = document.getElementById('listening-area');
            wordList.innerHTML = '';
            listeningArea.innerHTML = '';

            const legalTones = currentRound.tones.filter(v => isLegalCombination(selectedConsonant, v));
            userAnswers = new Array(legalTones.length).fill(null);
            const combinedTones = legalTones.map(v => selectedConsonant + v);
            const shuffled = [...combinedTones].sort(() => Math.random() - 0.5);
            
            shuffled.forEach(word => {
                const div = document.createElement('div');
                div.className = 'word-tag px-1 text-center w-full hover:scale-105 active:scale-95';
                div.innerText = word;
                div.draggable = true;
                div.id = \`word-\${word}\`;
                div.addEventListener('dragstart', (e) => e.dataTransfer.setData('text', word));
                wordList.appendChild(div);
            });

            combinedTones.slice(0, 6).forEach((fullWord, index) => {
                const item = document.createElement('div');
                item.className = 'mobile-unit flex flex-col items-center justify-center w-full h-full';
                item.innerHTML = \`
                    <button onclick="speakWord('\${fullWord}', this)" class="speaker-btn flex items-center justify-center text-cyan-400">
                        <i class="fas fa-volume-up"></i>
                    </button>
                    <div class="drop-zone" data-target="\${fullWord}"></div>
                \`;
                const dropZone = item.querySelector('.drop-zone');
                dropZone.addEventListener('dragover', e => e.preventDefault());
                dropZone.addEventListener('drop', e => {
                    const dragged = e.dataTransfer.getData('text');
                    if (dragged === fullWord) handleCorrectDrop(dropZone, dragged, index);
                });
                listeningArea.appendChild(item);
            });
        }

        function handleCorrectDrop(zone, word, index) {
            zone.innerText = word;
            zone.classList.add('correct');
            userAnswers[index] = word;
            playTing();
            document.getElementById(\`word-\${word}\`)?.remove();
            if (userAnswers.filter(a => a !== null).length === userAnswers.length) {
                setTimeout(showPerfectPopup, 400);
            }
        }

        function speakWord(text, btn) {
            if (btn) btn.classList.add('animate-pulse');
            ttsAudio.src = \`https://translate.google.com/translate_tts?ie=UTF-8&q=\${encodeURIComponent(text)}&tl=vi&client=tw-ob\`;
            ttsAudio.onended = () => btn?.classList.remove('animate-pulse');
            return ttsAudio.play().catch(() => {});
        }

        function playTing() { tingAudio.currentTime = 0; tingAudio.play().catch(() => {}); }

        function showPerfectPopup() {
            const popup = document.getElementById('perfect-overlay');
            const reviewList = document.getElementById('review-list');
            reviewList.innerHTML = '';
            userAnswers.forEach(word => {
                const btn = document.createElement('button');
                btn.className = 'px-4 py-2 bg-white/10 border border-white/20 rounded-lg font-bold text-lg';
                btn.innerText = word;
                btn.onclick = () => speakWord(word);
                reviewList.appendChild(btn);
            });
            popup.classList.replace('hidden', 'flex');
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
        }

        function nextLevelOrRound() {
            document.getElementById('perfect-overlay').classList.replace('flex', 'hidden');
            if (currentRoundIndex < gameData.level1.length - 1) {
                currentRoundIndex++;
                initRound();
            } else {
                currentRoundIndex = 0;
                initRound();
            }
        }

        function prevRoundManual() { if (currentRoundIndex > 0) { currentRoundIndex--; initRound(); } }
        function nextRoundManual() { if (currentRoundIndex < gameData.level1.length - 1) { currentRoundIndex++; initRound(); } }

        window.onload = () => setLanguage('vi');
    </script>
</body>
</html>
`;

export const GameConsonantDiphthongTone: React.FC = () => {
    const [iframeSrc, setIframeSrc] = useState<string | undefined>(undefined);

    useEffect(() => {
        const blob = new Blob([gameConsonantDiphthongToneHtml], { type: 'text/html' });
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
            title="Game: Consonant + Diphthong + Tone"
            sandbox="allow-scripts allow-same-origin"
        />
    );
};


import React, { useState, useEffect } from 'react';

// The user-provided HTML game code is stored as a template string.
const gameDiphthongConsonantHtml = `
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>DIPHTHONG + CONSONANT GAME</title>
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
        }

        .futuristic-card {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(15px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            box-shadow: 0 0 20px rgba(0, 243, 255, 0.1);
        }

        .neon-text {
            text-shadow: 0 0 10px var(--neon-blue), 0 0 20px var(--neon-blue);
            font-family: 'Orbitron', sans-serif;
        }

        .speaker-btn {
            transition: all 0.2s ease;
            background: linear-gradient(135deg, rgba(0, 243, 255, 0.2), rgba(188, 19, 254, 0.2));
            border: 1px solid var(--neon-blue);
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--neon-blue);
            width: 12vw; 
            height: 15vh;
            border-radius: 8px;
        }

        @media (min-width: 768px) {
            .speaker-btn {
                width: 4.5rem; 
                height: 4.5rem;
                border-radius: 50%;
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
            width: 30px;
            height: 30px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
            cursor: pointer;
        }

        .lang-btn {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(0, 243, 255, 0.3);
            padding: 6px 14px;
            border-radius: 6px;
            font-size: 12px;
            cursor: pointer;
            transition: all 0.3s;
        }

        .lang-btn.active {
            border-color: var(--neon-blue);
            background: rgba(0, 243, 255, 0.3);
            box-shadow: 0 0 10px var(--neon-blue);
        }

        .drop-zone {
            width: 20vw;
            height: 15vh;
            border: 2px dashed rgba(0, 243, 255, 0.3);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
            background: rgba(0, 0, 0, 0.2);
            font-weight: bold;
            font-size: 1.2rem;
        }

        @media (min-width: 768px) {
            .drop-zone {
                width: 120px; 
                height: 72px; 
            }
        }

        .drop-zone.correct {
            border: 2px solid #4ade80;
            background: rgba(74, 222, 128, 0.1);
            color: #4ade80;
        }

        .word-tag {
            background: rgba(188, 19, 254, 0.15);
            border: 1px solid var(--neon-purple);
            cursor: grab;
            font-size: 1.1rem;
            padding: 1vh 0;
            border-radius: 8px;
            width: 100%;
            text-align: center;
        }

        .mobile-header {
            height: 30vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 1vh;
            gap: 1vh;
        }

        .mobile-workspace {
            height: 70vh;
            display: flex;
            width: 100vw;
        }

        .mobile-wordbank {
            width: 30vw;
            height: 100%;
            padding: 1vh;
            border-right: 1px solid rgba(255,255,255,0.1);
            overflow-y: auto;
        }

        .mobile-listening {
            width: 70vw;
            height: 100%;
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            grid-template-rows: repeat(3, 1fr);
            padding: 1vh;
            gap: 1vh;
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
            padding: 12px 50px;
            font-family: 'Orbitron', sans-serif;
            border-radius: 50px;
            transition: all 0.3s;
            cursor: pointer;
            font-weight: bold;
        }

        .glow-button:hover {
            background: var(--neon-blue);
            color: black;
            box-shadow: 0 0 20px var(--neon-blue);
        }

        @keyframes drift {
            0% { transform: translate(0, 0) rotate(0deg); }
            50% { transform: translate(30px, 50px) rotate(180deg); }
            100% { transform: translate(0, 0) rotate(360deg); }
        }

        .floating-bubble {
            position: absolute;
            width: 75px;
            height: 75px;
            border-radius: 50%;
            background: radial-gradient(circle at 30% 30%, rgba(188, 19, 254, 0.4), rgba(0, 243, 255, 0.1));
            border: 2px solid rgba(0, 243, 255, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            z-index: 5;
        }

        .no-scrollbar::-webkit-scrollbar { display: none; }
    </style>
</head>
<body>

    <!-- Nút chọn ngôn ngữ - Hiện tại chỉ hiện ở Start Screen -->
    <div id="language-selector" class="fixed top-6 right-6 z-[300] flex gap-2">
        <button onclick="setLanguage('vi')" id="lang-vi" class="lang-btn active">VIỆT NAM</button>
        <button onclick="setLanguage('en')" id="lang-en" class="lang-btn">ENGLISH</button>
        <button onclick="setLanguage('ru')" id="lang-ru" class="lang-btn">РУССКИЙ</button>
    </div>

    <div id="start-overlay">
        <div class="text-center mb-10 max-w-2xl px-4">
            <h1 class="text-4xl md:text-6xl font-bold neon-text mb-8 uppercase tracking-tighter" data-i18n="title">DIPHTHONG + CONSONANT GAME</h1>
            <div class="p-6 border border-blue-500/30 rounded-2xl bg-blue-500/5 text-left">
                <p class="text-cyan-400 font-bold mb-4 uppercase tracking-widest text-sm" data-i18n="howToPlay">HOW TO PLAY:</p>
                <ul class="text-white space-y-3 text-sm md:text-base opacity-90" id="instruction-list">
                    <!-- Sẽ được inject bởi JS -->
                </ul>
            </div>
        </div>
        <button onclick="enterGame()" class="glow-button" style="border-color: #4ade80; color: #4ade80;" data-i18n="start">BẮT ĐẦU / START</button>
    </div>

    <div id="game-container" class="w-full h-full hidden flex flex-col">
        <!-- Header -->
        <div class="mobile-header md:h-auto md:flex-row md:justify-between md:p-8 md:border-b md:border-white/10">
            <div class="text-center md:text-left">
                <h1 class="text-xl md:text-3xl font-bold neon-text uppercase tracking-widest">DIPHTHONG + CONSONANT</h1>
                <div class="flex justify-center md:justify-start gap-6 items-center mt-2">
                    <p class="text-purple-400 font-bold uppercase text-xs md:text-sm"><span data-i18n="level">CẤP ĐỘ</span>: <span id="level-display">1</span></p>
                    <div class="flex items-center gap-3">
                        <button onclick="prevRoundManual()" class="nav-btn"><i class="fas fa-chevron-left text-xs"></i></button>
                        <p class="text-blue-300 uppercase text-xs md:text-sm min-w-[100px] text-center font-bold"><span id="round-display">1 / 24</span></p>
                        <button onclick="nextRoundManual()" class="nav-btn"><i class="fas fa-chevron-right text-xs"></i></button>
                    </div>
                </div>
            </div>
            <div class="hidden md:block futuristic-card px-6 py-3">
                <p class="text-xs text-cyan-400 uppercase tracking-widest font-bold">Acoustic Training System v2.5</p>
            </div>
        </div>

        <!-- Level 1 Workspace -->
        <div id="ui-level-1" class="mobile-workspace md:grid md:grid-cols-12 md:gap-6 md:max-w-[1500px] md:mx-auto md:w-full md:flex-1 md:items-center md:p-8">
            <!-- Word Bank (Thu nhỏ thêm 20% trên PC - chiếm 2/12 cột và giảm max-width) -->
            <div class="mobile-wordbank md:col-span-2 md:max-w-[180px] md:futuristic-card md:h-[65vh] md:flex md:flex-col md:p-4 md:ml-auto">
                <h3 class="text-[10px] md:text-xs font-bold mb-4 text-purple-400 text-center uppercase tracking-widest" data-i18n="wordBank">Kho từ</h3>
                <div id="word-list" class="flex flex-col gap-3 no-scrollbar overflow-y-auto"></div>
            </div>
            <!-- Listening Area (Chiếm 10/12 cột còn lại) -->
            <div class="mobile-listening md:col-span-10 md:futuristic-card md:grid-cols-3 md:grid-rows-2 md:gap-12 md:p-12 md:h-[65vh] md:items-center">
                <div id="listening-area" class="contents"></div>
            </div>
        </div>

        <!-- Level 2 Workspace -->
        <div id="ui-level-2" class="hidden fixed inset-0 z-10">
            <div class="absolute top-[35vh] left-1/2 -translate-x-1/2 text-center z-50">
                <p class="text-cyan-400 uppercase tracking-widest text-sm mb-2" data-i18n="findSound">Tìm âm thanh:</p>
                <button id="target-speaker" class="speaker-btn !w-24 !h-24 rounded-full mx-auto shadow-lg shadow-cyan-500/20">
                    <i class="fas fa-volume-up text-3xl"></i>
                </button>
            </div>
            <div id="bubble-container" class="w-full h-full relative"></div>
        </div>
    </div>

    <!-- Modals -->
    <div id="perfect-overlay" class="fixed inset-0 bg-black/95 hidden items-center justify-center z-[600] p-4">
        <div class="bg-gray-900 border-2 border-cyan-400 p-10 rounded-[40px] text-center max-w-sm w-full">
            <h2 class="text-3xl font-bold neon-text text-white mb-8 uppercase" id="popup-title">XUẤT SẮC!</h2>
            <button onclick="nextRound()" class="bg-green-600 hover:bg-green-500 text-white px-12 py-4 rounded-full font-bold uppercase tracking-widest text-sm transition-all">Tiếp tục</button>
        </div>
    </div>

    <div id="final-celebration" class="fixed inset-0 bg-black/98 hidden items-center justify-center z-[700] p-4">
        <div class="text-center">
            <h1 class="text-5xl md:text-8xl font-bold text-white neon-text mb-8 uppercase italic">CONGRATULATIONS!</h1>
            <button onclick="restartFullGame()" class="glow-button">CHƠI LẠI / REPLAY</button>
        </div>
    </div>

    <script>
        const i18n = {
            vi: { 
                title: "DIPHTHONG + CONSONANT GAME", 
                start: "BẮT ĐẦU CHƠI", 
                level: "CẤP ĐỘ", 
                round: "VÒNG", 
                excellent: "XUẤT SẮC!", 
                levelFinish: "HOÀN THÀNH CẤP ĐỘ {n}!", 
                wordBank: "KHO TỪ", 
                howToPlay: "CÁCH CHƠI:",
                findSound: "TÌM ÂM THANH:",
                bullets: [
                    "Nhấn vào LOA để nghe phát âm chính xác của từ.",
                    "Kéo từ đúng từ KHO TỪ bên trái màn hình.",
                    "Thả từ vào Ô TRỐNG bên cạnh chiếc loa tương ứng."
                ]
            },
            en: { 
                title: "DIPHTHONG + CONSONANT GAME", 
                start: "START GAME", 
                level: "LEVEL", 
                round: "ROUND", 
                excellent: "EXCELLENT!", 
                levelFinish: "LEVEL {n} COMPLETE!", 
                wordBank: "WORD BANK", 
                howToPlay: "HOW TO PLAY:",
                findSound: "FIND SOUND:",
                bullets: [
                    "Click the SPEAKER to hear the correct pronunciation.",
                    "Drag the correct word from the WORD BANK on the left.",
                    "Drop the word into the EMPTY BOX next to the speaker."
                ]
            },
            ru: { 
                title: "DIPHTHONG + CONSONANT GAME", 
                start: "НАЧАТЬ ИГРУ", 
                level: "УРОВЕНЬ", 
                round: "РАУНД", 
                excellent: "ОТЛИЧНО!", 
                levelFinish: "УРОВЕНЬ {n} ЗАВЕРШЕН!", 
                wordBank: "БАНК СЛОВ", 
                howToPlay: "КАК ИГРАТЬ:",
                findSound: "НАЙДИ ЗВУК:",
                bullets: [
                    "Нажмите на ДИНАМИК, чтобы услышать произношение.",
                    "Перетащите слово из БАНКА СЛОВ слева.",
                    "Поместите слово в ПУСТОЕ ПОЛЕ рядом с динамиком."
                ]
            }
        };

        const vinhList = ["iêm", "iên", "iêng", "iêp", "iêt", "iêu", "iêc", "uôm", "uôn", "uông", "uôc", "uôt", "ươm", "ươn", "ương", "ươc", "ươp", "ươt", "ươu", "oan", "oang", "oac", "oat", "uyên", "uyêt"];

        function getTones(base) {
            const rules = {
                "iêm": ["iêm", "iếm", "iềm", "iểm", "iễm", "iệm"],
                "iên": ["iên", "iến", "iền", "iển", "iễn", "iện"],
                "iêng": ["iêng", "iếng", "iềng", "iểng", "iễng", "iệng"],
                "iêp": ["iếp", "iệp"],
                "iêt": ["iết", "iệt"],
                "iêu": ["iêu", "iếu", "iều", "iểu", "iễu", "iệu"],
                "iêc": ["iếc", "iệc"],
                "uôm": ["uôm", "uốm", "uồm", "uổm", "uỗm", "uộm"],
                "uôn": ["uôn", "uốn", "uồn", "uổn", "uỗn", "uộn"],
                "uông": ["uông", "uống", "uồng", "uổng", "uỗng", "uộng"],
                "uôc": ["uốc", "uộc"],
                "uôt": ["uốt", "uột"],
                "ươm": ["ươm", "ướm", "ườm", "ưởm", "ưỡm", "ượm"],
                "ươn": ["ươn", "ướn", "ườn", "ưởn", "ưỡn", "ượn"],
                "ương": ["ương", "ướng", "ường", "ưởng", "ưỡng", "ượng"],
                "ươc": ["ước", "ược"],
                "ươp": ["ướp", "ượp"],
                "ươt": ["ướt", "ượt"],
                "ươu": ["ươu", "ướu", "ườu", "ưởu", "ưỡu", "ượu"],
                "oan": ["oan", "oán", "oàn", "oản", "oãn", "oạn"],
                "oang": ["oang", "oáng", "oàng", "oảng", "oãng", "oạng"],
                "oac": ["oác", "oạc"],
                "oat": ["oát", "oạt"],
                "uyên": ["uyên", "uyến", "uyền", "uyển", "uyễn", "uyện"],
                "uyêt": ["uyết", "uyệt"]
            };
            return rules[base] || [base];
        }

        const gameData = { level1: vinhList.map(v => ({ tones: getTones(v) })), level2: vinhList.map(v => ({ tones: getTones(v) })) };
        let currentLang = 'vi', currentLevel = 1, currentRoundIndex = 0, userAnswers = [], l2Interval, l2Sequence = [], l2SequenceIndex = 0;
        const ttsAudio = new Audio(), tingAudio = new Audio('https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3');

        function setLanguage(l) {
            currentLang = l;
            document.querySelectorAll('.lang-btn').forEach(b => b.classList.toggle('active', b.id === \`lang-\${l}\`));
            document.querySelectorAll('[data-i18n]').forEach(el => {
                const k = el.getAttribute('data-i18n');
                if (i18n[l][k]) el.innerText = i18n[l][k];
            });
            
            const bulletContainer = document.getElementById('instruction-list');
            bulletContainer.innerHTML = i18n[l].bullets.map(text => \`<li><i class="fas fa-caret-right mr-2 text-cyan-400"></i> \${text}</li>\`).join('');
            
            updateRoundDisplay();
        }

        function enterGame() {
            document.getElementById('start-overlay').style.display = 'none';
            document.getElementById('language-selector').classList.add('hidden');
            document.getElementById('game-container').classList.remove('hidden');
            initRound();
        }

        function updateRoundDisplay() {
            const total = gameData.level1.length;
            document.getElementById('round-display').innerText = \`\${currentRoundIndex + 1} / \${total}\`;
            document.getElementById('level-display').innerText = currentLevel;
        }

        function speakWord(t, btn) {
            if (btn) btn.classList.add('animate-pulse');
            ttsAudio.src = \`https://translate.google.com/translate_tts?ie=UTF-8&q=\${encodeURIComponent(t)}&tl=vi&client=tw-ob\`;
            ttsAudio.onended = () => btn?.classList.remove('animate-pulse');
            return ttsAudio.play();
        }

        function initRound() {
            clearInterval(l2Interval);
            updateRoundDisplay();
            if (currentLevel === 1) setupLevel1(); else setupLevel2();
        }

        function setupLevel1() {
            document.getElementById('ui-level-1').classList.remove('hidden', 'md:hidden');
            document.getElementById('ui-level-2').classList.add('hidden');
            const round = gameData.level1[currentRoundIndex];
            userAnswers = [];
            
            const wordList = document.getElementById('word-list');
            wordList.innerHTML = '';
            
            const tones = [...new Set(round.tones)];
            tones.sort(() => Math.random() - 0.5).forEach(w => {
                const d = document.createElement('div');
                d.className = 'word-tag'; d.innerText = w; d.draggable = true; d.id = \`word-\${w}\`;
                d.addEventListener('dragstart', e => e.dataTransfer.setData('text', w));
                d.addEventListener('touchstart', e => { window.currentDragWord = w; });
                wordList.appendChild(d);
            });

            const area = document.getElementById('listening-area');
            area.innerHTML = '';
            
            tones.forEach((w, i) => {
                const item = document.createElement('div');
                item.className = 'flex items-center justify-center gap-2 md:flex-col md:gap-4';
                item.innerHTML = \`
                    <button class="speaker-btn"><i class="fas fa-volume-up"></i></button>
                    <div class="drop-zone"></div>
                \`;
                item.querySelector('button').onclick = (e) => speakWord(w, e.currentTarget);
                const dz = item.querySelector('.drop-zone');
                dz.addEventListener('dragover', e => e.preventDefault());
                dz.addEventListener('drop', e => handleMatch(e.dataTransfer.getData('text'), w, dz, round));
                dz.addEventListener('touchend', () => {
                    if (window.currentDragWord) {
                        handleMatch(window.currentDragWord, w, dz, round);
                        window.currentDragWord = null;
                    }
                });
                area.appendChild(item);
            });
        }

        function handleMatch(drag, target, dz, round) {
            if (drag === target && !dz.innerText) {
                dz.innerText = drag; dz.classList.add('correct');
                userAnswers.push(drag);
                tingAudio.play();
                if (userAnswers.length === new Set(round.tones).size) showPopup();
            }
        }

        function setupLevel2() {
            document.getElementById('ui-level-1').classList.add('hidden');
            document.getElementById('ui-level-2').classList.remove('hidden');
            const round = gameData.level2[currentRoundIndex];
            const unique = [...new Set(round.tones)].sort(() => Math.random() - 0.5);
            l2Sequence = unique.slice(0, 3);
            l2SequenceIndex = 0;
            
            const container = document.getElementById('bubble-container');
            container.innerHTML = '';
            unique.forEach(w => {
                const b = document.createElement('div');
                b.className = 'floating-bubble';
                b.innerHTML = \`<span class="font-bold text-lg">\${w}</span>\`;
                b.style.left = \`\${Math.random() * 70 + 10}vw\`;
                b.style.top = \`\${Math.random() * 60 + 20}vh\`;
                b.style.animation = \`drift \${5 + Math.random() * 5}s infinite alternate ease-in-out\`;
                b.onclick = () => {
                    if (w === l2Sequence[l2SequenceIndex]) {
                        tingAudio.play();
                        b.style.opacity = '0';
                        l2SequenceIndex++;
                        if (l2SequenceIndex >= 3) showPopup();
                        else speakWord(l2Sequence[l2SequenceIndex], document.getElementById('target-speaker'));
                    }
                };
                container.appendChild(b);
            });
            speakWord(l2Sequence[0], document.getElementById('target-speaker'));
        }

        function showPopup() { 
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
            document.getElementById('perfect-overlay').style.display = 'flex'; 
        }
        function nextRound() { 
            document.getElementById('perfect-overlay').style.display = 'none';
            if (currentRoundIndex < gameData.level1.length - 1) {
                currentRoundIndex++;
            } else if (currentLevel === 1) {
                currentLevel = 2; currentRoundIndex = 0;
            } else {
                showFinal(); return;
            }
            initRound();
        }

        function showFinal() {
            document.getElementById('game-container').classList.add('hidden');
            document.getElementById('final-celebration').style.display = 'flex';
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
        }

        function restartFullGame() {
            location.reload();
        }

        function prevRoundManual() { if (currentRoundIndex > 0) { currentRoundIndex--; initRound(); } }
        function nextRoundManual() { if (currentRoundIndex < gameData.level1.length - 1) { currentRoundIndex++; initRound(); } }

        window.onload = () => setLanguage('vi');
    </script>
</body>
</html>
`;

export const GameDiphthongConsonant: React.FC = () => {
    const [iframeSrc, setIframeSrc] = useState<string | undefined>(undefined);

    useEffect(() => {
        const blob = new Blob([gameDiphthongConsonantHtml], { type: 'text/html' });
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
            title="Game: Diphthong + Consonant"
            sandbox="allow-scripts allow-same-origin"
        />
    );
};

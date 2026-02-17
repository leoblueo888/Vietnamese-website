
import React, { useEffect, useRef, useState } from 'react';
import { Maximize, Minimize } from 'lucide-react';

const gameHTML = `
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Vietnamese Question Word</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700;900&display=swap');
        
        body {
            font-family: 'Montserrat', sans-serif;
            overflow: hidden;
            background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
            height: 100vh;
            width: 100vw;
            margin: 0;
            user-select: none;
            display: flex;
            flex-direction: column;
            color: white;
        }

        /* Landscape orientation: Force 16:9 PC-like layout */
        @media (orientation: landscape) {
            #game-scene {
                max-width: 177.78vh; /* 16:9 ratio */
                margin: 0 auto;
            }
            header { padding: 0.25rem 1rem !important; }
            .main-target-text { font-size: 2rem !important; }
            .content-card { padding: 1rem !important; gap: 1rem !important; }
            .quiz-sentence { font-size: 1.8rem !important; }
            .inline-drop-zone { height: 45px !important; width: 130px !important; }
        }

        /* Portrait: Small size for quiz text to fit in one screen */
        @media (orientation: portrait) {
            .quiz-sentence {
                font-size: 1.4rem !important; 
                padding: 0 15px;
            }
            .inline-drop-zone {
                width: 120px;
                height: 45px;
            }
            .main-target-text {
                font-size: 2.2rem !important;
            }
        }

        header {
            width: 100%;
            padding: 0.75rem 1rem;
            background: rgba(0, 0, 0, 0.4);
            backdrop-filter: blur(12px);
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            z-index: 100;
        }

        .level-badge {
            background: linear-gradient(90deg, #f59e0b, #d97706);
            padding: 4px 12px;
            border-radius: 12px;
            font-weight: 900;
            font-size: 0.8rem;
            box-shadow: 0 0 15px rgba(245, 158, 11, 0.3);
        }

        .nav-btn {
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            padding: 8px 16px;
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 0.8rem;
        }

        .nav-btn:hover:not(:disabled) {
            background: rgba(255, 255, 255, 0.2);
            transform: translateY(-1px);
        }

        .nav-btn:disabled {
            opacity: 0.3;
            cursor: not-allowed;
        }

        .content-card {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 40px;
            padding: 2.5rem;
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 2.5rem;
            max-width: 95%;
            z-index: 10;
        }

        .word-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            min-width: 260px;
            flex: 1;
        }

        .main-target-text {
            font-size: 3.2rem;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: -1px;
            margin-bottom: 0.5rem;
            text-shadow: 0 10px 20px rgba(0,0,0,0.5);
            text-align: center;
        }

        .drop-zone {
            width: 100%;
            height: 85px;
            border: 3px dashed rgba(255, 255, 255, 0.2);
            border-radius: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(255, 255, 255, 0.03);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .quiz-sentence {
            font-size: 2.5rem;
            font-weight: 800;
            text-align: center;
            line-height: 1.6;
            margin-bottom: 1rem;
        }

        .inline-drop-zone {
            display: inline-flex;
            width: 180px;
            height: 60px;
            border: 3px dashed rgba(251, 191, 36, 0.5);
            border-radius: 12px;
            vertical-align: middle;
            margin: 0 5px;
            background: rgba(0, 0, 0, 0.3);
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
        }

        .inline-drop-zone.hover {
            border-color: #fbbf24;
            background: rgba(251, 191, 36, 0.1);
        }

        .inline-drop-zone.completed {
            border-style: solid;
            border-color: #10b981;
            background: rgba(16, 185, 129, 0.2);
            width: auto;
            min-width: 100px;
            padding: 0 15px;
        }

        .floating-word {
            position: absolute;
            cursor: grab;
            padding: 12px 24px;
            background: #ffffff;
            color: #1e1b4b;
            border-radius: 50px;
            font-weight: 900;
            font-size: 1.1rem;
            box-shadow: 0 10px 20px rgba(0,0,0,0.4);
            z-index: 2000;
            white-space: nowrap;
            border: 3px solid #6366f1;
            touch-action: none;
        }

        .overlay {
            position: fixed;
            inset: 0;
            background: rgba(7, 10, 25, 0.98);
            display: none;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 3000;
            backdrop-filter: blur(10px);
            padding: 1.5rem;
        }

        .review-list {
            display: flex;
            flex-direction: column;
            gap: 1rem;
            margin-bottom: 2rem;
            max-width: 650px;
            width: 100%;
            max-height: 60vh;
            overflow-y: auto;
            padding-right: 10px;
        }

        .review-list::-webkit-scrollbar { width: 6px; }
        .review-list::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 10px; }

        .review-item {
            background: rgba(255,255,255,0.08);
            padding: 1rem;
            border-radius: 20px;
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
            border: 2px solid transparent;
            width: 100%;
        }

        .example-section {
            background: rgba(0, 0, 0, 0.2);
            padding: 0.75rem;
            border-radius: 12px;
            border-left: 4px solid #fbbf24;
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 1rem;
        }

        .speaker-btn {
            background: rgba(99, 102, 241, 0.2);
            border: 1px solid rgba(99, 102, 241, 0.4);
            padding: 8px;
            border-radius: 10px;
            cursor: pointer;
            color: white;
            flex-shrink: 0;
        }

        .btn-primary {
            background: linear-gradient(90deg, #6366f1, #4f46e5);
            padding: 16px 48px;
            border-radius: 20px;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 2px;
            cursor: pointer;
            text-align: center;
        }

        .lang-btn {
            background: rgba(255, 255, 255, 0.05);
            border: 2px solid rgba(255, 255, 255, 0.2);
            padding: 15px 30px;
            border-radius: 20px;
            cursor: pointer;
            font-weight: 800;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
            width: 140px;
        }

        .lang-btn.active {
            background: rgba(251, 191, 36, 0.2);
            border-color: #fbbf24;
        }

        .animate-pop { animation: pop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        @keyframes pop { 0% { transform: scale(0.6); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }

    </style>
</head>
<body>

    <div id="start-screen" class="overlay" style="display: flex;">
        <div class="text-center animate-pop flex flex-col items-center max-w-2xl px-6">
            <h1 class="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-4 italic uppercase">VIETNAMESE QUESTION WORD</h1>
            <p id="start-desc" class="text-white/80 text-sm md:text-lg mb-8 leading-relaxed uppercase font-bold tracking-tight">21 VÒNG CHƠI ĐỂ LÀM CHỦ CÁC TỪ ĐỂ HỎI</p>
            
            <div class="flex flex-col items-center gap-4 mb-10">
                <p id="choose-lang-text" class="text-yellow-500 font-black tracking-widest text-xs italic">CHỌN NGÔN NGỮ / CHOOSE LANGUAGE</p>
                <div class="flex gap-4">
                    <button class="lang-btn active" onclick="setLanguage('en', this)">
                        <span class="text-3xl">🇺🇸</span><span>ENG</span>
                    </button>
                    <button class="lang-btn" onclick="setLanguage('ru', this)">
                        <span class="text-3xl">🇷🇺</span><span>RUS</span>
                    </button>
                </div>
            </div>
            <div id="start-btn" class="btn-primary w-full sm:w-auto" onclick="startGame()">BẮT ĐẦU CHƠI</div>
        </div>
    </div>

    <header>
        <div class="max-w-7xl mx-auto flex justify-between items-center">
            <div class="flex items-center gap-3">
                <span id="level-label" class="level-badge uppercase">CẤP ĐỘ <span id="level-num">1</span></span>
            </div>
            <div class="flex items-center gap-2 md:gap-4">
                <button id="nav-back" class="nav-btn" onclick="navBack()">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/></svg>
                </button>
                <div class="flex flex-col items-center min-w-[60px] md:min-w-[80px]">
                    <span id="round-label" class="text-yellow-500 font-black text-[9px] italic tracking-widest leading-none">VÒNG</span>
                    <span id="round-display" class="text-white font-black text-lg md:text-xl leading-none">1 / 21</span>
                </div>
                <button id="nav-forward" class="nav-btn" onclick="navForward()">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/></svg>
                </button>
            </div>
            <div class="w-[40px]"></div>
        </div>
    </header>

    <main id="game-scene" class="flex-grow flex flex-col items-center justify-center relative p-4 overflow-hidden">
        <div id="quiz-container" class="mb-4 w-full max-w-4xl px-2" style="display:none;"></div>
        <div id="words-grid" class="content-card animate-pop"></div>
        <div id="hint-pool" class="mt-4 flex flex-wrap justify-center gap-2 md:gap-4 min-h-[80px] w-full max-w-4xl overflow-y-auto" style="display:none;"></div>
    </main>

    <div id="float-layer" class="fixed inset-0 pointer-events-none" style="z-index: 2000;"></div>

    <div id="win-overlay" class="overlay">
        <div class="text-center animate-pop flex flex-col items-center w-full max-w-3xl">
            <h2 id="win-title" class="text-3xl md:text-5xl font-black text-yellow-400 mb-2 uppercase italic">XUẤT SẮC!</h2>
            <div id="win-subtitle-container" class="mb-4 flex flex-col items-center gap-4">
                <p id="win-subtitle" class="text-sm md:text-lg text-white/70 italic">Ôn lại các từ vừa học:</p>
                <button id="listen-all-btn" class="bg-white/10 border-2 border-white/20 px-6 py-2 rounded-xl flex items-center gap-2 font-bold text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16"><path d="M11.536 14.01A8.473 8.473 0 0 0 14.026 8a8.473 8.473 0 0 0-2.49-6.01l-.708.707A7.476 7.476 0 0 1 13.025 8c0 2.071-.84 3.946-2.197 5.303l.708.707z"/><path d="M10.121 12.596A6.48 6.48 0 0 0 12.025 8a6.48 6.48 0 0 0-1.904-4.596l-.707.707A5.483 5.483 0 0 1 11.025 8a5.483 5.483 0 0 1-1.61 3.89l.706.706z"/><path d="M8.707 11.182A4.486 4.486 0 0 0 10.025 8a4.486 4.486 0 0 0-1.318-3.182l-.707.707A3.489 3.489 0 0 1 9.025 8a3.489 3.489 0 0 1-1.025 2.475l.707.707zM6.717 3.55A.5.5 0 0 1 7 4v8a.5.5 0 0 1-.812.39L3.825 10.5H1.5A.5.5 0 0 1 1 10V6a.5.5 0 0 1 .5-.5h2.325l2.363-1.89a.5.5 0 0 1 .529-.06z"/></svg>
                    <span id="listen-all-text">NGHE TẤT CẢ</span>
                </button>
            </div>
            <div id="review-container" class="review-list"></div>
            <div id="next-btn" class="btn-primary text-sm md:text-base">TIẾP TỤC</div>
        </div>
    </div>

    <audio id="sfx-correct" src="https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3"></audio>

    <script>
        const ttsAudio = new Audio();
        const sfxCorrect = document.getElementById('sfx-correct');
        let currentLang = 'en';

        const i18n = {
            en: {
                startDesc: "21 ROUNDS TO MASTER QUESTION WORDS",
                startBtn: "START PLAYING",
                levelLabel: "LEVEL",
                roundLabel: "ROUND",
                dropText: "Drag word here",
                winTitle: "EXCELLENT!",
                winReview: "Review Round",
                winSubtitle: "Review the words you just learned:",
                listenAll: "LISTEN ALL",
                nextBtn: "CONTINUE",
                retryBtn: "PLAY AGAIN",
                finishTitle: "COURSE COMPLETED!",
                chooseLang: "CHOOSE LANGUAGE"
            },
            ru: {
                startDesc: "21 РАУНД ĐỂ LÀM CHỦ CÁC TỪ ĐỂ HỎI",
                startBtn: "НАЧАТЬ ИГРУ",
                levelLabel: "УРОВЕНЬ",
                roundLabel: "РАУНД",
                dropText: "Перетащите слово сюда",
                winTitle: "ОТЛИЧНО!",
                winReview: "Раунд повторения",
                winSubtitle: "Повторите выученные слова:",
                listenAll: "СЛУШАТЬ ВСЁ",
                nextBtn: "ПРОДОЛЖИТЬ",
                retryBtn: "ИГРАТЬ СНОВА",
                finishTitle: "КУРС ЗАВЕРШЕН!",
                chooseLang: "ВЫВЕРИТЕ ЯЗЫК"
            }
        };

        const vocabData = [
            { id: 1, vi: "cái gì", en: "what", ru: "что", icon: "❓", exVi: "Cái gì bạn thích nhất?", exEn: "What do you like most?", exRu: "Что тебе больше всего нравится?" },
            { id: 7, vi: "thế nào", en: "how", ru: "как", icon: "⚙️", exVi: "Bạn đi đến lớp học tiếng Anh thế nào?", exEn: "How do you go to English class?", exRu: "Как ты ходишь на занятия по английскому?" },
            { id: 3, vi: "đâu / nơi nào", en: "where", ru: "где / в каком месте", icon: "📍", exVi: "Bạn sống ở đâu?", exEn: "Where do you live?", exRu: "Где ты живешь?" },
            { id: 4, vi: "khi nào", en: "when", ru: "когда", icon: "⏰", exVi: "Khi nào bạn đi ra bãi biển?", exEn: "When do you go to the beach?", exRu: "Когда ты идешь на пляж?" },
            { id: 5, vi: "với người nào", en: "with whom", ru: "с кем", icon: "👥", exVi: "Bạn sống với người nào?", exEn: "With whom do you live?", exRu: "С кем ты живешь?" },
            { id: 6, vi: "mấy giờ", en: "what time", ru: "в какое время", icon: "🕑", exVi: "Mấy giờ bạn thường thức dậy?", exEn: "What time do you usually wake up?", exRu: "В какое время ты обычно просыпаешься?" },
            { id: 2, vi: "thường xuyên thế nào", en: "how often", ru: "как часто", icon: "🔄", exVi: "Bạn học tiếng Anh thường xuyên thế nào?", exEn: "How often do you study English?", exRu: "Как часто ты учишь английский?" },
            { id: 8, vi: "cái nào", en: "which", ru: "какой", icon: "🎨", exVi: "Bạn có chiếc xe máy nào?", exEn: "Which motorbike do you have?", exRu: "Какой у тебя мотоцикл?" },
            { id: 9, vi: "ai", en: "who", ru: "кто", icon: "👤", exVi: "Ai dạy bạn tiếng Anh?", exEn: "Who teaches you English?", exRu: "Кто учиt тебя английскому?" },
            { id: 10, vi: "bao nhiêu", en: "how many", ru: "сколько", icon: "🔢", exVi: "Bạn có bao nhiêu anh chị em?", exEn: "How many siblings do you have?", exRu: "Сколько у тебя братьев и сестер?" },
            { id: 11, vi: "bao lâu", en: "how long", ru: "как долго", icon: "⏳", exVi: "Bạn đã sống ở Nha Trang bao lâu rồi?", exEn: "How long have you lived in Nha Trang?", exRu: "Как долго ты живешь в Нячанге?" },
            { id: 12, vi: "tại sao", en: "why", ru: "почему", icon: "💡", exVi: "Tại sao bạn học tiếng Anh?", exEn: "Why do you study English?", exRu: "Почему ты учишь английский?" }
        ];

        function setLanguage(lang, btn) {
            currentLang = lang;
            document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById('start-desc').innerText = i18n[lang].startDesc;
            document.getElementById('start-btn').innerText = i18n[lang].startBtn;
            document.getElementById('choose-lang-text').innerText = i18n[lang].chooseLang;
        }

        function speak(text) {
            const url = \`https://translate.google.com/translate_tts?ie=UTF-8&q=\${encodeURIComponent(text)}&tl=vi&client=tw-ob\`;
            ttsAudio.src = url;
            return new Promise((resolve) => {
                ttsAudio.onended = resolve; ttsAudio.onerror = resolve;
                ttsAudio.play().catch(e => resolve());
            });
        }

        let currentRoundGlobal = 1;
        let subRoundIndex = 0; 
        let matchesFound = 0;
        let roundItems = [];

        const wordsGrid = document.getElementById('words-grid');
        const quizContainer = document.getElementById('quiz-container');
        const hintPool = document.getElementById('hint-pool');
        const floatLayer = document.getElementById('float-layer');
        const overlay = document.getElementById('win-overlay');
        const startScreen = document.getElementById('start-screen');
        const nextBtn = document.getElementById('next-btn');
        const reviewContainer = document.getElementById('review-container');
        const roundDisplay = document.getElementById('round-display');
        const navBackBtn = document.getElementById('nav-back');
        const winTitle = document.getElementById('win-title');
        const listenAllBtn = document.getElementById('listen-all-btn');

        function startGame() {
            startScreen.style.display = 'none';
            document.getElementById('level-label').innerHTML = \`\${i18n[currentLang].levelLabel} <span id="level-num">1</span>\`;
            document.getElementById('round-label').innerText = i18n[currentLang].roundLabel;
            document.getElementById('listen-all-text').innerText = i18n[currentLang].listenAll;
            loadRound(1);
        }

        function navForward() { if (currentRoundGlobal < 21) loadRound(currentRoundGlobal + 1); }
        function navBack() { if (currentRoundGlobal > 1) loadRound(currentRoundGlobal - 1); }

        function loadRound(roundNum) {
            currentRoundGlobal = roundNum;
            subRoundIndex = 0; 
            roundDisplay.innerText = \`\${currentRoundGlobal} / 21\`;
            navBackBtn.disabled = currentRoundGlobal === 1;
            
            wordsGrid.innerHTML = ''; quizContainer.innerHTML = ''; hintPool.innerHTML = ''; floatLayer.innerHTML = '';
            overlay.style.display = 'none'; quizContainer.style.display = 'none'; hintPool.style.display = 'none';
            wordsGrid.style.display = 'flex';
            matchesFound = 0; roundItems = [];

            const group1 = vocabData.slice(0, 6);
            const group2 = vocabData.slice(6);

            let level = 1; let isRoundReview = false;
            if (roundNum <= 7) {
                level = 1;
                if (roundNum === 7) { isRoundReview = true; roundItems = [...group1]; }
                else roundItems = [group1[roundNum - 1]];
            } else if (roundNum <= 14) {
                level = 2;
                const idx = roundNum - 8;
                if (roundNum === 14) { isRoundReview = true; roundItems = [...group2]; }
                else roundItems = [group1[idx % 6], group2[idx]];
            } else {
                level = 3;
                if (roundNum === 21) { isRoundReview = true; roundItems = [...vocabData]; }
                else {
                    const startIdx = ((roundNum - 15) * 3) % vocabData.length;
                    for(let i=0; i<3; i++) roundItems.push(vocabData[(startIdx+i)%vocabData.length]);
                }
            }
            document.getElementById('level-num').innerText = level;

            if (isRoundReview) setupFillInBlankSubRound();
            else {
                roundItems.forEach(item => {
                    const div = document.createElement('div');
                    div.className = 'word-container animate-pop';
                    const targetVal = item.vi;
                    div.innerHTML = \`
                        <div class="text-4xl md:text-6xl mb-4">\${item.icon}</div>
                        <div class="main-target-text">\${targetVal}</div>
                        <div class="drop-zone mt-4" data-match-value="\${targetVal.toLowerCase()}" data-target-val="\${targetVal}">
                            <span class="text-white/20 font-bold uppercase text-[10px] tracking-widest">\${i18n[currentLang].dropText}</span>
                        </div>
                    \`;
                    wordsGrid.appendChild(div);
                    spawnFloatingWord(item);
                });
            }
        }

        function setupFillInBlankSubRound() {
            wordsGrid.style.display = 'none'; quizContainer.style.display = 'block'; hintPool.style.display = 'flex';
            quizContainer.innerHTML = ''; hintPool.innerHTML = '';
            const currentItem = roundItems[subRoundIndex];
            const translationEx = currentLang === 'en' ? currentItem.exEn : currentItem.exRu;

            const quizDiv = document.createElement('div');
            quizDiv.className = 'quiz-sentence animate-pop text-white/90 font-medium flex flex-col items-center gap-2 md:gap-4';
            
            let fullSentence = currentItem.exVi; 
            let missingWordVi = currentItem.vi; 

            let regexStr;
            if (missingWordVi.includes("/")) {
                const parts = missingWordVi.split("/").map(p => p.trim());
                regexStr = \`(\${parts.map(p => p.replace(/\\s+/g, "\\\\s+")).join("|")})\`;
            } else {
                regexStr = \`(\${missingWordVi.replace(/\\s+/g, "\\\\s+")})\`;
            }

            const regex = new RegExp(regexStr, 'gi');
            const sentenceParts = fullSentence.split(regex);
            
            const sentenceHTML = sentenceParts.map(p => {
                if (regex.test(p) || p.toLowerCase() === missingWordVi.toLowerCase()) {
                    return \`<div class="inline-drop-zone drop-zone" data-match-value="\${missingWordVi.toLowerCase()}" data-target-val="\${currentItem.vi}"></div>\`;
                }
                return \`<span>\${p}</span>\`;
            }).join('');

            quizDiv.innerHTML = \`
                <div>\${sentenceHTML}</div>
                <div class="text-sm md:text-xl text-yellow-500/80 italic font-bold tracking-tight uppercase">\${translationEx}</div>
            \`;
            quizContainer.appendChild(quizDiv);

            const shuffledHints = [...roundItems].sort(() => Math.random() - 0.5);
            shuffledHints.forEach(hItem => {
                const hintBtn = document.createElement('div');
                hintBtn.className = 'floating-word pointer-events-auto relative !inset-0 !translate-x-0 !translate-y-0 cursor-grab active:scale-95 text-xs md:text-base';
                
                // Ở Round REVIEW (Điền từ vào câu): Box để điền phải là Tiếng Việt để khớp với câu
                hintBtn.innerText = hItem.vi.toUpperCase();
                
                hintBtn.dataset.matchValue = hItem.vi.toLowerCase();
                hintPool.appendChild(hintBtn);
                setupDraggableHint(hintBtn);
            });
        }

        function setupDraggableHint(el) {
            let isDragging = false;
            const onStart = (e) => {
                isDragging = true;
                el.dataset.dragging = "true";
                el.style.position = 'fixed'; el.style.zIndex = 4000;
                updatePos(e);
            };
            const updatePos = (e) => {
                if (!isDragging) return;
                const cx = e.touches ? e.touches[0].clientX : e.clientX;
                const cy = e.touches ? e.touches[0].clientY : e.clientY;
                el.style.left = (cx - el.offsetWidth / 2) + 'px';
                el.style.top = (cy - el.offsetHeight / 2) + 'px';
                
                document.querySelectorAll('.inline-drop-zone:not(.completed)').forEach(z => {
                    const zr = z.getBoundingClientRect(); const er = el.getBoundingClientRect();
                    if (!(er.right < zr.left || er.left > zr.right || er.bottom < zr.top || er.top > zr.bottom)) z.classList.add('hover');
                    else z.classList.remove('hover');
                });
            };
            const onEnd = () => {
                if (!isDragging) return;
                isDragging = false;
                el.dataset.dragging = "false";
                let matched = false;
                document.querySelectorAll('.inline-drop-zone:not(.completed)').forEach(z => {
                    if (z.classList.contains('hover')) {
                        if (z.dataset.matchValue === el.dataset.matchValue) { handleQuizMatch(el, z); matched = true; }
                        z.classList.remove('hover');
                    }
                });
                if (!matched) { el.style.position = 'relative'; el.style.left = '0'; el.style.top = '0'; }
            };
            el.addEventListener('mousedown', onStart);
            el.addEventListener('touchstart', (e) => { e.preventDefault(); onStart(e); }, {passive: false});
            window.addEventListener('mousemove', updatePos);
            window.addEventListener('touchmove', (e) => { if(isDragging) { e.preventDefault(); updatePos(e); } }, {passive: false});
            window.addEventListener('mouseup', onEnd);
            window.addEventListener('touchend', onEnd);
        }

        function handleQuizMatch(floatEl, targetZone) {
            sfxCorrect.play(); speak(targetZone.dataset.targetVal);
            targetZone.classList.add('completed');
            
            const item = vocabData.find(v => v.vi.toLowerCase() === floatEl.dataset.matchValue);
            targetZone.innerHTML = \`<span class="text-yellow-400 font-black animate-pop text-sm md:text-xl">\${item.vi.toUpperCase()}</span>\`;
            
            floatEl.style.visibility = 'hidden';
            subRoundIndex++;
            if (subRoundIndex < roundItems.length) setTimeout(() => setupFillInBlankSubRound(), 1200);
            else setTimeout(() => showReviewOverlay(true), 1500);
        }

        function spawnFloatingWord(item) {
            const el = document.createElement('div');
            el.className = 'floating-word pointer-events-auto text-sm md:text-base';
            
            // Ở Round THƯỜNG (Level 1, 2, 3): Box bay phải hiển thị Russian (hoặc English) để kéo vào target Vietnamese
            const displayWord = currentLang === 'ru' ? item.ru : (currentLang === 'en' ? item.en : item.vi);
            el.innerText = displayWord.toUpperCase(); 
            
            el.dataset.matchValue = item.vi.toLowerCase(); 
            floatLayer.appendChild(el);
            let x = Math.random() * (window.innerWidth - 150) + 50;
            let y = Math.random() * (window.innerHeight - 150) + 100;
            let dx = (Math.random() - 0.5) * 3; let dy = (Math.random() - 0.5) * 3;
            function move() {
                if (!el.parentElement || el.dataset.dragging === "true") return;
                const r = el.getBoundingClientRect();
                if (x < 0 || x > window.innerWidth - r.width) dx *= -1;
                if (y < 80 || y > window.innerHeight - r.height) dy *= -1;
                x += dx; y += dy; el.style.left = x + 'px'; el.style.top = y + 'px';
                requestAnimationFrame(move);
            }
            const onStart = () => { el.dataset.dragging = "true"; el.style.zIndex = 3000; };
            const onMove = (e) => {
                if (el.dataset.dragging !== "true") return;
                const cx = e.touches ? e.touches[0].clientX : e.clientX;
                const cy = e.touches ? e.touches[0].clientY : e.clientY;
                x = cx - el.offsetWidth / 2; y = cy - el.offsetHeight / 2;
                el.style.left = x + 'px'; el.style.top = y + 'px';
                document.querySelectorAll('.drop-zone').forEach(z => {
                    const zr = z.getBoundingClientRect(); const er = el.getBoundingClientRect();
                    if (!(er.right < zr.left || er.left > zr.right || er.bottom < zr.top || er.top > zr.bottom)) z.classList.add('hover');
                    else z.classList.remove('hover');
                });
            };
            const onEnd = () => {
                if (el.dataset.dragging !== "true") return;
                el.dataset.dragging = "false";
                let matched = false;
                document.querySelectorAll('.drop-zone').forEach(z => {
                    if (z.classList.contains('hover')) {
                        if (z.dataset.matchValue === el.dataset.matchValue) { handleMatch(el, z); matched = true; }
                        z.classList.remove('hover');
                    }
                });
                if (!matched) requestAnimationFrame(move);
            };
            el.addEventListener('mousedown', onStart);
            el.addEventListener('touchstart', (e) => { e.preventDefault(); onStart(); }, {passive: false});
            window.addEventListener('mousemove', onMove);
            window.addEventListener('touchmove', onMove, {passive: false});
            window.addEventListener('mouseup', onEnd);
            window.addEventListener('touchend', onEnd);
            requestAnimationFrame(move);
        }

        function handleMatch(floatEl, targetZone) {
            sfxCorrect.play(); speak(targetZone.dataset.targetVal);
            targetZone.classList.add('completed');
            
            const item = vocabData.find(v => v.vi.toLowerCase() === floatEl.dataset.matchValue);
            targetZone.innerHTML = \`<span class="text-green-400 font-black text-xl md:text-2xl animate-pop">\${item.vi.toUpperCase()}</span>\`;
            
            floatEl.remove(); matchesFound++;
            if (matchesFound === roundItems.length) setTimeout(() => showReviewOverlay(false), 600);
        }

        function showReviewOverlay(isReviewRound) {
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
            winTitle.innerText = isReviewRound ? i18n[currentLang].winReview.toUpperCase() : i18n[currentLang].winTitle;
            reviewContainer.innerHTML = '';
            roundItems.forEach(item => {
                const translationWord = currentLang === 'en' ? item.en : item.ru;
                const translationEx = currentLang === 'en' ? item.exEn : item.exRu;
                const row = document.createElement('div');
                row.className = 'review-item animate-pop';
                row.innerHTML = \`
                    <div class="flex justify-between items-center">
                        <div class="flex items-center gap-3">
                            <span class="text-2xl">\${item.icon}</span>
                            <div>
                                <div class="text-xl md:text-2xl font-black">\${item.vi.toUpperCase()}</div>
                                <div class="text-yellow-400 font-bold text-[10px] uppercase opacity-80">\${translationWord}</div>
                            </div>
                        </div>
                        <button class="speaker-btn" onclick="speak('\${item.vi}')"><svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="M11.536 14.01A8.473 8.473 0 0 0 14.026 8a8.473 8.473 0 0 0-2.49-6.01l-.708.707A7.476 7.476 0 0 1 13.025 8c0 2.071-.84 3.946-2.197 5.303l.708.707z"/><path d="M6.717 3.55A.5.5 0 0 1 7 4v8a.5.5 0 0 1-.812.39L3.825 10.5H1.5A.5.5 0 0 1 1 10V6a.5.5 0 0 1 .5-.5h2.325l2.363-1.89a.5.5 0 0 1 .529-.06z"/></svg></button>
                    </div>
                    <div class="example-section">
                        <div class="flex-grow">
                            <div class="text-sm md:text-base font-bold">\${item.exVi}</div>
                            <div class="text-white/60 text-[10px] italic">\${translationEx}</div>
                        </div>
                        <button class="speaker-btn" onclick="speak('\${item.exVi}')"><svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M11.536 14.01A8.473 8.473 0 0 0 14.026 8a8.473 8.473 0 0 0-2.49-6.01l-.708.707A7.476 7.476 0 0 1 13.025 8c0 2.071-.84 3.946-2.197 5.303l.708.707z"/><path d="M6.717 3.55A.5.5 0 0 1 7 4v8a.5.5 0 0 1-.812.39L3.825 10.5H1.5A.5.5 0 0 1 1 10V6a.5.5 0 0 1 .5-.5h2.325l2.363-1.89a.5.5 0 0 1 .529-.06z"/></svg></button>
                    </div>
                \`;
                reviewContainer.appendChild(row);
            });
            overlay.style.display = 'flex';
        }

        listenAllBtn.onclick = async () => {
            for (const item of roundItems) {
                const items = document.querySelectorAll('.review-item');
                items.forEach(el => el.classList.remove('active', 'border-yellow-500'));
                const currentEl = Array.from(items).find(el => el.innerText.includes(item.vi.toUpperCase()));
                if(currentEl) {
                    currentEl.classList.add('border-yellow-500');
                    currentEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                await speak(item.vi); await new Promise(r => setTimeout(r, 600));
            }
        };

        nextBtn.onclick = () => {
            if (currentRoundGlobal < 21) loadRound(currentRoundGlobal + 1);
            else { winTitle.innerText = i18n[currentLang].finishTitle; nextBtn.innerText = i18n[currentLang].retryBtn; nextBtn.onclick = () => location.reload(); }
        };

    </script>
</body>
</html>
`;

const GameVocabularyQuestionWord: React.FC = () => {
    const gameWrapperRef = useRef<HTMLDivElement>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [iframeSrc, setIframeSrc] = useState<string | undefined>(undefined);

    useEffect(() => {
        const blob = new Blob([gameHTML], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        setIframeSrc(url);

        return () => URL.revokeObjectURL(url);
    }, []);

    const handleFullscreenChange = () => {
        setIsFullscreen(!!document.fullscreenElement);
    };

    useEffect(() => {
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const toggleFullscreen = () => {
        const elem = gameWrapperRef.current;
        if (elem) {
            if (!document.fullscreenElement) {
                elem.requestFullscreen().catch(err => {
                    alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
                });
            } else {
                document.exitFullscreen();
            }
        }
    };

    return (
        <div ref={gameWrapperRef} className="relative w-full h-full overflow-hidden bg-slate-900">
            {iframeSrc ? (
                <iframe
                    src={iframeSrc}
                    className="w-full h-full"
                    style={{ border: 'none' }}
                    allow="fullscreen"
                    title="Vietnamese Question Word Game"
                ></iframe>
            ) : (
                <div className="flex items-center justify-center h-full text-white">Loading...</div>
            )}
            <button 
                onClick={toggleFullscreen} 
                title="Toggle Fullscreen" 
                className="absolute bottom-2 right-2 bg-black/20 text-white/50 p-1.5 rounded-full backdrop-blur-sm hover:bg-black/40 hover:text-white/80 transition-all opacity-40 hover:opacity-100 z-50"
            >
                {isFullscreen ? <Minimize size={14} /> : <Maximize size={14} />}
            </button>
        </div>
    );
};

export default GameVocabularyQuestionWord;

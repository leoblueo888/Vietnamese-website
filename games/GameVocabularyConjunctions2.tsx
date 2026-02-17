
import React, { useEffect, useRef, useState } from 'react';
import { Maximize, Minimize } from 'lucide-react';

const gameHTML = `
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vietnamese Conjunction - Master</title>
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
        }

        header {
            width: 100%;
            padding: 1rem;
            background: rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(10px);
            z-index: 100;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.5rem;
        }

        .header-controls {
            display: flex;
            align-items: center;
            gap: 1.5rem;
            background: rgba(255, 255, 255, 0.05);
            padding: 0.5rem 1.5rem;
            border-radius: 50px;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .nav-btn {
            background: rgba(255, 255, 255, 0.1);
            color: white;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s;
        }

        .nav-btn:hover:not(.disabled) {
            background: #f59e0b;
            transform: scale(1.1);
        }

        .game-header-text {
            color: white;
            font-size: 0.9rem;
            font-weight: 900;
            letter-spacing: 0.1em;
            min-width: 220px;
            text-align: center;
        }

        .round-dots {
            display: flex;
            gap: 6px;
            flex-wrap: wrap;
            justify-content: center;
        }

        .dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.2);
            transition: all 0.3s;
        }

        .dot.active {
            background: #fbbf24;
            box-shadow: 0 0 10px #fbbf24;
            transform: scale(1.2);
        }

        .dot.completed {
            background: rgba(255, 255, 255, 0.6);
        }

        .floating-word {
            position: absolute;
            cursor: grab;
            padding: 10px 20px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.4);
            font-weight: 800;
            font-size: 1rem;
            color: #1e1b4b;
            z-index: 999;
            touch-action: none;
            border: 3px solid #f59e0b;
            text-align: center;
        }

        .main-card {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 30px;
            padding: 2.5rem;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1.5rem;
            width: 100%;
            max-width: 380px;
            box-shadow: 0 30px 60px rgba(0,0,0,0.4);
        }

        .russian-word-big {
            font-size: 3.5rem;
            font-weight: 900;
            color: #fbbf24;
            text-shadow: 0 5px 15px rgba(0,0,0,0.3);
            text-align: center;
        }

        .classic-layout {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 2rem;
            width: 100%;
            max-width: 1100px;
            padding: 2rem;
        }

        .sentence-row-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 100%;
            padding: 2.5rem;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 40px;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .sentence-row {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 1.5rem;
            width: 100%;
            flex-wrap: nowrap;
            white-space: nowrap;
        }

        .sentence-part {
            font-size: 2.5rem;
            font-weight: 900;
            color: white;
            flex-shrink: 0;
        }

        .drop-zone {
            width: 240px;
            height: 70px;
            border: 2px dashed rgba(255, 255, 255, 0.3);
            border-radius: 15px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(0,0,0,0.2);
            transition: all 0.3s;
            flex-shrink: 0;
        }

        .drop-zone.hover {
            border-color: #fbbf24;
            background: rgba(251, 191, 36, 0.1);
        }

        .overlay {
            position: fixed;
            inset: 0;
            background: rgba(15, 23, 42, 0.95);
            display: none;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 2000;
            backdrop-filter: blur(15px);
        }

        .mix-btn {
            background: rgba(255, 255, 255, 0.1);
            color: white;
            padding: 2rem;
            border-radius: 25px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1rem;
            transition: all 0.3s;
            width: 100%;
            cursor: pointer;
        }
        
        .mix-btn:hover {
            background: rgba(255, 255, 255, 0.15);
            border-color: #fbbf24;
        }

        .speaker-btn {
            background: #f59e0b;
            color: #1e1b4b;
            width: 44px;
            height: 44px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s;
        }

        .speaker-btn-small {
            background: rgba(245, 158, 11, 0.2);
            color: #f59e0b;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s;
            border: 1px solid rgba(245, 158, 11, 0.3);
        }

        .speaker-btn-small:hover {
            background: #f59e0b;
            color: #1e1b4b;
        }

        .lang-toggle {
            display: flex;
            gap: 10px;
            margin-bottom: 30px;
        }

        .lang-btn {
            padding: 8px 20px;
            border-radius: 50px;
            background: rgba(255,255,255,0.1);
            color: white;
            font-weight: 700;
            font-size: 0.8rem;
            cursor: pointer;
            border: 1px solid rgba(255,255,255,0.1);
            transition: all 0.3s;
        }

        .lang-btn.active {
            background: #f59e0b;
            color: #1e1b4b;
            border-color: #f59e0b;
        }

        @keyframes pop {
            0% { transform: scale(0.9); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
        }
        .animate-pop { animation: pop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
    </style>
</head>
<body>

    <div id="start-screen" class="overlay" style="display: flex;">
        <div class="text-center animate-pop max-w-4xl w-full px-6 flex flex-col items-center">
            <h1 id="start-title" class="text-7xl font-black text-yellow-400 mb-2 italic tracking-tighter uppercase leading-tight">Vietnamese Conjunction</h1>
            <p id="start-subtitle" class="text-white/60 mb-8 uppercase tracking-[0.3em] font-bold text-sm">Liên từ & Giới từ Tiếng Việt</p>
            
            <div class="lang-toggle">
                <button id="lang-en" class="lang-btn active" onclick="setLanguage('en')">ENGLISH</button>
                <button id="lang-ru" class="lang-btn" onclick="setLanguage('ru')">РУССКИЙ</button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-1 gap-8 max-w-md mx-auto w-full">
                <button class="mix-btn" onclick="startGame(0)">
                    <div id="start-btn-text" class="text-4xl font-black italic">Bắt đầu</div>
                    <span id="start-btn-sub" class="font-bold uppercase text-xs tracking-widest opacity-70">LIÊN TỪ / GIỚI TỪ</span>
                </button>
            </div>
        </div>
    </div>

    <header>
        <div class="header-controls">
            <div id="btn-prev" class="nav-btn" onclick="handlePrev()"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256"><path d="M165.66,202.34a8,8,0,0,1-11.32,11.32l-80-80a8,8,0,0,1,0-11.32l80-80a8,8,0,0,1,11.32,11.32L91.31,128Z"></path></svg></div>
            <div class="game-header-text uppercase font-black">
                <span id="lvl-name">...</span> | <span id="phase-tag">PHASE 1</span>
            </div>
            <div id="btn-next" class="nav-btn" onclick="handleNext()"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256"><path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z"></path></svg></div>
        </div>
        <div id="round-indicators" class="round-dots mt-2"></div>
    </header>

    <main class="flex-grow flex items-center justify-center relative overflow-hidden p-6">
        <div id="game-canvas" class="z-10 w-full flex justify-center"></div>
        <div id="floating-area" class="absolute inset-0 pointer-events-none"></div>
    </main>

    <div id="success-overlay" class="overlay">
        <div class="bg-indigo-950/80 p-10 rounded-[40px] border border-white/20 text-center animate-pop max-w-lg w-full mx-4 shadow-2xl backdrop-blur-2xl">
            <div id="popup-content" class="flex flex-col items-center">
                <div class="flex items-center gap-4 mb-3">
                    <h2 id="pop-vn-main" class="text-7xl font-black text-white"></h2>
                    <div id="pop-speaker-main" class="speaker-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256"><path d="M155.51,24.81a8,8,0,0,0-8.42.88L77.25,80H32A16,16,0,0,0,16,96v64a16,16,0,0,0,16,16H77.25l69.84,54.31A8,8,0,0,0,160,224V32A8,8,0,0,0,155.51,24.81ZM144,207.64l-61.12-47.53A8,8,0,0,0,77.25,158.4H32V97.6h45.25a8,8,0,0,0,5.63-2.31L144,48.36ZM208,128a32,32,0,0,0-9.37-22.63,8,8,0,0,0-11.32,11.32,16,16,0,0,1,0,22.62,8,8,0,0,0,11.32,11.32A32,32,0,0,0,208,128Zm32,0a64,64,0,0,0-18.75-45.25,8,8,0,0,0-11.32,11.32,48,48,0,0,1,0,67.86,8,8,0,0,0,11.32,11.32A64,64,0,0,0,240,128Z"></path></svg>
                    </div>
                </div>
                <div id="pop-meaning" class="text-yellow-400 font-bold text-2xl uppercase tracking-widest mb-10"></div>

                <div class="bg-white/5 p-6 rounded-3xl w-full text-left mb-10 border border-white/5">
                    <div class="flex items-start gap-3 mb-2">
                        <p id="ex-vn" class="text-white font-bold text-xl flex-grow"></p>
                        <div id="pop-speaker-ex" class="speaker-btn-small flex-shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256"><path d="M155.51,24.81a8,8,0,0,0-8.42.88L77.25,80H32A16,16,0,0,0,16,96v64a16,16,0,0,0,16,16H77.25l69.84,54.31A8,8,0,0,0,160,224V32A8,8,0,0,0,155.51,24.81ZM144,207.64l-61.12-47.53A8,8,0,0,0,77.25,158.4H32V97.6h45.25a8,8,0,0,0,5.63-2.31L144,48.36Z"></path></svg>
                        </div>
                    </div>
                    <p id="ex-trans" class="text-yellow-400/70 font-bold text-base"></p>
                </div>

                <button id="next-round-btn" class="bg-yellow-400 hover:bg-yellow-500 text-indigo-950 font-black py-5 px-12 rounded-2xl uppercase tracking-widest transition-all w-full shadow-xl text-lg italic">TIẾP TỤC</button>
            </div>
        </div>
    </div>

    <script>
        const ringtone = new Audio("https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3");
        
        function speak(text) {
            const url = \`https://translate.google.com/translate_tts?ie=UTF-8&q=\${encodeURIComponent(text)}&tl=vi&client=tw-ob\`;
            const audio = new Audio(url);
            audio.play().catch(e => console.log("Audio play failed:", e));
        }

        let currentLang = 'en';
        const i18n = {
            en: {
                title: "Vietnamese Conjunction",
                subtitle: "Vietnamese Grammar Master",
                start: "Start",
                category: "CONJUNCTIONS / PREPOSITIONS",
                dropHere: "DRAG THE WORD HERE",
                dropHereSmall: "DRAG HERE",
                phase: "PHASE",
                matching: "Match Vocabulary",
                complete: "Complete Sentence",
                continue: "CONTINUE"
            },
            ru: {
                title: "Вьетнамские союзы",
                subtitle: "Мастер вьетнамской грамматики",
                start: "Начать",
                category: "СОЮЗЫ / ПРЕДЛОГИ",
                dropHere: "ПЕРЕТАЩИТЕ СЛОВО СЮДА",
                dropHereSmall: "СЮДА",
                phase: "ФАЗА",
                matching: "Подберите лексику",
                complete: "Дополните предложение",
                continue: "ПРОДОЛЖИТЬ"
            }
        };

        function setLanguage(lang) {
            currentLang = lang;
            document.getElementById('lang-en').className = \`lang-btn \${lang === 'en' ? 'active' : ''}\`;
            document.getElementById('lang-ru').className = \`lang-btn \${lang === 'ru' ? 'active' : ''}\`;
            
            const t = i18n[lang];
            document.getElementById('start-title').innerText = t.title;
            document.getElementById('start-subtitle').innerText = t.subtitle;
            document.getElementById('start-btn-text').innerText = t.start;
            document.getElementById('start-btn-sub').innerText = t.category;
            document.getElementById('next-round-btn').innerText = t.continue;
            
            rawData[0].name = t.category;
        }

        const rawData = [
            {
                id: 0, name: "CONJUNCTIONS / PREPOSITIONS",
                vocabulary: [
                    { vn: "và", ph: "And", ru: "И", practices: [
                        { leftVn: "Mẹ", rightVn: "con.", ans: "và", fullVn: "Mẹ và con.", transEn: "Mother and child.", transRu: "Мать и ребенок." },
                        { leftVn: "Bút", rightVn: "vở.", ans: "và", fullVn: "Bút và vở.", transEn: "Pen and notebook.", transRu: "Ручка и тетрадь." }
                    ]},
                    { vn: "về", ph: "About", ru: "О / ОБ", practices: [
                        { leftVn: "Tôi đang nghĩ", rightVn: "bạn.", ans: "về", fullVn: "Tôi đang nghĩ về bạn.", transEn: "Thinking about you.", transRu: "Думаю о тебе." },
                        { leftVn: "Cuốn sách", rightVn: "tình yêu.", ans: "về", fullVn: "Cuốn sách về tình yêu.", transEn: "Book about love.", transRu: "Книга о любви." }
                    ]},
                    { vn: "hoặc", ph: "Or", ru: "ИЛИ", practices: [
                        { leftVn: "Trà", rightVn: "cà phê?", ans: "hoặc", fullVn: "Trà hoặc cà phê?", transEn: "Tea or coffee?", transRu: "Чай или кофе?" },
                        { leftVn: "Bạn", rightVn: "anh ấy?", ans: "hoặc", fullVn: "Bạn hoặc anh ấy?", transEn: "You or him?", transRu: "Ты или он?" }
                    ]},
                    { vn: "nhưng", ph: "But", ru: "НО", practices: [
                        { leftVn: "Ít,", rightVn: "tốt.", ans: "nhưng", fullVn: "Ít, nhưng tốt.", transEn: "Few, but good.", transRu: "Мало, но хорошо." },
                        { leftVn: "Rẻ,", rightVn: "tệ.", ans: "nhưng", fullVn: "Rẻ, nhưng tệ.", transEn: "Cheap, but bad.", transRu: "Дешево, но плохо." }
                    ]},
                    { vn: "còn", ph: "And/Still", ru: "А / ЕЩЕ", practices: [
                        { leftVn: "Tôi ở đây,", rightVn: "bạn?", ans: "còn", fullVn: "Tôi ở đây, còn bạn?", transEn: "I'm here, and you?", transRu: "Я здесь, а ты?" },
                        { leftVn: "Đây là cam,", rightVn: "kia là táo.", ans: "còn", fullVn: "Đây là cam, còn kia là táo.", transEn: "This is orange, and that is apple.", transRu: "Это апельсин, а то яблоко." }
                    ]},
                    { vn: "vì", ph: "Because", ru: "ПОТОМУ ЧТО", practices: [
                        { leftVn: "Tôi ở nhà", rightVn: "bị ốm.", ans: "vì", fullVn: "Tôi ở nhà vì bị ốm.", transEn: "Home because of illness.", transRu: "Дома, потому что болен." },
                        { leftVn: "Anh ấy ăn", rightVn: "đói.", ans: "vì", fullVn: "Anh ấy ăn vì đói.", transEn: "He eats because he's hungry.", transRu: "Он ест, потому что голоден." }
                    ]},
                    { vn: "nếu", ph: "If", ru: "ЕСЛИ", practices: [
                        { leftVn: "Nói cho tôi", rightVn: "bạn biết.", ans: "nếu", fullVn: "Nói cho tôi nếu bạn biết.", transEn: "Tell me if you know.", transRu: "Скажи мне, если знаешь." },
                        { leftVn: "Hãy mua", rightVn: "bạn muốn.", ans: "nếu", fullVn: "Hãy mua nếu bạn muốn.", transEn: "Buy it if you want.", transRu: "Купи, если хочешь." }
                    ]},
                    { vn: "khi", ph: "When", ru: "КОГДА", practices: [
                        { leftVn: "Gọi cho tôi", rightVn: "bạn đến.", ans: "khi", fullVn: "Gọi cho tôi khi bạn đến.", transEn: "Call me when you arrive.", transRu: "Позвони мне, когда придешь." },
                        { leftVn: "Ngủ", rightVn: "thấy mệt.", ans: "khi", fullVn: "Ngủ khi thấy mệt.", transEn: "Sleep when tired.", transRu: "Спи, когда устал." }
                    ]},
                    { vn: "rằng", ph: "That", ru: "ЧТО", practices: [
                        { leftVn: "Anh ấy nói", rightVn: "sẽ đến.", ans: "rằng", fullVn: "Anh ấy nói rằng sẽ đến.", transEn: "He said that he'd come.", transRu: "Он сказал, что придет." },
                        { leftVn: "Tôi tin", rightVn: "bạn đúng.", ans: "rằng", fullVn: "Tôi tin rằng bạn đúng.", transEn: "I believe that you're right.", transRu: "Я верю, что ты прав." }
                    ]},
                    { vn: "vì vậy", ph: "So", ru: "ПОЭТОМУ", practices: [
                        { leftVn: "Tôi bận,", rightVn: "tôi im lặng.", ans: "vì vậy", fullVn: "Tôi bận, vì vậy tôi im lặng.", transEn: "I'm busy, so I'm silent.", transRu: "Я занят, поэтому молчу." },
                        { leftVn: "Trời nóng,", rightVn: "tôi đi tắm.", ans: "vì vậy", fullVn: "Trời nóng, vì vậy tôi đi tắm.", transEn: "It's hot, so I take a shower.", transRu: "Жарко, поэтому я иду в душ." }
                    ]}
                ]
            }
        ];

        let levelData = [];
        let currentLevelIdx = 0;
        let currentLevel = null;
        let currentRound = 0; 
        let currentSubRound = 0; 
        let currentPhase = 1; 
        let animationFrames = [];

        const gameCanvas = document.getElementById('game-canvas');
        const floatingArea = document.getElementById('floating-area');
        const overlay = document.getElementById('success-overlay');

        function shuffle(array) {
            let currentIndex = array.length, randomIndex;
            while (currentIndex != 0) {
                randomIndex = Math.floor(Math.random() * currentIndex);
                currentIndex--;
                [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
            }
            return array;
        }

        function playCorrectSound() {
            ringtone.currentTime = 0;
            ringtone.play();
        }

        function startGame(idx) {
            levelData = JSON.parse(JSON.stringify(rawData));
            levelData[idx].vocabulary = shuffle([...levelData[idx].vocabulary]);
            
            currentLevelIdx = idx;
            currentLevel = levelData[currentLevelIdx];
            currentRound = 0; 
            currentSubRound = 0;
            currentPhase = 1;
            document.getElementById('start-screen').style.display = 'none';
            initRound();
        }

        function handleNext() {
            if (currentPhase === 1) {
                if (currentRound < currentLevel.vocabulary.length - 1) {
                    currentRound++;
                    initRound();
                } else {
                    currentPhase = 2;
                    currentRound = 0;
                    currentSubRound = 0;
                    let pSequence = [];
                    currentLevel.vocabulary.forEach((word, wordIdx) => {
                        pSequence.push({ wordIdx, practiceIdx: 0 });
                        pSequence.push({ wordIdx, practiceIdx: 1 });
                    });
                    currentLevel.practiceSequence = shuffle(pSequence);
                    initRound();
                }
            } else {
                if (currentSubRound < currentLevel.practiceSequence.length - 1) {
                    currentSubRound++;
                    initRound();
                } else {
                    document.getElementById('start-screen').style.display = 'flex';
                }
            }
        }

        function handlePrev() {
            if (currentPhase === 1) {
                if (currentRound > 0) {
                    currentRound--;
                    initRound();
                } else {
                    document.getElementById('start-screen').style.display = 'flex';
                }
            } else {
                if (currentSubRound > 0) {
                    currentSubRound--;
                    initRound();
                } else {
                    currentPhase = 1;
                    currentRound = currentLevel.vocabulary.length - 1;
                    initRound();
                }
            }
        }

        function updateHeaderUI() {
            const t = i18n[currentLang];
            document.getElementById('lvl-name').innerText = currentLevel.name;
            document.getElementById('phase-tag').innerText = \`\${t.phase} \${currentPhase}\`;
            const dotsContainer = document.getElementById('round-indicators');
            dotsContainer.innerHTML = '';
            
            const total = currentPhase === 1 ? currentLevel.vocabulary.length : currentLevel.practiceSequence.length;
            const current = currentPhase === 1 ? currentRound : currentSubRound;

            for(let i=0; i<total; i++) {
                const dot = document.createElement('div');
                dot.className = \`dot \${i === current ? 'active' : (i < current ? 'completed' : '')}\`;
                dotsContainer.appendChild(dot);
            }
        }

        function initRound() {
            animationFrames.forEach(f => cancelAnimationFrame(f));
            animationFrames = [];
            gameCanvas.innerHTML = '';
            floatingArea.innerHTML = '';
            updateHeaderUI();
            if (currentPhase === 1) renderPhase1();
            else renderPhase2();
        }

        function renderPhase1() {
            const t = i18n[currentLang];
            const word = currentLevel.vocabulary[currentRound];
            const card = document.createElement('div');
            card.className = 'main-card animate-pop';
            
            const displayMeaning = currentLang === 'en' ? word.ph : word.ru;

            card.innerHTML = \`
                <div class="russian-word-big text-center text-4xl uppercase">\${displayMeaning}</div>
                <div class="text-white/30 text-xs italic font-bold">/ \${word.ph} /</div>
                <div class="drop-zone w-full" data-target="\${word.vn}">
                    <span class="text-white/20 font-black uppercase text-[10px] tracking-widest text-center">\${t.dropHere}</span>
                </div>
                <div class="text-yellow-400 font-bold uppercase text-sm tracking-widest">\${t.matching}</div>
            \`;
            gameCanvas.appendChild(card);
            createFloating(word.vn);
        }

        function createFloating(text) {
            const el = document.createElement('div');
            el.className = 'floating-word pointer-events-auto uppercase';
            el.innerText = text;
            floatingArea.appendChild(el);
            let x = Math.random() * (window.innerWidth - 200) + 100;
            let y = Math.random() * (window.innerHeight - 300) + 150;
            let dx = (Math.random() - 0.5) * 2; 
            let dy = (Math.random() - 0.5) * 2;

            function move() {
                if (el.dataset.dragging !== 'true') {
                    if (x < 50 || x > window.innerWidth - 150) dx *= -1;
                    if (y < 120 || y > window.innerHeight - 100) dy *= -1;
                    x += dx; y += dy;
                    el.style.left = x + 'px'; el.style.top = y + 'px';
                }
                const frame = requestAnimationFrame(move);
                animationFrames.push(frame);
            }
            
            el.onmousedown = (e) => startDrag(e);
            el.ontouchstart = (e) => startDrag(e);

            function startDrag(e) {
                el.dataset.dragging = 'true';
                const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
                const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;
                const offX = clientX - el.offsetLeft; 
                const offY = clientY - el.offsetTop;

                const onMove = (m) => {
                    const mX = m.type === 'touchmove' ? m.touches[0].clientX : m.clientX;
                    const mY = m.type === 'touchmove' ? m.touches[0].clientY : m.clientY;
                    x = mX - offX; y = mY - offY;
                    el.style.left = x + 'px'; el.style.top = y + 'px';
                    const dz = document.querySelector('.drop-zone');
                    const r1 = dz.getBoundingClientRect(); const r2 = el.getBoundingClientRect();
                    if (!(r2.left > r1.right || r2.right < r1.left || r2.top > r1.bottom || r2.bottom < r1.top)) dz.classList.add('hover');
                    else dz.classList.remove('hover');
                };

                const onUp = () => {
                    el.dataset.dragging = 'false';
                    const dz = document.querySelector('.drop-zone');
                    if (dz && dz.classList.contains('hover')) {
                        dz.innerHTML = \`<span class="text-white font-black uppercase animate-pop">\${text}</span>\`;
                        playCorrectSound();
                        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
                        speak(text); el.remove(); setTimeout(showSuccess, 800);
                    }
                    window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp);
                    window.removeEventListener('touchmove', onMove); window.removeEventListener('touchend', onUp);
                };
                window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp);
                window.addEventListener('touchmove', onMove, {passive: false}); window.addEventListener('touchend', onUp);
            }
            move();
        }

        function renderPhase2() {
            const t = i18n[currentLang];
            const step = currentLevel.practiceSequence[currentSubRound];
            const word = currentLevel.vocabulary[step.wordIdx];
            const practice = word.practices[step.practiceIdx];
            
            const container = document.createElement('div');
            container.className = 'classic-layout animate-pop';
            container.innerHTML = \`
                <div class="sentence-row-container">
                    <div class="sentence-row">
                        <span class="sentence-part">\${practice.leftVn}</span>
                        <div class="drop-zone" data-target="\${practice.ans}">
                             <span class="text-white/20 font-black uppercase text-[10px] tracking-widest">\${t.dropHereSmall}</span>
                        </div>
                        <span class="sentence-part">\${practice.rightVn}</span>
                    </div>
                </div>
                <div class="text-yellow-400 font-bold uppercase text-sm tracking-widest mt-4">\${t.complete}</div>
            \`;
            gameCanvas.appendChild(container);
            createFloating(practice.ans);
        }

        function showSuccess() {
            const step = currentPhase === 1 ? null : currentLevel.practiceSequence[currentSubRound];
            const word = currentPhase === 1 ? currentLevel.vocabulary[currentRound] : currentLevel.vocabulary[step.wordIdx];
            const practice = currentPhase === 1 ? word.practices[0] : word.practices[step.practiceIdx];

            const mainTranslation = currentLang === 'en' ? word.ph : word.ru;
            const exTranslation = currentLang === 'en' ? practice.transEn : practice.transRu;

            document.getElementById('pop-vn-main').innerText = word.vn.toUpperCase();
            document.getElementById('pop-meaning').innerText = mainTranslation;
            document.getElementById('ex-vn').innerText = practice.fullVn;
            document.getElementById('ex-trans').innerText = exTranslation;
            
            overlay.style.display = 'flex';
            
            document.getElementById('pop-speaker-main').onclick = () => speak(word.vn);
            document.getElementById('pop-speaker-ex').onclick = () => speak(practice.fullVn);
            
            document.getElementById('next-round-btn').onclick = () => {
                overlay.style.display = 'none';
                handleNext();
            };
        }
        
        setLanguage('en');
    </script>
</body>
</html>
`;

export const GameVocabularyConjunctions2: React.FC = () => {
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
        <div ref={gameWrapperRef} className="relative w-full h-full bg-slate-900">
            {iframeSrc && (
                <iframe
                    src={iframeSrc}
                    className="w-full h-full"
                    style={{ border: 'none' }}
                    allow="fullscreen"
                    title="Vietnamese Conjunctions Game"
                ></iframe>
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

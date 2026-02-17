
import React, { useState, useEffect, useRef } from 'react';
import { Maximize, Minimize } from 'lucide-react';

const gameHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SPEAK VIET : THE BEACH V3</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@400;600;700&display=swap');

        body {
            font-family: 'Quicksand', sans-serif;
            background: #f0f9ff;
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            margin: 0;
            overflow: hidden;
        }

        .game-card {
            background-size: cover; 
            background-position: center;
            background-repeat: no-repeat;
            border-radius: 2rem;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.3);
            width: 95vw;
            max-width: 900px;
            height: 90vh;
            max-height: 800px;
            display: flex;
            flex-direction: column;
            position: relative;
            overflow: hidden;
            background-color: #e0f2fe;
            transition: background-image 0.8s ease-in-out;
        }

        /* START OVERLAY */
        .overlay {
            position: absolute;
            inset: 0;
            background: rgba(255, 255, 255, 0.8);
            backdrop-filter: blur(12px);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 300;
            border-radius: 2rem;
            text-align: center;
            padding: 20px;
        }

        .start-content-box {
            background: rgba(255, 255, 255, 0.95);
            padding: 24px;
            border-radius: 2rem;
            box-shadow: 0 20px 60px rgba(0,0,0,0.1);
            border: 1px solid white;
            display: flex;
            flex-direction: column;
            align-items: center;
            max-width: 400px; 
            width: 100%;
        }

        #game-header {
            flex-shrink: 0;
            background: rgba(255, 255, 255, 0.9);
            backdrop-filter: blur(10px);
            border-bottom: 1px solid #e5e7eb;
            padding: 0.8rem 1.5rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            z-index: 100;
        }

        /* MOBILE HEADER FIXES */
        @media (max-width: 640px) {
            #header-left-group {
                gap: 0.5rem !important;
            }
            #round-title-prefix {
                display: none;
            }
            #round-title-mobile-prefix {
                display: inline !important;
            }
            #round-title {
                width: auto !important;
                text-align: left !important;
            }
            #game-header {
                padding: 0.8rem 0.75rem !important;
            }
        }

        #round-title-mobile-prefix {
            display: none;
        }

        .nav-round-btn {
            background: #e2e8f0;
            color: #475569;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s;
            border: none;
        }
        .nav-round-btn:hover:not(:disabled) {
            background: #6366f1;
            color: white;
        }
        .nav-round-btn:disabled {
            opacity: 0.3;
            cursor: not-allowed;
        }

        .scene-container {
            flex: 1;
            overflow-y: auto; 
            display: flex;
            flex-direction: column;
            position: relative;
            padding-bottom: 120px;
            scroll-behavior: smooth;
        }
        
        .bubble-container {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
            max-width: 700px;
            margin: 30px auto; 
            width: 100%;
            padding: 0 1.5rem;
            z-index: 20;
        }

        .bubble-wrapper {
            display: flex;
            align-items: flex-start;
            gap: 12px;
            width: 100%;
            animation: fadeIn 0.5s ease-out forwards;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .speaker-btn {
            background: #6366f1;
            color: white;
            width: 44px;
            height: 44px;
            border-radius: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
            transition: 0.2s;
            flex-shrink: 0;
        }
        .speaker-btn:hover { transform: scale(1.05); }
        
        .ella-voice-btn { background: #be185d; box-shadow: 0 4px 12px rgba(190, 24, 93, 0.3); }
        .user-voice-btn { background: #0369a1; box-shadow: 0 4px 12px rgba(3, 105, 161, 0.3); }

        .bubble {
            padding: 1.2rem 1.5rem;
            border-radius: 1.5rem;
            max-width: 85%;
            box-shadow: 0 10px 25px rgba(0,0,0,0.08);
            background: rgba(255, 255, 255, 0.95);
            border: 1px solid rgba(255,255,255,0.5);
            position: relative;
        }

        .bubble-ella-quest { border-left: 6px solid #be185d; }
        .bubble-user-ans { border-right: 6px solid #0369a1; }

        .main-text { font-size: 1.25rem; font-weight: 800; margin-bottom: 6px; display: block; color: #1e293b; }
        .sub-text { font-size: 0.95rem; font-weight: 600; color: #64748b; display: block; border-top: 1px solid #f1f5f9; padding-top: 6px; margin-top: 4px; font-style: italic; }
        
        .hint-text { font-size: 0.8rem; font-weight: 700; color: #94a3b8; display: block; margin-top: 8px; text-transform: uppercase; }

        .drop-zone {
            display: inline-block;
            min-width: 160px;
            height: 40px;
            border-bottom: 3px dashed #cbd5e1;
            margin: 0 8px;
            vertical-align: middle;
            background: rgba(241, 245, 249, 0.5);
            border-radius: 8px;
        }
        
        .drag-item {
            background: white;
            border: 2px solid #6366f1;
            color: #4338ca;
            padding: 12px 20px;
            border-radius: 14px;
            cursor: grab;
            font-weight: 700;
            box-shadow: 0 5px 15px rgba(99, 102, 241, 0.1);
            text-align: center;
        }

        .input-group {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            vertical-align: middle;
        }

        .inline-input {
            border: none;
            border-bottom: 3px solid #0369a1;
            background: transparent;
            outline: none;
            font-weight: 800;
            color: #0369a1;
            padding: 0 8px;
            width: 120px;
            text-align: center;
        }

        .send-btn {
            background: #0369a1;
            color: white;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: 0.2s;
            border: none;
        }
        .send-btn:hover { background: #075985; transform: scale(1.1); }
        .send-btn:disabled { opacity: 0.3; cursor: not-allowed; }

        .toggle-btn { flex: 1; padding: 10px; border-radius: 12px; font-weight: 700; background: #f1f5f9; color: #64748b; transition: 0.3s; }
        .toggle-btn.active { background: #6366f1; color: white; }
        
        .hidden { display: none !important; }

        /* Highlight Review Round */
        .highlight-ella .bubble-ella-quest { background: #fdf2f8 !important; border-color: #be185d !important; transform: scale(1.02); }
        .highlight-user .bubble-user-ans { background: #f0f9ff !important; border-color: #0369a1 !important; transform: scale(1.02); }
    </style>
</head>
<body onload="initGame()">

    <div class="game-card" id="main-card">
        <!-- Start Screen -->
        <div id="start-overlay" class="overlay">
            <div class="start-content-box">
                <div class="mb-3 bg-indigo-100 p-3 rounded-full">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" stroke-width="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                </div>
                <h1 class="text-2xl font-black text-indigo-900 mb-1 tracking-tight">THE BEACH</h1>
                <p id="ui-subtitle" class="text-indigo-600 font-bold text-xs mb-6 italic">Master beach talks in Vietnamese 🌊</p>
                
                <div class="w-full mb-6">
                    <p id="ui-lang-label" class="text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest text-left">LANGUAGE</p>
                    <div class="flex gap-2">
                        <button id="lang-en" onclick="setUserLanguage('en')" class="toggle-btn active">🇬🇧 EN</button>
                        <button id="lang-ru" onclick="setUserLanguage('ru')" class="toggle-btn">🇷🇺 RU</button>
                    </div>
                </div>

                <div class="bg-blue-50 p-4 rounded-xl mb-6 text-left w-full border border-blue-100">
                    <p id="ui-howtoplay-title" class="text-[10px] font-black text-blue-800 mb-2 uppercase tracking-wider">HOW TO PLAY:</p>
                    <ul id="ui-howtoplay-list" class="text-[12px] text-blue-700 space-y-1.5 font-bold"></ul>
                </div>

                <button id="ui-start-btn" onclick="startGame()" class="w-full py-4 bg-indigo-600 text-white rounded-full font-black text-lg shadow-lg hover:bg-indigo-700 active:scale-95 transition-all">START NOW</button>
            </div>
        </div>

        <!-- Header -->
        <div id="game-header">
            <div class="flex items-center gap-3" id="header-left-group">
                <div class="flex flex-col">
                    <h1 id="ui-header-title" class="text-[10px] font-black text-indigo-500 uppercase tracking-widest">BEACH CONVERSATION</h1>
                    <div class="flex items-center gap-2">
                        <button id="btn-prev-round" onclick="prevRound()" class="nav-round-btn">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                        </button>
                        <h2 id="round-title" class="text-sm font-black text-gray-800 w-24 text-center">
                            <span id="round-title-prefix">Round</span><span id="round-title-mobile-prefix">R</span> <span id="round-number-text">1/9</span>
                        </h2>
                        <button id="btn-next-round" onclick="nextRound()" class="nav-round-btn">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                        </button>
                    </div>
                </div>
            </div>
            
            <div id="center-header-tools" class="hidden flex items-center gap-2">
                <button id="listen-all-round-btn" onclick="handleListenAllClick()" class="bg-amber-500 text-white px-5 py-2.5 rounded-full text-[10px] font-black shadow-lg hover:bg-amber-600 transition-all flex items-center gap-2 uppercase tracking-wider">
                    <span id="listen-icon">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M11 5L6 9H2v6h4l5 4V5z"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
                    </span>
                    <span id="listen-text">LISTEN ALL</span>
                </button>
                <button id="continue-btn" onclick="goForward()" class="bg-emerald-500 text-white px-6 py-2.5 rounded-full text-xs font-black shadow-lg hover:bg-emerald-600 transition-all flex items-center gap-2 uppercase tracking-widest">
                    CONTINUE 
                </button>
            </div>

            <div class="flex items-center gap-2">
                <div class="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div id="progress-bar" class="h-full bg-indigo-500 transition-all duration-700" style="width: 11%"></div>
                </div>
            </div>
        </div>

        <div class="scene-container" id="game-scene">
            <div id="bubble-area" class="bubble-container"></div>
            <div id="drag-container" class="mt-auto p-6 bg-white/80 backdrop-blur-lg border-t border-white/50 flex justify-center gap-8 hidden"></div>
        </div>

        <!-- Win Overlay -->
        <div id="win-overlay" class="overlay hidden">
            <div class="bg-white p-10 rounded-[3rem] shadow-2xl text-center">
                <div class="text-7xl mb-6">🥳</div>
                <h2 id="ui-win-title" class="text-4xl font-black mb-4 text-indigo-600 uppercase">EXCELLENT!</h2>
                <p id="ui-win-msg" class="text-gray-500 mb-8 font-bold text-lg leading-relaxed">You have mastered beach conversation.</p>
                <button id="ui-replay-btn" onclick="location.reload()" class="px-12 py-5 bg-indigo-600 text-white rounded-full font-black text-xl shadow-xl hover:bg-indigo-700">PLAY AGAIN</button>
            </div>
        </div>
    </div>

    <script>
        const apiKey = "";
        let userLang = 'en';
        let currentRound = 0;
        let history = [];
        let currentGoogleAudio = null;
        let isReviewRunning = false;
        let stopReviewRequested = false;

        const translations = {
            en: {
                subtitle: "Master beach talks in Vietnamese 🌊",
                langLabel: "LANGUAGE",
                howToPlayTitle: "HOW TO PLAY:",
                howToPlayList: [
                    "1. Drag or Type to complete the sentences.",
                    "2. Follow the hints and learn from translations.",
                    "3. Review & Speak the full dialogue at the end."
                ],
                startBtn: "START NOW",
                headerTitle: "BEACH CONVERSATION",
                continueBtn: "CONTINUE",
                listenAllLabel: "LISTEN ALL",
                pauseLabel: "PAUSE",
                reviewTitle: "REVIEW DIALOGUE",
                finishBtn: "FINISH",
                winTitle: "EXCELLENT!",
                winMsg: "You have mastered beach conversation.",
                replayBtn: "PLAY AGAIN",
                placeholder: "Type here...",
                hintLabel: "Hint:",
                dragLabel: "Answer:"
            },
            ru: {
                subtitle: "Пляжные беседы на вьетнамском 🌊",
                langLabel: "ЯЗЫК",
                howToPlayTitle: "КАК ИГРАТЬ:",
                howToPlayList: [
                    "1. Перетаскивайте или вводите ответы.",
                    "2. Используйте подсказки и переводы.",
                    "3. Повторите весь диалог в конце."
                ],
                startBtn: "НАЧАТЬ",
                headerTitle: "РАЗГОВОР НА ПЛЯЖЕ",
                continueBtn: "ДАЛЕЕ",
                listenAllLabel: "СЛУШАТЬ ВСЁ",
                pauseLabel: "ПАУЗА",
                reviewTitle: "ОБЗОР ДИАЛОГА",
                finishBtn: "ЗАВЕРШИТЬ",
                winTitle: "ОТЛИЧНО!",
                winMsg: "Вы освоили пляжную беседу.",
                replayBtn: "ИГРАТЬ СНОВА",
                placeholder: "Введите здесь...",
                hintLabel: "Подсказка:",
                dragLabel: "Ответ:"
            }
        };

        const roundConfig = [
            { 
                q: "Bạn có hay ra biển không?", 
                qSub: { en: "Do you often go to the beach?", ru: "Вы часто ходите на море?" }, 
                type: "drag",
                choices: [
                    { vi: "Có. Mình thường ra biển.", en: "Yes. I often go to the beach.", ru: "Да. Я часто хожу на море." },
                    { vi: "Không. Mình ít ra.", en: "No. I rarely go.", ru: "Нет. Я редко хожу." }
                ]
            },
            { 
                q: "Bạn bơi ngoài biển mấy lần một tuần?", 
                qSub: { en: "How many times a week do you swim in the sea?", ru: "Сколько раз в неделю вы плаваете в море?" }, 
                prefix: "Mình bơi ngoài biển", 
                prefixSub: { en: "I swim in the sea", ru: "Я плаваю в море" },
                suffix: "lần 1 tuần", 
                suffixSub: { en: "times a week", ru: "раза в неделю" },
                hint: { en: "2 times", ru: "2 раза" } 
            },
            { 
                q: "Bạn thường làm gì ngoài biển?", 
                qSub: { en: "What do you usually do at the beach?", ru: "Что вы обычно делаете на пляже?" }, 
                prefix: "Mình thường", 
                prefixSub: { en: "I usually", ru: "Я обычно" },
                suffix: "", 
                suffixSub: { en: "", ru: "" },
                hint: { en: "sunbathe and relax", ru: "загораю и отдыхаю" } 
            },
            { 
                q: "Bạn thường ở ngoài biển trong bao lâu?", 
                qSub: { en: "How long do you usually stay at the beach?", ru: "Как lâu вы обычно остаетесь на пляже?" }, 
                prefix: "Mình thường ở ngoài biển trong", 
                prefixSub: { en: "I usually stay at the beach for", ru: "Я обычно остаюсь на море в течение" },
                suffix: "", 
                suffixSub: { en: "", ru: "" },
                hint: { en: "3 hours", ru: "3 часа" } 
            },
            { 
                q: "Bạn thường ra biển với ai?", 
                qSub: { en: "Who do you usually go to the beach with?", ru: "С кем вы обычно ходите на пляж?" }, 
                prefix: "Mình thường ra biển với", 
                prefixSub: { en: "I usually go to the beach with", ru: "Я обычно хожу на пляж с" },
                suffix: "", 
                suffixSub: { en: "", ru: "" },
                hint: { en: "my family", ru: "моей семьей" } 
            },
            { 
                q: "Tại sao bạn lại thích ra biển?", 
                qSub: { en: "Why do you like going to the beach?", ru: "Почему вам нравится ходить на море?" }, 
                prefix: "Bởi vì biển", 
                prefixSub: { en: "Because the sea", ru: "Потому что море" },
                suffix: "", 
                suffixSub: { en: "", ru: "" },
                hint: { en: "is very beautiful and fresh", ru: "очень красивое и чистое" } 
            },
            { 
                q: "Bạn thích ăn hải sản loại nào?", 
                qSub: { en: "What kind of seafood do you like?", ru: "Какие морепродукты вам нравятся?" }, 
                prefix: "Mình thích ăn", 
                prefixSub: { en: "I like to eat", ru: "Я люблю есть" },
                suffix: "", 
                suffixSub: { en: "", ru: "" },
                hint: { en: "grilled shrimp and crab", ru: "креветки и краб на гриле" } 
            },
            { 
                q: "Bạn muốn đi biển vào chủ nhật này không?", 
                qSub: { en: "Do you want to go to the beach this Sunday?", ru: "Хотите поехать на пляж в это воскресенье?" }, 
                prefix: "OK! Hẹn bạn vào lúc", 
                prefixSub: { en: "OK! See you at", ru: "ОК! Увидимся в" },
                suffix: "sáng", 
                suffixSub: { en: "morning", ru: "утра" },
                hint: { en: "7 o'clock", ru: "7 часов" } 
            },
            { type: "review" }
        ];

        function initGame() {
            updateUILanguage();
            updateBackground();
        }

        function updateUILanguage() {
            const t = translations[userLang];
            document.getElementById('ui-subtitle').innerText = t.subtitle;
            document.getElementById('ui-lang-label').innerText = t.langLabel;
            document.getElementById('ui-howtoplay-title').innerText = t.howToPlayTitle;
            document.getElementById('ui-start-btn').innerText = t.startBtn;
            document.getElementById('ui-header-title').innerText = t.headerTitle;
            document.getElementById('ui-win-title').innerText = t.winTitle;
            document.getElementById('ui-win-msg').innerText = t.winMsg;
            document.getElementById('ui-replay-btn').innerText = t.replayBtn;
            document.getElementById('continue-btn').innerHTML = \`\${t.continueBtn} →\`;
            
            updateListenBtnUI();
            const list = document.getElementById('ui-howtoplay-list');
            list.innerHTML = t.howToPlayList.map(item => \`<li>\${item}</li>\`).join('');
        }

        function updateListenBtnUI() {
            const iconCont = document.getElementById('listen-icon');
            const textCont = document.getElementById('listen-text');
            const t = translations[userLang];
            if (isReviewRunning) {
                textCont.innerText = t.pauseLabel;
                iconCont.innerHTML = \`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>\`;
            } else {
                textCont.innerText = t.listenAllLabel;
                iconCont.innerHTML = \`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M11 5L6 9H2v6h4l5 4V5z"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>\`;
            }
        }

        function updateBackground() {
            const bgs = [
                "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1506477331477-33d5d8b3dc85?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1520454974749-611b7248ffdb?auto=format&fit=crop&w=1200&q=80"
            ];
            document.getElementById('main-card').style.backgroundImage = \`url('\${bgs[currentRound % bgs.length]}')\`;
        }

        function setUserLanguage(l) { 
            userLang = l; 
            document.querySelectorAll('#lang-en, #lang-ru').forEach(b => b.classList.toggle('active', b.id === \`lang-\${l}\`));
            updateUILanguage();
        }

        function startGame() {
            document.getElementById('start-overlay').classList.add('hidden');
            loadRound();
        }

        async function speak(text) {
            if (currentGoogleAudio) currentGoogleAudio.pause();
            return new Promise(resolve => {
                const audio = new Audio(\`https://translate.google.com/translate_tts?ie=UTF-8&q=\${encodeURIComponent(text)}&tl=vi&client=tw-ob\`);
                currentGoogleAudio = audio;
                audio.onended = resolve;
                audio.onerror = resolve;
                audio.play().catch(resolve);
            });
        }

        async function translateFragment(text) {
            try {
                const prompt = \`Translate this fragment/phrase to natural Vietnamese: "\${text}". Only return the translated string. No punctuation.\`;
                const res = await fetch(\`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=\${apiKey}\`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
                });
                const data = await res.json();
                return data.candidates[0].content.parts[0].text.trim().replace(/[".]/g, '');
            } catch { return text; }
        }

        async function translateFullSentenceToUserLang(text) {
            try {
                const target = userLang === 'ru' ? 'Russian' : 'English';
                const prompt = \`Translate this Vietnamese sentence to \${target}: "\${text}". Only return the translation.\`;
                const res = await fetch(\`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=\${apiKey}\`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
                });
                const data = await res.json();
                return data.candidates[0].content.parts[0].text.trim();
            } catch { return ""; }
        }

        function loadRound() {
            stopReviewRequested = true;
            isReviewRunning = false;
            updateBackground();
            const config = roundConfig[currentRound];
            const area = document.getElementById('bubble-area');
            const dragCont = document.getElementById('drag-container');
            const tools = document.getElementById('center-header-tools');
            area.innerHTML = '';
            tools.classList.add('hidden');
            dragCont.classList.add('hidden');
            
            // Update Round Number
            document.getElementById('round-number-text').innerText = \`\${currentRound + 1}/9\`;
            
            document.getElementById('progress-bar').style.width = \`\${((currentRound+1)/9)*100}%\`;
            document.getElementById('btn-prev-round').disabled = (currentRound === 0);
            document.getElementById('btn-next-round').disabled = (currentRound === 8);

            if (config.type === "review") { loadReviewRound(); return; }

            // Ella Question
            const ellaWrap = document.createElement('div');
            ellaWrap.className = 'bubble-wrapper';
            ellaWrap.innerHTML = \`
                <div class="speaker-btn ella-voice-btn" onclick="speak('\${config.q.replace(/'/g, "\\\\'")}')">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M11 5L6 9H2v6h4l5 4V5z"></path></svg>
                </div>
                <div class="bubble bubble-ella-quest">
                    <span class="main-text">\${config.q}</span>
                    <span class="sub-text">\${config.qSub[userLang]}</span>
                </div>
            \`;
            area.appendChild(ellaWrap);
            speak(config.q);

            // User Answer
            const userWrap = document.createElement('div');
            userWrap.className = 'bubble-wrapper justify-end';
            userWrap.id = 'user-bubble-wrapper';
            const saved = history[currentRound];
            if (config.type === 'drag') {
                if (saved) renderSavedAnswer(userWrap, saved.a, saved.aSub);
                else {
                    dragCont.classList.remove('hidden');
                    renderDragChoices(dragCont, config);
                    userWrap.innerHTML = \`<div class="bubble bubble-user-ans"><span class="main-text">\${translations[userLang].dragLabel} <div id="drop-zone" class="drop-zone" ondrop="drop(event)" ondragover="allowDrop(event)" ondragleave="leaveDrop(event)"></div></span></div>\`;
                }
            } else {
                if (saved) renderSavedAnswer(userWrap, saved.a, saved.aSub);
                else renderInputBox(userWrap, config);
            }
            area.appendChild(userWrap);
            if (document.getElementById('round-input')) document.getElementById('round-input').focus();
        }

        function renderSavedAnswer(wrap, text, sub) {
            wrap.innerHTML = \`
                <div class="bubble bubble-user-ans"><span class="main-text">\${text}</span><span class="sub-text">\${sub}</span></div>
                <div class="speaker-btn user-voice-btn" onclick="speak('\${text.replace(/'/g, "\\\\'")}')">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M11 5L6 9H2v6h4l5 4V5z"></path></svg>
                </div>
            \`;
            document.getElementById('center-header-tools').classList.remove('hidden');
        }

        function renderDragChoices(cont, config) {
            cont.innerHTML = '';
            config.choices.forEach((choice, idx) => {
                const wrapper = document.createElement('div');
                wrapper.innerHTML = \`<div class="drag-item" draggable="true" ondragstart="drag(event)" id="choice-\${idx}" data-vi="\${choice.vi}" data-sub="\${choice[userLang]}">\${choice.vi}</div><span class="text-[10px] text-gray-500 block text-center mt-1 font-bold">\${choice[userLang]}</span>\`;
                cont.appendChild(wrapper);
            });
        }

        function renderInputBox(wrap, config) {
            wrap.innerHTML = \`
                <div class="bubble bubble-user-ans" id="input-bubble">
                    <span class="main-text">\${config.prefix} 
                        <span class="input-group">
                            <input type="text" id="round-input" class="inline-input" placeholder="..." onkeypress="if(event.key==='Enter') submitTyping()">
                            <button onclick="submitTyping()" class="send-btn" id="submit-btn">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                            </button>
                        </span>
                        \${config.suffix}
                    </span>
                    <span class="sub-text" id="init-sub">\${config.prefixSub[userLang]} [...] \${config.suffixSub[userLang]}</span>
                    <span class="hint-text">\${translations[userLang].hintLabel} \${config.hint[userLang]}</span>
                </div>
                <div id="user-voice-container" class="hidden">
                    <div class="speaker-btn user-voice-btn" id="dynamic-user-speaker">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M11 5L6 9H2v6h4l5 4V5z"></path></svg>
                    </div>
                </div>
            \`;
        }

        function allowDrop(ev) { ev.preventDefault(); ev.target.style.borderColor = "#6366f1"; }
        function leaveDrop(ev) { ev.target.style.borderColor = "#cbd5e1"; }
        function drag(ev) { ev.dataTransfer.setData("text", ev.target.id); }

        async function drop(ev) {
            ev.preventDefault();
            const el = document.getElementById(ev.dataTransfer.getData("text"));
            const viText = el.getAttribute('data-vi');
            const subText = el.getAttribute('data-sub');
            const zone = document.getElementById('drop-zone');
            zone.innerHTML = \`<span class="text-indigo-600 font-black">\${viText}</span>\`;
            history[currentRound] = { q: roundConfig[currentRound].q, a: viText, aSub: subText, qSub: roundConfig[currentRound].qSub[userLang] };
            
            // Add a small delay to show the dropped text
            setTimeout(() => {
                const wrapper = document.getElementById('user-bubble-wrapper');
                renderSavedAnswer(wrapper, viText, subText);
                document.getElementById('drag-container').classList.add('hidden');
                speak(viText);
            }, 500);
        }

        async function submitTyping() {
            const inputEl = document.getElementById('round-input');
            const submitBtn = document.getElementById('submit-btn');
            const val = inputEl.value.trim();
            if (!val) return;
            
            inputEl.disabled = true;
            if(submitBtn) submitBtn.disabled = true;

            const config = roundConfig[currentRound];
            const translatedPart = await translateFragment(val);
            const fullVi = \`\${config.prefix} \${translatedPart} \${config.suffix}\`.trim();
            const fullSub = await translateFullSentenceToUserLang(fullVi);
            
            const bubble = document.getElementById('input-bubble');
            bubble.innerHTML = \`<span class="main-text">\${fullVi}</span><span class="sub-text">\${fullSub}</span>\`;
            
            const voiceCont = document.getElementById('user-voice-container');
            if(voiceCont) {
                voiceCont.classList.remove('hidden');
                document.getElementById('dynamic-user-speaker').onclick = () => speak(fullVi);
            }

            history[currentRound] = { q: config.q, a: fullVi, aSub: fullSub, qSub: config.qSub[userLang] };
            await speak(fullVi);
            document.getElementById('center-header-tools').classList.remove('hidden');
        }

        function loadReviewRound() {
            const area = document.getElementById('bubble-area');
            document.getElementById('center-header-tools').classList.remove('hidden');
            updateListenBtnUI();
            area.innerHTML = \`<div class="text-center py-4"><h3 class="text-xl font-black text-indigo-600 uppercase tracking-widest">\${translations[userLang].reviewTitle}</h3></div>\`;
            for (let i = 0; i < history.length; i++) {
                const item = history[i];
                if (!item) continue;
                const pairDiv = document.createElement('div');
                pairDiv.id = \`pair-\${i}\`; pairDiv.className = "flex flex-col gap-4 mb-8";
                pairDiv.innerHTML = \`
                    <div class="bubble-wrapper"><div class="speaker-btn ella-voice-btn" onclick="speak('\${item.q}')"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M11 5L6 9H2v6h4l5 4V5z"></path></svg></div><div class="bubble bubble-ella-quest"><span class="main-text">\${item.q}</span><span class="sub-text">\${item.qSub}</span></div></div>
                    <div class="bubble-wrapper justify-end"><div class="bubble bubble-user-ans"><span class="main-text">\${item.a}</span><span class="sub-text">\${item.aSub}</span></div><div class="speaker-btn user-voice-btn" onclick="speak('\${item.a}')"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M11 5L6 9H2v6h4l5 4V5z"></path></svg></div></div>
                \`;
                area.appendChild(pairDiv);
            }
            const finishWrap = document.createElement('div'); finishWrap.className = "flex justify-center p-8";
            finishWrap.innerHTML = \`<button onclick="showWin()" class="bg-indigo-600 text-white px-12 py-5 rounded-full font-black text-xl shadow-xl hover:bg-indigo-700 uppercase">\${translations[userLang].finishBtn}</button>\`;
            area.appendChild(finishWrap);
        }

        async function handleListenAllClick() {
            if (isReviewRunning) { stopReviewRequested = true; if (currentGoogleAudio) currentGoogleAudio.pause(); isReviewRunning = false; updateListenBtnUI(); }
            else startReviewSequence();
        }

        async function startReviewSequence() {
            isReviewRunning = true; stopReviewRequested = false; updateListenBtnUI();
            for (let i = 0; i < history.length; i++) {
                if (stopReviewRequested) break;
                const item = history[i]; const pair = document.getElementById(\`pair-\${i}\`); if (!item || !pair) continue;
                pair.scrollIntoView({ behavior: 'smooth', block: 'center' });
                pair.classList.add('highlight-ella'); await speak(item.q); await new Promise(r => setTimeout(r, 400)); pair.classList.remove('highlight-ella');
                if (stopReviewRequested) break;
                pair.classList.add('highlight-user'); await speak(item.a); await new Promise(r => setTimeout(r, 400)); pair.classList.remove('highlight-user');
                await new Promise(r => setTimeout(r, 600));
            }
            isReviewRunning = false; updateListenBtnUI();
        }

        function prevRound() { if (currentRound > 0) { currentRound--; loadRound(); } }
        function nextRound() { if (currentRound < 8) { currentRound++; loadRound(); } }
        function goForward() { if (currentRound < 8) { currentRound++; loadRound(); } else showWin(); }
        function showWin() { document.getElementById('win-overlay').classList.remove('hidden'); confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 } }); }
    </script>
</body>
</html>
`;

export const SpeakChallengeBeachGame: React.FC = () => {
    const [iframeSrc, setIframeSrc] = useState<string | undefined>(undefined);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const gameWrapperRef = useRef<HTMLDivElement>(null);

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
    
    useEffect(() => {
        const finalHtml = gameHTML.replace(
            'const apiKey = "";',
            `const apiKey = "${process.env.API_KEY || ''}";`
        );
        const blob = new Blob([finalHtml], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        setIframeSrc(url);

        return () => {
            if (url) {
                URL.revokeObjectURL(url);
            }
        };
    }, []);

    return (
        <div ref={gameWrapperRef} className="relative w-full h-full bg-slate-900">
            {iframeSrc && (
                <iframe
                    src={iframeSrc}
                    className="w-full h-full"
                    style={{ border: 'none' }}
                    allow="microphone; fullscreen"
                    title="Speak Challenge: The Beach"
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

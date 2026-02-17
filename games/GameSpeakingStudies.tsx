
import React, { useState, useEffect, useRef } from 'react';
import { Maximize, Minimize } from 'lucide-react';

const gameHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SPEAK VIET : LEARNING</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@400;600;700&display=swap');

        body {
            font-family: 'Quicksand', sans-serif;
            background: #f8fafc;
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
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            position: relative;
            overflow: hidden;
            background-color: #ffffff;
            transition: background-image 0.8s ease-in-out;
        }

        /* START OVERLAY */
        .overlay {
            position: absolute;
            inset: 0;
            background: rgba(255, 255, 255, 0.85);
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
            padding: 32px;
            border-radius: 2.5rem;
            box-shadow: 0 20px 60px rgba(0,0,0,0.1);
            border: 1px solid white;
            display: flex;
            flex-direction: column;
            align-items: center;
            max-width: 450px; 
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
            width: 180px;
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

        .highlight-ella .bubble-ella-quest { background: #fdf2f8 !important; border-color: #be185d !important; transform: scale(1.02); }
        .highlight-user .bubble-user-ans { background: #f0f9ff !important; border-color: #0369a1 !important; transform: scale(1.02); }
    </style>
</head>
<body onload="initGame()">

    <div class="game-card" id="main-card">
        <!-- Start Screen -->
        <div id="start-overlay" class="overlay">
            <div class="start-content-box">
                <div class="mb-4 bg-indigo-100 p-4 rounded-full">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" stroke-width="2.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                </div>
                <h1 class="text-3xl font-black text-indigo-900 mb-1 tracking-tight">LEARNING</h1>
                <p id="ui-subtitle" class="text-indigo-600 font-bold text-sm mb-6 italic">Master learning conversations in Vietnamese 🎓</p>
                
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
            <div class="flex items-center gap-3">
                <div class="flex flex-col">
                    <h1 id="ui-header-title" class="text-[10px] font-black text-indigo-500 uppercase tracking-widest">LEARNING TOPIC</h1>
                    <div class="flex items-center gap-2">
                        <button id="btn-prev-round" onclick="prevRound()" class="nav-round-btn">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                        </button>
                        <h2 id="round-title" class="text-sm font-black text-gray-800 w-24 text-center">Round 1/9</h2>
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
                <div class="text-7xl mb-6">🎓</div>
                <h2 id="ui-win-title" class="text-4xl font-black mb-4 text-indigo-600 uppercase">EXCELLENT!</h2>
                <p id="ui-win-msg" class="text-gray-500 mb-8 font-bold text-lg leading-relaxed">You have mastered learning conversation.</p>
                <button id="ui-replay-btn" onclick="location.reload()" class="px-12 py-5 bg-indigo-600 text-white rounded-full font-black text-xl shadow-xl hover:bg-indigo-700">PLAY AGAIN</button>
            </div>
        </div>
    </div>

    <script>
        let userLang = 'en';
        let currentRound = 0;
        let history = [];
        let currentGoogleAudio = null;
        let isReviewRunning = false;
        let stopReviewRequested = false;

        const translations = {
            en: {
                subtitle: "Master learning conversations in Vietnamese 🎓",
                langLabel: "LANGUAGE",
                howToPlayTitle: "HOW TO PLAY:",
                howToPlayList: [
                    "1. Type to answer questions about learning.",
                    "2. Use the hints to find the correct Vietnamese phrases.",
                    "3. Review & Listen to the full session at the end."
                ],
                startBtn: "START NOW",
                headerTitle: "LEARNING TOPIC",
                continueBtn: "CONTINUE",
                listenAllLabel: "LISTEN AGAIN",
                pauseLabel: "PAUSE",
                reviewTitle: "REVIEW LEARNING",
                finishBtn: "FINISH",
                winTitle: "EXCELLENT!",
                winMsg: "You have mastered learning conversation.",
                replayBtn: "PLAY AGAIN",
                placeholder: "Type here...",
                hintLabel: "Hint:",
                dragLabel: "Answer:"
            },
            ru: {
                subtitle: "Освойте разговоры об учебе на вьетнамском 🎓",
                langLabel: "ЯЗЫК",
                howToPlayTitle: "КАК ИГРАТЬ:",
                howToPlayList: [
                    "1. Вводите ответы на вопросы об обучении.",
                    "2. Используйте подсказки для поиска вьетнамских фраз.",
                    "3. Повторите и прослушайте всё в конце."
                ],
                startBtn: "ИГРАТЬ",
                headerTitle: "ТЕМА: ОБУЧЕНИЕ",
                continueBtn: "ДАЛЕЕ",
                listenAllLabel: "СЛУШАТЬ СНОВА",
                pauseLabel: "ПАУЗА",
                reviewTitle: "ОБЗОР ОБУЧЕНИЯ",
                finishBtn: "ЗАВЕРШИТЬ",
                winTitle: "ОТЛИЧНО!",
                winMsg: "Вы освоили разговор об учебе.",
                replayBtn: "ИГРАТЬ СНОВА",
                placeholder: "Пишите здесь...",
                hintLabel: "Подсказка:",
                dragLabel: "Ответ:"
            }
        };

        const roundConfig = [
            { 
                q: "Bạn muốn cải thiện kỹ năng gì?", 
                qSub: { en: "What skill do you want to improve?", ru: "Какой навык вы хотите улучшить?" }, 
                type: "typing",
                prefix: "Mình muốn cải thiện", 
                prefixSub: { en: "I want to improve", ru: "Я хочу улучшить" },
                suffix: "", 
                suffixSub: { en: "", ru: "" },
                hint: { en: "speaking skills / writing skills", ru: "разговорные навыки / навыки письма" } 
            },
            { 
                q: "Bạn thường học một kỹ năng mới như thế nào?", 
                qSub: { en: "How do you usually learn a new skill?", ru: "Как вы обычно изучаете новый навык?" }, 
                type: "typing",
                prefix: "Tôi học qua", 
                prefixSub: { en: "I learn through", ru: "Я учусь через" },
                suffix: "", 
                suffixSub: { en: "", ru: "" },
                hint: { en: "online courses and books", ru: "онлайн-курсы и книги" } 
            },
            { 
                q: "Bạn nghĩ học lý thuyết hay thực hành tốt hơn?", 
                qSub: { en: "Do you think theory or practice is better?", ru: "Как вы думаете, теория или практика лучше?" }, 
                type: "typing",
                prefix: "Tôi nghĩ", 
                prefixSub: { en: "I think", ru: "Я думаю" },
                suffix: "tốt hơn.", 
                suffixSub: { en: "is better.", ru: "лучше." },
                hint: { en: "practice", ru: "практика" } 
            },
            { 
                q: "Bạn có học trên YouTube không? Bạn học gì?", 
                qSub: { en: "Do you learn on YouTube? What do you learn?", ru: "Вы учитесь на YouTube? Чему вы учитесь?" }, 
                type: "typing",
                prefix: "Có. Tôi học", 
                prefixSub: { en: "Yes. I learn", ru: "Да. Я учу" },
                suffix: "", 
                suffixSub: { en: "", ru: "" },
                hint: { en: "programming and design", ru: "программирование и дизайн" } 
            },
            { 
                q: "Bạn thường học một mình hay học theo nhóm?", 
                qSub: { en: "Do you usually study alone or in a group?", ru: "Вы обычно учитесь один или в группе?" }, 
                type: "typing",
                prefix: "Tôi thường học", 
                prefixSub: { en: "I usually study", ru: "Я обычно учусь" },
                suffix: "", 
                suffixSub: { en: "", ru: "" },
                hint: { en: "alone to focus", ru: "один, чтобы сосредоточиться" } 
            },
            { 
                q: "Bạn thường dành bao lâu để học một kỹ năng mới?", 
                qSub: { en: "How long do you usually spend learning a new skill?", ru: "Сколько времени вы обычно тратите на изучение навыка?" }, 
                type: "typing",
                prefix: "Khoảng", 
                prefixSub: { en: "About", ru: "Около" },
                suffix: "mỗi ngày.", 
                suffixSub: { en: "every day.", ru: "каждый день." },
                hint: { en: "one hour", ru: "один час" } 
            },
            { 
                q: "Ai là thầy giáo tuyệt vời nhất của bạn?", 
                qSub: { en: "Who is your greatest teacher?", ru: "Кто ваш величайший учитель?" }, 
                type: "typing",
                prefix: "Đó là", 
                prefixSub: { en: "That is", ru: "Это" },
                suffix: "", 
                suffixSub: { en: "", ru: "" },
                hint: { en: "my experience", ru: "мой опыт" } 
            },
            { 
                q: "Bạn có dùng các công cụ AI để học không?", 
                qSub: { en: "Do you use AI tools to learn?", ru: "Вы используете инструменты ИИ для обучения?" }, 
                type: "typing",
                prefix: "Có, tôi dùng AI để học", 
                prefixSub: { en: "Yes, I use AI to learn", ru: "Да, я использую ИИ для изучения" },
                suffix: "", 
                suffixSub: { en: "", ru: "" },
                hint: { en: "languages and coding", ru: "языки и кодинг" } 
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
                "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80"
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
                try {
                    const audio = new Audio(\`https://translate.google.com/translate_tts?ie=UTF-8&q=\${encodeURIComponent(text)}&tl=vi&client=tw-ob\`);
                    currentGoogleAudio = audio;
                    audio.onended = resolve;
                    audio.onerror = resolve;
                    audio.play().catch(resolve);
                } catch(e) { resolve(); }
            });
        }

        const translateFree = async (text, sl, tl) => {
          if (!text) return "";
          try {
            const res = await fetch(\`https://translate.googleapis.com/translate_a/single?client=gtx&sl=\${sl}&tl=\${tl}&dt=t&q=\${encodeURIComponent(text)}\`);
            const data = await res.json();
            return data[0][0][0];
          } catch (e) { return text; }
        };

        function loadRound() {
            stopReviewRequested = true;
            isReviewRunning = false;
            updateListenBtnUI();
            updateBackground();
            const config = roundConfig[currentRound];
            const area = document.getElementById('bubble-area');
            const tools = document.getElementById('center-header-tools');
            area.innerHTML = '';
            tools.classList.add('hidden');
            
            document.getElementById('round-title').innerText = \`Round \${currentRound + 1}/9\`;
            document.getElementById('progress-bar').style.width = \`\${((currentRound+1)/9)*100}%\`;
            document.getElementById('btn-prev-round').disabled = (currentRound === 0);
            document.getElementById('btn-next-round').disabled = (currentRound === 8);

            if (config.type === "review") { loadReviewRound(); return; }

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

            const userWrap = document.createElement('div');
            userWrap.className = 'bubble-wrapper justify-end';
            userWrap.id = 'user-bubble-wrapper';
            const saved = history[currentRound];
            
            if (saved) {
                renderSavedAnswer(userWrap, saved.a, saved.aSub);
            } else {
                renderInputBox(userWrap, config);
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
            \`;
        }

        async function submitTyping() {
            const val = document.getElementById('round-input').value.trim();
            if (!val) return;
            document.getElementById('submit-btn').disabled = true;
            const config = roundConfig[currentRound];
            
            const viInput = await translateFree(val, userLang, 'vi');
            const fullVi = \`\${config.prefix} \${viInput} \${config.suffix}\`.trim();
            const fullSub = await translateFree(fullVi, 'vi', userLang);

            history[currentRound] = { q: config.q, a: fullVi, aSub: fullSub, qSub: config.qSub[userLang] };
            renderSavedAnswer(document.getElementById('user-bubble-wrapper'), fullVi, fullSub);
            speak(fullVi);
        }

        function goForward() {
            if (currentRound < roundConfig.length - 1) { currentRound++; loadRound(); }
            else if (currentRound === roundConfig.length - 1) { finishGame(); }
        }

        function prevRound() { if (currentRound > 0) { currentRound--; loadRound(); } }
        function nextRound() { if (currentRound < roundConfig.length - 1) { currentRound++; loadRound(); } }

        function loadReviewRound() {
            const area = document.getElementById('bubble-area');
            const tools = document.getElementById('center-header-tools');
            document.getElementById('round-title').innerText = translations[userLang].reviewTitle;
            tools.classList.remove('hidden');
            document.getElementById('continue-btn').innerHTML = \`\${translations[userLang].finishBtn} ✅\`;
            
            history.forEach((item, idx) => {
                const ellaWrap = document.createElement('div');
                ellaWrap.className = 'bubble-wrapper';
                ellaWrap.id = \`rev-ella-\${idx}\`;
                ellaWrap.innerHTML = \`
                    <div class="speaker-btn ella-voice-btn" onclick="speak('\${item.q.replace(/'/g, "\\\\'")}')"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M11 5L6 9H2v6h4l5 4V5z"></path></svg></div>
                    <div class="bubble bubble-ella-quest"><span class="main-text">\${item.q}</span><span class="sub-text">\${item.qSub}</span></div>
                \`;
                area.appendChild(ellaWrap);

                const userWrap = document.createElement('div');
                userWrap.className = 'bubble-wrapper justify-end';
                userWrap.id = \`rev-user-\${idx}\`;
                userWrap.innerHTML = \`
                    <div class="bubble bubble-user-ans"><span class="main-text">\${item.a}</span><span class="sub-text">\${item.aSub}</span></div>
                    <div class="speaker-btn user-voice-btn" onclick="speak('\${item.a.replace(/'/g, "\\\\'")}')"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M11 5L6 9H2v6h4l5 4V5z"></path></svg></div>
                \`;
                area.appendChild(userWrap);
            });
            area.scrollTop = 0;
        }

        async function handleListenAllClick() {
            if (roundConfig[currentRound].type === "review") {
                if (isReviewRunning) {
                    stopReviewRequested = true;
                } else {
                    runReviewAudio();
                }
            } else {
                const item = history[currentRound];
                if (item) {
                    await speak(item.q);
                    await new Promise(r => setTimeout(r, 600));
                    await speak(item.a);
                }
            }
        }

        async function runReviewAudio() {
            isReviewRunning = true;
            stopReviewRequested = false;
            updateListenBtnUI();

            for (let i = 0; i < history.length; i++) {
                if (stopReviewRequested) break;
                highlightReview(i, 'ella');
                await speak(history[i].q);
                if (stopReviewRequested) break;
                await new Promise(r => setTimeout(r, 400));
                
                highlightReview(i, 'user');
                await speak(history[i].a);
                if (stopReviewRequested) break;
                await new Promise(r => setTimeout(r, 800));
            }

            clearHighlights();
            isReviewRunning = false;
            updateListenBtnUI();
        }

        function highlightReview(idx, side) {
            clearHighlights();
            const el = document.getElementById(\`rev-\${side}-\${idx}\`);
            if (el) {
                el.classList.add(\`highlight-\${side}\`);
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }

        function clearHighlights() {
            document.querySelectorAll('.bubble-wrapper').forEach(el => el.classList.remove('highlight-ella', 'highlight-user'));
        }

        function finishGame() {
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
            document.getElementById('win-overlay').classList.remove('hidden');
        }
    </script>
</body>
</html>
`;

export const GameSpeakingStudies: React.FC = () => {
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
                    title="Speaking Challenge - Discussing Your Studies"
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

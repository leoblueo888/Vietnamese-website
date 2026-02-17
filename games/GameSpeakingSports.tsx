
import React, { useState, useEffect, useRef } from 'react';
import { Maximize, Minimize } from 'lucide-react';

const gameHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SPEAK VIET : SPORTS AND HEALTH</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@400;600;700&display=swap');

        body {
            font-family: 'Quicksand', sans-serif;
            background: #f0fdf4;
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
            background-color: #f0fdf4;
            transition: background-image 0.8s ease-in-out;
        }

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

        @media (max-width: 640px) {
            #header-nav-container {
                margin-left: 0 !important;
                justify-content: flex-start !important;
            }
            #round-title-text {
                display: none; /* Hide 'Round' word */
            }
            #round-title {
                width: auto !important;
                padding: 0 4px;
            }
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
        .nav-round-btn:hover:not(:disabled) { background: #10b981; color: white; }
        .nav-round-btn:disabled { opacity: 0.3; cursor: not-allowed; }

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
            background: #10b981;
            color: white;
            width: 44px;
            height: 44px;
            border-radius: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
            transition: 0.2s;
            flex-shrink: 0;
        }
        .speaker-btn:hover { transform: scale(1.05); }
        
        .ella-voice-btn { background: #059669; }
        .user-voice-btn { background: #0369a1; }

        .bubble {
            padding: 1.2rem 1.5rem;
            border-radius: 1.5rem;
            max-width: 85%;
            box-shadow: 0 10px 25px rgba(0,0,0,0.08);
            background: rgba(255, 255, 255, 0.95);
            border: 1px solid rgba(255,255,255,0.5);
            position: relative;
        }

        .bubble-ella-quest { border-left: 6px solid #059669; }
        .bubble-user-ans { border-right: 6px solid #0369a1; }

        .main-text { font-size: 1.25rem; font-weight: 800; margin-bottom: 6px; display: block; color: #1e293b; }
        .sub-text { font-size: 0.95rem; font-weight: 600; color: #64748b; display: block; border-top: 1px solid #f1f5f9; padding-top: 6px; margin-top: 4px; font-style: italic; }
        
        .hint-text { font-size: 0.8rem; font-weight: 700; color: #94a3b8; display: block; margin-top: 8px; text-transform: uppercase; }

        .drop-zone {
            display: inline-block;
            min-width: 180px;
            height: 40px;
            border-bottom: 3px dashed #cbd5e1;
            margin: 0 8px;
            vertical-align: middle;
            background: rgba(241, 245, 249, 0.5);
            border-radius: 8px;
        }
        
        .drag-item {
            background: white;
            border: 2px solid #10b981;
            color: #065f46;
            padding: 12px 20px;
            border-radius: 14px;
            cursor: grab;
            font-weight: 700;
            box-shadow: 0 5px 15px rgba(16, 185, 129, 0.1);
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

        .toggle-btn { flex: 1; padding: 10px; border-radius: 12px; font-weight: 700; background: #f1f5f9; color: #64748b; transition: 0.3s; }
        .toggle-btn.active { background: #10b981; color: white; }
        
        .hidden { display: none !important; }

        .highlight-ella .bubble-ella-quest { background: #f0fdf4 !important; border-color: #059669 !important; transform: scale(1.02); }
        .highlight-user .bubble-user-ans { background: #f0f9ff !important; border-color: #0369a1 !important; transform: scale(1.02); }
    </style>
</head>
<body onload="initGame()">

    <div class="game-card" id="main-card">
        <!-- Start Screen -->
        <div id="start-overlay" class="overlay">
            <div class="start-content-box">
                <div class="mb-3 bg-green-100 p-3 rounded-full">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2.5">
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M12 8v8"></path>
                        <path d="M8 12h8"></path>
                    </svg>
                </div>
                <h1 id="ui-main-title" class="text-2xl font-black text-green-900 mb-1 tracking-tight uppercase">Sports and Health</h1>
                <p id="ui-subtitle" class="text-green-600 font-bold text-xs mb-6 italic">Master sports talks in Vietnamese ⚽</p>
                
                <div class="w-full mb-6">
                    <p id="ui-lang-label" class="text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest text-left">NATIVE LANGUAGE</p>
                    <div class="flex gap-2">
                        <button id="lang-en" onclick="setUserLanguage('en')" class="toggle-btn active">🇬🇧 English</button>
                        <button id="lang-ru" onclick="setUserLanguage('ru')" class="toggle-btn">🇷🇺 Russian</button>
                    </div>
                </div>

                <div class="bg-green-50 p-4 rounded-xl mb-6 text-left w-full border border-green-100">
                    <p id="ui-howtoplay-title" class="text-[10px] font-black text-green-800 mb-2 uppercase tracking-wider">HOW TO PLAY:</p>
                    <ul id="ui-howtoplay-list" class="text-[12px] text-green-700 space-y-1.5 font-bold"></ul>
                </div>

                <button id="ui-start-btn" onclick="startGame()" class="w-full py-4 bg-green-600 text-white rounded-full font-black text-lg shadow-lg hover:bg-green-700 active:scale-95 transition-all">START NOW</button>
            </div>
        </div>

        <!-- Header -->
        <div id="game-header">
            <div class="flex items-center gap-3" id="header-nav-container">
                <div class="flex flex-col">
                    <h1 id="ui-header-title" class="text-[10px] font-black text-green-500 uppercase tracking-widest">SPORTS CONVERSATION</h1>
                    <div class="flex items-center gap-2">
                        <button id="btn-prev-round" onclick="prevRound()" class="nav-round-btn">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                        </button>
                        <h2 id="round-title" class="text-sm font-black text-gray-800 w-24 text-center">
                            <span id="round-title-text">Round</span> <span id="round-number">1/9</span>
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
                    <span id="listen-text">LISTEN AGAIN</span>
                </button>
                <button id="continue-btn" onclick="goForward()" class="bg-emerald-500 text-white px-6 py-2.5 rounded-full text-xs font-black shadow-lg hover:bg-emerald-600 transition-all flex items-center gap-2 uppercase tracking-widest">
                    CONTINUE 
                </button>
            </div>

            <div class="flex items-center gap-2">
                <div class="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div id="progress-bar" class="h-full bg-green-500 transition-all duration-700" style="width: 11%"></div>
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
                <div class="text-7xl mb-6">🥇</div>
                <h2 id="ui-win-title" class="text-4xl font-black mb-4 text-green-600 uppercase">EXCELLENT!</h2>
                <p id="ui-win-msg" class="text-gray-500 mb-8 font-bold text-lg leading-relaxed">You have mastered sports conversation.</p>
                <button id="ui-replay-btn" onclick="location.reload()" class="px-12 py-5 bg-green-600 text-white rounded-full font-black text-xl shadow-xl hover:bg-green-700">PLAY AGAIN</button>
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
                mainTitle: "Sports and Health",
                subtitle: "Master sports talks in Vietnamese ⚽",
                langLabel: "NATIVE LANGUAGE",
                howToPlayTitle: "HOW TO PLAY:",
                howToPlayList: [
                    "1. Translate the questions into Vietnamese.",
                    "2. Drag correct answers or type details.",
                    "3. Review & Practice speaking at the end."
                ],
                startBtn: "START NOW",
                headerTitle: "SPORTS AND HEALTH",
                roundLabel: "Round",
                continueBtn: "CONTINUE",
                listenAllLabel: "LISTEN AGAIN",
                pauseLabel: "PAUSE",
                finishBtn: "FINISH",
                winTitle: "EXCELLENT!",
                winMsg: "You have mastered sports conversation.",
                replayBtn: "PLAY AGAIN",
                hintLabel: "Hint:",
                dragLabel: "Answer:"
            },
            ru: {
                mainTitle: "Спорт и здоровье",
                subtitle: "Говорите о спорте на вьетнамском ⚽",
                langLabel: "РОДНОЙ ЯЗЫК",
                howToPlayTitle: "КАК ИГРАТЬ:",
                howToPlayList: [
                    "1. Переводите вопросы на вьетнамский язык.",
                    "2. Выбирайте правильные ответы или вводите детали.",
                    "3. Повторяйте и практикуйте произношение в конце."
                ],
                startBtn: "НАЧАТЬ",
                headerTitle: "СПОРТ И ЗДОРОВЬЕ",
                roundLabel: "Раунд",
                continueBtn: "ДАЛЕЕ",
                listenAllLabel: "СЛУШАТЬ СНОВА",
                pauseLabel: "ПАУЗА",
                finishBtn: "ЗАВЕРШИТЬ",
                winTitle: "ОТЛИЧНО!",
                winMsg: "Вы освоили разговор о спорте.",
                replayBtn: "ИГРАТЬ СНОВА",
                hintLabel: "Подсказка:",
                dragLabel: "Ответ:"
            }
        };

        const roundConfig = [
            { 
                q: "Bạn có thích chơi thể thao không?", 
                qSub: { en: "Do you like playing sports?", ru: "Вы любите заниматься спортом?" }, 
                type: "drag",
                choices: [
                    { vi: "Có, mình rất thích.", en: "Yes, I like it a lot.", ru: "Да, мне очень нравится." },
                    { vi: "Không, mình không thích lắm.", en: "No, I don't like it much.", ru: "Нет, мне не очень нравится." }
                ]
            },
            { 
                q: "Môn thể thao yêu thích của bạn là gì?", 
                qSub: { en: "What is your favorite sport?", ru: "Какой ваш любимый вид спорта?" }, 
                prefix: "Môn yêu thích của mình là", 
                prefixSub: { en: "My favorite is", ru: "Мой любимый вид -" },
                suffix: "", 
                hint: { en: "Football / Badminton / Swimming", ru: "Футбол / Бадминтон / Плавание" } 
            },
            { 
                q: "Bạn chơi thể thao thường xuyên như thế nào?", 
                qSub: { en: "How often do you play sports?", ru: "Как часто вы занимаетесь спортом?" }, 
                prefix: "Mình chơi", 
                prefixSub: { en: "I play", ru: "Я занимаюсь" },
                suffix: "", 
                hint: { en: "every day / 3 times a week", ru: "каждый день / 3 раза в неделю" } 
            },
            { 
                q: "Bạn thường chơi thể thao ở đâu?", 
                qSub: { en: "Where do you usually play sports?", ru: "Где вы обычно занимаетесь спортом?" }, 
                prefix: "Mình thường chơi ở", 
                prefixSub: { en: "I usually play at", ru: "Я обычно занимаюсь в" },
                suffix: "", 
                hint: { en: "the park / gym / stadium", ru: "парке / спортзале / стадионе" } 
            },
            { 
                q: "Bạn thường chơi thể thao với ai?", 
                qSub: { en: "Who do you usually play sports with?", ru: "С кем вы обычно занимаетесь спортом?" }, 
                prefix: "Mình hay chơi với", 
                prefixSub: { en: "I often play with", ru: "Я часто занимаюсь с" },
                suffix: "", 
                hint: { en: "friends / colleagues / family", ru: "друзьями / коллегами / семьей" } 
            },
            { 
                q: "Bạn cảm thấy thế nào sau khi chơi thể thao?", 
                qSub: { en: "How do you feel after playing sports?", ru: "Как вы себя чувствуете после занятий спортом?" }, 
                prefix: "Mình cảm thấy", 
                prefixSub: { en: "I feel", ru: "Я чувствую себя" },
                suffix: "", 
                hint: { en: "very tired but happy / healthy", ru: "очень усталым, но счастливым / здоровым" } 
            },
            { 
                q: "Bạn có hay xem thể thao trên TV hay YouTube không?", 
                qSub: { en: "Do you often watch sports on TV or YouTube?", ru: "Вы часто смотрите спорт по телевизору или в YouTube?" }, 
                type: "drag",
                choices: [
                    { vi: "Mình xem bóng đá mỗi tối.", en: "I watch football every night.", ru: "Я смотрю футбол каждый вечер." },
                    { vi: "Không, mình chỉ thích chơi thôi.", en: "No, I only like playing.", ru: "Нет, мне нравится только играть." }
                ]
            },
            { 
                q: "Hãy liệt kê những lợi ích của thể thao.", 
                qSub: { en: "List the benefits of sports.", ru: "Перечислите пользу спорта." }, 
                prefix: "Thể thao giúp", 
                prefixSub: { en: "Sports help", ru: "Спорт помогает" },
                suffix: "", 
                hint: { en: "lose weight and stay healthy", ru: "похудеть и быть здоровым" } 
            },
            { type: "review" }
        ];

        function initGame() {
            updateUILanguage();
            updateBackground();
        }

        function updateUILanguage() {
            const t = translations[userLang];
            // Start Screen items
            document.getElementById('ui-main-title').innerText = t.mainTitle;
            document.getElementById('ui-subtitle').innerText = t.subtitle;
            document.getElementById('ui-lang-label').innerText = t.langLabel;
            document.getElementById('ui-howtoplay-title').innerText = t.howToPlayTitle;
            document.getElementById('ui-start-btn').innerText = t.startBtn;
            
            // Header items
            document.getElementById('ui-header-title').innerText = t.headerTitle;
            document.getElementById('round-title-text').innerText = (window.innerWidth <= 640) ? 'R' : t.roundLabel;
            document.getElementById('round-number').innerText = \`\${currentRound + 1}/\${roundConfig.length}\`;
            
            // Win Screen items
            document.getElementById('ui-win-title').innerText = t.winTitle;
            document.getElementById('ui-win-msg').innerText = t.winMsg;
            document.getElementById('ui-replay-btn').innerText = t.replayBtn;
            
            // Buttons
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
                "https://images.unsplash.com/photo-1461896756913-c8a004bd3f88?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80"
            ];
            document.getElementById('main-card').style.backgroundImage = \`linear-gradient(rgba(255,255,255,0.7), rgba(255,255,255,0.7)), url('\${bgs[currentRound % bgs.length]}')\`;
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
            stopReview();
            updateBackground();
            const config = roundConfig[currentRound];
            const area = document.getElementById('bubble-area');
            const dragCont = document.getElementById('drag-container');
            const tools = document.getElementById('center-header-tools');
            area.innerHTML = '';
            tools.classList.add('hidden');
            dragCont.classList.add('hidden');
            
            // Update labels
            const t = translations[userLang];
            document.getElementById('round-title-text').innerText = (window.innerWidth <= 640) ? 'R' : t.roundLabel;
            document.getElementById('round-number').innerText = \`\${currentRound + 1}/\${roundConfig.length}\`;
            
            document.getElementById('progress-bar').style.width = \`\${((currentRound+1)/roundConfig.length)*100}%\`;
            document.getElementById('btn-prev-round').disabled = (currentRound === 0);
            document.getElementById('btn-next-round').disabled = (currentRound === roundConfig.length - 1);

            if (config.type === "review") { loadReviewRound(); return; }

            // Question
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

            // Answer
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
                    </span>
                    <span class="sub-text" id="init-sub">\${config.prefixSub[userLang]} [...]</span>
                    <span class="hint-text font-black text-blue-500 mt-2 block">\${translations[userLang].hintLabel} \${config.hint[userLang]}</span>
                </div>
            \`;
        }

        async function submitTyping() {
            const input = document.getElementById('round-input');
            const val = input.value.trim();
            if (!val) return;
            document.getElementById('submit-btn').disabled = true;
            
            const viFragment = await translateFree(val, userLang, 'vi');
            const config = roundConfig[currentRound];
            const fullAns = \`\${config.prefix} \${viFragment}\`.trim();
            const fullSub = await translateFree(fullAns, 'vi', userLang);
            
            history[currentRound] = { q: config.q, a: fullAns, aSub: fullSub, qSub: config.qSub[userLang] };
            renderSavedAnswer(document.getElementById('user-bubble-wrapper'), fullAns, fullSub);
            speak(fullAns);
        }

        function allowDrop(ev) { ev.preventDefault(); ev.target.style.borderColor = "#10b981"; }
        function leaveDrop(ev) { ev.target.style.borderColor = "#cbd5e1"; }
        function drag(ev) { ev.dataTransfer.setData("text", ev.target.id); }

        async function drop(ev) {
            ev.preventDefault();
            const el = document.getElementById(ev.dataTransfer.getData("text"));
            const viText = el.getAttribute('data-vi');
            const subText = el.getAttribute('data-sub');
            const zone = document.getElementById('drop-zone');
            zone.innerHTML = \`<span class="text-green-600 font-black">\${viText}</span>\`;
            history[currentRound] = { q: roundConfig[currentRound].q, a: viText, aSub: subText, qSub: roundConfig[currentRound].qSub[userLang] };
            
            setTimeout(() => {
                renderSavedAnswer(document.getElementById('user-bubble-wrapper'), viText, subText);
                document.getElementById('drag-container').classList.add('hidden');
                speak(viText);
            }, 600);
        }

        function goForward() {
            if (currentRound < roundConfig.length - 1) {
                currentRound++;
                loadRound();
            } else {
                showWin();
            }
        }

        function prevRound() { if (currentRound > 0) { currentRound--; loadRound(); } }
        function nextRound() { if (currentRound < roundConfig.length - 1 && history[currentRound]) { currentRound++; loadRound(); } }

        function loadReviewRound() {
            const area = document.getElementById('bubble-area');
            const tools = document.getElementById('center-header-tools');
            area.innerHTML = \`<h2 class="text-2xl font-black text-green-700 text-center mb-4">\${translations[userLang].reviewTitle}</h2>\`;
            
            history.forEach((item, idx) => {
                if (!item) return;
                const ellaWrap = document.createElement('div');
                ellaWrap.className = 'bubble-wrapper';
                ellaWrap.id = \`review-ella-\${idx}\`;
                ellaWrap.innerHTML = \`
                    <div class="speaker-btn ella-voice-btn" onclick="speak('\${item.q.replace(/'/g, "\\\\'")}')">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M11 5L6 9H2v6h4l5 4V5z"></path></svg>
                    </div>
                    <div class="bubble bubble-ella-quest">
                        <span class="main-text">\${item.q}</span>
                        <span class="sub-text">\${item.qSub}</span>
                    </div>
                \`;
                area.appendChild(ellaWrap);

                const userWrap = document.createElement('div');
                userWrap.className = 'bubble-wrapper justify-end';
                userWrap.id = \`review-user-\${idx}\`;
                userWrap.innerHTML = \`
                    <div class="bubble bubble-user-ans">
                        <span class="main-text">\${item.a}</span>
                        <span class="sub-text">\${item.aSub}</span>
                    </div>
                    <div class="speaker-btn user-voice-btn" onclick="speak('\${item.a.replace(/'/g, "\\\\'")}')">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M11 5L6 9H2v6h4l5 4V5z"></path></svg>
                    </div>
                \`;
                area.appendChild(userWrap);
            });

            document.getElementById('center-header-tools').classList.remove('hidden');
            document.getElementById('continue-btn').innerHTML = \`\${translations[userLang].finishBtn} ✓\`;
        }

        async function handleListenAllClick() {
            if (roundConfig[currentRound].type === "review") {
                if (isReviewRunning) {
                    stopReview();
                } else {
                    startFullReview();
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

        async function startFullReview() {
            isReviewRunning = true;
            stopReviewRequested = false;
            updateListenBtnUI();
            for (let i = 0; i < history.length; i++) {
                if (stopReviewRequested) break;
                if (!history[i]) continue;
                const eEl = document.getElementById(\`review-ella-\${i}\`);
                eEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                eEl.classList.add('highlight-ella');
                await speak(history[i].q);
                await new Promise(r => setTimeout(r, 600));
                eEl.classList.remove('highlight-ella');
                if (stopReviewRequested) break;
                const uEl = document.getElementById(\`review-user-\${i}\`);
                uEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                uEl.classList.add('highlight-user');
                await speak(history[i].a);
                await new Promise(r => setTimeout(r, 1000));
                uEl.classList.remove('highlight-user');
            }
            isReviewRunning = false;
            updateListenBtnUI();
        }

        function stopReview() {
            stopReviewRequested = true;
            isReviewRunning = false;
            if (currentGoogleAudio) currentGoogleAudio.pause();
            updateListenBtnUI();
        }

        function showWin() {
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#10b981', '#34d399', '#059669'] });
            document.getElementById('win-overlay').classList.remove('hidden');
        }

        // Handle window resize to update Round title R/Round
        window.addEventListener('resize', () => {
            const t = translations[userLang];
            document.getElementById('round-title-text').innerText = (window.innerWidth <= 640) ? 'R' : t.roundLabel;
        });
    </script>
</body>
</html>
`;

export const GameSpeakingSports: React.FC = () => {
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
                    title="Speaking Challenge - Sports & Exercise"
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

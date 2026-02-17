
import React, { useState, useEffect, useRef } from 'react';
import { Maximize, Minimize } from 'lucide-react';

const gameHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Speak Viet : Social network</title>
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

        /* Mobile specific header adjustments */
        @media (max-width: 640px) {
            #round-title {
                text-align: left !important;
                width: auto !important;
                margin-right: 8px;
            }
            .round-label {
                display: none;
            }
            .round-short-label {
                display: inline;
            }
            #header-left-group {
                gap: 8px !important;
            }
        }
        @media (min-width: 641px) {
            .round-short-label {
                display: none;
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
        .nav-round-btn:hover:not(:disabled) {
            background: #3b82f6;
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
        
        .bubble-area-container {
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
            background: #3b82f6;
            color: white;
            width: 44px;
            height: 44px;
            border-radius: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
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
            border: 2px solid #3b82f6;
            color: #1e40af;
            padding: 12px 20px;
            border-radius: 14px;
            cursor: grab;
            font-weight: 700;
            box-shadow: 0 5px 15px rgba(59, 130, 246, 0.1);
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
            width: 140px;
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
        .toggle-btn.active { background: #3b82f6; color: white; }
        
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
                <div class="mb-3 bg-blue-100 p-3 rounded-full">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2.5"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-11.7 8.38 8.38 0 0 1 3.8.9L21 3z"></path></svg>
                </div>
                <h1 class="text-2xl font-black text-blue-900 mb-1 tracking-tight">Speak Viet : Social network</h1>
                <p id="ui-subtitle" class="text-blue-600 font-bold text-xs mb-6 italic">Master social media talks in Vietnamese 📱</p>
                
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

                <button id="ui-start-btn" onclick="startGame()" class="w-full py-4 bg-blue-600 text-white rounded-full font-black text-lg shadow-lg hover:bg-blue-700 active:scale-95 transition-all">START NOW</button>
            </div>
        </div>

        <!-- Header -->
        <div id="game-header">
            <div class="flex items-center gap-3" id="header-left-group">
                <div class="flex flex-col">
                    <h1 id="ui-header-title" class="text-[10px] font-black text-blue-500 uppercase tracking-widest">Speak Viet : Social network</h1>
                    <div class="flex items-center gap-2">
                        <button id="btn-prev-round" onclick="prevRound()" class="nav-round-btn">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                        </button>
                        <h2 id="round-title" class="text-sm font-black text-gray-800 w-24 text-center">
                            <span class="round-label">Round</span>
                            <span class="round-short-label">R</span>
                            <span id="round-number">1/9</span>
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
                <div class="w-12 sm:w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div id="progress-bar" class="h-full bg-blue-500 transition-all duration-700" style="width: 11%"></div>
                </div>
            </div>
        </div>

        <div class="scene-container" id="game-scene">
            <div id="bubble-area" class="bubble-area-container"></div>
            <div id="drag-container" class="mt-auto p-6 bg-white/80 backdrop-blur-lg border-t border-white/50 flex justify-center gap-8 hidden"></div>
        </div>

        <!-- Win Overlay -->
        <div id="win-overlay" class="overlay hidden">
            <div class="bg-white p-10 rounded-[3rem] shadow-2xl text-center">
                <div class="text-7xl mb-6">📱</div>
                <h2 id="ui-win-title" class="text-4xl font-black mb-4 text-blue-600 uppercase">AWESOME!</h2>
                <p id="ui-win-msg" class="text-gray-500 mb-8 font-bold text-lg leading-relaxed">You've mastered social media conversation.</p>
                <button id="ui-replay-btn" onclick="location.reload()" class="px-12 py-5 bg-blue-600 text-white rounded-full font-black text-xl shadow-xl hover:bg-blue-700">PLAY AGAIN</button>
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
                subtitle: "Master social media talks in Vietnamese 📱",
                langLabel: "LANGUAGE",
                howToPlayTitle: "HOW TO PLAY:",
                howToPlayList: [
                    "1. Drag or Type to complete the sentences.",
                    "2. Follow the hints and learn from translations.",
                    "3. Review & Speak the full dialogue at the end."
                ],
                startBtn: "START NOW",
                headerTitle: "Speak Viet : Social network",
                continueBtn: "CONTINUE",
                listenAllLabel: "LISTEN AGAIN",
                pauseLabel: "PAUSE",
                reviewTitle: "REVIEW DIALOGUE",
                finishBtn: "FINISH",
                winTitle: "AWESOME!",
                winMsg: "You've mastered social media conversation.",
                replayBtn: "PLAY AGAIN",
                placeholder: "Type here...",
                hintLabel: "Hint:",
                dragLabel: "Answer:"
            },
            ru: {
                subtitle: "Общение в соцсетях на вьетнамском 📱",
                langLabel: "ЯЗЫК",
                howToPlayTitle: "КАК ИГРАТЬ:",
                howToPlayList: [
                    "1. Перетаскивайте или печатайте, чтобы завершить предложения.",
                    "2. Следуйте подсказкам и учитесь на переводах.",
                    "3. В конце прослушайте и произнесите весь диалог."
                ],
                startBtn: "НАЧАТЬ",
                headerTitle: "Speak Viet : Social network",
                continueBtn: "ДАЛЕЕ",
                listenAllLabel: "СЛУШАТЬ СНОВА",
                pauseLabel: "ПАУЗА",
                reviewTitle: "ОБЗОР ДИАЛОГА",
                finishBtn: "ЗАВЕРШИТЬ",
                winTitle: "КРУТО!",
                winMsg: "Вы освоили общение в социальных сетях.",
                replayBtn: "ИГРАТЬ СНОВА",
                placeholder: "Введите здесь...",
                hintLabel: "Подсказка:",
                dragLabel: "Ответ:"
            }
        };

        const roundConfig = [
            { 
                q: "Bạn dùng những mạng xã hội nào?", 
                qSub: { en: "Which social networks do you use?", ru: "Какими социальными сетями ты пользуешься?" }, 
                type: "drag",
                choices: [
                    { vi: "Mình dùng Facebook và Zalo.", en: "I use Facebook and Zalo.", ru: "Я пользуюсь Facebook и Zalo." },
                    { vi: "Mình dùng Instagram và TikTok.", en: "I use Instagram and TikTok.", ru: "Я пользуюсь Instagram и TikTok." }
                ]
            },
            { 
                q: "Khi nào bạn bắt đầu dùng mạng xã hội?", 
                qSub: { en: "When did you start using Social Network?", ru: "Когда ты начал пользоваться соцсетями?" }, 
                prefix: "Mình bắt đầu dùng mạng xã hội từ", 
                prefixSub: { en: "I started using social media since", ru: "Я начал пользоваться соцсетями с" },
                suffix: "", 
                suffixSub: { en: "", ru: "" },
                hint: { en: "10 years ago / secondary school", ru: "10 лет назад / средней школы" } 
            },
            { 
                q: "Bạn dùng mạng xã hội mấy tiếng một ngày?", 
                qSub: { en: "How many hours a day do you use social media?", ru: "Сколько часов в день ты пользуешься социальными сетями?" }, 
                prefix: "Một ngày mình dùng khoảng", 
                prefixSub: { en: "A day I use about", ru: "В день я пользуюсь около" },
                suffix: "tiếng.", 
                suffixSub: { en: "hours.", ru: "часов." },
                hint: { en: "2 to 3 hours", ru: "2-3 часа" } 
            },
            { 
                q: "Bạn có nhiều bạn bè trên mạng xã hội không?", 
                qSub: { en: "Do you have many friends on social media?", ru: "У тебя много друзей в социальных сетях?" }, 
                prefix: "Có, mình có", 
                prefixSub: { en: "Yes, I have", ru: "Да, у меня" },
                suffix: "bạn bè.", 
                suffixSub: { en: "friends.", ru: "друзей." },
                hint: { en: "more than 500", ru: "более 500" } 
            },
            { 
                q: "Bạn thường làm gì trên mạng xã hội?", 
                qSub: { en: "What do you usually do on social media?", ru: "Что ты обычно делаешь в социальных сетях?" }, 
                prefix: "Mình thường", 
                prefixSub: { en: "I usually", ru: "Я обычно" },
                suffix: "", 
                suffixSub: { en: "", ru: "" },
                hint: { en: "watch videos and message friends", ru: "смотрю видео и переписываюсь" } 
            },
            { 
                q: "Bạn sẽ cảm thấy thế nào nếu không dùng mạng xã hội một tuần?", 
                qSub: { en: "How would you feel if you didn’t use social media for one week?", ru: "Как ты будешь себя чувствовать, если không dùng соцсети một tuần?" }, 
                prefix: "Mình nghĩ mình sẽ thấy", 
                prefixSub: { en: "I think I will feel", ru: "Я думаю, я буду чувствовать себя" },
                suffix: "", 
                suffixSub: { en: "", ru: "" },
                hint: { en: "bored and disconnected", ru: "скучно и оторванным от мира" } 
            },
            { 
                q: "Hãy liệt kê lợi ích của mạng xã hội.", 
                qSub: { en: "List the benefits of social media.", ru: "Перечисли преимущества социальных сетей." }, 
                prefix: "Lợi ích là", 
                prefixSub: { en: "The benefits are", ru: "Преимущества это" },
                suffix: "", 
                suffixSub: { en: "", ru: "" },
                hint: { en: "connecting people and sharing info", ru: "соединение людей и обмен инфо" } 
            },
            { 
                q: "Hãy liệt kê tác hại của mạng xã hội.", 
                qSub: { en: "List the disadvantages of social media.", ru: "Перечисли вред социальных сетей." }, 
                prefix: "Tác hại là", 
                prefixSub: { en: "The disadvantages are", ru: "Вред это" },
                suffix: "", 
                suffixSub: { en: "", ru: "" },
                hint: { en: "wasting time and eye strain", ru: "трата времени и усталость глаз" } 
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
                "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1562577309-4932fdd64cd1?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1200&q=80"
            ];
            document.getElementById('main-card').style.backgroundImage = \`url('\${bgs[currentRound % bgs.length]}')\`;
        }

        function setUserLanguage(l) { 
            userLang = l; 
            document.querySelectorAll('#lang-en, #lang-ru').forEach(b => b.classList.toggle('active', b.id === \`lang-\${l}\`));
            updateUILanguage();
            if (roundConfig[currentRound].type !== "review") loadRound();
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
            document.getElementById('round-number').innerText = \`\${currentRound + 1}/9\`;
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
            if (config.type === 'drag') {
                if (saved) renderSavedAnswer(userWrap, saved.a, saved.aSub);
                else {
                    dragCont.classList.remove('hidden');
                    renderDragChoices(dragCont, config);
                    userWrap.innerHTML = \`
                        <div class="bubble bubble-user-ans">
                            <span class="main-text">\${translations[userLang].dragLabel} <div id="drop-zone" class="drop-zone" ondrop="drop(event)" ondragover="allowDrop(event)" ondragleave="leaveDrop(event)"></div></span>
                        </div>
                    \`;
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
                <div id="user-voice-container" class="opacity-30 pointer-events-none">
                    <div class="speaker-btn user-voice-btn" id="dynamic-user-speaker">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M11 5L6 9H2v6h4l5 4V5z"></path></svg>
                    </div>
                </div>
            \`;
        }

        function allowDrop(ev) { ev.preventDefault(); ev.target.style.borderColor = "#3b82f6"; }
        function leaveDrop(ev) { ev.target.style.borderColor = "#cbd5e1"; }
        function drag(ev) { ev.dataTransfer.setData("text", ev.target.id); }

        async function drop(ev) {
            ev.preventDefault();
            const el = document.getElementById(ev.dataTransfer.getData("text"));
            const viText = el.getAttribute('data-vi');
            const subText = el.getAttribute('data-sub');
            const zone = document.getElementById('drop-zone');
            
            const userWrap = document.getElementById('user-bubble-wrapper');
            renderSavedAnswer(userWrap, viText, subText);

            history[currentRound] = { q: roundConfig[currentRound].q, a: viText, aSub: subText, qSub: roundConfig[currentRound].qSub[userLang] };
            document.getElementById('drag-container').classList.add('hidden');
            confetti({ particleCount: 50, spread: 30, origin: { y: 0.8 } });
            await speak(viText);
        }

        async function submitTyping() {
            const input = document.getElementById('round-input');
            const val = input.value.trim();
            if (!val) return;
            const btn = document.getElementById('submit-btn');
            btn.disabled = true;
            input.disabled = true;

            const config = roundConfig[currentRound];
            const viPart = await translateFree(val, userLang, 'vi');
            const fullA = \`\${config.prefix} \${viPart} \${config.suffix}\`.trim().replace(/\\s+/g, ' ');
            const fullASub = await translateFree(fullA, 'vi', userLang);
            
            history[currentRound] = { q: config.q, a: fullA, aSub: fullASub, qSub: config.qSub[userLang] };
            
            renderSavedAnswer(document.getElementById('user-bubble-wrapper'), fullA, fullASub);

            confetti({ particleCount: 50, spread: 30, origin: { y: 0.8 } });
            await speak(fullA);
        }

        function loadReviewRound() {
            const area = document.getElementById('bubble-area');
            const tools = document.getElementById('center-header-tools');
            area.innerHTML = \`<h2 class="text-2xl font-black text-blue-700 text-center mb-4">\${translations[userLang].reviewTitle}</h2>\`;
            
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
            document.getElementById('continue-btn').innerHTML = \`\${translations[userLang].finishBtn} ✅\`;
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

        function prevRound() { if (currentRound > 0) { currentRound--; loadRound(); } }
        function nextRound() { if (currentRound < 8 && history[currentRound]) { currentRound++; loadRound(); } }
        function goForward() {
            if (currentRound < 8) { currentRound++; loadRound(); }
            else { document.getElementById('win-overlay').classList.remove('hidden'); confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } }); }
        }
    </script>
</body>
</html>
`;

export const GameSpeakingSocial: React.FC = () => {
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
                    title="Speaking Challenge - Social Network"
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

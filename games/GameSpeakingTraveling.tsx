
import React, { useState, useEffect, useRef } from 'react';
import { Maximize, Minimize } from 'lucide-react';

const gameHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SPEAK VIET : TRAVEL</title>
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
            #header-left-group { gap: 0.5rem !important; }
            #round-title-prefix { display: none; }
            #round-title-mobile-prefix { display: inline !important; }
            #round-title { width: auto !important; text-align: left !important; }
            #game-header { padding: 0.8rem 0.75rem !important; }
        }

        #round-title-mobile-prefix { display: none; }

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
        .user-voice-btn { background: #0284c7; box-shadow: 0 4px 12px rgba(2, 132, 199, 0.3); }

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
        .bubble-user-ans { border-right: 6px solid #0284c7; }

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
            border-bottom: 3px solid #0284c7;
            background: transparent;
            outline: none;
            font-weight: 800;
            color: #0284c7;
            padding: 0 8px;
            width: 120px;
            text-align: center;
        }

        .send-btn {
            background: #0284c7;
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
        .send-btn:hover { background: #0369a1; transform: scale(1.1); }
        .send-btn:disabled { opacity: 0.3; cursor: not-allowed; }

        .toggle-btn { flex: 1; padding: 10px; border-radius: 12px; font-weight: 700; background: #f1f5f9; color: #64748b; transition: 0.3s; }
        .toggle-btn.active { background: #10b981; color: white; }
        
        .hidden { display: none !important; }

        .highlight-ella .bubble-ella-quest { background: #f0fdf4 !important; border-color: #059669 !important; transform: scale(1.02); }
        .highlight-user .bubble-user-ans { background: #f0f9ff !important; border-color: #0284c7 !important; transform: scale(1.02); }
    </style>
</head>
<body onload="initGame()">

    <div class="game-card" id="main-card">
        <div id="start-overlay" class="overlay">
            <div class="start-content-box">
                <div class="mb-3 bg-green-100 p-3 rounded-full">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2.5"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>
                </div>
                <h1 class="text-2xl font-black text-green-900 mb-1 tracking-tight">TRAVEL</h1>
                <p id="ui-subtitle" class="text-green-600 font-bold text-xs mb-6 italic">Master travel talks in Vietnamese ✈️</p>
                
                <div class="w-full mb-6">
                    <p id="ui-lang-label" class="text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest text-left">LANGUAGE</p>
                    <div class="flex gap-2">
                        <button id="lang-en" onclick="setUserLanguage('en')" class="toggle-btn active">🇬🇧 EN</button>
                        <button id="lang-ru" onclick="setUserLanguage('ru')" class="toggle-btn">🇷🇺 RU</button>
                    </div>
                </div>

                <div class="bg-green-50 p-4 rounded-xl mb-6 text-left w-full border border-green-100">
                    <p id="ui-howtoplay-title" class="text-[10px] font-black text-green-800 mb-2 uppercase tracking-wider">HOW TO PLAY:</p>
                    <ul id="ui-howtoplay-list" class="text-[12px] text-green-700 space-y-1.5 font-bold"></ul>
                </div>

                <button id="ui-start-btn" onclick="startGame()" class="w-full py-4 bg-green-600 text-white rounded-full font-black text-lg shadow-lg hover:bg-green-700 active:scale-95 transition-all">START NOW</button>
            </div>
        </div>

        <div id="game-header">
            <div class="flex items-center gap-3" id="header-left-group">
                <div class="flex flex-col">
                    <h1 id="ui-header-title" class="text-[10px] font-black text-green-600 uppercase tracking-widest">TRAVEL CONVERSATION</h1>
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
                    <span id="listen-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M11 5L6 9H2v6h4l5 4V5z"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg></span>
                    <span id="listen-text">LISTEN AGAIN</span>
                </button>
                <button id="continue-btn" onclick="goForward()" class="bg-emerald-500 text-white px-6 py-2.5 rounded-full text-xs font-black shadow-lg hover:bg-emerald-600 transition-all flex items-center gap-2 uppercase tracking-widest">CONTINUE</button>
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

        <div id="win-overlay" class="overlay hidden">
            <div class="bg-white p-10 rounded-[3rem] shadow-2xl text-center">
                <div class="text-7xl mb-6">✈️</div>
                <h2 id="ui-win-title" class="text-4xl font-black mb-4 text-green-600 uppercase">BON VOYAGE!</h2>
                <p id="ui-win-msg" class="text-gray-500 mb-8 font-bold text-lg leading-relaxed">You have mastered travel conversation.</p>
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
                subtitle: "Master travel talks in Vietnamese ✈️",
                langLabel: "LANGUAGE",
                howToPlayTitle: "HOW TO PLAY:",
                howToPlayList: [
                    "1. Drag or Type to complete the sentences.",
                    "2. Follow the hints and learn from translations.",
                    "3. Review & Speak the full dialogue at the end."
                ],
                startBtn: "START NOW",
                headerTitle: "TRAVEL CONVERSATION",
                continueBtn: "CONTINUE",
                listenAllLabel: "LISTEN AGAIN",
                pauseLabel: "PAUSE",
                reviewTitle: "REVIEW DIALOGUE",
                finishBtn: "FINISH",
                winTitle: "BON VOYAGE!",
                winMsg: "You have mastered travel conversation.",
                replayBtn: "PLAY AGAIN",
                placeholder: "Type here...",
                hintLabel: "Hint:",
                dragLabel: "Answer:"
            },
            ru: {
                subtitle: "Беседы о путешествиях на вьетнамском ✈️",
                langLabel: "ЯЗЫК",
                howToPlayTitle: "КАК ИГРАТЬ:",
                howToPlayList: [
                    "1. Перетаскивайте или вводите ответы.",
                    "2. Используйте подсказки и переводы.",
                    "3. Повторите весь диалог в конце."
                ],
                startBtn: "НАЧАТЬ",
                headerTitle: "РАЗГОВОР О ПУТЕШЕСТВИИ",
                continueBtn: "ДАЛЕЕ",
                listenAllLabel: "СЛУШАТЬ СНОВА",
                pauseLabel: "ПАУЗА",
                reviewTitle: "ОБЗОР ДИАЛОГА",
                finishBtn: "ЗАВЕРШИТЬ",
                winTitle: "СЧАСТЛИВОГО ПУТИ!",
                winMsg: "Вы освоили разговор о путешествиях.",
                replayBtn: "ИГРАТЬ СНОВА",
                placeholder: "Введите здесь...",
                hintLabel: "Подсказка:",
                dragLabel: "Ответ:"
            }
        };

        const roundConfig = [
            { 
                q: "Bạn có thích đi du lịch không?", 
                qSub: { en: "Do you like traveling?", ru: "Ты любишь путешествовать?" }, 
                type: "drag",
                choices: [
                    { vi: "Mình rất thích đi du lịch.", en: "I love traveling very much.", ru: "Я очень люблю путешествовать." },
                    { vi: "Mình cũng bình thường.", en: "I'm okay with it.", ru: "Я отношусь к этому обычно." }
                ]
            },
            { 
                q: "Một năm bạn đi du lịch mấy lần?", 
                qSub: { en: "How many times a year do you travel?", ru: "Сколько раз в год ты путешествуешь?" }, 
                prefix: "Một năm mình đi du lịch khoảng", 
                prefixSub: { en: "One year I travel about", ru: "В год я путешествую около" },
                suffix: "lần.", 
                suffixSub: { en: "times.", ru: "раз." },
                hint: { en: "2 times", ru: "2 раза" } 
            },
            { 
                q: "Chuyến đi thú vị nhất của bạn là đến địa điểm nào?", 
                qSub: { en: "What has been your most interesting travel destination?", ru: "Какое место было самым интересным в твоих поездках?" }, 
                prefix: "Chuyến đi thú vị nhất của mình là đến", 
                prefixSub: { en: "My most interesting trip was to", ru: "Моя самая интересная поездка была в" },
                suffix: "", 
                suffixSub: { en: "", ru: "" },
                hint: { en: "Da Lat city", ru: "город Далат" } 
            },
            { 
                q: "Bạn thường đi du lịch với ai?", 
                qSub: { en: "Who do you usually travel with?", ru: "С кем ты обычно путешествуешь?" }, 
                prefix: "Mình thường đi du lịch với", 
                prefixSub: { en: "I usually travel with", ru: "Я обычно путешествую с" },
                suffix: "", 
                suffixSub: { en: "", ru: "" },
                hint: { en: "my family and friends", ru: "моей семьей и друзьями" } 
            },
            { 
                q: "Bạn thường đi du lịch bằng phương tiện gì?", 
                qSub: { en: "What transport do you usually use when traveling?", ru: "Каким транспортом ты обычно путешествуешь?" }, 
                prefix: "Mình thường đi du lịch bằng", 
                prefixSub: { en: "I usually travel by", ru: "Я обычно путешествую на" },
                suffix: "", 
                suffixSub: { en: "", ru: "" },
                hint: { en: "airplane or train", ru: "самолете или поезде" } 
            },
            { 
                q: "Bạn thường mang theo những gì khi đi du lịch?", 
                qSub: { en: "What do you usually take with you when traveling?", ru: "Что ты обычно берёшь с собой в поездку?" }, 
                prefix: "Mình thường mang theo", 
                prefixSub: { en: "I usually take along", ru: "Я обычно беру с собой" },
                suffix: "", 
                suffixSub: { en: "", ru: "" },
                hint: { en: "clothes and camera", ru: "одежду и камеру" } 
            },
            { 
                q: "Bạn thường làm gì trong mỗi chuyến du lịch?", 
                qSub: { en: "What do you usually do on each trip?", ru: "Что ты обычно делаешь в каждой поездке?" }, 
                prefix: "Mình thường", 
                prefixSub: { en: "I usually", ru: "Я обычно" },
                suffix: "và chụp ảnh.", 
                suffixSub: { en: "and take photos.", ru: "и фотографирую." },
                hint: { en: "visit famous places", ru: "посещаю знаменитые места" } 
            },
            { 
                q: "Bạn đã đi du lịch những thành phố nào ở Việt Nam?", 
                qSub: { en: "Which cities in Vietnam have you traveled to?", ru: "В какие города Вьетнама ты уже путешествовал(а)?" }, 
                prefix: "Mình đã từng đến", 
                prefixSub: { en: "I have been to", ru: "Я уже был в" },
                suffix: "ở Việt Nam.", 
                suffixSub: { en: "in Vietnam.", ru: "во Вьетнаме." },
                hint: { en: "Hanoi and Da Nang", ru: "Ханой и Дананг" } 
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
            const icon = document.getElementById('listen-icon');
            const text = document.getElementById('listen-text');
            const t = translations[userLang];
            if (isReviewRunning) {
                text.innerText = t.pauseLabel;
                icon.innerHTML = \`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>\`;
            } else {
                text.innerText = t.listenAllLabel;
                icon.innerHTML = \`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M11 5L6 9H2v6h4l5 4V5z"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>\`;
            }
        }

        function updateBackground() {
            const bgs = [
                "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1503220317375-aaad61436b1b?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1436491865332-7a61a109c0f3?auto=format&fit=crop&w=1200&q=80"
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
                } catch(e) {
                    resolve();
                }
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
            
            document.getElementById('round-number-text').innerText = \`\${currentRound + 1}/9\`;
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

        async function submitTyping() {
            const input = document.getElementById('round-input');
            const btn = document.getElementById('submit-btn');
            const val = input.value.trim();
            if (!val) return;

            input.disabled = true;
            btn.disabled = true;
            btn.innerHTML = '<div class="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>';

            const config = roundConfig[currentRound];
            const viFragment = await translateFree(val, userLang, 'vi');
            const fullVi = \`\${config.prefix} \${viFragment} \${config.suffix}\`.trim();
            const fullUser = await translateFree(fullVi, 'vi', userLang);

            history[currentRound] = { q: config.q, qSub: config.qSub[userLang], a: fullVi, aSub: fullUser };
            renderSavedAnswer(document.getElementById('user-bubble-wrapper'), fullVi, fullUser);
            speak(fullVi);
        }

        function allowDrop(e) { e.preventDefault(); e.target.classList.add('bg-indigo-100'); }
        function leaveDrop(e) { e.target.classList.remove('bg-indigo-100'); }
        function drag(e) { e.dataTransfer.setData("text", e.target.id); }
        function drop(e) {
            e.preventDefault();
            const id = e.dataTransfer.getData("text");
            const el = document.getElementById(id);
            const vi = el.getAttribute('data-vi');
            const sub = el.getAttribute('data-sub');
            history[currentRound] = { q: roundConfig[currentRound].q, qSub: roundConfig[currentRound].qSub[userLang], a: vi, aSub: sub };
            renderSavedAnswer(document.getElementById('user-bubble-wrapper'), vi, sub);
            document.getElementById('drag-container').classList.add('hidden');
            speak(vi);
        }

        function prevRound() { if (currentRound > 0) { currentRound--; loadRound(); } }
        function nextRound() { if (currentRound < 8) { currentRound++; loadRound(); } }
        function goForward() { if (currentRound < 8) { currentRound++; loadRound(); } else { showWin(); } }

        function loadReviewRound() {
            const area = document.getElementById('bubble-area');
            area.innerHTML = \`<h2 class="text-2xl font-black text-center text-green-700 mb-4">\${translations[userLang].reviewTitle}</h2>\`;
            
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
                await new Promise(r => setTimeout(r, 500));
                eEl.classList.remove('highlight-ella');
                if (stopReviewRequested) break;
                const uEl = document.getElementById(\`review-user-\${i}\`);
                uEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                uEl.classList.add('highlight-user');
                await speak(history[i].a);
                await new Promise(r => setTimeout(r, 800));
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
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#10b981', '#059669', '#34d399'] });
            document.getElementById('win-overlay').classList.remove('hidden');
        }
    </script>
</body>
</html>
`;

export const GameSpeakingTraveling: React.FC = () => {
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
                    title="Speaking Challenge - Traveling"
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

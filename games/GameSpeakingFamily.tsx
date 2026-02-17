
import React, { useState, useEffect, useRef } from 'react';
import { Maximize, Minimize } from 'lucide-react';

const gameHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SPEAK VIET FAMILY</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@400;600;700&display=swap');

        body {
            font-family: 'Quicksand', sans-serif;
            background: #fdf2f8;
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
            background-color: #fce7f3;
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
        .nav-round-btn:hover:not(:disabled) { background: #db2777; color: white; }
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
            background: #db2777;
            color: white;
            width: 44px;
            height: 44px;
            border-radius: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(219, 39, 119, 0.3);
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
            border: 2px solid #db2777;
            color: #be185d;
            padding: 12px 20px;
            border-radius: 14px;
            cursor: grab;
            font-weight: 700;
            box-shadow: 0 5px 15px rgba(219, 39, 119, 0.1);
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
        .toggle-btn.active { background: #db2777; color: white; }
        
        .hidden { display: none !important; }

        .highlight-ella .bubble-ella-quest { background: #fdf2f8 !important; transform: scale(1.02); }
        .highlight-user .bubble-user-ans { background: #f0f9ff !important; transform: scale(1.02); }
    </style>
</head>
<body onload="initGame()">

    <div class="game-card" id="main-card">
        <div id="start-overlay" class="overlay">
            <div class="start-content-box">
                <div class="mb-3 bg-pink-100 p-3 rounded-full">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#db2777" stroke-width="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                </div>
                <h1 class="text-2xl font-black text-pink-900 mb-1 tracking-tight">SPEAK VIET FAMILY</h1>
                <p id="ui-subtitle" class="text-pink-600 font-bold text-xs mb-6 italic">Talk about your family in Vietnamese ❤️</p>
                
                <div class="w-full mb-6">
                    <p id="ui-lang-label" class="text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest text-left">LANGUAGE</p>
                    <div class="flex gap-2">
                        <button id="lang-en" onclick="setUserLanguage('en')" class="toggle-btn active">🇬🇧 EN</button>
                        <button id="lang-ru" onclick="setUserLanguage('ru')" class="toggle-btn">🇷🇺 RU</button>
                    </div>
                </div>

                <div class="bg-pink-50 p-4 rounded-xl mb-6 text-left w-full border border-pink-100">
                    <p id="ui-howtoplay-title" class="text-[10px] font-black text-pink-800 mb-2 uppercase tracking-wider">HOW TO PLAY:</p>
                    <ul id="ui-howtoplay-list" class="text-[12px] text-pink-700 space-y-1.5 font-bold"></ul>
                </div>

                <button id="ui-start-btn" onclick="startGame()" class="w-full py-4 bg-pink-600 text-white rounded-full font-black text-lg shadow-lg hover:bg-pink-700 active:scale-95 transition-all">START NOW</button>
            </div>
        </div>

        <div id="game-header">
            <div class="flex items-center gap-3" id="header-left-group">
                <div class="flex flex-col">
                    <h1 id="ui-header-title" class="text-[10px] font-black text-pink-500 uppercase tracking-widest">FAMILY CONVERSATION</h1>
                    <div class="flex items-center gap-2">
                        <button id="btn-prev-round" onclick="prevRound()" class="nav-round-btn">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="15 18 9 12 15 6"></polyline></svg>
                        </button>
                        <h2 id="round-title" class="text-sm font-black text-gray-800 w-24 text-center">
                            <span id="round-title-prefix">Round</span><span id="round-title-mobile-prefix">R</span> <span id="round-number-text">1/9</span>
                        </h2>
                        <button id="btn-next-round" onclick="nextRound()" class="nav-round-btn">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="9 18 15 12 9 6"></polyline></svg>
                        </button>
                    </div>
                </div>
            </div>
            
            <div id="center-header-tools" class="hidden flex items-center gap-2">
                <button id="listen-all-round-btn" onclick="handleListenAllClick()" class="bg-amber-500 text-white px-5 py-2.5 rounded-full text-[10px] font-black shadow-lg hover:bg-amber-600 transition-all flex items-center gap-2 uppercase tracking-wider">
                    <span id="listen-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M11 5L6 9H2v6h4l5 4V5z"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg></span>
                    <span id="listen-text">LISTEN ALL</span>
                </button>
                <button id="continue-btn" onclick="goForward()" class="bg-emerald-500 text-white px-6 py-2.5 rounded-full text-xs font-black shadow-lg hover:bg-emerald-600 transition-all flex items-center gap-2 uppercase tracking-widest">CONTINUE</button>
            </div>

            <div class="flex items-center gap-2">
                <div class="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div id="progress-bar" class="h-full bg-pink-500 transition-all duration-700" style="width: 11%"></div>
                </div>
            </div>
        </div>

        <div class="scene-container" id="game-scene">
            <div id="bubble-area" class="bubble-container"></div>
            <div id="drag-container" class="mt-auto p-6 bg-white/80 backdrop-blur-lg border-t border-white/50 flex justify-center gap-8 hidden"></div>
        </div>

        <div id="win-overlay" class="overlay hidden">
            <div class="bg-white p-10 rounded-[3rem] shadow-2xl text-center">
                <div class="text-7xl mb-6">👨‍👩-‍👧‍👦</div>
                <h2 id="ui-win-title" class="text-4xl font-black mb-4 text-pink-600 uppercase">EXCELLENT!</h2>
                <p id="ui-win-msg" class="text-gray-500 mb-8 font-bold text-lg leading-relaxed">You've mastered the family talk.</p>
                <button id="ui-replay-btn" onclick="location.reload()" class="px-12 py-5 bg-pink-600 text-white rounded-full font-black text-xl shadow-xl hover:bg-pink-700">PLAY AGAIN</button>
            </div>
        </div>
    </div>

    <script>
        const apiKey = "";
        let userLang = 'en';
        let currentRound = 0;
        let history = [];
        let currentGoogleAudio = null;
        let isReviewing = false;
        let stopReviewRequested = false;

        const translations = {
            en: {
                subtitle: "Talk about your family in Vietnamese ❤️",
                langLabel: "LANGUAGE",
                howToPlayTitle: "HOW TO PLAY:",
                howToPlayList: ["1. Drag or Type to complete the sentences.", "2. Follow the hints and learn from translations.", "3. Review & Speak the full dialogue at the end."],
                startBtn: "START NOW", headerTitle: "FAMILY CONVERSATION", continueBtn: "CONTINUE", listenAllLabel: "LISTEN AGAIN", pauseLabel: "PAUSE", reviewTitle: "REVIEW DIALOGUE", finishBtn: "FINISH", winTitle: "EXCELLENT!", winMsg: "You've mastered the family talk.", replayBtn: "PLAY AGAIN", placeholder: "Type here...", hintLabel: "Hint:", dragLabel: "Answer:"
            },
            ru: {
                subtitle: "Говорите о своей семье на вьетнамском ❤️",
                langLabel: "ЯЗЫК",
                howToPlayTitle: "КАК ИГРАТЬ:",
                howToPlayList: ["1. Перетаскивайте или вводите ответы.", "2. Используйте подсказки и переводы.", "3. Повторите весь диалог в конце."],
                startBtn: "НАЧАТЬ", headerTitle: "РАЗГОВОР О СЕМЬЕ", continueBtn: "ДАЛЕЕ", listenAllLabel: "СЛУШАТЬ СНОВА", pauseLabel: "ПАУЗА", reviewTitle: "ОБЗОР ДИАЛОГА", finishBtn: "ЗАВЕРШИТЬ", winTitle: "ОТЛИЧНО!", winMsg: "Вы освоили разговор о семье.", replayBtn: "ИГРАТЬ СНОВА", placeholder: "Введите здесь...", hintLabel: "Подсказка:", dragLabel: "Ответ:"
            }
        };

        const roundConfig = [
            { 
                q: "Gia đình bạn có mấy người?", 
                qSub: { en: "How many people are there in your family?", ru: "Сколько человек в твоей семье?" }, 
                prefix: "Gia đình mình có", 
                prefixSub: { en: "My family has", ru: "В моей семье" }, 
                suffix: "người", 
                suffixSub: { en: "people", ru: "человек" }, 
                hint: { en: "4 / 5 / 6", ru: "4 / 5 / 6" } 
            },
            { 
                q: "Bố bạn làm nghề gì?", 
                qSub: { en: "What does your father do?", ru: "Кем работает твой отец?" }, 
                prefix: "Bố mình là", 
                prefixSub: { en: "My dad is a", ru: "Мой папа" }, 
                suffix: "", 
                suffixSub: { en: "", ru: "" }, 
                hint: { en: "engineer", ru: "инженер" } 
            },
            { 
                q: "Mẹ bạn làm nghề gì?", 
                qSub: { en: "What does your mother do?", ru: "Кем работает твоя мама?" }, 
                prefix: "Mẹ mình là", 
                prefixSub: { en: "My mom is a", ru: "Моya мама" }, 
                suffix: "", 
                suffixSub: { en: "", ru: "" }, 
                hint: { en: "teacher", ru: "учитель" } 
            },
            { 
                q: "Sở thích của em trai bạn là gì?", 
                qSub: { en: "What is your younger brother’s hobby?", ru: "Какое хобби у твого младшего брата?" }, 
                prefix: "Em trai mình thích", 
                prefixSub: { en: "My younger brother likes", ru: "Моý младший брат любит" }, 
                suffix: "", 
                suffixSub: { en: "", ru: "" }, 
                hint: { en: "playing football", ru: "играть в футбол" } 
            },
            { 
                q: "Bạn có ở cùng với gia đình không?", 
                qSub: { en: "Do you live with your family?", ru: "Ты живёшь со своей семьёй?" }, 
                type: "drag", 
                choices: [
                    { vi: "Có, mình đang ở cùng gia đình.", en: "Yes, I am living with my family.", ru: "Да, я живу со своей семьей." },
                    { vi: "Không, mình đang ở riêng.", en: "No, I am living alone.", ru: "Нет, я живу отдельно." }
                ] 
            },
            { 
                q: "Bạn thường nói chuyện với gia đình qua đâu?", 
                qSub: { en: "How do you usually talk to your family?", ru: "Как ты обычно общаешься с семьей?" }, 
                prefix: "Mình thường nói chuyện", 
                prefixSub: { en: "I usually talk", ru: "Я обычно общаюсь" }, 
                suffix: "", 
                suffixSub: { en: "", ru: "" }, 
                hint: { en: "by phone", ru: "по телефону" } 
            },
            { 
                q: "Mẹ bạn nấu ăn có ngon không?", 
                qSub: { en: "Is your mother’s cooking good?", ru: "Твоя мама хорошо готовит?" }, 
                prefix: "Mẹ mình nấu ăn", 
                prefixSub: { en: "My mom cooks", ru: "Моя мама готовит" }, 
                suffix: "", 
                suffixSub: { en: "", ru: "" }, 
                hint: { en: "very delicious", ru: "очень вкусно" } 
            },
            { 
                q: "Bạn thường làm gì cùng gia đình mình?", 
                qSub: { en: "What do you usually do with your family?", ru: "Что ты обычно делаешь со своей семьёй?" }, 
                prefix: "Gia đình mình thường", 
                prefixSub: { en: "My family usually", ru: "Моя семья обычно" }, 
                suffix: "vào cuối tuần", 
                suffixSub: { en: "on weekends", ru: "по выходным" }, 
                hint: { en: "travels", ru: "путешествует" } 
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
            document.getElementById('ui-howtoplay-list').innerHTML = t.howToPlayList.map(item => \`<li>\${item}</li>\`).join('');
        }

        function updateListenBtnUI() {
            const icon = document.getElementById('listen-icon');
            const text = document.getElementById('listen-text');
            const t = translations[userLang];
            if (isReviewing) {
                text.innerText = t.pauseLabel;
                icon.innerHTML = \`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>\`;
            } else {
                text.innerText = t.listenAllLabel;
                icon.innerHTML = \`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M11 5L6 9H2v6h4l5 4V5z"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>\`;
            }
        }

        function updateBackground() {
            const bgs = [
                "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1542037104857-ffbb0b9155fb?auto=format&fit=crop&w=1200&q=80"
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
            if (currentGoogleAudio) {
                currentGoogleAudio.pause();
                currentGoogleAudio.currentTime = 0;
            }
            return new Promise((resolve) => {
                try {
                    const url = \`https://translate.google.com/translate_tts?ie=UTF-8&q=\${encodeURIComponent(text)}&tl=vi&client=tw-ob\`;
                    const audio = new Audio(url);
                    currentGoogleAudio = audio;
                    audio.onended = () => { currentGoogleAudio = null; resolve(); };
                    audio.onerror = () => { currentGoogleAudio = null; resolve(); };
                    audio.play().catch(e => { currentGoogleAudio = null; resolve(); });
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
            area.innerHTML = ''; tools.classList.add('hidden'); dragCont.classList.add('hidden');
            
            document.getElementById('round-number-text').innerText = \`\${currentRound + 1}/9\`;
            document.getElementById('progress-bar').style.width = \`\${((currentRound+1)/9)*100}%\`;
            document.getElementById('btn-prev-round').disabled = (currentRound === 0);
            document.getElementById('btn-next-round').disabled = (currentRound === 8);

            if (config.type === "review") { loadReviewRound(); return; }

            const ellaWrap = document.createElement('div');
            ellaWrap.className = 'bubble-wrapper';
            ellaWrap.innerHTML = \`
                <div class="speaker-btn ella-voice-btn" onclick="speak('\${config.q.replace(/'/g, "\\\\'")}')"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M11 5L6 9H2v6h4l5 4V5z"></path></svg></div>
                <div class="bubble bubble-ella-quest"><span class="main-text">\${config.q}</span><span class="sub-text">\${config.qSub[userLang]}</span></div>
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
                <div class="speaker-btn user-voice-btn" onclick="speak('\${text.replace(/'/g, "\\\\'")}')"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M11 5L6 9H2v6h4l5 4V5z"></path></svg></div>
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
                    <span class="main-text">\${config.prefix} <span class="input-group"><input type="text" id="round-input" class="inline-input" placeholder="..." onkeypress="if(event.key==='Enter') submitTyping()"><button onclick="submitTyping()" class="send-btn" id="submit-btn"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg></button></span> \${config.suffix}</span>
                    <span class="sub-text" id="init-sub">\${config.prefixSub[userLang]} [...] \${config.suffixSub[userLang]}</span>
                    <span class="hint-text">\${translations[userLang].hintLabel} \${config.hint[userLang]}</span>
                </div>
            \`;
        }

        async function submitTyping() {
            const input = document.getElementById('round-input');
            const val = input.value.trim();
            if (!val) return;
            const btn = document.getElementById('submit-btn');
            btn.disabled = true; input.disabled = true;
            const config = roundConfig[currentRound];
            const translated = await translateFree(val, userLang, 'vi');
            const fullVi = \`\${config.prefix} \${translated} \${config.suffix}\`.replace(/\\s+/g, ' ').trim();
            const fullUser = await translateFree(fullVi, 'vi', userLang);
            history[currentRound] = { q: config.q, qSub: config.qSub[userLang], a: fullVi, aSub: fullUser };
            renderSavedAnswer(document.getElementById('user-bubble-wrapper'), fullVi, fullUser);
            speak(fullVi);
        }

        function allowDrop(e) { e.preventDefault(); e.target.classList.add('bg-pink-100'); }
        function leaveDrop(e) { e.target.classList.remove('bg-pink-100'); }
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
        function goForward() { if (currentRound < 8) { currentRound++; loadRound(); } else { finishGame(); } }

        function loadReviewRound() {
            const area = document.getElementById('bubble-area');
            area.innerHTML = \`<h2 class="text-2xl font-black text-center text-pink-600 mb-6 uppercase tracking-widest">\${translations[userLang].reviewTitle}</h2>\`;
            const tools = document.getElementById('center-header-tools');
            tools.classList.remove('hidden');
            document.getElementById('continue-btn').innerText = translations[userLang].finishBtn;

            history.forEach((item, idx) => {
                if (!item) return;
                const pair = document.createElement('div');
                pair.className = 'flex flex-col gap-4 mb-8 transition-all duration-500 p-4 rounded-3xl';
                pair.id = \`review-pair-\${idx}\`;
                pair.innerHTML = \`
                    <div class="bubble-wrapper"><div class="speaker-btn ella-voice-btn" onclick="speak('\${item.q.replace(/'/g, "\\\\'")}')"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M11 5L6 9H2v6h4l5 4V5z"></path></svg></div><div class="bubble bubble-ella-quest"><span class="main-text">\${item.q}</span><span class="sub-text">\${item.qSub}</span></div></div>
                    <div class="bubble-wrapper justify-end"><div class="bubble bubble-user-ans"><span class="main-text">\${item.a}</span><span class="sub-text">\${item.aSub}</span></div><div class="speaker-btn user-voice-btn" onclick="speak('\${item.a.replace(/'/g, "\\\\'")}')"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M11 5L6 9H2v6h4l5 4V5z"></path></svg></div></div>
                \`;
                area.appendChild(pair);
            });
        }

        async function handleListenAllClick() {
            if (roundConfig[currentRound].type === "review") {
                if (isReviewing) { stopReview(); } 
                else { startReview(); }
            } else {
                const item = history[currentRound];
                if (item) {
                    await speak(item.q);
                    await new Promise(r => setTimeout(r, 600));
                    await speak(item.a);
                }
            }
        }

        async function startReview() {
            if (history.length === 0) return;
            isReviewing = true;
            stopReviewRequested = false;
            updateListenBtnUI();

            for (let i = 0; i < history.length; i++) {
                if (stopReviewRequested) break;
                if (!history[i]) continue;
                
                const pair = document.getElementById(\`review-pair-\${i}\`);
                if (pair) {
                    pair.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    pair.classList.add('highlight-ella'); 
                    await speak(history[i].q); 
                    pair.classList.remove('highlight-ella');
                }
                
                if (stopReviewRequested) break;
                await new Promise(r => setTimeout(r, 600));

                if (pair) {
                    pair.classList.add('highlight-user');
                    await speak(history[i].a);
                    pair.classList.remove('highlight-user');
                }

                if (stopReviewRequested) break;
                await new Promise(r => setTimeout(r, 1000));
            }
            isReviewing = false;
            updateListenBtnUI();
        }

        function stopReview() {
            stopReviewRequested = true;
            isReviewing = false;
            if (currentGoogleAudio) currentGoogleAudio.pause();
            updateListenBtnUI();
            document.querySelectorAll('.bubble-pair').forEach(p => {
                p.classList.remove('highlight-ella', 'highlight-user');
            });
        }

        function finishGame() {
            document.getElementById('win-overlay').classList.remove('hidden');
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#db2777', '#f472b6', '#ffffff'] });
        }
    </script>
</body>
</html>
`;

export const GameSpeakingFamily: React.FC = () => {
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
                    title="Speaking Challenge - Family"
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

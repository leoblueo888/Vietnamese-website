
import React, { useState, useEffect, useRef } from 'react';
import { Maximize, Minimize } from 'lucide-react';

const gameHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Speak Viet Youtube and Movies</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@400;600;700&display=swap');

        body {
            font-family: 'Quicksand', sans-serif;
            background: #0f172a;
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
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            position: relative;
            overflow: hidden;
            background-color: #1e293b;
            transition: background-image 0.8s ease-in-out;
        }

        .overlay {
            position: absolute;
            inset: 0;
            background: rgba(15, 23, 42, 0.9);
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
            background: rgba(30, 41, 59, 0.95);
            padding: 24px;
            border-radius: 2rem;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            border: 1px solid rgba(255,255,255,0.1);
            display: flex;
            flex-direction: column;
            align-items: center;
            max-width: 400px; 
            width: 100%;
        }

        #game-header {
            flex-shrink: 0;
            background: rgba(15, 23, 42, 0.8);
            backdrop-filter: blur(10px);
            border-bottom: 1px solid rgba(255,255,255,0.1);
            padding: 0.8rem 1.5rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            z-index: 100;
        }

        .nav-round-btn {
            background: #334155;
            color: #f8fafc;
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
        .nav-round-btn:hover:not(:disabled) { background: #ef4444; color: white; }
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
            background: #ef4444;
            color: white;
            width: 44px;
            height: 44px;
            border-radius: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
            transition: 0.2s;
            flex-shrink: 0;
        }
        .speaker-btn:hover { transform: scale(1.05); }
        
        .ella-voice-btn { background: #e11d48; }
        .user-voice-btn { background: #2563eb; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3); }

        .bubble {
            padding: 1.2rem 1.5rem;
            border-radius: 1.5rem;
            max-width: 85%;
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            background: rgba(255, 255, 255, 0.95);
            border: 1px solid rgba(255,255,255,0.5);
            position: relative;
        }

        .bubble-ella-quest { border-left: 6px solid #e11d48; }
        .bubble-user-ans { border-right: 6px solid #2563eb; }

        .main-text { font-size: 1.25rem; font-weight: 800; margin-bottom: 6px; display: block; color: #0f172a; }
        .sub-text { font-size: 0.95rem; font-weight: 600; color: #475569; display: block; border-top: 1px solid #e2e8f0; padding-top: 6px; margin-top: 4px; font-style: italic; }
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
            border: 2px solid #ef4444;
            color: #ef4444;
            padding: 12px 20px;
            border-radius: 14px;
            cursor: grab;
            font-weight: 700;
            box-shadow: 0 5px 15px rgba(239, 68, 68, 0.1);
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
            border-bottom: 3px solid #2563eb;
            background: transparent;
            outline: none;
            font-weight: 800;
            color: #2563eb;
            padding: 0 8px;
            width: 150px;
            text-align: center;
        }

        .send-btn {
            background: #2563eb;
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
        .send-btn:hover { background: #1d4ed8; transform: scale(1.1); }
        .send-btn:disabled { opacity: 0.3; cursor: not-allowed; }

        .toggle-btn { flex: 1; padding: 10px; border-radius: 12px; font-weight: 700; background: #334155; color: #94a3b8; transition: 0.3s; }
        .toggle-btn.active { background: #ef4444; color: white; }
        
        .hidden { display: none !important; }

        .highlight-ella .bubble-ella-quest { background: #fff1f2 !important; border-color: #e11d48 !important; transform: scale(1.02); }
        .highlight-user .bubble-user-ans { background: #eff6ff !important; border-color: #2563eb !important; transform: scale(1.02); }
    </style>
</head>
<body onload="initGame()">

    <div class="game-card" id="main-card">
        <!-- Start Screen -->
        <div id="start-overlay" class="overlay">
            <div class="start-content-box">
                <div class="mb-3 bg-red-100 p-3 rounded-full">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
                </div>
                <h1 class="text-2xl font-black text-white mb-1 tracking-tight text-center uppercase">Speak Viet Youtube and Movies</h1>
                <p id="ui-subtitle" class="text-red-400 font-bold text-xs mb-6 italic">Talk about content in Vietnamese 🎬</p>
                
                <div class="w-full mb-6 text-left">
                    <p id="ui-lang-label" class="text-[10px] font-black text-gray-500 uppercase mb-2 tracking-widest">CHỌN NGÔN NGỮ / LANGUAGE</p>
                    <div class="flex gap-2">
                        <button id="lang-en" onclick="setUserLanguage('en')" class="toggle-btn active">🇬🇧 EN</button>
                        <button id="lang-ru" onclick="setUserLanguage('ru')" class="toggle-btn">🇷🇺 RU</button>
                    </div>
                </div>

                <div class="bg-gray-800 p-4 rounded-xl mb-6 text-left w-full border border-gray-700">
                    <p id="ui-howtoplay-title" class="text-[10px] font-black text-red-400 mb-2 uppercase tracking-wider">HƯỚNG DẪN:</p>
                    <ul id="ui-howtoplay-list" class="text-[12px] text-gray-300 space-y-1.5 font-bold"></ul>
                </div>

                <button id="ui-start-btn" onclick="startGame()" class="w-full py-4 bg-red-600 text-white rounded-full font-black text-lg shadow-lg hover:bg-red-700 active:scale-95 transition-all uppercase">Bắt đầu ngay</button>
            </div>
        </div>

        <!-- Header -->
        <div id="game-header">
            <div class="flex items-center gap-3">
                <div class="flex flex-col">
                    <h1 id="ui-header-title" class="text-[10px] font-black text-red-500 uppercase tracking-widest">YOUTUBE & MOVIES</h1>
                    <div class="flex items-center gap-2">
                        <button id="btn-prev-round" onclick="prevRound()" class="nav-round-btn">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                        </button>
                        <h2 id="round-title" class="text-sm font-black text-white w-24 text-center">Câu 1/9</h2>
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
                <div class="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div id="progress-bar" class="h-full bg-red-500 transition-all duration-700" style="width: 11%"></div>
                </div>
            </div>
        </div>

        <div class="scene-container" id="game-scene">
            <div id="bubble-area" class="bubble-container"></div>
            <div id="drag-container" class="mt-auto p-6 bg-slate-900/80 backdrop-blur-lg border-t border-white/10 flex justify-center gap-8 hidden"></div>
        </div>

        <!-- Win Overlay -->
        <div id="win-overlay" class="overlay hidden">
            <div class="bg-slate-800 p-10 rounded-[3rem] shadow-2xl text-center border border-slate-700">
                <div class="text-7xl mb-6">🏆</div>
                <h2 id="ui-win-title" class="text-4xl font-black mb-4 text-red-500 uppercase">XUẤT SẮC!</h2>
                <p id="ui-win-msg" class="text-gray-400 mb-8 font-bold text-lg leading-relaxed">Bạn đã hoàn thành bài học về YouTube & Phim ảnh.</p>
                <button id="ui-replay-btn" onclick="location.reload()" class="px-12 py-5 bg-red-600 text-white rounded-full font-black text-xl shadow-xl hover:bg-red-700">CHƠI LẠI</button>
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
                subtitle: "Talk about content in Vietnamese 🎬",
                langLabel: "LANGUAGE",
                howToPlayTitle: "HOW TO PLAY:",
                howToPlayList: [
                    "1. Listen to questions about YouTube/Movies.",
                    "2. Drag correct answers or type details.",
                    "3. Practice speaking out loud!"
                ],
                startBtn: "WATCH NOW",
                headerTitle: "YOUTUBE & MOVIES",
                continueBtn: "CONTINUE",
                listenAllLabel: "LISTEN AGAIN",
                pauseLabel: "PAUSE",
                reviewTitle: "REVIEW DIALOGUE",
                finishBtn: "FINISH",
                winTitle: "OSCAR WINNER!",
                winMsg: "You have mastered the conversation.",
                replayBtn: "REPLAY",
                placeholder: "Type here...",
                hintLabel: "Hint:",
                dragLabel: "Answer:"
            },
            ru: {
                subtitle: "Общайтесь о контенте на вьетнамском 🎬",
                langLabel: "ЯЗЫК",
                howToPlayTitle: "КАК ИГРАТЬ:",
                howToPlayList: [
                    "1. Слушайте вопросы о YouTube/фильмах.",
                    "2. Перетаскивайте или печатайте ответы.",
                    "3. Практикуйте произношение вслух!"
                ],
                startBtn: "СМОТРЕТЬ",
                headerTitle: "YOUTUBE И КИНО",
                continueBtn: "ДАЛЕЕ",
                listenAllLabel: "СЛУШАТЬ СНОВА",
                pauseLabel: "ПАУЗА",
                reviewTitle: "ОБЗОР ДИАЛОГА",
                finishBtn: "ЗАВЕРШИТЬ",
                winTitle: "ПОБЕДИТЕЛЬ!",
                winMsg: "Вы успешно освоили тему giải trí.",
                replayBtn: "ИГРАТЬ СНОВА",
                placeholder: "Введите здесь...",
                hintLabel: "Подсказка:",
                dragLabel: "Ответ:"
            }
        };

        const roundConfig = [
            { 
                q: "Bạn có hay xem YouTube không?", 
                qSub: { en: "Do you often watch YouTube?", ru: "Ты часто смотришь YouTube?" }, 
                type: "drag",
                choices: [
                    { vi: "Có, mình xem mỗi ngày.", en: "Yes, I watch every day.", ru: "Да, смотрю каждый ngày." },
                    { vi: "Không, mình bận quá.", en: "No, I am too busy.", ru: "Нет, я слишком занят." }
                ]
            },
            { 
                q: "Bạn xem YouTube mấy tiếng một ngày?", 
                qSub: { en: "How many hours a day do you watch YouTube?", ru: "Сколько часов в день ты смотришь YouTube?" }, 
                prefix: "Mình xem khoảng", 
                prefixSub: { en: "I watch about", ru: "Я смотрю около" },
                suffix: "một ngày.", 
                suffixSub: { en: "a day.", ru: "в день." },
                hint: { en: "2 hours", ru: "2 часа" } 
            },
            { 
                q: "Bạn thường xem gì trên YouTube?", 
                qSub: { en: "What do you usually watch on YouTube?", ru: "Что ты обычно смотришь на YouTube?" }, 
                prefix: "Mình hay xem", 
                prefixSub: { en: "I often watch", ru: "Я часто смотрю" },
                suffix: "trên đó.", 
                suffixSub: { en: "on there.", ru: "там." },
                hint: { en: "vlogs and music videos", ru: "vlog и музыкальные клипы" } 
            },
            { 
                q: "Bạn có học kỹ năng gì trên YouTube không?", 
                qSub: { en: "Do you learn any skills on YouTube?", ru: "Ты изучаешь какие-нибудь навыки на YouTube?" }, 
                prefix: "Có, mình đang học", 
                prefixSub: { en: "Yes, I am learning", ru: "Да, я учусь" },
                suffix: "qua YouTube.", 
                suffixSub: { en: "via YouTube.", ru: "через YouTube." },
                hint: { en: "cooking and coding", ru: "готовке и программированию" } 
            },
            { 
                q: "Bạn có thích xem phim không?", 
                qSub: { en: "Do you like watching movies?", ru: "Ты любишь смотреть фильмы?" }, 
                type: "drag",
                choices: [
                    { vi: "Mình cực kỳ thích phim ảnh.", en: "I really love movies.", ru: "Я очень люблю кино." },
                    { vi: "Mình bình thường thôi.", en: "I'm neutral/okay with it.", ru: "Мне нормально/так себе." }
                ]
            },
            { 
                q: "Bạn thích xem thể loại phim gì?", 
                qSub: { en: "What kind of movies do you like?", ru: "Какие жанры фильмов тебе нравятся?" }, 
                prefix: "Mình rất thích phim", 
                prefixSub: { en: "I really like movies about", ru: "Мне очень нравятся фильмы" },
                suffix: "", 
                suffixSub: { en: "", ru: "" },
                hint: { en: "action and romance", ru: "боевики и романтика" } 
            },
            { 
                q: "Bạn thường xem phim ở rạp hay ở nhà?", 
                qSub: { en: "Do you usually watch movies at the cinema or at home?", ru: "Ты обычно смотришь фильмы в кинотеатре или дома?" }, 
                prefix: "Mình thường xem phim ở", 
                prefixSub: { en: "I usually watch movies at", ru: "Я обычно смотрю фильмы в" },
                suffix: "với bạn bè.", 
                suffixSub: { en: "with friends.", ru: "с друзьями." },
                hint: { en: "cinema", ru: "кинотеатре" } 
            },
            { 
                q: "Bộ phim yêu thích của bạn là gì?", 
                qSub: { en: "What is your favorite movie?", ru: "Какой твой любимый фильм?" }, 
                prefix: "Bộ phim mình thích nhất là", 
                prefixSub: { en: "The movie I like most is", ru: "Мой самый любимый фильм - это" },
                suffix: "", 
                suffixSub: { en: "", ru: "" },
                hint: { en: "The Godfather", ru: "Крестный отец" } 
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
            document.getElementById('ui-lang-label').innerText = userLang === 'ru' ? "CHỌN NGÔN NGỮ / ЯЗЫК" : "CHỌN NGÔN NGỮ / LANGUAGE";
            document.getElementById('ui-howtoplay-title').innerText = userLang === 'ru' ? "ИНСТРУКЦИЯ:" : "HƯỚNG DẪN:";
            document.getElementById('ui-start-btn').innerText = userLang === 'ru' ? "BẮT ĐẦU NGAY / ИГРАТЬ" : "BẮT ĐẦU NGAY / START";
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
                "https://images.unsplash.com/photo-1533750349088-cd871a92f312?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1200&q=80"
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
            const dragCont = document.getElementById('drag-container');
            const tools = document.getElementById('center-header-tools');
            area.innerHTML = '';
            tools.classList.add('hidden');
            dragCont.classList.add('hidden');
            document.getElementById('round-title').innerText = \`Câu \${currentRound + 1}/9\`;
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
                wrapper.innerHTML = \`<div class="drag-item" draggable="true" ondragstart="drag(event)" id="choice-\${idx}" data-vi="\${choice.vi}" data-sub="\${choice[userLang]}">\${choice.vi}</div><span class="text-[10px] text-gray-400 block text-center mt-1 font-bold">\${choice[userLang]}</span>\`;
                cont.appendChild(wrapper);
            });
        }

        function renderInputBox(wrap, config) {
            wrap.innerHTML = \`
                <div class="bubble bubble-user-ans">
                    <span class="main-text">\${config.prefix} 
                        <input type="text" id="round-input" class="inline-input" placeholder="..." onkeypress="if(event.key==='Enter') submitInput()">
                        <button onclick="submitInput()" class="send-btn inline-flex align-middle" id="submit-btn">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                        </button>
                        \${config.suffix}
                    </span>
                    <span class="sub-text">\${config.prefixSub[userLang]} [...] \${config.suffixSub[userLang]}</span>
                    <span class="hint-text">\${translations[userLang].hintLabel} \${config.hint[userLang]}</span>
                </div>
            \`;
        }

        function allowDrop(ev) { ev.preventDefault(); ev.target.style.borderColor = "#ef4444"; }
        function leaveDrop(ev) { ev.target.style.borderColor = "#cbd5e1"; }
        function drag(ev) { ev.dataTransfer.setData("text", ev.target.id); }

        async function drop(ev) {
            ev.preventDefault();
            const el = document.getElementById(ev.dataTransfer.getData("text"));
            const vi = el.getAttribute('data-vi');
            const sub = el.getAttribute('data-sub');
            history[currentRound] = { q: roundConfig[currentRound].q, qSub: roundConfig[currentRound].qSub[userLang], a: vi, aSub: sub };
            renderSavedAnswer(document.getElementById('user-bubble-wrapper'), vi, sub);
            document.getElementById('drag-container').classList.add('hidden');
            speak(vi);
        }

        async function submitInput() {
            const input = document.getElementById('round-input');
            const val = input.value.trim();
            if (!val) return;
            
            document.getElementById('submit-btn').disabled = true;
            input.disabled = true;

            const viVal = await translateFree(val, userLang, 'vi');
            const cfg = roundConfig[currentRound];
            const fullVi = \`\${cfg.prefix} \${viVal} \${cfg.suffix}\`.trim().replace(/\\s+/g, ' ');
            const fullSub = await translateFree(fullVi, 'vi', userLang);

            history[currentRound] = { q: cfg.q, qSub: cfg.qSub[userLang], a: fullVi, aSub: fullSub };
            renderSavedAnswer(document.getElementById('user-bubble-wrapper'), fullVi, fullSub);
            speak(fullVi);
        }

        function loadReviewRound() {
            const area = document.getElementById('bubble-area');
            area.innerHTML = '';
            document.getElementById('center-header-tools').classList.remove('hidden');
            document.getElementById('round-title').innerText = translations[userLang].reviewTitle;
            document.getElementById('continue-btn').innerHTML = "FINISH ✅";

            history.forEach((h, i) => {
                const qW = document.createElement('div');
                qW.className = 'bubble-wrapper';
                qW.id = \`rev-q-\${i}\`;
                qW.innerHTML = \`<div class="speaker-btn ella-voice-btn" onclick="speak('\${h.q.replace(/'/g, "\\\\'")}')"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M11 5L6 9H2v6h4l5 4V5z"></path></svg></div><div class="bubble bubble-ella-quest"><span class="main-text">\${h.q}</span><span class="sub-text">\${h.qSub}</span></div>\`;
                area.appendChild(qW);

                const aW = document.createElement('div');
                aW.className = 'bubble-wrapper justify-end';
                aW.id = \`rev-a-\${i}\`;
                aW.innerHTML = \`<div class="bubble bubble-user-ans"><span class="main-text">\${h.a}</span><span class="sub-text">\${h.aSub}</span></div><div class="speaker-btn user-voice-btn" onclick="speak('\${h.a.replace(/'/g, "\\\\'")}')"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M11 5L6 9H2v6h4l5 4V5z"></path></svg></div>\`;
                area.appendChild(aW);
            });
        }

        async function handleListenAllClick() {
             if (roundConfig[currentRound].type === "review") {
                if (isReviewRunning) { 
                    stopReviewRequested = true; 
                    if (currentGoogleAudio) currentGoogleAudio.pause();
                    isReviewRunning = false; 
                    updateListenBtnUI();
                    return; 
                }
                
                isReviewRunning = true;
                stopReviewRequested = false;
                updateListenBtnUI();

                for (let i = 0; i < history.length; i++) {
                    if (stopReviewRequested) break;
                    const q = document.getElementById(\`rev-q-\${i}\`);
                    const a = document.getElementById(\`rev-a-\${i}\`);
                    
                    if (q) {
                        q.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        q.classList.add('highlight-ella');
                    }
                    await speak(history[i].q);
                    await new Promise(r => setTimeout(r, 600));
                    if (q) q.classList.remove('highlight-ella');
                    
                    if (stopReviewRequested) break;

                    if (a) {
                        a.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        a.classList.add('highlight-user');
                    }
                    await speak(history[i].a);
                    await new Promise(r => setTimeout(r, 1000));
                    if (a) a.classList.remove('highlight-user');
                }
                isReviewRunning = false;
                updateListenBtnUI();
            } else {
                const item = history[currentRound];
                if (item) {
                    await speak(item.q);
                    await new Promise(r => setTimeout(r, 600));
                    await speak(item.a);
                }
            }
        }

        function goForward() {
            if (currentRound < roundConfig.length - 1) { currentRound++; loadRound(); }
            else { 
                document.getElementById('win-overlay').classList.remove('hidden');
                confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
            }
        }

        function nextRound() { if (currentRound < roundConfig.length - 1 && history[currentRound]) { currentRound++; loadRound(); } }
        function prevRound() { if (currentRound > 0) { currentRound--; loadRound(); } }
    </script>
</body>
</html>
`;

export const GameSpeakingMovies: React.FC = () => {
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
                    title="Speaking Challenge - Youtube and Movies"
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

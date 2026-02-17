
import React, { useState, useEffect, useRef } from 'react';
import { Maximize, Minimize } from 'lucide-react';

const gameHTML = `
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SPEAK VIET : AI</title>
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
            background-color: #f1f5f9;
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
            padding: 32px;
            border-radius: 2rem;
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
            border-bottom: 1px solid #e2e8f0;
            padding: 0.8rem 1.5rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            z-index: 100;
        }

        .nav-round-btn {
            background: #f1f5f9;
            color: #64748b;
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
        
        .ella-voice-btn { background: #8b5cf6; box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3); }
        .user-voice-btn { background: #0ea5e9; box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3); }

        .bubble {
            padding: 1.2rem 1.5rem;
            border-radius: 1.5rem;
            max-width: 85%;
            box-shadow: 0 10px 25px rgba(0,0,0,0.05);
            background: rgba(255, 255, 255, 0.98);
            border: 1px solid rgba(255,255,255,0.5);
        }

        .bubble-ella-quest { border-left: 6px solid #8b5cf6; }
        .bubble-user-ans { border-right: 6px solid #0ea5e9; }

        .main-text { font-size: 1.2rem; font-weight: 800; margin-bottom: 6px; display: block; color: #1e293b; }
        .sub-text { font-size: 0.9rem; font-weight: 600; color: #64748b; display: block; border-top: 1px solid #f1f5f9; padding-top: 6px; margin-top: 4px; font-style: italic; }
        
        .hint-text { font-size: 0.75rem; font-weight: 700; color: #94a3b8; display: block; margin-top: 8px; text-transform: uppercase; }

        .drop-zone {
            display: inline-block;
            min-width: 140px;
            height: 36px;
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
            padding: 10px 16px;
            border-radius: 12px;
            cursor: grab;
            font-weight: 700;
            box-shadow: 0 4px 10px rgba(59, 130, 246, 0.1);
        }

        .inline-input {
            border: none;
            border-bottom: 3px solid #0ea5e9;
            background: transparent;
            outline: none;
            font-weight: 800;
            color: #0ea5e9;
            padding: 0 8px;
            width: 140px;
            text-align: center;
        }

        .send-btn {
            background: #0ea5e9;
            color: white;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: 0.2s;
            border: none;
        }

        .toggle-btn { flex: 1; padding: 10px; border-radius: 12px; font-weight: 700; background: #f1f5f9; color: #64748b; transition: 0.3s; }
        .toggle-btn.active { background: #3b82f6; color: white; }
        
        .hidden { display: none !important; }

        .highlight-ella .bubble-ella-quest { background: #f5f3ff !important; border-color: #8b5cf6 !important; transform: scale(1.02); }
        .highlight-user .bubble-user-ans { background: #f0f9ff !important; border-color: #0ea5e9 !important; transform: scale(1.02); }
    </style>
</head>
<body onload="initGame()">

    <div class="game-card" id="main-card">
        <!-- Start Screen -->
        <div id="start-overlay" class="overlay">
            <div class="start-content-box">
                <div class="mb-4 bg-blue-100 p-4 rounded-full">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2.5"><path d="M12 2a10 10 0 1 0 10 10H12V2z"/><path d="M12 2a10 10 0 0 1 10 10h-2a8 8 0 0 0-8-8V2z"/><circle cx="12" cy="12" r="3"/></svg>
                </div>
                <h1 class="text-3xl font-black text-blue-900 mb-1 tracking-tight">SPEAK VIET : AI</h1>
                <p id="ui-subtitle" class="text-blue-600 font-bold text-sm mb-8 italic">Luyện hội thoại về Trí tuệ nhân tạo 🤖</p>
                
                <div class="w-full mb-6">
                    <p id="ui-lang-label" class="text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest text-left">CHỌN NGÔN NGỮ DỊCH</p>
                    <div class="flex gap-2">
                        <button id="lang-en" onclick="setUserLanguage('en')" class="toggle-btn active">🇬🇧 ENGLISH</button>
                        <button id="lang-ru" onclick="setUserLanguage('ru')" class="toggle-btn">🇷🇺 RUSSIAN</button>
                    </div>
                </div>

                <div class="bg-slate-50 p-5 rounded-xl mb-8 text-left w-full border border-slate-100">
                    <p id="ui-howtoplay-title" class="text-[10px] font-black text-slate-800 mb-3 uppercase tracking-wider">CÁCH CHƠI:</p>
                    <ul id="ui-howtoplay-list" class="text-[13px] text-slate-600 space-y-2 font-bold leading-snug"></ul>
                </div>

                <button id="ui-start-btn" onclick="startGame()" class="w-full py-4 bg-blue-600 text-white rounded-full font-black text-lg shadow-xl hover:bg-blue-700 active:scale-95 transition-all">BẮT ĐẦU NGAY</button>
            </div>
        </div>

        <!-- Header -->
        <div id="game-header">
            <div class="flex items-center gap-3">
                <div class="flex flex-col">
                    <h1 id="ui-header-title" class="text-[10px] font-black text-blue-500 uppercase tracking-widest">AI CONVERSATION</h1>
                    <div class="flex items-center gap-2">
                        <button id="btn-prev-round" onclick="prevRound()" class="nav-round-btn">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="15 18 9 12 15 6"></polyline></svg>
                        </button>
                        <h2 id="round-title" class="text-sm font-black text-gray-800 w-24 text-center">Round 1/9</h2>
                        <button id="btn-next-round" onclick="nextRound()" class="nav-round-btn">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="9 18 15 12 9 6"></polyline></svg>
                        </button>
                    </div>
                </div>
            </div>
            
            <div id="center-header-tools" class="hidden flex items-center gap-2">
                <button id="listen-all-round-btn" onclick="handleListenAllClick()" class="bg-amber-500 text-white px-5 py-2.5 rounded-full text-[10px] font-black shadow-lg flex items-center gap-2 uppercase">
                    <span id="listen-icon">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M11 5L6 9H2v6h4l5 4V5z"></path></svg>
                    </span>
                    <span id="listen-text">NGHE TẤT CẢ</span>
                </button>
                <button id="continue-btn" onclick="goForward()" class="bg-emerald-500 text-white px-6 py-2.5 rounded-full text-xs font-black shadow-lg flex items-center gap-2 uppercase tracking-widest">
                    TIẾP TỤC 
                </button>
            </div>

            <div class="flex items-center gap-2">
                <div class="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div id="progress-bar" class="h-full bg-blue-500 transition-all duration-700" style="width: 10%"></div>
                </div>
            </div>
        </div>

        <div class="scene-container" id="game-scene">
            <div id="bubble-area" class="bubble-container"></div>
            <div id="drag-container" class="mt-auto p-6 bg-white/90 backdrop-blur-lg border-t border-slate-100 flex justify-center gap-6 hidden"></div>
        </div>

        <!-- Win Overlay -->
        <div id="win-overlay" class="overlay hidden">
            <div class="bg-white p-10 rounded-[3rem] shadow-2xl text-center">
                <div class="text-7xl mb-6">🤖</div>
                <h2 id="ui-win-title" class="text-4xl font-black mb-4 text-blue-600 uppercase">XUẤT SẮC!</h2>
                <p id="ui-win-msg" class="text-gray-500 mb-8 font-bold text-lg">Bạn đã hoàn thành bài hội thoại về AI.</p>
                <button id="ui-replay-btn" onclick="location.reload()" class="px-12 py-5 bg-blue-600 text-white rounded-full font-black text-xl shadow-xl hover:bg-blue-700">CHƠI LẠI</button>
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
                subtitle: "Master AI talks in Vietnamese 🤖",
                langLabel: "TRANSLATION LANGUAGE",
                howToPlayTitle: "HOW TO PLAY:",
                howToPlayList: [
                    "1. Answer Ella's questions about AI in Vietnamese.",
                    "2. Drag choices or Type your answers to practice.",
                    "3. Review and listen to the full dialogue at the end."
                ],
                startBtn: "START NOW",
                headerTitle: "AI CONVERSATION",
                continueBtn: "CONTINUE",
                listenAllLabel: "LISTEN AGAIN",
                pauseLabel: "PAUSE",
                reviewTitle: "REVIEW DIALOGUE",
                finishBtn: "FINISH",
                winTitle: "EXCELLENT!",
                winMsg: "You've mastered the AI conversation.",
                replayBtn: "PLAY AGAIN",
                hintLabel: "Hint:",
                dragLabel: "Select answer:"
            },
            ru: {
                subtitle: "Беседы об ИИ на вьетнамском 🤖",
                langLabel: "ЯЗЫК ПЕРЕВОДА",
                howToPlayTitle: "КАК ИГРАТЬ:",
                howToPlayList: [
                    "1. Отвечайте на вопросы Эллы об ИИ на вьетнамском языке.",
                    "2. Перетаскивайте варианты или пишите ответы для практики.",
                    "3. Повторите и прослушайте весь диалог в конце."
                ],
                startBtn: "ИГРАТЬ",
                headerTitle: "РАЗГОВОР ОБ ИИ",
                continueBtn: "ДАЛЕЕ",
                listenAllLabel: "СЛУШАТЬ СНОВА",
                pauseLabel: "ПАУЗА",
                reviewTitle: "ОБЗОР ДИАЛОГА",
                finishBtn: "ЗАВЕРШИТЬ",
                winTitle: "ОТЛИЧНО!",
                winMsg: "Вы успешно завершили беседу об ИИ.",
                replayBtn: "ИГРАТЬ СНОВА",
                hintLabel: "Подсказка:",
                dragLabel: "Выберите ответ:"
            }
        };

        const roundConfig = [
            { 
                q: "Bạn có hay dùng AI không?", 
                qSub: { en: "Do you often use AI?", ru: "Ты часто используешь ИИ?" }, 
                type: "drag",
                choices: [
                    { vi: "Có, mình dùng mỗi ngày.", en: "Yes, I use it every day.", ru: "Да, я использую его каждый день." },
                    { vi: "Mình thỉnh thoảng mới dùng.", en: "I only use it sometimes.", ru: "Я использую его лишь иногда." }
                ]
            },
            { 
                q: "Bạn bắt đầu dùng AI từ năm nào?", 
                qSub: { en: "What year did you start using AI?", ru: "С какого года ты начал пользоваться ИИ?" }, 
                prefix: "Mình bắt đầu dùng AI từ năm", 
                prefixSub: { en: "I started using AI in", ru: "Я начал использовать ИИ в" },
                suffix: "", 
                suffixSub: { en: "", ru: "" },
                hint: { en: "2023", ru: "2023" } 
            },
            { 
                q: "Bạn thường dùng công cụ AI nào?", 
                qSub: { en: "Which AI tools do you usually use?", ru: "Какими инструментами ИИ ты обычно пользуешься?" }, 
                prefix: "Mình thường dùng", 
                prefixSub: { en: "I usually use", ru: "Я обычно использую" },
                suffix: "", 
                suffixSub: { en: "", ru: "" },
                hint: { en: "ChatGPT and Midjourney", ru: "ChatGPT и Midjourney" } 
            },
            { 
                q: "Bạn dùng AI cho học tập hay công việc?", 
                qSub: { en: "Do you use AI for studying or for work?", ru: "Ты используешь ИИ для учёбы или работы?" }, 
                prefix: "Mình dùng AI cho", 
                prefixSub: { en: "I use AI for", ru: "Я использую ИИ для" },
                suffix: "", 
                suffixSub: { en: "", ru: "" },
                hint: { en: "both work and study", ru: "как для работы, так и для учебы" } 
            },
            { 
                q: "Bạn thấy AI hữu ích như thế nào?", 
                qSub: { en: "How useful do you find AI?", ru: "Насколько полезен для тебя ИИ?" }, 
                prefix: "Mình thấy AI", 
                prefixSub: { en: "I find AI", ru: "Я нахожу ИИ" },
                suffix: "lắm", 
                suffixSub: { en: "very", ru: "очень" },
                hint: { en: "extremely smart and helpful", ru: "чрезвычайно умным и полезным" } 
            },
            { 
                q: "Bạn dùng AI mấy tiếng một ngày?", 
                qSub: { en: "How many hours a day do you use AI?", ru: "Сколько часов в день ты используешь ИИ?" }, 
                prefix: "Mỗi ngày mình dùng AI khoảng", 
                prefixSub: { en: "Every day I use AI for about", ru: "Каждый день я использую ИИ около" },
                suffix: "tiếng", 
                suffixSub: { en: "hours", ru: "часов" },
                hint: { en: "2 hours", ru: "2 часа" } 
            },
            { 
                q: "AI có giúp bạn thông minh hơn không?", 
                qSub: { en: "Does AI help you become smarter?", ru: "Помогает ли ИИ тебе стать умнее?" }, 
                prefix: "Có chứ, nó giúp mình", 
                prefixSub: { en: "Of course, it helps me", ru: "Конечно, это помогает мне" },
                suffix: "", 
                suffixSub: { en: "", ru: "" },
                hint: { en: "learn everything faster", ru: "учиться всему быстрее" } 
            },
            { 
                q: "Bạn nghĩ AI sẽ phát triển như thế nào trong tương lai?", 
                qSub: { en: "How do you think AI will develop in the future?", ru: "Как ты думаешь, как ИИ будет развиваться в будущем?" }, 
                prefix: "Mình nghĩ tương lai AI sẽ", 
                prefixSub: { en: "I think in the future AI will", ru: "Я думаю, что в будущем ИИ будет" },
                suffix: "", 
                suffixSub: { en: "", ru: "" },
                hint: { en: "become very powerful", ru: "стать очень мощным" } 
            },
            { type: "review" }
        ];

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
                iconCont.innerHTML = \`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>\`;
            } else {
                textCont.innerText = t.listenAllLabel;
                iconCont.innerHTML = \`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M11 5L6 9H2v6h4l5 4V5z"/></svg>\`;
            }
        }

        function updateBackground() {
            const bgs = [
                "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1620712943543-bcc4638ef808?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80"
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
            stopReview();
            updateBackground();
            const config = roundConfig[currentRound];
            const area = document.getElementById('bubble-area');
            const dragCont = document.getElementById('drag-container');
            const tools = document.getElementById('center-header-tools');
            area.innerHTML = '';
            tools.classList.add('hidden');
            dragCont.classList.add('hidden');
            document.getElementById('round-title').innerText = \`Round \${currentRound + 1}/9\`;
            document.getElementById('progress-bar').style.width = \`\${((currentRound+1)/9)*100}%\`;
            document.getElementById('btn-prev-round').disabled = (currentRound === 0);
            document.getElementById('btn-next-round').disabled = (currentRound === 8);

            if (config.type === "review") { loadReviewRound(); return; }

            // Ella Question
            const ellaWrap = document.createElement('div');
            ellaWrap.className = 'bubble-wrapper';
            ellaWrap.innerHTML = \`
                <div class="speaker-btn ella-voice-btn" onclick="speak('\${config.q.replace(/'/g, "\\\\'")}')">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M11 5L6 9H2v6h4l5 4V5z"/></svg>
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
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M11 5L6 9H2v6h4l5 4V5z"/></svg>
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
                        <input type="text" id="round-input" class="inline-input" placeholder="..." onkeypress="if(event.key==='Enter') submitTyping()">
                        \${config.suffix}
                        <button onclick="submitTyping()" class="send-btn inline-flex items-center justify-center ml-2" id="submit-btn">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="22 2 11 13 2 9 22 2"/></svg>
                        </button>
                    </span>
                    <span class="sub-text" id="init-sub">\${config.prefixSub[userLang]} [...] \${config.suffixSub[userLang]}</span>
                    <span class="hint-text">\${translations[userLang].hintLabel} \${config.hint[userLang]}</span>
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
            history[currentRound] = { q: roundConfig[currentRound].q, a: viText, aSub: subText, qSub: roundConfig[currentRound].qSub[userLang] };
            renderSavedAnswer(document.getElementById('user-bubble-wrapper'), viText, subText);
            speak(viText);
        }

        async function submitTyping() {
            const val = document.getElementById('round-input').value.trim();
            if (!val) return;
            document.getElementById('submit-btn').disabled = true;
            const config = roundConfig[currentRound];
            const viFragment = await translateFree(val, userLang, 'vi');
            const fullSent = \`\${config.prefix} \${viFragment} \${config.suffix}\`.replace(/\\s+/g, ' ').trim();
            const fullSub = await translateFree(fullSent, 'vi', userLang);
            history[currentRound] = { q: config.q, a: fullSent, aSub: fullSub, qSub: config.qSub[userLang] };
            renderSavedAnswer(document.getElementById('user-bubble-wrapper'), fullSent, fullSub);
            speak(fullSent);
        }

        function loadReviewRound() {
            const area = document.getElementById('bubble-area');
            document.getElementById('round-title').innerText = translations[userLang].reviewTitle;
            document.getElementById('continue-btn').innerHTML = \`\${translations[userLang].finishBtn} ✔\`;
            document.getElementById('center-header-tools').classList.remove('hidden');
            area.innerHTML = '';
            history.forEach((item, idx) => {
                area.innerHTML += \`
                    <div class="bubble-wrapper review-row" id="review-ella-\${idx}">
                        <div class="speaker-btn ella-voice-btn" onclick="speak('\${item.q.replace(/'/g, "\\\\'")}')">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M11 5L6 9H2v6h4l5 4V5z"/></svg>
                        </div>
                        <div class="bubble bubble-ella-quest">
                            <span class="main-text">\${item.q}</span>
                            <span class="sub-text">\${item.qSub}</span>
                        </div>
                    </div>
                    <div class="bubble-wrapper justify-end review-row" id="review-user-\${idx}">
                        <div class="bubble bubble-user-ans">
                            <span class="main-text">\${item.a}</span>
                            <span class="sub-text">\${item.aSub}</span>
                        </div>
                        <div class="speaker-btn user-voice-btn" onclick="speak('\${item.a.replace(/'/g, "\\\\'")}')">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M11 5L6 9H2v6h4l5 4V5z"/></svg>
                        </div>
                    </div>
                \`;
            });
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
                highlightRow(\`review-ella-\${i}\`, true);
                await speak(history[i].q);
                await new Promise(r => setTimeout(r, 600));
                highlightRow(\`review-ella-\${i}\`, false);
                if (stopReviewRequested) break;
                highlightRow(\`review-user-\${i}\`, true);
                await speak(history[i].a);
                await new Promise(r => setTimeout(r, 1000));
                highlightRow(\`review-user-\${i}\`, false);
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

        function highlightRow(id, active) {
            const el = document.getElementById(id);
            if (!el) return;
            el.classList.toggle(id.includes('ella') ? 'highlight-ella' : 'highlight-user', active);
            if (active) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        function initGame() { updateUILanguage(); updateBackground(); }
        function goForward() { currentRound < roundConfig.length - 1 ? (currentRound++, loadRound()) : showWin(); }
        function prevRound() { if (currentRound > 0) { currentRound--; loadRound(); } }
        function nextRound() { if (currentRound < 8 && history[currentRound]) { currentRound++; loadRound(); } }
        function showWin() { document.getElementById('win-overlay').classList.remove('hidden'); confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } }); }
    </script>
</body>
</html>
`;

export const GameSpeakingAI: React.FC = () => {
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
                    title="Speaking Challenge - Artificial Intelligence (AI)"
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


import React, { useState, useEffect, useRef } from 'react';
import { Maximize, Minimize } from 'lucide-react';

const gameHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SPEAK VIET : MUSIC</title>
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
            background: rgba(15, 23, 42, 0.7);
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
            background: white;
            padding: 32px;
            border-radius: 2.5rem;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            display: flex;
            flex-direction: column;
            align-items: center;
            max-width: 420px; 
            width: 100%;
        }

        #game-header {
            flex-shrink: 0;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-bottom: 1px solid #e2e8f0;
            padding: 0.6rem 1rem;
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
            flex-shrink: 0;
        }
        .nav-round-btn:hover:not(:disabled) {
            background: #8b5cf6;
            color: white;
        }
        .nav-round-btn:disabled { opacity: 0.2; cursor: not-allowed; }

        .scene-container {
            flex: 1;
            overflow-y: auto; 
            display: flex;
            flex-direction: column;
            position: relative;
            padding-bottom: 100px;
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
            animation: fadeIn 0.4s ease-out forwards;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .speaker-btn {
            background: #8b5cf6;
            color: white;
            width: 44px;
            height: 44px;
            border-radius: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
            transition: 0.2s;
            flex-shrink: 0;
        }
        .speaker-btn:hover { transform: scale(1.08); }
        .user-voice-btn { background: #0ea5e9; box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3); }

        .bubble {
            padding: 1.2rem 1.5rem;
            border-radius: 1.8rem;
            max-width: 85%;
            box-shadow: 0 10px 25px rgba(0,0,0,0.05);
            background: rgba(255, 255, 255, 0.98);
            position: relative;
        }

        .bubble-ella-quest { border-left: 6px solid #8b5cf6; }
        .bubble-user-ans { border-right: 6px solid #0ea5e9; }

        .main-text { font-size: 1.2rem; font-weight: 800; margin-bottom: 4px; display: block; color: #1e293b; }
        .sub-text { font-size: 0.9rem; font-weight: 600; color: #64748b; display: block; border-top: 1px solid #f1f5f9; padding-top: 4px; margin-top: 4px; }
        
        .hint-text { font-size: 0.75rem; font-weight: 700; color: #94a3b8; display: block; margin-top: 8px; text-transform: uppercase; }

        .drop-zone {
            display: inline-block;
            min-width: 140px;
            height: 36px;
            border-bottom: 3px dashed #cbd5e1;
            margin: 0 4px;
            vertical-align: middle;
            background: rgba(241, 245, 249, 0.5);
            border-radius: 8px;
        }
        
        .drag-item {
            background: white;
            border: 2px solid #8b5cf6;
            color: #6d28d9;
            padding: 10px 18px;
            border-radius: 12px;
            cursor: grab;
            font-weight: 700;
            box-shadow: 0 4px 10px rgba(139, 92, 246, 0.1);
        }

        .inline-input {
            border: none;
            border-bottom: 3px solid #0ea5e9;
            background: transparent;
            outline: none;
            font-weight: 800;
            color: #0ea5e9;
            padding: 0 5px;
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

        .toggle-btn { flex: 1; padding: 10px; border-radius: 12px; font-weight: 700; background: #f1f5f9; color: #64748b; }
        .toggle-btn.active { background: #8b5cf6; color: white; }
        
        .hidden { display: none !important; }

        .highlight-ella .bubble-ella-quest { background: #f5f3ff !important; border-color: #8b5cf6 !important; transform: scale(1.02); }
        .highlight-user .bubble-user-ans { background: #f0f9ff !important; border-color: #0ea5e9 !important; transform: scale(1.02); }

        .how-to-play {
            width: 100%;
            text-align: left;
            background: #f8fafc;
            padding: 1rem;
            border-radius: 1rem;
            margin-bottom: 1.5rem;
            border: 1px solid #e2e8f0;
        }
        .how-to-play-title {
            font-size: 0.7rem;
            font-weight: 900;
            color: #94a3b8;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 0.5rem;
            display: flex;
            align-items: center;
            gap: 4px;
        }
        .how-to-play-item {
            font-size: 0.8rem;
            font-weight: 600;
            color: #475569;
            margin-bottom: 4px;
            display: flex;
            align-items: flex-start;
            gap: 8px;
        }
        .how-to-play-icon { color: #8b5cf6; margin-top: 2px; }
    </style>
</head>
<body onload="initGame()">

    <div class="game-card" id="main-card">
        <div id="start-overlay" class="overlay">
            <div class="start-content-box">
                <div class="mb-4 bg-purple-100 p-4 rounded-full">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2.5"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>
                </div>
                <h1 class="text-3xl font-black text-gray-900 mb-1">MUSIC QUIZ</h1>
                <p id="ui-subtitle" class="text-purple-600 font-bold text-sm mb-4">Talk about music in Vietnamese 🎵</p>
                
                <div class="how-to-play">
                    <div class="how-to-play-title">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                        How to Play
                    </div>
                    <div class="how-to-play-item">
                        <span class="how-to-play-icon">✦</span>
                        <span id="htp-1">Listen to Ella's question in Vietnamese.</span>
                    </div>
                    <div class="how-to-play-item">
                        <span class="how-to-play-icon">✦</span>
                        <span id="htp-2">Drag the correct answer or type your response.</span>
                    </div>
                    <div class="how-to-play-item">
                        <span class="how-to-play-icon">✦</span>
                        <span id="htp-3">Review the full dialogue at the end.</span>
                    </div>
                </div>

                <div class="w-full mb-6">
                    <p id="ui-lang-label" class="text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest text-left">HỌC BẰNG NGÔN NGỮ:</p>
                    <div class="flex gap-2">
                        <button id="lang-en" onclick="setUserLanguage('en')" class="toggle-btn active">🇬🇧 ENGLISH</button>
                        <button id="lang-ru" onclick="setUserLanguage('ru')" class="toggle-btn">🇷🇺 RUSSIAN</button>
                    </div>
                </div>

                <button id="ui-start-btn" onclick="startGame()" class="w-full py-4 bg-purple-600 text-white rounded-full font-black text-lg shadow-lg hover:bg-purple-700 transition-all">BẮT ĐẦU</button>
            </div>
        </div>

        <div id="game-header">
            <div class="flex items-center gap-1">
                <button id="btn-prev-round" onclick="prevRound()" class="nav-round-btn">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="15 18 9 12 15 6"></polyline></svg>
                </button>
                <div class="flex items-center justify-center min-w-[32px]">
                    <span id="round-title" class="text-sm font-black text-gray-800">R1/9</span>
                </div>
                <button id="btn-next-round" onclick="nextRound()" class="nav-round-btn">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </button>
            </div>
            
            <div id="center-header-tools" class="hidden flex items-center gap-1.5 ml-auto">
                <button id="listen-all-round-btn" onclick="handleListenAllClick()" class="bg-amber-500 text-white px-3 py-2 rounded-full text-[9px] font-black shadow-lg hover:bg-amber-600 flex items-center gap-1 uppercase">
                    <span id="listen-icon"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M11 5L6 9H2v6h4l5 4V5z"></path></svg></span>
                    <span id="listen-text">LISTEN</span>
                </button>
                <button id="continue-btn" onclick="goForward()" class="bg-emerald-500 text-white px-4 py-2 rounded-full text-[9px] font-black shadow-lg hover:bg-emerald-600 uppercase">
                    CONTINUE 
                </button>
            </div>

            <div class="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden ml-3 flex-shrink-0">
                <div id="progress-bar" class="h-full bg-purple-500 transition-all duration-700" style="width: 10%"></div>
            </div>
        </div>

        <div class="scene-container" id="game-scene">
            <div id="bubble-area" class="bubble-container"></div>
            <div id="drag-container" class="mt-auto p-6 bg-white/90 backdrop-blur-md border-t border-slate-200 flex flex-wrap justify-center gap-4 hidden"></div>
        </div>

        <div id="win-overlay" class="overlay hidden">
            <div class="bg-white p-12 rounded-[3rem] shadow-2xl text-center">
                <div class="text-7xl mb-6">🎸</div>
                <h2 class="text-4xl font-black mb-4 text-purple-600 uppercase">TUYỆT VỜI!</h2>
                <p class="text-gray-500 mb-8 font-bold text-lg">Bạn đã hoàn thành chủ đề Âm Nhạc.</p>
                <button onclick="location.reload()" class="px-12 py-5 bg-purple-600 text-white rounded-full font-black text-xl shadow-xl hover:bg-purple-700">CHƠI LẠI</button>
            </div>
        </div>
    </div>

    <script>
        let userLang = 'en';
        let currentRound = 0;
        let history = [];
        let currentAudio = null;
        let isReviewRunning = false;
        let stopReviewRequested = false;

        const translations = {
            en: {
                subtitle: "Talk about music in Vietnamese 🎵",
                langLabel: "LEARN WITH LANGUAGE:",
                startBtn: "START",
                headerTitle: "MUSIC CONVERSATION",
                continueBtn: "CONTINUE",
                listenAllLabel: "LISTEN",
                pauseLabel: "PAUSE",
                reviewTitle: "REVIEW",
                hintLabel: "Hint:",
                dragLabel: "Answer:",
                htp1: "Listen to Ella's question in Vietnamese.",
                htp2: "Drag the correct answer or type your response.",
                htp3: "Review the full dialogue at the end."
            },
            ru: {
                subtitle: "Говорите về âm nhạc bằng tiếng Việt 🎵",
                langLabel: "ОБУЧЕНИЕ НА ЯЗЫКЕ:",
                startBtn: "НАЧАТЬ",
                headerTitle: "РАЗГОВОР ОБ МУЗЫКЕ",
                continueBtn: "ДАЛЕЕ",
                listenAllLabel: "СЛУШАТЬ",
                pauseLabel: "ПАУЗА",
                reviewTitle: "ОБЗОР",
                hintLabel: "Подсказка:",
                dragLabel: "Ответ:",
                htp1: "Слушайте вопросы Эллы на вьетнамском.",
                htp2: "Перетащите ответ или введите свой вариант.",
                htp3: "Просмотрите весь диалог в конце."
            }
        };

        const roundConfig = [
            { 
                q: "Bạn có thích nghe nhạc không?", 
                qSub: { en: "Do you like listening to music?", ru: "Ты любишь слушать музыку?" }, 
                type: "drag",
                choices: [
                    { vi: "Có, mình rất thích nghe nhạc.", en: "Yes, I love listening to music.", ru: "Да, я очень люблю слушать музыку." },
                    { vi: "Mình không nghe nhạc thường xuyên.", en: "I don't listen to music often.", ru: "Я không nghe nhạc thường xuyên." }
                ]
            },
            { 
                q: "Bạn thích thể loại nhạc gì?", 
                qSub: { en: "What kind of music do you like?", ru: "Какой жанр музыки тебе нравится?" }, 
                prefix: "Mình thích nghe nhạc", 
                prefixSub: { en: "I like listening to", ru: "Мне нравится слушать" },
                suffix: "", 
                suffixSub: { en: "", ru: "" },
                hint: { en: "Pop and Jazz", ru: "Поп и Джаз" } 
            },
            { 
                q: "Hiện tại bạn đang thích bài hát nào nhất?", 
                qSub: { en: "What song do you like the most right now?", ru: "Какая песня тебе сейчас нравится больше всего?" }, 
                prefix: "Dạo này mình hay nghe bài", 
                prefixSub: { en: "Lately I often listen to the song", ru: "В последнее время я часто слушаю песню" },
                suffix: "", 
                suffixSub: { en: "", ru: "" },
                hint: { en: "Perfect by Ed Sheeran", ru: "Perfect Эда Ширана" } 
            },
            { 
                q: "Bạn thường nghe nhạc vào lúc nào?", 
                qSub: { en: "When do you usually listen to music?", ru: "Когда ты обычно слушаешь музыку?" }, 
                prefix: "Mình thường nghe nhạc khi", 
                prefixSub: { en: "I usually listen to music when", ru: "Я обычно слушаю музыку, когда" },
                suffix: "", 
                suffixSub: { en: "", ru: "" },
                hint: { en: "driving or working", ru: "веду машину или работаю" } 
            },
            { 
                q: "Ca sĩ hoặc nhóm nhạc bạn yêu thích nhất là ai?", 
                qSub: { en: "Who is your favorite singer or band?", ru: "Какой певец или музыкальная группа тебе нравится больше всего?" }, 
                prefix: "Mình thần tượng", 
                prefixSub: { en: "I idolize", ru: "Я обожаю" },
                suffix: "", 
                suffixSub: { en: "", ru: "" },
                hint: { en: "Taylor Swift", ru: "Тейлор Свифт" } 
            },
            { 
                q: "Âm nhạc ảnh hưởng đến cảm xúc của bạn như thế nào?", 
                qSub: { en: "How does music affect your emotions?", ru: "Как музыка влияет на твои эмоции?" }, 
                prefix: "Nó giúp mình cảm thấy", 
                prefixSub: { en: "It helps me feel", ru: "Это помогает мне чувствовать себя" },
                suffix: "hơn", 
                suffixSub: { en: "more", ru: "более" },
                hint: { en: "relaxed and happy", ru: "расслабленным и счастливым" } 
            },
            { 
                q: "Bạn có hay đi xem liveshow ca nhạc không?", 
                qSub: { en: "Do you often go to live music shows?", ru: "Ты часто ходишь на музыкальные концерты?" }, 
                type: "drag",
                choices: [
                    { vi: "Thỉnh thoảng mình mới đi xem.", en: "I go sometimes.", ru: "Иногда я хожу." },
                    { vi: "Mình chưa bao giờ đi xem liveshow.", en: "I've never been to a live show.", ru: "Я никогда không đi xem liveshow." }
                ]
            },
            { 
                q: "Bạn có thích hát karaoke không?", 
                qSub: { en: "Do you like singing karaoke?", ru: "Ты любишь петь караоке?" }, 
                type: "drag",
                choices: [
                    { vi: "Có, mình rất thích hát karaoke.", en: "Yes, I really like singing karaoke.", ru: "Да, я очень люблю петь караоке." },
                    { vi: "Không, mình không bao giờ hát karaoke.", en: "No, I never sing karaoke.", ru: "Нет, я никогда не пою караоке." }
                ]
            },
            { type: "review" }
        ];

        function initGame() {
            updateUILanguage();
        }

        function updateUILanguage() {
            const t = translations[userLang];
            document.getElementById('ui-subtitle').innerText = t.subtitle;
            document.getElementById('ui-lang-label').innerText = t.langLabel;
            document.getElementById('ui-start-btn').innerText = t.startBtn;
            document.getElementById('continue-btn').innerHTML = \`\${t.continueBtn} →\`;
            document.getElementById('htp-1').innerText = t.htp1;
            document.getElementById('htp-2').innerText = t.htp2;
            document.getElementById('htp-3').innerText = t.htp3;
            updateListenBtnUI();
        }

        function updateListenBtnUI() {
            const t = translations[userLang];
            const iconCont = document.getElementById('listen-icon');
            const textCont = document.getElementById('listen-text');
            if (isReviewRunning) {
                textCont.innerText = t.pauseLabel;
                iconCont.innerHTML = \`<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>\`;
            } else {
                textCont.innerText = t.listenAllLabel;
                iconCont.innerHTML = \`<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M11 5L6 9H2v6h4l5 4V5z"></path></svg>\`;
            }
        }

        function updateBackground() {
            const musicBgs = [
                "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?auto=format&fit=crop&w=1200&q=80"
            ];
            document.getElementById('main-card').style.backgroundImage = \`linear-gradient(rgba(255,255,255,0.7), rgba(255,255,255,0.7)), url('\${musicBgs[currentRound % musicBgs.length]}')\`;
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
            if (currentAudio) currentAudio.pause();
            return new Promise(resolve => {
                try {
                    const audio = new Audio(\`https://translate.google.com/translate_tts?ie=UTF-8&q=\${encodeURIComponent(text)}&tl=vi&client=tw-ob\`);
                    currentAudio = audio;
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
            
            document.getElementById('round-title').innerText = \`R\${currentRound + 1}/9\`;
            
            document.getElementById('progress-bar').style.width = \`\${((currentRound+1)/roundConfig.length)*100}%\`;
            document.getElementById('btn-prev-round').disabled = (currentRound === 0);
            document.getElementById('btn-next-round').disabled = (currentRound === roundConfig.length - 1);

            if (config.type === "review") { loadReviewRound(); return; }

            const ellaWrap = document.createElement('div');
            ellaWrap.className = 'bubble-wrapper';
            ellaWrap.innerHTML = \`
                <div class="speaker-btn" onclick="speak('\${config.q.replace(/'/g, "\\\\'")}')">
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
                if (saved) renderSaved(userWrap, saved);
                else {
                    dragCont.classList.remove('hidden');
                    renderChoices(dragCont, config);
                    userWrap.innerHTML = \`<div class="bubble bubble-user-ans"><span class="main-text">\${translations[userLang].dragLabel} <div id="drop-zone" class="drop-zone" ondrop="drop(event)" ondragover="allowDrop(event)" ondragleave="leaveDrop(event)"></div></span></div>\`;
                }
            } else {
                if (saved) renderSaved(userWrap, saved);
                else renderInput(userWrap, config);
            }
            area.appendChild(userWrap);
            if (document.getElementById('round-input')) document.getElementById('round-input').focus();
        }

        function renderSaved(wrap, data) {
            wrap.innerHTML = \`
                <div class="bubble bubble-user-ans"><span class="main-text">\${data.a}</span><span class="sub-text">\${data.aSub}</span></div>
                <div class="speaker-btn user-voice-btn" onclick="speak('\${data.a.replace(/'/g, "\\\\'")}')">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M11 5L6 9H2v6h4l5 4V5z"></path></svg>
                </div>
            \`;
            document.getElementById('center-header-tools').classList.remove('hidden');
        }

        function renderChoices(cont, config) {
            cont.innerHTML = '';
            config.choices.forEach((c, idx) => {
                const w = document.createElement('div');
                w.innerHTML = \`<div class="drag-item" draggable="true" ondragstart="drag(event)" id="choice-\${idx}" data-vi="\${c.vi}" data-sub="\${c[userLang]}">\${c.vi}</div><span class="text-[10px] text-gray-500 block text-center mt-1 font-bold italic">\${c[userLang]}</span>\`;
                cont.appendChild(w);
            });
        }

        function renderInput(wrap, config) {
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

        function allowDrop(ev) { ev.preventDefault(); ev.target.style.borderColor = "#8b5cf6"; }
        function leaveDrop(ev) { ev.target.style.borderColor = "#cbd5e1"; }
        function drag(ev) { ev.dataTransfer.setData("text", ev.target.id); }

        function drop(ev) {
            ev.preventDefault();
            const el = document.getElementById(ev.dataTransfer.getData("text"));
            const vi = el.getAttribute('data-vi');
            const sub = el.getAttribute('data-sub');
            history[currentRound] = { q: roundConfig[currentRound].q, qSub: roundConfig[currentRound].qSub[userLang], a: vi, aSub: sub };
            renderSaved(document.getElementById('user-bubble-wrapper'), history[currentRound]);
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
            renderSaved(document.getElementById('user-bubble-wrapper'), history[currentRound]);
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
                qW.innerHTML = \`<div class="speaker-btn" onclick="speak('\${h.q.replace(/'/g, "\\\\'")}')"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M11 5L6 9H2v6h4l5 4V5z"></path></svg></div><div class="bubble bubble-ella-quest"><span class="main-text">\${h.q}</span><span class="sub-text">\${h.qSub}</span></div>\`;
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
                if (isReviewRunning) { stopReview(); return; }
                
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
                    if (q) q.classList.remove('highlight-ella');
                    
                    if (stopReviewRequested) break;
                    await new Promise(r => setTimeout(r, 600));

                    if (a) {
                        a.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        a.classList.add('highlight-user');
                    }
                    await speak(history[i].a);
                    if (a) a.classList.remove('highlight-user');
                    if (stopReviewRequested) break;
                    await new Promise(r => setTimeout(r, 1000));
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
        
        function stopReview() {
            stopReviewRequested = true;
            isReviewRunning = false;
            if(currentAudio) currentAudio.pause();
            updateListenBtnUI();
            document.querySelectorAll('.highlight-ella, .highlight-user').forEach(el => el.classList.remove('highlight-ella', 'highlight-user'));
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

export const GameSpeakingMusic: React.FC = () => {
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
                    title="Speaking Challenge - Music"
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


import React, { useState, useEffect, useRef } from 'react';

// The user-provided HTML game code is stored as a template string.
const gameHTML = `
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Vietnamese Modal Verbs Master</title>
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
            touch-action: manipulation;
        }

        header {
            width: 100%;
            padding: 0.75rem;
            background: rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(10px);
            z-index: 100;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.25rem;
        }

        .header-controls {
            display: flex;
            align-items: center;
            gap: 1rem;
            background: rgba(255, 255, 255, 0.05);
            padding: 0.4rem 1rem;
            border-radius: 50px;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .nav-btn {
            background: rgba(255, 255, 255, 0.1);
            color: white;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s;
        }

        .game-header-text {
            color: white;
            font-size: 0.75rem;
            font-weight: 900;
            letter-spacing: 0.1em;
            min-width: 160px;
            text-align: center;
        }

        .round-dots {
            display: flex;
            gap: 4px;
            flex-wrap: wrap;
            justify-content: center;
        }

        .dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.2);
            transition: all 0.3s;
        }

        .dot.active {
            background: #fbbf24;
            box-shadow: 0 0 8px #fbbf24;
            transform: scale(1.2);
        }

        .floating-word {
            position: absolute;
            cursor: grab;
            padding: 8px 16px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 8px 20px rgba(0,0,0,0.4);
            font-weight: 800;
            font-size: 0.9rem;
            color: #1e1b4b;
            z-index: 999;
            touch-action: none;
            border: 2px solid #f59e0b;
            text-align: center;
            white-space: nowrap;
        }

        /* Layout adjustment for Phase 2 */
        .classic-layout {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1.5rem;
            width: 100%;
            max-width: 1100px;
            padding: 1rem;
        }

        .sentence-row-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 100%;
            padding: 1.5rem;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 25px;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .sentence-row {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.75rem;
            width: 100%;
            flex-wrap: wrap; 
        }

        .sentence-part {
            font-size: 1.5rem; 
            font-weight: 900;
            color: white;
            text-align: center;
        }

        .drop-zone {
            width: 160px;
            height: 50px;
            border: 2px dashed rgba(255, 255, 255, 0.3);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(0,0,0,0.2);
            transition: all 0.3s;
            flex-shrink: 0;
        }

        /* Desktop & Landscape settings */
        @media (min-width: 768px), (orientation: landscape) {
            .sentence-part {
                font-size: 2.5rem;
            }
            .sentence-row {
                flex-wrap: nowrap;
                gap: 1.5rem;
            }
            .drop-zone {
                width: 240px;
                height: 70px;
            }
            .sentence-row-container {
                padding: 2.5rem;
                border-radius: 40px;
            }
        }

        .translation-hint {
            color: #fbbf24;
            font-weight: 700;
            font-size: 0.9rem;
            margin-top: 0.75rem;
            text-transform: uppercase;
            text-align: center;
        }

        .choices-area {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 0.75rem;
            padding: 1rem;
            background: rgba(0,0,0,0.2);
            border-radius: 20px;
            width: 100%;
        }

        .choice-btn {
            background: white;
            color: #1e1b4b;
            padding: 10px 20px;
            border-radius: 12px;
            font-weight: 800;
            cursor: grab;
            box-shadow: 0 4px 0 #d1d5db;
            transition: all 0.1s;
            font-size: 0.9rem;
            touch-action: none;
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
            padding: 1rem;
        }

        .speaker-btn {
            background: #f59e0b;
            color: #1e1b4b;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
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
        <div class="text-center animate-pop max-w-4xl w-full px-4 flex flex-col items-center">
            <h1 id="ui-game-title" class="text-4xl md:text-7xl font-black text-yellow-400 mb-2 italic tracking-tighter uppercase">VIETNAMESE MODAL VERBS</h1>
            <p id="ui-game-subtitle" class="text-white/60 mb-6 uppercase tracking-[0.1em] font-bold text-xs italic">Interactive Learning • Modal Verbs Edition</p>
            
            <div class="flex gap-4 mb-8">
                <button onclick="setUILanguage('en')" id="lang-en" class="px-4 py-2 rounded-xl bg-white/10 text-white font-bold border-2 border-transparent [&.active]:border-yellow-400 [&.active]:bg-yellow-400/20 transition-all active">EN</button>
                <button onclick="setUILanguage('ru')" id="lang-ru" class="px-4 py-2 rounded-xl bg-white/10 text-white font-bold border-2 border-transparent [&.active]:border-yellow-400 [&.active]:bg-yellow-400/20 transition-all">RU</button>
            </div>

            <button class="bg-white/10 p-8 rounded-3xl border border-white/20 flex flex-col items-center gap-2 w-full max-w-xs" onclick="startGame(0)">
                <div class="text-4xl font-black text-white">6</div>
                <span id="ui-start-tag" class="text-white font-bold uppercase text-[10px] tracking-widest">START MISSION</span>
            </button>
        </div>
    </div>

    <header>
        <div class="header-controls">
            <div id="btn-prev" class="nav-btn" onclick="handlePrev()"><svg width="18" height="18" fill="currentColor" viewBox="0 0 256 256"><path d="M165.66,202.34a8,8,0,0,1-11.32,11.32l-80-80a8,8,0,0,1,0-11.32l80-80a8,8,0,0,1,11.32,11.32L91.31,128Z"></path></svg></div>
            <div class="game-header-text uppercase font-black">
                <span id="lvl-name">...</span> | <span id="phase-tag">PHASE 1</span>
            </div>
            <div id="btn-next" class="nav-btn" onclick="handleNext()"><svg width="18" height="18" fill="currentColor" viewBox="0 0 256 256"><path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z"></path></svg></div>
        </div>
        <div id="round-indicators" class="round-dots"></div>
    </header>

    <main class="flex-grow flex items-center justify-center relative overflow-hidden p-4">
        <div id="game-canvas" class="z-10 w-full flex justify-center"></div>
        <div id="floating-area" class="absolute inset-0 pointer-events-none"></div>
    </main>

    <div id="success-overlay" class="overlay">
        <div class="bg-indigo-950/90 p-6 md:p-10 rounded-[30px] border border-white/20 text-center animate-pop max-w-lg w-full shadow-2xl backdrop-blur-2xl overflow-y-auto max-h-[90vh]">
            <div id="popup-content" class="flex flex-col items-center">
                <div class="flex items-center gap-4 mb-3">
                    <h2 id="pop-vn" class="text-4xl md:text-7xl font-black text-white"></h2>
                    <div class="speaker-btn" onclick="speakFromPopup('word')">
                        <svg width="20" height="20" fill="currentColor" viewBox="0 0 256 256"><path d="M155.51,24.81a8,8,0,0,0-8.42.88L77.25,80H32A16,16,0,0,0,16,96v64a16,16,0,0,0,16,16H77.25l69.84,54.31A8,8,0,0,0,160,224V32A8,8,0,0,0,155.51,24.81ZM144,207.64l-61.12-47.53A8,8,0,0,0,77.25,158.4H32V97.6h45.25a8,8,0,0,0,5.63-2.31L144,48.36ZM208,128a32,32,0,0,0-9.37-22.63,8,8,0,0,0-11.32,11.32,16,16,0,0,1,0,22.62,8,8,0,0,0,11.32,11.32A32,32,0,0,0,208,128Zm32,0a64,64,0,0,0-18.75-45.25,8,8,0,0,0-11.32,11.32,48,48,0,0,1,0,67.86,8,8,0,0,0,11.32,11.32A64,64,0,0,0,240,128Z"></path></svg>
                    </div>
                </div>
                <div id="pop-target" class="text-yellow-400 font-bold mb-6 text-xl uppercase tracking-widest"></div>

                <div class="bg-white/5 p-4 md:p-6 rounded-2xl w-full text-left mb-8 border border-white/5">
                    <div class="flex items-center justify-between gap-4">
                        <p id="ex-vn" class="text-white font-bold text-lg md:text-xl"></p>
                        <div class="flex-shrink-0 bg-yellow-400/20 text-yellow-400 p-2 rounded-full cursor-pointer" onclick="speakFromPopup('sentence')">
                            <svg width="16" height="16" fill="currentColor" viewBox="0 0 256 256"><path d="M155.51,24.81a8,8,0,0,0-8.42.88L77.25,80H32A16,16,0,0,0,16,96v64a16,16,0,0,0,16,16H77.25l69.84,54.31A8,8,0,0,0,160,224V32A8,8,0,0,0,155.51,24.81ZM144,207.64l-61.12-47.53A8,8,0,0,0,77.25,158.4H32V97.6h45.25a8,8,0,0,0,5.63-2.31L144,48.36ZM208,128a32,32,0,0,0-9.37-22.63,8,8,0,0,0-11.32,11.32,16,16,0,0,1,0,22.62,8,8,0,0,0,11.32,11.32A32,32,0,0,0,208,128Zm32,0a64,64,0,0,0-18.75-45.25,8,8,0,0,0-11.32,11.32,48,48,0,0,1,0,67.86,8,8,0,0,0,11.32,11.32A64,64,0,0,0,240,128Z"></path></svg>
                        </div>
                    </div>
                    <p id="ex-target" class="text-yellow-400/80 font-bold text-sm mt-2"></p>
                </div>

                <button id="next-round-btn" onclick="closeSuccess()" class="bg-yellow-400 hover:bg-yellow-500 text-indigo-950 font-black py-4 px-12 rounded-xl uppercase tracking-widest transition-all w-full shadow-xl">CONTINUE</button>
            </div>
        </div>
    </div>

    <script>
        const ringtone = new Audio("https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3");
        
        function speak(text) {
            if (!text) return;
            const url = \`https://translate.google.com/translate_tts?ie=UTF-8&q=\${encodeURIComponent(text)}&tl=vi&client=tw-ob\`;
            const audio = new Audio(url);
            audio.play().catch(e => {
                const utter = new SpeechSynthesisUtterance(text);
                utter.lang = 'vi-VN';
                window.speechSynthesis.speak(utter);
            });
        }

        const uiTranslations = {
            en: { title: "VIETNAMESE MODAL VERBS", subtitle: "Learning Vietnamese • Modal Verbs Edition", startTag: "START MISSION", dragHint: "DRAG MEANING HERE", findHint: "Find the meaning", dropWord: "DROP WORD", continueBtn: "CONTINUE", phase: "PHASE" },
            ru: { title: "ВЬЕТНАМСКИЕ МОДАЛЬНЫЕ ГЛАГОЛЫ", subtitle: "Изучение вьетнамского • Модальные глаголы", startTag: "НАЧАТЬ МИССИЮ", dragHint: "ПЕРЕТАЩИТЕ СЮДА", findHint: "Найдите значение", dropWord: "БРОСЬТЕ СЛОВО", continueBtn: "ПРОДОЛЖИТЬ", phase: "ФАЗА" }
        };

        let currentUILang = 'en';

        const rawData = [
            { id: 1, name: "MODAL VERB", vocabulary: [
                { vn: "có thể", en: "can / be able to", ru: "могу", practices: [
                    { leftVn: "Tôi", rightVn: "hát.", ans: "có thể", fullVn: "Tôi có thể hát.", fullEn: "I can sing.", fullRu: "Я могу петь.", hintEn: "can", hintRu: "могу" },
                    { leftVn: "Tôi", rightVn: "chờ.", ans: "có thể", fullVn: "Tôi có thể chờ.", fullEn: "I can wait.", fullRu: "Я могу ждать.", hintEn: "can", hintRu: "могу" }
                ]},
                { vn: "muốn", en: "want", ru: "хочу", practices: [
                    { leftVn: "Tôi", rightVn: "ngủ.", ans: "muốn", fullVn: "Tôi muốn ngủ.", fullEn: "I want to sleep.", fullRu: "Я хочу спать.", hintEn: "want", hintRu: "хочу" },
                    { leftVn: "Tôi", rightVn: "nước.", ans: "muốn", fullVn: "Tôi muốn nước.", fullEn: "I want water.", fullRu: "Я хочу воду.", hintEn: "want", hintRu: "хочу" }
                ]},
                { vn: "phải", en: "must / have to", ru: "должен", practices: [
                    { leftVn: "Tôi", rightVn: "biết.", ans: "phải", fullVn: "Tôi phải biết.", fullEn: "I must know.", fullRu: "Я должен знать.", hintEn: "must", hintRu: "должен" },
                    { leftVn: "Tôi", rightVn: "làm việc.", ans: "phải", fullVn: "Tôi phải làm việc.", fullEn: "I must work.", fullRu: "Я должен работать.", hintEn: "must", hintRu: "должен" }
                ]},
                { vn: "cần", en: "need", ru: "нужно", practices: [
                    { leftVn: "Tôi", rightVn: "thời gian.", ans: "cần", fullVn: "Tôi cần thời gian.", fullEn: "I need time.", fullRu: "Мне нужно время.", hintEn: "need", hintRu: "нужно" },
                    { leftVn: "Tôi", rightVn: "đến đó.", ans: "cần", fullVn: "Tôi cần đến đó.", fullEn: "I need to go there.", fullRu: "Мне нужно туда.", hintEn: "need", hintRu: "нужно" }
                ]},
                { vn: "nên", en: "should", ru: "стоит", practices: [
                    { leftVn: "Bạn", rightVn: "mua nó.", ans: "nên", fullVn: "Bạn nên mua nó.", fullEn: "You should buy it.", fullRu: "Тебе стоит купить это.", hintEn: "should", hintRu: "стоит" },
                    { leftVn: "Chúng ta", rightVn: "về nhà.", ans: "nên", fullVn: "Chúng ta nên về nhà.", fullEn: "We should go home.", fullRu: "Нам стоит пойти домой.", hintEn: "should", hintRu: "стоит" }
                ]},
                { vn: "thử", en: "try", ru: "попробуй", practices: [
                    { leftVn: "Làm ơn hãy", rightVn: "nước ép này.", ans: "thử", fullVn: "Làm ơn hãy thử nước ép này.", fullEn: "Please try this juice.", fullRu: "Пожалуйста, попробуй этот сок.", hintEn: "try", hintRu: "попробуй" },
                    { leftVn: "Chỉ cần", rightVn: "làm điều đó.", ans: "thử", fullVn: "Chỉ cần thử làm điều đó.", fullEn: "Just try to do that.", fullRu: "Просто попробуй сделать это.", hintEn: "try", hintRu: "попробуй" }
                ]}
            ]}
        ];

        let levelData = [], currentLevel = null, currentRound = 0, currentSubRound = 0, currentPhase = 1, animationFrames = [];
        const gameCanvas = document.getElementById('game-canvas'), floatingArea = document.getElementById('floating-area'), overlay = document.getElementById('success-overlay');

        function setUILanguage(lang) {
            currentUILang = lang;
            document.getElementById('lang-en').classList.toggle('active', lang === 'en');
            document.getElementById('lang-ru').classList.toggle('active', lang === 'ru');
            const trans = uiTranslations[lang];
            document.getElementById('ui-game-title').innerText = trans.title;
            document.getElementById('ui-game-subtitle').innerText = trans.subtitle;
            document.getElementById('ui-start-tag').innerText = trans.startTag;
            document.getElementById('next-round-btn').innerText = trans.continueBtn;
        }

        function shuffle(a) { for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]} return a; }

        function startGame() {
            levelData = JSON.parse(JSON.stringify(rawData));
            levelData[0].vocabulary = shuffle([...levelData[0].vocabulary]);
            currentLevel = levelData[0]; currentRound = 0; currentSubRound = 0; currentPhase = 1;
            document.getElementById('start-screen').style.display = 'none';
            initRound();
        }

        function handleNext() {
            if (currentPhase === 1) {
                if (currentRound < currentLevel.vocabulary.length - 1) { currentRound++; initRound(); }
                else { currentPhase = 2; currentRound = 0; currentSubRound = 0; 
                    let p = []; currentLevel.vocabulary.forEach((v, i) => { p.push({wordIdx: i, practiceIdx:0}, {wordIdx: i, practiceIdx:1}); });
                    currentLevel.practiceSequence = shuffle(p); initRound();
                }
            } else {
                if (currentSubRound < currentLevel.practiceSequence.length - 1) { currentSubRound++; initRound(); }
                else { document.getElementById('start-screen').style.display = 'flex'; }
            }
        }

        function handlePrev() {
            if (currentPhase === 1) { if (currentRound > 0) { currentRound--; initRound(); } else document.getElementById('start-screen').style.display = 'flex'; }
            else { if (currentSubRound > 0) { currentSubRound--; initRound(); } else { currentPhase = 1; currentRound = currentLevel.vocabulary.length - 1; initRound(); } }
        }

        function initRound() {
            animationFrames.forEach(f => cancelAnimationFrame(f)); animationFrames = [];
            gameCanvas.innerHTML = ''; floatingArea.innerHTML = '';
            document.getElementById('lvl-name').innerText = currentLevel.name;
            document.getElementById('phase-tag').innerText = \`\${uiTranslations[currentUILang].phase} \${currentPhase}\`;
            const dots = document.getElementById('round-indicators'); dots.innerHTML = '';
            const total = currentPhase === 1 ? currentLevel.vocabulary.length : currentLevel.practiceSequence.length;
            const current = currentPhase === 1 ? currentRound : currentSubRound;
            for(let i=0; i<total; i++) {
                const d = document.createElement('div'); d.className = \`dot \${i === current ? 'active' : (i < current ? 'completed' : '')}\`;
                dots.appendChild(d);
            }
            if (currentPhase === 1) renderPhase1(); else renderPhase2();
        }

        function renderPhase1() {
            const word = currentLevel.vocabulary[currentRound];
            const target = currentUILang === 'en' ? word.en : word.ru;
            const card = document.createElement('div');
            card.className = 'bg-white/5 backdrop-blur-xl border border-white/10 rounded-[30px] p-8 flex flex-col items-center gap-6 w-full max-w-sm animate-pop shadow-2xl';
            card.innerHTML = \`<div class="text-yellow-400 font-black text-4xl text-center">\${word.vn}</div>
                <div class="drop-zone w-full" data-target="\${target}"><span class="text-white/20 font-bold text-[10px] uppercase tracking-widest">\${uiTranslations[currentUILang].dragHint}</span></div>\`;
            gameCanvas.appendChild(card);
            createFloating(target, word.vn);
        }

        function createFloating(text, vn) {
            const el = document.createElement('div'); el.className = 'floating-word pointer-events-auto'; el.innerText = text;
            floatingArea.appendChild(el);
            let x = Math.random()*(window.innerWidth-150)+50, y = Math.random()*(window.innerHeight-250)+150, dx = (Math.random()-0.5)*1.2, dy = (Math.random()-0.5)*1.2;
            function move() {
                if(el.dataset.dragging !== 'true'){
                    if(x < 20 || x > window.innerWidth-120) dx *= -1; if(y < 100 || y > window.innerHeight-100) dy *= -1;
                    x += dx; y += dy; el.style.left = x+'px'; el.style.top = y+'px';
                }
                animationFrames.push(requestAnimationFrame(move));
            }
            const handleStart = (clientX, clientY) => {
                el.dataset.dragging = 'true';
                const offX = clientX - el.offsetLeft, offY = clientY - el.offsetTop;
                const onMove = (m) => {
                    const cx = m.touches ? m.touches[0].clientX : m.clientX;
                    const cy = m.touches ? m.touches[0].clientY : m.clientY;
                    x = cx - offX; y = cy - offY; el.style.left = x+'px'; el.style.top = y+'px';
                    const dz = document.querySelector('.drop-zone'), r1 = dz.getBoundingClientRect(), r2 = el.getBoundingClientRect();
                    dz.classList.toggle('hover', !(r2.left > r1.right || r2.right < r1.left || r2.top > r1.bottom || r2.bottom < r1.top));
                };
                const onUp = () => {
                    el.dataset.dragging = 'false'; const dz = document.querySelector('.drop-zone');
                    if(dz?.classList.contains('hover')){
                        dz.innerHTML = \`<span class="text-white font-black uppercase animate-pop">\${text}</span>\`;
                        ringtone.currentTime = 0;
                        ringtone.play();
                        confetti({particleCount: 100, spread: 70, origin: {y: 0.6}}); speak(vn); el.remove(); setTimeout(showSuccess, 800);
                    }
                    window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp);
                    window.removeEventListener('touchmove', onMove); window.removeEventListener('touchend', onUp);
                };
                window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp);
                window.addEventListener('touchmove', onMove, {passive: false}); window.addEventListener('touchend', onUp);
            };
            el.onmousedown = (e) => handleStart(e.clientX, e.clientY);
            el.ontouchstart = (e) => handleStart(e.touches[0].clientX, e.touches[0].clientY);
            move();
        }

        function renderPhase2() {
            const step = currentLevel.practiceSequence[currentSubRound], word = currentLevel.vocabulary[step.wordIdx], practice = word.practices[step.practiceIdx];
            const hint = currentUILang === 'en' ? practice.hintEn : practice.hintRu;
            const container = document.createElement('div');
            container.className = 'classic-layout animate-pop';
            container.innerHTML = \`<div class="sentence-row-container"><div class="sentence-row">
                <span class="sentence-part">\${practice.leftVn}</span>
                <div id="target-zone" class="drop-zone" data-ans="\${practice.ans}"><span class="text-white/10 text-[10px] font-bold uppercase">\${uiTranslations[currentUILang].dropWord}</span></div>
                <span class="sentence-part">\${practice.rightVn}</span>
                </div><div class="translation-hint">\${hint}</div></div><div class="choices-area"></div>\`;
            gameCanvas.appendChild(container);
            const choices = shuffle([word.vn, ...levelData[0].vocabulary.filter(v => v.vn !== word.vn).slice(0, 3).map(v => v.vn)]);
            choices.forEach(txt => {
                const btn = document.createElement('div'); btn.className = 'choice-btn'; btn.innerText = txt;
                const handleStart = (clientX, clientY) => {
                    const clone = btn.cloneNode(true); Object.assign(clone.style, {position:'fixed', zIndex:'2000', width:btn.offsetWidth+'px'});
                    document.body.appendChild(clone);
                    const onMove = (m) => {
                        const cx = m.touches ? m.touches[0].clientX : m.clientX;
                        const cy = m.touches ? m.touches[0].clientY : m.clientY;
                        clone.style.left = (cx - btn.offsetWidth/2)+'px'; clone.style.top = (cy - btn.offsetHeight/2)+'px';
                        const tz = document.getElementById('target-zone'), r1 = tz.getBoundingClientRect(), r2 = clone.getBoundingClientRect();
                        tz.classList.toggle('hover', !(r2.left > r1.right || r2.right < r1.left || r2.top > r1.bottom || r2.bottom < r1.top));
                    };
                    const onUp = () => {
                        const tz = document.getElementById('target-zone');
                        if(tz.classList.contains('hover') && txt === practice.ans) {
                            tz.innerHTML = \`<span class="text-white font-black uppercase text-xl md:text-3xl animate-pop">\${txt}</span>\`;
                            ringtone.currentTime = 0;
                            ringtone.play();
                            confetti({particleCount: 100, spread: 70, origin: {y: 0.6}}); speak(practice.fullVn); setTimeout(showSuccess, 800);
                        } else tz.classList.remove('hover');
                        clone.remove();
                        window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp);
                        window.removeEventListener('touchmove', onMove); window.removeEventListener('touchend', onUp);
                    };
                    window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp);
                    window.addEventListener('touchmove', onMove, {passive: false}); window.addEventListener('touchend', onUp);
                };
                btn.onmousedown = (e) => handleStart(e.clientX, e.clientY);
                btn.ontouchstart = (e) => handleStart(e.touches[0].clientX, e.touches[0].clientY);
                container.querySelector('.choices-area').appendChild(btn);
            });
        }

        function showSuccess() {
            const step = currentPhase === 1 ? {wordIdx: currentRound} : currentLevel.practiceSequence[currentSubRound];
            const word = currentLevel.vocabulary[step.wordIdx], practice = word.practices[currentPhase === 1 ? 0 : step.practiceIdx];
            document.getElementById('pop-vn').innerText = word.vn;
            document.getElementById('pop-target').innerText = currentUILang === 'en' ? word.en : word.ru;
            document.getElementById('ex-vn').innerText = practice.fullVn;
            document.getElementById('ex-target').innerText = currentUILang === 'en' ? practice.fullEn : practice.fullRu;
            overlay.style.display = 'flex';
        }

        function speakFromPopup(t) { speak(t === 'word' ? document.getElementById('pop-vn').innerText : document.getElementById('ex-vn').innerText); }
        function closeSuccess() { overlay.style.display = 'none'; handleNext(); }
        setLanguage('en');
    </script>
</body>
</html>
`;

export const VocabModalVerbnew: React.FC = () => {
    const [iframeSrc, setIframeSrc] = useState<string | undefined>(undefined);

    useEffect(() => {
        const blob = new Blob([gameHTML], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        setIframeSrc(url);

        return () => {
            if (url) {
                URL.revokeObjectURL(url);
            }
        };
    }, []);
    
    if (!iframeSrc) {
        return <div className="w-full h-full flex items-center justify-center bg-slate-900 text-white">Loading Game...</div>;
    }

    return (
        <iframe
            src={iframeSrc}
            className="w-full h-full"
            style={{ border: 'none' }}
            title="Game: Vietnamese Modal Verbs"
            sandbox="allow-scripts allow-same-origin"
        />
    );
};

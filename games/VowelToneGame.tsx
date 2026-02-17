
import React, { useState, useEffect } from 'react';

// The user-provided HTML game code is stored as a template string.
const gameHTML = `
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Vietnamese Tones Quest - Level 1 & 2</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Rajdhani:wght@300;500;700&display=swap');

        :root {
            --neon-blue: #00f3ff;
            --neon-purple: #bc13fe;
            --dark-bg: #0a0b1e;
        }

        body {
            background-color: var(--dark-bg);
            color: white;
            font-family: 'Rajdhani', sans-serif;
            overflow: hidden;
            height: 100vh;
            width: 100vw;
            display: flex;
            flex-direction: column;
            user-select: none;
        }

        .futuristic-card {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(15px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            box-shadow: 0 0 20px rgba(0, 243, 255, 0.1);
        }

        .neon-text {
            text-shadow: 0 0 10px var(--neon-blue), 0 0 20px var(--neon-blue);
            font-family: 'Orbitron', sans-serif;
        }

        .speaker-btn {
            transition: all 0.2s ease;
            background: linear-gradient(135deg, rgba(0, 243, 255, 0.2), rgba(188, 19, 254, 0.2));
            border: 1px solid var(--neon-blue);
        }

        .speaker-btn:hover:not(:disabled) {
            transform: scale(1.1);
            box-shadow: 0 0 15px var(--neon-blue);
        }

        .nav-btn {
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid var(--neon-blue);
            color: var(--neon-blue);
            width: 36px;
            height: 36px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
            cursor: pointer;
        }

        @media (min-width: 768px) {
            .nav-btn {
                width: 45px;
                height: 45px;
            }
        }

        .nav-btn:hover {
            background: var(--neon-blue);
            color: black;
            box-shadow: 0 0 10px var(--neon-blue);
        }

        .lang-btn {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(0, 243, 255, 0.3);
            padding: 8px 16px;
            border-radius: 8px;
            font-size: 14px;
            transition: all 0.2s;
            font-family: 'Orbitron', sans-serif;
            font-weight: bold;
        }

        .lang-btn.active {
            border-color: var(--neon-blue);
            background: rgba(0, 243, 255, 0.2);
            box-shadow: 0 0 12px var(--neon-blue);
            color: var(--neon-blue);
        }

        .no-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }

        .drop-zone {
            width: 70px;
            height: 45px;
            border: 2px dashed rgba(0, 243, 255, 0.3);
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
            background: rgba(0, 0, 0, 0.2);
            font-weight: bold;
            font-size: 1rem;
        }

        @media (min-width: 768px) {
            .drop-zone {
                width: 90px;
                height: 55px;
                font-size: 1.1rem;
            }
        }

        .drop-zone.correct {
            border: 2px solid #4ade80;
            background: rgba(74, 222, 128, 0.1);
            color: #4ade80;
        }

        .word-tag {
            background: rgba(188, 19, 254, 0.15);
            border: 1px solid var(--neon-purple);
            cursor: grab;
            touch-action: none;
        }

        #start-overlay {
            position: fixed;
            inset: 0;
            background: var(--dark-bg);
            z-index: 200;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }

        .glow-button {
            border: 2px solid var(--neon-blue);
            color: var(--neon-blue);
            padding: 10px 30px;
            font-family: 'Orbitron', sans-serif;
            border-radius: 50px;
            transition: all 0.3s;
            cursor: pointer;
        }

        @media (min-width: 768px) {
            .glow-button {
                padding: 12px 40px;
            }
        }

        @keyframes drift {
            0% { transform: translate(0, 0) rotate(0deg); }
            25% { transform: translate(60px, 30px) rotate(90deg); }
            50% { transform: translate(-30px, 100px) rotate(180deg); }
            75% { transform: translate(-100px, -30px) rotate(270deg); }
            100% { transform: translate(0, 0) rotate(360deg); }
        }

        @keyframes counterDrift {
            0% { transform: rotate(0deg); }
            25% { transform: rotate(-90deg); }
            50% { transform: rotate(-180deg); }
            75% { transform: rotate(-270deg); }
            100% { transform: rotate(-360deg); }
        }

        .floating-bubble {
            position: absolute;
            width: 70px;
            height: 70px;
            border-radius: 50%;
            background: radial-gradient(circle at 30% 30%, rgba(188, 19, 254, 0.4), rgba(0, 243, 255, 0.1));
            border: 2px solid rgba(0, 243, 255, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: background 0.2s, border-color 0.2s, opacity 0.3s;
            box-shadow: 0 0 15px rgba(0, 243, 255, 0.2);
            z-index: 5;
            will-change: transform;
        }

        @media (min-width: 768px) {
            .floating-bubble {
                width: 85px;
                height: 85px;
            }
        }

        .bubble-text {
            font-size: 1.4rem;
            font-weight: bold;
            pointer-events: none;
            will-change: transform;
        }

        @media (min-width: 768px) {
            .bubble-text {
                font-size: 1.8rem;
            }
        }

        .floating-bubble:hover {
            background: rgba(188, 19, 254, 0.6);
            border-color: var(--neon-blue);
            z-index: 10;
        }

        .floating-bubble.fade-out {
            opacity: 0;
            pointer-events: none;
            transform: scale(0.5);
        }

        .progress-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: rgba(0, 243, 255, 0.2);
            border: 1px solid var(--neon-blue);
        }
        @media (min-width: 768px) {
            .progress-dot { width: 10px; height: 10px; }
        }
        .progress-dot.active {
            background: var(--neon-blue);
            box-shadow: 0 0 8px var(--neon-blue);
        }
    </style>
</head>
<body class="p-0">

    <!-- Header Section (Fixed at Top, taking ~30% height) -->
    <header id="main-header" class="w-full z-[100] h-[30vh] flex flex-col items-center justify-center relative border-b border-blue-500/10 hidden">
        <div class="text-center px-4 w-full">
            <h1 class="text-3xl md:text-7xl font-bold neon-text mb-2 md:mb-6 uppercase tracking-widest leading-tight">Listening Quest</h1>
            <div id="nav-controls" class="flex flex-col md:flex-row justify-center gap-2 md:gap-12 items-center">
                <p class="text-purple-400 font-bold tracking-[0.2em] uppercase text-xs md:text-xl"><span data-i18n="level">CẤP ĐỘ</span>: <span id="level-display" class="text-white">1</span></p>
                <div class="flex items-center gap-4 md:gap-8">
                    <button onclick="prevRoundManual()" class="nav-btn"><i class="fas fa-chevron-left text-sm md:text-xl"></i></button>
                    <p class="text-blue-300 tracking-[0.1em] min-w-[100px] md:min-w-[200px] uppercase text-xs md:text-xl text-center font-bold">
                        <span data-i18n="round">VÒNG</span>: <span id="round-display" class="text-white">1 / 9</span>
                    </p>
                    <button onclick="nextRoundManual()" class="nav-btn"><i class="fas fa-chevron-right text-sm md:text-xl"></i></button>
                </div>
            </div>
        </div>
    </header>

    <div id="start-overlay">
        <div class="text-center mb-6 md:mb-10 w-full max-w-4xl px-4 flex flex-col items-center">
            <!-- Title resized to 70% and centered -->
            <h1 class="text-[1.7rem] md:text-[5.5rem] font-bold neon-text mb-6 md:mb-8 uppercase tracking-[0.15em] md:tracking-[0.2em] w-full text-center whitespace-nowrap overflow-hidden" data-i18n="title">Dấu Việt</h1>
            
            <!-- Language Selector -->
            <div class="flex justify-center gap-3 mb-8">
                <button onclick="setLanguage('vi')" id="lang-vi-start" class="lang-btn active">VIỆT NAM</button>
                <button onclick="setLanguage('en')" id="lang-en-start" class="lang-btn">ENGLISH</button>
                <button onclick="setLanguage('ru')" id="lang-ru-start" class="lang-btn">РУССКИЙ</button>
            </div>

            <div class="max-w-md mx-auto p-5 md:p-8 border border-blue-500/30 rounded-2xl bg-blue-500/5 text-left">
                <p class="text-blue-300 tracking-widest uppercase text-xs md:text-sm mb-4 opacity-70 text-center font-bold" data-i18n="howToPlayTitle">HƯỚNG DẪN CÁCH CHƠI</p>
                <ul class="text-white text-sm md:text-lg space-y-3 list-none">
                    <li class="flex items-start gap-3">
                        <span class="text-cyan-400 font-bold">1.</span>
                        <span data-i18n="step1">Nhấp vào biểu tượng LOA để nghe phát âm của từ.</span>
                    </li>
                    <li class="flex items-start gap-3">
                        <span class="text-cyan-400 font-bold">2.</span>
                        <span data-i18n="step2">KÉO TỪ tương ứng từ "Kho từ" ở bên trái.</span>
                    </li>
                    <li class="flex items-start gap-3">
                        <span class="text-cyan-400 font-bold">3.</span>
                        <span data-i18n="step3">THẢ vào ô vuông trống bên cạnh loa vừa nghe.</span>
                    </li>
                </ul>
            </div>
        </div>
        <button id="btn-start" onclick="enterGame()" class="glow-button mt-4" style="border-color: #4ade80; color: #4ade80; font-size: 1.2rem; md:font-size: 1.5rem;" data-i18n="start">
            BẮT ĐẦU CHƠI <i class="fas fa-play ml-2 text-sm"></i>
        </button>
    </div>

    <!-- Main Game Container (taking ~70% height) -->
    <main id="game-container" class="h-[70vh] w-full hidden relative overflow-hidden flex flex-col p-2 md:p-4">
        
        <!-- Level 1 Layout -->
        <div id="ui-level-1" class="flex flex-row md:grid md:grid-cols-5 gap-2 md:gap-4 max-w-6xl mx-auto w-full h-full overflow-hidden">
            <!-- Word Bank -->
            <div class="w-[30%] md:w-auto md:col-span-1 futuristic-card p-2 md:p-4 flex flex-col overflow-hidden">
                <h3 class="text-[10px] md:text-sm font-bold mb-2 md:mb-4 text-purple-400 text-center uppercase" data-i18n="wordBank">Kho từ</h3>
                <div id="word-list" class="flex flex-col gap-2 overflow-y-auto no-scrollbar flex-grow"></div>
            </div>

            <!-- Listening Area -->
            <div class="w-[70%] md:w-auto md:col-span-4 futuristic-card p-3 md:p-6 flex flex-col overflow-hidden">
                <div id="listening-area" class="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6 py-1 md:py-2 justify-items-center items-center flex-grow overflow-y-auto no-scrollbar"></div>
                <p class="text-center text-gray-500 mt-2 md:mt-4 text-[8px] md:text-[10px] uppercase tracking-[0.2em] md:tracking-[0.3em]" data-i18n="hint">Nghe loa và thả chữ tương ứng</p>
            </div>
        </div>

        <!-- Level 2 Layout -->
        <div id="ui-level-2" class="hidden absolute inset-0 z-0 h-full">
            <div class="absolute top-4 md:top-12 left-1/2 -translate-x-1/2 text-center z-50 pointer-events-auto">
                <p class="text-cyan-400 uppercase tracking-widest text-xs md:text-lg mb-2" data-i18n="findSound">Tìm âm thanh:</p>
                <button id="target-speaker" class="speaker-btn w-16 h-16 md:w-24 md:h-24 rounded-full flex items-center justify-center text-2xl md:text-4xl text-cyan-400 mx-auto shadow-lg shadow-cyan-500/20">
                    <i class="fas fa-volume-up"></i>
                </button>
                <div class="flex justify-center gap-2 mt-2 md:mt-4" id="l2-progress">
                    <div class="progress-dot"></div>
                    <div class="progress-dot"></div>
                    <div class="progress-dot"></div>
                </div>
            </div>
            <div id="bubble-container" class="w-full h-full relative pointer-events-auto"></div>
        </div>
    </main>

    <div id="perfect-overlay" class="fixed inset-0 bg-black/95 hidden items-center justify-center z-[600] p-4">
        <div class="bg-gray-900 border-2 border-cyan-400 p-6 md:p-8 rounded-[30px] md:rounded-[40px] text-center max-w-xl w-full">
            <h2 class="text-2xl md:text-3xl font-bold neon-text text-white mb-6 uppercase" id="popup-title">XUẤT SẮC!</h2>
            <div id="review-list" class="flex flex-wrap justify-center gap-2 mb-8"></div>
            <button onclick="nextRound()" class="bg-green-600 hover:bg-green-500 text-white px-8 md:px-10 py-2 md:py-3 rounded-full font-bold uppercase tracking-widest text-xs md:text-sm" id="btn-next-text">Tiếp tục</button>
        </div>
    </div>

    <div id="final-celebration" class="fixed inset-0 bg-black/98 hidden items-center justify-center z-[700] p-4">
        <div class="text-center">
            <h1 class="text-3xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-white to-yellow-400 neon-text mb-4 md:mb-6 uppercase italic">CONGRATULATIONS!</h1>
            <p class="text-sm md:text-2xl text-cyan-400 tracking-widest mb-10 uppercase" data-i18n="finishText">Bạn đã chinh phục mọi thử thách âm điệu</p>
            <button onclick="restartFullGame()" class="glow-button" data-i18n="playAgain">CHƠI LẠI TỪ ĐẦU</button>
        </div>
    </div>

    <script>
        const i18n = {
            vi: { 
                title: "Dấu Việt", start: "BẮT ĐẦU CHƠI", level: "CẤP ĐỘ", round: "VÒNG", 
                excellent: "XUẤT SẮC!", levelFinish: "HOÀN THÀNH CẤP ĐỘ {n}!", next: "TIẾP TỤC", 
                gotoNext: "SANG CẤP ĐỘ TIẾP THEO", playAgain: "CHƠI LẠI", 
                finishText: "Bạn đã chinh phục mọi thử thách âm điệu", findSound: "Tìm âm thanh:", 
                howToPlayTitle: "HƯỚNG DẪN CÁCH CHƠI",
                step1: "Nhấp vào biểu tượng LOA để nghe phát âm của từ.",
                step2: "KÉO TỪ tương ứng từ \"Kho từ\" ở bên trái.",
                step3: "THẢ vào ô vuông trống bên cạnh loa vừa nghe.",
                wordBank: "Kho từ", hint: "Nghe loa và thả chữ tương ứng" 
            },
            en: { 
                title: "Viet Tones", start: "START GAME", level: "LEVEL", round: "ROUND", 
                excellent: "EXCELLENT!", levelFinish: "LEVEL {n} COMPLETE!", next: "CONTINUE", 
                gotoNext: "GO TO NEXT LEVEL", playAgain: "PLAY AGAIN", 
                finishText: "You have mastered all tone challenges", findSound: "Find the sound:", 
                howToPlayTitle: "HOW TO PLAY",
                step1: "Click the SPEAKER icon to hear the word's pronunciation.",
                step2: "DRAG the matching word from the \"Word Bank\" on the left.",
                step3: "DROP it into the empty box next to that speaker.",
                wordBank: "Word Bank", hint: "Listen to the speaker and drop the correct word" 
            },
            ru: { 
                title: "Тональности", start: "ИГРАТЬ", level: "УРОВЕНЬ", round: "РАУНД", 
                excellent: "ОТЛИЧНО!", levelFinish: "УРОВЕНЬ {n} ЗАВЕРШЕН!", next: "ДАЛЕЕ", 
                gotoNext: "НА СЛЕДУЮЩИЙ УРОВЕНЬ", playAgain: "ИГРАТЬ СНОВА", 
                finishText: "Вы освоили все тональные задачи", findSound: "Найди звук:", 
                howToPlayTitle: "КАК ИГРАТЬ",
                step1: "Нажмите на иконку ДИНАМИКА, чтобы услышать произношение.",
                step2: "ПЕРЕТАЩИТЕ слово из «Банка слов» слева.",
                step3: "ПОМЕСТИТЕ его в пустое поле рядом с динамиком.",
                wordBank: "банк слов", hint: "Слушайте динамик и выберите правильное слово" 
            }
        };

        const gameData = {
            level1: [
                { tones: ["a", "á", "à", "ả", "ã", "ạ"] }, { tones: ["o", "ó", "ò", "ỏ", "õ", "ọ"] },
                { tones: ["ô", "ố", "ồ", "ổ", "ỗ", "ộ"] }, { tones: ["ơ", "ớ", "ờ", "ở", "ỡ", "ợ"] },
                { tones: ["e", "é", "è", "ẻ", "ẽ", "ẹ"] }, { tones: ["ê", "ế", "ề", "ể", "ễ", "ệ"] },
                { tones: ["u", "ú", "ù", "ủ", "ũ", "ụ"] }, { tones: ["ư", "ứ", "ừ", "ử", "ữ", "ự"] },
                { tones: ["i", "í", "ì", "ỉ", "ĩ", "ị"] }
            ],
            level2: [
                { tones: ["a", "á", "à", "ả", "ã", "ạ"] }, { tones: ["o", "ó", "ò", "ỏ", "õ", "ọ"] },
                { tones: ["ô", "ố", "ồ", "ổ", "ỗ", "ộ"] }, { tones: ["ơ", "ớ", "ờ", "ở", "ỡ", "ợ"] },
                { tones: ["e", "é", "è", "ẻ", "ẽ", "ẹ"] }, { tones: ["ê", "ế", "ề", "ể", "ễ", "ệ"] },
                { tones: ["u", "ú", "ù", "ủ", "ũ", "ụ"] }, { tones: ["ư", "ứ", "ừ", "ử", "ữ", "ự"] },
                { tones: ["i", "í", "ì", "ỉ", "ĩ", "ị"] }
            ]
        };

        let currentLang = 'vi', currentLevel = 1, currentRoundIndex = 0, userAnswers = [], l2Interval;
        let l2Sequence = [], l2SequenceIndex = 0;
        
        const ttsAudio = new Audio(), tingAudio = new Audio('https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3');
        const wrongAudio = new Audio('https://assets.mixkit.co/active_storage/sfx/2004/2004-preview.mp3');
        const cheerAudio = new Audio('https://docs.google.com/uc?export=download&id=1f139xmOm-yuHt3QrubCO8FjFQnzLkZkd');

        function setLanguage(l) {
            currentLang = l;
            // Update start screen buttons
            document.querySelectorAll('#start-overlay .lang-btn').forEach(b => b.classList.toggle('active', b.id === 'lang-' + l + '-start'));
            
            document.querySelectorAll('[data-i18n]').forEach(el => {
                const k = el.getAttribute('data-i18n');
                if (i18n[l][k]) el.innerText = i18n[l][k];
            });
            updateRoundDisplay();
        }

        function enterGame() {
            document.getElementById('start-overlay').style.display = 'none';
            document.getElementById('main-header').classList.remove('hidden');
            document.getElementById('game-container').classList.remove('hidden');
            initRound();
        }

        function updateRoundDisplay() {
            const r = (currentLevel === 1) ? gameData.level1 : gameData.level2;
            document.getElementById('round-display').innerText = (currentRoundIndex + 1) + ' / ' + r.length;
            document.getElementById('level-display').innerText = currentLevel;
        }

        function speakWord(t, btn) {
            if (btn) { btn.disabled = true; btn.classList.add('animate-pulse'); }
            let query = t;
            const iVariants = ["i", "í", "ì", "ỉ", "ĩ", "ị"];
            if (iVariants.includes(t.toLowerCase())) query = t + ', ';
            ttsAudio.src = 'https://translate.google.com/translate_tts?ie=UTF-8&q=' + encodeURIComponent(query) + '&tl=vi&client=tw-ob';
            ttsAudio.onended = () => { if (btn) { btn.disabled = false; btn.classList.remove('animate-pulse'); } };
            return ttsAudio.play().catch(() => {});
        }

        function initRound() {
            clearInterval(l2Interval);
            updateRoundDisplay();
            if (currentLevel === 1) setupLevel1(); else setupLevel2();
        }

        function setupLevel1() {
            document.getElementById('ui-level-1').classList.remove('hidden');
            document.getElementById('ui-level-2').classList.add('hidden');
            const round = gameData.level1[currentRoundIndex];
            userAnswers = new Array(6).fill(null);
            
            const wordList = document.getElementById('word-list');
            wordList.innerHTML = '';
            [...round.tones].sort(() => Math.random() - 0.5).forEach(w => {
                const d = document.createElement('div');
                d.className = 'word-tag py-2 px-1 text-center font-bold text-sm md:text-lg rounded-lg w-full';
                d.innerText = w; d.draggable = true; d.id = 'word-' + w;
                
                d.addEventListener('dragstart', e => e.dataTransfer.setData('text', w));
                d.ontouchstart = (e) => {
                    const touch = e.touches[0];
                    const ghost = d.cloneNode(true);
                    ghost.style.position = 'fixed';
                    ghost.style.width = d.offsetWidth + 'px';
                    ghost.style.opacity = '0.7';
                    ghost.style.zIndex = '1000';
                    ghost.style.pointerEvents = 'none';
                    document.body.appendChild(ghost);

                    const moveGhost = (ev) => {
                        const t = ev.touches[0];
                        ghost.style.left = (t.clientX - d.offsetWidth / 2) + 'px';
                        ghost.style.top = (t.clientY - d.offsetHeight / 2) + 'px';
                    };

                    const endGhost = (ev) => {
                        const t = ev.changedTouches[0];
                        const target = document.elementFromPoint(t.clientX, t.clientY);
                        const dropZone = target?.closest('.drop-zone');
                        if (dropZone && !dropZone.classList.contains('correct')) {
                            const expected = dropZone.getAttribute('data-expected');
                            if (w === expected) dropZone.dispatchEvent(new CustomEvent('drop-correct', { detail: w }));
                        }
                        ghost.remove();
                        window.removeEventListener('touchmove', moveGhost);
                        window.removeEventListener('touchend', endGhost);
                    };
                    window.addEventListener('touchmove', moveGhost, { passive: false });
                    window.addEventListener('touchend', endGhost);
                };
                wordList.appendChild(d);
            });

            const area = document.getElementById('listening-area'); 
            area.innerHTML = '';
            round.tones.forEach((w, i) => {
                const item = document.createElement('div');
                item.className = 'flex flex-col items-center gap-1 md:gap-2 scale-90 md:scale-110';
                item.innerHTML = '<button class="speaker-btn w-10 h-10 md:w-16 md:h-16 rounded-full flex items-center justify-center text-cyan-400"><i class="fas fa-volume-up text-xs md:text-xl"></i></button><div class="drop-zone" data-expected="' + w + '"></div>';
                
                item.querySelector('button').onclick = (e) => speakWord(w, e.currentTarget);
                const dz = item.querySelector('.drop-zone');
                const handleCorrect = (val) => {
                    dz.innerText = val; dz.classList.add('correct');
                    userAnswers[i] = val; tingAudio.play();
                    document.getElementById('word-' + val)?.remove();
                    if (userAnswers.every(a => a)) showPopup();
                };
                dz.addEventListener('dragover', e => e.preventDefault());
                dz.addEventListener('drop', e => {
                    if (e.dataTransfer.getData('text') === w) handleCorrect(w);
                });
                dz.addEventListener('drop-correct', e => handleCorrect(e.detail));
                area.appendChild(item);
            });
        }

        function setupLevel2() {
            document.getElementById('ui-level-1').classList.add('hidden');
            document.getElementById('ui-level-2').classList.remove('hidden');
            const round = gameData.level2[currentRoundIndex];
            const shuffledTones = [...round.tones].sort(() => Math.random() - 0.5);
            l2Sequence = shuffledTones.slice(0, 3);
            l2SequenceIndex = 0;
            updateL2UI();
            startL2Loop();

            const container = document.getElementById('bubble-container');
            container.innerHTML = '';
            round.tones.forEach((w) => {
                const b = document.createElement('div');
                b.className = 'floating-bubble';
                b.innerHTML = '<span class="bubble-text">' + w + '</span>';
                const randomX = Math.random() * 70 + 15;
                const randomY = Math.random() * 50 + 20;
                b.style.left = randomX + 'vw';
                b.style.top = randomY + 'vh';
                const duration = 8 + Math.random() * 7;
                const delay = Math.random() * -15;
                b.style.animation = 'drift ' + duration + 's ' + delay + 's infinite linear alternate';
                b.querySelector('span').style.animation = 'counterDrift ' + duration + 's ' + delay + 's infinite linear alternate';
                b.onclick = () => {
                    if (w === l2Sequence[l2SequenceIndex]) {
                        tingAudio.play();
                        b.classList.add('fade-out');
                        l2SequenceIndex++;
                        updateL2UI();
                        if (l2SequenceIndex >= l2Sequence.length) {
                            clearInterval(l2Interval);
                            showPopup();
                        } else {
                            clearInterval(l2Interval);
                            startL2Loop();
                        }
                    } else wrongAudio.play();
                };
                container.appendChild(b);
            });
        }

        function updateL2UI() {
            document.querySelectorAll('.progress-dot').forEach((dot, idx) => dot.classList.toggle('active', idx < l2SequenceIndex));
            document.getElementById('target-speaker').onclick = (e) => speakWord(l2Sequence[l2SequenceIndex], e.currentTarget);
        }

        function startL2Loop() {
            const speakNext = () => speakWord(l2Sequence[l2SequenceIndex], document.getElementById('target-speaker'));
            speakNext();
            l2Interval = setInterval(speakNext, 4500);
        }

        function showPopup() {
            const p = document.getElementById('perfect-overlay');
            const title = document.getElementById('popup-title');
            const btn = document.getElementById('btn-next-text');
            const isLastRound = currentRoundIndex === 8;
            if (isLastRound) {
                if (currentLevel === 1) {
                    title.innerText = i18n[currentLang].levelFinish.replace('{n}', 1);
                    btn.innerText = i18n[currentLang].gotoNext;
                } else { showFinal(); return; }
            } else {
                title.innerText = i18n[currentLang].excellent;
                btn.innerText = i18n[currentLang].next;
            }
            p.style.display = 'flex';
        }

        function nextRound() {
            document.getElementById('perfect-overlay').style.display = 'none';
            if (currentRoundIndex < 8) currentRoundIndex++;
            else if (currentLevel === 1) { currentLevel = 2; currentRoundIndex = 0; }
            initRound();
        }

        function showFinal() {
            document.getElementById('game-container').classList.add('hidden');
            document.getElementById('main-header').classList.add('hidden');
            document.getElementById('final-celebration').style.display = 'flex';
            cheerAudio.play();
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
        }

        function restartFullGame() {
            currentLevel = 1; currentRoundIndex = 0;
            document.getElementById('final-celebration').style.display = 'none';
            document.getElementById('start-overlay').style.display = 'flex';
            document.getElementById('main-header').classList.add('hidden');
        }

        function prevRoundManual() { if (currentRoundIndex > 0) { currentRoundIndex--; initRound(); } }
        function nextRoundManual() { if (currentRoundIndex < 8) { currentRoundIndex++; initRound(); } }

        window.onload = () => setLanguage('vi');
    </script>
</body>
</html>
`;

export const GameVowelTone: React.FC = () => {
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
            key="vowel-tone-frame"
            src={iframeSrc}
            className="w-full h-full"
            style={{ border: 'none' }}
            title="Game: Vowel + Tone"
            sandbox="allow-scripts allow-same-origin"
        />
    );
};

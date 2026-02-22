import React, { useEffect, useRef, useState } from 'react';
import { Maximize, Minimize } from 'lucide-react';

const gameHTML = `
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Chisla Dash - Học Số Tiếng Việt</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js"></script>
    <style>
        body {
            touch-action: none;
            overflow: hidden;
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            color: white;
            height: 100vh;
            width: 100vw;
        }
        .game-container {
            width: 100vw;
            height: 100vh;
            position: relative;
            display: flex;
            flex-direction: column;
        }
        #targets-container {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 1.5rem;
            height: 100%;
            width: 100%;
            flex-wrap: wrap;
            padding: 20px;
            transition: all 0.3s ease;
        }
        .target-card {
            background: #ffffff;
            border-radius: 40px;
            padding: 30px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 15px;
            min-width: 260px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
            border: 6px solid #bfdbfe;
            transition: all 0.3s ease;
            pointer-events: none;
        }
        .target-card .number-text {
            font-size: 8rem;
            font-weight: 900;
            color: #1e40af;
            line-height: 1;
        }
        .drop-zone {
            width: 200px;
            height: 80px;
            background: #f8fafc;
            border: 4px dashed #3b82f6;
            border-radius: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
            pointer-events: auto;
        }
        @media (max-width: 600px) and (orientation: portrait) {
            #targets-container { gap: 1rem; padding: 10px; align-content: center; }
            .target-card { min-width: 160px; padding: 15px; border-radius: 25px; border-width: 4px; gap: 8px; }
            .target-card .number-text { font-size: 4rem; }
            .drop-zone { width: 140px; height: 60px; border-width: 3px; }
            .floating-word { min-width: 130px !important; padding: 10px 20px !important; }
            .floating-word .word-main { font-size: 1.3rem !important; }
        }
        @media (orientation: landscape) {
            .target-card.compact { min-width: 200px; padding: 20px; border-radius: 30px; }
            .target-card.compact .number-text { font-size: 5.5rem; }
        }
        .target-card.completed { opacity: 0.5; transform: scale(0.9); border-color: #3b82f6; background: #eff6ff; }
        .drop-zone.active { background: #dbeafe; transform: scale(1.05); border-style: solid; border-color: #1d4ed8; }
        .floating-word {
            position: absolute; cursor: grab; user-select: none; touch-action: none;
            background: #ffffff; color: #1e3a8a; padding: 15px 30px; border-radius: 50px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2); z-index: 50;
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            min-width: 160px; border: 3px solid #3b82f6; will-change: transform; left: 0; top: 0;
        }
        .floating-word:active { cursor: grabbing; }
        .floating-word .word-main { font-size: 1.8rem; font-weight: 800; pointer-events: none; }
        .floating-word .word-sub { font-size: 0.8rem; opacity: 0.6; font-weight: 600; pointer-events: none; }
        #match-overlay {
            position: fixed; inset: 0; background: rgba(30, 58, 138, 0.9);
            display: none; align-items: center; justify-content: center; z-index: 2000; backdrop-filter: blur(5px);
        }
        .congrats-window {
            background: white; border-radius: 40px; padding: 40px; width: 90%; max-width: 450px;
            text-align: center; color: #1e3a8a; box-shadow: 0 25px 50px rgba(0,0,0,0.3);
            animation: popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        @keyframes popIn { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .mic-btn { background: #3b82f6; color: white; width: 45px; height: 45px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; }
        .lang-btn, .opt-btn { transition: all 0.2s; border: 2px solid transparent; }
        .lang-btn.selected, .opt-btn.selected { border-color: #3b82f6; background-color: #eff6ff; transform: scale(1.02); }
        .nav-btn {
            background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(8px); border: 1px solid rgba(255, 255, 255, 0.3);
            color: white; width: 40px; height: 40px; border-radius: 12px; display: flex;
            align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s;
        }
        .nav-btn:active { transform: scale(0.9); background: rgba(255, 255, 255, 0.4); }
    </style>
</head>
<body>

<div id="start-screen" class="fixed inset-0 bg-white flex items-center justify-center z-[10000]">
    <div class="max-w-md w-full px-6 py-4 text-center">
        <div class="mb-3 flex justify-center">
            <div class="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg rotate-3">
                <span class="text-white text-2xl font-black">123</span>
            </div>
        </div>
        <h1 class="text-2xl font-black text-blue-900">SỐ ĐẾM</h1>
        <p class="text-blue-500 mb-4 font-semibold text-sm italic">Vietnamese Numbers</p>
        
        <div class="bg-blue-50 p-3 rounded-2xl mb-3">
            <p class="text-[9px] font-bold text-blue-400 uppercase tracking-widest mb-2">Select Language</p>
            <div class="grid grid-cols-2 gap-2">
                <button id="btn-en" onclick="selectLang('en')" class="lang-btn py-2 bg-white text-blue-900 rounded-xl font-bold text-sm shadow-sm selected">
                    🇬🇧 English
                </button>
                <button id="btn-ru" onclick="selectLang('ru')" class="lang-btn py-2 bg-white text-blue-900 rounded-xl font-bold text-sm shadow-sm">
                    🇷🇺 Русский
                </button>
            </div>
        </div>

        <div class="bg-slate-50 p-3 rounded-2xl mb-4">
            <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">Choose Study Group</p>
            <div class="flex flex-col gap-1.5">
                <button id="opt-1" onclick="selectOption(1)" class="opt-btn w-full py-2.5 px-4 bg-white text-blue-900 rounded-xl font-bold shadow-sm text-left flex justify-between items-center selected">
                    <span class="text-sm">Option 1: 0 - 10</span>
                    <span class="text-[10px] opacity-50 font-normal italic">Basic</span>
                </button>
                <button id="opt-2" onclick="selectOption(2)" class="opt-btn w-full py-2.5 px-4 bg-white text-blue-900 rounded-xl font-bold shadow-sm text-left flex justify-between items-center">
                    <span class="text-sm">Option 2: 11 - 20</span>
                    <span class="text-[10px] opacity-50 font-normal italic">Advanced</span>
                </button>
                <button id="opt-3" onclick="selectOption(3)" class="opt-btn w-full py-2.5 px-4 bg-white text-blue-900 rounded-xl font-bold shadow-sm text-left flex justify-between items-center">
                    <span class="text-sm">Option 3: Tens & Large</span>
                    <span class="text-[10px] opacity-50 font-normal italic">Big numbers</span>
                </button>
            </div>
        </div>

        <button onclick="enterGame()" class="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-xl shadow-lg hover:bg-blue-700 active:scale-95 transition-all">
            START GAME
        </button>
    </div>
</div>

<div class="game-container hidden" id="game-app">
    <div class="p-4 bg-white/10 backdrop-blur-md flex justify-between items-center z-10 border-b border-white/20">
        <div class="flex items-center gap-4">
            <button onclick="exitToMenu()" class="text-white opacity-60 hover:opacity-100 transition-opacity">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
            </button>
            <div>
                <h1 class="text-xl font-black text-white" id="ui-title">Vietnamese Numbers</h1>
                <p class="text-[10px] font-bold text-blue-100 uppercase tracking-widest"><span id="ui-level-label">LEVEL</span> <span id="level-display">1</span></p>
            </div>
            <div class="flex gap-2 ml-2">
                <button onclick="changeRound(-1)" class="nav-btn" title="Quay lại">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <button onclick="changeRound(1)" class="nav-btn" title="Tiếp theo">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>
        </div>
        <div class="bg-white/20 px-4 py-2 rounded-2xl text-right min-w-[100px]">
            <div class="text-[10px] font-bold text-blue-100 uppercase" id="ui-match-label">Matches</div>
            <div class="text-xl font-black text-white"><span id="progress-display">0</span> / <span id="total-display">6</span></div>
        </div>
    </div>

    <div id="play-area" class="flex-grow relative overflow-hidden flex items-center justify-center">
        <div id="targets-container"></div>
    </div>

    <div id="match-overlay">
        <div class="congrats-window">
            <h3 class="text-blue-600 font-black uppercase tracking-widest text-sm mb-6" id="ui-great-work">Great Work!</h3>
            <div id="congrats-list" class="flex flex-col gap-4 max-h-[40vh] overflow-y-auto pr-2"></div>
            <button id="close-overlay-btn" class="mt-8 w-full py-5 bg-blue-600 text-white rounded-3xl font-black text-2xl hover:bg-blue-700 shadow-lg active:scale-95 transition-all">
                NEXT
            </button>
        </div>
    </div>

    <div id="modal" class="hidden fixed inset-0 bg-blue-900/90 flex items-center justify-center z-[3000] p-4 backdrop-blur-sm">
        <div class="bg-white rounded-3xl p-10 max-w-sm w-full text-center shadow-2xl">
            <div class="text-6xl mb-6">🏆</div>
            <h2 id="modal-title" class="text-3xl font-black mb-2 text-blue-900">Level Complete!</h2>
            <p id="modal-text" class="text-blue-600 mb-8 font-semibold italic">Excellent progress!</p>
            <button id="modal-btn" class="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-xl shadow-lg active:scale-95 transition-all">
                NEXT STAGE
            </button>
        </div>
    </div>
</div>

<script>
    const dropSfx = new Audio('https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3');

    const rawNumberData = {
        opt1: [
            { num: 0, word: "Không", en: "Zero", ru: "Ноль" },
            { num: 1, word: "Một", en: "One", ru: "Один" },
            { num: 2, word: "Hai", en: "Two", ru: "Два" },
            { num: 3, word: "Ba", en: "Three", ru: "Три" },
            { num: 4, word: "Bốn", en: "Four", ru: "Четыре" },
            { num: 5, word: "Năm", en: "Five", ru: "Пять" },
            { num: 6, word: "Sáu", en: "Six", ru: "Шесть" },
            { num: 7, word: "Bảy", en: "Seven", ru: "Семь" },
            { num: 8, word: "Tám", en: "Eight", ru: "Восемь" },
            { num: 9, word: "Chín", en: "Nine", ru: "Девять" },
            { num: 10, word: "Mười", en: "Ten", ru: "Десять" }
        ],
        opt2: [
            { num: 11, word: "Mười một", en: "Eleven", ru: "Одиннадцать" },
            { num: 12, word: "Mười hai", en: "Twelve", ru: "Двенадцать" },
            { num: 13, word: "Mười ba", en: "Thirteen", ru: "Тринадцать" },
            { num: 14, word: "Mười bốn", en: "Fourteen", ru: "Четырнадцать" },
            { num: 15, word: "Mười lăm", en: "Fifteen", ru: "Пятнадцать" },
            { num: 16, word: "Mười sáu", en: "Sixteen", ru: "Шестнадцать" },
            { num: 17, word: "Mười bảy", en: "Seventeen", ru: "Семнадцать" },
            { num: 18, word: "Mười tám", en: "Eighteen", ru: "Восемнадцать" },
            { num: 19, word: "Mười chín", en: "Nineteen", ru: "Девятнадцать" },
            { num: 20, word: "Hai mươi", en: "Twenty", ru: "Двадцать" }
        ],
        opt3: [
            { num: 10, word: "Mười", en: "Ten", ru: "Десять" },
            { num: 20, word: "Hai mươi", en: "Twenty", ru: "Двадцать" },
            { num: 30, word: "Ba mươi", en: "Thirty", ru: "Тридцать" },
            { num: 40, word: "Bốn mươi", en: "Forty", ru: "Сорок" },
            { num: 50, word: "Năm mươi", en: "Fifty", ru: "Пятьдесят" },
            { num: 60, word: "Sáu mươi", en: "Sixty", ru: "Шестьдесят" },
            { num: 70, word: "Bảy mươi", en: "Seventy", ru: "Семьдесят" },
            { num: 80, word: "Tám mươi", en: "Eighty", ru: "Восемьдесят" },
            { num: 90, word: "Chín mươi", en: "Ninety", ru: "Девяносто" },
            { num: 100, word: "Một trăm", en: "One Hundred", ru: "Сто" },
            { num: "1K", word: "Một nghìn", en: "One Thousand", ru: "Тысяча" },
            { num: "1M", word: "Một triệu", en: "One Million", ru: "Миллион" },
            { num: "1B", word: "Một tỷ", en: "One Billion", ru: "Миллиард" }
        ]
    };

    const translations = {
        en: {
            title: "Vietnamese Numbers", level: "LEVEL", matches: "MATCHES",
            greatWork: "Great Work!", next: "NEXT", lvlComplete: "Level Complete!",
            expert: "You're doing great!", congrats: "Congratulations!",
            mastered: "Numbers Mastered!", playAgain: "PLAY AGAIN",
            stage: "NEXT STAGE", drop: "MATCH"
        },
        ru: {
            title: "Вьетнамские цифры", level: "УРОВЕНЬ", matches: "МАТЧИ",
            greatWork: "Отлично!", next: "ДАЛЕЕ", lvlComplete: "Уровень пройден!",
            expert: "Отличный прогресс!", congrats: "Поздравляем!",
            mastered: "Цифры освоены!", playAgain: "ИГРАТЬ СНОВА",
            stage: "СЛЕДУЮЩИЙ ЭТАП", drop: "МАТЧ"
        }
    };

    let selectedLang = 'en';
    let selectedOption = 1;
    let numberData = [];
    let currentLevel = 1;
    let score = 0;
    let activeWords = [];
    let animationFrame;
    let currentTargetsData = [];
    let matchedInBatch = [];
    let internalLevelStep = 0;
    
    const playArea = document.getElementById('play-area');
    const targetsContainer = document.getElementById('targets-container');
    const levelDisplay = document.getElementById('level-display');
    const progressDisplay = document.getElementById('progress-display');
    const totalDisplay = document.getElementById('total-display');
    const modal = document.getElementById('modal');
    const modalBtn = document.getElementById('modal-btn');
    const modalTitle = document.getElementById('modal-title');
    const modalText = document.getElementById('modal-text');
    const matchOverlay = document.getElementById('match-overlay');
    const closeOverlayBtn = document.getElementById('close-overlay-btn');
    const congratsList = document.getElementById('congrats-list');

    const MAX_LEVEL = 4;
    let levels = {};

    function selectLang(lang) {
        selectedLang = lang;
        document.getElementById('btn-en').classList.toggle('selected', lang === 'en');
        document.getElementById('btn-ru').classList.toggle('selected', lang === 'ru');
    }

    function selectOption(opt) {
        selectedOption = opt;
        document.querySelectorAll('.opt-btn').forEach(function(b) { 
            b.classList.remove('selected'); 
        });
        document.getElementById('opt-' + opt).classList.add('selected');
    }

    function enterGame() {
        numberData = rawNumberData['opt' + selectedOption];
        
        if (selectedOption === 1) {
            levels = {
                1: { targets: 1, total: 6, speed: 1.2, sequence: [0, 1, 2, 3, 4, 5] },
                2: { targets: 1, total: 6, speed: 1.7, sequence: [5, 6, 7, 8, 9, 10] },
                3: { targets: 2, total: 10, speed: 2.3, sequence: null },
                4: { targets: 2, total: 12, speed: 3.0, sequence: null }
            };
        } else if (selectedOption === 2) {
            levels = {
                1: { targets: 1, total: 5, speed: 1.4, sequence: [11, 12, 13, 14, 15] },
                2: { targets: 1, total: 5, speed: 1.8, sequence: [16, 17, 18, 19, 20] },
                3: { targets: 2, total: 8, speed: 2.5, sequence: null },
                4: { targets: 2, total: 10, speed: 3.2, sequence: null }
            };
        } else {
            levels = {
                1: { targets: 1, total: 5, speed: 1.2, sequence: [10, 20, 50, 100, "1K"] },
                2: { targets: 1, total: 5, speed: 1.6, sequence: [70, 90, "1M", "1B", 30] },
                3: { targets: 2, total: 8, speed: 2.2, sequence: null },
                4: { targets: 2, total: 10, speed: 3.0, sequence: null }
            };
        }

        document.getElementById('start-screen').classList.add('hidden');
        document.getElementById('game-app').classList.remove('hidden');
        updateUILanguage();
        currentLevel = 1;
        initLevel();
    }

    function exitToMenu() {
        document.getElementById('game-app').classList.add('hidden');
        document.getElementById('start-screen').classList.remove('hidden');
        cancelAnimationFrame(animationFrame);
        animationFrame = null;
    }

    function updateUILanguage() {
        var t = translations[selectedLang];
        document.getElementById('ui-title').innerText = t.title;
        document.getElementById('ui-level-label').innerText = t.level;
        document.getElementById('ui-match-label').innerText = t.matches;
        document.getElementById('ui-great-work').innerText = t.greatWork;
        document.getElementById('close-overlay-btn').innerText = t.next;
    }

    function initLevel() {
        var config = levels[currentLevel];
        score = 0;
        internalLevelStep = 0;
        levelDisplay.innerText = currentLevel;
        totalDisplay.innerText = config.total;
        updateProgress();
        spawnTargets();
        if (!animationFrame) animate();
    }

    function updateProgress() {
        progressDisplay.innerText = score;
    }

    function changeRound(direction) {
        var config = levels[currentLevel];
        var newScore = score + (direction * (currentTargetsData.length || 1));
        if (newScore < 0) newScore = 0;
        if (newScore > config.total) {
            showLevelModal();
            return;
        }
        score = newScore;
        updateProgress();
        if (config.sequence) {
            internalLevelStep += direction;
            if (internalLevelStep < 0) internalLevelStep = 0;
            if (internalLevelStep >= config.sequence.length) {
                showLevelModal();
                return;
            }
        }
        spawnTargets();
    }

    function spawnTargets() {
        targetsContainer.innerHTML = '';
        matchedInBatch = [];
        currentTargetsData = [];
        var config = levels[currentLevel];
        
        if (config.sequence) {
            var targetVal = config.sequence[internalLevelStep];
            var found = numberData.find(function(d) { 
                return d.num === targetVal; 
            });
            if(found) currentTargetsData.push(found);
        } else {
            var shuffled = [...numberData].sort(function() { 
                return Math.random() - 0.5; 
            });
            for(var i=0; i<Math.min(config.targets, shuffled.length); i++) {
                currentTargetsData.push(shuffled[i]);
            }
        }

        var isCompact = currentTargetsData.length >= 3;
        currentTargetsData.forEach(function(data) {
            var card = document.createElement('div');
            card.className = 'target-card ' + (isCompact ? 'compact' : '');
            card.id = 'target-' + data.num;
            card.innerHTML = '<span class="number-text">' + data.num + '</span><div class="drop-zone" data-num="' + data.num + '"><span class="text-[10px] font-black text-blue-300 uppercase">' + translations[selectedLang].drop + '</span></div>';
            targetsContainer.appendChild(card);
        });
        spawnWordsForBatch();
    }

    function spawnWordsForBatch() {
        activeWords.forEach(function(w) { 
            w.el.remove(); 
        });
        activeWords = [];
        var config = levels[currentLevel];
        
        currentTargetsData.forEach(function(data) {
            var el = document.createElement('div');
            el.className = "floating-word";
            el.innerHTML = '<div class="word-main">' + data.word + '</div><div class="word-sub">' + data[selectedLang] + '</div>';
            playArea.appendChild(el);
            
            var rect = el.getBoundingClientRect();
            var width = rect.width || 160;
            var height = rect.height || 70;

            var wordObj = {
                el: el, num: data.num,
                x: Math.random() * (window.innerWidth - width),
                y: Math.random() * (window.innerHeight - 300) + 150,
                dx: (Math.random() - 0.5) * config.speed * 2,
                dy: (Math.random() - 0.5) * config.speed * 2,
                isDragging: false, width: width, height: height, data: data
            };
            setupDrag(wordObj);
            activeWords.push(wordObj);
        });
    }

    function setupDrag(wordObj) {
        var el = wordObj.el;
        var startX, startY;

        function onMove(e) {
            if (!wordObj.isDragging) return;
            if (e.cancelable) e.preventDefault();
            var clientX = e.touches ? e.touches[0].clientX : e.clientX;
            var clientY = e.touches ? e.touches[0].clientY : e.clientY;
            wordObj.x = clientX - startX;
            wordObj.y = clientY - startY;
            el.style.transform = 'translate3d(' + wordObj.x + 'px, ' + wordObj.y + 'px, 0)';
            
            var wordRect = el.getBoundingClientRect();
            document.querySelectorAll('.drop-zone').forEach(function(zone) {
                var zr = zone.getBoundingClientRect();
                var overlap = Math.max(0, Math.min(wordRect.right, zr.right) - Math.max(wordRect.left, zr.left)) * Math.max(0, Math.min(wordRect.bottom, zr.bottom) - Math.max(wordRect.top, zr.top));
                if (overlap > (zr.width * zr.height * 0.4)) {
                    zone.classList.add('active');
                } else {
                    zone.classList.remove('active');
                }
            });
        }

        function onEnd(e) {
            if (!wordObj.isDragging) return;
            wordObj.isDragging = false;
            el.style.zIndex = 50;
            var wordRect = el.getBoundingClientRect();
            document.querySelectorAll('.drop-zone').forEach(function(zone) {
                var zr = zone.getBoundingClientRect();
                var overlap = Math.max(0, Math.min(wordRect.right, zr.right) - Math.max(wordRect.left, zr.left)) * Math.max(0, Math.min(wordRect.bottom, zr.bottom) - Math.max(wordRect.top, zr.top));
                zone.classList.remove('active');
                if (overlap > (zr.width * zr.height * 0.4) && String(zone.dataset.num) === String(wordObj.num)) {
                    dropSfx.currentTime = 0;
                    dropSfx.play().catch(function() {});
                    handleCorrect(wordObj);
                }
            });
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onEnd);
            window.removeEventListener('touchmove', onMove);
            window.removeEventListener('touchend', onEnd);
        }

        function onStart(e) {
            wordObj.isDragging = true;
            el.style.zIndex = 1000;
            var clientX = e.touches ? e.touches[0].clientX : e.clientX;
            var clientY = e.touches ? e.touches[0].clientY : e.clientY;
            startX = clientX - wordObj.x;
            startY = clientY - wordObj.y;
            window.addEventListener('mousemove', onMove, { passive: false });
            window.addEventListener('mouseup', onEnd);
            window.addEventListener('touchmove', onMove, { passive: false });
            window.addEventListener('touchend', onEnd);
        }

        el.addEventListener('mousedown', onStart);
        el.addEventListener('touchstart', onStart, { passive: false });
    }

    function handleCorrect(wordObj) {
        score++;
        updateProgress();
        matchedInBatch.push(wordObj.data);
        var card = document.getElementById('target-' + wordObj.num);
        if(card) card.classList.add('completed');
        
        // PHÁT ÂM THANH KHI DROP ĐÚNG
        speakVietnamese(wordObj.data.word);
        
        wordObj.el.remove();
        activeWords = activeWords.filter(function(w) { 
            return w !== wordObj; 
        });
        if (matchedInBatch.length === currentTargetsData.length) {
            var config = levels[currentLevel];
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#1e40af', '#3b82f6', '#ffffff'] });
            if (config.sequence) {
                 internalLevelStep++;
                 if (score >= config.total) {
                     showLevelModal();
                 } else {
                     setTimeout(function() { 
                         spawnTargets(); 
                     }, 1200);
                 }
            } else {
                 if (score >= config.total) {
                     showLevelModal();
                 } else {
                     setTimeout(function() { 
                         spawnTargets(); 
                     }, 1200);
                 }
            }
        }
    }

    function showCongratsOverlay(dataList) {
        congratsList.innerHTML = '';
        dataList.forEach(function(data) {
            var item = document.createElement('div');
            item.className = "flex items-center justify-between p-4 bg-blue-50 rounded-2xl";
            item.innerHTML = '<div><div class="text-3xl font-black text-blue-800">' + data.num + ': ' + data.word + '</div><div class="text-[10px] text-blue-400 uppercase font-bold tracking-widest">' + data[selectedLang] + '</div></div><div class="mic-btn" onclick="speakVietnamese(\'' + data.word + '\')">🔊</div>';
            congratsList.appendChild(item);
        });
        matchOverlay.style.display = 'flex';
    }

    // HÀM SPEAK MỚI DÙNG PROXY
    function speakVietnamese(text) {
        if (!text) return;
        
        // Dừng âm thanh đang phát
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
        
        // Clean text
        var cleanText = text.replace(/[*_\`#]/g, '').trim();
        if (!cleanText) return;
        
        // Dùng proxy API
        var url = '/api/tts?text=' + encodeURIComponent(cleanText) + '&lang=vi';
        var audio = new Audio(url);
        
        audio.onerror = function() {
            var fallback = new SpeechSynthesisUtterance(cleanText);
            fallback.lang = 'vi-VN';
            window.speechSynthesis.speak(fallback);
        };
        
        audio.play().catch(function() {
            var fallback = new SpeechSynthesisUtterance(cleanText);
            fallback.lang = 'vi-VN';
            window.speechSynthesis.speak(fallback);
        });
    }

    closeOverlayBtn.onclick = function() {
        matchOverlay.style.display = 'none';
        if (score >= levels[currentLevel].total) {
            showLevelModal();
        } else {
            spawnTargets();
        }
    };

    function showLevelModal() {
        var t = translations[selectedLang];
        modal.classList.remove('hidden');
        if (currentLevel < MAX_LEVEL) {
            modalTitle.innerText = t.lvlComplete;
            modalText.innerText = t.expert;
            modalBtn.innerText = t.stage;
        } else {
            modalTitle.innerText = t.congrats;
            modalText.innerHTML = '<span class="text-2xl block mt-2 text-blue-800 font-black">' + t.mastered + '</span>';
            modalBtn.innerText = t.playAgain;
            confetti({ particleCount: 300, spread: 150, origin: { y: 0.5 } });
        }
    }

    function animate() {
        var area = playArea.getBoundingClientRect();
        activeWords.forEach(function(word) {
            if (!word.isDragging) {
                word.x += word.dx; 
                word.y += word.dy;
                if (word.x <= 0 || word.x >= area.width - word.width) word.dx *= -1;
                if (word.y <= 0 || word.y >= area.height - word.height) word.dy *= -1;
                word.el.style.transform = 'translate3d(' + word.x + 'px, ' + word.y + 'px, 0)';
            }
        });
        animationFrame = requestAnimationFrame(animate);
    }

    modalBtn.onclick = function() {
        modal.classList.add('hidden');
        if (currentLevel < MAX_LEVEL) {
            currentLevel++;
            initLevel();
        } else {
            exitToMenu();
        }
    };
    
    window.addEventListener('resize', function() {
        activeWords.forEach(function(word) {
            var rect = word.el.getBoundingClientRect();
            word.width = rect.width;
            word.height = rect.height;
            if (word.x > window.innerWidth - word.width) word.x = window.innerWidth - word.width;
            if (word.y > window.innerHeight - word.height) word.y = window.innerHeight - word.height;
        });
    });
</script>
</body>
</html>
`;

export const GameVocabularyNumbers: React.FC = () => {
    const gameWrapperRef = useRef<HTMLDivElement>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [iframeSrc, setIframeSrc] = useState<string | undefined>(undefined);

    useEffect(() => {
        const blob = new Blob([gameHTML], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        setIframeSrc(url);
        return () => URL.revokeObjectURL(url);
    }, []);

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
                elem.requestFullscreen().catch(function(err) {
                    alert('Error attempting to enable full-screen mode: ' + err.message);
                });
            } else {
                document.exitFullscreen();
            }
        }
    };

    return (
        <div ref={gameWrapperRef} className="relative w-full h-full bg-slate-900">
            {iframeSrc && (
                <iframe
                    src={iframeSrc}
                    className="w-full h-full"
                    style={{ border: 'none' }}
                    allow="fullscreen"
                    title="Vietnamese Numbers Game"
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

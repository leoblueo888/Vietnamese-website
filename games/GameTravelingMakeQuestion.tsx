
import React, { useState, useEffect, useRef } from 'react';
import { Maximize, Minimize } from 'lucide-react';

const gameHTML = `
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ASK QUESTION VIET: Traveling</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@400;600;700&display=swap');

        body {
            font-family: 'Quicksand', sans-serif;
            background: #f0f2f5; 
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            margin: 0;
            overflow: hidden;
            touch-action: none;
        }

        .game-card {
            background: url('https://lh3.googleusercontent.com/d/1o4lGU3OxuslOebMfNJT-xNoPA_0qWto_') no-repeat center center;
            background-size: cover;
            border-radius: 1.5rem;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4);
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            position: relative;
            overflow: hidden;
            border: 4px solid white;
        }

        /* --- START WINDOW --- */
        .overlay {
            position: absolute;
            inset: 0;
            background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            padding: 10px; 
            text-align: center;
        }

        .start-container {
            width: 100%;
            max-width: 400px; 
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        .game-title {
            background: linear-gradient(45deg, #4f46e5, #9333ea);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            font-size: 1.8rem; 
            font-weight: 800;
            line-height: 1.1;
            margin-bottom: 1rem; 
            text-transform: uppercase;
        }

        .how-to-play-box {
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 1rem;
            padding: 1rem; 
            width: 100%;
            text-align: left;
            margin-bottom: 1rem; 
            box-shadow: 0 4px 10px rgba(0,0,0,0.05);
        }

        .htp-title {
            color: #6366f1;
            font-weight: 800;
            font-size: 0.75rem;
            letter-spacing: 0.05em;
            margin-bottom: 0.6rem;
            text-transform: uppercase;
        }

        .htp-step {
            display: flex;
            align-items: flex-start;
            gap: 8px;
            margin-bottom: 0.5rem; 
            font-size: 0.85rem; 
            color: #475569;
            font-weight: 600;
        }

        .step-num {
            background: linear-gradient(135deg, #6366f1, #4f46e5);
            color: white;
            width: 18px;
            height: 18px;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.65rem;
            flex-shrink: 0;
        }

        .lang-label {
            color: #64748b;
            font-size: 0.6rem;
            font-weight: 800;
            margin-bottom: 0.5rem;
            text-transform: uppercase;
        }

        .lang-selector {
            display: flex;
            gap: 6px;
            width: 100%;
            margin-bottom: 1rem;
        }

        .lang-btn {
            flex: 1;
            padding: 0.6rem;
            border-radius: 0.8rem;
            font-weight: 800;
            font-size: 0.75rem;
            text-transform: uppercase;
        }

        .btn-start-main {
            background: linear-gradient(135deg, #4f46e5, #6366f1);
            color: white;
            width: 100%;
            padding: 1rem;
            border-radius: 1rem;
            font-weight: 800;
            font-size: 1rem;
            text-transform: uppercase;
        }

        /* --- GAMEPLAY --- */
        #game-header {
            flex-shrink: 0;
            background: rgba(255, 255, 255, 0.9);
            backdrop-filter: blur(8px);
            padding: 1rem 1.5rem;
            display: grid;
            grid-template-columns: 1fr auto 1fr;
            align-items: center;
            z-index: 100;
        }

        .nav-btn {
            background: white;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
        }

        .btn-next-round {
            background: #4f46e5;
            color: white;
            padding: 8px 24px;
            border-radius: 12px;
            font-weight: 900;
            font-size: 14px;
            opacity: 1;
            pointer-events: auto;
        }

        .scene-container {
            flex: 1;
            position: relative;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }

        .bubble-area {
            padding: 130px 20px 20px;
            display: flex;
            flex-direction: column;
            gap: 1.2rem;
        }

        .drop-zone {
            border: 3px dashed #6366f1;
            background: rgba(255, 255, 255, 0.9);
            min-height: 80px;
            border-radius: 1.5rem;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #6366f1;
            font-weight: 700;
            padding: 15px 25px;
            width: fit-content; 
            max-width: 80%;
        }

        .bubble {
            padding: 1.2rem 1.8rem;
            border-radius: 1.5rem;
            width: fit-content; 
            max-width: 80%;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            background: white;
        }

        .bubble-user-ans {
            align-self: flex-start;
            border: 3px solid #6366f1;
            background: #f5f3ff;
        }

        .bubble-ella-quest {
            align-self: flex-end;
            border-left: 8px solid #0ea5e9;
        }

        .draggable-item {
            position: absolute;
            background: white;
            padding: 15px 25px;
            border-radius: 1.5rem;
            box-shadow: 0 15px 35px rgba(0,0,0,0.15);
            border: 2px solid #6366f1;
            cursor: grab;
            user-select: none;
            width: fit-content;
            max-width: 300px;
            text-align: center;
            z-index: 100;
            animation: floating 4s ease-in-out infinite;
        }

        .word-chip {
            display: inline-block;
            cursor: pointer;
            padding: 0px 4px;
            font-weight: 700;
            border-radius: 4px;
            transition: all 0.2s;
            position: relative;
        }
        
        .word-chip:hover {
            background-color: #e0e7ff;
            color: #4f46e5;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .word-chip.question-word-active {
            color: #ef4444;
            background-color: #fee2e2;
        }

        .tooltip-box {
            position: absolute;
            bottom: 120%;
            left: 50%;
            transform: translateX(-50%);
            background: #1e293b;
            color: white;
            padding: 8px 12px;
            border-radius: 8px;
            font-size: 11px;
            width: 180px;
            z-index: 500;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.3s;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            text-align: center;
            font-weight: 500;
            line-height: 1.4;
        }
        
        .tooltip-box::after {
            content: '';
            position: absolute;
            top: 100%;
            left: 50%;
            margin-left: -5px;
            border-width: 5px;
            border-style: solid;
            border-color: #1e293b transparent transparent transparent;
        }

        .word-chip:hover .tooltip-box {
            opacity: 1;
        }

        .mini-speaker {
            cursor: pointer;
            padding: 8px;
            border-radius: 50%;
            background: #f0f9ff;
            border: 1px solid #bae6fd;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1rem;
        }

        .hidden { display: none !important; }

        .review-page {
            position: absolute;
            inset: 0;
            background: white;
            z-index: 200;
            display: flex;
            flex-direction: column;
            padding: 20px;
        }

        .btn-listen-all {
            background: #10b981;
            color: white;
            padding: 12px 24px;
            border-radius: 1rem;
            font-weight: 800;
            font-size: 0.9rem;
            margin-bottom: 1.5rem;
        }

        @keyframes floating {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-15px); }
            100% { transform: translateY(0px); }
        }
    </style>
</head>
<body onload="initApp()">

    <div class="game-card" id="main-card">
        <!-- START WINDOW -->
        <div id="start-overlay" class="overlay">
            <div class="start-container">
                <h1 class="game-title">ASK QUESTION<br>VIETNAMESE</h1>
                
                <div class="how-to-play-box">
                    <div id="htp-title" class="htp-title">
                        <span>✨</span> HOW TO PLAY
                    </div>
                    <div class="htp-step">
                        <span class="step-num">1</span>
                        <span id="step-1">Read the traveler's answer.</span>
                    </div>
                    <div class="htp-step">
                        <span class="step-num">2</span>
                        <span id="step-2">Drag the correct 'Question' into the box.</span>
                    </div>
                    <div class="htp-step">
                        <span class="step-num">3</span>
                        <span id="step-3">Tap on words to hear pronunciation.</span>
                    </div>
                </div>

                <div class="lang-label">NGÔN NGỮ DỊCH / TRANSLATION</div>
                <div class="lang-selector">
                    <button id="lang-en" onclick="setLang('en')" class="lang-btn bg-indigo-600 text-white active">ENGLISH</button>
                    <button id="lang-ru" onclick="setLang('ru')" class="lang-btn bg-white text-slate-500 border border-slate-200 inactive">RUSSIAN</button>
                </div>

                <button id="btn-start" onclick="startGame()" class="btn-start-main">START NOW</button>
            </div>
        </div>

        <!-- Header -->
        <div id="game-header" class="hidden">
            <div class="flex items-center gap-4">
                <button onclick="prevRound()" class="nav-btn shadow-sm border border-slate-200">←</button>
                <div class="flex flex-col">
                    <span id="topic-label" class="text-[9px] font-black text-blue-600 uppercase">TRAVEL TOPIC</span>
                    <h2 id="round-title" class="text-[13px] font-black text-slate-900">ROUND 1/8</h2>
                </div>
                <button onclick="forceNextRound()" class="nav-btn shadow-sm border border-slate-200">→</button>
            </div>

            <div class="flex justify-center">
                <button id="next-round-btn" onclick="nextRound()" class="btn-next-round">NEXT →</button>
            </div>

            <div class="flex flex-col items-end">
                <div class="w-24 h-2 bg-slate-200 rounded-full">
                    <div id="progress-bar" class="h-full bg-blue-600 transition-all duration-500" style="width: 10%"></div>
                </div>
            </div>
        </div>

        <div class="scene-container" id="scene-root">
            <div class="bubble-area" id="bubble-list"></div>
            <div class="floating-box-container" id="floating-box"></div>
            
            <div id="round-9-page" class="review-page hidden">
                <h2 id="review-title" class="text-2xl font-black mb-4 text-center uppercase text-slate-800">Review Lesson</h2>
                <div class="flex justify-center">
                    <button id="btn-listen-all" onclick="listenAll()" class="btn-listen-all flex items-center gap-2">
                        <span>🔊</span> LISTEN ALL
                    </button>
                </div>
                <div id="review-list" class="overflow-y-auto flex-1 space-y-4 px-2"></div>
                <button id="btn-play-again" onclick="location.reload()" class="mt-4 w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-lg">Play Again</button>
            </div>
        </div>
    </div>

    <script>
        const travelData = [
            { q: "Bạn có thích đi du lịch không?", ans: "Có! mình rất thích đi du lịch.", ansTrans: { en: "Yes! I really like traveling.", ru: "Да! Мне rất thích путешествовать." }, en: "Do you like traveling?", ru: "Тебе нравится путешествовать?", distractors: [{vi: "Bạn đi đâu?", trans: {en: "Where do you go?", ru: "Куда ты едешь?"}}, {vi: "Bạn là ai?", trans: {en: "Who are you?", ru: "Кто ты?"}}] },
            { q: "Một năm bạn đi du lịch mấy lần?", ans: "Một năm mình đi du lịch 2 lần vào mùa Hè và mùa Xuân.", ansTrans: { en: "I travel twice a year in Summer and Spring.", ru: "Я путешествую дважды в год, летом và весной." }, en: "How many times a year do you travel?", ru: "Сколько раз v год ты путешествуешь?", distractors: [{vi: "Bạn đi bằng gì?", trans: {en: "How do you go?", ru: "На чем ты е đề?"}}, {vi: "Bạn mấy tuổi?", trans: {en: "How old are you?", ru: "Сколько тебе лет?"}}] },
            { q: "Chuyến đi thú vị nhất của bạn là đến địa điểm nào?", ans: "Đó là chuyến đi đến Đà Nẵng vào năm ngoái.", ansTrans: { en: "That was the trip to Da Nang last year.", ru: "Это была поездка в Дананг в прошлом году." }, en: "Which place was your most interesting trip to?", ru: "В какое место была твоя самая интересная поездка?", distractors: [{vi: "Đà Nẵng ở đâu?", trans: {en: "Where is Da Nang?", ru: "Где Дананг?"}}, {vi: "Bạn ăn gì?", trans: {en: "What do you eat?", ru: "Что ты éшь?"}}] },
            { q: "Bạn thường đi du lịch với ai?", ans: "Mình thường đi du lịch với bạn bè hoặc gia đình.", ansTrans: { en: "I usually travel with friends or family.", ru: "Я thường xuyên đi du lịch với bạn bè hoặc gia đình." }, en: "Who do you usually travel with?", ru: "С кем ты thường xuyên đi du lịch?", distractors: [{vi: "Bạn đi khi nào?", trans: {en: "When do you go?", ru: "Когда ты е đề?"}}, {vi: "Họ là ai?", trans: {en: "Who are they?", ru: "Кто họ?"}}] },
            { q: "Bạn thường đi du lịch bằng phương tiện gì?", ans: "Mình thường đi bằng xe máy hoặc máy bay.", ansTrans: { en: "I usually go by motorbike or plane.", ru: "Я thường xuyên đi bằng xe máy hoặc máy bay." }, en: "What means of transport do you usually use?", ru: "Каким транспортом ты thường xuyên sử dụng?", distractors: [{vi: "Xe máy màu gì?", trans: {en: "What color is the bike?", ru: "Какого цвета мотоцикл?"}}, {vi: "Vé bao nhiêu?", trans: {en: "How much is the ticket?", ru: "Сколько стоит билет?"}}] },
            { q: "Bạn thường mang theo những gì khi đi du lịch?", ans: "Mình thường mang những đồ dùng cần thiết.", ansTrans: { en: "I usually bring necessary items.", ru: "Я thường mang theo những đồ dùng cần thiết." }, en: "What do you usually bring?", ru: "Что ты thường mang theo?", distractors: [{vi: "Túi của ai?", trans: {en: "Whose bag?", ru: "Чья сумка?"}}, {vi: "Bạn mua gì?", trans: {en: "What did you buy?", ru: "Что ты купил?"}}] },
            { q: "Bạn thường làm gì trong mỗi chuyến du lịch?", ans: "Mình đến thăm các địa điểm nổi tiếng, ăn những món ăn ngon.", ansTrans: { en: "I visit famous places and eat delicious food.", ru: "Я посещаю известные места và ăn những món ăn ngon." }, en: "What do you usually do during each trip?", ru: "Что ты thường làm trong mỗi chuyến đi?", distractors: [{vi: "Món ăn nào ngon?", trans: {en: "Which food is good?", ru: "Какая еда вкусная?"}}, {vi: "Bạn ngủ ở đâu?", trans: {en: "Where do you sleep?", ru: "Где ты спишь?"}}] },
            { q: "Bạn đã đi du lịch những thành phố nào ở Việt Nam?", ans: "Mình đã đến thăm Đà Nẵng, Hà Nội, Sài Gòn và hơn 20 thành phố khác.", ansTrans: { en: "I have visited Da Nang, Hanoi, Saigon and over 20 other cities.", ru: "Я посетил Дананг, Ханой, Сайгон và hơn 20 thành phố khác." }, en: "Which cities in Vietnam have you traveled to?", ru: "В каких городах Вьетнама ты побывал?", distractors: [{vi: "Hà Nội có đẹp không?", trans: {en: "Is Hanoi beautiful?", ru: "Ханой красивый?"}}, {vi: "Thành phố nào lớn nhất?", trans: {en: "Which city is the biggest?", ru: "Какой город самый lớn?"}}] }
        ];

        const translations = {
            en: {
                htpTitle: "HOW TO PLAY",
                step1: "Read the traveler's answer.",
                step2: "Drag the correct 'Question' into the box.",
                step3: "Tap on words to hear pronunciation.",
                btnStart: "START NOW",
                next: "NEXT →",
                topic: "TRAVEL TOPIC",
                reviewTitle: "Review Lesson",
                btnListen: "LISTEN ALL",
                btnAgain: "Play Again",
                dropText: "Drag question here...",
                noTooltip: "In Vietnamese, placing 'không' at the end turns a statement into a Yes/No question. It has no literal meaning here."
            },
            ru: {
                htpTitle: "КАК ИГРАТЬ",
                step1: "Прочитайте ответ путешественника.",
                step2: "Перетащите правильный «Вопрос» в поле.",
                step3: "Нажимайте на слова, чтобы услышать произношение.",
                btnStart: "НАЧАТЬ СЕЙЧАС",
                next: "ДАЛЕЕ →",
                topic: "ТЕМА: ПУТЕШЕСТВИЯ",
                reviewTitle: "Обзор урока",
                btnListen: "ПРОСЛУШАТЬ ВСЕ",
                btnAgain: "Играть снова",
                dropText: "Перетащите вопрос сюда...",
                noTooltip: "Во вьетнамском языке частица 'không' в конце câu biến một câu khẳng định thành câu hỏi Có/Không. Nó không có nghĩa đen trong ngữ cảnh này."
            }
        };

        const questionWordsMapping = [
            { vi: "Mấy", keywords: ["How many", "Сколько"] },
            { vi: "Gì", keywords: ["What", "Что"] },
            { vi: "Thế nào", keywords: ["How", "Как"] },
            { vi: "Ai", keywords: ["Who", "С кем", "Кто"] },
            { vi: "Nào", keywords: ["Which", "Какое", "В каких"] },
            { vi: "Đâu", keywords: ["Where", "Куда", "Где"] }
        ];

        const groups = [
            "du lịch", "mùa Hè", "mùa Xuân", "máy bay", "xe máy", "Đà Nẵng", "Sài Gòn", "Hà Nội", "gia đình", "bạn bè", 
            "món ăn", "địa điểm", "nổi tiếng", "đến thăm", "thú vị nhất", "chuyến đi", "đồ dùng", "cần thiết"
        ];

        let currentRound = 0, userLang = 'en', roundSolved = false;
        
        const successSfx = new Audio('https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3');

        function initApp() { updateUIStrings(); }

        function setLang(lang) {
            userLang = lang;
            const btnEn = document.getElementById('lang-en');
            const btnRu = document.getElementById('lang-ru');
            if(lang === 'en') {
                btnEn.className = "lang-btn bg-indigo-600 text-white active";
                btnRu.className = "lang-btn bg-white text-slate-500 border border-slate-200 inactive";
            } else {
                btnRu.className = "lang-btn bg-indigo-600 text-white active";
                btnEn.className = "lang-btn bg-white text-slate-500 border border-slate-200 inactive";
            }
            updateUIStrings();
        }

        function updateUIStrings() {
            const t = translations[userLang];
            document.getElementById('htp-title').innerHTML = \`<span>✨</span> \${t.htpTitle}\`;
            document.getElementById('step-1').innerText = t.step1;
            document.getElementById('step-2').innerText = t.step2;
            document.getElementById('step-3').innerText = t.step3;
            document.getElementById('btn-start').innerText = t.btnStart;
            document.getElementById('next-round-btn').innerText = t.next;
            document.getElementById('topic-label').innerText = t.topic;
            document.getElementById('review-title').innerText = t.reviewTitle;
            document.getElementById('btn-listen-all').innerHTML = \`<span>🔊</span> \${t.btnListen}\`;
            document.getElementById('btn-play-again').innerText = t.btnAgain;
            const drop = document.getElementById('drop-target');
            if(drop && !roundSolved) drop.innerText = t.dropText;
        }

        function startGame() { 
            document.getElementById('start-overlay').classList.add('hidden'); 
            document.getElementById('game-header').classList.remove('hidden'); 
            loadRound(); 
        }

        function loadRound() {
            roundSolved = false;
            document.getElementById('round-title').innerText = \`ROUND \${currentRound + 1}/\${travelData.length}\`;
            document.getElementById('progress-bar').style.width = \`\${((currentRound + 1) / travelData.length) * 100}%\`;
            const bubbleList = document.getElementById('bubble-list');
            bubbleList.innerHTML = '';
            const data = travelData[currentRound];
            
            const dropZone = document.createElement('div');
            dropZone.className = 'drop-zone';
            dropZone.id = 'drop-target';
            dropZone.innerText = translations[userLang].dropText;
            bubbleList.appendChild(dropZone);

            const ansBubble = document.createElement('div');
            ansBubble.className = 'bubble bubble-ella-quest';
            ansBubble.innerHTML = \`<div class="flex items-start gap-3">
                <div class="mini-speaker" onclick="speak('\${data.ans.replace(/'/g, "\\\\'")}')">🔊</div>
                <div>
                    <div class="text-[18px] font-bold leading-tight mb-2">\${renderWords(data.ans)}</div>
                    <div class="text-[13px] text-blue-500 italic font-semibold trans-box">\${userLang === 'en' ? data.ansTrans.en : data.ansTrans.ru}</div>
                </div>
            </div>\`;
            bubbleList.appendChild(ansBubble);
            renderDraggables();
        }

        function renderWords(text) {
            let processed = text;
            groups.forEach(group => {
                const regex = new RegExp(group, 'gi');
                processed = processed.replace(regex, \`__GROUP_START__\${group}__GROUP_END__\`);
            });
            const tokens = processed.split(/(__GROUP_START__|__GROUP_END__)/);
            let inGroup = false;
            let resultHtml = "";
            tokens.forEach(token => {
                if (token === "__GROUP_START__") { inGroup = true; return; }
                if (token === "__GROUP_END__") { inGroup = false; return; }
                if (!token.trim()) { resultHtml += token; return; }
                
                if (inGroup) {
                    resultHtml += \`<span class="word-chip" onmouseover="handleHover(this, '\${token.replace(/[?.!,]/g, '').replace(/'/g, "\\\\'")}')" onmouseout="resetHighlight()" onclick="speak('\${token.replace(/[?.!,]/g, '').replace(/'/g, "\\\\'")}')">\${token}</span>\`;
                } else {
                    const words = token.split(' ');
                    words.forEach((w, idx) => {
                        if (!w) return;
                        let cleanW = w.replace(/[?.!,]/g, '').replace(/'/g, "\\\\'");
                        let isLastWordInQuestion = (cleanW.toLowerCase() === "không" && idx === words.length - 1);

                        let tooltip = isLastWordInQuestion ? \`<div class="tooltip-box">\${translations[userLang].noTooltip}</div>\` : '';
                        let extraStyle = isLastWordInQuestion ? 'border-b-2 border-dotted border-slate-400' : '';

                        resultHtml += \`<span class="word-chip \${extraStyle}" onmouseover="handleHover(this, '\${cleanW}')" onmouseout="resetHighlight()" onclick="speak('\${cleanW}')">\${w}\${tooltip}</span> \`;
                    });
                }
            });
            return resultHtml;
        }

        function handleHover(element, viWord) {
            const mapping = questionWordsMapping.find(m => m.vi.toLowerCase() === viWord.toLowerCase());
            if (mapping) {
                element.classList.add('question-word-active');
                highlightQuestion(mapping);
            }
        }

        function highlightQuestion(mapping) {
            const transBoxes = document.querySelectorAll('.trans-box');
            transBoxes.forEach(box => {
                let text = box.innerText;
                mapping.keywords.forEach(key => {
                    const regex = new RegExp(\`(\${key})\`, 'gi');
                    text = text.replace(regex, \`<span class="text-red-500 font-black underline">\$1</span>\`);
                });
                box.innerHTML = text;
            });
        }

        function resetHighlight() {
            document.querySelectorAll('.word-chip').forEach(el => el.classList.remove('question-word-active'));
            const transBoxes = document.querySelectorAll('.trans-box');
            const data = travelData[currentRound];
            transBoxes.forEach(box => {
                if (box.closest('.bubble-user-ans')) {
                     box.innerText = userLang === 'en' ? data.en : data.ru;
                } else {
                     box.innerText = userLang === 'en' ? data.ansTrans.en : data.ansTrans.ru;
                }
            });
        }

        function renderDraggables() {
            const box = document.getElementById('floating-box');
            box.innerHTML = '';
            const data = travelData[currentRound];
            const options = [
                {vi: data.q, trans: userLang === 'en' ? data.en : data.ru, correct: true},
                ...data.distractors.map(d => ({vi: d.vi, trans: userLang === 'en' ? d.trans.en : d.trans.ru, correct: false}))
            ];
            options.sort(() => Math.random() - 0.5);
            options.forEach((opt, i) => {
                const el = document.createElement('div');
                el.className = 'draggable-item';
                el.dataset.correct = opt.correct;
                el.innerHTML = \`<p class="text-[15px] font-black text-blue-900">\${opt.vi}</p><p class="text-[11px] text-slate-500 italic">\${opt.trans}</p>\`;
                el.style.left = \`\${15 + Math.random() * 50}%\`;
                el.style.top = \`\${55 + Math.random() * 20}%\`;
                el.style.animationDelay = \`\${i * 0.7}s\`;
                el.addEventListener('mousedown', startDrag);
                el.addEventListener('touchstart', startDrag, {passive: false});
                box.appendChild(el);
            });
        }

        let isDragging = false, draggedElement = null, offset = {x:0, y:0};
        function startDrag(e) {
            if (roundSolved) return;
            isDragging = true;
            draggedElement = e.currentTarget;
            const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
            const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;
            const rect = draggedElement.getBoundingClientRect();
            offset = { x: clientX - rect.left, y: clientY - rect.top };
            document.addEventListener('mousemove', onDrag);
            document.addEventListener('touchmove', onDrag, {passive: false});
            document.addEventListener('mouseup', endDrag);
            document.addEventListener('touchend', endDrag);
        }

        function onDrag(e) {
            if (!isDragging || !draggedElement) return;
            if (e.type === 'touchmove') e.preventDefault();
            const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
            const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;
            const parentRect = document.getElementById('scene-root').getBoundingClientRect();
            draggedElement.style.left = (clientX - parentRect.left - offset.x) + 'px';
            draggedElement.style.top = (clientY - parentRect.top - offset.y) + 'px';
        }

        function endDrag(e) {
            if (!draggedElement) return;
            isDragging = false;
            const target = document.getElementById('drop-target');
            if(!target) return;
            const targetRect = target.getBoundingClientRect();
            const clientX = e.type === 'touchend' ? e.changedTouches[0].clientX : e.clientX;
            const clientY = e.type === 'touchend' ? e.changedTouches[0].clientY : e.clientY;
            
            if (clientX > targetRect.left && clientX < targetRect.right && clientY > targetRect.top && clientY < targetRect.bottom) {
                if (draggedElement.dataset.correct === "true") handleCorrect();
                else {
                    draggedElement.style.borderColor = "red";
                    draggedElement.style.transform = "translateX(5px)";
                    setTimeout(() => draggedElement.style.transform = "translateX(0)", 100);
                }
            }
            document.removeEventListener('mousemove', onDrag);
            document.removeEventListener('touchmove', onDrag);
            document.removeEventListener('mouseup', endDrag);
            document.removeEventListener('touchend', endDrag);
        }

        function handleCorrect() {
            roundSolved = true;
            
            successSfx.currentTime = 0;
            successSfx.play().catch(e => console.log("Audio play failed", e));
            
            confetti({ particleCount: 40, spread: 45, origin: { y: 0.6 } });
            
            const data = travelData[currentRound];
            const target = document.getElementById('drop-target');
            target.innerHTML = \`<div class="flex items-start gap-3 w-full text-left">
                <div class="mini-speaker" onclick="speak('\${data.q.replace(/'/g, "\\\\'")}')">🔊</div>
                <div>
                    <div class="text-[18px] font-bold leading-tight mb-2">\${renderWords(data.q)}</div>
                    <div class="text-[13px] text-indigo-500 italic font-semibold trans-box">\${userLang === 'en' ? data.en : data.ru}</div>
                </div>
            </div>\`;
            target.className = 'bubble bubble-user-ans';
            
            document.getElementById('floating-box').innerHTML = '';
            
            speakSequential(data.q, data.ans);
        }

        function speakSequential(text1, text2) {
            const a1 = new Audio(\`https://translate.google.com/translate_tts?ie=UTF-8&q=\${encodeURIComponent(text1)}&tl=vi&client=tw-ob\`);
            a1.play();
            a1.onended = () => { setTimeout(() => { new Audio(\`https://translate.google.com/translate_tts?ie=UTF-8&q=\${encodeURIComponent(text2)}&tl=vi&client=tw-ob\`).play(); }, 600); };
        }

        function prevRound() { if (currentRound > 0) { currentRound--; loadRound(); } }
        function forceNextRound() { if (currentRound < travelData.length - 1) { currentRound++; loadRound(); } }
        function nextRound() {
            if (currentRound < travelData.length - 1) { currentRound++; loadRound(); }
            else { 
                document.getElementById('game-header').classList.add('hidden'); 
                document.getElementById('round-9-page').classList.remove('hidden'); 
                renderReview(); 
            }
        }

        function renderReview() {
            const list = document.getElementById('review-list');
            list.innerHTML = travelData.map((d, i) => \`
                <div class="p-4 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm">
                    <div class="flex items-center justify-between mb-2">
                         <span class="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Conversation \${i + 1}</span>
                         <div class="mini-speaker w-8 h-8" onclick="speakSequential('\${d.q.replace(/'/g, "\\\\'")}', '\${d.ans.replace(/'/g, "\\\\'")}')">🔊</div>
                    </div>
                    <div class="space-y-2">
                        <div class="flex gap-3"><span class="font-black text-indigo-600 text-[12px]">Q:</span><p class="text-[14px] font-bold text-slate-800">\${d.q}</p></div>
                        <div class="flex gap-3"><span class="font-black text-emerald-600 text-[12px]">A:</span><p class="text-[14px] font-bold text-slate-800">\${d.ans}</p></div>
                    </div>
                </div>\`).join('');
        }

        async function listenAll() {
            for (let i = 0; i < travelData.length; i++) {
                const d = travelData[i];
                const card = document.querySelectorAll('#review-list > div')[i];
                card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                card.classList.add('ring-4', 'ring-emerald-400');
                await playAudioAsync(d.q); await new Promise(r => setTimeout(r, 400));
                await playAudioAsync(d.ans);
                card.classList.remove('ring-4', 'ring-emerald-400');
                await new Promise(r => setTimeout(r, 800));
            }
        }

        function playAudioAsync(text) {
            return new Promise((resolve) => {
                const audio = new Audio(\`https://translate.google.com/translate_tts?ie=UTF-8&q=\${encodeURIComponent(text)}&tl=vi&client=tw-ob\`);
                audio.play(); audio.onended = resolve; audio.onerror = resolve; 
            });
        }

        function speak(text) { new Audio(\`https://translate.google.com/translate_tts?ie=UTF-8&q=\${encodeURIComponent(text)}&tl=vi&client=tw-ob\`).play(); }
    </script>
</body>
</html>
`;

export const GameTravelingMakeQuestion: React.FC = () => {
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
        const blob = new Blob([gameHTML], { type: 'text/html' });
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
                    title="Make Question Game - Traveling"
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

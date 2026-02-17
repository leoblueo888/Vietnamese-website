
import React, { useState, useEffect, useRef } from 'react';
import { Maximize, Minimize } from 'lucide-react';

const gameHTML = `
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Make Question Viet: Learning</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@400;600;700&display=swap');

        body {
            font-family: 'Quicksand', sans-serif;
            background: #1a1a1a;
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            margin: 0;
            overflow: hidden;
            touch-action: none;
        }

        .game-card {
            background-image: url('https://lh3.googleusercontent.com/u/0/d/1lLOR6OK8zvH6i2gNGv5xszeHmtiGsiwk=w1920-h1080-iv1');
            background-size: cover;
            background-position: center;
            border-radius: 1.5rem;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            position: relative;
            overflow: hidden;
            border: 4px solid #ffffff;
        }

        .overlay {
            position: absolute;
            inset: 0;
            background: rgba(255, 255, 255, 0.4);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            padding: 10px; 
            text-align: center;
        }

        .game-title {
            background: white;
            padding: 5px 20px;
            border-radius: 15px;
            color: #16a34a;
            font-size: 1.8rem; 
            font-weight: 800;
            line-height: 1.1;
            margin-bottom: 1rem; 
            text-transform: uppercase;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }

        .how-to-play-box {
            background: white;
            border: 2px solid #16a34a;
            border-radius: 1rem;
            padding: 1rem; 
            width: 100%;
            max-width: 400px;
            text-align: left;
            margin-bottom: 1rem; 
            box-shadow: 0 8px 20px rgba(0,0,0,0.15);
        }

        .htp-title {
            color: #16a34a;
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
            color: #374151;
            font-weight: 600;
        }

        .step-num {
            background: linear-gradient(135deg, #16a34a, #ca8a04);
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

        .lang-selector {
            display: flex;
            gap: 6px;
            width: 100%;
            max-width: 400px;
            margin-bottom: 1rem;
        }

        .lang-btn {
            flex: 1;
            padding: 0.6rem;
            border-radius: 0.8rem;
            font-weight: 800;
            font-size: 0.75rem;
            text-transform: uppercase;
            transition: all 0.2s;
            border: 2px solid #e5e7eb;
            background: white;
        }

        .lang-btn.active {
            background-color: #16a34a;
            color: white;
            border-color: #16a34a;
        }

        .btn-start-main {
            background: linear-gradient(135deg, #16a34a, #ca8a04);
            color: white;
            width: 100%;
            max-width: 400px;
            padding: 1rem;
            border-radius: 1rem;
            font-weight: 800;
            font-size: 1rem;
            text-transform: uppercase;
            box-shadow: 0 10px 20px rgba(0,0,0,0.3);
        }

        #game-header {
            flex-shrink: 0;
            background: rgba(255, 255, 255, 0.7);
            padding: 1rem 1.5rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            z-index: 100;
            border-bottom: 1px solid rgba(255, 255, 255, 0.3);
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
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            border: none;
        }

        .btn-next-round {
            background: #16a34a;
            color: white;
            padding: 8px 24px;
            border-radius: 12px;
            font-weight: 900;
            font-size: 14px;
            transition: all 0.3s;
            border: none;
            cursor: pointer;
            box-shadow: 0 4px 0 #15803d;
        }
        
        .btn-next-round:active {
            transform: translateY(2px);
            box-shadow: 0 2px 0 #15803d;
        }

        .bubble-area {
            position: absolute;
            top: 5cm; 
            left: 0;
            right: 0;
            padding: 0 20px;
            display: flex;
            flex-direction: column;
            gap: 1.2rem;
            pointer-events: auto;
            z-index: 10;
        }

        .drop-zone {
            border: 4px dashed #ffffff;
            background: rgba(22, 163, 74, 0.3);
            min-height: 80px;
            border-radius: 1.5rem;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            text-shadow: 0 1px 3px rgba(0,0,0,0.5);
            font-weight: 800;
            padding: 15px 25px;
            width: fit-content; 
            max-width: 80%;
            align-self: flex-start;
        }

        .bubble {
            padding: 1.2rem 1.8rem;
            border-radius: 1.5rem;
            width: fit-content; 
            max-width: 80%;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            background: white;
            transition: all 0.3s ease;
            position: relative;
        }

        .bubble-user-ans {
            align-self: flex-start;
            border: 4px solid #ca8a04;
        }

        .bubble-ella-quest {
            align-self: flex-end;
            border-left: 10px solid #16a34a;
        }

        .draggable-item {
            position: absolute;
            background: white;
            padding: 15px 25px;
            border-radius: 1.5rem;
            box-shadow: 0 15px 35px rgba(0,0,0,0.3);
            border: 3px solid #16a34a;
            cursor: grab;
            user-select: none;
            width: fit-content;
            max-width: 300px;
            text-align: center;
            z-index: 100;
            animation: floating 4s ease-in-out infinite;
        }

        .tooltip-container {
            position: relative;
            display: inline-block;
        }

        .tooltip-text {
            visibility: hidden;
            width: 220px;
            background-color: #333;
            color: #fff;
            text-align: center;
            border-radius: 8px;
            padding: 10px;
            position: absolute;
            z-index: 50;
            bottom: 125%; 
            left: 50%;
            margin-left: -110px;
            opacity: 0;
            transition: opacity 0.3s;
            font-size: 11px;
            line-height: 1.5;
            pointer-events: none;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            font-weight: 500;
        }

        .tooltip-text::after {
            content: "";
            position: absolute;
            top: 100%;
            left: 50%;
            margin-left: -5px;
            border-width: 5px;
            border-style: solid;
            border-color: #333 transparent transparent transparent;
        }

        .tooltip-container:hover .tooltip-text {
            visibility: visible;
            opacity: 1;
        }

        .word-chip {
            display: inline-block;
            cursor: pointer;
            padding: 2px 4px;
            font-weight: 700;
            border-radius: 6px;
            transition: all 0.2s;
            margin: 0 1px;
            background: transparent;
        }
        
        .word-chip:hover {
            background-color: #dcfce7;
            color: #166534;
            transform: scale(1.05);
        }

        .highlight-match {
            background-color: #fef3c7 !important;
            color: #ca8a04 !important;
            box-shadow: 0 0 8px rgba(202, 138, 4, 0.6);
        }

        .bubble.playing-audio {
            background-color: #f0fdf4 !important;
            transform: scale(1.02);
            z-index: 50;
        }

        .mini-speaker {
            cursor: pointer;
            padding: 8px;
            border-radius: 50%;
            background: #f0fdf4;
            border: 1px solid #dcfce7;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1rem;
            flex-shrink: 0;
            transition: transform 0.2s;
        }
        .mini-speaker:active { transform: scale(0.9); }

        .hidden { display: none !important; }

        /* Review Page Styles */
        .review-page {
            position: absolute;
            inset: 0;
            background: #f8fafc;
            z-index: 200;
            display: flex;
            flex-direction: column;
        }

        .review-header {
            padding: 1.5rem;
            background: white;
            border-bottom: 2px solid #e2e8f0;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
        }

        .review-item {
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            border: 2px solid transparent;
        }

        .review-item.active-reading {
            background: white !important;
            border-color: #16a34a;
            transform: scale(1.03);
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            z-index: 10;
        }

        @keyframes floating {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0px); }
        }

        .btn-listen-all {
            background: #16a34a;
            color: white;
            padding: 10px 20px;
            border-radius: 12px;
            font-weight: 800;
            font-size: 13px;
            text-transform: uppercase;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: all 0.2s;
            border: none;
            box-shadow: 0 4px 0 #15803d;
        }

        .btn-listen-all:active {
            transform: translateY(2px);
            box-shadow: 0 2px 0 #15803d;
        }
        
        .btn-listen-all.playing {
            background: #ca8a04;
            box-shadow: 0 4px 0 #a16207;
        }

        #review-list {
            padding: 20px;
            gap: 16px;
            display: flex;
            flex-direction: column;
        }
    </style>
</head>
<body onload="initApp()">

    <div class="game-card" id="main-card">
        <!-- START WINDOW -->
        <div id="start-overlay" class="overlay">
            <h1 class="game-title">Make Question Viet: Learning</h1>
            
            <div class="how-to-play-box">
                <div id="htp-title" class="htp-title"><span>📚</span> CÁCH CHƠI</div>
                <div class="htp-step"><span class="step-num">1</span> <span id="step-1">Đọc câu trả lời.</span></div>
                <div class="htp-step"><span class="step-num">2</span> <span id="step-2">Kéo đúng câu hỏi vào ô trống.</span></div>
                <div class="htp-step"><span class="step-num">3</span> <span id="step-3">Bấm vào từng từ để nghe phát âm.</span></div>
            </div>

            <div class="lang-selector">
                <button id="lang-en" onclick="setLang('en')" class="lang-btn active">ENGLISH</button>
                <button id="lang-ru" onclick="setLang('ru')" class="lang-btn">RUSSIAN</button>
            </div>

            <button id="btn-start" onclick="startGame()" class="btn-start-main">BẮT ĐẦU</button>
        </div>

        <!-- Header Game -->
        <div id="game-header" class="hidden">
            <div class="flex items-center gap-4">
                <button onclick="prevRound()" class="nav-btn">←</button>
                <div class="flex flex-col">
                    <span id="topic-label" class="text-[9px] font-black text-green-600 uppercase">LEARNING</span>
                    <h2 id="round-title" class="text-[13px] font-black">ROUND 1/8</h2>
                </div>
            </div>
            <div class="flex justify-center flex-1 mx-4">
                <button id="next-round-btn" onclick="nextRound()" class="btn-next-round">TIẾP THEO →</button>
            </div>
            <div class="w-8"></div>
        </div>

        <div class="relative flex-1 overflow-hidden" id="scene-root">
            <div class="bubble-area" id="bubble-list"></div>
            <div id="floating-box"></div>
            
            <!-- REVIEW PAGE (ROUND 9) -->
            <div id="review-page" class="review-page hidden">
                <div class="review-header">
                    <div>
                        <h2 id="review-title" class="text-xl font-black">Kết quả học tập</h2>
                        <p class="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Review All Sessions</p>
                    </div>
                    <button id="btn-listen-all" onclick="toggleListenAll()" class="btn-listen-all">
                        <span id="listen-icon">🔊</span> <span id="text-listen-all">LISTEN ALL</span>
                    </button>
                </div>
                <div id="review-list" class="overflow-y-auto flex-1 scroll-smooth"></div>
                <div class="p-4 border-t bg-white">
                    <button id="btn-again" onclick="location.reload()" class="w-full py-4 bg-green-600 text-white rounded-2xl font-black uppercase text-sm tracking-widest shadow-lg">CHƠI LẠI</button>
                </div>
            </div>
        </div>
    </div>

    <script>
        const learningData = [
            { q: "Bạn muốn cải thiện kỹ năng gì?", ans: "Mình muốn cải thiện kỹ năng xây dựng website.", ansTrans: { en: "What skill do you want to improve? - I want to improve website building skills.", ru: "Какой навык вы хотите улучшить? - Я хочу улучшить навыки создания сайтов." }, en: "What skill do you want to improve?", ru: "Какой навык вы хотите улучшить?", distractors: [{vi: "Bạn thường học như thế nào?", trans: {en: "How do you usually study?", ru: "Как вы обычно учитесь?"}}, {vi: "Kỹ năng này có khó không?", trans: {en: "Is this skill difficult?", ru: "Этот навык сложный?"}}] },
            { q: "Bạn thường học một kỹ năng mới như thế nào?", ans: "Mình học bằng cách xem video, thảo luận với AI và thực hành.", ansTrans: { en: "How do you usually learn a new skill? - I learn by watching videos, discussing with AI, and practicing.", ru: "Как вы обычно изучаете новый навык? - Я учусь, просматривая видео, обсуждая с ИИ и практикуясь." }, en: "How do you usually learn a new skill?", ru: "Как вы обычно изучаете новый навык?", distractors: [{vi: "Bạn học ở đâu?", trans: {en: "Where do you study?", ru: "Где вы учитесь?"}}, {vi: "Bạn học với ai?", trans: {en: "Who do you study with?", ru: "С кем вы учитесь?"}}] },
            { q: "Bạn nghĩ học lý thuyết hay thực hành tốt hơn?", ans: "Mình nghĩ thực hành tốt hơn.", ansTrans: { en: "Do you think learning theory or practice is better? - I think practice is better.", ru: "Как вы думаете, что лучше: теория или практика? - Я думаю, практика лучше." }, en: "Do you think learning theory or practice is better?", ru: "Bạn nghĩ học lý thuyết hay thực hành tốt hơn?", distractors: [{vi: "Lý thuyết này có quan trọng không?", trans: {en: "Is this theory important?", ru: "Эта теория важна?"}}, {vi: "Bạn có thích thực hành không?", trans: {en: "Do you like practicing?", ru: "Вам нравится практиковаться?"}}] },
            { q: "Bạn có học trên YouTube không? Bạn học gì?", ans: "Có. Mình học về AI và kỹ năng cuộc sống.", ansTrans: { en: "Do you study on YouTube? What do you study? - Yes. I learn about AI and life skills.", ru: "Вы учитесь на YouTube? Что вы изучаете? - Да. Я изучаю ИИ и жизненные навыки." }, en: "Do you study on YouTube? What do you study?", ru: "Вы учитесь на YouTube? Что вы изучаете?", distractors: [{vi: "YouTube có miễn phí không?", trans: {en: "Is YouTube free?", ru: "YouTube бесплатный?"}}, {vi: "Bạn xem gì trên YouTube?", trans: {en: "What do you watch on YouTube?", ru: "Что bạn xem trên YouTube?"}}] },
            { q: "Bạn thường học một mình hay học theo nhóm?", ans: "Có lúc học một mình, có lúc học theo nhóm.", ansTrans: { en: "Do you usually study alone or in groups? - Sometimes I study alone, sometimes in groups.", ru: "Вы обычно учитесь в одиночку hoặc trong nhóm? - Иногда я учусь один, иногда в группах." }, en: "Do you usually study alone or in groups?", ru: "Вы обычно учитесь в одиночку hoặc trong nhóm?", distractors: [{vi: "Bạn có thích học nhóm không?", trans: {en: "Do you like group study?", ru: "Вам thích học nhóm không?"}}, {vi: "Nhóm của bạn có mấy người?", trans: {en: "How many people are in your group?", ru: "Сколько người ở nhóm của bạn?"}}] },
            { q: "Bạn thường dành bao lâu để học một kỹ năng mới?", ans: "Khoảng 3-4 tiếng mỗi ngày.", ansTrans: { en: "How long do you usually spend learning a new skill? - About 3-4 hours every day.", ru: "Сколько времени вы обычно тратите на изучение нового навыка? - Около 3-4 часов каждый день." }, en: "How long do you usually spend learning a new skill?", ru: "Сколько времени вы обычно тратите на изучение нового навыка?", distractors: [{vi: "Bạn học lúc mấy giờ?", trans: {en: "What time do you study?", ru: "В какое время вы учитесь?"}}, {vi: "Bạn có mệt không?", trans: {en: "Are you tired?", ru: "Вы устали?"}}] },
            { q: "Ai là thầy giáo tuyệt vời nhất của bạn?", ans: "Thật khó nói! Mình đã học được nhiều điều từ rất nhiều người.", ansTrans: { en: "Who is your best teacher? - It's hard to say! I've learned a lot from many people.", ru: "Кто ваш лучший учитель? - Сложно сказать! Я многому научился у многих людей." }, en: "Who is your best teacher?", ru: "Кто ваш лучший учитель?", distractors: [{vi: "Thầy giáo của bạn tên là gì?", trans: {en: "What is your teacher's name?", ru: "Как зовут вашего учителя?"}}, {vi: "Bạn có thích thầy giáo không?", trans: {en: "Do you like the teacher?", ru: "Вам нравится учитель?"}}] },
            { q: "Bạn có dùng các công cụ AI để học không?", ans: "Có... ! Mình dùng AI để học nhanh hơn.", ansTrans: { en: "Do you use AI tools to study? - Yes...! I use AI to learn faster.", ru: "Используете ли вы инструменты ИИ для учебы? - Да...! Я использую ИИ, чтобы учиться быстрее." }, en: "Do you use AI tools to study?", ru: "Используете ли вы инструменты ИИ для учебы?", distractors: [{vi: "AI là gì?", trans: {en: "What is AI?", ru: "Что такое ИИ?"}}, {vi: "AI có thông minh không?", trans: {en: "Is AI smart?", ru: "ИИ умный?"}}] }
        ];

        const highlightMap = {
            "gì": { en: ["what"], ru: ["какое", "что", "какой"] },
            "như thế nào": { en: ["how"], ru: ["как"] },
            "ở đâu": { en: ["where"], ru: ["где"] },
            "bao lâu": { en: ["how long"], ru: ["сколько времени"] },
            "ai": { en: ["who"], ru: ["кто"] },
            "hay": { en: ["or"], ru: ["или"] }
        };

        const uiStrings = {
            en: {
                htpTitle: "HOW TO PLAY",
                step1: "Read the answer below.",
                step2: "Drag the correct question into the box.",
                step3: "Click on any word to hear it.",
                btnStart: "START GAME",
                topic: "LEARNING",
                next: "NEXT →",
                dropText: "Drag question here...",
                reviewTitle: "Learning Result",
                btnAgain: "PLAY AGAIN",
                round: "ROUND",
                listenAll: "LISTEN ALL",
                stopAll: "STOP",
                hayTooltip: "Used in questions to choose between A and B. It means 'OR', but specifically for questions.",
                khongTooltip: "A marker at the end of a sentence to form a Yes/No question. It doesn't have a meaning itself in this context."
            },
            ru: {
                htpTitle: "КАK ИГРАТЬ",
                step1: "Прочтите ответ ниже.",
                step2: "Перетащите верный вопрос в поле.",
                step3: "Нажмите на любое слово, чтобы услышать его.",
                btnStart: "НАЧАТЬ ИГРУ",
                topic: "ОБУЧЕНИЕ",
                next: "ДАЛЕЕ →",
                dropText: "Перетащите вопрос сюда...",
                reviewTitle: "Результат обучения",
                btnAgain: "ИГРАТЬ СНОВА",
                round: "РАУНД",
                listenAll: "СЛУШАТЬ ВСЕ",
                stopAll: "СТОП",
                hayTooltip: "Используется в вопросах для выбора между A и B. Это означает 'ИЛИ', но именно для вопросов.",
                khongTooltip: "Маркер в конце предложения для формирования вопроса Да/Нет. Сам по себе он không có nghĩa gì cả trong ngữ cảnh này."
            }
        };

        const wordGroups = ["bao lâu", "như thế nào", "xây dựng website", "thực hành", "lý thuyết", "kỹ năng", "thảo luận", "thầy giáo", "tuyệt vời", "nhanh hơn", "mỗi ngày", "một mình", "theo nhóm"];

        let currentRound = 0, userLang = 'en', roundSolved = false;
        let isReviewing = false;
        const correctSfx = new Audio('https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3');

        function initApp() { setLang('en'); }

        function setLang(lang) {
            userLang = lang;
            document.getElementById('lang-en').classList.toggle('active', lang === 'en');
            document.getElementById('lang-ru').classList.toggle('active', lang === 'ru');
            updateUI();
            if (!document.getElementById('game-header').classList.contains('hidden') && !isReviewing) {
                loadRound();
            }
        }

        function updateUI() {
            const s = uiStrings[userLang];
            document.getElementById('htp-title').innerHTML = \`<span>📚</span> \${s.htpTitle}\`;
            document.getElementById('step-1').innerText = s.step1;
            document.getElementById('step-2').innerText = s.step2;
            document.getElementById('step-3').innerText = s.step3;
            document.getElementById('btn-start').innerText = s.btnStart;
            document.getElementById('topic-label').innerText = s.topic;
            document.getElementById('next-round-btn').innerText = s.next;
            document.getElementById('review-title').innerText = s.reviewTitle;
            document.getElementById('btn-again').innerText = s.btnAgain;
            document.getElementById('text-listen-all').innerText = isAutoPlaying ? s.stopAll : s.listenAll;
            document.getElementById('round-title').innerText = \`\${s.round} \${currentRound + 1}/\${learningData.length}\`;
            
            const drop = document.getElementById('drop-target');
            if (drop && !roundSolved) drop.innerText = s.dropText;
        }

        function startGame() {
            document.getElementById('start-overlay').classList.add('hidden');
            document.getElementById('game-header').classList.remove('hidden');
            loadRound();
        }

        /**
         * HỆ THỐNG PHÁT ÂM MỚI: Ngắt nghỉ theo dấu câu
         */
        let currentAudioChain = [];
        let isChainPlaying = false;

        function stopCurrentChain() {
            currentAudioChain.forEach(a => {
                a.pause();
                a.onended = null;
            });
            currentAudioChain = [];
            isChainPlaying = false;
        }

        function speakText(container, text, onEnd) {
            stopCurrentChain();
            if (container) container.classList.add('playing-audio');

            // Tách câu theo dấu ngắt nghỉ
            const chunks = text.split(/([,.;?!…])/).reduce((acc, curr) => {
                if (curr.match(/[,.;?!…]/)) {
                    if (acc.length > 0) acc[acc.length - 1] += curr;
                } else if (curr.trim()) {
                    acc.push(curr.trim());
                }
                return acc;
            }, []);

            let index = 0;
            isChainPlaying = true;

            function playNext() {
                if (!isChainPlaying || index >= chunks.length) {
                    if (container) container.classList.remove('playing-audio');
                    if (onEnd) onEnd();
                    isChainPlaying = false;
                    return;
                }

                const chunk = chunks[index];
                const url = \`https://translate.google.com/translate_tts?ie=UTF-8&q=\${encodeURIComponent(chunk)}&tl=vi&client=tw-ob\`;
                const audio = new Audio(url);
                currentAudioChain.push(audio);
                
                audio.onended = () => {
                    index++;
                    // Khoảng nghỉ ngắn giữa các dấu câu: 0.2s cho phẩy, 0.4s cho chấm
                    let pauseTime = 300;
                    if (chunk.match(/[.?!…]$/)) pauseTime = 500;
                    setTimeout(playNext, pauseTime);
                };

                audio.play().catch(e => {
                    console.error("TTS Error:", e);
                    index++;
                    playNext();
                });
            }

            playNext();
            
            // Trả về đối tượng giả lập để tương thích với logic cũ
            return {
                pause: () => stopCurrentChain()
            };
        }

        function handleHoverWord(viWord, isEnter) {
            const normalizedVi = viWord.toLowerCase().replace(/[?.!,]/g, '').trim();
            const matchData = highlightMap[normalizedVi];
            if (!matchData) return;
            const targetWords = matchData[userLang];
            const allChips = document.querySelectorAll('.translation-text .word-chip-trans');
            allChips.forEach(chip => {
                const chipText = chip.innerText.toLowerCase().replace(/[?.!,]/g, '').trim();
                if (targetWords.some(t => chipText.includes(t))) {
                    if (isEnter) chip.classList.add('highlight-match');
                    else chip.classList.remove('highlight-match');
                }
            });
        }

        function parseToWordChips(text, isTranslation = false) {
            let processed = text;
            const SEP = "|||";
            const sortedGroups = [...wordGroups].sort((a, b) => b.length - a.length);
            
            sortedGroups.forEach(group => {
                const regex = new RegExp(\`\\\\b\${group}\\\\b\`, 'gi');
                processed = processed.replace(regex, \`\${SEP}\${group}\${SEP}\`);
            });
            
            const tokens = processed.split(SEP);
            let html = "";
            tokens.forEach(token => {
                if (!token) return;
                const isGroup = sortedGroups.some(g => g.toLowerCase() === token.toLowerCase());
                if (isGroup) {
                    html += wrapWithTooltip(token, isTranslation);
                } else {
                    token.split(/(\\s+)/).forEach(w => {
                        if (!w.trim()) { html += w; return; }
                        const match = w.match(/^(.+?)([?.!,…]*)$/);
                        if (match) {
                            html += wrapWithTooltip(match[1], isTranslation) + match[2];
                        } else {
                            html += wrapWithTooltip(w, isTranslation);
                        }
                    });
                }
            });
            return html;
        }

        function wrapWithTooltip(word, isTranslation) {
            const normalized = word.toLowerCase();
            const cls = isTranslation ? 'word-chip-trans' : 'word-chip';
            let hoverAttr = isTranslation ? "" : \`onmouseenter="handleHoverWord('\${word}', true)" onmouseleave="handleHoverWord('\${word}', false)"\`;
            
            let tooltipContent = null;
            if (normalized === "hay" && (currentRound === 2 || currentRound === 4)) {
                tooltipContent = uiStrings[userLang].hayTooltip;
            } else if (normalized === "không" && currentRound === 7) {
                tooltipContent = uiStrings[userLang].khongTooltip;
            }

            if (tooltipContent) {
                return \`
                <span class="tooltip-container">
                    <span class="\${cls}" \${hoverAttr} onclick="event.stopPropagation(); speakText(null, '\${word}')">\${word}</span>
                    <span class="tooltip-text">\${tooltipContent}</span>
                </span>\`;
            }

            return \`<span class="\${cls}" \${hoverAttr} onclick="event.stopPropagation(); speakText(null, '\${word}')">\${word}</span>\`;
        }

        function parseTranslationToChips(text) {
            return text.split(/(\\s+)/).map(w => {
                if (!w.trim()) return w;
                return \`<span class="word-chip-trans inline-block transition-all px-0.5 rounded">\${w}</span>\`;
            }).join('');
        }

        function loadRound() {
            roundSolved = false;
            stopCurrentChain();
            updateUI();
            
            const list = document.getElementById('bubble-list');
            list.innerHTML = '';
            const data = learningData[currentRound];
            
            const drop = document.createElement('div');
            drop.className = 'drop-zone';
            drop.id = 'drop-target';
            drop.innerText = uiStrings[userLang].dropText;
            list.appendChild(drop);

            const ans = document.createElement('div');
            ans.className = 'bubble bubble-ella-quest';
            ans.id = 'ans-bubble';
            const transText = userLang === 'en' ? data.ansTrans.en.split(' - ')[1] : data.ansTrans.ru.split(' - ')[1];
            ans.innerHTML = \`
                <div class="flex items-start gap-3">
                    <div class="mini-speaker" onclick="speakText(document.getElementById('ans-bubble'), '\${data.ans}')">🔊</div>
                    <div>
                        <div class="text-[18px] leading-relaxed font-bold">\${parseToWordChips(data.ans)}</div>
                        <div class="text-[13px] text-green-600 italic font-semibold mt-1 translation-text">\${parseTranslationToChips(transText)}</div>
                    </div>
                </div>\`;
            list.appendChild(ans);
            renderDraggables();
        }

        function renderDraggables() {
            const box = document.getElementById('floating-box');
            box.innerHTML = '';
            const data = learningData[currentRound];
            const options = [
                {vi: data.q, trans: userLang === 'en' ? data.en : data.ru, correct: true},
                ...data.distractors.map(d => ({vi: d.vi, trans: userLang === 'en' ? d.trans.en : d.trans.ru, correct: false}))
            ].sort(() => Math.random() - 0.5);

            options.forEach(opt => {
                const el = document.createElement('div');
                el.className = 'draggable-item';
                el.dataset.correct = opt.correct;
                el.innerHTML = \`<p class="text-[15px] font-black">\${opt.vi}</p><p class="text-[11px] text-slate-500 italic">\${opt.trans}</p>\`;
                el.style.left = \`\${10 + Math.random() * 40}%\`;
                el.style.top = \`\${68 + Math.random() * 12}%\`;
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
            if (!isDragging) return;
            if (e.type === 'touchmove') e.preventDefault();
            const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
            const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;
            const parentRect = document.getElementById('scene-root').getBoundingClientRect();
            draggedElement.style.left = \`\${clientX - parentRect.left - offset.x}px\`;
            draggedElement.style.top = \`\${clientY - parentRect.top - offset.y}px\`;
            draggedElement.style.animation = 'none';
        }

        function endDrag() {
            if (!isDragging) return;
            isDragging = false;
            const dropZone = document.getElementById('drop-target');
            if (!dropZone) return; 
            const dropRect = dropZone.getBoundingClientRect();
            const itemRect = draggedElement.getBoundingClientRect();
            const isOverlap = !(itemRect.right < dropRect.left || itemRect.left > dropRect.right || itemRect.bottom < dropRect.top || itemRect.top > dropRect.bottom);

            if (isOverlap && draggedElement.dataset.correct === 'true') {
                handleSuccess();
            } else {
                draggedElement.style.animation = 'floating 4s ease-in-out infinite';
            }
            document.removeEventListener('mousemove', onDrag);
            document.removeEventListener('touchmove', onDrag);
        }

        function handleSuccess() {
            roundSolved = true;
            correctSfx.play();
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#16a34a', '#ca8a04', '#ffffff'] });
            
            const data = learningData[currentRound];
            const dropZone = document.getElementById('drop-target');
            dropZone.className = 'bubble bubble-user-ans';
            dropZone.id = 'quest-bubble';
            const transText = userLang === 'en' ? data.en : data.ru;
            
            dropZone.innerHTML = \`
                <div class="flex items-start gap-3">
                    <div class="mini-speaker" onclick="speakText(document.getElementById('quest-bubble'), '\${data.q}')">🔊</div>
                    <div>
                        <div class="text-[18px] leading-relaxed font-bold">\${parseToWordChips(data.q)}</div>
                        <div class="text-[13px] text-green-700 italic font-semibold mt-1 translation-text">\${parseTranslationToChips(transText)}</div>
                    </div>
                </div>\`;

            document.getElementById('floating-box').innerHTML = '';

            speakText(dropZone, data.q, () => {
                setTimeout(() => speakText(document.getElementById('ans-bubble'), data.ans), 800);
            });
        }

        function nextRound() {
            if (currentRound < learningData.length - 1) {
                currentRound++;
                loadRound();
            } else {
                showReview();
            }
        }

        function prevRound() {
            if (currentRound > 0) {
                currentRound--;
                loadRound();
            }
        }

        function showReview() {
            isReviewing = true;
            stopCurrentChain();
            const page = document.getElementById('review-page');
            const list = document.getElementById('review-list');
            page.classList.remove('hidden');
            list.innerHTML = '';
            
            learningData.forEach((item, idx) => {
                const row = document.createElement('div');
                row.id = \`review-item-\${idx}\`;
                row.className = 'review-item p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4';
                const transQ = userLang === 'en' ? item.en : item.ru;
                const transA = userLang === 'en' ? item.ansTrans.en.split(' - ')[1] : item.ansTrans.ru.split(' - ')[1];
                row.innerHTML = \`
                    <div class="flex items-center gap-2"><span class="bg-slate-100 text-slate-500 text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest">SESSION \${idx + 1}</span></div>
                    <div class="flex gap-4 items-start p-4 bg-green-50 rounded-2xl border-l-8 border-green-500">
                        <div class="mini-speaker" onclick="speakText(this.parentElement.parentElement, '\${item.q}')">🔊</div>
                        <div><p class="text-lg font-bold text-slate-800">\${item.q}</p><p class="text-xs text-green-700 font-bold opacity-70 mt-1 uppercase">\${transQ}</p></div>
                    </div>
                    <div class="flex gap-4 items-start p-4 bg-yellow-50 rounded-2xl border-l-8 border-yellow-500">
                        <div class="mini-speaker" onclick="speakText(this.parentElement.parentElement, '\${item.ans}')">🔊</div>
                        <div><p class="text-lg font-bold text-slate-800">\${item.ans}</p><p class="text-xs text-yellow-800 font-bold opacity-70 mt-1 uppercase">\${transA}</p></div>
                    </div>\`;
                list.appendChild(row);
            });
        }

        let isAutoPlaying = false;
        let currentChainObj = null;

        function toggleListenAll() {
            if (isAutoPlaying) {
                stopAutoPlay();
            } else {
                startAutoPlay();
            }
        }

        function stopAutoPlay() {
            isAutoPlaying = false;
            stopCurrentChain();
            const btn = document.getElementById('btn-listen-all');
            btn.classList.remove('playing');
            document.getElementById('listen-icon').innerText = "🔊";
            updateUI();
            document.querySelectorAll('.review-item').forEach(el => el.classList.remove('active-reading'));
        }

        async function startAutoPlay() {
            isAutoPlaying = true;
            const btn = document.getElementById('btn-listen-all');
            btn.classList.add('playing');
            document.getElementById('listen-icon').innerText = "⏹";
            updateUI();

            for (let i = 0; i < learningData.length; i++) {
                if (!isAutoPlaying) break;
                
                const item = learningData[i];
                const row = document.getElementById(\`review-item-\${i}\`);
                
                document.querySelectorAll('.review-item').forEach(el => el.classList.remove('active-reading'));
                row.classList.add('active-reading');
                row.scrollIntoView({ behavior: 'smooth', block: 'center' });

                await new Promise(resolve => {
                    currentChainObj = speakText(row.children[1], item.q, resolve);
                });
                
                if (!isAutoPlaying) break;
                await new Promise(r => setTimeout(r, 800));

                await new Promise(resolve => {
                    currentChainObj = speakText(row.children[2], item.ans, resolve);
                });

                if (!isAutoPlaying) break;
                await new Promise(r => setTimeout(r, 1500));
            }
            
            stopAutoPlay();
        }
    </script>
</body>
</html>
`;

export const GameStudiesMakeQuestion: React.FC = () => {
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
                    title="Make Question Game - Learning"
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

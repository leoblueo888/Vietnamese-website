
import React, { useState, useEffect, useRef } from 'react';
import { Maximize, Minimize } from 'lucide-react';

const gameHTML = `
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Make Question Viet: Family</title>
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
            background-image: url('https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=2070&auto=format&fit=crop');
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

        .game-card.solved {
            background-image: url('https://images.unsplash.com/photo-1542037104857-ffbb0b9155fb?q=80&w=1954&auto=format&fit=crop');
        }

        .overlay {
            position: absolute;
            inset: 0;
            background: rgba(255, 255, 255, 0.6);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            padding: 10px; 
            text-align: center;
            backdrop-filter: blur(8px);
        }

        .game-title {
            background: white;
            padding: 10px 25px;
            border-radius: 20px;
            color: #e11d48;
            font-size: 2rem; 
            font-weight: 800;
            line-height: 1.1;
            margin-bottom: 1.5rem; 
            text-transform: uppercase;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            border: 2px solid #e11d48;
        }

        .how-to-play-box {
            background: white;
            border: 2px solid #e11d48;
            border-radius: 1rem;
            padding: 1rem; 
            width: 100%;
            max-width: 400px;
            text-align: left;
            margin-bottom: 1rem; 
            box-shadow: 0 8px 20px rgba(0,0,0,0.15);
        }

        .htp-title {
            color: #e11d48;
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
            background: linear-gradient(135deg, #e11d48, #fb7185);
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
            background-color: #e11d48;
            color: white;
            border-color: #e11d48;
        }

        .btn-start-main {
            background: linear-gradient(135deg, #e11d48, #fb7185);
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
            background: rgba(255, 255, 255, 0.85);
            padding: 1rem 1.5rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            z-index: 100;
            border-bottom: 2px solid #e11d48;
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
            border: 1px solid #e2e8f0;
            cursor: pointer;
        }

        .btn-next-round {
            background: #e11d48;
            color: white;
            padding: 8px 24px;
            border-radius: 12px;
            font-weight: 900;
            font-size: 14px;
            opacity: 1;
            pointer-events: auto;
            transition: transform 0.2s, background 0.2s;
            border: none;
            cursor: pointer;
            box-shadow: 0 4px 0 #9f1239;
        }
        .btn-next-round:active {
            transform: translateY(2px);
            box-shadow: 0 2px 0 #9f1239;
        }

        .bubble-area {
            position: absolute;
            top: 5.5rem; 
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
            border: 4px dashed #e11d48;
            background: rgba(225, 29, 72, 0.1);
            min-height: 80px;
            border-radius: 1.5rem;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #9f1239;
            font-weight: 800;
            padding: 15px 25px;
            width: fit-content; 
            max-width: 80%;
            align-self: flex-start;
            transition: all 0.3s;
        }

        .bubble {
            padding: 1.2rem 1.8rem;
            border-radius: 1.5rem;
            width: fit-content; 
            max-width: 80%;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            background: white;
            transition: all 0.3s ease;
            position: relative;
        }

        .bubble-user-ans {
            align-self: flex-start;
            border: 4px solid #f59e0b;
        }

        .bubble-ella-quest {
            align-self: flex-end;
            border-left: 10px solid #e11d48;
        }

        .draggable-item {
            position: absolute;
            background: white;
            padding: 15px 25px;
            border-radius: 1.5rem;
            box-shadow: 0 15px 35px rgba(0,0,0,0.2);
            border: 3px solid #e11d48;
            cursor: grab;
            user-select: none;
            width: fit-content;
            max-width: 300px;
            text-align: center;
            z-index: 100;
            animation: floating 4s ease-in-out infinite;
        }

        .draggable-item:active { cursor: grabbing; animation: none; }

        .word-chip {
            display: inline-block;
            cursor: pointer;
            padding: 0 4px;
            font-weight: 700;
            border-radius: 6px;
            transition: all 0.2s;
            margin: 0 1px;
            position: relative;
        }
        
        .word-chip:hover {
            background-color: #fff1f2;
            color: #e11d48;
        }

        /* TOOLTIP CSS */
        .tooltip-box {
            position: absolute;
            bottom: 125%;
            left: 50%;
            transform: translateX(-50%);
            background: #1e293b;
            color: white;
            padding: 12px;
            border-radius: 12px;
            font-size: 11px;
            width: 180px;
            text-align: center;
            visibility: hidden;
            opacity: 0;
            transition: all 0.3s;
            z-index: 1000;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
            pointer-events: none;
            line-height: 1.4;
        }

        .tooltip-box::after {
            content: '';
            position: absolute;
            top: 100%;
            left: 50%;
            margin-left: -6px;
            border-width: 6px;
            border-style: solid;
            border-color: #1e293b transparent transparent transparent;
        }

        .word-chip:hover .tooltip-box {
            visibility: visible;
            opacity: 1;
            bottom: 110%;
        }

        .highlight-active {
            background-color: #fef08a !important; 
            color: #854d0e !important; 
            transform: scale(1.1);
        }

        .trans-word {
            transition: all 0.2s ease;
            border-radius: 4px;
            padding: 0 2px;
        }

        .bubble.playing-audio {
            background-color: #fff1f2 !important;
            transform: scale(1.02);
            z-index: 50;
        }

        .mini-speaker {
            cursor: pointer;
            padding: 8px;
            border-radius: 50%;
            background: #fff1f2;
            border: 1px solid #fecdd3;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1rem;
            flex-shrink: 0;
            transition: transform 0.2s;
        }

        .hidden { display: none !important; }

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
            border-bottom: 2px solid #e11d48;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .review-item {
            transition: all 0.4s ease;
            border: 2px solid transparent;
        }

        .review-item.active-reading {
            background: white !important;
            border-color: #e11d48;
            transform: scale(1.02);
            box-shadow: 0 10px 20px rgba(0,0,0,0.05);
        }

        @keyframes floating {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0px); }
        }

        .btn-listen-all {
            background: #e11d48;
            color: white;
            padding: 10px 20px;
            border-radius: 12px;
            font-weight: 800;
            font-size: 13px;
            text-transform: uppercase;
            display: flex;
            align-items: center;
            gap: 8px;
            border: none;
            cursor: pointer;
        }
    </style>
</head>
<body onload="initApp()">

    <div class="game-card" id="main-card">
        <!-- START WINDOW -->
        <div id="start-overlay" class="overlay">
            <h1 class="game-title">Make Question Viet: Family</h1>
            
            <div class="how-to-play-box">
                <div id="htp-title" class="htp-title"><span>👨‍👩‍👧‍👦</span> CÁCH CHƠI</div>
                <div class="htp-step"><span class="step-num">1</span> <span id="step-1">Đọc câu trả lời về gia đình.</span></div>
                <div class="htp-step"><span class="step-num">2</span> <span id="step-2">Kéo đúng câu hỏi vào ô trống.</span></div>
                <div class="htp-step"><span class="step-num">3</span> <span id="step-3">Bạn có thể bấm TIẾP THEO bất cứ lúc nào.</span></div>
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
                    <span id="topic-label" class="text-[9px] font-black text-rose-600 uppercase">FAMILY</span>
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
            
            <!-- REVIEW PAGE -->
            <div id="review-page" class="review-page hidden">
                <div class="review-header">
                    <div>
                        <h2 id="review-title" class="text-xl font-black">Kết quả</h2>
                        <p class="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Review Family Session</p>
                    </div>
                    <button id="btn-listen-all" onclick="toggleListenAll()" class="btn-listen-all">
                        <span id="listen-icon">🔊</span> <span id="text-listen-all">LISTEN ALL</span>
                    </button>
                </div>
                <div id="review-list" class="overflow-y-auto flex-1 p-4 flex flex-col gap-4"></div>
                <div class="p-4 border-t bg-white">
                    <button id="btn-again" onclick="location.reload()" class="w-full py-4 bg-rose-600 text-white rounded-2xl font-black uppercase text-sm tracking-widest shadow-lg">CHƠI LẠI</button>
                </div>
            </div>
        </div>
    </div>

    <script>
        const questionWordsMapping = {
            "mấy": { en: ["how many"], ru: ["сколько"] },
            "gì": { en: ["what"], ru: ["что", "кем"] },
            "không": { en: ["do you", "does", "is it"], ru: ["ли", "разве"] },
            "nào": { en: ["which", "any"], ru: ["какой", "какие"] },
            "hay": { en: ["or"], ru: ["или"] }
        };

        const familyData = [
            { 
                q: "Gia đình bạn có mấy người?", 
                ans: "Gia đình mình có 4 người.", 
                ansTrans: { 
                    en: "How many people are in your family? - My family has 4 people.", 
                    ru: "Сколько человек в вашей семье? - В моей семье 4 человека." 
                }, 
                en: "How many people are in your family?", 
                ru: "Сколько человек в вашей семье?", 
                distractors: [
                    {vi: "Bạn sống ở đâu?", trans: {en: "Where do you live?", ru: "Где вы живете?"}},
                    {vi: "Gia đình bạn ở đâu?", trans: {en: "Where is your family?", ru: "Где твоя семья?"}}
                ] 
            },
            { 
                q: "Bố bạn làm nghề gì?", 
                ans: "Bố mình là kỹ sư.", 
                ansTrans: { 
                    en: "What does your father do? - My father is an engineer.", 
                    ru: "Кем работает твой отец? - Моý отец инженер." 
                }, 
                en: "What does your father do?", 
                ru: "Кем работает твой отец?", 
                distractors: [
                    {vi: "Bố bạn bao nhiêu tuổi?", trans: {en: "How old is your father?", ru: "Сколько лет твоему отцу?"}},
                    {vi: "Tên bố bạn là gì?", trans: {en: "What is your father's name?", ru: "Как зовут твоего отца?"}}
                ] 
            },
            { 
                q: "Mẹ bạn làm nghề gì?", 
                ans: "Mẹ mình là giáo viên.", 
                ansTrans: { 
                    en: "What does your mother do? - My mother is a teacher.", 
                    ru: "Кем работает твоя мама? - Моя мама учитель." 
                }, 
                en: "What does your mother do?", 
                ru: "Кем работает твоя мама?", 
                distractors: [
                    {vi: "Mẹ bạn khỏe không?", trans: {en: "How is your mother?", ru: "Как поживает твоя мама?"}},
                    {vi: "Mẹ bạn thích nấu gì?", trans: {en: "What does your mother like to cook?", ru: "Что твоя мама любит готовить?"}}
                ] 
            },
            { 
                q: "Sở thích của em trai bạn là gì?", 
                ans: "Em trai mình thích chơi bóng đá.", 
                ansTrans: { 
                    en: "What is your younger brother's hobby? - My younger brother likes playing football.", 
                    ru: "Какое хобби у твоего младшего брата? - Мой младший брат любит играть в футбол." 
                }, 
                en: "What is your younger brother's hobby?", 
                ru: "Какое хобби у твоего младшего брата?", 
                distractors: [
                    {vi: "Em trai bạn bao nhiêu tuổi?", trans: {en: "How old is your younger brother?", ru: "Сколько лет твоему младшему брату?"}},
                    {vi: "Bạn có em trai không?", trans: {en: "Do you have a younger brother?", ru: "У тебя есть младший брат?"}}
                ] 
            },
            { 
                q: "Bạn có ở cùng với gia đình không?", 
                ans: "Có, mình sống cùng gia đình.", 
                ansTrans: { 
                    en: "Do you live with your family? - Yes, I live with my family.", 
                    ru: "Ты живешь со своей семьей? - Да, я живу со своей семьей." 
                }, 
                en: "Do you live with your family?", 
                ru: "Ты живешь со своей семьей?", 
                distractors: [
                    {vi: "Gia đình bạn có vui không?", trans: {en: "Is your family happy?", ru: "Твоя семья счастлива?"}},
                    {vi: "Nhà bạn ở đâu?", trans: {en: "Where is your house?", ru: "Где твой дом?"}}
                ] 
            },
            { 
                q: "Bạn thường nói chuyện trực tiếp hay qua điện thoại với gia đình?", 
                ans: "Mình thường nói chuyện trực tiếp.", 
                ansTrans: { 
                    en: "Do you usually talk in person or over the phone with your family? - I usually talk in person.", 
                    ru: "Вы обычно разговариваете лично или по телефону со своей семьей? - Я обычно разговариваю лично." 
                }, 
                en: "Do you usually talk in person or over the phone with your family?", 
                ru: "Вы обычно разговариваете лично или по телефону?", 
                distractors: [
                    {vi: "Bạn có điện thoại không?", trans: {en: "Do you have a phone?", ru: "У тебя есть телефон?"}},
                    {vi: "Gia đình bạn thích làm gì?", trans: {en: "What does your family like to do?", ru: "Что любит делать твоя семья?"}}
                ],
                tooltips: {
                    "hay": "Biểu thị cho câu hỏi chọn lựa A hay B. Nó có nghĩa là 'OR', giống với 'hoặc' nhưng dùng riêng cho câu hỏi loại này."
                }
            },
            { 
                q: "Mẹ bạn nấu ăn có ngon không?", 
                ans: "Có, mẹ mình nấu ăn rất ngon.", 
                ansTrans: { 
                    en: "Does your mother cook well? - Yes, my mother cooks very well.", 
                    ru: "Твоя мама хорошо готовит? - Да, моя мама очень хорошо готовит." 
                }, 
                en: "Does your mother cook well?", 
                ru: "Твоя мама хорошо готовит?", 
                distractors: [
                    {vi: "Bạn thích ăn món gì?", trans: {en: "What do you like to eat?", ru: "Что ты thích ăn?"}},
                    {vi: "Ai nấu ăn trong nhà bạn?", trans: {en: "Who cooks in your house?", ru: "Кто готовит в твоем доме?"}}
                ],
                tooltips: {
                    "không": "Biểu thị cho đây là câu hỏi YES/NO. Bản thân nó không có nghĩa gì cả."
                }
            },
            { 
                q: "Bạn thường làm gì cùng gia đình mình?", 
                ans: "Gia đình mình thường chơi thể thao, đi dạo biển hoặc đi du lịch cùng nhau.", 
                ansTrans: { 
                    en: "What do you usually do with your family? - My family usually plays sports, walks on the beach, or travels together.", 
                    ru: "Что вы обычно делаете со своей семьей? - Моя семья обычно занимается спортом, гуляет по пляжу или путешествует вместе." 
                }, 
                en: "What do you usually do with your family?", 
                ru: "Что вы обычно делаете со своей семьей?", 
                distractors: [
                    {vi: "Bạn có thích đi du lịch không?", trans: {en: "Do you like to travel?", ru: "Тебе нравится путешествовать?"}},
                    {vi: "Gia đình bạn đi đâu?", trans: {en: "Where does your family go?", ru: "Куда идет твоя семья?"}}
                ] 
            }
        ];

        const uiStrings = {
            en: {
                htpTitle: "HOW TO PLAY",
                step1: "Read the family answer.",
                step2: "Drag the correct question into the box.",
                step3: "You can skip anytime with NEXT button.",
                btnStart: "START GAME",
                topic: "FAMILY",
                next: "NEXT →",
                dropText: "Drag family question here...",
                reviewTitle: "Results",
                btnAgain: "PLAY AGAIN",
                round: "ROUND",
                listenAll: "LISTEN ALL",
                stopAll: "STOP"
            },
            ru: {
                htpTitle: "КАK ИГРАТЬ",
                step1: "Прочтите ответ о семье.",
                step2: "Перетащите верный вопрос в поле.",
                step3: "Вы можете пропустить, нажав ДАЛЕЕ.",
                btnStart: "НАЧАТЬ ИГРУ",
                topic: "СЕМЬЯ",
                next: "ДАЛЕЕ →",
                dropText: "Перетащите вопрос о семье сюда...",
                reviewTitle: "Результаты",
                btnAgain: "ИГРАТЬ СНОВА",
                round: "РАУНД",
                listenAll: "СЛУШАТЬ ВСЕ",
                stopAll: "СТОП"
            }
        };

        let currentRound = 0, userLang = 'en', roundSolved = false;
        let isReviewing = false, isAutoPlaying = false, autoPlayQueue = [];

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
            document.getElementById('htp-title').innerHTML = \`<span>👨‍👩‍👧‍👦</span> \${s.htpTitle}\`;
            document.getElementById('step-1').innerText = s.step1;
            document.getElementById('step-2').innerText = s.step2;
            document.getElementById('step-3').innerText = s.step3;
            document.getElementById('btn-start').innerText = s.btnStart;
            document.getElementById('topic-label').innerText = s.topic;
            document.getElementById('next-round-btn').innerText = s.next;
            document.getElementById('review-title').innerText = s.reviewTitle;
            document.getElementById('btn-again').innerText = s.btnAgain;
            document.getElementById('text-listen-all').innerText = isAutoPlaying ? s.stopAll : s.listenAll;
            document.getElementById('round-title').innerText = \`\${s.round} \${currentRound + 1}/\${familyData.length}\`;
            
            const drop = document.getElementById('drop-target');
            if (drop && !roundSolved) drop.innerText = s.dropText;
        }

        function startGame() {
            document.getElementById('start-overlay').classList.add('hidden');
            document.getElementById('game-header').classList.remove('hidden');
            loadRound();
        }

        function speakText(container, text, onEnd) {
            if (container) container.classList.add('playing-audio');
            const chunks = text.split(/([,.;?])/g).filter(p => p.trim().length > 0);
            let chunkIdx = 0;
            const playNextChunk = () => {
                if (chunkIdx >= chunks.length) {
                    if (container) container.classList.remove('playing-audio');
                    if (onEnd) onEnd();
                    return;
                }
                const part = chunks[chunkIdx];
                if (part.match(/[,.;?]/)) {
                    const delay = part === ',' ? 300 : 600;
                    chunkIdx++;
                    setTimeout(playNextChunk, delay);
                } else {
                    const cleanPart = part.trim();
                    const url = \`https://translate.google.com/translate_tts?ie=UTF-8&q=\${encodeURIComponent(cleanPart)}&tl=vi&client=tw-ob&ttsspeed=0.9\`;
                    const audio = new Audio(url);
                    audio.onended = () => { chunkIdx++; playNextChunk(); };
                    audio.onerror = () => { chunkIdx++; playNextChunk(); };
                    audio.play().catch(e => { chunkIdx++; playNextChunk(); });
                }
            };
            playNextChunk();
            return { stop: () => { chunkIdx = chunks.length; } }; 
        }

        function highlightWords(vietWord, active) {
            const lowerViet = vietWord.toLowerCase();
            const targetWords = questionWordsMapping[lowerViet] ? questionWordsMapping[lowerViet][userLang] : [];
            const allChips = document.querySelectorAll('.word-chip');
            allChips.forEach(chip => {
                if(chip.innerText.toLowerCase().includes(lowerViet)) {
                    active ? chip.classList.add('highlight-active') : chip.classList.remove('highlight-active');
                }
            });
            const allTransWords = document.querySelectorAll('.trans-word');
            allTransWords.forEach(wordSpan => {
                const wordText = wordSpan.innerText.toLowerCase().replace(/[?.!,]/g, '');
                if (targetWords.some(tw => wordText.includes(tw) || tw.includes(wordText))) {
                    active ? wordSpan.classList.add('highlight-active') : wordSpan.classList.remove('highlight-active');
                }
            });
        }

        function parseTransToSpans(text) {
            return text.split(/(\\s+)/).map(w => {
                if (!w.trim()) return w;
                return \`<span class="trans-word">\${w}</span>\`;
            }).join('');
        }

        function parseVietToChips(text) {
            const data = familyData[currentRound];
            return text.split(/(\\s+)/).map(w => {
                if (!w.trim()) return w;
                const clean = w.toLowerCase().replace(/[?.!,]/g, '');
                const isQWord = questionWordsMapping.hasOwnProperty(clean);
                const hasTooltip = data.tooltips && data.tooltips[clean];
                
                let tooltipHtml = hasTooltip ? \`<div class="tooltip-box">\${data.tooltips[clean]}</div>\` : '';

                if (isQWord || hasTooltip) {
                    return \`<span class="word-chip" 
                        onmouseover="highlightWords('\${clean}', true)" 
                        onmouseout="highlightWords('\${clean}', false)"
                        onclick="event.stopPropagation(); speakText(null, '\${clean}')">\${w}\${tooltipHtml}</span>\`;
                }
                return \`<span class="word-chip" onclick="event.stopPropagation(); speakText(null, '\${clean}')">\${w}</span>\`;
            }).join('');
        }

        function loadRound() {
            roundSolved = false;
            document.getElementById('main-card').classList.remove('solved');
            updateUI();
            const list = document.getElementById('bubble-list');
            list.innerHTML = '';
            const data = familyData[currentRound];
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
                        <div class="text-[18px] leading-relaxed font-bold">\${parseVietToChips(data.ans)}</div>
                        <div class="text-[13px] text-rose-600 italic font-semibold mt-1">\${parseTransToSpans(transText)}</div>
                    </div>
                </div>\`;
            list.appendChild(ans);
            renderDraggables();
        }

        function renderDraggables() {
            const box = document.getElementById('floating-box');
            box.innerHTML = '';
            const data = familyData[currentRound];
            const options = [
                {vi: data.q, trans: userLang === 'en' ? data.en : data.ru, correct: true},
                ...data.distractors.map(d => ({vi: d.vi, trans: userLang === 'en' ? d.trans.en : d.trans.ru, correct: false}))
            ].sort(() => Math.random() - 0.5);
            options.forEach(opt => {
                const el = document.createElement('div');
                el.className = 'draggable-item';
                el.dataset.correct = opt.correct;
                el.innerHTML = \`<p class="text-[14px] font-black">\${opt.vi}</p><p class="text-[10px] text-slate-500 italic">\${opt.trans}</p>\`;
                el.style.left = \`\${15 + Math.random() * 50}%\`;
                el.style.top = \`\${60 + Math.random() * 15}%\`;
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
            draggedElement.style.zIndex = "1000";
            document.addEventListener('mousemove', onDrag);
            document.addEventListener('touchmove', onDrag, {passive: false});
            document.addEventListener('mouseup', endDrag);
            document.addEventListener('touchend', endDrag);
        }

        function onDrag(e) {
            if (!isDragging) return;
            e.preventDefault();
            const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
            const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;
            const cardRect = document.getElementById('scene-root').getBoundingClientRect();
            draggedElement.style.left = \`\${clientX - cardRect.left - offset.x}px\`;
            draggedElement.style.top = \`\${clientY - cardRect.top - offset.y}px\`;
        }

        function endDrag() {
            if (!isDragging) return;
            isDragging = false;
            const dropZone = document.getElementById('drop-target');
            if(!dropZone) return;
            const dropRect = dropZone.getBoundingClientRect();
            const dragRect = draggedElement.getBoundingClientRect();
            const isOver = !(dragRect.right < dropRect.left || dragRect.left > dropRect.right || 
                             dragRect.bottom < dropRect.top || dragRect.top > dropRect.bottom);
            if (isOver && draggedElement.dataset.correct === "true") {
                solveRound();
            } else {
                draggedElement.style.transition = "all 0.4s";
                draggedElement.style.left = \`\${15 + Math.random() * 50}%\`;
                draggedElement.style.top = \`\${60 + Math.random() * 15}%\`;
                setTimeout(() => { if(draggedElement) draggedElement.style.transition = ""; }, 400);
            }
            document.removeEventListener('mousemove', onDrag);
            document.removeEventListener('touchmove', onDrag);
            document.removeEventListener('mouseup', endDrag);
            document.removeEventListener('touchend', endDrag);
        }

        function solveRound() {
            roundSolved = true;
            const data = familyData[currentRound];
            const dropZone = document.getElementById('drop-target');
            document.getElementById('floating-box').innerHTML = '';
            document.getElementById('main-card').classList.add('solved');
            const transText = userLang === 'en' ? data.en : data.ru;
            dropZone.className = 'bubble bubble-user-ans';
            dropZone.id = 'solved-q-bubble';
            dropZone.innerHTML = \`
                <div class="flex items-start gap-3">
                    <div class="mini-speaker" onclick="speakText(document.getElementById('solved-q-bubble'), '\${data.q}')">🔊</div>
                    <div>
                        <div class="text-[18px] leading-relaxed font-bold">\${parseVietToChips(data.q)}</div>
                        <div class="text-[13px] text-amber-600 italic font-semibold mt-1">\${parseTransToSpans(transText)}</div>
                    </div>
                </div>\`;
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
            speakText(dropZone, data.q, () => {
                setTimeout(() => speakText(document.getElementById('ans-bubble'), data.ans), 500);
            });
        }

        function nextRound() {
            if (currentRound < familyData.length - 1) {
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
            document.getElementById('review-page').classList.remove('hidden');
            document.getElementById('game-header').classList.add('hidden');
            const list = document.getElementById('review-list');
            list.innerHTML = '';
            familyData.forEach((item, idx) => {
                const row = document.createElement('div');
                row.className = 'review-item bg-white p-4 rounded-2xl shadow-sm border border-slate-100';
                row.id = \`review-row-\${idx}\`;
                row.innerHTML = \`
                    <p class="text-sm font-bold text-slate-800">\${item.q}</p>
                    <p class="text-[10px] text-slate-400 italic mb-2">\${userLang === 'en' ? item.en : item.ru}</p>
                    <div class="h-[1px] bg-slate-50 my-1"></div>
                    <p class="text-sm font-bold text-rose-700">\${item.ans}</p>
                    <p class="text-[10px] text-rose-600/60 italic">\${userLang === 'en' ? item.ansTrans.en.split(' - ')[1] : item.ansTrans.ru.split(' - ')[1]}</p>
                \`;
                list.appendChild(row);
            });
        }

        function toggleListenAll() {
            if (isAutoPlaying) { isAutoPlaying = false; autoPlayQueue = []; updateUI(); return; }
            isAutoPlaying = true;
            updateUI();
            autoPlayQueue = [];
            familyData.forEach((item, idx) => {
                autoPlayQueue.push({ text: item.q, id: idx });
                autoPlayQueue.push({ text: item.ans, id: idx });
            });
            processQueue();
        }

        function processQueue() {
            if (!isAutoPlaying || autoPlayQueue.length === 0) {
                isAutoPlaying = false; updateUI();
                document.querySelectorAll('.review-item').forEach(el => el.classList.remove('active-reading'));
                return;
            }
            const current = autoPlayQueue.shift();
            const rowEl = document.getElementById(\`review-row-\${current.id}\`);
            document.querySelectorAll('.review-item').forEach(el => el.classList.remove('active-reading'));
            rowEl.classList.add('active-reading');
            rowEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            speakText(null, current.text, () => setTimeout(processQueue, 800));
        }
    </script>
</body>
</html>
`;

export const GameFamilyMakeQuestion: React.FC = () => {
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
                    title="Make Question Game - Family"
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

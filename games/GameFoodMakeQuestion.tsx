
import React, { useState, useEffect, useRef } from 'react';
import { Maximize, Minimize } from 'lucide-react';

const gameHTML = `
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ask Question Viet: Food and Drink</title>
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
            background: url('https://lh3.googleusercontent.com/d/16c9lc4k_QZDN_RQrjMKigrFO_fkctjPS') no-repeat center center;
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

        .game-title {
            background: linear-gradient(45deg, #f59e0b, #ef4444);
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
            max-width: 400px;
            text-align: left;
            margin-bottom: 1rem; 
            box-shadow: 0 4px 10px rgba(0,0,0,0.05);
        }

        .htp-title {
            color: #f59e0b;
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
            background: linear-gradient(135deg, #f59e0b, #ef4444);
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
            border: 1px solid #e2e8f0;
        }

        .lang-btn.active {
            background-color: #f59e0b;
            color: white;
            border-color: #f59e0b;
        }

        .btn-start-main {
            background: linear-gradient(135deg, #f59e0b, #ef4444);
            color: white;
            width: 100%;
            max-width: 400px;
            padding: 1rem;
            border-radius: 1rem;
            font-weight: 800;
            font-size: 1rem;
            text-transform: uppercase;
        }

        #game-header {
            flex-shrink: 0;
            background: rgba(255, 255, 255, 0.9);
            backdrop-filter: blur(8px);
            padding: 1rem 1.5rem;
            display: flex;
            justify-content: space-between;
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
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .btn-next-round {
            background: #ef4444;
            color: white;
            padding: 8px 24px;
            border-radius: 12px;
            font-weight: 900;
            font-size: 14px;
            opacity: 0.2;
            pointer-events: none;
            transition: opacity 0.3s;
        }
        .btn-next-round.enabled { opacity: 1; pointer-events: auto; }

        .bubble-area {
            position: absolute;
            top: 140px; 
            left: 0;
            right: 0;
            padding: 0 20px;
            display: flex;
            flex-direction: column;
            gap: 1.2rem;
            pointer-events: auto;
        }

        .drop-zone {
            border: 3px dashed #ef4444;
            background: rgba(255, 255, 255, 0.9);
            min-height: 80px;
            border-radius: 1.5rem;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ef4444;
            font-weight: 700;
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
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            background: white;
            transition: all 0.3s ease;
        }

        .bubble-user-ans {
            align-self: flex-start;
            border: 3px solid #f59e0b;
            background: #fffbeb;
        }

        .bubble-ella-quest {
            align-self: flex-end;
            border-left: 8px solid #ef4444;
        }

        .draggable-item {
            position: absolute;
            background: white;
            padding: 15px 25px;
            border-radius: 1.5rem;
            box-shadow: 0 15px 35px rgba(0,0,0,0.15);
            border: 2px solid #ef4444;
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
            padding: 2px 4px;
            font-weight: 700;
            border-radius: 6px;
            transition: all 0.2s;
            margin: 0 1px;
            background: transparent;
            position: relative;
        }
        
        .word-chip:hover {
            background-color: #fee2e2;
            color: #b91c1c;
            transform: scale(1.05);
        }

        .tooltip-text {
            visibility: hidden;
            width: 240px;
            background-color: #334155;
            color: #fff;
            text-align: left;
            border-radius: 10px;
            padding: 10px;
            position: absolute;
            z-index: 1000;
            bottom: 140%;
            left: 50%;
            margin-left: -120px;
            opacity: 0;
            transition: opacity 0.3s;
            font-size: 11px;
            line-height: 1.4;
            font-weight: 500;
            pointer-events: none;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
        }

        .tooltip-text::after {
            content: "";
            position: absolute;
            top: 100%;
            left: 50%;
            margin-left: -5px;
            border-width: 5px;
            border-style: solid;
            border-color: #334155 transparent transparent transparent;
        }

        .word-chip:hover .tooltip-text {
            visibility: visible;
            opacity: 1;
        }

        .highlight-match {
            background-color: #fef3c7 !important;
            color: #d97706 !important;
            box-shadow: 0 0 5px rgba(245, 158, 11, 0.5);
        }

        .bubble.playing-audio {
            background-color: #fef3c7 !important;
            border-color: #f59e0b !important;
            transform: scale(1.05);
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            z-index: 50;
        }

        .word-chip.playing {
            animation: pulse-word 0.5s infinite;
            background-color: #fef3c7;
        }

        @keyframes pulse-word {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
        }

        .mini-speaker {
            cursor: pointer;
            padding: 8px;
            border-radius: 50%;
            background: #fff7ed;
            border: 1px solid #fed7aa;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1rem;
            flex-shrink: 0;
            transition: transform 0.2s;
        }
        .mini-speaker:active { transform: scale(0.9); }

        .hidden { display: none !important; }

        .review-page {
            position: absolute;
            inset: 0;
            background: white;
            z-index: 200;
            display: flex;
            flex-direction: column;
        }

        @keyframes floating {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-15px); }
            100% { transform: translateY(0px); }
        }

        .review-header {
            padding: 1.5rem;
            background: #f8fafc;
            border-bottom: 1px solid #e2e8f0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .btn-listen-all {
            background: #334155;
            color: white;
            padding: 8px 16px;
            border-radius: 10px;
            font-weight: 800;
            font-size: 12px;
            text-transform: uppercase;
            display: flex;
            align-items: center;
            gap: 6px;
            transition: all 0.2s;
        }
        .btn-listen-all:active { transform: scale(0.95); }
    </style>
</head>
<body onload="initApp()">

    <div class="game-card" id="main-card">
        <!-- START WINDOW -->
        <div id="start-overlay" class="overlay">
            <h1 class="game-title">Ask Question Viet:<br>Food and Drink</h1>
            
            <div class="how-to-play-box">
                <div id="htp-title" class="htp-title"><span>🍳</span> CÁCH CHƠI</div>
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
                    <span id="topic-label" class="text-[9px] font-black text-amber-600 uppercase">FOOD & DRINK</span>
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
                        <h2 id="review-title" class="text-xl font-black">Kết quả học tập</h2>
                        <p class="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Food & Drink Questions</p>
                    </div>
                    <button id="btn-listen-all" onclick="listenAllQuestions()" class="btn-listen-all">
                        <span>🔊</span> <span id="text-listen-all">LISTEN ALL</span>
                    </button>
                </div>
                <div id="review-list" class="overflow-y-auto flex-1 p-6 space-y-4 bg-slate-50 scroll-smooth"></div>
                <div class="p-4 border-t bg-white">
                    <button id="btn-again" onclick="location.reload()" class="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-sm tracking-widest shadow-lg">CHƠI LẠI</button>
                </div>
            </div>
        </div>
    </div>

    <script>
        const foodData = [
            { q: "Bạn thích ăn món gì nhất?", ans: "Tôi thích ăn bún bò và cơm gà.", ansTrans: { en: "What dish do you like most? - I like eating beef noodle soup and chicken rice.", ru: "Какое блюдо вам больше всего нравится? - Мне нравится есть бун бо и ком га." }, en: "What dish do you like most?", ru: "Какое блюдо вам больше всего нравится?", distractors: [{vi: "Bạn muốn ăn món gì?", trans: {en: "What dish do you want to eat?", ru: "Какое блюдо вы хотите съесть?"}}, {vi: "Món này có cay không?", trans: {en: "Is this dish spicy?", ru: "Это блюдо острое?"}}] },
            { q: "Bạn có thích uống nước khoáng không?", ans: "Có. Nước khoáng rất tốt cho sức khỏe.", ansTrans: { en: "Do you like drinking mineral water? - Yes. Mineral water is very good for health.", ru: "Вы любите пить минеральную воду? - Да. Минеральная вода очень полезна для здоровья." }, en: "Do you like drinking mineral water?", ru: "Вы любите пить минеральную воду?", distractors: [{vi: "Bạn uống trà hay cà phê?", trans: {en: "Do you drink tea or coffee?", ru: "Вы пьете чай или кофе?"}}, {vi: "Nước này bao nhiêu tiền?", trans: {en: "How much is this water?", ru: "Сколько стоит эта вода?"}}] },
            { q: "Bạn thích uống sinh tố hay nước ép?", ans: "Tôi thích uống cả hai.", ansTrans: { en: "Do you like smoothies or juice? - I like both.", ru: "Вы любите смузи или сок? - Мне нравится и то, и другое." }, en: "Do you like smoothies or juice?", ru: "Вы любите смузи или сок?", distractors: [{vi: "Sinh tố này ngon không?", trans: {en: "Is this smoothie delicious?", ru: "Этот смузи вкусный?"}}, {vi: "Bạn muốn thêm đá không?", trans: {en: "Do you want more ice?", ru: "Хотите еще льда?"}}] },
            { q: "Bạn thích ăn đồ Việt hay đồ Tây?", ans: "Tôi thích ăn cả hai.", ansTrans: { en: "Do you like Vietnamese or Western food? - I like both.", ru: "Вы любите вьетнамскую hoặc западную еду? - Мне нравится и то, và другое." }, en: "Do you like Vietnamese or Western food?", ru: "Вы любите вьетнамскую hoặc западную еду?", distractors: [{vi: "Đồ ăn Việt Nam có ngon không?", trans: {en: "Is Vietnamese food delicious?", ru: "Вьетнамская еда вкусная?"}}, {vi: "Bạn thường ăn đồ Tây ở đâu?", trans: {en: "Where do you usually eat Western food?", ru: "Где вы обычно едите западную еду?"}}] },
            { q: "Bạn thường ăn ở nhà hàng nào?", ans: "Tôi ăn ở nhà hàng Lulu.", ansTrans: { en: "Which restaurant do you usually eat at? - I eat at Lulu restaurant.", ru: "В каком ресторане вы обычно едите? - Я ем в ресторане Lulu." }, en: "Which restaurant do you usually eat at?", ru: "В каком ресторане вы обычно едите?", distractors: [{vi: "Nhà hàng này ở đâu?", trans: {en: "Where is this restaurant?", ru: "Где находится этот ресторан?"}}, {vi: "Bạn muốn đặt bàn không?", trans: {en: "Do you want to book a table?", ru: "Вы хотите забронировать столик?"}}] },
            { q: "Bạn thường ăn với ai?", ans: "Tôi ăn với gia đình tôi.", ansTrans: { en: "Who do you usually eat with? - I eat with my family.", ru: "С кем вы обычно едите? - Я ем со своей семьей." }, en: "Who do you usually eat with?", ru: "С кем вы обычно едите?", distractors: [{vi: "Bạn ăn cơm chưa?", trans: {en: "Have you eaten rice yet?", ru: "Вы уже поели рис?"}}, {vi: "Hôm nay ai nấu ăn?", trans: {en: "Who is cooking today?", ru: "Кто сегодня готовит?"}}] },
            { q: "Bạn có thích nấu ăn không?", ans: "Có. Tôi nấu ăn hàng ngày.", ansTrans: { en: "Do you like cooking? - Yes. I cook every day.", ru: "Вы любите готовить? - Да. Я готовлю каждый день." }, en: "Do you like cooking?", ru: "Вы любите готовить?", distractors: [{vi: "Bạn nấu món gì vậy?", trans: {en: "What are you cooking?", ru: "Что вы готовите?"}}, {vi: "Món này nấu như thế nào?", trans: {en: "How to cook this dish?", ru: "Как приготовить это блюдо?"}}] },
            { q: "Món bạn nấu ngon nhất là món gì?", ans: "Đó là món cơm thịt bò xào rau.", ansTrans: { en: "What is the best dish you cook? - It's beef stir-fry with vegetables and rice.", ru: "Какое ваше самое лучшее блюдо? - Это рис с говядиной, обжаренной с овощами." }, en: "What is the best dish you cook?", ru: "Какое ваше самое лучшее блюдо?", distractors: [{vi: "Món này có nhiều rau không?", trans: {en: "Does this dish have many vegetables?", ru: "В этом блюде много овощей?"}}, {vi: "Bạn có thích thịt bò không?", trans: {en: "Do you like beef?", ru: "Вы любите говядину?"}}] }
        ];

        const highlightMap = {
            "gì": { en: ["what"], ru: ["какое", "что", "какой"] },
            "thế nào": { en: ["how"], ru: ["какая", "как"] },
            "bao giờ": { en: ["when"], ru: ["когда"] },
            "ở đâu": { en: ["where"], ru: ["где"] },
            "với ai": { en: ["with who", "with whom", "who"], ru: ["с кем", "кто"] },
            "ai": { en: ["who"], ru: ["кто"] },
            "nào": { en: ["which", "what"], ru: ["каком", "какой"] }
        };

        const specialTooltips = {
            "không": {
                en: "The word 'không' at the end of a sentence marks a Yes/No question. It has no meaning of negation here; it's purely a grammatical marker for the question.",
                ru: "Слово 'không' в конце предложения указывает на вопрос типа 'Да/Нет'. Здесь оно не несет значения отрицания, а служит лишь грамматическим маркером вопроса."
            },
            "hay": {
                en: "The word 'hay' is used in choice questions (A or B), equivalent to 'OR'. Note: 'hay' is for questions, while 'hoặc' is used in statements.",
                ru: "Слово 'hay' используется в вопросах выбора (A hoặc B), эквивалентно 'ИЛИ'. Примечание: 'hay' используется для вопросов, а 'hoặc' — в утверждениях."
            }
        };

        const uiStrings = {
            en: {
                htpTitle: "HOW TO PLAY",
                step1: "Read the answer below.",
                step2: "Drag the correct question into the box.",
                step3: "Click on any word to hear it.",
                btnStart: "START GAME",
                topic: "FOOD & DRINK",
                next: "NEXT →",
                dropText: "Drag question here...",
                reviewTitle: "Learning Result",
                btnAgain: "PLAY AGAIN",
                round: "ROUND",
                listenAll: "LISTEN ALL"
            },
            ru: {
                htpTitle: "КАК ИГРАТЬ",
                step1: "Прочтите ответ ниже.",
                step2: "Перетащите верный вопрос в поле.",
                step3: "Нажмите на любое слово, чтобы услышать его.",
                btnStart: "НАЧАТЬ ИГРУ",
                topic: "ЕДА И НАПИТКИ",
                next: "ДАЛЕЕ →",
                dropText: "Перетащите вопрос сюда...",
                reviewTitle: "Результат обучения",
                btnAgain: "ИГРАТЬ СНОВА",
                round: "РАУНД",
                listenAll: "СЛУШАТЬ ВСЕ"
            }
        };

        const wordGroups = ["bún bò", "cơm gà", "nước khoáng", "sinh tố", "nước ép", "đồ Việt", "đồ Tây", "nhà hàng", "gia đình", "nấu ăn", "hàng ngày", "thịt bò xào rau", "ngon nhất", "thế nào", "ở đâu", "với ai"];

        let currentRound = 0, userLang = 'en', roundSolved = false;
        const correctSfx = new Audio('https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3');

        function initApp() { setLang('en'); }

        function setLang(lang) {
            userLang = lang;
            document.getElementById('lang-en').classList.toggle('active', lang === 'en');
            document.getElementById('lang-ru').classList.toggle('active', lang === 'ru');
            updateUI();
        }

        function updateUI() {
            const s = uiStrings[userLang];
            document.getElementById('htp-title').innerHTML = \`<span>🍳</span> \${s.htpTitle}\`;
            document.getElementById('step-1').innerText = s.step1;
            document.getElementById('step-2').innerText = s.step2;
            document.getElementById('step-3').innerText = s.step3;
            document.getElementById('btn-start').innerText = s.btnStart;
            document.getElementById('topic-label').innerText = s.topic;
            document.getElementById('next-round-btn').innerText = s.next;
            document.getElementById('review-title').innerText = s.reviewTitle;
            document.getElementById('btn-again').innerText = s.btnAgain;
            document.getElementById('text-listen-all').innerText = s.listenAll;
            document.getElementById('round-title').innerText = \`\${s.round} \${currentRound + 1}/\${foodData.length}\`;
            
            const drop = document.getElementById('drop-target');
            if (drop && !roundSolved) drop.innerText = s.dropText;
        }

        function startGame() {
            document.getElementById('start-overlay').classList.add('hidden');
            document.getElementById('game-header').classList.remove('hidden');
            loadRound();
        }

        function speakText(container, text, onEnd) {
            if (container) {
                container.classList.add('playing-audio');
                if (container.scrollIntoView) {
                    container.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
            
            const cleanText = text.replace(/[?.!,]/g, '').trim();
            const url = \`https://translate.google.com/translate_tts?ie=UTF-8&q=\${encodeURIComponent(cleanText)}&tl=vi&client=tw-ob\`;
            const audio = new Audio(url);
            
            audio.play().catch(e => console.error("TTS Error:", e));
            
            audio.onended = () => { 
                if (container) container.classList.remove('playing-audio');
                if (onEnd) onEnd();
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
                if (targetWords.includes(chipText)) {
                    if (isEnter) chip.classList.add('highlight-match');
                    else chip.classList.remove('highlight-match');
                }
            });
        }

        function parseToWordChips(text, isTranslation = false) {
            let processed = text;
            const SEP = "|||";
            wordGroups.forEach(group => {
                const regex = new RegExp(\`\\\\b\${group}\\\\b\`, 'gi');
                processed = processed.replace(regex, \`\${SEP}\${group}\${SEP}\`);
            });

            const tokens = processed.split(SEP);
            let html = "";
            tokens.forEach(token => {
                if (!token) return;
                const isGroup = wordGroups.some(g => g.toLowerCase() === token.toLowerCase());
                if (isGroup) {
                    html += wrapWithTooltip(token, isTranslation);
                } else {
                    token.split(/(\\s+)/).forEach(w => {
                        if (!w.trim()) {
                            html += w;
                            return;
                        }
                        const match = w.match(/^(.+?)([?.!,]*)$/);
                        if (match) {
                            const coreWord = match[1];
                            const punctuation = match[2];
                            html += wrapWithTooltip(coreWord, isTranslation) + punctuation;
                        } else {
                            html += wrapWithTooltip(w, isTranslation);
                        }
                    });
                }
            });
            return html;
        }

        function wrapWithTooltip(word, isTranslation) {
            const normWord = word.toLowerCase().trim();
            const tooltipData = specialTooltips[normWord];
            const cls = isTranslation ? 'word-chip-trans' : 'word-chip';
            
            let hoverAttr = "";
            if (!isTranslation) {
                hoverAttr = \`onmouseenter="handleHoverWord('\${word}', true)" onmouseleave="handleHoverWord('\${word}', false)"\`;
            }

            if (tooltipData && !isTranslation) {
                const tooltipText = tooltipData[userLang] || tooltipData['en'];
                return \`<span class="\${cls}" \${hoverAttr} onclick="event.stopPropagation(); speakText(null, '\${word}')">
                            \${word}
                            <span class="tooltip-text">\${tooltipText}</span>
                        </span>\`;
            } else {
                return \`<span class="\${cls}" \${hoverAttr} onclick="event.stopPropagation(); speakText(null, '\${word}')">\${word}</span>\`;
            }
        }

        function parseTranslationToChips(text) {
            return text.split(/(\\s+)/).map(w => {
                if (!w.trim()) return w;
                return \`<span class="word-chip-trans inline-block transition-all px-0.5 rounded">\${w}</span>\`;
            }).join('');
        }

        function loadRound() {
            roundSolved = false;
            document.getElementById('next-round-btn').classList.remove('enabled');
            const s = uiStrings[userLang];
            document.getElementById('round-title').innerText = \`\${s.round} \${currentRound + 1}/\${foodData.length}\`;
            
            const list = document.getElementById('bubble-list');
            list.innerHTML = '';
            
            const data = foodData[currentRound];
            
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
                    <div class="mini-speaker" id="ans-speaker" onclick="speakText(document.getElementById('ans-bubble'), '\${data.ans}')">🔊</div>
                    <div>
                        <div class="text-[18px] leading-relaxed font-bold">\${parseToWordChips(data.ans)}</div>
                        <div class="text-[13px] text-amber-600 italic font-semibold mt-1 translation-text">\${parseTranslationToChips(transText)}</div>
                    </div>
                </div>\`;
            list.appendChild(ans);
            renderDraggables();
        }

        function renderDraggables() {
            const box = document.getElementById('floating-box');
            box.innerHTML = '';
            const data = foodData[currentRound];
            const options = [
                {vi: data.q, trans: userLang === 'en' ? data.en : data.ru, correct: true},
                ...data.distractors.map(d => ({vi: d.vi, trans: userLang === 'en' ? d.trans.en : d.trans.ru, correct: false}))
            ].sort(() => Math.random() - 0.5);

            options.forEach(opt => {
                const el = document.createElement('div');
                el.className = 'draggable-item';
                el.dataset.correct = opt.correct;
                el.innerHTML = \`<p class="text-[15px] font-black">\${opt.vi}</p><p class="text-[11px] text-slate-500 italic">\${opt.trans}</p>\`;
                el.style.left = \`\${10 + Math.random() * 60}%\`;
                el.style.top = \`\${60 + Math.random() * 20}%\`;
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
            draggedElement.style.left = (clientX - parentRect.left - offset.x) + 'px';
            draggedElement.style.top = (clientY - parentRect.top - offset.y) + 'px';
        }

        function endDrag(e) {
            if (!draggedElement) return;
            const target = document.getElementById('drop-target');
            const targetRect = target.getBoundingClientRect();
            const clientX = e.type === 'touchend' ? e.changedTouches[0].clientX : e.clientX;
            const clientY = e.type === 'touchend' ? e.changedTouches[0].clientY : e.clientY;
            
            if (clientX > targetRect.left && clientX < targetRect.right && clientY > targetRect.top && clientY < targetRect.bottom) {
                if (draggedElement.dataset.correct === "true") {
                    handleCorrect();
                } else {
                    draggedElement.style.borderColor = "red";
                    setTimeout(() => draggedElement.style.borderColor = "#ef4444", 300);
                }
            }
            isDragging = false;
            draggedElement = null;
            document.removeEventListener('mousemove', onDrag);
            document.removeEventListener('touchmove', onDrag);
        }

        function handleCorrect() {
            roundSolved = true;
            correctSfx.currentTime = 0;
            correctSfx.play().catch(e => console.log("Audio play failed:", e));
            confetti({ particleCount: 40, spread: 50 });
            
            const data = foodData[currentRound];
            const target = document.getElementById('drop-target');
            target.className = 'bubble bubble-user-ans';
            const transText = userLang === 'en' ? data.en : data.ru;
            target.innerHTML = \`
                <div class="flex items-start gap-3">
                    <div class="mini-speaker" id="q-speaker" onclick="speakText(this.parentElement.parentElement, '\${data.q}')">🔊</div>
                    <div>
                        <div class="text-[18px] leading-relaxed font-bold">\${parseToWordChips(data.q)}</div>
                        <div class="text-[13px] text-amber-600 italic font-semibold mt-1 translation-text">\${parseTranslationToChips(transText)}</div>
                    </div>
                </div>\`;
            document.getElementById('floating-box').innerHTML = '';
            document.getElementById('next-round-btn').classList.add('enabled');

            speakText(target, data.q, () => {
                setTimeout(() => {
                    speakText(document.getElementById('ans-bubble'), data.ans);
                }, 400);
            });
        }

        function nextRound() {
            if (currentRound < foodData.length - 1) {
                currentRound++;
                loadRound();
            } else {
                showReview();
            }
        }
        function prevRound() { if (currentRound > 0) { currentRound--; loadRound(); } }

        function showReview() {
            document.getElementById('game-header').classList.add('hidden');
            document.getElementById('review-page').classList.remove('hidden');
            const list = document.getElementById('review-list');
            list.innerHTML = '';
            foodData.forEach((item, index) => {
                const row = document.createElement('div');
                row.className = 'bubble bubble-user-ans w-full max-w-full flex items-center gap-4 shadow-sm py-4 px-6';
                row.innerHTML = \`
                    <div class="mini-speaker bg-slate-100 border-slate-200" id="review-speaker-\${index}" onclick="speakText(this.parentElement, '\${item.q}')">🔊</div>
                    <div class="flex-1">
                        <div class="text-sm font-black text-slate-800">\${item.q}</div>
                        <div class="text-[11px] text-amber-600 font-bold italic">(\${userLang === 'en' ? item.en : item.ru})</div>
                    </div>
                \`;
                list.appendChild(row);
            });
        }

        async function listenAllQuestions() {
            const btn = document.getElementById('btn-listen-all');
            btn.style.opacity = "0.5";
            btn.disabled = true;

            for(let i = 0; i < foodData.length; i++) {
                const row = document.getElementById('review-list').children[i];
                await new Promise(resolve => {
                    speakText(row, foodData[i].q, resolve);
                });
                await new Promise(r => setTimeout(r, 600)); // Delay between questions
            }

            btn.style.opacity = "1";
            btn.disabled = false;
        }
    </script>
</body>
</html>
`;

export const GameFoodMakeQuestion: React.FC = () => {
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
                    title="Make Question Game - Food & Drink"
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

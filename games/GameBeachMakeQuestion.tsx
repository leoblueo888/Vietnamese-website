
import React, { useState, useEffect, useRef } from 'react';
import { Maximize, Minimize } from 'lucide-react';

const gameHTML = `
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ask Question Viet: The Beach</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@400;600;700&display=swap');

        body {
            font-family: 'Quicksand', sans-serif;
            background: #e0f2fe; 
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            margin: 0;
            overflow: hidden;
            touch-action: none;
        }

        .game-card {
            background: url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1000') no-repeat center center;
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
            background: linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            padding: 10px; 
            text-align: center;
        }

        .game-title {
            background: linear-gradient(45deg, #0ea5e9, #2dd4bf);
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
            color: #0284c7;
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
            background: linear-gradient(135deg, #0ea5e9, #2dd4bf);
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
            background-color: #0ea5e9;
            color: white;
            border-color: #0ea5e9;
        }

        .btn-start-main {
            background: linear-gradient(135deg, #0ea5e9, #2dd4bf);
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
            background: #0ea5e9;
            color: white;
            padding: 8px 24px;
            border-radius: 12px;
            font-weight: 900;
            font-size: 14px;
            transition: transform 0.2s;
        }
        .btn-next-round:active { transform: scale(0.95); }

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
            border: 3px dashed #0ea5e9;
            background: rgba(255, 255, 255, 0.9);
            min-height: 80px;
            border-radius: 1.5rem;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #0ea5e9;
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
            transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .bubble-user-ans {
            align-self: flex-start;
            border: 3px solid #0ea5e9;
            background: #f0f9ff;
        }

        .bubble-ella-quest {
            align-self: flex-end;
            border-left: 8px solid #2dd4bf;
        }

        .draggable-item {
            position: absolute;
            background: white;
            padding: 15px 25px;
            border-radius: 1.5rem;
            box-shadow: 0 15px 35px rgba(0,0,0,0.15);
            border: 2px solid #0ea5e9;
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
            background-color: #e0f2fe;
            color: #0369a1;
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

        .word-chip:hover .tooltip-text {
            visibility: visible;
            opacity: 1;
        }

        .highlight-match {
            background-color: #fef3c7 !important;
            color: #d97706 !important;
            box-shadow: 0 0 5px rgba(245, 158, 11, 0.5);
            transform: scale(1.1);
            font-weight: 900;
        }

        .bubble.playing-audio, .review-item.playing-audio {
            background-color: #f0f9ff !important;
            border-color: #0ea5e9 !important;
            transform: scale(1.05);
            box-shadow: 0 20px 25px -5px rgba(14, 165, 233, 0.4);
            z-index: 50;
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

        .review-item {
            background: white;
            padding: 1rem;
            border-radius: 1.25rem;
            border: 2px solid #f1f5f9;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            cursor: pointer;
        }
    </style>
</head>
<body onload="initApp()">

    <div class="game-card" id="main-card">
        <!-- MÀN HÌNH BẮT ĐẦU -->
        <div id="start-overlay" class="overlay">
            <h1 class="game-title">Ask Question Viet:<br>The Beach 🌊</h1>
            
            <div class="how-to-play-box">
                <div id="htp-title" class="htp-title"><span>🏖️</span> CÁCH CHƠI</div>
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

        <!-- Thanh tiêu đề Game -->
        <div id="game-header" class="hidden">
            <div class="flex items-center gap-4">
                <button onclick="prevRound()" class="nav-btn">←</button>
                <div class="flex flex-col">
                    <span id="topic-label" class="text-[9px] font-black text-sky-600 uppercase">THE BEACH</span>
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
            
            <!-- TRANG ÔN TẬP (REVIEW PAGE) -->
            <div id="review-page" class="review-page hidden">
                <div class="review-header">
                    <div>
                        <h2 id="review-title" class="text-xl font-black">Kết quả học tập</h2>
                        <p class="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Review Questions Only</p>
                    </div>
                    <button id="btn-listen-all" onclick="listenAllQuestions()" class="btn-listen-all">
                        <span>🔊</span> <span id="text-listen-all">LISTEN ALL</span>
                    </button>
                </div>
                <div id="review-list" class="overflow-y-auto flex-1 p-6 space-y-4 bg-slate-50 scroll-smooth"></div>
                <div class="p-4 border-t bg-white">
                    <button id="btn-again" onclick="location.reload()" class="w-full py-4 bg-sky-600 text-white rounded-2xl font-black uppercase text-sm tracking-widest shadow-lg">CHƠI LẠI</button>
                </div>
            </div>
        </div>
    </div>

    <script>
        const beachData = [
            { 
                q: "Bạn có hay ra biển không?", 
                ans: "Mình ngày nào cũng ra biển.", 
                ansTrans: { 
                    en: "Do you often go to the beach? - I go to the beach every day.", 
                    ru: "Вы часто ходите на пляж? - Я хожу на пляж каждый день." 
                }, 
                en: "Do you often go to the beach?", 
                ru: "Вы часто ходите на пляж?", 
                distractors: [
                    {vi: "Biển ở đâu?", trans: {en: "Where is the sea?", ru: "Где море?"}}, 
                    {vi: "Bạn đi biển với ai?", trans: {en: "Who do you go to the beach with?", ru: "С кем вы ходите на пляж?"}}
                ] 
            },
            { 
                q: "Bạn bơi ngoài biển mấy lần một tuần?", 
                ans: "Mình bơi khoảng 1–2 lần một tuần.", 
                ansTrans: { 
                    en: "How many times a week do you swim in the sea? - I swim about 1-2 times a week.", 
                    ru: "Сколько раз в неделю вы плаваете в море? - Я плаваю около 1-2 раз в неделю." 
                }, 
                en: "How many times a week do you swim in the sea?", 
                ru: "Сколько раз в неделю вы плаваете в море?", 
                distractors: [
                    {vi: "Bạn bơi lúc mấy giờ?", trans: {en: "What time do you swim?", ru: "В какое время вы плаваете?"}}, 
                    {vi: "Biển có lạnh không?", trans: {en: "Is the sea cold?", ru: "Море холодное?"}}
                ] 
            },
            { 
                q: "Bạn thường làm gì ngoài biển?", 
                ans: "Mình gặp bạn bè, chơi bóng chuyền và thư giãn.", 
                ansTrans: { 
                    en: "What do you usually do at the beach? - I meet friends, play volleyball and relax.", 
                    ru: "Что вы обычно делаете на пляже? - Я встречаюсь с друзьями, играю в волейбол и отдыхаю." 
                }, 
                en: "What do you usually do at the beach?", 
                ru: "Что вы обычно делаете на пляже?", 
                distractors: [
                    {vi: "Bạn có thích bơi không?", trans: {en: "Do you like swimming?", ru: "Вы любите плавать?"}}, 
                    {vi: "Bạn ăn gì ở biển?", trans: {en: "What do you eat at the beach?", ru: "Что вы едите на пляже?"}}
                ] 
            },
            { 
                q: "Bạn thường ở ngoài biển trong bao lâu?", 
                ans: "Mình thường ở khoảng 2–3 tiếng.", 
                ansTrans: { 
                    en: "How long do you usually stay at the beach? - I usually stay for about 2-3 hours.", 
                    ru: "Как долго вы обычно остаетесь на пляже? - Я обычно остаюсь около 2-3 часов." 
                }, 
                en: "How long do you usually stay at the beach?", 
                ru: "Как долго вы обычно остаетесь на пляже?", 
                distractors: [
                    {vi: "Khi nào bạn về?", trans: {en: "When do you come back?", ru: "Когда вы возвращаетесь?"}}, 
                    {vi: "Bạn đi biển mấy giờ?", trans: {en: "What time do you go to the beach?", ru: "В какое время вы идете на пляж?"}}
                ] 
            },
            { 
                q: "Bạn thường ra biển với ai?", 
                ans: "Mình ra biển với bạn bè.", 
                ansTrans: { 
                    en: "Who do you usually go to the beach with? - I go to the beach with friends.", 
                    ru: "С кем вы обычно ходите на пляж? - Я хожу на пляж с друзьями." 
                }, 
                en: "Who do you usually go to the beach with?", 
                ru: "С кем вы обычно ходите на пляж?", 
                distractors: [
                    {vi: "Bạn ra biển bằng gì?", trans: {en: "How do you get to the beach?", ru: "Как вы добираетесь до пляжа?"}}, 
                    {vi: "Bạn bè bạn đâu?", trans: {en: "Where are your friends?", ru: "Где ваши друзья?"}}
                ] 
            },
            { 
                q: "Tại sao nhiều người thích ra biển?", 
                ans: "Vì biển mát mẻ và thư giãn.", 
                ansTrans: { 
                    en: "Why do many people like going to the beach? - Because the sea is cool and relaxing.", 
                    ru: "Почему многим нравится ходить на пляж? - Потому что море прохладное и расслабляющее." 
                }, 
                en: "Why do many people like going to the beach?", 
                ru: "Почему многим нравится ходить на пляж?", 
                distractors: [
                    {vi: "Biển có sạch không?", trans: {en: "Is the beach clean?", ru: "Пляж чистый?"}}, 
                    {vi: "Nhiều người ở đâu?", trans: {en: "Where are the many people?", ru: "Где много людей?"}}
                ] 
            },
            { 
                q: "Bạn có thích ăn hải sản không? Bạn thích loại nào?", 
                ans: "Mình thích ăn tôm và cá.", 
                ansTrans: { 
                    en: "Do you like eating seafood? Which kind do you like? - I like eating shrimp and fish.", 
                    ru: "Вы любите морепродукты? Какой вид вам нравится? - Мне нравится есть креветки и рыбу." 
                }, 
                en: "Do you like eating seafood? Which kind do you like?", 
                ru: "Вы любите морепродукты? Какой вид вам нравится?", 
                distractors: [
                    {vi: "Bạn ăn cơm chưa?", trans: {en: "Have you eaten rice yet?", ru: "Вы đã ели рис?"}}, 
                    {vi: "Hải sản có đắt không?", trans: {en: "Is seafood expensive?", ru: "Морепродукты дорогие?"}}
                ] 
            },
            { 
                q: "Bạn có muốn đi chơi ngoài biển vào chủ nhật này không?", 
                ans: "Ok. Hẹn gặp bạn ngoài biển lúc 3 giờ chiều chủ nhật nha.", 
                ansTrans: { 
                    en: "Do you want to go to the beach this Sunday? - OK. See you at the beach at 3 PM this Sunday.", 
                    ru: "Вы хотите пойти на пляж в это воскресенье? - Окей. Увидимся на пляже в 3 часа дня в это воскресенье." 
                }, 
                en: "Do you want to go to the beach this Sunday?", 
                ru: "Вы хотите пойти на пляж в это воскресенье?", 
                distractors: [
                    {vi: "Chủ nhật bạn làm gì?", trans: {en: "What are you doing on Sunday?", ru: "Что вы делаете в воскресенье?"}}, 
                    {vi: "Bạn có bận không?", trans: {en: "Are you busy?", ru: "Вы заняты?"}}
                ] 
            }
        ];

        // Highlight Logic Map
        const highlightMap = {
            "gì": { en: ["what"], ru: ["что", "какой"] },
            "mấy": { en: ["how many"], ru: ["сколько"] },
            "đâu": { en: ["where"], ru: ["где"] },
            "nào": { en: ["which", "kind"], ru: ["какой", "вид"] },
            "hay": { en: ["often", "or"], ru: ["часто", "или"] },
            "tại sao": { en: ["why"], ru: ["почему"] },
            "với ai": { en: ["who", "with"], ru: ["с кем"] },
            "bao lâu": { en: ["how long"], ru: ["как долго"] }
        };

        // Bỏ "hay" khỏi tooltip vì nó ở giữa câu (nghĩa là often)
        const specialTooltips = {
            "không": {
                en: "The word 'không' at the end of a sentence marks a Yes/No question.",
                ru: "Слово 'không' в конце предложения указывает на вопрос типа 'Да/Нет'."
            }
        };

        const uiStrings = {
            en: {
                htpTitle: "HOW TO PLAY",
                step1: "Read the answer below.",
                step2: "Drag the correct question into the box.",
                step3: "Click on any word to hear it.",
                btnStart: "START GAME",
                topic: "THE BEACH",
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
                topic: "ПЛЯЖ",
                next: "ДАЛЕЕ →",
                dropText: "Перетащите вопрос сюда...",
                reviewTitle: "Результат обучения",
                btnAgain: "ИГРАТЬ СНОВА",
                round: "РАУНД",
                listenAll: "СЛУШАТЬ ВСЕ"
            }
        };

        const wordGroups = ["ngày nào cũng", "ra biển", "một tuần", "khoảng", "gặp bạn bè", "bóng chuyền", "thư giãn", "bao lâu", "hải sản", "loại nào", "chủ nhật", "mát mẻ", "hẹn gặp", "chiều chủ nhật", "với ai", "tại sao"];

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
            document.getElementById('htp-title').innerHTML = \`<span>🏖️</span> \${s.htpTitle}\`;
            document.getElementById('step-1').innerText = s.step1;
            document.getElementById('step-2').innerText = s.step2;
            document.getElementById('step-3').innerText = s.step3;
            document.getElementById('btn-start').innerText = s.btnStart;
            document.getElementById('topic-label').innerText = s.topic;
            document.getElementById('next-round-btn').innerText = s.next;
            document.getElementById('review-title').innerText = s.reviewTitle;
            document.getElementById('btn-again').innerText = s.btnAgain;
            document.getElementById('text-listen-all').innerText = s.listenAll;
            document.getElementById('round-title').innerText = \`\${s.round} \${currentRound + 1}/\${beachData.length}\`;
            
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
                const isMatch = targetWords.some(tw => chipText === tw || chipText.includes(tw) || tw.includes(chipText));
                if (isMatch) {
                    if (isEnter) chip.classList.add('highlight-match');
                    else chip.classList.remove('highlight-match');
                }
            });
        }

        function parseToWordChips(text, isTranslation = false) {
            let processed = text;
            const SEP = "|||";
            const sortedGroups = [...wordGroups].sort((a,b) => b.length - a.length);
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
                        const match = w.match(/^(.+?)([?.!,]*)$/);
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
            const normWord = word.toLowerCase().trim();
            const tooltipData = specialTooltips[normWord];
            const cls = isTranslation ? 'word-chip-trans' : 'word-chip';
            let hoverAttr = !isTranslation ? \`onmouseenter="handleHoverWord('\${word}', true)" onmouseleave="handleHoverWord('\${word}', false)"\` : "";

            if (tooltipData && !isTranslation) {
                const tooltipText = tooltipData[userLang] || tooltipData['en'];
                return \`<span class="\${cls}" \${hoverAttr} onclick="event.stopPropagation(); speakText(null, '\${word}')">\${word}<span class="tooltip-text">\${tooltipText}</span></span>\`;
            } else {
                return \`<span class="\${cls}" \${hoverAttr} onclick="event.stopPropagation(); speakText(null, '\${word}')">\${word}</span>\`;
            }
        }

        function parseTranslationToChips(text) {
            return text.split(/(\\s+)/).map(w => w.trim() ? \`<span class="word-chip-trans inline-block transition-all px-1 rounded">\${w}</span>\` : w).join('');
        }

        function loadRound() {
            roundSolved = false;
            updateUI();
            const list = document.getElementById('bubble-list');
            list.innerHTML = '';
            const data = beachData[currentRound];
            
            const drop = document.createElement('div');
            drop.className = 'drop-zone';
            drop.id = 'drop-target';
            drop.innerText = uiStrings[userLang].dropText;
            list.appendChild(drop);

            const ans = document.createElement('div');
            ans.className = 'bubble bubble-ella-quest';
            ans.id = 'ans-bubble';
            const fullTrans = userLang === 'en' ? data.ansTrans.en : data.ansTrans.ru;
            const transText = fullTrans.includes(' - ') ? fullTrans.split(' - ')[1] : fullTrans;
            
            ans.innerHTML = \`
                <div class="flex items-start gap-3">
                    <div class="mini-speaker" id="ans-speaker" onclick="speakText(document.getElementById('ans-bubble'), '\${data.ans}')">🔊</div>
                    <div>
                        <div class="text-[18px] leading-relaxed font-bold">\${parseToWordChips(data.ans)}</div>
                        <div class="text-[13px] text-sky-600 italic font-semibold mt-1 translation-text">\${parseTranslationToChips(transText)}</div>
                    </div>
                </div>\`;
            list.appendChild(ans);
            renderDraggables();
        }

        function renderDraggables() {
            const box = document.getElementById('floating-box');
            box.innerHTML = '';
            const data = beachData[currentRound];
            const options = [
                {vi: data.q, trans: userLang === 'en' ? data.en : data.ru, correct: true},
                ...data.distractors.map(d => ({vi: d.vi, trans: userLang === 'en' ? d.trans.en : d.trans.ru, correct: false}))
            ].sort(() => Math.random() - 0.5);

            options.forEach((opt, idx) => {
                const el = document.createElement('div');
                el.className = 'draggable-item';
                el.id = \`drag-\${idx}\`;
                el.innerHTML = \`<div class="text-[14px] font-bold">\${opt.vi}</div><div class="text-[10px] text-slate-500 font-medium">\${opt.trans}</div>\`;
                el.style.left = \`\${10 + (idx * 30)}%\`;
                el.style.top = \`\${60 + (idx % 2 * 10)}%\`;
                
                let offsetX, offsetY;
                const onMove = (e) => {
                    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
                    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
                    el.style.left = (clientX - offsetX) + 'px';
                    el.style.top = (clientY - offsetY) + 'px';
                    el.style.animation = 'none';
                    el.style.zIndex = 1000;
                };

                const onEnd = () => {
                    document.removeEventListener('mousemove', onMove);
                    document.removeEventListener('mouseup', onEnd);
                    document.removeEventListener('touchmove', onMove);
                    document.removeEventListener('touchend', onEnd);

                    const dropZone = document.getElementById('drop-target');
                    const dr = dropZone.getBoundingClientRect();
                    const er = el.getBoundingClientRect();

                    if (!(er.right < dr.left || er.left > dr.right || er.bottom < dr.top || er.top > dr.bottom) && opt.correct) {
                        handleCorrect(el, opt.vi);
                    } else {
                        el.style.left = \`\${10 + (idx * 30)}%\`;
                        el.style.top = \`\${60 + (idx % 2 * 10)}%\`;
                        el.style.animation = 'floating 4s ease-in-out infinite';
                    }
                };

                el.onmousedown = el.ontouchstart = (e) => {
                    if (roundSolved) return;
                    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
                    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
                    offsetX = clientX - el.offsetLeft;
                    offsetY = clientY - el.offsetTop;
                    document.addEventListener('mousemove', onMove);
                    document.addEventListener('mouseup', onEnd);
                    document.addEventListener('touchmove', onMove, {passive: false});
                    document.addEventListener('touchend', onEnd);
                    e.preventDefault();
                };
                box.appendChild(el);
            });
        }

        function handleCorrect(el, text) {
            roundSolved = true;
            document.getElementById('floating-box').innerHTML = '';
            
            const drop = document.getElementById('drop-target');
            drop.className = 'bubble bubble-user-ans';
            const data = beachData[currentRound];
            const qTrans = userLang === 'en' ? data.en : data.ru;

            drop.innerHTML = \`
                <div class="flex items-start gap-3">
                    <div class="mini-speaker" id="q-speaker">🔊</div>
                    <div>
                        <div class="text-[18px] leading-relaxed font-bold">\${parseToWordChips(text)}</div>
                        <div class="text-[13px] text-sky-600 italic font-semibold mt-1 translation-text">\${parseTranslationToChips(qTrans)}</div>
                    </div>
                </div>\`;

            correctSfx.play();
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
            speakText(drop, text, () => setTimeout(() => speakText(document.getElementById('ans-bubble'), data.ans), 500));
            document.getElementById('q-speaker').onclick = (e) => { e.stopPropagation(); speakText(drop, text); };
        }

        function nextRound() {
            if (currentRound < beachData.length - 1) { currentRound++; loadRound(); }
            else showReview();
        }

        function prevRound() { if (currentRound > 0) { currentRound--; loadRound(); } }

        function showReview() {
            document.getElementById('review-page').classList.remove('hidden');
            const list = document.getElementById('review-list');
            list.innerHTML = '';
            beachData.forEach((data) => {
                const item = document.createElement('div');
                item.className = 'review-item';
                item.innerHTML = \`
                    <div class="flex justify-between items-center">
                        <div class="flex-1">
                            <div class="text-[16px] font-bold text-slate-800">\${data.q}</div>
                            <div class="text-[12px] text-sky-600 font-bold mt-1">\${userLang === 'en' ? data.en : data.ru}</div>
                        </div>
                        <div class="text-xl">🔊</div>
                    </div>\`;
                item.onclick = () => speakText(item, data.q);
                list.appendChild(item);
            });
        }

        async function listenAllQuestions() {
            const btn = document.getElementById('btn-listen-all');
            btn.style.opacity = "0.5"; btn.style.pointerEvents = "none";
            const items = document.querySelectorAll('.review-item');
            for (let i = 0; i < beachData.length; i++) {
                await new Promise(resolve => speakText(items[i], beachData[i].q, resolve));
                await new Promise(r => setTimeout(r, 600));
            }
            btn.style.opacity = "1"; btn.style.pointerEvents = "auto";
        }
    </script>
</body>
</html>
`;

export const GameBeachMakeQuestion: React.FC = () => {
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
                    title="Make Question Game - The Beach"
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

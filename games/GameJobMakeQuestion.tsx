
import React, { useState, useEffect, useRef } from 'react';
import { Maximize, Minimize } from 'lucide-react';

const gameHTML = `
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MAKE QUESTION VIET: JOB</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@400;600;700&display=swap');

        body {
            font-family: 'Quicksand', sans-serif;
            background: linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%);
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            margin: 0;
            overflow: hidden;
            touch-action: none;
        }

        .game-card {
            background-image: url('https://lh3.googleusercontent.com/d/1IFWERsWPDJOzuS-UNt7FaqVmB8QpVdjA'); 
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
            background-color: white;
        }

        .overlay {
            position: absolute;
            inset: 0;
            background: linear-gradient(to bottom, rgba(255, 255, 255, 0.9), rgba(224, 231, 255, 0.95));
            backdrop-filter: blur(15px);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 500;
            padding: 20px;
        }

        .start-container {
            background: white;
            padding: 2.5rem;
            border-radius: 3rem;
            box-shadow: 0 20px 40px rgba(79, 70, 229, 0.15);
            max-width: 480px;
            width: 100%;
            border: 2px solid #e0e7ff;
            text-align: center;
        }

        .game-title {
            background: linear-gradient(45deg, #4f46e5, #be185d);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            font-size: 2.25rem;
            font-weight: 900;
            line-height: 1.2;
            margin-bottom: 1.5rem;
            letter-spacing: -0.05em;
        }

        #game-header {
            flex-shrink: 0;
            background: rgba(255, 255, 255, 0.85);
            backdrop-filter: blur(12px);
            border-bottom: 1px solid rgba(0, 0, 0, 0.05);
            padding: 0.75rem 1.25rem;
            display: grid;
            grid-template-columns: 1fr auto 1fr;
            align-items: center;
            z-index: 100;
        }

        .nav-btn {
            background: #f1f5f9;
            color: #475569;
            width: 36px;
            height: 36px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
            border: 1px solid #e2e8f0;
        }
        .nav-btn:hover { background: #e2e8f0; color: #1e293b; }

        .btn-next-round {
            background: #4f46e5;
            color: white;
            padding: 10px 24px;
            border-radius: 14px;
            font-weight: 900;
            font-size: 14px;
            box-shadow: 0 4px 10px rgba(79, 70, 229, 0.3);
            transition: all 0.3s;
            opacity: 0.2;
            pointer-events: none;
            white-space: nowrap;
        }
        .btn-next-round.enabled {
            opacity: 1;
            pointer-events: auto;
            animation: pulse-next 2s infinite;
        }

        @keyframes pulse-next {
            0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.4); }
            70% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(79, 70, 229, 0); }
            100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(79, 70, 229, 0); }
        }

        .scene-container {
            flex: 1;
            position: relative;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }

        .bubble-area {
            padding: 155px 20px 20px 20px;
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
            z-index: 10;
        }

        .drop-zone {
            border: 4px dashed #be185d;
            background: rgba(255, 255, 255, 0.6);
            min-height: 110px;
            border-radius: 1.5rem;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #be185d;
            font-weight: 700;
            font-style: italic;
            transition: all 0.2s ease;
            position: relative;
            text-align: center;
            padding: 15px;
        }

        .drop-zone.active {
            background: rgba(190, 24, 93, 0.2);
            border-color: #4f46e5;
            border-style: solid;
            transform: scale(1.02);
        }

        .floating-container {
            position: absolute;
            inset: 0;
            pointer-events: none;
            z-index: 20;
        }

        .draggable-item {
            position: absolute;
            pointer-events: auto;
            background: white;
            padding: 14px 24px;
            border-radius: 1.2rem;
            box-shadow: 0 15px 30px rgba(0,0,0,0.15);
            border: 2px solid #6366f1;
            cursor: grab;
            user-select: none;
            max-width: 250px;
            text-align: center;
            z-index: 30; 
        }

        .bubble {
            padding: 1.2rem 1.8rem;
            border-radius: 1.5rem;
            max-width: 90%;
            box-shadow: 0 10px 25px rgba(0,0,0,0.08);
            background: white;
            position: relative;
        }

        .bubble-user-ans {
            align-self: flex-end;
            border: 3px solid #0369a1;
            background: #f0f9ff;
            color: #0369a1;
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
        }

        .bubble-ella-quest {
            align-self: flex-start;
            border-left: 8px solid #be185d;
            color: #be185d;
            min-width: 320px;
        }

        .word-chip {
            display: inline-block;
            cursor: pointer;
            padding: 4px 10px;
            margin: 2px;
            border-radius: 10px;
            transition: all 0.2s;
            background: #f1f5f9;
            border-bottom: 3px solid #e2e8f0;
            color: #1e293b;
            font-weight: 700;
            position: relative;
        }
        .word-chip:hover {
            background: #e0e7ff;
            color: #4338ca;
            border-bottom-color: #c7d2fe;
            transform: translateY(-2px);
        }
        
        .word-chip.is-question-word {
            background: #fdf2f8;
            border-bottom-color: #fbcfe8;
            color: #be185d;
        }
        
        .word-chip.is-question-word:hover, .word-chip.is-question-word.highlight-active {
            background: #be185d;
            color: white;
            border-bottom-color: #9d174d;
            box-shadow: 0 0 15px rgba(190, 24, 93, 0.4);
        }

        .translation-text.highlight-active {
            color: #be185d !important;
            font-weight: 900;
            text-decoration: underline;
            transition: all 0.2s;
        }

        .mini-speaker {
            cursor: pointer;
            padding: 8px;
            border-radius: 50%;
            background: #fdf2f8;
            border: 1px solid #fbcfe8;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }
        .mini-speaker:hover { background: #fce7f3; transform: scale(1.1); }

        .hidden { display: none !important; }

        .how-to-play-card { background: #f8fafc; border-radius: 1.5rem; padding: 1.25rem; margin: 1.5rem 0; border: 1px solid #e2e8f0; text-align: left; }
        .step-pill { background: #4f46e5; color: white; width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 800; flex-shrink: 0; }
        .toggle-btn { flex: 1; padding: 10px; border-radius: 12px; font-weight: 700; background: #f1f5f9; transition: all 0.2s; border: 2px solid transparent; }
        .toggle-btn.active { background: #4f46e5; color: white; border-color: #4338ca; }

        /* REVIEW ROUND 9 STYLES */
        .review-page {
            position: absolute;
            inset: 0;
            background: white;
            z-index: 200;
            display: flex;
            flex-direction: column;
            padding: 20px;
        }

        .review-scroll-area {
            flex: 1;
            overflow-y: auto;
            padding-right: 10px;
            scroll-behavior: smooth;
        }

        .review-item {
            padding: 20px;
            border-radius: 1.5rem;
            margin-bottom: 20px;
            transition: all 0.3s ease;
            border: 2px solid #f1f5f9;
        }

        .review-item.active-reading {
            border-color: #4f46e5;
            background: #f5f3ff;
            transform: scale(1.02);
            box-shadow: 0 10px 20px rgba(79, 70, 229, 0.1);
        }

        .listen-all-btn {
            background: #be185d;
            color: white;
            padding: 12px 24px;
            border-radius: 12px;
            font-weight: 900;
            display: flex;
            align-items: center;
            gap: 10px;
            transition: all 0.2s;
        }
        .listen-all-btn:active { transform: scale(0.95); }
        .listen-all-btn.playing { background: #9d174d; animation: pulse-red 1s infinite; }

        @keyframes pulse-red {
            0% { opacity: 1; }
            50% { opacity: 0.7; }
            100% { opacity: 1; }
        }

    </style>
</head>
<body onload="initApp()">

    <div class="game-card" id="main-card">
        <!-- Start Overlay -->
        <div id="start-overlay" class="overlay">
            <div id="overlay-content" class="start-container">
                <h1 class="game-title">MAKE QUESTION VIET: JOB</h1>
                
                <div class="how-to-play-card">
                    <h3 id="ui-how-to-title" class="text-xs font-black text-indigo-600 mb-3 uppercase tracking-widest flex items-center gap-2">
                        <span>✨</span> HOW TO PLAY / CÁCH CHƠI
                    </h3>
                    <div class="space-y-3">
                        <div class="flex items-center gap-3">
                            <div class="step-pill">1</div>
                            <p id="ui-step-1" class="text-xs font-bold text-slate-700">Đọc câu trả lời từ Cô thợ bánh.</p>
                        </div>
                        <div class="flex items-center gap-3">
                            <div class="step-pill">2</div>
                            <p id="ui-step-2" class="text-xs font-bold text-slate-700">Kéo "Câu hỏi" đúng thả vào khung trống.</p>
                        </div>
                        <div class="flex items-center gap-3">
                            <div class="step-pill">3</div>
                            <p id="ui-step-3" class="text-xs font-bold text-slate-700">Bấm các cụm từ để nghe phát âm chuẩn.</p>
                        </div>
                    </div>
                </div>

                <div class="mb-6 text-center">
                    <p id="ui-translation-label" class="text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-widest">Dịch nghĩa / Translation</p>
                    <div class="flex gap-2">
                        <button onclick="setLang('en')" id="lang-en" class="toggle-btn active text-xs">ENGLISH</button>
                        <button onclick="setLang('ru')" id="lang-ru" class="toggle-btn text-xs">RUSSIAN</button>
                    </div>
                </div>

                <button id="ui-btn-start" onclick="startGame()" class="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xl shadow-xl shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all">BẮT ĐẦU CHƠI</button>
            </div>
        </div>

        <!-- Header -->
        <div id="game-header">
            <div class="flex items-center gap-4">
                <div class="flex flex-col">
                    <span id="ui-level-tag" class="text-[9px] font-black text-indigo-600 uppercase tracking-tighter mb-1">DRAG & DROP</span>
                    <h2 id="round-title" class="text-sm font-black text-slate-900 leading-none">ROUND 1/8</h2>
                </div>
                <div class="flex gap-1">
                    <button onclick="prevRound()" class="nav-btn">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M15 19l-7-7 7-7"/></svg>
                    </button>
                    <button onclick="skipRound()" class="nav-btn">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M9 5l7 7-7 7"/></svg>
                    </button>
                </div>
            </div>

            <div>
                <button id="next-round-btn" onclick="nextRound()" class="btn-next-round">NEXT ROUND →</button>
            </div>

            <div class="flex flex-col items-end">
                <div class="w-20 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div id="progress-bar" class="h-full bg-indigo-600 transition-all duration-500" style="width: 10%"></div>
                </div>
                <span id="ui-progress-label" class="text-[9px] font-bold text-slate-400 mt-1 uppercase">Progress</span>
            </div>
        </div>

        <div class="scene-container" id="scene-root">
            <div class="bubble-area" id="bubble-list"></div>
            <div class="floating-container" id="floating-box"></div>
            
            <!-- ROUND 9 REVIEW PAGE -->
            <div id="round-9-page" class="review-page hidden">
                <div class="flex justify-between items-center mb-6">
                    <div>
                        <h2 id="ui-r9-title" class="text-2xl font-black text-slate-800">ROUND 9: REVIEW</h2>
                        <p id="ui-r9-subtitle" class="text-xs font-bold text-indigo-500 uppercase">Ôn tập tất cả các câu hỏi</p>
                    </div>
                    <button id="btn-listen-all" onclick="listenAll()" class="listen-all-btn">
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828a1 1 0 010-1.415z"/></svg>
                        <span id="ui-listen-all-text">LISTEN ALL</span>
                    </button>
                </div>

                <div id="review-list" class="review-scroll-area"></div>

                <button id="ui-btn-restart" onclick="restartGame()" class="mt-4 w-full py-4 bg-slate-800 text-white rounded-2xl font-black text-lg hover:bg-slate-900 transition-all shadow-xl shadow-slate-200">
                    START AGAIN / CHƠI LẠI
                </button>
            </div>
        </div>
    </div>

    <audio id="sfx-correct" src="https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3"></audio>

    <script>
        const jobData = [
            { q: "Bạn làm công việc gì?", ans: "Mình là chủ một cửa hàng bánh nhỏ.", ansTrans: { en: "I am the owner of a small bakery.", ru: "Я владелец небольшой пекарни." }, en: "What is your job?", ru: "Кем ты работаешь?", distractors: [{vi: "Bạn sống ở đâu?", trans: {en: "Where do you live?", ru: "Где ты живешь?"}}, {vi: "Bạn bao nhiêu tuổi?", trans: {en: "How old are you?", ru: "Сколько тебе лет?"}}] },
            { q: "Bạn làm việc ở đâu?", ans: "Mình làm việc ngay tại tiệm bánh của mình ở phố đi bộ.", ansTrans: { en: "I work right at my bakery on the walking street.", ru: "Я работаю прямо в своей пекарне на пешеходной улице." }, en: "Where do you work?", ru: "Где ты работаешь?", distractors: [{vi: "Công ty bạn tên gì?", trans: {en: "What's your company name?", ru: "Как называется твоя компания?"}}, {vi: "Bạn làm việc với ai?", trans: {en: "Who do you work with?", ru: "С кем ты работаешь?"}}] },
            { q: "Bạn làm việc bao nhiêu tiếng một ngày?", ans: "Mình thường làm việc 8 tiếng mỗi ngày.", ansTrans: { en: "I usually work 8 hours every day.", ru: "Я обычно работаю 8 часов каждый день." }, en: "How many hours a day do you work?", ru: "Сколько часов в день вы работаете?", distractors: [{vi: "Bạn dậy lúc mấy giờ?", trans: {en: "What time do you wake up?", ru: "Во сколько ты просыпаешься?"}}, {vi: "Bạn có thích đi làm không?", trans: {en: "Do you like going to work?", ru: "Тебе нравится ходить на работу?"}}] },
            { q: "Bạn thích gì nhất ở công việc này?", ans: "Mình thích nhất là được thấy khách hàng khen bánh ngon.", ansTrans: { en: "I love seeing customers enjoy and praise my cakes.", ru: "Мне больше всего нравится видеть, как клиенты хвалят мои пирожные." }, en: "What do you like most about your job?", ru: "Что вам больше всего нравится в вашей работе?", distractors: [{vi: "Bạn ghét điều gì nhất?", trans: {en: "What do you hate most?", ru: "Что ты ненавидишь больше всего?"}}, {vi: "Lương của bạn bao nhiêu?", trans: {en: "How much is your salary?", ru: "Какая у тебя зарплата?"}}] },
            { q: "Quản lý của bạn có tốt không?", ans: "Mình là quản lý đây, và mình luôn lắng nghe, hỗ trợ nhân viên.", ansTrans: { en: "I am the manager here, and I always listen to and support my staff.", ru: "Я здесь менеджер, и я всегда слушаю и поддерживаю своих сотрудников." }, en: "Is your manager good?", ru: "Ваш менеджер хороший?", distractors: [{vi: "Bạn có nhân viên không?", trans: {en: "Do you have employees?", ru: "У тебя есть сотрудники?"}}, {vi: "Sếp bạn tên là gì?", trans: {en: "Как зовут твоего босса?", ru: "Как зовут вашего начальника?"}}] },
            { q: "Đồng nghiệp của bạn thế nào?", ans: "Đồng nghiệp của mình rất nhiệt huyết và luôn sẵn sàng giúp đỡ.", ansTrans: { en: "My colleagues are very enthusiastic and always ready to help.", ru: "Мои коллеги очень полны энтузиазма и всегда готовы помочь." }, en: "How are your colleagues?", ru: "Как ваши коллеги?", distractors: [{vi: "Bạn có nhiều bạn không?", trans: {en: "Do you have many friends?", ru: "У тебя много друзей?"}}, {vi: "Họ làm việc ở bộ phận nào?", trans: {en: "Which department do they work in?", ru: "В каком отделе они работают?"}}] },
            { q: "Sau giờ làm bạn thường làm gì?", ans: "Mình thường đi dạo hoặc tìm công thức bánh mới.", ansTrans: { en: "I usually go for a walk or look for new cake recipes.", ru: "Я обычно гуляю или ищу новые рецепты тортов." }, en: "What do you usually do after work?", ru: "Что вы обычно делаете после работы?", distractors: [{vi: "Bạn ăn tối lúc mấy giờ?", trans: {en: "What time do you eat dinner?", ru: "Во сколько вы ужинаете?"}}, {vi: "Bạn có thích xem phim không?", trans: {en: "Do you like watching movies?", ru: "Вы любите смотреть фильмы?"}}] },
            { q: "Bạn nghỉ bao nhiêu ngày một tuần?", ans: "Mình thường nghỉ một ngày vào thứ hai hàng tuần.", ansTrans: { en: "I usually take one day off every Monday.", ru: "Я обычно беру один выходной каждый понедельник." }, en: "How many days off do you have per week?", ru: "Сколько выходных у вас в неделю?", distractors: [{vi: "Khi nào bạn đi du lịch?", trans: {en: "When do you go traveling?", ru: "Когда вы путешествуете?"}}, {vi: "Bạn có làm việc thứ bảy không?", trans: {en: "Do you work on Saturdays?", ru: "Вы работаете по субботам?"}}] }
        ];

        const compoundWords = ["công việc", "cửa hàng", "phố đi bộ", "tiệm bánh", "bánh nhỏ", "làm việc", "bao nhiêu", "tiếng", "một ngày", "mỗi ngày", "thích nhất", "khách hàng", "nhân viên", "quản lý", "đồng nghiệp", "nhiệt huyết", "giúp đỡ", "sau giờ làm", "đi dạo", "công thức", "nghỉ", "hàng tuần", "thứ hai", "thứ bảy", "đi du lịch", "lắng nghe", "hỗ trợ", "sẵn sàng", "thế nào"];
        const questionWords = ["đâu", "gì", "nào", "bao nhiêu", "ai", "thế nào", "khi nào", "mấy giờ", "tiếng", "không"];

        const questionMapping = {
            "đâu": ["where", "где"], "gì": ["what", "что"], "nào": ["which", "какой"], "bao nhiêu": ["how many", "how much", "сколько"],
            "ai": ["who", "кто"], "thế nào": ["how", "как"], "khi nào": ["when", "когда"], "mấy giờ": ["what time", "сколько времени"],
            "tiếng": ["hours", "часов"], "không": ["?"] 
        };

        const uiStrings = {
            en: {
                howToTitle: "✨ HOW TO PLAY",
                step1: "Read the answer from the Baker.",
                step2: "Drag the correct 'Question' into the empty box.",
                step3: "Click phrases to hear standard pronunciation.",
                transLabel: "Translation",
                btnStart: "START GAME",
                levelTag: "DRAG & DROP",
                round: "ROUND",
                progress: "Progress",
                dropZone: "Drag question here...",
                next: "NEXT ROUND →",
                tryAgain: "Try again!",
                r9Title: "ROUND 9: REVIEW",
                r9Subtitle: "Review all questions and answers",
                listenAll: "LISTEN ALL",
                stopping: "STOPPING...",
                restart: "START AGAIN",
                qPrefix: "Question",
                aPrefix: "Answer"
            },
            ru: {
                howToTitle: "✨ КАК ИГРАТЬ",
                step1: "Прочитайте ответ Пекаря.",
                step2: "Перетащите правильный «Вопрос» в пустое поле.",
                step3: "Нажимайте на фразы, чтобы услышать произношение.",
                transLabel: "Перевод",
                btnStart: "НАЧАТЬ ИГРУ",
                levelTag: "ПЕРЕТАЩИ И БРОСЬ",
                round: "РАУНД",
                progress: "Прогресс",
                dropZone: "Перетащите вопрос сюда...",
                next: "СЛЕДУЮЩИЙ →",
                tryAgain: "Попробуй еще раз!",
                r9Title: "РАУНД 9: ОБЗОР",
                r9Subtitle: "Просмотрите все вопросы и ответы",
                listenAll: "СЛУШАТЬ ВСЕ",
                stopping: "ОСТАНОВКА...",
                restart: "ИГРАТЬ СНОВА",
                qPrefix: "Вопрос",
                aPrefix: "Ответ"
            }
        };

        let currentRound = 0, userLang = 'en', isDragging = false, draggedElement = null, offset = { x: 0, y: 0 }, currentTarget = null, animations = [], roundSolved = false, isListeningAll = false;

        function initApp() { setLang('en'); }

        function updateUILanguage() {
            const s = uiStrings[userLang];
            document.getElementById('ui-how-to-title').innerHTML = \`<span>✨</span> \${s.howToTitle}\`;
            document.getElementById('ui-step-1').innerText = s.step1;
            document.getElementById('ui-step-2').innerText = s.step2;
            document.getElementById('ui-step-3').innerText = s.step3;
            document.getElementById('ui-translation-label').innerText = s.transLabel;
            document.getElementById('ui-btn-start').innerText = s.btnStart;
            document.getElementById('ui-level-tag').innerText = s.levelTag;
            document.getElementById('ui-progress-label').innerText = s.progress;
            document.getElementById('ui-r9-title').innerText = s.r9Title;
            document.getElementById('ui-r9-subtitle').innerText = s.r9Subtitle;
            document.getElementById('ui-listen-all-text').innerText = s.listenAll;
            document.getElementById('ui-btn-restart').innerText = s.restart;
            
            if (!document.getElementById('start-overlay').classList.contains('hidden')) {
                // Stay on start
            } else if (!document.getElementById('round-9-page').classList.contains('hidden')) {
                renderReviewList();
            } else {
                loadRound();
            }
        }

        function setLang(l) { 
            userLang = l; 
            document.getElementById('lang-en').classList.toggle('active', l === 'en'); 
            document.getElementById('lang-ru').classList.toggle('active', l === 'ru'); 
            updateUILanguage();
        }

        function startGame() { 
            document.getElementById('start-overlay').classList.add('hidden'); 
            document.getElementById('round-9-page').classList.add('hidden');
            document.getElementById('game-header').classList.remove('hidden');
            currentRound = 0; 
            loadRound(); 
        }

        function restartGame() {
            isListeningAll = false;
            startGame();
        }

        function prevRound() { if (currentRound > 0) { currentRound--; loadRound(); } }
        function skipRound() { if (currentRound < jobData.length - 1) { currentRound++; loadRound(); } else { openReviewPage(); } }
        
        function nextRound() { 
            if (!roundSolved) return; 
            if (currentRound < jobData.length - 1) { 
                currentRound++; 
                loadRound(); 
            } else { 
                openReviewPage();
            } 
        }

        function openReviewPage() {
            document.getElementById('game-header').classList.add('hidden');
            document.getElementById('round-9-page').classList.remove('hidden');
            renderReviewList();
        }

        function renderReviewList() {
            const list = document.getElementById('review-list');
            const s = uiStrings[userLang];
            list.innerHTML = jobData.map((data, index) => \`
                <div id="review-item-\${index}" class="review-item bg-white flex justify-between items-center gap-4">
                    <div class="flex-1">
                        <div class="mb-3">
                            <span class="text-[9px] font-black text-indigo-500 uppercase">\${s.qPrefix} \${index + 1}</span>
                            <p class="text-base font-bold text-slate-800">\${data.q}</p>
                            <p class="text-xs text-slate-400 italic">\${userLang === 'en' ? data.en : data.ru}</p>
                        </div>
                        <div>
                            <span class="text-[9px] font-black text-pink-500 uppercase">\${s.aPrefix}</span>
                            <p class="text-sm font-semibold text-slate-700">\${data.ans}</p>
                            <p class="text-xs text-slate-400 italic">\${userLang === 'en' ? data.ansTrans.en : data.ansTrans.ru}</p>
                        </div>
                    </div>
                    <button onclick="speakPair(\${index})" class="mini-speaker bg-slate-50 border-slate-200">
                        <svg class="w-5 h-5 text-indigo-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828a1 1 0 010-1.415z"/></svg>
                    </button>
                </div>
            \`).join('');
        }

        async function speakPair(index) {
            const items = document.querySelectorAll('.review-item');
            items.forEach(it => it.classList.remove('active-reading'));
            const currentItem = document.getElementById(\`review-item-\${index}\`);
            if (currentItem) {
                currentItem.classList.add('active-reading');
                currentItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            await speak(jobData[index].q);
            await new Promise(r => setTimeout(r, 500));
            await speak(jobData[index].ans);
            if (!isListeningAll && currentItem) {
                setTimeout(() => currentItem.classList.remove('active-reading'), 1000);
            }
        }

        async function listenAll() {
            if (isListeningAll) return;
            isListeningAll = true;
            const btn = document.getElementById('btn-listen-all');
            const s = uiStrings[userLang];
            btn.classList.add('playing');
            document.getElementById('ui-listen-all-text').innerText = s.stopping;
            btn.onclick = () => { location.reload(); };

            for (let i = 0; i < jobData.length; i++) {
                if (!isListeningAll) break;
                await speakPair(i);
                await new Promise(r => setTimeout(r, 1000));
            }

            isListeningAll = false;
            btn.classList.remove('playing');
            document.getElementById('ui-listen-all-text').innerText = s.listenAll;
            btn.onclick = listenAll;
        }

        function speak(text) {
            return new Promise((resolve) => {
                const url = \`https://translate.google.com/translate_tts?ie=UTF-8&q=\${encodeURIComponent(text)}&tl=vi&client=tw-ob\`;
                const audio = new Audio(url);
                audio.onended = resolve; audio.onerror = resolve; audio.play();
            });
        }

        function handleWordHighlight(word, activate) {
            const cleanWord = word.toLowerCase().replace(/[?.!,]/g, '');
            if (!questionWords.includes(cleanWord)) return;
            const chips = document.querySelectorAll(\`.word-chip[data-word="\${cleanWord}"]\`);
            chips.forEach(c => c.classList.toggle('highlight-active', activate));
            const targets = questionMapping[cleanWord] || [];
            const transArea = document.querySelector('.translation-text-area');
            if (!transArea) return;
            targets.forEach(target => {
                if (target === "?") {
                    if (activate) transArea.innerHTML = transArea.innerHTML.replace(/\\?$/, \`<span class="translation-text highlight-active">?</span>\`);
                    else transArea.innerHTML = transArea.innerHTML.replace(/<span class="translation-text highlight-active">\\?<\/span>$/, "?");
                } else {
                    const regex = new RegExp(\`(\${target})\`, 'gi');
                    if (activate) transArea.innerHTML = transArea.innerHTML.replace(regex, \`<span class="translation-text highlight-active">\$1</span>\`);
                    else transArea.innerHTML = transArea.innerHTML.replace(/<span class="translation-text highlight-active">(.*?)<\/span>/gi, '$1');
                }
            });
        }

        function renderTappableText(text) {
            let resultHtml = "";
            let remainingText = text;
            const sortedPhrases = [...compoundWords].sort((a, b) => b.length - a.length);
            while (remainingText.length > 0) {
                let foundMatch = false;
                for (const phrase of sortedPhrases) {
                    const regex = new RegExp(\`^\${phrase}([\\\\s?.!,]|$) \`, "i");
                    const match = remainingText.match(regex);
                    if (match) {
                        const matchedText = match[0].trim();
                        const isQ = questionWords.includes(phrase.toLowerCase());
                        resultHtml += \`<span class="word-chip \${isQ ? 'is-question-word' : ''}" data-word="\${phrase.toLowerCase()}" onmouseenter="handleWordHighlight('\${phrase}', true)" onmouseleave="handleWordHighlight('\${phrase}', false)" onclick="event.stopPropagation(); speak('\${phrase.replace(/'/g, "\\\\'")}')">\${matchedText}</span> \`;
                        remainingText = remainingText.substring(match[0].length).trim();
                        foundMatch = true; break;
                    }
                }
                if (!foundMatch) {
                    const firstSpaceIndex = remainingText.indexOf(' ');
                    let singleWordWithPunc = (firstSpaceIndex === -1) ? remainingText : remainingText.substring(0, firstSpaceIndex);
                    const cleanWord = singleWordWithPunc.toLowerCase().replace(/[?.!,]/g, '');
                    const isQ = questionWords.includes(cleanWord);
                    resultHtml += \`<span class="word-chip \${isQ ? 'is-question-word' : ''}" data-word="\${cleanWord}" onmouseenter="handleWordHighlight('\${cleanWord}', true)" onmouseleave="handleWordHighlight('\${cleanWord}', false)" onclick="event.stopPropagation(); speak('\${cleanWord.replace(/'/g, "\\\\'")}')">\${singleWordWithPunc}</span> \`;
                    remainingText = (firstSpaceIndex === -1) ? "" : remainingText.substring(firstSpaceIndex + 1).trim();
                }
            }
            return resultHtml;
        }

        function loadRound() {
            roundSolved = false;
            const s = uiStrings[userLang];
            document.getElementById('next-round-btn').classList.remove('enabled');
            document.getElementById('next-round-btn').innerText = s.next;
            const data = jobData[currentRound];
            document.getElementById('round-title').innerText = \`\${s.round} \${currentRound + 1}/8\`;
            document.getElementById('progress-bar').style.width = \`\${((currentRound + 1)/8)*100}%\`;
            
            document.getElementById('bubble-list').innerHTML = \`
                <div class="bubble bubble-ella-quest drop-zone" id="drop-target">\${s.dropZone}</div>
                <div class="bubble bubble-user-ans">
                    <div class="flex flex-wrap justify-center gap-1">\${renderTappableText(data.ans)}</div>
                    <span class="text-[10px] font-bold text-indigo-400 uppercase mt-3 opacity-80 border-t border-sky-100 pt-2 w-full tracking-wide">
                        \${userLang === 'en' ? data.ansTrans.en : data.ansTrans.ru}
                    </span>
                </div>
            \`;
            currentTarget = document.getElementById('drop-target');
            const floatBox = document.getElementById('floating-box');
            floatBox.innerHTML = ''; animations.forEach(cancelAnimationFrame);
            
            const options = [...data.distractors, {vi: data.q, trans: {en: data.en, ru: data.ru}, isCorrect: true}].sort(() => Math.random() - 0.5);
            options.forEach(opt => {
                const div = document.createElement('div');
                div.className = 'draggable-item';
                div.innerHTML = \`<div class="text-sm font-black text-slate-800 pointer-events-none">\${opt.vi}</div><div class="text-[9px] text-indigo-500 font-bold mt-1 uppercase opacity-70 pointer-events-none">\${userLang === 'en' ? opt.trans.en : opt.trans.ru}</div>\`;
                div.style.left = \`\${10 + Math.random() * 60}%\`; div.style.top = \`\${45 + Math.random() * 35}%\`;
                div.dataset.correct = opt.isCorrect ? "true" : "false";
                div.addEventListener('mousedown', startDrag); div.addEventListener('touchstart', startDrag);
                floatBox.appendChild(div);
                applyChaoticFloat(div);
            });
        }

        function applyChaoticFloat(el) {
            let ax = Math.random() * Math.PI * 2, ay = Math.random() * Math.PI * 2;
            function ani() { if (!isDragging || draggedElement !== el) { el.style.transform = \`translate(\${Math.sin(ax) * 60}px, \${Math.cos(ay) * 40}px)\`; ax += 0.005; ay += 0.005; } animations.push(requestAnimationFrame(ani)); }
            ani();
        }

        function startDrag(e) {
            if (roundSolved) return; e.preventDefault(); isDragging = true; draggedElement = e.currentTarget;
            const cx = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX;
            const cy = e.type === 'mousedown' ? e.clientY : e.touches[0].clientY;
            const r = draggedElement.getBoundingClientRect(); offset = { x: cx - r.left, y: cy - r.top };
            draggedElement.style.transition = 'none'; draggedElement.style.zIndex = "1000";
            document.addEventListener('mousemove', drag); document.addEventListener('touchmove', drag);
            document.addEventListener('mouseup', stopDrag); document.addEventListener('touchend', stopDrag);
        }

        function drag(e) {
            if (!isDragging) return;
            const cx = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX;
            const cy = e.type === 'mousemove' ? e.clientY : e.touches[0].clientY;
            draggedElement.style.left = \`\${cx - offset.x}px\`; draggedElement.style.top = \`\${cy - offset.y}px\`;
            draggedElement.style.transform = \`none\`;
            const d = draggedElement.getBoundingClientRect(), t = currentTarget.getBoundingClientRect();
            currentTarget.classList.toggle('active', !(d.right < t.left || d.left > t.right || d.bottom < t.top || d.top > t.bottom));
        }

        async function stopDrag() {
            if (!isDragging) return; isDragging = false;
            document.removeEventListener('mousemove', drag); document.removeEventListener('touchmove', drag);
            const d = draggedElement.getBoundingClientRect(), t = currentTarget.getBoundingClientRect();
            if (Math.max(0, Math.min(d.right, t.right) - Math.max(d.left, t.left)) * Math.max(0, Math.min(d.bottom, t.bottom) - Math.max(d.top, t.top)) > 20) {
                if (draggedElement.dataset.correct === "true") handleCorrect();
                else { speak(uiStrings[userLang].tryAgain); draggedElement.style.transition = 'all 0.5s'; draggedElement.style.top = '75%'; }
            } else draggedElement.style.transition = 'all 0.3s';
            currentTarget.classList.remove('active');
        }

        async function handleCorrect() {
            roundSolved = true; const data = jobData[currentRound];
            document.getElementById('floating-box').innerHTML = ''; document.getElementById('sfx-correct').play();
            currentTarget.innerHTML = \`<div class="flex items-start gap-4 text-left w-full"><div class="flex-1"><div class="flex flex-wrap gap-1 mb-2">\${renderTappableText(data.q)}</div><span class="translation-text-area text-[10px] font-bold text-indigo-400 uppercase mt-2 border-t border-indigo-100 pt-2 block tracking-wide">\${userLang === 'en' ? data.en : data.ru}</span></div><button onclick="speak('\${data.q.replace(/'/g, "\\\\'")}')" class="mini-speaker"><svg class="w-5 h-5 text-pink-500" fill="currentColor" viewBox="0 0 24 24"><path d="M14,3.23V5.29C16.89,6.15 19,8.83 19,12C19,15.17 16.89,17.85 14,18.71V20.77C18.03,19.86 21,16.28 21,12C21,7.72 18.03,4.14 14,3.23M16.5,12C16.5,10.23 15.5,8.71 14,7.97V16.02C15.5,15.29 16.5,13.77 16.5,12M3,9V15H7L12,20V4L7,9H3Z" /></svg></button></div>\`;
            currentTarget.style = "background: white; border:none; padding: 20px;";
            document.getElementById('next-round-btn').classList.add('enabled');
            confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
            await speak(data.q); await new Promise(r => setTimeout(r, 400)); await speak(data.ans);
        }
    </script>
</body>
</html>
`;

export const GameJobMakeQuestion: React.FC = () => {
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
                    title="Make Question Game - Job"
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

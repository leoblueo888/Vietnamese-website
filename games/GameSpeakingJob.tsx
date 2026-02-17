
import React, { useState, useEffect, useRef } from 'react';
import { Maximize, Minimize } from 'lucide-react';

const gameHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SPEAK VIET - JOB 1 ONLY</title>
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
        }

        .game-card {
            background-image: url('https://lh3.googleusercontent.com/d/1vtop2zzKGIcd5I5raixQKne2GgM0i5eE');
            background-size: cover; 
            background-position: center;
            background-repeat: no-repeat;
            border-radius: 2rem;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.3);
            width: 95vw;
            max-width: 900px;
            height: 90vh;
            max-height: 800px;
            display: flex;
            flex-direction: column;
            position: relative;
            overflow: hidden;
            background-color: white;
            transition: background-image 0.5s ease-in-out, background-position 0.5s ease-in-out;
        }

        .overlay {
            position: absolute;
            inset: 0;
            background: rgba(255, 255, 255, 0.8);
            backdrop-filter: blur(8px);
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
            background: rgba(255, 255, 255, 0.9);
            padding: 24px;
            border-radius: 2rem;
            box-shadow: 0 10px 40px rgba(0,0,0,0.1);
            border: 1px solid white;
            display: flex;
            flex-direction: column;
            align-items: center;
            max-width: 520px;
            width: 100%;
        }

        #game-header {
            flex-shrink: 0;
            background: white;
            border-bottom: 1px solid #e5e7eb;
            padding: 0.75rem 1rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
            z-index: 100;
            position: relative;
            min-height: 60px;
        }

        @media (max-width: 640px) {
            #progress-bar-container { 
                display: none !important; 
            }
            .btn-listen-all, .btn-next-header {
                padding: 6px 12px !important;
                font-size: 0.75rem !important;
                border-radius: 10px !important;
            }
            #center-header-tools { 
                gap: 8px !important; 
            }
            .nav-btn-header {
                width: 28px !important;
                height: 28px !important;
            }
        }

        .scene-container {
            flex: 1;
            overflow: hidden; 
            padding-bottom: 40px;
            display: flex;
            flex-direction: column;
            position: relative;
        }
        
        .bubble-container {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
            max-width: 650px;
            margin: 115px auto 0 auto; 
            width: 100%;
            padding: 0 1.5rem;
            position: relative;
            z-index: 20;
            overflow-y: auto;
            scrollbar-width: none;
        }
        .bubble-container::-webkit-scrollbar { display: none; }

        .bubble-wrapper {
            display: flex;
            align-items: flex-start;
            gap: 12px;
            width: 100%;
            transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
            padding: 10px;
            border-radius: 1.5rem;
        }

        .speaker-group {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 4px;
        }

        .speaker-btn {
            background: #6366f1;
            color: white;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s;
            box-shadow: 0 4px 10px rgba(0,0,0,0.1);
        }
        
        .speaker-btn.user-gender-btn { background: #0369a1; }
        .speaker-btn.ella-voice-btn { background: #be185d; }

        .speed-btn {
            font-size: 0.65rem;
            font-weight: 800;
            color: #6366f1;
            background: white;
            border: 1px solid #e0e7ff;
            padding: 2px 6px;
            border-radius: 6px;
            cursor: pointer;
        }

        .bubble {
            padding: 0.8rem 1.2rem;
            border-radius: 1.2rem;
            max-width: 85%;
            box-shadow: 0 8px 15px rgba(0,0,0,0.05);
            background: rgba(255, 255, 255, 0.95);
            border: 1px solid transparent;
            transition: all 0.3s;
        }

        .bubble-ella-quest { color: #be185d; border-left: 4px solid #be185d; }
        .bubble-user-ans { color: #0369a1; border-right: 4px solid #0369a1; min-width: 250px;}

        .main-text { font-size: 1.15rem; font-weight: 800; margin-bottom: 2px; display: block; }
        .sub-text { font-size: 0.85rem; opacity: 0.7; font-style: italic; color: #4b5563; display: block; }

        .word-hover {
            cursor: pointer;
            border-bottom: 2px dashed #be185d;
            transition: background-color 0.2s;
        }
        .word-hover:hover {
            background-color: #fce7f3;
        }

        /* COMPACT INPUT BOX STYLES */
        .input-area { display: flex; flex-direction: column; gap: 4px; width: 100%; margin-top: 8px; }
        .input-inline-container { 
            display: flex; 
            flex-wrap: wrap; 
            align-items: center; 
            gap: 8px; 
            font-weight: 800; 
            font-size: 1.15rem; 
            color: #0369a1;
        }
        .input-wrapper-relative {
            position: relative;
            flex: 1;
            min-width: 150px;
            display: flex;
            align-items: center;
        }
        .text-input-inline { 
            width: 100%;
            padding: 6px 36px 6px 10px; 
            border-radius: 12px; 
            border: 2px solid #6366f1; 
            outline: none; 
            font-size: 1rem; 
            background: white;
            transition: border-color 0.2s;
        }
        .text-input-inline:focus { border-color: #4f46e5; }
        
        .submit-btn-icon { 
            position: absolute;
            right: 6px;
            background: #6366f1; 
            color: white; 
            width: 26px;
            height: 26px;
            border-radius: 8px; 
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer; 
            border: none;
            transition: transform 0.1s, background 0.2s;
        }
        .submit-btn-icon:hover { background: #4f46e5; }
        .submit-btn-icon:active { transform: scale(0.9); }

        .btn-listen-all {
            background: #f59e0b; color: white; padding: 8px 18px; border-radius: 12px; 
            font-weight: 800; font-size: 0.85rem; cursor: pointer; transition: all 0.2s; 
            box-shadow: 0 4px 6px rgba(245, 158, 11, 0.2); border: none; text-transform: uppercase;
        }

        .btn-next-header {
            background: #10b981; color: white; padding: 8px 18px; border-radius: 12px; 
            font-weight: 800; font-size: 0.85rem; cursor: pointer; transition: all 0.2s; 
            box-shadow: 0 4px 6px rgba(16, 185, 129, 0.2); border: none; text-transform: uppercase;
        }

        #center-header-tools {
            position: absolute; left: 50%; transform: translateX(-50%);
            display: flex; align-items: center; justify-content: center; gap: 10px;
            white-space: nowrap;
        }

        .nav-btn-header {
            background: white; color: #6366f1; width: 32px; height: 32px; border-radius: 50%;
            display: flex; align-items: center; justify-content: center; cursor: pointer; border: 1px solid #e5e5e5;
            transition: all 0.2s;
        }
        .nav-btn-header:hover { background-color: #f3f4f6; }
        .nav-btn-header:disabled { opacity: 0.3; cursor: not-allowed; }

        .instruction-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 1rem; padding: 12px; width: 100%; text-align: left; margin-bottom: 16px; }
        .instruction-item { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; font-size: 0.85rem; color: #475569; font-weight: 600; }

        .toggle-btn { flex: 1; padding: 10px; border-radius: 12px; font-weight: 700; border: 2px solid transparent; background: #f1f5f9; color: #64748b; transition: all 0.2s; }
        .toggle-btn.active { background: #e0e7ff; color: #4f46e5; border-color: #4f46e5; }
        
        .hidden { display: none !important; }

        .review-active-box {
            transform: scale(1.02);
            background: #fdf2f8 !important;
            border: 2px solid #be185d !important;
            box-shadow: 0 10px 25px -5px rgba(190, 24, 93, 0.2) !important;
            z-index: 50;
            border-radius: 1rem;
        }
        .review-active-box-ans {
            transform: scale(1.02);
            background: #f0f9ff !important;
            border: 2px solid #0369a1 !important;
            box-shadow: 0 10px 25px -5px rgba(3, 105, 161, 0.2) !important;
            z-index: 50;
            border-radius: 1rem;
        }

        .static-word-group {
            display: flex;
            flex-direction: column;
            align-items: center;
            min-width: fit-content;
        }
        .micro-trans {
            font-size: 0.65rem;
            color: #94a3b8;
            font-weight: 600;
            text-transform: uppercase;
            margin-top: -2px;
        }

        .input-hint-group {
            display: flex;
            flex-direction: column;
            gap: 2px;
            width: 100%;
        }
        .input-hint-text {
            font-size: 0.7rem;
            color: #6366f1;
            font-weight: 700;
            font-style: italic;
            margin-top: 2px;
            opacity: 0.8;
            padding-left: 4px;
        }
    </style>
</head>
<body>

    <div class="game-card" id="main-card">
        <!-- Start Screen -->
        <div id="start-overlay" class="overlay">
            <div class="start-content-box">
                <h1 id="main-title" class="text-3xl font-black text-indigo-900 mb-1 uppercase tracking-tighter text-center">SPEAK VIET - JOB 1</h1>
                <p class="text-indigo-600 font-bold text-sm mb-4">Giao tiếp nơi công sở 💼</p>
                
                <div class="w-full mb-4">
                    <p class="text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest text-left">SELECT LANGUAGE</p>
                    <div class="flex gap-3">
                        <button id="lang-en" onclick="setUserLanguage('en')" class="toggle-btn active">🇬🇧 English</button>
                        <button id="lang-ru" onclick="setUserLanguage('ru')" class="toggle-btn">🇷🇺 Russian</button>
                    </div>
                </div>

                <div class="w-full mb-6">
                    <p class="text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest text-left">SELECT GENDER</p>
                    <div class="flex gap-3">
                        <button id="gender-male" onclick="setUserGender('male')" class="toggle-btn active">♂️ MALE</button>
                        <button id="gender-female" onclick="setUserGender('female')" class="toggle-btn">♀️ FEMALE</button>
                    </div>
                </div>

                <div class="instruction-card" id="start-instructions"></div>

                <button onclick="startGame()" id="btn-start-game" class="w-full py-4 bg-indigo-600 text-white rounded-full font-bold text-xl shadow-lg hover:bg-indigo-700 active:scale-95 transition-all">LET'S GO!</button>
            </div>
        </div>

        <!-- Header -->
        <div id="game-header">
            <div class="flex items-center gap-2 sm:gap-3">
                <button id="btn-backward" onclick="goBackward()" class="nav-btn-header"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="15 18 9 12 15 6"></polyline></svg></button>
                <div class="flex flex-col">
                    <h1 id="level-label" class="text-[10px] sm:text-xs font-bold text-indigo-500 uppercase">OFFICE LIFE</h1>
                    <h2 id="round-title" class="text-sm sm:text-base font-bold text-gray-800 leading-tight">Round 1/8</h2>
                </div>
                <button id="btn-forward" onclick="goForward()" class="nav-btn-header"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="9 18 15 12 9 6"></polyline></svg></button>
            </div>
            
            <div id="center-header-tools" class="hidden">
                <button id="btn-listen-all" onclick="listenAll()" class="btn-listen-all">LISTEN ALL</button>
                <button id="btn-next-header" onclick="goForward()" class="btn-next-header hidden">NEXT ROUND</button>
            </div>

            <div id="progress-bar-container" class="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div id="progress-bar" class="h-full bg-indigo-500 transition-all duration-700" style="width: 5%"></div>
            </div>
        </div>

        <!-- Game Scene -->
        <div class="scene-container" id="game-scene">
            <div class="bubble-area-wrapper" id="bubble-area-scroll" style="flex: 1; overflow-y: auto; scrollbar-width: none;">
                <div class="bubble-container" id="bubble-area"></div>
            </div>
        </div>

        <!-- Review Overlay -->
        <div id="review-overlay" class="overlay" style="display: none;">
            <div class="bg-white/95 p-6 rounded-3xl shadow-2xl w-full max-w-2xl flex flex-col h-[85%] border-4 border-indigo-100">
                <div class="text-center mb-4">
                    <h2 id="review-title" class="text-2xl font-black text-indigo-600">ROUND REVIEW</h2>
                    <p id="review-subtitle" class="text-sm text-gray-500">Review all conversations</p>
                </div>
                <div id="review-list" class="flex-1 overflow-y-auto pr-2 space-y-6 py-4" style="scrollbar-width: thin;"></div>
                <div class="flex gap-4 mt-6">
                    <button id="btn-start-review-listen" onclick="startReviewListening()" class="flex-1 py-4 bg-amber-500 text-white rounded-full font-bold text-lg shadow-lg hover:bg-amber-600 transition-all">LISTEN ALL</button>
                    <button id="btn-to-finish" onclick="showWin()" class="flex-1 py-4 bg-indigo-600 text-white rounded-full font-bold text-lg shadow-lg hover:bg-indigo-700 transition-all">FINISH GAME</button>
                </div>
            </div>
        </div>

        <!-- Win Screen -->
        <div id="win-overlay" class="overlay" style="display: none;">
            <div class="text-6xl mb-4">🏆</div>
            <h2 id="win-title" class="text-3xl font-black mb-6 text-indigo-600 text-center uppercase">COMPLETED!</h2>
            <button id="btn-play-again" onclick="location.reload()" class="px-10 py-4 bg-indigo-600 text-white rounded-full font-bold">PLAY AGAIN</button>
        </div>
    </div>

    <script>
        const jobQuestions = [
            { 
                qVi: "Bạn làm công việc gì?", rawVi: "Bạn làm công việc gì?", qRu: "Кем ты работаешь?", qEn: "What is your job?", 
                prefix: "Mình là", suffix: "", placeholder: "bác sĩ, kỹ sư...", 
                mappings: [{ vi: "công việc gì", en: "What...job", ru: "Кем...работаешь" }] 
            },
            { 
                qVi: "Bạn làm việc ở đâu?", rawVi: "Bạn làm việc ở đâu?", qRu: "Где ты работаешь?", qEn: "Where do you work?", 
                prefix: "Mình làm việc ở", suffix: "", placeholder: "văn phòng, Hà Nội...", 
                mappings: [{ vi: "ở đâu", en: "Where", ru: "Где" }, { vi: "làm việc", en: "work", ru: "работаешь" }] 
            },
            { 
                qVi: "Bạn làm việc mấy giờ một ngày?", rawVi: "Bạn làm việc mấy giờ một ngày?", qRu: "Сколько часов в день ты работаешь?", qEn: "How many hours a day do you work?", 
                prefix: "Mình làm", suffix: "tiếng 1 ngày", placeholder: "8, 10...", 
                mappings: [{ vi: "mấy giờ", en: "How many hours", ru: "Сколько часов" }, { vi: "một ngày", en: "a day", ru: "в ngày" }] 
            },
            { 
                qVi: "Bạn thích điều gì nhất về công việc của mình?", rawVi: "Bạn thích điều gì nhất về công việc của mình?", qRu: "Что тебе больше всего нравится в твоей работе?", qEn: "What do you like most about your job?", 
                prefix: "Mình thích nhất là", suffix: "", placeholder: "đồng nghiệp, lương cao...", 
                mappings: [{ vi: "thích", en: "like", ru: "нравится" }, { vi: "điều gì nhất", en: "most", ru: "больше всего" }] 
            },
            { 
                qVi: "Quản lý của bạn có tốt không?", rawVi: "Quản lý của bạn có tốt không?", qRu: "Твой руководитель хороший?", qEn: "Is your manager good?", 
                prefix: "Quản lý của mình", suffix: "", placeholder: "rất tốt, nghiêm khắc...", 
                mappings: [{ vi: "Quản lý", en: "manager", ru: "руководитель" }, { vi: "tốt không", en: "good", ru: "хороший" }] 
            },
            { 
                qVi: "Đồng nghiệp của bạn thế nào?", rawVi: "Đồng nghiệp của bạn thế nào?", qRu: "Какие у тебя коллеги?", qEn: "What are your colleagues like?", 
                prefix: "Đồng nghiệp của mình", suffix: "", placeholder: "vui tính, thân thiện...", 
                mappings: [{ vi: "Đồng nghiệp", en: "colleagues", ru: "коллеги" }, { vi: "thế nào", en: "What...like", ru: "Какие" }] 
            },
            { 
                qVi: "Sau giờ làm, bạn thường làm gì?", rawVi: "Sau giờ làm, bạn thường làm gì?", qRu: "Что ты обычно делаешь sau работы?", qEn: "What do you usually do after work?", 
                prefix: "Mình thường", suffix: "", placeholder: "đi tập gym, nấu ăn...", 
                mappings: [{ vi: "Sau giờ làm", en: "after work", ru: "sau работы" }, { vi: "thường làm gì", en: "usually do", ru: "обычно делаешь" }] 
            },
            { 
                qVi: "Bạn được nghỉ mấy ngày một tuần?", rawVi: "Bạn được nghỉ mấy ngày một tuần?", qRu: "Сколько дней в неделю ты отдыхаешь?", qEn: "How many days off do you have per week?", 
                prefix: "Mình được nghỉ", suffix: "ngày 1 tuần", placeholder: "2, 3...", 
                mappings: [{ vi: "nghỉ mấy ngày", en: "days off", ru: "отдыhaешь" }, { vi: "một tuần", en: "per week", ru: "в неделю" }] 
            }
        ];

        let userLang = 'en';
        let userGender = 'male'; 
        let currentRound = 0;
        let history = [];
        let playbackSpeedQ = 1.0;
        let playbackSpeedA = 0.7;
        const ttsAudio = new Audio();
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

        const translations = {
            en: {
                howToTitle: "How to Play",
                step1: "Listen to the speaker. Click underlined words to hear pronunciation and see meaning.",
                step2: "Type in the blanks to answer in any language (EN/RU/VI).",
                step3: "Send to see translations and hear your full sentence.",
                letsgobtn: "LET'S GO!", listenall: "LISTEN ALL", continue: "CONTINUE",
                reviewTitle: "ROUND REVIEW", reviewSub: "Review all conversations",
                winTitle: "SPEAK VIET COMPLETED!", playAgain: "PLAY AGAIN",
                processing: "Processing...",
                suggestLabel: "Suggest: "
            },
            ru: {
                howToTitle: "Как играть",
                step1: "Слушайте диктора. Нажмите trên подчеркнутые слова чтобы nghe.",
                step2: "Заполните пропуски, чтобы ответить на любом языке (EN/RU/VI).",
                step3: "Отправьте, чтобы nghe toàn bộ câu trả lộ.",
                letsgobtn: "ПОЕХАЛИ!", listenall: "СLУШАТЬ ВСЕ", continue: "ПРОДОЛЖИТЬ",
                reviewTitle: "ОBЗОР РАУNDA", reviewSub: "Просмотрите все диалоги",
                winTitle: "SPEAK VIET ЗАВЕРШЕН!", playAgain: "ИГРАТЬ СНОВА",
                processing: "Обработка...",
                suggestLabel: "Подсказка: "
            }
        };

        async function getGoogleTranslation(text, target) {
            if (!text || text.trim() === "") return "";
            try {
                const url = \`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=\${target}&dt=t&q=\${encodeURIComponent(text)}\`;
                const response = await fetch(url);
                const data = await response.json();
                return data[0].map(item => item[0]).join('');
            } catch (error) {
                console.error("Translation Error:", error);
                return text; 
            }
        }

        function setUserLanguage(lang) {
            userLang = lang;
            document.getElementById('lang-en').classList.toggle('active', lang === 'en');
            document.getElementById('lang-ru').classList.toggle('active', lang === 'ru');
            updateStartUI();
        }

        function setUserGender(gender) {
            userGender = gender;
            document.getElementById('gender-male').classList.toggle('active', gender === 'male');
            document.getElementById('gender-female').classList.toggle('active', gender === 'female');
            updateBackground();
        }

        function updateBackground() {
            const card = document.getElementById('main-card');
            if (userGender === 'female') {
                card.style.backgroundImage = "url('https://lh3.googleusercontent.com/d/13u3OXIBAHJ7R9tA8uLE4KI7llhDUCQgO')";
                card.style.backgroundPosition = "center 40px"; 
            } else {
                card.style.backgroundImage = "url('https://lh3.googleusercontent.com/d/1vtop2zzKGIcd5I5raixQKne2GgM0i5eE')";
                card.style.backgroundPosition = "center center";
            }
        }

        function updateStartUI() {
            const t = translations[userLang];
            document.getElementById('start-instructions').innerHTML = \`
                <p class="text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest">\${t.howToTitle}</p>
                <div class="instruction-item"><span class="w-6 h-6 flex items-center justify-center bg-indigo-100 text-indigo-600 rounded-full text-xs">1</span><span>\${t.step1}</span></div>
                <div class="instruction-item"><span class="w-6 h-6 flex items-center justify-center bg-indigo-100 text-indigo-600 rounded-full text-xs">2</span><span>\${t.step2}</span></div>
                <div class="instruction-item"><span class="w-6 h-6 flex items-center justify-center bg-indigo-100 text-indigo-600 rounded-full text-xs">3</span><span>\${t.step3}</span></div>
            \`;
            document.getElementById('btn-start-game').innerText = t.letsgobtn;
        }

        function startGame() {
            document.getElementById('start-overlay').style.display = 'none';
            if (audioCtx.state === 'suspended') audioCtx.resume();
            loadRound();
        }

        function speak(text, type = 'ella', speed = 1.0) {
            return new Promise((resolve) => {
                let useGoogleTTS = false;
                let finalSpeed = speed;
                let finalPitch = 1.0;

                if (type === 'ella') {
                    if (userGender === 'female') {
                        useGoogleTTS = false;
                        finalSpeed = 0.6; 
                        finalPitch = 0.7; 
                    } else {
                        useGoogleTTS = true;
                        finalSpeed = 1.0; 
                    }
                } else {
                    if (userGender === 'female') {
                        useGoogleTTS = true;
                        finalSpeed = 1.0;
                    } else {
                        useGoogleTTS = false;
                        finalSpeed = 0.7; 
                        finalPitch = 0.8;
                    }
                }

                if (useGoogleTTS) {
                    const url = \`https://translate.google.com/translate_tts?ie=UTF-8&q=\${encodeURIComponent(text)}&tl=vi&client=tw-ob\`;
                    ttsAudio.src = url;
                    ttsAudio.playbackRate = finalSpeed;
                    ttsAudio.onended = resolve;
                    ttsAudio.onerror = resolve;
                    ttsAudio.play().catch(() => resolve());
                } else {
                    window.speechSynthesis.cancel();
                    const utter = new SpeechSynthesisUtterance(text);
                    utter.lang = 'vi-VN';
                    utter.rate = finalSpeed;
                    utter.pitch = finalPitch;
                    utter.onend = resolve;
                    utter.onerror = resolve;
                    window.speechSynthesis.speak(utter);
                }
            });
        }

        function cycleSpeed(type, btn) {
            if (type === 'Q') {
                playbackSpeedQ = playbackSpeedQ === 1.0 ? 0.7 : (playbackSpeedQ === 0.7 ? 0.5 : 1.0);
                btn.innerText = \`\${Math.round(playbackSpeedQ*100)}%\`;
            } else {
                playbackSpeedA = playbackSpeedA === 0.7 ? 0.5 : (playbackSpeedA === 0.5 ? 1.0 : 0.7);
                btn.innerText = \`\${Math.round(playbackSpeedA*100)}%\`;
            }
        }

        function formatInteractiveText(text, mappings, roundIdx) {
            let formatted = text;
            if (!mappings) return text;
            mappings.forEach((m, idx) => {
                const regex = new RegExp(\`(\${m.vi})\`, 'gi');
                formatted = formatted.replace(regex, \`<span class="word-hover" onclick="speak('$1', 'ella', 0.8)">$1</span>\`);
            });
            return formatted;
        }

        async function loadRound() {
            const area = document.getElementById('bubble-area');
            area.innerHTML = '';
            
            const data = jobQuestions[currentRound];
            
            document.getElementById('round-title').innerText = \`Round \${currentRound + 1}/8\`;
            document.getElementById('progress-bar').style.width = \`\${((currentRound + 1) / 8) * 100}%\`;
            
            document.getElementById('btn-backward').disabled = currentRound === 0;
            document.getElementById('center-header-tools').classList.remove('hidden');
            document.getElementById('btn-next-header').classList.add('hidden');

            const subLabel = userLang === 'ru' ? 'RU' : 'EN';
            const subContent = userLang === 'ru' ? data.qRu : data.qEn;

            const prefixTrans = data.prefix ? await getGoogleTranslation(data.prefix, userLang) : "";
            const suffixTrans = data.suffix ? await getGoogleTranslation(data.suffix, userLang) : "";
            const placeholderTrans = await getGoogleTranslation(data.placeholder, userLang);

            area.innerHTML += \`
                <div class="bubble-wrapper">
                    <div class="speaker-group">
                        <div class="speaker-btn ella-voice-btn" onclick="speak('\${data.rawVi}', 'ella', playbackSpeedQ)">🔊</div>
                        <button class="speed-btn" onclick="cycleSpeed('Q', this)">\${Math.round(playbackSpeedQ*100)}%</button>
                    </div>
                    <div class="bubble bubble-ella-quest">
                        <span class="main-text">\${formatInteractiveText(data.qVi, data.mappings, currentRound)}</span>
                        <span class="sub-text">\${subLabel}: \${subContent}</span>
                    </div>
                </div>
                <div class="bubble-wrapper flex-row-reverse" id="ans-zone">
                    <div class="speaker-group">
                        <div class="speaker-btn user-gender-btn hidden" id="btn-speak-ans">🔊</div>
                        <button class="speed-btn hidden" id="btn-speed-ans" onclick="cycleSpeed('A', this)">\${Math.round(playbackSpeedA*100)}%</button>
                    </div>
                    <div class="bubble bubble-user-ans">
                        <div id="input-ui">
                            <div class="input-area">
                                <div class="input-inline-container">
                                    <div class="static-word-group">
                                        <span>\${data.prefix}</span>
                                        <span class="micro-trans">\${prefixTrans}</span>
                                    </div>
                                    <div class="input-hint-group">
                                        <div class="input-wrapper-relative">
                                            <input type="text" id="user-input-part" class="text-input-inline" placeholder="..." onkeydown="if(event.key==='Enter') submitAns()">
                                            <button onclick="submitAns()" id="btn-send-icon" class="submit-btn-icon">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                                            </button>
                                        </div>
                                        <span class="input-hint-text">\${translations[userLang].suggestLabel}\${placeholderTrans}</span>
                                    </div>
                                    \${data.suffix ? \`
                                    <div class="static-word-group">
                                        <span>\${data.suffix}</span>
                                        <span class="micro-trans">\${suffixTrans}</span>
                                    </div>\` : ""}
                                </div>
                            </div>
                        </div>
                        <div id="result-ui" class="hidden"></div>
                    </div>
                </div>
            \`;
            await speak(data.rawVi, 'ella', playbackSpeedQ);
        }

        async function submitAns() {
            const partValue = document.getElementById('user-input-part').value.trim();
            if (!partValue) return;

            const data = jobQuestions[currentRound];
            document.getElementById('input-ui').classList.add('hidden');
            const resUi = document.getElementById('result-ui');
            resUi.classList.remove('hidden');
            resUi.innerHTML = \`<p class="font-bold text-lg italic opacity-50">\${translations[userLang].processing}</p>\`;

            const translatedPartVi = await getGoogleTranslation(partValue, 'vi');
            const fullSentenceVi = \`\${data.prefix} \${translatedPartVi} \${data.suffix}\`.replace(/\\s+/g, ' ').trim();
            const transToTarget = await getGoogleTranslation(fullSentenceVi, userLang);
            
            resUi.innerHTML = \`
                <div class="flex flex-col gap-1">
                    <span class="main-text text-[#0369a1]">\${fullSentenceVi}</span>
                    <span class="sub-text text-gray-500 font-bold opacity-80">\${userLang.toUpperCase()}: \${transToTarget}</span>
                </div>
            \`;
            
            history[currentRound] = { vi: fullSentenceVi, other: transToTarget };
            
            const btnSpeak = document.getElementById('btn-speak-ans');
            const btnSpeed = document.getElementById('btn-speed-ans');
            btnSpeak.classList.remove('hidden');
            btnSpeed.classList.remove('hidden');
            
            btnSpeak.onclick = () => speak(fullSentenceVi, 'user', playbackSpeedA);
            
            await speak(fullSentenceVi, 'user', playbackSpeedA);
            document.getElementById('btn-next-header').classList.remove('hidden');
        }

        function goForward() {
            if (currentRound === 7) {
                showReview();
            } else {
                currentRound++;
                loadRound();
            }
        }

        function goBackward() {
            if (currentRound > 0) {
                currentRound--;
                loadRound();
            }
        }

        function showReview() {
            document.getElementById('review-overlay').style.display = 'flex';
            const list = document.getElementById('review-list');
            list.innerHTML = '';
            
            jobQuestions.forEach((q, i) => {
                const ans = history[i] || { vi: "...", other: "..." };
                list.innerHTML += \`
                    <div class="space-y-2 p-4 border-b border-gray-100 transition-all duration-300" id="review-item-\${i}">
                        <div class="flex items-start gap-3">
                            <button class="speaker-btn ella-voice-btn scale-75 flex-shrink-0" onclick="playReviewAudio(\${i}, 'Q')">🔊</button>
                            <div class="bubble bubble-ella-quest text-sm py-2">
                                <span class="font-bold block">\${q.qVi}</span>
                            </div>
                        </div>
                        <div class="flex flex-row-reverse items-start gap-3">
                            <button class="speaker-btn user-gender-btn scale-75 flex-shrink-0" onclick="playReviewAudio(\${i}, 'A')">🔊</button>
                            <div class="bubble bubble-user-ans text-sm py-2">
                                <span class="font-bold block">\${ans.vi}</span>
                                <span class="text-[10px] opacity-60 italic block mt-1">\${ans.other}</span>
                            </div>
                        </div>
                    </div>
                \`;
            });
        }

        async function playReviewAudio(idx, type) {
            const item = document.getElementById(\`review-item-\${idx}\`);
            const q = jobQuestions[idx];
            const ans = history[idx];
            
            item.scrollIntoView({ behavior: 'smooth', block: 'center' });

            if (type === 'Q') {
                item.classList.add('review-active-box');
                await speak(q.rawVi, 'ella', 0.8);
                item.classList.remove('review-active-box');
            } else {
                item.classList.add('review-active-box-ans');
                await speak(ans.vi, 'user', 0.7);
                item.classList.remove('review-active-box-ans');
            }
        }

        async function startReviewListening() {
            const btn = document.getElementById('btn-start-review-listen');
            btn.disabled = true;
            btn.style.opacity = '0.5';
            for(let i=0; i<8; i++) {
                if (history[i]) {
                    await playReviewAudio(i, 'Q');
                    await playReviewAudio(i, 'A');
                }
            }
            btn.disabled = false;
            btn.style.opacity = '1';
        }

        async function listenAll() {
            const data = jobQuestions[currentRound];
            const ans = history[currentRound];
            await speak(data.rawVi, 'ella', playbackSpeedQ);
            if (ans) await speak(ans.vi, 'user', playbackSpeedA);
        }

        function showWin() {
            document.getElementById('review-overlay').style.display = 'none';
            document.getElementById('win-overlay').style.display = 'flex';
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
        }

        window.onload = function() {
            updateStartUI();
            updateBackground(); 
        };
    </script>
</body>
</html>
`;

export const GameSpeakingJob: React.FC = () => {
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
                    title="Speaking Challenge - Talking About Your Job"
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

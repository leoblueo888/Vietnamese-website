
import React, { useState, useEffect, useRef } from 'react';
import { Maximize, Minimize } from 'lucide-react';

const gameHTML = `
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SPEAK VIET : Meet New Friends</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@400;600;700&display=swap');

        body {
            font-family: 'Quicksand', sans-serif;
            background: #fdf2f8;
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            margin: 0;
            overflow: hidden;
        }

        .game-card {
            background-size: cover; 
            background-position: center;
            background-repeat: no-repeat;
            border-radius: 2rem;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.2);
            width: 95vw;
            max-width: 900px;
            height: 90vh;
            max-height: 800px;
            display: flex;
            flex-direction: column;
            position: relative;
            overflow: hidden;
            background-color: #ffffff;
            transition: background-image 0.8s ease-in-out;
        }

        .overlay {
            position: absolute;
            inset: 0;
            background: rgba(255, 255, 255, 0.85);
            backdrop-filter: blur(12px);
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
            background: white;
            padding: 2rem;
            border-radius: 2.5rem;
            box-shadow: 0 20px 60px rgba(0,0,0,0.1);
            border: 2px solid #fce7f3;
            max-width: 480px; 
            width: 100%;
        }

        #game-header {
            flex-shrink: 0;
            background: rgba(255, 255, 255, 0.9);
            backdrop-filter: blur(10px);
            border-bottom: 1px solid #fce7f3;
            padding: 0.8rem 1.5rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            z-index: 100;
        }

        .nav-round-btn {
            background: #f1f5f9;
            color: #64748b;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s;
        }
        .nav-round-btn:hover:not(:disabled) { background: #ec4899; color: white; }
        .nav-round-btn:disabled { opacity: 0.3; cursor: not-allowed; }

        .scene-container {
            flex: 1;
            overflow-y: auto; 
            display: flex;
            flex-direction: column;
            position: relative;
            padding-bottom: 120px;
            scroll-behavior: smooth;
        }
        
        .bubble-container {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
            max-width: 700px;
            margin: 125px auto 30px auto; 
            width: 100%;
            padding: 0 1.5rem;
        }

        .bubble-wrapper {
            display: flex;
            align-items: flex-start;
            gap: 12px;
            width: 100%;
            animation: fadeIn 0.5s ease-out;
            transition: all 0.3s ease;
        }

        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        .speaker-btn {
            width: 44px;
            height: 44px;
            border-radius: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: 0.2s;
            flex-shrink: 0;
            color: white;
        }
        .ella-voice-btn { background: #db2777; box-shadow: 0 4px 12px rgba(219, 39, 119, 0.3); }
        .user-voice-btn { background: #2563eb; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3); }

        .bubble {
            padding: 1.2rem 1.5rem;
            border-radius: 1.5rem;
            max-width: 85%;
            box-shadow: 0 8px 20px rgba(0,0,0,0.05);
            background: white;
            border: 1px solid #f1f5f9;
            transition: all 0.3s ease;
        }

        .bubble-ella-quest { border-left: 6px solid #db2777; }
        .bubble-user-ans { border-right: 6px solid #2563eb; }

        .main-text { font-size: 1.25rem; font-weight: 700; color: #1e293b; margin-bottom: 4px; display: block; }
        .sub-text { font-size: 0.9rem; font-weight: 500; color: #64748b; border-top: 1px solid #f1f5f9; padding-top: 4px; font-style: italic; display: block; }
        .hint-text { font-size: 0.75rem; font-weight: 700; color: #94a3b8; margin-top: 8px; text-transform: uppercase; display: block; }

        .inline-input {
            border: none;
            border-bottom: 3px solid #2563eb;
            background: transparent;
            outline: none;
            font-weight: 800;
            color: #2563eb;
            padding: 0 8px;
            width: 160px;
            text-align: center;
        }

        .send-btn {
            background: #2563eb;
            color: white;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            border: none;
        }

        .processing-blink {
            animation: blink 0.8s infinite alternate;
        }

        @keyframes blink {
            from { opacity: 1; transform: scale(1); }
            to { opacity: 0.4; transform: scale(0.8); }
        }

        .toggle-btn { flex: 1; padding: 10px; border-radius: 12px; font-weight: 700; background: #f1f5f9; color: #64748b; }
        .toggle-btn.active { background: #db2777; color: white; }

        /* Highlight classes */
        .highlight-ella .bubble-ella-quest { background: #fdf2f8 !important; transform: scale(1.02); box-shadow: 0 0 20px rgba(219, 39, 119, 0.2); border-color: #db2777; }
        .highlight-user .bubble-user-ans { background: #eff6ff !important; transform: scale(1.02); box-shadow: 0 0 20px rgba(37, 99, 235, 0.2); border-color: #2563eb; }
        
        .hidden { display: none !important; }
    </style>
</head>
<body onload="initGame()">

    <div class="game-card" id="main-card">
        <!-- Start Screen -->
        <div id="start-overlay" class="overlay">
            <div class="start-content-box">
                <div class="mb-4 bg-pink-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#db2777" stroke-width="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                </div>
                <h1 class="text-2xl font-black text-pink-600 mb-1">SPEAK VIET</h1>
                <h2 id="ui-start-subtitle" class="text-xl font-bold text-gray-800 mb-4 uppercase tracking-tight">Meet New Friends</h2>
                
                <div class="bg-slate-50 rounded-2xl p-4 mb-6 text-left border border-slate-100">
                    <h3 id="ui-howtoplay-title" class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                        HOW TO PLAY
                    </h3>
                    <ul id="ui-howtoplay-list" class="text-xs text-slate-600 space-y-2 font-medium">
                    </ul>
                </div>

                <div class="w-full mb-6 text-center">
                    <p id="ui-lang-label" class="text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">SELECT SUPPORT LANGUAGE</p>
                    <div class="flex gap-2">
                        <button id="lang-en" onclick="setUserLanguage('en')" class="toggle-btn active">ENGLISH</button>
                        <button id="lang-ru" onclick="setUserLanguage('ru')" class="toggle-btn">RUSSIAN</button>
                    </div>
                </div>

                <button id="btn-start" onclick="startGame()" class="w-full py-4 bg-pink-600 text-white rounded-full font-black text-lg shadow-lg hover:bg-pink-700 active:scale-95 transition-all uppercase">START NOW</button>
            </div>
        </div>

        <!-- Header -->
        <div id="game-header">
            <div class="flex flex-col">
                <span id="ui-header-title" class="text-[10px] font-black text-pink-500 uppercase tracking-widest">MEET NEW FRIENDS</span>
                <div class="flex items-center gap-2 mt-1">
                    <button id="btn-prev-round" onclick="prevRound()" class="nav-round-btn"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="15 18 9 12 15 6"></polyline></svg></button>
                    <span id="round-info" class="text-sm font-black text-gray-800 w-24 text-center">Round 1/9</span>
                    <button id="btn-next-round" onclick="nextRound()" class="nav-round-btn"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="9 18 15 12 9 6"></polyline></svg></button>
                </div>
            </div>
            
            <div id="center-header-tools" class="hidden flex items-center gap-2">
                <!-- Sửa đổi nút Listen All thành Listen Again và gọi hàm mới -->
                <button id="listen-all-btn" onclick="listenCurrentRound()" class="bg-amber-500 text-white px-5 py-2 rounded-full text-[10px] font-black shadow hover:bg-amber-600 transition-all flex items-center gap-2 uppercase">
                    <span id="listen-text">LISTEN AGAIN</span>
                </button>
                <button id="btn-forward" onclick="goForward()" class="bg-emerald-500 text-white px-6 py-2 rounded-full text-xs font-black shadow hover:bg-emerald-600 transition-all uppercase">CONTINUE</button>
            </div>

            <div class="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div id="progress-bar" class="h-full bg-pink-500 transition-all duration-500" style="width: 10%"></div>
            </div>
        </div>

        <div class="scene-container" id="game-scene">
            <div id="bubble-area" class="bubble-container"></div>
            <div id="drag-container" class="mt-auto p-6 bg-white/90 backdrop-blur border-t flex flex-wrap justify-center gap-4 hidden"></div>
        </div>

        <!-- Win Overlay -->
        <div id="win-overlay" class="overlay hidden">
            <div class="bg-white p-10 rounded-[3rem] shadow-2xl text-center border-4 border-pink-100">
                <div class="text-7xl mb-6">🤝</div>
                <h2 id="ui-win-title" class="text-3xl font-black mb-4 text-pink-600 uppercase">SUCCESS!</h2>
                <p id="ui-win-desc" class="text-gray-500 mb-8 font-bold text-lg">You have completed the introduction conversation.</p>
                <button id="btn-replay" onclick="location.reload()" class="px-12 py-4 bg-pink-600 text-white rounded-full font-black text-xl shadow-xl hover:bg-pink-700 uppercase">PLAY AGAIN</button>
            </div>
        </div>
    </div>

    <script>
        const apiKey = "";
        let userLang = 'en';
        let currentRound = 0;
        let history = [];
        let isReviewing = false;
        let stopReview = false;
        let isListeningCurrent = false; // Flag mới cho listenCurrentRound
        let currentAudio = null;

        const NEW_BACKGROUND_IMAGE = "https://lh3.googleusercontent.com/d/1_iDcgvwW3S-_uBBqqDUopVvlvTwlGvQe";

        const uiTranslations = {
            en: {
                startSubtitle: "Meet New Friends",
                howToTitle: "HOW TO PLAY",
                howToSteps: [
                    "💬 Listen to Lan's questions in Vietnamese.",
                    "✍️ Type your answer in English.",
                    "🪄 AI will translate it into natural Vietnamese!",
                    "🎉 Complete the chat to make a new friend."
                ],
                langLabel: "SELECT SUPPORT LANGUAGE",
                startBtn: "START NOW",
                headerTitle: "MEET NEW FRIENDS",
                round: "Round",
                listenAll: "LISTEN AGAIN",
                stopListen: "STOP",
                continue: "CONTINUE",
                success: "SUCCESS!",
                winDesc: "You have completed the introduction conversation.",
                playAgain: "PLAY AGAIN",
                review: "REVIEW",
                hint: "Hint"
            },
            ru: {
                startSubtitle: "Встреча с новыми друзьями",
                howToTitle: "КАК ИГРАТЬ",
                howToSteps: [
                    "💬 Слушайте вопросы Лан на вьетнамском.",
                    "✍️ Введите свой ответ на русском языке.",
                    "🪄 ИИ переведет его на живой вьетнамский!",
                    "🎉 Завершите чат, чтобы завести друга."
                ],
                langLabel: "ВЫБЕРИТЕ ЯЗЫК ПОДДЕРЖКИ",
                startBtn: "НАЧАТЬ СЕЙЧАС",
                headerTitle: "ВСТРЕЧА С ДРУЗЬЯМИ",
                round: "Раунд",
                listenAll: "СЛУШАТЬ СНОВА",
                stopListen: "СТОП",
                continue: "ПРОДОЛЖИТЬ",
                success: "УСПЕХ!",
                winDesc: "Вы завершили разговор-знакомство.",
                playAgain: "ИГРАТЬ СНОВА",
                review: "ОБЗОР",
                hint: "Подсказка"
            }
        };

        const roundConfig = [
            { q: "Xin chào! Mình là Lan! Tên bạn là gì?", qSub: { en: "Hello! I'm Lan! What is your name?", ru: "Привет! Я Лан! Как тебя зовут?" }, prefix: "Chào bạn! Mình tên là", prefixSub: { en: "Hi! My name is", ru: "Привет! Меня зовут" }, suffix: "", hint: { en: "Your name", ru: "Твое имя" } },
            { q: "Bạn đến từ đâu?", qSub: { en: "Where are you from?", ru: "Откуда ты?" }, prefix: "Mình đến từ", prefixSub: { en: "I'm from", ru: "Я из" }, suffix: "", hint: { en: "Country/City", ru: "Страна/Город" } },
            { q: "Bạn thích ăn món gì?", qSub: { en: "What food do you like to eat?", ru: "Какую еду ты любишь есть?" }, prefix: "Mình thích ăn", prefixSub: { en: "I like to eat", ru: "Я люблю есть" }, suffix: "", hint: { en: "Food name", ru: "Название блюда" } },
            { q: "Bạn sống ở Nha Trang à?", qSub: { en: "Do you live in Nha Trang?", ru: "Ты живешь в Нячанге?" }, prefix: "", prefixSub: { en: "Yes, I live in... / No, I live in...", ru: "Да, я живу в... / Нет, я живу в..." }, suffix: "", hint: { en: "Yes or No", ru: "Да hoặc Không" } },
            { q: "Sở thích của bạn là gì?", qSub: { en: "What are your hobbies?", ru: "Каковы твои хобби?" }, prefix: "Mình thích", prefixSub: { en: "I like", ru: "Мне нравится" }, suffix: "", hint: { en: "Reading, music...", ru: "Чтение, музыка..." } },
            { q: "Bạn làm nghề gì?", qSub: { en: "What is your job?", ru: "Кем ты работаешь?" }, prefix: "Mình là", prefixSub: { en: "I am a/an", ru: "Я ..." }, suffix: "", hint: { en: "Teacher, doctor...", ru: "Учитель, врач..." } },
            { q: "Chúng ta kết bạn qua zalo nha?", qSub: { en: "Can we be friends on Zalo?", ru: "Давай дружить trong Zalo?" }, prefix: "Ok! Số zalo của mình là", prefixSub: { en: "Ok! My Zalo number is", ru: "Ок! Мой номер Zalo" }, suffix: "", hint: { en: "Your number", ru: "Твой номер" } },
            { q: "Rất vui được gặp bạn! Hẹn gặp lại!", qSub: { en: "Nice to meet you! See you again!", ru: "Рад знакомству! До встречи!" }, prefix: "Tạm biệt! Hẹn gặp lại nha!", prefixSub: { en: "Goodbye! See you later!", ru: "Пока! Увидимся!" }, suffix: "", hint: { en: "Just click send", ru: "Просто нажmi gửi" } },
            { type: "review" }
        ];

        function initGame() {
            updateUIStrings();
            updateBackground();
        }

        function setUserLanguage(l) {
            userLang = l;
            document.querySelectorAll('#lang-en, #lang-ru').forEach(b => b.classList.toggle('active', b.id === \`lang-\${l}\`));
            updateUIStrings();
        }

        function updateUIStrings() {
            const t = uiTranslations[userLang];
            document.getElementById('ui-start-subtitle').innerText = t.startSubtitle;
            document.getElementById('ui-lang-label').innerText = t.langLabel;
            document.getElementById('btn-start').innerText = t.startBtn;
            document.getElementById('ui-header-title').innerText = t.headerTitle;
            document.getElementById('listen-text').innerText = (isReviewing || isListeningCurrent) ? t.stopListen : t.listenAll;
            document.getElementById('btn-forward').innerText = t.continue;
            document.getElementById('ui-win-title').innerText = t.success;
            document.getElementById('ui-win-desc').innerText = t.winDesc;
            document.getElementById('btn-replay').innerText = t.playAgain;
            
            document.getElementById('ui-howtoplay-title').innerHTML = \`
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                \${t.howToTitle}
            \`;
            const list = document.getElementById('ui-howtoplay-list');
            list.innerHTML = '';
            t.howToSteps.forEach(step => {
                const li = document.createElement('li');
                li.innerText = step;
                list.appendChild(li);
            });

            updateRoundInfo();
        }

        function updateRoundInfo() {
            const t = uiTranslations[userLang];
            if (roundConfig[currentRound]?.type === "review") {
                document.getElementById('round-info').innerText = t.review;
                // Nếu ở màn Review, nút trở lại chức năng Listen All ban đầu
                document.getElementById('listen-all-btn').onclick = toggleReviewMode;
            } else {
                document.getElementById('round-info').innerText = \`\${t.round} \${currentRound + 1}/9\`;
                // Nếu đang chơi, nút gọi hàm nghe vòng hiện tại
                document.getElementById('listen-all-btn').onclick = listenCurrentRound;
            }
        }

        function startGame() {
            document.getElementById('start-overlay').classList.add('hidden');
            loadRound();
        }

        function updateBackground() {
            document.getElementById('main-card').style.backgroundImage = \`url('\${NEW_BACKGROUND_IMAGE}')\`;
        }

        async function speak(text) {
            if (currentAudio) {
                currentAudio.pause();
                currentAudio = null;
            }
            return new Promise(resolve => {
                const audio = new Audio(\`https://translate.google.com/translate_tts?ie=UTF-8&q=\${encodeURIComponent(text)}&tl=vi&client=tw-ob\`);
                currentAudio = audio;
                
                audio.onended = () => {
                    currentAudio = null;
                    resolve();
                };
                
                audio.onerror = () => {
                    currentAudio = null;
                    resolve();
                };

                try {
                    audio.play().catch(e => {
                        console.warn("Audio play blocked", e);
                        resolve();
                    });
                } catch (err) {
                    console.error("Audio error", err);
                    resolve();
                }
            });
        }

        /**
         * 1. Tạo hàm mới listenCurrentRound():
         * Chỉ phát âm thanh 2 câu thoại của vòng hiện tại.
         */
        async function listenCurrentRound() {
            if (isListeningCurrent) {
                isListeningCurrent = false;
                if (currentAudio) currentAudio.pause();
                updateUIStrings();
                return;
            }

            const config = roundConfig[currentRound];
            const historyItem = history[currentRound];
            if (!historyItem) return;

            isListeningCurrent = true;
            updateUIStrings();

            const area = document.getElementById('bubble-area');
            const bubbles = area.querySelectorAll('.bubble-wrapper');
            const ellaWrap = bubbles[0];
            const userWrap = bubbles[1];

            try {
                // Bước 1: Ella nói
                if (ellaWrap) {
                    ellaWrap.classList.add('highlight-ella');
                    await speak(config.q);
                    ellaWrap.classList.remove('highlight-ella');
                }

                if (!isListeningCurrent) return;

                // Bước 2: Nghỉ 600ms
                await new Promise(r => setTimeout(r, 600));

                if (!isListeningCurrent) return;

                // Bước 3: User nói
                if (userWrap) {
                    userWrap.classList.add('highlight-user');
                    await speak(historyItem.a);
                    userWrap.classList.remove('highlight-user');
                }
            } catch (err) {
                console.error(err);
            } finally {
                isListeningCurrent = false;
                updateUIStrings();
            }
        }

        async function getVietnameseResponse(text) {
            try {
                const prompt = \`Translate this phrase to natural Vietnamese for a casual conversation: "\${text}". Give ONLY the translation. No quotes, no periods at the end if the input doesn't have them.\`;
                const res = await fetch(\`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=\${apiKey}\`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
                });
                const data = await res.json();
                return data.candidates[0].content.parts[0].text.trim();
            } catch { return text; }
        }

        async function getTranslateToUser(text) {
            try {
                const target = userLang === 'ru' ? 'Russian' : 'English';
                const prompt = \`Translate this Vietnamese sentence to \${target}: "\${text}". ONLY return the translation.\`;
                const res = await fetch(\`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=\${apiKey}\`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
                });
                const data = await res.json();
                return data.candidates[0].content.parts[0].text.trim();
            } catch { return ""; }
        }

        function loadRound() {
            stopReview = true;
            isReviewing = false;
            isListeningCurrent = false;
            if (currentAudio) currentAudio.pause();
            
            updateBackground();
            updateUIStrings();
            const config = roundConfig[currentRound];
            const area = document.getElementById('bubble-area');
            const tools = document.getElementById('center-header-tools');
            const t = uiTranslations[userLang];
            
            area.innerHTML = '';
            tools.classList.add('hidden');
            
            document.getElementById('progress-bar').style.width = \`\${((currentRound+1)/9)*100}%\`;

            if (config.type === "review") { loadReviewRound(); return; }

            // Ella's question
            const qWrap = document.createElement('div');
            qWrap.className = 'bubble-wrapper';
            qWrap.id = \`q-wrap-\${currentRound}\`;
            qWrap.innerHTML = \`
                <div class="speaker-btn ella-voice-btn" onclick="speak('\${config.q.replace(/'/g, "\\\\'")}')"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M11 5L6 9H2v6h4l5 4V5z"></path></svg></div>
                <div class="bubble bubble-ella-quest">
                    <span class="main-text">\${config.q}</span>
                    <span class="sub-text">\${config.qSub[userLang]}</span>
                </div>
            \`;
            area.appendChild(qWrap);
            speak(config.q);

            // User's input field
            const uWrap = document.createElement('div');
            uWrap.className = 'bubble-wrapper justify-end';
            uWrap.id = \`u-wrap-\${currentRound}\`;
            const saved = history[currentRound];
            if (saved) {
                uWrap.innerHTML = \`
                    <div class="bubble bubble-user-ans"><span class="main-text">\${saved.a}</span><span class="sub-text">\${saved.sub}</span></div>
                    <div class="speaker-btn user-voice-btn" onclick="speak('\${saved.a.replace(/'/g, "\\\\'")}')"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M11 5L6 9H2v6h4l5 4V5z"></path></svg></div>
                \`;
                tools.classList.remove('hidden');
            } else {
                uWrap.innerHTML = \`
                    <div class="bubble bubble-user-ans">
                        <span class="main-text">\${config.prefix} <input type="text" id="round-input" class="inline-input" placeholder="..." onkeypress="if(event.key==='Enter') submitAnswer()"> <button onclick="submitAnswer()" class="send-btn inline-flex ml-2" id="send-btn"><svg id="send-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg></button></span>
                        <span class="sub-text">\${config.prefixSub[userLang]} ...</span>
                        <span class="hint-text">\${t.hint}: \${config.hint[userLang]}</span>
                    </div>
                \`;
            }
            area.appendChild(uWrap);
            if (document.getElementById('round-input')) document.getElementById('round-input').focus();
        }

        async function submitAnswer() {
            const input = document.getElementById('round-input');
            const btn = document.getElementById('send-btn');
            const icon = document.getElementById('send-icon');
            const val = input.value.trim();
            if (!val && roundConfig[currentRound].hint.en !== "Just click send") return;

            input.disabled = true;
            btn.disabled = true;
            if (icon) icon.classList.add('processing-blink');
            
            const viFragment = val ? await getVietnameseResponse(val) : "";
            const config = roundConfig[currentRound];
            const fullVi = \`\${config.prefix} \${viFragment}\`.trim();
            const translation = await getTranslateToUser(fullVi);
            
            history[currentRound] = { a: fullVi, sub: translation };
            loadRound();
            speak(fullVi);
            confetti({ particleCount: 30, spread: 50, origin: { y: 0.8 }, colors: ['#db2777', '#2563eb'] });
        }

        function loadReviewRound() {
            const area = document.getElementById('bubble-area');
            let reviewHtml = ''; 
            document.getElementById('center-header-tools').classList.remove('hidden');
            updateRoundInfo();

            history.forEach((item, i) => {
                const q = roundConfig[i];
                reviewHtml += \`
                    <div class="bubble-wrapper mb-2" id="rev-q-\${i}">
                        <div class="speaker-btn ella-voice-btn" onclick="speak('\${q.q.replace(/'/g, "\\\\'")}')">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M11 5L6 9H2v6h4l5 4V5z"></path></svg>
                        </div>
                        <div class="bubble bubble-ella-quest"><span class="main-text">\${q.q}</span></div>
                    </div>
                    <div class="bubble-wrapper justify-end mb-6" id="rev-a-\${i}">
                        <div class="bubble bubble-user-ans"><span class="main-text">\${item.a}</span><span class="sub-text">\${item.sub}</span></div>
                        <div class="speaker-btn user-voice-btn" onclick="speak('\${item.a.replace(/'/g, "\\\\'")}')">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M11 5L6 9H2v6h4l5 4V5z"></path></svg>
                        </div>
                    </div>
                \`;
            });
            area.innerHTML = reviewHtml; 
        }

        async function toggleReviewMode() {
            if (isReviewing) { 
                stopReview = true; 
                if (currentAudio) currentAudio.pause();
                isReviewing = false;
                updateUIStrings();
                return; 
            }
            startFullReview();
        }

        async function startFullReview() {
            isReviewing = true;
            stopReview = false;
            updateUIStrings();

            loadReviewRound();
            await new Promise(r => setTimeout(r, 100));

            for (let i = 0; i < history.length; i++) {
                if (stopReview) break;
                
                const qEl = document.getElementById(\`rev-q-\${i}\`);
                const aEl = document.getElementById(\`rev-a-\${i}\`);

                if (qEl) {
                    qEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    qEl.classList.add('highlight-ella');
                    await speak(roundConfig[i].q);
                    qEl.classList.remove('highlight-ella');
                }

                if (stopReview) break;
                await new Promise(r => setTimeout(r, 500));
                if (stopReview) break;

                if (aEl) {
                    aEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    aEl.classList.add('highlight-user');
                    await speak(history[i].a);
                    aEl.classList.remove('highlight-user');
                }
                await new Promise(r => setTimeout(r, 300));
            }

            isReviewing = false;
            stopReview = false;
            updateUIStrings();
        }

        function goForward() {
            if (currentRound < 8) { currentRound++; loadRound(); }
            else document.getElementById('win-overlay').classList.remove('hidden');
        }

        function prevRound() { if (currentRound > 0) { currentRound--; loadRound(); } }
        function nextRound() { if (currentRound < 8 && history[currentRound]) { currentRound++; loadRound(); } }
    </script>
</body>
</html>
`;

export const GameSpeakingMeetingFriends: React.FC = () => {
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
        const finalHtml = gameHTML.replace(
            'const apiKey = "";',
            `const apiKey = "${process.env.API_KEY || ''}";`
        );
        const blob = new Blob([finalHtml], { type: 'text/html' });
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
                    title="Speak Challenge: Meet New Friends"
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


import React, { useEffect, useRef, useState } from 'react';
import { Maximize, Minimize } from 'lucide-react';

const gameHTML = `
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Make Question Viet: Meet new friends</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@400;600;700&display=swap');

        body {
            font-family: 'Quicksand', sans-serif;
            background: #0f172a; 
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            margin: 0;
            overflow: hidden;
            touch-action: none;
        }

        .game-card {
            background: url('https://lh3.googleusercontent.com/d/1_iDcgvwW3S-_uBBqqDUopVvlvTwlGvQe') no-repeat center center;
            background-size: cover;
            border-radius: 1.5rem;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8);
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            position: relative;
            overflow: hidden;
            border: 4px solid #f59e0b;
        }

        .overlay {
            position: absolute;
            inset: 0;
            background: rgba(15, 23, 42, 0.85);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            padding: 10px; 
            text-align: center;
        }

        .game-title {
            background: linear-gradient(45deg, #fbbf24, #f87171);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            font-size: 2.2rem; 
            font-weight: 800;
            line-height: 1.1;
            margin-bottom: 1.5rem; 
            text-transform: uppercase;
        }

        .how-to-play-box {
            background: rgba(30, 41, 59, 0.95);
            border: 1px solid #f59e0b;
            border-radius: 1rem;
            padding: 1.5rem; 
            width: 100%;
            max-width: 400px;
            text-align: left;
            margin-bottom: 1.5rem; 
        }

        .htp-title {
            color: #fbbf24;
            font-weight: 800;
            font-size: 0.85rem;
            letter-spacing: 0.1em;
            margin-bottom: 0.8rem;
            text-transform: uppercase;
        }

        .htp-step {
            display: flex;
            align-items: flex-start;
            gap: 10px;
            margin-bottom: 0.6rem; 
            font-size: 0.9rem; 
            color: #cbd5e1;
            font-weight: 600;
        }

        .step-num {
            background: linear-gradient(135deg, #f59e0b, #ef4444);
            color: white;
            width: 20px;
            height: 20px;
            border-radius: 5px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.7rem;
            flex-shrink: 0;
        }

        .lang-selector {
            display: flex;
            gap: 8px;
            width: 100%;
            max-width: 400px;
            margin-bottom: 1.5rem;
        }

        .lang-btn {
            flex: 1;
            padding: 0.7rem;
            border-radius: 0.8rem;
            font-weight: 800;
            font-size: 0.8rem;
            text-transform: uppercase;
            transition: all 0.2s;
            background: rgba(30, 41, 59, 0.8);
            border: 1px solid #334155;
            color: #94a3b8;
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
            padding: 1.2rem;
            border-radius: 1.2rem;
            font-weight: 800;
            font-size: 1.1rem;
            text-transform: uppercase;
            box-shadow: 0 10px 15px -3px rgba(245, 158, 11, 0.4);
        }

        #game-header {
            flex-shrink: 0;
            background: rgba(15, 23, 42, 0.7);
            backdrop-filter: blur(4px);
            padding: 1rem 1.5rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            z-index: 100;
            border-bottom: 1px solid rgba(245, 158, 11, 0.3);
        }

        .nav-btn {
            background: rgba(30, 41, 59, 0.8);
            color: white;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
        }

        .btn-next-round {
            background: #f59e0b;
            color: white;
            padding: 10px 28px;
            border-radius: 14px;
            font-weight: 900;
            font-size: 14px;
            opacity: 1; 
            pointer-events: auto;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
        }

        .bubble-area {
            position: absolute;
            top: 175px; 
            left: 0;
            right: 0;
            padding: 0 20px;
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
        }

        .drop-zone {
            border: 3px dashed #f59e0b;
            background: rgba(30, 41, 59, 0.8);
            min-height: 90px;
            border-radius: 1.5rem;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fbbf24;
            font-weight: 700;
            padding: 15px 25px;
            width: fit-content; 
            max-width: 85%;
            align-self: flex-start;
        }

        .bubble {
            padding: 1.2rem 1.8rem;
            border-radius: 1.5rem;
            width: fit-content; 
            max-width: 85%;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            background: rgba(30, 41, 59, 0.9);
            color: white;
        }

        .bubble-user-ans {
            align-self: flex-start;
            border: 3px solid #f59e0b;
            background: rgba(69, 26, 3, 0.95);
        }

        .bubble-ella-quest {
            align-self: flex-end;
            border-left: 8px solid #f87171;
        }

        .draggable-item {
            position: absolute;
            background: rgba(30, 41, 59, 0.95);
            padding: 14px 22px;
            border-radius: 1.5rem;
            box-shadow: 0 20px 40px rgba(0,0,0,0.6);
            border: 2px solid #f59e0b;
            cursor: grab;
            user-select: none;
            width: fit-content;
            max-width: 280px;
            text-align: center;
            z-index: 100;
            color: white;
            animation: floating 4s ease-in-out infinite;
            display: flex;
            flex-direction: column;
            gap: 4px;
        }

        .mini-speaker {
            cursor: pointer;
            padding: 10px;
            border-radius: 50%;
            background: #334155;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.2s;
        }
        .mini-speaker:active { transform: scale(0.9); }

        .hidden { display: none !important; }

        .review-page {
            position: absolute;
            inset: 0;
            background: rgba(15, 23, 42, 0.98);
            z-index: 200;
            display: flex;
            flex-direction: column;
            color: white;
        }

        @keyframes floating {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-15px); }
            100% { transform: translateY(0px); }
        }

        .review-item {
            background: rgba(30, 41, 59, 0.8);
            border: 2px solid transparent;
            padding: 1.25rem;
            border-radius: 1.2rem;
            margin-bottom: 1rem;
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            scroll-margin: 100px;
        }

        .review-item.active-listen {
            border-color: #f59e0b;
            background: rgba(69, 26, 3, 0.8);
            transform: scale(1.03);
            box-shadow: 0 10px 25px rgba(245, 158, 11, 0.2);
        }

        /* TOOLTIP SYSTEM */
        .tooltip-container {
            position: relative;
            display: inline-block;
            cursor: help;
        }
        .tooltip-text {
            visibility: hidden;
            width: 240px;
            background-color: #f59e0b;
            color: #000;
            text-align: left;
            border-radius: 8px;
            padding: 10px;
            position: absolute;
            z-index: 1001;
            bottom: 125%;
            left: 50%;
            transform: translateX(-50%);
            opacity: 0;
            transition: opacity 0.3s;
            font-size: 12px;
            font-weight: 600;
            line-height: 1.4;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            pointer-events: none;
        }
        .tooltip-text::after {
            content: "";
            position: absolute;
            top: 100%;
            left: 50%;
            margin-left: -5px;
            border-width: 5px;
            border-style: solid;
            border-color: #f59e0b transparent transparent transparent;
        }
        .tooltip-container:hover .tooltip-text {
            visibility: visible;
            opacity: 1;
        }

        /* WORD-AUDIO SYSTEM */
        .clickable-word {
            display: inline-block;
            cursor: pointer;
            transition: all 0.2s;
            border-radius: 4px;
            padding: 0 2px;
        }
        .clickable-word:hover {
            background-color: rgba(245, 158, 11, 0.3);
            transform: translateY(-2px);
        }
        .clickable-word:active {
            transform: scale(0.95);
        }

        /* HIGHLIGHT SYSTEM */
        .q-word {
            transition: all 0.3s;
            border-radius: 4px;
            padding: 0 2px;
        }
        
        .highlight-active {
            background-color: #f59e0b !important;
            color: black !important;
            font-weight: 800;
            box-shadow: 0 0 8px #f59e0b;
        }

        .btn-listen-all {
            background: #f59e0b;
            color: black;
            padding: 6px 12px;
            border-radius: 8px;
            font-size: 11px;
            font-weight: 800;
            display: flex;
            align-items: center;
            gap: 5px;
            transition: all 0.2s;
        }
        .btn-listen-all:active { transform: scale(0.95); }
        .btn-listen-all.playing { background: #ef4444; color: white; }
    </style>
</head>
<body onload="initApp()">

    <div class="game-card" id="main-card">
        <!-- START WINDOW -->
        <div id="start-overlay" class="overlay">
            <h1 class="game-title">Make Question Viet:<br>Meet new friends</h1>
            
            <div class="how-to-play-box">
                <div id="htp-title" class="htp-title"><span>👋</span> CÁCH CHƠI</div>
                <div class="htp-step"><span class="step-num">1</span> <span id="step-1">Đọc câu trả lời để làm quen bạn mới.</span></div>
                <div class="htp-step"><span class="step-num">2</span> <span id="step-2">Kéo câu hỏi phù hợp vào ô trống.</span></div>
                <div class="htp-step"><span class="step-num">3</span> <span id="step-3">Bạn có thể Skip (Tiếp theo) bất cứ lúc nào!</span></div>
            </div>

            <div class="lang-selector">
                <button id="lang-en" onclick="setLang('en')" class="lang-btn active">ENGLISH</button>
                <button id="lang-ru" onclick="setLang('ru')" class="lang-btn">RUSSIAN</button>
            </div>

            <button id="btn-start" onclick="startGame()" class="btn-start-main">BẮT ĐẦU KẾT BẠN</button>
        </div>

        <!-- Header Game -->
        <div id="game-header" class="hidden">
            <div class="flex items-center gap-4">
                <button onclick="prevRound()" class="nav-btn">←</button>
                <div class="flex flex-col">
                    <span id="topic-label" class="text-[10px] font-black text-amber-400 uppercase tracking-widest">MEET FRIENDS TOPIC</span>
                    <h2 id="round-title" class="text-[14px] font-bold text-white">ROUND 1/8</h2>
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
                <div class="p-4 px-6 border-b border-slate-800 flex justify-between items-center bg-slate-900">
                    <h2 id="review-title" class="text-lg font-black">Kết quả học tập</h2>
                    <button id="listen-all-btn" onclick="listenAllQuestions()" class="btn-listen-all">
                        <span id="listen-icon">▶</span> <span id="listen-text">NGHE TẤT CẢ</span>
                    </button>
                </div>
                <div id="review-list" class="overflow-y-auto flex-1 p-6 space-y-4 scroll-smooth"></div>
                <div class="p-6 bg-slate-900 border-t border-slate-800">
                    <button id="btn-again" onclick="location.reload()" class="w-full py-4 bg-amber-600 text-white rounded-2xl font-black uppercase text-sm">CHƠI LẠI</button>
                </div>
            </div>
        </div>
    </div>

    <script>
        const uiStrings = {
            en: {
                htpTitle: "HOW TO PLAY",
                step1: "Read the answer to get to know new friends.",
                step2: "Drag the correct question into the slot.",
                step3: "You can skip rounds anytime with the Next button!",
                btnStart: "START CONNECTING",
                topic: "MEET FRIENDS TOPIC",
                next: "NEXT →",
                reviewTitle: "Question Review",
                btnAgain: "PLAY AGAIN",
                round: "ROUND",
                dropText: "DRAG QUESTION HERE...",
                tooltipNo: "This 'không' at the end turns the statement into a YES/NO question. It has no literal meaning here.",
                tooltipNha: "The word 'nha' is widely used in the South, while 'nhé' is used in the North. Placed at the end of a sentence, it expresses a friendly invitation or suggestion.",
                listenAll: "LISTEN ALL",
                stopListen: "STOP"
            },
            ru: {
                htpTitle: "КАК ИГРАТЬ",
                step1: "Прочитайте ответ, чтобы познакомиться.",
                step2: "Перетащите правильный вопрос в поле.",
                step3: "Вы можете пропустить раунд в любое время!",
                btnStart: "НАЧАТЬ ЗНАКОМСТВО",
                topic: "ТЕМА: ЗНАКОМСТВО",
                next: "ДАЛЕЕ →",
                reviewTitle: "Обзор вопросов",
                btnAgain: "ИГРАТЬ СНОВА",
                round: "РАУНД",
                dropText: "ПЕРЕТАЩИТЕ ВОПРОС СЮДА...",
                tooltipNo: "Это 'không' в конце превращает утверждение в вопрос ДА/НЕТ. Само по себе оно здесь ничего не значит.",
                tooltipNha: "Слово 'nha' широко используется на Юге, а 'nhé' — на Севере. Стоя в конце предложения, оно выражает дружеское приглашение или предложение.",
                listenAll: "СЛУШАТЬ ВСЁ",
                stopListen: "СТОП"
            }
        };

        const qHighlights = {
            "gì": { en: ["what"], ru: ["что", "как"] },
            "đâu": { en: ["where"], ru: ["откуда", "где"] },
            "nào": { en: ["what", "which"], ru: ["какая", "какие", "какой"] },
            "thế nào": { en: ["how"], ru: ["как"] },
            "bao giờ": { en: ["when"], ru: ["когда"] }
        };

        const meetFriendsData = [
            { 
                q: "Chào bạn. Mình là Lan. Tên bạn là gì?", 
                ans: "Mình là Nikolai! Rất vui được gặp bạn!", 
                enQ: "Hi. I'm Lan. What is your name?",
                ruQ: "Привет. Я Лан. Как тебя зовут?",
                enA: "I am Nikolai! Nice to meet you!",
                ruA: "Я Николай! Приятно познакомиться!",
                distractors: [
                    { vi: "Bạn khỏe không?", en: "How are you?", ru: "Как дела?" },
                    { vi: "Bạn ở đâu?", en: "Where are you?", ru: "Где ты?" }
                ] 
            },
            { 
                q: "Bạn đến từ đâu?", 
                ans: "Mình từ nước Nga.", 
                enQ: "Where are you from?",
                ruQ: "Откуда ты?",
                enA: "I come from Russia.",
                ruA: "Я из России.",
                distractors: [
                    { vi: "Bạn bao nhiêu tuổi?", en: "How old are you?", ru: "Сколько тебе лет?" },
                    { vi: "Bạn thích đi đâu?", en: "Where do you like to go?", ru: "Куда ты любишь ходить?" }
                ] 
            },
            { 
                q: "Món ăn yêu thích của bạn là gì?", 
                ans: "Mình thích ăn Bún Bò và Cơm Gà!", 
                enQ: "What is your favorite food?",
                ruQ: "Какая твоя любимая еда?",
                enA: "I like Beef Noodles and Chicken Rice!",
                ruA: "Я люблю Бун Бо и Ком Га!",
                distractors: [
                    { vi: "Bạn thích uống gì?", en: "What do you like to drink?", ru: "Что ты любишь пить?" },
                    { vi: "Bạn đi chợ chưa?", en: "Have you gone to the market?", ru: "Ты уже был на рынке?" }
                ] 
            },
            { 
                q: "Bạn có sống ở Nha Trang không?", 
                ans: "Mình ở đây được 8 tháng rồi.", 
                enQ: "Do you live in Nha Trang?",
                ruQ: "Ты живешь в Нячанге?",
                enA: "I've been here for 8 months.",
                ruA: "Я здесь уже 8 месяцев.",
                distractors: [
                    { vi: "Nha Trang đẹp không?", en: "Is Nha Trang beautiful?", ru: "Нячанг красивый?" },
                    { vi: "Bạn thích biển không?", en: "Do you like the beach?", ru: "Тебе нравится пляж?" }
                ] 
            },
            { 
                q: "Sở thích của bạn là gì?", 
                ans: "Mình thích chơi bóng chuyền ngoài bãi biển.", 
                enQ: "What are your hobbies?",
                ruQ: "Какие у тебя хобби?",
                enA: "I like playing volleyball on the beach.",
                ruA: "Мне нравится играть в волейбол на пляже.",
                distractors: [
                    { vi: "Bạn có mệt không?", en: "Are you tired?", ru: "Ты устал?" },
                    { vi: "Bạn thích xem phim không?", en: "Do you like watching movies?", ru: "Тебе нравится смотреть кино?" }
                ] 
            },
            { 
                q: "Công việc của bạn là gì?", 
                ans: "Mình là huấn luyện viên bóng chuyền.", 
                enQ: "What is your job?",
                ruQ: "Кем ты работаешь?",
                enA: "I am a volleyball coach.",
                ruA: "Я тренер по волейболу.",
                distractors: [
                    { vi: "Bạn làm ở đâu?", en: "Where do you work?", ru: "Где ты работаешь?" },
                    { vi: "Bạn có thích đi làm không?", en: "Do you like going to work?", ru: "Тебе нравится ходить на работу?" }
                ] 
            },
            { 
                q: "Chúng ta kết bạn qua zalo nha.", 
                ans: "Ok! Zalo của mình là 0945 123 678", 
                enQ: "Let's be friends on Zalo.",
                ruQ: "Давай дружить в Zalo.",
                enA: "Ok! My Zalo is 0945 123 678",
                ruA: "Окей! My Zalo is 0945 123 678",
                distractors: [
                    { vi: "Số điện thoại là gì?", en: "What is your phone number?", ru: "Какой твой номер телефона?" },
                    { vi: "Bạn có zalo không?", en: "Do you have Zalo?", ru: "У тебя есть Zalo?" }
                ] 
            },
            { 
                q: "Rất vui được gặp bạn. Hẹn gặp lại.", 
                ans: "Rất vui được biết bạn. Hẹn gặp lại.", 
                enQ: "Nice to meet you. See you again.",
                ruQ: "Рад встрече. До свидания.",
                enA: "Nice to know you. See you again.",
                ruA: "Приятно познакомиться. До встречи.",
                distractors: [
                    { vi: "Chào buổi sáng!", en: "Good morning!", ru: "Доброе утро!" },
                    { vi: "Chúc ngủ ngon!", en: "Good night!", ru: "Спокойной ночи!" }
                ] 
            }
        ];

        let currentRound = 0, userLang = 'en', roundSolved = false;
        let isSpeaking = false;
        let currentAudio = null;
        let isListeningAll = false;

        const correctSfx = new Audio("https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3");

        function initApp() { setLang('en'); }

        function setLang(lang) {
            userLang = lang;
            document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
            document.getElementById(\`lang-\${lang}\`).classList.add('active');
            updateUI();
        }

        function updateUI() {
            const s = uiStrings[userLang];
            document.getElementById('htp-title').innerHTML = \`<span>👋</span> \${s.htpTitle}\`;
            document.getElementById('step-1').innerText = s.step1;
            document.getElementById('step-2').innerText = s.step2;
            document.getElementById('step-3').innerText = s.step3;
            document.getElementById('btn-start').innerText = s.btnStart;
            document.getElementById('topic-label').innerText = s.topic;
            document.getElementById('next-round-btn').innerText = s.next;
            document.getElementById('review-title').innerText = s.reviewTitle;
            document.getElementById('btn-again').innerText = s.btnAgain;
            document.getElementById('round-title').innerText = \`\${s.round} \${currentRound + 1}/\${meetFriendsData.length}\`;
            document.getElementById('listen-text').innerText = isListeningAll ? s.stopListen : s.listenAll;
            
            const drop = document.getElementById('drop-target');
            if (drop && !roundSolved) drop.innerText = s.dropText;
        }

        function startGame() {
            document.getElementById('start-overlay').classList.add('hidden');
            document.getElementById('game-header').classList.remove('hidden');
            loadRound();
        }

        async function speakText(text) {
            if (!text || isSpeaking) return;
            isSpeaking = true;
            const parts = text.split(/([,.?!])/g).filter(p => p.trim().length > 0);
            for (let part of parts) {
                const p = part.trim();
                if (['.', ',', '!', '?'].includes(p)) {
                    await new Promise(r => setTimeout(r, p === ',' ? 300 : 600));
                    continue;
                }
                await playAudio(p, 'vi');
                if (!isSpeaking) break; 
            }
            isSpeaking = false;
        }

        async function playAudio(text, lang) {
            return new Promise(resolve => {
                const url = \`https://translate.google.com/translate_tts?ie=UTF-8&q=\${encodeURIComponent(text)}&tl=\${lang}&client=tw-ob\`;
                currentAudio = new Audio(url);
                currentAudio.onended = () => { currentAudio = null; resolve(); };
                currentAudio.onerror = () => { currentAudio = null; resolve(); };
                currentAudio.play().catch(resolve);
            });
        }

        function stopAllAudio() {
            isSpeaking = false;
            isListeningAll = false;
            if (currentAudio) {
                currentAudio.pause();
                currentAudio = null;
            }
            updateUI();
        }

        async function listenAllQuestions() {
            if (isListeningAll) {
                stopAllAudio();
                return;
            }

            isListeningAll = true;
            updateUI();
            document.getElementById('listen-all-btn').classList.add('playing');
            document.getElementById('listen-icon').innerText = "■";

            const items = document.querySelectorAll('.review-item');
            for (let i = 0; i < items.length; i++) {
                if (!isListeningAll) break;

                const item = items[i];
                items.forEach(it => it.classList.remove('active-listen'));
                item.classList.add('active-listen');
                item.scrollIntoView({ behavior: 'smooth', block: 'center' });

                await speakText(meetFriendsData[i].q);
                await new Promise(r => setTimeout(r, 800));
            }

            isListeningAll = false;
            items.forEach(it => it.classList.remove('active-listen'));
            document.getElementById('listen-all-btn').classList.remove('playing');
            document.getElementById('listen-icon').innerText = "▶";
            updateUI();
        }

        function processText(text, translate, targetLang, roundIdx) {
            let processedText = text;
            let processedTranslate = translate;

            if (roundIdx === 4 || roundIdx === 5) {
                processedText = processedText.replace(/bóng chuyền/gi, "##BONG_CHUYEN##");
            }

            const words = processedText.split(/(\\s+)/);
            processedText = words.map(word => {
                if (word.trim().length === 0) return word;
                if (word === "##BONG_CHUYEN##") return \`<span class="clickable-word font-bold border-b border-amber-500" onclick="event.stopPropagation(); speakWord('bóng chuyền')">bóng chuyền</span>\`;

                const cleanWord = word.replace(/[.,?!]/g, "");
                
                if (cleanWord.toLowerCase() === "không" && text.trim().endsWith("?")) {
                    return \`<span class="tooltip-container">
                                <span class="clickable-word text-amber-500 font-bold underline decoration-dotted" onclick="event.stopPropagation(); speakWord('không')">không</span>
                                <span class="tooltip-text">\${uiStrings[targetLang].tooltipNo}</span>
                            </span>\${word.includes('?') ? '?' : ''}\`;
                }

                if (roundIdx === 6 && cleanWord.toLowerCase() === "nha" && text.trim().endsWith(".")) {
                    return \`<span class="tooltip-container">
                                <span class="clickable-word text-amber-500 font-bold underline decoration-dotted" onclick="event.stopPropagation(); speakWord('nha')">nha</span>
                                <span class="tooltip-text">\${uiStrings[targetLang].tooltipNha}</span>
                            </span>\${word.includes('.') ? '.' : ''}\`;
                }

                for (const [viWord, map] of Object.entries(qHighlights)) {
                    if (cleanWord.toLowerCase() === viWord.toLowerCase()) {
                        const id = \`q-\${viWord.replace(' ', '-')}\`;
                        map[targetLang].forEach(tWord => {
                            processedTranslate = processedTranslate.replace(new RegExp(\`\\\\b(\${tWord})\\\\b\`, 'gi'), \`<span class="q-word q-target" data-qid="\${id}" onmouseover="highlightPair('\${id}', true)" onmouseout="highlightPair('\${id}', false)">\$1</span>\`);
                        });
                        return \`<span class="q-word clickable-word" data-qid="\${id}" onmouseover="highlightPair('\${id}', true)" onmouseout="highlightPair('\${id}', false)" onclick="event.stopPropagation(); speakWord('\${cleanWord.replace(/'/g, "\\\\'")}')">\${word}</span>\`;
                    }
                }

                return \`<span class="clickable-word" onclick="event.stopPropagation(); speakWord('\${cleanWord.replace(/'/g, "\\\\'")}')">\${word}</span>\`;
            }).join("");

            return { processedText, processedTranslate };
        }

        function highlightPair(id, isActive) {
            document.querySelectorAll(\`[data-qid="\${id}"]\`).forEach(el => {
                isActive ? el.classList.add('highlight-active') : el.classList.remove('highlight-active');
            });
        }

        async function speakWord(word) { await playAudio(word, 'vi'); }

        function loadRound() {
            roundSolved = false;
            updateUI();
            const list = document.getElementById('bubble-list');
            list.innerHTML = '';
            const data = meetFriendsData[currentRound];
            
            const drop = document.createElement('div');
            drop.className = 'drop-zone';
            drop.id = 'drop-target';
            drop.innerText = uiStrings[userLang].dropText;
            list.appendChild(drop);

            const { processedText, processedTranslate } = processText(data.ans, userLang === 'en' ? data.enA : data.ruA, userLang, currentRound);
            const ans = document.createElement('div');
            ans.className = 'bubble bubble-ella-quest';
            ans.innerHTML = \`<div class="flex items-start gap-4">
                <div class="mini-speaker" onclick="speakText('\${data.ans.replace(/'/g, "\\\\'")}')">🔊</div>
                <div>
                    <div class="text-[19px] leading-relaxed font-bold">\${processedText}</div>
                    <div class="text-[13px] text-amber-400 italic font-semibold mt-2">\${processedTranslate}</div>
                </div>
            </div>\`;
            list.appendChild(ans);
            renderDraggables();
        }

        function renderDraggables() {
            const box = document.getElementById('floating-box');
            box.innerHTML = '';
            const data = meetFriendsData[currentRound];
            
            const options = [
                { text: data.q, translation: userLang === 'en' ? data.enQ : data.ruQ, correct: true },
                ...data.distractors.map(d => ({ text: d.vi, translation: d[userLang], correct: false }))
            ].sort(() => Math.random() - 0.5);

            options.forEach((opt, idx) => {
                const el = document.createElement('div');
                el.className = 'draggable-item';
                el.innerHTML = \`
                    <span class="text-[15px] font-bold">\${opt.text}</span>
                    <span class="text-[11px] text-amber-400 italic font-medium leading-tight">\${opt.translation}</span>
                \`;
                el.dataset.correct = opt.correct;
                el.style.left = (20 + (idx * 30)) + "%";
                el.style.top = "70%";
                initDraggable(el);
                box.appendChild(el);
            });
        }

        function initDraggable(el) {
            let offsetX, offsetY;
            const onStart = (e) => {
                if (roundSolved) return;
                const t = e.type === 'touchstart' ? e.touches[0] : e;
                offsetX = t.clientX - el.getBoundingClientRect().left;
                offsetY = t.clientY - el.getBoundingClientRect().top;
                el.style.animation = 'none';
                el.style.zIndex = 1000;
                const onMove = (me) => {
                    const mt = me.type === 'touchmove' ? me.touches[0] : me;
                    el.style.left = (mt.clientX - offsetX) + "px";
                    el.style.top = (mt.clientY - offsetY) + "px";
                };
                const onEnd = () => {
                    document.removeEventListener('mousemove', onMove);
                    document.removeEventListener('mouseup', onEnd);
                    document.removeEventListener('touchmove', onMove);
                    document.removeEventListener('touchend', onEnd);
                    checkDrop(el);
                };
                document.addEventListener('mousemove', onMove);
                document.addEventListener('mouseup', onEnd);
                document.addEventListener('touchmove', onMove, {passive:false});
                document.addEventListener('touchend', onEnd);
            };
            el.addEventListener('mousedown', onStart);
            el.addEventListener('touchstart', onStart);
        }

        async function checkDrop(el) {
            const drop = document.getElementById('drop-target');
            const dr = drop.getBoundingClientRect();
            const er = el.getBoundingClientRect();
            if (er.left < dr.right && er.right > dr.left && er.top < dr.bottom && er.bottom > dr.top && el.dataset.correct === "true") {
                roundSolved = true;
                
                correctSfx.currentTime = 0;
                correctSfx.play().catch(e => console.log("SFX play blocked"));
                
                confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
                const data = meetFriendsData[currentRound];
                const { processedText, processedTranslate } = processText(data.q, userLang === 'en' ? data.enQ : data.ruQ, userLang, currentRound);
                drop.innerHTML = \`<div class="flex items-center gap-4">
                    <div class="mini-speaker" onclick="speakText('\${data.q.replace(/'/g, "\\\\'")}')">🔊</div>
                    <div>
                        <div class="text-[19px] text-white font-bold">\${processedText}</div>
                        <div class="text-[13px] text-amber-400 italic font-semibold">\${processedTranslate}</div>
                    </div>
                </div>\`;
                drop.classList.replace('drop-zone', 'bubble');
                drop.classList.add('bubble-user-ans');
                el.remove();
                document.querySelectorAll('.draggable-item').forEach(d => d.remove());
                setTimeout(async () => { await speakText(data.q); await new Promise(r => setTimeout(r, 400)); await speakText(data.ans); }, 600);
            } else {
                el.style.transition = 'all 0.5s'; el.style.left = "50%"; el.style.top = "70%"; el.style.transform = "translateX(-50%)";
                setTimeout(() => { el.style.transition = ''; el.style.animation = 'floating 4s ease-in-out infinite'; }, 500);
            }
        }

        function nextRound() { currentRound < meetFriendsData.length - 1 ? (currentRound++, loadRound()) : showReview(); }
        function prevRound() { if (currentRound > 0) { currentRound--; loadRound(); } }

        function showReview() {
            stopAllAudio();
            document.getElementById('review-page').classList.remove('hidden');
            const list = document.getElementById('review-list');
            list.innerHTML = '';
            meetFriendsData.forEach((d, i) => {
                const res = processText(d.q, userLang === 'en' ? d.enQ : d.ruQ, userLang, i);
                const item = document.createElement('div');
                item.className = 'review-item';
                item.innerHTML = \`<div class="flex justify-between items-start gap-4">
                    <div>
                        <div class="text-amber-500 font-black text-[10px] uppercase mb-1">CÂU HỎI \${i+1}</div>
                        <div class="text-white font-bold text-lg leading-tight">\${res.processedText}</div>
                        <div class="text-slate-400 text-sm mt-1">\${res.processedTranslate}</div>
                    </div>
                    <div class="mini-speaker flex-shrink-0" onclick="speakText('\${d.q.replace(/'/g, "\\\\'")}')">🔊</div>
                </div>\`;
                list.appendChild(item);
            });
        }
    </script>
</body>
</html>
`;

export const GameMakeQuestionMeetingFriends: React.FC = () => {
    const [iframeSrc, setIframeSrc] = useState<string | undefined>(undefined);
    const gameWrapperRef = useRef<HTMLDivElement>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);

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
                    title="Make Question Game - Meeting New Friends"
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

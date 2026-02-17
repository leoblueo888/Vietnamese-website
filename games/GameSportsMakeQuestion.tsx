
import React, { useState, useEffect, useRef } from 'react';
import { Maximize, Minimize } from 'lucide-react';

const gameHTML = `
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ASK QUESTION VIET: Sport & Training</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@400;600;700&display=swap');

        body {
            font-family: 'Quicksand', sans-serif;
            background-color: #f0f9ff;
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            margin: 0;
            overflow: hidden;
            touch-action: none;
        }

        .game-card {
            background-image: url('https://lh3.googleusercontent.com/d/1ZHW-Zlnn4Es_rWYHLyR2wK9EspjuS71G'); 
            background-size: cover; 
            background-position: center;
            background-repeat: no-repeat;
            border-radius: 2rem;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.2);
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            position: relative;
            overflow: hidden;
            background-color: white;
            border: 8px solid white;
        }

        .overlay {
            position: absolute;
            inset: 0;
            background: rgba(255, 255, 255, 0.6);
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
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            max-width: 480px;
            width: 100%;
            border: 2px solid #e0e7ff;
            text-align: center;
        }

        .game-title {
            background: linear-gradient(45deg, #1e40af, #be185d);
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
            background: rgba(255, 255, 255, 0.8);
            border-bottom: 1px solid rgba(0, 0, 0, 0.05);
            padding: 0.75rem 1.25rem;
            display: grid;
            grid-template-columns: 1fr auto 1fr;
            align-items: center;
            z-index: 100;
        }

        .nav-btn {
            background: white;
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
        }
        .btn-next-round.enabled {
            opacity: 1;
            pointer-events: auto;
            animation: pulse-next 2s infinite;
        }

        @keyframes pulse-next {
            0% { transform: scale(1); }
            70% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }

        .scene-container {
            flex: 1;
            position: relative;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            background-color: transparent;
        }

        .bubble-area {
            position: absolute;
            top: 112px; 
            left: 0;
            right: 0;
            padding: 20px;
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
            z-index: 10;
        }

        .drop-zone {
            border: 4px dashed #4f46e5;
            background: rgba(255, 255, 255, 0.9);
            width: 50%;
            height: 15%;
            min-height: 80px;
            border-radius: 1.5rem;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #4f46e5;
            font-weight: 700;
            font-style: italic;
            transition: all 0.2s ease;
            position: relative;
            text-align: center;
            padding: 15px;
            margin: 0 auto;
        }

        .drop-zone.active {
            background: white;
            border-color: #be185d;
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
            box-shadow: 0 15px 30px rgba(0,0,0,0.2);
            border: 2px solid #6366f1;
            cursor: grab;
            user-select: none;
            max-width: 280px;
            text-align: center;
            z-index: 30; 
            animation: float-anim 4s ease-in-out infinite;
        }

        @keyframes float-anim {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
        }

        .bubble {
            padding: 1.2rem 1.8rem;
            border-radius: 1.5rem;
            max-width: 90%;
            box-shadow: 0 10px 25px rgba(0,0,0,0.15);
            background: white;
            position: relative;
        }

        .bubble-user-ans {
            align-self: flex-start;
            border: 3px solid #4f46e5;
            background: #f5f3ff;
            color: #4338ca;
            min-width: 280px;
        }

        .bubble-ella-quest {
            align-self: flex-end;
            border-left: 8px solid #be185d;
            color: #be185d;
            min-width: 280px;
        }

        .word-chip {
            display: inline-block;
            cursor: pointer;
            padding: 4px 10px;
            margin: 2px;
            border-radius: 10px;
            background: #f1f5f9;
            border-bottom: 3px solid #e2e8f0;
            color: #1e293b;
            font-weight: 700;
            font-size: 14px;
            transition: all 0.2s;
        }
        .word-chip:hover {
            background: #e0e7ff;
            transform: translateY(-2px);
        }

        .smart-word {
            cursor: help;
            border-bottom: 2px dotted #a5b4fc;
            transition: all 0.2s;
            font-weight: 800;
            color: #4f46e5;
        }
        .smart-word:hover, .smart-active {
            background-color: #fef08a;
            color: #854d0e;
            border-bottom-style: solid;
            border-color: #eab308;
            border-radius: 4px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .mini-speaker {
            cursor: pointer;
            padding: 8px;
            border-radius: 50%;
            background: #fdf2f8;
            border: 1px solid #fbcfe8;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            transition: all 0.2s;
        }
        .mini-speaker:hover {
            transform: scale(1.1);
            background: #fbcfe8;
        }

        .hidden { display: none !important; }

        .review-page {
            position: absolute;
            inset: 0;
            background: white;
            z-index: 200;
            display: flex;
            flex-direction: column;
            padding: 0;
        }

        .review-header {
            padding: 1.5rem 2rem;
            background: #f8fafc;
            border-bottom: 1px solid #e2e8f0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .review-content {
            flex: 1;
            overflow-y: auto;
            padding: 1.5rem 2rem;
            background: #f1f5f9;
        }

        .listen-all-btn {
            background: #4f46e5;
            color: white;
            padding: 8px 16px;
            border-radius: 12px;
            font-weight: 800;
            font-size: 12px;
            display: flex;
            align-items: center;
            gap: 8px;
            box-shadow: 0 4px 6px rgba(79, 70, 229, 0.2);
            transition: all 0.2s;
        }
        .listen-all-btn:hover {
            background: #4338ca;
            transform: translateY(-1px);
        }
        .listen-all-btn:active {
            transform: translateY(0);
        }
    </style>
</head>
<body onload="initApp()">

    <div class="game-card" id="main-card">
        <!-- Start Overlay -->
        <div id="start-overlay" class="overlay">
            <div class="start-container">
                <h1 class="game-title">ASK QUESTION VIET:<br>Sport & Training</h1>
                
                <div class="bg-slate-50 p-6 rounded-3xl mb-6 text-left border border-slate-100">
                    <h3 id="ui-how-to-title" class="text-xs font-black text-indigo-600 mb-3 uppercase tracking-widest flex items-center gap-2">
                        <span>⚽</span> HOW TO PLAY / CÁCH CHƠI
                    </h3>
                    <div class="space-y-3">
                        <div class="flex items-center gap-3">
                            <div class="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold">1</div>
                            <p id="ui-step-1" class="text-xs font-bold text-slate-700">Xem câu trả lời về thể thao.</p>
                        </div>
                        <div class="flex items-center gap-3">
                            <div class="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold">2</div>
                            <p id="ui-step-2" class="text-xs font-bold text-slate-700">Kéo "Câu hỏi" đúng thả vào khung trống.</p>
                        </div>
                        <div class="flex items-center gap-3">
                            <div class="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold">3</div>
                            <p id="ui-step-3" class="text-xs font-bold text-slate-700">Di chuột vào từ khóa để xem nghĩa.</p>
                        </div>
                    </div>
                </div>

                <div class="mb-6">
                    <p id="ui-translation-label" class="text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-widest text-center">Translation</p>
                    <div class="flex gap-2">
                        <button onclick="setLang('en')" id="lang-en" class="flex-1 py-2 rounded-xl font-bold text-xs bg-indigo-600 text-white">ENGLISH</button>
                        <button onclick="setLang('ru')" id="lang-ru" class="flex-1 py-2 rounded-xl font-bold text-xs bg-slate-100 text-slate-600">RUSSIAN</button>
                    </div>
                </div>

                <button id="ui-btn-start" onclick="startGame()" class="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xl shadow-xl hover:bg-indigo-700 active:scale-95 transition-all">BẮT ĐẦU CHƠI</button>
            </div>
        </div>

        <!-- Header -->
        <div id="game-header" class="hidden">
            <div class="flex items-center gap-4">
                <div class="flex flex-col">
                    <span id="ui-level-tag" class="text-[9px] font-black text-indigo-600 uppercase tracking-tighter mb-1">DRAG & DROP</span>
                    <h2 id="round-title" class="text-sm font-black text-slate-900 leading-none">ROUND 1/8</h2>
                </div>
                <div class="flex gap-1">
                    <button onclick="prevRound()" class="nav-btn">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" stroke-width="3"/></svg>
                    </button>
                    <button onclick="skipRound()" class="nav-btn">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" stroke-width="3"/></svg>
                    </button>
                </div>
            </div>
            <div class="flex justify-center">
                <button id="next-round-btn" onclick="nextRound()" class="btn-next-round">NEXT ROUND →</button>
            </div>
            <div class="flex flex-col items-end">
                <div class="w-20 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div id="progress-bar" class="h-full bg-indigo-600 transition-all" style="width: 10%"></div>
                </div>
            </div>
        </div>

        <div class="scene-container" id="scene-root">
            <div class="bubble-area" id="bubble-list"></div>
            <div class="floating-container" id="floating-box"></div>
            
            <!-- Review Page -->
            <div id="round-9-page" class="review-page hidden">
                <div class="review-header">
                    <div>
                        <h2 id="ui-r9-title" class="text-xl font-black text-slate-800 leading-tight">ROUND REVIEW</h2>
                        <p id="ui-r9-subtitle" class="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">Sport & Training</p>
                    </div>
                    <button onclick="listenAllInReview()" class="listen-all-btn">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"/></svg>
                        LISTEN ALL
                    </button>
                </div>
                <div id="review-list" class="review-content"></div>
                <div class="p-6 bg-white border-t border-slate-100">
                    <button onclick="restartGame()" class="w-full py-4 bg-slate-800 text-white rounded-2xl font-black text-lg shadow-lg">START AGAIN</button>
                </div>
            </div>
        </div>
    </div>

    <script>
        const sportData = [
            { 
                q: "Bạn có thích chơi thể thao không?", 
                ans: "Có! Tôi rất thích chơi thể thao.", 
                ansTrans: { en: "Yes! I really like playing sports.", ru: "Да! Я очень люблю заниматься спортом." }, 
                en: "Do you like playing sports?", 
                ru: "Тебе нравится заниматься спортом?", 
                distractors: [{vi: "Bạn có đang bận không?", trans: {en: "Are you busy?", ru: "Ты занят?"}}, {vi: "Bạn tên là gì?", trans: {en: "What is your name?", ru: "Как тебя зовут?"}}],
                keywords: { vi: "thích", en: "like", ru: "нравится" }
            },
            { 
                q: "Môn thể thao yêu thích của bạn là gì?", 
                ans: "Tôi thích chơi bóng chuyền.", 
                ansTrans: { en: "I like playing volleyball.", ru: "Мне нравится играть в волейбол." }, 
                en: "What is your favorite sport?", 
                ru: "Какой твой любимый вид спорта?", 
                distractors: [{vi: "Bạn sống ở đâu?", trans: {en: "Where do you live?", ru: "Где ты живешь?"}}, {vi: "Món ăn nào ngon nhất?", trans: {en: "Which food is the best?", ru: "Какая еda самая вкусная?"}}],
                keywords: { vi: "gì", en: "What", ru: "Какой" }
            },
            { 
                q: "Bạn chơi thể thao thường xuyên như thế nào?", 
                ans: "Tôi chơi bốn lần một tuần.", 
                ansTrans: { en: "I play four times a week.", ru: "Я играю четыре раза в неделю." }, 
                en: "How often do you play sports?", 
                ru: "Как часто ты занимаешься sпортом?", 
                distractors: [{vi: "Bây giờ là mấy giờ?", trans: {en: "What time is it?", ru: "Который час?"}}, {vi: "Bạn bao nhiêu tuổi?", trans: {en: "How old are you?", ru: "Сколько тебе лет?"}}],
                keywords: { vi: "thường xuyên như thế nào", en: "How often", ru: "Как часто" }
            },
            { 
                q: "Bạn thường chơi thể thao ở đâu?", 
                ans: "Tôi chơi ngoài bãi biển.", 
                ansTrans: { en: "I play on the beach.", ru: "Я играю на пляже." }, 
                en: "Where do you usually play sports?", 
                ru: "Где ты обычно занимаешься спортом?", 
                distractors: [{vi: "Đây là cái gì?", trans: {en: "What is this?", ru: "Что это?"}}, {vi: "Bạn đi đâu đấy?", trans: {en: "Where are you going?", ru: "Куда ты идешь?"}}],
                keywords: { vi: "ở đâu", en: "Where", ru: "Где" }
            },
            { 
                q: "Bạn thường chơi thể thao với ai?", 
                ans: "Tôi chơi với bạn bè.", 
                ansTrans: { en: "I play with friends.", ru: "Я играю с друзьями." }, 
                en: "Who do you usually play sports with?", 
                ru: "С кем ты thường xuyên занимаешься спортом?", 
                distractors: [{vi: "Gia đình bạn có ai?", trans: {en: "Who is in your family?", ru: "Кто в твоей семье?"}}, {vi: "Bạn đang làm gì?", trans: {en: "What are you doing?", ru: "Что ты делаешь?"}}],
                keywords: { vi: "với ai", en: "Who", ru: "С кем" }
            },
            { 
                q: "Bạn cảm thấy thế nào sau khi chơi thể thao?", 
                ans: "Tôi cảm thấy rất sảng khoái và tràn đầy năng lượng.", 
                ansTrans: { en: "I feel very refreshed and full of energy.", ru: "Я чувствую себя очень бодрым и полным энергии." }, 
                en: "How do you feel after playing sports?", 
                ru: "Как ты себя чувствуешь после занятий спортом?", 
                distractors: [{vi: "Bạn có mệt không?", trans: {en: "Are you tired?", ru: "Ты устал?"}}, {vi: "Hôm nay trời thế nào?", trans: {en: "How is the weather today?", ru: "Какая сегодня погода?"}}],
                keywords: { vi: "thế nào", en: "How", ru: "Как" }
            },
            { 
                q: "Bạn có hay xem thể thao trên TV hay YouTube không?", 
                ans: "Thỉnh thoảng tôi có xem trên YouTube.", 
                ansTrans: { en: "Sometimes I watch on YouTube.", ru: "Иногда я смотрю на YouTube." }, 
                en: "Do you often watch sports on TV or YouTube?", 
                ru: "Ты часто смотришь спорт по телевизору hoặc на YouTube?", 
                distractors: [{vi: "Bạn có dùng Facebook không?", trans: {en: "Do you use Facebook?", ru: "Ты пользуешься Facebook?"}}, {vi: "Bạn thích xem phim gì?", trans: {en: "What movie do you like?", ru: "Какой фильм тебе нравится?"}}],
                keywords: { vi: "có hay", en: "often", ru: "часто" }
            },
            { 
                q: "Hãy liệt kê những lợi ích của thể thao.", 
                ans: "Thể thao giúp chúng ta tăng cường sức khỏe.", 
                ansTrans: { en: "Sports help us strengthen health.", ru: "Спорт помогает нам укреплять здоровье." }, 
                en: "List the benefits of sports.", 
                ru: "Перечислите преимущества спорта.", 
                distractors: [{vi: "Trái cây có lợi gì?", trans: {en: "What are the benefits of fruit?", ru: "В чем польза фруктов?"}}, {vi: "Bạn học cái gì?", trans: {en: "What do you study?", ru: "Что ты изучаешь?"}}],
                keywords: { vi: "lợi ích", en: "benefits", ru: "преимущества" }
            }
        ];

        const compoundWords = ["thể thao", "bóng chuyền", "bốn lần", "một tuần", "bãi biển", "bạn bè", "sảng khoái", "năng lượng", "tràn đầy", "thỉnh thoảng", "lợi ích", "tăng cường", "sức khỏe", "cải thiện", "tâm trạng", "thường xuyên", "như thế nào", "có hay"];

        const uiStrings = {
            en: { 
                howToTitle: "HOW TO PLAY / CÁCH CHƠI", 
                step1: "View the answer about sports / Xem câu trả lời về thể thao.", 
                step2: "Drag the correct 'Question' into the box / Kéo câu hỏi đúng vào khung trống.", 
                step3: "Hover over keywords to see meaning / Di chuột vào từ khóa để xem nghĩa.", 
                btnStart: "START GAME", 
                round: "ROUND", 
                dropZone: "Drag question here...", 
                next: "NEXT ROUND →", 
                r9Title: "ROUND REVIEW" 
            },
            ru: { 
                howToTitle: "КАК ИГРАТЬ / CÁCH CHƠI", 
                step1: "Посмотрите ответ о спорте / Xem câu trả lời về thể thao.", 
                step2: "Перетащите правильный вопрос в поле / Kéo câu hỏi đúng vào khung trống.", 
                step3: "Наведите на ключевые слова, чтобы увидеть смысл / Di chuột vào từ khóa để xem nghĩa.", 
                btnStart: "НАЧАТЬ ИГРУ", 
                round: "РАУНД", 
                dropZone: "Перетащите вопрос сюда...", 
                next: "СЛЕДУЮЩИЙ →", 
                r9Title: "ОБЗОР РАУНДА" 
            }
        };

        let currentRound = 0, userLang = 'en', roundSolved = false, isDragging = false, draggedElement = null, offset = { x: 0, y: 0 };

        function initApp() { setLang('en'); }

        function setLang(l) {
            userLang = l;
            document.getElementById('lang-en').className = \`flex-1 py-2 rounded-xl font-bold text-xs \${l === 'en' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}\`;
            document.getElementById('lang-ru').className = \`flex-1 py-2 rounded-xl font-bold text-xs \${l === 'ru' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}\`;
            updateUILanguage();
        }

        function updateUILanguage() {
            const s = uiStrings[userLang];
            document.getElementById('ui-how-to-title').innerHTML = \`<span>⚽</span> \${s.howToTitle}\`;
            document.getElementById('ui-step-1').innerText = s.step1;
            document.getElementById('ui-step-2').innerText = s.step2;
            document.getElementById('ui-step-3').innerText = s.step3;
            document.getElementById('ui-btn-start').innerText = s.btnStart;
        }

        function startGame() {
            document.getElementById('start-overlay').classList.add('hidden');
            document.getElementById('game-header').classList.remove('hidden');
            currentRound = 0;
            loadRound();
        }

        function speak(t) {
            return new Promise(resolve => {
                const u = \`https://translate.google.com/translate_tts?ie=UTF-8&q=\${encodeURIComponent(t)}&tl=vi&client=tw-ob\`;
                const a = new Audio(u);
                a.onended = resolve;
                a.onerror = resolve;
                a.play();
            });
        }

        function renderSpeakableText(text) {
            let words = text.split(' ');
            let result = [];
            for (let i = 0; i < words.length; i++) {
                let found = false;
                for (let j = 3; j >= 1; j--) {
                    let phrase = words.slice(i, i + j).join(' ').toLowerCase().replace(/[?.!,]/g, '');
                    if (compoundWords.includes(phrase)) {
                        let actualPhrase = words.slice(i, i + j).join(' ');
                        result.push(\`<span class="word-chip" onclick="event.stopPropagation(); speak('\${actualPhrase}')">\${actualPhrase}</span>\`);
                        i += (j - 1);
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    let word = words[i];
                    result.push(\`<span class="word-chip" onclick="event.stopPropagation(); speak('\${word}')">\${word}</span>\`);
                }
            }
            return result.join(' ');
        }

        function renderSmartText(fullText, keyText, id) {
            if (!keyText) return fullText;
            const regex = new RegExp(\`(\${keyText})\`, 'gi');
            return fullText.replace(regex, \`<span class="smart-word group-\${id}" onmouseenter="setHighlight('group-\${id}', true)" onmouseleave="setHighlight('group-\${id}', false)" onclick="setHighlight('group-\${id}', true); setTimeout(() => setHighlight('group-\${id}', false), 1000)">\$1</span>\`);
        }

        window.setHighlight = function(className, isActive) {
            const els = document.querySelectorAll('.' + className);
            els.forEach(el => {
                if (isActive) el.classList.add('smart-active');
                else el.classList.remove('smart-active');
            });
        }

        function loadRound() {
            roundSolved = false;
            const s = uiStrings[userLang];
            document.getElementById('next-round-btn').classList.remove('enabled');
            document.getElementById('round-title').innerText = \`\${s.round} \${currentRound + 1}/\${sportData.length}\`;
            document.getElementById('progress-bar').style.width = \`\${((currentRound + 1) / sportData.length) * 100}%\`;
            
            const list = document.getElementById('bubble-list');
            list.innerHTML = '';
            const data = sportData[currentRound];
            
            const dropZone = document.createElement('div');
            dropZone.className = 'drop-zone';
            dropZone.id = 'drop-target';
            dropZone.innerText = s.dropZone;

            const ansBubble = document.createElement('div');
            ansBubble.className = 'bubble bubble-ella-quest';
            ansBubble.innerHTML = \`
                <div class="flex items-start gap-4">
                    <div class="mini-speaker" onclick="speak('\${data.ans}')">
                        <svg class="w-4 h-4 text-pink-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217z"/></svg>
                    </div>
                    <div>
                        <div class="text-sm font-bold text-slate-800 leading-relaxed">\${renderSpeakableText(data.ans)}</div>
                        <p class="text-[11px] text-pink-400 italic font-semibold mt-1">\${userLang === 'en' ? data.ansTrans.en : data.ansTrans.ru}</p>
                    </div>
                </div>
            \`;

            list.appendChild(dropZone);
            list.appendChild(ansBubble);
            renderDraggables();
        }

        function renderDraggables() {
            const container = document.getElementById('floating-box');
            container.innerHTML = '';
            const data = sportData[currentRound];
            let items = [
                { text: data.q, correct: true, trans: userLang === 'en' ? data.en : data.ru },
                ...data.distractors.map(d => ({ text: d.vi, correct: false, trans: userLang === 'en' ? d.trans.en : d.trans.ru }))
            ].sort(() => Math.random() - 0.5);

            items.forEach((item, idx) => {
                const el = document.createElement('div');
                el.className = 'draggable-item';
                el.dataset.correct = item.correct;
                el.style.left = \`\${10 + (idx * 30)}%\`;
                el.style.top = \`\${65 + (Math.random() * 5)}%\`;
                
                let contentHTML = '';
                if (item.correct) {
                    const highlightID = \`hl-\${currentRound}\`;
                    const smartQ = renderSmartText(item.text, data.keywords.vi, highlightID);
                    const smartTrans = renderSmartText(item.trans, userLang === 'en' ? data.keywords.en : data.keywords.ru, highlightID);
                    contentHTML = \`
                        <p class="text-sm font-black text-indigo-700 pointer-events-none">\${smartQ}</p>
                        <p class="text-[10px] text-slate-400 font-bold mt-1 pointer-events-none">\${smartTrans}</p>
                    \`;
                } else {
                    contentHTML = \`
                        <p class="text-sm font-black text-indigo-700 pointer-events-none">\${item.text}</p>
                        <p class="text-[10px] text-slate-400 font-bold mt-1 pointer-events-none">\${item.trans}</p>
                    \`;
                }
                el.innerHTML = contentHTML;
                el.addEventListener('mousedown', startDrag);
                el.addEventListener('touchstart', startDrag, { passive: false });
                container.appendChild(el);
            });
        }

        function startDrag(e) {
            if (roundSolved) return;
            if (e.target.classList.contains('smart-word')) return;
            isDragging = true;
            draggedElement = e.currentTarget;
            draggedElement.style.animation = 'none';
            draggedElement.style.zIndex = '1000';
            const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
            const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
            const rect = draggedElement.getBoundingClientRect();
            offset.x = clientX - rect.left;
            offset.y = clientY - rect.top;
            document.addEventListener('mousemove', moveDrag);
            document.addEventListener('touchmove', moveDrag, { passive: false });
            document.addEventListener('mouseup', stopDrag);
            document.addEventListener('touchend', stopDrag);
        }

        function moveDrag(e) {
            if (!isDragging) return;
            e.preventDefault();
            const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
            const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
            draggedElement.style.left = \`\${clientX - offset.x}px\`;
            draggedElement.style.top = \`\${clientY - offset.y}px\`;
            const dropZone = document.getElementById('drop-target');
            const dropRect = dropZone.getBoundingClientRect();
            if (clientX > dropRect.left && clientX < dropRect.right && clientY > dropRect.top && clientY < dropRect.bottom) {
                dropZone.classList.add('active');
            } else {
                dropZone.classList.remove('active');
            }
        }

        function stopDrag() {
            if (!isDragging) return;
            isDragging = false;
            const dropZone = document.getElementById('drop-target');
            if (!dropZone) return;
            const dropRect = dropZone.getBoundingClientRect();
            const rect = draggedElement.getBoundingClientRect();
            const cx = rect.left + rect.width/2;
            const cy = rect.top + rect.height/2;

            if (cx > dropRect.left && cx < dropRect.right && cy > dropRect.top && cy < dropRect.bottom && draggedElement.dataset.correct === "true") {
                solveRound();
            } else {
                draggedElement.style.animation = 'float-anim 4s ease-in-out infinite';
            }
            dropZone.classList.remove('active');
            document.removeEventListener('mousemove', moveDrag);
            document.removeEventListener('touchmove', moveDrag);
            document.removeEventListener('mouseup', stopDrag);
            document.removeEventListener('touchend', stopDrag);
        }

        async function solveRound() {
            roundSolved = true;
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
            const data = sportData[currentRound];
            
            const qBubble = document.createElement('div');
            qBubble.className = 'bubble bubble-user-ans';
            const highlightID = \`hl-solved-\${currentRound}\`;
            
            const smartQ = renderSmartText(data.q, data.keywords.vi, highlightID);
            const speakableSmartQ = renderSpeakableTextForSolved(smartQ);

            const smartTrans = renderSmartText((userLang === 'en' ? data.en : data.ru), (userLang === 'en' ? data.keywords.en : data.keywords.ru), highlightID);

            qBubble.innerHTML = \`
                <div class="flex items-start gap-4">
                    <div class="mini-speaker bg-indigo-500 border-indigo-600" onclick="speak('\${data.q}')">
                        <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217z"/></svg>
                    </div>
                    <div>
                        <div class="text-sm font-bold leading-relaxed text-indigo-900">\${speakableSmartQ}</div>
                        <div class="text-xs text-indigo-400 italic font-semibold mt-1">\${smartTrans}</div>
                    </div>
                </div>
            \`;
            const dropTarget = document.getElementById('drop-target');
            if(dropTarget) dropTarget.replaceWith(qBubble);
            document.getElementById('floating-box').innerHTML = '';
            document.getElementById('next-round-btn').classList.add('enabled');

            await speak(data.q);
            await new Promise(r => setTimeout(r, 600));
            await speak(data.ans);
        }

        function renderSpeakableTextForSolved(htmlText) {
            const parts = htmlText.split(/(<span.*?<\\/span>)/g);
            return parts.map(part => {
                if (part.startsWith('<span')) return part;
                return renderSpeakableText(part);
            }).join('');
        }

        function nextRound() {
            if (currentRound < sportData.length - 1) { currentRound++; loadRound(); }
            else { openReview(); }
        }

        function skipRound() { nextRound(); }
        function prevRound() { if (currentRound > 0) { currentRound--; loadRound(); } }

        function openReview() {
            document.getElementById('game-header').classList.add('hidden');
            document.getElementById('round-9-page').classList.remove('hidden');
            const list = document.getElementById('review-list');
            list.innerHTML = sportData.map(d => \`
                <div class="p-5 bg-white rounded-3xl mb-4 shadow-sm border border-slate-200">
                    <div class="flex items-start gap-3 mb-4">
                        <div class="mini-speaker bg-indigo-50 border-indigo-200" onclick="speak('\${d.q}')">
                            <svg class="w-3.5 h-3.5 text-indigo-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217z"/></svg>
                        </div>
                        <div>
                            <p class="text-indigo-800 font-black text-sm mb-1">\${renderSpeakableText(d.q)}</p>
                            <p class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">\${userLang === 'en' ? d.en : d.ru}</p>
                        </div>
                    </div>
                    <div class="pt-4 border-t border-slate-100 flex items-start gap-3">
                        <div class="mini-speaker bg-pink-50 border-pink-200" onclick="speak('\${d.ans}')">
                            <svg class="w-3.5 h-3.5 text-pink-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217z"/></svg>
                        </div>
                        <div>
                            <p class="text-slate-800 font-bold text-sm mb-1">\${renderSpeakableText(d.ans)}</p>
                            <p class="text-[10px] text-pink-400 font-bold uppercase tracking-wider">\${userLang === 'en' ? d.ansTrans.en : d.ansTrans.ru}</p>
                        </div>
                    </div>
                </div>
            \`).join('');
        }

        async function listenAllInReview() {
            for(let d of sportData) {
                await speak(d.q);
                await new Promise(r => setTimeout(r, 400));
                await speak(d.ans);
                await new Promise(r => setTimeout(r, 800));
            }
        }

        function restartGame() {
            document.getElementById('round-9-page').classList.add('hidden');
            startGame();
        }
    </script>
</body>
</html>
`;

export const GameSportsMakeQuestion: React.FC = () => {
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
                    title="Make Question Game - Sports & Exercise"
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

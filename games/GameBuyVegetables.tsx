import React, { useState, useEffect } from 'react';

const gameHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Speak Viet : Buy Vegetables Nha Trang</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@400;600;700&display=swap');

        body {
            font-family: 'Quicksand', sans-serif;
            background: linear-gradient(135deg, #fef3c7 0%, #fff7ed 100%);
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            margin: 0;
            overflow: hidden;
        }

        ::-webkit-scrollbar { display: none; }
        * { -ms-overflow-style: none; scrollbar-width: none; }

        .game-card {
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
            transition: background-image 0.5s ease-in-out;
        }

        .overlay {
            position: absolute;
            inset: 0;
            background: rgba(255, 255, 255, 0.1); 
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
            background: rgba(255, 255, 255, 0.95);
            padding: 32px 24px;
            border-radius: 2rem;
            box-shadow: 0 10px 40px rgba(0,0,0,0.1);
            border: 1px solid white;
            display: flex;
            flex-direction: column;
            align-items: center;
            max-width: 520px;
            width: 100%;
        }

        .logo-container {
            margin-bottom: 1rem;
            animation: bounce 2s infinite;
        }
        @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
        }

        #game-header {
            flex-shrink: 0;
            background: rgba(255, 255, 255, 0.9);
            border-bottom: 1px solid #e5e7eb;
            padding: 0.8rem 1rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
            z-index: 100;
            position: relative;
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
            gap: 1rem;
            max-width: 650px;
            margin: 0 auto; 
            width: 100%;
            padding: 4.5cm 1.5rem 0 1.5rem; 
            position: relative;
            z-index: 20;
            overflow-y: auto;
            scroll-behavior: smooth;
        }

        .bubble-wrapper {
            display: flex;
            align-items: flex-start;
            gap: 12px;
            width: 100%;
            transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
            padding: 8px;
            border-radius: 1.5rem;
            position: relative;
        }

        .bubble-wrapper.speaking-active {
            transform: scale(1.05);
            z-index: 100;
        }

        .bubble-wrapper.speaking-active .bubble {
            box-shadow: 0 15px 40px rgba(245, 158, 11, 0.4);
            border-color: #f59e0b !important;
            background: #fffbeb;
        }

        .speaker-group {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 4px;
        }

        .speaker-btn {
            background: #f59e0b;
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
            border: none;
        }
        
        .speaker-btn.user-gender-btn { background: #0369a1; }
        .speaker-btn.ella-voice-btn { background: #b45309; }

        .speed-btn {
            font-size: 8px;
            font-weight: 800;
            background: #fef3c7;
            color: #92400e;
            padding: 2px 4px;
            border-radius: 4px;
            border: 1px solid #fde68a;
            cursor: pointer;
            transition: all 0.2s;
            min-width: 45px;
            text-align: center;
        }

        .bubble {
            padding: 0.8rem 1.2rem;
            border-radius: 1.2rem;
            max-width: 85%;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15); 
            background: rgba(255, 255, 255, 0.95);
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            position: relative;
            border: 2px solid transparent;
        }

        .bubble-ella-quest { color: #92400e; border-left: 4px solid #f59e0b; }
        .bubble-user-ans { color: #0369a1; border-right: 4px solid #0369a1; min-width: 200px;}

        .main-text { font-size: 1.1rem; font-weight: 800; margin-bottom: 2px; display: block; }
        .sub-text { font-size: 0.8rem; opacity: 0.7; font-style: italic; display: block; }

        .input-area-v2 {
            background: rgba(255, 255, 255, 0.9);
            padding: 0.8rem 1rem;
            border-radius: 1.2rem;
            border: 2px solid #0369a1;
            margin-top: 10px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            width: fit-content;
            max-width: 100%;
        }

        .sample-text {
            font-weight: 800;
            color: #0369a1;
            font-size: 1rem;
            margin-bottom: 2px;
        }

        .sample-sub {
            font-size: 0.75rem;
            color: #64748b;
            font-style: italic;
            margin-bottom: 8px;
        }

        .small-input {
            width: 120px;
            border: 2px solid #cbd5e1;
            padding: 6px 10px;
            border-radius: 8px;
            font-weight: 700;
            font-size: 0.9rem;
            outline: none;
            transition: border-color 0.2s;
        }

        .small-input:focus { border-color: #0369a1; }

        .btn-send-mini {
            background: #0369a1;
            color: white;
            width: 36px;
            height: 36px;
            border-radius: 8px;
            font-weight: 800;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.1s;
        }
        .btn-send-mini:active { transform: scale(0.9); }

        .drop-zone {
            border: 2px dashed #0369a1;
            border-radius: 12px;
            padding: 20px;
            text-align: center;
            background: rgba(3, 105, 161, 0.1);
            min-height: 60px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #0369a1;
            font-weight: 700;
            font-size: 0.9rem;
            transition: all 0.2s;
        }

        .float-sentences-container {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-top: 12px;
            justify-content: center;
        }

        .float-sentence {
            background: white;
            border: 2px solid #0369a1;
            color: #0369a1;
            padding: 8px 12px;
            border-radius: 20px;
            font-weight: 800;
            font-size: 0.85rem;
            cursor: grab;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            transition: all 0.2s;
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        .hidden { display: none !important; }
        .toggle-btn { flex: 1; padding: 10px; border-radius: 10px; font-weight: 700; background: #f1f5f9; border: 2px solid transparent; }
        .toggle-btn.active { background: #fef3c7; color: #92400e; border-color: #f59e0b; }
        
        .status-msg { font-size: 9px; font-weight: bold; color: #0369a1; margin-top: 5px; }

        .choice-container {
            display: flex;
            gap: 12px;
            margin-top: 15px;
            justify-content: center;
            width: 100%;
        }
        .btn-choice {
            flex: 1;
            padding: 12px;
            border-radius: 12px;
            font-weight: 800;
            text-transform: uppercase;
            transition: all 0.2s;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .btn-yes { background: #10b981; color: white; }
        .btn-no { background: #ef4444; color: white; }
        
        #api-loading {
            position: absolute;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0,0,0,0.7);
            color: white;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 10px;
            z-index: 500;
        }
    </style>
</head>
<body onload="initGame()">

    <div class="game-card" id="main-card">
        <!-- Start Screen -->
        <div id="start-overlay" class="overlay">
            <div class="start-content-box">
                <div class="logo-container">
                    <svg width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="50" cy="55" r="35" fill="#EF4444"/>
                        <path d="M50 20C50 20 52 10 60 10" stroke="#059669" stroke-width="6" stroke-linecap="round"/>
                        <path d="M50 20L45 15" stroke="#059669" stroke-width="4" stroke-linecap="round"/>
                    </svg>
                </div>
                
                <h1 id="start-title" class="text-3xl font-black text-amber-900 mb-1 uppercase tracking-tighter">Speak Viet : Buy Vegetables</h1>
                <p id="start-subtitle" class="text-amber-600 font-bold text-sm mb-6">Nha Trang Market Edition 🍎</p>
                
                <div class="w-full flex gap-4 mb-6">
                    <div class="flex-1">
                        <p id="label-lang" class="text-[10px] font-bold text-gray-400 uppercase mb-2 tracking-widest text-left">LANGUAGE</p>
                        <div class="flex gap-2">
                            <button id="lang-en" onclick="setLang('en')" class="toggle-btn active">🇬🇧 EN</button>
                            <button id="lang-ru" onclick="setLang('ru')" class="toggle-btn">🇷🇺 RU</button>
                        </div>
                    </div>
                    <div class="flex-1">
                        <p id="label-gender" class="text-[10px] font-bold text-gray-400 uppercase mb-2 tracking-widest text-left">USER GENDER</p>
                        <div class="flex gap-2">
                            <button id="gender-male" onclick="setGender('male')" class="toggle-btn active">♂️ MALE</button>
                            <button id="gender-female" onclick="setGender('female')" class="toggle-btn">♀️ FEMALE</button>
                        </div>
                    </div>
                </div>

                <div class="bg-gray-50 border border-gray-200 rounded-2xl p-4 w-full mb-6 text-left" id="instructions"></div>

                <button id="btn-start" onclick="startGame()" class="w-full py-4 bg-amber-600 text-white rounded-full font-bold text-xl shadow-lg hover:bg-amber-700 active:scale-95 transition-all uppercase">START</button>
            </div>
        </div>

        <!-- Header -->
        <div id="game-header">
            <div class="flex items-center gap-3">
                <button id="btn-back" onclick="goPrev()" class="p-2 rounded-full border hover:bg-gray-100"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="3"><polyline points="15 18 9 12 15 6"></polyline></svg></button>
                <div class="flex items-center gap-2">
                    <svg width="24" height="24" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="50" cy="55" r="35" fill="#EF4444"/>
                        <path d="M50 20C50 20 52 10 60 10" stroke="#059669" stroke-width="8" stroke-linecap="round"/>
                    </svg>
                    <div>
                        <h1 class="text-[10px] font-bold text-amber-500 uppercase">NHA TRANG MARKET</h1>
                        <h2 id="round-title" class="text-sm font-bold text-gray-800">Round 1/6</h2>
                    </div>
                </div>
            </div>
            
            <div id="center-tools" class="hidden flex gap-2">
                <button id="btn-listen-all" onclick="toggleListenAll()" class="hidden bg-orange-600 text-white px-4 py-1.5 rounded-lg font-bold text-xs uppercase shadow-md flex items-center gap-2">
                    <span id="listen-icon">▶</span> <span id="listen-text">LISTEN ALL</span>
                </button>
                <button id="btn-listen-round" onclick="listenCurrentRound()" class="bg-amber-500 text-white px-4 py-1.5 rounded-lg font-bold text-xs uppercase shadow-md flex items-center gap-2">
                    <span>🔊</span> <span>LISTEN</span>
                </button>
                <button id="btn-play-again" onclick="location.reload()" class="hidden bg-gray-800 text-white px-4 py-1.5 rounded-lg font-bold text-xs uppercase shadow-md">PLAY AGAIN</button>
                <button id="btn-next-round" onclick="goNext()" class="bg-emerald-500 text-white px-6 py-1.5 rounded-lg font-bold text-xs uppercase shadow-md">NEXT</button>
            </div>

            <div class="flex items-center gap-3">
                <div class="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div id="progress-bar" class="h-full bg-amber-500 transition-all duration-500" style="width: 14%"></div>
                </div>
                <button id="btn-forward" onclick="goNext()" class="p-2 rounded-full border hover:bg-gray-100"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="3"><polyline points="9 18 15 12 9 6"></polyline></svg></button>
            </div>
        </div>

        <!-- Scene Area -->
        <div class="scene-container">
            <div id="bubble-area" class="bubble-container"></div>
            <div id="api-loading" class="hidden">Đang xử lý dữ liệu...</div>
        </div>

        <!-- Win Screen -->
        <div id="win-overlay" class="overlay hidden">
            <div class="text-7xl mb-4">🍎</div>
            <h2 id="win-text" class="text-3xl font-black text-amber-600 mb-8 uppercase">COMPLETED!</h2>
            <button id="btn-replay" onclick="location.reload()" class="px-12 py-4 bg-amber-600 text-white rounded-full font-bold text-xl uppercase">REPLAY</button>
        </div>
    </div>

    <script>
        // Fruits Database
        const fruitPrices = [
            { name: "xoài", price: 40, unit: "ký" },
            { name: "cam", price: 45, unit: "ký" },
            { name: "bưởi", price: 50, unit: "ký" },
            { name: "chuối", price: 20, unit: "nải" },
            { name: "ổi", price: 20, unit: "ký" },
            { name: "dưa hấu", price: 15, unit: "ký" },
            { name: "sầu riêng", price: 125, unit: "ký" },
            { name: "dừa", price: 15, unit: "trái" },
            { name: "cà chua", price: 25, unit: "ký" },
            { name: "dưa leo", price: 15, unit: "ký" },
            { name: "bắp cải", price: 20, unit: "ký" }
        ];

        let state = {
            lang: 'en',
            gender: 'male', 
            round: 0,
            reviewDialogs: [], 
            fruitInput: "",
            kilos: "",
            isListeningAll: false,
            currentReviewIndex: 0,
            reviewAudio: null,
            realtimePrice: null,
            currentPrice: 50, 
            currentUnit: "ký"
        };

        const i18n = {
            en: {
                startTitle: "Speak Viet : Buy Vegetables",
                btnStart: "START",
                step1: "Listen to the Seller.",
                step2: "Type in your choice.",
                step3: "AI will continue the flow.",
                round: "Round",
                btnSubmit: "➜",
                translating: "Dịch nhanh...",
                sampleRound1: "I want to buy ...",
                sampleRound2: "I buy ... kilo(s)",
                placeholderR1: "fruit",
                placeholderR2: "kilo"
            },
            ru: {
                startTitle: "Speak Viet : Купить Овощи",
                btnStart: "НАЧАТЬ",
                step1: "Слушайте продавца.",
                step2: "Введите выбор.",
                step3: "AI продолжит.",
                round: "Раунд",
                btnSubmit: "➜",
                translating: "Перевод...",
                sampleRound1: "Я хочу купить ...",
                sampleRound2: "Я покупаю ... кг",
                placeholderR1: "плод",
                placeholderR2: "кг"
            }
        };

        const gameFlow = [
            { id: 1, q: "Xin chào! Bạn muốn mua gì hôm nay?", type: "v2-input", saveAs: "fruitInput", en: "Hello! What would you like to buy today?", ru: "Привет! Что бы вы хотели купить сегодня?" },
            { id: 2, dynamicQ: (s) => \`\${getFruitData(s.fruitInput).name} rất tươi và ngon. Bạn mua mấy ký?\`, type: "v2-input", saveAs: "kilos", en: "It's fresh and delicious. How many kilos?", ru: "Оно очень свежее и вкусное. Сколько килограммов?" },
            { id: 3, userFirst: true, a: "Bao nhiêu tiền một ký vậy?", aSub: {en: "How much is one kilo?", ru: "Сколько стоит один килограмм?"}, 
                dynamicQ: (s) => {
                    const f = getFruitData(s.fruitInput);
                    state.currentPrice = f.price;
                    state.currentUnit = f.unit;
                    return \`\${f.price} nghìn một \${f.unit} nha.\`;
                }, 
                type: "drag",
                en: "Price is {X}k.", ru: "Цена {X}к.",
                options: [
                    {text: "Hơi đắt! Bớt chút nha!", en: "A bit expensive! Lower it please!", ru: "Немного дорого! Сбавьте цену!"},
                    {text: "Bớt chút thì tôi mua.", en: "If you lower it, I'll buy.", ru: "Если вы giảm, я sẽ mua."},
                    {text: "Giảm giá chút được không?", en: "Can you give a discount?", ru: "Можете сделать скидку?"}
                ]
            },
            { id: 4, dynamicQ: (s) => { 
                const kStr = s.kilos.replace(/\\D/g, '');
                const k = parseInt(kStr) || 1;
                const total = state.currentPrice * k;
                return \`Tổng hết \${total} nghìn.\`; 
            }, a: "Tiền đây nha", aSub: {en: "Here is the money.", ru: "Вот деньги."}, type: "auto", en: "Total is {X}k.", ru: "Всего {X}к." },
            { id: 5, q: "Tiền thừa của bạn đây.", a: "Không cần trả lại", aSub: {en: "No need for change.", ru: "Сдачи không надо."}, type: "auto", en: "Here is your change.", ru: "Вот ваша сдача." },
            { id: 6, q: "Cảm ơn! Xin chào và hẹn gặp lại!", type: "drag", en: "Thanks! See you again!", ru: "Спасибо! До свидания!", 
              options: [
                {text: "Tạm biệt! Hẹn gặp lại!", en: "Bye! See you!", ru: "Пока! Увидимся!"},
                {text: "Tuần sau mình qua mua tiếp.", en: "I'll buy more next week.", ru: "На следующей неделе куплю еще."},
                {text: "Chào nha!", en: "Bye!", ru: "Пока!"}
              ] 
            }
        ];

        async function translateText(text, targetLang = 'vi') {
            try {
                const url = \`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=\${targetLang}&dt=t&q=\${encodeURIComponent(text)}\`;
                const response = await fetch(url);
                const data = await response.json();
                return data[0][0][0];
            } catch (e) {
                console.error("Translation Error", e);
                return text;
            }
        }

        function extractFruitName(text) {
            const normalizedText = text.toLowerCase();
            const keywords = ["mua", "lấy", "cho", "cần", "muốn mua"];
            let name = text;
            for (const kw of keywords) {
                if (normalizedText.includes(kw)) {
                    const parts = normalizedText.split(kw);
                    if (parts.length > 1) {
                        name = parts[1].trim();
                        break;
                    }
                }
            }
            return name.replace(/[.!?]/g, "") || "loại này";
        }

        function getFruitData(input) {
            const text = (input || "").toLowerCase();
            const found = fruitPrices.find(f => text.includes(f.name));
            const displayName = extractFruitName(input);
            if (found) {
                return { name: displayName, price: found.price, unit: found.unit };
            }
            return { name: displayName, price: 45, unit: "ký" };
        }

        function initGame() {
            updateUI();
            updateBackground();
        }

        function setLang(l) { state.lang = l; updateUI(); }
        function setGender(g) { state.gender = g; updateUI(); updateBackground(); }

        function updateBackground() {
            let imgId = state.gender === 'male' ? '109PYN7OT8wZHV2LtceYSSKf0IppGK3iY' : '1wODxs_MbuXLlv4k5jb8mQsGg9-LSR3VL';
            const imgUrl = \`https://lh3.googleusercontent.com/d/\${imgId}=w900\`;
            document.getElementById('main-card').style.backgroundImage = \`url('\${imgUrl}')\`;
        }

        function updateUI() {
            const t = i18n[state.lang];
            document.getElementById('start-title').innerText = t.startTitle;
            document.getElementById('instructions').innerHTML = \`
                <div class="flex gap-3 mb-2"><span class="w-5 h-5 bg-amber-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span><p class="text-xs font-semibold">\${t.step1}</p></div>
                <div class="flex gap-3 mb-2"><span class="w-5 h-5 bg-amber-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span><p class="text-xs font-semibold">\${t.step2}</p></div>
                <div class="flex gap-3"><span class="w-5 h-5 bg-amber-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span><p class="text-xs font-semibold">\${t.step3}</p></div>
            \`;
            document.getElementById('lang-en').className = state.lang === 'en' ? 'toggle-btn active' : 'toggle-btn';
            document.getElementById('lang-ru').className = state.lang === 'ru' ? 'toggle-btn active' : 'toggle-btn';
            document.getElementById('gender-male').className = state.gender === 'male' ? 'toggle-btn active' : 'toggle-btn';
            document.getElementById('gender-female').className = state.gender === 'female' ? 'toggle-btn active' : 'toggle-btn';
        }

        async function startGame() {
            document.getElementById('start-overlay').classList.add('hidden');
            loadRound();
        }

        async function loadRound() {
            stopListenAll();
            if (state.round === gameFlow.length) {
                renderReviewRound();
                return;
            }
            const data = gameFlow[state.round];
            if (!data) return;
            document.getElementById('round-title').innerText = \`\${i18n[state.lang].round} \${state.round + 1}/\${gameFlow.length}\`;
            document.getElementById('progress-bar').style.width = \`\${((state.round + 1) / gameFlow.length) * 100}%\`;
            document.getElementById('center-tools').classList.add('hidden');
            const area = document.getElementById('bubble-area');
            area.innerHTML = ''; 

            if (data.userFirst) {
                // Sequential reading logic: Line 1 -> End -> Wait 0.5s -> Line 2
                const sub = data.aSub ? data.aSub[state.lang] : "...";
                const bUser = renderBubble(data.a, sub, 'user');
                saveToReview(data.a, sub, 'user');
                
                await speakViet(data.a, 'user', bUser, () => {
                    // Line 1 finished, wait 0.5s before showing/reading Line 2
                    setTimeout(async () => {
                        let qText = data.dynamicQ ? data.dynamicQ(state) : data.q;
                        let subQ = data[state.lang];
                        const bAI = renderBubble(qText, subQ, 'ai');
                        saveToReview(qText, subQ, 'ai');
                        await speakViet(qText, 'ai', bAI, () => {
                            if (data.id === 3 && data.type === 'drag') renderDragArea(data.options);
                        });
                        document.getElementById('center-tools').classList.remove('hidden');
                    }, 500); // Wait 0.5s
                });
            } else {
                let qText = data.dynamicQ ? data.dynamicQ(state) : data.q;
                let subQ = data[state.lang];
                const bAI = renderBubble(qText, subQ, 'ai');
                saveToReview(qText, subQ, 'ai');
                
                await speakViet(qText, 'ai', bAI, () => {
                    // AI finished speaking
                    if (data.type === 'v2-input') {
                        renderV2InputArea(data.id, data.saveAs);
                    } else if (data.type === 'auto') {
                        // Wait 0.5s after AI finishes before User line appears
                        setTimeout(async () => {
                            const sub = data.aSub ? data.aSub[state.lang] : "...";
                            const bUser = renderBubble(data.a, sub, 'user');
                            saveToReview(data.a, sub, 'user');
                            await speakViet(data.a, 'user', bUser);
                            document.getElementById('center-tools').classList.remove('hidden');
                        }, 500);
                    } else if (data.type === 'drag') {
                        renderDragArea(data.options);
                    }
                });
            }
        }

        function renderV2InputArea(id, saveAs) {
            const area = document.getElementById('bubble-area');
            const div = document.createElement('div');
            div.className = 'input-area-v2';
            
            const t = i18n[state.lang];
            const sampleText = id === 1 ? "Tôi muốn mua " : "Tôi mua ";
            const sampleSub = id === 1 ? t.sampleRound1 : t.sampleRound2;
            const placeholder = id === 1 ? t.placeholderR1 : t.placeholderR2;
            const unitSuffix = id === 2 ? " ký" : "";

            div.innerHTML = \`
                <div class="sample-text">\${sampleText} ...\${unitSuffix}</div>
                <div class="sample-sub">\${sampleSub}</div>
                <div class="flex items-center gap-2">
                    <input type="text" id="v2-input-field" class="small-input" placeholder="\${placeholder}" onkeydown="if(event.key==='Enter') submitV2Input('\${id}', '\${saveAs}')">
                    <button onclick="submitV2Input('\${id}', '\${saveAs}')" class="btn-send-mini">\${t.btnSubmit}</button>
                </div>
                <div id="translate-status" class="status-msg hidden">\${t.translating}</div>
            \`;
            area.appendChild(div);
            area.scrollTop = area.scrollHeight;
            setTimeout(() => document.getElementById('v2-input-field').focus(), 300);
        }

        async function submitV2Input(id, saveAs) {
            const input = document.getElementById('v2-input-field');
            const val = input.value.trim();
            if (!val) return;

            document.getElementById('translate-status').classList.remove('hidden');
            
            const prefix = (id == 1) ? "I want to buy " : "I buy ";
            const suffix = (id == 2) ? " kilos" : "";
            const fullInput = \`\${prefix}\${val}\${suffix}\`;
            
            const vnVal = await translateText(fullInput);
            state[saveAs] = vnVal;

            const areaInput = document.querySelector('.input-area-v2');
            if(areaInput) areaInput.remove();

            const bUser = renderBubble(vnVal, fullInput, 'user');
            saveToReview(vnVal, fullInput, 'user');
            await speakViet(vnVal, 'user', bUser);
            document.getElementById('center-tools').classList.remove('hidden');
        }

        function saveToReview(text, sub, role) {
            const exists = state.reviewDialogs.some(d => d.text === text && d.round === state.round);
            if(!exists) state.reviewDialogs.push({ text, sub, role, round: state.round });
        }

        function renderReviewRound() {
            document.getElementById('round-title').innerText = "Review All";
            const tools = document.getElementById('center-tools');
            tools.classList.remove('hidden');
            document.getElementById('btn-next-round').classList.add('hidden');
            document.getElementById('btn-listen-round').classList.add('hidden');
            document.getElementById('btn-listen-all').classList.remove('hidden');
            document.getElementById('btn-play-again').classList.remove('hidden');
            const area = document.getElementById('bubble-area');
            area.innerHTML = '';
            state.reviewDialogs.forEach((d, idx) => {
                const wrapper = renderBubble(d.text, d.sub, d.role);
                wrapper.id = \`review-item-\${idx}\`;
            });
            area.scrollTop = 0;
        }

        function renderBubble(text, sub, role) {
            const area = document.getElementById('bubble-area');
            const wrapper = document.createElement('div');
            wrapper.className = \`bubble-wrapper \${role==='user'?'flex-row-reverse':''}\`;
            wrapper.setAttribute('data-text', text);
            wrapper.setAttribute('data-role', role);
            wrapper.innerHTML = \`
                <div class="speaker-group">
                    <button class="speaker-btn \${role==='user'?'user-gender-btn':'ella-voice-btn'}" onclick="speakViet('\${text.replace(/'/g,"\\\\'")}', '\${role}', this.closest('.bubble-wrapper'))">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 5L6 9H2v6h4l5 4V5zM19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
                    </button>
                </div>
                <div class="bubble \${role==='ai'?'bubble-ella-quest':'bubble-user-ans'}">
                    <span class="main-text">\${text}</span>
                    <span class="sub-text">\${sub}</span>
                </div>
            \`;
            area.appendChild(wrapper);
            area.scrollTop = area.scrollHeight;
            return wrapper;
        }

        async function speakViet(text, role, el, onEndCallback) {
            if (el) el.classList.add('speaking-active');
            const url = \`https://translate.google.com/translate_tts?ie=UTF-8&q=\${encodeURIComponent(text)}&tl=vi&client=tw-ob&ttsspeed=0.6\`;
            const audio = new Audio(url);
            state.reviewAudio = audio; 
            audio.onended = () => { 
                if (el) el.classList.remove('speaking-active'); 
                if (onEndCallback) onEndCallback(); 
            };
            audio.play().catch(() => { if (onEndCallback) onEndCallback(); });
        }

        async function listenCurrentRound() {
            const bubbles = Array.from(document.querySelectorAll('#bubble-area .bubble-wrapper'));
            if (bubbles.length === 0) return;
            for (const bubble of bubbles) {
                const txt = bubble.getAttribute('data-text');
                const role = bubble.getAttribute('data-role');
                await new Promise(resolve => speakViet(txt, role, bubble, () => resolve()));
                await new Promise(r => setTimeout(r, 500)); // Half second pause between lines
            }
        }

        function toggleListenAll() { if (state.isListeningAll) stopListenAll(); else startListenAll(); }
        function startListenAll() { state.isListeningAll = true; state.currentReviewIndex = 0; updateListenUI(true); playReviewSequence(); }
        function stopListenAll() { state.isListeningAll = false; updateListenUI(false); if (state.reviewAudio) state.reviewAudio.pause(); document.querySelectorAll('.bubble-wrapper').forEach(el => el.classList.remove('speaking-active')); }

        function updateListenUI(isActive) {
            const icon = document.getElementById('listen-icon');
            const text = document.getElementById('listen-text');
            const btn = document.getElementById('btn-listen-all');
            if (isActive) { icon.innerText = "⏸"; text.innerText = "PAUSE"; btn.classList.replace('bg-orange-600', 'bg-red-600'); }
            else { icon.innerText = "▶"; text.innerText = "LISTEN ALL"; btn.classList.replace('bg-red-600', 'bg-orange-600'); }
        }

        async function playReviewSequence() {
            if (!state.isListeningAll || state.currentReviewIndex >= state.reviewDialogs.length) { stopListenAll(); return; }
            const dialog = state.reviewDialogs[state.currentReviewIndex];
            const el = document.getElementById(\`review-item-\${state.currentReviewIndex}\`);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                await speakViet(dialog.text, dialog.role, el, () => {
                    state.currentReviewIndex++;
                    setTimeout(() => playReviewSequence(), 500); // Wait 0.5s before next line in review
                });
            }
        }

        function renderDragArea(options) {
            const area = document.getElementById('bubble-area');
            const container = document.createElement('div');
            container.className = 'drag-selection-area w-full mt-4';
            container.innerHTML = \`
                <div class="drop-zone" ondragover="event.preventDefault()" ondrop="handleDrop(event)">THẢ VÀO ĐÂY</div>
                <div class="float-sentences-container">
                    \${options.map((opt, i) => \`<div class="float-sentence" draggable="true" ondragstart="event.dataTransfer.setData('text', '\${opt.text}')"><span>\${opt.text}</span></div>\`).join('')}
                </div>
            \`;
            area.appendChild(container);
            area.scrollTop = area.scrollHeight;
        }

        async function handleDrop(e) {
            const text = e.dataTransfer.getData('text');
            const currentRoundOptions = gameFlow[state.round].options;
            const opt = currentRoundOptions.find(o => o.text === text);
            const sub = opt ? opt[state.lang] : "...";
            const dragArea = document.querySelector('.drag-selection-area');
            if(dragArea) dragArea.remove();
            const bUser = renderBubble(text, sub, 'user');
            saveToReview(text, sub, 'user');
            await speakViet(text, 'user', bUser, () => {
                if (gameFlow[state.round].id === 3) {
                    setTimeout(() => renderSellerChoices(), 500);
                }
            });
            document.getElementById('center-tools').classList.remove('hidden');
        }

        function renderSellerChoices() {
            const area = document.getElementById('bubble-area');
            const container = document.createElement('div');
            container.className = 'choice-area w-full';
            container.innerHTML = \`<div class="choice-container"><button onclick="handleSellerChoice(true)" class="btn-choice btn-yes">YES</button><button onclick="handleSellerChoice(false)" class="btn-choice btn-no">NO</button></div>\`;
            area.appendChild(container);
            area.scrollTop = area.scrollHeight;
        }

        async function handleSellerChoice(isYes) {
            const choiceArea = document.querySelector('.choice-area');
            if(choiceArea) choiceArea.remove();
            let responseText = isYes ? \`Ok! Tôi giảm cho bạn còn \${state.currentPrice - 5} nghìn một \${state.currentUnit}.\` : "Không mắc đâu! Mình bán đúng giá đó!";
            let responseSub = isYes ? "Ok! I lower price for you." : "It's cheap, correct price!";
            const bAI = renderBubble(responseText, responseSub, 'ai');
            saveToReview(responseText, responseSub, 'ai');
            await speakViet(responseText, 'ai', bAI);
        }

        function goNext() { if(state.round < gameFlow.length) { state.round++; loadRound(); } else showWin(); }
        function goPrev() { if(state.round > 0){ state.round--; loadRound(); } }
        function showWin() { document.getElementById('win-overlay').classList.remove('hidden'); confetti({ particleCount: 150 }); }
    </script>
</body>
</html>
`;

export const GameBuyVegetables: React.FC = () => {
    const [iframeSrc, setIframeSrc] = useState<string | undefined>(undefined);
    
    useEffect(() => {
        const finalHtml = gameHTML.replace('const apiKey = "";', `const apiKey = "${process.env.API_KEY || ''}";`);
        const blob = new Blob([finalHtml], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        setIframeSrc(url);

        return () => {
            if (url) {
                URL.revokeObjectURL(url);
            }
        };
    }, []);

    if (!iframeSrc) {
        return <div className="w-full h-full flex items-center justify-center bg-slate-900 text-white">Loading Game...</div>;
    }

    return (
        <iframe
            src={iframeSrc}
            className="w-full h-full"
            style={{ border: 'none' }}
            allow="microphone; fullscreen"
            title="Speaking Challenge - Buy Vegetables"
        ></iframe>
    );
};

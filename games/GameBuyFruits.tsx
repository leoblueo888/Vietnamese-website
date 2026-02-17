import React, { useState, useEffect } from 'react';

const gameHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Speak Viet - buy fruit</title>
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

        /* Hide scrollbar */
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

        .input-area { width: 100%; margin-top: 10px; background: white; padding: 20px; border-radius: 1.5rem; border: 2px solid #e2e8f0; }

        .custom-input {
            border-bottom: 2px solid #0369a1;
            outline: none;
            padding: 0 8px;
            width: 120px;
            font-weight: 800;
            color: #0369a1;
            text-align: center;
        }

        .hidden { display: none !important; }
        .toggle-btn { flex: 1; padding: 10px; border-radius: 10px; font-weight: 700; background: #f1f5f9; border: 2px solid transparent; }
        .toggle-btn.active { background: #fef3c7; color: #92400e; border-color: #f59e0b; }
        
        .btn-confirm {
            background: #0369a1;
            color: white;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 800;
            margin-top: 15px;
            transition: all 0.2s;
            border: none;
            cursor: pointer;
        }
        .btn-confirm:active { transform: scale(0.9); }
        .btn-confirm.loading {
            animation: pulse-loading 1s infinite ease-in-out;
            pointer-events: none;
            opacity: 0.7;
        }

        @keyframes pulse-loading {
            0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(3, 105, 161, 0.4); }
            50% { transform: scale(1.1); box-shadow: 0 0 0 10px rgba(3, 105, 161, 0); }
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
                        <circle cx="40" cy="45" r="5" fill="white" fill-opacity="0.3"/>
                    </svg>
                </div>
                
                <h1 class="text-3xl font-black text-amber-900 mb-1 uppercase tracking-tighter">Speak Viet - buy fruit</h1>
                <p id="start-subtitle" class="text-amber-600 font-bold text-sm mb-6">Mua hoa quả - Người bán & Khách hàng 🍎</p>
                
                <div class="w-full flex gap-4 mb-6">
                    <div class="flex-1">
                        <p id="label-lang" class="text-[10px] font-bold text-gray-400 uppercase mb-2 tracking-widest text-left">LANGUAGE</p>
                        <div class="flex gap-2">
                            <button id="lang-en" onclick="setLang('en')" class="toggle-btn active">🇬🇧 EN</button>
                            <button id="lang-ru" onclick="setLang('ru')" class="toggle-btn">🇷🇺 RU</button>
                        </div>
                    </div>
                    <div class="flex-1">
                        <p id="label-gender" class="text-[10px] font-bold text-gray-400 uppercase mb-2 tracking-widest text-left">SELLER GENDER</p>
                        <div class="flex gap-2">
                            <button id="gender-male" onclick="setGender('male')" class="toggle-btn active">♂️ MALE</button>
                            <button id="gender-female" onclick="setGender('female')" class="toggle-btn">♀️ FEMALE</button>
                        </div>
                    </div>
                </div>

                <button id="btn-start" onclick="startGame()" class="w-full py-4 bg-amber-600 text-white rounded-full font-bold text-xl shadow-lg hover:bg-amber-700 active:scale-95 transition-all uppercase">START</button>
            </div>
        </div>

        <!-- Header -->
        <div id="game-header">
            <div class="flex items-center gap-3">
                <button onclick="goPrev()" class="p-2 rounded-full border hover:bg-gray-100"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="3"><polyline points="15 18 9 12 15 6"></polyline></svg></button>
                <div class="flex items-center gap-2">
                    <svg width="24" height="24" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="50" cy="55" r="35" fill="#EF4444"/>
                        <path d="M50 20C50 20 52 10 60 10" stroke="#059669" stroke-width="8" stroke-linecap="round"/>
                    </svg>
                    <div>
                        <h1 class="text-[10px] font-bold text-amber-500 uppercase tracking-widest">FRUIT MARKET</h1>
                        <h2 id="round-title" class="text-sm font-bold text-gray-800">Round 1/7</h2>
                    </div>
                </div>
            </div>
            
            <!-- Tool Area: Changes in Review Round -->
            <div id="center-tools" class="hidden flex gap-2">
                <button id="btn-listen-all" onclick="listenAllInRound()" class="p-2 rounded-full bg-amber-100 text-amber-700 hover:bg-amber-200 transition-colors shadow-sm" title="Listen All">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
                </button>
                <button id="btn-next-round" onclick="goNext()" class="bg-emerald-500 text-white px-6 py-1.5 rounded-lg font-bold text-xs uppercase shadow-md transition-all active:scale-95">NEXT</button>
            </div>

            <div class="flex items-center gap-3">
                <div class="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div id="progress-bar" class="h-full bg-amber-500 transition-all duration-500" style="width: 14%"></div>
                </div>
                <button onclick="goNext()" class="p-2 rounded-full border hover:bg-gray-100"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="3"><polyline points="9 18 15 12 9 6"></polyline></svg></button>
            </div>
        </div>

        <!-- Scene Area -->
        <div class="scene-container">
            <div id="bubble-area" class="bubble-container"></div>
        </div>
    </div>

    <script>
        const apiKey = ""; 
        const ttsAudio = new Audio();

        // Audio Engine function with Promise
        function speakWord(text) {
            return new Promise((resolve) => {
                const encodedText = encodeURIComponent(text);
                const url = \`https://translate.google.com/translate_tts?ie=UTF-8&q=\${encodedText}&tl=vi&client=tw-ob\`;
                ttsAudio.src = url;
                ttsAudio.onended = () => {
                    setTimeout(resolve, 500); // 0.5s pause after finishing
                };
                ttsAudio.play().catch(err => {
                    console.log("Audio play error:", err);
                    resolve();
                });
            });
        }

        // Translation Engine using Gemini
        async function translateWithGemini(text, targetLang = "Vietnamese") {
            try {
                const response = await fetch(\`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=\${apiKey}\`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: \`Translate this shopping sentence to \${targetLang} naturally. Output ONLY the translated text: "\${text}"\` }] }]
                    })
                });
                const data = await response.json();
                let translated = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || text;
                return translated.replace(/\\.+$/, "");
            } catch (error) {
                console.error("Translation error:", error);
                return text;
            }
        }

        // Helper to extract the fruit name from a sentence
        async function extractFruitName(sentence) {
             try {
                const response = await fetch(\`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=\${apiKey}\`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: \`Identify only the fruit name in this Vietnamese sentence and return only that word: "\${sentence}"\` }] }]
                    })
                });
                const data = await response.json();
                return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "Hoa quả";
            } catch (error) {
                return "Hoa quả";
            }
        }

        // Pricing logic based on Nha Trang market prices (k VND)
        async function getRealPrice(fruitVnName) {
            try {
                const response = await fetch(\`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=\${apiKey}\`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: \`Based on current local market prices in Nha Trang, Vietnam, what is the typical price per kilogram for "\${fruitVnName}" in thousands of Vietnamese Dong (k VND)? 
                        Example: if 35,000 VND, return 35. If 120,000 VND, return 120. 
                        Common prices: Durian (Sầu riêng) ~100-150, Mango (Xoài) ~25-45, Orange (Cam) ~30-45. 
                        Return ONLY the number.\` }] }]
                    })
                });
                const data = await response.json();
                const price = parseInt(data.candidates?.[0]?.content?.parts?.[0]?.text?.trim());
                return isNaN(price) ? 40 : price; // Default 40k if error
            } catch (error) {
                return 40;
            }
        }

        let state = {
            lang: 'en',
            gender: 'male',
            round: 0,
            history: [],
            fruitInput: "",
            fruitVN: "",
            kilos: 1,
            pricePerKilo: 40, 
            isTranslating: false,
            isListeningAll: false
        };

        const gameFlow = [
            { 
                id: 1, 
                q: "Xin chào ! Bạn muốn mua hoa quả gì hôm nay ?", 
                subQ: { en: "Hello! What fruit would you like to buy today?", ru: "Привет! Какие фрукты вы хотите купить сегодня?" }, 
                type: "input-custom",
                template: "Tôi muốn mua ",
                suffix: "",
                templateSub: { en: "I want to buy...", ru: "Я хочу купить..." },
                saveAs: "fruitInput" 
            },
            { 
                id: 2, 
                dynamicQ: (s) => {
                    return \`\${s.fruitVN || 'Hoa quả'} rất tươi và ngon . Bạn mua mấy ký ?\`;
                }, 
                subQ: { en: "It's very fresh and delicious. How many kilos do you want?", ru: "Оно очень свежее и вкусное. Сколько кг вы хотите?" }, 
                type: "input-custom",
                template: "Tôi mua ",
                suffix: " ký",
                templateSub: { en: "I buy ... kilos", ru: "Я покупаю ... кг" },
                saveAs: "kilos" 
            },
            { 
                id: 3, 
                dynamicQ: (s) => \`\${s.pricePerKilo} nghìn một ký nha .\`,
                a: "Bao nhiêu tiền một ký vậy ?",
                subQ: { en: (s) => \`It's \${s.pricePerKilo} thousand VND per kilo.\`, ru: (s) => \`\${s.pricePerKilo} тысяч донгов за килограмм.\` },
                subA: { en: "How much is it per kilo?", ru: "Сколько это стоит за килограмм?" },
                type: "auto-reversed"
            },
            { 
                id: 4, 
                dynamicQ: (s) => {
                    const total = s.pricePerKilo * (parseFloat(s.kilos) || 1);
                    return \`Tổng của bạn hết \${total} nghìn .\`;
                },
                a: "Tiền đây nha",
                subQ: { 
                    en: (s) => \`Your total is \${s.pricePerKilo * (parseFloat(s.kilos) || 1)} thousand VND.\`, 
                    ru: (s) => \`Ваш tổng составляет \${s.pricePerKilo * (parseFloat(s.kilos) || 1)} тысяч донгов.\` 
                },
                subA: { en: "Here is the money.", ru: "Вот деньги." },
                type: "auto"
            },
            { 
                id: 5, 
                q: "Tiền thừa của bạn đây .", 
                a: "Không cần trả lại",
                subQ: { en: "Here is your change.", ru: "Вот ваша сдача." },
                subA: { en: "Keep the change.", ru: "Sдачи không cần trả lại." },
                type: "auto"
            },
            { 
                id: 6, 
                q: "Cảm ơn ! Xin chào và hẹn gặp lại .", 
                subQ: { en: "Thank you! Goodbye and see you again.", ru: "Спасибо! До свидания и до новых встреч." }, 
                type: "auto",
                a: "Chào nha !",
                subA: { en: "Bye!", ru: "Пока!" }
            },
            {
                id: 7,
                type: "review",
                q: "Bài học kết thúc! Hãy nghe lại toàn bộ hội thoại nha.",
                subQ: { en: "Lesson finished! Let's listen to the whole conversation.", ru: "Урок окончен! Давайте послушаем весь разговор." }
            }
        ];

        function initGame() {
            updateBackground();
            updateUI();
        }

        function setLang(l) { state.lang = l; updateUI(); }
        function setGender(g) { state.gender = g; updateBackground(); }

        function updateBackground() {
            const maleImgId = '12fF8xYekHM2wUry3zUCHiYRYRWUeyUJx';
            const femaleImgId = '1IgiAwtVKzffnLZItwE5OQNwV4AQxuHcK';
            const img = state.gender === 'female' ? \`https://lh3.googleusercontent.com/d/\${femaleImgId}=w900\` : \`https://lh3.googleusercontent.com/d/\${maleImgId}=w900\`;
            document.getElementById('main-card').style.backgroundImage = \`url('\${img}')\`;
        }

        function updateUI() {
            const t = state.lang === 'en' ? "START" : "НАCHАТЬ";
            document.getElementById('btn-start').innerText = t;
        }

        function startGame() {
            document.getElementById('start-overlay').classList.add('hidden');
            loadRound();
        }

        async function loadRound() {
            const area = document.getElementById('bubble-area');
            area.innerHTML = '';
            
            const data = gameFlow[state.round];
            const maxRounds = gameFlow.length;
            document.getElementById('round-title').innerText = \`Round \${state.round + 1}/\${maxRounds}\`;
            document.getElementById('progress-bar').style.width = \`\${((state.round + 1) / maxRounds) * 100}%\`;
            
            const toolBar = document.getElementById('center-tools');
            const nextBtn = document.getElementById('btn-next-round');
            
            toolBar.classList.add('hidden');
            nextBtn.innerText = "NEXT";
            nextBtn.onclick = goNext;

            if (data.type === 'review') {
                document.getElementById('round-title').innerText = "Review Session";
                nextBtn.innerText = "FINISH GAME";
                nextBtn.classList.replace('bg-emerald-500', 'bg-blue-600');
                nextBtn.onclick = finishGame;
                
                // Show all history
                state.history.forEach(item => {
                    if (item.type === 'ai') renderBaristaBubble(item.text, item.sub);
                    else renderGuestBubble(item.text, item.sub);
                });

                toolBar.classList.remove('hidden');
                const subQ = data.subQ[state.lang];
                renderBaristaBubble(data.q, subQ);
                await speakWord(data.q);
                return;
            }

            // Normal Rounds: Render History of this round
            for (let item of state.history.filter(h => h.roundIndex === state.round)) {
                if (item.type === 'ai') renderBaristaBubble(item.text, item.sub);
                else renderGuestBubble(item.text, item.sub);
            }

            // Current logic
            const qText = data.dynamicQ ? data.dynamicQ(state) : data.q;
            let subQ = typeof data.subQ[state.lang] === 'function' ? data.subQ[state.lang](state) : data.subQ[state.lang];

            if (data.type === 'input-custom') {
                renderBaristaBubble(qText, subQ);
                state.history.push({ text: qText, type: 'ai', sub: subQ, roundIndex: state.round });
                await speakWord(qText);
                renderCustomInput(data);
            } else if (data.type === 'auto') {
                renderBaristaBubble(qText, subQ);
                state.history.push({ text: qText, type: 'ai', sub: subQ, roundIndex: state.round });
                await speakWord(qText);
                renderGuestBubble(data.a, data.subA[state.lang]);
                state.history.push({ text: data.a, type: 'user', sub: data.subA[state.lang], roundIndex: state.round });
                await speakWord(data.a);
                toolBar.classList.remove('hidden');
            } else if (data.type === 'auto-reversed') {
                renderGuestBubble(data.a, data.subA[state.lang]);
                state.history.push({ text: data.a, type: 'user', sub: data.subA[state.lang], roundIndex: state.round });
                await speakWord(data.a);
                renderBaristaBubble(qText, subQ);
                state.history.push({ text: qText, type: 'ai', sub: subQ, roundIndex: state.round });
                await speakWord(qText);
                toolBar.classList.remove('hidden');
            }
        }

        async function listenAllInRound() {
            if (state.isListeningAll) return;
            state.isListeningAll = true;
            
            const itemsToListen = (gameFlow[state.round].type === 'review') 
                ? state.history 
                : state.history.filter(h => h.roundIndex === state.round);

            for (const item of itemsToListen) {
                await speakWord(item.text);
            }
            state.isListeningAll = false;
        }

        function renderBaristaBubble(text, sub) {
            const area = document.getElementById('bubble-area');
            const wrapper = document.createElement('div');
            wrapper.className = 'bubble-wrapper';
            wrapper.innerHTML = \`
                <div class="speaker-group">
                    <button class="speaker-btn" onclick="speakWord('\${text.replace(/'/g, "\\\\'")}')">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
                    </button>
                </div>
                <div class="bubble bubble-ella-quest">
                    <span class="main-text">\${text}</span>
                    <span class="sub-text">\${sub}</span>
                </div>
            \`;
            area.appendChild(wrapper);
            area.scrollTop = area.scrollHeight;
            return wrapper;
        }

        function renderGuestBubble(text, sub) {
            const area = document.getElementById('bubble-area');
            const wrapper = document.createElement('div');
            wrapper.className = 'bubble-wrapper flex-row-reverse';
            wrapper.innerHTML = \`
                <div class="speaker-group">
                    <button class="speaker-btn user-gender-btn" onclick="speakWord('\${text.replace(/'/g, "\\\\'")}')">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
                    </button>
                </div>
                <div class="bubble bubble-user-ans text-right">
                    <span class="main-text">\${text}</span>
                    <span class="sub-text">\${sub}</span>
                </div>
            \`;
            area.appendChild(wrapper);
            area.scrollTop = area.scrollHeight;
            return wrapper;
        }

        function renderCustomInput(data) {
            const area = document.getElementById('bubble-area');
            const div = document.createElement('div');
            div.className = 'input-area flex flex-col items-center';
            
            const subTranslate = data.templateSub ? data.templateSub[state.lang] : "";

            div.innerHTML = \`
                <div class="text-xl font-bold text-gray-700 text-center">
                    <div class="mb-2">
                        <span>\${data.template}</span>
                        <input type="text" id="custom-val" class="custom-input" placeholder="...">
                        <span>\${data.suffix}</span>
                    </div>
                    <div class="text-xs text-amber-600 font-semibold italic opacity-80 mb-1">
                        \${subTranslate}
                    </div>
                </div>
                <button id="btn-submit" onclick="handleCustomSubmit()" class="btn-confirm">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                </button>
            \`;
            area.appendChild(div);
            area.scrollTop = area.scrollHeight;
            document.getElementById('custom-val').focus();
        }

        async function handleCustomSubmit() {
            const inputVal = document.getElementById('custom-val').value.trim();
            if (!inputVal || state.isTranslating) return;

            const btn = document.getElementById('btn-submit');
            btn.classList.add('loading');
            state.isTranslating = true;

            const flow = gameFlow[state.round];
            const fullSentenceRaw = flow.template + inputVal + flow.suffix;
            
            const translatedSentence = await translateWithGemini(fullSentenceRaw);
            
            if (flow.saveAs === 'fruitInput') {
                state.fruitVN = await extractFruitName(translatedSentence);
                state.pricePerKilo = await getRealPrice(state.fruitVN);
            }

            state[flow.saveAs] = inputVal;
            document.querySelector('.input-area').remove();

            renderGuestBubble(translatedSentence, fullSentenceRaw);
            state.history.push({ 
                text: translatedSentence, 
                type: 'user', 
                sub: fullSentenceRaw, 
                roundIndex: state.round 
            });
            
            await speakWord(translatedSentence);
            state.isTranslating = false;
            document.getElementById('center-tools').classList.remove('hidden');
        }

        function goNext() {
            if (state.round < gameFlow.length - 1) {
                state.round++;
                loadRound();
            }
        }

        function goPrev() {
            if (state.round > 0) {
                state.round--;
                loadRound();
            }
        }

        function finishGame() {
            confetti();
            const endModal = document.createElement('div');
            endModal.className = 'overlay z-[500]';
            endModal.innerHTML = \`
                <div class="start-content-box">
                    <h2 class="text-2xl font-bold text-amber-900 mb-4">Tuyệt vời! 🥳</h2>
                    <p class="mb-2 text-gray-600">Bạn đã hoàn thành bài học mua sắm tại chợ Nha Trang.</p>
                    <p class="mb-6 font-bold text-amber-700">Tổng cộng mua: \${state.fruitVN} (\${state.kilos} ký)</p>
                    <button onclick="location.reload()" class="w-full py-3 bg-amber-600 text-white rounded-full font-bold uppercase shadow-lg active:scale-95 transition-all">Học lại từ đầu</button>
                </div>
            \`;
            document.body.appendChild(endModal);
        }
    </script>
</body>
</html>
`;

export const GameBuyFruits: React.FC = () => {
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
            title="Speaking Challenge - Buy Fruits"
        ></iframe>
    );
};

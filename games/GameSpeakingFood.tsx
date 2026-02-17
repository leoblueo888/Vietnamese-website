
import React, { useState, useEffect, useRef } from 'react';
import { Maximize, Minimize } from 'lucide-react';

const gameHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SPEAK VIET: FOOD AND DRINKK</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@400;600;700&display=swap');

        body {
            font-family: 'Quicksand', sans-serif;
            background: #fff7ed;
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
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.3);
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            position: relative;
            overflow: hidden;
            background-color: #ffedd5;
            transition: background-image 0.8s ease-in-out;
        }

        .overlay {
            position: absolute;
            inset: 0;
            background: rgba(255, 255, 255, 0.8);
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
            background: rgba(255, 255, 255, 0.95);
            padding: 24px;
            border-radius: 2rem;
            box-shadow: 0 20px 60px rgba(0,0,0,0.1);
            border: 1px solid white;
            display: flex;
            flex-direction: column;
            align-items: center;
            max-width: 400px; 
            width: 100%;
        }

        #game-header {
            flex-shrink: 0;
            background: rgba(255, 255, 255, 0.9);
            backdrop-filter: blur(10px);
            border-bottom: 1px solid #e5e7eb;
            padding: 0.8rem 1.5rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            z-index: 100;
        }

        @media (max-width: 640px) {
            #header-left-group { gap: 0.5rem !important; }
            #round-title-prefix { display: none; }
            #round-title-mobile-prefix { display: inline !important; }
            #round-title { width: auto !important; text-align: left !important; }
            #game-header { padding: 0.8rem 0.75rem !important; }
        }

        #round-title-mobile-prefix { display: none; }

        .nav-round-btn {
            background: #f1f5f9;
            color: #475569;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s;
            border: none;
        }
        .nav-round-btn:hover:not(:disabled) { background: #ea580c; color: white; }
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
            margin: 30px auto; 
            width: 100%;
            padding: 0 1.5rem;
            z-index: 20;
        }

        .bubble-wrapper {
            display: flex;
            align-items: flex-start;
            gap: 12px;
            width: 100%;
            animation: fadeIn 0.5s ease-out forwards;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .speaker-btn {
            background: #ea580c;
            color: white;
            width: 44px;
            height: 44px;
            border-radius: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(234, 88, 12, 0.3);
            transition: 0.2s;
            flex-shrink: 0;
        }
        .speaker-btn:hover { transform: scale(1.05); }
        
        .ella-voice-btn { background: #be185d; box-shadow: 0 4px 12px rgba(190, 24, 93, 0.3); }
        .user-voice-btn { background: #0369a1; box-shadow: 0 4px 12px rgba(3, 105, 161, 0.3); }

        .bubble {
            padding: 1.2rem 1.5rem;
            border-radius: 1.5rem;
            max-width: 85%;
            box-shadow: 0 10px 25px rgba(0,0,0,0.08);
            background: rgba(255, 255, 255, 0.95);
            border: 1px solid rgba(255,255,255,0.5);
            position: relative;
        }

        .bubble-ella-quest { border-left: 6px solid #be185d; }
        .bubble-user-ans { border-right: 6px solid #0369a1; }

        .main-text { font-size: 1.25rem; font-weight: 800; margin-bottom: 6px; display: block; color: #1e293b; }
        .sub-text { font-size: 0.95rem; font-weight: 600; color: #64748b; display: block; border-top: 1px solid #f1f5f9; padding-top: 6px; margin-top: 4px; font-style: italic; }
        .hint-text { font-size: 0.8rem; font-weight: 700; color: #94a3b8; display: block; margin-top: 8px; text-transform: uppercase; }

        .inline-input {
            border: none;
            border-bottom: 3px solid #0369a1;
            background: transparent;
            outline: none;
            font-weight: 800;
            color: #0369a1;
            padding: 0 8px;
            width: 140px;
            text-align: center;
        }

        .send-btn {
            background: #0369a1;
            color: white;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: 0.2s;
            border: none;
        }
        .send-btn:hover { background: #075985; transform: scale(1.1); }
        .send-btn:disabled { opacity: 0.3; cursor: not-allowed; }

        .toggle-btn { flex: 1; padding: 10px; border-radius: 12px; font-weight: 700; background: #f1f5f9; color: #64748b; transition: 0.3s; }
        .toggle-btn.active { background: #ea580c; color: white; }
        
        .hidden { display: none !important; }
        .highlight-ella .bubble-ella-quest { background: #fdf2f8 !important; transform: scale(1.02); }
        .highlight-user .bubble-user-ans { background: #f0f9ff !important; transform: scale(1.02); }
    </style>
</head>
<body onload="initGame()">

    <div class="game-card" id="main-card">
        <div id="start-overlay" class="overlay">
            <div class="start-content-box">
                <div class="mb-3 bg-orange-100 p-3 rounded-full">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ea580c" stroke-width="2.5"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line></svg>
                </div>
                <h1 class="text-2xl font-black text-orange-900 mb-1 tracking-tight uppercase">SPEAK VIET: FOOD AND DRINKK</h1>
                <p id="ui-subtitle" class="text-orange-600 font-bold text-xs mb-6 italic">Master dining talks in Vietnamese 🍜</p>
                
                <div class="w-full mb-6">
                    <p id="ui-lang-label" class="text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest text-left">LANGUAGE</p>
                    <div class="flex gap-2">
                        <button id="lang-en" onclick="setUserLanguage('en')" class="toggle-btn active">🇬🇧 EN</button>
                        <button id="lang-ru" onclick="setUserLanguage('ru')" class="toggle-btn">🇷🇺 RU</button>
                    </div>
                </div>

                <div class="bg-orange-50 p-4 rounded-xl mb-6 text-left w-full border border-orange-100">
                    <p id="ui-howtoplay-title" class="text-[10px] font-black text-orange-800 mb-2 uppercase tracking-wider">HOW TO PLAY:</p>
                    <ul id="ui-howtoplay-list" class="text-[12px] text-orange-700 space-y-1.5 font-bold"></ul>
                </div>

                <button id="ui-start-btn" onclick="startGame()" class="w-full py-4 bg-orange-600 text-white rounded-full font-black text-lg shadow-lg hover:bg-orange-700 active:scale-95 transition-all">START NOW</button>
            </div>
        </div>

        <div id="game-header">
            <div class="flex items-center gap-3" id="header-left-group">
                <div class="flex flex-col">
                    <h1 id="ui-header-title" class="text-[10px] font-black text-orange-500 uppercase tracking-widest">DINING CONVERSATION</h1>
                    <div class="flex items-center gap-2">
                        <button id="btn-prev-round" onclick="prevRound()" class="nav-round-btn">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                        </button>
                        <h2 id="round-title" class="text-sm font-black text-gray-800 w-24 text-center">
                            <span id="round-title-prefix">Round</span><span id="round-title-mobile-prefix">R</span> <span id="round-number-text">1/9</span>
                        </h2>
                        <button id="btn-next-round" onclick="nextRound()" class="nav-round-btn">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                        </button>
                    </div>
                </div>
            </div>
            
            <div id="center-header-tools" class="hidden flex items-center gap-2">
                <button id="listen-all-round-btn" onclick="handleListenAllClick()" class="bg-amber-500 text-white px-5 py-2.5 rounded-full text-[10px] font-black shadow-lg hover:bg-amber-600 transition-all flex items-center gap-2 uppercase tracking-wider">
                    <span id="listen-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M11 5L6 9H2v6h4l5 4V5z"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg></span>
                    <span id="listen-text">LISTEN AGAIN</span>
                </button>
                <button id="continue-btn" onclick="goForward()" class="bg-emerald-500 text-white px-6 py-2.5 rounded-full text-xs font-black shadow-lg hover:bg-emerald-600 transition-all flex items-center gap-2 uppercase tracking-widest">CONTINUE</button>
            </div>

            <div class="flex items-center gap-2">
                <div class="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div id="progress-bar" class="h-full bg-orange-500 transition-all duration-700" style="width: 11%"></div>
                </div>
            </div>
        </div>

        <div class="scene-container" id="game-scene">
            <div id="bubble-area" class="bubble-container"></div>
        </div>

        <div id="win-overlay" class="overlay hidden">
            <div class="bg-white p-10 rounded-[3rem] shadow-2xl text-center">
                <div class="text-7xl mb-6">🍜</div>
                <h2 id="ui-win-title" class="text-4xl font-black mb-4 text-orange-600 uppercase">YUMMY!</h2>
                <p id="ui-win-msg" class="text-gray-500 mb-8 font-bold text-lg leading-relaxed">You have mastered dining conversation.</p>
                <button id="ui-replay-btn" onclick="location.reload()" class="px-12 py-5 bg-orange-600 text-white rounded-full font-black text-xl shadow-xl hover:bg-orange-700">PLAY AGAIN</button>
            </div>
        </div>
    </div>

    <script>
        let userLang = 'en';
        let currentRound = 0;
        let history = [];
        let currentGoogleAudio = null;
        let isReviewing = false;
        let stopReviewRequested = false;

        const translations = {
            en: {
                subtitle: "Master dining talks in Vietnamese 🍜",
                langLabel: "LANGUAGE",
                howToPlayTitle: "HOW TO PLAY:",
                howToPlayList: ["1. Type to complete the sentences in Vietnamese.", "2. Follow the hints provided in your language.", "3. Review & Speak the full dialogue at the end."],
                startBtn: "START NOW", headerTitle: "DINING CONVERSATION", continueBtn: "CONTINUE",
                listenAllLabel: "LISTEN AGAIN", pauseLabel: "PAUSE", reviewTitle: "REVIEW DIALOGUE",
                finishBtn: "FINISH", winTitle: "YUMMY!", winMsg: "You have mastered dining conversation.",
                replayBtn: "PLAY AGAIN", placeholder: "Type here...", hintLabel: "Hint:"
            },
            ru: {
                subtitle: "Разговоры о еде trên tiếng Việt 🍜",
                langLabel: "ЯЗЫК",
                howToPlayTitle: "КАК ИГРАТЬ:",
                howToPlayList: ["1. Введите ответы на вьетнамском языке.", "2. Используйте подсказки на вашем языке.", "3. Повторите весь диалог в конце."],
                startBtn: "НАЧАТЬ", headerTitle: "РАЗГОВОР ОБ ОБЕДЕ", continueBtn: "ДАЛЕЕ",
                listenAllLabel: "СЛУШАТЬ СНОВА", pauseLabel: "ПАУЗА", reviewTitle: "ОБЗОР ДИАЛОГА",
                finishBtn: "ЗАВЕРШИТЬ", winTitle: "ВКУСНО!", winMsg: "Вы освоили разговор об обеде.",
                replayBtn: "ИГРАТЬ СНОВА", placeholder: "Введите здесь...", hintLabel: "Подсказка:"
            }
        };

        const roundConfig = [
            { 
                q: "Bạn thích ăn món gì nhất?", 
                qSub: { en: "What food do you like the most?", ru: "Какое блюдо тебе нравится больше всего?" }, 
                prefix: "Mình thích ăn", 
                prefixSub: { en: "I like eating...", ru: "Мне нравится есть..." },
                hint: { en: "Beef Pho the most", ru: "Фо бо больше всего" } 
            },
            { 
                q: "Bạn có thích uống nước khoáng không?", 
                qSub: { en: "Do you like drinking mineral water?", ru: "Ты любишь пить минеральную воду?" }, 
                prefix: "Có, mình", 
                prefixSub: { en: "Yes, I...", ru: "Да, я..." },
                hint: { en: "really like drinking mineral water", ru: "очень люблю пить минеральную воду" } 
            },
            { 
                q: "Bạn thích uống sinh tố hay nước ép?", 
                qSub: { en: "Do you prefer smoothies or juice?", ru: "Ты предпочитаешь смузи или сок?" }, 
                prefix: "Mình thích uống", 
                prefixSub: { en: "I like drinking...", ru: "Я люблю пить..." },
                hint: { en: "smoothies more", ru: "больше смузи" } 
            },
            { 
                q: "Bạn thích ăn đồ Việt hay đồ Tây?", 
                qSub: { en: "Do you like Vietnamese food or Western food?", ru: "Ты любишь вьетнамскую еду или западную?" }, 
                prefix: "Mình thích ăn", 
                prefixSub: { en: "I like eating...", ru: "Мне нравится есть..." },
                hint: { en: "Vietnamese food", ru: "вьетнамскую еду" } 
            },
            { 
                q: "Bạn thường ăn ở nhà hàng nào?", 
                qSub: { en: "Which restaurant do you usually eat at?", ru: "В каком ресторане ты обычно ешь?" }, 
                prefix: "Mình thường ăn ở", 
                prefixSub: { en: "I usually eat at...", ru: "Я обычно ем в..." },
                hint: { en: "a nearby restaurant", ru: "ресторане поблизости" } 
            },
            { 
                q: "Bạn thường ăn ở nhà hàng với ai?", 
                qSub: { en: "Who do you usually eat at restaurants with?", ru: "С кем ты обычно ешь в ресторане?" }, 
                prefix: "Mình thường ăn với", 
                prefixSub: { en: "I usually eat with...", ru: "Я обычно ем с..." },
                hint: { en: "family", ru: "семьей" } 
            },
            { 
                q: "Bạn có thích nấu ăn không?", 
                qSub: { en: "Do you like cooking?", ru: "Тебе нравится готовить?" }, 
                prefix: "Có, mình", 
                prefixSub: { en: "Yes, I...", ru: "Да, я..." },
                hint: { en: "like cooking very much", ru: "очень люблю готовить" } 
            },
            { 
                q: "Món bạn nấu ngon nhất là món gì?", 
                qSub: { en: "What dish do you cook best?", ru: "Какое блюдо у тебя получается вкуснее всего?" }, 
                prefix: "Mình nấu ngon nhất là", 
                prefixSub: { en: "I cook ... best", ru: "Я готовлю ... лучше всего" },
                hint: { en: "spring rolls", ru: "блюдо спринг-роллы" } 
            },
            { type: "review" }
        ];

        function initGame() { updateUILanguage(); updateBackground(); }

        function updateUILanguage() {
            const t = translations[userLang];
            document.getElementById('ui-subtitle').innerText = t.subtitle;
            document.getElementById('ui-lang-label').innerText = t.langLabel;
            document.getElementById('ui-howtoplay-title').innerText = t.howToPlayTitle;
            document.getElementById('ui-start-btn').innerText = t.startBtn;
            document.getElementById('ui-header-title').innerText = t.headerTitle;
            document.getElementById('ui-win-title').innerText = t.winTitle;
            document.getElementById('ui-win-msg').innerText = t.winMsg;
            document.getElementById('ui-replay-btn').innerText = t.replayBtn;
            document.getElementById('continue-btn').innerHTML = \`\${t.continueBtn} →\`;
            updateListenBtnUI();
            document.getElementById('ui-howtoplay-list').innerHTML = t.howToPlayList.map(item => \`<li>\${item}</li>\`).join('');
        }

        function updateListenBtnUI() {
            const iconCont = document.getElementById('listen-icon');
            const textCont = document.getElementById('listen-text');
            const t = translations[userLang];
            if (isReviewing) {
                textCont.innerText = t.pauseLabel;
                iconCont.innerHTML = \`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>\`;
            } else {
                textCont.innerText = t.listenAllLabel;
                iconCont.innerHTML = \`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M11 5L6 9H2v6h4l5 4V5z"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>\`;
            }
        }

        function updateBackground() {
            const bgs = [
                "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1473093226795-af9932fe5856?auto=format&fit=crop&w=1200&q=80"
            ];
            document.getElementById('main-card').style.backgroundImage = \`url('\${bgs[currentRound % bgs.length]}')\`;
        }

        function setUserLanguage(l) { 
            userLang = l; 
            document.querySelectorAll('#lang-en, #lang-ru').forEach(b => b.classList.toggle('active', b.id === \`lang-\${l}\`));
            updateUILanguage();
        }

        function startGame() {
            document.getElementById('start-overlay').classList.add('hidden');
            loadRound();
        }

        async function speak(text) {
            if (currentGoogleAudio) currentGoogleAudio.pause();
            return new Promise(resolve => {
                try {
                    const audio = new Audio(\`https://translate.google.com/translate_tts?ie=UTF-8&q=\${encodeURIComponent(text)}&tl=vi&client=tw-ob\`);
                    currentGoogleAudio = audio;
                    audio.onended = resolve;
                    audio.onerror = resolve;
                    audio.play().catch(resolve);
                } catch(e) { resolve(); }
            });
        }
        
        const translateFree = async (text, sl, tl) => {
          if (!text) return "";
          try {
            const res = await fetch(\`https://translate.googleapis.com/translate_a/single?client=gtx&sl=\${sl}&tl=\${tl}&dt=t&q=\${encodeURIComponent(text)}\`);
            const data = await res.json();
            return data[0][0][0];
          } catch (e) { return text; }
        };

        function loadRound() {
            stopReview();
            updateBackground();
            const config = roundConfig[currentRound];
            const area = document.getElementById('bubble-area');
            const tools = document.getElementById('center-header-tools');
            area.innerHTML = '';
            tools.classList.add('hidden');
            
            document.getElementById('round-number-text').innerText = \`\${currentRound + 1}/9\`;
            document.getElementById('progress-bar').style.width = \`\${((currentRound+1)/9)*100}%\`;
            document.getElementById('btn-prev-round').disabled = (currentRound === 0);
            document.getElementById('btn-next-round').disabled = (currentRound === 8);

            if (config.type === "review") { loadReviewRound(); return; }

            const ellaWrap = document.createElement('div');
            ellaWrap.className = 'bubble-wrapper';
            ellaWrap.innerHTML = \`
                <div class="speaker-btn ella-voice-btn" onclick="speak('\${config.q.replace(/'/g, "\\\\'")}')"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M11 5L6 9H2v6h4l5 4V5z"></path></svg></div>
                <div class="bubble bubble-ella-quest"><span class="main-text">\${config.q}</span><span class="sub-text">\${config.qSub[userLang]}</span></div>
            \`;
            area.appendChild(ellaWrap);
            
            if (!history[currentRound]) {
                speak(config.q);
            }

            const userWrap = document.createElement('div');
            userWrap.className = 'bubble-wrapper justify-end';
            userWrap.id = 'user-bubble-wrapper';
            const saved = history[currentRound];

            if (saved) {
                renderSavedAnswer(userWrap, saved.a, saved.aSub);
            } else {
                renderInputBox(userWrap, config);
            }
            area.appendChild(userWrap);
            if (document.getElementById('round-input')) document.getElementById('round-input').focus();
        }

        function renderSavedAnswer(wrap, text, sub) {
            wrap.innerHTML = \`
                <div class="bubble bubble-user-ans"><span class="main-text">\${text}</span><span class="sub-text">\${sub}</span></div>
                <div class="speaker-btn user-voice-btn" onclick="speak('\${text.replace(/'/g, "\\\\'")}')"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M11 5L6 9H2v6h4l5 4V5z"></path></svg></div>
            \`;
            document.getElementById('center-header-tools').classList.remove('hidden');
        }

        function renderInputBox(wrap, config) {
            const t = translations[userLang];
            wrap.innerHTML = \`
                <div class="bubble bubble-user-ans" id="input-bubble">
                    <span class="main-text">
                        \${config.prefix} 
                        <span class="input-group">
                            <input type="text" id="round-input" class="inline-input" placeholder="..." onkeypress="if(event.key==='Enter') submitTyping()">
                            <button onclick="submitTyping()" class="send-btn" id="submit-btn">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                            </button>
                        </span>
                    </span>
                    <span class="sub-text" style="border:none; margin-top:0; padding-top:2px;">(\${config.prefixSub[userLang]})</span>
                    <span class="hint-text">\${t.hintLabel} \${config.hint[userLang]}</span>
                </div>
            \`;
        }

        async function submitTyping() {
            const input = document.getElementById('round-input');
            const btn = document.getElementById('submit-btn');
            const val = input.value.trim();
            if (!val) return;

            input.disabled = true;
            btn.disabled = true;
            btn.innerHTML = '<div class="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>';

            const config = roundConfig[currentRound];
            const viFragment = await translateFree(val, userLang, 'vi');
            const fullVI = \`\${config.prefix} \${viFragment}\`.trim();
            const fullUser = await translateFree(fullVI, 'vi', userLang);

            history[currentRound] = { q: config.q, qSub: config.qSub[userLang], a: fullVI, aSub: fullUser };
            loadRound();
            speak(fullVI);
        }

        function prevRound() { if (currentRound > 0) { currentRound--; loadRound(); } }
        function nextRound() { if (currentRound < 8) { currentRound++; loadRound(); } }
        function goForward() { if (currentRound < 8) { currentRound++; loadRound(); } else { showWin(); } }

        function loadReviewRound() {
            const area = document.getElementById('bubble-area');
            area.innerHTML = \`<h2 class="text-2xl font-black text-orange-600 text-center mb-4">\${translations[userLang].reviewTitle}</h2>\`;
            
            history.forEach((item, idx) => {
                if (!item) return;
                const ellaWrap = document.createElement('div');
                ellaWrap.className = 'bubble-wrapper';
                ellaWrap.id = \`review-ella-\${idx}\`;
                ellaWrap.innerHTML = \`
                    <div class="speaker-btn ella-voice-btn" onclick="speak('\${item.q.replace(/'/g, "\\\\'")}')">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M11 5L6 9H2v6h4l5 4V5z"></path></svg>
                    </div>
                    <div class="bubble bubble-ella-quest">
                        <span class="main-text">\${item.q}</span>
                        <span class="sub-text">\${item.qSub}</span>
                    </div>
                \`;
                area.appendChild(ellaWrap);

                const userWrap = document.createElement('div');
                userWrap.className = 'bubble-wrapper justify-end';
                userWrap.id = \`review-user-\${idx}\`;
                userWrap.innerHTML = \`
                    <div class="bubble bubble-user-ans">
                        <span class="main-text">\${item.a}</span>
                        <span class="sub-text">\${item.aSub}</span>
                    </div>
                    <div class="speaker-btn user-voice-btn" onclick="speak('\${item.a.replace(/'/g, "\\\\'")}')">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M11 5L6 9H2v6h4l5 4V5z"></path></svg>
                    </div>
                \`;
                area.appendChild(userWrap);
            });

            document.getElementById('center-header-tools').classList.remove('hidden');
            document.getElementById('continue-btn').innerHTML = \`\${translations[userLang].finishBtn} ✓\`;
        }

        async function handleListenAllClick() {
            if (roundConfig[currentRound].type === "review") {
                if (isReviewing) {
                    stopReview();
                } else {
                    startFullReview();
                }
            } else {
                const item = history[currentRound];
                if (item) {
                    await speak(item.q);
                    await new Promise(r => setTimeout(r, 600));
                    await speak(item.a);
                }
            }
        }

        async function startFullReview() {
            isReviewing = true;
            stopReviewRequested = false;
            updateListenBtnUI();

            for (let i = 0; i < history.length; i++) {
                if (stopReviewRequested) break;
                if (!history[i]) continue;
                const eEl = document.getElementById(\`review-ella-\${i}\`);
                eEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                eEl.classList.add('highlight-ella');
                await speak(history[i].q);
                await new Promise(r => setTimeout(r, 500));
                eEl.classList.remove('highlight-ella');
                if (stopReviewRequested) break;
                const uEl = document.getElementById(\`review-user-\${i}\`);
                uEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                uEl.classList.add('highlight-user');
                await speak(history[i].a);
                await new Promise(r => setTimeout(r, 800));
                uEl.classList.remove('highlight-user');
            }
            isReviewing = false;
            updateListenBtnUI();
        }

        function stopReview() {
            stopReviewRequested = true;
            isReviewing = false;
            if (currentGoogleAudio) currentGoogleAudio.pause();
            updateListenBtnUI();
        }

        function showWin() {
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#ea580c', '#f97316', '#fb923c'] });
            document.getElementById('win-overlay').classList.remove('hidden');
        }
    </script>
</body>
</html>
`;

export const GameSpeakingFood: React.FC = () => {
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
                    title="Speaking Challenge - Food & Drink"
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

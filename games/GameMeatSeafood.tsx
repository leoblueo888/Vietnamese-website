import React, { useState, useEffect } from 'react';

const gameHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Speak Viet : Buy Meat and Seafood</title>
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
            transition: background-image 0.8s ease-in-out;
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
        .speed-btn.active-speed { background: #ef4444; color: white; border-color: #ef4444; }

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
        .bubble-user-ans { color: #0369a1; border-right: 4px solid #0369a1; min-width: 250px;}

        .main-text { font-size: 1.1rem; font-weight: 800; margin-bottom: 2px; display: block; }
        .sub-text { font-size: 0.8rem; opacity: 0.7; font-style: italic; display: block; }
        .translation-text { font-size: 0.75rem; color: #64748b; margin-top: 4px; border-top: 1px dashed #cbd5e1; padding-top: 4px; display: block; }

        .input-area { 
            width: 100%; 
            margin-top: 10px; 
            background: rgba(255, 255, 255, 0.9);
            padding: 15px;
            border-radius: 1.5rem;
            box-shadow: 0 4px 12px rgba(0,0,0,0.05);
            border: 1px solid #e2e8f0;
        }
        
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

        .input-container-box {
            display: flex;
            flex-direction: column;
            gap: 12px;
            align-items: center;
        }

        .sample-row {
            display: flex;
            align-items: center;
            gap: 8px;
            font-weight: 800;
            color: #0369a1;
            font-size: 1.1rem;
            flex-wrap: wrap;
            justify-content: center;
        }

        .sample-translation {
            font-size: 0.8rem;
            color: #64748b;
            font-style: italic;
            margin-top: -6px;
            font-weight: 500;
        }

        .text-input-small { 
            width: 100px; 
            padding: 4px 8px; 
            border-radius: 8px; 
            border: 2px solid #0369a1; 
            font-weight: 700; 
            height: 36px;
            background: white;
            text-align: center;
            outline: none;
        }
        
        .btn-send-round { 
            background: #0369a1; 
            height: 36px; 
            padding: 0 15px;
            font-size: 0.8rem; 
            color: white; 
            border-radius: 8px; 
            font-weight: 800;
            transition: all 0.2s;
        }
        .btn-send-round:active { transform: scale(0.95); }

        .hidden { display: none !important; }
        .toggle-btn { flex: 1; padding: 10px; border-radius: 10px; font-weight: 700; background: #f1f5f9; border: 2px solid transparent; }
        .toggle-btn.active { background: #fef3c7; color: #92400e; border-color: #f59e0b; }
        
        .decision-container {
            display: flex;
            gap: 1rem;
            margin-top: 1rem;
            justify-content: center;
        }
        .decision-btn {
            padding: 12px 24px;
            border-radius: 12px;
            font-weight: 800;
            text-transform: uppercase;
            transition: all 0.2s;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .btn-yes { background: #10b981; color: white; }
        .btn-no { background: #ef4444; color: white; }
    </style>
</head>
<body onload="initGame()">

    <div class="game-card" id="main-card">
        <!-- Start Screen -->
        <div id="start-overlay" class="overlay">
            <div class="start-content-box">
                <div class="logo-container">
                    <!-- Icon Cua - Logo Chính -->
                    <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="50" cy="50" r="45" fill="#FEE2E2"/>
                        <path d="M25 55C25 45 35 38 50 38C65 38 75 45 75 55C75 62 68 68 50 68C32 68 25 62 25 55Z" fill="#EF4444"/>
                        <path d="M35 38L25 25M65 38L75 25M30 45L20 40M70 45L80 40M30 65L20 70M70 65L80 70" stroke="#EF4444" stroke-width="4" stroke-linecap="round"/>
                        <circle cx="42" cy="50" r="3" fill="white"/>
                        <circle cx="58" cy="50" r="3" fill="white"/>
                    </svg>
                </div>
                
                <h1 id="start-title" class="text-3xl font-black text-amber-900 mb-1 uppercase tracking-tighter text-center">Speak Viet : Buy Meat and Seafood</h1>
                <p id="start-subtitle" class="text-amber-600 font-bold text-sm mb-6">Meat & Seafood Shop - Seller & Customer 🦀</p>
                
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
                    <!-- Icon Cua - Header -->
                    <svg width="28" height="28" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M25 55C25 45 35 38 50 38C65 38 75 45 75 55C75 62 68 68 50 68C32 68 25 62 25 55Z" fill="#EF4444"/>
                        <path d="M35 38L25 25M65 38L75 25" stroke="#EF4444" stroke-width="4" stroke-linecap="round"/>
                    </svg>
                    <div>
                        <h1 class="text-[10px] font-bold text-amber-500 uppercase">MEAT & SEAFOOD</h1>
                        <h2 id="round-title" class="text-sm font-bold text-gray-800">Round 1/7</h2>
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
                <button id="btn-finish-game" onclick="showWin()" class="hidden bg-red-600 text-white px-4 py-1.5 rounded-lg font-bold text-xs uppercase shadow-md flex items-center gap-2">
                    <span>🏁</span> <span>FINISH GAME</span>
                </button>
                <button id="btn-play-again" onclick="location.reload()" class="hidden bg-gray-800 text-white px-4 py-1.5 rounded-lg font-bold text-xs uppercase shadow-md">REPLAY</button>
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
        </div>

        <!-- Win Screen -->
        <div id="win-overlay" class="overlay hidden">
            <!-- Icon Cua - Thắng Cuộc -->
            <div class="mb-4">
                <svg width="120" height="120" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M25 55C25 45 35 38 50 38C65 38 75 45 75 55C75 62 68 68 50 68C32 68 25 62 25 55Z" fill="#EF4444"/>
                    <path d="M35 38L25 25M65 38L75 25M30 45L20 40M70 45L80 40" stroke="#EF4444" stroke-width="6" stroke-linecap="round"/>
                    <circle cx="42" cy="50" r="4" fill="white"/>
                    <circle cx="58" cy="50" r="4" fill="white"/>
                    <path d="M45 60C47 62 53 62 55 60" stroke="white" stroke-width="3" stroke-linecap="round"/>
                </svg>
            </div>
            <h2 id="win-text" class="text-3xl font-black text-amber-600 mb-8 uppercase">COMPLETED!</h2>
            <button id="btn-replay" onclick="location.reload()" class="px-12 py-4 bg-amber-600 text-white rounded-full font-bold text-xl uppercase">REPLAY</button>
        </div>
    </div>

    <script>
        // Cập nhật giá chuẩn thị trường Việt Nam (VND/đơn vị) - đơn vị nghìn đồng
        const itemsList = [
            { keywords: ["bò", "thịt bò", "beef"], name: "thịt bò", price: 280, unit: "ký" },    
            { keywords: ["heo", "thịt heo", "lợn", "pork"], name: "thịt heo", price: 140, unit: "ký" },   
            { keywords: ["tôm", "tôm tươi", "shrimp", "prawn"], name: "tôm tươi", price: 250, unit: "ký" },   
            { keywords: ["cua", "crab"], name: "cua biển", price: 450, unit: "ký" },   
            { keywords: ["mực", "squid"], name: "mực lá", price: 380, unit: "ký" },     
            { keywords: ["cá hồi", "salmon"], name: "cá hồi", price: 550, unit: "ký" },     
            { keywords: ["gà", "thịt gà", "chicken"], name: "gà thả vườn", price: 160, unit: "con" }, 
            { keywords: ["trứng", "egg"], name: "trứng gà", price: 3.5, unit: "quả" },  
            { keywords: ["ốc", "snail"], name: "ốc hương", price: 420, unit: "ký" },   
            { keywords: ["ghẹ"], name: "ghẹ xanh", price: 480, unit: "ký" }    
        ];

        let state = {
            lang: 'en',
            gender: 'male', 
            round: 0,
            reviewDialogs: [], 
            itemInput: "", 
            vietItemName: "món này", 
            amount: "",
            discountPrice: 0,
            isListeningAll: false,
            currentReviewIndex: 0,
            reviewAudio: null
        };

        const i18n = {
            en: {
                startTitle: "Speak Viet : Buy Meat and Seafood",
                startSub: "Meat & Seafood Shop - Seller & Customer 🦀",
                labelLang: "LANGUAGE",
                labelGender: "USER GENDER",
                btnStart: "START",
                step1: "Listen to the Seller.",
                step2: "Enter the missing word.",
                step3: "AI will translate and read the full sentence.",
                round: "Round",
                next: "NEXT",
                win: "COMPLETED!",
                replay: "REPLAY",
                btnSubmit: "SEND",
                dropHere: "DROP YOUR CHOICE HERE",
                listenAll: "LISTEN ALL",
                pause: "PAUSE",
                reviewRound: "REVIEW",
                buyingSample: "Tôi muốn mua",
                amountSample: "Tôi mua",
                unitKilo: "ký",
                buyingTrans: "I want to buy...",
                amountTrans: "I buy... unit(s)"
            },
            ru: {
                startTitle: "Speak Viet : Покупаем мясо и морепродукты",
                startSub: "Мясо и морепродукты - Продавец 🦀",
                labelLang: "ЯЗЫК",
                labelGender: "ВАШ ПОЛ",
                btnStart: "НАCHАТЬ",
                step1: "Слушайте продавца.",
                step2: "Введите недостающее слово.",
                step3: "AI переведет и прочитает предложение.",
                round: "Раунд",
                next: "ДАLEE",
                win: "ЗАВЕРШЕНО!",
                replay: "ИGРАТЬ СНOVA",
                btnSubmit: "ОTПРАВИТЬ",
                dropHere: "ПЕРETАЩITЕ СЮDA",
                listenAll: "СLУШАТЬ ВСE",
                pause: "ПАУZA",
                reviewRound: "ОBЗОР",
                buyingSample: "Tôi muốn mua",
                amountSample: "Tôi mua",
                unitKilo: "ký",
                buyingTrans: "Я хочу купить...",
                amountTrans: "Я покупаю... шт/кг"
            }
        };

        const gameFlow = [
            { id: 1, q: "XIN CHÀO ! Bạn muốn mua gì hôm nay ?", type: "input_special", saveAs: "itemInput", en: "HELLO! What would you like to buy today?", ru: "ПРИВЕТ! Что вы хотите купить сегодня?" },
            { id: 2, dynamicQ: (s) => {
                const item = getItemData(s.vietItemName);
                const nameCap = s.vietItemName.charAt(0).toUpperCase() + s.vietItemName.slice(1);
                return \`\${nameCap} còn tươi lắm! Bạn mua mấy \${item.unit}?\`;
            }, type: "input_amount", saveAs: "amount", en: "{ITEM} is very fresh. How many units?", ru: "{ITEM} rất tươi. Bao nhiêu đơn vị?" },
            { id: 3, userFirst: true, a: "Bao nhiêu tiền một ký vậy?", aSub: {en: "How much is one kilo?", ru: "Сколько стоит один килограмм?"}, 
                dynamicQ: (s) => {
                    const item = getItemData(s.vietItemName);
                    return \`Dạ, \${item.price} nghìn một \${item.unit} nha.\`;
                }, 
                type: "drag_decision",
                en: "Price is {X}k.", ru: "Цена {X}к.",
                options: [
                    {text: "Hơi đắt! Bớt chút nha!", en: "A bit expensive! Lower it please!", ru: "Немного дорого! Сбавьте цену!"},
                    {text: "Bớt chút thì mình mua.", en: "If you lower it, I'll buy.", ru: "Если вы bớt thì mình mua."},
                    {text: "Giảm giá chút được không?", en: "Can you give a discount?", ru: "Можете сделать скидку?"}
                ]
            },
            { id: 4, dynamicQ: (s) => { 
                const f = getItemData(s.vietItemName); 
                const basePrice = s.discountPrice > 0 ? s.discountPrice : f.price;
                const qty = parseAmount(s.amount); 
                const total = Math.round(basePrice * qty * 10) / 10;
                return \`Dạ tổng hết \${total} nghìn của bạn ạ.\`; 
            }, a: "Tiền đây nha", aSub: {en: "Here is the money.", ru: "Вот деньги."}, type: "auto", en: "Total is {X}k.", ru: "Всего {X}к." },
            { id: 5, q: "Dạ, tiền thừa của bạn đây ạ.", a: "Không cần trả lại đâu", aSub: {en: "No need for change.", ru: "Сдачи không нужно."}, type: "auto", en: "Here is your change.", ru: "Вот ваша сдача." },
            { id: 6, q: "Dạ mình cảm ơn! Chào bạn và hẹn gặp lại lần sau nha!", type: "drag", en: "Thanks! See you again!", ru: "Спасибо! До свидания!", 
              options: [
                {text: "Tạm biệt! Hẹn gặp lại!", en: "Bye! See you!", ru: "Пока! Увидимся!"},
                {text: "Lần sau mình lại ghé mua.", en: "I'll visit again next time.", ru: "В следующий раз зайду снова."},
                {text: "Chào bạn nha!", en: "Bye!", ru: "Пока!"}
              ] 
            }
        ];

        function formatVNCurrencyForTTS(number) {
            if (number >= 1000) {
                const trieu = Math.floor(number / 1000);
                const nghin = number % 1000;
                let text = \`\${trieu} triệu \`;
                if (nghin > 0) {
                    if (nghin < 10) text += \`lẻ \${nghin} nghìn\`;
                    else if (nghin < 100) text += \`lẻ \${nghin} nghìn\`;
                    else {
                        const tram = Math.floor(nghin / 100);
                        const chucDonVi = nghin % 100;
                        text += \`\${tram} trăm \${chucDonVi > 0 ? chucDonVi : ''} nghìn\`;
                    }
                }
                return text.replace(/\\s+/g, ' ').trim();
            }
            return \`\${number}\`;
        }

        function parseAmount(text) {
            if (!text) return 1;
            const matches = text.match(/\\d+(\\.\\d+)?/);
            return matches ? parseFloat(matches[0]) : 1;
        }

        function getItemData(input) {
            const text = (input || "").toLowerCase().trim();
            const found = itemsList.find(item => 
                item.keywords.some(keyword => text.includes(keyword))
            );
            if (found) return found;
            return { name: input || "món này", price: 150, unit: "ký" };
        }

        function initGame() {
            updateUI();
            updateBackground();
        }

        function setLang(l) { state.lang = l; updateUI(); }
        function setGender(g) { state.gender = g; updateUI(); updateBackground(); }

        function updateBackground() {
            let imgId = state.gender === 'male' ? '163_-fOjGuTZl4y_0vddeDmTBS4o0MTku' : '1nTf2EOuN5OHael0IGj57NuHKHL7EGltk';
            const imgUrl = \`https://lh3.googleusercontent.com/d/\${imgId}=w1000\`;
            const mainCard = document.getElementById('main-card');
            mainCard.style.backgroundImage = \`url('\${imgUrl}')\`;
        }

        function updateUI() {
            const t = i18n[state.lang];
            document.getElementById('start-title').innerText = t.startTitle;
            document.getElementById('start-subtitle').innerText = t.startSub;
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

        function stopAllActivity() {
            if (state.reviewAudio) { state.reviewAudio.pause(); state.reviewAudio.src = ""; state.reviewAudio = null; }
            if (window.speechSynthesis) window.speechSynthesis.cancel();
            const area = document.getElementById('bubble-area');
            if (area) area.innerHTML = '';
        }

        async function loadRound() {
            stopAllActivity();
            if (state.round === gameFlow.length) { renderReviewRound(); return; }
            const data = gameFlow[state.round];
            if (!data) { showWin(); return; }

            document.getElementById('round-title').innerText = \`\${i18n[state.lang].round} \${state.round + 1}/\${gameFlow.length + 1}\`;
            document.getElementById('progress-bar').style.width = \`\${((state.round + 1) / (gameFlow.length + 1)) * 100}%\`;
            document.getElementById('center-tools').classList.add('hidden');
            document.getElementById('btn-finish-game').classList.add('hidden');
            document.getElementById('btn-listen-all').classList.add('hidden');

            if (data.userFirst) {
                const sub = data.aSub ? data.aSub[state.lang] : "...";
                const bUser = renderBubble(data.a, sub, 'user');
                saveToReview(data.a, sub, 'user');
                await speakViet(data.a, 'user', bUser, async () => {
                    setTimeout(async () => {
                        let qText = data.dynamicQ ? data.dynamicQ(state) : data.q;
                        let transQ = await getGoogleTranslation(qText, 'vi', state.lang);
                        const bAI = renderBubble(qText, transQ, 'ai', transQ);
                        saveToReview(qText, transQ, 'ai', transQ);
                        await speakViet(qText, 'ai', bAI, () => {
                            if (data.type === 'drag_decision' || data.type === 'drag') renderDragArea(data.options, data.type === 'drag_decision');
                        });
                        document.getElementById('center-tools').classList.remove('hidden');
                    }, 1000);
                });
            } else {
                let qText = data.dynamicQ ? data.dynamicQ(state) : data.q;
                let transQ = await getGoogleTranslation(qText, 'vi', state.lang);
                
                const bAI = renderBubble(qText, transQ, 'ai', transQ);
                saveToReview(qText, transQ, 'ai', transQ);
                
                await speakViet(qText, 'ai', bAI, () => {
                    if (data.type === 'auto') {
                        setTimeout(async () => {
                            const sub = data.aSub ? data.aSub[state.lang] : "...";
                            const bUser = renderBubble(data.a, sub, 'user');
                            saveToReview(data.a, sub, 'user');
                            await speakViet(data.a, 'user', bUser);
                            document.getElementById('center-tools').classList.remove('hidden');
                        }, 1000); 
                    }
                });

                if (data.type === 'input_special') renderRoundInput("itemInput", i18n[state.lang].buyingSample, "", i18n[state.lang].buyingTrans);
                else if (data.type === 'input_amount') {
                    const item = getItemData(state.vietItemName);
                    renderRoundInput("amount", i18n[state.lang].amountSample, item.unit, i18n[state.lang].amountTrans);
                }
                else if (data.type === 'drag') renderDragArea(data.options);
            }
        }

        function renderRoundInput(saveKey, prefix, suffix, translation) {
            const area = document.getElementById('bubble-area');
            const div = document.createElement('div');
            div.className = "input-area animate-fade-in";
            div.innerHTML = \`
                <div class="input-container-box">
                    <div class="sample-row">
                        <span>\${prefix}</span>
                        <input type="text" id="round-val-input" class="text-input-small" placeholder="..." autofocus>
                        <span>\${suffix}</span>
                        <button onclick="handleRoundSubmit('\${saveKey}', '\${prefix}', '\${suffix}')" class="btn-send-round">\${i18n[state.lang].btnSubmit}</button>
                    </div>
                    <div class="sample-translation">\${translation}</div>
                </div>
            \`;
            area.appendChild(div);
            area.scrollTop = area.scrollHeight;
        }

        async function handleRoundSubmit(saveKey, prefix, suffix) {
            const val = document.getElementById('round-val-input').value;
            if (!val) return;
            const inputArea = document.querySelector('.input-area');
            if(inputArea) inputArea.remove();
            
            let vietWord = val;
            if (saveKey === 'itemInput') {
                vietWord = await getGoogleTranslation(val, 'auto', 'vi');
                state.vietItemName = vietWord.toLowerCase();
            }
            
            const fullSentence = \`\${prefix} \${vietWord}\${suffix ? ' ' + suffix : ''}\`.replace(/\\s+/g, ' ').trim();
            state[saveKey] = fullSentence;

            const subText = await getGoogleTranslation(fullSentence, 'vi', state.lang);
            const bUser = renderBubble(fullSentence, subText, 'user');
            saveToReview(fullSentence, subText, 'user');
            await speakViet(fullSentence, 'user', bUser);
            document.getElementById('center-tools').classList.remove('hidden');
        }

        async function getGoogleTranslation(text, sl, tl) {
            try {
                const url = \`https://translate.googleapis.com/translate_a/single?client=gtx&sl=\${sl}&tl=\${tl}&dt=t&q=\${encodeURIComponent(text)}\`;
                const response = await fetch(url);
                const result = await response.json();
                return result[0][0][0]; 
            } catch (e) { return text; }
        }

        function renderBubble(text, sub, role, translation = "") {
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
                    <button class="speed-btn" onclick="toggleSpeed(this)">0.6x</button>
                </div>
                <div class="bubble \${role==='ai'?'bubble-ella-quest':'bubble-user-ans'}">
                    <span class="main-text">\${text}</span>
                    <span class="sub-text">\${sub}</span>
                    \${translation && translation !== sub ? \`<span class="translation-text">🌐 \${translation}</span>\` : ""}
                </div>
            \`;
            area.appendChild(wrapper);
            area.scrollTop = area.scrollHeight;
            return wrapper;
        }

        async function speakViet(text, role, el, onEndCallback) {
            if (el) el.classList.add('speaking-active');
            const speedBtn = el ? el.querySelector('.speed-btn') : null;
            const speedVal = (speedBtn && speedBtn.classList.contains('active-speed')) ? 1.0 : 0.6;
            
            const cleanText = text;

            const url = \`https://translate.google.com/translate_tts?ie=UTF-8&q=\${encodeURIComponent(cleanText)}&tl=vi&client=tw-ob&ttsspeed=\${speedVal}\`;
            const audio = new Audio(url);
            state.reviewAudio = audio; 
            await audio.play();
            audio.onended = () => {
                if (el) el.classList.remove('speaking-active');
                if (onEndCallback) onEndCallback();
            };
        }

        function toggleSpeed(btn) {
            btn.classList.toggle('active-speed');
            btn.innerText = btn.classList.contains('active-speed') ? "1.0x" : "0.6x";
        }

        function renderDragArea(options, isDecision = false) {
            const area = document.getElementById('bubble-area');
            const div = document.createElement('div');
            div.className = "input-area animate-fade-in";
            div.innerHTML = \`
                <div id="drop-zone" class="drop-zone" ondrop="drop(event, \${isDecision})" ondragover="allowDrop(event)">
                    \${i18n[state.lang].dropHere}
                </div>
                <div class="float-sentences-container">
                    \${options.map((opt, i) => \`
                        <div class="float-sentence" draggable="true" ondragstart="drag(event)" id="opt-\${i}" data-text="\${opt.text}" data-sub="\${opt[state.lang]}">
                            <span class="text-xs font-bold">\${opt.text}</span>
                            <span class="text-[10px] opacity-60">\${opt[state.lang]}</span>
                        </div>
                    \`).join('')}
                </div>
            \`;
            area.appendChild(div);
            area.scrollTop = area.scrollHeight;
        }

        function allowDrop(ev) { ev.preventDefault(); ev.target.classList.add('bg-amber-100'); }
        function drag(ev) { ev.dataTransfer.setData("text", ev.target.id); }
        async function drop(ev, isDecision) {
            ev.preventDefault();
            const id = ev.dataTransfer.getData("text");
            const el = document.getElementById(id);
            const text = el.getAttribute('data-text');
            const sub = el.getAttribute('data-sub');
            const inputArea = document.querySelector('.input-area');
            if(inputArea) inputArea.remove();
            
            const bUser = renderBubble(text, sub, 'user');
            saveToReview(text, sub, 'user');
            await speakViet(text, 'user', bUser, () => {
                if (isDecision) renderDecisionButtons();
            });
        }

        function renderDecisionButtons() {
            const area = document.getElementById('bubble-area');
            const div = document.createElement('div');
            div.id = "decision-box";
            div.className = "decision-container animate-fade-in";
            div.innerHTML = \`
                <button class="decision-btn btn-yes" onclick="handleDecision('yes')">YES</button>
                <button class="decision-btn btn-no" onclick="handleDecision('no')">NO</button>
            \`;
            area.appendChild(div);
            area.scrollTop = area.scrollHeight;
        }

        async function handleDecision(choice) {
            const decisionBox = document.getElementById('decision-box');
            if(decisionBox) decisionBox.remove();
            
            const item = getItemData(state.vietItemName);
            let reply = choice === 'yes' ? \`Ok! Mình bớt cho bạn còn \${item.price - 20} nghìn một \${item.unit} nha.\` : "Không đắt đâu bạn ơi! Mình bán đúng giá đó, hàng tươi Nha Trang mới về!";
            if (choice === 'yes') state.discountPrice = item.price - 20;

            const translation = await getGoogleTranslation(reply, 'vi', state.lang);
            const bAI = renderBubble(reply, translation, 'ai', translation);
            saveToReview(reply, translation, 'ai', translation);
            await speakViet(reply, 'ai', bAI);
            document.getElementById('center-tools').classList.remove('hidden');
        }

        function saveToReview(text, sub, role, translation) {
            const exists = state.reviewDialogs.some(d => d.text === text && d.round === state.round);
            if(!exists) state.reviewDialogs.push({ text, sub, role, round: state.round, translation });
        }

        function renderReviewRound() {
            document.getElementById('round-title').innerText = \`Round 7: \${i18n[state.lang].reviewRound}\`;
            document.getElementById('progress-bar').style.width = \`100%\`;
            const tools = document.getElementById('center-tools');
            tools.classList.remove('hidden');
            document.getElementById('btn-next-round').classList.add('hidden');
            document.getElementById('btn-listen-round').classList.add('hidden');
            document.getElementById('btn-listen-all').classList.remove('hidden');
            document.getElementById('btn-finish-game').classList.remove('hidden');

            const area = document.getElementById('bubble-area');
            area.innerHTML = '';
            state.reviewDialogs.forEach((d, idx) => {
                const wrapper = renderBubble(d.text, d.sub, d.role, d.translation);
                wrapper.id = \`review-item-\${idx}\`;
            });
            area.scrollTop = 0;
        }

        async function startListenAll() {
            state.isListeningAll = true;
            document.getElementById('listen-text').innerText = i18n[state.lang].pause;
            document.getElementById('listen-icon').innerText = "⏸";
            for (let i = state.currentReviewIndex; i < state.reviewDialogs.length; i++) {
                if (!state.isListeningAll) break;
                state.currentReviewIndex = i;
                const d = state.reviewDialogs[i];
                const el = document.getElementById(\`review-item-\${i}\`);
                if(el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                await new Promise(resolve => speakViet(d.text, d.role, el, () => resolve()));
                await new Promise(r => setTimeout(r, 600)); 
            }
            if (state.currentReviewIndex === state.reviewDialogs.length - 1) {
                state.currentReviewIndex = 0; stopListenAll();
            }
        }

        function stopListenAll() {
            state.isListeningAll = false;
            if(state.reviewAudio) { state.reviewAudio.pause(); state.reviewAudio.src = ""; }
            if(window.speechSynthesis) window.speechSynthesis.cancel();
            document.getElementById('listen-text').innerText = i18n[state.lang].listenAll;
            document.getElementById('listen-icon').innerText = "▶";
            document.querySelectorAll('.bubble-wrapper').forEach(b => b.classList.remove('speaking-active'));
        }

        function toggleListenAll() { if (state.isListeningAll) stopListenAll(); else startListenAll(); }
        async function listenCurrentRound() {
            const bubbles = Array.from(document.querySelectorAll('#bubble-area .bubble-wrapper'));
            for (const b of bubbles) await new Promise(res => speakViet(b.getAttribute('data-text'), b.getAttribute('data-role'), b, () => res()));
        }

        function goNext() { state.round++; loadRound(); }
        function goPrev() { if (state.round > 0) { state.round--; loadRound(); } }
        function showWin() { 
            stopListenAll();
            document.getElementById('win-overlay').classList.remove('hidden'); 
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } }); 
        }
    </script>
</body>
</html>
`;

export const GameMeatSeafood: React.FC = () => {
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
            title="Speaking Challenge - Buy Meat and Seafood"
        ></iframe>
    );
};
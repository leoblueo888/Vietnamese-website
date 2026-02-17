import React, { useState, useEffect } from 'react';

const gameHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Speak Viet : Buy coffee</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@400;600;700&display=swap');

        body {
            font-family: 'Quicksand', sans-serif;
            background: linear-gradient(135deg, #e9d5ff 0%, #f3e8ff 100%);
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
            background: rgba(255, 255, 255, 0); 
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
            background: rgba(255, 255, 255, 0.9);
            border-bottom: 1px solid #e5e7eb;
            padding: 0.8rem 1rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
            z-index: 100;
            position: relative;
            min-height: 60px;
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
            margin: 20px auto 0 auto; 
            width: 100%;
            padding: 0 1.5rem;
            position: relative;
            z-index: 20;
            overflow-y: auto;
            scroll-behavior: smooth;
            padding-top: 110px;
        }

        .bubble-wrapper {
            display: flex;
            align-items: flex-start;
            gap: 12px;
            width: 100%;
            transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
            padding: 8px;
            border-radius: 1.5rem;
        }

        .bubble-wrapper.speaking-active {
            transform: scale(1.08);
            z-index: 50;
        }
        .bubble-wrapper.speaking-active .bubble {
            box-shadow: 0 15px 30px rgba(124, 58, 237, 0.2);
            border-color: #7c3aed;
            background: white;
        }

        .speaker-group {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 4px;
        }

        .speaker-btn {
            background: #7c3aed;
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
        .speaker-btn.ella-voice-btn { background: #be185d; }

        .speed-btn {
            font-size: 8px;
            font-weight: 800;
            background: #e0f2fe;
            color: #0369a1;
            padding: 2px 4px;
            border-radius: 4px;
            border: 1px solid #bae6fd;
            cursor: pointer;
            transition: all 0.2s;
            min-width: 45px;
            text-align: center;
        }
        .speed-btn:hover { background: #bae6fd; }
        .speed-btn.active-80 { background: #0369a1; color: white; border-color: #0369a1; }
        .speed-btn.active-60 { background: #ef4444; color: white; border-color: #ef4444; }

        .bubble {
            padding: 0.8rem 1.2rem;
            border-radius: 1.2rem;
            max-width: 85%;
            box-shadow: 0 4px 10px rgba(0,0,0,0.05);
            background: rgba(255, 255, 255, 0.95);
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            position: relative;
            border: 2px solid transparent;
        }

        .bubble-ella-quest { color: #be185d; border-left: 4px solid #be185d; }
        .bubble-user-ans { color: #0369a1; border-right: 4px solid #0369a1; min-width: 250px;}

        .main-text { font-size: 1.1rem; font-weight: 800; margin-bottom: 2px; display: block; }
        .sub-text { font-size: 0.8rem; opacity: 0.7; font-style: italic; display: block; }

        .tooltip-word {
            color: #d946ef;
            text-decoration: underline dotted 2px;
            cursor: help;
            position: relative;
            display: inline-block;
        }
        .tooltip-word:hover::after {
            content: attr(data-tooltip);
            position: absolute;
            bottom: 125%;
            left: 50%;
            transform: translateX(-50%);
            background: #333;
            color: #fff;
            padding: 6px 10px;
            border-radius: 8px;
            font-size: 11px;
            white-space: normal;
            width: 180px;
            z-index: 100;
            text-align: center;
            font-weight: 600;
            box-shadow: 0 4px 10px rgba(0,0,0,0.2);
        }

        .input-area { width: 100%; margin-top: 10px; }
        
        .drop-zone {
            border: 2px dashed #0369a1;
            border-radius: 12px;
            padding: 20px;
            text-align: center;
            background: rgba(3, 105, 161, 0.05);
            min-height: 60px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #0369a1;
            font-weight: 700;
            font-size: 0.9rem;
            transition: all 0.2s;
        }
        .drop-zone.drag-over {
            background: rgba(3, 105, 161, 0.15);
            transform: scale(1.02);
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
            box-shadow: 0 4px 6px rgba(0,0,0,0.05);
            transition: all 0.2s;
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        .float-sentence:active { cursor: grabbing; }
        .float-sentence .fs-sub {
            font-size: 0.65rem;
            font-weight: 600;
            opacity: 0.6;
            font-style: italic;
        }

        .text-input { 
            width: 100%; 
            padding: 12px; 
            border-radius: 12px; 
            border: 2px solid #7c3aed; 
            font-weight: 600; 
            height: 48px;
        }

        .hidden { display: none !important; }
        .toggle-btn { flex: 1; padding: 10px; border-radius: 10px; font-weight: 700; background: #f1f5f9; border: 2px solid transparent; }
        .toggle-btn.active { background: #e0e7ff; color: #4f46e5; border-color: #4f46e5; }
        
        @media (max-width: 640px) and (orientation: portrait) {
            .game-card {
                width: 100vw;
                height: 100vh;
                max-height: none;
                border-radius: 0;
            }
            .start-content-box {
                padding: 1.5rem;
                transform: scale(0.8);
            }
            #game-header {
                padding: 0.5rem 1rem;
                min-height: 50px;
            }
            .bubble-container {
                padding-top: 90px;
                gap: 0.75rem;
            }
            .bubble {
                padding: 0.7rem 1.1rem;
            }
            .main-text {
                font-size: 1rem;
            }
            .sub-text {
                font-size: 0.75rem;
            }
            .speaker-btn {
                width: 34px;
                height: 34px;
            }
            .bubble-user-ans {
                min-width: 0; 
            }
            .text-input {
                height: 44px;
            }
            .float-sentences-container {
                gap: 6px;
            }
            .float-sentence {
                padding: 6px 12px;
                font-size: 0.75rem;
            }
            .drop-zone {
                font-size: 0.8rem;
                min-height: 50px;
            }
        }
    </style>
</head>
<body onload="initGame()">

    <div class="game-card" id="main-card">
        <!-- Màn hình bắt đầu -->
        <div id="start-overlay" class="overlay">
            <div class="start-content-box">
                <h1 id="start-title" class="text-3xl font-black text-violet-900 mb-1 uppercase tracking-tighter">Speak Viet : Buy coffee</h1>
                <p id="start-subtitle" class="text-violet-600 font-bold text-sm mb-6">Sinh tố bơ - Barista & Khách hàng 🥑</p>
                
                <div class="w-full flex gap-4 mb-6">
                    <div class="flex-1">
                        <p id="label-lang" class="text-[10px] font-bold text-gray-400 uppercase mb-2 tracking-widest text-left">LANGUAGE</p>
                        <div class="flex gap-2">
                            <button id="lang-en" onclick="setLang('en')" class="toggle-btn active">🇬🇧 EN</button>
                            <button id="lang-ru" onclick="setLang('ru')" class="toggle-btn">🇷🇺 RU</button>
                        </div>
                    </div>
                    <div class="flex-1">
                        <p id="label-gender" class="text-[10px] font-bold text-gray-400 uppercase mb-2 tracking-widest text-left">BARISTA GENDER</p>
                        <div class="flex gap-2">
                            <button id="gender-male" onclick="setGender('male')" class="toggle-btn active">♂️ MALE</button>
                            <button id="gender-female" onclick="setGender('female')" class="toggle-btn">♀️ FEMALE</button>
                        </div>
                    </div>
                </div>

                <div class="bg-gray-50 border border-gray-200 rounded-2xl p-4 w-full mb-6 text-left" id="instructions"></div>

                <button id="btn-start" onclick="startGame()" class="w-full py-4 bg-violet-600 text-white rounded-full font-bold text-xl shadow-lg hover:bg-violet-700 active:scale-95 transition-all uppercase">START</button>
            </div>
        </div>

        <!-- Header -->
        <div id="game-header">
            <div class="flex items-center gap-3">
                <button onclick="goPrev()" class="p-2 rounded-full border hover:bg-gray-100"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="3"><polyline points="15 18 9 12 15 6"></polyline></svg></button>
                <div>
                    <h1 class="text-[10px] font-bold text-violet-500 uppercase">AVOCADO SMOOTHIE</h1>
                    <h2 id="round-title" class="text-sm font-bold text-gray-800">Round 1/8</h2>
                </div>
            </div>
            
            <div id="center-tools" class="hidden flex gap-2">
                <button id="btn-listen-all" onclick="listenAll()" class="bg-violet-100 text-violet-700 px-4 py-1.5 rounded-lg font-bold text-xs uppercase border border-violet-200 shadow-sm">LISTEN ALL</button>
                <button id="btn-next-round" onclick="goNext()" class="bg-emerald-500 text-white px-6 py-1.5 rounded-lg font-bold text-xs uppercase shadow-md">NEXT</button>
            </div>

            <div class="flex items-center gap-3">
                <div class="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div id="progress-bar" class="h-full bg-violet-500 transition-all duration-500" style="width: 10%"></div>
                </div>
                <button onclick="goNext()" class="p-2 rounded-full border hover:bg-gray-100"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="3"><polyline points="9 18 15 12 9 6"></polyline></svg></button>
            </div>
        </div>

        <!-- Vùng trò chuyện -->
        <div class="scene-container">
            <div id="bubble-area" class="bubble-container"></div>
        </div>

        <!-- Màn hình thắng -->
        <div id="win-overlay" class="overlay hidden">
            <div class="text-7xl mb-4">🥑</div>
            <h2 id="win-text" class="text-3xl font-black text-violet-600 mb-8 uppercase">COMPLETED!</h2>
            <button id="btn-replay" onclick="location.reload()" class="px-12 py-4 bg-violet-600 text-white rounded-full font-bold text-xl uppercase">REPLAY</button>
        </div>
    </div>

    <script>
        const apiKey = "%%API_KEY%%"; 
        
        const dataStay = [
            { id: 1, q: "Xin chào ! Bạn muốn uống gì hôm nay ?", a: "Cho mình một ly...", subQ: { en: "Hi! What would you like today?", ru: "Привет! Что бы вы хотели сегодня?" }, subA: { en: "Give me a glass of...", ru: "Дайте мне стакан..." }, type: "input-drink" },
            { 
                id: 2, 
                q: "Bạn uống nhiều đá hay ít ạ?", 
                subQ: { en: "More ice or less ice?", ru: "Много льда hoặc мало?" }, 
                type: "drag",
                options: [
                    { text: "Cho mình nhiều đá", sub: { en: "Extra ice for me", ru: "Мне побольше льда" } },
                    { text: "Ít đá thôi nha", sub: { en: "Less ice please", ru: "Меньше льда, пожалуйста" } },
                    { text: "Không đá nha", sub: { en: "No ice", ru: "Без льда" } }
                ]
            },
            { 
                id: 3, 
                q: "Bạn muốn thêm đường hay sữa ?", 
                subQ: { en: "Do you want to add sugar or milk?", ru: "Хотите добавить сахар hoặc молоко?" }, 
                type: "drag",
                options: [
                    { text: "Cho mình đường", sub: { en: "With sugar for me", ru: "Мне с сахаром" } },
                    { text: "Sữa", sub: { en: "Milk", ru: "Молоко" } },
                    { text: "Không đường cũng không sữa", sub: { en: "No sugar and no milk", ru: "Без сахара и без молока" } }
                ]
            },
            { 
                id: 4, 
                q: "Bạn uống tại đây hay mang đi ạ?", 
                subQ: { en: "For here or to go?", ru: "Здесь hoặc с собой?" }, 
                type: "drag",
                options: [
                    { text: "Mình uống tại đây", sub: { en: "I'll drink here", ru: "Я буду здесь" }, toGo: false },
                    { text: "Mang đi nha", sub: { en: "To go please", ru: "С собой, пожалуйста" }, toGo: true }
                ]
            },
            { id: 5, q: "vâng ! mời bạn ngồi ! Mình sẽ mang đồ uống cho bạn sau vài phút.", a: "Ok !", subQ: { en: "Sure! Please take a seat. I'll bring your drink in a few minutes.", ru: "Присаживайтесь. Я приneсу напиток." }, subA: { en: "Ok!", ru: "Окей!" }, auto: true, type: "auto" },
            { id: 6, q: "đồ uống của bạn đây ? chúc ngon miệng !", a: "Cảm ơn !", subQ: { en: "Here's your drink. Enjoy!", ru: "Ваш напиток. Приятного аппетита!" }, subA: { en: "Thanks!", ru: "Спасибо!" }, auto: true, type: "auto" },
            { 
                id: 7, 
                isSpecial: true,
                type: "special",
                lines: [
                    { type: 'user', text: "Bạn ơi ! tính tiền cho mình", sub: { en: "Hey! Check for me, please!", ru: "Эй! Счет для меня, пожалуйста!" } },
                    { type: 'ai', text: "vâng ! của bạn hết 30 nghìn !", sub: { en: "Sure. It's 30,000 VND!", ru: "Конечно. С вас 30 000 донгов!" } },
                    { type: 'user', text: "Tiền đây nha ! không cần thối lại !", sub: { en: "Here's the money! Keep the change!", ru: "Вот деньги! Сдачи không cần!" } }
                ]
            },
            { id: 8, q: "cảm ơn ! xin chào và hẹn gặp lại !", a: "chào bạn nha", subQ: { en: "Thank you! Goodbye and see you again!", ru: "Спасибо! До свидания!" }, subA: { en: "Goodbye!", ru: "Пока!" }, auto: true, type: "auto" }
        ];

        const dataToGo = [
            { id: 1, q: "Xin chào ! Bạn muốn uống gì hôm nay ?", a: "Cho mình một ly...", subQ: { en: "Hi! What would you like today?", ru: "Привет!" }, subA: { en: "Give me a glass of...", ru: "Дайте мне стакан..." }, type: "input-drink" },
            { 
                id: 2, 
                q: "Bạn uống nhiều đá hay ít ạ?", 
                subQ: { en: "More ice or less ice?", ru: "Много льда?" }, 
                type: "drag",
                options: [
                    { text: "Cho mình nhiều đá", sub: { en: "Extra ice", ru: "Много льда" } },
                    { text: "Ít đá thôi nha", sub: { en: "Less ice", ru: "Меньше льда" } },
                    { text: "Không đá nha", sub: { en: "No ice", ru: "Без льда" } }
                ]
            },
            { 
                id: 3, 
                q: "Bạn muốn thêm đường hay sữa ?", 
                subQ: { en: "Do you want to add sugar or milk?", ru: "Сахар hoặc молоко?" }, 
                type: "drag",
                options: [
                    { text: "Cho mình đường", sub: { en: "Sugar", ru: "Сахар" } },
                    { text: "Cho mình sữa", sub: { en: "Milk", ru: "Молоко" } },
                    { text: "Không đường cũng không sữa", sub: { en: "Natural", ru: "Натуральный" } }
                ]
            },
            { 
                id: 4, 
                q: "Bạn uống tại đây hay mang đi ạ?", 
                subQ: { en: "For here or to go?", ru: "Здесь hoặc с собой?" }, 
                type: "drag",
                options: [
                    { text: "Mình uống tại đây", sub: { en: "For here", ru: "Здесь" }, toGo: false },
                    { text: "Mình mang đi", sub: { en: "To go", ru: "С собой" }, toGo: true }
                ]
            },
            { 
                id: 5, 
                isSpecial: true,
                type: "special",
                lines: [
                    { type: 'user', text: "Bao nhiêu tiền vậy ?", sub: { en: "How much is it?", ru: "Сколько стоит?" } },
                    { type: 'ai', text: "của bạn hết 30 nghìn !", sub: { en: "It's 30,000 VND!", ru: "С вас 30 000 донгов." } }
                ]
            },
            { 
                id: 6, 
                isSpecial: true,
                type: "special",
                lines: [
                    { type: 'user', text: "Tiền đây nha", sub: { en: "Here's the money", ru: "Вот деньги" } },
                    { type: 'ai', text: "Mình gửi bạn tiền thối", sub: { en: "Here's your change", ru: "Ваша сдача" } },
                    { type: 'user', text: "không cần thối lại", sub: { en: "Keep the change", ru: "Сдачи không cần" } },
                    { type: 'ai', text: "cảm ơn bạn", sub: { en: "Thank you", ru: "Спасибо" } }
                ]
            },
            { 
                id: 7, 
                isSpecial: true,
                type: "special",
                lines: [
                    { type: 'user', text: "Tạm biệt ! hẹn gặp lại !", sub: { en: "Goodbye! See you again!", ru: "Пока! Увидимся!" } },
                    { type: 'ai', text: "chào bạn ! sớm gặp lại nha !", sub: { en: "Goodbye! Hope to see you soon!", ru: "До свидания!" } }
                ]
            }
        ];

        let state = {
            lang: 'en',
            gender: 'male',
            round: 0,
            isToGo: false,
            history: [],
            guestSpeed: 1, 
            fullConversation: [], 
            isReviewMode: false
        };

        const i18n = {
            en: {
                startTitle: "Speak Viet : Buy coffee",
                startSub: "Avocado Smoothie - Barista & Customer 🥑",
                labelLang: "LANGUAGE",
                labelGender: "BARISTA GENDER",
                btnStart: "START",
                step1: "Listen to the Barista (AI).",
                step2: "Speak or enter your response.",
                step3: "AI will continue the flow.",
                round: "Round",
                listenAll: "LISTEN ALL",
                next: "NEXT",
                playAgain: "PLAY AGAIN",
                win: "COMPLETED!",
                replay: "REPLAY",
                placeholder: "Drink name...",
                btnSubmit: "SEND",
                barista: "Barista",
                guest: "Guest",
                dropHere: "DROP YOUR CHOICE HERE",
                review: "Review Conversation",
                tooltipNha: "It makes the sentence softer, more intimate, or full of affection.",
                templateDrink: "Cho mình một ly..."
            },
            ru: {
                startTitle: "Говори по-вьетнамски",
                startSub: "Авокадо-смузи - Бариста и Клиент 🥑",
                labelLang: "ЯЗЫК",
                labelGender: "ПОЛ БАРИСТЫ",
                btnStart: "НАЧАТЬ",
                step1: "Слушайте бариста (AI).",
                step2: "Отвечайте голосом hoặc текстом.",
                step3: "AI продолжит диалог.",
                round: "Раунд",
                listenAll: "СЛУШАТЬ ВСЕ",
                next: "ДАЛЕЕ",
                playAgain: "ИГРАТЬ СНОВА",
                win: "ЗАВЕРШЕНО!",
                replay: "ИГРАТЬ СНОВА",
                placeholder: "Название напитка...",
                btnSubmit: "ОТПРАВИТЬ",
                barista: "Бариста",
                guest: "Гость",
                dropHere: "ПЕРЕТАЩИТЕ ВАШ ВЫБОР СЮДА",
                review: "Обзор разговора",
                tooltipNha: "Это делает предложение более мягким, интимным hoặc полным нежности.",
                templateDrink: "Дайте мне стакан..."
            }
        };

        let currentAudio = null;

        function stopAllAudio() {
            window.speechSynthesis.cancel();
            if (currentAudio) {
                currentAudio.pause();
                currentAudio.currentTime = 0;
                currentAudio = null;
            }
        }

        function initGame() {
            updateUI();
            updateBackground();
            window.speechSynthesis.getVoices();
        }

        function setLang(l) { state.lang = l; updateUI(); }
        function setGender(g) { 
            state.gender = g; 
            if (g === 'female') state.guestSpeed = 1; 
            else state.guestSpeed = 0.9;
            updateBackground(); 
            updateUI(); 
        }

        function updateBackground() {
            const maleImg = 'https://lh3.googleusercontent.com/d/1OnoOsbu1RZ7K7ym2hYDEZrVDgB87q-S6';
            const femaleImg = 'https://lh3.googleusercontent.com/d/1eVvsSvjsqt05_DlarZ8Oa4W72lNUEBt4';
            const img = state.gender === 'female' ? femaleImg : maleImg;
            document.getElementById('main-card').style.backgroundImage = \`url('\${img}')\`;
        }

        function updateUI() {
            const t = i18n[state.lang];
            document.getElementById('start-title').innerText = t.startTitle;
            document.getElementById('start-subtitle').innerText = t.startSub;
            document.getElementById('label-lang').innerText = t.labelLang;
            document.getElementById('label-gender').innerText = t.labelGender;
            document.getElementById('btn-start').innerText = t.btnStart;
            document.getElementById('btn-replay').innerText = t.replay;
            document.getElementById('win-text').innerText = t.win;
            document.getElementById('btn-listen-all').innerText = t.listenAll;
            document.getElementById('btn-next-round').innerText = t.next;

            document.getElementById('lang-en').className = state.lang === 'en' ? 'toggle-btn active' : 'toggle-btn';
            document.getElementById('lang-ru').className = state.lang === 'ru' ? 'toggle-btn active' : 'toggle-btn';
            document.getElementById('gender-male').className = state.gender === 'male' ? 'toggle-btn active' : 'toggle-btn';
            document.getElementById('gender-female').className = state.gender === 'female' ? 'toggle-btn active' : 'toggle-btn';
            
            document.getElementById('instructions').innerHTML = \`
                <div class="flex gap-3 mb-2"><span class="w-5 h-5 bg-violet-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span><p class="text-xs font-semibold">\${t.step1}</p></div>
                <div class="flex gap-3 mb-2"><span class="w-5 h-5 bg-violet-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span><p class="text-xs font-semibold">\${t.step2}</p></div>
                <div class="flex gap-3"><span class="w-5 h-5 bg-violet-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span><p class="text-xs font-semibold">\${t.step3}</p></div>
            \`;
        }

        function startGame() {
            document.getElementById('start-overlay').classList.add('hidden');
            loadRound();
        }

        function formatTextWithTooltips(text) {
            const t = i18n[state.lang];
            return text.replace(/\\b(nha|nhé)\\b/gi, (match) => {
                return \`<span class="tooltip-word" data-tooltip="\${t.tooltipNha}">\${match}</span>\`;
            });
        }

        async function loadRound() {
            stopAllAudio(); 
            const currentData = state.isToGo ? dataToGo : dataStay;
            const data = currentData[state.round];
            const maxRounds = currentData.length;
            const t = i18n[state.lang];
            
            state.history = []; 
            document.getElementById('round-title').innerText = \`\${t.round} \${state.round + 1}/\${maxRounds}\`;
            document.getElementById('progress-bar').style.width = \`\${((state.round + 1) / maxRounds) * 100}%\`;
            document.getElementById('center-tools').classList.add('hidden');
            
            const area = document.getElementById('bubble-area');
            area.innerHTML = ''; 
            
            if (data.type === 'special') {
                for (const line of data.lines) {
                    const lineSub = line.sub[state.lang];
                    let bubbleEl;
                    if (line.type === 'user') {
                        bubbleEl = await renderGuestBubble(line.text, lineSub);
                        await speakWithUI(line.text, 'user', bubbleEl);
                    } else {
                        bubbleEl = await renderBaristaBubble(line.text, lineSub);
                        await speakWithUI(line.text, 'ai', bubbleEl);
                    }
                    state.history.push({ text: line.text, type: line.type, el: bubbleEl, sub: lineSub });
                    await new Promise(r => setTimeout(r, 1200));
                }
                document.getElementById('center-tools').classList.remove('hidden');
            } else if (data.type === 'auto') {
                const subQ = data.subQ[state.lang];
                const bAI = await renderBaristaBubble(data.q, subQ);
                state.history.push({ text: data.q, type: 'ai', el: bAI, sub: subQ });
                await speakWithUI(data.q, 'ai', bAI);
                await new Promise(r => setTimeout(r, 800));

                const subA = data.subA[state.lang];
                const bUser = await renderGuestBubble(data.a, subA);
                state.history.push({ text: data.a, type: 'user', el: bUser, sub: subA });
                await speakWithUI(data.a, 'user', bUser);
                document.getElementById('center-tools').classList.remove('hidden');
            } else {
                const subQ = data.subQ[state.lang];
                const bAI = await renderBaristaBubble(data.q, subQ);
                state.history.push({ text: data.q, type: 'ai', el: bAI, sub: subQ });
                await speakWithUI(data.q, 'ai', bAI);
                
                if (data.type === "drag") {
                    renderDragArea(data.options);
                } else if (data.type === "input-drink") {
                    renderDrinkInputArea(data);
                } else {
                    renderInputArea(data);
                }
            }
        }

        async function renderBaristaBubble(text, sub) {
            const area = document.getElementById('bubble-area');
            const wrapper = document.createElement('div');
            const t = i18n[state.lang];
            const displayText = formatTextWithTooltips(text);
            wrapper.className = 'bubble-wrapper';
            wrapper.innerHTML = \`
                <div class="speaker-group">
                    <button class="speaker-btn ella-voice-btn" onclick="speakWithUI('\${text}', 'ai', this.closest('.bubble-wrapper'))">🔊</button>
                    <span class="text-[8px] font-bold text-pink-600 uppercase">\${t.barista}</span>
                </div>
                <div class="bubble bubble-ella-quest">
                    <span class="main-text">\${displayText}</span>
                    <span class="sub-text">\${sub}</span>
                </div>
            \`;
            area.appendChild(wrapper);
            scrollToEl(wrapper);
            return wrapper;
        }

        async function renderGuestBubble(text, sub) {
            const area = document.getElementById('bubble-area');
            const wrapper = document.createElement('div');
            const t = i18n[state.lang];
            const displayText = formatTextWithTooltips(text);
            wrapper.className = 'bubble-wrapper justify-end';
            
            let speedLabel = (state.guestSpeed * 100).toFixed(0) + "%";

            wrapper.innerHTML = \`
                <div class="bubble bubble-user-ans">
                    <span class="main-text">\${displayText}</span>
                    <span class="sub-text">\${sub || ''}</span>
                </div>
                <div class="speaker-group">
                    <button class="speaker-btn user-gender-btn" onclick="speakWithUI('\${text}', 'user', this.closest('.bubble-wrapper'))">🔊</button>
                    <button class="speed-btn \${state.guestSpeed < 1 ? (state.guestSpeed <= 0.5 ? 'active-60' : 'active-80') : ''}" onclick="cycleSpeed(this, '\${text}')">
                        SPEED \${speedLabel}
                    </button>
                    <span class="text-[8px] font-bold text-sky-600 uppercase">\${t.guest}</span>
                </div>
            \`;
            area.appendChild(wrapper);
            scrollToEl(wrapper);
            return wrapper;
        }

        function scrollToEl(el) {
            const area = document.getElementById('bubble-area');
            if (el) area.scrollTo({ top: el.offsetTop - area.offsetTop - 100, behavior: 'smooth' });
        }

        async function speakWithUI(text, type, el) {
            if (el) el.classList.add('speaking-active');
            scrollToEl(el);
            await speak(text, type);
            if (el) el.classList.remove('speaking-active');
        }

        function cycleSpeed(btn, textToReplay) {
            if (state.guestSpeed === 1) {
                state.guestSpeed = 0.5;
                btn.className = "speed-btn active-60";
                btn.innerText = "SPEED 50%";
            } else if (state.guestSpeed === 0.5) {
                state.guestSpeed = 0.3;
                btn.className = "speed-btn active-60";
                btn.innerText = "SPEED 30%";
            } else {
                state.guestSpeed = 1;
                btn.className = "speed-btn";
                btn.innerText = "SPEED 100%";
            }
            speakWithUI(textToReplay, 'user', btn.closest('.bubble-wrapper'));
        }

        function renderDrinkInputArea(data) {
            const area = document.getElementById('bubble-area');
            const inputWrapper = document.createElement('div');
            const t = i18n[state.lang];
            const subLabel = data.subA[state.lang];
            
            inputWrapper.id = 'active-input-wrapper';
            inputWrapper.className = 'bubble-wrapper justify-end mt-4';
            inputWrapper.innerHTML = \`
                <div class="bubble bubble-user-ans">
                    <div class="mb-2">
                        <span class="text-sm font-bold text-gray-800">\${data.a}</span>
                        <span class="block text-[10px] opacity-60 italic">\${subLabel}</span>
                    </div>
                    <div class="input-area">
                        <div class="flex gap-2 items-center">
                            <input type="text" id="user-input-drink" class="text-input" placeholder="\${t.placeholder}">
                            <button onclick="submitDrinkAnswer()" class="w-11 h-11 bg-violet-600 text-white rounded-full flex items-center justify-center shrink-0 active:scale-90 transition-transform">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                            </button>
                        </div>
                    </div>
                </div>
                <div class="speaker-group">
                    <div class="speaker-btn user-gender-btn">💬</div>
                    <span class="text-[8px] font-bold text-sky-600 uppercase">\${t.guest}</span>
                </div>
            \`;
            area.appendChild(inputWrapper);
            scrollToEl(inputWrapper);
        }

        function renderInputArea(data) {
            const area = document.getElementById('bubble-area');
            const inputWrapper = document.createElement('div');
            const t = i18n[state.lang];
            inputWrapper.id = 'active-input-wrapper';
            inputWrapper.className = 'bubble-wrapper justify-end mt-4';
            inputWrapper.innerHTML = \`
                <div class="bubble bubble-user-ans">
                    <div class="input-area">
                        <input type="text" id="user-input" class="text-input" placeholder="\${t.placeholder}">
                        <button onclick="submitAnswer()" class="w-full mt-2 py-2 bg-violet-600 text-white rounded-lg font-bold">\${t.btnSubmit}</button>
                    </div>
                </div>
                <div class="speaker-group">
                    <div class="speaker-btn user-gender-btn">💬</div>
                    <span class="text-[8px] font-bold text-sky-600 uppercase">\${t.guest}</span>
                </div>
            \`;
            area.appendChild(inputWrapper);
            scrollToEl(inputWrapper);
        }

        function renderDragArea(options) {
            const area = document.getElementById('bubble-area');
            const dragWrapper = document.createElement('div');
            const t = i18n[state.lang];
            dragWrapper.id = 'active-input-wrapper';
            dragWrapper.className = 'bubble-wrapper justify-end mt-4 flex-col items-end';
            
            let optionsHtml = options.map((opt, idx) => \`
                <div class="float-sentence" draggable="true" ondragstart="onFSStart(event, \${idx})">
                    \${opt.text}
                    <span class="fs-sub">\${opt.sub[state.lang]}</span>
                </div>
            \`).join('');

            dragWrapper.innerHTML = \`
                <div class="bubble bubble-user-ans w-full">
                    <div id="drop-zone" class="drop-zone" ondragover="onFSDragOver(event)" ondragleave="onFSDragLeave(event)" ondrop="onFSDrop(event)">
                        \${t.dropHere}
                    </div>
                    <div class="float-sentences-container">
                        \${optionsHtml}
                    </div>
                </div>
                <div class="speaker-group mt-2">
                    <div class="speaker-btn user-gender-btn">📦</div>
                    <span class="text-[8px] font-bold text-sky-600 uppercase">\${t.guest}</span>
                </div>
            \`;
            area.appendChild(dragWrapper);
            scrollToEl(dragWrapper);
            
            window.currentDragOptions = options;
        }

        function onFSStart(e, idx) {
            e.dataTransfer.setData("text/plain", idx);
        }

        function onFSDragOver(e) {
            e.preventDefault();
            e.currentTarget.classList.add('drag-over');
        }

        function onFSDragLeave(e) {
            e.currentTarget.classList.remove('drag-over');
        }

        async function onFSDrop(e) {
            e.preventDefault();
            const idx = e.dataTransfer.getData("text/plain");
            const selected = window.currentDragOptions[idx];
            if (!selected) return;

            if (selected.hasOwnProperty('toGo')) {
                state.isToGo = selected.toGo;
            }

            document.getElementById('active-input-wrapper').remove();
            const sub = selected.sub[state.lang];
            const bUser = await renderGuestBubble(selected.text, sub);
            state.history.push({ text: selected.text, type: 'user', el: bUser, sub: sub });
            await speakWithUI(selected.text, 'user', bUser);
            
            document.getElementById('center-tools').classList.remove('hidden');
        }

        async function submitDrinkAnswer() {
            const inputEl = document.getElementById('user-input-drink');
            if (!inputEl) return;
            const drinkNameRaw = inputEl.value.trim();
            if (!drinkNameRaw) return;

            document.getElementById('active-input-wrapper').remove();
            
            let drinkNameVi = drinkNameRaw;
            try {
                const targetLang = 'vi';
                const sourceLang = (state.lang === 'ru') ? 'ru' : 'en';
                const translateUrl = \`https://translate.googleapis.com/translate_a/single?client=gtx&sl=\${sourceLang}&tl=\${targetLang}&dt=t&q=\${encodeURIComponent(drinkNameRaw)}\`;
                
                const response = await fetch(translateUrl);
                const resultArr = await response.json();
                drinkNameVi = resultArr[0][0][0];
            } catch (e) {
                console.error("Translation error", e);
            }

            const finalVi = \`Cho mình một ly \${drinkNameVi.toLowerCase()}.\`;
            const template = i18n[state.lang].templateDrink.replace('...', '');
            const subText = \`\${template} \${drinkNameRaw}\`;

            const bUser = await renderGuestBubble(finalVi, subText);
            state.history.push({ text: finalVi, type: 'user', el: bUser, sub: subText });
            await speakWithUI(finalVi, 'user', bUser);
            
            document.getElementById('center-tools').classList.remove('hidden');
        }

        async function submitAnswer() {
            const inputEl = document.getElementById('user-input');
            if (!inputEl) return;
            const input = inputEl.value.trim();
            if (!input) return;

            document.getElementById('active-input-wrapper').remove();
            
            let finalVi = input;
            let subText = input;

            const isVietnameseOnly = /[àáảãạâầấẩẫậăằắẳẵặèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i.test(input);

            if (!isVietnameseOnly) {
                try {
                    const sourceLang = (state.lang === 'ru') ? 'ru' : 'en';
                    const translateUrl = \`https://translate.googleapis.com/translate_a/single?client=gtx&sl=\${sourceLang}&tl=vi&dt=t&q=\${encodeURIComponent(input)}\`;
                    const response = await fetch(translateUrl);
                    const resultArr = await response.json();
                    finalVi = resultArr[0][0][0];
                } catch (e) {
                    console.error("Translation error", e);
                }
            }

            const bUser = await renderGuestBubble(finalVi, subText);
            state.history.push({ text: finalVi, type: 'user', el: bUser, sub: subText });
            await speakWithUI(finalVi, 'user', bUser);
            
            document.getElementById('center-tools').classList.remove('hidden');
        }

        function speak(text, type) {
            return new Promise(resolve => {
                stopAllAudio();
                
                if (state.gender === 'female') {
                    if (type === 'ai') {
                        systemSpeak(text, 'ai', 0.5, resolve, 0.7);
                    } else {
                        googleSpeak(text, 1.0, resolve);
                    }
                } else {
                    let speed = (type === 'ai') ? 0.9 : state.guestSpeed;
                    if (type === 'ai') {
                        googleSpeak(text, speed, resolve);
                    } else {
                        systemSpeak(text, 'user', speed, resolve, 0.8);
                    }
                }
            });
        }

        function googleSpeak(text, speed, resolve) {
            const url = \`https://translate.google.com/translate_tts?ie=UTF-8&q=\${encodeURIComponent(text)}&tl=vi&client=tw-ob\`;
            const audio = new Audio(url);
            currentAudio = audio;
            audio.playbackRate = speed;
            audio.onended = resolve;
            audio.onerror = () => {
                systemSpeak(text, 'fallback', speed, resolve);
            };
            audio.play().catch(() => resolve());
        }

        function systemSpeak(text, type, speed, resolve, customPitch) {
            const ut = new SpeechSynthesisUtterance(text);
            ut.lang = 'vi-VN';
            ut.rate = speed;
            ut.pitch = customPitch || 1.0;
            
            const voices = window.speechSynthesis.getVoices();
            
            if (state.gender === 'female' && type === 'ai') {
                const preferredVoice = voices.find(v => v.name.includes('Microsoft') && v.name.includes('An') && v.lang.includes('vi')) || 
                                       voices.find(v => v.name.includes('Microsoft') && v.lang.includes('vi')) ||
                                       voices.find(v => v.lang.includes('vi'));
                if (preferredVoice) ut.voice = preferredVoice;
            } else if (type === 'user') {
                const preferredVoice = voices.find(v => v.name.includes('Microsoft') && v.lang.includes('vi')) || 
                                       voices.find(v => v.lang.includes('vi'));
                if (preferredVoice) ut.voice = preferredVoice;
            }
            
            ut.onend = resolve;
            ut.onerror = resolve;
            window.speechSynthesis.speak(ut);
        }

        async function listenAll() {
            const source = state.isReviewMode ? state.fullConversation : state.history;
            for (const line of source) {
                if (state.isReviewMode && source !== state.fullConversation) break;
                if (!state.isReviewMode && source !== state.history) break;
                
                await speakWithUI(line.text, line.type, line.el);
                await new Promise(r => setTimeout(r, 400));
            }
        }

        function resetGame() {
            stopAllAudio();
            state.round = 0;
            state.isToGo = false;
            state.history = [];
            state.fullConversation = [];
            state.isReviewMode = false;
            const nextBtn = document.getElementById('btn-next-round');
            const t = i18n[state.lang];
            nextBtn.innerText = t.next;
            loadRound();
        }

        function goNext() {
            stopAllAudio(); 
            if (state.isReviewMode) {
                resetGame();
                return;
            }
            const currentData = state.isToGo ? dataToGo : dataStay;
            state.history.forEach(item => {
                state.fullConversation.push({ text: item.text, type: item.type, sub: item.sub });
            });
            if (state.round < currentData.length - 1) {
                state.round++;
                loadRound();
            } else {
                showReview();
            }
        }

        async function showReview() {
            stopAllAudio();
            state.isReviewMode = true;
            const t = i18n[state.lang];
            document.getElementById('round-title').innerText = t.review;
            document.getElementById('progress-bar').style.width = \`100%\`;
            document.getElementById('center-tools').classList.remove('hidden');
            const nextBtn = document.getElementById('btn-next-round');
            nextBtn.innerText = t.playAgain;
            const area = document.getElementById('bubble-area');
            area.innerHTML = ''; 
            for (const item of state.fullConversation) {
                let el;
                if (item.type === 'ai') { el = await renderBaristaBubble(item.text, item.sub); }
                else { el = await renderGuestBubble(item.text, item.sub); }
                item.el = el; 
            }
            setTimeout(() => { listenAll(); }, 500);
        }

        function goPrev() {
            if (state.round > 0 && !state.isReviewMode) {
                stopAllAudio();
                state.round--;
                loadRound();
            }
        }
    </script>
</body>
</html>
`;

export const GameSmoothieSpeaking: React.FC = () => {
    const [iframeSrc, setIframeSrc] = useState<string | undefined>(undefined);

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

    if (!iframeSrc) {
        return <div className="w-full h-full flex items-center justify-center bg-slate-900 text-white">Loading Game...</div>;
    }

    return (
        <iframe
            src={iframeSrc}
            className="w-full h-full"
            style={{ border: 'none' }}
            allow="microphone; fullscreen"
            title="Speaking Challenge - Buy a Smoothie"
        ></iframe>
    );
};

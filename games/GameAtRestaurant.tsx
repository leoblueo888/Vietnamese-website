import React, { useState, useEffect } from 'react';

const gameHTML = `
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Speak Viet : Restaurant</title>
    <script src="https://cdn.tailwindcss.com"></script>
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

        .floating-nav {
            position: absolute;
            top: 1.5rem;
            left: 1.5rem;
            right: 1.5rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            z-index: 500;
            pointer-events: none;
        }

        .nav-btn-group {
            display: flex;
            align-items: center;
            gap: 10px;
            pointer-events: auto;
        }

        .glass-btn {
            background: rgba(255, 255, 255, 0.85);
            backdrop-filter: blur(8px);
            border: 1px solid rgba(255, 255, 255, 0.5);
            padding: 0.5rem 1rem;
            border-radius: 1rem;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            display: flex;
            align-items: center;
            gap: 8px;
            transition: all 0.2s;
            cursor: pointer;
        }
        
        .glass-btn:hover {
            transform: translateY(-2px);
            background: white;
        }

        .overlay {
            position: absolute;
            inset: 0;
            background: rgba(255, 255, 255, 0.2); 
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 600;
            border-radius: 2rem;
            text-align: center;
            padding: 20px;
            backdrop-filter: blur(4px);
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

        #menu-modal {
            position: absolute;
            top: 5.5rem;
            left: 50%;
            transform: translateX(-50%);
            width: 90%;
            max-width: 500px;
            background: rgba(255, 255, 255, 0.98);
            border-radius: 1.5rem;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            z-index: 1000;
            max-height: 60vh;
            overflow-y: auto;
            padding: 1.5rem;
            border: 2px solid #f59e0b;
        }

        .menu-item {
            padding: 12px 0;
            border-bottom: 1px solid #fef3c7;
            display: flex;
            align-items: flex-start;
            gap: 12px;
        }
        .menu-item:last-child { border: none; }

        .menu-checkbox {
            width: 20px;
            height: 20px;
            accent-color: #f59e0b;
            cursor: pointer;
            margin-top: 4px;
        }

        .scene-container {
            flex: 1;
            overflow: hidden; 
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
            padding: 11rem 1.5rem 2rem 1.5rem; 
            position: relative;
            z-index: 20;
            overflow-y: auto;
        }

        .bubble-wrapper {
            display: flex;
            align-items: flex-start;
            gap: 12px;
            width: 100%;
            transition: all 0.5s;
            padding: 4px;
        }

        .bubble-wrapper.speaking-active .bubble {
            box-shadow: 0 0 15px rgba(245, 158, 11, 0.5);
            border-color: #f59e0b !important;
            transform: scale(1.02);
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
            width: 36px;
            height: 36px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            border: none;
        }
        
        .speaker-btn.user-gender-btn { background: #0369a1; }

        .speed-btn {
            font-size: 9px;
            font-weight: 800;
            background: #fef3c7;
            color: #92400e;
            padding: 2px 6px;
            border-radius: 6px;
            border: 1px solid #fde68a;
            cursor: pointer;
        }

        .bubble {
            padding: 0.8rem 1.2rem;
            border-radius: 1.2rem;
            max-width: 80%;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08); 
            background: rgba(255, 255, 255, 0.9);
            backdrop-filter: blur(5px);
            transition: all 0.3s;
            border: 2px solid transparent;
        }

        .bubble-ella-quest { color: #92400e; border-left: 4px solid #f59e0b; }
        .bubble-user-ans { color: #0369a1; border-right: 4px solid #0369a1; }

        .main-text { font-size: 1.1rem; font-weight: 800; display: block; }
        .sub-text { font-size: 0.85rem; opacity: 0.7; font-style: italic; display: block; margin-top: 2px; }

        .input-area { width: 100%; margin-top: 15px; padding: 0 10px; }
        
        .input-row {
            display: flex;
            gap: 8px;
            align-items: stretch;
            margin-bottom: 8px;
        }

        .text-input { 
            flex: 1;
            padding: 12px 16px; 
            border-radius: 15px; 
            border: 2px solid #0369a1; 
            font-weight: 600; 
            outline: none;
            background: rgba(255, 255, 255, 0.9);
        }
        
        .btn-send { 
            background: #0369a1; 
            padding: 0 20px;
            color: white; 
            border-radius: 15px; 
            font-weight: 800; 
            font-size: 0.85rem;
            box-shadow: 0 4px 12px rgba(3, 105, 161, 0.3);
            white-space: nowrap;
            transition: transform 0.2s;
        }
        .btn-send:active { transform: scale(0.95); }

        .lang-mic-btn { padding: 10px; border-radius: 10px; color: white; font-weight: 800; flex: 1; border: none; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .btn-mic-vn { background: #ef4444; }
        .btn-mic-en { background: #3b82f6; }
        .btn-mic-ru { background: #6b7280; }
        .btn-recording { animation: pulse 1s infinite; background: black !important; }

        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }

        .hidden { display: none !important; }
        
        .drag-zone {
            border: 2px dashed #0369a1;
            border-radius: 15px;
            padding: 15px;
            background: rgba(255, 255, 255, 0.8);
            text-align: center;
            color: #0369a1;
            font-weight: 700;
            margin-bottom: 10px;
        }

        .float-sentence {
            background: white;
            border: 2px solid #0369a1;
            color: #0369a1;
            padding: 8px 16px;
            border-radius: 25px;
            font-weight: 800;
            margin: 5px;
            display: inline-block;
            cursor: pointer;
            box-shadow: 0 4px 10px rgba(0,0,0,0.05);
        }

        .progress-container {
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 6px;
            background: rgba(0,0,0,0.05);
            z-index: 100;
        }

        #progress-bar {
            height: 100%;
            background: #f59e0b;
            transition: width 0.3s ease;
        }

        .help-box {
            background: #fffbeb;
            border: 1px solid #fde68a;
            padding: 12px;
            border-radius: 1rem;
            width: 100%;
            text-align: left;
            margin-bottom: 16px;
        }
    </style>
</head>
<body onload="initGame()">

    <div class="game-card" id="main-card">
        <!-- Floating Controls -->
        <div class="floating-nav">
            <div class="nav-btn-group">
                <button onclick="goPrev()" class="glass-btn">⬅️</button>
                <div class="glass-btn">
                    <div class="flex flex-col items-start leading-tight">
                        <span id="round-title" class="text-xs font-black text-amber-600">ROUND 1/6</span>
                        <span class="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">RESTAURANT</span>
                    </div>
                </div>
            </div>

            <div class="nav-btn-group">
                <button id="btn-menu-global" onclick="toggleMenu()" class="glass-btn font-black text-amber-700 bg-amber-50 border-amber-200">
                    📖 MENU
                </button>
            </div>

            <div class="nav-btn-group">
                <div id="center-tools" class="hidden flex gap-2">
                    <button id="btn-listen-all" onclick="toggleListenAll()" class="hidden bg-orange-600 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-lg">▶ NGHE TẤT CẢ</button>
                    <button id="btn-listen-round" onclick="listenCurrentRound()" class="bg-amber-500 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-lg">🔊 NGHE LẠI</button>
                    <button id="btn-next-round" onclick="goNext()" class="bg-emerald-500 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-lg">TIẾP TỤC</button>
                </div>
                <button onclick="goNext()" class="glass-btn">➡️</button>
            </div>
        </div>

        <!-- Menu Modal -->
        <div id="menu-modal" class="hidden">
            <div class="flex justify-between items-center mb-4 sticky top-0 bg-white pb-2 border-b">
                <div class="flex items-center gap-3">
                    <h3 id="menu-modal-title" class="font-black text-amber-700 uppercase">Thực đơn</h3>
                    <button id="menu-select-btn" onclick="handleMenuSelect()" class="bg-amber-600 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase shadow-md hover:bg-amber-700">
                        SELECT ✅
                    </button>
                </div>
                <button onclick="toggleMenu()" class="text-gray-400 font-bold">✖</button>
            </div>
            <div id="menu-list"></div>
        </div>

        <div id="start-overlay" class="overlay">
            <div class="start-content-box">
                <h1 id="start-title" class="text-3xl font-black text-amber-900 uppercase">Speak Viet: Restaurant</h1>
                <p id="start-subtitle" class="text-amber-600 font-bold mb-4">Nhà hàng - Người phục vụ & Khách hàng 🍲</p>
                
                <div class="help-box">
                    <h4 id="help-title" class="text-xs font-black text-amber-700 uppercase mb-2">How to play</h4>
                    <ul id="help-list" class="text-[11px] text-amber-900 font-semibold space-y-1"></ul>
                </div>

                <div class="w-full flex gap-4 mb-6">
                    <div class="flex-1">
                        <p id="label-lang" class="text-[10px] font-bold text-gray-400 mb-2 text-left uppercase">LANGUAGE</p>
                        <select id="lang-select" onchange="updateStartWindowUI()" class="w-full p-3 bg-gray-100 rounded-xl font-bold">
                            <option value="en">🇬🇧 English</option>
                            <option value="ru">🇷🇺 Russian</option>
                        </select>
                    </div>
                    <div class="flex-1">
                        <p id="label-gender" class="text-[10px] font-bold text-gray-400 mb-2 text-left uppercase">GENDER</p>
                        <select id="gender-select" onchange="updateBackground()" class="w-full p-3 bg-gray-100 rounded-xl font-bold">
                            <!-- Options updated by JS -->
                        </select>
                    </div>
                </div>

                <button id="btn-start-game" onclick="startGame()" class="w-full py-4 bg-amber-600 text-white rounded-full font-bold text-xl uppercase shadow-lg hover:bg-amber-700">START</button>
            </div>
        </div>

        <div class="scene-container">
            <div id="bubble-area" class="bubble-container"></div>
            <div class="progress-container">
                <div id="progress-bar" style="width: 10%"></div>
            </div>
        </div>
    </div>

    <script>
        const foodMenu = [
            { id: 1, name: "Phở", price: 70000, en: "Beef/Chicken Pho", enDesc: "Noodle soup with aromatic broth, herbs, and beef or chicken.", ru: "Фо с говядиной/курицей", ruDesc: "Суп с лапшой, ароматным бульоном, зеленью и говядиной или курицей." },
            { id: 2, name: "Bún Chả", price: 75000, en: "Bun Cha", enDesc: "Grilled pork patties and slices served over vermicelli and dipping sauce.", ru: "Бун Ча", ruDesc: "Котлеты из свинины на гриле с рисовой лапшой и соусом." },
            { id: 3, name: "Mì Quảng", price: 65000, en: "Quang Noodles", enDesc: "Turmeric-infused noodles with pork, shrimp, and peanuts.", ru: "Лапша по-cuangски", ruDesc: "Лапша с куркумой, свининой, креветками и арахисом." },
            { id: 4, name: "Bánh Chưng", price: 50000, en: "Sticky Rice Cake", enDesc: "Traditional square cake made from glutinous rice, mung beans, and pork.", ru: "Рисовый пирог", ruDesc: "Традиционный квадратный пирог из клейкого риса, бобов мунг и свинины." },
            { id: 5, name: "Bánh Xèo", price: 85000, en: "Vietnamese Crepe", enDesc: "Crispy pancake filled with shrimp, pork, and bean sprouts.", ru: "Вьетнамский блинчик", ruDesc: "Хрустящий блинчик с начинкой из креветок, свинины и ростков фасоли." },
            { id: 6, name: "Xôi Gà", price: 55000, en: "Sticky Rice with Chicken", enDesc: "Steamed glutinous rice topped with shredded savory chicken.", ru: "Клейкий рис с курицей", ruDesc: "Паровой клейкий рис с измельченной соленой курицей." },
            { id: 7, name: "Nem Cuốn", price: 60000, en: "Spring Rolls", enDesc: "Fresh rolls with shrimp, pork, herbs, and vermicelli.", ru: "Спринг-роллы", ruDesc: "Свежие роллы с креветками, свининой, зеленью и вермишелью." },
            { id: 8, name: "Bò Sốt Vang", price: 95000, en: "Vietnamese Beef Stew", enDesc: "Beef slow-cooked in red wine and spices, served with bread.", ru: "Рагу из говядины", ruDesc: "Говядина, тушенная в красном вине со специями, подается с хлебом." },
            { id: 9, name: "Bún Bò", price: 75000, en: "Hue Beef Noodle Soup", enDesc: "Spicy beef noodle soup from Central Vietnam.", ru: "Суп с говяжьей лапшой", ruDesc: "Острый суп с говяжьей лапшой из Центрального Вьетнама." },
            { id: 10, name: "Nem Nướng", price: 80000, en: "Grilled Pork Sausage", enDesc: "Savory grilled pork skewers served with rice paper and vegetables.", ru: "Свиные колбаски на гриле", ruDesc: "Свиные шашлычки на гриле с рисовой бумагой и овощами." }
        ];

        const drinkMenu = [
            { id: 101, name: "Nước Cam Ép", price: 45000, en: "Orange Juice", enDesc: "Freshly squeezed oranges rich in Vitamin C.", ru: "Апельсиновый сок", ruDesc: "Свежевыжатый апельсиновый сок, богатый витамином С." },
            { id: 102, name: "Nước Dừa Tươi", price: 35000, en: "Fresh Coconut Water", enDesc: "Cooling coconut water served straight from the fruit.", ru: "Кокосовая вода", ruDesc: "Охлаждающая кокосовая вода прямо из плода." },
            { id: 103, name: "Sinh tố Bơ", price: 55000, en: "Avocado Smoothie", enDesc: "Creamy blended avocado with sweet condensed milk.", ru: "Авокадо-смузи", ruDesc: "Сливочный смузи из авокадо со сгущенным молоком." },
            { id: 104, name: "Nước Chanh Tươi", price: 35000, en: "Fresh Lime Soda", enDesc: "Refreshing lime juice with sugar and sparkling water.", ru: "Лаймовая содовая", ruDesc: "Освежающий сок лайма с сахаром и газированной водой." },
            { id: 105, name: "Nước Ép Dứa", price: 40000, en: "Pineapple Juice", enDesc: "Sweet and tangy fresh pineapple extract.", ru: "Ананасовый сок", ruDesc: "Сладкий и терпкий сок из свежеgo ананаса." },
            { id: 106, name: "Sinh tố Xoài", price: 50000, en: "Mango Smoothie", enDesc: "Tropical blend of ripe sweet mangoes.", ru: "Манговый смузи", ruDesc: "Тропический смузи из спелых сладких манго." },
            { id: 107, name: "Nước Khoáng", price: 15000, en: "Mineral Water", enDesc: "Pure bottled mineral water.", ru: "Минеральная вода", ruDesc: "Чистая бутилированная минеральная вода." },
            { id: 108, name: "Sinh tố Dâu", price: 65000, en: "Strawberry Smoothie", enDesc: "Blended fresh strawberries with a hint of cream.", ru: "Клубничный смузи", ruDesc: "Смузи из свежей клубники с капелькой сливок." }
        ];

        const translations = {
            en: {
                startTitle: "Speak Viet: Restaurant",
                startSubtitle: "Restaurant - Waiter & Customer Interaction 🍲",
                helpTitle: "How to Play",
                helpLines: [
                    "• Step 1: Order food & drinks using the MENU button (Round 1-2).",
                    "• Step 2: Practice speaking Vietnamese with the Waiter.",
                    "• Step 3: Check your bill (auto-calculated from your choices).",
                    "• Step 4: Say goodbye and enjoy!"
                ],
                labelLang: "LANGUAGE",
                labelGender: "GENDER",
                btnStart: "START GAME",
                menuTitleFood: "Food Menu",
                menuTitleDrink: "Drink Menu",
                select: "SELECT ✅",
                male: "♂️ Male",
                female: "♀️ Female"
            },
            ru: {
                startTitle: "Говори по-вьетнамски: Ресторан",
                startSubtitle: "Ресторан - Взаимодействие официанта и клиента 🍲",
                helpTitle: "Как играть",
                helpLines: [
                    "• Шаг 1: Закажите еду и напитки кнопкой МЕНЮ (Раунд 1-2).",
                    "• Шаг 2: Практикуйте вьетнамский язык с официантом.",
                    "• Шаг 3: Проверьте счет (автоматический расчет).",
                    "• Шаг 4: Попрощайтесь и наслаждайтесь!"
                ],
                labelLang: "ЯЗЫК",
                labelGender: "ПОЛ",
                btnStart: "НАЧАТЬ ИГРУ",
                menuTitleFood: "Меню блюд",
                menuTitleDrink: "Меню напитков",
                select: "ВЫБРАТЬ ✅",
                male: "♂️ Мужской",
                female: "♀️ Женский"
            }
        };

        let recognition;
        let isRecording = false;
        
        let state = {
            round: 0,
            lang: 'en',
            gender: 'female',
            dialogs: [],
            voiceSpeed: 0.8,
            isListeningAll: false,
            selectedItems: [] 
        };

        const flow = [
            { q: "Chào mừng quý khách! Quý khách muốn dùng món gì ạ?", type: "input", en: "Welcome! What would you like to eat?", ru: "Добро пожаловать! Что бы вы хотели поесть?", autoMenu: true },
            { q: "Quý khách muốn dùng đồ uống gì ạ?", type: "input", en: "What would you like to drink?", ru: "Что бы вы хотели выпить?", autoMenu: true },
            { userFirst: false, q: "Đồ ăn của quý khách đây! Chúc ngon miệng!", en: "Here is your food! Enjoy your meal!", ru: "Вот ваша еда! Приятного аппетита!", a: "Cảm ơn!", aSub: {en: "Thank you!", ru: "Спасибо!"}, type: "auto" },
            { userFirst: true, a: "Bạn ơi! Tính tiền nha!", aSub: {en: "Excuse me! Bill please!", ru: "Официант! Счет, пожалуйста!"}, q: "Dạ, của quý khách hết {total} ạ.", en: "Yes, it's {total} in total.", ru: "Да, всего {total}.", type: "auto" },
            { userFirst: true, a: "Tiền đây nha! Không cần thối lại!", aSub: {en: "Here is the money! Keep the change!", ru: "Вот деньги! Сдачи не нужно!"}, q: "Dạ! Em cảm ơn quý khách ạ!", en: "Yes! Thank you very much!", ru: "Да! Большое спасибо!", type: "auto" },
            { userFirst: true, a: "Đồ ăn rất ngon! Tạm biệt nha!", aSub: {en: "The food was great! Goodbye!", ru: "Еда была очень вкусной! До свидания!"}, q: "Dạ! Hẹn gặp lại quý khách!", en: "Yes! See you again!", ru: "Да! До встречи!", type: "drag", options: [{t: "Tạm biệt!", en: "Goodbye!", ru: "До свидания!"}, {t: "Hẹn gặp lại!", en: "See you!", ru: "Увидимся!"}] }
        ];

        function initGame() {
            updateStartWindowUI();
            updateBackground();
            if ('webkitSpeechRecognition' in window) {
                recognition = new webkitSpeechRecognition();
                recognition.onresult = (e) => {
                    const inp = document.getElementById('user-input');
                    if(inp) inp.value = e.results[0][0].transcript;
                };
                recognition.onend = () => { isRecording = false; updateMicUI(); };
            }
        }

        function updateStartWindowUI() {
            const l = document.getElementById('lang-select').value;
            const t = translations[l];
            document.getElementById('start-title').innerText = t.startTitle;
            document.getElementById('start-subtitle').innerText = t.startSubtitle;
            document.getElementById('help-title').innerText = t.helpTitle;
            document.getElementById('label-lang').innerText = t.labelLang;
            document.getElementById('label-gender').innerText = t.labelGender;
            document.getElementById('btn-start-game').innerText = t.btnStart;
            
            const genderSelect = document.getElementById('gender-select');
            const currentGender = genderSelect.value || 'female';
            genderSelect.innerHTML = \`
                <option value="male" \${currentGender === 'male' ? 'selected' : ''}>\${t.male}</option>
                <option value="female" \${currentGender === 'female' ? 'selected' : ''}>\${t.female}</option>
            \`;

            const list = document.getElementById('help-list');
            list.innerHTML = '';
            t.helpLines.forEach(line => {
                const li = document.createElement('li');
                li.innerText = line;
                list.appendChild(li);
            });
        }

        function toggleMenu(forceOpen = false) {
            const modal = document.getElementById('menu-modal');
            if (forceOpen) {
                modal.classList.remove('hidden');
                renderMenu();
            } else {
                modal.classList.toggle('hidden');
                if(!modal.classList.contains('hidden')) renderMenu();
            }
        }

        function renderMenu() {
            const list = document.getElementById('menu-list');
            const titleEl = document.getElementById('menu-modal-title');
            const selectBtn = document.getElementById('menu-select-btn');
            list.innerHTML = '';
            const l = state.lang;
            selectBtn.innerText = translations[l].select;
            const activeMenu = (state.round === 1) ? drinkMenu : foodMenu;
            titleEl.innerText = (state.round === 1) ? translations[l].menuTitleDrink : translations[l].menuTitleFood;

            activeMenu.forEach(item => {
                const div = document.createElement('div');
                div.className = "menu-item cursor-pointer hover:bg-amber-50 rounded-lg p-2 transition-colors";
                div.onclick = () => explainItem(item);
                const desc = l === 'en' ? item.enDesc : item.ruDesc;
                const priceFormatted = item.price.toLocaleString('vi-VN') + "đ";
                div.innerHTML = \`
                    <input type="checkbox" class="menu-checkbox" data-name="\${item.name}" data-sub="\${item[l]}" data-price="\${item.price}" onclick="event.stopPropagation()">
                    <div class="flex-1">
                        <div class="flex justify-between items-center mb-1">
                            <span class="font-bold text-amber-900">\${item.name}</span>
                            <span class="text-xs font-black text-amber-600">\${priceFormatted}</span>
                        </div>
                        <p class="text-[10px] text-amber-800 font-semibold mb-1">\${item[l]}</p>
                        <p class="text-[10px] text-gray-500 italic leading-tight bg-gray-50 p-1 rounded border-l-2 border-gray-200">\${desc}</p>
                    </div>
                \`;
                list.appendChild(div);
            });
        }

        function explainItem(item) {
            // Function intentionally left blank to prevent showing item descriptions.
        }

        async function handleMenuSelect() {
            const checkboxes = document.querySelectorAll('.menu-checkbox:checked');
            if (checkboxes.length === 0) return;
            const selectedNames = [];
            const selectedSubs = [];
            checkboxes.forEach(cb => {
                const name = cb.getAttribute('data-name');
                const price = parseInt(cb.getAttribute('data-price'));
                selectedNames.push(name);
                selectedSubs.push(cb.getAttribute('data-sub'));
                state.selectedItems.push({ name, price });
            });
            let vnText = "Cho tôi ";
            let subText = state.lang === 'en' ? "Give me " : "Дайте мне ";
            const prefix = (state.round === 1) ? "1 ly " : "1 phần ";
            for (let i = 0; i < selectedNames.length; i++) {
                if (i > 0 && i === selectedNames.length - 1) { vnText += " và "; subText += state.lang === 'en' ? " and " : " и "; }
                else if (i > 0) { vnText += ", "; subText += ", "; }
                vnText += prefix + selectedNames[i];
                subText += "1 " + (state.round === 1 ? "glass of " : "portion of ") + selectedSubs[i];
            }
            vnText += "."; subText += ".";
            toggleMenu();
            const inputEl = document.getElementById('active-input');
            if (inputEl) inputEl.remove();
            await addBubble(vnText, subText, 'user');
            document.getElementById('center-tools').classList.remove('hidden');
        }

        function calculateTotal() {
            const total = state.selectedItems.reduce((acc, curr) => acc + curr.price, 0);
            return total > 0 ? total.toLocaleString('vi-VN') + " đồng" : "300.000 đồng";
        }

        function updateBackground() {
            state.gender = document.getElementById('gender-select').value;
            const id = state.gender === 'male' ? '1NIFHXlUdG3sSgaaWkyy7YNysFstgxnjL' : '18m3cbamBQBfhD4Vkbq8leypxwC4HfvAH';
            document.getElementById('main-card').style.backgroundImage = \`url('https://lh3.googleusercontent.com/d/\${id}=w1000')\`;
        }

        function startGame() {
            state.lang = document.getElementById('lang-select').value;
            state.gender = document.getElementById('gender-select').value;
            document.getElementById('start-overlay').classList.add('hidden');
            loadRound();
        }

        async function loadRound() {
            if (state.round >= flow.length) { showReview(); return; }
            const menuBtn = document.getElementById('btn-menu-global');
            if (state.round <= 1) menuBtn.classList.remove('hidden'); else menuBtn.classList.add('hidden');
            let data = {...flow[state.round]};
            if (state.round === 3) {
                const totalText = calculateTotal();
                data.q = data.q.replace("{total}", totalText);
            }
            const area = document.getElementById('bubble-area');
            area.innerHTML = '';
            document.getElementById('round-title').innerText = \`ROUND \${state.round + 1}/\${flow.length}\`;
            document.getElementById('center-tools').classList.add('hidden');
            document.getElementById('progress-bar').style.width = \`\${((state.round + 1) / flow.length) * 100}%\`;

            if (data.userFirst) {
                await addBubble(data.a, data.aSub[state.lang], 'user');
                await new Promise(r => setTimeout(r, 600));
                await addBubble(data.q, data[state.lang], 'ai');
                if (data.type === 'drag') showDrag(data.options);
                document.getElementById('center-tools').classList.remove('hidden');
            } else {
                await addBubble(data.q, data[state.lang], 'ai');
                if (data.type === 'input') showInput();
                else if (data.type === 'auto') {
                    await new Promise(r => setTimeout(r, 800));
                    await addBubble(data.a, data.aSub[state.lang], 'user');
                    document.getElementById('center-tools').classList.remove('hidden');
                } else if (data.type === 'drag') showDrag(data.options);
                
                // Mở Menu tự động sau khi đọc xong ở Round 1 & 2
                if (data.autoMenu) {
                    toggleMenu(true);
                }
            }
        }

        async function addBubble(text, sub, role) {
            const area = document.getElementById('bubble-area');
            const wrap = document.createElement('div');
            wrap.className = \`bubble-wrapper \${role === 'user' ? 'justify-end' : 'justify-start'}\`;
            const isUser = role === 'user';
            wrap.innerHTML = \`
                \${!isUser ? '<div class="speaker-group"><button class="speaker-btn">🔊</button><button class="speed-btn">'+state.voiceSpeed+'x</button></div>' : ''}
                <div class="bubble \${isUser ? 'bubble-user-ans' : 'bubble-ella-quest'}">
                    <span class="main-text">\${text}</span>
                    <span class="sub-text">\${sub}</span>
                </div>
                \${isUser ? '<div class="speaker-group"><button class="speaker-btn user-gender-btn">🔊</button><button class="speed-btn">'+state.voiceSpeed+'x</button></div>' : ''}
            \`;
            wrap.querySelector('.speaker-btn').onclick = () => speak(text, role, wrap);
            wrap.querySelector('.speed-btn').onclick = (e) => toggleSpeed(e.target);
            area.appendChild(wrap);
            area.scrollTop = area.scrollHeight;
            state.dialogs.push({ text, sub, role, round: state.round });
            await speak(text, role, wrap);
        }

        async function speak(txt, role, wrap) {
            return new Promise((resolve) => {
                if(wrap) wrap.classList.add('speaking-active');
                
                if (state.gender === 'male') {
                    if (role === 'ai') {
                        const audio = new Audio(\`https://translate.google.com/translate_tts?ie=UTF-8&q=\${encodeURIComponent(txt)}&tl=vi&client=tw-ob&ttsspeed=\${state.voiceSpeed}\`);
                        audio.onended = () => { if(wrap) wrap.classList.remove('speaking-active'); resolve(); };
                        audio.play().catch(e => { if(wrap) wrap.classList.remove('speaking-active'); resolve(); });
                    } else {
                        const utterance = new SpeechSynthesisUtterance(txt);
                        utterance.lang = 'vi-VN';
                        utterance.rate = state.voiceSpeed;
                        const voices = window.speechSynthesis.getVoices();
                        const anVoice = voices.find(v => v.name.includes('An') && v.lang.includes('vi'));
                        if (anVoice) utterance.voice = anVoice;
                        utterance.onend = () => { if(wrap) wrap.classList.remove('speaking-active'); resolve(); };
                        window.speechSynthesis.speak(utterance);
                    }
                } else {
                    if (role === 'ai') {
                        const utterance = new SpeechSynthesisUtterance(txt);
                        utterance.lang = 'vi-VN';
                        utterance.rate = state.voiceSpeed;
                        const voices = window.speechSynthesis.getVoices();
                        const anVoice = voices.find(v => v.name.includes('An') && v.lang.includes('vi'));
                        if (anVoice) utterance.voice = anVoice;
                        utterance.onend = () => { if(wrap) wrap.classList.remove('speaking-active'); resolve(); };
                        window.speechSynthesis.speak(utterance);
                    } else {
                        const audio = new Audio(\`https://translate.google.com/translate_tts?ie=UTF-8&q=\${encodeURIComponent(txt)}&tl=vi&client=tw-ob&ttsspeed=\${state.voiceSpeed}\`);
                        audio.onended = () => { if(wrap) wrap.classList.remove('speaking-active'); resolve(); };
                        audio.play().catch(e => { if(wrap) wrap.classList.remove('speaking-active'); resolve(); });
                    }
                }
            });
        }

        function toggleSpeed(btn) { state.voiceSpeed = state.voiceSpeed === 0.8 ? 0.5 : 0.8; btn.innerText = state.voiceSpeed + 'x'; }
        function mic(l) { if(isRecording) { recognition.stop(); return; } recognition.lang = l; recognition.start(); isRecording = true; updateMicUI(); }
        function updateMicUI() {
            document.querySelectorAll('.lang-mic-btn').forEach(b => b.classList.remove('btn-recording'));
            if(isRecording) {
                const map = {'vi-VN': 'btn-mic-vn', 'en-US': 'btn-mic-en', 'ru-RU': 'btn-mic-ru'};
                const cls = map[recognition.lang];
                const activeBtn = document.querySelector('.' + cls);
                if(activeBtn) activeBtn.classList.add('btn-recording');
            }
        }

        function showInput() {
            const area = document.getElementById('bubble-area');
            const div = document.createElement('div');
            div.className = "input-area";
            div.id = "active-input";
            div.innerHTML = \`
                <div class="input-row"><input type="text" id="user-input" class="text-input" placeholder="Nhập món hoặc Menu..."><button class="btn-send" onclick="submitInput()">GỬI</button></div>
                <div class="flex gap-2"><button class="lang-mic-btn btn-mic-vn" onclick="mic('vi-VN')">VN</button><button class="lang-mic-btn btn-mic-en" onclick="mic('en-US')">EN</button><button class="lang-mic-btn btn-mic-ru" onclick="mic('ru-RU')">RU</button></div>
            \`;
            area.appendChild(div);
            area.scrollTop = area.scrollHeight;
        }

        async function submitInput() {
            const val = document.getElementById('user-input').value; if(!val) return;
            document.getElementById('active-input').remove();
            await addBubble(val, "Your input", 'user');
            document.getElementById('center-tools').classList.remove('hidden');
        }

        function showDrag(opts) {
            const area = document.getElementById('bubble-area');
            const div = document.createElement('div');
            div.className = "input-area"; div.id = "active-drag";
            div.innerHTML = \`<div class="drag-zone">Chọn câu trả lời</div><div class="text-center" id="options-box"></div>\`;
            area.appendChild(div);
            opts.forEach(o => {
                const btn = document.createElement('div');
                btn.className = "float-sentence"; btn.innerText = o.t;
                btn.onclick = () => { div.remove(); addBubble(o.t, o[state.lang], 'user'); document.getElementById('center-tools').classList.remove('hidden'); };
                div.querySelector('#options-box').appendChild(btn);
            });
            area.scrollTop = area.scrollHeight;
        }

        function goNext() { state.round++; loadRound(); }
        function goPrev() { if(state.round > 0) { state.round--; loadRound(); } }
        function showReview() {
            const area = document.getElementById('bubble-area'); area.innerHTML = '<h2 class="text-center font-bold text-amber-600 uppercase py-4">Review</h2>';
            state.dialogs.forEach((d, i) => {
                const wrap = document.createElement('div');
                wrap.className = \`bubble-wrapper \${d.role === 'user' ? 'justify-end' : 'justify-start'}\`;
                wrap.innerHTML = \`<div class="bubble \${d.role === 'user' ? 'bubble-user-ans' : 'bubble-ella-quest'}"><span class="main-text">\${d.text}</span></div>\`;
                area.appendChild(wrap);
            });
            document.getElementById('center-tools').classList.remove('hidden');
        }
        function listenCurrentRound() {
            const bubbles = Array.from(document.querySelectorAll('.bubble-container .bubble-wrapper'));
            let i = 0; const play = async () => { if(i < bubbles.length) { const role = bubbles[i].classList.contains('justify-end') ? 'user' : 'ai'; await speak(bubbles[i].querySelector('.main-text').innerText, role, bubbles[i]); i++; play(); } }; play();
        }
    </script>
</body>
</html>
`;

export const GameAtRestaurant: React.FC = () => {
    const [iframeSrc, setIframeSrc] = useState<string | undefined>(undefined);
    
    useEffect(() => {
        const finalHtml = gameHTML.replace('%%API_KEY%%', process.env.API_KEY || '');
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
            title="Speaking Challenge - At a Restaurant"
        ></iframe>
    );
};

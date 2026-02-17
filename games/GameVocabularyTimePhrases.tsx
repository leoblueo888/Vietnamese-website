
import React, { useEffect, useRef, useState } from 'react';
import { Maximize, Minimize } from 'lucide-react';

const gameHTML = `
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Vietnamese Time Phrase</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700;900&display=swap');
        
        body {
            font-family: 'Montserrat', sans-serif;
            overflow: hidden;
            background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
            height: 100vh;
            width: 100vw;
            margin: 0;
            user-select: none;
            display: flex;
            flex-direction: column;
        }

        header {
            width: 100%;
            padding: 0.75rem;
            background: rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(10px);
            z-index: 100;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.25rem;
        }

        .header-controls {
            display: flex;
            align-items: center;
            gap: 1rem;
            background: rgba(255, 255, 255, 0.05);
            padding: 0.4rem 1rem;
            border-radius: 50px;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .nav-btn {
            background: rgba(255, 255, 255, 0.1);
            color: white;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s;
        }

        .nav-btn:hover:not(.disabled) {
            background: #f59e0b;
            transform: scale(1.1);
        }

        .game-header-text {
            color: white;
            font-size: 0.75rem;
            font-weight: 900;
            letter-spacing: 0.1em;
            min-width: 180px;
            text-align: center;
        }

        .round-dots {
            display: flex;
            gap: 4px;
            flex-wrap: wrap;
            justify-content: center;
        }

        .dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.2);
            transition: all 0.3s;
        }

        .dot.active {
            background: #fbbf24;
            box-shadow: 0 0 8px #fbbf24;
            transform: scale(1.2);
        }

        .floating-word {
            position: absolute;
            cursor: grab;
            padding: 8px 16px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 8px 20px rgba(0,0,0,0.4);
            font-weight: 800;
            font-size: 0.9rem;
            color: #1e1b4b;
            z-index: 999;
            touch-action: none;
            border: 3px solid #f59e0b;
            text-align: center;
            white-space: nowrap;
        }

        .main-card {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 24px;
            padding: 1.5rem;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1.2rem;
            width: 90%;
            max-width: 340px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.4);
        }

        .russian-word-big {
            font-size: 2rem;
            font-weight: 900;
            color: #fbbf24;
            text-shadow: 0 5px 15px rgba(0,0,0,0.3);
            text-align: center;
        }

        .classic-layout {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1.5rem;
            width: 100%;
            max-width: 1100px;
            padding: 1rem;
        }

        .sentence-row-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 100%;
            padding: 1.5rem;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 30px;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .sentence-row {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.75rem;
            width: 100%;
            flex-wrap: wrap; /* Cho phép rớt dòng trên màn hình cực nhỏ */
        }

        .sentence-part {
            font-size: 1.5rem;
            font-weight: 900;
            color: white;
            text-align: center;
        }

        .drop-zone {
            width: 180px;
            height: 54px;
            border: 2px dashed rgba(255, 255, 255, 0.3);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(0,0,0,0.2);
            transition: all 0.3s;
        }

        .drop-zone.hover {
            border-color: #fbbf24;
            background: rgba(251, 191, 36, 0.1);
        }

        .choices-area {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 0.75rem;
            padding: 1rem;
            background: rgba(0,0,0,0.2);
            border-radius: 20px;
            width: 100%;
        }

        /* Responsive Mobile Vertical (Dọc) */
        @media (orientation: portrait) {
            .sentence-part {
                font-size: 1.25rem;
            }
            .drop-zone {
                width: 140px;
                height: 48px;
            }
            .russian-word-big {
                font-size: 1.75rem;
            }
            .main-card {
                padding: 1rem;
            }
        }

        /* PC & Landscape (Ngang) */
        @media (min-width: 1024px), (orientation: landscape) {
            .sentence-part {
                font-size: 2.2rem;
            }
            .drop-zone {
                width: 240px;
                height: 70px;
            }
            .sentence-row {
                flex-wrap: nowrap;
                gap: 1.5rem;
            }
            .sentence-row-container {
                padding: 2.5rem;
            }
            .russian-word-big {
                font-size: 2.5rem;
            }
        }

        .overlay {
            position: fixed;
            inset: 0;
            background: rgba(15, 23, 42, 0.95);
            display: none;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 2000;
            backdrop-filter: blur(15px);
        }

        .mix-btn {
            background: rgba(255, 255, 255, 0.1);
            color: white;
            padding: 1.5rem;
            border-radius: 20px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.5rem;
            transition: all 0.3s;
            width: 100%;
            cursor: pointer;
        }

        .lang-option {
            background: rgba(255, 255, 255, 0.05);
            border: 2px solid rgba(255, 255, 255, 0.1);
            padding: 0.75rem 1.5rem;
            border-radius: 15px;
            color: white;
            font-weight: 700;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            cursor: pointer;
            font-size: 0.8rem;
        }

        .lang-option.selected {
            background: #fbbf24;
            color: #0f172a;
            border-color: #fbbf24;
        }

        .speaker-btn {
            background: #f59e0b;
            color: #1e1b4b;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
        }

        @keyframes pop {
            0% { transform: scale(0.9); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
        }
        .animate-pop { animation: pop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
    </style>
</head>
<body>

    <div id="start-screen" class="overlay" style="display: flex;">
        <div class="text-center animate-pop max-w-4xl w-full px-6 flex flex-col items-center">
            <h1 class="text-4xl md:text-7xl font-black text-yellow-400 mb-2 italic tracking-tighter uppercase">Vietnamese Time Phrase</h1>
            
            <div id="lang-selector" class="flex gap-3 mb-8 mt-4">
                <div class="lang-option selected" onclick="setLanguage('en', this)">
                    <img src="https://flagcdn.com/w40/us.png" width="20" alt="English">
                    ENGLISH
                </div>
                <div class="lang-option" onclick="setLanguage('ru', this)">
                    <img src="https://flagcdn.com/w40/ru.png" width="20" alt="Russian">
                    РУССКИЙ
                </div>
            </div>

            <p id="start-subtitle" class="text-white/60 mb-8 uppercase tracking-[0.2em] font-bold text-[10px] md:text-sm">TOPIC: TIME PHRASES</p>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-md">
                <button class="mix-btn" onclick="startGame(0)">
                    <div id="start-btn-title-1" class="text-2xl md:text-4xl font-black">7 Phrases</div>
                    <span id="start-btn-desc-1" class="font-bold uppercase text-[10px] tracking-widest text-white/70">LEVEL 1: BASICS</span>
                </button>
                <button class="mix-btn" onclick="startGame(1)">
                    <div id="start-btn-title-2" class="text-2xl md:text-4xl font-black">9 Phrases</div>
                    <span id="start-btn-desc-2" class="font-bold uppercase text-[10px] tracking-widest text-white/70">LEVEL 2: COMPLEX</span>
                </button>
            </div>
        </div>
    </div>

    <header>
        <div class="header-controls">
            <div id="btn-prev" class="nav-btn" onclick="handlePrev()"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256"><path d="M165.66,202.34a8,8,0,0,1-11.32,11.32l-80-80a8,8,0,0,1,0-11.32l80-80a8,8,0,0,1,11.32,11.32L91.31,128Z"></path></svg></div>
            <div class="game-header-text uppercase font-black">
                <span id="lvl-name">...</span> | <span id="phase-tag">PHASE 1</span>
            </div>
            <div id="btn-next" class="nav-btn" onclick="handleNext()"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256"><path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z"></path></svg></div>
        </div>
        <div id="round-indicators" class="round-dots mt-1"></div>
    </header>

    <main class="flex-grow flex items-center justify-center relative overflow-hidden p-4">
        <div id="game-canvas" class="z-10 w-full flex justify-center"></div>
        <div id="floating-area" class="absolute inset-0 pointer-events-none"></div>
    </main>

    <div id="success-overlay" class="overlay">
        <div class="bg-indigo-950/80 p-6 md:p-10 rounded-[30px] border border-white/20 text-center animate-pop max-w-sm md:max-w-lg w-full mx-4 shadow-2xl backdrop-blur-2xl">
            <div id="popup-content" class="flex flex-col items-center">
                <div class="flex items-center gap-3 mb-2">
                    <h2 id="pop-target" class="text-3xl md:text-6xl font-black text-white"></h2>
                    <div id="pop-speaker-main" class="speaker-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256"><path d="M155.51,24.81a8,8,0,0,0-8.42.88L77.25,80H32A16,16,0,0,0,16,96v64a16,16,0,0,0,16,16H77.25l69.84,54.31A8,8,0,0,0,160,224V32A8,8,0,0,0,155.51,24.81ZM144,207.64l-61.12-47.53A8,8,0,0,0,77.25,158.4H32V97.6h45.25a8,8,0,0,0,5.63-2.31L144,48.36ZM208,128a32,32,0,0,0-9.37-22.63,8,8,0,0,0-11.32,11.32,16,16,0,0,1,0,22.62,8,8,0,0,0,11.32,11.32A32,32,0,0,0,208,128Zm32,0a64,64,0,0,0-18.75-45.25,8,8,0,0,0-11.32,11.32,48,48,0,0,1,0,67.86,8,8,0,0,0,11.32,11.32A64,64,0,0,0,240,128Z"></path></svg>
                    </div>
                </div>
                <div id="pop-hint" class="text-yellow-400 font-bold mb-2 italic text-sm md:text-lg"></div>
                <div id="pop-vn" class="text-white/80 font-bold text-lg md:text-2xl uppercase tracking-widest mb-6"></div>

                <div class="bg-white/5 p-4 md:p-6 rounded-2xl w-full text-left mb-6 border border-white/5">
                    <div class="flex justify-between items-start">
                        <div class="flex-1">
                            <p id="ex-target" class="text-white font-bold text-sm md:text-xl mb-1"></p>
                            <p id="ex-vn" class="text-yellow-400 font-bold text-xs md:text-base"></p>
                        </div>
                    </div>
                </div>

                <button id="next-round-btn" class="bg-yellow-400 hover:bg-yellow-500 text-indigo-950 font-black py-3 md:py-5 px-8 md:px-12 rounded-xl uppercase tracking-widest transition-all w-full shadow-xl text-sm md:text-lg">CONTINUE</button>
            </div>
        </div>
    </div>

    <script>
        const ringtone = new Audio("https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3");
        let currentLang = 'en'; 

        const translations = {
            en: {
                subtitle: "TOPIC: TIME PHRASES",
                btnTitle1: "7 Phrases", btnDesc1: "LEVEL 1: BASICS",
                btnTitle2: "9 Phrases", btnDesc2: "LEVEL 2: COMPLEX",
                dropText: "Drag meaning", question: "What does it mean?",
                dropStep2: "Drop here", continue: "CONTINUE"
            },
            ru: {
                subtitle: "ТЕМА: ВРЕМЕННЫЕ ВЫРАЖЕНИЯ",
                btnTitle1: "7 Фраз", btnDesc1: "УРОВЕНЬ 1: ОСНОВЫ",
                btnTitle2: "9 Фраз", btnDesc2: "УРОВЕНЬ 2: СЛОЖНО",
                dropText: "Значение сюда", question: "Что это значит?",
                dropStep2: "Бросайте сюда", continue: "ПРОДОЛЖИТЬ"
            }
        };

        function setLanguage(lang, el) {
            currentLang = lang;
            document.querySelectorAll('.lang-option').forEach(opt => opt.classList.remove('selected'));
            el.classList.add('selected');
            const t = translations[lang];
            document.getElementById('start-subtitle').innerText = t.subtitle;
            document.getElementById('start-btn-title-1').innerText = t.btnTitle1;
            document.getElementById('start-btn-desc-1').innerText = t.btnDesc1;
            document.getElementById('start-btn-title-2').innerText = t.btnTitle2;
            document.getElementById('start-btn-desc-2').innerText = t.btnDesc2;
            document.getElementById('next-round-btn').innerText = t.continue;
        }

        function playTTS(text, lang = 'vi') {
            if (!text) return;
            const audio = new Audio(\`https://translate.google.com/translate_tts?ie=UTF-8&q=\${encodeURIComponent(text)}&tl=\${lang}&client=tw-ob\`);
            audio.play().catch(e => console.error(e));
        }

        const rawData = [
            {
                id: 0, name: { en: "LEVEL 1", ru: "УРОВЕНЬ 1" },
                vocabulary: [
                    { ru: "Bây giờ", hint: { en: "Now", ru: "Сейчас" }, vn: "bây giờ", practices: [{ leftRu: "Tôi", rightRu: "đang bận.", ans: "Bây giờ", fullRu: "Tôi bây giờ đang bận.", fullVn: { en: "I am busy now.", ru: "Я сейчас занят." } }, { leftRu: "Bạn ở đâu", rightRu: "?", ans: "bây giờ", fullRu: "Bạn ở đâu bây giờ?", fullVn: { en: "Where are you now?", ru: "Где ты сейчас?" } }] },
                    { ru: "Hôm nay", hint: { en: "Today", ru: "Сегодня" }, vn: "hôm nay", practices: [{ leftRu: "", rightRu: "là thứ hai.", ans: "Hôm nay", fullRu: "Hôm nay là thứ hai.", fullVn: { en: "Today is Monday.", ru: "Сегодня понедельник." } }, { leftRu: "Trời", rightRu: "rất nóng.", ans: "hôm nay", fullRu: "Trời hôm nay rất nóng.", fullVn: { en: "It's very hot today.", ru: "Сегодня очень жарко." } }] },
                    { ru: "Ngày mai", hint: { en: "Tomorrow", ru: "Завтра" }, vn: "ngày mai", practices: [{ leftRu: "Tôi sẽ đến", rightRu: ".", ans: "ngày mai", fullRu: "Tôi sẽ đến ngày mai.", fullVn: { en: "I will come tomorrow.", ru: "Я приду завтра." } }, { leftRu: "", rightRu: "là ngày nghỉ.", ans: "Ngày mai", fullRu: "Ngày mai là ngày nghỉ.", fullVn: { en: "Tomorrow is a holiday.", ru: "Завтра выходной." } }] },
                    { ru: "Hôm qua", hint: { en: "Yesterday", ru: "Вчера" }, vn: "hôm qua", practices: [{ leftRu: "Tôi đã đi làm", rightRu: ".", ans: "hôm qua", fullRu: "Tôi đã đi làm hôm qua.", fullVn: { en: "I went to work yesterday.", ru: "Я вчера ходил на работу." } }, { leftRu: "", rightRu: "trời có mưa.", ans: "Hôm qua", fullRu: "Hôm qua trời có mưa.", fullVn: { en: "Yesterday it rained.", ru: "Вчера шел дождь." } }] },
                    { ru: "Tuần trước", hint: { en: "Last week", ru: "На прошлой неделе" }, vn: "tuần trước", practices: [{ leftRu: "Tôi đi du lịch", rightRu: ".", ans: "tuần trước", fullRu: "Tôi đi du lịch tuần trước.", fullVn: { en: "I went traveling last week.", ru: "Я ездил в путешествие на прошлой неделе." } }, { leftRu: "", rightRu: "tôi rất bận.", ans: "Tuần trước", fullRu: "Tuần trước tôi rất bận.", fullVn: { en: "Last week I was very busy.", ru: "На прошлой неделе я был очень занят." } }] },
                    { ru: "Tháng này", hint: { en: "This month", ru: "В этом месяце" }, vn: "tháng này", practices: [{ leftRu: "", rightRu: "tôi có bài kiểm tra.", ans: "Tháng này", fullRu: "Tháng này tôi có bài kiểm tra.", fullVn: { en: "This month I have an exam.", ru: "В этом месяце у меня экзамен." } }, { leftRu: "Tôi sẽ mua xe", rightRu: ".", ans: "tháng này", fullRu: "Tôi sẽ mua xe tháng này.", fullVn: { en: "I will buy a car this month.", ru: "Я куплю машину в этом месяце." } }] },
                    { ru: "Năm sau", hint: { en: "Next year", ru: "В следующем году" }, vn: "năm sau", practices: [{ leftRu: "", rightRu: "tôi đi Việt Nam.", ans: "Năm sau", fullRu: "Năm sau tôi đi Việt Nam.", fullVn: { en: "Next year I go to Vietnam.", ru: "В следующем году я поеду во Вьетнам." } }, { leftRu: "Họ sẽ cưới", rightRu: ".", ans: "năm sau", fullRu: "Họ sẽ cưới năm sau.", fullVn: { en: "They will get married next year.", ru: "Они поженятся в следующем году." } }] }
                ]
            },
            {
                id: 1, name: { en: "LEVEL 2", ru: "УРОВЕНЬ 2" },
                vocabulary: [
                    { ru: "Trước khi", hint: { en: "Before", ru: "Перед" }, vn: "trước khi", practices: [{ leftRu: "", rightRu: "ăn cơm, tôi rửa tay.", ans: "Trước khi", fullRu: "Trước khi ăn cơm, tôi rửa tay.", fullVn: { en: "Before eating, I wash my hands.", ru: "Перед едой я мою руки." } }, { leftRu: "Hãy gọi cho tôi", rightRu: "bạn đi.", ans: "trước khi", fullRu: "Hãy gọi cho tôi trước khi bạn đi.", fullVn: { en: "Call me before you go.", ru: "Позвони мне перед уходом." } }] },
                    { ru: "Sau khi", hint: { en: "After", ru: "После" }, vn: "sau khi", practices: [{ leftRu: "", rightRu: "làm việc, tôi về nhà.", ans: "Sau khi", fullRu: "Sau khi làm việc, tôi về nhà.", fullVn: { en: "After working, I go home.", ru: "После работы я иду домой." } }, { leftRu: "Nghỉ ngơi", rightRu: "chạy bộ.", ans: "sau khi", fullRu: "Nghỉ ngơi sau khi chạy bộ.", fullVn: { en: "Rest after jogging.", ru: "Отдохни после пробежки." } }] },
                    { ru: "Sau đó", hint: { en: "Then", ru: "Затем" }, vn: "sau đó", practices: [{ leftRu: "Tôi tắm,", rightRu: "tôi ngủ.", ans: "sau đó", fullRu: "Tôi tắm, sau đó tôi ngủ.", fullVn: { en: "I take a shower, then I sleep.", ru: "Я принимаю душ, затем ложусь спать." } }, { leftRu: "Ăn cơm xong,", rightRu: "đi chơi.", ans: "sau đó", fullRu: "Ăn cơm xong, sau đó đi chơi.", fullVn: { en: "Finish eating, then go out.", ru: "Поешь, а потом иди гулять." } }] },
                    { ru: "Buổi sáng", hint: { en: "Morning", ru: "Утро" }, vn: "buổi sáng", practices: [{ leftRu: "", rightRu: "tôi uống cà phê.", ans: "Buổi sáng", fullRu: "Buổi sáng tôi uống cà phê.", fullVn: { en: "In the morning I drink coffee.", ru: "Утром я пью кофе." } }, { leftRu: "Chào", rightRu: "!", ans: "buổi sáng", fullRu: "Chào buổi sáng!", fullVn: { en: "Good morning!", ru: "Доброе утро!" } }] },
                    { ru: "Buổi chiều", hint: { en: "Afternoon", ru: "День" }, vn: "buổi chiều", practices: [{ leftRu: "", rightRu: "trời thường mưa.", ans: "Buổi chiều", fullRu: "Buổi chiều trời thường mưa.", fullVn: { en: "In the afternoon it often rains.", ru: "Днем часто идет дождь." } }, { leftRu: "Gặp bạn vào", rightRu: ".", ans: "buổi chiều", fullRu: "Gặp bạn vào buổi chiều.", fullVn: { en: "See you in the afternoon.", ru: "Увидимся днем." } }] },
                    { ru: "Buổi tối", hint: { en: "Evening", ru: "Вечер" }, vn: "buổi tối", practices: [{ leftRu: "Tôi xem phim vào", rightRu: ".", ans: "buổi tối", fullRu: "Tôi xem phim vào buổi tối.", fullVn: { en: "I watch movies in the evening.", ru: "Вечером я смотрю кино." } }, { leftRu: "Chúc", rightRu: "tốt lành!", ans: "buổi tối", fullRu: "Chúc buổi tối tốt lành!", fullVn: { en: "Have a good evening!", ru: "Приятного вечера!" } }] },
                    { ru: "Sáng hôm qua", hint: { en: "Yesterday morning", ru: "Вчера утром" }, vn: "sáng hôm qua", practices: [{ leftRu: "", rightRu: "tôi dậy muộn.", ans: "Sáng hôm qua", fullRu: "Sáng hôm qua tôi dậy muộn.", fullVn: { en: "Yesterday morning I woke up late.", ru: "Вчера утром я поздно проснулся." } }, { leftRu: "Tôi đã gặp anh ấy", rightRu: ".", ans: "sáng hôm qua", fullRu: "Tôi đã gặp anh ấy sáng hôm qua.", fullVn: { en: "I met him yesterday morning.", ru: "Я встретил его вчера утром." } }] },
                    { ru: "Chiều hôm nay", hint: { en: "This afternoon", ru: "Cегодня днем" }, vn: "chiều hôm nay", practices: [{ leftRu: "", rightRu: "chúng tôi đi họp.", ans: "Chiều hôm nay", fullRu: "Chiều hôm nay chúng tôi đi họp.", fullVn: { en: "This afternoon we have a meeting.", ru: "Сегодня днем у нас собрание." } }, { leftRu: "Bạn bận không", rightRu: "?", ans: "chiều hôm nay", fullRu: "Bạn bận không chiều hôm nay?", fullVn: { en: "Are you busy this afternoon?", ru: "Ты занят сегодня днем?" } }] },
                    { ru: "Tối ngày mai", hint: { en: "Tomorrow evening", ru: "Завтра вечером" }, vn: "tối ngày mai", practices: [{ leftRu: "Tôi sẽ nấu ăn vào", rightRu: ".", ans: "tối ngày mai", fullRu: "Tôi sẽ nấu ăn vào tối ngày mai.", fullVn: { en: "I will cook tomorrow evening.", ru: "Завтра вечером я буду готовить." } }, { leftRu: "", rightRu: "hãy đến nhà tôi.", ans: "Tối ngày mai", fullRu: "Tối ngày mai hãy đến nhà tôi.", fullVn: { en: "Tomorrow evening please come to my house.", ru: "Завтра вечером приходи ко мне." } }] }
                ]
            }
        ];

        let levelData = [], currentLevelIdx = 0, currentLevel = null, currentRound = 0, currentSubRound = 0, currentPhase = 1, animationFrames = [];
        const gameCanvas = document.getElementById('game-canvas'), floatingArea = document.getElementById('floating-area'), overlay = document.getElementById('success-overlay');

        function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

        function startGame(idx) {
            levelData = JSON.parse(JSON.stringify(rawData));
            levelData[idx].vocabulary = shuffle([...levelData[idx].vocabulary]);
            currentLevelIdx = idx; currentLevel = levelData[idx]; currentRound = 0; currentSubRound = 0; currentPhase = 1;
            document.getElementById('start-screen').style.display = 'none'; initRound();
        }

        function handleNext() {
            if (currentPhase === 1) {
                if (currentRound < currentLevel.vocabulary.length - 1) { currentRound++; initRound(); }
                else { currentPhase = 2; currentRound = 0; currentSubRound = 0; 
                    let p = []; currentLevel.vocabulary.forEach((w, i) => { p.push({wordIdx: i, practiceIdx: 0}, {wordIdx: i, practiceIdx: 1}); });
                    currentLevel.practiceSequence = shuffle(p); initRound();
                }
            } else {
                if (currentSubRound < currentLevel.practiceSequence.length - 1) { currentSubRound++; initRound(); }
                else { document.getElementById('start-screen').style.display = 'flex'; }
            }
        }

        function handlePrev() {
            if (currentPhase === 1) { if (currentRound > 0) { currentRound--; initRound(); } else document.getElementById('start-screen').style.display = 'flex'; }
            else { if (currentSubRound > 0) { currentSubRound--; initRound(); } else { currentPhase = 1; currentRound = currentLevel.vocabulary.length - 1; initRound(); } }
        }

        function updateHeaderUI() {
            document.getElementById('lvl-name').innerText = currentLevel.name[currentLang];
            document.getElementById('phase-tag').innerText = \`PHASE \${currentPhase}\`;
            const dots = document.getElementById('round-indicators'); dots.innerHTML = '';
            const total = currentPhase === 1 ? currentLevel.vocabulary.length : currentLevel.practiceSequence.length;
            const current = currentPhase === 1 ? currentRound : currentSubRound;
            for(let i=0; i<total; i++) {
                const dot = document.createElement('div');
                dot.className = \`dot \${i === current ? 'active' : (i < current ? 'bg-white/60' : '')}\`;
                dots.appendChild(dot);
            }
        }

        function initRound() {
            animationFrames.forEach(cancelAnimationFrame); animationFrames = [];
            gameCanvas.innerHTML = ''; floatingArea.innerHTML = ''; updateHeaderUI();
            if (currentPhase === 1) renderPhase1(); else renderPhase2();
        }

        function renderPhase1() {
            const word = currentLevel.vocabulary[currentRound];
            const card = document.createElement('div');
            card.className = 'main-card animate-pop';
            card.innerHTML = \`<div class="russian-word-big">\${word.ru}</div><div class="text-white/30 text-[10px] italic font-bold">/ \${word.hint[currentLang]} /</div><div class="drop-zone w-full" data-target="\${word.vn}"><span class="text-white/20 font-black uppercase text-[10px]">\${translations[currentLang].dropText}</span></div><div class="text-yellow-400 font-bold uppercase text-[10px]">\${translations[currentLang].question}</div>\`;
            gameCanvas.appendChild(card); createFloating(word.vn, word.ru);
        }

        function createFloating(text, ru) {
            const el = document.createElement('div'); el.className = 'floating-word pointer-events-auto'; el.innerText = text; floatingArea.appendChild(el);
            let x = Math.random() * (window.innerWidth - 150) + 50, y = Math.random() * (window.innerHeight - 250) + 150, dx = (Math.random() - 0.5) * 1.5, dy = (Math.random() - 0.5) * 1.5;
            function move() {
                if (el.dataset.dragging !== 'true') {
                    if (x < 20 || x > window.innerWidth - 120) dx *= -1;
                    if (y < 100 || y > window.innerHeight - 80) dy *= -1;
                    x += dx; y += dy; el.style.left = x + 'px'; el.style.top = y + 'px';
                }
                animationFrames.push(requestAnimationFrame(move));
            }
            const onUp = () => {
                el.dataset.dragging = 'false'; const dz = document.querySelector('.drop-zone');
                if (dz && dz.classList.contains('hover')) {
                    dz.innerHTML = \`<span class="text-white font-black uppercase animate-pop">\${text}</span>\`;
                    ringtone.currentTime = 0; ringtone.play(); confetti({ particleCount: 60, spread: 50 });
                    playTTS(ru); el.remove(); setTimeout(showSuccess, 800);
                }
                window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp);
                window.removeEventListener('touchmove', onMove); window.removeEventListener('touchend', onUp);
            };
            const onMove = (m) => {
                const cx = m.touches ? m.touches[0].clientX : m.clientX, cy = m.touches ? m.touches[0].clientY : m.clientY;
                x = cx - el.offsetWidth/2; y = cy - el.offsetHeight/2; el.style.left = x + 'px'; el.style.top = y + 'px';
                const dz = document.querySelector('.drop-zone'), r1 = dz.getBoundingClientRect(), r2 = el.getBoundingClientRect();
                if (!(r2.left > r1.right || r2.right < r1.left || r2.top > r1.bottom || r2.bottom < r1.top)) dz.classList.add('hover'); else dz.classList.remove('hover');
            };
            el.onmousedown = el.ontouchstart = (e) => { el.dataset.dragging = 'true'; window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp); window.addEventListener('touchmove', onMove); window.addEventListener('touchend', onUp); };
            move();
        }

        function renderPhase2() {
            const step = currentLevel.practiceSequence[currentSubRound], word = currentLevel.vocabulary[step.wordIdx], practice = word.practices[step.practiceIdx];
            const container = document.createElement('div'); container.className = 'classic-layout animate-pop';
            container.innerHTML = \`<div class="sentence-row-container"><div class="sentence-row">\${practice.leftRu ? \`<span class="sentence-part">\${practice.leftRu}</span>\` : ''}<div class="drop-zone" data-target="\${practice.ans}"><span class="text-white/20 font-black uppercase text-[10px]">\${translations[currentLang].dropStep2}</span></div>\${practice.rightRu ? \`<span class="sentence-part">\${practice.rightRu}</span>\` : ''}</div><div class="text-yellow-400 font-bold text-center mt-4 uppercase tracking-widest text-[11px] md:text-sm">\${practice.fullVn[currentLang]}</div></div><div class="choices-area" id="choices"></div>\`;
            gameCanvas.appendChild(container);
            const choices = shuffle([practice.ans, ...levelData[currentLevelIdx].vocabulary.filter(v => v.ru !== practice.ans).map(v => v.ru).slice(0, 3)]);
            choices.forEach(c => {
                const btn = document.createElement('div'); btn.className = 'floating-word relative pointer-events-auto'; btn.style.position = 'relative'; btn.style.left = '0'; btn.style.top = '0'; btn.innerText = c;
                btn.onmousedown = btn.ontouchstart = (e) => {
                    const clone = btn.cloneNode(true); clone.style.position = 'fixed'; clone.style.zIndex = '9999'; document.body.appendChild(clone);
                    const onMove = (m) => {
                        const cx = m.touches ? m.touches[0].clientX : m.clientX, cy = m.touches ? m.touches[0].clientY : m.clientY;
                        clone.style.left = (cx - clone.offsetWidth/2) + 'px'; clone.style.top = (cy - clone.offsetHeight/2) + 'px';
                        const dz = document.querySelector('.drop-zone'), r1 = dz.getBoundingClientRect(), r2 = clone.getBoundingClientRect();
                        if (!(r2.left > r1.right || r2.right < r1.left || r2.top > r1.bottom || r2.bottom < r1.top)) dz.classList.add('hover'); else dz.classList.remove('hover');
                    };
                    const onUp = () => {
                        const dz = document.querySelector('.drop-zone');
                        if (dz && dz.classList.contains('hover') && c === practice.ans) {
                            dz.innerHTML = \`<span class="text-white font-black uppercase animate-pop">\${c}</span>\`;
                            ringtone.currentTime = 0; ringtone.play(); confetti({ particleCount: 60 });
                            playTTS(practice.fullRu); clone.remove(); setTimeout(showSuccess, 800);
                        } else { clone.remove(); if (dz) dz.classList.remove('hover'); }
                        window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); window.removeEventListener('touchmove', onMove); window.removeEventListener('touchend', onUp);
                    };
                    window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp); window.addEventListener('touchmove', onMove); window.addEventListener('touchend', onUp);
                };
                document.getElementById('choices').appendChild(btn);
            });
        }

        function showSuccess() {
            const step = currentPhase === 1 ? { wordIdx: currentRound, practiceIdx: 0 } : currentLevel.practiceSequence[currentSubRound];
            const word = currentLevel.vocabulary[step.wordIdx], practice = word.practices[step.practiceIdx];
            document.getElementById('pop-target').innerText = word.ru;
            document.getElementById('pop-hint').innerText = \`/ \${word.hint[currentLang]} /\`;
            document.getElementById('pop-vn').innerText = word.vn;
            document.getElementById('ex-target').innerText = practice.fullRu;
            document.getElementById('ex-vn').innerText = practice.fullVn[currentLang];
            document.getElementById('pop-speaker-main').onclick = () => playTTS(word.ru);
            document.getElementById('next-round-btn').onclick = () => { overlay.style.display = 'none'; handleNext(); };
            overlay.style.display = 'flex';
        }
    </script>
</body>
</html>
`;

export const GameVocabularyTimePhrases: React.FC = () => {
    const gameWrapperRef = useRef<HTMLDivElement>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [iframeSrc, setIframeSrc] = useState<string | undefined>(undefined);

    useEffect(() => {
        const blob = new Blob([gameHTML], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        setIframeSrc(url);
        return () => URL.revokeObjectURL(url);
    }, []);

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

    return (
        <div ref={gameWrapperRef} className="relative w-full h-full bg-slate-900">
            {iframeSrc && (
                <iframe
                    src={iframeSrc}
                    className="w-full h-full"
                    style={{ border: 'none' }}
                    allow="fullscreen"
                    title="Vietnamese Time Phrases Game"
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

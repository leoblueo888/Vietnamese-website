
import React, { useState, useEffect, useRef } from 'react';
import { Maximize, Minimize } from 'lucide-react';

const gameHTML = `
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ask Question Viet: Ai</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@400;600;700&display=swap');

        body {
            font-family: 'Quicksand', sans-serif;
            background: #e2e8f0; 
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            margin: 0;
            overflow: hidden;
            touch-action: none;
        }

        .game-card {
            background: url('https://lh3.googleusercontent.com/d/1sZPluPZ6sYxKam1khri-glDqzI8g-u-E') no-repeat center center;
            background-size: cover;
            border-radius: 1.5rem;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4);
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            position: relative;
            overflow: hidden;
            border: 4px solid white;
        }

        .overlay {
            position: absolute;
            inset: 0;
            background: rgba(255, 255, 255, 0.95);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            padding: 20px; 
            text-align: center;
        }

        .game-title {
            background: linear-gradient(45deg, #4f46e5, #9333ea);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            font-size: 2.2rem; 
            font-weight: 800;
            line-height: 1.1;
            margin-bottom: 1.5rem; 
            text-transform: uppercase;
        }

        .how-to-play-box {
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 1rem;
            padding: 1.5rem; 
            width: 100%;
            max-width: 450px;
            text-align: left;
            margin-bottom: 1.5rem; 
            box-shadow: 0 4px 15px rgba(0,0,0,0.05);
        }

        .htp-step {
            display: flex;
            align-items: flex-start;
            gap: 12px;
            margin-bottom: 0.8rem; 
            font-size: 0.95rem; 
            color: #475569;
            font-weight: 600;
        }

        .step-num {
            background: linear-gradient(135deg, #6366f1, #4f46e5);
            color: white;
            width: 24px;
            height: 24px;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.8rem;
            flex-shrink: 0;
        }

        #game-header {
            flex-shrink: 0;
            background: rgba(255, 255, 255, 0.85);
            backdrop-filter: blur(10px);
            padding: 1rem 1.5rem;
            display: grid;
            grid-template-columns: 1fr auto 1fr; 
            align-items: center;
            z-index: 100;
            border-bottom: 1px solid rgba(255,255,255,0.3);
        }

        .nav-btn {
            background: white;
            border: 1px solid #e2e8f0;
            color: #4f46e5;
            width: 36px;
            height: 36px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            transition: all 0.2s;
        }
        .nav-btn:hover:not(:disabled) { background: #f5f3ff; border-color: #6366f1; transform: scale(1.05); }
        .nav-btn:disabled { opacity: 0.3; cursor: not-allowed; }

        .btn-next-round {
            background: #4f46e5;
            color: white;
            padding: 12px 28px;
            border-radius: 16px;
            font-weight: 900;
            font-size: 14px;
            opacity: 0.2;
            pointer-events: none;
            transition: all 0.3s;
            text-transform: uppercase;
            box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
        }
        .btn-next-round.enabled { opacity: 1; pointer-events: auto; }

        .scene-container {
            flex: 1;
            position: relative;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }

        .bubble-area {
            padding: 100px 20px 20px;
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
        }

        .bubble {
            padding: 1.2rem 1.8rem;
            border-radius: 1.5rem;
            width: fit-content; 
            max-width: 85%;
            box-shadow: 0 10px 30px rgba(0,0,0,0.15);
            background: white;
            position: relative;
        }

        .bubble-user-ans {
            align-self: flex-start;
            border: 3px solid #6366f1;
            background: #f5f3ff;
        }

        .bubble-ella-quest {
            align-self: flex-end;
            border-right: 8px solid #0ea5e9;
            text-align: right;
        }

        .drop-zone {
            border: 3px dashed #6366f1;
            background: rgba(255, 255, 255, 0.8);
            min-height: 90px;
            border-radius: 1.5rem;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #6366f1;
            font-weight: 800;
            padding: 15px 30px;
            width: fit-content; 
            max-width: 85%;
        }

        .word-chip {
            display: inline-block;
            cursor: pointer;
            padding: 2px 4px;
            font-weight: 700;
            border-radius: 6px;
            transition: all 0.2s;
            margin: 0 0.5px;
            position: relative;
        }
        
        .word-chip:hover {
            background-color: #cbd5e1;
            color: #1e293b;
        }

        .grammar-word {
            text-decoration: underline dotted #6366f1;
            color: #4338ca;
        }

        .audio-group-highlight {
            background-color: #dbeafe;
            color: #1e40af;
            border-bottom: 2px solid #3b82f6;
        }

        .sync-highlight {
            background-color: #fef08a !important; 
            color: #854d0e !important;
            transform: scale(1.05);
        }

        .translation-highlight {
            color: #ef4444; 
            font-weight: 800;
            transition: all 0.2s;
        }

        .draggable-item {
            position: absolute;
            background: white;
            padding: 15px 25px;
            border-radius: 1.5rem;
            box-shadow: 0 15px 40px rgba(0,0,0,0.2);
            border: 2px solid #6366f1;
            cursor: grab;
            user-select: none;
            width: fit-content;
            min-width: 180px;
            max-width: 320px;
            text-align: center;
            z-index: 100;
            animation: floating 4s ease-in-out infinite;
        }

        .mini-speaker {
            cursor: pointer;
            padding: 10px;
            border-radius: 50%;
            background: #f0f9ff;
            border: 1px solid #bae6fd;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.2rem;
            transition: transform 0.2s;
        }
        .mini-speaker:hover { transform: scale(1.1); background: #e0f2fe; }

        .hidden { display: none !important; }

        @keyframes floating {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-15px); }
        }

        .review-page {
            position: absolute;
            inset: 0;
            background: white;
            z-index: 200;
            display: flex;
            flex-direction: column;
        }

        .review-header {
            padding: 20px 30px;
            background: #f8fafc;
            border-bottom: 2px solid #e2e8f0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .btn-listen-all {
            background: #10b981;
            color: white;
            padding: 10px 20px;
            border-radius: 12px;
            font-weight: 800;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: all 0.2s;
        }
        .btn-listen-all:hover { background: #059669; transform: translateY(-2px); }

        .word-chip[title]:hover::after {
            content: attr(title);
            position: absolute;
            bottom: 125%;
            left: 50%;
            transform: translateX(-50%);
            background: #1e293b;
            color: white;
            padding: 8px 12px;
            border-radius: 8px;
            font-size: 12px;
            white-space: pre-wrap;
            width: 200px;
            z-index: 1000;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            text-align: center;
            font-weight: 400;
            line-height: 1.4;
        }
    </style>
</head>
<body onload="initApp()">

    <div class="game-card" id="main-card">
        <!-- START WINDOW -->
        <div id="start-overlay" class="overlay">
            <h1 class="game-title">ASK QUESTION<br>VIET: AI</h1>
            
            <div class="how-to-play-box">
                <div class="htp-step">
                    <span class="step-num">1</span>
                    <span id="step-1-text">Đọc câu trả lời của AI.</span>
                </div>
                <div class="htp-step">
                    <span class="step-num">2</span>
                    <span id="step-2-text">Kéo đúng "Câu hỏi" vào ô trống.</span>
                </div>
                <div class="htp-step">
                    <span class="step-num">3</span>
                    <span id="step-3-text">Di chuột vào từ để hỏi để xem nghĩa.</span>
                </div>
            </div>

            <div class="flex gap-4 mb-8 w-full max-w-[400px]">
                <button id="lang-en" onclick="setLang('en')" class="w-full py-3 rounded-xl font-bold transition-all border-2 border-indigo-600 bg-indigo-50 text-indigo-700">ENGLISH</button>
                <button id="lang-ru" onclick="setLang('ru')" class="w-full py-3 rounded-xl font-bold transition-all border-2 border-slate-200">RUSSIAN</button>
            </div>

            <button id="btn-start" onclick="startGame()" class="w-full max-w-[400px] py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase shadow-lg transform transition active:scale-95">BẮT ĐẦU NGAY</button>
        </div>

        <!-- Header -->
        <div id="game-header" class="hidden">
            <div class="flex flex-col">
                <span id="topic-label" class="text-[10px] font-black text-blue-600 uppercase tracking-wider">CHỦ ĐỀ CÔNG NGHỆ AI</span>
                <div class="flex items-center gap-3">
                    <button onclick="prevRound()" id="prev-btn" class="nav-btn">←</button>
                    <h2 id="round-title" class="text-[14px] font-black text-slate-900 min-w-[80px] text-center">ROUND 1/8</h2>
                    <button onclick="skipRound()" id="skip-btn" class="nav-btn">→</button>
                </div>
            </div>
            
            <button id="next-round-btn" onclick="nextRound()" class="btn-next-round">TIẾP THEO →</button>
            <div class="w-[100px]"></div>
        </div>

        <div class="scene-container" id="scene-root">
            <div class="bubble-area" id="bubble-list"></div>
            <div class="floating-box-container" id="floating-box"></div>
            
            <!-- REVIEW PAGE -->
            <div id="review-page" class="review-page hidden">
                <div class="review-header">
                    <div>
                        <h2 id="review-title" class="text-2xl font-black text-slate-800 uppercase">TỔNG KẾT BÀI HỌC</h2>
                        <p class="text-sm text-slate-500 font-bold" id="review-subtitle">Ôn tập các câu hỏi về AI</p>
                    </div>
                    <button id="btn-listen-all" onclick="listenAll()" class="btn-listen-all">
                        <span>🔊</span> <span id="text-listen-all">Listen All</span>
                    </button>
                </div>
                <div id="review-list" class="overflow-y-auto flex-1 space-y-4 p-6"></div>
                <div class="p-6 bg-white border-t border-slate-100">
                    <button id="btn-replay" onclick="location.reload()" class="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase shadow-xl hover:bg-indigo-700 transition-all">Chơi lại</button>
                </div>
            </div>
        </div>
    </div>

    <script>
        let currentAudio = null;
        let isSpeakingBatch = false;

        const translations = {
            en: {
                step1: "Read the AI's response.",
                step2: "Drag the correct 'Question' into the blank.",
                step3: "Hover over question words to see meanings.",
                btnStart: "START NOW",
                topic: "AI TECHNOLOGY TOPIC",
                next: "NEXT →",
                dropPlaceholder: "Drag question here...",
                reviewTitle: "LESSON SUMMARY",
                reviewSubtitle: "Review AI-related questions",
                listenAll: "Listen All",
                btnReplay: "PLAY AGAIN",
                round: "ROUND",
                tooltipNo: "Indicates a YES/NO question. It has no meaning on its own.",
                tooltipHay: "Indicates choice question (A or B). Means 'OR', specifically for questions."
            },
            ru: {
                step1: "Прочитайте ответ ИИ.",
                step2: "Перетащите правильный «Вопрос» в поле.",
                step3: "Наведите на вопросительные слова.",
                btnStart: "НАЧАТЬ СЕЙЧАС",
                topic: "ТЕМА: ТЕХНОЛОГИИ ИИ",
                next: "ДАЛЕЕ →",
                dropPlaceholder: "Перетащите вопрос сюда...",
                reviewTitle: "ИТОГИ УРОКА",
                reviewSubtitle: "Обзор вопросов об ИИ",
                listenAll: "Слушать всё",
                btnReplay: "ИГРАТЬ СНОВА",
                round: "РАУНД",
                tooltipNo: "Указывает на вопрос ДА/НЕТ. Само по себе не имеет значения.",
                tooltipHay: "Указывает на выбор между А и Б. Означает 'ИЛИ' для вопросов."
            }
        };

        const questionWordMap = {
            "gì": ["what"],
            "thế nào": ["how"],
            "bao giờ": ["when", "which year"],
            "ở đâu": ["where"],
            "nào": ["which"]
        };

        const travelData = [
            { q: "Bạn có hay dùng AI không?", ans: "Có! Tôi dùng AI hàng ngày.", en: "Do you often use AI?", ansEn: "Yes! I use AI every day.", distractors: ["AI là cái gì?", "Bạn thích ăn gì?"], distractorsEn: ["What is AI?", "What do you like to eat?"] },
            { q: "Bạn bắt đầu dùng AI từ năm nào?", ans: "Tôi bắt đầu dùng AI vào năm 2024.", en: "In which year did you start using AI?", ansEn: "I started using AI in 2024.", distractors: ["Bạn bao nhiêu tuổi?", "AI có đắt không?"], distractorsEn: ["How old are you?", "Is AI expensive?"] },
            { q: "Bạn thường dùng công cụ AI nào?", ans: "Tôi dùng Google Gemini, DeepSeek, Chat GPT.", en: "Which AI tools do you usually use?", ansEn: "I use Google Gemini, DeepSeek, Chat GPT.", distractors: ["Bạn có máy tính không?", "Bạn ở đâu?"], distractorsEn: ["Do you have a computer?", "Where are you?"] },
            { q: "Bạn dùng AI cho học tập hay công việc?", ans: "Tôi dùng AI cho cả hai.", en: "Do you use AI for study or work?", ansEn: "I use AI for both.", distractors: ["AI có khó không?", "Bạn thích màu gì?"], distractorsEn: ["Is AI difficult?", "What color do you like?"] },
            { q: "Bạn thấy AI hữu ích như thế nào?", ans: "AI giúp tôi học tập và làm việc hiệu quả hơn rất nhiều.", en: "How useful do you find AI?", ansEn: "AI helps me study and work much more efficiently.", distractors: ["Ai là người tạo ra AI?", "Bạn có điện thoại không?"], distractorsEn: ["Who created AI?", "Do you have a phone?"] },
            { q: "Bạn dùng AI mấy tiếng một ngày?", ans: "Chắc cũng vài tiếng một ngày.", en: "How many hours a day do you use AI?", ansEn: "Probably a few hours a day.", distractors: ["Bạn ngủ lúc mấy giờ?", "Mấy giờ rồi?"], distractorsEn: ["What time do you sleep?", "What time is it?"] },
            { q: "AI có giúp bạn thông minh hơn không?", ans: "Chắc chắn rồi.", en: "Does AI help you become smarter?", ansEn: "Certainly.", distractors: ["Bạn tên là gì?", "Bạn có thích đọc sách?"], distractorsEn: ["What is your name?", "Do you like reading?"] },
            { q: "Bạn nghĩ AI sẽ phát triển như thế nào trong tương lai?", ans: "AI sẽ thông minh hơn và giúp con người nhiều hơn nữa.", en: "How do you think AI will develop in the future?", ansEn: "AI will be smarter and help humans even more.", distractors: ["Hôm nay trời thế nào?", "Xe buýt mấy giờ đến?"], distractorsEn: ["How is the weather today?", "What time does the bus arrive?"] }
        ];

        const audioGroups = [
            "hàng ngày", "bắt đầu", "năm nào", "công cụ", "học tập", 
            "công việc", "cả hai", "làm việc", "hiệu quả", "rất nhiều", 
            "hữu ích", "như thế nào", "chắc cũng", "thông minh", "con người", "nhiều hơn", "chắc chắn"
        ];

        let currentRound = 0, userLang = 'en', roundSolved = false;
        const successSound = new Audio("https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3");

        function initApp() { setLang('en'); }

        function setLang(lang) {
            userLang = lang;
            const t = translations[lang];
            document.getElementById('step-1-text').innerText = t.step1;
            document.getElementById('step-2-text').innerText = t.step2;
            document.getElementById('step-3-text').innerText = t.step3;
            document.getElementById('btn-start').innerText = t.btnStart;
            document.getElementById('topic-label').innerText = t.topic;
            document.getElementById('next-round-btn').innerText = t.next;
            document.getElementById('review-title').innerText = t.reviewTitle;
            document.getElementById('review-subtitle').innerText = t.reviewSubtitle;
            document.getElementById('text-listen-all').innerText = t.listenAll;
            document.getElementById('btn-replay').innerText = t.btnReplay;
            document.getElementById('lang-en').className = \`w-full py-3 rounded-xl font-bold transition-all border-2 \${lang==='en' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200'}\`;
            document.getElementById('lang-ru').className = \`w-full py-3 rounded-xl font-bold transition-all border-2 \${lang==='ru' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200'}\`;
            if (document.getElementById('start-overlay').classList.contains('hidden')) loadRound();
        }

        function startGame() {
            document.getElementById('start-overlay').classList.add('hidden');
            document.getElementById('game-header').classList.remove('hidden');
            loadRound();
        }

        function loadRound() {
            roundSolved = false;
            document.getElementById('next-round-btn').classList.remove('enabled');
            const t = translations[userLang];
            document.getElementById('round-title').innerText = \`\${t.round} \${currentRound + 1}/\${travelData.length}\`;
            const list = document.getElementById('bubble-list');
            list.innerHTML = '';
            const data = travelData[currentRound];

            const dropZone = document.createElement('div');
            dropZone.className = 'drop-zone';
            dropZone.id = 'drop-target';
            dropZone.innerText = t.dropPlaceholder;
            list.appendChild(dropZone);

            const ansBubble = document.createElement('div');
            ansBubble.className = 'bubble bubble-ella-quest';
            ansBubble.innerHTML = \`
                <div class="flex flex-row-reverse items-start gap-3">
                    <div class="mini-speaker" onclick="event.preventDefault(); event.stopPropagation(); speakText('\${data.ans.replace(/'/g, "\\\\'")}')">🔊</div>
                    <div>
                        <div class="text-[19px] font-bold leading-relaxed">\${renderWords(data.ans, false)}</div>
                        <div class="text-[13px] text-blue-500 italic font-semibold mt-1">\${renderTranslation(data.ansEn)}</div>
                    </div>
                </div>\`;
            list.appendChild(ansBubble);
            renderDraggables();
        }

        function renderTranslation(text) {
            let words = text.split(' ');
            return words.map(w => {
                let clean = w.toLowerCase().replace(/[?.!,]/g, '');
                return \`<span class="trans-word" data-keyword="\${clean}">\${w}</span>\`;
            }).join(' ');
        }

        function renderWords(text, isQuestion) {
            const words = text.split(' ');
            let html = [];
            let i = 0;
            const t = translations[userLang];
            const lowerText = text.toLowerCase();

            while (i < words.length) {
                let foundMatch = false;
                
                if (i + 2 < words.length) {
                    const p3_clean = words.slice(i, i + 3).join(' ').toLowerCase().replace(/[?.!,]/g, '');
                    if (audioGroups.includes(p3_clean)) {
                        const key = Object.keys(questionWordMap).find(k => p3_clean.includes(k)) || "";
                        for (let j = 0; j < 3; j++) {
                            html.push(\`<span class="word-chip audio-group-highlight" data-qkey="\${key}" onmouseover="syncHover(this, true)" onmouseout="syncHover(this, false)" onclick="event.preventDefault(); event.stopPropagation(); speakText(this.innerText.trim())">\${words[i+j]}</span>\`);
                        }
                        i += 3; foundMatch = true;
                    }
                }
                
                if (!foundMatch && i + 1 < words.length) {
                    const p2_clean = words.slice(i, i + 2).join(' ').toLowerCase().replace(/[?.!,]/g, '');
                    if (audioGroups.includes(p2_clean)) {
                        const key = Object.keys(questionWordMap).find(k => p2_clean.includes(k)) || "";
                        for (let j = 0; j < 2; j++) {
                            html.push(\`<span class="word-chip audio-group-highlight" data-qkey="\${key}" onmouseover="syncHover(this, true)" onmouseout="syncHover(this, false)" onclick="event.preventDefault(); event.stopPropagation(); speakText(this.innerText.trim())">\${words[i+j]}</span>\`);
                        }
                        i += 2; foundMatch = true;
                    }
                }
                
                if (!foundMatch) {
                    const p1_clean = words[i].toLowerCase().replace(/[?.!,]/g, '');
                    const isGroup = audioGroups.includes(p1_clean);
                    const key = Object.keys(questionWordMap).find(k => p1_clean === k) || "";
                    let tooltip = "";
                    let grammarClass = "";
                    
                    if (isQuestion && p1_clean === "không" && i === words.length - 1) {
                        tooltip = \`title="\${t.tooltipNo}"\`;
                        grammarClass = "grammar-word";
                    }
                    if (isQuestion && currentRound !== 0 && p1_clean === "hay" && lowerText.includes(" hay ")) {
                        tooltip = \`title="\${t.tooltipHay}"\`;
                        grammarClass = "grammar-word";
                    }

                    html.push(\`<span class="word-chip \${isGroup ? 'audio-group-highlight' : ''} \${grammarClass}" \${tooltip} data-qkey="\${key}" onmouseover="syncHover(this, true)" onmouseout="syncHover(this, false)" onclick="event.preventDefault(); event.stopPropagation(); speakText(this.innerText.trim())">\${words[i]}</span>\`);
                    i++;
                }
            }
            return html.join('');
        }

        function speakText(fullText, onEndCallback = null) {
            if (!fullText) return;

            if (currentAudio) {
                currentAudio.pause();
                currentAudio.currentTime = 0;
            }

            const segments = fullText.split(/([,.;!?])/g).filter(s => s.trim().length > 0);
            let segmentIdx = 0;

            const playNextSegment = () => {
                if (segmentIdx >= segments.length) {
                    if (onEndCallback) onEndCallback();
                    return;
                }

                const currentSegment = segments[segmentIdx];
                
                if (currentSegment.match(/[,.;!?]/)) {
                    let pauseTime = 300; 
                    if (currentSegment.match(/[.;!?]/)) pauseTime = 600; 
                    
                    segmentIdx++;
                    setTimeout(playNextSegment, pauseTime);
                } else {
                    const url = \`https://translate.google.com/translate_tts?ie=UTF-8&q=\${encodeURIComponent(currentSegment.trim())}&tl=vi&client=tw-ob\`;
                    currentAudio = new Audio(url);
                    currentAudio.onended = () => {
                        segmentIdx++;
                        playNextSegment();
                    };
                    currentAudio.play().catch(e => {
                        segmentIdx++;
                        playNextSegment();
                    });
                }
            };

            playNextSegment();
        }

        function syncHover(el, active) {
            const key = el.dataset.qkey;
            if (!key || !questionWordMap[key]) return;
            document.querySelectorAll(\`[data-qkey="\${key}"]\`).forEach(node => {
                if(active) node.classList.add('sync-highlight');
                else node.classList.remove('sync-highlight');
            });
            const targets = questionWordMap[key];
            document.querySelectorAll('.trans-word').forEach(node => {
                if(active && targets.includes(node.dataset.keyword)) node.classList.add('translation-highlight');
                else node.classList.remove('translation-highlight');
            });
        }

        function renderDraggables() {
            const box = document.getElementById('floating-box');
            box.innerHTML = '';
            const data = travelData[currentRound];
            const opts = [{vi: data.q, correct: true, trans: data.en}, {vi: data.distractors[0], correct: false, trans: data.distractorsEn[0]}, {vi: data.distractors[1], correct: false, trans: data.distractorsEn[1]}].sort(() => Math.random() - 0.5);
            opts.forEach((opt, i) => {
                const el = document.createElement('div');
                el.className = 'draggable-item';
                el.dataset.correct = opt.correct;
                el.innerHTML = \`<p class="text-[16px] font-black text-indigo-950">\${opt.vi}</p><p class="text-[12px] text-slate-500 italic mt-1 font-semibold">\${opt.trans}</p>\`;
                el.style.left = \`\${5 + i * 32}%\`; el.style.top = \`72%\`;
                el.addEventListener('mousedown', startDrag); el.addEventListener('touchstart', startDrag, {passive: false});
                box.appendChild(el);
            });
        }

        let isDragging = false, draggedElement = null, offset = {x:0, y:0};
        function startDrag(e) {
            if (roundSolved) return;
            isDragging = true; draggedElement = e.currentTarget;
            const cx = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
            const cy = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;
            const r = draggedElement.getBoundingClientRect();
            offset = { x: cx - r.left, y: cy - r.top };
            document.addEventListener('mousemove', onDrag); document.addEventListener('touchmove', onDrag, {passive: false});
            document.addEventListener('mouseup', endDrag); document.addEventListener('touchend', endDrag);
        }

        function onDrag(e) {
            if (!isDragging) return;
            if (e.type === 'touchmove') e.preventDefault();
            const cx = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
            const cy = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;
            const pr = document.getElementById('scene-root').getBoundingClientRect();
            draggedElement.style.left = (cx - pr.left - offset.x) + 'px';
            draggedElement.style.top = (cy - pr.top - offset.y) + 'px';
        }

        function endDrag(e) {
            if (!draggedElement) return;
            isDragging = false;
            const target = document.getElementById('drop-target');
            if (!target) return;
            const tr = target.getBoundingClientRect();
            const cx = e.type === 'touchend' ? e.changedTouches[0].clientX : e.clientX;
            const cy = e.type === 'touchend' ? e.changedTouches[0].clientY : e.clientY;
            if (cx > tr.left && cx < tr.right && cy > tr.top && cy < tr.bottom && draggedElement.dataset.correct === "true") handleCorrect();
            else if (cx > tr.left && cx < tr.right && cy > tr.top && cy < tr.bottom) {
                draggedElement.style.borderColor = "#ef4444";
            }
            document.removeEventListener('mousemove', onDrag); document.removeEventListener('touchmove', onDrag);
        }

        function handleCorrect() {
            roundSolved = true;
            successSound.currentTime = 0;
            successSound.play();
            confetti({ particleCount: 60, spread: 80, origin: { y: 0.6 } });
            
            const data = travelData[currentRound];
            const target = document.getElementById('drop-target');
            target.innerHTML = \`
                <div class="flex items-start gap-4 text-left">
                    <div class="mini-speaker" onclick="event.preventDefault(); event.stopPropagation(); speakText('\${data.q.replace(/'/g, "\\\\'")}')">🔊</div>
                    <div>
                        <div class="text-[19px] font-bold leading-relaxed">\${renderWords(data.q, true)}</div>
                        <div class="text-[13px] text-indigo-500 italic font-semibold mt-1">\${renderTranslation(data.en)}</div>
                    </div>
                </div>\`;
            target.className = 'bubble bubble-user-ans shadow-xl';
            if(draggedElement) draggedElement.remove();
            document.getElementById('next-round-btn').classList.add('enabled');

            speakText(data.q, () => {
                setTimeout(() => {
                    speakText(data.ans);
                }, 400); 
            });
        }

        function nextRound() { if (currentRound < travelData.length - 1) { currentRound++; loadRound(); } else showReview(); }
        function prevRound() { if (currentRound > 0) { currentRound--; loadRound(); } }
        function skipRound() { if (currentRound < travelData.length - 1) { currentRound++; loadRound(); } }

        function showReview() {
            document.getElementById('game-header').classList.add('hidden');
            document.getElementById('review-page').classList.remove('hidden');
            const list = document.getElementById('review-list');
            list.innerHTML = '';
            travelData.forEach((item, idx) => {
                const div = document.createElement('div');
                div.className = 'p-5 bg-indigo-50 rounded-2xl border border-indigo-100 flex justify-between items-center shadow-sm';
                div.innerHTML = \`
                    <div class="flex-1">
                        <div class="flex items-center gap-2 mb-1">
                            <span class="text-[10px] bg-indigo-200 text-indigo-700 px-2 py-0.5 rounded-md font-black uppercase">Q\${idx+1}</span>
                            <b class="text-indigo-900 text-lg">\${item.q}</b>
                        </div>
                        <span class="text-slate-500 text-sm italic font-bold ml-8">\${item.en}</span>
                    </div>
                    <div class="mini-speaker ml-4" onclick="event.preventDefault(); event.stopPropagation(); speakText(this.parentElement.querySelector('b').innerText)">🔊</div>\`;
                list.appendChild(div);
            });
        }

        async function listenAll() {
            const btn = document.getElementById('btn-listen-all');
            btn.style.opacity = "0.5";
            btn.style.pointerEvents = "none";
            for (const item of travelData) {
                speakText(item.q);
                await new Promise(r => setTimeout(r, item.q.length * 150 + 1500));
            }
            btn.style.opacity = "1";
            btn.style.pointerEvents = "auto";
        }
    </script>
</body>
</html>
`;

export const GameAIMakeQuestion: React.FC = () => {
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
                    title="Make Question Game - Artificial Intelligence (AI)"
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

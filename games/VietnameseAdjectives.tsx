import React, { useEffect, useState } from 'react';

const gameHTML = `
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Vietnamese Adjectives 1</title>
    <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js"></script>
    <style>
        :root {
            --primary-bg: #f0f4f8;
            --card-bg: #ffffff;
            --accent-color: #6c5ce7;
            --drop-zone-border: #00b894;
            --text-dark: #2d3436;
            --secondary-color: #a29bfe;
        }

        * { box-sizing: border-box; user-select: none; -webkit-tap-highlight-color: transparent; }

        body {
            margin: 0; padding: 0;
            font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background: var(--primary-bg);
            overflow: hidden;
            height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            touch-action: none;
        }

        #start-screen {
            position: fixed;
            top: 0; left: 0; width: 100%; height: 100%;
            background: linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%);
            z-index: 9999;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 10px;
        }

        .start-card {
            background: white;
            padding: 25px;
            border-radius: 30px;
            box-shadow: 0 20px 50px rgba(0,0,0,0.2);
            text-align: center;
            max-width: 450px;
            width: 100%;
            max-height: 95vh;
            overflow-y: auto;
        }

        .game-title {
            font-size: 26px;
            font-weight: 900;
            color: var(--accent-color);
            margin: 0 0 15px 0;
            text-transform: uppercase;
        }

        .how-to-play {
            background: #f1f2f6;
            padding: 12px;
            border-radius: 15px;
            text-align: left;
            margin-bottom: 15px;
        }

        .how-to-play h3 {
            margin: 0 0 8px 0;
            font-size: 14px;
            color: var(--accent-color);
            text-transform: uppercase;
        }

        .how-to-play ul {
            margin: 0;
            padding-left: 18px;
            font-size: 13px;
            color: #636e72;
            line-height: 1.4;
        }

        .section-label {
            font-size: 12px;
            font-weight: 800;
            color: #b2bec3;
            text-transform: uppercase;
            margin-bottom: 8px;
            display: block;
        }

        .group-section {
            margin-bottom: 15px;
        }

        .group-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 10px;
        }

        .group-btn, .lang-btn {
            aspect-ratio: 1;
            font-size: 16px;
            font-weight: 900;
            border: 2px solid #dfe6e9;
            border-radius: 12px; /* Changed from 50% to square-round to save space */
            background: white;
            color: #b2bec3;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .lang-btn {
            aspect-ratio: auto;
            border-radius: 12px;
            padding: 8px 15px;
            font-size: 14px;
        }

        .group-btn.active, .lang-btn.active {
            border-color: #ff7675;
            color: #ff7675;
            transform: scale(1.05);
            background: #fffafa;
        }

        .big-start-btn {
            width: 100%;
            padding: 15px;
            font-size: 20px;
            font-weight: 900;
            background: #00b894;
            color: white;
            border: none;
            border-radius: 15px;
            cursor: pointer;
            box-shadow: 0 6px 0 #008f72;
            transition: all 0.1s;
        }

        .big-start-btn:active {
            transform: translateY(3px);
            box-shadow: 0 3px 0 #008f72;
        }

        #top-bar {
            width: 100%;
            padding: 10px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            z-index: 100;
        }

        .nav-controls {
            display: flex;
            gap: 10px;
        }

        .nav-btn {
            background: white;
            border: 2px solid var(--accent-color);
            color: var(--accent-color);
            width: 40px;
            height: 40px;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 20px;
            transition: all 0.2s;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }

        .nav-btn:hover {
            background: var(--accent-color);
            color: white;
        }

        .info-panel {
            background: white;
            padding: 5px 15px;
            border-radius: 50px;
            font-size: 14px;
            font-weight: bold;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            border: 2px solid var(--accent-color);
            display: flex;
            gap: 10px;
        }

        #game-area {
            position: relative;
            flex: 1;
            width: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            overflow: hidden;
        }

        .layout-grid {
            display: flex;
            gap: 20px;
            justify-content: center;
            align-items: center;
            width: 100%;
            max-width: 1400px;
            flex-wrap: nowrap;
            padding: 20px;
            z-index: 1;
            flex: 1;
        }

        .slot-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
            width: 260px;
            transition: all 0.3s;
        }

        .translation-tag {
            background: var(--accent-color);
            color: white;
            padding: 4px 12px;
            border-radius: 10px;
            font-size: 14px;
            font-weight: 800;
            margin-bottom: -5px;
            z-index: 5;
            text-transform: uppercase;
        }

        .action-card {
            background: white;
            padding: 10px;
            border-radius: 20px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            width: 100%;
            text-align: center;
            pointer-events: none;
        }

        .action-image {
            width: 100%;
            height: 200px;
            object-fit: contain;
            border-radius: 12px;
            background: #f9f9f9;
        }

        .answer-box {
            width: 100%;
            height: 50px;
            background: rgba(255, 255, 255, 0.8);
            border: 3px dashed var(--drop-zone-border);
            border-radius: 15px;
            display: flex;
            justify-content: center;
            align-items: center;
            font-weight: 800;
            color: #b2bec3;
            transition: all 0.2s;
            font-size: 13px;
            text-align: center;
            padding: 0 10px;
            z-index: 2;
        }

        .answer-box.correct {
            background: #00b894;
            color: white;
            border-style: solid;
            border-color: #008f72;
            box-shadow: 0 4px 12px rgba(0, 184, 148, 0.3);
        }

        .floating-word {
            position: absolute;
            padding: 10px 22px;
            background: var(--accent-color);
            color: white;
            border-radius: 50px;
            font-size: 18px;
            font-weight: bold;
            cursor: grab;
            box-shadow: 0 6px 15px rgba(108, 92, 231, 0.4);
            z-index: 1000;
            border: 2px solid white;
            touch-action: none;
            display: flex;
            flex-direction: column;
            align-items: center;
            white-space: nowrap;
            will-change: transform;
            left: 0;
            top: 0;
        }

        .floating-word.dragging {
            z-index: 5000;
            cursor: grabbing;
            opacity: 0.9;
            box-shadow: 0 15px 30px rgba(0,0,0,0.3);
            transform: scale(1.1);
        }

        /* MOBILE LAYOUT - PORTRAIT */
        @media (orientation: portrait) and (max-width: 600px) {
            .layout-grid {
                flex-direction: column;
                justify-content: flex-start;
                gap: 10px;
                padding: 10px;
            }
            .slot-container {
                width: 180px;
                gap: 5px;
            }
            .action-image {
                height: 120px;
            }
            .answer-box {
                height: 40px;
                font-size: 11px;
            }
            .translation-tag {
                font-size: 11px;
                padding: 2px 8px;
            }
            .floating-word {
                padding: 8px 16px;
                font-size: 16px;
            }
            #top-bar {
                padding: 5px 10px;
            }
            .info-panel {
                font-size: 12px;
                padding: 4px 10px;
            }
        }

        /* MOBILE LAYOUT - LANDSCAPE */
        @media (orientation: landscape) and (max-height: 500px) {
            .layout-grid {
                flex-direction: row;
                align-items: center;
                gap: 15px;
                padding: 10px;
            }
            .slot-container {
                width: 180px;
            }
            .action-image {
                height: 110px;
            }
            .answer-box {
                height: 35px;
            }
            #top-bar {
                padding: 5px 15px;
            }
        }

        .modal-overlay {
            display: none;
            position: fixed;
            top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.85);
            z-index: 9000;
            justify-content: center;
            align-items: center;
            backdrop-filter: blur(8px);
        }

        .success-popup {
            background: white;
            width: 95%;
            max-width: 1100px;
            border-radius: 40px;
            padding: 30px;
            text-align: center;
            max-height: 90vh;
            display: flex;
            flex-direction: column;
        }

        .popup-list {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-top: 25px;
            overflow-y: auto;
            padding: 15px;
        }

        .popup-item {
            display: flex;
            gap: 15px;
            background: #f1f2f6;
            padding: 15px;
            border-radius: 25px;
            align-items: flex-start;
            text-align: left;
        }

        .popup-img-small { width: 100px; height: 100px; object-fit: contain; background: white; border-radius: 15px; flex-shrink: 0; }

        .speaker-btn {
            background: var(--accent-color);
            color: white;
            border: none;
            width: 32px; height: 32px;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center; justify-content: center;
            flex-shrink: 0;
        }

        .example-box {
            font-size: 13px;
            background: #fff;
            padding: 10px;
            border-radius: 12px;
            border-left: 4px solid var(--drop-zone-border);
            margin-top: 8px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 10px;
        }

        .continue-btn {
            margin-top: 25px;
            padding: 15px 80px;
            background: #00b894;
            color: white;
            border: none;
            border-radius: 50px;
            font-weight: 800;
            cursor: pointer;
            font-size: 20px;
        }

        .listen-all-btn {
            margin-top: 25px;
            padding: 15px 40px;
            background: #ff7675;
            color: white;
            border: none;
            border-radius: 50px;
            font-weight: 800;
            cursor: pointer;
            font-size: 18px;
            margin-right: 10px;
            box-shadow: 0 4px 15px rgba(255, 118, 117, 0.4);
            display: inline-flex;
            align-items: center;
            gap: 8px;
        }

        .review-grid {
            display: flex;
            flex-wrap: nowrap;
            overflow-x: auto;
            gap: 15px;
            padding: 20px 10px;
            justify-content: center;
        }

        .review-card {
            background: #f8f9fa;
            border-radius: 20px;
            padding: 15px;
            min-width: 150px;
            text-align: center;
            border: 3px solid transparent;
            transition: all 0.3s ease;
        }

        .review-card.active-speaking {
            transform: scale(1.1);
            border-color: var(--accent-color);
            background: white;
            box-shadow: 0 10px 30px rgba(108, 92, 231, 0.3);
            animation: pulse-ring 1s infinite;
        }

        @keyframes pulse-ring {
            0% { box-shadow: 0 0 0 0 rgba(108, 92, 231, 0.7); }
            70% { box-shadow: 0 0 0 10px rgba(108, 92, 231, 0); }
            100% { box-shadow: 0 0 0 0 rgba(108, 92, 231, 0); }
        }
    </style>
</head>
<body>

    <div id="start-screen">
        <div class="start-card">
            <h1 class="game-title">Vietnamese Adjectives 1</h1>
            
            <div class="how-to-play">
                <h3 id="label-htp-title">HƯỚNG DẪN CHƠI</h3>
                <ul id="htp-list">
                    <li>Kéo các từ tiếng Việt đang bay.</li>
                    <li>Thả vào ô có nghĩa tiếng Anh/Nga tương ứng.</li>
                    <li>Hoàn thành để nghe phát âm và ví dụ.</li>
                </ul>
            </div>

            <div class="group-section">
                <span class="section-label" id="label-lang">CHỌN NGÔN NGỮ / SELECT LANGUAGE</span>
                <div class="group-grid" style="grid-template-columns: 1fr 1fr;">
                    <button class="lang-btn active" onclick="setLanguage('en', this)">ENGLISH</button>
                    <button class="lang-btn" onclick="setLanguage('ru', this)">РУССКИЙ</button>
                </div>
            </div>

            <div class="group-section">
                <span class="section-label" id="label-group">CHỌN NHÓM BẮT ĐẦU</span>
                <div class="group-grid">
                    <button class="group-btn active" onclick="setGroup(1, this)">1</button>
                    <button class="group-btn" onclick="setGroup(2, this)">2</button>
                    <button class="group-btn" onclick="setGroup(3, this)">3</button>
                    <button class="group-btn" onclick="setGroup(4, this)">4</button>
                </div>
            </div>

            <button class="big-start-btn" id="btn-start" onclick="startGame()">BẮT ĐẦU</button>
        </div>
    </div>

    <div id="top-bar">
        <div class="nav-controls">
            <button class="nav-btn" onclick="prevRound()">←</button>
            <button class="nav-btn" onclick="nextRoundManual()">→</button>
        </div>
        <div class="info-panel">
            <span><span id="label-level">CẤP</span>: <span id="lvl-num">1</span></span>
            <span><span id="label-round">VÒNG</span>: <span id="rnd-num">1</span>/5</span>
        </div>
        <div class="info-panel" id="category-label">TÍNH TỪ TIẾNG VIỆT</div>
    </div>

    <div id="game-area">
        <div id="layout-grid" class="layout-grid"></div>
    </div>

    <!-- Success Modal -->
    <div id="success-overlay" class="modal-overlay">
        <div class="success-popup">
            <h2 id="popup-title" style="color:#00b894; margin: 0; font-size: 32px;">TUYỆT VỜI!</h2>
            <div id="popup-list" class="popup-list"></div>
            <div style="text-align: center;">
                <button class="continue-btn" id="btn-continue" onclick="nextStep()">TIẾP TỤC</button>
            </div>
        </div>
    </div>

    <!-- Review Modal -->
    <div id="review-overlay" class="modal-overlay">
        <div class="success-popup">
            <h2 id="review-title" style="color:var(--accent-color); margin: 0; font-size: 28px;">ÔN TẬP TỪ VỰNG</h2>
            <div id="review-grid" class="review-grid"></div>
            <div style="text-align: center;">
                <button class="listen-all-btn" id="btn-listen-all" onclick="listenAll()"><span>🔊</span> NGHE TẤT CẢ</button>
                <button class="continue-btn" id="btn-next-level" style="background: var(--accent-color);" onclick="closeReview()">CẤP TIẾP THEO</button>
            </div>
        </div>
    </div>

    <script>
        const getImg = (id) => \`https://lh3.googleusercontent.com/d/\${id}=s600\`;
        const dropAudio = new Audio('https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3');
        const ttsAudio = new Audio(); 

        const UI_TEXT = {
            en: {
                start: "START",
                group: "CHOOSE STARTING GROUP",
                lang: "CHOOSE LANGUAGE",
                level: "LEVEL",
                round: "ROUND",
                category: "VIETNAMESE ADJECTIVES",
                drop: "DROP WORD HERE",
                success: "EXCELLENT!",
                continue: "CONTINUE",
                review: "VOCABULARY REVIEW",
                listenAll: "LISTEN ALL",
                nextLevel: "NEXT LEVEL",
                example: "Example"
            },
            ru: {
                start: "НАЧАТЬ",
                group: "ВЫБЕРИТЕ НАЧАЛЬНУЮ ГРУППУ",
                lang: "ВЫБЕРИТЕ ЯЗЫК",
                level: "УРОВЕНЬ",
                round: "РАУНД",
                category: "ВЬЕТНАМСКИЕ ПРИЛАГАТЕЛЬНЫЕ",
                drop: "ПЕРЕТАЩИТЕ СЮДА",
                success: "ОТЛИЧНО!",
                continue: "ПРОДОЛЖИТЬ",
                review: "ПОВТОРЕНИЕ СЛОВ",
                listenAll: "СЛУШАТЬ ВСЕ",
                nextLevel: "СЛЕДУЮЩИЙ УРОВЕНЬ",
                example: "Пример"
            }
        };

        const allGroups = [
            [ 
                { id: 'g1_1', word: 'ĐẸP', en: 'Beautiful', ru: 'Красивый', img: '1NAzXr2EqxHBjF6Vl1IlbzWeKhprhgP77', examples: [{vi: 'Bông hoa này rất đẹp', en: 'This flower is very beautiful', ru: 'Этот цветок очень красивый'}] },
                { id: 'g1_2', word: 'TỰ TIN', en: 'Confident', ru: 'Уверенный', img: '1P-6ZIZMq4-BgZKzURPnYg4WjYAquLKfk', examples: [{vi: 'Anh ấy rất tự tin vào bản thân', en: 'He is very confident in himself', ru: 'Он очень уверен в себе'}] },
                { id: 'g1_3', word: 'THÂN THIỆN', en: 'Friendly', ru: 'Дружелюбный', img: '1oycUFJUS79LGJUZ6m-IZ4AEvS3Rk3UqV', examples: [{vi: 'Hàng xóm của tôi rất thân thiện', en: 'My neighbor is very friendly', ru: 'Мой сосед очень дружелюбный'}] },
                { id: 'g1_4', word: 'MẠNH MẼ', en: 'Strong', ru: 'Сильный', img: '12iwAptwFyIt8Si3wxlYXS9GO9xgz1plV', examples: [{vi: 'Người đàn ông này rất mạnh mẽ', en: 'This man is very strong', ru: 'Этот человек очень сильный'}] },
                { id: 'g1_5', word: 'LẠC QUAN', en: 'Optimistic', ru: 'Оптимистичный', img: '1yLMixVjH3gJc0fGSz-DjGn4GJ-qCwbyF', examples: [{vi: 'Anh ấy luôn có cái nhìn lạc quan', en: 'He always has an optimistic view', ru: 'У него всегда оптимистичный взгляд'}] }
            ],
            [ 
                { id: 'g2_1', word: 'TỐT', en: 'Good', ru: 'Хороший', img: '1niKVtliV02dRneKejVFIlAoFX-LX-ZtF', examples: [{vi: 'Đây là một kết quả rất tốt', en: 'This is a very good result', ru: 'Это очень хороший результат'}] },
                { id: 'g2_2', word: 'CHĂM CHỈ', en: 'Hard-working', ru: 'Трудолюбивый', img: '1Ei3RdE-N8_Gk5Xobr7Hen68l0PeH0u7S', examples: [{vi: 'Anh trai tôi rất chăm chỉ', en: 'My brother is very hard-working', ru: 'Мой брат очень трудолюбивый'}] },
                { id: 'g2_3', word: 'THÔNG MINH', en: 'Intelligent', ru: 'Умный', img: '1QYtGOg8KY7FuDM5Xra2Zvzqq_C39lUiC', examples: [{vi: 'Sinh viên này rất thông minh', en: 'This student is very intelligent', ru: 'Этот студент очень умный'}] },
                { id: 'g2_4', word: 'VUI VẺ', en: 'Happy', ru: 'Веселый', img: '1BHW9ildOMPa1szBlGsN8JLZsVa1cQdD-', examples: [{vi: 'Hôm nay là một ngày vui vẻ', en: 'Today is a happy day', ru: 'Сегодня веселый день'}] },
                { id: 'g2_5', word: 'TỐT BỤNG', en: 'Kind', ru: 'Добрый', img: '1JaTEdZONY-QZ73fIOFG-vrZBaL2wBIQ_', examples: [{vi: 'Cô ấy có một trái tim tốt bụng', en: 'She has a kind heart', ru: 'У нее доброе сердце'}] }
            ],
            [ 
                { id: 'g3_1', word: 'ĐẸP TRAI', en: 'Handsome', ru: 'Красивый (мужчина)', img: '1Iefa9_01NDB8tURxb_5sZ2z4vnuD49k-', examples: [{vi: 'Bạn của tôi rất đẹp trai', en: 'My friend is very handsome', ru: 'Мой друг очень красивый'}] },
                { id: 'g3_2', word: 'LỚN', en: 'Big', ru: 'Большой', img: '1D2IClMVkCczOaFlPIXA79bBwOm3OmB2I', examples: [{vi: 'Đây là một thành phố rất lớn', en: 'This is a very big city', ru: 'Это очень большой город'}] },
                { id: 'g3_3', word: 'NHỎ', en: 'Small', ru: 'Маленький', img: '1qjkvlFw4kDjaxqB02JOfLtG5DMuJppdx', examples: [{vi: 'Tôi có một con mèo nhỏ', en: 'I have a small cat', ru: 'У меня есть маленькая кошка'}] },
                { id: 'g3_4', word: 'ÍT', en: 'Few/Little', ru: 'Мало', img: '1GWITbhr1cNoZpNMbiIpmmvK_lrGl1G1N', examples: [{vi: 'Cho tôi xin một ít nước', en: 'Give me some water', ru: 'Дайте мне немного воды'}] },
                { id: 'g3_5', word: 'NHIỀU', en: 'Many/Much', ru: 'Много', img: '1yvOy3X2-xdrI8fR321PIvi8A8LIvd_Aj', examples: [{vi: 'Trong công viên có nhiều người', en: 'There are many people in the park', ru: 'В парке много людей'}] }
            ],
            [ 
                { id: 'g4_1', word: 'DỄ', en: 'Easy', ru: 'Легкий', img: '1D-D8zw8_lhTAGPzLlfN1hcNkQncFApZs', examples: [{vi: 'Đây là một câu hỏi dễ', en: 'This is an easy question', ru: 'Это легкий вопрос'}] },
                { id: 'g4_2', word: 'KHÓ', en: 'Difficult', ru: 'Трудный', img: '1dAqdRrYd8rwt60BlCbqeKmL3wU7PsN5C', examples: [{vi: 'Đây là một bài toán rất khó', en: 'This is a very difficult problem', ru: 'Это очень трудная задача'}] },
                { id: 'g4_3', word: 'RẺ', en: 'Cheap', ru: 'Дешевый', img: '1mAgnVUgKkblp9OQ1OTt9ORdk1NPlslsf', examples: [{vi: 'Tôi đã mua được chiếc vé rẻ', en: 'I bought a cheap ticket', ru: 'Я купил дешевый билет'}] },
                { id: 'g4_4', word: 'ĐẮT', en: 'Expensive', ru: 'Дорогой', img: '1NT00rAKeTq2_5MFhdvWay3r4yVtuZzKT', examples: [{vi: 'Khách sạn này quá đắt', en: 'This hotel is too expensive', ru: 'Этот отель слишком дорогой'}] },
                { id: 'g4_5', word: 'NGON', en: 'Delicious', ru: 'Вкусный', img: '1UCop5sG8QYkcO2iNag3CByWUCD0cA1k4', examples: [{vi: 'Món ăn này rất ngon', en: 'This food is very delicious', ru: 'Эта еда очень вкусная'}] }
            ]
        ];

        let currentLang = 'en';
        let startingGroupId = 1;
        let currentLevel = 1;
        let currentRound = 1;
        
        let activeWords = [];
        let solvedCount = 0;
        let poolForCurrentRound = [];
        let isAnimationStarted = false;

        function updateUILabels() {
            const text = UI_TEXT[currentLang];
            document.getElementById('label-lang').textContent = text.lang;
            document.getElementById('label-group').textContent = text.group;
            document.getElementById('btn-start').textContent = text.start;
            document.getElementById('label-level').textContent = text.level;
            document.getElementById('label-round').textContent = text.round;
            document.getElementById('category-label').textContent = text.category;
            document.getElementById('popup-title').textContent = text.success;
            document.getElementById('btn-continue').textContent = text.continue;
            document.getElementById('review-title').textContent = text.review;
            document.getElementById('btn-listen-all').innerHTML = \`<span>🔊</span> \${text.listenAll}\`;
            document.getElementById('btn-next-level').textContent = text.nextLevel;
        }

        function setLanguage(lang, btn) {
            currentLang = lang;
            document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            updateUILabels();
        }

        function getReorderedGroups() {
            const reordered = [];
            const mainGroupIdx = startingGroupId - 1;
            reordered.push(allGroups[mainGroupIdx]);
            allGroups.forEach((g, idx) => {
                if (idx !== mainGroupIdx) reordered.push(g);
            });
            return reordered;
        }

        function setGroup(id, btn) {
            startingGroupId = id;
            document.querySelectorAll('.group-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        }

        function prevRound() {
            if (currentRound > 1) {
                currentRound--;
                startRound();
            } else if (currentLevel > 1) {
                currentLevel--;
                currentRound = 5;
                startRound();
            }
        }

        function nextRoundManual() {
            if (currentRound < 5) {
                currentRound++;
                startRound();
            } else {
                showReview();
            }
        }

        function startGame() {
            document.getElementById('start-screen').style.display = 'none';
            startRound();
            if (!isAnimationStarted) { isAnimationStarted = true; animate(); }
        }

        function speak(text, onEndCallback = null) {
            window.speechSynthesis.cancel();
            ttsAudio.pause();
            const encodedText = encodeURIComponent(text);
            const url = \`https://translate.google.com/translate_tts?ie=UTF-8&q=\${encodedText}&tl=vi&client=tw-ob\`;
            ttsAudio.src = url;
            if (onEndCallback) ttsAudio.onended = onEndCallback;
            else ttsAudio.onended = null;
            return ttsAudio.play().catch(err => { fallbackSpeak(text, onEndCallback); });
        }

        function fallbackSpeak(text, onEndCallback) {
            const msg = new SpeechSynthesisUtterance(text);
            msg.lang = 'vi-VN';
            msg.rate = 0.9;
            if (onEndCallback) msg.onend = onEndCallback;
            window.speechSynthesis.speak(msg);
        }

        function startRound() {
            const layoutGrid = document.getElementById('layout-grid');
            layoutGrid.innerHTML = '';
            activeWords.forEach(w => { if(w.el) w.el.remove(); });
            activeWords = [];
            
            document.getElementById('lvl-num').textContent = currentLevel;
            document.getElementById('rnd-num').textContent = currentRound;
            document.getElementById('success-overlay').style.display = 'none';
            document.getElementById('review-overlay').style.display = 'none';
            
            solvedCount = 0;
            poolForCurrentRound = generatePool();

            poolForCurrentRound.forEach(item => {
                const container = document.createElement('div');
                container.className = 'slot-container';
                const translation = item[currentLang];
                container.innerHTML = \`
                    <div class="translation-tag">\${translation}</div>
                    <div class="action-card">
                        <img src="\${getImg(item.img)}" class="action-image">
                    </div>
                    <div class="answer-box" data-id="\${item.id}">\${UI_TEXT[currentLang].drop}</div>
                \`;
                layoutGrid.appendChild(container);
                createFloatingWord(item, item.word);
            });
        }

        function generatePool() {
            const groups = getReorderedGroups();
            const idx = currentRound - 1;
            let result = [groups[currentLevel-1][idx]];

            if (currentLevel === 4 || currentLevel === 3) {
                let extra = groups[Math.floor(Math.random() * 4)][Math.floor(Math.random() * 5)];
                while(extra.id === result[0].id) {
                    extra = groups[Math.floor(Math.random() * 4)][Math.floor(Math.random() * 5)];
                }
                result.push(extra);
            } else if (currentLevel === 2) {
                result.push(groups[0][Math.floor(Math.random()*5)]);
            }

            const unique = [...new Map(result.map(i => [i.id, i])).values()];
            if ((currentLevel === 3 || currentLevel === 4) && unique.length === 1) {
                return generatePool();
            }
            return unique.sort(() => Math.random() - 0.5);
        }

        function createFloatingWord(item, displayWord) {
            const el = document.createElement('div');
            el.className = 'floating-word';
            el.innerHTML = \`<span>\${displayWord}</span>\`;
            const gameArea = document.getElementById('game-area');
            gameArea.appendChild(el);
            const areaRect = gameArea.getBoundingClientRect();
            const startX = Math.random() * (areaRect.width - 150);
            const startY = Math.random() * (areaRect.height - 100);
            const word = { el, x: startX, y: startY, dx: (Math.random() - 0.5) * 3, dy: (Math.random() - 0.5) * 3, solved: false, data: item, displayWord: displayWord, isDragging: false };
            const onStart = (e) => {
                if (word.solved) return;
                word.isDragging = true; word.el.classList.add('dragging');
                const cx = e.touches ? e.touches[0].clientX : e.clientX;
                const cy = e.touches ? e.touches[0].clientY : e.clientY;
                const areaRect = gameArea.getBoundingClientRect();
                const elRect = word.el.getBoundingClientRect();
                word.offX = cx - elRect.left; word.offY = cy - elRect.top;
                const onMove = (me) => {
                    if (!word.isDragging) return;
                    const mcx = me.touches ? me.touches[0].clientX : me.clientX;
                    const mcy = me.touches ? me.touches[0].clientY : me.clientY;
                    word.x = mcx - areaRect.left - word.offX; word.y = mcy - areaRect.top - word.offY;
                    word.el.style.transform = \`translate(\${word.x}px, \${word.y}px)\`;
                };
                const onEnd = (ee) => {
                    if (!word.isDragging) return;
                    word.isDragging = false; word.el.classList.remove('dragging');
                    window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onEnd);
                    window.removeEventListener('touchmove', onMove); window.removeEventListener('touchend', onEnd);
                    const ecx = ee.changedTouches ? ee.changedTouches[0].clientX : ee.clientX;
                    const ecy = ee.changedTouches ? ee.changedTouches[0].clientY : ee.clientY;
                    checkDrop(word, ecx, ecy);
                };
                window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onEnd);
                window.addEventListener('touchmove', onMove, { passive: false }); window.addEventListener('touchend', onEnd);
            };
            el.addEventListener('mousedown', onStart);
            el.addEventListener('touchstart', onStart, { passive: false });
            activeWords.push(word);
            word.el.style.transform = \`translate(\${word.x}px, \${word.y}px)\`;
        }

        function checkDrop(word, cx, cy) {
            word.el.style.pointerEvents = 'none';
            const target = document.elementFromPoint(cx, cy);
            word.el.style.pointerEvents = 'auto';
            const box = target ? target.closest('.answer-box') : null;
            if (box && box.dataset.id === word.data.id && !box.classList.contains('correct')) {
                word.solved = true; word.el.style.display = 'none';
                box.classList.add('correct'); box.innerHTML = \`✓ \${word.displayWord}\`;
                dropAudio.play(); speak(word.displayWord);
                solvedCount++;
                if (solvedCount === poolForCurrentRound.length) setTimeout(showSuccess, 500);
            }
        }

        function showSuccess() {
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
            const list = document.getElementById('popup-list');
            list.innerHTML = '';
            poolForCurrentRound.forEach(i => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'popup-item';
                const ex = i.examples[0];
                itemDiv.innerHTML = \`
                    <img src="\${getImg(i.img)}" class="popup-img-small">
                    <div style="flex:1">
                        <div style="display:flex; justify-content:space-between; align-items: center;">
                            <div>
                                <strong style="font-size: 20px;">\${i.word}</strong>
                                <span style="color:#666; margin-left:10px;">(\${i[currentLang]})</span>
                            </div>
                            <button class="speaker-btn" onclick="speak('\${i.word}')">🔊</button>
                        </div>
                        <div class="example-box">
                            <div>
                                <strong>\${UI_TEXT[currentLang].example}:</strong><br>
                                <span>\${ex.vi}</span><br>
                                <small style="color:#7f8c8d italic">\${ex[currentLang]}</small>
                            </div>
                            <button class="speaker-btn" onclick="speak('\${ex.vi.replace(/'/g, "\\\\'")}')">🔊</button>
                        </div>
                    </div>
                \`;
                list.appendChild(itemDiv);
            });
            document.getElementById('success-overlay').style.display = 'flex';
        }

        function nextStep() {
            if (currentRound < 5) { currentRound++; startRound(); } 
            else { showReview(); }
        }

        let reviewData = [];
        function showReview() {
            document.getElementById('success-overlay').style.display = 'none';
            const grid = document.getElementById('review-grid');
            grid.innerHTML = '';
            const groups = getReorderedGroups();
            reviewData = groups[currentLevel-1];
            reviewData.forEach((i, idx) => {
                grid.innerHTML += \`
                    <div class="review-card" id="review-card-\${idx}">
                        <img src="\${getImg(i.img)}" style="width:100px; height:100px; object-fit:contain">
                        <div style="font-weight:bold; margin-top:5px; font-size:18px">\${i.word}</div>
                        <div style="color:var(--accent-color); font-size:14px; font-weight:bold;">\${i[currentLang]}</div>
                        <button class="speaker-btn" style="margin:10px auto" onclick="speak('\${i.word}')">🔊</button>
                    </div>
                \`;
            });
            document.getElementById('review-overlay').style.display = 'flex';
        }

        function listenAll(index = 0) {
            if (index >= reviewData.length) return;
            document.querySelectorAll('.review-card').forEach(c => c.classList.remove('active-speaking'));
            const card = document.getElementById(\`review-card-\${index}\`);
            card.classList.add('active-speaking');
            card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            speak(reviewData[index].word, () => { setTimeout(() => listenAll(index + 1), 500); });
        }

        function closeReview() {
            if (currentLevel < 4) { currentLevel++; currentRound = 1; startRound(); } 
            else { location.reload(); }
        }

        function animate() {
            const gameArea = document.getElementById('game-area');
            if (!gameArea) return;
            const areaRect = gameArea.getBoundingClientRect();
            activeWords.forEach(word => {
                if (!word.isDragging && !word.solved) {
                    word.x += word.dx; word.y += word.dy;
                    if (word.x <= 0 || word.x >= areaRect.width - word.el.offsetWidth) word.dx *= -1;
                    if (word.y <= 0 || word.y >= areaRect.height - word.el.offsetHeight) word.dy *= -1;
                    word.el.style.transform = \`translate(\${word.x}px, \${word.y}px)\`;
                }
            });
            requestAnimationFrame(animate);
        }

        // Init UI
        updateUILabels();
    </script>
</body>
</html>
`;

export const VietnameseAdjectives: React.FC = () => {
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

    return (
        <>{iframeSrc ? <iframe
            src={iframeSrc}
            className="w-full h-full"
            style={{ border: 'none' }}
            allow="microphone"
            title="Vietnamese Adjectives Game"
        /> : <div className="w-full h-full bg-slate-200 flex items-center justify-center"><p>Loading game...</p></div>}</>
    );
};

export default VietnameseAdjectives;

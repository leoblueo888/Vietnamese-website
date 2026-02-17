import React, { useEffect, useState } from 'react';

const gameHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vietnamese Verb 2 - Clean Edition</title>
    <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js"></script>
    <style>
        :root {
            --primary-bg: #f0f4f8;
            --card-bg: #ffffff;
            --accent-color: #6c5ce7;
            --drop-zone-border: #00b894;
            --text-dark: #2d3436;
            --secondary-color: #a29bfe;
            --gold: #f1c40f;
            --ai-bubble: #e1f5fe;
            --user-bubble: #f1f8e9;
            --glow: 0 0 15px rgba(108, 92, 231, 0.6);
        }

        * { box-sizing: border-box; }

        body {
            margin: 0; padding: 0;
            font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background: var(--primary-bg);
            overflow: hidden;
            height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        #start-screen, #finish-screen {
            position: fixed;
            top: 0; left: 0; width: 100%; height: 100%;
            background: linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%);
            z-index: 5000;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }

        #finish-screen { display: none; flex-direction: column; text-align: center; }

        .start-card, .finish-card {
            background: white; padding: 30px; border-radius: 30px;
            box-shadow: 0 30px 60px rgba(0,0,0,0.2);
            text-align: center; max-width: 500px; width: 100%;
        }

        .game-title { font-size: 32px; font-weight: 900; color: var(--accent-color); margin-bottom: 5px; text-transform: uppercase; }
        .game-subtitle { font-size: 18px; font-weight: 700; color: #666; margin-bottom: 20px; }

        .lang-selector { display: flex; justify-content: center; gap: 15px; margin-bottom: 20px; }
        .lang-btn {
            padding: 10px 20px; border: 2px solid #eee; border-radius: 12px; background: white;
            cursor: pointer; font-weight: 800; color: #999; transition: 0.2s;
        }
        .lang-btn.active { border-color: var(--accent-color); color: var(--accent-color); background: #f0edff; }

        .how-to-play {
            background: #f8f9fa; padding: 15px; border-radius: 15px; text-align: left;
            margin-bottom: 20px; font-size: 14px; color: #555; line-height: 1.5; border-left: 4px solid var(--accent-color);
        }

        .level-btn {
            width: 50px; height: 50px; border: 3px solid #eee; border-radius: 12px; background: white;
            cursor: pointer; font-size: 18px; font-weight: 900; color: #999;
            transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            display: flex; align-items: center; justify-content: center;
        }

        .level-btn.active { border-color: var(--accent-color); background: var(--accent-color); color: white; transform: scale(1.1); }

        .start-btn {
            width: 100%; padding: 16px; font-size: 18px; font-weight: 800; border: none;
            border-radius: 15px; background: #00b894; color: white; cursor: pointer; margin-top: 15px; transition: 0.2s;
        }
        .start-btn:active { transform: scale(0.98); }

        #top-bar { width: 100%; padding: 10px 25px; display: flex; justify-content: space-between; align-items: center; z-index: 100; }
        .nav-btn { background: white; border: 2px solid var(--accent-color); color: var(--accent-color); padding: 5px 15px; border-radius: 12px; font-weight: 800; cursor: pointer; transition: 0.2s; }
        .info-panel { background: white; padding: 6px 18px; border-radius: 50px; font-weight: bold; color: var(--text-dark); box-shadow: 0 4px 10px rgba(0,0,0,0.1); border: 3px solid var(--accent-color); display: flex; align-items: center; gap: 12px; }

        #game-area { position: relative; flex: 1; width: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 10px 20px; overflow: hidden; }

        .layout-grid { display: flex; gap: 20px; justify-content: center; align-items: center; width: 100%; max-width: 1600px; flex-wrap: wrap; }
        .slot-container { width: 260px; display: flex; flex-direction: column; gap: 12px; }
        .action-card { background: white; padding: 10px; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
        .image-wrapper { width: 100%; aspect-ratio: 1/1; background: #f8f9fa; border-radius: 14px; overflow: hidden; }
        .action-image { width: 100%; height: 100%; object-fit: contain; }

        .answer-box { height: 70px; border: 3px dashed #ccc; border-radius: 15px; display: flex; justify-content: center; align-items: center; font-weight: 800; color: #aaa; background: rgba(255,255,255,0.5); text-align: center; padding: 5px; font-size: 16px; }
        .answer-box.correct { background: #00b894; color: white; border: 3px solid #008f72; flex-direction: column; }

        .floating-word {
            position: absolute; padding: 15px 30px; background: var(--accent-color); color: white; border-radius: 40px; font-weight: 900;
            box-shadow: 0 8px 18px rgba(108, 92, 231, 0.4); cursor: grab; z-index: 1000; border: 2px solid white;
            display: flex; flex-direction: column; align-items: center; min-width: 150px; font-size: 20px;
        }

        .practice-container {
            background: white; border-radius: 30px; padding: 30px; width: 95%; max-width: 800px;
            box-shadow: 0 20px 50px rgba(0,0,0,0.15); display: flex; flex-direction: column; gap: 20px;
            max-height: 85vh;
        }

        .review-scroll-area { overflow-y: auto; flex: 1; padding: 10px; display: flex; flex-direction: column; gap: 15px; }

        .dialogue-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #f0f0f0; padding-bottom: 10px; }
        .listen-all-btn { background: #ff7675; color: white; border: none; padding: 8px 20px; border-radius: 50px; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: 0.3s; }

        .chat-bubble {
            padding: 15px 20px; border-radius: 20px; max-width: 85%; position: relative;
            display: flex; flex-direction: column; transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            border: 2px solid transparent;
        }
        
        .chat-bubble.active-audio { transform: scale(1.03); border-color: var(--accent-color); box-shadow: var(--glow); z-index: 10; }

        .ai-bubble { background: var(--ai-bubble); align-self: flex-start; border-bottom-left-radius: 5px; }
        .user-bubble { background: var(--user-bubble); align-self: flex-end; border-bottom-right-radius: 5px; text-align: right; }

        .sentence-main { font-size: 22px; font-weight: 800; color: var(--text-dark); margin-bottom: 6px; }
        .sentence-trans { font-size: 16px; color: #444; font-weight: 600; }

        .bubble-controls { display: flex; align-items: center; gap: 12px; margin-top: 10px; }
        .user-bubble .bubble-controls { justify-content: flex-end; }

        .mini-speaker { background: var(--accent-color); color: white; border: none; width: 36px; height: 36px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 16px; }

        .modal-overlay { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); z-index: 2000; justify-content: center; align-items: center; backdrop-filter: blur(5px); }
        .popup-card { background: white; width: 95%; max-width: 900px; border-radius: 30px; padding: 25px; max-height: 85vh; display: flex; flex-direction: column; }
        .popup-list { overflow-y: auto; flex: 1; margin: 15px 0; }
        .popup-row { display: flex; gap: 20px; background: #f8f9fa; margin-bottom: 12px; padding: 15px; border-radius: 20px; align-items: center; }
        .popup-img { width: 120px; height: 120px; object-fit: contain; background: white; border-radius: 15px; }

        #mute-btn { position: fixed; bottom: 20px; right: 20px; width: 50px; height: 50px; background: white; border: 2px solid var(--accent-color); border-radius: 50%; cursor: pointer; font-size: 24px; z-index: 100; }
    </style>
</head>
<body>

    <div id="start-screen">
        <div class="start-card">
            <h1 class="game-title">Vietnamese Verb 2</h1>
            <div class="game-subtitle" id="st-subtitle">Learn 20 Common Verbs</div>
            
            <p style="color: #666; font-weight: 600; margin-bottom: 10px;" id="st-lang-label">Language / Язык:</p>
            <div class="lang-selector">
                <button class="lang-btn active" id="btn-eng" onclick="setLanguage('ENG')">🇺🇸 ENGLISH</button>
                <button class="lang-btn" id="btn-rus" onclick="setLanguage('RUS')">🇷🇺 РУССКИЙ</button>
            </div>

            <div class="how-to-play" id="st-how">
                <strong>Instruction:</strong><br>
                1. Drag the Vietnamese word to its image.<br>
                2. Practice conversation based on the story.<br>
                3. Master common Vietnamese verbs.
            </div>

            <p style="color: #666; font-weight: 600;" id="st-lvl-label">Select Level:</p>
            <div class="priority-selector" id="p-selector" style="display:flex; justify-content:center; gap:10px; margin-bottom:20px">
                <button class="level-btn active" onclick="setPriority(1, this)">1</button>
                <button class="level-btn" onclick="setPriority(2, this)">2</button>
                <button class="level-btn" onclick="setPriority(3, this)">3</button>
                <button class="level-btn" onclick="setPriority(4, this)">4</button>
            </div>
            <button class="start-btn" id="btn-start" onclick="startGame()">START GAME</button>
        </div>
    </div>

    <div id="finish-screen">
        <div class="finish-card">
            <span style="font-size: 70px;">🏆</span>
            <h1 style="color: #00b894;" id="fin-title">EXCELLENT!</h1>
            <p id="fin-desc">You have mastered all 20 verbs!</p>
            <button class="start-btn" id="btn-restart" onclick="location.reload()">PLAY AGAIN</button>
        </div>
    </div>

    <div id="top-bar">
        <div class="nav-controls"><button class="nav-btn" id="btn-back" onclick="navigateRound(-1)">❮ BACK</button></div>
        <div class="info-panel">
            <span id="mode-badge" style="color:var(--accent-color); border-right:2px solid #eee; padding-right:10px; display:none">MATCH</span>
            <span>LV: <span id="lvl-label">1</span></span>
            <span>RD: <span id="rnd-label">1/5</span></span>
        </div>
        <div class="nav-controls"><button class="nav-btn" id="btn-next" onclick="navigateRound(1)">NEXT ❯</button></div>
    </div>

    <div id="game-area"></div>
    <button id="mute-btn">🔊</button>

    <div id="modal-overlay" class="modal-overlay">
        <div class="popup-card">
            <h2 style="text-align: center; color: #00b894; margin: 0;" id="pop-title">CONGRATS!</h2>
            <div class="popup-list" id="popup-content"></div>
            <button class="start-btn" id="popup-continue-btn" onclick="handlePopupContinue()">PRACTICE SPEAKING</button>
        </div>
    </div>

    <script>
        const getImg = (id) => \`https://lh3.googleusercontent.com/u/0/d/\${id}=s1000\`;
        
        const i18n = {
            ENG: {
                subtitle: "Daily Verbs - Vietnamese",
                langLabel: "Language:",
                how: "<strong>Instruction:</strong><br>1. Drag the Vietnamese word to its image.<br>2. Practice conversation based on the story.<br>3. Master common Vietnamese verbs.",
                lvlLabel: "Select Level:",
                startBtn: "START GAME",
                back: "❮ BACK",
                next: "NEXT ❯",
                matchMode: "MATCH",
                speakMode: "SPEAK",
                dragText: "DRAG WORD HERE",
                popTitle: "CONGRATS!",
                popBtn: "PRACTICE SPEAKING",
                finTitle: "EXCELLENT!",
                finDesc: "You have mastered all 20 verbs!",
                restart: "PLAY AGAIN",
                listenAll: "▶ LISTEN ALL",
                storyHeader: "DAILY STORY"
            },
            RUS: {
                subtitle: "Популярные глаголы - Вьетнамский",
                langLabel: "Язык:",
                how: "<strong>Инструкция:</strong><br>1. Перетащите вьетнамское слово к картинке.<br>2. Практикуйте диалог на основе истории.<br>3. Освойте популярные вьетнамские глаголы.",
                lvlLabel: "Выберите уровень:",
                startBtn: "НАЧАТЬ ИГРУ",
                back: "❮ НАЗАД",
                next: "СЛЕД ❯",
                matchMode: "ПОИСК",
                speakMode: "РЕЧЬ",
                dragText: "ПЕРETАЩИТЕ СЮДА",
                popTitle: "ПОЗДРАВЛЯЕМ!",
                popBtn: "ПРАКТИКА РЕЧИ",
                finTitle: "ОТЛИЧНО!",
                finDesc: "Вы освоили все 20 глаголов!",
                restart: "ИГРАТЬ СНОВА",
                listenAll: "▶ СЛУШАТЬ ВСЁ",
                storyHeader: "ИСТОРИЯ ДНЯ"
            }
        };

        const db = {
            1: [
                { word: 'HỌC', img: '1Uy27YyM54H64alu5xuDYYnTF5lqQx_oi', trans: { ENG: 'To Learn', RUS: 'Учиться' }, dialogs: [
                    { q: 'Bạn học tiếng Việt lâu chưa?', qTrans: { ENG: 'Have you learned Vietnamese for long?', RUS: 'Ты давно учишь вьетнамский?' }, a: 'Tôi mới học được ba tháng.', aTrans: { ENG: 'I have just learned for three months.', RUS: 'Я учу всего три месяца.' } }
                ]},
                { word: 'LÀM', img: '10vKYWapGKy02IUAdsyoLCeQNJyvX6xBl', trans: { ENG: 'To Work/Do', RUS: 'Работать' }, dialogs: [
                    { q: 'Bố bạn làm nghề gì?', qTrans: { ENG: 'What does your father do?', RUS: 'Кем работает твой папа?' }, a: 'Bố tôi làm bác sĩ.', aTrans: { ENG: 'My father is a doctor.', RUS: 'Мой папа работает врачом.' } }
                ]},
                { word: 'NẤU ĂN', img: '1qnm-o6nALpiAITwUg8vPpna0LzcHHDQq', trans: { ENG: 'To Cook', RUS: 'Готовить' }, dialogs: [
                    { q: 'Ai nấu ăn ngon nhất nhà?', qTrans: { ENG: 'Who cooks best in your family?', RUS: 'Кто лучше всех готовит в семье?' }, a: 'Mẹ tôi nấu ăn ngon nhất.', aTrans: { ENG: 'My mother cooks the best.', RUS: 'Моя мама готовит лучше всех.' } }
                ]},
                { word: 'NGỦ', img: '14OXVWsj_4-d5BB5_ZJQd2kA8KKaRbR-T', trans: { ENG: 'To Sleep', RUS: 'Спать' }, dialogs: [
                    { q: 'Bạn có ngủ ngon không?', qTrans: { ENG: 'Did you sleep well?', RUS: 'Ты хорошо спал?' }, a: 'Có, tôi ngủ rất ngon.', aTrans: { ENG: 'Yes, I slept very well.', RUS: 'Да, я спал очень хорошо.' } }
                ]},
                { word: 'ĐI DU LỊCH', img: '1u_iyRnDJUVFh6KMv6-xEdPCZCQKQEfHY', trans: { ENG: 'To Travel', RUS: 'Путешествовать' }, dialogs: [
                    { q: 'Bạn muốn đi du lịch ở đâu?', qTrans: { ENG: 'Where do you want to travel?', RUS: 'Куда ты хочешь поехать путешествовать?' }, a: 'Tôi muốn đi du lịch Đà Nẵng.', aTrans: { ENG: 'I want to travel to Da Nang.', RUS: 'Я хочу поехать в Дананг.' } }
                ]}
            ],
            2: [
                { word: 'HÁT', img: '1ZsqMx0pecQSNbghytg78aJTNVFxRw0Ea', trans: { ENG: 'To Sing', RUS: 'Петь' }, dialogs: [
                    { q: 'Bạn có thích hát Karaoke không?', qTrans: { ENG: 'Do you like singing Karaoke?', RUS: 'Тебе нравится петь караоке?' }, a: 'Có, tôi rất thích hát.', aTrans: { ENG: 'Yes, I like singing very much.', RUS: 'Да, я rất люблю петь.' } }
                ]},
                { word: 'ĐẠP XE', img: '1E8ifoCXTVEQSP3E1nUie18NlNOOHWQOH', trans: { ENG: 'To Cycle', RUS: 'Ездить на велосипеде' }, dialogs: [
                    { q: 'Bạn thường đạp xe lúc nào?', qTrans: { ENG: 'When do you usually cycle?', RUS: 'Когда ты обычно катаешься?' }, a: 'Tôi đạp xe vào mỗi chiều.', aTrans: { ENG: 'I cycle every afternoon.', RUS: 'Я катаюсь каждый вечер.' } }
                ]},
                { word: 'NHẢY', img: '1IS4rKynIzBu654QxWwWGF4mOSzXfJRQU', trans: { ENG: 'To Dance/Jump', RUS: 'Танцевать' }, dialogs: [
                    { q: 'Cô ấy nhảy đẹp quá!', qTrans: { ENG: 'She dances so beautifully!', RUS: 'Она так красиво танцует!' }, a: 'Cô ấy học nhảy từ bé.', aTrans: { ENG: 'She has learned to dance since childhood.', RUS: 'Она учится танцевать с детства.' } }
                ]},
                { word: 'CẢM NHẬN', img: '1S-uRS3um46U4Nphw9q35zbU6h1Vhv7zE', trans: { ENG: 'To Feel', RUS: 'Чувствовать' }, dialogs: [
                    { q: 'Bạn cảm nhận thế nào về món ăn này?', qTrans: { ENG: 'How do you feel about this dish?', RUS: 'Как тебе это блюдо?' }, a: 'Tôi cảm nhận nó hơi cay.', aTrans: { ENG: 'I feel it is a bit spicy.', RUS: 'Я чувствую, что оно островато.' } }
                ]},
                { word: 'CHỤP ẢNH', img: '1zmPuEbob5OX5kDnutIWxTO5lf2FuzExS', trans: { ENG: 'To Take Photos', RUS: 'Фотографировать' }, dialogs: [
                    { q: 'Bạn chụp ảnh cho tôi nhé?', qTrans: { ENG: 'Can you take a photo for me?', RUS: 'Сфотографируешь меня?' }, a: 'Sẵn sàng, cười lên nào!', aTrans: { ENG: 'Ready, smile!', RUS: 'Готов, улыбайся!' } }
                ]}
            ],
            3: [
                { word: 'MUA', img: '1vTE4cIn353EvhZ0moeMgEo3BS-mCNv4T', trans: { ENG: 'To Buy', RUS: 'Покупать' }, dialogs: [
                    { q: 'Bạn mua cái áo này ở đâu?', qTrans: { ENG: 'Where did you buy this shirt?', RUS: 'Где ты купил эту рубашку?' }, a: 'Tôi mua nó ở siêu thị.', aTrans: { ENG: 'I bought it at the supermarket.', RUS: 'Я купил её в супермаркете.' } }
                ]},
                { word: 'HỢP TÁC', img: '13rz81Xjd9SCC2J98GEQ5-dqLYbJC-e8c', trans: { ENG: 'To Cooperate', RUS: 'Сотрудничать' }, dialogs: [
                    { q: 'Chúng ta có thể hợp tác không?', qTrans: { ENG: 'Can we cooperate?', RUS: 'Мы можем сотрудничать?' }, a: 'Rất vui được hợp tác với bạn.', aTrans: { ENG: 'Very happy to cooperate with you.', RUS: 'Очень рад сотрудничеству.' } }
                ]},
                { word: 'ĐỢI', img: '1IMb0XXCPi5cauilcc4tVZPQMADs5thTz', trans: { ENG: 'To Wait', RUS: 'Ждать' }, dialogs: [
                    { q: 'Đợi tôi một chút nhé!', qTrans: { ENG: 'Wait for me a moment!', RUS: 'Подожди меня немного!' }, a: 'Được, tôi sẽ đợi ở đây.', aTrans: { ENG: 'Okay, I will wait here.', RUS: 'Хорошо, я подожду здесь.' } }
                ]},
                { word: 'BÁN', img: '1dj-VxBGft4Pg3cHoWEO9g6CHLiHmA17r', trans: { ENG: 'To Sell', RUS: 'Продавать' }, dialogs: [
                    { q: 'Cửa hàng này bán gì?', qTrans: { ENG: 'What does this store sell?', RUS: 'Что продает этот магазин?' }, a: 'Họ bán quần áo nam nữ.', aTrans: { ENG: 'They sell clothes for men and women.', RUS: 'Они продают мужскую и женскую одежду.' } }
                ]},
                { word: 'THAY ĐỔI', img: '1JagFkqFdrV6VOIeA7veuBujWXIVM3GLb', trans: { ENG: 'To Change', RUS: 'Менять' }, dialogs: [
                    { q: 'Mọi thứ đã thay đổi rất nhiều.', qTrans: { ENG: 'Everything has changed a lot.', RUS: 'Все сильно изменилось.' }, a: 'Đúng vậy, thành phố đẹp hơn.', aTrans: { ENG: 'True, the city is more beautiful.', RUS: 'Верно, город стал красивее.' } }
                ]}
            ],
            4: [
                { word: 'YÊU', img: '1x4u84d_L46dYa2nD1LpvVP2W8uCn3JIq', trans: { ENG: 'To Love', RUS: 'Любить' }, dialogs: [
                    { q: 'Bạn yêu ai nhất?', qTrans: { ENG: 'Who do you love most?', RUS: 'Кого ты любишь больше всего?' }, a: 'Tôi yêu gia đình mình nhất.', aTrans: { ENG: 'I love my family the most.', RUS: 'Я больше всего люблю свою семью.' } }
                ]},
                { word: 'ÔM', img: '1eUMqcCiYxvFoJEzksSjsb76kbyy1H4UN', trans: { ENG: 'To Hug', RUS: 'Обнимать' }, dialogs: [
                    { q: 'Cho tôi ôm bạn một cái!', qTrans: { ENG: 'Let me give you a hug!', RUS: 'Дай я тебя обниму!' }, a: 'Cảm ơn bạn, rất ấm áp.', aTrans: { ENG: 'Thank you, very warm.', RUS: 'Спасибо, очень тепло.' } }
                ]},
                { word: 'CƯỚI', img: '1NknpxsRBSjsMjch70X6fUFQ9LMsMma6E', trans: { ENG: 'To Marry', RUS: 'Жениться' }, dialogs: [
                    { q: 'Khi nào hai người cưới?', qTrans: { ENG: 'When will you two get married?', RUS: 'Когда вы двое поженитесь?' }, a: 'Chúng tôi cưới vào năm sau.', aTrans: { ENG: 'We are getting married next year.', RUS: 'Мы поженимся в следующем году.' } }
                ]},
                { word: 'KHUYÊN', img: '1QYgBBZiIbRI90WWCmrGcQ79FrfEkUcWq', trans: { ENG: 'To Advise', RUS: 'Советовать' }, dialogs: [
                    { q: 'Bạn khuyên tôi nên làm gì?', qTrans: { ENG: 'What do you advise me to do?', RUS: 'Что ты мне посоветуешь делать?' }, a: 'Tôi khuyên bạn nên nghỉ ngơi.', aTrans: { ENG: 'I advise you to rest.', RUS: 'Я советую тебе отдохнуть.' } }
                ]},
                { word: 'GỌI ĐIỆN', img: '1udyx7mlH5SaI-9Ich__AiDVrVH0NTIaV', trans: { ENG: 'To Call', RUS: 'Звонить' }, dialogs: [
                    { q: 'Tối nay gọi điện cho tôi nhé?', qTrans: { ENG: 'Call me tonight, okay?', RUS: 'Позвони мне сегодня вечером, ладно?' }, a: 'Được, tôi sẽ gọi lúc 8 giờ.', aTrans: { ENG: 'Okay, I will call at 8 o’clock.', RUS: 'Хорошо, я позвоню в 8.' } }
                ]}
            ]
        };

        let currentLang = 'ENG';
        let currentPriority = 1;
        let currentRound = 1;
        let selectedWord = null;
        let isMuted = false;
        let currentMode = 'MATCH';
        let dragOffset = { x: 0, y: 0 };

        const ttsAudio = new Audio();
        function speakWord(text) {
            if (isMuted) return Promise.resolve();
            const encodedText = encodeURIComponent(text);
            const url = \`https://translate.google.com/translate_tts?ie=UTF-8&q=\${encodedText}&tl=vi&client=tw-ob\`;
            ttsAudio.src = url;
            return ttsAudio.play().catch(err => console.log("Audio play error:", err));
        }

        function playSuccessEffect() {
            if (isMuted) return;
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3');
            audio.volume = 0.4;
            audio.play().catch(e => console.log("Success audio blocked"));
        }

        function setLanguage(lang) {
            currentLang = lang;
            document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
            document.getElementById(\`btn-eng\`).classList.toggle('active', lang === 'ENG');
            document.getElementById(\`btn-rus\`).classList.toggle('active', lang === 'RUS');
            updateStartScreenUI();
        }

        function updateStartScreenUI() {
            const t = i18n[currentLang];
            document.getElementById('st-subtitle').innerText = t.subtitle;
            document.getElementById('st-lang-label').innerText = t.langLabel;
            document.getElementById('st-how').innerHTML = t.how;
            document.getElementById('st-lvl-label').innerText = t.lvlLabel;
            document.getElementById('btn-start').innerText = t.startBtn;
            document.getElementById('btn-back').innerText = t.back;
            document.getElementById('btn-next').innerText = t.next;
            document.getElementById('btn-restart').innerText = t.restart;
            document.getElementById('fin-title').innerText = t.finTitle;
            document.getElementById('fin-desc').innerText = t.finDesc;
            document.getElementById('pop-title').innerText = t.popTitle;
            document.getElementById('popup-continue-btn').innerText = t.popBtn;
        }

        function setPriority(p, btn) {
            currentPriority = p;
            currentRound = 1;
            document.querySelectorAll('.level-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        }

        function startGame() {
            document.getElementById('start-screen').style.display = 'none';
            document.getElementById('mode-badge').style.display = 'block';
            initRound();
        }

        function initRound() {
            const data = db[currentPriority];
            currentRound = Math.min(currentRound, data.length);
            
            document.getElementById('lvl-label').innerText = currentPriority;
            document.getElementById('rnd-label').innerText = \`\${currentRound}/\${data.length}\`;
            
            currentMode = 'MATCH';
            const t = i18n[currentLang];
            document.getElementById('mode-badge').innerText = t.matchMode;
            document.getElementById('mode-badge').style.background = '#00b894';
            document.getElementById('mode-badge').style.color = 'white';

            renderMatchMode();
        }

        function renderMatchMode() {
            const area = document.getElementById('game-area');
            area.innerHTML = '';
            const data = db[currentPriority];
            const currentItem = data[currentRound - 1];

            const grid = document.createElement('div');
            grid.className = 'layout-grid';

            const container = document.createElement('div');
            container.className = 'slot-container';

            const card = document.createElement('div');
            card.className = 'action-card';
            card.innerHTML = \`<div class="image-wrapper"><img src="\${getImg(currentItem.img)}" class="action-image" onerror="this.src='https://via.placeholder.com/260?text=\${currentItem.word}'" draggable="false"></div>\`;

            const dropZone = document.createElement('div');
            dropZone.className = 'answer-box';
            dropZone.id = 'drop-zone';
            dropZone.innerText = i18n[currentLang].dragText;

            container.appendChild(card);
            container.appendChild(dropZone);
            grid.appendChild(container);
            area.appendChild(grid);

            const wordEl = document.createElement('div');
            wordEl.className = 'floating-word';
            wordEl.style.left = '50px';
            wordEl.style.top = '220px';
            wordEl.innerHTML = \`<span>\${currentItem.word}</span>\`;
            
            wordEl.onmousedown = (e) => startDrag(e, wordEl, currentItem.word);
            wordEl.ontouchstart = (e) => startDrag(e.touches[0], wordEl, currentItem.word);
            area.appendChild(wordEl);
        }

        function startDrag(e, el, word) {
            selectedWord = word;
            dragOffset.x = e.clientX - el.offsetLeft;
            dragOffset.y = e.clientY - el.offsetTop;
            el.style.cursor = 'grabbing';

            const move = (me) => {
                const clientX = me.clientX || me.touches?.[0].clientX;
                const clientY = me.clientY || me.touches?.[0].clientY;
                el.style.left = (clientX - dragOffset.x) + 'px';
                el.style.top = (clientY - dragOffset.y) + 'px';
            };

            const stop = () => {
                document.removeEventListener('mousemove', move);
                document.removeEventListener('mouseup', stop);
                document.removeEventListener('touchmove', move);
                document.removeEventListener('touchend', stop);
                checkDrop(el);
            };

            document.addEventListener('mousemove', move);
            document.addEventListener('mouseup', stop);
            document.addEventListener('touchmove', move);
            document.addEventListener('touchend', stop);
        }

        function checkDrop(el) {
            const zone = document.getElementById('drop-zone');
            const rect = zone.getBoundingClientRect();
            const elRect = el.getBoundingClientRect();
            const overlap = !(elRect.right < rect.left || elRect.left > rect.right || elRect.bottom < rect.top || elRect.top > rect.bottom);

            if (overlap) {
                const currentItem = db[currentPriority][currentRound - 1];
                zone.innerHTML = \`<span style="font-size:28px; margin-bottom: 5px">\${currentItem.word}</span><span style="font-size:18px">\${currentItem.trans[currentLang]}</span>\`;
                zone.className = 'answer-box correct';
                el.remove();
                confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
                
                playSuccessEffect();
                speakWord(currentItem.word);

                setTimeout(showPopup, 800);
            }
        }

        function showPopup() {
            const currentItem = db[currentPriority][currentRound - 1];
            const content = document.getElementById('popup-content');
            content.innerHTML = \`
                <div class="popup-row">
                    <img src="\${getImg(currentItem.img)}" class="popup-img" onerror="this.src='https://via.placeholder.com/100?text=\${currentItem.word}'">
                    <div>
                        <div style="font-size:36px; font-weight:900; color:var(--accent-color)">\${currentItem.word}</div>
                        <div style="font-size:24px; font-weight:bold; color: #444">\${currentItem.trans[currentLang]}</div>
                    </div>
                </div>
            \`;
            document.getElementById('modal-overlay').style.display = 'flex';
        }

        function handlePopupContinue() {
            document.getElementById('modal-overlay').style.display = 'none';
            currentMode = 'PRACTICE';
            document.getElementById('mode-badge').innerText = i18n[currentLang].speakMode;
            document.getElementById('mode-badge').style.background = '#ff7675';
            renderPracticeMode();
        }

        function renderPracticeMode() {
            const area = document.getElementById('game-area');
            area.innerHTML = '';
            const currentItem = db[currentPriority][currentRound - 1];
            const t = i18n[currentLang];

            const container = document.createElement('div');
            container.className = 'practice-container';

            const header = document.createElement('div');
            header.className = 'dialogue-header';
            header.innerHTML = \`
                <div style="display:flex; align-items:center; gap:10px">
                    <div style="width:12px; height:12px; background:#00b894; border-radius:50%"></div>
                    <span style="font-weight:900; color:#444">\${t.storyHeader}: \${currentItem.word}</span>
                </div>
                <button class="listen-all-btn" onclick="playFullStory()">
                    <span>▶</span> \${t.listenAll}
                </button>
            \`;

            const chatArea = document.createElement('div');
            chatArea.className = 'review-scroll-area';
            chatArea.id = 'chat-scroll';

            currentItem.dialogs.forEach((d, i) => {
                chatArea.appendChild(createBubble(d.q, d.qTrans[currentLang], 'ai', \`q-\${i}\`));
                chatArea.appendChild(createBubble(d.a, d.aTrans[currentLang], 'user', \`a-\${i}\`));
            });

            container.appendChild(header);
            container.appendChild(chatArea);
            area.appendChild(container);
        }

        function createBubble(main, trans, type, id) {
            const b = document.createElement('div');
            b.className = \`chat-bubble \${type}-bubble\`;
            b.id = id;
            b.innerHTML = \`
                <div class="sentence-main">\${main}</div>
                <div class="sentence-trans">\${trans}</div>
                <div class="bubble-controls">
                    <button class="mini-speaker" onclick="speakWordAction('\${main.replace(/'/g, "\\\\'")}', '\${id}')">🔊</button>
                </div>
            \`;
            return b;
        }

        function speakWordAction(text, id) {
            document.querySelectorAll('.chat-bubble').forEach(el => el.classList.remove('active-audio'));
            if (id && document.getElementById(id)) document.getElementById(id).classList.add('active-audio');
            
            speakWord(text).then(() => {
                ttsAudio.onended = () => {
                    if (id && document.getElementById(id)) document.getElementById(id).classList.remove('active-audio');
                };
            });
        }

        async function playFullStory() {
            const currentItem = db[currentPriority][currentRound - 1];
            for (let i = 0; i < currentItem.dialogs.length; i++) {
                const d = currentItem.dialogs[i];
                await speakAsync(d.q, \`q-\${i}\`);
                await new Promise(r => setTimeout(r, 600));
                await speakAsync(d.a, \`a-\${i}\`);
                await new Promise(r => setTimeout(r, 800));
            }
        }

        function speakAsync(text, id) {
            return new Promise((resolve) => {
                if (isMuted) return resolve();
                document.querySelectorAll('.chat-bubble').forEach(el => el.classList.remove('active-audio'));
                if (id && document.getElementById(id)) document.getElementById(id).classList.add('active-audio');
                
                speakWord(text).then(() => {
                    ttsAudio.onended = () => {
                        if (id && document.getElementById(id)) document.getElementById(id).classList.remove('active-audio');
                        resolve();
                    };
                });
            });
        }

        function navigateRound(dir) {
            const data = db[currentPriority];
            if (dir === 1) {
                if (currentRound < data.length) { currentRound++; initRound(); }
                else { 
                    if (currentPriority < 4) {
                        setPriority(currentPriority + 1, document.querySelectorAll('.level-btn')[currentPriority]);
                        initRound();
                    } else {
                        document.getElementById('finish-screen').style.display = 'flex'; 
                    }
                }
            } else {
                if (currentRound > 1) { currentRound--; initRound(); }
                else if (currentPriority > 1) {
                    setPriority(currentPriority - 1, document.querySelectorAll('.level-btn')[currentPriority - 2]);
                    currentRound = 5;
                    initRound();
                }
            }
        }

        document.getElementById('mute-btn').onclick = function() {
            isMuted = !isMuted;
            this.innerText = isMuted ? '🔇' : '🔊';
            if (isMuted) ttsAudio.pause();
        };

        updateStartScreenUI();
    </script>
</body>
</html>
`;

const Vietnameseverb2: React.FC = () => {
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
            title="Vietnamese Verb 2 Game"
        /> : <div className="w-full h-full bg-slate-200 flex items-center justify-center"><p>Loading game...</p></div>}</>
    );
};

export default Vietnameseverb2;
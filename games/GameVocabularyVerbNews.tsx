
import React, { useEffect, useRef, useState } from 'react';
import { Maximize, Minimize } from 'lucide-react';

const gameHTML = `
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Vietnamese Verb 1</title>
    <!-- Confetti Library -->
    <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js"></script>
    <style>
        :root {
            --primary-bg: #f0f4f8;
            --card-bg: #ffffff;
            --accent-color: #6c5ce7;
            --drop-zone-border: #00b894;
            --text-dark: #2d3436;
        }

        * {
            box-sizing: border-box;
            user-select: none;
            -webkit-tap-highlight-color: transparent;
        }

        body {
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background: var(--primary-bg);
            overflow: hidden;
            height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        /* Header UI */
        #top-bar {
            width: 100%;
            padding: 10px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            z-index: 100;
            visibility: hidden;
        }

        .nav-controls {
            display: flex;
            gap: 10px;
        }

        .btn-nav {
            background: white;
            border: 2px solid var(--accent-color);
            color: var(--accent-color);
            border-radius: 50%;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-weight: bold;
            font-size: 18px;
            transition: 0.2s;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }

        .btn-nav:hover {
            background: var(--accent-color);
            color: white;
        }

        .info-panel {
            background: white;
            padding: 8px 18px;
            border-radius: 50px;
            font-size: 16px;
            font-weight: bold;
            color: var(--text-dark);
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            border: 2px solid var(--accent-color);
            display: flex;
            align-items: center;
            gap: 8px;
        }

        /* Main Play Area */
        #game-area {
            position: relative;
            flex: 1;
            width: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 10px;
            z-index: 10;
        }

        .layout-grid {
            display: flex;
            gap: 15px;
            justify-content: center;
            align-items: center;
            width: 100%;
            max-width: 1600px;
        }

        /* MOBILE VERTICAL (PORTRAIT) */
        @media (orientation: portrait) {
            .layout-grid {
                flex-direction: column;
            }
            .action-card {
                padding: 10px !important;
                max-width: 260px !important;
                border-width: 4px !important;
            }
            .action-image {
                width: 140px !important;
                height: 140px !important;
            }
            .dual-label {
                font-size: 14px !important;
                margin-bottom: 5px !important;
                min-height: 30px !important;
            }
            .answer-box {
                min-height: 60px !important;
                font-size: 16px !important;
                max-width: 240px !important;
            }
            .floating-word {
                font-size: 18px !important;
                padding: 8px 18px !important;
            }
        }

        /* MOBILE HORIZONTAL & PC (LANDSCAPE) */
        @media (orientation: landscape) {
            .layout-grid {
                flex-direction: row;
            }
        }
        
        /* PC LARGE LANDSCAPE OPTIMIZATIONS to fit within a 16:9 aspect ratio without scrolling */
        @media (orientation: landscape) and (min-width: 1024px) {
            .action-image {
                width: 115px !important; /* Scaled down by ~80% from 144px */
                height: 115px !important; /* Scaled down by ~80% from 144px */
            }
            .action-card {
                padding: 12px !important;
                max-width: 240px !important;
            }
            .answer-box {
                min-height: 60px !important;
                font-size: 16px !important;
                max-width: 220px !important;
            }
            .dual-label {
                margin-bottom: 8px !important;
            }
            .floating-word {
                font-size: 18px !important;
                padding: 8px 20px !important;
            }
        }

        .slot-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
            flex: 1;
        }

        .action-card {
            background: var(--card-bg);
            padding: 20px;
            border-radius: 35px;
            box-shadow: 0 15px 45px rgba(0,0,0,0.15);
            border: 8px solid white;
            transition: all 0.3s ease;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            width: 100%;
            max-width: 350px;
        }

        .dual-label {
            font-size: 16px;
            font-weight: 900;
            color: var(--accent-color);
            margin-bottom: 15px;
            text-transform: uppercase;
            text-align: center;
            line-height: 1.2;
            min-height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .action-image {
            width: 240px;
            height: 240px;
            object-fit: contain;
            border-radius: 20px;
        }

        .answer-box {
            width: 100%;
            max-width: 300px;
            min-height: 85px;
            background: rgba(255, 255, 255, 0.9);
            border: 5px dashed var(--drop-zone-border);
            border-radius: 24px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            font-size: 18px;
            font-weight: bold;
            color: #777;
            backdrop-filter: blur(5px);
            transition: all 0.3s ease;
            text-align: center;
            padding: 10px;
        }

        .answer-box.drag-over {
            background: #e8f5e9;
            transform: scale(1.05);
            border-style: solid;
        }

        .answer-box.correct {
            border-style: solid;
            background: #00b894;
            color: white;
            border-color: #00897b;
            box-shadow: 0 4px 15px rgba(0, 184, 148, 0.4);
        }

        .floating-word {
            position: absolute;
            padding: 12px 25px;
            background: var(--accent-color);
            color: white;
            border-radius: 35px;
            font-size: 22px;
            font-weight: 900;
            cursor: grab;
            box-shadow: 0 10px 20px rgba(108, 92, 231, 0.4);
            z-index: 100;
            border: 4px solid white;
            white-space: nowrap;
            touch-action: none;
            display: flex;
            flex-direction: column;
            align-items: center;
            line-height: 1.2;
            left: 0;
            top: 0;
        }

        /* Modals */
        .modal-overlay {
            display: none;
            position: fixed;
            top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.65);
            backdrop-filter: blur(10px);
            z-index: 500;
            justify-content: center;
            align-items: center;
        }

        .modal-content {
            background: white;
            width: 95%;
            max-width: 1100px;
            padding: 20px;
            border-radius: 30px;
            text-align: center;
            box-shadow: 0 25px 50px rgba(0,0,0,0.4);
            position: relative;
            max-height: 90vh;
            overflow-y: auto;
        }

        .lang-selector {
            display: flex;
            gap: 15px;
            justify-content: center;
            margin: 15px 0;
        }

        .lang-btn {
            padding: 8px 16px;
            border: 2px solid #ddd;
            border-radius: 12px;
            cursor: pointer;
            font-weight: bold;
            transition: 0.2s;
            background: #f8f9fa;
        }

        .lang-btn.active {
            border-color: var(--accent-color);
            background: #eef2ff;
            color: var(--accent-color);
        }

        /* How to play styles */
        .how-to-play {
            background: #f8f9fa;
            border-radius: 20px;
            padding: 15px;
            margin: 15px auto;
            max-width: 400px;
            text-align: left;
            border: 2px dashed #ddd;
        }
        .how-to-play-item {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 8px;
            font-size: 14px;
            color: #444;
            font-weight: 500;
        }
        .how-to-play-icon {
            background: var(--accent-color);
            color: white;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            flex-shrink: 0;
        }

        .modal-grid {
            display: flex;
            justify-content: center;
            flex-wrap: wrap;
            gap: 10px;
            margin: 15px 0;
        }

        .modal-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            background: #fdfdfd;
            padding: 12px;
            border-radius: 25px;
            min-width: 160px;
            border: 2px solid #f0f0f0;
            flex: 1;
            max-width: 350px;
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .modal-item.review-highlight {
            border-color: #f1c40f;
            background: #fff9db;
            transform: scale(1.08);
            box-shadow: 0 10px 30px rgba(241, 196, 15, 0.3);
            z-index: 10;
        }

        .example-box {
            margin-top: 10px;
            background: #f1f2f6;
            border-radius: 15px;
            padding: 8px 12px;
            width: 100%;
            font-size: 13px;
            text-align: left;
            border-left: 4px solid var(--accent-color);
        }

        .example-line {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin: 4px 0;
            font-weight: bold;
            color: #2d3436;
        }

        .translation-text {
            display: block;
            font-size: 11px;
            color: #636e72;
            font-weight: normal;
            margin-top: 2px;
            font-style: italic;
        }

        .btn {
            padding: 12px 20px;
            border-radius: 20px;
            border: none;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            transition: 0.2s;
        }

        .btn-start { background: var(--accent-color); color: white; width: 100%; font-size: 20px; }
        .btn-next { background: #00b894; color: white; width: 100%; margin-top: 10px;}
        .btn-listen-all { background: #6c5ce7; color: white; margin-bottom: 10px; padding: 10px 20px; display: inline-flex; align-items: center; gap: 8px;}
        .btn-small-speaker { background: #6366f1; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: none; font-size: 12px;}

        #review-list { 
            max-height: 40vh; 
            overflow-y: auto; 
            padding: 10px; 
            scroll-behavior: smooth;
            border: 2px inset #f0f0f0;
            border-radius: 20px;
            background: #fafafa;
        }

        .modal-item img {
            width: 80px;
            height: 80px;
            object-fit: contain;
            margin-bottom: 8px;
        }
    </style>
</head>
<body>

    <div id="start-screen" class="modal-overlay" style="display: flex;">
        <div class="modal-content" style="max-width: 600px;">
            <h1 id="ui-title" style="color: var(--accent-color); margin: 0; font-size: 24px;">VIETNAMESE VERB 1 🏃‍♂️</h1>
            <p id="ui-subtitle" style="margin-top: 5px; color: #666; font-size: 14px;">Học các động từ tiếng Việt phổ biến qua hình ảnh</p>
            
            <div class="lang-selector">
                <div class="lang-btn active" onclick="setLanguage('en')">🇺🇸 English</div>
                <div class="lang-btn" onclick="setLanguage('ru')">🇷🇺 Русский</div>
            </div>

            <div style="display: flex; flex-direction: column; align-items: center; margin: 10px 0;">
                
                <!-- HOW TO PLAY -->
                <div class="how-to-play">
                    <div class="how-to-play-item">
                        <div class="how-to-play-icon">1</div>
                        <span id="ui-step-1">Nhìn hình ảnh và đoán hành động.</span>
                    </div>
                    <div class="how-to-play-item">
                        <div class="how-to-play-icon">2</div>
                        <span id="ui-step-2">Kéo thả từ vựng vào ô trống tương ứng.</span>
                    </div>
                    <div class="how-to-play-item">
                        <div class="how-to-play-icon">3</div>
                        <span id="ui-step-3">Nghe phát âm và xem ví dụ để ghi nhớ.</span>
                    </div>
                </div>
            </div>
            
            <button id="ui-start-btn" class="btn btn-start" onclick="prepareAndStart()">BẮT ĐẦU CHƠI ➔</button>
        </div>
    </div>

    <div id="top-bar">
        <div class="nav-controls">
            <button class="btn-nav" onclick="prevRound()" title="Previous">❮</button>
            <div class="info-panel"><span id="ui-round-label">VÒNG</span>: <span id="current-round">1</span> / 5</div>
            <button class="btn-nav" onclick="nextRound()" title="Skip">❯</button>
        </div>
        <div class="info-panel"><span id="ui-level-label">CẤP ĐỘ</span> <span id="level-num">1</span></div>
    </div>

    <div id="game-area"></div>

    <div id="success-modal" class="modal-overlay">
        <div class="modal-content">
            <h2 id="ui-success-title" style="color: #00b894; margin: 0; font-size: 20px;">TUYỆT VỜI! 🎉</h2>
            <div id="modal-result-container" class="modal-grid"></div>
            <button id="ui-next-btn" class="btn btn-next" onclick="goToNextRound()">TIẾP TỤC ➔</button>
        </div>
    </div>

    <div id="review-modal" class="modal-overlay">
        <div class="modal-content">
            <h2 id="ui-level-complete-title" style="color: #6c5ce7; margin: 0; font-size: 20px;">HOÀN THÀNH CẤP ĐỘ! 🏆</h2>
            <p id="ui-review-subtitle" style="font-size: 14px;">Ôn tập các hành động đã học</p>
            <button class="btn btn-listen-all" id="btn-listen-all-logic" onclick="listenAll()">
                <span id="ui-listen-all-btn">🔊 NGHE TẤT CẢ</span>
            </button>
            <div id="review-list" class="modal-grid"></div>
            <button class="btn btn-next" id="level-complete-btn" onclick="startNextLevel()">CẤP ĐỘ TIẾP THEO ➔</button>
        </div>
    </div>

    <div id="final-modal" class="modal-overlay">
        <div class="modal-content">
            <h1 id="ui-final-title" style="color: #6c5ce7; font-size: 24px;">CHÚC MỪNG! 🌟</h1>
            <p id="ui-final-subtitle" style="font-size: 16px;">Bạn đã làm chủ tất cả hành động!</p>
            <div style="font-size: 60px; margin: 20px;">🎖️👑🏆</div>
            <button id="ui-replay-btn" class="btn btn-next" style="background: #6c5ce7;" onclick="location.reload()">CHƠI LẠI ➔</button>
        </div>
    </div>

    <script>
        const getDriveImg = (id) => \`https://lh3.googleusercontent.com/d/\${id}=s600\`;

        const imgMap = {
            'WATCH': getDriveImg('1iWOYWi0lOp-EkYsTTx-pze_kdFIURpb0'),
            'THINK': getDriveImg('14IUClsj3WatEiQP1mwrzHJp2BLh6yamS'),
            'TALK': getDriveImg('101jCWRt4guqVgEkUvV5fwcF6L4CkKdhF'),
            'STUDY': getDriveImg('1AFqqxArBK51GG7BlcjdsB7Q6g6IBEMbd'),
            'SHARE': getDriveImg('1BiUMauCjlAos39k1h1RefvgPRVv8CSTR'),
            'RELAX': getDriveImg('1tcDaI-CamNadh6173V0IWgPddAogFGQ_'),
            'READ': getDriveImg('19hbos3lZz3JwxYlWN1QvJuueNrDXKtXT'),
            'PLAY': getDriveImg('189BAxXtQR9C9L_3QhaxR5vBEHIWRVNof'),
            'MEET': getDriveImg('1owOZvrymHNs6lUHVt47mwYlo3AZvr_SK'),
            'LOOK': getDriveImg('1KLOuuNw7WFfk90RXCQZeBgrrS9eIQhEN'),
            'LIVE': getDriveImg('1bMY56T-Cf5HhetE3ykYLmArkosQObtjU'),
            'LISTEN': getDriveImg('1-tQlDcIlkRg_hinBfy9H4cP8ULvc1t04'),
            'LAUGH': getDriveImg('1RnP9_ue97Mwpp3dIFabjdR3c3hfwCIty'),
            'GO': getDriveImg('1Mtgg768CytYPrtQMSDl8wWNQnvMCCFlO'),
            'GO OUT': getDriveImg('1haI1DUa_o9JcQh7hse4-sTL3msCmfbnv'),
            'EAT': getDriveImg('1R8HiMaSKuNCUfB5047YHYy7d2bGMgiNq'),
            'DRIVE CAR': getDriveImg('1D_j2w9byvj-Qo-55FZdXY0OHU7HwOG4x'),
            'DRINK': getDriveImg('1XdnLXIHoRHyJZvrx1E9cr_ZhmW3867TF'),
            'CRY': getDriveImg('1dfUc-UJu_xTluC-f3SMp1C4ZwWfBcfoE'),
            'RIDE MOTORBIKE': getDriveImg('1LTODgtqnjrTw_roLfeeChyERT4s66Sic')
        };

        const translations = {
            en: {
                title: "VIETNAMESE VERB 1 🏃‍♂️",
                subtitle: "Learn common Vietnamese verbs through images",
                start: "START PLAYING ➔",
                step1: "Look at the image and guess the action.",
                step2: "Drag and drop the word into the matching box.",
                step3: "Listen to pronunciation and see examples.",
                round: "ROUND",
                level: "LEVEL",
                whichAction: "WHICH ACTION?",
                dropHere: "DROP HERE",
                success: "EXCELLENT! 🎉",
                next: "CONTINUE ➔",
                levelComplete: "LEVEL COMPLETE! 🏆",
                reviewSub: "Review the actions you learned",
                listenAll: "🔊 LISTEN ALL",
                nextLevel: "NEXT LEVEL ➔",
                finalTitle: "CONGRATULATIONS! 🌟",
                finalSub: "You mastered all actions!",
                replay: "PLAY AGAIN ➔"
            },
            ru: {
                title: "ВЬЕТНАМСКИЙ ГЛАГОЛ 1 🏃‍♂️",
                subtitle: "Изучайте общие вьетнамские глаголы через картинки",
                start: "НАЧАТЬ ИГРУ ➔",
                step1: "Посмотрите на картинку и угадайте действие.",
                step2: "Перетащите слово в соответствующее поле.",
                step3: "Слушайте произношение и смотрите примеры.",
                round: "РАУНД",
                level: "УРОВЕНЬ",
                whichAction: "КАКОЕ ДЕЙСТВИЕ?",
                dropHere: "ПЕРЕТАЩИТЕ СЮДА",
                success: "ОТЛИЧНО! 🎉",
                next: "ПРОДОЛЖИТЬ ➔",
                levelComplete: "УРОВЕНЬ ЗАВЕРШЕН! 🏆",
                reviewSub: "Повторите изученные действия",
                listenAll: "🔊 СЛУШАТЬ ВСЁ",
                nextLevel: "СЛЕДУЮЩИЙ УРОВЕНЬ ➔",
                finalTitle: "ПОЗДРАВЛЯЕМ! 🌟",
                finalSub: "Вы освоили все действия!",
                replay: "ИГРАТЬ СНОВА ➔"
            }
        };

        const dictionary = {
            'LAUGH': { word: 'CƯỜI', image: imgMap['LAUGH'], 
                viEx: { s1: 'Tôi cười rất to', s2: 'Bạn cười rất tươi' },
                en: { tr: 'Laugh', s1: 'I laugh very loud', s2: 'You laugh brightly' },
                ru: { tr: 'Смеяться', s1: 'Я очень громко смеюсь', s2: 'Ты весело смеешься' }
            },
            'CRY': { word: 'KHÓC', image: imgMap['CRY'], 
                viEx: { s1: 'Tôi khóc rất nhiều', s2: 'Em bé đang khóc' },
                en: { tr: 'Cry', s1: 'I cry a lot', s2: 'The baby is crying' },
                ru: { tr: 'Плакать', s1: 'Я много плачу', s2: 'Ребенок плачет' }
            },
            'MEET': { word: 'GẶP GỠ', image: imgMap['MEET'], 
                viEx: { s1: 'Tôi gặp gỡ gia đình', s2: 'Tôi gặp gỡ bạn bè' },
                en: { tr: 'Meet', s1: 'I meet my family', s2: 'I meet my friends' },
                ru: { tr: 'Встречаться', s1: 'Я встречаюсь с семьей', s2: 'Я встречаюсь с друзьями' }
            },
            'GO OUT': { word: 'ĐI RA NGOÀI', image: imgMap['GO OUT'], 
                viEx: { s1: 'Tôi đi ra ngoài chơi', s2: 'Chúng ta đi ra ngoài' },
                en: { tr: 'Go out', s1: 'I go out to play', s2: 'We go out' },
                ru: { tr: 'Выходить', s1: 'Я иду гулять', s2: 'Мы выходим на улицу' }
            },
            'SHARE': { word: 'CHIA SẺ', image: imgMap['SHARE'], 
                viEx: { s1: 'Tôi chia sẻ thức ăn', s2: 'Tôi chia sẻ kinh nghiệm' },
                en: { tr: 'Share', s1: 'I share food', s2: 'I share experience' },
                ru: { tr: 'Делиться', s1: 'Я делюсь едой', s2: 'Я делюсь опытом' }
            },
            'THINK': { word: 'SUY NGHĨ', image: imgMap['THINK'], 
                viEx: { s1: 'Tôi suy nghĩ về bạn', s2: 'Anh ấy đang suy nghĩ' },
                en: { tr: 'Think', s1: 'I think about you', s2: 'He is thinking' },
                ru: { tr: 'Думать', s1: 'Я думаю о тебе', s2: 'Он думает' }
            },
            'TALK': { word: 'NÓI CHUYỆN', image: imgMap['TALK'], 
                viEx: { s1: 'Tôi nói chuyện với bạn', s2: 'Họ nói chuyện vui vẻ' },
                en: { tr: 'Talk', s1: 'I talk with you', s2: 'They talk happily' },
                ru: { tr: 'Разговаривать', s1: 'Я разговариваю с тобой', s2: 'Они весело разговаривают' }
            },
            'STUDY': { word: 'HỌC', image: imgMap['STUDY'], 
                viEx: { s1: 'Tôi học tiếng Việt', s2: 'Bạn học bài chưa?' },
                en: { tr: 'Study', s1: 'I study Vietnamese', s2: 'Have you studied yet?' },
                ru: { tr: 'Учиться', s1: 'Я учу вьетнамский', s2: 'Ты đã học chưa?' }
            },
            'LISTEN': { word: 'NGHE', image: imgMap['LISTEN'], 
                viEx: { s1: 'Tôi nghe nhạc', s2: 'Bạn đang nghe gì?' },
                en: { tr: 'Listen', s1: 'I listen to music', s2: 'What are you listening to?' },
                ru: { tr: 'Слушать', s1: 'Я слушаю музыку', s2: 'Что ты слушаешь?' }
            },
            'READ': { word: 'ĐỌC', image: imgMap['READ'], 
                viEx: { s1: 'Tôi đọc sách', s2: 'Tôi đang đọc báo' },
                en: { tr: 'Read', s1: 'I read books', s2: 'I am reading news' },
                ru: { tr: 'Читать', s1: 'Я читаю книги', s2: 'Я читаю газету' }
            },
            'WATCH': { word: 'XEM', image: imgMap['WATCH'], 
                viEx: { s1: 'Tôi xem phim', s2: 'Bạn xem TV không?' },
                en: { tr: 'Watch', s1: 'I watch movies', s2: 'Do you watch TV?' },
                ru: { tr: 'Смотреть', s1: 'Я смотрю фильмы', s2: 'Ты смотришь телевизор?' }
            },
            'RELAX': { word: 'THƯ GIÃN', image: imgMap['RELAX'], 
                viEx: { s1: 'Tôi thư giãn ở nhà', s2: 'Chúng tôi đi thư giãn' },
                en: { tr: 'Relax', s1: 'I relax at home', s2: 'We go to relax' },
                ru: { tr: 'Отдыхать', s1: 'Я отдыхаю дома', s2: 'Мы идем отдыхать' }
            },
            'RIDE MOTORBIKE': { word: 'ĐI XE MÁY', image: imgMap['RIDE MOTORBIKE'], 
                viEx: { s1: 'Tôi đi xe máy đi làm', s2: 'Bạn đi xe máy cẩn thận' },
                en: { tr: 'Ride motorbike', s1: 'I go to work by motorbike', s2: 'Ride carefully' },
                ru: { tr: 'Ездить на мотоцикле', s1: 'Я еду trên moto', s2: 'Езжай осторожно' }
            },
            'DRIVE CAR': { word: 'LÁI Ô TÔ', image: imgMap['DRIVE CAR'], 
                viEx: { s1: 'Tôi lái ô tô an toàn', s2: 'Anh ấy lái ô tô giỏi' },
                en: { tr: 'Drive car', s1: 'I drive safely', s2: 'He drives car well' },
                ru: { tr: 'Водить машину', s1: 'Я безопасно вожу машину', s2: 'Он хорошо водит машину' }
            },
            'LOOK': { word: 'NHÌN', image: imgMap['LOOK'], 
                viEx: { s1: 'Tôi nhìn bầu trời', s2: 'Bạn đang nhìn gì?' },
                en: { tr: 'Look', s1: 'I look at the sky', s2: 'What are you looking at?' },
                ru: { tr: 'Смотреть', s1: 'Я смотрю на небо', s2: 'На что ты смотришь?' }
            },
            'GO': { word: 'ĐI', image: imgMap['GO'], 
                viEx: { s1: 'Tôi đi học', s2: 'Tôi đi siêu thị' },
                en: { tr: 'Go', s1: 'I go to school', s2: 'I go to the supermarket' },
                ru: { tr: 'Идти', s1: 'Я иду в школу', s2: 'Я и đi siêu thị' }
            },
            'EAT': { word: 'ĂN', image: imgMap['EAT'], 
                viEx: { s1: 'Tôi ăn cơm', s2: 'Bạn ăn gì chưa?' },
                en: { tr: 'Eat', s1: 'I eat rice', s2: 'Have you eaten anything yet?' },
                ru: { tr: 'Есть', s1: 'Я ем рис', s2: 'Ты уже что-нибудь ел?' }
            },
            'DRINK': { word: 'UỐNG', image: imgMap['DRINK'], 
                viEx: { s1: 'Tôi uống nước', s2: 'Tôi uống cà phê' },
                en: { tr: 'Drink', s1: 'I drink water', s2: 'I drink coffee' },
                ru: { tr: 'Пить', s1: 'Я пью воду', s2: 'Я пью кофе' }
            },
            'LIVE': { word: 'SỐNG', image: imgMap['LIVE'], 
                viEx: { s1: 'Tôi sống ở Việt Nam', s2: 'Bạn sống ở đâu?' },
                en: { tr: 'Live', s1: 'I live in Vietnam', s2: 'Where do you live?' },
                ru: { tr: 'Жить', s1: 'Я живу во Вьетнаме', s2: 'Где ты живешь?' }
            },
            'PLAY': { word: 'CHƠI', image: imgMap['PLAY'], 
                viEx: { s1: 'Tôi chơi bóng đá', s2: 'Bạn muốn chơi không?' },
                en: { tr: 'Play', s1: 'I play football', s2: 'Do you want to play?' },
                ru: { tr: 'Играть', s1: 'Я играю в футбол', s2: 'Хочешь поиграть?' }
            }
        };

        const levelKeys = [
            ['LAUGH', 'CRY', 'MEET', 'GO OUT', 'SHARE'],
            ['THINK', 'TALK', 'STUDY', 'LISTEN', 'READ'],
            ['WATCH', 'RELAX', 'RIDE MOTORBIKE', 'DRIVE CAR', 'LOOK'],
            ['GO', 'EAT', 'DRINK', 'LIVE', 'PLAY']
        ];

        let currentLang = 'en';
        let currentLevel = 1;
        let round = 0;
        let activeWords = [];
        let solvedCount = 0;
        let levelHistory = [];
        
        const SPEED = 2.0;
        const ding = new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3');
        const victorySound = new Audio('https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3');

        // Audio System
        const ttsAudio = new Audio();
        function speakWord(text) {
            const encodedText = encodeURIComponent(text);
            const url = \`https://translate.google.com/translate_tts?ie=UTF-8&q=\${encodedText}&tl=vi&client=tw-ob\`;
            ttsAudio.src = url;
            return ttsAudio.play().catch(err => console.log("Audio play error:", err));
        }

        function setLanguage(lang) {
            currentLang = lang;
            document.querySelectorAll('.lang-btn').forEach(b => {
                const isMatch = (lang === 'en' && b.innerText.includes('English')) || (lang === 'ru' && b.innerText.includes('Русский'));
                b.classList.toggle('active', isMatch);
            });
            updateUIStrings();
        }

        function updateUIStrings() {
            const t = translations[currentLang];
            document.getElementById('ui-title').innerText = t.title;
            document.getElementById('ui-subtitle').innerText = t.subtitle;
            document.getElementById('ui-start-btn').innerText = t.start;
            document.getElementById('ui-step-1').innerText = t.step1;
            document.getElementById('ui-step-2').innerText = t.step2;
            document.getElementById('ui-step-3').innerText = t.step3;
            document.getElementById('ui-round-label').innerText = t.round;
            document.getElementById('ui-level-label').innerText = t.level;
            document.getElementById('ui-success-title').innerText = t.success;
            document.getElementById('ui-next-btn').innerText = t.next;
            document.getElementById('ui-level-complete-title').innerText = t.levelComplete;
            document.getElementById('ui-review-subtitle').innerText = t.reviewSub;
            document.getElementById('ui-listen-all-btn').innerText = t.listenAll;
            document.getElementById('level-complete-btn').innerText = t.nextLevel;
            document.getElementById('ui-final-title').innerText = t.finalTitle;
            document.getElementById('ui-final-subtitle').innerText = t.finalSub;
            document.getElementById('ui-replay-btn').innerText = t.replay;
        }

        async function listenAll() {
            const btn = document.getElementById('btn-listen-all-logic');
            const reviewList = document.getElementById('review-list');
            btn.disabled = true;
            btn.style.opacity = "0.5";

            const items = reviewList.querySelectorAll('.modal-item');

            for (let i = 0; i < levelHistory.length; i++) {
                const key = levelHistory[i];
                const itemEl = items[i];

                if (itemEl) {
                    itemEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    itemEl.classList.add('review-highlight');
                }

                await speakWord(dictionary[key].word);
                await new Promise(r => setTimeout(r, 1500));

                if (itemEl) {
                    itemEl.classList.remove('review-highlight');
                }
            }
            
            btn.disabled = false;
            btn.style.opacity = "1";
        }

        function prepareAndStart() {
            document.getElementById('start-screen').style.display = 'none';
            document.getElementById('top-bar').style.visibility = 'visible';
            initRound();
        }

        function initRound() {
            const gameArea = document.getElementById('game-area');
            gameArea.innerHTML = '';
            document.querySelectorAll('.modal-overlay:not(#start-screen)').forEach(m => m.style.display = 'none');
            
            document.getElementById('current-round').textContent = round + 1;
            document.getElementById('level-num').textContent = currentLevel;

            solvedCount = 0;
            activeWords.forEach(w => { if(w.element) w.element.remove(); });
            activeWords = [];

            const currentLevelKeys = levelKeys[currentLevel - 1];
            const mainWordKey = currentLevelKeys[round % currentLevelKeys.length];
            
            let displayKeys = [mainWordKey];
            
            // Logic Level 3/4: Only 2 slots per round
            let maxSlots = currentLevel;
            if (currentLevel >= 3) {
                maxSlots = 2;
            }

            if (maxSlots > 1) {
                const pool = levelKeys.slice(0, currentLevel).flat().filter(k => k !== mainWordKey);
                for (let i = 0; i < Math.min(maxSlots - 1, pool.length); i++) {
                    const idx = Math.floor(Math.random() * pool.length);
                    displayKeys.push(pool.splice(idx, 1)[0]);
                }
            }

            if (!levelHistory.includes(mainWordKey)) levelHistory.push(mainWordKey);

            const layout = document.createElement('div');
            layout.className = \`layout-grid\`;
            gameArea.appendChild(layout);

            displayKeys.forEach((key) => {
                const data = dictionary[key];
                const container = document.createElement('div');
                container.className = 'slot-container';
                container.innerHTML = \`
                    <div class="action-card">
                        <div class="dual-label">\${translations[currentLang].whichAction}</div>
                        <img src="\${data.image}" class="action-image" alt="\${data.word}" onerror="this.src='https://via.placeholder.com/240?text=Error'">
                    </div>
                    <div class="answer-box" data-key="\${key}">\${translations[currentLang].dropHere}</div>
                \`;
                layout.appendChild(container);
                createFloatingWord(key);
            });

            if (!window.animating) {
                window.animating = true;
                animate();
            }
        }

        function createFloatingWord(key) {
            const el = document.createElement('div');
            el.className = 'floating-word';
            el.textContent = dictionary[key].word;
            document.body.appendChild(el);

            const wordObj = {
                element: el,
                key: key,
                x: Math.random() * (window.innerWidth - 150),
                y: Math.random() * (window.innerHeight - 100),
                vx: (Math.random() - 0.5) * SPEED,
                vy: (Math.random() - 0.5) * SPEED,
                width: 0,
                height: 0,
                isDragging: false,
                isSolved: false
            };

            setTimeout(() => {
                wordObj.width = el.offsetWidth;
                wordObj.height = el.offsetHeight;
            }, 0);

            el.addEventListener('pointerdown', (e) => onPointerDown(e, wordObj));
            activeWords.push(wordObj);
        }

        let dragObj = null;
        function onPointerDown(e, obj) {
            if (obj.isSolved) return;
            dragObj = obj;
            obj.isDragging = true;
            obj.element.style.cursor = 'grabbing';
            obj.element.setPointerCapture(e.pointerId);
            
            obj.element.addEventListener('pointermove', onPointerMove);
            obj.element.addEventListener('pointerup', onPointerUp);
        }

        function onPointerMove(e) {
            if (!dragObj) return;
            dragObj.x = e.clientX - dragObj.width / 2;
            dragObj.y = e.clientY - dragObj.height / 2;
            
            document.querySelectorAll('.answer-box').forEach(box => {
                const rect = box.getBoundingClientRect();
                if (e.clientX > rect.left && e.clientX < rect.right &&
                    e.clientY > rect.top && e.clientY < rect.bottom) {
                    box.classList.add('drag-over');
                } else {
                    box.classList.remove('drag-over');
                }
            });
        }

        function onPointerUp(e) {
            if (!dragObj) return;
            const obj = dragObj;
            let foundMatch = false;

            document.querySelectorAll('.answer-box').forEach(box => {
                box.classList.remove('drag-over');
                const rect = box.getBoundingClientRect();
                if (e.clientX > rect.left && e.clientX < rect.right &&
                    e.clientY > rect.top && e.clientY < rect.bottom) {
                    if (box.dataset.key === obj.key) {
                        solveWord(obj, box);
                        foundMatch = true;
                    }
                }
            });

            if (!foundMatch) {
                obj.isDragging = false;
                obj.element.style.cursor = 'grab';
            }
            
            obj.element.releasePointerCapture(e.pointerId);
            obj.element.removeEventListener('pointermove', onPointerMove);
            obj.element.removeEventListener('pointerup', onPointerUp);
            dragObj = null;
        }

        function solveWord(obj, box) {
            obj.isSolved = true;
            obj.isDragging = false;
            box.classList.add('correct');
            box.textContent = dictionary[obj.key].word;
            obj.element.style.display = 'none';
            
            speakWord(dictionary[obj.key].word);
            ding.play();
            
            solvedCount++;
            if (solvedCount === activeWords.length) {
                setTimeout(showSuccess, 600);
            }
        }

        function showSuccess() {
            const container = document.getElementById('modal-result-container');
            container.innerHTML = '';
            
            activeWords.forEach(obj => {
                const data = dictionary[obj.key];
                const item = document.createElement('div');
                item.className = 'modal-item';
                
                const trData = data[currentLang];
                
                const exHtml = \`
                    <div class="example-box">
                        <div class="example-line">
                            <div>
                                <span style="font-size:16px;">\${data.word}</span>
                                <span class="translation-text">(\${trData.tr})</span>
                            </div>
                            <button class="btn-small-speaker" onclick="speakWord('\${data.word}')">🔊</button>
                        </div>
                        <div class="example-line" style="margin-top:8px; flex-direction: column; align-items: flex-start; gap:6px;">
                            <div style="width:100%;">
                                <div style="display:flex; justify-content:space-between; align-items:center;">
                                    <span style="color:#2d3436; font-size:12px;">- \${data.viEx.s1}</span>
                                    <button class="btn-small-speaker" style="width:22px; height:22px; font-size:8px;" onclick="speakWord('\${data.viEx.s1}')">🔊</button>
                                </div>
                                <span class="translation-text" style="padding-left:8px;">\${trData.s1}</span>
                            </div>
                            <div style="width:100%;">
                                <div style="display:flex; justify-content:space-between; align-items:center;">
                                    <span style="color:#2d3436; font-size:12px;">- \${data.viEx.s2}</span>
                                    <button class="btn-small-speaker" style="width:22px; height:22px; font-size:8px;" onclick="speakWord('\${data.viEx.s2}')">🔊</button>
                                </div>
                                <span class="translation-text" style="padding-left:8px;">\${trData.s2}</span>
                            </div>
                        </div>
                    </div>\`;

                item.innerHTML = \`
                    <img src="\${data.image}">
                    <div style="font-weight:900; color:var(--accent-color); font-size:18px;">\${data.word}</div>
                    <div style="font-size:12px; color:#666; margin-bottom:5px;">\${trData.tr}</div>
                    \${exHtml}
                \`;
                container.appendChild(item);
            });

            document.getElementById('success-modal').style.display = 'flex';
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
        }

        function goToNextRound() {
            round++;
            if (round >= 5) {
                showReview();
            } else {
                initRound();
            }
        }

        function showReview() {
            const list = document.getElementById('review-list');
            list.innerHTML = '';
            levelHistory.forEach(key => {
                const data = dictionary[key];
                const item = document.createElement('div');
                item.className = 'modal-item';
                item.innerHTML = \`
                    <img src="\${data.image}" style="width:60px; height:60px;">
                    <div style="font-weight:bold; font-size: 14px;">\${data.word}</div>
                    <div style="font-size:10px; color:#888;">\${data[currentLang].tr}</div>
                    <button class="btn-small-speaker" onclick="speakWord('\${data.word}')">🔊</button>
                \`;
                list.appendChild(item);
            });
            
            const btn = document.getElementById('level-complete-btn');
            if (currentLevel >= levelKeys.length) {
                btn.textContent = translations[currentLang].replay;
                btn.onclick = () => document.getElementById('final-modal').style.display = 'flex';
            } else {
                btn.textContent = translations[currentLang].nextLevel;
                btn.onclick = startNextLevel;
            }

            document.getElementById('review-modal').style.display = 'flex';
            victorySound.play();
        }

        function startNextLevel() {
            currentLevel++;
            round = 0;
            levelHistory = [];
            initRound();
        }

        function prevRound() { if (round > 0) { round--; initRound(); } }
        function nextRound() { goToNextRound(); }

        function animate() {
            activeWords.forEach(obj => {
                if (!obj.isDragging && !obj.isSolved) {
                    obj.x += obj.vx;
                    obj.y += obj.vy;

                    if (obj.x <= 0 || obj.x + obj.width >= window.innerWidth) obj.vx *= -1;
                    if (obj.y <= 0 || obj.y + obj.height >= window.innerHeight) obj.vy *= -1;

                    obj.element.style.transform = \`translate(\${obj.x}px, \${obj.y}px)\`;
                } else if (obj.isDragging) {
                    obj.element.style.transform = \`translate(\${obj.x}px, \${obj.y}px)\`;
                }
            });
            requestAnimationFrame(animate);
        }

        window.addEventListener('resize', () => {
            activeWords.forEach(obj => {
                obj.x = Math.min(obj.x, window.innerWidth - obj.width);
                obj.y = Math.min(obj.y, window.innerHeight - obj.height);
            });
        });

        updateUIStrings();

    </script>
</body>
</html>
`;

const GameVocabularyVerbNews: React.FC = () => {
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
        <div ref={gameWrapperRef} className="relative w-full h-full overflow-hidden bg-white">
            {iframeSrc ? (
                <iframe
                    src={iframeSrc}
                    className="w-full h-full"
                    style={{ border: 'none' }}
                    allow="fullscreen"
                    title="Vietnamese Verb Game"
                ></iframe>
            ) : (
                <div className="flex items-center justify-center h-full">Loading...</div>
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

export default GameVocabularyVerbNews;

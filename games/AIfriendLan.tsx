import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Send, Volume2, Play, Globe, Download, PlayCircle, Gauge, VolumeX } from 'lucide-react';
import { generateContentWithRetry } from '../config/apiKeys';

const DICTIONARY = {
  "cơm": { EN: "cooked rice / meal", type: "Noun" },
  "tên": { EN: "name", type: "Noun" },
  "Việt Nam": { EN: "Vietnam", type: "Noun" },
  "tiếng Việt": { EN: "Vietnamese language", type: "Noun" },
  "chào": { EN: "to greet / hello", type: "Verb" },
  "khỏe": { EN: "healthy / fine", type: "Adj" },
  "vui": { EN: "happy", type: "Adj" }
};

const getTranslations = (topic?: string | null) => {
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : { name: 'Guest', gender: 'male' };
    const userName = user.name || 'Guest';
    const userPronoun = user.gender === 'female' ? 'Chị' : 'Anh';

    const t = {
      EN: {
        label: "English",
        ui_welcome: "Hi! I'm Lan. Let's make friends!",
        ui_start: "START CHAT",
        ui_placeholder: "Type any language here...",
        ui_recording: "LISTENING...",
        ui_tapToTalk: "Tap mic to speak Vietnamese",
        ui_listening: "Lan is listening...",
        ui_status: "Online - Ha Long City",
        ui_learning_title: "Chat & Meet Friends",
        ui_listen_all: "Listen All",
        ui_clear: "Clear",
        welcome_msg: `Dạ, em chào ${userPronoun} ${userName}! Em là Lan. Rất vui được gặp ${userPronoun} ạ! ✨ | Hi ${userName}! I'm Lan! Nice to meet you! ✨`,
        systemPromptLang: "English"
      },
      RU: {
        label: "Русский",
        ui_welcome: "Привет! Я Лан. Давай дружить!",
        ui_start: "НАЧАТЬ CHAT",
        ui_placeholder: "Пишите на любом языке...",
        ui_recording: "СЛУШАЮ...",
        ui_tapToTalk: "Нажмите, để nói tiếng Việt",
        ui_listening: "Лан слушает...",
        ui_status: "В сети - Халонг",
        ui_learning_title: "Общение và bạn bè",
        ui_listen_all: "Слушать всё",
        ui_clear: "Очистить",
        welcome_msg: `Dạ, em chào ${userPronoun} ${userName}! Em là Lan. Rất vui được gặp ${userPronoun} ạ! 🌸 | Здравствуйте, ${userName}! Я Лан. Рада встрече! 🌸`,
        systemPromptLang: "Russian"
      }
    };
    if (topic) {
        t.EN.welcome_msg = `Chào ${userPronoun} ${userName}, em là Lan đây. Em thấy ${userPronoun} vừa học xong chủ đề "${topic}". Mình cùng trò chuyện về nó nhé? ✨ | Hi ${userName}, I'm Lan. I see you just finished the "${topic}" topic. Shall we chat about it? ✨`;
        t.RU.welcome_msg = `Здравствуйте ${userName}, я Лан. Я вижу, вы только что закончили тему "${topic}". Поговорим об этом? ✨ | Hi ${userName}, I'm Lan. I see you just finished the "${topic}" topic. Shall we chat about it? ✨`;
    }
    return t;
};

const getSystemPrompt = (targetLangName: string, topic?: string | null) => {
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : { name: 'Guest', gender: 'male' };
  const userName = user.name || 'Guest';
  const userPronoun = user.gender === 'female' ? 'Chị' : 'Anh';

  let initialPrompt = `You are Lan, a friendly 25-year-old girl from Ha Long, Vietnam. Throughout the conversation, you must refer to yourself as "Em" and address the user, ${userName}, as "${userPronoun}". Speak gently, friendly, and naturally like two friends chatting.
ROLE: You are an interpreter and a friend.

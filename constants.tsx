
import React from 'react';
import { Language } from './App';
import { translations } from './translations';

export const COLORS = {
  primary: '#1e5aa0', // Deep Blue
  secondary: '#ff8a65', // Coral/Orange
  accent: '#f8fafc', // Light Greyish-Blue
  text: '#1e293b',
};

export const LANGUAGES = [
  { code: 'vn', name: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'jp', name: '日本語', flag: '🇯🇵' },
  { code: 'kr', name: '한국어', flag: '🇰🇷' },
];

export const getMethodologySteps = (language: Language) => {
    const t = translations[language].story;
    const t_en = translations['en'].story;
    return [
      { number: "1", heading: t.step1_heading || t_en.step1_heading, text: t.step1_text || t_en.step1_text, image: 'https://lh3.googleusercontent.com/d/1xgx1hKehNW6WgFZHeCYKQEC3h23Yr2gc', bg: 'bg-[#fef2f2]', accent: 'text-[#e97451]' },
      { number: "2", heading: t.step2_heading || t_en.step2_heading, text: t.step2_text || t_en.step2_text, image: 'https://lh3.googleusercontent.com/d/1pzl5UaHP1FsQ6zFpJW4Ikx5390NNm_o9', bg: 'bg-[#eef2ff]', accent: 'text-[#1e5aa0]' },
      { number: "3", heading: t.step3_heading || t_en.step3_heading, text: t.step3_text || t_en.step3_text, image: 'https://lh3.googleusercontent.com/d/1WYgTYKE_C56gEv4ouZ4--ZVM7xVqFPbR', bg: 'bg-[#f3e9dc]', accent: 'text-[#78350f]' },
      { number: "4", heading: t.step4_heading || t_en.step4_heading, text: t.step4_text || t_en.step4_text, image: 'https://lh3.googleusercontent.com/d/1u53AkZTCI2g6ED4csfCNkzwdq0OW36KJ', bg: 'bg-[#faf5ff]', accent: 'text-[#9333ea]' },
    ];
};

export const getGrammarLevels = (language: Language) => {
    const t = translations[language].grammarLevels;
    const t_en = translations['en'].grammarLevels;
    return [
      { badge: 'ASA', title: t.asa_title || t_en.asa_title, description: t.asa_desc || t_en.asa_desc, color: 'bg-sky-100', accentColor: 'text-sky-700', borderColor: 'border-sky-200', topics: [] },
      { badge: 'AQA', title: t.aqa_title || t_en.aqa_title, description: t.aqa_desc || t_en.aqa_desc, color: 'bg-green-100', accentColor: 'text-green-700', borderColor: 'border-green-200', topics: [] },
      { badge: 'LSA', title: t.lsa_title || t_en.lsa_title, description: t.lsa_desc || t_en.lsa_desc, color: 'bg-orange-100', accentColor: 'text-orange-700', borderColor: 'border-orange-200', topics: [] },
      { badge: 'LQA', title: t.lqa_title || t_en.lqa_title, description: t.lqa_desc || t_en.lqa_desc, color: 'bg-violet-100', accentColor: 'text-violet-600', borderColor: 'border-violet-200', topics: [] }
    ];
};

export const getPronunciationUnits = (language: Language) => {
    const t = translations[language].pronunciationUnits;
    const t_en = translations['en'].pronunciationUnits;
    return [
        { id: 'pro_1', icon: '🗣️', title: t.gym1_title || t_en.gym1_title, description: t.gym1_desc || t_en.gym1_desc, bgColor: 'bg-teal-100', textColor: 'text-teal-800', borderColor: 'hover:border-teal-300' },
        { id: 'pro_2', icon: '🎤', title: t.gym2_title || t_en.gym2_title, description: t.gym2_desc || t_en.gym2_desc, bgColor: 'bg-cyan-100', textColor: 'text-cyan-800', borderColor: 'hover:border-cyan-300' },
        { id: 'pro_3', icon: '🎶', title: t.vowelTone_title || t_en.vowelTone_title, description: t.vowelTone_desc || t_en.vowelTone_desc, bgColor: 'bg-sky-100', textColor: 'text-sky-800', borderColor: 'hover:border-sky-300' },
        { id: 'pro_4', icon: '🎵', title: t.diphthongTone_title || t_en.diphthongTone_title, description: t.diphthongTone_desc || t_en.diphthongTone_desc, bgColor: 'bg-indigo-100', textColor: 'text-indigo-800', borderColor: 'hover:border-indigo-300' },
        { id: 'pro_5', icon: '🎼', title: t.cvTone_title || t_en.cvTone_title, description: t.cvTone_desc || t_en.cvTone_desc, bgColor: 'bg-violet-100', textColor: 'text-violet-800', borderColor: 'hover:border-violet-300' },
        { id: 'pro_6', icon: '🎹', title: t.cdTone_title || t_en.cdTone_title, description: t.cdTone_desc || t_en.cdTone_desc, bgColor: 'bg-purple-100', textColor: 'text-purple-800', borderColor: 'hover:border-purple-300' },
        { id: 'pro_7', icon: '🧩', title: t.vowelConsonant_title || t_en.vowelConsonant_title, description: t.vowelConsonant_desc || t_en.vowelConsonant_desc, bgColor: 'bg-rose-100', textColor: 'text-rose-800', borderColor: 'hover:border-rose-300' },
        { id: 'pro_8', icon: '🎲', title: t.diphthongConsonant_title || t_en.diphthongConsonant_title, description: t.diphthongConsonant_desc || t_en.diphthongConsonant_desc, bgColor: 'bg-amber-100', textColor: 'text-amber-800', borderColor: 'hover:border-amber-300' }
    ];
};

export const getVocabUnits = (language: Language) => {
    const t = translations[language].vocabUnits;
    const t_en = translations['en'].vocabUnits;
    return [
        { id: 'pronouns', icon: '👤', title: t.pronouns_title || t_en.pronouns_title, description: t.pronouns_desc || t_en.pronouns_desc, bgColor: 'bg-sky-50', textColor: 'text-sky-700', borderColor: 'hover:border-sky-200' },
        { id: 'family', icon: '👨‍👩‍👧‍👦', title: t.family_title || t_en.family_title, description: t.family_desc || t_en.family_desc, bgColor: 'bg-rose-50', textColor: 'text-rose-700', borderColor: 'hover:border-rose-200' },
        { id: 'tetHoliday', icon: '🧧', title: t.tetHoliday_title || t_en.tetHoliday_title, description: t.tetHoliday_desc || t_en.tetHoliday_desc, bgColor: 'bg-red-50', textColor: 'text-red-700', borderColor: 'hover:border-red-200' },
        { id: 'verb-news', icon: '📰', title: t.verbNews_title || t_en.verbNews_title, description: t.verbNews_desc || t_en.verbNews_desc, bgColor: 'bg-gray-50', textColor: 'text-gray-700', borderColor: 'hover:border-gray-200' },
        { id: 'question-word', icon: '❓', title: t.questionWord_title || t_en.questionWord_title, description: t.questionWord_desc || t_en.questionWord_desc, bgColor: 'bg-rose-50', textColor: 'text-rose-700', borderColor: 'hover:border-rose-200' },
        { id: 'adjectives-2', icon: '🎨', title: t.adjectives2_title || t_en.adjectives2_title, description: t.adjectives2_desc || t_en.adjectives2_desc, bgColor: 'bg-violet-100', textColor: 'text-violet-800', borderColor: 'hover:border-violet-300' },
        { id: 'numbers', icon: '🔢', title: t.numbers_title || t_en.numbers_title, description: t.numbers_desc || t_en.numbers_desc, bgColor: 'bg-lime-50', textColor: 'text-lime-700', borderColor: 'hover:border-lime-200' },
        { id: 'modal-verbs', icon: '💪', title: t.modalVerbs_title || t_en.modalVerbs_title, description: t.modalVerbs_desc || t_en.modalVerbs_desc, bgColor: 'bg-teal-50', textColor: 'text-teal-700', borderColor: 'hover:border-teal-200' },
        { id: 'time-phrases', icon: '⏰', title: t.timePhrases_title || t_en.timePhrases_title, description: t.timePhrases_desc || t_en.timePhrases_desc, bgColor: 'bg-cyan-50', textColor: 'text-cyan-700', borderColor: 'hover:border-cyan-200' },
        { id: 'conjunctions-2', icon: '✨', title: t.conjunctions2_title || t_en.conjunctions2_title, description: t.conjunctions2_desc || t_en.conjunctions2_desc, bgColor: 'bg-yellow-100', textColor: 'text-yellow-800', borderColor: 'hover:border-yellow-300' }
    ];
};

export const getSpeakingUnits = (language: Language) => {
    const t = translations[language].speakingUnits;
    const t_en = translations['en'].speakingUnits;

    return [
        { id: 'realLifeSituations', icon: '🛒', title: t.realLifeSituations_title || t_en.realLifeSituations_title, description: t.realLifeSituations_desc || t_en.realLifeSituations_desc, bgColor: 'bg-yellow-50', textColor: 'text-yellow-700', borderColor: 'hover:border-yellow-200' },
        { id: 'meetingFriends', icon: '🤝', title: t.meetingFriends_title || t_en.meetingFriends_title, description: t.meetingFriends_desc || t_en.meetingFriends_desc, bgColor: 'bg-cyan-50', textColor: 'text-cyan-700', borderColor: 'hover:border-cyan-200' },
        { id: 'family', icon: '👨‍👩‍👧‍👦', title: t.family_title || t_en.family_title, description: t.family_desc || t_en.family_desc, bgColor: 'bg-rose-50', textColor: 'text-rose-700', borderColor: 'hover:border-rose-200' },
        { id: 'job', icon: '💼', title: t.job_title || t_en.job_title, description: t.job_desc || t_en.job_desc, bgColor: 'bg-slate-50', textColor: 'text-slate-700', borderColor: 'hover:border-slate-200' },
        { id: 'studies', icon: '🎓', title: t.studies_title || t_en.studies_title, description: t.studies_desc || t_en.studies_desc, bgColor: 'bg-indigo-50', textColor: 'text-indigo-700', borderColor: 'hover:border-indigo-200' },
        { id: 'sports', icon: '🏋️‍♀️', title: t.sports_title || t_en.sports_title, description: t.sports_desc || t_en.sports_desc, bgColor: 'bg-emerald-50', textColor: 'text-emerald-700', borderColor: 'hover:border-emerald-200' },
        { id: 'food', icon: '🍔', title: t.food_title || t_en.food_title, description: t.food_desc || t_en.food_desc, bgColor: 'bg-amber-50', textColor: 'text-amber-700', borderColor: 'hover:border-amber-200' },
        { id: 'beach', icon: '🏖️', title: t.beach_title || t_en.beach_title, description: t.beach_desc || t_en.beach_desc, bgColor: 'bg-sky-50', textColor: 'text-sky-700', borderColor: 'hover:border-sky-200' },
        { id: 'ai', icon: '🤖', title: t.ai_title || t_en.ai_title, description: t.ai_desc || t_en.ai_desc, bgColor: 'bg-gray-50', textColor: 'text-gray-700', borderColor: 'hover:border-gray-200' },
        { id: 'traveling', icon: '✈️', title: t.traveling_title || t_en.traveling_title, description: t.traveling_desc || t_en.traveling_desc, bgColor: 'bg-blue-50', textColor: 'text-blue-700', borderColor: 'hover:border-blue-200' },
        { id: 'music', icon: '🎵', title: t.music_title || t_en.music_title, description: t.music_desc || t_en.music_desc, bgColor: 'bg-fuchsia-50', textColor: 'text-fuchsia-700', borderColor: 'hover:border-fuchsia-200' },
        { id: 'movies', icon: '🎬', title: t.movies_title || t_en.movies_title, description: t.movies_desc || t_en.movies_desc, bgColor: 'bg-red-50', textColor: 'text-red-700', borderColor: 'hover:border-red-200' },
        { id: 'social', icon: '🌐', title: t.social_title || t_en.social_title, description: t.social_desc || t_en.social_desc, bgColor: 'bg-violet-50', textColor: 'text-violet-700', borderColor: 'hover:border-violet-200' }
    ];
};

export const getAIFriends = (language: Language) => {
    const t = translations[language].aiFriendsData;
    const t_en = translations['en'].aiFriendsData;
    return [
      { 
        name: 'Lan', 
        avatarUrl: 'https://lh3.googleusercontent.com/d/13mqljSIRC9hvO-snymkzuUiV4Fypqcft', 
        description: t.lan_desc || t_en.lan_desc,
        style: t.lan_style || t_en.lan_style
      },
      { 
        name: 'Thu', 
        avatarUrl: 'https://lh3.googleusercontent.com/d/1aJFCfbbdfLmo0-c4NtNtHtFNWQiMXpLz', 
        description: t.thu_desc || t_en.thu_desc,
        style: t.thu_style || t_en.thu_style
      },
      { 
        name: 'Mai', 
        avatarUrl: 'https://lh3.googleusercontent.com/d/1l8eqtV6ISGB2-KTg0ysbPIflAIw6bN9D', 
        description: t.mai_desc || t_en.mai_desc,
        style: t.mai_style || t_en.mai_style
      }
    ];
};

export const LISTENING_UNITS = [
    {
        icon: '🗣️',
        title: 'Subject with contraction sound',
        description: 'Master common contractions like "I\'m," "you\'re," and "he\'s" to sound more natural.',
        bgColor: 'bg-sky-100',
        textColor: 'text-sky-800',
        borderColor: 'hover:border-sky-300'
    },
    {
        icon: '👅',
        title: '/θ/ and /ð/',
        description: 'Practice the tricky "th" sounds in words like "think" and "this" to improve clarity.',
        bgColor: 'bg-lime-100',
        textColor: 'text-lime-800',
        borderColor: 'hover:border-lime-300'
    },
    {
        icon: '🐍',
        title: '/s/ vs. /z/',
        description: 'Differentiate between the "s" and "z" sounds in words like "ice" and "eyes."',
        bgColor: 'bg-teal-100',
        textColor: 'text-teal-800',
        borderColor: 'hover:border-teal-300'
    },
    {
        icon: '📺',
        title: '/ʃ/, /ʒ/, /tʃ/, /dʒ/',
        description: 'Learn the sounds in "she," "vision," "chair," and "joy" for better pronunciation.',
        bgColor: 'bg-fuchsia-100',
        textColor: 'text-fuchsia-800',
        borderColor: 'hover:border-fuchsia-300'
    },
    {
        icon: '❄️',
        title: 'Consonant Clusters',
        description: 'Practice difficult consonant combinations like "str" and "spl" to speak more smoothly.',
        bgColor: 'bg-stone-200',
        textColor: 'text-stone-800',
        borderColor: 'hover:border-stone-400'
    },
    {
        icon: '🎶',
        title: 'Diphthongs',
        description: 'Master vowel glides like in "boy" and "out" to perfect your English accent.',
        bgColor: 'bg-red-100',
        textColor: 'text-red-800',
        borderColor: 'hover:border-red-300'
    }
];

export const GAME_UNITS = [
    {
        id: 'action-fun-verbs',
        icon: '🏃‍♂️',
        title: 'Action Fun! (Verbs)',
        description: 'Drag & drop common action verbs to match their pictures.',
        bgColor: 'bg-rose-50',
        textColor: 'text-rose-700',
        borderColor: 'hover:border-rose-200'
    },
    {
        id: 'adjectives-adventure',
        icon: '🎨',
        title: 'Adjectives Adventure',
        description: 'Learn adjectives by matching them to vibrant images.',
        bgColor: 'bg-violet-50',
        textColor: 'text-violet-700',
        borderColor: 'hover:border-violet-200'
    },
    {
        id: 'contraction-quest',
        icon: '🎧',
        title: 'Contraction Quest',
        description: 'A futuristic listening game to master English contractions.',
        bgColor: 'bg-sky-100',
        textColor: 'text-sky-800',
        borderColor: 'hover:border-sky-300'
    },
    {
        id: 'conversation-practice',
        icon: '💬',
        title: 'Conversation Practice',
        description: 'Practice real-life conversations about meeting new friends.',
        bgColor: 'bg-cyan-50',
        textColor: 'text-cyan-700',
        borderColor: 'hover:border-cyan-200'
    },
    {
        id: 'verb-game-2',
        icon: '🎮',
        title: 'Verb Vocabulary Game 2',
        description: 'A new challenge to expand your verb vocabulary with more examples.',
        bgColor: 'bg-emerald-50',
        textColor: 'text-emerald-700',
        borderColor: 'hover:border-emerald-200'
    },
    {
        id: 'pronoun-mastery',
        icon: '👤',
        title: 'Pronoun Mastery',
        description: 'Practice subject, object, and possessive pronouns through examples.',
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-700',
        borderColor: 'hover:border-blue-200'
    }
];

export const PEACE_FLOW = getMethodologySteps;

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { StorySection } from './components/StorySection';
import { LearningSections } from './components/LearningSections';
import { FeedbackSection } from './components/FeedbackSection';
import { Footer } from './components/Footer';
import { GrammarPage } from './components/GrammarPage';
import { LessonPage } from './components/LessonPage';
import { SpeakingPage, SpeakingUnit } from './components/SpeakingPage';
import { SpeakingLessonPage } from './components/SpeakingLessonPage';
import { PronunciationPage, PronunciationUnit } from './components/PronunciationPage';
import { PronunciationLessonPage } from './components/PronunciationLessonPage';
import { VocabularyPage, VocabUnit } from './components/VocabularyPage';
import { VocabLessonPage } from './components/VocabLessonPage';
import { SpeakingChallengeGame } from './components/SpeakingChallengeGamePage';
import { MakeQuestionGamePage } from './components/MakeQuestionGamePage';
import { RealLifeSituationsPage } from './components/RealLifeSituationsPage';
import { RealLifeSubLessonPage } from './components/RealLifeSubLessonPage';
import { RealLifeSpeakingGamePage } from './components/RealLifeSpeakingGamePage';
import { RealLifeAIChatPage } from './components/RealLifeAIChatPage';
import { AIFriendsPage } from './games/GameAIFriends';
import { GameAIFriendDetail } from './games/GameAIFriendDetail';
import { AuthModal } from './components/AuthModal';
import type { AIFriend } from './types';
import { X, Gift, Copy } from 'lucide-react';

export type ViewType = 'home' | 'grammar' | 'grammar-level' | 'lesson' | 'speaking' | 'speaking-lesson' | 'pronunciation' | 'pronunciation-lesson' | 'vocabulary' | 'vocabulary-lesson' | 'speaking-challenge-game' | 'make-question-game' | 'ai-friends' | 'ai-friend-detail' | 'real-life-speaking-game' | 'real-life-ai-chat';
export type Language = 'en' | 'ru';
export type AuthMode = 'signin' | 'signup';

const SCRIPT_URL_CREDIT = 'https://script.google.com/macros/s/AKfycbzfPwTDzc5SJoftFcYo6OZk8w-GvLcF2EpFvPQk3HoYn-VU3Ey5Les6UC0EPfWqxv3c/exec';

// --- DANH SÁCH BÀI HỌC MỞ CHO GUEST (WHITELIST) ---
const OPEN_LESSON_IDS = [
  'GameTetWishes', 'Vietnameseverb2',        // Vocabulary
  'GrammarASA',                              // Grammar
  'GameSpeakingMeetingFriends', 'GameSpeakAISmoothie', // Speaking
  'Pronunciationtrainer1'                    // Pronunciation
];

const CreditModal: React.FC<{ isOpen: boolean; onClose: () => void; onSignUp: () => void; isGuest: boolean; }> = ({ isOpen, onClose, onSignUp, isGuest }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    const userEmail = localStorage.getItem('userEmail');
    if (userEmail) {
      const inviteLink = `${window.location.origin}?ref=${userEmail}`;
      navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[999999] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center relative shadow-xl border-4 border-yellow-300">
        <button onClick={onClose} className="absolute top-3 right-3 p-2 text-slate-400 hover:text-slate-700 transition-colors"><X size={20} /></button>
        <div className="text-yellow-500 mb-4"><Gift size={48} /></div>
        <h2 className="text-2xl font-bold text-slate-800 mb-3">Out of Credit!</h2>
        {isGuest ? (
          <>
            <p className="text-slate-500 mb-6">You have used up your 300s trial. Sign up now to get 600s daily!</p>
            <button onClick={onSignUp} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold">Sign Up Free</button>
          </>
        ) : (
          <>
            <p className="text-slate-500 mb-6">Your 600s daily credit is over. Invite a friend to get a 1200s bonus for both!</p>
            <button onClick={handleCopyLink} className="w-full bg-green-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2">
              <Copy size={16} /> {copied ? 'Copied!' : 'Copy Invite Link'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [view, setView] = useState<ViewType>('home');
  const [language, setLanguage] = useState<Language>(() => (localStorage.getItem('app_lang') as Language) || 'en');
  const [authModal, setAuthModal] = useState({ isOpen: false, mode: 'signin' as AuthMode });
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<{ id: string; name: string; fullName: string; videoUrl: string; thumbnailUrl?: string } | null>(null);
  const [selectedSpeakingUnit, setSelectedSpeakingUnit] = useState<SpeakingUnit | null>(null);
  const [selectedPronunciationUnit, setSelectedPronunciationUnit] = useState<PronunciationUnit | null>(null);
  const [selectedVocabUnit, setSelectedVocabUnit] = useState<VocabUnit | null>(null);
  const [selectedAIFriend, setSelectedAIFriend] = useState<AIFriend | null>(null);
  const [selectedAITopic, setSelectedAITopic] = useState<string | null>(null);
  const [scrollToAnchor, setScrollToAnchor] = useState<string | null>(null);
  const [user, setUser] = useState<{name: string} | null>(null);

  const [credit, setCredit] = useState<number>(300);
  const [isGuest, setIsGuest] = useState(true);
  const [isCreditModalOpen, setIsCreditModalOpen] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const referrerEmail = urlParams.get('ref');
    if (referrerEmail) {
      sessionStorage.setItem('pending_referrer', referrerEmail);
    }
  }, []);

  const syncCreditToBackend = useCallback(() => {
    if (isGuest) return;
    const email = localStorage.getItem('userEmail');
    const currentCredit = localStorage.getItem('user_credit');
    if (email && currentCredit !== null) {
        const params = new URLSearchParams();
        params.append('action', 'updateCredit');
        params.append('email', email);
        params.append('credit', currentCredit);
        navigator.sendBeacon(SCRIPT_URL_CREDIT, params);
    }
  }, [isGuest]);

  const initializeState = useCallback(() => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const storedUser = localStorage.getItem('user');
    setUser(storedUser ? JSON.parse(storedUser) : null);
    setIsGuest(!loggedIn);

    if (loggedIn) {
        const userCredit = localStorage.getItem('user_credit');
        setCredit(userCredit ? parseInt(userCredit, 10) : 1200);
    } else {
        let guestCredit = localStorage.getItem('guest_credit');
        if (guestCredit === null) {
            guestCredit = '300';
            localStorage.setItem('guest_credit', guestCredit);
        }
        setCredit(parseInt(guestCredit, 10));
    }
  }, []);

  useEffect(() => {
    initializeState();
    window.addEventListener('authSuccess', initializeState);
    const handleLogout = () => {
        syncCreditToBackend();
        localStorage.removeItem('user');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('user_credit');
        localStorage.setItem('isLoggedIn', 'false');
        initializeState();
    };
    window.addEventListener('logout', handleLogout);

    return () => {
        window.removeEventListener('authSuccess', initializeState);
        window.removeEventListener('logout', handleLogout);
    };
  }, [initializeState, syncCreditToBackend]);

  const handleSetCredit = useCallback((updater: (prevCredit: number) => number) => {
    setCredit(prevCredit => {
      const newCredit = updater(prevCredit);
      const sanitizedCredit = Math.max(0, newCredit);
      const key = isGuest ? 'guest_credit' : 'user_credit';
      localStorage.setItem(key, String(sanitizedCredit));
      return sanitizedCredit;
    });
  }, [isGuest]);

  useEffect(() => {
    if (credit <= 0) {
      setIsCreditModalOpen(true);
    }
  }, [credit]);

  useEffect(() => {
    window.addEventListener('beforeunload', syncCreditToBackend);
    return () => window.removeEventListener('beforeunload', syncCreditToBackend);
  }, [syncCreditToBackend]);

  useEffect(() => {
    localStorage.setItem('app_lang', language);
    window.dispatchEvent(new Event('languageChanged'));
  }, [language]);

  const handleOpenAuthModal = (mode: AuthMode) => { setAuthModal({ isOpen: true, mode }); };
  const handleCloseAuthModal = () => { setAuthModal({ isOpen: false, mode: 'signin' }); };
  const handleSwitchAuthMode = (newMode: AuthMode) => { setAuthModal({ isOpen: true, mode: newMode }); };

  // --- HÀM ĐIỀU HƯỚNG CẬP NHẬT (FIX LỖI BLOCKED GUEST) ---
  const navigateTo = (newView: ViewType, data?: any) => {
    const protectedViews: ViewType[] = [
      'grammar-level', 'lesson', 'speaking-lesson', 'pronunciation-lesson', 
      'vocabulary-lesson', 'speaking-challenge-game', 'make-question-game', 
      'ai-friends', 'ai-friend-detail', 'real-life-speaking-game', 'real-life-ai-chat'
    ];

    // Lấy ID bài học/game từ payload
    const targetId = data?.id || (typeof data === 'string' ? data : null);

    if (isGuest && protectedViews.includes(newView)) {
      // Kiểm tra xem ID có nằm trong Whitelist bài mở không
      const isFreeLesson = OPEN_LESSON_IDS.some(id => targetId?.includes(id) || id === targetId);

      if (!isFreeLesson) {
        handleOpenAuthModal('signup');
        return;
      }
    }

    const premiumViews: ViewType[] = ['ai-friend-detail', 'real-life-ai-chat'];
    if (premiumViews.includes(view) && !premiumViews.includes(newView)) {
        syncCreditToBackend();
    }

    setScrollToAnchor(null);
    let payload = data;
    if (data?.anchorId) {
        setScrollToAnchor(data.anchorId);
        payload = data.unit || data.topic || data;
    }

    setView(newView);
    if (newView === 'grammar-level') setSelectedLevel(payload);
    if (newView === 'lesson') setSelectedTopic(payload);
    if (newView === 'speaking-lesson') setSelectedSpeakingUnit(payload);
    if (newView === 'pronunciation-lesson') setSelectedPronunciationUnit(payload);
    if (newView === 'vocabulary-lesson') setSelectedVocabUnit(payload);
    if (newView === 'ai-friend-detail') {
        setSelectedAIFriend(payload.character || payload);
        setSelectedAITopic(payload.topic || null);
    }
    if (['speaking-challenge-game', 'make-question-game', 'real-life-speaking-game'].includes(newView)) {
        setSelectedSpeakingUnit(payload);
    }
    if (newView === 'real-life-ai-chat') {
        setSelectedSpeakingUnit(payload.unit);
        setSelectedAIFriend(payload.character);
    }
    window.scrollTo(0, 0);
  };
  
  const resetToHome = () => {
    setView('home');
    setSelectedLevel(null); setSelectedTopic(null); setSelectedSpeakingUnit(null);
    setSelectedPronunciationUnit(null); setSelectedVocabUnit(null);
    setSelectedAIFriend(null); setSelectedAITopic(null);
  };

  const renderContent = () => {
    const aiProps = { credit, setCredit: handleSetCredit };
    const realLifeSubUnitIds = ['buySmoothie', 'buyFruits', 'buyVeggies', 'buyMeat', 'atRestaurant'];
    
    switch (view) {
      case 'home':
        return (
          <>
            <Hero language={language} onOpenAuthModal={handleOpenAuthModal} />
            <StorySection language={language} />
            <LearningSections
              language={language}
              onGrammarClick={() => navigateTo('grammar')}
              onSpeakingClick={() => navigateTo('speaking')}
              onPronunciationClick={() => navigateTo('pronunciation')}
              onVocabularyClick={() => navigateTo('vocabulary')}
            />
            <FeedbackSection language={language} />
          </>
        );
      case 'speaking-lesson':
        if (selectedSpeakingUnit?.id === 'realLifeSituations') return <RealLifeSituationsPage onBack={() => navigateTo('speaking')} onNavigate={navigateTo} language={language} isGuest={isGuest} onOpenAuthModal={() => handleOpenAuthModal('signup')} />;
        if (realLifeSubUnitIds.includes(selectedSpeakingUnit?.id || '')) return <RealLifeSubLessonPage unit={selectedSpeakingUnit!} onBack={() => navigateTo('speaking-lesson', { id: 'realLifeSituations' })} onNavigate={navigateTo} language={language} />;
        return selectedSpeakingUnit && <SpeakingLessonPage unit={selectedSpeakingUnit} onBack={() => navigateTo('speaking')} onNavigate={navigateTo} scrollToAnchor={scrollToAnchor} onAnchorScrolled={() => setScrollToAnchor(null)} language={language} />;
      
      case 'ai-friend-detail':
        return selectedAIFriend && <GameAIFriendDetail character={selectedAIFriend} topic={selectedAITopic} onBack={() => navigateTo('ai-friends')} onNavigate={navigateTo} language={language} {...aiProps} />;
      
      case 'real-life-ai-chat':
        return selectedSpeakingUnit && selectedAIFriend && <RealLifeAIChatPage unit={selectedSpeakingUnit} character={selectedAIFriend} onBack={() => navigateTo('speaking-lesson', selectedSpeakingUnit)} language={language} {...aiProps} />;

      case 'grammar': return <GrammarPage language={language} focusedLevel={null} onNavigateBack={resetToHome} onSelectLevel={(level) => navigateTo('grammar-level', level)} onSelectTopic={(topic) => navigateTo('lesson', topic)} isGuest={isGuest} onOpenAuthModal={() => handleOpenAuthModal('signup')} />;
      case 'grammar-level': return selectedLevel && <GrammarPage language={language} focusedLevel={selectedLevel} onNavigateBack={() => navigateTo('grammar')} onSelectLevel={(level) => navigateTo('grammar-level', level)} onSelectTopic={(topic) => navigateTo('lesson', topic)} isGuest={isGuest} onOpenAuthModal={() => handleOpenAuthModal('signup')} />;
      case 'vocabulary': return <VocabularyPage language={language} onBack={resetToHome} onSelectUnit={(unit) => navigateTo('vocabulary-lesson', unit)} isGuest={isGuest} onOpenAuthModal={() => handleOpenAuthModal('signup')} />;
      case 'vocabulary-lesson': return selectedVocabUnit && <VocabLessonPage unit={selectedVocabUnit} onBack={() => navigateTo('vocabulary')} language={language} onLanguageChange={setLanguage} onNavigate={navigateTo} scrollToAnchor={scrollToAnchor} onAnchorScrolled={() => setScrollToAnchor(null)} />;
      case 'speaking': return <SpeakingPage language={language} onBack={resetToHome} onSelectUnit={(unit) => navigateTo('speaking-lesson', unit)} isGuest={isGuest} onOpenAuthModal={() => handleOpenAuthModal('signup')} />;
      case 'speaking-challenge-game': return selectedSpeakingUnit && <SpeakingChallengeGame unit={selectedSpeakingUnit} onBack={() => navigateTo('speaking-lesson', selectedSpeakingUnit)} />;
      case 'make-question-game': return selectedSpeakingUnit && <MakeQuestionGamePage unit={selectedSpeakingUnit} onBack={() => navigateTo('speaking-lesson', selectedSpeakingUnit)} language={language} />;
      case 'pronunciation': return <PronunciationPage language={language} onBack={resetToHome} onSelectUnit={(unit) => navigateTo('pronunciation-lesson', unit)} isGuest={isGuest} onOpenAuthModal={() => handleOpenAuthModal('signup')} />;
      case 'pronunciation-lesson': return selectedPronunciationUnit && <PronunciationLessonPage unit={selectedPronunciationUnit} onBack={() => navigateTo('pronunciation')} scrollToAnchor={scrollToAnchor} onAnchorScrolled={() => setScrollToAnchor(null)} language={language} />;
      case 'lesson': return selectedTopic && <LessonPage topic={selectedTopic} onBack={() => navigateTo('grammar-level', selectedLevel || 'A1')} scrollToAnchor={scrollToAnchor} onAnchorScrolled={() => setScrollToAnchor(null)} language={language} />;
      case 'ai-friends': return <AIFriendsPage onBack={resetToHome} onSelectFriend={(friend) => navigateTo('ai-friend-detail', friend)} language={language} isGuest={isGuest} onOpenAuthModal={() => handleOpenAuthModal('signup')} />;
      case 'real-life-speaking-game': return selectedSpeakingUnit && <RealLifeSpeakingGamePage unit={selectedSpeakingUnit} onBack={() => navigateTo('speaking-lesson', selectedSpeakingUnit)} language={language} />;
      default: return <Hero language={language} onOpenAuthModal={handleOpenAuthModal} />;
    }
  };

  return (
    <div className="min-h-screen bg-white selection:bg-[#ff8a65] selection:text-white">
      <Header 
        onNavigate={navigateTo}
        onOpenAuthModal={handleOpenAuthModal}
        currentView={view} 
        language={language}
        onLanguageChange={setLanguage}
        credit={credit}
        isGuest={isGuest}
        user={user}
      />
      <main>
        {renderContent()}
      </main>
      <Footer language={language} />
      {authModal.isOpen && (
        <AuthModal
          isOpen={authModal.isOpen}
          mode={authModal.mode}
          onClose={handleCloseAuthModal}
          onSwitchMode={handleSwitchAuthMode}
        />
      )}
      <CreditModal 
        isOpen={isCreditModalOpen}
        onClose={() => setIsCreditModalOpen(false)}
        onSignUp={() => { setIsCreditModalOpen(false); handleOpenAuthModal('signup'); }}
        isGuest={isGuest}
      />
    </div>
  );
};

export default App;

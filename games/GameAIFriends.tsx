
import React from 'react';
import type { AIFriend } from '../types';
import { Language, ViewType } from '../App';
import { translations } from '../translations';
import { getAIFriends } from '../constants';
import { Lock } from 'lucide-react';

// Reusing the styling logic for consistency
const getFriendCardClass = (name: string) => {
    switch (name) {
      case 'Lan':
        return 'bg-blue-100 border-blue-200';
      case 'Thu':
        return 'bg-emerald-100 border-emerald-200';
      case 'Mai':
        return 'bg-orange-100 border-orange-200';
      default:
        return 'bg-white border-slate-100';
    }
};

interface AIFriendsPageProps {
  onBack: () => void;
  onSelectFriend: (friend: AIFriend) => void;
  language: Language;
  isGuest: boolean;
  onOpenAuthModal: () => void;
}

export const AIFriendsPage: React.FC<AIFriendsPageProps> = ({ onBack, onSelectFriend, language, isGuest, onOpenAuthModal }) => {
  const t = translations[language];
  const aiFriends = getAIFriends(language);
  const isPremium = (friendName: string) => friendName !== 'Lan';

  return (
    <div className="pt-24 md:pt-32 pb-32 bg-white min-h-screen">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-[13px] text-slate-400 mb-12 uppercase tracking-widest font-bold">
          <span className="hover:text-[#1e5aa0] cursor-pointer transition-colors" onClick={onBack}>{t.pages.home}</span>
          <span className="text-slate-300">/</span>
          <span className="hover:text-[#1e5aa0] cursor-pointer transition-colors" onClick={onBack}>{t.pages.learn}</span>
          <span className="text-slate-300">/</span>
          <span className="text-slate-800">{t.pages.aiFriends}</span>
        </nav>

        {/* Page Title */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
            <h1 className="text-[40px] md:text-[56px] font-black text-[#1e293b] leading-[1.1] tracking-tight mb-6">
                {t.aiFriendsPage.title}
            </h1>
            <p className="text-lg text-slate-500 mt-4 max-w-2xl mx-auto">{t.aiFriendsPage.subtitle}</p>
        </div>
        
        {/* AI Friends Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {aiFriends.map(friend => {
            const locked = isGuest && isPremium(friend.name);
            return (
                <div 
                    key={friend.name} 
                    onClick={() => locked ? onOpenAuthModal() : onSelectFriend(friend)}
                    className={`relative p-6 rounded-3xl border flex flex-col items-center text-center shadow-sm transition-all duration-300 ${getFriendCardClass(friend.name)} ${locked ? 'cursor-pointer' : 'hover:shadow-xl hover:-translate-y-1 group'}`}
                >
                    <img src={friend.avatarUrl} alt={friend.name} className="w-24 h-24 rounded-full mb-4 shadow-md object-cover" />
                    <h4 className="text-xl font-bold text-slate-800">{friend.name}</h4>
                    <p className="text-sm text-slate-500 mt-2 flex-grow">{friend.description}</p>
                    <p className="text-xs font-semibold text-slate-400 italic mt-2 mb-6">{t.aiFriendsPage.styleLabel} {friend.style}</p>
                    <button 
                        disabled={locked}
                        className="w-full bg-white text-slate-700 px-6 py-3 rounded-full font-bold text-sm border border-slate-200 transition-all group-hover:bg-slate-50 group-hover:shadow-md disabled:opacity-50"
                    >
                        {t.aiFriendsPage.startConversation}
                    </button>
                    {locked && (
                        <div className="absolute inset-0 bg-slate-200/60 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center text-center p-4">
                            <Lock size={24} className="text-slate-500 mb-2" />
                            <p className="font-bold text-slate-600 text-xs text-center">Sign up to play this game</p>
                        </div>
                    )}
                </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { SpeakingUnit } from './SpeakingPage';

interface SpeakingChallengeGameProps {
    unit: SpeakingUnit;
    onBack: () => void;
}

export const SpeakingChallengeGame: React.FC<SpeakingChallengeGameProps> = ({ unit, onBack }) => {
    // Placeholder for other lessons
    return (
        <div className="fixed inset-0 bg-white z-[100] p-4 sm:p-6 md:p-8 flex flex-col">
            <nav className="flex items-center justify-between mb-8 flex-shrink-0">
                <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-bold">
                    <svg width="18" height="18" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                    <span>Back to Lesson</span>
                </button>
            </nav>
            <div className="flex flex-col items-center justify-start flex-grow text-center">
                <h1 className="text-3xl md:text-5xl font-black text-slate-800 uppercase tracking-wider mb-10">
                    Practise Speaking Challenge
                </h1>
                <div className="w-full max-w-4xl h-[60vh] bg-slate-800 rounded-3xl border-4 border-slate-700 shadow-2xl flex items-center justify-center p-8">
                    <p className="text-2xl font-bold text-slate-500">
                        A unique challenge for "{unit.title}" is coming soon.
                    </p>
                </div>
            </div>
        </div>
    );
};

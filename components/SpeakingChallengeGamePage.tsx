
import React, { useEffect, useRef, useState } from 'react';
import { SpeakingUnit } from './SpeakingPage';
import { Maximize, Minimize } from 'lucide-react';
import { GameSpeakingMeetingFriends } from '../games/GameSpeakingMeetingFriends';
import { GameSpeakingFamily } from '../games/GameSpeakingFamily';
import { GameSpeakingJob } from '../games/GameSpeakingJob';
import { GameSpeakingStudies } from '../games/GameSpeakingStudies';
import { GameSpeakingSports } from '../games/GameSpeakingSports';
import { SpeakChallengeBeachGame } from '../games/speakchallengebeachgame';
import { GameSpeakingAI } from '../games/GameSpeakingAI';
import { GameSpeakingTraveling } from '../games/GameSpeakingTraveling';
import { GameSpeakingMusic } from '../games/GameSpeakingMusic';
import { GameSpeakingMovies } from '../games/GameSpeakingMovies';
import { GameSpeakingFood } from '../games/GameSpeakingFood';
import { GameSpeakingSocial } from '../games/GameSpeakingSocial';

const PlaceholderGame: React.FC<{ unit: SpeakingUnit }> = ({ unit }) => (
    <div className="w-full h-full flex items-center justify-center bg-slate-800 text-white p-8 rounded-2xl">
        <p className="text-center font-semibold text-slate-400">
            A unique speaking challenge for "{unit.title}" is coming soon.
        </p>
    </div>
);

export const SpeakingChallengeGame: React.FC<{ unit: SpeakingUnit; onBack: () => void; }> = ({ unit, onBack }) => {
    const gameWrapperRef = useRef<HTMLDivElement>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        const startTime = performance.now();
        const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxzrjpM8XAN2ktEW19NS87T_x5NlYNYjWt9srSu5XHfTw9IV_mCzrkWhPP8C1EBPC7Y/exec';

        return () => {
            const duration = Math.round((performance.now() - startTime) / 1000);
            if (duration > 5) { // Log only if session is longer than 5 seconds
                const email = localStorage.getItem('userEmail');
                if (email) { // Only log if user is logged in
                    const params = new URLSearchParams();
                    params.append('action', 'logGame');
                    params.append('email', email);
                    params.append('section', 'Speaking');
                    params.append('gameName', `Speak Challenge: ${unit.title}`);
                    params.append('duration', `${duration}s`);
                    
                    navigator.sendBeacon(SCRIPT_URL, params);
                }
            }
        };
    }, [unit.title]);

    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);

    useEffect(() => {
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const toggleFullscreen = () => {
        const elem = gameWrapperRef.current;
        if (elem) {
            if (!document.fullscreenElement) {
                elem.requestFullscreen().catch(err => console.error(`Fullscreen error: ${err.message}`));
            } else {
                document.exitFullscreen();
            }
        }
    };

    const renderGame = () => {
        switch (unit.id) {
            case 'meetingFriends': return <GameSpeakingMeetingFriends />;
            case 'family': return <GameSpeakingFamily />;
            case 'job': return <GameSpeakingJob />;
            case 'studies': return <GameSpeakingStudies />;
            case 'sports': return <GameSpeakingSports />;
            case 'beach': return <SpeakChallengeBeachGame />;
            case 'ai': return <GameSpeakingAI />;
            case 'traveling': return <GameSpeakingTraveling />;
            case 'music': return <GameSpeakingMusic />;
            case 'movies': return <GameSpeakingMovies />;
            case 'food': return <GameSpeakingFood />;
            case 'social': return <GameSpeakingSocial />;
            default:
                return <PlaceholderGame unit={unit} />;
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-50 z-[100] p-4 sm:p-6 md:p-8 flex flex-col font-sans">
            <nav className="flex items-center justify-between mb-6 flex-shrink-0">
                <div className="flex items-center gap-2 text-sm text-slate-400 font-bold uppercase tracking-wider">
                    <span className="cursor-pointer hover:text-slate-600" onClick={onBack}>Speaking</span>
                    <span>/</span>
                    <span className="text-slate-600">{unit.title}</span>
                </div>
                <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-bold">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                    <span>Back to Lesson</span>
                </button>
            </nav>

            <div className="text-center mb-8">
                <h1 className="text-3xl md:text-5xl font-black text-slate-800 uppercase tracking-wider">
                    Speaking Challenge
                </h1>
            </div>

            <div ref={gameWrapperRef} className="w-full flex-grow max-w-5xl mx-auto aspect-[9/16] md:aspect-video relative overflow-hidden rounded-2xl shadow-2xl border-4 border-slate-200 bg-slate-900">
                {renderGame()}
                <button 
                    onClick={toggleFullscreen}
                    title="Toggle Fullscreen"
                    className="absolute bottom-3 right-3 z-[999] p-2 bg-black/30 text-white/70 rounded-full backdrop-blur-sm shadow-md hover:bg-black/50 transition-all duration-300"
                >
                    {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
                </button>
            </div>
        </div>
    );
};

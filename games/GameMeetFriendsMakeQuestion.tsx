
import React, { useEffect, useRef, useState } from 'react';
import { Maximize, Minimize } from 'lucide-react';

export const GameMeetFriendsMakeQuestion: React.FC = () => {
    const gameRootRef = useRef<HTMLDivElement>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const handleFullscreenChange = () => {
        setIsFullscreen(!!document.fullscreenElement);
    };

    useEffect(() => {
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const handleFullscreen = () => {
        const elem = gameRootRef.current;
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
        <div id="meet-friends-speak-root" ref={gameRootRef} className="relative w-full h-full rounded-3xl shadow-2xl overflow-hidden border border-slate-200 bg-slate-800 flex items-center justify-center text-white p-8">
            <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">Game Container</h2>
                <p className="text-slate-400">Một game mới sẽ được đặt ở đây trong thời gian sớm nhất.</p>
            </div>
            <button onClick={handleFullscreen} title="Toggle Fullscreen" className="absolute bottom-4 right-4 bg-black/30 text-white/70 p-2 rounded-full backdrop-blur-sm hover:bg-black/50 transition-colors z-[400]">
                {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
            </button>
        </div>
    );
};

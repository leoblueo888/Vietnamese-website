import React from 'react';

export const SpeakingGame: React.FC = () => {
    return (
        <div className="w-full h-full flex items-center justify-center bg-slate-800 text-white p-8">
            <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">Speaking Challenge</h2>
                <p className="text-slate-400">This game is temporarily unavailable due to an error.</p>
            </div>
        </div>
    );
};

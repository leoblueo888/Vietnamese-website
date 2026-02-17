
import React from 'react';
import { LISTENING_UNITS } from '../constants';

export interface ListeningUnit {
    icon: string;
    title: string;
    description: string;
    bgColor: string;
    textColor: string;
    borderColor: string;
}

interface ListeningCardProps {
  unit: ListeningUnit;
  onClick: () => void;
}

const ListeningCard: React.FC<ListeningCardProps> = ({ unit, onClick }) => {
    return (
        <div 
            onClick={onClick}
            className={`p-8 rounded-3xl flex flex-col transition-all duration-300 border border-transparent cursor-pointer ${unit.bgColor} ${unit.borderColor}`}
        >
            <div className="text-3xl mb-4 opacity-80">{unit.icon}</div>
            <h3 className="text-[24px] font-black text-slate-800 mb-3">{unit.title}</h3>
            <p className="text-slate-500 text-[15px] leading-relaxed mb-6 flex-grow">{unit.description}</p>
            <button className={`font-bold text-[15px] flex items-center gap-2 self-start ${unit.textColor}`}>
                Start Lesson <span>→</span>
            </button>
        </div>
    );
};

interface ListeningPageProps {
  onBack: () => void;
  onSelectUnit: (unit: ListeningUnit) => void;
}

export const ListeningPage: React.FC<ListeningPageProps> = ({ onBack, onSelectUnit }) => {
    return (
        <div className="pt-24 md:pt-32 pb-32 bg-white min-h-screen">
            <div className="max-w-[1200px] mx-auto px-6">
                {/* Breadcrumbs */}
                <nav className="flex items-center gap-2 text-[13px] text-slate-400 mb-12 uppercase tracking-widest font-bold">
                  <span className="hover:text-[#1e5aa0] cursor-pointer transition-colors" onClick={onBack}>Home</span>
                  <span className="text-slate-300">/</span>
                  <span className="hover:text-[#1e5aa0] cursor-pointer transition-colors" onClick={onBack}>Learn</span>
                  <span className="text-slate-300">/</span>
                  <span className="text-slate-800">Listening</span>
                </nav>

                {/* Page Title */}
                <div className="text-center mb-16 max-w-3xl mx-auto">
                    <h1 className="text-[40px] md:text-[56px] font-black text-[#1e293b] leading-[1.1] tracking-tight mb-6">
                        Master Vietnamese Pronunciation
                    </h1>
                    <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
                        Tune your ear to the sounds of Vietnamese with targeted exercises for tricky phonetics and natural speech patterns.
                    </p>
                </div>
                
                {/* Units Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {LISTENING_UNITS.map(unit => (
                        <ListeningCard key={unit.title} unit={unit} onClick={() => onSelectUnit(unit)} />
                    ))}
                </div>
            </div>
        </div>
    );
};
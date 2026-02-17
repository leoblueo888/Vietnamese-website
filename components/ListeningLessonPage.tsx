import React, { useState, useEffect } from 'react';
import { ListeningUnit } from './ListeningPage';
import { GoogleGenAI } from '@google/genai';
import { ContractionQuestGame } from './ContractionQuestGame';

interface ListeningLessonPageProps {
  unit: ListeningUnit;
  onBack: () => void;
  scrollToAnchor?: string | null;
  onAnchorScrolled?: () => void;
}

export const ListeningLessonPage: React.FC<ListeningLessonPageProps> = ({ unit, onBack, scrollToAnchor, onAnchorScrolled }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([
    { role: 'ai', text: `Hi! I'm your AI tutor. Let's practice the "${unit.title}" sounds!` }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  useEffect(() => {
    if (scrollToAnchor) {
        const element = document.getElementById(scrollToAnchor);
        if (element) {
            setTimeout(() => {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                if (onAnchorScrolled) onAnchorScrolled();
            }, 100);
        } else if (onAnchorScrolled) {
            onAnchorScrolled();
        }
    }
  }, [scrollToAnchor, onAnchorScrolled]);

  const handleSendMessage = async (text?: string) => {
    const messageText = text || inputValue;
    if (!messageText.trim()) return;
    setMessages(prev => [...prev, { role: 'user', text: messageText }]);
    setInputValue('');
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Topic: English Pronunciation - ${unit.title}. User Question: ${messageText}`,
        config: { systemInstruction: `You are an expert English pronunciation tutor. Help the user with the sounds related to ${unit.title}. Keep answers concise, friendly, and accurate.` }
      });
      setMessages(prev => [...prev, { role: 'ai', text: response.text || "Sorry, I couldn't process that." }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: "Error connecting to AI tutor." }]);
    }
  };

  return (
    <div className="pt-24 md:pt-32 pb-32 bg-white min-h-screen">
      <div className="max-w-[1000px] mx-auto px-6">
        <nav className="flex items-center gap-2 text-[12px] md:text-[13px] text-slate-400 mb-12 uppercase tracking-widest font-bold">
          <span className="hover:text-[#1e5aa0] cursor-pointer transition-colors" onClick={onBack}>Listening</span>
          <span className="text-slate-300">/</span>
          <span className="text-slate-800">{unit.title}</span>
        </nav>
        <div className="mb-12">
          <h1 className="text-[32px] md:text-[56px] font-black text-[#1e293b] leading-tight tracking-tight">{unit.title}</h1>
        </div>

        {/* AI Chat Box Section */}
        <div className={`mb-20 transition-all duration-500 ease-in-out ${isExpanded ? 'scale-[1.02]' : 'scale-100'}`}>
          <div className={`bg-[#f8fafc] rounded-[2.5rem] border border-slate-100 flex flex-col shadow-sm transition-all duration-500 overflow-hidden ${isExpanded ? 'min-h-[600px]' : 'min-h-[400px]'}`}>
            <div className="px-6 py-6 bg-white border-b border-slate-50">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setIsRecording(!isRecording)}
                  className={`w-14 h-14 md:w-16 md:h-16 flex-shrink-0 rounded-full flex items-center justify-center transition-all shadow-lg ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-[#ff8a65]'} hover:scale-105 active:scale-95`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 md:h-8 md:w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </button>
                <div className="flex-1 flex items-center bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 transition-all shadow-inner">
                  <input 
                    type="text" 
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Ask your AI tutor a question..."
                    className="flex-1 outline-none text-slate-700 bg-transparent font-medium"
                  />
                  <button onClick={() => handleSendMessage()} className="p-2 text-[#1e5aa0]">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            <div className={`flex-1 overflow-y-auto p-8 space-y-4 custom-scrollbar transition-all duration-500 ${isExpanded ? 'max-h-[500px]' : 'max-h-[250px]'}`}>
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-6 py-3.5 rounded-2xl font-medium shadow-sm ${msg.role === 'user' ? 'bg-[#1e5aa0] text-white rounded-tr-none' : 'bg-white text-slate-700 border border-slate-50 rounded-tl-none'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              <div />
            </div>
            <div className="bg-white flex justify-center py-4 border-t border-slate-50">
              <button onClick={() => setIsExpanded(!isExpanded)} className="flex items-center gap-2 px-6 py-2 rounded-full text-slate-400">
                <span className="text-[11px] font-black uppercase tracking-widest">{isExpanded ? 'Show less' : 'View more history'}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform duration-500 ${isExpanded ? 'rotate-180' : 'rotate-0'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
            </div>
          </div>
        </div>

        {/* Practice Game Section */}
        <div id="game-practice-section" className="pt-16 border-t border-slate-100">
          <div className="text-center mb-12">
             <h2 className="text-4xl md:text-5xl font-black text-[#1e293b] leading-tight tracking-tight">Practice Listening</h2>
             <p className="text-lg text-slate-500 mt-4 max-w-2xl mx-auto">Interactive exercises to help you master the "{unit.title}" sounds.</p>
          </div>
           {unit.title === 'Subject with contraction sound' ? (
              <div className="bg-[#0a0b1e] rounded-[3rem] p-4 flex justify-center items-center min-h-[720px]">
                <ContractionQuestGame />
              </div>
            ) : (
             <div className="bg-[#0f172a] rounded-[3rem] min-h-[500px] p-8 text-center flex flex-col items-center justify-center">
              <h3 className="text-4xl font-black text-white mb-6">Practice Game</h3>
              <p className="text-slate-300 mb-8 max-w-md">An interactive game to practice your listening skills will be available here soon.</p>
              <button className="bg-[#f87171] text-white px-10 py-4 rounded-full font-bold text-xl opacity-50 cursor-not-allowed">
                  Coming Soon
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
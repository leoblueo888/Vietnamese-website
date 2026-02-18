import React, { useState, useEffect, useRef, useCallback } from 'react';

export const Chatbot: React.FC = () => {
    const [currentLang, setCurrentLang] = useState<'en' | 'ru'>(() => (localStorage.getItem('app_lang') as 'en' | 'ru') || 'en');
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{ text: string; isBot: boolean }[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoadingAI, setIsLoadingAI] = useState(false);
    
    const chatBodyRef = useRef<HTMLDivElement>(null);
    const API_KEY = "AIzaSyDBYaDEMaGo2pO3TFEGigVLOSXLfy8Vktg";
    const MODEL = "gemini-1.5-flash"; // Dùng bản ổn định nhất

    // --- 1. HỆ THỐNG ÂM THANH CHUẨN (WEB SPEECH API) ---
    // Loại bỏ hoàn toàn Google TTS link để tránh lỗi "NotSupportedError"
    const speak = useCallback((text: string) => {
        if (!window.speechSynthesis) return;
        
        window.speechSynthesis.cancel(); // Dừng các câu đang nói

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = currentLang === 'ru' ? 'ru-RU' : 'en-US';
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        // Chọn giọng đọc phù hợp nếu có sẵn
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => v.lang.startsWith(currentLang));
        if (preferredVoice) utterance.voice = preferredVoice;

        window.speechSynthesis.speak(utterance);
    }, [currentLang]);

    // --- 2. HÀM GỌI API GEMINI (SỬA LỖI KẾT NỐI) ---
    const handleSendMessage = useCallback(async (messageText: string) => {
        const msg = messageText.trim();
        if (!msg || isLoadingAI) return;

        // Hiển thị tin nhắn user ngay lập tức
        setMessages(prev => [...prev, { text: msg, isBot: false }]);
        setInputValue('');
        setIsLoadingAI(true);

        try {
            // Lấy kiến thức từ Doc (Có bọc try-catch riêng để không làm sập cả bot)
            let docText = "";
            try {
                const docRes = await fetch('https://docs.google.com/document/d/1i5F5VndGaGbB4d21jRjnJx2YbptF0KdBYHijnjYqe2U/export?format=txt');
                if (docRes.ok) docText = await docRes.text();
            } catch (e) {
                console.warn("Knowledge base fetch failed, using fallback.");
            }

            // Gọi Gemini API trực tiếp
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `Context: ${docText || "Truly Easy Vietnamese website."}\nUser Question: ${msg}\nAnswer as Trang (friendly AI assistant) in ${currentLang === 'ru' ? 'Russian' : 'English'}:`
                        }]
                    }]
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || "API Response Error");
            }

            const data = await response.json();
            const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (aiText) {
                setMessages(prev => [...prev, { text: aiText, isBot: true }]);
                speak(aiText); // Nói câu trả lời của AI
            } else {
                throw new Error("Empty response from AI");
            }

        } catch (error: any) {
            console.error("Chatbot Error Details:", error);
            const errorMsg = currentLang === 'ru' 
                ? "Извините, возникла ошибка соединения. Попробуйте еще раз!" 
                : "Sorry, I'm having trouble connecting. Let's try again!";
            setMessages(prev => [...prev, { text: errorMsg, isBot: true }]);
            speak(errorMsg);
        } finally {
            setIsLoadingAI(false);
        }
    }, [isLoadingAI, currentLang, speak]);

    // --- 3. LOGIC UI ---
    const toggleChat = () => {
        if (!isOpen) {
            // Đánh thức hệ thống âm thanh (Trình duyệt yêu cầu click để cho phép Audio)
            window.speechSynthesis.speak(new SpeechSynthesisUtterance(""));
            const welcome = currentLang === 'ru' ? "Здравствуйте! Чем я có giúp gì cho bạn?" : "Hi! How can I help you today?";
            setMessages([{ text: welcome, isBot: true }]);
            setTimeout(() => speak(welcome), 300);
        }
        setIsOpen(!isOpen);
    };

    useEffect(() => {
        if (chatBodyRef.current) chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }, [messages, isLoadingAI]);

    return (
        <>
            <style>{`
                .chatbot-window { transition: all 0.3s ease; box-shadow: 0 10px 40px rgba(0,0,0,0.1); }
                .msg-bot { background: #f1f5f9; color: #334155; align-self: flex-start; border-radius: 15px 15px 15px 2px; }
                .msg-user { background: #1e5aa0; color: white; align-self: flex-end; border-radius: 15px 15px 2px 15px; }
                .dot-loader { width: 5px; height: 5px; background: #94a3b8; border-radius: 50%; animation: bounce 1s infinite alternate; }
                @keyframes bounce { from { transform: translateY(0); } to { transform: translateY(-5px); } }
            `}</style>

            <button onClick={toggleChat} className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-white rounded-full shadow-2xl flex items-center justify-center border-2 border-blue-50 hover:scale-110 transition-transform">
                <img src="https://i.imgur.com/your-avatar.png" alt="Trang" className="w-12 h-12 rounded-full" />
            </button>

            <div className={`chatbot-window fixed bottom-24 right-6 w-[350px] h-[550px] bg-white rounded-3xl flex flex-col z-50 border border-slate-100 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none translate-y-10'}`}>
                {/* Header */}
                <div className="p-5 border-b flex justify-between items-center bg-slate-50 rounded-t-3xl">
                    <div>
                        <h3 className="font-bold text-slate-800">Trang Assistant</h3>
                        <p className="text-[10px] text-green-500 font-bold uppercase">● Online</p>
                    </div>
                    <button onClick={toggleChat} className="text-slate-400 text-2xl">×</button>
                </div>

                {/* Chat Area */}
                <div ref={chatBodyRef} className="flex-1 p-4 overflow-y-auto flex flex-col gap-3">
                    {messages.map((m, i) => (
                        <div key={i} className={`msg max-w-[85%] p-3 text-sm ${m.isBot ? 'msg-bot' : 'msg-user'}`}>
                            {m.text}
                        </div>
                    ))}
                    {isLoadingAI && (
                        <div className="msg-bot p-4 rounded-xl flex gap-1">
                            <div className="dot-loader"></div>
                            <div className="dot-loader" style={{animationDelay: '0.2s'}}></div>
                            <div className="dot-loader" style={{animationDelay: '0.4s'}}></div>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="p-4 border-t">
                    <div className="flex gap-2 bg-slate-100 p-2 rounded-2xl">
                        <input 
                            className="flex-1 bg-transparent border-none px-2 py-1 text-sm outline-none"
                            placeholder="Type a message..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputValue)}
                        />
                        <button onClick={() => handleSendMessage(inputValue)} className="bg-[#1e5aa0] text-white px-4 py-1 rounded-xl text-sm">
                            Send
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

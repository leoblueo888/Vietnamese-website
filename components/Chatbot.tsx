import React, { useState, useEffect, useRef } from 'react';

export const Chatbot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{ text: string; isBot: boolean }[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatBodyRef = useRef<HTMLDivElement>(null);

    // THÔNG TIN CỦA ÔNG
    const API_KEY = "AIzaSyDBYaDEMaGo2pO3TFEGigVLOSXLfy8Vktg";
    const LANG = (localStorage.getItem('app_lang') as 'en' | 'ru') || 'en';

    // --- HÀM NÓI (KHÔNG DÙNG LINK NGOÀI, KHÔNG LO LỖI SOURCE) ---
    const speak = (text: string) => {
        if (!window.speechSynthesis) return;
        window.speechSynthesis.cancel();
        const speech = new SpeechSynthesisUtterance(text);
        speech.lang = LANG === 'ru' ? 'ru-RU' : 'en-US';
        speech.rate = 1.0;
        window.speechSynthesis.speak(speech);
    };

    // --- HÀM GỌI AI (DÙNG FETCH THUẦN ĐỂ FIX LỖI "API KEY MUST BE SET") ---
    const askAI = async (userText: string) => {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: userText }] }]
            })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error?.message || "API Fail");
        }

        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    };

    const handleSend = async () => {
        if (!inputValue.trim() || isLoading) return;

        const userMsg = inputValue;
        setMessages(prev => [...prev, { text: userMsg, isBot: false }]);
        setInputValue('');
        setIsLoading(true);

        try {
            const aiResponse = await askAI(userMsg);
            setMessages(prev => [...prev, { text: aiResponse, isBot: true }]);
            speak(aiResponse);
        } catch (error: any) {
            console.error("Lỗi thật đây này ông giáo ơi:", error);
            const errorText = "API Error. Check console.";
            setMessages(prev => [...prev, { text: errorText, isBot: true }]);
            speak(errorText);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (chatBodyRef.current) chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }, [messages]);

    return (
        <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999, fontFamily: 'sans-serif' }}>
            {/* Nút tròn */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                style={{ width: '60px', height: '60px', borderRadius: '50%', border: 'none', background: '#1e5aa0', color: 'white', cursor: 'pointer', fontSize: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}
            >
                {isOpen ? '×' : '💬'}
            </button>

            {/* Khung Chat */}
            {isOpen && (
                <div style={{ position: 'absolute', bottom: '80px', right: '0', width: '320px', height: '450px', background: 'white', borderRadius: '15px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.2)', border: '1px solid #eee' }}>
                    <div style={{ padding: '15px', background: '#f8fafc', borderBottom: '1px solid #eee', fontWeight: 'bold' }}>Trang AI Assistant</div>
                    
                    <div ref={chatBodyRef} style={{ flex: 1, padding: '15px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {messages.length === 0 && <div style={{ color: '#94a3b8', fontSize: '13px' }}>Hỏi Trang bất cứ điều gì bằng tiếng {LANG === 'ru' ? 'Nga' : 'Anh'}...</div>}
                        {messages.map((m, i) => (
                            <div key={i} style={{ alignSelf: m.isBot ? 'flex-start' : 'flex-end', background: m.isBot ? '#f1f5f9' : '#1e5aa0', color: m.isBot ? '#334155' : 'white', padding: '8px 12px', borderRadius: '12px', fontSize: '14px', maxWidth: '85%' }}>
                                {m.text}
                            </div>
                        ))}
                        {isLoading && <div style={{ fontSize: '12px', color: '#94a3b8' }}>Trang đang gõ...</div>}
                    </div>

                    <div style={{ padding: '10px', borderTop: '1px solid #eee', display: 'flex', gap: '5px' }}>
                        <input 
                            style={{ flex: 1, border: '1px solid #ddd', padding: '8px', borderRadius: '8px', outline: 'none' }}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Nhập tin nhắn..."
                        />
                        <button onClick={handleSend} style={{ background: '#1e5aa0', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer' }}>Gửi</button>
                    </div>
                </div>
            )}
        </div>
    );
};

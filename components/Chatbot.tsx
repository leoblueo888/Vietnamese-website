import React, { useState, useEffect, useRef } from 'react';

export const Chatbot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{ text: string; isBot: boolean }[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatBodyRef = useRef<HTMLDivElement>(null);

    // Lấy ngôn ngữ hiện tại của trang web
    const currentLang = (localStorage.getItem('app_lang') as 'en' | 'ru') || 'en';

    // --- HÀM ĐỌC ÂM THANH (DÙNG WEB SPEECH API CHUẨN) ---
    const speak = (text: string) => {
        if (!window.speechSynthesis) return;
        window.speechSynthesis.cancel(); // Dừng câu trước đó nếu có
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = currentLang === 'ru' ? 'ru-RU' : 'en-US';
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        
        window.speechSynthesis.speak(utterance);
    };

    // --- HÀM GỬI TIN NHẮN (GỌI QUA BACKEND PROXY) ---
    const handleSendMessage = async () => {
        const text = inputValue.trim();
        if (!text || isLoading) return;

        // Hiển thị tin nhắn của ông lên màn hình
        setMessages(prev => [...prev, { text, isBot: false }]);
        setInputValue('');
        setIsLoading(true);

        try {
            // GỌI ĐẾN FILE /api/chat.ts ÔNG VỪA TẠO
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text, lang: currentLang })
            });

            const data = await response.json();
            
            if (data.text) {
                // AI trả lời: Hiển thị chữ và Phát âm thanh
                setMessages(prev => [...prev, { text: data.text, isBot: true }]);
                speak(data.text);
            } else {
                throw new Error(data.error || "AI error");
            }
        } catch (error) {
            console.error("Lỗi Chatbot:", error);
            const errMsg = currentLang === 'ru' ? "Ошибка соединения!" : "Connection error!";
            setMessages(prev => [...prev, { text: errMsg, isBot: true }]);
        } finally {
            setIsLoading(false);
        }
    };

    // Tự động cuộn xuống dưới cùng khi có tin nhắn mới
    useEffect(() => {
        if (chatBodyRef.current) {
            chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    return (
        <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999 }}>
            {/* Nút Chat */}
            <button 
                onClick={() => {
                    setIsOpen(!isOpen);
                    if (!isOpen) speak(currentLang === 'ru' ? "Привет!" : "Hi!");
                }}
                style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#1e5aa0', color: 'white', border: 'none', cursor: 'pointer', fontSize: '24px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}
            >
                {isOpen ? '×' : '💬'}
            </button>

            {/* Cửa sổ Chat */}
            {isOpen && (
                <div style={{ position: 'absolute', bottom: '80px', right: '0', width: '320px', height: '480px', background: 'white', borderRadius: '20px', display: 'flex', flexDirection: 'column', boxShadow: '0 10px 30px rgba(0,0,0,0.15)', border: '1px solid #eee', overflow: 'hidden', fontFamily: 'sans-serif' }}>
                    <div style={{ padding: '15px', background: '#f8fafc', borderBottom: '1px solid #eee', fontWeight: 'bold', color: '#1e293b' }}>Trang AI Assistant</div>
                    
                    <div ref={chatBodyRef} style={{ flex: 1, padding: '15px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {messages.map((m, i) => (
                            <div key={i} style={{ alignSelf: m.isBot ? 'flex-start' : 'flex-end', background: m.isBot ? '#f1f5f9' : '#1e5aa0', color: m.isBot ? '#334155' : 'white', padding: '10px 14px', borderRadius: '15px', fontSize: '14px', maxWidth: '85%' }}>
                                {m.text}
                            </div>
                        ))}
                        {isLoading && <div style={{ fontSize: '12px', color: '#94a3b8' }}>Trang is typing...</div>}
                    </div>

                    <div style={{ padding: '10px', borderTop: '1px solid #eee', display: 'flex', gap: '5px' }}>
                        <input 
                            style={{ flex: 1, border: '1px solid #ddd', padding: '8px 12px', borderRadius: '10px', outline: 'none' }}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                            placeholder="Message..."
                        />
                        <button onClick={handleSendMessage} style={{ background: '#1e5aa0', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }}>Send</button>
                    </div>
                </div>
            )}
        </div>
    );
};

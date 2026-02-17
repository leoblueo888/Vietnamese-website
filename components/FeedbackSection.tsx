
import React, { useState, FormEvent } from 'react';
import { Language } from '../App';
import { translations } from '../translations';

interface FeedbackSectionProps {
  language: Language;
}

export const FeedbackSection: React.FC<FeedbackSectionProps> = ({ language }) => {
  const [feedback, setFeedback] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(true);
  const t = translations[language].feedback;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!feedback.trim() || isSending) return;

    setIsSending(true);
    setMessage('');

    const API_ENDPOINT = 'https://script.google.com/macros/s/AKfycbxR38Dek-a0yvZ9XcZFuFiNQKoFxd6crYeBKBgCEOT65FOfzeY_og5AhoGe6RIo9g7d3Q/exec';
    
    const userEmail = localStorage.getItem('userEmail') || 'Guest';

    const feedbackData = {
      action: 'send_feedback',
      email: userEmail,
      feedback: feedback
    };

    try {
      await fetch(API_ENDPOINT, {
        method: 'POST',
        mode: 'no-cors', // Rất quan trọng để không bị lỗi CORS
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedbackData),
      });

      // Vì dùng no-cors nên không đọc được phản hồi, 
      // cứ chạy xong fetch là báo thành công và xóa trắng ô nhập
      setIsSuccess(true);
      setMessage(language === 'ru' ? 'Спасибо! Ваш отзыв был отправлен.' : 'Thank you! Your feedback has been submitted.');
      setFeedback('');

    } catch (error) {
      console.error('Lỗi gửi feedback:', error);
      setIsSuccess(false);
      setMessage(language === 'ru' ? 'Не удалось отправить отзыв. Попробуйте еще раз.' : 'Failed to send feedback. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const sendingText = language === 'ru' ? 'Отправка...' : 'Sending...';

  return (
    <section className="py-10 bg-[#1e5aa0]">
      <div className="max-w-[1100px] mx-auto px-6">
        <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl text-center relative">
          <h2 className="text-[42px] md:text-[64px] font-black text-[#1e293b] tracking-tight mb-1">{t.title}</h2>
          
          <form onSubmit={handleSubmit} className="mt-6 max-w-3xl mx-auto">
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder={t.placeholder}
              className="w-full h-28 p-5 bg-white border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none text-[15px] shadow-inner mb-6"
              disabled={isSending}
            />
            <button 
              type="submit"
              disabled={isSending || !feedback.trim()}
              className="bg-[#ff8a65] text-white px-10 py-3 rounded-full font-bold text-lg hover:bg-[#ff7043] transition-all shadow-[0_10px_20px_-5px_rgba(255,138,101,0.5)] disabled:bg-slate-400 disabled:shadow-none disabled:cursor-not-allowed"
            >
              {isSending ? sendingText : t.button}
            </button>
            {message && (
              <p className={`text-center font-bold mt-4 animate-in fade-in ${isSuccess ? 'text-green-600' : 'text-red-500'}`}>
                {message}
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
};

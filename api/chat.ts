import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    const { message, lang } = req.body;

    // Danh sách 10 Key ông đã nhét vào Variable của Vercel
    const API_KEYS = [
        process.env.VITE_GEMINI_KEY_1,
        process.env.VITE_GEMINI_KEY_2,
        process.env.VITE_GEMINI_KEY_3,
        process.env.VITE_GEMINI_KEY_4,
        process.env.VITE_GEMINI_KEY_5,
        process.env.VITE_GEMINI_KEY_6,
        process.env.VITE_GEMINI_KEY_7,
        process.env.VITE_GEMINI_KEY_8,
        process.env.VITE_GEMINI_KEY_9,
        process.env.VITE_GEMINI_KEY_10,
    ].filter(Boolean); // Loại bỏ các key trống

    const MODEL_NAME = "gemini-2.5-flash";

    // Vòng lặp "săn" Key sống
    for (let i = 0; i < API_KEYS.length; i++) {
        const currentKey = API_KEYS[i];
        try {
            // Sử dụng Fetch API trực tiếp để nhẹ và nhanh nhất trên Vercel
            const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/${MODEL_NAME}:generateContent?key=${currentKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ 
                        parts: [{ 
                            text: `You are Trang, a friendly Vietnamese language expert. Answer briefly and supportively in ${lang === 'ru' ? 'Russian' : 'English'}: ${message}` 
                        }] 
                    }]
                })
            });

            const data = await response.json();

            // Nếu Google trả về lỗi (hết credit, khóa key...), ném lỗi để nhảy sang catch
            if (!response.ok || data.error) {
                throw new Error(data.error?.message || 'Key failed');
            }

            // Nếu thành công, trả về kết quả ngay lập tức
            const aiResponse = data.candidates[0].content.parts[0].text;
            return res.status(200).json({ text: aiResponse });

        } catch (e: any) {
            console.warn(`Key ${i + 1} thất bại: ${e.message}. Đang thử key tiếp theo...`);
            // Tiếp tục vòng lặp để thử Key tiếp theo
            continue; 
        }
    }

    // Nếu chạy hết 10 key mà vẫn thất bại
    res.status(500).json({ error: 'Tất cả 10 Key của Trang đều đang bận hoặc hết hạn. Ông hãy kiểm tra lại credit nhé!' });
}

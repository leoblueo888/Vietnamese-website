import { GoogleGenerativeAI } from '@google/generative-ai';

// Tự động quét từ 1 đến 10
const GEMINI_API_KEYS: string[] = [
  import.meta.env.VITE_GEMINI_KEY_1,
  import.meta.env.VITE_GEMINI_KEY_2,
  import.meta.env.VITE_GEMINI_KEY_3,
  import.meta.env.VITE_GEMINI_KEY_4,
  import.meta.env.VITE_GEMINI_KEY_5,
  import.meta.env.VITE_GEMINI_KEY_6,
  import.meta.env.VITE_GEMINI_KEY_7,
  import.meta.env.VITE_GEMINI_KEY_8,
  import.meta.env.VITE_GEMINI_KEY_9,
  import.meta.env.VITE_GEMINI_KEY_10,
].filter(key => key && key.length > 10);

let currentKeyIndex = 0;

export const generateContentWithRetry = async (prompt: string): Promise<string> => {
  if (GEMINI_API_KEYS.length === 0) return "Lỗi: Không tìm thấy bất kỳ API Key nào!";

  const safePrompt = prompt.trim() || "Chào bạn!";

  for (let i = 0; i < GEMINI_API_KEYS.length; i++) {
    const keyIndex = (currentKeyIndex + i) % GEMINI_API_KEYS.length;
    try {
      const genAI = new GoogleGenerativeAI(GEMINI_API_KEYS[keyIndex]);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      // Gửi theo format object để tránh lỗi 400
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: safePrompt }] }]
      });

      const response = await result.response;
      currentKeyIndex = (keyIndex + 1) % GEMINI_API_KEYS.length;
      return response.text();
    } catch (error: any) {
      console.warn(`Key ${keyIndex + 1} báo lỗi: ${error.message}`);
      // Nếu lỗi do Key (400, 403), vòng lặp sẽ tự chuyển sang Key tiếp theo
    }
  }
  return "Tất cả 10 Keys đều không hoạt động. Vui lòng kiểm tra lại cấu hình GitHub!";
};

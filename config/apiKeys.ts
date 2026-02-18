import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEYS: string[] = [
  import.meta.env.VITE_GEMINI_KEY_1,
  import.meta.env.VITE_GEMINI_KEY_2,
  import.meta.env.VITE_GEMINI_KEY_3,
  import.meta.env.VITE_GEMINI_KEY_4,
  import.meta.env.VITE_GEMINI_KEY_5,
].filter(key => key && key.length > 10);

let currentKeyIndex = 0;

export const generateContentWithRetry = async (prompt: string) => {
  if (GEMINI_API_KEYS.length === 0) return "Lỗi: Hệ thống chưa nhận được API Key từ GitHub.";

  for (let i = 0; i < GEMINI_API_KEYS.length; i++) {
    try {
      const genAI = new GoogleGenerativeAI(GEMINI_API_KEYS[currentKeyIndex]);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      currentKeyIndex = (currentKeyIndex + 1) % GEMINI_API_KEYS.length;
    }
  }
  return "Tất cả Keys đều đang bận.";
};

import { GoogleGenerativeAI } from '@google/generative-ai';

// Tự động lấy 5 key từ biến môi trường đã nạp
const GEMINI_API_KEYS: string[] = [
  import.meta.env.VITE_GEMINI_KEY_1,
  import.meta.env.VITE_GEMINI_KEY_2,
  import.meta.env.VITE_GEMINI_KEY_3,
  import.meta.env.VITE_GEMINI_KEY_4,
  import.meta.env.VITE_GEMINI_KEY_5,
].filter(key => key && key.length > 0); // Chỉ lấy những key đã được nạp

let currentKeyIndex = 0;

/**
 * Hàm gọi AI với cơ chế xoay vòng và tự động thử lại nếu lỗi
 */
export const generateContentWithRetry = async (prompt: string) => {
  if (GEMINI_API_KEYS.length === 0) {
    console.error("Chưa có API Key nào được nạp vào Environment Variables!");
    return "Lỗi: Hệ thống chưa cấu hình API Key.";
  }

  let attempts = 0;
  while (attempts < GEMINI_API_KEYS.length) {
    const keyIndex = (currentKeyIndex + attempts) % GEMINI_API_KEYS.length;
    const apiKey = GEMINI_API_KEYS[keyIndex];

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      
      // Thành công thì cập nhật index cho lần sau dùng key tiếp theo (load balancing)
      currentKeyIndex = (keyIndex + 1) % GEMINI_API_KEYS.length;
      return response.text();

    } catch (error: any) {
      console.warn(`Key thứ ${keyIndex + 1} bị lỗi, đang thử key tiếp theo...`);
      attempts++;
      
      // Nếu là lỗi 429 (quá tải), chờ một chút trước khi thử tiếp
      if (error.message?.includes('429')) {
        await new Promise(res => setTimeout(res, 1000));
      }
    }
  }

  return "Tất cả API Keys đều đang bận hoặc lỗi. Vui lòng thử lại sau!";
};

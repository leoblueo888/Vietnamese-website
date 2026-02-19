// src/config/apiKeys.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * 1. HỆ THỐNG 10 KEYS XOAY VÒNG
 * Đã lọc bỏ các key trống để tránh lỗi undefined khi gọi API
 */
const API_KEYS = [
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
].filter(key => !!key);

let currentKeyIndex = 0;

export const getNextApiKey = () => {
  if (API_KEYS.length === 0) return null;
  const key = API_KEYS[currentKeyIndex];
  currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
  return key;
};

/**
 * 2. HÀM GỌI API GEMINI 3 FLASH (NÃO BỘ TRUNG TÂM)
 * Hàm này sẽ nhận lệnh từ các game và điều phối 10 keys
 */
export const generateContentWithRetry = async (payload: {
  model?: string;
  config: { systemInstruction: string };
  contents: any[];
}) => {
  let lastError;
  
  // Thử lần lượt các Key nếu gặp lỗi
  for (let i = 0; i < API_KEYS.length; i++) {
    try {
      const apiKey = getNextApiKey();
      if (!apiKey) throw new Error("No API Key found in environment variables.");

      const genAI = new GoogleGenerativeAI(apiKey);
      
      // Sử dụng model gemini-3-flash-preview theo yêu cầu của ông
      // Nếu payload truyền vào một model khác, nó sẽ ưu tiên cái đó
      const model = genAI.getGenerativeModel({ 
        model: payload.model || "gemini-3-flash-preview", 
        systemInstruction: payload.config.systemInstruction
      });

      // Thực hiện gọi API với dữ liệu hội thoại (History)
      const result = await model.generateContent({
        contents: payload.contents,
      });

      const response = await result.response;
      
      // Trả về định dạng chuẩn để Frontend xử lý
      return {
        text: response.text(),
        audio: null // Vẫn giữ null để Frontend tự kích hoạt Google TTS (ổn định nhất)
      };

    } catch (error: any) {
      lastError = error;
      console.warn(`Key index ${currentKeyIndex} gặp lỗi, đang đổi key...`, error.message);
      
      // Nếu lỗi 429 (Hết hạn mức) hoặc 404 (Sai tên model ở key đó), đổi key ngay
      if (error.message?.includes('429') || error.message?.includes('404') || error.message?.includes('quota')) {
        continue;
      } else {
        // Nếu lỗi logic hoặc cấu trúc prompt, dừng lại để tránh phí lượt thử
        throw error; 
      }
    }
  }
  throw lastError;
};

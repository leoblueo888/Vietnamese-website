// src/config/apiKeys.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * 1. HỆ THỐNG 10 KEYS XOAY VÒNG
 * Đã tối ưu để chạy trên Vercel/GitHub Pages với tiền tố VITE_
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
 * 2. HÀM TRUNG TÂM GỌI MODEL 2.5 FLASH
 * Đảm bảo lấy đúng "Não" 2.5 cho tất cả các game
 */
export const generateContentWithRetry = async (payload: {
  model?: string;
  config: { systemInstruction: string };
  contents: any[];
}) => {
  if (API_KEYS.length === 0) {
    throw new Error("LỖI: Không tìm thấy API Key nào. Hãy kiểm tra VITE_GEMINI_KEY_x");
  }

  let lastError;
  
  for (let i = 0; i < API_KEYS.length; i++) {
    try {
      const apiKey = getNextApiKey();
      const genAI = new GoogleGenerativeAI(apiKey!);
      
      // SỬ DỤNG ĐÚNG MODEL 2.5 FLASH THEO Ý ÔNG
      const modelName = payload.model || "gemini-2.5-flash"; 
      
      const model = genAI.getGenerativeModel({ 
        model: modelName,
        systemInstruction: payload.config.systemInstruction
      });

      const result = await model.generateContent({
        contents: payload.contents,
      });

      const response = await result.response;
      const text = response.text();

      if (!text) throw new Error("AI trả về nội dung rỗng");

      return {
        text: text,
        audio: null // Giữ nguyên null để game dùng Google TTS cho ổn định
      };

    } catch (error: any) {
      lastError = error;
      console.warn(`Key ${currentKeyIndex} lỗi: ${error.message}`);
      
      // Nếu lỗi 404 (sai tên model) hoặc 429 (hết lượt), đổi sang key khác
      if (error.message?.includes('404') || error.message?.includes('429') || error.message?.includes('quota')) {
        continue;
      } else {
        throw error; 
      }
    }
  }
  throw lastError;
};

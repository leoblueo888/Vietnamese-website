// /config/apiKeys.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

// 1. Lấy 10 Key từ biến môi trường của Vercel (VITE_...)
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
].filter(key => !!key); // Chỉ lấy các key đã được điền

let currentKeyIndex = 0;

/**
 * Hàm gọi API dùng chung cho Chatbot và tất cả các Game (Lan, Thu, Mai)
 * Tự động xoay vòng key nếu gặp lỗi (Rate Limit, Key chết...)
 */
export const generateContentWithRetry = async (payload: any, retryCount = 0): Promise<any> => {
  // Nếu đã thử quá số lượng key thì dừng
  if (retryCount >= API_KEYS.length) {
    throw new Error("Tất cả các API Keys đều thất bại hoặc hết hạn.");
  }

  const apiKey = API_KEYS[currentKeyIndex];
  if (!apiKey) {
    currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
    return generateContentWithRetry(payload, retryCount + 1);
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  
  // Tự động nhận diện payload là string (prompt đơn giản) hay object (config phức tạp)
  const isSimplePrompt = typeof payload === 'string';
  const prompt = isSimplePrompt ? payload : (payload.contents?.[0]?.parts?.[0]?.text || payload.contents || "");
  const modelName = !isSimplePrompt && payload.model ? payload.model : "gemini-1.5-flash";

  try {
    const model = genAI.getGenerativeModel({ 
      model: modelName,
      systemInstruction: !isSimplePrompt && payload.config?.systemInstruction ? payload.config.systemInstruction : undefined
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return {
      text: text,
      response: response
    };
  } catch (error: any) {
    console.warn(`Key index ${currentKeyIndex} gặp lỗi. Đang thử key tiếp theo...`);
    
    // Chuyển sang key tiếp theo
    currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
    
    // Gọi lại hàm với key mới
    return generateContentWithRetry(payload, retryCount + 1);
  }
};

import { GoogleGenerativeAI } from '@google/generative-ai';

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
].filter(key => key && key.startsWith("AIza"));

export const generateContentWithRetry = async (prompt: string): Promise<string> => {
  // SỬA CHÍNH XÁC TÊN MODEL 2.5 FLASH Ở ĐÂY
  const MODEL_NAME = "gemini-2.5-flash"; 

  for (let i = 0; i < GEMINI_API_KEYS.length; i++) {
    try {
      const genAI = new GoogleGenerativeAI(GEMINI_API_KEYS[i]);
      const model = genAI.getGenerativeModel({ model: MODEL_NAME });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error: any) {
      console.warn(`Key ${i + 1} (${MODEL_NAME}) lỗi: ${error.message}`);
      
      // Nếu lỗi 404, có thể do Google yêu cầu thêm hậu tố -latest cho bản 2.5
      if (error.message.includes("404")) {
         try {
            const modelLatest = genAI.getGenerativeModel({ model: "gemini-2.5-flash-latest" });
            const res = await modelLatest.generateContent(prompt);
            return res.response.text();
         } catch(e) { continue; }
      }
    }
  }
  return "Tất cả key Gemini 2.5 đều không phản hồi. Ông kiểm tra lại hạn mức credit nhé!";
};

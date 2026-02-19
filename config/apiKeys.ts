// /config/apiKeys.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

// 1. Cấu hình 10 Keys lấy từ Environment Variables trên Vercel
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
].filter(key => !!key); // Chỉ giữ lại các key đã được nhập giá trị

let currentKeyIndex = 0;

/**
 * Hàm gọi API mạnh mẽ nhất: 
 * - Hỗ trợ Chat History (Trí nhớ)
 * - Hỗ trợ System Instruction (Não bộ/Vai trò)
 * - Tự động xoay vòng 10 Key nếu gặp lỗi
 */
export const generateContentWithRetry = async (payload: any, retryCount = 0): Promise<any> => {
  if (retryCount >= API_KEYS.length) {
    throw new Error("Tất cả API Keys đều đã thất bại hoặc hết hạn mức.");
  }

  const apiKey = API_KEYS[currentKeyIndex];
  const genAI = new GoogleGenerativeAI(apiKey);

  try {
    // PHÂN TÍCH PAYLOAD ĐỂ GIỮ "NÃO" CHO CHATBOT
    // Nếu payload là object (từ Chatbot/Lan), ta lấy model và hướng dẫn hệ thống
    // Nếu payload chỉ là string, ta dùng mặc định
    const modelName = payload.model || "gemini-1.5-flash";
    const systemPrompt = payload.config?.systemInstruction || "";
    
    const model = genAI.getGenerativeModel({ 
      model: modelName,
      systemInstruction: systemPrompt 
    });

    // PHÂN TÍCH LỊCH SỬ (HISTORY)
    // Chatbot gửi 'contents' là một mảng các câu hội thoại cũ. 
    // Nếu không có, ta tạo một mảng mới từ prompt hiện tại.
    const contents = payload.contents || [{ role: 'user', parts: [{ text: typeof payload === 'string' ? payload : "" }] }];

    // GỌI API VỚI ĐẦY ĐỦ NGỮ CẢNH
    const result = await model.generateContent({ contents });
    const response = await result.response;
    const text = response.text();

    // Trả về định dạng Object để Chatbot.tsx và GameLan.tsx đọc được
    return {
      text: text,
      response: response
    };

  } catch (error: any) {
    console.warn(`Key số ${currentKeyIndex + 1} lỗi. Đang chuyển sang key tiếp theo...`);
    
    // Tăng index để dùng key tiếp theo cho lần thử lại
    currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
    
    // Đệ quy thử lại với key mới
    return generateContentWithRetry(payload, retryCount + 1);
  }
};

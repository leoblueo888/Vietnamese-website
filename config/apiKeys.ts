import { GoogleGenerativeAI } from '@google/generative-ai';

// Lấy danh sách Keys từ biến môi trường để bảo mật
const GEMINI_API_KEYS: string[] = [
    import.meta.env.VITE_GEMINI_KEY_1 || '',
    import.meta.env.VITE_GEMINI_KEY_2 || '',
    import.meta.env.VITE_GEMINI_KEY_3 || '',
    import.meta.env.VITE_GEMINI_KEY_4 || '',
    import.meta.env.VITE_GEMINI_KEY_5 || '',
    import.meta.env.VITE_GEMINI_KEY_6 || '',
    import.meta.env.VITE_GEMINI_KEY_7 || '',
    import.meta.env.VITE_GEMINI_KEY_8 || '',
    import.meta.env.VITE_GEMINI_KEY_9 || '',
    import.meta.env.VITE_GEMINI_KEY_10 || '',
].filter(key => key !== ''); // Chỉ giữ lại các key có giá trị

let currentApiKeyIndex = 0;

export const generateContentWithRetry = async (modelName: string, prompt: string) => {
    if (GEMINI_API_KEYS.length === 0) {
        console.error("No API Keys found. Please check your Environment Variables.");
        throw new Error("Cấu hình API Key chưa đúng. Vui lòng kiểm tra lại.");
    }

    let lastError: any;
    let delay = 1000;

    for (let i = 0; i < GEMINI_API_KEYS.length; i++) {
        const keyIndex = (currentApiKeyIndex + i) % GEMINI_API_KEYS.length;
        const apiKey = GEMINI_API_KEYS[keyIndex];
        
        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: modelName });
            
            const result = await model.generateContent(prompt);
            const response = await result.response;
            
            // Thành công: Cập nhật index cho lần gọi sau
            currentApiKeyIndex = (keyIndex + 1) % GEMINI_API_KEYS.length;
            return response.text(); 
            
        } catch (error: any) {
            console.warn(`Key index ${keyIndex} thất bại: ${error.message}`);
            lastError = error;

            // Nếu gặp lỗi giới hạn (429), chờ rồi thử key tiếp theo
            if (error.message?.includes('429') || JSON.stringify(error).includes('429')) {
                await new Promise(res => setTimeout(res, delay));
                delay *= 2; 
            }
        }
    }

    throw lastError || new Error("Tất cả API keys đều thất bại.");
};

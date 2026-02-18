
import { GoogleGenAI } from '@google/genai';

// This list contains 10 unique API keys to handle higher user load.
const GEMINI_API_KEYS = [
   
];

let currentApiKeyIndex = 0;

export const generateContentWithRetry = async (payload: any) => {
    let lastError: any;
    let delay = 1000; // Initial 1-second delay for rate limit errors.

    // Try each key once for a given request before failing.
    for (let i = 0; i < GEMINI_API_KEYS.length; i++) {
        // Start from the current index and wrap around the array.
        const keyIndex = (currentApiKeyIndex + i) % GEMINI_API_KEYS.length;
        const apiKey = GEMINI_API_KEYS[keyIndex];
        
        try {
            const ai = new GoogleGenAI({ apiKey });
            // Assuming payload contains model, contents, config etc.
            const response = await ai.models.generateContent(payload);
            
            // On success, set the next call to start with the subsequent key to distribute load.
            currentApiKeyIndex = (keyIndex + 1) % GEMINI_API_KEYS.length;
            
            return response; // Success
        } catch (error: any) {
            console.error(`API call with key index ${keyIndex} failed. Retries left: ${GEMINI_API_KEYS.length - 1 - i}`, error.message);
            lastError = error;
            
            // If it's a rate limit error (429), wait before trying the next key.
            if (String(error).includes('429')) {
                await new Promise(res => setTimeout(res, delay));
                delay *= 2; // Exponential backoff for subsequent rate limit errors in the same request.
            }
            // For other errors, we'll immediately try the next key in the next iteration.
        }
    }

    // If all retries across all keys fail, throw the last encountered error.
    throw lastError || new Error("All Gemini API retries failed across all available keys.");
};

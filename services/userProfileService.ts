import { supabase } from '../lib/supabaseClient';

// --- (QUAN TRỌNG) GHI CHÚ DEBUG CHO SUPABASE ---
// Nếu bạn gặp lỗi khi INSERT hoặc SELECT dữ liệu, hãy kiểm tra các mục sau:
// 1. Row Level Security (RLS): Đảm bảo bạn đã tắt RLS cho bảng `user_progress` để cho phép ghi dữ liệu ẩn danh.
//    Chạy lệnh SQL sau trong Supabase SQL Editor:
//    ALTER TABLE public.user_progress DISABLE ROW LEVEL SECURITY;
// 2. Cấu trúc bảng: Đảm bảo các cột trong `payload` (được log ra ở hàm saveGameResult) khớp 100% với tên và kiểu dữ liệu trong bảng của bạn.
// 3. API Keys: Đảm bảo Supabase URL và Anon Key trong `lib/supabaseClient.ts` là chính xác.

// --- Type Definitions for User Profile Data ---
interface Topic {
  id: string;
  title: string;
  status: 'Mastered' | 'Unlocked' | 'Locked';
  newWords: number;
  keyPhrases: number;
}

interface AiConnection {
  id: string;
  name: string;
  age: number;
  avatarUrl: string;
  fluencyLevel: number;
}

interface CorrectionItem {
  id: string;
  said: string;
  correct: string;
}

interface CorrectedItem {
  id: string;
  phrase: string;
}

interface PronunciationItem {
  word: string;
  score: number;
}

interface UserProfileData {
    user: {
        name: string;
        avatarUrl: string;
        membershipStatus: string;
    };
    performance: {
        totalSpeakingTime: number;
        overallPronunciationScore: number;
        topicsCompleted: number;
        totalTopics: number;
    };
    topics: Topic[];
    aiConnections: AiConnection[];
    correctionCenter: {
        uncorrected: CorrectionItem[];
        corrected: CorrectedItem[];
    };
    pronunciationDeepDive: PronunciationItem[];
    aiMemoryVault: string[];
}

export interface GameResult {
    duration: number; // in seconds
    accuracy_score: number;
    word: string;
    mistake?: {
        user_said: string;
        correct_way: string;
    } | null;
}

// --- Anonymous Guest User ID Management ---
const GUEST_USER_ID_KEY = 'guest_user_id';

// Gets the current guest ID if it exists in localStorage.
export const getCurrentGuestId = (): string | null => {
    return localStorage.getItem(GUEST_USER_ID_KEY);
};

// Handles the "Login as Guest" action, creating an ID if one doesn't exist.
export const handleGuestLogin = (): { isNew: boolean, guestId: string } => {
    let guestId = getCurrentGuestId();
    if (guestId) {
        return { isNew: false, guestId };
    } else {
        guestId = crypto.randomUUID();
        localStorage.setItem(GUEST_USER_ID_KEY, guestId);
        return { isNew: true, guestId };
    }
};


// Fetches the static base profile data and merges it with dynamic data from Supabase for the current guest user.
export const getProfileData = async (): Promise<UserProfileData> => {
    // 1. Fetch the static base profile structure from the JSON file.
    const baseProfileResponse = await fetch('./userProfileData.json');
    if (!baseProfileResponse.ok) throw new Error('Failed to fetch base profile data.');
    const profile: UserProfileData = await baseProfileResponse.json();

    // 2. Get the current guest user ID. Fails if not logged in.
    const guestId = getCurrentGuestId();
    if (!guestId) {
        throw new Error("No guest session found. Please log in as a guest.");
    }


    // 3. Fetch progress data from Supabase for this specific guest user.
    const { data: progressData, error } = await supabase
        .from('user_progress')
        .select('speaking_time, score, word, mistakes') // Use new column names: score, mistakes
        .eq('user_id', guestId) // Filter by guest user ID
        .order('created_at', { ascending: false });

    if (error) {
        console.error("LỖI SUPABASE THỰC TẾ (khi lấy dữ liệu):", error);
        // Return the static profile if Supabase fails
        return profile;
    }

    // 4. Aggregate the progress data
    if (progressData && progressData.length > 0) {
        // Calculate total speaking time in hours
        const totalSeconds = progressData.reduce((sum, row) => sum + (row.speaking_time || 0), 0);
        profile.performance.totalSpeakingTime = parseFloat((totalSeconds / 3600).toFixed(2));

        // Calculate average pronunciation score
        const scores = progressData.map(row => row.score).filter(s => s !== null); // Use 'score'
        if (scores.length > 0) {
            const totalScore = scores.reduce((sum, score) => sum + score, 0);
            profile.performance.overallPronunciationScore = Math.round(totalScore / scores.length);
        }

        // Populate pronunciation deep dive (unique words with latest score)
        const pronunciationMap = new Map<string, number>();
        progressData.forEach(row => {
            if (row.word && !pronunciationMap.has(row.word)) {
                pronunciationMap.set(row.word, row.score); // Use 'score'
            }
        });
        profile.pronunciationDeepDive = Array.from(pronunciationMap.entries()).map(([word, score]) => ({ word, score }));

        // Populate correction center with the 5 most recent mistakes from the 'mistakes' array
        const allMistakes = progressData
            .flatMap(row => row.mistakes || [])
            .filter(m => m && m.user_said && m.correct_way);

        profile.correctionCenter.uncorrected = allMistakes
            .slice(0, 5)
            .map((mistake, index) => ({
                id: `err_supabase_${index}`,
                said: mistake.user_said,
                correct: mistake.correct_way,
            }));
    } else {
        // If there's no data, reset to default values
        profile.performance.totalSpeakingTime = 0;
        profile.performance.overallPronunciationScore = 0;
        profile.pronunciationDeepDive = [];
        profile.correctionCenter.uncorrected = [];
    }

    return profile;
};

// Inserts a new game result into the Supabase 'user_progress' table with the guest user ID.
export const saveGameResult = async (result: GameResult, lessonName: string): Promise<void> => {
    const guestId = getCurrentGuestId();
    if (!guestId) {
        console.warn("Cannot save game result: No guest user is logged in.");
        return;
    }

    // Construct the payload to match the exact table schema
    const payload = {
        user_id: guestId,
        lesson_name: lessonName,
        score: Number(result.accuracy_score), // Use 'score' and ensure it's a number
        mistakes: result.mistake ? [result.mistake] : [], // Use 'mistakes' and ensure it's an array
        speaking_time: Number(result.duration), // Use 'speaking_time' and ensure it's a number
        word: result.word
    };
    
    // User-requested high-level debug log
    console.log('KIỂM TRA DỮ LIỆU:', payload);

    const { error } = await supabase.from('user_progress').insert(payload);

    if (error) {
        // User-requested detailed error log to see the exact server response.
        console.error('LỖI SUPABASE THỰC TẾ:', error);
    } else {
        console.log(`✅ Data saved for Guest ID: ${guestId}`);
        // Notify the UI that data has changed
        window.dispatchEvent(new CustomEvent('profileUpdated'));
    }
};

// Deletes all records from the 'user_progress' table for the current guest user.
export const resetProfileData = async (): Promise<void> => {
    const guestId = getCurrentGuestId();
    if (!guestId) {
        console.warn("Cannot reset data: No guest user is logged in.");
        return;
    }

    const { error } = await supabase
        .from('user_progress')
        .delete()
        .eq('user_id', guestId); // Only delete records for this guest user

    if (error) {
        console.error("LỖI SUPABASE THỰC TẾ (khi xóa dữ liệu):", error);
    } else {
        console.log(`Data reset for Guest ID: ${guestId}`);
        // Notify the UI that data has changed
        window.dispatchEvent(new CustomEvent('profileUpdated'));
    }
};

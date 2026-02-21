// --- HÀM SPEAK ĐÃ SỬA DÙNG PROXY VÀ FALLBACK (THAY THẾ HOÀN TOÀN) ---
const speakWord = useCallback(async (fullText: string, msgId: string | null = null) => {
  if (!fullText) return;
  if (msgId) setActiveVoiceId(msgId);

  // Dừng mọi âm thanh đang phát
  if (window.speechSynthesis) window.speechSynthesis.cancel();
  audioRef.current.pause();

  // Clean text: chỉ lấy phần tiếng Việt, loại bỏ ký tự đặc biệt
  const vietnamesePart = fullText.split('|')[0].trim()
    .replace(/[*_`#|]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/[✨🎵🔊🔔❌✅⭐🌊🌸]/g, '')
    .trim();

  if (!vietnamesePart) {
    if (msgId) setActiveVoiceId(null);
    return;
  }

  const chunks = createChunks(vietnamesePart);

  try {
    for (const chunk of chunks) {
      await new Promise<void>((resolve) => {
        // Dùng API proxy (đã hoạt động tốt ở các game khác)
        const url = `/api/tts?text=${encodeURIComponent(chunk)}&lang=vi`;
        audioRef.current.src = url;
        audioRef.current.playbackRate = playbackSpeed;

        audioRef.current.onended = () => resolve();
        audioRef.current.onerror = () => {
          // Fallback khi API lỗi
          const fallback = new SpeechSynthesisUtterance(chunk);
          fallback.lang = 'vi-VN';
          fallback.rate = playbackSpeed;
          fallback.onend = () => resolve();
          window.speechSynthesis.speak(fallback);
        };

        audioRef.current.play().catch(() => {
          // Fallback khi play lỗi
          const fallback = new SpeechSynthesisUtterance(chunk);
          fallback.lang = 'vi-VN';
          fallback.rate = playbackSpeed;
          fallback.onend = () => resolve();
          window.speechSynthesis.speak(fallback);
        });
      });
    }
  } catch (error) {
    console.error("Lỗi phát âm thanh:", error);
  } finally {
    if (msgId) setActiveVoiceId(null);
  }
}, [playbackSpeed]); // Chỉ phụ thuộc vào playbackSpeed

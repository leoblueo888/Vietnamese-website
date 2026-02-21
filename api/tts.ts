// Sử dụng chuẩn Node.js để chạy trên Vercel Serverless
export default async function handler(req: any, res: any) {
  const { text, lang = "vi" } = req.query;

  if (!text) {
    return res.status(400).send("Missing text");
  }

  const googleUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${lang}&client=tw-ob`;

  try {
    const googleRes = await fetch(googleUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
      },
    });

    if (!googleRes.ok) {
      return res.status(500).send("Google TTS failed");
    }

    // Thiết lập Header để trình duyệt hiểu đây là file âm thanh
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Cache-Control", "public, max-age=86400"); // Cache 24h để tiết kiệm

    // Chuyển dữ liệu từ Google về Client
    const arrayBuffer = await googleRes.arrayBuffer();
    res.send(Buffer.from(arrayBuffer));

  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
}

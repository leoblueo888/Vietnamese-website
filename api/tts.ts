export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    return res.status(405).send("Method not allowed");
  }

  const { text, lang = "vi" } = req.query;

  if (!text) {
    return res.status(400).send("Missing text");
  }

  if (text.length > 200) {
    return res.status(400).send("Text too long (max 200 chars)");
  }

  const googleUrl =
    `https://translate.google.com/translate_tts?ie=UTF-8` +
    `&q=${encodeURIComponent(text)}` +
    `&tl=${lang}` +
    `&client=tw-ob`;

  try {
    const googleRes = await fetch(googleUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
      },
    });

    if (!googleRes.ok) {
      return res.status(500).send("Google TTS failed");
    }

    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Cache-Control", "public, max-age=86400");

    const arrayBuffer = await googleRes.arrayBuffer();
    res.send(Buffer.from(arrayBuffer));

  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
}

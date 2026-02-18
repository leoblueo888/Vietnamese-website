import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
    const { message, lang } = req.body;
    const API_KEY = process.env.GEMINI_API_KEY; 

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `You are Trang, a friendly teacher. Answer briefly in ${lang === 'ru' ? 'Russian' : 'English'}: ${message}` }] }]
            })
        });
        const data = await response.json();
        res.status(200).json({ text: data.candidates[0].content.parts[0].text });
    } catch (e) {
        res.status(500).json({ error: 'Server error' });
    }
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { topic } = req.body;
    if (!topic) {
        return res.status(400).json({ error: 'Topic is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY; 

    if (!apiKey) {
        return res.status(500).json({ error: 'Server configuration error (Key missing)' });
    }

    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        const prompt = `You are an expert AI Cheat Bot. Provide a concise, point-wise cheat sheet, shortcuts, hacks, or quick tips for the following topic: "${topic}". Keep it clean, highly actionable, and easy to read.`;

        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await response.json();
        
        if (data.candidates && data.candidates[0].content.parts[0].text) {
            let aiResponse = data.candidates[0].content.parts[0].text;
            aiResponse = aiResponse.replace(/\*\*/g, ''); 
            return res.status(200).json({ result: aiResponse });
        } else {
            return res.status(500).json({ error: 'AI content generation failed' });
        }

    } catch (error) {
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

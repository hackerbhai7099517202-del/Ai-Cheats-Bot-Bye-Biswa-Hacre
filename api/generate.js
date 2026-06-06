export default async function handler(req, res) {
    // 1. CORS Headers allow karna taaki frontend connect ho sake
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { topic } = req.body;
    if (!topic) {
        return res.status(400).json({ error: 'Sawaal missing hai dost!' });
    }

    // Vercel se aapki daali hui key uthayega
    const apiKey = process.env.GEMINI_API_KEY; 

    if (!apiKey) {
        return res.status(500).json({ error: 'GEMINI_API_KEY Vercel me nahi mili.' });
    }

    try {
        // Direct Gemini API Endpoint bina kisi external package ke
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        
        const systemPrompt = `You are Biswa AI, a highly advanced personal AI assistant like ChatGPT and Gemini. Answer the user's question, write code, solve math, or give shortcuts professionally. Give your answer clearly. User Query: "${topic}"`;

        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: systemPrompt }] }]
            })
        });

        const data = await response.json();
        
        // Response check karke text nikalna
        if (data.candidates && data.candidates[0].content.parts[0].text) {
            let aiResponse = data.candidates[0].content.parts[0].text;
            
            // Text ko clean karna
            aiResponse = aiResponse.replace(/\*\*/g, ''); 
            
            return res.status(200).json({ result: aiResponse });
        } else {
            return res.status(500).json({ error: 'Gemini API ne sahi data nahi diya. Key check karein.' });
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Server connection me dikkat hai.' });
    }
}

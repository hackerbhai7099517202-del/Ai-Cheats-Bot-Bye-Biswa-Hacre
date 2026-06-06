export default async function handler(req, res) {
    // 1. CORS Headers allow karna taaki frontend request bhej sake
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // 2. Sirf POST request allow karna
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { topic } = req.body;
    if (!topic) {
        return res.status(400).json({ error: 'Sawaal missing hai dost!' });
    }

    // Vercel Settings se aapki Gemini Key uthayega
    const apiKey = process.env.GEMINI_API_KEY; 

    if (!apiKey) {
        return res.status(500).json({ error: 'GEMINI_API_KEY Vercel me set nahi hai.' });
    }

    try {
        // Gemini API ka official endpoint url
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        
        // 🌟 System Niyam: AI ko batana ki woh Biswa AI hai aur har problem solve karega!
        const systemPrompt = `You are Biswa AI, a highly advanced personal AI assistant like ChatGPT and Gemini. Answer the user's question, write code, solve math, or give shortcuts professionally. Give your answer clearly. User Query: "${topic}"`;

        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: systemPrompt }] }]
            })
        });

        const data = await response.json();
        
        // Response check karna aur data nikalna
        if (data.candidates && data.candidates[0].content.parts[0].text) {
            let aiResponse = data.candidates[0].content.parts[0].text;
            
            // Markdown ke extra stars (**) ko clean karne ke liye (Optional)
            aiResponse = aiResponse.replace(/\*\*/g, ''); 
            
            return res.status(200).json({ result: aiResponse });
        } else {
            return res.status(500).json({ error: 'AI response empty ya invalid mila.' });
        }

    } catch (error) {
        console.error("Error details:", error);
        return res.status(500).json({ error: 'Server connection ya API me dikkat hai.' });
    }
}

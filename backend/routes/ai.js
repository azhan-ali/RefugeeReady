const express = require('express');
const router = express.Router();
const axios = require('axios');

// Helper function to call Groq API
const callGroqAPI = async (systemPrompt, userText) => {
    const response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
            model: 'llama3-70b-8192',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userText }
            ],
            temperature: 0.5,
        },
        {
            headers: {
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            }
        }
    );
    return response.data.choices[0].message.content;
};

// @route POST /api/ai/explain-document
// @desc  Explain a German document in the user's target language
router.post('/explain-document', async (req, res) => {
    try {
        const { text, targetLanguage } = req.body;

        if (!text) {
            return res.status(400).json({ error: 'Document text is required' });
        }

        const lang = targetLanguage || 'English';
        const systemPrompt = `You are a helpful assistant for refugees in Germany. The user has provided an official German document. Explain what this document is, what it says, and what actions (if any) the user needs to take. Explain it clearly and simply in ${lang}.`;

        const explanation = await callGroqAPI(systemPrompt, text);

        res.json({ success: true, explanation });
    } catch (error) {
        console.error('Groq API Error (Document):', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to explain document. Please try again later.'
        });
    }
});

// @route POST /api/ai/explain-medicine
// @desc  Explain a German prescription/medicine in the user's target language
router.post('/explain-medicine', async (req, res) => {
    try {
        const { text, targetLanguage } = req.body;

        if (!text) {
            return res.status(400).json({ error: 'Medicine/prescription text is required' });
        }

        const lang = targetLanguage || 'English';
        const systemPrompt = `You are a helpful medical assistant for refugees in Germany. The user has provided text from a German medical prescription or medicine packaging. Explain what the medicine is, what it is typically used for, dosage facts (if present in the text), and important warnings. Explain it clearly and simply in ${lang}. Disclaimer: Always advise the user to consult a healthcare professional.`;

        const explanation = await callGroqAPI(systemPrompt, text);

        res.json({ success: true, explanation });
    } catch (error) {
        console.error('Groq API Error (Medicine):', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to explain medicine. Please try again later.'
        });
    }
});

module.exports = router;

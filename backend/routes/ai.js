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
        const { text, targetLanguage, language } = req.body;

        if (!text) {
            return res.status(400).json({ error: 'Document text is required' });
        }

        const lang = language || targetLanguage || 'English';
        const systemPrompt = `You are a helpful assistant for refugees in Germany. The user has provided an official German document. You must reply strictly in ${lang}, and you MUST reply with a valid JSON object matching this exact structure:
{
  "what_is_it": "Brief explanation of what this document is",
  "what_to_do": "Clear steps on what the user needs to do next",
  "deadline": "Any important deadline mentioned (or 'None mentioned')",
  "warning": "Consequences if missed (or 'None')",
  "address": "Important address/location mentioned (or 'None')"
}
Do not include any other text, only the JSON object.`;

        const explanationStr = await callGroqAPI(systemPrompt, text);

        let explanation;
        try {
            explanation = JSON.parse(explanationStr);
        } catch (e) {
            console.error("Failed to parse AI JSON:", explanationStr);
            explanation = {
                what_is_it: "Could not parse AI response",
                what_to_do: explanationStr, // fallback
                deadline: "",
                warning: "",
                address: ""
            };
        }

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
        const { text, targetLanguage, language } = req.body;

        if (!text) {
            return res.status(400).json({ error: 'Medicine/prescription text is required' });
        }

        const lang = language || targetLanguage || 'English';
        const systemPrompt = `You are a helpful medical assistant for refugees in Germany. The user has provided text from a German medical prescription or medicine packaging. You must reply strictly in ${lang}, and you MUST reply with a valid JSON object matching this exact structure:
{
  "medicines": [
    {
      "name": "Medicine name",
      "treats": "What it treats",
      "dose": "Dose amount",
      "frequency": "How often to take it",
      "timing": "Before or after food?",
      "duration": "For how many days?",
      "warnings": "Important warnings"
    }
  ]
}
Do not include any other text, only the JSON object. Disclaimer: Always advise the user to consult a healthcare professional.`;

        const explanationStr = await callGroqAPI(systemPrompt, text);

        let explanation;
        try {
            explanation = JSON.parse(explanationStr);
        } catch (e) {
            console.error("Failed to parse AI JSON (Medicine):", explanationStr);
            explanation = {
                medicines: [
                    {
                        name: "Raw Output",
                        treats: explanationStr, // fallback
                        dose: "",
                        frequency: "",
                        timing: "",
                        duration: "",
                        warnings: "Could not parse API response perfectly."
                    }
                ]
            };
        }

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

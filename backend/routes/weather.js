const express = require('express');
const router = express.Router();
const axios = require('axios');
const cron = require('node-cron');
const supabase = require('../supabase');

const CITIES = {
    Berlin: { lat: 52.5200, lon: 13.4050 },
    Hamburg: { lat: 53.5511, lon: 9.9937 },
    Munich: { lat: 48.1371, lon: 11.5754 }
};

// Check weather every hour using node-cron
cron.schedule('0 * * * *', async () => {
    console.log('Running hourly weather cron job...');
    try {
        for (const [city, coords] of Object.entries(CITIES)) {
            const resp = await axios.get(
                `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current_weather=true`
            );

            const temp = resp.data.current_weather.temperature;
            let alertMsg = null;

            if (temp <= 0) {
                alertMsg = "Freezing temperatures! Seek shelter immediately. Find warm places on the map.";
            } else if (temp <= 5) {
                alertMsg = "Very cold weather. Dress warmly and find a warm place if you are outside.";
            }

            if (alertMsg) {
                // Log to Supabase winter_alerts table
                const { error } = await supabase
                    .from('winter_alerts')
                    .insert([
                        {
                            city: city,
                            temperature: temp,
                            alert_message: alertMsg,
                            created_at: new Date()
                        }
                    ]);

                if (error) {
                    console.error(`Error saving winter alert for ${city} via Supabase:`, error.message);
                } else {
                    console.log(`Saved winter alert for ${city}. Temp: ${temp}C`);
                }
            }
        }
    } catch (error) {
        console.error('Weather cron job failed with error:', error.message);
    }
});

// @route GET /api/weather/alert
// @desc  Get the most recent winter alert for a city
// @query ?city=Berlin
router.get('/alert', async (req, res) => {
    try {
        const { city } = req.query;

        if (!city || !CITIES[city]) {
            return res.status(400).json({
                success: false,
                error: `Please provide a valid city query. Options: ${Object.keys(CITIES).join(', ')}`
            });
        }

        // Get the latest alert for the requested city
        const { data, error } = await supabase
            .from('winter_alerts')
            .select('*')
            .eq('city', city)
            .order('created_at', { ascending: false })
            .limit(1);

        if (error) throw error;

        res.json({
            success: true,
            alert: data.length > 0 ? data[0] : null
        });
    } catch (error) {
        console.error('Weather alert GET error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch winter alerts' });
    }
});

module.exports = router;

require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors({
    origin: [
        'http://localhost:5173',
        process.env.FRONTEND_URL
    ].filter(Boolean)
}));
app.use(express.json());

// Import routes
const aiRoutes = require('./routes/ai');
const weatherRoutes = require('./routes/weather');
const bedsRoutes = require('./routes/beds');
const foodRoutes = require('./routes/food');

// Mount routes
app.use('/api/ai', aiRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/beds', bedsRoutes);
app.use('/api/food', foodRoutes);

// Health check endpoint
app.get('/', (req, res) => {
    res.send('RefugeeReady API is running');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

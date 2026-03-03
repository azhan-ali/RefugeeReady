const express = require('express');
const router = express.Router();

// In-memory store that persists as long as the server is running
// This works even without a database, perfect for demo
let foodStore = [];
let nextId = 1;

// @route GET /api/food
router.get('/', (req, res) => {
    // Return non-claimed listings only, newest first
    const active = foodStore.filter(f => !f.claimed).reverse();
    res.json({ success: true, food: active });
});

// @route POST /api/food
router.post('/', (req, res) => {
    try {
        const { title, business_name, description, food_items, location, address, pickup_time, available_time_window, halal, vegan, total_count, contact_phone } = req.body;

        const newListing = {
            id: String(nextId++),
            title: title || business_name || 'Food Listing',
            business_name: business_name || title || '',
            description: description || food_items || '',
            food_items: food_items || description || '',
            location: location || address || '',
            address: address || location || '',
            pickup_time: pickup_time || available_time_window || '',
            halal: halal || false,
            vegan: vegan || false,
            total_count: total_count || 1,
            contact_phone: contact_phone || '',
            claimed: false,
            created_at: new Date().toISOString()
        };

        foodStore.push(newListing);
        console.log(`✅ Food listing added: ${newListing.title} at ${newListing.location}`);
        res.json({ success: true, food: newListing });
    } catch (error) {
        console.error('Food POST error:', error);
        res.status(500).json({ success: false, error: 'Failed to add food listing' });
    }
});

// @route PATCH /api/food/:id/claim
router.patch('/:id/claim', (req, res) => {
    const item = foodStore.find(f => f.id === req.params.id);
    if (!item) return res.status(404).json({ success: false, error: 'Food listing not found' });
    item.claimed = true;
    res.json({ success: true, food: item });
});

// @route DELETE /api/food/:id
router.delete('/:id', (req, res) => {
    const before = foodStore.length;
    foodStore = foodStore.filter(f => f.id !== req.params.id);
    if (foodStore.length === before) {
        return res.status(404).json({ success: false, error: 'Not found' });
    }
    res.json({ success: true, message: 'Deleted successfully' });
});

module.exports = router;

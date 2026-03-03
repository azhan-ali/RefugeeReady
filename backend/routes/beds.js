const express = require('express');
const router = express.Router();

// In-memory bed store — works without any database
let bedStore = [];
let nextId = 1;

// @route GET /api/beds
router.get('/', (req, res) => {
    const active = bedStore.filter(b => b.available !== false).reverse();
    res.json({ success: true, beds: active });
});

// @route POST /api/beds
router.post('/', (req, res) => {
    try {
        const { location, capacity, contact_info, notes, available } = req.body;

        const newBed = {
            id: String(nextId++),
            location: location || '',
            capacity: Number(capacity) || 1,
            contact_info: contact_info || '',
            notes: notes || '',
            available: available !== false,
            created_at: new Date().toISOString()
        };

        bedStore.push(newBed);
        console.log(`✅ Bed listing added: ${newBed.location} (${newBed.capacity} beds)`);
        res.json({ success: true, bed: newBed });
    } catch (error) {
        console.error('Beds POST error:', error);
        res.status(500).json({ success: false, error: 'Failed to add bed' });
    }
});

// @route DELETE /api/beds/:id
router.delete('/:id', (req, res) => {
    const before = bedStore.length;
    bedStore = bedStore.filter(b => b.id !== req.params.id);
    if (bedStore.length === before) {
        return res.status(404).json({ success: false, error: 'Bed listing not found' });
    }
    res.json({ success: true, deleted: true });
});

module.exports = router;

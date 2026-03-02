const express = require('express');
const router = express.Router();
const supabase = require('../supabase');

// @route GET /api/beds
// @desc  Get a list of available beds
router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('beds')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json({ success: true, beds: data });
    } catch (error) {
        console.error('Beds GET error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch beds' });
    }
});

// @route POST /api/beds
// @desc  Add a new bed listing
router.post('/', async (req, res) => {
    try {
        const { location, capacity, contact_info, available } = req.body;

        // Default available to true if undefined
        const isAvailable = available !== undefined ? available : true;

        const { data, error } = await supabase
            .from('beds')
            .insert([
                { location, capacity, contact_info, available: isAvailable }
            ])
            .select();

        if (error) throw error;
        res.json({ success: true, bed: data[0] });
    } catch (error) {
        console.error('Beds POST error:', error);
        res.status(500).json({ success: false, error: 'Failed to add bed' });
    }
});

// @route DELETE /api/beds/:id
// @desc  Delete a bed listing by ID
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabase
            .from('beds')
            .delete()
            .eq('id', id)
            .select();

        if (error) throw error;

        if (!data || data.length === 0) {
            return res.status(404).json({ success: false, error: 'Bed listing not found' });
        }

        res.json({ success: true, deleted: data[0] });
    } catch (error) {
        console.error('Beds DELETE error:', error);
        res.status(500).json({ success: false, error: 'Failed to delete bed' });
    }
});

module.exports = router;

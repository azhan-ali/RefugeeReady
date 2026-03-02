const express = require('express');
const router = express.Router();
const supabase = require('../supabase');

// @route GET /api/food
// @desc  Get food listings
router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('food')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json({ success: true, food: data });
    } catch (error) {
        console.error('Food GET error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch food listings' });
    }
});

// @route POST /api/food
// @desc  Create a new food listing
router.post('/', async (req, res) => {
    try {
        const { title, description, location, pickup_time } = req.body;

        const { data, error } = await supabase
            .from('food')
            .insert([
                { title, description, location, pickup_time, claimed: false }
            ])
            .select();

        if (error) throw error;
        res.json({ success: true, food: data[0] });
    } catch (error) {
        console.error('Food POST error:', error);
        res.status(500).json({ success: false, error: 'Failed to add food listing' });
    }
});

// @route PATCH /api/food/:id/claim
// @desc  Mark a food listing as claimed
router.patch('/:id/claim', async (req, res) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabase
            .from('food')
            .update({ claimed: true })
            .eq('id', id)
            .select();

        if (error) throw error;

        if (!data || data.length === 0) {
            return res.status(404).json({ success: false, error: 'Food listing not found' });
        }

        res.json({ success: true, food: data[0] });
    } catch (error) {
        console.error('Food PATCH error:', error);
        res.status(500).json({ success: false, error: 'Failed to claim food' });
    }
});

// @route DELETE /api/food/:id
// @desc  Delete a food listing (mark as gone)
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase
            .from('food')
            .delete()
            .eq('id', id);

        if (error) throw error;
        res.json({ success: true, message: 'Deleted successfully' });
    } catch (error) {
        console.error('Food DELETE error:', error);
        res.status(500).json({ success: false, error: 'Failed to delete food listing' });
    }
});

module.exports = router;

const express = require('express');
const pool = require('../config/db');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// GET /api/referrals
router.get('/referrals', authMiddleware, async (req, res) => {
    try {
        const referrals = await pool.query(
            'SELECT u.username, u.email, r.date_referred, r.status FROM referrals r JOIN users u ON r.referred_user_id = u.id WHERE r.referrer_id = $1',
            [req.user.id]
        );
        res.json(referrals.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/referral-stats
router.get('/referral-stats', authMiddleware, async (req, res) => {
    try {
        const stats = await pool.query(
            'SELECT COUNT(*) as total, SUM(CASE WHEN status = \'successful\' THEN 1 ELSE 0 END) as successful FROM referrals WHERE referrer_id = $1',
            [req.user.id]
        );
        res.json(stats.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
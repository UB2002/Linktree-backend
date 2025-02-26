const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const pool = require('../config/db');
const router = express.Router();

// Email transporter setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// POST /api/register
router.post('/register', async (req, res) => {
    const { email, username, password, referral_code } = req.body;

    try {
        // Input validation
        if (!email || !username || !password) return res.status(400).json({ error: 'All fields are required' });
        if (!/\S+@\S+\.\S+/.test(email)) return res.status(400).json({ error: 'Invalid email format' });
        if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });

        // Check for duplicates
        const userCheck = await pool.query(
            'SELECT * FROM users WHERE email = $1 OR username = $2',
            [email, username]
        );
        if (userCheck.rows.length > 0) return res.status(400).json({ error: 'Email or username already in use' });

        // Hash password
        const password_hash = await bcrypt.hash(password, 10);

        // Generate unique referral code
        const referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();

        // Handle referral
        let referred_by = null;
        if (referral_code) {
            const referrer = await pool.query('SELECT id FROM users WHERE referral_code = $1', [referral_code]);
            if (referrer.rows.length === 0) return res.status(400).json({ error: 'Invalid referral code' });
            referred_by = referrer.rows[0].id;
        }

        // Insert user
        const newUser = await pool.query(
            'INSERT INTO users (username, email, password_hash, referral_code, referred_by) VALUES ($1, $2, $3, $4, $5) RETURNING id, username, email, referral_code',
            [username, email, password_hash, referralCode, referred_by]
        );

        // Record referral if applicable
        if (referred_by) {
            await pool.query(
                'INSERT INTO referrals (referrer_id, referred_user_id, status) VALUES ($1, $2, $3)',
                [referred_by, newUser.rows[0].id, 'successful']
            );
        }

        // Generate JWT
        const token = jwt.sign({ id: newUser.rows[0].id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
        res.status(201).json(newUser.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (user.rows.length === 0) return res.status(400).json({ error: 'Invalid credentials' });

        const validPassword = await bcrypt.compare(password, user.rows[0].password_hash);
        if (!validPassword) return res.status(400).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ id: user.rows[0].id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
        res.json({ message: 'Logged in successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
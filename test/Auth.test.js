const request = require('supertest');
const app = require('../server');
const pool = require('../config/db');

describe('Auth API', () => {
    beforeAll(async () => {
        await pool.query('DELETE FROM referrals');
        await pool.query('DELETE FROM users');
    });

    afterAll(async () => {
        await pool.end();
    });

    it('should register a new user', async () => {
        const res = await request(app)
            .post('/api/register')
            .send({ email: 'test@example.com', username: 'testuser', password: 'password123' });
        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('referral_code');
    });

    it('should reject duplicate email', async () => {
        const res = await request(app)
            .post('/api/register')
            .send({ email: 'test@example.com', username: 'testuser2', password: 'password123' });
        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe('Email or username already in use');
    });

    it('should login successfully', async () => {
        const res = await request(app)
            .post('/api/login')
            .send({ email: 'test@example.com', password: 'password123' });
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('Logged in successfully');
    });

    
});
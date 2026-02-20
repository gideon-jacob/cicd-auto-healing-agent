import request from 'supertest';
import app from '../app';

describe('Health Check Endpoints', () => {
    it('GET / should return API info', async () => {
        const res = await request(app).get('/');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('name', 'CI/CD Auto-Healing Agent API');
        expect(res.body).toHaveProperty('version');
    });

    it('GET /api/health should return healthy status', async () => {
        const res = await request(app).get('/api/health');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('status', 'healthy');
        expect(res.body).toHaveProperty('timestamp');
    });
});

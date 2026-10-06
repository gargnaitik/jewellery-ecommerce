jest.mock('../src/config/redis', () => require('./helpers/fakeRedis').createFakeRedis());
jest.mock('../src/config/db', () => ({
    sequelize: { authenticate: jest.fn().mockResolvedValue(), define: jest.fn() },
}));
jest.mock('../src/modules/users/user.model', () => ({ findOne: jest.fn().mockResolvedValue(null) }));
jest.mock('../src/modules/orders/order.model', () => ({}));
jest.mock('../src/modules/orders/orderItem.model', () => ({}));
jest.mock('../src/modules/payments/payment.model', () => ({}));
jest.mock('../src/modules/products/product.model', () => ({}));

process.env.CLIENT_URL = 'https://shop.example.com';
process.env.JWT_SECRET = 'test_jwt_secret';

const request = require('supertest');
const redis = require('../src/config/redis');
const app = require('../src/app');

beforeEach(() => redis.reset());

describe('app', () => {
    it('returns JSON 404 for unknown routes', async () => {
        const res = await request(app).get('/api/nope');
        expect(res.status).toBe(404);
        expect(res.body).toEqual({ success: false, message: 'Route GET /api/nope not found' });
    });

    it('sends security headers from helmet', async () => {
        const res = await request(app).get('/api/nope');
        expect(res.headers['x-content-type-options']).toBe('nosniff');
    });

    it('allows the configured frontend origin and no other', async () => {
        const allowed = await request(app).get('/api/nope').set('Origin', 'https://shop.example.com');
        const blocked = await request(app).get('/api/nope').set('Origin', 'https://evil.example.com');

        expect(allowed.headers['access-control-allow-origin']).toBe('https://shop.example.com');
        expect(blocked.headers['access-control-allow-origin']).toBeUndefined();
    });

    it('rate limits auth endpoints after 20 requests', async () => {
        const login = () => request(app).post('/api/auth/login').send({ email: 'a@b.com', password: 'x' });

        for (let i = 0; i < 20; i += 1) {
            const res = await login();
            expect(res.status).toBe(401);
        }
        const limited = await login();
        expect(limited.status).toBe(429);
        expect(limited.headers['retry-after']).toBe('900');
    });

    it('rejects protected routes without a token', async () => {
        const res = await request(app).get('/api/auth/me');
        expect(res.status).toBe(401);
    });

    it('locks the gold-rate cache refresh to admins', async () => {
        const res = await request(app).post('/api/pricing/refresh');
        expect(res.status).toBe(401);
    });
});

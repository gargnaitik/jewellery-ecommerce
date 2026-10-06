const crypto = require('crypto');

jest.mock('../src/config/redis', () => require('./helpers/fakeRedis').createFakeRedis());
jest.mock('../src/modules/users/user.model', () => ({
    findOne: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
}));
jest.mock('../src/modules/notifications/email.service', () => ({
    sendVerificationEmail: jest.fn(),
    sendForgotPasswordOTPEmail: jest.fn(),
}));

const redis = require('../src/config/redis');
const User = require('../src/modules/users/user.model');
const { sendVerificationEmail } = require('../src/modules/notifications/email.service');
const auth = require('../src/modules/auth/auth.service');

const makeUser = (overrides = {}) => {
    const user = {
        id: 'user-1',
        name: 'Asha',
        email: 'asha@example.com',
        phone: null,
        role: 'customer',
        is_verified: false,
        ...overrides,
    };
    user.update = jest.fn(async (changes) => Object.assign(user, changes));
    return user;
};

// pull the raw token out of the link that was "emailed"
const tokenFromLastEmail = () => {
    const { link } = sendVerificationEmail.mock.calls.at(-1)[0];
    return new URL(link).searchParams.get('token');
};

beforeAll(() => {
    process.env.JWT_SECRET = 'test_jwt_secret';
    process.env.FRONTEND_URL = 'https://shop.example.com';
});

beforeEach(() => {
    redis.reset();
    jest.clearAllMocks();
});

describe('signup', () => {
    it('creates an unverified user and emails a verification link', async () => {
        const user = makeUser();
        User.findOne.mockResolvedValue(null);
        User.create.mockResolvedValue(user);

        const result = await auth.registerWithEmail({
            name: 'Asha',
            email: '  Asha@Example.com ',
            password: 'secret123',
            phone: '',
        });

        expect(User.create).toHaveBeenCalledWith(expect.objectContaining({
            email: 'asha@example.com',   // normalised
            phone: null,                 // empty string would clash on the unique index
            is_verified: false,
        }));
        expect(result.user.is_verified).toBe(false);
        expect(result.token).toEqual(expect.any(String));
        expect(sendVerificationEmail).toHaveBeenCalledTimes(1);
    });

    it('stores only the SHA-256 hash of the token, with a 24h TTL', async () => {
        User.findOne.mockResolvedValue(null);
        User.create.mockResolvedValue(makeUser());

        await auth.registerWithEmail({ name: 'Asha', email: 'asha@example.com', password: 'secret123' });

        const token = tokenFromLastEmail();
        const expectedKey = `email_verify:${crypto.createHash('sha256').update(token).digest('hex')}`;

        expect(token).toMatch(/^[0-9a-f]{64}$/);              // 256-bit random token
        expect([...redis.store.keys()]).toEqual([expectedKey]); // raw token never stored
        expect(redis.ttls.get(expectedKey)).toBe(24 * 60 * 60);
    });

    it('hashes passwords with 12 bcrypt rounds', async () => {
        User.findOne.mockResolvedValue(null);
        User.create.mockResolvedValue(makeUser());

        await auth.registerWithEmail({ name: 'Asha', email: 'asha@example.com', password: 'secret123' });

        const { password_hash } = User.create.mock.calls[0][0];
        expect(password_hash).toMatch(/^\$2[aby]\$12\$/);
    });
});

describe('verifyEmail', () => {
    it('verifies the user and makes the link single-use', async () => {
        const user = makeUser();
        User.findOne.mockResolvedValue(null);
        User.create.mockResolvedValue(user);
        User.findByPk.mockResolvedValue(user);

        await auth.registerWithEmail({ name: 'Asha', email: 'asha@example.com', password: 'secret123' });
        const token = tokenFromLastEmail();

        const result = await auth.verifyEmail(token);
        expect(result.user.is_verified).toBe(true);
        expect(user.update).toHaveBeenCalledWith({ is_verified: true });

        await expect(auth.verifyEmail(token)).rejects.toThrow('invalid or has expired');
    });

    it('rejects unknown or missing tokens', async () => {
        await expect(auth.verifyEmail('a'.repeat(64))).rejects.toThrow('invalid or has expired');
        await expect(auth.verifyEmail(undefined)).rejects.toThrow('token is required');
    });
});

describe('resendEmailVerification', () => {
    it('allows 3 emails per hour, then refuses', async () => {
        const user = makeUser();

        for (let i = 0; i < 3; i += 1) {
            await expect(auth.resendEmailVerification(user)).resolves.toBeTruthy();
        }
        await expect(auth.resendEmailVerification(user)).rejects.toThrow('Too many verification emails');
        expect(sendVerificationEmail).toHaveBeenCalledTimes(3);
    });

    it('refuses for an already verified account', async () => {
        await expect(auth.resendEmailVerification(makeUser({ is_verified: true })))
            .rejects.toThrow('already verified');
    });
});

describe('login', () => {
    it('gives the generic error for phone-only accounts with no password', async () => {
        User.findOne.mockResolvedValue(makeUser({ email: 'asha@example.com', password_hash: null }));

        await expect(auth.loginWithEmail({ email: 'ASHA@example.com', password: 'whatever' }))
            .rejects.toThrow('Invalid email or password');
        expect(User.findOne).toHaveBeenCalledWith({ where: { email: 'asha@example.com' } });
    });
});

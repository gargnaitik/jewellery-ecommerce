const crypto = require('crypto');

jest.mock('../src/modules/payments/payment.model', () => ({ update: jest.fn() }));
jest.mock('../src/modules/orders/order.model', () => ({ findByPk: jest.fn() }));
jest.mock('../src/modules/orders/orderItem.model', () => ({}));
jest.mock('../src/modules/users/user.model', () => ({}));
jest.mock('../src/modules/notifications/notification.service', () => ({
    notifyPaymentFailed: jest.fn(),
    notifyOrderPlaced: jest.fn(),
}));

const Order = require('../src/modules/orders/order.model');
const Payment = require('../src/modules/payments/payment.model');
const { isValidSignature, verifyPayment } = require('../src/modules/payments/payment.service');

const SECRET = 'test_secret';
const sign = (orderId, paymentId) =>
    crypto.createHmac('sha256', SECRET).update(`${orderId}|${paymentId}`).digest('hex');

beforeAll(() => { process.env.RAZORPAY_KEY_SECRET = SECRET; });
beforeEach(() => jest.clearAllMocks());

describe('isValidSignature', () => {
    it('accepts the HMAC-SHA256 Razorpay signs', () => {
        expect(isValidSignature('order_1', 'pay_1', sign('order_1', 'pay_1'))).toBe(true);
    });

    it('rejects a signature for a different payment', () => {
        expect(isValidSignature('order_1', 'pay_2', sign('order_1', 'pay_1'))).toBe(false);
    });

    it('rejects malformed signatures without throwing', () => {
        expect(isValidSignature('order_1', 'pay_1', 'short')).toBe(false);
        expect(isValidSignature('order_1', 'pay_1', undefined)).toBe(false);
    });
});

describe('verifyPayment', () => {
    const order = {
        id: 'ord-uuid',
        user_id: 'user-1',
        razorpay_order_id: 'order_rzp_1',
        payment_status: 'pending',
    };

    it('rejects a payment made for a different Razorpay order', async () => {
        Order.findByPk.mockResolvedValue(order);

        await expect(verifyPayment({
            razorpay_order_id: 'order_rzp_cheap',
            razorpay_payment_id: 'pay_1',
            razorpay_signature: sign('order_rzp_cheap', 'pay_1'),  // valid, but for another order
            orderId: 'ord-uuid',
            userId: 'user-1',
        })).rejects.toThrow('Payment does not match this order');

        expect(Payment.update).not.toHaveBeenCalled();
    });

    it('rejects verifying someone else\'s order', async () => {
        Order.findByPk.mockResolvedValue(order);

        await expect(verifyPayment({
            razorpay_order_id: 'order_rzp_1',
            razorpay_payment_id: 'pay_1',
            razorpay_signature: sign('order_rzp_1', 'pay_1'),
            orderId: 'ord-uuid',
            userId: 'attacker',
        })).rejects.toThrow('Not authorized');
    });

    it('is idempotent for an order that is already paid', async () => {
        Order.findByPk.mockResolvedValue({ ...order, payment_status: 'paid' });

        const result = await verifyPayment({
            razorpay_order_id: 'order_rzp_1',
            razorpay_payment_id: 'pay_1',
            razorpay_signature: sign('order_rzp_1', 'pay_1'),
            orderId: 'ord-uuid',
            userId: 'user-1',
        });

        expect(result.message).toBe('Payment already verified');
        expect(Payment.update).not.toHaveBeenCalled();
    });

    it('marks the payment failed on a bad signature', async () => {
        Order.findByPk.mockResolvedValue(order);

        await expect(verifyPayment({
            razorpay_order_id: 'order_rzp_1',
            razorpay_payment_id: 'pay_1',
            razorpay_signature: 'f'.repeat(64),
            orderId: 'ord-uuid',
            userId: 'user-1',
        })).rejects.toThrow('Invalid signature');

        expect(Payment.update).toHaveBeenCalledWith(
            { status: 'failed' },
            { where: { razorpay_order_id: 'order_rzp_1' } }
        );
    });
});

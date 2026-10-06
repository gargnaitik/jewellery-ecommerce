jest.mock('../src/config/db', () => ({
    sequelize: { transaction: jest.fn() },
}));
jest.mock('../src/modules/orders/order.model', () => ({ create: jest.fn(), findByPk: jest.fn() }));
jest.mock('../src/modules/orders/orderItem.model', () => ({ bulkCreate: jest.fn() }));
jest.mock('../src/modules/users/user.model', () => ({}));
jest.mock('../src/modules/notifications/notification.service', () => ({}));
jest.mock('../src/modules/products/product.model', () => ({
    findById: jest.fn(),
    findOneAndUpdate: jest.fn(),
    findByIdAndUpdate: jest.fn(),
}));
jest.mock('../src/modules/pricing/pricing.service', () => {
    const actual = jest.requireActual('../src/modules/pricing/pricing.service');
    return {
        ...actual,
        getAllGoldRates: jest.fn(async () => ({
            '22K': { rate_per_gram: 6870, source: 'api' },
            '18K': { rate_per_gram: 5625, source: 'api' },
        })),
    };
});
jest.mock('../src/config/redis', () => require('./helpers/fakeRedis').createFakeRedis());

const Product = require('../src/modules/products/product.model');
const Order = require('../src/modules/orders/order.model');
const { sequelize } = require('../src/config/db');
const { createOrder } = require('../src/modules/orders/order.service');

const product = (id, overrides = {}) => ({
    _id: id,
    name: `Piece ${id}`,
    sku: `SKU-${id}`,
    metal_type: 'gold',
    karat: 22,
    net_weight: 5,
    making_charges: 2000,
    stones: [],
    is_active: true,
    stock: 3,
    ...overrides,
});

const address = { name: 'Asha', phone: '9876543210', city: 'Gwalior' };

beforeEach(() => jest.clearAllMocks());

describe('createOrder', () => {
    it('rejects quantities that are not whole numbers from 1 to 10', async () => {
        for (const quantity of [0, -2, 1.5, 11, '2']) {
            await expect(createOrder({
                userId: 'u1',
                items: [{ product_id: 'p1', quantity }],
                shipping_address: address,
            })).rejects.toThrow('Quantity must be a whole number');
        }
        expect(Product.findOneAndUpdate).not.toHaveBeenCalled();
    });

    it('reserves stock with a single conditional update', async () => {
        Product.findById.mockResolvedValue(product('p1'));
        Product.findOneAndUpdate.mockResolvedValue(product('p1', { stock: 1 }));
        sequelize.transaction.mockImplementation(async (fn) => fn({}));
        Order.create.mockResolvedValue({ id: 'ord-1' });
        Order.findByPk.mockResolvedValue({ id: 'ord-1', items: [] });

        await createOrder({ userId: 'u1', items: [{ product_id: 'p1', quantity: 2 }], shipping_address: address });

        expect(Product.findOneAndUpdate).toHaveBeenCalledWith(
            { _id: 'p1', is_active: true, stock: { $gte: 2 } },
            { $inc: { stock: -2 } },
            { new: true }
        );
    });

    it('charges the same total the pricing engine computes', async () => {
        Product.findById.mockResolvedValue(product('p1'));
        Product.findOneAndUpdate.mockResolvedValue(product('p1'));
        sequelize.transaction.mockImplementation(async (fn) => fn({}));
        Order.create.mockResolvedValue({ id: 'ord-1' });
        Order.findByPk.mockResolvedValue({ id: 'ord-1', items: [] });

        await createOrder({ userId: 'u1', items: [{ product_id: 'p1', quantity: 1 }], shipping_address: address });

        // 5g × 6870 + 2000 making = 36,350; GST 1,091 (3%, rounded)
        expect(Order.create).toHaveBeenCalledWith(
            expect.objectContaining({ subtotal: 36350, gst_amount: 1091, total_amount: 37441 }),
            expect.anything()
        );
    });

    it('releases stock already reserved when a later item is out of stock', async () => {
        Product.findById.mockImplementation(async (id) => product(id));
        Product.findOneAndUpdate
            .mockResolvedValueOnce(product('p1'))   // p1 reserved
            .mockResolvedValueOnce(null);           // p2 short

        await expect(createOrder({
            userId: 'u1',
            items: [{ product_id: 'p1', quantity: 1 }, { product_id: 'p2', quantity: 2 }],
            shipping_address: address,
        })).rejects.toThrow('Insufficient stock for Piece p2');

        expect(Product.findByIdAndUpdate).toHaveBeenCalledWith('p1', { $inc: { stock: 1 } });
        expect(sequelize.transaction).not.toHaveBeenCalled();
    });

    it('releases stock when the Postgres transaction fails', async () => {
        Product.findById.mockResolvedValue(product('p1'));
        Product.findOneAndUpdate.mockResolvedValue(product('p1'));
        sequelize.transaction.mockRejectedValue(new Error('connection lost'));

        await expect(createOrder({
            userId: 'u1',
            items: [{ product_id: 'p1', quantity: 2 }],
            shipping_address: address,
        })).rejects.toThrow('connection lost');

        expect(Product.findByIdAndUpdate).toHaveBeenCalledWith('p1', { $inc: { stock: 2 } });
    });
});

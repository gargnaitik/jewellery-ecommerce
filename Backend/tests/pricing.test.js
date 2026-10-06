jest.mock('../src/config/redis', () => require('./helpers/fakeRedis').createFakeRedis());
jest.mock('../src/modules/products/product.model', () => ({}));
jest.mock('axios');

const axios = require('axios');
const redis = require('../src/config/redis');
const pricing = require('../src/modules/pricing/pricing.service');

const RATES = {
    '24K': { rate_per_gram: 7500 },
    '22K': { rate_per_gram: 6870 },
    '18K': { rate_per_gram: 5625 },
    '14K': { rate_per_gram: 4375 },
};

describe('computePrice', () => {
    it('adds gold value, making charges, stones and 3% GST', () => {
        const price = pricing.computePrice({
            net_weight: 10,
            goldRate: 6870,
            making_charges: 5000,
            stone_value: 2000,
        });

        expect(price).toEqual({
            gold_value: 68700,
            making_charges: 5000,
            stone_value: 2000,
            subtotal: 75700,
            gst_amount: 2271,      // 3% of 75,700
            final_price: 77971,
        });
    });

    it('charges exactly unit price × quantity, even when a unit rounds', () => {
        // 4.5g × 5625 = 25,312.50 — rounding after multiplying would be ₹1 off
        const one = pricing.computePrice({ net_weight: 4.5, goldRate: 5625, making_charges: 1200, quantity: 1 });
        const three = pricing.computePrice({ net_weight: 4.5, goldRate: 5625, making_charges: 1200, quantity: 3 });

        expect(three.gold_value).toBe(one.gold_value * 3);
        expect(three.gst_amount).toBe(one.gst_amount * 3);
        expect(three.final_price).toBe(one.final_price * 3);
    });

    it('rounds to whole rupees', () => {
        const price = pricing.computePrice({ net_weight: 1.234, goldRate: 6870 });
        expect(Number.isInteger(price.gold_value)).toBe(true);
        expect(Number.isInteger(price.gst_amount)).toBe(true);
    });
});

describe('priceProduct', () => {
    const ring = {
        metal_type: 'gold',
        karat: 18,
        net_weight: 2,
        making_charges: 1000,
        stones: [{ price: 500 }, { price: 250 }],
    };

    it('uses the rate for the product\'s own karat', () => {
        const price = pricing.priceProduct(ring, RATES);
        expect(price.gold_rate).toBe(5625);
        expect(price.gold_value).toBe(11250);
        expect(price.stone_value).toBe(750);
    });

    it('prices non-gold metals from making charges and stones only', () => {
        const silver = { ...ring, metal_type: 'silver', karat: undefined };
        const price = pricing.priceProduct(silver, RATES);
        expect(price.gold_rate).toBe(0);
        expect(price.gold_value).toBe(0);
        expect(price.subtotal).toBe(1750);
    });

    it('refuses to price gold without a known karat rate', () => {
        expect(() => pricing.priceProduct({ ...ring, karat: 9 }, RATES)).toThrow('No gold rate');
    });
});

describe('ratesFromPure', () => {
    it('derives every karat from the 24K price by purity', () => {
        const rates = pricing.ratesFromPure(10000, 'api');
        expect(rates['24K'].rate_per_gram).toBe(10000);
        expect(rates['22K'].rate_per_gram).toBe(9160);
        expect(rates['18K'].rate_per_gram).toBe(7500);
        expect(rates['14K'].rate_per_gram).toBe(5830);
    });
});

describe('getAllGoldRates', () => {
    beforeEach(() => {
        redis.reset();
        axios.get.mockReset();
    });

    it('makes one API call for all karats and caches the result', async () => {
        axios.get.mockResolvedValue({ data: { price: 31103.5 * 7 } }); // ₹7000/gram 24K

        const first = await pricing.getAllGoldRates();
        const second = await pricing.getAllGoldRates();

        expect(axios.get).toHaveBeenCalledTimes(1);
        expect(first['24K']).toEqual({ rate_per_gram: 7000, source: 'api' });
        expect(second['22K'].source).toBe('cache');
        expect(redis.ttls.get('gold_rates')).toBe(900);
    });

    it('falls back to static rates when the API is down', async () => {
        axios.get.mockRejectedValue(new Error('timeout'));
        jest.spyOn(console, 'error').mockImplementation(() => {});

        const rates = await pricing.getAllGoldRates();

        expect(rates['22K']).toEqual({ rate_per_gram: 6870, source: 'fallback' });
        expect(redis.store.has('gold_rates')).toBe(false);  // never cache a fallback
    });
});

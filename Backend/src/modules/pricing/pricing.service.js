const axios = require('axios');
const redis = require('../../config/redis');
const Product = require('../products/product.model');

// ─── Gold rate constants ──────────────────────────────
// how long a fetched rate is trusted — also how often product prices are
// recomputed. goldapi.io's free plan is ~100 requests/month, so raise this
// (e.g. 21600 = 6h) when running on the free tier
const GOLD_RATE_TTL = parseInt(process.env.GOLD_RATE_TTL_SECONDS, 10) || 900;  // 15 minutes
const GST_RATE = 0.03;  // 3% GST on jewellery
const GOLD_RATES_CACHE_KEY = 'gold_rates';
const TROY_OUNCE_GRAMS = 31.1035;

// ─── Karat purity multipliers ────────────────────────
// 24K is pure gold (100%)
// 22K is 91.6% pure, 18K is 75% pure, etc.
const KARAT_PURITY = {
    24: 1.000,
    22: 0.916,
    18: 0.750,
    14: 0.583,
};

// hardcoded fallback rates (₹/gram) — used only when the live API is down
const FALLBACK_RATES = {
    24: 7500,
    22: 6870,
    18: 5625,
    14: 4375,
};

// ─── Price breakdown for a piece of jewellery ─────────
// pure function — the single source of truth for the pricing formula,
// shared by the price API, stored product prices and checkout
const computePrice = ({
    net_weight,
    goldRate,
    making_charges = 0,
    stone_value = 0,
    quantity = 1,
}) => {
    // price one unit in whole rupees first, then multiply — so the checkout
    // total always equals the listed unit price × quantity
    const goldValue = Math.round(net_weight * goldRate);
    const makingCharges = Math.round(making_charges);
    const stoneValue = Math.round(stone_value);
    const subtotal = goldValue + makingCharges + stoneValue;
    const gst = Math.round(subtotal * GST_RATE);

    return {
        gold_value: goldValue * quantity,
        making_charges: makingCharges * quantity,
        stone_value: stoneValue * quantity,
        subtotal: subtotal * quantity,
        gst_amount: gst * quantity,
        final_price: (subtotal + gst) * quantity,
    };
};

// sum of all gemstone/diamond prices on a product
const stoneTotal = (stones = []) =>
    stones.reduce((total, stone) => total + (stone.price || 0), 0);

// gold is priced by weight × karat rate; other metals carry their
// value in making charges and stones
const goldRateForProduct = (product, rates) => {
    if (product.metal_type !== 'gold') return 0;
    const rate = rates[`${product.karat}K`]?.rate_per_gram;
    if (!rate) throw new Error(`No gold rate available for ${product.karat}K`);
    return rate;
};

// price of one product (or `quantity` of it) at the given rates
const priceProduct = (product, rates, quantity = 1) => {
    const goldRate = goldRateForProduct(product, rates);
    return {
        gold_rate: goldRate,
        ...computePrice({
            net_weight: product.net_weight || 0,
            goldRate,
            making_charges: product.making_charges,
            stone_value: stoneTotal(product.stones),
            quantity,
        }),
    };
};

// turn a 24K ₹/gram price into rates for every karat
const ratesFromPure = (pricePerGram24K, source) =>
    Object.fromEntries(Object.entries(KARAT_PURITY).map(([karat, purity]) => [
        `${karat}K`,
        { rate_per_gram: Math.round(pricePerGram24K * purity), source },
    ]));

// ─── Fetch live gold rates for all karats ─────────────
// one API call covers every karat (they only differ by purity)
const getAllGoldRates = async () => {

    // Step 1 — check Redis cache first
    try {
        const cached = await redis.get(GOLD_RATES_CACHE_KEY);
        if (cached) {
            const rates = JSON.parse(cached);
            for (const r of Object.values(rates)) r.source = 'cache';
            return rates;
        }
    } catch (err) {
        console.error('Redis error:', err.message);
        // if Redis fails, continue to API
    }

    // Step 2 — not in cache, fetch from API
    try {
        // Using goldapi.io — free tier available
        // Replace with MCX API in production
        const response = await axios.get('https://www.goldapi.io/api/XAU/INR', {
            headers: {
                'x-access-token': process.env.GOLD_API_KEY,
                'Content-Type': 'application/json',
            },
            timeout: 5000, // 5 second timeout
        });

        // goldapi returns price per troy ounce
        const pricePerGram24K = response.data.price / TROY_OUNCE_GRAMS;
        const rates = ratesFromPure(pricePerGram24K, 'api');

        // Step 3 — cache all karats together
        try {
            await redis.setex(GOLD_RATES_CACHE_KEY, GOLD_RATE_TTL, JSON.stringify(rates));
        } catch (err) {
            console.error('Redis error:', err.message);
        }
        return rates;

    } catch (err) {
        // Step 4 — API failed, use fallback rates
        console.error('Gold API error:', err.message);
        return Object.fromEntries(Object.entries(FALLBACK_RATES).map(([karat, rate]) => [
            `${karat}K`,
            { rate_per_gram: rate, source: 'fallback' },
        ]));
    }
};

// ─── Fetch live gold rate for one karat ───────────────
const getLiveGoldRate = async (karat = 22) => {
    const rates = await getAllGoldRates();
    const entry = rates[`${karat}K`] || rates['22K'];

    return {
        rate: entry.rate_per_gram,
        karat,
        source: entry.source,
        cached: entry.source === 'cache',
        ...(entry.source === 'fallback' && {
            warning: 'Using fallback rate — live API unavailable',
        }),
    };
};

// ─── Calculate price for a product ───────────────────
const calculateProductPrice = async (productId) => {

    // fetch product from MongoDB
    const product = await Product.findById(productId);
    if (!product) throw new Error('Product not found');

    const rates = await getAllGoldRates();
    const price = priceProduct(product, rates);

    return {
        product_id: productId,
        product_name: product.name,
        sku: product.sku,
        metal_type: product.metal_type,
        karat: product.karat,
        net_weight: product.net_weight,
        ...price,
        gst_rate: `${GST_RATE * 100}%`,
        gold_rate_source: rates[`${product.karat}K`]?.source ?? null,
        calculated_at: new Date(),
    };
};

// ─── Calculate price from custom input ───────────────
// useful for price estimator on frontend
const calculateCustomPrice = async ({
    karat,
    net_weight,
    making_charges = 0,
    stone_value = 0,
}) => {
    if (!karat || !net_weight) {
        throw new Error('karat and net_weight are required');
    }

    const goldRateData = await getLiveGoldRate(karat);
    const goldRate = goldRateData.rate;
    const price = computePrice({ net_weight, goldRate, making_charges, stone_value });

    return {
        karat,
        net_weight,
        gold_rate: goldRate,
        ...price,
        gst_rate: `${GST_RATE * 100}%`,
        gold_rate_source: goldRateData.source,
        calculated_at: new Date(),
    };
};

// ─── Store live prices on products ───────────────────
// writes the current price into base_price so the catalogue can be
// filtered and sorted by price in MongoDB
const refreshProductPrices = async () => {
    const rates = await getAllGoldRates();
    const products = await Product.find(
        {},
        { metal_type: 1, karat: 1, net_weight: 1, making_charges: 1, stones: 1 }
    ).lean();

    const now = new Date();
    const ops = [];
    for (const product of products) {
        try {
            ops.push({
                updateOne: {
                    filter: { _id: product._id },
                    update: {
                        $set: {
                            base_price: priceProduct(product, rates).final_price,
                            price_updated_at: now,
                        },
                    },
                },
            });
        } catch (err) {
            console.error(`Skipping price for ${product._id}:`, err.message);
        }
    }

    if (ops.length) await Product.bulkWrite(ops, { ordered: false });
    return { updated: ops.length, rates };
};

// price a single product right away (after create/update)
const refreshProductPrice = async (product) => {
    const rates = await getAllGoldRates();
    product.base_price = priceProduct(product, rates).final_price;
    product.price_updated_at = new Date();
    await product.save();
    return product;
};

// ─── Background job: keep stored prices in step with gold ─
let priceJob = null;
const startPriceRefreshJob = () => {
    const run = () => refreshProductPrices()
        .then(({ updated }) => console.log(`💰 Repriced ${updated} products`))
        .catch((err) => console.error('Price refresh failed:', err.message));

    run();
    priceJob = setInterval(run, GOLD_RATE_TTL * 1000);
    priceJob.unref();  // don't keep the process alive just for this
    return priceJob;
};

const stopPriceRefreshJob = () => {
    if (priceJob) clearInterval(priceJob);
    priceJob = null;
};

// ─── Manually refresh gold rate cache ────────────────
const refreshGoldRateCache = async () => {
    await redis.del(GOLD_RATES_CACHE_KEY);
    const { updated, rates } = await refreshProductPrices();
    console.log(`Gold rate cache refreshed, repriced ${updated} products`);
    return rates;
};

module.exports = {
    GST_RATE,
    KARAT_PURITY,
    computePrice,
    stoneTotal,
    goldRateForProduct,
    priceProduct,
    ratesFromPure,
    getLiveGoldRate,
    getAllGoldRates,
    calculateProductPrice,
    calculateCustomPrice,
    refreshProductPrices,
    refreshProductPrice,
    startPriceRefreshJob,
    stopPriceRefreshJob,
    refreshGoldRateCache,
};

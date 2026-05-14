const axios = require('axios');
const redis = require('../../config/redis');
const Product = require('../products/product.model');

// ─── Gold rate constants ──────────────────────────────
const GOLD_RATE_TTL = 900;   // cache for 15 minutes
const GST_RATE = 0.03;  // 3% GST on jewellery

// ─── Karat purity multipliers ────────────────────────
// 24K is pure gold (100%)
// 22K is 91.6% pure, 18K is 75% pure, etc.
const KARAT_PURITY = {
    24: 1.000,
    22: 0.916,
    18: 0.750,
    14: 0.583,
};

// ─── Fetch live gold rate ─────────────────────────────
const getLiveGoldRate = async (karat = 22) => {

    const cacheKey = `gold_rate:${karat}k`;

    // Step 1 — check Redis cache first
    try {
        const cached = await redis.get(cacheKey);
        if (cached) {
            console.log(`Cache HIT — gold rate ${karat}K from Redis`);
            return {
                rate: parseFloat(cached),
                karat,
                source: 'cache',
                cached: true,
            };
        }
    } catch (err) {
        console.error('Redis error:', err.message);
        // if Redis fails, continue to API
    }

    // Step 2 — not in cache, fetch from API
    console.log(`Cache MISS — fetching gold rate ${karat}K from API`);

    try {
        // Using goldapi.io — free tier available
        // Replace with MCX API in production
        const response = await axios.get(
            `https://www.goldapi.io/api/XAU/INR`,
            {
                headers: {
                    'x-access-token': process.env.GOLD_API_KEY,
                    'Content-Type': 'application/json',
                },
                timeout: 5000, // 5 second timeout
            }
        );

        // goldapi returns price per troy ounce
        // 1 troy ounce = 31.1035 grams
        const pricePerOunce = response.data.price;
        const pricePerGram24K = pricePerOunce / 31.1035;

        // apply karat purity to get rate for specific karat
        const purity = KARAT_PURITY[karat] || KARAT_PURITY[22];
        const rateForKarat = Math.round(pricePerGram24K * purity);

        // Step 3 — store in Redis for 15 minutes
        await redis.setex(cacheKey, GOLD_RATE_TTL, rateForKarat.toString());
        console.log(`Cached gold rate ${karat}K = ₹${rateForKarat}/gram for ${GOLD_RATE_TTL}s`);

        return {
            rate: rateForKarat,
            karat,
            source: 'api',
            cached: false,
        };

    } catch (err) {

        // Step 4 — API failed, use fallback rate
        console.error('Gold API error:', err.message);
        console.log('Using fallback gold rate');

        // hardcoded fallback rates — update these weekly
        const fallbackRates = {
            24: 7500,
            22: 6870,
            18: 5625,
            14: 4375,
        };

        const fallbackRate = fallbackRates[karat] || fallbackRates[22];

        return {
            rate: fallbackRate,
            karat,
            source: 'fallback',
            cached: false,
            warning: 'Using fallback rate — live API unavailable',
        };
    }
};

// ─── Get all karat rates at once ──────────────────────
const getAllGoldRates = async () => {
    const karats = [14, 18, 22, 24];
    const rates = await Promise.all(
        karats.map(k => getLiveGoldRate(k))
    );

    return rates.reduce((acc, r) => {
        acc[`${r.karat}K`] = {
            rate_per_gram: r.rate,
            source: r.source,
        };
        return acc;
    }, {});
};

// ─── Calculate price for a product ───────────────────
const calculateProductPrice = async (productId) => {

    // fetch product from MongoDB
    const product = await Product.findById(productId);
    if (!product) throw new Error('Product not found');

    // get live gold rate for this product's karat
    const goldRateData = await getLiveGoldRate(product.karat);
    const goldRate = goldRateData.rate;

    // calculate gold value
    const goldValue = Math.round(product.net_weight * goldRate);

    // calculate stone/diamond value
    const stoneValue = product.stones?.reduce((total, stone) => {
        return total + (stone.price || 0);
    }, 0) || 0;

    // subtotal before GST
    const subtotal = goldValue + product.making_charges + stoneValue;

    // GST 3% on subtotal
    const gst = Math.round(subtotal * GST_RATE);

    // final price
    const finalPrice = subtotal + gst;

    return {
        product_id: productId,
        product_name: product.name,
        sku: product.sku,
        karat: product.karat,
        net_weight: product.net_weight,
        gold_rate: goldRate,
        gold_value: goldValue,
        making_charges: product.making_charges,
        stone_value: stoneValue,
        subtotal,
        gst_rate: `${GST_RATE * 100}%`,
        gst_amount: gst,
        final_price: finalPrice,
        gold_rate_source: goldRateData.source,
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
    const goldValue = Math.round(net_weight * goldRate);
    const subtotal = goldValue + making_charges + stone_value;
    const gst = Math.round(subtotal * GST_RATE);
    const finalPrice = subtotal + gst;

    return {
        karat,
        net_weight,
        gold_rate: goldRate,
        gold_value: goldValue,
        making_charges,
        stone_value,
        subtotal,
        gst_rate: `${GST_RATE * 100}%`,
        gst_amount: gst,
        final_price: finalPrice,
        gold_rate_source: goldRateData.source,
        calculated_at: new Date(),
    };
};

// ─── Manually refresh gold rate cache ────────────────
const refreshGoldRateCache = async () => {
    const karats = [14, 18, 22, 24];

    // delete old cache
    await Promise.all(
        karats.map(k => redis.del(`gold_rate:${k}k`))
    );

    // fetch fresh rates
    const rates = await getAllGoldRates();
    console.log('Gold rate cache refreshed');
    return rates;
};

module.exports = {
    getLiveGoldRate,
    getAllGoldRates,
    calculateProductPrice,
    calculateCustomPrice,
    refreshGoldRateCache,
};
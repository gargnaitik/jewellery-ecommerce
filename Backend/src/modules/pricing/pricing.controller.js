const pricingService = require('./pricing.service');

// GET /api/pricing/gold-rate?karat=22
const getGoldRate = async (req, res) => {
    try {
        const karat = parseInt(req.query.karat) || 22;

        if (![14, 18, 22, 24].includes(karat)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid karat. Must be 14, 18, 22, or 24',
            });
        }

        const data = await pricingService.getLiveGoldRate(karat);
        res.status(200).json({ success: true, data });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/pricing/gold-rates — all karats at once
const getAllGoldRates = async (req, res) => {
    try {
        const rates = await pricingService.getAllGoldRates();
        res.status(200).json({ success: true, data: rates });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/pricing/product/:id — price for a specific product
const getProductPrice = async (req, res) => {
    try {
        const price = await pricingService.calculateProductPrice(req.params.id);
        res.status(200).json({ success: true, data: price });
    } catch (err) {
        res.status(404).json({ success: false, message: err.message });
    }
};

// POST /api/pricing/calculate — custom price estimator
const calculateCustomPrice = async (req, res) => {
    try {
        const { karat, net_weight, making_charges, stone_value } = req.body;

        if (!karat || !net_weight) {
            return res.status(400).json({
                success: false,
                message: 'karat and net_weight are required',
            });
        }

        const price = await pricingService.calculateCustomPrice({
            karat: parseInt(karat),
            net_weight: parseFloat(net_weight),
            making_charges: parseFloat(making_charges) || 0,
            stone_value: parseFloat(stone_value) || 0,
        });

        res.status(200).json({ success: true, data: price });

    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// POST /api/pricing/refresh — force refresh cache (admin only later)
const refreshCache = async (req, res) => {
    try {
        const rates = await pricingService.refreshGoldRateCache();
        res.status(200).json({
            success: true,
            message: 'Gold rate cache refreshed',
            data: rates,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = {
    getGoldRate,
    getAllGoldRates,
    getProductPrice,
    calculateCustomPrice,
    refreshCache,
};
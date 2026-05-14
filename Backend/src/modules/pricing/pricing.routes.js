const express = require('express');
const router = express.Router();
const pricingController = require('./pricing.controller');

router.get('/gold-rate', pricingController.getGoldRate);
router.get('/gold-rates', pricingController.getAllGoldRates);
router.get('/product/:id', pricingController.getProductPrice);
router.post('/calculate', pricingController.calculateCustomPrice);
router.post('/refresh', pricingController.refreshCache);

module.exports = router;
const express = require('express');
const router = express.Router();
const productController = require('./product.controller');
const { protect, adminOnly } = require('../auth/auth.middleware');

router.post('/', protect, adminOnly, productController.createProduct);
router.get('/', productController.getAllProducts);
router.get('/sku/:sku', productController.getProductBySku);
router.get('/:id', productController.getProductById);
router.put('/:id', protect, adminOnly, productController.updateProduct);
router.delete('/:id', protect, adminOnly, productController.deleteProduct);
router.patch('/:id/stock', protect, adminOnly, productController.updateStock);

module.exports = router;
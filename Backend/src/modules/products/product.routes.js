const express = require('express');
const router = express.Router();
const productController = require('./product.controller');
const { protect, adminOnly } = require('../auth/auth.middleware');
// ─── Paste these routes into product.routes.js ────────────────
const upload = require('../../middleware/upload.middleware');
const imageService = require('./image.service');

router.post('/', protect, adminOnly, productController.createProduct);
router.get('/', productController.getAllProducts);
router.get('/sku/:sku', productController.getProductBySku);
router.get('/:id', productController.getProductById);
router.put('/:id', protect, adminOnly, productController.updateProduct);
router.delete('/:id', protect, adminOnly, productController.deleteProduct);
router.patch('/:id/stock', protect, adminOnly, productController.updateStock);

// POST /api/products/:id/images  (up to 5 images)
router.post('/:id/images', protect, adminOnly, upload.array('images', 5), async (req, res) => {
    try {
        if (!req.files?.length)
            return res.status(400).json({ success: false, message: 'No images uploaded' });

        const product = await Product.findById(req.params.id);
        if (!product)
            return res.status(404).json({ success: false, message: 'Product not found' });

        const uploaded = await imageService.uploadProductImages(req.files);

        // First image ever → mark as primary
        if (product.images.length === 0) uploaded[0].is_primary = true;

        product.images.push(...uploaded);
        await product.save();

        res.status(200).json({ success: true, data: product.images });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// DELETE /api/products/:id/images/:index
router.delete('/:id/images/:index', protect, adminOnly, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product)
            return res.status(404).json({ success: false, message: 'Product not found' });

        const img = product.images[req.params.index];
        if (!img)
            return res.status(404).json({ success: false, message: 'Image not found' });

        await imageService.deleteImage(img.public_id);
        product.images.splice(req.params.index, 1);

        // Ensure a primary still exists
        if (product.images.length > 0 && !product.images.some(i => i.is_primary))
            product.images[0].is_primary = true;

        await product.save();
        res.status(200).json({ success: true, data: product.images });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// PATCH /api/products/:id/images/:index/primary
router.patch('/:id/images/:index/primary', protect, adminOnly, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product)
            return res.status(404).json({ success: false, message: 'Product not found' });

        product.images.forEach((img, i) => {
            img.is_primary = i === parseInt(req.params.index);
        });
        await product.save();
        res.status(200).json({ success: true, data: product.images });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
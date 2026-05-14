const productService = require('./product.service');

// ─── Create product ───────────────────────────────────
const createProduct = async (req, res) => {
    try {
        const product = await productService.createProduct(req.body);
        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: product,
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// ─── Get all products ─────────────────────────────────
const getAllProducts = async (req, res) => {
    try {
        // filters come from query params
        // GET /api/products?category=ring&metal_type=gold&page=1
        const result = await productService.getAllProducts(req.query);
        res.status(200).json({
            success: true,
            ...result,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── Get product by ID ────────────────────────────────
const getProductById = async (req, res) => {
    try {
        const product = await productService.getProductById(req.params.id);
        res.status(200).json({ success: true, data: product });
    } catch (err) {
        res.status(404).json({ success: false, message: err.message });
    }
};

// ─── Get product by SKU ───────────────────────────────
const getProductBySku = async (req, res) => {
    try {
        const product = await productService.getProductBySku(req.params.sku);
        res.status(200).json({ success: true, data: product });
    } catch (err) {
        res.status(404).json({ success: false, message: err.message });
    }
};

// ─── Update product ───────────────────────────────────
const updateProduct = async (req, res) => {
    try {
        const product = await productService.updateProduct(req.params.id, req.body);
        res.status(200).json({
            success: true,
            message: 'Product updated successfully',
            data: product,
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// ─── Delete product ───────────────────────────────────
const deleteProduct = async (req, res) => {
    try {
        await productService.deleteProduct(req.params.id);
        res.status(200).json({
            success: true,
            message: 'Product deactivated successfully',
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// ─── Update stock ─────────────────────────────────────
const updateStock = async (req, res) => {
    try {
        const { quantity } = req.body;
        if (quantity === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Quantity is required'
            });
        }
        const product = await productService.updateStock(req.params.id, quantity);
        res.status(200).json({
            success: true,
            message: 'Stock updated successfully',
            data: { stock: product.stock },
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

module.exports = {
    createProduct,
    getAllProducts,
    getProductById,
    getProductBySku,
    updateProduct,
    deleteProduct,
    updateStock,
};
const Product = require('./product.model');

// ─── Create product ───────────────────────────────────
const createProduct = async (productData) => {

    // check duplicate SKU
    const existing = await Product.findOne({ sku: productData.sku });
    if (existing) throw new Error('Product with this SKU already exists');

    const product = await Product.create(productData);
    return product;
};

// ─── Get all products with filters ───────────────────
const getAllProducts = async (filters = {}) => {
    const query = { is_active: true };

    // apply filters if provided
    if (filters.category) query.category = filters.category;
    if (filters.metal_type) query.metal_type = filters.metal_type;
    if (filters.karat) query.karat = Number(filters.karat);
    if (filters.gender) query.gender = filters.gender;
    if (filters.occasion) query.occasion = filters.occasion;
    if (filters.is_featured) query.is_featured = true;

    // price range filter
    if (filters.min_price || filters.max_price) {
        query.base_price = {};
        if (filters.min_price) query.base_price.$gte = Number(filters.min_price);
        if (filters.max_price) query.base_price.$lte = Number(filters.max_price);
    }

    // weight range filter
    if (filters.min_weight || filters.max_weight) {
        query.net_weight = {};
        if (filters.min_weight) query.net_weight.$gte = Number(filters.min_weight);
        if (filters.max_weight) query.net_weight.$lte = Number(filters.max_weight);
    }

    // text search
    if (filters.search) {
        query.$text = { $search: filters.search };
    }

    // sorting
    let sort = { createdAt: -1 }; // newest first by default
    if (filters.sort === 'price_asc') sort = { base_price: 1 };
    if (filters.sort === 'price_desc') sort = { base_price: -1 };
    if (filters.sort === 'weight_asc') sort = { net_weight: 1 };

    // pagination
    const page = Number(filters.page) || 1;
    const limit = Number(filters.limit) || 20;
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
        Product.find(query).sort(sort).skip(skip).limit(limit),
        Product.countDocuments(query),
    ]);

    return {
        products,
        pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit),
        }
    };
};

// ─── Get single product by ID ─────────────────────────
const getProductById = async (id) => {
    const product = await Product.findById(id);
    if (!product) throw new Error('Product not found');
    return product;
};

// ─── Get product by SKU ───────────────────────────────
const getProductBySku = async (sku) => {
    const product = await Product.findOne({ sku: sku.toUpperCase() });
    if (!product) throw new Error('Product not found');
    return product;
};

// ─── Update product ───────────────────────────────────
const updateProduct = async (id, updates) => {
    const product = await Product.findByIdAndUpdate(
        id,
        { $set: updates },
        { new: true, runValidators: true }  // returns updated doc
    );
    if (!product) throw new Error('Product not found');
    return product;
};

// ─── Delete product (soft delete) ────────────────────
const deleteProduct = async (id) => {
    const product = await Product.findByIdAndUpdate(
        id,
        { $set: { is_active: false } },  // soft delete
        { new: true }
    );
    if (!product) throw new Error('Product not found');
    return product;
};

// ─── Update stock ─────────────────────────────────────
const updateStock = async (id, quantity) => {
    const product = await Product.findByIdAndUpdate(
        id,
        { $inc: { stock: quantity } },  // increment or decrement
        { new: true }
    );
    if (!product) throw new Error('Product not found');
    if (product.stock < 0) throw new Error('Insufficient stock');
    return product;
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
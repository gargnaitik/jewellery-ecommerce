const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({

    // ─── Basic Info ───────────────────────────────────
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true,
    },
    sku: {
        type: String,
        required: [true, 'SKU is required'],
        unique: true,
        uppercase: true,    // always stored as uppercase
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },

    // ─── Metal Info ───────────────────────────────────
    metal_type: {
        type: String,
        enum: ['gold', 'silver', 'platinum', 'diamond'],
        required: [true, 'Metal type is required'],
    },
    karat: {
        type: Number,
        enum: [14, 18, 22, 24],   // valid karat values
        required: function () {
            return this.metal_type === 'gold'; // required only for gold
        },
    },

    // ─── Weight Info ──────────────────────────────────
    gross_weight: {
        type: Number,
        required: [true, 'Gross weight is required'],
    },
    net_weight: {
        type: Number,
        required: [true, 'Net weight is required'],
    },
    making_charges: {
        type: Number,
        required: [true, 'Making charges are required'],
        default: 0,
    },

    // ─── Stones / Diamonds ────────────────────────────
    stones: [
        {
            type: {
                type: String,   // ruby, emerald, diamond
            },
            carat: Number,
            price: Number,
            color: String,
        }
    ],

    // ─── Pricing ──────────────────────────────────────
    base_price: {
        type: Number,
        default: 0,     // calculated dynamically from gold rate
    },
    discount_percent: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
    },

    // ─── Category & Classification ────────────────────
    category: {
        type: String,
        enum: [
            'ring', 'necklace', 'earring',
            'bracelet', 'bangle', 'pendant',
            'chain', 'anklet', 'mangalsutra'
        ],
        required: [true, 'Category is required'],
    },
    gender: {
        type: String,
        enum: ['men', 'women', 'unisex', 'kids'],
        default: 'women',
    },
    occasion: [{
        type: String,
        enum: ['wedding', 'festival', 'daily', 'party', 'office'],
    }],

    // ─── Certification ────────────────────────────────
    certifications: [{
        type: String,
        enum: ['BIS Hallmark', 'IGI', 'GIA', 'SGL'],
    }],
    hallmark_number: {
        type: String,
        trim: true,
    },

    // ─── Images ───────────────────────────────────────
    images: [{
        url: String,
        alt: String,
        is_primary: {
            type: Boolean,
            default: false,
        }
    }],

    // ─── Inventory ────────────────────────────────────
    stock: {
        type: Number,
        default: 0,
        min: 0,
    },
    is_active: {
        type: Boolean,
        default: true,
    },
    is_featured: {
        type: Boolean,
        default: false,
    },

    // ─── Tags for search ──────────────────────────────
    tags: [String],

}, {
    timestamps: true,   // adds createdAt, updatedAt
});

// Index for faster search COMEBACK LATER TO UNDERSTAND
productSchema.index({ name: 'text', tags: 'text' });
productSchema.index({ category: 1, metal_type: 1 });
productSchema.index({ is_active: 1 });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
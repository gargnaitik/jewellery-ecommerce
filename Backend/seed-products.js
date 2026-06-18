/**
 * seed-products.js
 * Seeds MongoDB with 12 sample jewellery products
 * Run: node seed-products.js
 */

require('dotenv').config();
const connectMongo = require('./src/config/mongo');
const Product = require('./src/modules/products/product.model');

// ── Making charges are flat ₹ amounts (not percentages) ──────
// Formula backend uses: goldValue + making_charges + stoneValue + 3% GST

const PRODUCTS = [

    // ══ RINGS ═══════════════════════════════════════════════
    {
        name: 'Kundan Solitaire Ring',
        sku: 'RNG-22K-001',
        description: 'Handcrafted Kundan solitaire ring set in 22K gold with floral motifs. BIS 916 hallmarked.',
        metal_type: 'gold',
        karat: 22,
        gross_weight: 6.2,
        net_weight: 5.8,
        making_charges: 3500,
        category: 'ring',
        gender: 'women',
        occasion: ['wedding', 'festival'],
        certifications: ['BIS Hallmark'],
        hallmark_number: 'BIS916KNK001',
        stock: 15,
        is_active: true,
        is_featured: true,
        tags: ['ring', '22k', 'kundan', 'solitaire', 'gold'],
        images: [
            { url: '/images/products/kundan_solitaire_ring.png', alt: 'Kundan Solitaire Ring', is_primary: true }
        ],
    },
    {
        name: 'Diamond Solitaire Ring',
        sku: 'RNG-18K-001',
        description: 'Classic diamond solitaire ring in 18K gold. IGI certified 0.25 carat natural diamond.',
        metal_type: 'gold',
        karat: 18,
        gross_weight: 4.5,
        net_weight: 4.2,
        making_charges: 8000,
        stones: [
            { type: 'diamond', carat: 0.25, price: 45000, color: 'G-H' }
        ],
        category: 'ring',
        gender: 'women',
        occasion: ['wedding', 'party'],
        certifications: ['BIS Hallmark', 'IGI'],
        stock: 8,
        is_active: true,
        is_featured: true,
        tags: ['ring', '18k', 'diamond', 'solitaire', 'engagement'],
        images: [
            { url: '/images/products/diamond_solitaire_ring.png', alt: 'Diamond Solitaire Ring', is_primary: true }
        ],
    },
    {
        name: 'Platinum Wedding Band',
        sku: 'RNG-PT-001',
        description: 'Sleek platinum wedding band with brushed finish. Hypoallergenic and tarnish-free.',
        metal_type: 'platinum',
        gross_weight: 8.5,
        net_weight: 8.0,
        making_charges: 6000,
        category: 'ring',
        gender: 'unisex',
        occasion: ['wedding'],
        certifications: ['BIS Hallmark'],
        stock: 20,
        is_active: true,
        is_featured: false,
        tags: ['ring', 'platinum', 'wedding', 'band', 'unisex'],
        images: [
            { url: '/images/products/platinum_wedding_band.png', alt: 'Platinum Wedding Band', is_primary: true }
        ],
    },
    {
        name: 'Filigree Gold Ring',
        sku: 'RNG-22K-002',
        description: 'Intricate filigree work ring in 22K gold. Traditional South Indian craftsmanship.',
        metal_type: 'gold',
        karat: 22,
        gross_weight: 5.0,
        net_weight: 4.6,
        making_charges: 4200,
        category: 'ring',
        gender: 'women',
        occasion: ['festival', 'daily'],
        certifications: ['BIS Hallmark'],
        stock: 12,
        is_active: true,
        is_featured: false,
        tags: ['ring', '22k', 'filigree', 'traditional'],
        images: [
            { url: 'https://placehold.co/600x600?text=Filigree+Gold+Ring', alt: 'Filigree Gold Ring', is_primary: true }
        ],
    },

    // ══ NECKLACES ════════════════════════════════════════════
    {
        name: 'Kundan Bridal Necklace Set',
        sku: 'NCK-22K-001',
        description: 'Exquisite Kundan bridal necklace set with matching earrings. Handcrafted by master artisans in Jaipur.',
        metal_type: 'gold',
        karat: 22,
        gross_weight: 48.5,
        net_weight: 45.2,
        making_charges: 28000,
        stones: [
            { type: 'ruby', carat: 2.0, price: 12000, color: 'pigeon blood' },
            { type: 'emerald', carat: 1.5, price: 8000, color: 'vivid green' },
        ],
        category: 'necklace',
        gender: 'women',
        occasion: ['wedding', 'festival'],
        certifications: ['BIS Hallmark'],
        hallmark_number: 'BIS916KNK002',
        stock: 3,
        is_active: true,
        is_featured: true,
        tags: ['necklace', '22k', 'kundan', 'bridal', 'set', 'jaipur'],
        images: [
            { url: 'https://placehold.co/600x600?text=Kundan+Bridal+Necklace+Set', alt: 'Kundan Bridal Necklace Set', is_primary: true }
        ],
    },
    {
        name: 'Temple Necklace',
        sku: 'NCK-22K-002',
        description: 'Traditional temple jewellery necklace with Lakshmi motifs. Antique finish in 22K gold.',
        metal_type: 'gold',
        karat: 22,
        gross_weight: 34.2,
        net_weight: 32.0,
        making_charges: 18000,
        category: 'necklace',
        gender: 'women',
        occasion: ['wedding', 'festival'],
        certifications: ['BIS Hallmark'],
        stock: 5,
        is_active: true,
        is_featured: true,
        tags: ['necklace', '22k', 'temple', 'traditional', 'antique', 'lakshmi'],
        images: [
            { url: 'https://placehold.co/600x600?text=Temple+Necklace', alt: 'Temple Necklace', is_primary: true }
        ],
    },
    {
        name: 'Polki Diamond Choker',
        sku: 'NCK-22K-003',
        description: 'Opulent Polki diamond choker with uncut diamonds set in 22K gold. Royal Rajasthani heritage.',
        metal_type: 'gold',
        karat: 22,
        gross_weight: 58.5,
        net_weight: 54.8,
        making_charges: 45000,
        stones: [
            { type: 'diamond', carat: 4.5, price: 180000, color: 'J-K (uncut)' },
        ],
        category: 'necklace',
        gender: 'women',
        occasion: ['wedding'],
        certifications: ['BIS Hallmark'],
        stock: 2,
        is_active: true,
        is_featured: true,
        tags: ['necklace', '22k', 'polki', 'diamond', 'choker', 'rajasthan', 'bridal'],
        images: [
            { url: 'https://placehold.co/600x600?text=Polki+Diamond+Choker', alt: 'Polki Diamond Choker', is_primary: true }
        ],
    },

    // ══ EARRINGS ═════════════════════════════════════════════
    {
        name: 'Antique Jhumka Pair',
        sku: 'EAR-22K-001',
        description: 'Classic Jhumka earrings with antique gold finish and ruby drops. Perfect for festivals.',
        metal_type: 'gold',
        karat: 22,
        gross_weight: 19.5,
        net_weight: 18.0,
        making_charges: 9000,
        stones: [
            { type: 'ruby', carat: 0.5, price: 3500, color: 'deep red' },
        ],
        category: 'earring',
        gender: 'women',
        occasion: ['festival', 'wedding'],
        certifications: ['BIS Hallmark'],
        stock: 10,
        is_active: true,
        is_featured: true,
        tags: ['earring', '22k', 'jhumka', 'antique', 'ruby', 'festival'],
        images: [
            { url: 'https://placehold.co/600x600?text=Antique+Jhumka+Pair', alt: 'Antique Jhumka Pair', is_primary: true }
        ],
    },
    {
        name: 'Pearl Drop Earrings',
        sku: 'EAR-18K-001',
        description: 'Delicate pearl drop earrings in 18K gold with freshwater pearls. Elegant and timeless.',
        metal_type: 'gold',
        karat: 18,
        gross_weight: 8.5,
        net_weight: 7.8,
        making_charges: 5500,
        stones: [
            { type: 'pearl', carat: 0, price: 4000, color: 'white' },
        ],
        category: 'earring',
        gender: 'women',
        occasion: ['party', 'office', 'daily'],
        certifications: ['BIS Hallmark'],
        stock: 18,
        is_active: true,
        is_featured: false,
        tags: ['earring', '18k', 'pearl', 'drop', 'elegant'],
        images: [
            { url: 'https://placehold.co/600x600?text=Pearl+Drop+Earrings', alt: 'Pearl Drop Earrings', is_primary: true }
        ],
    },

    // ══ BANGLES ══════════════════════════════════════════════
    {
        name: 'Gold Kada Bangle',
        sku: 'BNG-22K-001',
        description: 'Solid 22K gold Kada bangle with traditional engraving. Timeless piece passed down generations.',
        metal_type: 'gold',
        karat: 22,
        gross_weight: 40.0,
        net_weight: 38.2,
        making_charges: 15000,
        category: 'bangle',
        gender: 'women',
        occasion: ['wedding', 'festival', 'daily'],
        certifications: ['BIS Hallmark'],
        hallmark_number: 'BIS916KNK003',
        stock: 7,
        is_active: true,
        is_featured: true,
        tags: ['bangle', '22k', 'kada', 'solid', 'traditional'],
        images: [
            { url: 'https://placehold.co/600x600?text=Gold+Kada+Bangle', alt: 'Gold Kada Bangle', is_primary: true }
        ],
    },

    // ══ BRACELETS ════════════════════════════════════════════
    {
        name: 'Diamond Tennis Bracelet',
        sku: 'BRC-18K-001',
        description: '18K gold diamond tennis bracelet with 1.5 carat total weight of brilliant-cut diamonds.',
        metal_type: 'gold',
        karat: 18,
        gross_weight: 13.5,
        net_weight: 12.8,
        making_charges: 12000,
        stones: [
            { type: 'diamond', carat: 1.5, price: 120000, color: 'F-G' },
        ],
        category: 'bracelet',
        gender: 'women',
        occasion: ['party', 'wedding'],
        certifications: ['BIS Hallmark', 'IGI'],
        stock: 5,
        is_active: true,
        is_featured: true,
        tags: ['bracelet', '18k', 'diamond', 'tennis', 'luxury'],
        images: [
            { url: 'https://placehold.co/600x600?text=Diamond+Tennis+Bracelet', alt: 'Diamond Tennis Bracelet', is_primary: true }
        ],
    },

    // ══ PENDANTS ══════════════════════════════════════════════
    {
        name: 'Emerald Pendant',
        sku: 'PND-22K-001',
        description: 'Vivid Colombian emerald pendant in 22K gold with intricate meenakari work.',
        metal_type: 'gold',
        karat: 22,
        gross_weight: 7.5,
        net_weight: 7.0,
        making_charges: 6000,
        stones: [
            { type: 'emerald', carat: 1.2, price: 35000, color: 'vivid green' },
        ],
        category: 'pendant',
        gender: 'women',
        occasion: ['festival', 'party'],
        certifications: ['BIS Hallmark'],
        stock: 9,
        is_active: true,
        is_featured: false,
        tags: ['pendant', '22k', 'emerald', 'meenakari', 'coloured stone'],
        images: [
            { url: 'https://placehold.co/600x600?text=Emerald+Pendant', alt: 'Emerald Pendant', is_primary: true }
        ],
    },
];

const seed = async () => {
    try {
        await connectMongo();
        console.log('\n🔗 Connected to MongoDB');

        // Drop existing products? Ask before in production!
        const existing = await Product.countDocuments();
        if (existing > 0) {
            console.log(`\n⚠️  Found ${existing} existing products.`);
            console.log('   Inserting new ones alongside (no duplicates due to SKU unique index).\n');
        }

        let created = 0;
        let skipped = 0;

        for (const p of PRODUCTS) {
            try {
                await Product.create(p);
                console.log(`✅ ${p.name}  [${p.sku}]`);
                created++;
            } catch (err) {
                if (err.code === 11000) {
                    console.log(`⏭️  Skipped (already exists): ${p.sku}`);
                    skipped++;
                } else {
                    throw err;
                }
            }
        }

        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`✅ Seeding complete!`);
        console.log(`   Created: ${created}`);
        console.log(`   Skipped: ${skipped}`);
        console.log(`   Total in DB: ${await Product.countDocuments()}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        process.exit(0);
    } catch (err) {
        console.error('\n❌ Seeding failed:', err.message);
        process.exit(1);
    }
};

seed();
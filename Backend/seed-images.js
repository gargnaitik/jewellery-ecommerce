/**
 * seed-images-retry.js
 * Re-runs only the 6 failed products with simpler Unsplash queries
 * Run: node seed-images-retry.js
 */

require('dotenv').config();
const fetch = require('node-fetch');
const streamifier = require('streamifier');
const cloudinary = require('./src/config/cloudinary');
const connectMongo = require('./src/config/mongo');
const Product = require('./src/modules/products/product.model');

const UNSPLASH_KEY = process.env.UNSPLASH_ACCESS_KEY;

/* ── Only the 6 that failed — simpler queries ────────────────── */
const RETRY_QUERIES = {
    'GN-22K-001': 'gold necklace women'
};
const getUnsplashUrl = async (query) => {
    const res = await fetch(
        `https://api.unsplash.com/photos/random?query=${encodeURIComponent(query)}&orientation=squarish&content_filter=high`,
        { headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` } }
    );
    if (!res.ok) throw new Error(`Unsplash ${res.status} for "${query}"`);
    const data = await res.json();
    return { url: data.urls.regular, photographer: data.user.name };
};

const downloadBuffer = async (url) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Download failed ${res.status}`);
    return res.buffer();
};

const uploadToCloudinary = (buffer, sku) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: 'kanakam/products',
                public_id: `product_${sku.toLowerCase().replace(/-/g, '_')}`,
                overwrite: true,
                transformation: [
                    { width: 800, height: 800, crop: 'fill', gravity: 'auto' },
                    { quality: 'auto:good', fetch_format: 'auto' },
                ],
            },
            (err, result) => err ? reject(err) : resolve(result)
        );
        streamifier.createReadStream(buffer).pipe(stream);
    });
};

const seed = async () => {
    await connectMongo();
    console.log('\n🔁 Retrying 6 failed images...\n');

    let ok = 0, fail = 0;

    for (const [sku, query] of Object.entries(RETRY_QUERIES)) {
        try {
            process.stdout.write(`📸 ${sku} — "${query}"... `);

            const { url: imgUrl, photographer } = await getUnsplashUrl(query);
            const buffer = await downloadBuffer(imgUrl);
            const result = await uploadToCloudinary(buffer, sku);

            await Product.findOneAndUpdate(
                { sku },
                {
                    $set: {
                        images: [{
                            url: result.secure_url,
                            public_id: result.public_id,
                            alt: `${sku} — photo by ${photographer}`,
                            is_primary: true,
                        }],
                    },
                }
            );

            console.log(`✅`);
            console.log(`   └─ ${result.secure_url}`);
            ok++;

            await new Promise(r => setTimeout(r, 1500));
        } catch (err) {
            console.log(`❌ ${err.message}`);
            fail++;
        }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Retry done! ${ok} uploaded, ${fail} failed`);
    if (fail > 0) console.log('   Run again — Unsplash random results vary each call');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    process.exit(0);
};

seed().catch(err => { console.error('Fatal:', err.message); process.exit(1); });    

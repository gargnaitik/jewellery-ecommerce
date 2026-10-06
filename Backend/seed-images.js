/**
 * seed-images.js
 * Gives every product a real photo: searches Unsplash, uploads the image to
 * Cloudinary (800×800, auto quality/format) and saves it on the product.
 *
 * Run:   node seed-images.js           — products still on placeholder/local images
 *        node seed-images.js --force   — re-fetch photos for every product
 *
 * Needs MONGO_URI, UNSPLASH_ACCESS_KEY and the CLOUDINARY_* variables.
 */

require('dotenv').config();
const streamifier = require('streamifier');
const cloudinary = require('./src/config/cloudinary');
const connectMongo = require('./src/config/mongo');
const Product = require('./src/modules/products/product.model');

const UNSPLASH_KEY = process.env.UNSPLASH_ACCESS_KEY;
const FORCE = process.argv.includes('--force');

// hand-picked searches for the seeded catalogue; anything else falls back
// to "<metal> <category> jewelry"
const QUERIES = {
    'RNG-22K-001': 'kundan ring jewelry',
    'RNG-18K-001': 'diamond solitaire ring',
    'RNG-PT-001': 'platinum wedding band',
    'RNG-22K-002': 'gold filigree ring',
    'NCK-22K-001': 'kundan bridal necklace',
    'NCK-22K-002': 'temple jewellery gold necklace',
    'NCK-22K-003': 'diamond choker necklace',
    'EAR-22K-001': 'jhumka earrings',
    'EAR-18K-001': 'pearl drop earrings',
    'BNG-22K-001': 'gold bangle',
    'BRC-18K-001': 'diamond tennis bracelet',
    'PND-22K-001': 'emerald pendant necklace',
};

const queryFor = (product) =>
    QUERIES[product.sku] || `${product.metal_type} ${product.category} jewelry`;

// a product needs a photo if it has none, or only placeholders / local paths
const needsPhoto = (product) =>
    FORCE || !product.images?.some((img) => img.url?.includes('res.cloudinary.com'));

const searchUnsplash = async (query) => {
    const res = await fetch(
        `https://api.unsplash.com/photos/random?query=${encodeURIComponent(query)}&orientation=squarish&content_filter=high`,
        { headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` } }
    );
    if (!res.ok) throw new Error(`Unsplash ${res.status} for "${query}"`);
    const photo = await res.json();

    // Unsplash API guidelines: report the download when a photo is used
    fetch(photo.links.download_location, {
        headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` },
    }).catch(() => {});

    return { url: photo.urls.regular, photographer: photo.user.name };
};

const downloadBuffer = async (url) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Download failed ${res.status}`);
    return Buffer.from(await res.arrayBuffer());
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
    const missing = ['UNSPLASH_ACCESS_KEY', 'CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET']
        .filter((name) => !process.env[name]);
    if (missing.length) {
        console.error(`\n❌ Missing environment variables: ${missing.join(', ')}\n`);
        process.exit(1);
    }

    await connectMongo();

    const products = (await Product.find({ is_active: true })).filter(needsPhoto);
    console.log(`\n📸 Fetching photos for ${products.length} product(s)...\n`);

    let ok = 0, fail = 0;

    for (const product of products) {
        const query = queryFor(product);
        try {
            process.stdout.write(`   ${product.sku} — "${query}"... `);

            const { url, photographer } = await searchUnsplash(query);
            const result = await uploadToCloudinary(await downloadBuffer(url), product.sku);

            product.images = [{
                url: result.secure_url,
                public_id: result.public_id,
                alt: `${product.name} — photo by ${photographer} on Unsplash`,
                is_primary: true,
            }];
            await product.save();

            console.log('✅');
            ok++;

            // stay well inside Unsplash's demo limit (50 requests/hour)
            await new Promise((r) => setTimeout(r, 1500));
        } catch (err) {
            console.log(`❌ ${err.message}`);
            fail++;
        }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Done: ${ok} uploaded, ${fail} failed`);
    if (fail > 0) console.log('   Run again to retry the failed ones');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    process.exit(0);
};

seed().catch((err) => { console.error('Fatal:', err.message); process.exit(1); });

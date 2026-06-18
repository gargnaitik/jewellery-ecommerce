// src/modules/products/image.service.js
const cloudinary = require('../../config/cloudinary');
const streamifier = require('streamifier');

/* ── Upload one buffer to Cloudinary ────────────────────────── */
const uploadImage = (buffer, folder = 'kanakam/products') => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder,
                transformation: [
                    { width: 800, height: 800, crop: 'fill', gravity: 'auto' },
                    { quality: 'auto:good', fetch_format: 'auto' },
                ],
            },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        );
        streamifier.createReadStream(buffer).pipe(stream);
    });
};

/* ── Upload multiple images, return array ready for MongoDB ─── */
const uploadProductImages = async (files) => {
    const results = await Promise.all(
        files.map((file) => uploadImage(file.buffer))
    );
    return results.map((result, i) => ({
        url: result.secure_url,
        public_id: result.public_id,   // needed for deletion
        alt: files[i].originalname.replace(/\.[^/.]+$/, ''),
        is_primary: i === 0,
    }));
};

/* ── Delete one image by public_id ──────────────────────────── */
const deleteImage = async (public_id) => {
    if (!public_id) return;
    await cloudinary.uploader.destroy(public_id);
};

/* ── Delete all images for a product ────────────────────────── */
const deleteProductImages = async (images = []) => {
    await Promise.all(
        images
            .filter((img) => img.public_id)
            .map((img) => deleteImage(img.public_id))
    );
};

module.exports = {
    uploadImage,
    uploadProductImages,
    deleteImage,
    deleteProductImages,
};
// src/middleware/upload.middleware.js
const multer = require('multer');
const path = require('path');

const storage = multer.memoryStorage(); // keep in memory, stream to Cloudinary

const fileFilter = (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('Only JPG, PNG and WEBP images are allowed'), false);
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per image
});

module.exports = upload;
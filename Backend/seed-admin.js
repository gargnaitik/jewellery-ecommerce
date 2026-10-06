/**
 * seed-admin.js
 * Creates an admin user in PostgreSQL
 * Run: ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='a-strong-password' node seed-admin.js
 * (or set them in .env). Credentials are never hardcoded — the repo is public.
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { connectPostgres, sequelize } = require('./src/config/db');
const User = require('./src/modules/users/user.model');

const ADMIN = {
    name: process.env.ADMIN_NAME || 'Kanakam Admin',
    email: process.env.ADMIN_EMAIL?.toLowerCase().trim(),
    phone: process.env.ADMIN_PHONE || null,
    password: process.env.ADMIN_PASSWORD,
    role: 'admin',
};

if (!ADMIN.email || !ADMIN.password || ADMIN.password.length < 12) {
    console.error('\n❌ Set ADMIN_EMAIL and ADMIN_PASSWORD (12+ characters) in the environment.\n');
    process.exit(1);
}

const seed = async () => {
    try {
        await connectPostgres();
        await sequelize.sync();

        // Check if admin already exists
        const existing = await User.findOne({ where: { email: ADMIN.email } });
        if (existing) {
            console.log(`\n⚠️  Admin already exists: ${ADMIN.email}`);
            console.log(`   Role: ${existing.role}`);
            console.log('   To reset password, delete the user and re-run.\n');
            process.exit(0);
        }

        // Hash password
        const salt = await bcrypt.genSalt(12);
        const password_hash = await bcrypt.hash(ADMIN.password, salt);

        // Create admin user
        const admin = await User.create({
            name: ADMIN.name,
            email: ADMIN.email,
            phone: ADMIN.phone,
            password_hash,
            role: 'admin',
            is_verified: true,
        });

        console.log('\n✅ Admin user created successfully!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`   ID:       ${admin.id}`);
        console.log(`   Name:     ${admin.name}`);
        console.log(`   Email:    ${admin.email}`);
        console.log(`   Phone:    ${admin.phone}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        process.exit(0);
    } catch (err) {
        console.error('\n❌ Seeding failed:', err.message);
        process.exit(1);
    }
};

seed();
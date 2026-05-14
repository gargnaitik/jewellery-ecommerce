const User = require('./user.model');
const bcrypt = require('bcryptjs');

// ─── helper — strip password_hash before returning ───
const sanitizeUser = (user) => {
    const u = user.toJSON ? user.toJSON() : { ...user };
    delete u.password_hash;
    return u;
};

// ─── Create user ─────────────────────────────────────
const createUser = async (userData) => {

    // 1. check duplicate phone
    const existingPhone = await User.findOne({ where: { phone: userData.phone } });
    if (existingPhone) throw new Error('Phone number already registered');

    // 2. check duplicate email if provided
    if (userData.email) {
        const existingEmail = await User.findOne({ where: { email: userData.email } });
        if (existingEmail) throw new Error('Email already registered');
    }

    // 3. hash password if provided
    if (userData.password) {
        const salt = await bcrypt.genSalt(10);
        userData.password_hash = await bcrypt.hash(userData.password, salt);
        delete userData.password; // remove plain password from object
    }

    // 4. save to DB
    const user = await User.create(userData);

    // 5. never return password_hash
    return sanitizeUser(user);
};

// ─── Get all users ────────────────────────────────────
const getAllUsers = async () => {
    const users = await User.findAll({
        attributes: { exclude: ['password_hash'] }
    });
    return users;
};

// ─── Find user by ID ──────────────────────────────────
const findUserById = async (id) => {
    const user = await User.findByPk(id, {
        attributes: { exclude: ['password_hash'] }
    });
    return user;
};

// ─── Find user by phone (used in login) ──────────────
// NOTE: this one INCLUDES password_hash
// because login needs to compare password
const findUserByPhoneWithPassword = async (phone) => {
    const user = await User.findOne({ where: { phone } });
    return user; // returns full user including password_hash
};

// ─── Update user ──────────────────────────────────────
const updateUser = async (id, updates) => {

    // if updating password, hash the new one too
    if (updates.password) {
        const salt = await bcrypt.genSalt(10);
        updates.password_hash = await bcrypt.hash(updates.password, salt);
        delete updates.password; // remove plain password
    }

    await User.update(updates, { where: { id } });

    const updated = await User.findByPk(id, {
        attributes: { exclude: ['password_hash'] }
    });
    return updated;
};

// ─── Delete user ──────────────────────────────────────
const deleteUser = async (id) => {
    const user = await User.findByPk(id);
    if (!user) throw new Error('User not found');
    await User.destroy({ where: { id } });
};

// ─── Compare password (used in login) ────────────────
const comparePassword = async (plainPassword, hashedPassword) => {
    return await bcrypt.compare(plainPassword, hashedPassword);
};

module.exports = {
    createUser,
    getAllUsers,
    findUserById,
    findUserByPhoneWithPassword,
    updateUser,
    deleteUser,
    comparePassword,
};
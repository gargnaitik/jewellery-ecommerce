const userService = require('./user.service');

// ─── Create user ──────────────────────────────────────
const createUser = async (req, res) => {
    try {
        const { name, phone, email, password } = req.body;

        // validate required fields
        if (!name || !phone) {
            return res.status(400).json({
                success: false,
                message: 'Name and phone are required'
            });
        }

        const user = await userService.createUser({
            name,
            phone,
            email,
            password  // service will hash this
        });

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: user  // password_hash already removed in service
        });

    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// ─── Get all users ────────────────────────────────────
const getAllUsers = async (req, res) => {
    try {
        const users = await userService.getAllUsers();
        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── Get user by ID ───────────────────────────────────
const getUserById = async (req, res) => {
    try {
        const user = await userService.findUserById(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        res.status(200).json({ success: true, data: user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── Update user ──────────────────────────────────────
const updateUser = async (req, res) => {
    try {
        const user = await userService.updateUser(req.params.id, req.body);
        res.status(200).json({
            success: true,
            message: 'User updated successfully',
            data: user  // password_hash removed in service
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// ─── Delete user ──────────────────────────────────────
const deleteUser = async (req, res) => {
    try {
        await userService.deleteUser(req.params.id);
        res.status(200).json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
const updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;

        if (!['admin', 'user'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: "Role must be 'admin' or 'user'",
            });
        }

        // prevent self-demotion
        if (req.params.id == req.user.id) {
            return res.status(400).json({
                success: false,
                message: 'You cannot change your own role',
            });
        }

        const user = await userService.findUserById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        await user.update({ role });

        res.status(200).json({
            success: true,
            message: `User role updated to ${role}`,
            data: { id: user.id, name: user.name, email: user.email, role },
        });

    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
module.exports = {
    createUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    updateUserRole,
};
import User from '../models/User.js';
import Resident from '../models/Resident.js'; // Để xóa resident nếu cần
import bcrypt from 'bcryptjs';

// --- COMMON (User & Admin) ---

// @desc    Xem thông tin bản thân (Profile)
// @route   GET /api/users/profile
// @access  Private
const getProfile = async (req, res) => {
    // req.user đã được gán từ middleware protect
    if (req.user) {
        res.json({
            _id: req.user._id,
            username: req.user.username,
            role: req.user.role,
            active: req.user.active,
            createdAt: req.user.createdAt
        });
    } else {
        res.status(404).json({ message: 'Không tìm thấy thông tin người dùng.' });
    }
};

// @desc    Đổi mật khẩu
// @route   PUT /api/users/change-password
// @access  Private
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user._id);

        if (!user) return res.status(404).json({ message: 'User không tồn tại.' });

        // Check pass cũ
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Mật khẩu hiện tại không đúng.' });
        }

        // Hash pass mới
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.json({ message: 'Đổi mật khẩu thành công.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi đổi mật khẩu.' });
    }
};

// --- ADMIN ONLY ---

// @desc    Tạo User mới (Admin only)
// @route   POST /api/users
// @access  Private (Admin)
const createUser = async (req, res) => {
    try {
        const { username, password, role, name, apartment, cccd, phoneNumber } = req.body;

        if (!username || !password || !role) {
            return res.status(400).json({ message: 'Vui lòng điền đủ thông tin.' });
        }

        const userExists = await User.findOne({ username });
        if (userExists) {
            return res.status(400).json({ message: 'Username đã tồn tại.' });
        }

        if (role === 'resident') {
            if (!name || !apartment || !cccd || !phoneNumber) {
                return res.status(400).json({ message: 'Cư dân cần điền: tên, căn hộ, CCDD và SĐT.' });
            }
            const residentExists = await Resident.findOne({ cccd });
            if (residentExists) {
                return res.status(400).json({ message: 'CCCD đã tồn tại.' });
            }
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            username,
            password: hashedPassword,
            role,
            active: true
        });

        if (user) {
            if (role === 'resident') {
                await Resident.create({
                    name,
                    apartment,
                    cccd,
                    phoneNumber,
                    userId: user._id
                });
            }

            res.status(201).json({
                _id: user._id,
                username: user.username,
                role: user.role,
                active: user.active
            });
        } else {
            res.status(400).json({ message: 'Dữ liệu user không hợp lệ.' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi tạo user.' });
    }
};

// @desc    Lấy danh sách Users
// @route   GET /api/users
// @access  Private (Admin)
const getAllUsers = async (req, res) => {
    try {
        const { username, role, active } = req.query;
        const query = {};

        if (username) {
            query.username = { $regex: username, $options: 'i' };
        }
        if (role) {
            query.role = role;
        }
        if (active) {
            query.active = active === 'true';
        }

        const users = await User.find(query).select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi lấy danh sách user.' });
    }
};

// @desc    Lấy chi tiết User
// @route   GET /api/users/:id
// @access  Private (Admin)
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User không tìm thấy.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Lỗi lấy user.' });
    }
};

// @desc    Cập nhật User (Info, Role - trừ password)
// @route   PUT /api/users/:id
// @access  Private (Admin)
const updateUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            user.username = req.body.username || user.username;
            user.role = req.body.role || user.role;
            if (req.body.active !== undefined) {
                user.active = req.body.active;
            }

            const updatedUser = await user.save();
            res.json({
                _id: updatedUser._id,
                username: updatedUser.username,
                role: updatedUser.role,
                active: updatedUser.active
            });
        } else {
            res.status(404).json({ message: 'User không tìm thấy.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Lỗi cập nhật user.' });
    }
};

// @desc    Reset Password cho User
// @route   PUT /api/users/:id/reset-password
// @access  Private (Admin)
const resetPassword = async (req, res) => {
    try {
        const { newPassword } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) return res.status(404).json({ message: 'User không tìm thấy.' });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.json({ message: 'Reset mật khẩu thành công.' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi reset mật khẩu.' });
    }
};

// @desc    Khóa/Mở khóa User
// @route   PATCH /api/users/:id/status
// @access  Private (Admin)
const toggleUserStatus = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            user.active = !user.active;
            await user.save();
            res.json({ message: `Đã chuyển trạng thái user sang ${user.active ? 'active' : 'inactive'}.`, active: user.active });
        } else {
            res.status(404).json({ message: 'User không tìm thấy.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Lỗi thay đổi trạng thái user.' });
    }
};


export {
    getProfile,
    changePassword,
    createUser,
    getAllUsers,
    getUserById,
    updateUser,
    resetPassword,
    toggleUserStatus
};
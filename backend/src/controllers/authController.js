import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwtUtils.js';

// @desc    Đăng nhập & Lấy token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // 1. Tìm user theo username
        const user = await User.findOne({ username });

        // 2. Kiểm tra tồn tại và status
        if (!user) {
            return res.status(401).json({ message: 'Tên đăng nhập hoặc mật khẩu không chính xác.' });
        }
        if (user.status === 'inactive') {
            return res.status(403).json({ message: 'Tài khoản đã bị khóa.' });
        }

        // 3. Kiểm tra password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Tên đăng nhập hoặc mật khẩu không chính xác.' });
        }

        // 4. Tạo token
        const accessToken = generateAccessToken(user._id, user.role);
        const refreshToken = generateRefreshToken(user._id);

        res.json({
            _id: user._id,
            username: user.username,
            role: user.role,
            accessToken,
            refreshToken
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server khi đăng nhập.' });
    }
};

// @desc    Lấy Access Token mới từ Refresh Token
// @route   POST /api/auth/refresh
// @access  Public
const refreshAccessToken = async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(400).json({ message: 'Yêu cầu Refresh Token.' });
    }

    try {
        const decoded = verifyRefreshToken(refreshToken);
        
        if (!decoded) {
            return res.status(403).json({ message: 'Refresh Token không hợp lệ hoặc hết hạn.' });
        }

        const user = await User.findById(decoded.id);
        if (!user || user.status === 'inactive') {
            return res.status(403).json({ message: 'User không tồn tại hoặc bị khóa.' });
        }

        const newAccessToken = generateAccessToken(user._id, user.role);

        res.json({ accessToken: newAccessToken });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server khi refresh token.' });
    }
};

export { login, refreshAccessToken };

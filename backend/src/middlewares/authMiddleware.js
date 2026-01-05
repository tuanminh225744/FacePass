import User from '../models/User.js';
import { verifyAccessToken } from '../utils/jwtUtils.js';

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];

            // Verify Access Token
            const decoded = verifyAccessToken(token);
            
            if (!decoded) {
                return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn.' });
            }

            // Get User from DB, exclude password
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                return res.status(401).json({ message: 'Người dùng không tìm thấy.' });
            }

            // Check if user is active
            if (req.user.status === 'inactive') {
                return res.status(403).json({ message: 'Tài khoản đã bị khóa.' });
            }

            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Token xác thực thất bại.' });
        }
    } else {
        res.status(401).json({ message: 'Không có token, vui lòng đăng nhập.' });
    }
};

// Generic Role Check Middleware
const authorize = (roles = []) => {
    return (req, res, next) => {
        if (!req.user) {
             return res.status(401).json({ message: 'Chưa xác thực người dùng.' });
        }

        if (roles.length && !roles.includes(req.user.role)) {
            return res.status(403).json({ message: `Quyền truy cập bị từ chối. Yêu cầu quyền: ${roles.join(', ')}` });
        }
        
        next();
    };
};

export { protect, authorize };
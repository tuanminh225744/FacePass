import express from 'express';
import {
    getProfile,
    changePassword,
    createUser,
    getAllUsers,
    getUserById,
    updateUser,
    resetPassword,
    toggleUserStatus,
    deleteUser
} from '../controllers/userController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// --- Các route chung cho người dùng đã đăng nhập ---
router.get('/profile', protect, getProfile);
router.put('/change-password', protect, changePassword);

// --- Các route dành riêng cho Admin ---
router.post('/', protect, authorize(['admin']), createUser);
router.get('/', protect, authorize(['admin']), getAllUsers);

router.get('/:id', protect, authorize(['admin']), getUserById);
router.put('/:id', protect, authorize(['admin']), updateUser);
router.delete('/:id', protect, authorize(['admin']), deleteUser);

// Route chuyên biệt admin
router.put('/:id/reset-password', protect, authorize(['admin']), resetPassword);
router.patch('/:id/status', protect, authorize(['admin']), toggleUserStatus);

export default router;
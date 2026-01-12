import Resident from '../models/Resident.js';
import User from '../models/User.js';
import FaceEmbedding from '../models/FaceEmbedding.js';
import { getFaceEmbedding } from '../services/aiService.js';
import bcrypt from 'bcryptjs';

// --- EXISTING: REGISTER ---
export const registerResident = async (req, res) => {
    try {
        const { username, password, name, apartment, cccd, phoneNumber } = req.body;
        const file = req.file;

        // 1. Validate Input
        if (!username || !password || !name || !apartment || !cccd || !phoneNumber) {
            return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ thông tin' });
        }

        if (!file) {
            return res.status(400).json({ success: false, message: 'Vui lòng tải lên ảnh khuôn mặt' });
        }

        // 2. Kiểm tra tồn tại (User & Resident)
        const userExists = await User.findOne({ username });
        if (userExists) {
            return res.status(400).json({ success: false, message: 'Username đã tồn tại' });
        }

        const residentExists = await Resident.findOne({ cccd });
        if (residentExists) {
            return res.status(400).json({ success: false, message: 'CCCD đã tồn tại trong hệ thống' });
        }

        // 3. Tạo User Account
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            username,
            password: hashedPassword,
            role: 'resident',
            active: true
        });
        await newUser.save();

        // 4. Tạo Resident Profile
        // Lưu tạm để lấy _id
        const newResident = new Resident({
            name,
            apartment,
            cccd,
            phoneNumber,
            active: true,
            userId: newUser._id
        });

        try {
            await newResident.save();
        } catch (dbError) {
            // Rollback User nếu lưu resident lỗi
            await User.findByIdAndDelete(newUser._id);
            throw dbError;
        }

        // 5. Gọi AI Service để lấy embedding
        let embeddingResult;
        try {
            embeddingResult = await getFaceEmbedding(file.buffer, file.originalname);
        } catch (aiError) {
            // Rollback: Xóa cư dân & User nếu lỗi kết nối AI
            await Resident.findByIdAndDelete(newResident._id);
            await User.findByIdAndDelete(newUser._id);
            return res.status(500).json({ success: false, message: 'Lỗi kết nối AI Service: ' + aiError.message });
        }

        if (!embeddingResult.success) {
            // Rollback nếu không tìm thấy mặt
            await Resident.findByIdAndDelete(newResident._id);
            await User.findByIdAndDelete(newUser._id);
            return res.status(400).json({ success: false, message: 'Không tìm thấy khuôn mặt trong ảnh' });
        }

        // 6. Lưu vector embedding
        const faceEmbedding = new FaceEmbedding({
            residentId: newResident._id,
            embedding: embeddingResult.embedding
        });

        await faceEmbedding.save();

        res.status(201).json({
            success: true,
            data: {
                user: {
                    _id: newUser._id,
                    username: newUser.username,
                    role: newUser.role
                },
                resident: newResident,
                faceRegistered: true
            },
            message: 'Đăng ký cư dân và khuôn mặt thành công'
        });

    } catch (error) {
        console.error('Register resident error:', error);
        // Clean up data if needed (though caught in steps above)
        res.status(500).json({ success: false, message: 'Lỗi server: ' + error.message });
    }
};

// --- NEW CRUDS ---

// @desc    Lấy danh sách cư dân (có thể lọc theo tên, căn hộ)
// @route   GET /api/residents
export const getAllResidents = async (req, res) => {
    try {
        const { name, apartment, page = 1, limit = 10 } = req.query;
        const query = {};

        if (name) {
            query.name = { $regex: name, $options: 'i' };
        }
        if (apartment) {
            query.apartment = { $regex: apartment, $options: 'i' };
        }
        if (req.query.phoneNumber) {
            query.phoneNumber = { $regex: req.query.phoneNumber, $options: 'i' };
        }
        if (req.query.cccd) {
            query.cccd = { $regex: req.query.cccd, $options: 'i' };
        }

        const residents = await Resident.find(query)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            // .populate('userId', 'username status') // Lấy kèm thông tin user
            .sort({ createdAt: -1 });

        const count = await Resident.countDocuments(query);

        res.json({
            success: true,
            data: residents,
            totalPages: Math.ceil(count / limit),
            currentPage: Number(page)
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi lấy danh sách cư dân' });
    }
};

// @desc    Lấy chi tiết cư dân
// @route   GET /api/residents/:id
export const getResidentById = async (req, res) => {
    try {
        const resident = await Resident.findById(req.params.id)
        // .populate('userId', 'username role status email'); // Populate thêm nếu User có email

        if (!resident) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy cư dân' });
        }
        res.json({ success: true, data: resident });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi lấy thông tin cư dân' });
    }
};

// @desc    Cập nhật thông tin cư dân (Chỉ Info text)
// @route   PUT /api/residents/:id
export const updateResident = async (req, res) => {
    try {
        const { name, apartment, phoneNumber } = req.body;

        // Không cho phép update CCCD (định danh) hoặc userId ở API này
        const updatedResident = await Resident.findByIdAndUpdate(
            req.params.id,
            { name, apartment, phoneNumber },
            { new: true, runValidators: true }
        );

        if (!updatedResident) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy cư dân' });
        }

        res.json({ success: true, data: updatedResident, message: 'Cập nhật thành công' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi cập nhật cư dân' });
    }
};

// @desc    Xóa mềm cư dân (Soft Delete)
// @route   DELETE /api/residents/:id
export const deleteResident = async (req, res) => {
    try {
        const resident = await Resident.findById(req.params.id);
        if (!resident) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy cư dân' });
        }

        // Soft delete: set active = false
        resident.active = false;
        await resident.save();

        // Tùy chọn: Disable luôn user account tương ứng?
        if (resident.userId) {
            await User.findByIdAndUpdate(resident.userId, { active: false });
        }

        res.json({ success: true, message: 'Đã vô hiệu hóa cư dân (Soft Delete)' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi xóa cư dân' });
    }
};

import Resident from '../models/Resident.js';
import User from '../models/User.js';
import FaceEmbedding from '../models/FaceEmbedding.js';
import { getFaceEmbedding } from '../services/aiService.js';
import bcrypt from 'bcryptjs';

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
            status: 'active'
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

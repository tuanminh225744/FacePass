import AccessLog from '../models/AccessLog.js';
import { getFaceEmbedding } from '../services/aiService.js';
import { findMatchingResident } from '../services/faceService.js';

export const checkIn = async (req, res) => {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).json({ success: false, message: 'Thiếu ảnh check-in' });
        }

        // 1. Gọi AI Service lấy embedding
        const aiResult = await getFaceEmbedding(file.buffer, file.originalname);

        if (!aiResult.success) {
            return res.json({
                success: false,
                identified: false,
                message: 'Không phát hiện khuôn mặt'
            });
        }

        // 2. Tìm kiếm cư dân khớp
        const matchResult = await findMatchingResident(aiResult.embedding);

        if (matchResult.match) {
            const resident = matchResult.resident;

            // 3. Ghi log (Nếu cần logic phức tạp hơn như check timeOut thì thêm sau)
            const log = new AccessLog({
                personId: resident._id, // Lưu ý: AccessLog schema cần trường này ref tới Resident hoặc Visitor
                personType: 'Resident',
                timeIn: new Date(),
                method: 'face',
                score: matchResult.score,
                deviceId: 'CAM-01' // Mock device ID
            });
            await log.save();

            return res.json({
                success: true,
                identified: true,
                resident: resident,
                score: matchResult.score
            });
        } else {
            // Không nhận diện được -> Cần xác minh thủ công hoặc là khách
            return res.json({
                success: true,
                identified: false,
                message: 'Khuôn mặt không xác định'
            });
        }

    } catch (error) {
        console.error('Check-in error:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

export const getAccessLogs = async (req, res) => {
    try {
        const { date, type, page = 1, limit = 20 } = req.query;
        const query = {};

        if (date) {
            const start = new Date(date);
            start.setHours(0, 0, 0, 0);
            const end = new Date(date);
            end.setHours(23, 59, 59, 999);
            query.timeIn = { $gte: start, $lte: end };
        }

        if (type) {
            query.personType = type; // Resident, Visitor, Unknown
        }

        const logs = await AccessLog.find(query)
            .sort({ timeIn: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .populate('personId', 'name apartment phoneNumber'); // Populate resident info

        const count = await AccessLog.countDocuments(query);

        res.json({
            success: true,
            data: logs,
            totalPages: Math.ceil(count / limit),
            currentPage: Number(page)
        });
    } catch (error) {
        console.error('Get logs error:', error);
        res.status(500).json({ success: false, message: 'Lỗi lấy nhật ký ra vào' });
    }
};

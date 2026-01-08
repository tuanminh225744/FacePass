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
                type: 'resident',
                timeIn: new Date(),
                method: 'face'
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

import AccessLog from '../models/AccessLog.js';
import Resident from '../models/Resident.js';
import Visitor from '../models/Visitor.js';
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

        if (matchResult.match && matchResult.resident.active) {
            const resident = matchResult.resident;

            // 3. Check duplicate log within 5s
            const lastLog = await AccessLog.findOne({
                personId: resident._id,
                timeIn: { $gte: new Date(Date.now() - 5000) }
            }).sort({ timeIn: -1 });

            if (lastLog) {
                return res.json({
                    success: true,
                    identified: true,
                    resident: resident,
                    score: matchResult.score,
                    message: 'Already checked in recently'
                });
            }

            // 4. Ghi log moi
            const log = new AccessLog({
                personId: resident._id,
                personType: 'Resident',
                timeIn: new Date(),
                method: 'face',
                score: matchResult.score,
                deviceId: 'CAM-01'
            });
            await log.save();

            // Emit Socket Event
            const io = req.app.get('io');
            if (io) {
                await log.populate('personId', 'name apartment phoneNumber');
                io.emit('new_access_log', log);
            }

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

export const manualCheckIn = async (req, res) => {
    try {
        const { personType, residentId, name, reason } = req.body;

        let personId = null;

        if (personType === 'Resident') {
            if (!residentId) {
                return res.status(400).json({ success: false, message: 'Thiếu ID cư dân' });
            }
            const resident = await Resident.findById(residentId);
            if (!resident) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy cư dân' });
            }
            personId = resident._id;
        } else if (personType === 'Visitor') {
            if (!name || !reason) {
                return res.status(400).json({ success: false, message: 'Thiếu tên khách hoặc lý do' });
            }
            // Create new Visitor
            const newVisitor = new Visitor({
                name,
                purpose: reason,
                // cccd is optional now
            });
            await newVisitor.save();
            personId = newVisitor._id;
        } else {
            return res.status(400).json({ success: false, message: 'Loại đối tượng không hợp lệ' });
        }

        const log = new AccessLog({
            personId: personId,
            personType: personType,
            timeIn: new Date(),
            method: 'manual',
            score: null,
            deviceId: 'GUARD-PC'
        });

        await log.save();

        const io = req.app.get('io');
        if (io) {
            // Populate to show specific info
            if (personType === 'Resident') {
                await log.populate('personId', 'name apartment phoneNumber');
            } else {
                await log.populate('personId', 'name purpose');
            }
            io.emit('new_access_log', log);
        }

        res.json({ success: true, message: 'Ghi nhận thành công' });
    } catch (error) {
        console.error('Manual check-in error:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

export const getAccessLogs = async (req, res) => {
    try {
        const { date, type, page = 1, limit = 20 } = req.query;
        const query = {};

        // Security Check for Resident Role
        if (req.user && req.user.role === 'resident') {
            // Find the resident profile linked to this user
            // We need to import Resident model if not already imported or available
            // (Assuming 'Resident' is imported at top)
            const residentProfile = await Resident.findOne({ userId: req.user._id });

            if (!residentProfile) {
                return res.status(403).json({ success: false, message: 'Không tìm thấy hồ sơ cư dân.' });
            }

            // FORCE override filter
            query.personId = residentProfile._id;
        }

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

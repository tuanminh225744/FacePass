import Visitor from '../models/Visitor.js';

// @desc    Đăng ký khách mới (Visitor)
// @route   POST /api/visitors
// @access  Public (hoặc Private Guard)
export const registerVisitor = async (req, res) => {
    try {
        const { name, cccd, purpose } = req.body;

        if (!name || !cccd || !purpose) {
            return res.status(400).json({ success: false, message: 'Vui lòng nhập đủ tên, CCCD và mục đích' });
        }

        const newVisitor = new Visitor({
            name,
            cccd,
            purpose
        });

        await newVisitor.save();

        res.status(201).json({
            success: true,
            data: newVisitor,
            message: 'Đăng ký khách thành công'
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Lỗi đăng ký khách' });
    }
};

// @desc    Lấy danh sách khách
// @route   GET /api/visitors
export const getAllVisitors = async (req, res) => {
    try {
        const { page = 1, limit = 10, name } = req.query;
        const query = {};

        if (name) {
            query.name = { $regex: name, $options: 'i' };
        }

        const visitors = await Visitor.find(query)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const count = await Visitor.countDocuments(query);

        res.json({
            success: true,
            data: visitors,
            totalPages: Math.ceil(count / limit),
            currentPage: Number(page)
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi lấy danh sách khách' });
    }
};

// @desc    Lấy chi tiết khách
// @route   GET /api/visitors/:id
export const getVisitorById = async (req, res) => {
    try {
        const visitor = await Visitor.findById(req.params.id);
        if (!visitor) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy khách' });
        }
        res.json({ success: true, data: visitor });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi lấy thông tin khách' });
    }
};

// @desc    Cập nhật thông tin khách
// @route   PUT /api/visitors/:id
export const updateVisitor = async (req, res) => {
    try {
        const { name, cccd, purpose } = req.body;

        const updatedVisitor = await Visitor.findByIdAndUpdate(
            req.params.id,
            { name, cccd, purpose },
            { new: true, runValidators: true }
        );

        if (!updatedVisitor) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy khách' });
        }

        res.json({ success: true, data: updatedVisitor, message: 'Cập nhật thành công' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi cập nhật khách' });
    }
};

// @desc    Xóa khách
// @route   DELETE /api/visitors/:id
export const deleteVisitor = async (req, res) => {
    try {
        const visitor = await Visitor.findByIdAndDelete(req.params.id);
        if (!visitor) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy khách để xóa' });
        }
        res.json({ success: true, message: 'Đã xóa khách' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi xóa khách' });
    }
};

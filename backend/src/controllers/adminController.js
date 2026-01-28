import Resident from '../models/Resident.js';
import User from '../models/User.js';
import AccessLog from '../models/AccessLog.js';
import moment from 'moment';

export const getDashboardStats = async (req, res) => {
    try {
        // 1. Basic Counts
        const totalResidents = await Resident.countDocuments({ deleted: false });
        const totalUsers = await User.countDocuments();

        const startOfDay = moment().startOf('day').toDate();
        const endOfDay = moment().endOf('day').toDate();

        const todayLogs = await AccessLog.countDocuments({
            timeIn: { $gte: startOfDay, $lte: endOfDay }
        });

        // 2. Bar Chart Data (Logs by Hour today)
        const hourlyLogs = await AccessLog.aggregate([
            {
                $match: {
                    timeIn: { $gte: startOfDay, $lte: endOfDay }
                }
            },
            {
                $project: {
                    hour: { $hour: "$timeIn" }
                }
            },
            {
                $group: {
                    _id: "$hour",
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Format for Recharts (fill missing hours)
        const dataBar = Array.from({ length: 24 }, (_, i) => {
            const found = hourlyLogs.find(h => h._id === i + 7); // MongoDB might return UTC hour, need careful timezone handling or just use server time if set correctly. 
            // Simplified: Assuming server time matches or just raw hour. 
            // Better: use hour directly. 
            const hourData = hourlyLogs.find(h => h._id === i);
            return {
                name: `${i}:00`,
                uv: hourData ? hourData.count : 0
            };
        });

        // Optimize display: only show hours with data or specific intervals? User current code shows intervals.
        // Let's stick to returning full 24h or let frontend filter.
        // Current frontend mock has 06:00, 08:00 etc.
        // Let's return all non-zero or full day.

        // 3. Pie Chart Data (Ratio Resident vs Visitor) - ALL TIME or TODAY?
        // Usually Pie chart shows general distribution. Let's do ALL TIME for now or Today?
        // Let's do Access Logs distribution by PersonType (Today) to be relevant to "Lưu lượng".
        const typeDistribution = await AccessLog.aggregate([
            {
                $match: {
                    timeIn: { $gte: startOfDay, $lte: endOfDay }
                }
            },
            {
                $group: {
                    _id: "$personType",
                    count: { $sum: 1 }
                }
            }
        ]);

        const dataPie = [
            { name: 'Cư dân', value: typeDistribution.find(x => x._id === 'Resident')?.count || 0 },
            { name: 'Khách', value: typeDistribution.find(x => x._id === 'Visitor')?.count || 0 }
        ];

        res.json({
            success: true,
            data: {
                stats: {
                    residents: totalResidents,
                    users: totalUsers,
                    todayLogs: todayLogs,
                    warnings: 0 // Placeholder for now
                },
                charts: {
                    bar: dataBar,
                    pie: dataPie
                }
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Lỗi server khi lấy thống kê' });
    }
};

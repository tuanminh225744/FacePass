import Resident from '../models/Resident.js';
import User from '../models/User.js';
import AccessLog from '../models/AccessLog.js';
import moment from 'moment';

export const getDashboardStats = async (req, res) => {
    try {
        // 1. Basic Counts
        // Resident model uses 'active' for soft-delete/lock, but doesn't have a 'deleted' field.
        // We count all or just active? Assuming we want Total Registered Residents in DB.
        const totalResidents = await Resident.countDocuments({});
        const totalUsers = await User.countDocuments();

        const startOfDay = moment().startOf('day').toDate();
        const endOfDay = moment().endOf('day').toDate();

        const todayLogs = await AccessLog.countDocuments({
            timeIn: { $gte: startOfDay, $lte: endOfDay }
        });

        // 2. Bar Chart Data (Logs by Hour today) - Split by Resident/Visitor
        const hourlyLogs = await AccessLog.aggregate([
            {
                $match: {
                    timeIn: { $gte: startOfDay, $lte: endOfDay }
                }
            },
            {
                $project: {
                    hour: { $hour: { date: "$timeIn", timezone: "+07:00" } }, // Fix UTC offset for VN
                    personType: 1
                }
            },
            {
                $group: {
                    _id: { hour: "$hour", type: "$personType" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id.hour": 1 } }
        ]);

        // Format for Recharts
        const dataBar = Array.from({ length: 24 }, (_, i) => {
            const hour = i;
            const residentData = hourlyLogs.find(h => h._id.hour === hour && h._id.type === 'Resident');
            const visitorData = hourlyLogs.find(h => h._id.hour === hour && h._id.type === 'Visitor');

            return {
                name: `${hour}:00`,
                residents: residentData ? residentData.count : 0,
                visitors: visitorData ? visitorData.count : 0
            };
        });

        // 3. Pie Chart Data (Ratio Resident vs Visitor - Today's Traffic)
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

        const residentCount = typeDistribution.find(x => x._id === 'Resident')?.count || 0;
        const visitorCount = typeDistribution.find(x => x._id === 'Visitor')?.count || 0;

        const dataPie = [
            { name: 'Cư dân', value: residentCount },
            { name: 'Khách', value: visitorCount }
        ];

        res.json({
            success: true,
            data: {
                stats: {
                    residents: totalResidents,
                    users: totalUsers,
                    todayLogs: todayLogs,
                    warnings: 0
                },
                charts: {
                    bar: dataBar,
                    pie: dataPie
                }
            }
        });

    } catch (error) {
        console.error("Dashboard Stats Error:", error);
        res.status(500).json({ success: false, message: 'Lỗi server khi lấy thống kê' });
    }
};

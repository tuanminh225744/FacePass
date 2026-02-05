import React, { useEffect, useState } from 'react';
import { Card, Col, Row, Statistic, Spin } from 'antd';
import { UserOutlined, TeamOutlined, QrcodeOutlined, AlertOutlined } from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../../services/api';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        residents: 0,
        users: 0,
        todayLogs: 0,
        warnings: 0
    });
    const [dataBar, setDataBar] = useState([]);
    const [dataPie, setDataPie] = useState([]);
    const [loading, setLoading] = useState(true);

    const COLORS = ['#0088FE', '#FFBB28'];

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/admin/stats');
                if (response.data.success) {
                    setStats(response.data.data.stats);
                    setDataBar(response.data.data.charts.bar);
                    setDataPie(response.data.data.charts.pie);
                }
            } catch (error) {
                console.error("Failed to fetch stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const statCards = [
        { title: 'Tổng số Cư dân', value: stats.residents, icon: <TeamOutlined />, color: '#1890ff' },
        { title: 'User Hệ thống', value: stats.users, icon: <UserOutlined />, color: '#722ed1' },
        { title: 'Lượt vào hôm nay', value: stats.todayLogs, icon: <QrcodeOutlined />, color: '#52c41a' },
        // { title: 'Cảnh báo lạ', value: stats.warnings, icon: <AlertOutlined />, color: '#f5222d' },
    ];

    return (
        <div>
            <h2>Dashboard Tổng quan</h2>
            {loading ? <div style={{ textAlign: 'center', margin: 50 }}><Spin /></div> : (
                <>
                    <Row gutter={[16, 16]}>
                        {statCards.map((item, index) => (
                            <Col xs={24} sm={12} md={8} key={index}>
                                <Card bordered={false} hoverable>
                                    <Statistic
                                        title={item.title}
                                        value={item.value}
                                        prefix={<span style={{ color: item.color, marginRight: 8 }}>{item.icon}</span>}
                                    />
                                </Card>
                            </Col>
                        ))}
                    </Row>

                    <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                        <Col xs={24} md={16}>
                            <Card title="Lưu lượng ra vào theo giờ">
                                <div style={{ height: 300 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={dataBar}
                                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="residents" name="Cư dân" fill="#0088FE" />
                                            <Bar dataKey="visitors" name="Khách" fill="#FFBB28" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>
                        </Col>
                        <Col xs={24} md={8}>
                            <Card title="Tỷ lệ Khách vs Cư dân">
                                <div style={{ height: 300 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={dataPie}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                paddingAngle={5}
                                                dataKey="value"
                                                label
                                            >
                                                {dataPie.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                            <Legend verticalAlign="bottom" height={36} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>
                        </Col>
                    </Row>
                </>
            )}
        </div>
    );
};

export default AdminDashboard;

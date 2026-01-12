import React from 'react';
import { Card, Col, Row, Statistic } from 'antd';
import { UserOutlined, TeamOutlined, QrcodeOutlined, AlertOutlined } from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const AdminDashboard = () => {
    // Mock Data
    const stats = [
        { title: 'Tổng số Cư dân', value: 128, icon: <TeamOutlined />, color: '#1890ff' },
        { title: 'User Hệ thống', value: 5, icon: <UserOutlined />, color: '#722ed1' },
        { title: 'Lượt vào hôm nay', value: 45, icon: <QrcodeOutlined />, color: '#52c41a' },
        { title: 'Cảnh báo lạ', value: 3, icon: <AlertOutlined />, color: '#f5222d' },
    ];

    const dataBar = [
        { name: '06:00', uv: 4 },
        { name: '08:00', uv: 15 },
        { name: '10:00', uv: 8 },
        { name: '12:00', uv: 22 },
        { name: '14:00', uv: 10 },
        { name: '16:00', uv: 18 },
        { name: '18:00', uv: 35 },
    ];

    const dataPie = [
        { name: 'Cư dân', value: 400 },
        { name: 'Khách', value: 100 },
    ];
    const COLORS = ['#0088FE', '#FFBB28'];

    return (
        <div>
            <h2>Dashboard Tổng quan</h2>
            <Row gutter={[16, 16]}>
                {stats.map((item, index) => (
                    <Col xs={24} sm={12} md={6} key={index}>
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
                                    <Bar dataKey="uv" name="Lượt khách" fill="#1890ff" />
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
        </div>
    );
};

export default AdminDashboard;

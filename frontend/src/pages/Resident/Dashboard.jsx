import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Typography, Statistic, Table, Tag, Descriptions, DatePicker, Button } from 'antd';
import { ClockCircleOutlined, CheckCircleOutlined, UserOutlined, HistoryOutlined } from '@ant-design/icons';
import api from '../../services/api';
import moment from 'moment';

const { Title, Text } = Typography;

const ResidentDashboard = () => {
    const [residentInfo, setResidentInfo] = useState(null);
    const [logs, setLogs] = useState([]);
    const [loadingLogs, setLoadingLogs] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);

    // Initial Fetch
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const profileRes = await api.get('/residents/me');
                if (profileRes.data.success) {
                    setResidentInfo(profileRes.data.data);
                }
            } catch (error) {
                console.error(error);
            }
        };
        fetchProfile();
        fetchLogs();
    }, []);

    // Fetch Logs Function
    const fetchLogs = async (date = null) => {
        setLoadingLogs(true);
        try {
            const params = { limit: 100 };
            if (date) {
                params.date = date.format('YYYY-MM-DD');
            }
            const logRes = await api.get('/access/logs', { params });
            if (logRes.data.success) {
                setLogs(logRes.data.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingLogs(false);
        }
    };

    const handleDateChange = (date) => {
        setSelectedDate(date);
        fetchLogs(date);
    };

    const columns = [
        {
            title: 'Thời gian',
            dataIndex: 'timeIn',
            key: 'timeIn',
            render: (text) => moment(text).format('HH:mm:ss DD/MM/YYYY'),
        },
        {
            title: 'Phương thức',
            dataIndex: 'method',
            key: 'method',
            render: (method) => (
                <Tag color={method === 'face' ? 'green' : 'blue'}>
                    {method === 'face' ? 'Khuôn mặt' : 'Thủ công'}
                </Tag>
            )
        },
        {
            title: 'Thiết bị',
            dataIndex: 'deviceId',
            key: 'deviceId',
        }
    ];

    return (
        <div>
            {/* Top Section: Profile & Stats */}
            <Row gutter={[16, 16]}>
                <Col xs={24} md={16}>
                    <Card title={<><UserOutlined /> Thông tin cá nhân</>} bordered={false} style={{ height: '100%' }}>
                        <Descriptions column={{ xs: 1, sm: 2, md: 2 }} contentStyle={{ fontWeight: '500' }}>
                            <Descriptions.Item label="Họ tên">{residentInfo?.name}</Descriptions.Item>
                            <Descriptions.Item label="Căn hộ">{residentInfo?.apartment}</Descriptions.Item>
                            <Descriptions.Item label="SĐT">{residentInfo?.phoneNumber}</Descriptions.Item>
                            <Descriptions.Item label="CCCD">{residentInfo?.cccd}</Descriptions.Item>
                            <Descriptions.Item label="Trạng thái">
                                <Tag color={residentInfo?.active ? 'success' : 'error'}>
                                    {residentInfo?.active ? 'Đang hoạt động' : 'Bị khóa'}
                                </Tag>
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>
                </Col>
                <Col xs={24} md={8}>
                    <Card variant="borderless" style={{ height: '100%' }}>
                        <Statistic
                            title="Lần vào gần nhất"
                            value={logs.length > 0 ? moment(logs[0].timeIn).format('HH:mm - DD/MM') : 'Chưa có'}
                            prefix={<ClockCircleOutlined />}
                        />
                        <div style={{ marginTop: 24 }}>
                            <Statistic
                                title="Tổng lượt vào (gần đây)"
                                value={logs.length}
                                prefix={<CheckCircleOutlined />}
                            />
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Bottom Section: History */}
            <div style={{ marginTop: 24 }}>
                <Card
                    title={<><HistoryOutlined /> Lịch sử ra vào</>}
                    variant="borderless"
                    extra={
                        <div>
                            <DatePicker
                                onChange={handleDateChange}
                                placeholder="Lọc theo ngày"
                                value={selectedDate}
                            />
                            <Button onClick={() => { setSelectedDate(null); fetchLogs(null); }} style={{ marginLeft: 8 }}>
                                Xóa lọc
                            </Button>
                        </div>
                    }
                >
                    <Table
                        dataSource={logs}
                        columns={columns}
                        rowKey="_id"
                        loading={loadingLogs}
                        pagination={{ pageSize: 5, showSizeChanger: false }}
                    />
                </Card>
            </div>
        </div>
    );
};

export default ResidentDashboard;

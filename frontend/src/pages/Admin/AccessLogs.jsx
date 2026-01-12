import React, { useState, useEffect } from 'react';
import { Table, DatePicker, Select, Button, Tag, Space, Card, message } from 'antd';
import moment from 'moment';
import api from '../../services/api';

const { RangePicker } = DatePicker;
const { Option } = Select;

const AccessLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filterDate, setFilterDate] = useState(null);
    const [filterType, setFilterType] = useState(null);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

    const fetchLogs = async (page = 1) => {
        setLoading(true);
        try {
            const params = {
                page,
                limit: pagination.pageSize,
            };
            if (filterDate) {
                params.date = filterDate.format('YYYY-MM-DD');
            }
            if (filterType) {
                params.type = filterType;
            }

            const response = await api.get('/access/logs', { params });
            if (response.data.success) {
                setLogs(response.data.data);
                setPagination({
                    ...pagination,
                    current: response.data.currentPage,
                    total: response.data.totalPages * pagination.pageSize, // Approximation or backend returns totalCount
                    // If backend returns totalPages only, correct total might be tricky for Table pagination. 
                    // Better to rely on totalCount if backend provides, or just simple prev/next.
                    // My backend returns totalPages. Antd Table needs total items count. 
                    // Approximation: totalPages * limit. 
                });
            }
        } catch (error) {
            message.error('Không thể tải nhật ký.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs(pagination.current);
    }, [filterDate, filterType]);

    const handleTableChange = (newPagination) => {
        setPagination(newPagination);
        fetchLogs(newPagination.current);
    };

    const columns = [
        {
            title: 'Thời gian',
            dataIndex: 'timeIn',
            key: 'timeIn',
            render: (time) => moment(time).format('DD/MM/YYYY HH:mm:ss'),
        },
        {
            title: 'Tên',
            key: 'name',
            render: (_, record) => record.personId ? record.personId.name : 'Unknown',
        },
        {
            title: 'Loại',
            dataIndex: 'personType',
            key: 'personType',
            render: (type) => (
                <Tag color={type === 'Resident' ? 'green' : 'orange'}>
                    {type === 'Resident' ? 'CƯ DÂN' : 'KHÁCH'}
                </Tag>
            ),
        },
        {
            title: 'Score',
            dataIndex: 'score',
            key: 'score',
            render: (score) => score ? (score * 100).toFixed(2) + '%' : '-',
        },
        {
            title: 'Thiết bị',
            dataIndex: 'deviceId',
            key: 'deviceId',
            render: (id) => id || 'N/A',
        },
        {
            title: 'Phương thức',
            dataIndex: 'method',
            key: 'method',
            render: (method) => method === 'face' ? <Tag color="blue">FACE ID</Tag> : <Tag>MANUAL</Tag>,
        },
    ];

    return (
        <div>
            <h2>Nhật ký Ra/Vào</h2>
            <Card style={{ marginBottom: 16 }}>
                <Space>
                    <span>Lọc theo ngày:</span>
                    <DatePicker
                        onChange={(date) => setFilterDate(date)}
                        placeholder="Chọn ngày"
                        style={{ width: 200 }}
                    />

                    <span>Loại:</span>
                    <Select
                        allowClear
                        placeholder="Tất cả"
                        style={{ width: 150 }}
                        onChange={(value) => setFilterType(value)}
                    >
                        <Option value="Resident">Cư dân</Option>
                        <Option value="Visitor">Khách</Option>
                    </Select>

                    <Button type="primary" onClick={() => fetchLogs(1)}>Làm mới</Button>
                </Space>
            </Card>

            <Table
                columns={columns}
                dataSource={logs}
                rowKey="_id"
                loading={loading}
                pagination={pagination}
                onChange={handleTableChange}
            />
        </div>
    );
};

export default AccessLogs;

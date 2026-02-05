import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Input, Card, Tag, message, Form } from 'antd';
import { SearchOutlined, UserOutlined, HomeOutlined } from '@ant-design/icons';
import api from '../../services/api';

const ResidentLookup = () => {
    const [residents, setResidents] = useState([]);
    const [loading, setLoading] = useState(false);

    // Filter State
    const [filters, setFilters] = useState({
        name: '',
        apartment: ''
    });

    const fetchResidents = async () => {
        setLoading(true);
        try {
            // Remove empty keys
            const params = Object.fromEntries(Object.entries(filters).filter(([_, v]) => v != null && v !== ''));

            const response = await api.get('/residents', { params });

            if (response.data && response.data.success) {
                setResidents(response.data.data);
            } else {
                setResidents([]);
            }
        } catch (error) {
            message.error('Không thể tải danh sách cư dân.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResidents();
    }, []);

    const handleSearch = () => {
        fetchResidents();
    };

    const handleReset = () => {
        setFilters({ name: '', apartment: '' });
        // Clean filters then fetch, need to rely on state or pass empty obj
        // Since state update is async, we pass empty obj to API but update state for UI
        // Actually simplest is just set state and user clicks search, or force fetch. 
        // Let's implement force fetch for UX
        setLoading(true);
        api.get('/residents').then(res => {
            if (res.data.success) setResidents(res.data.data);
            setLoading(false);
        });
    };

    const columns = [
        {
            title: 'Họ tên',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Căn hộ',
            dataIndex: 'apartment',
            key: 'apartment',
            render: (text) => <Tag color="blue">{text}</Tag>
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'phoneNumber',
            key: 'phoneNumber',
        },
    ];

    return (
        <div>
            <h2 style={{ marginBottom: 16 }}>Tra cứu Cư dân</h2>

            <Card style={{ marginBottom: 16 }}>
                <Form layout="inline" onFinish={handleSearch} style={{ display: 'flex', gap: 8 }}>
                    <Form.Item name="name" style={{ margin: 0 }}>
                        <Input
                            placeholder="Tìm theo tên..."
                            prefix={<UserOutlined />}
                            value={filters.name}
                            onChange={(e) => setFilters(prev => ({ ...prev, name: e.target.value }))}
                        />
                    </Form.Item>
                    <Form.Item name="apartment" style={{ margin: 0 }}>
                        <Input
                            placeholder="Tìm theo căn hộ..."
                            prefix={<HomeOutlined />}
                            value={filters.apartment}
                            onChange={(e) => setFilters(prev => ({ ...prev, apartment: e.target.value }))}
                        />
                    </Form.Item>

                    <Button type="primary" htmlType="submit" icon={<SearchOutlined />} loading={loading}>
                        Tìm kiếm
                    </Button>
                    <Button onClick={handleReset}>
                        Xóa lọc
                    </Button>
                </Form>
            </Card>

            <Table
                columns={columns}
                dataSource={residents}
                rowKey="_id"
                loading={loading}
                pagination={{ pageSize: 10 }}
            />
        </div>
    );
};

export default ResidentLookup;

import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, Modal, Form, Input, Upload, message, Tooltip, Popconfirm, Row, Col, Card, Switch } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined, UserOutlined, SearchOutlined, LockOutlined, UnlockOutlined } from '@ant-design/icons';
import api from '../../services/api';

const Residents = () => {
    const [residents, setResidents] = useState([]);
    const [loading, setLoading] = useState(false);

    // Filter State
    const [filters, setFilters] = useState({
        name: '',
        apartment: '',
        phoneNumber: '',
        cccd: '',
        active: true
    });

    // States for Register Modal
    const [registerModalVisible, setRegisterModalVisible] = useState(false);
    const [registerForm] = Form.useForm();
    const [fileList, setFileList] = useState([]);

    // States for Edit Modal
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editForm] = Form.useForm();
    const [editingResident, setEditingResident] = useState(null);

    const fetchResidents = async () => {
        setLoading(true);
        try {
            // Remove empty keys and false values
            const params = Object.fromEntries(Object.entries(filters).filter(([_, v]) => v != null && v !== '' && v !== false));

            const response = await api.get('/residents', { params });
            // Check success and data payload structure
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
    }, [filters.active]); // Reload when active toggle changes

    const handleSearch = () => {
        fetchResidents();
    };

    const handleResetFilter = () => {
        setFilters({
            name: '',
            apartment: '',
            phoneNumber: '',
            cccd: '',
            active: false
        });
        // We need to trigger fetch after state update, but state update is async.
        // Quick workaround: pass empty obj directly or use useEffect on filters (but that might trigger too often)
        // Let's just reset state and user clicks search, or rely on another useEffect.
        // Better:
        // setFilters({...}); then search is tricky.
        // Let's just clear inputs visually. 
        // Actually best UX is:
        // 1. Clear state
        // 2. Fetch with empty
    };


    const handleRegister = async (values) => {
        if (fileList.length === 0) {
            message.error('Vui lòng chọn ảnh khuôn mặt!');
            return;
        }

        const formData = new FormData();
        formData.append('username', values.username);
        formData.append('password', values.password);
        formData.append('name', values.name);
        formData.append('apartment', values.apartment);
        formData.append('cccd', values.cccd);
        formData.append('phoneNumber', values.phoneNumber);
        formData.append('image', fileList[0].originFileObj || fileList[0]);

        try {
            setLoading(true);
            const response = await api.post('/residents/register', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success) {
                message.success('Đăng ký cư dân thành công!');
                setRegisterModalVisible(false);
                registerForm.resetFields();
                setFileList([]);
                fetchResidents();
            }
        } catch (error) {
            console.error(error);
            message.error(error.response?.data?.message || 'Đăng ký thất bại.');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (values) => {
        try {
            const response = await api.put(`/residents/${editingResident._id}`, values);
            if (response.data.success) {
                message.success('Cập nhật thông tin thành công!');
                setEditModalVisible(false);
                setEditingResident(null);
                fetchResidents();
            }
        } catch (error) {
            message.error(error.response?.data?.message || 'Cập nhật thất bại.');
        }
    };

    const handleToggleStatus = async (record) => {
        try {
            const response = await api.patch(`/residents/${record._id}/status`);
            if (response.data.success) {
                message.success(response.data.message);
                fetchResidents();
            }
        } catch (error) {
            message.error('Lỗi thay đổi trạng thái.');
        }
    };

    const openEditModal = (record) => {
        setEditingResident(record);
        editForm.setFieldsValue({
            name: record.name,
            apartment: record.apartment,
            phoneNumber: record.phoneNumber,
            cccd: record.cccd
        });
        setEditModalVisible(true);
    };

    const uploadProps = {
        onRemove: (file) => {
            setFileList([]);
        },
        beforeUpload: (file) => {
            setFileList([file]);
            return false; // Prevent auto upload
        },
        fileList,
        maxCount: 1,
        listType: "picture"
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
            title: 'SĐT',
            dataIndex: 'phoneNumber',
            key: 'phoneNumber',
        },
        {
            title: 'CCCD',
            dataIndex: 'cccd',
            key: 'cccd',
        },
        {
            title: 'Trạng thái',
            dataIndex: 'active',
            key: 'active',
            render: (active) => (
                <Tag color={active ? 'success' : 'error'}>
                    {active ? 'ACTIVE' : 'INACTIVE'}
                </Tag>
            ),
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Tooltip title="Sửa thông tin">
                        <Button icon={<EditOutlined />} onClick={() => openEditModal(record)} />
                    </Tooltip>

                    <Tooltip title={record.active ? "Khóa tài khoản" : "Mở khóa"}>
                        <Popconfirm
                            title={record.active ? "Bạn muốn khóa cư dân này?" : "Bạn muốn mở khóa cư dân này?"}
                            onConfirm={() => handleToggleStatus(record)}
                        >
                            <Button
                                icon={record.active ? <LockOutlined /> : <UnlockOutlined />}
                                danger={record.active}
                                type={!record.active ? 'primary' : 'default'}
                            />
                        </Popconfirm>
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>Quản lý Cư dân</h2>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setRegisterModalVisible(true)}>
                    Đăng ký Cư dân Mới
                </Button>
            </div>

            {/* Filter Section */}
            <Card style={{ marginBottom: 16 }}>
                <Form layout="inline" onFinish={handleSearch} style={{ display: 'flex', width: '100%' }}>

                    {/* Left Side Filters */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, flex: 1 }}>
                        <Form.Item name="name" style={{ marginRight: 0 }}>
                            <Input
                                placeholder="Tên cư dân"
                                prefix={<UserOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
                                value={filters.name}
                                onChange={(e) => setFilters({ ...filters, name: e.target.value })}
                            />
                        </Form.Item>
                        <Form.Item name="apartment" style={{ marginRight: 0 }}>
                            <Input
                                placeholder="Căn hộ"
                                value={filters.apartment}
                                onChange={(e) => setFilters({ ...filters, apartment: e.target.value })}
                            />
                        </Form.Item>
                        <Form.Item name="phoneNumber" style={{ marginRight: 0 }}>
                            <Input
                                placeholder="SĐT"
                                value={filters.phoneNumber}
                                onChange={(e) => setFilters({ ...filters, phoneNumber: e.target.value })}
                            />
                        </Form.Item>
                        <Form.Item name="cccd" style={{ marginRight: 0 }}>
                            <Input
                                placeholder="CCCD"
                                value={filters.cccd}
                                onChange={(e) => setFilters({ ...filters, cccd: e.target.value })}
                            />
                        </Form.Item>

                        <Form.Item style={{ marginRight: 0 }}>
                            <Button type="primary" htmlType="submit" icon={<SearchOutlined />} loading={loading}>
                                Tìm kiếm
                            </Button>
                        </Form.Item>
                        <Form.Item style={{ marginRight: 0 }}>
                            <Button onClick={() => {
                                setFilters({ name: '', apartment: '', phoneNumber: '', cccd: '', active: false });
                            }}>
                                Xóa
                            </Button>
                        </Form.Item>
                    </div>

                    {/* Right Side Toggle */}
                    <Form.Item label="Ẩn Inactive" style={{ marginLeft: 'auto', marginRight: 0 }}>
                        <Switch
                            checked={filters.active}
                            onChange={(checked) => setFilters({ ...filters, active: checked })}
                        />
                    </Form.Item>
                </Form>
            </Card>

            <Table
                columns={columns}
                dataSource={residents}
                rowKey="_id"
                loading={loading}
                pagination={{ pageSize: 8 }}
            />

            {/* Register Modal */}
            <Modal
                title="Đăng ký Cư dân & Khuôn mặt"
                open={registerModalVisible}
                onCancel={() => setRegisterModalVisible(false)}
                onOk={() => registerForm.submit()}
                width={700}
                confirmLoading={loading}
            >
                <Form form={registerForm} layout="vertical" onFinish={handleRegister}>
                    <Row gutter={16}>
                        <Col span={12}>
                            <h3>Thông tin Tài khoản</h3>
                            <Form.Item name="username" label="Username" rules={[{ required: true }]}>
                                <Input prefix={<UserOutlined />} placeholder="Tên đăng nhập" />
                            </Form.Item>
                            <Form.Item name="password" label="Password" rules={[{ required: true }]}>
                                <Input.Password placeholder="Mật khẩu" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <h3>Thông tin Cá nhân</h3>
                            <Form.Item name="name" label="Họ tên" rules={[{ required: true }]}>
                                <Input placeholder="Nguyễn Văn A" />
                            </Form.Item>
                            <Form.Item name="apartment" label="Căn hộ" rules={[{ required: true }]}>
                                <Input placeholder="101" />
                            </Form.Item>
                            <Form.Item name="cccd" label="CCCD" rules={[{ required: true }]}>
                                <Input placeholder="0123456789" />
                            </Form.Item>
                            <Form.Item name="phoneNumber" label="Số điện thoại" rules={[{ required: true }]}>
                                <Input placeholder="0987..." />
                            </Form.Item>
                        </Col>
                    </Row>

                    <h3>Ảnh khuôn mặt</h3>
                    <Form.Item required label="Upload ảnh chân dung (Rõ mặt)">
                        <Upload {...uploadProps}>
                            <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
                        </Upload>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Edit Modal */}
            <Modal
                title="Cập nhật thông tin Cư dân"
                open={editModalVisible}
                onCancel={() => setEditModalVisible(false)}
                onOk={() => editForm.submit()}
            >
                <Form form={editForm} layout="vertical" onFinish={handleUpdate}>
                    <Form.Item name="name" label="Họ tên" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="cccd" label="CCCD" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="apartment" label="Căn hộ" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="phoneNumber" label="Số điện thoại" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default Residents;

import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, Modal, Form, Input, Select, Switch, message, Tooltip, Popconfirm, Card } from 'antd';
import { formToJSON } from 'axios';
import { PlusOutlined, EditOutlined, DeleteOutlined, LockOutlined, UnlockOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import api from '../../services/api';

const { Option } = Select;

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [form] = Form.useForm();
    const [resetPassVisible, setResetPassVisible] = useState(false);
    const [resetPassUserId, setResetPassUserId] = useState(null);
    const [resetPassForm] = Form.useForm();

    // Filters
    const [filters, setFilters] = useState({
        username: '',
        role: undefined,
        active: true
    });

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const params = {};
            if (filters.username) params.username = filters.username;
            if (filters.role) params.role = filters.role;
            if (filters.active) params.active = true;

            const response = await api.get('/users', { params });
            setUsers(response.data);
        } catch (error) {
            message.error('Không thể tải danh sách người dùng.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [filters.active]); // Reload when active toggle changes

    const handleSearch = () => {
        fetchUsers();
    };

    const handleResetFilters = () => {
        setFilters({ username: '', role: '', active: false });
        // fetchUsers(); // Let user click search or auto? Let's just reset state. User clicks search.
    };

    const handleCreateOrUpdate = async (values) => {
        try {
            if (editingUser) {
                // Update
                await api.put(`/users/${editingUser._id}`, values);
                message.success('Cập nhật người dùng thành công!');
            } else {
                // Create
                await api.post('/users', { ...values, password: values.password || '123456' }); // Default password if simple create
                message.success('Tạo người dùng thành công!');
            }
            setModalVisible(false);
            form.resetFields();
            setEditingUser(null);
            fetchUsers();
        } catch (error) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra.');
        }
    };

    const handleToggleStatus = async (id, currentStatus) => {
        try {
            await api.patch(`/users/${id}/status`);
            message.success(`Đã ${currentStatus ? 'khóa' : 'mở khóa'} tài khoản.`);
            fetchUsers();
        } catch (error) {
            message.error('Không thể thay đổi trạng thái.');
        }
    };

    const handleResetPassword = async (values) => {
        try {
            await api.put(`/users/${resetPassUserId}/reset-password`, { newPassword: values.newPassword });
            message.success('Reset mật khẩu thành công!');
            setResetPassVisible(false);
            resetPassForm.resetFields();
            setResetPassUserId(null);
        } catch (error) {
            message.error(error.response?.data?.message || 'Lỗi reset mật khẩu.');
        }
    };

    const openModal = (user = null) => {
        setEditingUser(user);
        if (user) {
            form.setFieldsValue(user);
        } else {
            form.resetFields();
        }
        setModalVisible(true);
    };

    const openResetPassModal = (id) => {
        setResetPassUserId(id);
        setResetPassVisible(true);
    };

    const columns = [
        {
            title: 'Username',
            dataIndex: 'username',
            key: 'username',
        },
        {
            title: 'Vai trò',
            dataIndex: 'role',
            key: 'role',
            render: (role) => {
                let color = 'geekblue';
                if (role === 'admin') color = 'red';
                if (role === 'guard') color = 'green';
                return (
                    <Tag color={color} key={role}>
                        {role.toUpperCase()}
                    </Tag>
                );
            },
        },
        {
            title: 'Trạng thái',
            dataIndex: 'active',
            key: 'active',
            render: (active) => (
                <Tag color={active ? 'success' : 'error'}>
                    {active ? 'ACTIVE' : 'LOCKED'}
                </Tag>
            ),
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    {/* <Tooltip title="Sửa thông tin">
                        <Button icon={<EditOutlined />} onClick={() => openModal(record)} />
                    </Tooltip> */}

                    <Tooltip title={record.active ? 'Khóa tài khoản' : 'Mở khóa'}>
                        <Popconfirm
                            title={`Bạn có chắc muốn ${record.active ? 'khóa' : 'mở khóa'} user này?`}
                            onConfirm={() => handleToggleStatus(record._id, record.active)}
                        >
                            <Button
                                icon={record.active ? <LockOutlined /> : <UnlockOutlined />}
                                danger={record.active}
                            />
                        </Popconfirm>
                    </Tooltip>

                    <Tooltip title="Reset Mật khẩu">
                        <Button icon={<ReloadOutlined />} onClick={() => openResetPassModal(record._id)} />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                <h2>Quản lý Người dùng</h2>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
                    Thêm User Mới
                </Button>
            </div>

            <Card style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                    <Space wrap>
                        <Input
                            placeholder="Tìm theo Username"
                            value={filters.username}
                            onChange={(e) => setFilters(prev => ({ ...prev, username: e.target.value }))}
                            style={{ width: 200 }}
                            prefix={<SearchOutlined />}
                        />
                        <Select
                            placeholder="Chọn vai trò"
                            value={filters.role}
                            onChange={(value) => setFilters(prev => ({ ...prev, role: value }))}
                            style={{ width: 150 }}
                            allowClear
                        >
                            <Option value="admin">Admin</Option>
                            <Option value="guard">Bảo vệ</Option>
                            <Option value="resident">Cư dân</Option>
                        </Select>

                        <Button type="primary" onClick={handleSearch} icon={<SearchOutlined />}>Tìm kiếm</Button>
                        <Button onClick={() => {
                            setFilters({ username: '', role: '', active: false });
                            setTimeout(fetchUsers, 0);
                        }}>Xóa lọc</Button>
                    </Space>

                    <Space>
                        <span>Ẩn Inactive:</span>
                        <Switch
                            checked={filters.active}
                            onChange={(checked) => setFilters(prev => ({ ...prev, active: checked }))}
                        />
                    </Space>
                </div>
            </Card>

            <Table columns={columns} dataSource={users} rowKey="_id" loading={loading} />

            {/* Create/Edit User Modal */}
            <Modal
                title={editingUser ? "Cập nhật User" : "Thêm User mới"}
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                onOk={() => form.submit()}
            >
                <Form form={form} layout="vertical" onFinish={handleCreateOrUpdate}>
                    <Form.Item
                        name="username"
                        label="Tên đăng nhập"
                        rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập' }]}
                    >
                        <Input disabled={!!editingUser} />
                    </Form.Item>

                    {!editingUser && (
                        <Form.Item
                            name="password"
                            label="Mật khẩu"
                            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
                        >
                            <Input.Password />
                        </Form.Item>
                    )}

                    <Form.Item
                        name="role"
                        label="Vai trò"
                        rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
                    >
                        <Select>
                            <Option value="admin">Admin</Option>
                            <Option value="guard">Bảo vệ</Option>
                            <Option value="resident">Cư dân</Option>
                        </Select>
                    </Form.Item>

                    {/* Additional fields for Resident can be added conditionally here if needed directly */}
                </Form>
            </Modal>

            {/* Reset Password Modal */}
            <Modal
                title="Reset Mật khẩu"
                open={resetPassVisible}
                onCancel={() => setResetPassVisible(false)}
                onOk={() => resetPassForm.submit()}
            >
                <Form form={resetPassForm} layout="vertical" onFinish={handleResetPassword}>
                    <Form.Item
                        name="newPassword"
                        label="Mật khẩu mới"
                        rules={[{ required: true, message: 'Vui lòng nhập mật khẩu mới' }]}
                    >
                        <Input.Password />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default Users;

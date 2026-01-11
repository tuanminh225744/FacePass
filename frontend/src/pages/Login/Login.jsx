import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Alert } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { notification } from 'antd';

const { Title } = Typography;

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const from = location.state?.from?.pathname || "/";

    const onFinish = async (values) => {
        setLoading(true);
        setError(null);
        const result = await login(values.username, values.password);
        setLoading(false);

        if (result.success) {
            notification.success({
                message: 'Đăng nhập thành công',
                description: 'Đang chuyển hướng đến trang chủ',
            });
            // Role-based redirect
            const role = result.role;
            if (role === 'admin') navigate('/admin');
            else if (role === 'guard') navigate('/guard');
            else if (role === 'resident') navigate('/resident');
            else navigate('/');
        } else {
            notification.error({
                message: 'Đăng nhập thất bại',
                description: result.message,
            });
            setError(result.message);
        }
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            background: '#f0f2f5'
        }}>
            <Card style={{ width: 400, boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <Title level={2}>FacePass</Title>
                    <Typography.Text type="secondary">Hệ thống quản lý ra vào</Typography.Text>
                </div>

                {/* {error && (
                    <Alert
                        message={error}
                        type="error"
                        showIcon
                        style={{ marginBottom: 24 }}
                    />
                )} */}

                <Form
                    name="login_form"
                    initialValues={{ remember: true }}
                    onFinish={onFinish}
                    size="large"
                >
                    <Form.Item
                        name="username"
                        rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
                    >
                        <Input prefix={<UserOutlined />} placeholder="Tên đăng nhập" />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" block loading={loading}>
                            Đăng nhập
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default Login;

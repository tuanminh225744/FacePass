import React from 'react';
import { Layout, Dropdown, Avatar, Space, Typography, theme } from 'antd';
import {
    LogoutOutlined,
    UserOutlined
} from '@ant-design/icons';
import { useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const { Header, Content } = Layout;
const { Text } = Typography;

const GuardLayout = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    const userMenu = {
        items: [
            // {
            //     key: 'profile',
            //     label: 'Hồ sơ',
            //     icon: <UserOutlined />,
            //     disabled: true 
            // },
            // {
            //     type: 'divider',
            // },
            {
                key: 'logout',
                label: 'Đăng xuất',
                icon: <LogoutOutlined />,
                danger: true,
                onClick: logout
            },
        ]
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Header style={{
                padding: '0 24px',
                background: colorBgContainer,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: '0 2px 8px #f0f1f2'
            }}>
                <div style={{ color: '#001529', fontWeight: 'bold', fontSize: '18px', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <img src="/logo.png" alt="logo" style={{ height: 32, display: 'none' }} /> {/* Placeholder if needed */}
                    FacePass Guard
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Text>Xin chào, <Text strong>{user?.username || 'Guard'}</Text></Text>
                    <Dropdown menu={userMenu}>
                        <Avatar style={{ backgroundColor: '#1890ff', cursor: 'pointer' }} icon={<UserOutlined />} />
                    </Dropdown>
                </div>
            </Header>
            <Content style={{ margin: '24px', flex: 1 }}>
                <Outlet />
            </Content>
        </Layout>
    );
};

export default GuardLayout;

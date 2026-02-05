import React from 'react';
import { Layout, Dropdown, Avatar, Space, Typography, theme } from 'antd';
import {
    LogoutOutlined,
    UserOutlined
} from '@ant-design/icons';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
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

    const location = useLocation();
    const currentPath = location.pathname;

    const menus = [
        { label: 'Camera & Check-in', key: '/guard', icon: <UserOutlined /> },
        { label: 'Tra cứu Cư dân', key: '/guard/residents', icon: <UserOutlined /> }
    ];

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
                <div
                    style={{ color: '#001529', fontWeight: 'bold', fontSize: '18px', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
                    onClick={() => navigate('/guard')}
                >
                    <img src="/logo.png" alt="logo" style={{ height: 32, display: 'none' }} />
                    FacePass Guard
                </div>

                {/* Main Navigation */}
                <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                    <a
                        style={{ margin: '0 20px', fontWeight: currentPath === '/guard' ? 'bold' : 'normal', color: currentPath === '/guard' ? '#1890ff' : 'black' }}
                        onClick={() => navigate('/guard')}
                    >
                        Camera Control
                    </a>
                    <a
                        style={{ margin: '0 20px', fontWeight: currentPath.includes('/residents') ? 'bold' : 'normal', color: currentPath.includes('/residents') ? '#1890ff' : 'black' }}
                        onClick={() => navigate('/guard/residents')}
                    >
                        Residents
                    </a>
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

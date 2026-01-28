import React from 'react';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const antIcon = <LoadingOutlined style={{ fontSize: 48 }} spin />;

const Loading = ({ tip = "Đang tải..." }) => {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            width: '100vw',
            backgroundColor: '#f0f2f5',
            flexDirection: 'column',
            gap: 16
        }}>
            <Spin indicator={antIcon} />
            <div style={{
                color: '#1890ff',
                fontSize: '16px',
                fontWeight: 500,
                marginTop: 10
            }}>
                {tip}
            </div>
        </div>
    );
};

export default Loading;

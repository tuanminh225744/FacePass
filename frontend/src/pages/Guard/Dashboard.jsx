import React, { useState, useEffect, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Row, Col, Card, Button, List, Tag, Typography, Modal, Form, Input, Select, message, Radio, Space, AutoComplete, notification } from 'antd';
import { CameraOutlined, CheckCircleOutlined, UserOutlined, ClockCircleOutlined, FormOutlined, WarningOutlined, ReloadOutlined } from '@ant-design/icons';
import api from '../../services/api';
import moment from 'moment';
import socket from '../../services/socket';
import { debounce } from 'lodash';

const { Title, Text } = Typography;
const { Option } = Select;

const GuardDashboard = () => {
    // Camera & Auto Capture
    const webcamRef = useRef(null);
    const [processing, setProcessing] = useState(false);

    // Camera Devices
    const [devices, setDevices] = useState([]);
    const [selectedDeviceId, setSelectedDeviceId] = useState(null);

    // Result States
    const [lastCheck, setLastCheck] = useState(null);

    // Logs State
    const [recentLogs, setRecentLogs] = useState([]);

    // Manual Modal State
    const [manualModalVisible, setManualModalVisible] = useState(false);
    const [manualForm] = Form.useForm();
    const [manualLoading, setManualLoading] = useState(false);
    const [checkInType, setCheckInType] = useState('Resident');

    // Resident Search State
    const [residentOptions, setResidentOptions] = useState([]);
    const [searching, setSearching] = useState(false);

    const unknownCooldownRef = useRef(0);
    const COOLDOWN_TIME = 5000;

    // Initial Load, Socket & Camera Devices
    // Fetch Cameras Function
    const getCameras = async () => {
        try {
            await navigator.mediaDevices.getUserMedia({ video: true });
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter(device => device.kind === 'videoinput');
            setDevices(videoDevices);

            if (videoDevices.length > 0 && !selectedDeviceId) {
                setSelectedDeviceId(videoDevices[0].deviceId);
            }
        } catch (err) {
            console.error("Error fetching devices:", err);
            message.error("Vui lòng cấp quyền Camera!");
        }
    };

    // Initial Load & Socket
    useEffect(() => {
        fetchRecentLogs();
        getCameras();

        socket.on('new_access_log', (log) => {
            setRecentLogs(prev => [log, ...prev].slice(0, 20));
        });
        return () => socket.off('new_access_log');
    }, []);

    // Auto Capture Loop (Every 1s)
    useEffect(() => {
        const interval = setInterval(() => {
            if (!processing && !manualModalVisible) {
                captureAndIdentify();
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [processing, manualModalVisible]); // Pause if modal open

    const fetchRecentLogs = async () => {
        try {
            const response = await api.get('/access/logs?limit=20');
            if (response.data.success) {
                setRecentLogs(response.data.data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleResidentSearch = async (value) => {
        if (!value) {
            setResidentOptions([]);
            return;
        }
        setSearching(true);
        try {
            // Use existing residents API with name filter
            const response = await api.get('/residents', { params: { name: value, limit: 10 } });
            if (response.data.success) {
                const options = response.data.data.map(r => ({
                    label: `${r.name} - ${r.apartment}`,
                    value: r._id
                }));
                setResidentOptions(options);
            }
        } finally {
            setSearching(false);
        }
    };

    // Debounce search
    const debouncedSearch = useCallback((value) => {
        const timeoutId = setTimeout(() => handleResidentSearch(value), 500);
        return () => clearTimeout(timeoutId);
    }, []);


    const captureAndIdentify = async () => {
        if (!webcamRef.current) return;
        const imageSrc = webcamRef.current.getScreenshot();
        if (!imageSrc) return;

        setProcessing(true);

        const res = await fetch(imageSrc);
        const blob = await res.blob();
        const file = new File([blob], "capture.jpg", { type: "image/jpeg" });

        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await api.post('/access/check-in', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.success && response.data.identified) {
                setLastCheck(response.data);
                // message.success({ content: `Xin chào: ${response.data.resident.name}`, key: 'checkin', duration: 2 });
            } else {
                const now = Date.now();

                if (now - unknownCooldownRef.current > COOLDOWN_TIME) {
                    notification.error({
                        message: 'Không xác định được khuôn mặt',
                        description: 'Vui lòng thử lại',
                        duration: 2,
                    });

                    unknownCooldownRef.current = now;
                }
                // Silent fail
            }
        } catch (error) {
            // console.error(error);
        } finally {
            setProcessing(false);
        }
    };

    const handleManualSubmit = async (values) => {
        setManualLoading(true);
        try {
            const payload = { ...values, personType: checkInType };
            const response = await api.post('/access/manual-check-in', payload);
            if (response.data.success) {
                message.success('Check-in thành công! Mở cửa.');
                setManualModalVisible(false);
                manualForm.resetFields();
            }
        } catch (error) {
            message.error(error.response?.data?.message || 'Lỗi check-in');
        } finally {
            setManualLoading(false);
        }
    };

    return (
        <Row gutter={[16, 16]}>
            <Col xs={24} md={16}>
                <Card
                    title={<Space><CameraOutlined /> Camera Giám sát</Space>}
                    bordered={false}
                    bodyStyle={{ padding: 0 }}
                    extra={
                        <div style={{ display: 'flex', gap: 10 }}>
                            <Button icon={<ReloadOutlined />} onClick={() => getCameras()}>Refresh Cam</Button>
                            <Select
                                placeholder="Chọn Camera"
                                style={{ width: 250 }}
                                onChange={setSelectedDeviceId}
                                value={selectedDeviceId}
                            >
                                {devices.map((device, key) => (
                                    <Option key={key} value={device.deviceId}>
                                        {device.label || `Camera ${key + 1}`}
                                    </Option>
                                ))}
                            </Select>
                        </div>
                    }
                >
                    <div style={{ position: 'relative', background: 'black', height: 480, display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
                        {selectedDeviceId && (
                            <Webcam
                                key={selectedDeviceId}
                                audio={false}
                                ref={webcamRef}
                                screenshotFormat="image/jpeg"
                                width="100%"
                                height="100%"
                                videoConstraints={{ deviceId: { exact: selectedDeviceId } }}
                            />
                        )}
                        {processing && (
                            <div style={{ position: 'absolute', top: 10, right: 10 }}>
                                <Tag color="processing" icon={<ReloadOutlined spin />}>AI Processing...</Tag>
                            </div>
                        )}
                    </div>
                    <div style={{ padding: 16, display: 'flex', justifyContent: 'center' }}>
                        <Button
                            type="primary"
                            size="large"
                            icon={<FormOutlined />}
                            onClick={() => setManualModalVisible(true)}
                            style={{ width: 200 }}
                        >
                            Check-in Thủ công
                        </Button>
                    </div>
                </Card>

                {/* Last Auto Check-in Result
                {lastCheck && lastCheck.identified && (
                    <Card style={{ marginTop: 16, borderColor: '#52c41a' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                            <CheckCircleOutlined style={{ fontSize: 48, color: '#52c41a' }} />
                            <div>
                                <Title level={4} style={{ margin: 0, color: '#52c41a' }}>
                                    ACCESS GRANTED
                                </Title>
                                <Text strong style={{ fontSize: 18 }}>{lastCheck.resident.name}</Text>
                                <br />
                                <Text>Căn hộ: {lastCheck.resident.apartment}</Text>
                            </div>
                        </div>
                    </Card>
                )} */}
            </Col>

            <Col xs={24} md={8}>
                <Card title={<Space><ClockCircleOutlined /> Nhật ký (Realtime)</Space>} style={{ height: '100%' }} bodyStyle={{ padding: '0 12px' }}>
                    <div style={{ maxHeight: '80vh', overflowY: 'auto' }}>
                        <List
                            itemLayout="horizontal"
                            dataSource={recentLogs}
                            renderItem={(item) => (
                                <List.Item>
                                    <List.Item.Meta
                                        avatar={
                                            <Tag color={item.personType === 'Resident' ? 'blue' : 'orange'}>
                                                {item.personType === 'Visitor' ? 'KHÁCH' : 'CƯ DÂN'}
                                            </Tag>
                                        }
                                        title={
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Text strong>{item.personId ? item.personId.name : item.personType}</Text>
                                                <Text type="secondary" style={{ fontSize: 12 }}>{moment(item.timeIn).format('HH:mm:ss')}</Text>
                                            </div>
                                        }
                                        description={
                                            <div>
                                                {item.personType === 'Resident' && item.personId?.apartment && <Tag>{item.personId.apartment}</Tag>}
                                                {item.personType === 'Visitor' && item.personId?.purpose && <Text type="secondary">{item.personId.purpose}</Text>}
                                            </div>
                                        }
                                    />
                                </List.Item>
                            )}
                        />
                    </div>
                </Card>
            </Col>

            {/* Manual Modal */}
            <Modal
                title="Check-in Thủ công"
                open={manualModalVisible}
                onCancel={() => setManualModalVisible(false)}
                onOk={() => manualForm.submit()}
                confirmLoading={manualLoading}
            >
                <Form form={manualForm} layout="vertical" onFinish={handleManualSubmit} initialValues={{ personType: 'Resident' }}>
                    <Form.Item name="personType" label="Loại đối tượng">
                        <Radio.Group onChange={(e) => setCheckInType(e.target.value)} value={checkInType}>
                            <Radio.Button value="Resident">Cư dân</Radio.Button>
                            <Radio.Button value="Visitor">Khách</Radio.Button>
                        </Radio.Group>
                    </Form.Item>

                    {checkInType === 'Resident' ? (
                        <Form.Item name="residentId" label="Tìm kiếm Cư dân" rules={[{ required: true, message: 'Vui lòng chọn cư dân' }]}>
                            <AutoComplete
                                placeholder="Nhập tên cư dân..."
                                onSearch={debouncedSearch}
                                options={residentOptions}
                                loading={searching}
                                style={{ width: '100%' }}
                            />
                        </Form.Item>
                    ) : (
                        <>
                            <Form.Item name="name" label="Tên khách" rules={[{ required: true }]}>
                                <Input />
                            </Form.Item>
                            <Form.Item name="reason" label="Lý do / Mục đích" rules={[{ required: true }]}>
                                <Input />
                            </Form.Item>
                        </>
                    )}
                </Form>
            </Modal>
        </Row>
    );
};

export default GuardDashboard;

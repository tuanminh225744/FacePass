import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_BASE_URL;

const socket = io(SOCKET_URL, {
    autoConnect: false,
    reconnection: true,
});

export const connectSocket = (token) => {
    if (token) {
        socket.auth = { token };
        socket.connect();
    }
};

export const disconnectSocket = () => {
    if (socket.connected) {
        socket.disconnect();
    }
};

export default socket;

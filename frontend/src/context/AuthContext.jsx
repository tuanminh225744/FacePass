import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import api, { setAccessToken } from '../services/api';
import { connectSocket, disconnectSocket } from '../services/socket';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            try {
                const response = await api.post('/auth/refresh');
                const { accessToken } = response.data;

                setAccessToken(accessToken);

                const decoded = jwtDecode(accessToken);

                setUser({ _id: decoded.id, role: decoded.role, username: decoded.username });
                connectSocket(accessToken);

            } catch (error) {
                console.log("Session init failed or expired");
                localStorage.removeItem('user');
            } finally {
                setLoading(false);
            }
        };

        initAuth();
    }, []);

    const login = async (username, password) => {
        try {
            const response = await api.post('/auth/login', { username, password });
            const { accessToken, role, _id, username: uName } = response.data;

            setAccessToken(accessToken);

            const userData = { _id, username: uName, role };
            setUser(userData);
            connectSocket(accessToken);

            return { success: true, role };
        } catch (error) {
            console.error("Login failed:", error);
            return {
                success: false,
                message: error.response?.data?.message || 'Đăng nhập thất bại'
            };
        }
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (e) {
            console.error("Logout error", e);
        }
        setAccessToken(null);
        setUser(null);
        disconnectSocket();
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

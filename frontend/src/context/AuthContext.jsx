import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { connectSocket, disconnectSocket } from '../services/socket';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            // Validate token or get user info
            // For now, assuming token persistence is enough or we fetch profile
            // api.get('/auth/me').then(...)

            // Simulate user load for now or decode token
            // setUser({ ...decodedUser });
            setLoading(false);
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (username, password) => {
        // const response = await api.post('/auth/login', { username, password });
        // const { token, user } = response.data;
        // localStorage.setItem('token', token);
        // setUser(user);
        // connectSocket(token);
        console.log('Login placeholder');
    };

    const logout = () => {
        localStorage.removeItem('token');
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

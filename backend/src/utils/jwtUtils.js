import jwt from 'jsonwebtoken';

const generateAccessToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET, {
        expiresIn: '15m', // Access Token ngắn hạn
    });
};

const generateRefreshToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, {
        expiresIn: '7d', // Refresh Token dài hạn
    });
};

const verifyAccessToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET);
    } catch (error) {
        return null;
    }
};

const verifyRefreshToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
    } catch (error) {
        return null;
    }
};

export { generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken };
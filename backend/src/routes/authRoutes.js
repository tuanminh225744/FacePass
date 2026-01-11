import express from 'express';
import { login, refreshAccessToken, logout } from '../controllers/authController.js';

const router = express.Router();

router.post('/login', login);
router.post('/refresh', refreshAccessToken);
router.post('/logout', logout);

export default router;

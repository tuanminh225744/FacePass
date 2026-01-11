import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import residentRoutes from './routes/residentRoutes.js';
import accessRoutes from './routes/accessRoutes.js';
import visitorRoutes from './routes/visitorRoutes.js';

const app = express();

app.use(cors({
    origin: [process.env.FRONTEND_URL, 'http://localhost:5173'], // Frontend URL
    credentials: true
}));
app.use(cookieParser());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Backend Node.js đang chạy 🚀');
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/residents', residentRoutes);
app.use('/api/access', accessRoutes);
app.use('/api/visitors', visitorRoutes);

export default app;
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Backend Node.js đang chạy 🚀');
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

export default app;
import app from './app.js';
import connectDB from './config/db.js';
import accessRoutes from './routes/accessRoutes.js';
import visitorRoutes from './routes/visitorRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import dotenv from 'dotenv';
dotenv.config();

connectDB();

const PORT = process.env.PORT || 5000;
import http from 'http';
import { Server } from 'socket.io';

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: [process.env.FRONTEND_URL, 'http://localhost:5173'],
        credentials: true
    }
});

app.set('io', io);

app.use('/api/admin', adminRoutes);

io.on('connection', (socket) => {
    // console.log('Client connected:', socket.id);
    socket.on('disconnect', () => {
        // console.log('Client disconnected');
    });
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
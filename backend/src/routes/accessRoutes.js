import express from 'express';
import multer from 'multer';
import { checkIn } from '../controllers/accessController.js';

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/check-in', upload.single('image'), checkIn);

export default router;

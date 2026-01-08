import express from 'express';
import multer from 'multer';
import { registerResident } from '../controllers/residentController.js';

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/register', upload.single('image'), registerResident);

export default router;

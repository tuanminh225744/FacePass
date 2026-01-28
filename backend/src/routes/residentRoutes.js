import express from 'express';
import multer from 'multer';
import {
    registerResident,
    getAllResidents,
    getResidentById,
    updateResident,
    deleteResident,
    getCurrentResident
} from '../controllers/residentController.js';

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

import { protect } from '../middlewares/authMiddleware.js';

// Get Me (Must be before /:id)
router.get('/me', protect, getCurrentResident);

router.post('/register', upload.single('image'), registerResident);
router.get('/', getAllResidents);
router.get('/:id', getResidentById);
router.put('/:id', updateResident);
router.delete('/:id', deleteResident);

export default router;

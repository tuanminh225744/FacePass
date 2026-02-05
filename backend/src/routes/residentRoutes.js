import express from 'express';
import multer from 'multer';
import {
    registerResident,
    getAllResidents,
    getResidentById,
    updateResident,
    deleteResident,
    getCurrentResident,
    toggleResidentStatus
} from '../controllers/residentController.js';

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

import { protect, authorize } from '../middlewares/authMiddleware.js';

// Get Me (Must be before /:id)
router.get('/me', protect, getCurrentResident);

router.post('/register', protect, authorize(['admin']), upload.single('image'), registerResident);
router.get('/', protect, authorize(['admin', 'guard']), getAllResidents);
router.get('/:id', protect, authorize(['admin', 'guard']), getResidentById);
router.put('/:id', protect, authorize(['admin']), updateResident);
router.delete('/:id', protect, authorize(['admin']), deleteResident);
router.patch('/:id/status', protect, authorize(['admin']), toggleResidentStatus); // New route

export default router;

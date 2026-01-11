import express from 'express';
import multer from 'multer';
import {
    registerResident,
    getAllResidents,
    getResidentById,
    updateResident,
    deleteResident
} from '../controllers/residentController.js';

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/register', upload.single('image'), registerResident);
router.get('/', getAllResidents);
router.get('/:id', getResidentById);
router.put('/:id', updateResident);
router.delete('/:id', deleteResident);

export default router;

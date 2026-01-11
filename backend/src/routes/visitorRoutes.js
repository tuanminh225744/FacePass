import express from 'express';
import {
    registerVisitor,
    getAllVisitors,
    getVisitorById,
    updateVisitor,
    deleteVisitor
} from '../controllers/visitorController.js';

const router = express.Router();

router.post('/', registerVisitor);
router.get('/', getAllVisitors);
router.get('/:id', getVisitorById);
router.put('/:id', updateVisitor);
router.delete('/:id', deleteVisitor);

export default router;

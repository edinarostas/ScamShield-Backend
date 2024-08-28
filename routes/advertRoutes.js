import express from 'express';
import { getOtherUserAdverts, getAdvertById } from '../controllers/advertController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/others/:id', authenticateToken, getOtherUserAdverts);
router.get('/:id', authenticateToken, getAdvertById);

export default router;

import express from 'express';
import { getMessages, addMessage } from '../controllers/messageController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/:id', authenticateToken, getMessages);
router.post('/:advertId/conversations/:conversationId', authenticateToken, addMessage);

export default router;

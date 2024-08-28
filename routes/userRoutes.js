import express from 'express';
import { getUsername } from '../controllers/userController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/username', authenticateToken, getUsername);

export default router;

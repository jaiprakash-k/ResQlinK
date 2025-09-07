import { Router } from 'express';
import { syncChat } from '../controllers/chatController.js';
import { authenticate } from '../utils/authMiddleware.js';

const router = Router();
router.post('/sync', authenticate, syncChat);
export default router;

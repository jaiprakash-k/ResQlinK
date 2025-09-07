import { Router } from 'express';
import { getAllMessages } from '../models/messageModel.js';
import { authenticate, requireAdmin } from '../utils/authMiddleware.js';

const router = Router();
router.get('/messages/all', authenticate, requireAdmin, async (req, res, next) => {
  try { res.json(await getAllMessages()); } catch (e) { next(e); }
});
export default router;

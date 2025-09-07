import { Router } from 'express';
import { postSOS, getNearby } from '../controllers/sosController.js';
import { authenticate } from '../utils/authMiddleware.js';

const router = Router();
router.post('/', authenticate, postSOS);
router.get('/nearby', authenticate, getNearby);
export default router;

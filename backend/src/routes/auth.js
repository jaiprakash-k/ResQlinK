import { Router } from 'express';
import { anonymousLogin, emailLogin } from '../controllers/authController.js';

const router = Router();
router.post('/login/anonymous', anonymousLogin);
router.post('/login/email', emailLogin);
export default router;

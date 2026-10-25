import { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import { login } from '../services/auth/authService.js';
const router = Router();
router.get('/health', (_req, res) => res.json({ status: 'ok', service: 'brainhub-login' }));
router.post('/auth/login', async (req, res) => res.json(await login(req.body, req.ip)));
router.get('/auth/me', authenticate, (req, res) => res.json(req.user));
export default router;

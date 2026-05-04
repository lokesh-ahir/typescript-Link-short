import { Router } from 'express';
import { URLController } from '../controllers/urlController';
import { createUrlLimiter } from '../utils/rateLimiter';

const router = Router();
const urlController = new URLController();


router.post('/shorten', createUrlLimiter, (req, res) => urlController.shorten(req, res));


router.get('/:shortId/analytics', (req, res) => urlController.getAnalytics(req, res));


router.get('/:shortId/info', (req, res) => urlController.getInfo(req, res));

export default router;

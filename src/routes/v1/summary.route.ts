import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { getDailySummaryHandler } from '../../modules/summary/summary.controller';

const router = Router();

router.get('/daily', authenticate, getDailySummaryHandler);

export default router;

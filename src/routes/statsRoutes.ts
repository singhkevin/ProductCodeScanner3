import { Router } from 'express';
import { getOverviewStats, getScanActivity, getCompanies } from '../controllers/statsController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/overview', authenticate as any, getOverviewStats as any);
router.get('/activity', authenticate as any, getScanActivity as any);
router.get('/companies', authenticate as any, getCompanies as any);

export default router;

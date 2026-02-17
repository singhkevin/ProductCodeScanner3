import { Router } from 'express';
import { verifyQRCode, getScanHotspots } from '../controllers/scanController';
import { authenticate, authorize, optionalAuthenticate } from '../middleware/auth';

const router = Router();

// Public endpoint for mobile app to verify (can be authenticated too if needed)
router.post('/verify', optionalAuthenticate as any, verifyQRCode as any);

// Protected endpoint for admin/companies to see hotspots
router.get('/hotspots', authenticate as any, authorize(['ADMIN', 'COMPANY']), getScanHotspots as any);

export default router;

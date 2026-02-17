import { Router } from 'express';
import { createProduct, bulkUploadProducts, getCompanyProducts, getBulkRequests, handleBulkRequest } from '../controllers/productController';
import { authenticate, authorize } from '../middleware/auth';
import multer from 'multer';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', authenticate as any, authorize(['COMPANY', 'ADMIN']), createProduct as any);
router.post('/bulk', authenticate as any, authorize(['COMPANY']), upload.single('file'), bulkUploadProducts as any);
router.get('/bulk/requests', authenticate as any, authorize(['COMPANY', 'ADMIN']), getBulkRequests as any);
router.post('/bulk/requests/:id/handle', authenticate as any, authorize(['ADMIN']), handleBulkRequest as any);
router.get('/company', authenticate as any, authorize(['COMPANY', 'ADMIN']), getCompanyProducts as any);

export default router;

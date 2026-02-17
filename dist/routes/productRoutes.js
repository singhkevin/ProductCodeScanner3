"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const productController_1 = require("../controllers/productController");
const auth_1 = require("../middleware/auth");
const multer_1 = __importDefault(require("multer"));
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
router.post('/', auth_1.authenticate, (0, auth_1.authorize)(['COMPANY', 'ADMIN']), productController_1.createProduct);
router.post('/bulk', auth_1.authenticate, (0, auth_1.authorize)(['COMPANY']), upload.single('file'), productController_1.bulkUploadProducts);
router.get('/bulk/requests', auth_1.authenticate, (0, auth_1.authorize)(['COMPANY', 'ADMIN']), productController_1.getBulkRequests);
router.post('/bulk/requests/:id/handle', auth_1.authenticate, (0, auth_1.authorize)(['ADMIN']), productController_1.handleBulkRequest);
router.get('/company', auth_1.authenticate, (0, auth_1.authorize)(['COMPANY', 'ADMIN']), productController_1.getCompanyProducts);
exports.default = router;

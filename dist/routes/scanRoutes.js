"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const scanController_1 = require("../controllers/scanController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Public endpoint for mobile app to verify (can be authenticated too if needed)
router.post('/verify', auth_1.optionalAuthenticate, scanController_1.verifyQRCode);
// Protected endpoint for admin/companies to see hotspots
router.get('/hotspots', auth_1.authenticate, (0, auth_1.authorize)(['ADMIN', 'COMPANY']), scanController_1.getScanHotspots);
exports.default = router;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getScanActivity = exports.getCompanies = exports.getOverviewStats = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const getOverviewStats = async (req, res) => {
    try {
        const { companyId } = req.query;
        const where = {};
        if (companyId)
            where.qrCode = { product: { companyId } };
        const totalScans = await prisma_1.default.scan.count({
            where: companyId ? { qrCode: { product: { companyId } } } : {}
        });
        const genuineScans = await prisma_1.default.scan.count({
            where: {
                status: true,
                ...(companyId ? { qrCode: { product: { companyId } } } : {})
            }
        });
        const fakeScans = await prisma_1.default.scan.count({
            where: {
                status: false,
                ...(companyId ? { qrCode: { product: { companyId } } } : {})
            }
        });
        const registeredProducts = await prisma_1.default.product.count({
            where: companyId ? { companyId } : {}
        });
        res.json({
            totalScans,
            genuineScans,
            fakeScans,
            registeredProducts
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getOverviewStats = getOverviewStats;
const getCompanies = async (req, res) => {
    try {
        const companies = await prisma_1.default.company.findMany({
            select: { id: true, name: true }
        });
        res.json(companies);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getCompanies = getCompanies;
const getScanActivity = async (req, res) => {
    try {
        // Simple aggregate for the last 7 days (mocking the structure for charts)
        const activity = await prisma_1.default.scan.groupBy({
            by: ['status'],
            _count: {
                id: true
            }
        });
        res.json(activity);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getScanActivity = getScanActivity;

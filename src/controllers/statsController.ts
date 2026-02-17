import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const getOverviewStats = async (req: any, res: Response) => {
    try {
        const { companyId } = req.query;
        const where: any = {};
        if (companyId) where.qrCode = { product: { companyId } };

        const totalScans = await prisma.scan.count({
            where: companyId ? { qrCode: { product: { companyId } } } : {}
        });
        const genuineScans = await prisma.scan.count({
            where: {
                status: true,
                ...(companyId ? { qrCode: { product: { companyId } } } : {})
            }
        });
        const fakeScans = await prisma.scan.count({
            where: {
                status: false,
                ...(companyId ? { qrCode: { product: { companyId } } } : {})
            }
        });
        const registeredProducts = await prisma.product.count({
            where: companyId ? { companyId } : {}
        });

        res.json({
            totalScans,
            genuineScans,
            fakeScans,
            registeredProducts
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getCompanies = async (req: any, res: Response) => {
    try {
        const companies = await prisma.company.findMany({
            select: { id: true, name: true }
        });
        res.json(companies);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getScanActivity = async (req: Request, res: Response) => {
    try {
        // Simple aggregate for the last 7 days (mocking the structure for charts)
        const activity = await prisma.scan.groupBy({
            by: ['status'],
            _count: {
                id: true
            }
        });

        res.json(activity);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

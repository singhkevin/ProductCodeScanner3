import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../utils/prisma';

export const verifyQRCode = async (req: AuthRequest, res: Response) => {
    try {
        const { code, latitude, longitude } = req.body;
        const userId = req.user?.id; // Optional: user might be anonymous

        // Find the QR code
        const qrCode = await prisma.qRCode.findUnique({
            where: { code },
            include: { product: { include: { company: true } } },
        });

        if (!qrCode) {
            // LOG FAILED SCAN (POTENTIAL COUNTERFEIT)
            await prisma.scan.create({
                data: {
                    qrCodeId: undefined,
                    userId: userId || null,
                    latitude: latitude || null,
                    longitude: longitude || null,
                    status: false,
                    ipAddress: req.ip,
                    userAgent: req.headers['user-agent'],
                } as any,
            });

            return res.status(404).json({
                success: false,
                message: 'Invalid QR Code. This product might be counterfeit.',
                action: 'Reported location for investigation.',
            });
        }

        // Check if verification is one-time (Dynamic QR suggestion)
        // If status is already VERIFIED, it might be a cloned QR
        let isFake = false;
        let message = 'Product is genuine!';

        if (qrCode.status === 'VERIFIED') {
            isFake = true;
            message = 'Warning: This QR code has already been verified. It might be a copy.';
        }

        // Record the scan
        await prisma.scan.create({
            data: {
                qrCodeId: qrCode.id,
                userId: userId || null,
                latitude: latitude || null,
                longitude: longitude || null,
                status: !isFake,
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'],
            },
        });

        // Mark as verified if it was active
        if (!isFake) {
            await prisma.qRCode.update({
                where: { id: qrCode.id },
                data: { status: 'VERIFIED' },
            });
        }

        res.json({
            success: !isFake,
            message,
            product: {
                name: qrCode.product.name,
                company: qrCode.product.company.name,
                batch: qrCode.product.batchNumber,
                sku: qrCode.product.sku,
            },
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getScanHotspots = async (req: AuthRequest, res: Response) => {
    try {
        // Only Admin can see all hotspots, Companies see theirs
        const companyId = req.user?.companyId;
        const role = req.user?.role;

        const where: any = { status: false }; // Only track invalid/fake scans for hotspots

        if (role === 'COMPANY' && companyId) {
            where.qrCode = { product: { companyId } };
        }

        const scans = await prisma.scan.findMany({
            where,
            select: {
                latitude: true,
                longitude: true,
                createdAt: true,
                status: true,
            },
        });

        res.json(scans);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

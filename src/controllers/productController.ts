import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../utils/prisma';
import { parse } from 'csv-parse/sync';
import { v4 as uuidv4 } from 'uuid';

export const createProduct = async (req: AuthRequest, res: Response) => {
    try {
        const { name, description, sku, batchNumber, quantity } = req.body;
        const companyId = req.user?.companyId;

        console.log(`🚀 Creating product: ${name}, Qty: ${quantity} for Company: ${companyId}`);

        if (!companyId) {
            return res.status(403).json({ message: 'Only company users can create products' });
        }

        const qty = parseInt(quantity || '0');

        // Use nested writes to create everything in one transaction
        const product = await prisma.product.create({
            data: {
                name,
                description,
                sku,
                batchNumber,
                companyId,
                qrCodes: {
                    create: Array.from({ length: qty }).map(() => ({
                        code: uuidv4(),
                        status: 'ACTIVE'
                    }))
                }
            },
            include: {
                qrCodes: true
            }
        });

        console.log(`✅ Product created with ID: ${product.id}. QR codes generated: ${product.qrCodes.length}`);

        res.status(201).json(product);
    } catch (error: any) {
        console.error('❌ Error creating product:', error);
        res.status(500).json({ message: error.message });
    }
};

export const bulkUploadProducts = async (req: AuthRequest, res: Response) => {
    try {
        const companyId = req.user?.companyId;
        if (!companyId) {
            return res.status(403).json({ message: 'Only company users can upload products' });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'Please upload a CSV file' });
        }

        const fileContent = req.file.buffer.toString();
        const records: any[] = parse(fileContent, {
            columns: true,
            skip_empty_lines: true,
        });

        // Create a pending request instead of products
        const request = await prisma.bulkUploadRequest.create({
            data: {
                companyId,
                filename: req.file.originalname,
                data: records as any,
                status: 'PENDING'
            }
        });

        res.status(201).json({
            message: 'Bulk upload request submitted for admin approval',
            requestId: request.id
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getBulkRequests = async (req: AuthRequest, res: Response) => {
    try {
        const { role, companyId } = req.user!;

        const where: any = {};
        if (role === 'COMPANY') {
            where.companyId = companyId;
        }

        const requests = await prisma.bulkUploadRequest.findMany({
            where,
            include: { company: true },
            orderBy: { createdAt: 'desc' }
        });

        res.json(requests);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const handleBulkRequest = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { action, adminNote } = req.body; // action: 'APPROVE' or 'REJECT'

        if (req.user?.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Admin access required' });
        }

        const request = await prisma.bulkUploadRequest.findUnique({
            where: { id: id as string },
        });

        if (!request || request.status !== 'PENDING') {
            return res.status(400).json({ message: 'Invalid or processed request' });
        }

        if (action === 'REJECT') {
            await prisma.bulkUploadRequest.update({
                where: { id: id as string },
                data: { status: 'REJECTED', adminNote }
            });
            return res.json({ message: 'Request rejected' });
        }

        // APPROVE: Create the products and QR codes
        const records = request.data as any[];
        const companyId = request.companyId;

        console.log(`🚀 Processing bulk approval for Request: ${id}. Records: ${records.length}`);

        const createdProducts = [];
        for (const record of records) {
            const quantity = parseInt(record.quantity || '1');

            const product = await prisma.product.create({
                data: {
                    name: record.product_name || record.name,
                    description: record.description,
                    sku: record.sku,
                    batchNumber: record.batch_number || record.batchNumber,
                    companyId,
                    qrCodes: {
                        create: Array.from({ length: quantity }).map(() => ({
                            code: uuidv4(),
                            status: 'ACTIVE'
                        }))
                    }
                },
                include: {
                    qrCodes: true
                }
            });

            console.log(`✅ Bulk Product created: ${product.name} with ${product.qrCodes.length} units.`);
            createdProducts.push(product);
        }

        await prisma.bulkUploadRequest.update({
            where: { id: id as string },
            data: { status: 'APPROVED', adminNote }
        });

        res.json({ message: `Approved! ${createdProducts.length} products created.`, count: createdProducts.length });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getCompanyProducts = async (req: AuthRequest, res: Response) => {
    try {
        const companyId = req.user?.companyId;
        if (!companyId) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const products = await prisma.product.findMany({
            where: { companyId },
            include: { qrCodes: true },
        });

        console.log(`📡 Returning ${products.length} products for Company: ${companyId}`);
        products.forEach(p => console.log(`   - ${p.name}: ${p.qrCodes.length} codes`));

        res.json(products);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCompanyProducts = exports.handleBulkRequest = exports.getBulkRequests = exports.bulkUploadProducts = exports.createProduct = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const sync_1 = require("csv-parse/sync");
const uuid_1 = require("uuid");
const createProduct = async (req, res) => {
    try {
        const { name, description, sku, batchNumber, quantity } = req.body;
        const companyId = req.user?.companyId;
        console.log(`🚀 Creating product: ${name}, Qty: ${quantity} for Company: ${companyId}`);
        if (!companyId) {
            return res.status(403).json({ message: 'Only company users can create products' });
        }
        const qty = parseInt(quantity || '0');
        // Use nested writes to create everything in one transaction
        const product = await prisma_1.default.product.create({
            data: {
                name,
                description,
                sku,
                batchNumber,
                companyId,
                qrCodes: {
                    create: Array.from({ length: qty }).map(() => ({
                        code: (0, uuid_1.v4)(),
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
    }
    catch (error) {
        console.error('❌ Error creating product:', error);
        res.status(500).json({ message: error.message });
    }
};
exports.createProduct = createProduct;
const bulkUploadProducts = async (req, res) => {
    try {
        const companyId = req.user?.companyId;
        if (!companyId) {
            return res.status(403).json({ message: 'Only company users can upload products' });
        }
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload a CSV file' });
        }
        const fileContent = req.file.buffer.toString();
        const records = (0, sync_1.parse)(fileContent, {
            columns: true,
            skip_empty_lines: true,
        });
        // Create a pending request instead of products
        const request = await prisma_1.default.bulkUploadRequest.create({
            data: {
                companyId,
                filename: req.file.originalname,
                data: records,
                status: 'PENDING'
            }
        });
        res.status(201).json({
            message: 'Bulk upload request submitted for admin approval',
            requestId: request.id
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.bulkUploadProducts = bulkUploadProducts;
const getBulkRequests = async (req, res) => {
    try {
        const { role, companyId } = req.user;
        const where = {};
        if (role === 'COMPANY') {
            where.companyId = companyId;
        }
        const requests = await prisma_1.default.bulkUploadRequest.findMany({
            where,
            include: { company: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(requests);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getBulkRequests = getBulkRequests;
const handleBulkRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { action, adminNote } = req.body; // action: 'APPROVE' or 'REJECT'
        if (req.user?.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Admin access required' });
        }
        const request = await prisma_1.default.bulkUploadRequest.findUnique({
            where: { id: id },
        });
        if (!request || request.status !== 'PENDING') {
            return res.status(400).json({ message: 'Invalid or processed request' });
        }
        if (action === 'REJECT') {
            await prisma_1.default.bulkUploadRequest.update({
                where: { id: id },
                data: { status: 'REJECTED', adminNote }
            });
            return res.json({ message: 'Request rejected' });
        }
        // APPROVE: Create the products and QR codes
        const records = request.data;
        const companyId = request.companyId;
        console.log(`🚀 Processing bulk approval for Request: ${id}. Records: ${records.length}`);
        const createdProducts = [];
        for (const record of records) {
            const quantity = parseInt(record.quantity || '1');
            const product = await prisma_1.default.product.create({
                data: {
                    name: record.product_name || record.name,
                    description: record.description,
                    sku: record.sku,
                    batchNumber: record.batch_number || record.batchNumber,
                    companyId,
                    qrCodes: {
                        create: Array.from({ length: quantity }).map(() => ({
                            code: (0, uuid_1.v4)(),
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
        await prisma_1.default.bulkUploadRequest.update({
            where: { id: id },
            data: { status: 'APPROVED', adminNote }
        });
        res.json({ message: `Approved! ${createdProducts.length} products created.`, count: createdProducts.length });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.handleBulkRequest = handleBulkRequest;
const getCompanyProducts = async (req, res) => {
    try {
        const companyId = req.user?.companyId;
        if (!companyId) {
            return res.status(403).json({ message: 'Access denied' });
        }
        const products = await prisma_1.default.product.findMany({
            where: { companyId },
            include: { qrCodes: true },
        });
        console.log(`📡 Returning ${products.length} products for Company: ${companyId}`);
        products.forEach(p => console.log(`   - ${p.name}: ${p.qrCodes.length} codes`));
        res.json(products);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getCompanyProducts = getCompanyProducts;

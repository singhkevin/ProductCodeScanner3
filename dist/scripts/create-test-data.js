"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const client_1 = require("@prisma/client");
const uuid_1 = require("uuid");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🚀 Generating Test Data...');
    try {
        // 1. Create a Test Company
        let company = await prisma.company.findFirst({
            where: { name: 'Test Corp' }
        });
        if (!company) {
            company = await prisma.company.create({
                data: {
                    name: 'Test Corp',
                    description: 'Testing the Product Scanner App',
                },
            });
        }
        console.log(`✅ Company Created: ${company.name}`);
        // 2. Create a Test Product
        const product = await prisma.product.create({
            data: {
                name: 'Premium Headphones',
                description: 'Elite sound quality for testing',
                sku: 'HP-100-TEST',
                batchNumber: 'BATCH-001',
                companyId: company.id,
            },
        });
        console.log(`✅ Product Created: ${product.name}`);
        // 3. Create 3 Active QR Codes
        console.log('\n--- TEST QR CODES (Scan these with your app!) ---');
        for (let i = 1; i <= 3; i++) {
            const code = (0, uuid_1.v4)();
            await prisma.qRCode.create({
                data: {
                    code,
                    productId: product.id,
                    status: 'ACTIVE',
                }
            });
            // Generate a link to a visual QR code for easy scanning from screen
            const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${code}`;
            console.log(`QR #${i}: ${code}`);
            console.log(`🔗 Scan this UI: ${qrImageUrl}\n`);
        }
        console.log('--- TEST DATA GENERATION COMPLETE ---');
        console.log('You can now scan these QR codes using your Mobile App!');
    }
    catch (err) {
        console.error('❌ Error generating test data:', err.message);
    }
    finally {
        await prisma.$disconnect();
    }
}
main();

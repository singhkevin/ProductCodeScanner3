import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🚀 Seeding Mock Fraudulent Scans...');

    try {
        // Find existing company and product
        const company = await prisma.company.findFirst({ where: { name: 'Test Corp' } });
        const product = await prisma.product.findFirst({ where: { companyId: company?.id } });
        const qrCode = await prisma.qRCode.findFirst({ where: { productId: product?.id } });

        if (!company || !product || !qrCode) {
            console.error('❌ Base data missing. Run seed-company and create-test-data first.');
            return;
        }

        const hotspots = [
            { city: 'Delhi', lat: 28.6139, lng: 77.2090 },
            { city: 'Mumbai', lat: 19.0760, lng: 72.8777 },
            { city: 'Bangalore', lat: 12.9716, lng: 77.5946 },
            { city: 'Kolkata', lat: 22.5726, lng: 88.3639 },
            { city: 'Chennai', lat: 13.0827, lng: 80.2707 },
            { city: 'Hyderabad', lat: 17.3850, lng: 78.4867 },
        ];

        for (const spot of hotspots) {
            // Create a fake scan (invalid code) - No qrCodeId
            await prisma.scan.create({
                data: {
                    status: false,
                    latitude: spot.lat + (Math.random() - 0.5) * 0.1,
                    longitude: spot.lng + (Math.random() - 0.5) * 0.1,
                    ipAddress: '1.2.3.4',
                    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)',
                }
            });

            // Create a duplicate scan (cloned code) - With qrCodeId
            await prisma.scan.create({
                data: {
                    qrCodeId: qrCode.id,
                    status: false,
                    latitude: spot.lat + (Math.random() - 0.5) * 0.1,
                    longitude: spot.lng + (Math.random() - 0.5) * 0.1,
                    ipAddress: '5.6.7.8',
                    userAgent: 'Android App',
                }
            });
        }

        console.log('✅ Mock Fraud Data Seeded!');
    } catch (err: any) {
        console.error('❌ Error seeding fraud data:', err.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();

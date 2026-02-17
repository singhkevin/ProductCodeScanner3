import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🚀 Seeding Company User...');

    try {
        // 1. Find or create the company
        let company = await prisma.company.findFirst({
            where: { name: 'Test Corp' }
        });

        if (!company) {
            company = await prisma.company.create({
                data: {
                    name: 'Test Corp',
                    description: 'Testing the Product Scanner App',
                }
            });
            console.log('✅ Created "Test Corp" Company');
        }

        const email = 'company@example.com';
        const password = 'company-password-123';

        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            console.log(`ℹ️ User ${email} already exists.`);
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const companyUser = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name: 'Test Corp Manager',
                role: 'COMPANY',
                companyId: company.id,
            },
        });

        console.log('✅ Company User Created Successfully!');
        console.log('-----------------------------------');
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);
        console.log(`Company: ${company.name}`);
        console.log('-----------------------------------');

    } catch (err: any) {
        console.error('❌ Error seeding company user:', err.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
